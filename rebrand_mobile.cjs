const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/MobileUi.tsx', 'utf8');

// Replace light theme classes with dark glass theme classes
content = content.replace(/bg-white/g, 'bg-black');
content = content.replace(/text-zinc-900/g, 'text-white');
content = content.replace(/text-zinc-800/g, 'text-slate-200');
content = content.replace(/text-zinc-700/g, 'text-slate-300');
content = content.replace(/text-zinc-600/g, 'text-zinc-400');
content = content.replace(/bg-zinc-100/g, 'bg-white/5');
content = content.replace(/border-zinc-200/g, 'border-white/10');
content = content.replace(/border-zinc-100/g, 'border-white/5');
content = content.replace(/bg-zinc-50/g, 'bg-white/5');
content = content.replace(/bg-zinc-200\/50/g, 'bg-white/5');
content = content.replace(/bg-emerald-50/g, 'bg-emerald-500/10');
content = content.replace(/border-emerald-100/g, 'border-emerald-500/20');
content = content.replace(/text-emerald-600/g, 'text-emerald-400');
content = content.replace(/bg-amber-50/g, 'bg-amber-500/10');
content = content.replace(/border-amber-200/g, 'border-amber-500/20');
content = content.replace(/text-amber-600/g, 'text-amber-400');
content = content.replace(/bg-amber-100/g, 'bg-amber-500/20');
content = content.replace(/bg-blue-50/g, 'bg-blue-500/10');
content = content.replace(/border-blue-100/g, 'border-blue-500/20');
content = content.replace(/text-blue-800/g, 'text-blue-400');
content = content.replace(/text-blue-600/g, 'text-blue-400');
content = content.replace(/bg-blue-600/g, 'bg-white/10 border border-white/20');
content = content.replace(/shadow-blue-500\/20/g, 'shadow-white/10');
content = content.replace(/bg-amber-600/g, 'bg-white/10 border border-white/20');
content = content.replace(/shadow-amber-500\/20/g, 'shadow-white/10');
content = content.replace(/bg-zinc-900\/90/g, 'bg-black/90');
content = content.replace(/bg-zinc-900/g, 'bg-black');
content = content.replace(/text-black/g, 'text-white'); // For active nav icon

fs.writeFileSync('./components/apps/MobileUi.tsx', content, 'utf8');
console.log('Updated MobileUi.tsx');
