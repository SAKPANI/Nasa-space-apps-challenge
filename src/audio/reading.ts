import { bandFor, phenomenonById, type Band, type Measure, type Rgba } from "../data/phenomena"
import { latLonToPixel } from "../globe/geo"

export type Raster = {
  data: Uint8ClampedArray
  width: number
  height: number
}

export type Reading = Measure & {
  id: string
  band: Band
  hear: string
  life: string
}

export function samplePixel(raster: Raster, lat: number, lon: number): Rgba {
  const { x, y } = latLonToPixel(lat, lon, raster.width, raster.height)
  const offset = (y * raster.width + x) * 4
  return {
    r: raster.data[offset] ?? 0,
    g: raster.data[offset + 1] ?? 0,
    b: raster.data[offset + 2] ?? 0,
  }
}

export function readPlace(id: string, raster: Raster, lat: number, lon: number, place?: string): Reading {
  const phenomenon = phenomenonById(id)
  const measure = phenomenon.measure(samplePixel(raster, lat, lon))
  const band = measure.gap ? "low" : bandFor(measure.t)
  const life = measure.gap
    ? "You are not over a measurement. The voice for this layer rests until the picture has something to say."
    : place
      ? `${place}. ${phenomenon.life[band]}`
      : phenomenon.life[band]
  const hear = measure.gap ? "Silence. There is nothing here for this layer to play." : phenomenon.hear[band]
  return { id, band, hear, life, ...measure }
}
