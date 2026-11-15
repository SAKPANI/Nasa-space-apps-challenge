# TERRA SONORA

**Écoutez la Terre.**

TERRA SONORA is a browser jukebox for the NASA Space Apps challenge *The Earth Information Jukebox*. It turns an Earth Information Center picture into a pitched, scaled soundscape. The sound starts only after a click, a tap, or the space bar.

TERRA SONORA est un jukebox dans le navigateur pour le défi NASA Space Apps *The Earth Information Jukebox*. Il transforme une image du Earth Information Center en paysage sonore tenu dans une gamme. Le son ne part qu'après un clic, un toucher ou la barre d'espace.

NASA does not endorse this project. The pictures shipped in `public/visuals` are procedural stand-ins. Source pages belong to the NASA Scientific Visualization Studio / Earth Information Center and keep their own terms of use.

La NASA n'endosse pas ce projet. Les images de `public/visuals` sont des substituts procéduraux. Les pages sources restent celles du NASA Scientific Visualization Studio / Earth Information Center, avec leurs conditions d'utilisation.

## Installation

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173

```bash
npm test
npm run build
```

## Replace a placeholder with a NASA frame

Keep the file name. Drop the official still or frame onto the same path. No code change.

| File | SVS |
| --- | --- |
| `public/visuals/caldwell.png` | [13786](https://svs.gsfc.nasa.gov/13786/) |
| `public/visuals/nightlights.png` | [5313](https://svs.gsfc.nasa.gov/5313/) |
| `public/visuals/currents.png` | [3912](https://svs.gsfc.nasa.gov/3912/) |
| `public/visuals/aerosols.png` | [5669](https://svs.gsfc.nasa.gov/5669/) |
| `public/visuals/air.png` | [5533](https://svs.gsfc.nasa.gov/5533/) |
| `public/visuals/ocean.png` | [5425](https://svs.gsfc.nasa.gov/5425/) |
| `public/visuals/co2.png` | [5196](https://svs.gsfc.nasa.gov/5196/) |
| `public/visuals/lightning.png` | [5011](https://svs.gsfc.nasa.gov/5011/) |
| `public/visuals/river.png` | [4960](https://svs.gsfc.nasa.gov/4960/) |
| `public/visuals/forest.png` | [4950](https://svs.gsfc.nasa.gov/4950/) |

Regenerate the stand-ins with `npm run visuals`.

## Architecture

- `src/data/tracks.ts` — the ten tracks, SVS links, and mapping sentences
- `src/audio/analyzer.ts` — canvas pixels: brightness, contrast, light density, hue
- `src/audio/scales.ts` — snap any pitch to pentatonic, minor, dorian, lydian, or major
- `src/audio/engine.ts` — Tone.js pad, lead, and percussion, started after a user gesture
- `src/audio/exportWav.ts` — 30-second WAV through `OfflineAudioContext`
- `src/pages` — home, jukebox, track, about, accessibility

## Data to sound

| Track | Image signal | Sound |
| --- | --- | --- |
| Caldwell 73 | brightness, horizontal position | volume, pentatonic note, pan |
| Night lights | brightness, contrast | volume, shorter notes when contrast is high |
| Currents | horizontal bands, warm or cool color | evolving pad, filter brightness |
| Aerosols | dominant hue, colored area | chord root and density |
| Air quality | color bands, pixel density | chords and rhythm |
| Perpetual Ocean 2 | left-to-right flow, contrast | arpeggio locked to the scale |
| DYAMOND CO₂ | visual density | pad, plus a close interval when the column is bright |
| ISS lightning | bright points | short percussion, silence on dark columns |
| Atmospheric river | band density, position | wide texture, stereo pan |
| GEDI forests | drawn height | lower, richer notes for taller bars |

These rules describe the loaded picture. They are not a claim that the placeholder is a NASA measurement.

## Accessibility

Space plays or pauses. Arrow keys move the playhead. M mutes. Focus is gold. A live region announces the player state. Optional speech, high contrast, text size, and vibration on drum hits. Motion follows `prefers-reduced-motion`.

## Deploy on Vercel

The repository includes `vercel.json` (`vite`, output `dist`, SPA rewrite). Import the project, use `npm run build`, and publish `dist`. Netlify works the same way with a publish directory of `dist` and a redirect of `/*` to `/index.html`.

## Known limits

- Placeholders imitate composition. They do not contain radiance, temperature, or flash counts.
- A still image has no time axis. The sweep is the listening time.
- The WAV export follows the same scale and column stats, with a lighter synthesizer than the live Tone.js voices.
- Vibration and speech depend on the browser and the device.
