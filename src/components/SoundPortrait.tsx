import type { Reading } from "../audio/reading"
import { phenomena } from "../data/phenomena"

type SoundPortraitProps = {
  placeLabel: string | null
  reading: Reading | null
  alsoHearing: string[]
  note?: string | null
}

export function SoundPortrait({ placeLabel, reading, alsoHearing, note }: SoundPortraitProps) {
  const announcement = reading
    ? `${reading.nasa}. ${reading.hear}. ${reading.life}`
    : "No place selected yet. Click the Earth, or use the arrow keys."

  return (
    <article className="portrait panel" aria-labelledby="portrait-title">
      <p className="eyebrow">Sound Portrait</p>
      <h2 id="portrait-title">{placeLabel ?? "Choose a place"}</h2>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      {reading ? (
        <div className="portrait-rows">
          <section>
            <h3>NASA Observation</h3>
            <p>{reading.nasa}</p>
          </section>
          <section>
            <h3>What You Hear</h3>
            <p>{reading.hear}</p>
          </section>
          <section>
            <h3>Daily Human Reality</h3>
            <p>{reading.life}</p>
          </section>
          {alsoHearing.length > 0 ? (
            <p className="also">
              Also in the mix: {alsoHearing.map((id) => phenomena.find((item) => item.id === id)?.chip).filter(Boolean).join(", ")}.
            </p>
          ) : null}
        </div>
      ) : (
        <p>{note ?? "The portrait appears when a place is chosen. It always says what the satellite picture shows, what the sound is doing, and what that means for people or nature there."}</p>
      )}
    </article>
  )
}
