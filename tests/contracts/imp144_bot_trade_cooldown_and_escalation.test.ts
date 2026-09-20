// [CONTRACT TEST] IMP-144: Tối Ưu Nhịp Độ Đàm Phán Bot (Target Cell Cooldown 1 Lượt & Tăng Giá Bậc Thang Phân Tầng Tính Cách)
// Universal 4-Facet Behavioral Matrix & Adversarial Inversion Verification
// Traceability Tags: [TC-144.01..18] & [UC-IMP144]
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase, type Player } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import {
  findEligibleBotTrade,
  calculateTradeOfferPrice,
} from '../../src/domain/bot/bot_trade.js';
import { executeP2PTrade } from '../../src/server/property_actions.js';

// Khai báo mở rộng giao thức thuộc tính người chơi cho IMP-144
declare module '../../src/domain/room.js' {
  interface Player {
    cellTradeRejections?: Record<number, number>;
    cellLastRejectedRound?: Record<number, number>;
  }
}

function setupRoom(opts?: {
  botPersonality?: BotPersonality;
  botBalance?: number;
  humanBalance?: number;
  roundCount?: number;
}) {
  const mgr = new RoomManager(14401);
  const room = mgr.createRoom('human_p1');
  const botPersonality = opts?.botPersonality ?? BotPersonality.Balanced;
  mgr.addBot(room.roomCode, 'bot_trader', botPersonality);
  mgr.startGame(room.roomCode);

  room.roundCount = opts?.roundCount ?? 5;
  room.phase = TurnPhase.PropertyManagement;

  const human = room.players.find((p) => p.id === 'human_p1')!;
  const bot = room.players.find((p) => p.id === 'bot_trader')!;
  human.isBot = false;
  human.balance = opts?.humanBalance ?? 10_000;
  bot.isBot = true;
  bot.balance = opts?.botBalance ?? 15_000;

  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;

  // Bot sở hữu ô 1 (Hà Nội Cổ), Human sở hữu ô 3 (Phố Cổ) - Nhóm màu Nâu (Brown monopoly gap)
  reg.set(1, bot.id);
  sm.set(1, { level: 0, isMortgaged: false });
  reg.set(3, human.id);
  sm.set(3, { level: 0, isMortgaged: false });

  return { mgr, room, human, bot, reg, sm, botPersonality };
}

describe('[TC-144][UC-IMP144] Bot Trade Target Cooldown & Escalation Contract Suite', () => {
  // =========================================================================
  // FACET 1: Boundary & Cooldown (Target Cell Cooldown & Anti-Gap Starvation)
  // =========================================================================
  describe('Facet 1: Boundary & Cooldown', () => {
    it('[TC-144.01/MSS][UC-IMP144] Khi ô đất X bị từ chối ở Vòng R, Bot không đề xuất lại đúng ô đất X ở Vòng R (currentRound = R)', () => {
      const { room, bot, reg, sm, botPersonality } = setupRoom({ roundCount: 5 });
      bot.cellLastRejectedRound = { 3: 5 };
      bot.lastTradeOfferRound = undefined;

      const intent = findEligibleBotTrade(bot, room, reg, sm, botPersonality, 5);
      expect(intent).toBeNull();
    });

    it('[TC-144.02/MSS][UC-IMP144] Khi ô đất X bị từ chối ở Vòng R, Bot không đề xuất lại đúng ô đất X ở Vòng R + 1 (currentRound = R + 1)', () => {
      const { room, bot, reg, sm, botPersonality } = setupRoom({ roundCount: 6 });
      bot.cellLastRejectedRound = { 3: 5 };
      bot.lastTradeOfferRound = undefined;

      const intent = findEligibleBotTrade(bot, room, reg, sm, botPersonality, 6);
      expect(intent).toBeNull();
    });

    it('[TC-144.03/MSS][UC-IMP144] Khi bước sang Vòng R + 2 (currentRound = R + 2), Bot được phép đề xuất lại ô đất X nếu đủ tài chính', () => {
      const { room, bot, reg, sm, botPersonality } = setupRoom({ roundCount: 7 });
      bot.cellLastRejectedRound = { 3: 5 };
      bot.lastTradeOfferRound = undefined;

      const intent = findEligibleBotTrade(bot, room, reg, sm, botPersonality, 7);
      expect(intent).not.toBeNull();
      expect(intent?.cellIndex).toBe(3);
    });

    it('[TC-144.04/MSS][UC-IMP144] Khi ô đất chưa từng bị từ chối (chưa có trong cellLastRejectedRound), không bị áp đặt cooldown ô đất', () => {
      const { room, bot, reg, sm, botPersonality } = setupRoom({ roundCount: 5 });
      bot.cellLastRejectedRound = {};
      bot.lastTradeOfferRound = undefined;

      const intent = findEligibleBotTrade(bot, room, reg, sm, botPersonality, 5);
      expect(intent).not.toBeNull();
      expect(intent?.cellIndex).toBe(3);
    });

    it('[TC-144.05/MSS][UC-IMP144] Anti-Gap Starvation: Bot thiếu 2 ô độc quyền X và Y; ô X bị từ chối ở Vòng R (cooldown), Bot vẫn tìm thấy và đề xuất ô Y trong cùng lượt', () => {
      const { room, bot, human, reg, sm, botPersonality } = setupRoom({ roundCount: 5 });
      // Cấu hình thêm Gap Y: Nhóm màu Xanh Da Trời (Light Blue: 6, 8, 9). Bot sở hữu 6, 9; Human sở hữu 8.
      reg.set(6, bot.id);
      sm.set(6, { level: 0, isMortgaged: false });
      reg.set(9, bot.id);
      sm.set(9, { level: 0, isMortgaged: false });
      reg.set(8, human.id);
      sm.set(8, { level: 0, isMortgaged: false });

      // Ô 3 bị từ chối ở Vòng 5 -> cooldown chặn ô 3
      bot.cellLastRejectedRound = { 3: 5 };
      bot.lastTradeOfferRound = undefined;

      const intent = findEligibleBotTrade(bot, room, reg, sm, botPersonality, 5);
      expect(intent).not.toBeNull();
      expect(intent?.cellIndex).toBe(8);
    });
  });

  // =========================================================================
  // FACET 2: Reactivity & Escalating Pricing (Tiered Escalation & Cap Invariants)
  // =========================================================================
  describe('Facet 2: Reactivity & Escalating Pricing', () => {
    it('[TC-144.06/MSS][UC-IMP144] Lần đề xuất đầu tiên (0 rejections): giá đề xuất tương ứng hệ số cơ bản (không tăng thêm)', () => {
      const { bot } = setupRoom();
      bot.cellTradeRejections = {};
      // Ô 3 giá gốc 600, Aggressive cơ bản round >= 6: 1.75x = 1050
      const price = calculateTradeOfferPrice(3, bot, BotPersonality.Aggressive, undefined, 6, true, 2);
      expect(price).toBe(1050);
    });

    it('[TC-144.07/MSS][UC-IMP144] Lần đề xuất sau 1 lần từ chối (rejections = 1): multiplier tăng thêm đúng +0.10 (+10% base price)', () => {
      const { bot } = setupRoom();
      bot.cellTradeRejections = { 3: 1 };
      // Ô 3 giá gốc 600, Aggressive cơ bản 1.75 + 0.10 = 1.85x = 1110
      const price = calculateTradeOfferPrice(3, bot, BotPersonality.Aggressive, undefined, 6, true, 2);
      expect(price).toBe(1110);
    });

    it('[TC-144.08/MSS][UC-IMP144] Lần đề xuất sau 2 lần từ chối (rejections = 2): multiplier tăng thêm đúng +0.20 (+20% base price)', () => {
      const { bot } = setupRoom();
      bot.cellTradeRejections = { 3: 2 };
      // Ô 3 giá gốc 600, Balanced cơ bản 1.55 + 0.20 = 1.75x = 1050
      const price = calculateTradeOfferPrice(3, bot, BotPersonality.Balanced, undefined, 6, true, 2);
      expect(price).toBe(1050);
    });

    it('[TC-144.09/MSS][UC-IMP144] Trần tăng giá của Bot Passive dừng ở mức tối đa +15% (+0.15), kể cả khi rejections >= 2', () => {
      const { bot } = setupRoom();
      bot.cellTradeRejections = { 3: 3 };
      // Ô 3 giá gốc 600, Passive cơ bản 1.60 + cap 0.15 = 1.75x = 1050
      const price = calculateTradeOfferPrice(3, bot, BotPersonality.Passive, undefined, 6, true, 2);
      expect(price).toBe(1050);
    });

    it('[TC-144.10/MSS][UC-IMP144] Trần tăng giá của Bot Balanced dừng ở mức tối đa +30% (+0.30), kể cả khi rejections >= 4', () => {
      const { bot } = setupRoom();
      bot.cellTradeRejections = { 3: 4 };
      // Ô 3 giá gốc 600, Balanced cơ bản 1.55 + cap 0.30 = 1.85x = 1110
      const price = calculateTradeOfferPrice(3, bot, BotPersonality.Balanced, undefined, 6, true, 2);
      expect(price).toBe(1110);
    });

    it('[TC-144.11/MSS][UC-IMP144] Trần tăng giá của Bot Aggressive dừng ở mức tối đa +40% (+0.40), kể cả khi rejections >= 5', () => {
      const { bot } = setupRoom();
      bot.cellTradeRejections = { 3: 5 };
      // Ô 3 giá gốc 600, Aggressive cơ bản 1.75 + cap 0.40 = 2.15x = 1290
      const price = calculateTradeOfferPrice(3, bot, BotPersonality.Aggressive, undefined, 6, true, 2);
      expect(price).toBe(1290);
    });
  });

  // =========================================================================
  // FACET 3: Disposal, Timeout & Ownership Reset (Tracking Lifecycle & Cleanup)
  // =========================================================================
  describe('Facet 3: Disposal, Timeout & Ownership Reset', () => {
    it('[TC-144.12/MSS][UC-IMP144] Khi người chơi chủ động từ chối (coordRespondTradeOffer accept: false), số lần từ chối tăng 1 và lastRejectedRound ghi nhận đúng round hiện tại', () => {
      const { mgr, room, human, bot } = setupRoom({ roundCount: 5 });
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? '';

      mgr.handleRespondTradeOffer(room.roomCode, human.id, offerId, false);

      expect(bot.cellTradeRejections?.[3]).toBe(1);
      expect(bot.cellLastRejectedRound?.[3]).toBe(5);
    });

    it('[TC-144.13/MSS][UC-IMP144] Khi hết hạn 15s timeout (checkPendingTradeTimeout), số lần từ chối tăng 1 và lastRejectedRound ghi nhận đúng round hiện tại', () => {
      const { mgr, room, human, bot } = setupRoom({ roundCount: 5 });
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);

      mgr.checkPendingTradeTimeout(room.roomCode, Date.now() + 16_000);

      expect(bot.cellTradeRejections?.[3]).toBe(1);
      expect(bot.cellLastRejectedRound?.[3]).toBe(5);
    });

    it('[TC-144.14/MSS][UC-IMP144] Khi giao dịch thành công (coordRespondTradeOffer accept: true), lịch sử từ chối của ô đất được xóa sạch khỏi buyer', () => {
      const { mgr, room, human, bot } = setupRoom({ roundCount: 5 });
      bot.cellTradeRejections = { 3: 2 };
      bot.cellLastRejectedRound = { 3: 3 };

      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? '';

      mgr.handleRespondTradeOffer(room.roomCode, human.id, offerId, true);

      expect(bot.cellTradeRejections?.[3]).toBeUndefined();
      expect(bot.cellLastRejectedRound?.[3]).toBeUndefined();
    });

    it('[TC-144.15/MSS][UC-IMP144] Khi giao dịch P2P thành công qua executeP2PTrade / coordTrade, lịch sử từ chối của ô đất được xóa sạch', () => {
      const { room, human, bot, reg, sm } = setupRoom({ roundCount: 5 });
      bot.cellTradeRejections = { 3: 2 };
      bot.cellLastRejectedRound = { 3: 3 };

      executeP2PTrade(room, human.id, bot.id, 3, 1000, reg, sm);

      expect(bot.cellTradeRejections?.[3]).toBeUndefined();
      expect(bot.cellLastRejectedRound?.[3]).toBeUndefined();
    });
  });

  // =========================================================================
  // FACET 4: Error Defense & Solvency (Safe Init & Solvency Protection)
  // =========================================================================
  describe('Facet 4: Error Defense & Solvency', () => {
    it('[TC-144.16/A1][UC-IMP144] Khi buyer.cellTradeRejections hoặc buyer.cellLastRejectedRound là undefined, thao tác từ chối không ném ngoại lệ (Safe Init)', () => {
      const { mgr, room, human, bot } = setupRoom({ roundCount: 5 });
      bot.cellTradeRejections = undefined;
      bot.cellLastRejectedRound = undefined;

      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? '';

      const res = mgr.handleRespondTradeOffer(room.roomCode, human.id, offerId, false);

      expect(res.success).toBe(true);
      expect(bot.cellTradeRejections?.[3]).toBe(1);
    });

    it('[TC-144.17/A2][UC-IMP144] Khi giá leo thang khiến bot.balance - price < safetyBuffer (1.000 Tr.), calculateTradeOfferPrice trả về null (bảo vệ ngân sách, chống vỡ nợ)', () => {
      const { bot } = setupRoom();
      bot.balance = 2100; // Số dư vừa đủ với giá gốc (1050), nhưng không đủ khi leo thang lên 1170 (2100 - 1170 = 930 < 1000)
      bot.cellTradeRejections = { 3: 2 }; // Leo thang +0.20 -> 1.75 + 0.20 = 1.95x -> price = 1170

      const price = calculateTradeOfferPrice(3, bot, BotPersonality.Aggressive, undefined, 6, true, 2);
      expect(price).toBeNull();
    });

    it('[TC-144.18/A3][UC-IMP144] Khi tất cả các monopoly gap đều đang trong thời gian cooldown, findEligibleBotTrade trả về null mà không gây crash', () => {
      const { room, bot, reg, sm, botPersonality } = setupRoom({ roundCount: 5 });
      bot.cellLastRejectedRound = { 3: 5 };
      bot.lastTradeOfferRound = undefined;

      const intent = findEligibleBotTrade(bot, room, reg, sm, botPersonality, 5);
      expect(intent).toBeNull();
    });
  });
});
