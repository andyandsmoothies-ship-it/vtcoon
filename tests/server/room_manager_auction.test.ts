// [TC-03.1/MSS] FSM ACTION_PHASE → Auction Integration Test

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';

describe('[TC-03.1/MSS] FSM ACTION_PHASE → Đấu Giá', () => {
  it('INTENT_DECLINE → AUCTION_PHASE → bid hợp lệ → chốt người cao nhất', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.joinRoom(room.roomCode, 'pC');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 3; // ô 03, giá 600
    room.phase = TurnPhase.ActionPhase;

    // Không thể close khi chưa mở đấu giá
    expect(mgr.handleAuctionClose(room.roomCode).winnerId).toBeUndefined();

    const decline = mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_DECLINE' });
    expect(decline.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // Không thể kết thúc lượt trong phiên đấu giá
    expect(mgr.handleEndTurn(room.roomCode, 'pA')).toBeUndefined();
    expect(mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_END_TURN' }).success).toBe(false);

    // Bids không hợp lệ
    expect(mgr.handleAuctionBid(room.roomCode, 'pB', NaN).success).toBe(false);
    expect(mgr.handleAuctionBid(room.roomCode, 'pB', 999_999).success).toBe(false); // Thiếu tiền
    expect(mgr.handleAuctionBid(room.roomCode, 'pUnknown', 400).success).toBe(false); // Không có trong phòng
    expect(mgr.handleAuctionBid(room.roomCode, 'pB', 400.5).success).toBe(false); // Số lẻ thập phân không hợp lệ

    // Khởi điểm 50%=300, bước giá 100
    expect(mgr.handleAuctionBid(room.roomCode, 'pB', 400).success).toBe(true);
    // pB đang là người trả giá cao nhất -> không thể tự bid đè chính mình
    expect(mgr.handleAuctionBid(room.roomCode, 'pB', 500).success).toBe(false);
    expect(mgr.handleAuctionBid(room.roomCode, 'pB', 500).reason).toBe('ALREADY_HIGHEST_BIDDER');

    expect(mgr.handlePlayerIntent(room.roomCode, 'pC', { type: 'INTENT_BID', amount: 500 }).success).toBe(true);
    expect(mgr.handleAuctionBid(room.roomCode, 'pB', 450).success).toBe(false); // < 500+100

    const close = mgr.handleAuctionClose(room.roomCode);
    expect(close.winnerId).toBe('pC');
    expect(close.winningBid).toBe(500);
    expect(room.players[2]!.balance).toBe(14_500);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // pA không sở hữu ô 3 nên không thể nâng cấp
    expect(mgr.handleUpgrade(room.roomCode, 'pA', 3).success).toBe(false);

    // pA kết thúc lượt chuyển sang pB
    const end = mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_END_TURN' });
    expect(end.success).toBe(true);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('không ai bid → ô giữ nguyên vô chủ', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_DECLINE' });

    const close = mgr.handleAuctionClose(room.roomCode);
    expect(close.winnerId).toBeUndefined();
    expect(close.winningBid).toBe(0);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // pA kết thúc lượt hợp lệ
    const end = mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_END_TURN' });
    expect(end.success).toBe(true);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });
});
