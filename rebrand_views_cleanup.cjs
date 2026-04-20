const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/ConsoleViews.tsx', 'utf8');

content = content.replace(/bg-\[\#08080C\]/g, 'bg-black');
content = content.replace(/border-amber-500\/20/g, 'border-white/10');
content = content.replace(/border-amber-500\/30/g, 'border-white/10');
content = content.replace(/border-amber-500\/50/g, 'border-white/20');
content = content.replace(/border-amber-400\/50/g, 'border-white/20');
content = content.replace(/bg-amber-900\/10/g, 'bg-white/5');
content = content.replace(/bg-amber-900\/20/g, 'bg-white/5');
content = content.replace(/text-amber-300/g, 'text-white');
content = content.replace(/text-amber-400/g, 'text-white');
content = content.replace(/via-amber-500\/50/g, 'via-white/20');
content = content.replace(/shadow-\[0_0_10px_rgba\(245,158,11,0\.5\)\]/g, 'shadow-[0_0_10px_rgba(255,255,255,0.1)]');

fs.writeFileSync('./components/apps/ConsoleViews.tsx', content, 'utf8');
console.log('Updated ConsoleViews.tsx');
