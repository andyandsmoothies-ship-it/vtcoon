// [UI-S03/MSS][IMP-203] Landmark Registry — 22 Bespoke Architecture SSOT
// Maps all 22 buyable property tiles to unique Vietnamese landmarks and Level 3 GLB assets.

import type { RegionalTypology } from './building_typology';

export interface LandmarkEntry {
  readonly cellIndex: number;
  readonly name: string;
  readonly typology: RegionalTypology;
  readonly modelUrl: string;
  readonly architecturalStyle: string;
}

export const LANDMARK_REGISTRY: Readonly<Record<number, LandmarkEntry>> = {
  1: {
    cellIndex: 1,
    name: 'Dinh Thự Cổ Bình Thủy (Cần Thơ)',
    typology: 'riverine',
    modelUrl: '/models/landmarks/bld_c3_cell_1.glb',
    architecturalStyle: 'Nhà Cổ Nam Bộ Gỗ Quý & Hoa Văn Pháp Cổ',
  },
  3: {
    cellIndex: 3,
    name: 'Điện Thờ Bà Chúa Xứ (Châu Đốc)',
    typology: 'riverine',
    modelUrl: '/models/landmarks/bld_c3_cell_3.glb',
    architecturalStyle: 'Kiến Trúc Cổ Tháp Tam Cấp Mái Ngói Xanh',
  },
  6: {
    cellIndex: 6,
    name: 'Tòa Tháp Đôi Hành Chính (Bình Dương)',
    typology: 'metropolis',
    modelUrl: '/models/landmarks/bld_c3_cell_6.glb',
    architecturalStyle: 'Tòa Tháp Đôi Kính Đương Đại Cầu Nối',
  },
  8: {
    cellIndex: 8,
    name: 'Lâu Đài Kỳ Quan Hoàng Gia (Đồng Nai)',
    typology: 'metropolis',
    modelUrl: '/models/landmarks/bld_c3_cell_8.glb',
    architecturalStyle: 'Lâu Đài Cổ Điển Châu Âu Mái Vòm',
  },
  9: {
    cellIndex: 9,
    name: 'Hải Đăng Vũng Tàu (Bà Rịa - Vũng Tàu)',
    typology: 'resort',
    modelUrl: '/models/landmarks/bld_c3_cell_9.glb',
    architecturalStyle: 'Tháp Hải Đăng Trắng Cổ Điển Thấu Kính Đèn Biển',
  },
  11: {
    cellIndex: 11,
    name: 'Resort Cánh Buồm Đồi Cát (Bình Thuận)',
    typology: 'resort',
    modelUrl: '/models/landmarks/bld_c3_cell_11.glb',
    architecturalStyle: 'Kiến Trúc Cánh Buồm Nghỉ Dưỡng Nhiệt Đới',
  },
  13: {
    cellIndex: 13,
    name: 'Ga Xe Lửa Art Deco Đà Lạt (Lâm Đồng)',
    typology: 'resort',
    modelUrl: '/models/landmarks/bld_c3_cell_13.glb',
    architecturalStyle: 'Kiến Trúc Art Deco 3 Mái Nhọn Cao Nguyên',
  },
  14: {
    cellIndex: 14,
    name: 'Tháp Trầm Hương Biển (Nha Trang)',
    typology: 'resort',
    modelUrl: '/models/landmarks/bld_c3_cell_14.glb',
    architecturalStyle: 'Biểu Tượng Búp Sen Tháp Trầm Ven Biển',
  },
  16: {
    cellIndex: 16,
    name: 'Tháp Đôi Chăm Pa Di Sản (Quy Nhơn)',
    typology: 'resort',
    modelUrl: '/models/landmarks/bld_c3_cell_16.glb',
    architecturalStyle: 'Tháp Đôi Gạch Nung Chăm Pa Cổ Kính',
  },
  18: {
    cellIndex: 18,
    name: 'Lầu Ngũ Phụng - Ngọ Môn (Huế)',
    typology: 'heritage',
    modelUrl: '/models/landmarks/bld_c3_cell_18.glb',
    architecturalStyle: 'Hoàng Thành Cung Đình Mái Ngói Hoàng Lưu Ly',
  },
  19: {
    cellIndex: 19,
    name: 'Cao Ốc Khí Động Học Bắp Ngô (Đà Nẵng)',
    typology: 'metropolis',
    modelUrl: '/models/landmarks/bld_c3_cell_19.glb',
    architecturalStyle: 'Tòa Nhà Khí Động Học Hình Trái Bắp Kính Xanh',
  },
  21: {
    cellIndex: 21,
    name: 'Khách Sạn Vỏ Sò Hoàng Gia (Sầm Sơn)',
    typology: 'resort',
    modelUrl: '/models/landmarks/bld_c3_cell_21.glb',
    architecturalStyle: 'Khách Sạn Nghỉ Dưỡng Vỏ Sò Biển Đương Đại',
  },
  23: {
    cellIndex: 23,
    name: 'Nhà Hát Thành Cổ Lam Sơn (Vinh)',
    typology: 'heritage',
    modelUrl: '/models/landmarks/bld_c3_cell_23.glb',
    architecturalStyle: 'Nhà Hát Thành Cổ Gạch Mộc & Hoa Văn Truyền Thống',
  },
  24: {
    cellIndex: 24,
    name: 'Đại Bảo Tháp Bái Đính (Ninh Bình)',
    typology: 'heritage',
    modelUrl: '/models/landmarks/bld_c3_cell_24.glb',
    architecturalStyle: 'Đại Bảo Tháp Phật Giáo 13 Tầng Mái Đao',
  },
  26: {
    cellIndex: 26,
    name: 'Nhà Hát Lớn Thành Phố Cảng (Hải Phòng)',
    typology: 'metropolis',
    modelUrl: '/models/landmarks/bld_c3_cell_26.glb',
    architecturalStyle: 'Nhà Hát Tân Cổ Điển Pháp Cột Tròn Corinthian',
  },
  27: {
    cellIndex: 27,
    name: 'Tháp Chuông Venice Đảo Ngọc (Phú Quốc)',
    typology: 'riverine',
    modelUrl: '/models/landmarks/bld_c3_cell_27.glb',
    architecturalStyle: 'Tháp Chuông Hoàng Hôn Địa Trung Hải Gạch Đỏ',
  },
  29: {
    cellIndex: 29,
    name: 'Bảo Tàng Than Kính Đen (Quảng Ninh)',
    typology: 'resort',
    modelUrl: '/models/landmarks/bld_c3_cell_29.glb',
    architecturalStyle: 'Khối Tinh Thể Than Đá Kính Đen Độc Bản',
  },
  31: {
    cellIndex: 31,
    name: 'Biệt Thự Rừng Cọ Ecopark (Hưng Yên)',
    typology: 'heritage',
    modelUrl: '/models/landmarks/bld_c3_cell_31.glb',
    architecturalStyle: 'Biệt Thự Sinh Thái Ven Hồ Mái Dốc Hiện Đại',
  },
  32: {
    cellIndex: 32,
    name: 'Tháp Keangnam Landmark 72 (Cầu Giấy)',
    typology: 'metropolis',
    modelUrl: '/models/landmarks/bld_c3_cell_32.glb',
    architecturalStyle: 'Chọc Trời Kính Xanh Đa Giác Siêu Cao Tầng',
  },
  34: {
    cellIndex: 34,
    name: 'Nhà Hát Lớn Hà Nội (Hoàn Kiếm)',
    typology: 'heritage',
    modelUrl: '/models/landmarks/bld_c3_cell_34.glb',
    architecturalStyle: 'Nhà Hát Opéra Garnier Tân Cổ Điển Mái Vòm Đá Phiến',
  },
  37: {
    cellIndex: 37,
    name: 'Tháp Xanh Empire Thủ Thiêm (Thủ Đức)',
    typology: 'metropolis',
    modelUrl: '/models/landmarks/bld_c3_cell_37.glb',
    architecturalStyle: 'Tòa Tháp Sinh Thái Giếng Trời Vườn Treo Tương Lai',
  },
  39: {
    cellIndex: 39,
    name: 'Tháp Bitexco Búp Sen Sài Gòn (Quận 1)',
    typology: 'metropolis',
    modelUrl: '/models/landmarks/bld_c3_cell_39.glb',
    architecturalStyle: 'Chọc Trời Búp Sen Kính Vát Sân Đỗ Trực Thăng',
  },
} as const;

export function getLandmarkInfo(cellIndex: number): LandmarkEntry | undefined {
  return LANDMARK_REGISTRY[cellIndex];
}
