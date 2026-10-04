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
    console.error(`\n[ERROR in ${title}]:\n${err.message || err}\n`);
    totalErrors++;
    return null;
  }
}

// 1. TypeScript Strict Compilation
runStep('1. Typecheck (tsc --noEmit)', () => {
  execSync('npx tsc --noEmit', { stdio: 'pipe', encoding: 'utf8' });
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
    ? targetFiles.filter((f) => fs.existsSync(f) && /\.(ts|tsx|js|mjs)$/.test(f))
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
      // Stray console.log in production code (allow in tests or scripts)
      if (!file.startsWith('tests') && !file.startsWith('scripts') && /console\.log\s*\(/.test(line)) {
        violations.push(`${file}:${lineNum} - Stray console.log in production source: ${line.trim()}`);
      }
    });
  }

  if (violations.length > 0) {
    throw new Error(violations.join('\n'));
  }
});

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

console.log('\n======================================================');
if (totalErrors > 0) {
  console.error(`❌ FAST PRE-FILTER FAILED: ${totalErrors} check(s) violated.`);
  console.error('Implementer must resolve all mechanical issues before requesting review.');
  process.exit(1);
} else {
  console.log('🎉 ALL MECHANICAL PRE-FILTERS PASSED! READY FOR STATION 3.');
  process.exit(0);
}
