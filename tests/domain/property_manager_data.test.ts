// [TC-03.1/MSS][UC-GAME-020] Domain Data Integrity — 28 Title Deeds & Color Groups
// Test Plan: Kiểm tra toàn vẹn dữ liệu bàn cờ cho Slice 03 Task 1:
//   1. PROPERTY_DEEDS phải có đủ 28 ô (bao gồm ô 35 Short Line Railroad)
//   2. 22 ô Property phải có colorGroup hợp lệ thuộc enum ColorGroup
//   3. Nhóm màu phải có đúng số lượng ô theo quy chuẩn entity_model.md
//   4. 22 ô Property phải có rent1/rent2/rent3 tăng dần và upgradeCosts [C1, C2, C3]

import { describe, it, expect } from 'vitest';
import { BOARD_CONFIG, CellType, ColorGroup } from '../../src/domain/board_config';
import { PROPERTY_DEEDS } from '../../src/domain/property_manager';

describe('Domain Data Integrity — 28 Title Deeds & Color Groups', () => {
  // [TC-03.1a/MSS] Bug ẩn ô 35: PROPERTY_DEEDS chỉ có 27 ô, thiếu Short Line Railroad
  it('[TC-03.1a/MSS] PROPERTY_DEEDS phải có đủ 28 ô (bao gồm ô 35 Short Line Railroad)', () => {
    expect(PROPERTY_DEEDS.size, `Kỳ vọng 28 ô nhưng nhận: ${PROPERTY_DEEDS.size}`).toBe(28);
    expect(PROPERTY_DEEDS.has(35), 'Ô 35 (Short Line Railroad) phải tồn tại trong PROPERTY_DEEDS').toBe(true);

    const deed35 = PROPERTY_DEEDS.get(35);
    expect(deed35, 'Deed cho ô 35 không được undefined').toBeDefined();
    expect(deed35?.price, `Giá mua ô 35 phải là 2000 (nguồn: entity_model.md §2.4)`).toBe(2000);
    expect(deed35?.rent0, `Phí cơ sở ô 35 phải là 500 (nguồn: entity_model.md §2.4)`).toBe(500);
  });

  // [TC-03.1b/MSS] 22 ô Property phải có colorGroup hợp lệ
  it('[TC-03.1b/MSS] 22 ô Property phải có colorGroup hợp lệ thuộc enum ColorGroup', () => {
    const propertyCells = BOARD_CONFIG.filter((c) => c.type === CellType.Property);
    expect(propertyCells.length, `Kỳ vọng 22 ô Property nhưng nhận: ${propertyCells.length}`).toBe(22);

    const validColorGroups = Object.values(ColorGroup);
    for (const cell of propertyCells) {
      expect(cell.colorGroup, `Ô ${cell.index} (${cell.name}) thiếu colorGroup`).toBeDefined();
      expect(
        validColorGroups,
        `Ô ${cell.index} có colorGroup="${cell.colorGroup}" không thuộc enum ColorGroup`,
      ).toContain(cell.colorGroup);
    }
  });

  // [TC-03.1c/MSS] Nhóm màu phải có đúng số lượng ô theo entity_model.md
  it('[TC-03.1c/MSS] nhóm màu phải có đúng số lượng ô: Nâu=2, Tím=2, còn lại=3', () => {
    const counts: Record<string, number> = {};
    for (const cell of BOARD_CONFIG) {
      if (cell.colorGroup) {
        counts[cell.colorGroup] = (counts[cell.colorGroup] ?? 0) + 1;
      }
    }

    // Nâu: ô 01, 03 (2 ô BĐS Đô thị)
    expect(counts[ColorGroup.Nau], `Nhóm Nâu phải có 2 ô nhưng nhận: ${counts[ColorGroup.Nau]}`).toBe(2);
    // Tím: ô 37, 39 (2 ô BĐS Đô thị)
    expect(counts[ColorGroup.Tim], `Nhóm Tím phải có 2 ô nhưng nhận: ${counts[ColorGroup.Tim]}`).toBe(2);
    // Xanh Da Trời: ô 06, 08, 09 (3 ô — 2 Dịch vụ + 1 Nghỉ dưỡng)
    expect(counts[ColorGroup.XanhDaTroi], `Nhóm XanhDaTroi phải có 3 ô nhưng nhận: ${counts[ColorGroup.XanhDaTroi]}`).toBe(3);
    // Hồng: ô 11, 13, 14 (3 ô Nghỉ dưỡng)
    expect(counts[ColorGroup.Hong], `Nhóm Hồng phải có 3 ô nhưng nhận: ${counts[ColorGroup.Hong]}`).toBe(3);
    // Cam: ô 16, 18, 19 (3 ô — 2 Nghỉ dưỡng + 1 Đô thị)
    expect(counts[ColorGroup.Cam], `Nhóm Cam phải có 3 ô nhưng nhận: ${counts[ColorGroup.Cam]}`).toBe(3);
    // Đỏ: ô 21, 23, 24 (3 ô — 1 Nghỉ dưỡng + 1 Đô thị + 1 Nghỉ dưỡng)
    expect(counts[ColorGroup.Do], `Nhóm Đỏ phải có 3 ô nhưng nhận: ${counts[ColorGroup.Do]}`).toBe(3);
    // Vàng: ô 26, 27, 29 (3 ô — 2 Dịch vụ + 1 Nghỉ dưỡng)
    expect(counts[ColorGroup.Vang], `Nhóm Vàng phải có 3 ô nhưng nhận: ${counts[ColorGroup.Vang]}`).toBe(3);
    // Xanh Lá: ô 31, 32, 34 (3 ô Đô thị)
    expect(counts[ColorGroup.XanhLa], `Nhóm XanhLá phải có 3 ô nhưng nhận: ${counts[ColorGroup.XanhLa]}`).toBe(3);
  });

  // [TC-03.1d/MSS] 22 ô Property phải có rent1/rent2/rent3 tăng dần và upgradeCosts
  it('[TC-03.1d/MSS] 22 ô Property phải có rent1 > rent0, rent2 > rent1, rent3 > rent2 và upgradeCosts đúng 3 phần tử', () => {
    const propertyCells = BOARD_CONFIG.filter((c) => c.type === CellType.Property);
    expect(propertyCells.length).toBe(22);

    for (const cell of propertyCells) {
      const deed = PROPERTY_DEEDS.get(cell.index);
      expect(deed, `Thiếu deed cho ô ${cell.index} (${cell.name})`).toBeDefined();
      if (!deed) continue;

      // rent1 > rent0 (entity_model.md: tỷ lệ C1 > tỷ lệ C0 cho mọi nhóm)
      expect(
        deed.rent1,
        `Ô ${cell.index}: rent1 phải được định nghĩa`,
      ).toBeDefined();
      expect(
        deed.rent1!,
        `Ô ${cell.index}: rent1 (${deed.rent1}) phải > rent0 (${deed.rent0})`,
      ).toBeGreaterThan(deed.rent0);

      // rent2 > rent1
      expect(
        deed.rent2,
        `Ô ${cell.index}: rent2 phải được định nghĩa`,
      ).toBeDefined();
      expect(
        deed.rent2!,
        `Ô ${cell.index}: rent2 (${deed.rent2}) phải > rent1 (${deed.rent1})`,
      ).toBeGreaterThan(deed.rent1!);

      // rent3 > rent2
      expect(
        deed.rent3,
        `Ô ${cell.index}: rent3 phải được định nghĩa`,
      ).toBeDefined();
      expect(
        deed.rent3!,
        `Ô ${cell.index}: rent3 (${deed.rent3}) phải > rent2 (${deed.rent2})`,
      ).toBeGreaterThan(deed.rent2!);

      // upgradeCosts phải có đúng 3 phần tử [C1, C2, C3]
      expect(
        deed.upgradeCosts,
        `Ô ${cell.index}: upgradeCosts phải được định nghĩa`,
      ).toBeDefined();
      expect(
        deed.upgradeCosts,
        `Ô ${cell.index}: upgradeCosts phải có đúng 3 phần tử [C1, C2, C3]`,
      ).toHaveLength(3);
    }
  });
});
