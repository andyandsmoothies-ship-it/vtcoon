import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('scratch/ast_report.json', 'utf8'));

console.log('=== CLIENT TO SERVER IMPORTS BY TARGET ===');
const c2sByTarget = {};
for (const v of data.seamViolations.clientToServer) {
  if (!c2sByTarget[v.to]) c2sByTarget[v.to] = { count: 0, symbols: new Set(), callers: [] };
  c2sByTarget[v.to].count++;
  v.named.forEach((n) => c2sByTarget[v.to].symbols.add(n));
  c2sByTarget[v.to].callers.push(v.from);
}
for (const [k, v] of Object.entries(c2sByTarget)) {
  console.log(`  ${k}: ${v.count} client imports | symbols: [${[...v.symbols].join(', ')}]`);
}

console.log('\n=== CLIENT TO DOMAIN IMPORTS BY TARGET ===');
const c2dByTarget = {};
for (const v of data.seamViolations.clientDeepHelperImports) {
  if (!c2dByTarget[v.to]) c2dByTarget[v.to] = { count: 0, runtimeCount: 0, symbols: new Set() };
  c2dByTarget[v.to].count++;
  if (!v.isTypeOnly) c2dByTarget[v.to].runtimeCount++;
  v.named.forEach((n) => c2dByTarget[v.to].symbols.add(n));
}
for (const [k, v] of Object.entries(c2dByTarget).sort((a, b) => b[1].count - a[1].count)) {
  console.log(`  ${k}: ${v.count} client imports (runtime: ${v.runtimeCount}) | symbols: [${[...v.symbols].join(', ')}]`);
}
