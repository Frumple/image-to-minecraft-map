import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
import TopPanel from '@elements/autonomous/containers/top-panel';
import SettingsPanel from '@elements/autonomous/containers/settings-panel';
import UploadsPanel from '@elements/autonomous/containers/uploads-panel';

export default class ApplicationContainer extends AutonomousCustomElement {
  static get elementName() { return 'application-container'; }

  topPanel: TopPanel;
  settingsPanel: SettingsPanel;
  uploadsPanel: UploadsPanel;

  constructor() {
    super();

    this.topPanel = this.getShadowElement('top-panel') as TopPanel;
    this.settingsPanel = this.getShadowElement('settings-panel') as SettingsPanel;
    this.uploadsPanel = this.getShadowElement('uploads-panel') as UploadsPanel;
  }

  initialize() {
    this.addEventListener('mapIdUpdated', this.onMapIdUpdated);
  }

  onMapIdUpdated = (event: Event) => {
    // TODO: Weirdly, using a CustomEvent as a parameter doesn't fit the parameter definitions for addEventListener
    const customEvent = event as CustomEvent;
    this.settingsPanel.mapId = customEvent.detail.mapId;
  }
}