import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';

import CurrentContext from '@models/current-context';
import * as Settings from '@models/settings';

import { convertToInteger } from '@helpers/number-helpers';
import VersionLoader from '@loaders/version-loader';

export default class SettingsPanel extends AutonomousCustomElement {
  static get elementName() { return 'settings-panel'; }

  mapIdInput: HTMLInputElement;

  versionSelect: HTMLSelectElement;
  autoDownloadInput: HTMLInputElement;

  scaleSelect: HTMLSelectElement;
  scaleQualitySelect: HTMLSelectElement;
  backgroundSelect: HTMLSelectElement;
  colorDifferenceSelect: HTMLSelectElement;
  ditheringSelect: HTMLSelectElement;
  transparencyInputText: HTMLInputElement;
  transparencyInputRange: HTMLInputElement;

  constructor() {
    super();

    this.mapIdInput = this.getShadowElement('map-id-input') as HTMLInputElement;

    this.versionSelect = this.getShadowElement('version-select') as HTMLSelectElement;
    this.autoDownloadInput = this.getShadowElement('auto-download-input') as HTMLInputElement;

    this.scaleSelect = this.getShadowElement('scale-select') as HTMLSelectElement;
    this.scaleQualitySelect = this.getShadowElement('scale-quality-select') as HTMLSelectElement;
    this.backgroundSelect = this.getShadowElement('background-select') as HTMLSelectElement;
    this.colorDifferenceSelect = this.getShadowElement('color-difference-select') as HTMLSelectElement;
    this.ditheringSelect = this.getShadowElement('dithering-select') as HTMLSelectElement;
    this.transparencyInputText = this.getShadowElement('transparency-input-text') as HTMLInputElement;
    this.transparencyInputRange = this.getShadowElement('transparency-input-range') as HTMLInputElement;
  }

  initialize() {
    for (const version of VersionLoader.javaVersions.values()) {
      // Only add "major" versions with the name attribute, snapshots without the name attribute are intentionally excluded
      if (version.name !== null) {
        const optionElement = new Option(version.name, version.id);
        this.versionSelect.add(optionElement);
      }
    }

    // Select the last (latest) version by default
    const lastOptionElement = this.versionSelect.options[this.versionSelect.options.length - 1];
    lastOptionElement.selected = true;
    lastOptionElement.defaultSelected = true;

    this.mapIdInput.addEventListener('input', this.onChangeSettings);

    this.versionSelect.addEventListener('input', this.onChangeSettings);
    this.autoDownloadInput.addEventListener('input', this.onChangeSettings);

    this.scaleSelect.addEventListener('input', this.onChangeSettings);
    this.scaleQualitySelect.addEventListener('input', this.onChangeSettings);
    this.backgroundSelect.addEventListener('input', this.onChangeSettings);
    this.colorDifferenceSelect.addEventListener('input', this.onChangeSettings);
    this.ditheringSelect.addEventListener('input', this.onChangeSettings);
    this.transparencyInputText.addEventListener('input', this.onChangeSettings);
    this.transparencyInputRange.addEventListener('input', this.onChangeSettings);
  }

  onChangeSettings = (event: Event) => {
    CurrentContext.settings.mapId = parseInt(this.mapIdInput.value);

    CurrentContext.settings.version = this.versionSelect.value;
    CurrentContext.settings.autoDownload = this.autoDownloadInput.checked;

    CurrentContext.settings.scale = this.scaleSelect.value as Settings.ScaleType;
    CurrentContext.settings.scaleQuality = this.scaleQualitySelect.value as Settings.ScaleQualityType;
    CurrentContext.settings.background = this.backgroundSelect.value as Settings.BackgroundType;
    CurrentContext.settings.colorDifference = this.colorDifferenceSelect.value as Settings.ColorDifferenceType;
    CurrentContext.settings.dithering = this.ditheringSelect.value as Settings.DitheringType;

    if (event.target === this.transparencyInputText) {
      this.transparencyInputRange.value = this.transparencyInputText.value;
    } else if (event.target === this.transparencyInputRange) {
      this.transparencyInputText.value = this.transparencyInputRange.value;
    }

    const transparency = convertToInteger(this.transparencyInputText.value);
    if (transparency === null) {
      throw new Error('Transparency is null.');
    }
    CurrentContext.settings.transparency = transparency;
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