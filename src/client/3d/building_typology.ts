// [UI-S03/MSS][IMP-65] Regional Architectural Typologies & Model URL Resolver
// Classifies 22 property tiles into 4 Vietnamese regional architectural styles:
// 1. riverine: Sông Nước Nam Bộ (Cần Thơ, An Giang, Phú Quốc)
// 2. resort: Nghỉ Dưỡng Biển & Núi (Vũng Tàu, Bình Thuận, Đà Lạt, Nha Trang, Quy Nhơn, Sầm Sơn, Hạ Long)
// 3. heritage: Phố Cổ & Di Sản (Huế, Nghệ An, Ninh Bình, Hưng Yên, Hoàn Kiếm)
// 4. metropolis: Siêu Đô Thị Tài Chính (Bình Dương, Đồng Nai, Đà Nẵng, Hải Phòng, Cầu Giấy, Thủ Đức, Quận 1)

export type RegionalTypology = 'riverine' | 'resort' | 'heritage' | 'metropolis';

export const BUILDING_BASE_PLINTH_WIDTH = 0.55;

export const BUILDING_MODEL_URLS: Readonly<Record<1 | 2 | 3, string>> = {
  1: '/models/buildings/building_c1.glb',
  2: '/models/buildings/building_c2.glb',
  3: '/models/buildings/building_c3.glb',
} as const;

const RIVERINE_CELLS = new Set<number>([1, 3, 27]);
const RESORT_CELLS = new Set<number>([9, 11, 13, 14, 16, 21, 29]);
const HERITAGE_CELLS = new Set<number>([18, 23, 24, 31, 34]);
const METROPOLIS_CELLS = new Set<number>([6, 8, 19, 26, 32, 37, 39]);

export function getRegionalTypology(cellIndex: number): RegionalTypology | null {
  if (RIVERINE_CELLS.has(cellIndex)) return 'riverine';
  if (RESORT_CELLS.has(cellIndex)) return 'resort';
  if (HERITAGE_CELLS.has(cellIndex)) return 'heritage';
  if (METROPOLIS_CELLS.has(cellIndex)) return 'metropolis';
  return null;
}

export interface RegionalFallbackPalette {
  readonly typology: RegionalTypology;
  readonly c1BaseColor: string;
  readonly c1BodyColor: string;
  readonly c1RoofColor: string;
  readonly c1DoorColor: string;
  readonly c1WindowGlowColor: string;
  readonly c2BodyColor: string;
  readonly c2CrownColor: string;
  readonly c2AccentColor: string;
}

const REGIONAL_FALLBACK_PALETTES: Readonly<Record<RegionalTypology, RegionalFallbackPalette>> = {
  riverine: {
    typology: 'riverine',
    c1BaseColor: '#78350F',
    c1BodyColor: '#FDE68A',
    c1RoofColor: '#C2410C',
    c1DoorColor: '#451A03',
    c1WindowGlowColor: '#F59E0B',
    c2BodyColor: '#D97706',
    c2CrownColor: '#B91C1C',
    c2AccentColor: '#FDE68A',
  },
  resort: {
    typology: 'resort',
    c1BaseColor: '#E2E8F0',
    c1BodyColor: '#F8FAFC',
    c1RoofColor: '#0284C7',
    c1DoorColor: '#0369A1',
    c1WindowGlowColor: '#38BDF8',
    c2BodyColor: '#06B6D4',
    c2CrownColor: '#F8FAFC',
    c2AccentColor: '#E0F2FE',
  },
  heritage: {
    typology: 'heritage',
    c1BaseColor: '#475569',
    c1BodyColor: '#FEF08A',
    c1RoofColor: '#D97706',
    c1DoorColor: '#7F1D1D',
    c1WindowGlowColor: '#F59E0B',
    c2BodyColor: '#991B1B',
    c2CrownColor: '#F59E0B',
    c2AccentColor: '#FDE047',
  },
  metropolis: {
    typology: 'metropolis',
    c1BaseColor: '#475569',
    c1BodyColor: '#FEF3C7',
    c1RoofColor: '#B91C1C',
    c1DoorColor: '#451A03',
    c1WindowGlowColor: '#F59E0B',
    c2BodyColor: '#0284C7',
    c2CrownColor: '#475569',
    c2AccentColor: '#CBD5E1',
  },
};

export function getRegionalFallbackPalette(typology?: RegionalTypology | null): RegionalFallbackPalette {
  if (typology && REGIONAL_FALLBACK_PALETTES[typology]) {
    return REGIONAL_FALLBACK_PALETTES[typology];
  }
  return REGIONAL_FALLBACK_PALETTES.metropolis;
}

export function getBuildingModelUrl(cellIndex: number, level: 1 | 2 | 3): string | null {
  const typology = getRegionalTypology(cellIndex);
  if (!typology) {
    return null;
  }
  if (level === 1 || level === 2) {
    return `/models/buildings/bld_${typology}_c${level}.glb`;
  }
  return `/models/landmarks/bld_c3_cell_${cellIndex}.glb`;
}
