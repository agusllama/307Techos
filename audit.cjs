const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
let errors = [];
let warnings = [];

function getAllFiles(dir, extList) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, extList));
    } else {
      if (!extList || extList.some(ext => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const htmlFiles = getAllFiles(distDir, ['.html']);
console.log(`Found ${htmlFiles.length} HTML files in dist/`);

// 1. Check placeholders and H1 and JSON-LD
for (const file of htmlFiles) {
  const relPath = path.relative(distDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');

  // Check if it's an Astro redirect file
  const isRedirect = content.includes('http-equiv="refresh"');

  if (isRedirect) {
    // Check redirect targets
    const metaRefresh = content.match(/content="0;url=([^"]+)"/);
    const canonical = content.match(/<link rel="canonical" href="([^"]+)">/);
    if (!metaRefresh) {
      errors.push(`${relPath}: Redirect file missing meta refresh target`);
    } else {
      // Check trailing slash consistency
      const target = metaRefresh[1];
      if (target.startsWith('/') && !target.endsWith('/') && !target.includes('#') && !target.includes('.')) {
        warnings.push(`${relPath}: Redirect target "${target}" lacks trailing slash`);
      }
    }
    continue;
  }

  // Normal pages
  // Check placeholders
  if (content.includes('[COMPLETAR]') || content.includes('TODO') || content.includes('XXX')) {
    // Check where
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('[COMPLETAR]') || line.includes('TODO') || line.includes('XXX')) {
        errors.push(`${relPath}:${idx + 1}: Placeholder found: ${line.trim()}`);
      }
    });
  }

  // Check H1
  const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  if (h1Matches.length !== 1 && relPath !== '404.html') {
    errors.push(`${relPath}: Expected exactly 1 <h1>, found ${h1Matches.length}`);
  }

  // Check main tag
  const mainMatches = content.match(/<main[\s>]/gi) || [];
  if (mainMatches.length !== 1) {
    errors.push(`${relPath}: Expected exactly 1 <main>, found ${mainMatches.length}`);
  }

  // Check JSON-LD
  const jsonLdMatches = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
  if (jsonLdMatches.length !== 1 && relPath !== '404.html') {
    errors.push(`${relPath}: Expected exactly 1 JSON-LD script, found ${jsonLdMatches.length}`);
  } else if (jsonLdMatches.length === 1) {
    const raw = jsonLdMatches[0].replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '');
    try {
      const parsed = JSON.parse(raw);
      if (!parsed['@graph'] || !Array.isArray(parsed['@graph'])) {
        errors.push(`${relPath}: JSON-LD missing @graph array`);
      } else {
        // Inspect types in graph
        const types = parsed['@graph'].map(item => Array.isArray(item['@type']) ? item['@type'].join('/') : item['@type']);
        // Check BreadcrumbList
        const breadcrumbItem = parsed['@graph'].find(item => item['@type'] === 'BreadcrumbList');
        if (relPath === 'index.html') {
          if (breadcrumbItem) {
            errors.push(`${relPath}: Home page should not have BreadcrumbList`);
          }
        } else if (relPath !== '404.html') {
          if (!breadcrumbItem) {
            warnings.push(`${relPath}: Page missing BreadcrumbList in JSON-LD`);
          } else {
            // Check breadcrumb URLs
            const elements = breadcrumbItem.itemListElement || [];
            for (const elem of elements) {
              if (elem.item && elem.item.includes('reparacion-techo-peugeot-307')) {
                errors.push(`${relPath}: Breadcrumb URL contains legacy route: ${elem.item}`);
              }
            }
          }
        }
      }
    } catch (e) {
      errors.push(`${relPath}: Invalid JSON in JSON-LD: ${e.message}`);
    }
  }

  // Check canonical
  const canonicalMatch = content.match(/<link rel="canonical" href="([^"]+)">/);
  if (!canonicalMatch && relPath !== '404.html') {
    errors.push(`${relPath}: Missing canonical tag`);
  } else if (canonicalMatch) {
    const href = canonicalMatch[1];
    if (href.includes('reparacion-techo-peugeot-307')) {
      errors.push(`${relPath}: Canonical URL contains legacy path: ${href}`);
    }
    if (!href.endsWith('/') && !href.endsWith('.html')) {
      errors.push(`${relPath}: Canonical URL missing trailing slash: ${href}`);
    }
  }

  // Check title and meta description length
  const titleMatch = content.match(/<title>([^<]*)<\/title>/);
  if (!titleMatch) {
    errors.push(`${relPath}: Missing <title> tag`);
  } else {
    const tLen = titleMatch[1].trim().length;
    // For non-404 pages, check title length
    if (relPath !== '404.html' && (tLen < 45 || tLen > 65)) {
      warnings.push(`${relPath}: Title length (${tLen}) is outside recommended 50-60 range: "${titleMatch[1]}"`);
    }
  }

  const descMatch = content.match(/<meta name="description" content="([^"]*)"/i);
  if (!descMatch) {
    errors.push(`${relPath}: Missing meta description`);
  } else {
    const dLen = descMatch[1].trim().length;
    if (dLen < 135 || dLen > 165) {
      warnings.push(`${relPath}: Meta description length (${dLen}) is outside recommended 140-160 range: "${descMatch[1]}"`);
    }
  }
}

// 2. Check internal links across all HTML files
console.log('Checking all internal links...');
const allRoutes = new Set();
// Map static pages to route paths
for (const file of htmlFiles) {
  const relPath = path.relative(distDir, file).replace(/\\/g, '/');
  if (relPath.endsWith('index.html')) {
    const route = '/' + relPath.replace(/index\.html$/, '');
    allRoutes.add(route);
    if (route !== '/') {
      allRoutes.add(route.slice(0, -1)); // without trailing slash
    }
  } else {
    allRoutes.add('/' + relPath);
  }
}

let deadLinks = 0;
let legacyLinks = 0;

for (const file of htmlFiles) {
  const relPath = path.relative(distDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');

  // Find all <a href="...">
  const hrefMatches = content.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi);
  for (const match of hrefMatches) {
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      if (href.includes('307techos.com.ar/reparacion-techo-peugeot-307')) {
        errors.push(`${relPath}: Absolute link to legacy path: ${href}`);
        legacyLinks++;
      }
      continue;
    }

    if (href.startsWith('/reparacion-techo-peugeot-307')) {
      errors.push(`${relPath}: Relative link to legacy path: ${href}`);
      legacyLinks++;
      continue;
    }

    // Check anchor or internal link
    if (href.startsWith('#')) {
      // Internal page anchor
      const anchor = href.slice(1);
      if (!content.includes(`id="${anchor}"`)) {
        errors.push(`${relPath}: Anchor target #${anchor} not found on this page`);
      }
    } else if (href.startsWith('/')) {
      const [pathname, anchor] = href.split('#');
      // Normalize pathname
      let normPath = pathname;
      if (!normPath.endsWith('/') && !path.extname(normPath)) {
        normPath += '/';
      }
      if (!allRoutes.has(pathname) && !allRoutes.has(normPath)) {
        errors.push(`${relPath}: Dead internal link: ${href}`);
        deadLinks++;
      }
      if (anchor) {
        // If it links to /#zonas, check if / has id="zonas"
        const targetFile = path.join(distDir, pathname === '/' ? 'index.html' : pathname.replace(/^\//, '') + '/index.html');
        if (fs.existsSync(targetFile)) {
          const targetContent = fs.readFileSync(targetFile, 'utf8');
          if (!targetContent.includes(`id="${anchor}"`)) {
            errors.push(`${relPath}: Anchor target ${href} has no element id="${anchor}" in ${path.relative(distDir, targetFile)}`);
          }
        }
      }
    }
  }
}

// 3. Check Sitemap
console.log('Checking Sitemap...');
const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml');
const sitemap0Path = path.join(distDir, 'sitemap-0.xml');
if (!fs.existsSync(sitemapIndexPath)) {
  errors.push('Missing dist/sitemap-index.xml');
}
if (!fs.existsSync(sitemap0Path)) {
  errors.push('Missing dist/sitemap-0.xml');
} else {
  const sitemap0Content = fs.readFileSync(sitemap0Path, 'utf8');
  const locMatches = [...sitemap0Content.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`Sitemap contains ${locMatches.length} URLs`);
  for (const loc of locMatches) {
    if (loc.includes('reparacion-techo-peugeot-307')) {
      errors.push(`Sitemap contains legacy path: ${loc}`);
    }
    const urlObj = new URL(loc);
    let route = urlObj.pathname;
    let expectedFile = path.join(distDir, route.replace(/^\//, ''), 'index.html');
    if (!fs.existsSync(expectedFile)) {
      errors.push(`Sitemap URL does not exist as index.html: ${loc} -> ${expectedFile}`);
    }
  }
}

// 4. Check llms.txt
console.log('Checking llms.txt...');
const llmsPath = path.join(distDir, 'llms.txt');
if (!fs.existsSync(llmsPath)) {
  errors.push('Missing dist/llms.txt');
} else {
  const llmsContent = fs.readFileSync(llmsPath, 'utf8');
  if (llmsContent.includes('reparacion-techo-peugeot-307')) {
    errors.push('llms.txt contains legacy path: reparacion-techo-peugeot-307');
  }
  // Check that all 27 zones are present
  const zonas = [
    'almirante-brown', 'avellaneda', 'berazategui', 'capital-federal', 'esteban-echeverria',
    'ezeiza-canning', 'florencio-varela', 'general-san-martin', 'ituzaingo', 'la-matanza',
    'la-plata', 'lanus', 'lomas-de-zamora', 'moron', 'pilar', 'quilmes', 'san-isidro',
    'tigre', 'tres-de-febrero', 'vicente-lopez',
    'mar-del-plata', 'pinamar', 'villa-gesell', 'partido-de-la-costa', 'san-bernardo', 'mar-de-ajo',
    'interior-buenos-aires'
  ];
  for (const z of zonas) {
    if (!llmsContent.includes(`https://307techos.com.ar/${z}/`)) {
      errors.push(`llms.txt missing canonical URL for zone: ${z}`);
    }
  }
  if (!llmsContent.includes('https://307techos.com.ar/#zonas')) {
    errors.push('llms.txt missing hub URL https://307techos.com.ar/#zonas');
  }
}

// Sample JSON-LD prints
console.log('\nSample BreadcrumbList from dist/capital-federal/index.html:');
const capHtml = fs.readFileSync(path.join(distDir, 'capital-federal', 'index.html'), 'utf8');
const capJson = JSON.parse(capHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
console.log(JSON.stringify(capJson['@graph'].find(x => x['@type'] === 'BreadcrumbList'), null, 2));

console.log('\nSample BreadcrumbList from dist/blog/como-reparar-techo-peugeot-307-en-casa/index.html:');
const blogHtml = fs.readFileSync(path.join(distDir, 'blog', 'como-reparar-techo-peugeot-307-en-casa', 'index.html'), 'utf8');
const blogJson = JSON.parse(blogHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
console.log(JSON.stringify(blogJson['@graph'].find(x => x['@type'] === 'BreadcrumbList'), null, 2));

console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
if (errors.length > 0) {
  console.log('ERRORS:');
  errors.forEach(e => console.log('  [ERROR] ' + e));
}
if (warnings.length > 0) {
  console.log('WARNINGS:');
  warnings.forEach(w => console.log('  [WARN]  ' + w));
}
