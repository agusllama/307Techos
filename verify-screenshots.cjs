const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'dist', req.url.split('?')[0]);
  if (req.url === '/' || req.url.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  } else if (!path.extname(filePath)) {
    filePath = path.join(filePath, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(4322, async () => {
  console.log('Server running on 4322');
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless=new']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4322/', { waitUntil: 'networkidle0' });

    // Measure positions for initial viewport peek
    const metrics = await page.evaluate(() => {
      const hero = document.querySelector('section');
      const marqueeSection = document.querySelector('section[aria-label="Opiniones de clientes"]');
      const microBadge = marqueeSection ? marqueeSection.querySelector('.inline-flex') : null;
      const firstCard = marqueeSection ? marqueeSection.querySelector('.review-card') : null;

      const vh = window.innerHeight; // 812
      const heroRect = hero ? hero.getBoundingClientRect() : null;
      const marqueeRect = marqueeSection ? marqueeSection.getBoundingClientRect() : null;
      const badgeRect = microBadge ? microBadge.getBoundingClientRect() : null;
      const cardRect = firstCard ? firstCard.getBoundingClientRect() : null;

      return {
        viewportHeight: vh,
        heroBottom: heroRect ? heroRect.bottom : null,
        marqueeTop: marqueeRect ? marqueeRect.top : null,
        badgeTop: badgeRect ? badgeRect.top : null,
        badgeBottom: badgeRect ? badgeRect.bottom : null,
        cardTop: cardRect ? cardRect.top : null,
        cardPeekingPixels: cardRect ? Math.max(0, vh - cardRect.top) : 0,
      };
    });

    console.log('Peek metrics at initial viewport (375x812):', JSON.stringify(metrics, null, 2));

    // 1. Screenshot initial hero with peek
    await page.screenshot({ path: 'shot-hero-peek-mobile.png' });
    console.log('Saved shot-hero-peek-mobile.png');

    // 2. Scroll to reveal marquee fully
    await page.evaluate(() => {
      window.scrollTo(0, 400);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'shot-marquee-visible-mobile.png' });
    console.log('Saved shot-marquee-visible-mobile.png');

    // 3. Zone page check
    await page.goto('http://localhost:4322/capital-federal/', { waitUntil: 'networkidle0' });
    const zoneMetrics = await page.evaluate(() => {
      const card = document.querySelector('.review-card');
      return {
        viewportHeight: window.innerHeight,
        cardTop: card ? card.getBoundingClientRect().top : null,
        cardPeekingPixels: card ? Math.max(0, window.innerHeight - card.getBoundingClientRect().top) : 0,
      };
    });
    console.log('Zone page peek metrics:', JSON.stringify(zoneMetrics, null, 2));
    await page.screenshot({ path: 'shot-zone-peek-mobile.png' });
    console.log('Saved shot-zone-peek-mobile.png');

    // 4. Blog detail page check
    await page.goto('http://localhost:4322/blog/por-que-se-cae-techo-peugeot-307/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const section = document.querySelector('section[aria-label="Opiniones de clientes"]');
      if (section) section.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'shot-blog-marquee-mobile.png' });
    console.log('Saved shot-blog-marquee-mobile.png');

    // 5. Blog index page check
    await page.goto('http://localhost:4322/blog/', { waitUntil: 'networkidle0' });
    const blogIndexMetrics = await page.evaluate(() => {
      const firstArticle = document.querySelector('article');
      return {
        viewportHeight: window.innerHeight,
        articleTop: firstArticle ? firstArticle.getBoundingClientRect().top : null,
        articlePeekingPixels: firstArticle ? Math.max(0, window.innerHeight - firstArticle.getBoundingClientRect().top) : 0,
      };
    });
    console.log('Blog index peek metrics:', JSON.stringify(blogIndexMetrics, null, 2));
    await page.screenshot({ path: 'shot-blog-index-mobile.png' });
    console.log('Saved shot-blog-index-mobile.png');

    await browser.close();
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    server.close();
    console.log('Done verification');
  }
});
