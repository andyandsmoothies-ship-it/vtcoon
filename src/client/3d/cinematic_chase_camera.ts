// [UI-S01/MSS][UI-S04/MSS][IMP-263] Event-Driven Semi-Cinematic Camera Engine
// Tinh toan goc may ban dien anh luot theo su kien (khoang 20% luot di lon) o do cao Y = 2.8 (pitch 25.0 do)
import type { TargetCameraState } from './camera_state_machine';

export interface StreetChaseParams {
  readonly pawnPosition: readonly [number, number, number];
  readonly cellIndex?: number;
  readonly aspect?: number;
  readonly isHighStakesRoll?: boolean;
  readonly isJailFlight?: boolean;
  readonly isTransientTurnCorner?: boolean;
  readonly enableNorthFraming?: boolean;
  readonly lookAhead?: number;
  readonly cameraHeight?: number;
  readonly trailDistance?: number;
  readonly outerOffset?: number;
  readonly innerTilt?: number;
  readonly targetHeight?: number;
  readonly fov?: number;
  readonly speed?: number;
}

export const CINEMATIC_CHASE_CONFIG = {
  fov: 42,
  speed: 5.8,
  cameraHeight: 2.8,
  trailDistance: 3.0,
  outerOffset: 2.2,
  lookAhead: 1.0,
  targetHeight: 0.6,
  innerTilt: 0.5,
} as const;

export const CINEMATIC_EVENT_CELLS: ReadonlySet<number> = new Set([
  5, 10, 15, 20, 25, 35,
]);

export interface CinematicTriggerParams {
  readonly isHighStakesRoll?: boolean;
  readonly cellIndex?: number;
  readonly isJailFlight?: boolean;
  readonly hasMonopolyRisk?: boolean; // Truong tuy chon mo rong cho nhan dien nguy co hoan tat bo mau
}

/**
 * Danh gia su kien de chi kich hoat goc may ban dien anh o cac luot di trong dai (khoang 20%).
 * 80% luot di thong thuong duy tri camera nhanh 0.3s tranh gay say chuyen dong.
 */
export function shouldTriggerCinematicCamera(params: CinematicTriggerParams): boolean {
  if (params.isJailFlight) {
    return false; // Chuyen bay vao tu tren khong su dung camera elevated chase truyen thong
  }
  if (params.isHighStakesRoll) {
    return true; // Luot gieo doi mat nguy co tu than
  }
  if (params.hasMonopolyRisk) {
    return true; // Mua dat hoan tat bo mau doc quyen
  }
  if (typeof params.cellIndex === 'number' && Number.isFinite(params.cellIndex)) {
    const norm = Math.floor(((params.cellIndex % 40) + 40) % 40);
    return CINEMATIC_EVENT_CELLS.has(norm);
  }
  return false;
}

/**
 * Tinh toan FOV thich ung man hinh doc (portrait, aspect < 1.0) de bao dam Dual-Viewport Parity.
 */
export function calculateResponsiveStreetFov(aspect?: number, baseFov = CINEMATIC_CHASE_CONFIG.fov): number {
  if (typeof aspect !== 'number' || !Number.isFinite(aspect) || aspect >= 1.0) {
    return baseFov;
  }
  const targetHalfRad = (36 * Math.PI) / 360;
  const neededHalfRad = Math.atan(Math.tan(targetHalfRad) / Math.max(0.42, aspect));
  const calculatedFov = Math.round((neededHalfRad * 360) / Math.PI);
  return Math.min(68, Math.max(baseFov, calculatedFov));
}

/**
 * Xac dinh canh ban co (0: Nam, 1: Tay, 2: Bac, 3: Dong) dua tren toa do (X, Z).
 */
export function resolveSideFromCoordinates(x: number, z: number): 0 | 1 | 2 | 3 {
  const safeX = Number.isFinite(x) ? x : 0;
  const safeZ = Number.isFinite(z) ? z : 0;
  const absX = Math.abs(safeX);
  const absZ = Math.abs(safeZ);

  if (absZ >= absX) {
    return safeZ < 0 ? 2 : 0;
  }
  return safeX < 0 ? 1 : 3;
}

/**
 * Phan giai canh duong chay cua quan co. Dong bo cac o goc (0, 10, 20, 30) voi resolveSideFromCoordinates
 * de tranh cu lac 90 do khi quan co dap xuong o dat.
 */
/**
 * [IMP-292] Tính toán góc nhìn hạ độ cao Y=19.8m hướng về góc sông của người chơi khi gieo xúc xắc.
 * Tự động bù trừ FOV mở rộng trên Mobile Portrait (aspect < 1.0) bảo toàn Dual-Viewport Parity.
 */
export function calculateDicePanCameraState(rollingPos?: number, aspect?: number): TargetCameraState {
  const normPos = typeof rollingPos === 'number' && Number.isFinite(rollingPos)
    ? Math.floor(((rollingPos % 40) + 40) % 40)
    : 0;
  const side = Math.floor(normPos / 10);
  let biasX = 0;
  let biasZ = 0;
  if (side === 0) biasZ = 1.0;
  else if (side === 1) biasX = -1.0;
  else if (side === 2) biasZ = -1.0;
  else biasX = 1.0;

  const safeAspect = typeof aspect === 'number' && Number.isFinite(aspect) ? aspect : 1.77;
  const fov = safeAspect < 1.0
    ? Math.min(46, Math.max(28, Math.round(28 / Math.max(0.60, safeAspect))))
    : 28;

  return {
    position: [19.5 + biasX * 0.8, 19.8, 19.5 + biasZ * 0.8],
    target: [1.5 + biasX * 0.6, 0.2, 1.5 + biasZ * 0.6],
    fov,
    speed: 4.8,
  };
}

export function resolvePawnTrackSide(
  pawnPosition: readonly [number, number, number],
  cellIndex?: number
): 0 | 1 | 2 | 3 {
  if (typeof cellIndex === 'number' && Number.isFinite(cellIndex)) {
    const norm = Math.floor(((cellIndex % 40) + 40) % 40);
    if (norm % 10 === 0) {
      return resolveSideFromCoordinates(pawnPosition[0], pawnPosition[2]);
    }
    return Math.floor(norm / 10) as 0 | 1 | 2 | 3;
  }
  return resolveSideFromCoordinates(pawnPosition[0], pawnPosition[2]);
}

function isCornerCellIndex(cellIndex?: number): boolean {
  if (typeof cellIndex !== 'number' || !Number.isFinite(cellIndex)) return false;
  const norm = Math.floor(((cellIndex % 40) + 40) % 40);
  return norm % 10 === 0;
}

function resolveCornerSigns(norm: number): { signX: number; signZ: number } {
  if (norm === 10) return { signX: -1, signZ: 1 };
  if (norm === 20) return { signX: -1, signZ: -1 };
  if (norm === 30) return { signX: 1, signZ: -1 };
  return { signX: 1, signZ: 1 };
}

/**
 * Tinh toan trang thai Camera ban dien anh o do cao Y = 2.8, pitch 25.0 do theo 4 canh ban co.
 */
export function calculateStreetChaseCameraState(params: StreetChaseParams): TargetCameraState {
  const p = params.pawnPosition ?? [0, 0, 0];
  const px = Number.isFinite(p[0]) ? p[0] : 0;
  const py = Number.isFinite(p[1]) ? p[1] : 0;
  const pz = Number.isFinite(p[2]) ? p[2] : 0;

  const side = resolvePawnTrackSide(p, params.cellIndex);
  const trail = Number.isFinite(params.trailDistance) ? params.trailDistance! : CINEMATIC_CHASE_CONFIG.trailDistance;
  const outer = Number.isFinite(params.outerOffset) ? params.outerOffset! : CINEMATIC_CHASE_CONFIG.outerOffset;
  const height = Number.isFinite(params.cameraHeight) ? params.cameraHeight! : CINEMATIC_CHASE_CONFIG.cameraHeight;
  const look = Number.isFinite(params.lookAhead) ? params.lookAhead! : CINEMATIC_CHASE_CONFIG.lookAhead;
  const tHeight = Number.isFinite(params.targetHeight) ? params.targetHeight! : CINEMATIC_CHASE_CONFIG.targetHeight;
  const tilt = Number.isFinite(params.innerTilt) ? params.innerTilt! : CINEMATIC_CHASE_CONFIG.innerTilt;
  const fov = Number.isFinite(params.fov) ? params.fov! : calculateResponsiveStreetFov(params.aspect);
  const speed = Number.isFinite(params.speed) ? params.speed! : CINEMATIC_CHASE_CONFIG.speed;

  let posX = px;
  let posY = py + height;
  let posZ = pz;

  let tarX = px;
  let tarY = py + tHeight;
  let tarZ = pz;

  const isCorner = Boolean(params.isTransientTurnCorner && isCornerCellIndex(params.cellIndex));
  if (isCorner) {
    const norm = Math.floor((((params.cellIndex ?? 0) % 40) + 40) % 40);
    const { signX, signZ } = resolveCornerSigns(norm);
    const posRadius = Math.hypot(trail, outer);
    const tarRadius = Math.hypot(look, tilt);
    const sin45 = Math.sin(Math.PI / 4);
    const cos45 = Math.cos(Math.PI / 4);
    posX = px + signX * posRadius * sin45;
    posZ = pz + signZ * posRadius * cos45;
    tarX = px - signX * tarRadius * sin45;
    tarZ = pz - signZ * tarRadius * cos45;
  } else {
    switch (side) {
      case 0:
        posX = px + trail;
        posZ = pz + outer;
        tarX = px - look;
        tarZ = pz - tilt;
        break;
      case 1:
        posX = px - outer;
        posZ = pz + trail;
        tarX = px + tilt;
        tarZ = pz - look;
        break;
      case 2:
        posX = px - trail;
        posZ = pz - outer;
        tarX = px + look;
        tarZ = pz + tilt;
        break;
      case 3:
        posX = px + outer;
        posZ = pz - trail;
        tarX = px - tilt;
        tarZ = pz + look;
        break;
    }
  }

  if (params.enableNorthFraming && pz < -3.0) {
    const northProgress = Math.max(0, Math.min(1, (-3.0 - pz) / 6.0));
    const factor = 1.0 - 0.20 * northProgress;
    posX = px + (posX - px) * factor;
    posY = py + (posY - py) * factor;
    posZ = pz + (posZ - pz) * factor;
    tarX = px + (tarX - px) * factor;
    tarZ = pz + (tarZ - pz) * factor;
  }

  return {
    position: [posX, posY, posZ],
    target: [tarX, tarY, tarZ],
    fov,
    speed,
  };
}

/**
 * Tinh toan offset tieu chuan bam duoi quan co (Standard Chase Offset) theo 4 canh ban co.
 */
export function resolveStandardChaseOffset(
  pawnCoords: readonly [number, number, number],
  aspect?: number
): readonly [number, number, number] {
  const px = Number.isFinite(pawnCoords[0]) ? pawnCoords[0] : 0;
  const pz = Number.isFinite(pawnCoords[2]) ? pawnCoords[2] : 0;
  const safeAspect = typeof aspect === 'number' && Number.isFinite(aspect) && aspect > 0 ? aspect : 1.77;
  const isPortrait = safeAspect < 1.0;
  const clampedAspect = Math.max(0.35, safeAspect);
  const ky = isPortrait ? Math.min(1.35, Math.max(1.0, 0.95 / Math.sqrt(clampedAspect))) : 1.0;
  const kDist = isPortrait ? Math.min(1.25, Math.max(1.0, 0.88 / Math.sqrt(clampedAspect))) : 1.0;
  const offH = 3.6 * kDist;
  const offY = 4.2 * ky;
  if (px === 0 && pz === 0) return [offH, offY, offH];
  const side = resolveSideFromCoordinates(px, pz);
  switch (side) {
    case 1: return [-offH, offY, offH];
    case 2: return [-offH, offY, -offH];
    case 3: return [offH, offY, -offH];
    default: return [offH, offY, offH];
  }
}
