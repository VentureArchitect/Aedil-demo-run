const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/os/AedilOverlay.tsx', 'utf8');
content = content.replace(/bg-gradient-to-r from-teal-900\/40 to-teal-800\/10 border border-teal-500\/30/g, 'bg-white/5 border border-white/10');
content = content.replace(/bg-teal-500/g, 'bg-white/10 border border-white/20');
content = content.replace(/text-teal-400/g, 'text-zinc-400');
fs.writeFileSync('./components/os/AedilOverlay.tsx', content, 'utf8');

content = fs.readFileSync('./components/apps/AedilOverlay.tsx', 'utf8');
content = content.replace(/bg-gradient-to-r from-teal-900\/40 to-teal-800\/10 border border-teal-500\/30/g, 'bg-white/5 border border-white/10');
content = content.replace(/bg-teal-500/g, 'bg-white/10 border border-white/20');
content = content.replace(/text-teal-400/g, 'text-zinc-400');
fs.writeFileSync('./components/apps/AedilOverlay.tsx', content, 'utf8');

console.log('Cleaned up teal classes');
