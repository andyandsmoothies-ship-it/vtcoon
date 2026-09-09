// [TC-NET04.1/MSS][UC-GAME-006/MSS] Ân hạn 60s khi socket đứt, phát sóng PLAYER_GRACE
// [TC-NET04.2/MSS][UC-GAME-007/MSS] Gửi RECONNECT với token hợp lệ khôi phục session và nhận Full Snapshot
// [TC-NET04.3/MSS][UC-GAME-008/MSS] Hết 60s ân hạn tự động chuyển isBot = true, BotEngine tiếp quản
// [TC-NET04.4/Adversarial][UC-GAME-007/A1][UC-GAME-007/A2] Từ chối token giả mạo (TOKEN_INVALID) hoặc hết hạn (TOKEN_EXPIRED)
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import { SessionState } from '../../src/server/session_manager.js';
import { BOARD_SIZE } from '../../src/domain/room.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3104;
let server: WssServer;

beforeAll(() => {
  server = new WssServer({ port: TEST_PORT, gracePeriodMs: 200 });
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

function collectMessages(socket: WebSocket, count: number, timeoutMs = 4000): Promise<WsServerMessage[]> {
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

function waitForMessageType(socket: WebSocket, type: string, timeoutMs = 4000): Promise<WsServerMessage> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: không nhận được message type ${type}`));
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

describe('[Slice NET-04] Reconnect Token & Ân Hạn 60s → Bot Tiếp Quản', () => {

  // =========================================================================
  // TC-NET04.1: Grace period kích hoạt khi socket đứt, phát sóng PLAYER_GRACE
  // =========================================================================
  it('[TC-NET04.1/MSS] [UC-GAME-006/MSS] Socket guest đứt → Server chuyển GracePeriod và broadcast PLAYER_GRACE', async () => {
    const wsHost = await openSocket();
    const hostInitPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc1' }));
    const [roomCreated] = await hostInitPromise;
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const roomCode = roomCreated.roomCode;

    const wsGuest = await openSocket();
    const guestInitPromise = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-tc1', roomCode }));
    await guestInitPromise;

    const hostGracePromise = waitForMessageType(wsHost, 'PLAYER_GRACE');
    wsGuest.close();

    const graceMsg = await hostGracePromise;
    expect(graceMsg.type).toBe('PLAYER_GRACE');
    if (graceMsg.type === 'PLAYER_GRACE') {
      expect(graceMsg.playerId).toBe('guest-tc1');
      expect(graceMsg.secondsLeft).toBeGreaterThan(0);
    }

    const session = server.getSessionManager().getSession('guest-tc1');
    expect(session?.state).toBe(SessionState.GracePeriod);

    wsHost.close();
  });

  it('[TC-NET04.1-hb/MSS] [UC-GAME-006/MSS] Không nhận PONG sau 5s → checkHeartbeats chuyển GracePeriod và kích hoạt ân hạn', async () => {
    const wsHost = await openSocket();
    const hostInitPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-hb' }));
    const [roomCreated] = await hostInitPromise;
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const roomCode = roomCreated.roomCode;

    const wsGuest = await openSocket();
    const guestInitPromise = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-hb', roomCode }));
    await guestInitPromise;

    const session = server.getSessionManager().getSession('guest-hb');
    expect(session?.state).toBe(SessionState.Connected);

    // Mô phỏng trôi qua 6s không có PONG
    if (session) {
      session.lastPongAt = Date.now() - 6_000;
    }
    server.getSessionManager().checkHeartbeats();
    expect(session?.state).toBe(SessionState.GracePeriod);

    // Kích hoạt startGracePeriod và kiểm tra countdown
    server.getReconnectManager().startGracePeriod(roomCode, 'guest-hb');
    expect(server.getReconnectManager().isPlayerInGrace(roomCode, 'guest-hb')).toBe(true);

    wsHost.close();
    wsGuest.close();
  });

  // =========================================================================
  // TC-NET04.2: Gửi RECONNECT với token hợp lệ khôi phục thành công session & Full Snapshot
  // =========================================================================
  it('[TC-NET04.2/MSS] [UC-GAME-007/MSS] Gửi RECONNECT với token hợp lệ → Session Connected & nhận Full Snapshot', async () => {
    const wsHost = await openSocket();
    const hostInitPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc2' }));
    const [roomCreated] = await hostInitPromise;
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const roomCode = roomCreated.roomCode;

    const wsGuest = await openSocket();
    const guestInitPromise = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-tc2', roomCode }));
    const [, sessionInit] = await guestInitPromise;
    if (sessionInit?.type !== 'SESSION_INIT') throw new Error('SESSION_INIT expected');
    const reconnectToken = sessionInit.reconnectToken;

    const hostGracePromise = waitForMessageType(wsHost, 'PLAYER_GRACE');
    wsGuest.close();
    await hostGracePromise;

    // Guest mở socket mới và gửi RECONNECT trước khi hết ân hạn
    const wsGuest2 = await openSocket();
    const hostReconnectedPromise = waitForMessageType(wsHost, 'PLAYER_RECONNECTED');
    const guestSnapshotPromise = waitForMessageType(wsGuest2, 'STATE_DELTA');

    wsGuest2.send(JSON.stringify({
      type: 'RECONNECT',
      reconnectToken,
      roomCode,
    }));

    const [reconnectedMsg, snapshotMsg] = await Promise.all([
      hostReconnectedPromise,
      guestSnapshotPromise,
    ]);

    expect(reconnectedMsg.type).toBe('PLAYER_RECONNECTED');
    if (reconnectedMsg.type === 'PLAYER_RECONNECTED') {
      expect(reconnectedMsg.playerId).toBe('guest-tc2');
    }

    expect(snapshotMsg.type).toBe('STATE_DELTA');
    if (snapshotMsg.type === 'STATE_DELTA') {
      // Full Snapshot: phải có đầy đủ 40 ô trên bàn cờ
      expect(snapshotMsg.delta.cells.length).toBe(BOARD_SIZE);
      expect(snapshotMsg.delta.tick).toBeGreaterThan(0);
    }

    const session = server.getSessionManager().getSession('guest-tc2');
    expect(session?.state).toBe(SessionState.Connected);

    wsHost.close();
    wsGuest2.close();
  });

  // =========================================================================
  // TC-NET04.3: Hết ân hạn tự động chuyển isBot = true, Bot tiếp quản
  // =========================================================================
  it('[TC-NET04.3/MSS] [UC-GAME-008/MSS] Hết thời gian ân hạn → isBot = true và broadcast PLAYER_BOT_TAKEOVER', async () => {
    const wsHost = await openSocket();
    const hostInitPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc3' }));
    const [roomCreated] = await hostInitPromise;
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const roomCode = roomCreated.roomCode;

    const wsGuest = await openSocket();
    const guestInitPromise = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-tc3', roomCode }));
    const [, sessionInit] = await guestInitPromise;
    if (sessionInit?.type !== 'SESSION_INIT') throw new Error('SESSION_INIT expected');

    const hostTakeoverPromise = waitForMessageType(wsHost, 'PLAYER_BOT_TAKEOVER');
    wsGuest.close();

    const takeoverMsg = await hostTakeoverPromise;
    expect(takeoverMsg.type).toBe('PLAYER_BOT_TAKEOVER');
    if (takeoverMsg.type === 'PLAYER_BOT_TAKEOVER') {
      expect(takeoverMsg.playerId).toBe('guest-tc3');
    }

    // Kiểm tra state của Player trong Room: isBot chuyển thành true
    const room = server.getRoomManager().getRoom(roomCode);
    const guestPlayer = room?.players.find((p) => p.id === 'guest-tc3');
    expect(guestPlayer?.isBot).toBe(true);

    const session = server.getSessionManager().getSession('guest-tc3');
    expect(session?.state).toBe(SessionState.Disconnected);

    wsHost.close();
  });

  // =========================================================================
  // TC-NET04.4: Adversarial Testing — Từ chối token giả mạo hoặc hết hạn
  // =========================================================================
  describe('TC-NET04.4: Adversarial Reconnect Rejections', () => {
    it('[TC-NET04.4-inv1/Adversarial] [UC-GAME-007/A2] Token không tồn tại → ERROR TOKEN_INVALID', async () => {
      const ws = await openSocket();
      const replyPromise = waitForMessageType(ws, 'ERROR');

      ws.send(JSON.stringify({
        type: 'RECONNECT',
        reconnectToken: 'fake-invalid-token-uuid-1234',
        roomCode: 'NONEXIST',
      }));

      const reply = await replyPromise;
      expect(reply.type).toBe('ERROR');
      if (reply.type === 'ERROR') {
        expect(reply.reasonCode).toBe('TOKEN_INVALID');
      }
      ws.close();
    });

    it('[TC-NET04.4-inv2/Adversarial] [UC-GAME-007/A2] Token hợp lệ nhưng sai roomCode → ERROR TOKEN_INVALID', async () => {
      const wsHost = await openSocket();
      const hostInitPromise = collectMessages(wsHost, 2);
      wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc4' }));
      const [, sessionInit] = await hostInitPromise;
      if (sessionInit?.type !== 'SESSION_INIT') throw new Error('SESSION_INIT expected');
      const validToken = sessionInit.reconnectToken;

      const wsAttacker = await openSocket();
      const replyPromise = waitForMessageType(wsAttacker, 'ERROR');

      wsAttacker.send(JSON.stringify({
        type: 'RECONNECT',
        reconnectToken: validToken,
        roomCode: 'WRONG9',
      }));

      const reply = await replyPromise;
      expect(reply.type).toBe('ERROR');
      if (reply.type === 'ERROR') {
        expect(reply.reasonCode).toBe('TOKEN_INVALID');
      }

      wsHost.close();
      wsAttacker.close();
    });

    it('[TC-NET04.4-inv3/Adversarial] [UC-GAME-007/A1] Token đã hết hạn sau Bot takeover → ERROR TOKEN_EXPIRED', async () => {
      const wsHost = await openSocket();
      const hostInitPromise = collectMessages(wsHost, 2);
      wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc5' }));
      const [roomCreated] = await hostInitPromise;
      if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const roomCode = roomCreated.roomCode;

      const wsGuest = await openSocket();
      const guestInitPromise = collectMessages(wsGuest, 2);
      wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-tc5', roomCode }));
      const [, sessionInit] = await guestInitPromise;
      if (sessionInit?.type !== 'SESSION_INIT') throw new Error('SESSION_INIT expected');
      const guestToken = sessionInit.reconnectToken;

      const hostTakeoverPromise = waitForMessageType(wsHost, 'PLAYER_BOT_TAKEOVER');
      wsGuest.close();
      await hostTakeoverPromise;

      // Guest cố gắng reconnect sau khi Bot đã tiếp quản
      const wsGuestRetry = await openSocket();
      const errorPromise = waitForMessageType(wsGuestRetry, 'ERROR');

      wsGuestRetry.send(JSON.stringify({
        type: 'RECONNECT',
        reconnectToken: guestToken,
        roomCode,
      }));

      const reply = await errorPromise;
      expect(reply.type).toBe('ERROR');
      if (reply.type === 'ERROR') {
        expect(reply.reasonCode).toBe('TOKEN_EXPIRED');
      }

      wsHost.close();
      wsGuestRetry.close();
    });

    it('[TC-NET04.4-inv4/Adversarial] Tab 2 reconnect cùng token đóng sạch socket cũ (supersede zombie socket)', async () => {
      const wsHost = await openSocket();
      const hostInitPromise = collectMessages(wsHost, 2);
      wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc6' }));
      const [roomCreated] = await hostInitPromise;
      if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const roomCode = roomCreated.roomCode;

      const wsGuest = await openSocket();
      const guestInitPromise = collectMessages(wsGuest, 2);
      wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-tc6', roomCode }));
      const [, sessionInit] = await guestInitPromise;
      if (sessionInit?.type !== 'SESSION_INIT') throw new Error('SESSION_INIT expected');
      const token = sessionInit.reconnectToken;

      // Tab 2 kết nối với cùng token trong khi socket 1 vẫn mở
      const wsGuestTab2 = await openSocket();
      const oldSocketClosePromise = new Promise<boolean>((resolve) => {
        wsGuest.once('close', () => resolve(true));
      });

      wsGuestTab2.send(JSON.stringify({
        type: 'RECONNECT',
        reconnectToken: token,
        roomCode,
      }));

      const closed = await oldSocketClosePromise;
      expect(closed).toBe(true);

      wsHost.close();
      wsGuestTab2.close();
    });

    it('[TC-NET04.4-inv5/Adversarial] Player đã bị Bot takeover gửi INTENT bị từ chối TOKEN_EXPIRED', async () => {
      const wsHost = await openSocket();
      const hostInitPromise = collectMessages(wsHost, 2);
      wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc7' }));
      const [roomCreated] = await hostInitPromise;
      if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const roomCode = roomCreated.roomCode;

      const wsGuest = await openSocket();
      const guestInitPromise = collectMessages(wsGuest, 2);
      wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-tc7', roomCode }));
      await guestInitPromise;

      // Đợi Bot takeover sau khi socket guest đứt
      const hostTakeoverPromise = waitForMessageType(wsHost, 'PLAYER_BOT_TAKEOVER');
      wsGuest.close();
      await hostTakeoverPromise;

      // Một client mở socket mới cố tình gửi INTENT dưới danh nghĩa player đã thành bot
      const wsAttacker = await openSocket();
      const errorPromise = waitForMessageType(wsAttacker, 'ERROR');

      wsAttacker.send(JSON.stringify({
        type: 'INTENT',
        roomCode,
        playerId: 'guest-tc7',
        intent: { type: 'INTENT_ROLL' },
      }));

      const errReply = await errorPromise;
      expect(errReply.type).toBe('ERROR');
      if (errReply.type === 'ERROR') {
        expect(errReply.reasonCode).toBe('TOKEN_EXPIRED');
      }

      wsHost.close();
      wsAttacker.close();
    });

    it('[TC-NET04.3-active/MSS] Disconnect trong lượt đang chơi → Bot tiếp quản và hoàn tất lượt (không kẹt ActionPhase)', async () => {
      const wsHost = await openSocket();
      const hostInitPromise = collectMessages(wsHost, 2);
      wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc8' }));
      const [roomCreated] = await hostInitPromise;
      if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const roomCode = roomCreated.roomCode;

      const wsGuest = await openSocket();
      const guestInitPromise = collectMessages(wsGuest, 2);
      wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-tc8', roomCode }));
      await guestInitPromise;

      // Bắt đầu ván chơi
      const room = server.getRoomManager().startGame(roomCode);
      expect(room?.started).toBe(true);

      // host-tc8 là người chơi hiện tại, đang ở WaitingRoll
      expect(room?.players[room?.currentPlayerIndex]?.id).toBe('host-tc8');

      const guestTakeoverPromise = waitForMessageType(wsGuest, 'PLAYER_BOT_TAKEOVER');
      wsHost.close(); // Host disconnect khi đang trong lượt của mình
      await guestTakeoverPromise;

      // Sau khi bot tiếp quản, bot phải hoàn thành lượt, không được kẹt lại ở ActionPhase
      const updatedRoom = server.getRoomManager().getRoom(roomCode);
      const hostPlayer = updatedRoom?.players.find((p) => p.id === 'host-tc8');
      expect(hostPlayer?.isBot).toBe(true);
      // Lượt đã được chuyển sang guest hoặc bot đã hoàn thành turn
      expect(updatedRoom?.phase).not.toBe('ActionPhase');

      wsGuest.close();
    });
  });
});
