const fs = require('fs');
const path = require('path');

const distDir = path.resolve('dist');
const html = fs.readFileSync('dist/almirante-brown/index.html', 'utf8');

// Find aria-label on elements that are not interactive or landmarks
const ariaMatches = [...html.matchAll(/<([a-z0-9-]+)[^>]*\saria-label=["']([^"']+)["'][^>]*>/gi)];
console.log(`Found ${ariaMatches.length} elements with aria-label in almirante-brown:`);
ariaMatches.forEach(m => {
  console.log(`Tag: <${m[1]}>, aria-label: "${m[2]}"`);
});
