import fs from 'node:fs';
import path from 'node:path';
import { SLOP_RULES, TIER_BUDGETS, categorizeFile, getSourceFiles } from './slop_constants.mjs';

/**
 * Inspects raw line text for LOC ceilings and forbidden workaround comments.
 */
export function lintTextRules(content, filePath, errors, warnings) {
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
}

/**
 * Checks for production files imported only in tests with zero consumers in src.
 */
export function lintOrphanProductionFiles(targetDir, files, errors) {
  if (targetDir !== 'src' && !targetDir.startsWith('src')) return;

  const srcFiles = files.filter(f => f.replace(/\\/g, '/').startsWith('src/'));
  if (srcFiles.length === 0) return;
  const testFiles = fs.existsSync('tests') ? getSourceFiles('tests') : [];
  const allSrcFiles = fs.existsSync('src') ? getSourceFiles('src') : srcFiles;
  const allSrcContent = allSrcFiles.map((f) => ({ file: f, content: fs.readFileSync(f, 'utf8') }));
  const allTestContent = testFiles.map((f) => ({ file: f, content: fs.readFileSync(f, 'utf8') }));
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
    const isImportedInSrc = allSrcContent.some((other) => {
      if (other.file === file) return false;
      return new RegExp(`from\\s+['"][^'"]*\\b${base}(?:\\.js)?['"]`).test(other.content) ||
             new RegExp(`import\\s*\\(['"][^'"]*\\b${base}(?:\\.js)?['"]\\)`).test(other.content);
    });
    const isImportedInTests = allTestContent.some((t) => {
      return new RegExp(`from\\s+['"][^'"]*\\b${base}(?:\\.js)?['"]`).test(t.content) ||
             new RegExp(`import\\s*\\(['"][^'"]*\\b${base}(?:\\.js)?['"]\\)`).test(t.content);
    });

    if (!isImportedInSrc && isImportedInTests) {
      errors.push({
        rule: SLOP_RULES.ZERO_ORPHAN_PRODUCTION_FILES,
        file,
        line: 1,
        message: `Anti-TIDD Violation: Production file "${norm}" is imported in tests/** but has ZERO consumers in src/**. Move to tests/** or delete.`,
      });
    }
  }
}
