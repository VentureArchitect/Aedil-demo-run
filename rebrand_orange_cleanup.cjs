const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/FSM.tsx', 'utf8');
content = content.replace(/bg-orange-500\/20 border-orange-500\/30/g, 'bg-white/10 border-white/20');
content = content.replace(/text-orange-400/g, 'text-zinc-300');
fs.writeFileSync('./components/apps/FSM.tsx', content, 'utf8');

console.log('Cleaned up orange classes');
