// [TC-364/MSS][UC-IMP364] Contract Test Suite: Static Shadow Map Caching & Idle Workload Thermal Hardening (IMP-364)
// Universal 5-Facet Behavioral Matrix Verification:
// Facet 1: Boundary & Range (Sun position Euclidean delta threshold, grace period boundaries)
// Facet 2: State Reactivity & Cycle Teardown (Dice, pawn, building, and sun motion trigger shadow autoUpdate)
// Facet 3: Resource Disposal & Timer Isolation (Shadow settling window countdown, zero leak)
// Facet 4: Error Defense & Terminal Invariants (Grace guard on NaN / non-finite timestamps, null light defense)
// Facet 5: Cross-Coupling Blast Radius (TimeOfDayLighting coordinator and Three.js DirectionalLight state transitions)

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DirectionalLight, Vector3 } from 'three';
import {
  shouldUpdateShadows,
  isSunPositionMoving,
  calculateShadowGraceRemaining,
  applyShadowAutoUpdate,
  type ShadowUpdateParams,
} from '../../src/client/3d/shadow_cache_helpers';
import {
  TimeOfDayLighting,
  updateLightingShadowCache,
  type TimeOfDayLightingProps,
} from '../../src/client/3d/time_of_day_lighting';

describe('IMP-364: Static Shadow Map Caching & Idle Workload Thermal Hardening', () => {
  it('TC-364.01 [UC-SHADOW-IDLE/MSS] returns false to freeze shadow depth passes when all motion flags are false or empty', () => {
    const idleParams: ShadowUpdateParams = {
      isRolling: false,
      isPawnMoving: false,
      isSunMoving: false,
      isBuildingDirty: false,
    };
    expect(shouldUpdateShadows(idleParams)).toBe(false);
    expect(shouldUpdateShadows({})).toBe(false);
  });

  it('TC-364.02 [UC-SHADOW-DICE/MSS] returns true to awaken shadow map rendering when dice rolling flag is active', () => {
    const rollingParams: ShadowUpdateParams = {
      isRolling: true,
      isPawnMoving: false,
      isSunMoving: false,
      isBuildingDirty: false,
    };
    expect(shouldUpdateShadows(rollingParams)).toBe(true);
  });

  it('TC-364.03 [UC-SHADOW-PAWN/MSS] returns true to awaken shadow map rendering when pawn moving flag is active', () => {
    const pawnParams: ShadowUpdateParams = {
      isRolling: false,
      isPawnMoving: true,
      isSunMoving: false,
      isBuildingDirty: false,
    };
    expect(shouldUpdateShadows(pawnParams)).toBe(true);
  });

  it('TC-364.04 [UC-SHADOW-BUILDING/MSS] returns true to bake new construction shadows when building level change flag is active', () => {
    const buildingParams: ShadowUpdateParams = {
      isRolling: false,
      isPawnMoving: false,
      isSunMoving: false,
      isBuildingDirty: true,
    };
    expect(shouldUpdateShadows(buildingParams)).toBe(true);
  });

  it('TC-364.05 [UC-SHADOW-SUN-MOVING/MSS] returns true to track moving daylight when sun trajectory flag is active', () => {
    const sunParams: ShadowUpdateParams = {
      isRolling: false,
      isPawnMoving: false,
      isSunMoving: true,
      isBuildingDirty: false,
    };
    expect(shouldUpdateShadows(sunParams)).toBe(true);
  });

  it('TC-364.06 [UC-SUN-DELTA-STATIONARY/MSS] returns false when sun position is within stationary threshold of target', () => {
    const currentPos = new Vector3(10.0, 20.0, 10.0);
    const targetPos = new Vector3(10.005, 20.0, 10.0);
    const targetArray: [number, number, number] = [10.005, 20.0, 10.0];
    expect(isSunPositionMoving(currentPos, targetPos)).toBe(false);
    expect(isSunPositionMoving(currentPos, targetArray)).toBe(false);
  });

  it('TC-364.07 [UC-SUN-DELTA-ACTIVE/MSS] returns true when sun position is distant from target indicating transit', () => {
    const currentPos = new Vector3(10.0, 20.0, 10.0);
    const targetPos = new Vector3(12.0, 20.0, 10.0);
    const currentObj = { x: 10.0, y: 20.0, z: 10.0 };
    const targetArray: [number, number, number] = [12.0, 20.0, 10.0];
    expect(isSunPositionMoving(currentPos, targetPos)).toBe(true);
    expect(isSunPositionMoving(currentObj, targetArray)).toBe(true);
  });

  it('TC-364.08 [UC-SHADOW-GRACE-ACTIVE/MSS] returns positive remaining milliseconds when elapsed time is within 800ms grace period', () => {
    const lastMotionTime = 1000;
    const now = 1300;
    const remaining = calculateShadowGraceRemaining(lastMotionTime, now, 800);
    expect(remaining).toBe(500);
    expect(remaining).toBeGreaterThan(0);
  });

  it('TC-364.09 [UC-SHADOW-GRACE-EXPIRED/MSS] returns 0 when elapsed time reaches or exceeds 800ms grace period to allow static freezing', () => {
    const lastMotionTime = 1000;
    const nowExpired = 1900;
    const nowExact = 1800;
    expect(calculateShadowGraceRemaining(lastMotionTime, nowExpired, 800)).toBe(0);
    expect(calculateShadowGraceRemaining(lastMotionTime, nowExact, 800)).toBe(0);
  });

  it('TC-364.10 [UC-SHADOW-GRACE-GUARD/MSS] safely returns bounded grace or zero without NaN given non-finite timestamps or negative elapsed', () => {
    expect(calculateShadowGraceRemaining(Number.NaN, 1000, 800)).toBe(0);
    expect(calculateShadowGraceRemaining(1000, Number.POSITIVE_INFINITY, 800)).toBe(0);
    expect(calculateShadowGraceRemaining(2000, 1000, 800)).toBe(800);
  });

  it('TC-364.11 [UC-LIGHT-SHADOW-FREEZE/MSS] disables autoUpdate and returns false when activeUpdate is false', () => {
    const light = new DirectionalLight(0xffffff, 1);
    light.shadow.autoUpdate = true;
    const result = applyShadowAutoUpdate(light, false);
    expect(result).toBe(false);
    expect(light.shadow.autoUpdate).toBe(false);
  });

  it('TC-364.12 [UC-LIGHT-SHADOW-AWAKEN/MSS] enables autoUpdate and sets needsUpdate true when activeUpdate is true', () => {
    const light = new DirectionalLight(0xffffff, 1);
    light.shadow.autoUpdate = false;
    light.shadow.needsUpdate = false;
    const result = applyShadowAutoUpdate(light, true);
    expect(result).toBe(true);
    expect(light.shadow.autoUpdate).toBe(true);
    expect(light.shadow.needsUpdate).toBe(true);
  });

  it('TC-364.13 [UC-LIGHT-SHADOW-NULL/MSS] safely returns false without throwing exceptions given null light or light without shadow', () => {
    const nullResult = applyShadowAutoUpdate(null, true);
    expect(nullResult).toBe(false);

    const nullFalseResult = applyShadowAutoUpdate(null, false);
    expect(nullFalseResult).toBe(false);

    const light = new DirectionalLight(0xffffff, 1);
    Reflect.deleteProperty(light, 'shadow');
    const noShadowResult = applyShadowAutoUpdate(light, true);
    expect(noShadowResult).toBe(false);
  });

  it('TC-364.14 [UC-LIGHTING-WIRING-IDLE/MSS] updateLightingShadowCache in time_of_day_lighting disables autoUpdate when idle and grace period has elapsed', () => {
    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    light.shadow.autoUpdate = true;
    const result = updateLightingShadowCache(light, {
      isRolling: false,
      isPawnMoving: false,
      isBuildingDirty: false,
      targetSunPosition: [10, 20, 10],
      lastMotionTimeMs: 1000,
      nowMs: 1900,
      gracePeriodMs: 800,
    });
    expect(result.autoUpdate).toBe(false);
    expect(result.needsShadows).toBe(false);
    expect(light.shadow.autoUpdate).toBe(false);
  });

  it('TC-364.15a [UC-LIGHTING-WIRING-SLAM/MSS] updateLightingShadowCache awakens shadow map and updates motion timestamp when building is dirty', () => {
    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    light.shadow.autoUpdate = false;
    const result = updateLightingShadowCache(light, {
      isRolling: false,
      isPawnMoving: false,
      isBuildingDirty: true,
      targetSunPosition: [10, 20, 10],
      lastMotionTimeMs: 1000,
      nowMs: 2000,
      gracePeriodMs: 800,
    });
    expect(result.autoUpdate).toBe(true);
    expect(result.needsShadows).toBe(true);
    expect(result.lastMotionTimeMs).toBe(2000);
  });

  it('TC-364.15b [UC-LIGHTING-WIRING-SLAM/MSS] updateLightingShadowCache synchronizes light shadow properties when building is dirty', () => {
    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    light.shadow.autoUpdate = false;
    updateLightingShadowCache(light, {
      isRolling: false,
      isPawnMoving: false,
      isBuildingDirty: true,
      targetSunPosition: [10, 20, 10],
      lastMotionTimeMs: 1000,
      nowMs: 2000,
      gracePeriodMs: 800,
    });
    expect(light.shadow.autoUpdate).toBe(true);
    expect(light.shadow.needsUpdate).toBe(true);
  });

  it('TC-364.16 [UC-LIGHTING-MARKUP-INTEGRITY/MSS] TimeOfDayLighting renders without crash and preserves root data-testid', () => {
    const mobileMarkup = renderToStaticMarkup(React.createElement<TimeOfDayLightingProps>(TimeOfDayLighting, { isMobile: true }));
    expect(mobileMarkup).toContain('data-testid="time-of-day-lighting"');
    const desktopMarkup = renderToStaticMarkup(React.createElement<TimeOfDayLightingProps>(TimeOfDayLighting, { isMobile: false }));
    expect(desktopMarkup).toContain('data-testid="time-of-day-lighting"');
  });
});
