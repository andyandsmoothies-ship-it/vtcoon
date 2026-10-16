// [TC-403/MSS][IMP-403] Contract Test Suite: Desktop War Room Gavel/Scale (.glb) & Tycoon Diplomacy Halos
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Group, Mesh } from 'three';
import { sharedR3FHarness } from '../helpers/r3f_test_harness';
import { captureTree, findReactNode, findReactNodes } from '../helpers/threejs_test_utils';
import { SafeGLTFModel, type SafeGLTFModelProps } from '../../src/client/3d/asset_loader/safe_gltf_model';
import { clearTabletopTextureCache } from '../../src/client/3d/tabletop_texture_generator';
import { LODLevel, perfBudget } from '../../src/client/3d/perf_budget';
import { BotPosture } from '../../src/domain/bot/index';
import type { PendingTradeOfferDelta } from '../../src/domain/protocol/index';
import {
  useGameStore,
  INITIAL_GAME_STATE,
  type ModalPayloadMap,
  type PlayerHudInfo,
} from '../../src/client/store/game_store';
import {
  getCornerSanctuaryDescriptors,
  disposeBatchedSanctuaryGeometries,
} from '../../src/client/3d/coastal_sanctuary_visuals';
import {
  CoastalIslandEnvironment,
  CornerTycoonSanctuaries,
} from '../../src/client/3d/coastal_island_environment';
import { getSanctuaryWealthTrayDescriptors } from '../../src/client/3d/toybox_wealth_tray_visuals';
import {
  WAR_ROOM_MODEL_URLS,
  WAR_ROOM_GAVEL_BASE_DIMENSIONS,
  WAR_ROOM_SCALE_BASE_DIMENSIONS,
  WAR_ROOM_TTL_MS,
  WAR_ROOM_MAX_SCALE_TILT_RAD,
  getWarRoomStageDescriptor,
  evaluateWarRoomTradeScale,
  evaluateWarRoomAuctionGavel,
  resolveTycoonDiplomacyPosture,
  getTycoonDiplomacyHaloDescriptors,
  createDiplomacySpeechBubbleTexture,
  disposeDiplomacySpeechBubbleTextures,
} from '../../src/client/3d/war_room_stage_visuals';
import {
  WarRoomStageLayer,
  WarRoomStageFrameLoop,
  type WarRoomStageLayerProps,
  type WarRoomStageFrameLoopProps,
} from '../../src/client/3d/war_room_stage_layer';

const MONOPOLY_LEVEL_MAP: Record<number, 0 | 1 | 2 | 3> = {
  1: 1, 3: 2, 6: 1, 8: 2, 9: 3, 11: 1, 13: 2, 14: 1, 16: 1, 18: 2, 19: 2,
  21: 1, 23: 2, 24: 1, 26: 1, 27: 2, 29: 3, 31: 1, 32: 2, 34: 1, 37: 2, 39: 3,
};

const PLAYER_P1: PlayerHudInfo = {
  id: 'p1', name: 'Đại Gia Sài Gòn', balance: 0, tokenColor: '#DC2626',
  ownerSlot: 0, mascotIcon: '🏰', ownedProperties: [1, 3, 5],
};

const PLAYER_P2: PlayerHudInfo = {
  id: 'p2', name: 'Trọc Phú Hà Nội', balance: 0, tokenColor: '#2563EB',
  ownerSlot: 1, mascotIcon: '🏎️', ownedProperties: [6, 8, 9, 15],
};

const PLAYER_P3: PlayerHudInfo = {
  id: 'p3', name: 'Tỷ Phú Đà Nẵng', balance: 0, tokenColor: '#059669',
  ownerSlot: 2, mascotIcon: '⛵', ownedProperties: [11, 12, 13, 14, 25],
};

const PLAYER_P4: PlayerHudInfo = {
  id: 'p4', name: 'Bá Tước Cần Thơ', balance: 0, tokenColor: '#D97706',
  ownerSlot: 3, mascotIcon: '🚁',
  ownedProperties: [16, 18, 19, 21, 23, 24, 26, 27, 28, 29, 31, 32, 34, 35, 37, 39],
};

const MONOPOLY_PLAYERS: Readonly<Record<string, PlayerHudInfo>> = {
  p1: PLAYER_P1,
  p2: PLAYER_P2,
  p3: PLAYER_P3,
  p4: PLAYER_P4,
};

describe('IMP-403: Desktop War Room Gavel/Scale (.glb) & Tycoon Diplomacy Halos Contract Suite', () => {
  const originalPreload = SafeGLTFModel.preload;
  let preloadedUrls: string[] = [];

  beforeEach(() => {
    preloadedUrls = [];
    SafeGLTFModel.preload = (url: string): void => {
      preloadedUrls.push(url);
      originalPreload(url);
    };
    sharedR3FHarness.reset();
    disposeBatchedSanctuaryGeometries();
    disposeDiplomacySpeechBubbleTextures();
    clearTabletopTextureCache();
    perfBudget.setCurrentLOD(LODLevel.HIGH);
    useGameStore.setState(INITIAL_GAME_STATE);
  });

  afterEach(() => {
    SafeGLTFModel.preload = originalPreload;
    sharedR3FHarness.reset();
    disposeDiplomacySpeechBubbleTextures();
    useGameStore.setState(INITIAL_GAME_STATE);
  });

  it('TC-403.01a [UC-POKA-YOKE-BOT-TRADE-SCALE-AND-AUCTION-GAVEL/MSS]: Given null, generous, and lowball trade offers, When calling evaluateWarRoomTradeScale, Then delegates to evaluateBotTradeDecision and maps accepted vs PRICE_TOO_LOW offers to positive vs negative scaleTiltRad within [-0.35, +0.35]', () => {
    const nonMonopolyPlayers: Readonly<Record<string, PlayerHudInfo>> = {
      p1: { ...PLAYER_P1, balance: 2500, ownedProperties: [1] },
      p2: { ...PLAYER_P2, balance: 2500, ownedProperties: [6] },
      p3: { ...PLAYER_P3, balance: 2500, ownedProperties: [11] },
    };
    const idleScale = evaluateWarRoomTradeScale(null, nonMonopolyPlayers, {});
    const generousOffer: PendingTradeOfferDelta = {
      offerId: 'offer-gen', cellIndex: 1, price: 2500, buyerId: 'p2', sellerId: 'p1', expiresAt: 99999,
    };
    const lowballOffer: PendingTradeOfferDelta = {
      offerId: 'offer-low', cellIndex: 1, price: 50, buyerId: 'p2', sellerId: 'p1', expiresAt: 99999,
    };
    const generous = evaluateWarRoomTradeScale(generousOffer, nonMonopolyPlayers, {});
    const lowball = evaluateWarRoomTradeScale(lowballOffer, nonMonopolyPlayers, {});

    expect(WAR_ROOM_MAX_SCALE_TILT_RAD).toBe(0.35);
    expect(idleScale).toEqual({
      isActive: false, accept: false, reason: '', scaleTiltRad: 0, leftPanYOffset: 0, rightPanYOffset: 0,
    });
    expect([
      generous.isActive,
      generous.accept,
      generous.scaleTiltRad > 0 && generous.scaleTiltRad <= 0.35,
      generous.leftPanYOffset < 0 && generous.rightPanYOffset > 0,
    ]).toEqual([true, true, true, true]);
    expect([
      lowball.isActive,
      lowball.accept,
      lowball.reason,
      lowball.scaleTiltRad < 0 && lowball.scaleTiltRad >= -0.35 && lowball.leftPanYOffset > 0,
    ]).toEqual([true, false, 'PRICE_TOO_LOW', true]);
  });

  it('TC-403.01b [UC-POKA-YOKE-BOT-TRADE-SCALE-AND-AUCTION-GAVEL/A1]: Given monopoly-completing and wealthy-leader trade offers, When calling evaluateWarRoomTradeScale, Then rejects with PREVENT_MONOPOLY and KINGMAKING_DEFENSE (including normalized EMBARGO_LEADER at buyer.balance === 30000) and tilts scale negative', () => {
    const monopolyPlayers: Readonly<Record<string, PlayerHudInfo>> = {
      p1: { ...PLAYER_P1, balance: 2500, ownedProperties: [1] },
      p2: { ...PLAYER_P2, balance: 2500, ownedProperties: [3] },
      p3: { ...PLAYER_P3, balance: 2500, ownedProperties: [11] },
    };
    const monopolyOffer: PendingTradeOfferDelta = {
      offerId: 'offer-mono', cellIndex: 3, price: 800, buyerId: 'p1', sellerId: 'p2', expiresAt: 99999,
    };
    const kingmakingPlayers: Readonly<Record<string, PlayerHudInfo>> = {
      p1: { ...PLAYER_P1, balance: 2500, ownedProperties: [11] },
      p2: { ...PLAYER_P2, balance: 2500, ownedProperties: [3] },
      p4: { ...PLAYER_P4, balance: 30000, ownedProperties: [1, ...PLAYER_P4.ownedProperties] },
    };
    const kingmakingOffer: PendingTradeOfferDelta = {
      offerId: 'offer-king', cellIndex: 3, price: 5000, buyerId: 'p4', sellerId: 'p2', expiresAt: 99999,
    };
    const monopolyRes = evaluateWarRoomTradeScale(monopolyOffer, monopolyPlayers, {});
    const kingmakingRes = evaluateWarRoomTradeScale(kingmakingOffer, kingmakingPlayers, MONOPOLY_LEVEL_MAP);

    expect([monopolyRes.isActive, monopolyRes.accept, monopolyRes.reason]).toEqual([true, false, 'PREVENT_MONOPOLY']);
    expect(monopolyRes.scaleTiltRad < 0 && monopolyRes.scaleTiltRad >= -0.35).toBe(true);
    expect([kingmakingRes.isActive, kingmakingRes.accept, kingmakingRes.reason]).toEqual([
      true, false, 'KINGMAKING_DEFENSE',
    ]);
    expect(kingmakingRes.scaleTiltRad < 0 && kingmakingRes.leftPanYOffset > 0 && kingmakingRes.rightPanYOffset < 0).toBe(true);
  });

  it('TC-403.01c [UC-POKA-YOKE-BOT-TRADE-SCALE-AND-AUCTION-GAVEL/A2]: Given null or active auction across elapsed times -40ms, 320ms, 2600ms, and 3200ms, When calling evaluateWarRoomAuctionGavel, Then drives damped harmonic strike motion in [0, 2600) and self-heals via Dead Man Switch at >= 2600ms', () => {
    const activeAuction: ModalPayloadMap['auction'] = {
      cellIndex: 12, currentBid: 3400, highestBidderId: 'p2', timeRemaining: 12,
    };
    const idleGavel = evaluateWarRoomAuctionGavel(null, 320);
    const negGavel = evaluateWarRoomAuctionGavel(activeAuction, -40);
    const activeGavel = evaluateWarRoomAuctionGavel(activeAuction, 320);
    const expired2600 = evaluateWarRoomAuctionGavel(activeAuction, 2600);
    const expired3200 = evaluateWarRoomAuctionGavel(activeAuction, 3200);

    expect(WAR_ROOM_TTL_MS).toBe(2600);
    expect([idleGavel, negGavel]).toEqual([
      { isActive: false, isExpired: false, gavelStrikeAngleRad: 0, gavelYOffset: 0, soundBlockPulseScale: 1 },
      { isActive: false, isExpired: false, gavelStrikeAngleRad: 0, gavelYOffset: 0, soundBlockPulseScale: 1 },
    ]);
    expect([
      activeGavel.isActive,
      activeGavel.isExpired,
      activeGavel.gavelStrikeAngleRad !== 0 &&
        activeGavel.gavelStrikeAngleRad >= -0.48 &&
        activeGavel.gavelStrikeAngleRad <= 0.22,
      activeGavel.gavelYOffset > 0 && activeGavel.soundBlockPulseScale > 1,
    ]).toEqual([true, false, true, true]);
    expect([expired2600, expired3200.isActive, expired3200.isExpired]).toEqual([
      { isActive: false, isExpired: true, gavelStrikeAngleRad: 0, gavelYOffset: 0, soundBlockPulseScale: 1 },
      false,
      true,
    ]);
  });

  it('TC-403.02a [UC-DIPLOMACY-HALOS-AND-WEBGL-VIETNAMESE-SPEECH-BUBBLES/MSS]: Given p1..p4 from board_ownership_monopoly, When calling resolveTycoonDiplomacyPosture and getTycoonDiplomacyHaloDescriptors, Then resolves all 4 distinct tacticalModes, 4 distinct Vietnamese slogans, and all 3 canonical BotPosture values', () => {
    const halos = getTycoonDiplomacyHaloDescriptors(MONOPOLY_PLAYERS, MONOPOLY_LEVEL_MAP);
    const p4Posture = resolveTycoonDiplomacyPosture('p4', MONOPOLY_PLAYERS, MONOPOLY_LEVEL_MAP);
    const distinctSlogans = new Set(halos.map((h) => h.viSlogan));

    expect(halos.map((h) => h.tacticalMode)).toEqual(['RESCUE', 'DEFENSIVE', 'EXPANSION', 'MONOPOLY_OVERLORD']);
    expect(halos.map((h) => h.posture)).toEqual([
      BotPosture.Trailing, BotPosture.Trailing, BotPosture.Parity, BotPosture.Leading,
    ]);
    expect(distinctSlogans.size === 4 && halos.every((h) => h.isVisible && h.viSlogan.length > 0)).toBe(true);
    expect([p4Posture.isVisible, p4Posture.posture, p4Posture.tacticalMode, p4Posture.netWorth]).toEqual([
      true, BotPosture.Leading, 'MONOPOLY_OVERLORD', 91750,
    ]);
  });

  it('TC-403.02b [UC-DIPLOMACY-HALOS-AND-WEBGL-VIETNAMESE-SPEECH-BUBBLES/A1]: Given dual bankruptcy flags (bankrupt: true and isBankrupt: true) or empty/undefined playersInfo, When calling resolveTycoonDiplomacyPosture and getTycoonDiplomacyHaloDescriptors, Then hides bankrupt halos (isVisible: false) and defaults empty calls to 4 visible startup descriptors', () => {
    const bankruptPlayers: Readonly<Record<string, PlayerHudInfo>> = {
      p1: { ...PLAYER_P1, bankrupt: true },
      p2: { ...PLAYER_P2, isBankrupt: true },
      p3: PLAYER_P3,
      p4: PLAYER_P4,
    };
    const b1 = resolveTycoonDiplomacyPosture('p1', bankruptPlayers, MONOPOLY_LEVEL_MAP);
    const b2 = resolveTycoonDiplomacyPosture('p2', bankruptPlayers, MONOPOLY_LEVEL_MAP);
    const halosWithBankrupt = getTycoonDiplomacyHaloDescriptors(bankruptPlayers, MONOPOLY_LEVEL_MAP);
    const defaultHalos = getTycoonDiplomacyHaloDescriptors();

    expect([b1.isVisible, b2.isVisible]).toEqual([false, false]);
    expect(halosWithBankrupt.map((h) => h.isVisible)).toEqual([false, false, true, true]);
    expect(defaultHalos).toHaveLength(4);
    expect(defaultHalos.every((h) => h.isVisible && h.viSlogan.length > 0)).toBe(true);
  });

  it('TC-403.02c [UC-DIPLOMACY-HALOS-AND-WEBGL-VIETNAMESE-SPEECH-BUBBLES/A2]: Given createDiplomacySpeechBubbleTexture and disposeDiplomacySpeechBubbleTextures, When called with identical vs distinct slogans/modes, Then strips leading emojis for renderedText, reuses cached CanvasTexture, and disposes cached textures cleanly', () => {
    const tex1a = createDiplomacySpeechBubbleTexture('Vị Thế Chi Phối', '#F59E0B', 'MONOPOLY_OVERLORD');
    const tex1b = createDiplomacySpeechBubbleTexture('Vị Thế Chi Phối', '#F59E0B', 'MONOPOLY_OVERLORD');
    const tex2 = createDiplomacySpeechBubbleTexture('Tái Cơ Cấu Vốn', '#EF4444', 'RESCUE');
    let disposedCount = 0;
    const origDispose1 = tex1a.dispose.bind(tex1a);
    const origDispose2 = tex2.dispose.bind(tex2);
    tex1a.dispose = (): void => {
      disposedCount += 1;
      origDispose1();
    };
    tex2.dispose = (): void => {
      disposedCount += 1;
      origDispose2();
    };
    disposeDiplomacySpeechBubbleTextures();
    const texAfterDispose = createDiplomacySpeechBubbleTexture('Vị Thế Chi Phối', '#F59E0B', 'MONOPOLY_OVERLORD');

    expect([tex1a === tex1b, tex1a.userData.renderedText, tex2.userData.renderedText]).toEqual([
      true,
      'Vị Thế Chi Phối',
      'Tái Cơ Cấu Vốn',
    ]);
    expect(tex2).not.toBe(tex1a);
    expect(texAfterDispose).not.toBe(tex1a);
    expect(disposedCount).toBe(2);
  });

  it('TC-403.03a [UC-WAR-ROOM-SPATIAL-AABB-AND-HUD-SAFE-NDC/MSS]: Given getWarRoomStageDescriptor, When checking 4-tier stepped island dais bounds in the open Southeast bay against the 40-tile board and southwest sanctuary, Then places dais at [11.5, -0.28, 2.2] with stepped tapering, ascending elevations, embedDepth >= 0.02, minX > 10.15, and sanctuary clearance >= 2.56m', () => {
    const stage = getWarRoomStageDescriptor();
    const swSanctuary = getCornerSanctuaryDescriptors().find((c) => c.id === 'sanctuary-southwest');
    const widthsStrictlyTaper =
      stage.daisRadius === 1.18 &&
      stage.sandRadius === 1.06 &&
      stage.daisRadius > stage.sandRadius &&
      stage.sandRadius > stage.rimWidth * 0.5 &&
      stage.rimWidth > stage.deckWidth;
    const elevationsAscend =
      stage.daisBottomY === -0.34 &&
      stage.sandTopY === -0.22 &&
      stage.rimTopY === -0.16 &&
      stage.daisTopY === -0.08 &&
      stage.embedDepth >= 0.02;
    const distToSw = swSanctuary
      ? Math.hypot(stage.daisPosition[0] - swSanctuary.position[0], stage.daisPosition[2] - swSanctuary.position[2])
      : 0;

    expect(stage.daisPosition).toEqual([11.5, -0.28, 2.2]);
    expect([widthsStrictlyTaper, elevationsAscend]).toEqual([true, true]);
    expect(stage.daisPosition[0] - stage.daisRadius).toBeGreaterThan(10.15);
    expect(distToSw).toBeGreaterThanOrEqual(2.56);
  });

  it('TC-403.03b [UC-WAR-ROOM-SPATIAL-AABB-AND-HUD-SAFE-NDC/A1]: Given getWarRoomStageDescriptor, When checking gavel and balance scale placements and NDC coordinates, Then places gavel at [11.12, -0.08, 2.02] and scale at [11.88, -0.08, 2.38] with 2D separation >= 0.80m, scale [1.4, 1.4, 1.4], and |ndcX| <= 0.85, |ndcY| <= 0.80', () => {
    const stage = getWarRoomStageDescriptor();
    const gavelToScaleDist = Math.hypot(
      stage.gavelWorldPosition[0] - stage.scaleWorldPosition[0],
      stage.gavelWorldPosition[2] - stage.scaleWorldPosition[2]
    );

    expect([WAR_ROOM_GAVEL_BASE_DIMENSIONS, WAR_ROOM_SCALE_BASE_DIMENSIONS]).toEqual([
      { width: 0.44, height: 0.42, depth: 0.44 },
      { width: 0.52, height: 0.48, depth: 0.32 },
    ]);
    expect([stage.gavelWorldPosition, stage.scaleWorldPosition]).toEqual([
      [11.12, -0.08, 2.02],
      [11.88, -0.08, 2.38],
    ]);
    expect([stage.gavelScale, stage.scaleModelScale, gavelToScaleDist >= 0.8]).toEqual([
      [1.4, 1.4, 1.4],
      [1.4, 1.4, 1.4],
      true,
    ]);
    expect(Math.abs(stage.ndcX) <= 0.85 && Math.abs(stage.ndcY) <= 0.8).toBe(true);
  });

  it('TC-403.03c [UC-WAR-ROOM-SPATIAL-AABB-AND-HUD-SAFE-NDC/A2]: Given getTycoonDiplomacyHaloDescriptors and getSanctuaryWealthTrayDescriptors, When checking halo and speech bubble coordinates, Then enforces outerRadius 0.46m (halo.aabbMaxX < cx + 0.487 < tray.aabbMinX), elevated bubbleWorldPosition Y = 1.48m (southwest shifted to [-0.35, 1.48, 11.95]), and HUD-safe NDC bounds outside ActionDock', () => {
    const corners = getCornerSanctuaryDescriptors();
    const trays = getSanctuaryWealthTrayDescriptors(MONOPOLY_PLAYERS, MONOPOLY_LEVEL_MAP, corners);
    const halos = getTycoonDiplomacyHaloDescriptors(MONOPOLY_PLAYERS, MONOPOLY_LEVEL_MAP, corners);
    const swHalo = halos.find((h) => h.sanctuaryId === 'sanctuary-southwest');
    const haloAndTrayClearanceValid =
      halos.length === 4 &&
      halos.every((h, i) => {
        const c = corners[i];
        const t = trays[i];
        return (
          c !== undefined &&
          t !== undefined &&
          h.innerRadius === 0.36 &&
          h.outerRadius === 0.46 &&
          Math.abs(h.worldPosition[1] - 0.086) < 1e-4 &&
          Math.abs(h.bubbleWorldPosition[1] - 1.48) < 1e-4 &&
          h.aabbMaxX < c.position[0] + 0.487 &&
          h.aabbMaxX < t.aabbMinX
        );
      });
    const allWithinHudSafeFrustum =
      halos.length === 4 &&
      halos.every((h) => {
        const bPx = (h.bubbleNdcX + 1) * 640;
        const bPy = (1 - h.bubbleNdcY) * 400;
        const inActionDock = bPx >= 350 && bPx <= 930 && bPy >= 700 && bPy <= 780;
        return (
          Math.abs(h.ndcX) <= 0.85 &&
          Math.abs(h.ndcY) <= 0.8 &&
          Math.abs(h.bubbleNdcX) <= 0.85 &&
          Math.abs(h.bubbleNdcY) <= 0.8 &&
          !inActionDock
        );
      });

    expect(halos).toHaveLength(4);
    expect(haloAndTrayClearanceValid).toBe(true);
    expect(allWithinHudSafeFrustum).toBe(true);
    expect([
      swHalo?.bubbleWorldPosition,
      halos.every((h) => h.bubbleSize[0] === 1.65 && h.bubbleSize[1] === 0.52),
    ]).toEqual([[-0.35, 1.48, 11.95], true]);
  });

  it('TC-403.04a [UC-DESKTOP-GLB-MOUNT-SPEECH-BUBBLE-AND-MOBILE-ISOLATION/MSS]: Given WarRoomStageLayer and CoastalIslandEnvironment on Desktop (isMobile = false), When playersInfo is empty vs populated, Then bypasses preload on empty state (preserving TC-399.06b) and preloads + mounts gavel + scale .glb models, 4 diplomacy halos, and 4 speech bubble billboards when populated', () => {
    const emptyWarRoomTree = captureTree<WarRoomStageLayerProps>(WarRoomStageLayer, { isMobile: false });
    renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { isMobile: false, deviceMemoryGb: 16 }));
    const preloadedWhenEmpty = [...preloadedUrls];

    useGameStore.setState({ playersInfo: MONOPOLY_PLAYERS, levelMap: MONOPOLY_LEVEL_MAP });
    const populatedSanctuaryTree = captureTree(CornerTycoonSanctuaries, { isMobile: false, deviceMemoryGb: 16 });
    const warRoomNodeInSanctuary = findReactNode(populatedSanctuaryTree, (n) => n.type === WarRoomStageLayer);
    const warRoomSubtree = captureTree<WarRoomStageLayerProps>(WarRoomStageLayer, { isMobile: false });
    const gltfNodes = findReactNodes<SafeGLTFModelProps>(warRoomSubtree, (n) => n.type === SafeGLTFModel);
    const haloNodes = findReactNodes(warRoomSubtree, (n) =>
      String(n.props?.['data-testid'] ?? '').startsWith('tycoon-diplomacy-halo-')
    );
    const bubbleNodes = findReactNodes(warRoomSubtree, (n) =>
      String(n.props?.['data-testid'] ?? '').startsWith('diplomacy-speech-bubble-')
    );

    expect(emptyWarRoomTree).toBeNull();
    expect(preloadedWhenEmpty).toEqual([
      '/models/pawns/pawn_horse.glb',
      '/models/pawns/pawn_tower.glb',
      '/models/pawns/pawn_yacht.glb',
      '/models/pawns/pawn_car.glb',
    ]);
    expect(warRoomNodeInSanctuary).not.toBeNull();
    expect([
      preloadedUrls.includes(WAR_ROOM_MODEL_URLS.gavel) && preloadedUrls.includes(WAR_ROOM_MODEL_URLS.scale),
      gltfNodes.map((n) => n.props.url),
      gltfNodes.every((n) => Array.isArray(n.props.scale) && n.props.scale[0] === 1.4 && n.props.scale[1] === 1.4),
      [haloNodes.length, bubbleNodes.length],
    ]).toEqual([true, [WAR_ROOM_MODEL_URLS.gavel, WAR_ROOM_MODEL_URLS.scale], true, [4, 4]]);
  });

  it('TC-403.04b [UC-DESKTOP-GLB-MOUNT-SPEECH-BUBBLE-AND-MOBILE-ISOLATION/A1]: Given WarRoomStageFrameLoop on Desktop with active auction and trade offer, When advancing frame ticks across 320ms and 2900ms TTL expiry, Then animates gavel, dais ring, and trade scale while active and deterministically resets poses without re-triggering on expiry', () => {
    const stage = getWarRoomStageDescriptor();
    const activeAuction: ModalPayloadMap['auction'] = {
      cellIndex: 12, currentBid: 3400, highestBidderId: 'p2', timeRemaining: 12,
    };
    const generousOffer: PendingTradeOfferDelta = {
      offerId: 'offer-gen', cellIndex: 1, price: 2500, buyerId: 'p2', sellerId: 'p1', expiresAt: 99999,
    };
    const nonMonopolyPlayers: Readonly<Record<string, PlayerHudInfo>> = {
      p1: { ...PLAYER_P1, balance: 2500, ownedProperties: [1] },
      p2: { ...PLAYER_P2, balance: 2500, ownedProperties: [6] },
      p3: { ...PLAYER_P3, balance: 2500, ownedProperties: [11] },
    };
    const gavelGroupRef = { current: new Group() };
    const scaleGroupRef = { current: new Group() };
    const daisRingRef = { current: new Mesh() };
    const auctionStartMsRef: { current: number | null } = { current: Date.now() - 320 };

    captureTree<WarRoomStageFrameLoopProps>(WarRoomStageFrameLoop, {
      auction: activeAuction,
      pendingTradeOffer: generousOffer,
      playersInfo: nonMonopolyPlayers,
      levelMap: {},
      gavelGroupRef,
      scaleGroupRef,
      daisRingRef,
      auctionStartMsRef,
    });
    sharedR3FHarness.advanceFrame(0.016);
    const activeAnimatedAt320ms =
      gavelGroupRef.current.position.y > stage.gavelWorldPosition[1] &&
      gavelGroupRef.current.rotation.x !== 0 &&
      daisRingRef.current.scale.x > 1 &&
      scaleGroupRef.current.rotation.z > 0;

    sharedR3FHarness.reset();
    auctionStartMsRef.current = Date.now() - 2900;
    captureTree<WarRoomStageFrameLoopProps>(WarRoomStageFrameLoop, {
      auction: activeAuction,
      pendingTradeOffer: null,
      playersInfo: nonMonopolyPlayers,
      levelMap: {},
      gavelGroupRef,
      scaleGroupRef,
      daisRingRef,
      auctionStartMsRef,
    });
    sharedR3FHarness.advanceFrame(0.016);
    const resetAfterExpiry =
      Math.abs(gavelGroupRef.current.position.y - stage.gavelWorldPosition[1]) < 1e-4 &&
      gavelGroupRef.current.rotation.x === 0 &&
      daisRingRef.current.scale.x === 1 &&
      scaleGroupRef.current.rotation.z === 0;
    sharedR3FHarness.advanceFrame(0.016);

    expect(activeAnimatedAt320ms).toBe(true);
    expect(resetAfterExpiry).toBe(true);
    expect(auctionStartMsRef.current).toBeNull();
    expect(gavelGroupRef.current.rotation.x).toBe(0);
  });

  it('TC-403.04c [UC-DESKTOP-GLB-MOUNT-SPEECH-BUBBLE-AND-MOBILE-ISOLATION/A2]: Given populated game store state on Mobile (isMobile = true), When rendering WarRoomStageLayer and CoastalIslandEnvironment, Then mounts 0 .glb models, 0 halo/bubble meshes, and registers 0 useSafeFrame subscribers in sharedR3FHarness', () => {
    useGameStore.setState({ playersInfo: MONOPOLY_PLAYERS, levelMap: MONOPOLY_LEVEL_MAP });
    const desktopHalos = getTycoonDiplomacyHaloDescriptors(MONOPOLY_PLAYERS, MONOPOLY_LEVEL_MAP);
    sharedR3FHarness.reset();
    const mobileWarRoomTree = captureTree<WarRoomStageLayerProps>(WarRoomStageLayer, { isMobile: true });
    const subscribersAfterMobile = sharedR3FHarness.getSubscriberCount();
    const mobileSanctuaryTree = captureTree(CornerTycoonSanctuaries, { isMobile: true, deviceMemoryGb: 16 });

    expect(mobileWarRoomTree).toBeNull();
    expect(mobileSanctuaryTree).toBeNull();
    expect([preloadedUrls.length, subscribersAfterMobile, desktopHalos.length]).toEqual([0, 0, 4]);
    expect(findReactNode(mobileSanctuaryTree, (n) => n.type === WarRoomStageLayer)).toBeNull();
  });
});
