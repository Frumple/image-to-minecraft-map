import * as Settings from '@models/settings';
class CurrentContext {
    constructor() {
        this.settings = new Settings.Settings();
    }
}
export default new CurrentContext();
