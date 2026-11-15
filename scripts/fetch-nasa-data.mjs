import { createWriteStream } from "node:fs"
import { mkdir } from "node:fs/promises"
import { get } from "node:https"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "nasa")

// Official SVS stills, mirrored on Wikimedia Commons.
// svs.gsfc.nasa.gov resets the connection from this network, so the files
// are the same published frames served from upload.wikimedia.org.
const files = [
  ["night.png", "https://upload.wikimedia.org/wikipedia/commons/c/c2/SOS_-_Change_in_Night_Lights_between_2012_and_2023_%28SVS5475_-_2012-2024_KSC_SOS_04_plus2_0900_2k%29.png"],
  ["aerosols.png", "https://upload.wikimedia.org/wikipedia/commons/c/cb/Science_On_A_Sphere-_Aerosols_in_the_Air_%28SVS5552_-_SOS_Aerosols_4096x2048%29.png"],
  ["ndvi.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/MYD13C1_A2013201_005_2013218212020_NDVI.jpeg/1920px-MYD13C1_A2013201_005_2013218212020_NDVI.jpeg"],
  ["air.png", "https://upload.wikimedia.org/wikipedia/commons/1/17/Air_Quality_Model_Runs_in_Equirectangular_Projection_%28SVS5518%29.png"],
  ["sst.jpg", "https://upload.wikimedia.org/wikipedia/commons/0/09/Sea_Surface_Temperature_%28SST%29_-_Near_Real_Time_%28SVS5101_-_sst_mur_print%29.jpg"],
  ["lightning.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/15/Lightning_Events_Detected_from_the_International_Space_Station_%28ISS%29_2017-2023_%28SVS5011_-_iss_lightning_sos_yearly_debug_2023_sos_2048p60_00420_print%29.jpg"],
]

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const request = get(url, { headers: { "User-Agent": "TerraSonora/1.0 (educational; local)" } }, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        download(response.headers.location, destination).then(resolve, reject)
        return
      }
      if (response.statusCode !== 200) {
        reject(new Error(`${response.statusCode} ${url}`))
        return
      }
      const type = response.headers["content-type"] ?? ""
      if (!type.startsWith("image/")) {
        reject(new Error(`Not an image (${type}) ${url}`))
        return
      }
      const file = createWriteStream(destination)
      response.pipe(file)
      file.on("finish", () => file.close(() => resolve(destination)))
    })
    request.setTimeout(90000, () => request.destroy(new Error(`Timed out: ${url}`)))
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
