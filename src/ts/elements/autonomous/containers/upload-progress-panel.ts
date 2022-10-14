import AutonomousCustomElement from "@elements/autonomous/autonomous-custom-element";
import { ImageFromFile } from "@helpers/file-helpers";

export default class UploadProgressPanel extends AutonomousCustomElement {
  static get elementName() { return 'upload-progress-panel'; }

  filenameHeading: HTMLHeadingElement;

  originalCanvas: HTMLCanvasElement;
  originalCanvasContext: CanvasRenderingContext2D;

  constructor(imageFromFile: ImageFromFile) {
    super();

    this.filenameHeading = this.getShadowElement('filename-heading') as HTMLHeadingElement;
    this.filenameHeading.textContent = imageFromFile.name;

    this.originalCanvas = this.getShadowElement('original-canvas') as HTMLCanvasElement;
    this.originalCanvasContext = this.originalCanvas.getContext('2d') as CanvasRenderingContext2D;

    const image = new Image();
    image.addEventListener('load', () => {
      this.originalCanvasContext.drawImage(image, 0, 0);
    })
    image.src = imageFromFile.data;
  }

  initialize() {

  }
}