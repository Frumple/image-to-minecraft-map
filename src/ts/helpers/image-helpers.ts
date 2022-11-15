import { ResizeType, ResizeQualityType } from '@models/settings';

import Color from 'colorjs.io';

export const MAP_SIZE = 128;

export async function drawImageToCanvas(
  source: ImageBitmapSource,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  resizeType: ResizeType,
  resizeQualityType: ResizeQualityType) {

  const bitmap = await createImageBitmap(source);

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
    const widthResizeFactor = canvas.width / bitmap.width;
    const heightResizeFactor = canvas.height / bitmap.height;

    let resizeFactor: number;
    if (resizeType === 'fit') {
      resizeFactor = Math.min(widthResizeFactor, heightResizeFactor);
    } else if (resizeType === 'fill') {
      resizeFactor = Math.max(widthResizeFactor, heightResizeFactor);
    } else {
      throw new Error(`Unknown resize type: ${resizeType}`);
    }

    x = (canvas.width / 2) - (bitmap.width / 2) * resizeFactor;
    y = (canvas.height / 2) - (bitmap.height / 2) * resizeFactor;
    width = bitmap.width * resizeFactor;
    height = bitmap.height * resizeFactor;
  }

  const context = canvas.getContext('2d');
  if (context === null) {
    throw new Error('Canvas context is null.');
  }
  if (resizeQualityType === 'pixelated') {
    context.imageSmoothingEnabled = false;
  } else {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = resizeQualityType;
  }
  context.drawImage(bitmap, x, y, width, height);
}

export function getPixelFromImageData(imageData: ImageData, pixelStartIndex: number) {
  const imageDataArray = imageData.data;

  const r = imageDataArray[pixelStartIndex];
  const g = imageDataArray[pixelStartIndex + 1];
  const b = imageDataArray[pixelStartIndex + 2];
  const a = imageDataArray[pixelStartIndex + 3];

  return {
    key: `${r},${g},${b}`,
    color: new Color('srgb', [r / 255, g / 255, b / 255], a / 255)
  }
}

export function setPixelToImageData(imageData: ImageData,  pixelStartIndex: number, color: Color) {
  const imageDataArray = imageData.data;

  imageDataArray[pixelStartIndex] = color.srgb.r * 255;
  imageDataArray[pixelStartIndex + 1] = color.srgb.g * 255;
  imageDataArray[pixelStartIndex + 2] = color.srgb.b * 255;
  imageDataArray[pixelStartIndex + 3] = color.alpha * 255;
}