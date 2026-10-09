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
  {
    regex: /\b(?:When|Khi)\b[^.\n]*(?:\bvà gọi\b|\bvà kích hoạt\b|\band call\b|\band invoke\b|\bgọi\s+[a-zA-Z0-9_$]+\s+và\s+[a-zA-Z0-9_$]+)/i,
    code: 'NON_ATOMIC_TEST_SPEC',
    desc: 'Test specification bundles multiple action calls in "When" clause. Split into distinct atomic tests (e.g. TC-XXX.YYa and TC-XXX.YYb) to satisfy Atomic Test Mandate.',
  },
];

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

export function auditPlanSnippetHygiene(relPath, targetChunk, replacementChunk, allFileSnippets = []) {
  let errors = 0;
  const cleanTarget = targetChunk.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '');
  const cleanReplacement = replacementChunk.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '');
  if (cleanTarget.length > 0 && cleanTarget === cleanReplacement) {
    console.error(`  ❌ NO-OP SNIPPET in ${relPath}: Replacement chunk contains zero functional changes compared to target chunk!`);
    errors++;
  }

  if (/\.(tsx|jsx|vue|svelte|html)$/.test(relPath)) {
    if (/<\/?(?:div|button|span|p|section|header|footer|template|view|text|h[1-6]|input|form)\b/i.test(replacementChunk)) {
      console.error(`  ❌ [BANNED_UI_DOM_CODE_DUMP_IN_PLAN] in ${relPath}:`);
      console.error(`     Replacement snippet contains raw markup/JSX tags!`);
      console.error(`     Plan Hygiene mandates: UI/View plans must specify Props, Affordance triggers, and Layout rules, NOT raw template diffs.`);
      errors++;
    }
  }

  const refUsageRegex = /\b([a-zA-Z0-9_$]+Ref)\.current\b/g;
  let refMatch;
  const absPath = path.resolve(process.cwd(), relPath);
  const diskContent = fs.existsSync(absPath) ? fs.readFileSync(absPath, 'utf8') : '';
  while ((refMatch = refUsageRegex.exec(replacementChunk)) !== null) {
    const refName = refMatch[1];
    const declaredOnDisk = new RegExp(`\\b(?:const|let|var)\\s+${refName}\\b`).test(diskContent);
    const declaredInSnippets = allFileSnippets.some((snip) =>
      new RegExp(`\\b(?:const|let|var)\\s+${refName}\\b`).test(snip)
    );
    if (!declaredOnDisk && !declaredInSnippets) {
      console.error(`  ❌ [UNDECLARED_REF_IDENTIFIER_IN_PLAN] in ${relPath}: Reference '${refName}.current' is used in snippet but '${refName}' is not declared in disk file or any plan replacement snippet!`);
      errors++;
    }
  }

  const camFnRegex = /export\s+function\s+(calculate[A-Za-z0-9_]*Cam[A-Za-z0-9_]*)\s*\(([^)]*)\)/g;
  let camFnMatch;
  while ((camFnMatch = camFnRegex.exec(replacementChunk)) !== null) {
    const fnName = camFnMatch[1];
    const fnArgs = camFnMatch[2];
    if (!/\baspect\b/i.test(fnArgs)) {
      console.error(`  ❌ [MISSING_RESPONSIVE_ASPECT_RATIO] in ${relPath}: Camera state calculation function '${fnName}' does not accept 'aspect' parameter! Dual-Viewport Parity requires camera functions to accept 'aspect' for Mobile Portrait FOV compensation.`);
      errors++;
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

export function collectExportedSymbols(rootDir = 'src', planContent = '') {
  const symbols = new Set();
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        const code = fs.readFileSync(full, 'utf8');
        const exportRegex = /export\s+(?:async\s+)?(?:function|class|const|let|var|type|interface)\s+([a-zA-Z0-9_$]+)/g;
        let m;
        while ((m = exportRegex.exec(code)) !== null) {
          symbols.add(m[1]);
        }
      }
    }
  }
  walk(rootDir);

  // Also collect symbols declared in plan code blocks
  if (planContent) {
    const exportRegex = /export\s+(?:async\s+)?(?:function|class|const|let|var|type|interface)\s+([a-zA-Z0-9_$]+)/g;
    let m;
    while ((m = exportRegex.exec(planContent)) !== null) {
      symbols.add(m[1]);
    }
    const methodRegex = /(?:public\s+|private\s+|protected\s+)?([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*(?::\s*[^{\n]+)?\s*\{/g;
    while ((m = methodRegex.exec(planContent)) !== null) {
      if (m[1].length > 3) symbols.add(m[1]);
    }
  }
  return symbols;
}

export function auditTestSpecLine(line, exportedSymbols = null) {
  let errors = 0;
  if (!/\[UC-[A-Z0-9._-]+\/(?:MSS|A\d+)\]/i.test(line)) {
    console.error(`  ❌ [DOD1_MISSING_FLOW_TAXONOMY] in test spec:`);
    console.error(`     Line: ${line.trim()}`);
    console.error(`     Reason: DoD #1 mandates explicit flow classifier: [UC-XXX/MSS] or [UC-XXX/A#].`);
    errors++;
  }

  const hasGivenWhenThen = /\bGiven\b[\s\S]*?\bWhen\b[\s\S]*?\bThen\b/i.test(line) ||
                           /\b(?:Tiền điều kiện|Điều kiện)\b[\s\S]*?\b(?:Khi|Thao tác)\b[\s\S]*?\b(?:Thì|Kỳ vọng|Kết quả)\b/i.test(line);
  if (!hasGivenWhenThen) {
    console.error(`  ❌ [DOD1_MISSING_GIVEN_WHEN_THEN] in test spec:`);
    console.error(`     Line: ${line.trim()}`);
    console.error(`     Reason: DoD #1 mandates behavior contract: Given [precondition], When [action], Then [observable outcome].`);
    errors++;
  }

  for (const rule of BANNED_TEST_RULES) {
    if (rule.regex.test(line)) {
      console.error(`  ❌ [${rule.code}] in test spec:`);
      console.error(`     Line: ${line.trim()}`);
      console.error(`     Reason: ${rule.desc}`);
      errors++;
    }
  }

  if (exportedSymbols && exportedSymbols.size > 0) {
    const backtickMatch = line.match(/\b(?:When|Khi)\b[\s\S]*?\b(?:gọi(?:\s+hàm)?|goi(?:\s+ham)?|kích\s+hoạt|kich\s+hoat|calling|invoking)\s+`([a-zA-Z_$][a-zA-Z0-9_$]*)`/i);
    const plainMatch = line.match(/\b(?:When|Khi)\b[\s\S]*?\b(?:gọi(?:\s+hàm)?|goi(?:\s+ham)?|kích\s+hoạt|kich\s+hoat|calling|invoking)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/i);
    const callMatch = backtickMatch || plainMatch;
    if (callMatch) {
      const fnName = callMatch[1];
      const builtins = new Set(['dispatch', 'render', 'fire', 'trigger', 'mount', 'click', 'submit', 'set', 'get', 'fetch', 'getState', 'setState']);
      const vietnameseWords = new Set(['mở', 'nút', 'thao', 'lại', 'chuyển', 'modal', 'hàng', 'thanh', 'giao', 'bước', 'lượt', 'thẻ', 'ô', 'con', 'tiền', 'đến', 'qua', 'vào', 'ra']);
      if (fnName.length >= 3 && !builtins.has(fnName) && !vietnameseWords.has(fnName.toLowerCase()) && !exportedSymbols.has(fnName)) {
        console.error(`  ❌ [HALLUCINATED_FUNCTION_IN_TEST_SPEC] in test spec:`);
        console.error(`     Line: ${line.trim()}`);
        console.error(`     Symbol '${fnName}' does not exist in src/ or plan declarations (total known symbols: ${exportedSymbols.size})!`);
        console.error(`     Physical verification required (e.g. check disk files or git grep) to avoid TS2305/ReferenceError at Station 1.`);
        errors++;
      }
    }
  }

  return errors;
}

export function auditPhysicalVisualMandate(targetFiles, planContent) {
  let errors = 0;
  const isVisualSubsystem = Array.from(targetFiles.keys()).some((f) =>
    /^(?:src\/client\/3d|src\/client\/ui|src\\client\\3d|src\\client\\ui)/i.test(f)
  );
  if (isVisualSubsystem) {
    const hasVisualVerification = /capture:visual|check_evidence/i.test(planContent);
    if (!hasVisualVerification) {
      console.error(`  ❌ [MISSING_PHYSICAL_VISUAL_VERIFICATION] Plan targets 3D/UI subsystems but Station 3 lacks 'capture:visual' or 'check_evidence' verification!`);
      console.error(`     Gotcha #13 / UI Governance mandates physical action evidence before sign-off.`);
      errors++;
    } else {
      console.log(`  ✔️ Physical visual verification registered in plan for 3D/UI scope.`);
    }

    const isCameraOrMotion = Array.from(targetFiles.keys()).some((f) =>
      /camera|chase|kinematics|trajectory|hop/i.test(f)
    ) || /camera|chase|kinematics/i.test(planContent);
    if (isCameraOrMotion) {
      const scenarioMatch = planContent.match(/--scenario\s+([a-zA-Z0-9_]+)/);
      if (!scenarioMatch) {
        console.error(`  ❌ [MISSING_ACTION_SCENARIO_IN_PLAN] Camera/motion plan must specify an in-action scenario via '--scenario <name>' in Station 3!`);
        console.error(`     Gotcha #13 mandates in-action capture (elevation <= 20.0m) to prevent idle overview trap.`);
        errors++;
      } else {
        const scenarioName = scenarioMatch[1];
        const captureScriptPath = path.resolve(process.cwd(), 'scripts/capture_visual_evidence.mjs');
        if (fs.existsSync(captureScriptPath)) {
          const captureContent = fs.readFileSync(captureScriptPath, 'utf8');
          if (!captureContent.includes(`'${scenarioName}'`)) {
            console.error(`  ❌ [UNKNOWN_CAPTURE_SCENARIO] Scenario '${scenarioName}' specified in plan does not exist in 'scripts/capture_visual_evidence.mjs'!`);
            errors++;
          } else {
            console.log(`  ✔️ Verified in-action capture scenario '${scenarioName}' exists in capture runner.`);
          }
        }
      }
    }
  }
  return errors;
}

export function auditStateDependencyScope(targetFiles, planContent) {
  let errors = 0;
  const stateFlagMatches = planContent.match(/\b(hasUserCustomCamera)\b/g);
  if (stateFlagMatches) {
    const hasBranchingSnippet = /(!hasUserCustomCamera|hasUserCustomCamera\s*&&|hasUserCustomCamera\s*\?)/.test(planContent);
    const touchesStore = Array.from(targetFiles.keys()).some((f) => f.includes('src/client/store/'));
    if (hasBranchingSnippet && !touchesStore) {
      console.warn(`  ⚠️  [STATE_MUTATION_BOUNDARY_WARNING] Plan branches on 'hasUserCustomCamera' in presentation code without modifying 'src/client/store/'.`);
      console.warn(`     WARNING: Upstream flows (e.g. triggerDiceRoll in game_store.ts) may unconditionally reset this flag to false.`);
      console.warn(`     Verify that your feature does not become a dead path during dice roll or pawn animation.`);
    }
  }
  return errors;
}

export function auditFunctionToTestParity(targetFiles, planContent) {
  let errors = 0;
  const exportFuncRegex = /export\s+(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*[\(<]/g;
  const declaredFunctions = new Set();
  
  const sections = planContent.split(/(?=#{2,4}\s+Task|\*\*Target physical file\*\*|\*\*Target File\*\*)/i);
  for (const sec of sections) {
    const isProd = /(?:\*\*Target physical file\*\*|\*\*Target File\*\*|Target physical file|Target file):\s*[`']?(?:src|lib|app)[\\/]/i.test(sec);
    if (!isProd) continue;
    
    const codeBlockRegex = /```(?:typescript|tsx|javascript)?\s*\n([\s\S]+?)\n```/g;
    let cbMatch;
    while ((cbMatch = codeBlockRegex.exec(sec)) !== null) {
      const code = cbMatch[1];
      let fnMatch;
      while ((fnMatch = exportFuncRegex.exec(code)) !== null) {
        declaredFunctions.add(fnMatch[1]);
      }
    }
  }

  if (declaredFunctions.size === 0) return errors;

  const testSectionHeaderRegex = /(?:^|\n)#{1,4}\s+[^\n]*?(?:Station 1|QA|KIỂM THỬ|CONTRACT TEST|TEST SPEC)[^\n]*\n([\s\S]*?)(?=\n#{1,2}\s+[^\n]+|\n===\s+|$)/gi;
  let testLines = [];
  let tMatch;
  while ((tMatch = testSectionHeaderRegex.exec(planContent)) !== null) {
    const secLines = tMatch[1].split('\n').filter((l) => /^\s*(?:[-*]|\d+\.)\s*.*?\bTC-[0-9A-Z_.]+/i.test(l));
    testLines.push(...secLines);
  }
  if (testLines.length === 0) {
    testLines = planContent.split('\n').filter((l) => /^\s*(?:[-*]|\d+\.)\s*.*?\bTC-[0-9A-Z_.]+/i.test(l));
  }

  const allTestText = testLines.join('\n');

  for (const fnName of declaredFunctions) {
    const fnRegex = new RegExp(`\\b${fnName}\\b`);
    if (!fnRegex.test(allTestText)) {
      console.error(`  ❌ [FUNCTION_TEST_PARITY_VIOLATION] Exported function '${fnName}' declared in production scope has NO test case in Station 1!`);
      console.error(`     Every exported production function must have at least one explicit contract test in Station 1.`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log(`  ✔️ Function-to-Test Parity verified: All ${declaredFunctions.size} exported production function(s) have dedicated test specs.`);
  }

  return errors;
}

export function auditFsmQueueCombinatorialCoverage(planContent) {
  let errors = 0;
  const touchesQueueFsm = /pendingInsolvencyQueue|multi-debtor|con nợ|insolvency queue/i.test(planContent);
  if (!touchesQueueFsm) return errors;

  // 1. Check for Turn Player Bankruptcy Deadlock test specification
  const hasDeadlockPreventionTest = /(?:deadlock|kẹt\s+lượt|turn\s+player.*bankrupt.*advance|p0.*bankrupt.*advance|UC-DEADLOCK)/i.test(planContent);
  if (!hasDeadlockPreventionTest) {
    console.error(`  ❌ [MISSING_DEADLOCK_PREVENTION_TEST_SPEC] Plan touches multi-debtor queue but lacks test spec for turn player bankruptcy deadlock prevention (P0 bankrupt + P1 solvent -> advance turn)!`);
    console.error(`     Gotcha Pillar I (Item 12) mandates combinatorial test coverage for [B, S] branch.`);
    errors++;
  }

  // 2. Check for Cascade Bankruptcy test specification
  const hasCascadeBankruptcyTest = /(?:cascade|liên\s+hoàn|consecutive.*bankrupt|multi.*bankrupt|UC-CASCADE)/i.test(planContent);
  if (!hasCascadeBankruptcyTest) {
    console.error(`  ❌ [MISSING_CASCADE_BANKRUPTCY_TEST_SPEC] Plan touches multi-debtor queue but lacks test spec for cascade bankruptcy (P1 bankrupt + P2 bankrupt -> game over / advance turn)!`);
    console.error(`     Gotcha Pillar I (Item 12) mandates combinatorial test coverage for [B, B] branch.`);
    errors++;
  }

  if (errors === 0) {
    console.log(`  ✔️ FSM Queue Combinatorial Coverage verified: Plan includes mandatory specs for Deadlock Prevention [B, S] and Cascade Bankruptcy [B, B].`);
  }

  return errors;
}


