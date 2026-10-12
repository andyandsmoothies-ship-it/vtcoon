// [IMP-376/MSS] Adaptive Idle Frameloop Cooling Controller
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/game_store';
import { useVfxStore } from '../store/vfx_store';
import {
  is3DModalActive,
  isGameMotionActive,
  calculateIdleGraceRemaining,
  calculateIdleCoolingMode,
  shouldRenderFrame,
  hasActiveDictionaryKeys,
  type IdleCoolingMode,
} from './idle_cooling_helpers';

export interface AdaptiveIdleCoolingControllerProps {
  readonly isMobile: boolean;
}

export function AdaptiveIdleCoolingController({ isMobile }: AdaptiveIdleCoolingControllerProps): null {
  const lastMotionTimeRef = useRef<number>(Date.now());
  const accumulatedDeltaRef = useRef<number>(0);
  const currentModeRef = useRef<IdleCoolingMode>('ACTIVE_60FPS');
  const activePointersRef = useRef<Set<number>>(new Set());
  const prevCameraFocusCellRef = useRef<number | null>(null);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      activePointersRef.current.add(e.pointerId);
      lastMotionTimeRef.current = Date.now();
    };
    const handlePointerUp = (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId);
      lastMotionTimeRef.current = Date.now();
    };
    const handleWindowBlur = () => {
      activePointersRef.current.clear();
    };
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined') {
        if (document.hidden) {
          activePointersRef.current.clear();
        } else {
          lastMotionTimeRef.current = Date.now();
          accumulatedDeltaRef.current = 0;
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', handlePointerDown, { capture: true });
      window.addEventListener('pointerup', handlePointerUp, { capture: true });
      window.addEventListener('pointercancel', handlePointerUp, { capture: true });
      window.addEventListener('blur', handleWindowBlur);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
        window.removeEventListener('pointerup', handlePointerUp, { capture: true });
        window.removeEventListener('pointercancel', handlePointerUp, { capture: true });
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  useFrame(({ gl, scene, camera }, delta) => {
    if (!isMobile) return;

    const isHidden = typeof document !== 'undefined' && document.hidden;
    const isRolling = useGameStore.getState().isRolling;
    const isPawnAnimating = Boolean(
      useGameStore.getState().activePawnAnimation?.isAnimating ||
      (useGameStore.getState().pawnAnimationQueue?.length ?? 0) > 0
    );
    const cameraFocusCell = useGameStore.getState().cameraFocusCell;
    const activeModal = useGameStore.getState().activeModal;
    const vfxState = useVfxStore.getState();
    const hasActiveVfx = Boolean(
      vfxState.activeScreenShake !== null ||
      hasActiveDictionaryKeys(vfxState.activeSlams) ||
      hasActiveDictionaryKeys(vfxState.activePawnReactions)
    );

    let isCameraFocusChanged = false;
    if (cameraFocusCell !== prevCameraFocusCellRef.current) {
      prevCameraFocusCellRef.current = cameraFocusCell;
      isCameraFocusChanged = true;
      lastMotionTimeRef.current = Date.now();
    }

    const now = Date.now();
    // Dead Man's Switch (Inactivity Timeout): Auto-clear active pointers if stalled > 3000ms without physical interaction
    if (activePointersRef.current.size > 0 && now - lastMotionTimeRef.current > 3000) {
      activePointersRef.current.clear();
    }

    const hasGameplayMotion = Boolean(
      isRolling ||
      isPawnAnimating ||
      isCameraFocusChanged ||
      hasActiveVfx ||
      is3DModalActive(activeModal)
    );

    const isMotion = isGameMotionActive({
      isRolling,
      isPawnAnimating,
      isCameraTransitioning: isCameraFocusChanged,
      isUserInteracting: activePointersRef.current.size > 0,
      activeModal,
      hasActiveVfx,
    });

    if (hasGameplayMotion) {
      lastMotionTimeRef.current = now;
    }

    const graceRemaining = isMotion ? 0 : calculateIdleGraceRemaining(lastMotionTimeRef.current, now);
    const mode = calculateIdleCoolingMode({
      isMobile,
      isMotionActive: isMotion,
      isDocumentHidden: isHidden,
      remainingGraceMs: graceRemaining,
    });
    currentModeRef.current = mode;

    const pacing = shouldRenderFrame({
      mode,
      isMobile,
      deltaSec: delta,
      accumulatedDeltaSec: accumulatedDeltaRef.current,
    });
    accumulatedDeltaRef.current = pacing.nextAccumulatedDeltaSec;

    if (pacing.shouldRender && gl && typeof gl.render === 'function') {
      gl.render(scene, camera);
    }
  }, isMobile ? 1 : 0);

  return null;
}
