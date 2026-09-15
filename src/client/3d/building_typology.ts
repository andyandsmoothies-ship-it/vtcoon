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

export function getBuildingModelUrl(cellIndex: number, level: 1 | 2 | 3): string | null {
  const typology = getRegionalTypology(cellIndex);
  if (!typology) {
    return null;
  }
  return `/models/buildings/bld_${typology}_c${level}.glb`;
}
