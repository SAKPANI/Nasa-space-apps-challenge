// scripts/fetch_power_data.mjs
// Simple Node script to fetch NASA POWER temperature (T2M) and precipitation (PRECTOTCORR)
// for a predefined list of locations and years 2012‑2023.
// Results are stored as JSON files under src/data/ (temperature.json, precipitation.json).

import { writeFile } from 'node:fs/promises';
import { get } from 'node:https';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// ---- Configuration ----
const locations = [
  // lat, lon, name
  { name: 'Côte d\'Azur', lat: 43.2965, lon: 5.3698 },
  { name: 'Sahara', lat: 23.4162, lon: 25.6628 },
  { name: 'Amazonas', lat: -3.4653, lon: -62.2159 },
  { name: 'Tibet', lat: 31.0, lon: 91.0 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
];

const startYear = 2012;
const endYear = 2023;
const parameters = ['T2M', 'PRECTOTCORR']; // Temperature (°C) & Precipitation (mm/day)

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');

/** Simple HTTPS GET wrapper returning JSON */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error('Timeout'));
    });
  });
}

async function main() {
  await writeFile(root, '', { flag: 'wx' }).catch(() => {}); // ensure folder exists
  const tempData = {};
  const precipData = {};

  for (const loc of locations) {
    const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${parameters.join(',')}&community=AG&latitude=${loc.lat}&longitude=${loc.lon}&start=${startYear}&end=${endYear}&format=JSON`;
    console.log(`Fetching ${loc.name} → ${url}`);
    const json = await fetchJson(url);
    const values = json.properties.parameter;
    // values is an object with keys T2M, PRECTOTCORR each mapping to year-month strings
    tempData[loc.name] = values.T2M; // e.g., { "2012-01": 15.2, ... }
    precipData[loc.name] = values.PRECTOTCORR;
  }

  // Write files
  await writeFile(join(root, 'temperature.json'), JSON.stringify(tempData, null, 2), 'utf8');
  await writeFile(join(root, 'precipitation.json'), JSON.stringify(precipData, null, 2), 'utf8');
  console.log('Data written to src/data');
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
