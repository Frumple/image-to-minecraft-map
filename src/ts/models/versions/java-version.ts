import { Version } from '@models/versions/version';

import Color from 'colorjs.io';

export class JavaVersion extends Version {

  baseColors: Color[];
  mapColors: Color[];

  constructor(
    id: string,
    name: string | null,
    baseColors: Color[],
    mapColors: Color[]) {

    super(id, name);

    this.baseColors = baseColors;
    this.mapColors = mapColors;
  }
}