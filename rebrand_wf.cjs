const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/WorkflowBuilder.tsx', 'utf8');

content = content.replace(/bg-\[\#05050A\]/g, 'bg-black');
content = content.replace(/bg-\[\#0F1019\]/g, 'bg-zinc-950');
content = content.replace(/bg-\[\#1E1E2E\]/g, 'bg-zinc-900');
content = content.replace(/bg-\[\#1E293B\]/g, 'bg-zinc-800');
content = content.replace(/border-amber-500\/50/g, 'border-white/20');
content = content.replace(/border-amber-500\/20/g, 'border-white/10');
content = content.replace(/border-amber-500\/40/g, 'border-white/20');
content = content.replace(/border-amber-500\/30/g, 'border-white/10');
content = content.replace(/shadow-amber-500\/30/g, 'shadow-white/10');
content = content.replace(/shadow-amber-900\/20/g, 'shadow-white/5');
content = content.replace(/text-amber-100/g, 'text-white');
content = content.replace(/rgba\(245,158,11,0\.3\)/g, 'rgba(255,255,255,0.2)');
content = content.replace(/rgba\(245,158,11,0\.15\)/g, 'rgba(255,255,255,0.05)');
content = content.replace(/rgba\(99,102,241,0\.4\)/g, 'rgba(255,255,255,0.1)');

fs.writeFileSync('./components/apps/WorkflowBuilder.tsx', content, 'utf8');
console.log('Updated WorkflowBuilder.tsx');
