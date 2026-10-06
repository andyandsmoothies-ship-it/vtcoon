// [TC-281.01/MSS..TC-281.08/MSS][UC-IMP281] Auto-Solvency Semantic Resolution & Post-Insolvency Sync Contract Suite
import { describe, it, expect, vi } from 'vitest';
import { WebSocket } from 'ws';
import { RoomManager } from '../../src/server/room_manager.js';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher.js';
import { TurnPhase, ActionRejectReason, isRoomGameOver } from '../../src/domain/room.js';
import {
  handleIntentMsg,
  syncRoomAfterIntent,
  type IntentHandlerDeps,
} from '../../src/server/network/wss_intent_handler.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { AdminManager } from '../../src/server/network/admin_manager.js';
import { SocketRegistry } from '../../src/server/network/socket_registry.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { IntentGuard } from '../../src/server/security/intent_guard.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

function setupRoom(numPlayers = 2, rng = () => 0) {
  const mgr = new RoomManager(rng);
  const room = mgr.createRoom('p1_alice');
  if (numPlayers === 2) {
    mgr.joinRoom(room.roomCode, 'p2_bob');
  } else {
    mgr.joinRoom(room.roomCode, 'p2_bot');
    const p2 = room.players.find((p) => p.id === 'p2_bot');
    if (p2) p2.isBot = true;
    mgr.joinRoom(room.roomCode, 'p3_dan');
  }
  mgr.startGame(room.roomCode);
  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;
  return { mgr, room, reg, sm };
}

describe('[TC-281.01/MSS..TC-281.08/MSS][UC-IMP281] Auto-Solvency Semantic Resolution & Post-Insolvency Sync Contract Suite', () => {
  it('[TC-281.01/MSS][UC-IMP281] Given người chơi âm tiền có nhà phố, When dispatch INTENT_AUTO_SOLVENCY cứu nguy thành công, Then trả về { success: true } và balance >= 0', () => {
    const { mgr, room, reg, sm } = setupRoom(2);
    const p1 = room.players[0]!;
    reg.set(1, p1.id);
    sm.set(1, { level: 2 });
    p1.balance = -150;
    room.phase = TurnPhase.InsolvencyPhase;
    room.currentPlayerIndex = 0;

    const res = dispatchPlayerIntent(mgr, room.roomCode, p1.id, { type: 'INTENT_AUTO_SOLVENCY' });
    expect(res.success).toBe(true);
    expect(p1.balance).toBeGreaterThanOrEqual(0);
  });

  it('[TC-281.02/MSS][UC-IMP281] Given người chơi âm tiền không đủ tài sản cứu nguy, When dispatch INTENT_AUTO_SOLVENCY, Then trả về { success: true } và player.bankrupt === true', () => {
    const { mgr, room } = setupRoom(2);
    const p1 = room.players[0]!;
    p1.balance = -999_999;
    room.phase = TurnPhase.InsolvencyPhase;
    room.currentPlayerIndex = 0;

    const res = dispatchPlayerIntent(mgr, room.roomCode, p1.id, { type: 'INTENT_AUTO_SOLVENCY' });
    expect(res.success).toBe(true);
    expect(p1.bankrupt).toBe(true);
  });

  it('[TC-281.03/MSS][UC-IMP281] Given người chơi phá sản qua INTENT_AUTO_SOLVENCY, When kết quả dispatch xử lý bởi wss_intent_handler, Then socket KHÔNG nhận gói tin ERROR nào có reasonCode BANKRUPT', async () => {
    const { mgr, room } = setupRoom(2);
    const p1 = room.players[0]!;
    p1.balance = -999_999;
    room.phase = TurnPhase.InsolvencyPhase;
    room.currentPlayerIndex = 0;

    const sessionManager = new SessionManager();
    const broadcaster = new DeltaBroadcaster(mgr, sessionManager, () => {});
    const adminManager = new AdminManager({ roomManager: mgr, secret: 'test-secret' });
    const sockets = new SocketRegistry();
    const mockWs = Object.create(WebSocket.prototype) as WebSocket;
    Object.defineProperty(mockWs, 'readyState', { value: WebSocket.OPEN, writable: true, configurable: true });
    mockWs.send = vi.fn();
    mockWs.close = vi.fn();
    sockets.bind(room.roomCode, p1.id, mockWs);

    const sentMessages: WsServerMessage[] = [];
    const deps: IntentHandlerDeps = {
      rooms: mgr,
      intentGuard: new IntentGuard(),
      intentMutex: new IntentMutex(),
      broadcaster,
      adminManager,
      sockets,
      sendSafe: (_sock: WebSocket, msg: WsServerMessage) => {
        sentMessages.push(msg);
      },
      bindSocket: (rc, pid, s) => sockets.bind(rc, pid, s),
      scheduleBotTurn: vi.fn(),
      broadcastGameOver: vi.fn(),
    };

    await handleIntentMsg(deps, mockWs, {
      type: 'INTENT',
      roomCode: room.roomCode,
      playerId: p1.id,
      intent: { type: 'INTENT_AUTO_SOLVENCY' },
    });

    const hasBankruptReject = sentMessages.some(
      (m) => 'reasonCode' in m && m.reasonCode === 'BANKRUPT',
    );
    expect(hasBankruptReject).toBe(false);
    expect(p1.bankrupt).toBe(true);
  });

  it('[TC-281.04/MSS][UC-IMP281] Given ván chơi 2 người có 1 người phá sản qua INTENT_AUTO_SOLVENCY, When intent xử lý xong, Then phòng chơi kết thúc (isGameOver: true) và phát sóng Game Over', () => {
    const { mgr, room } = setupRoom(2);
    const p1 = room.players[0]!;
    p1.balance = -999_999;
    room.phase = TurnPhase.InsolvencyPhase;
    room.currentPlayerIndex = 0;

    dispatchPlayerIntent(mgr, room.roomCode, p1.id, { type: 'INTENT_AUTO_SOLVENCY' });
    expect(isRoomGameOver(room)).toBe(true);

    const broadcastGameOverSpy = vi.fn();
    const sessionManager = new SessionManager();
    const broadcaster = new DeltaBroadcaster(mgr, sessionManager, () => {});
    syncRoomAfterIntent(
      {
        rooms: mgr,
        broadcaster,
        broadcastGameOver: broadcastGameOverSpy,
        scheduleBotTurn: vi.fn(),
      },
      room.roomCode,
    );
    expect(broadcastGameOverSpy).toHaveBeenCalledWith(room.roomCode);
  });

  it('[TC-281.05/MSS][UC-IMP281] Given ván chơi 3 người có người thứ nhất phá sản qua INTENT_AUTO_SOLVENCY và lượt tiếp theo là Bot, When intent xử lý xong, Then hệ thống gọi scheduleBotTurn', () => {
    const { mgr, room } = setupRoom(3);
    const p1 = room.players[0]!;
    p1.balance = -999_999;
    room.phase = TurnPhase.InsolvencyPhase;
    room.currentPlayerIndex = 0;

    dispatchPlayerIntent(mgr, room.roomCode, p1.id, { type: 'INTENT_AUTO_SOLVENCY' });
    expect(room.players[room.currentPlayerIndex]?.isBot).toBe(true);

    const scheduleBotTurnSpy = vi.fn();
    const sessionManager = new SessionManager();
    const broadcaster = new DeltaBroadcaster(mgr, sessionManager, () => {});
    syncRoomAfterIntent(
      {
        rooms: mgr,
        broadcaster,
        broadcastGameOver: vi.fn(),
        scheduleBotTurn: scheduleBotTurnSpy,
      },
      room.roomCode,
    );
    expect(scheduleBotTurnSpy).toHaveBeenCalledWith(room.roomCode);
  });

  it('[TC-281.06/MSS][UC-IMP281] Given phòng chơi không ở TurnPhase.InsolvencyPhase, When dispatch INTENT_AUTO_SOLVENCY, Then từ chối với INVALID_PHASE', () => {
    const { mgr, room } = setupRoom(2);
    const p1 = room.players[0]!;
    p1.balance = -100;
    room.phase = TurnPhase.WaitingRoll;
    room.currentPlayerIndex = 0;

    const res = dispatchPlayerIntent(mgr, room.roomCode, p1.id, { type: 'INTENT_AUTO_SOLVENCY' });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_PHASE');
  });

  it('[TC-281.07/MSS][UC-IMP281] Given người chơi không phải current player, When dispatch INTENT_AUTO_SOLVENCY, Then từ chối với NOT_YOUR_TURN', () => {
    const { mgr, room } = setupRoom(2);
    const p2 = room.players[1]!;
    p2.balance = -100;
    room.phase = TurnPhase.InsolvencyPhase;
    room.currentPlayerIndex = 0;

    const res = dispatchPlayerIntent(mgr, room.roomCode, p2.id, { type: 'INTENT_AUTO_SOLVENCY' });
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.NOT_YOUR_TURN);
  });

  it('[TC-281.08/MSS][UC-IMP281] Given người chơi có số dư không âm (>= 0), When dispatch INTENT_AUTO_SOLVENCY, Then từ chối với NOT_YOUR_TURN', () => {
    const { mgr, room } = setupRoom(2);
    const p1 = room.players[0]!;
    p1.balance = 500;
    room.phase = TurnPhase.InsolvencyPhase;
    room.currentPlayerIndex = 0;

    const res = dispatchPlayerIntent(mgr, room.roomCode, p1.id, { type: 'INTENT_AUTO_SOLVENCY' });
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.NOT_YOUR_TURN);
  });
});
