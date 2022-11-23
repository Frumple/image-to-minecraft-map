import { ColorDifferenceType } from '@models/settings';

import Color from 'colorjs.io';

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

export function calculateColorDifference(color1: Color, color2: Color, algorithm: ColorDifferenceType) {

  // Convert color to plain object for use in the more-performant color.js procedural API
  const c1 = {space: sRGB, coords: color1.coords};
  const c2 = {space: sRGB, coords: color2.coords};

  switch (algorithm) {
    case 'euclidean':
      // @ts-ignore
      return distance(c1, c2, sRGB);
    case 'metric':
      return colorMetric(color1, color2);
    case 'deltae-1976':
      // @ts-ignore
      return deltaE76(c1, c2);
    case 'cmc-1984':
      // @ts-ignore
      return deltaECMC(c1, c2);
    case 'deltae-2000':
      // @ts-ignore
      return deltaE2000(c1, c2);
    default:
      throw new Error(`Invalid color difference algorithm: ${algorithm}`);
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