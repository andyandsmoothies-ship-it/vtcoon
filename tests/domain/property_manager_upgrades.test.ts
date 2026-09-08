// [TC-03.2/MSS][TC-03.3/MSS][TC-03.4/MSS][TC-03.5/MSS][UC-GAME-030] Tests Slice 03 — Upgrades & Monopoly
//
// Test Plan:
// 1. [TC-03.2/MSS] Nâng cấp C1 khi đủ bộ màu Nâu → trừ 300, rent1=210
// 2. [TC-03.5/MSS] Từ chối nâng cấp khi thiếu bộ màu → MISSING_MONOPOLY
// 3. [TC-03.3/MSS] Railroad phí lũy tiến 2 ô + ETC → 1.000 × 1.5 = 1.500
// 4. [TC-03.4/MSS] Utility phí biến thiên 2D6: 1ô=×40, 2ô=×100, Full=×150
// 5. Downgrade C2 → hoàn tiền 50% tổng chi phí nâng cấp

import { describe, it, expect } from 'vitest';
import { createPlayer } from '../../src/domain/room';
import {
  hasMonopoly, upgradeProperty, upgradeETC, upgradeUtilityFull,
  calcRailroadFee, calcUtilityFee, downgradeProperty, handleLanding,
  LandingResult, type PropertyRegistry, type PropertyStateMap,
} from '../../src/domain/property_manager';

describe('Upgrades, Monopoly, Railroad & Utility — Slice 03 Task 2', () => {
  // [TC-03.2/MSS] Nâng cấp C1 khi đủ bộ màu
  it('[TC-03.2/MSS] trọn bộ Nâu (ô 1+3) → nâng C1 ô 1 → trừ 300, phí rent1=210', () => {
    const playerA = createPlayer('A'); playerA.balance = 10_000;
    const playerB = createPlayer('B'); playerB.balance = 5_000;
    const registry: PropertyRegistry = new Map([[1, 'A'], [3, 'A']]);
    const stateMap: PropertyStateMap = new Map();

    // 1. Kiểm tra monopoly
    expect(hasMonopoly('A', 1, registry)).toBe(true);

    // 2. Nâng cấp C1 ô 1
    const res = upgradeProperty(playerA, 1, registry, stateMap);
    expect(res.success).toBe(true);

    // 3. Balance trừ đúng chi phí C1 = 300
    expect(playerA.balance).toBe(9_700);

    // 4. Level = 1
    expect(stateMap.get(1)?.level).toBe(1);

    // 5. Người chơi B dừng tại ô 1 → trả rent1 = 210
    const landing = handleLanding(playerB, 1, registry, [playerA, playerB], stateMap);
    expect(landing.result).toBe(LandingResult.RentPaid);
    expect(landing.rentAmount).toBe(210);
    expect(playerB.balance).toBe(4_790);
  });

  // [TC-03.5/MSS] Từ chối nâng cấp khi thiếu bộ màu
  it('[TC-03.5/MSS] thiếu ô 3 trong nhóm Nâu → từ chối nâng cấp, MISSING_MONOPOLY', () => {
    const playerA = createPlayer('A'); playerA.balance = 10_000;
    const registry: PropertyRegistry = new Map([[1, 'A']]); // thiếu ô 3
    const stateMap: PropertyStateMap = new Map();

    // 1. Không đủ monopoly
    expect(hasMonopoly('A', 1, registry)).toBe(false);

    // 2. upgradeProperty bị từ chối
    const res = upgradeProperty(playerA, 1, registry, stateMap);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('MISSING_MONOPOLY');

    // 3. Balance không thay đổi
    expect(playerA.balance).toBe(10_000);

    // 4. Không có state nào được ghi
    expect(stateMap.get(1)?.level ?? 0).toBe(0);
  });

  // [TC-03.3/MSS] Railroad phí lũy tiến + ETC
  it('[TC-03.3/MSS] 2 ô Railroad (ô 5+15) → phí base=1.000, ETC → 1.000×1.5=1.500', () => {
    const playerA = createPlayer('A'); playerA.balance = 10_000;
    const playerB = createPlayer('B'); playerB.balance = 8_000;
    const registry: PropertyRegistry = new Map([[5, 'A'], [15, 'A']]);
    const stateMap: PropertyStateMap = new Map();

    // 1. Phí base 2 Railroad = 1.000
    expect(calcRailroadFee('A', registry, stateMap)).toBe(1_000);

    // 2. Nâng cấp ETC → thành công
    const etcRes = upgradeETC(playerA, registry, stateMap);
    expect(etcRes.success).toBe(true);

    // 3. Balance trừ 1.500 × 2 ô = 3.000 → 10.000 - 3.000 = 7.000
    expect(playerA.balance).toBe(7_000);

    // 4. Phí sau ETC = 1.000 × 1.5 = 1.500
    expect(calcRailroadFee('A', registry, stateMap)).toBe(1_500);

    // 5. handleLanding xác nhận đúng
    const landing = handleLanding(playerB, 5, registry, [playerA, playerB], stateMap);
    expect(landing.rentAmount).toBe(1_500);
    expect(playerB.balance).toBe(6_500);
  });

  // [TC-03.4/MSS] Utility phí biến thiên 2D6
  it('[TC-03.4/MSS] Utility: 1ô → 2D6×40, 2ô → 2D6×100, Full → 2D6×150', () => {
    const playerA = createPlayer('A');
    const registry: PropertyRegistry = new Map([[12, 'A']]);
    const stateMap: PropertyStateMap = new Map();

    // 1. 1 Utility: diceTotal=7, fee = 7×40 = 280
    expect(calcUtilityFee('A', 7, registry, stateMap, 12)).toBe(280);

    // 2. Thêm ô 28 → 2 Utility: fee = 7×100 = 700
    registry.set(28, 'A');
    expect(calcUtilityFee('A', 7, registry, stateMap, 12)).toBe(700);

    // 3. Nâng cấp Full → fee = 7×150 = 1.050; chi phí 1.000
    playerA.balance = 5_000;
    const upRes = upgradeUtilityFull(playerA, 12, registry, stateMap);
    expect(upRes.success).toBe(true);
    expect(playerA.balance).toBe(4_000);
    expect(calcUtilityFee('A', 7, registry, stateMap, 12)).toBe(1_050);
  });

  // [TC-03.6/MSS] Downgrade công trình
  it('[TC-03.6/MSS] downgrade C2 → hoàn tiền 50% tổng chi phí nâng cấp (300+450)', () => {
    const playerA = createPlayer('A');
    const registry: PropertyRegistry = new Map([[1, 'A'], [3, 'A']]);
    const stateMap: PropertyStateMap = new Map();

    // Nâng cấp ô 1 hai lần: C1 = 300, C2 = 450
    upgradeProperty(playerA, 1, registry, stateMap);
    upgradeProperty(playerA, 1, registry, stateMap);
    expect(stateMap.get(1)?.level).toBe(2);

    // Downgrade → hoàn 50% × (300 + 450) = 375, level trở về 0
    const refund = downgradeProperty(1, stateMap);
    expect(refund.refund).toBe(375);
    expect(stateMap.get(1)?.level).toBe(0);
  });
});
