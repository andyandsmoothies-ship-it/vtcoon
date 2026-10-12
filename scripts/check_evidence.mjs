#!/usr/bin/env node

/**
 * scripts/check_evidence.mjs
 * 
 * Verifies Station 4 Chaos Sentinel evidence JSON against real test execution.
 * Facade entrypoint adhering strictly to the Toolchain Facade Invariant (<= 200 LOC).
 * Specialized logic decomposes into Deep Modules in scripts/evidence_audit/.
 * 
 * Usage:
 *   node scripts/check_evidence.mjs [TICKET_OR_FILE_PATH]
 */

import path from 'node:path';
import { resolveEvidenceFile, parseEvidenceEnvelope } from './evidence_audit/evidence_resolver.mjs';
import { auditTestExecution } from './evidence_audit/audit_test_execution.mjs';
import { auditMutationAndWiring } from './evidence_audit/audit_mutation_and_wiring.mjs';
import { auditVisualAndTelemetry } from './evidence_audit/audit_visual_and_telemetry.mjs';
import { auditReportsAndSSOT } from './evidence_audit/audit_reports_and_ssot.mjs';

const repoRoot = process.cwd();
const evidenceDir = path.join(repoRoot, '.agents', 'evidence');
const targetArg = process.argv[2];

let evidencePath;
try {
  evidencePath = resolveEvidenceFile(targetArg, repoRoot, evidenceDir);
} catch (err) {
  console.error(`❌ ${err.message}`);
  process.exit(1);
}
console.log(`🔍 Auditing evidence: ${path.relative(repoRoot, evidencePath)}`);

const { evidence, errors: envelopeErrors } = parseEvidenceEnvelope(evidencePath);
const errors = [...envelopeErrors];

// 1 & 2. Physical Test Execution, Parity & Density
errors.push(...auditTestExecution(evidence, repoRoot, targetArg));

// 2.5 & 2.6. Mutation Sensitivity Floor & Wiring Parity Call-Site Probes
errors.push(...auditMutationAndWiring(evidence, repoRoot, targetArg));

// 3 & 3.1. Physical Visual Screenshots, TopBar Layout Bounds & Camera Telemetry
errors.push(...auditVisualAndTelemetry(evidence, repoRoot, targetArg, evidencePath));

// 4, 5, 6 & 7. Physical Review Reports, Final SSOT Acceptance Report & Knowledge Fold
errors.push(...auditReportsAndSSOT(evidence, repoRoot, targetArg, evidencePath));

if (errors.length > 0) {
  console.error(`\n❌ EVIDENCE AUDIT FAILED (${errors.length} issue${errors.length > 1 ? 's' : ''}):`);
  errors.forEach((e, idx) => console.error(`  [${idx + 1}] ${e}`));
  process.exit(1);
}

console.log('✅ Evidence verified: physical test counts match, floors respected, zero tautological mutants.\n');
process.exit(0);
