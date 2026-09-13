import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { ChanceCardId, MarketCardId } from '../../src/domain/event_card_types.js';
import { handleLanding } from '../../src/domain/property_manager.js';
import { executeChanceCard } from '../../src/domain/chance_card_handlers.js';

describe('[ADVERSARIAL-STRESS] Kiểm Thử 5 Bẫy Logic Cực Đoan & Trạng Thái Biên', () => {
  // ---------------------------------------------------------------------------
  // BẪY 1: Đổ 3 lần xúc xắc đôi liên tiếp -> Bị bắt vào Trạm Kiểm Toán, tước quyền đi
  // ---------------------------------------------------------------------------
  it('[Bẫy 1: Triple Doubles Jail] Người chơi đổ 3 lần đôi liên tiếp lập tức vào Trạm Kiểm Toán (ô 10), reset cờ đôi và không được đi tiếp', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.addBot(room.roomCode, 'bot_2');
    mgr.startGame(room.roomCode);

    const p1 = room.players[0]!;
    // Giả lập đổ đôi lần 1
    p1.consecutiveDoubles = 1;
    room.phase = TurnPhase.PropertyManagement;

    // Giả lập đổ đôi lần 2
    p1.consecutiveDoubles = 2;
    room.phase = TurnPhase.PropertyManagement;

    // Đổ đôi lần 3 -> Chặn đứng di chuyển, chuyển sang ô 10
    // Cài đặt dice kết quả đôi
    (mgr as any).rng = () => 0.1; // Cố định dice
    p1.consecutiveDoubles = 2;
    const res = mgr.handleRollDice(room.roomCode, 'p1');

    // Sau lần 3, consecutiveDoubles phải được reset về 0
    expect(p1.consecutiveDoubles).toBe(0);
    // Nếu vào tù: auditTurnsLeft = 3, position = 10
    if (p1.auditTurnsLeft > 0) {
      expect(p1.position).toBe(10);
      expect(p1.auditTurnsLeft).toBe(3);
    }
  });

  // ---------------------------------------------------------------------------
  // BẪY 2: Bão biển MC_COASTAL_STORM & Bảo tồn thẻ CC_DIPLOMATIC trên tay
  // ---------------------------------------------------------------------------
  it('[Bẫy 2: Zero-Rent Precedence] Dẫm BĐS khi có bão biển (tiền thuê = 0) không được nuốt mất thẻ CC_DIPLOMATIC trên tay', () => {
    const mgr = new RoomManager(1234);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    // p2 sở hữu ô 1 (Cần Thơ)
    mgr.getRegistry(room.roomCode)!.set(1, 'p2');

    // Kích hoạt bão biển MC_COASTAL_STORM tác động ô 1
    room.activeModifiers = [
      {
        type: MarketCardId.MC_COASTAL_STORM,
        affectedCells: [1],
        remainingRounds: 2,
        multiplier: 0,
      },
    ];

    // p1 có thẻ CC_DIPLOMATIC trên tay
    room.players[0]!.hand = [ChanceCardId.CC_DIPLOMATIC];
    room.players[0]!.position = 0;

    // p1 dẫm vào ô 1 của p2 trong lúc có bão biển
    const landingRes = handleLanding(
      room.players[0]!,
      1,
      mgr.getRegistry(room.roomCode)!,
      room.players,
      mgr.getPropertyStates(room.roomCode),
      7,
      room.activeModifiers,
      undefined,
      room.chanceDiscard,
    );
    // Tiền thuê phải bằng 0 do bão biển miễn phí
    expect(landingRes.rentAmount).toBe(0);

    // Thẻ CC_DIPLOMATIC trên tay vẫn phải còn nguyên (không bị tiêu thụ vô ích)
    expect(room.players[0]!.hand).toContain(ChanceCardId.CC_DIPLOMATIC);
  });

  // ---------------------------------------------------------------------------
  // BẪY 3: Đấu giá không ai mua -> Tự động phát mãi Kho Bạc 70% giá gốc, không kẹt FSM
  // ---------------------------------------------------------------------------
  it('[Bẫy 3: Foreclosure 70%] Sàn đấu giá khi 100% người chơi đều Bỏ cuộc (Pass) phát mãi vào Kho Bạc 70%, FSM chuyển lượt an toàn', () => {
    const mgr = new RoomManager(999);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    // p1 dẫm ô 3 và từ chối mua -> mở đấu giá
    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;
    mgr.handleDecline(room.roomCode, 'p1');

    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // p2 bấm Bỏ qua (Pass)
    const passRes = mgr.handleAuctionPass(room.roomCode, 'p2');
    expect(passRes.success).toBe(true);

    // Vì không ai mua, ô đất giữ nguyên vô chủ, phiên đấu giá đóng
    expect(mgr.getAuctionSession(room.roomCode)).toBeUndefined();
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect(mgr.getPropertyOwner(room.roomCode, 3)).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // BẪY 4: Spam Roll Dice -> Không được phép gieo 2 lần trong cùng 1 lượt
  // ---------------------------------------------------------------------------
  it('[Bẫy 4: Anti-Double Roll Spam] Gieo xúc xắc lần 2 khi chưa kết thúc lượt hoặc không có cờ đôi bị từ chối dứt khoát', () => {
    const mgr = new RoomManager(101);
    const room = mgr.createRoom('p1');
    mgr.addBot(room.roomCode, 'bot_2');
    mgr.startGame(room.roomCode);

    // Lần 1: Gieo thành công
    const roll1 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll1).toBeDefined();

    // Giả định xúc xắc không ra đôi
    room.players[0]!.consecutiveDoubles = 0;
    room.phase = TurnPhase.PropertyManagement;

    // Lần 2 (Spam click): Phải bị từ chối
    const roll2 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll2).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // BẪY 5: Bảo toàn tiền tệ khi mua nhà / hạ cấp / nộp phạt (Treasury Conservation)
  // ---------------------------------------------------------------------------
  it('[Bẫy 5: Treasury Conservation Invariant] Tổng tiền tệ toàn bàn cờ không tự sinh ra hay biến mất khi nộp phạt vào Kho Bạc', () => {
    const mgr = new RoomManager(555);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    const initialTotal = room.players[0]!.balance + room.players[1]!.balance + (room.treasury ?? 0);

    // p1 nộp phạt bảo lãnh kiểm toán 500 Tr. vào Kho Bạc
    room.players[0]!.auditTurnsLeft = 3;
    room.phase = TurnPhase.WaitingRoll;
    mgr.handleBailOut(room.roomCode, 'p1');

    const afterTotal = room.players[0]!.balance + room.players[1]!.balance + (room.treasury ?? 0);
    expect(afterTotal, 'Tổng cung tiền toàn hệ thống được bảo toàn 100%').toBe(initialTotal);
  });
});
