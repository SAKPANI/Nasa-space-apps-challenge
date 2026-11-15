export type ColumnStats = {
  x: number
  brightness: number
  contrast: number
  density: number
  hue: number
}

export type Raster = {
  data: Uint8ClampedArray
  width: number
  height: number
}

export function pixelBrightness(data: Uint8ClampedArray, index: number): number {
  const offset = index * 4
  return (0.2126 * data[offset] + 0.7152 * data[offset + 1] + 0.0722 * data[offset + 2]) / 255
}

export function pixelHue(data: Uint8ClampedArray, index: number): number {
  const offset = index * 4
  const r = data[offset] / 255
  const g = data[offset + 1] / 255
  const b = data[offset + 2] / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (delta === 0) return 0
  let hue = 0
  if (max === r) hue = ((g - b) / delta) % 6
  else if (max === g) hue = (b - r) / delta + 2
  else hue = (r - g) / delta + 4
  return (hue * 60 + 360) % 360
}

export function columnStats(raster: Raster, x: number): ColumnStats {
  const clamped = Math.max(0, Math.min(raster.width - 1, Math.round(x)))
  let sum = 0
  let sumSq = 0
  let lights = 0
  let hueSum = 0
  for (let y = 0; y < raster.height; y += 1) {
    const index = y * raster.width + clamped
    const brightness = pixelBrightness(raster.data, index)
    sum += brightness
    sumSq += brightness * brightness
    if (brightness > 0.55) lights += 1
    hueSum += pixelHue(raster.data, index)
  }
  const count = raster.height || 1
  const mean = sum / count
  const variance = Math.max(0, sumSq / count - mean * mean)
  return {
    x: raster.width <= 1 ? 0 : clamped / (raster.width - 1),
    brightness: mean,
    contrast: Math.sqrt(variance),
    density: lights / count,
    hue: hueSum / count,
  }
}

export function scanColumns(raster: Raster): ColumnStats[] {
  return Array.from({ length: raster.width }, (_, x) => columnStats(raster, x))
}

export function loadRaster(src: string): Promise<Raster> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext("2d", { willReadFrequently: true })
      if (!context) {
        reject(new Error("Canvas indisponible."))
        return
      }
      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      resolve({ data: imageData.data, width: canvas.width, height: canvas.height })
    }
    image.onerror = () => reject(new Error(`Image illisible : ${src}`))
    image.src = src
  })
}
