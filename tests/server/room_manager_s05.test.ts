// [TC-05.1..TC-05.10/MSS] RoomManager Acceptance Tests - Slice 05 (Credit and Insolvency)
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { MarketCardId } from '../../src/domain/event_card_engine';
import { executeP2PTrade } from '../../src/server/property_actions';
import {
  collectMortgageInterest, getMortgageInterestRate,
} from '../../src/server/mortgage_manager';
import {
  checkInsolvency, declareBankruptcy, calculateNetWorth,
} from '../../src/server/insolvency_manager';
import { executeChanceCard } from '../../src/domain/card_handlers';
import { ChanceCardId } from '../../src/domain/event_card_types';
import { handleLanding } from '../../src/domain/property_manager';
import { SessionManager } from '../../src/server/session_manager';

function setup(rng = () => 0) {
  const mgr  = new RoomManager(rng);
  const room = mgr.createRoom('p1');
  mgr.joinRoom(room.roomCode, 'p2');
  mgr.startGame(room.roomCode);
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm  = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number }>;
  return { mgr, room, reg, sm };
}

describe('[TC-05.1a/MSS] Cam co BDS Cap 0 hop le', () => {
  it('balance += 50% gia dat; mortgagedProperties chua cellIndex qua INTENT_MORTGAGE', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    room.phase = TurnPhase.PropertyManagement;
    const before = room.players[0]!.balance;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_MORTGAGE', cellIndex: 1 });
    expect(res.success, String(res.reason)).toBe(true);
    expect(room.players[0]!.balance).toBe(before + 300);
    expect(room.players[0]!.mortgagedProperties).toContain(1);
  });
  it('O the chap: doi thu dam vao phi thue = 0 va chu dat khong nhan them tien', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.phase = TurnPhase.PropertyManagement;
    const mortRes = mgr.handleMortgage(room.roomCode, 'p1', 1);
    expect(mortRes.success, String(mortRes.reason)).toBe(true);
    const p1Balance = room.players[0]!.balance;
    const p2Balance = room.players[1]!.balance;

    const result = handleLanding(room.players[1]!, 1, reg, room.players, sm, 2, [], undefined, undefined, room.permanentRentBonus);
    expect(result.rentAmount).toBe(0);
    expect(room.players[1]!.balance, 'P2 khong bi tru tien').toBe(p2Balance);
    expect(room.players[0]!.balance, 'P1 khong nhan them tien thue').toBe(p1Balance);
  });
});

describe('[TC-05.1b/Adversarial] Cam co BDS co cong trinh C1', () => {
  it('success=false; reason=HAS_BUILDING', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1'); sm.set(1, { level: 1 });
    room.phase = TurnPhase.PropertyManagement;
    const before = room.players[0]!.balance;
    const res = mgr.handleMortgage(room.roomCode, 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('HAS_BUILDING');
    expect(room.players[0]!.balance).toBe(before);
  });
  it('success=false; reason=FREEZE_ACTIVE khi co the MC_FREEZE_TRADE', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    room.phase = TurnPhase.PropertyManagement;
    room.activeModifiers = [{ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 1 }];
    const before = room.players[0]!.balance;
    const res = mgr.handleMortgage(room.roomCode, 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('FREEZE_ACTIVE');
    expect(room.players[0]!.balance).toBe(before);
  });
  it('success=false; reason=ALREADY_MORTGAGED khi o da duoc the chap', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    room.phase = TurnPhase.PropertyManagement;
    mgr.handleMortgage(room.roomCode, 'p1', 1);
    const res2 = mgr.handleMortgage(room.roomCode, 'p1', 1);
    expect(res2.success).toBe(false);
    expect(res2.reason).toBe('ALREADY_MORTGAGED');
  });
  it('success=false; reason=NOT_OWNER khi khong so huu o dat', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p2');
    room.phase = TurnPhase.PropertyManagement;
    const res = mgr.handleMortgage(room.roomCode, 'p1', 1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_OWNER');
  });
});

describe('[TC-05.2a/MSS] Vuot GO voi 2000 du no: tru 100 lai', () => {
  it('collectMortgageInterest tru floor(2000*0.05)=100', () => {
    const { room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    const before = room.players[0]!.balance;
    collectMortgageInterest(room, 'p1');
    expect(room.players[0]!.balance).toBe(before - 100);
  });
  it('handleRollDice qua GO tu dong tru 5% lai vay the chap', () => {
    const { mgr, room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    room.players[0]!.position = 39;
    const before = room.players[0]!.balance;
    const roll = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll?.passedGo).toBe(true);
    expect(room.players[0]!.balance).toBe(before + 2000 - 100);
  });
});

describe('[TC-05.2b/MSS] Chuoc dat thanh cong', () => {
  it('mortgagedProperties khong chua o; balance tru dung qua INTENT_REDEEM', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    room.players[0]!.mortgagedProperties.push(1);
    room.players[0]!.balance = 10000;
    room.phase = TurnPhase.PropertyManagement;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_REDEEM', cellIndex: 1 });
    expect(res.success, String(res.reason)).toBe(true);
    expect(room.players[0]!.mortgagedProperties).not.toContain(1);
    expect(room.players[0]!.balance).toBe(10000 - 330);
  });
});

describe('[TC-05.2c/Adversarial] Chuoc dat khong du tien', () => {
  it('success=false; reason=INSUFFICIENT_FUNDS; balance khong doi', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    room.players[0]!.mortgagedProperties.push(1);
    room.players[0]!.balance = 100;
    room.phase = TurnPhase.PropertyManagement;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_REDEEM', cellIndex: 1 });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INSUFFICIENT_FUNDS');
    expect(room.players[0]!.mortgagedProperties).toContain(1);
    expect(room.players[0]!.balance).toBe(100);
    reg.set(3, 'p1');
    expect(mgr.handleRedeem(room.roomCode, 'p1', 3).reason).toBe('NOT_MORTGAGED');
    expect(mgr.handleRedeem(room.roomCode, 'p1', 99).reason).toBe('NOT_OWNER');
  });
});

describe('[TC-05.3a/MSS] Balance am -> InsolvencyPhase', () => {
  it('checkInsolvency chuyen phase', () => {
    const { room } = setup();
    room.players[0]!.balance = -500;
    checkInsolvency(room);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });
  it('InsolvencyPhase chap nhan INTENT_MORTGAGE', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    room.players[0]!.balance = -200;
    room.phase = TurnPhase.InsolvencyPhase;
    const res = mgr.handleMortgage(room.roomCode, 'p1', 1);
    expect(res.success, String(res.reason)).toBe(true);
  });
});

describe('[TC-05.4a/MSS] Pha san: reset tai san', () => {
  it('bankrupt=true; registry xoa o; gameOver khi con 1 nguoi', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1'); reg.set(3, 'p1');
    room.players[0]!.balance = -500;
    const result = declareBankruptcy(room, 'p1', reg, sm);
    expect(room.players[0]!.bankrupt).toBe(true);
    expect(reg.has(1)).toBe(false);
    expect(reg.has(3)).toBe(false);
    expect(result.gameOver).toBe(true);
  });
});

describe('[TC-05.4b/MSS] Rankings tra ve giam dan Net Worth', () => {
  it('rankings co thu tu dung', () => {
    const { room, reg, sm } = setup();
    const result = declareBankruptcy(room, 'p1', reg, sm);
    expect(result.gameOver).toBe(true);
    const r = result.rankings!;
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]!.netWorth).toBeGreaterThanOrEqual(r[r.length - 1]!.netWorth);
  });
});

describe('[TC-05.5/MSS] P2P trade dat Cap 0', () => {
  it('Chuyen quyen so huu; 5% thue vao treasury', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.players[1]!.balance = 10000;
    room.treasury = 0;
    const res = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(res.success, String(res.reason)).toBe(true);
    expect(reg.get(1)).toBe('p2');
    expect(room.players[1]!.balance).toBe(10000 - 840);
    expect(room.treasury).toBe(40);
  });
  it('[TC-05.5-inv/Adversarial] BDS co cong trinh -> PROPERTY_HAS_BUILDING', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1'); sm.set(1, { level: 1 });
    room.players[1]!.balance = 10000;
    const res = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('PROPERTY_HAS_BUILDING');
  });
});

describe('[TC-05.6/MSS] INTENT_DOWNGRADE BDS C1', () => {
  it('level=0; balance += 50% upgradeCost', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1'); sm.set(1, { level: 1 });
    room.phase = TurnPhase.PropertyManagement;
    const before = room.players[0]!.balance;
    const res = mgr.handleDowngrade(room.roomCode, 'p1', 1);
    expect(res.success, String(res.reason)).toBe(true);
    expect(sm.get(1)?.level).toBe(0);
    expect(room.players[0]!.balance).toBe(before + 150);
  });
});

describe('[TC-05.7/MSS] CC_PORT_EXCLUSIVE: chia 50% phi cang cho nguoi rut the', () => {
  it('[modifier] chua beneficiaryId, remainingRounds=2, multiplier=0.5', () => {
    const { room } = setup();
    executeChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, 'p1', room.players, room.activeModifiers);
    const mod = room.activeModifiers.find((m) => m.remainingRounds === 2 && m.multiplier === 0.5);
    expect(mod).toBeDefined();
    expect((mod as any).beneficiaryId).toBe('p1');
  });
  it('[money split] P3(beneficiary) nhan 50%; P1(owner) nhan 50%; P2(payer) tra 100%', () => {
    const { room, reg, sm } = setup();
    const p3 = { id: 'p3', position: 0, balance: 15000, skipNextTurn: false, auditTurnsLeft: 0,
      consecutiveDoubles: 0, hand: [] as string[], pendingDebts: [] as string[], extraTurns: 0,
      doubleNextDice: false, mortgagedProperties: [] as number[], bankrupt: false };
    room.players.push(p3 as any);
    reg.set(5, 'p1');
    const p1Before = room.players[0]!.balance;
    const p2Before = room.players[1]!.balance;
    executeChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, 'p3', room.players, room.activeModifiers);
    const p3Before = p3.balance;
    handleLanding(room.players[1]!, 5, reg, room.players, sm, 7, room.activeModifiers, undefined, undefined, room.permanentRentBonus);
    const half = Math.floor(500 * 0.5);
    expect(room.players[1]!.balance, 'P2 tra full 500').toBe(p2Before - 500);
    expect(room.players[0]!.balance, 'P1 owner nhan 50%=250').toBe(p1Before + half);
    expect(p3.balance, 'P3 beneficiary nhan 50%=250').toBe(p3Before + half);
  });
});

describe('[TC-05.8/MSS] DeltaPayload co truong level va isETC', () => {
  it('broadcastDelta luu va getLastDelta tra ve dung', () => {
    const sessionMgr = new SessionManager();
    const deltaData = { tick: 1, cells: [{ index: 5, ownerId: 'p1', level: 1, isETC: true }] };
    sessionMgr.broadcastDelta(deltaData);
    const last = sessionMgr.getLastDelta();
    expect(last?.cells[0]?.level).toBe(1);
    expect(last?.cells[0]?.isETC).toBe(true);
  });
});

describe('[TC-05.9/MSS] MC_RATE_HIKE active -> lai = 10%/vong', () => {
  it('getMortgageInterestRate=0.10; collectMortgageInterest tru 200', () => {
    const { room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    room.activeModifiers = [{ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1 }];
    expect(getMortgageInterestRate(room)).toBe(0.10);
    const before = room.players[0]!.balance;
    collectMortgageInterest(room, 'p1');
    expect(room.players[0]!.balance).toBe(before - 200);
  });
});

describe('[TC-05.10/MSS] MC_CREDIT_STIMULUS active -> lai = 0', () => {
  it('getMortgageInterestRate=0; collectMortgageInterest khong tru', () => {
    const { room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    room.activeModifiers = [{ type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 2 }];
    expect(getMortgageInterestRate(room)).toBe(0);
    const before = room.players[0]!.balance;
    collectMortgageInterest(room, 'p1');
    expect(room.players[0]!.balance).toBe(before);
  });
});

describe('[TC-05-NW/MSS] Quyet toan Net Worth chinh xac', () => {
  it('Net Worth = Cash + BDS - Du no the chap', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.players[0]!.mortgagedProperties.push(1);
    room.players[0]!.balance = 5000;
    const nw = calculateNetWorth('p1', reg, sm, room.players);
    expect(nw).toBe(5300);
  });
});