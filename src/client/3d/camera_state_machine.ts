// [UI-S01/MSS][UI-S04/MSS] CameraStateMachine — 2026 Cinematic Action Cam & Dynamic Follow System
// Hỗ trợ các chế độ: Overview, Dice Roll Cinematic, Dynamic Tension Roll, Pawn Chase, và Tile Focus
import { PROPERTY_DEEDS } from '../../domain/property_data';

export type CameraMode = 'overview' | 'dice_roll' | 'tension_roll' | 'pawn_chase' | 'tile_focus' | 'auction_focus' | 'pre_match';

interface CameraConfigItem {
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly fov: number;
  readonly speed: number;
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
 * [IMP-126] Tính toán Camera Offset theo 4 cạnh bàn cờ (Side-Aware Orientation)
 * Đảm bảo Camera luôn đứng từ phía ngoài nhìn vào cạnh của ô cờ đó,
 * giúp toàn bộ chữ tên địa danh và tranh di sản luôn hiển thị thuận mắt 100% (không lộn ngược 180°).
 */
export function resolveSideAwareCameraOffset(
  tileCoords: readonly [number, number, number],
  baseOffset: readonly [number, number, number] = CAMERA_CONFIG.tile_focus.offset
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const height = Number.isFinite(baseOffset[1]) ? baseOffset[1] : 6.4;

  // Bàn cờ vuông 18x18 (chu vi tâm = 9.0).
  // Phân chia 4 cạnh dựa trên tọa độ cực đại của hình vuông (|z| vs |x|):
  const absX = Math.abs(tx);
  const absZ = Math.abs(tz);

  if (absZ >= absX) {
    if (tz < 0) {
      // Cạnh Bắc (Side 2, e.g. Đà Lạt, Cao Tốc, Hải Phòng: z = -9):
      // Camera nằm ở phía Bắc (Z < -9) nhìn về phía Nam (+Z) để chữ thuận mắt người xem
      return [-1.8, height, -6.8];
    }
    // Cạnh Nam (Side 0, e.g. Bến Thành, Cần Thơ: z = +9):
    // Camera nằm ở phía Nam (Z > 9) nhìn về phía Bắc (-Z). Giữ nguyên baseOffset để bảo toàn 100% test cũ.
    return [Number.isFinite(baseOffset[0]) ? baseOffset[0] : 5.2, height, Number.isFinite(baseOffset[2]) ? baseOffset[2] : 5.2];
  } else {
    if (tx < 0) {
      // Cạnh Tây (Side 1, e.g. Điện Lực EVN: x = -9):
      // Camera nằm ở phía Tây (X < -9) nhìn về phía Đông (+X) để chữ thuận mắt người xem
      return [-6.8, height, 1.8];
    }
    // Cạnh Đông (Side 3, e.g. Hoàn Kiếm, Ba Đình: x = +9):
    // Camera nằm ở phía Đông (X > 9) nhìn về phía Tây (-X) để chữ thuận mắt người xem
    return [6.8, height, -1.8];
  }
}

/**
 * Tính toán tọa độ vị trí Camera tập trung vào ô đất mục tiêu
 */
export function calculateTileFocusCameraPosition(
  tileCoords: readonly [number, number, number],
  offset?: readonly [number, number, number]
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const ty = Number.isFinite(tileCoords[1]) ? tileCoords[1] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const finalOffset = offset ?? resolveSideAwareCameraOffset(tileCoords);
  return [tx + finalOffset[0], ty + finalOffset[1], tz + finalOffset[2]];
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
    case 'pre_match':
      return {
        position: [CAMERA_CONFIG.pre_match.position[0], CAMERA_CONFIG.pre_match.position[1], CAMERA_CONFIG.pre_match.position[2]],
        target: [CAMERA_CONFIG.pre_match.target[0], CAMERA_CONFIG.pre_match.target[1], CAMERA_CONFIG.pre_match.target[2]],
        fov: CAMERA_CONFIG.pre_match.fov,
        speed: CAMERA_CONFIG.pre_match.speed,
      };
    case 'dice_roll':
      return {
        position: [CAMERA_CONFIG.dice_roll.position[0], CAMERA_CONFIG.dice_roll.position[1], CAMERA_CONFIG.dice_roll.position[2]],
        target: [CAMERA_CONFIG.dice_roll.target[0], CAMERA_CONFIG.dice_roll.target[1], CAMERA_CONFIG.dice_roll.target[2]],
        fov: CAMERA_CONFIG.dice_roll.fov,
        speed: CAMERA_CONFIG.dice_roll.speed,
      };
    case 'tension_roll':
      return {
        position: [CAMERA_CONFIG.tension_roll.position[0], CAMERA_CONFIG.tension_roll.position[1], CAMERA_CONFIG.tension_roll.position[2]],
        target: [CAMERA_CONFIG.tension_roll.target[0], CAMERA_CONFIG.tension_roll.target[1], CAMERA_CONFIG.tension_roll.target[2]],
        fov: CAMERA_CONFIG.tension_roll.fov,
        speed: CAMERA_CONFIG.tension_roll.speed,
      };
    case 'pawn_chase': {
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
      return {
        position: [CAMERA_CONFIG.auction_focus.position[0], CAMERA_CONFIG.auction_focus.position[1], CAMERA_CONFIG.auction_focus.position[2]],
        target: [CAMERA_CONFIG.auction_focus.target[0], CAMERA_CONFIG.auction_focus.target[1], CAMERA_CONFIG.auction_focus.target[2]],
        fov: CAMERA_CONFIG.auction_focus.fov,
        speed: CAMERA_CONFIG.auction_focus.speed,
      };
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

/**
 * [IMP-73] Tính toán cự ly camera thích ứng theo tỷ lệ khung hình (Aspect-Ratio Frustum Fit)
 * Đảm bảo 4 góc sa bàn luôn nằm trong vùng an toàn, không bị cắt mép đáy hoặc mép bên.
 */
export function calculateResponsiveCameraDistance(aspect: number, baseDistance = 32): number {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1.77;
  const safeBase = Number.isFinite(baseDistance) && baseDistance > 0 ? baseDistance : 32;
  if (safeAspect < 1.77) {
    return safeBase * Math.max(1.0, 1.77 / Math.max(safeAspect, 0.75));
  }
  return safeBase;
}

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

