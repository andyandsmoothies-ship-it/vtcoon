#!/usr/bin/env node

/**
 * scripts/dispatch_gotchas.mjs
 * 
 * JIT Gotcha Dispatcher for VTCOON AI-Native Harness
 * 
 * Maps target file paths to concise, relevant domain invariants (Gotchas)
 * to avoid context window saturation and attention dilution across 100KB+ of docs.
 * 
 * Usage:
 *   node scripts/dispatch_gotchas.mjs <file1> <file2> ...
 *   node scripts/dispatch_gotchas.mjs --plan .agents/plans/PLAN_IMP_291.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const gotchasDir = path.join(repoRoot, 'docs', 'domain', 'gotchas');

const SUBSYSTEM_GOTCHA_MAP = [
  {
    subsystem: 'client-3d',
    pattern: /src[\\/]client[\\/]3d|tests[\\/]client[\\/].*cam/i,
    file: '3d_cinematics.md',
    filterKeywords: [
      'Spatial Kinematics',
      'Physical Action Evidence',
      'Zero Raw DOM Elements',
      'Dynamic Depth of Field',
      'Euler Yaw Gimbal Clamp',
      'Dual-Platform 3D Performance',
    ],
  },
  {
    subsystem: 'client-ui',
    pattern: /src[\\/]client[\\/]ui|tests[\\/]client[\\/].*ui/i,
    file: 'ui_ergonomics.md',
    filterKeywords: ['Touch Target', 'Modal', 'Z-Index', 'Poka-Yoke', 'Ergonomics'],
  },
  {
    subsystem: 'domain-core',
    pattern: /src[\\/]domain|tests[\\/]domain|src[\\/]server[\\/]game/i,
    file: 'fsm_lifecycle.md',
    filterKeywords: ['FSM', 'Turn', 'Bankruptcy', 'Treasury', 'Liquidation'],
  },
  {
    subsystem: 'economy-treasury',
    pattern: /property|rent|mortgage|auction|trade|treasury/i,
    file: 'economy_treasury.md',
    filterKeywords: ['Treasury', 'Rent', 'Mortgage', 'Auction', 'Conservation'],
  },
  {
    subsystem: 'network-delta',
    pattern: /src[\\/]server|network|socket|delta/i,
    file: 'network_delta.md',
    filterKeywords: ['Socket', 'Port 0', 'Delta', 'Sequence', 'Boundary'],
  },
  {
    subsystem: 'living-tests',
    pattern: /tests[\\/]/i,
    file: 'testing_traps.md',
    filterKeywords: ['Assert Density', 'Zero Dirty Casts', 'Deterministic', 'PRNG'],
  },
];

export function extractTargetFilesFromArgs(args) {
  const files = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--plan' && args[i + 1]) {
      const planPath = path.resolve(repoRoot, args[i + 1]);
      if (fs.existsSync(planPath)) {
        const content = fs.readFileSync(planPath, 'utf8');
        const rMatch = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|ts|mjs|js)\b/g;
        let m;
        while ((m = rMatch.exec(content)) !== null) {
          files.push(m[0]);
        }
      }
      i++;
    } else if (!arg.startsWith('--')) {
      files.push(arg);
    }
  }
  return [...new Set(files)];
}

export function extractGotchaSnippets(filename, filterKeywords) {
  const filePath = path.join(gotchasDir, filename);
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf8');
  const sections = content.split(/\n(?=\d+\.\s+\*\*)/);
  const matched = [];

  for (const sec of sections) {
    if (sec.trim().length === 0) continue;
    const isMatch = filterKeywords.some((kw) =>
      new RegExp(`\\b${kw}\\b`, 'i').test(sec)
    );
    if (isMatch) {
      // Trim to first 12 lines for high-density reading
      const lines = sec.trim().split('\n');
      const snippet = lines.slice(0, 15).join('\n');
      matched.push(snippet);
    }
  }

  return matched;
}

export function dispatchGotchasForFiles(targetFiles) {
  const activeGotchas = new Map();

  for (const tf of targetFiles) {
    for (const mapping of SUBSYSTEM_GOTCHA_MAP) {
      if (mapping.pattern.test(tf)) {
        if (!activeGotchas.has(mapping.file)) {
          activeGotchas.set(mapping.file, {
            subsystem: mapping.subsystem,
            keywords: new Set(mapping.filterKeywords),
          });
        } else {
          mapping.filterKeywords.forEach((kw) =>
            activeGotchas.get(mapping.file).keywords.add(kw)
          );
        }
      }
    }
  }

  const results = [];
  for (const [file, info] of activeGotchas.entries()) {
    const snippets = extractGotchaSnippets(file, Array.from(info.keywords));
    if (snippets.length > 0) {
      results.push({
        subsystem: info.subsystem,
        file,
        snippets,
      });
    }
  }

  return results;
}

export function formatGotchaBrief(dispatched) {
  if (dispatched.length === 0) {
    return 'ℹ️ No specialized gotchas matched target files. Adhere to general AGENTS CONSTITUTION rules.\n';
  }

  let out = '# 🎯 JIT TARGETED GOTCHAS (HIGH-PRECISION CONTEXT)\n\n';
  out += '> Pre-flight SSOT Invariants extracted dynamically for this ticket scope. Read and obey:\n\n';

  const hasClient3d = dispatched.some((g) => g.subsystem === 'client-3d');
  if (hasClient3d) {
    out += `## 📐 SSOT PHYSICS & KINEMATICS REGISTRY (GROUND TRUTH CONSTANTS)\n\n`;
    out += `> DO NOT GUESS OR INVENT MAGIC NUMBERS. Use these physical parameters defined in codebase:\n\n`;
    out += `- **Jail Direct Flight Hop**: \`JAIL_FLIGHT_DURATION = 0.55s\` (Player), \`BOT_JAIL_FLIGHT_DURATION = 0.45s\` (Bot), \`JAIL_LANDING_DURATION = 0.12s\` (\`src/client/3d/pawn_path.ts#L15-17\`). Total Hop = 0.67s (Player) / 0.57s (Bot).\n`;
    out += `- **Jail Parabolic Arc**: \`JAIL_FLIGHT_ARC = 2.8m\` (\`src/client/3d/pawn_path.ts#L14\`).\n`;
    out += `- **Standard Hop**: \`DEFAULT_JUMP_ARC = 0.8m\`, \`HOP_DURATION = 0.15s\`, \`LANDING_DURATION = 0.08s\` (\`src/client/3d/pawn_path.ts#L6-9\`).\n`;
    out += `- **Camera Overview**: Position \`[24.6, 25.3, 24.6]\`, Target \`[1.8, 0, 1.8]\`, FOV \`24\`, Speed \`3.5\` (\`src/client/3d/camera_state_machine.ts#L30-35\`).\n`;
    out += `- **Camera Tile Focus**: Offset \`[5.2, 6.4, 5.2]\` (or side-aware), FOV \`35\`, Speed \`4.0\` (\`src/client/3d/camera_state_machine.ts#L55-59\`).\n`;
    out += `- **Camera Pawn Chase**: Offset \`[3.6, 4.2, 3.6]\`, FOV \`38\`, Speed \`5.2\` (\`src/client/3d/camera_state_machine.ts#L50-54\`).\n`;
    out += `- **Street Chase Config**: Trail \`2.8m\`, Outer \`1.8m\`, Height \`2.8m\`, Target Height \`1.2m\`, Inner Tilt \`0.6m\` (\`src/client/3d/cinematic_chase_camera.ts#L22-30\`).\n\n---\n\n`;
  }

  for (const group of dispatched) {
    out += `## 📌 Subsystem: \`${group.subsystem}\` (${group.file})\n\n`;
    for (const snippet of group.snippets) {
      out += `${snippet}\n\n---\n\n`;
    }
  }

  return out;
}

// Direct CLI Execution
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectExecution) {
  const args = process.argv.slice(2);
  const targetFiles = extractTargetFilesFromArgs(args);

  if (targetFiles.length === 0) {
    console.log('Usage: node scripts/dispatch_gotchas.mjs <file1> <file2> ... [--plan <plan.md>]');
    process.exit(0);
  }

  const dispatched = dispatchGotchasForFiles(targetFiles);
  const brief = formatGotchaBrief(dispatched);
  console.log(brief);
}
