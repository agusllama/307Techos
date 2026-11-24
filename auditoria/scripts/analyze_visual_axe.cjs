const fs = require('fs');

const data = JSON.parse(fs.readFileSync('auditoria/visual_and_axe_results.json', 'utf8'));

console.log('=== VISUAL AND ACCESSIBILITY AUDIT SUMMARY ===');

let totalHScrollIssues = 0;
let totalBrokenImgs = 0;
let totalTouchIssues = 0;
const axeViolationsSummary = {};

for (const [slug, item] of Object.entries(data)) {
  // Check horizontal scroll
  for (const [vp, hasScroll] of Object.entries(item.horizontalScroll)) {
    if (hasScroll) {
      console.log(`[${slug}] Horizontal scroll detected at ${vp}px!`);
      totalHScrollIssues++;
    }
  }

  // Broken images
  if (item.brokenImages && item.brokenImages.length > 0) {
    console.log(`[${slug}] Broken images:`, item.brokenImages);
    totalBrokenImgs += item.brokenImages.length;
  }

  // Touch targets
  if (item.touchTargets && item.touchTargets.length > 0) {
    totalTouchIssues += item.touchTargets.length;
  }

  // Axe violations
  if (item.axeViolations && item.axeViolations.length > 0) {
    item.axeViolations.forEach(v => {
      if (!axeViolationsSummary[v.id]) {
        axeViolationsSummary[v.id] = {
          impact: v.impact,
          description: v.description,
          count: 0,
          pages: []
        };
      }
      axeViolationsSummary[v.id].count += v.nodesCount;
      axeViolationsSummary[v.id].pages.push(slug);
    });
  }
}

console.log(`\nTotal horizontal scroll issues: ${totalHScrollIssues}`);
console.log(`Total broken images: ${totalBrokenImgs}`);
console.log(`Total touch target issues (< 44px): ${totalTouchIssues}`);

console.log('\n--- Axe Violations Breakdown ---');
for (const [id, info] of Object.entries(axeViolationsSummary)) {
  console.log(`- [${info.impact.toUpperCase()}] ${id}: ${info.description} (${info.count} instances across ${info.pages.length} pages)`);
}

// Inspect unique touch target issues
const touchTargetSamples = {};
for (const [slug, item] of Object.entries(data)) {
  if (item.touchTargets) {
    item.touchTargets.forEach(t => {
      const key = `${t.tag} - ${t.width}x${t.height}px: ${t.text}`;
      if (!touchTargetSamples[key]) {
        touchTargetSamples[key] = { ...t, pages: [] };
      }
      touchTargetSamples[key].pages.push(slug);
    });
  }
}

console.log('\n--- Touch Target Issues (< 44px) Samples ---');
for (const [key, t] of Object.entries(touchTargetSamples)) {
  console.log(`- ${t.width}x${t.height}px: "${t.text}" (Tag: <${t.tag}>, href: "${t.href}") in ${t.pages.length} pages`);
}
