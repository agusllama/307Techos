const fs = require('fs');
const path = require('path');

const distDir = path.resolve('dist');
const pagesData = JSON.parse(fs.readFileSync('auditoria/pages_extracted.json', 'utf8'));

const seoAuditResults = {};

for (const [slug, page] of Object.entries(pagesData)) {
  const issues = [];
  const fullHtml = fs.readFileSync(path.join(distDir, page.file), 'utf8');

  // 1. H1 check
  const h1s = page.headings.filter(h => h.tag === 'h1');
  if (h1s.length === 0) {
    issues.push({ category: 'SEO', severity: 'Crítico', rule: 'H1', message: 'Falta etiqueta <h1>' });
  } else if (h1s.length > 1) {
    issues.push({ category: 'SEO', severity: 'Alto', rule: 'H1', message: `Múltiples etiquetas <h1> encontradas (${h1s.length})` });
  }

  // Heading hierarchy check
  const levels = page.headings.map(h => parseInt(h.tag[1], 10));
  for (let i = 0; i < levels.length - 1; i++) {
    if (levels[i + 1] > levels[i] + 1) {
      issues.push({
        category: 'SEO',
        severity: 'Bajo',
        rule: 'Heading Hierarchy',
        message: `Salto en jerarquía de encabezados: de <h${levels[i]}> ("${page.headings[i].text.slice(0, 30)}") a <h${levels[i + 1]}> ("${page.headings[i + 1].text.slice(0, 30)}")`
      });
    }
  }

  // 2. Title check
  const title = page.title;
  if (!title) {
    issues.push({ category: 'SEO', severity: 'Crítico', rule: 'Title', message: 'Falta etiqueta <title>' });
  } else {
    const len = title.length;
    if (slug !== '404' && (len < 45 || len > 65)) {
      issues.push({
        category: 'SEO',
        severity: 'Medio',
        rule: 'Title Length',
        message: `Longitud del title fuera del rango recomendado 50-60 caracteres: ${len} caracteres ("${title}")`
      });
    }
  }

  // 3. Meta description check
  const desc = page.description;
  if (!desc) {
    issues.push({ category: 'SEO', severity: 'Crítico', rule: 'Description', message: 'Falta meta description' });
  } else {
    const len = desc.length;
    if (len < 135 || len > 165) {
      issues.push({
        category: 'SEO',
        severity: 'Medio',
        rule: 'Description Length',
        message: `Longitud de meta description fuera del rango recomendado 140-160 caracteres: ${len} caracteres ("${desc}")`
      });
    }
  }

  // 4. Canonical check
  const expectedCanonical = slug === 'home'
    ? 'https://307techos.com.ar/'
    : (slug === '404'
      ? 'https://307techos.com.ar/404.html'
      : (slug.startsWith('blog/') ? `https://307techos.com.ar/${slug}/` : `https://307techos.com.ar/${slug}/`));

  if (!page.canonical) {
    issues.push({ category: 'SEO', severity: 'Crítico', rule: 'Canonical', message: 'Falta etiqueta canonical' });
  } else if (page.canonical !== expectedCanonical) {
    issues.push({
      category: 'SEO',
      severity: 'Alto',
      rule: 'Canonical Mismatch',
      message: `Canonical no coincide con la URL esperada: actual "${page.canonical}", esperada "${expectedCanonical}"`
    });
  }

  // 5. Robots check
  if (slug === '404') {
    if (!page.robots.includes('noindex')) {
      issues.push({ category: 'SEO', severity: 'Alto', rule: 'Robots', message: 'Página 404 debe tener noindex' });
    }
  } else {
    if (page.robots.includes('noindex')) {
      issues.push({ category: 'SEO', severity: 'Crítico', rule: 'Robots', message: `Página indexable tiene noindex: "${page.robots}"` });
    }
  }

  // 6. Open Graph & Twitter
  const ogImage = fullHtml.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1];
  const twImage = fullHtml.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i)?.[1];
  
  if (!ogImage) {
    issues.push({ category: 'SEO', severity: 'Alto', rule: 'OG Image', message: 'Falta meta tag og:image' });
  } else if (!ogImage.startsWith('https://307techos.com.ar/')) {
    issues.push({ category: 'SEO', severity: 'Alto', rule: 'OG Image Absolute', message: `og:image debe ser URL absoluta: "${ogImage}"` });
  } else {
    // Check if local file exists
    const localRel = ogImage.replace('https://307techos.com.ar/', '');
    const localPath = path.join(distDir, localRel);
    if (!fs.existsSync(localPath)) {
      issues.push({ category: 'SEO', severity: 'Crítico', rule: 'OG Image Missing', message: `Archivo de og:image no existe en dist/: ${localRel}` });
    }
  }

  if (!twImage) {
    issues.push({ category: 'SEO', severity: 'Medio', rule: 'Twitter Image', message: 'Falta meta tag twitter:image' });
  }

  // 7. Images check: alt, dimensions, loading
  for (const img of page.images) {
    if (img.alt === null) {
      issues.push({
        category: 'Accesibilidad',
        severity: 'Alto',
        rule: 'Image Alt Missing',
        message: `Imagen sin atributo alt: src="${img.src}"`
      });
    } else if (img.alt.trim() === '' && !img.src.includes('avatar') && !img.src.includes('icon')) {
      // Empty alt might be decorative, but let's check
    }

    if (!img.width || !img.height) {
      issues.push({
        category: 'Performance / SEO',
        severity: 'Medio',
        rule: 'Image Dimensions Missing',
        message: `Imagen sin width o height explícitos: src="${img.src}"`
      });
    }

    // Modern format check (.webp, .avif, .svg)
    if (!img.src.endsWith('.webp') && !img.src.endsWith('.avif') && !img.src.endsWith('.svg')) {
      issues.push({
        category: 'Performance',
        severity: 'Bajo',
        rule: 'Image Format',
        message: `Imagen no usa formato moderno WebP/AVIF/SVG: src="${img.src}"`
      });
    }
  }

  // 8. JSON-LD checks
  if (page.jsonLds.length === 0 && slug !== '404') {
    issues.push({ category: 'SEO Técnico', severity: 'Crítico', rule: 'JSON-LD Missing', message: 'Falta bloque JSON-LD' });
  } else if (page.jsonLds.length > 1) {
    issues.push({ category: 'SEO Técnico', severity: 'Alto', rule: 'JSON-LD Multiple', message: `Múltiples bloques JSON-LD encontrados (${page.jsonLds.length})` });
  } else if (page.jsonLds.length === 1) {
    const jsonLd = page.jsonLds[0];
    if (jsonLd.error) {
      issues.push({ category: 'SEO Técnico', severity: 'Crítico', rule: 'JSON-LD Syntax', message: `Error de sintaxis JSON-LD: ${jsonLd.error}` });
    } else if (!jsonLd['@graph'] || !Array.isArray(jsonLd['@graph'])) {
      issues.push({ category: 'SEO Técnico', severity: 'Alto', rule: 'JSON-LD @graph', message: 'JSON-LD no contiene el array @graph unificado' });
    } else {
      const graph = jsonLd['@graph'];
      const types = graph.map(item => Array.isArray(item['@type']) ? item['@type'].join('/') : item['@type']);

      // Check BreadcrumbList
      const breadcrumb = graph.find(item => item['@type'] === 'BreadcrumbList');
      if (slug === 'home' && breadcrumb) {
        issues.push({ category: 'SEO Técnico', severity: 'Alto', rule: 'JSON-LD Breadcrumb Home', message: 'La home no debe incluir BreadcrumbList' });
      } else if (slug !== 'home' && slug !== '404' && !breadcrumb) {
        issues.push({ category: 'SEO Técnico', severity: 'Medio', rule: 'JSON-LD Breadcrumb Missing', message: 'Página secundaria sin BreadcrumbList en JSON-LD' });
      }

      // Check FAQPage
      const faqItem = graph.find(item => item['@type'] === 'FAQPage');
      if (page.faqs.length === 0 && faqItem) {
        issues.push({ category: 'SEO Técnico', severity: 'Alto', rule: 'JSON-LD FAQ Mismatch', message: 'Página incluye FAQPage en JSON-LD pero no muestra FAQ visibles en el contenido' });
      }

      // Check Fake reviews or ratings in Schema
      const reviewOrRating = graph.find(item => item['aggregateRating'] || item['review']);
      if (reviewOrRating) {
        issues.push({ category: 'SEO Técnico', severity: 'Alto', rule: 'JSON-LD Review Injection', message: 'JSON-LD incluye aggregateRating o review no verificado' });
      }
    }
  }

  seoAuditResults[slug] = {
    slug,
    issuesCount: issues.length,
    issues
  };
}

fs.writeFileSync('auditoria/seo_schema_results.json', JSON.stringify(seoAuditResults, null, 2));
console.log('Saved SEO & Schema audit results to auditoria/seo_schema_results.json');
