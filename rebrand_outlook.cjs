const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/Outlook.tsx', 'utf8');

content = content.replace(/bg-white/g, 'bg-black');
content = content.replace(/text-\[\#252423\]/g, 'text-slate-200');
content = content.replace(/bg-\[\#0f6cbd\]/g, 'bg-white/5 border-b border-white/10');
content = content.replace(/bg-\[\#f0f0f0\]/g, 'bg-zinc-950');
content = content.replace(/border-gray-200/g, 'border-white/10');
content = content.replace(/bg-gray-300/g, 'bg-white/20');
content = content.replace(/bg-\[\#faf9f8\]/g, 'bg-zinc-900');
content = content.replace(/hover:bg-\[\#0e5ea3\]/g, 'hover:bg-white/10');
content = content.replace(/text-gray-700/g, 'text-slate-300');
content = content.replace(/text-gray-500/g, 'text-zinc-500');
content = content.replace(/hover:bg-gray-100/g, 'hover:bg-white/10');
content = content.replace(/bg-\[\#cce3f5\]/g, 'bg-white/10');
content = content.replace(/border-l-\[\#0f6cbd\]/g, 'border-l-white');
content = content.replace(/text-black/g, 'text-white');
content = content.replace(/text-gray-600/g, 'text-zinc-400');
content = content.replace(/border-gray-100/g, 'border-white/5');
content = content.replace(/bg-gray-400/g, 'bg-zinc-700');
content = content.replace(/from-\[\#f0f6ff\]/g, 'from-white/10');
content = content.replace(/to-\[\#f5f9ff\]/g, 'to-white/5');
content = content.replace(/border-blue-100/g, 'border-white/20');
content = content.replace(/text-gray-400/g, 'text-zinc-500');
content = content.replace(/bg-yellow-100/g, 'bg-amber-500/20 text-amber-200');
content = content.replace(/border-gray-300/g, 'border-white/20');
content = content.replace(/hover:border-gray-400/g, 'hover:border-white/30');
content = content.replace(/bg-\[\#e1dfdd\]/g, 'bg-white/10');
content = content.replace(/hover:bg-\[\#edebe9\]/g, 'hover:bg-white/5');
content = content.replace(/text-\[\#0f6cbd\]/g, 'text-white');
content = content.replace(/bg-orange-500/g, 'bg-white/10 border border-white/20');

fs.writeFileSync('./components/apps/Outlook.tsx', content, 'utf8');
console.log('Updated Outlook.tsx');
