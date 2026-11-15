import { lazy, Suspense, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { earthVoice } from "../audio/earthVoice"

const GlobeCanvas = lazy(() => import("../globe/GlobeCanvas"))

const LINES = [
  "In darkness, Earth reveals the pulse of human presence.",
  "Each pulse marks a year of real NASA night-light observations.",
  "Touch any coordinate to hear how our planet breathes.",
]

function wrapLon(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180
}

export function Home() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<"gate" | "overture">("gate")
  const [elapsed, setElapsed] = useState(0)
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)
  const [flyKey, setFlyKey] = useState(0)
  const [pulse, setPulse] = useState(0)
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  useEffect(() => {
    if (phase !== "overture") return
    const started = performance.now()
    let frame = 0
    const loop = () => {
      setElapsed((performance.now() - started) / 1000)
      setPulse(earthVoice().level())
      frame = window.requestAnimationFrame(loop)
    }
    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [phase])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, button")) return
      const step = event.shiftKey ? 10 : 5
      if (event.key === "ArrowRight") move(0, step)
      else if (event.key === "ArrowLeft") move(0, -step)
      else if (event.key === "ArrowUp") move(step, 0)
      else if (event.key === "ArrowDown") move(-step, 0)
      else if (phase === "overture" && event.key === "Escape") {
        event.preventDefault()
        leave()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  useEffect(() => () => earthVoice().cancelOverture(), [])

  function move(dLat: number, dLon: number): void {
    setLat((current) => Math.max(-85, Math.min(85, (current ?? 0) + dLat)))
    setLon((current) => wrapLon((current ?? 0) + dLon))
    setFlyKey((value) => value + 1)
  }

  function leave(): void {
    earthVoice().cancelOverture()
    navigate("/explore")
  }

  async function begin(): Promise<void> {
    setPhase("overture")
    setElapsed(0)
    if (!reduced) await earthVoice().overture()
  }

  const line = elapsed < 4 ? LINES[0] : elapsed < 8 ? LINES[1] : LINES[2]
  const year = 2012 + Math.min(11, Math.floor(elapsed))
  const showEnter = reduced || elapsed >= 10

  return (
    <section className="gate-stage">
      <div className="gate-globe" aria-label="3D globe of NASA night lights">
        <Suspense fallback={<p className="stage-note">Loading the globe…</p>}>
          <GlobeCanvas
            from="/nasa/night.png"
            to="/nasa/night.png"
            mix={0}
            tint="#e8a317"
            lat={lat}
            lon={lon}
            pulse={pulse}
            reduced={reduced}
            flyKey={flyKey}
            onPick={(nextLat, nextLon) => {
              setLat(nextLat)
              setLon(nextLon)
              setFlyKey((value) => value + 1)
            }}
          />
        </Suspense>
      </div>
      {phase === "gate" ? (
        <div className="gate-card">
          <p className="eyebrow">NASA SPACE APPS CHALLENGE 2026 · CHALLENGE 14</p>
          <h1 className="display">TERRA SONORA</h1>
          <p className="slogan">The Earth Information Jukebox</p>
          <p className="lede">Listen to our living planet through real NASA Earth observations.</p>
          <p className="headphones">Best experienced with headphones.</p>
          <div className="gate-actions">
            <button type="button" className="btn" onClick={() => void begin()}>Begin Experience</button>
            <button type="button" className="text-link" onClick={() => navigate("/explore")}>Enter silently</button>
          </div>
        </div>
      ) : (
        <div className="gate-card">
          <p className="eyebrow">Twelve Years of Earthlight (2012–2023)</p>
          <p className="year" aria-hidden="true">{reduced ? "2012–2023" : year}</p>
          <p className="overture-line" aria-live="polite">{line}</p>
          <div className="gate-actions">
            {showEnter ? <button type="button" className="btn" onClick={leave}>Enter Globe</button> : null}
            <button type="button" className="text-link" onClick={leave}>Skip [Esc]</button>
          </div>
        </div>
      )}
    </section>
  )
}
