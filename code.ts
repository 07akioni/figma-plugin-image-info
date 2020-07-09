interface Message {
  type: 'get-image-size' | 'set-width',
  data: any
}

// bad code smell, make it works first
let getImageSizeResolver = null

function onfigmauimessage (message: Message) {
  switch (message.type) {
    case 'get-image-size':
      getImageSizeResolver(message.data)
      break;
    case 'set-width':
      console.log('set-width', message.data)
      ;(async () => {
        await alignImages(message.data.width, message.data.gutter)
        figma.closePlugin()
      })()
      break
  }
}

async function getImageInfo (bytes: Uint8Array) {
  figma.ui.postMessage({
    type: 'get-image-size',
    data: bytes
  })
  const imageInfo = await new Promise(resolve => {
    getImageSizeResolver = resolve
  })
  return imageInfo
}

interface Size { width: number, height: number }

const imageSizeMap: { [key: string]: Size } = {}
const imageContainerMap = {}

let minX = Number.MAX_SAFE_INTEGER
let minY = Number.MAX_SAFE_INTEGER

async function collectImageInfo (node) {
  for (const paint of node.fills) {
    if (paint.type === 'IMAGE') {
      const image = figma.getImageByHash(paint.imageHash)
      const bytes = await image.getBytesAsync()
      const info = await getImageInfo(bytes)
      imageSizeMap[paint.imageHash] = info as Size
      imageContainerMap[paint.imageHash] = node
      minX = Math.min(node.x, minX)
      minY = Math.min(node.y, minY)
      console.log('info', info)
    }
  }
  figma.ui.postMessage({ type: 'data-ready' })
}

async function alignImages (width, gutter) {
  let startY = minY
  let startX = minX
  for (const imageHash of Object.keys(imageContainerMap)) {
    console.log('ai', imageHash)
    const imageSize = imageSizeMap[imageHash]
    const container = imageContainerMap[imageHash] as SceneNode
    const height = width / imageSize.width * imageSize.height
    container.x = startX
    container.y = startY

    container.resize(
      width,
      height
    )
    
    startY += (height + gutter)
  }
}

;(async () => {
  try {
    figma.ui.onmessage = onfigmauimessage

    figma.showUI(__html__)

    for (const node of figma.currentPage.selection) {
      await collectImageInfo(node)
    }
  } catch (error) {
    console.log(error)
  }

  // figma.closePlugin()
})()