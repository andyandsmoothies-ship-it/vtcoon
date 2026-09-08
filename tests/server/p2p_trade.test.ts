// [UC-GAME-056/MSS][TC-05.5/MSS][TC-05.5-anti/MSS][TC-05.5-inv/Adversarial] P2P Trade & Transfer Tax Acceptance Tests
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { MarketCardId } from '../../src/domain/event_card_types';
import { executeP2PTrade } from '../../src/server/property_actions';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher';
import type { PropertyStateMap } from '../../src/domain/property_manager';

function setup(rng = () => 0) {
  const mgr = new RoomManager(rng);
  const room = mgr.createRoom('p1');
  mgr.joinRoom(room.roomCode, 'p2');
  mgr.startGame(room.roomCode);
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm = (mgr as any).propertyStates.get(room.roomCode) as PropertyStateMap;
  return { mgr, room, reg, sm };
}

describe('[TC-05.5/MSS] P2P Trading Cap 0 & 5% Thue Chuyen Nhuong', () => {
  it('Giao dich truc tiep executeP2PTrade: nguoi mua tra tien + 5% thue, nguoi ban nhan du, so huu doi', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.players[0]!.balance = 5000;
    room.players[1]!.balance = 10000;
    room.treasury = 0;

    const res = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(res.success, String(res.reason)).toBe(true);
    expect(reg.get(1)).toBe('p2');
    expect(room.players[1]!.balance).toBe(10000 - 840); // 800 + 40 tax (5%)
    expect(room.players[0]!.balance).toBe(5000 + 800);
    expect(room.treasury).toBe(40);
  });

  it('Giao dich qua RoomManager.handleTradeOffer uy quyen thanh cong', () => {
    const { mgr, room, reg } = setup();
    reg.set(3, 'p1');
    room.players[0]!.balance = 3000;
    room.players[1]!.balance = 8000;
    room.treasury = 100;

    const res = mgr.handleTradeOffer(room.roomCode, 'p1', 'p1', 'p2', 3, 1000);
    expect(res.success, String(res.reason)).toBe(true);
    expect(reg.get(3)).toBe('p2');
    expect(room.players[1]!.balance).toBe(8000 - 1050); // 1000 + 50 tax (5%)
    expect(room.players[0]!.balance).toBe(3000 + 1000);
    expect(room.treasury).toBe(100 + 50);
  });

  it('Giao dich qua Intent Dispatcher INTENT_TRADE_OFFER hoat dong tron ven', () => {
    const { mgr, room, reg } = setup();
    reg.set(6, 'p1');
    room.players[0]!.balance = 4000;
    room.players[1]!.balance = 6000;
    room.treasury = 0;

    const res = dispatchPlayerIntent(mgr, room.roomCode, 'p1', {
      type: 'INTENT_TRADE_OFFER',
      sellerId: 'p1',
      buyerId: 'p2',
      cellIndex: 6,
      price: 2000,
    });
    expect(res.success, String(res.reason)).toBe(true);
    expect(reg.get(6)).toBe('p2');
    expect(room.players[1]!.balance).toBe(6000 - 2100); // 2000 + 100 (5%)
    expect(room.players[0]!.balance).toBe(4000 + 2000);
    expect(room.treasury).toBe(100);
  });
});

describe('[TC-05.5-anti/MSS] Macro Card MC_ANTI_SPECULATE Tang Thue 20%', () => {
  it('Khi MC_ANTI_SPECULATE con hieu luc: thue tu dong tang len 20% nop Kho bac', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.players[0]!.balance = 2000;
    room.players[1]!.balance = 5000;
    room.treasury = 50;
    room.activeModifiers = [
      { type: MarketCardId.MC_ANTI_SPECULATE, affectedCells: [], remainingRounds: 2 },
    ];

    const res = executeP2PTrade(room, 'p1', 'p2', 1, 1000, reg, sm);
    expect(res.success, String(res.reason)).toBe(true);
    expect(reg.get(1)).toBe('p2');
    expect(room.players[1]!.balance).toBe(5000 - 1200); // 1000 + 200 tax (20%)
    expect(room.players[0]!.balance).toBe(2000 + 1000);
    expect(room.treasury).toBe(50 + 200);
  });

  it('Khi MC_ANTI_SPECULATE da het han (remainingRounds = 0): thue tro ve 5%', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.players[0]!.balance = 2000;
    room.players[1]!.balance = 5000;
    room.treasury = 0;
    room.activeModifiers = [
      { type: MarketCardId.MC_ANTI_SPECULATE, affectedCells: [], remainingRounds: 0 },
    ];

    const res = executeP2PTrade(room, 'p1', 'p2', 1, 1000, reg, sm);
    expect(res.success, String(res.reason)).toBe(true);
    expect(room.players[1]!.balance).toBe(5000 - 1050); // 1000 + 50 tax (5%)
    expect(room.players[0]!.balance).toBe(2000 + 1000);
    expect(room.treasury).toBe(50);
  });
});

describe('[TC-05.5-inv/Adversarial] Tu Choi Giao Dich Bat Hop Le', () => {
  it('Tu choi khi BDS da co cong trinh C1-C3 -> PROPERTY_HAS_BUILDING', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    sm.set(1, { level: 1 });
    const p1Before = room.players[0]!.balance;
    const p2Before = room.players[1]!.balance;
    const treasuryBefore = room.treasury;

    const resC1 = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(resC1.success).toBe(false);
    expect(resC1.reason).toBe('PROPERTY_HAS_BUILDING');
    expect(reg.get(1)).toBe('p1');
    expect(room.players[0]!.balance).toBe(p1Before);
    expect(room.players[1]!.balance).toBe(p2Before);
    expect(room.treasury).toBe(treasuryBefore);

    // C2 check
    sm.set(1, { level: 2 });
    const resC2 = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(resC2.success).toBe(false);
    expect(resC2.reason).toBe('PROPERTY_HAS_BUILDING');

    // C3 check
    sm.set(1, { level: 3 });
    const resC3 = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(resC3.success).toBe(false);
    expect(resC3.reason).toBe('PROPERTY_HAS_BUILDING');
  });

  it('Tu choi khi nguoi ban khong so huu BDS -> NOT_OWNER', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p2'); // Owned by p2, but p1 tries to sell

    const res = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_OWNER');

    // Unowned property
    reg.delete(1);
    const resUnowned = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(resUnowned.success).toBe(false);
    expect(resUnowned.reason).toBe('NOT_OWNER');
  });

  it('Tu choi khi nguoi mua khong du tien (bao gom ca thue) -> INSUFFICIENT_FUNDS', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.players[1]!.balance = 839; // Needs 800 + 40 = 840

    const res = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INSUFFICIENT_FUNDS');
    expect(reg.get(1)).toBe('p1');
    expect(room.players[1]!.balance).toBe(839);

    // With MC_ANTI_SPECULATE: needs 1000 + 200 = 1200
    room.activeModifiers = [
      { type: MarketCardId.MC_ANTI_SPECULATE, affectedCells: [], remainingRounds: 1 },
    ];
    room.players[1]!.balance = 1199;
    const resAnti = executeP2PTrade(room, 'p1', 'p2', 1, 1000, reg, sm);
    expect(resAnti.success).toBe(false);
    expect(resAnti.reason).toBe('INSUFFICIENT_FUNDS');
  });

  it('Tu choi khi thi truong bi dong bang -> FREEZE_ACTIVE', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.activeModifiers = [
      { type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 1 },
    ];

    const res = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('FREEZE_ACTIVE');
    expect(reg.get(1)).toBe('p1');

    // Expired modifier (remainingRounds = 0) does not block
    room.activeModifiers = [
      { type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 0 },
    ];
    const resExpired = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(resExpired.success).toBe(true);
  });

  it('Tu choi khi game chua bat dau -> GAME_NOT_STARTED', () => {
    const { room, reg, sm } = setup();
    room.started = false;
    reg.set(1, 'p1');

    const res = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('GAME_NOT_STARTED');
  });

  it('Tu choi khi o dat khong thuoc danh muc mua ban (NOT_PURCHASABLE)', () => {
    const { room, reg, sm } = setup();
    reg.set(0, 'p1'); // Cell 0 is GO, not purchasable

    const res = executeP2PTrade(room, 'p1', 'p2', 0, 800, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('NOT_PURCHASABLE');
  });

  it('Tu choi khi nguoi choi khong ton tai trong phong -> PLAYER_NOT_FOUND', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');

    const res = executeP2PTrade(room, 'p1', 'p_unknown', 1, 800, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('PLAYER_NOT_FOUND');
  });

  it('Tu choi khi roomCode khong ton tai qua RoomManager -> INVALID_ROOM', () => {
    const { mgr } = setup();
    const res = mgr.handleTradeOffer('NON_EXISTENT', 'p1', 'p1', 'p2', 1, 800);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_ROOM');
  });

  it('Tu choi khi dang o InsolvencyPhase qua Intent Dispatcher -> INVALID_PHASE', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    room.phase = TurnPhase.InsolvencyPhase;

    const res = dispatchPlayerIntent(mgr, room.roomCode, 'p1', {
      type: 'INTENT_TRADE_OFFER',
      sellerId: 'p1',
      buyerId: 'p2',
      cellIndex: 1,
      price: 800,
    });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_PHASE');
  });

  it('Tu choi khi gia giao dich khong hop le (<= 0 hoac khong nguyen) -> INVALID_PRICE', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    expect(executeP2PTrade(room, 'p1', 'p2', 1, -500, reg, sm).reason).toBe('INVALID_PRICE');
    expect(executeP2PTrade(room, 'p1', 'p2', 1, 0, reg, sm).reason).toBe('INVALID_PRICE');
    expect(executeP2PTrade(room, 'p1', 'p2', 1, 100.5, reg, sm).reason).toBe('INVALID_PRICE');
  });

  it('Tu choi khi tu giao dich voi chinh minh -> INVALID_TRADE', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    const res = executeP2PTrade(room, 'p1', 'p1', 1, 800, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_TRADE');
  });

  it('Tu choi khi BDS dang bi the chap (mortgaged) -> PROPERTY_MORTGAGED', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.players[0]!.mortgagedProperties = [1];
    const res = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('PROPERTY_MORTGAGED');
  });

  it('Tu choi khi nguoi choi da bi pha san -> PLAYER_BANKRUPT', () => {
    const { room, reg, sm } = setup();
    reg.set(1, 'p1');
    room.players[1]!.bankrupt = true;
    const res = executeP2PTrade(room, 'p1', 'p2', 1, 800, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('PLAYER_BANKRUPT');
  });

  it('Tu choi khi tien ich da nang cap hoac ha tang co ETC -> PROPERTY_HAS_BUILDING', () => {
    const { room, reg, sm } = setup();
    reg.set(12, 'p1');
    sm.set(12, { level: 0, isUpgradedUtility: true });
    expect(executeP2PTrade(room, 'p1', 'p2', 12, 1500, reg, sm).reason).toBe('PROPERTY_HAS_BUILDING');
    reg.set(5, 'p1');
    sm.set(5, { level: 0, isETC: true });
    expect(executeP2PTrade(room, 'p1', 'p2', 5, 2000, reg, sm).reason).toBe('PROPERTY_HAS_BUILDING');
  });

  it('Tu choi khi ben thu ba gui trade offer qua RoomManager -> UNAUTHORIZED', () => {
    const { mgr, room, reg } = setup();
    reg.set(1, 'p1');
    const res = mgr.handleTradeOffer(room.roomCode, 'p3', 'p1', 'p2', 1, 800);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('UNAUTHORIZED');
  });
});
