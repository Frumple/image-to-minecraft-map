import { ColorDifferenceType } from '@models/settings';

import Color from 'colorjs.io';

export function calculateColorDifference(color1: Color, color2: Color, algorithm: ColorDifferenceType) {
  switch (algorithm) {
    case 'euclidean':
      return color1.distance(color2, 'srgb');
    case 'metric':
      return colorMetric(color1, color2);
    case 'deltae-1976':
      return color1.deltaE76(color2);
    case 'cmc-1984':
      return color1.deltaECMC(color2);
    case 'deltae-2000':
      return color1.deltaE2000(color2);
    default:
      throw new Error (`Invalid color difference algorithm: ${algorithm}`);
  }
}

// A "low-cost approximation" color difference algorithm
// https://www.compuphase.com/cmetric.htm
function colorMetric(color1: Color, color2: Color) {
  const r1 = color1.srgb.r * 255;
  const r2 = color2.srgb.r * 255;
  const g1 = color1.srgb.g * 255;
  const g2 = color2.srgb.g * 255;
  const b1 = color1.srgb.b * 255;
  const b2 = color2.srgb.b * 255;

  const rmean = (r1 + r2) / 2;
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;

  return (((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8);
}