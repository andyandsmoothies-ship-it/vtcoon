#!/usr/bin/env node

/**
 * scripts/generate_report.mjs
 * 
 * VTCOON Deterministic Audit Report Generator (Lean Pipeline Station 3 Automation)
 * Generates standardized SPEC_REVIEW_[ID].md and CODE_REVIEW_[ID].md physical artifacts
 * based on real git diffs, physical line counts, test execution, and Plan specifications.
 * 
 * Usage:
 *   node scripts/generate_report.mjs <TICKET_ID> [--force]
 *   npm run report -- <TICKET_ID>
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  detectTicketId,
  resolvePlan,
  resolveModifiedFilesAndTests,
  resolveFinalReportPath
} from './report/report_git_inspector.mjs';
import {
  parseStation0,
  parseStation1,
  parseStation3Reviews,
  parseStation4Chaos,
  collectVisualScreenshots,
  collectLocWarnings
} from './report/report_station_collector.mjs';
import {
  renderSpecReview,
  renderCodeReview,
  renderFinalReport
} from './report/report_markdown_renderer.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const posArgs = args.filter((a) => !a.startsWith('--'));

const repoRoot = process.cwd();
const auditDir = path.join(repoRoot, '.agents', 'audit');
const evidenceDir = path.join(repoRoot, '.agents', 'evidence');
const plansDir = path.join(repoRoot, '.agents', 'plans');

if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true });
}

let ticketId = detectTicketId(posArgs);

if (!ticketId) {
  console.error('❌ Missing required ticket argument.');
  console.error('   Usage: node scripts/generate_report.mjs <TICKET_ID> [--force]');
  console.error('   Example: npm run report -- IMP-277A');
  process.exit(1);
}

const ticketLower = ticketId.toLowerCase();
const ticketClean = ticketId.replace(/[^A-Z0-9]/g, '');
const ticketNum = ticketId.replace(/^[A-Z]+-?/i, '');
const today = new Date().toISOString().split('T')[0];

console.log(`======================================================`);
console.log(`📝 [REPORT GENERATOR] Synthesizing Audit Reports for ${ticketId}`);
console.log(`======================================================`);

// 1. Resolve Plan
const {
  planTitle,
  planSubsystem: initialSubsystem,
  planPath,
  planRegisteredFiles,
  baselineFiles
} = resolvePlan(plansDir, ticketId);

// 2. Resolve Modified Files, Test Suite & Snapshot
const {
  snapshotData,
  srcFiles,
  testFiles,
  contractFile,
  contractTestCount,
  contractAssertCount,
  planSubsystem
} = resolveModifiedFilesAndTests(repoRoot, evidenceDir, ticketId, ticketLower, planRegisteredFiles, planPath, initialSubsystem);

// 3. Generate SPEC_REVIEW_[ID].md
const specReviewPath = path.join(auditDir, `SPEC_REVIEW_${ticketId}.md`);
if (!fs.existsSync(specReviewPath) || force) {
  const specContent = renderSpecReview({
    ticketId,
    planTitle,
    planSubsystem,
    today,
    srcFiles,
    contractFile,
    snapshotData,
    contractTestCount,
    contractAssertCount,
    repoRoot
  });
  fs.writeFileSync(specReviewPath, specContent, 'utf8');
  console.log(`✅ Generated: .agents/audit/SPEC_REVIEW_${ticketId}.md`);
} else {
  console.log(`ℹ️  Preserved existing: .agents/audit/SPEC_REVIEW_${ticketId}.md (Use --force to overwrite)`);
}

// 4. Generate CODE_REVIEW_[ID].md
const codeReviewPath = path.join(auditDir, `CODE_REVIEW_${ticketId}.md`);
if (!fs.existsSync(codeReviewPath) || force) {
  const codeContent = renderCodeReview({
    ticketId,
    ticketClean,
    planTitle,
    planSubsystem,
    srcFiles,
    testFiles,
    contractFile,
    contractTestCount,
    contractAssertCount,
    repoRoot
  });
  fs.writeFileSync(codeReviewPath, codeContent, 'utf8');
  console.log(`✅ Generated: .agents/audit/CODE_REVIEW_${ticketId}.md`);
} else {
  console.log(`ℹ️  Preserved existing: .agents/audit/CODE_REVIEW_${ticketId}.md (Use --force to overwrite)`);
}

// 5. Generate Final Comprehensive Improvement Report
const finalReportPath = resolveFinalReportPath(repoRoot, ticketId, ticketClean, ticketLower, ticketNum, planPath, planTitle);

if (!fs.existsSync(finalReportPath) || force) {
  const station0 = parseStation0(auditDir, ticketId, contractTestCount);
  const station1 = parseStation1(evidenceDir, auditDir, ticketId, contractTestCount);
  const station3 = parseStation3Reviews(auditDir, ticketId);
  const station4 = parseStation4Chaos(evidenceDir, ticketId);
  const { desktopImg, mobileImg } = collectVisualScreenshots(repoRoot, ticketLower, ticketClean);
  const warnFiles = collectLocWarnings(repoRoot, srcFiles);

  const finalReportContent = renderFinalReport({
    ticketId,
    planTitle,
    planSubsystem,
    today,
    snapshotData,
    stage0ReviewerStr: station0.stage0ReviewerStr,
    stage0HeadingStr: station0.stage0HeadingStr,
    stage0ProcessNote: station0.stage0ProcessNote,
    planGrillerVerdict: station0.planGrillerVerdict,
    planAuditSummary: station0.planAuditSummary,
    planChallengeNotes: station0.planChallengeNotes,
    contractFile,
    station1TestCount: station1.station1TestCount,
    contractAssertCount,
    station1RedVerified: station1.station1RedVerified,
    station1FailureSnippet: station1.station1FailureSnippet,
    srcFiles,
    testFiles,
    evidenceDir,
    desktopImg,
    mobileImg,
    uiCraftFile: station3.uiCraftFile,
    visual3dFile: station3.visual3dFile,
    uiReviewVerdict: station3.uiReviewVerdict,
    uiReviewNotes: station3.uiReviewNotes,
    chaosVerdict: station4.chaosVerdict,
    chaosSummary: station4.chaosSummary,
    chaosDetails: station4.chaosDetails,
    baselineFiles,
    planRegisteredFiles,
    warnFiles,
    repoRoot
  });

  fs.writeFileSync(finalReportPath, finalReportContent, 'utf8');
  console.log(`✅ Generated Final Report: ${path.relative(repoRoot, finalReportPath)}`);
} else {
  console.log(`ℹ️  Preserved existing Final Report: ${path.relative(repoRoot, finalReportPath)} (Use --force to overwrite)`);
}

console.log(`======================================================`);
console.log(`🎉 [AUDIT & FINAL REPORTS READY] Physical files verified on disk.`);
console.log(`======================================================\n`);
