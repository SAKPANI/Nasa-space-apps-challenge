import type * as ToneType from "tone"
import type { ColumnStats } from "./analyzer"
import type { Family } from "../data/tracks"
import { quantizeMidi, type ScaleName } from "./scales"

export class SonoraEngine {
  private started = false
  private tone: typeof ToneType | null = null
  private output: ToneType.Gain | null = null
  private filter: ToneType.Filter | null = null
  private panner: ToneType.Panner | null = null
  private pad: ToneType.PolySynth | null = null
  private lead: ToneType.Synth | null = null
  private drum: ToneType.MembraneSynth | null = null
  private meter: ToneType.Analyser | null = null
  private lastMidi = -1
  private step = 0

  async start(): Promise<void> {
    this.tone = await import("tone")
    await this.tone.start()
    if (this.started) return
    const Tone = this.tone
    this.output = new Tone.Gain(0.45).toDestination()
    this.meter = new Tone.Analyser("waveform", 256)
    this.panner = new Tone.Panner(0)
    this.filter = new Tone.Filter(900, "lowpass")
    this.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.35, decay: 0.2, sustain: 0.5, release: 1.1 },
    })
    this.lead = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.02, decay: 0.12, sustain: 0.25, release: 0.35 },
    })
    this.drum = new Tone.MembraneSynth({
      pitchDecay: 0.02,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.05 },
    })
    this.pad.connect(this.filter)
    this.lead.connect(this.filter)
    this.filter.connect(this.panner)
    this.panner.connect(this.output)
    this.drum.connect(this.output)
    this.output.connect(this.meter)
    this.started = true
  }

  setVolume(amount: number): void {
    this.output?.gain.rampTo(Math.max(0, Math.min(1, amount)), 0.05)
  }

  waveform(): Float32Array | null {
    const value = this.meter?.getValue()
    return value instanceof Float32Array ? value : null
  }

  play(column: ColumnStats, family: Family, scale: ScaleName, y = 0.5): boolean {
    const Tone = this.tone
    if (!this.started || !Tone || !this.pad || !this.lead || !this.drum || !this.filter || !this.panner) return false
    this.step += 1
    const rootShift = Math.round(column.hue / 30) % 12
    const height = family === "melody" && column.brightness > 0.45 ? 1 - column.brightness : 1 - y
    const midi = quantizeMidi(48 + height * 20 + column.brightness * 6, scale, rootShift)
    const note = Tone.Frequency(midi, "midi").toNote()
    this.panner.pan.rampTo(column.x * 2 - 1, 0.05)
    this.filter.frequency.rampTo(280 + column.brightness * 4200, 0.08)
    let struck = false
    if (family === "drums") {
      if (column.density > 0.01) {
        this.drum.triggerAttackRelease(note, "16n")
        struck = true
      }
      return struck
    }
    const length = column.contrast > 0.18 ? "16n" : "8n"
    if ((family === "pad" || family === "texture" || family === "chords") && this.step % 5 === 0) {
      const intervals = family === "pad" && column.brightness > 0.55 ? [0, 1, 7] : [0, 3, 7]
      const chord = intervals.map((interval) => Tone.Frequency(quantizeMidi(midi + interval, scale, rootShift), "midi").toNote())
      this.pad.triggerAttackRelease(chord, family === "texture" ? "2n" : "4n")
      struck = true
    }
    if (family === "arp" || family === "melody" || (family === "chords" && column.density > 0.2)) {
      if (midi !== this.lastMidi) {
        this.lead.triggerAttackRelease(note, length)
        this.lastMidi = midi
        struck = true
      }
    }
    return struck
  }
}
