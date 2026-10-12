import fs from 'node:fs';
import path from 'node:path';

/**
 * scripts/plan_audit/worktree_scope_resolver.mjs
 * 
 * Multi-Ticket Worktree Awareness & Scope Isolation Resolver
 * Automatically identifies modified uncommitted files belonging to prior in-flight
 * or completed tickets to support multi-ticket batch commits without false scope creep.
 */

/**
 * Extracts a normalized ticket ID tag from a file name or string.
 * e.g. "PLAN_IMP_363_BOARD_TILES.md" -> "IMP-363"
 * e.g. "imp-364_snapshot.json" -> "IMP-364"
 */
export function extractTicketTag(filename) {
  const match = filename.match(/(?:PLAN_)?([A-Z]+)[-_]?(\d+[A-Z]?)/i);
  if (match) {
    return `${match[1].toUpperCase()}-${match[2].toUpperCase()}`;
  }
  return path.basename(filename).replace(/\.[^.]+$/, '');
}

/**
 * Scans .agents/plans/, .agents/evidence/, and docs/reports/improvements/
 * to discover all files belonging to other (prior) tickets in the worktree.
 * 
 * @param {string} currentPlanPath - Path to the active ticket's plan (to exclude)
 * @param {Set<string>} [currentRegisteredFiles] - Set of files registered in active plan
 * @returns {Map<string, string>} Map of relativeFilePath -> originTicketTag
 */
export function extractPriorTicketsFiles(currentPlanPath = '', currentRegisteredFiles = new Set()) {
  const priorMap = new Map();
  const repoRoot = process.cwd();
  const currentPlanBase = currentPlanPath ? path.basename(currentPlanPath).toUpperCase() : '';
  const currentTag = currentPlanBase ? extractTicketTag(currentPlanBase) : '';

  // 1. Scan other plans in .agents/plans/
  const plansDir = path.resolve(repoRoot, '.agents', 'plans');
  if (fs.existsSync(plansDir)) {
    try {
      const planFiles = fs.readdirSync(plansDir).filter((f) => f.startsWith('PLAN_') && f.endsWith('.md'));
      for (const pf of planFiles) {
        if (pf.toUpperCase() === currentPlanBase) continue;
        const tag = extractTicketTag(pf);
        if (tag === currentTag && currentTag) continue;

        const fullPath = path.join(plansDir, pf);
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const regex = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|mjs|css|ts|js)\b/g;
          let match;
          while ((match = regex.exec(content)) !== null) {
            const filePath = match[0].replace(/\\/g, '/');
            if (!currentRegisteredFiles.has(filePath) && !priorMap.has(filePath)) {
              priorMap.set(filePath, `Plan: ${tag}`);
            }
          }
        } catch {}
      }
    } catch {}
  }

  // 2. Scan completed evidence snapshots in .agents/evidence/*_snapshot.json
  const evidenceDir = path.resolve(repoRoot, '.agents', 'evidence');
  if (fs.existsSync(evidenceDir)) {
    try {
      const snapFiles = fs.readdirSync(evidenceDir).filter((f) => f.endsWith('_snapshot.json'));
      for (const sf of snapFiles) {
        const tag = extractTicketTag(sf);
        if (tag === currentTag && currentTag) continue;

        try {
          const snap = JSON.parse(fs.readFileSync(path.join(evidenceDir, sf), 'utf8'));
          const snapSlice = snap.sliceId || snap.ticketId || tag;
          if (snapSlice.toUpperCase() === currentTag && currentTag) continue;

          const filesList = [];
          if (Array.isArray(snap.files)) {
            for (const f of snap.files) filesList.push(typeof f === 'string' ? f : f.path);
          }
          if (Array.isArray(snap.filesModified)) {
            for (const f of snap.filesModified) filesList.push(f);
          }
          if (Array.isArray(snap.summary?.matchingContractTests)) {
            for (const f of snap.summary.matchingContractTests) filesList.push(f);
          }

          for (const rawFile of filesList) {
            const normalized = rawFile.replace(/\\/g, '/');
            if (!currentRegisteredFiles.has(normalized) && !priorMap.has(normalized)) {
              priorMap.set(normalized, `Evidence: ${snapSlice}`);
            }
          }
        } catch {}
      }
    } catch {}
  }

  // 3. Scan completed reports in docs/reports/improvements/
  const reportsDir = path.resolve(repoRoot, 'docs', 'reports', 'improvements');
  if (fs.existsSync(reportsDir)) {
    try {
      const reportFiles = fs.readdirSync(reportsDir).filter((f) => f.startsWith('IMP-') && f.endsWith('.md'));
      for (const rf of reportFiles) {
        const tag = extractTicketTag(rf);
        if (tag === currentTag && currentTag) continue;

        try {
          const content = fs.readFileSync(path.join(reportsDir, rf), 'utf8');
          const regex = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|mjs|css|ts|js)\b/g;
          let match;
          while ((match = regex.exec(content)) !== null) {
            const filePath = match[0].replace(/\\/g, '/');
            if (!currentRegisteredFiles.has(filePath) && !priorMap.has(filePath)) {
              priorMap.set(filePath, `Report: ${tag}`);
            }
          }
        } catch {}
      }
    } catch {}
  }

  // 4. Resolve twin helper / decomposed files imported by recognized prior files
  for (const [priorFile, tag] of Array.from(priorMap.entries())) {
    const priorAbs = path.resolve(repoRoot, priorFile);
    if (fs.existsSync(priorAbs)) {
      try {
        const text = fs.readFileSync(priorAbs, 'utf8');
        const importRegex = /(?:from\s+['"]|import\s+['"])(?:\.\/|\.\.\/)([^'"]+)['"]/g;
        let m;
        while ((m = importRegex.exec(text)) !== null) {
          const importRel = m[1];
          const dir = path.dirname(priorAbs);
          const candidates = [
            path.resolve(dir, importRel),
            path.resolve(dir, `${importRel}.ts`),
            path.resolve(dir, `${importRel}.tsx`),
            path.resolve(dir, `${importRel}.js`),
            path.resolve(dir, `${importRel}.mjs`),
          ];
          for (const cand of candidates) {
            if (fs.existsSync(cand) && !fs.statSync(cand).isDirectory()) {
              const rel = path.relative(repoRoot, cand).replace(/\\/g, '/');
              if (!currentRegisteredFiles.has(rel) && !priorMap.has(rel)) {
                priorMap.set(rel, `${tag} (Helper)`);
              }
            }
          }
        }
      } catch {}
    }
  }

  return priorMap;
}

/**
 * Autonomously detects active slice ID from newest plan in .agents/plans/
 */
export function detectActiveSliceId(repoRoot) {
  const plansDir = path.resolve(repoRoot, '.agents', 'plans');
  if (!fs.existsSync(plansDir)) return null;

  try {
    const plans = fs.readdirSync(plansDir)
      .filter((f) => f.startsWith('PLAN_') && f.endsWith('.md'))
      .map((f) => ({ name: f, time: fs.statSync(path.join(plansDir, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    if (plans.length > 0) {
      return extractTicketTag(plans[0].name);
    }
  } catch {}

  return null;
}
