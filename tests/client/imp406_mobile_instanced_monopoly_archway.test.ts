// @vitest-environment happy-dom
// [TC-406/MSS][IMP-406] Contract Test Suite: Mobile Instanced Monopoly Archways, Auto-TTL Domino Shockwave & Mature Financial Lexicon
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import * as THREE from 'three';
import { sharedR3FHarness } from '../helpers/r3f_test_harness';
import { captureTree, findReactNode } from '../helpers/threejs_test_utils';
import { ColorGroup } from '../../src/domain/board_config';
import { BotPosture } from '../../src/domain/bot/index';
import { useGameStore, type PlayerHudInfo } from '../../src/client/store/game_store';
import { useVfxStore, type ActiveSlam } from '../../src/client/store/vfx_store';
import { SafeGLTFModel } from '../../src/client/3d/asset_loader/safe_gltf_model';
import { cellPosition } from '../../src/client/3d/board_coords';
import type { MonopolyGroupInfo } from '../../src/client/3d/monopoly_plaza_math';
import {
  MONOPOLY_ARCHWAY_BASE_DIMENSIONS, getMonopolyBoulevardSegments, type MonopolySegmentDescriptor,
} from '../../src/client/3d/monopoly_plaza_visuals';
import {
  MAX_MONOPOLY_ARCHWAY_SLOTS, MAX_MONOPOLY_PROMENADE_SLOTS, getCircularCellDistance,
  calculateDominoRippleTransform, resolveNeighborDominoSlam, resolveMobilePoolDominoSlam,
  getMobileMonopolyArchwayGeometry, getMobileMonopolyPromenadeSlotGeometry,
  computeMobileMonopolyArchwayPoolSlots, computeMobileMonopolyPromenadePoolSlots,
  disposeMobileMonopolyArchwayGeometries,
} from '../../src/client/3d/monopoly_mobile_archway_visuals';
import { MonopolyPlazaFusion, type MonopolyPlazaFusionProps } from '../../src/client/3d/monopoly_plaza_fusion';
import { GameBoard, type GameBoardProps } from '../../src/client/3d/board_layout';
import {
  resolveTycoonDiplomacyPosture, getTycoonDiplomacyHaloDescriptors,
  createDiplomacySpeechBubbleTexture, disposeDiplomacySpeechBubbleTextures,
} from '../../src/client/3d/war_room_stage_visuals';
import { WarRoomStageLayer, type WarRoomStageLayerProps } from '../../src/client/3d/war_room_stage_layer';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@react-three/fiber', async () => {
  const { createR3FMock, sharedR3FHarness: harness } = await import('../helpers/r3f_test_harness');
  return createR3FMock(harness);
});

const RED_MONOPOLY: MonopolyGroupInfo = { colorGroup: ColorGroup.Do, ownerId: 'p1', ownerColor: '#EF4444', ownerName: 'Chủ Tịch Sài Gòn', cells: [21, 23, 24] };
const BROWN_MONOPOLY: MonopolyGroupInfo = { colorGroup: ColorGroup.Nau, ownerId: 'p1', ownerColor: '#92400E', ownerName: 'Chủ Tịch Sài Gòn', cells: [1, 3] };
const PURPLE_MONOPOLY: MonopolyGroupInfo = { colorGroup: ColorGroup.Tim, ownerId: 'p2', ownerColor: '#3B82F6', ownerName: 'Đại Gia Hà Nội', cells: [37, 39] };

const ALL_EIGHT_MONOPOLIES: Record<string, MonopolyGroupInfo> = {
  [ColorGroup.Nau]: BROWN_MONOPOLY,
  [ColorGroup.XanhDaTroi]: { colorGroup: ColorGroup.XanhDaTroi, ownerId: 'p1', ownerColor: '#0284C7', ownerName: 'Chủ Tịch Sài Gòn', cells: [6, 8, 9] },
  [ColorGroup.Hong]: { colorGroup: ColorGroup.Hong, ownerId: 'p2', ownerColor: '#DB2777', ownerName: 'Đại Gia Hà Nội', cells: [11, 13, 14] },
  [ColorGroup.Cam]: { colorGroup: ColorGroup.Cam, ownerId: 'p2', ownerColor: '#EA580C', ownerName: 'Đại Gia Hà Nội', cells: [16, 18, 19] },
  [ColorGroup.Do]: RED_MONOPOLY,
  [ColorGroup.Vang]: { colorGroup: ColorGroup.Vang, ownerId: 'p1', ownerColor: '#F59E0B', ownerName: 'Chủ Tịch Sài Gòn', cells: [26, 27, 29] },
  [ColorGroup.XanhLa]: { colorGroup: ColorGroup.XanhLa, ownerId: 'p1', ownerColor: '#10B981', ownerName: 'Chủ Tịch Sài Gòn', cells: [31, 32, 34] },
  [ColorGroup.Tim]: PURPLE_MONOPOLY,
};

const DIPLOMACY_PLAYERS: Readonly<Record<string, PlayerHudInfo>> = {
  p1: { id: 'p1', name: 'P1', balance: 35000, tokenColor: '#F59E0B', ownerSlot: 0, ownedProperties: [] },
  p2: { id: 'p2', name: 'P2', balance: 15000, tokenColor: '#10B981', ownerSlot: 1, ownedProperties: [] },
  p3: { id: 'p3', name: 'P3', balance: 7500, tokenColor: '#38BDF8', ownerSlot: 2, ownedProperties: [] },
  p4: { id: 'p4', name: 'P4', balance: 2500, tokenColor: '#EF4444', ownerSlot: 3, ownedProperties: [] },
};

interface InstancedMeshElementProps {
  readonly ref?: { current: THREE.InstancedMesh | null };
  readonly args?: readonly [THREE.BufferGeometry | undefined, THREE.Material | undefined, number | undefined];
  readonly frustumCulled?: boolean;
  readonly 'data-testid'?: string;
}

interface MaterialElementProps {
  readonly color?: string;
  readonly vertexColors?: boolean;
  readonly roughness?: number;
  readonly metalness?: number;
}

function toSegmentLocalCoords(
  seg: MonopolySegmentDescriptor, worldPoint: readonly [number, number, number]
): { readonly localX: number; readonly localZ: number } {
  const count = Math.max(1, seg.cells.length);
  const sum = seg.cells.reduce((acc, cellIdx) => {
    const pos = cellPosition(cellIdx);
    return { x: acc.x + pos[0], z: acc.z + pos[2] };
  }, { x: 0, z: 0 });
  const dx = worldPoint[0] - sum.x / count;
  const dz = worldPoint[2] - sum.z / count;
  const cos = Math.cos(seg.rotationY);
  const sin = Math.sin(seg.rotationY);
  return { localX: dx * cos - dz * sin, localZ: dx * sin + dz * cos };
}

function computeGeometryDimensions(geom: THREE.BufferGeometry): {
  readonly width: number; readonly height: number; readonly depth: number;
} {
  const posAttr = geom.getAttribute('position');
  if (!posAttr || posAttr.count === 0) return { width: 0, height: 0, depth: 0 };
  geom.computeBoundingBox();
  const box = geom.boundingBox;
  if (!box) return { width: 0, height: 0, depth: 0 };
  return {
    width: Number((box.max.x - box.min.x).toFixed(4)),
    height: Number((box.max.y - box.min.y).toFixed(4)),
    depth: Number((box.max.z - box.min.z).toFixed(4)),
  };
}

function computeColorLuminanceRange(geom: THREE.BufferGeometry): number {
  const colorAttr = geom.getAttribute('color');
  if (!colorAttr || colorAttr.count === 0) return 0;
  const luminances = Array.from({ length: colorAttr.count }, (_, idx) => (
    0.2126 * colorAttr.getX(idx) + 0.7152 * colorAttr.getY(idx) + 0.0722 * colorAttr.getZ(idx)
  ));
  return Math.max(...luminances) - Math.min(...luminances);
}

function computeFrontSurfaceDepthAtXY(geom: THREE.BufferGeometry, px: number, py: number): number {
  const pos = geom.getAttribute('position');
  const idx = geom.getIndex();
  if (!pos || !idx) return -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < idx.count; i += 3) {
    const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2);
    const minX = Math.min(pos.getX(a), pos.getX(b), pos.getX(c));
    const maxX = Math.max(pos.getX(a), pos.getX(b), pos.getX(c));
    const minY = Math.min(pos.getY(a), pos.getY(b), pos.getY(c));
    const maxY = Math.max(pos.getY(a), pos.getY(b), pos.getY(c));
    const triZ = Math.max(pos.getZ(a), pos.getZ(b), pos.getZ(c));
    if (triZ > 0 && px > minX + 1e-4 && px < maxX - 1e-4 && py > minY + 1e-4 && py < maxY - 1e-4) {
      maxZ = Math.max(maxZ, triZ);
    }
  }
  return Number(maxZ.toFixed(4));
}

describe('IMP-406: Mobile Instanced Monopoly Archways, Auto-TTL Domino Shockwave & Mature Financial Lexicon Contract Suite', () => {
  const originalPreload = SafeGLTFModel.preload;
  let preloadedUrls: string[] = [];
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    preloadedUrls = [];
    SafeGLTFModel.preload = (url: string): void => {
      preloadedUrls.push(url);
      originalPreload(url);
    };
    sharedR3FHarness.reset();
    disposeMobileMonopolyArchwayGeometries();
    disposeDiplomacySpeechBubbleTextures();
    useVfxStore.getState().clearAllSlams();
    useVfxStore.getState().clearScreenShake();
    useGameStore.setState({ levelMap: {}, playersInfo: {} });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) act(() => { root?.unmount(); });
    if (container?.parentNode) container.parentNode.removeChild(container);
    container = null;
    root = null;
    SafeGLTFModel.preload = originalPreload;
    disposeMobileMonopolyArchwayGeometries();
    disposeDiplomacySpeechBubbleTextures();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('TC-406.01a [UC-MOBILE-ARCHWAY-AND-16SLOT-PROMENADE-POOL-MATRICES/MSS]: Given 0 (null or {}) and 1 monopoly group (Do [21,23,24]), When calling computeMobileMonopolyArchwayPoolSlots and computeMobileMonopolyPromenadePoolSlots, Then returns fixed 8-slot and 16-slot arrays with centered 2-cell archway (localX = 0, localZ = -1.24m, scale [1.25, 1.25, 1.25]) and promenade width scales 1.68 vs 3.48', () => {
    const emptyArch = computeMobileMonopolyArchwayPoolSlots(null);
    const emptyProm = computeMobileMonopolyPromenadePoolSlots({});
    const redArch = computeMobileMonopolyArchwayPoolSlots({ [ColorGroup.Do]: RED_MONOPOLY });
    const redProm = computeMobileMonopolyPromenadePoolSlots({ [ColorGroup.Do]: RED_MONOPOLY });
    const redSegs = getMonopolyBoulevardSegments({ [ColorGroup.Do]: RED_MONOPOLY });
    const primarySeg = redSegs.find((s) => s.isPrimaryArchwaySegment);
    const arch0 = redArch[0];
    const archLocal = primarySeg && arch0 ? toSegmentLocalCoords(primarySeg, arch0.position) : { localX: 99, localZ: 99 };

    expect([MAX_MONOPOLY_ARCHWAY_SLOTS, MAX_MONOPOLY_PROMENADE_SLOTS, emptyArch.length, emptyProm.length]).toEqual([8, 16, 8, 16]);
    expect(
      emptyArch.every((s, idx) => s.slotIndex === idx && !s.active && s.scale.every((v) => v === 0)) &&
      emptyProm.every((s, idx) => s.slotIndex === idx && !s.active && s.scale.every((v) => v === 0))
    ).toBe(true);
    expect([
      arch0?.active, arch0?.colorGroup, arch0?.ownerColor, arch0?.scale,
      Math.abs(archLocal.localX) < 1e-3 && Math.abs(archLocal.localZ - -1.24) < 1e-3,
      redArch.slice(1).every((s) => !s.active && s.scale.every((v) => v === 0)),
    ]).toEqual([true, ColorGroup.Do, '#EF4444', [1.25, 1.25, 1.25], true, true]);
    expect([
      redProm[0]?.active, redProm[0]?.scale, redProm[1]?.active, redProm[1]?.scale,
      redProm.slice(2).every((s) => !s.active && s.scale.every((v) => v === 0)),
    ]).toEqual([true, [1.68, 1, 1], true, [3.48, 1, 1], true]);
  });

  it('TC-406.01b [UC-MOBILE-ARCHWAY-AND-16SLOT-PROMENADE-POOL-MATRICES/A1]: Given 2 2-cell monopolies (Nau [1,3] + Tim [37,39]) and all 8 color groups simultaneously ([ADV-01]), When calling computeMobileMonopolyArchwayPoolSlots and computeMobileMonopolyPromenadePoolSlots, Then offsets 1-cell archways to localX = -0.56m with scale [0.75, 1.15, 1.15] and populates all 8 archway slots + all 16 promenade slots at full capacity', () => {
    const twoGroupInput = { [ColorGroup.Nau]: BROWN_MONOPOLY, [ColorGroup.Tim]: PURPLE_MONOPOLY };
    const twoArch = computeMobileMonopolyArchwayPoolSlots(twoGroupInput);
    const twoSegs = getMonopolyBoulevardSegments(twoGroupInput).filter((s) => s.isPrimaryArchwaySegment);
    const brownLocal = twoSegs[0] && twoArch[0] ? toSegmentLocalCoords(twoSegs[0], twoArch[0].position) : { localX: 0, localZ: 0 };
    const purpleLocal = twoSegs[1] && twoArch[1] ? toSegmentLocalCoords(twoSegs[1], twoArch[1].position) : { localX: 0, localZ: 0 };
    const fullArch = computeMobileMonopolyArchwayPoolSlots(ALL_EIGHT_MONOPOLIES);
    const fullProm = computeMobileMonopolyPromenadePoolSlots(ALL_EIGHT_MONOPOLIES);

    expect([twoArch[0]?.active, twoArch[0]?.scale, twoArch[1]?.active, twoArch[1]?.scale]).toEqual([
      true, [0.75, 1.15, 1.15], true, [0.75, 1.15, 1.15],
    ]);
    expect(
      Math.abs(brownLocal.localX - -0.56) < 1e-3 && Math.abs(brownLocal.localZ - -1.24) < 1e-3 &&
      Math.abs(purpleLocal.localX - -0.56) < 1e-3 && Math.abs(purpleLocal.localZ - -1.24) < 1e-3
    ).toBe(true);
    expect(
      fullArch.length === 8 &&
      fullArch.every((s, idx) => s.slotIndex === idx && s.active && s.scale[0] > 0 && s.position[1] === 0.118)
    ).toBe(true);
    expect(
      fullProm.length === 16 &&
      fullProm.every((s, idx) => s.slotIndex === idx && s.active && (s.scale[0] === 1.68 || s.scale[0] === 3.48) && s.scale[1] === 1 && s.scale[2] === 1)
    ).toBe(true);
  });

  it('TC-406.02a [UC-FRAME0-ARCHWAY-GEOMETRY-AND-MATURE-LEXICON/MSS]: Given getMobileMonopolyArchwayGeometry, getMobileMonopolyPromenadeSlotGeometry, and disposeMobileMonopolyArchwayGeometries, When called synchronously at Frame 0, Then returns cached BufferGeometry singletons with unoccluded 5-face recessed cavities (front Z = 0.038m at pillar center and 0.048m at lintel center), base dimensions 0.72m x 0.68m x 0.14m, and promenade thickness 0.024m >= 20mm', () => {
    const archGeomA = getMobileMonopolyArchwayGeometry();
    const archGeomB = getMobileMonopolyArchwayGeometry();
    const promGeomA = getMobileMonopolyPromenadeSlotGeometry();
    const promGeomB = getMobileMonopolyPromenadeSlotGeometry();
    const archDims = computeGeometryDimensions(archGeomA);
    const promDims = computeGeometryDimensions(promGeomA);
    const vertexCount = archGeomA.getAttribute('position')?.count ?? 0;
    const normalCount = archGeomA.getAttribute('normal')?.count ?? 0;
    const colorCount = archGeomA.getAttribute('color')?.count ?? 0;
    const lumRange = computeColorLuminanceRange(archGeomA);
    const pillarCavityFrontZ = computeFrontSurfaceDepthAtXY(archGeomA, -0.27, 0.28);
    const lintelCavityFrontZ = computeFrontSurfaceDepthAtXY(archGeomA, 0, 0.55);
    const archDisposeSpy = vi.spyOn(archGeomA, 'dispose');
    const promDisposeSpy = vi.spyOn(promGeomA, 'dispose');

    disposeMobileMonopolyArchwayGeometries();
    const archGeomAfter = getMobileMonopolyArchwayGeometry();
    const promGeomAfter = getMobileMonopolyPromenadeSlotGeometry();

    expect(archGeomA === archGeomB && promGeomA === promGeomB).toBe(true);
    expect(
      vertexCount >= 96 && normalCount === vertexCount && colorCount === vertexCount &&
      lumRange >= 0.22 && pillarCavityFrontZ === 0.038 && lintelCavityFrontZ === 0.048 &&
      Math.abs(archDims.width - MONOPOLY_ARCHWAY_BASE_DIMENSIONS.width) <= 0.02 &&
      Math.abs(archDims.height - MONOPOLY_ARCHWAY_BASE_DIMENSIONS.height) <= 0.02 &&
      Math.abs(archDims.depth - MONOPOLY_ARCHWAY_BASE_DIMENSIONS.depth) <= 0.02
    ).toBe(true);
    expect(
      Math.abs(promDims.width - 1.0) <= 0.01 && Math.abs(promDims.height - 0.024) <= 0.002 &&
      promDims.height >= 0.02 && Math.abs(promDims.depth - 0.16) <= 0.01
    ).toBe(true);
    expect([
      archDisposeSpy.mock.calls.length, promDisposeSpy.mock.calls.length,
      archGeomAfter !== archGeomA && promGeomAfter !== promGeomA,
    ]).toEqual([1, 1, true]);
  });

  it('TC-406.02b [UC-FRAME0-ARCHWAY-GEOMETRY-AND-MATURE-LEXICON/A1]: Given resolveTycoonDiplomacyPosture, getTycoonDiplomacyHaloDescriptors, createDiplomacySpeechBubbleTexture, and WarRoomStageLayer (Option B showSpeechBubbles default false vs true), When resolving diplomacy slogans, HUD-safe bubbleWorldPosition coordinates, and nameplate visibility, Then maps to institutional financial lexicon onto #0F172A background and hides floating billboards by default while mounting diegetic 3D halo rings', () => {
    const p1 = resolveTycoonDiplomacyPosture('p1', DIPLOMACY_PLAYERS);
    const p2 = resolveTycoonDiplomacyPosture('p2', DIPLOMACY_PLAYERS);
    const p3 = resolveTycoonDiplomacyPosture('p3', DIPLOMACY_PLAYERS);
    const p4 = resolveTycoonDiplomacyPosture('p4', DIPLOMACY_PLAYERS);
    const halos = getTycoonDiplomacyHaloDescriptors(DIPLOMACY_PLAYERS);
    const startupHalos = getTycoonDiplomacyHaloDescriptors();
    const tex = createDiplomacySpeechBubbleTexture('👑 Vị Thế Chi Phối', '#F59E0B', 'MONOPOLY_OVERLORD');
    const allSlogansJoined = [...halos.map((h) => h.viSlogan), ...startupHalos.map((h) => h.viSlogan)].join(' | ');
    const defaultTree = captureTree<WarRoomStageLayerProps>(WarRoomStageLayer, { isMobile: false, playersInfo: DIPLOMACY_PLAYERS });
    const enabledTree = captureTree<WarRoomStageLayerProps>(WarRoomStageLayer, { isMobile: false, playersInfo: DIPLOMACY_PLAYERS, showSpeechBubbles: true });
    const defaultBubbleGroup = findReactNode<{ readonly visible?: boolean }>(defaultTree, (n) => n.type === 'group' && n.props.visible === false);
    const enabledBubbleGroup = findReactNode<{ readonly visible?: boolean }>(enabledTree, (n) => n.type === 'group' && n.props.visible === true);

    expect([p1.viSlogan, p2.viSlogan, p3.viSlogan, p4.viSlogan]).toEqual([
      'Vị Thế Chi Phối', 'Tích Lũy Tài Sản', 'Bảo Toàn Thanh Khoản', 'Tái Cơ Cấu Vốn',
    ]);
    expect(halos.map((h) => h.bubbleWorldPosition)).toEqual([
      [-10.85, 1.48, 2.55], [-10.35, 1.48, 5.55], [-0.15, 1.48, -8.65], [-0.35, 1.48, 11.95],
    ]);
    expect(
      !allSlogansJoined.includes('Bá Chủ Độc Quyền') && !allSlogansJoined.includes('Mở Rộng Đế Chế') &&
      !allSlogansJoined.includes('Phòng Thủ Vốn') && !allSlogansJoined.includes('Cứu Thanh Khoản') &&
      defaultBubbleGroup !== null && enabledBubbleGroup !== null
    ).toBe(true);
    expect([p1.posture, tex.userData.renderedText, tex.userData.backgroundHex]).toEqual([BotPosture.Leading, 'Vị Thế Chi Phối', '#0F172A']);
  });

  it('TC-406.03a [UC-MOBILE-AUTO-TTL-DOMINO-SHOCKWAVE-AND-SETTLEMENT/MSS]: Given getCircularCellDistance, calculateDominoRippleTransform, resolveNeighborDominoSlam, and resolveMobilePoolDominoSlam, When evaluating perimeter wrap-around, wave attenuation (d = 1 > d = 2 > d = 4), and Mobile vs Desktop slam resolution, Then preserves resolveNeighborDominoSlam(..., true) === null and resolves active neighbor slams within 1 <= d <= 4 and < 900ms via resolveMobilePoolDominoSlam', () => {
    const nowMs = 5000;
    const activeSlams: Record<number, ActiveSlam> = {
      23: { id: 'expired_23', cellIndex: 23, level: 2, startTime: 3500, durationMs: 1500, impactTimeMs: 380 },
      21: { id: 'fresh_21', cellIndex: 21, level: 1, startTime: 4400, durationMs: 1500, impactTimeMs: 380 },
    };
    const peakD1 = calculateDominoRippleTransform(1, 65 + 45);
    const peakD2 = calculateDominoRippleTransform(2, 130 + 45);
    const peakD4 = calculateDominoRippleTransform(4, 260 + 45);
    const settledAt900 = calculateDominoRippleTransform(1, 900);
    const mobileNeighborLegacy = resolveNeighborDominoSlam(24, activeSlams, true, nowMs);
    const mobilePoolHit = resolveMobilePoolDominoSlam(24, activeSlams, nowMs);
    const mobilePoolRejected =
      resolveMobilePoolDominoSlam(21, activeSlams, nowMs) === null &&
      resolveMobilePoolDominoSlam(35, activeSlams, nowMs) === null &&
      resolveMobilePoolDominoSlam(24, activeSlams, 6000) === null;

    expect([getCircularCellDistance(39, 1), getCircularCellDistance(-1, 5)]).toEqual([2, Infinity]);
    expect(peakD1.yOffset > peakD2.yOffset && peakD2.yOffset > peakD4.yOffset && peakD4.yOffset > 0 && settledAt900.isSettled).toBe(true);
    expect([mobileNeighborLegacy, mobilePoolHit?.slam.cellIndex, mobilePoolHit?.distanceInCells]).toEqual([null, 21, 3]);
    expect(mobilePoolRejected).toBe(true);
  });

  it('TC-406.03b [UC-MOBILE-AUTO-TTL-DOMINO-SHOCKWAVE-AND-SETTLEMENT/A1]: Given an active slam at cell 23 on Mobile and Desktop MonopolyPlazaFusion, When calling computeMobileMonopolyArchwayPoolSlots and advancing useSafeFrame across wave peak (< 900ms), negative half-cycle (275ms), and post-TTL (>= 900ms, [ADV-02], [ADV-04]), Then modulates position[1]/scale[1]/pitchX with minimum distanceInCells attenuation during < 900ms and executes the wasRipplingRef settlement pass at >= 900ms', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const slamAt23: Record<number, ActiveSlam> = {
      23: { id: 'slam_23', cellIndex: 23, level: 1, startTime: 1000, durationMs: 1500, impactTimeMs: 380 },
    };
    const peakSlots = computeMobileMonopolyArchwayPoolSlots({ [ColorGroup.Do]: RED_MONOPOLY }, slamAt23, 1000 + 380 + 110);
    const negCycleSlots = computeMobileMonopolyArchwayPoolSlots({ [ColorGroup.Do]: RED_MONOPOLY }, slamAt23, 1000 + 380 + 275);
    const settledSlots = computeMobileMonopolyArchwayPoolSlots({ [ColorGroup.Do]: RED_MONOPOLY }, slamAt23, 1000 + 380 + 950);

    useVfxStore.setState({ activeSlams: slamAt23 });
    const tree = captureTree<MonopolyPlazaFusionProps>(MonopolyPlazaFusion, {
      monopolyGroups: { [ColorGroup.Do]: RED_MONOPOLY }, isMobile: true, enableMobileInstancedPool: true,
    });
    const archNode = findReactNode<InstancedMeshElementProps>(tree, (n) => n.props['data-testid'] === 'mobile-instanced-monopoly-archways');
    const archMesh = new THREE.InstancedMesh(getMobileMonopolyArchwayGeometry(), new THREE.MeshBasicMaterial(), MAX_MONOPOLY_ARCHWAY_SLOTS);
    if (archNode?.props.ref) archNode.props.ref.current = archMesh;

    vi.setSystemTime(1000 + 380 + 110);
    sharedR3FHarness.advanceFrame(0.016);
    const activeMat = new THREE.Matrix4(), activePos = new THREE.Vector3(), activeQuat = new THREE.Quaternion(), activeScale = new THREE.Vector3();
    archMesh.getMatrixAt(0, activeMat);
    activeMat.decompose(activePos, activeQuat, activeScale);

    vi.setSystemTime(1000 + 380 + 275);
    sharedR3FHarness.advanceFrame(0.016);

    vi.setSystemTime(1000 + 380 + 950);
    sharedR3FHarness.advanceFrame(0.016);
    const settledMat = new THREE.Matrix4(), settledPos = new THREE.Vector3(), settledQuat = new THREE.Quaternion(), settledScale = new THREE.Vector3();
    archMesh.getMatrixAt(0, settledMat);
    settledMat.decompose(settledPos, settledQuat, settledScale);

    const desktopTree = captureTree<MonopolyPlazaFusionProps>(MonopolyPlazaFusion, {
      monopolyGroups: { [ColorGroup.Do]: RED_MONOPOLY }, isMobile: false,
    });
    const desktopGroup = new THREE.Group();
    const desktopRoot = findReactNode<{ readonly ref?: { current: THREE.Group | null } }>(desktopTree, (n) => n.props.name === 'MonopolyPlazaFusionGroup');
    if (desktopRoot?.props.ref) desktopRoot.props.ref.current = desktopGroup;
    vi.setSystemTime(1000 + 380 + 110);
    sharedR3FHarness.advanceFrame(0.016);
    const desktopActiveRotX = desktopGroup.rotation.x, desktopActivePosY = desktopGroup.position.y;
    vi.setSystemTime(1000 + 380 + 950);
    sharedR3FHarness.advanceFrame(0.016);
    const desktopSettledRotX = desktopGroup.rotation.x;

    expect(
      (peakSlots[0]?.position[1] ?? 0) > 0.118 && (peakSlots[0]?.scale[1] ?? 0) > 1.25 &&
      (peakSlots[0]?.pitchX ?? 0) !== 0 && negCycleSlots[0]?.position[1] === 0.118 && (negCycleSlots[0]?.pitchX ?? 0) !== 0
    ).toBe(true);
    expect([settledSlots[0]?.position[1], settledSlots[0]?.pitchX, settledSlots[0]?.scale]).toEqual([0.118, 0, [1.25, 1.25, 1.25]]);
    expect(
      activePos.y > 0.118 && activeScale.y > 1.25 && Math.abs(activeQuat.z) > 1e-4 &&
      Math.abs(desktopActiveRotX) > 1e-4 && Math.abs(desktopActivePosY - calculateDominoRippleTransform(1, 110).yOffset) < 1e-5 &&
      desktopSettledRotX === 0
    ).toBe(true);
    expect(Math.abs(settledPos.y - 0.118) < 1e-3 && Math.abs(settledScale.y - 1.25) < 1e-3 && Math.abs(settledQuat.z) < 1e-4).toBe(true);
  });

  it('TC-406.04a [UC-MOBILE-FUSION-CALLSITE-AND-TC401-PARITY/MSS]: Given GameBoard and MonopolyPlazaFusion on Mobile (isMobile: true), When enableMobileInstancedPool is omitted/false (standalone default) vs wired from GameBoard, Then standalone MonopolyPlazaFusion returns null (preserving TC-401.04c) while GameBoard passes isMobile={true} and enableMobileInstancedPool={true}', () => {
    useGameStore.setState({
      playersInfo: { p1: { id: 'p1', name: 'P1', balance: 1500, tokenColor: '#EF4444', ownedProperties: [21, 23, 24] } },
    });
    const standaloneMobileTree = captureTree<MonopolyPlazaFusionProps>(MonopolyPlazaFusion, {
      monopolyGroups: { [ColorGroup.Do]: RED_MONOPOLY }, isMobile: true,
    });
    const mobileBoardTree = captureTree<GameBoardProps>(GameBoard, { isMobile: true });
    const fusionInMobileBoard = findReactNode<MonopolyPlazaFusionProps>(mobileBoardTree, (n) => n.type === MonopolyPlazaFusion);
    const desktopBoardTree = captureTree<GameBoardProps>(GameBoard, { isMobile: false });
    const fusionInDesktopBoard = findReactNode<MonopolyPlazaFusionProps>(desktopBoardTree, (n) => n.type === MonopolyPlazaFusion);

    expect(standaloneMobileTree).toBeNull();
    expect(preloadedUrls).toHaveLength(0);
    expect([fusionInMobileBoard?.props.isMobile, fusionInMobileBoard?.props.enableMobileInstancedPool]).toEqual([true, true]);
    expect([fusionInDesktopBoard?.props.isMobile, fusionInDesktopBoard?.props.enableMobileInstancedPool]).toEqual([false, false]);
  });

  it('TC-406.04b [UC-MOBILE-FUSION-CALLSITE-AND-TC401-PARITY/A1]: Given MonopolyPlazaFusion rendered on Mobile with enableMobileInstancedPool={true}, When inspecting the component tree and transitioning from {} to an active monopoly, Then mounts mobile-instanced-monopoly-archways (8 slots, frustumCulled={false}, vertexColors) and mobile-instanced-monopoly-promenades (16 slots, frustumCulled={false}), triggers triggerConstructionSlam, calls 0 SafeGLTFModel.preload, and disposes geometries on unmount', () => {
    const mobilePoolTree = captureTree<MonopolyPlazaFusionProps>(MonopolyPlazaFusion, {
      monopolyGroups: { [ColorGroup.Do]: RED_MONOPOLY }, isMobile: true, enableMobileInstancedPool: true,
    });
    const plazaGroup = findReactNode(mobilePoolTree, (n) => n.props['data-testid'] === 'mobile-instanced-monopoly-plaza');
    const archNode = findReactNode<InstancedMeshElementProps>(mobilePoolTree, (n) => n.props['data-testid'] === 'mobile-instanced-monopoly-archways');
    const promNode = findReactNode<InstancedMeshElementProps>(mobilePoolTree, (n) => n.props['data-testid'] === 'mobile-instanced-monopoly-promenades');
    const archMat = findReactNode<MaterialElementProps>(archNode, (n) => n.type === 'meshStandardMaterial');

    act(() => {
      root?.render(React.createElement(MonopolyPlazaFusion, { monopolyGroups: {}, isMobile: true, enableMobileInstancedPool: true }));
    });
    act(() => {
      root?.render(React.createElement(MonopolyPlazaFusion, { monopolyGroups: { [ColorGroup.Do]: RED_MONOPOLY }, isMobile: true, enableMobileInstancedPool: true }));
    });
    const slamKeys = Object.keys(useVfxStore.getState().activeSlams).map(Number);
    const cachedArchGeom = getMobileMonopolyArchwayGeometry();
    const disposeSpy = vi.spyOn(cachedArchGeom, 'dispose');

    act(() => {
      root?.unmount();
      root = null;
    });

    expect(plazaGroup).not.toBeNull();
    expect([
      archNode?.props.args?.[2], archNode?.props.frustumCulled, archMat?.props.color,
      archMat?.props.vertexColors, promNode?.props.args?.[2], promNode?.props.frustumCulled,
    ]).toEqual([8, false, '#FFFFFF', true, 16, false]);
    expect(preloadedUrls).toHaveLength(0);
    expect(slamKeys.some((cellIdx) => RED_MONOPOLY.cells.includes(cellIdx)) && disposeSpy.mock.calls.length >= 1).toBe(true);
  });
});
