import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
import CurrentContext from '@models/current-context';
export default class SettingsPanel extends AutonomousCustomElement {
    constructor() {
        super();
        this.onChangeSettings = () => {
            CurrentContext.settings.mapId = parseInt(this.mapIdInput.value);
            CurrentContext.settings.colorPalette = this.paletteSelect.value;
            CurrentContext.settings.scale = this.scaleSelect.value;
            CurrentContext.settings.dithering = this.ditheringSelect.value;
        };
        this.mapIdInput = this.getShadowElement('map-id-input');
        this.paletteSelect = this.getShadowElement('palette-select');
        this.scaleSelect = this.getShadowElement('scale-select');
        this.ditheringSelect = this.getShadowElement('dithering-select');
    }
    static get elementName() { return 'settings-panel'; }
    initialize() {
        this.mapIdInput.addEventListener('input', this.onChangeSettings);
        this.paletteSelect.addEventListener('input', this.onChangeSettings);
        this.scaleSelect.addEventListener('input', this.onChangeSettings);
        this.ditheringSelect.addEventListener('input', this.onChangeSettings);
    }
}
