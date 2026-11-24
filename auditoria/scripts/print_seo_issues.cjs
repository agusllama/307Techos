const fs = require('fs');
const results = JSON.parse(fs.readFileSync('auditoria/seo_schema_results.json', 'utf8'));

let totalIssues = 0;
const bySeverity = { 'Crítico': 0, 'Alto': 0, 'Medio': 0, 'Bajo': 0 };

for (const [slug, data] of Object.entries(results)) {
  totalIssues += data.issuesCount;
  data.issues.forEach(iss => {
    bySeverity[iss.severity] = (bySeverity[iss.severity] || 0) + 1;
    console.log(`[${slug}] [${iss.severity}] ${iss.rule}: ${iss.message}`);
  });
}

console.log(`\nTotal SEO/Schema issues: ${totalIssues}`);
console.log('By severity:', bySeverity);
