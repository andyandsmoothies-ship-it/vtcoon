// [TC-IMP113.01..27/MSS][UC-039][UC-BOT-06]
// Contract Test Suite: IMP-113 Swap Project Fallback Mechanics & Proactive P2P Bot Trading
// Station 1: Red Contract Tests (Strict Separation of Duties — Zero modifications to src/)
// Enforces Universal 4-Facet Behavioral Matrix & Point-of-Consumption Assertions.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createPlayer,
  createRoom,
  type Player,
  type Room,
  type MarketModifier,
} from '../../src/domain/room.js';
import { ChanceCardId } from '../../src/domain/event_card_types.js';
import { executeChanceCard } from '../../src/domain/card_handlers.js';
import {
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_data.js';
import {
  calculateTradeOfferPrice,
  evaluateBotTradeAcceptance,
  findEligibleBotTrade,
} from '../../src/domain/bot/bot_trade.js';
import {
  BotPersonality,
  DEFAULT_MIN_SAFETY_BUFFER,
} from '../../src/domain/bot/bot_types.js';

// Type-safe runner for executeChanceCard with optional 8th room argument
type ChanceRunner = (
  card: ChanceCardId,
  playerId: string,
  players: Player[],
  activeModifiers?: MarketModifier[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  permanentRentBonus?: Record<number, number>,
  room?: Room,
) => Record<string, never>;

const runChanceCard: ChanceRunner = executeChanceCard as unknown as ChanceRunner;

// Type-safe runner for calculateTradeOfferPrice with extended parameters
type ExtendedCalculateTradeOfferPrice = (
  cellIndex: number,
  bot: Player,
  personality: BotPersonality,
  customSafetyBuffer?: number,
  currentRound?: number,
  isMonopolyGap?: boolean,
) => number | null;

const runCalculateTradeOfferPrice: ExtendedCalculateTradeOfferPrice =
  calculateTradeOfferPrice as unknown as ExtendedCalculateTradeOfferPrice;

describe('[CONTRACT-TEST] IMP-113: Swap Project & P2P Trading AI Overhaul', () => {
  let room: Room;
  let p1: Player;
  let p2: Player;
  let registry: PropertyRegistry;
  let stateMap: PropertyStateMap;

  beforeEach(() => {
    room = createRoom('host_user');
    room.started = true;
    room.roundCount = 1;
    room.treasury = 10_000;

    p1 = createPlayer('player_alpha_vu');
    p1.balance = 5_000;

    p2 = createPlayer('player_beta_vuong');
    p2.balance = 5_000;

    room.players = [p1, p2];
    registry = new Map<number, string>();
    stateMap = new Map();
  });

  // ===========================================================================
  // FACET 1: Boundary & Range (Chốt 1: Swap Chuẩn, Chốt 2: Fallback A)
  // ===========================================================================
  describe('Facet 1: Boundary & Range — Standard Swap & Fallback A', () => {
    it('[TC-IMP113.01/MSS][UC-039] Chốt 1: Swap chuẩn khi người rút và đối thủ đều có C0 chưa thế chấp -> Hoán đổi quyền sở hữu trong registry', () => {
      registry.set(1, p1.id); // Cell 1: Can Tho, C0
      registry.set(6, p2.id); // Cell 6: Binh Duong, C0
      stateMap.set(1, { level: 0 });
      stateMap.set(6, { level: 0 });

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(registry.get(1)).toBe(p2.id);
      expect(registry.get(6)).toBe(p1.id);
    });

    it('[TC-IMP113.02/MSS][UC-039] Chốt 1: Swap chuẩn giữ nguyên cấp công trình level = 0 cho cả 2 ô đất sau hoán đổi', () => {
      registry.set(1, p1.id);
      registry.set(6, p2.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(6, { level: 0 });

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(stateMap.get(1)?.level).toBe(0);
      expect(stateMap.get(6)?.level).toBe(0);
    });

    it('[TC-IMP113.03/MSS][UC-039] Chốt 1: Từ chối hoán đổi nếu ô C0 của đối thủ đang bị thế chấp (state.isMortgaged === true) và kích hoạt Fallback A', () => {
      registry.set(1, p1.id);
      registry.set(6, p2.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(6, { level: 0, isMortgaged: true }); // Cell 6 the chap

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(registry.get(6)).toBe(p2.id);
      expect(stateMap.get(1)?.level).toBe(1);
    });

    it('[TC-IMP113.04/MSS][UC-039] Chốt 1: Từ chối hoán đổi nếu ô C0 của đối thủ nằm trong mortgagedProperties và kích hoạt Fallback A', () => {
      registry.set(1, p1.id);
      registry.set(6, p2.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(6, { level: 0 });
      p2.mortgagedProperties = [6];

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(registry.get(6)).toBe(p2.id);
      expect(stateMap.get(1)?.level).toBe(1);
    });

    it('[TC-IMP113.05/MSS][UC-039] Chốt 2: Fallback A khi người rút có C0 còn đối thủ không có C0 -> C0 của người rút được nâng cấp miễn phí lên C1 (level = 1)', () => {
      registry.set(1, p1.id);
      stateMap.set(1, { level: 0 }); // P2 khong co dat C0

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(stateMap.get(1)?.level).toBe(1);
      expect(registry.get(1)).toBe(p1.id);
    });

    it('[TC-IMP113.06/MSS][UC-039] Chốt 2: Fallback A chỉ nâng cấp đúng 1 ô C0 đầu tiên nếu người rút sở hữu nhiều ô C0', () => {
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(stateMap.get(1)?.level).toBe(1);
      expect(stateMap.get(3)?.level).toBe(0);
    });
  });

  // ===========================================================================
  // FACET 2: State Reactivity & Fallback Hierarchy (Chốt 3, Chốt 4)
  // ===========================================================================
  describe('Facet 2: State Reactivity & Fallback Hierarchy — Fallback B & Fallback C', () => {
    it('[TC-IMP113.07/MSS][UC-039] Chốt 3: Fallback B khi đối thủ có C0 và người rút đủ tiền (balance >= 1.3x basePrice) -> Người rút trả đúng 1.3x giá gốc', () => {
      registry.set(6, p2.id); // Cell 6: Binh Duong (basePrice 1000, 1.3x = 1300)
      stateMap.set(6, { level: 0 });
      p1.balance = 5_000;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(p1.balance).toBe(3_700); // 5000 - 1300
    });

    it('[TC-IMP113.08/MSS][UC-039] Chốt 3: Fallback B chuyển quyền sở hữu ô C0 từ đối thủ sang người rút trong registry khi đủ tiền mua', () => {
      registry.set(6, p2.id);
      stateMap.set(6, { level: 0 });
      p1.balance = 5_000;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(registry.get(6)).toBe(p1.id);
    });

    it('[TC-IMP113.09/MSS][UC-039] Chốt 3: Fallback B chuyển đúng số tiền thanh toán 1.3x vào số dư đối thủ bán đất', () => {
      registry.set(6, p2.id);
      stateMap.set(6, { level: 0 });
      p1.balance = 5_000;
      p2.balance = 2_000;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(p2.balance).toBe(3_300); // 2000 + 1300
    });

    it('[TC-IMP113.10/MSS][UC-039] Chốt 3: Fallback B tính đúng giá làm tròn floor khi giá gốc nhân 1.3 ra số lẻ (Cell 11 price 1400 -> 1820)', () => {
      registry.set(11, p2.id); // Cell 11: Binh Thuan (price 1400 -> 1400 * 1.3 = 1820)
      stateMap.set(11, { level: 0 });
      p1.balance = 5_000;
      p2.balance = 2_000;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(p1.balance).toBe(3_180); // 5000 - 1820
      expect(p2.balance).toBe(3_820); // 2000 + 1820
    });

    it('[TC-IMP113.11/MSS][UC-039] Chốt 3: Fallback B khi người rút không đủ tiền (< 1.3x) -> Người rút nhận 800 Tr. VNĐ trợ cấp từ Kho Bạc', () => {
      registry.set(6, p2.id); // Cell 6: basePrice 1000 -> 1.3x = 1300
      stateMap.set(6, { level: 0 });
      p1.balance = 1_000; // 1000 < 1300 -> Khong du tien
      room.treasury = 10_000;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(p1.balance).toBe(1_800); // 1000 + 800
      expect(room.treasury).toBe(9_200); // 10000 - 800
    });

    it('[TC-IMP113.12/MSS][UC-039] Chốt 3: Fallback B khi người rút không đủ tiền -> Ô C0 của đối thủ được giữ nguyên quyền sở hữu', () => {
      registry.set(6, p2.id);
      stateMap.set(6, { level: 0 });
      p1.balance = 1_000;
      p2.balance = 2_000;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(registry.get(6)).toBe(p2.id);
      expect(p2.balance).toBe(2_000);
    });

    it('[TC-IMP113.13/MSS][UC-039] Chốt 4: Fallback C khi cả 2 đều không có C0 -> Người rút nhận 1.000 Tr. VNĐ trợ cấp từ Kho Bạc', () => {
      p1.balance = 2_000;
      room.treasury = 10_000;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(p1.balance).toBe(3_000); // 2000 + 1000
      expect(room.treasury).toBe(9_000); // 10000 - 1000
    });

    it('[TC-IMP113.14/MSS][UC-039] Chốt 4: Fallback C kích hoạt khi đối thủ chỉ sở hữu ô đã nâng cấp C1+ và người rút không có đất', () => {
      registry.set(6, p2.id);
      stateMap.set(6, { level: 1 }); // Doi thu co dat nhung la C1
      p1.balance = 2_000;
      room.treasury = 10_000;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(p1.balance).toBe(3_000);
      expect(room.treasury).toBe(9_000);
    });
  });

  // ===========================================================================
  // FACET 3: Resource Disposal & Invariant Conservation (Zero Leak)
  // ===========================================================================
  describe('Facet 3: Resource Disposal & Cash Flow Invariants — Zero Leakage', () => {
    it('[TC-IMP113.15/MSS][UC-039] Fallback B Zero Money Leak: Tổng tiền giữa người mua và người bán được bảo toàn tuyệt đối', () => {
      registry.set(6, p2.id);
      stateMap.set(6, { level: 0 });
      const initialTotalCash = p1.balance + p2.balance;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      const finalTotalCash = p1.balance + p2.balance;
      expect(finalTotalCash).toBe(initialTotalCash);
    });

    it('[TC-IMP113.16/MSS][UC-039] Fallback B Treasury Conservation: Kho Bạc giảm đúng 800 Tr. khi giải ngân trợ cấp thiếu vốn', () => {
      registry.set(6, p2.id);
      stateMap.set(6, { level: 0 });
      p1.balance = 500;
      const initialTreasury = room.treasury;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(room.treasury).toBe(initialTreasury - 800);
    });

    it('[TC-IMP113.17/MSS][UC-039] Fallback C Treasury Conservation: Kho Bạc giảm đúng 1.000 Tr. tương ứng số tiền người rút nhận được', () => {
      p1.balance = 1_500;
      const initialTreasury = room.treasury;

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(room.treasury).toBe(initialTreasury - 1_000);
    });

    it('[TC-IMP113.18/MSS][UC-039] Zero Dangling State: Quyền sở hữu cũ bị xóa sạch trong registry khi hoàn tất chuyển nhượng', () => {
      registry.set(6, p2.id);
      stateMap.set(6, { level: 0 });

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, room.activeModifiers, registry, stateMap, room.permanentRentBonus, room);

      expect(registry.get(6)).toBe(p1.id);
      expect(Array.from(registry.values()).filter((owner) => owner === p2.id)).toHaveLength(0);
    });
  });

  // ===========================================================================
  // FACET 4: Error Defense & Bot P2P Trading (Chốt 5, Chốt 6, Chốt 7)
  // ===========================================================================
  describe('Facet 4: Error Defense & Bot P2P Negotiation Intelligence', () => {
    let botAlpha: Player;
    let sellerBot: Player;
    let buyerUser: Player;

    beforeEach(() => {
      botAlpha = createPlayer('bot_alpha');
      botAlpha.isBot = true;
      botAlpha.balance = 10_000;

      sellerBot = createPlayer('seller_bot');
      sellerBot.isBot = true;
      sellerBot.balance = 5_000;

      buyerUser = createPlayer('buyer_user');
      buyerUser.balance = 10_000;

      room.players = [botAlpha, sellerBot, buyerUser];
    });

    it('[TC-IMP113.19/MSS][UC-BOT-06] Chốt 5: calculateTradeOfferPrice khi bot Balanced có Monopoly Gap ở vòng >= 6 trả giá >= 1.5x basePrice', () => {
      // Cell 6: Binh Duong (price 1000). >= 1.5x -> >= 1500
      const price = runCalculateTradeOfferPrice(6, botAlpha, BotPersonality.Balanced, undefined, 6, true);

      expect(price).not.toBeNull();
      expect(price).toBeGreaterThanOrEqual(1500);
    });

    it('[TC-IMP113.20/MSS][UC-BOT-06] Chốt 5: calculateTradeOfferPrice khi bot Aggressive có Monopoly Gap ở vòng >= 6 trả giá >= 1.7x basePrice', () => {
      // Cell 6: Binh Duong (price 1000). >= 1.7x -> >= 1700
      const price = runCalculateTradeOfferPrice(6, botAlpha, BotPersonality.Aggressive, undefined, 6, true);

      expect(price).not.toBeNull();
      expect(price).toBeGreaterThanOrEqual(1700);
    });

    it('[TC-IMP113.21/MSS][UC-BOT-06] Chốt 5: calculateTradeOfferPrice khi bot Passive có Monopoly Gap ở vòng >= 6 trả giá >= 1.3x basePrice', () => {
      // Cell 6: Binh Duong (price 1000). >= 1.3x -> >= 1300
      const price = runCalculateTradeOfferPrice(6, botAlpha, BotPersonality.Passive, undefined, 6, true);

      expect(price).not.toBeNull();
      expect(price).toBeGreaterThanOrEqual(1300);
    });

    it('[TC-IMP113.22/MSS][UC-BOT-06] Chốt 5: calculateTradeOfferPrice tuân thủ đệm an toàn DEFAULT_MIN_SAFETY_BUFFER (trả về null nếu không đủ tiền)', () => {
      botAlpha.balance = 2_000; // 2000 - offerPrice(>= 1500) < DEFAULT_MIN_SAFETY_BUFFER (1000)

      const price = runCalculateTradeOfferPrice(6, botAlpha, BotPersonality.Balanced, DEFAULT_MIN_SAFETY_BUFFER, 6, true);

      expect(price).toBeNull();
    });

    it('[TC-IMP113.23/MSS][UC-BOT-06] Chốt 6: evaluateBotTradeAcceptance cho bot Balanced chấp thuận bán ô đất đơn lẻ khi được chào mua >= 1.5x basePrice', () => {
      // Cell 6 (price 1000). Buyer owns Cell 8 & Cell 9. Selling Cell 6 gives monopoly to buyer.
      registry.set(6, sellerBot.id);
      registry.set(8, buyerUser.id);
      registry.set(9, buyerUser.id);

      const decision = evaluateBotTradeAcceptance(
        6,
        1500, // 1.5x basePrice
        sellerBot,
        buyerUser,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
      );

      expect(decision.accept).toBe(true);
    });

    it('[TC-IMP113.24/MSS][UC-BOT-06] Chốt 6: evaluateBotTradeAcceptance cho bot Balanced chấp thuận bán khi balance < 2000 và offerPrice >= 1.3x basePrice', () => {
      registry.set(6, sellerBot.id);
      registry.set(8, buyerUser.id);
      registry.set(9, buyerUser.id);
      sellerBot.balance = 1_500; // < 2000

      const decision = evaluateBotTradeAcceptance(
        6,
        1300, // 1.3x basePrice
        sellerBot,
        buyerUser,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
      );

      expect(decision.accept).toBe(true);
    });

    it('[TC-IMP113.25/MSS][UC-BOT-06] Chốt 6: evaluateBotTradeAcceptance cho bot Balanced từ chối bán khi balance >= 2000 và offerPrice < 1.5x basePrice', () => {
      registry.set(6, sellerBot.id);
      registry.set(8, buyerUser.id);
      registry.set(9, buyerUser.id);
      sellerBot.balance = 5_000; // >= 2000

      const decision = evaluateBotTradeAcceptance(
        6,
        1400, // 1.4x < 1.5x
        sellerBot,
        buyerUser,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
      );

      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('PREVENT_MONOPOLY');
    });

    it('[TC-IMP113.26/MSS][UC-BOT-06] Chốt 7: findEligibleBotTrade ở vòng >= 10 cho phép bot chào mua sau 1 vòng (cooldown = 1 vòng) đối với Monopoly Gap', () => {
      // Group Hong: 11, 13, 14. Bot owns 13, 14. Opponent owns 11 (Monopoly Gap).
      registry.set(13, botAlpha.id);
      registry.set(14, botAlpha.id);
      registry.set(11, sellerBot.id);
      botAlpha.lastTradeOfferRound = 9;

      const intent = findEligibleBotTrade(
        botAlpha,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
        10, // Round 10: elapsed = 10 - 9 = 1 round
      );

      expect(intent).not.toBeNull();
      expect(intent?.cellIndex).toBe(11);
    });

    it('[TC-IMP113.27/MSS][UC-BOT-06] Chốt 7: findEligibleBotTrade ở vòng < 10 vẫn duy trì cooldown 2 vòng khi gặp Monopoly Gap', () => {
      registry.set(13, botAlpha.id);
      registry.set(14, botAlpha.id);
      registry.set(11, sellerBot.id);
      botAlpha.lastTradeOfferRound = 8;

      const intent = findEligibleBotTrade(
        botAlpha,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
        9, // Round 9 (< 10): elapsed = 9 - 8 = 1 round (< 2)
      );

      expect(intent).toBeNull();
    });
  });
});
