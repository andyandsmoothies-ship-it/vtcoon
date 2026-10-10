// [UI-S01/MSS][UI-S04/MSS] CameraStateMachine — 2026 Cinematic Action Cam & Dynamic Follow System
// Hỗ trợ các chế độ: Overview, Dice Roll Cinematic, Dynamic Tension Roll, Pawn Chase, và Tile Focus
import { PROPERTY_DEEDS } from '../../domain/property_data';
import { calculateStreetChaseCameraState, resolveStandardChaseOffset, calculateDicePanCameraState } from './cinematic_chase_camera';
import { resolveOverviewConfigByPhase } from './cinematic_spline_flyby';
import {
  resolveSideAwareCameraOffset,
  calculateTileFocusCameraPosition,
  calculateScreenShake,
  dampValue,
  calculateResponsiveCameraDistance,
} from './camera_kinematic_helpers';

export type CameraMode = 'overview' | 'dice_roll' | 'tension_roll' | 'pawn_chase' | 'tile_focus' | 'auction_focus' | 'pre_match';

export interface TargetCameraStateOptions {
  readonly cinematicChase?: boolean;
  readonly cellIndex?: number;
  readonly aspect?: number;
  readonly isHighStakesRoll?: boolean;
  readonly isJailFlight?: boolean;
  readonly isTransientTurnCorner?: boolean;
  readonly enableNorthFraming?: boolean;
  readonly isRolling?: boolean;
  readonly isBotTurn?: boolean;
  readonly rollingPlayerPos?: number;
  readonly gamePhase?: 1 | 2 | 3;
}

export const CAMERA_CONFIG = {
  overview: {
    // [IMP-107] Cự ly cận 37m và bù trừ tâm [2.2, 0.0, 2.2] lấp đầy ~88% màn hình, bảo toàn góc 6h và 12h
    position: [24.6, 25.3, 24.6] as const,
    target: [2.2, 0.0, 2.2] as const,
    fov: 24,
    speed: 3.2,
  },
  pre_match: {
    // [IMP-73] Ống kính Telephoto Kiến Trúc 24° triệt tiêu méo quang học, cân đối 4 góc sa bàn
    position: [30.0, 33.0, 30.0] as const,
    target: [1.5, 0.0, 1.5] as const,
    fov: 24,
    speed: 3.2,
  },
  dice_roll: {
    // Sà xuống góc nghiêng thấp tập trung vào sàn diễn xúc xắc trên sông Sài Gòn
    position: [2.5, 2.8, 3.4] as const,
    target: [0.0, 0.25, 0.0] as const,
    fov: 36,
    speed: 4.8,
  },
  tension_roll: {
    // [IMP-125-P2] Cận cảnh khay xúc xắc kịch tính khi đối mặt nguy cơ tử thần (High-Stakes)
    position: [2.0, 2.2, 2.8] as const,
    target: [0.0, 0.2, 0.0] as const,
    fov: 34,
    speed: 6.0,
  },
  pawn_chase: {
    fov: 38,
    speed: 5.2,
    offset: [3.6, 4.2, 3.6] as const,
  },
  tile_focus: {
    fov: 35,
    speed: 4.0,
    offset: [5.2, 6.4, 5.2] as const,
  },
  auction_focus: {
    // Cự ly thanh lịch bao quát sàn đấu giá kịch tính, thẻ bài vàng rực và nền bàn cờ mờ ảo
    position: [0, 6.0, 9.0] as const,
    target: [0, 3.0, 0] as const,
    fov: 38,
    speed: 4.5,
  },
} as const;

export interface CameraResolveParams {
  readonly isRolling: boolean;
  readonly isHighStakesRoll?: boolean;
  readonly isPawnAnimating: boolean;
  readonly activeModal: string | null;
  readonly hasRolledThisTurn?: boolean;
  readonly manualMode?: CameraMode | null;
  readonly hasTargetTile?: boolean;
  readonly isPreMatch?: boolean;
  readonly isBotTurn?: boolean;
  readonly isAnimatingPawnBot?: boolean;
  readonly isTargetOwnedByHuman?: boolean;
}

/**
 * Xác định chế độ máy quay tự động dựa theo trạng thái trò chơi
 */
export function resolveCameraMode(params: CameraResolveParams): CameraMode {
  if (params.manualMode) {
    return params.manualMode;
  }
  if (params.isPreMatch) {
    return 'pre_match';
  }
  if (params.activeModal === 'game_over') {
    return 'overview';
  }
  // Phiên đấu giá: Sân khấu đấu giá không gian 3D trung tâm
  if (params.activeModal === 'auction') {
    return 'auction_focus';
  }
  // [IMP-103] Cho phép camera bám đuổi theo quân cờ Bot khi đang nhảy và zoom vào ô đất khi Bot hạ cánh
  // Chỉ giữ góc nhìn overview khi Bot chưa gieo xúc xắc hoặc khi lượt chơi đang chờ
  if ((params.isBotTurn || params.isAnimatingPawnBot) && !params.isPawnAnimating && !params.hasTargetTile && !params.hasRolledThisTurn) {
    return 'overview';
  }
  // [IMP-125-P2] Khi gieo xúc xắc ở thế cờ kịch tính (High-Stakes): chuyển sang góc máy căng thẳng
  if (params.isRolling && params.isHighStakesRoll) {
    return 'tension_roll';
  }
  // [IMP-42] Bỏ hiệu ứng zoom vào khay xúc xắc khi quay xúc xắc để triệt tiêu giật lag (chỉ áp dụng cho lượt thường)
  if (params.isRolling) {
    return 'overview';
  }
  // 2. Quân cờ đang di chuyển: Bám đuổi theo quân cờ
  if (params.isPawnAnimating) {
    if ((params.isBotTurn || params.isAnimatingPawnBot) && params.isTargetOwnedByHuman === false && !params.isHighStakesRoll && params.activeModal === null) {
      return 'overview';
    }
    return 'pawn_chase';
  }
  // 3. Mở modal tương tác hoặc dừng chân tại ô đất sau khi di chuyển
  if (params.activeModal !== null || params.hasTargetTile || params.hasRolledThisTurn) {
    if ((params.isBotTurn || params.isAnimatingPawnBot) && params.isTargetOwnedByHuman === false && params.activeModal === null) {
      return 'overview';
    }
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
  offset?: readonly [number, number, number]
): [number, number, number] {
  const px = Number.isFinite(pawnCoords[0]) ? pawnCoords[0] : 0;
  const py = Number.isFinite(pawnCoords[1]) ? pawnCoords[1] : 0;
  const pz = Number.isFinite(pawnCoords[2]) ? pawnCoords[2] : 0;
  const off = offset ?? resolveStandardChaseOffset(pawnCoords);
  return [px + off[0], py + off[1], pz + off[2]];
}

export {
  resolveSideAwareCameraOffset,
  calculateTileFocusCameraPosition,
  calculateScreenShake,
  dampValue,
};

export interface TargetCameraState {
  readonly position: [number, number, number];
  readonly target: [number, number, number];
  readonly fov: number;
  readonly speed: number;
}

function configToCameraState(cfg: { readonly position: readonly [number, number, number]; readonly target: readonly [number, number, number]; readonly fov: number; readonly speed: number }): TargetCameraState {
  return {
    position: [cfg.position[0], cfg.position[1], cfg.position[2]],
    target: [cfg.target[0], cfg.target[1], cfg.target[2]],
    fov: cfg.fov,
    speed: cfg.speed,
  };
}

export function resolveSoftReturnDuration(isBot?: boolean): number {
  return isBot ? 650 : 1200;
}

/**
 * Tính toán trạng thái mục tiêu (position, target, fov, speed) cho chế độ Camera tương ứng
 */
export function calculateTargetCameraState(
  mode: CameraMode,
  pawnPosition?: readonly [number, number, number],
  tilePosition?: readonly [number, number, number],
  options?: TargetCameraStateOptions
): TargetCameraState {
  switch (mode) {
    case 'pre_match':
      return configToCameraState(CAMERA_CONFIG.pre_match);
    case 'dice_roll':
      return configToCameraState(CAMERA_CONFIG.dice_roll);
    case 'tension_roll':
      return configToCameraState(CAMERA_CONFIG.tension_roll);
    case 'pawn_chase': {
      if (options?.cinematicChase) {
        return calculateStreetChaseCameraState({
          pawnPosition: pawnPosition ?? [0, 0, 0],
          cellIndex: options.cellIndex,
          aspect: options.aspect,
          isHighStakesRoll: options.isHighStakesRoll,
          isJailFlight: options.isJailFlight,
          isTransientTurnCorner: options.isTransientTurnCorner,
          enableNorthFraming: options.enableNorthFraming,
        });
      }
      // Luot di thong thuong (cinematicChase: false) hoac legacy fallback (options undefined):
      // Camera luon bam theo quan co o do cao tieu chuan, khong bi kẹt o overview che khuat tam nhin
      const p = pawnPosition ?? [0, 0, 0];
      const safePx = Number.isFinite(p[0]) ? p[0] : 0;
      const safePz = Number.isFinite(p[2]) ? p[2] : 0;
      return {
        position: calculateChaseCameraPosition(p),
        target: [safePx, 0.2, safePz],
        fov: CAMERA_CONFIG.pawn_chase.fov,
        speed: CAMERA_CONFIG.pawn_chase.speed,
      };
    }
    case 'tile_focus': {
      const t = tilePosition ?? [0, 0, 0];
      const safeTx = Number.isFinite(t[0]) ? t[0] : 0;
      const safeTz = Number.isFinite(t[2]) ? t[2] : 0;
      return {
        position: calculateTileFocusCameraPosition(t),
        target: [safeTx, 0.15, safeTz],
        fov: CAMERA_CONFIG.tile_focus.fov,
        speed: CAMERA_CONFIG.tile_focus.speed,
      };
    }
    case 'auction_focus':
      return configToCameraState(CAMERA_CONFIG.auction_focus);
    case 'overview':
    default:
      if (options?.isRolling && !options?.isHighStakesRoll && !options?.isBotTurn) {
        return calculateDicePanCameraState(options?.rollingPlayerPos, options?.aspect);
      }
      if (options?.gamePhase) {
        return resolveOverviewConfigByPhase(options.gamePhase, CAMERA_CONFIG.overview);
      }
      return configToCameraState(CAMERA_CONFIG.overview);
  }
}

export { calculateResponsiveCameraDistance };

export interface HighStakesResult {
  readonly isHighStakes: boolean;
  readonly dangerousCellIndex?: number;
  readonly dangerousRent?: number;
}

/**
 * [IMP-125-P2] Quét 11 ô phía trước [2..12] tìm kiếm rủi ro tử thần (phí thuê >= 80% số dư hoặc số dư <= 0)
 */
export function checkHighStakesRoll(
  currentPos: number,
  playerBalance: number,
  playersInfo: Record<string, {
    id: string;
    balance?: number;
    ownedProperties?: readonly number[];
    mortgagedProperties?: readonly number[];
  }>,
  levelMap?: Record<number, 0 | 1 | 2 | 3 | number>,
  currentPlayerId?: string
): HighStakesResult {
  const safePos = Number.isFinite(currentPos) ? Math.floor(currentPos) : 0;
  const safeBalance = Number.isFinite(playerBalance) ? playerBalance : 0;
  const playersList = Object.values(playersInfo || {});
  const hasLevelFilter = Boolean(levelMap && Object.keys(levelMap).length > 0);

  for (let step = 2; step <= 12; step++) {
    const cellIndex = (safePos + step) % 40;
    const owner = playersList.find((p) => p.ownedProperties?.includes(cellIndex));

    if (!owner) continue;
    if (currentPlayerId && owner.id === currentPlayerId) continue;
    if (owner.mortgagedProperties?.includes(cellIndex)) continue;
    if (hasLevelFilter && !(cellIndex in levelMap!)) continue;

    const deed = PROPERTY_DEEDS.get(cellIndex);
    if (!deed) continue;

    const level = levelMap?.[cellIndex] ?? 0;
    let rent = deed.rent0;
    if (level === 1) rent = deed.rent1 ?? deed.rent0;
    else if (level === 2) rent = deed.rent2 ?? deed.rent0;
    else if (level >= 3) rent = deed.rent3 ?? deed.rent0;

    if (rent <= 0) continue;

    if (safeBalance <= 0 || rent >= 0.8 * safeBalance) {
      return {
        isHighStakes: true,
        dangerousCellIndex: cellIndex,
        dangerousRent: rent,
      };
    }
  }

  return { isHighStakes: false };
}
