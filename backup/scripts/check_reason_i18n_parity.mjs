#!/usr/bin/env node

/**
 * scripts/check_reason_i18n_parity.mjs
 * 
 * Asserts 100% bi-directional parity between domain ActionRejectReason
 * and Vietnamese translations in vi.rejectReasons.
 * 
 * [SDLC VACCINE]: Also scans src/server/intent_dispatcher.ts for raw string reject reasons
 * and asserts that every server-emitted reason has a valid translation or actionable notification mapping.
 * 
 * Exits with code 1 if any reason is missing translation or if an orphan key exists.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const ACTION_REASONS_FILE = path.join(ROOT, 'src/domain/action_reasons.ts');
const VI_I18N_FILE = path.join(ROOT, 'src/domain/i18n/vi.ts');
const INTENT_DISPATCHER_FILE = path.join(ROOT, 'src/server/intent_dispatcher.ts');
const ACTIONABLE_NOTIFICATIONS_FILE = path.join(ROOT, 'src/client/ui/actionable_notification.ts');

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

function getActionableNotificationKeys() {
  const keys = new Set();
  const files = [
    ACTIONABLE_NOTIFICATIONS_FILE,
    path.join(ROOT, 'src/client/ui/actionable_notification_map.ts'),
    path.join(ROOT, 'src/client/ui/actionable_notification_gameplay.ts'),
    path.join(ROOT, 'src/client/ui/actionable_notification_system.ts'),
  ];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const regex = /^\s*([A-Z0-9_]+)\s*:\s*\{/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
      keys.add(match[1]);
    }
    const aliasRegex = /ACTIONABLE_NOTIFICATIONS_MAP\[['"]([A-Z0-9_]+)['"]\]/g;
    while ((match = aliasRegex.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  return keys;
}

function getRawServerRejectReasons() {
  if (!fs.existsSync(INTENT_DISPATCHER_FILE)) return new Set();
  const content = fs.readFileSync(INTENT_DISPATCHER_FILE, 'utf8');
  const reasons = new Set();
  const regex = /reason\s*:\s*['"]([A-Z0-9_]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    reasons.add(match[1]);
  }
  return reasons;
}

function main() {
  const domainReasons = getActionRejectReasons();
  const viReasons = getViRejectReasons();
  const actionableKeys = getActionableNotificationKeys();
  const serverReasons = getRawServerRejectReasons();

  const missingInVi = [];
  const orphanInVi = [];
  const unmappedServerReasons = [];

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

  // [SDLC VACCINE]: Ensure every raw string reject reason emitted by server has a client mapping
  for (const sReason of serverReasons) {
    const isCoveredInDomain = domainReasons.has(sReason) && viReasons.has(sReason);
    const isCoveredInActionable = actionableKeys.has(sReason);
    if (!isCoveredInDomain && !isCoveredInActionable) {
      unmappedServerReasons.push(sReason);
    }
  }

  if (missingInVi.length > 0 || orphanInVi.length > 0 || unmappedServerReasons.length > 0) {
    console.error('❌ [i18n Parity Check Failed]');
    if (missingInVi.length > 0) {
      console.error(`  Missing in vi.rejectReasons (${missingInVi.length}):`);
      for (const m of missingInVi) console.error(`    - ${m}`);
    }
    if (orphanInVi.length > 0) {
      console.error(`  Orphan keys in vi.rejectReasons (${orphanInVi.length}):`);
      for (const o of orphanInVi) console.error(`    - ${o}`);
    }
    if (unmappedServerReasons.length > 0) {
      console.error(`  [SDLC VACCINE VIOLATION] Raw server reject reasons without client i18n/actionable mapping (${unmappedServerReasons.length}):`);
      for (const u of unmappedServerReasons) console.error(`    - ${u} (in src/server/intent_dispatcher.ts)`);
      console.error('  Action Required: Map these reasons in src/domain/action_reasons.ts or src/client/ui/actionable_notification.ts');
    }
    return 1;
  }

  console.log(`✅ [i18n Parity Check] 100% parity across all ${domainReasons.size} ActionRejectReason codes.`);
  console.log(`🛡️ [SDLC Vaccine Active] All ${serverReasons.size} raw server reject reasons verified to have client mapping.`);
  return 0;
}

process.exitCode = main();
