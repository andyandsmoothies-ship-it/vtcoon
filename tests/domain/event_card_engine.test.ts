// [TC-04.T1/MSS] Event Card Engine — Enums, Cell Groups, Decks & HOSE Resolver
// Traceability: UC-GAME-038/MSS, UC-GAME-040/MSS, UC-GAME-046/MSS

import { describe, it, test, expect } from 'vitest';
import { mulberry32 } from '../../src/domain/dice';
import { createPlayer, type MarketModifier } from '../../src/domain/room';
import {
  handleLanding,
  LandingResult,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_manager';
import {
  MarketCardId,
  ChanceCardId,
  RESORT_CELLS,
  COASTAL_CELLS,
  SERVICE_CELLS,
  INFRA_CELLS,
  UTILITY_CELLS,
  UTILITY_CELLS_ECE,
  HANOI_HCMC_CELLS,
  LAND_FEVER_CELLS,
  HOSE_OUTCOMES,
  createMarketDeck,
  createChanceDeck,
  resolveHoseInvestment,
  applyMarketCard,
  applyChanceCard,
  decayModifiers,
} from '../../src/domain/event_card_engine';

describe('[TC-04.T1/MSS] Event Card Engine — Enums & Constants', () => {
  it('MarketCardId định nghĩa đủ 16 thẻ thị trường duy nhất', () => {
    const marketCards = Object.values(MarketCardId);
    expect(marketCards).toHaveLength(16);
    expect(new Set(marketCards).size).toBe(16);
    expect(marketCards).toContain(MarketCardId.MC_PEAK_TOURISM);
    expect(marketCards).toContain(MarketCardId.MC_COASTAL_STORM);
  });

  it('ChanceCardId định nghĩa đủ 20 thẻ cơ hội duy nhất', () => {
    const chanceCards = Object.values(ChanceCardId);
    expect(chanceCards).toHaveLength(20);
    expect(new Set(chanceCards).size).toBe(20);
    expect(chanceCards).toContain(ChanceCardId.CC_STOCK_PROFIT);
    expect(chanceCards).toContain(ChanceCardId.CC_DIPLOMATIC);
  });

  it('Hằng số nhóm ô được định nghĩa chính xác theo đặc tả', () => {
    expect(RESORT_CELLS).toEqual([11, 13, 14, 21, 24, 29]);
    expect(COASTAL_CELLS).toEqual([11, 14, 16, 18, 19]);
    expect(SERVICE_CELLS).toEqual([6, 8, 26, 27]);
    expect(INFRA_CELLS).toEqual([5, 15, 25, 35]);
    expect(UTILITY_CELLS).toEqual([12, 28]);
    expect(UTILITY_CELLS_ECE).toEqual([12, 28]);
    expect(HANOI_HCMC_CELLS).toEqual([31, 32, 34, 37, 39]);
    expect(LAND_FEVER_CELLS).toEqual([6, 8, 31]);
  });
});

describe('[TC-04.T1/MSS] Event Card Engine — Decks & Shuffle', () => {
  it('createMarketDeck trả về 16 thẻ và tất cả đều là duy nhất', () => {
    const rng = mulberry32(100);
    const deck = createMarketDeck(rng);
    expect(deck).toHaveLength(16);
    expect(new Set(deck).size).toBe(16);
  });

  it('createMarketDeck cùng seed cho thứ tự giống nhau hoàn toàn (deterministic)', () => {
    const deck1 = createMarketDeck(mulberry32(42));
    const deck2 = createMarketDeck(mulberry32(42));
    expect(deck1).toEqual(deck2);
  });

  it('createMarketDeck khác seed cho thứ tự khác nhau', () => {
    const deck1 = createMarketDeck(mulberry32(1));
    const deck2 = createMarketDeck(mulberry32(9999));
    expect(deck1).not.toEqual(deck2);
  });

  it('createChanceDeck trả về 20 thẻ và tất cả đều là duy nhất', () => {
    const rng = mulberry32(100);
    const deck = createChanceDeck(rng);
    expect(deck).toHaveLength(20);
    expect(new Set(deck).size).toBe(20);
  });

  it('createChanceDeck cùng seed cho thứ tự giống nhau hoàn toàn (deterministic)', () => {
    const deck1 = createChanceDeck(mulberry32(777));
    const deck2 = createChanceDeck(mulberry32(777));
    expect(deck1).toEqual(deck2);
  });

  it('createChanceDeck khác seed cho thứ tự khác nhau', () => {
    const deck1 = createChanceDeck(mulberry32(1));
    const deck2 = createChanceDeck(mulberry32(8888));
    expect(deck1).not.toEqual(deck2);
  });

  it('createMarketDeck và createChanceDeck chứa đúng và đủ mọi thẻ trong enum', () => {
    const marketDeck = createMarketDeck(mulberry32(123));
    const allMarketCards = Object.values(MarketCardId);
    expect(marketDeck).toEqual(expect.arrayContaining(allMarketCards));
    expect(allMarketCards).toEqual(expect.arrayContaining(marketDeck));

    const chanceDeck = createChanceDeck(mulberry32(456));
    const allChanceCards = Object.values(ChanceCardId);
    expect(chanceDeck).toEqual(expect.arrayContaining(allChanceCards));
    expect(allChanceCards).toEqual(expect.arrayContaining(chanceDeck));
  });
});

describe('[TC-04.T1/MSS] HOSE Investment Resolver (1D6)', () => {
  it('HOSE_OUTCOMES định nghĩa đủ 6 tỷ lệ hoàn vốn chuẩn', () => {
    expect(HOSE_OUTCOMES[1]).toBe(0.50);
    expect(HOSE_OUTCOMES[2]).toBe(0.75);
    expect(HOSE_OUTCOMES[3]).toBe(1.00);
    expect(HOSE_OUTCOMES[4]).toBe(1.20);
    expect(HOSE_OUTCOMES[5]).toBe(1.50);
    expect(HOSE_OUTCOMES[6]).toBe(2.00);
  });

  it('resolveHoseInvestment tính đúng 6 trường hợp lời/lỗ 1D6', () => {
    // Mặt 1: Lỗ 50% (x0.50)
    expect(resolveHoseInvestment(2000, 1)).toBe(1000);
    // Mặt 2: Lỗ 25% (x0.75)
    expect(resolveHoseInvestment(2000, 2)).toBe(1500);
    // Mặt 3: Hòa vốn (x1.00)
    expect(resolveHoseInvestment(1000, 3)).toBe(1000);
    // Mặt 4: Lời 20% (x1.20)
    expect(resolveHoseInvestment(1000, 4)).toBe(1200);
    // Mặt 5: Lời 50% (x1.50)
    expect(resolveHoseInvestment(2000, 5)).toBe(3000);
    // Mặt 6: Lời 100% (x2.00)
    expect(resolveHoseInvestment(2000, 6)).toBe(4000);
  });

  it('resolveHoseInvestment tính chính xác tại các biên vốn cược [500, 3000] và xử lý mặt xúc xắc không hợp lệ', () => {
    // Biên tối thiểu 500
    expect(resolveHoseInvestment(500, 1)).toBe(250);
    expect(resolveHoseInvestment(500, 2)).toBe(375);
    expect(resolveHoseInvestment(500, 6)).toBe(1000);

    // Biên tối đa 3000
    expect(resolveHoseInvestment(3000, 1)).toBe(1500);
    expect(resolveHoseInvestment(3000, 4)).toBe(3600);
    expect(resolveHoseInvestment(3000, 6)).toBe(6000);

    // Mặt xúc xắc ngoài khoảng 1..6 trả về 0 an toàn
    expect(resolveHoseInvestment(1000, 0)).toBe(0);
    expect(resolveHoseInvestment(1000, 7)).toBe(0);
  });
});

describe('[TC-04.T4/MSS] Market Modifier System & apply/decay Functions', () => {
  test('[TC-04.T4/MSS] applyMarketCard(MC_PEAK_TOURISM) thêm modifier affectedCells=RESORT_CELLS, remainingRounds=1, multiplier=2', () => {
    const modifiers: MarketModifier[] = [];
    applyMarketCard(MarketCardId.MC_PEAK_TOURISM, modifiers, [], new Map(), new Map());
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({
      type: MarketCardId.MC_PEAK_TOURISM,
      affectedCells: RESORT_CELLS,
      remainingRounds: 1,
      multiplier: 2,
    });
  });

  test('[TC-04.T4/MSS] applyMarketCard(MC_COASTAL_STORM) thêm modifier affectedCells=COASTAL_CELLS, remainingRounds=1, multiplier=0', () => {
    const modifiers: MarketModifier[] = [];
    applyMarketCard(MarketCardId.MC_COASTAL_STORM, modifiers, [], new Map(), new Map());
    expect(modifiers).toHaveLength(1);
    expect(modifiers[0]).toEqual({
      type: MarketCardId.MC_COASTAL_STORM,
      affectedCells: COASTAL_CELLS,
      remainingRounds: 1,
      multiplier: 0,
    });
  });

  test('[TC-04.T4/MSS] decayModifiers giảm remainingRounds và loại bỏ modifier khi chạm 0', () => {
    const initial: MarketModifier[] = [
      { type: MarketCardId.MC_PEAK_TOURISM, affectedCells: RESORT_CELLS, remainingRounds: 2, multiplier: 2 },
      { type: MarketCardId.MC_COASTAL_STORM, affectedCells: COASTAL_CELLS, remainingRounds: 1, multiplier: 0 },
    ];
    const round1 = decayModifiers(initial);
    expect(round1).toHaveLength(1);
    expect(round1[0]?.remainingRounds).toBe(1);
    expect(round1[0]?.type).toBe(MarketCardId.MC_PEAK_TOURISM);

    const round2 = decayModifiers(round1);
    expect(round2).toHaveLength(0);
  });

  test('[TC-04.T4/MSS] handleLanding: MC_COASTAL_STORM active trên ô duyên hải -> rentAmount = 0', () => {
    const registry: PropertyRegistry = new Map([[14, 'p_owner']]);
    const stateMap: PropertyStateMap = new Map([[14, { level: 2 }]]);
    const visitor = createPlayer('visitor');
    visitor.balance = 8000;
    const owner = createPlayer('p_owner');
    owner.balance = 10000;
    const modifiers: MarketModifier[] = [
      { type: MarketCardId.MC_COASTAL_STORM, affectedCells: COASTAL_CELLS, remainingRounds: 1, multiplier: 0 },
    ];

    const res = handleLanding(visitor, 14, registry, [visitor, owner], stateMap, undefined, modifiers);
    expect(res.rentAmount).toBe(0);
    expect(res.result).toBe(LandingResult.RentPaid);
    expect(visitor.balance).toBe(8000);
    expect(owner.balance).toBe(10000);
  });

  test('[TC-04.T4/MSS] handleLanding: MC_PEAK_TOURISM active trên ô nghỉ dưỡng -> rentAmount = baseRent * 2', () => {
    const registry: PropertyRegistry = new Map([[11, 'p_owner']]);
    const stateMap: PropertyStateMap = new Map([[11, { level: 1 }]]); // deed11 rent1 = 420
    const visitor = createPlayer('visitor');
    visitor.balance = 10000;
    const owner = createPlayer('p_owner');
    owner.balance = 5000;
    const modifiers: MarketModifier[] = [
      { type: MarketCardId.MC_PEAK_TOURISM, affectedCells: RESORT_CELLS, remainingRounds: 1, multiplier: 2 },
    ];

    const res = handleLanding(visitor, 11, registry, [visitor, owner], stateMap, undefined, modifiers);
    expect(res.rentAmount).toBe(840);
    expect(visitor.balance).toBe(10000 - 840);
    expect(owner.balance).toBe(5000 + 840);
  });

  test('[TC-04.T4/MSS] handleLanding: xung đột cả 2 thẻ trên ô 11 -> rentAmount = 0 (Zero-rent thắng tuyệt đối)', () => {
    const registry: PropertyRegistry = new Map([[11, 'p_owner']]);
    const stateMap: PropertyStateMap = new Map([[11, { level: 1 }]]);
    const visitor = createPlayer('visitor');
    visitor.balance = 10000;
    const owner = createPlayer('p_owner');
    owner.balance = 5000;
    const modifiers: MarketModifier[] = [
      { type: MarketCardId.MC_PEAK_TOURISM, affectedCells: RESORT_CELLS, remainingRounds: 1, multiplier: 2 },
      { type: MarketCardId.MC_COASTAL_STORM, affectedCells: COASTAL_CELLS, remainingRounds: 1, multiplier: 0 },
    ];

    const res = handleLanding(visitor, 11, registry, [visitor, owner], stateMap, undefined, modifiers);
    expect(res.rentAmount).toBe(0);
    expect(visitor.balance).toBe(10000);
    expect(owner.balance).toBe(5000);
  });

  test('[TC-04.T4/MSS] handleLanding: MC_NIGHT_ECONOMY KHÔNG nhân đôi tiền thuê ô Dịch vụ Cấp 0 (đất trống)', () => {
    const registry: PropertyRegistry = new Map([[6, 'p_owner']]);
    const stateMap: PropertyStateMap = new Map([[6, { level: 0 }]]); // deed6 rent0 = 120
    const visitor = createPlayer('visitor');
    visitor.balance = 5000;
    const owner = createPlayer('p_owner');
    owner.balance = 2000;
    const modifiers: MarketModifier[] = [
      { type: MarketCardId.MC_NIGHT_ECONOMY, affectedCells: SERVICE_CELLS, remainingRounds: 1, multiplier: 2 },
    ];

    const res = handleLanding(visitor, 6, registry, [visitor, owner], stateMap, undefined, modifiers);
    // Cấp 0 không bị nhân đôi, giữ nguyên rent0 = 120
    expect(res.rentAmount).toBe(120);
    expect(visitor.balance).toBe(5000 - 120);
    expect(owner.balance).toBe(2000 + 120);
  });

  test('[TC-04.T4/MSS] handleLanding: MC_NIGHT_ECONOMY nhân đôi tiền thuê ô Dịch vụ từ Cấp 1 trở lên', () => {
    const registry: PropertyRegistry = new Map([[6, 'p_owner']]);
    const stateMap: PropertyStateMap = new Map([[6, { level: 1 }]]); // deed6 rent1 = 400
    const visitor = createPlayer('visitor');
    visitor.balance = 5000;
    const owner = createPlayer('p_owner');
    owner.balance = 2000;
    const modifiers: MarketModifier[] = [
      { type: MarketCardId.MC_NIGHT_ECONOMY, affectedCells: SERVICE_CELLS, remainingRounds: 1, multiplier: 2 },
    ];

    const res = handleLanding(visitor, 6, registry, [visitor, owner], stateMap, undefined, modifiers);
    // Cấp 1 được nhân đôi: 400 * 2 = 800
    expect(res.rentAmount).toBe(800);
    expect(visitor.balance).toBe(5000 - 800);
    expect(owner.balance).toBe(2000 + 800);
  });

  test('[TC-04.T4/MSS] handleLanding: Ô Dịch vụ C2 + xúc xắc chẵn -> phụ thu 200 Tr. VNĐ', () => {
    const registry: PropertyRegistry = new Map([[6, 'p_owner']]);
    const stateMap: PropertyStateMap = new Map([[6, { level: 2 }]]); // deed6 rent2 = 1000
    const visitor = createPlayer('visitor');
    visitor.balance = 5000;
    const owner = createPlayer('p_owner');
    owner.balance = 2000;
    const rngEven = () => 0.2; // Math.floor(0.2 * 6) + 1 = 2 (chẵn)

    const res = handleLanding(visitor, 6, registry, [visitor, owner], stateMap, undefined, undefined, rngEven);
    expect(res.rentAmount).toBe(1200);
    expect(visitor.balance).toBe(5000 - 1000 - 200);
    expect(owner.balance).toBe(2000 + 1000 + 200);
  });

  test('[TC-04.T4/MSS] handleLanding: Ô Dịch vụ C2 + xúc xắc lẻ -> không phụ thu', () => {
    const registry: PropertyRegistry = new Map([[6, 'p_owner']]);
    const stateMap: PropertyStateMap = new Map([[6, { level: 2 }]]); // deed6 rent2 = 1000
    const visitor = createPlayer('visitor');
    visitor.balance = 5000;
    const owner = createPlayer('p_owner');
    owner.balance = 2000;
    const rngOdd = () => 0; // Math.floor(0 * 6) + 1 = 1 (lẻ)

    const res = handleLanding(visitor, 6, registry, [visitor, owner], stateMap, undefined, undefined, rngOdd);
    expect(res.rentAmount).toBe(1000);
    expect(visitor.balance).toBe(5000 - 1000);
    expect(owner.balance).toBe(2000 + 1000);
  });

  test('[TC-04.T4/MSS] handleLanding: Ô Dịch vụ C3 -> player.skipNextTurn = true', () => {
    const registry: PropertyRegistry = new Map([[6, 'p_owner']]);
    const stateMap: PropertyStateMap = new Map([[6, { level: 3 }]]); // deed6 rent3 = 2500
    const visitor = createPlayer('visitor');
    visitor.balance = 5000;
    const owner = createPlayer('p_owner');
    owner.balance = 2000;

    const res = handleLanding(visitor, 6, registry, [visitor, owner], stateMap);
    expect(res.rentAmount).toBe(2500);
    expect(visitor.balance).toBe(5000 - 2500);
    expect(owner.balance).toBe(2000 + 2500);
    expect(visitor.skipNextTurn).toBe(true);
  });

  test('[TC-04.T4/MSS] applyChanceCard: CC_STOCK_PROFIT, CC_DIPLOMATIC, CC_TAX_AUDIT', () => {
    const player = createPlayer('p1');
    const initialBalance = player.balance;

    applyChanceCard(ChanceCardId.CC_STOCK_PROFIT, player.id, [player], []);
    expect(player.balance).toBe(initialBalance + 2500);

    applyChanceCard(ChanceCardId.CC_DIPLOMATIC, player.id, [player], []);
    expect(player.hand).toContain(ChanceCardId.CC_DIPLOMATIC);

    // CC_TAX_AUDIT: Phạt 200 Tr. mỗi ô đất trống (Cấp 0). Ô 1 (Cấp 0) và Ô 3 (Cấp 1); Ô 5 (Hạ tầng), Ô 12 (Tiện ích) không bị tính -> phạt đúng 200
    const registry: PropertyRegistry = new Map([[1, player.id], [3, player.id], [5, player.id], [12, player.id]]);
    const stateMap: PropertyStateMap = new Map([[3, { level: 1 }]]);
    const beforeTax = player.balance;
    const auditRes = applyChanceCard(ChanceCardId.CC_TAX_AUDIT, player.id, [player], [], registry, stateMap);
    expect(auditRes).toEqual({});
    expect(player.balance).toBe(beforeTax - 200);
  });
});

describe('[TC-04.T4-UC050/MSS] Chance Cards Multi-Round Debt Recording', () => {
  test('[TC-04.T4-UC050/MSS] applyChanceCard ghi nhận CC_OVERDRAFT và CC_FREE_CREDIT vào player.pendingDebts và cộng tiền mặt', () => {
    const player = createPlayer('p1');
    expect(player.pendingDebts).toEqual([]);
    const startBal = player.balance;

    applyChanceCard(ChanceCardId.CC_OVERDRAFT, player.id, [player], []);
    expect(player.pendingDebts).toContain(ChanceCardId.CC_OVERDRAFT);
    expect(player.balance).toBe(startBal + 3000);

    applyChanceCard(ChanceCardId.CC_FREE_CREDIT, player.id, [player], []);
    expect(player.pendingDebts).toContain(ChanceCardId.CC_FREE_CREDIT);
    expect(player.pendingDebts).toHaveLength(2);
    expect(player.balance).toBe(startBal + 3000 + 2000);
  });
});

describe('[TC-04.T4-DIP/MSS] Thẻ Miễn Trừ Ngoại Giao (CC_DIPLOMATIC) trong handleLanding', () => {
  test('CC_DIPLOMATIC miễn 100% tiền thuê BĐS đối thủ Cấp 0, 1, 2 và thu hồi thẻ vào chanceDiscard', () => {
    const registry: PropertyRegistry = new Map([[1, 'owner_p']]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 2 }]]); // rent2 = 540
    const visitor = createPlayer('visitor');
    visitor.balance = 5000;
    visitor.hand = [ChanceCardId.CC_DIPLOMATIC];
    const owner = createPlayer('owner_p');
    owner.balance = 2000;
    const chanceDiscard: ChanceCardId[] = [];

    const res = handleLanding(visitor, 1, registry, [visitor, owner], stateMap, undefined, undefined, undefined, chanceDiscard);
    expect(res.rentAmount).toBe(0);
    expect(visitor.balance).toBe(5000);
    expect(owner.balance).toBe(2000);
    expect(visitor.hand).not.toContain(ChanceCardId.CC_DIPLOMATIC);
    expect(chanceDiscard).toContain(ChanceCardId.CC_DIPLOMATIC);
  });

  test('CC_DIPLOMATIC áp dụng cho cả công trình Cấp 3: miễn 100% tiền thuê và thu hồi thẻ vào chanceDiscard', () => {
    const registry: PropertyRegistry = new Map([[1, 'owner_p']]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 3 }]]); // rent3 = 1320
    const visitor = createPlayer('visitor');
    visitor.balance = 5000;
    visitor.hand = [ChanceCardId.CC_DIPLOMATIC];
    const owner = createPlayer('owner_p');
    owner.balance = 2000;
    const chanceDiscard: ChanceCardId[] = [];

    const res = handleLanding(visitor, 1, registry, [visitor, owner], stateMap, undefined, undefined, undefined, chanceDiscard);
    expect(res.rentAmount).toBe(0);
    expect(visitor.balance).toBe(5000);
    expect(owner.balance).toBe(2000);
    expect(visitor.hand).not.toContain(ChanceCardId.CC_DIPLOMATIC);
    expect(chanceDiscard).toContain(ChanceCardId.CC_DIPLOMATIC);
  });

  test('CC_DIPLOMATIC KHÔNG áp dụng cho Hạ tầng (Railroad) và Tiện ích (Utility): giữ nguyên thẻ trên tay', () => {
    const registry: PropertyRegistry = new Map([[5, 'owner_p'], [12, 'owner_p']]);
    const visitor = createPlayer('visitor');
    visitor.balance = 5000;
    visitor.hand = [ChanceCardId.CC_DIPLOMATIC];
    const owner = createPlayer('owner_p');
    owner.balance = 2000;
    const chanceDiscard: ChanceCardId[] = [];

    // Dừng ô 5 (Railroad 1 ô -> 500)
    const resRR = handleLanding(visitor, 5, registry, [visitor, owner], undefined, undefined, undefined, undefined, chanceDiscard);
    expect(resRR.rentAmount).toBe(500);
    expect(visitor.balance).toBe(4500);
    expect(visitor.hand).toContain(ChanceCardId.CC_DIPLOMATIC);
    expect(chanceDiscard).toHaveLength(0);

    // Dừng ô 12 (Utility 1 ô, diceTotal=8 -> 8 * 40 = 320)
    const resUtil = handleLanding(visitor, 12, registry, [visitor, owner], undefined, 8, undefined, undefined, chanceDiscard);
    expect(resUtil.rentAmount).toBe(320);
    expect(visitor.balance).toBe(4500 - 320);
    expect(visitor.hand).toContain(ChanceCardId.CC_DIPLOMATIC);
    expect(chanceDiscard).toHaveLength(0);
  });

  test('MC_COASTAL_STORM (Zero-rent) ưu tiên trước CC_DIPLOMATIC: miễn phí thuê và bảo toàn thẻ trên tay', () => {
    const registry: PropertyRegistry = new Map([[14, 'owner_p']]);
    const stateMap: PropertyStateMap = new Map([[14, { level: 2 }]]); // rent2 = 1280
    const visitor = createPlayer('visitor');
    visitor.balance = 5000;
    visitor.hand = [ChanceCardId.CC_DIPLOMATIC];
    const owner = createPlayer('owner_p');
    owner.balance = 2000;
    const chanceDiscard: ChanceCardId[] = [];
    const storm: MarketModifier[] = [
      { type: MarketCardId.MC_COASTAL_STORM, affectedCells: COASTAL_CELLS, remainingRounds: 1, multiplier: 0 },
    ];

    const res = handleLanding(visitor, 14, registry, [visitor, owner], stateMap, undefined, storm, undefined, chanceDiscard);
    expect(res.rentAmount).toBe(0);
    expect(visitor.balance).toBe(5000);
    expect(owner.balance).toBe(2000);
    expect(visitor.hand).toContain(ChanceCardId.CC_DIPLOMATIC); // Thẻ không bị tiêu thụ
    expect(chanceDiscard).not.toContain(ChanceCardId.CC_DIPLOMATIC);
  });
});

describe('[TC-04.T4/EDGE] Market Modifier Expiration & affectedCells Scoping', () => {
  test('[TC-04.T4/EDGE] handleLanding bỏ qua modifier đã hết hạn (remainingRounds <= 0)', () => {
    const registry: PropertyRegistry = new Map([[14, 'p_owner']]);
    const stateMap: PropertyStateMap = new Map([[14, { level: 2 }]]); // rent2 = 1280
    const visitor = createPlayer('visitor');
    visitor.balance = 8000;
    const owner = createPlayer('p_owner');
    owner.balance = 10000;
    const expiredStorm: MarketModifier[] = [
      { type: MarketCardId.MC_COASTAL_STORM, affectedCells: COASTAL_CELLS, remainingRounds: 0, multiplier: 0 },
    ];

    const res = handleLanding(visitor, 14, registry, [visitor, owner], stateMap, undefined, expiredStorm);
    expect(res.rentAmount).toBe(1280);
    expect(visitor.balance).toBe(8000 - 1280);

    const expiredTourism: MarketModifier[] = [
      { type: MarketCardId.MC_PEAK_TOURISM, affectedCells: RESORT_CELLS, remainingRounds: 0, multiplier: 2 },
    ];
    registry.set(11, 'p_owner');
    stateMap.set(11, { level: 1 }); // rent1 = 420
    const res2 = handleLanding(visitor, 11, registry, [visitor, owner], stateMap, undefined, expiredTourism);
    expect(res2.rentAmount).toBe(420); // Not doubled to 840
  });

  test('[TC-04.T4/EDGE] handleLanding tôn trọng danh sách affectedCells riêng của modifier', () => {
    const registry: PropertyRegistry = new Map([[14, 'p_owner']]);
    const stateMap: PropertyStateMap = new Map([[14, { level: 2 }]]); // rent2 = 1280
    const visitor = createPlayer('visitor');
    visitor.balance = 8000;
    const owner = createPlayer('p_owner');
    owner.balance = 10000;
    // Storm chỉ ảnh hưởng ô 11, không ảnh hưởng ô 14
    const localizedStorm: MarketModifier[] = [
      { type: MarketCardId.MC_COASTAL_STORM, affectedCells: [11], remainingRounds: 1, multiplier: 0 },
    ];

    const res = handleLanding(visitor, 14, registry, [visitor, owner], stateMap, undefined, localizedStorm);
    expect(res.rentAmount).toBe(1280); // Không bị zero-rent
    expect(visitor.balance).toBe(8000 - 1280);
  });

  test('[TC-04.T4/EDGE] applyChanceCard trả về rỗng an toàn khi không tìm thấy playerId', () => {
    const player = createPlayer('p1');
    const res = applyChanceCard(ChanceCardId.CC_STOCK_PROFIT, 'non_existent', [player], []);
    expect(res).toEqual({});
    expect(player.balance).toBe(player.balance);
  });
});



