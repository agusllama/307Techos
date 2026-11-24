const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

const distDir = path.resolve('dist');

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
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 4330;

const targets = [
  { name: 'home', path: '/' },
  { name: 'zona-capital-federal', path: '/capital-federal/' },
  { name: 'zona-mar-del-plata', path: '/mar-del-plata/' },
  { name: 'zona-la-plata', path: '/la-plata/' },
  { name: 'blog-vtv', path: '/blog/techo-caido-peugeot-307-vtv/' },
  { name: 'blog-por-que-se-cae', path: '/blog/por-que-se-cae-techo-peugeot-307/' },
];

async function main() {
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server running at http://127.0.0.1:${PORT}`);

  const results = {};

  for (const t of targets) {
    console.log(`Running Lighthouse mobile on ${t.name} (${t.path})...`);
    const outputPath = path.join('auditoria', `lighthouse_${t.name}.json`);
    const cmd = `npx --yes lighthouse http://127.0.0.1:${PORT}${t.path} --form-factor=mobile --screenEmulation.mobile=true --output=json --output-path="${outputPath}" --chrome-flags="--headless" --quiet --only-categories=performance`;
    
    try {
      execSync(cmd, { stdio: 'inherit' });
      const raw = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      const audits = raw.audits;
      results[t.name] = {
        name: t.name,
        path: t.path,
        performanceScore: Math.round(raw.categories.performance.score * 100),
        FCP: audits['first-contentful-paint'] ? audits['first-contentful-paint'].displayValue : null,
        LCP: audits['largest-contentful-paint'] ? audits['largest-contentful-paint'].displayValue : null,
        CLS: audits['cumulative-layout-shift'] ? audits['cumulative-layout-shift'].displayValue : null,
        TBT: audits['total-blocking-time'] ? audits['total-blocking-time'].displayValue : null,
        SI: audits['speed-index'] ? audits['speed-index'].displayValue : null,
        opportunities: Object.keys(audits)
          .filter(k => audits[k].details && audits[k].details.type === 'opportunity' && audits[k].score !== null && audits[k].score < 1)
          .map(k => ({
            id: k,
            title: audits[k].title,
            description: audits[k].description,
            displayValue: audits[k].displayValue,
            score: audits[k].score
          }))
      };
      console.log(`-> ${t.name}: Score=${results[t.name].performanceScore}, LCP=${results[t.name].LCP}, CLS=${results[t.name].CLS}, TBT=${results[t.name].TBT}`);
    } catch (e) {
      console.error(`Error on ${t.name}:`, e.message);
    }
  }

  server.close();
  fs.writeFileSync('auditoria/lighthouse_summary.json', JSON.stringify(results, null, 2));
  console.log('Saved Lighthouse summary to auditoria/lighthouse_summary.json');
}

main().catch(console.error);
