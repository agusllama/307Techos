const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run cspell with json reporter or line by line
const rawOutput = execSync('npx --yes cspell -c auditoria/cspell.json "auditoria/extracted_text/*_main.txt" --show-context', {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'ignore'] // ignore stderr
}).catch ? '' : ''; // execSync might throw if exit code is 1
