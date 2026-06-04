const fs = require('fs');
const path = require('path');
const mapping = require('./mapping.json');

const searchDirs = [
    path.join(__dirname, '../../frontend/app'),
    path.join(__dirname, '../../frontend/components'),
    path.join(__dirname, '../seed.js')
];

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Use regex to find string literals or template strings containing /images/
    // It's safer to just iterate over the mapping and replace all occurrences of the keys.
    for (const [localPath, cloudUrl] of Object.entries(mapping)) {
        // Replace /images/products/xyz.jpeg with the cloudUrl
        // Also replace /images/products/xyz.svg if they used .svg instead of .jpeg in frontend but it doesn't match?
        // Wait, the grep search showed some "/images/products/himalayan-salt-makhana.svg" but the mapping has .jpeg.
        // Let's replace the base name regardless of extension? No, let's just do exact string replacement first.
        
        // Split by the extension to match any extension used in frontend (e.g. .svg vs .jpeg)
        const baseName = localPath.substring(0, localPath.lastIndexOf('.'));
        
        // Create regex to match the path with ANY extension
        // e.g. \/images\/products\/himalayan-salt-makhana\.(jpeg|jpg|png|svg)
        const regex = new RegExp(baseName.replace(/\//g, '\\/') + '\\.(jpeg|jpg|png|svg|webp|gif)', 'g');
        
        if (regex.test(content)) {
            content = content.replace(regex, cloudUrl);
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    if (fs.statSync(dir).isFile()) {
        replaceInFile(dir);
        return;
    }
    const files = fs.readdirSync(dir);
    for (const file of files) {
        processDirectory(path.join(dir, file));
    }
}

for (const dir of searchDirs) {
    processDirectory(dir);
}
console.log('Replacement complete.');
