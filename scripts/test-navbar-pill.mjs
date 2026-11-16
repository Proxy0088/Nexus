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

async function verify() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const server = await serveDist(4199);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4199', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 700));

  // 1. Home tab — full screenshot
  const homePath = path.resolve('public/screenshot-home.png');
  await page.screenshot({ path: homePath, type: 'png' });
  fs.copyFileSync(homePath, path.join(artifactDir, 'screenshot-1440x900.png'));
  console.log('✅ Home screenshot saved');

  // 2. Navbar crop — show the glass pill on Home tab
  const nav = await page.$('.nexus-bottom-nav-container');
  if (nav) {
    const navPath = path.resolve('public/navbar-home.png');
    await nav.screenshot({ path: navPath });
    fs.copyFileSync(navPath, path.join(artifactDir, 'navbar-home.png'));
    console.log('✅ Navbar (Home active) crop saved');
  }

  // 3. Click Network tab — verify pill slides
  const buttons = await page.$$('.nexus-nav-item');
  if (buttons.length >= 3) {
    await buttons[2].click();
    await new Promise((r) => setTimeout(r, 400));

    const netPath = path.resolve('public/screenshot-network.png');
    await page.screenshot({ path: netPath, type: 'png' });
    fs.copyFileSync(netPath, path.join(artifactDir, 'screenshot-network-tab.png'));
    console.log('✅ Network tab screenshot saved');

    const navNet = await page.$('.nexus-bottom-nav-container');
    if (navNet) {
      const navNetPath = path.resolve('public/navbar-network.png');
      await navNet.screenshot({ path: navNetPath });
      fs.copyFileSync(navNetPath, path.join(artifactDir, 'navbar-network.png'));
      console.log('✅ Navbar (Network active) crop saved');
    }
  }

  // 4. Click Proxy tab — verify another position
  if (buttons.length >= 4) {
    await buttons[3].click();
    await new Promise((r) => setTimeout(r, 400));

    const navProxy = await page.$('.nexus-bottom-nav-container');
    if (navProxy) {
      const navProxyPath = path.resolve('public/navbar-proxy.png');
      await navProxy.screenshot({ path: navProxyPath });
      fs.copyFileSync(navProxyPath, path.join(artifactDir, 'navbar-proxy.png'));
      console.log('✅ Navbar (Proxy active) crop saved');
    }
  }

  await browser.close();
  server.close();
  console.log('🎉 All navbar glass pill verifications completed!');
}

verify().catch(console.error);
