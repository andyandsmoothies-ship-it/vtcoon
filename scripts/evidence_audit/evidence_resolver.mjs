import fs from 'node:fs';
import path from 'node:path';

/**
 * Resolves the physical evidence JSON file for a given ticket ID or path argument.
 */
export function resolveEvidenceFile(
  arg,
  repoRoot = process.cwd(),
  evidenceDir = path.resolve(repoRoot, '.agents', 'evidence')
) {
  if (arg) {
    if (fs.existsSync(arg)) return path.resolve(repoRoot, arg);
    const normalized = arg.replace(/^chaos_sentinel_/i, '').replace(/_snapshot\.json$/i, '').replace(/\.json$/i, '');
    const hyphen = normalized.replace(/^(IMP)(\d+)/i, '$1-$2');
    const candidates = [
      path.join(evidenceDir, arg.endsWith('.json') ? arg : `${arg}.json`),
      path.join(evidenceDir, `chaos_sentinel_${arg}.json`),
      path.join(evidenceDir, `chaos_sentinel_${arg.toLowerCase()}.json`),
      path.join(evidenceDir, `chaos_sentinel_${arg.toUpperCase()}.json`),
      path.join(evidenceDir, `chaos_sentinel_${hyphen}.json`),
      path.join(evidenceDir, `chaos_sentinel_${hyphen.toLowerCase()}.json`),
      path.join(evidenceDir, `${arg}_snapshot.json`),
      path.join(evidenceDir, `${arg.toLowerCase()}_snapshot.json`),
      path.join(evidenceDir, `${arg.toUpperCase()}_snapshot.json`),
      path.join(evidenceDir, `${hyphen}_snapshot.json`),
      path.join(evidenceDir, `${hyphen.toLowerCase()}_snapshot.json`),
      path.join(evidenceDir, `${hyphen.toUpperCase()}_snapshot.json`),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    throw new Error(`Evidence file for ticket "${arg}" not found in ${evidenceDir}`);
  }

  if (!fs.existsSync(evidenceDir)) {
    throw new Error(`Evidence directory does not exist: ${evidenceDir}`);
  }

  const files = fs.readdirSync(evidenceDir)
    .filter((f) => (f.endsWith('_snapshot.json') || f.startsWith('chaos_sentinel_')) && f.endsWith('.json') && f !== 'latest_snapshot.json')
    .map((f) => ({
      file: path.join(evidenceDir, f),
      mtime: fs.statSync(path.join(evidenceDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    console.error('❌ No evidence snapshot or chaos_sentinel JSON files found.');
    process.exit(1);
  }

  return files[0].file;
}

/**
 * Parses and verifies basic envelope fields of evidence JSON.
 */
export function parseEvidenceEnvelope(evidencePath) {
  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  const errors = [];

  const isExecuted = evidence.executed === true || evidence.verdict === 'PASSED' || evidence.verdict === 'APPROVED';
  if (!isExecuted) {
    errors.push('Evidence verification failed: "executed" is not true in evidence JSON.');
  }

  const verdict = evidence.verdict?.toUpperCase();
  if (verdict !== 'PASSED' && verdict !== 'APPROVED') {
    errors.push(`Evidence verification failed: verdict is "${evidence.verdict}", expected PASSED or APPROVED.`);
  }

  return { evidence, errors };
}

/**
 * Creates a ticket matcher function that handles hyphenation, casing, and number normalization.
 */
export function createTicketMatcher(evidence, targetArg) {
  const ticketRaw = (evidence.ticketId || targetArg || '').toLowerCase();
  const ticketClean = ticketRaw.replace(/[^a-z0-9]/g, '');
  const ticketNum = ticketClean.replace(/^[a-z]+/, '');

  const matchesTicket = (filename) => {
    const fl = filename.toLowerCase();
    const flClean = fl.replace(/[^a-z0-9]/g, '');
    return (
      fl.includes(ticketRaw) ||
      flClean.includes(ticketClean) ||
      Boolean(ticketNum && (fl.includes(`imp-${ticketNum}`) || fl.includes(`imp_${ticketNum}`) || flClean.includes(ticketNum)))
    );
  };

  return { ticketRaw, ticketClean, ticketNum, matchesTicket };
}
