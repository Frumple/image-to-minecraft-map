import { JavaVersion } from '@models/versions/java-version';
import versionsJson from '@json/versions.json';

import Color from 'colorjs.io/dist/color.js';

class VersionLoader {

  javaVersions: Map<string, JavaVersion>;

  constructor() {
    this.javaVersions = new Map();

    // For each version, add all the base and map colors from the previous versions
    const accumulatedBaseColors: Color[] = [];
    const accumulatedMapColors: Color[] = [];

    for (const javaVersionJson of versionsJson.java) {
      const baseColors = javaVersionJson.base_colors.map(str => new Color(str));

      // For each base color, multiply each of these numbers and divide by 255 to get the 4 associated map colors
      const mapColorMultipliers = [180, 220, 255, 135];

      for (const baseColor of baseColors) {
        for (const multiplier of mapColorMultipliers) {
          // TODO: Replace this with Color.clone()
          const mapColor = new Color(baseColor.space, baseColor.coords, baseColor.alpha);
          for (let i = 0; i <= 2; i++) {
            mapColor.srgb[i] = Math.floor(mapColor.srgb[i] * (multiplier / 255));
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