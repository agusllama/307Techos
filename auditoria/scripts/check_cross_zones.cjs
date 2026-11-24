const fs = require('fs');
const path = require('path');

const zonasDir = 'src/content/zonas';
const files = fs.readdirSync(zonasDir).filter(f => f.endsWith('.md'));

const zonasData = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(zonasDir, file), 'utf8');
  const slug = file.replace('.md', '');
  
  // Extract frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const body = fmMatch ? content.slice(fmMatch[0].length).trim() : content;
  
  // Parse simple YAML lines
  const fmLines = fmMatch ? fmMatch[1].split('\n') : [];
  let currentKey = null;
  const fmObj = {};
  for (const line of fmLines) {
    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      let val = kv[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      fmObj[currentKey] = val;
    }
  }

  zonasData[slug] = {
    slug,
    nombreZona: fmObj.nombreZona,
    body,
    bodyLength: body.length
  };
}

// Check if any zone mentions another zone in its body or frontmatter (copy-paste check)
const crossMentions = [];

for (const [slugA, dataA] of Object.entries(zonasData)) {
  const text = dataA.body.toLowerCase();
  for (const [slugB, dataB] of Object.entries(zonasData)) {
    if (slugA === slugB) continue;
    const nameB = dataB.nombreZona.toLowerCase();
    
    // Check if nameB appears in text
    // Only flag if it's not a generic boundary mention (like "limita con...")
    if (text.includes(nameB)) {
      // Find line
      const lines = dataA.body.split('\n');
      lines.forEach((l, idx) => {
        if (l.toLowerCase().includes(nameB)) {
          crossMentions.push({
            zone: slugA,
            mentionedZone: slugB,
            line: idx + 1,
            text: l.trim()
          });
        }
      });
    }
  }
}

console.log(`Cross-zone mentions found: ${crossMentions.length}`);
crossMentions.forEach(cm => {
  console.log(`[${cm.zone}] mentions [${cm.mentionedZone}] at line ${cm.line}: "${cm.text}"`);
});

fs.writeFileSync('auditoria/cross_zone_mentions.json', JSON.stringify(crossMentions, null, 2));
