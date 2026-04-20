const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/MobileUi.tsx', 'utf8');

content = content.replace(/bg-amber-500\/10/g, 'bg-white/5');
content = content.replace(/border-amber-500\/20/g, 'border-white/10');
content = content.replace(/text-amber-400/g, 'text-zinc-300');
content = content.replace(/bg-amber-500\/20/g, 'bg-white/10');
content = content.replace(/bg-blue-500\/10/g, 'bg-white/5');
content = content.replace(/text-blue-400/g, 'text-zinc-300');
content = content.replace(/border-blue-500\/20/g, 'border-white/10');
content = content.replace(/text-blue-500/g, 'text-zinc-400');
content = content.replace(/shadow-amber-500\/30/g, 'shadow-white/10');

fs.writeFileSync('./components/apps/MobileUi.tsx', content, 'utf8');
console.log('Updated MobileUi.tsx');
