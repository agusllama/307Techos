const fs = require('fs');
const matrix = JSON.parse(fs.readFileSync('auditoria/similarity_and_data_matrix.json', 'utf8')).dataMatrix;

console.log('--- Data Consistency Audit ---');
for (const [slug, data] of Object.entries(matrix)) {
  const issues = [];
  if (data.waNumberHrefs.length !== 1 || data.waNumberHrefs[0] !== '5492212269244') {
    issues.push(`WA href mismatch: ${JSON.stringify(data.waNumberHrefs)}`);
  }
  if (data.telHrefs.length !== 1 || data.telHrefs[0] !== '5492212269244') {
    issues.push(`Tel href mismatch: ${JSON.stringify(data.telHrefs)}`);
  }
  if (data.displayedPhones.length !== 1 || !data.displayedPhones[0].includes('221 226-9244')) {
    issues.push(`Displayed phone mismatch: ${JSON.stringify(data.displayedPhones)}`);
  }
  if (issues.length > 0) {
    console.log(`[${slug}] ${issues.join(' | ')}`);
  }
}
console.log('Check finished.');
