// [TC-402/MSS][IMP-402] Contract Test Suite: Desktop Chain-Reaction Diorama Awakening & Sanctuary Wealth Trays
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Group, Mesh } from 'three';
import { sharedR3FHarness } from '../helpers/r3f_test_harness';
import { captureTree, findReactNode, findReactNodes } from '../helpers/threejs_test_utils';
import { SafeGLTFModel, type SafeGLTFModelProps } from '../../src/client/3d/asset_loader/safe_gltf_model';
import { clearTabletopTextureCache } from '../../src/client/3d/tabletop_texture_generator';
import { LODLevel, perfBudget } from '../../src/client/3d/perf_budget';
import { calculatePlayerNetWorth } from '../../src/client/ui/ui_helpers';
import { useGameStore, INITIAL_GAME_STATE, type PlayerHudInfo } from '../../src/client/store/game_store';
import { SoundEngine } from '../../src/client/audio/sound_engine';
import {
  getCornerSanctuaryDescriptors,
  getBayArchipelagoDescriptors,
  disposeBatchedSanctuaryGeometries,
} from '../../src/client/3d/coastal_sanctuary_visuals';
import {
  CoastalIslandEnvironment,
  CornerTycoonSanctuaries,
} from '../../src/client/3d/coastal_island_environment';
import { MiniatureCityDiorama, type MiniatureCityDioramaProps } from '../../src/client/3d/miniature_city_diorama';
import {
  WEALTH_TRAY_MODEL_URLS,
  WEALTH_TRAY_BASE_DIMENSIONS,
  WEALTH_TRAY_TIER_THRESHOLDS,
  CHAIN_REACTION_TTL_MS,
  CHAIN_REACTION_STAGE_SPECS,
  createScratchChainReactionSnapshot,
  resolvePlayerWealthTier,
  getSanctuaryWealthTrayDescriptors,
  evaluateDioramaChainReaction,
  computeEconomicAwakeningSignature,
} from '../../src/client/3d/toybox_wealth_tray_visuals';
import { ToyboxWealthTrayLayer, type ToyboxWealthTrayLayerProps } from '../../src/client/3d/toybox_wealth_tray_layer';
import {
  DioramaChainReaction,
  DioramaChainReactionFrameLoop,
  type DioramaChainReactionProps,
  type DioramaChainReactionFrameLoopProps,
} from '../../src/client/3d/diorama_chain_reaction';

const MONOPOLY_LEVEL_MAP: Record<number, 0 | 1 | 2 | 3> = {
  1: 1,
  3: 2,
  6: 1,
  8: 2,
  9: 3,
  11: 1,
  13: 2,
  14: 1,
  16: 1,
  18: 2,
  19: 2,
  21: 1,
  23: 2,
  24: 1,
  26: 1,
  27: 2,
  29: 3,
  31: 1,
  32: 2,
  34: 1,
  37: 2,
  39: 3,
};

const PLAYER_P1: PlayerHudInfo = {
  id: 'p1',
  name: 'Đại Gia Sài Gòn',
  balance: 0,
  tokenColor: '#DC2626',
  ownerSlot: 0,
  mascotIcon: '🏰',
  ownedProperties: [1, 3, 5],
};

const PLAYER_P2: PlayerHudInfo = {
  id: 'p2',
  name: 'Trọc Phú Hà Nội',
  balance: 0,
  tokenColor: '#2563EB',
  ownerSlot: 1,
  mascotIcon: '🏎️',
  ownedProperties: [6, 8, 9, 15],
};

const PLAYER_P3: PlayerHudInfo = {
  id: 'p3',
  name: 'Tỷ Phú Đà Nẵng',
  balance: 0,
  tokenColor: '#059669',
  ownerSlot: 2,
  mascotIcon: '⛵',
  ownedProperties: [11, 12, 13, 14, 25],
};

const PLAYER_P4: PlayerHudInfo = {
  id: 'p4',
  name: 'Bá Tước Cần Thơ',
  balance: 0,
  tokenColor: '#D97706',
  ownerSlot: 3,
  mascotIcon: '🚁',
  ownedProperties: [16, 18, 19, 21, 23, 24, 26, 27, 28, 29, 31, 32, 34, 35, 37, 39],
};

const MONOPOLY_PLAYERS: Readonly<Record<string, PlayerHudInfo>> = {
  p1: PLAYER_P1,
  p2: PLAYER_P2,
  p3: PLAYER_P3,
  p4: PLAYER_P4,
};

describe('IMP-402: Desktop Chain-Reaction Diorama Awakening & Sanctuary Wealth Trays Contract Suite', () => {
  const originalPreload = SafeGLTFModel.preload;
  const originalPlayWaterRipple = SoundEngine.playWaterRipple;
  let preloadedUrls: string[] = [];
  let rippleCount = 0;

  beforeEach(() => {
    preloadedUrls = [];
    rippleCount = 0;
    SafeGLTFModel.preload = (url: string): void => {
      preloadedUrls.push(url);
      originalPreload(url);
    };
    SoundEngine.playWaterRipple = (): void => {
      rippleCount += 1;
    };
    sharedR3FHarness.reset();
    disposeBatchedSanctuaryGeometries();
    clearTabletopTextureCache();
    perfBudget.setCurrentLOD(LODLevel.HIGH);
    useGameStore.setState(INITIAL_GAME_STATE);
  });

  afterEach(() => {
    SafeGLTFModel.preload = originalPreload;
    SoundEngine.playWaterRipple = originalPlayWaterRipple;
    sharedR3FHarness.reset();
    useGameStore.setState(INITIAL_GAME_STATE);
  });

  it('TC-402.01a [UC-POKA-YOKE-WEALTH-TIER-DERIVATION/MSS]: Given player cash, owned properties, levels, mortgages, and bankruptcy flags, When calling resolvePlayerWealthTier, Then derives netWorth strictly via calculatePlayerNetWorth and maps across WEALTH_TRAY_TIER_THRESHOLDS (10000 / 12000 / 30000) and tier 0 on bankruptcy', () => {
    const expectedNetWorth = calculatePlayerNetWorth(1500, [1, 3], { 1: 1, 3: 2 }, [3], { 3: 400 });
    const derived = resolvePlayerWealthTier(1500, [1, 3], { 1: 1, 3: 2 }, [3], { 3: 400 }, false);
    const r1 = resolvePlayerWealthTier(9999, [], {}, [], {}, false);
    const r2 = resolvePlayerWealthTier(10000, [], {}, [], {}, false);
    const r3 = resolvePlayerWealthTier(12000, [], {}, [], {}, false);
    const r4 = resolvePlayerWealthTier(30000, [], {}, [], {}, false);
    const bankruptRes = resolvePlayerWealthTier(50000, [39], { 39: 3 }, [], {}, true);

    expect(WEALTH_TRAY_TIER_THRESHOLDS).toEqual({ tier2: 10000, tier3: 12000, tier4: 30000 });
    expect([derived.netWorth, derived.propertyCount]).toEqual([expectedNetWorth, 2]);
    expect([r1.tier, r2.tier, r3.tier, r4.tier]).toEqual([1, 2, 3, 4]);
    expect(bankruptRes).toEqual({ tier: 0, netWorth: 0, propertyCount: 0 });
  });

  it('TC-402.01b [UC-POKA-YOKE-WEALTH-TIER-DERIVATION/A1]: Given the 4 players p1..p4 from board_ownership_monopoly scenario, When calling getSanctuaryWealthTrayDescriptors, Then resolves netWorth [4400, 10800, 12000, 91750], tiers [1, 2, 3, 4], and modelUrls /models/landmarks/wealth_tray_tier1..4.glb purely via resolvePlayerWealthTier', () => {
    const trays = getSanctuaryWealthTrayDescriptors(MONOPOLY_PLAYERS, MONOPOLY_LEVEL_MAP);

    expect(trays.map((d) => d.playerId)).toEqual(['p1', 'p2', 'p3', 'p4']);
    expect(trays.map((d) => d.netWorth)).toEqual([4400, 10800, 12000, 91750]);
    expect(trays.map((d) => d.tier)).toEqual([1, 2, 3, 4]);
    expect(trays.map((d) => d.modelUrl)).toEqual([
      WEALTH_TRAY_MODEL_URLS[1],
      WEALTH_TRAY_MODEL_URLS[2],
      WEALTH_TRAY_MODEL_URLS[3],
      WEALTH_TRAY_MODEL_URLS[4],
    ]);
  });

  it('TC-402.01c [UC-POKA-YOKE-WEALTH-TIER-DERIVATION/A2]: Given dual bankruptcy flags (bankrupt: true and isBankrupt: true) or empty/undefined playersInfo, When calling getSanctuaryWealthTrayDescriptors, Then maps both bankruptcy flags to tier 0 (modelUrl: null) and defaults undefined/empty calls to 4 startup tier 1 descriptors', () => {
    const defaultUndefined = getSanctuaryWealthTrayDescriptors();
    const defaultEmpty = getSanctuaryWealthTrayDescriptors({});
    const bankruptPlayers: Readonly<Record<string, PlayerHudInfo>> = {
      p1: { ...PLAYER_P1, bankrupt: true },
      p2: { ...PLAYER_P2, isBankrupt: true },
      p3: PLAYER_P3,
      p4: PLAYER_P4,
    };
    const bankruptTrays = getSanctuaryWealthTrayDescriptors(bankruptPlayers, MONOPOLY_LEVEL_MAP);

    expect(defaultUndefined.map((d) => d.tier)).toEqual([1, 1, 1, 1]);
    expect(defaultEmpty.map((d) => d.modelUrl)).toEqual([
      WEALTH_TRAY_MODEL_URLS[1],
      WEALTH_TRAY_MODEL_URLS[1],
      WEALTH_TRAY_MODEL_URLS[1],
      WEALTH_TRAY_MODEL_URLS[1],
    ]);
    expect(bankruptTrays.map((d) => d.tier)).toEqual([0, 0, 3, 4]);
    expect(bankruptTrays.map((d) => d.modelUrl)).toEqual([
      null,
      null,
      WEALTH_TRAY_MODEL_URLS[3],
      WEALTH_TRAY_MODEL_URLS[4],
    ]);
  });

  it('TC-402.02a [UC-SANCTUARY-APRON-SPATIAL-AABB-AND-NDC/MSS]: Given the 4 corner sanctuaries, When computing getSanctuaryWealthTrayDescriptors, Then anchors each tray at [cx + 0.88, -0.24, cz + 0.23] with base dimensions 0.36x0.44x0.48, trayScale [1.10, 1.35, 1.10], rotationY -0.15, bottomY -0.24, scaled topY 0.354 (> deckTopY -0.11 & pedestalTopY 0.08), and embedDepth >= 0.02', () => {
    const corners = getCornerSanctuaryDescriptors();
    const trays = getSanctuaryWealthTrayDescriptors(MONOPOLY_PLAYERS, MONOPOLY_LEVEL_MAP, corners);
    const expectedTopY = Number((-0.24 + 0.44 * 1.35).toFixed(4));
    const positionsAndScalesMatch =
      trays.length === 4 &&
      trays.every((t, i) => {
        const c = corners[i];
        return (
          c !== undefined &&
          Math.abs(t.worldPosition[0] - (c.position[0] + 0.88)) < 1e-4 &&
          Math.abs(t.worldPosition[1] - -0.24) < 1e-4 &&
          Math.abs(t.worldPosition[2] - (c.position[2] + 0.23)) < 1e-4 &&
          t.trayScale[0] === 1.1 &&
          t.trayScale[1] === 1.35 &&
          t.trayScale[2] === 1.1
        );
      });
    const elevationsExceedDeckAndPedestal =
      trays.length === 4 &&
      trays.every((t, i) => {
        const c = corners[i];
        return (
          c !== undefined &&
          Math.abs(t.bottomY - -0.24) < 1e-4 &&
          Math.abs(t.topY - expectedTopY) < 1e-4 &&
          t.topY > c.deckTopY &&
          t.topY > c.pedestalTopY
        );
      });

    expect(WEALTH_TRAY_BASE_DIMENSIONS).toEqual({ width: 0.36, height: 0.44, depth: 0.48 });
    expect(positionsAndScalesMatch).toBe(true);
    expect(elevationsExceedDeckAndPedestal).toBe(true);
    expect(trays.every((t) => t.embedDepth >= 0.02 - 1e-5 && t.rotationY === -0.15)).toBe(true);
  });

  it('TC-402.02b [UC-SANCTUARY-APRON-SPATIAL-AABB-AND-NDC/A1]: Given getCornerSanctuaryDescriptors and getBayArchipelagoDescriptors(20).palms, When checking scaled and rotated tray AABB and radial extents, Then guarantees exact scaled+rotated AABB bounds, zero collision with central marble pedestal (aabbMinX >= cx + 0.64 > cx + 0.62), >= 0.55m 2D clearance from all 20 palms, and maxRadialExtent <= 1.235 < baseRadius 1.24', () => {
    const corners = getCornerSanctuaryDescriptors();
    const palms = getBayArchipelagoDescriptors(20).palms;
    const trays = getSanctuaryWealthTrayDescriptors(MONOPOLY_PLAYERS, MONOPOLY_LEVEL_MAP, corners);
    const expectedRotHalfW = 0.18 * 1.1 * Math.abs(Math.cos(-0.15)) + 0.24 * 1.1 * Math.abs(Math.sin(-0.15));
    const expectedRotHalfD = 0.18 * 1.1 * Math.abs(Math.sin(-0.15)) + 0.24 * 1.1 * Math.abs(Math.cos(-0.15));
    const pedestalAndRotatedAabbValid =
      trays.length === 4 &&
      trays.every((t, i) => {
        const c = corners[i];
        if (!c) return false;
        const cx = c.position[0];
        const pedestalMaxX = cx + c.pedestalWidth * 0.5;
        const widthMatchesRotatedScale = Math.abs(t.aabbMaxX - t.aabbMinX - 2 * expectedRotHalfW) < 1e-3;
        const depthMatchesRotatedScale = Math.abs(t.aabbMaxZ - t.aabbMinZ - 2 * expectedRotHalfD) < 1e-3;
        return (
          widthMatchesRotatedScale &&
          depthMatchesRotatedScale &&
          t.aabbMinX >= cx + 0.64 - 1e-4 &&
          t.aabbMinX > pedestalMaxX
        );
      });
    const minPalmDistance =
      trays.length === 4 && palms.length === 20
        ? Math.min(
            ...trays.flatMap((t) =>
              palms.map((p) => Math.hypot(t.worldPosition[0] - p.position[0], t.worldPosition[2] - p.position[2]))
            )
          )
        : 0;

    expect(trays).toHaveLength(4);
    expect(pedestalAndRotatedAabbValid).toBe(true);
    expect(minPalmDistance).toBeGreaterThanOrEqual(0.55);
    expect(
      trays.every((t, i) => {
        const c = corners[i];
        return c !== undefined && t.maxRadialExtent <= 1.235 && t.maxRadialExtent < c.baseRadius;
      })
    ).toBe(true);
  });

  it('TC-402.02c [UC-SANCTUARY-APRON-SPATIAL-AABB-AND-NDC/A2]: Given CAMERA_CONFIG.overview on 1280x800 viewport, When projecting getSanctuaryWealthTrayDescriptors to NDC and pixel space, Then keeps all 4 trays within |ndcX| <= 0.85, -0.78 <= ndcY <= 0.82 and strictly outside ActionDock (x: 350..930, y: 700..780)', () => {
    const trays = getSanctuaryWealthTrayDescriptors(MONOPOLY_PLAYERS, MONOPOLY_LEVEL_MAP);
    const anyInActionDock =
      trays.length === 0 ||
      trays.some((t) => {
        const px = (t.ndcX + 1) * 640;
        const py = (1 - t.ndcY) * 400;
        return px >= 350 && px <= 930 && py >= 700 && py <= 780;
      });
    const swTray = trays.find((t) => t.sanctuaryId === 'sanctuary-southwest');

    expect(trays).toHaveLength(4);
    expect(trays.every((t) => Math.abs(t.ndcX) <= 0.85 && t.ndcY >= -0.78 && t.ndcY <= 0.82)).toBe(true);
    expect(anyInActionDock).toBe(false);
    expect(swTray?.ndcY).toBeGreaterThanOrEqual(-0.78);
  });

  it('TC-402.03a [UC-CHAIN-REACTION-STAGGER-AND-TTL-WATCHDOG/MSS]: Given CHAIN_REACTION_STAGE_SPECS (0ms, 180ms, 360ms, 540ms, 720ms) and createScratchChainReactionSnapshot, When calling evaluateDioramaChainReaction at 100ms, 400ms (with scratch snapshot), and 800ms, Then triggers stages sequentially at i * 180ms and mutates outSnapshot in-place with zero array/object allocations', () => {
    const snap100 = evaluateDioramaChainReaction(100);
    const scratch = createScratchChainReactionSnapshot();
    const scratchStagesRef = scratch.stages;
    const inPlace400 = evaluateDioramaChainReaction(400, CHAIN_REACTION_TTL_MS, scratch);
    const snap800 = evaluateDioramaChainReaction(800);

    expect(CHAIN_REACTION_STAGE_SPECS.map((s) => [s.id, s.delayMs])).toEqual([
      ['saigon-river-cruiser', 0],
      ['metro-line-station', 180],
      ['bitexco-tower', 360],
      ['bason-bridge', 540],
      ['notre-dame-cathedral', 720],
    ]);
    expect([snap100.isActive, snap100.isExpired, snap100.stages.map((s) => s.isTriggered)]).toEqual([
      true,
      false,
      [true, false, false, false, false],
    ]);
    expect([
      inPlace400 === scratch,
      inPlace400.stages === scratchStagesRef,
      inPlace400.stages.map((s) => s.isTriggered),
    ]).toEqual([true, true, [true, true, true, false, false]]);
    expect(
      snap800.stages.length === 5 &&
        snap800.stages.every((s) => s.isTriggered && s.intensity > 0 && s.ringScale > 1 && s.yOffset > 0)
    ).toBe(true);
  });

  it('TC-402.03b [UC-CHAIN-REACTION-STAGGER-AND-TTL-WATCHDOG/A1]: Given elapsed times -50ms, 2800ms, and 3500ms, When calling evaluateDioramaChainReaction, Then clamps negative elapsed time to inactive/untriggered and self-heals at elapsedMs >= 2800 (CHAIN_REACTION_TTL_MS) with isActive false, isExpired true, and all intensities 0', () => {
    const snapNeg = evaluateDioramaChainReaction(-50);
    const snap2800 = evaluateDioramaChainReaction(2800);
    const snap3500 = evaluateDioramaChainReaction(3500);

    expect(CHAIN_REACTION_TTL_MS).toBe(2800);
    expect([
      snapNeg.isActive,
      snapNeg.isExpired,
      snapNeg.stages.length === 5 &&
        snapNeg.stages.every((s) => !s.isTriggered && s.intensity === 0 && s.ringScale === 1 && s.yOffset === 0),
    ]).toEqual([false, false, true]);
    expect([
      snap2800.isActive,
      snap2800.isExpired,
      snap2800.stages.length === 5 &&
        snap2800.stages.every((s) => !s.isTriggered && s.intensity === 0 && s.ringScale === 1 && s.yOffset === 0),
    ]).toEqual([false, true, true]);
    expect([snap3500.isActive, snap3500.isExpired]).toEqual([false, true]);
  });

  it('TC-402.03c [UC-CHAIN-REACTION-STAGGER-AND-TTL-WATCHDOG/A2]: Given player ownership, building levels, and HOSE tuples, When calling computeEconomicAwakeningSignature, Then returns distinct non-empty signatures whenever ownedProperties, levelMap, or lastHoseTuple change', () => {
    const sigBase = computeEconomicAwakeningSignature(MONOPOLY_PLAYERS, { 1: 1 }, ['p1', 0]);
    const sigPropChange = computeEconomicAwakeningSignature(
      { ...MONOPOLY_PLAYERS, p1: { ...PLAYER_P1, ownedProperties: [1, 3, 5, 12] } },
      { 1: 1 },
      ['p1', 0]
    );
    const sigLevelChange = computeEconomicAwakeningSignature(
      { ...MONOPOLY_PLAYERS, p1: { ...PLAYER_P1, ownedProperties: [1, 3, 5, 12] } },
      { 1: 2 },
      ['p1', 0]
    );
    const sigHoseChange = computeEconomicAwakeningSignature(
      { ...MONOPOLY_PLAYERS, p1: { ...PLAYER_P1, ownedProperties: [1, 3, 5, 12] } },
      { 1: 2 },
      ['p2', 5000]
    );

    expect(sigBase.length).toBeGreaterThan(0);
    expect(sigPropChange).not.toBe(sigBase);
    expect(sigLevelChange).not.toBe(sigPropChange);
    expect(sigHoseChange).not.toBe(sigLevelChange);
  });

  it('TC-402.04a [UC-DESKTOP-GLB-MOUNT-HITPLANE-AND-MOBILE-ISOLATION/MSS]: Given ToyboxWealthTrayLayer and CoastalIslandEnvironment on Desktop (isMobile = false), When playersInfo is empty vs populated, Then short-circuits preload on empty state (preserving TC-399.06b) and mounts 4 SafeGLTFModel wealth trays with scale [1.10, 1.35, 1.10] when populated', () => {
    const emptyTrayTree = captureTree<ToyboxWealthTrayLayerProps>(ToyboxWealthTrayLayer, { isMobile: false });
    renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { isMobile: false, deviceMemoryGb: 16 }));
    const preloadedWhenEmpty = [...preloadedUrls];

    useGameStore.setState({ playersInfo: MONOPOLY_PLAYERS, levelMap: MONOPOLY_LEVEL_MAP });
    const populatedSanctuaryTree = captureTree(CornerTycoonSanctuaries, { isMobile: false, deviceMemoryGb: 16 });
    const trayLayerNode = findReactNode(populatedSanctuaryTree, (n) => n.type === ToyboxWealthTrayLayer);
    const traySubtree = captureTree<ToyboxWealthTrayLayerProps>(ToyboxWealthTrayLayer, { isMobile: false });
    const trayGltfNodes = findReactNodes<SafeGLTFModelProps>(traySubtree, (n) => n.type === SafeGLTFModel);

    expect(emptyTrayTree).toBeNull();
    expect(preloadedWhenEmpty).toEqual([
      '/models/pawns/pawn_horse.glb',
      '/models/pawns/pawn_tower.glb',
      '/models/pawns/pawn_yacht.glb',
      '/models/pawns/pawn_car.glb',
    ]);
    expect(trayLayerNode).not.toBeNull();
    expect(
      Object.values(WEALTH_TRAY_MODEL_URLS).every((u) => preloadedUrls.includes(u)) &&
        trayGltfNodes.map((n) => n.props.url).join(',') ===
          Object.values(WEALTH_TRAY_MODEL_URLS).join(',') &&
        trayGltfNodes.every(
          (n) =>
            React.isValidElement(n.props.fallback) &&
            Array.isArray(n.props.scale) &&
            n.props.scale[0] === 1.1 &&
            n.props.scale[1] === 1.35 &&
            n.props.scale[2] === 1.1
        )
    ).toBe(true);
  });

  it('TC-402.04b [UC-DESKTOP-GLB-MOUNT-HITPLANE-AND-MOBILE-ISOLATION/A1]: Given MiniatureCityDiorama, DioramaChainReaction, and DioramaChainReactionFrameLoop on Desktop, When clicking UnifiedToyboxHitPlane and advancing frame ticks across 450ms and 2900ms, Then couples all 5 3D landmark groups (ChainLandmark_*), calls stopPropagation + playWaterRipple, bounces landmarks + rings while active, and resets landmarks + hides rings on 2800ms TTL expiry', () => {
    const dioramaTree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: false, isVisible: true });
    const coupledLandmarkNames = CHAIN_REACTION_STAGE_SPECS.map((s) => `ChainLandmark_${s.id}`);
    const hasAllCoupledLandmarkGroups = coupledLandmarkNames.every(
      (name) => findReactNode(dioramaTree, (n) => n.props?.name === name) !== null
    );
    const chainTree = captureTree<DioramaChainReactionProps>(DioramaChainReaction, { isMobile: false, isVisible: true });
    const hitPlaneNode = findReactNode(chainTree, (n) => n.props?.name === 'UnifiedToyboxHitPlane');
    const hitPlaneGeom = findReactNode(hitPlaneNode, (n) => n.type === 'planeGeometry');
    let stopPropCalled = false;
    const onClick = hitPlaneNode?.props?.onClick as ((e: { stopPropagation: () => void }) => void) | undefined;
    onClick?.({
      stopPropagation: () => {
        stopPropCalled = true;
      },
    });

    const nowMs = Date.now();
    const triggerStartMsRef: { current: number | null } = { current: nowMs - 450 };
    const stageGroupRefs = { current: CHAIN_REACTION_STAGE_SPECS.map(() => new Group()) };
    const stageRingRefs = { current: CHAIN_REACTION_STAGE_SPECS.map(() => new Mesh()) };
    const landmarkGroupRefs = { current: CHAIN_REACTION_STAGE_SPECS.map(() => new Group()) };
    captureTree<DioramaChainReactionFrameLoopProps>(DioramaChainReactionFrameLoop, {
      isVisible: true,
      triggerStartMsRef,
      stageGroupRefs,
      stageRingRefs,
      landmarkGroupRefs,
    });
    sharedR3FHarness.advanceFrame(0.016);
    const ring0 = stageRingRefs.current[0];
    const grp0 = stageGroupRefs.current[0];
    const landmark0 = landmarkGroupRefs.current[0];
    const spec0 = CHAIN_REACTION_STAGE_SPECS[0];
    const activePulseAfter450ms = Boolean(
      ring0?.visible &&
        ring0.scale.x > 1 &&
        grp0 &&
        spec0 &&
        grp0.position.y > spec0.worldPosition[1] &&
        landmark0 &&
        landmark0.position.y > 0 &&
        landmark0.scale.y > 1
    );

    triggerStartMsRef.current = Date.now() - 2900;
    sharedR3FHarness.advanceFrame(0.016);
    const allResetAndHiddenAfterExpiry =
      stageRingRefs.current.every((r, idx) => {
        const g = stageGroupRefs.current[idx];
        const sp = CHAIN_REACTION_STAGE_SPECS[idx];
        return Boolean(g && sp && r.visible === false && r.scale.x === 1 && g.position.y === sp.worldPosition[1]);
      }) && landmarkGroupRefs.current.every((lg) => lg.position.y === 0 && lg.scale.y === 1);

    expect(
      findReactNode(dioramaTree, (n) => n.type === DioramaChainReaction) !== null && hasAllCoupledLandmarkGroups
    ).toBe(true);
    expect([hitPlaneGeom?.props?.args, stopPropCalled, rippleCount]).toEqual([[14.4, 14.4], true, 1]);
    expect(activePulseAfter450ms).toBe(true);
    expect([allResetAndHiddenAfterExpiry, triggerStartMsRef.current]).toEqual([true, null]);
  });

  it('TC-402.04c [UC-DESKTOP-GLB-MOUNT-HITPLANE-AND-MOBILE-ISOLATION/A2]: Given populated game store state on Mobile (isMobile = true), When rendering ToyboxWealthTrayLayer, DioramaChainReaction, and MiniatureCityDiorama, Then mounts 0 .glb wealth trays, 0 hit-plane meshes, and registers 0 useSafeFrame subscribers in sharedR3FHarness', () => {
    useGameStore.setState({ playersInfo: MONOPOLY_PLAYERS, levelMap: MONOPOLY_LEVEL_MAP });
    const desktopDescriptors = getSanctuaryWealthTrayDescriptors(MONOPOLY_PLAYERS, MONOPOLY_LEVEL_MAP);
    sharedR3FHarness.reset();
    const mobileTrayTree = captureTree<ToyboxWealthTrayLayerProps>(ToyboxWealthTrayLayer, { isMobile: true });
    const mobileChainTree = captureTree<DioramaChainReactionProps>(DioramaChainReaction, { isMobile: true, isVisible: true });
    const subscribersAfterMobileChain = sharedR3FHarness.getSubscriberCount();
    const mobileDioramaTree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true, isVisible: true });

    expect(mobileTrayTree).toBeNull();
    expect(mobileChainTree).toBeNull();
    expect([preloadedUrls.length, subscribersAfterMobileChain, desktopDescriptors.length]).toEqual([0, 0, 4]);
    expect(findReactNode(mobileDioramaTree, (n) => n.type === DioramaChainReaction)).toBeNull();
  });
});
