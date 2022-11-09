import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';

import { getFileSizeTextInReadableUnits, getMapFilename } from '@helpers/file-helpers';

import { UploadStep } from '@workers/upload-worker';

export default class UploadProgressPanel extends AutonomousCustomElement {
  static get elementName() { return 'upload-progress-panel'; }

  uploadProgressPanel: HTMLDivElement;

  imageFilenameHeading: HTMLHeadingElement;
  errorHeading: HTMLHeadingElement;
  mapFilenameHeading: HTMLHeadElement;

  canvasMap: Map<UploadStep, HTMLCanvasElement>;

  downloadFileLink: HTMLAnchorElement;
  downloadFileTextLink: HTMLAnchorElement;

  startingMapId: number;
  autoDownload: boolean;

  constructor(imageFilename: string, imageFileSizeInBytes: number, startingMapId: number, autoDownload: boolean) {
    super();

    this.uploadProgressPanel = this.getShadowElement('upload-progress-panel') as HTMLDivElement;

    this.imageFilenameHeading = this.getShadowElement('image-filename-heading') as HTMLHeadingElement;
    this.errorHeading = this.getShadowElement('error-heading') as HTMLHeadingElement;
    this.mapFilenameHeading = this.getShadowElement('map-filename-heading') as HTMLHeadingElement;

    this.canvasMap = new Map();
    this.canvasMap.set('source', this.getShadowElement('source-canvas') as HTMLCanvasElement);
    this.canvasMap.set('intermediate', this.getShadowElement('intermediate-canvas') as HTMLCanvasElement);
    this.canvasMap.set('final', this.getShadowElement('final-canvas') as HTMLCanvasElement);

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

  renderCanvas(uploadStep: UploadStep, bitmap: ImageBitmap) {
    const canvas = this.canvasMap.get(uploadStep);

    if (canvas === undefined) {
      throw new Error(`Upload step has no canvas: ${uploadStep}`);
    }
    const context = canvas.getContext('bitmaprenderer');
    context?.transferFromImageBitmap(bitmap);
  }

  completeUpload(downloadUrl: string) {
    this.downloadUrl = downloadUrl;
    this.progressPercentage = 100;
  }

  private set downloadUrl(url: string) {
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

  set progressPercentage(percent: number) {
    if (percent < 0 || percent > 100) {
      throw new Error('Percent must be between 0 or 100.');
    }

    const progressColor = percent === 100 ? '#bbffbb' : 'paleturquoise';
    const backgroundColor = 'lightskyblue';
    const linearGradient = `linear-gradient(
      to right,
      ${progressColor} 0% ${percent}%,
      ${backgroundColor} ${percent}% 100%)`;

    this.uploadProgressPanel.style.background = linearGradient;
  }

  failUpload(message: string) {
    this.uploadProgressPanel.style.background = 'lightpink';
    this.downloadFileLink.textContent = 'close';
    this.errorHeading.style.display = 'block';
    this.errorHeading.textContent = `Error - ${message}`;
  }
}