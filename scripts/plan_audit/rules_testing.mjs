import fs from 'node:fs';
import path from 'node:path';
import { auditDualBoundSpatialAssertions } from './rules_spatial_bounds.mjs';

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
  {
    regex: /chỉ\s+kiểm\s+tra\s+(?:toBeDefined|tồn\s+tại)|solitary\s+toBeDefined|chỉ\s+assert\s+được\s+gọi\s+mà\s+không\s+kiểm\s+tra\s+kết\s+quả/i,
    code: 'SPECGUARD_SUPERFICIAL_CHECK',
    desc: 'SpecGuard Invariant (arXiv:2610.16870): Solitary existence or change detection checks without behavioral value assertions are banned.',
  },
  {
    regex: /kiểm\s+tra\s+biến\s+(?:nội\s+bộ|private|tạm)|assert\s+internal\s+state\s+variable|assert\s+private\s+property/i,
    code: 'SPECGUARD_OVERFITTING_INTERNAL_STATE',
    desc: 'SpecGuard Invariant (arXiv:2610.16870): Asserting private/internal state variables creates reference-implementation overfitting. Assert observable contracts instead.',
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

  if (testLines.length >= 2 && testLines.length <= 6) {
    console.log(`  ✔️ Lean Contract Invariants mode (${testLines.length} core invariant specs): Full 100% function-to-test expansion (${declaredFunctions.size} exported functions) delegated to Station 2 qa-tester.`);
    return 0;
  }

  for (const fnName of declaredFunctions) {
    const fnRegex = new RegExp(`\\b${fnName}\\b`);
    if (!fnRegex.test(allTestText)) {
      console.error(`  ❌ [FUNCTION_TEST_PARITY_VIOLATION] Exported function '${fnName}' declared in production scope has NO test case in Station 1!`);
      console.error(`     Either use Lean Contract Invariants (2-6 core specs) or cover every exported function.`);
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

export function auditDefinitionOfDone(planContent) {
  let errors = 0;
  const hasDoD = /(?:Definition of Done|DoD|Tiêu chí hoàn thành|Stopping Criteria|Biên giới dừng|Tiêu chí nghiệm thu)/i.test(planContent);
  if (!hasDoD) {
    console.error(`  ❌ [MISSING_DEFINITION_OF_DONE] Plan lacks explicit 'Definition of Done (DoD)' or 'Stopping Criteria' section!`);
    console.error(`     arXiv:2609.20804 & GEMINI.md mandate an explicit stopping boundary to prevent redundant verification churn.`);
    errors++;
  } else {
    console.log(`  ✔️ Definition of Done (DoD) verified: Plan specifies explicit stopping boundary.`);
  }
  return errors;
}

export function auditWiringParityInPlan(targetFiles, planContent) {
  let errors = 0;
  const targetList = Array.from(targetFiles.keys());
  const helperFiles = targetList.filter((f) => /_(?:helpers|detect|math|calc)\.[a-z]+$/i.test(f));
  const consumerFiles = targetList.filter((f) => /\.(?:tsx|ts)$/i.test(f) && !/_(?:helpers|detect|math|calc)\.[a-z]+$/i.test(f) && !/types?\.[a-z]+$/i.test(f) && !f.includes('test'));
  const hasInlineExportedHelpers = /export\s+function\s+(?:calculate|resolve|should|is|format|get)[A-Za-z0-9_]+/i.test(planContent);
  const uiConsumerFiles = consumerFiles.filter((f) => /\.(?:tsx|jsx)$/i.test(f));

  if ((helperFiles.length > 0 && consumerFiles.length > 0) || (hasInlineExportedHelpers && uiConsumerFiles.length > 0)) {
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

    const activeConsumers = helperFiles.length > 0 ? consumerFiles : uiConsumerFiles;
    const hasWiringTest = activeConsumers.some((cf) => {
      const baseName = path.basename(cf, path.extname(cf));
      const compName = baseName.split('_').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
      return new RegExp(`(?:${baseName}|${compName}|wiring|call-site|callsite|mount|integration)`, 'i').test(allTestText);
    });

    if (!hasWiringTest) {
      console.error(`  ❌ [WIRING_PARITY_VIOLATION] Plan introduces/modifies helper functions alongside UI components (${activeConsumers.map((f) => path.basename(f)).join(', ')}), but Station 1 test specifications lack integration/wiring tests asserting consumer call-site execution!`);
      console.error(`     GEMINI.md mandates at least one contract test verifying physical integration/wiring with consumer components.`);
      errors++;
    } else {
      console.log(`  ✔️ Wiring Parity verified: Station 1 contains integration/wiring test specs for consumer call-sites.`);
    }
  }
  return errors;
}

export function auditCompositeTransactionAndSemanticBorrowing(targetFiles, planContent) {
  let errors = 0;
  const targetList = Array.from(targetFiles.keys());
  const isFinancialPlan = targetList.some((f) =>
    /(?:game_event_financial|balance|treasury|economy|salary|\brent\b|bond|buyout)/i.test(f)
  );

  if (isFinancialPlan) {
    // 1. Composite Transaction Testing Invariant (GEMINI.md)
    const hasCompositeTest = /(?:composite|đa dòng tiền|hỗn hợp|đồng thời|inflow.*outflow|salary.*bond|bond.*salary|rent.*bond)/i.test(planContent);
    if (!hasCompositeTest) {
      console.error(`  ❌ [COMPOSITE_TRANSACTION_TEST_MISSING] Plan modifies financial/balance event processors, but Station 1 test specifications omit Composite Cashflow integration tests!`);
      console.error(`     GEMINI.md Composite Transaction Testing Invariant mandates testing simultaneous bidirectional cashflows (e.g. GO Salary + Debt Repayment) to prevent Netting Collision.`);
      errors++;
    } else {
      console.log(`  ✔️ Composite Transaction Testing verified: Station 1 tests simultaneous bidirectional cashflows.`);
    }

    // 2. Zero Semantic Borrowing Invariant (GEMINI.md)
    const hasSemanticBorrowing = /actionType:\s*['"](?:unmortgage|mortgage)['"].*?bond|actionType:\s*['"]tax['"].*?bond/i.test(planContent) ||
      /mượn\s+tạm\s+type|ép\s+kiểu\s+tiện\s+tay/i.test(planContent);
    if (hasSemanticBorrowing) {
      console.error(`  ❌ [SEMANTIC_BORROWING_VIOLATION] Plan borrows existing actionType ('unmortgage'/'mortgage'/'tax') for bond transactions!`);
      console.error(`     GEMINI.md Zero Semantic Borrowing Invariant mandates introducing canonical first-class types ('bond') in ActivityLogType and FloatingActionType.`);
      errors++;
    } else {
      console.log(`  ✔️ Zero Semantic Borrowing verified: Canonical first-class types are utilized.`);
    }
  }

  return errors;
}

/**
 * Audits test file paths referenced in the plan.
 * Catches ghost test paths (referenced regression or contract test suites that do not physically exist on disk).
 * Exempts the current ticket's newly declared test suite.
 */
export function auditGhostTestPaths(planContent, repoRoot = process.cwd(), planFilename = '') {
  let errors = 0;
  const ticketMatch = planFilename.match(/IMP[_-]?(\d+[a-zA-Z]?)/i) || planContent.match(/IMP[_-]?(\d+[a-zA-Z]?)/i);
  const ticketNum = ticketMatch ? ticketMatch[1].toLowerCase().replace(/[-_]/g, '') : null;

  const testRegex = /(?:tests|test)\/[a-zA-Z0-9_\-\.\/]+\.(?:test|spec)\.(?:ts|tsx|js|mjs)/g;
  const matches = [...new Set(planContent.match(testRegex) || [])];

  for (const testPath of matches) {
    const absPath = path.resolve(repoRoot, testPath);
    if (fs.existsSync(absPath)) continue;

    const base = path.basename(testPath).toLowerCase().replace(/[-_]/g, '');
    const isCurrentTicketTest = ticketNum && (base.includes('imp' + ticketNum) || base.includes(ticketNum));

    const idx = planContent.indexOf(testPath);
    const contextWindow = planContent.substring(Math.max(0, idx - 80), Math.min(planContent.length, idx + testPath.length + 80));
    const isDeclaredNew = /new|mới|create|tạo\s+mới|scaffold/i.test(contextWindow);

    if (isCurrentTicketTest || isDeclaredNew) {
      console.log(`  ✔️ ${testPath} (Target test suite to be created/authored in Station 1/2)`);
    } else {
      console.error(`  ❌ [GHOST_TEST_PATH] Plan references non-existent test file: ${testPath}`);
      console.error(`     Referenced regression/contract tests must physically exist on disk, or be explicitly declared as a new test file.`);
      errors++;
    }
  }

  return errors;
}

/**
 * SpecGuard Invariant Audit (arXiv:2610.16870)
 * Verifies that the plan's contract test specifications include at least one Negative/Violation
 * flow (alternative flow /A#, error handling, input validation, or illegal state rejection)
 * to prevent zero-rejection validation harnesses.
 */
export function auditSpecGuardInvariants(testLines, planContent) {
  let errors = 0;
  if (!testLines || testLines.length < 3) return errors;

  const allTestText = testLines.join('\n');
  const hasNegativeFlow = /\[UC-[A-Z0-9._-]+\/A\d+\]/i.test(allTestText) ||
    /(?:reject|throw|invalid|error|từ chối|báo lỗi|bất hợp lệ|out of bounds|boundary|chặn|defense|negative)/i.test(allTestText);

  if (!hasNegativeFlow) {
    console.error(`  ❌ [SPECGUARD_MISSING_NEGATIVE_ORACLE] SpecGuard Invariant (arXiv:2610.16870) Violation:`);
    console.error(`     Plan specifies ${testLines.length} contract tests, but ALL are happy-path (MSS) without a single Negative/Violation test case!`);
    console.error(`     Add at least one [UC-*/A1] or error/rejection contract test to ensure the validation harness actively detects violating implementations.`);
    errors++;
  } else {
    console.log(`  ✔️ SpecGuard Negative Oracle verified: Plan includes mandatory Negative/Violation test contracts.`);
  }

  return errors;
}

export { auditDualBoundSpatialAssertions };


