import { describe, expect, it } from "vitest"
import { quantizeMidi } from "./scales"

describe("quantizeMidi", () => {
  it("maps a chromatic step onto the C major scale", () => {
    expect(quantizeMidi(61, "major", 0)).toBe(60)
    expect(quantizeMidi(62, "major", 0)).toBe(62)
  })

  it("keeps pentatonic notes inside the scale", () => {
    const allowed = new Set([0, 2, 4, 7, 9])
    for (let midi = 48; midi < 72; midi += 1) {
      expect(allowed.has(((quantizeMidi(midi, "pentatonic", 0) % 12) + 12) % 12)).toBe(true)
    }
  })

  it("transposes with the root", () => {
    const pitch = ((quantizeMidi(60, "major", 2) % 12) + 12) % 12
    expect([1, 11]).toContain(pitch)
  })
})
