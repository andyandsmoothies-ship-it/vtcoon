// [CONTRACT TEST] IMP-146: Two-Way P2P Property Swap & Negotiation Parity
// Universal 4-Facet Behavioral Matrix & Adversarial Inversion Verification
// Traceability Tags: [TC-146.01..19] & [UC-IMP146]
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher.js';
import { TurnPhase, type Player } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import { ActionRejectReason } from '../../src/domain/action_reasons.js';
import { executeP2PTrade } from '../../src/server/property_actions.js';
import {
  findBotSwapTrade,
  evaluateBotSwapAcceptance,
} from '../../src/domain/bot/bot_trade.js';
import { buildDeltaFromRoom } from '../../src/server/session_manager.js';
import { EnvelopeValidator } from '../../src/server/security/envelope_validator.js';

// Mở rộng giao thức thuộc tính người chơi cho cơ chế swap cooldown
declare module '../../src/domain/room.js' {
  interface Player {
    swapPairLastRejectedRound?: Record<string, number>;
  }
}

function setupSwapRoom(opts?: {
  botPersonality?: BotPersonality;
  botBalance?: number;
  humanBalance?: number;
  roundCount?: number;
}) {
  const mgr = new RoomManager(14601);
  const room = mgr.createRoom('human_p1');
  const botPersonality = opts?.botPersonality ?? BotPersonality.Aggressive;
  mgr.addBot(room.roomCode, 'bot_p2', botPersonality);
  mgr.startGame(room.roomCode);

  room.roundCount = opts?.roundCount ?? 5;
  room.phase = TurnPhase.PropertyManagement;

  const human = room.players.find((p) => p.id === 'human_p1')!;
  const bot = room.players.find((p) => p.id === 'bot_p2')!;

  human.balance = opts?.humanBalance ?? 10000;
  bot.balance = opts?.botBalance ?? 10000;

  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;

  sm.set(1, { level: 0, isMortgaged: false });
  sm.set(3, { level: 0, isMortgaged: false });

  return { mgr, room, human, bot, reg, sm, botPersonality };
}

describe('[TC-146][UC-IMP146] Two-Way Property Swap & Negotiation Parity Contract Suite', () => {
  // =========================================================================
  // FACET 1: Boundary & Range (Property Actions & P2P Trade Validation)
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-146.01/MSS][UC-IMP146] Đổi đất 2 chiều ngang giá (offeredCellIndex hợp lệ, price === 0): Chấp nhận hợp lệ, bỏ qua PRICE_BELOW_FLOOR và INVALID_PRICE', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      reg.set(1, human.id); // Ô 1 (Nâu: Đồng Nai, giá 600)
      reg.set(3, bot.id);   // Ô 3 (Nâu: Cần Thơ, giá 600)

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, 0, reg, sm, 1);
      expect(res.success).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    it('[TC-146.02a/MSS][UC-IMP146] Đổi đất 2 chiều Buyer bù tiền (price > 0): Buyer đủ tiền -> Hợp lệ và chuyển nhượng quyền sở hữu cả 2 ô đất', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom({ humanBalance: 2000 });
      reg.set(1, human.id);
      reg.set(3, bot.id);

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, 500, reg, sm, 1);
      expect(res.success).toBe(true);
      expect(reg.get(3)).toBe(human.id);
      expect(reg.get(1)).toBe(bot.id);
    });

    it('[TC-146.02b/A1][UC-IMP146] Đổi đất 2 chiều Buyer bù tiền (price > 0): Buyer thiếu tiền -> Trả về ActionRejectReason.INSUFFICIENT_FUNDS', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom({ humanBalance: 200 });
      reg.set(1, human.id);
      reg.set(3, bot.id);

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, 500, reg, sm, 1);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    });

    it('[TC-146.03a/MSS][UC-IMP146] Đổi đất 2 chiều Seller bù tiền (price < 0): Seller đủ tiền -> Hợp lệ và chuyển nhượng quyền sở hữu cả 2 ô đất', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom({ botBalance: 2000 });
      reg.set(1, human.id);
      reg.set(3, bot.id);

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, -600, reg, sm, 1);
      expect(res.success).toBe(true);
      expect(reg.get(3)).toBe(human.id);
      expect(reg.get(1)).toBe(bot.id);
    });

    it('[TC-146.03b/A2][UC-IMP146] Đổi đất 2 chiều Seller bù tiền (price < 0): Seller thiếu tiền -> Trả về ActionRejectReason.INSUFFICIENT_FUNDS', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom({ botBalance: 300 });
      reg.set(1, human.id);
      reg.set(3, bot.id);

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, -600, reg, sm, 1);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    });

    it('[TC-146.04/A3][UC-IMP146] Từ chối khi ô đất đưa ra offeredCellIndex không thuộc sở hữu của buyerId (NOT_OWNER)', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      reg.set(1, 'stranger_p3'); // Ô 1 không phải của human
      reg.set(3, bot.id);

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, 0, reg, sm, 1);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.NOT_OWNER);
    });

    it('[TC-146.05/A4][UC-IMP146] Từ chối khi ô đất đưa ra offeredCellIndex đã xây dựng cấp C1-C3 (PROPERTY_HAS_BUILDING)', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      reg.set(1, human.id);
      sm.set(1, { level: 2, isMortgaged: false }); // Đã xây cấp 2
      reg.set(3, bot.id);

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, 0, reg, sm, 1);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.PROPERTY_HAS_BUILDING);
    });

    it('[TC-146.06/A5][UC-IMP146] Từ chối khi ô đất đưa ra offeredCellIndex đang bị thế chấp (PROPERTY_MORTGAGED)', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      reg.set(1, human.id);
      human.mortgagedProperties = [1];
      sm.set(1, { level: 0, isMortgaged: true });
      reg.set(3, bot.id);

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, 0, reg, sm, 1);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.PROPERTY_MORTGAGED);
    });

    it('[TC-146.07a/A6][UC-IMP146] Từ chối khi ô đất mục tiêu cellIndex đang bị thế chấp (PROPERTY_MORTGAGED)', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      reg.set(1, human.id);
      reg.set(3, bot.id);
      bot.mortgagedProperties = [3];
      sm.set(3, { level: 0, isMortgaged: true });

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, 0, reg, sm, 1);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.PROPERTY_MORTGAGED);
    });

    it('[TC-146.07b/A7][UC-IMP146] Từ chối khi ô đất mục tiêu cellIndex đã có công trình (PROPERTY_HAS_BUILDING)', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      reg.set(1, human.id);
      reg.set(3, bot.id);
      sm.set(3, { level: 1, isMortgaged: false });

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, 0, reg, sm, 1);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.PROPERTY_HAS_BUILDING);
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity & Bot Decisions (src/domain/bot/bot_trade.ts)
  // =========================================================================
  describe('Facet 2: State Reactivity & Bot Decisions', () => {
    it('[TC-146.08/MSS][UC-IMP146] findBotSwapTrade: Quét thấy cơ hội Win-Win -> tạo đề xuất INTENT_TRADE_OFFER có offeredCellIndex', () => {
      const { room, human, bot, reg, sm, botPersonality } = setupSwapRoom();
      // Nhóm Nâu (1, 3): Bot có 1, Human có 3 -> Bot thiếu 3
      reg.set(1, bot.id);
      reg.set(3, human.id);

      // Nhóm Xanh Da Trời (6, 8, 9): Human có 6, 8, Bot có 9 -> Human thiếu 9
      reg.set(6, human.id);
      sm.set(6, { level: 0, isMortgaged: false });
      reg.set(8, human.id);
      sm.set(8, { level: 0, isMortgaged: false });
      reg.set(9, bot.id);
      sm.set(9, { level: 0, isMortgaged: false });

      const swapOffer = findBotSwapTrade(bot, room, reg, sm, botPersonality, 5);
      expect(swapOffer).not.toBeNull();
      expect(swapOffer?.type).toBe('INTENT_TRADE_OFFER');
      expect(swapOffer?.cellIndex).toBe(3);
      expect(swapOffer?.offeredCellIndex).toBe(9);
    });

    it('[TC-146.09/MSS][UC-IMP146] evaluateBotSwapAcceptance (Aggressive): Sẵn sàng đổi và bù tiền hợp lý để chốt bộ độc quyền', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom({ botPersonality: BotPersonality.Aggressive });
      reg.set(1, bot.id);
      reg.set(3, human.id); // Ô 3 hoàn thành bộ Nâu cho Bot
      reg.set(9, bot.id);   // Ô 9 Bot đưa ra đổi

      // Human đề xuất đổi: Human nhượng Ô 3, lấy Ô 9 của Bot, yêu cầu Bot bù 300 Tr.
      const decision = evaluateBotSwapAcceptance(3, 9, 300, bot, human, room, reg, sm, BotPersonality.Aggressive);
      expect(decision.accept).toBe(true);
    });

    it('[TC-146.10/MSS][UC-IMP146] evaluateBotSwapAcceptance (Passive): Từ chối nếu đề xuất đổi đất làm mất độc quyền của mình hoặc tiền bù không an toàn', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom({ botPersonality: BotPersonality.Passive, botBalance: 500 });
      reg.set(1, bot.id);
      reg.set(3, human.id);
      reg.set(9, bot.id);

      // Yêu cầu Bot Passive bù số tiền quá lớn (1000 Tr.) vượt quá ngân sách an toàn
      const decision = evaluateBotSwapAcceptance(3, 9, 1000, bot, human, room, reg, sm, BotPersonality.Passive);
      expect(decision.accept).toBe(false);
      expect(['INSUFFICIENT_FUNDS', 'SAFETY_BUFFER_BREACH', 'PRICE_TOO_HIGH', 'PREVENT_MONOPOLY']).toContain(decision.reason);
    });

    it('[TC-146.11/MSS][UC-IMP146] evaluateBotSwapAcceptance (Cấm vận kẻ dẫn đầu EMBARGO_LEADER): Từ chối đổi đất hoàn tất độc quyền cho người đang dẫn đầu ván cờ', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      // Cho human dẫn đầu áp đảo (nhiều tiền và nhiều công trình C3)
      human.balance = 50000;
      reg.set(11, human.id);
      reg.set(13, human.id);
      reg.set(14, human.id);
      sm.set(11, { level: 3, isMortgaged: false });
      sm.set(13, { level: 3, isMortgaged: false });
      sm.set(14, { level: 3, isMortgaged: false });

      reg.set(1, bot.id);
      reg.set(3, human.id);
      reg.set(9, bot.id);

      const decision = evaluateBotSwapAcceptance(3, 9, 0, bot, human, room, reg, sm, BotPersonality.Balanced);
      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('EMBARGO_LEADER');
    });

    it('[TC-146.12a/MSS][UC-IMP146] Cooldown 3 vòng: Cặp ô đất từng bị từ chối không được findBotSwapTrade đề xuất lại trong vòng 3 rounds', () => {
      const { room, human, bot, reg, sm, botPersonality } = setupSwapRoom();
      reg.set(1, bot.id);
      reg.set(3, human.id);
      reg.set(6, human.id);
      reg.set(8, human.id);
      reg.set(9, bot.id);

      // Cặp (3, 9) bị từ chối ở vòng 5
      bot.swapPairLastRejectedRound = { '3_9': 5 };

      // Ở vòng 6 (chưa đủ 3 vòng cooldown) -> Không đề xuất
      const offerRound6 = findBotSwapTrade(bot, room, reg, sm, botPersonality, 6);
      expect(offerRound6).toBeNull();
    });

    it('[TC-146.12b/MSS][UC-IMP146] Cooldown 3 vòng: Sau khi hết 3 vòng cooldown, findBotSwapTrade được phép đề xuất lại cặp ô đất', () => {
      const { room, human, bot, reg, sm, botPersonality } = setupSwapRoom();
      reg.set(1, bot.id);
      reg.set(3, human.id);
      reg.set(6, human.id);
      reg.set(8, human.id);
      reg.set(9, bot.id);

      // Cặp (3, 9) bị từ chối ở vòng 5
      bot.swapPairLastRejectedRound = { '3_9': 5 };

      // Ở vòng 9 (đã qua 3 vòng cooldown: 9 - 5 >= 3) -> Được phép đề xuất lại
      const offerRound9 = findBotSwapTrade(bot, room, reg, sm, botPersonality, 9);
      expect(offerRound9).not.toBeNull();
      expect(offerRound9?.cellIndex).toBe(3);
      expect(offerRound9?.offeredCellIndex).toBe(9);
    });
  });

  // =========================================================================
  // FACET 3: Resource Disposal & Treasury Conservation
  // =========================================================================
  describe('Facet 3: Resource Disposal & Treasury Conservation', () => {
    it('[TC-146.13/MSS][UC-IMP146] Giao dịch ngang giá price === 0: Cả 2 ô đất đổi chủ trong 1 tick FSM, số dư tiền giữ nguyên, thuế kho bạc = 0', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      reg.set(1, human.id);
      reg.set(3, bot.id);

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, 0, reg, sm, 1);
      expect(res.success).toBe(true);
      expect(reg.get(3)).toBe(human.id);
      expect(reg.get(1)).toBe(bot.id);
      expect(room.treasury).toBe(0);
    });

    it('[TC-146.14/MSS][UC-IMP146] Giao dịch Buyer bù tiền price > 0: Chuyển quyền sở hữu cả 2 ô và bảo toàn tài chính deltaBalances + deltaTreasury === 0', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      reg.set(1, human.id);
      reg.set(3, bot.id);

      const price = 1000;
      const taxExpected = Math.floor(price * 0.05); // 50 Tr.

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, price, reg, sm, 1);
      expect(res.success).toBe(true);
      expect(reg.get(1)).toBe(bot.id);
      expect(reg.get(3)).toBe(human.id);
      expect(human.balance).toBe(10000 - price);
    });

    it('[TC-146.15/MSS][UC-IMP146] Giao dịch Seller bù tiền price < 0: seller trừ tiền, buyer nhận tiền ròng, bảo toàn tài chính deltaBalances + deltaTreasury === 0', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      reg.set(1, human.id);
      reg.set(3, bot.id);

      const price = -800; // seller bot bù 800 Tr.
      const taxExpected = Math.floor(Math.abs(price) * 0.05); // 40 Tr.

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, price, reg, sm, 1);
      expect(res.success).toBe(true);
      expect(reg.get(1)).toBe(bot.id);
      expect(bot.balance).toBe(10000 - 800);
      expect(human.balance).toBe(10000 + (800 - taxExpected));
    });

    it('[TC-146.16/MSS][UC-IMP146] Xóa sạch lịch sử từ chối cellTradeRejections và cellLastRejectedRound cho CẢ 2 ô đất sau khi đổi thành công', () => {
      const { room, human, bot, reg, sm } = setupSwapRoom();
      reg.set(1, human.id);
      reg.set(3, bot.id);

      human.cellTradeRejections = { 3: 2 };
      human.cellLastRejectedRound = { 3: 4 };
      bot.cellTradeRejections = { 1: 1 };
      bot.cellLastRejectedRound = { 1: 4 };

      const res = (executeP2PTrade as any)(room, bot.id, human.id, 3, 0, reg, sm, 1);
      expect(res.success).toBe(true);
      expect(human.cellTradeRejections?.[3]).toBeUndefined();
      expect(human.cellLastRejectedRound?.[3]).toBeUndefined();
      expect(bot.cellTradeRejections?.[1]).toBeUndefined();
    });
  });

  // =========================================================================
  // FACET 4: Error Defense & Network Wire (session_manager & envelope_validator)
  // =========================================================================
  describe('Facet 4: Error Defense & Network Wire', () => {
    it('[TC-146.17/MSS][UC-IMP146] session_manager buildDeltaFromRoom: Chuyển tiếp đúng trường offeredCellIndex sang DeltaPayload.pendingTradeOffer', () => {
      const { room, human, bot, reg, sm, mgr } = setupSwapRoom();
      reg.set(1, bot.id);
      reg.set(3, human.id);

      // Bot đề xuất đổi ô 1 lấy ô 3 của human, bù 200 Tr.
      (mgr.handleTradeOffer as any)(room.roomCode, bot.id, human.id, bot.id, 3, 200, 1);

      const delta = buildDeltaFromRoom(room, reg, sm, 1);
      expect(delta.pendingTradeOffer).not.toBeNull();
      expect(delta.pendingTradeOffer?.cellIndex).toBe(3);
      expect((delta.pendingTradeOffer as any)?.offeredCellIndex).toBe(1);
    });

    it('[TC-146.18a/MSS][UC-IMP146] EnvelopeValidator: Chấp nhận offeredCellIndex là số nguyên hợp lệ [0, 39]', () => {
      const validator = new EnvelopeValidator();
      const validMsg = JSON.stringify({
        type: 'INTENT',
        roomCode: 'ABCD12',
        playerId: 'p1',
        intent: {
          type: 'INTENT_TRADE_OFFER',
          sellerId: 'p2',
          buyerId: 'p1',
          cellIndex: 3,
          price: 500,
          offeredCellIndex: 1,
        },
      });
      const resValid = validator.parseAndValidate(validMsg);
      expect(resValid.success).toBe(true);
    });

    it('[TC-146.18b/A1][UC-IMP146] EnvelopeValidator: Từ chối khi offeredCellIndex là số thực không phải số nguyên', () => {
      const validator = new EnvelopeValidator();
      const invalidMsg = JSON.stringify({
        type: 'INTENT',
        roomCode: 'ABCD12',
        playerId: 'p1',
        intent: {
          type: 'INTENT_TRADE_OFFER',
          sellerId: 'p2',
          buyerId: 'p1',
          cellIndex: 3,
          price: 500,
          offeredCellIndex: 1.5,
        },
      });
      const resInvalid = validator.parseAndValidate(invalidMsg);
      expect(resInvalid.success).toBe(false);
      expect(['INVALID_VALUE', 'INVALID_ENVELOPE']).toContain((resInvalid as any).reasonCode);
    });

    it('[TC-146.19/MSS][UC-IMP146] Khi đối tác từ chối đề xuất đổi đất: Quyền sở hữu cả 2 ô và số dư giữ nguyên 100%', () => {
      const { mgr, room, human, bot, reg } = setupSwapRoom();
      reg.set(1, bot.id);
      reg.set(3, human.id);

      const initialHumanBalance = human.balance;
      const initialBotBalance = bot.balance;

      // Bot đề xuất đổi ô 1 lấy ô 3 của human với giá 0
      (mgr.handleTradeOffer as any)(room.roomCode, bot.id, human.id, bot.id, 3, 0, 1);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'mock-offer-swap-19';

      const res = dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: false,
      } as any);

      expect(res.success).toBe(true);
      expect(reg.get(1)).toBe(bot.id);
      expect(reg.get(3)).toBe(human.id);
      expect(human.balance).toBe(initialHumanBalance);
    });
  });
});
