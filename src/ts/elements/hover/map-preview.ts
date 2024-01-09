import BaseHover from '@elements/hover/base-hover';

import { drawAutoResizedImageToCanvas, drawImageToCanvas } from '@helpers/image-helpers';

export default class MapPreview extends BaseHover {
  mainCanvas: HTMLCanvasElement;
  largeCanvas: HTMLCanvasElement;

  static get elementName() { return 'map-preview'; }

  constructor() {
    super();

    this.mainCanvas = this.getShadowElement('main-canvas') as HTMLCanvasElement;
    this.largeCanvas = this.getShadowElement('large-canvas') as HTMLCanvasElement;
  }

  initialize() {

  }

  async drawItemFrame(imageBlob: Blob): Promise<void> {
    const bitmap = await createImageBitmap(imageBlob);

    await drawAutoResizedImageToCanvas(
      bitmap,
      this.mainCanvas,
      'fit',
      'pixelated');

    await drawAutoResizedImageToCanvas(
      bitmap,
      this.largeCanvas,
      'fit',
      'pixelated');
  }

  render(bitmap: ImageBitmap): void {
    drawImageToCanvas(
      bitmap,
      this.mainCanvas);

    drawImageToCanvas(
      bitmap,
      this.largeCanvas);
  }
}