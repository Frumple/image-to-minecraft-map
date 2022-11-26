import { ColorDifferenceType } from '@models/settings';

import { ColorObject } from 'colorjs.io/types/src/color';

import {
  ColorSpace,
  sRGB,
  Lab,
  distance,
  deltaE76,
  deltaECMC,
  deltaE2000
} from 'colorjs.io/fn';

// Due to a bug in colorjs.io, we have to register colorspaces beforehand
// TODO: Remove these registrations when the bug in colorjs.io is fixed
ColorSpace.register(sRGB);
ColorSpace.register(Lab);

export function calculateColorDifference(color1: ColorObject, color2: ColorObject, colorDifference: ColorDifferenceType) {
  // For some reason, we also have to recreate the color object after registering the color space
  const c1 = {space: color1.space, coords: color1.coords, alpha: color1.alpha};
  const c2 = {space: color2.space, coords: color2.coords, alpha: color2.alpha};

  switch (colorDifference) {
    case 'compuphase':
      return compuPhase(c1, c2);
    case 'euclidean':
      return distance(c1, c2, sRGB);
    case 'deltae-1976':
      return deltaE76(c1, c2);
    case 'cmc-1984':
      return deltaECMC(c1, c2);
    case 'deltae-2000':
      return deltaE2000(c1, c2);
    default:
      throw new Error(`Invalid color difference algorithm: ${colorDifference}`);
  }
}

// A "low-cost approximation" color difference algorithm
// https://www.compuphase.com/cmetric.htm
function compuPhase(color1: ColorObject, color2: ColorObject) {
  const r1 = color1.coords[0] * 255;
  const r2 = color2.coords[0] * 255;
  const g1 = color1.coords[1] * 255;
  const g2 = color2.coords[1] * 255;
  const b1 = color1.coords[2] * 255;
  const b2 = color2.coords[2] * 255;

  const rmean = (r1 + r2) / 2;
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;

  return (((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8);
}