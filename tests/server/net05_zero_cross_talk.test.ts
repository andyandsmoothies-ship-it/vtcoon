// [UC-NET05/MSS] WSS Zero Cross-Talk E2E — Cách Ly Phát Sóng Giữa Các Phòng
// [TC-NET05.1/MSS] Broadcast từ Room A không lọt sang Room B
// [TC-NET05.2/MSS] Broadcast từ Room B không lọt sang Room A (đảo ngược)
// [TC-NET05.3/Adversarial] Hai phòng gửi intent đồng thời — Per-room mutex độc lập, 0 cross-talk
// [TC-NET05.4/Adversarial] Đóng Room A hoàn toàn — Room B tiếp tục nhận broadcast bình thường
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3105;
let server: WssServer;
const allSockets: WebSocket[] = [];

beforeAll(() => {
  // botTurnDelayMs=30_000: prevent scheduled bot turns from firing during the
  // short measurement windows (600-700ms), which would produce false-positive
  // "cross-talk" detections on Room B's own sockets.
  server = new WssServer({ port: TEST_PORT, botTurnDelayMs: 30_000 });
});

afterAll(async () => {
  for (const s of allSockets) {
    try {
      s.removeAllListeners();
      s.close();
    } catch {
      /* safe-ignore */
    }
  }
  await server.close();
});

function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    ws.once('open', () => {
      allSockets.push(ws);
      resolve(ws);
    });
    ws.once('error', reject);
  });
}

function collectN(socket: WebSocket, n: number, timeoutMs = 3000): Promise<WsServerMessage[]> {
  return new Promise((resolve, reject) => {
    const msgs: WsServerMessage[] = [];
    const timer = setTimeout(
      () => reject(new Error(`timeout: nhan ${msgs.length}/${n} messages`)),
      timeoutMs,
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

/**
 * Lang nghe trong `ms` mili-giay va thu thap TAT CA packets nhan duoc.
 * KHONG reject neu khong co packet — resolve voi mang rong.
 * Cong cu do "zero leak": neu tra ve [], khong co ro ri.
 */
function collectForMs(socket: WebSocket, ms: number): Promise<WsServerMessage[]> {
  return new Promise((resolve) => {
    const msgs: WsServerMessage[] = [];
    const onMsg = (data: Buffer | string): void => {
      msgs.push(JSON.parse(data.toString()) as WsServerMessage);
    };
    socket.on('message', onMsg);
    setTimeout(() => {
      socket.off('message', onMsg);
      resolve(msgs);
    }, ms);
  });
}

async function setupRoom(hostId: string, guestId: string): Promise<{
  roomCode: string;
  wsHost: WebSocket;
  wsGuest: WebSocket;
}> {
  const wsHost = await openSocket();
  const wsGuest = await openSocket();

  const hostInit = collectN(wsHost, 2);
  wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: hostId }));
  const [createdMsg] = await hostInit;
  if (createdMsg?.type !== 'ROOM_CREATED') {
    throw new Error(`Expected ROOM_CREATED, got: ${createdMsg?.type}`);
  }
  const roomCode = createdMsg.roomCode;

  const guestInit = collectN(wsGuest, 2);
  wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: guestId, roomCode }));
  const [joinedMsg] = await guestInit;
  if (joinedMsg?.type !== 'ROOM_JOINED') {
    throw new Error(`Expected ROOM_JOINED, got: ${joinedMsg?.type}`);
  }

  // Drain the 2 broadcast messages that START_GAME sends to ALL room members
  // (ROOM_STARTED + STATE_DELTA). Without draining these, they sit in the guest
  // socket buffer and are picked up by collectForMs as false "cross-talk".
  const hostStart = collectN(wsHost, 2);
  const guestStartDrain = collectN(wsGuest, 2);
  wsHost.send(JSON.stringify({
    type: 'START_GAME',
    playerId: hostId,
    roomCode,
    bots: [{ id: 'bot_1' }],
  }));
  await Promise.all([hostStart, guestStartDrain]);

  const guestResync = collectN(wsGuest, 1);
  wsGuest.send(JSON.stringify({ type: 'INTENT_REQUEST_RESYNC', roomCode, playerId: guestId }));
  await guestResync;

  return { roomCode, wsHost, wsGuest };
}

describe('[NET-05] WSS Zero Cross-Talk — Cach Ly Phat Song Giua Cac Phong', () => {

  it('[TC-NET05.1/MSS] Room A broadcast STATE_DELTA khong ro ri sang Room B', async () => {
    const roomA = await setupRoom('hostA-tc1', 'guestA-tc1');
    const roomB = await setupRoom('hostB-tc1', 'guestB-tc1');

    const leakListenerB1 = collectForMs(roomB.wsHost, 600);
    const leakListenerB2 = collectForMs(roomB.wsGuest, 600);

    const aDelta = collectN(roomA.wsGuest, 1);
    roomA.wsHost.send(JSON.stringify({
      type: 'INTENT',
      roomCode: roomA.roomCode,
      playerId: 'hostA-tc1',
      intent: { type: 'INTENT_ROLL' },
    }));

    const [guestAMsg] = await aDelta;
    expect(guestAMsg?.type, 'Guest Room A phai nhan STATE_DELTA').toBe('STATE_DELTA');

    const leakedToB1 = await leakListenerB1;
    const leakedToB2 = await leakListenerB2;

    expect(
      leakedToB1,
      `Room B Host nhan ${leakedToB1.length} packet ro ri tu Room A`,
    ).toHaveLength(0);
    expect(
      leakedToB2,
      `Room B Guest nhan ${leakedToB2.length} packet ro ri tu Room A`,
    ).toHaveLength(0);
  });

  it('[TC-NET05.2/MSS] Room B broadcast PLAYER_EMOTE khong ro ri sang Room A (dao nguoc)', async () => {
    const roomA = await setupRoom('hostA-tc2', 'guestA-tc2');
    const roomB = await setupRoom('hostB-tc2', 'guestB-tc2');

    const leakListenerA1 = collectForMs(roomA.wsHost, 600);
    const leakListenerA2 = collectForMs(roomA.wsGuest, 600);

    const bEmote = collectN(roomB.wsHost, 1);
    roomB.wsGuest.send(JSON.stringify({
      type: 'EMOTE',
      roomCode: roomB.roomCode,
      playerId: 'guestB-tc2',
      emoteId: 'laugh',
    }));

    const [hostBMsg] = await bEmote;
    expect(hostBMsg?.type, 'Host Room B phai nhan PLAYER_EMOTE').toBe('PLAYER_EMOTE');

    const leakedToA1 = await leakListenerA1;
    const leakedToA2 = await leakListenerA2;

    expect(
      leakedToA1,
      `Room A Host nhan ${leakedToA1.length} packet ro ri tu Room B`,
    ).toHaveLength(0);
    expect(
      leakedToA2,
      `Room A Guest nhan ${leakedToA2.length} packet ro ri tu Room B`,
    ).toHaveLength(0);
  });

  it('[TC-NET05.3/Adversarial] Hai phong gui intent dong thoi qua Promise.all — Per-room mutex doc lap, 0 cross-talk', async () => {
    const roomA = await setupRoom('hostA-tc3', 'guestA-tc3');
    const roomB = await setupRoom('hostB-tc3', 'guestB-tc3');

    const aDeltaForGuest = collectN(roomA.wsGuest, 1, 2000);
    const bDeltaForGuest = collectN(roomB.wsGuest, 1, 2000);

    const leakA1 = collectForMs(roomA.wsHost, 700);
    const leakA2 = collectForMs(roomA.wsGuest, 700);
    const leakB1 = collectForMs(roomB.wsHost, 700);
    const leakB2 = collectForMs(roomB.wsGuest, 700);

    await Promise.all([
      (async () => {
        roomA.wsHost.send(JSON.stringify({
          type: 'INTENT',
          roomCode: roomA.roomCode,
          playerId: 'hostA-tc3',
          intent: { type: 'INTENT_ROLL' },
        }));
      })(),
      (async () => {
        roomB.wsHost.send(JSON.stringify({
          type: 'INTENT',
          roomCode: roomB.roomCode,
          playerId: 'hostB-tc3',
          intent: { type: 'INTENT_ROLL' },
        }));
      })(),
    ]);

    const [guestAMsg] = await aDeltaForGuest;
    const [guestBMsg] = await bDeltaForGuest;
    expect(guestAMsg?.type, 'Guest Room A phai nhan STATE_DELTA').toBe('STATE_DELTA');
    expect(guestBMsg?.type, 'Guest Room B phai nhan STATE_DELTA').toBe('STATE_DELTA');

    const allA1 = await leakA1;
    const allA2 = await leakA2;
    const allB1 = await leakB1;
    const allB2 = await leakB2;

    expect(allA1.length, 'Room A Host khong nhan nhieu hon 1 packet').toBeLessThanOrEqual(1);
    expect(allA2.length, 'Room A Guest khong nhan nhieu hon 1 packet').toBeLessThanOrEqual(1);
    expect(allB1.length, 'Room B Host khong nhan nhieu hon 1 packet').toBeLessThanOrEqual(1);
    expect(allB2.length, 'Room B Guest khong nhan nhieu hon 1 packet').toBeLessThanOrEqual(1);

    for (const pkt of [...allA1, ...allA2, ...allB1, ...allB2]) {
      expect(pkt.type, `Packet ro ri cheo phong: type=${pkt.type}`).toBe('STATE_DELTA');
    }
  });

  it('[TC-NET05.4/Adversarial] Dong hoan toan Room A — Room B tiep tuc nhan broadcast binh thuong', async () => {
    const roomA = await setupRoom('hostA-tc4', 'guestA-tc4');
    const roomB = await setupRoom('hostB-tc4', 'guestB-tc4');

    roomA.wsHost.close();
    roomA.wsGuest.close();
    await new Promise((r) => setTimeout(r, 100));

    const b2Delta = collectN(roomB.wsGuest, 1, 2000);
    roomB.wsHost.send(JSON.stringify({
      type: 'INTENT',
      roomCode: roomB.roomCode,
      playerId: 'hostB-tc4',
      intent: { type: 'INTENT_ROLL' },
    }));

    const [b2Msg] = await b2Delta;
    expect(
      b2Msg?.type,
      'Room B Guest phai nhan STATE_DELTA sau khi Room A dong',
    ).toBe('STATE_DELTA');
  });
});