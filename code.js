var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// bad code smell, make it works first
let getImageSizeResolver = null;
function onfigmauimessage(message) {
    switch (message.type) {
        case 'get-image-size':
            getImageSizeResolver(message.data);
            break;
        case 'set-width':
            console.log('set-width', message.data);
            (() => __awaiter(this, void 0, void 0, function* () {
                yield alignImages(message.data.width, message.data.gutter);
                figma.closePlugin();
            }))();
            break;
    }
}
function getImageInfo(bytes) {
    return __awaiter(this, void 0, void 0, function* () {
        figma.ui.postMessage({
            type: 'get-image-size',
            data: bytes
        });
        const imageInfo = yield new Promise(resolve => {
            getImageSizeResolver = resolve;
        });
        return imageInfo;
    });
}
const imageSizeMap = {};
const imageContainerMap = {};
let minX = Number.MAX_SAFE_INTEGER;
let minY = Number.MAX_SAFE_INTEGER;
function collectImageInfo(node) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const paint of node.fills) {
            if (paint.type === 'IMAGE') {
                const image = figma.getImageByHash(paint.imageHash);
                const bytes = yield image.getBytesAsync();
                const info = yield getImageInfo(bytes);
                imageSizeMap[paint.imageHash] = info;
                imageContainerMap[paint.imageHash] = node;
                minX = Math.min(node.x, minX);
                minY = Math.min(node.y, minY);
                console.log('info', info);
            }
        }
        figma.ui.postMessage({ type: 'data-ready' });
    });
}
function alignImages(width, gutter) {
    return __awaiter(this, void 0, void 0, function* () {
        let startY = minY;
        let startX = minX;
        for (const imageHash of Object.keys(imageContainerMap)) {
            console.log('ai', imageHash);
            const imageSize = imageSizeMap[imageHash];
            const container = imageContainerMap[imageHash];
            const height = width / imageSize.width * imageSize.height;
            container.x = startX;
            container.y = startY;
            container.resize(width, height);
            startY += (height + gutter);
        }
    });
}
;
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        figma.ui.onmessage = onfigmauimessage;
        figma.showUI(__html__);
        for (const node of figma.currentPage.selection) {
            yield collectImageInfo(node);
        }
    }
    catch (error) {
        console.log(error);
    }
    // figma.closePlugin()
}))();
