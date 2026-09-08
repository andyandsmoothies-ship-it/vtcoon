// [TC-05.1b/Adversarial][TC-05.2/MSS][TC-05.2/Adversarial][TC-05.9/MSS][TC-05.10/MSS] Mortgage & Redeem Comprehensive Test Suite
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { MarketCardId } from '../../src/domain/event_card_types';
import {
  mortgageProperty, redeemProperty, collectMortgageInterest, getMortgageInterestRate,
} from '../../src/server/mortgage_manager';
import { handleLanding } from '../../src/domain/property_manager';

function setup(rng = () => 0) {
  const mgr  = new RoomManager(rng);
  const room = mgr.createRoom('p1');
  mgr.joinRoom(room.roomCode, 'p2');
  mgr.startGame(room.roomCode);
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm  = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number }>;
  return { mgr, room, reg, sm };
}

describe('[TC-05.1b/Adversarial] mortgageProperty Guards', () => {
  it('Tu choi khi BDS co cong trinh C1 -> HAS_BUILDING', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1'); sm.set(1, { level: 1 });
    room.phase = TurnPhase.PropertyManagement;
    const res = mortgageProperty(room, 'p1', 1, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('HAS_BUILDING');
  });

  it('Tu choi khi da the chap -> ALREADY_MORTGAGED', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.players[0]!.mortgagedProperties.push(1);
    room.phase = TurnPhase.PropertyManagement;
    const res = mortgageProperty(room, 'p1', 1, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('ALREADY_MORTGAGED');
  });

  it('Tu choi khi khong so huu -> NOT_OWNER', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p2');
    room.phase = TurnPhase.PropertyManagement;
    const res = mortgageProperty(room, 'p1', 1, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_OWNER');
  });

  it('Tu choi khi MC_FREEZE_TRADE active -> FREEZE_ACTIVE', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.phase = TurnPhase.PropertyManagement;
    room.activeModifiers = [{ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 1 }];
    const res = mortgageProperty(room, 'p1', 1, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('FREEZE_ACTIVE');
  });
});

describe('[TC-05.2/Adversarial] redeemProperty Guards', () => {
  it('Tu choi khi chua bat dau game -> GAME_NOT_STARTED', () => {
    const { room, reg } = setup();
    room.started = false;
    const res = redeemProperty(room, 'p1', 1, reg);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('GAME_NOT_STARTED');
  });

  it('Tu choi khi khong phai luot -> NOT_YOUR_TURN', () => {
    const { room, reg } = setup();
    room.currentPlayerIndex = 0; // p1's turn
    const res = redeemProperty(room, 'p2', 1, reg);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_YOUR_TURN');
  });

  it('Tu choi khi sai phase (WaitingRoll) -> INVALID_PHASE', () => {
    const { room, reg } = setup();
    room.phase = TurnPhase.WaitingRoll;
    const res = redeemProperty(room, 'p1', 1, reg);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_PHASE');
  });

  it('Tu choi khi khong so huu o dat -> NOT_OWNER', () => {
    const { room, reg } = setup();
    reg.set(1, 'p2');
    room.phase = TurnPhase.PropertyManagement;
    const res = redeemProperty(room, 'p1', 1, reg);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_OWNER');
  });

  it('Tu choi khi o dat chua the chap -> NOT_MORTGAGED', () => {
    const { room, reg } = setup();
    reg.set(1, 'p1');
    room.phase = TurnPhase.PropertyManagement;
    const res = redeemProperty(room, 'p1', 1, reg);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_MORTGAGED');
  });

  it('[TC-05.2c/Adversarial] Tu choi khi khong du tien chuoc -> INSUFFICIENT_FUNDS', () => {
    const { room, reg } = setup();
    reg.set(1, 'p1');
    room.players[0]!.mortgagedProperties.push(1);
    room.players[0]!.balance = 100;
    room.phase = TurnPhase.PropertyManagement;
    const res = redeemProperty(room, 'p1', 1, reg);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INSUFFICIENT_FUNDS');
    expect(room.players[0]!.balance).toBe(100);
  });
});

describe('[TC-05.2/Integration] Chuoc dat va khoi phuc thu tien thue', () => {
  it('Chuoc dat xong thi doi thu dam vao phai tra tien thue binh thuong', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.phase = TurnPhase.PropertyManagement;

    // The chap o 1: rent thanh 0
    mgr.handleMortgage(room.roomCode, 'p1', 1);
    let landing = handleLanding(room.players[1]!, 1, reg, room.players, sm, 2);
    expect(landing.rentAmount).toBe(0);

    // Chuoc lai o 1
    room.players[0]!.balance = 10000;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_REDEEM', cellIndex: 1 });
    expect(res.success).toBe(true);

    // Doi thu dam vao -> thu phi binh thuong (C0 pho Hang Bac rent = 60)
    landing = handleLanding(room.players[1]!, 1, reg, room.players, sm, 2);
    expect(landing.rentAmount).toBe(60);
  });
});

describe('[TC-05.2/Integration] Vuot GO bi tru lai am tien va roi vao o dac biet', () => {
  it('Khi bi am tien tai buoc vuot GO va roi vao o Audit (cell 10) -> phai chuyen InsolvencyPhase', () => {
    // Dice: die1=5, die2=6 -> total=11. 39 + 11 = 50 % 40 = 10 (Cell 10: Audit)
    let rollCall = 0;
    const customRng = () => {
      rollCall++;
      return rollCall % 2 === 1 ? 4 / 6 : 5 / 6; // dieRoll: floor(4/6 * 6)+1 = 5, floor(5/6 * 6)+1 = 6
    };
    const { mgr, room, reg, sm } = setup(customRng);

    // P1 co nhieu BĐS the chap khien tong lai vuot tien thuong GO (2000)
    // Cac o co tong no 50,000 -> 5% lai = 2,500
    const mortgagedCells = [39, 37, 34, 32, 31, 29, 27, 26, 24, 23, 21, 19, 18, 16, 14, 13, 11, 9, 8, 6, 3, 1];
    for (const c of mortgagedCells) {
      reg.set(c, 'p1');
      room.players[0]!.mortgagedProperties.push(c);
    }
    room.players[0]!.position = 39;
    room.players[0]!.balance = 100; // 100 + 2000 (GO) - lai (> 10000 * 0.05) -> balance am

    const roll = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll?.passedGo).toBe(true);
    expect(roll?.player.position).toBe(10); // Audit
    expect(room.players[0]!.balance).toBeLessThan(0);
    // Pha FSM phai la InsolvencyPhase vi balance < 0
    expect(room.phase, 'FSM phai chuyen InsolvencyPhase khi am tien sau khi qua GO va vao o Audit').toBe(TurnPhase.InsolvencyPhase);
  });
});

describe('[TC-05.9/MSS][TC-05.10/MSS] Macro Interest Rate Modifiers & Priority', () => {
  it('TC-05.9 [MSS]: Khi MC_RATE_HIKE con hieu luc, lai suat la 10% va tru 10% du no khi qua GO', () => {
    const { room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39); // Cell 39 price 4000 -> loan = 2000
    room.activeModifiers = [{ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1 }];
    expect(getMortgageInterestRate(room)).toBe(0.10);
    const before = room.players[0]!.balance;
    collectMortgageInterest(room, 'p1');
    expect(room.players[0]!.balance).toBe(before - 200); // 2000 * 0.10 = 200
  });

  it('TC-05.10 [MSS]: Khi MC_CREDIT_STIMULUS con hieu luc, lai suat la 0% va khong tru tien khi qua GO', () => {
    const { room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    room.activeModifiers = [{ type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 2 }];
    expect(getMortgageInterestRate(room)).toBe(0);
    const before = room.players[0]!.balance;
    collectMortgageInterest(room, 'p1');
    expect(room.players[0]!.balance).toBe(before);
  });

  it('Uu tien xu ly: Khi ca MC_CREDIT_STIMULUS va MC_RATE_HIKE deu active, stimulus chiem uu tien (lai 0%)', () => {
    const { room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    room.activeModifiers = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1 },
      { type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 1 },
    ];
    expect(getMortgageInterestRate(room)).toBe(0);
    const before = room.players[0]!.balance;
    collectMortgageInterest(room, 'p1');
    expect(room.players[0]!.balance).toBe(before);
  });

  it('Khoi phuc mac dinh: Khi ca 2 the het hieu luc (remainingRounds = 0), khoi phuc lai suat mac dinh 5%', () => {
    const { room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    room.activeModifiers = [
      { type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 0 },
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 0 },
    ];
    expect(getMortgageInterestRate(room)).toBe(0.05);
    const before = room.players[0]!.balance;
    collectMortgageInterest(room, 'p1');
    expect(room.players[0]!.balance).toBe(before - 100); // 2000 * 0.05 = 100
  });

  it('Mac dinh: Khi khong co the modifier nao active, lai suat la 5%', () => {
    const { room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    room.activeModifiers = [];
    expect(getMortgageInterestRate(room)).toBe(0.05);
    const before = room.players[0]!.balance;
    collectMortgageInterest(room, 'p1');
    expect(room.players[0]!.balance).toBe(before - 100);
  });

  it('Edge case: Khi remainingRounds am (< 0), the bi coi la het han va khoi phuc lai suat 5%', () => {
    const { room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    room.activeModifiers = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: -1 },
      { type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: -2 },
    ];
    expect(getMortgageInterestRate(room)).toBe(0.05);
    const before = room.players[0]!.balance;
    collectMortgageInterest(room, 'p1');
    expect(room.players[0]!.balance).toBe(before - 100);
  });

  it('Edge case: Khi activeModifiers la undefined, getMortgageInterestRate tra ve 5% khong throw', () => {
    const { room } = setup();
    (room as any).activeModifiers = undefined;
    expect(getMortgageInterestRate(room)).toBe(0.05);
  });

  it('Integration TC-05.9: handleRollDice qua GO khi MC_RATE_HIKE active tu dong tru 10% lai vay the chap', () => {
    const { mgr, room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    room.players[0]!.position = 39;
    room.activeModifiers = [{ type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1 }];
    const before = room.players[0]!.balance;
    const roll = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll?.passedGo).toBe(true);
    expect(room.players[0]!.balance).toBe(before + 2000 - 200);
  });

  it('Integration TC-05.10: handleRollDice qua GO khi MC_CREDIT_STIMULUS active khong tru lai vay the chap', () => {
    const { mgr, room, reg } = setup();
    reg.set(39, 'p1');
    room.players[0]!.mortgagedProperties.push(39);
    room.players[0]!.position = 39;
    room.activeModifiers = [{ type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 2 }];
    const before = room.players[0]!.balance;
    const roll = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll?.passedGo).toBe(true);
    expect(room.players[0]!.balance).toBe(before + 2000);
  });
});

