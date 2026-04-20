const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/os/AedilOverlay.tsx', 'utf8');

content = content.replace(/fill-amber-400/g, 'fill-white');
content = content.replace(/bg-amber-600/g, 'bg-white/10');
content = content.replace(/shadow-amber-500\/25/g, 'shadow-white/10');
content = content.replace(/bg-orange-500/g, 'bg-white/10');
content = content.replace(/hover:bg-orange-500/g, 'hover:bg-white/20');
content = content.replace(/shadow-orange-500\/25/g, 'shadow-white/10');
content = content.replace(/bg-blue-600/g, 'bg-white/10');
content = content.replace(/hover:bg-blue-500/g, 'hover:bg-white/20');
content = content.replace(/shadow-blue-500\/25/g, 'shadow-white/10');
content = content.replace(/bg-emerald-600/g, 'bg-white/10');
content = content.replace(/hover:bg-emerald-500/g, 'hover:bg-white/20');
content = content.replace(/shadow-emerald-500\/25/g, 'shadow-white/10');
content = content.replace(/bg-zinc-700/g, 'bg-white/10');
content = content.replace(/hover:bg-zinc-600/g, 'hover:bg-white/20');
content = content.replace(/shadow-zinc-500\/25/g, 'shadow-white/10');
content = content.replace(/from-orange-500/g, 'from-white/20');

fs.writeFileSync('./components/os/AedilOverlay.tsx', content, 'utf8');
console.log('Updated OS AedilOverlay.tsx');
