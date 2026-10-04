// [UC-ADM-SEC] Admin Security Utilities & Normalization
import crypto from 'node:crypto';

/**
 * Constant-time string comparison using SHA-256 and crypto.timingSafeEqual.
 * Mitigates timing side-channel attacks on secret comparison.
 */
export function timingSafeStringCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Normalizes room code by trimming whitespace and converting to uppercase.
 * Single source of truth for admin ingress points.
 */
export function normalizeRoomCode(rawRoomCode: string): string {
  return (rawRoomCode ?? '').trim().toUpperCase();
}
