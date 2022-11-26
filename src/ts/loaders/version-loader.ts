import { JavaVersion } from '@models/versions/java-version';
import versionsJson from '@json/versions.json';

import { ColorObject } from 'colorjs.io/types/src/color';
import { ColorSpace, sRGB, parse } from 'colorjs.io/fn';

// Due to a bug in colorjs.io, we have to register colorspaces beforehand
// TODO: Remove this registration when the bug in colorjs.io is fixed
ColorSpace.register(sRGB);

class VersionLoader {

  javaVersions: Map<string, JavaVersion>;

  constructor() {
    this.javaVersions = new Map();

    // For each version, add all the base and map colors from the previous versions
    const accumulatedBaseColors: ColorObject[] = [];
    const accumulatedMapColors: ColorObject[] = [];

    for (const javaVersionJson of versionsJson.java) {
      const baseColors = javaVersionJson.base_colors.map(str => {
        const parsedColor = parse(str);
        return { space: sRGB, coords: parsedColor.coords, alpha: parsedColor.alpha };
      });

      // For each base color, multiply each of these numbers and divide by 255 to get the 4 associated map colors
      const mapColorMultipliers = [180, 220, 255, 135];

      for (const baseColor of baseColors) {
        for (const multiplier of mapColorMultipliers) {
          // Deep copy the coordinates so that changes to the map color do not affect the base color
          const mapColor = { space: sRGB, coords: structuredClone(baseColor.coords), alpha: baseColor.alpha };
          for (let i = 0; i <= 2; i++) {
            mapColor.coords[i] = Math.floor(mapColor.coords[i] * multiplier) / 255;
          }
          accumulatedMapColors.push(mapColor);
        }
      }

      accumulatedBaseColors.push(...baseColors);

      const javaVersion = new JavaVersion(
        javaVersionJson.id,
        javaVersionJson.name,
        Array.from(accumulatedBaseColors),
        Array.from(accumulatedMapColors)
      );

      this.javaVersions.set(javaVersionJson.id, javaVersion);
    }
  }
}

export default new VersionLoader();