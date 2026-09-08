// [UC-GAME-001..032/MSS] End-to-End Golden Gameplay Flow (Slice 00 -> Slice 03)
// Traceability: Slice 00 (Room/Session), Slice 01 (Turn FSM/Dice/GO),
//               Slice 02 (Buy Property/Base Rent), Slice 03 (Monopoly/C1 Upgrade/Auction/ETC)

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
  // P1 bắt đầu từ ô 34, với seed 42 lần tung 1 cho total=7 -> ô (34+7)%40 = 1 (Ba Đình)
  room.players[0]!.position = 34;
  const roll1 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll1, 'P1 phải tung xúc xắc thành công').toBeDefined();
  expect(roll1!.passedGo, 'P1 phải vượt qua ô GO').toBe(true);
  expect(roll1!.player.position, 'P1 dừng chân tại ô 01 (Ba Đình)').toBe(1);
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
  // P1 bắt đầu từ ô 37, lần tung 3 cho total=6 -> ô (37+6)%40 = 3 (Hoàn Kiếm)
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
  // P2 bắt đầu từ ô 39, lần tung 4 cho total=6 -> ô (39+6)%40 = 5 (Ga Hà Nội)
  room.players[1]!.position = 39;
  const roll4 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll4?.player.position, 'P2 dừng chân tại ô 05').toBe(5);
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
  // P1 bắt đầu từ ô 6, lần tung 5 cho total=9 -> ô (6+9)%40 = 15 (Pennsylvania Railroad)
  room.players[0]!.position = 6;
  const roll5 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll5?.player.position, 'P1 dừng chân tại ô 15').toBe(15);
  expect(roll5?.passedGo, 'P1 không vượt GO').toBe(false);

  const buyRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_BUY' });
  expect(buyRes.success, 'P1 mua ô Ga thứ 2 (ô 15, giá 2.000) thành công').toBe(true);
  expect(room.players[0]!.balance, 'P1 trừ 2.000 còn 14.360').toBe(14_360);
  expect(mgr.getPropertyOwner(room.roomCode, 15), 'P1 sở hữu ô 15').toBe('P1');
  expect(mgr.getPropertyRent(room.roomCode, 5), 'Phí cơ bản khi sở hữu 2 Ga là 1.000').toBe(1_000);

  const etcRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_UPGRADE_ETC' });
  expect(etcRes.success, 'P1 nâng cấp gói ETC cho 2 Ga xe lửa thành công').toBe(true);
  expect(room.players[0]!.balance, 'P1 trừ 3.000 chi phí ETC còn 11.360').toBe(11_360);
  expect(mgr.getPropertyState(room.roomCode, 5)?.isETC, 'Ô 05 kích hoạt ETC').toBe(true);
  expect(mgr.getPropertyState(room.roomCode, 15)?.isETC, 'Ô 15 kích hoạt ETC').toBe(true);
  expect(mgr.getPropertyRent(room.roomCode, 5), 'Phí ô 05 có ETC tăng lên 1.500').toBe(1_500);
  expect(mgr.getPropertyRent(room.roomCode, 15), 'Phí ô 15 có ETC tăng lên 1.500').toBe(1_500);

  mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2').toBe(1);
  expect(room.phase, 'FSM ở WaitingRoll chờ P2').toBe(TurnPhase.WaitingRoll);

  // P2 bắt đầu từ ô 37, lần tung 6 cho total=8 -> ô (37+8)%40 = 5 (Ga Hà Nội của P1)
  room.players[1]!.position = 37;
  const roll6 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll6?.player.position, 'P2 dẫm vào ô Ga 05 của P1').toBe(5);
  expect(roll6?.passedGo, 'P2 vượt GO nhận +2.000').toBe(true);
  expect(roll6?.rentCharged, 'Phí Railroad 2 ô có ETC thu đúng 1.500 (1.000 x 1.5)').toBe(1_500);
  expect(room.players[0]!.balance, 'P1 nhận 1.500 phí Ga (11.360 + 1.500 = 12.860)').toBe(12_860);
  expect(room.players[1]!.balance, 'P2 nhận 2.000 GO trừ 1.500 phí Ga (18.940 + 2.000 - 1.500 = 19.440)').toBe(19_440);
}

describe('[UC-GAME-001..032/MSS] Golden Gameplay Flow — Slice 00 den Slice 03', () => {
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
  });
});
