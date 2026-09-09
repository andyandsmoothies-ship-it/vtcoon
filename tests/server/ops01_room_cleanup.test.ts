// [UC-GAME-010/MSS][TD-NET-005] OPS-01 Room Cleanup & Game Over Test Suite
// TC-OPS01.2: closeRoom() dọn sạch 100% listeners, timers và xóa khỏi RoomMap.
// TC-OPS01.3: GAME_OVER broadcast đúng cấu trúc leaderboard.
// TC-OPS01.4: Tự động dọn phòng bỏ hoang sau 10 phút (fake timers).

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { RoomManager } from '../../src/server/room_manager.js';
import { WssServer } from '../../src/server/network/wss_server.js';
import { RoomCleanupScheduler } from '../../src/server/room_cleanup_scheduler.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3105;
let server: WssServer;

beforeAll(() => {
  server = new WssServer({ port: TEST_PORT, gracePeriodMs: 500 });
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

function waitForMessageType(socket: WebSocket, type: string, timeoutMs = 3000): Promise<WsServerMessage> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout: không nhận được message ${type}`)), timeoutMs);
    const onMsg = (data: Buffer | string): void => {
      const parsed = JSON.parse(data.toString()) as WsServerMessage;
      if (parsed.type === type) {
        clearTimeout(timer);
        socket.off('message', onMsg);
        resolve(parsed);
      }
    };
    socket.on('message', onMsg);
  });
}

describe('[Slice OPS-01] Room Cleanup & Game Over Lifecycle', () => {

  // =========================================================================
  // TC-OPS01.2: closeRoom() dọn sạch 100% listeners, timers và xóa khỏi RoomMap
  // =========================================================================
  it('[TC-OPS01.2/MSS] closeRoom() giai phong hoan toan RoomMap, activeTimers va socket listeners', async () => {
    const rm = new RoomManager(42);
    const room = rm.createRoom('p1');
    const timer = setTimeout(() => {}, 10_000);
    rm.registerTimer(room.roomCode, timer);

    expect(rm.getActiveTimers(room.roomCode)?.size).toBe(1);
    expect(rm.roomMap.has(room.roomCode)).toBe(true);

    const closed = rm.closeRoom(room.roomCode);
    expect(closed).toBe(true);
    expect(rm.activeTimers.get(room.roomCode)).toBeUndefined();
    expect(rm.roomMap.has(room.roomCode)).toBe(false);

    // Kiểm tra dọn sạch socket listeners trên WssServer
    const ws = await openSocket();
    ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host1' }));
    const created = await waitForMessageType(ws, 'ROOM_CREATED') as Extract<WsServerMessage, { type: 'ROOM_CREATED' }>;
    const rc = created.roomCode;

    expect(server.getRoomSockets(rc)?.size).toBe(1);
    const srvSockets = Array.from(server.getRoomSockets(rc) ?? []);
    const srvSocket = srvSockets[0];

    server.closeRoom(rc);
    expect(server.getRoomSockets(rc)).toBeUndefined();
    expect(server.getRoomManager().hasRoom(rc)).toBe(false);
    if (srvSocket) {
      expect(srvSocket.listenerCount('message')).toBe(0);
      expect(srvSocket.listenerCount('close')).toBe(0);
    }
    ws.close();

    // Xác minh hook onCloseRoom: gọi closeRoom trực tiếp từ roomManager cũng tự động dọn sockets
    const wsHook = await openSocket();
    wsHook.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host_hook' }));
    const createdHook = (await waitForMessageType(wsHook, 'ROOM_CREATED')) as Extract<WsServerMessage, { type: 'ROOM_CREATED' }>;
    const rcHook = createdHook.roomCode;
    expect(server.getRoomSockets(rcHook)?.size).toBe(1);

    server.getRoomManager().closeRoom(rcHook);
    expect(server.getRoomSockets(rcHook)).toBeUndefined();
    expect(server.getRoomManager().hasRoom(rcHook)).toBe(false);
    wsHook.close();
  });

  // =========================================================================
  // TC-OPS01.3: GAME_OVER broadcast đúng cấu trúc leaderboard
  // =========================================================================
  it('[TC-OPS01.3/MSS] GAME_OVER broadcast dung cau truc leaderboard va netWorth giam dan', async () => {
    const ws1 = await openSocket();
    const ws2 = await openSocket();

    ws1.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'p1' }));
    const created = await waitForMessageType(ws1, 'ROOM_CREATED') as Extract<WsServerMessage, { type: 'ROOM_CREATED' }>;
    const rc = created.roomCode;

    ws2.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'p2', roomCode: rc }));
    await waitForMessageType(ws2, 'ROOM_JOINED');

    const room = server.getRoomManager().getRoom(rc);
    expect(room).toBeDefined();

    const gameOverPromise1 = waitForMessageType(ws1, 'GAME_OVER');
    const gameOverPromise2 = waitForMessageType(ws2, 'GAME_OVER');

    server.broadcastGameOver(rc);

    const msg1 = await gameOverPromise1 as Extract<WsServerMessage, { type: 'GAME_OVER' }>;
    const msg2 = await gameOverPromise2 as Extract<WsServerMessage, { type: 'GAME_OVER' }>;

    for (const msg of [msg1, msg2]) {
      expect(msg.type).toBe('GAME_OVER');
      expect(msg.roomCode).toBe(rc);
      expect(msg.leaderboard).toHaveLength(2);
      expect(msg.leaderboard[0]!.netWorth).toBeGreaterThan(0);
      expect(msg.leaderboard[0]!.netWorth).toBeGreaterThanOrEqual(msg.leaderboard[1]!.netWorth);
    }

    // Đảm bảo broadcastGameOver tự động gọi closeRoom()
    expect(server.getRoomSockets(rc)).toBeUndefined();
    expect(server.getRoomManager().hasRoom(rc)).toBe(false);

    ws1.close();
    ws2.close();
  });

  // =========================================================================
  // TC-OPS01.4: Tự động dọn phòng bỏ hoang sau 10 phút (fake timers)
  // =========================================================================
  it('[TC-OPS01.4/MSS] Tu dong don phong bo hoang sau 10 phut idle (fake timers)', () => {
    vi.useFakeTimers();
    try {
      const rm = new RoomManager(42);
      const scheduler = new RoomCleanupScheduler({
        roomManager: rm,
        timeoutMs: 10 * 60 * 1000,
        intervalMs: 60 * 1000,
      });
      scheduler.start();

      const abandoned = rm.createRoom('p_idle');
      const active = rm.createRoom('p_active');
      const abandonedCode = abandoned.roomCode;
      const activeCode = active.roomCode;

      expect(rm.roomMap.has(abandonedCode)).toBe(true);
      expect(rm.roomMap.has(activeCode)).toBe(true);

      // 5 phút sau: phòng active có hoạt động
      vi.advanceTimersByTime(5 * 60 * 1000);
      rm.touchActivity(activeCode);

      // Thêm 5 phút (tổng 10 phút kể từ đầu): phòng abandoned chạm ngưỡng 10 phút
      vi.advanceTimersByTime(5 * 60 * 1000);

      expect(rm.roomMap.has(abandonedCode)).toBe(false);
      expect(rm.roomMap.has(activeCode)).toBe(true);

      // Thêm 5 phút nữa: phòng active cũng quá 10 phút kể từ lần touch
      vi.advanceTimersByTime(5 * 60 * 1000);
      expect(rm.roomMap.has(activeCode)).toBe(false);

      scheduler.stop();
    } finally {
      vi.useRealTimers();
    }
  });

  // =========================================================================
  // TC-OPS01.3b: Intent phá sản tự động kích hoạt GAME_OVER và dọn sạch phòng
  // =========================================================================
  it('[TC-OPS01.3b/MSS] INTENT_BANKRUPTCY tu dong kich hoat GAME_OVER broadcast va giai phong phong', async () => {
    const ws1 = await openSocket();
    const ws2 = await openSocket();

    ws1.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host_bk' }));
    const created = (await waitForMessageType(ws1, 'ROOM_CREATED')) as Extract<WsServerMessage, { type: 'ROOM_CREATED' }>;
    const rc = created.roomCode;

    ws2.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest_bk', roomCode: rc }));
    await waitForMessageType(ws2, 'ROOM_JOINED');

    server.getRoomManager().startGame(rc);

    const gameOverPromise1 = waitForMessageType(ws1, 'GAME_OVER');
    const gameOverPromise2 = waitForMessageType(ws2, 'GAME_OVER');

    ws2.send(JSON.stringify({
      type: 'INTENT',
      roomCode: rc,
      playerId: 'guest_bk',
      intent: { type: 'INTENT_BANKRUPTCY' },
    }));

    const msg1 = (await gameOverPromise1) as Extract<WsServerMessage, { type: 'GAME_OVER' }>;
    const msg2 = (await gameOverPromise2) as Extract<WsServerMessage, { type: 'GAME_OVER' }>;

    expect(msg1.type).toBe('GAME_OVER');
    expect(msg2.type).toBe('GAME_OVER');
    expect(msg1.leaderboard[0]!.id).toBe('host_bk');
    expect(server.getRoomSockets(rc)).toBeUndefined();
    expect(server.getRoomManager().hasRoom(rc)).toBe(false);

    ws1.close();
    ws2.close();
  });
});
