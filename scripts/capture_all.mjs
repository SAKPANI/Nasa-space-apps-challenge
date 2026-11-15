import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const slides = [
  '/',
  '/#explorer',
  '/#parametres',
  '/#ecouter',
  '/#pays',
  '/#bibliotheque',
  '/#contact',
  '/#apropos',
];

const outputDir = path.resolve('reports', 'final-audit', 'screenshots');
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  for (const hash of slides) {
    const url = `http://localhost:5176${hash}`; // preview server
    console.log('Capturing', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    // wait a bit for animations
    await page.waitForTimeout(1500);
    const fileName = hash.replace('#', '').replace('/', 'home') + '.png';
    const filePath = path.join(outputDir, fileName);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log('Saved', filePath);
  }

  await browser.close();
})();
