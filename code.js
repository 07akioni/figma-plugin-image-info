var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getImageInfo(bytes) {
    return __awaiter(this, void 0, void 0, function* () {
        figma.ui.postMessage(bytes);
        const imageInfo = yield new Promise((resolve, reject) => {
            figma.ui.onmessage = value => resolve(value);
        });
        return imageInfo;
    });
}
function printImageInfo(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const newFills = [];
        for (const paint of node.fills) {
            if (paint.type === 'IMAGE') {
                const image = figma.getImageByHash(paint.imageHash);
                const bytes = yield image.getBytesAsync();
                const info = yield getImageInfo(bytes);
                console.log(info);
            }
        }
    });
}
const selected = figma.currentPage.selection[0];
(() => __awaiter(this, void 0, void 0, function* () {
    figma.showUI(__html__, { visible: false });
    yield printImageInfo(selected);
    figma.closePlugin();
}))();
