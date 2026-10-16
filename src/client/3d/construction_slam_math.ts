// [UI-S04/MSS][UI-S05/MSS][IMP-410] Construction Slam Math Seam
// Pure calculation of building world position and impact drop kinematics (squash & rebound).

import { cellPosition } from './board_coords';
import { getBuildingLotTransform } from './building_lot_transform';

export interface ImpactDropResult {
  readonly yOffset: number;
  readonly scaleY: number;
  readonly scaleXZ: number;
  readonly hasHitGround: boolean;
}

/**
 * Tính toán tọa độ không gian thế giới chính xác của công trình trên ô cờ
 * bù trừ vị trí cục bộ và xoay theo từng cạnh bàn cờ.
 */
export function getBuildingWorldPosition(cellIndex: number): [number, number, number] {
  if (!Number.isFinite(cellIndex)) return [0, 0.12, 0];
  const [cx, , cz] = cellPosition(cellIndex);
  const side = Math.floor(cellIndex / 10);
  const lot = getBuildingLotTransform(cellIndex);
  const [lx, , lz] = lot.position;
  switch (side) {
    case 0: return [cx + lx, 0.12, cz + lz];
    case 1: return [cx - lz, 0.12, cz + lx];
    case 2: return [cx - lx, 0.12, cz - lz];
    default: return [cx + lz, 0.12, cz - lx];
  }
}

/**
 * Tính toán quỹ đạo rơi tự do và lực đanh chắc va đập đàn hồi (Squash & Rebound)
 */
export function calculateImpactDrop(
  elapsedMs: number,
  dropDurationMs: number = 380,
  initialHeight: number = 3.6
): ImpactDropResult {
  if (!Number.isFinite(elapsedMs)) {
    return { yOffset: 0, scaleY: 1.0, scaleXZ: 1.0, hasHitGround: true };
  }
  if (elapsedMs < 0) {
    return { yOffset: initialHeight, scaleY: 1.0, scaleXZ: 1.0, hasHitGround: false };
  }
  // Pha 1: Rơi tự do gia tốc trọng trường từ trên cao cắm xuống mặt đế
  if (elapsedMs < dropDurationMs) {
    const tNorm = elapsedMs / dropDurationMs;
    // Phương trình rơi tự do y = H * (1 - t^2)
    const yOffset = initialHeight * (1 - tNorm * tNorm);
    const stretch = 1.0 + 0.08 * tNorm;
    const thin = 1.0 - 0.04 * tNorm;
    return { yOffset, scaleY: stretch, scaleXZ: thin, hasHitGround: false };
  }
  // Pha 2: Biến dạng nén va đập vi mô (Impact Squash: 80ms)
  const squashTime = elapsedMs - dropDurationMs;
  if (squashTime <= 80) {
    const squashNorm = squashTime / 80;
    const squashFactor = Math.sin(squashNorm * Math.PI);
    const scaleY = 1.0 - squashFactor * 0.22;
    const scaleXZ = 1.0 + squashFactor * 0.18;
    return { yOffset: 0, scaleY, scaleXZ, hasHitGround: true };
  }
  // Pha 3: Nảy nhẹ điều hòa đàn hồi (Rebound: 120ms)
  const reboundTime = squashTime - 80;
  if (reboundTime <= 120) {
    const reboundNorm = reboundTime / 120;
    const scaleY = 1.0 + Math.sin(reboundNorm * Math.PI) * 0.08;
    const scaleXZ = 1.0 - Math.sin(reboundNorm * Math.PI) * 0.04;
    return { yOffset: 0, scaleY, scaleXZ, hasHitGround: true };
  }
  // Pha 4: Ổn định hoàn toàn trên mặt đế ô cờ
  return { yOffset: 0, scaleY: 1.0, scaleXZ: 1.0, hasHitGround: true };
}
