import { Version } from '@models/versions/version';

import { ColorObject } from 'colorjs.io/types/src/color';

export class JavaVersion extends Version {

  baseColors: ColorObject[];
  mapColorsRGB: ColorObject[];
  mapColorsLab: ColorObject[];

  constructor(
    id: string,
    name: string | null,
    baseColors: ColorObject[],
    mapColorsRGB: ColorObject[],
    mapColorsLab: ColorObject[]) {

    super(id, name);

    this.baseColors = baseColors;
    this.mapColorsRGB = mapColorsRGB;
    this.mapColorsLab = mapColorsLab;
  }
}