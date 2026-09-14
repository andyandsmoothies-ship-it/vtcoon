// [UC-GAME-022/MSS][BR-GAME-022][IMP-49] Contract Tests — Thống Nhất Bước Giá Đấu Giá (+50 Tr.) & Đồng Bộ Trạng Thái Thực
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAuctionBid, type AuctionSession } from '../../src/server/auction_manager';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, type Room } from '../../src/domain/room';
import { ActionRejectReason } from '../../src/domain/action_reasons';
import { WssServer } from '../../src/server/network/wss_server';

describe('[UC-GAME-022/MSS][BR-GAME-022][IMP-49] Auction Step Harmonization & State Sync Contract Tests', () => {
  let mgr: RoomManager;
  let room: Room;
  let session: AuctionSession;

  beforeEach(() => {
    mgr = new RoomManager(42);
    room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.joinRoom(room.roomCode, 'pC');
    mgr.startGame(room.roomCode);

    room.phase = TurnPhase.AuctionPhase;
    room.players[0]!.position = 39;
    room.players[0]!.balance = 10_000;
    room.players[1]!.balance = 10_000;
    room.players[2]!.balance = 10_000;

    session = {
      cellIndex: 39, // TP.HCM (Quận 1 - Nguyễn Huệ), giá gốc 4.000 Tr.
      declinedPlayerId: 'pA',
      highestBid: 2_000, // 50% giá gốc
      passedPlayers: new Set<string>(),
      endTime: Date.now() + 15_000,
    };
  });

  // --- FACET 1: BOUNDARY TESTS (B01 - B09) ---

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/B01] Khi chưa có highestBidder, bid đúng bằng highestBid (khởi điểm 2.000) được chấp nhận', () => {
    const res = handleAuctionBid(room, session, 'pB', 2_000);
    expect(res.success).toBe(true);
    expect(session.highestBid).toBe(2_000);
    expect(session.highestBidder).toBe('pB');
  });

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/B02] Khi chưa có highestBidder, bid cao hơn startingBid + 50 (2.050) được chấp nhận', () => {
    const res = handleAuctionBid(room, session, 'pB', 2_050);
    expect(res.success).toBe(true);
    expect(session.highestBid).toBe(2_050);
    expect(session.highestBidder).toBe('pB');
  });

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/B03] Khi đã có highestBidder (2.050), bid tăng đúng +50 Tr. (2.100) được chấp nhận thành công', () => {
    session.highestBid = 2_050;
    session.highestBidder = 'pB';
    const res = handleAuctionBid(room, session, 'pC', 2_100);
    expect(res.success).toBe(true);
    expect(session.highestBid).toBe(2_100);
    expect(session.highestBidder).toBe('pC');
  });

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/B04] Khi đã có highestBidder (2.050), bid tăng đúng +100 Tr. (2.150) được chấp nhận thành công', () => {
    session.highestBid = 2_050;
    session.highestBidder = 'pB';
    const res = handleAuctionBid(room, session, 'pC', 2_150);
    expect(res.success).toBe(true);
    expect(session.highestBid).toBe(2_150);
    expect(session.highestBidder).toBe('pC');
  });

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/B05] Khi đã có highestBidder (2.050), bid tăng đúng +200 Tr. (2.250) được chấp nhận thành công', () => {
    session.highestBid = 2_050;
    session.highestBidder = 'pB';
    const res = handleAuctionBid(room, session, 'pC', 2_250);
    expect(res.success).toBe(true);
    expect(session.highestBid).toBe(2_250);
    expect(session.highestBidder).toBe('pC');
  });

  it('[UC-GAME-022/A1][BR-GAME-022][IMP-49/B06] Khi đã có highestBidder (2.050), bid tăng < 50 Tr. (2.099) bị từ chối với lý do BID_TOO_LOW', () => {
    session.highestBid = 2_050;
    session.highestBidder = 'pB';
    const res = handleAuctionBid(room, session, 'pC', 2_099);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('BID_TOO_LOW');
    expect(session.highestBid).toBe(2_050);
  });

  it('[UC-GAME-022/A1][BR-GAME-022][IMP-49/B07] Khi đã có highestBidder (2.050), bid bằng đúng highestBid hiện tại bị từ chối với lý do BID_TOO_LOW', () => {
    session.highestBid = 2_050;
    session.highestBidder = 'pB';
    const res = handleAuctionBid(room, session, 'pC', 2_050);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('BID_TOO_LOW');
  });

  it('[UC-GAME-022/A1][BR-GAME-022][IMP-49/B08] Bid số âm hoặc bằng 0 bị từ chối với lý do BID_TOO_LOW', () => {
    const resNeg = handleAuctionBid(room, session, 'pB', -500);
    const resZero = handleAuctionBid(room, session, 'pB', 0);
    expect(resNeg.success).toBe(false);
    expect(resNeg.reason).toBe('BID_TOO_LOW');
    expect(resZero.success).toBe(false);
    expect(resZero.reason).toBe('BID_TOO_LOW');
  });

  it('[UC-GAME-022/A1][BR-GAME-022][IMP-49/B09] Bid số thập phân không nguyên bị từ chối với lý do BID_TOO_LOW', () => {
    const resDec = handleAuctionBid(room, session, 'pB', 2050.5);
    expect(resDec.success).toBe(false);
    expect(resDec.reason).toBe('BID_TOO_LOW');
  });

  // --- FACET 2: STATE REACTIVITY TESTS (R01a - R03) ---

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/R01a] Đặt giá lượt 1 tăng +50 Tr. (2.050) chuyển người dẫn đầu sang pB', () => {
    const res = handleAuctionBid(room, session, 'pB', 2_050);
    expect(res.success).toBe(true);
    expect(session.highestBidder).toBe('pB');
    expect(session.highestBid).toBe(2_050);
  });

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/R01b] Đặt giá lượt 2 tăng tiếp +50 Tr. (2.100) chuyển người dẫn đầu sang pC', () => {
    session.highestBid = 2_050;
    session.highestBidder = 'pB';
    const res = handleAuctionBid(room, session, 'pC', 2_100);
    expect(res.success).toBe(true);
    expect(session.highestBidder).toBe('pC');
    expect(session.highestBid).toBe(2_100);
  });

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/R01c] Đặt giá lượt 3 tăng tiếp +50 Tr. (2.150) chuyển người dẫn đầu lại về pB', () => {
    session.highestBid = 2_100;
    session.highestBidder = 'pC';
    const res = handleAuctionBid(room, session, 'pB', 2_150);
    expect(res.success).toBe(true);
    expect(session.highestBidder).toBe('pB');
    expect(session.highestBid).toBe(2_150);
  });

  it('[UC-GAME-022/A2][BR-GAME-022][IMP-49/R02] Người đang dẫn đầu không được tự đặt giá đè chính mình (ALREADY_HIGHEST_BIDDER)', () => {
    handleAuctionBid(room, session, 'pB', 2_050);
    const resSelf = handleAuctionBid(room, session, 'pB', 2_100);
    expect(resSelf.success).toBe(false);
    expect(resSelf.reason).toBe('ALREADY_HIGHEST_BIDDER');
  });

  it('[UC-GAME-022/A2][BR-GAME-022][IMP-49/R03] Người từ chối mua ô đất (declinedPlayerId) bị cấm vĩnh viễn không được đặt giá', () => {
    const res = handleAuctionBid(room, session, 'pA', 2_500);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.DECLINED_PLAYER_CANNOT_BID);
  });

  // --- FACET 3: RESOURCE DISPOSAL & ANTI-SNIPING TESTS (D01 - D02) ---

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/D01] Khi bid hợp lệ trong 3s cuối, thời gian kết thúc được gia hạn thêm +3.000ms (Anti-Sniping)', () => {
    const nearEnd = Date.now() + 2_000;
    session.endTime = nearEnd;
    const res = handleAuctionBid(room, session, 'pB', 2_050);
    expect(res.success).toBe(true);
    expect(session.endTime).toBeGreaterThanOrEqual(nearEnd + 3_000);
  });

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/D02] Khi tất cả đối thủ khác đã pass, handleAuctionBid tự động chốt phiên đấu giá', () => {
    session.passedPlayers = new Set(['pC']);
    const reg = new Map<number, string>();
    const auctions = new Map<string, AuctionSession>([['IMP49R', session]]);

    const res = handleAuctionBid(room, session, 'pB', 2_050, reg, auctions, 'IMP49R');
    expect(res.success).toBe(true);
    expect(reg.get(39)).toBe('pB');
    expect(room.players[1]!.balance).toBe(10_000 - 2_050);
  });

  // --- FACET 4: ERROR DEFENSE & RE-SYNC TESTS (E01 - E03) ---

  it('[UC-GAME-022/A1][BR-GAME-022][IMP-49/E01] Người chơi không đủ số dư bị từ chối INSUFFICIENT_FUNDS và không đổi highestBid', () => {
    room.players[1]!.balance = 1_000;
    const res = handleAuctionBid(room, session, 'pB', 2_050);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INSUFFICIENT_FUNDS');
    expect(session.highestBid).toBe(2_000);
    expect(session.highestBidder).toBeUndefined();
  });

  it('[UC-GAME-022/MSS][BR-GAME-022][IMP-49/E02] RoomManager tiếp nhận INTENT_BID bước giá +50 Tr. qua FSM', () => {
    testRoomDecline(room, mgr);
    const bid1 = mgr.handlePlayerIntent(room.roomCode, 'pB', { type: 'INTENT_BID', amount: 2_050 });
    const bid2 = mgr.handlePlayerIntent(room.roomCode, 'pC', { type: 'INTENT_BID', amount: 2_100 });
    expect(bid1.success).toBe(true);
    expect(bid2.success).toBe(true);
    expect(room.currentAuction?.highestBidder).toBe('pC');
    expect(room.currentAuction?.highestBid).toBe(2_100);
  });

  it('[UC-GAME-022/A1][BR-GAME-022][IMP-49/E03] Khi Intent bid bị từ chối trên WssServer, server kích hoạt broadcastRoomDelta để đồng bộ lại trạng thái thực', async () => {
    const server = new WssServer({ port: 0 });
    try {
      const roomMgr = server.getRoomManager();
      const serverRoom = roomMgr.createRoom('pA');
      roomMgr.joinRoom(serverRoom.roomCode, 'pB');
      roomMgr.startGame(serverRoom.roomCode);

      serverRoom.players[0]!.position = 1;
      serverRoom.phase = TurnPhase.ActionPhase;
      roomMgr.handleDecline(serverRoom.roomCode, 'pA');

      const broadcastSpy = vi.spyOn((server as any).broadcaster, 'broadcastRoomDelta');
      const mockWs = { send: vi.fn(), readyState: 1 };

      // Gửi INTENT_BID với giá quá thấp (amount = 100 < 50% = 300)
      await (server as any).handleIntent(mockWs, {
        type: 'INTENT',
        roomCode: serverRoom.roomCode,
        playerId: 'pB',
        intent: { type: 'INTENT_BID', amount: 100 },
      });

      // Server phát sóng delta phòng ngay lập tức để đồng bộ dập tắt state ảo
      expect(broadcastSpy).toHaveBeenCalledWith(serverRoom.roomCode);
      expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining('BID_TOO_LOW'));
    } finally {
      server.close();
    }
  });
});

function testRoomDecline(room: Room, mgr: RoomManager): void {
  room.phase = TurnPhase.ActionPhase;
  room.players[0]!.position = 39;
  mgr.handleDecline(room.roomCode, 'pA');
}
