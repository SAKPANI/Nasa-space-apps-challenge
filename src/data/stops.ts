export type Stop = {
  id: string
  continent: string
  name: string
  lat: number
  lon: number
  layerId: string
  line: string
}

export const stops: Stop[] = [
  { id: "lome", continent: "Africa", name: "Lomé, Togo", lat: 6.13, lon: 1.22, layerId: "night", line: "A coastal capital after dark, where the port and the shoreline stay lit." },
  { id: "sahara", continent: "Africa", name: "Ténéré, Sahara", lat: 18.5, lon: 11.2, layerId: "aerosols", line: "Dry desert wind and mineral dust over a vast, quiet land." },
  { id: "congo", continent: "Africa", name: "Congo Basin", lat: 0.6, lon: 17.4, layerId: "ndvi", line: "A rainforest canopy that shades the ground and holds the rain." },
  { id: "amazon", continent: "South America", name: "Heart of the Amazon", lat: -3.2, lon: -60.4, layerId: "ndvi", line: "Living forest as far as the rivers reach." },
  { id: "altiplano", continent: "South America", name: "Altiplano", lat: -16.5, lon: -68.15, layerId: "air", line: "High, thin air above the Andean plateau." },
  { id: "saopaulo", continent: "South America", name: "São Paulo", lat: -23.55, lon: -46.63, layerId: "night", line: "One of Earth's brightest urban nights." },
  { id: "newyork", continent: "North America", name: "New York", lat: 40.71, lon: -74.0, layerId: "night", line: "A harbor city that does not switch off." },
  { id: "sierra", continent: "North America", name: "Sierra Nevada", lat: 38.8, lon: -120.3, layerId: "aerosols", line: "Mountain air that smoke can cross in a single afternoon." },
  { id: "gulf", continent: "North America", name: "Gulf of Mexico", lat: 25.2, lon: -90.1, layerId: "sst", line: "Warm water that can feed a hurricane." },
  { id: "paris", continent: "Europe", name: "Paris", lat: 48.86, lon: 2.35, layerId: "air", line: "A dense city, where the air carries the day's traffic." },
  { id: "med", continent: "Europe", name: "Mediterranean Sea", lat: 35.4, lon: 18.4, layerId: "sst", line: "A summer sea between Europe and Africa." },
  { id: "boreal", continent: "Europe", name: "Northern Sweden", lat: 64.2, lon: 19.6, layerId: "ndvi", line: "Boreal forest, dark green and slow growing." },
  { id: "tokyo", continent: "Asia", name: "Tokyo", lat: 35.68, lon: 139.76, layerId: "night", line: "A megacity whose lights reach the bay." },
  { id: "takla", continent: "Asia", name: "Taklamakan", lat: 39.0, lon: 83.0, layerId: "aerosols", line: "A cold desert that lifts dust into the wind." },
  { id: "bengal", continent: "Asia", name: "Bay of Bengal", lat: 15.0, lon: 90.0, layerId: "lightning", line: "One of the stormiest seas on Earth." },
  { id: "sydney", continent: "Oceania", name: "Sydney", lat: -33.87, lon: 151.21, layerId: "night", line: "A coastal city lighting the edge of the Pacific." },
  { id: "coral", continent: "Oceania", name: "Coral Sea", lat: -18.0, lon: 152.5, layerId: "sst", line: "Warm tropical water over the reefs." },
  { id: "southern", continent: "Oceania", name: "Southern Ocean", lat: -52.0, lon: 140.0, layerId: "sst", line: "Cold water and long swells, far from any city." },
]

export const continents = [...new Set(stops.map((stop) => stop.continent))]
