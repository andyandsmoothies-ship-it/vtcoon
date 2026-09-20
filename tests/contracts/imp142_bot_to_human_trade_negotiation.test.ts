// [CONTRACT TEST] IMP-142: Bot-to-Human P2P Trade Negotiation & 15s Dilemma Modal
// Universal 4-Facet Behavioral Matrix & Adversarial Inversion Verification
// Traceability Tags: [TC-142.01..24] & [UC-IMP142]
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher.js';
import { TurnPhase, type Player } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import {
  findMonopolyGap,
  calculateTradeOfferPrice,
} from '../../src/domain/bot/bot_trade.js';
import { buildDeltaFromRoom } from '../../src/server/session_manager.js';

export interface PendingTradeSession {
  readonly offerId: string;
  readonly roomCode: string;
  readonly buyerId: string;
  readonly sellerId: string;
  readonly cellIndex: number;
  readonly price: number;
  readonly basePrice: number;
  readonly createdAt: number;
  readonly expiresAt: number;
}

function setupNegotiationRoom(opts?: {
  botPersonality?: BotPersonality;
  botBalance?: number;
  humanBalance?: number;
  roundCount?: number;
}) {
  const mgr = new RoomManager(14201);
  const room = mgr.createRoom('human_p1');
  const botPersonality = opts?.botPersonality ?? BotPersonality.Aggressive;
  mgr.addBot(room.roomCode, 'bot_trader', botPersonality);
  mgr.startGame(room.roomCode);

  room.roundCount = opts?.roundCount ?? 5;
  room.phase = TurnPhase.PropertyManagement;

  const human = room.players.find((p) => p.id === 'human_p1')!;
  const bot = room.players.find((p) => p.id === 'bot_trader')!;
  human.isBot = false;
  human.balance = opts?.humanBalance ?? 10_000;
  bot.isBot = true;
  bot.balance = opts?.botBalance ?? 12_000;

  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;

  // Cấu hình Monopoly Gap cho nhóm màu Nâu (Brown):
  // Bot sở hữu ô 1 (Hà Nội Cổ), Human sở hữu ô 3 (Phố Cổ)
  reg.set(1, bot.id);
  sm.set(1, { level: 0, isMortgaged: false });
  reg.set(3, human.id);
  sm.set(3, { level: 0, isMortgaged: false });

  return { mgr, room, human, bot, reg, sm };
}

describe('[TC-142][UC-IMP142] Bot-to-Human Trade Negotiation & 15s Modal Contract Suite', () => {
  // =========================================================================
  // FACET 1: Boundary & Khởi tạo (Initiation & Zero Premature Trade)
  // =========================================================================
  describe('Facet 1: Boundary & Khởi tạo (Initiation & Zero Premature Trade)', () => {
    it('[TC-142.01/MSS][UC-IMP142] Bot đề xuất mua Monopoly Gap của Human: Server tạo PendingTradeSession với thời hạn 15s', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      const res = mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      expect(res.success).toBe(true);

      const hasPending = (mgr as any).hasPendingTrade?.(room.roomCode);
      expect(hasPending).toBe(true);

      const session: PendingTradeSession | undefined = (mgr as any).getPendingTrade?.(room.roomCode);
      expect(session?.offerId).toBeDefined();
      expect(session?.expiresAt).toBeGreaterThan(Date.now());
    });

    it('[TC-142.02/MSS][UC-IMP142] Zero Premature Trade: Không chuyển nhượng quyền sở hữu ô đất khi vừa tạo đề xuất đàm phán', () => {
      const { mgr, room, human, bot, reg } = setupNegotiationRoom();
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);

      // Ô đất số 3 phải vẫn thuộc về Human, chưa được chuyển quyền sang Bot
      expect(reg.get(3)).toBe(human.id);
    });

    it('[TC-142.03/MSS][UC-IMP142] Zero Premature Trade: Không trừ tiền Bot và không cộng tiền Human khi chưa có phản hồi', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      const initialBotBalance = bot.balance;
      const initialHumanBalance = human.balance;

      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);

      expect(bot.balance).toBe(initialBotBalance);
      expect(human.balance).toBe(initialHumanBalance);
    });

    it('[TC-142.04/MSS][UC-IMP142] Giao dịch Bot-to-Bot vẫn diễn ra đồng bộ tức thì 0ms (giữ nguyên tương thích IMP-82, IMP-118)', () => {
      const { mgr, room, reg, sm } = setupNegotiationRoom();
      mgr.addBot(room.roomCode, 'bot_seller', BotPersonality.Passive);
      const botSeller = room.players.find((p) => p.id === 'bot_seller')!;
      reg.set(3, botSeller.id);
      sm.set(3, { level: 0, isMortgaged: false });

      const res = mgr.handleTradeOffer(room.roomCode, 'bot_trader', 'bot_seller', 'bot_trader', 3, 960);
      expect(res.success).toBe(true);
      expect(reg.get(3)).toBe('bot_trader');
      expect((mgr as any).hasPendingTrade?.(room.roomCode) ?? false).toBe(false);
    });

    it('[TC-142.05/MSS][UC-IMP142] Giá chào mua tuân thủ đúng công thức tính cách (Aggressive 1.75x, Balanced 1.55x, Passive 1.60x)', () => {
      const botMock: Player = { id: 'bot_calc', balance: 15_000 } as any;
      const aggrPrice = calculateTradeOfferPrice(3, botMock, BotPersonality.Aggressive, undefined, 6, true, 2);
      const balPrice = calculateTradeOfferPrice(3, botMock, BotPersonality.Balanced, undefined, 6, true, 2);
      const passPrice = calculateTradeOfferPrice(3, botMock, BotPersonality.Passive, undefined, 6, true, 2);

      expect(aggrPrice).toBe(Math.round(600 * 1.75));
      expect(balPrice).toBe(Math.round(600 * 1.55));
      expect(passPrice).toBe(Math.round(600 * 1.60));
    });

    it('[TC-142.06/A1][UC-IMP142] Bot không chào mua nếu số dư sau mua < safetyBuffer (1.000 Tr. VNĐ)', () => {
      const poorBot: Player = { id: 'poor_bot', balance: 1500 } as any;
      const price = calculateTradeOfferPrice(3, poorBot, BotPersonality.Aggressive, undefined, 6, true, 2);
      expect(price).toBeNull();
    });

    it('[TC-142.07/A2][UC-IMP142] Bot không chào mua nếu ô đất mục tiêu đã có công trình (level > 0)', () => {
      const { room, bot, reg, sm } = setupNegotiationRoom();
      sm.set(3, { level: 1, isMortgaged: false });
      const gap = findMonopolyGap(bot, room, reg, sm);
      expect(gap).toBeNull();
    });

    it('[TC-142.08/A3][UC-IMP142] Bot không chào mua nếu ô đất mục tiêu đang bị thế chấp', () => {
      const { room, bot, reg, sm } = setupNegotiationRoom();
      sm.set(3, { level: 0, isMortgaged: true });
      const gap = findMonopolyGap(bot, room, reg, sm);
      expect(gap).toBeNull();
    });
  });

  // =========================================================================
  // FACET 2: Reactivity & Phản hồi đàm phán (Decision Handling & Atomic Execution)
  // =========================================================================
  describe('Facet 2: Reactivity & Phản hồi đàm phán (Decision Handling & Atomic Execution)', () => {
    it('[TC-142.09/MSS][UC-IMP142] Human gửi INTENT_RESPOND_TRADE_OFFER với accept: true: Chuyển quyền sở hữu cho Bot', () => {
      const { mgr, room, human, bot, reg } = setupNegotiationRoom();
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-1';

      const res = dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: true,
      } as any);

      expect(res.success).toBe(true);
      expect(reg.get(3)).toBe(bot.id);
    });

    it('[TC-142.10/MSS][UC-IMP142] Human gửi INTENT_RESPOND_TRADE_OFFER với accept: true: Trừ tiền Bot, cộng tiền Human (trừ 5% thuế vào Kho bạc)', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      const initialBotBalance = bot.balance;
      const initialHumanBalance = human.balance;
      const initialTreasury = room.treasury ?? 0;
      const price = 1050;
      const tax = Math.round(price * 0.05);
      const netReceived = price - tax;

      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, price);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-2';

      dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: true,
      } as any);

      expect(bot.balance).toBe(initialBotBalance - price);
      expect(human.balance).toBe(initialHumanBalance + netReceived);
      expect(room.treasury).toBe(initialTreasury + tax);
    });

    it('[TC-142.11/MSS][UC-IMP142] Human gửi INTENT_RESPOND_TRADE_OFFER với accept: true: Xóa PendingTradeSession và cập nhật cooldown cho Bot', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-3';

      dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: true,
      } as any);

      expect((mgr as any).hasPendingTrade?.(room.roomCode) ?? false).toBe(false);
      expect(bot.lastTradeOfferRound).toBe(room.roundCount);
    });

    it('[TC-142.12/MSS][UC-IMP142] Human gửi INTENT_RESPOND_TRADE_OFFER với accept: false: Không chuyển nhượng quyền sở hữu ô đất', () => {
      const { mgr, room, human, bot, reg } = setupNegotiationRoom();
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-4';

      const res = dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: false,
      } as any);

      expect(res.success).toBe(true);
      expect(reg.get(3)).toBe(human.id);
    });

    it('[TC-142.13/MSS][UC-IMP142] Human gửi INTENT_RESPOND_TRADE_OFFER với accept: false: Không thay đổi số dư Bot, Human hay Kho bạc', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      const initialBotBal = bot.balance;
      const initialHumanBal = human.balance;
      const initialTreasury = room.treasury ?? 0;

      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-5';

      dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: false,
      } as any);

      expect(bot.balance).toBe(initialBotBal);
      expect(human.balance).toBe(initialHumanBal);
      expect(room.treasury).toBe(initialTreasury);
    });

    it('[TC-142.14/MSS][UC-IMP142] Human gửi INTENT_RESPOND_TRADE_OFFER với accept: false: Xóa PendingTradeSession và Bot nhận cooldown', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-6';

      dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: false,
      } as any);

      expect((mgr as any).hasPendingTrade?.(room.roomCode) ?? false).toBe(false);
      expect(bot.lastTradeOfferRound).toBe(room.roundCount);
    });

    it('[TC-142.15/MSS][UC-IMP142] Delta phát sóng: pendingTradeOffer được đồng bộ khi có session và làm sạch khi kết thúc', () => {
      const { mgr, room, human, bot, reg, sm } = setupNegotiationRoom();
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);

      const deltaActive = buildDeltaFromRoom(room, reg, sm, 1);
      expect((deltaActive as any).pendingTradeOffer?.cellIndex).toBe(3);
      expect((deltaActive as any).pendingTradeOffer?.price).toBe(1050);

      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-7';
      dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: false,
      } as any);

      const deltaCleared = buildDeltaFromRoom(room, reg, sm, 2);
      expect((deltaCleared as any).pendingTradeOffer).toBeFalsy();
    });
  });

  // =========================================================================
  // FACET 3: Disposal & Chống treo ván đấu (Anti-Stall & Disconnect Resilience)
  // =========================================================================
  describe('Facet 3: Disposal & Chống treo ván đấu (Anti-Stall & Disconnect Resilience)', () => {
    it('[TC-142.16/MSS][UC-IMP142] Hết 15 giây không phản hồi: Server tự động kích hoạt AUTO_REJECT_TIMEOUT và dọn dẹp pending trade', () => {
      const { mgr, room, human, bot, reg } = setupNegotiationRoom();
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);

      const expiredTime = Date.now() + 16_000;
      const timeoutRes = (mgr as any).checkPendingTradeTimeout?.(room.roomCode, expiredTime);

      expect((mgr as any).hasPendingTrade?.(room.roomCode) ?? false).toBe(false);
      expect(reg.get(3)).toBe(human.id);
      expect(timeoutRes?.timeout).toBe(true);
    });

    it('[TC-142.17/MSS][UC-IMP142] Sau AUTO_REJECT_TIMEOUT: Vòng lặp Bot được giải phóng và tiếp tục lượt đi bình thường', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      room.currentPlayerIndex = room.players.findIndex((p) => p.id === bot.id);
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);

      // Kích hoạt timeout 15s
      (mgr as any).checkPendingTradeTimeout?.(room.roomCode, Date.now() + 16_000);

      // Bot có thể tiếp tục hành động (không bị kẹt vì pending trade)
      const stepped = mgr.stepBotTurn(room.roomCode);
      expect((mgr as any).hasPendingTrade?.(room.roomCode) ?? false).toBe(false);
      expect(stepped).toBeDefined();
    });

    it('[TC-142.18/A4][UC-IMP142] Người chơi ngắt kết nối (disconnect) khi đang có pending offer: Server tự động hủy offer', () => {
      const { mgr, room, human, bot, reg } = setupNegotiationRoom();
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      expect((mgr as any).hasPendingTrade?.(room.roomCode)).toBe(true);

      // Server nhận tín hiệu người chơi ngắt kết nối
      (mgr as any).cancelPendingTrade?.(room.roomCode, human.id);

      expect((mgr as any).hasPendingTrade?.(room.roomCode) ?? false).toBe(false);
      expect(reg.get(3)).toBe(human.id);
    });

    it('[TC-142.19/A5][UC-IMP142] turn_orchestrator / releaseStuckBotTurn không cưỡng chế đổi lượt Bot khi đang trong 15s chờ Human phản hồi', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      room.currentPlayerIndex = room.players.findIndex((p) => p.id === bot.id);
      const botTurnIndex = room.currentPlayerIndex;

      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);

      // Thử gọi stepBotTurn khi đang có pending trade
      mgr.stepBotTurn(room.roomCode);

      // Lượt chơi vẫn phải thuộc về Bot, không bị cưỡng chế sang người chơi khác
      expect(room.currentPlayerIndex).toBe(botTurnIndex);
    });
  });

  // =========================================================================
  // FACET 4: Error Defense & Bảo toàn tài chính (Treasury Conservation & Attack Invariants)
  // =========================================================================
  describe('Facet 4: Error Defense & Bảo toàn tài chính (Treasury Conservation & Attack Invariants)', () => {
    it('[TC-142.20/A6][UC-IMP142] Người chơi khác không phải người được chào mua cố tình gửi phản hồi -> Bị từ chối (NOT_TARGET_PLAYER / UNAUTHORIZED)', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      mgr.joinRoom(room.roomCode, 'player_intruder');
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-8';

      const res = dispatchPlayerIntent(mgr, room.roomCode, 'player_intruder', {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: true,
      } as any);

      expect(res.success).toBe(false);
      expect(['NOT_TARGET_PLAYER', 'UNAUTHORIZED', 'INVALID_INTENT']).toContain(res.reason);
    });

    it('[TC-142.21/A7][UC-IMP142] Gửi phản hồi với offerId không tồn tại hoặc đã hết hạn -> Bị từ chối (INVALID_OFFER_ID)', () => {
      const { mgr, room, human } = setupNegotiationRoom();

      const res = dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId: 'non-existent-offer-999',
        accept: true,
      } as any);

      expect(res.success).toBe(false);
      expect(['INVALID_OFFER_ID', 'INVALID_INTENT']).toContain(res.reason);
    });

    it('[TC-142.22/A8][UC-IMP142] Gửi phản hồi 2 lần liên tiếp (double click / spam) -> Lần 2 bị từ chối (OFFER_ALREADY_RESOLVED)', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-9';

      const firstRes = dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: true,
      } as any);

      const secondRes = dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: true,
      } as any);

      expect(firstRes.success).toBe(true);
      expect(secondRes.success).toBe(false);
      expect(['OFFER_ALREADY_RESOLVED', 'INVALID_OFFER_ID']).toContain(secondRes.reason);
    });

    it('[TC-142.23/A9][UC-IMP142] Race condition: Nếu số dư Bot sụt giảm trước khi Human đồng ý -> Giao dịch thất bại an toàn, không âm tiền', () => {
      const { mgr, room, human, bot, reg } = setupNegotiationRoom();
      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-10';

      // Bot bị trừ tiền do biến cố bất ngờ
      bot.balance = 500;

      const res = dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: true,
      } as any);

      expect(res.success).toBe(false);
      expect(bot.balance).toBe(500);
      expect(reg.get(3)).toBe(human.id);
    });

    it('[TC-142.24/MSS][UC-IMP142] Định luật bảo toàn tài chính: Tổng ngân tệ phòng chơi (Balances + Treasury) giữ nguyên tuyệt đối trước và sau giao dịch', () => {
      const { mgr, room, human, bot } = setupNegotiationRoom();
      const initialTotal = room.players.reduce((sum, p) => sum + p.balance, 0) + (room.treasury ?? 0);

      mgr.handleTradeOffer(room.roomCode, bot.id, human.id, bot.id, 3, 1050);
      const session = (mgr as any).getPendingTrade?.(room.roomCode);
      const offerId = session?.offerId ?? 'offer-test-11';

      dispatchPlayerIntent(mgr, room.roomCode, human.id, {
        type: 'INTENT_RESPOND_TRADE_OFFER',
        offerId,
        accept: true,
      } as any);

      const finalTotal = room.players.reduce((sum, p) => sum + p.balance, 0) + (room.treasury ?? 0);
      expect(finalTotal).toBe(initialTotal);
    });
  });
});
