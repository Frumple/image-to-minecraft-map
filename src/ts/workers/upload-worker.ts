import IntegerInput from '@elements/builtin/integer-input';
import { calculateColorDifference } from '@helpers/color-difference-helpers';
import { applyDitheringToImageData } from '@helpers/dithering-helpers';
import { gzipData } from '@helpers/file-helpers';
import { MAP_SIZE, ImageDataPixel, drawImageToCanvas, getPixelFromImageData, setPixelToImageData } from '@helpers/image-helpers';
import { encodeNbtMap } from '@helpers/nbt-helpers';

import VersionLoader from '@loaders/version-loader';

import * as Settings from '@models/settings';
import { JavaVersion } from '@models/versions/java-version';

import { Lab, to } from 'colorjs.io/fn';
import { ColorObject } from 'colorjs.io/types/src/color';

export type UploadStep = 'source' | 'intermediate' | 'final' | 'download' | 'progress' | 'error';

export interface UploadWorkerIncomingMessageParameters {
  settings: Settings.Settings;
  file: File;
}

export interface UploadWorkerOutgoingMessageParameters {
  step: UploadStep;
  data: ImageBitmap | ArrayBuffer | number | string;
  timeElapsed?: number;
  colorsProcessed?: number;
}

export class UploadWorker {
  workerGlobalScope!: DedicatedWorkerGlobalScope;

  settings!: Settings.Settings;
  file!: File;

  minecraftVersion!: JavaVersion;

  startTime: number = 0;

  colorCache: Map<string, number> = new Map();

  constructor() {
    console.log('inner constructor');
    this.workerGlobalScope = self as DedicatedWorkerGlobalScope;
    this.workerGlobalScope.addEventListener('message', this.onMessageReceived);
  }

  onMessageReceived = (event: MessageEvent) => {
    console.log('inner onMessageReceived');
    const parameters: UploadWorkerIncomingMessageParameters = event.data;
    this.settings = new Settings.Settings(parameters.settings);
    this.file = parameters.file;

    const minecraftVersion = VersionLoader.javaVersions.get(this.settings.minecraftVersion);
    if (!minecraftVersion) {
      throw new Error('Minecraft version is undefined.');
    }
    this.minecraftVersion = minecraftVersion;

    this.run();
  }

  async run() {
    try {
      this.startTime = performance.now();

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
    console.log('f');
    const canvas: OffscreenCanvas = document.createElement('canvas') as unknown as OffscreenCanvas;
    // const canvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);

    await drawImageToCanvas(
      this.file,
      canvas);

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

    // Draw resized image to the work canvas for use in future "Reduce Colors" step
    await drawImageToCanvas(
      this.file,
      workCanvas,
      this.settings.resize,
      this.settings.resizeQuality);

    // Copy work canvas to temporary canvas
    const canvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);
    const canvasContext = canvas.getContext('2d');
    canvasContext?.drawImage(workCanvas, 0, 0);

    this.sendCanvasBitmapToMainThread(canvas, 'intermediate');

    return workCanvas;
  }

  async reduceColors(workCanvas: OffscreenCanvas) {
    const nbtColorArray = new Uint8ClampedArray(MAP_SIZE * MAP_SIZE); // 16384 entries

    const context = workCanvas.getContext('2d');
    const inputImageData = context?.getImageData(0, 0, workCanvas.width, workCanvas.height);

    if (!inputImageData) {
      throw new Error('Input image data is undefined.');
    }

    const outputImageData = context?.createImageData(inputImageData);

    if (!outputImageData) {
      throw new Error('Output image data is undefined.');
    }

    // For faster performance, use the appropriate color space for map colors to avoid converting between color spaces on the fly.
    const mapColors = this.settings.useLabColorSpace ? this.minecraftVersion.mapColorsLab : this.minecraftVersion.mapColorsRGB;

    // TODO: Iterate over x and y to make dithering calculations easier
    const dataLength = inputImageData.data.length / 4;
    let lastProgressPercentage = 0;
    for (let index = 0; index < dataLength; index++) {
      nbtColorArray[index] = this.reducePixelColor(inputImageData, outputImageData, mapColors, index * 4);

      const progressPercentage = Math.floor(index / dataLength * 100);
      if (progressPercentage >= lastProgressPercentage + 1) {
        this.sendProgressUpdateToMainThread(progressPercentage);
        lastProgressPercentage = progressPercentage;
      }
    }

    context?.putImageData(outputImageData, 0, 0);

    this.sendCanvasBitmapToMainThread(workCanvas, 'final');

    return nbtColorArray;
  }

  reducePixelColor(
    inputImageData: ImageData,
    outputImageData: ImageData,
    mapColors: ColorObject[],
    pixelStartIndex: number) {

    const originalPixel = getPixelFromImageData(inputImageData, pixelStartIndex);

    const nearestMapColorId = this.getNearestMapColorId(originalPixel, mapColors);
    const nearestMapColor = this.minecraftVersion.mapColorsRGB[nearestMapColorId];

    setPixelToImageData(outputImageData, pixelStartIndex, nearestMapColor);

    if (this.settings.dithering === 'floyd-steinberg') {
      applyDitheringToImageData(inputImageData, pixelStartIndex, originalPixel.color, nearestMapColor);
    }

    return nearestMapColorId;
  }

  getNearestMapColorId(originalPixel: ImageDataPixel, mapColors: ColorObject[]) {
    const originalColor = originalPixel.color;

    // Return the transparent map color if the original color doesn't meet the transparency threshold
    if (originalColor.alpha !== undefined && originalColor.alpha * 255 < this.settings.transparency) {
      return 0;
    }

    // Return the color if it was already encountered before and stored in the cache
    if (this.colorCache.has(originalPixel.key)) {
      return this.colorCache.get(originalPixel.key) as number;
    }

    // For faster performance, convert the original color to the appropriate color space before calculating its difference with the map colors
    const convertedOriginalColor = this.settings.useLabColorSpace ? to(originalColor, Lab) : originalColor;

    const nearestMapColorId = this.searchForNearestMapColorId(convertedOriginalColor, mapColors);
    this.colorCache.set(originalPixel.key, nearestMapColorId);

    return nearestMapColorId;
  }

  searchForNearestMapColorId(originalColor: ColorObject, mapColors: ColorObject[]) {
    let nearestDistance = Number.MAX_VALUE;
    let nearestMapColorId = 0;

    // Don't include the transparent map colors (id = 0, 1, 2, and 3) in the search
    for (let mapColorId = 4; mapColorId < mapColors.length; mapColorId++) {
      const mapColor = mapColors[mapColorId];
      const distance = calculateColorDifference(originalColor, mapColor, this.settings.colorDifference);

      // Return immediately if there is an exact match with a map color
      if (distance === 0) {
        return mapColorId;
      }

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestMapColorId = mapColorId;
      }
    }

    return nearestMapColorId;
  }

  createNbtMapFileData(unsignedNbtColorArray: Uint8ClampedArray) {
    // Change the "view" of the color array from Uint8 to Int8 so that it can be written as an NBT byte array
    // i.e. Values 0 to 127 remain the same
    //      Values 128 to 255 wraparound to -128 to -1.
    const signedNbtColorArray = new Int8Array(unsignedNbtColorArray.buffer);
    const encodedArray = encodeNbtMap(signedNbtColorArray, this.settings.minecraftVersion);
    const gzippedArray = gzipData(encodedArray);

    return gzippedArray;
  }

  sendCanvasBitmapToMainThread(canvas: OffscreenCanvas, uploadStep: UploadStep) {
    const bitmap = canvas.transferToImageBitmap();
    const timeElapsed = performance.now() - this.startTime;
    const messageData: UploadWorkerOutgoingMessageParameters = {
      step: uploadStep,
      data: bitmap,
      timeElapsed: timeElapsed
    };
    this.workerGlobalScope.postMessage(messageData, [bitmap]);
  }

  sendMapFileDataToMainThread(data: Uint8Array) {
    const buffer = data.buffer;
    const timeElapsed = performance.now() - this.startTime;
    const colorsProcessed = this.colorCache.size;
    const messageData: UploadWorkerOutgoingMessageParameters = {
      step: 'download',
      data: buffer,
      timeElapsed: timeElapsed,
      colorsProcessed: colorsProcessed
    };
    this.workerGlobalScope.postMessage(messageData, [buffer]);
  }

  sendProgressUpdateToMainThread(percent: number) {
    const messageData: UploadWorkerOutgoingMessageParameters = {
      step: 'progress',
      data: percent
    };
    this.workerGlobalScope.postMessage(messageData);
  }

  sendErrorToMainThread(message: string) {
    const messageData: UploadWorkerOutgoingMessageParameters = {
      step: 'error',
      data: message
    };
    this.workerGlobalScope.postMessage(messageData);
  }
}