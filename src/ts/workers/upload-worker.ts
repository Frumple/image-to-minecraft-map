import { calculateColorDifference } from '@helpers/color-difference-helpers';
import { applyDitheringToImageData } from '@helpers/dithering-helpers';
import { gzipData } from '@helpers/file-helpers';
import { ImageDataPixel, drawAutoResizedImageToCanvas, getPixelFromImageData, setPixelToImageData, bufferToOffscreenCanvas } from '@helpers/image-helpers';
import { encodeNbtMap, splitColorArrayIntoMaps } from '@helpers/nbt-helpers';
import { readEntireStream } from '@helpers/stream-helpers';

import VersionLoader from '@loaders/version-loader';

import { Settings } from '@models/settings';
import { JavaVersion } from '@models/versions/java-version';

import { Lab, to } from 'colorjs.io/fn';
import { ColorObject } from 'colorjs.io/types/src/color';

export type UploadWorkerIncomingMessage = UploadWorkerIncomingFileMessage | UploadWorkerIncomingImageMessage;

export interface UploadWorkerIncomingFileMessage {
  type: 'file';
  settings: Settings;
  stream: ReadableStream;
}

export interface UploadWorkerIncomingImageMessage {
  type: 'image';
  settings: Settings;
  buffer: ArrayBuffer;
  width: number;
  height: number;
}

export type ImagePreviewType = 'source' | 'intermediate' | 'final';

export type UploadWorkerOutgoingMessage =
  UploadWorkerOutgoingProgressMessage |
  UploadWorkerOutgoingImageMessage |
  UploadWorkerOutgoingDownloadMessage |
  UploadWorkerOutgoingErrorMessage;

export interface UploadWorkerOutgoingProgressMessage {
  type: 'progress';
  percent: number;
}

export interface UploadWorkerOutgoingImageMessage {
  type: ImagePreviewType;
  bitmap: ImageBitmap;
}

export interface UploadWorkerOutgoingDownloadMessage {
  type: 'download';
  data: readonly ArrayBuffer[][];
  colorsProcessed: number;
  timeElapsed: number;
}

export interface UploadWorkerOutgoingErrorMessage {
  type: 'error';
  errorMessage: string;
}

class UploadWorker {
  settings!: Settings;
  originalImage!: ImageBitmap | OffscreenCanvas;

  minecraftVersion!: JavaVersion;

  startTime: number = 0;

  colorCache: Map<string, number> = new Map();

  constructor() {
    self.addEventListener('message', this.onMessageReceived);
  }

  onMessageReceived = async (event: MessageEvent) => {
    try {
      const message: UploadWorkerIncomingMessage = event.data;
      this.startTime = performance.now();
      this.settings = new Settings(message.settings);

      if (message.type === 'file') {
        const blob = await readEntireStream(message.stream);
        this.originalImage = await createImageBitmap(blob);
      } else if (message.type === 'image') {
        const canvas = bufferToOffscreenCanvas(message.buffer, message.width, message.height);
        this.originalImage = canvas;
      }

      const minecraftVersion = VersionLoader.javaVersions.get(this.settings.minecraftVersion);
      if (!minecraftVersion) {
        throw new Error('Minecraft version is undefined.');
      }
      this.minecraftVersion = minecraftVersion;

      await this.run();
    } catch(error) {

      // TODO: Catch other types of errors and exceptions here
      // For now, we are handling the DOMException when a source image cannot be decoded.
      if (error instanceof DOMException) {
        this.sendErrorToMainThread(error.message);
      } else {
        throw error;
      }

    }
  }

  async run(): Promise<void> {
    await this.drawSourceImage();
    const workCanvas = await this.processImage();
    const nbtColorArray = await this.reduceColors(workCanvas);
    const nbtMapFileData = this.createNbtMapFileData(nbtColorArray);
    this.sendMapFileDataToMainThread(nbtMapFileData);
  }

  async drawSourceImage(): Promise<void> {
    const canvas = new OffscreenCanvas(this.settings.canvasWidth, this.settings.canvasHeight);

    await drawAutoResizedImageToCanvas(
      this.originalImage,
      canvas);

    this.sendCanvasBitmapToMainThread('source', canvas);
  }

  async processImage(): Promise<OffscreenCanvas> {
    const workCanvas = new OffscreenCanvas(this.settings.canvasWidth, this.settings.canvasHeight);
    const workCanvasContext = workCanvas.getContext('2d');

    if (workCanvasContext === null) {
      throw new Error('Work canvas context is null.');
    }

    if (this.settings.background !== 'transparent') {
      workCanvasContext.fillStyle = this.settings.background;
      workCanvasContext.fillRect(0, 0, workCanvas.width, workCanvas.height);
    }

    // Draw resized image to the work canvas for use in future "Reduce Colors" step
    await drawAutoResizedImageToCanvas(
      this.originalImage,
      workCanvas,
      this.settings.resize,
      this.settings.resizeQuality);

    // Copy work canvas to temporary canvas
    const canvas = new OffscreenCanvas(this.settings.canvasWidth, this.settings.canvasHeight);
    const canvasContext = canvas.getContext('2d');
    canvasContext?.drawImage(workCanvas, 0, 0);

    this.sendCanvasBitmapToMainThread('intermediate', canvas);

    return workCanvas;
  }

  async reduceColors(workCanvas: OffscreenCanvas): Promise<Uint8ClampedArray> {
    const nbtColorArray = new Uint8ClampedArray(this.settings.canvasWidth * this.settings.canvasHeight); // 16384 entries per map

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

    this.sendCanvasBitmapToMainThread('final', workCanvas);

    return nbtColorArray;
  }

  reducePixelColor(
    inputImageData: ImageData,
    outputImageData: ImageData,
    mapColors: readonly ColorObject[],
    pixelStartIndex: number): number {

    const originalPixel = getPixelFromImageData(inputImageData, pixelStartIndex);

    const nearestMapColorId = this.getNearestMapColorId(originalPixel, mapColors);
    const nearestMapColor = this.minecraftVersion.mapColorsRGB[nearestMapColorId];

    setPixelToImageData(outputImageData, pixelStartIndex, nearestMapColor);

    if (this.settings.dithering === 'floyd-steinberg') {
      // Only apply dithering if the original pixel color meets the transparency threshold
      if (this.doesColorMeetTransparencyThreshold(originalPixel.color)) {
        applyDitheringToImageData(inputImageData, pixelStartIndex, originalPixel.color, nearestMapColor);
      }
    }

    return nearestMapColorId;
  }

  getNearestMapColorId(originalPixel: ImageDataPixel, mapColors: readonly ColorObject[]): number {
    const originalColor = originalPixel.color;

    // Return the transparent map color if the original color doesn't meet the transparency threshold
    if (! this.doesColorMeetTransparencyThreshold(originalColor)) {
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

  doesColorMeetTransparencyThreshold(originalColor: ColorObject): boolean {
    return originalColor.alpha !== undefined && originalColor.alpha * 255 >= this.settings.transparency;
  }

  searchForNearestMapColorId(originalColor: ColorObject, mapColors: readonly ColorObject[]): number {
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

  createNbtMapFileData(unsignedNbtColorArray: Uint8ClampedArray): ArrayBuffer[][] {
    // Change the "view" of the color array from Uint8 to Int8 so that it can be written as an NBT byte array
    // i.e. Values 0 to 127 remain the same
    //      Values 128 to 255 wraparound to -128 to -1.
    const signedNbtColorArray = new Int8Array(unsignedNbtColorArray.buffer);

    const splitNbtColorArray = splitColorArrayIntoMaps(signedNbtColorArray, this.settings.numberOfMapsHorizontal, this.settings.numberOfMapsVertical);

    const splitGzippedArray = splitNbtColorArray.map((column) => {
      return column.map((colorArray) => {
        const encodedArray = encodeNbtMap(colorArray, this.settings.minecraftVersion);
        const gzippedArray = gzipData(encodedArray);
        return gzippedArray.buffer;
      });
    });

    return splitGzippedArray;
  }

  sendProgressUpdateToMainThread(percent: number): void {
    const message: UploadWorkerOutgoingProgressMessage = {
      type: 'progress',
      percent: percent
    };
    postMessage(message);
  }

  sendCanvasBitmapToMainThread(imagePreviewType: ImagePreviewType, canvas: OffscreenCanvas): void {
    const bitmap = canvas.transferToImageBitmap();
    const message: UploadWorkerOutgoingImageMessage = {
      type: imagePreviewType,
      bitmap: bitmap
    };
    postMessage(message, [bitmap]);
  }

  sendMapFileDataToMainThread(data: readonly ArrayBuffer[][]): void {
    const timeElapsed = performance.now() - this.startTime;
    const colorsProcessed = this.colorCache.size;
    const message: UploadWorkerOutgoingDownloadMessage = {
      type: 'download',
      data: data,
      timeElapsed: timeElapsed,
      colorsProcessed: colorsProcessed
    };

    const transferableObjects = ([] as ArrayBuffer[]).concat(...data);
    postMessage(message, transferableObjects);
  }

  sendErrorToMainThread(errorMessage: string): void {
    const message: UploadWorkerOutgoingErrorMessage = {
      type: 'error',
      errorMessage: errorMessage
    };
    postMessage(message);
  }
}

const worker = new UploadWorker();
