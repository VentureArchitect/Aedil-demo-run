const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('./components/apps/WorkflowBuilder.tsx', 'utf8');

content = content.replace(/focus:ring-amber-500\/20/g, 'focus:ring-white/20');

fs.writeFileSync('./components/apps/WorkflowBuilder.tsx', content, 'utf8');
console.log('Updated WorkflowBuilder.tsx');
