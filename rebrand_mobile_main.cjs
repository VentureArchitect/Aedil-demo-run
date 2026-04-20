const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/Mobile.tsx', 'utf8');

content = content.replace(/bg-\[\#F2F2F7\]/g, 'bg-black');
content = content.replace(/from-amber-400/g, 'from-white/40');
content = content.replace(/shadow-amber-500\/30/g, 'shadow-white/20');
content = content.replace(/text-black fill-black/g, 'text-white fill-white');
content = content.replace(/bg-black\/80/g, 'bg-white/80');

fs.writeFileSync('./components/apps/Mobile.tsx', content, 'utf8');
console.log('Updated Mobile.tsx');
