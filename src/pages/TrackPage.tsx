import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { SOURCE_CREDIT, trackById } from "../data/tracks"
import { usePlayer } from "../audio/PlayerContext"
import { Visualizer } from "../components/Visualizer"

export function TrackPage() {
  const { id = "" } = useParams()
  const item = trackById(id)
  const player = usePlayer()
  if (!item) return <p>Piste inconnue.</p>
  useEffect(() => {
    if (player.track?.id !== item.id) player.choose(item.id)
  }, [item.id, player])
  const active = player.track?.id === item.id
  const progress = active && player.columns.length > 1 ? player.column / (player.columns.length - 1) : 0
  return (
    <article>
      <p style={{ color: "#1E9BD7" }}>SVS {item.svsId}</p>
      <h1 className="display" style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)" }}>{item.title}</h1>
      <p className="lede">{item.summary}</p>
      <div
        className="stage"
        onPointerDown={(event) => {
          if (player.track?.id !== item.id) player.choose(item.id)
          player.setMode("explore")
          const rect = event.currentTarget.getBoundingClientRect()
          player.explore((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height)
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1 || player.mode !== "explore") return
          const rect = event.currentTarget.getBoundingClientRect()
          player.explore((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height)
        }}
      >
        <img src={item.image} alt={item.alt} />
        <div className="playhead" style={{ left: `${progress * 100}%` }} />
      </div>
      <p style={{ color: "#C5D2E0" }}>
        Balayage : la tête dorée avance toute seule. Exploration : pointeur, doigt ou flèches. {SOURCE_CREDIT}. La NASA n'endosse pas ce projet. Les images livrées sont des substituts : remplacez le fichier {item.image} pour sonifier le visuel officiel, sans changer le code.
      </p>
      <Visualizer />
      <section className="panel" style={{ marginTop: "1rem" }}>
        <h2>Comment ça sonne ?</h2>
        <ul>
          {item.mapping.map((rule) => (
            <li key={rule.signal}><strong>{rule.signal}.</strong> {rule.sound}.</li>
          ))}
        </ul>
        <p>
          <a href={item.svsUrl}>Page source SVS {item.svsId}</a>
        </p>
      </section>
    </article>
  )
}
