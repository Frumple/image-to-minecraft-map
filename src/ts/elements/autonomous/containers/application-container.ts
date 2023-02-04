import BaseContainer from '@elements/autonomous/containers/base-container';
import TopPanel from '@elements/autonomous/containers/top-panel';
import SettingsPanel from '@elements/autonomous/containers/settings-panel';
import UploadsPanel from '@elements/autonomous/containers/uploads-panel';

import { isCustomEvent } from '@helpers/event-helpers';

const hiddenClass = 'application-container_hidden';

export default class ApplicationContainer extends BaseContainer {
  static get elementName() { return 'application-container'; }

  container: HTMLDivElement;
  topPanel: TopPanel;
  settingsPanel: SettingsPanel;
  uploadsPanel: UploadsPanel;

  constructor() {
    super();

    this.container = this.getShadowElement('container') as HTMLDivElement;
    this.topPanel = this.getShadowElement('top-panel') as TopPanel;
    this.settingsPanel = this.getShadowElement('settings-panel') as SettingsPanel;
    this.uploadsPanel = this.getShadowElement('uploads-panel') as UploadsPanel;
  }

  initialize() {
    this.addEventListener('mapIdUpdated', this.onMapIdUpdated);
    this.addEventListener('dragover', this.onFileDragOver);
    this.addEventListener('drop', this.onFileDropped);
  }

  onMapIdUpdated = (event: Event) => {
    // Because of how "--strictFunctionTypes" works in TypeScript, custom events cannot be used as a parameter in an event listener.
    // Check that the Event is a CustomEvent before continuing.
    // See: https://stackoverflow.com/questions/47166369/argument-of-type-e-customevent-void-is-not-assignable-to-parameter-of-ty
    if (!isCustomEvent(event)) {
      throw new Error('Event is not a custom event.');
    }
    this.settingsPanel.mapId = event.detail.mapId;
  }

  // Prevent the browser's default behaviour of opening a file when dragging and dropping it over any area outside of the drop zone.
  onFileDragOver = (event: DragEvent) => {
    event.preventDefault();
  }
  onFileDropped = (event: DragEvent) => {
    event.preventDefault();
  }

  set visible(isVisible: boolean) {
    if(isVisible) {
      this.container.classList.remove(hiddenClass);
    } else {
      this.container.classList.add(hiddenClass);
    }
  }

  registerSettingsPanelEventListeners(): void {
    this.settingsPanel.registerEventListeners();
  }
}