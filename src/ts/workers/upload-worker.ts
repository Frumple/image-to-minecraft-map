import { MAP_SIZE, drawImageFileToCanvas } from '@helpers/image-helpers';
import * as Settings from '@models/settings';

export type ImageStep = 'source' | 'intermediate' | 'final'

export interface UploadWorkerIncomingMessageParameters {
  settings: Settings.Settings;
  file: File;
}

export interface UploadWorkerOutgoingMessageParameters {
  imageStep: ImageStep,
  bitmap: ImageBitmap
}

class UploadWorker {
  settings!: Settings.Settings;
  file!: File;

  workCanvas: OffscreenCanvas;

  constructor() {
    this.workCanvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);

    self.addEventListener('message', this.onMessageReceived);
  }

  onMessageReceived = (event: MessageEvent) => {
    const parameters: UploadWorkerIncomingMessageParameters = event.data;
    this.settings = parameters.settings;
    this.file = parameters.file;

    this.run();
  }

  async run() {
    await this.drawSourceImage();
    await this.processImage();
  }

  async drawSourceImage() {
    await drawImageFileToCanvas(
      this.file,
      this.workCanvas,
      'fit');

    const bitmap = this.workCanvas.transferToImageBitmap();
    const messageData: UploadWorkerOutgoingMessageParameters = {
      imageStep: 'source',
      bitmap: bitmap
    };
    postMessage(messageData, [bitmap]);
  }

  async processImage() {
    await drawImageFileToCanvas(
      this.file,
      this.workCanvas,
      this.settings.scale);

    const bitmap = this.workCanvas.transferToImageBitmap();
    const messageData: UploadWorkerOutgoingMessageParameters = {
      imageStep: 'intermediate',
      bitmap: bitmap
    };
    postMessage(messageData, [bitmap]);
  }
}

const worker = new UploadWorker();
