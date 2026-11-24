const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targets = [
  { slug: 'home', url: 'http://localhost:4321/' },
  { slug: 'capital-federal', url: 'http://localhost:4321/capital-federal/' },
  { slug: 'mar-del-plata', url: 'http://localhost:4321/mar-del-plata/' },
  { slug: 'la-plata', url: 'http://localhost:4321/la-plata/' },
  { slug: 'blog__por-que-se-cae', url: 'http://localhost:4321/blog/por-que-se-cae-techo-peugeot-307/' },
  { slug: 'blog__techo-caido-vtv', url: 'http://localhost:4321/blog/techo-caido-peugeot-307-vtv/' }
];

const results = {};

for (const t of targets) {
  const jsonPath = path.join('auditoria', `lh_mobile_${t.slug}.json`);
  const cmd = `npx --yes lighthouse "${t.url}" --form-factor=mobile --screenEmulation.mobile=true --throttling-method=simulate --output=json --output-path="${jsonPath}" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance --quiet`;
  console.log(`Running Lighthouse Mobile on ${t.slug} (${t.url})...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const audits = raw.audits;
    
    // Extract main opportunities
    const opportunities = Object.keys(audits)
      .filter(k => audits[k].details && audits[k].details.type === 'opportunity' && audits[k].score !== null && audits[k].score < 1)
      .map(k => ({
        id: k,
        title: audits[k].title,
        displayValue: audits[k].displayValue || '',
        score: audits[k].score
      }));

    results[t.slug] = {
      slug: t.slug,
      url: t.url,
      performanceScore: Math.round(raw.categories.performance.score * 100),
      FCP: audits['first-contentful-paint'] ? audits['first-contentful-paint'].displayValue : 'N/A',
      LCP: audits['largest-contentful-paint'] ? audits['largest-contentful-paint'].displayValue : 'N/A',
      CLS: audits['cumulative-layout-shift'] ? audits['cumulative-layout-shift'].displayValue : 'N/A',
      TBT: audits['total-blocking-time'] ? audits['total-blocking-time'].displayValue : 'N/A',
      SI: audits['speed-index'] ? audits['speed-index'].displayValue : 'N/A',
      opportunities
    };
    console.log(`-> ${t.slug}: Score=${results[t.slug].performanceScore}, LCP=${results[t.slug].LCP}, CLS=${results[t.slug].CLS}, TBT=${results[t.slug].TBT}`);
  } catch (err) {
    console.error(`Error on ${t.slug}:`, err.message);
  }
}

fs.writeFileSync('auditoria/lighthouse_mobile_results.json', JSON.stringify(results, null, 2));
console.log('Saved Lighthouse mobile results to auditoria/lighthouse_mobile_results.json');
