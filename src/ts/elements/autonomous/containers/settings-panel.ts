import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';

import CurrentContext from '@models/current-context';
import * as Settings from '@models/settings';

import { convertToInteger } from '@helpers/number-helpers';
import VersionLoader from '@loaders/version-loader';
import LocalStorageProxy from '@helpers/local-storage-proxy';

export default class SettingsPanel extends AutonomousCustomElement {
  static get elementName() { return 'settings-panel'; }

  mapIdInput: HTMLInputElement;

  minecraftVersionSelect: HTMLSelectElement;

  resizeSelect: HTMLSelectElement;
  resizeQualitySelect: HTMLSelectElement;
  backgroundSelect: HTMLSelectElement;

  colorDifferenceSelect: HTMLSelectElement;
  ditheringSelect: HTMLSelectElement;
  transparencyInputText: HTMLInputElement;
  transparencyInputRange: HTMLInputElement;

  autoDownloadInput: HTMLInputElement;

  constructor() {
    super();

    this.mapIdInput = this.getShadowElement('map-id-input') as HTMLInputElement;

    this.minecraftVersionSelect = this.getShadowElement('minecraft-version-select') as HTMLSelectElement;

    this.resizeSelect = this.getShadowElement('resize-select') as HTMLSelectElement;
    this.resizeQualitySelect = this.getShadowElement('resize-quality-select') as HTMLSelectElement;
    this.backgroundSelect = this.getShadowElement('background-select') as HTMLSelectElement;

    this.colorDifferenceSelect = this.getShadowElement('color-difference-select') as HTMLSelectElement;
    this.ditheringSelect = this.getShadowElement('dithering-select') as HTMLSelectElement;
    this.transparencyInputText = this.getShadowElement('transparency-input-text') as HTMLInputElement;
    this.transparencyInputRange = this.getShadowElement('transparency-input-range') as HTMLInputElement;

    this.autoDownloadInput = this.getShadowElement('auto-download-input') as HTMLInputElement;
  }

  initialize() {
    this.populateMinecraftVersions();

    this.populateOptions(this.resizeSelect, Settings.resizeAttributes);
    this.populateOptions(this.resizeQualitySelect, Settings.resizeQualityAttributes);
    this.populateOptions(this.backgroundSelect, Settings.backgroundAttributes);

    this.populateOptions(this.colorDifferenceSelect, Settings.colorDifferenceAttributes);
    this.populateOptions(this.ditheringSelect, Settings.ditheringAttributes);

    this.populateSettings();

    this.mapIdInput.addEventListener('input', this.onChangeSettings);

    this.minecraftVersionSelect.addEventListener('input', this.onChangeSettings);

    this.resizeSelect.addEventListener('input', this.onChangeSettings);
    this.resizeQualitySelect.addEventListener('input', this.onChangeSettings);
    this.backgroundSelect.addEventListener('input', this.onChangeSettings);

    this.colorDifferenceSelect.addEventListener('input', this.onChangeSettings);
    this.ditheringSelect.addEventListener('input', this.onChangeSettings);
    this.transparencyInputText.addEventListener('input', this.onChangeSettings);
    this.transparencyInputRange.addEventListener('input', this.onChangeSettings);

    this.autoDownloadInput.addEventListener('input', this.onChangeSettings);
  }

  private populateMinecraftVersions() {
    for (const minecraftVersion of VersionLoader.javaVersions.values()) {
      // Only add "major" versions with the name attribute, snapshots without the name attribute are intentionally excluded
      if (minecraftVersion.name !== null) {
        const optionElement = new Option(minecraftVersion.name, minecraftVersion.id);
        this.minecraftVersionSelect.add(optionElement);
      }
    }

    // Select the last (latest) version by default
    const lastOptionElement = this.minecraftVersionSelect.options[this.minecraftVersionSelect.options.length - 1];
    lastOptionElement.selected = true;
    lastOptionElement.defaultSelected = true;
  }

  private populateOptions(selectElement: HTMLSelectElement, displayTextMap: Map<string, Settings.SettingAttributes>) {
    for (const [key, value] of displayTextMap) {
      const optionElement = new Option(value.displayText, key);
      selectElement.add(optionElement);

      if (value.defaultSelected) {
        optionElement.selected = true;
        optionElement.defaultSelected = true;
      }
    }
  }

  private populateSettings() {
    const settings = CurrentContext.settings;

    this.mapIdInput.value = settings.mapId.toString();

    this.minecraftVersionSelect.value = settings.minecraftVersion;

    this.resizeSelect.value = settings.resize;
    this.resizeQualitySelect.value = settings.resizeQuality;
    this.backgroundSelect.value = settings.background;

    this.colorDifferenceSelect.value = settings.colorDifference;
    this.ditheringSelect.value = settings.dithering;
    this.transparencyInputText.value = settings.transparency.toString();
    this.transparencyInputRange.value = settings.transparency.toString();

    this.autoDownloadInput.checked = settings.autoDownload;
  }

  onChangeSettings = (event: Event) => {
    const settings = CurrentContext.settings;

    settings.mapId = parseInt(this.mapIdInput.value);

    settings.minecraftVersion = this.minecraftVersionSelect.value;

    settings.resize = this.resizeSelect.value as Settings.ResizeType;
    settings.resizeQuality = this.resizeQualitySelect.value as Settings.ResizeQualityType;
    settings.background = this.backgroundSelect.value as Settings.BackgroundType;

    settings.colorDifference = this.colorDifferenceSelect.value as Settings.ColorDifferenceType;
    settings.dithering = this.ditheringSelect.value as Settings.DitheringType;

    if (event.target === this.transparencyInputText) {
      this.transparencyInputRange.value = this.transparencyInputText.value;
    } else if (event.target === this.transparencyInputRange) {
      this.transparencyInputText.value = this.transparencyInputRange.value;
    }

    const transparency = convertToInteger(this.transparencyInputText.value);
    if (transparency === null) {
      throw new Error('Transparency is null.');
    }
    settings.transparency = transparency;

    settings.autoDownload = this.autoDownloadInput.checked;

    LocalStorageProxy.saveSettings(settings);
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