// [TC-STRESS-10/MSS][IMP-165/MSS]
// Integration Stress & Concurrency Test: 10 Clients across 3 Parallel Rooms
// 1. Race Condition (Bão Join): 5 clients gửi JOIN_ROOM đồng thời vào Phòng A.
//    - 3 clients nhận slot ['p2', 'p3', 'p4'], 2 clients nhận ERROR 'ROOM_FULL'.
//    - Tất cả 4 người trong Phòng A nhận được broadcast LOBBY_UPDATE chính xác.
// 2. Multi-Room Concurrency: 10 clients hoạt động đồng thời trên 3 phòng:
//    - Phòng A: 4 clients (p1, p2, p3, p4)
//    - Phòng B: 4 clients (p1, p2, p3, p4)
//    - Phòng C: 2 clients (p1, p2)
// 3. Zero Cross-Talk: Sự kiện tại Phòng A tuyệt đối không rò rỉ sang Phòng B và Phòng C.
// 4. Teardown: Đóng sạch toàn bộ 10 sockets và WssServer.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import type { WsServerMessage, WsClientMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3166;
let server: WssServer;
const allSockets: WebSocket[] = [];

beforeAll(() => {
  server = new WssServer({
    port: TEST_PORT,
    botTurnDelayMs: 30_000,
    gracePeriodMs: 200,
  });
});

afterAll(async () => {
  for (const s of allSockets) {
    try {
      s.removeAllListeners();
      if (s.readyState === WebSocket.OPEN || s.readyState === WebSocket.CONNECTING) {
        s.close();
      }
    } catch {
      /* safe-ignore */
    }
  }
  allSockets.length = 0;
  await server.close();
});

function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    allSockets.push(ws);
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
      if (msgs.length >= count) {
        clearTimeout(timer);
        socket.off('message', onMsg);
        resolve(msgs);
      }
    };
    socket.on('message', onMsg);
  });
}

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

async function createRoomViaWs(ws: WebSocket, playerId: string): Promise<string> {
  const pending = collectMessages(ws, 2);
  ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerId }));
  const [created] = await pending;
  if (created?.type !== 'ROOM_CREATED') {
    throw new Error(`Expected ROOM_CREATED, got: ${created?.type}`);
  }
  return created.roomCode;
}

describe('[STRESS-10] 10 Clients Concurrency & Data Isolation (IMP-165)', () => {
  // Biến lưu trữ 10 sockets của 3 phòng cho các assertions toàn hệ thống
  let roomCodeA: string;
  let roomCodeB: string;
  let roomCodeC: string;

  let wsHostA: WebSocket;
  const wsGuestsA: WebSocket[] = [];

  let wsHostB: WebSocket;
  const wsGuestsB: WebSocket[] = [];

  let wsHostC: WebSocket;
  let wsGuestC: WebSocket;

  it('[TC-STRESS.1] Race Condition (Bão Join): 5 clients gửi JOIN_ROOM đồng thời vào Phòng A', async () => {
    // 1. Host A tạo Phòng A
    wsHostA = await openSocket();
    roomCodeA = await createRoomViaWs(wsHostA, 'p1');
    expect(roomCodeA).toBeDefined();

    // 2. Mở 5 sockets cho 5 clients chuẩn bị "bão join"
    const burstSockets: WebSocket[] = [];
    for (let i = 0; i < 5; i++) {
      burstSockets.push(await openSocket());
    }

    // Đăng ký listener thu thập phản hồi đầu tiên cho mỗi socket
    // Thu thập tất cả messages trên wsHostA trong lúc bão join diễn ra
    const hostLobbyUpdates: WsServerMessage[] = [];
    const hostMsgHandler = (data: Buffer | string): void => {
      const parsed = JSON.parse(data.toString()) as WsServerMessage;
      if (parsed.type === 'LOBBY_UPDATE') hostLobbyUpdates.push(parsed);
    };
    wsHostA.on('message', hostMsgHandler);

    // Lưu lại toàn bộ messages nhận được trên 5 sockets
    const socketAllMessages: Map<WebSocket, WsServerMessage[]> = new Map();
    for (const ws of burstSockets) {
      socketAllMessages.set(ws, []);
      ws.on('message', (data: Buffer | string) => {
        socketAllMessages.get(ws)!.push(JSON.parse(data.toString()) as WsServerMessage);
      });
    }

    // 3. Đồng thời gửi JOIN_ROOM vào Phòng A trong cùng 1 mili-giây
    await Promise.all(
      burstSockets.map((ws) =>
        new Promise<void>((resolve) => {
          ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: roomCodeA, playerId: 'p2' }));
          resolve();
        })
      )
    );

    // Chờ một khoảng thời gian ngắn để server xử lý và broadcast toàn bộ
    await new Promise((resolve) => setTimeout(resolve, 300));
    wsHostA.off('message', hostMsgHandler);

    // 4. Phân loại phản hồi: thành công (ROOM_JOINED) và bị từ chối (ERROR ROOM_FULL)
    const successJoins: { ws: WebSocket; playerId: string }[] = [];
    const rejectedJoins: { ws: WebSocket; reasonCode?: string }[] = [];

    for (const ws of burstSockets) {
      const msgs = socketAllMessages.get(ws)!;
      const joined = msgs.find((m) => m.type === 'ROOM_JOINED');
      const err = msgs.find((m) => m.type === 'ERROR');

      if (joined && joined.type === 'ROOM_JOINED') {
        successJoins.push({ ws, playerId: joined.playerId });
      } else if (err && err.type === 'ERROR') {
        rejectedJoins.push({ ws, reasonCode: err.reasonCode });
      }
    }

    // Assert: Đúng 3 người đầu tiên nhận slot, 2 người nhận ROOM_FULL
    expect(successJoins).toHaveLength(3);
    expect(rejectedJoins).toHaveLength(2);

    // Assert: 3 người thành công nhận đủ bộ slot ['p2', 'p3', 'p4']
    const assignedSlots = successJoins.map((s) => s.playerId).sort();
    expect(assignedSlots).toEqual(['p2', 'p3', 'p4']);

    // Assert: 2 người thất bại nhận lý do ROOM_FULL
    for (const rej of rejectedJoins) {
      expect(rej.reasonCode).toBe('ROOM_FULL');
    }

    // Lưu lại 3 khách thành công của Phòng A
    wsGuestsA.push(...successJoins.map((s) => s.ws));

    // Đóng 2 socket bị từ chối sạch sẽ
    for (const rej of rejectedJoins) {
      rej.ws.close();
    }

    // 5. Assert: Cả 4 người trong Phòng A (Host + 3 Khách) đều nhận được broadcast LOBBY_UPDATE chính xác
    expect(hostLobbyUpdates.length).toBeGreaterThanOrEqual(1);
    const lastHostUpdate = hostLobbyUpdates[hostLobbyUpdates.length - 1];
    expect(lastHostUpdate?.type).toBe('LOBBY_UPDATE');
    if (lastHostUpdate?.type === 'LOBBY_UPDATE') {
      expect(lastHostUpdate.roomCode).toBe(roomCodeA);
      expect(lastHostUpdate.players).toHaveLength(4);
      expect(lastHostUpdate.players.map((p) => p.id).sort()).toEqual(['p1', 'p2', 'p3', 'p4']);
    }

    // Kiểm tra từng khách trong 3 khách thành công đều nhận được LOBBY_UPDATE chứa đủ 4 người
    for (const s of successJoins) {
      const msgs = socketAllMessages.get(s.ws)!;
      const lobbyMsg = msgs.filter((m) => m.type === 'LOBBY_UPDATE').pop();
      expect(lobbyMsg, `Client ${s.playerId} phải nhận được broadcast LOBBY_UPDATE`).toBeDefined();
      if (lobbyMsg && lobbyMsg.type === 'LOBBY_UPDATE') {
        expect(lobbyMsg.roomCode).toBe(roomCodeA);
        expect(lobbyMsg.players).toHaveLength(4);
        expect(lobbyMsg.players.map((p) => p.id).sort()).toEqual(['p1', 'p2', 'p3', 'p4']);
      }
    }

    // Phòng A hiện có: Host A + 3 Khách = 4 người
    const roomA = server.getRoomManager().getRoom(roomCodeA);
    expect(roomA?.players).toHaveLength(4);
    expect(roomA?.players.map((p) => p.id).sort()).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('[TC-STRESS.2] Tạo đồng thời 3 phòng song song với 10 clients: Phòng A (4), Phòng B (4), Phòng C (2)', async () => {
    // Phòng A đã có 4 clients (wsHostA + 3 wsGuestsA).
    expect(wsGuestsA).toHaveLength(3);

    // Tạo Phòng B: 1 Host + 3 Khách (đủ 4 người p1, p2, p3, p4)
    wsHostB = await openSocket();
    roomCodeB = await createRoomViaWs(wsHostB, 'p1');

    for (let i = 2; i <= 4; i++) {
      const wsGuest = await openSocket();
      const joinPending = collectMessages(wsGuest, 1);
      wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: roomCodeB, playerId: 'p2' }));
      const [reply] = await joinPending;
      expect(reply?.type).toBe('ROOM_JOINED');
      if (reply?.type === 'ROOM_JOINED') {
        expect(reply.playerId).toBe(`p${i}`);
      }
      wsGuestsB.push(wsGuest);
    }
    expect(wsGuestsB).toHaveLength(3);

    // Tạo Phòng C: 1 Host + 1 Khách (2 người p1, p2)
    wsHostC = await openSocket();
    roomCodeC = await createRoomViaWs(wsHostC, 'p1');

    wsGuestC = await openSocket();
    const joinCPending = collectMessages(wsGuestC, 1);
    wsGuestC.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: roomCodeC, playerId: 'p2' }));
    const [replyC] = await joinCPending;
    expect(replyC?.type).toBe('ROOM_JOINED');
    if (replyC?.type === 'ROOM_JOINED') {
      expect(replyC.playerId).toBe('p2');
    }

    // Đợi 100ms để tất cả các gói tin sảnh tự nhiên (setup) hoàn tất trên server
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Dọn sạch listeners và buffer tạm trên toàn bộ sockets trước khi vào bài test rò rỉ dữ liệu
    const allActiveSockets = [wsHostA, ...wsGuestsA, wsHostB, ...wsGuestsB, wsHostC, wsGuestC];
    for (const ws of allActiveSockets) {
      ws.removeAllListeners('message');
    }

    // Tổng kiểm tra số lượng clients đang hoạt động:
    // Phòng A: 1 Host + 3 Khách = 4
    // Phòng B: 1 Host + 3 Khách = 4
    // Phòng C: 1 Host + 1 Khách = 2
    // Tổng cộng = 10 clients
    const activeClientsRoomA = [wsHostA, ...wsGuestsA];
    const activeClientsRoomB = [wsHostB, ...wsGuestsB];
    const activeClientsRoomC = [wsHostC, wsGuestC];

    expect(activeClientsRoomA).toHaveLength(4);
    expect(activeClientsRoomB).toHaveLength(4);
    expect(activeClientsRoomC).toHaveLength(2);

    const total10Clients = [...activeClientsRoomA, ...activeClientsRoomB, ...activeClientsRoomC];
    expect(total10Clients).toHaveLength(10);
    for (const ws of total10Clients) {
      expect(ws.readyState).toBe(WebSocket.OPEN);
    }
  });

  it('[TC-STRESS.3] Test Cô lập dữ liệu: Sự kiện từ Phòng A tuyệt đối không lọt sang Phòng B và Phòng C', async () => {
    // Chuẩn bị listener đo rò rỉ trên TẤT CẢ 4 sockets của Phòng B và 2 sockets của Phòng C
    const roomBSockets = [wsHostB, ...wsGuestsB];
    const roomCSockets = [wsHostC, wsGuestC];

    const leakListenersB = roomBSockets.map((ws) => collectForMs(ws, 600));
    const leakListenersC = roomCSockets.map((ws) => collectForMs(ws, 600));

    // Đăng ký listener nhận sự kiện hợp lệ trong Phòng A
    const guestA1Event = collectMessages(wsGuestsA[0]!, 1, 3000);

    // Client ở Phòng A (Host A) gửi sự kiện EMOTE
    wsHostA.send(
      JSON.stringify({
        type: 'EMOTE',
        roomCode: roomCodeA,
        playerId: 'p1',
        emoteId: 'laugh',
      })
    );

    // Assert: Khách trong Phòng A nhận được EMOTE
    const [receivedByA1] = await guestA1Event;
    expect(receivedByA1?.type).toBe('PLAYER_EMOTE');
    if (receivedByA1?.type === 'PLAYER_EMOTE') {
      expect(receivedByA1.playerId).toBe('p1');
      expect(receivedByA1.emoteId).toBe('laugh');
    }

    // Thu thập toàn bộ packets rò rỉ tại Phòng B và C
    const leakedPacketsB = await Promise.all(leakListenersB);
    const leakedPacketsC = await Promise.all(leakListenersC);

    // Assert: Tuyệt đối KHÔNG có bất kỳ packet nào rò rỉ sang 4 sockets Phòng B
    for (let i = 0; i < leakedPacketsB.length; i++) {
      expect(
        leakedPacketsB[i],
        `Socket ${i} của Phòng B bị rò rỉ ${leakedPacketsB[i]!.length} packets từ Phòng A!`
      ).toHaveLength(0);
    }

    // Assert: Tuyệt đối KHÔNG có bất kỳ packet nào rò rỉ sang 2 sockets Phòng C
    for (let i = 0; i < leakedPacketsC.length; i++) {
      expect(
        leakedPacketsC[i],
        `Socket ${i} của Phòng C bị rò rỉ ${leakedPacketsC[i]!.length} packets từ Phòng A!`
      ).toHaveLength(0);
    }
  });

  it('[TC-STRESS.4] Đóng sạch toàn bộ 10 sockets và giải phóng tài nguyên (zero hanging processes)', async () => {
    const total10Clients = [
      wsHostA,
      ...wsGuestsA,
      wsHostB,
      ...wsGuestsB,
      wsHostC,
      wsGuestC,
    ];

    expect(total10Clients).toHaveLength(10);

    // Đóng tất cả 10 sockets
    for (const ws of total10Clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }

    // Đợi tất cả socket chuyển sang trạng thái CLOSED
    await new Promise((resolve) => setTimeout(resolve, 300));

    for (const ws of total10Clients) {
      expect(ws.readyState).toBe(WebSocket.CLOSED);
    }
  });
});
