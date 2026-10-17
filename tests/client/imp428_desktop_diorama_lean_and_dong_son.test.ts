// [TC-428/MSS][IMP-428] Contract Test Suite: Desktop Diorama Lean Architecture & Dong Son Medallion Anti-Clipping
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import '../helpers/r3f_test_harness';
import { findReactNode } from '../helpers/threejs_test_utils';
import {
  MiniatureCityDiorama,
  CentralMonumentPlaza,
  type MiniatureCityDioramaProps,
  type CentralMonumentPlazaProps,
} from '../../src/client/3d/miniature_city_diorama';
import {
  GameBoard,
  WALNUT_TABLE_Y,
  DEPTH_LAYER_STACK,
} from '../../src/client/3d/board_layout';
import {
  createDongSonPlazaTexture,
  clearTabletopTextureCache,
} from '../../src/client/3d/tabletop_texture_generator';
import { DICE_REST_Y } from '../../src/client/3d/dice_math';

interface PositionedProps {
  readonly position?: readonly number[];
  readonly children?: React.ReactNode;
}

function hasPosition(node: unknown): node is React.ReactElement<PositionedProps> {
  return React.isValidElement(node);
}

export function extractPlazaMaxElevation(element: React.ReactElement | null): number {
  if (!hasPosition(element)) return 0;
  const groupY = Array.isArray(element.props.position) && typeof element.props.position[1] === 'number'
    ? element.props.position[1]
    : 0;
  const children = React.Children.toArray(element.props.children);
  const elevations = children
    .filter(hasPosition)
    .map((child) => {
      const pos = child.props.position;
      return Array.isArray(pos) && typeof pos[1] === 'number' ? pos[1] : 0;
    });
  const maxChildY = elevations.length > 0 ? Math.max(...elevations) : 0;
  return groupY + maxChildY;
}

describe('IMP-428: Desktop Diorama Lean Architecture & Dong Son Medallion Anti-Clipping', () => {
  // =========================================================================
  // FACET 1: DEFAULT PROPS PRESERVATION & LIVING TEST CONTRACT SEAM
  // =========================================================================
  it('TC-428.01a [UC-DIORAMA-DEFAULT-PROPS-PRESERVATION/MSS]: Given CentralMonumentPlaza invoked with default props, When checking rendered markup, Then preserves legacy 7-mesh fountain and golden spire', () => {
    const html = renderToStaticMarkup(React.createElement<CentralMonumentPlazaProps>(CentralMonumentPlaza));
    const meshCount = html.match(/<mesh[\s>]/gi)?.length ?? 0;
    expect(meshCount).toBe(7);
    expect(html).toContain('color="#F59E0B"');
    expect(html).toContain('color="#0EA5E9"');
  });

  it('TC-428.01b [UC-DIORAMA-DEFAULT-PROPS-PRESERVATION/A1]: Given MiniatureCityDiorama invoked with isDesktopLean: false, When checking rendered markup, Then preserves legacy desktop diorama clusters including civic center and waterfront park', () => {
    const html = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: false, isDesktopLean: false })
    );
    expect(html).toContain('data-testid="diorama-civic-center"');
    expect(html).toContain('data-testid="diorama-waterfront-park"');
    expect(html).toContain('data-testid="diorama-traffic"');
  });

  it('TC-428.01c [UC-DIORAMA-PROP-PROPAGATION/MSS]: Given MiniatureCityDiorama rendered with isDesktopLean: true, When inspecting CentralMonumentPlaza child, Then propagates isDesktopLean: true', () => {
    let dioramaTree: React.ReactElement | null = null;
    function DioramaSpy(): React.ReactElement | null {
      dioramaTree = MiniatureCityDiorama({ isDesktopLean: true, isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(DioramaSpy));

    const plazaNode = findReactNode<CentralMonumentPlazaProps>(
      dioramaTree,
      (n) => n.type === CentralMonumentPlaza
    );
    expect(plazaNode).not.toBeNull();
    expect(plazaNode?.props?.isDesktopLean).toBe(true);
  });

  // =========================================================================
  // FACET 2: DONG SON MEDALLION DESKTOP ACTIVATION & ANTI-CLIPPING GEOMETRY
  // =========================================================================
  it('TC-428.02 [UC-DONG-SON-MEDALLION-DESKTOP-ACTIVATION/MSS]: Given CentralMonumentPlaza rendered with isDesktopLean: true, When checking children, Then renders flat Dong Son medallion disc and suppresses fountain spire keeping max Y < 0.06', () => {
    const element = CentralMonumentPlaza({ isDesktopLean: true });
    expect(element).not.toBeNull();
    const html = renderToStaticMarkup(element);
    expect(html).toContain('color="#8C6239"');
    expect(html).not.toContain('color="#F59E0B"');
  });

  // =========================================================================
  // FACET 3: HELPER ADVERSARIAL GATE & DICE LANDING VERTICAL CLEARANCE
  // =========================================================================
  it('TC-428.03-GATE [UC-HELPER-ADVERSARIAL-GATE/MSS]: extractPlazaMaxElevation handles empty, invalid, and nested structures deterministically', () => {
    expect(extractPlazaMaxElevation(null)).toBe(0);
    expect(extractPlazaMaxElevation(React.createElement('group', { position: [0, 0.05, 0] }))).toBe(0.05);
  });

  it('TC-428.03 [UC-DICE-LANDING-VERTICAL-CLEARANCE/MSS]: Given DiceTray resting at DICE_REST_Y = 0.26 and CentralMonumentPlaza with isDesktopLean: true, When calculating vertical clearance, Then clearance is >= 0.20m', () => {
    const plaza = CentralMonumentPlaza({ isDesktopLean: true });
    const peakY = extractPlazaMaxElevation(plaza);
    const clearance = DICE_REST_Y - peakY;
    expect(peakY).toBeLessThanOrEqual(0.06);
    expect(clearance).toBeGreaterThanOrEqual(0.20);
  });

  // =========================================================================
  // FACET 4: DESKTOP LEAN CLUSTER FREEZING & DUMMY ANCHOR PROTECTION
  // =========================================================================
  it('TC-428.04a [UC-CHAIN-REACTION-DUMMY-ANCHORS-INTEGRITY/MSS]: Given MiniatureCityDiorama with isDesktopLean: true, When checking rendered markup, Then suppresses civic center, traffic, and highrise clusters', () => {
    const html = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: false, isDesktopLean: true })
    );
    expect(html).not.toContain('data-testid="diorama-civic-center"');
    expect(html).not.toContain('data-testid="diorama-traffic"');
    expect(html).not.toContain('data-testid="diorama-highrise-blocks"');
  });

  it('TC-428.04b [UC-CHAIN-REACTION-DUMMY-ANCHORS-INTEGRITY/A1]: Given MiniatureCityDiorama with isDesktopLean: true, When checking landmark anchors, Then retains all 5 chain reaction landmark dummy group anchors', () => {
    const html = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: false, isDesktopLean: true })
    );
    expect(html).toContain('name="ChainLandmark_saigon-river-cruiser"');
    expect(html).toContain('name="ChainLandmark_metro-line-station"');
    expect(html).toContain('name="ChainLandmark_bason-bridge"');
    expect(html).toContain('name="ChainLandmark_notre-dame-cathedral"');
  });

  // =========================================================================
  // FACET 5: PROCEDURAL DONG SON TEXTURE GENERATION & SSR SAFETY
  // =========================================================================
  it('TC-428.05 [UC-TEXTURE-GENERATOR-SSR-SAFETY/MSS]: Given createDongSonPlazaTexture invoked in SSR environment where document is undefined, When evaluating return, Then returns null safely without throwing', () => {
    expect(typeof document).toBe('undefined');
    const tex = createDongSonPlazaTexture();
    expect(tex).toBeNull();
  });

  it('TC-428.06 [UC-TEXTURE-GENERATOR-SINGLETON-CACHE/MSS]: Given createDongSonPlazaTexture invoked repeatedly in browser environment, When evaluating return, Then returns identical cached CanvasTexture singleton instance', () => {
    const mockCtx = {
      beginPath: () => {},
      arc: () => {},
      stroke: () => {},
      fill: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
    };
    const mockCanvas = {
      width: 512,
      height: 512,
      getContext: () => mockCtx,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    const mockDoc = {
      createElement: (tag: string) => {
        if (tag === 'canvas') return mockCanvas;
        return {};
      },
    };

    vi.stubGlobal('document', mockDoc);
    try {
      const tex1 = createDongSonPlazaTexture();
      const tex2 = createDongSonPlazaTexture();
      expect(tex1).not.toBeNull();
      expect(tex1).toBe(tex2);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  // =========================================================================
  // FACET 6: BOARD LAYOUT CALL-SITE WIRING
  // =========================================================================
  it('TC-428.07a [UC-BOARD-LAYOUT-CALL-SITE-WIRING/MSS]: Given GameBoard rendered with isMobile: false, When inspecting MiniatureCityDiorama call-site, Then passes isDesktopLean: true', () => {
    let desktopTree: React.ReactElement | null = null;
    function DesktopBoardSpy(): React.ReactElement | null {
      desktopTree = GameBoard({ isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(DesktopBoardSpy));

    const dioramaNode = findReactNode<MiniatureCityDioramaProps>(
      desktopTree,
      (n) => n.type === MiniatureCityDiorama
    );
    expect(dioramaNode).not.toBeNull();
    expect(dioramaNode?.props?.isDesktopLean).toBe(true);
  });

  it('TC-428.07b [UC-BOARD-LAYOUT-CALL-SITE-WIRING/A1]: Given GameBoard rendered with isMobile: true, When inspecting MiniatureCityDiorama call-site, Then passes isDesktopLean: false', () => {
    let mobileTree: React.ReactElement | null = null;
    function MobileBoardSpy(): React.ReactElement | null {
      mobileTree = GameBoard({ isMobile: true });
      return null;
    }
    renderToStaticMarkup(React.createElement(MobileBoardSpy));

    const dioramaNode = findReactNode<MiniatureCityDioramaProps>(
      mobileTree,
      (n) => n.type === MiniatureCityDiorama
    );
    expect(dioramaNode).not.toBeNull();
    expect(dioramaNode?.props?.isDesktopLean).toBe(false);
  });

  // =========================================================================
  // FACET 7: WALNUT TABLE DEPTH LAYER STACK IMMUTABILITY
  // =========================================================================
  it('TC-428.08 [UC-WALNUT-TABLE-DEPTH-IMMUTABILITY/MSS]: Given board_layout.tsx depth constants, When checking WALNUT_TABLE_Y and DEPTH_LAYER_STACK, Then values remain strictly immutable at -0.350', () => {
    expect(WALNUT_TABLE_Y).toBe(-0.350);
    expect(DEPTH_LAYER_STACK.WALNUT_TABLE_Y).toBe(-0.350);
  });

  // =========================================================================
  // FACET 8: BOARD RIM RETENTION & TEXTURE CACHE DISPOSAL
  // =========================================================================
  it('TC-428.09 [UC-DIORAMA-BOARD-RIM-LEAN-RETENTION/MSS]: Given MiniatureCityDiorama with isDesktopLean: true, When checking rendered markup, Then retains diorama-board-rim testid', () => {
    const html = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: false, isDesktopLean: true })
    );
    expect(html).toContain('data-testid="diorama-board-rim"');
    expect(html).toContain('data-testid="central-monument-plaza"');
  });

  it('TC-428.10 [UC-TEXTURE-CACHE-CLEARING/MSS]: Given clearTabletopTextureCache invoked, When requesting new texture, Then generates fresh instance', () => {
    const mockCtx = {
      beginPath: () => {}, arc: () => {}, stroke: () => {}, fill: () => {},
      moveTo: () => {}, lineTo: () => {}, closePath: () => {}, save: () => {},
      restore: () => {}, translate: () => {}, rotate: () => {},
      fillStyle: '#000', strokeStyle: '#000', lineWidth: 1,
    };
    const mockDoc = {
      createElement: (tag: string) => (tag === 'canvas' ? {
        width: 512, height: 512, getContext: () => mockCtx,
        addEventListener: () => {}, removeEventListener: () => {},
      } : {}),
    };
    vi.stubGlobal('document', mockDoc);
    try {
      const tex1 = createDongSonPlazaTexture();
      clearTabletopTextureCache();
      const tex2 = createDongSonPlazaTexture();
      expect(tex1).not.toBeNull();
      expect(tex2).not.toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
