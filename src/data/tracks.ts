import type { ScaleName } from "../audio/scales"

export type Family = "melody" | "pad" | "drums" | "chords" | "arp" | "texture"

export type Track = {
  id: string
  title: string
  summary: string
  alt: string
  svsId: string
  svsUrl: string
  image: string
  scale: ScaleName
  family: Family
  durationLabel: string
  mapping: { signal: string; sound: string }[]
}

const credit = "NASA Scientific Visualization Studio / Earth Information Center"

export const SOURCE_CREDIT = credit

export const tracks: Track[] = [
  {
    id: "caldwell",
    title: "Caldwell 73",
    summary: "Référence de méthode : une image d'amas d'étoiles, balayée comme une portée. Ce n'est pas un phénomène terrestre.",
    alt: "Points lumineux dispersés sur fond noir. Le son lit leur éclat et leur place horizontale. Substitut procédural du visuel SVS 13786.",
    svsId: "13786",
    svsUrl: "https://svs.gsfc.nasa.gov/13786/",
    image: "/visuals/caldwell.png",
    scale: "pentatonic",
    family: "melody",
    durationLabel: "balayage ~30 s",
    mapping: [
      { signal: "Luminosité de la colonne", sound: "Volume et brillance du filtre" },
      { signal: "Position horizontale", sound: "Note quantifiée sur la pentatonique, et panoramique" },
    ],
  },
  {
    id: "nightlights",
    title: "Lumières nocturnes 2012–2023",
    summary: "Le film EIC montre la hausse des lumières en violet et la baisse en orange. Ici, l'éclat de la colonne règle le tempo ressenti et le volume.",
    alt: "Points de plus en plus lumineux de gauche à droite. Substitut du film Black Marble SVS 5313. Le son devient plus présent quand la colonne s'éclaire.",
    svsId: "5313",
    svsUrl: "https://svs.gsfc.nasa.gov/5313/",
    image: "/visuals/nightlights.png",
    scale: "dorian",
    family: "melody",
    durationLabel: "balayage ~30 s",
    mapping: [
      { signal: "Intensité lumineuse", sound: "Volume" },
      { signal: "Contraste clair / sombre", sound: "Notes plus courtes, donc un rythme plus serré" },
    ],
  },
  {
    id: "currents",
    title: "Courants et température",
    summary: "Les courants de surface colorés par la température deviennent une nappe tenue. Le bleu reste plus mat, le chaud ouvre le filtre.",
    alt: "Bandes ondulées du cyan vers l'orange. Substitut du film ECCO2 SVS 3912. La nappe suit le mouvement horizontal.",
    svsId: "3912",
    svsUrl: "https://svs.gsfc.nasa.gov/3912/",
    image: "/visuals/currents.png",
    scale: "lydian",
    family: "pad",
    durationLabel: "nappe ~30 s",
    mapping: [
      { signal: "Mouvement horizontal des bandes", sound: "Nappe qui évolue" },
      { signal: "Couleur chaude ou froide", sound: "Filtre plus ouvert ou plus sombre" },
    ],
  },
  {
    id: "aerosols",
    title: "Aérosols GEOS",
    summary: "Quatre familles de la légende, quatre couleurs. Chaque teinte dominante appelle un accord différent.",
    alt: "Quatre disques : cyan, magenta, or et vert. Substitut de l'image SVS 5669. Ce n'est pas une concentration du modèle.",
    svsId: "5669",
    svsUrl: "https://svs.gsfc.nasa.gov/5669/",
    image: "/visuals/aerosols.png",
    scale: "minor",
    family: "chords",
    durationLabel: "accords ~30 s",
    mapping: [
      { signal: "Teinte dominante", sound: "Fondamentale de l'accord" },
      { signal: "Aire colorée", sound: "Densité de l'accord" },
    ],
  },
  {
    id: "air",
    title: "Qualité de l'air",
    summary: "Trois plages de couleur deviennent trois couleurs d'accord. La densité des pixels règle le rythme.",
    alt: "Trois bandes verticales bleu, or et rouge. Substitut du film GEOS-CF SVS 5533. Modèle de recherche, pas un bulletin sanitaire.",
    svsId: "5533",
    svsUrl: "https://svs.gsfc.nasa.gov/5533/",
    image: "/visuals/air.png",
    scale: "dorian",
    family: "chords",
    durationLabel: "accords ~30 s",
    mapping: [
      { signal: "Palette de la colonne", sound: "Accord" },
      { signal: "Densité de pixels colorés", sound: "Rythme" },
    ],
  },
  {
    id: "ocean",
    title: "Perpetual Ocean 2",
    summary: "Le flux des courants de bord ouest est lu comme un arpège. Le contraste aligne les notes sur la gamme.",
    alt: "Courants bleu nuit en bandes horizontales. Substitut du film SVS 5425. La version blanche du film officiel est un choix graphique, pas une température.",
    svsId: "5425",
    svsUrl: "https://svs.gsfc.nasa.gov/5425/",
    image: "/visuals/ocean.png",
    scale: "pentatonic",
    family: "arp",
    durationLabel: "arpège ~30 s",
    mapping: [
      { signal: "Flux de gauche à droite", sound: "Arpège" },
      { signal: "Contraste", sound: "Notes tenues dans la gamme" },
    ],
  },
  {
    id: "co2",
    title: "CO₂ DYAMOND",
    summary: "Cœur du jukebox. Plus la colonne est dense, plus un intervalle serré s'ajoute à l'accord : la dissonance suit l'accumulation visuelle.",
    alt: "Halo orangé plus dense au centre-droit. Substitut du film SVS 5196. Le son lit cette densité, pas un champ en ppm.",
    svsId: "5196",
    svsUrl: "https://svs.gsfc.nasa.gov/5196/",
    image: "/visuals/co2.png",
    scale: "minor",
    family: "pad",
    durationLabel: "nappe ~30 s",
    mapping: [
      { signal: "Concentration visuelle", sound: "Accord plus dissonant" },
      { signal: "Position", sound: "Panoramique" },
    ],
  },
  {
    id: "lightning",
    title: "Éclairs depuis l'ISS",
    summary: "Chaque point lumineux devient une percussion sèche. Les colonnes vides restent silencieuses.",
    alt: "Quelques points blancs sur fond noir. Substitut du film LIS SVS 5011. Un éclair visuel déclenche une frappe, pas un tonnerre enregistré.",
    svsId: "5011",
    svsUrl: "https://svs.gsfc.nasa.gov/5011/",
    image: "/visuals/lightning.png",
    scale: "minor",
    family: "drums",
    durationLabel: "percussions ~30 s",
    mapping: [
      { signal: "Point lumineux", sound: "Percussion brève" },
      { signal: "Position horizontale", sound: "Panoramique" },
    ],
  },
  {
    id: "river",
    title: "Rivière atmosphérique",
    summary: "La bande d'humidité devient une texture large, répartie entre la gauche et la droite.",
    alt: "Diagonale bleu clair. Substitut du film MERRA-2 SVS 4960. La texture suit la bande, sans calculer l'IVT.",
    svsId: "4960",
    svsUrl: "https://svs.gsfc.nasa.gov/4960/",
    image: "/visuals/river.png",
    scale: "lydian",
    family: "texture",
    durationLabel: "texture ~30 s",
    mapping: [
      { signal: "Densité de la bande", sound: "Texture filtrée" },
      { signal: "Position dans l'image", sound: "Spatialisation stéréo" },
    ],
  },
  {
    id: "forest",
    title: "Hauteur des forêts GEDI",
    summary: "Les barres plus hautes, donc plus claires dans ce substitut, descendent vers un registre plus grave et plus chargé.",
    alt: "Barres vertes de hauteurs différentes. Substitut du film GEDI SVS 4950. La hauteur sonore suit la hauteur dessinée, pas une biomasse.",
    svsId: "4950",
    svsUrl: "https://svs.gsfc.nasa.gov/4950/",
    image: "/visuals/forest.png",
    scale: "dorian",
    family: "melody",
    durationLabel: "mélodie ~30 s",
    mapping: [
      { signal: "Hauteur dessinée", sound: "Registre plus grave quand la barre est haute" },
      { signal: "Couleur dense", sound: "Timbre plus riche" },
    ],
  },
]

export function trackById(id: string): Track | undefined {
  return tracks.find((track) => track.id === id)
}
