import type * as ToneType from "tone"
import { quantizeMidi, type ScaleName } from "./scales"
import { voicePlan } from "./voicePlan"

type Layer = { id: string; t: number }

const SCALES: Record<string, ScaleName> = {
  night: "dorian",
  ndvi: "dorian",
  sst: "lydian",
  lightning: "minor",
}

export class EarthVoice {
  private tone: typeof ToneType | null = null
  private started = false
  private master: ToneType.Gain | null = null
  private analyser: ToneType.Analyser | null = null
  private night: ToneType.MembraneSynth | null = null
  private nightGain: ToneType.Gain | null = null
  private grain: ToneType.Noise | null = null
  private grainFilter: ToneType.Filter | null = null
  private grainGain: ToneType.Gain | null = null
  private haze: ToneType.Noise | null = null
  private hazeFilter: ToneType.Filter | null = null
  private hazeGain: ToneType.Gain | null = null
  private forest: ToneType.PolySynth | null = null
  private forestGain: ToneType.Gain | null = null
  private sea: ToneType.Synth | null = null
  private seaGain: ToneType.Gain | null = null
  private crack: ToneType.NoiseSynth | null = null
  private rumble: ToneType.MembraneSynth | null = null
  private boltGain: ToneType.Gain | null = null
  private nightAt = 0
  private crackAt = 0
  private forestKey = ""
  private seaOn = false
  private sample: { id: string; t: number; until: number } | null = null
  private overtureTimers: number[] = []

  async start(): Promise<void> {
    this.tone = this.tone ?? (await import("tone"))
    await this.tone.start()
    if (this.started) return
    const Tone = this.tone
    const limiter = new Tone.Limiter(-12).toDestination()
    this.master = new Tone.Gain(0.22).connect(limiter)
    this.analyser = new Tone.Analyser("waveform", 256)
    this.master.connect(this.analyser)

    this.nightGain = new Tone.Gain(0).connect(this.master)
    this.night = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 2,
      envelope: { attack: 0.02, decay: 0.22, sustain: 0, release: 0.12 },
    }).connect(this.nightGain)

    this.grainGain = new Tone.Gain(0).connect(this.master)
    this.grainFilter = new Tone.Filter(900, "bandpass").connect(this.grainGain)
    this.grain = new Tone.Noise("pink").connect(this.grainFilter)
    this.grain.start()

    this.hazeGain = new Tone.Gain(0).connect(this.master)
    this.hazeFilter = new Tone.Filter(1800, "lowpass").connect(this.hazeGain)
    this.haze = new Tone.Noise("brown").connect(this.hazeFilter)
    this.haze.start()

    this.forestGain = new Tone.Gain(0).connect(this.master)
    this.forest = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.45, decay: 0.25, sustain: 0.72, release: 1.3 },
    }).connect(this.forestGain)

    this.seaGain = new Tone.Gain(0).connect(this.master)
    this.sea = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.5, decay: 0.2, sustain: 0.85, release: 1.4 },
    }).connect(this.seaGain)

    this.boltGain = new Tone.Gain(0).connect(this.master)
    this.crack = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.012, decay: 0.09, sustain: 0, release: 0.06 },
    }).connect(this.boltGain)
    this.rumble = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 3,
      envelope: { attack: 0.02, decay: 0.35, sustain: 0, release: 0.18 },
    }).connect(this.boltGain)

    this.started = true
  }

  setVolume(amount: number): void {
    const level = 0.08 + Math.max(0, Math.min(1, amount)) * 0.42
    this.master?.gain.rampTo(level, 0.12)
  }

  /** Twelve soft pulses, one for each year from 2012 through 2023. */
  async overture(): Promise<void> {
    await this.start()
    this.cancelOverture()
    for (let year = 0; year < 12; year += 1) {
      const timer = window.setTimeout(() => {
        this.nightGain?.gain.rampTo(0.35, 0.05)
        this.night?.triggerAttackRelease("A1", "8n")
      }, year * 1000)
      this.overtureTimers.push(timer)
    }
    this.overtureTimers.push(window.setTimeout(() => this.nightGain?.gain.rampTo(0, 0.3), 12200))
  }

  cancelOverture(): void {
    for (const timer of this.overtureTimers) window.clearTimeout(timer)
    this.overtureTimers = []
    this.nightGain?.gain.rampTo(0, 0.15)
  }

  playPreview(id: string, t: number): void {
    this.sample = { id, t, until: performance.now() + 2400 }
  }

  silence(): void {
    this.sample = null
    this.releaseHeld()
  }

  tick(layers: Layer[], now = performance.now()): void {
    if (!this.started || !this.tone) return
    const active = this.sample && now < this.sample.until ? [{ id: this.sample.id, t: this.sample.t }] : layers
    if (this.sample && now >= this.sample.until) this.sample = null
    const byId = new Map(active.map((layer) => [layer.id, layer.t]))
    this.playNight(byId.get("night"), now)
    this.playGrain(byId.get("aerosols"))
    this.playForest(byId.get("ndvi"))
    this.playHaze(byId.get("air"))
    this.playSea(byId.get("sst"))
    this.playLightning(byId.get("lightning"), now)
  }

  level(): number {
    const value = this.analyser?.getValue()
    if (!(value instanceof Float32Array) || value.length === 0) return 0
    let sum = 0
    for (const sample of value) sum += sample * sample
    return Math.min(1, Math.sqrt(sum / value.length) * 5)
  }

  private note(midi: number, scale: ScaleName): string {
    const Tone = this.tone
    if (!Tone) return "C3"
    return Tone.Frequency(quantizeMidi(midi, scale, 0), "midi").toNote()
  }

  private playNight(t: number | undefined, now: number): void {
    if (!this.night || !this.nightGain) return
    if (t === undefined) {
      this.nightGain.gain.rampTo(0, 0.15)
      return
    }
    const plan = voicePlan("night", t)
    this.nightGain.gain.rampTo(plan.gain, 0.08)
    const period = 1000 / plan.rateHz
    if (now - this.nightAt >= period) {
      this.nightAt = now
      this.night.triggerAttackRelease(this.note(plan.midi, SCALES.night), "8n")
    }
  }

  private playGrain(t: number | undefined): void {
    if (!this.grainGain || !this.grainFilter) return
    if (t === undefined) {
      this.grainGain.gain.rampTo(0, 0.2)
      return
    }
    const plan = voicePlan("aerosols", t)
    this.grainGain.gain.rampTo(plan.gain, 0.12)
    this.grainFilter.frequency.rampTo(plan.cutoff, 0.12)
  }

  private playHaze(t: number | undefined): void {
    if (!this.hazeGain || !this.hazeFilter) return
    if (t === undefined) {
      this.hazeGain.gain.rampTo(0, 0.2)
      return
    }
    const plan = voicePlan("air", t)
    this.hazeGain.gain.rampTo(plan.gain, 0.12)
    this.hazeFilter.frequency.rampTo(Math.max(180, plan.cutoff), 0.12)
  }

  private playForest(t: number | undefined): void {
    if (!this.forest || !this.forestGain || !this.tone) return
    if (t === undefined) {
      this.forestGain.gain.rampTo(0, 0.25)
      if (this.forestKey) {
        this.forest.releaseAll(0.4)
        this.forestKey = ""
      }
      return
    }
    const plan = voicePlan("ndvi", t)
    this.forestGain.gain.rampTo(plan.gain, 0.15)
    const intervals = plan.voices === 1 ? [0] : plan.voices === 2 ? [0, 7] : [0, 4, 7]
    const notes = intervals.map((interval) => this.note(plan.midi + interval, SCALES.ndvi))
    const key = notes.join("-")
    if (key !== this.forestKey) {
      if (this.forestKey) this.forest.releaseAll(0.3)
      this.forest.triggerAttack(notes)
      this.forestKey = key
    }
  }

  private playSea(t: number | undefined): void {
    if (!this.sea || !this.seaGain) return
    if (t === undefined) {
      this.seaGain.gain.rampTo(0, 0.3)
      if (this.seaOn) {
        this.sea.triggerRelease()
        this.seaOn = false
      }
      return
    }
    const plan = voicePlan("sst", t)
    this.seaGain.gain.rampTo(plan.gain, 0.2)
    const note = this.note(plan.midi, SCALES.sst)
    if (!this.seaOn) {
      this.sea.triggerAttack(note)
      this.seaOn = true
    } else {
      this.sea.frequency.rampTo(this.tone?.Frequency(note).toFrequency() ?? 110, 0.25)
    }
  }

  private playLightning(t: number | undefined, now: number): void {
    if (!this.boltGain || !this.crack || !this.rumble) return
    if (t === undefined) {
      this.boltGain.gain.rampTo(0, 0.15)
      return
    }
    const plan = voicePlan("lightning", t)
    this.boltGain.gain.rampTo(plan.gain, 0.08)
    if (plan.rateHz <= 0) return
    if (now - this.crackAt < 1000 / plan.rateHz) return
    this.crackAt = now
    this.crack.triggerAttackRelease(0.08)
    if (t >= 0.67) this.rumble.triggerAttackRelease(this.note(plan.midi, SCALES.lightning), "8n")
  }

  private releaseHeld(): void {
    this.nightGain?.gain.rampTo(0, 0.15)
    this.grainGain?.gain.rampTo(0, 0.2)
    this.hazeGain?.gain.rampTo(0, 0.2)
    this.forestGain?.gain.rampTo(0, 0.25)
    this.seaGain?.gain.rampTo(0, 0.25)
    this.boltGain?.gain.rampTo(0, 0.12)
    this.forest?.releaseAll(0.3)
    this.forestKey = ""
    if (this.seaOn) this.sea?.triggerRelease()
    this.seaOn = false
  }
}

let voice: EarthVoice | null = null

export function earthVoice(): EarthVoice {
  voice ??= new EarthVoice()
  return voice
}
