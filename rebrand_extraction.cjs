const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/ExtractionPanel.tsx', 'utf8');

content = content.replace(/bg-\[\#15151A\]/g, 'bg-black/80 backdrop-blur-md');
content = content.replace(/bg-\[\#1A1A20\]/g, 'bg-white/5');
content = content.replace(/from-white\/20 to-orange-500/g, 'from-white/20 to-white/5');
content = content.replace(/shadow-amber-500\/20/g, 'shadow-white/10');
content = content.replace(/border-amber-500\/20/g, 'border-white/20');
content = content.replace(/bg-\[\#0B0C10\]/g, 'bg-zinc-950/50');
content = content.replace(/border-amber-500\/30/g, 'border-white/30');
content = content.replace(/bg-amber-900\/10/g, 'bg-white/10');
content = content.replace(/text-amber-200/g, 'text-white');
content = content.replace(/shadow-amber-900\/20/g, 'shadow-white/10');

fs.writeFileSync('./components/apps/ExtractionPanel.tsx', content, 'utf8');
console.log('Updated ExtractionPanel.tsx');
