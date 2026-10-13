import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve('src');

function getAllFiles(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) res = res.concat(getAllFiles(full));
    else if (f.endsWith('.ts') || f.endsWith('.tsx')) res.push(full);
  }
  return res;
}

const files = getAllFiles(SRC_DIR);
let deepImportsCount = 0;
const deepImportExamples = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('../../') || l.includes('../../../') || l.includes('../../../../')) {
      deepImportsCount++;
      if (deepImportExamples.length < 10 && (l.includes('from \'') || l.includes('from "'))) {
        deepImportExamples.push({ file: path.relative(SRC_DIR, f).replace(/\\/g, '/'), line: idx + 1, text: l.trim() });
      }
    }
  });
});

console.log(`Total deep relative imports (>= 2 levels ../../): ${deepImportsCount}`);
console.log('Sample deep imports:');
deepImportExamples.forEach(e => console.log(`  [${e.file}:${e.line}] ${e.text}`));

// Check index.ts files in src
const indexFiles = files.filter(f => f.endsWith('index.ts') || f.endsWith('index.tsx'));
console.log(`\nExisting index.ts/tsx files in src/ (${indexFiles.length}):`);
indexFiles.forEach(f => console.log(`  - ${path.relative(SRC_DIR, f).replace(/\\/g, '/')}`));
