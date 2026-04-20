const fs = require('fs');
const path = require('path');

function replaceColors(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/bg-\[\#0A0A0A\]/g, 'bg-black');
    content = content.replace(/bg-\[\#08080A\]/g, 'bg-black');
    content = content.replace(/bg-\[\#1A1A24\]/g, 'bg-zinc-900');
    content = content.replace(/bg-\[\#15151A\]/g, 'bg-zinc-950');
    content = content.replace(/bg-\[\#0F0F13\]/g, 'bg-zinc-950');
    content = content.replace(/bg-\[\#1A1A20\]/g, 'bg-zinc-900');
    content = content.replace(/bg-\[\#202028\]/g, 'bg-zinc-800');
    content = content.replace(/from-\[\#0A0A0A\]/g, 'from-black');
    content = content.replace(/via-\[\#0A0A0A\]/g, 'via-black');
    content = content.replace(/to-\[\#0A0A0A\]/g, 'to-black');
    content = content.replace(/from-\[\#1A1A24\]/g, 'from-zinc-900');
    content = content.replace(/to-\[\#15151A\]/g, 'to-zinc-950');
    content = content.replace(/to-\[\#0F0F13\]/g, 'to-zinc-950');
    
    // Also replace amber borders and shadows to white/glass
    content = content.replace(/border-amber-500\/30/g, 'border-white/10');
    content = content.replace(/border-amber-500\/20/g, 'border-white/10');
    content = content.replace(/border-amber-500\/50/g, 'border-white/20');
    content = content.replace(/border-amber-900\/50/g, 'border-white/10');
    content = content.replace(/bg-amber-950\/30/g, 'bg-white/5');
    content = content.replace(/shadow-\[0_0_15px_rgba\(245,158,11,0\.5\)\]/g, 'shadow-[0_0_15px_rgba(255,255,255,0.1)]');
    content = content.replace(/shadow-\[0_0_10px_rgba\(245,158,11,0\.5\)\]/g, 'shadow-[0_0_10px_rgba(255,255,255,0.1)]');
    content = content.replace(/text-amber-300/g, 'text-white');
    content = content.replace(/text-amber-200/g, 'text-zinc-300');
    content = content.replace(/bg-amber-900\/20/g, 'bg-white/5');
    content = content.replace(/border-amber-500/g, 'border-white/20');
    content = content.replace(/from-amber-900\/40/g, 'from-white/5');
    content = content.replace(/via-amber-500/g, 'via-white/20');
    content = content.replace(/to-amber-300/g, 'to-white');

    fs.writeFileSync(filePath, content, 'utf8');
}

replaceColors('./components/os/AedilOverlay.tsx');
replaceColors('./components/apps/AedilOverlay.tsx');
console.log('Updated AedilOverlay.tsx files');
