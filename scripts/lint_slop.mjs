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
import { formatSlopResults } from './slop_linter/slop_reporter.mjs';

// Re-exports for downstream consumers and test suites
export { SLOP_RULES, TIER_BUDGETS, categorizeFile, getSourceFiles };

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

  return { errors, warnings };
}

/**
 * Main execution runner.
 */
export function runSlopLinter(targetDir = 'src') {
  const files = getSourceFiles(targetDir);
  const allErrors = [];
  const allWarnings = [];

  console.log(`\n🔍 [Anti-Slop Linter] Scanning ${files.length} files in "${targetDir}" via TypeScript AST...`);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const { errors, warnings } = lintSlopContent(content, file);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  // Multi-file Rule: zero-orphan-production-files (Anti-TIDD Check)
  lintOrphanProductionFiles(targetDir, files, allErrors);

  return formatSlopResults(files, allErrors, allWarnings);
}

// Direct CLI entry point
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectExecution) {
  const target = process.argv[2] || 'src';
  const result = runSlopLinter(target);
  if (!result.success) {
    process.exit(1);
  }
}
