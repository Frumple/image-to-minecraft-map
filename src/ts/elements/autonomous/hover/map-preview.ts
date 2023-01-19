import BaseHover from '@elements/autonomous/hover/base-hover';

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

  async drawItemFrame(imageBlob: Blob) {
    await drawAutoResizedImageToCanvas(
      imageBlob,
      this.mainCanvas,
      'fit',
      'pixelated');

    await drawAutoResizedImageToCanvas(
      imageBlob,
      this.largeCanvas,
      'fit',
      'pixelated');
  }

  render(bitmap: ImageBitmap) {
    drawImageToCanvas(
      bitmap,
      this.mainCanvas);

    drawImageToCanvas(
      bitmap,
      this.largeCanvas);
  }
}