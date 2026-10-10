// [CONTRACT TEST] IMP-347: Bot Negotiation Brain Decoupling & Pure Domain Heuristics
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluateBotTradeDecision,
  type BotNegotiationContext,
} from '../../src/domain/bot/bot_negotiation_brain.js';
import {
  TurnPhase,
  ActionRejectReason,
  type Room,
  type Player,
} from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { coordRespondTradeOffer } from '../../src/server/room_trade_coordinator.js';
import { pendingTradeManager } from '../../src/server/pending_trade_manager.js';
import type { RoomContext } from '../../src/server/room_property_coordinator.js';

function createMockPlayer(id: string, partial: Partial<Player> = {}): Player {
  return {
    id,
    position: 0,
    balance: 5000,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
    isBot: true,
    ...partial,
  };
}

function createMockRoom(players: Player[], partial: Partial<Room> = {}): Room {
  return {
    roomCode: 'R34701',
    hostId: players[0]?.id ?? 'p1',
    players,
    currentPlayerIndex: 0,
    phase: TurnPhase.PropertyManagement,
    started: true,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 10000,
    roundCount: 1,
    ...partial,
  };
}

describe('[IMP-347] Bot Negotiation Brain Contract Suite', () => {
  beforeEach(() => {
    pendingTradeManager.clearSession('R34701');
    pendingTradeManager.clearSession('R34705');
    pendingTradeManager.clearSession('R34706');
    pendingTradeManager.clearSession('R34707');
  });

  it('[TC-347.01/MSS][UC-BRAIN/MSS] Standard cash-only trade offer exceeding 1.40x base price without monopoly/embargo returns accept: true', () => {
    const seller = createMockPlayer('bot_seller', { isBot: true, balance: 5000 });
    const buyer = createMockPlayer('p_buyer', { isBot: false, balance: 10000 });
    const p3 = createMockPlayer('p3', { isBot: false, balance: 5000 });
    const room = createMockRoom([seller, buyer, p3], { roomCode: 'R34701' });

    // Cell 3 (Bắc Giang - Brown) base price 600. Seller owns cell 3. Buyer owns no brown cells.
    const registry: PropertyRegistry = new Map([[3, 'bot_seller']]);
    const stateMap: PropertyStateMap = new Map([[3, { level: 0, isMortgaged: false }]]);
    const botPersonalities = new Map<string, BotPersonality>([
      ['R34701:bot_seller', BotPersonality.Balanced],
    ]);

    // Buyer offers 900 (1.50x of 600 > 1.40x) cash-only
    const decision = evaluateBotTradeDecision(
      { room, registry, stateMap, botPersonalities },
      seller,
      buyer,
      3,
      900,
    );

    expect(decision.accept).toBe(true);
    expect(decision.reason).toBeUndefined();
  });

  it('[TC-347.02/A1][UC-BRAIN/A1] Predatory swap deal (Human offers Brown 1 + demands $500 cash for Bot Dark Blue 39) is rejected with UNFAVORABLE_VALUATION due to Net Equity Floor violation', () => {
    // Bot owns Dark Blue cell 39 ($4,000) and Brown cell 3 ($600)
    const seller = createMockPlayer('bot_seller', { isBot: true, balance: 5000 });
    // Human owns Brown cell 1 ($600)
    const buyer = createMockPlayer('human_buyer', { isBot: false, balance: 10000 });
    const p3 = createMockPlayer('p3', { isBot: false, balance: 5000 });
    const room = createMockRoom([seller, buyer, p3], { roomCode: 'R34701' });

    const registry: PropertyRegistry = new Map([
      [39, 'bot_seller'],
      [3, 'bot_seller'],
      [1, 'human_buyer'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [39, { level: 0, isMortgaged: false }],
      [3, { level: 0, isMortgaged: false }],
      [1, { level: 0, isMortgaged: false }],
    ]);
    const botPersonalities = new Map<string, BotPersonality>([
      ['R34701:bot_seller', BotPersonality.Balanced],
    ]);

    // Swap offer: Bot surrenders cell 39, receives cell 1 (completes Brown monopoly), BUT buyer demands $500 cash (price = -500)
    // Total value received by bot = 600 - 500 = 100 < 65% of 4000 (2600)
    const decision = evaluateBotTradeDecision(
      { room, registry, stateMap, botPersonalities },
      seller,
      buyer,
      39,
      -500,
      1,
    );

    expect(decision.accept).toBe(false);
    expect(decision.reason).toBe('UNFAVORABLE_VALUATION');
  });

  it('[TC-347.03/A2][UC-BRAIN/A2] Runaway leader Bot A offers 1.65x for monopoly key cell 32 to Bot B, upholds EMBARGO_LEADER and refuses 1.60x parity override', () => {
    // Bot B owns Green cell 32 ($3,000). Balance 5000.
    const seller = createMockPlayer('bot_b', { isBot: true, balance: 5000 });
    // Bot A is runaway leader with overwhelming balance ($45,000)
    const buyer = createMockPlayer('bot_a', { isBot: true, balance: 45000 });
    const p3 = createMockPlayer('p3', { isBot: true, balance: 5000 });
    const room = createMockRoom([seller, buyer, p3], { roomCode: 'R34701' });

    // Bot A owns cell 31 and 34 (completing Green monopoly if it gets 32)
    const registry: PropertyRegistry = new Map([
      [32, 'bot_b'],
      [31, 'bot_a'],
      [34, 'bot_a'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [32, { level: 0, isMortgaged: false }],
      [31, { level: 0, isMortgaged: false }],
      [34, { level: 0, isMortgaged: false }],
    ]);
    const botPersonalities = new Map<string, BotPersonality>([
      ['R34701:bot_b', BotPersonality.Balanced],
      ['R34701:bot_a', BotPersonality.Aggressive],
    ]);

    // Bot A offers 1.65x base price (4950 > 1.60x). Must NOT override EMBARGO_LEADER
    const decision = evaluateBotTradeDecision(
      { room, registry, stateMap, botPersonalities },
      seller,
      buyer,
      32,
      4950,
    );

    expect(decision.accept).toBe(false);
    expect(decision.reason).toBe('EMBARGO_LEADER');
  });

  it('[TC-347.04/A3][UC-BRAIN/A3] Impoverished seller Bot with balance < 2000 receiving monopoly key offer from wealthiest player triggers KINGMAKING_DEFENSE and rejects fire-sale pricing', () => {
    // Seller bot has low balance (< 2000)
    const seller = createMockPlayer('bot_poor', { isBot: true, balance: 1500 });
    // Buyer has balance > seller.balance * 3 (10,000 > 4,500), while p3 is leading player
    const buyer = createMockPlayer('p_wealthy', { isBot: false, balance: 10000 });
    const p3 = createMockPlayer('p3', { isBot: true, balance: 30000 });
    const room = createMockRoom([seller, buyer, p3], { roomCode: 'R34701' });

    // Cell 3 (base 600). Buyer already owns cell 1 (Brown), so getting 3 gives buyer monopoly!
    const registry: PropertyRegistry = new Map([
      [3, 'bot_poor'],
      [1, 'p_wealthy'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [3, { level: 0, isMortgaged: false }],
      [1, { level: 0, isMortgaged: false }],
    ]);
    const botPersonalities = new Map<string, BotPersonality>([
      ['R34701:bot_poor', BotPersonality.Balanced],
    ]);

    // Buyer offers 810 (1.35x base price) to exploit poor bot
    const decision = evaluateBotTradeDecision(
      { room, registry, stateMap, botPersonalities },
      seller,
      buyer,
      3,
      810,
    );

    expect(decision.accept).toBe(false);
    expect(decision.reason).toBe('KINGMAKING_DEFENSE');
  });

  it('[TC-347.05/A4][UC-BRAIN/A4] Pending trade offer modal active during PropertyManagement, server phase transitions to AuctionPhase, player responds accept: true -> coordRespondTradeOffer rejects with INVALID_PHASE without mutating assets', () => {
    const seller = createMockPlayer('p1_seller', { isBot: false, balance: 5000 });
    const buyer = createMockPlayer('p2_buyer', { isBot: true, balance: 5000 });
    const room = createMockRoom([seller, buyer], {
      roomCode: 'R34705',
      phase: TurnPhase.PropertyManagement,
    });
    const reg: PropertyRegistry = new Map([[1, 'p1_seller']]);
    const sm: PropertyStateMap = new Map([[1, { level: 0, isMortgaged: false }]]);
    const ctx: RoomContext = { room, reg, sm };

    const session = pendingTradeManager.createSession(
      room.roomCode,
      'p2_buyer',
      'p1_seller',
      1,
      1000,
      600,
      15_000,
      undefined,
      'p1_seller',
    );
    room.pendingTradeOffer = {
      offerId: session.offerId,
      cellIndex: 1,
      price: 1000,
      buyerId: 'p2_buyer',
      sellerId: 'p1_seller',
      requesterId: 'p2_buyer',
      targetPlayerId: 'p1_seller',
      expiresAt: session.expiresAt,
    };

    // Transition to AuctionPhase while modal was open
    room.phase = TurnPhase.AuctionPhase;

    // Player accepts late modal offer
    const res = coordRespondTradeOffer(ctx, 'p1_seller', session.offerId, true);

    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INVALID_PHASE);
    expect(reg.get(1)).toBe('p1_seller');
    expect(buyer.balance).toBe(5000);
  });

  it('[TC-347.06/A5][UC-BRAIN/A5] Pending hybrid trade offer rejection -> recordTradeRejection sets lastTradeOfferRound, cellTradeRejections, cellLastRejectedRound, and swapPairLastRejectedRound atomically', () => {
    const mgr = new RoomManager(34706);
    const room = mgr.createRoom('p1_buyer');
    mgr.joinRoom(room.roomCode, 'p2_seller');
    mgr.startGame(room.roomCode);
    room.roundCount = 3;

    const buyer = room.players[0]!;
    buyer.isBot = true;

    // Pending hybrid trade offer (offeredCellIndex: 3, wanted cellIndex: 1)
    const session = pendingTradeManager.createSession(
      room.roomCode,
      'p1_buyer',
      'p2_seller',
      1,
      500,
      600,
      15_000,
      3,
      'p2_seller',
    );
    room.pendingTradeOffer = {
      offerId: session.offerId,
      cellIndex: session.cellIndex,
      price: session.price,
      buyerId: session.buyerId,
      sellerId: session.sellerId,
      requesterId: session.buyerId,
      targetPlayerId: 'p2_seller',
      expiresAt: session.expiresAt,
      offeredCellIndex: 3,
    };

    // Advance time past expiration (15s) and trigger timeout
    const res = mgr.checkPendingTradeTimeout(room.roomCode, Date.now() + 20_000);

    expect(res.timeout).toBe(true);
    expect(buyer.cellTradeRejections?.[1]).toBe(1);
    expect(buyer.swapPairLastRejectedRound?.['1_3']).toBe(3);
  });

  it('[TC-347.07/A6][UC-BRAIN/A6] Property transferred via trade accept -> clearTradeRejectionForCell cleanses stale rejection counts on all active players', () => {
    const seller = createMockPlayer('p1_seller', { isBot: false, balance: 5000 });
    const buyer = createMockPlayer('p2_buyer', { isBot: true, balance: 5000, cellTradeRejections: { 1: 1 } });
    const p3 = createMockPlayer('p3_bot', {
      isBot: true,
      balance: 5000,
      cellTradeRejections: { 1: 2 },
      cellLastRejectedRound: { 1: 3 },
    });
    const room = createMockRoom([seller, buyer, p3], {
      roomCode: 'R34707',
      phase: TurnPhase.PropertyManagement,
    });
    const reg: PropertyRegistry = new Map([[1, 'p1_seller']]);
    const sm: PropertyStateMap = new Map([[1, { level: 0, isMortgaged: false }]]);
    const ctx: RoomContext = { room, reg, sm };

    const session = pendingTradeManager.createSession(
      room.roomCode,
      'p2_buyer',
      'p1_seller',
      1,
      1000,
      600,
      15_000,
      undefined,
      'p1_seller',
    );
    room.pendingTradeOffer = {
      offerId: session.offerId,
      cellIndex: 1,
      price: 1000,
      buyerId: 'p2_buyer',
      sellerId: 'p1_seller',
      requesterId: 'p2_buyer',
      targetPlayerId: 'p1_seller',
      expiresAt: session.expiresAt,
    };

    const res = coordRespondTradeOffer(ctx, 'p1_seller', session.offerId, true);

    expect(res.success).toBe(true);
    expect(buyer.cellTradeRejections?.[1]).toBeUndefined();
    expect(p3.cellTradeRejections?.[1]).toBeUndefined();
  });

  it('[TC-347.08/A7][UC-BRAIN/A7] Swap trade offer where bot lacks cash to pay difference (INSUFFICIENT_FUNDS) -> Whitelist parity prevents 1.60x override and upholds rejection', () => {
    // Seller Bot has only $500 balance, personality Balanced
    const seller = createMockPlayer('bot_seller', { isBot: true, balance: 500 });
    // Buyer Bot has cell 39 ($4,000)
    const buyer = createMockPlayer('bot_buyer', { isBot: true, balance: 10000 });
    const p3 = createMockPlayer('p3', { isBot: false, balance: 5000 });
    const room = createMockRoom([seller, buyer, p3], { roomCode: 'R34701' });

    const registry: PropertyRegistry = new Map([
      [1, 'bot_seller'],
      [39, 'bot_buyer'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [1, { level: 0, isMortgaged: false }],
      [39, { level: 0, isMortgaged: false }],
    ]);
    const botPersonalities = new Map<string, BotPersonality>([
      ['R34701:bot_seller', BotPersonality.Balanced],
      ['R34701:bot_buyer', BotPersonality.Balanced],
    ]);

    // Swap offer: Bot surrenders cell 1 ($600), receives cell 39 ($4,000), but must pay $2,000 cash (price = -2000)
    // Bot balance is only 500 -> INSUFFICIENT_FUNDS!
    // Total offered (4000 - 2000 = 2000) >= 1.60x of 600 (960), but Whitelist parity MUST NOT override INSUFFICIENT_FUNDS in swap deals!
    const decision = evaluateBotTradeDecision(
      { room, registry, stateMap, botPersonalities },
      seller,
      buyer,
      1,
      -2000,
      39,
    );

    expect(decision.accept).toBe(false);
    expect(decision.reason).toBe('INSUFFICIENT_FUNDS');
  });
});
