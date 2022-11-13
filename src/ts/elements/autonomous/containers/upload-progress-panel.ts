import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
import { addStringToListElement } from '@helpers/element-helpers';

import { fetchBlob, getFileSizeTextInReadableUnits, getMapFilename } from '@helpers/file-helpers';
import { drawImageToCanvas } from '@helpers/image-helpers';
import { roundToDecimalPlaces } from '@helpers/number-helpers';

import * as Settings from '@models/settings';

import { UploadStep } from '@workers/upload-worker';

export default class UploadProgressPanel extends AutonomousCustomElement {
  static get elementName() { return 'upload-progress-panel'; }

  uploadProgressPanel: HTMLDivElement;

  imageFilenameHeading: HTMLHeadingElement;
  statusHeading: HTMLHeadingElement;
  mapFilenameHeading: HTMLHeadElement;

  canvasMap: Map<UploadStep, HTMLCanvasElement>;

  downloadFileLink: HTMLAnchorElement;
  downloadFileTextLink: HTMLAnchorElement;

  resizeSettingsList: HTMLUListElement;
  reduceColorSettingsList: HTMLUListElement;
  createFileSettingsList: HTMLUListElement;

  startingMapId: number;
  autoDownload: boolean;

  constructor(settings: Settings.Settings, imageFilename: string, imageFileSizeInBytes: number) {
    super();

    this.uploadProgressPanel = this.getShadowElement('upload-progress-panel') as HTMLDivElement;

    this.imageFilenameHeading = this.getShadowElement('image-filename-heading') as HTMLHeadingElement;
    this.statusHeading = this.getShadowElement('status-heading') as HTMLHeadingElement;
    this.mapFilenameHeading = this.getShadowElement('map-filename-heading') as HTMLHeadingElement;

    this.canvasMap = new Map();
    this.canvasMap.set('source', this.getShadowElement('source-canvas') as HTMLCanvasElement);
    this.canvasMap.set('intermediate', this.getShadowElement('intermediate-canvas') as HTMLCanvasElement);
    this.canvasMap.set('final', this.getShadowElement('final-canvas') as HTMLCanvasElement);

    this.downloadFileLink = this.getShadowElement('download-file-link') as HTMLAnchorElement;
    this.downloadFileTextLink = this.getShadowElement('download-file-text-link') as HTMLAnchorElement;

    this.resizeSettingsList = this.getShadowElement('resize-settings-list') as HTMLUListElement;
    this.reduceColorSettingsList = this.getShadowElement('reduce-colors-settings-list') as HTMLUListElement;
    this.createFileSettingsList = this.getShadowElement('create-file-settings-list') as HTMLUListElement;

    this.startingMapId = settings.mapId;
    this.autoDownload = settings.autoDownload;

    const fileSizeText = getFileSizeTextInReadableUnits(imageFileSizeInBytes);
    this.imageFilenameHeading.textContent = `${imageFilename} (${fileSizeText})`;

    this.statusHeading.textContent = 'Processing... (0%)';


    // TODO: Multiple map files
    this.mapFilenameHeading.textContent = getMapFilename(this.startingMapId);

    addStringToListElement(this.resizeSettingsList, `Resize to: ${settings.resizeDisplayText}`);
    addStringToListElement(this.resizeSettingsList, `Quality: ${settings.resizeQualityDisplayText}`);
    addStringToListElement(this.resizeSettingsList, `Background: ${settings.backgroundDisplayText}`);

    addStringToListElement(this.reduceColorSettingsList, `Color Diff: ${settings.colorDifferenceDisplayText}`);
    addStringToListElement(this.reduceColorSettingsList, `Dither: ${settings.ditheringDisplayText}`);
    addStringToListElement(this.reduceColorSettingsList, `Transparency: ${settings.transparency}`);

    addStringToListElement(this.createFileSettingsList, `Auto-download: ${settings.autoDownload ? 'Yes' : 'No'}`);
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

  completeUpload(downloadUrl: string, mapFileSizeInBytes: number, timeElapsed: number) {
    const mapFilename = getMapFilename(this.startingMapId);
    const fileSizeText = getFileSizeTextInReadableUnits(mapFileSizeInBytes);

    this.mapFilenameHeading.textContent = `${mapFilename} (${fileSizeText})`;

    this.downloadFileLink.href = downloadUrl;
    this.downloadFileLink.download = mapFilename;
    this.downloadFileLink.textContent = 'task';

    this.downloadFileTextLink.href = downloadUrl;
    this.downloadFileTextLink.download = mapFilename;

    if (this.autoDownload) {
      this.downloadFileTextLink.click();
    }

    this.progressPercentage = 100;

    const roundTimeElapsedInSeconds = roundToDecimalPlaces(timeElapsed / 1000, 3);
    this.statusHeading.textContent = `Processing completed in ${roundTimeElapsedInSeconds} seconds.`;
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

    this.statusHeading.textContent = `Processing... (${percent}%)`;
  }

  failUpload(message: string) {
    this.uploadProgressPanel.classList.add('upload-progress-panel_error');
    this.downloadFileLink.textContent = 'close';

    this.statusHeading.classList.add('upload-progress-panel__status-heading_error');
    this.statusHeading.textContent = `Error - ${message}`;
  }
}