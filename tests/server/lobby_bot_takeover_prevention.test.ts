// [UC-GAME-008/MSS][UC-GAME-006/MSS][TC-NET04.3/Adversarial]
// Adversarial test suite: Chống cướp quyền điều khiển người chơi (Anti-Bot Takeover Invariant)
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import { SessionState } from '../../src/server/session_manager.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { handleWsMessage } from '../../src/client/network/use_game_ws.js';
import { saveReconnectToken, getReconnectToken } from '../../src/client/network/reconnect_token.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3130;
let server: WssServer;
const openSockets: WebSocket[] = [];

beforeAll(() => {
  server = new WssServer({ port: TEST_PORT, gracePeriodMs: 200 });
});

afterEach(() => {
  for (const ws of openSockets) {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  }
  openSockets.length = 0;
});

afterAll(async () => {
  await server.close();
});

function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    openSockets.push(ws);
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

describe('[Adversarial] Bảo Vệ Người Chơi Human Không Bị Biến Thành Bot Ngoài Ý Muốn', () => {
  it('[UC-GAME-008/ADV-1] Hết ân hạn trong Sảnh Chờ (!room.started) KHÔNG ĐƯỢC biến Host thành Bot', async () => {
    const wsHost = await openSocket();
    const hostInitPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-lobby' }));
    const [roomCreated] = await hostInitPromise;
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const roomCode = roomCreated.roomCode;

    // Kích hoạt giả lập grace expired trong khi ván đấu chưa bắt đầu
    server.getReconnectManager().handleGraceExpired(roomCode, 'host-lobby');

    const room = server.getRoomManager().getRoom(roomCode);
    expect(room?.started).toBe(false);
    const hostPlayer = room?.players.find((p) => p.id === 'host-lobby');
    // Bắt buộc: Host không được bị biến thành Bot khi còn ở Sảnh Chờ!
    expect(hostPlayer?.isBot).toBe(false);

    wsHost.close();
  });

  it('[UC-GAME-008/ADV-2] Socket người chơi đang KẾT NỐI thì KHÔNG ĐƯỢC phép takeover dù handleGraceExpired bị gọi', async () => {
    const wsHost = await openSocket();
    const hostInitPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-alive' }));
    const [roomCreated] = await hostInitPromise;
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const roomCode = roomCreated.roomCode;

    // Gọi handleGraceExpired khi socket vẫn đang OPEN
    server.getReconnectManager().handleGraceExpired(roomCode, 'host-alive');

    const room = server.getRoomManager().getRoom(roomCode);
    const hostPlayer = room?.players.find((p) => p.id === 'host-alive');
    expect(hostPlayer?.isBot).toBe(false);

    const session = server.getSessionManager().getSession('host-alive');
    expect(session?.state).toBe(SessionState.Connected);

    wsHost.close();
  });

  it('[UC-GAME-008/ADV-3] Bắt đầu trận đấu (START_GAME) phải triệt tiêu cờ isBot của Host và người chơi đang online', async () => {
    const wsHost = await openSocket();
    const hostInitPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-sg' }));
    const [roomCreated] = await hostInitPromise;
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const roomCode = roomCreated.roomCode;

    const room = server.getRoomManager().getRoom(roomCode);
    if (!room) throw new Error('Room expected');

    // Giả lập tình huống bất thường: Host từng bị gán cờ isBot = true trước khi bấm bắt đầu
    const hostP = room.players.find((p) => p.id === 'host-sg');
    if (hostP) hostP.isBot = true;

    // Gửi START_GAME kèm 1 Bot AI
    const startPromise = collectMessages(wsHost, 2); // ROOM_STARTED + STATE_DELTA
    wsHost.send(JSON.stringify({
      type: 'START_GAME',
      roomCode,
      playerId: 'host-sg',
      bots: [{ id: 'bot_2', name: 'Bot AI 2', personality: 'Balanced' }],
    }));
    await startPromise;

    // Kiểm tra state trên server
    expect(room.started).toBe(true);
    expect(hostP?.isBot).toBe(false);

    // Lượt hiện tại là của Host (Turn 0), không được là Bot
    const curr = room.players[room.currentPlayerIndex];
    expect(curr?.id).toBe('host-sg');
    expect(curr?.isBot).toBe(false);

    wsHost.close();
  });

  it('[UC-GAME-008/ADV-4] applyDeltaToStore xóa cờ isBot: true về false khi nhận Delta của người chơi Human', () => {
    const store = useGameStore;
    store.setState({
      playersInfo: {
        'p1': {
          id: 'p1',
          name: 'Đại Gia Chủ Sảnh (P1)',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
          mortgagedProperties: [],
          isBot: true, // Giả lập trạng thái cũ bị lỗi gán isBot
        },
      },
    });

    // Nhận delta từ server (Human player không có isBot hoặc isBot: false)
    applyDeltaToStore({
      tick: 1,
      cells: [],
      players: [
        {
          id: 'p1',
          position: 0,
          balance: 15000,
          // isBot là undefined theo buildDeltaFromRoom khi isBot = false
        },
      ],
    }, store);

    const playerInStore = store.getState().playersInfo['p1'];
    expect(playerInStore?.isBot).toBe(false);
  });

  it('[UC-GAME-008/ADV-5] Host gửi PONG duy trì phiên trong Sảnh Chờ → bấm Bắt Đầu Trận Đấu mượt mà không bị cướp quyền', async () => {
    const wsHost = await openSocket();
    const hostInitPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-heartbeat' }));
    const [roomCreated] = await hostInitPromise;
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const roomCode = roomCreated.roomCode;

    // Giả lập client phản hồi PONG khi ở sảnh chờ
    wsHost.send(JSON.stringify({ type: 'PONG', playerId: 'host-heartbeat', roomCode }));

    // Host bấm Bắt Đầu Trận Đấu với 3 Bot AI
    const startPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({
      type: 'START_GAME',
      roomCode,
      playerId: 'host-heartbeat',
      bots: [
        { id: 'bot_2', name: 'Bot AI 2', personality: 'Balanced' },
        { id: 'bot_3', name: 'Bot AI 3', personality: 'Aggressive' },
        { id: 'bot_4', name: 'Bot AI 4', personality: 'Passive' },
      ],
    }));
    await startPromise;

    const room = server.getRoomManager().getRoom(roomCode);
    expect(room?.started).toBe(true);
    const hostP = room?.players.find((p) => p.id === 'host-heartbeat');
    expect(hostP?.isBot).toBe(false);

    // Turn đầu tiên là của Host, không chạy bot loop
    expect(room?.currentPlayerIndex).toBe(0);
    expect(room?.players[0]?.id).toBe('host-heartbeat');
    expect(room?.players[0]?.isBot).toBe(false);

    wsHost.close();
  });

  it('[UC-GAME-008/ADV-6] Người chơi rời phòng ở Sảnh Chờ (LEAVE_ROOM) không kích hoạt PLAYER_BOT_TAKEOVER hay phá sản', async () => {
    const wsHost = await openSocket();
    const hostInitPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-lr' }));
    const [roomCreated] = await hostInitPromise;
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const roomCode = roomCreated.roomCode;

    const wsGuest = await openSocket();
    const guestInitPromise = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-lr', roomCode }));
    await guestInitPromise;

    const room = server.getRoomManager().getRoom(roomCode);
    expect(room?.players).toHaveLength(2);

    // Guest gửi LEAVE_ROOM khi còn ở Sảnh Chờ
    wsGuest.send(JSON.stringify({ type: 'LEAVE_ROOM', roomCode, playerId: 'guest-lr' }));
    await new Promise((r) => setTimeout(r, 100));

    // Guest được gỡ khỏi phòng mà không bị gắn cờ bot hay bankrupt
    expect(room?.players).toHaveLength(1);
    expect(room?.players.some((p) => p.id === 'guest-lr')).toBe(false);

    wsHost.close();
    wsGuest.close();
  });


  it('[UC-GAME-008/ADV-8] START_GAME với bots không bao giờ cho phép bot ID trùng với Host ID', async () => {
    const wsHost = await openSocket();
    const hostInitPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-id-safe' }));
    const [roomCreated] = await hostInitPromise;
    if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
    const roomCode = roomCreated.roomCode;

    // Gửi START_GAME với 1 bot cố tình mang id của chính Host
    const startPromise = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({
      type: 'START_GAME',
      roomCode,
      playerId: 'host-id-safe',
      bots: [
        { id: 'host-id-safe', name: 'Malicious Bot', personality: 'Aggressive' },
        { id: 'bot_legit_2', name: 'Legit Bot 2', personality: 'Balanced' },
      ],
    }));
    await startPromise;

    const room = server.getRoomManager().getRoom(roomCode);
    expect(room?.started).toBe(true);

    // Host id 'host-id-safe' phải là Human duy nhất, không bị ghi đè thành bot
    const matching = room?.players.filter((p) => p.id === 'host-id-safe');
    expect(matching).toHaveLength(1);
    expect(matching?.[0]?.isBot).toBe(false);

    wsHost.close();
  });

  it('[UC-GAME-008/ADV-9] RoomManager.startGame luôn đảm bảo reset isBot = false cho Host', () => {
    const rm = server.getRoomManager();
    const room = rm.createRoom('host-rm-test', 'RM9999');
    rm.joinRoom('RM9999', 'guest-rm-test');
    // Cố tình gán isBot = true cho Host trước khi start
    room.players[0]!.isBot = true;

    // Start game kèm 1 bot
    const started = rm.startGame('RM9999', [{ id: 'bot_ai_3', name: 'Bot 3' }]);
    expect(started?.started).toBe(true);
    expect(room.players[0]!.id).toBe('host-rm-test');
    expect(room.players[0]!.isBot).toBe(false);
    // Bot ai 3 là isBot = true
    const botP = room.players.find((p) => p.id === 'bot_ai_3');
    expect(botP?.isBot).toBe(true);
  });

  it('[UC-GAME-008/ADV-10] Khi nhận ERROR ROOM_NOT_FOUND hoặc TOKEN_INVALID, client tự động xóa token và gửi fallback handshake', () => {
    const mockStorage: Record<string, string> = {};
    const origStorage = globalThis.localStorage;
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { for (const k of Object.keys(mockStorage)) delete mockStorage[k]; },
      length: 0,
      key: () => null,
    } as Storage;

    try {
      saveReconnectToken('FAIL01', 'expired-token-xyz');
      expect(getReconnectToken('FAIL01')).toBe('expired-token-xyz');

      const sentMsgs: string[] = [];
      const mockSocket = {
        send: (d: string) => sentMsgs.push(d),
      };
      handleWsMessage(
        { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' },
        {
          roomCode: 'FAIL01',
          playerId: 'p1-host',
          isHost: true,
          socket: mockSocket,
        }
      );
      expect(getReconnectToken('FAIL01')).toBeNull();
      expect(sentMsgs).toHaveLength(1);
      const parsed = JSON.parse(sentMsgs[0]!);
      expect(parsed).toEqual({
        type: 'CREATE_ROOM',
        roomCode: 'FAIL01',
        playerId: 'p1-host',
      });
    } finally {
      globalThis.localStorage = origStorage;
    }
  });

  it('[UC-GAME-008/ADV-11] Khi nhận GAME_OVER, client tự động dọn sạch token trong localStorage', () => {
    const mockStorage: Record<string, string> = {};
    const origStorage = globalThis.localStorage;
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { for (const k of Object.keys(mockStorage)) delete mockStorage[k]; },
      length: 0,
      key: () => null,
    } as Storage;

    try {
      saveReconnectToken('OVER01', 'token-before-gameover');
      expect(getReconnectToken('OVER01')).toBe('token-before-gameover');
      handleWsMessage(
        { type: 'GAME_OVER', roomCode: 'OVER01', leaderboard: [] },
        {
          roomCode: 'OVER01',
          playerId: 'p1',
          socket: { send: () => {} },
        }
      );
      expect(getReconnectToken('OVER01')).toBeNull();
    } finally {
      globalThis.localStorage = origStorage;
    }
  });
});
