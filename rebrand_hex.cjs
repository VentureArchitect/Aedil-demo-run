const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/ConsoleViews.tsx', 'utf8');

content = content.replace(/bg-\[\#151621\]/g, 'bg-zinc-950');
content = content.replace(/bg-\[\#08080C\]/g, 'bg-black');
content = content.replace(/bg-\[\#05050A\]/g, 'bg-black');
content = content.replace(/bg-\[\#0A0A0F\]/g, 'bg-zinc-950');
content = content.replace(/bg-\[\#1A1B26\]/g, 'bg-zinc-900');
content = content.replace(/bg-\[\#25263a\]/g, 'bg-zinc-800');

fs.writeFileSync('./components/apps/ConsoleViews.tsx', content, 'utf8');
console.log('Updated ConsoleViews.tsx');
