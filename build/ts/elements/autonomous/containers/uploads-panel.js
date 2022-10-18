var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import AutonomousCustomElement from '@elements/autonomous/autonomous-custom-element';
import UploadProgressPanel from '@elements/autonomous/containers/upload-progress-panel';
import CurrentContext from '@models/current-context';
const dragEnterClass = 'uploads-panel__file-upload-drop-zone_drag-enter';
export default class UploadsPanel extends AutonomousCustomElement {
    constructor() {
        super();
        // This counter is needed to prevent dragleave events from removing CSS when dragging over child elements in the drop zone.
        this.dragEnterCounter = 0;
        this.onClickChooseFileButton = (event) => {
            event.preventDefault();
            this.fileInput.click();
        };
        this.onFileSelected = () => {
            const files = this.fileInput.files;
            if (files === null) {
                throw new Error('No file selected.');
            }
            this.uploadFiles(files);
        };
        this.onFileDragEnter = () => {
            this.dragEnterCounter++;
            this.fileUploadDropZone.classList.add(dragEnterClass);
        };
        this.onFileDragLeave = () => {
            this.dragEnterCounter--;
            if (this.dragEnterCounter === 0) {
                this.fileUploadDropZone.classList.remove(dragEnterClass);
            }
        };
        this.onFileDragOver = (event) => {
            // Prevent the browser's default behaviour of opening the file when dragging the file over the drop zone.
            event.preventDefault();
        };
        this.onFileDropped = (event) => {
            var _a;
            event.preventDefault();
            const files = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.files;
            if (files) {
                this.fileUploadDropZone.classList.remove(dragEnterClass);
                this.uploadFiles(files);
            }
            else {
                throw new Error('No file data found.');
            }
        };
        this.fileInput = this.getShadowElement('file-input');
        this.uploadsContainer = this.getShadowElement('uploads-container');
        this.chooseFilesButton = this.getShadowElement('choose-files-button');
        this.fileUploadDropZone = this.getShadowElement('file-upload-drop-zone');
    }
    static get elementName() { return 'uploads-panel'; }
    initialize() {
        this.fileInput.addEventListener('change', this.onFileSelected);
        this.chooseFilesButton.addEventListener('click', this.onClickChooseFileButton);
        this.fileUploadDropZone.addEventListener('dragenter', this.onFileDragEnter);
        this.fileUploadDropZone.addEventListener('dragleave', this.onFileDragLeave);
        this.fileUploadDropZone.addEventListener('dragover', this.onFileDragOver);
        this.fileUploadDropZone.addEventListener('drop', this.onFileDropped);
    }
    uploadFiles(fileList) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = Array.from(fileList);
            const settings = CurrentContext.settings;
            for (const file of files) {
                yield this.uploadFile(settings, file);
            }
        });
    }
    uploadFile(settings, file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create and show the UI panel
            const uploadProgressPanel = new UploadProgressPanel(file.name);
            this.uploadsContainer.appendChild(uploadProgressPanel);
            // Setup a web worker to process the image in the background
            const worker = new Worker(new URL('/src/ts/workers/upload-worker.ts', import.meta.url), { type: 'module' });
            worker.addEventListener('message', (event) => {
                const parameters = event.data;
                const canvas = uploadProgressPanel.getCanvas(parameters.imageStep);
                const context = canvas.getContext('bitmaprenderer');
                context === null || context === void 0 ? void 0 : context.transferFromImageBitmap(parameters.bitmap);
            });
            // Send a message to the worker to start processing
            const messageData = {
                settings: settings,
                file: file
            };
            worker.postMessage(messageData);
        });
    }
}
