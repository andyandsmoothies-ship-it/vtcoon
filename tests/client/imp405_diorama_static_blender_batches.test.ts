// @vitest-environment happy-dom
// [TC-405/MSS][IMP-405] Contract Test Suite: Diorama Static Blender Batches, Saigon Cathedral Realism & Mobile Draw-Call Diet
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import type * as THREE from 'three';
import { analyzeModelFile } from '../../scripts/optimize_assets.mjs';
import { useEnvironmentStore } from '../../src/client/store/environment_store';
import { SafeGLTFModel } from '../../src/client/3d/asset_loader/safe_gltf_model';
import {
  URBAN_TREES,
  getBatchedBoardRimGeometries,
  getBatchedMobileContainerPortGeometries,
  getBatchedMobileHeritageGeometries,
  disposeDioramaStaticBlenderBatches,
} from '../../src/client/3d/diorama/diorama_static_blender_batches';
import {
  DioramaBoardRim,
  DioramaUrbanCanopy,
  MiniatureCityDiorama,
  type MiniatureCityDioramaProps,
} from '../../src/client/3d/miniature_city_diorama';
import {
  DioramaContainerPort,
  type DioramaContainerPortProps,
} from '../../src/client/3d/diorama/diorama_container_port';
import {
  DioramaHeritageDistrict,
  CathedralProceduralFallback,
  type DioramaHeritageDistrictProps,
} from '../../src/client/3d/diorama/diorama_heritage_district';
import {
  SHOPHOUSE_CONFIGS,
  DioramaShophouseBlocks,
} from '../../src/client/3d/diorama/diorama_shophouse_blocks';
import {
  HIGHRISE_CONFIGS,
  DioramaHighriseBlocks,
} from '../../src/client/3d/diorama/diorama_highrise_blocks';
import { captureTree, findReactNode, findReactNodes } from '../helpers/threejs_test_utils';
import '../helpers/r3f_test_harness';

vi.mock('@react-three/drei', () => ({
  ContactShadows: () => null,
  OrbitControls: () => null,
  Environment: () => null,
  RoundedBox: ({ children, ...props }: { readonly children?: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('group', { ...props, 'data-drei': 'RoundedBox' }, children),
}));

interface BoardRimTestProps {
  readonly isMobile?: boolean;
}

interface CathedralFallbackTestProps {
  readonly isNight: boolean;
  readonly isSunset: boolean;
  readonly isMobile?: boolean;
}

interface MeshNodeProps {
  readonly geometry?: THREE.BufferGeometry;
  readonly position?: readonly [number, number, number];
  readonly visible?: boolean;
  readonly args?: readonly unknown[];
  readonly name?: string;
  readonly 'data-testid'?: string;
  readonly 'data-drei'?: string;
}

interface MaterialNodeProps {
  readonly color?: string;
  readonly vertexColors?: boolean;
  readonly emissive?: string;
  readonly emissiveIntensity?: number;
}

function getGeometryVertexCount(geom: THREE.BufferGeometry): number {
  const pos = geom.getAttribute('position');
  const norm = geom.getAttribute('normal');
  if (!pos || !norm || pos.count !== norm.count) return 0;
  return pos.count;
}

function computeGeometryColorLuminanceRange(geom: THREE.BufferGeometry): number {
  const colorAttr = geom.getAttribute('color');
  if (!colorAttr || colorAttr.count === 0) return 0;
  const count = colorAttr.count;
  const luminances = Array.from({ length: count }, (_, idx) => {
    const r = colorAttr.getX(idx);
    const g = colorAttr.getY(idx);
    const b = colorAttr.getZ(idx);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  });
  return Math.max(...luminances) - Math.min(...luminances);
}

function computeGeometryBounds(geom: THREE.BufferGeometry): {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
} {
  const pos = geom.getAttribute('position');
  if (!pos || pos.count === 0) {
    return { width: 0, height: 0, depth: 0 };
  }
  geom.computeBoundingBox();
  const box = geom.boundingBox;
  if (!box) {
    return { width: 0, height: 0, depth: 0 };
  }
  return {
    width: box.max.x - box.min.x,
    height: box.max.y - box.min.y,
    depth: box.max.z - box.min.z,
  };
}

function hasRecessedReliefVertices(geom: THREE.BufferGeometry): boolean {
  const pos = geom.getAttribute('position');
  const colorAttr = geom.getAttribute('color');
  if (!pos || !colorAttr || pos.count < 24) return false;
  const indices = Array.from({ length: pos.count }, (_, idx) => idx);
  const hasDarkCavity = indices.some((idx) => {
    const lum =
      0.2126 * colorAttr.getX(idx) +
      0.7152 * colorAttr.getY(idx) +
      0.0722 * colorAttr.getZ(idx);
    return lum <= 0.18;
  });
  const hasBrightCrown = indices.some((idx) => {
    const lum =
      0.2126 * colorAttr.getX(idx) +
      0.7152 * colorAttr.getY(idx) +
      0.0722 * colorAttr.getZ(idx);
    return lum >= 0.88;
  });
  return hasDarkCavity && hasBrightCrown;
}

describe('IMP-405: Diorama Static Blender Batches, Saigon Cathedral Realism & Mobile Draw-Call Diet', () => {
  beforeEach(() => {
    disposeDioramaStaticBlenderBatches();
    useEnvironmentStore.setState({ phase: 'day' });
  });

  afterEach(() => {
    disposeDioramaStaticBlenderBatches();
    vi.restoreAllMocks();
  });

  it('TC-405.01a [UC-STATIC-BLENDER-BATCHES-SINGLETON-AND-DISPOSAL/MSS]: Given URBAN_TREES and DioramaUrbanCanopy, When inspecting tree descriptors and instanced canopy wiring, Then exports 18 valid tropical trees (height > 0.20m) and mounts 3 instancedMesh layers with count = 18', () => {
    const tree = captureTree(DioramaUrbanCanopy, { isMobile: true });
    const instancedNodes = findReactNodes<MeshNodeProps>(tree, (n) => n.type === 'instancedMesh');
    const allValidTrees = URBAN_TREES.every(
      (t) =>
        Number.isFinite(t.x) &&
        Number.isFinite(t.z) &&
        t.height > 0.2 &&
        t.radius > 0.1 &&
        t.color.startsWith('#')
    );

    expect(URBAN_TREES).toHaveLength(18);
    expect(allValidTrees).toBe(true);
    expect(instancedNodes).toHaveLength(3);
    expect(instancedNodes.every((n) => n.props.args?.[2] === 18)).toBe(true);
  });

  it('TC-405.01b [UC-STATIC-BLENDER-BATCHES-SINGLETON-AND-DISPOSAL/A1]: Given getBatchedBoardRimGeometries, getBatchedMobileContainerPortGeometries, and getBatchedMobileHeritageGeometries, When called repeatedly, Then returns identical cached singleton BufferGeometry instances with >= 24 vertices and normals', () => {
    const rimA = getBatchedBoardRimGeometries();
    const rimB = getBatchedBoardRimGeometries();
    const portA = getBatchedMobileContainerPortGeometries();
    const portB = getBatchedMobileContainerPortGeometries();
    const heritageA = getBatchedMobileHeritageGeometries();
    const heritageB = getBatchedMobileHeritageGeometries();
    const allGeoms = [
      rimA.walnutRimGeom,
      rimA.brassTrimGeom,
      portA.portStructuresVertexAoGeom,
      portA.gantryCranesVertexAoGeom,
      heritageA.cathedralBodyVertexAoGeom,
      heritageA.cathedralAccentsGeom,
      heritageA.parisStatueAndPedestalGeom,
      heritageA.parisStreetlampsGeom,
    ];

    expect(rimA.walnutRimGeom).toBe(rimB.walnutRimGeom);
    expect(portA.portStructuresVertexAoGeom).toBe(portB.portStructuresVertexAoGeom);
    expect(heritageA.cathedralBodyVertexAoGeom).toBe(heritageB.cathedralBodyVertexAoGeom);
    expect(allGeoms.every((g) => getGeometryVertexCount(g) >= 24)).toBe(true);
  });

  it('TC-405.01c [UC-STATIC-BLENDER-BATCHES-SINGLETON-AND-DISPOSAL/A2]: Given portStructuresVertexAoGeom, gantryCranesVertexAoGeom, and cathedralBodyVertexAoGeom, When inspecting COLOR_0 vertex-color attributes and relief cavities, Then enforces Baked AO luminance range >= 0.22 and inward-recessed relief vertices', () => {
    const { portStructuresVertexAoGeom, gantryCranesVertexAoGeom } = getBatchedMobileContainerPortGeometries();
    const { cathedralBodyVertexAoGeom } = getBatchedMobileHeritageGeometries();

    const portLumRange = computeGeometryColorLuminanceRange(portStructuresVertexAoGeom);
    const craneLumRange = computeGeometryColorLuminanceRange(gantryCranesVertexAoGeom);
    const cathedralLumRange = computeGeometryColorLuminanceRange(cathedralBodyVertexAoGeom);

    expect(portLumRange).toBeGreaterThanOrEqual(0.22);
    expect(craneLumRange).toBeGreaterThanOrEqual(0.22);
    expect(cathedralLumRange).toBeGreaterThanOrEqual(0.22);
    expect(
      hasRecessedReliefVertices(portStructuresVertexAoGeom) &&
        hasRecessedReliefVertices(gantryCranesVertexAoGeom) &&
        hasRecessedReliefVertices(cathedralBodyVertexAoGeom)
    ).toBe(true);
  });

  it('TC-405.01d [UC-STATIC-BLENDER-BATCHES-SINGLETON-AND-DISPOSAL/A3]: Given cached static Blender batch geometries, When calling disposeDioramaStaticBlenderBatches() ([ADV-03]), Then calls .dispose() on all 8 cached BufferGeometry instances and resets module caches so subsequent calls allocate fresh instances', () => {
    const rimBefore = getBatchedBoardRimGeometries();
    const portBefore = getBatchedMobileContainerPortGeometries();
    const heritageBefore = getBatchedMobileHeritageGeometries();
    const allEightBefore = [
      rimBefore.walnutRimGeom,
      rimBefore.brassTrimGeom,
      portBefore.portStructuresVertexAoGeom,
      portBefore.gantryCranesVertexAoGeom,
      heritageBefore.cathedralBodyVertexAoGeom,
      heritageBefore.cathedralAccentsGeom,
      heritageBefore.parisStatueAndPedestalGeom,
      heritageBefore.parisStreetlampsGeom,
    ];
    const spies = allEightBefore.map((geom) => vi.spyOn(geom, 'dispose'));

    disposeDioramaStaticBlenderBatches();

    const rimAfter = getBatchedBoardRimGeometries();
    const portAfter = getBatchedMobileContainerPortGeometries();
    const heritageAfter = getBatchedMobileHeritageGeometries();

    expect(spies.every((spy) => spy.mock.calls.length === 1)).toBe(true);
    expect(rimAfter.walnutRimGeom).not.toBe(rimBefore.walnutRimGeom);
    expect(portAfter.portStructuresVertexAoGeom).not.toBe(portBefore.portStructuresVertexAoGeom);
    expect(heritageAfter.cathedralBodyVertexAoGeom).not.toBe(heritageBefore.cathedralBodyVertexAoGeom);
  });

  it('TC-405.02a [UC-CATHEDRAL-TECTONICS-AND-URBAN-SIGHTLINE-LIBERATION/MSS]: Given public/models/landmarks/landmark_cathedral.glb and cathedralBodyVertexAoGeom, When analyzing GLB budget and Cathedral bounding box vs CHO_LON_SHOPHOUSES, Then satisfies 1000..1500 triangles (<= 200 KB) and height >= 1.38m (>= 4x max Cho Lon shophouse height)', () => {
    const landmarksDir = path.resolve(process.cwd(), 'public/models/landmarks');
    const cathedralGlbPath = path.join(landmarksDir, 'landmark_cathedral.glb');
    const analysis = analyzeModelFile(cathedralGlbPath, landmarksDir);
    const { cathedralBodyVertexAoGeom } = getBatchedMobileHeritageGeometries();
    const bounds = computeGeometryBounds(cathedralBodyVertexAoGeom);
    const choLonShophouses = SHOPHOUSE_CONFIGS.filter((s) => s.id.startsWith('sh-cl-'));
    const maxShophouseHeight = Math.max(...choLonShophouses.map((s) => s.height));

    expect(
      analysis.passed === true &&
        analysis.sizeBytes <= 200 * 1024 &&
        (analysis.triangles ?? 0) >= 1000 &&
        (analysis.triangles ?? 0) <= 1500
    ).toBe(true);
    expect(bounds.height).toBeGreaterThanOrEqual(1.38);
    expect(bounds.width <= 0.72 && bounds.depth <= 0.8).toBe(true);
    expect(bounds.height).toBeGreaterThanOrEqual(4 * maxShophouseHeight);
  });

  it('TC-405.02b [UC-CATHEDRAL-TECTONICS-AND-URBAN-SIGHTLINE-LIBERATION/A1]: Given SHOPHOUSE_CONFIGS and DioramaShophouseBlocks, When inspecting the 24 Cho Lon shophouses and rooftop signs, Then enforces low-rise heights in [0.20, 0.34] with distance >= 1.35m from [-4.3, 3.65] and preserves Biển Sàn HOSE (#10B981) with 0 Donut or Coffee signs', () => {
    const choLonShophouses = SHOPHOUSE_CONFIGS.filter((s) => s.id.startsWith('sh-cl-'));
    const allLowRiseAndClear = choLonShophouses.every(
      (s) =>
        s.height >= 0.2 &&
        s.height <= 0.34 &&
        s.x >= -6.0 &&
        s.x <= -3.0 &&
        s.z >= 1.5 &&
        s.z <= 6.5 &&
        Math.hypot(s.x - -4.3, s.z - 3.65) >= 1.35
    );
    const tree = captureTree(DioramaShophouseBlocks);
    const signsGroup = findReactNode<MeshNodeProps>(tree, (n) => n.props['data-testid'] === 'diorama-rooftop-signs');
    const hoseSign = findReactNode<MeshNodeProps>(signsGroup, (n) => n.props.name === 'Biển Sàn HOSE');
    const pinkOrToySigns = findReactNodes<MaterialNodeProps>(
      signsGroup,
      (n) =>
        n.props.color === '#EC4899' ||
        (typeof (n.props as MeshNodeProps).name === 'string' &&
          (((n.props as MeshNodeProps).name ?? '').includes('🍩') ||
            ((n.props as MeshNodeProps).name ?? '').includes('☕')))
    );

    expect(choLonShophouses).toHaveLength(24);
    expect(allLowRiseAndClear).toBe(true);
    expect(hoseSign).not.toBeNull();
    expect(pinkOrToySigns).toHaveLength(0);
  });

  it('TC-405.02c [UC-CATHEDRAL-TECTONICS-AND-URBAN-SIGHTLINE-LIBERATION/A2]: Given HIGHRISE_CONFIGS and DioramaHighriseBlocks, When inspecting the 10 Northwest financial towers, Then enforces slim profiles (width <= 0.38m, depth <= 0.38m), receded Z <= -3.3m, and Bitexco clearance >= 0.85m from [-4.5, -4.4]', () => {
    const allSlimAndReceded = HIGHRISE_CONFIGS.every(
      (t) =>
        t.width >= 0.3 &&
        t.width <= 0.38 &&
        t.depth >= 0.3 &&
        t.depth <= 0.38 &&
        t.z <= -3.3 &&
        Math.hypot(t.x - -4.5, t.z - -4.4) >= 0.85
    );
    const tree = captureTree(DioramaHighriseBlocks);
    const highriseRoot = findReactNode<MeshNodeProps>(tree, (n) => n.props['data-testid'] === 'diorama-highrise-blocks');

    expect(HIGHRISE_CONFIGS).toHaveLength(10);
    expect(allSlimAndReceded).toBe(true);
    expect(highriseRoot).not.toBeNull();
  });

  it('TC-405.03a [UC-BOARD-RIM-AND-CONTAINER-PORT-MOBILE-BATCH-PARITY/MSS]: Given DioramaBoardRim and MiniatureCityDiorama rendered with isMobile: true vs isMobile: false ([ADV-01]), When inspecting rendered meshes, Then renders 2 batched meshes (#78350F, #D97706) on Mobile, preserves 8 boxGeometry meshes on Desktop, and forwards isMobile from MiniatureCityDiorama', () => {
    const mobileRimTree = captureTree<BoardRimTestProps>(DioramaBoardRim, { isMobile: true });
    const desktopRimTree = captureTree<BoardRimTestProps>(DioramaBoardRim, { isMobile: false });
    const defaultRimTree = captureTree(DioramaBoardRim);
    const mobileMeshes = findReactNodes<MeshNodeProps>(mobileRimTree, (n) => n.type === 'mesh');
    const desktopMeshes = findReactNodes<MeshNodeProps>(desktopRimTree, (n) => n.type === 'mesh');
    const defaultBoxGeoms = findReactNodes(defaultRimTree, (n) => n.type === 'boxGeometry');
    const rimGeoms = getBatchedBoardRimGeometries();
    const cityTree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const rimChild = findReactNode<BoardRimTestProps>(cityTree, (n) => n.type === DioramaBoardRim);

    expect(mobileMeshes).toHaveLength(2);
    expect([mobileMeshes[0]?.props.geometry, mobileMeshes[1]?.props.geometry]).toEqual([
      rimGeoms.walnutRimGeom,
      rimGeoms.brassTrimGeom,
    ]);
    expect(desktopMeshes.length === 8 && defaultBoxGeoms.length === 8).toBe(true);
    expect(rimChild?.props.isMobile).toBe(true);
  });

  it('TC-405.03b [UC-BOARD-RIM-AND-CONTAINER-PORT-MOBILE-BATCH-PARITY/A1]: Given DioramaContainerPort rendered with isMobile: true vs isMobile: false in daytime and nighttime ([ADV-02]), When inspecting rendered nodes, Then mounts 5 meshes on Mobile (3 daytime meshes including 0.025m #FACC15 curb + 2 Baked-AO batches, plus 2 night-gated #EF4444 strobes) vs >= 25 meshes/RoundedBoxes on Desktop', () => {
    useEnvironmentStore.setState({ phase: 'day' });
    const mobileDayTree = captureTree<DioramaContainerPortProps>(DioramaContainerPort, { isMobile: true });
    const desktopDayTree = captureTree<DioramaContainerPortProps>(DioramaContainerPort, { isMobile: false });
    useEnvironmentStore.setState({ phase: 'night' });
    const mobileNightTree = captureTree<DioramaContainerPortProps>(DioramaContainerPort, { isMobile: true });

    const mobileDayMeshes = findReactNodes<MeshNodeProps>(mobileDayTree, (n) => n.type === 'mesh');
    const desktopDayDrawNodes = findReactNodes<MeshNodeProps>(
      desktopDayTree,
      (n) => n.type === 'mesh' || n.props['data-drei'] === 'RoundedBox'
    );
    const portGeoms = getBatchedMobileContainerPortGeometries();
    const nightStrobes = findReactNodes<MeshNodeProps>(
      mobileNightTree,
      (n) =>
        n.type === 'mesh' &&
        findReactNode<MaterialNodeProps>(n, (c) => c.type === 'meshBasicMaterial' && c.props.color === '#EF4444') !== null
    );
    const vertexColorMats = findReactNodes<MaterialNodeProps>(
      mobileDayTree,
      (n) => n.type === 'meshStandardMaterial' && n.props.vertexColors === true
    );

    expect(mobileDayMeshes).toHaveLength(5);
    expect(
      mobileDayMeshes.some((m) => m.props.geometry === portGeoms.portStructuresVertexAoGeom) &&
        mobileDayMeshes.some((m) => m.props.geometry === portGeoms.gantryCranesVertexAoGeom) &&
        vertexColorMats.length === 2
    ).toBe(true);
    expect(nightStrobes.length === 2 && nightStrobes.every((s) => s.props.visible === true)).toBe(true);
    expect(desktopDayDrawNodes.length).toBeGreaterThanOrEqual(25);
  });

  it('TC-405.04a [UC-HERITAGE-MOBILE-BATCH-AND-TERRACE-PARITY/MSS]: Given CathedralProceduralFallback rendered with isMobile: true vs isMobile: false, When inspecting fallback meshes, Then renders 2 batched meshes (cathedralBodyVertexAoGeom and cathedralAccentsGeom, both with COLOR_0 vertexColors and neutral #FFFFFF base color) on Mobile vs >= 8 meshes/RoundedBoxes on Desktop', () => {
    const mobileFallback = captureTree<CathedralFallbackTestProps>(CathedralProceduralFallback, {
      isNight: true,
      isSunset: false,
      isMobile: true,
    });
    const desktopFallback = captureTree<CathedralFallbackTestProps>(CathedralProceduralFallback, {
      isNight: false,
      isSunset: false,
      isMobile: false,
    });
    const mobileMeshes = findReactNodes<MeshNodeProps>(mobileFallback, (n) => n.type === 'mesh');
    const desktopDrawNodes = findReactNodes<MeshNodeProps>(
      desktopFallback,
      (n) => n.type === 'mesh' || n.props['data-drei'] === 'RoundedBox'
    );
    const heritageGeoms = getBatchedMobileHeritageGeometries();
    const mobileMats = findReactNodes<MaterialNodeProps>(
      mobileFallback,
      (n) => n.type === 'meshStandardMaterial' && n.props.color === '#FFFFFF' && n.props.vertexColors === true
    );

    expect(mobileMeshes).toHaveLength(2);
    expect([mobileMeshes[0]?.props.geometry, mobileMeshes[1]?.props.geometry]).toEqual([
      heritageGeoms.cathedralBodyVertexAoGeom,
      heritageGeoms.cathedralAccentsGeom,
    ]);
    expect(
      mobileMats.length === 2 &&
        heritageGeoms.cathedralAccentsGeom.getAttribute('color') !== undefined
    ).toBe(true);
    expect(desktopDrawNodes.length).toBeGreaterThanOrEqual(8);
  });

  it('TC-405.04b [UC-HERITAGE-MOBILE-BATCH-AND-TERRACE-PARITY/A1]: Given DioramaHeritageDistrict rendered with isMobile: true, When inspecting HeritageCathedralGroup and cong-xa-paris-plaza, Then places Cathedral at [0.2, 0, 0.88] with true AABB separation >= 0.15m from plaza [0.2, 0, -0.22] (R=0.55m), preserves 3 stepped cylinderGeometry tiers and forceFallback={true}, and renders parisStatueAndPedestalGeom and parisStreetlampsGeom with COLOR_0 vertexColors', () => {
    const tree = captureTree<DioramaHeritageDistrictProps>(DioramaHeritageDistrict, { isMobile: true });
    const cathedralGroup = findReactNode<MeshNodeProps>(tree, (n) => n.props.name === 'HeritageCathedralGroup');
    const gltfNode = findReactNode(tree, (n) => n.type === SafeGLTFModel);
    const parisPlaza = findReactNode<MeshNodeProps>(tree, (n) => n.props['data-testid'] === 'cong-xa-paris-plaza');
    const plazaMeshes = findReactNodes<MeshNodeProps>(parisPlaza, (n) => n.type === 'mesh');
    const cylinderNodes = findReactNodes(parisPlaza, (n) => n.type === 'cylinderGeometry');
    const plazaVertexColorMats = findReactNodes<MaterialNodeProps>(
      parisPlaza,
      (n) => n.type === 'meshStandardMaterial' && n.props.color === '#FFFFFF' && n.props.vertexColors === true
    );
    const heritageGeoms = getBatchedMobileHeritageGeometries();
    const bounds = computeGeometryBounds(heritageGeoms.cathedralBodyVertexAoGeom);

    const cathedralZ = cathedralGroup?.props.position?.[2] ?? 0;
    const plazaZ = parisPlaza?.props.position?.[2] ?? 0;
    const cathedralMinZ = cathedralZ - bounds.depth * 0.5;
    const plazaMaxZ = plazaZ + 0.55;

    expect([cathedralGroup?.props.position, parisPlaza?.props.position]).toEqual([
      [0.2, 0, 0.88],
      [0.2, 0, -0.22],
    ]);
    expect(cathedralMinZ - plazaMaxZ >= 0.15 && gltfNode?.props.forceFallback === true).toBe(true);
    expect(cylinderNodes.length === 3 && plazaMeshes.length === 5 && plazaVertexColorMats.length === 2).toBe(true);
    expect(
      plazaMeshes.some((m) => m.props.geometry === heritageGeoms.parisStatueAndPedestalGeom) &&
        plazaMeshes.some((m) => m.props.geometry === heritageGeoms.parisStreetlampsGeom) &&
        heritageGeoms.parisStatueAndPedestalGeom.getAttribute('color') !== undefined &&
        heritageGeoms.parisStreetlampsGeom.getAttribute('color') !== undefined
    ).toBe(true);
  });
});
