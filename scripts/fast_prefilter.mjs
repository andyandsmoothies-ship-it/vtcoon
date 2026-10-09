#!/usr/bin/env node

/**
 * scripts/fast_prefilter.mjs
 * 
 * [STATION 2.5 HARNESS] Unified Mechanical Pre-Filter Sweeper
 * Consolidates all pre-review mechanical checks into a single high-speed execution:
 * 1. TypeScript Strict Typecheck (tsc --noEmit)
 * 2. LOC Budget Verification (scripts/check_loc.mjs)
 * 3. Zero Dirty Casts & Banned Spies Scan (as any, as unknown as, spyOn(React,), console.log)
 * 4. Anti-Slop & Orphan Production Files (scripts/lint_slop.mjs)
 * 5. 2D UI Impeccable Craft Linter (scripts/lint_ui.mjs)
 * 6. i18n Rejection Reason Parity (scripts/check_reason_i18n_parity.mjs)
 * 
 * Usage:
 *   node scripts/fast_prefilter.mjs [target_files...]
 *   npm run prefilter -- [target_files...]
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const targetFiles = process.argv.slice(2).filter((f) => !f.startsWith('--'));

console.log('======================================================');
console.log('🚀 [STATION 2.5] FAST PRE-FILTER MECHANICAL SWEEP');
console.log('======================================================\n');

let totalErrors = 0;

function runStep(title, fn) {
  process.stdout.write(`⏳ Checking ${title}... `);
  try {
    const result = fn();
    console.log('✔️ PASS');
    return result;
  } catch (err) {
    console.log('❌ FAIL');
    const detailedOutput = (err.stdout ? String(err.stdout) : '') + (err.stderr ? String(err.stderr) : '');
    console.error(`\n[ERROR in ${title}]:\n${detailedOutput.trim() || err.message || err}\n`);
    totalErrors++;
    return null;
  }
}

// 1. TypeScript Strict Compilation
runStep('1. Typecheck (tsc --noEmit)', () => {
  execSync('npx --yes tsc --noEmit', { stdio: 'pipe', encoding: 'utf8' });
});

// 2. LOC Budgets for Target Files
if (targetFiles.length > 0) {
  runStep('2. LOC Budgets (check_loc.mjs)', () => {
    const quotedFiles = targetFiles.map((f) => `"${f}"`).join(' ');
    const out = execSync(`node scripts/check_loc.mjs ${quotedFiles}`, { stdio: 'pipe', encoding: 'utf8' });
    if (/❌ HARD ERROR/i.test(out)) {
      throw new Error(out.trim());
    }
  });
} else {
  console.log('ℹ️  2. LOC Budgets: Skipped (no explicit files passed, run on demand)');
}

// 3. Zero Dirty Casts & Banned Spies Scan
runStep('3. Zero Dirty Casts & Banned AST Patterns', () => {
  const filesToScan = targetFiles.length > 0
    ? targetFiles.filter((f) => fs.existsSync(f) && /\.(ts|tsx|js|mjs)$/.test(f) && !f.replace(/\\/g, '/').startsWith('scripts/'))
    : [];

  const violations = [];

  for (const file of filesToScan) {
    const content = fs.readFileSync(path.resolve(repoRoot, file), 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      // Dirty casts: as any, as unknown as
      if (/\bas\s+any\b|\bas\s+unknown\s+as\b/.test(line)) {
        violations.push(`${file}:${lineNum} - Forbidden dirty cast ('as any' or 'as unknown as'): ${line.trim()}`);
      }
      // Banned React internal spy
      if (/spyOn\s*\(\s*React\s*,/i.test(line)) {
        violations.push(`${file}:${lineNum} - Banned framework internal spy ('spyOn(React, ...)'): ${line.trim()}`);
      }
      // Banned framework private internals access (Anti-TIDD)
      if (/__CLIENT_INTERNALS_|__SECRET_|__REACT_DEVTOOLS_|__INTERNAL_/i.test(line)) {
        violations.push(`${file}:${lineNum} - Banned framework private internals access ('${line.trim()}'): Forbidden unstable internal API.`);
      }
      // Stray console.log in production code (allow in tests or scripts)
      if (!file.startsWith('tests') && !file.startsWith('scripts') && /console\.log\s*\(/.test(line)) {
        violations.push(`${file}:${lineNum} - Stray console.log in production source: ${line.trim()}`);
      }
    });

    // React Rules of Hooks (Anti-TIDD Workarounds): Banned hooks in try/catch, conditionals, ternary, short-circuit
    if (!file.startsWith('tests') && !file.startsWith('scripts') && /\.(tsx|jsx|ts|js)$/.test(file)) {
      const hookInTryCatch = /(?:try|catch\s*(?:\([^)]*\))?)\s*\{[^}]*?\b(?:React\.)?use[A-Z]\w*\s*\(/g;
      let match;
      while ((match = hookInTryCatch.exec(content)) !== null) {
        const lineNum = content.slice(0, match.index).split('\n').length;
        violations.push(`${file}:${lineNum} - Banned React Hook in try/catch block (React Rules of Hooks violation)`);
      }
      const hookInConditional = /(?:if|for|while)\s*\([^)]+\)\s*\{[^}]*?\b(?:React\.)?use[A-Z]\w*\s*\(/g;
      while ((match = hookInConditional.exec(content)) !== null) {
        const lineNum = content.slice(0, match.index).split('\n').length;
        violations.push(`${file}:${lineNum} - Banned conditional/loop React Hook (React Rules of Hooks violation)`);
      }
      const hookInTernary = /(?:\?|:)\s*(?:React\.)?use[A-Z]\w*\s*\(/g;
      while ((match = hookInTernary.exec(content)) !== null) {
        const lineNum = content.slice(0, match.index).split('\n').length;
        violations.push(`${file}:${lineNum} - Banned ternary conditional React Hook call (React Rules of Hooks violation)`);
      }
      const hookInShortCircuit = /(?:&&|\|\|)\s*(?:React\.)?use[A-Z]\w*\s*\(/g;
      while ((match = hookInShortCircuit.exec(content)) !== null) {
        const lineNum = content.slice(0, match.index).split('\n').length;
        violations.push(`${file}:${lineNum} - Banned short-circuit conditional React Hook call (React Rules of Hooks violation)`);
      }
      const testMockDetection = /\b['"]mock['"]\s+in\s+(?:React\.)?use[A-Z]\w*/g;
      while ((match = testMockDetection.exec(content)) !== null) {
        const lineNum = content.slice(0, match.index).split('\n').length;
        violations.push(`${file}:${lineNum} - Forbidden test framework mock sniffing in production code (Anti-TIDD violation)`);
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(violations.join('\n'));
  }
});

// 3.5. Test Architecture & Assertion Density Guard (Station 1 / DoD #1)
const testFilesToScan = targetFiles.filter(
  (f) => fs.existsSync(f) && /\.(test|spec)\.(ts|tsx|js|mjs)$/.test(f),
);

if (testFilesToScan.length > 0) {
  runStep('3.5. Test Architecture, Density & Anti-Flaky Guard (Station 1 / DoD #1)', () => {
    const testViolations = [];
    const testRegex = /\b(?:it|test)(?:\.(?:only|skip))?\s*\(\s*(['"`][\s\S]*?['"`])\s*,\s*(?:async\s*)?(?:\([^)]*\)|function\s*\([^)]*\))\s*=>?\s*\{/g;

    for (const file of testFilesToScan) {
      const content = fs.readFileSync(path.resolve(repoRoot, file), 'utf8');
      const isContract = file.includes('contracts');
      let match;
      while ((match = testRegex.exec(content)) !== null) {
        const title = match[1].slice(0, 60).replace(/\r?\n/g, ' ');
        const startIndex = match.index + match[0].length;
        let depth = 1;
        let endIndex = startIndex;
        for (let i = startIndex; i < content.length; i++) {
          if (content[i] === '{') depth++;
          else if (content[i] === '}') {
            depth--;
            if (depth === 0) {
              endIndex = i;
              break;
            }
          }
        }
        const blockBody = content.slice(startIndex, endIndex);
        const expectCount = (blockBody.match(/\bexpect\s*\(/g) || []).length;
        const lineNum = content.slice(0, match.index).split('\n').length;

        if (expectCount > 4) {
          testViolations.push(
            `${file}:${lineNum} - Test case contains ${expectCount} expect() calls (max 4 allowed): ${title}`,
          );
        }
        if (/\bfor\s*\(|\.forEach\s*\(|\bwhile\s*\(|\bdo\s*\{/.test(blockBody)) {
          testViolations.push(
            `${file}:${lineNum} - Test case contains forbidden loop in it() (use it.each instead): ${title}`,
          );
        }
        // Fast & Deterministic Testing Iron Law: Ban unseeded Math.random() in tests
        if (/\bMath\.random\s*\(/.test(blockBody)) {
          testViolations.push(
            `${file}:${lineNum} - Test case contains unseeded Math.random() (violates Fast & Deterministic Testing Iron Law, use seeded PRNG): ${title}`,
          );
        }
        // Anti-Flaky Guard: Ban long blocking sleeps (>= 3000ms) in contract tests
        if (isContract && /(?:sleep|delay|setTimeout)\s*\([^,)]*,\s*(?:[3-9]\d{3}|\d{5,})\)/.test(blockBody)) {
          testViolations.push(
            `${file}:${lineNum} - Test case contains long blocking sleep/delay >= 3000ms (violates Fast & Deterministic): ${title}`,
          );
        }
        // Anti-Tautology Guard: Ban local setTimeout() testing fake timers against itself
        if (/(?:const|let|var)\s+\w+\s*=\s*setTimeout\s*\(/.test(blockBody) &&
            !/(?:render|createRoot|act|useGameStore|use[A-Z]\w*)/.test(blockBody)) {
          testViolations.push(
            `${file}:${lineNum} - Tautological Test Anti-Pattern: Test defines local setTimeout() without mounting a component or invoking a production store/function: ${title}`,
          );
        }
      }

      // Station 4 Mutant Floor Early Warning (< 14 asserts in contract test suite)
      if (isContract) {
        const totalExpects = (content.match(/\bexpect\s*\(/g) || []).length;
        if (totalExpects < 14) {
          console.warn(`\n  ⚠️  [STATION 4 EARLY WARNING] ${file} has only ${totalExpects} expect() assertion(s) (< 14).`);
          console.warn(`     Station 4 Sentinel requires evaluating and killing >= 14 mutants.`);
          console.warn(`     Ensure sufficient boundary assertions (toBe, toEqual, toContain) exist before running sentinel.\n`);
        }
      }
    }

    if (testViolations.length > 0) {
      throw new Error(testViolations.join('\n'));
    }
  });
} else {
  console.log('ℹ️  3.5. Test Assertion Density: Skipped (no test files in target list)');
}

// 4. Anti-Slop Linter (includes Rule 8 zero-test-props and Rule 11 zero-orphan-files)
runStep('4. Anti-Slop Linter (lint_slop.mjs)', () => {
  execSync('node scripts/lint_slop.mjs', { stdio: 'pipe', encoding: 'utf8' });
});

// 5. 2D UI Craft Linter (lint_ui.mjs)
runStep('5. UI Impeccable Linter (lint_ui.mjs)', () => {
  execSync('node scripts/lint_ui.mjs', { stdio: 'pipe', encoding: 'utf8' });
});

// 6. i18n Rejection Reason Parity (check_reason_i18n_parity.mjs)
runStep('6. i18n Rejection Reason Parity', () => {
  execSync('node scripts/check_reason_i18n_parity.mjs', { stdio: 'pipe', encoding: 'utf8' });
});

// 7. SSOT Economic Data Drift (audit_ssot_drift.mjs)
runStep('7. SSOT Economic Data Drift', () => {
  const quotedFiles = targetFiles.length > 0 ? targetFiles.map((f) => `"${f}"`).join(' ') : '';
  execSync(`node scripts/audit_ssot_drift.mjs ${quotedFiles}`, { stdio: 'pipe', encoding: 'utf8' });
});

console.log('\n======================================================');
if (totalErrors > 0) {
  console.error(`❌ FAST PRE-FILTER FAILED: ${totalErrors} check(s) violated.`);
  console.error('Implementer must resolve all mechanical issues before requesting review.');
  process.exit(1);
} else {
  console.log('🎉 ALL MECHANICAL PRE-FILTERS PASSED! READY FOR STATION 3.');
  process.exit(0);
}
