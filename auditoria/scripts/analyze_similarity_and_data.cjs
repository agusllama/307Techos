const fs = require('fs');
const path = require('path');

const pagesData = JSON.parse(fs.readFileSync('auditoria/pages_extracted.json', 'utf8'));

// Filter only the 27 zone pages
const zoneSlugs = [
  'almirante-brown', 'avellaneda', 'berazategui', 'capital-federal', 'esteban-echeverria',
  'ezeiza-canning', 'florencio-varela', 'general-san-martin', 'ituzaingo', 'la-matanza',
  'la-plata', 'lanus', 'lomas-de-zamora', 'moron', 'pilar', 'quilmes', 'san-isidro',
  'tigre', 'tres-de-febrero', 'vicente-lopez',
  'mar-del-plata', 'pinamar', 'villa-gesell', 'partido-de-la-costa', 'san-bernardo', 'mar-de-ajo',
  'interior-buenos-aires'
];

// Helper: word n-grams / token set
function getShingles(text, k = 3) {
  const words = text.toLowerCase().replace(/[^\wáéíóúñ]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const shingles = new Set();
  for (let i = 0; i <= words.length - k; i++) {
    shingles.add(words.slice(i, i + k).join(' '));
  }
  return shingles;
}

function jaccardSimilarity(setA, setB) {
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// 1. Compute pairwise similarity
const similarities = [];
for (let i = 0; i < zoneSlugs.length; i++) {
  const slugA = zoneSlugs[i];
  const pageA = pagesData[slugA];
  if (!pageA) continue;
  const shinglesA = getShingles(pageA.mainText, 3);

  for (let j = i + 1; j < zoneSlugs.length; j++) {
    const slugB = zoneSlugs[j];
    const pageB = pagesData[slugB];
    if (!pageB) continue;
    const shinglesB = getShingles(pageB.mainText, 3);

    const sim = jaccardSimilarity(shinglesA, shinglesB);
    similarities.push({
      zoneA: slugA,
      zoneB: slugB,
      similarity: parseFloat((sim * 100).toFixed(2))
    });
  }
}

similarities.sort((a, b) => b.similarity - a.similarity);
console.log('Top 15 most similar zone page pairs (Jaccard on 3-word shingles of main text):');
similarities.slice(0, 15).forEach(s => {
  console.log(`  ${s.zoneA} <-> ${s.zoneB}: ${s.similarity}%`);
});

// 2. Data consistency analysis across ALL 34 pages
const allSlugs = Object.keys(pagesData);
const dataMatrix = {};

for (const slug of allSlugs) {
  const page = pagesData[slug];
  const raw = page.rawText;
  const fullHtml = fs.readFileSync(path.join('dist', page.file), 'utf8');

  // WhatsApp numbers found
  const waNumbers = [...fullHtml.matchAll(/wa\.me\/(\d+)/g)].map(m => m[1]);
  const telNumbers = [...fullHtml.matchAll(/href=["']tel:\+?(\d+)["']/g)].map(m => m[1]);
  const displayedPhones = [...raw.matchAll(/(?:\+54\s*9?\s*)?(?:11|221)\s*\d{3,4}[-\s]?\d{4}/g)].map(m => m[0]);

  // Horarios
  const horarioMatches = [...raw.matchAll(/Lunes\s+a\s+S[aá]bado[s]?,?\s*\d{1,2}:\d{2}\s*a\s*\d{1,2}:\d{2}(?:\s*hs)?/gi)].map(m => m[0]);

  // Plazos ("menos de 2 horas", etc.)
  const plazoMatches = [...raw.matchAll(/(?:menos\s+de\s+2\s+horas|\d+\s+horas?|\d+\s+min(?:utos)?)/gi)].map(m => m[0]);

  // Garantia ("12 meses", etc.)
  const garantiaMatches = [...raw.matchAll(/(?:garant[íi]a(?:\s+escrita)?(?:\s+por)?\s+\d+\s+meses|\d+\s+meses\s+de\s+garant[íi]a)/gi)].map(m => m[0]);

  // Cupos ("6 turnos por semana", etc.)
  const cupoMatches = [...raw.matchAll(/\d+\s+turnos?(?:\s+por\s+semana)?/gi)].map(m => m[0]);

  // Precios / Cotizaciones
  const precioMatches = [...raw.matchAll(/\$\s*\d+[\d.,]*|precio|cotizac/gi)].map(m => m[0]);

  // Nombre del negocio
  const businessMentions = [...raw.matchAll(/307\s+Techos/gi)].map(m => m[0]);

  dataMatrix[slug] = {
    file: page.file,
    waNumberHrefs: [...new Set(waNumbers)],
    telHrefs: [...new Set(telNumbers)],
    displayedPhones: [...new Set(displayedPhones)],
    horarios: [...new Set(horarioMatches)],
    plazos: [...new Set(plazoMatches)],
    garantias: [...new Set(garantiaMatches)],
    cupos: [...new Set(cupoMatches)],
    precioMentionsCount: precioMatches.length,
    businessMentionsCount: businessMentions.length
  };
}

fs.writeFileSync('auditoria/similarity_and_data_matrix.json', JSON.stringify({
  topSimilarities: similarities.slice(0, 30),
  allSimilaritiesCount: similarities.length,
  dataMatrix
}, null, 2));

console.log('Saved similarity and data matrix to auditoria/similarity_and_data_matrix.json');
