const fs = require('fs');
const path = require('path');
const src = path.join(process.cwd(), 'aviral-ui', 'src');

let count = 0;
let classMap = new Map();

function search(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      search(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/className="([^"]+)"/g);
      if (matches) {
        count += matches.length;
        matches.forEach(m => {
          const cls = m.replace('className="', '').replace('"', '');
          classMap.set(cls, (classMap.get(cls) || 0) + 1);
        });
      }
    }
  });
}
search(src);
console.log('Total classNames:', count);
console.log('Unique class strings:', classMap.size);

// Get top 20 most used classes
const sorted = [...classMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
console.log('Top classes:', sorted);
