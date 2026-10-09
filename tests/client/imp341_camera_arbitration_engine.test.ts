// [IMP-341] Living Contract Suite: Cinematic Camera Arbitration & Gesture Decoupling
// Rules: Detroit style, 1-4 asserts per it(), 0 loops in it(), Zero Dirty Casts, Seam Discipline
import { describe, it, expect } from 'vitest';
import {
  classifyGestureIntent,
  resolveActiveCameraDriver,
  createCameraArbitrationSession,
  DEFAULT_GRACE_PERIOD_MS,
  type GestureClassificationParams,
} from '../../src/client/3d/camera_arbitration_engine';

describe('[IMP-341] Camera Arbitration Engine & Gesture Decoupling', () => {
  // =========================================================================
  // FACET 1: 3D World Space Gesture Intent Classification (classifyGestureIntent)
  // =========================================================================
  describe('Facet 1: 3D World Space Gesture Intent Classification', () => {
    it('TC-341.01 [UC-ARB/MSS]: Given micro-touch parameters with touchDuration 40ms and distPos 0.08m, When calling classifyGestureIntent, Then returns action micro_touch and shouldGrantGracePeriod false', () => {
      const params: GestureClassificationParams = {
        touchDurationMs: 40,
        distPos: 0.08,
        distTarget: 0.04,
        isPawnAnimating: false,
        justBrokeSoftReturn: false,
      };
      const result = classifyGestureIntent(params);
      expect(result.action).toBe('micro_touch');
      expect(result.shouldGrantGracePeriod).toBe(false);
      expect(result.shouldClearJustBroke).toBe(false);
    });

    it('TC-341.02 [UC-ARB/A1]: Given tap parameters with touchDuration 100ms and distPos 0.1m during pawn movement, When calling classifyGestureIntent, Then returns action skip_animation', () => {
      const params: GestureClassificationParams = {
        touchDurationMs: 100,
        distPos: 0.1,
        distTarget: 0.05,
        isPawnAnimating: true,
        justBrokeSoftReturn: false,
      };
      const result = classifyGestureIntent(params);
      expect(result.action).toBe('skip_animation');
      expect(result.shouldGrantGracePeriod).toBe(false);
    });

    it('TC-341.03 [UC-ARB/A2]: Given tap parameters with justBrokeSoftReturn true and small delta, When calling classifyGestureIntent, Then returns action micro_touch and shouldClearJustBroke true without triggering tap-to-skip', () => {
      const params: GestureClassificationParams = {
        touchDurationMs: 90,
        distPos: 0.2,
        distTarget: 0.1,
        isPawnAnimating: true,
        justBrokeSoftReturn: true,
      };
      const result = classifyGestureIntent(params);
      expect(result.action).toBe('micro_touch');
      expect(result.shouldClearJustBroke).toBe(true);
      expect(result.shouldGrantGracePeriod).toBe(false);
    });

    it('TC-341.04 [UC-ARB/A3]: Given pan parameters with justBrokeSoftReturn true and large delta, When calling classifyGestureIntent, Then returns action manual_inspection and shouldGrantGracePeriod true', () => {
      const params: GestureClassificationParams = {
        touchDurationMs: 300,
        distPos: 0.9,
        distTarget: 0.6,
        isPawnAnimating: true,
        justBrokeSoftReturn: true,
      };
      const result = classifyGestureIntent(params);
      expect(result.action).toBe('manual_inspection');
      expect(result.shouldGrantGracePeriod).toBe(true);
      expect(result.shouldClearJustBroke).toBe(true);
    });

    it('TC-341.05 [UC-ARB/A4]: Given manual inspection parameters with distPos 0.6m, When calling classifyGestureIntent, Then returns action manual_inspection and shouldGrantGracePeriod true', () => {
      const params: GestureClassificationParams = {
        touchDurationMs: 250,
        distPos: 0.6,
        distTarget: 0.3,
        isPawnAnimating: false,
        justBrokeSoftReturn: false,
      };
      const result = classifyGestureIntent(params);
      expect(result.action).toBe('manual_inspection');
      expect(result.shouldGrantGracePeriod).toBe(true);
    });
  });

  // =========================================================================
  // FACET 2: Zero-Alloc Active Driver Resolution (resolveActiveCameraDriver)
  // =========================================================================
  describe('Facet 2: Zero-Alloc Active Driver Resolution', () => {
    it('TC-341.06 [UC-ARB/A5]: Given tick parameters with isDragging true, When calling resolveActiveCameraDriver, Then returns activeDriver user', () => {
      const driver = resolveActiveCameraDriver(true, false, false, true, false);
      expect(driver).toBe('user');
    });

    it('TC-341.07 [UC-ARB/A6]: Given tick parameters with isGracePeriodActive true and isDragging false, When calling resolveActiveCameraDriver, Then returns activeDriver user', () => {
      const driver = resolveActiveCameraDriver(false, true, false, true, false);
      expect(driver).toBe('user');
    });

    it('TC-341.08 [UC-ARB/A7]: Given tick parameters with hasSoftReturn true and isDragging false, When calling resolveActiveCameraDriver, Then returns activeDriver soft_return', () => {
      const driver = resolveActiveCameraDriver(false, false, true, true, false);
      expect(driver).toBe('soft_return');
    });

    it('TC-341.09 [UC-ARB/A8]: Given tick parameters with isActionOngoing true, When calling resolveActiveCameraDriver, Then returns activeDriver director', () => {
      const driver = resolveActiveCameraDriver(false, false, false, true, false);
      expect(driver).toBe('director');
    });

    it('TC-341.10 [UC-ARB/A9]: Given tick parameters with isResetting true, When calling resolveActiveCameraDriver, Then returns activeDriver director', () => {
      const driver = resolveActiveCameraDriver(false, false, false, false, true);
      expect(driver).toBe('director');
    });

    it('TC-341.11 [UC-ARB/A10]: Given tick parameters with no active driver conditions, When calling resolveActiveCameraDriver, Then returns activeDriver idle', () => {
      const driver = resolveActiveCameraDriver(false, false, false, false, false);
      expect(driver).toBe('idle');
    });
  });

  // =========================================================================
  // FACET 3: Arbitration Session & Grace Period Preemption Invariants
  // =========================================================================
  describe('Facet 3: Arbitration Session & Grace Period Preemption Invariants', () => {
    it('TC-341.12 [UC-ARB/A11]: Given arbitration session instantiated via createCameraArbitrationSession, When granting grace period of 800ms, Then isGracePeriodActive returns true within window and false afterwards', () => {
      const session = createCameraArbitrationSession();
      const startTime = 1000;
      session.grantGracePeriod(startTime, DEFAULT_GRACE_PERIOD_MS);
      expect(session.isGracePeriodActive(1400)).toBe(true);
      expect(session.isGracePeriodActive(1801)).toBe(false);
    });

    it('TC-341.13 [UC-ARB/A12]: Given arbitration session with active grace period, When activeModal is present, Then checkPreemption immediately cancels grace period and returns true', () => {
      const session = createCameraArbitrationSession();
      session.grantGracePeriod(1000, 800);
      const wasPreempted = session.checkPreemption('BUY_PROPERTY_MODAL', null, false, false);
      expect(wasPreempted).toBe(true);
      expect(session.isGracePeriodActive(1200)).toBe(false);
    });

    it('TC-341.14 [UC-ARB/A13]: Given arbitration session with active grace period, When cameraFocusCell is set, Then checkPreemption immediately cancels grace period and returns true', () => {
      const session = createCameraArbitrationSession();
      session.grantGracePeriod(1000, 800);
      const wasPreempted = session.checkPreemption(null, 15, false, false);
      expect(wasPreempted).toBe(true);
      expect(session.isGracePeriodActive(1200)).toBe(false);
    });

    it('TC-341.15 [UC-ARB/A14]: Given arbitration session with active grace period, When isRolling becomes true, Then checkPreemption immediately cancels grace period and returns true', () => {
      const session = createCameraArbitrationSession();
      session.grantGracePeriod(1000, 800);
      const wasPreempted = session.checkPreemption(null, null, true, false);
      expect(wasPreempted).toBe(true);
      expect(session.isGracePeriodActive(1200)).toBe(false);
    });

    it('TC-341.16 [UC-ARB/A15]: Given consecutive swipe gestures within 800ms, When granting successive grace periods, Then resets gracePeriodEndTime without director snap-back', () => {
      const session = createCameraArbitrationSession();
      session.grantGracePeriod(1000, 800); // ends at 1800
      expect(session.gracePeriodEndTime).toBe(1800);
      session.grantGracePeriod(1300, 800); // resets to end at 2100
      expect(session.gracePeriodEndTime).toBe(2100);
      expect(session.isGracePeriodActive(1900)).toBe(true);
    });

    it('TC-341.17 [UC-ARB/A16]: Given arbitration session with active grace period, When calling cancelGracePeriod, Then immediately cancels grace period', () => {
      const session = createCameraArbitrationSession();
      session.grantGracePeriod(1000, 800);
      expect(session.isGracePeriodActive(1400)).toBe(true);
      session.cancelGracePeriod();
      expect(session.isGracePeriodActive(1400)).toBe(false);
      expect(session.gracePeriodEndTime).toBe(0);
    });

    it('TC-341.18 [UC-ARB/A17]: Given arbitration session with active grace period, When isPawnMoving becomes true, Then checkPreemption immediately cancels grace period and returns true', () => {
      const session = createCameraArbitrationSession();
      session.grantGracePeriod(1000, 800);
      const wasPreempted = session.checkPreemption(null, null, false, false, true);
      expect(wasPreempted).toBe(true);
      expect(session.isGracePeriodActive(1200)).toBe(false);
    });
  });
});
