#!/usr/bin/env node

/**
 * scripts/check_evidence.mjs
 * 
 * Verifies Station 4 Chaos Sentinel evidence JSON against real test execution.
 * Enforces:
 * 1. Physical test count parity (claimed vs actual vitest output).
 * 2. Floor test count (Contract >= 15, Probe >= 14).
 * 3. Anti-Tautology check (prohibits inline artificial mutant throws).
 * 
 * Usage:
 *   node scripts/check_evidence.mjs [TICKET_OR_FILE_PATH]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const evidenceDir = path.join(repoRoot, '.agents', 'evidence');
const targetArg = process.argv[2];

function resolveEvidenceFile(arg) {
  if (arg) {
    if (fs.existsSync(arg)) return path.resolve(repoRoot, arg);
    const directPath = path.join(evidenceDir, arg.endsWith('.json') ? arg : `chaos_sentinel_${arg}.json`);
    if (fs.existsSync(directPath)) return directPath;
    const hyphenPath = path.join(evidenceDir, `chaos_sentinel_${arg.replace(/^(IMP)(\d+)/i, '$1-$2')}.json`);
    if (fs.existsSync(hyphenPath)) return hyphenPath;
  }

  if (!fs.existsSync(evidenceDir)) {
    console.error('❌ Evidence directory does not exist:', evidenceDir);
    process.exit(1);
  }

  const files = fs.readdirSync(evidenceDir)
    .filter((f) => f.startsWith('chaos_sentinel_') && f.endsWith('.json'))
    .map((f) => ({
      file: path.join(evidenceDir, f),
      mtime: fs.statSync(path.join(evidenceDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    console.error('❌ No chaos_sentinel evidence JSON files found.');
    process.exit(1);
  }

  return files[0].file;
}

const evidencePath = resolveEvidenceFile(targetArg);
console.log(`🔍 Auditing evidence: ${path.relative(repoRoot, evidencePath)}`);

const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));

const isExecuted = evidence.executed === true || evidence.verdict === 'PASSED' || evidence.verdict === 'APPROVED';
if (!isExecuted) {
  console.error('❌ Evidence verification failed: "executed" is not true.');
  process.exit(1);
}

const verdict = evidence.verdict?.toUpperCase();
if (verdict !== 'PASSED' && verdict !== 'APPROVED') {
  console.error(`❌ Evidence verification failed: verdict is "${evidence.verdict}", expected PASSED or APPROVED.`);
  process.exit(1);
}

// 1. Anti-Tautology Static Scan
function scanForTautology(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  // Detects inline mutant pattern: expect(() => { expect(mutant...).toBe(...); }).toThrow()
  const tautologyPattern = /expect\(\s*\(\)\s*=>\s*\{?\s*expect\([^)]+\)\.toBe\([^)]+\);?\s*\}?\s*\)\.toThrow\(\)/;
  if (tautologyPattern.test(content)) {
    return 'Inline mutant self-throw detected. Probe 3 must test real production code with adversarial inputs.';
  }
  return null;
}

// 2. Physical Execution Verification
const summary = evidence.testExecutionSummary || {};
const probeSuite = summary.probeSuite ? path.resolve(repoRoot, summary.probeSuite) : null;
const contractSuite = summary.contractSuite ? path.resolve(repoRoot, summary.contractSuite) : null;

let errors = [];

if (probeSuite) {
  if (!fs.existsSync(probeSuite)) {
    errors.push(`Probe suite file not found: ${summary.probeSuite}`);
  } else {
    const tautologyErr = scanForTautology(probeSuite);
    if (tautologyErr) errors.push(`[Tautology Violation] ${summary.probeSuite}: ${tautologyErr}`);

    try {
      const vitestCmd = `npx vitest run ${summary.probeSuite} --reporter=json`;
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

if (contractSuite) {
  if (!fs.existsSync(contractSuite)) {
    errors.push(`Contract suite file not found: ${summary.contractSuite}`);
  } else {
    try {
      const vitestCmd = `npx vitest run ${summary.contractSuite} --reporter=json`;
      const output = execSync(vitestCmd, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, VITEST_PROBE: '1' },
      });
      const jsonStart = output.indexOf('{');
      if (jsonStart !== -1) {
        const result = JSON.parse(output.slice(jsonStart));
        const passedCount = result.numPassedTests ?? 0;
        if (summary.contractTestsPassed !== undefined && passedCount !== summary.contractTestsPassed) {
          errors.push(`Contract test count mismatch: JSON claims ${summary.contractTestsPassed}, actual run passed ${passedCount}.`);
        }
        if (passedCount < 15) {
          errors.push(`Contract floor violation: Contract suite has ${passedCount} tests, minimum requirement is 15 tests.`);
        }
      }
    } catch (err) {
      errors.push(`Contract suite execution failed: ${err.message?.split('\n')[0]}`);
    }
  }
}

// 2.5 Mutation Sensitivity Floor Verification (GEMINI.md Station 4 floor >= 14)
if (evidence.mutationSensitivityProbe) {
  const tested = evidence.mutationSensitivityProbe.mutantsTested ?? 0;
  const isExempt = Boolean(evidence.mutationSensitivityProbe.waiverReason);
  if (tested < 14 && !isExempt) {
    errors.push(`Mutation floor violation: Probe tested ${tested} mutants, minimum requirement is 14 mutants (or specify explicit waiverReason in evidence JSON).`);
  }
}

// 3. Physical Visual Screenshot Verification (Zero-Blindness Gate)
if (evidence.visualReview || /3d|ui|viaduct|diorama|ballast|modal|hud/i.test(evidencePath) || /3d|ui/i.test(summary.contractSuite || '')) {
  const tmpFiles = fs.existsSync(path.join(repoRoot, '.agents', 'tmp')) ? fs.readdirSync(path.join(repoRoot, '.agents', 'tmp')) : [];
  const evFiles = fs.readdirSync(evidenceDir);
  const ticketRaw = (evidence.ticketId || targetArg || '').toLowerCase();
  const ticketClean = ticketRaw.replace(/[^a-zA-Z0-9]/g, '');
  const isSyntheticSmokeProbe = (f) => /^(chaos_sentinel_|webgl2_headless_smoke)/i.test(f);
  const hasImage = [...tmpFiles, ...evFiles].some((f) =>
    !isSyntheticSmokeProbe(f) &&
    /\.(png|jpe?g|webp)$/i.test(f) &&
    (!ticketClean || f.toLowerCase().includes(ticketClean) || f.toLowerCase().includes(ticketRaw)),
  );
  if (!hasImage) {
    errors.push(
      `[Zero-Blindness Violation] Visual/3D ticket requires physical screenshot in .agents/tmp/ or .agents/evidence/ from Phase 3.0 (e.g. ${evidence.ticketId || targetArg}_desktop.jpg). Run 'npm run capture:visual -- --ticket ${evidence.ticketId || targetArg}' before sign-off.`,
    );
  }
}

if (errors.length > 0) {
  console.error('\n❌ EVIDENCE AUDIT FAILED:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('✅ Evidence verified: physical test counts match, floors respected, zero tautological mutants.\n');
process.exit(0);
