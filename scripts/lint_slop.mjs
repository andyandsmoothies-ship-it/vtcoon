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
  ZERO_RAW_CANVAS_DOM: 'zero-raw-canvas-dom',
  EULER_YAW_CLAMP: 'euler-yaw-clamp',
  CLIENT_SERVER_BOUNDARY: 'client-server-boundary',
  ZERO_ALLOCATION_RENDER_LOOP: 'zero-allocation-render-loop',
  R3F_NO_CONDITIONAL_RETURN_NULL: 'r3f-no-conditional-return-null',
  KINEMATICS_FINITE_DEFENSE: 'kinematics-finite-defense',
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
  const normPath = filePath.replace(/\\/g, '/');

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

    // Rule 11: ZERO_RAW_CANVAS_DOM (Gotcha #12: Prohibit raw DOM tags inside 3D Canvas without SafeHtml/Html)
    const normPath = filePath.replace(/\\/g, '/');
    if (normPath.includes('src/client/3d/') && !normPath.includes('cinematic_effects.tsx')) {
      const isRawDomElement = (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        ts.isIdentifier(node.tagName) &&
        ['div', 'span', 'p', 'button', 'input', 'h1', 'h2', 'h3'].includes(node.tagName.text);

      if (isRawDomElement) {
        let parent = node.parent;
        let isWrapped = false;
        while (parent) {
          if (ts.isJsxElement(parent) && ts.isIdentifier(parent.openingElement.tagName)) {
            const parentTag = parent.openingElement.tagName.text;
            if (parentTag === 'SafeHtml' || parentTag === 'Html') {
              isWrapped = true;
              break;
            }
          }
          parent = parent.parent;
        }

        if (!isWrapped) {
          const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
          errors.push({
            rule: SLOP_RULES.ZERO_RAW_CANVAS_DOM,
            file: filePath,
            line: line + 1,
            message: `Gotcha #12 Violation: Raw DOM element <${node.tagName.text}> placed directly in 3D Canvas without <SafeHtml> wrapper (causes fatal R3F crash in browser).`,
          });
        }
      }
    }

    // Rule 12: EULER_YAW_CLAMP (Gotcha #11: Three.js Euler order must be 'YXZ' when reading yaw)
    if (normPath.includes('src/client/3d/')) {
      if (ts.isNewExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        if (node.expression.expression.getText(sf) === 'THREE' && node.expression.name.text === 'Euler') {
          if (node.arguments && node.arguments.length === 3) {
            const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
            warnings.push({
              rule: SLOP_RULES.EULER_YAW_CLAMP,
              file: filePath,
              line: line + 1,
              message: "Gotcha #11 Warning: 'new THREE.Euler(x, y, z)' defaults to 'XYZ' order which clamps Yaw to [-PI/2, PI/2]. Use 'YXZ' order if tracking yaw/rotation.",
            });
          }
        }
      }
    }

    // Rule 13: CLIENT_SERVER_BOUNDARY (GEMINI.md Iron Law: Prohibit Node built-ins and server packages in client bundles)
    if (normPath.includes('src/client/') || normPath.startsWith('src/client/')) {
      let importedModule = null;
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        importedModule = node.moduleSpecifier.text;
      } else if (ts.isCallExpression(node) && node.expression) {
        const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
        const isRequire = ts.isIdentifier(node.expression) && node.expression.text === 'require';
        if ((isDynamicImport || isRequire) && node.arguments && node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
          importedModule = node.arguments[0].text;
        }
      }

      if (importedModule) {
        const BANNED_CLIENT_MODULES = new Set([
          'ws', 'child_process', 'fs', 'path', 'os', 'crypto', 'net', 'http', 'https', 'stream', 'buffer', 'cluster', 'dgram', 'dns', 'readline', 'tls', 'v8', 'vm', 'worker_threads', 'zlib',
        ]);
        if (importedModule.startsWith('node:') || BANNED_CLIENT_MODULES.has(importedModule)) {
          const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
          errors.push({
            rule: SLOP_RULES.CLIENT_SERVER_BOUNDARY,
            file: filePath,
            line: line + 1,
            message: `Client/Server Boundary Violation: Importing server/Node runtime package "${importedModule}" in client bundle is strictly forbidden by GEMINI.md Iron Law.`,
          });
        }
      }
    }

    // Rule 14: ZERO_ALLOCATION_RENDER_LOOP (Gotcha #22 & 3D Perf: Prohibit array allocations and reductions inside 60 FPS useFrame/useSafeFrame)
    if (normPath.includes('src/client/3d/')) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const fnName = node.expression.text;
        if (fnName === 'useFrame' || fnName === 'useSafeFrame') {
          const callback = node.arguments && node.arguments[0];
          if (callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))) {
            const checkFrameBody = (frameNode) => {
              if (ts.isCallExpression(frameNode) && ts.isPropertyAccessExpression(frameNode.expression)) {
                const propAccess = frameNode.expression;
                const methodName = propAccess.name.text;
                // Check .reduce()
                if (methodName === 'reduce') {
                  const { line } = sf.getLineAndCharacterOfPosition(frameNode.getStart());
                  errors.push({
                    rule: SLOP_RULES.ZERO_ALLOCATION_RENDER_LOOP,
                    file: filePath,
                    line: line + 1,
                    message: `Zero-Allocation Render Loop Violation: Calling .reduce() inside 60 FPS ${fnName} callback causes memory churn/GC pressure on mobile. Pre-calculate or cache state instead.`,
                  });
                }
                // Check Object.values, Object.keys, Object.entries
                if (ts.isIdentifier(propAccess.expression) && propAccess.expression.text === 'Object') {
                  if (methodName === 'values' || methodName === 'keys' || methodName === 'entries') {
                    const { line } = sf.getLineAndCharacterOfPosition(frameNode.getStart());
                    errors.push({
                      rule: SLOP_RULES.ZERO_ALLOCATION_RENDER_LOOP,
                      file: filePath,
                      line: line + 1,
                      message: `Zero-Allocation Render Loop Violation: Calling Object.${methodName}() inside 60 FPS ${fnName} callback allocates temporary arrays every frame. Use for..in, cached state, or reactive store selectors instead.`,
                    });
                  }
                }
              }
              ts.forEachChild(frameNode, checkFrameBody);
            };
            if (callback.body) {
              ts.forEachChild(callback.body, checkFrameBody);
            }
          }
        }
      }
    }

    // Rule 15: R3F_NO_CONDITIONAL_RETURN_NULL (Gotcha #23: Prohibit returning null on transient state in 3D components)
    if (normPath.includes('src/client/3d/') && normPath.endsWith('.tsx')) {
      if (ts.isIfStatement(node) && node.thenStatement) {
        let hasReturnNull = false;
        if (ts.isReturnStatement(node.thenStatement)) {
          if (node.thenStatement.expression && node.thenStatement.expression.kind === ts.SyntaxKind.NullKeyword) {
            hasReturnNull = true;
          }
        } else if (ts.isBlock(node.thenStatement)) {
          for (const stmt of node.thenStatement.statements) {
            if (ts.isReturnStatement(stmt) && stmt.expression && stmt.expression.kind === ts.SyntaxKind.NullKeyword) {
              hasReturnNull = true;
              break;
            }
          }
        }
        if (hasReturnNull) {
          const condText = node.expression.getText(sf);
          if (/(isAnimating|activeAnimation|isPawnMoving|hasUserCustomCamera|pawnAnimationQueue)/i.test(condText)) {
            const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
            errors.push({
              rule: SLOP_RULES.R3F_NO_CONDITIONAL_RETURN_NULL,
              file: filePath,
              line: line + 1,
              message: `R3F Transient Unmount Violation: Returning null on transient condition "${condText}" in 3D component causes continuous GPU buffer/shader re-allocation churn on mobile. Keep component mounted and control visibility via <group visible={...}>.`,
            });
          }
        }
      }
    }

    // Rule 16: KINEMATICS_FINITE_DEFENSE (Kinematics tuples must guard against NaN fallthrough)
    if (normPath.includes('src/client/3d/') && /(?:camera|kinematic|flyby|return)\b/i.test(normPath)) {
      if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
        const propName = node.name.text;
        if ((propName === 'position' || propName === 'target') && ts.isArrayLiteralExpression(node.initializer)) {
          const elements = node.initializer.elements;
          if (elements.length === 3) {
            for (const el of elements) {
              if (ts.isIdentifier(el)) {
                const idName = el.text;
                if (/^(?:tx|ty|tz|cx|cy|cz)$/.test(idName)) {
                  const { line } = sf.getLineAndCharacterOfPosition(el.getStart());
                  errors.push({
                    rule: SLOP_RULES.KINEMATICS_FINITE_DEFENSE,
                    file: filePath,
                    line: line + 1,
                    message: `Kinematics Finite Defense: Property '${propName}' directly assigns unguarded arithmetic intermediate identifier '${idName}' in 3D tuple. Wrap in Number.isFinite(${idName}) ? ${idName} : safeFallback to prevent Three.js Matrix4 Inversion crashes.`,
                  });
                }
              }
            }
          }
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
