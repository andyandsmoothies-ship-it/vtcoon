// [UI-S01/MSS] Static Tile Metadata & Vietnamese Cultural Identifiers for 40 Board Cells
// Sources: docs/requirements.md §II, docs/domain/design.md, src/domain/board_config.ts
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { ColorGroup } from '../../domain/board_config';

export interface TileMetadata {
  readonly title: string;
  readonly subtitle: string;
  readonly price?: number;
  readonly priceLabel?: string;
  readonly bannerColor: string;
  readonly category: string;
  readonly icon: string;
}

export const TILE_METADATA_MAP: Readonly<Record<number, TileMetadata>> = {
  // Cạnh 1: Ô 00 - Ô 10
  0:  { title: 'KHỞI HÀNH', subtitle: 'GO', priceLabel: '+2.000 Tr.', bannerColor: '#F59E0B', category: 'XUẤT PHÁT', icon: 'flag' },
  1:  { title: 'CẦN THƠ', subtitle: 'Cái Răng', price: 600, bannerColor: COLOR_GROUP_HEX[ColorGroup.Nau], category: 'BĐS ĐÔ THỊ', icon: 'boat' },
  2:  { title: 'THỊ TRƯỜNG', subtitle: 'Phiếu Cơ Chế', bannerColor: '#0D9488', category: 'CƠ CHẾ', icon: 'chest' },
  3:  { title: 'AN GIANG', subtitle: 'Châu Đốc', price: 600, bannerColor: COLOR_GROUP_HEX[ColorGroup.Nau], category: 'BĐS ĐÔ THỊ', icon: 'temple' },
  4:  { title: 'LỆ PHÍ ĐẤT', subtitle: 'Đăng Ký Đất Đai', priceLabel: 'Nộp 1.000 Tr.', bannerColor: '#E11D48', category: 'NGÂN SÁCH', icon: 'tax' },
  5:  { title: 'LONG THÀNH', subtitle: 'Cảng HKQT', price: 2000, bannerColor: '#334155', category: 'HẠ TẦNG', icon: 'plane' },
  6:  { title: 'BÌNH DƯƠNG', subtitle: 'Thể Thao & Golf', price: 1000, bannerColor: COLOR_GROUP_HEX[ColorGroup.XanhDaTroi], category: 'BĐS DỊCH VỤ', icon: 'golf' },
  7:  { title: 'CƠ HỘI', subtitle: 'Vận May', bannerColor: '#EA580C', category: 'VẬN MAY', icon: 'chance' },
  8:  { title: 'ĐỒNG NAI', subtitle: 'Công Viên Safari', price: 1000, bannerColor: COLOR_GROUP_HEX[ColorGroup.XanhDaTroi], category: 'BĐS DỊCH VỤ', icon: 'roller' },
  9:  { title: 'VŨNG TÀU', subtitle: 'Bãi Sau', price: 1200, bannerColor: COLOR_GROUP_HEX[ColorGroup.XanhDaTroi], category: 'BĐS NGHỈ DƯỠNG', icon: 'lighthouse' },
  10: { title: 'KIỂM TOÁN', subtitle: 'Thanh Tra', bannerColor: '#DC2626', category: 'THANH TRA', icon: 'shield' },

  // Cạnh 2: Ô 11 - Ô 20
  11: { title: 'BÌNH THUẬN', subtitle: 'Mũi Né', price: 1400, bannerColor: COLOR_GROUP_HEX[ColorGroup.Hong], category: 'BĐS NGHỈ DƯỠNG', icon: 'kite' },
  12: { title: 'ĐIỆN LỰC', subtitle: 'Tập Đoàn EVN', price: 1500, bannerColor: '#2563EB', category: 'TIỆN ÍCH', icon: 'bolt' },
  13: { title: 'LÂM ĐỒNG', subtitle: 'Đà Lạt', price: 1400, bannerColor: COLOR_GROUP_HEX[ColorGroup.Hong], category: 'BĐS NGHỈ DƯỠNG', icon: 'pine' },
  14: { title: 'KHÁNH HÒA', subtitle: 'Nha Trang', price: 1600, bannerColor: COLOR_GROUP_HEX[ColorGroup.Hong], category: 'BĐS NGHỈ DƯỠNG', icon: 'lotus_tower' },
  15: { title: 'CÁI MÉP', subtitle: 'Cảng Biển Sâu', price: 2000, bannerColor: '#334155', category: 'HẠ TẦNG', icon: 'crane' },
  16: { title: 'BÌNH ĐỊNH', subtitle: 'Quy Nhơn', price: 1800, bannerColor: COLOR_GROUP_HEX[ColorGroup.Cam], category: 'BĐS NGHỈ DƯỠNG', icon: 'cham' },
  17: { title: 'THỊ TRƯỜNG', subtitle: 'Phiếu Cơ Chế', bannerColor: '#0D9488', category: 'CƠ CHẾ', icon: 'chest' },
  18: { title: 'HUẾ', subtitle: 'Cố Đô Di Sản', price: 1800, bannerColor: COLOR_GROUP_HEX[ColorGroup.Cam], category: 'BĐS NGHỈ DƯỠNG', icon: 'gate' },
  19: { title: 'ĐÀ NẴNG', subtitle: 'Sơn Trà - Sông Hàn', price: 2000, bannerColor: COLOR_GROUP_HEX[ColorGroup.Cam], category: 'BĐS ĐÔ THỊ', icon: 'dragon' },
  20: { title: 'NGHỈ DƯỠNG', subtitle: 'Miễn Phí', bannerColor: '#059669', category: 'DỪNG CHÂN', icon: 'sun' },

  // Cạnh 3: Ô 21 - Ô 30
  21: { title: 'THANH HÓA', subtitle: 'Sầm Sơn', price: 2200, bannerColor: COLOR_GROUP_HEX[ColorGroup.Do], category: 'BĐS NGHỈ DƯỠNG', icon: 'island' },
  22: { title: 'CƠ HỘI', subtitle: 'Vận May', bannerColor: '#EA580C', category: 'VẬN MAY', icon: 'chance' },
  23: { title: 'NGHỆ AN', subtitle: 'TP. Vinh', price: 2200, bannerColor: COLOR_GROUP_HEX[ColorGroup.Do], category: 'BĐS ĐÔ THỊ', icon: 'lotus' },
  24: { title: 'NINH BÌNH', subtitle: 'Tràng An', price: 2400, bannerColor: COLOR_GROUP_HEX[ColorGroup.Do], category: 'BĐS NGHỈ DƯỠNG', icon: 'mountain' },
  25: { title: 'CAO TỐC', subtitle: 'Bắc - Nam', price: 2000, bannerColor: '#334155', category: 'HẠ TẦNG', icon: 'highway' },
  26: { title: 'HẢI PHÒNG', subtitle: 'Kinh Tế Đêm', price: 2600, bannerColor: COLOR_GROUP_HEX[ColorGroup.Vang], category: 'BĐS DỊCH VỤ', icon: 'pho' },
  27: { title: 'PHÚ QUỐC', subtitle: 'Grand World', price: 2600, bannerColor: COLOR_GROUP_HEX[ColorGroup.Vang], category: 'BĐS DỊCH VỤ', icon: 'gondola' },
  28: { title: 'VIỄN THÔNG', subtitle: 'Viettel 5G', price: 1500, bannerColor: '#2563EB', category: 'TIỆN ÍCH', icon: 'signal' },
  29: { title: 'QUẢNG NINH', subtitle: 'Vịnh Hạ Long', price: 2800, bannerColor: COLOR_GROUP_HEX[ColorGroup.Vang], category: 'BĐS NGHỈ DƯỠNG', icon: 'halong' },
  30: { title: 'THANH TRA', subtitle: 'Vào Trạm', bannerColor: '#B91C1C', category: 'THANH TRA', icon: 'gavel' },

  // Cạnh 4: Ô 31 - Ô 39
  31: { title: 'HƯNG YÊN', subtitle: 'Văn Giang', price: 3000, bannerColor: COLOR_GROUP_HEX[ColorGroup.XanhLa], category: 'BĐS ĐÔ THỊ', icon: 'eco' },
  32: { title: 'HÀ NỘI', subtitle: 'Cầu Giấy', price: 3000, bannerColor: COLOR_GROUP_HEX[ColorGroup.XanhLa], category: 'BĐS ĐÔ THỊ', icon: 'chip' },
  33: { title: 'THỊ TRƯỜNG', subtitle: 'Phiếu Cơ Chế', bannerColor: '#0D9488', category: 'CƠ CHẾ', icon: 'chest' },
  34: { title: 'HÀ NỘI', subtitle: 'Hoàn Kiếm', price: 3200, bannerColor: COLOR_GROUP_HEX[ColorGroup.XanhLa], category: 'BĐS ĐÔ THỊ', icon: 'turtle' },
  35: { title: 'NỘI BÀI', subtitle: 'Cảng HKQT', price: 2000, bannerColor: '#334155', category: 'HẠ TẦNG', icon: 'plane' },
  36: { title: 'CƠ HỘI', subtitle: 'Vận May', bannerColor: '#EA580C', category: 'VẬN MAY', icon: 'chance' },
  37: { title: 'TP. THỦ ĐỨC', subtitle: 'Công Nghệ Cao', price: 3500, bannerColor: COLOR_GROUP_HEX[ColorGroup.Tim], category: 'BĐS ĐÔ THỊ', icon: 'bridge' },
  38: { title: 'SÀN HOSE', subtitle: 'Chứng Khoán', priceLabel: '1D6 Đặt Cược', bannerColor: '#0284C7', category: 'TÀI CHÍNH', icon: 'bull' },
  39: { title: 'TP. HỒ CHÍ MINH', subtitle: 'Quận 1 - Nguyễn Huệ', price: 4000, bannerColor: COLOR_GROUP_HEX[ColorGroup.Tim], category: 'BĐS ĐÔ THỊ', icon: 'tower' },
};

export function formatPriceLabel(price?: number): string {
  if (price == null) return '';
  return `${price.toLocaleString('vi-VN')} Tr.`;
}
