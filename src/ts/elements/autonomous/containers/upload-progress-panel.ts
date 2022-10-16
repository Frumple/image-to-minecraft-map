import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
import { UploadedFile } from '@helpers/file-helpers';
import { drawImageDataUrlToCanvas } from '@helpers/image-helpers';

export default class UploadProgressPanel extends AutonomousCustomElement {
  static get elementName() { return 'upload-progress-panel'; }

  uploadedFile: UploadedFile;

  sourceImageFilenameHeading: HTMLHeadingElement;

  sourceCanvas: HTMLCanvasElement;
  intermediateCanvas: HTMLCanvasElement;
  finalCanvas: HTMLCanvasElement;

  constructor(uploadedFile: UploadedFile) {
    super();

    this.uploadedFile = uploadedFile;

    this.sourceImageFilenameHeading = this.getShadowElement('source-image-filename-heading') as HTMLHeadingElement;

    this.sourceCanvas = this.getShadowElement('source-canvas') as HTMLCanvasElement;
    this.intermediateCanvas = this.getShadowElement('intermediate-canvas') as HTMLCanvasElement;
    this.finalCanvas = this.getShadowElement('final-canvas') as HTMLCanvasElement;

    this.sourceImageFilename = uploadedFile.name;
  }

  initialize() {

  }

  async drawSourceImage() {
    await drawImageDataUrlToCanvas(
      this.uploadedFile.data,
      this.sourceCanvas,
      'fit'
    );
  }

  set sourceImageFilename(filename: string) {
    this.sourceImageFilenameHeading.textContent = filename;
  }

  get sourceImageFilename(): string {
    return this.sourceImageFilenameHeading.textContent as string;
  }
}