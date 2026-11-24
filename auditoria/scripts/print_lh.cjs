const fs = require('fs');
const lh = JSON.parse(fs.readFileSync('auditoria/lighthouse_mobile_results.json', 'utf8'));

console.log('Lighthouse Mobile Results Summary:');
for (const [k, v] of Object.entries(lh)) {
  console.log(`- ${k}: Score=${v.performanceScore}, LCP=${v.LCP}, CLS=${v.CLS}, TBT=${v.TBT}`);
  if (v.opportunities.length > 0) {
    console.log(`  Opportunities:`, v.opportunities.map(o => `${o.title} (${o.displayValue})`));
  }
}
