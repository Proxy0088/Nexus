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

async function verifyProxy() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const server = await serveDist(4250);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4250', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 700));

  // 1. Initial Home Tab Screenshot (Regression baseline)
  const homePath = path.join(artifactDir, 'verification-regression-home.png');
  await page.screenshot({ path: homePath, type: 'png' });
  console.log('✅ Home regression screenshot saved');

  // 2. Click Proxy Tab in BottomNav (Proxy is 4th item, index 3: Tools, Project, Network, Proxy)
  const buttons = await page.$$('.nexus-nav-item');
  console.log(`Found ${buttons.length} navigation buttons`);
  if (buttons.length >= 4) {
    await buttons[3].click(); // Click Proxy
    await new Promise((r) => setTimeout(r, 600));

    // Full application screenshot with Proxy tab active
    const proxyInitialPath = path.join(artifactDir, 'verification-proxy-initial.png');
    await page.screenshot({ path: proxyInitialPath, type: 'png' });
    console.log('✅ Proxy initial viewport full screenshot saved');

    // Crop of Frame 5 (the proxy page panel)
    const proxyFrame = await page.$('.proxy-page');
    if (proxyFrame) {
      const frameCropPath = path.join(artifactDir, 'verification-proxy-frame5.png');
      await proxyFrame.screenshot({ path: frameCropPath });
      console.log('✅ Proxy Frame 5 crop saved');
    }

    // 3. Test Scroll inside Proxy scroll container
    await page.evaluate(() => {
      const scrollEl = document.querySelector('.proxy-scroll-container');
      if (scrollEl) {
        scrollEl.scrollTop = 380;
      }
    });
    await new Promise((r) => setTimeout(r, 400));

    const proxyScrolled1Path = path.join(artifactDir, 'verification-proxy-scrolled-mid.png');
    await page.screenshot({ path: proxyScrolled1Path, type: 'png' });
    console.log('✅ Proxy scrolled (mid - profiles & config) screenshot saved');

    // Scroll deeper to see routing and diagnostics
    await page.evaluate(() => {
      const scrollEl = document.querySelector('.proxy-scroll-container');
      if (scrollEl) {
        scrollEl.scrollTop = 850;
      }
    });
    await new Promise((r) => setTimeout(r, 400));

    const proxyScrolled2Path = path.join(artifactDir, 'verification-proxy-scrolled-bottom.png');
    await page.screenshot({ path: proxyScrolled2Path, type: 'png' });
    console.log('✅ Proxy scrolled (bottom - routing & diagnostics) screenshot saved');

    // 4. Return to Home Tab to ensure zero regression
    if (buttons.length >= 6) {
      await buttons[5].click(); // Click Home
      await new Promise((r) => setTimeout(r, 500));

      const homeReturnedPath = path.join(artifactDir, 'verification-return-home.png');
      await page.screenshot({ path: homeReturnedPath, type: 'png' });
      console.log('✅ Returned to Home tab screenshot saved');
    }
  }

  await browser.close();
  server.close();
  console.log('🎉 Verification complete!');
}

verifyProxy().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
