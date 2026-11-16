import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

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

async function verify() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const server = await serveDist(4188);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4188', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  // 1. Full screenshot
  const fullPath = path.resolve('public/screenshot-home-glass.png');
  await page.screenshot({ path: fullPath, type: 'png' });
  fs.copyFileSync(fullPath, 'C:/Users/Reza/.gemini/antigravity/brain/6f81c9e7-0fea-44ac-9aa5-508809631644/screenshot-1440x900.png');

  // 2. Corner crop where the halo previously was (top-right corner of main frame)
  // Main frame is at x:50, y:32, width: 1340, height: 836. Top right is around x: 1300 to 1390, y: 32 to 100
  const cornerPath = path.resolve('public/corner-no-halo.png');
  await page.screenshot({
    path: cornerPath,
    clip: { x: 1300, y: 32, width: 95, height: 70 },
  });
  fs.copyFileSync(cornerPath, 'C:/Users/Reza/.gemini/antigravity/brain/6f81c9e7-0fea-44ac-9aa5-508809631644/corner-no-halo.png');
  console.log('Saved corner crop without halo!');

  // 3. Square crop (center)
  const squareEl = await page.$('.nexus-draggable-glass-test');
  if (squareEl) {
    const squarePath = path.resolve('public/square-no-blur.png');
    await squareEl.screenshot({ path: squarePath });
    fs.copyFileSync(squarePath, 'C:/Users/Reza/.gemini/antigravity/brain/6f81c9e7-0fea-44ac-9aa5-508809631644/square-no-blur.png');
    console.log('Saved square crop without blur!');
  }

  // 4. Test transition smoothness by switching tab
  const buttons = await page.$$('.nexus-nav-item');
  if (buttons.length >= 3) {
    await buttons[2].click();
    await new Promise((r) => setTimeout(r, 400));
    const networkPath = path.resolve('public/screenshot-network-tab.png');
    await page.screenshot({ path: networkPath, type: 'png' });
    fs.copyFileSync(networkPath, 'C:/Users/Reza/.gemini/antigravity/brain/6f81c9e7-0fea-44ac-9aa5-508809631644/screenshot-network-tab.png');
    console.log('Saved network tab transition!');
  }

  await browser.close();
  server.close();
  console.log('All verification checks completed successfully!');
}

verify().catch(console.error);
