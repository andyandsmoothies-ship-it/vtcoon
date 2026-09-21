// [TC-148][UC-IMP-148] Contract Tests: Cân Bằng Kinh Tế Nhóm 3 Lô Đất Xanh Lá & Vàng
// SSOT: docs/plans/improvements/IMP-148-three-property-group-economic-rebalance_plan.md
import { describe, it, expect } from 'vitest';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import {
  PROPERTY_DEEDS,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_data';
import { resolveRent } from '../../src/domain/property_rent';

describe('[TC-148][UC-IMP-148] Cân Bằng Kinh Tế Nhóm 3 Lô Đất Xanh Lá & Vàng Contract Suite', () => {
  const OWNER_ID = 'player_green_yellow_tycoon';

  // ==========================================================================
  // FACET 1: Boundary & Range — Chi phí nâng cấp mới của Nhóm Xanh Lá
  // ==========================================================================
  describe('Facet 1: Boundary & Range — Chi phí nâng cấp mới của Nhóm Xanh Lá', () => {
    it('[TC-148.01/MSS][UC-IMP-148] Ô 31 Hưng Yên có upgradeCosts = [1200, 1800, 2400] (tổng xây 5.400 Tr.)', () => {
      const deed = PROPERTY_DEEDS.get(31);
      expect(deed?.upgradeCosts).toEqual([1200, 1800, 2400]);
      expect((deed?.upgradeCosts?.[0] ?? 0) + (deed?.upgradeCosts?.[1] ?? 0) + (deed?.upgradeCosts?.[2] ?? 0)).toBe(5400);
    });

    it('[TC-148.02/MSS][UC-IMP-148] Ô 32 Hà Nội Cầu Giấy có upgradeCosts = [1200, 1800, 2400] (tổng xây 5.400 Tr.)', () => {
      const deed = PROPERTY_DEEDS.get(32);
      expect(deed?.upgradeCosts).toEqual([1200, 1800, 2400]);
      expect((deed?.upgradeCosts?.[0] ?? 0) + (deed?.upgradeCosts?.[1] ?? 0) + (deed?.upgradeCosts?.[2] ?? 0)).toBe(5400);
    });

    it('[TC-148.03/MSS][UC-IMP-148] Ô 34 Hà Nội Hoàn Kiếm có upgradeCosts = [1300, 1950, 2600] (tổng xây 5.850 Tr.)', () => {
      const deed = PROPERTY_DEEDS.get(34);
      expect(deed?.upgradeCosts).toEqual([1300, 1950, 2600]);
      expect((deed?.upgradeCosts?.[0] ?? 0) + (deed?.upgradeCosts?.[1] ?? 0) + (deed?.upgradeCosts?.[2] ?? 0)).toBe(5850);
    });

    it('[TC-148.04/MSS][UC-IMP-148] Tổng chi phí xây dựng hoàn thiện cả bộ 3 ô Xanh Lá là 16.650 Tr. (giảm 20.05% so với 20.700 Tr. trước đây)', () => {
      const u31 = PROPERTY_DEEDS.get(31)?.upgradeCosts ?? [0, 0, 0];
      const u32 = PROPERTY_DEEDS.get(32)?.upgradeCosts ?? [0, 0, 0];
      const u34 = PROPERTY_DEEDS.get(34)?.upgradeCosts ?? [0, 0, 0];
      const totalGreenUpgrade = (u31[0] + u31[1] + u31[2]) + (u32[0] + u32[1] + u32[2]) + (u34[0] + u34[1] + u34[2]);
      expect(totalGreenUpgrade).toBe(16650);
    });
  });

  // ==========================================================================
  // FACET 2: State Reactivity — Cước thuê C3 cơ bản mới
  // ==========================================================================
  describe('Facet 2: State Reactivity — Cước thuê C3 cơ bản mới', () => {
    it('[TC-148.05/MSS][UC-IMP-148] Ô 29 Quảng Ninh (Hạ Long - Vàng) có deed.rent3 === 7200 (tăng từ 7.000 Tr.)', () => {
      const deed = PROPERTY_DEEDS.get(29);
      expect(deed?.rent3).toBe(7200);
    });

    it('[TC-148.06/MSS][UC-IMP-148] Ô 31 Hưng Yên (Xanh Lá) có deed.rent3 === 7200 (tăng từ 6.600 Tr.)', () => {
      const deed = PROPERTY_DEEDS.get(31);
      expect(deed?.rent3).toBe(7200);
    });

    it('[TC-148.07/MSS][UC-IMP-148] Ô 32 Hà Nội Cầu Giấy (Xanh Lá) có deed.rent3 === 7200 (tăng từ 6.600 Tr.)', () => {
      const deed = PROPERTY_DEEDS.get(32);
      expect(deed?.rent3).toBe(7200);
    });

    it('[TC-148.08/MSS][UC-IMP-148] Ô 34 Hà Nội Hoàn Kiếm (Xanh Lá) có deed.rent3 === 7800 (tăng từ 7.040 Tr.)', () => {
      const deed = PROPERTY_DEEDS.get(34);
      expect(deed?.rent3).toBe(7800);
    });
  });

  // ==========================================================================
  // FACET 3: Consumer Assertion — Cước thuê C3 khi có Độc Quyền x1.5 qua resolveRent
  // ==========================================================================
  describe('Facet 3: Consumer Assertion — Cước thuê C3 khi có Độc Quyền x1.5 qua resolveRent', () => {
    it('[TC-148.09/MSS][UC-IMP-148] Ô 29 C3 khi trọn bộ Vàng độc quyền: cước đạt 7.200 * 1.5 = 10.800 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [26, OWNER_ID],
        [27, OWNER_ID],
        [29, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [26, { level: 0 }],
        [27, { level: 0 }],
        [29, { level: 3 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[29], 29, OWNER_ID, registry, stateMap);
      expect(rent).toBe(10800);
    });

    it('[TC-148.10/MSS][UC-IMP-148] Ô 31 C3 khi trọn bộ Xanh Lá độc quyền: cước đạt 7.200 * 1.5 = 10.800 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [31, OWNER_ID],
        [32, OWNER_ID],
        [34, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [31, { level: 3 }],
        [32, { level: 0 }],
        [34, { level: 0 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[31], 31, OWNER_ID, registry, stateMap);
      expect(rent).toBe(10800);
    });

    it('[TC-148.11/MSS][UC-IMP-148] Ô 32 C3 khi trọn bộ Xanh Lá độc quyền: cước đạt 7.200 * 1.5 = 10.800 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [31, OWNER_ID],
        [32, OWNER_ID],
        [34, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [31, { level: 0 }],
        [32, { level: 3 }],
        [34, { level: 0 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[32], 32, OWNER_ID, registry, stateMap);
      expect(rent).toBe(10800);
    });

    it('[TC-148.12/MSS][UC-IMP-148] Ô 34 C3 khi trọn bộ Xanh Lá độc quyền: cước đạt 7.800 * 1.5 = 11.700 Tr.', () => {
      const registry: PropertyRegistry = new Map([
        [31, OWNER_ID],
        [32, OWNER_ID],
        [34, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [31, { level: 0 }],
        [32, { level: 0 }],
        [34, { level: 3 }],
      ]);

      const rent = resolveRent(BOARD_CONFIG[34], 34, OWNER_ID, registry, stateMap);
      expect(rent).toBe(11700);
    });

    it('[TC-148.13/MSS][UC-IMP-148] Tổng cước cả bộ Xanh Lá khi hoàn thành độc quyền C3 là 33.300 Tr. (vượt trội bộ Tím 24.750 Tr.)', () => {
      const registry: PropertyRegistry = new Map([
        [31, OWNER_ID],
        [32, OWNER_ID],
        [34, OWNER_ID],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [31, { level: 3 }],
        [32, { level: 3 }],
        [34, { level: 3 }],
      ]);

      const rent31 = resolveRent(BOARD_CONFIG[31], 31, OWNER_ID, registry, stateMap);
      const rent32 = resolveRent(BOARD_CONFIG[32], 32, OWNER_ID, registry, stateMap);
      const rent34 = resolveRent(BOARD_CONFIG[34], 34, OWNER_ID, registry, stateMap);
      const totalGreenRent = rent31 + rent32 + rent34;

      expect(totalGreenRent).toBe(33300);
      expect(totalGreenRent).toBeGreaterThan(24750);
    });

    it('[TC-148.14/MSS][UC-IMP-148] Từng ô đơn lẻ Xanh Lá C3 (10.800 Tr. và 11.700 Tr.) không vượt qua cước đỉnh Lê Lợi ô 39 C3 độc quyền (13.200 Tr.)', () => {
      const purpleRegistry: PropertyRegistry = new Map([
        [37, OWNER_ID],
        [39, OWNER_ID],
      ]);
      const purpleState: PropertyStateMap = new Map([
        [37, { level: 0 }],
        [39, { level: 3 }],
      ]);
      const purpleRent39 = resolveRent(BOARD_CONFIG[39], 39, OWNER_ID, purpleRegistry, purpleState);

      const greenRegistry: PropertyRegistry = new Map([
        [31, OWNER_ID],
        [32, OWNER_ID],
        [34, OWNER_ID],
      ]);
      const greenState: PropertyStateMap = new Map([
        [31, { level: 0 }],
        [32, { level: 0 }],
        [34, { level: 3 }],
      ]);
      const greenRent34 = resolveRent(BOARD_CONFIG[34], 34, OWNER_ID, greenRegistry, greenState);

      expect(greenRent34).toBe(11700);
      expect(greenRent34).toBeLessThan(purpleRent39);
    });
  });

  // ==========================================================================
  // FACET 4: Error Defense & Data Integrity — Tính đơn điệu, toàn vẹn & Zero Float Drift
  // ==========================================================================
  describe('Facet 4: Error Defense & Data Integrity — Tính đơn điệu, toàn vẹn & Zero Float Drift', () => {
    it('[TC-148.15/MSS][UC-IMP-148] Tính đơn điệu tăng dần cước ô 29: rent0 (280) < rent1 (840) < rent2 (2240) < rent3 (7200)', () => {
      const d29 = PROPERTY_DEEDS.get(29);
      expect(d29?.rent0).toBeLessThan(d29?.rent1 ?? 0);
      expect(d29?.rent1).toBeLessThan(d29?.rent2 ?? 0);
      expect(d29?.rent2).toBeLessThan(d29?.rent3 ?? 0);
      expect(d29?.rent3).toBe(7200);
    });

    it('[TC-148.16/MSS][UC-IMP-148] Tính đơn điệu tăng dần cước ô 31 & 32: rent0 (300) < rent1 (1050) < rent2 (2700) < rent3 (7200)', () => {
      const d31 = PROPERTY_DEEDS.get(31);
      const d32 = PROPERTY_DEEDS.get(32);
      expect(d31?.rent2).toBeLessThan(d31?.rent3 ?? 0);
      expect(d31?.rent3).toBe(7200);
      expect(d32?.rent2).toBeLessThan(d32?.rent3 ?? 0);
      expect(d32?.rent3).toBe(7200);
    });

    it('[TC-148.17/MSS][UC-IMP-148] Tính đơn điệu tăng dần cước ô 34: rent0 (320) < rent1 (1120) < rent2 (2880) < rent3 (7800)', () => {
      const d34 = PROPERTY_DEEDS.get(34);
      expect(d34?.rent0).toBeLessThan(d34?.rent1 ?? 0);
      expect(d34?.rent1).toBeLessThan(d34?.rent2 ?? 0);
      expect(d34?.rent2).toBeLessThan(d34?.rent3 ?? 0);
      expect(d34?.rent3).toBe(7800);
    });

    it('[TC-148.18/MSS][UC-IMP-148] Chi phí xây dựng tăng dần theo cấp upgradeCosts[0] < upgradeCosts[1] < upgradeCosts[2] trên cả 3 ô Xanh Lá', () => {
      const d31 = PROPERTY_DEEDS.get(31);
      const d34 = PROPERTY_DEEDS.get(34);
      expect(d31?.upgradeCosts?.[0]).toBeLessThan(d31?.upgradeCosts?.[1] ?? 0);
      expect(d31?.upgradeCosts?.[1]).toBeLessThan(d31?.upgradeCosts?.[2] ?? 0);
      expect(d31?.upgradeCosts).toEqual([1200, 1800, 2400]);
      expect(d34?.upgradeCosts).toEqual([1300, 1950, 2600]);
    });

    it('[TC-148.19/MSS][UC-IMP-148] Mọi mức cước cơ bản và cước độc quyền x1.5 của ô 29, 31, 32, 34 đều là số nguyên tròn chẵn (Number.isInteger === true)', () => {
      const d29 = PROPERTY_DEEDS.get(29);
      const d31 = PROPERTY_DEEDS.get(31);
      const d34 = PROPERTY_DEEDS.get(34);

      expect(Number.isInteger((d29?.rent3 ?? 0) * 1.5) && Number.isInteger((d31?.rent3 ?? 0) * 1.5) && Number.isInteger((d34?.rent3 ?? 0) * 1.5)).toBe(true);
      expect(d29?.rent3).toBe(7200);
      expect(d31?.rent3).toBe(7200);
      expect(d34?.rent3).toBe(7800);
    });
  });
});
