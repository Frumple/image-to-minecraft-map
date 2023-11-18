import { MinecraftVersion } from '@models/versions/minecraft-version';

import { ColorObject } from 'colorjs.io/types/src/color';

export class JavaVersion extends MinecraftVersion {

  dataVersion: number;
  baseColors: ColorObject[];
  mapColorsRGB: ColorObject[];
  mapColorsLab: ColorObject[];

  constructor(
    id: string,
    name: string | null,
    dataVersion: number,
    baseColors: ColorObject[],
    mapColorsRGB: ColorObject[],
    mapColorsLab: ColorObject[]) {

    super(id, name);

    this.dataVersion = dataVersion;
    this.baseColors = baseColors;
    this.mapColorsRGB = mapColorsRGB;
    this.mapColorsLab = mapColorsLab;
  }
}