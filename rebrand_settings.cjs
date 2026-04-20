const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/Settings.tsx', 'utf8');

content = content.replace(/bg-\[\#F5F5F7\]/g, 'bg-black');
content = content.replace(/text-\[\#1d1d1f\]/g, 'text-slate-300');
content = content.replace(/border-\[\#E5E5E5\]/g, 'border-white/10');
content = content.replace(/bg-gray-300/g, 'bg-white/10');
content = content.replace(/text-gray-500/g, 'text-zinc-500');
content = content.replace(/bg-white/g, 'bg-zinc-950');
content = content.replace(/border-gray-200/g, 'border-white/10');
content = content.replace(/bg-gray-200/g, 'bg-white/10');
content = content.replace(/border-gray-300/g, 'border-white/20');
content = content.replace(/bg-blue-600/g, 'bg-white/10 border border-white/20');
content = content.replace(/bg-blue-500/g, 'bg-white/10 border border-white/20');
content = content.replace(/bg-orange-500/g, 'bg-white/10 border border-white/20');
content = content.replace(/divide-gray-100/g, 'divide-white/5');
content = content.replace(/bg-\[\#007AFF\]/g, 'bg-white/10 border border-white/20');
content = content.replace(/hover:bg-\[\#0000000d\]/g, 'hover:bg-white/5');

fs.writeFileSync('./components/apps/Settings.tsx', content, 'utf8');
console.log('Updated Settings.tsx');
