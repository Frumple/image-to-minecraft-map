import BaseContainer from '@elements/autonomous/containers/base-container';
import ImagePreview from '@elements/autonomous/containers/image-preview';
import StepArrow from '@elements/autonomous/hover/step-arrow';

import { createDownloadUrlFromData, getFileSizeTextInReadableUnits, getMapFilename } from '@helpers/file-helpers';
import { roundToDecimalPlaces } from '@helpers/number-helpers';

import { Settings } from '@models/settings';

import { UploadStep } from '@workers/upload-worker';

import JSZip from 'jszip';

interface MapFileDownload {
  buffer: ArrayBuffer,
  url: string,
  filename: string,
  fileSizeInBytes: number
}

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

  downloadTitle: HTMLSpanElement;
  downloadButtonContainer: HTMLDivElement;
  downloadAsDatButton: HTMLButtonElement;
  downloadAsZipButton: HTMLButtonElement;
  downloadDatLinks: HTMLDivElement;
  downloadZipLink: HTMLAnchorElement;

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

    this.downloadTitle = this.getShadowElement('download-title') as HTMLSpanElement;
    this.downloadButtonContainer = this.getShadowElement('download-button-container') as HTMLDivElement;
    this.downloadAsDatButton = this.getShadowElement('download-as-dat-button') as HTMLButtonElement;
    this.downloadAsZipButton = this.getShadowElement('download-as-zip-button') as HTMLButtonElement;
    this.downloadDatLinks = this.getShadowElement('download-dat-links') as HTMLDivElement;
    this.downloadZipLink = this.getShadowElement('download-zip-link') as HTMLAnchorElement;

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
    const mapFileDownloads = this.createMapFileDownloads(data);

    // Create a hidden download link for each map .dat file, and
    // create a zip file containing each map .dat file and set its hidden download link
    const zipFile = new JSZip();

    for (const download of mapFileDownloads) {
      const downloadDatLink = document.createElement('a') as HTMLAnchorElement;
      downloadDatLink.href = download.url;
      downloadDatLink.download = download.filename;
      this.downloadDatLinks.append(downloadDatLink);

      zipFile.file(download.filename, download.buffer, { binary: true });
    }

    await zipFile.generateAsync({type: 'blob'}).then((blob) => {
      const url = createDownloadUrlFromData(blob, 'application/octet-stream');
      const startingMapId = this.uploadSettings.mapId;
      const endingMapId = this.uploadSettings.endingMapId;
      const zipFilename = `maps-${startingMapId}-to-${endingMapId}.zip`;

      this.downloadZipLink.href = url;
      this.downloadZipLink.download = zipFilename;
    });

    // Setup "Download as .dat" button to click all of the hidden links
    this.downloadAsDatButton.addEventListener('click', () => {
      for (const link of this.downloadDatLinks.children as HTMLCollectionOf<HTMLAnchorElement>) {
        link.click();
      }
    });

    // Setup "Download as .zip" button to click the zip hidden link
    this.downloadAsZipButton.addEventListener('click', () => {
      this.downloadZipLink.click();
    });

    // Show the download buttons
    this.downloadTitle.textContent = 'Download as:';
    if (this.uploadSettings.hasMultipleMaps) {
      this.downloadAsDatButton.textContent = '.dat files';
    }
    this.downloadButtonContainer.classList.remove('upload-progress-panel__download-button-container_hidden');

    // Start automatic download if enabled
    switch (this.uploadSettings.autoDownload) {
      case 'dat':
        this.downloadAsDatButton.click();
        break;
      case 'zip':
        this.downloadAsZipButton.click();
        break;
    }

    this.progressPercentage = 100;

    const roundTimeElapsedInSeconds = roundToDecimalPlaces(timeElapsed / 1000, 3);
    this.statusHeading.textContent = `Processed ${colorsProcessed} colors in ${roundTimeElapsedInSeconds} seconds.`;

    const mapFileNameText = this.getMapFileNameText();
    const mapFileSizeText = this.getMapFileSizeText(mapFileDownloads);

    this.mapFilenameHeading.textContent = `${mapFileNameText} (${mapFileSizeText})`;
  }

  private createMapFileDownloads(data: ArrayBuffer[][]): MapFileDownload[] {
    const mapFileDownloads: MapFileDownload[] = [];
    let mapId = this.uploadSettings.mapId;

    for (let y = 0; y < this.uploadSettings.numberOfMapsVertical; y++) {
      for (let x = 0; x < this.uploadSettings.numberOfMapsHorizontal; x++) {
        const buffer = data[x][y];
        const download = {
          buffer: buffer,
          url: createDownloadUrlFromData(buffer, 'application/octet-stream'),
          filename: getMapFilename(mapId),
          fileSizeInBytes: buffer.byteLength
        };

        mapFileDownloads.push(download);
        mapId++;
      }
    }

    return mapFileDownloads;
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

    this.downloadTitle.textContent = 'Error';
  }
}