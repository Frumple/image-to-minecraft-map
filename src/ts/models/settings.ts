export type ColorPaletteType = '1.17';

export type ScaleType = 'fit' | 'fill' | 'stretch';
export type DitheringType = 'none' | 'floyd-steinberg';

export class Settings {
  mapId: number = 0;

  // Minecraft Settings
  colorPalette: ColorPaletteType = "1.17";

  // Image Settings
  scale: ScaleType = "fit";
  dithering: DitheringType = "none";

  constructor() {

  }
}