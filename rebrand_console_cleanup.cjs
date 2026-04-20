const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/AedilConsole.tsx', 'utf8');

content = content.replace(/border border-white\/20\/30/g, 'border-white/10');

fs.writeFileSync('./components/apps/AedilConsole.tsx', content, 'utf8');
console.log('Updated AedilConsole.tsx');
