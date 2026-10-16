// [TC-399/MSS][IMP-399] Contract Test Suite: Desktop Bay Archipelago & 4 Indochine Tycoon Sanctuaries
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import '../helpers/r3f_test_harness';
import { captureTree, findReactNode, findReactNodes } from '../helpers/threejs_test_utils';
import { LODLevel, perfBudget } from '../../src/client/3d/perf_budget';
import { SafeGLTFModel, type SafeGLTFModelProps } from '../../src/client/3d/asset_loader/safe_gltf_model';
import { createWalnutTabletopTexture, clearTabletopTextureCache } from '../../src/client/3d/tabletop_texture_generator';
import {
  CoastalIslandEnvironment,
  CornerTycoonSanctuaries,
  type CoastalIslandEnvironmentProps,
} from '../../src/client/3d/coastal_island_environment';
import {
  resolveDesktopQualityTier,
  getCornerSanctuaryDescriptors,
  getBayArchipelagoDescriptors,
  createBatchedSanctuaryGeometries,
  disposeBatchedSanctuaryGeometries,
} from '../../src/client/3d/coastal_sanctuary_visuals';

const EXPECTED_SANCTUARY_URLS = [
  '/models/pawns/pawn_horse.glb',
  '/models/pawns/pawn_tower.glb',
  '/models/pawns/pawn_yacht.glb',
  '/models/pawns/pawn_car.glb',
];

describe('IMP-399: Desktop Bay Archipelago & 4 Indochine Tycoon Sanctuaries Contract Suite', () => {
  const originalPreload = SafeGLTFModel.preload;
  let preloadedUrls: string[] = [];

  beforeEach(() => {
    preloadedUrls = [];
    SafeGLTFModel.preload = (url: string): void => {
      preloadedUrls.push(url);
      originalPreload(url);
    };
    disposeBatchedSanctuaryGeometries();
    clearTabletopTextureCache();
    perfBudget.setCurrentLOD(LODLevel.HIGH);
  });

  afterEach(() => {
    SafeGLTFModel.preload = originalPreload;
  });

  it('TC-399.01a [UC-ADAPTIVE-TIER-LOWRAM/MSS]: Given LODLevel.HIGH and deviceMemoryGb = 4 (or NaN / 0), When calling resolveDesktopQualityTier, Then returns DESKTOP_BALANCED with deckMetalness 0.05, deckRoughness 0.35, castSanctuaryShadows false, and palmInstanceCount 16', () => {
    const lowRam = resolveDesktopQualityTier(LODLevel.HIGH, 4, false);
    const nanRam = resolveDesktopQualityTier(LODLevel.HIGH, Number.NaN, false);
    const zeroRam = resolveDesktopQualityTier(LODLevel.HIGH, 0, false);

    expect(lowRam).toEqual({
      tier: 'DESKTOP_BALANCED',
      deckMetalness: 0.05,
      deckRoughness: 0.35,
      castSanctuaryShadows: false,
      palmInstanceCount: 16,
    });
    expect(nanRam.tier).toBe('DESKTOP_BALANCED');
    expect(zeroRam.palmInstanceCount).toBe(16);
  });

  it('TC-399.01b [UC-ADAPTIVE-TIER-LOWRAM/A1]: Given LODLevel.MEDIUM or isMobile = true, When calling resolveDesktopQualityTier, Then returns DESKTOP_BALANCED for medium LOD and MOBILE_BYPASS (palmInstanceCount 0) for mobile', () => {
    const mediumLod = resolveDesktopQualityTier(LODLevel.MEDIUM, 16, false);
    const mobileTier = resolveDesktopQualityTier(LODLevel.HIGH, 16, true);

    expect(mediumLod.tier).toBe('DESKTOP_BALANCED');
    expect(mobileTier).toEqual({
      tier: 'MOBILE_BYPASS',
      deckMetalness: 0,
      deckRoughness: 1,
      castSanctuaryShadows: false,
      palmInstanceCount: 0,
    });
  });

  it('TC-399.02 [UC-ADAPTIVE-TIER-ULTRA/A1]: Given LODLevel.HIGH, deviceMemoryGb = 16 (or undefined defaulting to 8), and isMobile = false, When calling resolveDesktopQualityTier, Then returns DESKTOP_ULTRA with deckMetalness 0.12, deckRoughness 0.22, castSanctuaryShadows true, and palmInstanceCount 20', () => {
    const ultra16 = resolveDesktopQualityTier(LODLevel.HIGH, 16, false);
    const ultraDefault = resolveDesktopQualityTier(LODLevel.HIGH, undefined, false);

    expect(ultra16).toEqual({
      tier: 'DESKTOP_ULTRA',
      deckMetalness: 0.12,
      deckRoughness: 0.22,
      castSanctuaryShadows: true,
      palmInstanceCount: 20,
    });
    expect(ultraDefault.tier).toBe('DESKTOP_ULTRA');
  });

  it('TC-399.03a [UC-SANCTUARY-CLEARANCE-AND-MONUMENT-SCALE/MSS]: Given true board outer edge +-10.15m, When calling getCornerSanctuaryDescriptors, Then all 4 sanctuaries span West, North, and South-West flank bays (max(|X|,|Z|) >= 12.0 across >= 3 flanks), zero in South-East GO foreground, and maintain inner lagoon clearance >= 10.60m', () => {
    const corners = getCornerSanctuaryDescriptors();
    const spansThreeFlanks =
      corners.some((c) => c.position[0] <= -12.0) &&
      corners.some((c) => c.position[2] <= -12.0) &&
      corners.some((c) => c.position[2] >= 12.0) &&
      corners.filter((c) => c.position[0] <= -12.0).length <= 2;
    const anyInGoForeground = corners.some((c) => c.position[0] > 6 && c.position[2] > 6);
    const minClearance =
      corners.length > 0
        ? Math.min(...corners.map((c) => Math.max(Math.abs(c.position[0]), Math.abs(c.position[2])) - c.lagoonRadius))
        : 0;

    expect(corners).toHaveLength(4);
    expect(spansThreeFlanks).toBe(true);
    expect(anyInGoForeground).toBe(false);
    expect(minClearance).toBeGreaterThanOrEqual(10.6);
  });

  it('TC-399.03b [UC-SANCTUARY-CLEARANCE-AND-MONUMENT-SCALE/A1]: Given CAMERA_CONFIG.overview frustum, When inspecting getCornerSanctuaryDescriptors and getBayArchipelagoDescriptors, Then projects within |ndcX| <= 0.85, |ndcY| <= 0.82, enforces pairwise non-overlap (d >= R1 + R2 + 0.30m), binds 4 real .glb URLs, and enforces heroic monument modelScale in [1.45, 1.75]', () => {
    const corners = getCornerSanctuaryDescriptors();
    const arch = getBayArchipelagoDescriptors(20);
    const allIslands = [
      ...corners.map((c) => ({ x: c.position[0], z: c.position[2], r: c.lagoonRadius, ndcX: c.ndcX, ndcY: c.ndcY })),
      ...arch.islets.map((i) => ({ x: i.position[0], z: i.position[2], r: i.lagoonRadius, ndcX: i.ndcX, ndcY: i.ndcY })),
    ];
    const allWithinFrustum =
      allIslands.length === 8 && allIslands.every((item) => Math.abs(item.ndcX) <= 0.85 && Math.abs(item.ndcY) <= 0.82);
    const noPairwiseOverlap = allIslands.every((a, idx) =>
      allIslands.slice(idx + 1).every((b) => Math.hypot(a.x - b.x, a.z - b.z) >= a.r + b.r + 0.3)
    );
    const allHeroicScale =
      corners.length === 4 &&
      corners.every(
        (c) =>
          c.modelScale[0] >= 1.45 &&
          c.modelScale[0] <= 1.75 &&
          c.modelScale[0] === c.modelScale[1] &&
          c.modelScale[1] === c.modelScale[2]
      );

    expect(allWithinFrustum && noPairwiseOverlap).toBe(true);
    expect(corners.map((c) => c.modelUrl)).toEqual(EXPECTED_SANCTUARY_URLS);
    expect(allHeroicScale).toBe(true);
  });

  it('TC-399.04 [UC-STEPPED-PODIUM-NON-OCCLUSION/MSS]: Given getCornerSanctuaryDescriptors, When inspecting horizontal widths and elevations, Then enforces strict stepped pyramid tapering and ascending top elevations with inter-volume embedding >= 0.02m', () => {
    const corners = getCornerSanctuaryDescriptors();
    const widthsStrictlyTaper =
      corners.length === 4 &&
      corners.every(
        (c) =>
          c.lagoonWidth > c.baseWidth &&
          c.baseWidth > c.rimWidth &&
          c.rimWidth > c.deckWidth &&
          c.deckWidth > c.pedestalWidth
      );
    const elevationsAscend =
      corners.length === 4 &&
      corners.every(
        (c) =>
          c.baseTopY < c.rimTopY &&
          c.rimTopY < c.deckTopY &&
          c.deckTopY < c.pedestalTopY &&
          Math.abs(c.modelPosition[1] - c.pedestalTopY) < 1e-4
      );
    const embeddingsValid =
      corners.length === 4 &&
      corners.every(
        (c) =>
          c.baseTopY - c.rimBottomY >= 0.02 - 1e-5 &&
          c.rimTopY - c.deckBottomY >= 0.02 - 1e-5 &&
          c.deckTopY - c.pedestalBottomY >= 0.02 - 1e-5
      );

    expect(widthsStrictlyTaper).toBe(true);
    expect(elevationsAscend).toBe(true);
    expect(embeddingsValid).toBe(true);
  });

  it('TC-399.05a [UC-MULTI-PART-SCULPTED-GEOMETRY-AND-CACHE/MSS]: Given getBayArchipelagoDescriptors(20) and createBatchedSanctuaryGeometries(20), When inspecting the 8 consolidated BufferGeometry layers, Then verifies multi-peak karst islet density, multi-segment curved trunks, and 6-frond radiating canopies', () => {
    const arch = getBayArchipelagoDescriptors(20);
    const geoms = createBatchedSanctuaryGeometries(20);
    const layerCounts = [
      geoms.lagoonRingsGeom,
      geoms.sandBasesGeom,
      geoms.limestoneCliffsGeom,
      geoms.brassRimsGeom,
      geoms.walnutDecksGeom,
      geoms.marblePedestalsGeom,
      geoms.palmTrunksGeom,
      geoms.foliageCanopyGeom,
    ].map((g) => g.getAttribute('position')?.count ?? 0);

    expect(layerCounts.every((count) => count > 0)).toBe(true);
    expect(geoms.limestoneCliffsGeom.getAttribute('position')?.count ?? 0).toBeGreaterThanOrEqual(
      Math.max(1, arch.islets.length) * 48
    );
    expect(geoms.palmTrunksGeom.getAttribute('position')?.count ?? 0).toBeGreaterThanOrEqual(20 * 36);
    expect(geoms.foliageCanopyGeom.getAttribute('position')?.count ?? 0).toBeGreaterThanOrEqual(20 * 6 * 360);
  });

  it('TC-399.05b [UC-MULTI-PART-SCULPTED-GEOMETRY-AND-CACHE/A1]: Given createBatchedSanctuaryGeometries, When called with default args, custom corners/archipelago, and disposeBatchedSanctuaryGeometries(), Then reuses cache per palmCount, computes fresh geometry on custom descriptors, and resets cleanly', () => {
    const g20a = createBatchedSanctuaryGeometries(20);
    const g20b = createBatchedSanctuaryGeometries(20);
    const g16 = createBatchedSanctuaryGeometries(16);
    const baseArch = getBayArchipelagoDescriptors(16);
    const customArch = {
      islets: baseArch.islets.map((isl) => ({ ...isl, scale: [isl.scale[0], isl.scale[1] * 1.4, isl.scale[2]] as const })),
      palms: baseArch.palms.map((p) => ({
        ...p,
        surfaceTopY: p.surfaceTopY + 0.08,
        tiltX: p.tiltX + 0.35,
        rotationY: p.rotationY + 1.1,
        scale: p.scale * 1.25,
      })),
    };
    const gCustom = createBatchedSanctuaryGeometries(16, getCornerSanctuaryDescriptors(), customArch);
    disposeBatchedSanctuaryGeometries();
    const g20AfterDispose = createBatchedSanctuaryGeometries(20);

    expect(g20a).toBe(g20b);
    expect(g16).not.toBe(g20a);
    expect(gCustom.limestoneCliffsGeom.boundingBox?.max.y).toBeGreaterThan(
      g16.limestoneCliffsGeom.boundingBox?.max.y ?? 0
    );
    expect(g20AfterDispose).not.toBe(g20a);
  });

  it('TC-399.06a [UC-DESKTOP-GLB-PRELOAD-AND-WALNUT-WIRING/MSS]: Given CoastalIslandEnvironment and CornerTycoonSanctuaries rendered with isMobile: false (deviceMemoryGb 16 vs 4), When inspecting the component tree, Then mounts 8 batched terrain/podium meshes, 4 SafeGLTFModel nodes (empty group fallback, scale >= 1.45), and binds createWalnutTabletopTexture with tier deckMetalness', () => {
    const envTree = captureTree<CoastalIslandEnvironmentProps>(CoastalIslandEnvironment, { isMobile: false, deviceMemoryGb: 16 });
    const sanctuaryNode = findReactNode(envTree, (n) => n.type === CornerTycoonSanctuaries);
    const ultraTree = captureTree(CornerTycoonSanctuaries, { isMobile: false, deviceMemoryGb: 16 });
    const balancedTree = captureTree(CornerTycoonSanctuaries, { isMobile: false, deviceMemoryGb: 4 });
    const meshes = findReactNodes(ultraTree, (n) => n.type === 'mesh');
    const gltfNodes = findReactNodes<SafeGLTFModelProps>(ultraTree, (n) => n.type === SafeGLTFModel);
    const walnutTex = createWalnutTabletopTexture();
    const ultraDeckMat = findReactNode(ultraTree, (n) => n.type === 'meshStandardMaterial' && n.props?.map === walnutTex);
    const balancedDeckMat = findReactNode(balancedTree, (n) => n.type === 'meshStandardMaterial' && n.props?.map === walnutTex);

    expect(sanctuaryNode?.props?.deviceMemoryGb).toBe(16);
    expect(meshes).toHaveLength(8);
    expect(
      gltfNodes.length === 4 &&
        gltfNodes.every(
          (n) => React.isValidElement(n.props.fallback) && Array.isArray(n.props.scale) && n.props.scale[0] >= 1.45
        )
    ).toBe(true);
    expect([ultraDeckMat?.props?.metalness, balancedDeckMat?.props?.metalness]).toEqual([0.12, 0.05]);
  });

  it('TC-399.06b [UC-DESKTOP-GLB-PRELOAD-AND-WALNUT-WIRING/A1]: Given CornerTycoonSanctuaries and CoastalIslandEnvironment rendered on Desktop, When checking SafeGLTFModel.preload and SSR static markup, Then preloads all 4 .glb URLs and preserves IMP-107 SSR invariants (zero #94A3B8)', () => {
    const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { isMobile: false, deviceMemoryGb: 16 }));

    expect(preloadedUrls).toEqual(EXPECTED_SANCTUARY_URLS);
    expect(html).not.toContain('#94A3B8');
  });

  it('TC-399.07 [UC-MOBILE-ZERO-ALLOCATION-ISOLATION/A1]: Given CoastalIslandEnvironment and CornerTycoonSanctuaries rendered with isMobile: true vs false, When inspecting the component tree, Then mobile omits CornerTycoonSanctuaries and short-circuits useMemo to null with zero allocations while desktop mounts it', () => {
    const mobileEnvTree = captureTree<CoastalIslandEnvironmentProps>(CoastalIslandEnvironment, { isMobile: true, deviceMemoryGb: 16 });
    const sanctuaryInMobileEnv = findReactNode(mobileEnvTree, (n) => n.type === CornerTycoonSanctuaries);
    const directMobileTree = captureTree(CornerTycoonSanctuaries, { isMobile: true, deviceMemoryGb: 16 });
    const desktopEnvTree = captureTree<CoastalIslandEnvironmentProps>(CoastalIslandEnvironment, { isMobile: false, deviceMemoryGb: 16 });

    expect(sanctuaryInMobileEnv).toBeNull();
    expect(directMobileTree).toBeNull();
    expect(preloadedUrls).toHaveLength(0);
    expect(findReactNode(desktopEnvTree, (n) => n.type === CornerTycoonSanctuaries)).not.toBeNull();
  });
});
