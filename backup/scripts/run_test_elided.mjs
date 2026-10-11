#!/usr/bin/env node

/**
 * scripts/run_test_elided.mjs
 * 
 * Lightweight Staged Test Output Elider (arXiv:2609.20804 T4 Context Policy).
 * Truncates bulky passing test logs to protect LLM context windows.
 * Extracts only failing test specs, assertion diffs, and summary counts on failure.
 * 
 * Usage:
 *   node scripts/run_test_elided.mjs tests/client/imp359_player_card_tactile_polish.test.ts
 */

import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/run_test_elided.mjs <test-file-path> [vitest-args...]');
  process.exit(1);
}

const vitestCmd = process.platform === 'win32' ? 'cmd.exe' : 'npx';
const vitestArgs = process.platform === 'win32'
  ? ['/c', `npx --yes vitest run ${args.join(' ')}`]
  : ['vitest', 'run', ...args];

const proc = spawnSync(vitestCmd, vitestArgs, {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, CI: '1' }
});

const stdout = proc.stdout || '';
const stderr = proc.stderr || '';
const fullOutput = `${stdout}\n${stderr}`;

if (proc.status === 0) {
  // Extract summary lines (e.g. "Test Files 1 passed", "Tests 9 passed", "Duration 1.2s")
  const summaryMatches = fullOutput.match(/(?:Test Files|Tests|Duration)[^\n]+/g) || [];
  const summary = summaryMatches.map((s) => s.trim()).join(' | ');
  console.log(`✅ [ELIDED PASS] ${args[0]} ➔ ${summary || 'All tests passed'} (Passing test logs elided per T4 context policy).`);
  process.exit(0);
} else {
  console.error(`❌ [TEST FAILED] ${args[0]}\n`);
  // Extract only failure sections and assertion errors, dropping passing assertions
  const lines = fullOutput.split('\n');
  const failureLines = [];
  let capturing = false;

  for (const line of lines) {
    if (/FAIL|AssertionError|Expected:|Received:|Diff:|- Expected|\+ Received/i.test(line)) {
      capturing = true;
    }
    if (capturing) {
      failureLines.push(line);
      // Stop capturing if we hit a passing indicator or divider
      if (line.includes('✓') && !line.includes('FAIL')) {
        capturing = false;
      }
    }
  }

  if (failureLines.length > 0) {
    console.error(failureLines.join('\n'));
  } else {
    // Fallback: print last 40 lines of output
    console.error(lines.slice(-40).join('\n'));
  }

  process.exit(proc.status ?? 1);
}
