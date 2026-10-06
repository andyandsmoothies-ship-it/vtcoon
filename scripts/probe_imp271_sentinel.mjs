#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const testSuite = 'tests/contracts/imp271_urban_planning_rent_boost.test.ts';

const MUTANTS = [
  {
    id: 1,
    name: 'Mutant 1: multiplier: 1.5 -> multiplier: 1.0',
    file: 'src/domain/market_card_handlers.ts',
    target: 'remainingRounds: 2, multiplier: 1.5',
    replacement: 'remainingRounds: 2, multiplier: 1.0',
    expectedKiller: 'TC-271.01 or TC-271.02/03/04/06/11',
  },
  {
    id: 2,
    name: 'Mutant 2: multiplier: 1.5 -> multiplier: 2.0',
    file: 'src/domain/market_card_handlers.ts',
    target: 'remainingRounds: 2, multiplier: 1.5',
    replacement: 'remainingRounds: 2, multiplier: 2.0',
    expectedKiller: 'TC-271.01 or TC-271.02/03/04/06/11',
  },
  {
    id: 3,
    name: 'Mutant 3: remainingRounds: 2 -> remainingRounds: 1',
    file: 'src/domain/market_card_handlers.ts',
    target: 'remainingRounds: 2, multiplier: 1.5',
    replacement: 'remainingRounds: 1, multiplier: 1.5',
    expectedKiller: 'TC-271.01 or TC-271.08',
  },
  {
    id: 4,
    name: 'Mutant 4: remainingRounds: 2 -> remainingRounds: 0',
    file: 'src/domain/market_card_handlers.ts',
    target: 'remainingRounds: 2, multiplier: 1.5',
    replacement: 'remainingRounds: 0, multiplier: 1.5',
    expectedKiller: 'TC-271.01, TC-271.02, or TC-271.08',
  },
  {
    id: 5,
    name: 'Mutant 5: affectedCells: HANOI_HCMC_CELLS -> []',
    file: 'src/domain/market_card_handlers.ts',
    target: 'affectedCells: HANOI_HCMC_CELLS, remainingRounds: 2, multiplier: 1.5',
    replacement: 'affectedCells: [], remainingRounds: 2, multiplier: 1.5',
    expectedKiller: 'TC-271.01 or property landing/rent tests',
  },
  {
    id: 6,
    name: 'Mutant 6: affectedCells: HANOI_HCMC_CELLS -> [31]',
    file: 'src/domain/market_card_handlers.ts',
    target: 'affectedCells: HANOI_HCMC_CELLS, remainingRounds: 2, multiplier: 1.5',
    replacement: 'affectedCells: [31], remainingRounds: 2, multiplier: 1.5',
    expectedKiller: 'TC-271.01, TC-271.02, TC-271.03, TC-271.06, TC-271.11',
  },
  {
    id: 7,
    name: "Mutant 7: duration: '2 vòng chơi' -> '1 vòng chơi'",
    file: 'src/domain/event_card_metadata.ts',
    target: `  [MarketCardId.MC_URBAN_PLANNING]: {
    description: 'Quy hoạch trung tâm tài chính mới công bố, nhân 1.5x tiền thuê và tăng 20% giá trị khi thế chấp các BĐS lõi trung tâm.',
    targetScope: 'Bất động sản trung tâm Hà Nội và TP.HCM (Nhóm Xanh Lá & Tím)',
    effectDetail: 'Nhân 1.5x tiền thuê (x1.5) và tăng 20% giá trị khi thế chấp (nhận 60% thay vì 50% giá niêm yết) trong 2 vòng',
    duration: '2 vòng chơi',`,
    replacement: `  [MarketCardId.MC_URBAN_PLANNING]: {
    description: 'Quy hoạch trung tâm tài chính mới công bố, nhân 1.5x tiền thuê và tăng 20% giá trị khi thế chấp các BĐS lõi trung tâm.',
    targetScope: 'Bất động sản trung tâm Hà Nội và TP.HCM (Nhóm Xanh Lá & Tím)',
    effectDetail: 'Nhân 1.5x tiền thuê (x1.5) và tăng 20% giá trị khi thế chấp (nhận 60% thay vì 50% giá niêm yết) trong 2 vòng',
    duration: '1 vòng chơi',`,
    expectedKiller: 'TC-271.10',
  },
  {
    id: 8,
    name: "Mutant 8: effectDetail không chứa '1.5x tiền thuê'",
    file: 'src/domain/event_card_metadata.ts',
    target: `    effectDetail: 'Nhân 1.5x tiền thuê (x1.5) và tăng 20% giá trị khi thế chấp (nhận 60% thay vì 50% giá niêm yết) trong 2 vòng',`,
    replacement: `    effectDetail: 'Tăng 20% giá trị khi thế chấp (nhận 60% thay vì 50% giá niêm yết) trong 2 vòng',`,
    expectedKiller: 'TC-271.10',
  },
];

console.log('🚀 [Station 4 Chaos Sentinel] Starting Mutation Sensitivity Probe for IMP-271...\n');

// Step 1: Baseline verification
console.log('--- Step 1: Baseline Contract Test Execution ---');
try {
  const baseOut = execSync(`npx vitest run ${testSuite} --reporter=json`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, VITEST_PROBE: '1' },
  });
  const jsonStart = baseOut.indexOf('{');
  const parsed = JSON.parse(baseOut.slice(jsonStart));
  console.log(`✅ Baseline passed: ${parsed.numPassedTests}/${parsed.numTotalTests} tests passed.\n`);
  if (parsed.numPassedTests !== 12) {
    throw new Error(`Expected 12 tests to pass in baseline, but got ${parsed.numPassedTests}`);
  }
} catch (e) {
  console.error('❌ Baseline run failed:', e.message);
  process.exit(1);
}

// Step 2: Run mutation probes
console.log('--- Step 2: Executing 8 Adversarial Mutation Probes ---');
const details = [];
let mutantsKilled = 0;
let mutantsSurvived = 0;

for (const mutant of MUTANTS) {
  const fullPath = path.resolve(repoRoot, mutant.file);
  const original = fs.readFileSync(fullPath, 'utf8');

  if (!original.includes(mutant.target)) {
    console.error(`❌ Target pattern not found in ${mutant.file} for ${mutant.name}`);
    process.exit(1);
  }

  const mutated = original.replace(mutant.target, mutant.replacement);
  const backupPath = `${fullPath}.bak_${Date.now()}`;
  fs.writeFileSync(backupPath, original, 'utf8');

  let testOutput = '';
  let killed = false;
  let killerTest = 'Unknown';
  let failureSnippet = '';

  try {
    fs.writeFileSync(fullPath, mutated, 'utf8');
    try {
      testOutput = execSync(`npx vitest run ${testSuite} --reporter=json`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, VITEST_PROBE: '1' },
      });
      // If execSync did not throw, tests passed -> mutant survived!
      killed = false;
    } catch (testErr) {
      killed = true;
      testOutput = (testErr.stdout || '') + (testErr.stderr || '');
      const jsonStart = testOutput.indexOf('{');
      if (jsonStart !== -1) {
        try {
          const res = JSON.parse(testOutput.slice(jsonStart));
          const failedTest = res.testResults?.[0]?.assertionResults?.find(a => a.status === 'failed');
          if (failedTest) {
            killerTest = failedTest.title;
            failureSnippet = (failedTest.failureMessages?.[0] || '').split('\n').slice(0, 3).join(' ').trim();
          }
        } catch {}
      }
      if (killerTest === 'Unknown') {
        const match = testOutput.match(/AssertionError:[^\n]+/);
        if (match) failureSnippet = match[0];
      }
    }
  } finally {
    // Unconditional rollback guarantee
    if (fs.existsSync(backupPath)) {
      const restored = fs.readFileSync(backupPath, 'utf8');
      fs.writeFileSync(fullPath, restored, 'utf8');
      fs.unlinkSync(backupPath);
    }
  }

  if (killed) {
    mutantsKilled++;
    console.log(`  [MUTANT ${mutant.id}] KILLED 🎯`);
    console.log(`    - Description: ${mutant.name}`);
    console.log(`    - Killer Test: ${killerTest}`);
    console.log(`    - Snippet: ${failureSnippet || 'AssertionError caught'}\n`);
    details.push({
      mutantId: mutant.id,
      name: mutant.name,
      file: mutant.file,
      status: 'KILLED',
      killerTest,
      failureSnippet: failureSnippet || 'AssertionError caught',
    });
  } else {
    mutantsSurvived++;
    console.log(`  [MUTANT ${mutant.id}] SURVIVED ⚠️ (DEFECT)`);
    console.log(`    - Description: ${mutant.name}\n`);
    details.push({
      mutantId: mutant.id,
      name: mutant.name,
      file: mutant.file,
      status: 'SURVIVED',
      killerTest: null,
      failureSnippet: 'None - tests passed with mutated code',
    });
  }
}

// Step 3: Verify post-mutation baseline
console.log('--- Step 3: Post-Probe Integrity Verification ---');
const postOut = execSync(`npx vitest run ${testSuite} --reporter=json`, {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, VITEST_PROBE: '1' },
});
const postParsed = JSON.parse(postOut.slice(postOut.indexOf('{')));
if (postParsed.numPassedTests !== 12) {
  console.error('❌ Post-probe verification failed! Codebase left dirty.');
  process.exit(1);
}
console.log('✅ Post-probe integrity confirmed: All 12 tests passed, 0 production files polluted.\n');

// Step 4: Write Evidence JSON
const killRate = mutantsKilled / MUTANTS.length;
console.log(`--- Step 4: Evidence Synthesis ---`);
console.log(`Total Tested: ${MUTANTS.length}`);
console.log(`Killed: ${mutantsKilled}`);
console.log(`Survived: ${mutantsSurvived}`);
console.log(`Kill Rate: ${(killRate * 100).toFixed(1)}%\n`);

if (mutantsSurvived > 0 || killRate < 1.0) {
  console.error('❌ Chaos Sentinel Gate Rejected: Mutants survived.');
  process.exit(1);
}

const evidenceData = {
  ticketId: 'IMP-271',
  isMicroSlice: true,
  pureLogicWaiver: true,
  pureLogicWaiverReason: 'Pure domain logic & metadata update, zero DOM/visual changes',
  executed: true,
  verdict: 'PASSED',
  mutationSensitivityProbe: {
    status: 'PASS',
    mutantsTested: MUTANTS.length,
    mutantsKilled,
    mutantsSurvived,
    killRate,
    details,
  },
  contractTests: {
    file: testSuite,
    total: 12,
    passed: 12,
  },
  testExecutionSummary: {
    contractSuite: testSuite,
    contractTestsPassed: 12,
  },
};

const evidenceDir = path.resolve(repoRoot, '.agents', 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });
const evidencePath = path.join(evidenceDir, 'chaos_sentinel_IMP-271.json');
fs.writeFileSync(evidencePath, JSON.stringify(evidenceData, null, 2), 'utf8');
console.log(`✅ Evidence persisted to: ${evidencePath}\n`);
