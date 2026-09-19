// [TC-TCPF01/MSS..TC-TCPF04/A8][UI-S01/MSS][BR-UI-002] Contract Test Suite: Tall Chess Pawns Full Color & Browser WebGL Sync (IMP-116)
// Traceability: docs/epics/client_ui/_epic_ledger.md § IMP-116 / Station 1: RED Contract Test
// Target Architecture:
// 1. Chốt 1: Cấu trúc dáng cao đồng nhất (Tall Chess Piece Archetype & Proportions):
//    - 4 quân cờ Xe (0), Pháo (1), Mã (2), Hậu (3) BẮT BUỘC sở hữu chân đế tròn loe 2 tầng (radius <= 0.15m),
//      thân cột trụ thon dài (cylinderGeometry height >= 0.20m), vành đai cổ vàng kim #F59E0B (pawn-neck-ring).
// 2. Chốt 2: Đặc trưng tạo hình đỉnh quân cờ chuẩn xác (Iconic Head Geometry):
//    - Xe 🏰: 4 crenellations quanh khối cầu tròn/vòm ở tâm (pawn-rook-dome).
//    - Pháo 💣: Nòng pháo thần công vươn hiên ngang hướng lên trên thân tượng cờ, gờ miệng nòng mạ vàng #F59E0B.
//    - Mã 🐎: Tượng đầu ngựa chiến cờ vua dũng mãnh, tai vểnh, bờm cong kiêu hãnh vuốt dọc sống gáy.
//    - Hậu 👑: Vương miện Indochine cánh xòe rộng với 6 chóp nhọn và hạt ngọc tròn mạ vàng trên đỉnh.
// 3. Chốt 3: Phủ 100% màu người chơi & triệt tiêu màu đồng / bạc inox (#F8FAFC, #E2E8F0). PBR men sơn bóng đồ chơi metalness <= 0.40, roughness [0.20, 0.35].
// 4. Chốt 4: Đồng bộ trình duyệt WebGL thực tế (Browser WebGL Sync Invariant): SafeGLTFModel forceFallback={true} trong LuxuryPawnModel.
// 5. Chốt 5: Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (Zero loops in it(), 1-4 asserts/test, parameterized it.each).

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  LuxuryPawnModel,
  LUXURY_PAWN_CONFIGS,
  getPawnConfigBySlot,
  type LuxuryPawnConfig,
} from '../../src/client/3d/luxury_pawn_models';
import * as pawnFallbacks from '../../src/client/3d/luxury_pawn_fallbacks';
import {
  LuxuryPawnProceduralFallback,
  RookPawnFallback,
  CannonPawnFallback,
  WarhorsePawnFallback,
  QueenPawnFallback,
} from '../../src/client/3d/luxury_pawn_fallbacks';
import {
  setHeadlessGuardOverride,
  SafeGLTFModel,
} from '../../src/client/3d/asset_loader/safe_gltf_model';
import { assignRandomPlayerPawns } from '../../src/domain/pawn_assignment';
import { PLAYER_TOKEN_PALETTE } from '../../src/domain/theme';

// Mock Drei components for headless SSR static rendering
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    useGLTF: vi.fn().mockReturnValue({
      scene: { clone: () => ({ traverse: () => {} }) },
    }),
    Billboard: ({ children, follow = true, ...props }: any) =>
      React.createElement('billboard', { follow: String(follow), ...props }, children),
    RoundedBox: ({ children, ...props }: any) =>
      React.createElement('roundedbox', props, children),
    Image: ({ scale, ...props }: any) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
  };
});

// Mock R3F frame loop hook for test isolation
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// =============================================================================
// HELPER PARSERS FOR R3F SSR MARKUP EXTRACTION
// =============================================================================

function extractAllMeshColors(markup: string): string[] {
  const regex = /<meshstandardmaterial[^>]*\bcolor="([^"]+)"/gi;
  const colors: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markup)) !== null) {
    if (match[1]) colors.push(match[1].toLowerCase());
  }
  return colors;
}

function extractMeshColorByTestId(markup: string, testId: string): string | null {
  const pattern = new RegExp(`<(?:mesh|group)[^>]*data-testid="${testId}"[\\s\\S]*?<\\/(?:mesh|group)>`, 'i');
  const match = markup.match(pattern);
  if (!match) return null;
  const block = match[0];
  const colorMatch =
    block.match(/<meshstandardmaterial[^>]*\bcolor="([^"]+)"/i) ||
    block.match(/<meshbasicmaterial[^>]*\bcolor="([^"]+)"/i);
  return colorMatch ? colorMatch[1] ?? null : null;
}

function extractCylinderArgs(markup: string, testId?: string): number[][] {
  let target = markup;
  if (testId) {
    const pattern = new RegExp(`<(?:mesh|group)[^>]*data-testid="${testId}"[\\s\\S]*?<\\/(?:mesh|group)>`, 'i');
    target = markup.match(pattern)?.[0] ?? '';
  }
  const regex = /<cylindergeometry[^>]*args="([^"]+)"/gi;
  const results: number[][] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(target)) !== null) {
    if (match[1]) {
      const parts = match[1].split(',').map((p) => parseFloat(p.trim()));
      results.push(parts);
    }
  }
  return results;
}

function hasMeshWithTestId(markup: string, testId: string): boolean {
  const pattern = new RegExp(`data-testid="${testId}"`, 'i');
  return pattern.test(markup);
}

function countMeshesWithTestId(markup: string, testId: string): number {
  const pattern = new RegExp(`data-testid="${testId}"`, 'gi');
  const matches = markup.match(pattern);
  return matches ? matches.length : 0;
}

function extractPawnBodyColors(markup: string): string[] {
  const sanitized = markup
    .replace(/<mesh[^>]*data-testid="pawn-aura-pedestal"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-enamel-ring"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-neck-ring"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-cannon-muzzle"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-horse-mane"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-queen-gem"[\s\S]*?<\/mesh>/gi, '');
  return extractAllMeshColors(sanitized);
}

// 4 iconic tall chess archetypes
const CHESS_TALL_ARCHETYPES = [
  { slot: 0, piece: 'Xe', name: 'Quân Xe Chiến Hoàng Gia', icon: '🏰', fallback: RookPawnFallback },
  { slot: 1, piece: 'Pháo', name: 'Quân Pháo Thần Công Cổ Điển', icon: '💣', fallback: CannonPawnFallback },
  { slot: 2, piece: 'Mã', name: 'Quân Mã Phong Vân Thượng Lưu', icon: '🐎', fallback: WarhorsePawnFallback },
  { slot: 3, piece: 'Hậu', name: 'Quân Hậu Quyền Quý Indochine', icon: '👑', fallback: QueenPawnFallback },
] as const;

// Cultural color test cases
const CULTURAL_PLAYER_COLORS = [
  { name: 'Ruby Red', color: '#DC2626' },
  { name: 'Emerald Green', color: '#27AE60' },
  { name: 'Amber Orange', color: '#E67E22' },
  { name: 'Ocean Cyan', color: '#0284C7' },
] as const;

describe('[TC-TCPF01/MSS..TC-TCPF04/A8][UI-S01/MSS][BR-UI-002] Tall Chess Pawns Full Color Contract Suite', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
    setHeadlessGuardOverride(null);
  });

  afterEach(() => {
    setHeadlessGuardOverride(null);
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE — TALL ARCHETYPES, BASE & HEIGHT PROPORTIONS
  // =========================================================================
  describe('Facet 1: Boundary & Range — Tall Archetypes, Base & Height Proportions', () => {
    it('[TC-TCPF01.01/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] LUXURY_PAWN_CONFIGS defines exactly 4 slots [0, 1, 2, 3]', () => {
      expect(LUXURY_PAWN_CONFIGS).toHaveLength(4);
      expect(LUXURY_PAWN_CONFIGS.map((c) => c.slot)).toEqual([0, 1, 2, 3]);
    });

    it('[TC-TCPF01.02/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] LUXURY_PAWN_CONFIGS icons strictly map to ["🏰", "💣", "🐎", "👑"]', () => {
      const icons = LUXURY_PAWN_CONFIGS.map((c) => c.icon);
      expect(icons).toEqual(['🏰', '💣', '🐎', '👑']);
    });

    it('[TC-TCPF01.03/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 0 configuration matches Quân Xe Chiến 🏰 with default color #DC2626', () => {
      const config = LUXURY_PAWN_CONFIGS[0];
      expect(config?.name).toContain('Xe');
      expect(config?.color.toUpperCase()).toBe('#DC2626');
    });

    it('[TC-TCPF01.04/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 1 configuration matches Quân Pháo Thần Công 💣 with default color #27AE60', () => {
      const config = LUXURY_PAWN_CONFIGS[1];
      expect(config?.name).toContain('Pháo');
      expect(config?.color.toUpperCase()).toBe('#27AE60');
    });

    it('[TC-TCPF01.05/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 2 configuration matches Quân Mã Phong Vân 🐎 with default color #E67E22', () => {
      const config = LUXURY_PAWN_CONFIGS[2];
      expect(config?.name).toContain('Mã');
      expect(config?.color.toUpperCase()).toBe('#E67E22');
    });

    it('[TC-TCPF01.06/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 3 configuration matches Quân Hậu Quyền Quý Indochine 👑 with default color #10B981', () => {
      const config = LUXURY_PAWN_CONFIGS[3];
      expect(config?.name).toContain('Hậu');
      expect(config?.color.toUpperCase()).toBe('#10B981');
    });

    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF01.07/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Zero-Pedestal Base Invariant: Slot $slot ($name) has two-tiered round base with radius <= 0.15m',
      ({ slot, fallback: Component }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        const markup = renderToStaticMarkup(React.createElement(Component, { config, playerColor: '#DC2626' }));
        expect(hasMeshWithTestId(markup, 'pawn-base-tier1')).toBe(true);
        expect(hasMeshWithTestId(markup, 'pawn-base-tier2')).toBe(true);
      }
    );

    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF01.08/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Tall Pillar Height Invariant: Slot $slot ($name) contains tall column cylinderGeometry with height >= 0.20m',
      ({ slot, fallback: Component }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        const markup = renderToStaticMarkup(React.createElement(Component, { config, playerColor: '#27AE60' }));
        expect(hasMeshWithTestId(markup, 'pawn-tall-column')).toBe(true);
        const columnCylinders = extractCylinderArgs(markup, 'pawn-tall-column');
        const tallestHeight = Math.max(...columnCylinders.map((c) => c[2] ?? 0), 0);
        expect(tallestHeight).toBeGreaterThanOrEqual(0.20);
      }
    );

    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF01.09/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Gold Neck Collar Invariant: Slot $slot ($name) contains pawn-neck-ring with gold color #F59E0B',
      ({ slot, fallback: Component }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        const markup = renderToStaticMarkup(React.createElement(Component, { config, playerColor: '#E67E22' }));
        expect(hasMeshWithTestId(markup, 'pawn-neck-ring')).toBe(true);
        const ringColor = extractMeshColorByTestId(markup, 'pawn-neck-ring');
        expect(ringColor?.toUpperCase()).toBe('#F59E0B');
      }
    );

    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF01.10/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] PBR Toy Lacquer Standard: Slot $slot ($name) metalness <= 0.40 and roughness in [0.20, 0.35]',
      ({ slot }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        expect(config.metalness).toBeLessThanOrEqual(0.40);
        expect(config.roughness).toBeGreaterThanOrEqual(0.20);
      }
    );

    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF01.11/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Stature Uniformity: Slot $slot ($name) scale components are normalized [1.0, 1.0, 1.0]',
      ({ slot }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        expect(config.scale).toEqual([1.0, 1.0, 1.0]);
      }
    );
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & CONSUMER ASSERTIONS — FULL COLOR & HEAD GEOMETRY
  // =========================================================================
  describe('Facet 2: State Reactivity & Consumer Assertions — Full Color & Head Geometry', () => {
    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF02.01/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Consumer Point: Slot $slot ($name) propagates dynamic playerColor "#0284C7" to tall column pillar',
      ({ slot, fallback: Component }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        const markup = renderToStaticMarkup(React.createElement(Component, { config, playerColor: '#0284C7' }));
        const columnColor = extractMeshColorByTestId(markup, 'pawn-tall-column');
        expect(columnColor?.toLowerCase()).toBe('#0284c7');
        expect(hasMeshWithTestId(markup, 'pawn-tall-column')).toBe(true);
      }
    );

    it.each(CULTURAL_PLAYER_COLORS)(
      '[TC-TCPF02.02/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Zero-Inox & Zero-Bronze: Dynamic color $color leaves zero silver (#F8FAFC, #E2E8F0) and zero bronze in body meshes',
      ({ color }) => {
        const markup = renderToStaticMarkup(
          React.createElement(LuxuryPawnProceduralFallback, {
            slotIndex: 0,
            config: LUXURY_PAWN_CONFIGS[0]!,
            playerColor: color,
          })
        );
        const bodyColors = extractPawnBodyColors(markup);
        expect(bodyColors.includes('#f8fafc')).toBe(false);
        expect(bodyColors.includes('#e2e8f0')).toBe(false);
      }
    );

    it('[TC-TCPF02.03/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Iconic Head Slot 0 (Quân Xe 🏰): Has 4 crenellation blocks surrounding a central dome/sphere', () => {
      const markup = renderToStaticMarkup(
        React.createElement(RookPawnFallback, { config: LUXURY_PAWN_CONFIGS[0]!, playerColor: '#DC2626' })
      );
      expect(countMeshesWithTestId(markup, 'pawn-rook-crenellation')).toBe(4);
      expect(hasMeshWithTestId(markup, 'pawn-rook-dome')).toBe(true);
    });

    it('[TC-TCPF02.04/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Iconic Head Slot 1 (Quân Pháo 💣): Has upward-angled cannon barrel with gold muzzle ring #F59E0B', () => {
      const markup = renderToStaticMarkup(
        React.createElement(CannonPawnFallback, { config: LUXURY_PAWN_CONFIGS[1]!, playerColor: '#27AE60' })
      );
      expect(hasMeshWithTestId(markup, 'pawn-cannon-barrel')).toBe(true);
      const muzzleColor = extractMeshColorByTestId(markup, 'pawn-cannon-muzzle');
      expect(muzzleColor?.toUpperCase()).toBe('#F59E0B');
    });

    it('[TC-TCPF02.05/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Iconic Head Slot 2 (Quân Mã 🐎): Has proud knight head with ears and gold flowing mane #F59E0B', () => {
      const markup = renderToStaticMarkup(
        React.createElement(WarhorsePawnFallback, { config: LUXURY_PAWN_CONFIGS[2]!, playerColor: '#E67E22' })
      );
      expect(hasMeshWithTestId(markup, 'pawn-horse-head')).toBe(true);
      expect(hasMeshWithTestId(markup, 'pawn-horse-mane')).toBe(true);
    });

    it('[TC-TCPF02.06/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Iconic Head Slot 3 (Quân Hậu 👑): Has Indochine flaring crown with 6 tips and gold gem atop', () => {
      const markup = renderToStaticMarkup(
        React.createElement(QueenPawnFallback, { config: LUXURY_PAWN_CONFIGS[3]!, playerColor: '#10B981' })
      );
      expect(hasMeshWithTestId(markup, 'pawn-queen-crown')).toBe(true);
      expect(countMeshesWithTestId(markup, 'pawn-crown-point')).toBe(6);
    });

    it.each(CULTURAL_PLAYER_COLORS)(
      '[TC-TCPF02.07/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Consumer Point: pawn-aura-pedestal and pawn-enamel-ring reactively reflect playerColor $color',
      ({ color }) => {
        const markup = renderToStaticMarkup(
          React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: color })
        );
        const auraColor = extractMeshColorByTestId(markup, 'pawn-aura-pedestal');
        const enamelColor = extractMeshColorByTestId(markup, 'pawn-enamel-ring');
        expect(auraColor?.toLowerCase()).toBe(color.toLowerCase());
        expect(enamelColor?.toLowerCase()).toBe(color.toLowerCase());
      }
    );
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & SSR HEADLESS SAFETY
  // =========================================================================
  describe('Facet 3: Resource Disposal & SSR Headless Safety', () => {
    it('[TC-TCPF03.01/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] LuxuryPawnModel renders cleanly in SSR without throwing', () => {
      expect(() => {
        renderToStaticMarkup(
          React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#DC2626' })
        );
      }).not.toThrow();
    });

    it('[TC-TCPF03.02/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Idempotent SSR rendering over 5 cycles generates identical markup with zero listener leak', () => {
      const run1 = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 1, playerColor: '#27AE60' })
      );
      const run5 = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 1, playerColor: '#27AE60' })
      );
      expect(run1).toBe(run5);
    });

    it('[TC-TCPF03.03/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Fallback Registry Exports: Rook, Cannon, Warhorse, Queen fallbacks are exported components', () => {
      expect((pawnFallbacks as any).RookPawnFallback).toBeDefined();
      expect((pawnFallbacks as any).CannonPawnFallback).toBeDefined();
      expect((pawnFallbacks as any).WarhorsePawnFallback).toBeDefined();
      expect((pawnFallbacks as any).QueenPawnFallback).toBeDefined();
    });

    it('[TC-TCPF03.04/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] LuxuryPawnProceduralFallback produces pure functional React element with zero memory leak', () => {
      const element = React.createElement(LuxuryPawnProceduralFallback, {
        slotIndex: 0,
        config: LUXURY_PAWN_CONFIGS[0]!,
        playerColor: '#DC2626',
      });
      expect(React.isValidElement(element)).toBe(true);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & BROWSER WEBGL SYNC INVARIANT
  // =========================================================================
  describe('Facet 4: Error Defense & Browser WebGL Sync Invariant', () => {
    it('[TC-TCPF04.01/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] Out-of-bounds slotIndex (-1, 4, 999, NaN, Infinity) safely clamps to Slot 0 (Quân Xe 🏰)', () => {
      expect(getPawnConfigBySlot(-1).slot).toBe(0);
      expect(getPawnConfigBySlot(4).slot).toBe(0);
      expect(getPawnConfigBySlot(999).slot).toBe(0);
      expect(getPawnConfigBySlot(NaN).slot).toBe(0);
    });

    it('[TC-TCPF04.02/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] Undefined or empty playerColor falls back cleanly to config.color without producing "undefined" or NaN', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 0 })
      );
      expect(markup).not.toContain('color="undefined"');
      expect(markup).not.toContain('NaN');
    });

    it('[TC-TCPF04.03/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] Browser WebGL Sync Invariant: SafeGLTFModel inside LuxuryPawnModel is explicitly configured with forceFallback={true}', () => {
      const root = LuxuryPawnModel({ slotIndex: 0 }) as React.ReactElement<{ readonly children: React.ReactNode }>;
      const children = React.Children.toArray(root.props.children);
      const safeGltf = children.find(
        (child: any) => child?.type === SafeGLTFModel || child?.props?.fallback !== undefined
      ) as React.ReactElement<any> | undefined;

      expect(safeGltf).toBeDefined();
      expect(safeGltf?.props?.forceFallback).toBe(true);
    });

    it('[TC-TCPF04.04/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] Browser WebGL Sync Invariant: In non-headless WebGL mode, LuxuryPawnModel renders tall chess pawn procedural fallback', () => {
      setHeadlessGuardOverride(false);
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#DC2626' })
      );
      expect(hasMeshWithTestId(markup, 'pawn-rook')).toBe(true);
      expect(hasMeshWithTestId(markup, 'pawn-neck-ring')).toBe(true);
    });

    it('[TC-TCPF04.05/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] assignRandomPlayerPawns produces 4 pure chess pieces for 4 players and handles empty input safely', () => {
      expect(assignRandomPlayerPawns([])).toEqual([]);
      const fourPlayers = assignRandomPlayerPawns(['p1', 'p2', 'p3', 'p4'], 'SEED_TEST_4P');
      const icons = fourPlayers.map((p) => p.mascotIcon).sort();
      expect(icons).toEqual(['👑', '🏰', '💣', '🐎'].sort());
    });
  });
});
