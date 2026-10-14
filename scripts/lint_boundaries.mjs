#!/usr/bin/env node

/**
 * scripts/lint_boundaries.mjs
 * 
 * VTCOON Subsystem Boundary, Seam & Cycle Linter (Facade Entrypoint)
 * 
 * Enforces:
 * 1. Client/Server Boundary (Client MUST NOT import from Server internals)
 * 2. Deep relative import limits (Flagging >= 3 levels)
 * 3. Circular Dependency Detection (Tarjan's SCC)
 * 
 * Usage:
 *   node scripts/lint_boundaries.mjs [target_files...]
 *   node scripts/lint_boundaries.mjs --strict
 *   npm run lint:boundaries
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintFileBoundaries, detectCycles } from './boundary_linter/boundary_rules.mjs';
import { formatBoundaryResults } from './boundary_linter/boundary_reporter.mjs';
import { BOUNDARY_RULES, KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS } from './boundary_linter/boundary_constants.mjs';

export { BOUNDARY_RULES, KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS };

function getAllSourceFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllSourceFiles(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

export function runBoundaryLinter(args = process.argv.slice(2)) {
  const repoRoot = process.cwd();
  const isStrict = args.includes('--strict');
  const targetFiles = args.filter(a => !a.startsWith('--'));

  let filesToScan = [];
  if (targetFiles.length > 0) {
    filesToScan = targetFiles.map(f => path.resolve(repoRoot, f)).filter(f => fs.existsSync(f));
  } else {
    filesToScan = getAllSourceFiles(path.resolve(repoRoot, 'src'));
  }

  const allErrors = [];
  const allWarnings = [];

  for (const file of filesToScan) {
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) continue;
    const content = fs.readFileSync(file, 'utf8');
    const { errors, warnings } = lintFileBoundaries(file, content, repoRoot, isStrict);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  let cycles = [];
  // Only detect cycles when scanning whole codebase or more than 5 files
  if (filesToScan.length > 5) {
    cycles = detectCycles(filesToScan, repoRoot);
    if (isStrict && cycles.length > 0) {
      allErrors.push({
        rule: BOUNDARY_RULES.CIRCULAR_DEPENDENCY,
        file: 'src/',
        line: 0,
        message: `Found ${cycles.length} circular dependency cycles.`
      });
    }
  }

  const formattedOutput = formatBoundaryResults(allErrors, allWarnings, cycles);
  if (formattedOutput.trim().length > 0) {
    console.log(formattedOutput);
  }

  if (allErrors.length > 0) {
    console.error(`❌ HARD ERROR: Subsystem Boundary Linter failed with ${allErrors.length} violation(s).`);
    return false;
  }

  console.log(`✔️ [Subsystem Boundary Linter] Scanned ${filesToScan.length} files. Zero hard boundary violations.`);
  return true;
}

const currentFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFile);

if (invokedDirectly) {
  const success = runBoundaryLinter();
  process.exit(success ? 0 : 1);
}
