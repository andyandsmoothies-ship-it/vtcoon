#!/usr/bin/env node

/**
 * scripts/lint_slop.mjs
 * 
 * VTCOON Local Quality Gate & Anti-Slop AST Linter (Facade Entrypoint)
 * 
 * Enforces deterministic quality gate rules based on AGENTS CONSTITUTION (GEMINI.md).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import {
  SLOP_RULES,
  TIER_BUDGETS,
  categorizeFile,
  getSourceFiles
} from './slop_linter/slop_constants.mjs';
import { lintTextRules, lintOrphanProductionFiles } from './slop_linter/slop_text_rules.mjs';
import { lintAstRules } from './slop_linter/slop_ast_rules.mjs';
import { lintSeamRules } from './slop_linter/slop_seam_rules.mjs';
import { formatSlopResults } from './slop_linter/slop_reporter.mjs';

// Re-exports for downstream consumers and test suites
export { SLOP_RULES, TIER_BUDGETS, categorizeFile, getSourceFiles, lintSeamRules };

/**
 * Inspects a source code string and returns errors and warnings.
 */
export function lintSlopContent(content, filePath = 'anonymous.ts') {
  const errors = [];
  const warnings = [];

  // 1. Text-based rules (LOC, comments)
  lintTextRules(content, filePath, errors, warnings);

  // 2. AST-based traversal rules
  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  lintAstRules(sf, content, filePath, errors, warnings);
  lintSeamRules(sf, content, filePath, errors);

  return { errors, warnings };
}

/**
 * Main execution runner.
 */
export function runSlopLinter(target = 'src') {
  const rootDir = process.cwd();
  const targetList = Array.isArray(target) ? target : [target];
  const files = [];

  for (const t of targetList) {
    const absTarget = path.isAbsolute(t) ? t : path.join(rootDir, t);
    if (fs.existsSync(absTarget)) {
      files.push(...getSourceFiles(absTarget));
    }
  }

  const uniqueFiles = [...new Set(files)];
  const allErrors = [];
  const allWarnings = [];

  const targetDesc = targetList.length > 0 && targetList.length <= 3
    ? targetList.join(', ')
    : `${uniqueFiles.length} files`;
  console.log(`\n🔍 [Anti-Slop Linter] Scanning ${uniqueFiles.length} files (${targetDesc}) via TypeScript AST...`);

  const sharedFileCache = new Map();
  for (const file of uniqueFiles) {
    const content = fs.readFileSync(file, 'utf8');
    sharedFileCache.set(file, content);
    const { errors, warnings } = lintSlopContent(content, file);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  // Multi-file Rule: zero-orphan-production-files (Anti-TIDD Check with shared cache)
  lintOrphanProductionFiles(targetList, uniqueFiles, allErrors, sharedFileCache);

  return formatSlopResults(uniqueFiles, allErrors, allWarnings);
}

// Direct CLI entry point
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectExecution) {
  const cliTargets = process.argv.slice(2);
  const target = cliTargets.length > 0 ? cliTargets : 'src';
  const result = runSlopLinter(target);
  if (!result.success) {
    process.exit(1);
  }
}
