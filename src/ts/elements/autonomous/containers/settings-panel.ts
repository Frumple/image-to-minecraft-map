import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';

import CurrentContext from '@models/current-context';
import * as Settings from '@models/settings';

import { convertToInteger } from '@helpers/number-helpers';

export default class SettingsPanel extends AutonomousCustomElement {
  static get elementName() { return 'settings-panel'; }

  mapIdInput: HTMLInputElement;

  paletteSelect: HTMLSelectElement;
  scaleSelect: HTMLSelectElement;
  ditheringSelect: HTMLSelectElement;

  constructor() {
    super();

    this.mapIdInput = this.getShadowElement('map-id-input') as HTMLInputElement;

    this.paletteSelect = this.getShadowElement('palette-select') as HTMLSelectElement;

    this.scaleSelect = this.getShadowElement('scale-select') as HTMLSelectElement;
    this.ditheringSelect = this.getShadowElement('dithering-select') as HTMLSelectElement;
  }

  initialize() {
    this.mapIdInput.addEventListener('input', this.onChangeSettings);

    this.paletteSelect.addEventListener('input', this.onChangeSettings);

    this.scaleSelect.addEventListener('input', this.onChangeSettings);
    this.ditheringSelect.addEventListener('input', this.onChangeSettings);
  }

  onChangeSettings = () => {
    CurrentContext.settings.mapId = parseInt(this.mapIdInput.value);

    CurrentContext.settings.colorPalette = this.paletteSelect.value as Settings.ColorPaletteType;

    CurrentContext.settings.scale = this.scaleSelect.value as Settings.ScaleType;
    CurrentContext.settings.dithering = this.ditheringSelect.value as Settings.DitheringType;
  }

  set mapId(mapId: number) {
    this.mapIdInput.value = mapId.toString();
  }

  get mapId(): number {
    const value = this.mapIdInput.value;
    const result = convertToInteger(value);
    if (result === null) {
      throw new Error(`Could not convert map id value '${value}' to integer.`);
    }
    return result;
  }
}