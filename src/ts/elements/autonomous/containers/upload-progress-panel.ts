import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
import { getFileSizeTextInReadableUnits } from '@helpers/file-helpers';
import { ImageStep } from '@workers/upload-worker';

export default class UploadProgressPanel extends AutonomousCustomElement {
  static get elementName() { return 'upload-progress-panel'; }

  imageFilenameHeading: HTMLHeadingElement;
  mapFilenameHeading: HTMLHeadElement;

  sourceCanvas: HTMLCanvasElement;
  intermediateCanvas: HTMLCanvasElement;
  finalCanvas: HTMLCanvasElement;

  constructor(imageFilename: string, imageFileSizeInBytes: number, startingMapId: number) {
    super();

    this.imageFilenameHeading = this.getShadowElement('image-filename-heading') as HTMLHeadingElement;
    this.mapFilenameHeading = this.getShadowElement('map-filename-heading') as HTMLHeadingElement;

    this.sourceCanvas = this.getShadowElement('source-canvas') as HTMLCanvasElement;
    this.intermediateCanvas = this.getShadowElement('intermediate-canvas') as HTMLCanvasElement;
    this.finalCanvas = this.getShadowElement('final-canvas') as HTMLCanvasElement;

    const fileSizeText = getFileSizeTextInReadableUnits(imageFileSizeInBytes);
    this.imageFilenameHeading.textContent = `${imageFilename} (${fileSizeText})`;

    // TODO: Multiple map files
    this.mapFilenameHeading.textContent = `map_${startingMapId}.dat`;
  }

  initialize() {

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