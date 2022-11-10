export type ResizeType = 'fit' | 'fill' | 'stretch';
export type ResizeQualityType = 'pixelated' | 'low' | 'medium' | 'high';
export type BackgroundType = 'transparent' | 'black' | 'white';
export type ColorDifferenceType = 'euclidean' | 'metric' | 'deltae-1976' | 'cmc-1984' | 'deltae-2000';
export type DitheringType = 'none' | 'floyd-steinberg';

export class Settings {
  mapId: number = 0;

  // General Settings
  version: string = '21w16a';
  autoDownload: boolean = true;

  // Resize Settings
  resize: ResizeType = 'fit';
  resizeQuality: ResizeQualityType = 'high';
  background: BackgroundType = 'transparent';

  // Reduce Colors Settings
  colorDifference: ColorDifferenceType = 'metric';
  dithering: DitheringType = 'none';
  transparency: number = 128;

  constructor() {

  }
}