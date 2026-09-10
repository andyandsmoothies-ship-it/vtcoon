// [UC-GAME-028/MSS][EC-10] Kiểm thử Khủng hoảng kép & Phát mãi cưỡng chế 70% khi 100% người chơi đều bấm Pass
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { ActionRejectReason } from '../../src/domain/action_reasons';
import { PROPERTY_DEEDS } from '../../src/domain/property_manager';

describe('[UC-GAME-028/MSS][EC-10] Đấu Giá Cưỡng Chế 70% Khi 100% Người Chơi Đều Bấm Pass', () => {
  it('P1 từ chối mua Ô 39 (Tràng Tiền 4.000 Tr.) ➔ Mở đấu giá ➔ Cả 2 đối thủ đều Pass ➔ Phát mãi Kho Bạc 70% (2.800 Tr.) & FSM chuyển lượt an toàn', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot2');
    mgr.joinRoom(room.roomCode, 'bot3');
    mgr.startGame(room.roomCode);

    // 1. P1 di chuyển đến Ô 39 (Tràng Tiền, giá 4.000 Tr.)
    const deed39 = PROPERTY_DEEDS.get(39);
    expect(deed39).toBeDefined();
    expect(deed39!.price).toBe(4_000);

    room.players[0]!.position = 39;
    room.phase = TurnPhase.ActionPhase;

    // 2. P1 từ chối mua (DECLINE) ➔ Mở phiên đấu giá cạnh tranh
    const declineRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DECLINE' });
    expect(declineRes.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // Khởi điểm đấu giá 50% = 2.000 Tr.
    const session = mgr.getAuctionSession(room.roomCode);
    expect(session).toBeDefined();
    expect(session!.cellIndex).toBe(39);
    expect(session!.declinedPlayerId).toBe('p1');
    expect(session!.highestBid).toBe(2_000);

    // P1 là người từ chối mua nên không thể tham gia đấu giá chính ô đất đó
    const p1Bid = mgr.handleAuctionBid(room.roomCode, 'p1', 2_500);
    expect(p1Bid.success).toBe(false);
    expect(p1Bid.reason).toBe(ActionRejectReason.DECLINED_PLAYER_CANNOT_BID);

    // 3. Bot 2 quyết định Rút lui / Bỏ cuộc (Pass)
    const bot2Pass = mgr.handleAuctionPass(room.roomCode, 'bot2');
    expect(bot2Pass.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.AuctionPhase); // Vẫn còn Bot 3 chưa pass

    // 4. Bot 3 cũng quyết định Rút lui / Bỏ cuộc (Pass) ➔ 100% người chơi hợp lệ đã Pass!
    const bot3Pass = mgr.handleAuctionPass(room.roomCode, 'bot3');
    expect(bot3Pass.success).toBe(true);

    // 5. Hệ thống tự động đóng phiên đấu giá: 0 người thắng, chuyển sang phát mãi cưỡng chế 70%
    expect(mgr.getPropertyOwner(room.roomCode, 39)).toBeUndefined();
    expect(mgr.getAuctionSession(room.roomCode)).toBeUndefined(); // Session đã đóng

    // 6. FSM an toàn trở về TurnPhase.PropertyManagement, không bị kẹt hay treo ván đấu
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // 7. P1 kết thúc lượt an toàn ➔ Chuyển giao quyền chơi cho Bot 2
    const endTurnRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
    expect(endTurnRes.success).toBe(true);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.players[room.currentPlayerIndex]!.id).toBe('bot2');
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('[Adversarial] Người chơi đã bấm Pass không được phép đặt giá trở lại', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot2');
    mgr.joinRoom(room.roomCode, 'bot3');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 39;
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DECLINE' });

    // Bot 2 bấm Pass
    mgr.handleAuctionPass(room.roomCode, 'bot2');

    // Bot 2 cố đặt giá sau khi đã Pass
    const invalidBid = mgr.handleAuctionBid(room.roomCode, 'bot2', 2_500);
    expect(invalidBid.success).toBe(false);
    expect(invalidBid.reason).toBe('PLAYER_ALREADY_PASSED');
  });

  it('[Adversarial] Người đang trả giá cao nhất không được phép bấm Pass', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot2');
    mgr.joinRoom(room.roomCode, 'bot3');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 39;
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DECLINE' });

    // Bot 2 đặt giá 2.200 Tr. ➔ Dẫn đầu
    const bidRes = mgr.handleAuctionBid(room.roomCode, 'bot2', 2_200);
    expect(bidRes.success).toBe(true);

    // Bot 2 cố tình bấm Pass khi đang dẫn đầu
    const passRes = mgr.handleAuctionPass(room.roomCode, 'bot2');
    expect(passRes.success).toBe(false);
    expect(passRes.reason).toBe('HIGHEST_BIDDER_CANNOT_PASS');
  });
});
