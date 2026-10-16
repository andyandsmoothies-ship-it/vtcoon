import fs from 'node:fs';
import path from 'node:path';
import { detectCycles } from './boundary_linter/boundary_rules.mjs';

function getAllSourceFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllSourceFiles(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const repoRoot = process.cwd();
const files = getAllSourceFiles(path.join(repoRoot, 'src'));
const cycles = detectCycles(files, repoRoot);
console.log(`Cycles count: ${cycles.length}`);
cycles.forEach((c, i) => {
  console.log(`[SCC-${i + 1}] (${c.length} files):`);
  c.forEach(f => console.log(`  -> ${f}`));
});
