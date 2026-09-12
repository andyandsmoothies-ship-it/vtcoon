// [UC-GAME-001/MSS][UC-GAME-008/MSS][TC-RCAP/MSS] Round Cap 30 & Game Over Integration Tests
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { WebSocket } from 'ws';
import {
  createRoom,
  createPlayer,
  MAX_ROUNDS,
  isRoomGameOver,
} from '../../src/domain/room';
import { RoomManager } from '../../src/server/room_manager';
import { WssServer } from '../../src/server/network/wss_server';
import { BotTurnScheduler } from '../../src/server/network/bot_turn_scheduler';
import { TurnTimeoutScheduler } from '../../src/server/network/turn_timeout_scheduler';
import { IntentMutex } from '../../src/server/network/intent_mutex';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster';
import { SessionManager } from '../../src/server/session_manager';
import type { WsServerMessage } from '../../src/server/network/network_types';

describe('[TC-RCAP.1/Domain] isRoomGameOver Unit & Boundary Contract', () => {
  it('Tra ve false khi phong chua bat dau ke ca khi roundCount > 30 hoac con 1 nguoi', () => {
    const room = createRoom('p1');
    room.started = false;
    room.roundCount = 35;
    expect(isRoomGameOver(room)).toBe(false);

    room.players = [createPlayer('p1')];
    expect(isRoomGameOver(room)).toBe(false);
  });

  it('Tra ve false khi phong dang choi, du 2 nguoi con song va roundCount <= 30', () => {
    const room = createRoom('p1');
    room.players.push(createPlayer('p2'));
    room.started = true;
    room.roundCount = 1;
    expect(isRoomGameOver(room)).toBe(false);

    // Kiem tra gia tri bien tai roundCount = 30
    room.roundCount = 30;
    expect(isRoomGameOver(room)).toBe(false);
  });

  it('Tra ve true khi phong dang choi va roundCount vuot qua 30 (roundCount = 31)', () => {
    const room = createRoom('p1');
    room.players.push(createPlayer('p2'), createPlayer('p3'), createPlayer('p4'));
    room.started = true;

    // Tai roundCount = 30: Chua ket thuc
    room.roundCount = 30;
    expect(isRoomGameOver(room)).toBe(false);

    // Tai roundCount = 31: Ket thuc van dau do cham gioi han Max Rounds
    room.roundCount = 31;
    expect(isRoomGameOver(room)).toBe(true);
    expect(MAX_ROUNDS).toBe(30);
  });

  it('Tra ve true khi chi con 1 nguoi chua pha san ke ca khi moi o round 1', () => {
    const room = createRoom('p1');
    room.players.push(createPlayer('p2'));
    room.started = true;
    room.roundCount = 1;

    room.players[1]!.bankrupt = true;
    expect(isRoomGameOver(room)).toBe(true);
  });

  it('Xu ly an toan khi roundCount la undefined (mac dinh khong ket thuc neu con 2 nguoi)', () => {
    const room = createRoom('p1');
    room.players.push(createPlayer('p2'));
    room.started = true;
    delete room.roundCount;

    expect(isRoomGameOver(room)).toBe(false);
  });

  it('Nhan dien roundCount hoac round dat 31 deu ket thuc van dau', () => {
    const room = createRoom('p1');
    room.players.push(createPlayer('p2'));
    room.started = true;
    delete room.roundCount;
    room.round = 31;
    expect(isRoomGameOver(room)).toBe(true);
  });
});

describe('[TC-RCAP.2/Integration] WssServer Game Over Trigger at Round Cap', () => {
  const TEST_PORT = 3198;
  let server: WssServer;
  const activeSockets: WebSocket[] = [];

  beforeAll(() => {
    server = new WssServer({ port: TEST_PORT, turnTimeoutMs: 60000 });
  });

  afterEach(() => {
    for (const ws of activeSockets) {
      try {
        ws.close();
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

  function collectN(socket: WebSocket, n: number, timeoutMs = 4000): Promise<WsServerMessage[]> {
    return new Promise((resolve, reject) => {
      const msgs: WsServerMessage[] = [];
      const timer = setTimeout(() => {
        reject(new Error(`Timeout: nhan ${msgs.length}/${n} msgs: ${JSON.stringify(msgs)}`));
      }, timeoutMs);

      const onMsg = (data: Buffer | string): void => {
        msgs.push(JSON.parse(data.toString()) as WsServerMessage);
        if (msgs.length >= n) {
          clearTimeout(timer);
          socket.off('message', onMsg);
          resolve(msgs);
        }
      };
      socket.on('message', onMsg);
    });
  }

  it('WssServer phat thong bao GAME_OVER va dong phong khi roundCount vuot qua 30', async () => {
    const wsHost = await openSocket();
    const pHost = collectN(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-rcap' }));
    const [createdMsg] = await pHost;
    if (createdMsg?.type !== 'ROOM_CREATED') throw new Error('Expected ROOM_CREATED');
    const roomCode = createdMsg.roomCode;

    const wsGuest = await openSocket();
    const pGuest = collectN(wsGuest, 1);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-rcap', roomCode }));
    await pGuest;

    // Bat dau game: thu ROOM_STARTED va STATE_DELTA (2 msgs)
    const pStart = collectN(wsHost, 2);
    wsHost.send(JSON.stringify({ type: 'START_GAME', playerId: 'host-rcap', roomCode }));
    await pStart;

    // Lay room tu roomManager cua server va can thiep roundCount = 31 (Zero Dirty Cast)
    const rm = server.roomManager;
    const room = rm.getRoom(roomCode);
    expect(room).toBeDefined();
    room!.roundCount = 31;

    // Khi mot nguoi choi thuc hien hanh dong ket thuc luot
    const pOver = collectN(wsHost, 1);
    wsHost.send(JSON.stringify({
      type: 'INTENT',
      playerId: 'host-rcap',
      roomCode,
      intent: { type: 'INTENT_ROLL' },
    }));

    const [overMsg] = await pOver;
    expect(overMsg?.type).toBe('GAME_OVER');
    if (overMsg?.type === 'GAME_OVER') {
      expect(overMsg.roomCode).toBe(roomCode);
      expect(overMsg.leaderboard).toBeDefined();
      expect(overMsg.leaderboard.length).toBeGreaterThanOrEqual(2);
    }

    // Phong phai duoc dong sau khi game over
    expect(rm.getRoom(roomCode)).toBeUndefined();
  });
});

describe('[TC-RCAP.3/Integration] Bot & Timeout Schedulers Handle Round Cap', () => {
  it('BotTurnScheduler goi onGameOver khi roundCount vuot qua 30', async () => {
    const rm = new RoomManager();
    const intentMutex = new IntentMutex();
    const sessionManager = new SessionManager();
    const broadcaster = new DeltaBroadcaster(rm, sessionManager, () => {});
    const onGameOverMock = vi.fn();

    const scheduler = new BotTurnScheduler({
      rooms: rm,
      intentMutex,
      broadcaster,
      onGameOver: onGameOverMock,
    });

    const room = rm.createRoom('bot-host');
    rm.joinRoom(room.roomCode, 'bot-p2');
    rm.startGame(room.roomCode);

    // Bien bot-host thanh Bot va set roundCount = 31
    room.players[0]!.isBot = true;
    room.roundCount = 31;

    scheduler.scheduleBotTurn(room.roomCode);

    // Doi bot turn timer (800ms)
    await new Promise((r) => setTimeout(r, 1000));

    expect(onGameOverMock).toHaveBeenCalledWith(room.roomCode);
  });

  it('TurnTimeoutScheduler goi onGameOver khi roundCount vuot qua 30 sau khi timeout xu ly', async () => {
    const rm = new RoomManager();
    const intentMutex = new IntentMutex();
    const sessionManager = new SessionManager();
    const broadcaster = new DeltaBroadcaster(rm, sessionManager, () => {});
    const onGameOverMock = vi.fn();

    const scheduler = new TurnTimeoutScheduler({
      rooms: rm,
      intentMutex,
      broadcaster,
      onGameOver: onGameOverMock,
      onScheduleBotTurn: () => {},
      defaultTimeoutMs: 50, // Timeout nhanh 50ms cho test
    });

    const room = rm.createRoom('human-afk');
    rm.joinRoom(room.roomCode, 'human-p2');
    rm.startGame(room.roomCode);

    // Dat roundCount = 31
    room.roundCount = 31;
    scheduler.scheduleTurnTimeout(room.roomCode, 50);

    // Doi timeout chay
    await new Promise((r) => setTimeout(r, 150));

    expect(onGameOverMock).toHaveBeenCalledWith(room.roomCode);
  });

  it('BotTurnScheduler goi onScheduleTurnTimeout khi chuyen luot sang Human player', async () => {
    const rm = new RoomManager();
    const intentMutex = new IntentMutex();
    const sessionManager = new SessionManager();
    const broadcaster = new DeltaBroadcaster(rm, sessionManager, () => {});
    const onTimeoutMock = vi.fn();

    const scheduler = new BotTurnScheduler({
      rooms: rm,
      intentMutex,
      broadcaster,
      onGameOver: () => {},
      onScheduleTurnTimeout: onTimeoutMock,
    });

    const room = rm.createRoom('bot-p1');
    rm.joinRoom(room.roomCode, 'human-p2');
    rm.startGame(room.roomCode);

    // Bot o luot 0, luot ke tiep la human-p2
    room.players[0]!.isBot = true;
    scheduler.scheduleBotTurn(room.roomCode);

    await new Promise((r) => setTimeout(r, 1000));
    expect(onTimeoutMock).toHaveBeenCalledWith(room.roomCode);
  });
});
