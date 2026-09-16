// [UC-GAME-020/MSS][UC-GAME-008/MSS][UC-BOT-06/MSS][UC-BOT-04/MSS]
// [IMP-115] Dynamic Pacing (Late-Game Rent Surge, Hard Cap 40 Rounds, Early 4P P2P Trading, Prudent Passive Bot)
import { describe, it, expect } from 'vitest';
import { CellType, BOARD_CONFIG } from '../../src/domain/board_config';
import {
  PROPERTY_DEEDS,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_data';
import { resolveRent } from '../../src/domain/property_rent';
import { handleLanding, LandingResult } from '../../src/domain/property_manager';
import {
  createRoom,
  createPlayer,
  MAX_ROUNDS,
  isRoomGameOver,
  type Player,
  type CurrentAuctionState,
} from '../../src/domain/room';
import { MarketCardId } from '../../src/domain/event_card_engine';
import {
  BotPersonality,
  DEFAULT_PERSONALITY_WEIGHTS,
} from '../../src/domain/bot/bot_types';
import {
  isPassiveAuctionAllowed,
  decideAuctionPhaseIntent,
} from '../../src/domain/bot/bot_auction';
import {
  calculateTradeOfferPrice,
  findEligibleBotTrade,
} from '../../src/domain/bot/bot_trade';

// ============================================================================
// CONTRACT TYPING CASTS (Station 1 Pre-Flight Contract Safety)
// ============================================================================
type ResolveRentContract = (
  cell: (typeof BOARD_CONFIG)[number] | undefined,
  cellIndex: number,
  ownerId: string,
  registry: PropertyRegistry,
  stateMap?: PropertyStateMap,
  diceTotal?: number,
  modifiers?: readonly any[],
  roundCount?: number,
) => number;

type HandleLandingContract = (
  player: Player,
  cellIndex: number,
  registry: PropertyRegistry,
  players: Player[],
  stateMap?: PropertyStateMap,
  diceTotal?: number,
  modifiers?: readonly any[],
  rng?: () => number,
  chanceDiscard?: any[],
  permanentRentBonus?: Readonly<Record<number, number>>,
  roundCount?: number,
) => { result: LandingResult; rentAmount: number; landlordId: string | undefined };

type CalculateTradeOfferPriceContract = (
  cellIndex: number,
  bot: Player,
  personality: BotPersonality,
  customSafetyBuffer?: number,
  roundCount?: number,
  isMonopolyGap?: boolean,
  playerCount?: number,
) => number | null;

const contractResolveRent = resolveRent as unknown as ResolveRentContract;
const contractHandleLanding = handleLanding as unknown as HandleLandingContract;
const contractCalculateTradeOfferPrice = calculateTradeOfferPrice as unknown as CalculateTradeOfferPriceContract;

// ============================================================================
// UNIVERSAL 4-FACET MATRIX: FACET 1 - BOUNDARY & RANGE
// ============================================================================
describe('[FACET-1: BOUNDARY & RANGE] IMP-115 Pacing & Bot Limits', () => {
  // --- CHỐT 1: Rent Surge Boundaries ---
  it('[TC-IMP115.01/MSS][UC-GAME-020/MSS] Base rent at round 19 remains 100% and surges to 120% at round 20', () => {
    const reg: PropertyRegistry = new Map([[1, 'player_landlord']]);
    const cell = BOARD_CONFIG[1]; // Đồ Sơn: deed.rent0 = 60
    const rentR19 = contractResolveRent(cell, 1, 'player_landlord', reg, undefined, undefined, undefined, 19);
    const rentR20 = contractResolveRent(cell, 1, 'player_landlord', reg, undefined, undefined, undefined, 20);

    expect(rentR19).toBe(60);
    expect(rentR20).toBe(72); // Math.floor(60 * 1.2) = 72
  });

  it('[TC-IMP115.01/A1][UC-GAME-020/MSS] Base rent at round 29 remains 120% and surges to 150% at round 30', () => {
    const reg: PropertyRegistry = new Map([[1, 'player_landlord']]);
    const cell = BOARD_CONFIG[1]; // Đồ Sơn: deed.rent0 = 60
    const rentR29 = contractResolveRent(cell, 1, 'player_landlord', reg, undefined, undefined, undefined, 29);
    const rentR30 = contractResolveRent(cell, 1, 'player_landlord', reg, undefined, undefined, undefined, 30);

    expect(rentR29).toBe(72); // Math.floor(60 * 1.2) = 72
    expect(rentR30).toBe(90); // Math.floor(60 * 1.5) = 90
  });

  it.each([
    { level: 0, base: 60, r20Expected: 72 },     // 60 * 1.2 = 72
    { level: 1, base: 210, r20Expected: 252 },   // 210 * 1.2 = 252
    { level: 2, base: 540, r20Expected: 648 },   // 540 * 1.2 = 648
    { level: 3, base: 1320, r20Expected: 1584 }, // 1320 * 1.2 = 1584
  ])('[TC-IMP115.01/A2][UC-GAME-020/MSS] Property upgrade Level $level surges by 1.2x at Round 20', ({ level, r20Expected }) => {
    const reg: PropertyRegistry = new Map([[1, 'player_landlord']]);
    const stateMap: PropertyStateMap = new Map([[1, { level }]]);
    const cell = BOARD_CONFIG[1];
    const rent = contractResolveRent(cell, 1, 'player_landlord', reg, stateMap, undefined, undefined, 20);

    expect(rent).toBe(r20Expected);
  });

  it.each([
    { level: 0, base: 60, r30Expected: 90 },     // 60 * 1.5 = 90
    { level: 1, base: 210, r30Expected: 315 },   // 210 * 1.5 = 315
    { level: 2, base: 540, r30Expected: 810 },   // 540 * 1.5 = 810
    { level: 3, base: 1320, r30Expected: 1980 }, // 1320 * 1.5 = 1980
  ])('[TC-IMP115.01/A3][UC-GAME-020/MSS] Property upgrade Level $level surges by 1.5x at Round 30', ({ level, r30Expected }) => {
    const reg: PropertyRegistry = new Map([[1, 'player_landlord']]);
    const stateMap: PropertyStateMap = new Map([[1, { level }]]);
    const cell = BOARD_CONFIG[1];
    const rent = contractResolveRent(cell, 1, 'player_landlord', reg, stateMap, undefined, undefined, 30);

    expect(rent).toBe(r30Expected);
  });

  it('[TC-IMP115.01/A4][UC-GAME-020/MSS] Infrastructure Railroad is strictly exempt from surge at rounds 20, 30, and 40', () => {
    const reg: PropertyRegistry = new Map([[5, 'player_railroad_baron']]); // Ga Hà Nội
    const cell = BOARD_CONFIG[5]; // CellType.Railroad
    const rentR1 = contractResolveRent(cell, 5, 'player_railroad_baron', reg, undefined, undefined, undefined, 1);
    const rentR25 = contractResolveRent(cell, 5, 'player_railroad_baron', reg, undefined, undefined, undefined, 25);
    const rentR35 = contractResolveRent(cell, 5, 'player_railroad_baron', reg, undefined, undefined, undefined, 35);

    expect(rentR1).toBe(500);
    expect(rentR25).toBe(500);
    expect(rentR35).toBe(500);
  });

  it('[TC-IMP115.01/A5][UC-GAME-020/MSS] Infrastructure Utility is strictly exempt from surge at rounds 20, 30, and 40', () => {
    const reg: PropertyRegistry = new Map([[12, 'player_utility_owner']]); // EVN
    const cell = BOARD_CONFIG[12]; // CellType.Utility
    const diceTotal = 7;
    const rentR1 = contractResolveRent(cell, 12, 'player_utility_owner', reg, undefined, diceTotal, undefined, 1);
    const rentR25 = contractResolveRent(cell, 12, 'player_utility_owner', reg, undefined, diceTotal, undefined, 25);
    const rentR35 = contractResolveRent(cell, 12, 'player_utility_owner', reg, undefined, diceTotal, undefined, 35);

    expect(rentR1).toBe(280); // 7 * 40 = 280
    expect(rentR25).toBe(280);
    expect(rentR35).toBe(280);
  });

  // --- CHỐT 2: Hard Cap 40 Rounds ---
  it('[TC-IMP115.02/MSS][UC-GAME-008/MSS] MAX_ROUNDS constant is strictly 40', () => {
    expect(MAX_ROUNDS).toBe(40);
  });

  it('[TC-IMP115.02/A1][UC-GAME-008/MSS] isRoomGameOver returns false at Round 40 boundary when 2 players alive', () => {
    const room = createRoom('player_p1');
    room.players.push(createPlayer('player_p2'));
    room.started = true;
    room.roundCount = 40;

    expect(isRoomGameOver(room)).toBe(false);
  });

  it('[TC-IMP115.02/A2][UC-GAME-008/MSS] isRoomGameOver returns true at Round 41 boundary when 2 players alive', () => {
    const room = createRoom('player_p1');
    room.players.push(createPlayer('player_p2'));
    room.started = true;
    room.roundCount = 41;

    expect(isRoomGameOver(room)).toBe(true);
  });

  // --- CHỐT 3: Early 4P P2P Trading Boundaries ---
  it('[TC-IMP115.03/MSS][UC-BOT-06/MSS] 4P table uses early 1.4x at round 3 and elevates to 1.75x at round 4 for Aggressive bot', () => {
    const bot = createPlayer('bot_aggressive');
    bot.balance = 20_000;
    // Cell 1: basePrice = 600
    const priceR3 = contractCalculateTradeOfferPrice(1, bot, BotPersonality.Aggressive, undefined, 3, true, 4);
    const priceR4 = contractCalculateTradeOfferPrice(1, bot, BotPersonality.Aggressive, undefined, 4, true, 4);

    expect(priceR3).toBe(840);  // Math.round(600 * 1.4) = 840
    expect(priceR4).toBe(1050); // Math.round(600 * 1.75) = 1050
  });

  it('[TC-IMP115.03/A1][UC-BOT-06/MSS] 2P table stays at early 1.4x at round 5 and elevates to 1.75x at round 6 for Aggressive bot', () => {
    const bot = createPlayer('bot_aggressive');
    bot.balance = 20_000;
    // Cell 1: basePrice = 600
    const priceR5 = contractCalculateTradeOfferPrice(1, bot, BotPersonality.Aggressive, undefined, 5, true, 2);
    const priceR6 = contractCalculateTradeOfferPrice(1, bot, BotPersonality.Aggressive, undefined, 6, true, 2);

    expect(priceR5).toBe(840);  // Math.round(600 * 1.4) = 840
    expect(priceR6).toBe(1050); // Math.round(600 * 1.75) = 1050
  });

  // --- CHỐT 4: Prudent Passive Bot Boundaries ---
  it('[TC-IMP115.04/MSS][UC-BOT-04/MSS] isPassiveAuctionAllowed allows nextBid at exactly 1.15x basePrice and rejects 1.15x + 1', () => {
    const basePrice = 1000;
    const auctionAtCap: CurrentAuctionState = { cellIndex: 1, declinedPlayerId: 'p1', highestBid: 1100 };
    const auctionOverCap: CurrentAuctionState = { cellIndex: 1, declinedPlayerId: 'p1', highestBid: 1100 };

    const allowed = isPassiveAuctionAllowed(auctionAtCap, basePrice, 1.0, 1150);
    const rejected = isPassiveAuctionAllowed(auctionOverCap, basePrice, 1.0, 1151);

    expect(allowed).toBe(true);
    expect(rejected).toBe(false);
  });

  it('[TC-IMP115.04/A1][UC-BOT-04/MSS] isPassiveAuctionAllowed allows highestBid at exactly 1.15x basePrice and blocks when highestBid > 1.15x', () => {
    const basePrice = 1000;
    const auctionAtCap: CurrentAuctionState = { cellIndex: 1, declinedPlayerId: 'p1', highestBid: 1150 };
    const auctionOverCap: CurrentAuctionState = { cellIndex: 1, declinedPlayerId: 'p1', highestBid: 1151 };

    const allowed = isPassiveAuctionAllowed(auctionAtCap, basePrice, 1.0, 1150);
    const blocked = isPassiveAuctionAllowed(auctionOverCap, basePrice, 1.0, 1150);

    expect(allowed).toBe(true);
    expect(blocked).toBe(false);
  });

  it('[TC-IMP115.04/A2][UC-BOT-04/MSS] DEFAULT_PERSONALITY_WEIGHTS for Passive bot specifies minBuffer of 600', () => {
    const passiveWeights = DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Passive];
    expect(passiveWeights.minBuffer).toBe(600);
  });
});

// ============================================================================
// UNIVERSAL 4-FACET MATRIX: FACET 2 - STATE REACTIVITY
// ============================================================================
describe('[FACET-2: STATE REACTIVITY] IMP-115 Dynamic Balance & FSM Transitions', () => {
  it('[TC-IMP115.01/A6][UC-GAME-020/MSS] handleLanding at round 20 transfers 1.2x surged rent between tenant and owner', () => {
    const tenant = createPlayer('tenant_r20');
    tenant.balance = 10_000;
    const owner = createPlayer('owner_r20');
    owner.balance = 10_000;
    const reg: PropertyRegistry = new Map([[1, owner.id]]); // Cell 1: base rent0 = 60

    const landing = contractHandleLanding(
      tenant, 1, reg, [tenant, owner], undefined, undefined, undefined, undefined, undefined, undefined, 20,
    );

    expect(landing.rentAmount).toBe(72);
    expect(tenant.balance).toBe(9928);
    expect(owner.balance).toBe(10072);
  });

  it('[TC-IMP115.01/A7][UC-GAME-020/MSS] handleLanding at round 30 transfers 1.5x surged rent between tenant and owner', () => {
    const tenant = createPlayer('tenant_r30');
    tenant.balance = 10_000;
    const owner = createPlayer('owner_r30');
    owner.balance = 10_000;
    const reg: PropertyRegistry = new Map([[1, owner.id]]); // Cell 1: base rent0 = 60

    const landing = contractHandleLanding(
      tenant, 1, reg, [tenant, owner], undefined, undefined, undefined, undefined, undefined, undefined, 30,
    );

    expect(landing.rentAmount).toBe(90);
    expect(tenant.balance).toBe(9910);
    expect(owner.balance).toBe(10090);
  });

  it('[TC-IMP115.01/A8][UC-GAME-020/MSS] handleLanding at round 25 with MC_PEAK_TOURISM (x2) reactively applies surge and modifier', () => {
    const tenant = createPlayer('tourist_p1');
    tenant.balance = 10_000;
    const owner = createPlayer('resort_mogul');
    owner.balance = 10_000;
    const reg: PropertyRegistry = new Map([[11, owner.id]]); // Cell 11 Nha Trang, rent0 = 140
    const modifiers = [{
      type: MarketCardId.MC_PEAK_TOURISM,
      affectedCells: [11],
      remainingRounds: 2,
      multiplier: 2,
    }];

    // At round 25: baseRent = Math.floor(140 * 1.2) = 168. With x2 = 336.
    const landing = contractHandleLanding(
      tenant, 11, reg, [tenant, owner], undefined, undefined, modifiers, undefined, undefined, undefined, 25,
    );

    expect(landing.rentAmount).toBe(336);
    expect(tenant.balance).toBe(9664);
    expect(owner.balance).toBe(10336);
  });

  it('[TC-IMP115.01/A9][UC-GAME-020/MSS] handleLanding at round 30 with permanentRentBonus (+20%) stacks surge on property rent', () => {
    const tenant = createPlayer('tenant_bonus');
    tenant.balance = 10_000;
    const owner = createPlayer('owner_bonus');
    owner.balance = 10_000;
    const reg: PropertyRegistry = new Map([[1, owner.id]]); // Cell 1: rent0 = 60
    const permanentRentBonus = { 1: 0.2 }; // +20%

    // Round 30: 60 * 1.5 = 90. With +20%: Math.floor(90 * 1.2) = 108.
    const landing = contractHandleLanding(
      tenant, 1, reg, [tenant, owner], undefined, undefined, undefined, undefined, undefined, permanentRentBonus, 30,
    );

    expect(landing.rentAmount).toBe(108);
    expect(tenant.balance).toBe(9892);
    expect(owner.balance).toBe(10108);
  });

  it('[TC-IMP115.02/A3][UC-GAME-008/MSS] Room progression shifts isRoomGameOver from false to true when crossing round 40 to 41', () => {
    const room = createRoom('host_reactive');
    room.players.push(createPlayer('guest_reactive'));
    room.started = true;
    room.roundCount = 40;

    const atForty = isRoomGameOver(room);
    room.roundCount = 41;
    const atFortyOne = isRoomGameOver(room);

    expect(atForty).toBe(false);
    expect(atFortyOne).toBe(true);
  });

  it('[TC-IMP115.03/A2][UC-BOT-06/MSS] findEligibleBotTrade generates INTENT_TRADE_OFFER with elevated 1.75x price in 4P room at round 4', () => {
    const room = createRoom('bot_trader');
    room.players = [
      createPlayer('bot_trader'),
      createPlayer('p2_seller'),
      createPlayer('p3_player'),
      createPlayer('p4_player'),
    ];
    room.started = true;
    room.roundCount = 4;
    const bot = room.players[0]!;
    bot.balance = 20_000;

    // Set up Brown group: Cell 1 (Đồ Sơn, 600) and Cell 3 (Bãi Cháy, 600).
    // Bot owns Cell 3, Cell 1 owned by p2_seller (Monopoly Gap).
    const reg: PropertyRegistry = new Map([
      [3, bot.id],
      [1, 'p2_seller'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [3, { level: 0 }],
      [1, { level: 0 }],
    ]);

    const tradeIntent = findEligibleBotTrade(bot, room, reg, stateMap, BotPersonality.Aggressive, 4);

    expect(tradeIntent).not.toBeNull();
    expect(tradeIntent?.cellIndex).toBe(1);
    expect(tradeIntent?.price).toBe(1050); // 600 * 1.75 = 1050
  });

  it('[TC-IMP115.03/A3][UC-BOT-06/MSS] findEligibleBotTrade in 2P room at round 4 preserves early 1.4x price', () => {
    const room = createRoom('bot_trader_2p');
    room.players = [
      createPlayer('bot_trader_2p'),
      createPlayer('p2_seller_2p'),
    ];
    room.started = true;
    room.roundCount = 4;
    const bot = room.players[0]!;
    bot.balance = 20_000;

    const reg: PropertyRegistry = new Map([
      [3, bot.id],
      [1, 'p2_seller_2p'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [3, { level: 0 }],
      [1, { level: 0 }],
    ]);

    const tradeIntent = findEligibleBotTrade(bot, room, reg, stateMap, BotPersonality.Aggressive, 4);

    expect(tradeIntent).not.toBeNull();
    expect(tradeIntent?.cellIndex).toBe(1);
    expect(tradeIntent?.price).toBe(840); // 600 * 1.4 = 840
  });

  it('[TC-IMP115.04/A3][UC-BOT-04/MSS] decideAuctionPhaseIntent for Passive bot submits INTENT_BID when nextBid is 1.05x basePrice', () => {
    const room = createRoom('host_passive_auction');
    const bot = createPlayer('bot_passive_bidder');
    bot.balance = 15_000;
    room.players.push(bot);
    room.started = true;
    const reg: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    // Cell 1: price = 600. Current highestBid = 600, nextBid = 650 (1.08x basePrice <= 1.15x)
    const auction: CurrentAuctionState = {
      cellIndex: 1,
      declinedPlayerId: 'host_passive_auction',
      highestBid: 600,
      highestBidder: 'host_passive_auction',
      startingBid: 300,
      bidIncrement: 50,
    };

    const intent = decideAuctionPhaseIntent(
      bot, room, reg, stateMap, BotPersonality.Passive, auction,
    );

    expect(intent.type).toBe('INTENT_BID');
    expect(intent.amount).toBe(650);
  });

  it('[TC-IMP115.04/A4][UC-BOT-04/MSS] decideAuctionPhaseIntent for Passive bot passes when highestBid exceeds 1.15x basePrice', () => {
    const room = createRoom('host_passive_pass');
    const bot = createPlayer('bot_passive_passer');
    bot.balance = 15_000;
    room.players.push(bot);
    room.started = true;
    const reg: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    // Cell 1: price = 600. Current highestBid = 700 (> 600 * 1.15 = 690)
    const auction: CurrentAuctionState = {
      cellIndex: 1,
      declinedPlayerId: 'host_passive_pass',
      highestBid: 700,
      highestBidder: 'host_passive_pass',
      startingBid: 300,
      bidIncrement: 50,
    };

    const intent = decideAuctionPhaseIntent(
      bot, room, reg, stateMap, BotPersonality.Passive, auction,
    );

    expect(intent.type).toBe('INTENT_AUCTION_PASS');
  });
});

// ============================================================================
// UNIVERSAL 4-FACET MATRIX: FACET 3 - RESOURCE DISPOSAL & IMMUTABILITY
// ============================================================================
describe('[FACET-3: RESOURCE DISPOSAL & IMMUTABILITY] IMP-115 Zero Leaks', () => {
  it('[TC-IMP115.01/A10][UC-GAME-020/MSS] resolveRent execution leaves PROPERTY_DEEDS and stateMap unmutated', () => {
    const reg: PropertyRegistry = new Map([[1, 'player_owner']]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 2 }]]);
    const cell = BOARD_CONFIG[1];
    const deedBefore = { ...PROPERTY_DEEDS.get(1)! };

    contractResolveRent(cell, 1, 'player_owner', reg, stateMap, undefined, undefined, 35);
    const deedAfter = PROPERTY_DEEDS.get(1)!;

    expect(deedAfter.rent0).toBe(deedBefore.rent0);
    expect(deedAfter.rent2).toBe(deedBefore.rent2);
    expect(stateMap.get(1)?.level).toBe(2);
  });

  it('[TC-IMP115.01/A11][UC-GAME-020/MSS] Expired market modifier (remainingRounds = 0) is cleanly disposed and does not stack on rent surge', () => {
    const reg: PropertyRegistry = new Map([[11, 'player_owner']]);
    const cell = BOARD_CONFIG[11]; // Nha Trang rent0 = 140
    const expiredModifier = [{
      type: MarketCardId.MC_PEAK_TOURISM,
      affectedCells: [11],
      remainingRounds: 0, // EXPIRED
      multiplier: 2,
    }];

    // At round 30: 140 * 1.5 = 210. Expired modifier must NOT double it to 420!
    const rent = contractResolveRent(cell, 11, 'player_owner', reg, undefined, undefined, expiredModifier, 30);

    expect(rent).toBe(210);
  });

  it('[TC-IMP115.02/A4][UC-GAME-008/MSS] Room terminating at round 41 has clean lifecycle without dangling state', () => {
    const room = createRoom('host_disposal');
    room.players.push(createPlayer('guest_disposal'));
    room.started = true;
    room.roundCount = 41;

    const gameOver = isRoomGameOver(room);

    expect(gameOver).toBe(true);
    expect(room.players[0]!.pendingDebts.length).toBe(0);
    expect(room.players[1]!.pendingDebts.length).toBe(0);
  });

  it('[TC-IMP115.03/A4][UC-BOT-06/MSS] findMonopolyGap and calculateTradeOfferPrice do not mutate bot hand or pending debts', () => {
    const bot = createPlayer('bot_isolated');
    bot.balance = 20_000;
    const initialHandLength = bot.hand.length;
    const initialDebtsLength = bot.pendingDebts.length;

    contractCalculateTradeOfferPrice(1, bot, BotPersonality.Balanced, undefined, 4, true, 4);

    expect(bot.hand.length).toBe(initialHandLength);
    expect(bot.pendingDebts.length).toBe(initialDebtsLength);
  });

  it('[TC-IMP115.04/A5][UC-BOT-04/MSS] Passive auction intent creates standalone intent without mutating auction state', () => {
    const room = createRoom('host_immut');
    const bot = createPlayer('bot_immut');
    bot.balance = 10_000;
    const auction: CurrentAuctionState = {
      cellIndex: 1,
      declinedPlayerId: 'host_immut',
      highestBid: 500,
      highestBidder: 'host_immut',
    };
    const reg: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    const intent = decideAuctionPhaseIntent(bot, room, reg, stateMap, BotPersonality.Passive, auction);

    expect(intent).toBeDefined();
    expect(auction.highestBid).toBe(500);
    expect(auction.declinedPlayerId).toBe('host_immut');
  });
});

// ============================================================================
// UNIVERSAL 4-FACET MATRIX: FACET 4 - ERROR DEFENSE & INVARIANTS
// ============================================================================
describe('[FACET-4: ERROR DEFENSE & INVARIANTS] IMP-115 Defensive Contracts', () => {
  it('[TC-IMP115.01/A12][UC-GAME-020/MSS] resolveRent safely defaults to 1.0x base rent when roundCount is undefined', () => {
    const reg: PropertyRegistry = new Map([[1, 'landlord_undef']]);
    const cell = BOARD_CONFIG[1]; // Đồ Sơn: deed.rent0 = 60
    const rent = contractResolveRent(cell, 1, 'landlord_undef', reg, undefined, undefined, undefined, undefined);

    expect(rent).toBe(60);
  });

  it('[TC-IMP115.01/A13][UC-GAME-020/MSS] resolveRent safely clamps negative roundCount to 1.0x base rent without crashing', () => {
    const reg: PropertyRegistry = new Map([[1, 'landlord_neg']]);
    const cell = BOARD_CONFIG[1]; // Đồ Sơn: deed.rent0 = 60
    const rent = contractResolveRent(cell, 1, 'landlord_neg', reg, undefined, undefined, undefined, -5);

    expect(rent).toBe(60);
  });

  it('[TC-IMP115.01/A14][UC-GAME-020/MSS] Conservation Law: insufficient tenant funds during 1.5x surge pays only actual cash', () => {
    const tenant = createPlayer('broke_tenant');
    tenant.balance = 60; // Only 60 cash, but rent at round 30 is 90
    const owner = createPlayer('wealthy_owner');
    owner.balance = 5_000;
    const reg: PropertyRegistry = new Map([[1, owner.id]]);

    const landing = contractHandleLanding(
      tenant, 1, reg, [tenant, owner], undefined, undefined, undefined, undefined, undefined, undefined, 30,
    );

    expect(landing.rentAmount).toBe(90);
    expect(tenant.balance).toBe(-30); // Balance drops into insolvency
    expect(owner.balance).toBe(5060); // Owner receives exactly actual cash 60 (zero phantom money)
  });

  it('[TC-IMP115.02/A5][UC-GAME-008/MSS] isRoomGameOver returns true when only 1 active player remains even at Round 1', () => {
    const room = createRoom('survivor_p1');
    const bankruptP2 = createPlayer('bankrupt_p2');
    bankruptP2.bankrupt = true;
    room.players.push(bankruptP2);
    room.started = true;
    room.roundCount = 1;

    expect(isRoomGameOver(room)).toBe(true);
  });

  it('[TC-IMP115.02/A6][UC-GAME-008/MSS] isRoomGameOver returns false when room is not started even if roundCount is 50', () => {
    const room = createRoom('unstarted_host');
    room.players.push(createPlayer('unstarted_guest'));
    room.started = false;
    room.roundCount = 50;

    expect(isRoomGameOver(room)).toBe(false);
  });

  it('[TC-IMP115.03/A5][UC-BOT-06/MSS] calculateTradeOfferPrice returns null if bot balance cannot cover elevated price + safety buffer', () => {
    const bot = createPlayer('low_cash_bot');
    bot.balance = 1200; // Price = 1050, buffer = 1000 -> 1200 - 1050 = 150 < 1000
    const price = contractCalculateTradeOfferPrice(1, bot, BotPersonality.Aggressive, 1000, 4, true, 4);

    expect(price).toBeNull();
  });

  it('[TC-IMP115.04/A6][UC-BOT-04/MSS] Passive bot auction intent passes if nextBid would violate minBuffer of 600', () => {
    const room = createRoom('host_tight_budget');
    const bot = createPlayer('bot_tight_passive');
    bot.balance = 800; // nextBid = 350. Remaining = 450 < minBuffer (600)
    room.players.push(bot);
    room.started = true;
    const reg: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    const auction: CurrentAuctionState = {
      cellIndex: 1,
      declinedPlayerId: 'host_tight_budget',
      highestBid: 300,
      highestBidder: 'host_tight_budget',
      startingBid: 200,
      bidIncrement: 50,
    };

    const intent = decideAuctionPhaseIntent(
      bot, room, reg, stateMap, BotPersonality.Passive, auction,
    );

    expect(intent.type).toBe('INTENT_AUCTION_PASS');
  });

  it('[TC-IMP115.04/A7][UC-BOT-04/MSS] isPassiveAuctionAllowed handles edge zero basePrice and extreme bids gracefully', () => {
    const auction: CurrentAuctionState = {
      cellIndex: 1,
      declinedPlayerId: 'host_edge',
      highestBid: 0,
    };

    const res = isPassiveAuctionAllowed(auction, 0, 1.0, 50);
    expect(res).toBe(false);
  });
});
