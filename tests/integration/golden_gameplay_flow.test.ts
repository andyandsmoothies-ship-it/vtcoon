// [UC-GAME-001..050/MSS] Golden Gameplay Flow — Slice 00 đến Slice 04
// Traceability: Slice 00 (Room/Session), Slice 01 (Turn FSM/Dice/GO),
//               Slice 02 (Buy Property/Base Rent), Slice 03 (Monopoly/C1 Upgrade/Auction/ETC),
//               Slice 04 (HOSE Market/TaxOrder Audit Bailout)

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, INITIAL_BALANCE, GO_BONUS } from '../../src/domain/room';
import type { Room } from '../../src/domain/room';
import { ChanceCardId } from '../../src/domain/event_card_engine';
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


// [Hotfix] Step 10: P1 vượt ô GO — Nhận 2.000 Tr., tự động trừ Thuế tài sản lũy tiến (P1 sở hữu 4 ô → 600)
function step10_P1PassGOWithPropertyTax(mgr: RoomManager, room: Room): void {
  // P1 bắt đầu từ ô 36, DiceRoll 9 cho total=5 → ô (36+5)%40 = 1 (ô 01 - P1 đã sở hữu)
  room.players[0]!.position = 36;
  const roll9 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll9, 'P1 phải tung xúc xắc thành công').toBeDefined();
  expect(roll9!.player.position, 'P1 dừng chân tại ô 01 (sở hữu của P1)').toBe(1);
  expect(roll9!.passedGo, 'P1 vượt qua ô GO').toBe(true);
  // P1 sở hữu 4 ô (1, 3, 5, 15), ownedCount=4 >= 4 → property_tax = 150×4 = 600
  // Net GO bonus = 2000 - 600 = 1400 → balance = 12360 + 1400 = 13760
  expect(room.players[0]!.balance, 'P1 nhận 1400 Tr. (2000 GO - 600 thuế tài sản): 12360 + 1400 = 13760').toBe(13_760);
  expect(room.phase, 'FSM chuyển sang PropertyManagement (đất đã sở hữu)').toBe(TurnPhase.PropertyManagement);

  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P1 kết thúc lượt').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2').toBe(1);
  expect(room.phase, 'FSM ở WaitingRoll chờ P2').toBe(TurnPhase.WaitingRoll);
}

// [Hotfix] Step 11: P2 dừng ô 04 (Lệ Phí Đất Đai) sau khi vượt GO — Thuế tài sản 0 (P2 không có ô)
function step11_P2TaxCellAfterGO(mgr: RoomManager, room: Room): void {
  // P2 bắt đầu từ ô 35, DiceRoll 10 cho total=9 → ô (35+9)%40 = 4 (Lệ Phí Đất Đai)
  room.players[1]!.position = 35;
  const roll10 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll10, 'P2 phải tung xúc xắc thành công').toBeDefined();
  expect(roll10!.player.position, 'P2 dừng chân tại ô 04 (Lệ Phí Đất Đai)').toBe(4);
  expect(roll10!.passedGo, 'P2 vượt qua ô GO').toBe(true);
  // P2 không có tài sản → thuế tài sản lũy tiến = 0 → nhận đủ 2.000 GO bonus
  // Sau GO: 18940 + 2000 = 20940
  // Lệ Phí Đất Đai 10%: min(2000, floor(20940*0.1)) = min(2000, 2094) = 2000 (capped)
  // P2 balance sau thuế: 20940 - 2000 = 18940 (thuế tối đa 2.000 Tr. bị giới hạn)
  expect(room.players[1]!.balance, 'P2 nhận GO +2000 (thuế tài sản=0), nộp lệ phí đất đai tối đa 2000 (20940-2000=18940)').toBe(18_940);
  expect(room.phase, 'FSM chuyển sang PropertyManagement tại ô Tax').toBe(TurnPhase.PropertyManagement);

  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P2 kết thúc lượt').toBe(true);
  expect(room.currentPlayerIndex, 'Lượt quay về P1').toBe(0);
  expect(room.phase, 'FSM ở WaitingRoll chờ P1').toBe(TurnPhase.WaitingRoll);
}

// [Hotfix] Step 12: P1 từ chối mua ô 06 → Auto-Auction → P2 AUCTION_PASS → chốt phiên không người thắng
function step12_P1DeclineAutoAuctionNoWinner(mgr: RoomManager, room: Room): void {
  // P1 bắt đầu từ ô 01 (vừa dừng ở step10), DiceRoll 11 cho total=5 → ô (1+5)%40 = 6 (Bình Dương - chưa có chủ)
  room.players[0]!.position = 1;
  const roll11 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll11, 'P1 phải tung xúc xắc thành công').toBeDefined();
  expect(roll11!.player.position, 'P1 dừng chân tại ô 06 (Bình Dương - chưa có chủ)').toBe(6);
  expect(roll11!.passedGo, 'P1 không vượt ô GO').toBe(false);
  expect(room.phase, 'FSM ở ActionPhase do ô 06 chưa có chủ').toBe(TurnPhase.ActionPhase);

  // P1 từ chối mua → Auto-Auction mở, declinedPlayerId = 'P1'
  const decRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_DECLINE' });
  expect(decRes.success, 'P1 từ chối mua ô 06 thành công').toBe(true);
  expect(room.phase, 'FSM mở phiên AuctionPhase tự động').toBe(TurnPhase.AuctionPhase);

  // P1 bị cấm đặt giá (người từ chối) — thử BID → phải bị từ chối
  const forbiddenBid = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_BID', amount: 600 });
  expect(forbiddenBid.success, 'P1 (người từ chối) bị cấm đặt giá').toBe(false);
  expect(forbiddenBid.reason, 'Lý do: DECLINED_PLAYER_CANNOT_BID').toBe('DECLINED_PLAYER_CANNOT_BID');

  // P2 gửi INTENT_AUCTION_PASS → không có người đặt giá → phiên tự chốt, không có người thắng
  const passRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_AUCTION_PASS' });
  expect(passRes.success, 'P2 gửi AUCTION_PASS thành công').toBe(true);
  // Sau khi tất cả người hợp lệ pass, phiên tự động chốt → PropertyManagement
  expect(room.phase, 'FSM trở về PropertyManagement sau khi chốt phiên').toBe(TurnPhase.PropertyManagement);
  // Ô 06 không có chủ sở hữu (phiên không có người đặt giá)
  expect(mgr.getPropertyOwner(room.roomCode, 6), 'Ô 06 không có chủ (phiên đấu giá không có người thắng)').toBeUndefined();
  // Số dư hai bên không thay đổi
  expect(room.players[0]!.balance, 'Số dư P1 giữ nguyên 13.760').toBe(13_760);
  expect(room.players[1]!.balance, 'Số dư P2 giữ nguyên 18.940').toBe(18_940);

  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P1 kết thúc lượt sau phiên đấu giá').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2').toBe(1);
  expect(room.phase, 'FSM ở WaitingRoll chờ P2').toBe(TurnPhase.WaitingRoll);
}

// [Hotfix] Step 13: P2 dừng ô Cơ Hội (ô 07) → rút thẻ CC_PLATE_AUCTION (+1 lượt đi tiếp)
function step13_P2ChanceCardPlateAuction(mgr: RoomManager, room: Room): void {
  // Tiêm thẻ CC_PLATE_AUCTION lên đầu deck để kết quả xác định
  room.chanceDeck = [
    ChanceCardId.CC_PLATE_AUCTION,
    ...room.chanceDeck.filter((c) => c !== ChanceCardId.CC_PLATE_AUCTION),
  ];

  // P2 bắt đầu từ ô 04, DiceRoll 12 cho total=3 → ô (4+3)%40 = 7 (Phiếu Cơ Hội)
  room.players[1]!.position = 4;
  const roll12 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll12, 'P2 phải tung xúc xắc thành công').toBeDefined();
  expect(roll12!.player.position, 'P2 dừng chân tại ô 07 (Phiếu Cơ Hội)').toBe(7);
  expect(roll12!.passedGo, 'P2 không vượt ô GO').toBe(false);
  // CC_PLATE_AUCTION: balance -500, extraTurns +1, consecutiveDoubles +1
  // P2 balance: 18940 - 500 = 18440
  expect(room.players[1]!.balance, 'P2 bị trừ 500 Tr. phí biển số (18940 - 500 = 18440)').toBe(18_440);
  expect(room.players[1]!.extraTurns, 'P2 nhận +1 lượt đi tiếp (extraTurns = 1)').toBe(1);
  expect(room.phase, 'FSM chuyển sang PropertyManagement sau khi rút thẻ Cơ Hội').toBe(TurnPhase.PropertyManagement);

  // P2 kết thúc lượt → extraTurns > 0 → lượt không chuyển, P2 được thêm 1 lượt
  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P2 kết thúc lượt với extra turn').toBe(true);
  expect(room.currentPlayerIndex, 'Lượt vẫn ở P2 do extraTurns được kích hoạt').toBe(1);
  expect(room.players[1]!.extraTurns, 'extraTurns P2 giảm về 0 sau khi tiêu').toBe(0);
  expect(room.phase, 'FSM quay về WaitingRoll cho P2 lượt bổ sung').toBe(TurnPhase.WaitingRoll);
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

    // 10. [Hotfix] Vượt ô GO - Nhận 2.000 Tr. trừ Thuế tài sản lũy tiến (P1 có 4 ô → tax=600)
    step10_P1PassGOWithPropertyTax(mgr, room);

    // 11. [Hotfix] Dừng ô Tax (ô04) sau khi vượt GO - Lệ Phí Đất Đai 10% & PropertyManagement
    step11_P2TaxCellAfterGO(mgr, room);

    // 12. [Hotfix] Từ chối mua → Auto-Auction → AUCTION_PASS → chốt phiên không người thắng
    step12_P1DeclineAutoAuctionNoWinner(mgr, room);

    // 13. [Hotfix] Thẻ Cơ Hội CC_PLATE_AUCTION → +1 lượt đi tiếp
    step13_P2ChanceCardPlateAuction(mgr, room);
  });
});

