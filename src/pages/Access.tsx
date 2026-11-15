import { useA11y } from "../a11y/settings"

export function Access() {
  const a11y = useA11y()
  return (
    <article>
      <h1 className="display" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>Accessibilité</h1>
      <p className="lede">
        Le défi part d'un manque : un film sans son exclut celles et ceux qui ne le voient pas.
        Cette page rassemble les commandes qui rendent l'écoute autonome.
      </p>
      <ul>
        <li>Espace : lecture ou pause, sauf dans un champ.</li>
        <li>Flèches gauche et droite : déplacer la tête de lecture.</li>
        <li>M : couper ou rendre le son.</li>
        <li>Le focus doré reste visible au clavier.</li>
        <li>Une région live annonce la piste et l'état du lecteur.</li>
      </ul>
      <div className="panel" style={{ display: "grid", gap: "0.8rem" }}>
        <label className="field">
          <span>Taille du texte, {a11y.font.toFixed(1)}</span>
          <input type="range" min={0.9} max={1.4} step={0.1} value={a11y.font} aria-label="Taille du texte" onChange={(event) => a11y.setFont(Number(event.target.value))} />
        </label>
        <label><input type="checkbox" checked={a11y.contrast} onChange={(event) => a11y.setContrast(event.target.checked)} /> Contraste élevé</label>
        <label><input type="checkbox" checked={a11y.speech} onChange={(event) => a11y.setSpeech(event.target.checked)} /> Annonces vocales des zones lumineuses</label>
        <label><input type="checkbox" checked={a11y.haptics} onChange={(event) => a11y.setHaptics(event.target.checked)} /> Vibration sur les percussions, si l'appareil le permet</label>
      </div>
      <p>
        Les animations suivent <code>prefers-reduced-motion</code>. Les textes alternatifs décrivent
        l'image et ce que le son en retient. Testez avec NVDA ou VoiceOver : la barre de lecture et
        les cartes sont des boutons et des liens nommés.
      </p>
    </article>
  )
}
