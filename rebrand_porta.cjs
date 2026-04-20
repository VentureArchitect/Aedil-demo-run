const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/Porta.tsx', 'utf8');

content = content.replace(/bg-\[\#1C1C1E\]/g, 'bg-zinc-900');
content = content.replace(/bg-\[\#0A0A0A\]/g, 'bg-black');
content = content.replace(/border-amber-400\/60/g, 'border-white/20');
content = content.replace(/border-amber-500\/50/g, 'border-white/20');
content = content.replace(/border-amber-500\/20/g, 'border-white/10');
content = content.replace(/text-amber-200/g, 'text-zinc-300');
content = content.replace(/bg-amber-600/g, 'bg-white/10 border border-white/20');
content = content.replace(/bg-orange-500\/20/g, 'bg-white/10');
content = content.replace(/hover:bg-orange-500/g, 'hover:bg-white/20');

fs.writeFileSync('./components/apps/Porta.tsx', content, 'utf8');
console.log('Updated Porta.tsx');
