const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/Gallery.tsx', 'utf8');

content = content.replace(/bg-\[\#1e1e1e\]/g, 'bg-black');
content = content.replace(/bg-\[\#252526\]/g, 'bg-zinc-950');
content = content.replace(/bg-blue-600/g, 'bg-white/10 border border-white/20');
content = content.replace(/hover:bg-blue-700/g, 'hover:bg-white/20');
content = content.replace(/text-gray-300/g, 'text-zinc-400');

fs.writeFileSync('./components/apps/Gallery.tsx', content, 'utf8');
console.log('Updated Gallery.tsx');
