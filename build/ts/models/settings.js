export class Settings {
    constructor() {
        this.mapId = 0;
        // Minecraft Settings
        this.colorPalette = "1.17";
        // Image Settings
        this.scale = "fit";
        this.dithering = "none";
    }
    clone() {
        return structuredClone(this);
    }
}
