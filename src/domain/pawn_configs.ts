// [TC-P3.9/MSS][IMP-29.2][IMP-83][IMP-246] Domain Pawn Metadata & Configurations
// Pure domain data structures — ZERO Three.js or DOM runtime dependencies

export interface LuxuryPawnConfig {
  readonly slot: number;
  readonly name: string;
  readonly title: string;
  readonly color: string;
  readonly metalness: number;
  readonly roughness: number;
  readonly modelUrl: string;
  readonly icon: string;
  readonly scale: readonly [number, number, number];
  readonly yOffset?: number;
}

export const LUXURY_PAWN_CONFIGS: readonly LuxuryPawnConfig[] = [
  {
    slot: 0,
    name: 'Quân Xe Chiến Hoàng Gia',
    title: 'Đại Gia Sài Gòn (Host)',
    color: '#DC2626',
    metalness: 0.25,
    roughness: 0.28,
    modelUrl: '/models/pawns/pawn_rook.glb',
    icon: '🏰',
    scale: [1.0, 1.0, 1.0],
    yOffset: 0.03,
  },
  {
    slot: 1,
    name: 'Quân Pháo Thần Công Cổ Điển',
    title: 'Chú Sáu',
    color: '#27AE60',
    metalness: 0.25,
    roughness: 0.28,
    modelUrl: '/models/pawns/pawn_cannon.glb',
    icon: '💣',
    scale: [1.0, 1.0, 1.0],
    yOffset: 0.03,
  },
  {
    slot: 2,
    name: 'Quân Mã Phong Vân Thượng Lưu',
    title: 'Cô Tư',
    color: '#E67E22',
    metalness: 0.25,
    roughness: 0.28,
    modelUrl: '/models/pawns/pawn_horse.glb',
    icon: '🐎',
    scale: [1.0, 1.0, 1.0],
    yOffset: 0.03,
  },
  {
    slot: 3,
    name: 'Quân Hậu Quyền Quý Indochine',
    title: 'Bé Bo',
    color: '#10B981',
    metalness: 0.25,
    roughness: 0.28,
    modelUrl: '/models/pawns/pawn_queen.glb',
    icon: '👑',
    scale: [1.0, 1.0, 1.0],
    yOffset: 0.03,
  },
];

/**
 * Lấy cấu hình linh vật quân cờ theo chỉ số slot (0-3), fallback an toàn về slot 0 nếu ngoài biên
 */
export function getPawnConfigBySlot(slotIndex: number): LuxuryPawnConfig {
  if (slotIndex === 0) {
    return LUXURY_PAWN_CONFIGS[0]!;
  }
  if (!Number.isFinite(slotIndex) || slotIndex < 0 || slotIndex >= LUXURY_PAWN_CONFIGS.length) {
    return LUXURY_PAWN_CONFIGS[0]!;
  }
  return LUXURY_PAWN_CONFIGS[Math.floor(slotIndex)] ?? LUXURY_PAWN_CONFIGS[0]!;
}
