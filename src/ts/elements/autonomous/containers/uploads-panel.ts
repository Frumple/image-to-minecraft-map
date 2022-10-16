import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
import UploadProgressPanel from '@elements/autonomous/containers/upload-progress-panel';

import { readAsDataUrlAsync } from '@helpers/file-helpers';
import CurrentContext from '@models/current-context';
import Upload from '@models/upload';

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

    for (const file of files) {
      const image = await readAsDataUrlAsync(file);

      const uploadProgressPanel = new UploadProgressPanel(image);
      this.uploadsContainer.appendChild(uploadProgressPanel);
      await uploadProgressPanel.drawSourceImage();

      const settings = CurrentContext.settings.clone();
      const upload = new Upload(settings, image, uploadProgressPanel);

      upload.processImage();
    }
  }
}