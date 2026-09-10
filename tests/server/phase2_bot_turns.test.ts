// [UC-GAME-008/MSS][UC-GAME-001/MSS][UC-GAME-003/MSS]
// Phase 2 Acceptance Tests: Bot AI Orchestration, Turn Locking & Doubles FSM
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher.js';
import { TurnPhase } from '../../src/domain/room.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { isRollActionDisabled, isEndTurnDisabled } from '../../src/client/ui/ui_helpers.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import type { WsServerMessage, WsClientMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3195;
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

function sendMsg(socket: WebSocket, msg: WsClientMessage): void {
  socket.send(JSON.stringify(msg));
}

function collectMessages(socket: WebSocket, count: number, timeoutMs = 5000): Promise<WsServerMessage[]> {
  return new Promise((resolve, reject) => {
    const msgs: WsServerMessage[] = [];
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${count} messages, got ${msgs.length}`));
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

function waitForMessageType(socket: WebSocket, type: string, timeoutMs = 5000): Promise<WsServerMessage> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: message of type ${type} not received`));
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

describe('[Phase 2] Turn Loop & Bot AI Orchestration', () => {
  // =========================================================================
  // 1. Tự động kích hoạt runBotTurn trên WebSocket Server
  // =========================================================================
  describe('[TC-P2.1/MSS][UC-GAME-008/MSS] Server tự động kích hoạt runBotTurn khi chuyển lượt sang Bot', () => {
    it('Server tự động chạy lượt của Bot khi Human kết thúc lượt', async () => {
      const wsHost = await openSocket();
      const initMsgs = collectMessages(wsHost, 2);
      sendMsg(wsHost, { type: 'CREATE_ROOM', playerId: 'p1_human' });
      const [roomCreated] = await initMsgs;
      if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const roomCode = roomCreated.roomCode;

      // Thêm player 2 vào phòng và đánh dấu là Bot
      const rm = server.getRoomManager();
      rm.joinRoom(roomCode, 'bot_player_1');
      const room = rm.getRoom(roomCode)!;
      room.players[1]!.isBot = true;

      // Host bắt đầu game
      const startedPromise = waitForMessageType(wsHost, 'ROOM_STARTED');
      sendMsg(wsHost, { type: 'START_GAME', roomCode, playerId: 'p1_human' });
      await startedPromise;

      expect(room.started).toBe(true);
      expect(room.currentPlayerIndex).toBe(0); // Lượt của Human

      // Human tung xúc xắc
      sendMsg(wsHost, { type: 'INTENT', roomCode, playerId: 'p1_human', intent: { type: 'INTENT_ROLL' } });
      await new Promise((r) => setTimeout(r, 100));

      // Đảm bảo không bị vướng đổ đôi để lượt chuyển sang Bot 1
      room.players[0]!.consecutiveDoubles = 0;

      // Human kết thúc lượt -> ngay lập tức chuyển sang Bot 1 (index 1)
      sendMsg(wsHost, { type: 'INTENT', roomCode, playerId: 'p1_human', intent: { type: 'INTENT_END_TURN' } });
      await new Promise((r) => setTimeout(r, 50));
      expect(room.currentPlayerIndex).toBe(1);

      // Chờ Bot tự động chạy và hoàn tất lượt (800ms nhịp trễ)
      const startWait = Date.now();
      while (Date.now() - startWait < 3000) {
        await new Promise((r) => setTimeout(r, 100));
        if (room.currentPlayerIndex === 0) break;
      }

      // Xác minh Bot đã hoàn tất lượt và lượt đã quay về Human (index 0)
      expect(room.currentPlayerIndex).toBe(0);
    }, 10000);
  });

  // =========================================================================
  // 2. Chuỗi nhiều Bot liên tiếp (Multi-bot sequence)
  // =========================================================================
  describe('[TC-P2.2/MSS][UC-GAME-008/MSS] Chuỗi 2 Bot liên tiếp tự động chạy tuần tự không bị treo', () => {
    it('2 Bot chạy tuần tự mượt mà và trả quyền điều khiển về Human', async () => {
      const wsHost = await openSocket();
      const initMsgs = collectMessages(wsHost, 2);
      sendMsg(wsHost, { type: 'CREATE_ROOM', playerId: 'p1_boss' });
      const [roomCreated] = await initMsgs;
      if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const roomCode = roomCreated.roomCode;

      const rm = server.getRoomManager();
      rm.joinRoom(roomCode, 'bot_alpha');
      rm.joinRoom(roomCode, 'bot_beta');
      const room = rm.getRoom(roomCode)!;
      room.players[1]!.isBot = true;
      room.players[2]!.isBot = true;

      const startedPromise = waitForMessageType(wsHost, 'ROOM_STARTED');
      sendMsg(wsHost, { type: 'START_GAME', roomCode, playerId: 'p1_boss' });
      await startedPromise;

      expect(room.currentPlayerIndex).toBe(0);

      // Human roll & end turn
      sendMsg(wsHost, { type: 'INTENT', roomCode, playerId: 'p1_boss', intent: { type: 'INTENT_ROLL' } });
      await new Promise((r) => setTimeout(r, 100));

      // Đảm bảo không bị vướng đổ đôi
      room.players[0]!.consecutiveDoubles = 0;

      // Sau khi Human hết lượt, chuyển ngay sang Bot 1 (index 1)
      sendMsg(wsHost, { type: 'INTENT', roomCode, playerId: 'p1_boss', intent: { type: 'INTENT_END_TURN' } });
      await new Promise((r) => setTimeout(r, 50));
      expect(room.currentPlayerIndex).toBe(1);

      // Đợi tối đa 3500ms để cả 2 Bot hoàn tất tuần tự (800ms * 2 + overhead)
      const startWait = Date.now();
      while (Date.now() - startWait < 3500) {
        await new Promise((r) => setTimeout(r, 150));
        if (room.currentPlayerIndex === 0) break;
      }

      // Xác minh lượt đã đi trọn 1 vòng qua Bot 1 và Bot 2 trở về Human
      expect(room.currentPlayerIndex).toBe(0);
      expect(room.players[1]!.isBot).toBe(true);
      expect(room.players[2]!.isBot).toBe(true);
    }, 10000);
  });

  // =========================================================================
  // 3. Khóa Kiểm Soát Nút Thao Tác (UI Action Lock)
  // =========================================================================
  describe('[TC-P2.3/MSS] isRollActionDisabled khóa nút khi đã đổ và không được đổ đôi', () => {
    it('Khóa nút đổ khi hasRolledThisTurn = true và canRollAgain = false', () => {
      const disabled = isRollActionDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: true,
        canRollAgain: false,
      });
      expect(disabled).toBe(true);
    });

    it('Mở nút đổ khi hasRolledThisTurn = true nhưng canRollAgain = true (đổ đôi)', () => {
      const disabled = isRollActionDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: true,
        canRollAgain: true,
      });
      expect(disabled).toBe(false);
    });

    it('Mở nút đổ khi hasRolledThisTurn = false và là lượt của mình', () => {
      const disabled = isRollActionDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: false,
        canRollAgain: false,
      });
      expect(disabled).toBe(false);
    });

    it('Khóa nút đổ khi đang gieo (isRolling) hoặc quân cờ đang đi (isPawnMoving)', () => {
      expect(isRollActionDisabled({
        isRolling: true,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: false,
      })).toBe(true);

      expect(isRollActionDisabled({
        isRolling: false,
        isPawnMoving: true,
        isMyTurn: true,
        hasRolledThisTurn: false,
      })).toBe(true);
    });

    it('[Adversarial Inversion] Khóa nút đổ khi không phải lượt của mình hoặc đã phá sản', () => {
      expect(isRollActionDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: false,
        hasRolledThisTurn: false,
      })).toBe(true);

      expect(isRollActionDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        isBankrupt: true,
        hasRolledThisTurn: false,
      })).toBe(true);
    });
  });

  // =========================================================================
  // 4. Khóa Nút Hết Lượt (End Turn Lock)
  // =========================================================================
  describe('[TC-P2.4/MSS] isEndTurnDisabled khóa nút khi chưa gieo xúc xắc', () => {
    it('Khóa nút hết lượt khi hasRolledThisTurn = false', () => {
      const disabled = isEndTurnDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: false,
      });
      expect(disabled).toBe(true);
    });

    it('Mở nút hết lượt khi hasRolledThisTurn = true và không có hiệu ứng chuyển động', () => {
      const disabled = isEndTurnDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: true,
      });
      expect(disabled).toBe(false);
    });

    it('[Adversarial Inversion] Khóa nút hết lượt khi đang quay xúc xắc hoặc cờ đang di chuyển', () => {
      expect(isEndTurnDisabled({
        isRolling: true,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: true,
      })).toBe(true);

      expect(isEndTurnDisabled({
        isRolling: false,
        isPawnMoving: true,
        isMyTurn: true,
        hasRolledThisTurn: true,
      })).toBe(true);
    });

    it('[Adversarial Inversion] Khóa nút hết lượt khi không phải lượt mình hoặc đã phá sản', () => {
      expect(isEndTurnDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: false,
        hasRolledThisTurn: true,
      })).toBe(true);

      expect(isEndTurnDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        isBankrupt: true,
        hasRolledThisTurn: true,
      })).toBe(true);
    });
  });

  // =========================================================================
  // 5. Quản Lý Trạng Thái hasRolledThisTurn Tại Client Store
  // =========================================================================
  describe('[TC-P2.5/MSS] useGameStore quản lý hasRolledThisTurn', () => {
    it('hasRolledThisTurn mặc định false, chuyển true khi triggerDiceRoll, reset về false khi đổi lượt', () => {
      const store = useGameStore.getState();
      expect(store.hasRolledThisTurn).toBe(false);

      // Khi tung xúc xắc
      store.triggerDiceRoll([3, 4]);
      expect(useGameStore.getState().hasRolledThisTurn).toBe(true);

      // Khi chuyển lượt sang player mới
      store.setCurrentTurnPlayerId('p2_next');
      expect(useGameStore.getState().hasRolledThisTurn).toBe(false);

      // Kiểm tra setter thủ công
      store.setHasRolledThisTurn(true);
      expect(useGameStore.getState().hasRolledThisTurn).toBe(true);
      store.setHasRolledThisTurn(false);
      expect(useGameStore.getState().hasRolledThisTurn).toBe(false);
    });
  });

  // =========================================================================
  // 6. Bảo Lưu Lượt Khi Đổ Đôi (Doubles FSM & INTENT_END_TURN)
  // =========================================================================
  describe('[TC-P2.6/MSS][UC-GAME-001/MSS][UC-GAME-003/MSS] Doubles FSM continueDoubles', () => {
    it('Đổ đôi lần 1: INTENT_END_TURN bảo lưu quyền đi tiếp (phase = WaitingRoll, giữ nguyên index)', () => {
      // Chuỗi xúc xắc cho ra 2-2 (tổng 4, đôi)
      const rng = () => 0.2;
      const rm = new RoomManager(rng);
      const room = rm.createRoom('p1');
      rm.joinRoom(room.roomCode, 'p2');
      rm.startGame(room.roomCode);

      // p1 đổ xúc xắc ra đôi 2-2
      const rollRes = rm.handleRollDice(room.roomCode, 'p1');
      expect(rollRes?.dice.isDouble).toBe(true);
      expect(room.players[0]!.consecutiveDoubles).toBe(1);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);

      // p1 gửi INTENT_END_TURN
      const endRes = dispatchPlayerIntent(rm, room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
      expect(endRes.success).toBe(true);

      // FSM phải bảo lưu lượt: giữ nguyên currentPlayerIndex = 0, phase chuyển về WaitingRoll
      expect(room.currentPlayerIndex).toBe(0);
      expect(room.phase).toBe(TurnPhase.WaitingRoll);
    });

    it('Đổ đôi 3 lần liên tiếp: tống vào Ô 10 (Trạm Kiểm Toán) và chuyển lượt khi kết thúc', () => {
      const diceSequence = [
        0.2, 0.2, // lần 1: 2-2
        0.4, 0.4, // lần 2: 3-3
        0.0, 0.0, // lần 3: 1-1
      ];
      let rollIdx = 0;
      const rng = () => diceSequence[rollIdx++] ?? 0;
      const rm = new RoomManager(rng);
      const room = rm.createRoom('p1');
      rm.joinRoom(room.roomCode, 'p2');
      rm.startGame(room.roomCode);

      // Lần 1: đôi 2-2
      rm.handleRollDice(room.roomCode, 'p1');
      expect(room.players[0]!.consecutiveDoubles).toBe(1);
      dispatchPlayerIntent(rm, room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
      expect(room.currentPlayerIndex).toBe(0);
      expect(room.phase).toBe(TurnPhase.WaitingRoll);

      // Lần 2: đôi 3-3
      rm.handleRollDice(room.roomCode, 'p1');
      expect(room.players[0]!.consecutiveDoubles).toBe(2);
      dispatchPlayerIntent(rm, room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
      expect(room.currentPlayerIndex).toBe(0);
      expect(room.phase).toBe(TurnPhase.WaitingRoll);

      // Lần 3: đôi 1-1 -> bị tống vào Ô 10 (Trạm Kiểm Toán)
      rm.handleRollDice(room.roomCode, 'p1');
      expect(room.players[0]!.position).toBe(10);
      expect(room.players[0]!.auditTurnsLeft).toBe(3);
      expect(room.players[0]!.consecutiveDoubles).toBe(0); // Bị reset về 0

      // Kết thúc lượt -> không còn quyền đổ đôi -> chuyển sang p2
      const endTurn3 = dispatchPlayerIntent(rm, room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
      expect(endTurn3.success).toBe(true);
      expect(room.currentPlayerIndex).toBe(1); // Chuyển lượt sang p2
    });
  });

  // =========================================================================
  // 7. Đồng Bộ Trạng Thái inAudit (Vertical Slice Completeness & UI Lock)
  // =========================================================================
  describe('[TC-P2.7/MSS] inAudit Vertical Slice Completeness & UI Lock', () => {
    it('inAudit được truyền qua DeltaPayload và khóa nút gieo dù đổ đôi khi ở trong tù', () => {
      const rm = new RoomManager();
      const room = rm.createRoom('p1');
      rm.joinRoom(room.roomCode, 'p2');
      rm.startGame(room.roomCode);

      // Cho p1 bị giam ở Trạm kiểm toán (Ô 10, auditTurnsLeft = 3)
      room.players[0]!.position = 10;
      room.players[0]!.auditTurnsLeft = 3;

      const delta = rm.createDelta(room.roomCode, 1);
      expect(delta).toBeDefined();
      const p1Delta = delta?.players?.find((p) => p.id === 'p1');
      expect(p1Delta?.inAudit).toBe(true);

      // Cập nhật vào store
      useGameStore.getState().setPlayersInfo({
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 10000,
          tokenColor: 'red',
          ownedProperties: [],
          inAudit: false,
        },
      });

      applyDeltaToStore(delta!);
      const p1Info = useGameStore.getState().playersInfo['p1'];
      expect(p1Info?.inAudit).toBe(true);

      // Khi p1 có xúc xắc đôi (ví dụ [3, 3]) nhưng inAudit = true -> canRollAgain phải là false
      const dice: [number, number] = [3, 3];
      const inAudit = Boolean(p1Info?.inAudit);
      const canRollAgain = dice[0] === dice[1] && dice[0] > 0 && !inAudit;
      expect(canRollAgain).toBe(false);

      // Do đó nút đổ xúc xắc phải bị khóa
      const isRollDisabled = isRollActionDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: true,
        canRollAgain,
      });
      expect(isRollDisabled).toBe(true);
    });
  });

  // =========================================================================
  // 8. Quản Lý Bộ Đếm Thời Gian Bot (registerTimer & cleanup on close)
  // =========================================================================
  describe('[TC-P2.8/MSS] Quản lý bộ đếm thời gian Bot', () => {
    it('Timer lượt Bot được đăng ký vào RoomManager và dọn sạch khi đóng phòng', async () => {
      const ws = await openSocket();
      const initMsgs = collectMessages(ws, 2);
      sendMsg(ws, { type: 'CREATE_ROOM', playerId: 'p_host' });
      const [roomCreated] = await initMsgs;
      if (roomCreated?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const roomCode = roomCreated.roomCode;

      const rm = server.getRoomManager();
      rm.joinRoom(roomCode, 'bot_timer_test');
      const room = rm.getRoom(roomCode)!;
      room.players[1]!.isBot = true;

      const startedPromise = waitForMessageType(ws, 'ROOM_STARTED');
      sendMsg(ws, { type: 'START_GAME', roomCode, playerId: 'p_host' });
      await startedPromise;

      // Chuyển lượt sang Bot
      sendMsg(ws, { type: 'INTENT', roomCode, playerId: 'p_host', intent: { type: 'INTENT_ROLL' } });
      await new Promise((r) => setTimeout(r, 100));
      room.players[0]!.consecutiveDoubles = 0;
      sendMsg(ws, { type: 'INTENT', roomCode, playerId: 'p_host', intent: { type: 'INTENT_END_TURN' } });
      await new Promise((r) => setTimeout(r, 50));

      // Timer phải được đăng ký trong RoomManager
      const timers = rm.getActiveTimers(roomCode);
      expect(timers).toBeDefined();
      expect(timers!.size).toBeGreaterThan(0);

      // Đóng phòng -> toàn bộ timer của phòng phải bị clear ngay lập tức
      server.closeRoom(roomCode);
      const timersAfter = rm.getActiveTimers(roomCode);
      expect(timersAfter).toBeUndefined();
    });
  });
});
