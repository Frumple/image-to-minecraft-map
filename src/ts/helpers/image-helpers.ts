import { ScaleType } from '@models/settings';

export const MAP_SIZE = 128;

export async function drawImageDataUrlToCanvas(
  dataUrl: string,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  scaleType: ScaleType) {

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => {
      drawImageToCanvas(image, canvas, scaleType);
      resolve(canvas);
    });
    image.src = dataUrl;
  });
}

function drawImageToCanvas(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  scaleType: ScaleType) {

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
    const widthScaleFactor = canvas.width / image.width;
    const heightScaleFactor = canvas.height / image.height;

    let scaleFactor: number;
    if (scaleType === 'fit') {
      scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);
    } else if (scaleType === 'fill') {
      scaleFactor = Math.max(widthScaleFactor, heightScaleFactor);
    } else {
      throw new Error(`Unknown scale type: ${scaleType}`);
    }

    x = (canvas.width / 2) - (image.width / 2) * scaleFactor;
    y = (canvas.height / 2) - (image.height / 2) * scaleFactor;
    width = image.width * scaleFactor;
    height = image.height * scaleFactor;
  }

  const context = canvas.getContext('2d');
  context?.drawImage(image, x, y, width, height);
}