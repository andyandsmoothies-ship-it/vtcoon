import ts from 'typescript';
import { SLOP_RULES } from './slop_constants.mjs';

/**
 * Checks if a catch clause has an explanatory comment inside its block.
 */
export function hasExplanatoryComment(node, sf, content) {
  const blockStart = node.block.getStart(sf);
  const blockEnd = node.block.getEnd();
  const blockText = content.substring(blockStart, blockEnd);
  return /(safe|ignore|test|mock|suppress|fallback|expected|uninitialized|unavailable|an to[aà]n|b[oỏ] qua|ngo[aà]i canvas|m[oô]i tr[uư][oờ]ng|kh[oô]ng kh[aả] d[uụ]ng)/i.test(blockText);
}

/**
 * Checks if a function is a declarative UI component, hook, texture generator, or event reducer.
 */
export function isDeclarativeOrReducerFunction(fnName, filePath) {
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
 * Traverses the TypeScript AST and evaluates all code quality and architecture rules.
 */
export function lintAstRules(sf, content, filePath, errors, warnings) {
  const normPath = filePath.replace(/\\/g, '/');

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
    if (isTestCall && (normPath.includes('/tests/') || normPath.startsWith('tests/'))) {
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
      if (normPath.includes('src/client/ui/')) {
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

    // Rule 14: ZERO_ALLOCATION_RENDER_LOOP (Gotcha #22 & 3D Perf)
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
                if (methodName === 'reduce') {
                  const { line } = sf.getLineAndCharacterOfPosition(frameNode.getStart());
                  errors.push({
                    rule: SLOP_RULES.ZERO_ALLOCATION_RENDER_LOOP,
                    file: filePath,
                    line: line + 1,
                    message: `Zero-Allocation Render Loop Violation: Calling .reduce() inside 60 FPS ${fnName} callback causes memory churn/GC pressure on mobile. Pre-calculate or cache state instead.`,
                  });
                }
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

    // Rule 15: R3F_NO_CONDITIONAL_RETURN_NULL (Gotcha #23)
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

    // Rule 16: KINEMATICS_FINITE_DEFENSE
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
}
