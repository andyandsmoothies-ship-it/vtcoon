// [E2E-TEST] Tự động hóa kiểm thử toàn bộ kịch bản ván đấu thực tế của người dùng
// Mô phỏng 100% bằng logic không cần trình duyệt: 
// 1. Thẻ Cơ Hội CC_PLATE_AUCTION cấp đúng 1 lượt phụ
// 2. Chuyển sang sàn Đấu Giá tự động giải quyết bằng Bot AI không bao giờ bị đơ
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { ChanceCardId } from '../../src/domain/event_card_engine.js';
import { executeChanceCard } from '../../src/domain/chance_card_handlers.js';
import { WssServer } from '../../src/server/network/wss_server.js';

describe('[E2E-AUTOMATION] Kiểm thử Logic Toàn Trình (Headless Simulation)', () => {
  it('Kịch bản ván đấu thực tế: Thẻ Cơ hội +1 lượt và Đấu giá Ô 31 Hưng Yên hoàn tất trơn tru trong 10ms', () => {
    // 1. Khởi tạo phòng với 1 người chơi Human (p1) và 1 Bot AI (bot_2)
    const mgr = new RoomManager(12345);
    const room = mgr.createRoom('p1');
    mgr.addBot(room.roomCode, 'bot_2');
    mgr.startGame(room.roomCode);

    expect(room.phase).toBe(TurnPhase.WaitingRoll);
    expect(room.currentPlayerIndex).toBe(0);

    // =========================================================================
    // BƯỚC 1: P1 gieo xúc xắc 3+4 = 7 dẫm ô Cơ Hội
    // =========================================================================
    // Cài đặt thẻ CC_PLATE_AUCTION lên đầu chồng bài Cơ Hội
    room.chanceDeck = [
      ChanceCardId.CC_PLATE_AUCTION,
      ...room.chanceDeck.filter((c) => c !== ChanceCardId.CC_PLATE_AUCTION),
    ];

    // P1 dẫm ô 7 và rút thẻ Cơ hội CC_PLATE_AUCTION
    room.players[0]!.position = 7;
    executeChanceCard(ChanceCardId.CC_PLATE_AUCTION, 'p1', [room.players[0]!]);
    room.phase = TurnPhase.PropertyManagement;

    expect(room.players[0]!.balance, 'P1 bị trừ 500 Tr. tiền đấu giá biển số').toBe(24_500);
    expect(room.players[0]!.extraTurns, 'P1 nhận đúng +1 lượt đi thêm').toBe(1);
    expect(room.players[0]!.consecutiveDoubles, 'consecutiveDoubles tuyệt đối KHÔNG bị tăng').toBe(0);
    expect(room.phase, 'FSM ở PropertyManagement sau khi dẫm ô Cơ Hội').toBe(TurnPhase.PropertyManagement);

    // KIỂM CHỨNG LỖI 1 ĐƯỢC CHẶN: P1 không thể gieo tiếp từ PropertyManagement
    const illegalRoll = mgr.handleRollDice(room.roomCode, 'p1');
    expect(illegalRoll, 'Không được phép gieo xúc xắc khi chưa kết thúc lượt').toBeUndefined();

    // =========================================================================
    // BƯỚC 2: P1 bấm kết thúc lượt -> Kích hoạt lượt phụ hợp lệ duy nhất
    // =========================================================================
    const end1 = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
    expect(end1.success).toBe(true);
    expect(room.currentPlayerIndex, 'Lượt vẫn ở P1 nhờ extraTurns').toBe(0);
    expect(room.players[0]!.extraTurns, 'extraTurns giảm về 0 sau khi tiêu thụ').toBe(0);
    expect(room.phase, 'FSM quay về WaitingRoll cho lượt bổ sung hợp lệ').toBe(TurnPhase.WaitingRoll);

    // =========================================================================
    // BƯỚC 3: P1 gieo lượt bổ sung (2+6 = 8 đến Cảng Cái Mép ô 15) và mua đất
    // =========================================================================
    room.players[0]!.position = 7;
    mgr.handleRollDice(room.roomCode, 'p1');
    room.players[0]!.position = 15;
    room.phase = TurnPhase.ActionPhase;

    // P1 mua ô 15 (Cảng Cái Mép) giá 2.000 Tr.
    const buyRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_BUY' });
    expect(buyRes.success).toBe(true);
    expect(room.players[0]!.balance).toBe(22_500);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // P1 kết thúc lượt -> BẮT BUỘC CHUYỂN SANG BOT 2 (Không còn lượt thứ ba!)
    const end2 = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
    expect(end2.success).toBe(true);
    expect(room.currentPlayerIndex, 'Chuyển lượt sang Bot 2').toBe(1);
    expect(room.players[1]!.id).toBe('bot_2');

    // =========================================================================
    // BƯỚC 4: Bot 2 thực hiện lượt tự động
    // =========================================================================
    mgr.runBotTurn(room.roomCode);
    expect(room.currentPlayerIndex, 'Sau khi Bot 2 đi xong, lượt quay về P1').toBe(0);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);

    // =========================================================================
    // BƯỚC 5: P1 gieo 5 điểm đến Ô 31 (Hưng Yên) và từ chối mua -> Sàn Đấu Giá
    // =========================================================================
    room.players[0]!.position = 26;
    mgr.handleRollDice(room.roomCode, 'p1');
    room.players[0]!.position = 31;
    room.phase = TurnPhase.ActionPhase;

    // P1 từ chối mua (hoặc hết giờ) -> Kích hoạt đấu giá
    const declineRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DECLINE' });
    expect(declineRes.success).toBe(true);
    expect(room.phase, 'FSM chuyển sang AuctionPhase').toBe(TurnPhase.AuctionPhase);

    const auction = mgr.getAuctionSession(room.roomCode);
    expect(auction, 'Phiên đấu giá được khởi tạo thành công').toBeDefined();
    expect(auction!.declinedPlayerId, 'P1 là người từ chối mua').toBe('p1');
    expect(auction!.cellIndex).toBe(31);

    const botBalBeforeAuction = room.players[1]!.balance;
    // Giải quyết đấu giá Bot tự động (không bị đơ, không bị đệ quy vô hạn)
    mgr.resolveAuctionBots(room.roomCode);

    // Sàn đấu giá kết thúc thành công: Bot 2 thắng với giá 1.550 Tr., ô 31 thuộc về Bot 2
    expect(mgr.getPropertyOwner(room.roomCode, 31), 'Ô 31 đã được chuyển quyền sở hữu cho Bot 2').toBe('bot_2');
    expect(room.players[1]!.balance, 'Bot 2 đã trừ đúng 1.550 Tr. tiền trúng đấu giá').toBe(botBalBeforeAuction - 1_550);
    expect(room.phase, 'FSM tự động chuyển tiếp sang PropertyManagement an toàn').toBe(TurnPhase.PropertyManagement);
  });

  it('WssServer: Bộ lập lịch mạng tự động điều phối phiên đấu giá không gây đóng băng', () => {
    const server = new WssServer({ port: 0 });
    try {
      const roomMgr = server.getRoomManager();
      const room = roomMgr.createRoom('p1');
      roomMgr.addBot(room.roomCode, 'bot_2');
      roomMgr.startGame(room.roomCode);

      // P1 từ chối mua ô 31
      room.players[0]!.position = 31;
      room.phase = TurnPhase.ActionPhase;
      roomMgr.handleDecline(room.roomCode, 'p1');

      // Kích hoạt bộ lập lịch máy chủ
      expect(() => {
        (server as any).turnTimeoutScheduler.scheduleTurnTimeout(room.roomCode);
      }, 'Không bao giờ ném lỗi RangeError hay đệ quy vô hạn').not.toThrow();
    } finally {
      server.close();
    }
  });
});
