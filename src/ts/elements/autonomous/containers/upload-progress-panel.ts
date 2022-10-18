import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
import { ImageStep } from '@workers/upload-worker';

export default class UploadProgressPanel extends AutonomousCustomElement {
  static get elementName() { return 'upload-progress-panel'; }

  sourceImageFilenameHeading: HTMLHeadingElement;

  sourceCanvas: HTMLCanvasElement;
  intermediateCanvas: HTMLCanvasElement;
  finalCanvas: HTMLCanvasElement;

  constructor(sourceImageFilename: string) {
    super();

    this.sourceImageFilenameHeading = this.getShadowElement('source-image-filename-heading') as HTMLHeadingElement;

    this.sourceCanvas = this.getShadowElement('source-canvas') as HTMLCanvasElement;
    this.intermediateCanvas = this.getShadowElement('intermediate-canvas') as HTMLCanvasElement;
    this.finalCanvas = this.getShadowElement('final-canvas') as HTMLCanvasElement;

    this.sourceImageFilename = sourceImageFilename;
  }

  initialize() {

  }

  set sourceImageFilename(filename: string) {
    this.sourceImageFilenameHeading.textContent = filename;
  }

  get sourceImageFilename(): string {
    return this.sourceImageFilenameHeading.textContent as string;
  }

  renderCanvas(imageStep: ImageStep, bitmap: ImageBitmap) {
    const canvas = this.getCanvas(imageStep);
    const context = canvas.getContext('bitmaprenderer');
    context?.transferFromImageBitmap(bitmap);
  }

  private getCanvas(imageStep: ImageStep) {
    switch (imageStep) {
      case 'source': return this.sourceCanvas;
      case 'intermediate': return this.intermediateCanvas;
      case 'final': return this.finalCanvas;
      default: throw new Error(`Unknown image step: ${imageStep}`)
    }
  }
}