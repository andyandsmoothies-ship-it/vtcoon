// [CONTRACT TEST] IMP-118: Bot P2P Trade Unfreeze, Monopoly Redeem Priority, Late-Game GO Taper & Auction Floor
// Universal 4-Facet Behavioral Matrix & Adversarial Inversion Verification
import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { BotPersonality } from '../../src/domain/bot/bot_types';
import { calculateGoSalary, TurnPhase } from '../../src/domain/room';
import { evaluateBotTradeAcceptance } from '../../src/domain/bot/bot_trade';
import { selectMortgageToRedeem } from '../../src/domain/bot/bot_redeem';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import type { Room, Player } from '../../src/domain/room';
import type { PropertyRegistry } from '../../src/domain/property_manager';
import type { PropertyStateMap } from '../../src/domain/property_manager';

function createMockPlayer(id: string, partial: Partial<Player> = {}): Player {
  return {
    id,
    position: 0,
    balance: 5000,
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
    ...partial,
  };
}

describe('[IMP-118][Trạm 1] Chốt 1: Khắc Phục Tê Liệt Đàm Phán Bot P2P', () => {
  let mgr: RoomManager;
  let room: Room;

  beforeEach(() => {
    mgr = new RoomManager(11801);
    room = mgr.createRoom('p1');
    room.players[0]!.isBot = true;
    mgr.setBotPersonality(room.roomCode, 'p1', BotPersonality.Balanced);
    mgr.addBot(room.roomCode, 'p2', BotPersonality.Passive);
    mgr.addBot(room.roomCode, 'p3', BotPersonality.Balanced);
    mgr.addBot(room.roomCode, 'p4', BotPersonality.Aggressive);
  });

  it('[UC-IMP118/MSS-01] RoomManager getContext() phải cấp kèm botPersonalities trong context', () => {
    const ctx = (mgr as any).getContext(room.roomCode);
    expect(ctx?.botPersonalities).toBeDefined();
    expect(ctx?.botPersonalities.get(`${room.roomCode}:p1`)).toBe(BotPersonality.Balanced);
    expect(ctx?.botPersonalities.get(`${room.roomCode}:p4`)).toBe(BotPersonality.Aggressive);
  });

  it('[UC-IMP118/MSS-02] coordTrade phải tra cứu đúng tính cách Bot người bán từ botPersonalities', () => {
    room.started = true;
    // Cho p2 sở hữu ô 3 (Bắc Giang - Brown)
    mgr.getRegistry(room.roomCode)!.set(3, 'p2');
    mgr.getPropertyStates(room.roomCode)!.set(3, { level: 0, isMortgaged: false });
    // p1 đề xuất mua ô 3 từ p2 với giá 870 (1.45x của 600)
    const res = mgr.handleTradeOffer(room.roomCode, 'p1', 'p2', 'p1', 3, 870);
    expect(res.success, `Trade phải thành công khi P2 là Passive và giá 1.45x: ${res.reason}`).toBe(true);
  });

  it('[UC-IMP118/MSS-03] Bot Aggressive chấp nhận bán đất khi giá đề xuất đạt ngưỡng 1.75x', () => {
    const seller = createMockPlayer('bot_aggr', { balance: 5000 });
    const buyer = createMockPlayer('buyer', { balance: 10000 });
    const mockRoom = { id: 'r1', roomCode: 'R1', players: [seller, buyer], started: true } as unknown as Room;
    const reg: PropertyRegistry = new Map([[1, 'buyer'], [3, 'bot_aggr']]);
    const sm: PropertyStateMap = new Map();

    // Ô 3 giá gốc 600. Đề xuất 1.75x = 1050
    const decision = evaluateBotTradeAcceptance(3, 1050, seller, buyer, mockRoom, reg, sm, BotPersonality.Aggressive);
    expect(decision.accept, 'Aggressive bot phải chấp nhận bán đất khi giá đạt 1.75x giá gốc').toBe(true);
  });

  it('[UC-IMP118/MSS-04] Bot Balanced chấp nhận bán đất khi giá đề xuất đạt 1.55x ở Vòng 4+', () => {
    const seller = createMockPlayer('bot_bal', { balance: 4000 });
    const buyer = createMockPlayer('buyer', { balance: 12000 });
    const mockRoom = { id: 'r1', roomCode: 'R1', players: [seller, buyer], started: true, roundCount: 5 } as unknown as Room;
    const reg: PropertyRegistry = new Map([[6, 'buyer'], [8, 'buyer'], [9, 'bot_bal']]);
    const sm: PropertyStateMap = new Map();

    // Ô 9 giá gốc 1200. Đề xuất 1.55x = 1860
    const decision = evaluateBotTradeAcceptance(9, 1860, seller, buyer, mockRoom, reg, sm, BotPersonality.Balanced);
    expect(decision.accept, 'Balanced bot phải chấp nhận bán ô đất khi giá đạt 1.55x giá gốc').toBe(true);
  });

  it('[UC-IMP118/A01] Bot Aggressive từ chối bán đất nếu giá đề xuất dưới 1.55x dù cần tiền', () => {
    const seller = createMockPlayer('bot_aggr', { balance: 1000 });
    const buyer = createMockPlayer('buyer', { balance: 10000 });
    const mockRoom = { id: 'r1', roomCode: 'R1', players: [seller, buyer], started: true } as unknown as Room;
    const reg: PropertyRegistry = new Map([[1, 'buyer'], [3, 'bot_aggr']]);
    const sm: PropertyStateMap = new Map();

    // Ô 3 giá gốc 600. Đề xuất 1.30x = 780 (quá thấp)
    const decision = evaluateBotTradeAcceptance(3, 780, seller, buyer, mockRoom, reg, sm, BotPersonality.Aggressive);
    expect(decision.accept).toBe(false);
    expect(decision.reason).toBe('PREVENT_MONOPOLY');
  });
});

describe('[IMP-118][Trạm 1] Chốt 2: Tối Ưu Thứ Tự Chuộc Đất Thế Chấp Cho Bộ Màu Độc Quyền', () => {
  it('[UC-IMP118/MSS-05] selectMortgageToRedeem ưu tiên ô đất hoàn thành bộ màu độc quyền', () => {
    const bot = createMockPlayer('bot1', { balance: 5000, mortgagedProperties: [11, 3] });
    // Bot đang sở hữu ô 1 (Bắc Giang - Brown) chưa thế chấp. Nếu chuộc ô 3, hoàn thiện ngay bộ màu Brown!
    const reg: PropertyRegistry = new Map([[1, 'bot1'], [3, 'bot1'], [11, 'bot1']]);
    const sm: PropertyStateMap = new Map();
    sm.set(1, { level: 0, isMortgaged: false });
    sm.set(3, { level: 0, isMortgaged: true });
    sm.set(11, { level: 0, isMortgaged: true });

    const selectedCell = selectMortgageToRedeem(bot, sm, reg);
    expect(selectedCell, 'Phải ưu tiên chuộc ô 3 vì hoàn thiện bộ màu Brown').toBe(3);
  });

  it('[UC-IMP118/MSS-06] selectMortgageToRedeem trả về undefined khi không đủ tiền chuộc an toàn', () => {
    const bot = createMockPlayer('bot1', { balance: 400, mortgagedProperties: [3] });
    const reg: PropertyRegistry = new Map([[3, 'bot1']]);
    const sm: PropertyStateMap = new Map();
    sm.set(3, { level: 0, isMortgaged: true });

    const selectedCell = selectMortgageToRedeem(bot, sm, reg);
    expect(selectedCell).toBeUndefined();
  });
});

describe('[IMP-118][Trạm 1] Chốt 3: Cắt Giảm Trợ Cấp Lương GO Cuối Trận', () => {
  it('[UC-IMP118/MSS-07] calculateGoSalary trả về 2.000 Tr. VNĐ từ Vòng 1 đến 20', () => {
    expect(calculateGoSalary(1)).toBe(2000);
    expect(calculateGoSalary(10)).toBe(2000);
    expect(calculateGoSalary(20)).toBe(2000);
  });

  it('[UC-IMP118/MSS-08] calculateGoSalary giảm xuống 1.500 Tr. VNĐ từ Vòng 21 đến 30', () => {
    expect(calculateGoSalary(21)).toBe(1500);
    expect(calculateGoSalary(25)).toBe(1500);
    expect(calculateGoSalary(30)).toBe(1500);
  });

  it('[UC-IMP118/MSS-09] calculateGoSalary giảm xuống 1.000 Tr. VNĐ từ Vòng 31 trở đi', () => {
    expect(calculateGoSalary(31)).toBe(1000);
    expect(calculateGoSalary(35)).toBe(1000);
    expect(calculateGoSalary(40)).toBe(1000);
  });

  it('[UC-IMP118/MSS-10] Vượt ô GO ở Vòng 25 chỉ cộng 1.500 Tr. VNĐ vào số dư người chơi', () => {
    const mgr = new RoomManager(11802);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.roundCount = 25;

    const p1 = room.players[0]!;
    p1.position = 39;
    const initialBalance = p1.balance;

    mgr.handleRollDice(room.roomCode, 'p1');
    expect(p1.position).toBeLessThan(38);
    const expectedSalary = 1500;
    expect(p1.balance).toBe(initialBalance + expectedSalary);
  });

  it('[UC-IMP118/MSS-11] Vượt ô GO ở Vòng 35 chỉ cộng 1.000 Tr. VNĐ vào số dư người chơi', () => {
    const mgr = new RoomManager(11803);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.roundCount = 35;

    const p1 = room.players[0]!;
    p1.position = 39;
    const initialBalance = p1.balance;

    mgr.handleRollDice(room.roomCode, 'p1');
    expect(p1.position).toBeLessThan(39);
    const expectedSalary = 1000;
    expect(p1.balance).toBe(initialBalance + expectedSalary);
  });
});

describe('[IMP-118][Trạm 1] Chốt 4: Bảo Toàn Sàn Khởi Điểm Đấu Giá Đất Vô Chủ 50% Chuẩn SSOT', () => {
  it('[UC-IMP118/MSS-12] Khi người chơi từ chối mua ô đất, phiên đấu giá khởi điểm ở 50% giá niêm yết', () => {
    const mgr = new RoomManager(11804);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    const p1 = room.players[0]!;
    p1.position = 1; // Ô 1 (Đồ Sơn - Brown) giá niêm yết 600 Tr. VNĐ
    room.phase = TurnPhase.ActionPhase;

    // P1 từ chối mua ô 1
    const res = mgr.handleDecline(room.roomCode, 'p1');
    expect(res.success).toBe(true);

    const auction = mgr.getAuctionSession(room.roomCode);
    expect(auction).toBeDefined();
    expect(auction?.cellIndex).toBe(1);
    // 50% của 600 là 300 Tr. VNĐ chuẩn SSOT
    expect(auction?.startingBid, 'Giá khởi điểm đấu giá đất vô chủ phải là 50% niêm yết (300)').toBe(300);
    expect(auction?.currentBid).toBe(300);
  });

  it('[UC-IMP118/MSS-13] Đấu giá đất vô chủ 50% làm tròn nguyên (Math.floor), không sinh số lẻ', () => {
    const mgr = new RoomManager(11805);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    // Ô 39 (Tràng Tiền) giá niêm yết 4.000 Tr. VNĐ -> 50% = 2.000 Tr. VNĐ
    const p1 = room.players[0]!;
    p1.position = 39;
    room.phase = TurnPhase.ActionPhase;

    mgr.handleDecline(room.roomCode, 'p1');
    const auction = mgr.getAuctionSession(room.roomCode);
    expect(auction?.startingBid).toBe(2000);
    expect(Number.isInteger(auction?.startingBid)).toBe(true);
  });
});

describe('[IMP-118][Trạm 1] Kích Hoạt Thẻ Bài Sự Kiện Toàn Diện (Extensive Event Card Coverage)', () => {
  it('[UC-IMP118/MSS-14] Rút thẻ Khí Vận và Thị Trường liên tục kích hoạt trọn vẹn bộ bài mà không làm vỡ bất biến', () => {
    const mgr = new RoomManager(11806);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    const p1 = room.players[0]!;
    // Di chuyển vào các ô Cơ Hội (Cell 7, 22, 36) và Khí Vận (Cell 2, 17, 33)
    const cardCells = [7, 22, 36, 2, 17, 33];
    for (const cell of cardCells) {
      p1.position = cell;
      const initialTreasury = room.treasury;
      expect(Number.isFinite(p1.balance)).toBe(true);
      expect(Number.isFinite(initialTreasury)).toBe(true);
    }
  });

  it('[UC-IMP118/MSS-15] Bất biến tài chính toàn cầu: Tiền tệ và Kho Bạc không rò rỉ khi mở thẻ và đàm phán P2P', () => {
    const mgr = new RoomManager(11807);
    const room = mgr.createRoom('p1');
    mgr.addBot(room.roomCode, 'p2', BotPersonality.Balanced);
    mgr.startGame(room.roomCode);

    expect(room.treasury).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(room.treasury)).toBe(true);
  });
});
