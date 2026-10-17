// [TC-429/MSS][IMP-429] Contract Test Suite: Desktop 3D Visual Renaissance — Hero Landmarks & Imperial Emerald Dong Son Plaza
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import '../helpers/r3f_test_harness';
import { findReactNode, type CommonThreeProps } from '../helpers/threejs_test_utils';
import {
  MiniatureCityDiorama,
  CentralMonumentPlaza,
  type MiniatureCityDioramaProps,
  type CentralMonumentPlazaProps,
} from '../../src/client/3d/miniature_city_diorama';
import {
  DioramaHarborCruiser,
  type DioramaHarborCruiserProps,
} from '../../src/client/3d/diorama/diorama_harbor_cruiser';
import {
  GameBoard,
  WALNUT_TABLE_Y,
  DEPTH_LAYER_STACK,
} from '../../src/client/3d/board_layout';
import {
  drawDongSonMedallion,
  type DongSonCanvasRenderingContext,
} from '../../src/client/3d/tabletop_texture_generator';
import { DICE_REST_Y } from '../../src/client/3d/dice_math';
import { extractPlazaMaxElevation } from './imp428_desktop_diorama_lean_and_dong_son.test';

interface CylinderProps extends CommonThreeProps {
  readonly args?: readonly [number, number, number, number];
}

interface MaterialProps extends CommonThreeProps {
  readonly metalness?: number;
  readonly roughness?: number;
  readonly color?: string;
}

describe('IMP-429: Desktop 3D Visual Renaissance — Hero Landmarks & Imperial Emerald Dong Son Plaza', () => {
  // =========================================================================
  // SCENARIO 1: HERO LANDMARKS DESKTOP SELECTIVE RENDERING
  // =========================================================================
  it('TC-429.01 [UC-HERO-LANDMARKS-DESKTOP-RESTORE/MSS]: Given MiniatureCityDiorama with isDesktopLean: true, When checking rendered markup, Then mounts Ba Son bridge, Bitexco tower, Harbor cruiser, and Heritage district while omitting shophouse and highrise blocks', () => {
    const html = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: false, isDesktopLean: true })
    );
    expect(html).toContain('bason-abutment-west');
    expect(html).toContain('data-testid="bitexco-tower"');
    expect(html).toContain('data-testid="diorama-harbor-cruiser"');
    expect(html).toContain('data-testid="diorama-heritage-district"');
  });

  // =========================================================================
  // SCENARIO 2: PROCEDURAL FILLER CULLING & SHOPHOUSE SUPPRESSION
  // =========================================================================
  it('TC-429.02 [UC-PROCEDURAL-FILLER-CULLING/MSS]: Given MiniatureCityDiorama with isDesktopLean: true, When checking rendered markup, Then omits shophouse, highrise, micro-life, and traffic fillers', () => {
    const html = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: false, isDesktopLean: true })
    );
    expect(html).not.toContain('data-testid="diorama-shophouse-blocks"');
    expect(html).not.toContain('data-testid="diorama-highrise-blocks"');
    expect(html).not.toContain('data-testid="diorama-micro-life"');
    expect(html).not.toContain('data-testid="diorama-traffic"');
  });

  // =========================================================================
  // SCENARIO 3: EMERALD MARBLE & GOLD SPECULAR CANVAS PALETTE
  // =========================================================================
  it('TC-429.03 [UC-EMERALD-DONG-SON-CANVAS-PALETTE/MSS]: Given drawDongSonMedallion rendered on 2D canvas, When evaluating color operations, Then applies imperial emerald marble and gold accents', () => {
    const recordedColors: string[] = [];
    const mockCtx: DongSonCanvasRenderingContext = {
      beginPath: () => {},
      arc: () => {},
      stroke: () => {},
      fill: () => {},
      fillRect: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      createRadialGradient: () => ({
        addColorStop: (_offset: number, color: string) => {
          recordedColors.push(color.toUpperCase());
        },
      }),
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
    };

    drawDongSonMedallion(mockCtx, 1024);

    expect(recordedColors).toContain('#064E3B');
    expect(recordedColors).toContain('#022C22');
    expect(recordedColors).toContain('#D4AF37');
  });

  // =========================================================================
  // SCENARIO 4: GOLD SPECULAR PBR MATERIAL TUNING & SSR FALLBACK
  // =========================================================================
  it('TC-429.04a [UC-GOLD-SPECULAR-PBR-SSR-FALLBACK/MSS]: Given CentralMonumentPlaza with isDesktopLean: true, When checking SSR static markup, Then preserves SSR fallback color #8C6239 and omits golden fountain spire', () => {
    const plazaNode = CentralMonumentPlaza({ isDesktopLean: true });
    expect(plazaNode).not.toBeNull();

    const html = renderToStaticMarkup(plazaNode);
    expect(html).toContain('color="#8C6239"');
    expect(html).not.toContain('color="#F59E0B"');
  });

  it('TC-429.04b [UC-GOLD-SPECULAR-PBR-MATERIAL-TUNING/MSS]: Given CentralMonumentPlaza with isDesktopLean: true, When inspecting medallion material tuning, Then tunes metalness to 0.85 and roughness to 0.24', () => {
    const plazaNode = CentralMonumentPlaza({ isDesktopLean: true });
    const materialNode = findReactNode<MaterialProps>(
      plazaNode,
      (n) => n.type === 'meshStandardMaterial' && (n.props.color === '#8C6239' || n.props.color === '#FFFFFF') && typeof n.props.metalness === 'number' && n.props.metalness > 0.2
    );
    expect(materialNode?.props.metalness).toBe(0.85);
    expect(materialNode?.props.roughness).toBe(0.24);
  });

  // =========================================================================
  // SCENARIO 5: PLINTH EXPANSION & ANTI-CLIPPING CLEARANCE
  // =========================================================================
  it('TC-429.05 [UC-PLINTH-EXPANSION-AND-CLEARANCE/MSS]: Given CentralMonumentPlaza with isDesktopLean: true, When inspecting slate plinth geometry and elevation, Then plinth radius is >= 1.50m and vertical clearance to DICE_REST_Y is >= 0.20m', () => {
    const plaza = CentralMonumentPlaza({ isDesktopLean: true });
    const plinthCylinder = findReactNode<CylinderProps>(
      plaza,
      (n) => n.type === 'cylinderGeometry' && Array.isArray(n.props.args) && n.props.args[0] > 1.3
    );

    const baseRadius = plinthCylinder?.props.args?.[0] ?? 0;
    const peakY = extractPlazaMaxElevation(plaza);
    const clearance = DICE_REST_Y - peakY;

    expect(baseRadius).toBeGreaterThanOrEqual(1.50);
    expect(peakY).toBeLessThan(0.06);
    expect(clearance).toBeGreaterThanOrEqual(0.20);
  });

  // =========================================================================
  // SCENARIO 6: MOORED CRUISER ANCHOR AT Z=2.2M & PLINTH NON-OCCLUSION
  // =========================================================================
  it('TC-429.06 [UC-MOORED-CRUISER-AND-CHAIN-REACTION-SYNC/MSS]: Given DioramaHarborCruiser with isMoored: true, When inspecting anchored position, Then docks at Z = 2.2m outside central plinth radius 1.58m', () => {
    let cruiserTree: React.ReactElement | null = null;
    function CruiserSpy(): React.ReactElement | null {
      cruiserTree = DioramaHarborCruiser({ isMoored: true, isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(CruiserSpy));

    const cruiserGroup = findReactNode<CommonThreeProps>(
      cruiserTree,
      (n) => n.type === 'group' && Array.isArray(n.props.position)
    );

    const pos = cruiserGroup?.props.position as [number, number, number] | undefined;
    expect(pos).toBeDefined();
    expect(pos?.[2]).toBe(2.2);
    expect(Math.abs(pos?.[2] ?? 0)).toBeGreaterThan(1.58);
  });

  // =========================================================================
  // SCENARIO 7: DEFAULT PROPS PRESERVATION (24 LIVING TEST CALLERS)
  // =========================================================================
  it('TC-429.07 [UC-DEFAULT-PROPS-PRESERVATION/MSS]: Given MiniatureCityDiorama invoked with default props, When inspecting rendered output, Then preserves legacy clusters and central monument spire', () => {
    const html = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama)
    );
    expect(html).toContain('data-testid="diorama-civic-center"');
    expect(html).toContain('data-testid="diorama-traffic"');
    expect(html).toContain('data-testid="diorama-highrise-blocks"');
    expect(html).toContain('color="#F59E0B"');
  });

  // =========================================================================
  // SCENARIO 8: WALNUT TABLE CONSTANTS & DEPTH STACK IMMUTABILITY
  // =========================================================================
  it('TC-429.08 [UC-WALNUT-TABLE-DEPTH-IMMUTABILITY/MSS]: Given board_layout.tsx depth constants, When inspecting WALNUT_TABLE_Y and DEPTH_LAYER_STACK, Then values remain strictly equal to -0.350', () => {
    expect(WALNUT_TABLE_Y).toBe(-0.350);
    expect(DEPTH_LAYER_STACK.WALNUT_TABLE_Y).toBe(-0.350);
  });
});
