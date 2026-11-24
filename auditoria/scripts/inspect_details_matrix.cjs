const fs = require('fs');
const matrix = JSON.parse(fs.readFileSync('auditoria/similarity_and_data_matrix.json', 'utf8')).dataMatrix;

for (const [slug, data] of Object.entries(matrix)) {
  console.log(`[${slug}]`);
  console.log(`  Horarios: ${JSON.stringify(data.horarios)}`);
  console.log(`  Garantía: ${JSON.stringify(data.garantias)}`);
  console.log(`  Cupos: ${JSON.stringify(data.cupos)}`);
  console.log(`  Plazos: ${JSON.stringify(data.plazos)}`);
}
