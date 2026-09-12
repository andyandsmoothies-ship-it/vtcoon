// [TC-NET01.1/MSS][UC-GAME-001/MSS] Bắt tay WS + tạo phòng 6 ký tự in hoa
// [TC-NET01.2/MSS][UC-GAME-003/MSS] Gia nhập phòng hợp lệ → playerCount đúng
// [TC-NET01.3/MSS][UC-GAME-003/MSS] Gia nhập tối đa 3 guest → playerCount tăng
// [TC-NET01.4-inv/Adversarial][UC-GAME-001/A3] Từ chối mã phòng sai → ROOM_NOT_FOUND
// [TC-NET01.5-inv/Adversarial][UC-GAME-001/A2] Từ chối phòng đầy → ROOM_FULL
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3099;
let server: WssServer;

beforeAll(() => {
  server = new WssServer({ port: TEST_PORT });
});

afterAll(async () => {
  await server.close();
});

/** Mở kết nối mới, đợi 'open' */
function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}

/**
 * Đăng ký listener TRƯỚC khi gửi, đợi đúng N message.
 * Pattern: receiveN() → send() → await msgs
 */
function collectN(socket: WebSocket, n: number): Promise<WsServerMessage[]> {
  return new Promise((resolve, reject) => {
    const msgs: WsServerMessage[] = [];
    const timer = setTimeout(
      () => reject(new Error(`timeout: nhận ${msgs.length}/${n} messages`)),
      3_000,
    );
    const onMsg = (data: Buffer | string): void => {
      msgs.push(JSON.parse(data.toString()) as WsServerMessage);
      if (msgs.length === n) {
        clearTimeout(timer);
        socket.off('message', onMsg);
        resolve(msgs);
      }
    };
    socket.on('message', onMsg);
  });
}

/** Shortcut: gửi 1 message, nhận 1 reply */
async function sendRecv(socket: WebSocket, payload: object): Promise<WsServerMessage> {
  const pending = collectN(socket, 1);
  socket.send(JSON.stringify(payload));
  const [msg] = await pending;
  if (!msg) throw new Error('Không nhận được message');
  return msg;
}

// ─────────────────────────────────────────────────────────────────

describe('[NET-01] WSS Server & Tạo Phòng 6 Ký Tự', () => {

  it('[TC-NET01.1/MSS] [UC-GAME-001/MSS] CREATE_ROOM → roomCode khớp /^[A-Z0-9]{6}$/', async () => {
    const ws = await openSocket();
    // CREATE_ROOM phát ra 2 messages: ROOM_CREATED + SESSION_INIT
    const pending = collectN(ws, 2);
    ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc1' }));
    const [roomCreated, sessionInit] = await pending;

    // ROOM_CREATED: roomCode hợp lệ
    expect(roomCreated?.type).toBe('ROOM_CREATED');
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error(`Sai type: ${roomCreated?.type}`);
    expect(roomCreated.roomCode).toMatch(/^[A-Z0-9]{6}$/);
    expect(roomCreated.playerId).toBe('host-tc1');

    // SESSION_INIT: token được cấp
    expect(sessionInit?.type).toBe('SESSION_INIT');
    if (sessionInit?.type !== 'SESSION_INIT') throw new Error(`Sai type: ${sessionInit?.type}`);
    expect(sessionInit.playerId).toBe('host-tc1');
    expect(sessionInit.reconnectToken).toBeTruthy();

    ws.close();
  });

  it('[TC-NET01.2/MSS] [UC-GAME-003/MSS] host tạo phòng, guest JOIN_ROOM → playerCount=2', async () => {
    // Bước 1: Host tạo phòng
    const wsHost = await openSocket();
    const hostPending = collectN(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc2' }));
    const [createdMsg] = await hostPending;
    if (createdMsg?.type !== 'ROOM_CREATED') {
      throw new Error(`Expected ROOM_CREATED, nhận: ${createdMsg?.type}`);
    }
    const roomCode = createdMsg.roomCode;

    // Bước 2: Guest gia nhập
    const wsGuest = await openSocket();
    const reply = await sendRecv(wsGuest, {
      type: 'JOIN_ROOM',
      playerId: 'guest-tc2',
      roomCode,
    });

    expect(reply.type).toBe('ROOM_JOINED');
    if (reply.type !== 'ROOM_JOINED') throw new Error(`Expected ROOM_JOINED, nhận: ${reply.type}`);
    expect(reply.playerCount).toBe(2);
    expect(reply.roomCode).toBe(roomCode);

    wsHost.close();
    wsGuest.close();
  });

  it('[TC-NET01.3/MSS] [UC-GAME-003/MSS] 3 guest gia nhập cùng phòng → playerCount tăng đúng 2→3→4', async () => {
    const wsHost = await openSocket();
    const hostPending = collectN(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc3' }));
    const [createdMsg3] = await hostPending;
    if (createdMsg3?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const rc = createdMsg3.roomCode;

    const guests: WebSocket[] = [];
    for (let i = 1; i <= 3; i++) {
      const ws = await openSocket();
      const reply = await sendRecv(ws, {
        type: 'JOIN_ROOM',
        playerId: `guest-tc3-${i}`,
        roomCode: rc,
      });
      expect(reply.type, `Guest ${i}: sai type`).toBe('ROOM_JOINED');
      if (reply.type !== 'ROOM_JOINED') throw new Error(`Guest ${i}: ${reply.type}`);
      // host=1, sau mỗi guest: 2, 3, 4
      expect(reply.playerCount, `Guest ${i}: sai playerCount`).toBe(i + 1);
      guests.push(ws);
    }

    wsHost.close();
    for (const g of guests) g.close();
  });

  it('[TC-NET01.4-inv/Adversarial] [UC-GAME-001/A3] JOIN_ROOM mã không tồn tại → ERROR ROOM_NOT_FOUND', async () => {
    const ws = await openSocket();
    const reply = await sendRecv(ws, {
      type: 'JOIN_ROOM',
      playerId: 'intruder-tc4',
      roomCode: 'ZZZZZZ',
    });

    expect(reply.type).toBe('ERROR');
    if (reply.type !== 'ERROR') throw new Error(`Expected ERROR, nhận: ${reply.type}`);
    expect(reply.reasonCode).toBe('ROOM_NOT_FOUND');

    ws.close();
  });

  it('[TC-NET01.5-inv/Adversarial] [UC-GAME-001/A2] phòng đủ 4 người → guest thứ 5 nhận ERROR ROOM_FULL', async () => {
    // Host (người 1)
    const wsHost = await openSocket();
    const hostPending5 = collectN(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc5' }));
    const [createdMsg5] = await hostPending5;
    if (createdMsg5?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const rc5 = createdMsg5.roomCode;

    // Join 3 guest (người 2→4), tổng = 4
    const sockets5: WebSocket[] = [];
    for (let i = 1; i <= 3; i++) {
      const ws = await openSocket();
      const reply = await sendRecv(ws, {
        type: 'JOIN_ROOM',
        playerId: `guest-tc5-${i}`,
        roomCode: rc5,
      });
      expect(reply.type, `Guest ${i} vào phòng thất bại`).toBe('ROOM_JOINED');
      sockets5.push(ws);
    }

    // Guest thứ 5 (người thứ 5 vào phòng 4 người) phải bị từ chối
    const wsExtra = await openSocket();
    const replyExtra = await sendRecv(wsExtra, {
      type: 'JOIN_ROOM',
      playerId: 'overflow-tc5',
      roomCode: rc5,
    });

    expect(replyExtra.type).toBe('ERROR');
    if (replyExtra.type !== 'ERROR') throw new Error(`Expected ERROR, nhận: ${replyExtra.type}`);
    expect(replyExtra.reasonCode).toBe('ROOM_FULL');

    wsHost.close();
    wsExtra.close();
    for (const s of sockets5) s.close();
  });

  it('[TC-NET01.6/MSS] Host tạo lại phòng cũ với mã custom → Server dọn phòng cũ và cấp phòng mới đúng mã', async () => {
    const ws1 = await openSocket();
    const p1 = collectN(ws1, 2);
    ws1.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc6', roomCode: 'VTTEST' }));
    const [created1] = await p1;
    expect(created1?.type).toBe('ROOM_CREATED');
    if (created1?.type !== 'ROOM_CREATED') throw new Error('Expected ROOM_CREATED');
    expect(created1.roomCode).toBe('VTTEST');

    // Bắt đầu game cho phòng VTTEST
    const startReply = collectN(ws1, 2);
    ws1.send(JSON.stringify({ type: 'START_GAME', playerId: 'host-tc6', roomCode: 'VTTEST', bots: [{ id: 'bot_1' }] }));
    await startReply;

    // Host kết nối socket mới và gửi CREATE_ROOM với cùng mã VTTEST
    const ws2 = await openSocket();
    const p2 = collectN(ws2, 2);
    ws2.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-tc6', roomCode: 'VTTEST' }));
    const [created2] = await p2;
    expect(created2?.type).toBe('ROOM_CREATED');
    if (created2?.type !== 'ROOM_CREATED') throw new Error('Expected ROOM_CREATED');
    expect(created2.roomCode).toBe('VTTEST');

    ws1.close();
    ws2.close();
  });
});
