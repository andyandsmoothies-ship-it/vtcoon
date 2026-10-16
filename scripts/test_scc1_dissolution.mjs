import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

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

function normalizeRelPath(p) {
  return p.replace(/\\/g, '/');
}

function resolveImport(sourceFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  const dir = path.dirname(sourceFile);
  let target = path.resolve(dir, specifier);
  if (target.endsWith('.js') || target.endsWith('.jsx')) {
    target = target.replace(/\.jsx?$/, '');
  }
  const extensions = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
  for (const ext of extensions) {
    const candidate = target + ext;
    if (fs.existsSync(candidate)) return candidate;
  }
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  return null;
}

const repoRoot = process.cwd();
const files = getAllSourceFiles(path.join(repoRoot, 'src'));

// Simulated edge overrides
const simulatedRemovals = [
  // lobby_store -> offline_landing (replaced by room_config_helpers)
  { from: 'src/client/store/lobby_store.ts', to: 'src/client/offline_landing.ts' },
  // property_market_badge_handler -> apply_delta
  { from: 'src/client/events/subscribers/property_market_badge_handler.ts', to: 'src/client/network/apply_delta.ts' },
  // client_session_purger -> bot_trade_offer_strip
  { from: 'src/client/network/client_session_purger.ts', to: 'src/client/ui/modals/bot_trade_offer_strip.tsx' },
  // activity_tracker -> lobby_store
  { from: 'src/client/network/activity_tracker.ts', to: 'src/client/store/lobby_store.ts' },
  // property_market_badge_handler -> lobby_store
  { from: 'src/client/events/subscribers/property_market_badge_handler.ts', to: 'src/client/store/lobby_store.ts' },
  // subscribers -> game_event_bus
  { from: 'src/client/events/subscribers/audio_event_subscriber.ts', to: 'src/client/events/game_event_bus.ts' },
  { from: 'src/client/events/subscribers/badge_event_subscriber.ts', to: 'src/client/events/game_event_bus.ts' },
  { from: 'src/client/events/subscribers/activity_log_subscriber.ts', to: 'src/client/events/game_event_bus.ts' },
  { from: 'src/client/events/subscribers/property_market_badge_handler.ts', to: 'src/client/events/game_event_bus.ts' },
  { from: 'src/client/events/subscribers/badge_financial_helpers.ts', to: 'src/client/events/game_event_bus.ts' },
  { from: 'src/client/events/subscribers/activity_log_financial_formatter.ts', to: 'src/client/events/game_event_bus.ts' }
];

const adj = new Map();
const fileSet = new Set(files.map(f => path.resolve(f)));

for (const file of files) {
  const full = path.resolve(file);
  adj.set(full, new Set());
  const content = fs.readFileSync(full, 'utf8');
  const sf = ts.createSourceFile(full, content, ts.ScriptTarget.Latest, true);

  ts.forEachChild(sf, function visit(node) {
    let spec = null;
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      spec = node.moduleSpecifier.text;
    }
    if (spec) {
      const res = resolveImport(full, spec);
      if (res && fileSet.has(res) && res !== full) {
        const fromRel = normalizeRelPath(path.relative(repoRoot, full));
        const toRel = normalizeRelPath(path.relative(repoRoot, res));
        const isRemoved = simulatedRemovals.some(r => r.from === fromRel && r.to === toRel);
        if (!isRemoved) {
          adj.get(full).add(res);
        }
      }
    }
    ts.forEachChild(node, visit);
  });
}

// Tarjan
let index = 0;
const indices = new Map();
const lowlink = new Map();
const onStack = new Set();
const stack = [];
const sccs = [];

function strongConnect(u) {
  indices.set(u, index);
  lowlink.set(u, index);
  index++;
  stack.push(u);
  onStack.add(u);

  const neighbors = adj.get(u) || new Set();
  for (const v of neighbors) {
    if (!indices.has(v)) {
      strongConnect(v);
      lowlink.set(u, Math.min(lowlink.get(u), lowlink.get(v)));
    } else if (onStack.has(v)) {
      lowlink.set(u, Math.min(lowlink.get(u), indices.get(v)));
    }
  }

  if (lowlink.get(u) === indices.get(u)) {
    const scc = [];
    let w = null;
    do {
      w = stack.pop();
      onStack.delete(w);
      scc.push(w);
    } while (w !== u);

    if (scc.length > 1) {
      sccs.push(scc.map(f => normalizeRelPath(path.relative(repoRoot, f))));
    }
  }
}

for (const f of files) {
  const full = path.resolve(f);
  if (!indices.has(full)) {
    strongConnect(full);
  }
}

console.log(`Simulated cycles count: ${sccs.length}`);
sccs.forEach((c, i) => {
  console.log(`[SCC-${i + 1}] (${c.length} files):`);
  c.forEach(f => console.log(`  -> ${f}`));
});
