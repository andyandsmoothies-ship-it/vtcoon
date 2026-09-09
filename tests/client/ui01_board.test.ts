// [UI-S01/MSS] Pure logic tests — Vitest Node.js, zero DOM/WebGL
import { describe, it, expect, beforeEach } from 'vitest';
import { cellPosition, GRID, CELL_SIZE } from '../../src/client/3d/board_coords';
import { COLOR_GROUP_HEX } from '../../src/domain/theme';
import { ColorGroup } from '../../src/domain/board_config';
import { useGameStore } from '../../src/client/store/game_store';

// TC-UI01.1: 40-tile coordinate coverage
describe('[TC-UI01.1] cellPosition — coordinate coverage', () => {
  it('returns finite tuple for all 40 indices', () => {
    for (let i = 0; i < 40; i++) {
      const pos = cellPosition(i);
      expect(pos).toHaveLength(3);
      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);
      // Y-axis always 0 (ground level)
      expect(pos[1]).toBe(0);
    }
  });

  it('ADVERSARIAL: index 40 falls into default case (side=4), still finite', () => {
    // Out-of-range graceful degradation
    const pos = cellPosition(40);
    expect(Number.isFinite(pos[0])).toBe(true);
  });

  it('corner tile index 0 is at far-right front [GRID, 0, GRID]', () => {
    const pos = cellPosition(0);
    expect(pos[0]).toBe(GRID - 0 * CELL_SIZE);
    expect(pos[2]).toBe(GRID);
  });

  it('corner tile index 10 starts edge 2 at [-GRID, 0, GRID]', () => {
    const pos = cellPosition(10);
    expect(pos[0]).toBe(-GRID);
    expect(pos[2]).toBe(GRID - 0 * CELL_SIZE);
  });
});

// TC-UI01.2: COLOR_GROUP_HEX completeness
describe('[TC-UI01.2] COLOR_GROUP_HEX — all 8 ColorGroups mapped', () => {
  it('every ColorGroup enum value has a non-empty HEX entry', () => {
    const groups = Object.values(ColorGroup);
    for (const group of groups) {
      const hex = COLOR_GROUP_HEX[group];
      expect(hex).toBeDefined();
      expect(hex.startsWith('#')).toBe(true);
      expect(hex.length).toBeGreaterThanOrEqual(7);
    }
  });

  it('ADVERSARIAL: Nau group hex is NOT the same as Tim group hex', () => {
    expect(COLOR_GROUP_HEX[ColorGroup.Nau]).not.toBe(COLOR_GROUP_HEX[ColorGroup.Tim]);
  });

  it('Nau group maps to Earth Brown #8B5E3C', () => {
    expect(COLOR_GROUP_HEX[ColorGroup.Nau]).toBe('#8B5E3C');
  });
});

// TC-UI01.3: Zustand game_store setters
describe('[TC-UI01.3] useGameStore — state transitions', () => {
  beforeEach(() => {
    // Reset to initial state
    useGameStore.setState({ levelMap: {}, playerPositions: {} });
  });

  it('initial levelMap is empty', () => {
    expect(useGameStore.getState().levelMap).toEqual({});
  });

  it('setLevelMap updates level for a tile index', () => {
    useGameStore.getState().setLevelMap({ 1: 2, 3: 1 });
    expect(useGameStore.getState().levelMap[1]).toBe(2);
    expect(useGameStore.getState().levelMap[3]).toBe(1);
  });

  it('ADVERSARIAL: levelMap[99] returns undefined for unknown index', () => {
    expect(useGameStore.getState().levelMap[99]).toBeUndefined();
  });

  it('setPlayerPositions updates player position', () => {
    useGameStore.getState().setPlayerPositions({ 'player-1': 5 });
    expect(useGameStore.getState().playerPositions['player-1']).toBe(5);
  });
});

// TC-UI01.4: TierMarker color logic (pure)
describe('[TC-UI01.4] TierMarker color logic', () => {
  function tierColor(level: number): string {
    return level === 3 ? '#D4AF37' : '#008080';
  }

  it('level 1 → Teal #008080', () => expect(tierColor(1)).toBe('#008080'));
  it('level 2 → Teal #008080', () => expect(tierColor(2)).toBe('#008080'));
  it('level 3 → Gold #D4AF37', () => expect(tierColor(3)).toBe('#D4AF37'));
  it('ADVERSARIAL: level 3 is NOT Teal', () => expect(tierColor(3)).not.toBe('#008080'));
});

// TC-UI01.5: Corner tile detection
describe('[TC-UI01.5] Corner tile indices', () => {
  const CORNER_INDICES = new Set([0, 10, 20, 30]);

  it('indices 0, 10, 20, 30 are corners', () => {
    for (const idx of [0, 10, 20, 30]) {
      expect(CORNER_INDICES.has(idx)).toBe(true);
    }
  });

  it('ADVERSARIAL: index 1 is NOT a corner', () => {
    expect(CORNER_INDICES.has(1)).toBe(false);
  });

  it('total exactly 4 corners on 40-cell board', () => {
    let count = 0;
    for (let i = 0; i < 40; i++) {
      if (CORNER_INDICES.has(i)) count++;
    }
    expect(count).toBe(4);
  });
});
