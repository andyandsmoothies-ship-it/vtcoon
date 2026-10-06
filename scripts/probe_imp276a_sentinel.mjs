#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const testSuite = 'tests/contracts/imp276a_title_deed_affordance.test.ts';

const MUTANTS = [
  {
    id: 1,
    name: 'Mutant 1: calculateUpgradeCost -> quay lại đọc tĩnh deed?.upgradeCosts',
    file: 'src/client/ui/modals/title_deed_affordance.ts',
    target: 'const upgradeCost = calculateUpgradeCost(params.cellIndex, currentLevel, params.activeModifiers);',
    replacement: 'const upgradeCost = deed?.upgradeCosts && currentLevel < 3 ? deed.upgradeCosts[currentLevel as 0 | 1 | 2] : 0;',
    expectedKiller: 'TC-276A.01',
  },
  {
    id: 2,
    name: 'Mutant 2: dynamicUpgradeCosts -> mảng rỗng []',
    file: 'src/client/ui/modals/title_deed_affordance.ts',
    target: `  const dynamicUpgradeCosts = deed?.upgradeCosts
    ? deed.upgradeCosts.map((_, lvl) => calculateUpgradeCost(params.cellIndex, lvl, params.activeModifiers))
    : [];`,
    replacement: '  const dynamicUpgradeCosts: readonly number[] = [];',
    expectedKiller: 'TC-276A.01',
  },
  {
    id: 3,
    name: 'Mutant 3: Turn Guard (params.currentTurnPlayerId !== params.myId) bị gỡ bỏ (trả về false)',
    file: 'src/client/ui/modals/title_deed_affordance.ts',
    target: 'if (params.currentTurnPlayerId && params.currentTurnPlayerId !== params.myId) {',
    replacement: 'if (false && params.currentTurnPlayerId && params.currentTurnPlayerId !== params.myId) {',
    expectedKiller: 'TC-276A.03',
  },
  {
    id: 4,
    name: "Mutant 4: Phase Guard (params.turnPhase !== 'PropertyManagement') bị gỡ bỏ (trả về false)",
    file: 'src/client/ui/modals/title_deed_affordance.ts',
    target: "} else if (params.turnPhase && params.turnPhase !== 'PropertyManagement') {",
    replacement: "} else if (false && params.turnPhase && params.turnPhase !== 'PropertyManagement') {",
    expectedKiller: 'TC-276A.04',
  },
  {
    id: 5,
    name: 'Mutant 5: Solvency Guard (playerBalance < effectiveUpgradeCost) bị gỡ bỏ (trả về false)',
    file: 'src/client/ui/modals/title_deed_affordance.ts',
    target: '} else if (!buildRules.upgradeBlockedReason && playerBalance < effectiveUpgradeCost) {',
    replacement: '} else if (false && !buildRules.upgradeBlockedReason && playerBalance < effectiveUpgradeCost) {',
    expectedKiller: 'TC-276A.05',
  },
  {
    id: 6,
    name: 'Mutant 6: Solvency Guard toán tử < bị đổi thành <=',
    file: 'src/client/ui/modals/title_deed_affordance.ts',
    target: '} else if (!buildRules.upgradeBlockedReason && playerBalance < effectiveUpgradeCost) {',
    replacement: '} else if (!buildRules.upgradeBlockedReason && playerBalance <= effectiveUpgradeCost) {',
    expectedKiller: 'TC-276A.06',
  },
  {
    id: 7,
    name: "Mutant 7: Thông điệp lỗi 'Cần ${effectiveUpgradeCost} Tr. VNĐ để nâng cấp' bị đổi thành ''",
    file: 'src/client/ui/modals/title_deed_affordance.ts',
    target: 'specialUpgradeBlockedReason = `Cần ${effectiveUpgradeCost} Tr. VNĐ để nâng cấp`;',
    replacement: "specialUpgradeBlockedReason = '';",
    expectedKiller: 'TC-276A.05',
  },
  {
    id: 8,
    name: 'Mutant 8: Trong title_deed_modal.tsx, propsUpgradeCosts ?? deed.upgradeCosts bị đổi thành deed.upgradeCosts (khôi phục visual split-brain)',
    file: 'src/client/ui/modals/title_deed_modal.tsx',
    target: 'upgradeCosts={propsUpgradeCosts ?? deed.upgradeCosts}',
    replacement: 'upgradeCosts={deed.upgradeCosts}',
    expectedKiller: 'TC-276A.11',
  },
  {
    id: 9,
    name: 'Mutant 9: Trong hosts/deed_modal_host.tsx, upgradeCosts={deedState.upgradeCosts} bị xóa bỏ',
    file: 'src/client/ui/modals/hosts/deed_modal_host.tsx',
    target: 'upgradeCosts={deedState.upgradeCosts}',
    replacement: '/* mutant 9: removed upgradeCosts */',
    expectedKiller: 'TC-276A.11',
  },
];

console.log('🚀 [Station 4 Chaos Sentinel] Starting Targeted Mutation Sensitivity Probe for IMP-276A...\n');

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
  ticketId: 'IMP-276A',
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
const evidencePath = path.join(evidenceDir, 'chaos_sentinel_IMP-276A.json');
fs.writeFileSync(evidencePath, JSON.stringify(evidenceData, null, 2), 'utf8');
console.log(`✅ Evidence persisted to: ${evidencePath}\n`);
