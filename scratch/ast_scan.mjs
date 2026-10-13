import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const SRC_DIR = path.resolve('src');

// Collect all ts and tsx files
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

const allFiles = getAllSourceFiles(SRC_DIR);

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

function resolveImportPath(containingFile, importSpecifier) {
  if (!importSpecifier.startsWith('.')) {
    return null;
  }
  const dir = path.dirname(containingFile);
  const resolvedBase = path.resolve(dir, importSpecifier);
  
  const candidates = [
    resolvedBase + '.ts',
    resolvedBase + '.tsx',
    resolvedBase + '.d.ts',
    path.join(resolvedBase, 'index.ts'),
    path.join(resolvedBase, 'index.tsx'),
    resolvedBase
  ];
  
  for (const cand of candidates) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
      return path.resolve(cand);
    }
  }
  return null;
}

const fileMetrics = new Map();

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const loc = content.split('\n').length;
  fileMetrics.set(file, {
    file,
    relPath: normalizePath(path.relative(SRC_DIR, file)),
    loc,
    fanIn: new Set(),
    fanOut: new Set(),
    imports: []
  });
});

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const sf = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const currentMetric = fileMetrics.get(file);

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const specifier = node.moduleSpecifier.text;
        const resolved = resolveImportPath(file, specifier);
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
        currentMetric.imports.push({ specifier, resolved, line: line + 1 });
        if (resolved && fileMetrics.has(resolved) && resolved !== file) {
          currentMetric.fanOut.add(resolved);
          fileMetrics.get(resolved).fanIn.add(file);
        }
      }
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        const specifier = arg.text;
        const resolved = resolveImportPath(file, specifier);
        if (resolved && fileMetrics.has(resolved) && resolved !== file) {
          currentMetric.fanOut.add(resolved);
          fileMetrics.get(resolved).fanIn.add(file);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
});

// Top Coupling Hubs
const sortedByFanIn = [...fileMetrics.values()].sort((a, b) => b.fanIn.size - a.fanIn.size);
console.log('=== TOP 15 COUPLING HUBS (HIGHEST FAN-IN) ===');
sortedByFanIn.slice(0, 15).forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.relPath}] - Fan-in: ${m.fanIn.size} files, Fan-out: ${m.fanOut.size}, LOC: ${m.loc}`);
});

// Cycles
const cycles = [];
const visited = new Set();
const recursionStack = new Set();
const pathStack = [];

function findCyclesDFS(u) {
  visited.add(u);
  recursionStack.add(u);
  pathStack.push(u);

  const uMetric = fileMetrics.get(u);
  for (const v of uMetric.fanOut) {
    if (!visited.has(v)) {
      findCyclesDFS(v);
    } else if (recursionStack.has(v)) {
      const cycleStartIndex = pathStack.indexOf(v);
      const cycle = pathStack.slice(cycleStartIndex);
      cycle.push(v);
      cycles.push(cycle.map(f => fileMetrics.get(f).relPath));
    }
  }

  recursionStack.delete(u);
  pathStack.pop();
}

for (const file of allFiles) {
  if (!visited.has(file)) {
    findCyclesDFS(file);
  }
}

// Group cycles by unique set of files to avoid duplicate cycle reports
const uniqueCycleKeys = new Set();
const uniqueCycles = [];
for (const c of cycles) {
  const fileSet = [...c.slice(0, -1)].sort().join('|');
  if (!uniqueCycleKeys.has(fileSet)) {
    uniqueCycleKeys.add(fileSet);
    uniqueCycles.push(c);
  }
}

console.log(`\n=== UNIQUE CIRCULAR DEPENDENCY LOOPS (Total: ${uniqueCycles.length}) ===`);
uniqueCycles.forEach((c, idx) => {
  console.log(`\n[Cycle ${idx + 1}] (length ${c.length - 1}):`);
  console.log(`  ` + c.join('\n  -> '));
});

// Boundary audit
console.log('\n=== ARCHITECTURAL BOUNDARY AUDIT ===');
const clientImportsServer = [];
const domainImportsClient = [];
const domainImportsServer = [];

for (const [file, m] of fileMetrics.entries()) {
  const fromRel = m.relPath;
  const isClient = fromRel.startsWith('client/');
  const isServer = fromRel.startsWith('server/');
  const isDomain = fromRel.startsWith('domain/');

  for (const imp of m.imports) {
    if (!imp.resolved || !fileMetrics.has(imp.resolved)) continue;
    const toRel = fileMetrics.get(imp.resolved).relPath;
    const toClient = toRel.startsWith('client/');
    const toServer = toRel.startsWith('server/');
    const toDomain = toRel.startsWith('domain/');

    // 1. Client importing Server
    if (isClient && toServer) {
      clientImportsServer.push({ from: fromRel, to: toRel, line: imp.line });
    }

    // 2. Domain importing Client
    if (isDomain && toClient) {
      domainImportsClient.push({ from: fromRel, to: toRel, line: imp.line });
    }

    // 3. Domain importing Server
    if (isDomain && toServer) {
      domainImportsServer.push({ from: fromRel, to: toRel, line: imp.line });
    }
  }
}

console.log(`\n1. Client importing Server: ${clientImportsServer.length}`);
clientImportsServer.forEach(v => console.log(`   [VIOLATION] ${v.from}:${v.line} -> ${v.to}`));

console.log(`\n2. Domain importing Client: ${domainImportsClient.length}`);
domainImportsClient.forEach(v => console.log(`   [VIOLATION] ${v.from}:${v.line} -> ${v.to}`));

console.log(`\n3. Domain importing Server: ${domainImportsServer.length}`);
domainImportsServer.forEach(v => console.log(`   [VIOLATION] ${v.from}:${v.line} -> ${v.to}`));

// Directory breakdown
console.log('\n=== DIRECTORY LOC & FILE DISTRIBUTION ===');
const dirStats = new Map();
for (const m of fileMetrics.values()) {
  const topDir = m.relPath.split('/')[0];
  const secondDir = m.relPath.split('/').length > 2 ? m.relPath.split('/').slice(0, 2).join('/') : topDir;
  
  if (!dirStats.has(secondDir)) {
    dirStats.set(secondDir, { files: 0, loc: 0 });
  }
  const s = dirStats.get(secondDir);
  s.files++;
  s.loc += m.loc;
}

const sortedDirs = [...dirStats.entries()].sort((a,b) => b[1].loc - a[1].loc);
sortedDirs.forEach(([dir, stat]) => {
  console.log(`- ${dir.padEnd(25)} : ${stat.files.toString().padStart(3)} files, ${stat.loc.toString().padStart(6)} LOC (avg ${Math.round(stat.loc/stat.files)} LOC/file)`);
});

// Files near LOC ceiling
console.log('\n=== TOP 10 LARGEST FILES IN SRC/ ===');
const sortedByLoc = [...fileMetrics.values()].sort((a,b) => b.loc - a.loc);
sortedByLoc.slice(0, 10).forEach(m => {
  console.log(`- [${m.relPath}]: ${m.loc} LOC (Fan-in: ${m.fanIn.size}, Fan-out: ${m.fanOut.size})`);
});
