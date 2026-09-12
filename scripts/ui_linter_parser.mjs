/**
 * scripts/ui_linter_parser.mjs
 * 
 * Balanced AST and string extraction utilities for VTCOON UI Anti-pattern Linter.
 */

/**
 * Parses balanced template literal starting at index.
 * Properly accounts for nested quotes and template literals within expressions.
 */
export function parseBalancedTemplate(code, startIndex) {
  let index = startIndex + 1;
  let depth = 0;
  const exprs = [];
  let currentExpr = null;

  while (index < code.length) {
    const ch = code[index];
    if (ch === '\\') {
      index += 2;
      continue;
    }
    if (depth === 0 && ch === '`') {
      return { body: code.substring(startIndex + 1, index), endIndex: index, exprs };
    }
    if (depth > 0) {
      if (ch === '"' || ch === "'") {
        const quote = ch;
        index++;
        while (index < code.length) {
          if (code[index] === '\\') index += 2;
          else if (code[index] === quote) { index++; break; }
          else index++;
        }
        continue;
      }
      if (ch === '`') {
        const nested = parseBalancedTemplate(code, index);
        index = nested.endIndex + 1;
        continue;
      }
    }
    if (code.startsWith('${', index)) {
      depth++;
      index += 2;
      if (depth === 1) currentExpr = { start: index, body: '' };
      continue;
    }
    if (ch === '}' && depth > 0) {
      depth--;
      if (depth === 0 && currentExpr) {
        currentExpr.body = code.substring(currentExpr.start, index);
        exprs.push(currentExpr);
        currentExpr = null;
      }
      index++;
      continue;
    }
    index++;
  }
  return { body: code.substring(startIndex + 1), endIndex: code.length, exprs };
}

/**
 * Parses balanced parentheses starting at openParenIndex.
 */
export function parseBalancedParens(code, openParenIndex) {
  let depth = 0;
  let index = openParenIndex;
  while (index < code.length) {
    const ch = code[index];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) {
        return { inner: code.substring(openParenIndex + 1, index), endIndex: index };
      }
    }
    index++;
  }
  return { inner: code.substring(openParenIndex + 1), endIndex: code.length };
}

/**
 * Extracts class strings from JSX attributes, helper functions, and constants.
 */
export function extractClassStrings(code) {
  const results = [];
  const visitedRanges = [];

  function record(val, idx) {
    if (typeof val === 'string' && val.trim().length > 0) {
      results.push({ value: val, index: idx });
    }
  }

  // 1. Helper function calls: clsx, cn, cva, classNames
  const fnRegex = /\b(?:clsx|cn|cva|classNames)\s*\(/g;
  let fnMatch;
  while ((fnMatch = fnRegex.exec(code)) !== null) {
    const parenIndex = fnMatch.index + fnMatch[0].length - 1;
    const { inner, endIndex } = parseBalancedParens(code, parenIndex);
    visitedRanges.push({ start: fnMatch.index, end: endIndex });

    const strRegex = /(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`)/g;
    let sMatch;
    const callStrings = [];
    while ((sMatch = strRegex.exec(inner)) !== null) {
      const val = sMatch[1] ?? sMatch[2] ?? sMatch[3] ?? '';
      callStrings.push(val);
      record(val, parenIndex + 1 + sMatch.index);
    }
    if (callStrings.length > 1) {
      record(callStrings.join(' '), fnMatch.index);
    }
  }

  // 2. JSX/HTML className and class attributes
  const attrRegex = /\b(?:className|class)\s*=\s*/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(code)) !== null) {
    const afterEqual = attrMatch.index + attrMatch[0].length;
    const nextChar = code[afterEqual];

    if (nextChar === '"' || nextChar === "'") {
      const closeQuote = code.indexOf(nextChar, afterEqual + 1);
      if (closeQuote !== -1) {
        record(code.substring(afterEqual + 1, closeQuote), afterEqual + 1);
        visitedRanges.push({ start: attrMatch.index, end: closeQuote });
      }
    } else if (nextChar === '{') {
      const insideBrace = afterEqual + 1;
      const quoteChar = code[insideBrace];

      if (quoteChar === '"' || quoteChar === "'") {
        const closeQuote = code.indexOf(quoteChar, insideBrace + 1);
        if (closeQuote !== -1) {
          record(code.substring(insideBrace + 1, closeQuote), insideBrace + 1);
          visitedRanges.push({ start: attrMatch.index, end: closeQuote + 1 });
        }
      } else if (quoteChar === '`') {
        const { body, endIndex, exprs } = parseBalancedTemplate(code, insideBrace);
        visitedRanges.push({ start: attrMatch.index, end: endIndex + 1 });

        const staticParts = body.replace(/\$\{[\s\S]*?\}/g, ' ');
        record(staticParts, insideBrace + 1);

        for (const expr of exprs) {
          const strRegex = /(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`)/g;
          let branchMatch;
          while ((branchMatch = strRegex.exec(expr.body)) !== null) {
            const branchVal = branchMatch[1] ?? branchMatch[2] ?? branchMatch[3] ?? '';
            record(`${staticParts} ${branchVal}`, insideBrace + 1 + expr.start + branchMatch.index);
          }
        }
      }
    }
  }

  // 3. Standalone string literals in JS/TS files
  const allStringsRegex = /(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`)/g;
  let genMatch;
  while ((genMatch = allStringsRegex.exec(code)) !== null) {
    const start = genMatch.index;
    const end = start + genMatch[0].length;
    if (!visitedRanges.some(r => start >= r.start && end <= r.end)) {
      record(genMatch[1] ?? genMatch[2] ?? genMatch[3] ?? '', start);
    }
  }

  return results;
}
