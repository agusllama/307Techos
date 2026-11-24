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
console.log(`Total HTML files in dist: ${htmlFiles.length}`);

const routes = [];
const redirectRoutes = [];
const regularRoutes = [];

for (const file of htmlFiles) {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  const isRedirect = content.includes('http-equiv="refresh"');
  
  let routePath = '/' + rel;
  if (rel === 'index.html') {
    routePath = '/';
  } else if (rel.endsWith('/index.html')) {
    routePath = '/' + rel.replace(/\/index\.html$/, '/');
  } else if (rel.endsWith('.html')) {
    routePath = '/' + rel;
  }

  const info = {
    file: rel,
    route: routePath,
    isRedirect,
  };

  routes.push(info);
  if (isRedirect) {
    redirectRoutes.push(info);
  } else {
    regularRoutes.push(info);
  }
}

console.log(`Regular pages: ${regularRoutes.length}`);
console.log(`Redirect pages: ${redirectRoutes.length}`);

console.log('\n--- Regular pages ---');
regularRoutes.forEach(r => console.log(`${r.route} (${r.file})`));

console.log('\n--- Redirect pages ---');
redirectRoutes.forEach(r => console.log(`${r.route} (${r.file})`));

fs.writeFileSync('auditoria/inventory.json', JSON.stringify({
  totalHtml: htmlFiles.length,
  regularCount: regularRoutes.length,
  redirectCount: redirectRoutes.length,
  regularRoutes,
  redirectRoutes
}, null, 2));
