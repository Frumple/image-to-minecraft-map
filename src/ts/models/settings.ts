export type ScaleType = 'fit' | 'fill' | 'stretch';
export type ScaleQualityType = 'pixelated' | 'low' | 'medium' | 'high';
export type ColorDifferenceType = 'euclidean' | 'metric' | 'deltae-1976' | 'cmc-1984' | 'deltae-2000';
export type DitheringType = 'none' | 'floyd-steinberg';

export class Settings {
  mapId: number = 0;

  // General Settings
  version: string = '21w16a';
  autoDownload: boolean = true;

  // Image Settings
  scale: ScaleType = 'fit';
  scaleQuality: ScaleQualityType = 'high';
  colorDifference: ColorDifferenceType = 'metric';
  dithering: DitheringType = 'none';
  transparency: number = 0.5;

  constructor() {

  }
}