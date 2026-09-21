// [IMP-154][UC-AUCTION-BUYOUT-DEADLOCK/MSS] Contract Tests: Auction Pass State Persistence & Compulsory Buyout Deadlock Resolution
// Domain tags: [FSM/RULE], [NET/SYNC], [SEC/VALIDATION]
// Traceability: [TC-154.01/MSS] -> [TC-154.21/MSS], [UC-SEC-003], [UC-SEC-001], [UC-GAME-051], [UC-WATCHDOG-01], [UC-GAME-028]

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnvelopeValidator } from '../../src/server/security/envelope_validator.js';
import { IntentGuard } from '../../src/server/security/intent_guard.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnWatchdog } from '../../src/server/network/turn_watchdog.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher.js';
import { coordDeclineCompulsoryBuyout } from '../../src/server/room_property_coordinator.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
// Helper to construct TurnWatchdog with standard test defaults
function buildWatchdog(
  rooms: RoomManager, intentMutex: IntentMutex, broadcaster: DeltaBroadcaster,
  overrides: { onEmergencyRecovery?: (rc: string, reason: string) => void; onGameOver?: (rc: string) => void; onScheduleNextTurn?: (rc: string) => void; maxTurnStallMs?: number; checkIntervalMs?: number; } = {},
): TurnWatchdog {
  return new TurnWatchdog({
    rooms, intentMutex, broadcaster,
    maxTurnStallMs: overrides.maxTurnStallMs ?? 45_000,
    checkIntervalMs: overrides.checkIntervalMs ?? 5_000,
    onEmergencyRecovery: overrides.onEmergencyRecovery ?? vi.fn(),
    onGameOver: overrides.onGameOver ?? vi.fn(),
    onScheduleNextTurn: overrides.onScheduleNextTurn ?? vi.fn(),
  });
}
// Group A: EnvelopeValidator & IntentGuard for Compulsory Buyout (>= 4 tests)
// [TC-154.01/MSS] .. [TC-154.07/MSS]

describe('[IMP-154/A] EnvelopeValidator & IntentGuard cho Compulsory Buyout', () => {
  let validator: EnvelopeValidator;
  let guard: IntentGuard;

  beforeEach(() => {
    validator = new EnvelopeValidator();
    guard = new IntentGuard();
  });

  it('[IMP-154/A1][TC-154.01/MSS][UC-SEC-003] EnvelopeValidator PHẢI chấp thuận INTENT_DECLINE_COMPULSORY_BUYOUT', () => {
    const res = validator.validateEnvelope({
      type: 'INTENT',
      roomCode: 'VT8888',
      playerId: 'player_buyer_1',
      intent: { type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' },
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.message.type).toBe('INTENT');
      expect((res.message as any).intent.type).toBe('INTENT_DECLINE_COMPULSORY_BUYOUT');
    }
  });

  it('[IMP-154/A2][TC-154.02/MSS][UC-SEC-003] EnvelopeValidator PHẢI chấp thuận INTENT_EXECUTE_COMPULSORY_BUYOUT với cellIndex hợp lệ', () => {
    const res = validator.validateEnvelope({
      type: 'INTENT',
      roomCode: 'VT8888',
      playerId: 'player_buyer_1',
      intent: { type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT', cellIndex: 8 },
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.message.type).toBe('INTENT');
      expect((res.message as any).intent.type).toBe('INTENT_EXECUTE_COMPULSORY_BUYOUT');
      expect((res.message as any).intent.cellIndex).toBe(8);
    }
  });

  it('[IMP-154/A3][TC-154.03/MSS][UC-SEC-003] EnvelopeValidator PHẢI từ chối INTENT_EXECUTE_COMPULSORY_BUYOUT nếu thiếu cellIndex', () => {
    const res = validator.validateEnvelope({
      type: 'INTENT',
      roomCode: 'VT8888',
      playerId: 'player_buyer_1',
      intent: { type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT' },
    });

    expect(res.success).toBe(false);
    expect((res as any).reasonCode).toBe('INVALID_ENVELOPE');
  });

  it('[IMP-154/A4][TC-154.04/MSS][UC-SEC-003] EnvelopeValidator PHẢI từ chối INTENT_EXECUTE_COMPULSORY_BUYOUT nếu cellIndex là số âm', () => {
    const res = validator.validateEnvelope({
      type: 'INTENT',
      roomCode: 'VT8888',
      playerId: 'player_buyer_1',
      intent: { type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT', cellIndex: -1 },
    });

    expect(res.success).toBe(false);
    expect((res as any).reasonCode).toBe('INVALID_VALUE');
  });

  it('[IMP-154/A5][TC-154.05/MSS][UC-SEC-001] IntentGuard PHẢI cho phép INTENT_DECLINE_COMPULSORY_BUYOUT khi người chơi là bên mua (buyerId === playerId)', () => {
    const rooms = new RoomManager(1234);
    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);

    room.currentPlayerIndex = 0; // host_alice is current turn player
    room.pendingBuyout = {
      buyerId: 'guest_bob',
      sellerId: 'host_alice',
      cellIndex: 6,
      cost: 1200,
      basePrice: 1000,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15_000,
    };

    // guest_bob is buyer responding to buyout offer
    const result = guard.validate(room, 'guest_bob', { type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' });
    expect(result.allowed).toBe(true);
  });

  it('[IMP-154/A6][TC-154.06/MSS][UC-SEC-001] IntentGuard PHẢI cho phép INTENT_EXECUTE_COMPULSORY_BUYOUT khi người chơi là bên mua', () => {
    const rooms = new RoomManager(1234);
    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);

    room.currentPlayerIndex = 0; // host_alice is current turn player
    room.pendingBuyout = {
      buyerId: 'guest_bob',
      sellerId: 'host_alice',
      cellIndex: 6,
      cost: 1200,
      basePrice: 1000,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15_000,
    };

    const result = guard.validate(room, 'guest_bob', { type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT', cellIndex: 6 });
    expect(result.allowed).toBe(true);
  });

  it('[IMP-154/A7][TC-154.07/MSS][UC-SEC-001] IntentGuard PHẢI từ chối INTENT_DECLINE_COMPULSORY_BUYOUT nếu người chơi KHÔNG phải là bên mua', () => {
    const rooms = new RoomManager(1234);
    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.joinRoom(room.roomCode, 'guest_charlie');
    rooms.startGame(room.roomCode);

    room.currentPlayerIndex = 0; // host_alice is current turn player
    room.pendingBuyout = {
      buyerId: 'guest_bob',
      sellerId: 'host_alice',
      cellIndex: 6,
      cost: 1200,
      basePrice: 1000,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15_000,
    };

    // guest_charlie has no business declining bob's buyout
    const result = guard.validate(room, 'guest_charlie', { type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' });
    expect(result.allowed).toBe(false);
    expect(result.reasonCode).toBe('OUT_OF_TURN');
  });
});
// Group B: Buyout Decline & End Turn Deadlock Resolution (>= 4 tests)
// [TC-154.08/MSS] .. [TC-154.12/MSS]

describe('[IMP-154/B] Buyout Decline & End Turn Deadlock Resolution', () => {
  let rooms: RoomManager;

  beforeEach(() => {
    rooms = new RoomManager(1234);
  });

  it('[IMP-154/B1][TC-154.08/MSS][UC-GAME-051] dispatchPlayerIntent với INTENT_DECLINE_COMPULSORY_BUYOUT PHẢI xóa room.pendingBuyout = null', () => {
    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);
    room.phase = TurnPhase.PropertyManagement;

    room.pendingBuyout = {
      buyerId: 'host_alice',
      sellerId: 'guest_bob',
      cellIndex: 9,
      cost: 1500,
      basePrice: 1200,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15_000,
    };

    const res = dispatchPlayerIntent(rooms, room.roomCode, 'host_alice', {
      type: 'INTENT_DECLINE_COMPULSORY_BUYOUT',
    });

    expect(res.success).toBe(true);
    expect(room.pendingBuyout).toBeNull();
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('[IMP-154/B2][TC-154.09/MSS][UC-GAME-051] Sau khi INTENT_DECLINE_COMPULSORY_BUYOUT thành công, handleEndTurn PHẢI được phép thực thi (giải phóng deadlock)', () => {
    // Consumer assertion: handleEndTurn is blocked before decline, and succeeds after decline
    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);
    room.phase = TurnPhase.PropertyManagement;
    (rooms as any).rolledThisTurn.set(room.roomCode, true);

    room.pendingBuyout = {
      buyerId: 'host_alice',
      sellerId: 'guest_bob',
      cellIndex: 9,
      cost: 1500,
      basePrice: 1200,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15_000,
    };

    // 1. Point of consumption: handleEndTurn returns undefined while pendingBuyout exists (deadlock!)
    const blockedTurn = rooms.handleEndTurn(room.roomCode, 'host_alice');
    expect(blockedTurn).toBeUndefined();

    // 2. Decline buyout
    const declineRes = dispatchPlayerIntent(rooms, room.roomCode, 'host_alice', {
      type: 'INTENT_DECLINE_COMPULSORY_BUYOUT',
    });
    expect(declineRes.success).toBe(true);
    expect(room.pendingBuyout).toBeNull();

    // 3. Point of consumption: handleEndTurn now advances turn successfully to guest_bob
    const advancedRoom = rooms.handleEndTurn(room.roomCode, 'host_alice');
    expect(advancedRoom).toBeDefined();
    expect(advancedRoom?.currentPlayerIndex).toBe(1);
    expect(advancedRoom?.players[1]?.id).toBe('guest_bob');
  });

  it('[IMP-154/B3][TC-154.10/MSS][UC-GAME-051] coordDeclineCompulsoryBuyout từ chối nếu không có session (NO_PENDING_BUYOUT)', () => {
    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);
    room.pendingBuyout = null;

    const ctx = (rooms as any).getContext(room.roomCode);
    const res = coordDeclineCompulsoryBuyout(ctx, 'host_alice');

    expect(res.success).toBe(false);
    expect(res.reason).toBe('NO_PENDING_BUYOUT');
  });

  it('[IMP-154/B4][TC-154.11/MSS][UC-GAME-051] coordDeclineCompulsoryBuyout từ chối nếu người gọi không phải buyer (INVALID_BUYOUT_SESSION)', () => {
    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);

    room.pendingBuyout = {
      buyerId: 'host_alice',
      sellerId: 'guest_bob',
      cellIndex: 9,
      cost: 1500,
      basePrice: 1200,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15_000,
    };

    const ctx = (rooms as any).getContext(room.roomCode);
    // guest_bob is the seller, not buyer
    const res = coordDeclineCompulsoryBuyout(ctx, 'guest_bob');

    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_BUYOUT_SESSION');
  });

  it('[IMP-154/B5][TC-154.12/MSS][UC-GAME-051] dispatchPlayerIntent với INTENT_END_TURN trả về INVALID_PHASE khi pendingBuyout đang active', () => {
    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);
    room.phase = TurnPhase.PropertyManagement;
    (rooms as any).rolledThisTurn.set(room.roomCode, true);

    room.pendingBuyout = {
      buyerId: 'host_alice',
      sellerId: 'guest_bob',
      cellIndex: 9,
      cost: 1500,
      basePrice: 1200,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15_000,
    };

    const res = dispatchPlayerIntent(rooms, room.roomCode, 'host_alice', {
      type: 'INTENT_END_TURN',
    });

    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_PHASE');
  });
});
// Group C: Watchdog Auto-Timeout for Pending Buyout (>= 4 tests)
// [TC-154.13/MSS] .. [TC-154.16/MSS]

describe('[IMP-154/C] Watchdog Auto-Timeout cho Pending Buyout', () => {
  let rooms: RoomManager;
  let intentMutex: IntentMutex;
  let broadcaster: DeltaBroadcaster;
  let sessions: SessionManager;

  beforeEach(() => {
    rooms = new RoomManager(1234);
    sessions = new SessionManager();
    intentMutex = new IntentMutex();
    broadcaster = new DeltaBroadcaster(rooms, sessions, vi.fn());
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('[IMP-154/C1][TC-154.13/MSS][UC-WATCHDOG-01] TurnWatchdog.checkRoom PHẢI gọi checkPendingBuyoutTimeout khi phòng có pending buyout', async () => {
    vi.useFakeTimers();

    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);
    room.phase = TurnPhase.PropertyManagement;

    room.pendingBuyout = {
      buyerId: 'host_alice',
      sellerId: 'guest_bob',
      cellIndex: 7,
      cost: 1000,
      basePrice: 800,
      createdAt: Date.now() - 20_000,
      expiresAt: Date.now() - 5_000,
    };

    const timeoutSpy = vi.spyOn(rooms, 'checkPendingBuyoutTimeout');

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 45_000,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(100);
    watchdog.stop();

    expect(timeoutSpy).toHaveBeenCalledWith(room.roomCode, expect.any(Number));
  });

  it('[IMP-154/C2][TC-154.14/MSS][UC-WATCHDOG-01] Khi checkPendingBuyoutTimeout trả về timeout: true, Watchdog PHẢI phát sóng delta và dọn room.pendingBuyout', async () => {
    vi.useFakeTimers();

    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);
    room.phase = TurnPhase.PropertyManagement;

    room.pendingBuyout = {
      buyerId: 'host_alice',
      sellerId: 'guest_bob',
      cellIndex: 7,
      cost: 1000,
      basePrice: 800,
      createdAt: Date.now() - 20_000,
      expiresAt: Date.now() - 5_000, // Expired
    };

    const broadcastSpy = vi.spyOn(broadcaster, 'broadcastRoomDelta');

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 45_000,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(100);
    watchdog.stop();

    expect(broadcastSpy).toHaveBeenCalledWith(room.roomCode);
    expect(room.pendingBuyout).toBeNull();
  });

  it('[IMP-154/C3][TC-154.15/MSS][UC-WATCHDOG-01] TurnWatchdog.executeEmergencyRecovery PHẢI dọn room.pendingBuyout = null trước khi force-advance', async () => {
    vi.useFakeTimers();

    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);
    room.phase = TurnPhase.PropertyManagement;

    // Active (unexpired) buyout session, but the turn stalls past maxTurnStallMs
    room.pendingBuyout = {
      buyerId: 'host_alice',
      sellerId: 'guest_bob',
      cellIndex: 7,
      cost: 1000,
      basePrice: 800,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60_000,
    };

    const endTurnSpy = vi.spyOn(rooms, 'handleEndTurn');

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 200,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    // Advance past stall threshold to trigger emergency recovery
    await vi.advanceTimersByTimeAsync(300);
    watchdog.stop();

    expect(room.pendingBuyout).toBeNull();
    expect(endTurnSpy).toHaveBeenCalledWith(room.roomCode, expect.any(String));
  });

  it('[IMP-154/C4][TC-154.16/MSS][UC-WATCHDOG-01] Khi không có pending buyout, Watchdog không gọi checkPendingBuyoutTimeout', async () => {
    vi.useFakeTimers();

    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.startGame(room.roomCode);
    room.phase = TurnPhase.PropertyManagement;
    room.pendingBuyout = null;

    const timeoutSpy = vi.spyOn(rooms, 'checkPendingBuyoutTimeout');

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 45_000,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(100);
    watchdog.stop();

    expect(timeoutSpy).not.toHaveBeenCalled();
  });
});
// Group D: Auction Delta & Client Pass State Persistence (>= 4 tests)
// [TC-154.17/MSS] .. [TC-154.21/MSS]

describe('[IMP-154/D] Auction Delta & Client Pass State Persistence', () => {
  let rooms: RoomManager;

  beforeEach(() => {
    rooms = new RoomManager(1234);
    useGameStore.getState().resetGameState?.();
    useGameStore.setState({ activeModal: null, modalPayload: null });
    useLobbyStore.setState({ myPlayerId: 'player_local_me' });
  });

  afterEach(() => {
    useGameStore.getState().resetGameState?.();
  });

  it('[IMP-154/D1][TC-154.17/MSS][UC-GAME-028] buildRoomDelta PHẢI đưa passedPlayerIds vào auction delta payload khi có người chơi rút lui', () => {
    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.joinRoom(room.roomCode, 'guest_charlie');
    rooms.startGame(room.roomCode);

    // host_alice declines buying cell 1 -> initiates auction
    room.phase = TurnPhase.ActionPhase;
    room.players[0]!.position = 1;
    rooms.handleDecline(room.roomCode, 'host_alice');
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // guest_bob passes the auction
    const passRes = rooms.handleAuctionPass(room.roomCode, 'guest_bob');
    expect(passRes.success).toBe(true);

    const delta = rooms.createDelta(room.roomCode, 1);
    expect(delta).toBeDefined();
    expect(delta?.auction).toBeDefined();

    expect((delta?.auction as any)?.passedPlayerIds).toBeDefined();
    expect((delta?.auction as any)?.passedPlayerIds).toEqual(['guest_bob']);
  });

  it('[IMP-154/D2][TC-154.18/MSS][UC-GAME-028] Khi nhiều người chơi rút lui, tất cả ID PHẢI xuất hiện trong passedPlayerIds của delta tiếp theo', () => {
    const room = rooms.createRoom('host_alice');
    rooms.joinRoom(room.roomCode, 'guest_bob');
    rooms.joinRoom(room.roomCode, 'guest_charlie');
    rooms.joinRoom(room.roomCode, 'guest_david');
    rooms.startGame(room.roomCode);

    room.phase = TurnPhase.ActionPhase;
    room.players[0]!.position = 3;
    rooms.handleDecline(room.roomCode, 'host_alice');

    rooms.handleAuctionPass(room.roomCode, 'guest_bob');
    rooms.handleAuctionPass(room.roomCode, 'guest_charlie');

    const delta = rooms.createDelta(room.roomCode, 2);
    expect((delta?.auction as any)?.passedPlayerIds).toBeDefined();
    expect((delta?.auction as any)?.passedPlayerIds).toEqual(
      expect.arrayContaining(['guest_bob', 'guest_charlie']),
    );
  });

  it('[IMP-154/D3][TC-154.19/MSS][UC-GAME-028] Client applyDeltaToStore khi nhận delta.auction PHẢI bảo lưu hasPassed: true nếu người chơi trước đó đã rút lui', () => {
    useLobbyStore.setState({ myPlayerId: 'player_local_me' });

    // Client locally passed the auction previously
    useGameStore.getState().openModal('auction', {
      cellIndex: 5,
      currentBid: 500,
      highestBidderId: 'other_bidder',
      timeRemaining: 15,
      hasPassed: true,
    });
    expect((useGameStore.getState().modalPayload as any)?.hasPassed).toBe(true);

    // New delta arrives from server (e.g., someone else placed a higher bid)
    applyDeltaToStore(
      {
        tick: 2,
        cells: [],
        auction: {
          cellIndex: 5,
          currentBid: 600,
          highestBidderId: 'higher_bidder',
          timeRemaining: 12,
        },
      } as any,
      useGameStore,
    );

    // wiping hasPassed to undefined -> FAILS RED
    expect((useGameStore.getState().modalPayload as any)?.hasPassed).toBe(true);
  });

  it('[IMP-154/D4][TC-154.20/MSS][UC-GAME-028] Client applyDeltaToStore tự động kích hoạt hasPassed: true nếu myId nằm trong delta.auction.passedPlayerIds', () => {
    useLobbyStore.setState({ myPlayerId: 'player_local_me' });

    useGameStore.getState().openModal('auction', {
      cellIndex: 5,
      currentBid: 500,
      highestBidderId: 'other_bidder',
      timeRemaining: 15,
      hasPassed: false,
    });

    // Server delta arrives containing myPlayerId in passedPlayerIds
    applyDeltaToStore(
      {
        tick: 3,
        cells: [],
        auction: {
          cellIndex: 5,
          currentBid: 550,
          highestBidderId: 'other_bidder',
          timeRemaining: 10,
          passedPlayerIds: ['player_local_me', 'guest_bob'],
        } as any,
      } as any,
      useGameStore,
    );

    expect((useGameStore.getState().modalPayload as any)?.hasPassed).toBe(true);
  });

  it('[IMP-154/D5][TC-154.21/MSS][UC-GAME-028] Client applyDeltaToStore KHÔNG kích hoạt hasPassed nếu myId không nằm trong passedPlayerIds', () => {
    useLobbyStore.setState({ myPlayerId: 'player_local_me' });

    useGameStore.getState().openModal('auction', {
      cellIndex: 5,
      currentBid: 500,
      highestBidderId: 'other_bidder',
      timeRemaining: 15,
      hasPassed: false,
    });

    applyDeltaToStore(
      {
        tick: 4,
        cells: [],
        auction: {
          cellIndex: 5,
          currentBid: 550,
          highestBidderId: 'other_bidder',
          timeRemaining: 10,
          passedPlayerIds: ['guest_bob', 'guest_charlie'],
        } as any,
      } as any,
      useGameStore,
    );

    expect((useGameStore.getState().modalPayload as any)?.hasPassed).toBeFalsy();
  });
});
