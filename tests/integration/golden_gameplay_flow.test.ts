// [UC-GAME-001..050/MSS] Golden Gameplay Flow — Slice 00 đến Slice 04
// Traceability: Slice 00 (Room/Session), Slice 01 (Turn FSM/Dice/GO),
//               Slice 02 (Buy Property/Base Rent), Slice 03 (Monopoly/C1 Upgrade/Auction/ETC),
//               Slice 04 (HOSE Market/TaxOrder Audit Bailout)

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, INITIAL_BALANCE, GO_BONUS } from '../../src/domain/room';
import type { Room } from '../../src/domain/room';
function setupGame(seed = 42): { mgr: RoomManager; room: Room } {
  const mgr = new RoomManager(seed);
  const room = mgr.createRoom('P1');
  mgr.joinRoom(room.roomCode, 'P2');
  mgr.startGame(room.roomCode);
  return { mgr, room };
}

function step2_P1RollAndPassGo(mgr: RoomManager, room: Room): void {
  // P1 bắt đầu từ ô 34, với seed 42 lần tung 1 cho total=7 -> ô (34+7)%40 = 1 (Cần Thơ - Cái Răng)
  room.players[0]!.position = 34;
  const roll1 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll1, 'P1 phải tung xúc xắc thành công').toBeDefined();
  expect(roll1!.passedGo, 'P1 phải vượt qua ô GO').toBe(true);
  expect(roll1!.player.position, 'P1 dừng chân tại ô 01 (Cần Thơ - Cái Răng)').toBe(1);
  expect(roll1!.rentCharged, 'Ô 01 chưa có chủ nên phí thuê là 0').toBe(0);
  expect(room.players[0]!.balance, 'Quỹ tiền P1 tăng +2.000 lên 17.000').toBe(17_000);
  expect(room.players[1]!.balance, 'Quỹ tiền P2 giữ nguyên 15.000').toBe(15_000);
  expect(room.phase, 'FSM chuyển sang ActionPhase do ô 01 chưa có chủ').toBe(TurnPhase.ActionPhase);
}

function step3_P1BuyCell1(mgr: RoomManager, room: Room): void {
  // P1 gửi Intent BUY mua ô 01 với giá 600
  const buyRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_BUY' });
  expect(buyRes.success, 'P1 mua ô 01 thành công').toBe(true);
  expect(room.players[0]!.balance, 'Quỹ tiền P1 còn 16.400 (17.000 - 600)').toBe(16_400);
  expect(mgr.getPropertyOwner(room.roomCode, 1), 'P1 là chủ sở hữu ô 01 trong registry').toBe('P1');
  expect(mgr.getPropertyRent(room.roomCode, 1), 'Mức thuê đất nền ô 01 là 60').toBe(60);
  expect(room.phase, 'FSM chuyển sang PropertyManagement').toBe(TurnPhase.PropertyManagement);

  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P1 kết thúc lượt thành công').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2').toBe(1);
  expect(room.phase, 'FSM ở WaitingRoll chờ P2').toBe(TurnPhase.WaitingRoll);
}

function step4_P2PayRentCell1(mgr: RoomManager, room: Room): void {
  // P2 bắt đầu từ ô 30, lần tung 2 cho total=11 -> ô (30+11)%40 = 1 (ô 01 của P1)
  room.players[1]!.position = 30;
  const roll2 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll2, 'P2 phải tung xúc xắc thành công').toBeDefined();
  expect(roll2!.passedGo, 'P2 vượt qua ô GO').toBe(true);
  expect(roll2!.player.position, 'P2 dừng tại ô 01 của P1').toBe(1);
  expect(roll2!.rentCharged, 'P2 bị thu 60 tiền thuê').toBe(60);
  expect(room.players[0]!.balance, 'P1 nhận 60 tiền thuê (16.400 + 60 = 16.460)').toBe(16_460);
  expect(room.players[1]!.balance, 'P2 nhận 2.000 GO trừ 60 thuê (15.000 + 2.000 - 60 = 16.940)').toBe(16_940);
  expect(room.phase, 'FSM chuyển sang PropertyManagement').toBe(TurnPhase.PropertyManagement);

  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P2 kết thúc lượt').toBe(true);
  expect(room.currentPlayerIndex, 'Lượt quay lại P1').toBe(0);
  expect(room.phase, 'FSM ở WaitingRoll chờ P1').toBe(TurnPhase.WaitingRoll);
}

function step5_P1MonopolyAndUpgradeC1(mgr: RoomManager, room: Room): void {
  // P1 bắt đầu từ ô 37, lần tung 3 cho total=6 -> ô (37+6)%40 = 3 (An Giang - Châu Đốc)
  room.players[0]!.position = 37;
  const roll3 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll3?.player.position, 'P1 dừng chân tại ô 03').toBe(3);
  expect(roll3?.passedGo, 'P1 vượt qua ô GO nhận 2.000').toBe(true);
  expect(room.players[0]!.balance, 'P1 có 18.460 (16.460 + 2.000)').toBe(18_460);

  const buyRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_BUY' });
  expect(buyRes.success, 'P1 mua ô 03 thành công').toBe(true);
  expect(room.players[0]!.balance, 'P1 trừ 600 mua ô 03 còn 17.860').toBe(17_860);
  expect(mgr.getPropertyOwner(room.roomCode, 3), 'P1 sở hữu ô 03').toBe('P1');

  // P1 hoàn thành Monopoly Nâu (ô 01 + ô 03), nâng cấp ô 01 lên C1 Shophouse (chi phí 300)
  const upRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_UPGRADE', cellIndex: 1 });
  expect(upRes.success, 'P1 nâng cấp C1 Shophouse ô 01 thành công').toBe(true);
  expect(room.players[0]!.balance, 'P1 trừ 300 phí C1 còn 17.560').toBe(17_560);
  expect(room.players[1]!.balance, 'P2 giữ nguyên 16.940').toBe(16_940);
  expect(mgr.getPropertyState(room.roomCode, 1)?.level, 'Cấp độ công trình ô 01 là 1 (C1)').toBe(1);
  expect(mgr.getPropertyRent(room.roomCode, 1), 'Mức thuê mới C1 ô 01 tăng lên 210').toBe(210);

  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P1 kết thúc lượt').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2').toBe(1);
  expect(room.phase, 'FSM ở WaitingRoll chờ P2').toBe(TurnPhase.WaitingRoll);
}

function step6_P2DeclineAndAuction(mgr: RoomManager, room: Room): void {
  // P2 bắt đầu từ ô 39, lần tung 4 cho total=6 -> ô (39+6)%40 = 5 (Cảng HKQT Long Thành)
  room.players[1]!.position = 39;
  const roll4 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll4?.player.position, 'P2 dừng chân tại ô 05 (Cảng Long Thành)').toBe(5);
  expect(roll4?.passedGo, 'P2 vượt qua ô GO nhận 2.000').toBe(true);
  expect(room.players[1]!.balance, 'P2 có 18.940 (16.940 + 2.000)').toBe(18_940);
  expect(room.phase, 'FSM ở ActionPhase').toBe(TurnPhase.ActionPhase);

  const decRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_DECLINE' });
  expect(decRes.success, 'P2 từ chối mua ô 05').toBe(true);
  expect(room.phase, 'FSM mở phiên AuctionPhase tự động').toBe(TurnPhase.AuctionPhase);

  const bidRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_BID', amount: 1_200 });
  expect(bidRes.success, 'P1 đặt giá đấu 1.200 hợp lệ').toBe(true);

  const closeRes = mgr.handleAuctionClose(room.roomCode);
  expect(closeRes.winnerId, 'P1 chiến thắng phiên đấu giá ô 05').toBe('P1');
  expect(closeRes.winningBid, 'Giá trúng đấu là 1.200').toBe(1_200);
  expect(room.players[0]!.balance, 'P1 trừ 1.200 thắng đấu giá còn 16.360').toBe(16_360);
  expect(room.players[1]!.balance, 'P2 giữ nguyên 18.940').toBe(18_940);
  expect(mgr.getPropertyOwner(room.roomCode, 5), 'P1 sở hữu ô 05').toBe('P1');
  expect(mgr.getPropertyRent(room.roomCode, 5), 'Mức phí 1 Ga ban đầu là 500').toBe(500);
  expect(room.phase, 'FSM trở lại PropertyManagement').toBe(TurnPhase.PropertyManagement);

  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P2 kết thúc lượt sau đấu giá').toBe(true);
  expect(room.currentPlayerIndex, 'Lượt chuyển sang P1').toBe(0);
  expect(room.phase, 'FSM ở WaitingRoll chờ P1').toBe(TurnPhase.WaitingRoll);
}

function step7_P1ETCAndP2RailroadFee(mgr: RoomManager, room: Room): void {
  // P1 bắt đầu từ ô 6, lần tung 5 cho total=9 -> ô (6+9)%40 = 15 (Cảng Nước Sâu Cái Mép)
  room.players[0]!.position = 6;
  const roll5 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll5?.player.position, 'P1 dừng chân tại ô 15').toBe(15);
  expect(roll5?.passedGo, 'P1 không vượt GO').toBe(false);

  const buyRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_BUY' });
  expect(buyRes.success, 'P1 mua ô Hạ tầng thứ 2 (ô 15, giá 2.000) thành công').toBe(true);
  expect(room.players[0]!.balance, 'P1 trừ 2.000 còn 14.360').toBe(14_360);
  expect(mgr.getPropertyOwner(room.roomCode, 15), 'P1 sở hữu ô 15').toBe('P1');
  expect(mgr.getPropertyRent(room.roomCode, 5), 'Phí cơ bản khi sở hữu 2 ô Hạ tầng là 1.000').toBe(1_000);

  const etcRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_UPGRADE_ETC' });
  expect(etcRes.success, 'P1 nâng cấp gói ETC cho 2 ô Hạ tầng thành công').toBe(true);
  expect(room.players[0]!.balance, 'P1 trừ 3.000 chi phí ETC còn 11.360').toBe(11_360);
  expect(mgr.getPropertyState(room.roomCode, 5)?.isETC, 'Ô 05 kích hoạt ETC').toBe(true);
  expect(mgr.getPropertyState(room.roomCode, 15)?.isETC, 'Ô 15 kích hoạt ETC').toBe(true);
  expect(mgr.getPropertyRent(room.roomCode, 5), 'Phí ô 05 có ETC tăng lên 1.500').toBe(1_500);
  expect(mgr.getPropertyRent(room.roomCode, 15), 'Phí ô 15 có ETC tăng lên 1.500').toBe(1_500);

  mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2').toBe(1);
  expect(room.phase, 'FSM ở WaitingRoll chờ P2').toBe(TurnPhase.WaitingRoll);

  // P2 bắt đầu từ ô 37, lần tung 6 cho total=8 -> ô (37+8)%40 = 5 (Cảng HKQT Long Thành của P1)
  room.players[1]!.position = 37;
  const roll6 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll6?.player.position, 'P2 dẫm vào ô Hạ tầng 05 của P1').toBe(5);
  expect(roll6?.passedGo, 'P2 vượt GO nhận +2.000').toBe(true);
  expect(roll6?.rentCharged, 'Phí Hạ tầng 2 ô có ETC thu đúng 1.500 (1.000 x 1.5)').toBe(1_500);
  expect(room.players[0]!.balance, 'P1 nhận 1.500 phí Hạ tầng (11.360 + 1.500 = 12.860)').toBe(12_860);
  expect(room.players[1]!.balance, 'P2 nhận 2.000 GO trừ 1.500 phí Hạ tầng (18.940 + 2.000 - 1.500 = 19.440)').toBe(19_440);

  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P2 kết thúc lượt sau khi nộp phí Hạ tầng').toBe(true);
  expect(room.currentPlayerIndex, 'Lượt quay trở lại P1').toBe(0);
  expect(room.phase, 'FSM ở WaitingRoll chờ P1').toBe(TurnPhase.WaitingRoll);
}

function step8_P1HoseInvestment(mgr: RoomManager, room: Room): void {
  // P1 bắt đầu từ ô 31, lần tung 7 cho total=7 -> ô (31+7)%40 = 38 (Sàn HOSE)
  room.players[0]!.position = 31;
  const roll7 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll7, 'P1 phải tung xúc xắc thành công').toBeDefined();
  expect(roll7!.passedGo, 'P1 không vượt qua ô GO').toBe(false);
  expect(roll7!.player.position, 'P1 dừng chân tại ô 38 (Sàn HOSE)').toBe(38);
  expect(roll7!.rentCharged, 'Ô 38 không tính tiền thuê').toBe(0);
  expect(room.phase, 'FSM tự động chuyển sang HosePhase').toBe(TurnPhase.HosePhase);

  // P1 gửi INTENT_INVEST với stake = 2.000 Tr.
  const investRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_INVEST', stake: 2_000 });
  expect(investRes.success, 'P1 đầu tư sàn HOSE thành công').toBe(true);
  // Với seed 42, 1D6 HOSE đổ ra mặt 2 (tỷ lệ 0.75) -> payout = 1.500 -> balance = 12.860 - 2.000 + 1.500 = 12.360
  expect(room.players[0]!.balance, 'Quỹ tiền P1 cập nhật payout HOSE (12.860 - 2.000 + 1.500 = 12.360)').toBe(12_360);
  expect(room.phase, 'FSM chuyển tiếp sang PropertyManagement').toBe(TurnPhase.PropertyManagement);

  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P1 kết thúc lượt sau khi tham gia sàn HOSE').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2').toBe(1);
  expect(room.phase, 'FSM ở WaitingRoll chờ P2').toBe(TurnPhase.WaitingRoll);
}

function step9_P2TaxOrderAndAuditBailOut(mgr: RoomManager, room: Room): void {
  // P2 bắt đầu từ ô 21, lần tung 8 cho total=9 -> ô (21+9)%40 = 30 (Lệnh Thanh Tra Thuế)
  room.players[1]!.position = 21;
  const roll8 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll8, 'P2 phải tung xúc xắc thành công').toBeDefined();
  expect(roll8!.passedGo, 'P2 không vượt qua ô GO').toBe(false);
  expect(roll8!.rentCharged, 'Ô 30 không thu tiền thuê').toBe(0);
  // FSM tự động áp giải P2 về ô 10 (Trạm Kiểm Toán) và phong tỏa 3 lượt
  expect(room.players[1]!.position, 'P2 bị áp giải về ô 10 (Trạm Kiểm Toán)').toBe(10);
  expect(room.players[1]!.auditTurnsLeft, 'P2 bị phong tỏa auditTurnsLeft = 3').toBe(3);
  expect(room.phase, 'FSM chuyển sang PropertyManagement tại Trạm Kiểm Toán').toBe(TurnPhase.PropertyManagement);

  // P2 gửi INTENT_BAIL_OUT nộp tiền bảo lãnh 500 Tr. VNĐ
  const bailRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_BAIL_OUT' });
  expect(bailRes.success, 'P2 nộp tiền bảo lãnh thành công').toBe(true);
  expect(room.players[1]!.balance, 'P2 bị trừ 500 Tr. tiền bảo lãnh (19.440 - 500 = 18.940)').toBe(18_940);
  expect(room.players[1]!.auditTurnsLeft, 'auditTurnsLeft của P2 về 0').toBe(0);
  expect(room.phase, 'FSM khôi phục trạng thái PropertyManagement để kết thúc lượt').toBe(TurnPhase.PropertyManagement);

  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P2 kết thúc lượt sau khi bảo lãnh thành công').toBe(true);
  expect(room.currentPlayerIndex, 'Lượt quay trở lại P1').toBe(0);
  expect(room.phase, 'FSM ở WaitingRoll chờ P1').toBe(TurnPhase.WaitingRoll);
}

describe('[UC-GAME-001..050/MSS] Golden Gameplay Flow — Slice 00 đến Slice 04', () => {
  it('[TC-E2E-GOLDEN/MSS] Mô phỏng ván đấu liên hoàn hoàn chỉnh giữa P1 và P2', () => {
    // 1. [Khởi tạo - Slice 00]: Tạo phòng với 2 người chơi (vốn 15.000)
    const { mgr, room } = setupGame(42);
    expect(room.started, 'Phòng đấu đã bắt đầu').toBe(true);
    expect(room.phase, 'Trạng thái khởi tạo WaitingRoll').toBe(TurnPhase.WaitingRoll);
    expect(room.players, 'Số lượng người chơi đúng 2').toHaveLength(2);
    expect(room.players[0]!.balance, 'Vốn P1 khởi điểm 15.000').toBe(INITIAL_BALANCE);
    expect(room.players[1]!.balance, 'Vốn P2 khởi điểm 15.000').toBe(INITIAL_BALANCE);
    expect(room.currentPlayerIndex, 'P1 đi trước').toBe(0);

    // 2. [Vòng lặp lượt - Slice 01]: P1 tung xúc xắc vượt qua ô GO
    step2_P1RollAndPassGo(mgr, room);

    // 3. [Mua BĐS đất nền - Slice 02]: P1 mua ô 01 và kết thúc lượt
    step3_P1BuyCell1(mgr, room);

    // 4. [Thu tiền thuê cơ bản - Slice 02]
    step4_P2PayRentCell1(mgr, room);

    // 5. [Monopoly & Nâng cấp C1 - Slice 03]
    step5_P1MonopolyAndUpgradeC1(mgr, room);

    // 6. [Từ chối mua & Đấu giá tự động - Slice 03]
    step6_P2DeclineAndAuction(mgr, room);

    // 7. [Hạ tầng Giao thông & Gói ETC - Slice 03]
    step7_P1ETCAndP2RailroadFee(mgr, room);

    // 8. [Sàn Chứng Khoán HOSE - Slice 04]
    step8_P1HoseInvestment(mgr, room);

    // 9. [Lệnh Thu Thuế & Giải cứu Trạm Kiểm Toán - Slice 04]
    step9_P2TaxOrderAndAuditBailOut(mgr, room);
  });
});
