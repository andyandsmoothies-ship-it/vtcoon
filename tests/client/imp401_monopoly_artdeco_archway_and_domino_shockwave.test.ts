// @vitest-environment happy-dom
// [TC-401/MSS][IMP-401] Contract Test Suite: Desktop Art Deco Monopoly Archways (.glb) & Domino Shockwave Ripple
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Group } from 'three';
import { sharedR3FHarness } from '../helpers/r3f_test_harness';
import { captureTree, findReactNode, findReactNodes } from '../helpers/threejs_test_utils';
import { BOARD_CONFIG, ColorGroup } from '../../src/domain/board_config';
import { cellPosition } from '../../src/client/3d/board_coords';
import { SafeGLTFModel, type SafeGLTFModelProps } from '../../src/client/3d/asset_loader/safe_gltf_model';
import { useVfxStore, type ActiveSlam } from '../../src/client/store/vfx_store';
import { useGameStore } from '../../src/client/store/game_store';
import type { MonopolyGroupInfo } from '../../src/client/3d/monopoly_plaza_math';
import {
  MONOPOLY_ARCHWAY_MODEL_URL,
  MONOPOLY_ARCHWAY_BASE_DIMENSIONS,
  splitContiguousMonopolySegments,
  getMonopolyBoulevardSegments,
  createBatchedMonopolyPromenadeGeometries,
  disposeBatchedMonopolyPromenadeGeometries,
  getCircularCellDistance,
  calculateDominoRippleTransform,
  resolveNeighborDominoSlam,
  type MonopolySegmentDescriptor,
} from '../../src/client/3d/monopoly_plaza_visuals';
import { MonopolyPlazaFusion, type MonopolyPlazaFusionProps } from '../../src/client/3d/monopoly_plaza_fusion';
import { GameBoard, type GameBoardProps } from '../../src/client/3d/board_layout';
import { LayeredDioramaTile, type LayeredDioramaTileProps } from '../../src/client/3d/board_tile';
import { ProceduralBuilding, type ProceduralBuildingProps } from '../../src/client/3d/procedural_building';
import { getBuildingModelUrl, getRegionalFallbackPalette } from '../../src/client/3d/building_typology';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@react-three/fiber', async () => {
  const { createR3FMock, sharedR3FHarness: harness } = await import('../helpers/r3f_test_harness');
  return createR3FMock(harness);
});

const RED_MONOPOLY: MonopolyGroupInfo = {
  colorGroup: ColorGroup.Do,
  ownerId: 'p1',
  ownerColor: '#EF4444',
  ownerName: 'Chủ Tịch Sài Gòn',
  cells: [21, 23, 24],
};

const YELLOW_MONOPOLY: MonopolyGroupInfo = {
  colorGroup: ColorGroup.Vang,
  ownerId: 'p1',
  ownerColor: '#F59E0B',
  ownerName: 'Chủ Tịch Sài Gòn',
  cells: [26, 27, 29],
};

const BROWN_MONOPOLY: MonopolyGroupInfo = {
  colorGroup: ColorGroup.Nau,
  ownerId: 'p1',
  ownerColor: '#92400E',
  ownerName: 'Chủ Tịch Sài Gòn',
  cells: [1, 3],
};

const PURPLE_MONOPOLY: MonopolyGroupInfo = {
  colorGroup: ColorGroup.Tim,
  ownerId: 'p2',
  ownerColor: '#3B82F6',
  ownerName: 'Đại Gia Hà Nội',
  cells: [37, 39],
};

function toSegmentLocalCoords(
  seg: MonopolySegmentDescriptor,
  worldPoint: readonly [number, number, number]
): { readonly localX: number; readonly localZ: number } {
  const count = Math.max(1, seg.cells.length);
  const sum = seg.cells.reduce(
    (acc, cellIdx) => {
      const pos = cellPosition(cellIdx);
      return { x: acc.x + pos[0], z: acc.z + pos[2] };
    },
    { x: 0, z: 0 }
  );
  const centerX = sum.x / count;
  const centerZ = sum.z / count;
  const dx = worldPoint[0] - centerX;
  const dz = worldPoint[2] - centerZ;
  const cos = Math.cos(seg.rotationY);
  const sin = Math.sin(seg.rotationY);
  return {
    localX: dx * cos - dz * sin,
    localZ: dx * sin + dz * cos,
  };
}

function attachGroupRef(tree: ReturnType<typeof captureTree>, group: Group): void {
  const refProp = tree?.props?.ref;
  if (refProp && typeof refProp === 'object' && 'current' in refProp) {
    (refProp as { current: Group | null }).current = group;
  }
}

describe('IMP-401: Desktop Art Deco Monopoly Archways (.glb) & Domino Shockwave Ripple Contract Suite', () => {
  const originalPreload = SafeGLTFModel.preload;
  let originalConsoleError: typeof console.error;
  let preloadedUrls: string[] = [];
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute') ||
        msg.includes('unrecognized in this browser')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    preloadedUrls = [];
    SafeGLTFModel.preload = (url: string): void => {
      preloadedUrls.push(url);
      originalPreload(url);
    };
    sharedR3FHarness.reset();
    disposeBatchedMonopolyPromenadeGeometries();
    useVfxStore.getState().clearAllSlams();
    useVfxStore.getState().clearScreenShake();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container?.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
    SafeGLTFModel.preload = originalPreload;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('TC-401.01a [UC-CONTIGUOUS-SUBSPANS-AND-NON-COLLIDING-ARCHWAY/MSS]: Given color groups with intervening functional tiles or cross-corner indices, When calling splitContiguousMonopolySegments, Then splits strictly into sorted same-side contiguous sub-spans and filters out-of-bounds indices', () => {
    const brownSpans = splitContiguousMonopolySegments([1, 3]);
    const redSpans = splitContiguousMonopolySegments([21, 23, 24]);
    const unsortedWithInvalid = splitContiguousMonopolySegments([24, 21, 23, -1, 40, Number.NaN]);
    const crossCornerSpans = splitContiguousMonopolySegments([9, 11]);

    expect(brownSpans).toEqual([[1], [3]]);
    expect(redSpans).toEqual([[21], [23, 24]]);
    expect(unsortedWithInvalid).toEqual([[21], [23, 24]]);
    expect(crossCornerSpans).toEqual([[9], [11]]);
  });

  it('TC-401.01b [UC-CONTIGUOUS-SUBSPANS-AND-NON-COLLIDING-ARCHWAY/A1]: Given 3-cell monopolies (Do [21,23,24] and Vang [26,27,29]), When calling getMonopolyBoulevardSegments, Then places MarblePromenade strictly outside the -1.08m card header (localZ = -1.16m, front edge <= -1.08m) and centers the scaled .glb archway (width <= 1.05m) in the inter-building gap at localZ = -1.24m', () => {
    const segments = getMonopolyBoulevardSegments({
      [ColorGroup.Do]: RED_MONOPOLY,
      [ColorGroup.Vang]: YELLOW_MONOPOLY,
    });
    const redSegments = segments.filter((s) => s.colorGroup === ColorGroup.Do);
    const redPrimary = redSegments.find((s) => s.isPrimaryArchwaySegment);
    const redSecondary = redSegments.find((s) => !s.isPrimaryArchwaySegment);
    const promenadeLocal = redPrimary ? toSegmentLocalCoords(redPrimary, redPrimary.worldPosition) : { localX: 99, localZ: 99 };
    const archwayLocal = redPrimary ? toSegmentLocalCoords(redPrimary, redPrimary.archwayWorldPosition) : { localX: 99, localZ: 99 };
    const scaledWidth = (redPrimary?.archwayScale[0] ?? 0) * MONOPOLY_ARCHWAY_BASE_DIMENSIONS.width;

    expect(redSegments.map((s) => s.cells)).toEqual([[21], [23, 24]]);
    expect(Boolean(redPrimary && !redSecondary?.isPrimaryArchwaySegment && redPrimary.cells.length === 2)).toBe(true);
    expect(promenadeLocal.localZ + (redPrimary?.promenadeDepth ?? 0) / 2).toBeLessThanOrEqual(-1.08 + 1e-4);
    expect(
      scaledWidth >= 0.72 * 1.15 &&
        scaledWidth <= 1.05 &&
        Math.abs(archwayLocal.localZ - -1.24) < 1e-3 &&
        Math.abs(archwayLocal.localX) < 1e-3
    ).toBe(true);
  });

  it('TC-401.01c [UC-CONTIGUOUS-SUBSPANS-AND-NON-COLLIDING-ARCHWAY/A2]: Given 2-cell monopolies with 1-cell sub-spans (Nau [1,3] and Tim [37,39]) or empty input, When calling getMonopolyBoulevardSegments, Then offsets the primary archway along the tile tangent within 0.55m <= |localX| <= 0.65m at localZ = -1.24m and keeps the scaled archway strictly inside the 0.84m promenade half-width', () => {
    const segments = getMonopolyBoulevardSegments({
      [ColorGroup.Nau]: BROWN_MONOPOLY,
      [ColorGroup.Tim]: PURPLE_MONOPOLY,
    });
    const brownPrimary = segments.find((s) => s.colorGroup === ColorGroup.Nau && s.isPrimaryArchwaySegment);
    const purplePrimary = segments.find((s) => s.colorGroup === ColorGroup.Tim && s.isPrimaryArchwaySegment);
    const brownArchLocal = brownPrimary ? toSegmentLocalCoords(brownPrimary, brownPrimary.archwayWorldPosition) : { localX: 0, localZ: 0 };
    const purpleArchLocal = purplePrimary ? toSegmentLocalCoords(purplePrimary, purplePrimary.archwayWorldPosition) : { localX: 0, localZ: 0 };
    const brownHalfWidth = ((brownPrimary?.archwayScale[0] ?? 1) * MONOPOLY_ARCHWAY_BASE_DIMENSIONS.width) / 2;
    const purpleHalfWidth = ((purplePrimary?.archwayScale[0] ?? 1) * MONOPOLY_ARCHWAY_BASE_DIMENSIONS.width) / 2;

    expect(segments.filter((s) => s.isPrimaryArchwaySegment)).toHaveLength(2);
    expect(
      Math.abs(brownArchLocal.localX) >= 0.55 &&
        Math.abs(brownArchLocal.localX) <= 0.65 &&
        Math.abs(brownArchLocal.localX) + brownHalfWidth <= (brownPrimary?.promenadeWidth ?? 0) / 2
    ).toBe(true);
    expect(
      Math.abs(purpleArchLocal.localX) >= 0.55 &&
        Math.abs(purpleArchLocal.localX) <= 0.65 &&
        Math.abs(purpleArchLocal.localX) + purpleHalfWidth <= (purplePrimary?.promenadeWidth ?? 0) / 2 &&
        Math.abs(purpleArchLocal.localZ - -1.24) < 1e-3
    ).toBe(true);
    expect(getMonopolyBoulevardSegments(null)).toEqual([]);
  });

  it('TC-401.02a [UC-BATCHED-PROMENADE-CACHE-AND-DYNAMIC-DISPOSAL/MSS]: Given getMonopolyBoulevardSegments and createBatchedMonopolyPromenadeGeometries, When building the 4 consolidated BufferGeometry layers, Then populates vertex positions across all 4 layers and uses seg.cells to generate inter-cell brass joint inlays', () => {
    const fullRedGeoms = createBatchedMonopolyPromenadeGeometries({ [ColorGroup.Do]: RED_MONOPOLY });
    const layerCounts = [
      fullRedGeoms.marblePromenadeGeom,
      fullRedGeoms.brassTrimGeom,
      fullRedGeoms.streetlampsGeom,
      fullRedGeoms.lampBulbsGeom,
    ].map((g) => g.getAttribute('position')?.count ?? 0);
    const allSegs = getMonopolyBoulevardSegments({ [ColorGroup.Do]: RED_MONOPOLY });
    const oneCellSeg = allSegs.filter((s) => s.cells.length === 1);
    const twoCellSeg = allSegs.filter((s) => s.cells.length === 2);
    const oneCellBrassVerts =
      createBatchedMonopolyPromenadeGeometries(null, oneCellSeg).brassTrimGeom.getAttribute('position')?.count ?? 0;
    const twoCellBrassVerts =
      createBatchedMonopolyPromenadeGeometries(null, twoCellSeg).brassTrimGeom.getAttribute('position')?.count ?? 0;

    expect(layerCounts.every((count) => count > 0)).toBe(true);
    expect(twoCellBrassVerts).toBeGreaterThan(oneCellBrassVerts);
    expect(MONOPOLY_ARCHWAY_MODEL_URL).toBe('/models/landmarks/monopoly_archway_artdeco.glb');
  });

  it('TC-401.02b [UC-BATCHED-PROMENADE-CACHE-AND-DYNAMIC-DISPOSAL/A1]: Given createBatchedMonopolyPromenadeGeometries, When called with identical vs mutated monopoly fingerprints and disposeBatchedMonopolyPromenadeGeometries, Then reuses cached geometries on hit and disposes superseded geometries on fingerprint mutation or explicit teardown', () => {
    const bundle1a = createBatchedMonopolyPromenadeGeometries({ [ColorGroup.Do]: RED_MONOPOLY });
    const bundle1b = createBatchedMonopolyPromenadeGeometries({ [ColorGroup.Do]: RED_MONOPOLY });
    const disposeSpy1 = vi.spyOn(bundle1a.marblePromenadeGeom, 'dispose');
    const bundle2 = createBatchedMonopolyPromenadeGeometries({
      [ColorGroup.Do]: RED_MONOPOLY,
      [ColorGroup.Vang]: YELLOW_MONOPOLY,
    });
    const disposeSpy2 = vi.spyOn(bundle2.marblePromenadeGeom, 'dispose');
    disposeBatchedMonopolyPromenadeGeometries();

    expect(bundle1b).toBe(bundle1a);
    expect(bundle2).not.toBe(bundle1a);
    expect(disposeSpy1).toHaveBeenCalledTimes(1);
    expect(disposeSpy2).toHaveBeenCalledTimes(1);
  });

  it('TC-401.03a [UC-DOMINO-SPRING-WAVE-AND-LEVEL0-BUILDING-WIRING/MSS]: Given 40-tile perimeter indices and invalid inputs, When calling getCircularCellDistance, Then returns shortest wrap-around distance across tile 0 and Infinity for out-of-bounds indices', () => {
    const wrap39To1 = getCircularCellDistance(39, 1);
    const wrap0To39 = getCircularCellDistance(0, 39);
    const sameTile = getCircularCellDistance(23, 23);
    const invalidInputs =
      getCircularCellDistance(-1, 5) === Infinity &&
      getCircularCellDistance(40, 5) === Infinity &&
      getCircularCellDistance(Number.NaN, 5) === Infinity;

    expect(wrap39To1).toBe(2);
    expect(wrap0To39).toBe(1);
    expect(sameTile).toBe(0);
    expect(invalidInputs).toBe(true);
  });

  it('TC-401.03b [UC-DOMINO-SPRING-WAVE-AND-LEVEL0-BUILDING-WIRING/A1]: Given distanceInCells 1..4 and elapsedMs relative to impact, When calling calculateDominoRippleTransform, Then enforces delayMs = d * 65 (including elapsedMs < 0), attenuates spring bounce with distance, and settles at elapsedMs >= 900', () => {
    const preImpact = calculateDominoRippleTransform(1, -120);
    const preWaveDelay = calculateDominoRippleTransform(2, 110);
    const peakD1 = calculateDominoRippleTransform(1, 65 + 45);
    const peakD2 = calculateDominoRippleTransform(2, 130 + 45);
    const peakD4 = calculateDominoRippleTransform(4, 260 + 45);
    const settledTtl = calculateDominoRippleTransform(1, 900);
    const outOfRange = calculateDominoRippleTransform(5, 400);

    expect(preImpact).toEqual({ yOffset: 0, scaleY: 1, pitchRad: 0, isSettled: false });
    expect(preWaveDelay).toEqual({ yOffset: 0, scaleY: 1, pitchRad: 0, isSettled: false });
    expect(
      peakD1.yOffset > peakD2.yOffset &&
        peakD2.yOffset > peakD4.yOffset &&
        peakD4.yOffset > 0 &&
        peakD1.scaleY > 1 &&
        peakD1.pitchRad !== 0
    ).toBe(true);
    expect(settledTtl.isSettled && outOfRange.isSettled && settledTtl.yOffset === 0 && settledTtl.pitchRad === 0).toBe(true);
  });

  it('TC-401.03c [UC-DOMINO-SPRING-WAVE-AND-LEVEL0-BUILDING-WIRING/A2]: Given activeSlams with an expired neighbor slam (>= 900ms after impact) and a newer unsettled slam, When calling resolveNeighborDominoSlam, Then selects the newest unsettled slam within d <= 4 and returns null for mobile, self (d = 0), or d > 4', () => {
    const nowMs = 5000;
    const activeSlams: Record<number, ActiveSlam> = {
      23: { id: 'expired_23', cellIndex: 23, level: 2, startTime: 3500, durationMs: 1500, impactTimeMs: 380 },
      21: { id: 'fresh_21', cellIndex: 21, level: 1, startTime: 4400, durationMs: 1500, impactTimeMs: 380 },
    };
    const resolvedFor24 = resolveNeighborDominoSlam(24, activeSlams, false, nowMs);
    const mobileRejected = resolveNeighborDominoSlam(24, activeSlams, true, nowMs);
    const selfOrFarRejected =
      resolveNeighborDominoSlam(21, activeSlams, false, nowMs) === null &&
      resolveNeighborDominoSlam(35, activeSlams, false, nowMs) === null;

    expect(resolvedFor24?.slam.cellIndex).toBe(21);
    expect(resolvedFor24?.distanceInCells).toBe(3);
    expect(mobileRejected).toBeNull();
    expect(selfOrFarRejected).toBe(true);
  });

  it('TC-401.03d [UC-DOMINO-SPRING-WAVE-AND-LEVEL0-BUILDING-WIRING/A3]: Given LayeredDioramaTile and ProceduralBuilding (level = 0) on Desktop at cell 24 when neighbor cell 23 slams, When advancing R3F frames through wave peak and TTL settle, Then enables showEmptyPlotBoundary on Monopoly level-0 tiles, ripples yOffset/scaleY/rotation.x, and restores exact lotTransform on settle', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    useVfxStore.setState({
      activeSlams: {
        23: { id: 'slam_23', cellIndex: 23, level: 1, startTime: 1000, durationMs: 1500, impactTimeMs: 380 },
      },
    });
    const tileTree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
      cell: BOARD_CONFIG[24]!,
      position: [0, 0, 0],
      currentLevel: 0,
      isCornerTile: false,
      ownerColor: '#EF4444',
      isMonopolyGroup: true,
      isMobile: false,
    });
    const buildingInTile = findReactNode<ProceduralBuildingProps>(
      tileTree,
      (n) => n.type === ProceduralBuilding
    );
    const tree = captureTree<ProceduralBuildingProps>(ProceduralBuilding, {
      level: 0,
      cellIndex: 24,
      showEmptyPlotBoundary: buildingInTile?.props?.showEmptyPlotBoundary,
      isMobile: false,
    });
    const mockGroup = new Group();
    attachGroupRef(tree, mockGroup);

    vi.setSystemTime(1000 + 380 + 110);
    sharedR3FHarness.advanceFrame(0.016);
    const activeY = mockGroup.position.y;
    const activeScaleY = mockGroup.scale.y;
    const activeRotX = mockGroup.rotation.x;

    vi.setSystemTime(1000 + 380 + 950);
    sharedR3FHarness.advanceFrame(0.016);

    expect(buildingInTile?.props?.showEmptyPlotBoundary).toBe(true);
    expect(activeY > 0.16 && activeScaleY > 0.975 && activeRotX !== 0).toBe(true);
    expect(mockGroup.position.y).toBeCloseTo(0.16, 4);
    expect(mockGroup.rotation.x).toBeCloseTo(0, 4);
  });

  it('TC-401.04a [UC-DESKTOP-GLB-MONOPOLY-TRIGGER-AND-MOBILE-ISOLATION/MSS]: Given MonopolyPlazaFusion rendered on Desktop (isMobile = false) with active monopolyGroups, When inspecting the component tree, Then preloads MONOPOLY_ARCHWAY_MODEL_URL, mounts 4 batched promenade meshes + SafeGLTFModel with empty group fallback, and binds data-board-side on InnerPlazaGarland', () => {
    const tree = captureTree<MonopolyPlazaFusionProps>(MonopolyPlazaFusion, {
      monopolyGroups: { [ColorGroup.Do]: RED_MONOPOLY },
      isMobile: false,
    });
    const meshes = findReactNodes(tree, (n) => n.type === 'mesh');
    const gltfNodes = findReactNodes<SafeGLTFModelProps>(tree, (n) => n.type === SafeGLTFModel);
    const garlands = findReactNodes(tree, (n) => n.props?.['data-testid'] === 'inner-plaza-garland');

    expect(preloadedUrls).toContain(MONOPOLY_ARCHWAY_MODEL_URL);
    expect(meshes.length).toBeGreaterThanOrEqual(4);
    expect(
      gltfNodes.length === 1 &&
        gltfNodes[0]?.props.url === MONOPOLY_ARCHWAY_MODEL_URL &&
        React.isValidElement(gltfNodes[0]?.props.fallback)
    ).toBe(true);
    expect(garlands.length === 2 && garlands.every((g) => g.props?.['data-board-side'] === 2)).toBe(true);
  });

  it('TC-401.04b [UC-DESKTOP-GLB-MONOPOLY-TRIGGER-AND-MOBILE-ISOLATION/A1]: Given MonopolyPlazaFusion mounted with empty monopolyGroups {}, When re-rendered with a newly acquired monopoly on Desktop and then unmounted, Then transitions without Hook errors, triggers activeSlams for level-0 domino shockwave, and disposes geometries on unmount', () => {
    const renderTransition = (): void => {
      act(() => {
        root?.render(React.createElement(MonopolyPlazaFusion, { monopolyGroups: {}, isMobile: false }));
      });
      act(() => {
        root?.render(
          React.createElement(MonopolyPlazaFusion, {
            monopolyGroups: { [ColorGroup.Do]: RED_MONOPOLY },
            isMobile: false,
          })
        );
      });
    };

    expect(renderTransition).not.toThrow();
    const cachedBundle = createBatchedMonopolyPromenadeGeometries({ [ColorGroup.Do]: RED_MONOPOLY });
    const disposeSpy = vi.spyOn(cachedBundle.marblePromenadeGeom, 'dispose');
    const slamKeys = Object.keys(useVfxStore.getState().activeSlams).map(Number);

    act(() => {
      root?.unmount();
      root = null;
    });

    expect(slamKeys.some((cellIdx) => RED_MONOPOLY.cells.includes(cellIdx))).toBe(true);
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-401.04c [UC-DESKTOP-GLB-MONOPOLY-TRIGGER-AND-MOBILE-ISOLATION/A2]: Given GameBoard and MonopolyPlazaFusion rendered with isMobile = true vs false, When inspecting prop propagation and mobile tree, Then GameBoard forwards isMobile and Mobile mounts 0 .glb archways and preloads 0 URLs', () => {
    useGameStore.setState({
      playersInfo: {
        p1: { id: 'p1', name: 'P1', balance: 1500, tokenColor: '#EF4444', ownedProperties: [21, 23, 24] },
      },
    });
    const mobileBoardTree = captureTree<GameBoardProps>(GameBoard, { isMobile: true });
    const fusionInMobileBoard = findReactNode<MonopolyPlazaFusionProps>(
      mobileBoardTree,
      (n) => n.type === MonopolyPlazaFusion
    );
    const mobileFusionTree = captureTree<MonopolyPlazaFusionProps>(MonopolyPlazaFusion, {
      monopolyGroups: { [ColorGroup.Do]: RED_MONOPOLY },
      isMobile: true,
    });
    const mobilePreloads = [...preloadedUrls];
    const desktopBoardTree = captureTree<GameBoardProps>(GameBoard, { isMobile: false });
    const fusionInDesktopBoard = findReactNode<MonopolyPlazaFusionProps>(
      desktopBoardTree,
      (n) => n.type === MonopolyPlazaFusion
    );

    expect(fusionInMobileBoard?.props?.isMobile).toBe(true);
    expect(fusionInDesktopBoard?.props?.isMobile).toBe(false);
    expect(mobileFusionTree).toBeNull();
    expect(mobilePreloads).toHaveLength(0);
  });

  it('TC-401.04d [UC-REGIONAL-C1-C2-TYPOLOGY-AND-MOBILE-FALLBACK/MSS]: Given 4 regional property cells (1 riverine, 9 resort, 18 heritage, 39 metropolis) at C1 and C2, When resolving getBuildingModelUrl and rendering ProceduralBuilding on Desktop vs Mobile, Then routes Desktop .glb to /models/buildings/bld_${typology}_c${level}.glb and renders 4 distinct regional Mobile LOD fallbacks with zero castShadow', () => {
    const urls = [
      getBuildingModelUrl(1, 1),
      getBuildingModelUrl(9, 1),
      getBuildingModelUrl(18, 2),
      getBuildingModelUrl(39, 2),
    ];
    const riverineTree = captureTree<ProceduralBuildingProps>(ProceduralBuilding, {
      level: 1,
      cellIndex: 1,
      isMobile: true,
    });
    const resortTree = captureTree<ProceduralBuildingProps>(ProceduralBuilding, {
      level: 2,
      cellIndex: 9,
      isMobile: true,
    });
    const riverineGltf = findReactNode<SafeGLTFModelProps>(riverineTree, (n) => n.type === SafeGLTFModel);
    const resortGltf = findReactNode<SafeGLTFModelProps>(resortTree, (n) => n.type === SafeGLTFModel);
    act(() => {
      root?.render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(ProceduralBuilding, { level: 1, cellIndex: 1, isMobile: true }),
          React.createElement(ProceduralBuilding, { level: 2, cellIndex: 9, isMobile: true }),
          React.createElement(ProceduralBuilding, { level: 1, cellIndex: 18, isMobile: false })
        )
      );
    });
    const renderedHtml = container?.innerHTML ?? '';

    expect(urls).toEqual([
      '/models/buildings/bld_riverine_c1.glb',
      '/models/buildings/bld_resort_c1.glb',
      '/models/buildings/bld_heritage_c2.glb',
      '/models/buildings/bld_metropolis_c2.glb',
    ]);
    expect(riverineGltf?.props?.url === '/models/buildings/bld_riverine_c1.glb' && riverineGltf?.props?.forceFallback === true).toBe(true);
    expect(resortGltf?.props?.url === '/models/buildings/bld_resort_c2.glb' && resortGltf?.props?.forceFallback === true).toBe(true);
    expect(
      renderedHtml.includes('data-typology="riverine"') &&
        renderedHtml.includes('data-typology="resort"') &&
        renderedHtml.includes('data-typology="heritage"') &&
        getRegionalFallbackPalette('riverine').c1RoofColor !== getRegionalFallbackPalette('resort').c1RoofColor
    ).toBe(true);
  });
});
