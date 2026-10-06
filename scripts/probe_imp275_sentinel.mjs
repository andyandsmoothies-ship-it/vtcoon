#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const testSuite = 'tests/contracts/imp275_rate_hike_upgrade_cost.test.ts';

const MUTANTS = [
  {
    id: 1,
    name: 'Mutant 1: Math.floor(cost * 1.2) -> Math.floor(cost * 1.0)',
    file: 'src/domain/property_upgrade.ts',
    target: 'cost = Math.floor(cost * 1.2);',
    replacement: 'cost = Math.floor(cost * 1.0);',
    expectedKiller: 'TC-275.02',
  },
  {
    id: 2,
    name: 'Mutant 2: Math.floor(cost * 1.2) -> Math.floor(cost * 1.5)',
    file: 'src/domain/property_upgrade.ts',
    target: 'cost = Math.floor(cost * 1.2);',
    replacement: 'cost = Math.floor(cost * 1.5);',
    expectedKiller: 'TC-275.02',
  },
  {
    id: 3,
    name: 'Mutant 3: Math.floor(cost * 1.2) -> Math.floor(cost * 1.1)',
    file: 'src/domain/property_upgrade.ts',
    target: 'cost = Math.floor(cost * 1.2);',
    replacement: 'cost = Math.floor(cost * 1.1);',
    expectedKiller: 'TC-275.02',
  },
  {
    id: 4,
    name: 'Mutant 4: modifiers?.some(m => m.type === MarketCardId.MC_RATE_HIKE && m.remainingRounds > 0) -> false',
    file: 'src/domain/property_upgrade.ts',
    target: 'modifiers?.some((m) => m.type === MarketCardId.MC_RATE_HIKE && m.remainingRounds > 0)',
    replacement: 'false',
    expectedKiller: 'TC-275.02',
  },
  {
    id: 5,
    name: 'Mutant 5: remainingRounds: 2 -> remainingRounds: 1',
    file: 'src/domain/market_card_handlers.ts',
    target: 'type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2',
    replacement: 'type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1',
    expectedKiller: 'TC-275.01',
  },
  {
    id: 6,
    name: 'Mutant 6: remainingRounds: 2 -> remainingRounds: 0',
    file: 'src/domain/market_card_handlers.ts',
    target: 'type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2',
    replacement: 'type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 0',
    expectedKiller: 'TC-275.01',
  },
  {
    id: 7,
    name: 'Mutant 7: affectedCells: [] -> affectedCells: [19]',
    file: 'src/domain/market_card_handlers.ts',
    target: 'type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2',
    replacement: 'type: MarketCardId.MC_RATE_HIKE, affectedCells: [19], remainingRounds: 2',
    expectedKiller: 'TC-275.01',
  },
  {
    id: 8,
    name: "Mutant 8: duration: '2 vòng chơi' -> '1 vòng chơi'",
    file: 'src/domain/event_card_metadata.ts',
    target: `  [MarketCardId.MC_RATE_HIKE]: {
    description: 'Ngân hàng thắt chặt tiền tệ kiềm chế lạm phát, tăng 20% chi phí xây nhà và tăng lãi suất thế chấp khi qua ô Khởi Hành.',
    targetScope: 'Toàn bộ thị trường',
    effectDetail: 'Tăng 20% chi phí xây dựng công trình C1-C3 và tăng lãi suất vay thế chấp lên 10% khi vượt GO trong 2 vòng',
    duration: '2 vòng chơi',`,
    replacement: `  [MarketCardId.MC_RATE_HIKE]: {
    description: 'Ngân hàng thắt chặt tiền tệ kiềm chế lạm phát, tăng 20% chi phí xây nhà và tăng lãi suất thế chấp khi qua ô Khởi Hành.',
    targetScope: 'Toàn bộ thị trường',
    effectDetail: 'Tăng 20% chi phí xây dựng công trình C1-C3 và tăng lãi suất vay thế chấp lên 10% khi vượt GO trong 2 vòng',
    duration: '1 vòng chơi',`,
    expectedKiller: 'TC-275.09',
  },
];

console.log('🚀 [Station 4 Chaos Sentinel] Starting Mutation Sensitivity Probe for IMP-275...\n');

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

  // Normalize line endings for replacement match if needed
  const normalizedOriginal = original.replace(/\r\n/g, '\n');
  const normalizedTarget = mutant.target.replace(/\r\n/g, '\n');
  const normalizedReplacement = mutant.replacement.replace(/\r\n/g, '\n');

  if (!normalizedOriginal.includes(normalizedTarget)) {
    console.error(`❌ Target pattern not found in ${mutant.file} for ${mutant.name}`);
    process.exit(1);
  }

  const mutated = normalizedOriginal.replace(normalizedTarget, normalizedReplacement);
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

// Step 3: Verify post-probe integrity
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
  ticketId: 'IMP-275',
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
const evidencePath = path.join(evidenceDir, 'chaos_sentinel_IMP-275.json');
fs.writeFileSync(evidencePath, JSON.stringify(evidenceData, null, 2), 'utf8');
console.log(`✅ Evidence persisted to: ${evidencePath}\n`);
