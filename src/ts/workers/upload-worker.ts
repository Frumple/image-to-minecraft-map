import { MAP_SIZE, drawImageFileToCanvas } from '@helpers/image-helpers';
import VersionLoader from '@loaders/version-loader';
import * as Settings from '@models/settings';
import { JavaVersion } from '@models/versions/java-version';

import Color from 'colorjs.io/dist/color.js';

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

  version!: JavaVersion;

  workCanvas: OffscreenCanvas;

  constructor() {
    this.workCanvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);

    self.addEventListener('message', this.onMessageReceived);
  }

  onMessageReceived = (event: MessageEvent) => {
    const parameters: UploadWorkerIncomingMessageParameters = event.data;
    this.settings = parameters.settings;
    this.file = parameters.file;

    const version = VersionLoader.javaVersions.get(this.settings.version);
    if (!version) {
      throw new Error('Version is undefined.');
    }
    this.version = version;

    this.run();
  }

  async run() {
    await this.drawSourceImage();
    await this.processImage();
    await this.reduceColors();
  }

  async drawSourceImage() {
    const canvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);
    await drawImageFileToCanvas(
      this.file,
      canvas,
      'fit');

    this.sendBitmapToMainThread(canvas, 'source');
  }

  async processImage() {
    // Draw scaled image to the work canvas for use in future "Reduce Colors" step
    await drawImageFileToCanvas(
      this.file,
      this.workCanvas,
      this.settings.scale);

    // Copy work canvas to temporary canvas
    const canvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);
    const context = canvas.getContext('2d');
    context?.drawImage(this.workCanvas, 0, 0);

    this.sendBitmapToMainThread(canvas, 'intermediate');
  }

  async reduceColors() {
    const context = this.workCanvas.getContext('2d');
    const imageData = context?.getImageData(0, 0, this.workCanvas.width, this.workCanvas.height);
    const pixelData = imageData?.data;

    if (!pixelData) {
      throw new Error('Pixel data is undefined.');
    }

    const mapColors = this.version.mapColors;

    for (let index = 0; index < pixelData.length; index += 4) {
      this.reducePixelColor(mapColors, pixelData, index);
    }

    context?.putImageData(imageData, 0, 0);

    this.sendBitmapToMainThread(this.workCanvas, 'final');
  }

  reducePixelColor(mapColors: Color[], pixelData: Uint8ClampedArray, index: number) {
    const r = pixelData[index] / 255;
    const g = pixelData[index + 1] / 255;
    const b = pixelData[index + 2] / 255;
    const a = pixelData[index + 3] / 255;

    const originalColor = new Color('srgb', [r, g, b], a);

    const nearestMapColorId = this.getNearestMapColorId(originalColor, mapColors);

    const closestMapColor = mapColors[nearestMapColorId];
    pixelData[index] = closestMapColor.srgb.r * 255;
    pixelData[index + 1] = closestMapColor.srgb.g * 255;
    pixelData[index + 2] = closestMapColor.srgb.b * 255;
    pixelData[index + 3] = closestMapColor.alpha * 255;
  }

  getNearestMapColorId(originalColor: Color, mapColors: Color[]) {
    let nearestDistance = Number.MAX_VALUE;
    let nearestMapColorId = 0;
    for (const [id, mapColor] of mapColors.entries()) {
      // TODO: Support different color difference algorithms
      const distance = originalColor.distance(mapColor, 'srgb');

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestMapColorId = id;
      }
    }

    return nearestMapColorId;
  }

  sendBitmapToMainThread(canvas: OffscreenCanvas, imageStep: ImageStep) {
    const bitmap = canvas.transferToImageBitmap();
    const messageData: UploadWorkerOutgoingMessageParameters = {
      imageStep: imageStep,
      bitmap: bitmap
    };
    postMessage(messageData, [bitmap]);
  }
}

const worker = new UploadWorker();
