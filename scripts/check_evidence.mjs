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
    const normalized = arg.replace(/^chaos_sentinel_/i, '').replace(/_snapshot\.json$/i, '').replace(/\.json$/i, '');
    const hyphen = normalized.replace(/^(IMP)(\d+)/i, '$1-$2');
    const candidates = [
      path.join(evidenceDir, arg.endsWith('.json') ? arg : `${arg}.json`),
      path.join(evidenceDir, `chaos_sentinel_${arg}.json`),
      path.join(evidenceDir, `chaos_sentinel_${arg.toLowerCase()}.json`),
      path.join(evidenceDir, `chaos_sentinel_${arg.toUpperCase()}.json`),
      path.join(evidenceDir, `chaos_sentinel_${hyphen}.json`),
      path.join(evidenceDir, `chaos_sentinel_${hyphen.toLowerCase()}.json`),
      path.join(evidenceDir, `${arg}_snapshot.json`),
      path.join(evidenceDir, `${arg.toLowerCase()}_snapshot.json`),
      path.join(evidenceDir, `${arg.toUpperCase()}_snapshot.json`),
      path.join(evidenceDir, `${hyphen}_snapshot.json`),
      path.join(evidenceDir, `${hyphen.toLowerCase()}_snapshot.json`),
      path.join(evidenceDir, `${hyphen.toUpperCase()}_snapshot.json`),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    console.error(`❌ Evidence file for ticket "${arg}" NOT found in ${evidenceDir}!`);
    console.error(`   Expected one of:`);
    console.error(`   - .agents/evidence/${arg}_snapshot.json`);
    console.error(`   - .agents/evidence/chaos_sentinel_${arg}.json`);
    process.exit(1);
  }

  if (!fs.existsSync(evidenceDir)) {
    console.error('❌ Evidence directory does not exist:', evidenceDir);
    process.exit(1);
  }

  const files = fs.readdirSync(evidenceDir)
    .filter((f) => (f.endsWith('_snapshot.json') || f.startsWith('chaos_sentinel_')) && f.endsWith('.json') && f !== 'latest_snapshot.json')
    .map((f) => ({
      file: path.join(evidenceDir, f),
      mtime: fs.statSync(path.join(evidenceDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    console.error('❌ No evidence snapshot or chaos_sentinel JSON files found.');
    process.exit(1);
  }

  return files[0].file;
}

const evidencePath = resolveEvidenceFile(targetArg);
console.log(`🔍 Auditing evidence: ${path.relative(repoRoot, evidencePath)}`);

const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
let errors = [];

const isExecuted = evidence.executed === true || evidence.verdict === 'PASSED' || evidence.verdict === 'APPROVED';
if (!isExecuted) {
  errors.push('Evidence verification failed: "executed" is not true in evidence JSON.');
}

const verdict = evidence.verdict?.toUpperCase();
if (verdict !== 'PASSED' && verdict !== 'APPROVED') {
  errors.push(`Evidence verification failed: verdict is "${evidence.verdict}", expected PASSED or APPROVED.`);
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
  // Detects tautological timer pattern: local setTimeout tested with advanceTimersByTime without component/store
  const tautologicalTimerPattern = /(?:const|let|var)\s+\w+\s*=\s*setTimeout\s*\([^)]*=>\s*\{[^}]*\}\s*,\s*[A-Za-z0-9_]+\s*\)[\s\S]*?vi\.advanceTimersByTime/;
  if (tautologicalTimerPattern.test(content) && !/(?:render\(|createRoot|act\(|useGameStore)/.test(content)) {
    return 'Tautological timer test detected: file defines local setTimeout() without mounting a component or invoking a production store/function.';
  }
  return null;
}

// 1.5. Atomic Test Assert-Density Scan (<= 4 expects per test)
function scanAssertDensity(filePath) {
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

// 2. Physical Execution Verification
const summary = evidence.testExecutionSummary || {};
const probeSuite = summary.probeSuite ? path.resolve(repoRoot, summary.probeSuite) : null;
const contractSuite = summary.contractSuite ? path.resolve(repoRoot, summary.contractSuite) : null;


if (probeSuite) {
  if (!fs.existsSync(probeSuite)) {
    errors.push(`Probe suite file not found: ${summary.probeSuite}`);
  } else {
    const tautologyErr = scanForTautology(probeSuite);
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

const effectiveContractFile = contractSuite || (evidence.contractTests?.file ? path.resolve(repoRoot, evidence.contractTests.file) : null);

if (effectiveContractFile) {
  if (!fs.existsSync(effectiveContractFile)) {
    errors.push(`Contract suite file not found: ${effectiveContractFile}`);
  } else {
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
        const isMicro = evidence.isMicroSlice === true || /micro|slice[_\-]?\d+/i.test(evidence.ticketId || targetArg || '');
        const minContractFloor = isMicro ? 6 : 15;
        if (passedCount < minContractFloor) {
          errors.push(`Contract floor violation: Contract suite has ${passedCount} tests, minimum requirement is ${minContractFloor} tests${isMicro ? ' (Micro-Slice floor: 6)' : ''}.`);
        }
      }
    } catch (err) {
      errors.push(`Contract suite execution failed: ${err.message?.split('\n')[0]}`);
    }
  }
}

// 2.5 Mutation Sensitivity Floor Verification (GEMINI.md Station 4 floor >= 14, Micro-Slice >= 8)
if (evidence.mutationSensitivityProbe) {
  const tested = evidence.mutationSensitivityProbe.mutantsTested ?? 0;
  const isExempt = Boolean(evidence.mutationSensitivityProbe.waiverReason);
  const isMicro = evidence.isMicroSlice === true || /micro|slice[_\-]?\d+/i.test(evidence.ticketId || targetArg || '');
  const minMutantFloor = isMicro ? 8 : 14;
  if (tested < minMutantFloor && !isExempt) {
    errors.push(`Mutation floor violation: Probe tested ${tested} mutants, minimum requirement is ${minMutantFloor} mutants${isMicro ? ' (Micro-Slice floor: 8)' : ''} (or specify explicit waiverReason in evidence JSON).`);
  }
  const srcMutants = evidence.mutationSensitivityProbe.sourceLevelMutantsTested ?? 0;
  const targetFiles = evidence.targetFiles || evidence.modifiedFiles || [];
  const hasModifiedSrc = targetFiles.some((f) => /^(?:src\/|src\\)/i.test(f));
  if (hasModifiedSrc && srcMutants === 0 && !isExempt && !evidence.pureLogicWaiver) {
    errors.push(`Source-level mutation floor violation: Probe tested 0 mutants on production source files (sourceLevelMutantsTested: 0). Contract inversion alone is insufficient; mutants must directly challenge modified production code.`);
  }

  // 2.6 Wiring Parity & Call-Site Mutation Verification
  const helperFiles = targetFiles.filter((f) => /_(?:helpers|detect|math|calc)\.[a-z]+$/i.test(f));
  const consumerFiles = targetFiles.filter((f) => /\.(?:tsx|ts)$/i.test(f) && !/_(?:helpers|detect|math|calc)\.[a-z]+$/i.test(f) && !/types?\.[a-z]+$/i.test(f));
  if (helperFiles.length > 0 && consumerFiles.length > 0) {
    const probeFileCandidates = [
      path.join(repoRoot, 'scripts', 'sentinel_probes', `${(evidence.ticketId || targetArg || '').toUpperCase()}.json`),
      path.join(repoRoot, 'scripts', 'sentinel_probes', `${(evidence.ticketId || targetArg || '')}.json`),
    ];
    const probeFilePath = probeFileCandidates.find((p) => fs.existsSync(p));
    if (probeFilePath) {
      try {
        const probeList = JSON.parse(fs.readFileSync(probeFilePath, 'utf8'));
        if (Array.isArray(probeList) && probeList.length > 0) {
          const hasConsumerMutant = probeList.some((p) => consumerFiles.some((cf) => p.file && p.file.replace(/\\/g, '/').endsWith(cf.replace(/\\/g, '/'))));
          if (!hasConsumerMutant) {
            errors.push(
              `[Wiring Parity Violation] Ticket modifies both helper (${helperFiles.map((f) => path.basename(f)).join(', ')}) and consumer (${consumerFiles.map((f) => path.basename(f)).join(', ')}), but scripts/sentinel_probes contains 0 mutants targeting consumer call-sites! At least 1 mutant must challenge the consumer call-site to prevent tautological testing.`
            );
          }
        }
      } catch (err) {}
    }
  }
}

// 3. Physical Visual Screenshot Verification (Zero-Blindness Gate)
const isPureLogicWaiver = evidence.pureLogicWaiver === true;
const targetFilesForVisual = evidence.targetFiles || evidence.modifiedFiles || [];
const clientFiles = targetFilesForVisual.filter((f) => /^(?:src\/client|src\\client)/i.test(f));
const hasClientVisualFiles = targetFilesForVisual.some((f) => /src[/\\]client[/\\](3d|ui)/i.test(f));

const ticketRaw = (evidence.ticketId || targetArg || '').toLowerCase();
const ticketClean = ticketRaw.replace(/[^a-z0-9]/g, '');
const ticketNum = ticketClean.replace(/^[a-z]+/, '');

const matchesTicket = (filename) => {
  const fl = filename.toLowerCase();
  const flClean = fl.replace(/[^a-z0-9]/g, '');
  return fl.includes(ticketRaw) || flClean.includes(ticketClean) || (ticketNum && (fl.includes(`imp-${ticketNum}`) || fl.includes(`imp_${ticketNum}`) || flClean.includes(ticketNum)));
};

if (isPureLogicWaiver) {
  if (clientFiles.length > 0) {
    errors.push(
      `[ILLEGAL_PURE_LOGIC_WAIVER] pureLogicWaiver is FORBIDDEN when client/UI files are modified: ${clientFiles.join(', ')}`,
    );
  } else {
    console.log(`ℹ️ [Pure Logic Waiver] Visual screenshot check waived: ${evidence.pureLogicWaiverReason || 'Non-visual logic/type slice'}`);
  }
} else if (evidence.visualReview || hasClientVisualFiles || /3d|ui|viaduct|diorama|ballast|modal|hud/i.test(evidencePath) || /3d|ui/i.test(summary.contractSuite || '')) {
  const tmpFiles = fs.existsSync(path.join(repoRoot, '.agents', 'tmp')) ? fs.readdirSync(path.join(repoRoot, '.agents', 'tmp')) : [];
  const evFiles = fs.readdirSync(evidenceDir);
  const isSyntheticSmokeProbe = (f) => /^(chaos_sentinel_|webgl2_headless_smoke)/i.test(f);
  const allImages = [...tmpFiles, ...evFiles].filter((f) =>
    !isSyntheticSmokeProbe(f) &&
    /\.(png|jpe?g|webp)$/i.test(f) &&
    (!ticketClean || f.toLowerCase().includes(ticketClean) || f.toLowerCase().includes(ticketRaw)),
  );
  if (allImages.length === 0) {
    errors.push(
      `[Zero-Blindness Violation] Visual/3D ticket requires physical screenshot in .agents/tmp/ or .agents/evidence/ from Phase 3.0 (e.g. ${evidence.ticketId || targetArg}_desktop.jpg). Run 'npm run capture:visual -- --ticket ${evidence.ticketId || targetArg}' before sign-off.`,
    );
  } else if (hasClientVisualFiles) {
    const hasDesktop = allImages.some((f) => /desktop/i.test(f));
    const hasMobile = allImages.some((f) => /mobile/i.test(f));
    if (!hasDesktop || !hasMobile) {
      errors.push(
        `[Dual-Viewport Enforcement Violation] Physical UI modification detected in ${clientFiles.join(', ')}. Must provide BOTH desktop and mobile captures in .agents/tmp/! Missing: ${!hasDesktop ? 'desktop ' : ''}${!hasMobile ? 'mobile ' : ''}. Run 'npm run capture:visual -- --ticket ${evidence.ticketId || targetArg}'.`
      );
    }
  }

  // 3.05 Automated TopBar Overflow, Corner Clearance & Symmetry Gate
  const bbFiles = fs.existsSync(evidenceDir) ? fs.readdirSync(evidenceDir).filter((f) => f.startsWith('bounding_box_') && matchesTicket(f)) : [];
  for (const bbf of bbFiles) {
    try {
      const bbData = JSON.parse(fs.readFileSync(path.join(evidenceDir, bbf), 'utf8'));
      if (bbData.topbarCapsule && bbData.leaveBtn) {
        // A. Hard Overflow Check
        if (bbData.leaveBtn.right > bbData.topbarCapsule.right + 2) {
          errors.push(
            `[TopBar Leave Overflow Violation] ${bbf}: leave-room-button (right: ${bbData.leaveBtn.right}px) overflows outside topbar capsule (right: ${bbData.topbarCapsule.right}px) by ${bbData.leaveBtn.right - bbData.topbarCapsule.right}px!`
          );
        }

        const isDesktop = bbf.includes('desktop') || bbData.viewport === 'desktop';
        const rightMargin = bbData.topbarCapsule.right - bbData.leaveBtn.right;
        const minClearanceFloor = isDesktop ? 20 : 6;

        // B. Corner Arc Clearance Gate (Margin >= R + 4px)
        if (rightMargin < minClearanceFloor) {
          errors.push(
            `[TopBar Corner Clearance Violation] ${bbf}: leave-room-button right margin (${rightMargin}px) is below ergonomic floor (${minClearanceFloor}px) for rounded-2xl capsule!`
          );
        }

        // C. Symmetrical Margin Parity Gate (Desktop |left - right| <= 8px)
        if (isDesktop && bbData.matchInfo) {
          const leftMargin = bbData.matchInfo.left - bbData.topbarCapsule.left;
          const asymmetry = Math.abs(leftMargin - rightMargin);
          if (asymmetry > 8) {
            errors.push(
              `[TopBar Margin Symmetry Violation] ${bbf}: capsule horizontal padding is asymmetrical (Left: ${leftMargin}px, Right: ${rightMargin}px, Diff: ${asymmetry}px > 8px max allowed).`
            );
          }
        }
      }
    } catch {}
  }
}

// 4. Physical Review Reports Persistence Gate (Phase 3.3)
const auditDir = path.join(repoRoot, '.agents', 'audit');

// 3.1 Physical Action Telemetry Gate (Gotcha #13 Enforcement)
const isMotionTicket = !isPureLogicWaiver && (/camera|chase|kinematics|pawn_hop|trajectory/i.test(evidencePath) || /camera|chase|kinematics/i.test(summary.contractSuite || ''));
if (isMotionTicket) {
  const telemetryFiles = fs.readdirSync(evidenceDir).filter((f) => f.startsWith('camera_telemetry_') && matchesTicket(f));
  if (telemetryFiles.length === 0) {
    errors.push(
      `[Gotcha #13 Violation] Camera/kinematics ticket requires camera telemetry in .agents/evidence/camera_telemetry_${ticketRaw}_*.json`
    );
  } else {
    for (const tf of telemetryFiles) {
      try {
        const tel = JSON.parse(fs.readFileSync(path.join(evidenceDir, tf), 'utf8'));
        const isDicePanAction = Boolean(tel.gameState?.isRolling) || (typeof tel.elevationY === 'number' && tel.elevationY >= 18.0 && tel.elevationY <= 22.0);
        const maxAllowedElevation = isDicePanAction ? 22.0 : 20.0;
        if (typeof tel.elevationY === 'number' && tel.elevationY > maxAllowedElevation) {
          errors.push(
            `[Gotcha #13 Violation] ${tf}: elevationY (${tel.elevationY}m) represents an idle overview (> ${maxAllowedElevation}m). Must capture in-action telemetry (elevationY <= 6.0m for pawn chase, or <= 22.0m for active dice pan).`
          );
        }
      } catch (err) {
        errors.push(`[Gotcha #13 Error] Failed to parse ${tf}: ${err.message}`);
      }
    }
  }
}

if (fs.existsSync(auditDir) && ticketNum) {
  const auditFiles = fs.readdirSync(auditDir);

  const hasSpecReview = auditFiles.some((f) => f.toLowerCase().startsWith('spec_review_') && matchesTicket(f));
  if (!hasSpecReview) {
    errors.push(`[Phase 3.3 Persistence Violation] Missing physical Spec Review report: .agents/audit/SPEC_REVIEW_${evidence.ticketId || targetArg}.md`);
  }

  const hasCodeReview = auditFiles.some((f) => f.toLowerCase().startsWith('code_review_') && matchesTicket(f));
  if (!hasCodeReview) {
    errors.push(`[Phase 3.3 Persistence Violation] Missing physical Code Review report: .agents/audit/CODE_REVIEW_${evidence.ticketId || targetArg}.md`);
  }

  const isVisual = !isPureLogicWaiver && (evidence.visualReview || /3d|ui|viaduct|diorama|ballast|modal|hud/i.test(evidencePath) || /3d|ui/i.test(summary.contractSuite || ''));
  if (isVisual) {
    const hasVisualReview = auditFiles.some((f) => /^(ui_craft|game_3d|3d_visual)_review_/i.test(f) && matchesTicket(f));
    if (!hasVisualReview) {
      errors.push(`[Phase 3.3 Persistence Violation] Visual ticket missing UI/3D review report: .agents/audit/UI_CRAFT_REVIEW_${evidence.ticketId || targetArg}.md or 3D_VISUAL_REVIEW_${evidence.ticketId || targetArg}.md`);
    }
  }

  // 4.1 Anti-Boilerplate Audit Gate (Zero-Template Invariant)
  const BANNED_BOILERPLATE_PATTERNS = [
    { pattern: /Đồng bộ và bảo toàn logic nghiệp vụ/i, name: 'Generic Spec Table Placeholder' },
    { pattern: /Thực hiện cập nhật logic tối thiểu, đồng bộ hóa dữ liệu/i, name: 'Generic Code Review Summary Placeholder' },
    { pattern: /Cập nhật logic và bảo toàn bất biến phân hệ/i, name: 'Generic Change Map Rationale Placeholder' },
    { pattern: /TODO_REVIEW_REQUIRED/i, name: 'Unfilled Review Todo' },
    { pattern: /Đảm bảo bao phủ 100% kiểm thử hành vi/i, name: 'Generic Test Coverage Placeholder' },
  ];

  for (const af of auditFiles.filter((f) => matchesTicket(f) && f.endsWith('.md'))) {
    try {
      const content = fs.readFileSync(path.join(auditDir, af), 'utf8');
      for (const { pattern, name } of BANNED_BOILERPLATE_PATTERNS) {
        if (pattern.test(content)) {
          errors.push(`[Zero-Boilerplate Violation] ${af} contains template placeholder "${name}". Must write concrete business rules, blast radius scenarios, and change rationales!`);
        }
      }
    } catch {}
  }
}

// 5. Station 1 Mechanical Evidence Handoff Verification (Step 1 Mechanical Gate)
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
    } catch (e) {
      errors.push(`[Station 1 Evidence Violation] Failed to parse ${station1File}: ${e.message}`);
    }
  }
}

// 6. Comprehensive Improvement Final Acceptance Report Gate (SSOT Report)
const improvementsDir = path.join(repoRoot, 'docs', 'reports', 'improvements');
if (ticketNum && fs.existsSync(improvementsDir)) {
  const improvementFiles = fs.readdirSync(improvementsDir);
  const finalReport = improvementFiles.find((f) => f.endsWith('.md') && matchesTicket(f));
  if (!finalReport) {
    errors.push(
      `[Final Acceptance Report Missing] Missing final improvement report in docs/reports/improvements/ for ticket "${evidence.ticketId || targetArg}". Run 'npm run report -- ${evidence.ticketId || targetArg}' to synthesize.`
    );
  } else {
    const reportPath = path.join(improvementsDir, finalReport);
    const reportStat = fs.statSync(reportPath);
    if (reportStat.size < 200) {
      errors.push(
        `[Final Acceptance Report Truncated] Report ${finalReport} is too small (${reportStat.size} bytes). Run 'npm run report -- ${evidence.ticketId || targetArg} --force' to regenerate.`
      );
    }
    try {
      const repContent = fs.readFileSync(reportPath, 'utf8');
      const BANNED_BOILERPLATE_PATTERNS = [
        { pattern: /Đồng bộ và bảo toàn logic nghiệp vụ/i, name: 'Generic Spec Table Placeholder' },
        { pattern: /Thực hiện cập nhật logic tối thiểu, đồng bộ hóa dữ liệu/i, name: 'Generic Code Review Summary Placeholder' },
        { pattern: /Cập nhật logic và bảo toàn bất biến phân hệ/i, name: 'Generic Change Map Rationale Placeholder' },
        { pattern: /TODO_REVIEW_REQUIRED/i, name: 'Unfilled Review Todo' },
        { pattern: /Đảm bảo bao phủ 100% kiểm thử hành vi/i, name: 'Generic Test Coverage Placeholder' },
      ];
      for (const { pattern, name } of BANNED_BOILERPLATE_PATTERNS) {
        if (pattern.test(repContent)) {
          errors.push(`[Zero-Boilerplate Violation] Final report ${finalReport} contains template placeholder "${name}". Must customize with authentic technical findings.`);
        }
      }
    } catch {}
  }
}

if (errors.length > 0) {
  console.error(`\n❌ EVIDENCE AUDIT FAILED (${errors.length} issue${errors.length > 1 ? 's' : ''}):`);
  errors.forEach((e, idx) => console.error(`  [${idx + 1}] ${e}`));
  process.exit(1);
}

console.log('✅ Evidence verified: physical test counts match, floors respected, zero tautological mutants.\n');
process.exit(0);
