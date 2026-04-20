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

    // Replace indigo with amber
    content = content.replace(/indigo-600/g, 'amber-500');
    content = content.replace(/indigo-500/g, 'amber-500');
    content = content.replace(/indigo-400/g, 'amber-400');
    content = content.replace(/indigo-300/g, 'amber-300');
    content = content.replace(/indigo-200/g, 'amber-200');
    content = content.replace(/indigo-900/g, 'amber-900');
    content = content.replace(/indigo-50/g, 'amber-50');
    content = content.replace(/indigo-100/g, 'amber-100');
    
    // Replace purple with orange to keep gradients looking good (amber to orange)
    content = content.replace(/purple-600/g, 'orange-500');
    content = content.replace(/purple-500/g, 'orange-500');
    content = content.replace(/purple-400/g, 'orange-400');
    content = content.replace(/purple-300/g, 'orange-300');

    // Replace Curio with AEDIL
    content = content.replace(/Curio Agent/g, 'AEDIL Agent');
    content = content.replace(/Curio Intelligence/g, 'AEDIL Intelligence');
    content = content.replace(/Curio v2\.5/g, 'AEDIL v2.5');
    content = content.replace(/Curio \(GPT-4\)/g, 'AEDIL (GPT-4)');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
});
