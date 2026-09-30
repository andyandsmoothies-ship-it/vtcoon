// [TC-DUEL][UC-IMP236] Contract Test Suite: Competitive Duel Bot AI (IMP-236)
// Matrix: 4 Facets, 16 Atomic Tests, Observable Behavior, Detroit Classical Style
import { describe, it, expect } from 'vitest';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import { decideBotIntent } from '../../src/domain/bot/bot_engine.js';
import {
  calculateMonopolyMultiplier,
  calculateDenialMultiplier,
} from '../../src/domain/bot/valuation_engine.js';
import {
  calculateAuctionMaxBid,
  decideAuctionPhaseIntent,
} from '../../src/domain/bot/bot_auction.js';
import { evaluateBotTradeAcceptance } from '../../src/domain/bot/bot_trade.js';
import { createPlayer, createRoom, TurnPhase, type CurrentAuctionState } from '../../src/domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';

function setupDuel(opts?: {
  readonly round?: number;
  readonly phase?: TurnPhase;
  readonly botBalance?: number;
  readonly botPos?: number;
  readonly playerCount?: number;
}) {
  const room = createRoom('host_duel');
  room.started = true;
  room.round = opts?.round ?? 10;
  room.roundCount = opts?.round ?? 10;
  room.phase = opts?.phase ?? TurnPhase.ActionPhase;

  const bot = createPlayer('bot_agent');
  bot.isBot = true;
  bot.balance = opts?.botBalance ?? 15_000;
  bot.position = opts?.botPos ?? 0;

  const opp1 = createPlayer('opp_human');
  opp1.balance = 12_000;
  opp1.position = 10;

  room.players = [bot, opp1];
  if (opts?.playerCount === 3) {
    const opp2 = createPlayer('opp_third');
    opp2.balance = 8_000;
    room.players.push(opp2);
  }

  const registry: PropertyRegistry = new Map();
  const stateMap: PropertyStateMap = new Map();

  return { room, bot, opp1, registry, stateMap };
}

describe('[TC-DUEL][UC-IMP236] Competitive Duel Bot AI Contract Suite', () => {
  // =========================================================================
  // Facet 1: Thu Mua Đất Tự Do & Trần Đấu Giá Khi Dư Dả Tiền Mặt
  // =========================================================================
  describe('Facet 1: Cash Abundance Land Acquisition & Auction Ceiling', () => {
    it('[TC-DUEL-BUY-01][UC-IMP236] Bot Balanced mua đất khi dư dả tiền mặt ở late-game bất chấp pacingFactor < 1.0', () => {
      const { room, bot, registry, stateMap } = setupDuel({ round: 35, botBalance: 18_000, botPos: 26 });
      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });
      expect(intent?.type).toBe('INTENT_BUY');
    });

    it('[TC-DUEL-BUY-02][UC-IMP236] Bot từ chối mua đất ở late-game khi tiền mặt eo hẹp không đủ đệm an toàn', () => {
      const { room, bot, registry, stateMap } = setupDuel({ round: 35, botBalance: 5_000, botPos: 26 });
      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });
      expect(intent?.type).toBe('INTENT_DECLINE');
    });

    it('[TC-DUEL-AUC-01][UC-IMP236] Bot Balanced nới lỏng pacing đấu giá vòng > 20 khi dồi dào tiền mặt (maxBid >= 100% giá gốc)', () => {
      const { room, bot } = setupDuel({ round: 25, botBalance: 15_000 });
      const maxBid = calculateAuctionMaxBid(bot, room, BotPersonality.Balanced, 1400, 1000);
      expect(maxBid).toBeGreaterThanOrEqual(2000);
    });

    it('[TC-DUEL-AUC-02][UC-IMP236] Bot Balanced tiếp tục nâng giá khi đối thủ đặt 1.1x giá gốc trong thế trận 1v1', () => {
      const { room, bot, opp1, registry, stateMap } = setupDuel({ round: 25, phase: TurnPhase.AuctionPhase, botBalance: 15_000 });
      const auction: CurrentAuctionState = {
        cellIndex: 5,
        highestBid: 2200,
        highestBidder: opp1.id,
        bidIncrement: 100,
      } as CurrentAuctionState;

      const intent = decideAuctionPhaseIntent(bot, room, registry, stateMap, BotPersonality.Balanced, auction);
      expect(intent.type).toBe('INTENT_BID');
    });
  });

  // =========================================================================
  // Facet 2: Chặn Độc Quyền Đối Thủ Bằng Mọi Giá (Observable Behavior)
  // =========================================================================
  describe('Facet 2: Opponent Monopoly Denial & Dynamic Duel Ceiling', () => {
    it('[TC-DUEL-DENIAL-01][UC-IMP236] Bot Balanced không bỏ cuộc ở 1.40x khi đối thủ sắp hoàn tất độc quyền trong thế trận 1v1', () => {
      const { room, bot, opp1, registry, stateMap } = setupDuel({ phase: TurnPhase.AuctionPhase, botBalance: 20_000 });
      registry.set(16, opp1.id);
      registry.set(18, opp1.id);
      const auction: CurrentAuctionState = {
        cellIndex: 19,
        highestBid: 2900,
        highestBidder: opp1.id,
        bidIncrement: 50,
      } as CurrentAuctionState;

      const intent = decideAuctionPhaseIntent(bot, room, registry, stateMap, BotPersonality.Balanced, auction);
      expect(intent.type).toBe('INTENT_BID');
    });

    it('[TC-DUEL-DENIAL-02][UC-IMP236] Bot Aggressive đấu giá chặn độc quyền lên tới 2.5x giá gốc trong thế trận 1v1', () => {
      const { room, bot, opp1, registry, stateMap } = setupDuel({ phase: TurnPhase.AuctionPhase, botBalance: 25_000 });
      registry.set(16, opp1.id);
      registry.set(18, opp1.id);
      const auction: CurrentAuctionState = {
        cellIndex: 19,
        highestBid: 5000,
        highestBidder: opp1.id,
        bidIncrement: 100,
      } as CurrentAuctionState;

      const intent = decideAuctionPhaseIntent(bot, room, registry, stateMap, BotPersonality.Aggressive, auction);
      expect(intent.type).toBe('INTENT_BID');
    });

    it('[TC-DUEL-DENIAL-03][UC-IMP236] Bot Balanced đấu giá chặn độc quyền lên tới 2.0x giá gốc trong thế trận 1v1', () => {
      const { room, bot, opp1, registry, stateMap } = setupDuel({ phase: TurnPhase.AuctionPhase, botBalance: 20_000 });
      registry.set(16, opp1.id);
      registry.set(18, opp1.id);
      const auction: CurrentAuctionState = {
        cellIndex: 19,
        highestBid: 4000,
        highestBidder: opp1.id,
        bidIncrement: 100,
      } as CurrentAuctionState;

      const intent = decideAuctionPhaseIntent(bot, room, registry, stateMap, BotPersonality.Balanced, auction);
      expect(intent.type).toBe('INTENT_BID');
    });

    it('[TC-DUEL-DENIAL-04][UC-IMP236] Bot nhận diện mục tiêu chặn độc quyền ngay khi phiên đấu giá mới mở (highestBidder undefined)', () => {
      const { room, bot, opp1, registry, stateMap } = setupDuel({ round: 25, phase: TurnPhase.AuctionPhase, botBalance: 20_000 });
      registry.set(16, opp1.id);
      registry.set(18, opp1.id);
      const auction: CurrentAuctionState = {
        cellIndex: 19,
        highestBid: 3000,
        highestBidder: undefined,
        bidIncrement: 100,
      } as CurrentAuctionState;

      const intent = decideAuctionPhaseIntent(bot, room, registry, stateMap, BotPersonality.Balanced, auction);
      expect(intent.type).toBe('INTENT_BID');
    });
  });

  // =========================================================================
  // Facet 3: Nhận Diện Đe Dọa Cảng (Railroads) & Tiện Ích (Utilities)
  // =========================================================================
  describe('Facet 3: Threat Recognition for Railroads & Utilities', () => {
    it('[TC-DUEL-RAIL-01][UC-IMP236] Gán denialMultiplier >= 1.7x cho ô Cảng thứ 3 khi đối thủ sở hữu 2 Cảng', () => {
      const { room, bot, opp1, registry } = setupDuel();
      registry.set(5, opp1.id);
      registry.set(15, opp1.id);

      const denial = calculateDenialMultiplier(25, bot.id, room, registry, BotPersonality.Balanced);
      expect(denial).toBeGreaterThanOrEqual(1.7);
    });

    it('[TC-DUEL-RAIL-02][UC-IMP236] Gán denialMultiplier >= 2.5x cho ô Cảng thứ 4 khi đối thủ chuẩn bị đạt mốc thu 4000 Tr', () => {
      const { room, bot, opp1, registry } = setupDuel();
      registry.set(5, opp1.id);
      registry.set(15, opp1.id);
      registry.set(25, opp1.id);

      const denial = calculateDenialMultiplier(35, bot.id, room, registry, BotPersonality.Balanced);
      expect(denial).toBeGreaterThanOrEqual(2.5);
    });

    it('[TC-DUEL-RAIL-03][UC-IMP236] Tính monopolyMultiplier >= 1.6x cho ô Cảng khi Bot đã sở hữu 2 Cảng', () => {
      const { bot, registry } = setupDuel();
      registry.set(5, bot.id);
      registry.set(15, bot.id);

      const mult = calculateMonopolyMultiplier(25, bot.id, registry, BotPersonality.Balanced);
      expect(mult).toBeGreaterThanOrEqual(1.6);
    });

    it('[TC-DUEL-UTIL-01][UC-IMP236] Gán denialMultiplier > 1.0 cho ô Tiện ích thứ 2 khi đối thủ đã sở hữu 1 Tiện ích', () => {
      const { room, bot, opp1, registry } = setupDuel();
      registry.set(12, opp1.id);

      const denial = calculateDenialMultiplier(28, bot.id, room, registry, BotPersonality.Balanced);
      expect(denial).toBeGreaterThan(1.0);
    });
  });

  // =========================================================================
  // Facet 4: Luật Bất Khả Xâm Phạm Độc Quyền Trong Trade
  // =========================================================================
  describe('Facet 4: Inviolable Monopoly Defense in 1v1 Trade', () => {
    it('[TC-DUEL-TRADE-01][UC-IMP236] Bot Balanced từ chối bán ô độc quyền bằng tiền mặt 1.5x trong thế trận 1v1', () => {
      const { room, bot, opp1, registry, stateMap } = setupDuel();
      registry.set(16, opp1.id);
      registry.set(18, opp1.id);
      registry.set(19, bot.id);

      const decision = evaluateBotTradeAcceptance(19, 3000, bot, opp1, room, registry, stateMap, BotPersonality.Balanced);
      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('PREVENT_MONOPOLY');
    });

    it('[TC-DUEL-TRADE-02][UC-IMP236] Bot Aggressive từ chối bán ô độc quyền với giá cắt cổ 3.0x trong thế trận 1v1', () => {
      const { room, bot, opp1, registry, stateMap } = setupDuel();
      registry.set(16, opp1.id);
      registry.set(18, opp1.id);
      registry.set(19, bot.id);

      const decision = evaluateBotTradeAcceptance(19, 6000, bot, opp1, room, registry, stateMap, BotPersonality.Aggressive);
      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('PREVENT_MONOPOLY');
    });

    it('[TC-DUEL-TRADE-03][UC-IMP236] Bot Aggressive kẹt tiền vẫn chấp nhận bán 2.5x trong trận 3 người (bảo toàn TC-82.06)', () => {
      const { room, bot, opp1, registry, stateMap } = setupDuel({ playerCount: 3, botBalance: 1500 });
      registry.set(16, opp1.id);
      registry.set(18, opp1.id);
      registry.set(19, bot.id);

      const decision = evaluateBotTradeAcceptance(19, 5000, bot, opp1, room, registry, stateMap, BotPersonality.Aggressive);
      expect(decision.accept).toBe(true);
    });

    it('[TC-DUEL-TRADE-04][UC-IMP236] Bot Balanced từ chối bán đứt Cảng thứ 4 cho đối thủ lấy tiền mặt trong thế trận 1v1', () => {
      const { room, bot, opp1, registry, stateMap } = setupDuel();
      registry.set(5, opp1.id);
      registry.set(15, opp1.id);
      registry.set(25, opp1.id);
      registry.set(35, bot.id);

      const decision = evaluateBotTradeAcceptance(35, 4000, bot, opp1, room, registry, stateMap, BotPersonality.Balanced);
      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('PREVENT_MONOPOLY');
    });
  });
});
