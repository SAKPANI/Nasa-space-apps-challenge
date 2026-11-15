import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

(async () => {
  const outDir = path.resolve('reports', 'final-audit', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const url = 'http://localhost:5176/';
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 120000 });
    // wait for the Three.js canvas to be present and a short moment for rendering
    await page.waitForSelector('canvas', { timeout: 20000 });
    await page.waitForTimeout(2000);
    const screenshotPath = path.join(outDir, 'home.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Captured home ->', screenshotPath);
  } catch (e) {
    console.error('Failed to capture home', e);
  }
  await browser.close();
})();
