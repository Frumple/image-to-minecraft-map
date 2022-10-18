var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const MAP_SIZE = 128;
export function drawImageFileToCanvas(file, canvas, scaleType) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: Consider createImageBitmap options for image processing settings
        const bitmap = yield createImageBitmap(file);
        let x;
        let y;
        let width;
        let height;
        if (scaleType === 'stretch') {
            x = 0;
            y = 0;
            width = canvas.width;
            height = canvas.height;
        }
        else {
            const widthScaleFactor = canvas.width / bitmap.width;
            const heightScaleFactor = canvas.height / bitmap.height;
            let scaleFactor;
            if (scaleType === 'fit') {
                scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);
            }
            else if (scaleType === 'fill') {
                scaleFactor = Math.max(widthScaleFactor, heightScaleFactor);
            }
            else {
                throw new Error(`Unknown scale type: ${scaleType}`);
            }
            x = (canvas.width / 2) - (bitmap.width / 2) * scaleFactor;
            y = (canvas.height / 2) - (bitmap.height / 2) * scaleFactor;
            width = bitmap.width * scaleFactor;
            height = bitmap.height * scaleFactor;
        }
        const context = canvas.getContext('2d');
        context === null || context === void 0 ? void 0 : context.drawImage(bitmap, x, y, width, height);
    });
}
