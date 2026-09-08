// [UC-GAME-001..057/MSS] Multiplayer Gameplay Flow — E2E 3 Nguoi Choi (P1, P2, P3)
// Traceability: Slice 00 (Room/Session), Slice 01 (Turn FSM/Dice/GO),
//               Slice 02 (Buy Property/Base Rent), Slice 03 (Monopoly/C1 Upgrade/Downgrade/P2P Trade),
//               Slice 05 (Credit/Mortgage, GO Mortgage Interest, Insolvency & Bankruptcy Net Worth)

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, INITIAL_BALANCE, GO_BONUS } from '../../src/domain/room';
import type { Room } from '../../src/domain/room';

function setupGame(seed = 42): { mgr: RoomManager; room: Room } {
  const mgr = new RoomManager(seed);
  const room = mgr.createRoom('P1');
  mgr.joinRoom(room.roomCode, 'P2');
  mgr.joinRoom(room.roomCode, 'P3');
  mgr.startGame(room.roomCode);
  return { mgr, room };
}

function step1_P1BuyAndTradeToP2(mgr: RoomManager, room: Room): void {
  // P1 bắt đầu từ ô 34, với seed 42 lần tung 1 cho total=7 -> ô (34+7)%40 = 1 (Cần Thơ)
  room.players[0]!.position = 34;
  const roll1 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll1, 'P1 phải tung xúc xắc thành công').toBeDefined();
  expect(roll1!.passedGo, 'P1 phải vượt qua ô GO').toBe(true);
  expect(roll1!.player.position, 'P1 dừng chân tại ô 01 (Cần Thơ)').toBe(1);
  expect(room.players[0]!.balance, 'P1 nhận +2.000 GO lên 17.000').toBe(17_000);
  expect(room.phase, 'FSM chuyển sang ActionPhase do ô 01 chưa có chủ').toBe(TurnPhase.ActionPhase);

  // P1 mua ô 01 giá 600 Tr.
  const buyRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_BUY' });
  expect(buyRes.success, 'P1 mua ô 01 thành công').toBe(true);
  expect(room.players[0]!.balance, 'P1 trừ 600 mua ô 01 còn 16.400').toBe(16_400);
  expect(mgr.getPropertyOwner(room.roomCode, 1), 'P1 là chủ sở hữu ô 01').toBe('P1');
  expect(room.phase, 'FSM chuyển sang PropertyManagement').toBe(TurnPhase.PropertyManagement);

  // P1 bán ô 01 cho P2 với giá 1.000 Tr. VNĐ qua INTENT_TRADE_OFFER
  const tradeRes = mgr.handlePlayerIntent(room.roomCode, 'P1', {
    type: 'INTENT_TRADE_OFFER',
    sellerId: 'P1',
    buyerId: 'P2',
    cellIndex: 1,
    price: 1_000,
  });
  expect(tradeRes.success, 'Giao dịch P2P ô 01 thành công').toBe(true);
  // P2 bị trừ 1.000 + 50 (5% thuế) = 1.050 Tr. (15.000 - 1.050 = 13.950)
  expect(room.players[1]!.balance, 'P2 bị trừ 1.050 Tr. (1.000 giá + 50 thuế)').toBe(13_950);
  // P1 nhận đủ 1.000 Tr. (16.400 + 1.000 = 17.400)
  expect(room.players[0]!.balance, 'P1 nhận 1.000 Tr. từ P2 (16.400 + 1.000 = 17.400)').toBe(17_400);
  // Kho bạc nhận 50 Tr. tiền thuế
  expect(room.treasury, 'Kho bạc nhận 50 Tr. thuế chuyển nhượng').toBe(50);
  // Ô 01 chuyển chủ sang P2 trong registry
  expect(mgr.getPropertyOwner(room.roomCode, 1), 'Ô 01 thuộc quyền sở hữu của P2').toBe('P2');

  // P1 kết thúc lượt -> chuyển sang P2 (currentPlayerIndex = 1)
  const endRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(endRes.success, 'P1 kết thúc lượt thành công').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2').toBe(1);
  expect(room.phase, 'FSM ở WaitingRoll chờ P2').toBe(TurnPhase.WaitingRoll);
}

function step2_P2MonopolyUpgradeDowngradeAndP3Safe(mgr: RoomManager, room: Room): void {
  // P2 bắt đầu từ ô 32, lần tung 2 cho total=11 -> ô (32+11)%40 = 3 (An Giang)
  room.players[1]!.position = 32;
  const roll2 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll2, 'P2 tung xúc xắc thành công').toBeDefined();
  expect(roll2!.passedGo, 'P2 vượt qua ô GO nhận 2.000').toBe(true);
  expect(roll2!.player.position, 'P2 dừng chân tại ô 03 (An Giang)').toBe(3);
  expect(room.players[1]!.balance, 'P2 có 15.950 (13.950 + 2.000)').toBe(15_950);
  expect(room.phase, 'FSM ở ActionPhase do ô 03 chưa có chủ').toBe(TurnPhase.ActionPhase);

  // P2 mua ô 03 với giá 600 Tr. -> hoàn thành Monopoly Nâu (ô 01 + ô 03)
  const buyRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_BUY' });
  expect(buyRes.success, 'P2 mua ô 03 thành công').toBe(true);
  expect(room.players[1]!.balance, 'P2 trừ 600 mua ô 03 còn 15.350').toBe(15_350);
  expect(mgr.getPropertyOwner(room.roomCode, 3), 'P2 sở hữu ô 03').toBe('P2');
  expect(room.phase, 'FSM chuyển sang PropertyManagement').toBe(TurnPhase.PropertyManagement);

  // P2 nâng cấp ô 01 lên C1 Shophouse (chi phí 300 Tr.)
  const upRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_UPGRADE', cellIndex: 1 });
  expect(upRes.success, 'P2 nâng cấp C1 ô 01 thành công').toBe(true);
  expect(room.players[1]!.balance, 'P2 trừ 300 phí C1 còn 15.050').toBe(15_050);
  expect(mgr.getPropertyState(room.roomCode, 1)?.level, 'Cấp độ công trình ô 01 là 1 (C1)').toBe(1);

  // P2 hạ cấp ô 01 về C0, nhận lại đúng 50% chi phí xây dựng (+150 Tr.)
  const downRes = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_DOWNGRADE', cellIndex: 1 });
  expect(downRes.success, 'P2 hạ cấp ô 01 về C0 thành công').toBe(true);
  expect(room.players[1]!.balance, 'P2 nhận lại 150 Tr. hoàn trả còn 15.200').toBe(15_200);
  expect(mgr.getPropertyState(room.roomCode, 1)?.level, 'Cấp độ công trình ô 01 trở về 0 (C0)').toBe(0);

  // P2 chuyển nhượng ô 03 cho P1 qua INTENT_TRADE_OFFER (giá 600 Tr., thuế 30 Tr. nộp Kho bạc)
  const tradeRes = mgr.handlePlayerIntent(room.roomCode, 'P2', {
    type: 'INTENT_TRADE_OFFER',
    sellerId: 'P2',
    buyerId: 'P1',
    cellIndex: 3,
    price: 600,
  });
  expect(tradeRes.success, 'P2 chuyển nhượng ô 03 cho P1 thành công').toBe(true);
  expect(room.players[0]!.balance, 'P1 trừ 630 Tr. (600 + 30 thuế) còn 16.770').toBe(16_770);
  expect(room.players[1]!.balance, 'P2 nhận 600 Tr. còn 15.800').toBe(15_800);
  expect(room.treasury, 'Kho bạc tăng thêm 30 Tr. lên 80 Tr.').toBe(80);
  expect(mgr.getPropertyOwner(room.roomCode, 3), 'Ô 03 chuyển chủ sang P1').toBe('P1');

  // P2 kết thúc lượt -> chuyển sang P3 (currentPlayerIndex = 2)
  const endP2 = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  expect(endP2.success, 'P2 kết thúc lượt').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P3').toBe(2);
  expect(room.phase, 'FSM ở WaitingRoll chờ P3').toBe(TurnPhase.WaitingRoll);

  // P3 tung xúc xắc lần 3 (total=6), bắt đầu từ ô 14 -> dừng tại ô 20 (Nghỉ Dưỡng Miễn Phí / FreeParking)
  room.players[2]!.position = 14;
  const roll3 = mgr.handleRollDice(room.roomCode, 'P3');
  expect(roll3, 'P3 tung xúc xắc thành công').toBeDefined();
  expect(roll3!.player.position, 'P3 dừng an toàn tại ô 20 (FreeParking)').toBe(20);
  expect(roll3!.rentCharged, 'Ô FreeParking không thu phí').toBe(0);
  expect(room.players[2]!.balance, 'Số dư P3 giữ nguyên 15.000').toBe(INITIAL_BALANCE);
  expect(room.phase, 'FSM chuyển sang PropertyManagement tại FreeParking').toBe(TurnPhase.PropertyManagement);

  // P3 kết thúc lượt -> vòng lặp chuyển về P1 (currentPlayerIndex = 0)
  const endP3 = mgr.handlePlayerIntent(room.roomCode, 'P3', { type: 'INTENT_END_TURN' });
  expect(endP3.success, 'P3 kết thúc lượt an toàn').toBe(true);
  expect(room.currentPlayerIndex, 'Lượt quay trở lại P1').toBe(0);
  expect(room.phase, 'FSM ở WaitingRoll chờ P1').toBe(TurnPhase.WaitingRoll);
}

function step3_P1MortgageAndRedeemCell3(mgr: RoomManager, room: Room): void {
  // P1 đang sở hữu ô 03 (Cấp 0, giá 600 Tr.)
  expect(mgr.getPropertyOwner(room.roomCode, 3), 'P1 sở hữu ô 03').toBe('P1');

  // P1 tung xúc xắc lần 4 (total=6), bắt đầu từ ô 14 -> dừng tại ô 20 (FreeParking) không qua GO
  room.players[0]!.position = 14;
  const roll4 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll4, 'P1 tung xúc xắc thành công').toBeDefined();
  expect(roll4!.passedGo, 'P1 không vượt qua ô GO').toBe(false);
  expect(roll4!.player.position, 'P1 dừng chân tại ô 20').toBe(20);
  expect(room.phase, 'FSM chuyển sang PropertyManagement').toBe(TurnPhase.PropertyManagement);

  // Trong PropertyManagement, P1 gửi INTENT_MORTGAGE cầm cố ô 03: nhận 300 Tr. (50% giá đất)
  const p1BeforeMort = room.players[0]!.balance;
  const mortRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_MORTGAGE', cellIndex: 3 });
  expect(mortRes.success, 'P1 thế chấp ô 03 thành công').toBe(true);
  expect(room.players[0]!.balance, 'P1 nhận 300 Tr. tiền giải ngân thế chấp').toBe(p1BeforeMort + 300);
  expect(room.players[0]!.mortgagedProperties, 'Ô 03 vào danh sách mortgagedProperties').toContain(3);

  // P1 kết thúc lượt -> chuyển sang P2
  const endP1 = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(endP1.success, 'P1 kết thúc lượt sau khi thế chấp').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2').toBe(1);

  // P2 tung xúc xắc lần 5 (total=9), bắt đầu từ ô 11 -> dừng tại ô 20 (FreeParking), kết thúc lượt
  room.players[1]!.position = 11;
  const roll5 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll5?.player.position, 'P2 dừng an toàn tại ô 20').toBe(20);
  mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P3').toBe(2);

  // P3 tung xúc xắc lần 6 (total=8), bắt đầu từ ô 12 -> dừng tại ô 20 (FreeParking), kết thúc lượt
  room.players[2]!.position = 12;
  const roll6 = mgr.handleRollDice(room.roomCode, 'P3');
  expect(roll6?.player.position, 'P3 dừng an toàn tại ô 20').toBe(20);
  mgr.handlePlayerIntent(room.roomCode, 'P3', { type: 'INTENT_END_TURN' });
  expect(room.currentPlayerIndex, 'Lượt quay trở lại P1').toBe(0);
  expect(room.phase, 'FSM ở WaitingRoll chờ P1').toBe(TurnPhase.WaitingRoll);

  // P1 bắt đầu từ ô 36, lần tung 7 (total=7) -> ô (36+7)%40 = 3 (ô 03 của P1) vượt qua GO!
  room.players[0]!.position = 36;
  const p1BeforeGO = room.players[0]!.balance;
  const roll7 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll7, 'P1 tung xúc xắc qua GO thành công').toBeDefined();
  expect(roll7!.passedGo, 'P1 vượt qua ô GO').toBe(true);
  expect(roll7!.player.position, 'P1 dừng chân tại ô 03').toBe(3);

  // handleRollDice tự động kích hoạt collectMortgageInterest:
  // GO Bonus = +2.000 Tr., Thuế TS lũy tiến = 0 (P1 sở hữu 1 ô < 4 ô),
  // Lãi thế chấp 5% trên dư nợ 300 Tr. = floor(300 * 0.05) = 15 Tr.
  // Net thay đổi: +2.000 - 15 = +1.985 Tr.
  expect(room.players[0]!.balance, 'P1 nhận +2.000 GO và tự động khấu trừ 15 Tr. lãi vay thế chấp').toBe(p1BeforeGO + 1_985);
  expect(room.phase, 'FSM chuyển sang PropertyManagement tại ô đất của mình').toBe(TurnPhase.PropertyManagement);

  // P1 gửi INTENT_REDEEM chuộc lại ô 03: Khấu trừ 330 Tr. (300 gốc + 30 phí hành chính 10%)
  const p1BeforeRedeem = room.players[0]!.balance;
  const redeemRes = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_REDEEM', cellIndex: 3 });
  expect(redeemRes.success, 'P1 chuộc lại ô 03 thành công').toBe(true);
  expect(room.players[0]!.balance, 'P1 bị trừ 330 Tr. chuộc đất (300 + 30)').toBe(p1BeforeRedeem - 330);
  expect(room.players[0]!.mortgagedProperties, 'Ô 03 được xóa sạch khỏi mortgagedProperties').not.toContain(3);

  // P1 kết thúc lượt -> chuyển sang P2
  const endP1Round = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(endP1Round.success, 'P1 kết thúc lượt').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2').toBe(1);

  // P2 tung xúc xắc lần 8 (total=6), bắt đầu từ ô 14 -> dừng tại ô 20, kết thúc lượt -> chuyển sang P3
  room.players[1]!.position = 14;
  mgr.handleRollDice(room.roomCode, 'P2');
  const endP2Round = mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  expect(endP2Round.success, 'P2 kết thúc lượt').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P3').toBe(2);
  expect(room.phase, 'FSM ở WaitingRoll chờ P3').toBe(TurnPhase.WaitingRoll);
}

function step4_P3InsolvencyAndBankruptcy(mgr: RoomManager, room: Room): void {
  // P3 bắt đầu từ ô 32, lần tung 9 cho total=9 -> ô (32+9)%40 = 1 (ô 01 của P2, mức thuê 60 Tr.)
  // Thiết lập số dư P3 âm sâu trước khi roll để sau khi nhận 2.000 GO và nộp 60 tiền thuê vẫn âm
  room.players[2]!.balance = -2_500;
  room.players[2]!.position = 32;

  // Gán 1 BĐS cho P3 (ô 06) để kiểm chứng việc giải phóng 100% tài sản vô chủ khi phá sản
  (mgr as any).registries.get(room.roomCode).set(6, 'P3');
  (mgr as any).propertyStates.get(room.roomCode).set(6, { level: 0 });
  expect(mgr.getPropertyOwner(room.roomCode, 6), 'P3 ban đầu nắm giữ ô 06').toBe('P3');

  const roll9 = mgr.handleRollDice(room.roomCode, 'P3');
  expect(roll9, 'P3 tung xúc xắc thành công').toBeDefined();
  expect(roll9!.player.position, 'P3 dừng tại ô 01 của P2').toBe(1);
  expect(roll9!.passedGo, 'P3 vượt qua GO').toBe(true);
  expect(roll9!.rentCharged, 'P3 phải trả 60 tiền thuê cho P2').toBe(60);
  // Số dư P3 sau GO (+2.000) và trừ thuê (-60): -2.500 + 2.000 - 60 = -560 Tr. < 0
  expect(room.players[2]!.balance, 'Số dư P3 bị âm -560 Tr.').toBe(-560);

  // handleRollDice tự động phát hiện số dư âm và chuyển FSM sang InsolvencyPhase
  expect(room.phase, 'FSM tự động chuyển sang InsolvencyPhase khi balance < 0').toBe(TurnPhase.InsolvencyPhase);

  // P3 kích hoạt mgr.handleBankruptcy
  const bankruptP3 = mgr.handleBankruptcy(room.roomCode, 'P3');
  // Khẳng định: gameOver PHẢI BẰNG false (do còn 2 người sống sót P1 và P2)
  expect(bankruptP3.gameOver, 'gameOver phải bằng false vì còn 2 người sống sót').toBe(false);
  expect(room.players[2]!.bankrupt, 'P3 được đánh dấu phá sản (bankrupt = true)').toBe(true);

  // Khẳng định: 100% ô đất của P3 được giải phóng sạch khỏi registry và stateMap (trở thành vô chủ)
  expect(mgr.getPropertyOwner(room.roomCode, 6), 'Ô 06 đã được xóa sạch khỏi registry').toBeUndefined();
  expect(mgr.getPropertyState(room.roomCode, 6), 'Ô 06 đã được xóa sạch khỏi stateMap').toBeUndefined();

  // Khẳng định: Lượt chơi được chuyển giao an toàn sang người sống sót kế tiếp (bỏ qua P3, wrap-around về P1)
  expect(room.currentPlayerIndex, 'Lượt chơi chuyển an toàn về P1').toBe(0);
  expect(room.phase, 'FSM chuyển về WaitingRoll cho P1').toBe(TurnPhase.WaitingRoll);
}

function step5_TwoPlayerContinuationAndFinalChampionship(mgr: RoomManager, room: Room): void {
  // P1 tiếp tục đổ xúc xắc thi đấu lần 10 (total=4), bắt đầu từ ô 16 -> ô 20 (FreeParking)
  room.players[0]!.position = 16;
  const roll10 = mgr.handleRollDice(room.roomCode, 'P1');
  expect(roll10?.player.position, 'P1 dừng chân tại ô 20').toBe(20);
  expect(room.phase, 'FSM ở PropertyManagement').toBe(TurnPhase.PropertyManagement);

  // P1 kết thúc lượt -> FSM tự động bỏ qua P3 đã phá sản và chuyển thẳng sang P2 (currentPlayerIndex = 1)
  const endP1 = mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  expect(endP1.success, 'P1 kết thúc lượt thành công').toBe(true);
  expect(room.currentPlayerIndex, 'Chuyển lượt sang P2 (bỏ qua P3 đã bankrupt)').toBe(1);
  expect(room.phase, 'FSM ở WaitingRoll chờ P2').toBe(TurnPhase.WaitingRoll);

  // P2 rơi vào ô có phí thuê khiến số dư âm -> InsolvencyPhase
  // P2 bắt đầu từ ô 36, lần tung 11 (total=7) -> ô (36+7)%40 = 3 (ô 03 của P1, thuê 60 Tr.)
  // Thiết lập số dư P2 = -2.100 để sau khi nhận 2.000 GO và trừ 60 thuê thì balance = -160 Tr. < 0
  // Đảm bảo P2.balance (-160) > P3.balance (-560) để thứ tự Net Worth đúng P2 > P3
  room.players[1]!.balance = -2_100;
  room.players[1]!.position = 36;
  const roll11 = mgr.handleRollDice(room.roomCode, 'P2');
  expect(roll11, 'P2 tung xúc xắc thành công').toBeDefined();
  expect(roll11!.player.position, 'P2 dẫm vào ô 03 của P1').toBe(3);
  expect(roll11!.passedGo, 'P2 vượt qua ô GO').toBe(true);
  expect(roll11!.rentCharged, 'P2 bị tính 60 tiền thuê').toBe(60);
  expect(room.players[1]!.balance, 'Số dư P2 âm -160 Tr. (-2.100 + 2.000 - 60 = -160)').toBe(-160);
  expect(room.phase, 'FSM tự động chuyển sang InsolvencyPhase khi P2 âm tiền').toBe(TurnPhase.InsolvencyPhase);

  // P2 kích hoạt mgr.handleBankruptcy
  const bankruptP2 = mgr.handleBankruptcy(room.roomCode, 'P2');
  // Khẳng định: gameOver PHẢI BẰNG true (chỉ còn 1 người sống sót P1)
  expect(bankruptP2.gameOver, 'gameOver phải bằng true khi chỉ còn 1 người sống sót').toBe(true);
  expect(room.players[1]!.bankrupt, 'P2 được đánh dấu phá sản').toBe(true);

  // Khẳng định: rankings trả về có đúng 3 người với thứ tự Net Worth: P1 > P2 > P3
  expect(bankruptP2.rankings, 'Bảng xếp hạng rankings phải được trả về').toBeDefined();
  expect(bankruptP2.rankings, 'Rankings phải chứa đúng 3 người chơi').toHaveLength(3);

  const rankings = bankruptP2.rankings!;
  expect(rankings[0]!.id, 'Quán quân là P1').toBe('P1');
  expect(rankings[1]!.id, 'Á quân là P2').toBe('P2');
  expect(rankings[2]!.id, 'Hạng 3 là P3').toBe('P3');

  // Khẳng định Net Worth giảm dần tuyệt đối: P1 > P2 > P3
  expect(rankings[0]!.netWorth, 'Net Worth của P1 cao hơn P2').toBeGreaterThan(rankings[1]!.netWorth);
  expect(rankings[1]!.netWorth, 'Net Worth của P2 cao hơn P3').toBeGreaterThan(rankings[2]!.netWorth);
}

describe('[UC-GAME-001..057/MSS] Multiplayer Gameplay Flow — E2E 3 Người Chơi (P1, P2, P3)', () => {
  it('[TC-E2E-MP/MSS] Mô phỏng ván đấu hoàn chỉnh giữa 3 người chơi từ khởi tạo đến Quán quân duy nhất', () => {
    // Setup Game: Khởi tạo phòng đấu 3 người chơi
    const { mgr, room } = setupGame(42);
    expect(room.started, 'Phòng đấu đã bắt đầu').toBe(true);
    expect(room.phase, 'Trạng thái khởi tạo WaitingRoll').toBe(TurnPhase.WaitingRoll);
    expect(room.players, 'Số lượng người chơi đúng 3').toHaveLength(3);
    expect(room.players[0]!.id).toBe('P1');
    expect(room.players[1]!.id).toBe('P2');
    expect(room.players[2]!.id).toBe('P3');
    expect(room.players[0]!.balance, 'Vốn P1 khởi điểm 15.000').toBe(INITIAL_BALANCE);
    expect(room.players[1]!.balance, 'Vốn P2 khởi điểm 15.000').toBe(INITIAL_BALANCE);
    expect(room.players[2]!.balance, 'Vốn P3 khởi điểm 15.000').toBe(INITIAL_BALANCE);
    expect(room.currentPlayerIndex, 'P1 đi trước (index = 0)').toBe(0);

    // Bước 1: P1 Mua ô 01 & P2P Trade cho P2
    step1_P1BuyAndTradeToP2(mgr, room);

    // Bước 2: P2 hoàn thành Monopoly Nâu, Nâng cấp C1 và Hạ cấp C1, P3 dừng an toàn
    step2_P2MonopolyUpgradeDowngradeAndP3Safe(mgr, room);

    // Bước 3: P1 Cầm cố & Chuộc đất ô 03 (thu lãi thế chấp 5% khi vượt GO)
    step3_P1MortgageAndRedeemCell3(mgr, room);

    // Bước 4: P3 Phá sản ở giữa trận đấu (gameOver = false, giải phóng đất, chuyển lượt an toàn)
    step4_P3InsolvencyAndBankruptcy(mgr, room);

    // Bước 5: Trận đấu tiếp diễn 2 người & Chung kết (gameOver = true, rankings P1 > P2 > P3)
    step5_TwoPlayerContinuationAndFinalChampionship(mgr, room);
  });
});
