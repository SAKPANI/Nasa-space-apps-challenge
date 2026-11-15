# TERRA SONORA

**Écoutez la Terre. / Listen to Earth.**

TERRA SONORA is an interactive browser-based jukebox developed for the NASA Space Apps Challenge, in response to the challenge *The Earth Information Jukebox*.

The platform transforms authentic NASA Earth visualizations into immersive soundscapes. By analyzing visual characteristics such as brightness, color, contrast, density, and spatial distribution, TERRA SONORA translates visual information into musical elements, allowing users to experience Earth's phenomena through sound.

TERRA SONORA est un jukebox interactif accessible depuis un navigateur, développé dans le cadre du NASA Space Apps Challenge, en réponse au défi *The Earth Information Jukebox*.

La plateforme transforme de véritables visualisations de la NASA sur la Terre en paysages sonores immersifs. En analysant les caractéristiques visuelles telles que la luminosité, les couleurs, le contraste, la densité et la répartition spatiale, TERRA SONORA traduit les informations visuelles en éléments musicaux et permet ainsi de découvrir les phénomènes terrestres à travers le son.

The audio engine starts only following an explicit user interaction: a click, a tap, or the space bar.

Le moteur audio ne démarre qu'après une interaction explicite de l'utilisateur : un clic, un toucher ou la barre d'espace.

---

## NASA Visualizations & Sources

TERRA SONORA uses authentic visual materials from NASA's Scientific Visualization Studio (SVS) and Earth Information Center.

The project integrates NASA visualizations as the visual foundation of its sonification system. These images are analyzed locally by the application to extract visual characteristics that control musical parameters.

The ten visual tracks include:

| Track | NASA SVS ID | Visualization |
|---|---|---|
| Caldwell 73 | [13786](https://svs.gsfc.nasa.gov/13786/) | Caldwell 73 |
| Night Lights | [5313](https://svs.gsfc.nasa.gov/5313/) | Earth's night lights |
| Ocean Currents | [3912](https://svs.gsfc.nasa.gov/3912/) | Ocean currents |
| Aerosols | [5669](https://svs.gsfc.nasa.gov/5669/) | Atmospheric aerosols |
| Air Quality | [5533](https://svs.gsfc.nasa.gov/5533/) | Air quality |
| Perpetual Ocean 2 | [5425](https://svs.gsfc.nasa.gov/5425/) | Ocean circulation |
| DYAMOND CO₂ | [5196](https://svs.gsfc.nasa.gov/5196/) | Atmospheric CO₂ |
| ISS Lightning | [5011](https://svs.gsfc.nasa.gov/5011/) | Lightning observations |
| Atmospheric River | [4960](https://svs.gsfc.nasa.gov/4960/) | Atmospheric rivers |
| GEDI Forests | [4950](https://svs.gsfc.nasa.gov/4950/) | Forest structure |

**Important:** The project uses NASA visual resources as the basis for its sound generation. The sonification analyzes the visual content of the images; it does not independently retrieve or measure the underlying scientific datasets.

NASA does not endorse this project. All NASA materials remain subject to their respective source terms and usage conditions. NASA attribution is provided for informational purposes only.

**Important :** Le projet utilise les ressources visuelles de la NASA comme base de génération sonore. La sonification repose sur l'analyse du contenu visuel des images ; elle ne constitue pas une récupération ou une mesure indépendante des données scientifiques sous-jacentes.

La NASA ne sponsorise ni n'approuve officiellement ce projet. Les ressources utilisées restent soumises aux conditions d'utilisation de leurs sources respectives.

---

## Installation

### Prerequisites

- Node.js
- npm
- Git

### Clone the repository

```bash
git clone https://github.com/SAKPANI/TERRA-SONORA.git
cd TERRA-SONORA
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open your browser at:

http://127.0.0.1:5173

### Run tests

```bash
npm test
```

### Build for production

```bash
npm run build
```

The production-ready files are generated in the `dist/` directory.

---

## Architecture

The application is organized into modular components:

| Component | Responsibility |
|---|---|
| `src/data/tracks.ts` | Defines the ten visual tracks, NASA SVS references, and sonification descriptions. |
| `src/audio/analyzer.ts` | Analyzes image pixels, including brightness, contrast, light density, and hue. |
| `src/audio/scales.ts` | Maps musical pitches to pentatonic, minor, dorian, lydian, and major scales. |
| `src/audio/engine.ts` | Manages the Tone.js audio engine, including pads, lead instruments, and percussion. |
| `src/audio/exportWav.ts` | Generates a 30-second WAV audio export using OfflineAudioContext. |
| `src/pages/` | Contains the home, jukebox, track, about, and accessibility pages. |

---

## From Earth Images to Sound

Each NASA visualization is associated with a specific sonification model.

The application analyzes the visual properties of each image and maps them to musical parameters.

| Track | Visual information analyzed | Musical translation |
|---|---|---|
| Caldwell 73 | Brightness and horizontal position | Volume, pentatonic notes, stereo panning |
| Night Lights | Brightness and contrast | Volume and shorter notes when contrast increases |
| Ocean Currents | Horizontal bands and warm/cool colors | Evolving pads and filter brightness |
| Aerosols | Dominant hue and colored area | Chord root and sound density |
| Air Quality | Color bands and pixel density | Chords and rhythm |
| Perpetual Ocean 2 | Horizontal flow and contrast | Scale-constrained arpeggios |
| DYAMOND CO₂ | Visual density | Pads and close musical intervals |
| ISS Lightning | Bright points | Short percussion sounds and silence in dark regions |
| Atmospheric River | Band density and position | Wide textures and stereo panning |
| GEDI Forests | Visualized height | Lower and richer notes for taller bars |

The musical mapping is designed to preserve the visual structure of the selected NASA visualization while creating an accessible and engaging listening experience.

---

## Audio Engine

TERRA SONORA uses Tone.js to generate sound directly in the browser.

The audio system includes:

- Ambient pads for atmospheric textures.
- Lead instruments for melodic elements.
- Percussion for rhythmic events.
- Musical scales to keep generated notes harmonically coherent.
- Stereo positioning to create spatial depth.
- WAV export for offline listening.

The generated sound follows the analyzed visual characteristics of each selected image.

---

## Accessibility

Accessibility is an integral part of TERRA SONORA.

The platform includes:

- Space bar to play or pause.
- Arrow keys to navigate the playhead.
- M key to mute audio.
- Visible gold focus indicators.
- Live announcements of player states.
- Optional speech assistance.
- High-contrast mode.
- Adjustable text size.
- Optional vibration on percussion events.
- Reduced-motion support through `prefers-reduced-motion`.

The interface is designed to support different interaction preferences and accessibility needs.

---

## Deployment on GitHub Pages

TERRA SONORA can be deployed using GitHub Pages.

The project uses Vite, so GitHub Pages deployment should be configured through GitHub Actions to build and publish the production files.

### Step 1 — Configure the Vite base path

For a repository named `TERRA-SONORA`, configure `vite.config.ts` with the appropriate base path:

```ts
export default defineConfig({
  base: '/TERRA-SONORA/',
  // Keep the existing plugins and other configuration
})
```

If the repository uses a different name, replace `TERRA-SONORA` with the exact repository name.

### Step 2 — Create the GitHub Actions workflow

Create the following file:

`.github/workflows/deploy.yml`

```yaml
name: Deploy TERRA SONORA to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3 — Enable GitHub Pages

1. Open the repository on GitHub.
2. Navigate to **Settings**.
3. Select **Pages**.
4. Under Build and deployment, choose **GitHub Actions**.
5. Push the workflow to the `main` branch.

GitHub Actions will automatically build and deploy the application.

Once deployment is complete, the application will be accessible at:

`https://SAKPANI.github.io/TERRA-SONORA/`

Replace the repository name and account name if they differ from the actual GitHub configuration.

---

## Project Objectives

TERRA SONORA explores an alternative way of experiencing Earth science information.

Its main objectives are:

- Transform scientific visualizations into accessible auditory experiences.
- Explore the relationship between data visualization and sound.
- Make Earth science more engaging through sonification.
- Demonstrate how digital technologies can create new ways to interact with scientific information.
- Encourage accessibility and alternative forms of scientific communication.

---

## Known Technical Considerations

- The sonification is based on visual characteristics extracted from the NASA images.
- A static image does not contain a time dimension. The playback sweep represents the listening progression.
- The generated musical patterns are artistic representations of visual information, not direct scientific measurements.
- WAV export uses the same scale and column statistics as the live audio engine, with a lighter synthesizer.
- Speech and vibration features depend on browser and device support.
- Audio playback requires an explicit user interaction in accordance with browser audio restrictions.

---

## Acknowledgements

We would like to acknowledge NASA's Scientific Visualization Studio and Earth Information Center for providing the scientific visual resources that inspired and support this project.

TERRA SONORA was developed as part of the NASA Space Apps Challenge, responding to the challenge *The Earth Information Jukebox*.

**Listen to the Earth. Discover its patterns. Experience science through sound.**

**TERRA SONORA — Écoutez la Terre.**
