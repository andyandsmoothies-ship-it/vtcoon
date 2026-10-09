import { describe, it, expect, beforeEach } from 'vitest';
import { TurnPhase, ActionRejectReason, type Room, type Player } from '../../src/domain/room.js';
import {
  isRoomQuiescentForTrade,
  isCellLockedInPendingTrade,
  coordTrade,
  coordRespondTradeOffer,
} from '../../src/server/room_trade_coordinator.js';
import type { RoomContext } from '../../src/server/room_property_coordinator.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_manager.js';
import { pendingTradeManager } from '../../src/server/pending_trade_manager.js';

function createMockRoom(phase: TurnPhase = TurnPhase.WaitingRoll): Room {
  const p1: Player = {
    id: 'p1',
    name: 'Player 1',
    position: 0,
    balance: 1500,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
  };
  const p2: Player = {
    id: 'p2',
    name: 'Player 2',
    position: 0,
    balance: 1500,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
  };

  return {
    roomCode: 'TEST_ROOM',
    hostId: 'p1',
    players: [p1, p2],
    currentPlayerIndex: 0,
    phase,
    started: true,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 50000,
    roundCount: 1,
  };
}

function createMockContext(room: Room): RoomContext {
  const reg: PropertyRegistry = new Map<number, string>();
  const sm: PropertyStateMap = new Map();
  return {
    room,
    reg,
    sm,
  };
}

describe('Room Trade Coordinator Contract Suite', () => {
  beforeEach(() => {
    pendingTradeManager.clearSession('TEST_ROOM');
  });

  it('TC-RTC-QUI.01 [UC-RTC/MSS] Given room in WaitingRoll phase, When checked for quiescence, Then returns true', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    const result = isRoomQuiescentForTrade(room);
    expect(result).toBe(true);
  });

  it('TC-RTC-QUI.02 [UC-RTC/MSS] Given room in AuctionPhase, When checked for quiescence, Then returns false', () => {
    const room = createMockRoom(TurnPhase.AuctionPhase);
    const result = isRoomQuiescentForTrade(room);
    expect(result).toBe(false);
  });

  it('TC-RTC-QUI.03 [UC-RTC/MSS] Given room in InsolvencyPhase, When checked for quiescence, Then returns false', () => {
    const room = createMockRoom(TurnPhase.InsolvencyPhase);
    const result = isRoomQuiescentForTrade(room);
    expect(result).toBe(false);
  });

  it('TC-RTC-QUI.04 [UC-RTC/MSS] Given room with pendingBuyout, When checked for quiescence, Then returns false', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    room.pendingBuyout = {
      buyerId: 'p1',
      sellerId: 'p2',
      cellIndex: 5,
      cost: 500,
      basePrice: 500,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15000,
    };
    const result = isRoomQuiescentForTrade(room);
    expect(result).toBe(false);
  });

  it('TC-RTC-QUI.05 [UC-RTC/MSS] Given room in PropertyManagement phase, When checked for quiescence, Then returns true', () => {
    const room = createMockRoom(TurnPhase.PropertyManagement);
    const result = isRoomQuiescentForTrade(room);
    expect(result).toBe(true);
  });

  it('TC-RTC-QUI.06 [UC-RTC/MSS] Given room with currentAuction active, When checked for quiescence, Then returns false', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    room.currentAuction = {
      cellIndex: 1,
      declinedPlayerId: 'p1',
    };
    const result = isRoomQuiescentForTrade(room);
    expect(result).toBe(false);
  });

  it('TC-RTC-LCK.01 [UC-RTC/MSS] Given room with pendingTradeOffer on cellIndex 5, When checking cell 5, Then returns true', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    room.pendingTradeOffer = {
      offerId: 'off1',
      cellIndex: 5,
      price: 200,
      buyerId: 'p2',
      sellerId: 'p1',
      requesterId: 'p1',
      targetPlayerId: 'p2',
      expiresAt: Date.now() + 10000,
    };
    const locked = isCellLockedInPendingTrade(room, 5);
    expect(locked).toBe(true);
  });

  it('TC-RTC-LCK.02 [UC-RTC/MSS] Given room with pendingTradeOffer on offeredCellIndex 12, When checking cell 12, Then returns true', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    room.pendingTradeOffer = {
      offerId: 'off1',
      cellIndex: 5,
      offeredCellIndex: 12,
      price: 200,
      buyerId: 'p2',
      sellerId: 'p1',
      requesterId: 'p1',
      targetPlayerId: 'p2',
      expiresAt: Date.now() + 10000,
    };
    const locked = isCellLockedInPendingTrade(room, 12);
    expect(locked).toBe(true);
  });

  it('TC-RTC-LCK.03 [UC-RTC/MSS] Given room without pendingTradeOffer, When checking cell 5, Then returns false', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    const locked = isCellLockedInPendingTrade(room, 5);
    expect(locked).toBe(false);
  });

  it('TC-RTC-TRD.01 [UC-RTC/MSS] Given undefined RoomContext, When coordTrade is invoked, Then returns failure with INVALID_ROOM', () => {
    const res = coordTrade(undefined, 'p1', 'p1', 'p2', 5, 200);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INVALID_ROOM);
  });

  it('TC-RTC-TRD.02 [UC-RTC/MSS] Given room in ActionPhase, When coordTrade is invoked, Then returns failure with INVALID_PHASE', () => {
    const room = createMockRoom(TurnPhase.ActionPhase);
    const ctx = createMockContext(room);
    const res = coordTrade(ctx, 'p1', 'p1', 'p2', 5, 200);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INVALID_PHASE);
  });

  it('TC-RTC-TRD.03 [UC-RTC/MSS] Given room with active pendingTradeOffer, When coordTrade is invoked, Then returns TRADE_ALREADY_PENDING', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    room.pendingTradeOffer = {
      offerId: 'off1',
      cellIndex: 1,
      price: 100,
      buyerId: 'p2',
      sellerId: 'p1',
      requesterId: 'p1',
      targetPlayerId: 'p2',
      expiresAt: Date.now() + 10000,
    };
    const ctx = createMockContext(room);
    const res = coordTrade(ctx, 'p1', 'p1', 'p2', 5, 200);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.TRADE_ALREADY_PENDING);
  });

  it('TC-RTC-TRD.04 [UC-RTC/MSS] Given requesterId not matching sellerId or buyerId, When coordTrade is invoked, Then returns UNAUTHORIZED', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    const ctx = createMockContext(room);
    const res = coordTrade(ctx, 'p3', 'p1', 'p2', 5, 200);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.UNAUTHORIZED);
  });

  it('TC-RTC-TRD.05 [UC-RTC/MSS] Given buyer balance less than price, When coordTrade is invoked, Then returns INSUFFICIENT_FUNDS', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    room.players[1]!.balance = 100;
    const ctx = createMockContext(room);
    const res = coordTrade(ctx, 'p1', 'p1', 'p2', 5, 500);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
  });

  it('TC-RTC-TRD.06 [UC-RTC/MSS] Given buyer negative balance, When coordTrade is invoked with price 0, Then returns INSUFFICIENT_FUNDS', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    room.players[1]!.balance = -50;
    const ctx = createMockContext(room);
    const res = coordTrade(ctx, 'p1', 'p1', 'p2', 5, 0);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
  });

  it('TC-RTC-TRD.07 [UC-RTC/MSS] Given seller negative balance and non-positive price, When coordTrade is invoked, Then returns INSUFFICIENT_FUNDS', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    room.players[0]!.balance = -10;
    const ctx = createMockContext(room);
    const res = coordTrade(ctx, 'p1', 'p1', 'p2', 5, 0);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
  });

  it('TC-RTC-TRD.08 [UC-RTC/MSS] Given seller bond collateral active on target cell, When coordTrade is invoked, Then returns BOND_COLLATERAL_LOCKED', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    room.players[0]!.bondContract = {
      principal: 5000,
      repayAmount: 5500,
      roundsLeft: 5,
      collateralCells: [5],
      isActive: true,
    };
    const ctx = createMockContext(room);
    const res = coordTrade(ctx, 'p1', 'p1', 'p2', 5, 200);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.BOND_COLLATERAL_LOCKED);
  });

  it('TC-RTC-TRD.09 [UC-RTC/MSS] Given buyer bond collateral active on offered cell, When coordTrade is invoked, Then returns BOND_COLLATERAL_LOCKED', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    room.players[1]!.bondContract = {
      principal: 5000,
      repayAmount: 5500,
      roundsLeft: 5,
      collateralCells: [12],
      isActive: true,
    };
    const ctx = createMockContext(room);
    const res = coordTrade(ctx, 'p1', 'p1', 'p2', 5, 200, 12);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.BOND_COLLATERAL_LOCKED);
  });

  it('TC-RTC-TRD.10 [UC-RTC/MSS] Given valid trade between humans where seller owns property, When coordTrade is invoked, Then executes successfully', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    const ctx = createMockContext(room);
    ctx.reg.set(1, 'p1');
    const res = coordTrade(ctx, 'p1', 'p1', 'p2', 1, 600);
    expect(res.success).toBe(true);
    expect(ctx.reg.get(1)).toBe('p2');
  });

  it('TC-RTC-RSP.01 [UC-RTC/MSS] Given undefined RoomContext, When coordRespondTradeOffer is invoked, Then returns INVALID_ROOM', () => {
    const res = coordRespondTradeOffer(undefined, 'p2', 'off1', true);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INVALID_ROOM);
  });

  it('TC-RTC-RSP.02 [UC-RTC/MSS] Given unknown offerId, When coordRespondTradeOffer is invoked, Then returns INVALID_OFFER_ID', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    const ctx = createMockContext(room);
    const res = coordRespondTradeOffer(ctx, 'p2', 'non_existent_offer', true);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_OFFER_ID');
  });

  it('TC-RTC-RSP.03 [UC-RTC/MSS] Given active offer rejected by target player, When coordRespondTradeOffer is invoked, Then records rejection and returns success', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    const session = pendingTradeManager.createSession('TEST_ROOM', 'p2', 'p1', 1, 300, 300, 15000, undefined, 'p2');
    room.pendingTradeOffer = {
      offerId: session.offerId,
      cellIndex: 1,
      price: 300,
      buyerId: 'p2',
      sellerId: 'p1',
      requesterId: 'p1',
      targetPlayerId: 'p2',
      expiresAt: session.expiresAt,
    };
    const ctx = createMockContext(room);
    const res = coordRespondTradeOffer(ctx, 'p2', session.offerId, false);
    expect(res.success).toBe(true);
    expect(room.players[1]!.cellTradeRejections?.[1]).toBe(1);
    expect(room.pendingTradeOffer).toBeNull();
  });

  it('TC-RTC-RSP.04 [UC-RTC/MSS] Given active offer accepted by target player with sufficient funds, When coordRespondTradeOffer is invoked, Then executes trade and returns success', () => {
    const room = createMockRoom(TurnPhase.WaitingRoll);
    const session = pendingTradeManager.createSession('TEST_ROOM', 'p2', 'p1', 1, 600, 600, 15000, undefined, 'p2');
    room.pendingTradeOffer = {
      offerId: session.offerId,
      cellIndex: 1,
      price: 600,
      buyerId: 'p2',
      sellerId: 'p1',
      requesterId: 'p1',
      targetPlayerId: 'p2',
      expiresAt: session.expiresAt,
    };
    const ctx = createMockContext(room);
    ctx.reg.set(1, 'p1');
    const res = coordRespondTradeOffer(ctx, 'p2', session.offerId, true);
    expect(res.success).toBe(true);
    expect(ctx.reg.get(1)).toBe('p2');
    expect(room.pendingTradeOffer).toBeNull();
  });
});
