import { phenomena } from "../data/phenomena"

export function Library() {
  return (
    <article className="library">
      <p className="eyebrow">Data Library</p>
      <h1 className="display" style={{ fontSize: "clamp(2.1rem, 5vw, 3.6rem)" }}>NASA Scientific Data Library</h1>
      <p className="lede">Every sound is deterministically derived from verified NASA Scientific Visualization Studio datasets.</p>
      <div className="library-list">
        {phenomena.map((item) => (
          <section key={item.id} className="panel">
            <img src={item.src} alt="" />
            <h2>{item.chip}</h2>
            <p>{item.subtitle}</p>
            <p>{item.period}</p>
            <p>{item.legend}</p>
            <table>
              <tbody>
                <tr><th>Signal</th><td>{item.mapping.signal}</td></tr>
                <tr><th>Sound</th><td>{item.mapping.sound}</td></tr>
                <tr><th>Range</th><td>{item.mapping.range}</td></tr>
                <tr><th>Curve</th><td>{item.mapping.curve}</td></tr>
                <tr><th>Why</th><td>{item.mapping.why}</td></tr>
              </tbody>
            </table>
            <p><a href={item.svsUrl}>SVS {item.svsId}</a> · {item.credit}</p>
          </section>
        ))}
      </div>
    </article>
  )
}
