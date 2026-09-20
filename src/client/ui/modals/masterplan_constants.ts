// [IMP-132] Masterplan Constants — Static definitions, 11x11 coordinates & 8 district groups
import { ColorGroup, CellType } from '../../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../../domain/theme';

export interface DistrictGroupDef {
  readonly id: string;
  readonly name: string;
  readonly colorGroup?: ColorGroup;
  readonly hexColor: string;
  readonly cellIndices: readonly number[];
}

export const GRID_TILE_COORDS: Record<number, { row: number; col: number }> = {
  0: { row: 11, col: 11 },
  1: { row: 11, col: 10 },
  2: { row: 11, col: 9 },
  3: { row: 11, col: 8 },
  4: { row: 11, col: 7 },
  5: { row: 11, col: 6 },
  6: { row: 11, col: 5 },
  7: { row: 11, col: 4 },
  8: { row: 11, col: 3 },
  9: { row: 11, col: 2 },
  10: { row: 11, col: 1 },
  11: { row: 10, col: 1 },
  12: { row: 9, col: 1 },
  13: { row: 8, col: 1 },
  14: { row: 7, col: 1 },
  15: { row: 6, col: 1 },
  16: { row: 5, col: 1 },
  17: { row: 4, col: 1 },
  18: { row: 3, col: 1 },
  19: { row: 2, col: 1 },
  20: { row: 1, col: 1 },
  21: { row: 1, col: 2 },
  22: { row: 1, col: 3 },
  23: { row: 1, col: 4 },
  24: { row: 1, col: 5 },
  25: { row: 1, col: 6 },
  26: { row: 1, col: 7 },
  27: { row: 1, col: 8 },
  28: { row: 1, col: 9 },
  29: { row: 1, col: 10 },
  30: { row: 1, col: 11 },
  31: { row: 2, col: 11 },
  32: { row: 3, col: 11 },
  33: { row: 4, col: 11 },
  34: { row: 5, col: 11 },
  35: { row: 6, col: 11 },
  36: { row: 7, col: 11 },
  37: { row: 8, col: 11 },
  38: { row: 9, col: 11 },
  39: { row: 10, col: 11 },
};

export const DISTRICT_GROUPS: readonly DistrictGroupDef[] = [
  { id: 'Nau', name: 'Đồng Bằng Sông Cửu Long', colorGroup: ColorGroup.Nau, hexColor: COLOR_GROUP_HEX[ColorGroup.Nau], cellIndices: [1, 3] },
  { id: 'XanhDaTroi', name: 'Đông Nam Bộ', colorGroup: ColorGroup.XanhDaTroi, hexColor: COLOR_GROUP_HEX[ColorGroup.XanhDaTroi], cellIndices: [6, 8, 9] },
  { id: 'Hong', name: 'Nam Trung Bộ', colorGroup: ColorGroup.Hong, hexColor: COLOR_GROUP_HEX[ColorGroup.Hong], cellIndices: [11, 13, 14] },
  { id: 'Cam', name: 'Bắc Duyên Hải Miền Trung', colorGroup: ColorGroup.Cam, hexColor: COLOR_GROUP_HEX[ColorGroup.Cam], cellIndices: [16, 18, 19] },
  { id: 'Do', name: 'Bắc Trung Bộ', colorGroup: ColorGroup.Do, hexColor: COLOR_GROUP_HEX[ColorGroup.Do], cellIndices: [21, 23, 24] },
  { id: 'Vang', name: 'Duyên Hải Đông Bắc & Đảo', colorGroup: ColorGroup.Vang, hexColor: COLOR_GROUP_HEX[ColorGroup.Vang], cellIndices: [26, 27, 29] },
  { id: 'XanhLa', name: 'Thủ Đô Hà Nội & Phụ Cận', colorGroup: ColorGroup.XanhLa, hexColor: COLOR_GROUP_HEX[ColorGroup.XanhLa], cellIndices: [31, 32, 34] },
  { id: 'Tim', name: 'Đô Thị Lõi TP. Hồ Chí Minh', colorGroup: ColorGroup.Tim, hexColor: COLOR_GROUP_HEX[ColorGroup.Tim], cellIndices: [37, 39] },
  { id: 'Railroad', name: 'Hạ Tầng Cảng & Giao Thông', hexColor: '#475569', cellIndices: [5, 15, 25, 35] },
  { id: 'Utility', name: 'Tiện Ích & Năng Lượng Quốc Gia', hexColor: '#0284c7', cellIndices: [12, 28] },
];

export function resolveSpecialIcon(type: CellType): string {
  switch (type) {
    case CellType.Go: return '🚩';
    case CellType.Audit: return '🚔';
    case CellType.FreeParking: return '🏖️';
    case CellType.TaxOrder: return '🚨';
    case CellType.Chance: return '⚡';
    case CellType.Market: return '🎴';
    case CellType.Tax: return '🏛️';
    case CellType.Hose: return '📊';
    case CellType.Railroad: return '🚂';
    case CellType.Utility: return '⚡';
    default: return '📍';
  }
}
