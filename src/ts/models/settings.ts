export type ScaleType = 'fit' | 'fill' | 'stretch';
export type DitheringType = 'none' | 'floyd-steinberg';

export class Settings {
  mapId: number = 0;

  // Minecraft Settings
  version: string = '21w16a';

  // Image Settings
  scale: ScaleType = 'fit';
  dithering: DitheringType = 'none';
  transparency: number = 0.5;

  constructor() {

  }
}