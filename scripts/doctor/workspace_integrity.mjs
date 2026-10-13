import fs from 'node:fs';
import path from 'node:path';

/**
 * Recursively searches a directory for files matching a predicate.
 *
 * @param {string} dir
 * @param {(file: string) => boolean} predicate
 * @param {number} [maxDepth=5]
 * @returns {string[]}
 */
export function findFilesRecursively(dir, predicate, maxDepth = 5) {
  if (!fs.existsSync(dir) || maxDepth <= 0) return [];
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
          results.push(...findFilesRecursively(fullPath, predicate, maxDepth - 1));
        }
      } else if (predicate(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

/**
 * Checks project workspace integrity: essential directories, SSOT files, configs, and mutant debris.
 *
 * @param {string} [repoRoot=process.cwd()]
 * @returns {Array<{ category: string, name: string, status: 'PASS' | 'WARN' | 'FAIL', message: string, details?: string }>}
 */
export function checkWorkspaceIntegrity(repoRoot = process.cwd()) {
  const results = [];

  // 1. Essential Directories
  const hasSourceDir = ['src', 'lib', 'app'].some((d) => fs.existsSync(path.join(repoRoot, d)));
  const isTemplateRepo = fs.existsSync(path.join(repoRoot, 'rules_backup')) || fs.existsSync(path.join(repoRoot, 'package_snippets.json'));

  const requiredDirs = [
    'tests',
    'docs',
    'scripts',
    path.join('.agents', 'evidence'),
    path.join('.agents', 'audit'),
  ];
  if (!isTemplateRepo && !hasSourceDir) {
    requiredDirs.unshift('src');
  }

  const missingDirs = [];
  for (const d of requiredDirs) {
    const fullPath = path.join(repoRoot, d);
    if (!fs.existsSync(fullPath)) {
      if (d.startsWith('.agents')) {
        try {
          fs.mkdirSync(fullPath, { recursive: true });
        } catch {
          missingDirs.push(d);
        }
      } else {
        missingDirs.push(d);
      }
    }
  }

  if (missingDirs.length === 0) {
    const srcLabel = isTemplateRepo ? '(template repo mode)' : hasSourceDir ? '(source/tests/docs)' : '(.agents/, src/, tests/, docs/)';
    results.push({
      category: 'Workspace',
      name: 'Essential Directories',
      status: 'PASS',
      message: `All core project directories verified ${srcLabel}`
    });
  } else {
    results.push({
      category: 'Workspace',
      name: 'Essential Directories',
      status: 'FAIL',
      message: `Missing essential directories: ${missingDirs.join(', ')}`,
      details: 'Ensure the repository is cloned completely and required folders are present.'
    });
  }

  // 2. SSOT Feature Map
  const featureMapPath = path.join(repoRoot, 'docs', 'FEATURE_MAP.md');
  if (fs.existsSync(featureMapPath)) {
    const stats = fs.statSync(featureMapPath);
    if (stats.size > 1000) {
      results.push({
        category: 'Workspace',
        name: 'SSOT Feature Map',
        status: 'PASS',
        message: `docs/FEATURE_MAP.md verified (${(stats.size / 1024).toFixed(1)} KB)`
      });
    } else {
      results.push({
        category: 'Workspace',
        name: 'SSOT Feature Map',
        status: 'WARN',
        message: 'docs/FEATURE_MAP.md is suspiciously small or empty',
        details: 'Verify that the single source of truth matrix has not been truncated.'
      });
    }
  } else {
    results.push({
      category: 'Workspace',
      name: 'SSOT Feature Map',
      status: 'FAIL',
      message: 'Missing docs/FEATURE_MAP.md!',
      details: 'The Master Feature Map is mandatory per AGENTS CONSTITUTION.'
    });
  }

  // 3. Configurations
  const pkgPath = path.join(repoRoot, 'package.json');
  const snippetsPath = path.join(repoRoot, 'package_snippets.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      results.push({
        category: 'Workspace',
        name: 'Configuration (package.json)',
        status: 'PASS',
        message: `${pkgJson.name}@${pkgJson.version || '0.0.0'} (valid JSON)`
      });
    } catch (err) {
      results.push({
        category: 'Workspace',
        name: 'Configuration (package.json)',
        status: 'FAIL',
        message: 'Invalid package.json',
        details: err instanceof Error ? err.message : String(err)
      });
    }
  } else if (fs.existsSync(snippetsPath)) {
    results.push({
      category: 'Workspace',
      name: 'Configuration (package.json)',
      status: 'PASS',
      message: 'Template repository: package_snippets.json verified'
    });
  } else {
    results.push({
      category: 'Workspace',
      name: 'Configuration (package.json)',
      status: 'FAIL',
      message: 'Invalid or missing package.json',
      details: 'No package.json or package_snippets.json found in repository root.'
    });
  }

  // 4. Stale Mutant Artifacts Detection
  const mutantPred = (name) => name.includes('.mutant_backup') || name.endsWith('.mutant_backup') || name.endsWith('.backup_sentinel');
  const srcMutants = findFilesRecursively(path.join(repoRoot, 'src'), mutantPred);
  const testMutants = findFilesRecursively(path.join(repoRoot, 'tests'), mutantPred);
  const totalMutants = [...srcMutants, ...testMutants];

  if (totalMutants.length === 0) {
    results.push({
      category: 'Workspace',
      name: 'Mutant Backups Hygiene',
      status: 'PASS',
      message: 'Clean workspace: zero stale mutant backup files detected'
    });
  } else {
    results.push({
      category: 'Workspace',
      name: 'Mutant Backups Hygiene',
      status: 'WARN',
      message: `Found ${totalMutants.length} leftover mutant backup file(s)!`,
      details: totalMutants.slice(0, 3).map((f) => path.relative(repoRoot, f)).join(', ')
    });
  }

  return results;
}
