// Static 40-cell name mapping matching src/domain/board_config.ts
export const BOARD_CELL_NAMES = [
  'Khởi Hành (GO)',                     // 0
  'Cần Thơ (Cái Răng)',                 // 1
  'Phiếu Thị Trường',                   // 2
  'An Giang (Châu Đốc)',                // 3
  'Lệ Phí Đăng Ký Đất Đai',             // 4
  'Cảng HKQT Long Thành',               // 5
  'Bình Dương (Tổ Hợp Thể Thao & Golf)', // 6
  'Phiếu Cơ Hội',                       // 7
  'Đồng Nai (Đại Công Viên Chủ Đề)',     // 8
  'Bà Rịa - Vũng Tàu',                  // 9
  'Trạm Kiểm Toán & Thanh Tra',         // 10
  'Bình Thuận (Mũi Né)',                // 11
  'Tập Đoàn Điện Lực (EVN)',            // 12
  'Lâm Đồng (Đà Lạt)',                  // 13
  'Khánh Hòa (Nha Trang)',              // 14
  'Cảng Nước Sâu Cái Mép',              // 15
  'Bình Định (Quy Nhơn)',               // 16
  'Phiếu Thị Trường',                   // 17
  'Thừa Thiên Huế',                     // 18
  'Đà Nẵng (Hải Châu - Sơn Trà)',       // 19
  'Nghỉ Dưỡng Miễn Phí',                // 20
  'Thanh Hóa (Sầm Sơn)',                // 21
  'Phiếu Cơ Hội',                       // 22
  'Nghệ An (TP. Vinh)',                 // 23
  'Ninh Bình (Tràng An)',               // 24
  'Tuyến Cao Tốc Bắc - Nam',            // 25
  'Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)', // 26
  'Kiên Giang (Phú Quốc - Grand World)', // 27
  'Tập Đoàn Viễn Thông (Viettel)',      // 28
  'Quảng Ninh (Hạ Long)',               // 29
  'Lệnh Thanh Tra Thuế',                // 30
  'Hưng Yên (Văn Giang)',               // 31
  'Hà Nội (Cầu Giấy)',                  // 32
  'Phiếu Thị Trường',                   // 33
  'Hà Nội (Hoàn Kiếm)',                 // 34
  'Cảng HKQT Nội Bài',                  // 35
  'Phiếu Cơ Hội',                       // 36
  'TP.HCM (TP. Thủ Đức)',               // 37
  'Sàn Giao Dịch Chứng Khoán (HOSE)',   // 38
  'TP.HCM (Quận 1 - Nguyễn Huệ)',       // 39
];

export function getCellLabel(index) {
  if (index === undefined || index === null || index < 0 || index >= BOARD_CELL_NAMES.length) {
    return `Ô #${index}`;
  }
  return `Ô #${String(index).padStart(2, '0')} (${BOARD_CELL_NAMES[index]})`;
}
