import { describe, expect, it } from "vitest"
import { columnStats, pixelBrightness } from "./analyzer"

describe("pixel analysis", () => {
  it("reads white as full brightness and black as silence", () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255])
    expect(pixelBrightness(data, 0)).toBeCloseTo(1)
    expect(pixelBrightness(data, 1)).toBe(0)
  })

  it("reports a bright column as dense and a dark column as empty", () => {
    const width = 2
    const height = 4
    const data = new Uint8ClampedArray(width * height * 4)
    for (let y = 0; y < height; y += 1) {
      const index = (y * width) * 4
      data[index] = 255
      data[index + 1] = 255
      data[index + 2] = 255
      data[index + 3] = 255
    }
    const bright = columnStats({ data, width, height }, 0)
    const dark = columnStats({ data, width, height }, 1)
    expect(bright.brightness).toBeGreaterThan(0.9)
    expect(bright.density).toBe(1)
    expect(dark.brightness).toBe(0)
    expect(dark.density).toBe(0)
  })
})
