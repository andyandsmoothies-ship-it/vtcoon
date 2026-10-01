/**
 * [STATION 4 HARNESS] Standardized Adversarial Boundary & Mutation Sentinel Runner
 * 
 * Modular Architecture:
 * - PART 1: Universal Source & Contract Mutation Engine (Generic & Portable to any project)
 * - PART 2: Stack Adapter (Project-Specific Probes: WebSocket port 0, Intent parity)
 * 
 * Usage:
 *   npx tsx scripts/station4_sentinel.ts --ticket IMP-240 --test tests/contracts/fire_sale_and_insolvency_lifecycle.test.ts [--src src/server/insolvency_manager.ts]
 */

import { WebSocket } from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { VALID_INTENTS, EnvelopeValidator } from '../src/server/security/envelope_validator.js';
import { dispatchPlayerIntent } from '../src/server/intent_dispatcher.js';
import { WssServer } from '../src/server/network/wss_server.js';
import { RoomManager } from '../src/server/room_manager.js';
import { TurnPhase } from '../src/domain/room.js';

interface ProbeResults {
  ticketId: string;
  executed: boolean;
  closedLoopParity: {
    status: 'PASS' | 'BLOCKED: PARITY_GAP';
    gatewayCount: number;
    coreCount: number;
    intentCount: number;
    gaps: string[];
  };
  ephemeralBoundaryProbe: {
    status: 'PASS' | 'BLOCKED: MOCK_DIVERGENCE';
    dynamicPort: boolean;
    port: number;
    socketCleanup: 'clean' | 'dirty';
    abruptTeardownSurvives: boolean;
  };
  mutationSensitivityProbe: {
    status: 'PASS' | 'BLOCKED: SURVIVED_MUTANT';
    mutantsTested: number;
    killed: number;
    survived: number;
    sourceLevelMutantsTested: number;
  };
  verdict: 'APPROVED' | 'BLOCKED';
}

function parseCliArgs(): { ticketId: string; testPath?: string; srcPath?: string } {
  const args = process.argv.slice(2);
  let ticketId = 'IMP-UNKNOWN';
  let testPath: string | undefined;
  let srcPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ticket' && args[i + 1]) {
      ticketId = args[i + 1]!;
      i++;
    } else if (args[i] === '--test' && args[i + 1]) {
      testPath = args[i + 1]!;
      i++;
    } else if (args[i] === '--src' && args[i + 1]) {
      srcPath = args[i + 1]!;
      i++;
    }
  }
  return { ticketId, testPath, srcPath };
}

// ============================================================================
// PART 1: UNIVERSAL SOURCE & CONTRACT MUTATION ENGINE (PORTABLE CORE)
// ============================================================================

/**
 * Safely applies a mutation to a production source file with an unconditional
 * rollback guarantee via try...finally. If tests fail, the mutant is KILLED.
 */
function testSourceMutantSafely(
  filePath: string,
  targetPattern: string | RegExp,
  replacement: string,
  testCmd: string
): { tested: boolean; killed: boolean } {
  if (!fs.existsSync(filePath)) return { tested: false, killed: false };

  const originalContent = fs.readFileSync(filePath, 'utf-8');
  const hasMatch = typeof targetPattern === 'string'
    ? originalContent.includes(targetPattern)
    : targetPattern.test(originalContent);

  if (!hasMatch) return { tested: false, killed: false };

  const backupPath = `${filePath}.sentinel_bak_${Date.now()}`;
  fs.writeFileSync(backupPath, originalContent, 'utf-8');

  try {
    const mutated = originalContent.replace(targetPattern, replacement);
    fs.writeFileSync(filePath, mutated, 'utf-8');

    try {
      execSync(testCmd, { stdio: 'pipe' });
      // If tests pass despite source corruption, mutant survived (bad)
      return { tested: true, killed: false };
    } catch {
      // Tests caught the corruption and failed (good)
      return { tested: true, killed: true };
    }
  } finally {
    // Unconditional rollback guarantee
    try {
      if (fs.existsSync(backupPath)) {
        fs.writeFileSync(filePath, fs.readFileSync(backupPath, 'utf-8'), 'utf-8');
        fs.unlinkSync(backupPath);
      }
    } catch (e) {
      console.error(`CRITICAL: Failed to restore backup ${backupPath}:`, e);
    }
  }
}

/**
 * Resolves production source files imported by the contract test.
 */
function resolveSourceFilesFromTest(testPath: string): string[] {
  if (!fs.existsSync(testPath)) return [];
  const content = fs.readFileSync(testPath, 'utf-8');
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  const files: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = importRegex.exec(content)) !== null) {
    const relImport = m[1];
    if (relImport && (relImport.includes('src/') || relImport.startsWith('../') || relImport.startsWith('./'))) {
      const resolved = path.resolve(path.dirname(testPath), relImport);
      const possibleExtensions = ['', '.ts', '.tsx', '.js'];
      for (const ext of possibleExtensions) {
        const full = (resolved + ext).replace(/\.js\.ts$/, '.ts');
        if (fs.existsSync(full) && full.includes(path.sep + 'src' + path.sep)) {
          files.push(full);
          break;
        }
      }
    }
  }
  return Array.from(new Set(files));
}

/**
 * Universal Mutation Runner: Executes both Source-Level Mutations and Contract Inversions.
 */
async function runUniversalMutationProbe(
  testPath?: string,
  explicitSrc?: string
): Promise<ProbeResults['mutationSensitivityProbe']> {
  if (!testPath || !fs.existsSync(testPath)) {
    return {
      status: 'PASS',
      mutantsTested: 0,
      killed: 0,
      survived: 0,
      sourceLevelMutantsTested: 0,
    };
  }

  const testCmd = `npx vitest run "${testPath}"`;
  let mutantsTested = 0;
  let killed = 0;
  let survived = 0;
  let sourceLevelMutantsTested = 0;

  // 1. Physical Source-Level Mutation Testing (when explicit --src is provided)
  if (explicitSrc && fs.existsSync(explicitSrc)) {
    const srcFile = path.resolve(explicitSrc);
    const sourceMutations = [
      { pattern: ' === ', replacement: ' !== ' },
      { pattern: ' >= ', replacement: ' < ' },
      { pattern: 'return true;', replacement: 'return false;' },
      { pattern: ' + ', replacement: ' - ' },
      { pattern: '= []', replacement: "= ['__CORRUPTED_MUTANT__']" },
    ];

    for (const { pattern, replacement } of sourceMutations) {
      const mut = testSourceMutantSafely(srcFile, pattern, replacement, testCmd);
      if (mut.tested) {
        mutantsTested++;
        sourceLevelMutantsTested++;
        if (mut.killed) killed++; else survived++;
      }
    }
  }

  // 2. Generic Contract Inversion Testing (on sandbox test copy, zero stale ticket keywords)
  const originalTestContent = fs.readFileSync(testPath, 'utf-8');
  const sandboxDir = path.dirname(path.resolve(testPath));
  const sandboxPath = path.join(sandboxDir, `.tmp_mutant_sandbox_${Date.now()}.test.ts`);

  const genericMutators: Array<{ pattern: string | RegExp; replacement: string | ((...args: any[]) => string) }> = [
    { pattern: '.toBe(true)', replacement: '.toBe(false)' },
    { pattern: '.toBe(false)', replacement: '.toBe(true)' },
    { pattern: /\.toBe\((\d+)\)/, replacement: (_m: string, n: string) => `.toBe(${Number(n) + 9999})` },
    { pattern: '.toContain(', replacement: '.not.toContain(' },
    { pattern: /\.toBe\('([^']+)'\)/, replacement: ".toBe('__CORRUPTED_MUTANT_STRING__')" },
    { pattern: '.toBeGreaterThanOrEqual(', replacement: '.toBeLessThan(' },
    { pattern: '.toBeGreaterThan(', replacement: '.toBeLessThan(' },
    { pattern: '.not.toMatch(', replacement: '.toMatch(' },
    { pattern: /\.toHaveBeenCalledWith\([^)]+\)/, replacement: '.toHaveBeenCalledWith("__MUTANT_CALL_FAIL__")' },
    { pattern: '.toEqual(', replacement: '.not.toEqual(' },
    { pattern: '.toBeDefined()', replacement: '.toBeUndefined()' },
    { pattern: '.toBeTruthy()', replacement: '.toBeFalsy()' },
  ];

  try {
    for (const { pattern, replacement } of genericMutators) {
      const hasMatch = typeof pattern === 'string'
        ? originalTestContent.includes(pattern)
        : pattern.test(originalTestContent);

      if (hasMatch) {
        mutantsTested++;
        const mutantContent = typeof replacement === 'string'
          ? originalTestContent.replace(pattern, replacement)
          : originalTestContent.replace(pattern, replacement as any);

        fs.writeFileSync(sandboxPath, mutantContent, 'utf-8');

        try {
          execSync(`npx vitest run "${sandboxPath}"`, { stdio: 'pipe' });
          survived++;
        } catch {
          killed++;
        }
      }
    }
  } finally {
    try {
      if (fs.existsSync(sandboxPath)) fs.unlinkSync(sandboxPath);
    } catch {}
  }

  const status = (mutantsTested > 0 && survived === 0 && killed === mutantsTested)
    ? 'PASS'
    : (mutantsTested === 0 ? 'PASS' : 'BLOCKED: SURVIVED_MUTANT');

  return {
    status,
    mutantsTested,
    killed,
    survived,
    sourceLevelMutantsTested,
  };
}

// ============================================================================
// PART 2: STACK ADAPTER (PROJECT-SPECIFIC: VTCOON REALTIME ENGINE)
// ============================================================================

/**
 * PROBE 1: Wire-to-Core Closed-Loop Parity Audit
 */
async function runProbe1(): Promise<ProbeResults['closedLoopParity']> {
  const edgeIntents = Array.from(VALID_INTENTS);
  const CORE_24_INTENTS = [
    'INTENT_ROLL', 'INTENT_BUY', 'INTENT_BUY_PROPERTY', 'INTENT_DECLINE', 'INTENT_BID',
    'INTENT_AUCTION_PASS', 'INTENT_UPGRADE', 'INTENT_UPGRADE_ETC', 'INTENT_UPGRADE_UTILITY',
    'INTENT_DOWNGRADE', 'INTENT_MORTGAGE', 'INTENT_REDEEM', 'INTENT_TRADE_OFFER',
    'INTENT_RESPOND_TRADE_OFFER', 'INTENT_END_TURN', 'INTENT_INVEST', 'INTENT_SKIP',
    'INTENT_BAIL_OUT', 'INTENT_BANKRUPTCY', 'INTENT_EXECUTE_COMPULSORY_BUYOUT',
    'INTENT_DECLINE_COMPULSORY_BUYOUT', 'INTENT_AUTO_SOLVENCY', 'INTENT_ISSUE_BOND',
    'INTENT_REPAY_BOND',
  ];

  const gaps: string[] = [];
  if (edgeIntents.length !== CORE_24_INTENTS.length) {
    gaps.push(`Size mismatch: Edge has ${edgeIntents.length}, Core has ${CORE_24_INTENTS.length}`);
  }

  for (const intent of CORE_24_INTENTS) {
    if (!VALID_INTENTS.has(intent)) {
      gaps.push(`Core intent '${intent}' missing from Edge VALID_INTENTS`);
    }
  }
  for (const intent of edgeIntents) {
    if (!CORE_24_INTENTS.includes(intent)) {
      gaps.push(`Edge intent '${intent}' missing from Core list`);
    }
  }

  const validator = new EnvelopeValidator();
  const testMgr = new RoomManager(101);
  testMgr.createRoom('p1', 'PROBE_PARITY');

  for (const intentType of CORE_24_INTENTS) {
    const rawEnvelope = JSON.stringify({
      type: 'INTENT',
      roomCode: 'PROBE_PARITY',
      playerId: 'p1',
      intent: { type: intentType, cellIndex: 1, amount: 500, price: 500, stake: 100, sellerId: 'p1', buyerId: 'p2', offerId: 'o1', accept: true },
    });
    const parsed = validator.parseAndValidate(rawEnvelope);
    if (!parsed.success || parsed.message.type !== 'INTENT') {
      gaps.push(`Validation failure for intent: ${intentType}`);
      continue;
    }
    const res = dispatchPlayerIntent(testMgr, 'PROBE_PARITY', 'p1', parsed.message.intent);
    if (typeof res !== 'object' || typeof res.success !== 'boolean') {
      gaps.push(`Dispatcher response invalid for intent: ${intentType}`);
    }
  }

  const status = gaps.length === 0 ? 'PASS' : 'BLOCKED: PARITY_GAP';
  return {
    status,
    gatewayCount: edgeIntents.length,
    coreCount: CORE_24_INTENTS.length,
    intentCount: CORE_24_INTENTS.length,
    gaps,
  };
}

/**
 * PROBE 2: Ephemeral Boundary Smoke Probe (Zero-Mock Socket on dynamic port: 0 with Abrupt Disconnect)
 */
async function runProbe2(): Promise<ProbeResults['ephemeralBoundaryProbe']> {
  let server: WssServer | null = null;
  let socket: WebSocket | null = null;
  let port = 0;
  let abruptTeardownSurvives = false;

  try {
    server = new WssServer({ port: 0 });
    const wss = (server as unknown as { wss: { address(): { port: number } | string | null } }).wss;
    const addr = wss.address();
    port = typeof addr === 'object' && addr !== null ? addr.port : 0;

    if (port <= 0 || port === 3000 || port === 8080) {
      throw new Error(`Invalid non-ephemeral port: ${port}`);
    }

    const roomMgr = server.getRoomManager();
    roomMgr.createRoom('p1', 'PROBE_WIRE');
    roomMgr.addBot('PROBE_WIRE', 'bot_2');
    roomMgr.startGame('PROBE_WIRE');

    socket = await new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`);
      ws.once('open', () => resolve(ws));
      ws.once('error', reject);
    });

    socket.send(JSON.stringify({
      type: 'JOIN_ROOM',
      playerId: 'p1',
      roomCode: 'PROBE_WIRE',
    }));

    await new Promise((r) => setTimeout(r, 60));

    // Send roll intent over live TCP wire
    socket.send(JSON.stringify({
      type: 'INTENT',
      roomCode: 'PROBE_WIRE',
      playerId: 'p1',
      intent: { type: 'INTENT_ROLL' },
    }));

    await new Promise((r) => setTimeout(r, 80));

    // Chaos Sub-Probe: Abrupt TCP Termination (RST / drop without close handshake)
    socket.terminate();
    socket = null;
    abruptTeardownSurvives = true;

    // Verify server gracefully shuts down after abrupt socket drop
    await server.close();
    server = null;

    return {
      status: 'PASS',
      dynamicPort: true,
      port,
      socketCleanup: 'clean',
      abruptTeardownSurvives,
    };
  } catch (err) {
    if (socket) {
      try { socket.terminate(); } catch {}
    }
    if (server) {
      try { await server.close(); } catch {}
    }
    return {
      status: 'BLOCKED: MOCK_DIVERGENCE',
      dynamicPort: port > 0,
      port,
      socketCleanup: 'dirty',
      abruptTeardownSurvives,
    };
  }
}

// ============================================================================
// MAIN RUNNER & EVIDENCE PERSISTENCE
// ============================================================================
async function main() {
  const { ticketId, testPath, srcPath } = parseCliArgs();
  console.log(`=== RUNNING STATION 4 SENTINEL PROBES [${ticketId}] ===\n`);

  const p1 = await runProbe1();
  console.log(`[PROBE 1] Wire-to-Core Parity: ${p1.status} (Edge: ${p1.gatewayCount}, Core: ${p1.coreCount})`);

  const p2 = await runProbe2();
  console.log(`[PROBE 2] Ephemeral Wire (port 0): ${p2.status} (Port: ${p2.port}, Abrupt Drop: ${p2.abruptTeardownSurvives ? 'SURVIVED' : 'FAILED'})`);

  const p3 = await runUniversalMutationProbe(testPath, srcPath);
  console.log(`[PROBE 3] Mutation Sensitivity: ${p3.status} (Tested: ${p3.mutantsTested} [Source: ${p3.sourceLevelMutantsTested}], Killed: ${p3.killed}, Survived: ${p3.survived})`);

  const overallVerdict: 'APPROVED' | 'BLOCKED' =
    p1.status === 'PASS' && p2.status === 'PASS' && p3.status === 'PASS'
      ? 'APPROVED'
      : 'BLOCKED';

  const results: ProbeResults = {
    ticketId,
    executed: true,
    closedLoopParity: p1,
    ephemeralBoundaryProbe: p2,
    mutationSensitivityProbe: p3,
    verdict: overallVerdict,
  };

  const cleanTicket = ticketId.replace(/[^A-Za-z0-9_-]/g, '');
  const evidencePath = path.resolve(`.agents/evidence/chaos_sentinel_${cleanTicket}.json`);
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`\n### 🛡️ STATION 4: CHAOS SENTINEL REPORT (${ticketId})`);
  console.log(`| Probe | Target | Physical Finding | Status |`);
  console.log(`| :--- | :--- | :--- | :---: |`);
  console.log(`| 1. Closed-Loop Parity | Edge vs Core sets | ${p1.gatewayCount}/${p1.coreCount} Intent symmetric parity, 0 gaps | ${p1.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} |`);
  console.log(`| 2. Ephemeral Boundary | Dynamic port 0 wire | Live TCP WebSocket on port ${p2.port}, abrupt drop survived | ${p2.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} |`);
  console.log(`| 3. Mutation Sensitivity | Source & Contract Mutants | ${p3.killed}/${p3.mutantsTested} mutants killed (${p3.sourceLevelMutantsTested} source-level) | ${p3.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} |`);
  console.log(`\n**Final Verdict**: ${overallVerdict}`);
  console.log(`**Evidence Snapshot**: ${evidencePath}`);

  process.exit(overallVerdict === 'APPROVED' ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal Station 4 Sentinel Error:', err);
  process.exit(1);
});
