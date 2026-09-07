const fs = require('fs');
const path = require('path');

const mappings = {
  'btn': 'px-4 py-2 rounded font-medium transition-colors duration-200 flex items-center justify-center gap-2',
  'btn-primary': 'bg-blue-600 text-white hover:bg-blue-700',
  'btn-secondary': 'bg-slate-200 text-slate-700 hover:bg-slate-300',
  'btn-danger': 'bg-red-600 text-white hover:bg-red-700',
  'input-field': 'w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white',
  'card': 'bg-white border border-slate-200 rounded-lg shadow-sm'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [cls, replacement] of Object.entries(mappings)) {
    const regex = new RegExp(`\\b${cls}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      callback(fullPath);
    }
  });
}

const srcPath = path.join(__dirname, 'client', 'src');
walkDir(srcPath, processFile);
console.log('All components updated to inline Tailwind classes!');
