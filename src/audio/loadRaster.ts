import type { Raster } from "./reading"

export function loadRaster(src: string): Promise<Raster> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext("2d", { willReadFrequently: true })
      if (!context) {
        reject(new Error("Canvas is unavailable."))
        return
      }
      context.drawImage(image, 0, 0)
      const frame = context.getImageData(0, 0, canvas.width, canvas.height)
      resolve({ data: frame.data, width: canvas.width, height: canvas.height })
    }
    image.onerror = () => reject(new Error(`Could not load ${src}`))
    image.src = src
  })
}
