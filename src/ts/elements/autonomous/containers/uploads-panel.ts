import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
import UploadProgressPanel from '@elements/autonomous/containers/upload-progress-panel';
import { downloadDataAsFile } from '@helpers/file-helpers';

import CurrentContext from '@models/current-context';
import * as Settings from '@models/settings';

import { UploadWorkerIncomingMessageParameters, UploadWorkerOutgoingMessageParameters } from '@workers/upload-worker';

const dragEnterClass = 'uploads-panel__file-upload-drop-zone_drag-enter';

export default class UploadsPanel extends AutonomousCustomElement {
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

    const files = event.dataTransfer?.files;

    if (files) {
      this.fileUploadDropZone.classList.remove(dragEnterClass);
      this.uploadFiles(files);
    } else {
      throw new Error('No file data found.');
    }
  }

  async uploadFiles(fileList: FileList) {
    const files = Array.from(fileList);
    const settings = CurrentContext.settings;

    for (const file of files) {
      await this.uploadFile(settings, file);
      settings.mapId++;
    }

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

  async uploadFile(settings: Settings.Settings, file: File) {
    const mapId = settings.mapId;

    // Create and show the UI panel
    const uploadProgressPanel = new UploadProgressPanel(file.name, file.size, mapId);
    this.uploadsContainer.appendChild(uploadProgressPanel);

    // Setup a web worker to process the image in the background
    const worker = new Worker(
      new URL('/src/ts/workers/upload-worker.ts', import.meta.url),
      {type: 'module'}
    );

    // Listen for messages from the worker to render images and update the UI panel
    worker.addEventListener('message', (event: MessageEvent) => {
      const parameters: UploadWorkerOutgoingMessageParameters = event.data;

      if (parameters.step === 'download') {
        // TODO: Create a stable download link in the upload progress panel and make it a settings option to download the file automatically or not
        downloadDataAsFile(parameters.data, 'application/octet-stream', `map_${mapId}.dat`);
      } else {
        uploadProgressPanel.renderCanvas(parameters.step, parameters.data as ImageBitmap);
      }
    });

    // Send a message to the worker to start processing
    const messageData: UploadWorkerIncomingMessageParameters = {
      settings: settings,
      file: file
    };
    // TODO: Try to send the file data as a transferable array buffer and measure processing time and memory usage.
    worker.postMessage(messageData);
  }
}