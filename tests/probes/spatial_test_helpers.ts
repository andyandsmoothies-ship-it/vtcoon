/**
 * [SPATIAL TEST HELPERS] Helper validations for Three.js camera projection matrices,
 * view frustums, and WebGL context loss recovery.
 * Kept in tests/ to preserve strict Anti-TIDD compliance (Rule 8: zero-test-props).
 */

export const MAX_ALLOWED_DRAW_CALLS = 85;

export function validateCameraFrustum(
  near: number,
  far: number,
  fov: number,
  aspect: number
): boolean {
  if (near <= 0 || far <= near || fov <= 0 || fov >= 180 || aspect <= 0) return false;
  if (!Number.isFinite(near) || !Number.isFinite(far) || !Number.isFinite(fov) || !Number.isFinite(aspect)) {
    return false;
  }
  return true;
}

export function validateMatrixFinite(elements: ArrayLike<number>): boolean {
  if (elements.length !== 16) return false;
  for (let i = 0; i < 16; i++) {
    const val = elements[i];
    if (typeof val !== 'number' || !Number.isFinite(val) || Number.isNaN(val)) {
      return false;
    }
  }
  return true;
}

export function validateContextLossRecovery(defaultPrevented: boolean): 'RECOVERABLE' | 'UNRECOVERABLE_ABORT' {
  return defaultPrevented ? 'RECOVERABLE' : 'UNRECOVERABLE_ABORT';
}
