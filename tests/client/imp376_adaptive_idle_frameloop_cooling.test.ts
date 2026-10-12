// [TEST][IMP-376] Living Contract Tests for Adaptive Idle Frameloop Cooldown & Thermal Hardening
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  is3DModalActive,
  hasActiveDictionaryKeys,
  isGameMotionActive,
  calculateIdleGraceRemaining,
  calculateIdleCoolingMode,
  shouldRenderFrame,
  IDLE_COOLING_CONFIG,
  JITTER_SLACK_SEC,
} from '../../src/client/3d/idle_cooling_helpers';
import { AdaptiveIdleCoolingController } from '../../src/client/3d/adaptive_idle_cooling_controller';
import { GameCanvas, type GameCanvasProps } from '../../src/client/game_canvas';
import { captureTree, findReactNode } from '../helpers/threejs_test_utils';
import { useGameStore } from '../../src/client/store/game_store';
import { useVfxStore } from '../../src/client/store/vfx_store';

import { sharedR3FHarness } from '../helpers/r3f_test_harness';

vi.mock('@react-three/drei', () => ({
  ContactShadows: () => null,
  OrbitControls: () => null,
  Environment: () => null,
}));

vi.mock('@react-three/fiber', async () => {
  const { createR3FMock, sharedR3FHarness } = await import('../helpers/r3f_test_harness');
  return createR3FMock(sharedR3FHarness);
});

describe('IMP-376: Adaptive Idle Frameloop Cooldown & Thermal Hardening', () => {
  beforeEach(() => {
    sharedR3FHarness.reset();
    vi.restoreAllMocks();
    useGameStore.setState({
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      cameraFocusCell: null,
      activeModal: null,
    });
    useVfxStore.setState({
      activeScreenShake: null,
      activeSlams: {},
      activePawnReactions: {},
    });
  });

  // TC-376.01a [UC-MODAL-MOTION-TAXONOMY/MSS]: Given modal identifiers, When calling is3DModalActive, Then returns true for dynamic 3D auction and event card modals.
  it('TC-376.01a [UC-MODAL-MOTION-TAXONOMY/MSS]: returns true for continuous 3D dynamic animated modals', () => {
    expect(is3DModalActive('auction')).toBe(true);
    expect(is3DModalActive('event')).toBe(true);
  });

  // TC-376.01b [UC-MODAL-MOTION-TAXONOMY/MSS]: Given modal identifiers, When calling is3DModalActive, Then returns false for static 2D reading modals.
  it('TC-376.01b [UC-MODAL-MOTION-TAXONOMY/MSS]: returns false for static 2D reading overlays', () => {
    expect(is3DModalActive('property_deed')).toBe(false);
    expect(is3DModalActive('trade')).toBe(false);
    expect(is3DModalActive(null)).toBe(false);
  });

  // TC-376.02 [UC-ZERO-ALLOC-DICTIONARY-CHECK/MSS]: Given dictionary records, When calling hasActiveDictionaryKeys, Then returns true if record contains properties without allocating heap arrays and false for empty or null records.
  it('TC-376.02 [UC-ZERO-ALLOC-DICTIONARY-CHECK/MSS]: zero-allocation dictionary check detects active keys without heap churn', () => {
    expect(hasActiveDictionaryKeys({})).toBe(false);
    expect(hasActiveDictionaryKeys(null)).toBe(false);
    expect(hasActiveDictionaryKeys(undefined)).toBe(false);
    expect(hasActiveDictionaryKeys({ 1: { id: 'slam_1' } })).toBe(true);
  });

  // TC-376.03a [UC-MOTION-DETECTION/MSS]: Given game store activity flags and pawn queue, When calling isGameMotionActive, Then returns true if rolling or pawn hopping.
  it('TC-376.03a [UC-MOTION-DETECTION/MSS]: detects physical motion from dice and pawn animation', () => {
    expect(isGameMotionActive({})).toBe(false);
    expect(isGameMotionActive({ isRolling: true })).toBe(true);
    expect(isGameMotionActive({ isPawnAnimating: true })).toBe(true);
  });

  // TC-376.03b [UC-MOTION-DETECTION/MSS]: Given camera transition and VFX states, When calling isGameMotionActive, Then returns true for active slams and 3D modals.
  it('TC-376.03b [UC-MOTION-DETECTION/MSS]: detects physical motion from camera focus, construction VFX, and 3D modals', () => {
    expect(isGameMotionActive({ isCameraTransitioning: true })).toBe(true);
    expect(isGameMotionActive({ hasActiveVfx: true })).toBe(true);
    expect(isGameMotionActive({ activeModal: 'auction' })).toBe(true);
    expect(isGameMotionActive({ activeModal: 'property_deed' })).toBe(false);
  });

  // TC-376.04 [UC-IDLE-GRACE-PERIOD/MSS]: Given motion finishes at timestamp T, When calling calculateIdleGraceRemaining, Then returns positive remaining grace duration within 1200ms window and 0 after expiration.
  it('TC-376.04 [UC-IDLE-GRACE-PERIOD/MSS]: computes 1200ms kinematic grace period preventing premature cooling', () => {
    const lastMotionTime = 10000;
    expect(calculateIdleGraceRemaining(lastMotionTime, 10400)).toBe(800);
    expect(calculateIdleGraceRemaining(lastMotionTime, 11200)).toBe(0);
    expect(calculateIdleGraceRemaining(lastMotionTime, 12000)).toBe(0);
    expect(calculateIdleGraceRemaining(NaN, 10000)).toBe(0);
  });

  // TC-376.05a [UC-COOLING-MODE-SELECTION/MSS]: Given device and motion states, When calling calculateIdleCoolingMode, Then selects ACTIVE_60FPS during motion and active grace period.
  it('TC-376.05a [UC-COOLING-MODE-SELECTION/MSS]: selects ACTIVE_60FPS during active gameplay motion or unexpired grace', () => {
    expect(
      calculateIdleCoolingMode({ isMobile: true, isMotionActive: true, remainingGraceMs: 0 })
    ).toBe('ACTIVE_60FPS');
    expect(
      calculateIdleCoolingMode({ isMobile: true, isMotionActive: false, remainingGraceMs: 500 })
    ).toBe('ACTIVE_60FPS');
  });

  // TC-376.05b [UC-COOLING-MODE-SELECTION/MSS]: Given device and motion states, When calling calculateIdleCoolingMode, Then selects IDLE_COOLING_30FPS on mobile, ACTIVE_60FPS on desktop, and SUSPENDED when document is hidden.
  it('TC-376.05b [UC-COOLING-MODE-SELECTION/MSS]: selects IDLE_COOLING_30FPS on mobile, desktop full FPS, and suspended in background', () => {
    expect(
      calculateIdleCoolingMode({ isMobile: true, isMotionActive: false, remainingGraceMs: 0 })
    ).toBe('IDLE_COOLING_30FPS');
    expect(
      calculateIdleCoolingMode({ isMobile: false, isMotionActive: false, remainingGraceMs: 0 })
    ).toBe('ACTIVE_60FPS');
    expect(
      calculateIdleCoolingMode({ isMobile: true, isMotionActive: true, isDocumentHidden: true, remainingGraceMs: 1200 })
    ).toBe('SUSPENDED_BACKGROUND');
  });

  // TC-376.06a [UC-FRAME-PACING-MATH/MSS]: Given non-finite inputs and slight jitter on mobile, When calling shouldRenderFrame, Then sanitizes NaN and preserves 60 FPS.
  it('TC-376.06a [UC-FRAME-PACING-MATH/MSS]: sanitizes NaN and preserves 60 FPS on 60Hz displays with jitter slack', () => {
    const nanRes = shouldRenderFrame({
      mode: 'ACTIVE_60FPS',
      isMobile: true,
      deltaSec: NaN,
      accumulatedDeltaSec: NaN,
    });
    expect(nanRes.shouldRender).toBe(false);
    expect(nanRes.nextAccumulatedDeltaSec).toBe(0);

    const jitter60HzRes = shouldRenderFrame({
      mode: 'ACTIVE_60FPS',
      isMobile: true,
      deltaSec: 0.0165,
      accumulatedDeltaSec: 0,
    });
    expect(jitter60HzRes.shouldRender).toBe(true);
  });

  // TC-376.06b [UC-FRAME-PACING-MATH/MSS]: Given 120Hz ProMotion and 30 FPS idle modes on mobile, When calling shouldRenderFrame, Then clamps 120Hz to 60 FPS and throttles idle to 30 FPS.
  it('TC-376.06b [UC-FRAME-PACING-MATH/MSS]: clamps 120Hz ProMotion to 60 FPS and throttles idle mode to 30 FPS', () => {
    const proMotionTick1 = shouldRenderFrame({
      mode: 'ACTIVE_60FPS',
      isMobile: true,
      deltaSec: 0.00833,
      accumulatedDeltaSec: 0,
    });
    expect(proMotionTick1.shouldRender).toBe(false);
    expect(proMotionTick1.nextAccumulatedDeltaSec).toBeCloseTo(0.00833, 4);

    const idleTick1 = shouldRenderFrame({
      mode: 'IDLE_COOLING_30FPS',
      isMobile: true,
      deltaSec: 0.0166,
      accumulatedDeltaSec: 0,
    });
    expect(idleTick1.shouldRender).toBe(false);

    const idleTick2 = shouldRenderFrame({
      mode: 'IDLE_COOLING_30FPS',
      isMobile: true,
      deltaSec: 0.0166,
      accumulatedDeltaSec: idleTick1.nextAccumulatedDeltaSec,
    });
    expect(idleTick2.shouldRender).toBe(true);
  });

  // TC-376.06c [UC-FRAME-PACING-MATH/MSS]: Given a lag spike delta larger than frame interval, When calling shouldRenderFrame, Then resets accumulated delta preventing unbounded growth.
  it('TC-376.06c [UC-FRAME-PACING-MATH/MSS]: resets accumulated delta on large lag spike preventing unbounded growth', () => {
    const lagSpikeRes = shouldRenderFrame({
      mode: 'ACTIVE_60FPS',
      isMobile: true,
      deltaSec: 0.05,
      accumulatedDeltaSec: 0,
    });
    expect(lagSpikeRes.shouldRender).toBe(true);
    expect(lagSpikeRes.nextAccumulatedDeltaSec).toBe(0);
  });

  // TC-376.07a [UC-CONTROLLER-R3F-WIRING/MSS]: Given AdaptiveIdleCoolingController mounted on mobile, When idle grace period expires, Then throttles gl.render calls to 30 FPS.
  it('TC-376.07a [UC-CONTROLLER-R3F-WIRING/MSS]: throttles gl.render in idle mode after grace period expires', () => {
    vi.useFakeTimers();
    sharedR3FHarness.reset();

    renderToStaticMarkup(React.createElement(AdaptiveIdleCoolingController, { isMobile: true }));
    expect(sharedR3FHarness.getSubscriberCount()).toBe(1);

    // Frame 0 during initial grace period: renders immediately at 60 FPS
    sharedR3FHarness.advanceFrame(0.0166);
    expect(sharedR3FHarness.renderCallCount).toBe(1);

    // Advance beyond 1200ms grace period to enter IDLE_COOLING_30FPS
    vi.advanceTimersByTime(2000);

    // Frame 1 in idle cooling (delta 0.0166s < 0.0333s): throttled, no render
    sharedR3FHarness.advanceFrame(0.0166);
    expect(sharedR3FHarness.renderCallCount).toBe(1);

    vi.useRealTimers();
  });

  // TC-376.07b [UC-CONTROLLER-R3F-WIRING/MSS]: Given AdaptiveIdleCoolingController mounted on mobile, When game motion is active, Then invokes gl.render on every frame.
  it('TC-376.07b [UC-CONTROLLER-R3F-WIRING/MSS]: renders every frame at 60 FPS when gameplay motion is active', () => {
    vi.useFakeTimers();
    sharedR3FHarness.reset();

    renderToStaticMarkup(React.createElement(AdaptiveIdleCoolingController, { isMobile: true }));
    expect(sharedR3FHarness.getSubscriberCount()).toBe(1);

    // Expire initial grace period so controller is in idle 30 FPS
    vi.advanceTimersByTime(2000);

    // Activate rolling motion
    useGameStore.setState({ isRolling: true });

    // Wakes up to 60 FPS and renders on frame 1
    sharedR3FHarness.advanceFrame(0.0166);
    expect(sharedR3FHarness.renderCallCount).toBe(1);

    // Renders on frame 2 without throttling
    sharedR3FHarness.advanceFrame(0.0166);
    expect(sharedR3FHarness.renderCallCount).toBe(2);

    vi.useRealTimers();
  });

  // TC-376.07c [UC-CONTROLLER-R3F-WIRING/MSS]: Given AdaptiveIdleCoolingController mounted on desktop, When frame clock advances, Then bypasses mobile cooling controller early.
  it('TC-376.07c [UC-CONTROLLER-R3F-WIRING/MSS]: desktop mode bypasses mobile cooling controller early', () => {
    sharedR3FHarness.reset();

    renderToStaticMarkup(React.createElement(AdaptiveIdleCoolingController, { isMobile: false }));
    expect(sharedR3FHarness.getSubscriberCount()).toBe(1);

    sharedR3FHarness.advanceFrame(0.0166);
    expect(sharedR3FHarness.renderCallCount).toBe(0);
  });

  // TC-376.08a [UC-CONFIG-CONSTANTS/MSS]: Given system configuration constants, Then exposes authoritative active and idle target frame rates and jitter slack.
  it('TC-376.08a [UC-CONFIG-CONSTANTS/MSS]: verifies AdaptiveIdleCoolingController configuration constants', () => {
    expect(IDLE_COOLING_CONFIG.activeTargetFps).toBe(60);
    expect(IDLE_COOLING_CONFIG.idleTargetFps).toBe(30);
    expect(IDLE_COOLING_CONFIG.gracePeriodMs).toBe(1200);
    expect(JITTER_SLACK_SEC).toBe(0.002);
  });

  // TC-376.08b [UC-CALLSITE-CANVAS-WIRING/MSS]: Given GameCanvas rendered in component tree, When inspecting Canvas children, Then mounts AdaptiveIdleCoolingController with isMobile prop wired to device state.
  it('TC-376.08b [UC-CALLSITE-CANVAS-WIRING/MSS]: GameCanvas mounts AdaptiveIdleCoolingController with isMobile wired to device state', () => {
    vi.stubGlobal('window', globalThis);
    const tree = captureTree<GameCanvasProps>(GameCanvas, { isMobile: true, isLobby: false });
    const coolingNode = findReactNode(tree, (el) => el.type === AdaptiveIdleCoolingController);

    expect(coolingNode).not.toBeNull();
    expect(coolingNode?.props.isMobile).toBe(true);
    vi.unstubAllGlobals();
  });
});
