// [TC-IMP242.01/MSS..TC-IMP242.17/MSS][UC-IMP242] Contract Test Suite:
// Luxury Pawn Geometry Consolidation by Material Group (IMP-242 Revision 2.3)
// Reference: docs/plans/improvements/IMP-242-luxury-pawn-geometry-consolidation_plan.md
// Invariants: docs/domain/gotchas.md (Pillars I, II, IV, V)

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Domain and Models
import {
  LuxuryPawnModel,
  LUXURY_PAWN_CONFIGS,
} from '../../src/client/3d/luxury_pawn_models';
import {
  TallChessPawnBase,
  LuxuryPawnProceduralFallback,
  RookPawnFallback,
  CannonPawnFallback,
  WarhorsePawnFallback,
  QueenPawnFallback,
} from '../../src/client/3d/luxury_pawn_fallbacks';
import {
  getTallChessBaseBodyGeometry,
  disposeTallChessGeometries,
} from '../../src/client/3d/tall_chess_geometries';

// =============================================================================
// CLEAN R3F TEST HARNESS (Zero Dirty Casts)
// =============================================================================

interface MockComponentProps {
  children?: React.ReactNode;
  follow?: boolean | number;
  scale?: unknown;
  [key: string]: unknown;
}

vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    useGLTF: vi.fn().mockReturnValue({
      scene: { clone: () => ({ traverse: () => {} }) },
    }),
    Billboard: ({ children, follow = true, ...props }: MockComponentProps) =>
      React.createElement('billboard', { follow: String(follow), ...props }, children),
    RoundedBox: ({ children, ...props }: MockComponentProps) =>
      React.createElement('roundedbox', props, children),
    Image: ({ scale, ...props }: MockComponentProps) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
  };
});

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// =============================================================================
// HELPER PARSERS (SSR HEADLESS MARKUP & DRAW CALL STRIPPING)
// =============================================================================

function stripRetentionGroups(markup: string): string {
  let result = markup;
  const startTagRegex = /<group[^>]*data-testid="pawn-retention-group"[^>]*>/i;

  while (true) {
    const match = startTagRegex.exec(result);
    if (!match) break;

    const startIndex = match.index;
    let depth = 1;
    const currentIndex = startIndex + match[0].length;

    const tagRegex = /<\/?group\b[^>]*>/gi;
    tagRegex.lastIndex = currentIndex;

    let tagMatch: RegExpExecArray | null = null;
    let endIndex = -1;

    while ((tagMatch = tagRegex.exec(result)) !== null) {
      const tag = tagMatch[0];
      if (tag.startsWith('</')) {
        depth--;
        if (depth === 0) {
          endIndex = tagMatch.index + tag.length;
          break;
        }
      } else if (!tag.endsWith('/>')) {
        depth++;
      }
    }

    if (endIndex !== -1) {
      result = result.slice(0, startIndex) + result.slice(endIndex);
    } else {
      result = result.slice(0, startIndex) + result.slice(startIndex + match[0].length);
    }
  }

  return result;
}

function countVisibleMeshes(markup: string): number {
  const sanitized = stripRetentionGroups(markup);
  const matches = sanitized.match(/<mesh\b/gi);
  return matches ? matches.length : 0;
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

interface MeshPbr {
  metalness: number | null;
  roughness: number | null;
}

function extractMeshPbr(markup: string, testId: string): MeshPbr {
  const pattern = new RegExp(`<(?:mesh|group)[^>]*data-testid="${testId}"[\\s\\S]*?<\\/(?:mesh|group)>`, 'i');
  const match = markup.match(pattern);
  if (!match) return { metalness: null, roughness: null };
  const block = match[0];
  const metalMatch = block.match(/\bmetalness="([^"]+)"/i);
  const roughMatch = block.match(/\broughness="([^"]+)"/i);
  return {
    metalness: metalMatch && metalMatch[1] ? parseFloat(metalMatch[1]) : null,
    roughness: roughMatch && roughMatch[1] ? parseFloat(roughMatch[1]) : null,
  };
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

interface VNodeProps {
  'data-testid'?: string;
  visible?: boolean;
  children?: React.ReactNode;
  [key: string]: unknown;
}

function isReactElementWithProps(node: unknown): node is React.ReactElement<VNodeProps> {
  return React.isValidElement(node) && typeof node.props === 'object' && node.props !== null;
}

function findVNodeByTestId(node: unknown, testId: string): React.ReactElement<VNodeProps> | null {
  if (!isReactElementWithProps(node)) return null;
  if (node.props['data-testid'] === testId) return node;

  const children = node.props.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findVNodeByTestId(child, testId);
      if (found) return found;
    }
  } else if (children) {
    return findVNodeByTestId(children, testId);
  }
  return null;
}

// =============================================================================
// UNIVERSAL 5-FACET CONTRACT SUITE (EXACTLY 18 ATOMIC TESTS)
// =============================================================================

describe('[TC-IMP242.01/MSS..TC-IMP242.17/MSS][UC-IMP242] Luxury Pawn Geometry Consolidation Contract Suite', () => {
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
  });

  // =========================================================================
  // FACET 1: Core Functionality & Happy Paths (TC-IMP242.01 - 04)
  // =========================================================================
  describe('Facet 1: Core Functionality & Happy Paths (TC-IMP242.01 - 04)', () => {
    it('[TC-IMP242.01/MSS][UC-IMP242] getTallChessBaseBodyGeometry hợp nhất thành công Tier 1, Tier 2 và Tall column thành 1 BufferGeometry có position, normal và bounding volume', () => {
      const geom = getTallChessBaseBodyGeometry();
      expect(geom.attributes.position).toBeDefined();
      expect(geom.attributes.normal).toBeDefined();
      expect(geom.boundingSphere).not.toBeNull();
      expect(geom.boundingBox).not.toBeNull();
    });

    it('[TC-IMP242.02/MSS][UC-IMP242] RookPawnFallback kết xuất mesh hợp nhất pawn-rook-head-merged mang màu activeColor của người chơi', () => {
      const markup = renderToStaticMarkup(
        React.createElement(RookPawnFallback, { config: LUXURY_PAWN_CONFIGS[0]!, playerColor: '#DC2626' })
      );
      expect(hasMeshWithTestId(markup, 'pawn-rook-head-merged')).toBe(true);
      expect(extractMeshColorByTestId(markup, 'pawn-rook-head-merged')?.toUpperCase()).toBe('#DC2626');
    });

    it('[TC-IMP242.03/MSS][UC-IMP242] CannonPawnFallback kết xuất mesh hợp nhất pawn-cannon-head-merged và gờ nòng vàng kim pawn-cannon-muzzle với góc quay nòng pháo hướng lên chuẩn xác', () => {
      const markup = renderToStaticMarkup(
        React.createElement(CannonPawnFallback, { config: LUXURY_PAWN_CONFIGS[1]!, playerColor: '#27AE60' })
      );
      expect(hasMeshWithTestId(markup, 'pawn-cannon-head-merged')).toBe(true);
      expect(hasMeshWithTestId(markup, 'pawn-cannon-muzzle')).toBe(true);
      expect(extractMeshColorByTestId(markup, 'pawn-cannon-muzzle')?.toUpperCase()).toBe('#F59E0B');
    });

    it('[TC-IMP242.04/MSS][UC-IMP242] WarhorsePawnFallback kết xuất mesh hợp nhất đầu ngựa pawn-horse-head-merged, mắt đen pawn-horse-eyes-merged và bờm vàng pawn-horse-mane', () => {
      const markup = renderToStaticMarkup(
        React.createElement(WarhorsePawnFallback, { config: LUXURY_PAWN_CONFIGS[2]!, playerColor: '#E67E22' })
      );
      expect(hasMeshWithTestId(markup, 'pawn-horse-head-merged')).toBe(true);
      expect(hasMeshWithTestId(markup, 'pawn-horse-eyes-merged')).toBe(true);
      expect(extractMeshColorByTestId(markup, 'pawn-horse-eyes-merged')?.toUpperCase()).toBe('#0F172A');
      expect(hasMeshWithTestId(markup, 'pawn-horse-mane')).toBe(true);
    });
  });

  // =========================================================================
  // FACET 2: Edge Cases & Boundaries (TC-IMP242.05 - 08)
  // =========================================================================
  describe('Facet 2: Edge Cases & Boundaries (TC-IMP242.05 - 08)', () => {
    it('[TC-IMP242.05/MSS][UC-IMP242] QueenPawnFallback kết xuất mesh hợp nhất vương miện pawn-queen-crown-merged và 6 chóp vàng pawn-queen-crown-points-merged', () => {
      const markup = renderToStaticMarkup(
        React.createElement(QueenPawnFallback, { config: LUXURY_PAWN_CONFIGS[3]!, playerColor: '#10B981' })
      );
      expect(hasMeshWithTestId(markup, 'pawn-queen-crown-merged')).toBe(true);
      expect(hasMeshWithTestId(markup, 'pawn-queen-crown-points-merged')).toBe(true);
      expect(extractMeshColorByTestId(markup, 'pawn-queen-crown-points-merged')?.toUpperCase()).toBe('#F59E0B');
    });

    it('[TC-IMP242.06/MSS][UC-IMP242] Hạt ngọc vương miện pawn-queen-gem bảo tồn nguyên vẹn vật liệu phát quang emissive="#F59E0B" và emissiveIntensity=0.5', () => {
      const markup = renderToStaticMarkup(
        React.createElement(QueenPawnFallback, { config: LUXURY_PAWN_CONFIGS[3]!, playerColor: '#10B981' })
      );
      expect(hasMeshWithTestId(markup, 'pawn-queen-gem')).toBe(true);
      expect(markup).toContain('emissive="#F59E0B"');
      expect(markup.toLowerCase()).toContain('emissiveintensity="0.5"');
    });

    it('[TC-IMP242.07/MSS][UC-IMP242] Singleton caching hoạt động chính xác: 2 lần gọi liên tiếp cùng một hàm trả về cùng 1 tham chiếu instance BufferGeometry', () => {
      const geomFirst = getTallChessBaseBodyGeometry();
      const geomSecond = getTallChessBaseBodyGeometry();
      expect(geomFirst).toBe(geomSecond);
    });

    it('[TC-IMP242.08/MSS][UC-IMP242] Hàm disposeTallChessGeometries() giải phóng sạch các buffer GPU mà không làm phát sinh exception khi gọi nhiều lần trong Vite HMR / Vitest teardown', () => {
      expect(() => {
        disposeTallChessGeometries();
        disposeTallChessGeometries();
      }).not.toThrow();
      const freshGeom = getTallChessBaseBodyGeometry();
      expect(freshGeom).toBeDefined();
    });
  });

  // =========================================================================
  // FACET 3: Data Sanity & Draw Call Optimization (TC-IMP242.09a - 12)
  // =========================================================================
  describe('Facet 3: Data Sanity & Draw Call Optimization (TC-IMP242.09a - 12)', () => {
    it('[TC-IMP242.09a/MSS][UC-IMP242] Từng quân cờ đơn lẻ đạt đúng số lượng visible meshes theo archetype sau khi loại trừ retention group: Rook=3, Cannon=4, Warhorse=5, Queen=5', () => {
      const rookMarkup = renderToStaticMarkup(
        React.createElement(RookPawnFallback, { config: LUXURY_PAWN_CONFIGS[0]!, playerColor: '#DC2626' })
      );
      const cannonMarkup = renderToStaticMarkup(
        React.createElement(CannonPawnFallback, { config: LUXURY_PAWN_CONFIGS[1]!, playerColor: '#27AE60' })
      );
      const horseMarkup = renderToStaticMarkup(
        React.createElement(WarhorsePawnFallback, { config: LUXURY_PAWN_CONFIGS[2]!, playerColor: '#E67E22' })
      );
      const queenMarkup = renderToStaticMarkup(
        React.createElement(QueenPawnFallback, { config: LUXURY_PAWN_CONFIGS[3]!, playerColor: '#10B981' })
      );

      expect(countVisibleMeshes(rookMarkup)).toBe(3);
      expect(countVisibleMeshes(cannonMarkup)).toBe(4);
      expect(countVisibleMeshes(horseMarkup)).toBe(5);
      expect(countVisibleMeshes(queenMarkup)).toBe(5);
    });

    it('[TC-IMP242.09b/MSS][UC-IMP242] Tầng LuxuryPawnProceduralFallback tổng hợp 4 slots đồng thời trên bàn cờ đạt đúng chính xác 17 visible draw calls (3 + 4 + 5 + 5 = 17)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(LuxuryPawnProceduralFallback, { slotIndex: 0, config: LUXURY_PAWN_CONFIGS[0]!, playerColor: '#DC2626' }),
          React.createElement(LuxuryPawnProceduralFallback, { slotIndex: 1, config: LUXURY_PAWN_CONFIGS[1]!, playerColor: '#27AE60' }),
          React.createElement(LuxuryPawnProceduralFallback, { slotIndex: 2, config: LUXURY_PAWN_CONFIGS[2]!, playerColor: '#E67E22' }),
          React.createElement(LuxuryPawnProceduralFallback, { slotIndex: 3, config: LUXURY_PAWN_CONFIGS[3]!, playerColor: '#10B981' })
        )
      );
      expect(countVisibleMeshes(markup)).toBe(17);
    });

    it('[TC-IMP242.09c/MSS][TC-IMP242.10/MSS][UC-IMP242] Tầng LuxuryPawnModel hoàn chỉnh đạt đúng 25 visible draw calls (Rook: 5, Cannon: 6, Warhorse: 7, Queen: 7) với forceFallback={true} và tiết kiệm >= 50.0% so với baseline 50 draw calls', () => {
      const markup = renderToStaticMarkup(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#DC2626', forceFallback: true }),
          React.createElement(LuxuryPawnModel, { slotIndex: 1, playerColor: '#27AE60', forceFallback: true }),
          React.createElement(LuxuryPawnModel, { slotIndex: 2, playerColor: '#E67E22', forceFallback: true }),
          React.createElement(LuxuryPawnModel, { slotIndex: 3, playerColor: '#10B981', forceFallback: true })
        )
      );
      const totalModelDraws = countVisibleMeshes(markup);
      expect(totalModelDraws).toBe(25);
      const savingsPercent = ((50 - totalModelDraws) / 50) * 100;
      expect(savingsPercent).toBeGreaterThanOrEqual(50.0);
    });

    it('[TC-IMP242.11/MSS][UC-IMP242] TallChessPawnBase chỉ tạo ra đúng 2 visible draw calls (1 merged base body + 1 neck collar) thay vì 4 draw calls', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TallChessPawnBase, { activeColor: '#DC2626', metalness: 0.25, roughness: 0.28 })
      );
      expect(countVisibleMeshes(markup)).toBe(2);
      expect(hasMeshWithTestId(markup, 'pawn-base-body-merged')).toBe(true);
      expect(hasMeshWithTestId(markup, 'pawn-neck-ring')).toBe(true);
    });

    it('[TC-IMP242.12/MSS][UC-IMP242] Độ hoàn thiện PBR: Vành cổ, miệng pháo, bờm ngựa tuân thủ metalness=0.75, roughness=0.2', () => {
      const baseMarkup = renderToStaticMarkup(
        React.createElement(TallChessPawnBase, { activeColor: '#DC2626', metalness: 0.25, roughness: 0.28 })
      );
      const cannonMarkup = renderToStaticMarkup(
        React.createElement(CannonPawnFallback, { config: LUXURY_PAWN_CONFIGS[1]!, playerColor: '#27AE60' })
      );
      const horseMarkup = renderToStaticMarkup(
        React.createElement(WarhorsePawnFallback, { config: LUXURY_PAWN_CONFIGS[2]!, playerColor: '#E67E22' })
      );

      const neckPbr = extractMeshPbr(baseMarkup, 'pawn-neck-ring');
      const muzzlePbr = extractMeshPbr(cannonMarkup, 'pawn-cannon-muzzle');
      const manePbr = extractMeshPbr(horseMarkup, 'pawn-horse-mane');

      expect(neckPbr).toEqual({ metalness: 0.75, roughness: 0.2 });
      expect(muzzlePbr).toEqual({ metalness: 0.75, roughness: 0.2 });
      expect(manePbr).toEqual({ metalness: 0.75, roughness: 0.2 });
    });
  });

  // =========================================================================
  // FACET 4: Regression Prevention & Contract Retention (TC-IMP242.13 - 15)
  // =========================================================================
  describe('Facet 4: Regression Prevention & Contract Retention (TC-IMP242.13 - 15)', () => {
    it('[TC-IMP242.13/MSS][UC-IMP242] Thẻ retention pawn-tall-column chứa cylinderGeometry với height >= 0.20m và phản ánh playerColor cho tall_chess_pawns_full_color.test.ts', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TallChessPawnBase, { activeColor: '#DC2626', metalness: 0.25, roughness: 0.28 })
      );
      const cylinderArgs = extractCylinderArgs(markup, 'pawn-tall-column');
      expect(cylinderArgs.length).toBeGreaterThan(0);
      expect(cylinderArgs[0]?.[2]).toBeGreaterThanOrEqual(0.20);
      expect(extractMeshColorByTestId(markup, 'pawn-tall-column')?.toUpperCase()).toBe('#DC2626');
    });

    it('[TC-IMP242.14/MSS][UC-IMP242] Thẻ retention pawn-crown-point render đúng 6 phần tử qua countMeshesWithTestId === 6', () => {
      const markup = renderToStaticMarkup(
        React.createElement(QueenPawnFallback, { config: LUXURY_PAWN_CONFIGS[3]!, playerColor: '#10B981' })
      );
      expect(countMeshesWithTestId(markup, 'pawn-crown-point')).toBe(6);
    });

    it('[TC-IMP242.15/MSS][UC-IMP242] Toàn bộ các thẻ linh vật Chibi (pawn-corgi-legs, pawn-cat-bib, pawn-warhorse-saddle, pawn-elephant-blanket) tồn tại đầy đủ trong retention group', () => {
      const rookMarkup = renderToStaticMarkup(
        React.createElement(RookPawnFallback, { config: LUXURY_PAWN_CONFIGS[0]!, playerColor: '#DC2626' })
      );
      const cannonMarkup = renderToStaticMarkup(
        React.createElement(CannonPawnFallback, { config: LUXURY_PAWN_CONFIGS[1]!, playerColor: '#27AE60' })
      );
      const horseMarkup = renderToStaticMarkup(
        React.createElement(WarhorsePawnFallback, { config: LUXURY_PAWN_CONFIGS[2]!, playerColor: '#E67E22' })
      );
      const queenMarkup = renderToStaticMarkup(
        React.createElement(QueenPawnFallback, { config: LUXURY_PAWN_CONFIGS[3]!, playerColor: '#10B981' })
      );

      expect(hasMeshWithTestId(rookMarkup, 'pawn-corgi-legs')).toBe(true);
      expect(hasMeshWithTestId(cannonMarkup, 'pawn-cat-bib')).toBe(true);
      expect(hasMeshWithTestId(horseMarkup, 'pawn-warhorse-saddle')).toBe(true);
      expect(hasMeshWithTestId(queenMarkup, 'pawn-elephant-blanket')).toBe(true);
    });
  });

  // =========================================================================
  // FACET 5: Spatial Integrity & VRAM Hygiene (TC-IMP242.16 - 17)
  // =========================================================================
  describe('Facet 5: Spatial Integrity & VRAM Hygiene (TC-IMP242.16 - 17)', () => {
    it('[TC-IMP242.16/MSS][UC-IMP242] Nhóm retention có thuộc tính visible === false trên React Element tree, bảo đảm Three.js WebGL renderer bỏ qua hoàn toàn', () => {
      const baseElement = React.createElement(TallChessPawnBase, { activeColor: '#DC2626', metalness: 0.25, roughness: 0.28 });
      const retentionNode = findVNodeByTestId(baseElement, 'pawn-retention-group');
      expect(retentionNode).not.toBeNull();
      expect(retentionNode?.props.visible).toBe(false);
      expect(retentionNode?.props['data-testid']).toBe('pawn-retention-group');
    });

    it('[TC-IMP242.17/MSS][UC-IMP242] Helper đếm draw calls strip sạch cụm retention group trước khi đếm các thẻ <mesh, ngăn chặn hiện tượng inflate draw call trong headless', () => {
      const dummyMarkup = `
        <group>
          <mesh data-testid="visible-1"></mesh>
          <mesh data-testid="visible-2"></mesh>
          <group visible={false} data-testid="pawn-retention-group">
            <mesh data-testid="pawn-crown-point"></mesh>
            <mesh data-testid="pawn-crown-point"></mesh>
            <mesh data-testid="pawn-crown-point"></mesh>
          </group>
        </group>
      `;
      const visibleCount = countVisibleMeshes(dummyMarkup);
      expect(visibleCount).toBe(2);
    });
  });
});
