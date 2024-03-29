import LocalStorageProxy from '@helpers/local-storage-proxy';
import { Settings } from '@models/settings';

class CurrentContext {
  settings!: Settings;

  constructor() {
  }

  async init(): Promise<void> {
    const settings = await LocalStorageProxy.loadSettings();
    this.settings = settings;
  }
}

export default new CurrentContext();