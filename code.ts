async function getImageInfo (bytes: Uint8Array) {
  figma.ui.postMessage(bytes)
  const imageInfo = await new Promise(resolve => {
    figma.ui.onmessage = value => resolve(value)
  })
  return imageInfo
}

async function printImageInfo (node) {
  for (const paint of node.fills) {
    if (paint.type === 'IMAGE') {
      const image = figma.getImageByHash(paint.imageHash)
      const bytes = await image.getBytesAsync()
      const info = await getImageInfo(bytes)
      console.log(info)
    }
  }
}

const selected = figma.currentPage.selection[0] as GeometryMixin

;(async () => {
  figma.showUI(__html__, { visible: false })
  await printImageInfo(selected)
  figma.closePlugin()
})()