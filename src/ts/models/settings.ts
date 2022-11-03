export type ScaleType = 'fit' | 'fill' | 'stretch';
export type DitheringType = 'none' | 'floyd-steinberg';
export type ColorDifferenceType = 'euclidean' | 'metric' |  'deltae-1976' | 'cmc-1984' | 'deltae-2000';

export class Settings {
  mapId: number = 0;

  // General Settings
  version: string = '21w16a';
  autoDownload: boolean = true;

  // Image Settings
  scale: ScaleType = 'fit';
  dithering: DitheringType = 'none';
  colorDifference: ColorDifferenceType = 'metric';
  transparency: number = 0.5;

  constructor() {

  }
}