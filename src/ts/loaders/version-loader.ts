import { JavaVersion } from '@models/versions/java-version';
import javaVersionsJson from '@json/java-versions.json';

import { ColorObject, Coords } from 'colorjs.io/types/src/color';
import { ColorSpace, sRGB, Lab, parse, to } from 'colorjs.io/fn';

// Due to a bug in colorjs.io, we have to register colorspaces beforehand
// TODO: Remove this registration when the bug in colorjs.io is fixed
ColorSpace.register(sRGB);

class VersionLoader {

  javaVersions: Map<string, JavaVersion>;

  constructor() {
    this.javaVersions = new Map();

    // For each version, add all the base and map colors from the previous versions
    const accumulatedBaseColors: ColorObject[] = [];
    const accumulatedMapColorsRGB: ColorObject[] = [];
    const accumulatedMapColorsLab: ColorObject[] = [];

    for (const javaVersionJson of javaVersionsJson.versions) {
      const baseColors = javaVersionJson.base_colors.map(str => {
        const parsedColor = parse(str);
        return { space: sRGB, coords: parsedColor.coords, alpha: parsedColor.alpha };
      });

      // For each base color, multiply each of these numbers and divide by 255 to get the 4 associated map colors
      const mapColorMultipliers = [180, 220, 255, 135];

      for (const baseColor of baseColors) {
        for (const multiplier of mapColorMultipliers) {
          // Deep copy the coordinates so that changes to the map color do not affect the base color
          const mapColorRGB = { space: sRGB, coords: [...baseColor.coords] as Coords, alpha: baseColor.alpha };
          for (let i = 0; i <= 2; i++) {
            mapColorRGB.coords[i] = Math.floor(mapColorRGB.coords[i] * multiplier) / 255;
          }
          const mapColorLab = to(mapColorRGB, Lab);

          accumulatedMapColorsRGB.push(mapColorRGB);
          accumulatedMapColorsLab.push(mapColorLab);
        }
      }

      accumulatedBaseColors.push(...baseColors);

      const javaVersion = new JavaVersion(
        javaVersionJson.id,
        javaVersionJson.name,
        new Date(javaVersionJson.date),
        Array.from(accumulatedBaseColors),
        Array.from(accumulatedMapColorsRGB),
        Array.from(accumulatedMapColorsLab)
      );

      this.javaVersions.set(javaVersionJson.id, javaVersion);
    }
  }
}

export default new VersionLoader();