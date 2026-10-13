#!/usr/bin/env node

/**
 * scripts/doctor.mjs
 *
 * Pre-flight Environment Readiness Doctor for VTCOON.
 * Fast, model-free verification answering: "Is this instance healthy and ready to drive?"
 * Facade entrypoint adhering strictly to the Toolchain Facade Invariant (<= 200 LOC).
 *
 * Usage:
 *   npm run doctor
 *   node scripts/doctor.mjs
 */

import { checkSystemEnvironment } from './doctor/system_env.mjs';
import { checkNetworkPorts } from './doctor/network_ports.mjs';
import { checkWorkspaceIntegrity } from './doctor/workspace_integrity.mjs';
import { checkGraphicsContext } from './doctor/graphics_context.mjs';

export {
  checkSystemEnvironment,
  checkNetworkPorts,
  checkWorkspaceIntegrity,
  checkGraphicsContext
};

function formatStatus(status) {
  switch (status) {
    case 'PASS':
      return '\x1b[32mPASS\x1b[0m';
    case 'WARN':
      return '\x1b[33mWARN\x1b[0m';
    case 'FAIL':
      return '\x1b[31mFAIL\x1b[0m';
    default:
      return status;
  }
}

export async function runDoctor(repoRoot = process.cwd()) {
  console.log('\n======================================================');
  console.log('🩺 VTCOON SYSTEM READINESS DOCTOR');
  console.log('======================================================\n');

  const envChecks = checkSystemEnvironment();
  const netChecks = await checkNetworkPorts();
  const wsChecks = checkWorkspaceIntegrity(repoRoot);
  const gfxChecks = checkGraphicsContext(repoRoot);

  const allChecks = [...envChecks, ...netChecks, ...wsChecks, ...gfxChecks];

  const colCat = 16;
  const colName = 32;
  const colStat = 6;

  console.log(
    `${'Category'.padEnd(colCat)} | ${'Check'.padEnd(colName)} | ${'Status'.padEnd(colStat)} | Details`
  );
  console.log('-'.repeat(90));

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const check of allChecks) {
    if (check.status === 'PASS') passCount++;
    else if (check.status === 'WARN') warnCount++;
    else if (check.status === 'FAIL') failCount++;

    const catStr = check.category.padEnd(colCat);
    const nameStr = check.name.padEnd(colName);
    const statStr = formatStatus(check.status).padEnd(colStat + (check.status === 'PASS' || check.status === 'FAIL' || check.status === 'WARN' ? 9 : 0));

    console.log(`${catStr} | ${nameStr} | ${statStr} | ${check.message}`);
    if (check.details) {
      console.log(`${''.padEnd(colCat)}   ${''.padEnd(colName)}   ↳ \x1b[2m${check.details}\x1b[0m`);
    }
  }

  console.log('\n======================================================');
  console.log(`Summary: ${passCount} Passed, ${warnCount} Warnings, ${failCount} Failed`);

  if (failCount > 0) {
    console.log('\x1b[31m❌ DOCTOR VERDICT: FAILED. Remediation required before running tests.\x1b[0m\n');
    return false;
  }

  console.log('\x1b[32m🎉 DOCTOR VERDICT: HEALTHY. System is ready for development & verification.\x1b[0m\n');
  return true;
}

// Direct CLI invocation
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runDoctor().then((passed) => {
    process.exit(passed ? 0 : 1);
  });
}
