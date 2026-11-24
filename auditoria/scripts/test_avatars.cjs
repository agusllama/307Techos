const { chromium } = require('@playwright/test');
const http = require('http');
const path = require('path');
const fs = require('fs');

const distDir = path.resolve('dist');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  else if (!path.extname(reqPath)) reqPath += '/index.html';
  const filePath = path.join(distDir, reqPath.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(4335, async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4335/almirante-brown/', { waitUntil: 'networkidle' });

  // Before scroll
  const beforeScroll = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img[src*="avatar"]')).map(img => ({
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      loading: img.loading
    }));
  });
  console.log('Before scroll into view:', beforeScroll);

  // Scroll marquee into view
  await page.locator('section[aria-label="Opiniones de clientes"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const afterScroll = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img[src*="avatar"]')).map(img => ({
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      loading: img.loading
    }));
  });
  console.log('After scroll into view:', afterScroll);

  await browser.close();
  server.close();
});
