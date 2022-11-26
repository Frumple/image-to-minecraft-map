import { Version } from '@models/versions/version';

import { ColorObject } from 'colorjs.io/types/src/color';

export class JavaVersion extends Version {

  baseColors: ColorObject[];
  mapColors: ColorObject[];

  constructor(
    id: string,
    name: string | null,
    baseColors: ColorObject[],
    mapColors: ColorObject[]) {

    super(id, name);

    this.baseColors = baseColors;
    this.mapColors = mapColors;
  }
}