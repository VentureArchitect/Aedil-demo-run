const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/AedilOverlay.tsx', 'utf8');

content = content.replace(/border border-white\/20\/10 border border-white\/10/g, 'border border-white/10');
content = content.replace(/border border-white\/20\/20/g, 'border border-white/20');
content = content.replace(/border border-white\/20 hover:bg-white\/10 border border-white\/20/g, 'border border-white/20 hover:bg-white/10');
content = content.replace(/bg-white\/10 border border-white\/20\/10/g, 'bg-white/10 border border-white/10');
content = content.replace(/bg-white\/10 border border-white\/10/g, 'bg-white/10 border border-white/10');

fs.writeFileSync('./components/apps/AedilOverlay.tsx', content, 'utf8');
console.log('Updated AedilOverlay.tsx');
