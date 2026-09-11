// [UC-BOT-04/MSS][UC-BOT-04/A1][UC-BOT-04/A2][UC-BOT-04/A3][UC-BOT-04/A4]
// Bot Auction & HOSE Integration Tests
import { describe, it, expect } from 'vitest';
import { createPlayer, createRoom, TurnPhase, type CurrentAuctionState } from '../../src/domain/room';
import { decideBotIntent, BotPersonality, type BotConfig } from '../../src/domain/bot/bot_engine';
import { RoomManager } from '../../src/server/room_manager';

describe('Bot Tactical Auction & Adaptive HOSE Investment', () => {
  const baseConfig = (personality: BotPersonality): BotConfig => ({
    personality,
    balanceThresholdMultiplier: personality === BotPersonality.Aggressive ? 1.0 : 1.2,
  });

  describe('[UC-BOT-04/MSS] Bot tham gia đấu giá ô đất có giá trị cao / hoàn thành bộ màu', () => {
    it('Bot Aggressive đặt giá cạnh tranh cho ô đất hoàn thành bộ màu', () => {
      const bot = createPlayer('bot-agg');
      bot.isBot = true;
      bot.balance = 10_000;
      bot.position = 0;

      const room = createRoom('host');
      room.round = 10;
      room.players = [bot];
      room.phase = TurnPhase.AuctionPhase;

      const registry = new Map<number, string>();
      registry.set(1, 'bot-agg'); // Bot đã có ô 1, ô 3 sẽ hoàn thành nhóm màu Nâu
      const stateMap = new Map();

      const auction: CurrentAuctionState = {
        cellIndex: 3,
        declinedPlayerId: 'other-player',
        highestBid: 300,
        startingBid: 300,
      };

      const intent = decideBotIntent(bot, room, registry, stateMap, baseConfig(BotPersonality.Aggressive), auction);

      expect(intent).not.toBeNull();
      expect(intent?.type).toBe('INTENT_BID');
      expect(typeof intent?.amount).toBe('number');
      expect(intent?.amount).toBe(350); // 300 + 50
    });

    it('Bot tiếp tục nâng giá khi giá đấu hiện tại vẫn thấp hơn trần định giá maxBid', () => {
      const bot = createPlayer('bot-agg');
      bot.isBot = true;
      bot.balance = 10_000;
      bot.position = 0;

      const room = createRoom('host');
      room.round = 5;
      room.players = [bot];
      room.phase = TurnPhase.AuctionPhase;

      const registry = new Map<number, string>();
      registry.set(1, 'bot-agg');
      const stateMap = new Map();

      const auction: CurrentAuctionState = {
        cellIndex: 3,
        declinedPlayerId: 'p1',
        highestBid: 500,
        highestBidder: 'p2',
        bidIncrement: 50,
      };

      const intent = decideBotIntent(bot, room, registry, stateMap, baseConfig(BotPersonality.Aggressive), auction);
      expect(intent?.type).toBe('INTENT_BID');
      expect(intent?.amount).toBe(550);
    });
  });

  describe('[UC-BOT-04/A1] Bot dừng đặt giá và rút lui (Pass) khi vượt trần hoặc cạn tiền', () => {
    it('Bot rút lui khi giá đấu vượt trần định giá maxBid', () => {
      const bot = createPlayer('bot-bal');
      bot.isBot = true;
      bot.balance = 10_000;
      bot.position = 0;

      const room = createRoom('host');
      room.round = 25; // Late game: pacing factor thấp (0.7)
      room.players = [bot];
      room.phase = TurnPhase.AuctionPhase;

      const auction: CurrentAuctionState = {
        cellIndex: 3, // Giá gốc 600
        declinedPlayerId: 'p1',
        highestBid: 4_500, // Giá đã bị đẩy quá cao so với giá trị thực
        highestBidder: 'p2',
      };

      const intent = decideBotIntent(bot, room, new Map(), new Map(), baseConfig(BotPersonality.Balanced), auction);
      expect(intent).toEqual({ type: 'INTENT_AUCTION_PASS' });
    });

    it('Bot rút lui khi đệm an toàn bị đe dọa hoặc không đủ tiền mặt', () => {
      const bot = createPlayer('bot-agg');
      bot.isBot = true;
      bot.balance = 300; // Tiền mặt quá ít
      bot.position = 0;

      const room = createRoom('host');
      room.players = [bot];
      room.phase = TurnPhase.AuctionPhase;

      const auction: CurrentAuctionState = {
        cellIndex: 3,
        declinedPlayerId: 'p1',
        highestBid: 400,
      };

      const intent = decideBotIntent(bot, room, new Map(), new Map(), baseConfig(BotPersonality.Aggressive), auction);
      expect(intent).toEqual({ type: 'INTENT_AUCTION_PASS' });
    });
  });

  describe('[UC-BOT-04/A2] Người từ chối mua và người đang dẫn đầu luôn phát INTENT_AUCTION_PASS', () => {
    it('Bot là declinedPlayerId luôn phát INTENT_AUCTION_PASS', () => {
      const bot = createPlayer('bot-declined');
      bot.isBot = true;
      bot.balance = 15_000;

      const room = createRoom('host');
      room.players = [bot];
      room.phase = TurnPhase.AuctionPhase;

      const auction: CurrentAuctionState = {
        cellIndex: 3,
        declinedPlayerId: 'bot-declined',
        highestBid: 300,
      };

      const intent = decideBotIntent(bot, room, new Map(), new Map(), baseConfig(BotPersonality.Aggressive), auction);
      expect(intent).toEqual({ type: 'INTENT_AUCTION_PASS' });
    });

    it('Bot đang là highestBidder không tự đấu giá đè chính mình', () => {
      const bot = createPlayer('bot-highest');
      bot.isBot = true;
      bot.balance = 15_000;

      const room = createRoom('host');
      room.players = [bot];
      room.phase = TurnPhase.AuctionPhase;

      const auction: CurrentAuctionState = {
        cellIndex: 3,
        declinedPlayerId: 'p1',
        highestBid: 400,
        highestBidder: 'bot-highest',
      };

      const intent = decideBotIntent(bot, room, new Map(), new Map(), baseConfig(BotPersonality.Aggressive), auction);
      expect(intent).toEqual({ type: 'INTENT_AUCTION_PASS' });
    });

    it('Bot đã pass trước đó không tham gia đặt giá lại', () => {
      const bot = createPlayer('bot-passed');
      bot.isBot = true;
      bot.balance = 15_000;

      const room = createRoom('host');
      room.players = [bot];
      room.phase = TurnPhase.AuctionPhase;

      const auction: CurrentAuctionState = {
        cellIndex: 3,
        declinedPlayerId: 'p1',
        highestBid: 400,
        passedPlayers: new Set(['bot-passed']),
      };

      const intent = decideBotIntent(bot, room, new Map(), new Map(), baseConfig(BotPersonality.Aggressive), auction);
      expect(intent).toEqual({ type: 'INTENT_AUCTION_PASS' });
    });
  });

  describe('[UC-BOT-04/A3] Đầu tư sàn HOSE linh hoạt theo dòng tiền nhàn rỗi freeCash', () => {
    it('Cược mức tối đa khi freeCash >= 4000', () => {
      const room = createRoom('host');
      room.phase = TurnPhase.HosePhase;

      const makeBot = (id: string, personality: BotPersonality) => {
        const p = createPlayer(id);
        p.isBot = true;
        p.balance = 5_000; // freeCash = 5000 - 300 = 4700 >= 4000
        return p;
      };

      const botAgg = makeBot('bot-agg', BotPersonality.Aggressive);
      const botBal = makeBot('bot-bal', BotPersonality.Balanced);
      const botPas = makeBot('bot-pas', BotPersonality.Passive);

      expect(decideBotIntent(botAgg, room, new Map(), new Map(), baseConfig(BotPersonality.Aggressive))).toEqual({ type: 'INTENT_INVEST', stake: 3000 });
      expect(decideBotIntent(botBal, room, new Map(), new Map(), baseConfig(BotPersonality.Balanced))).toEqual({ type: 'INTENT_INVEST', stake: 2000 });
      expect(decideBotIntent(botPas, room, new Map(), new Map(), baseConfig(BotPersonality.Passive))).toEqual({ type: 'INTENT_INVEST', stake: 1000 });
    });

    it('Cược mức vừa khi 2000 <= freeCash < 4000', () => {
      const room = createRoom('host');
      room.phase = TurnPhase.HosePhase;

      const makeBot = (id: string) => {
        const p = createPlayer(id);
        p.isBot = true;
        p.balance = 2_800; // freeCash = 2800 - 300 = 2500
        return p;
      };

      expect(decideBotIntent(makeBot('1'), room, new Map(), new Map(), baseConfig(BotPersonality.Aggressive))).toEqual({ type: 'INTENT_INVEST', stake: 2000 });
      expect(decideBotIntent(makeBot('2'), room, new Map(), new Map(), baseConfig(BotPersonality.Balanced))).toEqual({ type: 'INTENT_INVEST', stake: 1000 });
      expect(decideBotIntent(makeBot('3'), room, new Map(), new Map(), baseConfig(BotPersonality.Passive))).toEqual({ type: 'INTENT_INVEST', stake: 500 });
    });

    it('Cược mức tối thiểu khi 1000 <= freeCash < 2000', () => {
      const room = createRoom('host');
      room.phase = TurnPhase.HosePhase;

      const makeBot = (id: string) => {
        const p = createPlayer(id);
        p.isBot = true;
        p.balance = 1_500; // freeCash = 1500 - 300 = 1200
        return p;
      };

      expect(decideBotIntent(makeBot('1'), room, new Map(), new Map(), baseConfig(BotPersonality.Aggressive))).toEqual({ type: 'INTENT_INVEST', stake: 1000 });
      expect(decideBotIntent(makeBot('2'), room, new Map(), new Map(), baseConfig(BotPersonality.Balanced))).toEqual({ type: 'INTENT_INVEST', stake: 500 });
      expect(decideBotIntent(makeBot('3'), room, new Map(), new Map(), baseConfig(BotPersonality.Passive))).toEqual({ type: 'INTENT_INVEST', stake: 500 });
    });

    it('Tự động bỏ qua INTENT_SKIP khi freeCash < 1000 để bảo toàn thanh khoản', () => {
      const room = createRoom('host');
      room.phase = TurnPhase.HosePhase;

      const bot = createPlayer('bot-low');
      bot.isBot = true;
      bot.balance = 1_100; // freeCash = 1100 - 300 = 800 < 1000

      expect(decideBotIntent(bot, room, new Map(), new Map(), baseConfig(BotPersonality.Aggressive)))
        .toEqual({ type: 'INTENT_SKIP' });
    });
  });

  describe('[UC-BOT-04/A4] Tích hợp với RoomManager.runBotTurn: Chốt đấu giá thành công', () => {
    it('Bot tham gia đấu giá và chốt mua đất thành công khi đối thủ từ chối', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('human-player');
      mgr.addBot(room.roomCode, 'bot-buyer', BotPersonality.Aggressive);
      mgr.addBot(room.roomCode, 'bot-observer', BotPersonality.Passive);
      mgr.startGame(room.roomCode);

      const human = room.players[0]!;
      human.position = 3; // Ô 03 giá 600
      room.phase = TurnPhase.ActionPhase;

      const declineRes = mgr.handlePlayerIntent(room.roomCode, human.id, { type: 'INTENT_DECLINE' });
      expect(declineRes.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      const botBuyer = room.players.find((p) => p.id === 'bot-buyer')!;
      const initBalance = botBuyer.balance;

      mgr.runBotTurn(room.roomCode);

      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      expect(mgr.getAuctionSession(room.roomCode)).toBeUndefined();
      expect(mgr.getPropertyOwner(room.roomCode, 3)).toBe('bot-buyer');
      expect(botBuyer.balance).toBeLessThan(initBalance);
    });

    it('Bot từ chối mua kích hoạt đấu giá và Bot khác chốt mua thành công trong cùng lượt runBotTurn', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('bot-turn');
      const bot1 = room.players[0]!;
      bot1.isBot = true;
      (mgr as any).botPersonalities.set(`${room.roomCode}:${bot1.id}`, BotPersonality.Passive);
      mgr.addBot(room.roomCode, 'bot-buyer', BotPersonality.Aggressive);
      mgr.startGame(room.roomCode);

      bot1.position = 3;
      room.phase = TurnPhase.ActionPhase;

      mgr.runBotTurn(room.roomCode);

      expect(room.phase).toBe(TurnPhase.WaitingRoll);
      expect(mgr.getAuctionSession(room.roomCode)).toBeUndefined();
      expect(mgr.getPropertyOwner(room.roomCode, 3)).toBe('bot-buyer');
      expect(room.players[room.currentPlayerIndex]?.id).toBe('bot-buyer');
    });
  });
});
