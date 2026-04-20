const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/FSM.tsx', 'utf8');
content = content.replace(/bg-blue-500\/20 border-blue-500\/30 text-blue-400/g, 'bg-white/10 border-white/20 text-zinc-300');
fs.writeFileSync('./components/apps/FSM.tsx', content, 'utf8');

content = fs.readFileSync('./components/apps/ConsoleViews.tsx', 'utf8');
content = content.replace(/bg-blue-900\/20 text-blue-400 border-blue-500\/20/g, 'bg-white/10 text-zinc-300 border-white/20');
fs.writeFileSync('./components/apps/ConsoleViews.tsx', content, 'utf8');

content = fs.readFileSync('./components/apps/WorkflowBuilder.tsx', 'utf8');
content = content.replace(/text-blue-400/g, 'text-zinc-300');
content = content.replace(/border-blue-500\/50/g, 'border-white/20');
content = content.replace(/bg-blue-500\/10/g, 'bg-white/10');
fs.writeFileSync('./components/apps/WorkflowBuilder.tsx', content, 'utf8');

console.log('Cleaned up blue classes');
