import { convertRGBColorToHex } from '@helpers/number-helpers';
import { ResizeType, ResizeQualityType } from '@models/settings';
import { sRGB } from 'colorjs.io/fn';
import { ColorObject } from 'colorjs.io/types/src/color';

export const MAP_SIDE_LENGTH = 128;
export const MAP_FULL_LENGTH = MAP_SIDE_LENGTH ** 2;

export interface ImageDataPixel {
  key: string,
  color: ColorObject
}

export async function drawAutoResizedImageToCanvas(
  source: ImageBitmap | OffscreenCanvas,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  resizeType: ResizeType = 'fit',
  resizeQualityType: ResizeQualityType = 'high'): Promise<void> {

  let x: number;
  let y: number;
  let width: number;
  let height: number;

  if (resizeType === 'stretch') {
    x = 0;
    y = 0;
    width = canvas.width;
    height = canvas.height;
  } else {
    const widthResizeFactor = canvas.width / source.width;
    const heightResizeFactor = canvas.height / source.height;

    let resizeFactor: number;
    if (resizeType === 'fit') {
      resizeFactor = Math.min(widthResizeFactor, heightResizeFactor);
    } else if (resizeType === 'fill') {
      resizeFactor = Math.max(widthResizeFactor, heightResizeFactor);
    } else {
      throw new Error(`Unknown resize type: ${resizeType}`);
    }

    x = (canvas.width / 2) - (source.width / 2) * resizeFactor;
    y = (canvas.height / 2) - (source.height / 2) * resizeFactor;
    width = source.width * resizeFactor;
    height = source.height * resizeFactor;
  }

  drawImageToCanvas(source, canvas, x, y, width, height, resizeQualityType);
}

export function drawImageToCanvas(
  source: CanvasImageSource,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  x: number = 0,
  y: number = 0,
  width: number = MAP_SIDE_LENGTH,
  height: number = MAP_SIDE_LENGTH,
  resizeQualityType: ResizeQualityType = 'high'): void {

  const context = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  if (context === null) {
    throw new Error('Canvas context is null.');
  }
  if (resizeQualityType === 'pixelated') {
    context.imageSmoothingEnabled = false;
  } else {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = resizeQualityType;
  }

  context.drawImage(source, x, y, width, height);
}

export async function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  const image = await loadImageFromUrl(url);
  URL.revokeObjectURL(url);
  return image;
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;

  return new Promise((resolve, reject) => {
    image.onload = (event) => {
      resolve(image);
    };
    image.onerror = (event) => {
      const error = new DOMException("Unable to load image.");
      reject(error);
    }
  });
}

export function imageToBuffer(image: HTMLImageElement): ArrayBuffer {
  const canvas = new OffscreenCanvas(image.width, image.height);
  const context = canvas.getContext('2d');
  if (context === null) {
    throw new Error('Canvas context is null.');
  }
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, image.width, image.height);
  return imageData.data.buffer;
}

export function bufferToOffscreenCanvas(buffer: ArrayBuffer, width: number, height: number): OffscreenCanvas {
  const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height);
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');
  if (context === null) {
    throw new Error('Canvas context is null.');
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

export function getPixelFromImageData(imageData: ImageData, pixelStartIndex: number): ImageDataPixel {
  const imageDataArray = imageData.data;

  const r = imageDataArray[pixelStartIndex];
  const g = imageDataArray[pixelStartIndex + 1];
  const b = imageDataArray[pixelStartIndex + 2];
  const a = imageDataArray[pixelStartIndex + 3];

  const key = convertRGBColorToHex(r, g, b);

  return {
    key: key,
    color: {
      space: sRGB,
      coords: [r / 255, g / 255, b / 255],
      alpha: a / 255
    }
  }
}

export function setPixelToImageData(imageData: ImageData,  pixelStartIndex: number, color: ColorObject): void {
  const imageDataArray = imageData.data;

  imageDataArray[pixelStartIndex] = color.coords[0] * 255;
  imageDataArray[pixelStartIndex + 1] = color.coords[1] * 255;
  imageDataArray[pixelStartIndex + 2] = color.coords[2] * 255;
  imageDataArray[pixelStartIndex + 3] = (color.alpha !== undefined) ? color.alpha * 255 : 255;
}