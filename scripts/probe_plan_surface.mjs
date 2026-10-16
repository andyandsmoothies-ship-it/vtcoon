#!/usr/bin/env node

/**
 * scripts/probe_plan_surface.mjs
 * 
 * Station 0: Pre-Flight Surface Area Prober.
 * Fast, 0-token physical verification of target files before drafting plans:
 * 1. Physical line count & SLOC.
 * 2. Total callers across src/ and tests/.
 * 3. Ambient Module Augmentations (`declare module`) in tests/.
 * 4. Exported symbols and consumer impact.
 * 
 * Usage:
 *   node scripts/probe_plan_surface.mjs <file1> <file2> ...
 */

import { probeTargetFilesSurface } from './plan_audit/rules_surface.mjs';

const filePaths = process.argv.slice(2);

if (filePaths.length === 0) {
  console.error('Usage: node scripts/probe_plan_surface.mjs <file1> [file2 ...]');
  process.exit(1);
}

console.log(`\n🔍 [PROBE-SURFACE] Pre-flight Physical Baseline Prober for ${filePaths.length} target file(s):\n`);

const results = probeTargetFilesSurface(filePaths);

for (const res of results) {
  if (!res.exists) {
    console.log(`❌ ${res.path} -> DOES NOT EXIST on disk (New file to be created)`);
    continue;
  }

  console.log(`========================================================================`);
  console.log(`📄 Target: ${res.path}`);
  console.log(`   - Physical Lines: ${res.physicalLines} | SLOC: ${res.sloc}`);
  console.log(`   - Callers in src/**:   ${res.srcCallers.length} file(s)`);
  console.log(`   - Callers in tests/**: ${res.testCallers.length} file(s)`);
  
  if (res.ambientAugmentations.length > 0) {
    console.log(`   🚨 AMBIENT MODULE AUGMENTATIONS (declare module):`);
    for (const am of res.ambientAugmentations) {
      console.log(`      * ${am}`);
    }
  } else {
    console.log(`   ✔️ Ambient Declarations: 0 (Safe from declare module traps)`);
  }

  if (res.testCallers.length > 0) {
    console.log(`   🧪 Living Test Callers (${res.testCallers.length} total):`);
    for (const tc of res.testCallers.slice(0, 10)) {
      console.log(`      * ${tc}`);
    }
    if (res.testCallers.length > 10) {
      console.log(`      ... and ${res.testCallers.length - 10} more test files.`);
    }
  }

  if (res.srcCallers.length > 0) {
    console.log(`   📦 Production Callers (${res.srcCallers.length} total):`);
    for (const sc of res.srcCallers.slice(0, 8)) {
      console.log(`      * ${sc}`);
    }
    if (res.srcCallers.length > 8) {
      console.log(`      ... and ${res.srcCallers.length - 8} more production files.`);
    }
  }
}

console.log(`\n========================================================================`);
console.log(`💡 [ARCHITECTURAL ADVISORY]:`);
console.log(`   - If test callers > 0 and file is to be decommissioned: Retain 1-line re-export stub ('export * from ...').`);
console.log(`   - If ambient augmentations > 0: Never delete file without 'export *' stub or updating test file.`);
console.log(`   - Include all relevant test files in Station 5 regression verification list.`);
console.log(`========================================================================\n`);
