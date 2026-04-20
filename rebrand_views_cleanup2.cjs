const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/ConsoleViews.tsx', 'utf8');

content = content.replace(/shadow-amber-900\/20/g, 'shadow-white/10');
content = content.replace(/border-amber-500\/10/g, 'border-white/10');

fs.writeFileSync('./components/apps/ConsoleViews.tsx', content, 'utf8');
console.log('Updated ConsoleViews.tsx');
