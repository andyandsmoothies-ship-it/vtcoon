// [TC-285.01/MSS..TC-285.08/MSS][UC-IMP285] Sequential Step Engine & Zero-Overrun Turn Closure Guard Contract Suite
// SSOT: .agents/plans/PLAN_IMP_285_SEQUENTIAL_STEP_AND_TURN_CLOSURE_GUARD.md
// Invariant Reference: docs/domain/gotchas/fsm_lifecycle.md & .agents/audit/PLAN_CHALLENGE_IMP-285.md

import { describe, it, expect, vi, afterEach } from 'vitest';
import { TurnPhase, type Room } from '../../src/domain/room.js';
import type { AuctionSession } from '../../src/server/auction_manager.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { executeTurnEnd, executeTurnRoll } from '../../src/server/turn_loop.js';
import { checkInsolvency, declareBankruptcy } from '../../src/server/insolvency_manager.js';
import { TurnOrchestrator } from '../../src/server/network/turn_orchestrator.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';

// Station 1 Domain Model Augmentation for IMP-285
declare module '../../src/domain/room.js' {
  interface Room {
    pendingInsolvencyQueue?: string[];
  }
}

declare module '../../src/server/insolvency_manager.js' {
  export function checkInsolvency(room: Room, creditorId?: string, debtorId?: string): void;
}

function setupTestRoom(numPlayers = 2) {
  const mgr = new RoomManager(1234);
  const room = mgr.createRoom('p1_alice');
  if (numPlayers >= 2) {
    mgr.joinRoom(room.roomCode, 'p2_bob');
  }
  if (numPlayers >= 3) {
    mgr.joinRoom(room.roomCode, 'p3_charlie');
  }
  mgr.startGame(room.roomCode);
  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;
  const rolledThisTurnMap = new Map<string, boolean>();
  rolledThisTurnMap.set(room.roomCode, true);
  const auctions = new Map<string, AuctionSession>();
  return { mgr, room, reg, sm, rolledThisTurnMap, auctions };
}

describe('[TC-285.01/MSS..TC-285.08/MSS][UC-IMP285] Sequential Step Engine & Zero-Overrun Turn Closure Guard Contract Suite', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('[TC-285.01/MSS][UC-IMP285] Given người chơi ngoài lượt bị thâm hụt số dư âm, When gọi checkInsolvency kèm debtorId, Then room.pendingInsolvencyDebtorId được gán đúng và room.phase chuyển sang InsolvencyPhase', () => {
    const { room } = setupTestRoom(2);
    const p2 = room.players[1]!;
    p2.balance = -300;
    room.phase = TurnPhase.PropertyManagement;
    room.currentPlayerIndex = 0;

    checkInsolvency(room, undefined, p2.id);

    expect(room.pendingInsolvencyDebtorId).toBe(p2.id);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('[TC-285.02/MSS][UC-IMP285] Given trên bàn chơi có bất kỳ người chơi nào có balance < 0, When gọi executeTurnEnd, Then hàm trả về undefined và không cho phép chuyển lượt', () => {
    const { room, reg, sm, rolledThisTurnMap, auctions } = setupTestRoom(2);
    const p1 = room.players[0]!;
    const p2 = room.players[1]!;
    p2.balance = -200;
    p2.bankrupt = false;
    room.phase = TurnPhase.PropertyManagement;
    room.currentPlayerIndex = 0;

    const result = executeTurnEnd(
      room,
      p1,
      true,
      false,
      room.roomCode,
      rolledThisTurnMap,
      reg,
      sm,
      auctions,
    );

    expect(result).toBeUndefined();
    expect(room.currentPlayerIndex).toBe(0);
  });

  it('[TC-285.03/MSS][UC-IMP285] Given toàn bộ người chơi còn sống đều có balance >= 0, When gọi executeTurnEnd hợp lệ, Then hàm trả về Room hợp lệ và chuyển lượt thành công', () => {
    const { room, reg, sm, rolledThisTurnMap, auctions } = setupTestRoom(3);
    const p1 = room.players[0]!;
    const p2 = room.players[1]!;
    const p3 = room.players[2]!;
    p1.balance = 1000;
    p2.balance = 500;
    p3.balance = -500;
    p3.bankrupt = true;
    room.phase = TurnPhase.PropertyManagement;
    room.currentPlayerIndex = 0;

    const result = executeTurnEnd(
      room,
      p1,
      true,
      false,
      room.roomCode,
      rolledThisTurnMap,
      reg,
      sm,
      auctions,
    );

    expect(result).toBeDefined();
    expect(result?.currentPlayerIndex).toBe(1);
  });

  it('[TC-285.04/MSS][UC-IMP285] Given bot tiếp đất ô sự kiện rút thẻ phạt khiến đối thủ ngoài lượt âm tiền trong executeTurnRoll, When giải quyết xong bước nhảy, Then room.phase tự động chuyển thành InsolvencyPhase và debtor được đưa vào hàng đợi', () => {
    const { room, reg, sm, rolledThisTurnMap } = setupTestRoom(2);
    const p1 = room.players[0]!;
    p1.isBot = true;
    p1.balance = 2000;
    p1.position = 0;

    const p2 = room.players[1]!;
    p2.balance = 50;
    reg.set(1, p2.id);
    sm.set(1, { level: 1 });

    room.phase = TurnPhase.WaitingRoll;
    room.marketDeck = [MarketCardId.MC_FIRE_INSPECTION];

    const fixedRng = () => 0.05;
    const fixedDeckRng = () => 0;

    executeTurnRoll(room, p1, reg, sm, fixedRng, fixedDeckRng, rolledThisTurnMap, room.roomCode);

    expect(p2.balance).toBeLessThan(0);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe(p2.id);
  });

  it('[TC-285.05/MSS][UC-IMP285] Given room đang ở InsolvencyPhase với con nợ là người thật còn người giữ lượt là Bot, When TurnOrchestrator điều phối nhịp độ lượt chơi, Then hệ thống cấp timeout 45s cho người thật và bot không được thực thi bước đi', () => {
    const { mgr, room } = setupTestRoom(2);
    const p1 = room.players[0]!;
    p1.isBot = true;
    p1.balance = 2000;
    const p2 = room.players[1]!;
    p2.isBot = false;
    p2.balance = -200;

    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = p2.id;

    const sessions = new SessionManager();
    const intentMutex = new IntentMutex();
    const broadcaster = new DeltaBroadcaster(mgr, sessions, () => {});
    const onScheduleBotTurn = vi.fn();
    const onScheduleTurnTimeout = vi.fn();

    const orchestrator = new TurnOrchestrator({
      rooms: mgr,
      intentMutex,
      broadcaster,
      onGameOver: vi.fn(),
      onScheduleBotTurn,
      onScheduleTurnTimeout,
    });

    orchestrator.orchestrate(room.roomCode);

    expect(onScheduleTurnTimeout).toHaveBeenCalledWith(room.roomCode);
    expect(onScheduleBotTurn).not.toHaveBeenCalled();
    expect(orchestrator.getTimeRemaining(room.roomCode)).toBe(45);
  });

  it('[TC-285.06/MSS][UC-IMP285] Given con nợ ngoài lượt là người thật bị AFK trong lượt của Bot, When hết hạn timeout 45s trong TurnOrchestrator, Then hệ thống thực thi AFK recovery đúng trên con nợ người thật thay vì return sớm (khắc phục ADV-01)', async () => {
    vi.useFakeTimers();
    const { mgr, room } = setupTestRoom(2);
    const p1 = room.players[0]!;
    p1.isBot = true;
    const p2 = room.players[1]!;
    p2.isBot = false;
    p2.balance = -300;

    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = p2.id;

    const sessions = new SessionManager();
    const intentMutex = new IntentMutex();
    const broadcaster = new DeltaBroadcaster(mgr, sessions, () => {});

    const orchestrator = new TurnOrchestrator({
      rooms: mgr,
      intentMutex,
      broadcaster,
      onGameOver: vi.fn(),
    });

    const afkActionSpy = vi.spyOn(orchestrator, 'executeSafeAfkAction');

    orchestrator.orchestrate(room.roomCode);
    await vi.advanceTimersByTimeAsync(45_000);

    expect(afkActionSpy).toHaveBeenCalledWith(room.roomCode, TurnPhase.InsolvencyPhase, p2.id);
  });

  it('[TC-285.07/MSS][UC-IMP285] Given con nợ ngoài lượt tuyên bố phá sản bankrupt true, When declareBankruptcy hoàn tất, Then room.phase được phục hồi về PropertyManagement và người cầm lượt kết thúc lượt thành công (khắc phục ADV-04)', () => {
    const { room, reg, sm, rolledThisTurnMap, auctions } = setupTestRoom(2);
    const p1 = room.players[0]!;
    p1.balance = 1500;
    const p2 = room.players[1]!;
    p2.balance = -1000;

    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = p2.id;

    declareBankruptcy(room, p2.id, reg, sm);

    expect(p2.bankrupt).toBe(true);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    const endResult = executeTurnEnd(
      room,
      p1,
      true,
      false,
      room.roomCode,
      rolledThisTurnMap,
      reg,
      sm,
      auctions,
    );
    expect(endResult).toBeDefined();
  });

  it('[TC-285.08/MSS][UC-IMP285] Given nhiều người chơi cùng bị âm tiền từ một sự kiện thẻ phạt, When khởi tạo xử lý nợ, Then pendingInsolvencyQueue lưu trữ đầy đủ danh sách con nợ và xử lý tuần tự (khắc phục ADV-05)', () => {
    const { room, reg, sm, rolledThisTurnMap } = setupTestRoom(3);
    const p1 = room.players[0]!;
    p1.isBot = true;
    p1.balance = 2000;
    p1.position = 0;

    const p2 = room.players[1]!;
    p2.balance = 50;
    reg.set(1, p2.id);
    sm.set(1, { level: 1 });

    const p3 = room.players[2]!;
    p3.balance = 100;
    reg.set(3, p3.id);
    sm.set(3, { level: 2 });

    room.phase = TurnPhase.WaitingRoll;
    room.marketDeck = [MarketCardId.MC_FIRE_INSPECTION];

    const fixedRng = () => 0.05;
    const fixedDeckRng = () => 0;

    executeTurnRoll(room, p1, reg, sm, fixedRng, fixedDeckRng, rolledThisTurnMap, room.roomCode);

    expect(room.pendingInsolvencyQueue).toEqual([p2.id, p3.id]);
    expect(room.pendingInsolvencyDebtorId).toBe(p2.id);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });
});
