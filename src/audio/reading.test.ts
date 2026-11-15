import { describe, expect, it } from "vitest"
import { phenomena, type Rgba } from "../data/phenomena"
import { latLonToUv, latLonToVector, uvToLatLon } from "../globe/geo"
import { voicePlan } from "./voicePlan"

describe("equirectangular mapping", () => {
  it("round-trips a coordinate through uv", () => {
    const uv = latLonToUv(6.17, 1.23)
    const back = uvToLatLon(uv.u, uv.v)
    expect(back.lat).toBeCloseTo(6.17, 4)
    expect(back.lon).toBeCloseTo(1.23, 4)
  })

  it("places the north pole on the positive Y axis", () => {
    const [x, y, z] = latLonToVector(90, 0, 2)
    expect(y).toBeCloseTo(2, 5)
    expect(Math.hypot(x, z)).toBeLessThan(0.001)
  })
})

describe("voice plans stay monotonic", () => {
  const steps = [0, 0.25, 0.5, 0.75, 1]

  it("never lets a higher reading get quieter", () => {
    for (const phenomenon of phenomena) {
      const gains = steps.map((t) => voicePlan(phenomenon.id, t).gain)
      for (let i = 1; i < gains.length; i += 1) expect(gains[i]).toBeGreaterThanOrEqual(gains[i - 1])
    }
  })

  it("raises night pulse rate and lowers the air filter as the value rises", () => {
    expect(voicePlan("night", 0.9).rateHz).toBeGreaterThan(voicePlan("night", 0.1).rateHz)
    expect(voicePlan("air", 0.9).cutoff).toBeLessThan(voicePlan("air", 0.1).cutoff)
    expect(voicePlan("ndvi", 0.9).midi).toBeLessThan(voicePlan("ndvi", 0.1).midi)
    expect(voicePlan("ndvi", 0.9).voices).toBeGreaterThan(voicePlan("ndvi", 0.1).voices)
    expect(voicePlan("sst", 0.9).midi).toBeGreaterThan(voicePlan("sst", 0.1).midi)
  })
})

describe("picture readings", () => {
  function climb(id: string, pixels: Rgba[]) {
    const values = pixels.map((pixel) => phenomena.find((item) => item.id === id)!.measure(pixel).t)
    for (let i = 1; i < values.length; i += 1) expect(values[i]).toBeGreaterThan(values[i - 1])
  }

  it("reads a brighter night as more radiance", () => {
    climb("night", [
      { r: 2, g: 2, b: 2 },
      { r: 40, g: 40, b: 40 },
      { r: 220, g: 210, b: 180 },
    ])
  })

  it("reads greener vegetation as a higher index", () => {
    climb("ndvi", [
      { r: 180, g: 140, b: 90 },
      { r: 90, g: 140, b: 70 },
      { r: 30, g: 170, b: 40 },
    ])
  })

  it("reads a redder sea as warmer", () => {
    climb("sst", [
      { r: 80, g: 140, b: 210 },
      { r: 230, g: 180, b: 120 },
      { r: 220, g: 60, b: 40 },
    ])
  })

  it("does not invent a sea temperature on a dark land pixel", () => {
    const land = phenomena.find((item) => item.id === "sst")!.measure({ r: 4, g: 4, b: 4 })
    expect(land.gap).toBe(true)
    expect(land.nasa.toLowerCase()).toContain("no sea-surface")
  })
})
