// [CONTRACT TEST] IMP-203: Bot Hybrid Trade Offers (Property + Cash Bundle) & Strategic Bilateral Valuation
// Traceability Tags: [TC-203.01..20/MSS] & [UC-IMP203] / [UC-BOT-06]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { coordTrade, type RoomContext } from '../../src/server/room_property_coordinator.js';
import { TurnPhase, ActionRejectReason, type Player, type Room } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import { executeP2PTrade } from '../../src/server/property_actions.js';
import { findEligibleBotTrade, type MonopolyGap } from '../../src/domain/bot/bot_trade.js';
import * as botTradeMod from '../../src/domain/bot/bot_trade.js';

// Dynamic lazy import hooks for pending modules to be implemented in Station 2
const hybridPath = '../../src/domain/bot/bot_hybrid_trade.js';
const botHybridTradeMod = await import(/* @vite-ignore */ hybridPath).catch(() => null);

const helperPath = '../../src/server/trade_coordinator_helper.js';
const tradeCoordHelperMod = await import(/* @vite-ignore */ helperPath).catch(() => null);

const findSurplusProperties = (...args: any[]) =>
  (botHybridTradeMod?.findSurplusProperties ?? (botTradeMod as any)?.findSurplusProperties)?.(...args);

const calculateHybridTradeOfferPrice = (...args: any[]) =>
  (botHybridTradeMod?.calculateHybridTradeOfferPrice ?? (botTradeMod as any)?.calculateHybridTradeOfferPrice)?.(...args);

const findEligibleBotHybridTrade = (...args: any[]) =>
  (botHybridTradeMod?.findEligibleBotHybridTrade ?? (botTradeMod as any)?.findEligibleBotHybridTrade)?.(...args);

const evaluateBotSwapAcceptance = (...args: any[]) =>
  (botHybridTradeMod?.evaluateBotSwapAcceptance ?? (botTradeMod as any)?.evaluateBotSwapAcceptance)?.(...args);

const handleBotRecipientTrade = (...args: any[]) =>
  tradeCoordHelperMod?.handleBotRecipientTrade?.(...args);

function setupTestRoom(opts?: {
  botPersonality?: BotPersonality;
  botBalance?: number;
  partnerBalance?: number;
  roundCount?: number;
  partnerIsBot?: boolean;
}) {
  const mgr = new RoomManager(20301);
  const room = mgr.createRoom('human_p1');
  const botPersonality = opts?.botPersonality ?? BotPersonality.Balanced;
  mgr.addBot(room.roomCode, 'bot_p2', botPersonality);
  if (opts?.partnerIsBot) {
    mgr.addBot(room.roomCode, 'bot_p3', BotPersonality.Balanced);
  }
  mgr.startGame(room.roomCode);

  room.roundCount = opts?.roundCount ?? 5;
  room.phase = TurnPhase.PropertyManagement;

  const human = room.players.find((p) => p.id === 'human_p1')!;
  const bot = room.players.find((p) => p.id === 'bot_p2')!;
  const bot2 = opts?.partnerIsBot ? room.players.find((p) => p.id === 'bot_p3')! : undefined;

  human.balance = opts?.partnerBalance ?? 10_000;
  bot.balance = opts?.botBalance ?? 10_000;
  if (bot2) bot2.balance = opts?.partnerBalance ?? 10_000;

  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;

  for (let i = 0; i < 40; i++) {
    sm.set(i, { level: 0, isMortgaged: false });
  }

  const ctx: RoomContext = {
    room,
    reg,
    sm,
    botPersonalities: (mgr as any).botPersonalities,
  };

  return { mgr, room, human, bot, bot2, reg, sm, ctx, botPersonality };
}

describe('[TC-203][UC-IMP203] Bot Hybrid Trade Offers & Strategic Bilateral Valuation Contract Suite', () => {
  // =========================================================================
  // FACET 1: Boundary & Surplus Identification
  // =========================================================================
  describe('Facet 1: Boundary & Surplus Identification', () => {
    it('[TC-203.01/MSS][UC-IMP203] findSurplusProperties nhận diện chính xác ô đất đơn lẻ thuộc nhóm màu đã bị đối thủ chặn', () => {
      const { room, bot, reg, sm } = setupTestRoom();
      // Nhóm Cam (16, 18, 19): Bot sở hữu 16, Đối thủ sở hữu 18 -> Bot bị chặn độc quyền
      reg.set(16, bot.id);
      reg.set(18, 'human_p1');

      const surplus = findSurplusProperties(bot, room, reg, sm);
      expect(Array.isArray(surplus)).toBe(true);
      expect(surplus).toContain(16);
    });

    it('[TC-203.02/MSS][UC-IMP203] findSurplusProperties loại bỏ ô đất đã xây công trình (level > 0)', () => {
      const { room, bot, reg, sm } = setupTestRoom();
      reg.set(16, bot.id);
      reg.set(18, 'human_p1');
      sm.set(16, { level: 1, isMortgaged: false }); // Đã xây công trình cấp 1

      const surplus = findSurplusProperties(bot, room, reg, sm);
      expect(Array.isArray(surplus)).toBe(true);
      expect(surplus).not.toContain(16);
    });

    it('[TC-203.03/MSS][UC-IMP203] findSurplusProperties loại bỏ ô đất đang bị thế chấp (isMortgaged)', () => {
      const { room, bot, reg, sm } = setupTestRoom();
      reg.set(16, bot.id);
      reg.set(18, 'human_p1');
      sm.set(16, { level: 0, isMortgaged: true }); // Đang bị thế chấp
      bot.mortgagedProperties = [16];

      const surplus = findSurplusProperties(bot, room, reg, sm);
      expect(Array.isArray(surplus)).toBe(true);
      expect(surplus).not.toContain(16);
    });

    it('[TC-203.04/MSS][UC-IMP203] findSurplusProperties loại bỏ các ô BĐS đặc biệt không màu (Railroad/Utility)', () => {
      const { room, bot, reg, sm } = setupTestRoom();
      reg.set(5, bot.id);  // Railroad: Cảng HKQT Long Thành
      reg.set(12, bot.id); // Utility: EVN

      const surplus = findSurplusProperties(bot, room, reg, sm);
      expect(Array.isArray(surplus)).toBe(true);
      expect(surplus).not.toContain(5);
      expect(surplus).not.toContain(12);
    });

    it('[TC-203.05/MSS][UC-IMP203] findSurplusProperties tuyệt đối không bao gồm ô đất thuộc nhóm màu độc quyền của Bot', () => {
      const { room, bot, reg, sm } = setupTestRoom();
      // Nhóm Nâu (1, 3): Bot sở hữu cả 2 ô -> Độc quyền
      reg.set(1, bot.id);
      reg.set(3, bot.id);

      const surplus = findSurplusProperties(bot, room, reg, sm);
      expect(Array.isArray(surplus)).toBe(true);
      expect(surplus).not.toContain(1);
      expect(surplus).not.toContain(3);
    });

    it('[TC-203.06/MSS][UC-IMP203] findSurplusProperties không bao gồm ô đất thuộc nhóm màu mà Bot đang có N-1 ô', () => {
      const { room, bot, reg, sm } = setupTestRoom();
      // Nhóm Xanh Da Trời (6, 8, 9) có 3 ô: Bot sở hữu 6 và 8 (N-1 ô), đang chờ độc quyền
      reg.set(6, bot.id);
      reg.set(8, bot.id);

      const surplus = findSurplusProperties(bot, room, reg, sm);
      expect(Array.isArray(surplus)).toBe(true);
      expect(surplus).not.toContain(6);
      expect(surplus).not.toContain(8);
    });
  });

  // =========================================================================
  // FACET 2: Reactivity & Strategic Hybrid Pricing
  // =========================================================================
  describe('Facet 2: Reactivity & Strategic Hybrid Pricing', () => {
    it('[TC-203.07/MSS][UC-IMP203] Khi Bot có gap và có đất thặng dư + đủ tiền, findEligibleBotTrade phát sinh INTENT_TRADE_OFFER có cả offeredCellIndex VÀ price', () => {
      const { room, human, bot, reg, sm } = setupTestRoom();
      // Bot có gap nhóm Nâu: sở hữu 1, thiếu 3 (do human sở hữu)
      reg.set(1, bot.id);
      reg.set(3, human.id);

      // Bot có đất thặng dư nhóm Cam: sở hữu 16, bị human chặn ở ô 18
      reg.set(16, bot.id);
      reg.set(18, human.id);

      const offer = findEligibleBotTrade(bot, room, reg, sm, BotPersonality.Balanced, 5);
      expect(offer?.type).toBe('INTENT_TRADE_OFFER');
      expect(offer?.cellIndex).toBe(3);
      expect((offer as any)?.offeredCellIndex).toBe(16);
      expect(offer?.price).toBeGreaterThanOrEqual(0);
    });

    it('[TC-203.08/MSS][UC-IMP203] Khi ô đất đem đổi giúp đối tác hoàn tất độc quyền (partnerGetsMonopoly === true) và O >= W, price === 0 (đổi ngang Win-Win)', () => {
      const { bot } = setupTestRoom();
      // wantedCell = 1 (giá 600), offeredCell = 6 (giá 1000). O (1000) >= W (600), partnerGetsMonopoly = true
      const price = calculateHybridTradeOfferPrice(1, 6, bot, BotPersonality.Balanced, true);
      expect(price).toBe(0);
    });

    it('[TC-203.09/MSS][UC-IMP203] Khi ô đất đem đổi giúp đối tác hoàn tất độc quyền (partnerGetsMonopoly === true) và W > O, price === W - O (chỉ bù chênh lệch gốc)', () => {
      const { bot } = setupTestRoom();
      // wantedCell = 6 (giá 1000), offeredCell = 1 (giá 600). W > O -> baseDiff = 400, partnerGetsMonopoly = true
      const price = calculateHybridTradeOfferPrice(6, 1, bot, BotPersonality.Balanced, true);
      expect(price).toBe(400);
    });

    it('[TC-203.10/MSS][UC-IMP203] Khi ô đất đem đổi KHÔNG giúp đối tác độc quyền và W > O, price bao gồm chênh lệch gốc + tiền thưởng tính cách (35% Aggressive / 25% Balanced)', () => {
      const { bot } = setupTestRoom();
      // wantedCell = 6 (giá 1000), offeredCell = 1 (giá 600). W > O -> baseDiff = 400, partnerGetsMonopoly = false
      // Aggressive: 400 + round(1000 * 0.35) = 750
      // Balanced: 400 + round(1000 * 0.25) = 650
      const priceAgg = calculateHybridTradeOfferPrice(6, 1, bot, BotPersonality.Aggressive, false);
      const priceBal = calculateHybridTradeOfferPrice(6, 1, bot, BotPersonality.Balanced, false);
      expect(priceAgg).toBe(750);
      expect(priceBal).toBe(650);
    });

    it('[TC-203.11/MSS][UC-IMP203] Khi ô đất đem đổi KHÔNG giúp đối tác độc quyền và O >= W, Bot Aggressive/Balanced vẫn lì xì thêm tiền mặt (> 0), Bot Passive đổi ngang (= 0)', () => {
      const { bot } = setupTestRoom();
      // wantedCell = 1 (giá 600), offeredCell = 6 (giá 1000). O >= W, partnerGetsMonopoly = false
      const priceAgg = calculateHybridTradeOfferPrice(1, 6, bot, BotPersonality.Aggressive, false);
      const priceBal = calculateHybridTradeOfferPrice(1, 6, bot, BotPersonality.Balanced, false);
      const pricePas = calculateHybridTradeOfferPrice(1, 6, bot, BotPersonality.Passive, false);
      expect(priceAgg).toBeGreaterThan(0);
      expect(priceBal).toBeGreaterThan(0);
      expect(pricePas).toBe(0);
    });

    it('[TC-203.12/MSS][UC-IMP203] Khi Bot không có đất thặng dư, findEligibleBotTrade tự động fallback về đề xuất thuần tiền (cash-only)', () => {
      const { room, human, bot, reg, sm } = setupTestRoom();
      // Bot có gap nhóm Nâu: sở hữu 1, thiếu 3 (human sở hữu). Bot KHÔNG sở hữu thêm ô nào khác
      reg.set(1, bot.id);
      reg.set(3, human.id);

      const offer = findEligibleBotTrade(bot, room, reg, sm, BotPersonality.Balanced, 5);
      expect(offer?.type).toBe('INTENT_TRADE_OFFER');
      expect(offer?.cellIndex).toBe(3);
      expect((offer as any)?.offeredCellIndex).toBeUndefined();
    });

    it('[TC-203.13/MSS][UC-IMP203] Khi Bot không đủ tiền mặt cho khoản bù an toàn, tự động fallback về đề xuất thuần tiền hoặc bỏ qua', () => {
      const { room, human, bot, reg, sm } = setupTestRoom({ botBalance: 550 });
      // Bot có gap nhóm Đỏ (21, giá 2200, human sở hữu). Bot có đất Cam (16, giá 1800, chênh lệch 400).
      // Số dư bot chỉ 550, sau khi bù 400 còn 150 < buffer an toàn 500
      reg.set(23, bot.id);
      reg.set(24, bot.id);
      reg.set(21, human.id);
      reg.set(16, bot.id);
      reg.set(18, human.id);

      const hybridPrice = calculateHybridTradeOfferPrice(21, 16, bot, BotPersonality.Balanced, false);
      expect(hybridPrice).toBeNull();

      const offer = findEligibleBotTrade(bot, room, reg, sm, BotPersonality.Balanced, 5);
      expect((offer as any)?.offeredCellIndex).toBeUndefined();
    });
  });

  // =========================================================================
  // FACET 3: Server Coordination & Bilateral Valuation
  // =========================================================================
  describe('Facet 3: Server Coordination & Bilateral Valuation', () => {
    it('[TC-203.14/MSS][UC-IMP203] coordTrade gọi evaluateBotSwapAcceptance khi nhận đề xuất có offeredCellIndex', () => {
      const { ctx, human, bot, reg } = setupTestRoom();
      // Bot sở hữu độc quyền ô 1 và 3. Human đề xuất đổi ô 16 lấy ô 3 của Bot kèm bù 0
      reg.set(1, bot.id);
      reg.set(3, bot.id);
      reg.set(16, human.id);

      // Human gửi đề xuất đổi ô 16 lấy ô 3 của Bot -> coordTrade phải xử lý tức thì và từ chối vì mất độc quyền
      const res = coordTrade(ctx, human.id, bot.id, human.id, 3, 0, 16);
      expect((res as any).pending ?? false).toBe(false);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.TRADE_REJECTED);
    });

    it('[TC-203.15/MSS][UC-IMP203] Bot nhận đề xuất chấp thuận khi gói đổi mang lại độc quyền cho bot hoặc tổng giá trị (đất + tiền) vượt trội', () => {
      const { room, human, bot, reg, sm } = setupTestRoom();
      // Bot sở hữu 1 (Nâu), Human sở hữu 3 (Nâu). Human nhượng 3, yêu cầu lấy 16 (Cam) của Bot, Bot không phải bù tiền
      reg.set(1, bot.id);
      reg.set(3, human.id);
      reg.set(16, bot.id);

      const decision = evaluateBotSwapAcceptance(3, 16, 0, bot, human, room, reg, sm, BotPersonality.Balanced);
      expect(decision?.accept).toBe(true);
    });

    it('[TC-203.16/MSS][UC-IMP203] Bot nhận từ chối khi đề xuất làm mất độc quyền của chính nó (isMonopolyGroup)', () => {
      const { room, human, bot, reg, sm } = setupTestRoom();
      // Bot đã hoàn thành độc quyền nhóm Nâu (1, 3). Human đề xuất lấy ô 3 của Bot
      reg.set(1, bot.id);
      reg.set(3, bot.id);
      reg.set(16, human.id);

      const decision = evaluateBotSwapAcceptance(16, 3, 0, bot, human, room, reg, sm, BotPersonality.Balanced);
      expect(decision?.accept).toBe(false);
      expect(decision?.reason).toBe('PREVENT_MONOPOLY');
    });

    it('[TC-203.17/MSS][UC-IMP203] Bot-to-Bot parity chấp thuận khi tổng giá trị đề xuất >= 1.60x giá trị ô đất', () => {
      const { ctx, bot, bot2, reg } = setupTestRoom({ partnerIsBot: true });
      // Bot seller sở hữu ô 3 (giá 600). Bot buyer (bot2) đề xuất đổi ô 1 (giá 600) + 400 tiền mặt.
      // Tổng giá trị gói đề xuất = 600 + 400 = 1000 >= 1.60 * 600 (960)
      reg.set(3, bot.id);
      reg.set(1, bot2!.id);

      const res = handleBotRecipientTrade(ctx, bot, bot2!, 3, 400, 1);
      expect(res?.success).toBe(true);
    });

    it('[TC-203.18/MSS][UC-IMP203] Sau khi giao dịch hỗn hợp thành công qua executeP2PTrade, cả 2 ô đất đổi chủ tức thì, tiền bù và thuế 5% được luân chuyển chính xác', () => {
      const { room, human, bot, reg, sm } = setupTestRoom();
      reg.set(1, human.id);
      reg.set(3, bot.id);

      const price = 1000;
      const expectedTax = Math.floor(price * 0.05); // 50

      const res = executeP2PTrade(room, bot.id, human.id, 3, price, reg, sm, 1);
      expect(res.success).toBe(true);
      expect(reg.get(3)).toBe(human.id);
      expect(reg.get(1)).toBe(bot.id);
      expect(room.treasury).toBe(expectedTax);
    });
  });

  // =========================================================================
  // FACET 4: Adversarial Defenses & Anti-Freeze Gates
  // =========================================================================
  describe('Facet 4: Adversarial Defenses & Anti-Freeze Gates', () => {
    it('[TC-203.19/MSS][UC-IMP203] Anti-Modal Freeze: Khi Human đề xuất đổi đất cho Bot, server xử lý đồng bộ tức thì 0ms (pending: false), không bao giờ mở modal 15s chờ Bot', () => {
      const { ctx, human, bot, reg } = setupTestRoom();
      reg.set(1, human.id);
      reg.set(3, bot.id);

      // Human đề xuất đổi ô 1 lấy ô 3 của Bot kèm 500 Tr.
      const res = coordTrade(ctx, human.id, bot.id, human.id, 3, 500, 1);
      expect((res as any).pending ?? false).toBe(false);
      expect((res as any).offerId).toBeUndefined();
    });

    it('[TC-203.20/MSS][UC-IMP203] Leader Embargo & Cooldown: Bot không đưa ô đất giúp người chơi đang dẫn đầu hoàn thành độc quyền; khi đề xuất bị từ chối, swapPairLastRejectedRound kích hoạt cooldown 3 vòng', () => {
      const { room, human, bot, reg, sm } = setupTestRoom();
      // Cho human thành Leader áp đảo (nhiều tiền + độc quyền Hồng C3)
      human.balance = 50_000;
      reg.set(11, human.id);
      reg.set(13, human.id);
      reg.set(14, human.id);
      sm.set(11, { level: 3, isMortgaged: false });
      sm.set(13, { level: 3, isMortgaged: false });
      sm.set(14, { level: 3, isMortgaged: false });

      // Bot có gap nhóm Nâu: sở hữu 1, thiếu 3 (human sở hữu)
      reg.set(1, bot.id);
      reg.set(3, human.id);

      // Human sở hữu 8 và 9 (nhóm Xanh Da Trời), đang thiếu ô 6 để độc quyền
      reg.set(8, human.id);
      reg.set(9, human.id);
      // Bot có ô thặng dư 6 (nhưng đưa 6 cho human sẽ giúp human hoàn thành độc quyền)
      reg.set(6, bot.id);

      const gap: MonopolyGap = { cellIndex: 3, targetOwnerId: human.id };
      const hybridOffer = findEligibleBotHybridTrade(bot, gap, room, reg, sm, BotPersonality.Balanced, 5);
      expect(hybridOffer).toBeNull();

      // Cooldown kiểm chứng: nếu cặp 3_6 bị từ chối ở vòng 5, tại vòng 6 vẫn bị chặn
      (bot as any).swapPairLastRejectedRound = { '3_6': 5 };
      const cooldownOffer = findEligibleBotHybridTrade(bot, gap, room, reg, sm, BotPersonality.Balanced, 6);
      expect(cooldownOffer).toBeNull();
    });
  });
});
