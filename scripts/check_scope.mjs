#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * scripts/check_scope.mjs
 * Mechanical Scope Creep Auditor
 * Compares files modified in Git against files registered in the specified PLAN_[TICKET].md
 * Exit 0: All modified code files match Plan scope.
 * Exit 1: Scope creep detected (unregistered code files modified).
 */

function resolvePlanPath(cliArg) {
  if (cliArg) {
    const resolved = path.resolve(process.cwd(), cliArg);
    if (fs.existsSync(resolved)) return resolved;
    console.error(`❌ Plan file not found: ${cliArg}`);
    process.exit(1);
  }

  // Auto-detect the newest plan in .agents/plans/
  const plansDir = path.resolve(process.cwd(), '.agents/plans');
  if (!fs.existsSync(plansDir)) {
    console.error('❌ .agents/plans directory does not exist.');
    process.exit(1);
  }

  const files = fs.readdirSync(plansDir)
    .filter((f) => f.startsWith('PLAN_') && f.endsWith('.md'))
    .map((f) => ({
      name: f,
      path: path.join(plansDir, f),
      mtime: fs.statSync(path.join(plansDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    console.error('❌ No PLAN_*.md files found in .agents/plans/');
    process.exit(1);
  }

  return files[0].path;
}

function extractRegisteredFiles(planContent) {
  const registered = new Set();

  // Match file paths like src/... or tests/... (supporting .test.ts, kebab-case, etc.)
  const regex = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|mjs|css|ts|js)\b/g;
  let match;
  while ((match = regex.exec(planContent)) !== null) {
    registered.add(match[0].replace(/\\/g, '/'));
  }

  return registered;
}

function getModifiedFiles() {
  try {
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf-8' });
    const files = new Set();

    for (const line of statusOutput.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Extract file path (format: " M path/to/file" or "?? path/to/file" or "R  old -> new")
      const parts = trimmed.substring(2).trim();
      let filePath = parts;
      if (parts.includes('->')) {
        filePath = parts.split('->')[1].trim();
      }

      filePath = filePath.replace(/\\/g, '/');
      // Only audit production and test code
      if (filePath.startsWith('src/') || filePath.startsWith('tests/')) {
        files.add(filePath);
      }
    }

    return Array.from(files);
  } catch (error) {
    console.error('❌ Failed to run git status:', error.message);
    process.exit(1);
  }
}

function main() {
  const planPath = resolvePlanPath(process.argv[2]);
  const planName = path.basename(planPath);
  const planContent = fs.readFileSync(planPath, 'utf-8');

  console.log('======================================================');
  console.log('🔍 [MECHANICAL SCOPE AUDITOR] check_scope.mjs');
  console.log(`📋 Plan: ${planName}`);
  console.log('======================================================\n');

  const registeredFiles = extractRegisteredFiles(planContent);
  const modifiedFiles = getModifiedFiles();

  console.log(`📌 Registered files in Plan: ${registeredFiles.size}`);
  for (const f of registeredFiles) {
    console.log(`   - ${f}`);
  }
  console.log('');

  console.log(`📌 Modified code files in Git: ${modifiedFiles.length}`);
  for (const f of modifiedFiles) {
    console.log(`   - ${f}`);
  }
  console.log('');

  const unauthorizedFiles = modifiedFiles.filter((f) => !registeredFiles.has(f));

  if (unauthorizedFiles.length > 0) {
    console.error('❌ [SCOPE CREEP DETECTED] The following files were modified but are NOT declared in the Plan:');
    for (const f of unauthorizedFiles) {
      console.error(`   🚨 ${f}`);
    }
    console.error('\nAction Required:');
    console.error('1. If intentional, declare them in Section 0 & Section 2 of ' + planName);
    console.error('2. If accidental, revert changes: git checkout -- <file>\n');
    process.exit(1);
  }

  console.log('🎉 [SCOPE VERIFIED] All modified files match Plan scope. Zero scope creep!\n');
  process.exit(0);
}

main();
