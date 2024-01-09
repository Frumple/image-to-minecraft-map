import BaseContainer from '@elements/containers/base-container';
import IntegerInput from '@elements/integer-input';

import CurrentContext from '@models/current-context';
import * as Settings from '@models/settings';

import VersionLoader from '@loaders/version-loader';
import LocalStorageProxy from '@helpers/local-storage-proxy';

export default class SettingsPanel extends BaseContainer {
  static get elementName() { return 'settings-panel'; }

  mapIdInput: IntegerInput;

  minecraftVersionSelect: HTMLSelectElement;
  numberOfMapsHorizontalInput: IntegerInput;
  numberOfMapsVerticalInput: IntegerInput;

  resizeSelect: HTMLSelectElement;
  resizeQualitySelect: HTMLSelectElement;
  backgroundSelect: HTMLSelectElement;

  colorDifferenceSelect: HTMLSelectElement;
  ditheringSelect: HTMLSelectElement;
  transparencyInputNumber: IntegerInput;
  transparencyInputRange: IntegerInput;

  autoDownloadSelect: HTMLSelectElement;

  constructor() {
    super();

    this.mapIdInput = this.getShadowElement('map-id-input') as IntegerInput;

    this.minecraftVersionSelect = this.getShadowElement('minecraft-version-select') as HTMLSelectElement;
    this.numberOfMapsHorizontalInput = this.getShadowElement('number-of-maps-horizontal-input') as IntegerInput;
    this.numberOfMapsVerticalInput = this.getShadowElement('number-of-maps-vertical-input') as IntegerInput;

    this.resizeSelect = this.getShadowElement('resize-select') as HTMLSelectElement;
    this.resizeQualitySelect = this.getShadowElement('resize-quality-select') as HTMLSelectElement;
    this.backgroundSelect = this.getShadowElement('background-select') as HTMLSelectElement;

    this.colorDifferenceSelect = this.getShadowElement('color-difference-select') as HTMLSelectElement;
    this.ditheringSelect = this.getShadowElement('dithering-select') as HTMLSelectElement;
    this.transparencyInputNumber = this.getShadowElement('transparency-input-text') as IntegerInput;
    this.transparencyInputRange = this.getShadowElement('transparency-input-range') as IntegerInput;

    this.autoDownloadSelect = this.getShadowElement('auto-download-select') as HTMLSelectElement;
  }

  initialize() {
    this.mapIdInput.width = '6em';
    this.mapIdInput.value = 0;
    this.mapIdInput.min = 0;
    this.mapIdInput.max = 4294967296;

    this.numberOfMapsHorizontalInput.width = '100%';
    this.numberOfMapsHorizontalInput.value = 1;
    this.numberOfMapsHorizontalInput.min = 1;
    this.numberOfMapsHorizontalInput.max = 10;

    this.numberOfMapsVerticalInput.width = '100%';
    this.numberOfMapsVerticalInput.value = 1;
    this.numberOfMapsVerticalInput.min = 1;
    this.numberOfMapsVerticalInput.max = 10;

    this.transparencyInputNumber.width = '100%';
    this.transparencyInputNumber.value = 128;
    this.transparencyInputNumber.min = 0;
    this.transparencyInputNumber.max = 255;

    this.transparencyInputRange.type = 'range';
    this.transparencyInputRange.width = '100%';
    this.transparencyInputRange.value = 128;
    this.transparencyInputRange.min = 0;
    this.transparencyInputRange.max = 255;

    this.populateMinecraftVersions();

    this.populateOptions(this.resizeSelect, Settings.resizeAttributes);
    this.populateOptions(this.resizeQualitySelect, Settings.resizeQualityAttributes);
    this.populateOptions(this.backgroundSelect, Settings.backgroundAttributes);

    this.populateOptions(this.colorDifferenceSelect, Settings.colorDifferenceAttributes);
    this.populateOptions(this.ditheringSelect, Settings.ditheringAttributes);
    this.populateOptions(this.autoDownloadSelect, Settings.automaticDownloadAttributes);

    this.populateSettings();
  }

  private populateMinecraftVersions(): void {
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

  private populateOptions(selectElement: HTMLSelectElement, displayTextMap: Map<string, Settings.SettingAttributes>): void {
    for (const [key, value] of displayTextMap) {
      const optionElement = new Option(value.displayText, key);
      selectElement.add(optionElement);

      if (value.defaultSelected) {
        optionElement.selected = true;
        optionElement.defaultSelected = true;
      }
    }
  }

  private populateSettings(): void {
    const settings = CurrentContext.settings;

    this.mapIdInput.value = settings.mapId;

    this.minecraftVersionSelect.value = settings.minecraftVersion;
    this.numberOfMapsHorizontalInput.value = settings.numberOfMapsHorizontal;
    this.numberOfMapsVerticalInput.value = settings.numberOfMapsVertical;

    this.resizeSelect.value = settings.resize;
    this.resizeQualitySelect.value = settings.resizeQuality;
    this.backgroundSelect.value = settings.background;

    this.colorDifferenceSelect.value = settings.colorDifference;
    this.ditheringSelect.value = settings.dithering;
    this.transparencyInputNumber.value = settings.transparency;
    this.transparencyInputRange.value = settings.transparency;

    this.autoDownloadSelect.value = settings.autoDownload;
  }

  // These event listeners are explicitly registered after the IntegerInput event listeners.
  // This ensures that IntegerInput can correct any invalid values ("null" or values outside minimum/maximum)
  // before the IntegerInput values are stored into the settings in local storage.
  registerEventListeners(): void {
    this.mapIdInput.addEventListener('input', this.onChangeSettings);

    this.minecraftVersionSelect.addEventListener('input', this.onChangeSettings);
    this.numberOfMapsHorizontalInput.addEventListener('input', this.onChangeSettings);
    this.numberOfMapsVerticalInput.addEventListener('input', this.onChangeSettings);

    this.resizeSelect.addEventListener('input', this.onChangeSettings);
    this.resizeQualitySelect.addEventListener('input', this.onChangeSettings);
    this.backgroundSelect.addEventListener('input', this.onChangeSettings);

    this.colorDifferenceSelect.addEventListener('input', this.onChangeSettings);
    this.ditheringSelect.addEventListener('input', this.onChangeSettings);
    this.transparencyInputNumber.addEventListener('input', this.onChangeSettings);
    this.transparencyInputRange.addEventListener('input', this.onChangeSettings);

    this.autoDownloadSelect.addEventListener('input', this.onChangeSettings);
  }

  onChangeSettings = (event: Event) => {
    const settings = CurrentContext.settings;
    settings.mapId = this.mapIdInput.value;

    settings.minecraftVersion = this.minecraftVersionSelect.value;
    settings.numberOfMapsHorizontal = this.numberOfMapsHorizontalInput.value;
    settings.numberOfMapsVertical = this.numberOfMapsVerticalInput.value;

    settings.resize = this.resizeSelect.value as Settings.ResizeType;
    settings.resizeQuality = this.resizeQualitySelect.value as Settings.ResizeQualityType;
    settings.background = this.backgroundSelect.value as Settings.BackgroundType;

    settings.colorDifference = this.colorDifferenceSelect.value as Settings.ColorDifferenceType;
    settings.dithering = this.ditheringSelect.value as Settings.DitheringType;

    if (event.target === this.transparencyInputNumber) {
      this.transparencyInputRange.value = this.transparencyInputNumber.value;
    } else if (event.target === this.transparencyInputRange) {
      this.transparencyInputNumber.value = this.transparencyInputRange.value;
    }

    settings.transparency = this.transparencyInputNumber.value;

    settings.autoDownload = this.autoDownloadSelect.value as Settings.AutomaticDownloadType;

    LocalStorageProxy.saveSettings(settings);
  }

  set mapId(mapId: number) {
    this.mapIdInput.value = mapId;
  }

  get mapId(): number {
    return this.mapIdInput.value;
  }
}