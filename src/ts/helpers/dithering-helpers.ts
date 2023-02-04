import { ColorObject } from 'colorjs.io/types/src/color';

export type QuantizationError = [number, number, number, number];

// TODO: Support other dithering algorithms
export function applyDitheringToImageData(imageData: ImageData, pixelStartIndex: number, originalColor: ColorObject, newColor: ColorObject): void {
  const floydSteinbergWeights = [7 / 16, 3 / 16, 5 / 16, 1 / 16];

  const quantizationError = getQuantizationError(originalColor, newColor);

  const pixelEndIndex = pixelStartIndex + 3;
  const imageDataArray = imageData.data;
  const width = imageData.width * 4;

  // Distribute the quantization error to neighboring pixels, if they exist:

  // [x+1][y  ]: To the right of the current pixel
  if (pixelEndIndex % width < width - 1) {
    applyQuantizationErrorToPixel(imageDataArray, quantizationError, pixelStartIndex + 4, floydSteinbergWeights[0]);
  }

  if (pixelEndIndex + width <= imageDataArray.length) {
    // [x-1][y+1]: Below and to the left of the current pixel
    if (pixelEndIndex % width > 0) {
      applyQuantizationErrorToPixel(imageDataArray, quantizationError, pixelStartIndex - 4 + width, floydSteinbergWeights[1]);
    }

    // [x  ][y+1]: Below the current pixel
    applyQuantizationErrorToPixel(imageDataArray, quantizationError, pixelStartIndex + width, floydSteinbergWeights[2]);

    // [x+1][y+1]: Below and to the right of the current pixel
    if (pixelEndIndex % width < width - 1) {
      applyQuantizationErrorToPixel(imageDataArray, quantizationError, pixelStartIndex + 4 + width, floydSteinbergWeights[3]);
    }
  }
}

function getQuantizationError(originalColor: ColorObject, newColor: ColorObject): QuantizationError {
  return [
    originalColor.coords[0] - newColor.coords[0],
    originalColor.coords[1] - newColor.coords[1],
    originalColor.coords[2] - newColor.coords[2],
    (originalColor.alpha !== undefined && newColor.alpha !== undefined) ? originalColor.alpha - newColor.alpha : 0,
  ]
}

function applyQuantizationErrorToPixel(imageDataArray: Uint8ClampedArray, quantizationError: QuantizationError, pixelStartIndex: number, weight: number): void {
  for (let offset = 0; offset <= 3; offset++) {
    imageDataArray[pixelStartIndex + offset] += quantizationError[offset] * weight * 255;
  }
}