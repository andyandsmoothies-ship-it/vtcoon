// [UC-BOT-05/MSS][IMP-120/MSS] Dynamic Posture, 2D6 Ambush Upgrades & Anti-Leader Parity Contract Tests
import { describe, it, expect } from 'vitest';
import { Player, Room, TurnPhase } from '../../src/domain/room.js';
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config.js';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_data.js';
import { BotPersonality, BotPosture } from '../../src/domain/bot/bot_types.js';
import {
  evaluatePlayerNetWorth,
  evaluateBotPosture,
  calculateAmbushScore,
  isLeadingPlayer,
  findEligibleProactiveMortgage,
} from '../../src/domain/bot/bot_posture.js';
import { evaluateBotTradeAcceptance } from '../../src/domain/bot/bot_trade.js';
import { decideAuctionPhaseIntent } from '../../src/domain/bot/bot_auction.js';
import { decideBotIntent } from '../../src/domain/bot/bot_engine.js';

function createMockPlayer(id: string, balance: number, position = 0, isBot = true): Player {
  return {
    id,
    balance,
    position,
    isBot,
    bankrupt: false,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
  };
}

function createMockRoom(): Room {
  return {
    roomCode: 'IMP120',
    phase: TurnPhase.ActionPhase,
    roundCount: 15,
    round: 15,
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

describe('[IMP-120][Trạm 1] Dynamic Context Adaptation & Anti-Leader Difficulty Tests', () => {
  const cellBrown1 = 1; // Đồ Sơn (600 Tr.)
  const cellBrown2 = 3; // Cát Bà (600 Tr.)

  // ----------------------------------------------------------------------------------
  // FACET 1: Boundary & Thresholds — Net Worth & Bot Posture Evaluation
  // ----------------------------------------------------------------------------------
  describe('Facet 1: Net Worth & Bot Posture Classification', () => {
    it('[UC-IMP120/MSS-01] evaluatePlayerNetWorth tính đúng tổng tiền mặt + giá trị đất + nhà C1..C3', () => {
      const p1 = createMockPlayer('p1', 5000);
      const registry: PropertyRegistry = new Map([
        [1, 'p1'], // Đồ Sơn 600 Tr.
        [3, 'p1'], // Cát Bà 600 Tr.
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 2 }], // 2 nhà C2 (houseCost = 500 x 2 = 1000 Tr.)
        [3, { level: 0 }],
      ]);

      // Tổng Net Worth = 5000 (tiền mặt) + 1500 (đất 1 C2 x2.5) + 600 (đất 3 C0 x1.0) = 7100 Tr.
      const nw = evaluatePlayerNetWorth('p1', [p1], registry, stateMap);
      expect(nw).toBe(7100);
    });

    it('[UC-IMP120/MSS-02] evaluateBotPosture trả về BotPosture.Leading khi vượt trội tài sản >= 1.25x', () => {
      const bot = createMockPlayer('bot_1', 15000);
      const opp1 = createMockPlayer('opp_1', 8000);
      const opp2 = createMockPlayer('opp_2', 7000);
      const room = createMockRoom();
      room.players = [bot, opp1, opp2];
      const registry: PropertyRegistry = new Map();
      const stateMap: PropertyStateMap = new Map();

      const posture = evaluateBotPosture('bot_1', room.players, registry, stateMap, 10);
      expect(posture).toBe(BotPosture.Leading);
    });

    it('[UC-IMP120/MSS-03] evaluateBotPosture trả về BotPosture.Trailing khi thua top 1 quá 1.4x ở vòng 15+', () => {
      const leader = createMockPlayer('leader', 25000);
      const bot = createMockPlayer('bot_trailing', 6000);
      const room = createMockRoom();
      room.players = [leader, bot];
      const registry: PropertyRegistry = new Map();
      const stateMap: PropertyStateMap = new Map();

      const posture = evaluateBotPosture('bot_trailing', room.players, registry, stateMap, 20);
      expect(posture).toBe(BotPosture.Trailing);
    });

    it('[UC-IMP120/MSS-04] evaluateBotPosture trả về BotPosture.Parity khi các bên chênh lệch sít sao', () => {
      const p1 = createMockPlayer('p1', 10000);
      const p2 = createMockPlayer('p2', 9500);
      const room = createMockRoom();
      room.players = [p1, p2];
      const registry: PropertyRegistry = new Map();
      const stateMap: PropertyStateMap = new Map();

      const posture = evaluateBotPosture('p1', room.players, registry, stateMap, 10);
      expect(posture).toBe(BotPosture.Parity);
    });
  });

  // ----------------------------------------------------------------------------------
  // FACET 2: State Reactivity — Targeted 2D6 Ambush Upgrades (Bẫy Đón Đầu)
  // ----------------------------------------------------------------------------------
  describe('Facet 2: Targeted 2D6 Ambush Upgrades', () => {
    it('[UC-IMP120/MSS-05] calculateAmbushScore trả về điểm cao khi có đối thủ cách ô đất 5..9 bước', () => {
      // Đối thủ đứng tại ô 34. Ô đất tại ô 1 (cách 7 bước: (1 - 34 + 40) % 40 = 7). Bước 7 có xác suất cao nhất (6/36)
      const opponent = createMockPlayer('opp_target', 10000, 34, false);
      const room = createMockRoom();
      room.players = [opponent];

      const score = calculateAmbushScore(1, room.players, 'my_bot_id');
      expect(score).toBeGreaterThan(0.15); // Xác suất 6/36 = ~0.166
    });

    it('[UC-IMP120/MSS-06] calculateAmbushScore trả về 0 khi không có đối thủ nào trong tầm 2..12 bước', () => {
      // Đối thủ đứng tại ô 20. Ô đất tại ô 1 (khoảng cách 21 bước)
      const opponent = createMockPlayer('opp_far', 10000, 20, false);
      const room = createMockRoom();
      room.players = [opponent];

      const score = calculateAmbushScore(1, room.players, 'my_bot_id');
      expect(score).toBe(0);
    });

    it('[UC-IMP120/MSS-07] Bot ưu tiên nâng cấp ô đất có Ambush Score cao nhất thay vì theo số ID', () => {
      // Bot sở hữu cả Ô 1 (Đồ Sơn) và Ô 39 (Tràng Tiền)
      // Đối thủ đứng tại ô 32 (cách Ô 39 đúng 7 bước!). Ô 1 cách 9 bước.
      // Bot sẽ ưu tiên dồn tiền nâng cấp Ô 39 đón đầu
      const bot = createMockPlayer('bot_ambush', 20000, 0, true);
      const human = createMockPlayer('human_p1', 15000, 32, false); // Human 7 bước tới Ô 39
      const room = createMockRoom();
      room.phase = TurnPhase.PropertyManagement;
      room.players = [bot, human];

      const registry: PropertyRegistry = new Map([
        [1, bot.id], [3, bot.id], // Bộ Nâu
        [37, bot.id], [39, bot.id], // Bộ Xanh Đậm
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 0 }], [3, { level: 0 }],
        [37, { level: 0 }], [39, { level: 0 }],
      ]);

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.0,
      });

      expect(intent?.type).toBe('INTENT_UPGRADE');
      // Phải chọn Ô 39 hoặc Ô 37 (nhóm Xanh Đậm mà Human sắp dẫm vào) thay vì Ô 1 (Nâu)
      expect([37, 39]).toContain(intent?.cellIndex);
    });

    it('[UC-IMP120/MSS-08] calculateAmbushScore nhân hệ số ưu tiên 1.5x khi đối thủ đang tiến tới là Người chơi thật', () => {
      const botOpp = createMockPlayer('bot_opp', 10000, 34, true);
      const humanOpp = createMockPlayer('human_opp', 10000, 34, false); // Người chơi thật
      const roomBot = createMockRoom();
      roomBot.players = [botOpp];
      const roomHuman = createMockRoom();
      roomHuman.players = [humanOpp];

      const scoreBot = calculateAmbushScore(1, roomBot.players, 'my_bot_id');
      const scoreHuman = calculateAmbushScore(1, roomHuman.players, 'my_bot_id');

      expect(scoreHuman).toBeGreaterThan(scoreBot);
    });
  });

  // ----------------------------------------------------------------------------------
  // FACET 3: Anti-Leader Embargo & Inter-Bot Parity Trading
  // ----------------------------------------------------------------------------------
  describe('Facet 3: Anti-Leader Embargo & Inter-Bot Alliance', () => {
    it('[UC-IMP120/MSS-09] Bot kiên quyết TỪ CHỐI bán đất khi bên mua là Kẻ Dẫn Đầu áp đảo (EMBARGO_LEADER)', () => {
      const sellerBot = createMockPlayer('bot_seller', 4000, 0, true);
      const leaderBuyer = createMockPlayer('p1_leader', 30000, 0, false); // Kẻ thống trị
      const room = createMockRoom();
      room.players = [sellerBot, leaderBuyer];
      const registry: PropertyRegistry = new Map([[1, 'bot_seller']]);
      const stateMap: PropertyStateMap = new Map();

      const decision = evaluateBotTradeAcceptance(
        1,
        2000, // Giá cực hời (gấp 3.3x)
        sellerBot,
        leaderBuyer,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
      );

      // Cấm vận thương mại chống Kẻ Thống Trị
      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('EMBARGO_LEADER');
    });

    it('[UC-IMP120/MSS-10] isLeadingPlayer nhận diện chuẩn xác người chơi có Net Worth top 1 và vượt trội', () => {
      const pLeader = createMockPlayer('p_lead', 20000);
      const pTail = createMockPlayer('p_tail', 6000);
      const room = createMockRoom();
      room.players = [pLeader, pTail];
      const registry: PropertyRegistry = new Map();
      const stateMap: PropertyStateMap = new Map();

      expect(isLeadingPlayer('p_lead', room.players, registry, stateMap)).toBe(true);
      expect(isLeadingPlayer('p_tail', room.players, registry, stateMap)).toBe(false);
    });

    it('[UC-IMP120/MSS-11] Giữa 2 Bot yếu thế (Trailing): chấp thuận nhượng đất lẻ ở mức giá hợp tác 1.45x', () => {
      const b1 = createMockPlayer('bot_1', 4000, 0, true);
      const b2 = createMockPlayer('bot_2', 4500, 0, true);
      const leader = createMockPlayer('human_lead', 25000, 0, false);
      const room = createMockRoom();
      room.players = [b1, b2, leader];
      const registry: PropertyRegistry = new Map([[1, 'bot_1']]);
      const stateMap: PropertyStateMap = new Map();

      const basePrice = PROPERTY_DEEDS.get(1)?.price ?? 600;
      const decision = evaluateBotTradeAcceptance(
        1,
        Math.round(basePrice * 1.45),
        b1,
        b2,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
      );

      expect(decision.accept).toBe(true);
    });
  });

  // ----------------------------------------------------------------------------------
  // FACET 4: Resource Disposal & Proactive Leveraged Mortgage
  // ----------------------------------------------------------------------------------
  describe('Facet 4: Leveraged Building & Proactive Mortgaging', () => {
    it('[UC-IMP120/MSS-12] findEligibleProactiveMortgage tìm ra ô C0 lẻ vô dụng khi Bot thiếu tiền nâng cấp ô độc quyền', () => {
      // Bot sở hữu bộ màu Nâu (ô 1, 3). Cần 500 Tr. để nâng cấp C1, nhưng thiếu 300 Tr. tiền mặt.
      // Bot sở hữu ô 6 (Hàng Đào - Xanh Nhạt), nhưng đối thủ đã sở hữu ô 8 và 9 (không bao giờ hoàn thành bộ Xanh Nhạt).
      // Bot sẽ chủ động thế chấp ô 6 để lấy 500 Tr. tiền mặt!
      const bot = createMockPlayer('bot_leveraged', 400, 20, true);
      const opp = createMockPlayer('opp', 10000, 0, false);
      const room = createMockRoom();
      room.players = [bot, opp];

      const registry: PropertyRegistry = new Map([
        [1, bot.id], [3, bot.id], // Bộ Nâu của Bot
        [6, bot.id], // Ô lẻ của Bot
        [8, opp.id], [9, opp.id], // Đối thủ giữ hết phần còn lại của nhóm Xanh Nhạt
      ]);
      const stateMap: PropertyStateMap = new Map([
        [1, { level: 0 }], [3, { level: 0 }],
        [6, { level: 0 }],
      ]);

      const mortgageCell = findEligibleProactiveMortgage(bot, room, registry, stateMap);
      expect(mortgageCell).toBe(6);
    });

    it('[UC-IMP120/MSS-13] findEligibleProactiveMortgage KHÔNG bao giờ thế chấp ô đất thuộc bộ màu tiềm năng của mình', () => {
      const bot = createMockPlayer('bot_save', 400, 20, true);
      const room = createMockRoom();
      room.players = [bot];

      const registry: PropertyRegistry = new Map([
        [1, bot.id], [3, bot.id], // Ô 1 và 3 là bộ Nâu độc quyền!
      ]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 0 }], [3, { level: 0 }]]);

      const mortgageCell = findEligibleProactiveMortgage(bot, room, registry, stateMap);
      expect(mortgageCell).toBeNull();
    });

    it('[UC-IMP120/MSS-14] Bot Passive khi ở vị thế Trailing hoặc Vòng 20+: hạ rào cản xây nhà xuống 1.8x buffer', () => {
      // Bot có 2.500 Tr. Chi phí xây 500 Tr. Safety buffer là 600 Tr.
      // Điều kiện Trailing: bot.balance - upgradeCost >= safetyBuffer * 1.8 (2000 >= 1080 -> ĐẠT!)
      const bot = createMockPlayer('bot_passive_trailing', 2500, 20, true);
      const leader = createMockPlayer('leader', 20000, 0, false);
      const room = createMockRoom();
      room.roundCount = 22;
      room.round = 22;
      room.phase = TurnPhase.PropertyManagement;
      room.players = [bot, leader];

      const registry: PropertyRegistry = new Map([[1, bot.id], [3, bot.id]]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 0 }], [3, { level: 0 }]]);

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Passive,
        balanceThresholdMultiplier: 1.0,
      });

      expect(intent?.type).toBe('INTENT_UPGRADE');
    });
  });

  // ----------------------------------------------------------------------------------
  // FACET 5: Auction Strategic Price Driving
  // ----------------------------------------------------------------------------------
  describe('Facet 5: Auction Strategic Price Driving Against Opponents', () => {
    it('[UC-IMP120/MSS-15] Bot chủ động đặt giá ép Người chơi khi ô đấu giá là mảnh ghép độc quyền của Người chơi', () => {
      // Người chơi sở hữu ô 1 (Đồ Sơn). Ô 3 (Cát Bà) bị đấu giá.
      // Bot có tiền mặt và nhận diện Người chơi sắp hoàn thành độc quyền Nâu.
      // Bot không Pass sớm mà tiếp tục đặt giá nâng bước để bòn rút tiền của Người chơi.
      const bot = createMockPlayer('bot_bidder', 12000, 0, true);
      const human = createMockPlayer('human_p1', 15000, 0, false);
      const room = createMockRoom();
      room.players = [bot, human];
      room.currentAuction = {
        cellIndex: 3,
        declinedPlayerId: 'p_declined',
        highestBid: 500, // Giá niêm yết 600 Tr.
        highestBidderId: 'human_p1',
        highestBidder: 'human_p1',
        bidIncrement: 50,
      };

      const registry: PropertyRegistry = new Map([[1, 'human_p1']]);
      const stateMap: PropertyStateMap = new Map();

      const intent = decideAuctionPhaseIntent(
        bot,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
        room.currentAuction,
      );

      // Bot không được Pass, phải Bid để ép giá
      expect(intent.type).toBe('INTENT_BID');
    });

    it('[UC-IMP120/MSS-16] Bot dừng ép giá và Pass khi giá đấu vượt quá 1.40x giá niêm yết', () => {
      const bot = createMockPlayer('bot_bidder', 12000, 0, true);
      const human = createMockPlayer('human_p1', 15000, 0, false);
      const room = createMockRoom();
      room.players = [bot, human];
      room.currentAuction = {
        cellIndex: 3,
        declinedPlayerId: 'p_declined',
        highestBid: 900, // Giá gốc 600 Tr. ➔ 900 là 1.50x
        highestBidderId: 'human_p1',
        highestBidder: 'human_p1',
        bidIncrement: 50,
      };

      const registry: PropertyRegistry = new Map([[1, 'human_p1']]);
      const stateMap: PropertyStateMap = new Map();

      const intent = decideAuctionPhaseIntent(
        bot,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
        room.currentAuction,
      );

      // Dừng lại để Người chơi phải trả giá đắt, không bị gậy ông đập lưng ông
      expect(intent.type).toBe('INTENT_AUCTION_PASS');
    });
  });
});
