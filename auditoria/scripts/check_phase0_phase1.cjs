const fs = require('fs');
const path = require('path');

const distDir = path.resolve('dist');

// 1. Read all files in content/zonas and content/blog
const zonasFiles = fs.readdirSync('src/content/zonas').filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
const blogFiles = fs.readdirSync('src/content/blog').filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));

console.log(`Content zonas count: ${zonasFiles.length}`);
console.log(`Content blog count: ${blogFiles.length}`);

// 2. Read sitemap
const sitemap0 = fs.readFileSync('dist/sitemap-0.xml', 'utf8');
const sitemapUrls = [...sitemap0.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log(`Sitemap URLs count: ${sitemapUrls.length}`);

// 3. Inventory all files in dist/
function getAllFiles(dir) {
  let res = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      res = res.concat(getAllFiles(full));
    } else {
      res.push(full);
    }
  }
  return res;
}

const allDistFiles = getAllFiles(distDir).map(f => path.relative(distDir, f).replace(/\\/g, '/'));
const htmlFiles = allDistFiles.filter(f => f.endsWith('.html'));

// Separate regular vs redirect
const regularPages = [];
const redirectPages = [];

for (const rel of htmlFiles) {
  const content = fs.readFileSync(path.join(distDir, rel), 'utf8');
  if (content.includes('http-equiv="refresh"')) {
    redirectPages.push(rel);
  } else {
    regularPages.push(rel);
  }
}

// Compare sitemap with regular pages
const sitemapDiff = [];
const regularUrls = regularPages.map(p => {
  if (p === 'index.html') return 'https://307techos.com.ar/';
  if (p === '404.html') return 'https://307techos.com.ar/404.html';
  return 'https://307techos.com.ar/' + p.replace('/index.html', '/');
});

// Check orphan pages or sitemap mismatch
const inSitemapNotInRegular = sitemapUrls.filter(u => !regularUrls.includes(u));
const inRegularNotInSitemap = regularUrls.filter(u => !sitemapUrls.includes(u) && !u.endsWith('404.html'));

console.log('inSitemapNotInRegular:', inSitemapNotInRegular);
console.log('inRegularNotInSitemap:', inRegularNotInSitemap);

// 4. Broken text search across all HTML files
const suspiciousPatterns = [
  'undefined',
  'null',
  'NaN',
  '[object Object]',
  '{{',
  '}}',
  '${',
  'TODO',
  'FIXME',
  'lorem',
  'placeholder',
  'XXX',
  '&amp;amp;',
  'Ã¡', 'Ã©', 'Ã­', 'Ã³', 'Ãº', 'Ã±', // UTF-8 mojibake
];

const brokenTextFindings = [];

for (const rel of htmlFiles) {
  const full = path.join(distDir, rel);
  const content = fs.readFileSync(full, 'utf8');
  
  // Skip script tags and json-ld for simple text pattern search, or check both?
  // Let's check everywhere but flag context
  suspiciousPatterns.forEach(pattern => {
    let pos = 0;
    while ((pos = content.indexOf(pattern, pos)) !== -1) {
      // get snippet around pos
      const start = Math.max(0, pos - 40);
      const end = Math.min(content.length, pos + pattern.length + 40);
      const snippet = content.slice(start, end).replace(/\n/g, ' ');
      
      // Filter out false positives, e.g. "null" in JSON-LD or script if legitimate, but let's log everything
      brokenTextFindings.push({
        file: rel,
        pattern,
        snippet,
        pos
      });
      pos += pattern.length;
    }
  });

  // Check double spaces in visible text (between > and <)
  // Check unrendered markdown like ** or ## or ``` in visible text
  const visibleText = content.replace(/<script[\s\S]*?<\/script>/gi, '')
                             .replace(/<style[\s\S]*?<\/style>/gi, '')
                             .replace(/<[^>]+>/g, ' ');
  
  const markdownMatches = visibleText.match(/(\*\*|##|```)/g);
  if (markdownMatches) {
    brokenTextFindings.push({
      file: rel,
      pattern: 'Unrendered markdown syntax',
      snippet: markdownMatches.join(', ')
    });
  }

  // Double spaces check (outside code/tags)
  if (/(\w)\s{3,}(\w)/.test(visibleText)) {
    brokenTextFindings.push({
      file: rel,
      pattern: 'Multiple spaces',
      snippet: visibleText.match(/(\w\s{3,}\w)/)?.[0]
    });
  }

  // Spaces before punctuation
  const spaceBeforePunct = visibleText.match(/\w\s+([,.:;?!])/);
  if (spaceBeforePunct) {
    brokenTextFindings.push({
      file: rel,
      pattern: 'Space before punctuation',
      snippet: spaceBeforePunct[0]
    });
  }

  // Duplicate punctuation
  const dupPunct = visibleText.match(/([,.:;])\1+/);
  if (dupPunct && dupPunct[0] !== '..') { // allow ellipsis ..
    brokenTextFindings.push({
      file: rel,
      pattern: 'Duplicate punctuation',
      snippet: dupPunct[0]
    });
  }
}

console.log(`Broken text findings count: ${brokenTextFindings.length}`);

// 5. Check all links (internal and external) across all pages
const allLinks = [];
const linkErrors = [];
const allRoutesSet = new Set(regularUrls.map(u => (new URL(u)).pathname));
allRoutesSet.add('/');

for (const rel of htmlFiles) {
  const content = fs.readFileSync(path.join(distDir, rel), 'utf8');
  const matches = content.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);
  for (const m of matches) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    allLinks.push({ file: rel, href, text });

    if (href.startsWith('http://localhost') || href.startsWith('http://127.0.0.1')) {
      linkErrors.push({ file: rel, href, error: 'Link to localhost' });
    }

    if (href.startsWith('#')) {
      // ID on same page
      const id = href.slice(1);
      if (!content.includes(`id="${id}"`)) {
        linkErrors.push({ file: rel, href, error: `Anchor #${id} not found on same page` });
      }
    } else if (href.startsWith('/')) {
      const [pathname, hash] = href.split('#');
      let targetFile;
      if (pathname === '/') {
        targetFile = path.join(distDir, 'index.html');
      } else if (pathname.endsWith('/')) {
        targetFile = path.join(distDir, pathname.slice(1), 'index.html');
      } else if (pathname.endsWith('.html')) {
        targetFile = path.join(distDir, pathname.slice(1));
      } else {
        targetFile = path.join(distDir, pathname.slice(1) + '.html');
        if (!fs.existsSync(targetFile)) {
          targetFile = path.join(distDir, pathname.slice(1), 'index.html');
        }
      }

      if (!fs.existsSync(targetFile)) {
        linkErrors.push({ file: rel, href, error: `Target file not found: ${targetFile}` });
      } else if (hash) {
        const targetContent = fs.readFileSync(targetFile, 'utf8');
        if (!targetContent.includes(`id="${hash}"`)) {
          linkErrors.push({ file: rel, href, error: `Anchor #${hash} not found in target file ${path.relative(distDir, targetFile)}` });
        }
      }
    }
  }
}

console.log(`Total links extracted: ${allLinks.length}`);
console.log(`Link errors count: ${linkErrors.length}`);

fs.writeFileSync('auditoria/phase0_phase1_results.json', JSON.stringify({
  zonasCount: zonasFiles.length,
  blogCount: blogFiles.length,
  regularPagesCount: regularPages.length,
  redirectPagesCount: redirectPages.length,
  sitemapUrlsCount: sitemapUrls.length,
  inSitemapNotInRegular,
  inRegularNotInSitemap,
  brokenTextFindings,
  linkErrors,
  totalLinksCount: allLinks.length
}, null, 2));
