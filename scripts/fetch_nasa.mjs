import { createWriteStream } from "node:fs"
import { mkdir } from "node:fs/promises"
import { get } from "node:https"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "nasa")

const files = [
  ["night.png", "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005475/nightlights_2012-2024_KSC_SOS_04_plus2_0900_2k.png"],
  ["aerosols.png", "https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005552/SOS_Aerosols_1024x512.png"],
  ["ndvi.jpg", "https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005544/nrtndvi_equi_print.jpg"],
  ["air.png", "https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005518/frames/2048x1024_2x1_30p/PM2.5_Layer/AirQuality_PM2.5_Layer_2048x1024_0400.png"],
  ["sst.jpg", "https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005101/sst_mur_print.jpg"],
  ["lightning.jpg", "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005011/iss_lightning_sos_yearly_debug_2023_sos_2048p60.00420_print.jpg"],
]

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const request = get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        download(response.headers.location, destination).then(resolve, reject)
        return
      }
      if (response.statusCode !== 200) {
        reject(new Error(`${response.statusCode} ${url}`))
        return
      }
      const file = createWriteStream(destination)
      response.pipe(file)
      file.on("finish", () => file.close(() => resolve(destination)))
    })
    request.setTimeout(40000, () => request.destroy(new Error(`Timed out: ${url}`)))
    request.on("error", reject)
  })
}

await mkdir(root, { recursive: true })
for (const [name, url] of files) {
  const destination = join(root, name)
  process.stdout.write(`${name} `)
  await download(url, destination)
  process.stdout.write("ok\n")
}
