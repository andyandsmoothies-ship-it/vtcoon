// [TC-GAME-038..041/MSS] Event Card Handlers Full Verification
// Traceability: docs/requirements.md §V (DANH MỤC CHI TIẾT CÁC THẺ SỰ KIỆN)

import { describe, it, expect } from 'vitest';
import { createPlayer, type MarketModifier } from '../../src/domain/room';
import {
  MarketCardId,
  ChanceCardId,
  SERVICE_CELLS,
  INFRA_CELLS,
  LAND_FEVER_CELLS,
} from '../../src/domain/event_card_types';
import { executeMarketCard, executeChanceCard } from '../../src/domain/card_handlers';
import { handleLanding, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_manager';

describe('[TC-GAME-038..041/MSS] Market Cards Handlers', () => {
  it('MC_PUBLIC_INVEST cộng 1.000 Tr. VNĐ cho mỗi ô Hạ tầng sở hữu', () => {
    const p1 = createPlayer('p1');
    const p2 = createPlayer('p2');
    const registry: PropertyRegistry = new Map([
      [5, 'p1'],  // Long Thành
      [15, 'p1'], // Cái Mép
      [25, 'p2'], // Bắc - Nam
    ]);
    const startBal1 = p1.balance;
    const startBal2 = p2.balance;

    executeMarketCard(MarketCardId.MC_PUBLIC_INVEST, [], [p1, p2], registry);
    expect(p1.balance).toBe(startBal1 + 2000);
    expect(p2.balance).toBe(startBal2 + 1000);
  });

  it('MC_CASINO_PILOT tặng 2.000 Tr. VNĐ cho chủ sở hữu ô 27 khi đạt Cấp 3', () => {
    const p1 = createPlayer('p1');
    const registry: PropertyRegistry = new Map([[27, 'p1']]);
    const stateMap: PropertyStateMap = new Map([[27, { level: 3 }]]);
    const startBal = p1.balance;

    executeMarketCard(MarketCardId.MC_CASINO_PILOT, [], [p1], registry, stateMap);
    expect(p1.balance).toBe(startBal + 2000);

    // Nếu chỉ Cấp 2 -> Không nhận thưởng
    stateMap.set(27, { level: 2 });
    executeMarketCard(MarketCardId.MC_CASINO_PILOT, [], [p1], registry, stateMap);
    expect(p1.balance).toBe(startBal + 2000);
  });

  it('MC_FIRE_INSPECTION phạt theo cấp công trình (C1: 200, C2: 400, C3: 800)', () => {
    const p1 = createPlayer('p1');
    const registry: PropertyRegistry = new Map([
      [1, 'p1'], // C1 -> phạt 200
      [3, 'p1'], // C2 -> phạt 400
    ]);
    const stateMap: PropertyStateMap = new Map([
      [1, { level: 1 }],
      [3, { level: 2 }],
    ]);
    const startBal = p1.balance;

    executeMarketCard(MarketCardId.MC_FIRE_INSPECTION, [], [p1], registry, stateMap);
    expect(p1.balance).toBe(startBal - 600);
  });

  it('MC_MEGA_CONCERT kéo toàn bộ người chơi về ô dịch vụ có cấp cao nhất và thu tiền thuê', () => {
    const p1 = createPlayer('p1'); // Owner
    const p2 = createPlayer('p2'); // Visitor
    const registry: PropertyRegistry = new Map([[26, 'p1']]);
    const stateMap: PropertyStateMap = new Map([[26, { level: 1 }]]); // rent1 của ô 26 là 1040
    const startBal1 = p1.balance;
    const startBal2 = p2.balance;

    executeMarketCard(MarketCardId.MC_MEGA_CONCERT, [], [p1, p2], registry, stateMap);
    expect(p1.position).toBe(26);
    expect(p2.position).toBe(26);
    expect(p2.balance).toBe(startBal2 - 1040);
    expect(p1.balance).toBe(startBal1 + 1040);
  });

  it('MC_ALCOHOL_CHECK và MC_NIGHT_ECONOMY tạo modifier đúng cho ô Dịch vụ', () => {
    const modifiers: MarketModifier[] = [];
    executeMarketCard(MarketCardId.MC_ALCOHOL_CHECK, modifiers);
    expect(modifiers[0]).toEqual({
      type: MarketCardId.MC_ALCOHOL_CHECK,
      affectedCells: SERVICE_CELLS,
      remainingRounds: 2,
      multiplier: 0.5,
    });

    executeMarketCard(MarketCardId.MC_NIGHT_ECONOMY, modifiers);
    expect(modifiers[1]).toEqual({
      type: MarketCardId.MC_NIGHT_ECONOMY,
      affectedCells: SERVICE_CELLS,
      remainingRounds: 1,
      multiplier: 2,
    });
  });

  it('handleLanding áp dụng nhân đôi tiền thuê khi MC_LAND_FEVER active trên Hưng Yên (ô 31)', () => {
    const tenant = createPlayer('tenant');
    const owner = createPlayer('owner');
    const registry: PropertyRegistry = new Map([[31, 'owner']]);
    const modifiers: MarketModifier[] = [
      { type: MarketCardId.MC_LAND_FEVER, affectedCells: LAND_FEVER_CELLS, remainingRounds: 1, multiplier: 2 },
    ];

    // Ô 31 (Hưng Yên) base rent0 là 300 -> x2 thành 600
    const res = handleLanding(tenant, 31, registry, [tenant, owner], new Map(), 4, modifiers);
    expect(res.rentAmount).toBe(600);
  });

  it('handleLanding áp dụng phụ phí +500 Tr. VNĐ khi MC_FUEL_SURGE active trên Hạ tầng (ô 5)', () => {
    const tenant = createPlayer('tenant');
    const owner = createPlayer('owner');
    const registry: PropertyRegistry = new Map([[5, 'owner']]);
    const modifiers: MarketModifier[] = [
      { type: MarketCardId.MC_FUEL_SURGE, affectedCells: INFRA_CELLS, remainingRounds: 1 },
    ];

    // Ô 5 (1 Ga) base fee là 500 -> +500 phụ phí vận tải = 1000
    const res = handleLanding(tenant, 5, registry, [tenant, owner], new Map(), 4, modifiers);
    expect(res.rentAmount).toBe(1000);
  });
});

describe('[TC-GAME-038..041/MSS] Chance Cards Handlers', () => {
  it('CC_PLATE_AUCTION trừ 500 Tr. VNĐ và tăng consecutiveDoubles thêm 1', () => {
    const p1 = createPlayer('p1');
    const startBal = p1.balance;
    executeChanceCard(ChanceCardId.CC_PLATE_AUCTION, 'p1', [p1]);
    expect(p1.balance).toBe(startBal - 500);
    expect(p1.consecutiveDoubles).toBe(1);
  });

  it('CC_FRANCHISE thu 300 Tr. VNĐ từ mỗi đối thủ', () => {
    const p1 = createPlayer('p1');
    const p2 = createPlayer('p2');
    const p3 = createPlayer('p3');
    const startBal1 = p1.balance;
    const startBal2 = p2.balance;
    const startBal3 = p3.balance;

    executeChanceCard(ChanceCardId.CC_FRANCHISE, 'p1', [p1, p2, p3]);
    expect(p2.balance).toBe(startBal2 - 300);
    expect(p3.balance).toBe(startBal3 - 300);
    expect(p1.balance).toBe(startBal1 + 600);
  });

  it('CC_CONTRACT_PENALTY nộp phạt 1.000 Tr. VNĐ chuyển cho đối thủ nghèo nhất', () => {
    const p1 = createPlayer('p1');
    const p2 = createPlayer('p2');
    p2.balance = 8000;
    const p3 = createPlayer('p3');
    p3.balance = 3000; // Poorest opponent

    const startBal1 = p1.balance;
    executeChanceCard(ChanceCardId.CC_CONTRACT_PENALTY, 'p1', [p1, p2, p3]);
    expect(p1.balance).toBe(startBal1 - 1000);
    expect(p2.balance).toBe(8000);
    expect(p3.balance).toBe(4000);
  });

  it('CC_LAND_RECLAIM đền bù giải tỏa 150% giá niêm yết cho đất trống Cấp 0', () => {
    const p1 = createPlayer('p1');
    // Ô 1 (Cần Thơ) giá niêm yết 600, 150% = 900
    const registry: PropertyRegistry = new Map([[1, 'p1']]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0 }]]);
    const startBal = p1.balance;

    executeChanceCard(ChanceCardId.CC_LAND_RECLAIM, 'p1', [p1], [], registry, stateMap);
    expect(registry.has(1)).toBe(false);
    expect(p1.balance).toBe(startBal + 900);
  });

  it('CC_VENUE_INCIDENT chỉ phạt 800 Tr. VNĐ nếu người chơi sở hữu ô Dịch vụ', () => {
    const p1 = createPlayer('p1');
    const startBal = p1.balance;
    const registry: PropertyRegistry = new Map([[1, 'p1']]); // Ô 1 là BĐS Đô thị, không phải Dịch vụ

    executeChanceCard(ChanceCardId.CC_VENUE_INCIDENT, 'p1', [p1], [], registry);
    expect(p1.balance).toBe(startBal); // Không bị phạt

    // Sở hữu ô 6 (Dịch vụ) -> Bị phạt 800
    registry.set(6, 'p1');
    executeChanceCard(ChanceCardId.CC_VENUE_INCIDENT, 'p1', [p1], [], registry);
    expect(p1.balance).toBe(startBal - 800);
  });

  it('CC_SLOW_BUILD thu hồi quyền sở hữu đất trống Cấp 0 do chậm tiến độ', () => {
    const p1 = createPlayer('p1');
    const registry: PropertyRegistry = new Map([[1, 'p1']]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0 }]]);

    executeChanceCard(ChanceCardId.CC_SLOW_BUILD, 'p1', [p1], [], registry, stateMap);
    expect(registry.has(1)).toBe(false);
  });

  it('CC_PORT_EXCLUSIVE tạo modifier giảm 50% tiền thuê Hạ tầng trong 2 vòng', () => {
    const p1 = createPlayer('p1');
    const modifiers: MarketModifier[] = [];

    executeChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, 'p1', [p1], modifiers);
    expect(modifiers[0]).toEqual({
      type: ChanceCardId.CC_PORT_EXCLUSIVE,
      affectedCells: INFRA_CELLS,
      remainingRounds: 2,
      multiplier: 0.5,
    });
  });

  it('CC_SWAP_PROJECT hoán đổi đất trống cùng nhóm màu giữa 2 người chơi', () => {
    const p1 = createPlayer('p1');
    const p2 = createPlayer('p2');
    // Ô 1 (Cần Thơ) và Ô 3 (An Giang) cùng nhóm Nâu (Cấp 0)
    const registry: PropertyRegistry = new Map([[1, 'p1'], [3, 'p2']]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0 }], [3, { level: 0 }]]);

    executeChanceCard(ChanceCardId.CC_SWAP_PROJECT, 'p1', [p1, p2], [], registry, stateMap);
    expect(registry.get(1)).toBe('p2');
    expect(registry.get(3)).toBe('p1');
  });

  it('CC_MA_FORCE mua lại đất trống từ đối thủ yếu thế hơn ở mức 120% giá niêm yết', () => {
    const p1 = createPlayer('p1');
    p1.balance = 20000;
    const p2 = createPlayer('p2');
    p2.balance = 5000; // Yếu hơn p1
    // Ô 1 (giá 600) -> 120% là 720
    const registry: PropertyRegistry = new Map([[1, 'p2']]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0 }]]);

    executeChanceCard(ChanceCardId.CC_MA_FORCE, 'p1', [p1, p2], [], registry, stateMap);
    expect(registry.get(1)).toBe('p1');
    expect(p1.balance).toBe(20000 - 720);
    expect(p2.balance).toBe(5000 + 720);
  });
});
