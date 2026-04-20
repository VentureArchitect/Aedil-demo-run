const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('./components', (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace amber/orange with a sleek dark/glass/iridescent theme
    content = content.replace(/text-amber-500/g, 'text-white');
    content = content.replace(/text-amber-400/g, 'text-zinc-300');
    content = content.replace(/bg-amber-500/g, 'bg-white/10 border border-white/20');
    content = content.replace(/bg-amber-400/g, 'bg-white/20');
    content = content.replace(/from-amber-500/g, 'from-white/20');
    content = content.replace(/via-orange-500/g, 'via-white/10');
    content = content.replace(/to-amber-500/g, 'to-transparent');
    content = content.replace(/to-orange-600/g, 'to-white/5');
    content = content.replace(/to-cyan-500/g, 'to-white/5');
    content = content.replace(/from-orange-500/g, 'from-white/20');
    content = content.replace(/to-pink-500/g, 'to-white/5');
    
    content = content.replace(/bg-\[\#0B0C15\]/g, 'bg-black');
    content = content.replace(/bg-slate-900/g, 'bg-zinc-950');
    content = content.replace(/bg-slate-800/g, 'bg-zinc-900');
    content = content.replace(/border-slate-800/g, 'border-white/10');
    content = content.replace(/border-slate-700/g, 'border-white/10');
    content = content.replace(/text-slate-400/g, 'text-zinc-400');
    content = content.replace(/text-slate-500/g, 'text-zinc-500');
    
    // Status colors
    content = content.replace(/statusColor="amber"/g, 'statusColor="zinc"');
    content = content.replace(/statusColor="orange"/g, 'statusColor="zinc"');
    content = content.replace(/statusColor = 'amber'/g, "statusColor = 'zinc'");
    content = content.replace(/statusColor = 'orange'/g, "statusColor = 'zinc'");
    content = content.replace(/color="amber"/g, 'color="zinc"');
    content = content.replace(/color="orange"/g, 'color="zinc"');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
});
