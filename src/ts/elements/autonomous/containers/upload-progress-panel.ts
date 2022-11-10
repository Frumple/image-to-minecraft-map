import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';

import { fetchBlob, getFileSizeTextInReadableUnits, getMapFilename } from '@helpers/file-helpers';
import { drawImageToCanvas } from '@helpers/image-helpers';

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

  async drawItemFrameToCanvasses() {
    // Create a Parcel URL dependency to the item frame image
    const imageUrl = new URL(
      '/images/item_frame.png',
      import.meta.url
    );

    const imageBlob = await fetchBlob(imageUrl);

    for (const canvas of this.canvasMap.values()) {
      await drawImageToCanvas(
        imageBlob,
        canvas,
        'fit',
        'pixelated');
    }
  }

  async renderCanvas(uploadStep: UploadStep, bitmap: ImageBitmap) {
    const canvas = this.canvasMap.get(uploadStep);

    if (canvas === undefined) {
      throw new Error(`Upload step has no canvas: ${uploadStep}`);
    }

    await drawImageToCanvas(
      bitmap,
      canvas,
      'fit',
      'high');
  }

  completeUpload(downloadUrl: string, mapFileSizeInBytes: number) {
    const mapFilename = getMapFilename(this.startingMapId);
    const fileSizeText = getFileSizeTextInReadableUnits(mapFileSizeInBytes);

    this.mapFilenameHeading.textContent = `${mapFilename} (${fileSizeText})`;

    this.downloadFileLink.href = downloadUrl;
    this.downloadFileLink.download = mapFilename;
    this.downloadFileLink.textContent = 'task';
    this.downloadFileLink.style.color = 'black';

    this.downloadFileTextLink.href = downloadUrl;
    this.downloadFileTextLink.download = mapFilename;

    if (this.autoDownload) {
      this.downloadFileTextLink.click();
    }

    this.progressPercentage = 100;
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