import { calculateColorDifference } from '@helpers/color-difference-helpers';
import { applyDitheringToImageData } from '@helpers/dithering-helpers';
import { gzipData } from '@helpers/file-helpers';
import { MAP_SIZE, drawImageToCanvas, getPixelColorFromImageData, setPixelColorToImageData } from '@helpers/image-helpers';
import { encodeNbtMap } from '@helpers/nbt-helpers';

import VersionLoader from '@loaders/version-loader';

import * as Settings from '@models/settings';
import { JavaVersion } from '@models/versions/java-version';

import Color from 'colorjs.io';

export type UploadStep = 'source' | 'intermediate' | 'final' | 'download' | 'progress' | 'error';

export interface UploadWorkerIncomingMessageParameters {
  settings: Settings.Settings;
  file: File;
}

export interface UploadWorkerOutgoingMessageParameters {
  step: UploadStep;
  data: ImageBitmap | ArrayBuffer | number | string;
}

class UploadWorker {
  settings!: Settings.Settings;
  file!: File;

  version!: JavaVersion;

  constructor() {
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
    try {

      await this.drawSourceImage();
      const workCanvas = await this.processImage();
      const nbtColorArray = await this.reduceColors(workCanvas);
      const nbtMapFileData = this.createNbtMapFileData(nbtColorArray);
      this.sendMapFileDataToMainThread(nbtMapFileData);

    } catch (error) {

      // TODO: Catch other types of errors and exceptions here
      // For now, we are handling the DOMException when a source image cannot be decoded.
      if (error instanceof DOMException) {
        this.sendErrorToMainThread(error.message);
      } else {
        throw error;
      }

    }
  }

  async drawSourceImage() {
    const canvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);

    await drawImageToCanvas(
      this.file,
      canvas,
      'fit',
      'high');

    this.sendCanvasBitmapToMainThread(canvas, 'source');
  }

  async processImage() {
    const workCanvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);
    const workCanvasContext = workCanvas.getContext('2d');

    if (workCanvasContext === null) {
      throw new Error('Work canvas context is null.');
    }

    if (this.settings.background !== 'transparent') {
      workCanvasContext.fillStyle = this.settings.background;
      workCanvasContext.fillRect(0, 0, workCanvas.width, workCanvas.height);
    }

    // Draw scaled image to the work canvas for use in future "Reduce Colors" step
    await drawImageToCanvas(
      this.file,
      workCanvas,
      this.settings.scale,
      this.settings.scaleQuality);

    // Copy work canvas to temporary canvas
    const canvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);
    const canvasContext = canvas.getContext('2d');
    canvasContext?.drawImage(workCanvas, 0, 0);

    this.sendCanvasBitmapToMainThread(canvas, 'intermediate');

    return workCanvas;
  }

  async reduceColors(workCanvas: OffscreenCanvas) {
    const context = workCanvas.getContext('2d');
    const imageData = context?.getImageData(0, 0, workCanvas.width, workCanvas.height);

    const nbtColorArray = new Uint8ClampedArray(MAP_SIZE * MAP_SIZE); // 16384 entries

    if (!imageData) {
      throw new Error('Image data is undefined.');
    }

    const mapColors = this.version.mapColors;

    // TODO: Iterate over x and y to make dithering calculations easier
    const dataLength = imageData.data.length / 4;
    let lastProgressPercentage = 0;
    for (let index = 0; index < dataLength; index++) {
      nbtColorArray[index] = this.reducePixelColor(mapColors, imageData, index * 4);

      const progressPercentage = Math.floor(index / dataLength * 100);
      if (progressPercentage >= lastProgressPercentage + 1) {
        this.sendProgressUpdateToMainThread(progressPercentage);
        lastProgressPercentage = progressPercentage;
      }
    }

    context?.putImageData(imageData, 0, 0);

    this.sendCanvasBitmapToMainThread(workCanvas, 'final');

    return nbtColorArray;
  }

  reducePixelColor(
    mapColors: Color[],
    imageData: ImageData,
    pixelStartIndex: number) {

    const originalColor = getPixelColorFromImageData(imageData, pixelStartIndex);

    const nearestMapColorId = this.getNearestMapColorId(originalColor, mapColors);
    const nearestMapColor = mapColors[nearestMapColorId];

    setPixelColorToImageData(imageData, pixelStartIndex, nearestMapColor);

    if (this.settings.dithering === 'floyd-steinberg') {
      applyDitheringToImageData(imageData, pixelStartIndex, originalColor, nearestMapColor);
    }

    return nearestMapColorId;
  }

  getNearestMapColorId(originalColor: Color, mapColors: Color[]) {
    // Return the transparent map color if the original color doesn't meet the transparency threshold
    if (originalColor.alpha * 255 < this.settings.transparency) {
      return 0;
    }

    // Otherwise, search for the map color nearest to the original color
    let nearestDistance = Number.MAX_VALUE;
    let nearestMapColorId = 0;

    for (const [id, mapColor] of mapColors.entries()) {
      // Don't include the transparency map colors in the search
      // TODO: Does removing this check and just iterating a subset of opaque map colors save time?
      if (mapColor.alpha === 0) {
        continue;
      }

      const distance = calculateColorDifference(originalColor, mapColor, this.settings.colorDifference);

      // Return immediately if there is an exact match with a map color
      if (distance === 0) {
        return id;
      }

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestMapColorId = id;
      }
    }

    return nearestMapColorId;
  }

  createNbtMapFileData(unsignedNbtColorArray: Uint8ClampedArray) {
    // Change the "view" of the color array from Uint8 to Int8 so that it can be written as an NBT byte array
    // i.e. Values 0 to 127 remain the same
    //      Values 128 to 255 wraparound to -128 to -1.
    const signedNbtColorArray = new Int8Array(unsignedNbtColorArray.buffer);
    const encodedArray = encodeNbtMap(signedNbtColorArray);
    const gzippedArray = gzipData(encodedArray);

    return gzippedArray;
  }

  sendCanvasBitmapToMainThread(canvas: OffscreenCanvas, uploadStep: UploadStep) {
    const bitmap = canvas.transferToImageBitmap();
    const messageData: UploadWorkerOutgoingMessageParameters = {
      step: uploadStep,
      data: bitmap
    };
    postMessage(messageData, [bitmap]);
  }

  sendMapFileDataToMainThread(data: Uint8Array) {
    const buffer = data.buffer;
    const messageData: UploadWorkerOutgoingMessageParameters = {
      step: 'download',
      data: buffer
    };
    postMessage(messageData, [buffer]);
  }

  sendProgressUpdateToMainThread(percent: number) {
    const messageData: UploadWorkerOutgoingMessageParameters = {
      step: 'progress',
      data: percent
    };
    postMessage(messageData);
  }

  sendErrorToMainThread(message: string) {
    const messageData: UploadWorkerOutgoingMessageParameters = {
      step: 'error',
      data: message
    };
    postMessage(messageData);
  }
}

const worker = new UploadWorker();
