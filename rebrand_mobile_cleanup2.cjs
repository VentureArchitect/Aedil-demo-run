const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/MobileUi.tsx', 'utf8');

content = content.replace(/border border-white\/20\/10 flex items-center justify-center border border-white\/10/g, 'border border-white/10 flex items-center justify-center');

fs.writeFileSync('./components/apps/MobileUi.tsx', content, 'utf8');
console.log('Updated MobileUi.tsx');
