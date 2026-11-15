import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const distDir = path.resolve('dist');
const artifactDir = 'C:/Users/dc/.gemini/antigravity/brain/7b646ca1-438a-4437-b68f-8055c48f6ba7';
fs.mkdirSync(artifactDir, { recursive: true });

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(distDir, reqPath);

  // Fallback to public if not in dist
  if (!fs.existsSync(filePath)) {
    const publicPath = path.join(path.resolve('public'), reqPath);
    if (fs.existsSync(publicPath)) {
      filePath = publicPath;
    } else {
      filePath = path.join(distDir, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(4173, async () => {
  console.log('Static server listening on 4173');
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 1440px Desktop
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));
    const path1440 = path.join(artifactDir, 'capture_1440_stage1_3.png');
    await page.screenshot({ path: path1440 });
    console.log('Saved 1440px ->', path1440);

    // 390px Mobile
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));
    const path390 = path.join(artifactDir, 'capture_390_stage1_3.png');
    await page.screenshot({ path: path390 });
    console.log('Saved 390px ->', path390);

    await browser.close();
  } catch (err) {
    console.error('Puppeteer capture error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
