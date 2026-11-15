export type ScaleName = "pentatonic" | "minor" | "lydian" | "dorian" | "major"

export const SCALE_LABELS: Record<ScaleName, string> = {
  pentatonic: "Pentatonique",
  minor: "Mineure",
  lydian: "Lydienne",
  dorian: "Dorienne",
  major: "Majeure",
}

const DEGREES: Record<ScaleName, number[]> = {
  pentatonic: [0, 2, 4, 7, 9],
  minor: [0, 2, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
}

export function quantizeMidi(midi: number, scale: ScaleName, root = 0): number {
  const rounded = Math.round(midi)
  const pitch = ((rounded % 12) + 12) % 12
  const degrees = DEGREES[scale].map((degree) => (degree + root) % 12)
  let best = degrees[0]
  let distance = 12
  for (const degree of degrees) {
    const gap = Math.min(Math.abs(degree - pitch), 12 - Math.abs(degree - pitch))
    if (gap < distance) {
      distance = gap
      best = degree
    }
  }
  const octave = Math.floor(rounded / 12)
  let note = octave * 12 + best
  if (note - rounded > 6) note -= 12
  if (rounded - note > 6) note += 12
  return note
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}
