// [UC-GAME-009/MSS] Fixture Contract Test — Master Board Config 40 Cells Match SSOT
// Traceability: docs/requirements.md §II (BẢNG DANH MỤC 40 Ô BÀN CỜ VIỆT NAM)

import { describe, it, expect } from 'vitest';
import { BOARD_CONFIG, CellType, ColorGroup } from '../../src/domain/board_config';

describe('[UC-GAME-009/MSS] Board Config Fixture Contract Test', () => {
  const EXPECTED_CELLS = [
    { index: 0, name: 'Khởi Hành (GO)', type: CellType.Go },
    { index: 1, name: 'Cần Thơ (Cái Răng)', type: CellType.Property, colorGroup: ColorGroup.Nau },
    { index: 2, name: 'Phiếu Thị Trường', type: CellType.Market },
    { index: 3, name: 'An Giang (Châu Đốc)', type: CellType.Property, colorGroup: ColorGroup.Nau },
    { index: 4, name: 'Lệ Phí Đăng Ký Đất Đai', type: CellType.Tax },
    { index: 5, name: 'Cảng HKQT Long Thành', type: CellType.Railroad },
    { index: 6, name: 'Bình Dương (Tổ Hợp Thể Thao & Golf)', type: CellType.Property, colorGroup: ColorGroup.XanhDaTroi },
    { index: 7, name: 'Phiếu Cơ Hội', type: CellType.Chance },
    { index: 8, name: 'Đồng Nai (Đại Công Viên Chủ Đề)', type: CellType.Property, colorGroup: ColorGroup.XanhDaTroi },
    { index: 9, name: 'Bà Rịa - Vũng Tàu', type: CellType.Property, colorGroup: ColorGroup.XanhDaTroi },
    { index: 10, name: 'Trạm Kiểm Toán & Thanh Tra', type: CellType.Audit },
    { index: 11, name: 'Bình Thuận (Mũi Né)', type: CellType.Property, colorGroup: ColorGroup.Hong },
    { index: 12, name: 'Tập Đoàn Điện Lực (EVN)', type: CellType.Utility },
    { index: 13, name: 'Lâm Đồng (Đà Lạt)', type: CellType.Property, colorGroup: ColorGroup.Hong },
    { index: 14, name: 'Khánh Hòa (Nha Trang)', type: CellType.Property, colorGroup: ColorGroup.Hong },
    { index: 15, name: 'Cảng Nước Sâu Cái Mép', type: CellType.Railroad },
    { index: 16, name: 'Bình Định (Quy Nhơn)', type: CellType.Property, colorGroup: ColorGroup.Cam },
    { index: 17, name: 'Phiếu Thị Trường', type: CellType.Market },
    { index: 18, name: 'Thừa Thiên Huế', type: CellType.Property, colorGroup: ColorGroup.Cam },
    { index: 19, name: 'Đà Nẵng (Hải Châu - Sơn Trà)', type: CellType.Property, colorGroup: ColorGroup.Cam },
    { index: 20, name: 'Nghỉ Dưỡng Miễn Phí', type: CellType.FreeParking },
    { index: 21, name: 'Thanh Hóa (Sầm Sơn)', type: CellType.Property, colorGroup: ColorGroup.Do },
    { index: 22, name: 'Phiếu Cơ Hội', type: CellType.Chance },
    { index: 23, name: 'Nghệ An (TP. Vinh)', type: CellType.Property, colorGroup: ColorGroup.Do },
    { index: 24, name: 'Ninh Bình (Tràng An)', type: CellType.Property, colorGroup: ColorGroup.Do },
    { index: 25, name: 'Tuyến Cao Tốc Bắc - Nam', type: CellType.Railroad },
    { index: 26, name: 'Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)', type: CellType.Property, colorGroup: ColorGroup.Vang },
    { index: 27, name: 'Kiên Giang (Phú Quốc - Grand World)', type: CellType.Property, colorGroup: ColorGroup.Vang },
    { index: 28, name: 'Tập Đoàn Viễn Thông (Viettel)', type: CellType.Utility },
    { index: 29, name: 'Quảng Ninh (Hạ Long)', type: CellType.Property, colorGroup: ColorGroup.Vang },
    { index: 30, name: 'Lệnh Thanh Tra Thuế', type: CellType.TaxOrder },
    { index: 31, name: 'Hưng Yên (Văn Giang)', type: CellType.Property, colorGroup: ColorGroup.XanhLa },
    { index: 32, name: 'Hà Nội (Cầu Giấy)', type: CellType.Property, colorGroup: ColorGroup.XanhLa },
    { index: 33, name: 'Phiếu Thị Trường', type: CellType.Market },
    { index: 34, name: 'Hà Nội (Hoàn Kiếm)', type: CellType.Property, colorGroup: ColorGroup.XanhLa },
    { index: 35, name: 'Cảng HKQT Nội Bài', type: CellType.Railroad },
    { index: 36, name: 'Phiếu Cơ Hội', type: CellType.Chance },
    { index: 37, name: 'TP.HCM (TP. Thủ Đức)', type: CellType.Property, colorGroup: ColorGroup.Tim },
    { index: 38, name: 'Sàn Giao Dịch Chứng Khoán (HOSE)', type: CellType.Hose },
    { index: 39, name: 'TP.HCM (Quận 1 - Nguyễn Huệ)', type: CellType.Property, colorGroup: ColorGroup.Tim },
  ];

  it('BOARD_CONFIG có đúng 40 ô', () => {
    expect(BOARD_CONFIG).toHaveLength(40);
  });

  it('toàn bộ 40 ô khớp 100% tên tiếng Việt, index, CellType và ColorGroup theo SSOT', () => {
    for (let i = 0; i < 40; i++) {
      const actual = BOARD_CONFIG[i];
      const expected = EXPECTED_CELLS[i]!;
      expect(actual).toBeDefined();
      expect(actual?.index).toBe(expected.index);
      expect(actual?.name).toBe(expected.name);
      expect(actual?.type).toBe(expected.type);
      expect(actual?.colorGroup).toBe(expected.colorGroup);
    }
  });
});
