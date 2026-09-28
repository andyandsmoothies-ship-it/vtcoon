// [TC-222.01/MSS..TC-222.16/MSS][UC-IMP222]
// Contract Test Suite for IMP-222: Atmospheric Immersion & Living Tropical Breeze
// Universal 5-Facet Behavioral Matrix & Detroit Style
// (1-4 asserts/test, zero loops in it(), no static checklist tests, clean teardown)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import * as LightingModule from '../../src/client/3d/time_of_day_lighting';
import * as FoliageModule from '../../src/client/3d/layered_tropical_foliage';

// Station 1 RED dynamic contract bindings (resolves undefined until Implementer exports functions)
const { TimeOfDayLighting } = LightingModule;
const { LayeredTropicalFoliage } = FoliageModule;

const calculateTargetExposure = (LightingModule as Record<string, unknown>).calculateTargetExposure as
  | ((phase: string, isAuctionActive: boolean) => number)
  | undefined;

const lerpExposure = (LightingModule as Record<string, unknown>).lerpExposure as
  | ((current: number, target: number, rate: number) => number)
  | undefined;

const calculateFogTargets = (LightingModule as Record<string, unknown>).calculateFogTargets as
  | ((phase: 'day' | 'sunset' | 'night', isAuctionActive: boolean, preset?: unknown) => { near: number; far: number; color: string })
  | undefined;

const calculatePalmSwayAngles = (FoliageModule as Record<string, unknown>).calculatePalmSwayAngles as
  | ((time: number, x: number, z: number, tier?: 1 | 2 | 3) => { swayZ: number; swayX: number })
  | undefined;

const PALM_TIER_SWAY_FACTORS = (FoliageModule as Record<string, unknown>).PALM_TIER_SWAY_FACTORS as
  | Record<number, number>
  | undefined;

describe('[TC-222/MSS][UC-IMP222] Atmospheric Immersion & Living Tropical Breeze Contract Suite', () => {
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

  // =========================================================================
  // FACET 1: Tone Mapping Exposure Adaptation (TC-222.01 - TC-222.04)
  // =========================================================================
  describe('Facet 1: Tone Mapping Exposure Adaptation', () => {
    it('[TC-222.01/MSS][UC-IMP222][Facet-1/DayExposure] calculateTargetExposure("day", false) trả về chính xác 1.00', () => {
      expect(calculateTargetExposure?.('day', false)).toBe(1.00);
    });

    it('[TC-222.02/MSS][UC-IMP222][Facet-1/SunsetExposure] calculateTargetExposure("sunset", false) trả về giá trị ấm áp 1.06', () => {
      expect(calculateTargetExposure?.('sunset', false)).toBe(1.06);
    });

    it('[TC-222.03/MSS][UC-IMP222][Facet-1/NightExposure] calculateTargetExposure("night", false) trả về giá trị giãn đồng tử 1.14', () => {
      expect(calculateTargetExposure?.('night', false)).toBe(1.14);
    });

    it('[TC-222.04/MSS][UC-IMP222][Facet-1/AuctionExposure] Khi isAuctionActive = true, calculateTargetExposure(phase, true) luôn trả về 0.94 bất kể phase ("day", "sunset", "night")', () => {
      expect(calculateTargetExposure?.('day', true)).toBe(0.94);
      expect(calculateTargetExposure?.('sunset', true)).toBe(0.94);
      expect(calculateTargetExposure?.('night', true)).toBe(0.94);
    });
  });

  // =========================================================================
  // FACET 2: Theatrical Auction Fog & Sky Parameters (TC-222.05 - TC-222.07)
  // =========================================================================
  describe('Facet 2: Theatrical Auction Fog & Sky Parameters', () => {
    it('[TC-222.05/MSS][UC-IMP222][Facet-2/StandardFogDistance] Ở chế độ thường (isAuctionActive = false), calculateFogTargets(phase, false) duy trì khoảng cách xa tiêu chuẩn: near >= 40, far >= 160', () => {
      const fog = calculateFogTargets?.('day', false);
      expect(fog?.near).toBeGreaterThanOrEqual(40);
      expect(fog?.far).toBeGreaterThanOrEqual(160);
    });

    it('[TC-222.06/MSS][UC-IMP222][Facet-2/TheatricalFogDistance] Ở chế độ đấu giá (isAuctionActive = true), calculateFogTargets(phase, true) kéo sương mù sát lại: near = 18.0, far = 55.0', () => {
      const fog = calculateFogTargets?.('day', true);
      expect(fog?.near).toBe(18.0);
      expect(fog?.far).toBe(55.0);
    });

    it('[TC-222.07/MSS][UC-IMP222][Facet-2/TheatricalFogColor] Khi đấu giá, màu sương mù chuyển sang sắc tím than kịch nghệ "#0F172A"', () => {
      const fog = calculateFogTargets?.('night', true);
      expect(fog?.color).toBe('#0F172A');
    });
  });

  // =========================================================================
  // FACET 3: Palm Tree Micro-Sway Dynamics (TC-222.08 - TC-222.10)
  // =========================================================================
  describe('Facet 3: Palm Tree Micro-Sway Dynamics', () => {
    it('[TC-222.08/MSS][UC-IMP222][Facet-3/SwayAmplitudeBounds] calculatePalmSwayAngles(time, x, z, 3) tính toán góc dời swayZ trong [-0.022, 0.022] và swayX trong [-0.015, 0.015] rad, bảo đảm không làm gãy đổ tán cây', () => {
      const angles = calculatePalmSwayAngles?.(2.5, -17, -19, 3);
      expect(angles?.swayZ).toBeGreaterThanOrEqual(-0.022);
      expect(angles?.swayZ).toBeLessThanOrEqual(0.022);
      expect(angles?.swayX).toBeGreaterThanOrEqual(-0.015);
      expect(angles?.swayX).toBeLessThanOrEqual(0.015);
    });

    it('[TC-222.09/MSS][UC-IMP222][Facet-3/SpatialPhaseDiversity] Hai cây dừa ở tọa độ khác biệt (x1, z1) != (x2, z2) có góc rung lắc lệch pha nhau', () => {
      const treeA = calculatePalmSwayAngles?.(1.0, 5, 5, 3);
      const treeB = calculatePalmSwayAngles?.(1.0, -5, -5, 3);
      expect(treeA).toBeDefined();
      expect(treeB).toBeDefined();
      expect(treeA?.swayZ).not.toBe(treeB?.swayZ);
      expect(treeA?.swayX).not.toBe(treeB?.swayX);
    });

    it('[TC-222.10/MSS][UC-IMP222][Facet-3/TierHierarchicalDamping] calculatePalmSwayAngles(time, x, z, 3).swayZ có biên độ lớn hơn calculatePalmSwayAngles(time, x, z, 1).swayZ (PALM_TIER_SWAY_FACTORS[3] = 1.0 vs PALM_TIER_SWAY_FACTORS[1] = 0.6)', () => {
      const topTier = calculatePalmSwayAngles?.(1.0, 0, 0, 3);
      const bottomTier = calculatePalmSwayAngles?.(1.0, 0, 0, 1);
      expect(Math.abs(topTier?.swayZ ?? 0)).toBeGreaterThan(Math.abs(bottomTier?.swayZ ?? 0));
      expect(PALM_TIER_SWAY_FACTORS?.[3]).toBe(1.0);
      expect(PALM_TIER_SWAY_FACTORS?.[1]).toBe(0.6);
    });
  });

  // =========================================================================
  // FACET 4: Transition Continuity & Defensive Guards (TC-222.11 - TC-222.13)
  // =========================================================================
  describe('Facet 4: Transition Continuity & Defensive Guards', () => {
    it('[TC-222.11/MSS][UC-IMP222][Facet-4/ExposureContinuousLerp] lerpExposure(current, target, rate) hội tụ trơn tru không có bước nhảy gián đoạn', () => {
      const nextVal = lerpExposure?.(1.0, 1.14, 0.1);
      expect(nextVal).toBeCloseTo(1.014, 4);
    });

    it('[TC-222.12/MSS][UC-IMP222][Facet-4/FogContinuousLerp] Khoảng cách fogNear và fogFar tính toán biến thiên hợp lệ giữa bình thường và đấu giá', () => {
      const normalFog = calculateFogTargets?.('day', false);
      const auctionFog = calculateFogTargets?.('day', true);
      expect(normalFog).toBeDefined();
      expect(auctionFog).toBeDefined();
      expect(auctionFog?.near).toBeLessThan(normalFog?.near ?? Infinity);
      expect(auctionFog?.far).toBeLessThan(normalFog?.far ?? Infinity);
    });

    it('[TC-222.13/MSS][UC-IMP222][Facet-4/DefensiveNumberGuard] calculateTargetExposure và calculatePalmSwayAngles có guard fallback an toàn, không trả về NaN hay undefined khi nhận giá trị bất thường', () => {
      const fallbackExposure = calculateTargetExposure?.('invalid_phase', false);
      const fallbackSway = calculatePalmSwayAngles?.(NaN, 0, 0, 3);
      expect(fallbackExposure).toBe(1.00);
      expect(fallbackSway).toEqual({ swayZ: 0, swayX: 0 });
    });
  });

  // =========================================================================
  // FACET 5: Backward Compatibility & Resource Integrity (TC-222.14 - TC-222.16)
  // =========================================================================
  describe('Facet 5: Backward Compatibility & Resource Integrity', () => {
    it('[TC-222.14/MSS][UC-IMP222][Facet-5/LightingMarkupIntegrity] renderToStaticMarkup(<TimeOfDayLighting />) bảo toàn 100% data-testid="time-of-day-lighting" và các thẻ ánh sáng gốc', () => {
      const markup = renderToStaticMarkup(React.createElement(TimeOfDayLighting));
      expect(markup).toContain('data-testid="time-of-day-lighting"');
      expect(markup.toLowerCase()).toContain('ambientlight');
      expect(markup.toLowerCase()).toContain('directionallight');
    });

    it('[TC-222.15/MSS][UC-IMP222][Facet-5/FoliageInstancedMeshIntegrity] LayeredTropicalFoliage duy trì 4 cụm instancedMesh cho 32 cây với số lượng draw call không đổi', () => {
      const markup = renderToStaticMarkup(React.createElement(LayeredTropicalFoliage));
      expect(markup).toContain('data-testid="layered-tropical-foliage"');
      expect(markup.toLowerCase()).toContain('instancedmesh');
      const matches = markup.match(/<instancedmesh/gi);
      expect(matches?.length).toBe(4);
    });

    it('[TC-222.16/MSS][UC-IMP222][Facet-5/SSRMarkupSafety] Cả hai component kết xuất trơn tru không lỗi trong môi trường Node.js headless', () => {
      const lightingMarkup = renderToStaticMarkup(React.createElement(TimeOfDayLighting));
      const foliageMarkup = renderToStaticMarkup(React.createElement(LayeredTropicalFoliage));
      expect(typeof lightingMarkup).toBe('string');
      expect(lightingMarkup.length).toBeGreaterThan(0);
      expect(typeof foliageMarkup).toBe('string');
      expect(foliageMarkup.length).toBeGreaterThan(0);
    });
  });
});
