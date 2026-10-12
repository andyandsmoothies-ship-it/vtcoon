import fs from 'node:fs';
import path from 'node:path';

/**
 * Audits mutation sensitivity floors, source-level mutations, and Wiring Parity sentinel probes.
 */
export function auditMutationAndWiring(evidence, repoRoot, targetArg) {
  const errors = [];
  if (!evidence.mutationSensitivityProbe) return errors;

  const tested = evidence.mutationSensitivityProbe.mutantsTested ?? 0;
  const isExempt = Boolean(evidence.mutationSensitivityProbe.waiverReason);
  const isMicro = evidence.isMicroSlice === true || /micro|slice[_\-]?\d+/i.test(evidence.ticketId || targetArg || '');
  const minMutantFloor = isMicro ? 8 : 14;

  if (tested < minMutantFloor && !isExempt) {
    errors.push(
      `Mutation floor violation: Probe tested ${tested} mutants, minimum requirement is ${minMutantFloor} mutants${isMicro ? ' (Micro-Slice floor: 8)' : ''} (or specify explicit waiverReason in evidence JSON).`
    );
  }

  const srcMutants = evidence.mutationSensitivityProbe.sourceLevelMutantsTested ?? 0;
  const targetFiles = evidence.targetFiles || evidence.modifiedFiles || [];
  const hasModifiedSrc = targetFiles.some((f) => /^(?:src\/|src\\)/i.test(f));

  if (hasModifiedSrc && srcMutants === 0 && !isExempt && !evidence.pureLogicWaiver) {
    errors.push(
      `Source-level mutation floor violation: Probe tested 0 mutants on production source files (sourceLevelMutantsTested: 0). Contract inversion alone is insufficient; mutants must directly challenge modified production code.`
    );
  }

  // Wiring Parity & Call-Site Mutation Verification
  const helperFiles = targetFiles.filter((f) => /_(?:helpers|detect|math|calc)\.[a-z]+$/i.test(f));
  const consumerFiles = targetFiles.filter(
    (f) => /\.(?:tsx|ts)$/i.test(f) && !/_(?:helpers|detect|math|calc)\.[a-z]+$/i.test(f) && !/types?\.[a-z]+$/i.test(f)
  );

  if (helperFiles.length > 0 && consumerFiles.length > 0) {
    const probeFileCandidates = [
      path.join(repoRoot, 'scripts', 'sentinel_probes', `${(evidence.ticketId || targetArg || '').toUpperCase()}.json`),
      path.join(repoRoot, 'scripts', 'sentinel_probes', `${evidence.ticketId || targetArg || ''}.json`),
    ];
    const probeFilePath = probeFileCandidates.find((p) => fs.existsSync(p));
    if (probeFilePath) {
      try {
        const probeList = JSON.parse(fs.readFileSync(probeFilePath, 'utf8'));
        if (Array.isArray(probeList) && probeList.length > 0) {
          const hasConsumerMutant = probeList.some((p) =>
            consumerFiles.some((cf) => p.file && p.file.replace(/\\/g, '/').endsWith(cf.replace(/\\/g, '/')))
          );
          if (!hasConsumerMutant) {
            errors.push(
              `[Wiring Parity Violation] Ticket modifies both helper (${helperFiles.map((f) => path.basename(f)).join(', ')}) and consumer (${consumerFiles.map((f) => path.basename(f)).join(', ')}), but scripts/sentinel_probes contains 0 mutants targeting consumer call-sites! At least 1 mutant must challenge the consumer call-site to prevent tautological testing.`
            );
          }
        }
      } catch (err) {}
    }
  }

  return errors;
}
