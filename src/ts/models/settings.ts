export type ResizeType = 'fit' | 'fill' | 'stretch';
export type ResizeQualityType = 'pixelated' | 'low' | 'medium' | 'high';
export type BackgroundType = 'transparent' | 'black' | 'white';
export type ColorDifferenceType = 'compuphase' | 'euclidean' | 'deltae-1976' | 'cmc-1984' | 'deltae-2000';
export type DitheringType = 'none' | 'floyd-steinberg';

export interface SettingAttributes {
  displayText: string;       // Text shown in select element options and each upload progress panel
  defaultSelected?: boolean; // True if this select element option should be selected by default
}

// TODO: Is there a better way to map union types to attributes?
export const resizeAttributes = new Map<ResizeType, SettingAttributes>([
  ['fit', { displayText: 'Fit', defaultSelected: true }],
  ['fill', { displayText: 'Fill (Crop)' }],
  ['stretch', { displayText: 'Stretch' }]
]);

export const resizeQualityAttributes = new Map<ResizeQualityType, SettingAttributes>([
  ['pixelated', { displayText: 'None (Pixelated)' }],
  ['low', { displayText: 'Low' }],
  ['medium', { displayText: 'Medium' }],
  ['high', { displayText: 'High', defaultSelected: true }]
]);

export const backgroundAttributes = new Map<BackgroundType, SettingAttributes>([
  ['transparent', { displayText: 'Transparent', defaultSelected: true }],
  ['black', { displayText: 'Black' }],
  ['white', { displayText: 'White' }]
]);

export const colorDifferenceAttributes = new Map<ColorDifferenceType, SettingAttributes>([
  ['compuphase', { displayText: 'CompuPhase', defaultSelected: true }],
  ['euclidean', { displayText: 'Euclidean' }],
  ['deltae-1976', { displayText: 'DeltaE 1976' }],
  ['cmc-1984', { displayText: 'CMC 1984' }],
  ['deltae-2000', { displayText: 'DeltaE 2000' }],
]);

export const ditheringAttributes = new Map<DitheringType, SettingAttributes>([
  ['none', { displayText: 'None' }],
  ['floyd-steinberg', { displayText: 'Floyd-Steinberg', defaultSelected: true }]
]);

export class Settings {
  appVersion!: string;

  mapId: number = 0;

  // General Settings
  minecraftVersion: string = '21w16a';

  // Resize Settings
  resize: ResizeType = 'fit';
  resizeQuality: ResizeQualityType = 'high';
  background: BackgroundType = 'transparent';

  // Reduce Colors Settings
  colorDifference: ColorDifferenceType = 'compuphase';
  dithering: DitheringType = 'floyd-steinberg';
  transparency: number = 128;

  // Create Map File Settings
  autoDownload: boolean = true;

  constructor(obj: Object) {
    Object.assign(this, obj);
  }

  get resizeDisplayText() {
    return resizeAttributes.get(this.resize)?.displayText as string;
  }

  get resizeQualityDisplayText() {
    return resizeQualityAttributes.get(this.resizeQuality)?.displayText as string;
  }

  get backgroundDisplayText() {
    return backgroundAttributes.get(this.background)?.displayText as string;
  }

  get colorDifferenceDisplayText() {
    return colorDifferenceAttributes.get(this.colorDifference)?.displayText as string;
  }

  get ditheringDisplayText() {
    return ditheringAttributes.get(this.dithering)?.displayText as string;
  }

  get useLabColorSpace() {
    switch (this.colorDifference) {
      case 'compuphase':
      case 'euclidean':
        return false;
      case 'deltae-1976':
      case 'cmc-1984':
      case 'deltae-2000':
        return true;
      default:
        throw new Error(`Invalid color difference algorithm: ${this.colorDifference}`);
    }
  }
}