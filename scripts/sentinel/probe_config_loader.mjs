import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * Parses CLI arguments and determines if the ticket is a 3D WebGL target.
 */
export function parseCliArgs() {
  const args = process.argv.slice(2);
  let ticketId = 'IMP-UNKNOWN';
  let testPath = undefined;
  let srcPath = undefined;
  let is3D = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ticket' && args[i + 1]) {
      ticketId = args[++i];
    } else if (args[i] === '--test' && args[i + 1]) {
      const tests = [];
      while (args[i + 1] && !args[i + 1].startsWith('--')) {
        tests.push(args[++i]);
      }
      testPath = tests.join(' ');
    } else if (args[i] === '--src' && args[i + 1]) {
      srcPath = args[++i];
    } else if (args[i] === '--3d') {
      is3D = true;
    }
  }

  const KNOWN_3D_TICKETS = new Set(['IMP-336', 'IMP-337', 'IMP-338', 'IMP-265', 'IMP-341']);
  if (!is3D && (
    srcPath?.includes('3d') ||
    srcPath?.includes('client/3d') ||
    testPath?.includes('3d') ||
    testPath?.includes('spatial') ||
    testPath?.includes('camera') ||
    ticketId?.toLowerCase().includes('3d') ||
    (ticketId && KNOWN_3D_TICKETS.has(ticketId.toUpperCase()))
  )) {
    is3D = true;
    if (!srcPath && ticketId?.toUpperCase() === 'IMP-338') {
      srcPath = 'src/client/3d/tropical_water.tsx';
    }
    if (!srcPath && ticketId?.toUpperCase() === 'IMP-341') {
      srcPath = 'src/client/3d/camera_arbitration_engine.ts';
    }
  }

  return { ticketId, testPath, srcPath, is3D, rawArgs: args };
}

/**
 * Loads targeted probe rules from scripts/sentinel_probes/<TICKET>.json.
 */
export function loadTargetedProbes(tid) {
  if (!tid) return undefined;
  const probeFile = path.resolve(process.cwd(), 'scripts', 'sentinel_probes', `${tid.toUpperCase()}.json`);
  if (fs.existsSync(probeFile)) {
    try {
      return JSON.parse(fs.readFileSync(probeFile, 'utf8'));
    } catch (err) {
      console.warn(`⚠️ Failed to parse probe file: ${probeFile}`, err);
    }
  }
  return undefined;
}

/**
 * Delegates execution to station4_sentinel.ts for non-3D server/domain tickets.
 */
export function delegateToStation4Server(rawArgs) {
  const tsxCmd = process.platform === 'win32' ? 'cmd.exe' : 'npx';
  const tsxArgs = process.platform === 'win32'
    ? ['/c', `npx --yes tsx scripts/station4_sentinel.ts ${rawArgs.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' ')}`]
    : ['tsx', 'scripts/station4_sentinel.ts', ...rawArgs];

  const res = spawnSync(tsxCmd, tsxArgs, { stdio: 'inherit' });
  process.exit(res.status ?? 0);
}
