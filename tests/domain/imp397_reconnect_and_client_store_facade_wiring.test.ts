// [CONTRACT TEST] IMP-397: Reconnect Manager & Client Store Facade Wiring
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, it, expect, vi } from 'vitest';
import {
  TurnPhase,
  PLAYER_TOKEN_PALETTE,
  EMOTE_DISPLAY_DURATION_MS,
} from '../../src/domain/index.js';
import { BotPersonality } from '../../src/domain/bot/index.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { SessionManager, SessionState } from '../../src/server/session_manager.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { ReconnectManager } from '../../src/server/network/reconnect_manager.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';
import { useLobbyStore, getNextBotPersonality } from '../../src/client/store/lobby_store.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';

const REPO_ROOT = process.cwd();

const IMP397_TARGET_FILES = [
  'src/server/network/reconnect_manager.ts',
  'src/client/store/lobby_store.ts',
  'src/client/store/lobby_types.ts',
  'src/client/store/game_store_subtypes.ts',
  'src/client/store/game_store_state_types.ts',
  'src/client/store/game_store.ts',
] as const;

function collectTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(fullPath));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

function isDomainBotLeafSpecifier(spec: string): boolean {
  if (!spec.includes('domain/bot/')) return false;
  return !spec.endsWith('domain/bot/index.js') && !spec.endsWith('domain/bot/index');
}

function isDomainLeafSpecifier(spec: string): boolean {
  const idx = spec.indexOf('domain/');
  if (idx === -1) return false;
  const sub = spec.slice(idx);
  if (sub === 'domain/index.js' || sub === 'domain/index') return false;
  if (sub === 'domain/bot/index.js' || sub === 'domain/bot/index') return false;
  if (sub.startsWith('domain/protocol/')) return false;
  return true;
}

interface FacadeEncapsulationSummary {
  readonly targetFilesLeafImportCount: number;
  readonly targetFilesWithOnlyFacadeImports: number;
  readonly allServerAndClientLeafBotImportCount: number;
  readonly allClientStoreLeafDomainImportCount: number;
}

function inspectFacadeEncapsulation(): FacadeEncapsulationSummary {
  let targetFilesLeafImportCount = 0;
  let targetFilesWithOnlyFacadeImports = 0;

  for (const relPath of IMP397_TARGET_FILES) {
    const absPath = path.resolve(REPO_ROOT, relPath);
    const content = fs.readFileSync(absPath, 'utf8');
    const sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.Latest, true);
    let fileLeafCount = 0;
    let fileFacadeCount = 0;

    for (const stmt of sf.statements) {
      if (
        (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
        stmt.moduleSpecifier &&
        ts.isStringLiteral(stmt.moduleSpecifier)
      ) {
        const spec = stmt.moduleSpecifier.text;
        if (spec.includes('domain/')) {
          if (isDomainLeafSpecifier(spec) || isDomainBotLeafSpecifier(spec)) {
            fileLeafCount++;
            targetFilesLeafImportCount++;
          } else {
            fileFacadeCount++;
          }
        }
      }
    }

    if (fileLeafCount === 0 && fileFacadeCount > 0) {
      targetFilesWithOnlyFacadeImports++;
    }
  }

  const serverAndClientFiles = [
    ...collectTsFiles(path.resolve(REPO_ROOT, 'src/server')),
    ...collectTsFiles(path.resolve(REPO_ROOT, 'src/client')),
  ];
  let allServerAndClientLeafBotImportCount = 0;
  for (const absPath of serverAndClientFiles) {
    const content = fs.readFileSync(absPath, 'utf8');
    const sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.Latest, true);
    for (const stmt of sf.statements) {
      if (
        (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
        stmt.moduleSpecifier &&
        ts.isStringLiteral(stmt.moduleSpecifier)
      ) {
        if (isDomainBotLeafSpecifier(stmt.moduleSpecifier.text)) {
          allServerAndClientLeafBotImportCount++;
        }
      }
    }
  }

  const clientStoreFiles = collectTsFiles(path.resolve(REPO_ROOT, 'src/client/store'));
  let allClientStoreLeafDomainImportCount = 0;
  for (const absPath of clientStoreFiles) {
    const content = fs.readFileSync(absPath, 'utf8');
    const sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.Latest, true);
    for (const stmt of sf.statements) {
      if (
        (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
        stmt.moduleSpecifier &&
        ts.isStringLiteral(stmt.moduleSpecifier)
      ) {
        if (isDomainLeafSpecifier(stmt.moduleSpecifier.text)) {
          allClientStoreLeafDomainImportCount++;
        }
      }
    }
  }

  return {
    targetFilesLeafImportCount,
    targetFilesWithOnlyFacadeImports,
    allServerAndClientLeafBotImportCount,
    allClientStoreLeafDomainImportCount,
  };
}

function countPhysicalLines(relPath: string): number {
  const absPath = path.resolve(REPO_ROOT, relPath);
  const content = fs.readFileSync(absPath, 'utf8').replace(/\r\n/g, '\n');
  return content.endsWith('\n')
    ? content.slice(0, -1).split('\n').length
    : content.split('\n').length;
}

class TrackingRoomManager extends RoomManager {
  readonly botTurnRoomCodes: string[] = [];
  readonly closedRoomCodes: string[] = [];

  override runBotTurn(roomCode: string): void {
    this.botTurnRoomCodes.push(roomCode);
  }

  override closeRoom(roomCode: string): boolean {
    this.closedRoomCodes.push(roomCode);
    return super.closeRoom(roomCode);
  }
}

interface ReconnectEdgeLifecycleOutcome {
  readonly connectedPlayerStayedHuman: boolean;
  readonly connectedSessionState: SessionState | undefined;
  readonly lastHumanConvertedToBot: boolean;
  readonly allHumansDisconnectedCalls: readonly string[];
  readonly takeoverBroadcastCount: number;
  readonly auxiliaryBranchesValid: boolean;
}

function evaluateReconnectEdgeLifecycles(): ReconnectEdgeLifecycleOutcome {
  const rooms = new TrackingRoomManager(42);
  const sessions = new SessionManager();
  const broadcaster = new DeltaBroadcaster(rooms, sessions);
  const broadcasts: WsServerMessage[] = [];
  const disconnectedRooms: string[] = [];
  let p1Connected = true;

  const manager = new ReconnectManager({
    rooms,
    sessions,
    broadcaster,
    broadcast: (_rc, msg) => {
      broadcasts.push(msg);
    },
    gracePeriodMs: 50,
    maxTokenTtlMs: 5000,
    isSocketConnected: (_rc, pid) => (pid === 'p1' ? p1Connected : false),
    onAllHumansDisconnected: (rc) => {
      disconnectedRooms.push(rc);
    },
  });

  try {
    const room = rooms.createRoom('p1', 'VT397A');
    rooms.joinRoom('VT397A', 'p2');
    room.started = true;

    const sessionP1 = sessions.addSession('p1');
    const sessionP2 = sessions.addSession('p2');
    const tokenP1 = manager.generateToken('p1', 'VT397A');
    const tokenP2 = manager.generateToken('p2', 'VT397A');

    manager.startGracePeriod('VT397A', 'p1');
    manager.startGracePeriod('VT397A', 'p1');
    const inGraceBefore = manager.isPlayerInGrace('VT397A', 'p1');
    const remainingBefore = manager.getGraceRemainingSeconds('VT397A', 'p1');

    manager.handleGraceExpired('VT397A', 'p1');
    const p1 = room.players.find((p) => p.id === 'p1')!;
    const connectedPlayerStayedHuman =
      p1.isBot === false &&
      manager.isTokenValid(tokenP1) === true &&
      inGraceBefore === true &&
      remainingBefore >= 1;
    const connectedSessionState = sessionP1.state;

    p1.isBot = true;
    p1Connected = false;
    manager.startGracePeriod('VT397A', 'p2');
    const cancelledOnce = manager.cancelGracePeriod('VT397A', 'p2');
    const cancelledTwice = manager.cancelGracePeriod('VT397A', 'p2');
    manager.startGracePeriod('VT397A', 'p2');
    manager.handleGraceExpired('VT397A', 'p2');

    const p2 = room.players.find((p) => p.id === 'p2')!;
    const lastHumanConvertedToBot =
      p2.isBot === true &&
      sessionP2.state === SessionState.Disconnected &&
      manager.isTokenValid(tokenP2) === false;

    const takeoverBroadcastCount = broadcasts.filter(
      (m) => m.type === 'PLAYER_BOT_TAKEOVER',
    ).length;

    const lobbyRoom = rooms.createRoom('host1', 'VT397B');
    rooms.joinRoom('VT397B', 'guest1');
    lobbyRoom.started = false;
    manager.startGracePeriod('VT397B', 'guest1');
    manager.handleGraceExpired('VT397B', ' host1 ');
    manager.handleGraceExpired('VT397B', 'guest1');
    const guestRemovedFromLobby =
      lobbyRoom.players.length === 1 && lobbyRoom.players[0]?.id === 'host1';

    const t3 = manager.generateToken('host1', 'VT397B');
    const verifyOk = manager.verifyToken(t3, 'VT397B').success === true;
    const verifyWrongRoom = manager.verifyToken(t3, 'OTHER').success === false;
    const verifyUnknown = manager.verifyToken('missing').success === false;
    manager.expireToken(t3);
    const verifyExpired = manager.verifyToken(t3).success === false;
    manager.clearRoom('VT397B');
    const tokenCleared = manager.getToken('host1', 'VT397B') === undefined;

    const auxiliaryBranchesValid =
      manager.getGracePeriodMs() === 50 &&
      cancelledOnce === true &&
      cancelledTwice === false &&
      guestRemovedFromLobby &&
      verifyOk &&
      verifyWrongRoom &&
      verifyUnknown &&
      verifyExpired &&
      tokenCleared;

    return {
      connectedPlayerStayedHuman,
      connectedSessionState,
      lastHumanConvertedToBot,
      allHumansDisconnectedCalls: disconnectedRooms,
      takeoverBroadcastCount,
      auxiliaryBranchesValid,
    };
  } finally {
    manager.clear();
  }
}

describe('[IMP-397] Reconnect Manager & Client Store Facade Wiring Contract Suite', () => {
  it('TC-397.01 [UC-ARCH-003/MSS]: eliminates 100% of leaf domain/bot imports across src/server and src/client and routes 100% of src/client/store domain imports via facades', () => {
    const summary = inspectFacadeEncapsulation();

    expect(summary.targetFilesLeafImportCount).toBe(0);
    expect(summary.targetFilesWithOnlyFacadeImports).toBe(6);
    expect(summary.allServerAndClientLeafBotImportCount).toBe(0);
    expect(summary.allClientStoreLeafDomainImportCount).toBe(0);
  });

  it('TC-397.02 [UC-GAME-008/MSS]: converts disconnected active player to Bot via BotEngine.takeover on handleGraceExpired, expires token, triggers runBotTurn, and broadcasts PLAYER_BOT_TAKEOVER', () => {
    const rooms = new TrackingRoomManager(101);
    const sessions = new SessionManager();
    const broadcaster = new DeltaBroadcaster(rooms, sessions);
    const broadcasts: WsServerMessage[] = [];

    const manager = new ReconnectManager({
      rooms,
      sessions,
      broadcaster,
      broadcast: (_rc, msg) => {
        broadcasts.push(msg);
      },
      gracePeriodMs: 50,
      isSocketConnected: () => false,
    });

    try {
      const room = rooms.createRoom('p1', 'VT397R');
      rooms.joinRoom('VT397R', 'p2');
      room.started = true;
      room.currentPlayerIndex = 0;

      const p1 = room.players[0]!;
      p1.balance = 5000 + 2000 - 500;
      const p2 = room.players[1]!;
      p2.isBot = false;
      p2.bankrupt = false;

      const session = sessions.addSession('p1');
      const token = manager.generateToken('p1', 'VT397R');
      manager.startGracePeriod('VT397R', 'p1');
      manager.handleGraceExpired('VT397R', 'p1');

      const takeoverMsg = broadcasts.find((m) => m.type === 'PLAYER_BOT_TAKEOVER');

      expect(p1.isBot === true && p1.balance === 6500).toBe(true);
      expect(
        manager.isTokenValid(token) === false && session.state === SessionState.Disconnected,
      ).toBe(true);
      expect(rooms.botTurnRoomCodes).toEqual(['VT397R']);
      expect(takeoverMsg).toEqual({ type: 'PLAYER_BOT_TAKEOVER', playerId: 'p1' });
    } finally {
      manager.clear();
    }
  });

  it('TC-397.03 [UC-GAME-008/A1]: aborts bot takeover when socket is still connected and invokes onAllHumansDisconnected when last human is taken over by Bot', () => {
    const edge = evaluateReconnectEdgeLifecycles();

    expect(
      edge.connectedPlayerStayedHuman && edge.connectedSessionState === SessionState.Connected,
    ).toBe(true);
    expect(edge.lastHumanConvertedToBot).toBe(true);
    expect(edge.allHumansDisconnectedCalls).toEqual(['VT397A']);
    expect(edge.takeoverBroadcastCount === 0 && edge.auxiliaryBranchesValid).toBe(true);
  });

  it('TC-397.04 [UC-NET-002/MSS]: initializes lobby host slot with PLAYER_TOKEN_PALETTE and animal name and cycles BotPersonality across Balanced -> Aggressive -> Passive', () => {
    useLobbyStore.getState().resetLobby();
    const ok = useLobbyStore.getState().initLobby('VT397L', 'p1', true);
    const hostSlot = useLobbyStore.getState().slots[0]!;

    useLobbyStore.getState().toggleBotSlot(1);
    const initialBotPersonality = useLobbyStore.getState().slots[1]?.botPersonality;

    useLobbyStore.getState().cycleBotPersonality(1);
    const afterFirstCycle = useLobbyStore.getState().slots[1]?.botPersonality;

    useLobbyStore.getState().cycleBotPersonality(1);
    const afterSecondCycle = useLobbyStore.getState().slots[1]?.botPersonality;
    useLobbyStore.getState().resetLobby();

    expect(
      ok &&
        PLAYER_TOKEN_PALETTE.some((c) => c === hostSlot.tokenColor) &&
        hostSlot.playerName.trim().length > 0,
    ).toBe(true);
    expect(initialBotPersonality).toBe(BotPersonality.Balanced);
    expect(afterFirstCycle).toBe(BotPersonality.Aggressive);
    expect(
      afterSecondCycle === BotPersonality.Passive &&
        getNextBotPersonality(BotPersonality.Passive) === BotPersonality.Balanced,
    ).toBe(true);
  });

  it('TC-397.05 [UC-UI-S01/MSS]: initializes useGameStore with TurnPhase.WaitingRoll and auto-clears triggered emote after EMOTE_DISPLAY_DURATION_MS', () => {
    vi.useFakeTimers();
    try {
      useGameStore.getState().resetGameState();
      const initialPhase = useGameStore.getState().turnPhase;

      useGameStore.getState().triggerEmote('p1', 'emote_laugh');
      const activeImmediately = useGameStore.getState().activeEmotes['p1']?.emoteId;

      vi.advanceTimersByTime(EMOTE_DISPLAY_DURATION_MS);
      const activeAfterExpiry = useGameStore.getState().activeEmotes['p1'];

      expect(initialPhase).toBe(TurnPhase.WaitingRoll);
      expect(EMOTE_DISPLAY_DURATION_MS).toBe(3000);
      expect(activeImmediately).toBe('emote_laugh');
      expect(activeAfterExpiry).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('TC-397.06 [UC-ARCH-003/A2]: preserves 0 circular dependency SCCs across src/domain/** and compacts src/client/store/lobby_store.ts to <= 278 lines', () => {
    const domainFiles = collectTsFiles(path.resolve(REPO_ROOT, 'src/domain'));
    const domainCycles = detectCycles(domainFiles, REPO_ROOT);
    const lobbyStoreLines = countPhysicalLines('src/client/store/lobby_store.ts');
    const reconnectManagerLines = countPhysicalLines('src/server/network/reconnect_manager.ts');

    expect(domainCycles).toEqual([]);
    expect(domainCycles.length).toBe(0);
    expect(lobbyStoreLines).toBeLessThanOrEqual(278);
    expect(reconnectManagerLines).toBeLessThanOrEqual(287);
  });
});
