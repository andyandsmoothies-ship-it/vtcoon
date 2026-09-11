// [UAT-13][UC-GAME-027/MSS] Monopoly & Mortgage Integrity Unit Tests
import { describe, it, expect } from 'vitest';
import {
  hasMonopoly, upgradeProperty,
} from '../../src/domain/property_upgrade';
import { resolveRent } from '../../src/domain/property_rent';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_data';
import { ActionRejectReason } from '../../src/domain/action_reasons';
import type { Player } from '../../src/domain/room';

function createMockPlayer(id = 'p1', balance = 15000): Player {
  return {
    id,
    balance,
    position: 0,
    consecutiveDoubles: 0,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    bankrupt: false,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
  };
}

describe('[UAT-13][Micro-Rules] Monopoly & Mortgage Integrity', () => {
  // Nhóm Cam gồm ô 16, 18, 19
  const cell16 = 16;
  const cell18 = 18;
  const cell19 = 19;

  it('hasMonopoly trả về false khi có 1 ô trong nhóm màu bị thế chấp (isMortgaged: true)', () => {
    const registry: PropertyRegistry = new Map([
      [cell16, 'p1'],
      [cell18, 'p1'],
      [cell19, 'p1'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [cell16, { level: 0, isMortgaged: false }],
      [cell18, { level: 0, isMortgaged: true }], // Ô 18 bị thế chấp
      [cell19, { level: 0, isMortgaged: false }],
    ]);

    // Không truyền stateMap: chỉ kiểm tra sở hữu -> true
    expect(hasMonopoly('p1', cell16, registry)).toBe(true);

    // Truyền stateMap: kiểm tra cả mortgage -> false vì ô 18 bị thế chấp
    expect(hasMonopoly('p1', cell16, registry, stateMap)).toBe(false);
    expect(hasMonopoly('p1', cell18, registry, stateMap)).toBe(false);
    expect(hasMonopoly('p1', cell19, registry, stateMap)).toBe(false);
  });

  it('upgradeProperty từ chối GROUP_MORTGAGED nếu có bất kỳ ô nào cùng màu đang bị thế chấp', () => {
    const registry: PropertyRegistry = new Map([
      [cell16, 'p1'],
      [cell18, 'p1'],
      [cell19, 'p1'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [cell16, { level: 0 }],
      [cell18, { level: 0, isMortgaged: true }], // Ô 18 bị thế chấp
      [cell19, { level: 0 }],
    ]);
    const player = createMockPlayer('p1', 5000);

    // Cố tình nâng cấp ô 16 (ô chưa bị thế chấp)
    const res = upgradeProperty(player, cell16, registry, stateMap);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.GROUP_MORTGAGED);

    // Cố tình nâng cấp ô 18 (ô đang bị thế chấp)
    const res18 = upgradeProperty(player, cell18, registry, stateMap);
    expect(res18.success).toBe(false);
    expect(res18.reason).toBe(ActionRejectReason.GROUP_MORTGAGED);
  });

  it('resolveRent không nhân đôi tiền thuê ô đất thô C0 khi nhóm màu có ô bị thế chấp', () => {
    const registry: PropertyRegistry = new Map([
      [cell16, 'p1'],
      [cell18, 'p1'],
      [cell19, 'p1'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [cell16, { level: 0, isMortgaged: false }],
      [cell18, { level: 0, isMortgaged: true }], // Ô 18 thế chấp
      [cell19, { level: 0, isMortgaged: false }],
    ]);

    const deed16 = PROPERTY_DEEDS.get(cell16)!;
    const baseRent = deed16.rent0;

    // Tiền thuê ô 16 chỉ bằng baseRent (không nhân đôi do ô 18 bị thế chấp)
    const rent = resolveRent(BOARD_CONFIG[cell16], cell16, 'p1', registry, stateMap);
    expect(rent).toBe(baseRent);
  });

  it('Sau khi giải chấp (isMortgaged: false), phục hồi hoàn toàn độc quyền: cho phép xây dựng và nhân đôi tiền thuê', () => {
    const registry: PropertyRegistry = new Map([
      [cell16, 'p1'],
      [cell18, 'p1'],
      [cell19, 'p1'],
    ]);
    const stateMap: PropertyStateMap = new Map([
      [cell16, { level: 0, isMortgaged: false }],
      [cell18, { level: 0, isMortgaged: false }], // Đã giải chấp
      [cell19, { level: 0, isMortgaged: false }],
    ]);
    const player = createMockPlayer('p1', 5000);
    const deed16 = PROPERTY_DEEDS.get(cell16)!;

    // 1. hasMonopoly phục hồi true
    expect(hasMonopoly('p1', cell16, registry, stateMap)).toBe(true);

    // 2. resolveRent nhân đôi thành công (base0 * 2)
    const rent = resolveRent(BOARD_CONFIG[cell16], cell16, 'p1', registry, stateMap);
    expect(rent).toBe(deed16.rent0 * 2);

    // 3. upgradeProperty thành công lên C1
    const res = upgradeProperty(player, cell16, registry, stateMap);
    expect(res.success).toBe(true);
    expect(stateMap.get(cell16)?.level).toBe(1);
  });
});
