// [TC-453/MSS][IMP-453] Contract Test Suite: Mobile Camera Unified Azimuth, Whiplash Elimination & Co-planar Safety
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import '../helpers/r3f_test_harness';
import {
  captureTree,
  findReactNode,
  type CommonThreeProps,
  type TestReactElement,
} from '../helpers/threejs_test_utils';
import {
  resolveStandardChaseOffset,
  calculateStreetChaseCameraState,
} from '../../src/client/3d/cinematic_chase_camera';
import { calculateTargetCameraState } from '../../src/client/3d/camera_state_machine';
import {
  MiniatureCityDiorama,
  CentralMonumentPlaza,
  type MiniatureCityDioramaProps,
  type CentralMonumentPlazaProps,
} from '../../src/client/3d/miniature_city_diorama';
import {
  DioramaTerrain,
  type DioramaTerrainProps,
} from '../../src/client/3d/diorama/diorama_terrain';

export function extractMaterialProps(
  root: React.ReactNode,
  meshPredicate: (node: TestReactElement) => boolean
): CommonThreeProps | null {
  if (!root || !React.isValidElement(root)) return null;
  const targetMesh = findReactNode(root, meshPredicate);
  if (!targetMesh) return null;
  const materialNode = findReactNode(
    targetMesh,
    (node) => typeof node.type === 'string' && node.type.endsWith('Material')
  );
  return materialNode ? materialNode.props : null;
}

describe('IMP-453: Mobile Camera Unified Azimuth, Whiplash Elimination & Co-planar Safety', () => {
  // =========================================================================
  // HELPER ADVERSARIAL GATE
  // =========================================================================
  it('TC-453.00-GATE [UC-HELPER-ADVERSARIAL-GATE/MSS]: extractMaterialProps validates adversarial inputs returning null on empty, null, or material-less elements', () => {
    expect(extractMaterialProps(null, () => true)).toBeNull();
    expect(extractMaterialProps(React.createElement('div'), () => true)).toBeNull();
    const dummyMeshWithoutMat = React.createElement('mesh', { 'data-testid': 'no-mat' }, React.createElement('boxGeometry'));
    expect(extractMaterialProps(dummyMeshWithoutMat, (n) => n.props['data-testid'] === 'no-mat')).toBeNull();
  });

  // =========================================================================
  // CORE INVARIANT 1: UNIFIED AZIMUTH FOLLOW OFFSET ON MOBILE PORTRAIT
  // =========================================================================
  it('TC-453.01a [UC-CAM-UNIFIED-AZIMUTH-STANDARD/MSS]: Given pawn coords on North and South edges and aspect 0.48, resolveStandardChaseOffset returns identical unified azimuth offsets with zero 180° flips', () => {
    const offsetSouth = resolveStandardChaseOffset([0, 0, 5], 0.48);
    const offsetNorth = resolveStandardChaseOffset([0, 0, -5], 0.48);
    expect(offsetNorth[0]).toBeGreaterThan(0);
    expect(offsetNorth[2]).toBeGreaterThan(0);
    expect(offsetNorth).toEqual(offsetSouth);
  });

  it('TC-453.01b [UC-CAM-UNIFIED-AZIMUTH-STANDARD/A1]: Given pawn coords on West edge [-5, 0, 0] and aspect 0.48, resolveStandardChaseOffset returns strictly positive offsets [+offH, +offY, +offH]', () => {
    const offset = resolveStandardChaseOffset([-5, 0, 0], 0.48);
    expect(offset[0]).toBeGreaterThan(0);
    expect(offset[1]).toBeGreaterThan(0);
    expect(offset[2]).toBeGreaterThan(0);
    expect(offset[0]).toBe(offset[2]);
  });

  it('TC-453.01c [UC-CAM-UNIFIED-AZIMUTH-STANDARD/A2]: Given pawn coords on North edge [0, 0, -5] and aspect 0.48, resolveStandardChaseOffset returns strictly positive offsets [+offH, +offY, +offH]', () => {
    const offset = resolveStandardChaseOffset([0, 0, -5], 0.48);
    expect(offset[0]).toBeGreaterThan(0);
    expect(offset[1]).toBeGreaterThan(0);
    expect(offset[2]).toBeGreaterThan(0);
    expect(offset[0]).toBe(offset[2]);
  });

  it('TC-453.01d [UC-CAM-UNIFIED-AZIMUTH-STANDARD/A3]: Given pawn coords on East edge [5, 0, 0] and aspect 0.48, resolveStandardChaseOffset returns strictly positive offsets [+offH, +offY, +offH]', () => {
    const offset = resolveStandardChaseOffset([5, 0, 0], 0.48);
    expect(offset[0]).toBeGreaterThan(0);
    expect(offset[1]).toBeGreaterThan(0);
    expect(offset[2]).toBeGreaterThan(0);
    expect(offset[0]).toBe(offset[2]);
  });

  // =========================================================================
  // CORE INVARIANT 2: UNIFIED AZIMUTH STREET CHASE ON MOBILE PORTRAIT
  // =========================================================================
  it('TC-453.02 [UC-CAM-UNIFIED-AZIMUTH-STREET-CHASE/MSS]: Given pawn on North edge [0, 0, -5] and aspect 0.48, calculateStreetChaseCameraState positions camera in South-East quadrant (posX > px, posZ > pz) without flipping 180°', () => {
    const state = calculateStreetChaseCameraState({
      pawnPosition: [0, 0, -5],
      aspect: 0.48,
      cellIndex: 20,
    });
    expect(state.position[0]).toBeGreaterThan(0);
    expect(state.position[2]).toBeGreaterThan(-5);
  });

  // =========================================================================
  // CORE INVARIANT 3: DESKTOP LANDSCAPE SIDE-AWARENESS PRESERVATION
  // =========================================================================
  it('TC-453.03 [UC-CAM-DESKTOP-SIDE-AWARENESS/A1]: Given pawn on North edge [0, 0, -5] and landscape aspect 1.77, resolveStandardChaseOffset returns side-aware offset [-offH, +offY, -offH]', () => {
    const offset = resolveStandardChaseOffset([0, 0, -5], 1.77);
    expect(offset[0]).toBeCloseTo(-3.6, 1);
    expect(offset[1]).toBeCloseTo(4.2, 1);
    expect(offset[2]).toBeCloseTo(-3.6, 1);
  });

  // =========================================================================
  // CORE INVARIANT 4: PORTRAIT ELEVATED FOLLOW DISTANCE & ALTITUDE
  // =========================================================================
  it('TC-453.04 [UC-CAM-PORTRAIT-ELEVATED-FOLLOW/MSS]: Given mobile portrait aspect 0.48, resolveStandardChaseOffset returns elevation Y >= 8.5m and horizontal distance H >= 6.5m', () => {
    const offset = resolveStandardChaseOffset([0, 0, 0], 0.48);
    expect(offset[1]).toBeGreaterThanOrEqual(8.5);
    expect(offset[0]).toBeGreaterThanOrEqual(6.5);
  });

  // =========================================================================
  // CORE INVARIANT 5: SCREEN-SPACE TARGET FRAMING FOR HUD CLEARANCE
  // =========================================================================
  it('TC-453.05 [UC-CAM-SCREEN-SPACE-TARGET-FRAMING/MSS]: Given pawn position [5, 0, 5] and aspect 0.48, calculateTargetCameraState in pawn_chase shifts target coordinate X >= 5.5', () => {
    const state = calculateTargetCameraState('pawn_chase', [5, 0, 5], undefined, {
      aspect: 0.48,
    });
    expect(state.target[0]).toBeGreaterThanOrEqual(5.5);
    expect(state.target[1]).toBeCloseTo(0.4, 1);
    expect(state.target[2]).toBeCloseTo(4.4, 1);
  });

  // =========================================================================
  // CORE INVARIANT 6: WHIPLASH TRANSITION PACING (HUMAN VS BOT)
  // =========================================================================
  it('TC-453.06a [UC-CAM-WHIPLASH-TRANSITION-PACING/MSS]: Given aspect 0.48, calculateTargetCameraState in pawn_chase returns speed <= 3.0 for human turns', () => {
    const humanState = calculateTargetCameraState('pawn_chase', [0, 0, 0], undefined, {
      aspect: 0.48,
      isBotTurn: false,
    });
    expect(humanState.speed).toBeLessThanOrEqual(3.0);
    expect(humanState.speed).toBeCloseTo(2.8, 1);
  });

  it('TC-453.06b [UC-CAM-BOT-CHASE-SPEED-PORTRAIT/A1]: Given aspect 0.48, calculateTargetCameraState in pawn_chase returns speed exactly 5.2 for bot turns', () => {
    const botState = calculateTargetCameraState('pawn_chase', [0, 0, 0], undefined, {
      aspect: 0.48,
      isBotTurn: true,
    });
    expect(botState.speed).toBe(5.2);
  });

  // =========================================================================
  // CORE INVARIANT 7: DIORAMA MEDALLION BRASS RING POLYGON OFFSET
  // =========================================================================
  it('TC-453.07a [UC-DIORAMA-MEDALLION-POLYGON-OFFSET/MSS]: CentralMonumentPlaza with isDesktopLean: true declares polygonOffset on the brass ring material', () => {
    const tree = captureTree<CentralMonumentPlazaProps>(CentralMonumentPlaza, { isDesktopLean: true });
    const ringMesh = findReactNode(
      tree,
      (node) => node.type === 'mesh' && findReactNode(node, (c) => c.type === 'ringGeometry') !== null
    );
    const ringMaterial = findReactNode(
      ringMesh,
      (node) => node.type === 'meshStandardMaterial'
    );
    expect(ringMaterial?.props.polygonOffset).toBe(true);
    expect(ringMaterial?.props.polygonOffsetFactor).toBe(-1);
    expect(ringMaterial?.props.polygonOffsetUnits).toBe(-2);
  });

  it('TC-453.07b [UC-DIORAMA-MEDALLION-MARKUP/A1]: MiniatureCityDiorama (isMobile: false, isDesktopLean: true) rendered markup contains polygonoffset', () => {
    const html = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, {
        isMobile: false,
        isDesktopLean: true,
      })
    );
    expect(html.toLowerCase()).toContain('polygonoffset');
  });

  // =========================================================================
  // CORE INVARIANT 8: DIORAMA RIVER WAVES DEPTH WRITE FALSE
  // =========================================================================
  it('TC-453.08a [UC-TERRAIN-RIVER-WAVES-DEPTH-WRITE-OFF/MSS]: DioramaTerrain (isSereneTabletop: false) specifies depthWrite: false on diorama-river-waves mesh material', () => {
    const tree = captureTree<DioramaTerrainProps>(DioramaTerrain, { isSereneTabletop: false });
    const wavesMesh = findReactNode(
      tree,
      (node) => node.type === 'mesh' && node.props['data-testid'] === 'diorama-river-waves'
    );
    const wavesMaterial = findReactNode(
      wavesMesh,
      (node) => node.type === 'meshStandardMaterial'
    );
    expect(wavesMaterial?.props.depthWrite).toBe(false);
  });

  it('TC-453.08b [UC-TERRAIN-RIVER-WAVES-OPACITY-AND-COLOR/A1]: DioramaTerrain (isSereneTabletop: false) preserves opacity 0.35 and color #E0F2FE on diorama-river-waves mesh material', () => {
    const tree = captureTree<DioramaTerrainProps>(DioramaTerrain, { isSereneTabletop: false });
    const wavesMesh = findReactNode(
      tree,
      (node) => node.type === 'mesh' && node.props['data-testid'] === 'diorama-river-waves'
    );
    const wavesMaterial = findReactNode(
      wavesMesh,
      (node) => node.type === 'meshStandardMaterial'
    );
    expect(wavesMaterial?.props.opacity).toBe(0.35);
    expect(wavesMaterial?.props.color).toBe('#E0F2FE');
  });
});
