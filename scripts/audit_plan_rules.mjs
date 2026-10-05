import fs from 'node:fs';
import path from 'node:path';

/**
 * Rules and Validators for Mechanical Plan Audits.
 * Extracted to enforce SRP and maintain strict Tier 1 LOC budgets (< 400 lines per file).
 */

export const BANNED_TEST_RULES = [
  {
    regex: /zero\s+gc\s+churn|cấp\s+phát\s+object\s+rác|garbage\s+collection\s+churn|zero\s+gc\s+allocation/i,
    code: 'UNIMPLEMENTABLE_GC_TEST',
    desc: 'GC allocation / memory churn assertions cannot be deterministically verified in Vitest headless Node.',
  },
  {
    regex: /measureUserAgentSpecificMemory/i,
    code: 'UNIMPLEMENTABLE_MEMORY_API',
    desc: 'measureUserAgentSpecificMemory() is browser-specific and not supported in Node.js headless testing.',
  },
  {
    regex: /frame\s*rate\s*benchmark|fps\s*benchmark|render\s*time\s*benchmark/i,
    code: 'UNIMPLEMENTABLE_PERF_BENCHMARK',
    desc: 'FPS / frame rate benchmarks are non-deterministic in headless test environments.',
  },
  {
    regex: /typeof\s+[\w.]+\s*===?\s*['"]function['"]/i,
    code: 'BANNED_STATIC_CHECKLIST_TYPEOF',
    desc: 'asserting typeof fn === "function" is a banned static checklist test. Assert observable behavior instead.',
  },
  {
    regex: /fs\.(existsSync|readFileSync)\s*(?:trong|inside)\s*(?:test|vitest|suite)/i,
    code: 'BANNED_FS_CHECKLIST_TEST',
    desc: 'Testing file existence or content inside Vitest it() suites is a banned static checklist pattern.',
  },
  {
    regex: /toContain\(['"][^'"]*(?:top-\d+|bottom-\d+|left-\d+|right-\d+|translate-[xy]|md:left-|md:right-)[^'"]*['"]\)\s*(?:để\s+chứng\s+minh|chứng\s+minh\s+không\s+va\s+chạm|prove\s+no\s+overlap|không\s+đè|không\s+che)/i,
    code: 'BANNED_STATIC_CSS_COLLISION_TEST',
    desc: 'Asserting CSS class strings as proof of non-collision is a banned static checklist test. Assert bounding box intervals or visual evidence instead.',
  },
  {
    regex: /typeof\s+[\w.]+\s*===?\s*['"]function['"]|kiểm\s+tra\s+module\s+(?:xuất|không\s+xuất)\s+đúng\s+hàm/i,
    code: 'BANNED_STATIC_MODULE_SHAPE_TEST',
    desc: 'Testing module shape or export typeof is a banned static checklist test. Assert behavioral contract instead.',
  },
  {
    regex: /so\s+sánh\s+với\s+chính\s+nó|same\s+binding\s+tautology/i,
    code: 'BANNED_TAUTOLOGICAL_TEST',
    desc: 'Asserting identical bindings or tautological equivalence is banned. Assert against SSOT specifications.',
  },
  {
    regex: /chạy\s+xanh\s+\d+\/\d+|pass\s+\d+\/\d+\s+tests?|vitest\s+run\s+tests\/.*===?\s*0|all\s+\d+\s+tests?\s+pass/i,
    code: 'BANNED_META_TEST_CHECK',
    desc: 'Testing whether other tests pass or asserting test suite execution counts is a banned meta test pattern. Assert physical observable contracts instead.',
  },
];

export function auditScopeAndSubsystems(targetFiles) {
  let errors = 0;
  const prodTargets = Array.from(targetFiles.keys()).filter((f) => /^(?:src|lib|app)[\\/]/.test(f));
  if (prodTargets.length > 3) {
    console.error(`  ❌ [MEGA_PLAN_SCOPE_TOO_WIDE] Plan targets ${prodTargets.length} production source files in 'src/' (> 3 files max allowed)!`);
    console.error(`     Files: ${prodTargets.join(', ')}`);
    console.error(`     Auto-Slicing Protocol mandates thin vertical slices (max 2-3 production files per ticket) to prevent cognitive overload.`);
    errors++;
  } else {
    console.log(`  ✔️ Scope confinement: ${prodTargets.length} production source files (<= 3 files max).`);
  }

  const detectedSubsystems = new Set();
  for (const relPath of targetFiles.keys()) {
    const norm = relPath.replace(/\\/g, '/');
    if (norm.startsWith('scripts/')) detectedSubsystems.add('tooling-scripts');
    else if (norm.startsWith('src/client/3d/')) detectedSubsystems.add('client-3d');
    else if (norm.startsWith('src/client/ui/')) detectedSubsystems.add('client-ui');
    else if (norm.startsWith('src/client/store/') || norm.startsWith('src/client/network/') || norm.startsWith('src/client/hooks/') || norm === 'src/client/main.tsx' || norm === 'src/client/game_canvas.tsx') detectedSubsystems.add('client-state');
    else if (norm.startsWith('src/client/types/')) detectedSubsystems.add('client-types');
    else if (norm.startsWith('src/domain/')) detectedSubsystems.add('domain-core');
    else if (norm.startsWith('src/server/')) detectedSubsystems.add('server-network');
  }

  if (detectedSubsystems.has('tooling-scripts') && detectedSubsystems.size > 1) {
    console.error(`  ❌ [CROSS_SUBSYSTEM_CONTAMINATION] Plan bundles 'scripts/' tooling with production source files!`);
    console.error(`     Detected subsystems: ${Array.from(detectedSubsystems).join(', ')}`);
    console.error(`     Tooling and CI scripts must be isolated into dedicated tooling tickets.`);
    errors++;
  }

  if (detectedSubsystems.has('client-3d')) {
    const conflicting = ['client-state', 'domain-core', 'server-network', 'client-types'];
    const conflicts = conflicting.filter((s) => detectedSubsystems.has(s));
    if (conflicts.length > 0) {
      console.error(`  ❌ [CROSS_SUBSYSTEM_CONTAMINATION] Plan bundles 'client-3d' graphics with ${conflicts.join(', ')}!`);
      console.error(`     3D visual components must not be bundled with state, server, or global types. Split into micro-slices.`);
      errors++;
    }
  }

  if (detectedSubsystems.has('client-ui')) {
    const conflicting = ['domain-core', 'server-network'];
    const conflicts = conflicting.filter((s) => detectedSubsystems.has(s));
    if (conflicts.length > 0) {
      console.error(`  ❌ [CROSS_SUBSYSTEM_CONTAMINATION] Plan bundles 'client-ui' with ${conflicts.join(', ')}!`);
      console.error(`     2D UI components must not be bundled with domain/server FSM. Split into micro-slices.`);
      errors++;
    }
  }

  if (errors === 0 || (!detectedSubsystems.has('tooling-scripts') && !detectedSubsystems.has('client-3d'))) {
    console.log(`  ✔️ Subsystem boundaries respected: ${Array.from(detectedSubsystems).join(', ') || 'tests only'}`);
  }

  return errors;
}

export function auditHonestLocAccounting(targetFiles, planContent) {
  let errors = 0;
  const locTableRowRegex = /\|\s*`?([^\n|`']+\.[a-zA-Z0-9]+)`?\s*\|\s*([^|]+)\|\s*(\d+)[^|]*\|\s*(\d+)[^|]*\|\s*[^|]+\|\s*[^|]+\|\s*([^|]+)\|/g;
  let locRowMatch;
  while ((locRowMatch = locTableRowRegex.exec(planContent)) !== null) {
    const filePath = locRowMatch[1].trim();
    const tier = locRowMatch[2].trim();
    const expectedLOC = parseInt(locRowMatch[4].trim(), 10);
    const status = locRowMatch[5].trim();

    if (tier.includes('Tier 1') && expectedLOC >= 300) {
      if (/safe/i.test(status) && !/warning/i.test(status)) {
        console.error(`  ❌ [HONEST_LOC_ACCOUNTING_VIOLATION] File '${filePath}' has ${expectedLOC} expected lines (>= 300 Tier 1) but is marked '${status}' instead of Warning!`);
        console.error(`     Tier 1 files >= 300 LOC MUST be marked 'Warning' and register a Tech Debt item.`);
        errors++;
      }
    }
    if (tier.includes('Tier 2') && expectedLOC >= 400) {
      if (/safe/i.test(status) && !/warning/i.test(status)) {
        console.error(`  ❌ [HONEST_LOC_ACCOUNTING_VIOLATION] File '${filePath}' has ${expectedLOC} expected lines (>= 400 Tier 2) but is marked '${status}' instead of Warning!`);
        console.error(`     Tier 2 files >= 400 LOC MUST be marked 'Warning' and register a Tech Debt item.`);
        errors++;
      }
    }
  }

  for (const [relPath] of targetFiles.entries()) {
    const norm = relPath.replace(/\\/g, '/');
    const absPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(absPath)) continue;
    const lines = fs.readFileSync(absPath, 'utf8').split('\n').filter((l) => l.length > 0).length;

    const isTier1 = /^(?:src\/(?:domain|server)|src\/client\/(?:store|network|perf_budget))/i.test(norm);
    if (isTier1 && lines >= 300) {
      const escapedRel = relPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const safeRegex = new RegExp(`${escapedRel}[^\\n|]*\\|[^\\n|]*\\|[^\\n|]*\\|[^\\n|]*\\|[^\\n|]*\\|[^\\n|]*\\|[^\\n|]*\\b(?:safe|an toàn)\\b`, 'i');
      if (safeRegex.test(planContent)) {
        console.error(`  ❌ [HONEST_LOC_ACCOUNTING_VIOLATION] Target file '${relPath}' has ${lines} physical lines (>= 300 Tier 1) but plan marks it as Safe!`);
        errors++;
      }
    }
  }

  return errors;
}
