# TERRA SONORA

*Écoutez la Terre. — Listen to the Earth.*

**Live demo:** https://SAKPANI.github.io/TERRA-SONORA/
**Source code:** https://github.com/SAKPANI/TERRA-SONORA
**Challenge:** NASA Space Apps Challenge 2026 — The Earth Information Jukebox
**Local event:** Lomé, Togo
**Team:** TERRA SONORA — NAME 1, NAME 2, NAME 3, NAME 4, NAME 5, NAME 6

TERRA SONORA is a browser jukebox that turns NASA Earth visualizations into pitched, scaled soundscapes. It analyzes visual features of each image (brightness, color, contrast, density, spatial distribution) and maps them to musical parameters, so that people can hear Earth phenomena instead of only seeing them.

Sound starts only after an explicit user action: a click, a tap, or the space bar.

## NASA visualizations and sources

The ten tracks use frames from the NASA Scientific Visualization Studio (SVS) / Earth Information Center. The images are analyzed locally in the browser.

| Track | NASA SVS ID |
|---|---|
| Caldwell 73 | 13786 |
| Night lights | 5313 |
| Ocean currents | 3912 |
| Aerosols | 5669 |
| Air quality | 5533 |
| Perpetual Ocean 2 | 5425 |
| DYAMOND CO₂ | 5196 |
| ISS lightning | 5011 |
| Atmospheric river | 4960 |
| GEDI forests | 4950 |

Source pages: `https://svs.gsfc.nasa.gov/<ID>`

NASA does not endorse this project. NASA materials remain subject to their own terms of use.

## How data becomes sound

| Track | Image signal | Sound |
|---|---|---|
| Caldwell 73 | brightness, horizontal position | volume, pentatonic note, stereo pan |
| Night lights | brightness, contrast | volume, shorter notes at high contrast |
| Ocean currents | horizontal bands, warm/cool color | evolving pad, filter brightness |
| Aerosols | dominant hue, colored area | chord root and density |
| Air quality | color bands, pixel density | chords and rhythm |
| Perpetual Ocean 2 | left-to-right flow, contrast | scale-locked arpeggio |
| DYAMOND CO₂ | visual density | pad, close interval on bright columns |
| ISS lightning | bright points | short percussion, silence on dark columns |
| Atmospheric river | band density, position | wide texture, stereo pan |
| GEDI forests | drawn height | lower, richer notes for taller bars |

The mapping describes the visual content of each image. It is an artistic sonification, not an independent scientific measurement.

## Audio engine

TERRA SONORA uses Tone.js to generate sound directly in the browser: ambient pads, lead voices, percussion, musical scales that keep every generated note harmonically coherent, stereo positioning, and a 30-second WAV export for offline listening.

## Accessibility

Space plays or pauses, arrow keys move the playhead, M mutes. The interface offers a visible gold focus, live-region announcements of the player state, optional speech, a high-contrast mode, adjustable text size, optional vibration on drum hits, and support for `prefers-reduced-motion`.

## Architecture

- `src/data/tracks.ts` — the ten tracks, SVS links, mapping sentences
- `src/audio/analyzer.ts` — brightness, contrast, light density and hue from canvas pixels
- `src/audio/scales.ts` — snaps pitches to pentatonic, minor, dorian, lydian or major
- `src/audio/engine.ts` — Tone.js pad, lead and percussion, started after a user gesture
- `src/audio/exportWav.ts` — 30-second WAV export through OfflineAudioContext
- `src/pages` — home, jukebox, track, about, accessibility

## Run locally

Requirements: Node.js, npm, Git.

```bash
git clone https://github.com/SAKPANI/TERRA-SONORA.git
cd TERRA-SONORA
npm install
npm run dev      # http://127.0.0.1:5173
npm test
npm run build    # production files in dist/
```

## Deployment

The app is deployed on GitHub Pages through GitHub Actions (`.github/workflows/deploy.yml`), which builds the project and publishes the `dist/` folder on every push to `main`.

The Vite base path is set to `/TERRA-SONORA/` in `vite.config.ts`. If the repository is renamed, update this value.

Vercel or Netlify also work (publish `dist`, redirect `/*` to `/index.html`), but they require `base: '/'`.

## Project goals

- Turn scientific visualizations into accessible listening experiences.
- Explore the relationship between data visualization and sound.
- Make Earth science more engaging through sonification.
- Encourage accessibility and alternative forms of scientific communication.

## Known limits

- A still image has no time axis; the playhead sweep is the listening time.
- The WAV export uses the same scale and column statistics with a lighter synthesizer than the live Tone.js voices.
- Speech and vibration depend on the browser and the device.
- Audio playback requires a user gesture because of browser autoplay restrictions.

## References

- NASA Scientific Visualization Studio — https://svs.gsfc.nasa.gov
- NASA Earth Information Center
- Tone.js — https://tonejs.github.io
- React, Vite, TypeScript (open source)

## Acknowledgments

Thanks to the NASA Scientific Visualization Studio and the Earth Information Center for the visualizations, and to the NASA Space Apps Challenge Lomé organizers.
