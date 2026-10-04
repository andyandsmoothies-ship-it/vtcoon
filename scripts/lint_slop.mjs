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
  ZERO_WORKAROUND_COMMENTS: 'zero-workaround-comments',
  ZERO_GETTER_PROXIES: 'zero-getter-proxies',
  ZERO_PSEUDO_PROXIES: 'zero-pseudo-proxies',
  ZERO_TEST_PROPS: 'zero-test-props',
  ATOMIC_TEST_MAX_ASSERTS: 'atomic-test-max-asserts',
  ZERO_DEAD_SSR: 'zero-dead-ssr',
  ZERO_ORPHAN_PRODUCTION_FILES: 'zero-orphan-production-files',
  MARKDOWN_HYGIENE_LATEX: 'markdown-hygiene-latex',
};

export const TIER_BUDGETS = {
  TIER1_LOGIC: { maxWarn: 300, maxError: 550 },
  TIER2_UI: { maxWarn: 400, maxError: 500 },
  TIER3_STATIC: { maxWarn: 650, maxError: 800 },
  TIER_TEST: { maxWarn: 600, maxError: 650 },
};

/**
 * Categorizes a file path into its appropriate budget tier.
 */
export function categorizeFile(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  if (norm.includes('/tests/') || norm.startsWith('tests/')) {
    return 'TIER_TEST';
  }
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
  const stat = fs.statSync(dir);
  if (!stat.isDirectory()) {
    if ((dir.endsWith('.ts') || dir.endsWith('.tsx')) && !dir.endsWith('.d.ts')) {
      fileList.push(dir);
    }
    return fileList;
  }
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
  return /(safe|ignore|test|mock|suppress|fallback|expected|uninitialized|unavailable|an to[aà]n|b[oỏ] qua|ngo[aà]i canvas|m[oô]i tr[uư][oờ]ng|kh[oô]ng kh[aả] d[uụ]ng)/i.test(blockText);
}

/**
 * Checks if a function is a declarative UI component, hook, texture generator, or event reducer.
 */
function isDeclarativeOrReducerFunction(fnName, filePath) {
  const norm = filePath.replace(/\\/g, '/');
  if (norm.endsWith('.tsx') || norm.includes('src/client/3d/') || norm.includes('src/client/ui/') || norm.includes('/tests/') || norm.startsWith('tests/')) {
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

  // Rule 5: zero-workaround-comments (Lauren Tan / Dune Invariant)
  // Prohibits comments papering over defects instead of solving root causes.
  const WORKAROUND_REGEX = /\b(workaround|quick hack|dirty hack|temporary fix|temp fix|fix later)\b|(sửa tạm|vá tạm|lách luật|chữa cháy|bỏ qua tạm)/i;
  lines.forEach((lineText, idx) => {
    let commentText = null;
    const slashIndex = lineText.indexOf('//');
    const blockIndex = lineText.indexOf('/*');
    if (slashIndex !== -1) {
      commentText = lineText.slice(slashIndex + 2);
    } else if (blockIndex !== -1) {
      commentText = lineText.slice(blockIndex + 2);
    } else if (/^\s*\*+/.test(lineText)) {
      commentText = lineText.replace(/^\s*\*+\s*/, '');
    }
    if (commentText && WORKAROUND_REGEX.test(commentText)) {
      errors.push({
        rule: SLOP_RULES.ZERO_WORKAROUND_COMMENTS,
        file: filePath,
        line: idx + 1,
        message: 'Workaround justification detected in comment. Resolve root cause in architecture/code instead of papering over defects.',
      });
    }
  });

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

    // Rule 6: zero-getter-proxies (Anti-Churn Invariant)
    if (ts.isGetAccessorDeclaration(node)) {
      const text = node.getText(sf);
      if (text.includes('new Proxy(') || /return\s+new\s+\w+Proxy\b/.test(text)) {
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
        errors.push({
          rule: SLOP_RULES.ZERO_GETTER_PROXIES,
          file: filePath,
          line: line + 1,
          message: 'Dynamic Proxy/Wrapper instantiation inside property getter causes allocation churn & breaks object identity. Cache the wrapper instance on initialization or expose a method.',
        });
      }
    }

    // Rule 7: zero-pseudo-proxies (KISS Local Adapters)
    if (ts.isNewExpression(node) && node.expression.getText(sf) === 'Proxy') {
      let parent = node.parent;
      let insideLocalFunction = false;
      while (parent) {
        if (ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent) || ts.isArrowFunction(parent) || ts.isMethodDeclaration(parent)) {
          if (!ts.isConstructorDeclaration(parent)) {
            insideLocalFunction = true;
            break;
          }
        }
        parent = parent.parent;
      }
      if (insideLocalFunction) {
        const firstArg = node.arguments && node.arguments[0] ? node.arguments[0].getText(sf) : '';
        if (firstArg.startsWith('new Map') || firstArg.startsWith('new Set') || firstArg === '{}') {
          const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
          errors.push({
            rule: SLOP_RULES.ZERO_PSEUDO_PROXIES,
            file: filePath,
            line: line + 1,
            message: 'Pseudo-Proxy overengineering detected on local collection/object. Use simple native collection with sync-back or overload the target function.',
          });
        }
      }
    }

    // Rule 8: zero-test-props (Anti Test-Induced Design Damage)
    const isTestNamedMember = ts.isPropertySignature(node) ||
                              ts.isPropertyDeclaration(node) ||
                              ts.isMethodDeclaration(node) ||
                              ts.isFunctionDeclaration(node);
    if (isTestNamedMember && node.name) {
      const memberName = node.name.getText(sf);
      if (/(?:ForTesting|ForTest|_forTesting|_forTest)\b/i.test(memberName)) {
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
        errors.push({
          rule: SLOP_RULES.ZERO_TEST_PROPS,
          file: filePath,
          line: line + 1,
          message: `Test-Induced Design Damage (TIDD) detected: Production code exposes test-specific member "${memberName}". Move test-only logic to tests/** or extract pure helpers.`,
        });
      }
    }

    // Rule 9: atomic-test-max-asserts (Enforce <= 4 asserts per test case in tests/**)
    const isTestCall = ts.isCallExpression(node) && node.expression &&
      (ts.isIdentifier(node.expression) && (node.expression.text === 'it' || node.expression.text === 'test') ||
       (ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.name) && (node.expression.name.text === 'it' || node.expression.name.text === 'test')));
    if (isTestCall && (filePath.replace(/\\/g, '/').includes('/tests/') || filePath.replace(/\\/g, '/').startsWith('tests/'))) {
      let expectCount = 0;
      function countExpects(child) {
        if (ts.isCallExpression(child)) {
          const childExpr = child.expression;
          const childFn = ts.isIdentifier(childExpr) ? childExpr.text : null;
          if (childFn === 'expect') expectCount++;
        }
        ts.forEachChild(child, countExpects);
      }
      if (node.arguments && node.arguments.length >= 2) {
        countExpects(node.arguments[1]);
      }
      if (expectCount > 4) {
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
        const testTitle = node.arguments[0] && ts.isStringLiteral(node.arguments[0]) ? node.arguments[0].text : 'anonymous';
        errors.push({
          rule: SLOP_RULES.ATOMIC_TEST_MAX_ASSERTS,
          file: filePath,
          line: line + 1,
          message: `Atomic test assertion ceiling exceeded: test "${testTitle}" has ${expectCount} assertions (maximum allowed is 4 per GEMINI.md). Split into atomic tests.`,
        });
      }
    }

    // Rule 10: zero-dead-ssr (Warns against isSSR workarounds in client UI files)
    if (ts.isVariableDeclaration(node) && node.name.getText(sf) === 'isSSR') {
      const norm = filePath.replace(/\\/g, '/');
      if (norm.includes('src/client/ui/')) {
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
        warnings.push({
          rule: SLOP_RULES.ZERO_DEAD_SSR,
          file: filePath,
          line: line + 1,
          message: 'Avoid "isSSR" dead branch in client UI. Client UI runs in browser; SSR guards create unkillable mutants.',
        });
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

  // Rule 11: zero-orphan-production-files (Anti-TIDD Check)
  if (targetDir === 'src' || targetDir.startsWith('src')) {
    const srcFiles = files;
    const testFiles = fs.existsSync('tests') ? getSourceFiles('tests') : [];
    const allSrcContent = srcFiles.map(f => ({ file: f, content: fs.readFileSync(f, 'utf8') }));
    const allTestContent = testFiles.map(f => ({ file: f, content: fs.readFileSync(f, 'utf8') }));
    const KNOWN_ENTRYPOINTS = new Set([
      'src/client/main.tsx',
      'src/server/index.ts',
      'src/client/ui/app_error_boundary.ts',
      'src/client/ui/lobby/lobby_view.tsx',
      'src/client/3d/r3f_fiber_shield.ts',
      'src/client/3d/owner_price_pill.ts',
      'src/client/3d/tactile_deed_wax_seal.ts',
      'src/client/3d/diorama/diorama_ferris_wheel.tsx',
      'src/client/3d/diorama/diorama_stadium.tsx',
      'src/client/3d/centerpiece_water.tsx',
      'src/client/ui/social_emotes_tray.tsx',
    ]);

    for (const { file } of allSrcContent) {
      const norm = file.replace(/\\/g, '/');
      if (norm.includes('polyfills/') || KNOWN_ENTRYPOINTS.has(norm)) continue;
      const base = path.basename(file).replace(/\.[^.]+$/, '');
      const isImportedInSrc = allSrcContent.some(other => {
        if (other.file === file) return false;
        return new RegExp(`from\\s+['"][^'"]*\\b${base}(?:\\.js)?['"]`).test(other.content) ||
               new RegExp(`import\\s*\\(['"][^'"]*\\b${base}(?:\\.js)?['"]\\)`).test(other.content);
      });
      const isImportedInTests = allTestContent.some(t => {
        return new RegExp(`from\\s+['"][^'"]*\\b${base}(?:\\.js)?['"]`).test(t.content) ||
               new RegExp(`import\\s*\\(['"][^'"]*\\b${base}(?:\\.js)?['"]\\)`).test(t.content);
      });

      if (!isImportedInSrc && isImportedInTests) {
        allErrors.push({
          rule: SLOP_RULES.ZERO_ORPHAN_PRODUCTION_FILES,
          file,
          line: 1,
          message: `Anti-TIDD Violation: Production file "${norm}" is imported in tests/** but has ZERO consumers in src/**. Move to tests/** or delete.`,
        });
      }
    }
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
