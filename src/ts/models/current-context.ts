import * as Settings from '@models/settings';

class CurrentContext {
  settings: Settings.Settings;

  constructor() {
    this.settings = new Settings.Settings();
  }
}

export default new CurrentContext();