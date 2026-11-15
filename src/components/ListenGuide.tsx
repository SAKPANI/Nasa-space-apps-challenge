import { bandLabel, phenomena, type Band } from "../data/phenomena"
import { BAND_AMOUNT } from "../data/phenomena"

type ListenGuideProps = {
  open: boolean
  onClose: () => void
  onPreview: (id: string, amount: number) => void
}

export function ListenGuide({ open, onClose, onPreview }: ListenGuideProps) {
  if (!open) return null
  const bands: Band[] = ["low", "mid", "high"]
  return (
    <div className="scrim" role="presentation" onMouseDown={onClose}>
      <div
        className="guide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="guide-head">
          <h2 id="guide-title">How to Read the Sounds</h2>
          <button type="button" className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="lede">
          Each layer has a low, a middle, and a high. Press a button to hear that step on its own. The words are what the same step means in ordinary life.
        </p>
        {phenomena.map((phenomenon) => (
          <section key={phenomenon.id} className="guide-layer">
            <h3>
              {phenomenon.chip} <span>({phenomenon.svsId})</span>
            </h3>
            <p>{phenomenon.legend}</p>
            <div className="guide-bands">
              {bands.map((band) => (
                <button
                  key={band}
                  type="button"
                  className="band"
                  onClick={() => onPreview(phenomenon.id, BAND_AMOUNT[band])}
                >
                  <strong>{bandLabel(band)}</strong>
                  <span>{phenomenon.life[band]}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
