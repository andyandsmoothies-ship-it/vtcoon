import fs from 'node:fs';
import path from 'node:path';

/**
 * scripts/plan_audit/rules_testing.mjs
 * Testing contract rules, banned test patterns, and test specification validators for implementation plans.
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
