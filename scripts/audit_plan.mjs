#!/usr/bin/env node

/**
 * scripts/audit_plan.mjs
 * 
 * Mechanical Pre-Flight Auditor for AI-Generated Implementation Plans (Facade Entrypoint).
 * Fast, 0-token physical verification against real disk files:
 * 1. Ghost file detection (Target files must physically exist).
 * 2. Snippet match verification (TargetContent must match uniquely in target file).
 * 3. Physical line count baseline audit.
 * 4. Zero Dirty Cast detection (`as any`, `as unknown as`).
 * 5. Banned & Unimplementable Test Pattern detection (GC churn, benchmark, typeof).
 * 6. Store State vs Action SRP Separation audit (no functions in State data shape).
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  auditScopeAndSubsystems,
  auditHonestLocAccounting,
  auditPlanSnippetHygiene,
  auditTestSpecLine,
  auditScopeConservation,
  auditPureLogicWaiver,
  collectExportedSymbols,
  auditPhysicalVisualMandate,
  auditStateDependencyScope,
  auditFunctionToTestParity,
  auditFsmQueueCombinatorialCoverage,
  auditShallowModulePropsExplosion,
  auditCohesionOrphanFiles,
} from './audit_plan_rules.mjs';
import {
  findSourceFiles,
  checkTicketCollision,
  parseTargetFiles,
  parseFileSnippets,
  extractTestLines
} from './plan_audit/plan_markdown_parser.mjs';
import {
  auditNewFileDeclarations,
  auditDropInSnippets
} from './plan_audit/plan_snippet_verifier.mjs';
import { executeAutoSign } from './plan_audit/plan_auto_signer.mjs';

const args = process.argv.slice(2);
const autoSign = args.includes('--auto-sign');
const planPath = args.find((a) => !a.startsWith('--'));

if (!planPath) {
  console.error('Usage: node scripts/audit_plan.mjs <path-to-plan.md> [--auto-sign]');
  process.exit(1);
}

if (!fs.existsSync(planPath)) {
  console.error(`❌ Plan file not found: ${planPath}`);
  process.exit(1);
}

const planContent = fs.readFileSync(planPath, 'utf8');
const snippetRegex = /`{3,}(?:typescript|tsx|javascript|json|html|css)?\s*\n<<<<\s*\n([\s\S]*?)\n====\s*\n([\s\S]*?)\n>>>>\s*\n`{3,}/g;
const fileTargetRegex = /(?:\*\*Target physical file\*\*|\*\*Target File\*\*|Target physical file|Target file):\s*[`']?([^\n`']+\.[a-zA-Z0-9]+)[`']?([^\n]*)/gi;

let errors = 0;
let checkedTests = 0;

console.log(`\n🔍 [AUDIT-PLAN] Pre-flight mechanical audit for: ${path.basename(planPath)}`);

// 0. Check Ticket Collision
checkTicketCollision(path.basename(planPath), path.dirname(path.resolve(planPath)));

// 1. Scan target files for existence and LOC
const targetFiles = parseTargetFiles(planContent, fileTargetRegex);

console.log(`\n📁 Checking ${targetFiles.size} target files for existence and line count:`);
for (const [relPath, isNew] of targetFiles.entries()) {
  const absPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(absPath)) {
    if (isNew) {
      console.log(`  ✔️ ${relPath} (New file to be created in Station 1/2)`);
    } else {
      console.error(`  ❌ GHOST FILE: ${relPath} does not exist on disk!`);
      errors++;
    }
  } else {
    const linesArr = fs.readFileSync(absPath, 'utf8').split('\n');
    if (linesArr.length > 0 && linesArr[linesArr.length - 1] === '') {
      linesArr.pop();
    }
    console.log(`  ✔️ ${relPath} (Physical lines: ${linesArr.length})`);
  }
}

// 1.0.1 Pre-scan snippets for LOC deltas and verify rules
const { fileSnippetsMap, snippetDeltaByFile } = parseFileSnippets(planContent, fileTargetRegex, snippetRegex);

console.log(`\n📐 Checking Auto-Slicing Protocol & Scope Confinement:`);
errors += auditScopeAndSubsystems(targetFiles);
errors += auditHonestLocAccounting(targetFiles, planContent, snippetDeltaByFile);
errors += auditScopeConservation(planContent);
errors += auditPureLogicWaiver(targetFiles, planContent);
errors += auditPhysicalVisualMandate(targetFiles, planContent);
errors += auditStateDependencyScope(targetFiles, planContent);
errors += auditFsmQueueCombinatorialCoverage(planContent);
errors += auditShallowModulePropsExplosion(planContent);
errors += auditCohesionOrphanFiles(targetFiles);

// 1.1 Verify new production file code specification
errors += auditNewFileDeclarations(targetFiles, planContent, fileTargetRegex, snippetRegex, findSourceFiles);

// 2. Scan drop-in snippets for verbatim match, dirty casts, and State/Action SRP
const snippetResult = auditDropInSnippets(planContent, fileTargetRegex, snippetRegex, fileSnippetsMap, findSourceFiles, auditPlanSnippetHygiene, targetFiles);
errors += snippetResult.errors;
const checkedSnippets = snippetResult.checkedSnippets;

// 3. Scan Station 1 test specifications for banned and unimplementable test patterns
console.log(`\n🧪 Checking Station 1 test specifications for banned/unimplementable patterns:`);
const testLines = extractTestLines(planContent);

if (testLines.length > 0) {
  const exportedSymbols = collectExportedSymbols('src', planContent);
  for (const line of testLines) {
    checkedTests++;
    errors += auditTestSpecLine(line, exportedSymbols);
  }
  console.log(`  ✔️ Scanned ${checkedTests} contract test specifications.`);
  errors += auditFunctionToTestParity(targetFiles, planContent);
} else {
  console.log(`  ℹ️ No Station 1 test specifications block detected in plan.`);
}

// 4. Summary & Plan Size Hygiene
console.log(`\n========================================`);
const planLines = planContent.split('\n').length;
if (planLines > 600) {
  console.warn(`⚠️  PLAN SIZE WARNING: Plan has ${planLines} lines (> 600 lines).`);
  console.warn(`   Consider using Lean Contract Specifications (Type signatures & DTOs instead of full code implementations) to conserve tokens and speed up review.`);
} else {
  console.log(`📄 Plan length: ${planLines} lines (Lean Specification).`);
}

if (errors > 0) {
  console.error(`❌ AUDIT FAILED: ${errors} defect(s) detected. Fix plan before proceeding.`);
  process.exit(1);
} else {
  console.log(`✅ AUDIT PASSED: ${targetFiles.size} files verified, ${checkedSnippets} snippets match physical disk, ${checkedTests} test specs clean.`);

  if (autoSign) {
    executeAutoSign(planPath, targetFiles, checkedSnippets, checkedTests);
  }

  process.exit(0);
}
