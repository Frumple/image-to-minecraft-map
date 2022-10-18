import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
export default class UploadProgressPanel extends AutonomousCustomElement {
    constructor(sourceImageFilename) {
        super();
        this.sourceImageFilenameHeading = this.getShadowElement('source-image-filename-heading');
        this.sourceCanvas = this.getShadowElement('source-canvas');
        this.intermediateCanvas = this.getShadowElement('intermediate-canvas');
        this.finalCanvas = this.getShadowElement('final-canvas');
        this.sourceImageFilename = sourceImageFilename;
    }
    static get elementName() { return 'upload-progress-panel'; }
    initialize() {
    }
    set sourceImageFilename(filename) {
        this.sourceImageFilenameHeading.textContent = filename;
    }
    get sourceImageFilename() {
        return this.sourceImageFilenameHeading.textContent;
    }
    getCanvas(imageStep) {
        switch (imageStep) {
            case 'source': return this.sourceCanvas;
            case 'intermediate': return this.intermediateCanvas;
            case 'final': return this.finalCanvas;
            default: throw new Error(`Unknown image step: ${imageStep}`);
        }
    }
}
