#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

/**
 * Mechanical Pre-Flight Auditor for AI-Generated Implementation Plans.
 * Fast, 0-token physical verification against real disk files:
 * 1. Ghost file detection (Target files must physically exist).
 * 2. Snippet match verification (TargetContent must match uniquely in target file).
 * 3. Physical line count baseline audit.
 * 4. Zero Dirty Cast detection (`as any`, `as unknown as`).
 * 5. Banned & Unimplementable Test Pattern detection (GC churn, benchmark, typeof).
 * 6. Store State vs Action SRP Separation audit (no functions in State data shape).
 */

const planPath = process.argv[2];
if (!planPath) {
  console.error('Usage: node scripts/audit_plan.mjs <path-to-plan.md>');
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
let checkedSnippets = 0;
let checkedTests = 0;

console.log(`\n🔍 [AUDIT-PLAN] Pre-flight mechanical audit for: ${path.basename(planPath)}`);

// ==========================================
// 1. Scan target files for existence and LOC
// ==========================================
const targetFiles = new Map();
let fileMatch;
while ((fileMatch = fileTargetRegex.exec(planContent)) !== null) {
  const filePath = fileMatch[1].trim().replace(/^[`']|[`']$/g, '');
  const trailingText = (fileMatch[2] || '').toLowerCase();
  const isNew = trailingText.includes('new') || trailingText.includes('create') || trailingText.includes('mới');
  targetFiles.set(filePath, isNew);
}

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
    const lines = linesArr.length;
    console.log(`  ✔️ ${relPath} (Physical lines: ${lines})`);
  }
}

// ==========================================
// 1.1 Verify new production file code specification
// ==========================================
console.log(`\n📄 Checking code specifications for newly declared files:`);
for (const [relPath, isNew] of targetFiles.entries()) {
  const isProd = /^(?:src|lib|app)[\\/]/.test(relPath);
  if (isNew && isProd) {
    const escapedRel = relPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedName = path.basename(relPath).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const newFileCodeRegex = new RegExp(
      `(?:${escapedRel}|${escapedName})[\\s\\S]{0,500}?\`\`\`(?:typescript|tsx|javascript|json|html|css)?\\s*\\n([\\s\\S]+?)\\n\`\`\``,
      'i'
    );
    const codeMatch = planContent.match(newFileCodeRegex);
    if (!codeMatch || codeMatch[1].trim().split('\n').length < 3) {
      console.error(`  ❌ MISSING CODE SPEC: New production file '${relPath}' has no code snippet or interface specification in plan!`);
      errors++;
    } else {
      console.log(`  ✔️ Verified code specification for new file: ${relPath}`);
    }
  }
}

// ==========================================
// 2. Scan drop-in snippets for verbatim match,
//    dirty casts, and State/Action SRP
// ==========================================
console.log(`\n🧩 Checking drop-in snippets and replacement integrity:`);
const sections = planContent.split(/(?=###\s+Task|\*\*Target physical file\*\*|\*\*Target File\*\*)/i);
for (const sec of sections) {
  const fMatch = fileTargetRegex.exec(sec);
  fileTargetRegex.lastIndex = 0;
  if (!fMatch) continue;
  const relPath = fMatch[1].trim().replace(/^[`']|[`']$/g, '');
  const absPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(absPath)) continue;

  const fileContent = fs.readFileSync(absPath, 'utf8');
  let snipMatch;
  while ((snipMatch = snippetRegex.exec(sec)) !== null) {
    checkedSnippets++;
    const targetChunk = snipMatch[1];
    const replacementChunk = snipMatch[2];
    const normalizedTarget = targetChunk.replace(/\r\n/g, '\n').trim();
    const normalizedFile = fileContent.replace(/\r\n/g, '\n');

    // 2.1 Verbatim match
    if (!normalizedFile.includes(normalizedTarget)) {
      console.error(`  ❌ SNIPPET MISMATCH in ${relPath}:`);
      console.error(`     TargetContent not found verbatim in disk file!`);
      errors++;
    } else {
      const matchCount = normalizedFile.split(normalizedTarget).length - 1;
      if (matchCount > 1) {
        console.warn(`  ⚠️ AMBIGUOUS MATCH in ${relPath}: TargetContent matches ${matchCount} times!`);
      } else {
        console.log(`  ✔️ Verified drop-in snippet for: ${relPath} (Unique match)`);
      }
    }

    // 2.2 Dirty cast check: as any / as unknown as
    if (/\bas\s+any\b|\bas\s+unknown\s+as\b/.test(replacementChunk)) {
      console.error(`  ❌ DIRTY CAST VIOLATION in ${relPath}: Proposed snippet contains forbidden 'as any' or 'as unknown as'!`);
      errors++;
    }

    // 2.3 Store State vs Action SRP Separation Guard
    if (/store.*types?\.ts|state.*types?\.ts/i.test(relPath)) {
      // Check if function added into INITIAL_GAME_STATE plain data object
      if (/INITIAL_GAME_STATE[\s\S]*?(?:set|toggle|dispatch)[A-Z]\w*\s*:/i.test(replacementChunk)) {
        console.error(`  ❌ STATE/ACTION SRP VIOLATION in ${relPath}: Action creator found in INITIAL_GAME_STATE! Plain state data objects must not store actions.`);
        errors++;
      }
      // Check if action creator picked in InitialGameState data type
      if (/InitialGameState\s*=\s*Pick<[\s\S]*?['"](?:set|toggle|dispatch)[A-Z]\w*['"]/i.test(replacementChunk)) {
        console.error(`  ❌ STATE/ACTION SRP VIOLATION in ${relPath}: Action creator picked in InitialGameState! InitialGameState must only pick serializable data.`);
        errors++;
      }
      // Check if action function added directly inside data properties section of GameState
      if (/(?:activeModifiers|isHeatmapActive|turnTimeRemaining|roundNumber)[\s\S]*?(?:readonly\s+)?(?:set|toggle|dispatch)[A-Z]\w*\s*:\s*\([^)]*\)\s*=>/i.test(replacementChunk)) {
        console.error(`  ❌ STATE/ACTION SRP VIOLATION in ${relPath}: Action creator signature added directly into data properties section of GameState interface! Action creators belong in store actions.`);
        errors++;
      }
    }
  }
}

// ==========================================
// 3. Scan Station 1 test specifications for
//    banned and unimplementable test patterns
// ==========================================
console.log(`\n🧪 Checking Station 1 test specifications for banned/unimplementable patterns:`);
const testSectionMatch = planContent.match(/(?:Station 1|QA MANDATE|BỘ KIỂM THỬ HỢP ĐỒNG)[\s\S]*?(?=\n##\s+|\n===\s+|$)/i);
if (testSectionMatch) {
  const testSection = testSectionMatch[0];
  const testLines = testSection.split('\n').filter((l) => /^\s*(?:[-*]|\d+\.)\s*`?(?:\[[^\]]+\]\s*)*`?TC-/.test(l));
  
  const bannedRules = [
    {
      regex: /zero\s+gc\s+churn|cấp\s+phát\s+object\s+rác|garbage\s+collection\s+churn|zero\s+gc\s+allocation/i,
      code: 'UNIMPLEMENTABLE_GC_TEST',
      desc: 'GC allocation / memory churn assertions cannot be deterministically verified in Vitest headless Node.',
    },
    {
      regex: /measureUserAgentSpecificMemory/i,
      code: 'UNIMPLEMENTABLE_MEMORY_API',
      desc: 'measureUserAgentSpecificMemory() is browser-specific and not supported in Node.js headless testing.',
    },
    {
      regex: /frame\s*rate\s*benchmark|fps\s*benchmark|render\s*time\s*benchmark/i,
      code: 'UNIMPLEMENTABLE_PERF_BENCHMARK',
      desc: 'FPS / frame rate benchmarks are non-deterministic in headless test environments.',
    },
    {
      regex: /typeof\s+[\w.]+\s*===?\s*['"]function['"]/i,
      code: 'BANNED_STATIC_CHECKLIST_TYPEOF',
      desc: 'asserting typeof fn === "function" is a banned static checklist test. Assert observable behavior instead.',
    },
    {
      regex: /fs\.(existsSync|readFileSync)\s*(?:trong|inside)\s*(?:test|vitest|suite)/i,
      code: 'BANNED_FS_CHECKLIST_TEST',
      desc: 'Testing file existence or content inside Vitest it() suites is a banned static checklist pattern.',
    },
  ];

  for (const line of testLines) {
    checkedTests++;
    // DoD #1 Flow Taxonomy check: Every test case must have [UC-.../MSS] or [UC-.../A#]
    if (!/\[UC-[A-Z0-9-]+\/(?:MSS|A\d+)\]/i.test(line)) {
      console.error(`  ❌ [DOD1_MISSING_FLOW_TAXONOMY] in test spec:`);
      console.error(`     Line: ${line.trim()}`);
      console.error(`     Reason: DoD #1 mandates explicit flow classifier: [UC-XXX/MSS] or [UC-XXX/A#].`);
      errors++;
    }
    for (const rule of bannedRules) {
      if (rule.regex.test(line)) {
        console.error(`  ❌ [${rule.code}] in test spec:`);
        console.error(`     Line: ${line.trim()}`);
        console.error(`     Reason: ${rule.desc}`);
        errors++;
      }
    }
  }
  console.log(`  ✔️ Scanned ${checkedTests} contract test specifications.`);
} else {
  console.log(`  ℹ️ No Station 1 test specifications block detected in plan.`);
}

// ==========================================
// Summary
// ==========================================
console.log(`\n========================================`);
if (errors > 0) {
  console.error(`❌ AUDIT FAILED: ${errors} defect(s) detected. Fix plan before proceeding.`);
  process.exit(1);
} else {
  console.log(`✅ AUDIT PASSED: ${targetFiles.size} files verified, ${checkedSnippets} snippets match physical disk, ${checkedTests} test specs clean.`);
  process.exit(0);
}
