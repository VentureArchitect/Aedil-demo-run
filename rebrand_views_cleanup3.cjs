const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/ConsoleViews.tsx', 'utf8');

content = content.replace(/border border-white\/20\/10/g, 'border-white/10');
content = content.replace(/border border-white\/20 hover:bg-white\/10 border border-white\/20/g, 'border-white/20 hover:bg-white/10');
content = content.replace(/border border-white\/20\/5 border border-white\/10/g, 'border-white/10');
content = content.replace(/hover:bg-white\/10 border border-white\/20 transition-all/g, 'hover:bg-white/10 transition-all');
content = content.replace(/bg-white\/10 border border-white\/20\/5/g, 'bg-white/10 border-white/10');
content = content.replace(/border border-white\/10\/50/g, 'border-white/10');
content = content.replace(/border border-white\/20\/20/g, 'border-white/20');
content = content.replace(/bg-white\/10 border border-white\/20 text-white shadow-lg/g, 'bg-white/10 border border-white/20 text-white shadow-lg');
content = content.replace(/bg-white\/10 border border-white\/20 group-hover:bg-white/g, 'bg-white/10 border border-white/20 group-hover:bg-white');
content = content.replace(/bg-white\/10 border border-white\/20/g, 'bg-white/10 border border-white/20');
content = content.replace(/bg-white\/10 border border-white\/20\/10 text-zinc-300 border-white\/10/g, 'bg-white/10 border border-white/10 text-zinc-300');
content = content.replace(/border border-white\/10 text-zinc-300 border-white\/10/g, 'border border-white/10 text-zinc-300');
content = content.replace(/border-white\/10 text-zinc-300 border-white\/10/g, 'border border-white/10 text-zinc-300');
content = content.replace(/border border-white\/20 text-white px-4/g, 'border border-white/20 text-white px-4');
content = content.replace(/border border-white\/20 scale-125/g, 'border border-white/20 scale-125');
content = content.replace(/hover:border-white\/20/g, 'hover:border-white/20');
content = content.replace(/border border-white\/20 shadow-\[0_0_10px_rgba\(255,255,255,0\.1\)\]/g, 'border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]');
content = content.replace(/border border-white\/20 shadow-\[0_0_10px_rgba\(99,102,241,0\.5\)\]/g, 'border border-white/20 shadow-[0_0_10px_rgba(99,102,241,0.5)]');
content = content.replace(/bg-white\/10 border border-white\/20 text-white text-xs/g, 'bg-white/10 border border-white/20 text-white text-xs');

fs.writeFileSync('./components/apps/ConsoleViews.tsx', content, 'utf8');
console.log('Updated ConsoleViews.tsx');
