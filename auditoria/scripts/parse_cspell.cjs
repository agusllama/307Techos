const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const res = spawnSync('npx', ['--yes', 'cspell', '-c', 'auditoria/cspell.json', 'auditoria/extracted_text/*_main.txt'], {
  encoding: 'utf8',
  shell: true
});

const output = res.stdout;
const lines = output.split('\n');

const issues = [];
for (const line of lines) {
  const match = line.match(/^([^\s:]+):(\d+):(\d+)\s+-\s+Unknown word\s+\(([^)]+)\)/);
  if (match) {
    const file = match[1];
    const lineNum = parseInt(match[2], 10);
    const colNum = parseInt(match[3], 10);
    const word = match[4];

    // Read context from file
    let context = '';
    try {
      const fileContent = fs.readFileSync(file, 'utf8');
      const start = Math.max(0, colNum - 30);
      const end = Math.min(fileContent.length, colNum + word.length + 30);
      context = fileContent.slice(start, end).replace(/\s+/g, ' ');
    } catch {}

    issues.push({
      file,
      slug: path.basename(file).replace('_main.txt', ''),
      col: colNum,
      word,
      context
    });
  }
}

console.log(`Total issues parsed: ${issues.length}`);

// Group by word
const wordMap = {};
issues.forEach(iss => {
  if (!wordMap[iss.word]) {
    wordMap[iss.word] = [];
  }
  wordMap[iss.word].push(iss);
});

console.log(`Unique unknown words: ${Object.keys(wordMap).length}`);

// Categorize words
// List of known rioplatense voseo
const voseoWords = new Set([
  'intentás', 'podés', 'Envianos', 'envianos', 'Seleccioná', 'MANDÁ', 'Mandá', 'mandás',
  'manejás', 'mirás', 'Deslizá', 'Evitá', 'ahorrás', 'Resolvelo', 'necesitás', 'notás',
  'reservás', 'arriesgás', 'encendés', 'enviás', 'Tenés', 'tenés', 'quedás', 'Conocé',
  'encontrás', 'contás', 'Abonás', 'abonás', 'pagás', 'Escribinos', 'escribinos',
  'consultanos', 'Consultanos', 'avisanos', 'Avisanos', 'coordiná', 'Coordiná',
  'mostranos', 'Mostranos'
]);

// Proper names / toponyms / brand terms
const properNames = new Set([
  'Rossi', 'Hernán', 'Hipólito', 'Monteverde', 'Echeverría', 'Guillón', 'Jagüel',
  'Pueyrredon', 'Bartolome', 'Sarsfield', 'Ortúzar', 'Nuñez', 'Cristobal', 'Ballester',
  'Tristán', 'Spegazzini', 'Florencio', 'Varela', 'Vatteone', 'Chilavert', 'Ayre',
  'Torcuato', 'Lucila', 'Luzuriaga', 'Leloir', 'Bosco', 'Teresita', 'Leandro', 'Villegas',
  'Lauquen', 'Areco', 'Laprida', 'Pringles', 'Juárez', 'Ratti', 'Catán', 'Berisso',
  'Chingolo', 'Alsina', 'Hipolito', 'Lomitas', 'Silvio', 'Roldán', 'Cayetano', 'Tucumán',
  'Adelina', 'Milberg', 'Bancalari', 'Sáenz', 'Martelli'
]);

// Technical words / jargon
const technicalTerms = new Set([
  'Reinstalación', 'reinstalación', 'posicionarla', 'reconectar', 'reconectan',
  'indegradable', 'regulatorio', 'abolsamiento', 'forzador', 'vinílica', 'retesteo',
  'reverificación', 'sobreesfuerzo', 'ductos', 'pulverización', 'foamizada', 'Foamizada',
  'termoformada', 'vehiculares', 'desprolijo', 'Chau', 'montos', 'riesgoso'
]);

// Known spelling mistakes (missing tildes, typos)
const realSpellingErrors = {};

Object.keys(wordMap).forEach(w => {
  if (voseoWords.has(w)) {
    // Voseo (valid in es-AR)
  } else if (properNames.has(w)) {
    // Check if it's missing tilde
    if (['Pueyrredon', 'Bartolome', 'Nuñez', 'Cristobal', 'Hipolito'].includes(w)) {
      realSpellingErrors[w] = {
        type: 'Falta de tilde en nombre propio',
        correction: {
          'Pueyrredon': 'Pueyrredón',
          'Bartolome': 'Bartolomé',
          'Nuñez': 'Núñez',
          'Cristobal': 'Cristóbal',
          'Hipolito': 'Hipólito'
        }[w],
        occurrences: wordMap[w]
      };
    }
  } else if (technicalTerms.has(w)) {
    // Valid technical
  } else {
    // Words needing investigation
    realSpellingErrors[w] = {
      type: 'Palabra no reconocida o falta de tilde',
      occurrences: wordMap[w]
    };
  }
});

console.log(`Spelling errors / words to fix: ${Object.keys(realSpellingErrors).length}`);
for (const [w, data] of Object.entries(realSpellingErrors)) {
  console.log(`- ${w}: ${data.occurrences.length} occurrences (${data.type})`);
  data.occurrences.forEach(o => {
    console.log(`   [${o.slug}] "...${o.context}..."`);
  });
}

fs.writeFileSync('auditoria/spelling_analysis.json', JSON.stringify({
  totalIssues: issues.length,
  uniqueWords: Object.keys(wordMap).length,
  voseoWordsCount: [...voseoWords].length,
  realSpellingErrors
}, null, 2));
