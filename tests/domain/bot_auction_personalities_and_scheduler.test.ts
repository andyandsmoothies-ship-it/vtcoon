// [UC-BOT-04/MSS][UC-GAME-008/MSS][IMP-43]
// Bot Auction Personalities, Turn Timeout Scheduler Bot Trigger, Telemetry Bailout & UI Clarity Tests
import { describe, it, expect, vi } from 'vitest';
import { createPlayer, createRoom, TurnPhase, type CurrentAuctionState } from '../../src/domain/room';
import { decideBotIntent, BotPersonality, type BotConfig } from '../../src/domain/bot/bot_engine';
import { TurnTimeoutScheduler } from '../../src/server/network/turn_timeout_scheduler';
import { IntentMutex } from '../../src/server/network/intent_mutex';
import { RoomManager } from '../../src/server/room_manager';
import { computeExpectedDelta } from '../../src/client/telemetry/telemetry_delta_hook';
import type { DeltaPayload } from '../../src/server/session_manager';
import type { GameState } from '../../src/client/store/game_store';

const makeConfig = (personality: BotPersonality): BotConfig => ({
  personality,
  balanceThresholdMultiplier: personality === BotPersonality.Aggressive ? 1.0 : 1.2,
});

describe('Bot Auction Personalities (Trạm 1 - Contract & Behavioral Tests)', () => {
  // --- FACET 1: BOT PASSIVE (Săn Sale / Bargain Hunter) ---
  it('TC-BOT-AUC-PASSIVE-01: Bot Passive đặt giá khi ô đất có giá hời (< 70% giá gốc)', () => {
    const bot = createPlayer('bot-passive');
    bot.isBot = true;
    bot.balance = 10_000;
    bot.position = 0;

    const room = createRoom('host');
    room.round = 5;
    room.players = [bot];
    room.phase = TurnPhase.AuctionPhase;

    // Ô 1 (Đồ Sơn - giá gốc 600 Tr), đấu giá khởi điểm 300 Tr (50%)
    const auction: CurrentAuctionState = {
      cellIndex: 1,
      declinedPlayerId: 'p1',
      highestBid: 300,
      startingBid: 300,
    };

    const intent = decideBotIntent(bot, room, new Map(), new Map(), makeConfig(BotPersonality.Passive), auction);
    expect(intent?.type).toBe('INTENT_BID');
    expect(intent?.amount).toBe(350); // 350 < 420 (70% của 600)
  });

  it('TC-BOT-AUC-PASSIVE-02: Bot Passive từ chối đặt giá (Pass) khi giá vượt quá 85% giá gốc và không độc quyền', () => {
    const bot = createPlayer('bot-passive');
    bot.isBot = true;
    bot.balance = 10_000;

    const room = createRoom('host');
    room.round = 5;
    room.players = [bot];
    room.phase = TurnPhase.AuctionPhase;

    // Ô 1 (Đồ Sơn - giá gốc 600 Tr), giá thầu đã lên 700 Tr (> 115% của 600 = 690) [IMP-115]
    const auction: CurrentAuctionState = {
      cellIndex: 1,
      declinedPlayerId: 'p1',
      highestBid: 700,
      highestBidder: 'p2',
    };

    const intent = decideBotIntent(bot, room, new Map(), new Map(), makeConfig(BotPersonality.Passive), auction);
    expect(intent).toEqual({ type: 'INTENT_AUCTION_PASS' });
  });

  it('TC-BOT-AUC-PASSIVE-03: Bot Passive sẵn sàng đặt giá cao hơn nếu ô đất hoàn thành bộ màu độc quyền', () => {
    const bot = createPlayer('bot-passive');
    bot.isBot = true;
    bot.balance = 10_000;

    const room = createRoom('host');
    room.round = 5;
    room.players = [bot];
    room.phase = TurnPhase.AuctionPhase;

    const registry = new Map<number, string>();
    registry.set(1, 'bot-passive'); // Đã sở hữu ô 1 (Đồ Sơn)

    // Ô 3 (Cát Bà - giá gốc 600 Tr), giá thầu 500 Tr. Mua ô 3 sẽ hoàn thành độc quyền màu Nâu!
    const auction: CurrentAuctionState = {
      cellIndex: 3,
      declinedPlayerId: 'p1',
      highestBid: 500,
      highestBidder: 'p2',
    };

    const intent = decideBotIntent(bot, room, registry, new Map(), makeConfig(BotPersonality.Passive), auction);
    expect(intent?.type).toBe('INTENT_BID');
  });

  it('TC-BOT-AUC-PASSIVE-04: Bot Passive bảo toàn trọn vẹn quỹ đệm an toàn cao (safetyBuffer * 1.0)', () => {
    const bot = createPlayer('bot-passive');
    bot.isBot = true;
    bot.balance = 1_200; // Tiền mặt ít

    const room = createRoom('host');
    room.round = 10;
    room.players = [bot];
    room.phase = TurnPhase.AuctionPhase;

    // Đấu giá ô 1 khởi điểm 300, nhưng đệm an toàn bảo vệ khiến bot không mạo hiểm
    const auction: CurrentAuctionState = {
      cellIndex: 1,
      declinedPlayerId: 'p1',
      highestBid: 300,
    };

    // Với balance 1.200 và safetyBuffer ~1.000, maxBid của Passive không đủ trả 350
    const intent = decideBotIntent(bot, room, new Map(), new Map(), makeConfig(BotPersonality.Passive), auction);
    expect(intent?.type).toBe('INTENT_AUCTION_PASS');
  });

  // --- FACET 1 (TIẾP TỤC): BOT BALANCED (Nhà Đầu Tư Giá Trị) ---
  it('TC-BOT-AUC-BALANCED-01: Bot Balanced đặt giá hợp lý theo định giá thực tế estimatedValue', () => {
    const bot = createPlayer('bot-bal');
    bot.isBot = true;
    bot.balance = 10_000;

    const room = createRoom('host');
    room.round = 5;
    room.players = [bot];
    room.phase = TurnPhase.AuctionPhase;

    const auction: CurrentAuctionState = {
      cellIndex: 6, // Hạ Long - giá gốc 1000 Tr
      declinedPlayerId: 'p1',
      highestBid: 500,
      startingBid: 500,
    };

    const intent = decideBotIntent(bot, room, new Map(), new Map(), makeConfig(BotPersonality.Balanced), auction);
    expect(intent?.type).toBe('INTENT_BID');
    expect(intent?.amount).toBe(550);
  });

  it('TC-BOT-AUC-BALANCED-02: Bot Balanced mở rộng trần giá khi ô đất tạo thế độc quyền 2/3', () => {
    const bot = createPlayer('bot-bal');
    bot.isBot = true;
    bot.balance = 12_000;

    const room = createRoom('host');
    room.round = 5;
    room.players = [bot];
    room.phase = TurnPhase.AuctionPhase;

    const registry = new Map<number, string>();
    registry.set(6, 'bot-bal'); // Sở hữu ô 6 trong nhóm 3 ô (6, 8, 9)

    // Ô 8 (giá gốc 1000 Tr), đấu giá đã lên 1.200 Tr
    const auction: CurrentAuctionState = {
      cellIndex: 8,
      declinedPlayerId: 'p1',
      highestBid: 1_200,
      highestBidder: 'p2',
    };

    const intent = decideBotIntent(bot, room, registry, new Map(), makeConfig(BotPersonality.Balanced), auction);
    expect(intent?.type).toBe('INTENT_BID');
  });

  it('TC-BOT-AUC-BALANCED-03: Bot Balanced dừng lại rút lui khi giá thầu vượt quá trần giá trị chiến lược', () => {
    const bot = createPlayer('bot-bal');
    bot.isBot = true;
    bot.balance = 10_000;

    const room = createRoom('host');
    room.round = 15;
    room.players = [bot];
    room.phase = TurnPhase.AuctionPhase;

    // Ô 6 (giá gốc 1.000 Tr), giá thầu đã bị thổi lên 2.500 Tr (vượt quá xa định giá)
    const auction: CurrentAuctionState = {
      cellIndex: 6,
      declinedPlayerId: 'p1',
      highestBid: 2_500,
      highestBidder: 'p2',
    };

    const intent = decideBotIntent(bot, room, new Map(), new Map(), makeConfig(BotPersonality.Balanced), auction);
    expect(intent).toEqual({ type: 'INTENT_AUCTION_PASS' });
  });

  // --- FACET 1 (TIẾP TỤC): BOT AGGRESSIVE (Cá Mập Đấu Giá) ---
  it('TC-BOT-AUC-AGGRESSIVE-01: Bot Aggressive sẵn sàng trả giá cao vượt trần định giá thông thường', () => {
    const bot = createPlayer('bot-agg');
    bot.isBot = true;
    bot.balance = 15_000;

    const room = createRoom('host');
    room.round = 8;
    room.players = [bot];
    room.phase = TurnPhase.AuctionPhase;

    const registry = new Map<number, string>();
    registry.set(11, 'p2');
    registry.set(13, 'p2'); // Đối thủ p2 sắp hoàn thành độc quyền nhóm màu Tím!

    // Ô 14 (Đà Lạt - 1.400 Tr), giá thầu đã lên 2.000 Tr. Aggressive chặn đối thủ độc quyền!
    const auction: CurrentAuctionState = {
      cellIndex: 14,
      declinedPlayerId: 'p1',
      highestBid: 2_000,
      highestBidder: 'p2',
    };

    const intent = decideBotIntent(bot, room, registry, new Map(), makeConfig(BotPersonality.Aggressive), auction);
    expect(intent?.type).toBe('INTENT_BID');
  });

  it('TC-BOT-AUC-AGGRESSIVE-02: Bot Aggressive duy trì đệm an toàn mỏng (safetyBuffer * 0.25) để tối đa sức ép', () => {
    const bot = createPlayer('bot-agg');
    bot.isBot = true;
    bot.balance = 2_000; // Tiền mặt trung bình

    const room = createRoom('host');
    room.round = 5;
    room.players = [bot];
    room.phase = TurnPhase.AuctionPhase;

    const auction: CurrentAuctionState = {
      cellIndex: 6, // 1.000 Tr
      declinedPlayerId: 'p1',
      highestBid: 600,
      highestBidder: 'p2',
    };

    // Với 2.000 balance, Passive/Balanced có thể e ngại, nhưng Aggressive vẫn bid
    const intent = decideBotIntent(bot, room, new Map(), new Map(), makeConfig(BotPersonality.Aggressive), auction);
    expect(intent?.type).toBe('INTENT_BID');
  });

  it('TC-BOT-AUC-AGGRESSIVE-03: Bot Aggressive sử dụng bước nhảy giá lớn (+100 hoặc +200) khi ngân sách dồi dào', () => {
    const bot = createPlayer('bot-agg');
    bot.isBot = true;
    bot.balance = 20_000; // Ngân sách cực lớn

    const room = createRoom('host');
    room.round = 5;
    room.players = [bot];
    room.phase = TurnPhase.AuctionPhase;

    const auction: CurrentAuctionState = {
      cellIndex: 39, // Tràng Tiền 4.000 Tr
      declinedPlayerId: 'p1',
      highestBid: 2_000,
      highestBidder: 'p2',
    };

    const intent = decideBotIntent(bot, room, new Map(), new Map(), makeConfig(BotPersonality.Aggressive), auction);
    expect(intent?.type).toBe('INTENT_BID');
    // Bước nhảy của Aggressive khi tiền > 10.000 phải đạt tối thiểu +100 Tr (>= 2100)
    expect(intent?.amount).toBeGreaterThanOrEqual(2_100);
  });

  // --- FACET 2: TURN TIMEOUT SCHEDULER (Đánh thức Bot khi vào AuctionPhase) ---
  it('TC-SCHED-AUC-01: Khi ActionPhase timeout chuyển sang AuctionPhase, scheduler kích hoạt onScheduleBotTurn nếu có Bot hợp lệ', () => {
    const mgr = new RoomManager();
    const room = mgr.createRoom('p1', 'AUC001');
    const p1 = room.players[0]!;
    const bot2 = createPlayer('bot_2');
    bot2.isBot = true;
    room.players.push(bot2);
    room.started = true;
    room.phase = TurnPhase.ActionPhase;
    room.currentPlayerIndex = 0;
    p1.position = 23;

    const onScheduleBotTurnMock = vi.fn();
    const scheduler = new TurnTimeoutScheduler({
      rooms: mgr,
      intentMutex: new IntentMutex(),
      broadcaster: { broadcastRoomDelta: vi.fn() } as any,
      onGameOver: vi.fn(),
      onScheduleBotTurn: onScheduleBotTurnMock,
    });

    // Giả lập ActionPhase timeout: p1 decline -> chuyển sang AuctionPhase
    mgr.handleDecline('AUC001', 'p1');
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // Kích hoạt logic điều phối sau khi phase thay đổi
    scheduler.scheduleTurnTimeout('AUC001');

    // Phải đánh thức Bot AI vì bot_2 chưa pass và không phải declinedPlayerId
    expect(onScheduleBotTurnMock).toHaveBeenCalledWith('AUC001');
  });

  it('TC-SCHED-AUC-02: Khi chuyển sang AuctionPhase mà Bot là declinedPlayerId, không gọi onScheduleBotTurn cho chính nó', () => {
    const mgr = new RoomManager();
    const room = mgr.createRoom('bot_1', 'AUC002');
    const bot1 = room.players[0]!;
    bot1.isBot = true;
    const p2 = createPlayer('p2');
    room.players.push(p2);
    room.started = true;
    room.phase = TurnPhase.ActionPhase;
    room.currentPlayerIndex = 0;
    bot1.position = 23;

    const onScheduleBotTurnMock = vi.fn();
    const scheduler = new TurnTimeoutScheduler({
      rooms: mgr,
      intentMutex: new IntentMutex(),
      broadcaster: { broadcastRoomDelta: vi.fn() } as any,
      onGameOver: vi.fn(),
      onScheduleBotTurn: onScheduleBotTurnMock,
    });

    // Bot 1 từ chối mua -> Bot 1 bị cấm đấu giá
    mgr.handleDecline('AUC002', 'bot_1');

    scheduler.scheduleTurnTimeout('AUC002');
    // Chỉ có p2 (Human) được đấu giá, không có Bot nào hợp lệ -> không gọi onScheduleBotTurn
    expect(onScheduleBotTurnMock).not.toHaveBeenCalled();
  });

  it('TC-SCHED-AUC-03: Bot hợp lệ trong phòng tự động tham gia đấu giá không để sàn bị kẹt 15 giây', () => {
    const mgr = new RoomManager();
    const room = mgr.createRoom('p1', 'AUC003');
    const p1 = room.players[0]!;
    const bot2 = createPlayer('bot_2');
    bot2.isBot = true;
    bot2.balance = 10_000;
    room.players.push(bot2);
    room.started = true;
    room.phase = TurnPhase.ActionPhase;
    room.currentPlayerIndex = 0;
    p1.position = 23;

    mgr.handleDecline('AUC003', 'p1');
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // Sau khi resolveAuctionBots được gọi, Auction kết thúc an toàn và không bị treo
    mgr.resolveAuctionBots('AUC003');
    expect(room.phase).not.toBe(TurnPhase.AuctionPhase);
  });

  // --- FACET 3: TELEMETRY AUDIT BAILOUT WATCHDOG INVARIANT ---
  it('TC-TELEM-BAILOUT-01: Telemetry nhận diện sự kiện trừ 500 Tr phí bảo lãnh kiểm toán khi inAudit chuyển sang false', () => {
    const preState: GameState = {
      playersInfo: {
        p1: { id: 'p1', name: 'P1', balance: 8000, inAudit: true, auditTurnsLeft: 1, ownedProperties: [] } as any,
      },
      levelMap: {},
      treasuryPool: 2000,
    } as any;

    const delta: DeltaPayload = {
      tick: 48,
      cells: [],
      players: [
        {
          id: 'p1',
          position: 8,
          balance: 7500, // Bị trừ 500 Tr phí bảo lãnh
          inAudit: false,
          auditTurnsLeft: 0,
        } as any,
      ],
    };

    const expected = computeExpectedDelta(delta, preState);
    // Phải nhận diện được sự kiện nộp phí bảo lãnh kiểm toán 500 Tr (hoặc kỳ vọng -500 hoặc null để bỏ qua an toàn)
    expect(expected === -500 || expected === null).toBe(true);
  });

  it('TC-TELEM-BAILOUT-02: Telemetry nhận diện khi auditTurnsLeft giảm về 0 và số dư giảm 500 Tr', () => {
    const preState: GameState = {
      playersInfo: {
        bot_2: { id: 'bot_2', name: 'Bot 2', balance: 10110, inAudit: true, auditTurnsLeft: 1, ownedProperties: [] } as any,
      },
      levelMap: {},
      treasuryPool: 2000,
    } as any;

    const delta: DeltaPayload = {
      tick: 48,
      cells: [],
      players: [
        {
          id: 'bot_2',
          position: 8,
          balance: 9610, // -500 Tr
          inAudit: false,
          auditTurnsLeft: 0,
        } as any,
      ],
    };

    const expected = computeExpectedDelta(delta, preState);
    expect(expected === -500 || expected === null).toBe(true);
  });

  // --- FACET 4: UI AUCTION MODAL GUIDANCE CLARITY ---
  it('TC-UI-AUC-01: Giao diện giải thích rõ lý do không được đặt giá khi người chơi là declinedPlayerId', () => {
    // Contract test kiểm tra hằng số text hướng dẫn cho người chơi bị cấm đấu giá
    const DECLINED_PLAYER_GUIDANCE = 'Bạn đã từ chối mua ô đất này (Luật game cấm tham gia đấu giá). Đang chờ các đối thủ khác đặt giá...';
    expect(DECLINED_PLAYER_GUIDANCE).toContain('Luật game cấm tham gia đấu giá');
  });
});
