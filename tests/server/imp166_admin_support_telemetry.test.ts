// [IMP-166/MSS][UC-GAME-ADM] Admin Step-by-Step Player Support & Multi-Room Live Telemetry Portal
// Universal Contract Test Suite: 4-Facet Behavioral Matrix
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { WebSocket } from 'ws';
import { RoomManager } from '../../src/server/room_manager.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { ReconnectManager } from '../../src/server/network/reconnect_manager.js';
import { AdminManager } from '../../src/server/network/admin_manager.js';
import * as AdminInspector from '../../src/server/network/admin_inspector.js';
import { TurnPhase } from '../../src/domain/room.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { IntentGuard } from '../../src/server/security/intent_guard.js';
import { SocketRegistry } from '../../src/server/network/socket_registry.js';
import { handleIntentMsg, type IntentHandlerDeps } from '../../src/server/network/wss_intent_handler.js';
import type {
  AdminPlayerSummary,
  AdminRoomSummary,
  AdminRoomLogEntry,
} from '../../src/server/network/admin_types.js';

export interface ServerVitals {
  readonly memoryRssMb: number;
  readonly memoryHeapUsedMb: number;
  readonly uptimeSeconds: number;
  readonly totalRooms: number;
  readonly liveRooms: number;
  readonly lobbyRooms: number;
}

export interface ExtendedAdminPlayerSummary extends AdminPlayerSummary {
  readonly inGracePeriod?: boolean;
  readonly graceSecondsLeft?: number;
}

export interface ExtendedAdminRoomSummary extends AdminRoomSummary {
  readonly currentTurnPlayerId?: string;
  readonly currentTurnStepName?: string;
  readonly turnSecondsLeft?: number;
  readonly players: readonly ExtendedAdminPlayerSummary[];
}

export interface ExtendedAdminRoomLogEntry extends AdminRoomLogEntry {
  readonly playerId?: string;
}

function createMockWebSocket(): WebSocket {
  return {
    readyState: 1, // WebSocket.OPEN
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  } as unknown as WebSocket;
}

describe('[IMP-166/MSS][UC-GAME-ADM] Admin Step-by-Step Player Support & Multi-Room Live Telemetry Portal', () => {
  let roomManager: RoomManager;
  let sessionManager: SessionManager;
  let broadcaster: DeltaBroadcaster;
  let reconnectManager: ReconnectManager;
  let adminManager: AdminManager;

  beforeEach(() => {
    roomManager = new RoomManager();
    sessionManager = new SessionManager();
    broadcaster = new DeltaBroadcaster(roomManager, sessionManager, () => {});
    reconnectManager = new ReconnectManager({
      rooms: roomManager,
      sessions: sessionManager,
      broadcaster,
      broadcast: () => {},
      gracePeriodMs: 60_000,
    });
    adminManager = new AdminManager({
      roomManager,
      secret: 'super-admin-telemetry-secret',
    });
  });

  afterEach(() => {
    reconnectManager.clear();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-IMP166.01a/MSS][UC-GAME-ADM] adminManager.getServerVitals() trả về các thông số bộ nhớ và uptime hợp lệ', () => {
      const vitals = (adminManager as unknown as { getServerVitals?: () => ServerVitals }).getServerVitals?.();
      expect(vitals?.memoryRssMb).toBeGreaterThan(0);
      expect(vitals?.memoryHeapUsedMb).toBeGreaterThan(0);
      expect(vitals?.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });

    it('[TC-IMP166.01b/MSS][UC-GAME-ADM] adminManager.getServerVitals() thống kê chính xác totalRooms, liveRooms, lobbyRooms', () => {
      const liveRoom = roomManager.createRoom('HOST_LIVE', 'Alice');
      roomManager.joinRoom(liveRoom.roomCode, 'PLAYER_LIVE_2');
      roomManager.startGame(liveRoom.roomCode);

      const lobbyRoom = roomManager.createRoom('HOST_LOBBY', 'Charlie');
      expect(lobbyRoom.started).toBe(false);

      const vitals = (adminManager as unknown as { getServerVitals?: () => ServerVitals }).getServerVitals?.();
      expect(vitals?.totalRooms).toBe(2);
      expect(vitals?.liveRooms).toBe(1);
      expect(vitals?.lobbyRooms).toBe(1);
    });

    it.each([
      [TurnPhase.WaitingRoll, 'WaitingRoll'],
      [TurnPhase.ActionPhase, 'ActionPhase'],
      [TurnPhase.AuctionPhase, 'AuctionPhase'],
      [TurnPhase.PropertyManagement, 'PropertyManagement'],
      [TurnPhase.InsolvencyPhase, 'InsolvencyPhase'],
      [TurnPhase.BankruptcyCheck, 'BankruptcyCheck'],
      [TurnPhase.TurnEnd, 'TurnEnd'],
      [TurnPhase.HosePhase, 'HosePhase'],
    ])('[TC-IMP166.02/MSS][UC-GAME-ADM] resolveTurnStepName ánh xạ pha FSM %s thành nhãn hiển thị không ném lỗi', (phase) => {
      const resolver = (AdminInspector as unknown as { resolveTurnStepName?: (p: TurnPhase) => string }).resolveTurnStepName;
      const stepName = resolver?.(phase);
      expect(typeof stepName).toBe('string');
      expect(stepName?.length).toBeGreaterThan(0);
    });

    it('[TC-IMP166.03/MSS][UC-GAME-ADM] resolveTurnStepName trả về chuỗi có chứa Kiểm toán khi player.inAudit === true tại WaitingRoll', () => {
      const resolver = (AdminInspector as unknown as {
        resolveTurnStepName?: (p: TurnPhase, audit?: boolean | { inAudit?: boolean }) => string;
      }).resolveTurnStepName;
      const stepName = resolver?.(TurnPhase.WaitingRoll, true);
      expect(stepName).toBeDefined();
      expect(stepName?.toLowerCase()).toContain('kiểm toán');
    });

    it('[TC-IMP166.04a/MSS][UC-GAME-ADM] resolveTurnStepName trả về Sảnh chờ khi bàn chơi chưa bắt đầu', () => {
      const resolver = (AdminInspector as unknown as {
        resolveTurnStepName?: (p: TurnPhase, audit?: boolean, started?: boolean) => string;
      }).resolveTurnStepName;
      const stepName = resolver?.(TurnPhase.WaitingRoll, false, false);
      expect(stepName).toBe('Sảnh chờ');
    });

    it('[TC-IMP166.04b/MSS][UC-GAME-ADM] buildRoomSummary thể hiện currentTurnStepName là Sảnh chờ khi room.started === false', () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      const summary = AdminInspector.buildRoomSummary(room, roomManager) as ExtendedAdminRoomSummary;
      expect(summary.started).toBe(false);
      expect(summary.currentTurnStepName).toBe('Sảnh chờ');
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & MULTI-TURN TEARDOWN
  // =========================================================================
  describe('Facet 2: State Reactivity & Multi-Turn Teardown', () => {
    it('[TC-IMP166.05/MSS][UC-GAME-ADM] timeRemainingProvider cập nhật đúng số giây còn lại vào AdminRoomSummary.turnSecondsLeft', () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      roomManager.joinRoom(room.roomCode, 'PLAYER_BOB');
      roomManager.startGame(room.roomCode);

      const summary = (AdminInspector.buildRoomSummary as unknown as (
        r: typeof room,
        rm: typeof roomManager,
        v?: unknown,
        opts?: { timeRemainingProvider?: (rc: string) => number },
      ) => ExtendedAdminRoomSummary)(room, roomManager, undefined, {
        timeRemainingProvider: () => 23,
      });

      expect(summary.turnSecondsLeft).toBe(23);
    });

    it('[TC-IMP166.06a/MSS][UC-GAME-ADM] reconnectManager.isPlayerInGrace kích hoạt true khi người chơi ngắt kết nối', () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      reconnectManager.startGracePeriod(room.roomCode, 'HOST_ALICE');
      expect(reconnectManager.isPlayerInGrace(room.roomCode, 'HOST_ALICE')).toBe(true);
    });

    it('[TC-IMP166.06b/MSS][UC-GAME-ADM] reconnectManager.getGraceRemainingSeconds trả về số giây ân hạn còn lại dương', () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      reconnectManager.startGracePeriod(room.roomCode, 'HOST_ALICE');

      const getter = (reconnectManager as unknown as {
        getGraceRemainingSeconds?: (rc: string, pid: string) => number;
      }).getGraceRemainingSeconds;
      const secondsLeft = getter?.(room.roomCode, 'HOST_ALICE');

      expect(typeof secondsLeft).toBe('number');
      expect(secondsLeft).toBeGreaterThan(0);
    });

    it('[TC-IMP166.07/MSS][UC-GAME-ADM] buildRoomSummary trích xuất AdminPlayerSummary với inGracePeriod: true và graceSecondsLeft > 0', () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      reconnectManager.startGracePeriod(room.roomCode, 'HOST_ALICE');

      const summary = (AdminInspector.buildRoomSummary as unknown as (
        r: typeof room,
        rm: typeof roomManager,
        v?: unknown,
        opts?: { reconnectManager?: ReconnectManager },
      ) => ExtendedAdminRoomSummary)(room, roomManager, undefined, {
        reconnectManager,
      });

      const alice = summary.players.find((p) => p.id === 'HOST_ALICE');
      expect(alice?.inGracePeriod).toBe(true);
      expect(alice?.graceSecondsLeft).toBeGreaterThan(0);
    });

    it('[TC-IMP166.08/MSS][UC-GAME-ADM] Khi reconnect thành công (cancelGracePeriod), inGracePeriod trở về false trong buildRoomSummary', () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      reconnectManager.startGracePeriod(room.roomCode, 'HOST_ALICE');
      reconnectManager.cancelGracePeriod(room.roomCode, 'HOST_ALICE');

      const summary = (AdminInspector.buildRoomSummary as unknown as (
        r: typeof room,
        rm: typeof roomManager,
        v?: unknown,
        opts?: { reconnectManager?: ReconnectManager },
      ) => ExtendedAdminRoomSummary)(room, roomManager, undefined, {
        reconnectManager,
      });

      const alice = summary.players.find((p) => p.id === 'HOST_ALICE');
      expect(alice?.inGracePeriod).toBe(false);
      expect(alice?.graceSecondsLeft).toBe(0);
    });

    it('[TC-IMP166.09/MSS][UC-GAME-ADM] buildRoomSummary điền chính xác currentTurnPlayerId, currentTurnStepName và turnSecondsLeft khi room.started === true', () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      roomManager.joinRoom(room.roomCode, 'PLAYER_BOB');
      roomManager.startGame(room.roomCode);

      const summary = (AdminInspector.buildRoomSummary as unknown as (
        r: typeof room,
        rm: typeof roomManager,
        v?: unknown,
        opts?: { timeRemainingProvider?: (rc: string) => number },
      ) => ExtendedAdminRoomSummary)(room, roomManager, undefined, {
        timeRemainingProvider: () => 45,
      });

      expect(summary.currentTurnPlayerId).toBe('HOST_ALICE');
      expect(summary.currentTurnStepName).toBeTruthy();
      expect(summary.currentTurnStepName).not.toBe('Sảnh chờ');
      expect(summary.turnSecondsLeft).toBe(45);
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & TIMER ISOLATION
  // =========================================================================
  describe('Facet 3: Resource Disposal & Timer Isolation', () => {
    it('[TC-IMP166.10/MSS][UC-GAME-ADM] AdminManager.getServerVitals() hoạt động on-demand mà không kích hoạt ngầm setInterval rò rỉ', () => {
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
      const vitalsGetter = (adminManager as unknown as { getServerVitals?: () => ServerVitals }).getServerVitals;

      vitalsGetter?.();
      vitalsGetter?.();

      expect(setIntervalSpy).not.toHaveBeenCalled();
      setIntervalSpy.mockRestore();
    });

    it('[TC-IMP166.11/MSS][UC-GAME-ADM] buildRoomSummary hoạt động trơn tru an toàn về 0 giây khi không có provider', () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      const summary = AdminInspector.buildRoomSummary(room, roomManager) as ExtendedAdminRoomSummary;

      expect(summary.turnSecondsLeft).toBe(0);
      expect(summary.players[0]?.inGracePeriod).toBe(false);
      expect(summary.players[0]?.graceSecondsLeft).toBe(0);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & EVENT ENRICHMENT
  // =========================================================================
  describe('Facet 4: Error Defense & Event Enrichment', () => {
    it('[TC-IMP166.12/MSS][UC-GAME-ADM] recordRoomEvent lưu trữ trường playerId vào AdminRoomLogEntry', () => {
      const entry = (adminManager as unknown as {
        recordRoomEvent: (rc: string, e: { source: string; action: string; payloadSummary: string; playerId?: string }) => ExtendedAdminRoomLogEntry;
      }).recordRoomEvent('ROOM_TELEMETRY', {
        source: 'PLAYER',
        action: 'INTENT_ROLL',
        payloadSummary: 'Alice gieo xúc xắc',
        playerId: 'PLAYER_ALICE',
      });

      expect(entry.playerId).toBe('PLAYER_ALICE');
      const recent = adminManager.getRecentLogs('ROOM_TELEMETRY') as ExtendedAdminRoomLogEntry[];
      expect(recent[0]?.playerId).toBe('PLAYER_ALICE');
    });

    it('[TC-IMP166.13/MSS][UC-GAME-ADM] recordRoomEvent phát sóng sự kiện kèm playerId tới admin socket đã đăng ký', () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      const rc = room.roomCode;

      const mockAdminWs = createMockWebSocket();
      adminManager.authenticate(mockAdminWs, 'super-admin-telemetry-secret');
      adminManager.subscribeRoom(mockAdminWs, rc);

      (adminManager as unknown as {
        recordRoomEvent: (r: string, e: { source: string; action: string; payloadSummary: string; playerId?: string }) => void;
      }).recordRoomEvent(rc, {
        source: 'PLAYER',
        action: 'INTENT_BUY',
        payloadSummary: 'Bob mua BĐS ô 3',
        playerId: 'PLAYER_BOB',
      });

      const calls = vi.mocked(mockAdminWs.send).mock.calls;
      const lastCall = calls[calls.length - 1];
      const parsed = JSON.parse(String(lastCall?.[0])) as { type: string; log: ExtendedAdminRoomLogEntry };

      expect(parsed.type).toBe('ADMIN_ROOM_LOG');
      expect(parsed.log?.playerId).toBe('PLAYER_BOB');
    });

    it('[TC-IMP166.14/MSS][UC-GAME-ADM] payloadSummary ghi nhận chi tiết xúc xắc, ô cờ đến, tiền thuê và số dư mới khi xử lý intent gieo xúc xắc', async () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      roomManager.joinRoom(room.roomCode, 'PLAYER_BOB');
      roomManager.startGame(room.roomCode);

      const mockWs = createMockWebSocket();
      const sockets = new SocketRegistry();
      sockets.bind(room.roomCode, 'HOST_ALICE', mockWs);

      const deps: IntentHandlerDeps = {
        rooms: roomManager,
        intentGuard: new IntentGuard(),
        intentMutex: new IntentMutex(),
        broadcaster,
        adminManager,
        sockets,
        sendSafe: vi.fn(),
        bindSocket: (rc, pid, s) => sockets.bind(rc, pid, s),
        scheduleBotTurn: vi.fn(),
        broadcastGameOver: vi.fn(),
      };

      await handleIntentMsg(deps, mockWs, {
        type: 'INTENT',
        playerId: 'HOST_ALICE',
        roomCode: room.roomCode,
        intent: { type: 'INTENT_ROLL' },
      });

      const logs = adminManager.getRecentLogs(room.roomCode);
      const rollLog = logs.find((l) => l.action === 'INTENT_ROLL' || l.payloadSummary.includes('INTENT_ROLL'));

      expect(rollLog).toBeDefined();
      expect(rollLog?.payloadSummary).toMatch(/xúc xắc|xí ngầu|đổ/i);
      expect(rollLog?.payloadSummary).toMatch(/ô|bđs|vị trí/i);
      expect(rollLog?.payloadSummary).toMatch(/số dư|dư:/i);
    });

    it('[TC-IMP166.15/MSS][UC-GAME-ADM] Kính lúp lọc log theo playerId chỉ trả về các hành động của đúng người chơi được chọn', () => {
      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      const rc = room.roomCode;

      const record = (adminManager as unknown as {
        recordRoomEvent: (r: string, e: { source: string; action: string; payloadSummary: string; playerId?: string }) => void;
      }).recordRoomEvent.bind(adminManager);

      record(rc, { source: 'PLAYER', action: 'BUY_PROPERTY', payloadSummary: 'Alice mua ô 1', playerId: 'PLAYER_ALICE' });
      record(rc, { source: 'PLAYER', action: 'BUY_PROPERTY', payloadSummary: 'Bob mua ô 3', playerId: 'PLAYER_BOB' });
      record(rc, { source: 'SYSTEM', action: 'WATCHDOG', payloadSummary: 'Watchdog kiểm tra' });

      const getter = (adminManager as unknown as {
        getRecentLogs?: (r: string, pid?: string) => ExtendedAdminRoomLogEntry[];
      }).getRecentLogs;
      const aliceLogs = getter?.call(adminManager, rc, 'PLAYER_ALICE') ?? [];

      expect(aliceLogs.length).toBe(1);
      expect(aliceLogs[0]?.playerId).toBe('PLAYER_ALICE');
      expect(aliceLogs[0]?.action).toBe('BUY_PROPERTY');
    });
  });
});
