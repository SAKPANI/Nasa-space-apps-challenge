import { Download, Pause, Play } from "lucide-react"
import { usePlayer, scaleOptions } from "../audio/PlayerContext"

export function PlayerBar() {
  const player = usePlayer()
  const progress = player.columns.length > 1 ? player.column / (player.columns.length - 1) : 0
  return (
    <div className="dock">
      <div className="shell dock-row">
        <button className="btn" type="button" onClick={() => void player.toggle()}>
          {player.playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {player.playing ? "Pause" : "Lecture"}
        </button>
        <label className="field">
          Mode
          <select value={player.mode} onChange={(event) => player.setMode(event.target.value as "sweep" | "explore")}>
            <option value="sweep">Balayage</option>
            <option value="explore">Exploration</option>
          </select>
        </label>
        <label className="field">
          Gamme
          <select value={player.scale} onChange={(event) => player.setScale(event.target.value as typeof player.scale)}>
            {scaleOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Volume {Math.round(player.volume * 100)}
          <input type="range" min={0} max={1} step={0.01} value={player.muted ? 0 : player.volume} aria-label="Volume" onChange={(event) => { player.setMuted(false); player.setVolume(Number(event.target.value)) }} />
        </label>
        <label className="field">
          Vitesse {player.speed.toFixed(1)}
          <input type="range" min={0.5} max={2} step={0.1} value={player.speed} aria-label="Vitesse du balayage" onChange={(event) => player.setSpeed(Number(event.target.value))} />
        </label>
        <button className="btn ghost" type="button" onClick={() => player.setMuted(!player.muted)}>
          {player.muted ? "Son coupé" : "Muet"}
        </button>
        <button className="btn ghost" type="button" onClick={() => void player.exportClip()}>
          <Download size={16} aria-hidden="true" />
          WAV 30 s
        </button>
        <div style={{ flex: "1 1 180px" }}>
          <div className="caption" style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>{player.track?.title ?? "Aucune piste"}</div>
          <div aria-hidden="true" style={{ height: 4, background: "var(--color-background)", marginTop: 6, borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: "var(--color-globe)" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
