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

async function testTabs() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  const server = await serveDist(4176);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4176', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  // Take screenshot on Home
  const homePath = path.resolve('public/screenshot-home-glass.png');
  await page.screenshot({ path: homePath, type: 'png' });
  fs.copyFileSync(homePath, path.resolve('screenshot-1440x900.png'));
  fs.copyFileSync(homePath, path.resolve('C:/Users/Reza/.gemini/antigravity/brain/6f81c9e7-0fea-44ac-9aa5-508809631644/screenshot-1440x900.png'));

  // Click on "Network" (3rd button from left)
  const buttons = await page.$$('.nexus-nav-item');
  if (buttons.length >= 3) {
    await buttons[2].click();
    await new Promise((r) => setTimeout(r, 450));
    const networkPath = path.resolve('public/screenshot-network-tab.png');
    await page.screenshot({ path: networkPath, type: 'png' });
    console.log('Saved network tab screenshot to:', networkPath);
  }

  await browser.close();
  server.close();
  console.log('Tab test completed successfully!');
}

testTabs().catch(console.error);
