// [TC-NET03.1/MSS][UC-GAME-009/MSS] Đo lường byteLength của JSON.stringify(deltaPayload) luôn < 10.240 bytes (10KB NFR)
// [TC-NET03.2/MSS][UC-GAME-009/MSS] Sparse diff chỉ chứa danh sách ô có biến động thực tế
// [TC-NET03.3/Adversarial][UC-GAME-009/A3] Gửi 2 intent đồng thời qua Promise.all, chứng minh Intent Mutex xử lý an toàn và bảo toàn tổng tài sản ròng
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { RoomManager } from '../../src/server/room_manager.js';
import { SessionManager, type DeltaPayload, type CellDelta, type PlayerDelta } from '../../src/server/session_manager.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import {
  DeltaBroadcaster,
  buildSparseDelta,
  getPayloadByteLength,
  MAX_DELTA_BYTES,
} from '../../src/server/network/delta_broadcaster.js';
import { WssServer } from '../../src/server/network/wss_server.js';
import { applyDeltaToStore } from '../../src/client/network/use_game_ws.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { BOARD_SIZE, TurnPhase } from '../../src/domain/room.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3101;
let server: WssServer;

beforeAll(() => {
  server = new WssServer({ port: TEST_PORT });
});

afterAll(async () => {
  await server.close();
});

function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}

function collectMessages(socket: WebSocket, count: number, timeoutMs = 3000): Promise<WsServerMessage[]> {
  return new Promise((resolve, reject) => {
    const msgs: WsServerMessage[] = [];
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: nhận được ${msgs.length}/${count} messages`));
    }, timeoutMs);

    const onMsg = (data: Buffer | string): void => {
      msgs.push(JSON.parse(data.toString()) as WsServerMessage);
      if (msgs.length === count) {
        clearTimeout(timer);
        socket.off('message', onMsg);
        resolve(msgs);
      }
    };
    socket.on('message', onMsg);
  });
}

describe('[Slice NET-03] Đồng Bộ Delta Payload (< 10KB) & Khóa Tuần Tự (Intent Mutex)', () => {

  // =========================================================================
  // TC-NET03.1: Đo lường byteLength của JSON.stringify(deltaPayload) luôn < 10.240 bytes (10KB NFR)
  // =========================================================================
  describe('TC-NET03.1: NFR Payload Size (< 10KB)', () => {
    it('[TC-NET03.1/MSS] Delta payload của bàn cờ cực đại (40 ô full cấp 3, thế chấp, 6 người chơi) < 10.240 bytes', () => {
      const maxCells: CellDelta[] = [];
      for (let i = 0; i < BOARD_SIZE; i++) {
        maxCells.push({
          index: i,
          ownerId: `player-${(i % 6) + 1}`,
          level: 3,
          isETC: i % 5 === 0,
          isMortgaged: i % 7 === 0,
          unbuiltRounds: 5,
        });
      }

      const maxPlayers: PlayerDelta[] = [];
      for (let p = 1; p <= 6; p++) {
        maxPlayers.push({
          id: `player-${p}`,
          position: (p * 6) % BOARD_SIZE,
          balance: 25000,
          bankrupt: false,
          isBot: p > 2,
          overdraftRoundsLeft: 2,
        });
      }

      const heavyPayload: DeltaPayload = {
        tick: 9999,
        cells: maxCells,
        players: maxPlayers,
      };

      const json = JSON.stringify(heavyPayload);
      const byteLength = new TextEncoder().encode(json).byteLength;

      // NFR: luôn nhỏ hơn 10.240 bytes (10KB)
      expect(byteLength).toBeLessThan(MAX_DELTA_BYTES);
      expect(byteLength).toBeLessThan(5_000); // Thực tế chỉ ~3KB
      expect(getPayloadByteLength(heavyPayload)).toBe(byteLength);
    });

    it('[TC-NET03.1/MSS] Delta payload tạo từ RoomManager thực tế luôn đạt tiêu chuẩn < 10KB', () => {
      const roomMgr = new RoomManager(12345);
      const sessionMgr = new SessionManager();
      const broadcaster = new DeltaBroadcaster(roomMgr, sessionMgr);

      const room = roomMgr.createRoom('p1');
      roomMgr.joinRoom(room.roomCode, 'p2');
      roomMgr.joinRoom(room.roomCode, 'p3');
      roomMgr.startGame(room.roomCode);

      const result = broadcaster.broadcastRoomDelta(room.roomCode, { forceFull: true });
      expect(result).toBeDefined();
      if (!result) throw new Error('Result missing');

      expect(result.byteLength).toBeLessThan(MAX_DELTA_BYTES);
      expect(result.isSparse).toBe(false);
      expect(result.delta.cells.length).toBe(BOARD_SIZE);
    });
  });

  // =========================================================================
  // TC-NET03.2: Sparse diff chỉ chứa danh sách ô có biến động thực tế
  // =========================================================================
  describe('TC-NET03.2: Sparse Diff Synchronization', () => {
    it('[TC-NET03.2/MSS] Sparse diff chỉ gửi ô có thay đổi và có cells.length < BOARD_SIZE', () => {
      const prevCells: CellDelta[] = Array.from({ length: BOARD_SIZE }, (_, i) => ({
        index: i,
        ownerId: null,
        level: 0,
      }));
      const prevPlayers: PlayerDelta[] = [
        { id: 'p1', position: 0, balance: 15000 },
        { id: 'p2', position: 0, balance: 15000 },
      ];
      const prevDelta: DeltaPayload = { tick: 1, cells: prevCells, players: prevPlayers };

      // Next state: Chỉ ô số 3 đổi chủ sang p1, p1 trừ 600 tiền và đi tới ô 3
      const nextCells: CellDelta[] = prevCells.map((c) =>
        c.index === 3 ? { ...c, ownerId: 'p1', level: 0 } : c,
      );
      const nextPlayers: PlayerDelta[] = [
        { id: 'p1', position: 3, balance: 14400 },
        { id: 'p2', position: 0, balance: 15000 },
      ];
      const nextDelta: DeltaPayload = { tick: 2, cells: nextCells, players: nextPlayers };

      const sparsePayload = buildSparseDelta(prevDelta, nextDelta);

      // Chỉ có 1 ô thay đổi
      expect(sparsePayload.cells.length).toBe(1);
      expect(sparsePayload.cells[0]?.index).toBe(3);
      expect(sparsePayload.cells[0]?.ownerId).toBe('p1');
      expect(sparsePayload.cells.length).toBeLessThan(BOARD_SIZE);

      // Chỉ có player 1 thay đổi (position & balance)
      expect(sparsePayload.players?.length).toBe(1);
      expect(sparsePayload.players?.[0]?.id).toBe('p1');
      expect(sparsePayload.players?.[0]?.balance).toBe(14400);

      // Kích thước sparse diff siêu nhẹ (< 500 bytes)
      const sparseBytes = getPayloadByteLength(sparsePayload);
      expect(sparseBytes).toBeLessThan(500);
    });

    it('[TC-NET03.2/MSS] Không có ô nào đổi thì cells rỗng và kích thước < 200 bytes', () => {
      const prevCells: CellDelta[] = [{ index: 1, ownerId: 'p1', level: 1 }];
      const prevPlayers: PlayerDelta[] = [{ id: 'p1', position: 5, balance: 10000 }];
      const prevDelta: DeltaPayload = { tick: 5, cells: prevCells, players: prevPlayers };

      // Next state: Chỉ người chơi di chuyển, không có BĐS nào biến động
      const nextPlayers: PlayerDelta[] = [{ id: 'p1', position: 7, balance: 10000 }];
      const nextDelta: DeltaPayload = { tick: 6, cells: prevCells, players: nextPlayers };

      const sparsePayload = buildSparseDelta(prevDelta, nextDelta);
      expect(sparsePayload.cells).toHaveLength(0);
      expect(sparsePayload.players).toHaveLength(1);
      expect(getPayloadByteLength(sparsePayload)).toBeLessThan(200);
    });
  });

  // =========================================================================
  // TC-NET03.3 (Adversarial): Gửi 2 intent đồng thời qua Promise.all,
  // chứng minh Intent Mutex xử lý an toàn và bảo toàn tổng tài sản ròng
  // =========================================================================
  describe('TC-NET03.3: Intent Mutex & Invariant Bảo Toàn Tiền Tệ', () => {
    it('[TC-NET03.3/Adversarial] [UC-GAME-009/A3] 2 intent đồng thời qua Promise.all xử lý tuần tự và bảo toàn tổng số dư', async () => {
      const mutex = new IntentMutex();
      const roomMgr = new RoomManager(999);
      const room = roomMgr.createRoom('p1');
      roomMgr.joinRoom(room.roomCode, 'p2');
      roomMgr.startGame(room.roomCode);

      // Cấp quyền sở hữu ô 1 (Ba Đình, giá 600) cho p1
      room.players[0]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      const buyRes = roomMgr.handlePlayerIntent(room.roomCode, 'p1', {
        type: 'INTENT_BUY',
      });
      expect(buyRes.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);

      const totalBefore = room.players.reduce((sum, p) => sum + p.balance, 0);

      // Tạo 2 intent P2P Trade đồng thời qua Promise.all:
      // Intent 1: P1 bán ô 1 cho P2 với giá 1000 (P2 trả 1000, thuế 5% = 50 vào kho bạc, P1 nhận 950)
      // Intent 2: P1 lại cố bán tiếp ô 1 cho P2 lần nữa (phải bị từ chối vì ô 1 đã thuộc P2!)
      const intent1 = mutex.runExclusive(room.roomCode, async () => {
        // Cho delay nhỏ giả lập bất đồng bộ I/O
        await new Promise((r) => setTimeout(r, 10));
        return roomMgr.handlePlayerIntent(room.roomCode, 'p1', {
          type: 'INTENT_TRADE_OFFER',
          sellerId: 'p1',
          buyerId: 'p2',
          cellIndex: 1,
          price: 1000,
        });
      });

      const intent2 = mutex.runExclusive(room.roomCode, async () => {
        await new Promise((r) => setTimeout(r, 5));
        return roomMgr.handlePlayerIntent(room.roomCode, 'p1', {
          type: 'INTENT_TRADE_OFFER',
          sellerId: 'p1',
          buyerId: 'p2',
          cellIndex: 1,
          price: 1000,
        });
      });

      const [res1, res2] = await Promise.all([intent1, intent2]);

      // Một trong hai phải thành công, cái còn lại PHẢI thất bại vì P1 không còn là chủ ô 1
      const successes = [res1.success, res2.success].filter(Boolean);
      expect(successes).toHaveLength(1);

      // Kiểm tra bất biến tài chính toàn hệ thống:
      // Tiền mặt người chơi + Kho bạc = Tổng ban đầu
      const totalCashNow = room.players.reduce((sum, p) => sum + p.balance, 0);
      const totalSystemMoney = totalCashNow + room.treasury;
      expect(totalSystemMoney).toBe(totalBefore);
    });

    it('[TC-NET03.3/Adversarial] Hàng đợi Mutex duy trì thứ tự FIFO nghiêm ngặt và không deadlock khi task lỗi', async () => {
      const mutex = new IntentMutex();
      const executionOrder: number[] = [];

      const p1 = mutex.runExclusive(async () => {
        await new Promise((r) => setTimeout(r, 20));
        executionOrder.push(1);
        return 'res1';
      });

      const p2 = mutex.runExclusive(async () => {
        await new Promise((r) => setTimeout(r, 5));
        executionOrder.push(2);
        throw new Error('Task 2 intentional failure');
      });

      const p3 = mutex.runExclusive(async () => {
        executionOrder.push(3);
        return 'res3';
      });

      const r1 = await p1;
      await expect(p2).rejects.toThrow('Task 2 intentional failure');
      const r3 = await p3;

      expect(r1).toBe('res1');
      expect(r3).toBe('res3');
      // Thứ tự thực thi bắt buộc là 1 -> 2 -> 3 dù thời gian sleep khác nhau
      expect(executionOrder).toEqual([1, 2, 3]);
      expect(mutex.isBusy()).toBe(false);
    });
  });

  // =========================================================================
  // Kiểm thử tích hợp Client Hook & Zustand Store State Reconciliation
  // =========================================================================
  describe('Client State Reconciliation & Live WSS Protocol', () => {
    it('applyDeltaToStore cập nhật chính xác levelMap, playerPositions và playersInfo', () => {
      const store = useGameStore;
      store.getState().setPlayersInfo({
        p1: { id: 'p1', name: 'Player 1', balance: 15000, tokenColor: '#fff', ownedProperties: [] },
        p2: { id: 'p2', name: 'Player 2', balance: 15000, tokenColor: '#f00', ownedProperties: [] },
      });
      store.getState().setPlayerPositions({ p1: 0, p2: 0 });
      store.getState().setLevelMap({});

      const delta: DeltaPayload = {
        tick: 1,
        cells: [
          { index: 5, ownerId: 'p1', level: 2, isMortgaged: true },
        ],
        players: [
          { id: 'p1', position: 5, balance: 12000 },
          { id: 'p2', position: 10, balance: 14500, bankrupt: false },
        ],
      };

      applyDeltaToStore(delta, store);

      const state = store.getState();
      expect(state.levelMap[5]).toBe(2);
      expect(state.playerPositions['p1']).toBe(5);
      expect(state.playerPositions['p2']).toBe(10);
      expect(state.playersInfo['p1']?.balance).toBe(12000);
      expect(state.playersInfo['p1']?.ownedProperties).toContain(5);
      expect(state.playersInfo['p1']?.mortgagedProperties).toContain(5);
    });

    it('Gửi INTENT qua WebSocket thật và nhận STATE_DELTA đồng bộ', async () => {
      const ws = await openSocket();

      // 1. Tạo phòng
      const createPending = collectMessages(ws, 2);
      ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-sync' }));
      const [createdMsg] = await createPending;
      if (createdMsg?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const roomCode = createdMsg.roomCode;

      // 2. Yêu cầu Resync -> nhận STATE_DELTA ban đầu
      const resyncPending = collectMessages(ws, 1);
      ws.send(JSON.stringify({ type: 'INTENT_REQUEST_RESYNC', roomCode, playerId: 'host-sync' }));
      const [resyncMsg] = await resyncPending;

      expect(resyncMsg?.type).toBe('STATE_DELTA');
      if (resyncMsg?.type === 'STATE_DELTA') {
        expect(resyncMsg.delta.cells.length).toBe(BOARD_SIZE);
        expect(getPayloadByteLength(resyncMsg.delta)).toBeLessThan(MAX_DELTA_BYTES);
      }

      ws.close();
    });

    it('giải chấp bất động sản: buildSparseDelta phát isMortgaged: false và applyDeltaToStore xóa khỏi mortgagedProperties', () => {
      const store = useGameStore;
      store.getState().setPlayersInfo({
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 15000,
          tokenColor: '#fff',
          ownedProperties: [5],
          mortgagedProperties: [5],
        },
      });

      const prevDelta: DeltaPayload = {
        tick: 1,
        cells: [{ index: 5, ownerId: 'p1', level: 0, isMortgaged: true }],
      };
      const nextDelta: DeltaPayload = {
        tick: 2,
        cells: [{ index: 5, ownerId: 'p1', level: 0 }],
      };

      const sparseDelta = buildSparseDelta(prevDelta, nextDelta);
      expect(sparseDelta.cells[0]?.isMortgaged).toBe(false);

      applyDeltaToStore(sparseDelta, store);
      expect(store.getState().playersInfo['p1']?.mortgagedProperties).not.toContain(5);
    });

    it('chuyển nhượng bất động sản: gỡ bỏ khỏi ownedProperties và mortgagedProperties của chủ cũ', () => {
      const store = useGameStore;
      store.getState().setPlayersInfo({
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 15000,
          tokenColor: '#fff',
          ownedProperties: [7],
          mortgagedProperties: [7],
        },
        p2: {
          id: 'p2',
          name: 'Player 2',
          balance: 15000,
          tokenColor: '#f00',
          ownedProperties: [],
          mortgagedProperties: [],
        },
      });

      const delta: DeltaPayload = {
        tick: 3,
        cells: [{ index: 7, ownerId: 'p2', level: 0 }],
      };

      applyDeltaToStore(delta, store);
      const p1 = store.getState().playersInfo['p1']!;
      const p2 = store.getState().playersInfo['p2']!;
      expect(p1.ownedProperties).not.toContain(7);
      expect(p1.mortgagedProperties).not.toContain(7);
      expect(p2.ownedProperties).toContain(7);
    });

    it('[TC-NET03.3/Adversarial] gửi payload null hoặc intent thiếu trường không làm crash server', async () => {
      const ws = await openSocket();

      // Gửi null thô: server bỏ qua an toàn, không ném ngoại lệ
      ws.send('null');
      await new Promise((r) => setTimeout(r, 20));

      // Gửi INTENT thiếu intent payload: server phản hồi ERROR INVALID_INTENT
      const errPending = collectMessages(ws, 1);
      ws.send(JSON.stringify({ type: 'INTENT', roomCode: 'ROOM_FAKE' }));
      const [errMsg] = await errPending;
      expect(errMsg?.type).toBe('ERROR');
      if (errMsg?.type === 'ERROR') {
        expect(errMsg.reasonCode).toBe('INVALID_INTENT');
      }

      // Kiểm tra server vẫn sống và xử lý lệnh bình thường
      const createPending = collectMessages(ws, 2);
      ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'alive-test' }));
      const [res] = await createPending;
      expect(res?.type).toBe('ROOM_CREATED');

      ws.close();
    });

    it('socket gửi INTENT_REQUEST_RESYNC tự động được đăng ký nhận các broadcast STATE_DELTA tiếp theo', async () => {
      const wsHost = await openSocket();
      const wsGuest = await openSocket();

      // Host tạo phòng và bắt đầu game
      const hostInit = collectMessages(wsHost, 2);
      wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'p-host' }));
      const [created] = await hostInit;
      if (created?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const roomCode = created.roomCode;

      // Server room manager khởi động game
      const roomMgr = server.getRoomManager();
      roomMgr.joinRoom(roomCode, 'p-guest');
      roomMgr.startGame(roomCode);

      // Guest chỉ gửi INTENT_REQUEST_RESYNC (giả lập kết nối lại / resync)
      const guestResync = collectMessages(wsGuest, 1);
      wsGuest.send(JSON.stringify({ type: 'INTENT_REQUEST_RESYNC', roomCode, playerId: 'p-guest' }));
      const [resyncMsg] = await guestResync;
      expect(resyncMsg?.type).toBe('STATE_DELTA');

      // Giờ host gửi INTENT_ROLL: guest PHẢI nhận được broadcast STATE_DELTA tiếp theo
      const guestBroadcast = collectMessages(wsGuest, 1);
      wsHost.send(JSON.stringify({
        type: 'INTENT',
        roomCode,
        playerId: 'p-host',
        intent: { type: 'INTENT_ROLL' },
      }));

      const [deltaMsg] = await guestBroadcast;
      expect(deltaMsg?.type).toBe('STATE_DELTA');

      wsHost.close();
      wsGuest.close();
    });

    it('socket đóng kết nối tự động giải phóng khỏi roomSockets, không rò rỉ bộ nhớ', async () => {
      const ws = await openSocket();
      const createPending = collectMessages(ws, 2);
      ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'cleanup-test' }));
      const [created] = await createPending;
      if (created?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const roomCode = created.roomCode;

      // Socket đã được đăng ký trong roomSockets
      const roomSockets = (server as unknown as { roomSockets: Map<string, Set<WebSocket>> }).roomSockets;
      expect(roomSockets.get(roomCode)?.size).toBe(1);

      // Đóng socket và đợi sự kiện close được kích hoạt
      ws.close();
      await new Promise((r) => setTimeout(r, 50));

      // Không còn socket nào rò rỉ trong roomSockets
      expect(roomSockets.get(roomCode)).toBeUndefined();
    });
  });
});
