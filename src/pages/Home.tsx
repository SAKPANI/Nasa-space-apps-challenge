import { lazy, Suspense, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Volume2, Sparkles, ExternalLink } from "lucide-react"
import { earthVoice } from "../audio/earthVoice"
import SplitText from "../components/SplitText"
import BlurText from "../components/BlurText"
import ElectricBorder from "../components/ElectricBorder"
import Galaxy from "../components/Galaxy"
import Hyperspeed from "../components/Hyperspeed"

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
  const [phase, setPhase] = useState<"gate" | "hyperspeed" | "overture">("gate")
  const [elapsed, setElapsed] = useState(0)
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)
  const [flyKey, setFlyKey] = useState(0)
  const [pulse, setPulse] = useState(0)
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

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

  function handleStart(): void {
    if (reduced) {
      void beginOverture()
      return
    }
    // Lancement de la transition cinématique Hyperspeed de 1,5s
    setPhase("hyperspeed")
    window.setTimeout(() => {
      void beginOverture()
    }, 1500)
  }

  async function beginOverture(): Promise<void> {
    setPhase("overture")
    setElapsed(0)
    if (!reduced) await earthVoice().overture()
  }

  const line = elapsed < 4 ? LINES[0] : elapsed < 8 ? LINES[1] : LINES[2]
  const year = 2012 + Math.min(11, Math.floor(elapsed))
  const showEnter = reduced || elapsed >= 10

  return (
    <section className="relative min-h-[calc(100vh-4.5rem)] w-full overflow-hidden flex items-center justify-center">
      {/* 1. ÉTAPE OUVERTURE : Fond Galaxy interactif (démonté dès que l'overture/globe démarre) */}
      {phase === "gate" && (
        <div className="absolute inset-0 z-0 pointer-events-auto" aria-hidden="true">
          <Galaxy
            starColors={["#FFCE00", "#1E88C9", "#66CBAA", "#FFFFFF"]}
            transparent={true}
            speed={0.5}
            density={1.1}
            glowIntensity={0.6}
            mouseInteraction={!reduced}
            disableAnimation={reduced}
          />
        </div>
      )}

      {/* 2. TRANSITION HYPERSPEED (1,5s, complètement démontée dès l'accès au globe) */}
      {phase === "hyperspeed" && (
        <div className="fixed inset-0 z-50 pointer-events-none transition-opacity duration-300">
          <Hyperspeed
            curve="deep"
            speed={2.2}
            tailColors={["#FFCE00", "#1E88C9"]}
            headColors={["#FFFFFF", "#66CBAA"]}
            roadColor="#14214D"
            background="#14214D"
          />
        </div>
      )}

      {/* 3. LE GLOBE 3D : Affiché lors de l'overture (SEUL effet WebGL actif) */}
      {phase === "overture" && (
        <div className="absolute inset-0 z-0" aria-label="Globe 3D des lumières nocturnes de la NASA">
          <Suspense fallback={<p className="stage-note">Chargement du globe satellitaire…</p>}>
            <GlobeCanvas
              from="/nasa/night.png"
              to="/nasa/night.png"
              mix={0}
              tint="#FFCE00"
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
      )}

      {/* 4. CONTENU & CARTES D'INTERACTION */}
      {phase === "gate" && (
        <div className="relative z-10 w-full max-w-2xl mx-4 my-6 p-6 sm:p-8 md:p-10 rounded-2xl border border-white/15 bg-[#14214D]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] text-center">
          {/* Badge & Défi NASA */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full border border-[#FFCE00]/30 bg-[#FFCE00]/10 text-[0.7rem] sm:text-xs font-semibold uppercase tracking-wider text-[#FFEC70]">
            <Sparkles size={13} className="text-[#FFCE00]" />
            NASA Space Apps Challenge 2026 · Défi 14
          </div>

          {/* Titre animé SplitText */}
          <div className="mb-2 w-full flex justify-center items-center">
            <SplitText
              text="TERRA SONORA"
              tag="h1"
              trigger="load"
              effect="rise"
              delay={20}
              duration={0.6}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.06em] sm:tracking-[0.14em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Slogan animé BlurText */}
          <div className="mb-4">
            <BlurText
              text="Quand la terre se fait entendre"
              animateBy="words"
              direction="bottom"
              trigger="load"
              delay={150}
              className="slogan text-base sm:text-xl font-medium tracking-wide text-[#66CBAA]"
            />
          </div>

          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mx-auto mb-5 leading-relaxed">
            Une sonification immersive des données satellitaires réelles de la NASA. Écoutez le rythme de notre planète vivante.
          </p>

          {/* Aperçu image NASA réelle & crédit obligatoire */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 mb-5 bg-black/40 group">
            <img
              src="/nasa/night.png"
              alt="Lumières nocturnes de la Terre observées par la NASA"
              className="w-full h-28 sm:h-36 md:h-40 object-cover object-center opacity-85 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14214D] via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[0.68rem] text-white/90">
              <span className="flex items-center gap-1 font-mono">
                Données & images : NASA Earth Observatory (SVS #5475)
              </span>
              <a
                href="https://svs.gsfc.nasa.gov/5475"
                target="_blank"
                rel="noreferrer"
                className="text-[#FFCE00] hover:underline flex items-center gap-1"
                aria-label="Source NASA (ouvre un nouvel onglet)"
              >
                Source <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Conseil casque */}
          <div className="flex items-center justify-center gap-2 text-[0.72rem] sm:text-xs text-[#94A3B8] mb-5 font-mono">
            <Volume2 size={14} className="text-[#66CBAA]" />
            Expérience optimisée avec un casque audio.
          </div>

          {/* Boutons d'action : Hiérarchie claire (primaire or éclatant / secondaire verre discret) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
            <ElectricBorder
              color="#FFCE00"
              glowColor="rgba(255, 206, 0, 0.45)"
              borderRadius={10}
              speed={1.2}
              glow={1.2}
              className="w-full sm:w-auto inline-block transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <button
                type="button"
                className="btn primary w-full sm:w-auto font-bold bg-[#FFCE00] text-[#14214D] hover:bg-[#FFEC70] border-[#FFCE00] shadow-[0_0_24px_rgba(255,206,0,0.45)]"
                onClick={handleStart}
                style={{ minHeight: "2.85rem", padding: "0.7rem 1.6rem" }}
              >
                <span>Commencer l'expérience</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </ElectricBorder>

            <button
              type="button"
              className="btn secondary w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
              onClick={() => navigate("/explore")}
              style={{ minHeight: "2.85rem", padding: "0.7rem 1.4rem" }}
            >
              Entrer silencieusement
            </button>
          </div>
        </div>
      )}

      {/* CARTE OVERTURE (Pendant le vol orbital des 12 ans de lumières) */}
      {phase === "overture" && (
        <div className="relative z-10 max-w-xl mx-4 p-8 rounded-2xl border border-white/15 bg-[#14214D]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-center animate-fade-in">
          <p className="text-xs uppercase tracking-widest text-[#FFCE00] font-mono mb-2">
            Douze Années de Lumière Terrestre (2012–2023)
          </p>
          <p className="text-5xl md:text-6xl font-black font-display tracking-wider text-white mb-3" aria-hidden="true">
            {reduced ? "2012–2023" : year}
          </p>
          <p className="text-base text-[#94A3B8] min-h-[3rem] mb-6 leading-relaxed" aria-live="polite">
            {line}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {showEnter && (
              <button type="button" className="btn primary" onClick={leave}>
                <span>Explorer le Globe</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
            <button type="button" className="btn ghost" onClick={leave}>
              Passer [Échap]
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
