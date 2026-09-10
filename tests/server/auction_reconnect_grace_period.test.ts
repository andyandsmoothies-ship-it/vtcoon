// [UC-GAME-006/MSS][UC-GAME-007/MSS][UC-GAME-028/MSS]
// Kiểm thử: Rớt mạng WebSocket khi đang giữ giá cao nhất ở 3s cuối sàn đấu giá & Reconnect phục hồi
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { ReconnectManager } from '../../src/server/network/reconnect_manager';
import { SessionManager } from '../../src/server/session_manager';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster';
import { PROPERTY_DEEDS } from '../../src/domain/property_manager';

describe('[UC-GAME-006/MSS][UC-GAME-028/MSS] Rớt Mạng Đấu Giá 3s Cuối & Reconnect Phục Hồi', () => {
  it('P1 đang là Highest Bidder Ô 37 (2.500 Tr.) ➔ Rớt mạng kích hoạt Grace Period 60s ➔ Server chốt thắng cho P1 ➔ Reconnect nhận trọn sổ đỏ', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot2');
    mgr.joinRoom(room.roomCode, 'bot3');
    mgr.startGame(room.roomCode);

    const sessionMgr = new SessionManager();
    const broadcaster = new DeltaBroadcaster(mgr, sessionMgr, () => {});
    const reconnectMgr = new ReconnectManager({
      rooms: mgr,
      sessions: sessionMgr,
      broadcaster,
      broadcast: () => {},
      gracePeriodMs: 60_000,
    });

    // 1. Cấp token reconnect cho P1
    const p1Token = reconnectMgr.generateToken('p1', room.roomCode);
    expect(p1Token).toBeDefined();

    // 2. Bot 3 hạ cánh Ô 37 (Diamond Plaza / Bến Thành, giá 3.500 Tr.)
    const deed37 = PROPERTY_DEEDS.get(37);
    expect(deed37).toBeDefined();

    room.currentPlayerIndex = 2; // bot3 lượt đi
    room.players[2]!.position = 37;
    room.phase = TurnPhase.ActionPhase;

    // 3. Bot 3 từ chối mua ➔ Mở phiên đấu giá cạnh tranh
    const declineRes = mgr.handlePlayerIntent(room.roomCode, 'bot3', { type: 'INTENT_DECLINE' });
    expect(declineRes.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // Bot 2 trả giá 2.000 Tr.
    const bot2Bid = mgr.handleAuctionBid(room.roomCode, 'bot2', 2_000);
    expect(bot2Bid.success).toBe(true);

    // P1 trả giá đè lên 2.500 Tr. ➔ P1 trở thành Highest Bidder dẫn đầu
    const session = mgr.getAuctionSession(room.roomCode);
    expect(session).toBeDefined();
    const p1Bid = mgr.handleAuctionBid(room.roomCode, 'p1', 2_500);
    expect(p1Bid.success).toBe(true);
    expect(session!.highestBidder).toBe('p1');
    expect(session!.highestBid).toBe(2_500);

    // 4. Ở 3 giây cuối cùng: P1 bị rớt mạng đột ngột (Socket Disconnect)
    reconnectMgr.startGracePeriod(room.roomCode, 'p1');
    expect(reconnectMgr.isPlayerInGrace(room.roomCode, 'p1')).toBe(true);

    // Giá bid của P1 vẫn được bảo lưu an toàn 100% trên Server
    expect(session!.highestBidder).toBe('p1');
    expect(session!.highestBid).toBe(2_500);

    // 5. Đồng hồ đếm ngược hết 15s ➔ Server đóng sàn đấu giá tự động
    const closeRes = mgr.handleAuctionClose(room.roomCode);
    expect(closeRes.winnerId).toBe('p1');
    expect(closeRes.winningBid).toBe(2_500);

    // Số dư P1 bị trừ chuẩn xác: 15.000 - 2.500 = 12.500 Tr.
    expect(room.players[0]!.balance).toBe(12_500);
    // Quyền sở hữu Ô 37 sang tên hợp pháp cho P1 trong registry
    expect(mgr.getPropertyOwner(room.roomCode, 37)).toBe('p1');

    // 6. P1 kết nối lại (Reconnect) với reconnectToken
    const verify = reconnectMgr.verifyToken(p1Token, room.roomCode);
    expect(verify.success).toBe(true);
    if (verify.success) {
      expect(verify.record.playerId).toBe('p1');
      expect(verify.record.roomCode).toBe(room.roomCode);
    }
    const cancelled = reconnectMgr.cancelGracePeriod(room.roomCode, 'p1');
    expect(cancelled).toBe(true);
    expect(reconnectMgr.isPlayerInGrace(room.roomCode, 'p1')).toBe(false);

    // FSM chuyển sang PropertyManagement an toàn
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('[Adversarial] Quy tắc Anti-sniping: Đặt giá hợp lệ ở <= 3s cuối tự động gia hạn thêm +3 giây', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot2');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 37;
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DECLINE' });

    const session = mgr.getAuctionSession(room.roomCode);
    expect(session).toBeDefined();

    // Giả lập thời gian còn lại 2 giây (<= 3s)
    session!.endTime = Date.now() + 2_000;
    const initialEndTime = session!.endTime;

    // Bot 2 đặt giá 2.000 Tr.
    const bidRes = mgr.handleAuctionBid(room.roomCode, 'bot2', 2_000);
    expect(bidRes.success).toBe(true);

    // Thời gian kết thúc phải được cộng thêm 3.000ms chống cướp phiên đấu giá
    expect(session!.endTime).toBeGreaterThanOrEqual(initialEndTime + 2_900);
  });

  it('[Adversarial] Token hết hạn hoặc sai phòng bị từ chối xác thực', () => {
    const mgr = new RoomManager(42);
    const sessionMgr = new SessionManager();
    const reconnectMgr = new ReconnectManager({
      rooms: mgr,
      sessions: sessionMgr,
      broadcaster: new DeltaBroadcaster(mgr, sessionMgr, () => {}),
      broadcast: () => {},
    });

    const token = reconnectMgr.generateToken('p1', 'ROOM01');
    // Xác thực với roomCode khác -> Từ chối TOKEN_INVALID
    const wrongRoom = reconnectMgr.verifyToken(token, 'ROOM02');
    expect(wrongRoom.success).toBe(false);
    if (!wrongRoom.success) {
      expect(wrongRoom.reasonCode).toBe('TOKEN_INVALID');
    }

    // Đánh dấu hết hạn -> Từ chối TOKEN_EXPIRED
    reconnectMgr.expireToken(token);
    const expired = reconnectMgr.verifyToken(token, 'ROOM01');
    expect(expired.success).toBe(false);
    if (!expired.success) {
      expect(expired.reasonCode).toBe('TOKEN_EXPIRED');
    }
  });
});
