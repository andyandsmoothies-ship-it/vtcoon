// [UC-GAME-057/MSS][TC-05.6/MSS][TC-05.6-inv/Adversarial] Downgrade Property Acceptance Tests — DEBT-02
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { handleDowngrade } from '../../src/server/property_actions';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher';
import { PROPERTY_DEEDS } from '../../src/domain/property_manager';

function setup(rng = () => 0) {
  const mgr = new RoomManager(rng);
  const room = mgr.createRoom('p1');
  mgr.joinRoom(room.roomCode, 'p2');
  mgr.startGame(room.roomCode);
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number }>;
  return { mgr, room, reg, sm };
}

describe('[TC-05.6/MSS] INTENT_DOWNGRADE trong PropertyManagement', () => {
  it('Ha cap C1 ve C0: level=0 va hoan tra 50% upgradeCost vao balance', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    room.phase = TurnPhase.PropertyManagement;
    const initialBalance = room.players[0]!.balance;
    const deed = PROPERTY_DEEDS.get(1)!;
    const expectedRefund = Math.floor(deed.upgradeCosts![0]! * 0.5); // 300 * 0.5 = 150

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success, String(res.reason)).toBe(true);
    expect(sm.get(1)?.level).toBe(0);
    expect(room.players[0]!.balance).toBe(initialBalance + expectedRefund);
  });

  it('Ha cap BĐS gia tri cao (o 39 - Trang Tien) hoan dung 50% upgradeCost', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(39, 'p1');
    sm.set(39, { level: 1 });
    room.phase = TurnPhase.PropertyManagement;
    const initialBalance = room.players[0]!.balance;
    const deed = PROPERTY_DEEDS.get(39)!;
    const expectedRefund = Math.floor(deed.upgradeCosts![0]! * 0.5); // 2000 * 0.5 = 1000

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 39);
    expect(res.success, String(res.reason)).toBe(true);
    expect(sm.get(39)?.level).toBe(0);
    expect(room.players[0]!.balance).toBe(initialBalance + expectedRefund);
  });

  it('Ha cap cong trinh C2 ve C0 hoan 50% tong chi phi nang cap ca 2 cap', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 2 });
    room.phase = TurnPhase.PropertyManagement;
    const initialBalance = room.players[0]!.balance;
    const deed = PROPERTY_DEEDS.get(1)!;
    const totalCost = deed.upgradeCosts![0]! + deed.upgradeCosts![1]!; // 300 + 450 = 750
    const expectedRefund = Math.floor(totalCost * 0.5); // 375

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success, String(res.reason)).toBe(true);
    expect(sm.get(1)?.level).toBe(0);
    expect(room.players[0]!.balance).toBe(initialBalance + expectedRefund);
  });

  it('Ha cap cong trinh C3 ve C0 hoan 50% tong chi phi ca 3 cap', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1'); sm.set(1, { level: 3 });
    room.phase = TurnPhase.PropertyManagement;
    const before = room.players[0]!.balance;
    const deed = PROPERTY_DEEDS.get(1)!;
    const expectedRefund = Math.floor((deed.upgradeCosts![0]! + deed.upgradeCosts![1]! + deed.upgradeCosts![2]!) * 0.5); // 1350 * 0.5 = 675
    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success, String(res.reason)).toBe(true);
    expect(sm.get(1)?.level).toBe(0);
    expect(room.players[0]!.balance).toBe(before + expectedRefund);
  });

  it('Hoat dong qua dispatchPlayerIntent voi INTENT_DOWNGRADE', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(3, 'p1');
    sm.set(3, { level: 1 });
    room.phase = TurnPhase.PropertyManagement;
    const initialBalance = room.players[0]!.balance;
    const deed = PROPERTY_DEEDS.get(3)!;
    const expectedRefund = Math.floor(deed.upgradeCosts![0]! * 0.5);

    const res = dispatchPlayerIntent(mgr, room.roomCode, 'p1', {
      type: 'INTENT_DOWNGRADE',
      cellIndex: 3,
    });
    expect(res.success, String(res.reason)).toBe(true);
    expect(sm.get(3)?.level).toBe(0);
    expect(room.players[0]!.balance).toBe(initialBalance + expectedRefund);
  });
});

describe('[TC-05.6/MSS] INTENT_DOWNGRADE trong InsolvencyPhase & FSM Reversion', () => {
  it('Ha cap trong InsolvencyPhase giup balance >= 0 -> FSM tu dong hoan nguyen ve PropertyManagement', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    room.players[0]!.balance = -100;
    room.phase = TurnPhase.InsolvencyPhase;

    // Refund o 1 C1 = 150 -> balance moi = -100 + 150 = 50 >= 0
    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success, String(res.reason)).toBe(true);
    expect(sm.get(1)?.level).toBe(0);
    expect(room.players[0]!.balance).toBe(50);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('Ha cap trong InsolvencyPhase van con am tien (< 0) -> FSM giu nguyen InsolvencyPhase', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    room.players[0]!.balance = -500;
    room.phase = TurnPhase.InsolvencyPhase;

    // Refund o 1 C1 = 150 -> balance moi = -500 + 150 = -350 < 0
    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success, String(res.reason)).toBe(true);
    expect(sm.get(1)?.level).toBe(0);
    expect(room.players[0]!.balance).toBe(-350);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('dispatchPlayerIntent chap nhan INTENT_DOWNGRADE trong InsolvencyPhase', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    room.players[0]!.balance = -50;
    room.phase = TurnPhase.InsolvencyPhase;

    const res = dispatchPlayerIntent(mgr, room.roomCode, 'p1', {
      type: 'INTENT_DOWNGRADE',
      cellIndex: 1,
    });
    expect(res.success, String(res.reason)).toBe(true);
    expect(room.players[0]!.balance).toBe(100);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('Ha cap trong InsolvencyPhase giup balance dat dung 0 -> FSM ve PropertyManagement', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1'); sm.set(1, { level: 1 });
    room.players[0]!.balance = -150;
    room.phase = TurnPhase.InsolvencyPhase;
    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success, String(res.reason)).toBe(true);
    expect(room.players[0]!.balance).toBe(0);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });
});

describe('[TC-05.6-inv/Adversarial] Tu choi ha cap bat hop le', () => {
  it('Tu choi khi o chua co cong trinh (level = 0) -> NOT_UPGRADEABLE', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 0 });
    room.phase = TurnPhase.PropertyManagement;

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_UPGRADEABLE');
  });

  it('Tu choi khi o chua co trang thai trong stateMap -> NOT_UPGRADEABLE', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    room.phase = TurnPhase.PropertyManagement;

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_UPGRADEABLE');
  });

  it('Tu choi khi nguoi yeu cau khong phai chu so huu -> NOT_OWNER', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p2'); // p2 owns it
    sm.set(1, { level: 1 });
    room.phase = TurnPhase.PropertyManagement;

    // p1 is active player, trying to downgrade p2's property
    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_OWNER');
  });

  it('Tu choi khi goi truc tiep handleDowngrade voi chu so huu sai -> NOT_OWNER', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p2');
    sm.set(1, { level: 1 });
    const p1 = room.players[0]!;

    const res = handleDowngrade(p1, TurnPhase.PropertyManagement, 1, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_OWNER');
  });

  it('Tu choi khi o khong ton tai hoac chua ai mua -> NOT_OWNER', () => {
    const { mgr, room } = setup();
    room.phase = TurnPhase.PropertyManagement;

    // Cell 1 has no owner registered
    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_OWNER');

    // Non-existent cell index
    const resNonExistent = mgr.handleDowngrade(room.roomCode, 'p1', 999);
    expect(resNonExistent.success).toBe(false);
    expect(resNonExistent.reason).toBe('NOT_OWNER');
  });

  it('Tu choi khi sai pha FSM: WaitingRoll -> INVALID_PHASE', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    room.phase = TurnPhase.WaitingRoll;

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_PHASE');
  });

  it('Tu choi khi sai pha FSM: ActionPhase -> INVALID_PHASE', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    room.phase = TurnPhase.ActionPhase;

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_PHASE');
  });

  it('Tu choi khi sai pha FSM: AuctionPhase -> INVALID_PHASE', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    room.phase = TurnPhase.AuctionPhase;

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_PHASE');
  });

  it('Tu choi khi khong phai luot cua nguoi choi (p2 goi khi luot cua p1) -> INVALID_PHASE', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p2');
    sm.set(1, { level: 1 });
    room.phase = TurnPhase.PropertyManagement;

    // Current player is p1, p2 tries to call
    const res = mgr.handleDowngrade(room.roomCode, 'p2', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_PHASE');
  });

  it('Tu choi khi room khong ton tai qua RoomManager -> INVALID_ROOM', () => {
    const { mgr } = setup();
    const res = mgr.handleDowngrade('NON_EXISTENT_ROOM', 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_ROOM');
  });

  it('Hanh vi idempotent & chan ha cap tiep: ha cap lan 2 bi tu choi NOT_UPGRADEABLE', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    room.phase = TurnPhase.PropertyManagement;

    const res1 = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res1.success).toBe(true);

    const res2 = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res2.success).toBe(false);
    expect(res2.reason).toBe('NOT_UPGRADEABLE');
  });

  it('Tu choi khi o khong co upgradeCosts (Railroad/Utility) -> NOT_UPGRADEABLE', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(5, 'p1');
    sm.set(5, { level: 1 } as any);
    room.phase = TurnPhase.PropertyManagement;

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 5);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_UPGRADEABLE');
  });
});
