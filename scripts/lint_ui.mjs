#!/usr/bin/env node

/**
 * scripts/lint_ui.mjs
 * 
 * VTCOON 2D UI Linter - Impeccable Anti-pattern Enforcement
 * 
 * Checks for 4 core UI anti-patterns:
 * 1. border-accent-on-rounded: Directional border on rounded elements (causes corner warping).
 * 2. bounce-easing: animate-bounce or cubic-bezier with overshoot > 1.0.
 * 3. gray-on-color: Neutral dark text on chromatic backgrounds.
 * 4. gradient-text: bg-clip-text + text-transparent + bg-gradient-* / bg-radial on text.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RULES,
  RULE_MESSAGES,
  CHROMATIC_BG_REGEX,
  NEUTRAL_950_TEXT_REGEX,
  checkBorderAccentOnRounded,
} from './ui_linter_rules.mjs';
import { extractClassStrings } from './ui_linter_parser.mjs';

export { RULES, RULE_MESSAGES, extractClassStrings };

/**
 * Strips comments while preserving exact line breaks and character offsets.
 */
export function stripComments(code) {
  const noBlock = code.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\r\n]/g, ' '));
  return noBlock.replace(/\/\/[^\r\n]*/g, (match) => ' '.repeat(match.length));
}

function getLineAndCol(text, index) {
  const prefix = text.substring(0, index);
  const lines = prefix.split('\n');
  const line = lines.length;
  const col = (lines[lines.length - 1]?.length ?? 0) + 1;
  return { line, col };
}

/**
 * Scans a single file's content and returns array of violations.
 */
export function lintContent(content, filePath = 'anonymous') {
  const rawViolations = [];
  const cleanCode = stripComments(content);

  // --- Rule 1: bounce-easing ---
  const bounceRegex = /\banimate-bounce\b/g;
  let bMatch;
  while ((bMatch = bounceRegex.exec(cleanCode)) !== null) {
    const { line, col } = getLineAndCol(content, bMatch.index);
    rawViolations.push({
      rule: RULES.BOUNCE_EASING,
      file: filePath,
      line,
      col,
      snippet: bMatch[0],
      advice: RULE_MESSAGES[RULES.BOUNCE_EASING].advice,
    });
  }

  const bezierRegex = /cubic-bezier\s*\(\s*([0-9.-]+)\s*,\s*([0-9.-]+)\s*,\s*([0-9.-]+)\s*,\s*([0-9.-]+)\s*\)/g;
  let bezMatch;
  while ((bezMatch = bezierRegex.exec(cleanCode)) !== null) {
    const p2 = parseFloat(bezMatch[2] ?? '0');
    const p4 = parseFloat(bezMatch[4] ?? '0');
    if (p2 > 1.0 || p4 > 1.0) {
      const { line, col } = getLineAndCol(content, bezMatch.index);
      rawViolations.push({
        rule: RULES.BOUNCE_EASING,
        file: filePath,
        line,
        col,
        snippet: bezMatch[0],
        advice: `${RULE_MESSAGES[RULES.BOUNCE_EASING].advice} (overshoot: ${Math.max(p2, p4)})`,
      });
    }
  }

  // --- Check Class Strings for remaining rules ---
  const classStrings = extractClassStrings(cleanCode);

  for (const { value, index } of classStrings) {
    if (checkBorderAccentOnRounded(value)) {
      const { line, col } = getLineAndCol(content, index);
      rawViolations.push({
        rule: RULES.BORDER_ACCENT_ON_ROUNDED,
        file: filePath,
        line,
        col,
        snippet: value.trim().replace(/\s+/g, ' ').slice(0, 80),
        advice: RULE_MESSAGES[RULES.BORDER_ACCENT_ON_ROUNDED].advice,
      });
    }

    if (NEUTRAL_950_TEXT_REGEX.test(value) && CHROMATIC_BG_REGEX.test(value)) {
      const { line, col } = getLineAndCol(content, index);
      rawViolations.push({
        rule: RULES.GRAY_ON_COLOR,
        file: filePath,
        line,
        col,
        snippet: value.trim().replace(/\s+/g, ' ').slice(0, 80),
        advice: RULE_MESSAGES[RULES.GRAY_ON_COLOR].advice,
      });
    }

    const hasClip = /\bbg-clip-text\b/.test(value);
    const hasTransparent = /\btext-transparent\b/.test(value);
    const hasGradient = /\b(?:bg-gradient-|bg-linear-|gradient-to-|bg-radial|bg-conic|bg-\[(?:linear|radial|conic)-gradient)/.test(value);
    if (hasClip && hasTransparent && hasGradient) {
      const { line, col } = getLineAndCol(content, index);
      rawViolations.push({
        rule: RULES.GRADIENT_TEXT,
        file: filePath,
        line,
        col,
        snippet: value.trim().replace(/\s+/g, ' ').slice(0, 80),
        advice: RULE_MESSAGES[RULES.GRADIENT_TEXT].advice,
      });
    }
  }

  // --- CSS-specific checks (.css files) ---
  if (filePath.endsWith('.css')) {
    const blockRegex = /\{([^}]+)\}/g;
    let cssBlock;
    while ((cssBlock = blockRegex.exec(cleanCode)) !== null) {
      const blockBody = cssBlock[1] ?? '';
      const hasBorderRadius = /border-radius\s*:\s*(?!0\b)[^;]+;/i.test(blockBody);
      const hasDirectionalBorder = /border-(?:bottom|top|left|right|block-end|inline-end)(?:-width)?\s*:\s*(?:[^;]*?\s+)?(?:[2-9]|\d{2,})px/i.test(blockBody);
      if (hasBorderRadius && hasDirectionalBorder) {
        const { line, col } = getLineAndCol(content, cssBlock.index);
        rawViolations.push({
          rule: RULES.BORDER_ACCENT_ON_ROUNDED,
          file: filePath,
          line,
          col,
          snippet: blockBody.trim().replace(/\s+/g, ' ').slice(0, 80),
          advice: RULE_MESSAGES[RULES.BORDER_ACCENT_ON_ROUNDED].advice,
        });
      }
    }
  }

  // Deduplicate violations on exact same rule + file + line
  const uniqueViolations = [];
  const seen = new Set();
  for (const v of rawViolations) {
    const key = `${v.rule}:${v.file}:${v.line}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueViolations.push(v);
    }
  }

  return uniqueViolations;
}

/**
 * Recursively collects candidate source files in directory.
 */
function collectFiles(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        collectFiles(fullPath, fileList);
      }
    } else if (entry.isFile() && /\.(?:tsx?|jsx?|css|html)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * Runs the linter on target directory.
 */
export function runLinter(targetDir = 'src/client') {
  const rootDir = process.cwd();
  const absTarget = path.isAbsolute(targetDir) ? targetDir : path.join(rootDir, targetDir);

  if (!fs.existsSync(absTarget)) {
    console.error(`[UI Linter Error] Target directory does not exist: ${absTarget}`);
    return { totalViolations: 0, fileCount: 0, violations: [] };
  }

  const files = collectFiles(absTarget);
  const allViolations = [];

  for (const file of files) {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    allViolations.push(...lintContent(content, relPath));
  }

  return {
    totalViolations: allViolations.length,
    fileCount: files.length,
    violations: allViolations,
  };
}

// CLI Execution if executed directly
const isDirectCli = process.argv[1] && (
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
);

if (isDirectCli) {
  const targetDir = process.argv[2] || 'src/client';
  console.log(`\n🔍 [UI Linter] Scanning ${targetDir} for Impeccable Anti-patterns...`);

  const { totalViolations, fileCount, violations } = runLinter(targetDir);

  if (totalViolations === 0) {
    console.log(`✅ [UI Linter] Clean! 0 Anti-patterns detected across ${fileCount} files.\n`);
    process.exit(0);
  } else {
    console.error(`\n❌ [UI Linter] Found ${totalViolations} Anti-pattern violations in ${targetDir}:\n`);
    for (const v of violations) {
      console.error(`  - [${v.rule}] ${v.file}:${v.line}:${v.col}`);
      console.error(`    Snippet: "${v.snippet}"`);
      console.error(`    Advice:  ${v.advice}\n`);
    }
    process.exit(1);
  }
}
