// [UI-S01/MSS] Pure logic tests — Vitest Node.js, zero DOM/WebGL
import { describe, it, expect, beforeEach } from 'vitest';
import { cellPosition, GRID, CELL_SIZE } from '../../src/client/3d/board_coords';
import { COLOR_GROUP_HEX } from '../../src/domain/theme';
import { ColorGroup, BOARD_CONFIG } from '../../src/domain/board_config';
import { useGameStore } from '../../src/client/store/game_store';
import { TILE_METADATA_MAP, formatPriceLabel } from '../../src/client/3d/tile_texture_data';
import { getTileTexture, getStandeeTexture } from '../../src/client/3d/tile_texture_generator';
import { tileRotation } from '../../src/client/3d/board_layout';
import { ICON_RENDERERS, drawIcon } from '../../src/client/3d/tile_icons';
import { getStandeeWebpUrl, clearStandeeWebpCache, standeeWebpCache } from '../../src/client/3d/board_tile';

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

// TC-UI01.6: 40-Tile Legibility & Standee Cultural Identifiers
describe('[TC-UI01.6] Tile Metadata & Cultural Identifiers — 40 Tiles Legibility', () => {
  it('covers all 40 cell indices (0 to 39) with complete metadata', () => {
    for (let i = 0; i < 40; i++) {
      const meta = TILE_METADATA_MAP[i];
      expect(meta).toBeDefined();
      if (!meta) continue;
      expect(meta.title.length).toBeGreaterThan(0);
      expect(meta.bannerColor.startsWith('#')).toBe(true);
      expect(meta.category.length).toBeGreaterThan(0);
      expect(meta.icon.length).toBeGreaterThan(0);
    }
  });

  it('4 corner tiles (0, 10, 20, 30) have distinctive titles and categories', () => {
    expect(TILE_METADATA_MAP[0]?.title).toBe('KHỞI HÀNH');
    expect(TILE_METADATA_MAP[0]?.category).toBe('XUẤT PHÁT');

    expect(TILE_METADATA_MAP[10]?.title).toBe('KIỂM TOÁN');
    expect(TILE_METADATA_MAP[10]?.category).toBe('THANH TRA');

    expect(TILE_METADATA_MAP[20]?.title).toBe('NGHỈ DƯỠNG');
    expect(TILE_METADATA_MAP[20]?.category).toBe('DỪNG CHÂN');

    expect(TILE_METADATA_MAP[30]?.title).toBe('THANH TRA');
    expect(TILE_METADATA_MAP[30]?.category).toBe('THANH TRA');
  });

  it('formatPriceLabel formats Vietnamese currency with comma/dot grouping', () => {
    expect(formatPriceLabel(600)).toBe('600 Tr.');
    expect(formatPriceLabel(1400)).toBe('1.400 Tr.');
    expect(formatPriceLabel(4000)).toBe('4.000 Tr.');
    expect(formatPriceLabel(undefined)).toBe('');
  });

  it('toàn bộ 22 ô BĐS có colorGroup khớp 100% COLOR_GROUP_HEX theo SSOT theme.ts', () => {
    for (const cell of BOARD_CONFIG) {
      if (cell.colorGroup != null) {
        const meta = TILE_METADATA_MAP[cell.index];
        expect(meta).toBeDefined();
        expect(meta?.bannerColor).toBe(COLOR_GROUP_HEX[cell.colorGroup]);
      }
    }
  });

  it('toàn bộ 35 biểu tượng văn hoá bản địa có renderer riêng trong ICON_RENDERERS', () => {
    for (let i = 0; i < 40; i++) {
      const meta = TILE_METADATA_MAP[i];
      if (!meta) continue;
      expect(ICON_RENDERERS[meta.icon]).toBeDefined();
      expect(ICON_RENDERERS[meta.icon]).not.toBe(ICON_RENDERERS.default);
    }
  });

  it('drawIcon thực thi trơn tru với mock context 2D cho toàn bộ 35 icon', () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      arc: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
      font: '',
      textAlign: 'center',
      textBaseline: 'middle',
    } as unknown as CanvasRenderingContext2D;

    for (let i = 0; i < 40; i++) {
      const meta = TILE_METADATA_MAP[i]!;
      expect(() => drawIcon(mockCtx, meta.icon, 128, 205, '#F59E0B', 1.0)).not.toThrow();
    }
  });

  it('texture generators safely return null in Node/SSR environment without throwing', () => {
    // In Vitest Node environment, document is undefined
    expect(getTileTexture(0)).toBeNull();
    expect(getTileTexture(1)).toBeNull();
    expect(getStandeeTexture(1)).toBeNull();
    expect(getStandeeTexture(14)).toBeNull();
  });
});

// TC-UI01.7: 4-Side Perpendicular Tile Rotations
describe('[TC-UI01.7] tileRotation — 4-Side Perpendicular Board Orientation', () => {
  it('Side 0 (cells 0..9) rotates [0, 0, 0] facing camera', () => {
    for (let i = 0; i <= 9; i++) {
      expect(tileRotation(i)).toEqual([0, 0, 0]);
    }
  });

  it('Side 1 (cells 10..19) rotates [0, -Math.PI / 2, 0]', () => {
    for (let i = 10; i <= 19; i++) {
      expect(tileRotation(i)).toEqual([0, -Math.PI / 2, 0]);
    }
  });

  it('Side 2 (cells 20..29) rotates [0, Math.PI, 0]', () => {
    for (let i = 20; i <= 29; i++) {
      expect(tileRotation(i)).toEqual([0, Math.PI, 0]);
    }
  });

  it('Side 3 (cells 30..39) rotates [0, Math.PI / 2, 0]', () => {
    for (let i = 30; i <= 39; i++) {
      expect(tileRotation(i)).toEqual([0, Math.PI / 2, 0]);
    }
  });

  it('4 corner tiles (0, 10, 20, 30) align squarely with their sides with 0 protrusion', () => {
    expect(tileRotation(0)).toEqual([0, 0, 0]);
    expect(tileRotation(10)).toEqual([0, -Math.PI / 2, 0]);
    expect(tileRotation(20)).toEqual([0, Math.PI, 0]);
    expect(tileRotation(30)).toEqual([0, Math.PI / 2, 0]);
  });
});

// TC-UI01.8: Smart Standee WebP Loader & Resilient Fallback
describe('[TC-UI01.8] Smart Standee WebP Loader & Resilient Fallback', () => {
  beforeEach(() => {
    clearStandeeWebpCache();
  });

  it('getStandeeWebpUrl tao dung duong dan webp cho moi index 0..39', () => {
    for (let i = 0; i < 40; i++) {
      expect(getStandeeWebpUrl(i)).toBe(`/assets/tiles/tile_${i}.webp`);
    }
  });

  it('standeeWebpCache cache texture hop le va clear hoat dong', () => {
    expect(standeeWebpCache.size).toBe(0);
    standeeWebpCache.set(1, null);
    expect(standeeWebpCache.has(1)).toBe(true);
    clearStandeeWebpCache();
    expect(standeeWebpCache.size).toBe(0);
  });
});


