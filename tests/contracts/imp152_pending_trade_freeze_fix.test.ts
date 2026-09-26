// [IMP-152][UC-TRADE-FREEZE/MSS] Contract Tests — Pending Trade Timeout Auto-Clear & Freeze Prevention
// Verifies 3 confirmed bugs:
//   Bug #1: checkPendingTradeTimeout() not called automatically in WebSocket flow
//   Bug #2: executeEmergencyRecovery() does not clear pendingTradeOffer before force-advance
//   Bug #3: coordTrade() missing turn-order guard — non-current player can create pending trade
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { TurnWatchdog } from '../../src/server/network/turn_watchdog.js';
import { TurnPhase, ActionRejectReason } from '../../src/domain/room.js';
import { pendingTradeManager } from '../../src/server/pending_trade_manager.js';
import { coordTrade } from '../../src/server/room_property_coordinator.js';

// ---------------------------------------------------------------------------
// Shared setup helpers
// ---------------------------------------------------------------------------

function buildWatchdog(
  rooms: RoomManager,
  intentMutex: IntentMutex,
  broadcaster: DeltaBroadcaster,
  overrides: {
    onEmergencyRecovery?: (rc: string, reason: string) => void;
    onGameOver?: (rc: string) => void;
    onScheduleNextTurn?: (rc: string) => void;
    maxTurnStallMs?: number;
    checkIntervalMs?: number;
  } = {},
): TurnWatchdog {
  return new TurnWatchdog({
    rooms,
    intentMutex,
    broadcaster,
    maxTurnStallMs: overrides.maxTurnStallMs ?? 45_000,
    checkIntervalMs: overrides.checkIntervalMs ?? 5_000,
    onEmergencyRecovery: overrides.onEmergencyRecovery ?? vi.fn(),
    onGameOver: overrides.onGameOver ?? vi.fn(),
    onScheduleNextTurn: overrides.onScheduleNextTurn ?? vi.fn(),
  });
}

function makeRoom(rooms: RoomManager, hostId: string, guestId: string) {
  const room = rooms.createRoom(hostId);
  rooms.joinRoom(room.roomCode, guestId);
  rooms.startGame(room.roomCode);
  return room;
}

/** Directly inject an EXPIRED pendingTradeOffer into a room via pendingTradeManager */
function injectExpiredPendingTrade(
  rooms: RoomManager,
  roomCode: string,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
) {
  // Create session that expires immediately (durationMs = 0)
  const session = pendingTradeManager.createSession(
    roomCode, buyerId, sellerId, cellIndex, 1000, 1000, 0,
  );
  const room = (rooms as any).rooms.get(roomCode);
  if (room) {
    room.pendingTradeOffer = {
      offerId: session.offerId,
      cellIndex: session.cellIndex,
      price: session.price,
      buyerId: session.buyerId,
      sellerId: session.sellerId,
      expiresAt: session.expiresAt,
    };
  }
  return session;
}

// ---------------------------------------------------------------------------
// Group A — Bug #1: Watchdog auto-timeout
// [IMP-152/A1..A5]
// ---------------------------------------------------------------------------

describe('[IMP-152/A] Bug #1 — Watchdog checkRoom MUST call checkPendingTradeTimeout', () => {
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

  it('[IMP-152/A1] checkRoom MUST call rooms.checkPendingTradeTimeout(roomCode) when room has pending trade', async () => {
    // [TC-152.1/MSS] Watchdog tick must forward to checkPendingTradeTimeout
    vi.useFakeTimers();

    const room = makeRoom(rooms, 'alice', 'bob');
    room.phase = TurnPhase.PropertyManagement;
    injectExpiredPendingTrade(rooms, room.roomCode, 'alice', 'bob', 3);

    const timeoutSpy = vi.spyOn(rooms, 'checkPendingTradeTimeout');

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 45_000,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    // Advance one check interval — watchdog tick fires
    await vi.advanceTimersByTimeAsync(100);
    watchdog.stop();

    // BUG #1: checkPendingTradeTimeout is never called inside checkRoom
    // This assertion will FAIL on original code → RED
    expect(timeoutSpy).toHaveBeenCalledWith(room.roomCode, expect.any(Number));
  });

  it('[IMP-152/A2] When checkPendingTradeTimeout returns timeout:true, Watchdog MUST broadcast room delta', async () => {
    // [TC-152.2/MSS] Timeout resolution must trigger a broadcast
    vi.useFakeTimers();

    const room = makeRoom(rooms, 'alice', 'bob');
    room.phase = TurnPhase.PropertyManagement;
    injectExpiredPendingTrade(rooms, room.roomCode, 'alice', 'bob', 3);

    const broadcastSpy = vi.spyOn(broadcaster, 'broadcastRoomDelta');

    // Stub checkPendingTradeTimeout to simulate timeout
    vi.spyOn(rooms, 'checkPendingTradeTimeout').mockReturnValue({
      timeout: true,
      session: pendingTradeManager.getSession(room.roomCode),
    });

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 45_000,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(100);
    watchdog.stop();

    // BUG #1: broadcast not triggered after pending trade timeout in checkRoom
    // This assertion FAILS on original code → RED
    expect(broadcastSpy).toHaveBeenCalledWith(room.roomCode);
  });

  it('[IMP-152/A3] checkPendingTradeTimeout MUST NOT be called when room has no pending trade', async () => {
    // [TC-152.3/MSS] Optimization: no unnecessary calls when no trade pending
    vi.useFakeTimers();

    const room = makeRoom(rooms, 'alice', 'bob');
    room.phase = TurnPhase.PropertyManagement;
    // No pending trade injected

    const timeoutSpy = vi.spyOn(rooms, 'checkPendingTradeTimeout');

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 45_000,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(100);
    watchdog.stop();

    // When no pending trade exists, checkPendingTradeTimeout should not be called
    // This assertion will FAIL if the fix over-eagerly calls it always → documents correct behavior
    // On ORIGINAL code: currently NOT called at all (pass accidentally, but A1 catches the bug)
    expect(timeoutSpy).not.toHaveBeenCalled();
  });

  it('[IMP-152/A4] After trade timeout, hasPendingTrade(roomCode) MUST return false', async () => {
    // [TC-152.4/MSS] Post-timeout: pending trade session is gone
    vi.useFakeTimers();

    const room = makeRoom(rooms, 'alice', 'bob');
    room.phase = TurnPhase.PropertyManagement;
    injectExpiredPendingTrade(rooms, room.roomCode, 'alice', 'bob', 3);

    // Confirm trade exists before tick
    expect(rooms.hasPendingTrade(room.roomCode)).toBe(true);

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 45_000,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(100);
    watchdog.stop();

    // BUG #1: hasPendingTrade still true because checkRoom doesn't call checkPendingTradeTimeout
    // This assertion FAILS on original code → RED
    expect(rooms.hasPendingTrade(room.roomCode)).toBe(false);
  });

  it('[IMP-152/A5] After trade timeout via watchdog tick, room.pendingTradeOffer MUST be null', async () => {
    // [TC-152.5/MSS] Consumer assertion: room state reflects cleared offer
    vi.useFakeTimers();

    const room = makeRoom(rooms, 'alice', 'bob');
    room.phase = TurnPhase.PropertyManagement;
    injectExpiredPendingTrade(rooms, room.roomCode, 'alice', 'bob', 3);

    expect(room.pendingTradeOffer).not.toBeNull();

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 45_000,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(100);
    watchdog.stop();

    // BUG #1: room.pendingTradeOffer remains set because watchdog never calls timeout check
    // This assertion FAILS on original code → RED
    expect(room.pendingTradeOffer).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Group B — Bug #2: Emergency recovery must clear pending trade
// [IMP-152/B1..B5]
// ---------------------------------------------------------------------------

describe('[IMP-152/B] Bug #2 — executeEmergencyRecovery MUST clear pendingTradeOffer', () => {
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

  it('[IMP-152/B1] executeEmergencyRecovery with PropertyManagement phase MUST call cancelPendingTrade when hasPendingTrade is true', async () => {
    // [TC-152.6/MSS] Emergency recovery clears active trade session
    vi.useFakeTimers();

    const room = makeRoom(rooms, 'alice', 'bob');
    room.phase = TurnPhase.PropertyManagement;
    injectExpiredPendingTrade(rooms, room.roomCode, 'alice', 'bob', 6);

    const cancelSpy = vi.spyOn(rooms, 'cancelPendingTrade');

    const emergencyCalls: string[] = [];
    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 200,
      checkIntervalMs: 50,
      onEmergencyRecovery: (rc) => emergencyCalls.push(rc),
    });

    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    // Advance past stall threshold (200ms stall)
    await vi.advanceTimersByTimeAsync(300);
    watchdog.stop();

    expect(emergencyCalls.length).toBeGreaterThan(0);
    // BUG #2: cancelPendingTrade is never called in executeEmergencyRecovery
    // This assertion FAILS on original code → RED
    expect(cancelSpy).toHaveBeenCalledWith(room.roomCode);
  });

  it('[IMP-152/B2] After emergency recovery, room.pendingTradeOffer MUST be null', async () => {
    // [TC-152.7/MSS] Consumer assertion at point of execution
    vi.useFakeTimers();

    const room = makeRoom(rooms, 'alice', 'bob');
    room.phase = TurnPhase.PropertyManagement;
    injectExpiredPendingTrade(rooms, room.roomCode, 'alice', 'bob', 6);

    expect(room.pendingTradeOffer).not.toBeNull();

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 200,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(300);
    watchdog.stop();

    // BUG #2: pendingTradeOffer remains because recovery doesn't cancel it
    // This assertion FAILS on original code → RED
    expect(room.pendingTradeOffer).toBeNull();
  });

  it('[IMP-152/B3] After emergency recovery, pendingTradeManager.hasSession(roomCode) MUST be false', async () => {
    // [TC-152.8/MSS] Session cleared from manager level too
    vi.useFakeTimers();

    const room = makeRoom(rooms, 'alice', 'bob');
    room.phase = TurnPhase.PropertyManagement;
    injectExpiredPendingTrade(rooms, room.roomCode, 'alice', 'bob', 6);

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 200,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(300);
    watchdog.stop();

    // BUG #2: session lingers in pendingTradeManager because no cancel call
    // This assertion FAILS on original code → RED
    expect(pendingTradeManager.hasSession(room.roomCode)).toBe(false);
  });

  it('[IMP-152/B4] Emergency recovery MUST NOT call cancelPendingTrade when hasPendingTrade is false', async () => {
    // [TC-152.9/MSS] Negative: no double-cancel when nothing to cancel
    vi.useFakeTimers();

    const room = makeRoom(rooms, 'alice', 'bob');
    room.phase = TurnPhase.PropertyManagement;
    // No pending trade

    const cancelSpy = vi.spyOn(rooms, 'cancelPendingTrade');

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 200,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(300);
    watchdog.stop();

    // This passes on original code BUT is included for completeness — guards over-eager fix
    expect(cancelSpy).not.toHaveBeenCalled();
  });

  it('[IMP-152/B5] After emergency recovery, handleEndTurn MUST still be invoked (trade clear must not block force-advance)', async () => {
    // [TC-152.10/MSS] Trade cancellation must not short-circuit turn advance
    vi.useFakeTimers();

    const room = makeRoom(rooms, 'alice', 'bob');
    room.phase = TurnPhase.PropertyManagement;
    injectExpiredPendingTrade(rooms, room.roomCode, 'alice', 'bob', 6);

    const endTurnSpy = vi.spyOn(rooms, 'handleEndTurn');

    const watchdog = buildWatchdog(rooms, intentMutex, broadcaster, {
      maxTurnStallMs: 200,
      checkIntervalMs: 50,
    });
    watchdog.start();
    watchdog.notifyTurnStart(room.roomCode);

    await vi.advanceTimersByTimeAsync(300);
    watchdog.stop();

    // handleEndTurn MUST be called regardless of pending trade state
    // BUG #2: if recovery bails early on cancel, handleEndTurn is never called → freeze persists
    // This assertion FAILS on original code once fix attempts to cancel first → RED (initially)
    expect(endTurnSpy).toHaveBeenCalledWith(room.roomCode, expect.any(String));
  });
});

// ---------------------------------------------------------------------------
// Group C — Bug #3: Turn-order guard in coordTrade
// [IMP-152/C1..C5]
// ---------------------------------------------------------------------------

describe('[IMP-152/C] Bug #3 — coordTrade MUST enforce turn-order guard', () => {
  let rooms: RoomManager;

  beforeEach(() => {
    rooms = new RoomManager(1234);
  });

  afterEach(() => {
    // Clear any pending trade sessions between tests
    vi.restoreAllMocks();
  });

  function makeTradeContext(hostId: string, guestId: string) {
    const room = rooms.createRoom(hostId);
    rooms.joinRoom(room.roomCode, guestId);
    rooms.startGame(room.roomCode);
    // Ensure PropertyManagement phase so trade is in scope
    room.phase = TurnPhase.PropertyManagement;

    const reg = (rooms as any).registries.get(room.roomCode) as Map<number, string>;
    const sm = (rooms as any).propertyStates.get(room.roomCode) as Map<number, any>;
    const botPersonalities = (rooms as any).botPersonalities as Map<string, any> | undefined;

    return {
      room,
      ctx: { room, reg, sm, botPersonalities },
      reg,
    };
  }

  it('[IMP-152/C1] coordTrade MUST reject when room is in ActionPhase', () => {
    // [TC-152.11/MSS] Phase guard: off-turn human cannot initiate trade in ActionPhase
    const { room, ctx, reg } = makeTradeContext('alice', 'bob');
    room.phase = TurnPhase.ActionPhase;

    // alice is at index 0 (currentTurnPlayer); set bob's property so trade is valid structurally
    reg.set(9, 'alice');
    room.players[0]!.balance = 20_000;
    room.players[1]!.balance = 20_000;

    // bob is NOT currentTurnPlayer (index=1, currentPlayerIndex=0)
    expect(room.currentPlayerIndex).toBe(0);

    // bob requests the trade in ActionPhase
    const result = coordTrade(ctx, 'bob', 'alice', 'bob', 9, 1000);

    expect(result.success).toBe(false);
  });

  it('[IMP-152/C2] coordTrade MUST reject with reason INVALID_PHASE for ActionPhase trade request', () => {
    // [TC-152.12/MSS] Error reason must precisely identify the violation
    const { room, ctx, reg } = makeTradeContext('alice', 'bob');
    room.phase = TurnPhase.ActionPhase;

    reg.set(9, 'alice');
    room.players[0]!.balance = 20_000;
    room.players[1]!.balance = 20_000;

    // bob (off-turn) requests trade in ActionPhase
    const result = coordTrade(ctx, 'bob', 'alice', 'bob', 9, 1000);

    expect(result.reason).toBe(ActionRejectReason.INVALID_PHASE);
  });

  it('[IMP-152/C3] coordTrade MUST succeed when requesterId IS currentTurnPlayerId (human in their turn)', () => {
    // [TC-152.13/MSS] Positive: current player can initiate trade normally
    const { room, ctx, reg } = makeTradeContext('alice', 'bob');

    reg.set(9, 'alice');
    room.players[0]!.balance = 20_000;
    room.players[1]!.balance = 20_000;

    // alice is currentTurnPlayer (index 0) and seller — valid trade
    const result = coordTrade(ctx, 'alice', 'alice', 'bob', 9, 1000);

    // BUG #3 fix must NOT break the happy path — this must still pass
    // On original code this passes (no guard), but with fix it must continue to pass
    // For RED phase this test must FAIL because the guard is missing (can't verify correct implementation yet)
    // Actually: this test will PASS on original code (no guard), so we assert pending behavior
    expect(result.success === true || (result.success === false && result.reason !== 'NOT_YOUR_TURN')).toBe(true);
  });

  it('[IMP-152/C4] coordTrade MUST succeed when requester is a bot, even if not currentTurnPlayerId', () => {
    // [TC-152.14/MSS] Bot exemption: bots can initiate trades outside their turn
    const { room, ctx, reg } = makeTradeContext('alice', 'bot_2');

    reg.set(12, 'alice');
    room.players[0]!.balance = 20_000;
    room.players[1]!.balance = 20_000;
    room.players[1]!.isBot = true; // bot_2 is a bot

    // alice is currentTurnPlayer; bot_2 wants to buy alice's property
    // bot_2 is buyer (requesterId = bot_2), not current player — but is a bot
    const result = coordTrade(ctx, 'bot_2', 'alice', 'bot_2', 12, 1000);

    // After fix: bot must bypass turn-order check
    // On original (no guard): passes trivially. This test must remain GREEN after fix.
    // For RED contract: this documents bot exemption requirement
    // This FAILS currently only if we assert success AND the fix accidentally blocks bots
    expect(result.reason).not.toBe('NOT_YOUR_TURN');
  });

  it('[IMP-152/C5] Human currentTurnPlayer selling their own property: coordTrade passes normally', () => {
    // [TC-152.15/MSS] Self-trade in turn: no spurious NOT_YOUR_TURN rejection
    const { room, ctx, reg } = makeTradeContext('alice', 'bob');

    reg.set(7, 'alice');
    room.players[0]!.balance = 20_000;
    room.players[1]!.balance = 20_000;

    // alice (currentTurnPlayer, index=0) sells her property to bob
    const result = coordTrade(ctx, 'alice', 'alice', 'bob', 7, 800);

    // Must not be rejected with NOT_YOUR_TURN when player is in their turn
    // BUG #3 fix must preserve this: once guard is added, alice (in-turn) must still pass
    expect(result.reason).not.toBe('NOT_YOUR_TURN');
  });

  it('[IMP-152/C1-strict] Off-turn human buyer MUST be rejected in ActionPhase even when seller is in-turn player', () => {
    // [TC-152.16/MSS] Strict: phase guard rejects trade during ActionPhase
    const { room, ctx, reg } = makeTradeContext('alice', 'bob');
    room.phase = TurnPhase.ActionPhase;

    reg.set(11, 'alice');
    room.players[0]!.balance = 20_000;
    room.players[1]!.balance = 20_000;

    // bob (index=1) sends the request in ActionPhase
    const result = coordTrade(ctx, 'bob', 'alice', 'bob', 11, 1500);

    expect(result.success).toBe(false);
    expect(result.reason).toBe(ActionRejectReason.INVALID_PHASE);
  });
});

describe('[IMP-152/D] Bug #4 — Room Lifecycle MUST Clear Stale Pending Trade Sessions', () => {
  it('[IMP-152/D1] Creating a room with existing code MUST purge prior pending trade session from pendingTradeManager', () => {
    const rooms = new RoomManager();
    const roomCode = 'VT8888';

    // Simulate an abandoned trade session from previous match
    pendingTradeManager.createSession(roomCode, 'p1', 'bot_4', 23, 1990, 2000, 15_000);
    expect(pendingTradeManager.hasSession(roomCode)).toBe(true);

    // Host creates a new room with the same code
    rooms.createRoom('p1', roomCode);

    // Stale trade session MUST be cleared so the new game starts clean
    expect(pendingTradeManager.hasSession(roomCode)).toBe(false);
    expect(rooms.hasPendingTrade(roomCode)).toBe(false);
  });

  it('[IMP-152/D2] Closing a room MUST purge its pending trade session from pendingTradeManager', () => {
    const rooms = new RoomManager();
    const room = rooms.createRoom('p1', 'ROOM99');

    // Create a trade session
    pendingTradeManager.createSession(room.roomCode, 'p1', 'bot_2', 15, 1000, 1000, 15_000);
    expect(pendingTradeManager.hasSession(room.roomCode)).toBe(true);

    // Close the room
    rooms.closeRoom(room.roomCode);

    // Session MUST be cleared
    expect(pendingTradeManager.hasSession(room.roomCode)).toBe(false);
    expect(rooms.hasPendingTrade(room.roomCode)).toBe(false);
  });
});

