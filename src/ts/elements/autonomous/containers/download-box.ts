import BaseContainer from '@elements/autonomous/containers/base-container';

import { MapFileDownload } from '@helpers/download-helpers';
import { createDownloadUrlFromData } from '@helpers/file-helpers';

import { Settings } from '@models/settings';

import JSZip from 'jszip';

export default class DownloadBox extends BaseContainer {
  static get elementName() { return 'download-box'; }

  downloadHeading: HTMLHeadingElement;
  downloadButtonContainer: HTMLDivElement;
  downloadAsDatButton: HTMLButtonElement;
  downloadAsZipButton: HTMLButtonElement;
  downloadDatLinks: HTMLDivElement;
  downloadZipLink: HTMLAnchorElement;

  constructor() {
    super();

    this.downloadHeading = this.getShadowElement('download-heading') as HTMLHeadingElement;
    this.downloadButtonContainer = this.getShadowElement('download-button-container') as HTMLDivElement;
    this.downloadAsDatButton = this.getShadowElement('download-as-dat-button') as HTMLButtonElement;
    this.downloadAsZipButton = this.getShadowElement('download-as-zip-button') as HTMLButtonElement;
    this.downloadDatLinks = this.getShadowElement('download-dat-links') as HTMLDivElement;
    this.downloadZipLink = this.getShadowElement('download-zip-link') as HTMLAnchorElement;
  }

  initialize() {

  }

  set headingText(text: string | null) {
    this.downloadHeading.textContent = text;
  }

  get headingText(): string | null{
    return this.downloadHeading.textContent;
  }

  async setupDownloadLinks(mapFileDownloads: MapFileDownload[], settings: Settings) {
    this.createHiddenDownloadDatLinks(mapFileDownloads);
    await this.createHiddenDownloadZipLink(mapFileDownloads, settings);

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
    this.headingText = 'Download as:';
    if (settings.hasMultipleMaps) {
      this.downloadAsDatButton.textContent = '.dat files';
    }
    this.downloadButtonContainer.classList.remove('download-box__download-button-container_hidden');

    // Start automatic download if enabled
    switch (settings.autoDownload) {
      case 'dat':
        this.downloadAsDatButton.click();
        break;
      case 'zip':
        this.downloadAsZipButton.click();
        break;
    }
  }

  private createHiddenDownloadDatLinks(mapFileDownloads: MapFileDownload[]) {
    for (const download of mapFileDownloads) {
      const downloadDatLink = document.createElement('a') as HTMLAnchorElement;
      downloadDatLink.href = download.url;
      downloadDatLink.download = download.filename;
      this.downloadDatLinks.append(downloadDatLink);
    }
  }

  private async createHiddenDownloadZipLink(mapFileDownloads: MapFileDownload[], settings: Settings) {
    const zipFile = new JSZip();
    for (const download of mapFileDownloads) {
      zipFile.file(download.filename, download.buffer, { binary: true });
    }

    await zipFile.generateAsync({type: 'blob'}).then((blob) => {
      const url = createDownloadUrlFromData(blob, 'application/octet-stream');
      const startingMapId = settings.mapId;
      const endingMapId = settings.endingMapId;
      const zipFilename = `maps-${startingMapId}-to-${endingMapId}.zip`;

      this.downloadZipLink.href = url;
      this.downloadZipLink.download = zipFilename;
    });
  }
}