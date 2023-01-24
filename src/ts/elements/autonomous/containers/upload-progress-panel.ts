import BaseContainer from '@elements/autonomous/containers/base-container';
import ImagePreview from '@elements/autonomous/containers/image-preview';
import DownloadBox from '@elements/autonomous/containers/download-box';
import StepArrow from '@elements/autonomous/hover/step-arrow';

import { MapFileDownload, createMapFileDownloads } from '@helpers/download-helpers';
import { getFileSizeTextInReadableUnits, getMapFilename } from '@helpers/file-helpers';
import { roundToDecimalPlaces } from '@helpers/number-helpers';

import { Settings } from '@models/settings';

import { UploadStep } from '@workers/upload-worker';

export default class UploadProgressPanel extends BaseContainer {
  static get elementName() { return 'upload-progress-panel'; }

  uploadSettings: Settings;

  uploadProgressPanel: HTMLDivElement;

  imageFilenameHeading: HTMLHeadingElement;
  statusHeading: HTMLHeadingElement;
  mapFilenameHeading: HTMLHeadingElement;

  sourceImagePreview: ImagePreview;
  intermediateImagePreview: ImagePreview;
  finalImagePreview: ImagePreview;
  downloadBox: DownloadBox;

  preprocessStepArrow: StepArrow;
  reduceColorsStepArrow: StepArrow;
  createFileStepArrow: StepArrow;

  constructor(uploadSettings: Settings, imageFilename: string, imageFileSizeInBytes: number) {
    super();

    this.uploadSettings = uploadSettings;

    this.uploadProgressPanel = this.getShadowElement('upload-progress-panel') as HTMLDivElement;

    this.imageFilenameHeading = this.getShadowElement('image-filename-heading') as HTMLHeadingElement;
    this.statusHeading = this.getShadowElement('status-heading') as HTMLHeadingElement;
    this.mapFilenameHeading = this.getShadowElement('map-filename-heading') as HTMLHeadingElement;

    this.sourceImagePreview = this.getShadowElement('source-image-preview') as ImagePreview;
    this.intermediateImagePreview = this.getShadowElement('intermediate-image-preview') as ImagePreview;
    this.finalImagePreview = this.getShadowElement('final-image-preview') as ImagePreview;
    this.downloadBox = this.getShadowElement('download-box') as DownloadBox;

    this.preprocessStepArrow = this.getShadowElement('preprocess-step-arrow') as StepArrow;
    this.reduceColorsStepArrow = this.getShadowElement('reduce-colors-step-arrow') as StepArrow;
    this.createFileStepArrow = this.getShadowElement('create-file-step-arrow') as StepArrow;

    const fileSizeText = getFileSizeTextInReadableUnits(imageFileSizeInBytes);
    this.imageFilenameHeading.textContent = `${imageFilename} (${fileSizeText})`;

    this.statusHeading.textContent = 'Processing... (0%)';
    this.mapFilenameHeading.textContent = this.getMapFileNameText();

    this.sourceImagePreview.createMapPreviews(uploadSettings.numberOfMapsHorizontal, uploadSettings.numberOfMapsVertical);
    this.intermediateImagePreview.createMapPreviews(uploadSettings.numberOfMapsHorizontal, uploadSettings.numberOfMapsVertical);
    this.finalImagePreview.createMapPreviews(uploadSettings.numberOfMapsHorizontal, uploadSettings.numberOfMapsVertical);

    this.preprocessStepArrow.addSetting(`Resize to`, uploadSettings.resizeDisplayText);
    this.preprocessStepArrow.addSetting(`Resize Quality`, uploadSettings.resizeQualityDisplayText);
    this.preprocessStepArrow.addSetting(`Background`, uploadSettings.backgroundDisplayText);

    this.reduceColorsStepArrow.addSetting(`Color Difference`, uploadSettings.colorDifferenceDisplayText);
    this.reduceColorsStepArrow.addSetting(`Dithering`, uploadSettings.ditheringDisplayText);
    this.reduceColorsStepArrow.addSetting(`Transparency`, uploadSettings.transparency.toString());

    this.createFileStepArrow.addSetting(`Automatic Download`, uploadSettings.autoDownloadDisplayText);
  }

  initialize() {

  }

  async renderImagePreview(uploadStep: UploadStep, bitmap: ImageBitmap) {
    const imagePreview = this.getImagePreview(uploadStep);

    await imagePreview.render(bitmap);
  }

  private getImagePreview(uploadStep: UploadStep) {
    switch (uploadStep) {
      case 'source':
        return this.sourceImagePreview;
      case 'intermediate' :
        return this.intermediateImagePreview;
      case 'final':
        return this.finalImagePreview;
      default:
        throw new Error(`Upload step has no canvas: ${uploadStep}`)
    }
  }

  async completeUpload(data: ArrayBuffer[][], colorsProcessed: number, timeElapsed: number) {
    const mapFileDownloads = createMapFileDownloads(data, this.uploadSettings);

    await this.downloadBox.setupDownloadLinks(mapFileDownloads, this.uploadSettings);

    this.progressPercentage = 100;

    const roundTimeElapsedInSeconds = roundToDecimalPlaces(timeElapsed / 1000, 3);
    this.statusHeading.textContent = `Processed ${colorsProcessed} colors in ${roundTimeElapsedInSeconds} seconds.`;

    const mapFileNameText = this.getMapFileNameText();
    const mapFileSizeText = this.getMapFileSizeText(mapFileDownloads);

    this.mapFilenameHeading.textContent = `${mapFileNameText} (${mapFileSizeText})`;
  }

  private getMapFileNameText(): string {
    const startingMapId = this.uploadSettings.mapId;

    let text = getMapFilename(startingMapId);

    if (this.uploadSettings.hasMultipleMaps) {
      const endingMapId = this.uploadSettings.endingMapId;
      const endingMapIdText = getMapFilename(endingMapId);
      text += ` ➝ ${endingMapIdText}`;
    }

    return text;
  }

  private getMapFileSizeText(mapFileDownloads: MapFileDownload[]): string {
    const totalFileSizeInBytes = mapFileDownloads.reduce((accumulator, current) => accumulator + current.fileSizeInBytes, 0);
    return getFileSizeTextInReadableUnits(totalFileSizeInBytes);
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

    this.statusHeading.classList.add('upload-progress-panel__status-heading_error');
    this.statusHeading.textContent = `Error - ${message}`;

    this.downloadBox.headingText = 'Error';
  }
}