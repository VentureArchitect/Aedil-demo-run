const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/AedilOverlay.tsx', 'utf8');

content = content.replace(/bg-white\/10 border border-white\/10 px-1\.5 py-0\.5 rounded border border-white\/10/g, 'bg-white/10 border border-white/10 px-1.5 py-0.5 rounded');
content = content.replace(/bg-white\/10 border border-white\/10 blur-\[50px\] rounded-full group-hover:bg-white\/10 border border-white\/20/g, 'bg-white/10 border border-white/10 blur-[50px] rounded-full group-hover:bg-white/10 group-hover:border-white/20');
content = content.replace(/bg-white\/10 border border-white\/10 px-2 py-1 rounded border border-white\/10/g, 'bg-white/10 border border-white/10 px-2 py-1 rounded');
content = content.replace(/border-white\/20 bg-white\/10 border border-white\/10/g, 'bg-white/10 border border-white/20');
content = content.replace(/bg-white\/10 hover:bg-white\/10 border border-white\/20/g, 'bg-white/10 hover:bg-white/20 border border-white/20');

fs.writeFileSync('./components/apps/AedilOverlay.tsx', content, 'utf8');
console.log('Updated AedilOverlay.tsx');
