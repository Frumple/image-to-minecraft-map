import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
import { UploadedImage } from '@helpers/file-helpers';
import { drawScaledImageToCanvas } from '@helpers/image-helpers';

export default class UploadProgressPanel extends AutonomousCustomElement {
  static get elementName() { return 'upload-progress-panel'; }

  sourceImageFilenameHeading: HTMLHeadingElement;

  sourceCanvas: HTMLCanvasElement;
  sourceCanvasContext: CanvasRenderingContext2D;

  constructor(uploadedImage: UploadedImage) {
    super();

    this.sourceImageFilenameHeading = this.getShadowElement('source-image-filename-heading') as HTMLHeadingElement;
    this.sourceCanvas = this.getShadowElement('source-canvas') as HTMLCanvasElement;
    this.sourceCanvasContext = this.sourceCanvas.getContext('2d') as CanvasRenderingContext2D;

    this.sourceImageFilename = uploadedImage.name;

    const image = new Image();
    image.addEventListener('load', () => {
      drawScaledImageToCanvas(image, this.sourceCanvas, 'Fit');
    })
    image.src = uploadedImage.data;
  }

  initialize() {

  }

  set sourceImageFilename(filename: string) {
    this.sourceImageFilenameHeading.textContent = filename;
  }

  get sourceImageFilename(): string {
    return this.sourceImageFilenameHeading.textContent as string;
  }
}