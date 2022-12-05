import BaseHover from '@elements/autonomous/hover/base-hover';

export default class ImagePreview extends BaseHover {
  mainCanvas: HTMLCanvasElement;
  largeCanvas: HTMLCanvasElement;

  static get elementName() { return 'image-preview'; }
  static get subdirectory() { return 'hover'; }

  constructor() {
    super();

    this.mainCanvas = this.getShadowElement('main-canvas') as HTMLCanvasElement;
    this.largeCanvas = this.getShadowElement('large-canvas') as HTMLCanvasElement;
  }

  initialize() {

  }
}