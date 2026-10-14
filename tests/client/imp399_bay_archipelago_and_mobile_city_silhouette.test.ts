// [TC-399/MSS][IMP-399] Contract Test Suite: Bay Archipelago, 4 Corner Tycoon Sanctuaries & Mobile City Silhouette
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BoxGeometry, InstancedMesh, MeshStandardMaterial } from 'three';
import { sharedR3FHarness } from '../helpers/r3f_test_harness';
import { captureTree, findReactNode, findReactNodes } from '../helpers/threejs_test_utils';
import { LODLevel } from '../../src/client/3d/perf_budget';
import {
  resolveDesktopQualityTier,
  getCornerSanctuaryDescriptors,
  getBayArchipelagoDescriptors,
  createBatchedSanctuaryGeometries,
} from '../../src/client/3d/coastal_sanctuary_visuals';
import {
  CoastalIslandEnvironment,
  CornerTycoonSanctuaries,
  type CoastalIslandEnvironmentProps,
} from '../../src/client/3d/coastal_island_environment';
import {
  getMobileCitySilhouetteDescriptors,
  populateMobileCitySilhouetteInstancedMesh,
} from '../../src/client/3d/diorama/diorama_lod_helpers';
import {
  MiniatureCityDiorama,
  BatchedMobileCitySilhouette,
  type MiniatureCityDioramaProps,
} from '../../src/client/3d/miniature_city_diorama';
import { DioramaShophouseBlocks } from '../../src/client/3d/diorama/diorama_shophouse_blocks';
import { DioramaHighriseBlocks } from '../../src/client/3d/diorama/diorama_highrise_blocks';

describe('IMP-399: Bay Archipelago, 4 Corner Tycoon Sanctuaries & Mobile City Silhouette', () => {
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

  beforeEach(() => {
    sharedR3FHarness.reset();
  });

  it('TC-399.01 [UC-ADAPTIVE-TIER-LOWRAM/MSS]: Given LODLevel.HIGH and deviceMemoryGb = 4 (or NaN / 0 / LODLevel.MEDIUM), When calling resolveDesktopQualityTier, Then returns tier DESKTOP_BALANCED with usePhysicalClearcoat: false, castSanctuaryShadows: false, and palmInstanceCount: 16', () => {
    const lowRam = resolveDesktopQualityTier(LODLevel.HIGH, 4, false);
    const nanRam = resolveDesktopQualityTier(LODLevel.HIGH, Number.NaN, false);
    const zeroRam = resolveDesktopQualityTier(LODLevel.HIGH, 0, false);
    const medLod = resolveDesktopQualityTier(LODLevel.MEDIUM, 16, false);
    const mobileTier = resolveDesktopQualityTier(LODLevel.HIGH, 8, true);

    expect([lowRam.tier, nanRam.tier, zeroRam.tier, medLod.tier]).toEqual([
      'DESKTOP_BALANCED',
      'DESKTOP_BALANCED',
      'DESKTOP_BALANCED',
      'DESKTOP_BALANCED',
    ]);
    expect(lowRam.usePhysicalClearcoat).toBe(false);
    expect(lowRam.castSanctuaryShadows).toBe(false);
    expect([lowRam.palmInstanceCount, mobileTier.tier]).toEqual([16, 'MOBILE_TBDR']);
  });

  it('TC-399.02 [UC-ADAPTIVE-TIER-ULTRA/A1]: Given LODLevel.HIGH, deviceMemoryGb = 16 (or undefined defaulting to 8), and isMobile = false, When calling resolveDesktopQualityTier, Then returns tier DESKTOP_ULTRA with usePhysicalClearcoat: true, castSanctuaryShadows: true, and palmInstanceCount: 20', () => {
    const ultra16 = resolveDesktopQualityTier(LODLevel.HIGH, 16, false);
    const ultraDefault = resolveDesktopQualityTier(LODLevel.HIGH, undefined, false);

    expect([ultra16.tier, ultraDefault.tier]).toEqual(['DESKTOP_ULTRA', 'DESKTOP_ULTRA']);
    expect([ultra16.usePhysicalClearcoat, ultraDefault.usePhysicalClearcoat]).toEqual([true, true]);
    expect([ultra16.castSanctuaryShadows, ultraDefault.castSanctuaryShadows]).toEqual([true, true]);
    expect([ultra16.palmInstanceCount, ultraDefault.palmInstanceCount]).toEqual([20, 20]);
  });

  it('TC-399.03 [UC-CORNER-SANCTUARY-EMBEDDING/MSS]: Given board perimeter bounds [-9.9, +9.9], When calling getCornerSanctuaryDescriptors, Then returns 4 corner peninsulas at (\\pm 12.2, -0.28, \\pm 12.2) with inter-volume embedding >= 0.02m and non-coplanar top steps >= 0.02m', () => {
    const corners = getCornerSanctuaryDescriptors();
    const validPositions = corners.every(
      (c) => Math.abs(c.position[0]) === 12.2 && c.position[1] === -0.28 && Math.abs(c.position[2]) === 12.2
    );
    const validElevations = corners.every(
      (c) =>
        c.baseBottomY === -0.38 &&
        c.baseTopY === -0.22 &&
        c.deckBottomY === -0.24 &&
        c.deckTopY === -0.14 &&
        c.rimBottomY === -0.16 &&
        c.rimTopY === -0.12
    );
    const validEmbeddingAndSteps = corners.every(
      (c) =>
        c.baseTopY - c.deckBottomY >= 0.02 - 1e-6 &&
        c.deckTopY - c.rimBottomY >= 0.02 - 1e-6 &&
        c.deckTopY - c.baseTopY >= 0.02 - 1e-6 &&
        c.rimTopY - c.deckTopY >= 0.02 - 1e-6
    );

    expect(corners.length).toBe(4);
    expect(validPositions).toBe(true);
    expect(validElevations).toBe(true);
    expect(validEmbeddingAndSteps).toBe(true);
  });

  it('TC-399.04 [UC-BAY-ARCHIPELAGO-BATCH-GEOM/MSS]: Given quality tier palm count, When calling getBayArchipelagoDescriptors or createBatchedSanctuaryGeometries, Then returns 4 islets with top elevation -0.16m (> -0.248m wave crest), palm trunks embedded 0.02m into host surfaces, and 5 consolidated BufferGeometry instances with valid bounding spheres', () => {
    const archipelago = getBayArchipelagoDescriptors(20);
    const geoms = createBatchedSanctuaryGeometries(20, getCornerSanctuaryDescriptors(), archipelago);
    const geomList = [
      geoms.sandBasesGeom,
      geoms.walnutDecksGeom,
      geoms.brassRimsGeom,
      geoms.isletsAndCrownsGeom,
      geoms.palmTrunksGeom,
    ];
    const allIsletsValid =
      archipelago.islets.length === 4 &&
      archipelago.islets.every(
        (isl) => isl.bottomElevation === -0.38 && isl.topElevation === -0.16 && isl.topElevation > -0.248
      );
    const allPalmsEmbedded =
      archipelago.palms.length === 20 &&
      archipelago.palms.every((p) => Math.abs(p.surfaceTopY - p.trunkBottomY - 0.02) < 1e-4);
    const allGeomsPopulated = geomList.every(
      (g) => (g.getAttribute('position')?.count ?? 0) > 0 && g.boundingSphere !== null && g.boundingSphere.radius > 0
    );

    expect(allIsletsValid).toBe(true);
    expect(allPalmsEmbedded).toBe(true);
    expect(geomList.length).toBe(5);
    expect(allGeomsPopulated).toBe(true);
  });

  it('TC-399.05 [UC-COASTAL-SANCTUARY-WIRING/MSS]: Given CoastalIslandEnvironment rendered with isMobile: true (deviceMemoryGb: 4) vs isMobile: false (deviceMemoryGb: 16), When inspecting CornerTycoonSanctuaries, Then renders 5 batched <mesh> nodes, binds castShadow and walnut deck metalness, and preserves IMP-107 invariants', () => {
    const envTree = captureTree<CoastalIslandEnvironmentProps>(CoastalIslandEnvironment, {
      isMobile: false,
      deviceMemoryGb: 16,
    });
    const sanctuaryNode = findReactNode(envTree, (n) => n.type === CornerTycoonSanctuaries);
    const mobileSanctuary = captureTree(CornerTycoonSanctuaries, { isMobile: true, deviceMemoryGb: 4 });
    const ultraSanctuary = captureTree(CornerTycoonSanctuaries, { isMobile: false, deviceMemoryGb: 16 });
    const mobileMeshes = findReactNodes(mobileSanctuary, (n) => n.type === 'mesh');
    const ultraMeshes = findReactNodes(ultraSanctuary, (n) => n.type === 'mesh');
    const mobileDeckMat = findReactNode(
      mobileSanctuary,
      (n) => n.type === 'meshStandardMaterial' && n.props.color === '#2B1D14'
    );
    const ultraDeckMat = findReactNode(
      ultraSanctuary,
      (n) => n.type === 'meshStandardMaterial' && n.props.color === '#2B1D14'
    );
    const envHtml = renderToStaticMarkup(
      React.createElement(CoastalIslandEnvironment, { streamlined: true, isMobile: false, deviceMemoryGb: 16 })
    );

    expect([sanctuaryNode?.props?.isMobile, sanctuaryNode?.props?.deviceMemoryGb]).toEqual([false, 16]);
    expect([mobileMeshes.length, ultraMeshes.length]).toEqual([5, 5]);
    expect([
      mobileMeshes.some((m) => Boolean(m.props.castShadow)),
      ultraMeshes.some((m) => Boolean(m.props.castShadow)),
      mobileDeckMat?.props?.metalness,
      ultraDeckMat?.props?.metalness,
    ]).toEqual([false, true, 0.05, 0.14]);
    expect(
      envHtml.includes('data-testid="corner-tycoon-sanctuaries"') &&
        !envHtml.includes('data-testid="tropical-palms-cluster"')
    ).toBe(true);
  });

  it('TC-399.06 [UC-MOBILE-SILHOUETTE-EXCLUSION/MSS]: Given diorama_lod_helpers, When calling getMobileCitySilhouetteDescriptors, Then returns 18 urban boxes with bottom elevation 0.012m, |X| in [2.35, 5.80], distance >= 1.0m from Cathedral, Bitexco, and Park Relief, and outside SE Port/Marina', () => {
    const boxes = getMobileCitySilhouetteDescriptors();
    const allEmbeddedAndOutsideRiver = boxes.every(
      (b) =>
        b.bottomElevation === 0.012 &&
        Math.abs(b.position[1] - b.scale[1] / 2 - 0.012) < 1e-4 &&
        Math.abs(b.position[0]) >= 2.35 &&
        Math.abs(b.position[0]) <= 5.8
    );
    const allClearOfLandmarks = boxes.every(
      (b) =>
        Math.hypot(b.position[0] - -4.3, b.position[2] - 3.65) >= 1.0 &&
        Math.hypot(b.position[0] - -4.5, b.position[2] - -4.4) >= 1.0 &&
        Math.hypot(b.position[0] - -2.7, b.position[2] - -2.5) >= 1.0
    );
    const allClearOfMarina = boxes.every((b) => !(b.position[0] > 3.6 && b.position[2] > 3.2));

    expect(boxes.length).toBe(18);
    expect(allEmbeddedAndOutsideRiver).toBe(true);
    expect(allClearOfLandmarks).toBe(true);
    expect(allClearOfMarina).toBe(true);
  });

  it('TC-399.07 [UC-MOBILE-SILHOUETTE-WIRING/MSS]: Given MiniatureCityDiorama rendered with isMobile: true and an uninitialized InstancedMesh, When calling populateMobileCitySilhouetteInstancedMesh, Then allocates instanceColor, populates 18 matrices/colors, and mounts BatchedMobileCitySilhouette while keeping DioramaShophouseBlocks null', () => {
    const rawMesh = new InstancedMesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial(), 18);
    rawMesh.instanceColor = null;
    const populatedCount = populateMobileCitySilhouetteInstancedMesh(rawMesh);

    sharedR3FHarness.reset();
    const mobileDiorama = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const silhouetteNode = findReactNode(mobileDiorama, (n) => n.type === BatchedMobileCitySilhouette);
    const shophouseNode = findReactNode(mobileDiorama, (n) => n.type === DioramaShophouseBlocks);
    const silhouetteTree = captureTree(BatchedMobileCitySilhouette);
    const instancedNode = findReactNode(silhouetteTree, (n) => n.type === 'instancedMesh');

    expect([populatedCount, rawMesh.instanceColor !== null, rawMesh.boundingSphere !== null]).toEqual([
      18,
      true,
      true,
    ]);
    expect([silhouetteNode !== null, shophouseNode]).toEqual([true, null]);
    expect([
      instancedNode?.props?.['data-testid'],
      instancedNode?.props?.frustumCulled,
      instancedNode?.props?.frustumculled,
      instancedNode?.props?.castShadow,
    ]).toEqual(['batched-mobile-city-silhouette', false, 'false', false]);
    expect(sharedR3FHarness.getSubscriberCount()).toBe(0);
  });

  it('TC-399.08 [UC-DESKTOP-SILHOUETTE-BYPASS/A1]: Given MiniatureCityDiorama rendered with isMobile: false, When inspecting the component tree for BatchedMobileCitySilhouette, Then omits BatchedMobileCitySilhouette and renders full desktop DioramaHighriseBlocks and DioramaShophouseBlocks', () => {
    const desktopDiorama = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: false });
    const mobileDiorama = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const desktopSilhouette = findReactNode(desktopDiorama, (n) => n.type === BatchedMobileCitySilhouette);
    const mobileSilhouette = findReactNode(mobileDiorama, (n) => n.type === BatchedMobileCitySilhouette);
    const highriseNode = findReactNode(desktopDiorama, (n) => n.type === DioramaHighriseBlocks);
    const shophouseNode = findReactNode(desktopDiorama, (n) => n.type === DioramaShophouseBlocks);

    expect(desktopSilhouette).toBeNull();
    expect(mobileSilhouette).not.toBeNull();
    expect(highriseNode).not.toBeNull();
    expect(shophouseNode).not.toBeNull();
  });
});
