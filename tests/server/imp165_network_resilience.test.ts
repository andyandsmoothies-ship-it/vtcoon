// [TC-IMP165-NET/MSS][UC-GAME-006/MSS][UC-GAME-007/MSS][UC-GAME-008/MSS]
// Network Resilience & Disconnection Invariants Test Suite (IMP-165)
// Case 1 (F5 sảnh chờ): Khách ngắt socket trước trận → Server broadcast LOBBY_UPDATE, KHÔNG Bot Takeover (Gotcha #225).
// Case 2 (Rớt mạng trong trận & Reconnect): Đang lượt p2 rớt mạng → PLAYER_GRACE → RECONNECT trong hạn → Full Snapshot & đổ xúc xắc tiếp.
// Case 3 (Rớt mạng > 60s -> Bot Takeover): p3 rớt mạng quá hạn → isBot = true, broadcast PLAYER_BOT_TAKEOVER, AI Bot tự động đánh thay.

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import { SessionState } from '../../src/server/session_manager.js';
import { BOARD_SIZE, TurnPhase } from '../../src/domain/room.js';
import type { WsServerMessage, WsClientMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3167;
let server: WssServer;
const activeSockets: WebSocket[] = [];

beforeAll(() => {
  server = new WssServer({
    port: TEST_PORT,
    botTurnDelayMs: 50,
    gracePeriodMs: 200, // 200ms mô phỏng 60 giây trong môi trường test tốc độ cao
  });
});

afterEach(() => {
  for (const s of activeSockets) {
    try {
      s.removeAllListeners();
      if (s.readyState === WebSocket.OPEN || s.readyState === WebSocket.CONNECTING) {
        s.close();
      }
    } catch {
      /* safe-ignore */
    }
  }
  activeSockets.length = 0;
});

afterAll(async () => {
  await server.close();
});

function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    activeSockets.push(ws);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}

function collectMessages(socket: WebSocket, count: number, timeoutMs = 4000): Promise<WsServerMessage[]> {
  return new Promise((resolve, reject) => {
    const msgs: WsServerMessage[] = [];
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: nhận được ${msgs.length}/${count} messages: ${JSON.stringify(msgs)}`));
    }, timeoutMs);

    const onMsg = (data: Buffer | string): void => {
      msgs.push(JSON.parse(data.toString()) as WsServerMessage);
      if (msgs.length >= count) {
        clearTimeout(timer);
        socket.off('message', onMsg);
        resolve(msgs);
      }
    };
    socket.on('message', onMsg);
  });
}

function waitForMessageType(socket: WebSocket, type: string, timeoutMs = 4000): Promise<WsServerMessage> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: không nhận được message type '${type}' sau ${timeoutMs}ms`));
    }, timeoutMs);

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

async function createRoomViaWs(ws: WebSocket, playerId: string): Promise<string> {
  const pending = collectMessages(ws, 2);
  ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerId }));
  const [created] = await pending;
  if (created?.type !== 'ROOM_CREATED') {
    throw new Error(`Expected ROOM_CREATED, got: ${created?.type}`);
  }
  return created.roomCode;
}

describe('[IMP-165] Network Resilience & Disconnection Invariants', () => {
  // =========================================================================
  // Case 1 (F5 sảnh chờ):
  // Khách p2 vào sảnh, nhận reconnectToken, sau đó ngắt socket (mô phỏng F5/đóng tab).
  // Assert: Server phát broadcast LOBBY_UPDATE xóa p2 khỏi sảnh, KHÔNG Bot Takeover (Gotcha #225).
  // =========================================================================
  it('[TC-NET-RES.1] Case 1: Khách F5 / đóng tab trong sảnh chờ → LOBBY_UPDATE dọn sạch slot, KHÔNG Bot Takeover', async () => {
    const wsHost = await openSocket();
    const roomCode = await createRoomViaWs(wsHost, 'host-c1');

    const wsGuest = await openSocket();
    const guestInitPending = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode, playerId: 'p2' }));
    const [joinReply, sessionInit] = await guestInitPending;

    expect(joinReply?.type).toBe('ROOM_JOINED');
    expect(sessionInit?.type).toBe('SESSION_INIT');
    if (sessionInit?.type === 'SESSION_INIT') {
      expect(sessionInit.reconnectToken).toBeDefined();
    }

    // Đảm bảo sảnh hiện tại có 2 người (host + p2)
    const roomBefore = server.getRoomManager().getRoom(roomCode);
    expect(roomBefore?.players).toHaveLength(2);
    expect(roomBefore?.started).toBe(false);

    // Host đăng ký đón nhận LOBBY_UPDATE sau khi ân hạn hết
    const hostLobbyUpdatePromise = waitForMessageType(wsHost, 'LOBBY_UPDATE');

    // Khách p2 ngắt kết nối (mô phỏng đóng tab / F5 sảnh chờ)
    wsGuest.close();

    // Chờ server hết ân hạn 200ms và phát sóng LOBBY_UPDATE cập nhật
    const lobbyUpdate = await hostLobbyUpdatePromise;
    expect(lobbyUpdate.type).toBe('LOBBY_UPDATE');
    if (lobbyUpdate.type === 'LOBBY_UPDATE') {
      expect(lobbyUpdate.roomCode).toBe(roomCode);
      // Danh sách người chơi trong sảnh chỉ còn 1 người duy nhất (Host)
      expect(lobbyUpdate.players).toHaveLength(1);
      expect(lobbyUpdate.players[0]?.id).toBe('host-c1');
    }

    // Kiểm tra trạng thái phòng trên Server: p2 bị rút hoàn toàn, KHÔNG có Bot nào được tạo
    const roomAfter = server.getRoomManager().getRoom(roomCode);
    expect(roomAfter?.players).toHaveLength(1);
    expect(roomAfter?.players[0]?.id).toBe('host-c1');
    expect(roomAfter?.players.some((p) => p.isBot)).toBe(false);

    // Kiểm tra Session: session của khách bị đóng
    const guestSession = server.getSessionManager().getSession('p2');
    expect(guestSession?.state).toBe(SessionState.Disconnected);
  });

  // =========================================================================
  // Case 2 (Rớt mạng trong trận & Reconnect thành công):
  // Phòng đã START_GAME. Đến lượt p2, p2 bị rớt mạng đột ngột (close socket).
  // Assert: Server kích hoạt Grace Period 60 giây và gửi PLAYER_GRACE cho các người chơi còn lại.
  // Trong vòng 20 giây, p2 mở lại kết nối với tin nhắn RECONNECT kèm token cũ.
  // Assert: Server trả về PLAYER_RECONNECTED + STATE_DELTA full, p2 tiếp tục thực hiện lượt đổ xúc xắc bình thường.
  // =========================================================================
  it('[TC-NET-RES.2] Case 2: Rớt mạng trong lượt chơi → PLAYER_GRACE → RECONNECT thành công → Nhận Full Snapshot & Đổ xúc xắc', async () => {
    const wsHost = await openSocket();
    const roomCode = await createRoomViaWs(wsHost, 'host-c2');

    const wsGuest = await openSocket();
    const guestInitPending = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode, playerId: 'p2' }));
    const [, sessionInit] = await guestInitPending;
    if (sessionInit?.type !== 'SESSION_INIT') throw new Error('Expected SESSION_INIT');
    const reconnectToken = sessionInit.reconnectToken;

    // Bắt đầu trận đấu (START_GAME)
    const room = server.getRoomManager().startGame(roomCode);
    expect(room?.started).toBe(true);

    // Chuyển lượt sang p2 và thiết lập trạng thái WaitingRoll
    const p2Index = room!.players.findIndex((p) => p.id === 'p2');
    room!.currentPlayerIndex = p2Index;
    room!.phase = TurnPhase.WaitingRoll;
    expect(room?.players[room?.currentPlayerIndex]?.id).toBe('p2');

    // Host đăng ký chờ thông điệp PLAYER_GRACE
    const hostGracePromise = waitForMessageType(wsHost, 'PLAYER_GRACE');

    // p2 bị rớt mạng đột ngột giữa lượt chơi
    wsGuest.close();

    // 1. Assert: Server kích hoạt Grace Period và broadcast PLAYER_GRACE
    const graceMsg = await hostGracePromise;
    expect(graceMsg.type).toBe('PLAYER_GRACE');
    if (graceMsg.type === 'PLAYER_GRACE') {
      expect(graceMsg.playerId).toBe('p2');
      expect(graceMsg.secondsLeft).toBeGreaterThan(0);
    }
    const sessionDuringGrace = server.getSessionManager().getSession('p2');
    expect(sessionDuringGrace?.state).toBe(SessionState.GracePeriod);

    // 2. Trong thời gian ân hạn, p2 mở socket mới và gửi RECONNECT với token cũ
    const wsGuestReconnect = await openSocket();
    const hostReconnectedPromise = waitForMessageType(wsHost, 'PLAYER_RECONNECTED');
    const guestSnapshotPromise = waitForMessageType(wsGuestReconnect, 'STATE_DELTA');

    wsGuestReconnect.send(
      JSON.stringify({
        type: 'RECONNECT',
        reconnectToken,
        roomCode,
      })
    );

    const [reconnectedMsg, snapshotMsg] = await Promise.all([
      hostReconnectedPromise,
      guestSnapshotPromise,
    ]);

    // 3. Assert: Server xác nhận PLAYER_RECONNECTED và trả Full Snapshot 40 ô
    expect(reconnectedMsg.type).toBe('PLAYER_RECONNECTED');
    if (reconnectedMsg.type === 'PLAYER_RECONNECTED') {
      expect(reconnectedMsg.playerId).toBe('p2');
    }

    expect(snapshotMsg.type).toBe('STATE_DELTA');
    if (snapshotMsg.type === 'STATE_DELTA') {
      expect(snapshotMsg.delta.cells).toHaveLength(BOARD_SIZE);
      expect(snapshotMsg.delta.tick).toBeGreaterThan(0);
    }

    const sessionAfterReconnect = server.getSessionManager().getSession('p2');
    expect(sessionAfterReconnect?.state).toBe(SessionState.Connected);

    // 4. Assert: p2 tiếp tục thực hiện lượt đổ xúc xắc bình thường
    const rollDeltaPromise = waitForMessageType(wsGuestReconnect, 'STATE_DELTA');
    wsGuestReconnect.send(
      JSON.stringify({
        type: 'INTENT',
        roomCode,
        playerId: 'p2',
        intent: { type: 'INTENT_ROLL' },
      })
    );

    const rollDelta = await rollDeltaPromise;
    expect(rollDelta.type).toBe('STATE_DELTA');
    if (rollDelta.type === 'STATE_DELTA') {
      expect(rollDelta.delta.dice).toBeDefined();
      expect(rollDelta.delta.dice?.[0]).toBeGreaterThanOrEqual(1);
      expect(rollDelta.delta.dice?.[1]).toBeGreaterThanOrEqual(1);
    }

    wsGuestReconnect.close();
    wsHost.close();
  });

  // =========================================================================
  // Case 3 (Rớt mạng > 60 giây -> Bot Takeover):
  // p3 bị rớt mạng quá 60 giây trong trận đấu.
  // Assert: Server chuyển p3.isBot = true, gửi PLAYER_BOT_TAKEOVER cho cả phòng, và AI Bot tự động đánh thay các lượt tiếp theo của p3.
  // =========================================================================
  it('[TC-NET-RES.3] Case 3: Rớt mạng quá hạn 60s trong trận → isBot = true, broadcast PLAYER_BOT_TAKEOVER & Bot tự động đánh', async () => {
    const wsHost = await openSocket();
    const roomCode = await createRoomViaWs(wsHost, 'host-c3');

    // Khách p2 vào phòng
    const wsGuest2 = await openSocket();
    const g2Pending = collectMessages(wsGuest2, 2);
    wsGuest2.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode, playerId: 'p2' }));
    await g2Pending;

    // Khách p3 vào phòng
    const wsGuest3 = await openSocket();
    const g3Pending = collectMessages(wsGuest3, 2);
    wsGuest3.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode, playerId: 'p2' })); // Gửi p2, server sẽ cấp p3
    const [g3Joined] = await g3Pending;
    expect(g3Joined?.type).toBe('ROOM_JOINED');
    const p3Id = g3Joined?.type === 'ROOM_JOINED' ? g3Joined.playerId : 'p3';
    expect(p3Id).toBe('p3');

    // Khởi động trận đấu
    const room = server.getRoomManager().startGame(roomCode);
    expect(room?.started).toBe(true);

    // Chuyển lượt đến p3 để khi Bot tiếp quản sẽ tự động đánh lượt này
    const p3Index = room!.players.findIndex((p) => p.id === 'p3');
    room!.currentPlayerIndex = p3Index;
    room!.phase = TurnPhase.WaitingRoll;

    // Host đăng ký nhận thông điệp Bot Takeover
    const hostTakeoverPromise = waitForMessageType(wsHost, 'PLAYER_BOT_TAKEOVER');

    // p3 bị ngắt kết nối mạng và không kết nối lại
    wsGuest3.close();

    // 1. Assert: Server broadcast PLAYER_BOT_TAKEOVER khi hết hạn ân hạn
    const takeoverMsg = await hostTakeoverPromise;
    expect(takeoverMsg.type).toBe('PLAYER_BOT_TAKEOVER');
    if (takeoverMsg.type === 'PLAYER_BOT_TAKEOVER') {
      expect(takeoverMsg.playerId).toBe('p3');
    }

    // 2. Assert: Cấu trúc Player trên server được chuyển thành isBot = true
    const updatedRoom = server.getRoomManager().getRoom(roomCode);
    const p3Player = updatedRoom?.players.find((p) => p.id === 'p3');
    expect(p3Player?.isBot).toBe(true);

    // 3. Assert: AI Bot tự động hoàn tất lượt đánh thay cho p3:
    // - Bot đã đổ xúc xắc (lastDice được thiết lập)
    // - Bot đã di chuyển quân cờ khỏi vị trí xuất phát (position > 0)
    // - Bot đã kết thúc lượt và chuyển sang người chơi tiếp theo (currentPlayerIndex !== p3Index)
    expect(updatedRoom?.lastDice).toBeDefined();
    expect(p3Player?.position).toBeGreaterThan(0);
    expect(updatedRoom?.currentPlayerIndex).not.toBe(p3Index);

    // 4. Assert: Session của p3 chuyển sang Disconnected
    const p3Session = server.getSessionManager().getSession('p3');
    expect(p3Session?.state).toBe(SessionState.Disconnected);

    wsGuest2.close();
    wsHost.close();
  });
});
