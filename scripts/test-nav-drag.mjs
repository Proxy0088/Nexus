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

async function testNavDrag() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  const server = await serveDist(4177);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4177', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  // Find the indicator element
  const indicator = await page.$('.nexus-nav-sliding-indicator');
  const box = await indicator.boundingBox();
  console.log('Initial indicator box:', box);

  // Mouse down on indicator and drag it to the left (towards Network/Proxy)
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // Drag left by 320px
  await page.mouse.move(startX - 320, startY, { steps: 8 });
  await new Promise((r) => setTimeout(r, 100));

  // Take screenshot while dragging!
  const dragShotPath = path.resolve('public/screenshot-nav-mid-drag.png');
  await page.screenshot({ path: dragShotPath, type: 'png' });
  console.log('Saved mid-drag screenshot to:', dragShotPath);

  // Release mouse (drop to snap)
  await page.mouse.up();
  await new Promise((r) => setTimeout(r, 450));

  // Take screenshot after snap
  const snapShotPath = path.resolve('public/screenshot-nav-snapped.png');
  await page.screenshot({ path: snapShotPath, type: 'png' });
  console.log('Saved snapped screenshot to:', snapShotPath);

  await browser.close();
  server.close();
  console.log('Drag test finished successfully!');
}

testNavDrag().catch(console.error);
