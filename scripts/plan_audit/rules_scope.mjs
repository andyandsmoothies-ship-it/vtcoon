import fs from 'node:fs';
import path from 'node:path';

/**
 * scripts/plan_audit/rules_scope.mjs
 * Scope confinement, LOC accounting, subsystem boundaries, and cohesion rules for implementation plans.
 */

export function auditScopeAndSubsystems(targetFiles) {
  let errors = 0;
  const prodTargets = Array.from(targetFiles.keys()).filter((f) => /^(?:src|lib|app)[\\/]/.test(f));
  
  // Group cohesive subcomponents/files sharing directory and common prefix stem
  const cohesiveFamilies = new Set();
  for (const f of prodTargets) {
    const dir = path.dirname(f).replace(/\\/g, '/');
    const base = path.basename(f, path.extname(f)).split('_')[0];
    cohesiveFamilies.add(`${dir}/${base}`);
  }

  if (cohesiveFamilies.size > 3) {
    console.error(`  ❌ [MEGA_PLAN_SCOPE_TOO_WIDE] Plan targets ${cohesiveFamilies.size} independent component families / ${prodTargets.length} files in 'src/' (> 3 units max allowed)!`);
    console.error(`     Files: ${prodTargets.join(', ')}`);
    console.error(`     Auto-Slicing Protocol mandates thin vertical slices (max 2-3 logical units per ticket) to prevent cognitive overload.`);
    errors++;
  } else {
    console.log(`  ✔️ Scope confinement: ${prodTargets.length} production file(s) across ${cohesiveFamilies.size} cohesive unit(s) (<= 3 units max).`);
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

export function auditHonestLocAccounting(targetFiles, planContent, snippetDeltaByFile = new Map()) {
  let errors = 0;
  const locTableRowRegex = /\|\s*`?([^\n|`']+\.[a-zA-Z0-9]+)`?\s*\|\s*([^|]+)\|\s*(\d+)[^|]*\|\s*(\d+)[^|]*\|\s*[^|]+\|\s*[^|]+\|\s*([^|]+)\|/g;
  let locRowMatch;
  while ((locRowMatch = locTableRowRegex.exec(planContent)) !== null) {
    const filePath = locRowMatch[1].trim();
    const tier = locRowMatch[2].trim();
    const expectedLOC = parseInt(locRowMatch[4].trim(), 10);
    const status = locRowMatch[5].trim();

    const absPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(absPath)) {
      const rawLines = fs.readFileSync(absPath, 'utf8').split('\n');
      if (rawLines.length > 0 && rawLines[rawLines.length - 1] === '') rawLines.pop();
      const diskLines = rawLines.length;
      const snippetDelta = snippetDeltaByFile.get(filePath) ?? snippetDeltaByFile.get(filePath.replace(/\\/g, '/')) ?? 0;
      const computedExpected = diskLines + snippetDelta;
      if (Math.abs(computedExpected - expectedLOC) > 1) {
        console.error(`  ❌ [LOC_ACCOUNTING_FRAUD] File '${filePath}' claims expected LOC of ${expectedLOC}, but physical lines (${diskLines}) + snippet delta (${snippetDelta >= 0 ? '+' : ''}${snippetDelta}) = ${computedExpected} lines (mismatch of ${Math.abs(computedExpected - expectedLOC)} lines)!`);
        console.error(`     Plan Table 2 must reflect physical disk reality plus verbatim snippet deltas.`);
        errors++;
      }
    }

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

export function auditScopeConservation(planContent) {
  let errors = 0;
  if (!planContent) return errors;

  const lines = planContent.split('\n');
  let inCodeBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Check if line drops/waives scope without formal deferral ticket
    if (/\b(?:WAIVE|HOÃN|DEFER|tách riêng|không sửa trong ticket này)\b/i.test(line)) {
      // Exclude pure documentation of pureLogicWaiver setting in Station 3 table
      if (/pure\s*logic\s*waiver\s*(?:documented|cho phép|áp dụng|:\s*true)/i.test(line) && !/(?:\.(?:ts|tsx|js|jsx)|3D|aura|nhãn|ticker)/i.test(line)) {
        continue;
      }
      // Check if ticket ID is present on current line or immediate adjacent lines (e.g. intro line before list item)
      const adjacentContext = [line, lines[i - 1] || '', lines[i + 1] || ''].join(' ');
      const hasFormalTicket = /\[DEFERRED TO TICKET-[A-Z0-9_.-]+(?::\s*[^\]]+)?\]/i.test(adjacentContext) ||
                              /\bTICKET-[A-Z0-9_.-]+\b/i.test(adjacentContext);
      if (!hasFormalTicket) {
        console.error(`  ❌ [ILLEGAL_SCOPE_DROP] Line ${i + 1} drops/waives scope without formal deferral ticket:`);
        console.error(`     "${line.trim()}"`);
        console.error(`     Scope Conservation Mandate requires: [DEFERRED TO TICKET-XXX: <Reason>] for any postponed surface.`);
        errors++;
      }
    }
  }
  return errors;
}

export function auditPureLogicWaiver(targetFiles, planContent) {
  let errors = 0;
  if (/pure\s*logic\s*waiver\s*:\s*true/i.test(planContent)) {
    const clientTargets = Array.from(targetFiles.keys()).filter((f) => /^(?:src\/client|src\\client)/i.test(f));
    if (clientTargets.length > 0) {
      console.error(`  ❌ [ILLEGAL_PURE_LOGIC_WAIVER] Plan specifies pureLogicWaiver: true but targets client/UI files:`);
      console.error(`     ${clientTargets.join(', ')}`);
      console.error(`     Pure Logic Waiver is strictly reserved for pure logic/types/DTO files without DOM/client footprint.`);
      errors++;
    }
  }
  return errors;
}

/**
 * Checks for newly created .tsx files when cohesive domain helpers/visuals already exist in the directory.
 */
export function auditCohesionOrphanFiles(targetFiles) {
  let errors = 0;
  for (const [filePath, isNew] of targetFiles.entries()) {
    if (!isNew || !filePath.endsWith('.tsx')) continue;

    const dir = path.dirname(path.resolve(process.cwd(), filePath));
    if (!fs.existsSync(dir)) continue;

    const baseName = path.basename(filePath, '.tsx');
    const prefixMatch = baseName.match(/^([a-z0-9]+_[a-z0-9]+)(?:_[a-z0-9]+)*$/);
    const prefix = prefixMatch ? prefixMatch[1] : baseName;

    const dirEntries = fs.readdirSync(dir);
    const companionFiles = dirEntries.filter((f) => {
      if (f === path.basename(filePath)) return false;
      return (
        f.startsWith(prefix) &&
        (f.endsWith('_visuals.ts') || f.endsWith('_helpers.ts') || f.endsWith('_data.ts') || f.endsWith('_types.ts'))
      );
    });

    if (companionFiles.length > 0) {
      console.warn(`  ⚠️  [COHESION_ORPHAN_FILE_NOTICE] New component file '${filePath}' created while domain companion(s) already exist: [${companionFiles.join(', ')}].`);
      console.warn(`     Ensure pure derivation logic/constants are consolidated into the existing companion file before introducing new UI files.\n`);
    }
  }
  return errors;
}
