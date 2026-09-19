// [TC-IMP125-P3/MSS][UC-IMP125-P3] Contract Test Suite: Monopoly Plaza Fusion
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): detectPlayerMonopolies (2-cell groups [1, 3] & [37, 39], 3-cell groups, N-1 incomplete, split ownership, mortgaged exclusion), getMonopolyColorGroupCells, isCellInMonopolyGroup.
// Facet 2 (State Reactivity & 3D Visual Indicators): LayeredDioramaTile isMonopolyGroup prop, PlazaTrimBorder (#F59E0B), MonopolyCrownCrest, MonopolyPlazaFusion (InnerPlazaGarland), reactive loss of monopoly.
// Facet 3 (Resource Disposal & Audio Synth): synthesizeMonopolyFanfare (WebAudio F4-A4-C5-F5 brass arpeggio, 1.2s duration, node cleanup), SoundEngine.playMonopolyFanfare (muted/null bypass, state deduplication).
// Facet 4 (Error Defense): detectPlayerMonopolies safe null/undefined handling, isCellInMonopolyGroup out-of-bounds guard (< 0, >= 40, NaN), MonopolyPlazaFusion null-render on empty groups.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale snapshots during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';
import { LayeredDioramaTile, type LayeredDioramaTileProps } from '../../src/client/3d/board_tile';
import { SoundEngine, SoundEngineImpl } from '../../src/client/audio/sound_engine';
import { useAudioStore } from '../../src/client/store/audio_store';
import type { PropertyStateMap } from '../../src/domain/property_data';

// Mock Drei components for SSR renderToStaticMarkup verification
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, follow = true, ...props }: any) =>
      React.createElement('billboard', { follow: String(follow), ...props }, children),
    Image: ({ scale, ...props }: any) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
  };
});

// =========================================================================
// CONTRACT AUGMENTATION INTERFACES (SSOT Contract Definitions)
// =========================================================================

export interface MonopolyGroupInfo {
  readonly colorGroup: ColorGroup;
  readonly ownerId: string;
  readonly ownerColor: string;
  readonly ownerName: string;
  readonly cells: readonly number[];
}

export type DetectPlayerMonopoliesFn = (
  playersInfo?: Record<string, {
    id: string;
    name?: string;
    tokenColor?: string;
    balance?: number;
    ownedProperties?: readonly number[];
    mortgagedProperties?: readonly number[];
  }> | null,
  mortgagedProperties?: readonly number[] | PropertyStateMap | null
) => Record<string, MonopolyGroupInfo>;

export type IsCellInMonopolyGroupFn = (
  cellIndex: number,
  monopolyMap?: Record<string, MonopolyGroupInfo> | null
) => boolean;

export type GetMonopolyColorGroupCellsFn = (
  colorGroup: ColorGroup | string
) => readonly number[];

export type HasNewMonopolyGroupFn = (
  previousMonopolies?: Record<string, MonopolyGroupInfo> | null,
  currentMonopolies?: Record<string, MonopolyGroupInfo> | null
) => boolean;

export interface MonopolyPlazaFusionProps {
  readonly monopolyGroups?: Record<string, MonopolyGroupInfo> | null;
  readonly isHeatmapActive?: boolean;
}

export interface Imp125P3LayeredDioramaTileProps extends LayeredDioramaTileProps {
  readonly isMonopolyGroup?: boolean;
}

export interface Imp125P3SoundEngine {
  playMonopolyFanfare?: () => void;
}

export type SynthesizeMonopolyFanfareFn = (
  context: AudioContext,
  destination: AudioNode,
  volume?: number
) => void;

// Dynamic module resolution for Station 1 (RED Contract) -> Station 2 (GREEN Implementation)
let detectPlayerMonopolies: DetectPlayerMonopoliesFn | undefined;
let isCellInMonopolyGroup: IsCellInMonopolyGroupFn | undefined;
let getMonopolyColorGroupCells: GetMonopolyColorGroupCellsFn | undefined;
let hasNewMonopolyGroup: HasNewMonopolyGroupFn | undefined;
let MonopolyPlazaFusion: React.ComponentType<MonopolyPlazaFusionProps> | undefined;
let synthesizeMonopolyFanfare: SynthesizeMonopolyFanfareFn | undefined;

try {
  // @ts-ignore
  const mathMod = await import(/* @vite-ignore */ '../../src/client/3d/monopoly_plaza_math');
  if (typeof mathMod.detectPlayerMonopolies === 'function') {
    detectPlayerMonopolies = mathMod.detectPlayerMonopolies;
  }
  if (typeof mathMod.isCellInMonopolyGroup === 'function') {
    isCellInMonopolyGroup = mathMod.isCellInMonopolyGroup;
  }
  if (typeof mathMod.getMonopolyColorGroupCells === 'function') {
    getMonopolyColorGroupCells = mathMod.getMonopolyColorGroupCells;
  }
  if (typeof mathMod.hasNewMonopolyGroup === 'function') {
    hasNewMonopolyGroup = mathMod.hasNewMonopolyGroup;
  }
} catch {
  // Station 1: Red Contract phase (module not yet implemented)
}

try {
  // @ts-ignore
  const fusionMod = await import(/* @vite-ignore */ '../../src/client/3d/monopoly_plaza_fusion');
  if (fusionMod.MonopolyPlazaFusion) {
    MonopolyPlazaFusion = fusionMod.MonopolyPlazaFusion;
  }
} catch {
  // Station 1: Red Contract phase (module not yet implemented)
}

try {
  // @ts-ignore
  const soundRecipesMod = await import('../../src/client/audio/pawn_tension_sound_recipes');
  if (typeof (soundRecipesMod as any).synthesizeMonopolyFanfare === 'function') {
    synthesizeMonopolyFanfare = (soundRecipesMod as any).synthesizeMonopolyFanfare;
  }
} catch {
  // Station 1: Red Contract phase (recipe not yet implemented)
}

// =========================================================================
// MOCK AUDIO ENGINE PRIMITIVES
// =========================================================================

function createMockAudioParam(initialValue = 1) {
  return {
    value: initialValue,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

class MockAudioNode {
  public connect = vi.fn();
  public disconnect = vi.fn();
}

class MockOscillatorNode extends MockAudioNode {
  public type = 'sine';
  public frequency = createMockAudioParam(440);
  public start = vi.fn();
  public stop = vi.fn();
}

class MockGainNode extends MockAudioNode {
  public gain = createMockAudioParam(1);
}

class MockAudioContext {
  public state: AudioContextState = 'running';
  public currentTime = 5.0;
  public sampleRate = 44100;
  public destination = new MockAudioNode();
  public createdOscillators: MockOscillatorNode[] = [];
  public createdGains: MockGainNode[] = [];

  public createOscillator(): MockOscillatorNode {
    const osc = new MockOscillatorNode();
    this.createdOscillators.push(osc);
    return osc;
  }

  public createGain(): MockGainNode {
    const gain = new MockGainNode();
    this.createdGains.push(gain);
    return gain;
  }
}

// =========================================================================
// REALISTIC TEST FIXTURES
// =========================================================================

const sampleBrownCell: BoardCell = {
  index: 1,
  name: 'Cần Thơ (Cái Răng)',
  type: CellType.Property,
  colorGroup: ColorGroup.Nau,
};

const sampleRedCell: BoardCell = {
  index: 21,
  name: 'Thanh Hóa (Sầm Sơn)',
  type: CellType.Property,
  colorGroup: ColorGroup.Do,
};

describe('[IMP-125-P3/MSS] Phase 3 Contract Test Suite: Monopoly Plaza Fusion', () => {
  beforeEach(() => {
    useAudioStore.setState({
      masterVolume: 1.0,
      sfxVolume: 1.0,
      bgmVolume: 1.0,
      isMuted: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // GÓI 1: TOÁN HỌC XÁC ĐỊNH ĐỘC QUYỀN (MONOPOLY PLAZA PURE MATH)
  // =========================================================================
  describe('Gói 1: Toán Học Xác Định Độc Quyền (Monopoly Plaza Pure Math)', () => {
    it('[TC-IMP125-P3.01/MSS][UC-IMP125-P3] Facet 1 (Boundary): getMonopolyColorGroupCells trả về đúng 2 ô [1, 3] cho nhóm Nâu (ColorGroup.Nau)', () => {
      const fn = getMonopolyColorGroupCells;
      if (!fn) throw new Error('getMonopolyColorGroupCells is not exported from monopoly_plaza_math.ts');
      const cells = fn(ColorGroup.Nau);
      expect(cells).toEqual([1, 3]);
    });

    it('[TC-IMP125-P3.02/MSS][UC-IMP125-P3] Facet 1 (Boundary): getMonopolyColorGroupCells trả về đúng 2 ô [37, 39] cho nhóm Tím (ColorGroup.Tim)', () => {
      const fn = getMonopolyColorGroupCells;
      if (!fn) throw new Error('getMonopolyColorGroupCells is not exported from monopoly_plaza_math.ts');
      const cells = fn(ColorGroup.Tim);
      expect(cells).toEqual([37, 39]);
    });

    it.each([
      [ColorGroup.XanhDaTroi, [6, 8, 9]],
      [ColorGroup.Hong, [11, 13, 14]],
      [ColorGroup.Cam, [16, 18, 19]],
      [ColorGroup.Do, [21, 23, 24]],
      [ColorGroup.Vang, [26, 27, 29]],
      [ColorGroup.XanhLa, [31, 32, 34]],
    ])(
      '[TC-IMP125-P3.03/MSS][UC-IMP125-P3] Facet 1 (Boundary): getMonopolyColorGroupCells trả về đúng 3 ô cho nhóm màu %s',
      (colorGroup, expectedCells) => {
        const fn = getMonopolyColorGroupCells;
        if (!fn) throw new Error('getMonopolyColorGroupCells is not exported from monopoly_plaza_math.ts');
        const cells = fn(colorGroup);
        expect(cells).toEqual(expectedCells);
      }
    );

    it('[TC-IMP125-P3.04/MSS][UC-IMP125-P3] Facet 1 (Boundary): detectPlayerMonopolies phát hiện độc quyền nhóm 2 ô Nâu (1, 3) khi cùng người chơi sở hữu', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p1_saigon: {
          id: 'p1_saigon',
          name: 'Chủ Tịch Sài Gòn',
          tokenColor: '#EF4444',
          ownedProperties: [1, 3],
        },
      };
      const result = fn(players);
      expect(result[ColorGroup.Nau]).toBeDefined();
      expect(result[ColorGroup.Nau]?.ownerId).toBe('p1_saigon');
      expect(result[ColorGroup.Nau]?.cells).toEqual([1, 3]);
    });

    it('[TC-IMP125-P3.05/MSS][UC-IMP125-P3] Facet 1 (Boundary): detectPlayerMonopolies phát hiện độc quyền nhóm 2 ô Tím (37, 39) khi cùng người chơi sở hữu', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p2_hanoi: {
          id: 'p2_hanoi',
          name: 'Đại Gia Hà Nội',
          tokenColor: '#3B82F6',
          ownedProperties: [37, 39],
        },
      };
      const result = fn(players);
      expect(result[ColorGroup.Tim]).toBeDefined();
      expect(result[ColorGroup.Tim]?.ownerId).toBe('p2_hanoi');
      expect(result[ColorGroup.Tim]?.ownerColor).toBe('#3B82F6');
    });

    it('[TC-IMP125-P3.06/MSS][UC-IMP125-P3] Facet 1 (Boundary): detectPlayerMonopolies phát hiện độc quyền nhóm 3 ô Đỏ (21, 23, 24) khi người chơi sở hữu đủ cả 3 ô', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p1_saigon: {
          id: 'p1_saigon',
          name: 'Chủ Tịch Sài Gòn',
          tokenColor: '#EF4444',
          ownedProperties: [21, 23, 24],
        },
      };
      const result = fn(players);
      expect(result[ColorGroup.Do]).toBeDefined();
      expect(result[ColorGroup.Do]?.cells).toEqual([21, 23, 24]);
    });

    it('[TC-IMP125-P3.07/MSS][UC-IMP125-P3] Facet 1 (Boundary): detectPlayerMonopolies phát hiện độc quyền nhóm 3 ô Vàng (26, 27, 29) khi người chơi sở hữu đủ cả 3 ô', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p2_hanoi: {
          id: 'p2_hanoi',
          name: 'Đại Gia Hà Nội',
          tokenColor: '#3B82F6',
          ownedProperties: [26, 27, 29],
        },
      };
      const result = fn(players);
      expect(result[ColorGroup.Vang]).toBeDefined();
      expect(result[ColorGroup.Vang]?.ownerId).toBe('p2_hanoi');
    });

    it('[TC-IMP125-P3.08/MSS][UC-IMP125-P3] Facet 1 (Boundary): Thiếu 1 ô (N-1) trong nhóm 2 ô Nâu (chỉ sở hữu ô 1) không đạt độc quyền', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p1_saigon: {
          id: 'p1_saigon',
          name: 'Chủ Tịch Sài Gòn',
          tokenColor: '#EF4444',
          ownedProperties: [1],
        },
      };
      const result = fn(players);
      expect(result[ColorGroup.Nau]).toBeUndefined();
    });

    it('[TC-IMP125-P3.09/MSS][UC-IMP125-P3] Facet 1 (Boundary): Thiếu 1 ô (N-1) trong nhóm 3 ô Cam (sở hữu 16, 18 nhưng thiếu 19) không đạt độc quyền', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p1_saigon: {
          id: 'p1_saigon',
          name: 'Chủ Tịch Sài Gòn',
          tokenColor: '#EF4444',
          ownedProperties: [16, 18],
        },
      };
      const result = fn(players);
      expect(result[ColorGroup.Cam]).toBeUndefined();
    });

    it('[TC-IMP125-P3.10/MSS][UC-IMP125-P3] Facet 1 (Boundary): Hai người chơi khác nhau chia nhau sở hữu nhóm Nâu (p1 ô 1, p2 ô 3) không đạt độc quyền', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p1_saigon: { id: 'p1_saigon', name: 'P1', tokenColor: '#EF4444', ownedProperties: [1] },
        p2_hanoi: { id: 'p2_hanoi', name: 'P2', tokenColor: '#3B82F6', ownedProperties: [3] },
      };
      const result = fn(players);
      expect(result[ColorGroup.Nau]).toBeUndefined();
    });

    it('[TC-IMP125-P3.11/MSS][UC-IMP125-P3] Facet 1 (Boundary): Hai người chơi chia nhau nhóm 3 ô Đỏ (p1 ô 21, 23; p2 ô 24) không đạt độc quyền', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p1_saigon: { id: 'p1_saigon', name: 'P1', tokenColor: '#EF4444', ownedProperties: [21, 23] },
        p2_hanoi: { id: 'p2_hanoi', name: 'P2', tokenColor: '#3B82F6', ownedProperties: [24] },
      };
      const result = fn(players);
      expect(result[ColorGroup.Do]).toBeUndefined();
    });

    it('[TC-IMP125-P3.12/MSS][UC-IMP125-P3] Facet 1 (Boundary): Ô bị thế chấp trong mortgagedProperties hủy trạng thái độc quyền của nhóm Đỏ', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p1_saigon: {
          id: 'p1_saigon',
          name: 'Chủ Tịch Sài Gòn',
          tokenColor: '#EF4444',
          ownedProperties: [21, 23, 24],
          mortgagedProperties: [23],
        },
      };
      const result = fn(players);
      expect(result[ColorGroup.Do]).toBeUndefined();
    });

    it('[TC-IMP125-P3.13/MSS][UC-IMP125-P3] Facet 1 (Boundary): Ô bị thế chấp qua PropertyStateMap (isMortgaged: true) hủy độc quyền nhóm Tím', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p2_hanoi: {
          id: 'p2_hanoi',
          name: 'Đại Gia Hà Nội',
          tokenColor: '#3B82F6',
          ownedProperties: [37, 39],
        },
      };
      const stateMap: PropertyStateMap = new Map([
        [37, { level: 0, isMortgaged: false }],
        [39, { level: 0, isMortgaged: true }],
      ]);
      const result = fn(players, stateMap);
      expect(result[ColorGroup.Tim]).toBeUndefined();
    });

    it('[TC-IMP125-P3.14/MSS][UC-IMP125-P3] Facet 1 (Boundary): Đa người chơi cùng đạt độc quyền ở các nhóm khác nhau (p1 Đỏ, p2 Cam) trả về đầy đủ cả 2 nhóm', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p1_saigon: {
          id: 'p1_saigon',
          name: 'Chủ Tịch Sài Gòn',
          tokenColor: '#EF4444',
          ownedProperties: [21, 23, 24],
        },
        p2_hanoi: {
          id: 'p2_hanoi',
          name: 'Đại Gia Hà Nội',
          tokenColor: '#3B82F6',
          ownedProperties: [16, 18, 19],
        },
      };
      const result = fn(players);
      expect(result[ColorGroup.Do]?.ownerId).toBe('p1_saigon');
      expect(result[ColorGroup.Cam]?.ownerId).toBe('p2_hanoi');
    });

    it.each([21, 23, 24])(
      '[TC-IMP125-P3.15/MSS][UC-IMP125-P3] Facet 1 (Consumer Assertion): isCellInMonopolyGroup trả về true cho ô %i thuộc nhóm độc quyền Đỏ',
      (cellIndex) => {
        const fn = isCellInMonopolyGroup;
        if (!fn) throw new Error('isCellInMonopolyGroup is not exported from monopoly_plaza_math.ts');
        const monopolyMap: Record<string, MonopolyGroupInfo> = {
          [ColorGroup.Do]: {
            colorGroup: ColorGroup.Do,
            ownerId: 'p1_saigon',
            ownerColor: '#EF4444',
            ownerName: 'Chủ Tịch Sài Gòn',
            cells: [21, 23, 24],
          },
        };
        expect(fn(cellIndex, monopolyMap)).toBe(true);
      }
    );

    it('[TC-IMP125-P3.16/MSS][UC-IMP125-P3] Facet 1 (Boundary): isCellInMonopolyGroup trả về false cho các ô phi tài sản kẹp giữa (ô Cơ Hội 22, ô Thuế 4)', () => {
      const fn = isCellInMonopolyGroup;
      if (!fn) throw new Error('isCellInMonopolyGroup is not exported from monopoly_plaza_math.ts');
      const monopolyMap: Record<string, MonopolyGroupInfo> = {
        [ColorGroup.Do]: {
          colorGroup: ColorGroup.Do,
          ownerId: 'p1_saigon',
          ownerColor: '#EF4444',
          ownerName: 'Chủ Tịch Sài Gòn',
          cells: [21, 23, 24],
        },
      };
      expect(fn(22, monopolyMap)).toBe(false);
      expect(fn(4, monopolyMap)).toBe(false);
    });

    it('[TC-IMP125-P3.17/MSS][UC-IMP125-P3] Facet 1 (Boundary): isCellInMonopolyGroup trả về false cho ô tài sản lẻ không thuộc nhóm độc quyền nào', () => {
      const fn = isCellInMonopolyGroup;
      if (!fn) throw new Error('isCellInMonopolyGroup is not exported from monopoly_plaza_math.ts');
      const monopolyMap: Record<string, MonopolyGroupInfo> = {
        [ColorGroup.Do]: {
          colorGroup: ColorGroup.Do,
          ownerId: 'p1_saigon',
          ownerColor: '#EF4444',
          ownerName: 'Chủ Tịch Sài Gòn',
          cells: [21, 23, 24],
        },
      };
      expect(fn(1, monopolyMap)).toBe(false);
    });
  });

  // =========================================================================
  // GÓI 2: DẢI SÁNG HUỲNH QUANG & VƯƠNG MIỆN HOÀNG GIA (PLAZA TRIM & CROWN CREST)
  // =========================================================================
  describe('Gói 2: Dải Sáng Huỳnh Quang & Vương Miện Hoàng Gia (Plaza Trim & Crown Crest)', () => {
    it('[TC-IMP125-P3.18/MSS][UC-IMP125-P3] Facet 2 (State Reactivity): LayeredDioramaTile chấp nhận prop isMonopolyGroup mà không crash', () => {
      const Tile = LayeredDioramaTile as React.ComponentType<Imp125P3LayeredDioramaTileProps>;
      const html = renderToStaticMarkup(
        React.createElement(Tile, {
          cell: sampleBrownCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isMonopolyGroup: true,
        })
      );
      expect(html).toContain('OwnerBaseTrim');
    });

    it('[TC-IMP125-P3.19/MSS][UC-IMP125-P3] Facet 2 (Consumer Assertion): Khi isMonopolyGroup === true và Heatmap tắt, OwnerBaseTrim phát sáng emissiveIntensity 0.65', () => {
      const Tile = LayeredDioramaTile as React.ComponentType<Imp125P3LayeredDioramaTileProps>;
      const html = renderToStaticMarkup(
        React.createElement(Tile, {
          cell: sampleBrownCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isMonopolyGroup: true,
          isHeatmapActive: false,
        })
      );
      expect(html).toContain('emissiveIntensity="0.65"');
      expect(html).toContain('emissive="#EF4444"');
    });

    it('[TC-IMP125-P3.20/MSS][UC-IMP125-P3] Facet 2 (Consumer Assertion): Khi isMonopolyGroup === true và Heatmap bật, OwnerBaseTrim tăng cường emissiveIntensity lên 1.4', () => {
      const Tile = LayeredDioramaTile as React.ComponentType<Imp125P3LayeredDioramaTileProps>;
      const html = renderToStaticMarkup(
        React.createElement(Tile, {
          cell: sampleBrownCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isMonopolyGroup: true,
          isHeatmapActive: true,
        })
      );
      expect(html).toContain('emissiveIntensity="1.4"');
    });

    it('[TC-IMP125-P3.21/MSS][UC-IMP125-P3] Facet 2 (State Reactivity): Khi isMonopolyGroup === false và Heatmap tắt, OwnerBaseTrim duy trì emissiveIntensity = 0', () => {
      const Tile = LayeredDioramaTile as React.ComponentType<Imp125P3LayeredDioramaTileProps>;
      const html = renderToStaticMarkup(
        React.createElement(Tile, {
          cell: sampleBrownCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isMonopolyGroup: false,
          isHeatmapActive: false,
        })
      );
      expect(html).toContain('emissiveIntensity="0"');
    });

    it('[TC-IMP125-P3.22/MSS][UC-IMP125-P3] Facet 2 (Consumer Assertion): Khi isMonopolyGroup === true, LayeredDioramaTile render viền đai ánh kim PlazaTrimBorder màu #F59E0B', () => {
      const Tile = LayeredDioramaTile as React.ComponentType<Imp125P3LayeredDioramaTileProps>;
      const html = renderToStaticMarkup(
        React.createElement(Tile, {
          cell: sampleRedCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isMonopolyGroup: true,
        })
      );
      expect(html).toContain('PlazaTrimBorder');
      expect(html).toContain('#F59E0B');
    });

    it('[TC-IMP125-P3.23/MSS][UC-IMP125-P3] Facet 2 (Consumer Assertion): Khi isMonopolyGroup === true, LayeredDioramaTile render huy hiệu vương miện mạ vàng MonopolyCrownCrest', () => {
      const Tile = LayeredDioramaTile as React.ComponentType<Imp125P3LayeredDioramaTileProps>;
      const html = renderToStaticMarkup(
        React.createElement(Tile, {
          cell: sampleRedCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isMonopolyGroup: true,
        })
      );
      const hasCrownCrest = html.includes('monopoly-crown-crest') || html.includes('MonopolyCrownCrest');
      expect(hasCrownCrest).toBe(true);
    });

    it('[TC-IMP125-P3.24/MSS][UC-IMP125-P3] Facet 2 (State Reactivity): Khi isMonopolyGroup === false, LayeredDioramaTile KHÔNG render MonopolyCrownCrest hay PlazaTrimBorder', () => {
      const Tile = LayeredDioramaTile as React.ComponentType<Imp125P3LayeredDioramaTileProps>;
      const html = renderToStaticMarkup(
        React.createElement(Tile, {
          cell: sampleRedCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isMonopolyGroup: false,
        })
      );
      const hasCrownCrest = html.includes('monopoly-crown-crest') || html.includes('MonopolyCrownCrest');
      expect(hasCrownCrest).toBe(false);
      expect(html).not.toContain('PlazaTrimBorder');
    });

    it('[TC-IMP125-P3.25/MSS][UC-IMP125-P3] Facet 2 (Consumer Assertion): MonopolyPlazaFusion render dải cờ hoa vỉa hè InnerPlazaGarland cho các nhóm độc quyền', () => {
      const Fusion = MonopolyPlazaFusion;
      if (!Fusion) throw new Error('MonopolyPlazaFusion is not exported from monopoly_plaza_fusion.tsx');
      const monopolyGroups: Record<string, MonopolyGroupInfo> = {
        [ColorGroup.Do]: {
          colorGroup: ColorGroup.Do,
          ownerId: 'p1_saigon',
          ownerColor: '#EF4444',
          ownerName: 'Chủ Tịch Sài Gòn',
          cells: [21, 23, 24],
        },
      };
      const html = renderToStaticMarkup(React.createElement(Fusion, { monopolyGroups }));
      const hasGarland = html.includes('inner-plaza-garland') || html.includes('InnerPlazaGarland') || html.includes('InnerBunting');
      expect(hasGarland).toBe(true);
    });

    it('[TC-IMP125-P3.26/MSS][UC-IMP125-P3] Facet 2 (State Reactivity): Thu hồi độc quyền khi ô bị thế chấp loại bỏ toàn bộ visual indicators độc quyền', () => {
      const Tile = LayeredDioramaTile as React.ComponentType<Imp125P3LayeredDioramaTileProps>;
      // First render with monopoly
      const htmlWithMonopoly = renderToStaticMarkup(
        React.createElement(Tile, {
          cell: sampleRedCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isMonopolyGroup: true,
        })
      );
      // Re-render when monopoly is lost
      const htmlWithoutMonopoly = renderToStaticMarkup(
        React.createElement(Tile, {
          cell: sampleRedCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isMonopolyGroup: false,
        })
      );
      expect(htmlWithMonopoly).toContain('PlazaTrimBorder');
      expect(htmlWithoutMonopoly).not.toContain('PlazaTrimBorder');
    });
  });

  // =========================================================================
  // GÓI 3: HOAN CA ĐỘC QUYỀN WEBAUDIO & QUẢN LÝ TÀI NGUYÊN (AUDIO SYNTH & DISPOSAL)
  // =========================================================================
  describe('Gói 3: Hoan Ca Độc Quyền WebAudio & Quản Lý Tài Nguyên (Audio Synth & Disposal)', () => {
    it('[TC-IMP125-P3.27/MSS][UC-IMP125-P3] Facet 3 (Audio Synth): synthesizeMonopolyFanfare khởi tạo hợp âm kèn đồng 4 nốt F4, A4, C5, F5', () => {
      const fn = synthesizeMonopolyFanfare;
      if (!fn) throw new Error('synthesizeMonopolyFanfare is not exported from pawn_tension_sound_recipes.ts');
      const mockCtx = new MockAudioContext();
      fn(mockCtx as unknown as AudioContext, mockCtx.destination as unknown as AudioNode, 0.8);
      expect(mockCtx.createdOscillators.length).toBeGreaterThanOrEqual(4);
      // F4: ~349Hz, A4: 440Hz, C5: ~523Hz, F5: ~698Hz
      const freqCalls = mockCtx.createdOscillators.map(
        (osc) => osc.frequency.setValueAtTime.mock.calls[0]?.[0]
      );
      expect(freqCalls).toEqual(
        expect.arrayContaining([
          expect.closeTo(349.23, 1),
          expect.closeTo(440.0, 1),
          expect.closeTo(523.25, 1),
          expect.closeTo(698.46, 1),
        ])
      );
    });

    it('[TC-IMP125-P3.28/MSS][UC-IMP125-P3] Facet 3 (Resource Disposal): synthesizeMonopolyFanfare lập lịch ngắt toàn bộ oscillators đúng hạn (duration ~1.2s)', () => {
      const fn = synthesizeMonopolyFanfare;
      if (!fn) throw new Error('synthesizeMonopolyFanfare is not exported from pawn_tension_sound_recipes.ts');
      const mockCtx = new MockAudioContext();
      mockCtx.currentTime = 10.0;
      fn(mockCtx as unknown as AudioContext, mockCtx.destination as unknown as AudioNode, 0.8);
      // All oscillators must stop within 10.0 + 1.4s
      const maxStopTime = Math.max(
        ...mockCtx.createdOscillators.map((osc) => osc.stop.mock.calls[0]?.[0] ?? 0)
      );
      expect(maxStopTime).toBeGreaterThan(10.5);
      expect(maxStopTime).toBeLessThanOrEqual(11.4);
    });

    it('[TC-IMP125-P3.29/MSS][UC-IMP125-P3] Facet 3 (Resource Disposal): synthesizeMonopolyFanfare thoát sớm không tạo node khi volume <= 0', () => {
      const fn = synthesizeMonopolyFanfare;
      if (!fn) throw new Error('synthesizeMonopolyFanfare is not exported from pawn_tension_sound_recipes.ts');
      const mockCtx = new MockAudioContext();
      fn(mockCtx as unknown as AudioContext, mockCtx.destination as unknown as AudioNode, 0);
      expect(mockCtx.createdOscillators.length).toBe(0);
      expect(mockCtx.createdGains.length).toBe(0);
    });

    it('[TC-IMP125-P3.30/MSS][UC-IMP125-P3] Facet 3 (Consumer Assertion): SoundEngine sở hữu phương thức playMonopolyFanfare', () => {
      const engine = SoundEngine as unknown as Imp125P3SoundEngine;
      if (typeof engine.playMonopolyFanfare !== 'function') {
        throw new Error('playMonopolyFanfare is not implemented on SoundEngine');
      }
      expect(typeof engine.playMonopolyFanfare).toBe('function');
    });

    it('[TC-IMP125-P3.31/MSS][UC-IMP125-P3] Facet 3 (Audio Synth): SoundEngine.playMonopolyFanfare bypass an toàn không crash khi isMuted = true', () => {
      useAudioStore.setState({ isMuted: true });
      const engine = SoundEngine as unknown as Imp125P3SoundEngine;
      if (typeof engine.playMonopolyFanfare !== 'function') {
        throw new Error('playMonopolyFanfare is not implemented on SoundEngine');
      }
      expect(() => engine.playMonopolyFanfare!()).not.toThrow();
    });

    it('[TC-IMP125-P3.32/MSS][UC-IMP125-P3] Facet 3 (Audio Synth): SoundEngine.playMonopolyFanfare bypass an toàn khi AudioContext không khả dụng', () => {
      const engineInstance = new SoundEngineImpl();
      vi.spyOn(engineInstance, 'getContext').mockReturnValue(null);
      const engine = engineInstance as unknown as Imp125P3SoundEngine;
      if (typeof engine.playMonopolyFanfare !== 'function') {
        throw new Error('playMonopolyFanfare is not implemented on SoundEngine');
      }
      expect(() => engine.playMonopolyFanfare!()).not.toThrow();
    });

    it('[TC-IMP125-P3.33/MSS][UC-IMP125-P3] Facet 3 (State Reactivity): Không phát lặp lại fanfare nếu danh sách nhóm độc quyền không có nhóm mới phát sinh', () => {
      const fn = hasNewMonopolyGroup;
      if (!fn) throw new Error('hasNewMonopolyGroup is not exported from monopoly_plaza_math.ts');
      const prev = {
        [ColorGroup.Do]: {
          colorGroup: ColorGroup.Do,
          ownerId: 'p1_saigon',
          ownerColor: '#EF4444',
          ownerName: 'Chủ Tịch Sài Gòn',
          cells: [21, 23, 24],
        },
      };
      const currentSame = { ...prev };
      const currentWithNew = {
        ...prev,
        [ColorGroup.Cam]: {
          colorGroup: ColorGroup.Cam,
          ownerId: 'p2_hanoi',
          ownerColor: '#3B82F6',
          ownerName: 'Đại Gia Hà Nội',
          cells: [16, 18, 19],
        },
      };
      expect(fn(prev, currentSame)).toBe(false);
      expect(fn(prev, currentWithNew)).toBe(true);
    });
  });

  // =========================================================================
  // GÓI 4: PHÒNG THỦ NGOẠI LỆ & GIÁ TRỊ BIÊN (ERROR DEFENSE & BOUNDARIES)
  // =========================================================================
  describe('Gói 4: Phòng Thủ Ngoại Lệ & Giá Trị Biên (Error Defense & Boundaries)', () => {
    it('[TC-IMP125-P3.34/MSS][UC-IMP125-P3] Facet 4 (Error Defense): detectPlayerMonopolies(null / undefined) trả về an toàn {} không crash', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      expect(fn(null)).toEqual({});
      expect(fn(undefined)).toEqual({});
    });

    it('[TC-IMP125-P3.35/MSS][UC-IMP125-P3] Facet 4 (Error Defense): detectPlayerMonopolies({}) với danh sách rỗng trả về {} an toàn', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      expect(fn({})).toEqual({});
    });

    it('[TC-IMP125-P3.36/MSS][UC-IMP125-P3] Facet 4 (Error Defense): detectPlayerMonopolies xử lý an toàn khi người chơi có ownedProperties undefined', () => {
      const fn = detectPlayerMonopolies;
      if (!fn) throw new Error('detectPlayerMonopolies is not exported from monopoly_plaza_math.ts');
      const players = {
        p1_saigon: {
          id: 'p1_saigon',
          name: 'Chủ Tịch Sài Gòn',
          tokenColor: '#EF4444',
          ownedProperties: undefined,
        },
      };
      expect(fn(players)).toEqual({});
    });

    it.each([-1, 40, 100, NaN])(
      '[TC-IMP125-P3.37/MSS][UC-IMP125-P3] Facet 4 (Boundary): isCellInMonopolyGroup với cellIndex ngoài biên %s trả về false',
      (invalidIndex) => {
        const fn = isCellInMonopolyGroup;
        if (!fn) throw new Error('isCellInMonopolyGroup is not exported from monopoly_plaza_math.ts');
        const monopolyMap: Record<string, MonopolyGroupInfo> = {
          [ColorGroup.Do]: {
            colorGroup: ColorGroup.Do,
            ownerId: 'p1_saigon',
            ownerColor: '#EF4444',
            ownerName: 'Chủ Tịch Sài Gòn',
            cells: [21, 23, 24],
          },
        };
        expect(fn(invalidIndex, monopolyMap)).toBe(false);
      }
    );

    it('[TC-IMP125-P3.38/MSS][UC-IMP125-P3] Facet 4 (Error Defense): MonopolyPlazaFusion nhận monopolyGroups null hoặc rỗng trả về null không crash', () => {
      const Fusion = MonopolyPlazaFusion;
      if (!Fusion) throw new Error('MonopolyPlazaFusion is not exported from monopoly_plaza_fusion.tsx');
      expect(renderToStaticMarkup(React.createElement(Fusion, { monopolyGroups: null }))).toBe('');
      expect(renderToStaticMarkup(React.createElement(Fusion, { monopolyGroups: {} }))).toBe('');
    });

    it('[TC-IMP125-P3.39/MSS][UC-IMP125-P3] Facet 4 (Error Defense): getMonopolyColorGroupCells với colorGroup không hợp lệ trả về [] không throw', () => {
      const fn = getMonopolyColorGroupCells;
      if (!fn) throw new Error('getMonopolyColorGroupCells is not exported from monopoly_plaza_math.ts');
      expect(fn('INVALID_GROUP' as any)).toEqual([]);
      expect(fn('' as any)).toEqual([]);
    });
  });
});
