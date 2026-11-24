const fs = require('fs');
const results = JSON.parse(fs.readFileSync('auditoria/phase0_phase1_results.json', 'utf8'));

const byPattern = {};
results.brokenTextFindings.forEach(f => {
  byPattern[f.pattern] = (byPattern[f.pattern] || 0) + 1;
});
console.log('Breakdown by pattern:', byPattern);

// Show unique snippets for each pattern
for (const pattern of Object.keys(byPattern)) {
  console.log(`\n=== Pattern: ${pattern} ===`);
  const samples = results.brokenTextFindings.filter(f => f.pattern === pattern).slice(0, 5);
  samples.forEach(s => {
    console.log(`File: ${s.file} | Snippet: ${s.snippet}`);
  });
}
