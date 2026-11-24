function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
}

function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function getContrast(fgHex, bgHex) {
  const l1 = getLuminance(fgHex);
  const l2 = getLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const colorPairs = [
  // On #FFFFFF surface
  { fg: '#111827', bg: '#FFFFFF', desc: 'Texto principal en tarjetas' },
  { fg: '#4B5563', bg: '#FFFFFF', desc: 'Texto secundario / párrafos' },
  { fg: '#25D366', bg: '#FFFFFF', desc: 'Verde WhatsApp sobre blanco' },
  { fg: '#0a2e16', bg: '#25D366', desc: 'Texto oscuro sobre botón WhatsApp' },
  { fg: '#092212', bg: '#25D366', desc: 'Texto oscuro sobre botón flotante WhatsApp' },
  
  // On #F3F4F6 base
  { fg: '#111827', bg: '#F3F4F6', desc: 'Texto principal sobre fondo base' },
  { fg: '#4B5563', bg: '#F3F4F6', desc: 'Texto secundario sobre fondo base' },
  { fg: '#25D366', bg: '#F3F4F6', desc: 'Verde WhatsApp sobre fondo base' },

  // On #111827 dark header/footer
  { fg: '#FFFFFF', bg: '#111827', desc: 'Texto blanco sobre header/footer' },
  { fg: '#9CA3AF', bg: '#111827', desc: 'Texto gris sobre footer/header' },
  { fg: '#798191', bg: '#111827', desc: 'Texto copyright sobre footer' },
  { fg: '#25D366', bg: '#111827', desc: 'Verde WhatsApp sobre footer/header' },
  { fg: '#374151', bg: '#111827', desc: 'Bordes en header/footer' },
];

console.log('--- Contrast Ratio Calculations ---');
const findings = [];

for (const pair of colorPairs) {
  const ratio = getContrast(pair.fg, pair.bg);
  const passNormal = ratio >= 4.5;
  const passLarge = ratio >= 3.0;
  console.log(`${pair.fg} on ${pair.bg} (${pair.desc}): ${ratio.toFixed(2)}:1 [Normal: ${passNormal ? 'PASS' : 'FAIL'}, Large: ${passLarge ? 'PASS' : 'FAIL'}]`);
  
  if (!passNormal) {
    findings.push({
      fg: pair.fg,
      bg: pair.bg,
      desc: pair.desc,
      ratio: parseFloat(ratio.toFixed(2)),
      passNormal,
      passLarge
    });
  }
}

const fs = require('fs');
fs.writeFileSync('auditoria/contrast_results.json', JSON.stringify({
  colorPairs: colorPairs.map(p => ({ ...p, ratio: parseFloat(getContrast(p.fg, p.bg).toFixed(2)) })),
  findings
}, null, 2));
