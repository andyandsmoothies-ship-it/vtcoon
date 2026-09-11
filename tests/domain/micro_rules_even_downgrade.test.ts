// [UAT-14][UC-GAME-027/MSS] Even-Downgrading & Building Selloff Unit Tests
import { describe, it, expect } from 'vitest';
import {
  checkEvenDowngrading, downgradeProperty,
} from '../../src/domain/property_upgrade';
import { PROPERTY_DEEDS, type PropertyStateMap } from '../../src/domain/property_data';
import { ActionRejectReason } from '../../src/domain/action_reasons';

describe('[UAT-14][Micro-Rules] Even-Downgrading & Building Selloff', () => {
  // Nhóm Cam gồm ô 16, 18, 19
  const cell16 = 16;
  const cell18 = 18;
  const cell19 = 19;

  it('checkEvenDowngrading từ chối EVEN_DOWNGRADE_VIOLATION nếu trong nhóm có ô đang ở cấp cao hơn', () => {
    const stateMap: PropertyStateMap = new Map([
      [cell16, { level: 1 }], // Ô 16 ở C1
      [cell18, { level: 2 }], // Ô 18 ở C2 (cao hơn)
      [cell19, { level: 1 }],
    ]);

    // Thử hạ cấp ô 16 khi ô 18 đang ở C2 -> Bị từ chối vì phải hạ ô 18 trước
    const check16 = checkEvenDowngrading(cell16, stateMap);
    expect(check16.valid).toBe(false);
    expect(check16.reason).toBe(ActionRejectReason.EVEN_DOWNGRADE_VIOLATION);
    expect(check16.leadingCells).toContain(cell18);

    // Thử hạ cấp ô 18 -> Hợp lệ vì ô 18 đang ở cấp cao nhất
    const check18 = checkEvenDowngrading(cell18, stateMap);
    expect(check18.valid).toBe(true);
  });

  it('downgradeProperty với stepByStep: true hạ đúng 1 cấp và hoàn đúng 50% chi phí cấp đó', () => {
    const stateMap: PropertyStateMap = new Map([
      [cell16, { level: 3 }], // Đang ở C3 (Resort)
    ]);
    const deed16 = PROPERTY_DEEDS.get(cell16)!;
    // Chi phí từ C2 lên C3 là upgradeCosts[2]
    const costC3 = deed16.upgradeCosts![2]!;
    const expectedRefund = Math.floor(costC3 * 0.5);

    const res = downgradeProperty(cell16, stateMap, { stepByStep: true });
    expect(res.success).toBe(true);
    expect(res.newLevel).toBe(2);
    expect(res.refund).toBe(expectedRefund);
    expect(stateMap.get(cell16)?.level).toBe(2);
  });

  it('Bán nhà tuần tự từng nấc (C3 -> C2 -> C1 -> C0) bảo toàn quy tắc Even-Downgrading', () => {
    // 3 ô nhóm Cam đều ở C2
    const stateMap: PropertyStateMap = new Map([
      [cell16, { level: 2 }],
      [cell18, { level: 2 }],
      [cell19, { level: 2 }],
    ]);
    const deed = PROPERTY_DEEDS.get(cell16)!;

    // 1. Hạ ô 16 từ C2 -> C1 (các ô khác đang ở C2 -> hợp lệ, chênh lệch tối đa 1 cấp)
    const step1 = downgradeProperty(cell16, stateMap, { enforceEvenDowngrading: true, stepByStep: true });
    expect(step1.success).toBe(true);
    expect(step1.newLevel).toBe(1);
    expect(stateMap.get(cell16)?.level).toBe(1);

    // 2. Tiếp tục hạ ô 16 từ C1 -> C0: BỊ CHẶN vì ô 18 và 19 vẫn đang ở C2 (chênh lệch sẽ thành 2 cấp!)
    const step2Fail = downgradeProperty(cell16, stateMap, { enforceEvenDowngrading: true, stepByStep: true });
    expect(step2Fail.success).toBe(false);
    expect(step2Fail.reason).toBe(ActionRejectReason.EVEN_DOWNGRADE_VIOLATION);
    expect(stateMap.get(cell16)?.level).toBe(1);

    // 3. Phải hạ ô 18 từ C2 -> C1 trước
    const step2Ok = downgradeProperty(cell18, stateMap, { enforceEvenDowngrading: true, stepByStep: true });
    expect(step2Ok.success).toBe(true);
    expect(step2Ok.newLevel).toBe(1);

    // 4. Phải hạ ô 19 từ C2 -> C1
    const step3Ok = downgradeProperty(cell19, stateMap, { enforceEvenDowngrading: true, stepByStep: true });
    expect(step3Ok.success).toBe(true);
    expect(step3Ok.newLevel).toBe(1);

    // 5. Bây giờ cả 3 ô đều ở C1 -> Cho phép hạ ô 16 từ C1 về C0
    const step4 = downgradeProperty(cell16, stateMap, { enforceEvenDowngrading: true, stepByStep: true });
    expect(step4.success).toBe(true);
    expect(step4.newLevel).toBe(0);
    expect(step4.refund).toBe(Math.floor(deed.upgradeCosts![0]! * 0.5));
  });

  it('Từ chối hạ cấp NOT_UPGRADEABLE khi BĐS đang ở C0 (đất nền thô)', () => {
    const stateMap: PropertyStateMap = new Map([
      [cell16, { level: 0 }],
    ]);
    const res = downgradeProperty(cell16, stateMap, { enforceEvenDowngrading: true, stepByStep: true });
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.NOT_UPGRADEABLE);
    expect(res.refund).toBe(0);
  });
});
