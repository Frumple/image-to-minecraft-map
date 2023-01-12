import BaseContainer from '@elements/autonomous/containers/base-container';
import ImagePreview from '@elements/autonomous/hover/image-preview';
import StepArrow from '@elements/autonomous/hover/step-arrow';

import { getFileSizeTextInReadableUnits, getMapFilename } from '@helpers/file-helpers';
import { roundToDecimalPlaces } from '@helpers/number-helpers';

import * as Settings from '@models/settings';

import { UploadStep } from '@workers/upload-worker';

export default class UploadProgressPanel extends BaseContainer {
  static get elementName() { return 'upload-progress-panel'; }

  uploadProgressPanel: HTMLDivElement;

  imageFilenameHeading: HTMLHeadingElement;
  statusHeading: HTMLHeadingElement;
  mapFilenameHeading: HTMLHeadingElement;

  imagePreviewMap: Map<UploadStep, ImagePreview>;

  downloadFileLink: HTMLAnchorElement;
  downloadFileTextLink: HTMLAnchorElement;

  preprocessStepArrow: StepArrow;
  reduceColorsStepArrow: StepArrow;
  createFileStepArrow: StepArrow;

  startingMapId: number;
  autoDownload: boolean;

  constructor(settings: Settings.Settings, imageFilename: string, imageFileSizeInBytes: number) {
    super();

    this.uploadProgressPanel = this.getShadowElement('upload-progress-panel') as HTMLDivElement;

    this.imageFilenameHeading = this.getShadowElement('image-filename-heading') as HTMLHeadingElement;
    this.statusHeading = this.getShadowElement('status-heading') as HTMLHeadingElement;
    this.mapFilenameHeading = this.getShadowElement('map-filename-heading') as HTMLHeadingElement;

    this.imagePreviewMap = new Map();
    this.imagePreviewMap.set('source', this.getShadowElement('source-image-preview') as ImagePreview);
    this.imagePreviewMap.set('intermediate', this.getShadowElement('intermediate-image-preview') as ImagePreview);
    this.imagePreviewMap.set('final', this.getShadowElement('final-image-preview') as ImagePreview);

    this.downloadFileLink = this.getShadowElement('download-file-link') as HTMLAnchorElement;
    this.downloadFileTextLink = this.getShadowElement('download-file-text-link') as HTMLAnchorElement;

    this.preprocessStepArrow = this.getShadowElement('preprocess-step-arrow') as StepArrow;
    this.reduceColorsStepArrow = this.getShadowElement('reduce-colors-step-arrow') as StepArrow;
    this.createFileStepArrow = this.getShadowElement('create-file-step-arrow') as StepArrow;

    this.startingMapId = settings.mapId;
    this.autoDownload = settings.autoDownload;

    const fileSizeText = getFileSizeTextInReadableUnits(imageFileSizeInBytes);
    this.imageFilenameHeading.textContent = `${imageFilename} (${fileSizeText})`;

    this.statusHeading.textContent = 'Processing... (0%)';

    // TODO: Multiple map files
    this.mapFilenameHeading.textContent = getMapFilename(this.startingMapId);

    this.preprocessStepArrow.addSetting(`Resize to`, settings.resizeDisplayText);
    this.preprocessStepArrow.addSetting(`Resize Quality`, settings.resizeQualityDisplayText);
    this.preprocessStepArrow.addSetting(`Background`, settings.backgroundDisplayText);

    this.reduceColorsStepArrow.addSetting(`Color Difference`, settings.colorDifferenceDisplayText);
    this.reduceColorsStepArrow.addSetting(`Dithering`, settings.ditheringDisplayText);
    this.reduceColorsStepArrow.addSetting(`Transparency`, settings.transparency.toString());

    this.createFileStepArrow.addSetting(`Automatic Download`, settings.autoDownload ? 'Yes' : 'No');
  }

  initialize() {

  }

  async renderImagePreview(uploadStep: UploadStep, bitmap: ImageBitmap) {
    const imagePreview = this.imagePreviewMap.get(uploadStep);

    if (imagePreview === undefined) {
      throw new Error(`Upload step has no canvas: ${uploadStep}`);
    }

    imagePreview.render(bitmap);
  }

  completeUpload(downloadUrl: string, mapFileSizeInBytes: number, timeElapsed: number, colorsProcessed: number) {
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
    this.statusHeading.textContent = `Processed ${colorsProcessed} colors in ${roundTimeElapsedInSeconds} seconds.`;
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