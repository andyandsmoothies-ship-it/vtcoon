#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

/**
 * Mechanical Pre-Flight Auditor for AI-Generated Implementation Plans.
 * Fast, 0-token physical verification against real disk files:
 * 1. Ghost file detection (Target files must physically exist).
 * 2. Snippet match verification (TargetContent must match uniquely in target file).
 * 3. Physical line count baseline audit.
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

console.log(`\n🔍 [AUDIT-PLAN] Pre-flight audit for: ${path.basename(planPath)}`);

// 1. Scan target files
const targetFiles = new Map();
let fileMatch;
while ((fileMatch = fileTargetRegex.exec(planContent)) !== null) {
  const filePath = fileMatch[1].trim().replace(/^[`']|[`']$/g, '');
  const trailingText = (fileMatch[2] || '').toLowerCase();
  const isNew = trailingText.includes('new') || trailingText.includes('create');
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
    const lines = fs.readFileSync(absPath, 'utf8').split('\n').length;
    console.log(`  ✔️ ${relPath} (Physical lines: ${lines})`);
  }
}

// 2. Scan and verify concrete drop-in snippets
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
    const normalizedTarget = targetChunk.replace(/\r\n/g, '\n').trim();
    const normalizedFile = fileContent.replace(/\r\n/g, '\n');

    if (!normalizedFile.includes(normalizedTarget)) {
      console.error(`\n  ❌ SNIPPET MISMATCH in ${relPath}:`);
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
  }
}

console.log(`\n========================================`);
if (errors > 0) {
  console.error(`❌ AUDIT FAILED: ${errors} defect(s) detected. Fix plan before proceeding.`);
  process.exit(1);
} else {
  console.log(`✅ AUDIT PASSED: ${targetFiles.size} files verified, ${checkedSnippets} snippets match physical disk.`);
  process.exit(0);
}
