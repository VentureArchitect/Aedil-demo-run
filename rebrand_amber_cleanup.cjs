const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/Outlook.tsx', 'utf8');
content = content.replace(/bg-amber-500\/20 text-amber-200/g, 'bg-white/10 text-white');
fs.writeFileSync('./components/apps/Outlook.tsx', content, 'utf8');

content = fs.readFileSync('./components/apps/SAP.tsx', 'utf8');
content = content.replace(/bg-amber-500\/20 border border-amber-500\/30/g, 'bg-white/10 border border-white/20');
fs.writeFileSync('./components/apps/SAP.tsx', content, 'utf8');

content = fs.readFileSync('./components/apps/FSM.tsx', 'utf8');
content = content.replace(/bg-amber-500\/100\/10 border-b border-amber-500\/50\/20 text-amber-400/g, 'bg-white/5 border-b border-white/10 text-zinc-300');
content = content.replace(/bg-amber-500\/100\/20 px-2 py-0\.5 rounded border border-amber-500\/50\/30/g, 'bg-white/10 px-2 py-0.5 rounded border border-white/20');
content = content.replace(/hover:bg-amber-500\/100\/10 transition-colors text-amber-400/g, 'hover:bg-white/10 transition-colors text-zinc-300');
content = content.replace(/bg-amber-500\/10/g, 'bg-white/10');
content = content.replace(/bg-amber-500\/10\/50/g, 'bg-white/5');
content = content.replace(/border border-amber-500\/50 bg-amber-500\/20/g, 'border border-white/20 bg-white/10');
content = content.replace(/bg-amber-400/g, 'bg-white');
content = content.replace(/bg-amber-500\/20 border-orange-500\/30 text-amber-800/g, 'bg-white/10 border-white/20 text-zinc-300');
fs.writeFileSync('./components/apps/FSM.tsx', content, 'utf8');

console.log('Cleaned up remaining amber classes');
