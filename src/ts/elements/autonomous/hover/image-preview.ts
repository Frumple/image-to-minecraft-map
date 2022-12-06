import BaseHover from '@elements/autonomous/hover/base-hover';

import { drawImageToCanvas } from '@helpers/image-helpers';

export default class ImagePreview extends BaseHover {
  mainCanvas: HTMLCanvasElement;
  largeCanvas: HTMLCanvasElement;

  static get elementName() { return 'image-preview'; }

  constructor() {
    super();

    this.mainCanvas = this.getShadowElement('main-canvas') as HTMLCanvasElement;
    this.largeCanvas = this.getShadowElement('large-canvas') as HTMLCanvasElement;
  }

  initialize() {

  }

  async drawItemFrame(imageBlob: Blob) {
    await drawImageToCanvas(
      imageBlob,
      this.mainCanvas,
      'fit',
      'pixelated');

    await drawImageToCanvas(
      imageBlob,
      this.largeCanvas,
      'fit',
      'pixelated');
  }

  async render(bitmap: ImageBitmap) {
    await drawImageToCanvas(
      bitmap,
      this.mainCanvas);

    await drawImageToCanvas(
      bitmap,
      this.largeCanvas);
  }
}