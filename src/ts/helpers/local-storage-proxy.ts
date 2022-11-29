import { Settings } from '@models/settings';
import appVersionJson from '@json/app-version.json';

class LocalStorageProxy {
  readonly settingsKey: string;

  constructor() {
    this.settingsKey = 'settings';
  }

  async loadSettings(): Promise<Settings> {
    const settingsObject = await this.loadSettingsObject();
    return new Settings(settingsObject);
  }

  private async loadSettingsObject(): Promise<object> {
    const appVersion = await LocalStorageProxy.getAppVersion();
    const settingsString = localStorage.getItem(this.settingsKey);

    if (settingsString !== null) {
      const settingsObject = JSON.parse(settingsString);

      if (settingsObject.appVersion === appVersion) {
        return settingsObject;
      }
    }

    return {
      appVersion: appVersion
    }
  }

  saveSettings(settings: Settings) {
    const settingsString = JSON.stringify(settings);
    localStorage.setItem(this.settingsKey, settingsString);
  }

  clearSettings() {
    localStorage.remove(this.settingsKey);
  }

  private static async getAppVersion() {
    return appVersionJson.version;
  }
}

export default new LocalStorageProxy();