import BaseContainer from '@elements/containers/base-container';

import CurrentContext from '@models/current-context';

export default class TopPanel extends BaseContainer {
  static get elementName() { return 'top-panel'; }

  versionText: HTMLSpanElement;

  constructor() {
    super();

    this.versionText = this.getShadowElement('version-text') as HTMLSpanElement;
  }

  initialize() {
    this.versionText.textContent = `v${CurrentContext.settings.appVersion}`;
  }
}