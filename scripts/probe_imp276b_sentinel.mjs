#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const testSuite = 'tests/contracts/imp276b_event_card_sync.test.ts';

const MUTANTS = [
  {
    id: 1,
    name: "Mutant 1: event_card_modal.tsx: detail?.targetScope bị xóa hoặc đổi thành hardcode '1 vòng chơi'",
    file: 'src/client/ui/modals/event_card_modal.tsx',
    target: `  const rawDenseScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));

  const rawTargetScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));`,
    replacement: `  const rawDenseScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || '1 vòng chơi' || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));

  const rawTargetScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || '1 vòng chơi' || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));`,
    expectedKiller: 'TC-276B.01',
  },
  {
    id: 2,
    name: "Mutant 2: market_event_ticker.tsx: ACTIVE_MARKET_EFFECT_SUMMARIES[MC_RATE_HIKE] bị đổi thành '' hoặc thiếu '20%'",
    file: 'src/client/ui/market_event_ticker.tsx',
    target: `  [MarketCardId.MC_RATE_HIKE]:
    'Tăng 20% chi phí xây nhà C1-C3 và thu lãi vay thế chấp 10% khi qua GO.',`,
    replacement: `  [MarketCardId.MC_RATE_HIKE]:
    'Thu lãi vay thế chấp 10% khi người chơi đi qua ô Khởi Hành (GO).',`,
    expectedKiller: 'TC-276B.05',
  },
  {
    id: 3,
    name: "Mutant 3: market_event_ticker.tsx: ACTIVE_MARKET_COMPACT_FORMULAS[MC_RATE_HIKE] bị đổi thành '' hoặc thiếu 'Xây nhà +20%'",
    file: 'src/client/ui/market_event_ticker.tsx',
    target: "  [MarketCardId.MC_RATE_HIKE]: 'Xây nhà +20%, Lãi vay 10%',",
    replacement: "  [MarketCardId.MC_RATE_HIKE]: 'Lãi thế chấp 10% qua GO',",
    expectedKiller: 'TC-276B.06',
  },
  {
    id: 4,
    name: "Mutant 4: event_card_punchy_summaries.ts: PUNCHY_EVENT_SUMMARIES[MC_RATE_HIKE] bị đổi thành '' hoặc thiếu 'Tăng 20% xây nhà'",
    file: 'src/client/ui/event_card_punchy_summaries.ts',
    target: "  [MarketCardId.MC_RATE_HIKE]: 'Tăng 20% xây nhà & thu lãi vay 10% tại GO',",
    replacement: "  [MarketCardId.MC_RATE_HIKE]: 'Thu lãi vay thế chấp 10% tại GO',",
    expectedKiller: 'TC-276B.07',
  },
  {
    id: 5,
    name: "Mutant 5: event_card_visuals.ts: KNOWN_HERO_STATS[MC_RATE_HIKE].value quay lại '10% QUA GO' (thiếu '+20% XÂY')",
    file: 'src/client/ui/modals/event_card_visuals.ts',
    target: "  [MarketCardId.MC_RATE_HIKE]: { label: 'THẮT CHẶT TIỀN TỆ', value: '+20% XÂY • 10% QUA GO', variant: 'warning' },",
    replacement: "  [MarketCardId.MC_RATE_HIKE]: { label: 'THẮT CHẶT TIỀN TỆ', value: '10% QUA GO', variant: 'warning' },",
    expectedKiller: 'TC-276B.04',
  },
  {
    id: 6,
    name: "Mutant 6: event_card_visuals.ts: KNOWN_HERO_STATS[MC_RATE_HIKE].label đổi thành 'LÃI SUẤT VAY MỚI'",
    file: 'src/client/ui/modals/event_card_visuals.ts',
    target: "  [MarketCardId.MC_RATE_HIKE]: { label: 'THẮT CHẶT TIỀN TỆ', value: '+20% XÂY • 10% QUA GO', variant: 'warning' },",
    replacement: "  [MarketCardId.MC_RATE_HIKE]: { label: 'LÃI SUẤT VAY MỚI', value: '+20% XÂY • 10% QUA GO', variant: 'warning' },",
    expectedKiller: 'TC-276B.04',
  },
  {
    id: 7,
    name: "Mutant 7: event_card_visuals.ts: KNOWN_HERO_STATS[MC_RATE_HIKE].variant đổi thành 'info' hoặc 'default'",
    file: 'src/client/ui/modals/event_card_visuals.ts',
    target: "  [MarketCardId.MC_RATE_HIKE]: { label: 'THẮT CHẶT TIỀN TỆ', value: '+20% XÂY • 10% QUA GO', variant: 'warning' },",
    replacement: "  [MarketCardId.MC_RATE_HIKE]: { label: 'THẮT CHẶT TIỀN TỆ', value: '+20% XÂY • 10% QUA GO', variant: 'info' },",
    expectedKiller: 'TC-276B.04',
  },
  {
    id: 8,
    name: "Mutant 8: event_card_modal.tsx: targetScope props tùy chỉnh bị bỏ qua, luôn đọc detail?.targetScope",
    file: 'src/client/ui/modals/event_card_modal.tsx',
    target: `  const rawDenseScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));

  const rawTargetScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));`,
    replacement: `  const rawDenseScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));

  const rawTargetScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));`,
    expectedKiller: 'TC-276B.08',
  },
  {
    id: 9,
    name: "Mutant 9: event_card_modal.tsx: isMultiEvent bị phá vỡ, không đọc currentDetail?.targetScope",
    file: 'src/client/ui/modals/event_card_modal.tsx',
    target: `  const rawDenseScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));

  const rawTargetScope = isMultiEvent
    ? (currentDetail?.targetScope ?? 'Toàn bộ thị trường')
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));`,
    replacement: `  const rawDenseScope = isMultiEvent
    ? 'Phạm vi lỗi multi'
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));

  const rawTargetScope = isMultiEvent
    ? 'Phạm vi lỗi multi'
    : (targetScope || detail?.targetScope || (isMarket ? 'Toàn bộ thị trường' : 'Người chơi rút thẻ'));`,
    expectedKiller: 'TC-276B.09',
  },
];

console.log('🚀 [Station 4 Chaos Sentinel] Starting Targeted Mutation Sensitivity Probe for IMP-276B...\n');

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
  if (parsed.numPassedTests !== 10) {
    throw new Error(`Expected 10 tests to pass in baseline, but got ${parsed.numPassedTests}`);
  }
} catch (e) {
  console.error('❌ Baseline run failed:', e.message);
  process.exit(1);
}

// Step 2: Run mutation probes
console.log('--- Step 2: Executing 9 Adversarial Mutation Probes ---');
const details = [];
let mutantsKilled = 0;
let mutantsSurvived = 0;

for (const mutant of MUTANTS) {
  const fullPath = path.resolve(repoRoot, mutant.file);
  const original = fs.readFileSync(fullPath, 'utf8');

  // Normalize line endings for robust pattern matching
  const normalizedOriginal = original.replace(/\r\n/g, '\n');
  const normalizedTarget = mutant.target.replace(/\r\n/g, '\n');
  const normalizedReplacement = mutant.replacement.replace(/\r\n/g, '\n');

  if (!normalizedOriginal.includes(normalizedTarget)) {
    console.error(`❌ Target pattern not found in ${mutant.file} for ${mutant.name}`);
    console.error(`Target was:\n${normalizedTarget}`);
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
          const failedTest = res.testResults?.[0]?.assertionResults?.find((a) => a.status === 'failed');
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
if (postParsed.numPassedTests !== 10) {
  console.error('❌ Post-probe verification failed! Codebase left dirty.');
  process.exit(1);
}
console.log('✅ Post-probe integrity confirmed: All 10 tests passed, 0 production files polluted.\n');

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
  ticketId: 'IMP-276B',
  isMicroSlice: true,
  pureLogicWaiver: false,
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
    total: 10,
    passed: 10,
  },
  testExecutionSummary: {
    contractSuite: testSuite,
    contractTestsPassed: 10,
  },
};

const evidenceDir = path.resolve(repoRoot, '.agents', 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });
const evidencePath = path.join(evidenceDir, 'chaos_sentinel_IMP-276B.json');
fs.writeFileSync(evidencePath, JSON.stringify(evidenceData, null, 2), 'utf8');
console.log(`✅ Evidence persisted to: ${evidencePath}\n`);
