// [TC-05.4a/MSS][TC-05.4b/MSS][TC-05-NW/MSS] Bankruptcy & Net Worth Test Suite — UC-GAME-054, UC-GAME-055
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { MarketCardId } from '../../src/domain/event_card_engine';
import {
  declareBankruptcy, calculateNetWorth, calculateRankings,
} from '../../src/server/insolvency_manager';

function setup(playerCount = 2, rng = () => 0) {
  const mgr = new RoomManager(rng);
  const room = mgr.createRoom('p1');
  for (let i = 2; i <= playerCount; i++) {
    mgr.joinRoom(room.roomCode, `p${i}`);
  }
  mgr.startGame(room.roomCode);
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number }>;
  return { mgr, room, reg, sm };
}

describe('[TC-05.4a/MSS] Tuyen bo pha san (declareBankruptcy)', () => {
  it('Danh dau player.bankrupt = true; xoa sach 100% quyen so huu trong registry va stateMap', () => {
    const { room, reg, sm } = setup(2);
    reg.set(1, 'p1');
    reg.set(3, 'p1');
    sm.set(1, { level: 1 });
    sm.set(3, { level: 2 });
    room.players[0]!.balance = -500;
    room.players[0]!.mortgagedProperties.push(1);

    const result = declareBankruptcy(room, 'p1', reg, sm);

    expect(room.players[0]!.bankrupt, 'player.bankrupt phai la true').toBe(true);
    expect(reg.has(1), 'Cell 1 phai bi xoa khoi registry').toBe(false);
    expect(reg.has(3), 'Cell 3 phai bi xoa khoi registry').toBe(false);
    expect(sm.has(1), 'Cell 1 phai bi xoa khoi stateMap (khong co tai san mo coi)').toBe(false);
    expect(sm.has(3), 'Cell 3 phai bi xoa khoi stateMap (khong co tai san mo coi)').toBe(false);
    expect(room.players[0]!.mortgagedProperties.length, 'mortgagedProperties phai bi xoa sach').toBe(0);
    expect(result.gameOver, 'Con 1 nguoi song sot thi gameOver phai la true').toBe(true);
    expect(result.rankings, 'Phai tra ve bang xep hang rankings').toBeDefined();
  });

  it('Con 1 nguoi choi song sot -> gameOver = true va tra ve danh sach rankings', () => {
    const { room, reg, sm } = setup(2);
    room.players[0]!.balance = -500;
    const result = declareBankruptcy(room, 'p1', reg, sm);

    expect(result.gameOver).toBe(true);
    expect(result.rankings).toHaveLength(2);
    expect(result.rankings![0]!.id).toBe('p2');
    expect(result.rankings![1]!.id).toBe('p1');
  });

  it('Van 3 nguoi: P1 pha san khi dang o luot -> chuyen luot sang P2 (nguoi song sot ke tiep)', () => {
    const { room, reg, sm } = setup(3);
    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.InsolvencyPhase;
    const result = declareBankruptcy(room, 'p1', reg, sm);
    expect(result.gameOver, 'Van con 2 nguoi choi thi gameOver = false').toBe(false);
    expect(room.currentPlayerIndex, 'Luot phai chuyen sang P2 (index 1)').toBe(1);
    expect(room.phase, 'Phase chuyen sang WaitingRoll').toBe(TurnPhase.WaitingRoll);
  });

  it('Van 3 nguoi: P2 pha san o giua danh sach khi dang o luot -> chuyen luot sang P3', () => {
    const { room, reg, sm } = setup(3);
    room.currentPlayerIndex = 1;
    room.phase = TurnPhase.InsolvencyPhase;
    const result = declareBankruptcy(room, 'p2', reg, sm);
    expect(result.gameOver).toBe(false);
    expect(room.players[1]!.bankrupt).toBe(true);
    expect(room.currentPlayerIndex, 'Luot phai chuyen sang P3 (index 2)').toBe(2);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('Van 4 nguoi: P2 da pha san truoc, P1 pha san -> bo qua P2 va chuyen thang sang P3', () => {
    const { room, reg, sm } = setup(4);
    room.players[1]!.bankrupt = true;
    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.InsolvencyPhase;
    const result = declareBankruptcy(room, 'p1', reg, sm);
    expect(result.gameOver).toBe(false);
    expect(room.players[0]!.bankrupt).toBe(true);
    expect(room.currentPlayerIndex, 'Phai bo qua P2 da bankrupt de chuyen sang P3 (index 2)').toBe(2);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('Van 3 nguoi: P3 o cuoi danh sach pha san khi dang o luot -> wrap-around sang P1', () => {
    const { room, reg, sm } = setup(3);
    room.currentPlayerIndex = 2;
    room.phase = TurnPhase.InsolvencyPhase;
    const result = declareBankruptcy(room, 'p3', reg, sm);
    expect(result.gameOver).toBe(false);
    expect(room.players[2]!.bankrupt).toBe(true);
    expect(room.currentPlayerIndex, 'Wrap-around ve P1 (index 0)').toBe(0);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('Van 3 nguoi: P2 pha san khong phai luot cua minh -> khong lam thay doi luot cua P1', () => {
    const { room, reg, sm } = setup(3);
    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.WaitingRoll;
    const result = declareBankruptcy(room, 'p2', reg, sm);
    expect(result.gameOver).toBe(false);
    expect(room.players[1]!.bankrupt).toBe(true);
    expect(room.currentPlayerIndex, 'P1 van tiep tuc luot cua minh').toBe(0);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('Tich hop handleEndTurn: Bo qua nguoi choi da bankrupt trong vong lap luot thong thuong', () => {
    const { mgr, room } = setup(3);
    room.players[1]!.bankrupt = true;
    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.PropertyManagement;
    mgr.handleEndTurn(room.roomCode, 'p1');
    expect(room.currentPlayerIndex, 'handleEndTurn phai bo qua P2 bankrupt va chuyen toi P3 (index 2)').toBe(2);
  });

  it('Uy quyen RoomManager.handleBankruptcy hoat dong chinh xac', () => {
    const { mgr, room, reg } = setup(2);
    reg.set(1, 'p1');
    const res = mgr.handleBankruptcy(room.roomCode, 'p1');
    expect(res.gameOver).toBe(true);
    expect(room.players[0]!.bankrupt).toBe(true);
    expect(reg.has(1)).toBe(false);
  });
});

describe('[TC-05.4b/MSS] Xep hang nguoi choi (calculateRankings)', () => {
  it('calculateRankings tra ve danh sach giam dan theo Net Worth', () => {
    const { room, reg, sm } = setup(3);
    // P1: balance 10000, khong co BDS -> NW = 10000
    room.players[0]!.balance = 10000;
    // P2: balance 15000 + Cell 39 (price 4000, level 0) -> NW = 19000
    room.players[1]!.balance = 15000;
    reg.set(39, 'p2');
    sm.set(39, { level: 0 });
    // P3: balance 5000, khong co BDS -> NW = 5000
    room.players[2]!.balance = 5000;

    const rankings = calculateRankings(room, reg, sm);

    expect(rankings).toHaveLength(3);
    expect(rankings[0]!.id, 'Nguoi cao nhat la P2').toBe('p2');
    expect(rankings[0]!.netWorth).toBe(19000);
    expect(rankings[1]!.id, 'Nguoi thu hai la P1').toBe('p1');
    expect(rankings[1]!.netWorth).toBe(10000);
    expect(rankings[2]!.id, 'Nguoi thap nhat la P3').toBe('p3');
    expect(rankings[2]!.netWorth).toBe(5000);
  });

  it('RoomManager.getRankings tra ve danh sach xep hang hop le va [] khi phong khong ton tai', () => {
    const { mgr, room, reg, sm } = setup(2);
    room.players[0]!.balance = 20000;
    room.players[1]!.balance = 10000;

    const rankings = mgr.getRankings(room.roomCode);
    expect(rankings).toHaveLength(2);
    expect(rankings[0]!.id).toBe('p1');
    expect(rankings[1]!.id).toBe('p2');

    const invalidRankings = mgr.getRankings('NON_EXISTENT');
    expect(invalidRankings).toEqual([]);
  });

  it('Tie-breaker: Nguoi con song xep tren nguoi da pha san khi co cung Net Worth', () => {
    const { room, reg, sm } = setup(2);
    room.players[0]!.balance = 0;
    room.players[0]!.bankrupt = true;
    room.players[1]!.balance = 0;
    room.players[1]!.bankrupt = false;
    const rankings = calculateRankings(room, reg, sm);
    expect(rankings[0]!.id).toBe('p2');
    expect(rankings[1]!.id).toBe('p1');
  });
});

describe('[TC-05-NW/MSS] Quyet toan Net Worth (calculateNetWorth)', () => {
  it('Net Worth = Cash + Gia dat Cap 0 (he so 1.0)', () => {
    const { room, reg, sm } = setup(2);
    reg.set(1, 'p1'); sm.set(1, { level: 0 });
    room.players[0]!.balance = 5000;
    expect(calculateNetWorth('p1', reg, sm, room.players)).toBe(5600);
  });

  it('Net Worth = Cash + BDS co cong trinh C1(1.5x), C2(2.5x), C3(4.0x)', () => {
    const { room, reg, sm } = setup(2);
    reg.set(1, 'p1'); sm.set(1, { level: 1 });
    reg.set(6, 'p1'); sm.set(6, { level: 3 });
    reg.set(9, 'p1'); sm.set(9, { level: 2 });
    room.players[0]!.balance = 10000;
    expect(calculateNetWorth('p1', reg, sm, room.players)).toBe(17900);
  });

  it('BDS da the chap van duoc tinh vao Net Worth nhung bi khau tru dung 50% du no da vay', () => {
    const { room, reg, sm } = setup(2);
    reg.set(1, 'p1'); sm.set(1, { level: 0 });
    room.players[0]!.mortgagedProperties.push(1);
    room.players[0]!.balance = 5000;
    expect(calculateNetWorth('p1', reg, sm, room.players)).toBe(5300);
  });

  it('Ket hop phuc hop: BDS binh thuong + BDS the chap + BDS da nang cap', () => {
    const { room, reg, sm } = setup(2);
    reg.set(1, 'p1'); sm.set(1, { level: 0 });
    room.players[0]!.mortgagedProperties.push(1);
    reg.set(3, 'p1'); sm.set(3, { level: 1 });
    reg.set(39, 'p1'); sm.set(39, { level: 0 });
    room.players[0]!.balance = 7000;
    expect(calculateNetWorth('p1', reg, sm, room.players)).toBe(12200);
  });
});

describe('[TC-05/EdgeCases] Cac ca bien pha san va tinh Net Worth', () => {
  it('Nguoi choi khong co tai san BDS: Net Worth bang chinh xac tien mat', () => {
    const { room, reg, sm } = setup(2);
    room.players[0]!.balance = 12500;
    expect(calculateNetWorth('p1', reg, sm, room.players)).toBe(12500);
  });

  it('Nguoi choi co so du am lon va khong co tai san: Net Worth la so am chinh xac', () => {
    const { room, reg, sm } = setup(2);
    room.players[0]!.balance = -15000;
    expect(calculateNetWorth('p1', reg, sm, room.players)).toBe(-15000);
  });

  it('Nguoi choi khong so huu BDS nao declareBankruptcy van hoat dong an toan', () => {
    const { room, reg, sm } = setup(2);
    room.players[0]!.balance = -3000;
    expect(() => declareBankruptcy(room, 'p1', reg, sm)).not.toThrow();
    expect(room.players[0]!.bankrupt).toBe(true);
  });

  it('An toan khi player.mortgagedProperties la undefined', () => {
    const { room, reg, sm } = setup(2);
    delete (room.players[0] as any).mortgagedProperties;
    room.players[0]!.balance = -1000;
    expect(() => declareBankruptcy(room, 'p1', reg, sm)).not.toThrow();
    expect(room.players[0]!.bankrupt).toBe(true);
  });

  it('Player ID khong hop le tra ve an toan', () => {
    const { room, reg, sm, mgr } = setup(2);
    expect(calculateNetWorth('non_existent', reg, sm, room.players)).toBe(0);
    expect(declareBankruptcy(room, 'non_existent', reg, sm).gameOver).toBe(false);
    expect(mgr.handleBankruptcy('INVALID_CODE', 'p1').gameOver).toBe(false);
  });

  it('Nguoi ke tiep co skipNextTurn = true -> tu dong chuyen sang PropertyManagement va consume skipNextTurn', () => {
    const { room, reg, sm } = setup(3);
    room.currentPlayerIndex = 0;
    room.players[1]!.skipNextTurn = true;
    declareBankruptcy(room, 'p1', reg, sm);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect(room.players[1]!.skipNextTurn).toBe(false);
  });

  it('handleBankruptcy reset rolledThisTurn -> nguoi ke tiep khong the endTurn khi chua roll', () => {
    const { mgr, room } = setup(3);
    mgr.handleRollDice(room.roomCode, 'p1');
    expect((mgr as any).rolledThisTurn.get(room.roomCode)).toBe(true);
    mgr.handleBankruptcy(room.roomCode, 'p1');
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
    expect(mgr.handleEndTurn(room.roomCode, 'p2')).toBeUndefined();
  });

  it('Wrap-around khi nguoi cuoi cung pha san -> activeModifiers decay dung quy dinh', () => {
    const { room, reg, sm } = setup(3);
    room.currentPlayerIndex = 2;
    room.activeModifiers = [{ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1 }];
    declareBankruptcy(room, 'p3', reg, sm);
    expect(room.currentPlayerIndex).toBe(0);
    expect(room.activeModifiers).toHaveLength(0);
  });

  it('declareBankruptcy lan 2 tren nguoi da pha san hoat dong idempotent va an toan', () => {
    const { room, reg, sm } = setup(3);
    room.currentPlayerIndex = 0;
    const res1 = declareBankruptcy(room, 'p1', reg, sm);
    expect(res1.gameOver).toBe(false);
    expect(room.currentPlayerIndex).toBe(1);
    const res2 = declareBankruptcy(room, 'p1', reg, sm);
    expect(res2.gameOver).toBe(false);
    expect(room.currentPlayerIndex).toBe(1);
  });

  it('alive <= 1 khi tat ca nguoi choi deu pha san -> gameOver = true', () => {
    const { room, reg, sm } = setup(2);
    room.players[0]!.bankrupt = true;
    room.players[1]!.bankrupt = true;
    const res = declareBankruptcy(room, 'p1', reg, sm);
    expect(res.gameOver).toBe(true);
  });
});
