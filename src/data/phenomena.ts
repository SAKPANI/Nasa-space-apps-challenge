export type Band = "low" | "mid" | "high"

export type Rgba = { r: number; g: number; b: number }

export type Measure = {
  t: number
  nasa: string
  gap: boolean
}

export type MappingRow = {
  signal: string
  sound: string
  range: string
  curve: string
  why: string
}

export type Phenomenon = {
  id: string
  chip: string
  subtitle: string
  svsId: string
  svsUrl: string
  src: string
  period: string
  tint: string
  credit: string
  legend: string
  hear: Record<Band, string>
  life: Record<Band, string>
  mapping: MappingRow
  measure: (pixel: Rgba) => Measure
}

export const BAND_AMOUNT: Record<Band, number> = { low: 0.12, mid: 0.5, high: 0.88 }

export function bandFor(t: number): Band {
  if (t < 0.34) return "low"
  if (t < 0.67) return "mid"
  return "high"
}

export function bandLabel(band: Band): string {
  if (band === "low") return "Low"
  if (band === "mid") return "Medium"
  return "High"
}

function luma(pixel: Rgba): number {
  return (0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b) / 255
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function hue(pixel: Rgba): number {
  const r = pixel.r / 255
  const g = pixel.g / 255
  const b = pixel.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (delta === 0) return 0
  let h = 0
  if (max === r) h = ((g - b) / delta) % 6
  else if (max === g) h = (b - r) / delta + 2
  else h = (r - g) / delta + 4
  return (h * 60 + 360) % 360
}

const night: Phenomenon = {
  id: "night",
  chip: "Night Lights",
  subtitle: "Human Presence & Cities",
  svsId: "5475",
  svsUrl: "https://svs.gsfc.nasa.gov/5475/",
  src: "/nasa/night.png",
  period: "Black Marble annual nights, 2012–2023. One published equirectangular still — the picture does not invent a year the file does not contain.",
  tint: "#c9b27a",
  credit: "NASA SVS 5475 · Black Marble · Kel Elkins, USRA",
  legend: "Deep silence means a countryside asleep with little electricity. Fast pulses mean a city awake at night — traffic, homes, and markets.",
  hear: {
    low: "A slow, quiet pulse, almost resting.",
    mid: "A steady pulse, like streets that stay lit after sunset.",
    high: "A fast, steady rhythmic pulse.",
  },
  life: {
    low: "A dark countryside — scattered homes, unlit fields, and long quiet roads.",
    mid: "Towns and highways glowing after dark. People are home, and a few shops are still open.",
    high: "A city awake after dark — busy roads, illuminated homes, ports and night markets humming with human activity.",
  },
  mapping: {
    signal: "Luminance of the SVS 5475 equirectangular still",
    sound: "Pulse speed and loudness",
    range: "0–50 nW/cm²/sr on the Black Marble display scale",
    curve: "luminance ^ 0.55, then scaled",
    why: "Brighter nights pulse faster and louder. More light never becomes softer.",
  },
  measure(pixel) {
    const t = clamp01(luma(pixel) ** 0.55)
    const nW = Math.round(t * 50)
    const word = bandLabel(bandFor(t))
    return {
      t,
      gap: false,
      nasa: `${word} night-light radiance — ${nW} nW/cm²/sr on the Black Marble display scale`,
    }
  },
}

const aerosols: Phenomenon = {
  id: "aerosols",
  chip: "Aerosols & Dust",
  subtitle: "Winds, Smoke & Desert Plumes",
  svsId: "5552",
  svsUrl: "https://svs.gsfc.nasa.gov/5552/",
  src: "/nasa/aerosols.png",
  period: "GEOS aerosols, 1 August–14 September 2024. Colors are the official legend, not a single dust gauge.",
  tint: "#d46ad4",
  credit: "NASA SVS 5552 · GEOS · Joseph V. Ardizzone and Helen-Nicole Kostis",
  legend: "Calm, clear air means a sky washed clean after rain. A dense grainy breath means air full of harmattan dust, smoke, or dry haze.",
  hear: {
    low: "Almost no breath. The air sounds open.",
    mid: "A light grain, like haze on the horizon.",
    high: "A grainy, dense breath.",
  },
  life: {
    low: "Calm, clear air — a washed sky, the kind you get after rain.",
    mid: "A light haze. Dust or smoke is thin enough to soften the horizon, not hide it.",
    high: "Air thick with desert dust, smoke, or dry haze — a hazy horizon, warm dry wind, and a sky that looks milky.",
  },
  mapping: {
    signal: "Color strength on the GEOS aerosol legend (cyan sea salt, magenta dust, orange smoke, green sulfate)",
    sound: "Grain loudness and brightness",
    range: "0 = no plume color, 1 = a strong legend tint",
    curve: "chroma / 0.45, clamped",
    why: "A stronger plume is never quieter. The hue names the kind of particle; it does not reverse the amount.",
  },
  measure(pixel) {
    const max = Math.max(pixel.r, pixel.g, pixel.b)
    const min = Math.min(pixel.r, pixel.g, pixel.b)
    const chroma = (max - min) / 255
    const t = clamp01(chroma / 0.45)
    if (t < 0.12) {
      return { t, gap: false, nasa: "Clear air — little aerosol color on the GEOS legend" }
    }
    const h = hue(pixel)
    let kind = "mixed aerosol"
    if (h >= 280 && h < 345) kind = "dust (magenta)"
    else if (h >= 160 && h < 210) kind = "sea salt (cyan)"
    else if (h < 45 || h >= 345) kind = "smoke and black carbon (orange)"
    else if (h >= 70 && h < 160) kind = "sulfate (green)"
    return {
      t,
      gap: false,
      nasa: `${bandLabel(bandFor(t))} ${kind} on the GEOS legend`,
    }
  },
}

const ndvi: Phenomenon = {
  id: "ndvi",
  chip: "Vegetation (NDVI)",
  subtitle: "Forests & Living Biomass",
  svsId: "5544",
  svsUrl: "https://svs.gsfc.nasa.gov/5544/",
  src: "/nasa/ndvi.jpg",
  period: "NASA MODIS MYD13C1 NDVI, one equirectangular composite (2013, day 201). Green is living plant cover. Tan and blue are not forest. SVS 5544 itself is a film; this still is the public MODIS map.",
  tint: "#8dc63f",
  credit: "NASA MODIS MYD13C1 · equirectangular NDVI",
  legend: "A thin dry note means bare soil or desert. A warm, wide chord means dense tropical forest breathing and shading the ground.",
  hear: {
    low: "A thin, dry note.",
    mid: "A modest living chord — grassland or open woodland.",
    high: "A warm, wide, living chord.",
  },
  life: {
    low: "Bare ground or desert — little leaf cover, hot soil, and a thin living skin.",
    mid: "Fields, grass, or open woodland. Plants are working, but the canopy is not closed.",
    high: "Dense living forest — shade, moisture, and a canopy that cools the air and holds the rain.",
  },
  mapping: {
    signal: "Green dominance in the MODIS NDVI color scale",
    sound: "Chord size, warmth, and a lower pitch as green increases",
    range: "about −0.1 to 0.9 NDVI on the picture's color scale",
    curve: "(green − max(red, blue) + 0.05) / 0.55",
    why: "More green is louder and fuller, never thinner. Pitch steps down so the forest feels heavy, not like an alarm.",
  },
  measure(pixel) {
    const green = pixel.g / 255 - Math.max(pixel.r, pixel.b) / 255
    const t = clamp01((green + 0.05) / 0.55)
    const ndviValue = -0.1 + t * 1
    return {
      t,
      gap: false,
      nasa: `${bandLabel(bandFor(t))} vegetation green — about ${ndviValue.toFixed(2)} on the NDVI color scale`,
    }
  },
}

const air: Phenomenon = {
  id: "air",
  chip: "Air Quality",
  subtitle: "Breathable Air & Urban Haze",
  svsId: "5518",
  svsUrl: "https://svs.gsfc.nasa.gov/5518/",
  src: "/nasa/air.png",
  period: "GEOS-CF particulate matter (PM2.5), one frame from the July–August 2024 run. Not a health bulletin.",
  tint: "#e07a3d",
  credit: "NASA SVS 5518 · GEOS-CF PM2.5 · Kostis, Ardizzone, Ott",
  legend: "A clear open tone means air that is easy to breathe. A muffled, heavy grain means city air thick with fine particles and exhaust.",
  hear: {
    low: "A clear, open resonance.",
    mid: "A slightly dulled tone.",
    high: "A muffled, heavy grain.",
  },
  life: {
    low: "Air that feels easy to breathe — a clear day, windows open, the horizon sharp.",
    mid: "Ordinary urban air. Some exhaust and dust, enough to soften the light.",
    high: "City air thick with fine particles — exhaust, smoke, and a sky that feels heavy in the chest.",
  },
  mapping: {
    signal: "Warm color on the PM2.5 frame (dark and blue read as cleaner; yellow and red read as heavier)",
    sound: "Noise level up, low-pass filter down",
    range: "0–100 on this frame's color strength, not a clinic measurement",
    curve: "clamp((red + 0.35·green − blue) / 255)",
    why: "Heavier color is louder and more muffled. It never turns into a prettier, softer tone.",
  },
  measure(pixel) {
    const t = clamp01((pixel.r + pixel.g * 0.35 - pixel.b) / 255)
    const index = Math.round(t * 100)
    return {
      t,
      gap: false,
      nasa: `${bandLabel(bandFor(t))} fine-particle color — ${index} on this PM2.5 frame`,
    }
  },
}

const sst: Phenomenon = {
  id: "sst",
  chip: "Sea Temperature",
  subtitle: "Ocean Heat & Currents",
  svsId: "5101",
  svsUrl: "https://svs.gsfc.nasa.gov/5101/",
  src: "/nasa/sst.jpg",
  period: "MUR sea-surface temperature, latest published still. The color bar runs from −5 °C to 35 °C. Land is not a reading.",
  tint: "#1e9bd7",
  credit: "NASA SVS 5101 · MUR SST · Kel Elkins and Greg Shirah",
  legend: "A slow low swell means cold ocean water. A higher, vibrating sheet means a warm sea that can feed rain and tropical storms.",
  hear: {
    low: "A slow, low swell.",
    mid: "A middle swell, neither icy nor tropical.",
    high: "A higher, vibrating sheet of sound.",
  },
  life: {
    low: "Cold ocean water — a gray-blue sea, little fuel for tropical storms.",
    mid: "Temperate water. Swimmers feel it cool, and storms rarely explode here.",
    high: "A warm sea — the kind of water that feeds heavy rain and can sustain tropical storms.",
  },
  mapping: {
    signal: "Red-versus-blue on the MUR color bar (−5 °C light blue to 35 °C red)",
    sound: "Pitch of a sustained swell",
    range: "−5 °C to 35 °C",
    curve: "(warmth + 0.35) / 1.15, where warmth is (red − blue) / 255",
    why: "Warmer water is always a higher swell, never a softer one.",
  },
  measure(pixel) {
    const bright = luma(pixel)
    const max = Math.max(pixel.r, pixel.g, pixel.b)
    const min = Math.min(pixel.r, pixel.g, pixel.b)
    const colorless = max - min < 18 && bright < 0.22
    if (colorless || bright < 0.04) {
      return {
        t: 0,
        gap: true,
        nasa: "No sea-surface reading here — this frame colors the ocean, not the land",
      }
    }
    const warmth = (pixel.r - pixel.b) / 255
    const t = clamp01((warmth + 0.35) / 1.15)
    const celsius = -5 + t * 40
    return {
      t,
      gap: false,
      nasa: `${bandLabel(bandFor(t))} sea surface — about ${celsius.toFixed(0)} °C on the MUR color bar`,
    }
  },
}

const lightning: Phenomenon = {
  id: "lightning",
  chip: "Lightning",
  subtitle: "Tropical Storms & Energy",
  svsId: "5011",
  svsUrl: "https://svs.gsfc.nasa.gov/5011/",
  src: "/nasa/lightning.jpg",
  period: "LIS on the space station, March 2017–July 2023. This is one equirectangular frame of that film, not a full storm forecast.",
  tint: "#f2f6fb",
  credit: "NASA SVS 5011 · ISS LIS · Garrison, Shirah, Elkins, Kekesi",
  legend: "Quiet means a stable sky. Crackles and rumbles mean intense storms and heavy rain.",
  hear: {
    low: "Near silence. The sky sounds settled.",
    mid: "Occasional soft cracks.",
    high: "Crackles and a low rumble.",
  },
  life: {
    low: "A stable sky — no storm overhead, dry ground, people out without watching the clouds.",
    mid: "Scattered storms. Rain is nearby, and thunder is still occasional.",
    high: "Intense tropical storms — bright flashes, heavy rain, and streets that flood in minutes.",
  },
  mapping: {
    signal: "Brightness of flash pixels on the SVS 5011 equirectangular frame",
    sound: "Crackle rate, plus a rumble when the frame is very bright",
    range: "0 = no bright flash in this frame, 1 = a dense bright cluster",
    curve: "luminance / 0.42, clamped",
    why: "More lightning is faster and stronger, never calmer.",
  },
  measure(pixel) {
    const t = clamp01(luma(pixel) / 0.42)
    if (t < 0.12) {
      return { t, gap: false, nasa: "Calm sky — no bright LIS flash in this frame" }
    }
    return {
      t,
      gap: false,
      nasa: `${bandLabel(bandFor(t))} lightning brightness — ${Math.round(t * 100)} on this LIS frame`,
    }
  },
}

export const phenomena: Phenomenon[] = [night, aerosols, ndvi, air, sst, lightning]

export function phenomenonById(id: string): Phenomenon {
  const found = phenomena.find((item) => item.id === id)
  if (!found) throw new Error(`Unknown phenomenon ${id}`)
  return found
}
