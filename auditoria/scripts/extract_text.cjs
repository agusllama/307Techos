const fs = require('fs');
const path = require('path');

const distDir = path.resolve('dist');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(full));
    } else if (file.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(distDir);
const pagesData = {};

for (const file of htmlFiles) {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  const isRedirect = content.includes('http-equiv="refresh"');
  if (isRedirect) continue;

  let slug = rel.replace('/index.html', '').replace('.html', '');
  if (slug === 'index') slug = 'home';

  // Extract meta tags
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';

  const robotsMatch = content.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
  const robots = robotsMatch ? robotsMatch[1].trim() : '';

  // Extract all Headings
  const headings = [];
  const headingRegex = /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi;
  let hMatch;
  while ((hMatch = headingRegex.exec(content)) !== null) {
    headings.push({
      tag: hMatch[1].toLowerCase(),
      attrs: hMatch[2].trim(),
      text: hMatch[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    });
  }

  // Extract all Images with alt, width, height, loading, fetchpriority
  const images = [];
  const imgRegex = /<img\s+([^>]+)>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    const attrsStr = imgMatch[1];
    const src = attrsStr.match(/src=["']([^"']+)["']/i)?.[1] || '';
    const alt = attrsStr.match(/alt=["']([^"']*)["']/i)?.[1] ?? null;
    const width = attrsStr.match(/width=["']([^"']+)["']/i)?.[1] || '';
    const height = attrsStr.match(/height=["']([^"']+)["']/i)?.[1] || '';
    const loading = attrsStr.match(/loading=["']([^"']+)["']/i)?.[1] || '';
    const fetchpriority = attrsStr.match(/fetchpriority=["']([^"']+)["']/i)?.[1] || '';
    images.push({ src, alt, width, height, loading, fetchpriority });
  }

  // Extract all interactive elements (buttons, links)
  const interactive = [];
  const linkRegex = /<a\s+([^>]+)>([\s\S]*?)<\/a>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const attrs = linkMatch[1];
    const href = attrs.match(/href=["']([^"']+)["']/i)?.[1] || '';
    const ariaLabel = attrs.match(/aria-label=["']([^"']+)["']/i)?.[1] || '';
    const text = linkMatch[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    interactive.push({ tag: 'a', href, ariaLabel, text });
  }

  const btnRegex = /<button\s+([^>]+)>([\s\S]*?)<\/button>/gi;
  let btnMatch;
  while ((btnMatch = btnRegex.exec(content)) !== null) {
    const attrs = btnMatch[1];
    const ariaLabel = attrs.match(/aria-label=["']([^"']+)["']/i)?.[1] || '';
    const text = btnMatch[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    interactive.push({ tag: 'button', ariaLabel, text });
  }

  // Extract FAQ items (<details><summary> or in FAQ section)
  const faqs = [];
  const detailsRegex = /<details[^>]*>([\s\S]*?)<\/details>/gi;
  let detMatch;
  while ((detMatch = detailsRegex.exec(content)) !== null) {
    const sumMatch = detMatch[1].match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
    const q = sumMatch ? sumMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const a = detMatch[1].replace(/<summary[\s\S]*?<\/summary>/i, '').replace(/<[^>]+>/g, '').trim();
    faqs.push({ q, a });
  }

  // Extract JSON-LD
  const jsonLds = [];
  const jsonRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let jMatch;
  while ((jMatch = jsonRegex.exec(content)) !== null) {
    try {
      jsonLds.push(JSON.parse(jMatch[1]));
    } catch (e) {
      jsonLds.push({ error: e.message, raw: jMatch[1] });
    }
  }

  // Extract clean visible text
  // Remove script, style, svg, noscript
  let cleanHtml = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ');
  
  // Extract visible body text
  const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : cleanHtml;
  
  const rawText = bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  // Also extract text without header and footer (for body copy similarity)
  let mainHtml = bodyHtml.replace(/<header[\s\S]*?<\/header>/gi, '').replace(/<footer[\s\S]*?<\/footer>/gi, '');
  const mainText = mainHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  pagesData[slug] = {
    file: rel,
    slug,
    title,
    description,
    canonical,
    robots,
    headings,
    images,
    interactive,
    faqs,
    jsonLds,
    mainTextLength: mainText.length,
    rawTextLength: rawText.length,
    mainText,
    rawText
  };

  // Safe file naming
  const safeSlug = slug.replace(/\//g, '__');
  fs.writeFileSync(`auditoria/extracted_text/${safeSlug}.txt`, rawText, 'utf8');
  fs.writeFileSync(`auditoria/extracted_text/${safeSlug}_main.txt`, mainText, 'utf8');
}

fs.writeFileSync('auditoria/pages_extracted.json', JSON.stringify(pagesData, null, 2));
console.log(`Extracted text and metadata for ${Object.keys(pagesData).length} pages.`);
