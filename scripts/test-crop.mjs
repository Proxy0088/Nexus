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
}).listen(4305, async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4305', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const nav = await page.$('.nexus-bottom-nav-container');
  if (nav) {
    const cropPath = path.resolve('public/navbar-crop.png');
    await nav.screenshot({ path: cropPath });
    fs.copyFileSync(cropPath, 'C:/Users/Reza/.gemini/antigravity/brain/6f81c9e7-0fea-44ac-9aa5-508809631644/navbar-crop.png');
    console.log('Saved navbar-crop.png');
  }
  await browser.close();
  server.close();
});
