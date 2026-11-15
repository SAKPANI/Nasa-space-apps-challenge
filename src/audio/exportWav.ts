import type { ColumnStats } from "./analyzer"
import { midiToFrequency, quantizeMidi, type ScaleName } from "./scales"
import type { Family } from "../data/tracks"

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index))
}

function encodeWav(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels
  const rate = buffer.sampleRate
  const length = buffer.length
  const bytes = new ArrayBuffer(44 + length * channels * 2)
  const view = new DataView(bytes)
  writeString(view, 0, "RIFF")
  view.setUint32(4, 36 + length * channels * 2, true)
  writeString(view, 8, "WAVE")
  writeString(view, 12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * channels * 2, true)
  view.setUint16(32, channels * 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, "data")
  view.setUint32(40, length * channels * 2, true)
  let offset = 44
  const data = Array.from({ length: channels }, (_, channel) => buffer.getChannelData(channel))
  for (let i = 0; i < length; i += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, data[channel][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }
  return new Blob([bytes], { type: "audio/wav" })
}

export async function renderWav(columns: ColumnStats[], scale: ScaleName, family: Family): Promise<Blob> {
  const rate = 22050
  const seconds = 30
  const context = new OfflineAudioContext(2, rate * seconds, rate)
  const master = context.createGain()
  master.gain.value = 0.25
  master.connect(context.destination)
  const step = Math.max(1, Math.floor(columns.length / 80))
  columns.forEach((column, index) => {
    if (index % step !== 0) return
    const time = (index / columns.length) * (seconds - 0.4)
    const root = quantizeMidi(50 + column.brightness * 24 + (1 - column.x) * 4, scale, Math.round(column.hue / 30) % 12)
    const voices = family === "chords" || family === "pad" ? [0, family === "pad" && column.brightness > 0.55 ? 1 : 3, 7] : [0]
    voices.forEach((interval, voice) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const panner = context.createStereoPanner()
      oscillator.type = family === "drums" ? "square" : family === "pad" || family === "texture" ? "triangle" : "sine"
      oscillator.frequency.value = midiToFrequency(quantizeMidi(root + interval, scale))
      panner.pan.value = Math.max(-1, Math.min(1, column.x * 2 - 1))
      const level = family === "drums" ? (column.density > 0.02 ? 0.45 : 0.0001) : 0.12 + column.brightness * 0.25
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, level / (voice + 1)), time + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + (column.contrast > 0.2 ? 0.12 : 0.28))
      oscillator.connect(gain)
      gain.connect(panner)
      panner.connect(master)
      oscillator.start(time)
      oscillator.stop(time + 0.32)
    })
  })
  return encodeWav(await context.startRendering())
}
