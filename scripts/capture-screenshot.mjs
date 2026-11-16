import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import http from 'http';

function serveDist(port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(process.cwd(), 'dist', reqPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

async function capture() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  console.log('Using browser binary:', executablePath);

  const server = await serveDist(4173);
  console.log('Serving dist on http://127.0.0.1:4173');

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
    },
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://127.0.0.1:4173...');
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle0' });

  // Give a small delay for WebGL rendering and font loading
  await new Promise((r) => setTimeout(r, 1200));

  const outPath = path.resolve('public/screenshot-1440x900.png');
  const rootOutPath = path.resolve('screenshot-1440x900.png');
  const artifactPath = path.resolve('C:/Users/Reza/.gemini/antigravity/brain/6f81c9e7-0fea-44ac-9aa5-508809631644/screenshot-1440x900.png');

  await page.screenshot({ path: outPath, type: 'png' });
  fs.copyFileSync(outPath, rootOutPath);
  try {
    fs.copyFileSync(outPath, artifactPath);
  } catch (e) {
    console.warn('Could not copy to artifact path:', e.message);
  }

  console.log('Successfully captured screenshot at:', outPath);
  await browser.close();
  server.close();
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
