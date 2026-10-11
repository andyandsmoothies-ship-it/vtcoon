#!/usr/bin/env node

/**
 * scripts/check_loc.mjs
 * 
 * VTCOON Automated Pre-Coding & Review LOC Measurement Utility
 * 
 * Accurately measures physical Total Lines (disk baseline) and Non-Empty SLOC,
 * categorizes Tier budgets automatically according to GEMINI.md,
 * and formats a ready-to-use Markdown table for implementation plans and reviews.
 * 
 * Usage:
 *   node scripts/check_loc.mjs <file1> <file2> ...
 *   npm run check:loc -- src/client/ui/modals/modal_host.tsx
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TIER_RULES = {
  TIER1_LOGIC: { name: 'Tier 1 (Domain/Server/Logic)', ceiling: 400, warn: 300, grace: 20 },
  TIER2_UI: { name: 'Tier 2 (UI/3D/Views)', ceiling: 500, warn: 400, grace: 25 },
  TIER3_STATIC: { name: 'Tier 3 (Static Data/Config)', ceiling: 800, warn: 650, grace: 40 },
  TESTS: { name: 'Contract / Unit Tests', ceiling: 600, warn: 500, grace: 50 },
  SCRIPTS: { name: 'Harness Scripts / Tooling', ceiling: 9999, warn: 1000, grace: 0 },
  DOCS: { name: 'Documentation / Meta', ceiling: 9999, warn: 1000, grace: 0 },
};

export function categorizeTier(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  if (norm.startsWith('tests/') || norm.includes('/tests/') || norm.includes('.test.') || norm.includes('.spec.')) {
    return 'TESTS';
  }
  if (norm.endsWith('.md') || norm.startsWith('docs/') || norm.includes('/docs/')) {
    return 'DOCS';
  }
  if (norm.startsWith('scripts/') || norm.includes('/scripts/')) {
    return 'SCRIPTS';
  }
  if (
    norm.includes('tile_icons.ts') ||
    norm.includes('property_manager_data.ts') ||
    norm.includes('board_config.ts') ||
    norm.includes('property_data.ts')
  ) {
    return 'TIER3_STATIC';
  }
  // Explicit Tier 1 logic / controller overrides residing under UI/3D directories
  if (
    norm.includes('perf_budget.ts') ||
    norm.includes('camera_telemetry_tracker.ts') ||
    norm.includes('camera_state_machine.ts') ||
    norm.includes('cinematic_chase_camera.ts')
  ) {
    return 'TIER1_LOGIC';
  }
  if (
    norm.includes('src/client/ui/') ||
    norm.includes('src/client/3d/') ||
    norm.endsWith('.tsx')
  ) {
    return 'TIER2_UI';
  }
  return 'TIER1_LOGIC';
}

export function measureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      filePath,
      exists: false,
      tierKey: categorizeTier(filePath),
      totalLines: 0,
      nonEmptySloc: 0,
    };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  // Total lines: split by \n (handling trailing newline)
  const lines = content.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop(); // Standard text file convention
  }
  const totalLines = lines.length;

  // Non-empty SLOC: lines with at least one non-whitespace character
  const nonEmptySloc = lines.filter((line) => line.trim().length > 0).length;

  const tierKey = categorizeTier(filePath);

  return {
    filePath,
    exists: true,
    tierKey,
    totalLines,
    nonEmptySloc,
  };
}

export function formatReport(results) {
  const tableRows = [];
  tableRows.push('| Physical File | Tier Classification | Total Lines | Non-Empty SLOC | Budget Ceiling | Status |');
  tableRows.push('| :--- | :---: | :---: | :---: | :---: | :--- |');

  let hasError = false;

  for (const r of results) {
    const tier = TIER_RULES[r.tierKey];
    if (!r.exists) {
      tableRows.push(`| \`${r.filePath}\` | ${tier.name} | *New file* | *New file* | <= ${tier.ceiling} | 🆕 New file |`);
      continue;
    }

    let status = '✔️ Safe';
    const graceBuffer = tier.grace ?? Math.round(tier.ceiling * 0.05);
    const hardCeiling = tier.ceiling + graceBuffer;

    if (tier.ceiling < 9999 && r.totalLines > hardCeiling) {
      status = `❌ EXCEEDED (${r.totalLines} > ${hardCeiling} Hard Cap)`;
      hasError = true;
    } else if (tier.ceiling < 9999 && r.totalLines > tier.ceiling) {
      if (r.nonEmptySloc <= tier.ceiling) {
        status = `✔️ Safe (Within Grace: SLOC ${r.nonEmptySloc} <= ${tier.ceiling})`;
      } else {
        status = `❌ EXCEEDED (SLOC ${r.nonEmptySloc} > ${tier.ceiling})`;
        hasError = true;
      }
    } else if (tier.warn < 9999 && r.totalLines > tier.warn) {
      status = `⚠️ Soft Notice: ${r.totalLines} LOC (Trần cứng ${tier.name} là ${tier.ceiling} LOC. KHÔNG refactor chia nhỏ nếu không có lý do kiến trúc thực sự)`;
    }

    tableRows.push(
      `| \`${r.filePath}\` | ${tier.name} | **${r.totalLines}** | ${r.nonEmptySloc} | <= ${tier.ceiling} | ${status} |`
    );
  }

  return {
    markdown: tableRows.join('\n'),
    hasError,
  };
}

// CLI Execution
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));

  if (args.length === 0) {
    console.log('Usage: node scripts/check_loc.mjs <file1> <file2> ...');
    process.exit(0);
  }

  const measurements = args.map((file) => measureFile(file));
  const { markdown, hasError } = formatReport(measurements);

  console.log('\n📊 LOC BUDGET MEASUREMENT REPORT (Automated via scripts/check_loc.mjs):\n');
  console.log(markdown);
  console.log('');

  if (hasError) {
    process.exit(1);
  }
}

