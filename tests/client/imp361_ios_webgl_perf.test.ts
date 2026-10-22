// [TC-361.01/MSS..TC-361.07/MSS][UC-HARDWARE-DETECT..UC-ADAPTIVE-IOS]
// Universal Adversarial Contract Test Suite: iOS WebGL Performance, Context Hints & Thermal Tuning
// Traceability: .agents/plans/PLAN_IMP_361_IOS_WEBGL_PERFORMANCE_AND_THERMAL_TUNING.md

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isIOSPhone,
  getRecommendedDpr,
  getRecommendedGlProfile,
} from '../../src/client/3d/device_detect';
import {
  PerfBudgetController,
  DPR_BOUNDS,
} from '../../src/client/3d/perf_budget';

describe('[IMP-361] iOS WebGL Performance, Context Hints & Thermal Tuning Contract Suite', () => {
  let originalNavigator: PropertyDescriptor | undefined;
  let originalWindow: PropertyDescriptor | undefined;

  beforeEach(() => {
    vi.restoreAllMocks();
    originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  });

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', originalNavigator);
    }
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', originalWindow);
    }
  });

  describe('Hardware & Platform Isolation', () => {
    it('[TC-361.01/MSS][UC-HARDWARE-DETECT] Given iPhone user agent, When calling isIOSPhone, Then returns true for iPhone hardware', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(globalThis, 'window', {
        value: { innerWidth: 393, innerHeight: 852 },
        configurable: true,
        writable: true,
      });

      const isPhone = isIOSPhone();
      expect(isPhone).toBe(true);
    });

    it('[TC-361.02/A1][UC-HARDWARE-DETECT] Given iPad Pro tablet user agent, When calling isIOSPhone, Then returns false preserving tablet high-fidelity performance profile', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
          maxTouchPoints: 5,
        },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(globalThis, 'window', {
        value: { innerWidth: 1024, innerHeight: 768 },
        configurable: true,
        writable: true,
      });

      const isPhone = isIOSPhone();
      expect(isPhone).toBe(false);
    });
  });

  describe('Recommended DPR Profile', () => {
    it('[TC-361.03/MSS][UC-DPR-IOS-PHONE] Given mobile iPhone device environment, When calling getRecommendedDpr, Then returns calibrated mobile DPR range 1.0 to 1.35 for crisp thermal stability', () => {
      const dprRange = getRecommendedDpr(true, true);
      expect(dprRange).toEqual([1.0, 1.35]);
    });

    it('[TC-361.04/MSS][UC-DPR-IOS-TABLET] Given iPadOS tablet device environment, When calling getRecommendedDpr, Then returns standard mobile tablet DPR range 1.0 to 1.35', () => {
      const dprRange = getRecommendedDpr(true, false);
      expect(dprRange).toEqual([1.0, 1.35]);
    });
  });

  describe('WebGL Context Hints & Power Preference', () => {
    it('[TC-361.05/MSS][UC-GL-PROFILE] Given mobile hardware context, When calling getRecommendedGlProfile, Then returns high-performance powerPreference, antialias true, highp precision, and logarithmicDepthBuffer false', () => {
      const glProfileMobile = getRecommendedGlProfile(true);
      expect(glProfileMobile).toEqual({
        antialias: true,
        powerPreference: 'high-performance',
        precision: 'highp',
        logarithmicDepthBuffer: false,
      });

      const glProfileDesktop = getRecommendedGlProfile(false);
      expect(glProfileDesktop).toEqual({
        antialias: true,
        powerPreference: 'high-performance',
        precision: 'highp',
        logarithmicDepthBuffer: true,
      });
    });
  });

  describe('Adaptive DPR Controller Thermal & Resolution Ceiling', () => {
    it('[TC-361.06/MSS][UC-ADAPTIVE-IOS-CEILING] Given PerfBudgetController with isIOSPhone true and sustained high FPS above 55, When evaluating adaptive DPR under high FPS, Then steps up strictly to IOS_PHONE_MAX 1.35', () => {
      const controller = new PerfBudgetController();
      const stepUpResult = controller.calculateAdaptiveDpr({
        isMobile: true,
        isIOSPhone: true,
        currentFps: 60,
        currentDpr: 1.0,
        isMotionActive: false,
        degradedDurationMs: 0,
        optimalDurationMs: DPR_BOUNDS.STEP_UP_DELAY_MS,
      });

      expect(stepUpResult.shouldUpdate).toBe(true);
      expect(stepUpResult.targetDpr).toBe(DPR_BOUNDS.IOS_PHONE_MAX);
      expect(stepUpResult.targetDpr).toBeLessThanOrEqual(1.35);
    });

    it('[TC-361.07/MSS][UC-ADAPTIVE-IOS-DEGRADED] Given PerfBudgetController with isIOSPhone true and degraded FPS below 45, When evaluating adaptive DPR under low FPS, Then steps down to MOBILE_MIN 1.0 cleanly', () => {
      const controller = new PerfBudgetController();
      const stepDownResult = controller.calculateAdaptiveDpr({
        isMobile: true,
        isIOSPhone: true,
        currentFps: 30,
        currentDpr: 1.35,
        isMotionActive: false,
        degradedDurationMs: DPR_BOUNDS.STEP_DOWN_DELAY_MS + 100,
        optimalDurationMs: 0,
      });

      expect(stepDownResult.shouldUpdate).toBe(true);
      expect(stepDownResult.targetDpr).toBe(DPR_BOUNDS.MOBILE_MIN);
      expect(stepDownResult.reason).toBe('STEP_DOWN');
    });
  });
});
