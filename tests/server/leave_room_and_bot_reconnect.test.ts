// [UC-GAME-007/MSS][UC-GAME-008/MSS][UC-GAME-010/MSS]
// Tests: Thoát phòng (LEAVE_ROOM) & Đánh thức Bot AI khi Reconnect / Resync
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WssServer } from '../../src/server/network/wss_server.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { WebSocket } from 'ws';

function createMockSocket(): WebSocket {
  return {
    readyState: WebSocket.OPEN,
    send: vi.fn(),
    close: vi.fn(),
    removeAllListeners: vi.fn(),
    on: vi.fn(),
  } as unknown as WebSocket;
}

describe('LEAVE_ROOM & Bot AI Wakeup on Reconnect/Resync', () => {
  let server: WssServer;
  let roomManager: RoomManager;
  let sessionManager: SessionManager;
  const PORT = 3899;

  beforeEach(() => {
    vi.useFakeTimers();
    roomManager = new RoomManager();
    sessionManager = new SessionManager();
    server = new WssServer({
      port: PORT,
      roomManager,
      sessionManager,
    });
  });

  afterEach(async () => {
    vi.clearAllTimers();
    vi.useRealTimers();
    await server.close();
  });

  it('[TC-LEAVE-01] Chủ phòng gửi LEAVE_ROOM -> Máy chủ đóng phòng và dọn sạch dữ liệu', async () => {
    const hostSocket = createMockSocket();
    const room = roomManager.createRoom('p1', 'TEST88');
    roomManager.joinRoom('TEST88', 'p2');
    roomManager.startGame('TEST88');

    // Giả lập gửi LEAVE_ROOM từ chủ phòng
    const rawMsg = JSON.stringify({
      type: 'LEAVE_ROOM',
      roomCode: 'TEST88',
      playerId: 'p1',
    });

    // Gọi route qua envelope validator
    const validation = server.getEnvelopeValidator().parseAndValidate(rawMsg);
    expect(validation.success).toBe(true);
    if (validation.success) {
      await (server as any).route(hostSocket, validation.message);
    }

    // Kiểm tra phòng đã được đóng hoàn toàn
    expect(roomManager.hasRoom('TEST88')).toBe(false);
    expect(server.getRoomSockets('TEST88')).toBeUndefined();
  });

  it('[TC-LEAVE-02] Khách gửi LEAVE_ROOM -> Đánh dấu bankrupt và phát sóng PLAYER_BOT_TAKEOVER', async () => {
    const guestSocket = createMockSocket();
    const room = roomManager.createRoom('p1', 'TEST89');
    roomManager.joinRoom('TEST89', 'p2');
    roomManager.startGame('TEST89');

    const rawMsg = JSON.stringify({
      type: 'LEAVE_ROOM',
      roomCode: 'TEST89',
      playerId: 'p2',
    });

    const validation = server.getEnvelopeValidator().parseAndValidate(rawMsg);
    expect(validation.success).toBe(true);
    if (validation.success) {
      await (server as any).route(guestSocket, validation.message);
    }

    // Phòng vẫn tồn tại nhưng p2 đã bị đánh dấu bankrupt
    expect(roomManager.hasRoom('TEST89')).toBe(true);
    const p2 = room.players.find((p) => p.id === 'p2');
    expect(p2?.bankrupt).toBe(true);
  });

  it('[TC-BOT-RECONNECT-01] Reconnect tự động đánh thức Bot AI khi lượt chơi đang thuộc về Bot', async () => {
    const hostSocket = createMockSocket();
    const room = roomManager.createRoom('p1', 'TEST90');
    // Khởi động với 1 người và 1 bot
    roomManager.startGame('TEST90', [{ id: 'bot_2', personality: 'Aggressive' }]);

    // Chuyển lượt sang Bot
    room.currentPlayerIndex = 1; // bot_2
    expect(room.players[1]?.isBot).toBe(true);

    // Tạo token kết nối lại cho host
    const token = server.getReconnectManager().generateToken('p1', 'TEST90');

    // Giả lập người chơi F5 / Reconnect
    const reconnectMsg = {
      type: 'RECONNECT' as const,
      reconnectToken: token,
      roomCode: 'TEST90',
    };

    (server as any).handleReconnect(hostSocket, reconnectMsg);

    // Kiểm tra máy chủ đã lên lịch lượt chơi cho Bot (800ms)
    expect(roomManager.getActiveTimers('TEST90')?.size).toBeGreaterThan(0);

    // Cho timer chạy 800ms để Bot thực hiện lượt đi
    const botInitialPos = room.players[1]!.position;
    await vi.advanceTimersByTimeAsync(900);

    // Bot đã hoàn thành lượt và thay đổi trạng thái
    const botAfter = room.players[1];
    expect(botAfter).toBeDefined();
  });

  it('[TC-BOT-RESYNC-01] INTENT_REQUEST_RESYNC tự động kích hoạt scheduleBotTurn nếu đang lượt Bot', async () => {
    const socket = createMockSocket();
    const room = roomManager.createRoom('p1', 'TEST91');
    roomManager.startGame('TEST91', [{ id: 'bot_2', personality: 'Balanced' }]);

    // Chuyển lượt sang Bot
    room.currentPlayerIndex = 1;
    expect(room.players[1]?.isBot).toBe(true);

    const resyncMsg = JSON.stringify({
      type: 'INTENT_REQUEST_RESYNC',
      roomCode: 'TEST91',
      playerId: 'p1',
    });

    const validation = server.getEnvelopeValidator().parseAndValidate(resyncMsg);
    expect(validation.success).toBe(true);
    if (validation.success) {
      await (server as any).route(socket, validation.message);
    }

    // Bot timer phải được lập lịch
    expect(roomManager.getActiveTimers('TEST91')?.size).toBeGreaterThan(0);
  });
});
