import { describe, it, expect } from 'vitest';
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config';

describe('[UC-GAME-009/MSS] Board Config — Schema 40 o', () => {
  it('BOARD_CONFIG chua dung 40 phan tu', () => {
    expect(BOARD_CONFIG).toHaveLength(40);
  });

  it('moi o co index, name, type hop le', () => {
    for (const cell of BOARD_CONFIG) {
      expect(cell.index).toBeGreaterThanOrEqual(0);
      expect(cell.index).toBeLessThan(40);
      expect(cell.name.length).toBeGreaterThan(0);
      expect(Object.values(CellType)).toContain(cell.type);
    }
  });

  it('o dau tien (index 0) la o Khoi Hanh (Go)', () => {
    expect(BOARD_CONFIG[0]?.type).toBe(CellType.Go);
  });

  it('[UC-GAME-009/MSS] cac o dac biet dung vi tri: Jail=10, FreeParking=20, GoToJail=30', () => {
    expect(BOARD_CONFIG[10]?.type).toBe(CellType.Jail);
    expect(BOARD_CONFIG[20]?.type).toBe(CellType.FreeParking);
    expect(BOARD_CONFIG[30]?.type).toBe(CellType.GoToJail);
  });
});
