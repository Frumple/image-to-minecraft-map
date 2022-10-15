export type ScaleType = 'Fit' | 'Fill' | 'Stretch';

export function drawScaledImageToCanvas(image: HTMLImageElement, canvas: HTMLCanvasElement, scaleType: ScaleType) {
  let x: number;
  let y: number;
  let width: number;
  let height: number;

  if (scaleType === 'Stretch') {
    x = 0;
    y = 0;
    width = canvas.width;
    height = canvas.height;
  } else {
    const widthScaleFactor = canvas.width / image.width;
    const heightScaleFactor = canvas.height / image.height;

    let scaleFactor: number;
    if (scaleType === 'Fit') {
      scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);
    } else if (scaleType === 'Fill') {
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