#!/usr/bin/env node

/**
 * scripts/check_reason_i18n_parity.mjs
 * 
 * Asserts 100% bi-directional parity between domain ActionRejectReason
 * and Vietnamese translations in vi.rejectReasons.
 * 
 * Inspired by e2e framework's check-error-codes.ts.
 * Exits with code 1 if any reason is missing translation or if an orphan key exists.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const ACTION_REASONS_FILE = path.join(ROOT, 'src/domain/action_reasons.ts');
const VI_I18N_FILE = path.join(ROOT, 'src/domain/i18n/vi.ts');

function getActionRejectReasons() {
  const content = fs.readFileSync(ACTION_REASONS_FILE, 'utf8');
  const match = /export const ActionRejectReason = {([\s\S]*?)} as const;/.exec(content);
  if (!match) {
    throw new Error(`ActionRejectReason constant block not found in ${ACTION_REASONS_FILE}`);
  }
  const lines = match[1].split('\n');
  const reasons = new Set();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    const kvMatch = /([A-Z0-9_]+)\s*:\s*['"]([A-Z0-9_]+)['"]/.exec(trimmed);
    if (kvMatch) {
      reasons.add(kvMatch[1]);
    }
  }
  return reasons;
}

function getViRejectReasons() {
  const content = fs.readFileSync(VI_I18N_FILE, 'utf8');
  const match = /rejectReasons:\s*{([\s\S]*?)}\s*as Record<ActionRejectReason,\s*string>/.exec(content);
  if (!match) {
    throw new Error(`vi.rejectReasons block strictly typed as Record<ActionRejectReason, string> not found in ${VI_I18N_FILE}`);
  }
  const lines = match[1].split('\n');
  const reasons = new Set();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    const keyMatch = /\[\s*ActionRejectReason\.([A-Z0-9_]+)\s*\]\s*:/.exec(trimmed);
    if (keyMatch) {
      reasons.add(keyMatch[1]);
    }
  }
  return reasons;
}

function main() {
  const domainReasons = getActionRejectReasons();
  const viReasons = getViRejectReasons();

  const missingInVi = [];
  const orphanInVi = [];

  for (const reason of domainReasons) {
    if (!viReasons.has(reason)) {
      missingInVi.push(reason);
    }
  }

  for (const reason of viReasons) {
    if (!domainReasons.has(reason)) {
      orphanInVi.push(reason);
    }
  }

  if (missingInVi.length > 0 || orphanInVi.length > 0) {
    console.error('❌ [i18n Parity Check Failed]');
    if (missingInVi.length > 0) {
      console.error(`  Missing in vi.rejectReasons (${missingInVi.length}):`);
      for (const m of missingInVi) console.error(`    - ${m}`);
    }
    if (orphanInVi.length > 0) {
      console.error(`  Orphan keys in vi.rejectReasons (${orphanInVi.length}):`);
      for (const o of orphanInVi) console.error(`    - ${o}`);
    }
    return 1;
  }

  console.log(`✅ [i18n Parity Check] 100% parity across all ${domainReasons.size} ActionRejectReason codes.`);
  return 0;
}

process.exitCode = main();
