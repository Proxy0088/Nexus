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

const artifactDir = 'C:/Users/Reza/.gemini/antigravity/brain/6f81c9e7-0fea-44ac-9aa5-508809631644';

async function verifySphereParallax() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const server = await serveDist(4260);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4260', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  // Click Proxy Tab
  const buttons = await page.$$('.nexus-nav-item');
  if (buttons.length >= 4) {
    await buttons[3].click(); // Proxy
    await new Promise((r) => setTimeout(r, 600));

    // 1. Move mouse to Top-Left of proxy frame
    const proxyFrame = await page.$('.proxy-page');
    if (proxyFrame) {
      const box = await proxyFrame.boundingBox();
      if (box) {
        // Move to left side
        await page.mouse.move(box.x + 100, box.y + 100);
        await new Promise((r) => setTimeout(r, 400));
        await page.screenshot({
          path: path.join(artifactDir, 'verification-sphere-topleft.png'),
          type: 'png',
        });
        console.log('✅ Sphere top-left parallax screenshot saved');

        // Move to bottom-right side
        await page.mouse.move(box.x + box.width - 100, box.y + box.height - 100);
        await new Promise((r) => setTimeout(r, 400));
        await page.screenshot({
          path: path.join(artifactDir, 'verification-sphere-bottomright.png'),
          type: 'png',
        });
        console.log('✅ Sphere bottom-right parallax screenshot saved');
      }
    }
  }

  await browser.close();
  server.close();
  console.log('🎉 Parallax verification complete!');
}

verifySphereParallax().catch((err) => {
  console.error('Error during parallax test:', err);
  process.exit(1);
});
