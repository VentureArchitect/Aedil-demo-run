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

    content = content.replace(/color="indigo"/g, 'color="amber"');
    content = content.replace(/statusColor="indigo"/g, 'statusColor="amber"');
    content = content.replace(/statusColor = 'indigo'/g, "statusColor = 'amber'");
    content = content.replace(/color: "indigo"/g, 'color: "amber"');
    content = content.replace(/indigo:/g, 'amber:');
    
    content = content.replace(/color="purple"/g, 'color="orange"');
    content = content.replace(/statusColor="purple"/g, 'statusColor="orange"');
    content = content.replace(/statusColor = 'purple'/g, "statusColor = 'orange'");
    content = content.replace(/color: "purple"/g, 'color: "orange"');
    content = content.replace(/purple:/g, 'orange:');

    // FSM specific
    content = content.replace(/purple-900/g, 'amber-900');
    content = content.replace(/purple-800/g, 'amber-800');
    content = content.replace(/purple-700/g, 'amber-700');
    content = content.replace(/purple-200/g, 'amber-200');
    content = content.replace(/purple-50/g, 'amber-50');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
});
