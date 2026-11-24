const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('@playwright/test');

const distDir = path.resolve('dist');

// Setup static file server for dist/
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) {
    reqPath += 'index.html';
  } else if (!path.extname(reqPath)) {
    reqPath += '/index.html';
  }

  const filePath = path.join(distDir, reqPath.replace(/^\//, ''));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // 404 fallback
    const f404 = path.join(distDir, '404.html');
    if (fs.existsSync(f404)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(f404).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});

const PORT = 4329;
const axeSource = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

const pagesData = JSON.parse(fs.readFileSync('auditoria/pages_extracted.json', 'utf8'));
const slugs = Object.keys(pagesData);

const viewports = [
  { name: '360', width: 360, height: 740 },
  { name: '390', width: 390, height: 844 },
  { name: '430', width: 430, height: 932 }
];

async function runAudit() {
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Test server running at http://127.0.0.1:${PORT}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const results = {};

  for (let sIdx = 0; sIdx < slugs.length; sIdx++) {
    const slug = slugs[sIdx];
    const pageInfo = pagesData[slug];
    const route = slug === 'home' ? '/' : (slug.startsWith('blog/') ? `/${slug}/` : (slug === '404' ? '/404.html' : `/${slug}/`));

    console.log(`[${sIdx + 1}/${slugs.length}] Auditing ${route} (${slug})...`);
    results[slug] = {
      slug,
      route,
      horizontalScroll: {},
      touchTargets: [],
      brokenImages: [],
      contrastIssues: [],
      whatsappIssues: [],
      axeViolations: []
    };

    // 1. Run at 375/390 for axe and comprehensive checks
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();

    try {
      await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'networkidle' });

      // Check broken images
      const brokenImgs = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.filter(img => img.naturalWidth === 0).map(img => ({
          src: img.src,
          alt: img.alt,
          outerHTML: img.outerHTML.slice(0, 100)
        }));
      });
      results[slug].brokenImages = brokenImgs;

      // Check touch targets (< 44px)
      const touchIssues = await page.evaluate(() => {
        const interactive = Array.from(document.querySelectorAll('a, button, summary'));
        const issues = [];
        for (const el of interactive) {
          // If inline in paragraph, ignore
          const isInline = window.getComputedStyle(el).display === 'inline';
          if (isInline && el.closest('p')) continue;

          const rect = el.getBoundingClientRect();
          // only if visible
          if (rect.width > 0 && rect.height > 0) {
            if (rect.width < 44 || rect.height < 44) {
              issues.push({
                tag: el.tagName.toLowerCase(),
                text: el.innerText.trim().slice(0, 50),
                href: el.getAttribute('href') || '',
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                outerHTML: el.outerHTML.slice(0, 120)
              });
            }
          }
        }
        return issues;
      });
      results[slug].touchTargets = touchIssues;

      // Check WhatsApp links
      const waLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="wa.me"]'));
        return links.map(l => ({
          href: l.getAttribute('href'),
          text: l.innerText.trim().slice(0, 50),
          onclick: l.getAttribute('onclick'),
          hasOnclick: Boolean(l.getAttribute('onclick'))
        }));
      });
      results[slug].whatsappLinks = waLinks;

      // Inject and run axe-core
      await page.evaluate(axeSource);
      const axeResults = await page.evaluate(async () => {
        // @ts-ignore
        return await axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
          }
        });
      });

      results[slug].axeViolations = (axeResults.violations || []).map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodesCount: v.nodes.length,
        nodes: v.nodes.slice(0, 5).map(n => ({
          html: n.html.slice(0, 120),
          target: n.target,
          failureSummary: n.failureSummary
        }))
      }));

    } catch (e) {
      console.error(`Error auditing ${route}:`, e.message);
    } finally {
      await page.close();
      await context.close();
    }

    // 2. Viewport screenshots and horizontal scroll check (360, 390, 430, +1280 for home)
    const viewportsToTest = [...viewports];
    if (slug === 'home') {
      viewportsToTest.push({ name: '1280', width: 1280, height: 800 });
    }

    const safeSlug = slug.replace(/\//g, '__');

    for (const vp of viewportsToTest) {
      const vpContext = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.width > 800 ? 1 : 2,
        isMobile: vp.width <= 800,
        hasTouch: vp.width <= 800
      });
      const vpPage = await vpContext.newPage();
      try {
        await vpPage.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'networkidle' });

        // Check horizontal scroll
        const hasHScroll = await vpPage.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth ||
                 document.body.scrollWidth > window.innerWidth;
        });
        results[slug].horizontalScroll[vp.name] = hasHScroll;

        // Screenshot
        const shotPath = path.join('auditoria', 'capturas', `${safeSlug}-${vp.name}.png`);
        await vpPage.screenshot({ path: shotPath, fullPage: true });

      } catch (err) {
        console.error(`Error in vp ${vp.name} on ${route}:`, err.message);
      } finally {
        await vpPage.close();
        await vpContext.close();
      }
    }
  }

  await browser.close();
  server.close();

  fs.writeFileSync('auditoria/visual_and_axe_results.json', JSON.stringify(results, null, 2));
  console.log('Saved visual and axe audit results to auditoria/visual_and_axe_results.json');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
