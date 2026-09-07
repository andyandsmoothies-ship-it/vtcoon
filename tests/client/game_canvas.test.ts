import { describe, it, expect } from 'vitest';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import { cellPosition } from '../../src/client/game_canvas';

describe('[UC-GAME-009/MSS] Game Canvas - Tien dieu kien va Cau truc', () => {
  it('BOARD_CONFIG co du 40 o de dung Canvas', () => {
    expect(BOARD_CONFIG).toHaveLength(40);
  });

  it('moi o co name khong rong de hien thi label', () => {
    for (const cell of BOARD_CONFIG) {
      expect(cell.name.length).toBeGreaterThan(0);
    }
  });

  it('cellPosition(0) tra ve tuple [number, number, number]', () => {
    const pos = cellPosition(0);
    expect(pos).toHaveLength(3);
    expect(typeof pos[0]).toBe('number');
    expect(typeof pos[1]).toBe('number');
    expect(typeof pos[2]).toBe('number');
  });

  it('cellPosition tinh vi tri hop le cho moi index 0-39', () => {
    for (let i = 0; i < 40; i++) {
      const pos = cellPosition(i);
      expect(pos).toHaveLength(3);
      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[1])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);
    }
  });
});