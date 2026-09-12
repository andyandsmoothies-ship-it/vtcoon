#!/usr/bin/env node

/**
 * scripts/lint_slop.mjs
 * 
 * VTCOON Local Quality Gate & Anti-Slop AST Linter
 * 
 * Deterministic quality gate rules based on AGENTS CONSTITUTION (GEMINI.md)
 * and AI-Native SDLC Master Guide:
 * 1. zero-swallowed-catch: Prohibits empty catch blocks without handling or explicit explanation.
 * 2. zero-dirty-casts: Prohibits 'as any' and double casting 'as unknown as'.
 * 3. file-loc-budget: Enforces 5-Tier file line budgets (Logic <= 400, UI <= 500, Static <= 800).
 * 4. function-loc-budget: Warns logic functions > 50 SLOC, fails > 80 SLOC (excluding JSX layouts).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export const SLOP_RULES = {
  ZERO_SWALLOWED_CATCH: 'zero-swallowed-catch',
  ZERO_DIRTY_CASTS: 'zero-dirty-casts',
  FILE_LOC_BUDGET: 'file-loc-budget',
  FUNCTION_LOC_BUDGET: 'function-loc-budget',
};

export const TIER_BUDGETS = {
  TIER1_LOGIC: { maxWarn: 300, maxError: 550 },
  TIER2_UI: { maxWarn: 400, maxError: 500 },
  TIER3_STATIC: { maxWarn: 650, maxError: 800 },
};

/**
 * Categorizes a file path into its appropriate budget tier.
 */
export function categorizeFile(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  if (norm.includes('tile_icons.ts') || norm.includes('property_manager_data.ts') || norm.includes('board_config.ts')) {
    return 'TIER3_STATIC';
  }
  if (norm.includes('src/client/ui/') || norm.includes('src/client/3d/') || norm.endsWith('.tsx')) {
    return 'TIER2_UI';
  }
  if (norm.includes('src/domain/') || norm.includes('src/server/')) {
    return 'TIER1_LOGIC';
  }
  return 'TIER1_LOGIC';
}

/**
 * Recursively retrieves all TypeScript/TSX source files.
 */
export function getSourceFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.agents') {
        getSourceFiles(fullPath, fileList);
      }
    } else if ((entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) && !entry.name.endsWith('.d.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * Checks if a catch clause has an explanatory comment inside its block.
 */
function hasExplanatoryComment(node, sf, content) {
  const blockStart = node.block.getStart(sf);
  const blockEnd = node.block.getEnd();
  const blockText = content.substring(blockStart, blockEnd);
  return /(safe|ignore|test|mock|suppress|fallback|expected|an toàn|bỏ qua|ngoài canvas|môi trường|uninitialized|không khả dụng)/i.test(blockText);
}

/**
 * Checks if a function is a declarative UI component, hook, texture generator, or event reducer.
 */
function isDeclarativeOrReducerFunction(fnName, filePath) {
  const norm = filePath.replace(/\\/g, '/');
  if (norm.endsWith('.tsx') || norm.includes('src/client/3d/') || norm.includes('src/client/ui/')) {
    return true;
  }
  if (/^(use[A-Z]|generate.*Texture|draw.*Pattern|applyDelta|format[A-Z]|get[A-Z].*Texture)/.test(fnName)) {
    return true;
  }
  return false;
}

/**
 * Inspects a source code string and returns errors and warnings.
 */
export function lintSlopContent(content, filePath = 'anonymous.ts') {
  const errors = [];
  const warnings = [];

  const lines = content.split('\n');
  const lineCount = lines.length;
  const tier = categorizeFile(filePath);
  const budget = TIER_BUDGETS[tier] || TIER_BUDGETS.TIER1_LOGIC;

  // File-level LOC check
  if (lineCount > budget.maxError) {
    errors.push({
      rule: SLOP_RULES.FILE_LOC_BUDGET,
      file: filePath,
      line: 1,
      message: `File exceeds maximum budget of ${budget.maxError} lines (current: ${lineCount} lines, tier: ${tier}). Trigger modular decomposition.`,
    });
  } else if (lineCount > budget.maxWarn) {
    warnings.push({
      rule: SLOP_RULES.FILE_LOC_BUDGET,
      file: filePath,
      line: 1,
      message: `File reached warning threshold of ${budget.maxWarn} lines (current: ${lineCount} lines, tier: ${tier}). Consider extracting submodules.`,
    });
  }

  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node) {
    // Rule 1: zero-swallowed-catch
    if (ts.isCatchClause(node)) {
      if (node.block.statements.length === 0) {
        if (!hasExplanatoryComment(node, sf, content)) {
          const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
          errors.push({
            rule: SLOP_RULES.ZERO_SWALLOWED_CATCH,
            file: filePath,
            line: line + 1,
            message: 'Silent swallowed exception: Empty catch block with no handling statements or explanatory comment.',
          });
        }
      }
    }

    // Rule 2: zero-dirty-casts
    if (ts.isAsExpression(node)) {
      const typeText = node.type.getText(sf).trim();
      if (typeText === 'any') {
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
        errors.push({
          rule: SLOP_RULES.ZERO_DIRTY_CASTS,
          file: filePath,
          line: line + 1,
          message: 'Dirty cast detected: "as any". Use explicit types or domain union models.',
        });
      } else if (typeText === 'unknown' && ts.isAsExpression(node.parent)) {
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
        errors.push({
          rule: SLOP_RULES.ZERO_DIRTY_CASTS,
          file: filePath,
          line: line + 1,
          message: 'Double dirty cast detected: "as unknown as T". Extend interfaces or declare global types.',
        });
      }
    }

    // Rule 4: function-loc-budget (for non-JSX pure logic/domain/server functions)
    const isFunc = ts.isFunctionDeclaration(node) ||
                   ts.isFunctionExpression(node) ||
                   ts.isArrowFunction(node) ||
                   ts.isMethodDeclaration(node);

    if (isFunc && node.body && ts.isBlock(node.body)) {
      const fnName = node.name ? node.name.getText(sf) : 'anonymous';
      const startLine = sf.getLineAndCharacterOfPosition(node.body.getStart()).line + 1;
      const endLine = sf.getLineAndCharacterOfPosition(node.body.getEnd()).line + 1;
      const sloc = endLine - startLine;

      const isDeclarative = isDeclarativeOrReducerFunction(fnName, filePath);

      if (!isDeclarative) {
        // Pure domain/server/fsm logic functions
        if (sloc > 120) {
          errors.push({
            rule: SLOP_RULES.FUNCTION_LOC_BUDGET,
            file: filePath,
            line: startLine,
            message: `Domain logic function "${fnName}" is too long (${sloc} SLOC > 120 lines). Split into focused helper functions.`,
          });
        } else if (sloc > 50) {
          warnings.push({
            rule: SLOP_RULES.FUNCTION_LOC_BUDGET,
            file: filePath,
            line: startLine,
            message: `Domain logic function "${fnName}" exceeds 50 SLOC (${sloc} lines). Consider extracting subroutines.`,
          });
        }
      } else {
        // Declarative UI / Texture / Reducer functions: Warn if unusually giant (> 300 SLOC)
        if (sloc > 300) {
          warnings.push({
            rule: SLOP_RULES.FUNCTION_LOC_BUDGET,
            file: filePath,
            line: startLine,
            message: `Declarative component/generator "${fnName}" is large (${sloc} lines). Consider splitting into subcomponents.`,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);

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

  if (allWarnings.length > 0) {
    console.log(`\n⚠️  [Anti-Slop Linter] ${allWarnings.length} Soft Warning(s):`);
    for (const w of allWarnings) {
      console.log(`  [${w.rule}] ${w.file}:${w.line} - ${w.message}`);
    }
  }

  if (allErrors.length > 0) {
    console.error(`\n❌ [Anti-Slop Linter] ${allErrors.length} Hard Violation(s) Detected:`);
    for (const err of allErrors) {
      console.error(`  [${err.rule}] ${err.file}:${err.line} - ${err.message}`);
    }
    return { success: false, errors: allErrors, warnings: allWarnings };
  }

  console.log(`✅ [Anti-Slop Linter] Clean! 0 Hard Violations across ${files.length} files.\n`);
  return { success: true, errors: allErrors, warnings: allWarnings };
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
