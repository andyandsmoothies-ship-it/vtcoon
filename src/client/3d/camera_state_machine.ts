// [UI-S01/MSS][UI-S04/MSS] CameraStateMachine — 2026 Cinematic Action Cam & Dynamic Follow System
// Hỗ trợ 4 chế độ: Overview, Dice Roll Cinematic, Pawn Chase, và Tile Focus

export type CameraMode = 'overview' | 'dice_roll' | 'pawn_chase' | 'tile_focus';

export interface CameraConfigItem {
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly fov: number;
  readonly speed: number;
}

export const CAMERA_CONFIG = {
  overview: {
    position: [20, 22, 20] as const,
    target: [-1.2, 0, -1.2] as const,
    fov: 40,
    speed: 3.2,
  },
  dice_roll: {
    // Sà xuống góc nghiêng thấp tập trung vào khay xúc xắc trung tâm bàn cờ
    position: [3.8, 3.2, 4.6] as const,
    target: [0, 0.35, 0] as const,
    fov: 36,
    speed: 4.8,
  },
  pawn_chase: {
    fov: 38,
    speed: 5.2,
    offset: [6.8, 8.5, 6.8] as const,
  },
  tile_focus: {
    fov: 35,
    speed: 4.0,
    offset: [5.2, 6.4, 5.2] as const,
  },
} as const;

export interface CameraResolveParams {
  readonly isRolling: boolean;
  readonly isPawnAnimating: boolean;
  readonly activeModal: string | null;
  readonly hasRolledThisTurn?: boolean;
  readonly manualMode?: CameraMode | null;
  readonly hasTargetTile?: boolean;
}

/**
 * Xác định chế độ máy quay tự động dựa theo trạng thái trò chơi
 */
export function resolveCameraMode(params: CameraResolveParams): CameraMode {
  if (params.manualMode) {
    return params.manualMode;
  }
  if (params.activeModal === 'game_over') {
    return 'overview';
  }
  // 1. Ưu tiên cao nhất: Gieo xúc xắc góc nghiêng thấp
  if (params.isRolling) {
    return 'dice_roll';
  }
  // 2. Quân cờ đang di chuyển: Bám đuổi theo quân cờ
  if (params.isPawnAnimating) {
    return 'pawn_chase';
  }
  // 3. Mở modal tương tác hoặc dừng chân tại ô đất sau khi di chuyển
  if (params.activeModal !== null || params.hasTargetTile || params.hasRolledThisTurn) {
    return 'tile_focus';
  }
  // 4. Mặc định: Phối cảnh bao quát bán đảo (khi chưa gieo xúc xắc hoặc khi lượt chơi kết thúc)
  return 'overview';
}

/**
 * Tính toán tọa độ vị trí Camera bám đuổi theo quân cờ
 */
export function calculateChaseCameraPosition(
  pawnCoords: readonly [number, number, number],
  offset: readonly [number, number, number] = CAMERA_CONFIG.pawn_chase.offset
): [number, number, number] {
  const px = Number.isFinite(pawnCoords[0]) ? pawnCoords[0] : 0;
  const py = Number.isFinite(pawnCoords[1]) ? pawnCoords[1] : 0;
  const pz = Number.isFinite(pawnCoords[2]) ? pawnCoords[2] : 0;
  return [px + offset[0], py + offset[1], pz + offset[2]];
}

/**
 * Tính toán tọa độ vị trí Camera tập trung vào ô đất mục tiêu
 */
export function calculateTileFocusCameraPosition(
  tileCoords: readonly [number, number, number],
  offset: readonly [number, number, number] = CAMERA_CONFIG.tile_focus.offset
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const ty = Number.isFinite(tileCoords[1]) ? tileCoords[1] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  return [tx + offset[0], ty + offset[1], tz + offset[2]];
}

/**
 * Rung chấn màn hình vi mô theo hàm tắt dần (300ms - 400ms)
 * tạo cảm giác trọng lượng vật lý đanh chắc khi công trình cắm mạnh xuống mặt bàn cờ.
 */
export function calculateScreenShake(
  elapsedSeconds: number,
  durationSeconds: number = 0.35,
  amplitude: number = 0.25,
  frequency: number = 42
): [number, number, number] {
  if (
    !Number.isFinite(elapsedSeconds) ||
    !Number.isFinite(durationSeconds) ||
    !Number.isFinite(amplitude) ||
    !Number.isFinite(frequency) ||
    elapsedSeconds < 0 ||
    elapsedSeconds >= durationSeconds
  ) {
    return [0, 0, 0];
  }
  const progress = elapsedSeconds / durationSeconds;
  // Đường bao suy giảm bậc hai (quadratic decay envelope)
  const decay = (1 - progress) * (1 - progress);
  const sx = Math.sin(elapsedSeconds * frequency) * amplitude * decay;
  const sy = Math.cos(elapsedSeconds * (frequency * 1.25)) * (amplitude * 0.7) * decay;
  const sz = Math.sin(elapsedSeconds * (frequency * 0.85) + 1.2) * (amplitude * 0.9) * decay;
  return [sx, sy, sz];
}

/**
 * Hàm suy giảm hàm mũ (exponential damping) không phụ thuộc tốc độ khung hình (frame-rate independent)
 */
export function dampValue(current: number, target: number, speed: number, dt: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return Number.isFinite(target) ? target : 0;
  }
  const safeDt = Math.max(0, Math.min(dt, 0.1));
  const factor = 1 - Math.exp(-safeDt * speed);
  return current + (target - current) * factor;
}

export interface TargetCameraState {
  readonly position: [number, number, number];
  readonly target: [number, number, number];
  readonly fov: number;
  readonly speed: number;
}

/**
 * Tính toán trạng thái mục tiêu (position, target, fov, speed) cho chế độ Camera tương ứng
 */
export function calculateTargetCameraState(
  mode: CameraMode,
  pawnPosition?: readonly [number, number, number],
  tilePosition?: readonly [number, number, number]
): TargetCameraState {
  switch (mode) {
    case 'dice_roll':
      return {
        position: [CAMERA_CONFIG.dice_roll.position[0], CAMERA_CONFIG.dice_roll.position[1], CAMERA_CONFIG.dice_roll.position[2]],
        target: [CAMERA_CONFIG.dice_roll.target[0], CAMERA_CONFIG.dice_roll.target[1], CAMERA_CONFIG.dice_roll.target[2]],
        fov: CAMERA_CONFIG.dice_roll.fov,
        speed: CAMERA_CONFIG.dice_roll.speed,
      };
    case 'pawn_chase': {
      const p = pawnPosition ?? [0, 0, 0];
      return {
        position: calculateChaseCameraPosition(p),
        target: [p[0], 0.2, p[2]],
        fov: CAMERA_CONFIG.pawn_chase.fov,
        speed: CAMERA_CONFIG.pawn_chase.speed,
      };
    }
    case 'tile_focus': {
      const t = tilePosition ?? [0, 0, 0];
      return {
        position: calculateTileFocusCameraPosition(t),
        target: [t[0], 0.15, t[2]],
        fov: CAMERA_CONFIG.tile_focus.fov,
        speed: CAMERA_CONFIG.tile_focus.speed,
      };
    }
    case 'overview':
    default:
      return {
        position: [CAMERA_CONFIG.overview.position[0], CAMERA_CONFIG.overview.position[1], CAMERA_CONFIG.overview.position[2]],
        target: [CAMERA_CONFIG.overview.target[0], CAMERA_CONFIG.overview.target[1], CAMERA_CONFIG.overview.target[2]],
        fov: CAMERA_CONFIG.overview.fov,
        speed: CAMERA_CONFIG.overview.speed,
      };
  }
}
