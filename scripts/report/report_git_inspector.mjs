import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Finds a file matching ticket patterns within a directory.
 */
export function findTicketFile(dir, prefix, id) {
  if (!fs.existsSync(dir)) return null;
  const idNorm = id.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  const idNum = idNorm.replace(/^[a-z]+/, '');
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fNorm = f.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
    if (prefix) {
      const pNorm = prefix.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
      if (!fNorm.startsWith(pNorm)) continue;
    }
    const pattern = new RegExp(`(^|[^a-z0-9])(?:imp[-_]?)?${idNum}([^a-z0-9]|$)`, 'i');
    if (fNorm.includes(idNorm) || pattern.test(fNorm)) {
      return path.join(dir, f);
    }
  }
  return null;
}

/**
 * Detects and normalizes Ticket ID from arguments or git status.
 */
export function detectTicketId(posArgs) {
  let ticketId = posArgs[0] ? posArgs[0].toUpperCase() : '';
  if (!ticketId) {
    try {
      const gitDiff = execSync('git status --short', { encoding: 'utf8' });
      const match = gitDiff.match(/(?:PLAN_|imp|IMP[-_])(\d+[A-Za-z]?)/i);
      if (match && match[1]) {
        ticketId = `IMP-${match[1].toUpperCase()}`;
      }
    } catch {
      // safe ignore
    }
  }
  if (!ticketId) return null;
  return ticketId.replace(/^(IMP)(\d+)/i, '$1-$2');
}

/**
 * Resolves plan file using smart matching against current git modified files.
 */
export function resolvePlan(plansDir, ticketId) {
  let planTitle = `Implementation for ${ticketId}`;
  let planSubsystem = 'domain-core';
  let planPath = null;
  const planRegisteredFiles = new Set();
  const baselineFiles = new Set();

  if (!fs.existsSync(plansDir)) {
    return { planTitle, planSubsystem, planPath, planRegisteredFiles, baselineFiles };
  }

  const ticketNormalized = ticketId.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const ticketNum = ticketId.replace(/^[A-Z]+-?/i, '');
  const planFiles = fs.readdirSync(plansDir).filter((f) => {
    if (!f.endsWith('.md')) return false;
    const normF = f.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return (normF.includes(ticketNormalized) || normF.includes(`IMP${ticketNum}`)) && f.startsWith('PLAN_');
  });

  if (planFiles.length === 1) {
    planPath = path.join(plansDir, planFiles[0]);
  } else if (planFiles.length > 1) {
    let currentGitFiles = [];
    try {
      const gitOut = execSync('git status --porcelain', { encoding: 'utf8' });
      currentGitFiles = gitOut
        .split('\n')
        .map((l) => l.trim().slice(2).trim().replace(/^"|"$/g, '').replace(/\\/g, '/'))
        .filter((f) => f.startsWith('src/') || f.startsWith('tests/'));
    } catch {}

    let bestPlan = planFiles[0];
    let maxMatch = -1;

    for (const pf of planFiles) {
      const fullPf = path.join(plansDir, pf);
      const content = fs.readFileSync(fullPf, 'utf8');
      const reg = new Set();
      const rMatch = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|mjs|css|ts|js)\b/g;
      let m;
      while ((m = rMatch.exec(content)) !== null) {
        reg.add(m[0].replace(/\\/g, '/'));
      }
      const matchCount = currentGitFiles.filter((f) => reg.has(f)).length;
      if (matchCount > maxMatch) {
        maxMatch = matchCount;
        bestPlan = pf;
      }
    }
    planPath = path.join(plansDir, bestPlan);
    console.log(`📌 [SMART PLAN] Selected '${bestPlan}' among ${planFiles.length} candidates (matches ${maxMatch} git files).`);
  }

  if (planPath) {
    const planContent = fs.readFileSync(planPath, 'utf8');
    const titleMatch = planContent.match(/^#\s*TICKET:\s*(.+)$/m) || planContent.match(/^#\s*(.+)$/m);
    if (titleMatch) planTitle = titleMatch[1].trim();
    const subMatch = planContent.match(/>\s*\*\*Phân hệ mục tiêu:\*\*\s*`?([a-zA-Z0-9_-]+)`?/) ||
                     planContent.match(/[-*]\s*\*\*(?:Subsystem|Phân hệ(?: mục tiêu)?):\*\*\s*`?([a-zA-Z0-9_-]+)`?/i);
    if (subMatch) planSubsystem = subMatch[1].trim();

    // Extract registered files from the plan specification (strictly isolating direct scope from baseline dependencies)
    const directScopeMatch = planContent.match(/[-*]\s*\*\*Direct Scope[^*]*\*\*:\s*([\s\S]*?)(?:\n\s*[-*]\s*\*\*(?:Baseline Working Tree|Prior In-Flight Scope)|\n\s*##|$)/i);
    if (directScopeMatch) {
      const dRegex = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|mjs|css|ts|js)\b/g;
      let dm;
      while ((dm = dRegex.exec(directScopeMatch[1])) !== null) {
        planRegisteredFiles.add(dm[0].replace(/\\/g, '/'));
      }
    } else {
      const contentWithoutBaselines = planContent.replace(/(?:>|\s)*[-*]?\s*\*\*(?:Baseline Working Tree Dependencies|Prior In-Flight Scope)[^*]*\*\*[\s\S]*?(?=\n\s*(?:[-*]\s*\*\*|##|$))/i, '');
      const regex = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|mjs|css|ts|js)\b/g;
      let m;
      while ((m = regex.exec(contentWithoutBaselines)) !== null) {
        planRegisteredFiles.add(m[0].replace(/\\/g, '/'));
      }
    }

    const baselineMatch = planContent.match(/>\s*\*\*Baseline Working Tree Dependencies[^*]*:\*\*\s*(.+)$/m);
    if (baselineMatch) {
      const bRegex = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|mjs|css|ts|js)\b/g;
      let bm;
      while ((bm = bRegex.exec(baselineMatch[1])) !== null) {
        baselineFiles.add(bm[0].replace(/\\/g, '/'));
      }
    }
  }

  return { planTitle, planSubsystem, planPath, planRegisteredFiles, baselineFiles };
}

/**
 * Resolves modified files, snapshot data, and contract test details.
 */
export function resolveModifiedFilesAndTests(repoRoot, evidenceDir, ticketId, ticketLower, planRegisteredFiles, planPath, initialSubsystem) {
  let snapshotData = null;
  const snapshotCandidates = [
    path.join(evidenceDir, `${ticketId}_snapshot.json`),
    path.join(evidenceDir, `${ticketLower}_snapshot.json`),
  ];
  for (const sc of snapshotCandidates) {
    if (fs.existsSync(sc)) {
      try {
        snapshotData = JSON.parse(fs.readFileSync(sc, 'utf8'));
        break;
      } catch {}
    }
  }

  let modifiedFiles = [];
  if (snapshotData && Array.isArray(snapshotData.files) && snapshotData.files.length > 0) {
    modifiedFiles = snapshotData.files.map((f) => (typeof f === 'string' ? f : f.path).replace(/\\/g, '/'));
    if (Array.isArray(snapshotData.summary?.matchingContractTests)) {
      for (const ct of snapshotData.summary.matchingContractTests) {
        modifiedFiles.push(ct.replace(/\\/g, '/'));
      }
    }
  } else if (snapshotData && Array.isArray(snapshotData.filesModified) && snapshotData.filesModified.length > 0) {
    modifiedFiles = snapshotData.filesModified.map((f) => f.replace(/\\/g, '/'));
  } else {
    try {
      const gitOut = execSync('git status --porcelain', { encoding: 'utf8' });
      const lines = gitOut.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const filePart = trimmed.slice(2).trim().replace(/^"|"$/g, '');
        if ((filePart.startsWith('src/') || filePart.startsWith('tests/')) && fs.existsSync(path.resolve(repoRoot, filePart))) {
          modifiedFiles.push(filePart.replace(/\\/g, '/'));
        }
      }
    } catch {}
  }

  // Scope Confinement: Filter modified files against registered files in plan specification
  if (planRegisteredFiles.size > 0 && (!snapshotData || !snapshotData.files)) {
    const scopedFiles = modifiedFiles.filter((f) => planRegisteredFiles.has(f));
    if (scopedFiles.length > 0) {
      modifiedFiles = scopedFiles;
    } else {
      modifiedFiles = Array.from(planRegisteredFiles).filter((f) => fs.existsSync(path.resolve(repoRoot, f)));
    }
  }

  // Deduplicate modifiedFiles
  modifiedFiles = Array.from(new Set(modifiedFiles));

  // Subsystem Detection fallback
  let planSubsystem = initialSubsystem;
  if (!planPath || planSubsystem === 'domain-core') {
    const prodFile = modifiedFiles.find((f) => f.startsWith('src/'));
    if (prodFile) {
      if (prodFile.startsWith('src/client/ui/')) planSubsystem = 'client-ui';
      else if (prodFile.startsWith('src/client/3d/')) planSubsystem = 'client-3d';
      else if (prodFile.startsWith('src/client/')) planSubsystem = 'client-state';
      else if (prodFile.startsWith('src/domain/')) planSubsystem = 'domain-core';
      else if (prodFile.startsWith('src/server/insolvency') || prodFile.startsWith('src/server/room_property_coordinator') || prodFile.startsWith('src/server/turn_loop')) planSubsystem = 'server-lifecycle';
      else if (prodFile.startsWith('src/server/')) planSubsystem = 'server-network';
    }
  }

  // Locate Contract Test Suite
  let contractFile = null;
  let contractTestCount = 0;
  let contractAssertCount = 0;

  const station1EarlyFile = findTicketFile(evidenceDir, 'station1', ticketId);
  let station1EarlyData = null;
  if (station1EarlyFile) {
    try {
      station1EarlyData = JSON.parse(fs.readFileSync(station1EarlyFile, 'utf8'));
    } catch {}
  }

  if (station1EarlyData?.testFile) {
    contractFile = station1EarlyData.testFile.replace(/\\/g, '/');
    contractTestCount = station1EarlyData.testCount ?? 0;
    contractAssertCount = station1EarlyData.expectCount ?? 0;
    if (contractAssertCount === 0 && fs.existsSync(path.resolve(repoRoot, contractFile))) {
      const testContent = fs.readFileSync(path.resolve(repoRoot, contractFile), 'utf8');
      contractAssertCount = (testContent.match(/\bexpect\s*\(/g) || []).length;
      if (contractTestCount === 0) {
        contractTestCount = (testContent.match(/\bit\s*\(/g) || []).length;
      }
    }
  } else if (snapshotData?.contractTests?.file) {
    contractFile = snapshotData.contractTests.file.replace(/\\/g, '/');
    contractTestCount = snapshotData.contractTests.total ?? 0;
    if (fs.existsSync(path.resolve(repoRoot, contractFile))) {
      const testContent = fs.readFileSync(path.resolve(repoRoot, contractFile), 'utf8');
      contractAssertCount = (testContent.match(/\bexpect\s*\(/g) || []).length;
      if (contractTestCount === 0) {
        contractTestCount = (testContent.match(/\bit\s*\(/g) || []).length;
      }
    }
  } else if (snapshotData?.testExecution?.suite) {
    contractFile = snapshotData.testExecution.suite.replace(/\\/g, '/');
    contractTestCount = snapshotData.testExecution.passedCount ?? 0;
    if (fs.existsSync(path.resolve(repoRoot, contractFile))) {
      const testContent = fs.readFileSync(path.resolve(repoRoot, contractFile), 'utf8');
      contractAssertCount = (testContent.match(/\bexpect\s*\(/g) || []).length;
    }
  }

  if (!contractFile) {
    const testDir = path.join(repoRoot, 'tests', 'contracts');
    if (fs.existsSync(testDir)) {
      const contractFiles = fs.readdirSync(testDir).filter((f) => f.toLowerCase().includes(ticketLower.replace('-', '')) || f.toLowerCase().includes(ticketLower));
      if (contractFiles.length > 0) {
        contractFile = `tests/contracts/${contractFiles[0]}`;
        const testContent = fs.readFileSync(path.join(repoRoot, contractFile), 'utf8');
        contractTestCount = (testContent.match(/\bit\s*\(/g) || []).length;
        contractAssertCount = (testContent.match(/\bexpect\s*\(/g) || []).length;
      }
    }
  }

  if (!contractFile) {
    const candidateTest = modifiedFiles.find((f) => f.startsWith('tests/') && f.endsWith('.test.ts'));
    if (candidateTest && fs.existsSync(path.resolve(repoRoot, candidateTest))) {
      contractFile = candidateTest;
      const testContent = fs.readFileSync(path.resolve(repoRoot, contractFile), 'utf8');
      contractTestCount = (testContent.match(/\bit\s*\(/g) || []).length;
      contractAssertCount = (testContent.match(/\bexpect\s*\(/g) || []).length;
    }
  }

  const srcFiles = modifiedFiles.filter((f) => f.startsWith('src/'));
  const testFiles = modifiedFiles.filter((f) => f.startsWith('tests/'));

  return {
    snapshotData,
    modifiedFiles,
    srcFiles,
    testFiles,
    contractFile,
    contractTestCount,
    contractAssertCount,
    planSubsystem
  };
}

/**
 * Resolves path to final report file.
 */
export function resolveFinalReportPath(repoRoot, ticketId, ticketClean, ticketLower, ticketNum, planPath, planTitle) {
  const improvementsDir = path.join(repoRoot, 'docs', 'reports', 'improvements');
  if (!fs.existsSync(improvementsDir)) {
    fs.mkdirSync(improvementsDir, { recursive: true });
  }

  const impFiles = fs.readdirSync(improvementsDir);
  const existing = impFiles.find((f) => {
    if (!f.endsWith('.md')) return false;
    const fn = f.toLowerCase();
    const pattern = new RegExp(`^imp[-_]?${ticketNum}[-_]`, 'i');
    return pattern.test(fn);
  });
  if (existing) {
    return path.join(improvementsDir, existing);
  }

  let slug = '';
  if (planPath) {
    const base = path.basename(planPath, '.md');
    const sm = base.match(/^PLAN_(?:IMP[-_]?)?[A-Za-z0-9]+_(.+)$/i) || base.match(/^PLAN_[A-Za-z0-9]+_(.+)$/i);
    if (sm) slug = sm[1].toLowerCase().replace(/_/g, '-');
  }
  if (!slug) {
    slug = planTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'report';
  }
  slug = slug
    .replace(new RegExp(`^(?:${ticketClean}|${ticketLower}|${ticketId}|${ticketId.replace('-', '')}|${ticketNum})-?`, 'i'), '')
    .replace(/^-+/, '');
  if (!slug) slug = 'report';
  return path.join(improvementsDir, `${ticketId}-${slug}_report.md`);
}
