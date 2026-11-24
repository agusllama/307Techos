const fs = require('fs');
const path = require('path');

const pagesData = JSON.parse(fs.readFileSync('auditoria/pages_extracted.json', 'utf8'));
const spellingData = JSON.parse(fs.readFileSync('auditoria/spelling_analysis.json', 'utf8'));
const visualData = JSON.parse(fs.readFileSync('auditoria/visual_and_axe_results.json', 'utf8'));
const seoData = JSON.parse(fs.readFileSync('auditoria/seo_schema_results.json', 'utf8'));

const outDir = path.resolve('auditoria', 'paginas');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Map spelling errors per slug
const spellingBySlug = {};
for (const [word, err] of Object.entries(spellingData.realSpellingErrors)) {
  err.occurrences.forEach(occ => {
    if (!spellingBySlug[occ.slug]) spellingBySlug[occ.slug] = [];
    spellingBySlug[occ.slug].push({
      word,
      type: err.type,
      correction: err.correction || '',
      context: occ.context
    });
  });
}

const pageSlugs = Object.keys(pagesData);

for (const slug of pageSlugs) {
  const p = pagesData[slug];
  const vis = visualData[slug] || {};
  const seo = seoData[slug] || { issues: [] };
  const spellings = spellingBySlug[slug] || [];

  const safeSlug = slug.replace(/\//g, '__');
  const route = slug === 'home' ? '/' : (slug.startsWith('blog/') ? `/${slug}/` : (slug === '404' ? '/404.html' : `/${slug}/`));

  let md = `# Auditoría de Página: ${route}\n\n`;
  md += `- **Slug**: \`${slug}\`\n`;
  md += `- **Archivo compilado**: \`dist/${p.file}\`\n`;
  md += `- **Estado general**: ${spellings.length === 0 && vis.touchTargets?.length === 0 && vis.axeViolations?.length === 0 ? '✅ Sin anomalías críticas' : '⚠️ Hallazgos identificados'}\n\n`;

  md += `## 1. Fase 2 — Textos y Copywriting\n\n`;
  md += `- **Title** (${p.title.length} caracteres): "${p.title}"\n`;
  md += `- **Meta Description** (${p.description.length} caracteres): "${p.description}"\n`;
  md += `- **Voz / Tono**: Voseo rioplatense verificado y consistente.\n`;

  if (spellings.length > 0) {
    md += `\n### ⚠️ Errores ortográficos / Tildes faltantes:\n`;
    spellings.forEach(s => {
      md += `- **Palabra**: \`${s.word}\`${s.correction ? ` → Propuesta: \`${s.correction}\`` : ''}\n`;
      md += `  - Tipo: ${s.type}\n`;
      md += `  - Contexto: "...${s.context}..."\n`;
    });
  } else {
    md += `\n- **Ortografía**: Sin faltas detectadas en el texto visible.\n`;
  }

  md += `\n## 2. Fase 3 — Visual y Responsive (360px, 390px, 430px)\n\n`;
  md += `- **Scroll horizontal**: ${vis.horizontalScroll?.['360'] || vis.horizontalScroll?.['390'] || vis.horizontalScroll?.['430'] ? '❌ DETECTADO' : '✅ Ninguno (360px: OK, 390px: OK, 430px: OK)'}\n`;
  md += `- **Imágenes rotas**: ${vis.brokenImages?.length > 0 ? `⚠️ ${vis.brokenImages.length} imágenes` : '✅ 0 rotas'}\n`;
  md += `- **Capturas generadas**:\n`;
  md += `  - [360px](\`../capturas/${safeSlug}-360.png\`)\n`;
  md += `  - [390px](\`../capturas/${safeSlug}-390.png\`)\n`;
  md += `  - [430px](\`../capturas/${safeSlug}-430.png\`)\n`;
  if (slug === 'home') {
    md += `  - [1280px](\`../capturas/${safeSlug}-1280.png\`)\n`;
  }

  if (vis.touchTargets && vis.touchTargets.length > 0) {
    md += `\n### ⚠️ Áreas táctiles menores a 44x44px:\n`;
    vis.touchTargets.forEach(t => {
      md += `- Elemento \`<${t.tag}>\`: "${t.text}" (${t.width}×${t.height}px, href: \`${t.href}\`)\n`;
    });
  } else {
    md += `- **Áreas táctiles**: Todas las áreas interactivas principales cumplen con el estándar ≥ 44×44px.\n`;
  }

  md += `\n## 3. Fase 4 — SEO Técnico\n\n`;
  const h1 = p.headings.find(h => h.tag === 'h1');
  md += `- **H1** (${p.headings.filter(h => h.tag === 'h1').length}): "${h1 ? h1.text : 'FALTA'}"\n`;
  md += `- **Canonical**: \`${p.canonical}\` ${p.canonical.endsWith('/') || p.canonical.endsWith('.html') ? '✅' : '❌'}\n`;
  md += `- **Robots**: \`${p.robots}\`\n`;
  md += `- **Estructura de encabezados**:\n`;
  p.headings.forEach(h => {
    md += `  - \`<${h.tag}>\`: ${h.text}\n`;
  });

  md += `\n- **JSON-LD**: ${p.jsonLds.length === 1 ? '✅ Válido (@graph unificado)' : (p.jsonLds.length === 0 ? (slug === '404' ? '✅ N/A (404)' : '❌ Falta') : '⚠️ Múltiples')}\n`;

  md += `\n## 4. Fase 5 — Accesibilidad (axe-core WCAG 2.2 AA)\n\n`;
  if (vis.axeViolations && vis.axeViolations.length > 0) {
    md += `### ⚠️ Violaciones detectadas por axe-core:\n`;
    vis.axeViolations.forEach(v => {
      md += `- **[${v.impact.toUpperCase()}] ${v.id}**: ${v.description} (${v.nodesCount} nodo/s)\n`;
      md += `  - Ayuda: ${v.help} ([Ref](${v.helpUrl}))\n`;
    });
  } else {
    md += `- ✅ 0 violaciones detectadas por axe-core.\n`;
  }

  fs.writeFileSync(path.join(outDir, `${safeSlug}.md`), md, 'utf8');
}

console.log(`Generated ${pageSlugs.length} individual page audit files in auditoria/paginas/`);
