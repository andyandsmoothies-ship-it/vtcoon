// [UC-GAME-021/MSS][UC-GAME-023/MSS] Tests: Monopoly C0 Rent Doubling & Even-Building Rule
import { describe, it, expect } from 'vitest';
import { createPlayer, TurnPhase } from '../../src/domain/room';
import {
  hasMonopoly, upgradeProperty, checkEvenBuilding, resolveRent,
  handleLanding, LandingResult, type PropertyRegistry, type PropertyStateMap,
} from '../../src/domain/property_manager';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import { handleUpgrade } from '../../src/server/property_actions';

describe('Monopoly Rent x2 & Even-Building Rule (UC-GAME-021 / UC-GAME-023)', () => {
  // [UC-GAME-021/MSS] Tiền thuê đất C0 tự động nhân đôi khi có độc quyền nhóm màu
  it('[UC-GAME-021/MSS] trọn bộ Cam (ô 16, 18, 19) -> tiền thuê C0 tự động nhân đôi (x2)', () => {
    const playerA = createPlayer('A'); playerA.balance = 15_000;
    const playerB = createPlayer('B'); playerB.balance = 10_000;
    const registry: PropertyRegistry = new Map([[16, 'A'], [18, 'A']]);
    const stateMap: PropertyStateMap = new Map();

    // 1. Khi mới có 2/3 ô -> chưa độc quyền
    expect(hasMonopoly('A', 16, registry)).toBe(false);
    expect(resolveRent(BOARD_CONFIG[16], 16, 'A', registry, stateMap)).toBe(180);

    // 2. Sang tên nốt ô 19 -> hoàn thành độc quyền Cam
    registry.set(19, 'A');
    expect(hasMonopoly('A', 16, registry)).toBe(true);
    expect(hasMonopoly('A', 18, registry)).toBe(true);
    expect(hasMonopoly('A', 19, registry)).toBe(true);

    // 3. Phí C0 của cả 3 ô tự động x2
    expect(resolveRent(BOARD_CONFIG[16], 16, 'A', registry, stateMap)).toBe(360); // 180 * 2
    expect(resolveRent(BOARD_CONFIG[18], 18, 'A', registry, stateMap)).toBe(360); // 180 * 2
    expect(resolveRent(BOARD_CONFIG[19], 19, 'A', registry, stateMap)).toBe(400); // 200 * 2

    // 4. Khi người chơi B dẫm vào ô 16 -> trả 360 Tr.
    const landing = handleLanding(playerB, 16, registry, [playerA, playerB], stateMap);
    expect(landing.result).toBe(LandingResult.RentPaid);
    expect(landing.rentAmount).toBe(360);
    expect(playerB.balance).toBe(10_000 - 360);
    expect(playerA.balance).toBe(15_000 + 360);
  });

  // [UC-GAME-023/MSS] Quy tắc xây dựng đều tay (Even-Building)
  it('[UC-GAME-023/MSS] chặn nâng cấp lên C2 khi các ô khác trong bộ còn ở C0', () => {
    const playerA = createPlayer('A'); playerA.balance = 20_000;
    const registry: PropertyRegistry = new Map([[16, 'A'], [18, 'A'], [19, 'A']]);
    const stateMap: PropertyStateMap = new Map();

    // 1. Cả 3 ô đang ở C0. Nâng cấp ô 19 lên C1 -> Hợp lệ
    const res1 = upgradeProperty(playerA, 19, registry, stateMap, undefined, { enforceEvenBuilding: true });
    expect(res1.success).toBe(true);
    expect(stateMap.get(19)?.level).toBe(1);

    // 2. Ô 16 và 18 vẫn ở C0. Cố gắng nâng tiếp ô 19 lên C2 -> Bị chặn EVEN_BUILDING_VIOLATION
    const checkRes = checkEvenBuilding(19, stateMap);
    expect(checkRes.valid).toBe(false);
    expect(checkRes.reason).toBe('EVEN_BUILDING_VIOLATION');
    expect(checkRes.laggingCells).toEqual([16, 18]);

    const res2 = upgradeProperty(playerA, 19, registry, stateMap, undefined, { enforceEvenBuilding: true });
    expect(res2.success).toBe(false);
    expect(res2.reason).toBe('EVEN_BUILDING_VIOLATION');
    expect(stateMap.get(19)?.level).toBe(1); // Không bị tăng level

    // 3. Nâng cấp ô 16 lên C1, ô 18 lên C1
    const res3 = upgradeProperty(playerA, 16, registry, stateMap, undefined, { enforceEvenBuilding: true });
    const res4 = upgradeProperty(playerA, 18, registry, stateMap, undefined, { enforceEvenBuilding: true });
    expect(res3.success).toBe(true);
    expect(res4.success).toBe(true);

    // 4. Giờ cả 3 ô đều đạt C1. Nâng tiếp ô 19 lên C2 -> Thành công!
    const res5 = upgradeProperty(playerA, 19, registry, stateMap, undefined, { enforceEvenBuilding: true });
    expect(res5.success).toBe(true);
    expect(stateMap.get(19)?.level).toBe(2);
  });

  // [UC-GAME-023-inv/Adversarial] Server handleUpgrade từ chối intent vi phạm Even-Building
  it('[UC-GAME-023-inv/Adversarial] Server handleUpgrade từ chối intent nâng cấp khi vi phạm even-building', () => {
    const playerA = createPlayer('A'); playerA.balance = 20_000;
    const registry: PropertyRegistry = new Map([[16, 'A'], [18, 'A'], [19, 'A']]);
    const stateMap: PropertyStateMap = new Map([[19, { level: 1 }]]); // Ô 19 đã là C1, 16 và 18 là C0

    // Gửi intent nâng tiếp ô 19
    const res = handleUpgrade(playerA, TurnPhase.PropertyManagement, 19, registry, stateMap);
    expect(res.success).toBe(false);
    expect(res.reason).toBe('EVEN_BUILDING_VIOLATION');
    expect(stateMap.get(19)?.level).toBe(1);
  });
});
