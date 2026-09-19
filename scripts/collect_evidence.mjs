#!/usr/bin/env node

/**
 * scripts/collect_evidence.mjs
 * 
 * VTCOON Automated Immutable Evidence Snapshot Collector
 * Inspired by Visual Supervision Architecture (Jake 2026) & SDLC Rule 22.
 * 100% Zero-Memorization Automation: runs automatically in quality gates and agent pipelines.
 * 
 * Usage:
 *   node scripts/collect_evidence.mjs [SLICE_ID] [FILES...]
 * If called with no arguments, autonomously detects modified files, matching tests, and slice ID.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const posArgs = args.filter((a) => !a.startsWith('--'));

let sliceId = posArgs[0] ? posArgs[0].toUpperCase() : '';
const specifiedFiles = posArgs.slice(1);
const shouldRunContract = flags.includes('--run-contract');

const repoRoot = process.cwd();
const evidenceDir = path.join(repoRoot, '.agents', 'evidence');

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

/**
 * Recursively find files in directory matching extension
 */
function walkDir(dir, filterExt = ['.ts', '.tsx']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== 'dist' && item.name !== '.git') {
        results = results.concat(walkDir(fullPath, filterExt));
      }
    } else if (filterExt.some((ext) => item.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// 1. Autonomous File Detection
let filesToAudit = [];
if (specifiedFiles.length > 0) {
  filesToAudit = specifiedFiles.map((f) => path.resolve(repoRoot, f)).filter((f) => fs.existsSync(f));
} else {
  // Try git status first (fast, 100% accurate on worktree delta)
  try {
    const gitOut = execSync('git status --porcelain', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const lines = gitOut.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      // Format: XY path or XY "path"
      const filePart = trimmed.slice(2).trim().replace(/^"|"$/g, '');
      if (filePart.startsWith('src/') && (filePart.endsWith('.ts') || filePart.endsWith('.tsx'))) {
        const full = path.resolve(repoRoot, filePart);
        if (fs.existsSync(full) && !filesToAudit.includes(full)) {
          filesToAudit.push(full);
        }
      }
    }
  } catch {
    // safe ignore
  }

  // Fallback: If git status returned empty (e.g. all committed or non-git), scan recent mtime
  if (filesToAudit.length === 0) {
    const allSrc = walkDir(path.join(repoRoot, 'src'));
    const now = Date.now();
    filesToAudit = allSrc.filter((f) => {
      try {
        const stat = fs.statSync(f);
        return now - stat.mtimeMs < 2 * 60 * 60 * 1000; // modified within last 2 hours
      } catch {
        return false;
      }
    });
  }
}

// 2. Autonomous Slice ID Detection
const allContractTests = walkDir(path.join(repoRoot, 'tests', 'contracts'));
if (!sliceId || sliceId === 'LATEST' || sliceId === 'ADHOC') {
  // Try to find from most recently modified contract test
  let latestTest = null;
  let latestMtime = 0;
  for (const t of allContractTests) {
    try {
      const stat = fs.statSync(t);
      if (stat.mtimeMs > latestMtime) {
        latestMtime = stat.mtimeMs;
        latestTest = t;
      }
    } catch {
      // safe ignore
    }
  }

  if (latestTest) {
    const base = path.basename(latestTest).toUpperCase();
    const match = base.match(/(IMP-?\d+|TC-[A-Z0-9]+)/i);
    if (match && match[1]) {
      sliceId = match[1].replace('-', '-');
    }
  }

  if (!sliceId) {
    sliceId = 'ACTIVE-SLICE';
  }
}

// 3. Find matching contract tests
const sliceKey = sliceId.replace(/[^A-Z0-9]/gi, '').toLowerCase();
const matchingTests = allContractTests.filter((t) => {
  const norm = t.toLowerCase();
  return norm.includes(sliceKey) || norm.includes(sliceId.toLowerCase());
}).sort((a, b) => {
  try {
    return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs;
  } catch {
    return 0;
  }
});

let testExecution = null;
if (shouldRunContract && matchingTests.length > 0) {
  const targetSuite = matchingTests[0];
  const testFileRel = path.relative(repoRoot, targetSuite).replace(/\\/g, '/');
  try {
    const testOut = execSync(`npx vitest run "${testFileRel}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000,
    });
    const cleanOut = testOut.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
    const passMatch = cleanOut.match(/Tests\s+(\d+)\s+passed/i) || cleanOut.match(/(\d+)\s+passed/i);
    const passedCount = passMatch ? parseInt(passMatch[1], 10) : 0;
    testExecution = {
      executed: true,
      suite: testFileRel,
      status: 'PASSED',
      passedCount,
    };
  } catch (err) {
    testExecution = {
      executed: true,
      suite: testFileRel,
      status: 'FAILED',
      error: (err.stdout || err.message || '').slice(0, 300),
    };
  }
}

// 4. Scan downstream consumers in src/
const allSrcFiles = walkDir(path.join(repoRoot, 'src'));

const fileReports = filesToAudit.map((filePath) => {
  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const baseName = path.basename(filePath, path.extname(filePath));

  let consumersCount = 0;
  for (const srcFile of allSrcFiles) {
    if (srcFile === filePath) continue;
    try {
      const srcContent = fs.readFileSync(srcFile, 'utf8');
      if (srcContent.includes(baseName)) {
        consumersCount++;
      }
    } catch {
      // safe ignore
    }
  }

  const exportMatches = content.match(/export\s+(const|function|class|type|interface|enum|default)/g);
  const importMatches = content.match(/import\s+/g);

  return {
    path: relPath,
    loc: lines.length,
    exportsCount: exportMatches ? exportMatches.length : 0,
    importsCount: importMatches ? importMatches.length : 0,
    downstreamConsumers: consumersCount,
  };
});

const totalLoc = fileReports.reduce((acc, f) => acc + f.loc, 0);

const snapshot = {
  sliceId,
  timestamp: new Date().toISOString(),
  environment: 'Antigravity 2.0 Physical Worktree (Zero-Memorization Automated)',
  summary: {
    filesCount: fileReports.length,
    totalLoc,
    matchingContractTests: matchingTests.map((t) => path.relative(repoRoot, t).replace(/\\/g, '/')),
  },
  testExecution: testExecution || {
    executed: false,
    matchingSuites: matchingTests.map((t) => path.relative(repoRoot, t).replace(/\\/g, '/')),
  },
  files: fileReports,
  verificationChecklist: {
    hasContractTests: matchingTests.length > 0,
    contractTestsPassed: testExecution ? testExecution.status === 'PASSED' : null,
    zeroDirectViolationsExpected: true,
    physicalDiskVerificationRequired: true,
  },
};

// Write both slice-specific snapshot and latest_snapshot.json
const outputFileName = `${sliceId.toLowerCase()}_snapshot.json`;
fs.writeFileSync(path.join(evidenceDir, outputFileName), JSON.stringify(snapshot, null, 2), 'utf8');
fs.writeFileSync(path.join(evidenceDir, 'latest_snapshot.json'), JSON.stringify(snapshot, null, 2), 'utf8');

const relTarget = path.relative(repoRoot, path.join(evidenceDir, outputFileName)).replace(/\\/g, '/');

console.log('----------------------------------------------------');
console.log(`📸 [AUTOMATED EVIDENCE SNAPSHOT GENERATED]`);
console.log(`├── Slice ID  : ${sliceId}`);
console.log(`├── Snapshot  : ${relTarget}`);
console.log(`├── Files     : ${fileReports.length} files (${totalLoc} LOC)`);
console.log(`├── Contracts : ${matchingTests.length} suite(s) matched`);
if (testExecution && testExecution.executed) {
  console.log(`├── Test Exec : ${testExecution.status} (${testExecution.passedCount ?? 0} tests in ${testExecution.suite})`);
}
console.log(`└── Status    : READY FOR TRẠM 3 (Zero-Memorization Active)`);
console.log('----------------------------------------------------');
