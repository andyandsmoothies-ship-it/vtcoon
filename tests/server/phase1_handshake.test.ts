// [TC-NET-P1.1/MSS][TC-NET-P1.2/MSS][TC-NET-P1.3/MSS][TC-NET-P1.4-inv/Adversarial]
// Phase 1 Integration Tests: WebSocket Handshake, Room Lifecycle, and Elimination of Ghost Matches
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3188;
let server: WssServer;
const activeSockets: WebSocket[] = [];

beforeAll(() => {
  server = new WssServer({ port: TEST_PORT });
});

afterEach(() => {
  for (const s of activeSockets) {
    try {
      s.close();
    } catch {}
  }
  activeSockets.length = 0;
});

afterAll(async () => {
  await server.close();
});

function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    ws.once('open', () => {
      activeSockets.push(ws);
      resolve(ws);
    });
    ws.once('error', reject);
  });
}

function collectMessages(socket: WebSocket, count: number): Promise<WsServerMessage[]> {
  return new Promise((resolve, reject) => {
    const received: WsServerMessage[] = [];
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${count} messages, only received ${received.length}`));
    }, 4000);

    const onMsg = (data: Buffer | string): void => {
      received.push(JSON.parse(data.toString()) as WsServerMessage);
      if (received.length >= count) {
        clearTimeout(timer);
        socket.off('message', onMsg);
        resolve(received);
      }
    };
    socket.on('message', onMsg);
  });
}

describe('[Phase 1] Bắt Tay Mạng WebSocket, Vòng Đời Phòng & Triệt Tiêu Ván Đấu Ma', () => {
  it('[TC-NET-P1.1/MSS] Client kết nối gửi CREATE_ROOM thành công, nhận về SESSION_INIT có reconnectToken', async () => {
    const wsHost = await openSocket();
    const pendingMessages = collectMessages(wsHost, 2);

    wsHost.send(JSON.stringify({
      type: 'CREATE_ROOM',
      roomCode: 'PHASE1',
      playerId: 'host-player-1',
    }));

    const messages = await pendingMessages;
    const roomCreated = messages.find((m) => m.type === 'ROOM_CREATED');
    const sessionInit = messages.find((m) => m.type === 'SESSION_INIT');

    expect(roomCreated).toBeDefined();
    if (roomCreated?.type === 'ROOM_CREATED') {
      expect(roomCreated.roomCode).toBe('PHASE1');
      expect(roomCreated.playerId).toBe('host-player-1');
    }

    expect(sessionInit).toBeDefined();
    if (sessionInit?.type === 'SESSION_INIT') {
      expect(sessionInit.playerId).toBe('host-player-1');
      expect(sessionInit.reconnectToken).toBeTruthy();
      expect(sessionInit.roomCode).toBe('PHASE1');
    }
  });

  it('[TC-NET-P1.2/MSS] Gửi START_GAME chuyển trạng thái phòng thành công và broadcast ROOM_STARTED + STATE_DELTA', async () => {
    const wsHost = await openSocket();
    const wsGuest = await openSocket();

    // 1. Host tạo phòng
    const hostInit = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({
      type: 'CREATE_ROOM',
      roomCode: 'START1',
      playerId: 'p1-host',
    }));
    await hostInit;

    // 2. Guest gia nhập phòng
    const guestInit = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomCode: 'START1',
      playerId: 'p2-guest',
    }));
    const [roomJoined] = await guestInit;
    expect(roomJoined?.type).toBe('ROOM_JOINED');

    // 3. Host gửi START_GAME -> Cả hai client nhận ROOM_STARTED và STATE_DELTA đầu tiên
    const hostBroadcast = collectMessages(wsHost, 2);
    const guestBroadcast = collectMessages(wsGuest, 2);

    wsHost.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: 'START1',
      playerId: 'p1-host',
    }));

    const [hostMsg1, hostMsg2] = await hostBroadcast;
    const [guestMsg1, guestMsg2] = await guestBroadcast;

    // Host nhận broadcast
    expect([hostMsg1?.type, hostMsg2?.type]).toContain('ROOM_STARTED');
    expect([hostMsg1?.type, hostMsg2?.type]).toContain('STATE_DELTA');

    // Guest nhận broadcast
    expect([guestMsg1?.type, guestMsg2?.type]).toContain('ROOM_STARTED');
    expect([guestMsg1?.type, guestMsg2?.type]).toContain('STATE_DELTA');

    // Kiểm tra trạng thái phòng trên Server
    const room = server.getRoomManager().getRoom('START1');
    expect(room).toBeDefined();
    expect(room?.started).toBe(true);
    expect(room?.currentPlayerIndex).toBe(0);
  });

  it('[TC-NET-P1.3/MSS] Gửi INTENT_ROLL sau khi kết nối và bắt đầu game trả về STATE_DELTA hợp lệ, không bị ROOM_NOT_FOUND', async () => {
    const wsHost = await openSocket();
    const wsGuest = await openSocket();

    // 1. Host tạo phòng
    const hostInit = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({
      type: 'CREATE_ROOM',
      roomCode: 'ROLL01',
      playerId: 'p1-roller',
    }));
    await hostInit;

    // 2. Guest gia nhập phòng
    const guestInit = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomCode: 'ROLL01',
      playerId: 'p2-waiter',
    }));
    await guestInit;

    // 3. Host bắt đầu game -> Cả hai client đợi nhận broadcast khởi đầu
    const hostStartWait = collectMessages(wsHost, 2);
    const guestStartWait = collectMessages(wsGuest, 2);

    wsHost.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: 'ROLL01',
      playerId: 'p1-roller',
    }));
    await Promise.all([hostStartWait, guestStartWait]);

    // 4. Host (người chơi hiện tại p1-roller) gửi INTENT_ROLL
    const hostRollWait = collectMessages(wsHost, 1);
    const guestRollWait = collectMessages(wsGuest, 1);

    wsHost.send(JSON.stringify({
      type: 'INTENT',
      roomCode: 'ROLL01',
      playerId: 'p1-roller',
      intent: { type: 'INTENT_ROLL' },
    }));

    const [hostDelta] = await hostRollWait;
    const [guestDelta] = await guestRollWait;

    // Cả hai client PHẢI nhận được STATE_DELTA từ server điều phối, tuyệt đối KHÔNG có ROOM_NOT_FOUND
    expect(hostDelta?.type).toBe('STATE_DELTA');
    expect(guestDelta?.type).toBe('STATE_DELTA');

    if (hostDelta?.type === 'STATE_DELTA') {
      expect(hostDelta.delta).toBeDefined();
      expect(hostDelta.delta.tick).toBeGreaterThan(0);
      const rollerDelta = hostDelta.delta.players?.find((p) => p.id === 'p1-roller');
      expect(rollerDelta).toBeDefined();
      // Quân cờ đã di chuyển từ ô 0 tới vị trí mới do server xác định
      expect(rollerDelta?.position).toBeGreaterThanOrEqual(2);
      expect(rollerDelta?.position).toBeLessThanOrEqual(12);
    }
  });

  it('[TC-NET-P1.4-inv/Adversarial] Phòng vệ bảo mật: Không phải host không thể gửi START_GAME, phòng không đủ người bị từ chối', async () => {
    const wsHost = await openSocket();
    const wsGuest = await openSocket();

    // 1. Host tạo phòng
    const hostInit = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({
      type: 'CREATE_ROOM',
      roomCode: 'SEC001',
      playerId: 'legit-host',
    }));
    await hostInit;

    // 2. Guest chưa gia nhập, host bấm start khi chỉ có 1 người -> NOT_ENOUGH_PLAYERS
    const soloStartWait = collectMessages(wsHost, 1);
    wsHost.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: 'SEC001',
      playerId: 'legit-host',
    }));
    const [soloReply] = await soloStartWait;
    expect(soloReply?.type).toBe('ERROR');
    if (soloReply?.type === 'ERROR') {
      expect(soloReply.reasonCode).toBe('NOT_ENOUGH_PLAYERS');
    }

    // 3. Guest gia nhập phòng
    const guestJoin = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomCode: 'SEC001',
      playerId: 'sneaky-guest',
    }));
    await guestJoin;

    // 4. Guest cố tình gửi START_GAME -> NOT_HOST
    const guestStartWait = collectMessages(wsGuest, 1);
    wsGuest.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: 'SEC001',
      playerId: 'sneaky-guest',
    }));
    const [guestReply] = await guestStartWait;
    expect(guestReply?.type).toBe('ERROR');
    if (guestReply?.type === 'ERROR') {
      expect(guestReply.reasonCode).toBe('NOT_HOST');
    }

    // 5. Gửi START_GAME vào mã phòng không tồn tại -> ROOM_NOT_FOUND
    const fakeRoomWait = collectMessages(wsGuest, 1);
    wsGuest.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: 'NONEXS',
      playerId: 'sneaky-guest',
    }));
    const [fakeReply] = await fakeRoomWait;
    expect(fakeReply?.type).toBe('ERROR');
    if (fakeReply?.type === 'ERROR') {
      expect(fakeReply.reasonCode).toBe('ROOM_NOT_FOUND');
    }
  });
});
