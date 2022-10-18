import { ScaleType } from '@models/settings';

export const MAP_SIZE = 128;

export async function drawImageFileToCanvas(
  file: File,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  scaleType: ScaleType) {

  // TODO: Consider createImageBitmap options for image processing settings
  const bitmap = await createImageBitmap(file);

  let x: number;
  let y: number;
  let width: number;
  let height: number;

  if (scaleType === 'stretch') {
    x = 0;
    y = 0;
    width = canvas.width;
    height = canvas.height;
  } else {
    const widthScaleFactor = canvas.width / bitmap.width;
    const heightScaleFactor = canvas.height / bitmap.height;

    let scaleFactor: number;
    if (scaleType === 'fit') {
      scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);
    } else if (scaleType === 'fill') {
      scaleFactor = Math.max(widthScaleFactor, heightScaleFactor);
    } else {
      throw new Error(`Unknown scale type: ${scaleType}`);
    }

    x = (canvas.width / 2) - (bitmap.width / 2) * scaleFactor;
    y = (canvas.height / 2) - (bitmap.height / 2) * scaleFactor;
    width = bitmap.width * scaleFactor;
    height = bitmap.height * scaleFactor;
  }

  const context = canvas.getContext('2d');
  context?.drawImage(bitmap, x, y, width, height);
}