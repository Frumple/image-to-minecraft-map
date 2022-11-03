import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';

import { getFileSizeTextInReadableUnits, getMapFilename } from '@helpers/file-helpers';

import { UploadStep } from '@workers/upload-worker';

export default class UploadProgressPanel extends AutonomousCustomElement {
  static get elementName() { return 'upload-progress-panel'; }

  imageFilenameHeading: HTMLHeadingElement;
  mapFilenameHeading: HTMLHeadElement;

  sourceCanvas: HTMLCanvasElement;
  intermediateCanvas: HTMLCanvasElement;
  finalCanvas: HTMLCanvasElement;

  downloadFileLink: HTMLAnchorElement;
  downloadFileTextLink: HTMLAnchorElement;

  startingMapId: number;
  autoDownload: boolean;

  constructor(imageFilename: string, imageFileSizeInBytes: number, startingMapId: number, autoDownload: boolean) {
    super();

    this.imageFilenameHeading = this.getShadowElement('image-filename-heading') as HTMLHeadingElement;
    this.mapFilenameHeading = this.getShadowElement('map-filename-heading') as HTMLHeadingElement;

    this.sourceCanvas = this.getShadowElement('source-canvas') as HTMLCanvasElement;
    this.intermediateCanvas = this.getShadowElement('intermediate-canvas') as HTMLCanvasElement;
    this.finalCanvas = this.getShadowElement('final-canvas') as HTMLCanvasElement;

    this.downloadFileLink = this.getShadowElement('download-file-link') as HTMLAnchorElement;
    this.downloadFileTextLink = this.getShadowElement('download-file-text-link') as HTMLAnchorElement;

    const fileSizeText = getFileSizeTextInReadableUnits(imageFileSizeInBytes);
    this.imageFilenameHeading.textContent = `${imageFilename} (${fileSizeText})`;

    // TODO: Multiple map files
    this.mapFilenameHeading.textContent = getMapFilename(startingMapId);

    this.startingMapId = startingMapId;
    this.autoDownload = autoDownload;
  }

  initialize() {

  }

  set downloadUrl(url: string) {
     const mapFilename = getMapFilename(this.startingMapId);

     this.downloadFileLink.href = url;
     this.downloadFileLink.download = mapFilename;
     this.downloadFileLink.textContent = 'task';
     this.downloadFileLink.style.color = 'black';

     this.downloadFileTextLink.href = url;
     this.downloadFileTextLink.download = mapFilename;

     if (this.autoDownload) {
      this.downloadFileTextLink.click();
     }
  }

  renderCanvas(uploadStep: UploadStep, bitmap: ImageBitmap) {
    const canvas = this.getCanvas(uploadStep);
    const context = canvas.getContext('bitmaprenderer');
    context?.transferFromImageBitmap(bitmap);
  }

  private getCanvas(uploadStep: UploadStep) {
    switch (uploadStep) {
      case 'source': return this.sourceCanvas;
      case 'intermediate': return this.intermediateCanvas;
      case 'final': return this.finalCanvas;
      default: throw new Error(`Unknown upload step: ${uploadStep}`)
    }
  }
}