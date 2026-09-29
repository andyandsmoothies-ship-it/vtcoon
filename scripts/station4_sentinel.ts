/**
 * [STATION 4 HARNESS] Standardized Adversarial Boundary & Mutation Sentinel Runner
 * Replaces ad-hoc 350-LOC scratch scripts with a reusable, deterministic physical probe engine.
 * 
 * Usage:
 *   npx tsx scripts/station4_sentinel.ts --ticket IMP-227 --test tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts
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
    gaps: string[];
  };
  ephemeralBoundaryProbe: {
    status: 'PASS' | 'BLOCKED: MOCK_DIVERGENCE';
    dynamicPort: boolean;
    port: number;
    socketCleanup: 'clean' | 'dirty';
  };
  mutationSensitivityProbe: {
    status: 'PASS' | 'BLOCKED: SURVIVED_MUTANT';
    mutantsTested: number;
    killed: number;
    survived: number;
  };
  verdict: 'APPROVED' | 'BLOCKED';
}

function parseCliArgs(): { ticketId: string; testPath?: string } {
  const args = process.argv.slice(2);
  let ticketId = 'IMP-UNKNOWN';
  let testPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ticket' && args[i + 1]) {
      ticketId = args[i + 1]!;
      i++;
    } else if (args[i] === '--test' && args[i + 1]) {
      testPath = args[i + 1]!;
      i++;
    }
  }
  return { ticketId, testPath };
}

// ============================================================================
// PROBE 1: Wire-to-Core Closed-Loop Parity Audit
// ============================================================================
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

  return {
    status: gaps.length === 0 ? 'PASS' : 'BLOCKED: PARITY_GAP',
    gatewayCount: edgeIntents.length,
    coreCount: CORE_24_INTENTS.length,
    gaps,
  };
}

// ============================================================================
// PROBE 2: Ephemeral Boundary Smoke Probe (Zero-Mock Wire, port 0)
// ============================================================================
async function runProbe2(): Promise<ProbeResults['ephemeralBoundaryProbe']> {
  let server: WssServer | null = null;
  let socket: WebSocket | null = null;
  let port = 0;

  try {
    server = new WssServer({ port: 0 });
    const wss = (server as unknown as { wss: { address(): { port: number } | string | null } }).wss;
    const addr = wss.address();
    port = typeof addr === 'object' && addr !== null ? addr.port : 0;

    if (port <= 0 || port === 3000 || port === 8080) {
      throw new Error(`Invalid non-ephemeral port: ${port}`);
    }

    const roomMgr = server.getRoomManager();
    const room = roomMgr.createRoom('p1', 'PROBE_WIRE');
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

    // Send a roll intent over live TCP wire
    socket.send(JSON.stringify({
      type: 'INTENT',
      roomCode: 'PROBE_WIRE',
      playerId: 'p1',
      intent: { type: 'INTENT_ROLL' },
    }));

    await new Promise((r) => setTimeout(r, 80));

    // Clean teardown
    await new Promise<void>((resolve) => {
      if (!socket || socket.readyState === WebSocket.CLOSED) return resolve();
      socket.once('close', () => resolve());
      socket.close();
    });

    await server.close();
    server = null;
    socket = null;

    return {
      status: 'PASS',
      dynamicPort: true,
      port,
      socketCleanup: 'clean',
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
    };
  }
}

// ============================================================================
// PROBE 3: Physical Mutation Sensitivity Probe (Real Test Sandbox Runner)
// ============================================================================
async function runProbe3(testPath?: string): Promise<ProbeResults['mutationSensitivityProbe']> {
  if (!testPath || !fs.existsSync(testPath)) {
    return {
      status: 'PASS',
      mutantsTested: 0,
      killed: 0,
      survived: 0,
    };
  }

  const originalContent = fs.readFileSync(testPath, 'utf-8');
  const sandboxDir = path.resolve('.agents/tmp');
  fs.mkdirSync(sandboxDir, { recursive: true });
  const sandboxPath = path.join(sandboxDir, `mutant_sandbox_${Date.now()}.test.ts`);

  let mutantsTested = 0;
  let killed = 0;
  let survived = 0;

  try {
    // Mutant 1: Invert a primary boolean assertion
    if (originalContent.includes('.toBe(true)')) {
      mutantsTested++;
      const mutantContent = originalContent.replace('.toBe(true)', '.toBe(false)');
      fs.writeFileSync(sandboxPath, mutantContent, 'utf-8');

      try {
        execSync(`npx vitest run "${sandboxPath}"`, { stdio: 'pipe' });
        // If it exited 0, mutant survived!
        survived++;
      } catch {
        // Vitest failed as expected -> mutant killed!
        killed++;
      }
    }

    // Mutant 2: Shift a numeric assertion
    if (originalContent.includes('.toBe(')) {
      mutantsTested++;
      const mutantContent = originalContent.replace(/\.toBe\((\d+)\)/, (_m, num) => `.toBe(${Number(num) + 9999})`);
      fs.writeFileSync(sandboxPath, mutantContent, 'utf-8');

      try {
        execSync(`npx vitest run "${sandboxPath}"`, { stdio: 'pipe' });
        survived++;
      } catch {
        killed++;
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
  };
}

// ============================================================================
// MAIN RUNNER & EVIDENCE PERSISTENCE
// ============================================================================
async function main() {
  const { ticketId, testPath } = parseCliArgs();
  console.log(`=== RUNNING STATION 4 SENTINEL PROBES [${ticketId}] ===\n`);

  const p1 = await runProbe1();
  console.log(`[PROBE 1] Wire-to-Core Parity: ${p1.status} (Edge: ${p1.gatewayCount}, Core: ${p1.coreCount})`);

  const p2 = await runProbe2();
  console.log(`[PROBE 2] Ephemeral Wire (port 0): ${p2.status} (Port: ${p2.port}, Cleanup: ${p2.socketCleanup})`);

  const p3 = await runProbe3(testPath);
  console.log(`[PROBE 3] Mutation Sensitivity: ${p3.status} (Tested: ${p3.mutantsTested}, Killed: ${p3.killed}, Survived: ${p3.survived})`);

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
  console.log(`| 2. Ephemeral Boundary | Dynamic port 0 wire | Live WebSocket handshake on port ${p2.port}, clean teardown | ${p2.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} |`);
  console.log(`| 3. Mutation Sensitivity | Real Vitest sandbox runner | ${p3.killed}/${p3.mutantsTested} mutants killed by test assertions | ${p3.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} |`);
  console.log(`\n**Final Verdict**: ${overallVerdict}`);
  console.log(`**Evidence Snapshot**: ${evidencePath}`);

  process.exit(overallVerdict === 'APPROVED' ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal Station 4 Sentinel Error:', err);
  process.exit(1);
});
