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
                     planContent.match(/[-*]\s*\*\*(?:Target Subsystem|Subsystem Boundary Isolation|Subsystem|Phân hệ(?: mục tiêu)?)[^*]*\*\*:[^`\n]*`([a-zA-Z0-9_-]+)`/i) ||
                     planContent.match(/[-*]\s*\*\*(?:Subsystem|Phân hệ(?: mục tiêu)?):\*\*\s*`?([a-zA-Z0-9_-]+)`?/i);
    if (subMatch) planSubsystem = subMatch[1].trim();

    // Extract registered files from the plan specification (strictly isolating direct scope from baseline dependencies)
    const directScopeMatch = planContent.match(/[-*]\s*\*\*Direct Scope[^*]*\*\*:\s*([\s\S]*?)(?:\n\s*[-*]\s*\*\*(?:Referenced Contracts|Baseline Working Tree|Prior In-Flight Scope)|\n\s*##|$)/i);
    if (directScopeMatch) {
      const dRegex = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|mjs|css|ts|js)\b/g;
      let dm;
      while ((dm = dRegex.exec(directScopeMatch[1])) !== null) {
        planRegisteredFiles.add(dm[0].replace(/\\/g, '/'));
      }
    } else {
      let contentWithoutBaselines = planContent.replace(/(?:>|\s)*[-*]?\s*\*\*(?:Baseline Working Tree Dependencies|Prior In-Flight Scope|Bảo toàn môi trường làm việc|Baseline)[^*]*\*\*[\s\S]*?(?=\n\s*(?:[-*]\s*\*\*|##|$))/gi, '');
      contentWithoutBaselines = contentWithoutBaselines.replace(/(?:^|\n)\s*(?:\d+\.|\*|-)?\s*Bảo toàn môi trường làm việc[\s\S]*?(?=\n\s*(?:[-*]\s*\*\*|##|\d+\.)|$)/gi, '');
      const regex = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|mjs|css|ts|js)\b/g;
      let m;
      while ((m = regex.exec(contentWithoutBaselines)) !== null) {
        planRegisteredFiles.add(m[0].replace(/\\/g, '/'));
      }
    }

    const baselineMatch = planContent.match(/(?:>|\s)*[-*]?\s*\*\*(?:Baseline Working Tree Dependencies|Prior In-Flight Scope|Bảo toàn môi trường làm việc)[^*]*:\*\*\s*(.+)$/m) ||
                          planContent.match(/(?:^|\n)\s*(?:\d+\.|\*|-)?\s*Bảo toàn môi trường làm việc[^\n]*:\s*([\s\S]*?)(?=\n\s*(?:##|\d+\.)|$)/i);
    if (baselineMatch) {
      const bRegex = /(?:src|tests)\/[a-zA-Z0-9_./-]+\.(?:tsx|mjs|css|ts|js)\b/g;
      let bm;
      const targetStr = baselineMatch[1] || baselineMatch[0];
      while ((bm = bRegex.exec(targetStr)) !== null) {
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
  }

  // Always merge real-time Git modifications (e.g. updated living tests or concurrent fixes)
  try {
    const gitOut = execSync('git status --porcelain -uall', { encoding: 'utf8' });
    const lines = gitOut.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const filePart = trimmed.slice(2).trim().replace(/^"|"$/g, '').replace(/\\/g, '/');
      if ((filePart.startsWith('src/') || filePart.startsWith('tests/')) &&
          !filePart.includes('.tmp_') &&
          fs.existsSync(path.resolve(repoRoot, filePart))) {
        modifiedFiles.push(filePart);
      }
    }
  } catch {}

  // Scope Confinement: Filter modified files against registered files in plan specification
  if (planRegisteredFiles.size > 0) {
    const registeredProdFiles = Array.from(planRegisteredFiles).filter((f) => f.startsWith('src/') && fs.existsSync(path.resolve(repoRoot, f)));
    const scopedFiles = modifiedFiles.filter((f) => planRegisteredFiles.has(f));
    const hasProdFiles = scopedFiles.some((f) => f.startsWith('src/'));

    if (hasProdFiles) {
      modifiedFiles = scopedFiles;
    } else {
      // Snapshot only captured test files: combine scoped files with registered production files
      modifiedFiles = Array.from(new Set([...scopedFiles, ...registeredProdFiles]));
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
      else if (prodFile.startsWith('src/client/events/')) planSubsystem = 'client-events';
      else if (prodFile.startsWith('src/client/')) planSubsystem = 'client-state';
      else if (prodFile.startsWith('src/domain/')) planSubsystem = 'domain-core';
      else if (prodFile.startsWith('src/server/insolvency') || prodFile.startsWith('src/server/room_property_coordinator') || prodFile.startsWith('src/server/turn_loop')) planSubsystem = 'server-lifecycle';
      else if (prodFile.startsWith('src/server/')) planSubsystem = 'server-network';
    }
  }

  // Locate Contract Test Suite
  let contractFile = null;

  const station1EarlyFile = findTicketFile(evidenceDir, 'station1', ticketId);
  let station1EarlyData = null;
  if (station1EarlyFile) {
    try {
      station1EarlyData = JSON.parse(fs.readFileSync(station1EarlyFile, 'utf8'));
    } catch {}
  }

  if (station1EarlyData?.testFile) {
    contractFile = station1EarlyData.testFile.replace(/\\/g, '/');
  } else if (snapshotData?.contractTests?.file) {
    contractFile = snapshotData.contractTests.file.replace(/\\/g, '/');
  } else if (snapshotData?.testExecution?.suite) {
    contractFile = snapshotData.testExecution.suite.replace(/\\/g, '/');
  }

  if (!contractFile) {
    const testDir = path.join(repoRoot, 'tests', 'contracts');
    if (fs.existsSync(testDir)) {
      const contractFiles = fs.readdirSync(testDir).filter((f) => f.toLowerCase().includes(ticketLower.replace('-', '')) || f.toLowerCase().includes(ticketLower));
      if (contractFiles.length > 0) {
        contractFile = `tests/contracts/${contractFiles[0]}`;
      }
    }
  }

  if (!contractFile) {
    const candidateTest = modifiedFiles.find((f) => f.startsWith('tests/') && f.endsWith('.test.ts'));
    if (candidateTest && fs.existsSync(path.resolve(repoRoot, candidateTest))) {
      contractFile = candidateTest;
    }
  }

  const { testCount: contractTestCount, assertCount: contractAssertCount } = extractContractTestCounts(
    repoRoot,
    contractFile,
    ticketId,
    snapshotData || station1EarlyData
  );

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

/**
 * Authoritatively extracts contract test counts and assertions from JSON or Vitest execution,
 * completely avoiding raw regex matches on commented-out code.
 */
export function extractContractTestCounts(repoRoot, contractFile, ticketId = '', snapshotData = null) {
  let testCount = 0;
  let assertCount = 0;

  // 1. Check evidence json snapshot first
  const evidenceDir = path.join(repoRoot, '.agents', 'evidence');
  const station1File = ticketId ? findTicketFile(evidenceDir, 'station1', ticketId) : null;
  if (station1File && fs.existsSync(station1File)) {
    try {
      const s1Data = JSON.parse(fs.readFileSync(station1File, 'utf8'));
      if (s1Data.testCount !== undefined) testCount = s1Data.testCount;
      if (s1Data.expectCount !== undefined) assertCount = s1Data.expectCount;
    } catch {}
  }

  if (testCount === 0 && snapshotData) {
    if (snapshotData.testExecution?.passedCount !== undefined) {
      testCount = snapshotData.testExecution.passedCount;
    } else if (snapshotData.contractTests?.total !== undefined) {
      testCount = snapshotData.contractTests.total;
    } else if (snapshotData.testCount !== undefined) {
      testCount = snapshotData.testCount;
    }
    if (snapshotData.testExecution?.expectCount !== undefined) {
      assertCount = snapshotData.testExecution.expectCount;
    } else if (snapshotData.assertCount !== undefined) {
      assertCount = snapshotData.assertCount;
    }
  }

  // Check chaos sentinel file if testCount is still 0
  if (testCount === 0 && ticketId && fs.existsSync(evidenceDir)) {
    const sentinelCandidates = [
      path.join(evidenceDir, `chaos_sentinel_${ticketId}.json`),
      path.join(evidenceDir, `chaos_sentinel_${ticketId.toLowerCase()}.json`),
      path.join(evidenceDir, `chaos_sentinel_${ticketId.toUpperCase()}.json`),
    ];
    for (const sc of sentinelCandidates) {
      if (fs.existsSync(sc)) {
        try {
          const sentData = JSON.parse(fs.readFileSync(sc, 'utf8'));
          if (sentData.testExecutionSummary?.passedCount !== undefined) {
            testCount = sentData.testExecutionSummary.passedCount;
          }
          if (sentData.closedLoopParity?.intentCount !== undefined && testCount === 0) {
            testCount = sentData.closedLoopParity.intentCount;
          }
        } catch {}
      }
    }
  }

  // 2. If testCount is still 0, run Vitest with --reporter=json
  if (testCount === 0 && contractFile && fs.existsSync(path.resolve(repoRoot, contractFile))) {
    try {
      const vitestCmd = `npx --yes vitest run "${path.resolve(repoRoot, contractFile)}" --reporter=json`;
      const vitestRaw = execSync(vitestCmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const jsonStart = vitestRaw.indexOf('{');
      const jsonEnd = vitestRaw.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const vitestJson = JSON.parse(vitestRaw.slice(jsonStart, jsonEnd + 1));
        if (typeof vitestJson.numTotalTests === 'number') {
          testCount = vitestJson.numTotalTests;
        }
      }
    } catch {
      // Fallback: If vitest CLI fails or is unavailable in subshell, strip comments before matching
      try {
        const fileContent = fs.readFileSync(path.resolve(repoRoot, contractFile), 'utf8');
        const stripped = fileContent.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
        const activeMatches = stripped.match(/\b(?:it|test)(?:\.(?:only|skip))?\s*\(/g) || [];
        testCount = activeMatches.length;
      } catch {}
    }
  }

  // Count assertions safely (from stripped code if assertCount is 0)
  if (assertCount === 0 && contractFile && fs.existsSync(path.resolve(repoRoot, contractFile))) {
    try {
      const fileContent = fs.readFileSync(path.resolve(repoRoot, contractFile), 'utf8');
      const stripped = fileContent.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
      assertCount = (stripped.match(/\bexpect\s*\(/g) || []).length;
    } catch {}
  }

  return { testCount, assertCount };
}
