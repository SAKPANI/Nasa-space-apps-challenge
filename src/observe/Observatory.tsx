import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import gsap from "gsap"
import { earthVoice } from "../audio/earthVoice"
import { loadRaster } from "../audio/loadRaster"
import { readPlace, type Raster, type Reading } from "../audio/reading"
import { FlatMap } from "../components/FlatMap"
import { ListenGuide } from "../components/ListenGuide"
import { SoundPortrait } from "../components/SoundPortrait"
import { phenomena, phenomenonById } from "../data/phenomena"
import { stops, type Stop } from "../data/stops"

const GlobeCanvas = lazy(() => import("../globe/GlobeCanvas"))

type Place = { lat: number; lon: number; name?: string }

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

function wrapLon(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180
}

export function Observatory({ mode }: { mode: "explore" | "tour" }) {
  const reduced = usePrefersReducedMotion()
  const [layerId, setLayerId] = useState(mode === "tour" ? stops[0].layerId : "night")
  const [place, setPlace] = useState<Place | null>(mode === "tour" ? { lat: stops[0].lat, lon: stops[0].lon, name: stops[0].name } : null)
  const [stopIndex, setStopIndex] = useState(0)
  const [heard, setHeard] = useState<Record<string, boolean>>(() => Object.fromEntries(phenomena.map((item) => [item.id, item.id === (mode === "tour" ? stops[0].layerId : "night")])))
  const [solo, setSolo] = useState<string | null>(null)
  const [view, setView] = useState<"3d" | "2d">(() => (webglAvailable() ? "3d" : "2d"))
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.35)
  const [flyKey, setFlyKey] = useState(mode === "tour" ? 1 : 0)
  const [rasters, setRasters] = useState<Record<string, Raster>>({})
  const [pulse, setPulse] = useState(0)
  const [guide, setGuide] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const layer = phenomenonById(layerId)
  const [from, setFrom] = useState(layer.src)
  const [to, setTo] = useState(layer.src)
  const [mix, setMix] = useState(0)
  const markMissing = useCallback(() => {
    setFailed("The NASA frame is not on this computer yet. svs.gsfc.nasa.gov did not respond, so the globe is waiting for the files in public/nasa.")
  }, [])
  const playingRef = useRef(false)
  playingRef.current = playing

  useEffect(() => {
    let cancel = false
    Promise.all(
      phenomena.map(async (item) => {
        const raster = await loadRaster(item.src)
        return [item.id, raster] as const
      }),
    )
      .then((entries) => {
        if (!cancel) setRasters(Object.fromEntries(entries))
      })
      .catch((error: unknown) => {
        if (!cancel) setFailed(error instanceof Error ? error.message : "A NASA frame failed to load.")
      })
    return () => {
      cancel = true
    }
  }, [])

  useEffect(() => {
    const proxy = { t: 0 }
    setTo(layer.src)
    const tween = gsap.to(proxy, {
      t: 1,
      duration: reduced ? 0 : 0.9,
      ease: "power1.inOut",
      onUpdate: () => setMix(proxy.t),
      onComplete: () => {
        setFrom(layer.src)
        setMix(0)
      },
    })
    return () => {
      tween.kill()
    }
  }, [layer.src, reduced])

  useEffect(() => () => earthVoice().silence(), [])

  const audible = useMemo(() => (solo ? [solo] : phenomena.filter((item) => heard[item.id]).map((item) => item.id)), [heard, solo])

  const readings = useMemo(() => {
    if (!place) return {} as Record<string, Reading>
    const next: Record<string, Reading> = {}
    for (const item of phenomena) {
      const raster = rasters[item.id]
      if (!raster) continue
      next[item.id] = readPlace(item.id, raster, place.lat, place.lon, place.name)
    }
    return next
  }, [place, rasters])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    const loop = () => {
      const layers = audible
        .map((id) => {
          const reading = readings[id]
          if (!reading || reading.gap) return null
          return { id, t: reading.t }
        })
        .filter((item): item is { id: string; t: number } => item !== null)
      earthVoice().tick(layers)
      setPulse(earthVoice().level())
      frame = window.requestAnimationFrame(loop)
    }
    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [playing, audible, readings])

  useEffect(() => {
    earthVoice().setVolume(volume)
  }, [volume])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (guide || target?.closest("input, textarea, select")) return
      const step = event.shiftKey ? 10 : 5
      if (event.key === "ArrowRight") {
        event.preventDefault()
        nudge(0, step)
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        nudge(0, -step)
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        nudge(step, 0)
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        nudge(-step, 0)
      } else if (event.key === "Enter") {
        event.preventDefault()
        void startSound()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function nudge(dLat: number, dLon: number): void {
    setPlace((current) => {
      const lat = Math.max(-85, Math.min(85, (current?.lat ?? 0) + dLat))
      const lon = wrapLon((current?.lon ?? 0) + dLon)
      return { lat, lon }
    })
    setFlyKey((value) => value + 1)
  }

  async function startSound(): Promise<void> {
    await earthVoice().start()
    earthVoice().setVolume(volume)
    setPlaying(true)
  }

  function pick(lat: number, lon: number): void {
    setPlace({ lat, lon })
    void startSound()
  }

  function chooseLayer(id: string): void {
    setLayerId(id)
    setSolo(null)
    setHeard(Object.fromEntries(phenomena.map((item) => [item.id, item.id === id])))
  }

  function toggleHeard(id: string): void {
    setSolo(null)
    setHeard((current) => ({ ...current, [id]: !current[id] }))
  }

  function toggleSolo(id: string): void {
    setSolo((current) => (current === id ? null : id))
  }

  function goToStop(index: number): void {
    const next = (index + stops.length) % stops.length
    const stop = stops[next]
    setStopIndex(next)
    setLayerId(stop.layerId)
    setSolo(null)
    setHeard(Object.fromEntries(phenomena.map((item) => [item.id, item.id === stop.layerId])))
    setPlace({ lat: stop.lat, lon: stop.lon, name: stop.name })
    setFlyKey((value) => value + 1)
  }

  async function preview(id: string, amount: number): Promise<void> {
    await earthVoice().start()
    earthVoice().setVolume(volume)
    earthVoice().playPreview(id, amount)
    const until = performance.now() + 2500
    const loop = () => {
      if (playingRef.current) return
      earthVoice().tick([])
      if (performance.now() < until) window.requestAnimationFrame(loop)
      else earthVoice().silence()
    }
    window.requestAnimationFrame(loop)
  }

  const visible = readings[layerId] ?? null
  const also = audible.filter((id) => id !== layerId && !readings[id]?.gap)
  const placeLabel = place?.name ?? (place ? `${place.lat.toFixed(1)}°, ${place.lon.toFixed(1)}°` : null)

  return (
    <div className="observe">
      <div>
        <header className="observe-head">
          <p className="eyebrow">{mode === "tour" ? "Six Continents, Eighteen Voices of Earth" : "Interactive Earth Observatory"}</p>
          {mode === "tour" ? (
            <p className="lede">A guided sensory journey across real NASA Earth visualizations—from the coast of Lomé to the heart of the Amazon and the Southern Ocean.</p>
          ) : (
            <p className="lede">{place ? "The portrait on the right is this exact point." : "Click anywhere on Earth, or use Arrow keys to travel across continents."}</p>
          )}
        </header>

        <div className="layer-row" role="list" aria-label="NASA layers">
          {phenomena.map((item) => {
            const selected = item.id === layerId
            const on = solo === item.id || (solo === null && heard[item.id])
            return (
              <div key={item.id} className={selected ? "chip selected" : "chip"} role="listitem">
                <button type="button" className="chip-main" aria-pressed={selected} onClick={() => chooseLayer(item.id)}>
                  <strong>{item.chip}</strong>
                  <span>{item.subtitle}</span>
                </button>
                <button type="button" className="chip-mini" aria-pressed={on} onClick={() => toggleHeard(item.id)}>
                  {on ? "Hearing" : "Muted"}
                </button>
                <button type="button" className="chip-mini" aria-pressed={solo === item.id} onClick={() => toggleSolo(item.id)}>
                  {solo === item.id ? "Solo on" : "Solo"}
                </button>
              </div>
            )
          })}
        </div>

        <div className="stage-wrap">
          <div className="stage-toolbar">
            <div role="group" aria-label="3D Globe / 2D Map">
              <button type="button" className={view === "3d" ? "btn" : "btn ghost"} aria-pressed={view === "3d"} onClick={() => setView("3d")}>
                3D Globe
              </button>
              <button type="button" className={view === "2d" ? "btn" : "btn ghost"} aria-pressed={view === "2d"} onClick={() => setView("2d")}>
                2D Map
              </button>
            </div>
            <button type="button" className="btn ghost" onClick={() => setGuide(true)}>
              How to Read the Sounds
            </button>
          </div>
          <div className="stage-frame" aria-label={view === "3d" ? "3D globe of the NASA frame" : "Flat map of the same NASA frame"}>
            {view === "3d" ? (
              <Suspense fallback={<p className="stage-note">Loading the globe…</p>}>
                <GlobeCanvas
                  from={from}
                  to={to}
                  mix={mix}
                  tint={layer.tint}
                  lat={place?.lat ?? null}
                  lon={place?.lon ?? null}
                  pulse={pulse}
                  reduced={reduced}
                  flyKey={flyKey}
                  onPick={pick}
                  onMissing={markMissing}
                />
              </Suspense>
            ) : (
              <FlatMap from={from} to={to} mix={mix} alt={`${layer.chip}. ${layer.period}`} lat={place?.lat ?? null} lon={place?.lon ?? null} onPick={pick} />
            )}
          </div>
          <p className="frame-note">{layer.period}</p>
          {failed ? <p className="frame-note">{failed}</p> : null}
          <p className="frame-note">Star field is artistic ambience, not a star catalog. The Earth picture is the NASA frame.</p>
        </div>

        <div className="transport">
          {mode === "tour" ? (
            <>
              <button type="button" className="btn ghost" onClick={() => goToStop(stopIndex - 1)}>Previous Stop</button>
              <button type="button" className="btn" onClick={() => void startSound()} disabled={!place}>Play Soundscape</button>
              <button type="button" className="btn ghost" onClick={() => goToStop(stopIndex + 1)}>Next Stop</button>
            </>
          ) : (
            <button type="button" className="btn" onClick={() => void startSound()} disabled={!place}>
              Play Soundscape
            </button>
          )}
          <button type="button" className="btn ghost" onClick={() => { earthVoice().silence(); setPlaying(false) }} disabled={!playing}>
            Stop
          </button>
          <label className="field">
            Volume
            <input type="range" min={0} max={1} step={0.01} value={volume} aria-valuetext="Low at the start" onChange={(event) => setVolume(Number(event.target.value))} />
          </label>
        </div>

        {mode === "tour" ? <StopList index={stopIndex} onChoose={goToStop} /> : null}
      </div>
      <SoundPortrait placeLabel={placeLabel} reading={visible} alsoHearing={also} note={failed} />
      <ListenGuide open={guide} onClose={() => setGuide(false)} onPreview={(id, amount) => void preview(id, amount)} />
    </div>
  )
}

function StopList({ index, onChoose }: { index: number; onChoose: (index: number) => void }) {
  const current = stops[index]
  return (
    <div className="stop-list">
      <h2>{current.continent}</h2>
      <p>{current.line}</p>
      <div className="stop-grid">
        {stops.map((stop, stopIndex) => (
          <button key={stop.id} type="button" className={stopIndex === index ? "stop active" : "stop"} onClick={() => onChoose(stopIndex)}>
            <span>{stop.continent}</span>
            <strong>{stop.name}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(query.matches)
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])
  return reduced
}

export type { Stop }
