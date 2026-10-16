import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { createTicketMatcher } from './evidence_resolver.mjs';

/**
 * Scans a test file for tautological patterns (inline mutant throws, unmounted fake timers, or mocking target subject modules).
 */
export function scanForTautology(filePath, targetFiles = []) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');

  // Detects inline mutant pattern: expect(() => { expect(mutant...).toBe(...); }).toThrow()
  const tautologyPattern = /expect\(\s*\(\)\s*=>\s*\{?\s*expect\([^)]+\)\.toBe\([^)]+\);?\s*\}?\s*\)\.toThrow\(\)/;
  if (tautologyPattern.test(content)) {
    return 'Inline mutant self-throw detected. Probe 3 must test real production code with adversarial inputs.';
  }

  // Detects tautological timer pattern: local setTimeout tested with advanceTimersByTime without component/store
  const tautologicalTimerPattern = /(?:const|let|var)\s+\w+\s*=\s*setTimeout\s*\([^)]*=>\s*\{[^}]*\}\s*,\s*[A-Za-z0-9_]+\s*\)[\s\S]*?vi\.advanceTimersByTime/;
  if (tautologicalTimerPattern.test(content) && !/(?:render\(|createRoot|act\(|useGameStore)/.test(content)) {
    return 'Tautological timer test detected: file defines local setTimeout() without mounting a component or invoking a production store/function.';
  }

  // Anti-Self-Mocking: forbid vi.mock() / jest.mock() on any production module in targetFiles
  const prodTargets = (targetFiles || [])
    .filter((f) => /^(?:src|lib|app)[\\/]/i.test(f))
    .map((f) => path.basename(f).replace(/\.[a-z0-9]+$/i, ''));
  if (prodTargets.length > 0) {
    const mockRegex = /\b(?:vi|jest)\.mock\(\s*['"`]([^'"`]+)['"`]/g;
    let m;
    while ((m = mockRegex.exec(content)) !== null) {
      const mockedBase = path.basename(m[1]).replace(/\.[a-z0-9]+$/i, '');
      if (prodTargets.includes(mockedBase)) {
        return `Target-Module Mock Ban violation: Test mocks target production module '${m[1]}'. Contract tests must test real target modules, never mock the subject under test.`;
      }
    }
  }
  return null;
}

/**
 * Scans atomic test assertion density (<= 4 expects per test).
 */
export function scanAssertDensity(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  const lines = content.split('\n');
  let currentTest = null;
  let expectCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/\sit\(['"`](.+?)['"`]/);
    if (match) {
      if (currentTest && expectCount > 4) {
        violations.push(`Test '${currentTest}' has ${expectCount} expect() calls (maximum 4 allowed).`);
      }
      currentTest = match[1];
      expectCount = 0;
    }
    const count = (line.match(/expect\(/g) || []).length;
    expectCount += count;
  }
  if (currentTest && expectCount > 4) {
    violations.push(`Test '${currentTest}' has ${expectCount} expect() calls (maximum 4 allowed).`);
  }
  return violations;
}

/**
 * Audits test execution, floor parity, and Station 1 handoff.
 */
export function auditTestExecution(evidence, repoRoot, targetArg) {
  const errors = [];
  const summary = evidence.testExecutionSummary || {};
  const probeSuite = summary.probeSuite ? path.resolve(repoRoot, summary.probeSuite) : null;
  const contractSuite = summary.contractSuite ? path.resolve(repoRoot, summary.contractSuite) : null;
  const targetFiles = evidence.targetFiles || evidence.modifiedFiles || [];

  // 1. Probe Suite Verification
  if (probeSuite) {
    if (!fs.existsSync(probeSuite)) {
      errors.push(`Probe suite file not found: ${summary.probeSuite}`);
    } else {
      const tautologyErr = scanForTautology(probeSuite, targetFiles);
      if (tautologyErr) errors.push(`[Tautology Violation] ${summary.probeSuite}: ${tautologyErr}`);
      const densityViolations = scanAssertDensity(probeSuite);
      densityViolations.forEach((v) => errors.push(`[Assert Density Violation] ${summary.probeSuite}: ${v}`));

      try {
        const vitestCmd = `npx --yes vitest run ${summary.probeSuite} --reporter=json`;
        const output = execSync(vitestCmd, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, VITEST_PROBE: '1' },
        });
        const jsonStart = output.indexOf('{');
        if (jsonStart !== -1) {
          const result = JSON.parse(output.slice(jsonStart));
          const passedCount = result.numPassedTests ?? 0;
          if (summary.probeTestsPassed !== undefined && passedCount !== summary.probeTestsPassed) {
            errors.push(`Probe test count mismatch: JSON claims ${summary.probeTestsPassed}, actual run passed ${passedCount}.`);
          }
          if (passedCount < 14) {
            errors.push(`Probe floor violation: Probe suite has ${passedCount} tests, minimum requirement is 14 tests.`);
          }
        }
      } catch (err) {
        errors.push(`Probe suite execution failed: ${err.message?.split('\n')[0]}`);
      }
    }
  }

  // 2. Contract Suite Verification
  const effectiveContractFile = contractSuite || (evidence.contractTests?.file ? path.resolve(repoRoot, evidence.contractTests.file) : null);

  if (effectiveContractFile) {
    if (!fs.existsSync(effectiveContractFile)) {
      errors.push(`Contract suite file not found: ${effectiveContractFile}`);
    } else {
      const contractTautologyErr = scanForTautology(effectiveContractFile, targetFiles);
      if (contractTautologyErr) errors.push(`[Tautology Violation] ${effectiveContractFile}: ${contractTautologyErr}`);
      const densityViolations = scanAssertDensity(effectiveContractFile);
      densityViolations.forEach((v) => errors.push(`[Assert Density Violation] ${effectiveContractFile}: ${v}`));

      try {
        const relPath = path.relative(repoRoot, effectiveContractFile).replace(/\\/g, '/');
        const vitestCmd = `npx --yes vitest run ${relPath} --reporter=json`;
        const output = execSync(vitestCmd, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, VITEST_PROBE: '1' },
        });
        const jsonStart = output.indexOf('{');
        if (jsonStart !== -1) {
          const result = JSON.parse(output.slice(jsonStart));
          const passedCount = result.numPassedTests ?? 0;
          const expectedPassed = summary.contractTestsPassed ?? evidence.contractTests?.passed ?? evidence.contractTests?.total;
          if (expectedPassed !== undefined && passedCount !== expectedPassed) {
            errors.push(`Contract test count mismatch: Claims ${expectedPassed}, actual run passed ${passedCount}.`);
          }
          const minContractFloor = 5;
          if (passedCount < minContractFloor) {
            errors.push(`Contract floor violation: Contract suite has ${passedCount} tests, minimum sanity floor is ${minContractFloor} atomic tests.`);
          }
        }
      } catch (err) {
        errors.push(`Contract suite execution failed: ${err.message?.split('\n')[0]}`);
      }
    }
  }

  // 3. Station 1 Mechanical Evidence Handoff Verification
  const { ticketNum, matchesTicket } = createTicketMatcher(evidence, targetArg);
  const evidenceDir = path.join(repoRoot, '.agents', 'evidence');
  if (ticketNum && fs.existsSync(evidenceDir)) {
    const station1File = fs.readdirSync(evidenceDir).find(
      (f) => f.toLowerCase().startsWith('station1_') && matchesTicket(f) && f.endsWith('.json')
    );
    if (station1File) {
      try {
        const s1Data = JSON.parse(fs.readFileSync(path.join(evidenceDir, station1File), 'utf8'));
        if (!s1Data.executed || !s1Data.redVerified) {
          errors.push(`[Station 1 Evidence Violation] ${station1File}: redVerified or executed is false.`);
        }
        if (s1Data.testCount && summary.contractTestsPassed !== undefined && s1Data.testCount !== summary.contractTestsPassed) {
          errors.push(`[Station 1 Parity Violation] Station 1 claims ${s1Data.testCount} tests, but Station 4 contract suite passed ${summary.contractTestsPassed}.`);
        }
        if (s1Data.testFileSha256 && effectiveContractFile && fs.existsSync(effectiveContractFile)) {
          const normalizedContent = fs.readFileSync(effectiveContractFile, 'utf8').replace(/\r\n/g, '\n');
          const actualSha256 = crypto.createHash('sha256').update(normalizedContent, 'utf8').digest('hex');
          if (actualSha256 !== s1Data.testFileSha256) {
            errors.push(`[Test Tampering Violation] Contract test file SHA-256 (${actualSha256.slice(0, 12)}...) does not match Station 1 locked hash (${s1Data.testFileSha256.slice(0, 12)}...). Implementer is forbidden from altering QA contract tests.`);
          }
        }
      } catch (e) {
        errors.push(`[Station 1 Evidence Violation] Failed to parse ${station1File}: ${e.message}`);
      }
    }
  }

  return errors;
}
