// [UC-GESTURE/MSS] Camera Gestures, Interaction Controller & Debug Globals
import React, { useRef, useEffect } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { type Camera } from 'three';
import { useGameStore } from '../store/game_store';
import { initSoftReturn, shouldBreakOnTouch, type SoftReturnState } from './camera_soft_return';

export interface GestureEndEvaluationParams {
  readonly touchDurationMs: number;
  readonly currentCamPos: readonly [number, number, number];
  readonly overviewPos: readonly [number, number, number];
  readonly currentTargetPos: readonly [number, number, number];
  readonly overviewTarget: readonly [number, number, number];
  readonly isPawnAnimating: boolean;
  readonly justBrokeSoftReturn: boolean;
}

export interface GestureEndEvaluationResult {
  readonly action: 'skip_animation' | 'set_custom_camera' | 'none';
  readonly shouldClearJustBroke: boolean;
}

export function evaluateOrbitGestureEnd(params: GestureEndEvaluationParams): GestureEndEvaluationResult {
  const distPos = Math.hypot(
    params.currentCamPos[0] - params.overviewPos[0],
    params.currentCamPos[1] - params.overviewPos[1],
    params.currentCamPos[2] - params.overviewPos[2]
  );
  const distTarget = Math.hypot(
    params.currentTargetPos[0] - params.overviewTarget[0],
    params.currentTargetPos[1] - params.overviewTarget[1],
    params.currentTargetPos[2] - params.overviewTarget[2]
  );

  if (params.justBrokeSoftReturn) {
    const shouldSetCustom = distPos > 0.8 || distTarget > 0.5;
    return { action: shouldSetCustom ? 'set_custom_camera' : 'none', shouldClearJustBroke: true };
  }

  if (params.isPawnAnimating && params.touchDurationMs < 220 && distPos < 0.4 && distTarget < 0.2) {
    return { action: 'skip_animation', shouldClearJustBroke: false };
  }

  if (distPos > 0.8 || distTarget > 0.5) {
    return { action: 'set_custom_camera', shouldClearJustBroke: false };
  }

  return { action: 'none', shouldClearJustBroke: false };
}

export interface CameraSkipSnapParams {
  readonly skipTarget: {
    readonly position: readonly [number, number, number];
    readonly target: readonly [number, number, number];
  };
  readonly camera: {
    readonly position: { set: (x: number, y: number, z: number) => void };
  };
  readonly controls: {
    readonly target: { set: (x: number, y: number, z: number) => void };
    readonly update?: () => void;
  } | null;
  readonly camBaseRef: React.MutableRefObject<[number, number, number]>;
  readonly targetBaseRef: React.MutableRefObject<[number, number, number]>;
}

export function applyCameraSkipSnap(params: CameraSkipSnapParams): void {
  const { skipTarget, camera, controls, camBaseRef, targetBaseRef } = params;
  camBaseRef.current[0] = skipTarget.position[0];
  camBaseRef.current[1] = skipTarget.position[1];
  camBaseRef.current[2] = skipTarget.position[2];
  targetBaseRef.current[0] = skipTarget.target[0];
  targetBaseRef.current[1] = skipTarget.target[1];
  targetBaseRef.current[2] = skipTarget.target[2];
  camera.position.set(skipTarget.position[0], skipTarget.position[1], skipTarget.position[2]);
  if (controls) {
    controls.target.set(skipTarget.target[0], skipTarget.target[1], skipTarget.target[2]);
    controls.update?.();
  }
}

export function checkTargetOwnedByHuman(
  playersInfo: Record<string, { readonly isBot?: boolean; readonly bankrupt?: boolean; readonly isBankrupt?: boolean; readonly ownedProperties?: readonly number[]; readonly mortgagedProperties?: readonly number[] }>,
  cell: number
): boolean {
  for (const pId in playersInfo) {
    const p = playersInfo[pId];
    if (p && !p.isBot && !p.bankrupt && !p.isBankrupt && p.ownedProperties?.includes(cell) && !p.mortgagedProperties?.includes(cell)) {
      return true;
    }
  }
  return false;
}

export interface UseCameraGesturesOptions {
  readonly camera: Camera;
  readonly controlsRef: React.RefObject<OrbitControlsImpl | null>;
  readonly currentOverviewPosRef: React.RefObject<[number, number, number]>;
  readonly currentOverviewTargetRef: React.RefObject<[number, number, number]>;
  readonly isResettingRef: React.MutableRefObject<boolean>;
  readonly softReturnRef: React.MutableRefObject<SoftReturnState | null>;
  readonly isManualOverviewResetRef: React.MutableRefObject<boolean>;
  readonly camBaseRef: React.MutableRefObject<[number, number, number]>;
  readonly targetBaseRef: React.MutableRefObject<[number, number, number]>;
  readonly activeAnimation?: { readonly isAnimating?: boolean } | null;
}

export interface UseCameraGesturesReturn {
  readonly onOrbitStart: () => void;
  readonly onOrbitEnd: () => void;
  readonly isUserInteractingRef: React.MutableRefObject<boolean>;
  readonly hasSkippedCurrentMoveRef: React.MutableRefObject<boolean>;
  readonly lastSkipTimeRef: React.MutableRefObject<number>;
  readonly isSkippingCameraAnimRef: React.MutableRefObject<boolean>;
  readonly handleFrameSkip: (skipTargetState: { position: [number, number, number]; target: [number, number, number] }) => boolean;
}

export function useCameraGestures(options: UseCameraGesturesOptions): UseCameraGesturesReturn {
  const isUserInteractingRef = useRef<boolean>(false);
  const touchStartTimeRef = useRef<number>(0);
  const justBrokeSoftReturnRef = useRef<boolean>(false);
  const isSkippingCameraAnimRef = useRef<boolean>(false);
  const hasSkippedCurrentMoveRef = useRef<boolean>(false);
  const lastSkipTimeRef = useRef<number>(0);

  const onOrbitStart = () => {
    touchStartTimeRef.current = Date.now();
    if (shouldBreakOnTouch(true, options.isResettingRef.current || options.softReturnRef.current !== null)) {
      options.isResettingRef.current = false;
      options.softReturnRef.current = null;
      options.isManualOverviewResetRef.current = false;
      justBrokeSoftReturnRef.current = true;
    } else {
      justBrokeSoftReturnRef.current = false;
    }
    isUserInteractingRef.current = true;
  };

  const onOrbitEnd = () => {
    isUserInteractingRef.current = false;
    const touchDuration = Date.now() - touchStartTimeRef.current;
    const refPos = options.currentOverviewPosRef.current ?? [0, 0, 0];
    const refTarget = options.currentOverviewTargetRef.current ?? [0, 0, 0];
    // [Gotcha #64] Fallback to refTarget when controlsRef.current is null to guarantee distTarget is zero
    const curTarget: [number, number, number] = options.controlsRef.current
      ? [options.controlsRef.current.target.x, options.controlsRef.current.target.y, options.controlsRef.current.target.z]
      : refTarget;

    const result = evaluateOrbitGestureEnd({
      touchDurationMs: touchDuration,
      currentCamPos: [options.camera.position.x, options.camera.position.y, options.camera.position.z],
      overviewPos: refPos,
      currentTargetPos: curTarget,
      overviewTarget: refTarget,
      isPawnAnimating: Boolean(options.activeAnimation?.isAnimating),
      justBrokeSoftReturn: justBrokeSoftReturnRef.current,
    });

    if (result.shouldClearJustBroke) {
      justBrokeSoftReturnRef.current = false;
    }
    if (result.action === 'set_custom_camera') {
      useGameStore.getState().setHasUserCustomCamera?.(true);
    } else if (result.action === 'skip_animation') {
      isSkippingCameraAnimRef.current = true;
      lastSkipTimeRef.current = Date.now();
    }
  };

  const handleFrameSkip = (skipTargetState: { position: [number, number, number]; target: [number, number, number] }): boolean => {
    if (isSkippingCameraAnimRef.current) {
      hasSkippedCurrentMoveRef.current = true;
      applyCameraSkipSnap({
        skipTarget: skipTargetState,
        camera: options.camera,
        controls: options.controlsRef.current,
        camBaseRef: options.camBaseRef,
        targetBaseRef: options.targetBaseRef,
      });
      options.isResettingRef.current = false;
      options.isManualOverviewResetRef.current = false;
      isSkippingCameraAnimRef.current = false;
      isUserInteractingRef.current = false;
      return true;
    }
    return false;
  };

  return {
    onOrbitStart,
    onOrbitEnd,
    isUserInteractingRef,
    hasSkippedCurrentMoveRef,
    lastSkipTimeRef,
    isSkippingCameraAnimRef,
    handleFrameSkip,
  };
}

export interface UseDebugCameraGlobalsOptions {
  readonly scene: import('three').Scene;
  readonly camera: Camera;
  readonly controlsRef: React.RefObject<OrbitControlsImpl | null>;
  readonly defaultTarget: [number, number, number];
  readonly camBaseRef: React.MutableRefObject<[number, number, number]>;
  readonly targetBaseRef: React.MutableRefObject<[number, number, number]>;
  readonly currentOverviewPosRef: React.RefObject<[number, number, number]>;
  readonly currentOverviewTargetRef: React.RefObject<[number, number, number]>;
  readonly isResettingRef: React.MutableRefObject<boolean>;
  readonly isManualOverviewResetRef: React.MutableRefObject<boolean>;
  readonly softReturnRef: React.MutableRefObject<SoftReturnState | null>;
  readonly isUserInteractingRef: React.MutableRefObject<boolean>;
}

export function useDebugCameraGlobals(options: UseDebugCameraGlobalsOptions): void {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__threeScene = options.scene;
      window.__threeCamera = options.camera;
      window.__resetCameraToDefault = () => {
        options.isUserInteractingRef.current = false;
        options.isResettingRef.current = true;
        options.isManualOverviewResetRef.current = true;
        options.camBaseRef.current = [options.camera.position.x, options.camera.position.y, options.camera.position.z];
        const curTarget: [number, number, number] = options.controlsRef.current
          ? [options.controlsRef.current.target.x, options.controlsRef.current.target.y, options.controlsRef.current.target.z]
          : options.defaultTarget;
        options.targetBaseRef.current = curTarget;
        const refPos = options.currentOverviewPosRef.current ?? [0, 0, 0];
        const refTarget = options.currentOverviewTargetRef.current ?? [0, 0, 0];
        options.softReturnRef.current = initSoftReturn(
          [options.camera.position.x, options.camera.position.y, options.camera.position.z],
          curTarget,
          refPos,
          refTarget,
          performance.now()
        );
        useGameStore.getState().setCameraFocusCell(null);
        useGameStore.getState().setHasUserCustomCamera?.(false);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__resetCameraToDefault;
        delete window.__threeScene;
        delete window.__threeCamera;
        delete window.__orbitControls;
      }
    };
  }, [options.scene, options.camera]);
}
