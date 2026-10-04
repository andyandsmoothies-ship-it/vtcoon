// [IMP-256] Selective Bloom Registry & Object Tagging Engine
// Manages Three.js layers and selective post-processing isolation for emissive visual accents.

import type { Object3D } from 'three';

/**
 * Three.js Layer 11 dành riêng cho các thành phần phát sáng có chọn lọc (Selective Bloom).
 * Cách ly hoàn toàn khỏi Layer 0 mặc định của mặt bàn cờ và văn bản, triệt tiêu 100% hiện tượng chói lóa.
 */
export const SELECTIVE_BLOOM_LAYER = 11 as const;

export const SELECTIVE_BLOOM_DEFAULTS = {
  layer: SELECTIVE_BLOOM_LAYER,
  intensity: 0.45,
  mobileIntensity: 0.20,
  auctionIntensity: 0.65,
  luminanceThreshold: 0.45,
  auctionThreshold: 0.25,
  luminanceSmoothing: 0.30,
  radius: 0.55,
} as const;

/**
 * Gắn cờ và kích hoạt Layer 11 cho đối tượng 3D (duyệt đệ quy toàn bộ cây con).
 */
export function tagSelectiveBloom(object: Object3D | null | undefined, enabled = true): void {
  if (!object) return;
  object.traverse((child) => {
    if (enabled) {
      child.layers?.enable?.(SELECTIVE_BLOOM_LAYER);
      child.userData.selectiveBloom = true;
    } else {
      child.layers?.disable?.(SELECTIVE_BLOOM_LAYER);
      delete child.userData.selectiveBloom;
    }
  });
}

/**
 * Hủy kích hoạt Layer 11 cho đối tượng 3D.
 */
export function untagSelectiveBloom(object: Object3D | null | undefined): void {
  tagSelectiveBloom(object, false);
}

/**
 * Kiểm tra xem đối tượng có đang được gán Layer 11 phát sáng chọn lọc hay không.
 * Phòng vệ an toàn với optional chaining trước các đối tượng mock test thiếu thuộc tính layers.
 */
export function isSelectiveBloomTagged(object: Object3D | null | undefined): boolean {
  if (!object) return false;
  return Boolean(object.layers?.isEnabled?.(SELECTIVE_BLOOM_LAYER) || object.userData?.selectiveBloom);
}

/**
 * Tính toán ngưỡng sáng động cho Selective Bloom (pure function).
 * Cho phép màu vàng hoàng kim và hào quang sự kiện phát sáng ở mức phơi sáng tự nhiên mà không cần tăng emissive cực đoan.
 */
export function calculateSelectiveBloomThreshold(
  isAuctionActive: boolean,
  baseThreshold: number = SELECTIVE_BLOOM_DEFAULTS.luminanceThreshold,
  auctionThreshold: number = SELECTIVE_BLOOM_DEFAULTS.auctionThreshold
): number {
  if (!Number.isFinite(baseThreshold) || !Number.isFinite(auctionThreshold)) {
    return SELECTIVE_BLOOM_DEFAULTS.luminanceThreshold;
  }
  return isAuctionActive ? auctionThreshold : baseThreshold;
}

/**
 * Tính toán cường độ phát quang chọn lọc thích ứng theo nền tảng và trạng thái game.
 * Chốt chặn nghiêm ngặt Number.isFinite chống lọt NaN vào Three.js shader uniform.
 */
export function calculateSelectiveBloomIntensity(
  isMobile: boolean,
  isAuctionActive: boolean,
  baseIntensity: number = SELECTIVE_BLOOM_DEFAULTS.intensity
): number {
  if (!Number.isFinite(baseIntensity)) {
    return SELECTIVE_BLOOM_DEFAULTS.intensity;
  }
  if (isMobile) {
    return SELECTIVE_BLOOM_DEFAULTS.mobileIntensity;
  }
  return isAuctionActive ? SELECTIVE_BLOOM_DEFAULTS.auctionIntensity : baseIntensity;
}
