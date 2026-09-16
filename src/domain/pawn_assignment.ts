// [UC-IMP83/MSS] pawn_assignment.ts — Phân Bổ Quân Cờ Ngẫu Nhiên Xác Định Cho Người Chơi
import { mulberry32 } from './dice.js';
import { LUXURY_PAWN_CONFIGS, getPawnConfigBySlot, type LuxuryPawnConfig } from '../client/3d/luxury_pawn_models.js';
import { PLAYER_TOKEN_PALETTE } from './theme.js';

export interface PawnAssignmentResult {
  readonly playerId: string;
  readonly slotIndex: number;
  readonly pawnConfig?: LuxuryPawnConfig;
  readonly tokenColor?: string;
  readonly mascotIcon?: string;
  readonly mascotName?: string;
}

/**
 * FNV-1a Hash biến đổi chuỗi roomCode hoặc seed thành số nguyên 32-bit dương
 */
export function hashSeed(seedStr: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Phân bổ ngẫu nhiên không trùng lặp các slot quân cờ [0, 1, 2, 3] cho người chơi trong phòng.
 * Xác định tuyệt đối (deterministic) theo roomCode / seed.
 */
export function assignRandomPlayerPawns(
  players: readonly (string | { id: string })[],
  roomCodeOrSeed?: string
): readonly PawnAssignmentResult[] {
  if (!players || players.length === 0) {
    return [];
  }

  const seed = roomCodeOrSeed && roomCodeOrSeed.length > 0 ? hashSeed(roomCodeOrSeed) : 1337;
  const rng = mulberry32(seed);

  // Xáo trộn Fisher-Yates trên 4 slots [0, 1, 2, 3]
  const availableSlots = [0, 1, 2, 3];
  for (let i = availableSlots.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = availableSlots[i]!;
    availableSlots[i] = availableSlots[j]!;
    availableSlots[j] = temp;
  }

  // Xáo trộn Fisher-Yates trên các màu từ PLAYER_TOKEN_PALETTE
  const availableColors = [...PLAYER_TOKEN_PALETTE];
  for (let i = availableColors.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = availableColors[i]!;
    availableColors[i] = availableColors[j]!;
    availableColors[j] = temp;
  }

  return players.map((p, idx) => {
    const playerId = typeof p === 'string' ? p : p.id;
    const slotIndex = availableSlots[idx % availableSlots.length]!;
    const pawnConfig = getPawnConfigBySlot(slotIndex);
    const tokenColor = availableColors[idx % availableColors.length] ?? '#38BDF8';
    return {
      playerId,
      slotIndex,
      pawnConfig,
      tokenColor,
      mascotIcon: pawnConfig?.icon ?? '🐕',
      mascotName: pawnConfig?.name ?? 'Tượng Bạc Phú Quý',
    };
  });
}
