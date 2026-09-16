// [UI-S01/MSS][UI-S03/MSS][IMP-86][IMP-101] use_game_camera.ts — Viewport Math & Target Resolution
import { cellPosition } from './board_coords';
import type { PawnAnimationState } from '../store/game_store';

export const BASE_PERSPECTIVE_FOV = 40 as const;
export const EVENT_PERSPECTIVE_FOV = 35 as const;
export const BASE_CAMERA_ZOOM = 41 as const;
export const EVENT_CAMERA_ZOOM = 48 as const;
export const CAMERA_FOCUS_WEIGHT = 0.65 as const;

export function calculateCameraFocusTarget(
  cellIndex: number | null,
  weight: number = CAMERA_FOCUS_WEIGHT
): [number, number, number] {
  if (cellIndex == null || !Number.isFinite(cellIndex)) {
    return [0, 0, 0];
  }
  const [cx, , cz] = cellPosition(cellIndex);
  return [cx * weight, 0, cz * weight];
}

export function calculateCameraZoom(
  isBigEvent: boolean,
  baseZoom: number = BASE_CAMERA_ZOOM,
  eventZoom: number = EVENT_CAMERA_ZOOM
): number {
  return isBigEvent ? eventZoom : baseZoom;
}

export function resolveCameraTargetCell(
  activeAnimation: PawnAnimationState | null,
  currentTurnPlayerId: string | null,
  playerPositions: Record<string, number>,
  modalPayload?: { cellIndex?: number } | null
): number | null {
  if (modalPayload && typeof modalPayload.cellIndex === 'number' && Number.isInteger(modalPayload.cellIndex)) {
    return modalPayload.cellIndex;
  }
  if (activeAnimation?.isAnimating && activeAnimation.waypoints && activeAnimation.waypoints.length > 0) {
    const idx = activeAnimation.currentIndex ?? 0;
    const wp = activeAnimation.waypoints[idx];
    if (wp !== undefined && Number.isFinite(wp)) return wp;
    if (activeAnimation.fromCell !== undefined && Number.isFinite(activeAnimation.fromCell)) return activeAnimation.fromCell;
  }
  if (currentTurnPlayerId != null) {
    const pos = playerPositions[currentTurnPlayerId];
    return pos !== undefined && Number.isFinite(pos) ? pos : 0;
  }
  return null;
}
