// @vitest-environment happy-dom
// [TC-404/MSS][IMP-404] Contract Test Suite: Unified RenderTierProfile & Instanced Regional Buildings Pool
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import * as THREE from 'three';
import { sharedR3FHarness } from '../helpers/r3f_test_harness';
import { captureTree, findReactNode, findReactNodes } from '../helpers/threejs_test_utils';
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config';
import { useGameStore } from '../../src/client/store/game_store';
import { useVfxStore, type ActiveSlam } from '../../src/client/store/vfx_store';
import { getBuildingWorldPosition } from '../../src/client/3d/construction_slam_vfx';
import { getRegionalTypology, type RegionalTypology } from '../../src/client/3d/building_typology';
import {
  MOBILE_ARCHETYPES_GLB_URL,
  MOBILE_BUILDING_BLENDER_MESHES,
  resolveRenderTierProfile,
  getMobileArchetypeGeometry,
  getMobileAwningBandGeometry,
  getTypologyAwningTransform,
  disposeMobileArchetypeGeometries,
  type QuantizedVertexColorMeshData,
} from '../../src/client/3d/procedural_mobile_blender_meshes';
import {
  computeRegionalBuildingPoolDescriptors,
  InstancedRegionalBuildingsPool,
  type InstancedRegionalBuildingsPoolProps,
} from '../../src/client/3d/instanced_regional_buildings_pool';
import {
  ProceduralBuilding,
  DefaultBuildingBoxFallback,
  getBuildingLotTransform,
  type ProceduralBuildingProps,
} from '../../src/client/3d/procedural_building';
import { SurveyorPlotBoundary } from '../../src/client/3d/surveyor_plot_boundary';
import { LayeredDioramaTile, type LayeredDioramaTileProps } from '../../src/client/3d/board_tile';
import { GameBoard, type GameBoardProps } from '../../src/client/3d/board_layout';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@react-three/fiber', async () => {
  const { createR3FMock, sharedR3FHarness: harness } = await import('../helpers/r3f_test_harness');
  return createR3FMock(harness);
});

const ALL_TYPOLOGIES: readonly RegionalTypology[] = ['riverine', 'resort', 'heritage', 'metropolis'];
const CORNER_SPLAY_CELLS = [1, 9, 11, 19, 21, 29, 31, 39] as const;
const MID_SIDE_SAMPLE_CELLS = [3, 14, 24, 37] as const;

interface InstancedMeshElementProps {
  readonly ref?: { current: THREE.InstancedMesh | null };
  readonly args?: readonly [THREE.BufferGeometry | undefined, THREE.Material | undefined, number | undefined];
  readonly frustumCulled?: boolean;
  readonly 'data-testid'?: string;
}

interface PoolGroupElementProps {
  readonly 'data-testid'?: string;
  readonly 'data-tier'?: string;
  readonly 'data-max-dpr'?: number;
  readonly 'data-fps-cap'?: string;
  readonly 'data-archetype-glb'?: string;
}

interface MeshElementProps {
  readonly geometry?: THREE.BufferGeometry;
  readonly position?: readonly [number, number, number];
  readonly scale?: readonly [number, number, number];
}

interface MaterialElementProps {
  readonly color?: string;
  readonly vertexColors?: boolean;
  readonly roughness?: number;
  readonly metalness?: number;
}

function computeColorLuminanceRange(colors: Float32Array): number {
  const vertexCount = Math.floor(colors.length / 3);
  if (vertexCount === 0) return 0;
  const luminances = Array.from({ length: vertexCount }, (_, idx) => {
    const r = colors[idx * 3] ?? 0;
    const g = colors[idx * 3 + 1] ?? 0;
    const b = colors[idx * 3 + 2] ?? 0;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  });
  return Math.max(...luminances) - Math.min(...luminances);
}

function computeGeometryHeight(geom: THREE.BufferGeometry): number {
  const posAttr = geom.getAttribute('position');
  if (!posAttr || posAttr.count === 0) return 0;
  geom.computeBoundingBox();
  return geom.boundingBox ? geom.boundingBox.max.y - geom.boundingBox.min.y : 0;
}

function hasInwardRecessedCavity(mesh: QuantizedVertexColorMeshData): boolean {
  const vCount = Math.floor(mesh.positions.length / 3);
  const indices = Array.from({ length: vCount }, (_, i) => i);
  const hasRecessedLintelSoffit = indices.some((i) => {
    const ny = mesh.normals[i * 3 + 1] ?? 0;
    const y = mesh.positions[i * 3 + 1] ?? 0;
    const z = mesh.positions[i * 3 + 2] ?? 0;
    return ny < -0.9 && y > 0.12 && z > 0.14 && z < 0.22;
  });
  const hasRecessedBackWall = indices.some((i) => {
    const nz = mesh.normals[i * 3 + 2] ?? 0;
    const z = mesh.positions[i * 3 + 2] ?? 0;
    const r = mesh.colors[i * 3] ?? 1;
    const g = mesh.colors[i * 3 + 1] ?? 1;
    const b = mesh.colors[i * 3 + 2] ?? 1;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return nz > 0.9 && z > 0.14 && z < 0.215 && lum < 0.35;
  });
  return hasRecessedLintelSoffit && hasRecessedBackWall;
}

describe('IMP-404: Unified RenderTierProfile & Instanced Regional Buildings Pool Contract Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    sharedR3FHarness.reset();
    disposeMobileArchetypeGeometries();
    useVfxStore.getState().clearAllSlams();
    useGameStore.setState({ levelMap: {}, playersInfo: {} });
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
    disposeMobileArchetypeGeometries();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('TC-404.01a [UC-RENDER-TIER-PROFILE-MATRIX/MSS]: Given iOS WebKit TBDR (isMobile: true, isIOS: true) and Android Mobile (isMobile: true, isIOS: false), When calling resolveRenderTierProfile, Then returns IOS_WEBKIT_TBDR (maxDpr 0.82) and ANDROID_MOBILE (maxDpr 1.00) with INSTANCED_POOL_VERTEX_AO, INSTANCED_POOL_SINGLE_MAT, enableOuterBaySanctuaries false, and minVerticalStepMm >= 20', () => {
    const ios = resolveRenderTierProfile({ isMobile: true, isIOS: true });
    const android = resolveRenderTierProfile({ isMobile: true, isIOS: false });

    expect([ios.tierId, android.tierId]).toEqual(['IOS_WEBKIT_TBDR', 'ANDROID_MOBILE']);
    expect([ios.maxDpr, android.maxDpr, ios.activeFpsCap, ios.idleFpsCap]).toEqual([0.82, 1.0, 60, 30]);
    expect([ios.buildingRenderMode, android.buildingRenderMode, ios.monopolyArchwayMode, android.monopolyArchwayMode]).toEqual([
      'INSTANCED_POOL_VERTEX_AO',
      'INSTANCED_POOL_VERTEX_AO',
      'INSTANCED_POOL_SINGLE_MAT',
      'INSTANCED_POOL_SINGLE_MAT',
    ]);
    expect(
      !ios.enableOuterBaySanctuaries &&
        !android.enableOuterBaySanctuaries &&
        ios.enableDominoShockwave &&
        android.enableDominoShockwave &&
        ios.minVerticalStepMm >= 20 &&
        android.minVerticalStepMm >= 20
    ).toBe(true);
  });

  it('TC-404.01b [UC-RENDER-TIER-PROFILE-MATRIX/A1]: Given Desktop iGPU (deviceMemoryGb: 4) and Desktop Ultra (deviceMemoryGb: 16, hardwareConcurrency: 12), When calling resolveRenderTierProfile, Then returns DESKTOP_BALANCED and DESKTOP_ULTRA with relational maxDpr ordering (0.82 < 1.00 < 1.25 < 2.00) and enableOuterBaySanctuaries true', () => {
    const ios = resolveRenderTierProfile({ isMobile: true, isIOS: true });
    const android = resolveRenderTierProfile({ isMobile: true, isIOS: false });
    const balanced = resolveRenderTierProfile({ isMobile: false, deviceMemoryGb: 4, hardwareConcurrency: 4 });
    const ultra = resolveRenderTierProfile({ isMobile: false, deviceMemoryGb: 16, hardwareConcurrency: 12 });

    expect([balanced.tierId, ultra.tierId]).toEqual(['DESKTOP_BALANCED', 'DESKTOP_ULTRA']);
    expect(
      ios.maxDpr < android.maxDpr &&
        android.maxDpr < balanced.maxDpr &&
        balanced.maxDpr < ultra.maxDpr &&
        balanced.maxDpr === 1.25 &&
        ultra.maxDpr === 2.0
    ).toBe(true);
    expect([balanced.buildingRenderMode, ultra.buildingRenderMode, balanced.monopolyArchwayMode, ultra.monopolyArchwayMode]).toEqual([
      'BLENDER_GLB_STANDARD',
      'BLENDER_GLB_PBR_SHADOW',
      'GLB_INSTANCE',
      'GLB_INSTANCE_SHADOW',
    ]);
    expect(
      balanced.enableOuterBaySanctuaries &&
        ultra.enableOuterBaySanctuaries &&
        balanced.enableDominoShockwave &&
        ultra.enableDominoShockwave &&
        ultra.idleFpsCap >= balanced.idleFpsCap &&
        ultra.minVerticalStepMm >= 20
    ).toBe(true);
  });

  it('TC-404.01c [UC-RENDER-TIER-PROFILE-MATRIX/A2]: Given boundary or missing capability inputs (undefined, NaN deviceMemoryGb, or low hardwareConcurrency), When calling resolveRenderTierProfile, Then safely resolves without NaN fields and downgrades low-spec desktop to DESKTOP_BALANCED', () => {
    const defaultProfile = resolveRenderTierProfile();
    const nanRamDesktop = resolveRenderTierProfile({ isMobile: false, deviceMemoryGb: Number.NaN });
    const lowCoresDesktop = resolveRenderTierProfile({ isMobile: false, deviceMemoryGb: 8, hardwareConcurrency: 2 });

    expect(Number.isFinite(defaultProfile.maxDpr) && defaultProfile.maxDpr > 0).toBe(true);
    expect(nanRamDesktop.tierId).toBe('DESKTOP_BALANCED');
    expect(lowCoresDesktop.tierId).toBe('DESKTOP_BALANCED');
    expect(nanRamDesktop.minVerticalStepMm).toBeGreaterThanOrEqual(20);
  });

  it('TC-404.02a [UC-FRAME0-LOWPOLY-TECTONICS-AND-BAKED-AO-ARCHETYPES/MSS]: Given all 4 regional typologies (riverine, resort, heritage, metropolis) and levels 1 | 2, When inspecting MOBILE_BUILDING_BLENDER_MESHES and getMobileArchetypeGeometry, Then synchronously provides BufferGeometry with >= 160 vertices for C1, >= 220 vertices for C2, matching normal/color attributes, and C2 height > C1 height', () => {
    const c1Counts = ALL_TYPOLOGIES.map((t) => getMobileArchetypeGeometry(t, 1).getAttribute('position')?.count ?? 0);
    const c2Counts = ALL_TYPOLOGIES.map((t) => getMobileArchetypeGeometry(t, 2).getAttribute('position')?.count ?? 0);
    const attributesConsistent = ALL_TYPOLOGIES.every((t) => {
      const m1 = MOBILE_BUILDING_BLENDER_MESHES[t].c1;
      const m2 = MOBILE_BUILDING_BLENDER_MESHES[t].c2;
      const g1 = getMobileArchetypeGeometry(t, 1);
      const g2 = getMobileArchetypeGeometry(t, 2);
      return (
        m1.positions.length === m1.normals.length &&
        m1.positions.length === m1.colors.length &&
        m1.indices.length >= 180 &&
        m2.positions.length === m2.normals.length &&
        m2.positions.length === m2.colors.length &&
        m2.indices.length >= 240 &&
        g1.getAttribute('color')?.count === g1.getAttribute('position')?.count &&
        g2.getAttribute('color')?.count === g2.getAttribute('position')?.count
      );
    });
    const c2TallerThanC1 = ALL_TYPOLOGIES.every(
      (t) => computeGeometryHeight(getMobileArchetypeGeometry(t, 2)) > computeGeometryHeight(getMobileArchetypeGeometry(t, 1))
    );

    expect(c1Counts.every((c) => c >= 160)).toBe(true);
    expect(c2Counts.every((c) => c >= 220)).toBe(true);
    expect(attributesConsistent).toBe(true);
    expect(c2TallerThanC1).toBe(true);
  });

  it('TC-404.02b [UC-FRAME0-LOWPOLY-TECTONICS-AND-BAKED-AO-ARCHETYPES/A1]: Given MOBILE_BUILDING_BLENDER_MESHES and MOBILE_ARCHETYPES_GLB_URL across all 4 typologies and levels 1 | 2, When computing vertex COLOR_0 luminance, inward cavity geometry, and regional bounding boxes, Then enforces Baked AO gradient range (max(L) - min(L) >= 0.22), inward-recessed 5-face cavities, and existing .glb asset on disk', () => {
    const glbDiskPath = path.resolve(process.cwd(), 'public', MOBILE_ARCHETYPES_GLB_URL.replace(/^\//, ''));
    const c1Ranges = ALL_TYPOLOGIES.map((t) => computeColorLuminanceRange(MOBILE_BUILDING_BLENDER_MESHES[t].c1.colors));
    const c2Ranges = ALL_TYPOLOGIES.map((t) => computeColorLuminanceRange(MOBILE_BUILDING_BLENDER_MESHES[t].c2.colors));
    const allHaveInwardCavities = ALL_TYPOLOGIES.every(
      (t) => hasInwardRecessedCavity(MOBILE_BUILDING_BLENDER_MESHES[t].c1) && hasInwardRecessedCavity(MOBILE_BUILDING_BLENDER_MESHES[t].c2)
    );
    const distinctC1 = new Set(
      ALL_TYPOLOGIES.map((t) => {
        const g = getMobileArchetypeGeometry(t, 1);
        return `${g.getAttribute('position')?.count ?? 0}:${computeGeometryHeight(g).toFixed(3)}:${(MOBILE_BUILDING_BLENDER_MESHES[t].c1.colors[0] ?? 0).toFixed(3)}`;
      })
    );
    const distinctC2 = new Set(
      ALL_TYPOLOGIES.map((t) => {
        const g = getMobileArchetypeGeometry(t, 2);
        return `${g.getAttribute('position')?.count ?? 0}:${computeGeometryHeight(g).toFixed(3)}:${(MOBILE_BUILDING_BLENDER_MESHES[t].c2.colors[0] ?? 0).toFixed(3)}`;
      })
    );

    expect(fs.existsSync(glbDiskPath) && allHaveInwardCavities).toBe(true);
    expect(c1Ranges.every((r) => r >= 0.22) && c2Ranges.every((r) => r >= 0.22)).toBe(true);
    expect(distinctC1.size).toBe(4);
    expect(distinctC2.size).toBe(4);
  });

  it('TC-404.02c [UC-FRAME0-LOWPOLY-TECTONICS-AND-BAKED-AO-ARCHETYPES/A2]: Given getMobileAwningBandGeometry and getTypologyAwningTransform across all 4 typologies and levels 1 | 2, When inspecting fascia geometry and transforms, Then enforces >= 20mm Z-clearance, positive 3D volumetric thickness (>= 20mm), and distinct typology-aligned yOffsets', () => {
    const awningC1 = getMobileAwningBandGeometry(1);
    const awningC2 = getMobileAwningBandGeometry(2);
    const transforms = ALL_TYPOLOGIES.flatMap((t) => [getTypologyAwningTransform(t, 1), getTypologyAwningTransform(t, 2)]);
    const customStep = getTypologyAwningTransform('riverine', 1, 45);
    const distinctYOffsets = new Set(transforms.map((tr) => tr.yOffset.toFixed(3)));

    expect((awningC1.getAttribute('position')?.count ?? 0) >= 24 && (awningC2.getAttribute('position')?.count ?? 0) >= 24).toBe(true);
    expect(
      transforms.every((tr) => tr.yOffset >= 0.08 && tr.zOffset >= 0.02 && tr.scale[0] >= 0.3 && tr.scale[1] >= 0.02 && tr.scale[2] >= 0.02) &&
        customStep.scale[2] >= 0.045
    ).toBe(true);
    expect(distinctYOffsets.size).toBeGreaterThanOrEqual(3);
    expect(getTypologyAwningTransform('riverine', 2).yOffset !== getTypologyAwningTransform('riverine', 1).yOffset).toBe(true);
  });

  it('TC-404.02d [UC-FRAME0-LOWPOLY-TECTONICS-AND-BAKED-AO-ARCHETYPES/A3]: Given cached mobile archetype and awning geometries, When calling disposeMobileArchetypeGeometries, Then reuses singleton instances before disposal, calls .dispose() on GPU buffers, and allocates fresh instances afterward', () => {
    const riverineC1a = getMobileArchetypeGeometry('riverine', 1);
    const riverineC1b = getMobileArchetypeGeometry('riverine', 1);
    const awningC1a = getMobileAwningBandGeometry(1);
    const awningC1b = getMobileAwningBandGeometry(1);
    const bodyDisposeSpy = vi.spyOn(riverineC1a, 'dispose');
    const awningDisposeSpy = vi.spyOn(awningC1a, 'dispose');

    disposeMobileArchetypeGeometries();
    const riverineC1After = getMobileArchetypeGeometry('riverine', 1);
    const awningC1After = getMobileAwningBandGeometry(1);

    expect(riverineC1a === riverineC1b && awningC1a === awningC1b).toBe(true);
    expect(bodyDisposeSpy).toHaveBeenCalledTimes(1);
    expect(awningDisposeSpy).toHaveBeenCalledTimes(1);
    expect(riverineC1After !== riverineC1a && awningC1After !== awningC1a).toBe(true);
  });

  it('TC-404.03a [UC-POOL-DESCRIPTOR-TRANSFORM-AND-SLAM-SETTLEMENT/MSS]: Given levelMap with C1 and C2 buildings across all 22 property cells (corner-splayed and mid-side), When calling computeRegionalBuildingPoolDescriptors, Then maps exact world positions matching getBuildingWorldPosition, uniform scale 0.975, and typology-aligned awning transforms', () => {
    const levelMap: Record<number, number> = { 1: 1, 3: 2, 9: 1, 11: 2, 14: 1, 19: 2, 21: 1, 24: 2, 29: 1, 31: 2, 37: 1, 39: 2 };
    const descriptors = computeRegionalBuildingPoolDescriptors(levelMap, null, 1000);
    const activeCells = [...CORNER_SPLAY_CELLS, ...MID_SIDE_SAMPLE_CELLS];
    const worldPositionsMatch = activeCells.every((cellIdx) => {
      const desc = descriptors.find((d) => d.cellIndex === cellIdx);
      const expectedWorld = getBuildingWorldPosition(cellIdx);
      const lot = getBuildingLotTransform(cellIdx);
      return Boolean(
        desc &&
          Math.hypot(desc.worldPosition[0] - expectedWorld[0], desc.worldPosition[2] - expectedWorld[2]) < 1e-3 &&
          Math.abs(desc.worldPosition[1] - lot.position[1]) < 1e-3 &&
          desc.scale[0] === 0.975 &&
          desc.scale[1] === 0.975 &&
          desc.scale[2] === 0.975 &&
          desc.typology === getRegionalTypology(cellIdx)
      );
    });
    const awningElevatedAndScaled = activeCells.every((cellIdx) => {
      const desc = descriptors.find((d) => d.cellIndex === cellIdx);
      return Boolean(desc && desc.awningWorldPosition[1] > desc.worldPosition[1] + 0.05 && desc.awningScale[0] > 0.25 && desc.awningScale[1] >= 0.019);
    });

    expect(descriptors).toHaveLength(22);
    expect(worldPositionsMatch).toBe(true);
    expect(awningElevatedAndScaled).toBe(true);
    expect(descriptors.every((d, idx) => d.slotIndex === idx && d.groupColor.startsWith('#'))).toBe(true);
  });

  it('TC-404.03b [UC-POOL-DESCRIPTOR-TRANSFORM-AND-SLAM-SETTLEMENT/A1]: Given levelMap containing unbuilt (level = 0) and Landmark (level = 3, [ADV-01]) properties alongside C1/C2 properties, When calling computeRegionalBuildingPoolDescriptors, Then collapses level 0 and level 3 slots to scale [0, 0, 0] while keeping C1/C2 scaled at 0.975', () => {
    const descriptors = computeRegionalBuildingPoolDescriptors({ 1: 0, 3: 1, 6: 2, 39: 3 }, null, 1000);
    const d0 = descriptors.find((d) => d.cellIndex === 1);
    const d1 = descriptors.find((d) => d.cellIndex === 3);
    const d2 = descriptors.find((d) => d.cellIndex === 6);
    const d3 = descriptors.find((d) => d.cellIndex === 39);

    expect([d0?.scale, d0?.awningScale]).toEqual([[0, 0, 0], [0, 0, 0]]);
    expect([d3?.level, d3?.scale, d3?.awningScale]).toEqual([3, [0, 0, 0], [0, 0, 0]]);
    expect(d1?.scale).toEqual([0.975, 0.975, 0.975]);
    expect(d2?.scale).toEqual([0.975, 0.975, 0.975]);
  });

  it('TC-404.03c [UC-POOL-DESCRIPTOR-TRANSFORM-AND-SLAM-SETTLEMENT/A2]: Given an active construction slam on cell 1 (level = 1), When calling computeRegionalBuildingPoolDescriptors at elapsed = 0ms (drop peak), 410ms (squash), and 650ms (settled), Then modulates worldPosition[1]/scale during slam and settles back to 0.16m and 0.975', () => {
    const activeSlams: Record<number, ActiveSlam> = {
      1: { id: 'slam_1', cellIndex: 1, level: 1, startTime: 1000, durationMs: 1500, impactTimeMs: 380 },
    };
    const atPeak = computeRegionalBuildingPoolDescriptors({ 1: 1 }, activeSlams, 1000).find((d) => d.cellIndex === 1);
    const atSquash = computeRegionalBuildingPoolDescriptors({ 1: 1 }, activeSlams, 1410).find((d) => d.cellIndex === 1);
    const atSettled = computeRegionalBuildingPoolDescriptors({ 1: 1 }, activeSlams, 1650).find((d) => d.cellIndex === 1);

    expect(atPeak?.worldPosition[1] ?? 0).toBeGreaterThan(3.5);
    expect((atSquash?.scale[1] ?? 1) < 0.975 && (atSquash?.scale[0] ?? 0) > 0.975).toBe(true);
    expect(atSettled?.worldPosition[1] ?? 0).toBeCloseTo(0.16, 3);
    expect(atSettled?.scale).toEqual([0.975, 0.975, 0.975]);
  });

  it('TC-404.03d [UC-POOL-DESCRIPTOR-TRANSFORM-AND-SLAM-SETTLEMENT/A3]: Given InstancedRegionalBuildingsPool rendered on Mobile with an active slam on cell 1, When advancing R3F frames through slam impact and clearing activeSlams ([ADV-02]), Then animates instanceMatrix in useSafeFrame and executes wasSlammingRef settlement pass restoring base Y = 0.16m', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    useVfxStore.setState({
      activeSlams: { 1: { id: 'slam_1', cellIndex: 1, level: 1, startTime: 1000, durationMs: 1500, impactTimeMs: 380 } },
    });
    const tree = captureTree<InstancedRegionalBuildingsPoolProps>(InstancedRegionalBuildingsPool, { levelMap: { 1: 1 }, isMobile: true });
    const instancedNodes = findReactNodes<InstancedMeshElementProps>(tree, (n) => n.type === 'instancedMesh');
    const riverineC1Geom = getMobileArchetypeGeometry('riverine', 1);
    const attachedMeshes = instancedNodes.map((node) => {
      const mesh = new THREE.InstancedMesh(node.props.args?.[0] ?? new THREE.BufferGeometry(), new THREE.MeshBasicMaterial(), node.props.args?.[2] ?? 22);
      if (node.props.ref) node.props.ref.current = mesh;
      return { geom: node.props.args?.[0], mesh };
    });
    const targetMesh = attachedMeshes.find((m) => m.geom === riverineC1Geom)?.mesh ?? attachedMeshes[0]?.mesh;

    vi.setSystemTime(1050);
    sharedR3FHarness.advanceFrame(0.016);
    const midAirMat = new THREE.Matrix4();
    const midAirPos = new THREE.Vector3();
    targetMesh?.getMatrixAt(0, midAirMat);
    midAirPos.setFromMatrixPosition(midAirMat);

    useVfxStore.getState().clearAllSlams();
    vi.setSystemTime(1700);
    sharedR3FHarness.advanceFrame(0.016);
    const settledMat = new THREE.Matrix4();
    const settledPos = new THREE.Vector3();
    const settledScale = new THREE.Vector3();
    targetMesh?.getMatrixAt(0, settledMat);
    settledMat.decompose(settledPos, new THREE.Quaternion(), settledScale);

    expect(targetMesh).toBeDefined();
    expect(midAirPos.y).toBeGreaterThan(3.0);
    expect(settledPos.y).toBeCloseTo(0.16, 3);
    expect(settledScale.x).toBeCloseTo(0.975, 3);
  });

  it('TC-404.04a [UC-INSTANCED-POOL-CALLSITE-AND-LEVEL3-DUAL-SEAM-PARITY/MSS]: Given InstancedRegionalBuildingsPool rendered with isMobile: false vs isMobile: true (isIOS: true), When inspecting the component tree, Then returns null on Desktop and mounts instanced-regional-buildings-pool on Mobile with 10 instancedMesh nodes (frustumCulled={false}), IOS_WEBKIT_TBDR tier metadata, and vertexColors', () => {
    const desktopTree = captureTree<InstancedRegionalBuildingsPoolProps>(InstancedRegionalBuildingsPool, { levelMap: { 1: 1, 9: 2 }, isMobile: false });
    const mobileTree = captureTree<InstancedRegionalBuildingsPoolProps>(InstancedRegionalBuildingsPool, { levelMap: { 1: 1, 9: 2 }, isMobile: true, isIOS: true });
    const poolGroup = findReactNode<PoolGroupElementProps>(mobileTree, (n) => n.props['data-testid'] === 'instanced-regional-buildings-pool');
    const instancedNodes = findReactNodes<InstancedMeshElementProps>(mobileTree, (n) => n.type === 'instancedMesh');
    const materials = findReactNodes<MaterialElementProps>(mobileTree, (n) => n.type === 'meshStandardMaterial');

    expect(desktopTree).toBeNull();
    expect([poolGroup?.props['data-tier'], poolGroup?.props['data-max-dpr'], poolGroup?.props['data-fps-cap'], poolGroup?.props['data-archetype-glb']]).toEqual([
      'IOS_WEBKIT_TBDR',
      0.82,
      '60:30',
      MOBILE_ARCHETYPES_GLB_URL,
    ]);
    expect(instancedNodes.length === 10 && instancedNodes.every((n) => n.props.frustumCulled === false)).toBe(true);
    expect(materials.some((m) => m.props.vertexColors === true)).toBe(true);
  });

  it('TC-404.04b [UC-INSTANCED-POOL-CALLSITE-AND-LEVEL3-DUAL-SEAM-PARITY/A1]: Given GameBoard rendered on Mobile iOS (isMobile: true, isIOS: true) with C0 Monopoly plot, C1, C2, and C3 (level = 3) properties ([ADV-01]), When inspecting the board tree, Then forwards isIOS to InstancedRegionalBuildingsPool, suppresses per-tile C1/C2 ProceduralBuilding, and preserves both level = 0 SurveyorPlotBoundary and level = 3 Landmark ProceduralBuilding', () => {
    useGameStore.setState({
      levelMap: { 1: 1, 3: 0, 9: 2, 39: 3 },
      playersInfo: {
        p1: { id: 'p1', name: 'Tycoon', balance: 5000, ownedProperties: [1, 3], tokenColor: '#DC2626', ownerSlot: 0 },
      },
    });
    const boardTree = captureTree<GameBoardProps>(GameBoard, { isMobile: true, isIOS: true });
    const poolNode = findReactNode<InstancedRegionalBuildingsPoolProps>(boardTree, (n) => n.type === InstancedRegionalBuildingsPool);
    const tileNodes = findReactNodes<LayeredDioramaTileProps>(boardTree, (n) => n.type === LayeredDioramaTile);
    const tile1 = tileNodes.find((t) => t.props.cell.index === 1);
    const tile3 = tileNodes.find((t) => t.props.cell.index === 3);
    const tile9 = tileNodes.find((t) => t.props.cell.index === 9);
    const tile39 = tileNodes.find((t) => t.props.cell.index === 39);
    const tile3Tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, tile3?.props);
    const tile3Proc = findReactNode<ProceduralBuildingProps>(tile3Tree, (n) => n.type === ProceduralBuilding);
    const tile3ProcTree = captureTree<ProceduralBuildingProps>(ProceduralBuilding, tile3Proc?.props);
    const surveyorNode = findReactNode(tile3ProcTree, (n) => n.type === SurveyorPlotBoundary);
    const tile39Tree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, tile39?.props);
    const tile39Proc = findReactNode<ProceduralBuildingProps>(tile39Tree, (n) => n.type === ProceduralBuilding);

    expect([poolNode?.props.isMobile, poolNode?.props.isIOS]).toEqual([true, true]);
    expect([
      tile1?.props.renderProceduralBuilding,
      tile3?.props.renderProceduralBuilding,
      tile9?.props.renderProceduralBuilding,
      tile39?.props.renderProceduralBuilding,
    ]).toEqual([false, true, false, true]);
    expect(surveyorNode).not.toBeNull();
    expect(tile39Proc?.props.level).toBe(3);
  });

  it('TC-404.04c [UC-INSTANCED-POOL-CALLSITE-AND-LEVEL3-DUAL-SEAM-PARITY/A2]: Given standalone LayeredDioramaTile and ProceduralBuilding rendered with isMobile: true across levels 1, 2, 3, When inspecting rendered meshes, Then preserves shophouse-mobile-lod and complex-mobile-lod using shared Blender BufferGeometry (<= 2 meshes each) and mounts level 3 even if renderProceduralBuilding={false}', () => {
    const c1Tree = captureTree<ProceduralBuildingProps>(ProceduralBuilding, { level: 1, cellIndex: 1, groupColor: '#92400E', isMobile: true });
    const c2Tree = captureTree<ProceduralBuildingProps>(ProceduralBuilding, { level: 2, cellIndex: 9, groupColor: '#0284C7', isMobile: true });
    const c1LodGroup = findReactNode(c1Tree, (n) => n.props['data-testid'] === 'shophouse-mobile-lod');
    const c2LodGroup = findReactNode(c2Tree, (n) => n.props['data-testid'] === 'complex-mobile-lod');
    const c1Meshes = findReactNodes<MeshElementProps>(c1LodGroup, (n) => n.type === 'mesh');
    const c2Meshes = findReactNodes<MeshElementProps>(c2LodGroup, (n) => n.type === 'mesh');
    const c3TileTree = captureTree<LayeredDioramaTileProps>(LayeredDioramaTile, {
      cell: BOARD_CONFIG.find((c) => c.type === CellType.Property && c.index === 39)!,
      position: [0, 0, 0],
      currentLevel: 3,
      isCornerTile: false,
      isMobile: true,
      renderProceduralBuilding: false,
    });
    const c3Proc = findReactNode<ProceduralBuildingProps>(c3TileTree, (n) => n.type === ProceduralBuilding);
    const c3ProcTree = captureTree<ProceduralBuildingProps>(ProceduralBuilding, c3Proc?.props);
    const c3Crown = findReactNode(c3ProcTree, (n) => n.props['data-testid'] === 'landmark-crown');

    expect(
      c1LodGroup?.props['data-typology'] === 'riverine' &&
        c1Meshes.length === 2 &&
        c1Meshes.some((m) => m.props.geometry === getMobileArchetypeGeometry('riverine', 1))
    ).toBe(true);
    expect(
      c2LodGroup?.props['data-typology'] === 'resort' &&
        c2Meshes.length === 2 &&
        c2Meshes.some((m) => m.props.geometry === getMobileArchetypeGeometry('resort', 2))
    ).toBe(true);
    expect(c3Crown).not.toBeNull();
  });

  it('TC-404.04d [UC-INSTANCED-POOL-CALLSITE-AND-LEVEL3-DUAL-SEAM-PARITY/A3]: Given DefaultBuildingBoxFallback and InstancedRegionalBuildingsPool lifecycle, When unmounting on Desktop vs Mobile, Then preserves cached geometries on Desktop unmount and disposes them only on active Mobile pool unmount', () => {
    const fb1 = captureTree(DefaultBuildingBoxFallback, { groupColor: '#10B981', level: 1 });
    const fb3 = captureTree(DefaultBuildingBoxFallback, { groupColor: '#F59E0B', level: 3 });
    const fb1Meshes = findReactNodes<MeshElementProps>(fb1, (n) => n.type === 'mesh');
    const fb1Mat = findReactNode<MaterialElementProps>(fb1, (n) => n.type === 'meshStandardMaterial');
    const fb3Meshes = findReactNodes<MeshElementProps>(fb3, (n) => n.type === 'mesh');

    const cachedGeom = getMobileArchetypeGeometry('riverine', 1);
    const disposeSpy = vi.spyOn(cachedGeom, 'dispose');
    act(() => {
      root?.render(React.createElement(InstancedRegionalBuildingsPool, { levelMap: { 1: 1 }, isMobile: false }));
    });
    act(() => {
      root?.unmount();
    });
    const disposedOnDesktop = disposeSpy.mock.calls.length;

    root = createRoot(container!);
    act(() => {
      root?.render(React.createElement(InstancedRegionalBuildingsPool, { levelMap: { 1: 1 }, isMobile: true }));
    });
    act(() => {
      root?.unmount();
      root = null;
    });

    expect(fb1Meshes.length === 1 && fb1Mat?.props.color === '#10B981').toBe(true);
    expect((fb3Meshes[0]?.props.position?.[1] ?? 0) > (fb1Meshes[0]?.props.position?.[1] ?? 0)).toBe(true);
    expect(disposedOnDesktop).toBe(0);
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });
});
