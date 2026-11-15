import { Link } from "react-router-dom"
import { tracks } from "../data/tracks"
import { usePlayer } from "../audio/PlayerContext"

export function Jukebox() {
  const { track, choose } = usePlayer()
  return (
    <section>
      <h1 className="display" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>Jukebox</h1>
      <p className="lede">Dix pistes. Choisissez-en une, puis lancez la lecture dans la barre du bas.</p>
      <div className="grid-cards" style={{ marginTop: "1.2rem" }}>
        {tracks.map((item, index) => (
          <article key={item.id} className={track?.id === item.id ? "card active" : "card"}>
            <img src={item.image} alt={item.alt} />
            <p style={{ margin: 0, color: "#8DC63F" }}>{String(index + 1).padStart(2, "0")}</p>
            <h2 style={{ margin: 0, fontSize: "1.15rem" }}>{item.title}</h2>
            <p style={{ margin: 0, color: "#C5D2E0" }}>{item.durationLabel}</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button className="btn" type="button" onClick={() => choose(item.id)}>Choisir</button>
              <Link className="btn ghost" to={`/piste/${item.id}`}>Détail</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
