import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const server = http.createServer((req, res) => {
  let p = req.url === '/' ? '/index.html' : req.url;
  let file = path.join(process.cwd(), 'dist', p);
  if (fs.existsSync(file)) {
    if (file.endsWith('.js')) res.writeHead(200, { 'Content-Type': 'application/javascript' });
    else if (file.endsWith('.css')) res.writeHead(200, { 'Content-Type': 'text/css' });
    else if (file.endsWith('.html')) res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(file));
  } else res.writeHead(404).end();
}).listen(4311, async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4311', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const ind = await page.$('.nexus-nav-sliding-indicator');
  const box = await ind.boundingBox();

  // Move mouse to indicator and press down
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await new Promise(r => setTimeout(r, 50));

  // Drag left by 350px
  await page.mouse.move(box.x + box.width / 2 - 350, box.y + box.height / 2, { steps: 10 });
  await new Promise(r => setTimeout(r, 300));

  // Screenshot while still holding mouse down
  const fullPath = path.resolve('public/drag-live-action.png');
  await page.screenshot({ path: fullPath });
  fs.copyFileSync(fullPath, 'C:/Users/Reza/.gemini/antigravity/brain/6f81c9e7-0fea-44ac-9aa5-508809631644/drag-live-action.png');
  console.log('Saved drag-live-action.png');

  await page.mouse.up();
  await browser.close();
  server.close();
});
