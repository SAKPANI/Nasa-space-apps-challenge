import { clamp01 } from "../globe/geo"

export type VoicePlan = {
  gain: number
  rateHz: number
  midi: number
  voices: number
  cutoff: number
}

/**
 * Every axis moves in one direction as `t` rises.
 * Vegetation pitch falls on purpose: a dry note thins upward, a living forest sits lower and fuller.
 * Air cutoff falls on purpose: dirtier air muffles the tone. Gain still rises, so pollution never sounds softer.
 */
export function voicePlan(id: string, t: number): VoicePlan {
  const x = clamp01(t)
  switch (id) {
    case "night":
      return { gain: 0.08 + x * 0.55, rateHz: 0.45 + x * 4.2, midi: 46, voices: 1, cutoff: 400 + x * 1800 }
    case "aerosols":
      return { gain: x * 0.52, rateHz: 0, midi: 0, voices: 1, cutoff: 700 + x * 2400 }
    case "ndvi":
      return {
        gain: 0.06 + x * 0.5,
        rateHz: 0,
        midi: Math.round(76 - x * 24),
        voices: x < 0.34 ? 1 : x < 0.67 ? 2 : 3,
        cutoff: 480 + x * 1700,
      }
    case "air":
      return { gain: 0.03 + x * 0.5, rateHz: 0, midi: 0, voices: 1, cutoff: 2800 - x * 2350 }
    case "sst":
      return { gain: 0.12 + x * 0.3, rateHz: 0, midi: Math.round(40 + x * 16), voices: 1, cutoff: 280 + x * 980 }
    case "lightning":
      return {
        gain: x < 0.12 ? 0 : 0.16 + x * 0.5,
        rateHz: x < 0.12 ? 0 : 0.35 + x * 7,
        midi: 38,
        voices: 1,
        cutoff: 900 + x * 2200,
      }
    default:
      return { gain: 0, rateHz: 0, midi: 60, voices: 1, cutoff: 1000 }
  }
}
