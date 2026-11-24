const fs = require('fs');

const data = JSON.parse(fs.readFileSync('auditoria/visual_and_axe_results.json', 'utf8'));

for (const [slug, item] of Object.entries(data)) {
  if (item.axeViolations) {
    const mismatch = item.axeViolations.find(v => v.id === 'label-content-name-mismatch');
    if (mismatch) {
      console.log(`[${slug}] label-content-name-mismatch sample:`);
      mismatch.nodes.forEach(n => {
        console.log(`  Target: ${n.target.join(' ')}`);
        console.log(`  HTML: ${n.html}`);
        console.log(`  Failure: ${n.failureSummary}`);
      });
      break;
    }
  }
}
