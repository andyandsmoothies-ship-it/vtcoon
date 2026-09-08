// [TC-05.3a/MSS][TC-05.3b/MSS] Insolvency Manager & Liquidation Test Suite — UC-GAME-053
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { checkInsolvency, liquidateAssets } from '../../src/server/insolvency_manager';

function setup(rng = () => 0) {
  const mgr  = new RoomManager(rng);
  const room = mgr.createRoom('p1');
  mgr.joinRoom(room.roomCode, 'p2');
  mgr.startGame(room.roomCode);
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm  = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number }>;
  return { mgr, room, reg, sm };
}

describe('[TC-05.3a/MSS] Chuyen InsolvencyPhase va gioi han intent', () => {
  it('Khi balance < 0, checkInsolvency tu dong chuyen sang TurnPhase.InsolvencyPhase', () => {
    const { room } = setup();
    room.players[0]!.balance = -350;
    room.phase = TurnPhase.PropertyManagement;

    checkInsolvency(room);

    expect(room.phase, 'FSM phai chuyen sang InsolvencyPhase khi so du am').toBe(TurnPhase.InsolvencyPhase);
  });

  it('Trong InsolvencyPhase: chap nhan INTENT_MORTGAGE de huy dong tien', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1'); // Cell 1 gia 600, 50% mortgage = 300
    room.players[0]!.balance = -200;
    room.phase = TurnPhase.InsolvencyPhase;

    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_MORTGAGE', cellIndex: 1 });

    expect(res.success, String(res.reason)).toBe(true);
    expect(room.players[0]!.balance, 'Nhan 300 tien the chap: -200 + 300 = 100').toBe(100);
    expect(room.players[0]!.mortgagedProperties).toContain(1);
    expect(room.phase, 'Khi so du >= 0, FSM tro ve PropertyManagement').toBe(TurnPhase.PropertyManagement);
  });

  it('Trong InsolvencyPhase: chap nhan INTENT_DOWNGRADE de huy dong tien', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 1 }); // Cell 1 upgradeCost[0] = 300, 50% refund = 150
    room.players[0]!.balance = -100;
    room.phase = TurnPhase.InsolvencyPhase;

    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DOWNGRADE', cellIndex: 1 });

    expect(res.success, String(res.reason)).toBe(true);
    expect(sm.get(1)?.level, 'Cong trinh bi ha cap ve 0').toBe(0);
    expect(room.players[0]!.balance, 'Hoan 150 tien xay: -100 + 150 = 50').toBe(50);
    expect(room.phase, 'Khi so du >= 0, FSM tro ve PropertyManagement').toBe(TurnPhase.PropertyManagement);
  });

  it('Trong InsolvencyPhase: tu choi INTENT_BUY', () => {
    const { mgr, room, reg } = setup();
    room.players[0]!.balance = -500;
    room.phase = TurnPhase.InsolvencyPhase;

    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_BUY' });

    expect(res.success, 'Khong duoc phep mua dat khi dang Insolvency').toBe(false);
    expect(res.reason).toBe('INVALID_PHASE');
  });

  it('Trong InsolvencyPhase: tu choi INTENT_END_TURN va chan handleEndTurn', () => {
    const { mgr, room } = setup();
    room.players[0]!.balance = -500;
    room.phase = TurnPhase.InsolvencyPhase;

    const intentRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
    expect(intentRes.success, 'Khong duoc ket thuc luot khi dang am tien').toBe(false);
    expect(intentRes.reason).toBe('INVALID_PHASE');

    const directRes = mgr.handleEndTurn(room.roomCode, 'p1');
    expect(directRes, 'handleEndTurn phai tra ve undefined trong InsolvencyPhase').toBeUndefined();
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('Trong InsolvencyPhase: tu choi cac intent khac (INTENT_UPGRADE, INTENT_UPGRADE_ETC)', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    room.players[0]!.balance = -200;
    room.phase = TurnPhase.InsolvencyPhase;

    const upRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_UPGRADE', cellIndex: 1 });
    expect(upRes.success).toBe(false);
    expect(upRes.reason).toBe('INVALID_PHASE');

    const etcRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_UPGRADE_ETC' });
    expect(etcRes.success).toBe(false);
    expect(etcRes.reason).toBe('INVALID_PHASE');
  });

  it('Trong InsolvencyPhase: chan rollDice va tu choi mortgage/downgrade khong hop le', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    room.players[0]!.balance = -500;
    room.phase = TurnPhase.InsolvencyPhase;

    const rollRes = mgr.handleRollDice(room.roomCode, 'p1');
    expect(rollRes, 'handleRollDice phai tra ve undefined trong InsolvencyPhase').toBeUndefined();

    const mortWrong = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_MORTGAGE', cellIndex: 3 });
    expect(mortWrong.success).toBe(false);
    expect(mortWrong.reason).toBe('NOT_OWNER');
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);

    const downZero = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DOWNGRADE', cellIndex: 1 });
    expect(downZero.success).toBe(false);
    expect(downZero.reason).toBe('NOT_UPGRADEABLE');
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('Trong InsolvencyPhase: huy dong tien nhung van am -> FSM van o InsolvencyPhase', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1'); // Cell 1 price 600 -> mortgage thu 300
    room.players[0]!.balance = -1000;
    room.phase = TurnPhase.InsolvencyPhase;

    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_MORTGAGE', cellIndex: 1 });
    expect(res.success).toBe(true);
    expect(room.players[0]!.balance, '-1000 + 300 = -700').toBe(-700);
    expect(room.phase, 'Van am tien thi FSM phai giu nguyen InsolvencyPhase').toBe(TurnPhase.InsolvencyPhase);
  });
});

describe('[TC-05.3b/MSS] Cuong che thanh ly tai san (liquidateAssets)', () => {
  it('Uu tien thanh ly theo thu tu cap giam dan (C3 -> C2 -> C1 -> C0)', () => {
    const { room, reg, sm } = setup();
    // Cell 6: price 1000, C3 -> mult 4 -> floor(1000 * 4 * 0.5) = 2000
    reg.set(6, 'p1'); sm.set(6, { level: 3 });
    // Cell 3: price 600, C1 -> mult 1.5 -> floor(600 * 1.5 * 0.5) = 450
    reg.set(3, 'p1'); sm.set(3, { level: 1 });
    // Cell 1: price 600, C0 -> mult 1 -> floor(600 * 1 * 0.5) = 300
    reg.set(1, 'p1'); sm.set(1, { level: 0 });

    // No rat lon -2600: can ban ca 3 de thu 2000 + 450 + 300 = 2750
    room.players[0]!.balance = -2600;
    room.phase = TurnPhase.InsolvencyPhase;

    liquidateAssets(room, 'p1', reg, sm);

    expect(room.players[0]!.balance, '-2600 + 2000 + 450 + 300 = 150').toBe(150);
    expect(reg.has(6), 'Cell 6 (C3) da bi thanh ly').toBe(false);
    expect(reg.has(3), 'Cell 3 (C1) da bi thanh ly').toBe(false);
    expect(reg.has(1), 'Cell 1 (C0) da bi thanh ly').toBe(false);
    expect(sm.has(6)).toBe(false);
    expect(sm.has(3)).toBe(false);
    expect(sm.has(1)).toBe(false);
    expect(room.phase, 'So du >= 0 thi FSM phai chuyen ve PropertyManagement').toBe(TurnPhase.PropertyManagement);
  });

  it('Giai phong khoi mortgagedProperties neu tai san bi thanh ly dang the chap', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1'); sm.set(1, { level: 0 });
    room.players[0]!.mortgagedProperties.push(1);
    room.players[0]!.balance = -500;
    room.phase = TurnPhase.InsolvencyPhase;

    liquidateAssets(room, 'p1', reg, sm);

    expect(reg.has(1)).toBe(false);
    expect(room.players[0]!.mortgagedProperties).not.toContain(1);
    expect(room.players[0]!.balance, '-500 + 300 = -200').toBe(-200);
  });

  it('Thanh ly tuong ung he so LEVEL_MULTIPLIER {0:1, 1:1.5, 2:2.5, 3:4} dung 50%', () => {
    const { room, reg, sm } = setup();
    // Cell 9: price 1200, C2 -> mult 2.5 -> floor(1200 * 2.5 * 0.5) = 1500
    reg.set(9, 'p1'); sm.set(9, { level: 2 });
    room.players[0]!.balance = -2000;

    liquidateAssets(room, 'p1', reg, sm);

    expect(room.players[0]!.balance, '-2000 + 1500 = -500').toBe(-500);
    expect(reg.has(9)).toBe(false);
  });
});

describe('[TC-05.3/EdgeCases] Cac ca bien thanh ly', () => {
  it('Nguoi choi khong co BDS nao de thanh ly: an toan, balance khong doi', () => {
    const { room, reg, sm } = setup();
    room.players[0]!.balance = -800;
    room.phase = TurnPhase.InsolvencyPhase;

    expect(() => liquidateAssets(room, 'p1', reg, sm)).not.toThrow();
    expect(room.players[0]!.balance).toBe(-800);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('Thanh ly tung phan: Dung ngay khi so du >= 0, khong ban het tai san con lai', () => {
    const { room, reg, sm } = setup();
    // Cell 6 (C3, gia thanh ly 2000)
    reg.set(6, 'p1'); sm.set(6, { level: 3 });
    // Cell 3 (C1, gia thanh ly 450)
    reg.set(3, 'p1'); sm.set(3, { level: 1 });
    // Cell 1 (C0, gia thanh ly 300)
    reg.set(1, 'p1'); sm.set(1, { level: 0 });

    // No chi la -1200: chi can ban Cell 6 (thu 2000 -> balance = +800 >= 0)
    room.players[0]!.balance = -1200;
    room.phase = TurnPhase.InsolvencyPhase;

    liquidateAssets(room, 'p1', reg, sm);

    expect(room.players[0]!.balance, '-1200 + 2000 = 800').toBe(800);
    expect(reg.has(6), 'Cell 6 (C3) bi ban').toBe(false);
    expect(reg.get(3), 'Cell 3 (C1) DUOC GIU LAI, khong bi thanh ly').toBe('p1');
    expect(reg.get(1), 'Cell 1 (C0) DUOC GIU LAI, khong bi thanh ly').toBe('p1');
    expect(sm.has(3), 'State Cell 3 van ton tai').toBe(true);
    expect(sm.has(1), 'State Cell 1 van ton tai').toBe(true);
    expect(room.phase, 'FSM tro ve PropertyManagement khi so du >= 0').toBe(TurnPhase.PropertyManagement);
  });

  it('Ban sach toan bo tai san neu van am: registry xoa het, phase van la InsolvencyPhase', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1'); sm.set(1, { level: 0 }); // 300
    reg.set(3, 'p1'); sm.set(3, { level: 0 }); // 300
    room.players[0]!.balance = -10000;
    room.phase = TurnPhase.InsolvencyPhase;

    liquidateAssets(room, 'p1', reg, sm);

    expect(room.players[0]!.balance, '-10000 + 300 + 300 = -9400').toBe(-9400);
    expect(reg.has(1)).toBe(false);
    expect(reg.has(3)).toBe(false);
    expect(room.phase, 'Van am tien thi van o InsolvencyPhase cho buoc pha san').toBe(TurnPhase.InsolvencyPhase);
  });

  it('Dong cap C0: Uu tien thanh ly o co gia niem yet cao hon truoc (tie-breaking by price)', () => {
    const { room, reg, sm } = setup();
    // Cell 1: price 600, level 0 -> 50% = 300
    reg.set(1, 'p1'); sm.set(1, { level: 0 });
    // Cell 39: price 4000, level 0 -> 50% = 2000
    reg.set(39, 'p1'); sm.set(39, { level: 0 });

    // No -1500: neu ban Cell 39 thu 2000 -> balance = +500 >= 0, Cell 1 duoc giu lai
    room.players[0]!.balance = -1500;
    room.phase = TurnPhase.InsolvencyPhase;

    liquidateAssets(room, 'p1', reg, sm);

    expect(room.players[0]!.balance, '-1500 + 2000 = 500').toBe(500);
    expect(reg.has(39), 'Cell 39 gia cao hon bi thanh ly truoc').toBe(false);
    expect(reg.has(1), 'Cell 1 gia thap hon duoc bao toan').toBe(true);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('An toan khi player.mortgagedProperties chua duoc khoi tao (undefined)', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1'); sm.set(1, { level: 0 });
    delete (room.players[0] as any).mortgagedProperties;
    room.players[0]!.balance = -100;

    expect(() => liquidateAssets(room, 'p1', reg, sm)).not.toThrow();
    expect(room.players[0]!.balance).toBe(200);
    expect(reg.has(1)).toBe(false);
  });
});
