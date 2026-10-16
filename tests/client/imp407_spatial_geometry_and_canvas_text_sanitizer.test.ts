// [TC-407/MSS][IMP-407] Contract Test Suite: 3D Spatial Geometry SSOT, Overview Frustum Projection & Canvas Text Sanitizer
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  computeTransformedAABB2D,
  checkAABBCollision2D,
  projectToOverviewNdc,
  isOverviewFrustumSafe,
  type Box2D,
  type TransformedAABBSpec,
} from '../../src/client/3d/spatial_geometry_helpers';
import {
  sanitizeCanvasText,
  hasMissingGlyphEmoji,
  DEFAULT_CANVAS_TEXT_FALLBACK,
} from '../../src/client/3d/canvas_text_sanitizer';
import {
  getWarRoomStageDescriptor,
  createDiplomacySpeechBubbleTexture,
  disposeDiplomacySpeechBubbleTextures,
  type TycoonTacticalMode,
  type WarRoomStageDescriptor,
} from '../../src/client/3d/war_room_stage_visuals';

describe('IMP-407: 3D Spatial Geometry SSOT & Canvas Text Sanitizer Contract Suite', () => {
  beforeEach(() => {
    disposeDiplomacySpeechBubbleTextures();
  });

  afterEach(() => {
    disposeDiplomacySpeechBubbleTextures();
  });

  it('[TC-407.01a/MSS][UC-TRANSFORMED-AABB-SCALING-AND-ROTATION-SSOT] computeTransformedAABB2D calculates exact ground X-Z extents with yaw rotation and absolute scaling', () => {
    const rotatedSpec: TransformedAABBSpec = {
      center: [10, 0, 5],
      baseSize: { width: 2.0, depth: 1.0 },
      scale: [-1.5, 1, 2.0],
      rotationY: Math.PI / 4,
    };
    const unrotatedSpec: TransformedAABBSpec = {
      center: [10, 0, 5],
      baseSize: { width: 2.0, depth: 1.0 },
      scale: [-1.5, 1, 2.0],
      rotationY: 0,
    };
    const unitScaledSpec: TransformedAABBSpec = {
      center: [10, 0, 5],
      baseSize: { width: 2.0, depth: 1.0 },
      scale: [1, 1, 1],
      rotationY: Math.PI / 4,
    };

    const rotatedBox = computeTransformedAABB2D(rotatedSpec);
    const unrotatedBox = computeTransformedAABB2D(unrotatedSpec);
    const unitScaledBox = computeTransformedAABB2D(unitScaledSpec);

    // E_x = 1.5 * cos(pi/4) + 1.0 * sin(pi/4) = 2.5 * sqrt(2)/2 ~= 1.7678; width = 2 * E_x ~= 3.5355
    expect(rotatedBox.width).toBeCloseTo(3.5355, 3);
    expect(rotatedBox.depth).toBeCloseTo(3.5355, 3);
    expect(rotatedBox.width).not.toEqual(unrotatedBox.width);
    expect(rotatedBox.width).not.toEqual(unitScaledBox.width);
  });

  it('[TC-407.01b/MSS][UC-TRANSFORMED-AABB-SCALING-AND-ROTATION-SSOT] checkAABBCollision2D detects overlapping boxes and clearance margin separation', () => {
    const boxA: Box2D = { minX: 0, maxX: 2, minZ: 0, maxZ: 2, width: 2, depth: 2 };
    const boxBOverlapping: Box2D = { minX: 1.5, maxX: 3.5, minZ: 1.5, maxZ: 3.5, width: 2, depth: 2 };
    const boxCNarrowGap: Box2D = { minX: 2.1, maxX: 4.1, minZ: 0, maxZ: 2, width: 2, depth: 2 };
    const boxDWideGap: Box2D = { minX: 2.3, maxX: 4.3, minZ: 0, maxZ: 2, width: 2, depth: 2 };

    expect(checkAABBCollision2D(boxA, boxBOverlapping, 0)).toBe(true);
    expect(checkAABBCollision2D(boxA, boxCNarrowGap, 0)).toBe(false);
    expect(checkAABBCollision2D(boxA, boxCNarrowGap, 0.2)).toBe(true);
    expect(checkAABBCollision2D(boxA, boxDWideGap, 0.2)).toBe(false);
  });

  it('[TC-407.02a/MSS][UC-OVERVIEW-CAMERA-FRUSTUM-PROJECTION-AND-SAFETY-GUARD] projectToOverviewNdc maps 3D world coordinates to normalized device coordinates without NaN', () => {
    const sanctuaryPoint: readonly [number, number, number] = [-12.4, -0.28, 1.6];
    const distantPoint: readonly [number, number, number] = [-18.5, 0, 18.5];

    const [ndcXDesk, ndcYDesk] = projectToOverviewNdc(sanctuaryPoint, 1.6);
    const [ndcXMob] = projectToOverviewNdc(sanctuaryPoint, 9 / 16);
    const [ndcXDist] = projectToOverviewNdc(distantPoint, 1.6);

    expect(Number.isFinite(ndcXDesk)).toBe(true);
    expect(Number.isFinite(ndcYDesk)).toBe(true);
    expect(ndcXDesk).not.toEqual(ndcXMob);
    expect(ndcXDist).not.toEqual(ndcXDesk);
  });

  it('[TC-407.02b/MSS][UC-OVERVIEW-CAMERA-FRUSTUM-PROJECTION-AND-SAFETY-GUARD] isOverviewFrustumSafe evaluates safety thresholds across aspect ratios and bounds', () => {
    const sanctuaryPoint: readonly [number, number, number] = [-12.4, -0.28, 1.6];
    const distantPoint: readonly [number, number, number] = [-18.5, 0, 18.5];

    const isDeskSafe = isOverviewFrustumSafe(sanctuaryPoint, 1.6);
    const isMobSafe = isOverviewFrustumSafe(sanctuaryPoint, 9 / 16);
    const isDistSafe = isOverviewFrustumSafe(distantPoint, 1.6);
    const isStrictDeskSafe = isOverviewFrustumSafe(sanctuaryPoint, 1.6, 0.05, 0.05);

    expect(isDeskSafe).toBe(true);
    expect(isMobSafe).toBe(false);
    expect(isDistSafe).toBe(false);
    expect(isStrictDeskSafe).toBe(false);
  });

  it('[TC-407.03a/MSS][UC-CANVAS-TEXT-GLYPH-SANITATION-AND-EMOJI-PURGE] sanitizeCanvasText purges emojis while preserving Vietnamese diacritics, currency, and punctuation', () => {
    const overlordText = '👑 Bá Chủ Độc Quyền 🏰';
    const rescueText = '🚨 Cứu Thanh Khoản! ⚠️';
    const currencyText = 'Thưởng 500k ₫ (+15% Thuế)';
    const nfdText = 'Ba\u0301 Chu\u0309 \u0110o\u0302\u0323c Quye\u0302\u0300n';

    expect(sanitizeCanvasText(overlordText)).toBe('Bá Chủ Độc Quyền');
    expect(sanitizeCanvasText(rescueText)).toBe('Cứu Thanh Khoản!');
    expect(sanitizeCanvasText(currencyText)).toBe('Thưởng 500k ₫ (+15% Thuế)');
    expect(sanitizeCanvasText(nfdText)).toBe('Bá Chủ Độc Quyền');
  });

  it('[TC-407.03b/MSS][UC-CANVAS-TEXT-GLYPH-SANITATION-AND-EMOJI-PURGE] sanitizeCanvasText fallbacks on empty or all-emoji input and hasMissingGlyphEmoji detects emoji glyphs', () => {
    const allEmoji = '👑 ⭐ ⏰ 🇻🇳';
    const fallbackVal = 'Chưa Có';
    const sampleWithEmoji = '👑 Bá Chủ';
    const cleanSample = 'Bá Chủ Độc Quyền 500k ₫';

    expect(sanitizeCanvasText(allEmoji)).toBe(DEFAULT_CANVAS_TEXT_FALLBACK);
    expect(sanitizeCanvasText(allEmoji, fallbackVal)).toBe(fallbackVal);
    expect(hasMissingGlyphEmoji(sampleWithEmoji)).toBe(true);
    expect(hasMissingGlyphEmoji(cleanSample)).toBe(false);
  });

  it('[TC-407.04a/MSS][UC-WAR-ROOM-INTEGRATION-AND-CALLSITE-WIRING] getWarRoomStageDescriptor verifies non-collision equipment clearance and overview projection', () => {
    const descriptor: WarRoomStageDescriptor = getWarRoomStageDescriptor();
    const projectedDais = projectToOverviewNdc(descriptor.daisPosition);

    expect(descriptor.isEquipmentClearanceSafe).toBe(true);
    expect(Number.isFinite(descriptor.ndcX)).toBe(true);
    expect(Number.isFinite(descriptor.ndcY)).toBe(true);
    expect(descriptor.ndcX).toEqual(projectedDais[0]);
  });

  it('[TC-407.04b/MSS][UC-WAR-ROOM-INTEGRATION-AND-CALLSITE-WIRING] createDiplomacySpeechBubbleTexture uses sanitized text and unifies texture cache across emoji variants', () => {
    const tacticalMode: TycoonTacticalMode = 'EXPANSION';
    const accentColor = '#10B981';

    const tex1 = createDiplomacySpeechBubbleTexture('👑 Bá Chủ Độc Quyền', accentColor, tacticalMode);
    const tex2 = createDiplomacySpeechBubbleTexture('🏰 Bá Chủ Độc Quyền ⚔️', accentColor, tacticalMode);
    const texDiff = createDiplomacySpeechBubbleTexture('Khác Biệt Hoàn Toàn', accentColor, tacticalMode);

    expect(tex1.userData?.renderedText).toBe('Bá Chủ Độc Quyền');
    expect(tex2).toBe(tex1);
    expect(texDiff).not.toBe(tex1);
    expect(texDiff.userData?.renderedText).toBe('Khác Biệt Hoàn Toàn');
  });
});
