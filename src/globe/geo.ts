/** Equirectangular mapping that matches Three.js SphereGeometry. */

export const EARTH_RADIUS = 2

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function latLonToUv(lat: number, lon: number): { u: number; v: number } {
  const u = (((((lon + 180) % 360) + 360) % 360) / 360)
  const v = clamp01((lat + 90) / 180)
  return { u, v }
}

export function uvToLatLon(u: number, v: number): { lat: number; lon: number } {
  return {
    lat: clamp01(v) * 180 - 90,
    lon: clamp01(u) * 360 - 180,
  }
}

/** Image row 0 is north. `v` is the Three.js uv.y (1 at the north pole). */
export function latLonToPixel(lat: number, lon: number, width: number, height: number): { x: number; y: number } {
  const { u, v } = latLonToUv(lat, lon)
  return {
    x: Math.round(u * (width - 1)),
    y: Math.round((1 - v) * (height - 1)),
  }
}

/** Inverse of SphereGeometry: phi = u·2π, theta = 0 at the north pole. */
export function latLonToVector(lat: number, lon: number, radius: number): [number, number, number] {
  const { u } = latLonToUv(lat, lon)
  const phi = u * Math.PI * 2
  const theta = ((90 - lat) * Math.PI) / 180
  const ring = Math.sin(theta) * radius
  const y = Math.cos(theta) * radius
  return [-ring * Math.cos(phi), y, ring * Math.sin(phi)]
}
