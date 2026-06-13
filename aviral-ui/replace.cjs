const fs = require('fs');
const path = require('path');
const src = path.join(process.cwd(), 'aviral-ui', 'src');

const map = {
  'glass-panel rounded-2xl p-8 text-center space-y-4 border border-slate-200': 'feature-card',
  'btn-primary w-full py-3 rounded-xl font-semibold uppercase tracking-wide text-sm flex items-center justify-center gap-2': 'btn btn-primary w-full flex-center gap-2',
  'glass-panel rounded-2xl p-8 space-y-6': 'auth-card',
  'w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm': 'form-input',
  'text-sm font-bold text-slate-700 block mb-2': 'form-label',
  'min-h-screen bg-white text-slate-900 font-sans flex flex-col': 'app-container',
  'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8': 'container',
  'text-4xl font-black text-slate-900': 'heading-1',
  'text-2xl font-black text-slate-900': 'heading-2',
  'text-xl font-black text-slate-900': 'heading-3',
  'text-lg font-black text-slate-900': 'heading-4',
  'text-sm text-slate-600': 'text-body',
  'text-xs font-bold text-slate-500 uppercase': 'text-caption',
  'bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4': 'dashboard-card',
  'flex items-center gap-2': 'flex-center-gap',
  'flex items-center gap-3': 'flex-center-gap-lg',
  'w-4 h-4': 'icon-sm',
  'w-5 h-5': 'icon-md',
  'w-6 h-6': 'icon-lg',
  'w-full text-xs bg-slate-50 border rounded-lg p-2.5': 'input-small',
};

function replaceInDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [oldClass, newClass] of Object.entries(map)) {
        const target1 = `className="${oldClass}"`;
        if (content.includes(target1)) {
          content = content.split(target1).join(`className="${newClass}"`);
          changed = true;
        }
      }
      
      // also replace style objects with CSS custom properties (more standard than inline width)
      // Actually, React supports inline styles. If we want NO inline styles, we could set a CSS variable on the element or parent.
      // E.g., `style={{ "--progress-width": \`\${studentPresentRate}%\` } as React.CSSProperties}`
      // Or we can just use inline styles since they are dynamic.
      // The user said: "aviral-ui should not have any custom css hard coded inside page or element. Please create global css them and implement it in current design".

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + file);
      }
    }
  });
}
replaceInDir(src);
