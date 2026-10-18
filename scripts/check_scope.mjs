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

function getModifiedFiles(stagedOnly = false) {
  try {
    const statusOutput = execSync('git status --porcelain -uall', { encoding: 'utf-8' });
    const files = new Set();
    const harnessFiles = new Set();

    for (const rawLine of statusOutput.split('\n')) {
      if (!rawLine.trim()) continue;
      if (stagedOnly && (rawLine[0] === ' ' || rawLine[0] === '?')) continue;

      const trimmed = rawLine.trim();
      // Extract file path (format: " M path/to/file" or "?? path/to/file" or "R  old -> new")
      const parts = trimmed.substring(2).trim();
      let filePath = parts;
      if (parts.includes('->')) {
        filePath = parts.split('->')[1].trim();
      }

      filePath = filePath.replace(/\\/g, '/');
      // Only audit production and test code (exclude transient sentinel files)
      if ((filePath.startsWith('src/') || filePath.startsWith('tests/')) &&
          !filePath.includes('.tmp_mutant_sandbox_') &&
          !filePath.includes('.sentinel_bak_')) {
        files.add(filePath);
      }

      // Track harness and toolchain script modifications (excluding transient log/probe outputs)
      if (filePath.startsWith('scripts/') &&
          !filePath.includes('.tmp_') &&
          !filePath.endsWith('.log') &&
          !filePath.includes('.sentinel_bak_')) {
        harnessFiles.add(filePath);
      }
    }

    return { modifiedFiles: Array.from(files), harnessFiles: Array.from(harnessFiles) };
  } catch (error) {
    console.error('❌ Failed to run git status:', error.message);
    process.exit(1);
  }
}

import { extractPriorTicketsFiles } from './plan_audit/worktree_scope_resolver.mjs';

function main() {
  const planPath = resolvePlanPath(process.argv[2]);
  const planName = path.basename(planPath);
  const planContent = fs.readFileSync(planPath, 'utf-8');

  console.log('======================================================');
  console.log('🔍 [MECHANICAL SCOPE AUDITOR] check_scope.mjs');
  console.log(`📋 Plan: ${planName}`);
  console.log('======================================================\n');

  const registeredFiles = extractRegisteredFiles(planContent);
  const stagedOnly = process.argv.includes('--staged');
  const { modifiedFiles, harnessFiles } = getModifiedFiles(stagedOnly);

  // Mechanical Harness Tampering Lock: Reject unannounced toolchain mutations
  if (harnessFiles.length > 0) {
    const isAuthorized = planContent.includes('[HARNESS_MUTATION_AUTHORIZED]');
    if (!isAuthorized) {
      console.error('❌ [HARNESS TAMPERING DETECTED] The following toolchain scripts under scripts/ were modified without explicit authorization:');
      for (const hf of harnessFiles) {
        console.error(`   🚨 ${hf}`);
      }
      console.error('\nAction Required:');
      console.error('1. If intentional, declare "[HARNESS_MUTATION_AUTHORIZED]" in the Plan along with architectural justification.');
      console.error('2. If accidental, revert changes: git checkout -- <file>\n');
      process.exit(1);
    } else {
      console.log(`🛡️ [HARNESS LOCK] Authorized modification detected for ${harnessFiles.length} harness file(s):`);
      for (const hf of harnessFiles) {
        console.log(`   🔧 ${hf} (Authorized via [HARNESS_MUTATION_AUTHORIZED])`);
      }
      console.log('');
    }
  }

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
    // Multi-Ticket Worktree Awareness: Check if unregistered files belong to prior in-flight/completed tickets
    const priorTicketsMap = extractPriorTicketsFiles(planPath, registeredFiles);
    const priorFiles = [];
    const trueUnauthorizedFiles = [];

    for (const f of unauthorizedFiles) {
      if (priorTicketsMap.has(f)) {
        priorFiles.push({ file: f, source: priorTicketsMap.get(f) });
      } else {
        trueUnauthorizedFiles.push(f);
      }
    }

    if (priorFiles.length > 0) {
      console.log(`ℹ️ [MULTI-TICKET WORKTREE] Detected ${priorFiles.length} uncommitted files belonging to prior tickets:`);
      for (const item of priorFiles) {
        console.log(`   📎 ${item.file} (${item.source})`);
      }
      console.log('   -> These files are legitimately preserved across batch commits and will NOT fail this audit.\n');
    }

    if (trueUnauthorizedFiles.length > 0) {
      console.error('❌ [SCOPE CREEP DETECTED] The following files were modified but are NOT declared in current Plan or any prior ticket:');
      for (const f of trueUnauthorizedFiles) {
        console.error(`   🚨 ${f}`);
      }
      console.error('\nAction Required:');
      console.error('1. If intentional, declare them in Section 1 (Direct Scope) of ' + planName);
      console.error('2. If accidental, revert changes: git checkout -- <file>\n');
      process.exit(1);
    }
  }

  console.log('🎉 [SCOPE VERIFIED] All modified files accounted for in current Plan or prior tickets. Zero scope creep!\n');
  process.exit(0);
}

main();
