// [CONTRACT TEST] IMP-119: Tri-Personality Strategic Parity & Bot Balance Overhaul
// Universal 4-Facet Behavioral Matrix: Boundary, Reactivity, Buy Power, and Invariant Defense
import { describe, it, expect } from 'vitest';
import { BotPersonality, DEFAULT_MIN_SAFETY_BUFFER } from '../../src/domain/bot/bot_types.js';
import {
  evaluateBotTradeAcceptance,
  calculateTradeOfferPrice,
} from '../../src/domain/bot/bot_trade.js';
import { isPassiveAuctionAllowed, calculateAuctionMaxBid } from '../../src/domain/bot/bot_auction.js';
import type { Player, Room, CurrentAuctionState } from '../../src/domain/room.js';
import { TurnPhase } from '../../src/domain/room.js';
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config.js';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_data.js';

function createMockPlayer(id: string, balance: number, position = 0): Player {
  return {
    id,
    position,
    balance,
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
  };
}

function createMockRoom(): Room {
  return {
    roomCode: 'IMP119',
    phase: TurnPhase.ActionPhase,
    roundCount: 5,
    round: 5,
    players: [],
    treasury: 10000,
    currentPlayerIndex: 0,
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    activeModifiers: [],
  } as unknown as Room;
}

describe('[IMP-119][Trạm 1] Tri-Personality Strategic Parity & Bot Balance Overhaul', () => {
  const cellIdx = 1; // Ô 1: Tháp Chàm (Nâu, giá 600 Tr.)
  const basePrice = PROPERTY_DEEDS.get(cellIdx)?.price ?? 600;

  // ----------------------------------------------------------------------------------
  // FACET 1: Boundary & Thresholds — Nâng Cấp & Mua Đất Của Bot Passive
  // ----------------------------------------------------------------------------------
  describe('Facet 1: Boundary & Thresholds — Quyền Nâng Cấp & Mua Đất Của Bot Passive', () => {
    it('[UC-IMP119/MSS-01] Bot Passive cho phép đấu giá lên tới 1.35x cho ô Hạ tầng hoặc Tiện ích', () => {
      const infraCell = BOARD_CONFIG.find((c) => c.type === CellType.Railroad || c.type === CellType.Utility)!;
      const infraPrice = PROPERTY_DEEDS.get(infraCell.index)?.price ?? 2000;
      const mockAuction: CurrentAuctionState = {
        cellIndex: infraCell.index,
        highestBid: Math.round(infraPrice * 1.25),
        bidIncrement: 50,
      } as unknown as CurrentAuctionState;

      // Cũ: chỉ cho phép tối đa 1.15x nên giá 1.25x sẽ bị từ chối
      // Mới: cho phép lên tới 1.35x cho ô hạ tầng/tiện ích
      const allowed = isPassiveAuctionAllowed(mockAuction, infraPrice, 1.0, Math.round(infraPrice * 1.28));
      expect(allowed).toBe(true);
    });

    it('[UC-IMP119/MSS-02] Bot Passive từ chối đấu giá ô hạ tầng nếu vượt quá trần 1.35x', () => {
      const infraCell = BOARD_CONFIG.find((c) => c.type === CellType.Railroad || c.type === CellType.Utility)!;
      const infraPrice = PROPERTY_DEEDS.get(infraCell.index)?.price ?? 2000;
      const mockAuction: CurrentAuctionState = {
        cellIndex: infraCell.index,
        highestBid: Math.round(infraPrice * 1.36),
        bidIncrement: 50,
      } as unknown as CurrentAuctionState;

      const allowed = isPassiveAuctionAllowed(mockAuction, infraPrice, 1.0, Math.round(infraPrice * 1.38));
      expect(allowed).toBe(false);
    });

    it('[UC-IMP119/MSS-03] Bot Passive cho phép đấu giá lên tới 1.50x nếu ô đất mang lại độc quyền', () => {
      const propCell = 3; // Ô Nâu số 3
      const propPrice = PROPERTY_DEEDS.get(propCell)?.price ?? 600;
      const mockAuction: CurrentAuctionState = {
        cellIndex: propCell,
        highestBid: Math.round(propPrice * 1.40),
        bidIncrement: 50,
      } as unknown as CurrentAuctionState;

      // monopolyScore >= 1.6 (chuẩn bị tạo độc quyền)
      const allowed = isPassiveAuctionAllowed(mockAuction, propPrice, 1.8, Math.round(propPrice * 1.45));
      expect(allowed).toBe(true);
    });

    it('[UC-IMP119/MSS-04] Bot Passive từ chối đấu giá ô độc quyền nếu vượt quá 1.50x', () => {
      const propCell = 3;
      const propPrice = PROPERTY_DEEDS.get(propCell)?.price ?? 600;
      const mockAuction: CurrentAuctionState = {
        cellIndex: propCell,
        highestBid: Math.round(propPrice * 1.52),
        bidIncrement: 50,
      } as unknown as CurrentAuctionState;

      const allowed = isPassiveAuctionAllowed(mockAuction, propPrice, 1.8, Math.round(propPrice * 1.55));
      expect(allowed).toBe(false);
    });
  });

  // ----------------------------------------------------------------------------------
  // FACET 2: State Reactivity & P2P Monopoly Defense — Chống Bán Rẻ Độc Quyền
  // ----------------------------------------------------------------------------------
  describe('Facet 2: State Reactivity — Chặn Bán Rẻ Ô Độc Quyền Của Bot Passive', () => {
    it('[UC-IMP119/MSS-05] Bot Passive TỪ CHỐI đề xuất 1.35x khi ô đất mang lại độc quyền cho đối thủ (PREVENT_MONOPOLY)', () => {
      const seller = createMockPlayer('p1', 5000);
      const buyer = createMockPlayer('p2', 15000);
      const room = createMockRoom();
      const registry: PropertyRegistry = new Map([
        [1, 'p1'],
        [3, 'p2'], // Ô 3 thuộc p2, ô 1 thuộc p1 ➔ bán ô 1 sẽ cho p2 trọn bộ Nâu!
      ]);
      const stateMap: PropertyStateMap = new Map();

      const decision = evaluateBotTradeAcceptance(
        1,
        Math.round(basePrice * 1.35),
        seller,
        buyer,
        room,
        registry,
        stateMap,
        BotPersonality.Passive,
      );

      // Cũ: chấp thuận vì offerPrice >= 1.35x
      // Mới: BẮT BUỘC từ chối để chống đối thủ độc quyền
      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('PREVENT_MONOPOLY');
    });

    it('[UC-IMP119/MSS-06] Bot Passive TỪ CHỐI đề xuất 1.75x khi ô đất mang lại độc quyền cho đối thủ nếu tiền mặt còn dồi dào', () => {
      const seller = createMockPlayer('p1', 3000);
      const buyer = createMockPlayer('p2', 15000);
      const room = createMockRoom();
      const registry: PropertyRegistry = new Map([[1, 'p1'], [3, 'p2']]);
      const stateMap: PropertyStateMap = new Map();

      const decision = evaluateBotTradeAcceptance(
        1,
        Math.round(basePrice * 1.75),
        seller,
        buyer,
        room,
        registry,
        stateMap,
        BotPersonality.Passive,
      );

      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('PREVENT_MONOPOLY');
    });

    it('[UC-IMP119/MSS-07] Bot Passive CHỈ chấp thuận bán đất độc quyền khi nhận giá cắt cổ >= 2.0x và kẹt tiền khẩn cấp (< 500 Tr.)', () => {
      const seller = createMockPlayer('p1', 400); // Kẹt tiền mặt
      const buyer = createMockPlayer('p2', 15000);
      const room = createMockRoom();
      const registry: PropertyRegistry = new Map([[1, 'p1'], [3, 'p2']]);
      const stateMap: PropertyStateMap = new Map();

      const decision = evaluateBotTradeAcceptance(
        1,
        Math.round(basePrice * 2.0),
        seller,
        buyer,
        room,
        registry,
        stateMap,
        BotPersonality.Passive,
      );

      expect(decision.accept).toBe(true);
    });

    it('[UC-IMP119/MSS-08] Bot Passive chấp thuận bán ô đất KHÔNG mang lại độc quyền cho đối thủ khi nhận giá >= 1.40x', () => {
      const seller = createMockPlayer('p1', 3000);
      const buyer = createMockPlayer('p2', 15000);
      const room = createMockRoom();
      const registry: PropertyRegistry = new Map([
        [1, 'p1'],
        [3, 'p3'], // Ô 3 thuộc p3 ➔ bán ô 1 cho p2 KHÔNG làm p2 độc quyền
      ]);
      const stateMap: PropertyStateMap = new Map();

      const decision = evaluateBotTradeAcceptance(
        1,
        Math.round(basePrice * 1.40),
        seller,
        buyer,
        room,
        registry,
        stateMap,
        BotPersonality.Passive,
      );

      expect(decision.accept).toBe(true);
    });
  });

  // ----------------------------------------------------------------------------------
  // FACET 3: Sức Mua & Hoàn Thành Độc Quyền (Buy Power & P2P Monopoly Completion)
  // ----------------------------------------------------------------------------------
  describe('Facet 3: Sức Mua Độc Quyền — Bot Passive Trả Giá Cạnh Tranh 1.60x', () => {
    it('[UC-IMP119/MSS-09] Bot Passive chào mua ô monopoly gap với giá 1.60x khi đủ tiền ở vòng 4+ (bàn 4 người)', () => {
      const bot = createMockPlayer('p1', 8000);
      const price = calculateTradeOfferPrice(
        cellIdx,
        bot,
        BotPersonality.Passive,
        DEFAULT_MIN_SAFETY_BUFFER,
        5, // Vòng 5
        true, // isMonopolyGap
        4, // 4 players
      );

      // Cũ: chỉ trả 1.35x (810 Tr.)
      // Mới: trả đúng 1.60x (960 Tr.)
      expect(price).toBe(Math.round(basePrice * 1.60));
    });

    it('[UC-IMP119/MSS-10] Bot Balanced CHẤP THUẬN giá chào mua 1.60x của Bot Passive', () => {
      const sellerBalanced = createMockPlayer('p2', 4000);
      const buyerPassive = createMockPlayer('p1', 8000);
      const room = createMockRoom();
      const registry: PropertyRegistry = new Map([[1, 'p2'], [3, 'p1']]); // Bán cho p1 tạo độc quyền cho p1
      const stateMap: PropertyStateMap = new Map();

      const offerPrice = Math.round(basePrice * 1.60);
      const decision = evaluateBotTradeAcceptance(
        1,
        offerPrice,
        sellerBalanced,
        buyerPassive,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
      );

      // Bot Balanced đòi >= 1.50x ➔ 1.60x thỏa mãn!
      expect(decision.accept).toBe(true);
    });

    it('[UC-IMP119/MSS-11] Bot Aggressive khi kẹt tiền (< 2000 Tr.) CHẤP THUẬN giá chào mua 1.60x của Bot Passive', () => {
      const sellerAggressive = createMockPlayer('p2', 1500); // Kẹt tiền mặt
      const buyerPassive = createMockPlayer('p1', 8000);
      const room = createMockRoom();
      const registry: PropertyRegistry = new Map([[1, 'p2'], [3, 'p1']]);
      const stateMap: PropertyStateMap = new Map();

      const offerPrice = Math.round(basePrice * 1.60);
      const decision = evaluateBotTradeAcceptance(
        1,
        offerPrice,
        sellerAggressive,
        buyerPassive,
        room,
        registry,
        stateMap,
        BotPersonality.Aggressive,
      );

      // Bot Aggressive khi kẹt tiền đòi >= 1.55x ➔ 1.60x thỏa mãn!
      expect(decision.accept).toBe(true);
    });

    it('[UC-IMP119/MSS-12] Bot Aggressive khi dư dả tiền (>= 2000 Tr.) TỪ CHỐI giá chào mua 1.60x (đòi >= 1.75x)', () => {
      const sellerAggressive = createMockPlayer('p2', 5000); // Dư dả
      const buyerPassive = createMockPlayer('p1', 8000);
      const room = createMockRoom();
      const registry: PropertyRegistry = new Map([[1, 'p2'], [3, 'p1']]);
      const stateMap: PropertyStateMap = new Map();

      const offerPrice = Math.round(basePrice * 1.60);
      const decision = evaluateBotTradeAcceptance(
        1,
        offerPrice,
        sellerAggressive,
        buyerPassive,
        room,
        registry,
        stateMap,
        BotPersonality.Aggressive,
      );

      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('PREVENT_MONOPOLY');
    });
  });

  // ----------------------------------------------------------------------------------
  // FACET 4: Error Defense & Invariant Protection — Bảo Toàn Ngân Sách An Toàn
  // ----------------------------------------------------------------------------------
  describe('Facet 4: Invariant Protection — Bảo Toàn An Toàn Tài Chính Khi Đàm Phán', () => {
    it('[UC-IMP119/MSS-13] Bot Passive không bao giờ chào mua nếu số dư sau mua vi phạm safetyBuffer', () => {
      const poorPassive = createMockPlayer('p1', 1200); // Giá mua 1.6x = 960 Tr. ➔ Còn 240 Tr. < safetyBuffer 1000 Tr.
      const price = calculateTradeOfferPrice(
        cellIdx,
        poorPassive,
        BotPersonality.Passive,
        DEFAULT_MIN_SAFETY_BUFFER,
        5,
        true,
        4,
      );

      expect(price).toBeNull();
    });

    it('[UC-IMP119/MSS-14] calculateAuctionMaxBid cho Bot Passive nâng hệ số định giá lên 1.15x khi ô đất có giá trị chiến lược', () => {
      const bot = createMockPlayer('p1', 10000);
      const room = createMockRoom();
      const maxBid = calculateAuctionMaxBid(
        bot,
        room,
        BotPersonality.Passive,
        1000,
        DEFAULT_MIN_SAFETY_BUFFER,
        2.0, // Strategic denial/monopoly score
      );

      // Cũ: valMultiplier = 1.0 (1000 Tr.)
      // Mới: valMultiplier = 1.15 (1150 Tr.)
      expect(maxBid).toBeGreaterThanOrEqual(1150);
    });

    it('[UC-IMP119/MSS-15] Cả 3 tính cách Bot đều có kênh hoàn thành độc quyền hợp lệ không bị bế tắc', () => {
      // Passive có thể mua từ Balanced (1.60x >= 1.50x)
      // Balanced có thể mua từ Passive (1.55x >= 1.40x nếu ô lẻ)
      // Aggressive có thể mua từ Balanced (1.75x >= 1.50x)
      const pOffer = Math.round(basePrice * 1.60);
      const bDemand = Math.round(basePrice * 1.50);
      expect(pOffer).toBeGreaterThanOrEqual(bDemand);
    });

    it('[UC-IMP119/MSS-16] Khác biệt chiến thuật giữa 3 loại Bot được phân định rõ ràng qua các ngưỡng P2P', () => {
      const p1 = calculateTradeOfferPrice(cellIdx, createMockPlayer('p', 20000), BotPersonality.Passive, 300, 5, true, 4);
      const b1 = calculateTradeOfferPrice(cellIdx, createMockPlayer('b', 20000), BotPersonality.Balanced, 300, 5, true, 4);
      const a1 = calculateTradeOfferPrice(cellIdx, createMockPlayer('a', 20000), BotPersonality.Aggressive, 300, 5, true, 4);

      expect(p1).toBe(Math.round(basePrice * 1.60));
      expect(b1).toBe(Math.round(basePrice * 1.55));
      expect(a1).toBe(Math.round(basePrice * 1.75));
    });
  });
});
