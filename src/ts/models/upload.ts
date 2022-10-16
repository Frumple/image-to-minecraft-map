import { UploadedFile } from '@helpers/file-helpers';
import { MAP_SIZE, drawImageDataUrlToCanvas } from '@helpers/image-helpers';

import UploadProgressPanel from '@elements/autonomous/containers/upload-progress-panel';

import * as Settings from '@models/settings';

export default class Upload {
  settings: Settings.Settings;
  uploadedFile: UploadedFile;
  uploadProgressPanel: UploadProgressPanel;

  workCanvas: OffscreenCanvas;

  constructor(settings: Settings.Settings, uploadedFile: UploadedFile, uploadProgressPanel: UploadProgressPanel) {
    this.settings = settings;
    this.uploadedFile = uploadedFile;
    this.uploadProgressPanel = uploadProgressPanel;

    this.workCanvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);
  }

  async processImage() {
    await drawImageDataUrlToCanvas(
      this.uploadedFile.data,
      this.workCanvas,
      this.settings.scale);

    const bitmap = this.workCanvas.transferToImageBitmap();
    const context = this.uploadProgressPanel.intermediateCanvas.getContext('bitmaprenderer');
    context?.transferFromImageBitmap(bitmap);
  }
}