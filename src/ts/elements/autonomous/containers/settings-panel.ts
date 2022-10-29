import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';

import CurrentContext from '@models/current-context';
import * as Settings from '@models/settings';

import { convertToInteger } from '@helpers/number-helpers';
import VersionLoader from '@loaders/version-loader';

export default class SettingsPanel extends AutonomousCustomElement {
  static get elementName() { return 'settings-panel'; }

  mapIdInput: HTMLInputElement;

  versionSelect: HTMLSelectElement;
  scaleSelect: HTMLSelectElement;
  ditheringSelect: HTMLSelectElement;

  constructor() {
    super();

    this.mapIdInput = this.getShadowElement('map-id-input') as HTMLInputElement;

    this.versionSelect = this.getShadowElement('version-select') as HTMLSelectElement;

    this.scaleSelect = this.getShadowElement('scale-select') as HTMLSelectElement;
    this.ditheringSelect = this.getShadowElement('dithering-select') as HTMLSelectElement;
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

    this.scaleSelect.addEventListener('input', this.onChangeSettings);
    this.ditheringSelect.addEventListener('input', this.onChangeSettings);
  }

  onChangeSettings = () => {
    CurrentContext.settings.mapId = parseInt(this.mapIdInput.value);

    CurrentContext.settings.version = this.versionSelect.value;

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