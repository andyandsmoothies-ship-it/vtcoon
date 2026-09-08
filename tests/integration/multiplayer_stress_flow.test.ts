// [UC-GAME-001..057/MSS][TC-E2E-STRESS/MSS] Living E2E Multiplayer Stress Flow
// Scenario: 3 Nguoi Choi (P1, P2, P3) — Doc Quyen Nau, Cu Soc No & Giai No Da Tang,
//           Pha San Giua Tran & Chuyen Luot FSM 2 Nguoi Con Lai.

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, INITIAL_BALANCE, GO_BONUS } from '../../src/domain/room';
import type { Room } from '../../src/domain/room';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher';

// --- Canonical FSM Intent Helpers ---
function INTENT_ROLL_DICE(mgr: RoomManager, roomCode: string, playerId: string) {
  return mgr.handleRollDice(roomCode, playerId);
}

function INTENT_BUY_PROPERTY(mgr: RoomManager, roomCode: string, playerId: string) {
  return dispatchPlayerIntent(mgr, roomCode, playerId, { type: 'INTENT_BUY' });
}

function INTENT_DOWNGRADE(mgr: RoomManager, roomCode: string, playerId: string, cellIndex: number) {
  return dispatchPlayerIntent(mgr, roomCode, playerId, { type: 'INTENT_DOWNGRADE', cellIndex });
}

function INTENT_MORTGAGE(mgr: RoomManager, roomCode: string, playerId: string, cellIndex: number) {
  return dispatchPlayerIntent(mgr, roomCode, playerId, { type: 'INTENT_MORTGAGE', cellIndex });
}

function INTENT_TRADE_OFFER(
  mgr: RoomManager,
  roomCode: string,
  requesterId: string,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
) {
  return dispatchPlayerIntent(mgr, roomCode, requesterId, {
    type: 'INTENT_TRADE_OFFER',
    sellerId,
    buyerId,
    cellIndex,
    price,
  });
}

function INTENT_DECLARE_BANKRUPTCY(mgr: RoomManager, roomCode: string, playerId: string) {
  return mgr.handleBankruptcy(roomCode, playerId);
}

function INTENT_END_TURN(mgr: RoomManager, roomCode: string, playerId: string) {
  return dispatchPlayerIntent(mgr, roomCode, playerId, { type: 'INTENT_END_TURN' });
}

function setupStressGame(seed = 42): { mgr: RoomManager; room: Room } {
  const mgr = new RoomManager(seed);
  const room = mgr.createRoom('P1');
  mgr.joinRoom(room.roomCode, 'P2');
  mgr.joinRoom(room.roomCode, 'P3');
  mgr.startGame(room.roomCode);
  return { mgr, room };
}

describe('[TC-E2E-STRESS/MSS] Living E2E Test: Multiplayer Stress Flow (3 Players)', () => {
  it('Mo phong van dau 3 nguoi: Doc quyen Nau, cu soc no da tang va pha san giua tran', () => {
    const { mgr, room } = setupStressGame(42);
    const rc = room.roomCode;

    // --- KHOI TAO PHONG DAU 3 NGUOI ---
    expect(room.players.length, 'Phai co du 3 nguoi choi').toBe(3);
    expect(room.players[0]!.balance, 'P1 khoi diem 15.000').toBe(INITIAL_BALANCE);
    expect(room.players[1]!.balance, 'P2 khoi diem 15.000').toBe(INITIAL_BALANCE);
    expect(room.players[2]!.balance, 'P3 khoi diem 15.000').toBe(INITIAL_BALANCE);
    expect(room.phase, 'FSM khoi diem WaitingRoll').toBe(TurnPhase.WaitingRoll);
    expect(room.currentPlayerIndex, 'Luot dau tien thuoc ve P1').toBe(0);

    // =========================================================================
    // PHA 1: P1 SO HUU DOC QUYEN NAU (O 01, 03) VA XAY C1. P3 MUA O 06.
    // =========================================================================

    // 1.1. Luot P1: Mua o 01 (Can Tho - Cai Rang, gia 600)
    room.players[0]!.position = 34; // Tung xuc xac ra 7 -> toi o 01
    const roll1 = INTENT_ROLL_DICE(mgr, rc, 'P1');
    expect(roll1?.player.position, 'P1 dung chan tai o 01').toBe(1);
    expect(room.phase, 'FSM o ActionPhase').toBe(TurnPhase.ActionPhase);

    const buy01Res = INTENT_BUY_PROPERTY(mgr, rc, 'P1');
    expect(buy01Res.success, 'P1 mua o 01 thanh cong').toBe(true);
    expect(mgr.getPropertyOwner(rc, 1), 'P1 so huu o 01').toBe('P1');
    expect(room.phase, 'FSM ve PropertyManagement').toBe(TurnPhase.PropertyManagement);

    const end1 = INTENT_END_TURN(mgr, rc, 'P1');
    expect(end1.success, 'P1 ket thuc luot 1').toBe(true);
    expect(room.currentPlayerIndex, 'Chuyen luot sang P2').toBe(1);

    // 1.2. Luot P2: P2 mua o 08 (Dong Nai, gia 1.000) va o 09 (Vung Tau, gia 1.200)
    // De chuan bi tai san cho Pha 2 giai no da tang
    // Voi seed 42, roll 2 co total = 11 -> position bat dau 37 -> (37 + 11) % 40 = 8
    room.players[1]!.position = 37;
    const rollP2 = INTENT_ROLL_DICE(mgr, rc, 'P2');
    expect(rollP2?.player.position, 'P2 dung chan tai o 08').toBe(8);

    const buy08Res = INTENT_BUY_PROPERTY(mgr, rc, 'P2');
    expect(buy08Res.success, 'P2 mua o 08 thanh cong').toBe(true);
    expect(mgr.getPropertyOwner(rc, 8), 'P2 so huu o 08').toBe('P2');

    // P2 xay dung san Shophouse C1 tai o 08 (chi phi 500)
    const sm = (mgr as any).propertyStates.get(rc) as Map<number, { level: number }>;
    sm.set(8, { level: 1 }); // Dat san cong trinh C1 de test ha cap
    expect(mgr.getPropertyState(rc, 8)?.level, 'O 08 co cong trinh C1').toBe(1);

    // P2 so huu them o 09 dat nen C0
    const reg = (mgr as any).registries.get(rc) as Map<number, string>;
    reg.set(9, 'P2');
    sm.set(9, { level: 0 });
    expect(mgr.getPropertyOwner(rc, 9), 'P2 so huu dat nen o 09').toBe('P2');

    const endP2 = INTENT_END_TURN(mgr, rc, 'P2');
    expect(endP2.success, 'P2 ket thuc luot').toBe(true);
    expect(room.currentPlayerIndex, 'Chuyen luot sang P3').toBe(2);

    // 1.3. Luot P3: P3 mua dat o 06 (Binh Duong, gia 1.000) theo dung dac ta
    // Voi seed 42, roll 3 co total = 6 -> position bat dau 0 -> (0 + 6) % 40 = 6
    room.players[2]!.position = 0;
    const rollP3 = INTENT_ROLL_DICE(mgr, rc, 'P3');
    expect(rollP3?.player.position, 'P3 dung chan tai o 06').toBe(6);
    expect(room.phase, 'FSM o ActionPhase').toBe(TurnPhase.ActionPhase);

    const buy06Res = INTENT_BUY_PROPERTY(mgr, rc, 'P3');
    expect(buy06Res.success, 'P3 mua o 06 thanh cong').toBe(true);
    expect(mgr.getPropertyOwner(rc, 6), 'P3 so huu o 06').toBe('P3');

    const endP3 = INTENT_END_TURN(mgr, rc, 'P3');
    expect(endP3.success, 'P3 ket thuc luot').toBe(true);
    expect(room.currentPlayerIndex, 'Chuyen luot quay lai P1').toBe(0);

    // 1.4. Luot P1: Mua tiep o 03 de hoan tat Doc Quyen Nau va xay C1 Shophouse
    // Voi seed 42, roll 4 co total = 6 -> position bat dau 37 -> (37 + 6) % 40 = 3
    room.players[0]!.position = 37;
    const roll1b = INTENT_ROLL_DICE(mgr, rc, 'P1');
    expect(roll1b?.player.position, 'P1 dung chan tai o 03').toBe(3);

    const buy03Res = INTENT_BUY_PROPERTY(mgr, rc, 'P1');
    expect(buy03Res.success, 'P1 mua o 03 thanh cong').toBe(true);
    expect(mgr.getPropertyOwner(rc, 3), 'P1 so huu o 03').toBe('P1');

    // P1 nang cap o 01 len C1 Shophouse (chi phi 300)
    const upRes = dispatchPlayerIntent(mgr, rc, 'P1', { type: 'INTENT_UPGRADE', cellIndex: 1 });
    expect(upRes.success, 'P1 nang cap o 01 len C1 thanh cong').toBe(true);
    expect(mgr.getPropertyState(rc, 1)?.level, 'O 01 dat cap C1').toBe(1);
    expect(mgr.getPropertyRent(rc, 1), 'Tien thue o 01 C1 la 210').toBe(210);

    const end1b = INTENT_END_TURN(mgr, rc, 'P1');
    expect(end1b.success, 'P1 ket thuc luot').toBe(true);
    expect(room.currentPlayerIndex, 'Chuyen luot sang P2').toBe(1);

    // =========================================================================
    // PHA 2: CU SOC NO & GIAI NO DA TANG CUA P2
    // =========================================================================

    // Thiet lap balance P2 sao cho sau khi cong 2.000 GO va tru 210 tien thue se am dung -200:
    // -1.990 + 2.000 - 210 = -200
    room.players[1]!.balance = -1_990;
    // Voi seed 42, roll 5 co total = 9 -> position bat dau 32 -> (32 + 9) % 40 = 1
    room.players[1]!.position = 32;

    // P2 do xuc xac dam vao o 01 C1 cua P1 -> no tien vuot qua tien mat hien co
    const rollShock = INTENT_ROLL_DICE(mgr, rc, 'P2');
    expect(rollShock?.player.position, 'P2 dam vao o 01 C1 cua P1').toBe(1);
    expect(rollShock?.rentCharged, 'Tien thue phai tra la 210').toBe(210);
    // So du P2 bi am: 10 - 210 = -200
    expect(room.players[1]!.balance, 'P2 bi am tien (-200)').toBe(-200);

    // FSM tu dong chuyen sang InsolvencyPhase
    expect(room.phase, 'FSM phai tu dong chuyen sang InsolvencyPhase').toBe(TurnPhase.InsolvencyPhase);

    // Trong InsolvencyPhase, cac intent thong thuong bi tu choi
    const invalidBuy = INTENT_BUY_PROPERTY(mgr, rc, 'P2');
    expect(invalidBuy.success, 'InsolvencyPhase tu choi INTENT_BUY').toBe(false);
    expect(invalidBuy.reason).toBe('INVALID_PHASE');

    const invalidEnd = INTENT_END_TURN(mgr, rc, 'P2');
    expect(invalidEnd.success, 'InsolvencyPhase tu choi INTENT_END_TURN').toBe(false);
    expect(invalidEnd.reason).toBe('INVALID_PHASE');

    // 2.1. P2 Ha cap cong trinh (C1 -> C0) tai o 08 nhan lai 50% chi phi xay dung (+250)
    const downRes = INTENT_DOWNGRADE(mgr, rc, 'P2', 8);
    expect(downRes.success, 'P2 ha cap o 08 C1 ve C0 thanh cong').toBe(true);
    expect(mgr.getPropertyState(rc, 8)?.level, 'O 08 tro ve level 0').toBe(0);
    // Balance P2 sau ha cap: -200 + 250 = +50
    // FSM tu dong hoan nguyen ve PropertyManagement vi so du da >= 0
    expect(room.players[1]!.balance, 'P2 nhan hoan 250 giup balance dat +50').toBe(50);
    expect(room.phase, 'FSM tu dong hoan nguyen ve PropertyManagement').toBe(TurnPhase.PropertyManagement);

    // 2.2. P2 The chap o dat C0 o 08 de huy dong them 50% gia dat (+500)
    const mortRes = INTENT_MORTGAGE(mgr, rc, 'P2', 8);
    expect(mortRes.success, 'P2 the chap dat C0 o 08 thanh cong').toBe(true);
    expect(room.players[1]!.mortgagedProperties, 'O 08 nam trong danh sach the chap').toContain(8);
    // Balance P2 sau the chap: 50 + 500 = 550
    expect(room.players[1]!.balance, 'P2 nhan them 500 dat tong 550').toBe(550);

    // 2.3. P2 Thuc hien giao dich P2P ban o dat 09 cho P3 de lay tien mat khan cap (thue 5% Kho bac)
    room.treasury = 0; // Reset treasury de do luong chinh xac thue
    const p3BalanceBefore = room.players[2]!.balance;
    const tradeRes = INTENT_TRADE_OFFER(mgr, rc, 'P2', 'P2', 'P3', 9, 1_000);
    expect(tradeRes.success, 'P2 ban o 09 cho P3 thanh cong').toBe(true);
    expect(mgr.getPropertyOwner(rc, 9), 'Quyen so huu o 09 chuyen sang P3').toBe('P3');
    // P3 tra 1.000 + 50 thue = 1.050
    expect(room.players[2]!.balance, 'P3 bi tru 1.050 (gia + thue)').toBe(p3BalanceBefore - 1_050);
    // P2 nhan du 1.000
    expect(room.players[1]!.balance, 'P2 nhan du 1.000 len 1.550').toBe(1_550);
    // Kho bac nhan 50 Tr. thue
    expect(room.treasury, 'Kho bac nhan dung 50 thue chuyen nhuong').toBe(50);

    // 2.4. P2 hoan toan thoat khoi khung hoang thanh khoan va ket thuc luot an toan
    const endP2Safe = INTENT_END_TURN(mgr, rc, 'P2');
    expect(endP2Safe.success, 'P2 ket thuc luot an toan').toBe(true);
    expect(room.currentPlayerIndex, 'Chuyen luot sang P3').toBe(2);

    // =========================================================================
    // PHA 3: PHA SAN GIUA TRAN & CHUYEN LUOT FSM CHO 2 NGUOI CHOI CON LAI
    // =========================================================================

    // P3 thi dau luot cua minh va ket thuc luot
    const rollP3b = INTENT_ROLL_DICE(mgr, rc, 'P3');
    expect(rollP3b, 'P3 roll thanh cong').toBeDefined();
    const endP3b = INTENT_END_TURN(mgr, rc, 'P3');
    expect(endP3b.success, 'P3 ket thuc luot').toBe(true);
    expect(room.currentPlayerIndex, 'Chuyen luot sang P1').toBe(0);

    // P1 thi dau luot cua minh va ket thuc luot
    const rollP1c = INTENT_ROLL_DICE(mgr, rc, 'P1');
    expect(rollP1c, 'P1 roll thanh cong').toBeDefined();
    const endP1c = INTENT_END_TURN(mgr, rc, 'P1');
    expect(endP1c.success, 'P1 ket thuc luot').toBe(true);
    expect(room.currentPlayerIndex, 'Chuyen luot sang P2').toBe(1);

    // P2 o vong sau: Tai san can kiet (chi con o 08 da the chap khong the ban/ha cap)
    // Thiet lap balance P2 sao cho sau khi qua GO (+2.000 - 25 lai the chap) va tru 210 tien thue se am dung -160:
    // -1.925 + 2.000 - 25 - 210 = -160
    room.players[1]!.balance = -1_925;
    // Voi seed 42, lan roll nay co total = 6 -> position bat dau 35 -> (35 + 6) % 40 = 1
    room.players[1]!.position = 35;

    // P2 tiep tuc dam vao o 01 C1 cua P1
    const rollP2Doom = INTENT_ROLL_DICE(mgr, rc, 'P2');
    expect(rollP2Doom?.player.position, 'P2 dam vao o 01 C1 lan 2').toBe(1);
    // P2 bi am tien: 50 - 210 = -160
    expect(room.players[1]!.balance, 'P2 bi am tien (-160)').toBe(-160);
    expect(room.phase, 'FSM vao InsolvencyPhase').toBe(TurnPhase.InsolvencyPhase);

    // P2 khong con cach nao huy dong them tien (o 08 da the chap -> tu choi the chap tiep)
    const mortAgain = INTENT_MORTGAGE(mgr, rc, 'P2', 8);
    expect(mortAgain.success, 'Khong the the chap o da the chap').toBe(false);

    // P2 tuyen bo pha san
    const bankRes = INTENT_DECLARE_BANKRUPTCY(mgr, rc, 'P2');
    expect(bankRes, 'handleBankruptcy phai tra ve ket qua').toBeDefined();

    // Kiem tra cac tieu chi pha san giua tran theo dung yeu cau:
    // 1. Van con 2 nguoi choi song sot (P1 va P3) -> gameOver PHAI BANG false
    expect(bankRes.gameOver, 'gameOver phai la false vi con 2 nguoi choi').toBe(false);

    // 2. P2 bi loai khoi danh sach choi active
    const p2State = room.players.find((p) => p.id === 'P2');
    expect(p2State?.bankrupt, 'P2 bi danh dau bankrupt = true').toBe(true);

    // 3. Toan bo tai san cua P2 duoc giai phong sach khoi registry (khong co dat mo coi)
    expect(mgr.getPropertyOwner(rc, 8), 'O 08 tro thanh vo chu').toBeUndefined();
    expect(mgr.getPropertyState(rc, 8), 'StateMap o 08 bi xoa').toBeUndefined();

    // 4. Luot choi tu dong nhay muot sang P3 (bo qua P2 da pha san)
    expect(room.currentPlayerIndex, 'Luot FSM tu dong chuyen sang P3 (index 2)').toBe(2);
    expect(room.phase, 'FSM san sang WaitingRoll cho P3').toBe(TurnPhase.WaitingRoll);

    // =========================================================================
    // VAN DAU TIEP DIEN BINH THUONG GIUA P1 VA P3
    // =========================================================================

    // P3 thuc hien luot choi cua minh
    const rollP3Normal = INTENT_ROLL_DICE(mgr, rc, 'P3');
    expect(rollP3Normal, 'P3 do xuc xac thanh cong sau khi P2 pha san').toBeDefined();
    expect(room.phase, 'FSM o ActionPhase do o chua co chu').toBe(TurnPhase.ActionPhase);

    // P3 mua o dat nay de chuyen sang PropertyManagement
    const buyP3Normal = INTENT_BUY_PROPERTY(mgr, rc, 'P3');
    expect(buyP3Normal.success, 'P3 mua tai san thanh cong').toBe(true);
    expect(room.phase, 'FSM ve PropertyManagement').toBe(TurnPhase.PropertyManagement);

    const endP3Normal = INTENT_END_TURN(mgr, rc, 'P3');
    expect(endP3Normal.success, 'P3 ket thuc luot thanh cong').toBe(true);

    // Luot choi tu dong chuyen sang P1 (wrap-around tu index 2 sang index 0, bo qua P2 o index 1)
    expect(room.currentPlayerIndex, 'Luot FSM chuyen ve P1 (index 0), bo qua P2').toBe(0);
    expect(room.phase, 'FSM san sang WaitingRoll cho P1').toBe(TurnPhase.WaitingRoll);

    // P1 do xuc xac thi dau tiep tuc
    const rollP1Normal = INTENT_ROLL_DICE(mgr, rc, 'P1');
    expect(rollP1Normal, 'P1 tiep tuc thi dau binh thuong').toBeDefined();
  });
});
