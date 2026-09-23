// [IMP-176/MSS][UC-IMP176] Auto-Terminate When All Humans Leave & Master Manifest Merge
// Station 1 Adversarial RED Contract Test Suite
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { WebSocket } from 'ws';
import { RoomManager } from '../../src/server/room_manager.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { SocketRegistry } from '../../src/server/network/socket_registry.js';
import {
  ReconnectManager,
  type ReconnectManagerConfig,
} from '../../src/server/network/reconnect_manager.js';
import {
  TurnOrchestrator,
  AUCTION_SETTLE_DELAY_MS,
} from '../../src/server/network/turn_orchestrator.js';
import {
  handleLeaveRoom,
  type WssLobbyContext,
} from '../../src/server/network/wss_lobby_handlers.js';
import { PersistentRoomLogger } from '../../src/server/logging/persistent_room_logger.js';
import type { ISupabaseStorageService } from '../../src/server/storage/supabase_storage.js';
import type { AdminArchivedRoomSummary } from '../../src/server/network/admin_types.js';
import type { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import type { AdminManager } from '../../src/server/network/admin_manager.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { WssServer } from '../../src/server/network/wss_server.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

// --- Fixtures & Test Helpers ---

const createdTempDirs: string[] = [];

function createTempLogDir(prefix: string): string {
  const dir = path.resolve(
    process.cwd(),
    '.agents',
    'tmp',
    `test_logs_imp176_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  );
  fs.mkdirSync(dir, { recursive: true });
  createdTempDirs.push(dir);
  return dir;
}

function cleanupTempDirs(): void {
  for (const dir of createdTempDirs) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch {
      /* safe-ignore */
    }
  }
  createdTempDirs.length = 0;
}

function createMockSocket(readyState: number = 1): WebSocket {
  return {
    readyState,
    send: vi.fn(),
    close: vi.fn(),
    terminate: vi.fn(),
    on: vi.fn(),
  } as unknown as WebSocket;
}

function createMockBroadcaster(): DeltaBroadcaster {
  return {
    broadcastRoomDelta: vi.fn(),
    resyncClient: vi.fn(),
    clearRoom: vi.fn(),
    setTimeRemainingProvider: vi.fn(),
  } as unknown as DeltaBroadcaster;
}

function createMockAdminManager(): AdminManager {
  return {
    recordRoomEvent: vi.fn(),
    broadcastRoomListToAdmins: vi.fn(),
    handleRoomClosed: vi.fn(),
    initRoomLog: vi.fn(),
    setTimeRemainingProvider: vi.fn(),
    setReconnectManager: vi.fn(),
    setSessionManager: vi.fn(),
  } as unknown as AdminManager;
}

function createMockLobbyContext(
  rooms: RoomManager,
  overrides?: Partial<WssLobbyContext>,
): WssLobbyContext {
  const sessions = new SessionManager();
  const broadcaster = createMockBroadcaster();
  const sockets = new SocketRegistry();
  const reconnects = new ReconnectManager({
    rooms,
    sessions,
    broadcaster,
    broadcast: vi.fn(),
  });
  const adminManager = createMockAdminManager();

  return {
    rooms,
    sessions,
    reconnects,
    sockets,
    broadcaster,
    adminManager,
    sendSafe: vi.fn(),
    broadcast: vi.fn(),
    sendSessionInit: vi.fn(),
    bindSocket: vi.fn(),
    scheduleBotTurn: vi.fn(),
    closeRoom: vi.fn(),
    ...overrides,
  };
}

function createMockStorageService(
  overrides?: Partial<ISupabaseStorageService>,
): ISupabaseStorageService {
  return {
    isConfigured: () => true,
    uploadFile: vi.fn().mockResolvedValue(true),
    downloadFile: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

// =========================================================================
// SECTION A: Tự Động Kết Thúc Khi Hết Người Thật (Auto-Terminate Contract)
// =========================================================================

describe('[IMP-176][Contract A] Auto-Terminate When All Humans Leave', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 1. ReconnectManager Grace Expired
  it('[TC-IMP176.01a/MSS][UC-IMP176] ReconnectManager invokes onAllHumansDisconnected when sole human player grace period expires in a started game with bots', () => {
    const rooms = new RoomManager(42);
    const room = rooms.createRoom('player_hanoi', 'ROOM_HN_01');
    rooms.startGame('ROOM_HN_01', [{ id: 'bot_danang_1' }, { id: 'bot_danang_2' }]);
    expect(room.started).toBe(true);

    const onAllHumansDisconnected = vi.fn();
    const reconnects = new ReconnectManager({
      rooms,
      sessions: new SessionManager(),
      broadcaster: createMockBroadcaster(),
      broadcast: vi.fn(),
      onAllHumansDisconnected,
    } as unknown as ReconnectManagerConfig);

    reconnects.startGracePeriod('ROOM_HN_01', 'player_hanoi');
    reconnects.handleGraceExpired('ROOM_HN_01', 'player_hanoi');

    expect(onAllHumansDisconnected).toHaveBeenCalledWith('ROOM_HN_01');
  });

  it('[TC-IMP176.01b/MSS][UC-IMP176] ReconnectManager falls back to rooms.closeRoom when onAllHumansDisconnected callback is omitted', () => {
    const rooms = new RoomManager(43);
    const room = rooms.createRoom('player_hanoi', 'ROOM_HN_02');
    rooms.startGame('ROOM_HN_02', [{ id: 'bot_danang_1' }, { id: 'bot_danang_2' }]);
    expect(room.started).toBe(true);

    const closeRoomSpy = vi.spyOn(rooms, 'closeRoom');
    const reconnects = new ReconnectManager({
      rooms,
      sessions: new SessionManager(),
      broadcaster: createMockBroadcaster(),
      broadcast: vi.fn(),
    });

    reconnects.startGracePeriod('ROOM_HN_02', 'player_hanoi');
    reconnects.handleGraceExpired('ROOM_HN_02', 'player_hanoi');

    expect(closeRoomSpy).toHaveBeenCalledWith('ROOM_HN_02');
  });

  it('[TC-IMP176.01c/Adversarial][UC-IMP176] ReconnectManager does NOT trigger onAllHumansDisconnected if another human player remains active', () => {
    const rooms = new RoomManager(44);
    const room = rooms.createRoom('player_hanoi', 'ROOM_HN_03');
    rooms.joinRoom('ROOM_HN_03', 'player_saigon');
    rooms.startGame('ROOM_HN_03', [{ id: 'bot_danang' }]);
    expect(room.players.filter((p) => !p.isBot).length).toBe(2);

    const onAllHumansDisconnected = vi.fn();
    const reconnects = new ReconnectManager({
      rooms,
      sessions: new SessionManager(),
      broadcaster: createMockBroadcaster(),
      broadcast: vi.fn(),
      onAllHumansDisconnected,
    } as unknown as ReconnectManagerConfig);

    reconnects.startGracePeriod('ROOM_HN_03', 'player_hanoi');
    reconnects.handleGraceExpired('ROOM_HN_03', 'player_hanoi');

    expect(onAllHumansDisconnected).not.toHaveBeenCalled();
  });

  it('[TC-IMP176.01d/Boundary][UC-IMP176] ReconnectManager does NOT trigger onAllHumansDisconnected when room is in lobby mode', () => {
    const rooms = new RoomManager(45);
    rooms.createRoom('player_host', 'ROOM_LOBBY_01');

    const onAllHumansDisconnected = vi.fn();
    const reconnects = new ReconnectManager({
      rooms,
      sessions: new SessionManager(),
      broadcaster: createMockBroadcaster(),
      broadcast: vi.fn(),
      onAllHumansDisconnected,
    } as unknown as ReconnectManagerConfig);

    reconnects.startGracePeriod('ROOM_LOBBY_01', 'player_host');
    reconnects.handleGraceExpired('ROOM_LOBBY_01', 'player_host');

    expect(onAllHumansDisconnected).not.toHaveBeenCalled();
  });

  // 2. Leave Room Started All Bots
  it('[TC-IMP176.02a/MSS][UC-IMP176] handleLeaveRoom terminates room immediately when sole human player leaves a started game with bots', () => {
    const rooms = new RoomManager(46);
    rooms.createRoom('player_host_hn', 'ROOM_LEAVE_01');
    rooms.startGame('ROOM_LEAVE_01', [{ id: 'bot_ai_01' }, { id: 'bot_ai_02' }]);

    const ctx = createMockLobbyContext(rooms);
    const socket = createMockSocket();

    handleLeaveRoom(ctx, socket, {
      type: 'LEAVE_ROOM',
      roomCode: 'ROOM_LEAVE_01',
      playerId: 'player_host_hn',
    });

    expect(ctx.closeRoom).toHaveBeenCalled();
  });

  it('[TC-IMP176.02b/MSS][UC-IMP176] handleLeaveRoom supplies status TERMINATED to ctx.closeRoom when last human departs', () => {
    const rooms = new RoomManager(47);
    rooms.createRoom('player_host_hn', 'ROOM_LEAVE_01');
    rooms.startGame('ROOM_LEAVE_01', [{ id: 'bot_ai_01' }, { id: 'bot_ai_02' }]);

    const ctx = createMockLobbyContext(rooms);
    const socket = createMockSocket();

    handleLeaveRoom(ctx, socket, {
      type: 'LEAVE_ROOM',
      roomCode: 'ROOM_LEAVE_01',
      playerId: 'player_host_hn',
    });

    expect(ctx.closeRoom).toHaveBeenCalledWith('ROOM_LEAVE_01', { status: 'TERMINATED' });
  });

  it('[TC-IMP176.02c/Boundary][UC-IMP176] handleLeaveRoom terminates room when a non-host human leaves and all other humans are bankrupt or bots', () => {
    const rooms = new RoomManager(48);
    const room = rooms.createRoom('player_p1', 'ROOM_LEAVE_02');
    rooms.joinRoom('ROOM_LEAVE_02', 'player_p2');
    rooms.startGame('ROOM_LEAVE_02', [{ id: 'bot_p3' }]);

    // P1 (Host) is already bankrupt
    const hostPlayer = room.players.find((p) => p.id === 'player_p1')!;
    hostPlayer.bankrupt = true;

    const ctx = createMockLobbyContext(rooms);
    const socket = createMockSocket();

    // P2 (sole remaining active human) leaves
    handleLeaveRoom(ctx, socket, {
      type: 'LEAVE_ROOM',
      roomCode: 'ROOM_LEAVE_02',
      playerId: 'player_p2',
    });

    expect(ctx.closeRoom).toHaveBeenCalledWith('ROOM_LEAVE_02', { status: 'TERMINATED' });
  });

  // 3. Leave Room Started Multi Humans
  it('[TC-IMP176.03a/Adversarial][UC-IMP176] handleLeaveRoom keeps match active when Host leaves if another human player is alive', () => {
    const rooms = new RoomManager(49);
    rooms.createRoom('player_host_hn', 'ROOM_MULTI_01');
    rooms.joinRoom('ROOM_MULTI_01', 'player_guest_sg');
    rooms.startGame('ROOM_MULTI_01', [{ id: 'bot_danang' }]);

    const ctx = createMockLobbyContext(rooms);
    const socket = createMockSocket();

    handleLeaveRoom(ctx, socket, {
      type: 'LEAVE_ROOM',
      roomCode: 'ROOM_MULTI_01',
      playerId: 'player_host_hn',
    });

    expect(ctx.closeRoom).not.toHaveBeenCalled();
  });

  it('[TC-IMP176.03b/Adversarial][UC-IMP176] handleLeaveRoom migrates hostId to next alive human player when Host departs in multi-human match', () => {
    const rooms = new RoomManager(50);
    const room = rooms.createRoom('player_host_hn', 'ROOM_MULTI_01');
    rooms.joinRoom('ROOM_MULTI_01', 'player_guest_sg');
    rooms.startGame('ROOM_MULTI_01', [{ id: 'bot_danang' }]);

    const ctx = createMockLobbyContext(rooms);
    const socket = createMockSocket();

    handleLeaveRoom(ctx, socket, {
      type: 'LEAVE_ROOM',
      roomCode: 'ROOM_MULTI_01',
      playerId: 'player_host_hn',
    });

    expect(room.hostId).toBe('player_guest_sg');
  });

  it('[TC-IMP176.03c/Adversarial][UC-IMP176] handleLeaveRoom marks departed host as bankrupt/inactive in started multi-human match', () => {
    const rooms = new RoomManager(51);
    const room = rooms.createRoom('player_host_hn', 'ROOM_MULTI_01');
    rooms.joinRoom('ROOM_MULTI_01', 'player_guest_sg');
    rooms.startGame('ROOM_MULTI_01', [{ id: 'bot_danang' }]);

    const ctx = createMockLobbyContext(rooms);
    const socket = createMockSocket();

    handleLeaveRoom(ctx, socket, {
      type: 'LEAVE_ROOM',
      roomCode: 'ROOM_MULTI_01',
      playerId: 'player_host_hn',
    });

    const departed = room.players.find((p) => p.id === 'player_host_hn');
    expect(departed?.bankrupt).toBe(true);
  });

  // 4. Auction Timer Leak Disposal
  it('[TC-IMP176.04a/Disposal][UC-IMP176] destroyRoom cancels pending auctionSettleTimer in TurnOrchestrator', () => {
    vi.useFakeTimers();
    const rooms = new RoomManager(52);
    rooms.createRoom('p1', 'ROOM_AUC_01');
    const broadcaster = createMockBroadcaster();
    const orchestrator = new TurnOrchestrator({
      rooms,
      intentMutex: new IntentMutex(),
      broadcaster,
      onGameOver: vi.fn(),
    });

    orchestrator.scheduleAuctionSettle('ROOM_AUC_01');
    expect((orchestrator as unknown as { auctionSettleTimers: Map<string, unknown> }).auctionSettleTimers.has('ROOM_AUC_01')).toBe(true);

    orchestrator.destroyRoom('ROOM_AUC_01');
    expect((orchestrator as unknown as { auctionSettleTimers: Map<string, unknown> }).auctionSettleTimers.has('ROOM_AUC_01')).toBe(false);
  });

  it('[TC-IMP176.04b/Disposal][UC-IMP176] advancing timers after destroyRoom triggers zero settleAuction calls or delta broadcasts', () => {
    vi.useFakeTimers();
    const rooms = new RoomManager(53);
    rooms.createRoom('p1', 'ROOM_AUC_02');
    const settleAuctionSpy = vi.spyOn(rooms, 'settleAuction');
    const broadcaster = createMockBroadcaster();
    const orchestrator = new TurnOrchestrator({
      rooms,
      intentMutex: new IntentMutex(),
      broadcaster,
      onGameOver: vi.fn(),
    });

    orchestrator.scheduleAuctionSettle('ROOM_AUC_02');
    orchestrator.destroyRoom('ROOM_AUC_02');

    vi.advanceTimersByTime(AUCTION_SETTLE_DELAY_MS + 2000);

    expect(settleAuctionSpy).not.toHaveBeenCalled();
    expect(broadcaster.broadcastRoomDelta).not.toHaveBeenCalled();
  });

  it('[TC-IMP176.04c/Disposal][UC-IMP176] WssServer.closeRoom cleans auction settle timers in TurnOrchestrator preventing leaks', async () => {
    vi.useFakeTimers();
    const server = new WssServer({ port: 0 });
    try {
      const roomMgr = server.getRoomManager();
      const room = roomMgr.createRoom('player_hanoi', 'ROOM_AUC_03');
      const orchestrator = (server as unknown as { turnOrchestrator: TurnOrchestrator }).turnOrchestrator;

      orchestrator.scheduleAuctionSettle(room.roomCode);
      expect((orchestrator as unknown as { auctionSettleTimers: Map<string, unknown> }).auctionSettleTimers.has(room.roomCode)).toBe(true);

      server.closeRoom(room.roomCode);

      expect((orchestrator as unknown as { auctionSettleTimers: Map<string, unknown> }).auctionSettleTimers.has(room.roomCode)).toBe(false);
    } finally {
      await server.close();
    }
  });
});

// =========================================================================
// SECTION B: Master Manifest Merge & Concurrency Queue
// =========================================================================

describe('[IMP-176][Contract B] Master Manifest Merge & Concurrency Queue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanupTempDirs();
  });

  afterAll(() => {
    cleanupTempDirs();
  });

  // 5. Master Manifest Merge on Cold Boot
  it('[TC-IMP176.05a/MSS][UC-IMP176] finishRoomLog downloads existing cloud manifest before uploading on cold boot', async () => {
    const tempDir = createTempLogDir('cold_boot_dl');
    const mockStorage = createMockStorageService({
      downloadFile: vi.fn().mockImplementation(async (_bucket: string, key: string) => {
        if (key === '_manifest/rooms_manifest.json') {
          return JSON.stringify([
            {
              roomCode: 'HISTORICAL_ROOM_01',
              logFilePath: 'HISTORICAL_ROOM_01_1700000000000.jsonl',
              status: 'FINISHED',
              startTime: 1700000000000,
              playerCount: 4,
              totalEvents: 50,
              fileSizeBytes: 4096,
            },
          ]);
        }
        return null;
      }),
    });

    const logger = new PersistentRoomLogger({
      logDir: tempDir,
      supabaseStorage: mockStorage,
    });

    logger.initRoomLog('NEW_ROOM_01', { timestamp: 1700000100000 });
    logger.finishRoomLog('NEW_ROOM_01', { status: 'FINISHED' });
    await logger.stop();

    expect(mockStorage.downloadFile).toHaveBeenCalledWith('game-logs', '_manifest/rooms_manifest.json');
  });

  it('[TC-IMP176.05b/MSS][UC-IMP176] finishRoomLog uploads merged manifest containing both cloud historical records and newly finished room', async () => {
    const tempDir = createTempLogDir('cold_boot_merge');
    const mockStorage = createMockStorageService({
      downloadFile: vi.fn().mockImplementation(async (_bucket: string, key: string) => {
        if (key === '_manifest/rooms_manifest.json') {
          return JSON.stringify([
            {
              roomCode: 'HISTORICAL_ROOM_01',
              logFilePath: 'HISTORICAL_ROOM_01_1700000000000.jsonl',
              status: 'FINISHED',
              startTime: 1700000000000,
              playerCount: 4,
              totalEvents: 50,
              fileSizeBytes: 4096,
            },
          ]);
        }
        return null;
      }),
    });

    const logger = new PersistentRoomLogger({
      logDir: tempDir,
      supabaseStorage: mockStorage,
    });

    logger.initRoomLog('NEW_ROOM_01', { timestamp: 1700000100000 });
    logger.finishRoomLog('NEW_ROOM_01', { status: 'FINISHED' });
    await logger.stop();

    const manifestUploadCall = (mockStorage.uploadFile as unknown as { mock: { calls: Array<[string, string, string, string]> } }).mock.calls.find(
      (c) => c[1] === '_manifest/rooms_manifest.json',
    );
    expect(manifestUploadCall).toBeDefined();

    const uploadedManifest = JSON.parse(manifestUploadCall![2]) as AdminArchivedRoomSummary[];
    const roomCodes = uploadedManifest.map((m) => m.roomCode);
    expect(roomCodes).toContain('HISTORICAL_ROOM_01');
    expect(roomCodes).toContain('NEW_ROOM_01');
  });

  // 6. Fail-Safe Guard on Network Error
  it('[TC-IMP176.06a/Adversarial][UC-IMP176] finishRoomLog still uploads .jsonl log file when cloud manifest download fails with 500 error', async () => {
    const tempDir = createTempLogDir('fail_safe_jsonl');
    const mockStorage = createMockStorageService({
      downloadFile: vi.fn().mockRejectedValue(new Error('Supabase 500 Internal Server Error')),
    });

    const logger = new PersistentRoomLogger({
      logDir: tempDir,
      supabaseStorage: mockStorage,
    });

    logger.initRoomLog('ROOM_ERR_01', { timestamp: 1700000200000 });
    logger.finishRoomLog('ROOM_ERR_01', { status: 'FINISHED' });
    await logger.stop();

    const jsonlUploadCall = (mockStorage.uploadFile as unknown as { mock: { calls: Array<[string, string, string, string]> } }).mock.calls.find(
      (c) => c[1].endsWith('.jsonl'),
    );
    expect(jsonlUploadCall).toBeDefined();
  });

  it('[TC-IMP176.06b/Adversarial][UC-IMP176] finishRoomLog does NOT upload or overwrite _manifest/rooms_manifest.json when cloud manifest download fails with network error', async () => {
    const tempDir = createTempLogDir('fail_safe_manifest');
    const mockStorage = createMockStorageService({
      downloadFile: vi.fn().mockRejectedValue(new Error('Supabase 500 Internal Server Error')),
    });

    const logger = new PersistentRoomLogger({
      logDir: tempDir,
      supabaseStorage: mockStorage,
    });

    logger.initRoomLog('ROOM_ERR_01', { timestamp: 1700000200000 });
    logger.finishRoomLog('ROOM_ERR_01', { status: 'FINISHED' });
    await logger.stop();

    const manifestUploadCall = (mockStorage.uploadFile as unknown as { mock: { calls: Array<[string, string, string, string]> } }).mock.calls.find(
      (c) => c[1] === '_manifest/rooms_manifest.json',
    );
    expect(manifestUploadCall).toBeUndefined();
  });

  it('[TC-IMP176.06c/Boundary][UC-IMP176] finishRoomLog treats 404 / null cloud download as clean initial state and uploads new manifest', async () => {
    const tempDir = createTempLogDir('clean_initial_state');
    const mockStorage = createMockStorageService({
      downloadFile: vi.fn().mockResolvedValue(null),
    });

    const logger = new PersistentRoomLogger({
      logDir: tempDir,
      supabaseStorage: mockStorage,
    });

    logger.initRoomLog('ROOM_INIT_01', { timestamp: 1700000300000 });
    logger.finishRoomLog('ROOM_INIT_01', { status: 'FINISHED' });
    await logger.stop();

    const manifestUploadCall = (mockStorage.uploadFile as unknown as { mock: { calls: Array<[string, string, string, string]> } }).mock.calls.find(
      (c) => c[1] === '_manifest/rooms_manifest.json',
    );
    expect(manifestUploadCall).toBeDefined();
    const uploadedManifest = JSON.parse(manifestUploadCall![2]) as AdminArchivedRoomSummary[];
    expect(uploadedManifest.some((m) => m.roomCode === 'ROOM_INIT_01')).toBe(true);
  });

  // 7. Status Precedence
  it('[TC-IMP176.07a/Boundary][UC-IMP176] Status Precedence: merging manifest overrides Cloud status ACTIVE with local status TERMINATED', async () => {
    const tempDir = createTempLogDir('precedence_term');
    const targetFile = 'ROOM_PREC_01_1700000400000.jsonl';
    const mockStorage = createMockStorageService({
      downloadFile: vi.fn().mockImplementation(async () => {
        return JSON.stringify([
          {
            roomCode: 'HISTORICAL_CLOUD_01',
            logFilePath: 'HISTORICAL_CLOUD_01_1700000390000.jsonl',
            status: 'FINISHED',
            startTime: 1700000390000,
            playerCount: 4,
            totalEvents: 30,
            fileSizeBytes: 2048,
          },
          {
            roomCode: 'ROOM_PREC_01',
            logFilePath: targetFile,
            status: 'ACTIVE',
            startTime: 1700000400000,
            playerCount: 2,
            totalEvents: 10,
            fileSizeBytes: 1024,
          },
        ]);
      }),
    });

    const logger = new PersistentRoomLogger({
      logDir: tempDir,
      supabaseStorage: mockStorage,
    });

    logger.initRoomLog('ROOM_PREC_01', { timestamp: 1700000400000 });
    logger.finishRoomLog('ROOM_PREC_01', { status: 'TERMINATED' });
    await logger.stop();

    expect(mockStorage.downloadFile).toHaveBeenCalledWith('game-logs', '_manifest/rooms_manifest.json');
    const manifestUploadCall = (mockStorage.uploadFile as unknown as { mock: { calls: Array<[string, string, string, string]> } }).mock.calls.find(
      (c) => c[1] === '_manifest/rooms_manifest.json',
    );
    expect(manifestUploadCall).toBeDefined();
    const list = JSON.parse(manifestUploadCall![2]) as AdminArchivedRoomSummary[];
    expect(list.some((m) => m.roomCode === 'HISTORICAL_CLOUD_01')).toBe(true);
    const entry = list.find((m) => m.logFilePath === targetFile);
    expect(entry?.status).toBe('TERMINATED');
  });

  it('[TC-IMP176.07b/Boundary][UC-IMP176] Status Precedence: merging manifest overrides Cloud status ACTIVE with local status FINISHED', async () => {
    const tempDir = createTempLogDir('precedence_fin');
    const targetFile = 'ROOM_PREC_02_1700000500000.jsonl';
    const mockStorage = createMockStorageService({
      downloadFile: vi.fn().mockImplementation(async () => {
        return JSON.stringify([
          {
            roomCode: 'HISTORICAL_CLOUD_02',
            logFilePath: 'HISTORICAL_CLOUD_02_1700000490000.jsonl',
            status: 'FINISHED',
            startTime: 1700000490000,
            playerCount: 3,
            totalEvents: 25,
            fileSizeBytes: 2048,
          },
          {
            roomCode: 'ROOM_PREC_02',
            logFilePath: targetFile,
            status: 'ACTIVE',
            startTime: 1700000500000,
            playerCount: 3,
            totalEvents: 20,
            fileSizeBytes: 2048,
          },
        ]);
      }),
    });

    const logger = new PersistentRoomLogger({
      logDir: tempDir,
      supabaseStorage: mockStorage,
    });

    logger.initRoomLog('ROOM_PREC_02', { timestamp: 1700000500000 });
    logger.finishRoomLog('ROOM_PREC_02', { status: 'FINISHED' });
    await logger.stop();

    expect(mockStorage.downloadFile).toHaveBeenCalledWith('game-logs', '_manifest/rooms_manifest.json');
    const manifestUploadCall = (mockStorage.uploadFile as unknown as { mock: { calls: Array<[string, string, string, string]> } }).mock.calls.find(
      (c) => c[1] === '_manifest/rooms_manifest.json',
    );
    expect(manifestUploadCall).toBeDefined();
    const list = JSON.parse(manifestUploadCall![2]) as AdminArchivedRoomSummary[];
    expect(list.some((m) => m.roomCode === 'HISTORICAL_CLOUD_02')).toBe(true);
    const entry = list.find((m) => m.logFilePath === targetFile);
    expect(entry?.status).toBe('FINISHED');
  });

  it('[TC-IMP176.07c/Boundary][UC-IMP176] Status Precedence: merging manifest preserves Cloud status FINISHED if local status is ACTIVE', async () => {
    const tempDir = createTempLogDir('precedence_preserve');
    const targetFile = 'ROOM_PREC_03_1700000600000.jsonl';
    const mockStorage = createMockStorageService({
      downloadFile: vi.fn().mockImplementation(async () => {
        return JSON.stringify([
          {
            roomCode: 'ROOM_PREC_03',
            logFilePath: targetFile,
            status: 'FINISHED',
            startTime: 1700000600000,
            playerCount: 2,
            totalEvents: 30,
            fileSizeBytes: 3072,
          },
        ]);
      }),
    });

    const logger = new PersistentRoomLogger({
      logDir: tempDir,
      supabaseStorage: mockStorage,
    });

    // Another room finishes while ROOM_PREC_03 was active locally
    logger.initRoomLog('ROOM_PREC_03', { timestamp: 1700000600000 });
    logger.initRoomLog('ROOM_OTHER_03', { timestamp: 1700000650000 });
    logger.finishRoomLog('ROOM_OTHER_03', { status: 'FINISHED' });
    await logger.stop();

    const manifestUploadCall = (mockStorage.uploadFile as unknown as { mock: { calls: Array<[string, string, string, string]> } }).mock.calls.find(
      (c) => c[1] === '_manifest/rooms_manifest.json',
    );
    expect(manifestUploadCall).toBeDefined();
    const list = JSON.parse(manifestUploadCall![2]) as AdminArchivedRoomSummary[];
    const entry = list.find((m) => m.logFilePath === targetFile);
    expect(entry?.status).toBe('FINISHED');
  });

  // 8. Sequential Concurrency Queue
  it('[TC-IMP176.08a/MSS][UC-IMP176] Rapid consecutive finishRoomLog calls process cloud manifest updates sequentially', async () => {
    const tempDir = createTempLogDir('concurrency_seq');
    const executionOrder: string[] = [];

    const mockStorage = createMockStorageService({
      downloadFile: vi.fn().mockImplementation(async () => {
        executionOrder.push('download');
        return JSON.stringify([]);
      }),
      uploadFile: vi.fn().mockImplementation(async (_bucket: string, key: string) => {
        if (key === '_manifest/rooms_manifest.json') {
          executionOrder.push('upload_manifest');
        }
        return true;
      }),
    });

    const logger = new PersistentRoomLogger({
      logDir: tempDir,
      supabaseStorage: mockStorage,
    });

    logger.initRoomLog('ROOM_CONCUR_A', { timestamp: 1700000700000 });
    logger.initRoomLog('ROOM_CONCUR_B', { timestamp: 1700000750000 });

    logger.finishRoomLog('ROOM_CONCUR_A', { status: 'FINISHED' });
    logger.finishRoomLog('ROOM_CONCUR_B', { status: 'FINISHED' });
    await logger.stop();

    expect(executionOrder.length).toBeGreaterThanOrEqual(2);
    // Serialized execution means download-upload cycles do not interleave haphazardly
    expect(executionOrder[0]).toBe('download');
  });

  it('[TC-IMP176.08b/MSS][UC-IMP176] Final uploaded cloud manifest contains all rooms from consecutive finishes without drops', async () => {
    const tempDir = createTempLogDir('concurrency_final');
    let cloudManifestStore: AdminArchivedRoomSummary[] = [
      {
        roomCode: 'HISTORICAL_ORIGIN',
        logFilePath: 'HISTORICAL_ORIGIN_1700000000000.jsonl',
        status: 'FINISHED',
        startTime: 1700000000000,
        playerCount: 2,
        totalEvents: 15,
        fileSizeBytes: 1500,
      },
    ];

    const mockStorage = createMockStorageService({
      downloadFile: vi.fn().mockImplementation(async () => {
        return JSON.stringify(cloudManifestStore);
      }),
      uploadFile: vi.fn().mockImplementation(async (_bucket: string, key: string, content: string) => {
        if (key === '_manifest/rooms_manifest.json') {
          cloudManifestStore = JSON.parse(content) as AdminArchivedRoomSummary[];
        }
        return true;
      }),
    });

    const logger = new PersistentRoomLogger({
      logDir: tempDir,
      supabaseStorage: mockStorage,
    });

    logger.initRoomLog('ROOM_CONCUR_A', { timestamp: 1700000800000 });
    logger.initRoomLog('ROOM_CONCUR_B', { timestamp: 1700000850000 });

    logger.finishRoomLog('ROOM_CONCUR_A', { status: 'FINISHED' });
    logger.finishRoomLog('ROOM_CONCUR_B', { status: 'FINISHED' });
    await logger.stop();

    const finalCodes = cloudManifestStore.map((m) => m.roomCode);
    expect(finalCodes).toContain('HISTORICAL_ORIGIN');
    expect(finalCodes).toContain('ROOM_CONCUR_A');
    expect(finalCodes).toContain('ROOM_CONCUR_B');
  });
});
