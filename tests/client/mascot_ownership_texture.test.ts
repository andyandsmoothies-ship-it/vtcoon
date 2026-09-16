// [TC-MOT01/MSS..TC-MOT04/A4][UI-S02/MSS][BR-UI-002] Contract Test Suite: Dynamic Mascot Canvas Textures & Zero-Blank-Material Ownership Markers
// Traceability: docs/domain/gotchas.md #129 / IMP-97 & Monopoly Plus Visual Fidelity Parity
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (getMascotCanvasTexture Định Nghĩa, Format Linh Vật Chibi [🐕,🐈,🐎,🐘], Node/SSR Fallback)
// Facet 2: State Reactivity (Bộ Nhớ Đệm Cache, Khóa Phân Biệt Icon/BgColor, Gán Texture Vào Billboard Pin & Shield)
// Facet 3: Resource Disposal (Cờ needsUpdate = true, Dọn Dẹp Bộ Nhớ Đệm clearMascotTextureCache, Idempotency)
// Facet 4: Error Defense & Preservation Invariants (Zero-Blank-Material Invariant, Bảo Tồn 100% TestIDs, Không NaN)

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CanvasTexture } from 'three';
import {
  OwnershipMarkerInstances,
  SafeBillboard,
  type OwnershipMarkerInstancesProps,
} from '../../src/client/3d/board_tile';
import { LUXURY_PAWN_CONFIGS } from '../../src/client/3d/luxury_pawn_models';

// Mock Drei components for headless SSR static rendering
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, follow = true, ...props }: any) =>
      React.createElement('billboard', { follow: String(follow), ...props }, children),
    RoundedBox: ({ children, ...props }: any) =>
      React.createElement('roundedbox', props, children),
  };
});

// Mock R3F hook for headless unit testing
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// Helper recursive finder in React element tree
function findNode(node: any, predicate: (n: any) => boolean): any {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  const children = React.Children.toArray(node.props?.children);
  for (const child of children) {
    const res = findNode(child, predicate);
    if (res) return res;
  }
  return null;
}

// Container to capture the JSX element tree rendered by OwnershipMarkerInstances
let capturedElementTree: any = null;
function TestMarkerContainer(props: OwnershipMarkerInstancesProps): React.ReactElement {
  capturedElementTree = OwnershipMarkerInstances(props);
  return capturedElementTree;
}

function renderAndCaptureMarker(props: OwnershipMarkerInstancesProps): {
  markup: string;
  tree: any;
} {
  capturedElementTree = null;
  const markup = renderToStaticMarkup(React.createElement(TestMarkerContainer, props));
  return { markup, tree: capturedElementTree };
}

// Mock Canvas setup helper for Node/headless testing
interface MockCanvasHarness {
  mockCanvas: any;
  mockCtx: any;
  fillTextSpy: any;
  fillRectSpy: any;
  arcSpy: any;
  restore: () => void;
}

function setupMockCanvas(): MockCanvasHarness {
  const fillTextSpy = vi.fn();
  const fillRectSpy = vi.fn();
  const arcSpy = vi.fn();
  const fillSpy = vi.fn();
  const clearRectSpy = vi.fn();

  const mockCtx = {
    font: '',
    textAlign: '',
    textBaseline: '',
    fillStyle: '',
    fillText: fillTextSpy,
    fillRect: fillRectSpy,
    arc: arcSpy,
    fill: fillSpy,
    beginPath: vi.fn(),
    clearRect: clearRectSpy,
    measureText: vi.fn().mockReturnValue({ width: 100 }),
  };

  const mockCanvas = {
    width: 256,
    height: 256,
    getContext: vi.fn((type: string) => {
      if (type === '2d') return mockCtx;
      return null;
    }),
  };

  const originalDocument = (globalThis as any).document;
  (globalThis as any).document = {
    createElement: vi.fn((tag: string) => {
      if (tag.toLowerCase() === 'canvas') {
        return mockCanvas;
      }
      return {};
    }),
  };

  return {
    mockCanvas,
    mockCtx,
    fillTextSpy,
    fillRectSpy,
    arcSpy,
    restore: () => {
      if (originalDocument === undefined) {
        delete (globalThis as any).document;
      } else {
        (globalThis as any).document = originalDocument;
      }
    },
  };
}

describe('[TC-MOT01/MSS..TC-MOT04/A4][UI-S02/MSS][BR-UI-002] Dynamic Mascot Canvas Textures Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let getMascotCanvasTexture: ((icon: string, bgColor?: string) => any) | undefined;
  let clearMascotTextureCache: (() => void) | undefined;

  const loadMascotModule = async () => {
    try {
      const modulePath = '../../src/client/3d/mascot_canvas_texture';
      const mod = await import(/* @vite-ignore */ modulePath);
      getMascotCanvasTexture = mod.getMascotCanvasTexture;
      clearMascotTextureCache = mod.clearMascotTextureCache;
    } catch {
      getMascotCanvasTexture = undefined;
      clearMascotTextureCache = undefined;
    }
  };

  beforeAll(async () => {
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

    await loadMascotModule();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(async () => {
    await loadMascotModule();
    if (typeof clearMascotTextureCache === 'function') {
      clearMascotTextureCache();
    }
  });

  afterEach(() => {
    if (typeof clearMascotTextureCache === 'function') {
      clearMascotTextureCache();
    }
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE — MODULE KHỞI TẠO, ĐỊNH DẠNG ICON & FALLBACK SSR
  // =========================================================================
  describe('Facet 1: Boundary & Range — Module Texture & Fallback Node/SSR', () => {
    it('[TC-MOT01.01/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] getMascotCanvasTexture function must be defined and exported from mascot_canvas_texture module', () => {
      expect(getMascotCanvasTexture).toBeDefined();
      expect(typeof getMascotCanvasTexture).toBe('function');
    });

    it('[TC-MOT01.02/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] In Node/SSR environment (typeof document === undefined), getMascotCanvasTexture returns null or safe fallback without throwing', () => {
      const originalDoc = (globalThis as any).document;
      try {
        delete (globalThis as any).document;
        expect(typeof document).toBe('undefined');
        const texture = getMascotCanvasTexture!('🐕');
        expect(texture === null || typeof texture === 'object').toBe(true);
      } finally {
        if (originalDoc !== undefined) {
          (globalThis as any).document = originalDoc;
        }
      }
    });

    it('[TC-MOT01.03/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] When canvas environment is available, getMascotCanvasTexture returns an instance of CanvasTexture', () => {
      const harness = setupMockCanvas();
      try {
        const texture = getMascotCanvasTexture!('🐕');
        expect(texture).toBeDefined();
        expect(texture).not.toBeNull();
        expect(texture instanceof CanvasTexture || texture?.isCanvasTexture === true).toBe(true);
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT01.04/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Supported mascot icons cover all 4 chibi pawns (🐕, 🐈, 🐎, 🐘) yielding non-null textures', () => {
      const harness = setupMockCanvas();
      try {
        const dogTex = getMascotCanvasTexture!('🐕');
        const catTex = getMascotCanvasTexture!('🐈');
        const horseTex = getMascotCanvasTexture!('🐎');
        const elephantTex = getMascotCanvasTexture!('🐘');

        expect(dogTex).not.toBeNull();
        expect(catTex).not.toBeNull();
        expect(horseTex).not.toBeNull();
        expect(elephantTex).not.toBeNull();
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT01.05/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Optional bgColor parameter is accepted and reflected in canvas rendering operations', () => {
      const harness = setupMockCanvas();
      try {
        getMascotCanvasTexture!('🐕', '#DC2626');
        expect(harness.mockCanvas.getContext).toHaveBeenCalledWith('2d');
        expect(harness.fillTextSpy).toHaveBeenCalled();
      } finally {
        harness.restore();
      }
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY — BỘ NHỚ ĐỆM (CACHE) & TÍCH HỢP MATERIAL CONSUMPTION
  // =========================================================================
  describe('Facet 2: State Reactivity — Bộ Nhớ Đệm & Gán Material Tại Điểm Tiêu Thụ', () => {
    it('[TC-MOT02.01/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Cache Hit: Calling getMascotCanvasTexture with same icon and bgColor twice returns the identical cached instance', () => {
      const harness = setupMockCanvas();
      try {
        const first = getMascotCanvasTexture!('🐕', '#DC2626');
        const second = getMascotCanvasTexture!('🐕', '#DC2626');
        expect(first).toBeDefined();
        expect(second).toBe(first);
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT02.02/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Cache Differentiation: Different icons (🐕 vs 🐈) produce distinct texture instances', () => {
      const harness = setupMockCanvas();
      try {
        const dogTex = getMascotCanvasTexture!('🐕');
        const catTex = getMascotCanvasTexture!('🐈');
        expect(dogTex).not.toBe(catTex);
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT02.03/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Cache Differentiation: Same icon with different bgColors (#DC2626 vs #27AE60) produces distinct texture instances', () => {
      const harness = setupMockCanvas();
      try {
        const redTex = getMascotCanvasTexture!('🐎', '#DC2626');
        const greenTex = getMascotCanvasTexture!('🐎', '#27AE60');
        expect(redTex).not.toBe(greenTex);
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT02.04/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] BillboardMascotIcon in OwnershipBillboardPin assigns texture map property from getMascotCanvasTexture', () => {
      const harness = setupMockCanvas();
      try {
        const { tree } = renderAndCaptureMarker({
          ownerColor: '#DC2626',
          ownerSlot: 0,
          mascotIcon: '🐕',
        });

        const billboardMesh = findNode(tree, (n) =>
          typeof n.props?.name === 'string' && n.props.name.startsWith('BillboardMascotIcon_')
        );
        expect(billboardMesh).not.toBeNull();

        const material = findNode(billboardMesh, (n) =>
          typeof n.type === 'string' && n.type.toLowerCase().includes('material')
        );
        expect(material).not.toBeNull();
        expect(material.props.map).toBeDefined();
        expect(material.props.map).not.toBeNull();
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT02.05/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] MascotIcon in MascotCrestShield assigns texture map property from getMascotCanvasTexture', () => {
      const harness = setupMockCanvas();
      try {
        const { tree } = renderAndCaptureMarker({
          ownerColor: '#DC2626',
          ownerSlot: 0,
          mascotIcon: '🐕',
        });

        const shieldGroup = findNode(
          tree,
          (n) => n.props?.name === 'MascotCrestShield' || n.props?.['data-testid'] === 'mascot-crest-shield'
        );

        const mascotMesh = findNode(shieldGroup, (n) =>
          typeof n.props?.name === 'string' && n.props.name.startsWith('MascotIcon_')
        );
        expect(mascotMesh).not.toBeNull();

        const material = findNode(mascotMesh, (n) =>
          typeof n.type === 'string' && n.type.toLowerCase().includes('material')
        );
        expect(material).not.toBeNull();
        expect(material.props.map).toBeDefined();
        expect(material.props.map).not.toBeNull();
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT02.06/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Switching ownerSlot from 1 (Cat 🐈) to 2 (Horse 🐎) reactively rebinds respective mascot textures and identifier names', () => {
      const harness = setupMockCanvas();
      try {
        const { tree: treeCat } = renderAndCaptureMarker({
          ownerColor: '#27AE60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        });
        const { tree: treeHorse } = renderAndCaptureMarker({
          ownerColor: '#E67E22',
          ownerSlot: 2,
          mascotIcon: '🐎',
        });

        const catBillboard = findNode(treeCat, (n) => n.props?.name === 'BillboardMascotIcon_🐈');
        const horseBillboard = findNode(treeHorse, (n) => n.props?.name === 'BillboardMascotIcon_🐎');

        expect(catBillboard).not.toBeNull();
        expect(horseBillboard).not.toBeNull();

        const catMat = findNode(catBillboard, (n) =>
          typeof n.type === 'string' && n.type.toLowerCase().includes('material')
        );
        const horseMat = findNode(horseBillboard, (n) =>
          typeof n.type === 'string' && n.type.toLowerCase().includes('material')
        );

        expect(catMat.props.map).toBeDefined();
        expect(catMat.props.map).not.toBe(horseMat.props.map);
      } finally {
        harness.restore();
      }
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & SSR LIFECYCLE — NEEDSUPDATE, DỌN DẸP CACHE & IDEMPOTENCY
  // =========================================================================
  describe('Facet 3: Resource Disposal & SSR Lifecycle — GPU Upload Flag & Dọn Dẹp Bộ Nhớ', () => {
    it('[TC-MOT03.01/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Created CanvasTexture has needsUpdate = true flagged for WebGL texture upload', () => {
      const harness = setupMockCanvas();
      try {
        const tex = getMascotCanvasTexture!('🐘');
        expect(tex).toBeDefined();
        expect(tex?.needsUpdate).toBe(true);
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT03.02/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] clearMascotTextureCache clears all cached instances; subsequent calls generate fresh instances', () => {
      const harness = setupMockCanvas();
      try {
        expect(clearMascotTextureCache).toBeDefined();
        const tex1 = getMascotCanvasTexture!('🐕');
        clearMascotTextureCache!();
        const tex2 = getMascotCanvasTexture!('🐕');

        expect(tex1).toBeDefined();
        expect(tex2).toBeDefined();
        expect(tex1).not.toBe(tex2);
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT03.03/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Repeated rendering of OwnershipMarkerInstances is idempotent and renders consistent markup', () => {
      const render1 = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#27AE60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        })
      );
      const render2 = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#27AE60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        })
      );
      expect(render1).toBe(render2);
      expect(render1.length).toBeGreaterThan(100);
    });

    it('[TC-MOT03.04/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] SafeBillboard renders without error in headless Node/SSR environment with follow=true', () => {
      const markup = renderToStaticMarkup(
        React.createElement(SafeBillboard, { follow: true }, React.createElement('mesh'))
      );
      expect(markup).toContain('follow="true"');
      expect(markup.length).toBeGreaterThan(10);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & PRESERVATION INVARIANTS — ZERO-BLANK-MATERIAL & BẢO TỒN
  // =========================================================================
  describe('Facet 4: Error Defense & Preservation Invariants — Zero-Blank-Material & Bảo Tồn 100%', () => {
    it('[TC-MOT04.01/MSS][UI-S02/MSS][BR-UI-002][Facet4-ZeroBlankMaterial] Zero-Blank-Material: MeshBasicMaterial on BillboardMascotIcon MUST NOT be blank without map when resolvedMascotIcon is present', () => {
      const harness = setupMockCanvas();
      try {
        const { tree } = renderAndCaptureMarker({
          ownerColor: '#DC2626',
          ownerSlot: 0,
          mascotIcon: '🐕',
        });

        const billboardMesh = findNode(tree, (n) =>
          typeof n.props?.name === 'string' && n.props.name.startsWith('BillboardMascotIcon_')
        );
        expect(billboardMesh).not.toBeNull();

        const mat = findNode(billboardMesh, (n) =>
          typeof n.type === 'string' && n.type.toLowerCase().includes('material')
        );
        expect(mat).not.toBeNull();
        // Invariant: material map must NOT be undefined (no naked blank material)
        expect(mat.props.map).toBeDefined();
        expect(mat.props.map).not.toBeNull();
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT04.02/MSS][UI-S02/MSS][BR-UI-002][Facet4-ZeroBlankMaterial] Zero-Blank-Material: MeshBasicMaterial on MascotIcon in MascotCrestShield MUST NOT be blank without map when resolvedMascotIcon is present', () => {
      const harness = setupMockCanvas();
      try {
        const { tree } = renderAndCaptureMarker({
          ownerColor: '#27AE60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        });

        const shieldGroup = findNode(
          tree,
          (n) => n.props?.name === 'MascotCrestShield' || n.props?.['data-testid'] === 'mascot-crest-shield'
        );
        const mascotMesh = findNode(shieldGroup, (n) =>
          typeof n.props?.name === 'string' && n.props.name.startsWith('MascotIcon_')
        );
        expect(mascotMesh).not.toBeNull();

        const mat = findNode(mascotMesh, (n) =>
          typeof n.type === 'string' && n.type.toLowerCase().includes('material')
        );
        expect(mat).not.toBeNull();
        expect(mat.props.map).toBeDefined();
        expect(mat.props.map).not.toBeNull();
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT04.03/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Preserves testid ownership-billboard-pin and mascot-crest-shield in rendered output', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#27AE60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        })
      );
      expect(markup).toContain('data-testid="ownership-billboard-pin"');
      expect(markup).toContain('data-testid="mascot-crest-shield"');
    });

    it('[TC-MOT04.04/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Preserves FlagPole and FlagCloth instancedMesh elements with brass/cloth standard materials', () => {
      const { tree } = renderAndCaptureMarker({
        ownerColor: '#DC2626',
        ownerSlot: 0,
        mascotIcon: '🐕',
      });

      const flagPole = findNode(tree, (n) => n.props?.name === 'FlagPole');
      const flagCloth = findNode(tree, (n) => n.props?.name === 'FlagCloth');

      expect(flagPole).not.toBeNull();
      expect(flagCloth).not.toBeNull();
      expect(flagPole.type).toBe('instancedMesh');
      expect(flagCloth.type).toBe('instancedMesh');
    });

    it('[TC-MOT04.05/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Preserves TierIndicatorRings and TierRing_1 for property level >= 1', () => {
      const { tree } = renderAndCaptureMarker({
        ownerColor: '#27AE60',
        ownerSlot: 1,
        level: 2,
        mascotIcon: '🐈',
      });

      const ringsGroup = findNode(tree, (n) => n.props?.name === 'TierIndicatorRings');
      const tierRing1 = findNode(tree, (n) => n.props?.name === 'TierRing_1');
      const tierRing2 = findNode(tree, (n) => n.props?.name === 'TierRing_2');

      expect(ringsGroup).not.toBeNull();
      expect(tierRing1).not.toBeNull();
      expect(tierRing2).not.toBeNull();
    });

    it('[TC-MOT04.06/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Preserves data-mascot-icon and name identifiers across pin and shield', () => {
      const { tree } = renderAndCaptureMarker({
        ownerColor: '#8E44AD',
        ownerSlot: 3,
        mascotIcon: '🐘',
      });

      const billboardMesh = findNode(tree, (n) => n.props?.name === 'BillboardMascotIcon_🐘');
      const shieldMesh = findNode(tree, (n) => n.props?.name === 'MascotIcon_🐘');

      expect(billboardMesh?.props['data-mascot-icon']).toBe('🐘');
      expect(shieldMesh?.props['data-mascot-icon']).toBe('🐘');
    });

    it('[TC-MOT04.07/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] All geometric positions and dimensions are finite numbers with zero NaN occurrences', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#DC2626',
          ownerSlot: 0,
          level: 3,
          mascotIcon: '🐕',
        })
      );
      expect(markup).not.toContain('NaN');
      expect(Number.isFinite(LUXURY_PAWN_CONFIGS.length)).toBe(true);
    });

    it('[TC-MOT04.08/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] getMascotCanvasTexture safely handles empty string icon with fallback without throwing', () => {
      const harness = setupMockCanvas();
      try {
        const emptyTex = getMascotCanvasTexture!('');
        expect(emptyTex === null || typeof emptyTex === 'object').toBe(true);
      } finally {
        harness.restore();
      }
    });

    it('[TC-MOT04.09/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Rendered markup contains no ="undefined" or ="null" attributes', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#27AE60',
          ownerSlot: 1,
          level: 1,
          mascotIcon: '🐈',
        })
      );
      expect(markup).not.toContain('="undefined"');
      expect(markup).not.toContain('="null"');
    });
  });
});
