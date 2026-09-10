// [TC-NET-BOT-SYNC/MSS][TC-NET-BOT-SYNC/Adversarial]
// Kiểm thử tích hợp: Đồng bộ Bot từ Sảnh Chờ lên Server qua START_GAME & Vòng lặp lượt chơi
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { EnvelopeValidator } from '../../src/server/security/envelope_validator.js';
import { BotPersonality } from '../../src/domain/bot/bot_engine.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3125;
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
    }, 5000);

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

describe('[EnvelopeValidator] Kiểm tra cấu trúc START_GAME với Bots', () => {
  const validator = new EnvelopeValidator();

  it('Cho phép START_GAME không có bots', () => {
    const res = validator.validateEnvelope({ type: 'START_GAME', roomCode: 'VT8888', playerId: 'p1' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.message.type).toBe('START_GAME');
    }
  });

  it('Phân tích đúng danh sách bots khi truyền vào START_GAME', () => {
    const res = validator.validateEnvelope({
      type: 'START_GAME',
      roomCode: 'VT8888',
      playerId: 'p1',
      bots: [
        { id: 'bot_2', name: 'Bot AI 2', personality: 'Balanced' },
        { id: 'bot_3', name: 'Bot AI 3', personality: 'Aggressive' },
      ],
    });
    expect(res.success).toBe(true);
    if (res.success && res.message.type === 'START_GAME') {
      expect(res.message.bots).toHaveLength(2);
      expect(res.message.bots?.[0]?.id).toBe('bot_2');
      expect(res.message.bots?.[1]?.personality).toBe('Aggressive');
    }
  });

  it('Bỏ qua phần tử bot không hợp lệ hoặc id rỗng trong mảng bots', () => {
    const res = validator.validateEnvelope({
      type: 'START_GAME',
      roomCode: 'VT8888',
      playerId: 'p1',
      bots: ['invalid_string', null, { id: '' }, { id: '   ' }, { id: 'bot_4' }],
    });
    expect(res.success).toBe(true);
    if (res.success && res.message.type === 'START_GAME') {
      expect(res.message.bots).toHaveLength(1);
      expect(res.message.bots?.[0]?.id).toBe('bot_4');
    }
  });
});

describe('[RoomManager] Quản lý Bot và Khởi động ván đấu với Bot', () => {
  it('[UC-GAME-002/MSS] startGame với danh sách bots khởi tạo đúng số lượng người chơi', () => {
    const rm = new RoomManager(42);
    const room = rm.createRoom('host1', 'ROOMB1');
    expect(room.players).toHaveLength(1);

    const started = rm.startGame('ROOMB1', [
      { id: 'bot_2', personality: 'Balanced' },
      { id: 'bot_3', personality: 'Aggressive' },
      { id: 'bot_4', personality: 'Passive' },
    ]);

    expect(started).toBeDefined();
    expect(started?.started).toBe(true);
    expect(started?.players).toHaveLength(4);
    expect(started?.players[0]?.isBot).toBe(false);
    expect(started?.players[1]?.isBot).toBe(true);
    expect(started?.players[2]?.isBot).toBe(true);
    expect(started?.players[3]?.isBot).toBe(true);
    expect(rm.getBotPersonality('ROOMB1', 'bot_3')).toBe(BotPersonality.Aggressive);
    expect(rm.getBotPersonality('ROOMB1', 'bot_4')).toBe(BotPersonality.Passive);
  });

  it('[UC-GAME-003/A2] startGame khi chỉ có 1 người chơi và không có bot bị từ chối undefined', () => {
    const rm = new RoomManager(42);
    rm.createRoom('solo_host', 'SOLO01');
    const result = rm.startGame('SOLO01');
    expect(result).toBeUndefined();
  });

  it('addBot và removeBot hoạt động chính xác trước khi trận đấu bắt đầu', () => {
    const rm = new RoomManager(42);
    const room = rm.createRoom('host2', 'BOTM01');
    const bot = rm.addBot('BOTM01', 'custom_bot', BotPersonality.Aggressive);
    expect(bot).toBeDefined();
    expect(bot?.isBot).toBe(true);
    expect(room.players).toHaveLength(2);
    expect(rm.getBotPersonality('BOTM01', 'custom_bot')).toBe(BotPersonality.Aggressive);

    const removed = rm.removeBot('BOTM01', 'custom_bot');
    expect(removed).toBe(true);
    expect(room.players).toHaveLength(1);
  });
});

describe('[WssServer] Tích hợp WebSocket: Khởi động phòng với Bot AI giải quyết NOT_ENOUGH_PLAYERS', () => {
  it('[TC-NET-BOT-SYNC.1/MSS] Host tạo phòng, gửi START_GAME kèm danh sách Bot -> Bắt đầu thành công', async () => {
    const ws = await openSocket();

    // 1. Host tạo phòng VT8888
    const initWait = collectMessages(ws, 2);
    ws.send(JSON.stringify({
      type: 'CREATE_ROOM',
      roomCode: 'VT8888',
      playerId: 'p1',
    }));
    await initWait;

    // 2. Host gửi START_GAME kèm 3 bot (tương ứng với Screenshot 1)
    const startWait = collectMessages(ws, 2);
    ws.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: 'VT8888',
      playerId: 'p1',
      bots: [
        { id: 'bot_2', name: 'Bot AI 2', personality: 'Balanced' },
        { id: 'bot_3', name: 'Bot AI 3', personality: 'Aggressive' },
        { id: 'bot_4', name: 'Bot AI 4', personality: 'Passive' },
      ],
    }));

    const [msg1, msg2] = await startWait;
    expect([msg1?.type, msg2?.type]).toContain('ROOM_STARTED');
    expect([msg1?.type, msg2?.type]).toContain('STATE_DELTA');

    // Xác minh server room có đầy đủ 4 người chơi
    const room = server.getRoomManager().getRoom('VT8888');
    expect(room).toBeDefined();
    expect(room?.started).toBe(true);
    expect(room?.players).toHaveLength(4);
    expect(room?.players[1]?.isBot).toBe(true);
    expect(room?.players[2]?.isBot).toBe(true);
    expect(room?.players[3]?.isBot).toBe(true);
  });

  it('[TC-NET-BOT-SYNC.2-inv/Adversarial] Host gửi START_GAME không có bot khi phòng chỉ có 1 người -> Bị từ chối NOT_ENOUGH_PLAYERS', async () => {
    const ws = await openSocket();

    const initWait = collectMessages(ws, 2);
    ws.send(JSON.stringify({
      type: 'CREATE_ROOM',
      roomCode: 'SOLO99',
      playerId: 'p1_solo',
    }));
    await initWait;

    // Host gửi START_GAME không kèm bot
    const startWait = collectMessages(ws, 1);
    ws.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: 'SOLO99',
      playerId: 'p1_solo',
    }));

    const [reply] = await startWait;
    expect(reply?.type).toBe('ERROR');
    if (reply?.type === 'ERROR') {
      expect(reply.reasonCode).toBe('NOT_ENOUGH_PLAYERS');
    }
  });

  it('[TC-NET-BOT-SYNC.3-inv/Adversarial] Non-host gửi START_GAME kèm bot -> Bị từ chối NOT_HOST', async () => {
    const wsHost = await openSocket();
    const wsGuest = await openSocket();

    const hostInit = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({
      type: 'CREATE_ROOM',
      roomCode: 'HOST99',
      playerId: 'legit_host',
    }));
    await hostInit;

    const guestJoin = collectMessages(wsGuest, 2);
    wsGuest.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomCode: 'HOST99',
      playerId: 'sneaky_guest',
    }));
    await guestJoin;

    // Guest cố tình gửi START_GAME kèm bot
    const guestStart = collectMessages(wsGuest, 1);
    wsGuest.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: 'HOST99',
      playerId: 'sneaky_guest',
      bots: [{ id: 'bot_3' }],
    }));

    const [reply] = await guestStart;
    expect(reply?.type).toBe('ERROR');
    if (reply?.type === 'ERROR') {
      expect(reply.reasonCode).toBe('NOT_HOST');
    }
  });
});

describe('[applyDeltaToStore] Đồng bộ danh sách người chơi và Bot vào Client GameStore', () => {
  it('Khởi tạo đúng thông tin người chơi mới khi nhận Delta chứa player chưa đăng ký', () => {
    useGameStore.setState({ playersInfo: {} });
    applyDeltaToStore({
      tick: 1,
      cells: [],
      players: [
        { id: 'p1', position: 0, balance: 15000, isBot: false },
        { id: 'bot_2', position: 0, balance: 15000, isBot: true },
      ],
      currentTurnPlayerId: 'p1',
    });

    const info = useGameStore.getState().playersInfo;
    expect(info['p1']).toBeDefined();
    expect(info['p1']?.balance).toBe(15000);
    expect(info['p1']?.isBot).toBe(false);

    expect(info['bot_2']).toBeDefined();
    expect(info['bot_2']?.balance).toBe(15000);
    expect(info['bot_2']?.isBot).toBe(true);
    expect(useGameStore.getState().currentTurnPlayerId).toBe('p1');
  });
});
