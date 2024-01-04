import BaseContainer from '@elements/autonomous/containers/base-container';
import UploadProgressPanel from '@elements/autonomous/containers/upload-progress-panel';

import LocalStorageProxy from '@helpers/local-storage-proxy';
import { loadImageFromBlob, imageToBuffer } from '@helpers/image-helpers';

import CurrentContext from '@models/current-context';
import { Settings } from '@models/settings';

import { UploadWorkerIncomingMessage, UploadWorkerOutgoingMessage } from '@workers/upload-worker';

const dragEnterClass = 'uploads-panel__file-upload-drop-zone_drag-enter';

export default class UploadsPanel extends BaseContainer {
  static get elementName() { return 'uploads-panel'; }

  fileInput: HTMLInputElement;
  uploadsContainer: HTMLDivElement;
  chooseFilesButton: HTMLButtonElement;
  fileUploadDropZone: HTMLDivElement;

  // This counter is needed to prevent dragleave events from removing CSS when dragging over child elements in the drop zone.
  dragEnterCounter = 0;

  constructor() {
    super();

    this.fileInput = this.getShadowElement('file-input') as HTMLInputElement;
    this.uploadsContainer = this.getShadowElement('uploads-container') as HTMLDivElement;
    this.chooseFilesButton = this.getShadowElement('choose-files-button') as HTMLButtonElement;
    this.fileUploadDropZone = this.getShadowElement('file-upload-drop-zone') as HTMLDivElement;
  }

  initialize() {
    this.fileInput.addEventListener('change', this.onFileSelected);
    this.chooseFilesButton.addEventListener('click', this.onClickChooseFileButton);
    this.fileUploadDropZone.addEventListener('dragenter', this.onFileDragEnter);
    this.fileUploadDropZone.addEventListener('dragleave', this.onFileDragLeave);
    this.fileUploadDropZone.addEventListener('dragover', this.onFileDragOver);
    this.fileUploadDropZone.addEventListener('drop', this.onFileDropped);
  }

  onClickChooseFileButton = (event: Event) => {
    event.preventDefault();

    this.fileInput.click();
  }

  onFileSelected = () => {
    const files = this.fileInput.files;
    if (files === null) {
      throw new Error('No file selected.');
    }
    this.uploadFiles(files);

    // Be sure to clear the file input so that the same file(s) can be uploaded again
    this.fileInput.value = '';
  }

  onFileDragEnter = () => {
    this.dragEnterCounter++;
    this.fileUploadDropZone.classList.add(dragEnterClass);
  }

  onFileDragLeave = () => {
    this.dragEnterCounter--;
    if (this.dragEnterCounter === 0) {
      this.fileUploadDropZone.classList.remove(dragEnterClass);
    }
  }

  onFileDragOver = (event: DragEvent) => {
    // Prevent the browser's default behaviour of opening the file when dragging the file over the drop zone.
    event.preventDefault();
  }

  onFileDropped = (event: DragEvent) => {
    event.preventDefault();

    this.dragEnterCounter = 0;
    this.fileUploadDropZone.classList.remove(dragEnterClass);

    const files = event.dataTransfer?.files;

    if (files) {
      this.uploadFiles(files);
    } else {
      throw new Error('No file data found.');
    }
  }

  async uploadFiles(fileList: FileList): Promise<void> {
    const files = Array.from(fileList);
    const settings = CurrentContext.settings;

    // TODO: Encapsulate all actions associated with incrementing the next map id into the Settings class

    for (const file of files) {
      await this.uploadFile(settings, file);

      const numberOfMapsToIncrement = settings.numberOfMapsHorizontal * settings.numberOfMapsVertical;
      settings.mapId += numberOfMapsToIncrement;
    }

    LocalStorageProxy.saveSettings(settings);

    // Fire event so that the settings panel can update the next map id
    const mapIdUpdatedEvent = new CustomEvent('mapIdUpdated', {
      bubbles: true,
      composed: true,
      detail: {
        mapId: settings.mapId
      }
    });
    this.dispatchEvent(mapIdUpdatedEvent);
  }

  async uploadFile(settings: Settings, file: File): Promise<void> {
    // Create and show the UI panel
    const uploadSettings = settings.clone();
    const uploadProgressPanel = new UploadProgressPanel(uploadSettings, file.name, file.size);
    this.uploadsContainer.appendChild(uploadProgressPanel);

    try {
      // Premptively fail the upload if the file is an invalid type
      const validFileTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!validFileTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}`);
      }

      // Setup a web worker to process the image in the background
      const worker = new Worker(
        new URL('/src/ts/workers/upload-worker.ts', import.meta.url),
        {type: 'module'}
      );

      // Listen for messages from the worker to render images and update the UI panel
      worker.addEventListener('message', async (event: MessageEvent) => {
        const message: UploadWorkerOutgoingMessage = event.data;

        switch (message.type) {
          case 'progress':
            uploadProgressPanel.progressPercentage = message.percent;
            break;

          case 'source':
          case 'intermediate':
          case 'final':
            await uploadProgressPanel.renderImagePreview(message.type, message.bitmap);
            break;

          case 'download':
            await uploadProgressPanel.completeUpload(message.data, message.colorsProcessed, message.timeElapsed);
            break;

          case 'error':
            uploadProgressPanel.failUpload(message.errorMessage);
            break;
        }
      });

      /*
        Image files can be drawn on to a canvas in two ways:

        #1. Blob/File => createImageBitmap(blob) => ImageBitmap
          This can be run in a worker context, but does not work in the following conditions:
            - SVG files do not work as no browsers currently support SVG processing using createImageBitmap().
              - Chromium bug from 2016: https://bugs.chromium.org/p/chromium/issues/detail?id=606319
            - Safari does not work because it does not support transferable streams, which is needed for this method.
              - Webkit bug from 2020: https://bugs.webkit.org/show_bug.cgi?id=215485

        #2. Blob/File => URL.createObjectURL(blob) => URL => Create an HTMLImageElement and set the src to the URL
          This cannot be run in a worker context, but works on most browsers.

        Therefore, in most circumstances we will use method #1 where the file data stream is sent to the worker, and
        then the worker calls createImageBitmap() on that data.

        Otherwise, if the uploaded file is an SVG or if we are on Safari, we will use method #2 to create the image
        first and then send the image buffer to the worker.
      */

      // If file is SVG, immediately fall back to method #2
      let fallbackToObjectURL = file.type === 'image/svg+xml';
      let message: UploadWorkerIncomingMessage;

      // Attempt to use method #1 first
      if (! fallbackToObjectURL) {
        const stream = file.stream();

        message = {
          type: 'file',
          settings: settings,
          stream: stream,
        }

        try {
          worker.postMessage(message, [stream]);
        } catch {
          // If the stream is not transferable, fall back to method #2
          fallbackToObjectURL = true;
        }
      }

      // Use method #2 if necessary
      if (fallbackToObjectURL) {
        const image = await loadImageFromBlob(file);
        const buffer = imageToBuffer(image);

        message = {
          type: 'image',
          settings: settings,
          buffer: buffer,
          width: image.width,
          height: image.height
        }

        worker.postMessage(message, [buffer]);
      }
    } catch (error) {

      // TODO: Catch other types of errors and exceptions here
      if (error instanceof Error) {
        uploadProgressPanel.failUpload(error.message);
      } else {
        throw error;
      }

    }
  }
}