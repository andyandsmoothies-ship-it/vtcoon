// [UC-GAME-047/MSS][UC-GAME-053/MSS][UC-GAME-054/MSS] Audit Insolvency & Forced Bailout Test Suite
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';

function setup(rng?: () => number) {
  let seq = 0;
  // Default RNG returns 1 and 5 (die1 = 1, die2 = 5, not doubles)
  const defaultRng = () => (seq++ % 2 === 0 ? 0.1 : 0.8);
  const mgr = new RoomManager(rng ?? defaultRng);
  const room = mgr.createRoom('p1');
  mgr.joinRoom(room.roomCode, 'p2');
  mgr.startGame(room.roomCode);
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number }>;
  return { mgr, room, reg, sm };
}

describe('[UC-GAME-047/MSS][UC-GAME-053/MSS] Audit Bailout & Insolvency Transition', () => {
  it('Khi het han 3 vong kiem toan va khong du tien nop 500 Tr. bao lanh, FSM dung o InsolvencyPhase va giu luot', () => {
    const { mgr, room, reg, sm } = setup();
    const p1 = room.players[0]!;

    // P1 dang o Tram Kiem Toan (o 10), con 1 luot cuoi
    p1.position = 10;
    p1.auditTurnsLeft = 1;
    p1.balance = 200; // Thieu 300 Tr. de tra 500 Tr.
    reg.set(16, 'p1'); // So huu O 16 (Binh Dinh, C1)
    sm.set(16, { level: 1 });

    // P1 gieo xuc xac trong tu nhung khong ra mat doi (die1=1, die2=5) -> dung chan tai cho
    const rollRes = mgr.handleRollDice(room.roomCode, 'p1');
    expect(rollRes, 'Gieo xuc xac khong doi trong tu dung tai cho').toBeDefined();
    expect(p1.position, 'Quan co van o o 10 Tram Kiem Toan').toBe(10);
    expect(room.phase, 'Sau khi gieo khong doi, phase la PropertyManagement').toBe(TurnPhase.PropertyManagement);

    // P1 ket thuc luot trong tu
    const resRoom = mgr.handleEndTurn(room.roomCode, 'p1');

    // 1. Kiem tra khau tru 500 Tr. bao lanh cuong che vao Kho Bac
    expect(p1.auditTurnsLeft, 'auditTurnsLeft phai giam ve 0').toBe(0);
    expect(p1.balance, 'So du bi am: 200 - 500 = -300 Tr.').toBe(-300);
    expect(room.treasury, 'Kho bac nhan du 500 Tr. bao lanh').toBe(500);

    // 2. FSM phai giu nguyen luot P1 va chuyen phase sang InsolvencyPhase
    expect(resRoom, 'handleEndTurn phai tra ve room hop le').toBeDefined();
    expect(room.phase, 'FSM phai o InsolvencyPhase').toBe(TurnPhase.InsolvencyPhase);
    expect(room.currentPlayerIndex, 'Luot choi phai giu nguyen tai P1 (debtor)').toBe(0);

    // 3. Khong the bam Het Luot khi dang bi am tien
    const endAgain = mgr.handleEndTurn(room.roomCode, 'p1');
    expect(endAgain, 'Khong duoc chuyen luot khi dang InsolvencyPhase').toBeUndefined();

    // 4. Khong duoc thuc hien cac intent bi cam (nhu INTENT_BUY)
    const buyRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_BUY' });
    expect(buyRes.success, 'Khong duoc mua dat khi dang Insolvency').toBe(false);
    expect(buyRes.reason).toBe('INVALID_PHASE');

    // 5. Giai cuu tai san: Ha cap O 16 tu C1 -> C0 (hoan 50% phi nang cap = 405 Tr.)
    const downRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DOWNGRADE', cellIndex: 16 });
    expect(downRes.success, 'Ha cap BDS thanh cong de huy dong von').toBe(true);
    expect(sm.get(16)?.level, 'O 16 tro ve cap C0').toBe(0);
    expect(p1.balance, 'So du tro ve duong: -300 + 405 = 105 Tr.').toBe(105);

    // 6. FSM tu dong hoan nguyen ve PropertyManagement khi so du >= 0
    expect(room.phase, 'FSM phai tro ve PropertyManagement khi het am tien').toBe(TurnPhase.PropertyManagement);

    // 7. P1 bay gio co the ket thuc luot an toan de chuyen sang P2
    const finalEnd = mgr.handleEndTurn(room.roomCode, 'p1');
    expect(finalEnd, 'P1 ket thuc luot thanh cong').toBeDefined();
    expect(room.currentPlayerIndex, 'Chuyen luot sang P2').toBe(1);
    expect(room.phase, 'P2 o phase WaitingRoll').toBe(TurnPhase.WaitingRoll);
  });

  it('[UC-GAME-054/MSS] Tuyen bo pha san ngay trong tu khi khong muon hoac khong the tu cuu', () => {
    const { mgr, room, reg, sm } = setup();
    const p1 = room.players[0]!;

    p1.position = 10;
    p1.auditTurnsLeft = 1;
    p1.balance = 200;
    reg.set(16, 'p1');
    sm.set(16, { level: 0 });

    // P1 gieo xuc xac trong tu
    mgr.handleRollDice(room.roomCode, 'p1');

    // Het luot trong tu -> bi am -300 Tr.
    mgr.handleEndTurn(room.roomCode, 'p1');
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);

    // P1 chap nhan tuyen bo pha san
    const bankRes = mgr.handleBankruptcy(room.roomCode, 'p1');
    expect(p1.bankrupt, 'P1 bi danh dau pha san').toBe(true);
    expect(bankRes.gameOver, 'Van dau ket thuc vi chi con 1 nguoi song sot (P2)').toBe(true);
    expect(bankRes.rankings?.[0]?.id, 'P2 la nguoi chien thang').toBe('p2');
  });

  it('[Adversarial Inversion] Khi nguoi choi du tien nop 500 Tr., FSM khong vao InsolvencyPhase ma chuyen luot binh thuong', () => {
    const { mgr, room } = setup();
    const p1 = room.players[0]!;

    p1.position = 10;
    p1.auditTurnsLeft = 1;
    p1.balance = 1500; // Du tien nop 500 Tr.

    // P1 gieo xuc xac trong tu
    mgr.handleRollDice(room.roomCode, 'p1');

    const resRoom = mgr.handleEndTurn(room.roomCode, 'p1');
    expect(p1.auditTurnsLeft).toBe(0);
    expect(p1.balance, '1500 - 500 = 1000 Tr.').toBe(1000);
    expect(resRoom?.phase, 'FSM khong vao InsolvencyPhase ma chuyen sang WaitingRoll').toBe(TurnPhase.WaitingRoll);
    expect(room.currentPlayerIndex, 'Chuyen luot sang P2').toBe(1);
  });
});
