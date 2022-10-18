var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MAP_SIZE, drawImageFileToCanvas } from '@helpers/image-helpers';
class UploadWorker {
    constructor() {
        this.onMessageReceived = (event) => {
            const parameters = event.data;
            this.settings = parameters.settings;
            this.file = parameters.file;
            this.run();
        };
        this.workCanvas = new OffscreenCanvas(MAP_SIZE, MAP_SIZE);
        self.addEventListener('message', this.onMessageReceived);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.drawSourceImage();
            yield this.processImage();
        });
    }
    drawSourceImage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield drawImageFileToCanvas(this.file, this.workCanvas, 'fit');
            const bitmap = this.workCanvas.transferToImageBitmap();
            const messageData = {
                imageStep: 'source',
                bitmap: bitmap
            };
            postMessage(messageData, [bitmap]);
        });
    }
    processImage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield drawImageFileToCanvas(this.file, this.workCanvas, this.settings.scale);
            const bitmap = this.workCanvas.transferToImageBitmap();
            const messageData = {
                imageStep: 'intermediate',
                bitmap: bitmap
            };
            postMessage(messageData, [bitmap]);
        });
    }
}
const worker = new UploadWorker();
