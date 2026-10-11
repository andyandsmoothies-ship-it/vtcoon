import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadTargetedProbes } from './probe_config_loader.mjs';

/**
 * Recovers orphaned backups and cleans up leftover test sandboxes.
 */
export function cleanupStaleBackups(targetDir) {
  if (!fs.existsSync(targetDir)) return;
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      cleanupStaleBackups(fullPath);
    } else if (entry.name.includes('.sentinel_bak_')) {
      const originalPath = fullPath.replace(/\.sentinel_bak_\d+$/, '');
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        fs.writeFileSync(originalPath, content, 'utf8');
        fs.unlinkSync(fullPath);
        console.log(`[RECOVERY] Restored orphaned backup: ${originalPath}`);
      }
    } else if (entry.name.includes('.tmp_mutant_sandbox_')) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`[RECOVERY] Removed orphaned mutant sandbox: ${fullPath}`);
      } catch {}
    }
  }
}

/**
 * Applies a single source mutant with atomic backup and signal-safe restoration.
 */
export function testSourceMutantSafely(filePath, targetPattern, replacement, testCmd) {
  if (!fs.existsSync(filePath)) return { tested: false, killed: false };

  const originalContent = fs.readFileSync(filePath, 'utf-8');
  const hasMatch = typeof targetPattern === 'string'
    ? originalContent.includes(targetPattern)
    : targetPattern.test(originalContent);

  if (!hasMatch) return { tested: false, killed: false };

  const backupPath = `${filePath}.sentinel_bak_${Date.now()}`;
  fs.writeFileSync(backupPath, originalContent, 'utf-8');

  const restore = () => {
    if (fs.existsSync(backupPath)) {
      const restored = fs.readFileSync(backupPath, 'utf-8');
      fs.writeFileSync(filePath, restored, 'utf-8');
      fs.unlinkSync(backupPath);
    }
  };

  const sigintHandler = () => { restore(); process.exit(1); };
  process.on('SIGINT', sigintHandler);
  process.on('SIGTERM', sigintHandler);

  try {
    const mutated = originalContent.replace(targetPattern, replacement);
    fs.writeFileSync(filePath, mutated, 'utf-8');

    try {
      const isWin = process.platform === 'win32';
      const shellCmd = isWin ? 'cmd.exe' : 'npx';
      const shellArgs = isWin ? ['/c', testCmd] : ['vitest', 'run', ...testCmd.split(' ').slice(3)];

      const res = spawnSync(shellCmd, shellArgs, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 15000,
        env: { ...process.env, VITEST_PROBE: '1' },
      });

      const killed = res.status !== 0;
      return { tested: true, killed };
    } catch {
      return { tested: true, killed: true };
    }
  } finally {
    restore();
    process.removeListener('SIGINT', sigintHandler);
    process.removeListener('SIGTERM', sigintHandler);
  }
}

/**
 * Executes mutation sensitivity testing across AST source mutations and generic contract inversions.
 */
export function runRealMutationProbe(testPath, srcPath, ticketId) {
  if (!srcPath || !testPath || !fs.existsSync(srcPath) || !fs.existsSync(testPath)) {
    return {
      status: 'BLOCKED: MISSING_ARGS',
      mutantsTested: 0,
      killed: 0,
      survived: 0,
      sourceLevelMutantsTested: 0,
    };
  }

  const testCmd = `npx --yes vitest run ${testPath}`;
  const isWin = process.platform === 'win32';
  const shellCmd = isWin ? 'cmd.exe' : 'npx';

  const targetedRules = loadTargetedProbes(ticketId);

  const sourceMutationRules = [
    { target: ' === ', replacement: ' !== ' },
    { target: ' !== ', replacement: ' === ' },
    { target: ' >= ', replacement: ' < ' },
    { target: ' <= ', replacement: ' > ' },
    { target: ' > ', replacement: ' <= ' },
    { target: ' < ', replacement: ' >= ' },
    { target: 'return true;', replacement: 'return false;' },
    { target: 'return false;', replacement: 'return true;' },
    { target: 'Number.isFinite', replacement: '!Number.isFinite' },
    { target: ' && ', replacement: ' || ' },
    { target: ' || ', replacement: ' && ' },
    { target: 'Math.max(', replacement: 'Math.min(' },
    { target: 'Math.min(', replacement: 'Math.max(' },
    { target: ' + ', replacement: ' - ' },
    { target: ' - ', replacement: ' + ' },
    { target: 'Math.exp(-', replacement: 'Math.exp(' },
    { target: 'return [];', replacement: 'return [{ id: "__MUTANT__", cellIndex: 0, isVisible: true, opacity: 1 }];' },
    { target: '0.0001', replacement: '1000' },
  ];

  let mutantsTested = 0;
  let killed = 0;
  let sourceLevelMutantsTested = 0;
  const survivedList = [];

  // 1. Source-Level Mutations
  if (targetedRules && targetedRules.length > 0) {
    for (const rule of targetedRules) {
      const res = testSourceMutantSafely(rule.file || srcPath, rule.target, rule.replacement, testCmd);
      if (res.tested) {
        mutantsTested++;
        sourceLevelMutantsTested++;
        if (res.killed) {
          console.log(`  [AST SOURCE MUTANT] ${rule.desc}: KILLED`);
          killed++;
        } else {
          console.log(`  [AST SOURCE MUTANT] ${rule.desc}: SURVIVED!`);
          survivedList.push(`AST SOURCE: ${rule.desc}`);
        }
      }
    }
  } else {
    for (const rule of sourceMutationRules) {
      const res = testSourceMutantSafely(srcPath, rule.target, rule.replacement, testCmd);
      if (res.tested) {
        mutantsTested++;
        sourceLevelMutantsTested++;
        if (res.killed) {
          console.log(`  [SOURCE MUTANT] "${rule.target}" -> "${rule.replacement}": KILLED`);
          killed++;
        } else {
          console.log(`  [SOURCE MUTANT] "${rule.target}" -> "${rule.replacement}": SURVIVED!`);
          survivedList.push(`SOURCE: ${rule.target}`);
        }
      }
    }
  }

  // 2. Generic Contract Inversion Testing (on sandbox test copy)
  const originalTestContent = fs.readFileSync(testPath, 'utf-8');
  const sandboxDir = path.dirname(path.resolve(testPath));
  const sandboxPath = path.join(sandboxDir, `.tmp_mutant_sandbox_${Date.now()}.test.ts`);

  const genericMutators = [
    { name: 'toBe(true) -> toBe(false)', pattern: '.toBe(true)', replacement: '.toBe(false)' },
    { name: 'toBe(false) -> toBe(true)', pattern: '.toBe(false)', replacement: '.toBe(true)' },
    { name: 'toBe(number) -> +9999', pattern: /\.toBe\((\d+)\)/, replacement: (_m, n) => `.toBe(${Number(n) + 9999})` },
    { name: 'toContain -> not.toContain', pattern: /(?<!\.not)\.toContain\(/, replacement: '.not.toContain(' },
    { name: 'toBeGreaterThan -> toBeLessThan', pattern: '.toBeGreaterThan(', replacement: '.toBeLessThan(' },
    { name: 'toBeLessThan -> toBeGreaterThan', pattern: '.toBeLessThan(', replacement: '.toBeGreaterThan(' },
    { name: 'toBeGreaterThanOrEqual -> toBeLessThan', pattern: '.toBeGreaterThanOrEqual(', replacement: '.toBeLessThan(' },
    { name: 'toBeLessThanOrEqual -> toBeGreaterThan', pattern: '.toBeLessThanOrEqual(', replacement: '.toBeGreaterThan(' },
    { name: 'toBeCloseTo -> corrupted', pattern: /\.toBeCloseTo\([^)]+\)/, replacement: '.toBeCloseTo(99999.99, 1)' },
    { name: 'toEqual -> not.toEqual', pattern: /(?<!\.not)\.toEqual\(/, replacement: '.not.toEqual(' },
    { name: 'toBeDefined -> toBeUndefined', pattern: '.toBeDefined()', replacement: '.toBeUndefined()' },
    { name: 'toBeTruthy -> toBeFalsy', pattern: '.toBeTruthy()', replacement: '.toBeFalsy()' },
  ];

  const sigintSandboxHandler = () => {
    try {
      if (fs.existsSync(sandboxPath)) fs.unlinkSync(sandboxPath);
    } catch {}
    process.exit(1);
  };
  process.on('SIGINT', sigintSandboxHandler);
  process.on('SIGTERM', sigintSandboxHandler);

  try {
    for (const { name, pattern, replacement } of genericMutators) {
      const hasMatch = typeof pattern === 'string'
        ? originalTestContent.includes(pattern)
        : pattern.test(originalTestContent);

      if (hasMatch) {
        mutantsTested++;
        const mutantContent = typeof replacement === 'string'
          ? originalTestContent.replace(pattern, replacement)
          : originalTestContent.replace(pattern, replacement);

        fs.writeFileSync(sandboxPath, mutantContent, 'utf-8');

        try {
          const shellArgs = isWin ? ['/c', `npx --yes vitest run "${sandboxPath}"`] : ['vitest', 'run', sandboxPath];
          const res = spawnSync(shellCmd, shellArgs, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 15000,
            env: { ...process.env, VITEST_PROBE: '1' },
          });
          if (res.status !== 0) {
            console.log(`  [CONTRACT MUTANT] ${name}: KILLED`);
            killed++;
          } else {
            console.log(`  [CONTRACT MUTANT] ${name}: SURVIVED!`);
            survivedList.push(`CONTRACT: ${name}`);
          }
        } catch {
          console.log(`  [CONTRACT MUTANT] ${name}: KILLED (exception)`);
          killed++;
        }
      }
    }
  } finally {
    process.removeListener('SIGINT', sigintSandboxHandler);
    process.removeListener('SIGTERM', sigintSandboxHandler);
    try {
      if (fs.existsSync(sandboxPath)) fs.unlinkSync(sandboxPath);
    } catch {}
  }

  const survived = mutantsTested - killed;
  const isFloorMet = mutantsTested >= 14 && killed >= 14;
  const status = isFloorMet && survived === 0
    ? 'PASS'
    : isFloorMet
      ? 'BLOCKED: SURVIVED_MUTANT'
      : 'BLOCKED: MUTANT_FLOOR_NOT_MET';

  return {
    status,
    mutantsTested,
    killed,
    survived,
    sourceLevelMutantsTested,
    survivedList,
  };
}
