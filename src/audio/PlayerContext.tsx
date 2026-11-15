import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { loadRaster, scanColumns, type ColumnStats } from "./analyzer"
import { renderWav } from "./exportWav"
import { SonoraEngine } from "./engine"
import { SCALE_LABELS, type ScaleName } from "./scales"
import { trackById, tracks, type Track } from "../data/tracks"
import { useA11y } from "../a11y/settings"

type Mode = "sweep" | "explore"

type PlayerValue = {
  track: Track | null
  playing: boolean
  mode: Mode
  volume: number
  speed: number
  scale: ScaleName
  muted: boolean
  column: number
  columns: ColumnStats[]
  status: string
  choose: (id: string) => void
  toggle: () => void
  setMode: (mode: Mode) => void
  setVolume: (value: number) => void
  setSpeed: (value: number) => void
  setScale: (value: ScaleName) => void
  setMuted: (value: boolean) => void
  explore: (x: number, y: number) => void
  nudge: (delta: number) => void
  exportClip: () => Promise<void>
  waveform: () => Float32Array | null
}

const PlayerContext = createContext<PlayerValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const a11y = useA11y()
  const engine = useRef(new SonoraEngine())
  const columnsRef = useRef<ColumnStats[]>([])
  const indexRef = useRef(0)
  const playingRef = useRef(false)
  const modeRef = useRef<Mode>("sweep")
  const [track, setTrack] = useState<Track | null>(tracks[7])
  const [playing, setPlaying] = useState(false)
  const [mode, setModeState] = useState<Mode>("sweep")
  const [volume, setVolumeState] = useState(0.7)
  const [speed, setSpeed] = useState(1)
  const [scale, setScale] = useState<ScaleName>(tracks[7].scale)
  const [muted, setMutedState] = useState(false)
  const [column, setColumn] = useState(0)
  const [columns, setColumns] = useState<ColumnStats[]>([])
  const [status, setStatus] = useState("Choisissez une piste, puis lancez le son.")
  const spoken = useRef(0)

  const speak = useCallback(
    (text: string) => {
      if (!a11y.speech || !("speechSynthesis" in window)) return
      const now = performance.now()
      if (now - spoken.current < 2500) return
      spoken.current = now
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
    },
    [a11y.speech],
  )

  const soundAt = useCallback(
    (index: number, y = 0.5) => {
      const stats = columnsRef.current[index]
      const current = track
      if (!stats || !current) return
      const struck = engine.current.play(stats, current.family, scale, y)
      if (struck && a11y.haptics && current.family === "drums" && navigator.vibrate) navigator.vibrate(18)
      if (stats.brightness > 0.72) speak("Zone très lumineuse.")
      else if (stats.density < 0.01 && current.family === "drums") speak("Colonne sombre, pas de percussion.")
      setColumn(index)
      indexRef.current = index
    },
    [a11y.haptics, scale, speak, track],
  )

  useEffect(() => {
    if (!track) return
    let cancelled = false
    setStatus(`Lecture de ${track.image}.`)
    loadRaster(track.image)
      .then((raster) => {
        if (cancelled) return
        const next = scanColumns(raster)
        columnsRef.current = next
        setColumns(next)
        setColumn(0)
        indexRef.current = 0
        setScale(track.scale)
        setStatus(`${track.title}. ${next.length} colonnes prêtes. Le son attend un geste.`)
      })
      .catch(() => setStatus("L'image n'a pas pu être lue."))
    return () => {
      cancelled = true
    }
  }, [track])

  useEffect(() => {
    engine.current.setVolume(muted ? 0 : volume)
  }, [muted, volume])

  useEffect(() => {
    if (!playing || mode !== "sweep") return
    let timer = 0
    const tick = () => {
      const count = columnsRef.current.length
      if (count > 0) {
        const next = (indexRef.current + 1) % count
        soundAt(next)
      }
      timer = window.setTimeout(tick, Math.max(40, 140 / speed))
    }
    timer = window.setTimeout(tick, Math.max(40, 140 / speed))
    return () => window.clearTimeout(timer)
  }, [mode, playing, soundAt, speed])

  const toggle = useCallback(async () => {
    if (!playingRef.current) {
      await engine.current.start()
      playingRef.current = true
      setPlaying(true)
      setStatus(modeRef.current === "sweep" ? "Balayage en cours." : "Exploration au pointeur ou aux flèches.")
      soundAt(indexRef.current)
      return
    }
    playingRef.current = false
    setPlaying(false)
    setStatus("En pause.")
  }, [soundAt])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA")) return
      if (event.code === "Space") {
        event.preventDefault()
        void toggle()
      }
      if (event.key === "m" || event.key === "M") setMutedState((value) => !value)
      if (event.key === "ArrowRight") {
        event.preventDefault()
        const count = columnsRef.current.length
        if (count) soundAt(Math.min(count - 1, indexRef.current + 1))
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        soundAt(Math.max(0, indexRef.current - 1))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [soundAt, toggle])

  const value = useMemo<PlayerValue>(
    () => ({
      track,
      playing,
      mode,
      volume,
      speed,
      scale,
      muted,
      column,
      columns,
      status,
      choose: (id: string) => {
        const next = trackById(id)
        if (!next) return
        playingRef.current = false
        setPlaying(false)
        setTrack(next)
        setStatus(`${next.title}. Appuyez sur lecture.`)
      },
      toggle,
      setMode: (next) => {
        modeRef.current = next
        setModeState(next)
      },
      setVolume: setVolumeState,
      setSpeed,
      setScale,
      setMuted: setMutedState,
      explore: (x: number, y: number) => {
        const count = columnsRef.current.length
        if (!count) return
        const index = Math.max(0, Math.min(count - 1, Math.round(x * (count - 1))))
        void engine.current.start().then(() => {
          playingRef.current = true
          setPlaying(true)
          soundAt(index, y)
        })
      },
      nudge: (delta: number) => {
        const count = columnsRef.current.length
        if (!count) return
        soundAt(Math.max(0, Math.min(count - 1, indexRef.current + delta)))
      },
      exportClip: async () => {
        if (!track || columnsRef.current.length < 2) return
        setStatus("Export de 30 secondes.")
        const blob = await renderWav(columnsRef.current, scale, track.family)
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `terra-sonora-${track.id}.wav`
        link.click()
        URL.revokeObjectURL(url)
        setStatus("Fichier WAV téléchargé.")
      },
      waveform: () => engine.current.waveform(),
    }),
    [column, columns, mode, muted, playing, scale, soundAt, speed, status, toggle, track, volume],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer(): PlayerValue {
  const value = useContext(PlayerContext)
  if (!value) throw new Error("Lecteur indisponible.")
  return value
}

export const scaleOptions = Object.entries(SCALE_LABELS) as [ScaleName, string][]
