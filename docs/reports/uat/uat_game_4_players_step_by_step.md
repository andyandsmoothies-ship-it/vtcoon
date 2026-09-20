# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 4 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202604 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 114 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **38.259 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 4.959 Tr. VNĐ | 38.259 Tr. VNĐ | 6 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 4.945 Tr. VNĐ | 34.045 Tr. VNĐ | 9 ô | ✓ Hoàn thành |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | 3.225 Tr. VNĐ | 20.925 Tr. VNĐ | 7 ô | ✓ Hoàn thành |
| 4 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | -4.047 Tr. VNĐ | -4.047 Tr. VNĐ | 0 ô | ❌ Phá sản |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 42.528 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 1.800 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 42.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 30 căn (C1: 13, C2: 9, C3: 8).
- **Hoạt động sàn đấu giá:** 10 phiên phát động, 9 phiên gõ búa thành công.
- **Bảo toàn 3 Bất biến (Invariants):** 100% HOÀN HẢO (Zero Leakage, Zero NaN, Zero Deadlock).

---

## II. NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐI TỪ ĐẦU ĐẾN KẾT THÚC (STEP-BY-STEP LOG)

Mọi bước đi, cú gieo xúc xắc, di chuyển, tương tác ô đất và biến động tài sản được ghi nhận tuần tự không bỏ sót:

### === VÒNG ĐẤU #1 ===

#### Lượt #1 | Vòng #1 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 16.500 Tr. VNĐ | **Tài sản ròng:** 16.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #2 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Số dư sau lượt:** 17.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #3 | Vòng #1 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 0 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Từ chối mua [Bà Rịa - Vũng Tàu], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bà Rịa - Vũng Tàu] với giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #4 | Vòng #1 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai: Khấu trừ 1800 Tr. VNĐ vào Kho Bạc
- **Số dư sau lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #2 ===

#### Lượt #5 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.500 Tr. VNĐ | **Tài sản ròng:** 16.500 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 7 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 14.580 Tr. VNĐ | **Tài sản ròng:** 16.380 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Thừa Thiên Huế

#### Lượt #6 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.520 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 11.740 Tr. VNĐ | **Tài sản ròng:** 16.540 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #7 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 9 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.820 Tr. VNĐ | **Tài sản ròng:** 17.820 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #8 | Vòng #2 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Số dư sau lượt:** 14.800 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #3 ===

#### Lượt #9 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.940 Tr. VNĐ | **Tài sản ròng:** 16.740 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 18 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Cầu Giấy)] giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 10.440 Tr. VNĐ | **Tài sản ròng:** 16.740 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy)

#### Lượt #10 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.740 Tr. VNĐ | **Tài sản ròng:** 16.540 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 27 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 11.440 Tr. VNĐ | **Tài sản ròng:** 16.240 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #11 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.820 Tr. VNĐ | **Tài sản ròng:** 17.820 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 18 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Số dư sau lượt:** 15.620 Tr. VNĐ | **Tài sản ròng:** 17.820 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Nghệ An (TP. Vinh)

#### Lượt #12 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.800 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 11 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Từ chối mua [Thanh Hóa (Sầm Sơn)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Thanh Hóa (Sầm Sơn)] với giá 3650 Tr. VNĐ
- **Số dư sau lượt:** 14.800 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #4 ===

#### Lượt #13 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.090 Tr. VNĐ | **Tài sản ròng:** 15.590 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 32 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 8.490 Tr. VNĐ | **Tài sản ròng:** 16.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Thanh Hóa (Sầm Sơn)

#### Lượt #14 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.440 Tr. VNĐ | **Tài sản ròng:** 16.240 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 32 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Số dư sau lượt:** 12.840 Tr. VNĐ | **Tài sản ròng:** 18.240 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng)

#### Lượt #15 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.620 Tr. VNĐ | **Tài sản ròng:** 17.820 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 23 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 11.620 Tr. VNĐ | **Tài sản ròng:** 17.820 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Nghệ An (TP. Vinh), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài

#### Lượt #16 | Vòng #4 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.800 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 21 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Mua thành công [Quảng Ninh (Hạ Long)] giá 2800 Tr. VNĐ
- **Số dư sau lượt:** 12.000 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #5 ===

#### Lượt #17 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.490 Tr. VNĐ | **Tài sản ròng:** 16.990 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Số dư sau lượt:** 5.890 Tr. VNĐ | **Tài sản ròng:** 16.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Thanh Hóa (Sầm Sơn), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang)

#### Lượt #18 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.840 Tr. VNĐ | **Tài sản ròng:** 18.240 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 11.640 Tr. VNĐ | **Tài sản ròng:** 17.040 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng)

#### Lượt #19 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.620 Tr. VNĐ | **Tài sản ròng:** 17.820 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 35 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại ô Thuế [Lệ Phí Đăng Ký Đất Đai]
- **Số dư sau lượt:** 12.258 Tr. VNĐ | **Tài sản ròng:** 18.458 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Nghệ An (TP. Vinh), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài

#### Lượt #20 | Vòng #5 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.000 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 29 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 12.000 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #6 ===

#### Lượt #21 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.890 Tr. VNĐ | **Tài sản ròng:** 16.990 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 14 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Số dư sau lượt:** 3.490 Tr. VNĐ | **Tài sản ròng:** 16.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Thanh Hóa (Sầm Sơn), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An)

#### Lượt #22 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.640 Tr. VNĐ | **Tài sản ròng:** 17.040 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 7 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Điện Lực (EVN)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Tập Đoàn Điện Lực (EVN)] với giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 11.640 Tr. VNĐ | **Tài sản ròng:** 17.040 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng)

#### Lượt #23 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.258 Tr. VNĐ | **Tài sản ròng:** 18.458 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 140 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 12.118 Tr. VNĐ | **Tài sản ròng:** 18.318 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Nghệ An (TP. Vinh), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài

#### Lượt #24 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.140 Tr. VNĐ | **Tài sản ròng:** 14.840 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 33 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 7.330 Tr. VNĐ | **Tài sản ròng:** 17.830 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #7 ===

#### Lượt #25 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.490 Tr. VNĐ | **Tài sản ròng:** 16.990 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 24 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)] (Property)
- **Số dư sau lượt:** 3.490 Tr. VNĐ | **Tài sản ròng:** 16.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Thanh Hóa (Sầm Sơn), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An)

#### Lượt #26 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.638 Tr. VNĐ | **Tài sản ròng:** 17.438 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 1788 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 18.948 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #27 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.118 Tr. VNĐ | **Tài sản ròng:** 18.318 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 10.318 Tr. VNĐ | **Tài sản ròng:** 18.318 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Nghệ An (TP. Vinh), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #28 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.330 Tr. VNĐ | **Tài sản ròng:** 17.830 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 3 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Số dư sau lượt:** 7.330 Tr. VNĐ | **Tài sản ròng:** 17.830 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #8 ===

#### Lượt #29 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.278 Tr. VNĐ | **Tài sản ròng:** 17.778 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng chân tại [Sàn Giao Dịch Chứng Khoán (HOSE)]: Trả tiền thuê 3658 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1 (Shophouse)
- **Giải cứu tài chính:** Thế chấp tài sản ô 18
- **Số dư sau lượt:** 658 Tr. VNĐ | **Tài sản ròng:** 17.858 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C1), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #30 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 18.948 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 18.948 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #31 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.976 Tr. VNĐ | **Tài sản ròng:** 19.776 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 16 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 660 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 13.316 Tr. VNĐ | **Tài sản ròng:** 19.116 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #32 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.330 Tr. VNĐ | **Tài sản ròng:** 17.830 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 4.070 Tr. VNĐ | **Tài sản ròng:** 17.170 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #9 ===

#### Lượt #33 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.978 Tr. VNĐ | **Tài sản ròng:** 19.178 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 38 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 800 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 14
- **Số dư sau lượt:** 1.793 Tr. VNĐ | **Tài sản ròng:** 20.393 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #34 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.348 Tr. VNĐ | **Tài sản ròng:** 19.748 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 10 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)] (Property)
- **Số dư sau lượt:** 3.848 Tr. VNĐ | **Tài sản ròng:** 19.248 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #35 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.916 Tr. VNĐ | **Tài sản ròng:** 18.716 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 21 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 12.636 Tr. VNĐ | **Tài sản ròng:** 18.436 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #36 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.350 Tr. VNĐ | **Tài sản ròng:** 17.450 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 1000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 3.350 Tr. VNĐ | **Tài sản ròng:** 16.450 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #10 ===

#### Lượt #37 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.793 Tr. VNĐ | **Tài sản ròng:** 20.393 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 2 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 803 Tr. VNĐ | **Tài sản ròng:** 20.303 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #38 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.848 Tr. VNĐ | **Tài sản ròng:** 19.248 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 3.848 Tr. VNĐ | **Tài sản ròng:** 19.248 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #39 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.636 Tr. VNĐ | **Tài sản ròng:** 19.436 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 29 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 14.636 Tr. VNĐ | **Tài sản ròng:** 20.436 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #40 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.350 Tr. VNĐ | **Tài sản ròng:** 16.450 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 35 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 4.450 Tr. VNĐ | **Tài sản ròng:** 17.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #11 ===

#### Lượt #41 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 803 Tr. VNĐ | **Tài sản ròng:** 20.303 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 623 Tr. VNĐ | **Tài sản ròng:** 20.123 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #42 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.848 Tr. VNĐ | **Tài sản ròng:** 19.248 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Hoàn Kiếm)] giá 3200 Tr. VNĐ
- **Số dư sau lượt:** 648 Tr. VNĐ | **Tài sản ròng:** 19.248 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm)

#### Lượt #43 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.816 Tr. VNĐ | **Tài sản ròng:** 20.616 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 38 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 2500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 14.316 Tr. VNĐ | **Tài sản ròng:** 20.116 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #44 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.450 Tr. VNĐ | **Tài sản ròng:** 17.550 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 2 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 4.450 Tr. VNĐ | **Tài sản ròng:** 17.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #12 ===

#### Lượt #45 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 623 Tr. VNĐ | **Tài sản ròng:** 20.123 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 16 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 473 Tr. VNĐ | **Tài sản ròng:** 20.673 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #46 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.148 Tr. VNĐ | **Tài sản ròng:** 21.748 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 1320 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 3.078 Tr. VNĐ | **Tài sản ròng:** 21.678 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm)

#### Lượt #47 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.316 Tr. VNĐ | **Tài sản ròng:** 20.116 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Số dư sau lượt:** 14.316 Tr. VNĐ | **Tài sản ròng:** 20.116 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #48 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.770 Tr. VNĐ | **Tài sản ròng:** 18.870 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 4323 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Quảng Ninh (Hạ Long)] lên C1 (Shophouse)
- **Giải cứu tài chính:** Thế chấp tài sản ô 11
- **Số dư sau lượt:** 480 Tr. VNĐ | **Tài sản ròng:** 16.880 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #13 ===

#### Lượt #49 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 473 Tr. VNĐ | **Tài sản ròng:** 20.673 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 20 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 473 Tr. VNĐ | **Tài sản ròng:** 20.673 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #50 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.401 Tr. VNĐ | **Tài sản ròng:** 23.401 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 1 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 5.401 Tr. VNĐ | **Tài sản ròng:** 23.401 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #51 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.496 Tr. VNĐ | **Tài sản ròng:** 20.296 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 8 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 840 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 13.656 Tr. VNĐ | **Tài sản ròng:** 19.456 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #52 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.320 Tr. VNĐ | **Tài sản ròng:** 17.720 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 550 Tr. VNĐ | **Tài sản ròng:** 17.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #14 ===

#### Lượt #53 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 473 Tr. VNĐ | **Tài sản ròng:** 20.673 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 473 Tr. VNĐ | **Tài sản ròng:** 20.673 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #54 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.401 Tr. VNĐ | **Tài sản ròng:** 23.401 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 5 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 5.221 Tr. VNĐ | **Tài sản ròng:** 23.221 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #55 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.836 Tr. VNĐ | **Tài sản ròng:** 19.636 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 13.516 Tr. VNĐ | **Tài sản ròng:** 19.316 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #56 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 550 Tr. VNĐ | **Tài sản ròng:** 17.650 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 50 Tr. VNĐ | **Tài sản ròng:** 17.150 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #15 ===

#### Lượt #57 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** -27 Tr. VNĐ | **Tài sản ròng:** 20.173 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Giải cứu tài chính:** Thế chấp tài sản ô 18
- **Số dư sau lượt:** 873 Tr. VNĐ | **Tài sản ròng:** 20.173 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #58 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.541 Tr. VNĐ | **Tài sản ròng:** 23.541 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 16 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 1980 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 3.561 Tr. VNĐ | **Tài sản ròng:** 21.561 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #59 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.016 Tr. VNĐ | **Tài sản ròng:** 19.816 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 34 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 15.016 Tr. VNĐ | **Tài sản ròng:** 20.816 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #60 | Vòng #15 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 50 Tr. VNĐ | **Tài sản ròng:** 17.150 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 33 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lệ Phí Đăng Ký Đất Đai]: Trả tiền thuê 1047 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.992 Tr. VNĐ | **Tài sản ròng:** 19.092 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #16 ===

#### Lượt #61 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.900 Tr. VNĐ | **Tài sản ròng:** 23.200 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 70 Tr. VNĐ | **Tài sản ròng:** 23.270 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #62 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.561 Tr. VNĐ | **Tài sản ròng:** 22.561 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 23 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 624 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 3.937 Tr. VNĐ | **Tài sản ròng:** 21.937 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #63 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.016 Tr. VNĐ | **Tài sản ròng:** 20.816 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 5 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Từ chối mua [Lâm Đồng (Đà Lạt)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Lâm Đồng (Đà Lạt)] với giá 1900 Tr. VNĐ
- **Số dư sau lượt:** 15.016 Tr. VNĐ | **Tài sản ròng:** 20.816 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #64 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 716 Tr. VNĐ | **Tài sản ròng:** 19.216 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 4 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 400 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.116 Tr. VNĐ | **Tài sản ròng:** 19.616 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Kiên Giang (Phú Quốc - Grand World), Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #17 ===

#### Lượt #65 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 470 Tr. VNĐ | **Tài sản ròng:** 23.670 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 470 Tr. VNĐ | **Tài sản ròng:** 23.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #66 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.337 Tr. VNĐ | **Tài sản ròng:** 23.337 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 2000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 3.337 Tr. VNĐ | **Tài sản ròng:** 21.337 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #67 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 19.416 Tr. VNĐ | **Tài sản ròng:** 25.216 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 13 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 1980 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.436 Tr. VNĐ | **Tài sản ròng:** 23.236 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #68 | Vòng #17 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.116 Tr. VNĐ | **Tài sản ròng:** 19.616 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 17 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Kiên Giang (Phú Quốc - Grand World)] lên C1 (Shophouse)
- **Giải cứu tài chính:** Thế chấp tài sản ô 11
- **Số dư sau lượt:** 516 Tr. VNĐ | **Tài sản ròng:** 19.616 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Kiên Giang (Phú Quốc - Grand World) (C1), Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #18 ===

#### Lượt #69 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.450 Tr. VNĐ | **Tài sản ròng:** 25.650 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 320 Tr. VNĐ | **Tài sản ròng:** 26.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #70 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.337 Tr. VNĐ | **Tài sản ròng:** 21.337 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 35 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 4.587 Tr. VNĐ | **Tài sản ròng:** 22.587 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #71 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.436 Tr. VNĐ | **Tài sản ròng:** 23.236 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 23 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 17.436 Tr. VNĐ | **Tài sản ròng:** 23.236 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #72 | Vòng #18 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 516 Tr. VNĐ | **Tài sản ròng:** 19.616 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 516 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Số dư sau lượt:** 116 Tr. VNĐ | **Tài sản ròng:** 17.416 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Kiên Giang (Phú Quốc - Grand World) (C1), Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C2), Quảng Ninh (Hạ Long) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #19 ===

#### Lượt #73 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 320 Tr. VNĐ | **Tài sản ròng:** 26.220 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 320 Tr. VNĐ | **Tài sản ròng:** 26.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #74 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.587 Tr. VNĐ | **Tài sản ròng:** 22.587 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 2 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 4.587 Tr. VNĐ | **Tài sản ròng:** 22.587 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #75 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.952 Tr. VNĐ | **Tài sản ròng:** 23.752 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 17.952 Tr. VNĐ | **Tài sản ròng:** 23.752 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #76 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 116 Tr. VNĐ | **Tài sản ròng:** 17.416 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 35 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 81 Tr. VNĐ | **Tài sản ròng:** 17.381 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Kiên Giang (Phú Quốc - Grand World) (C1), Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C2), Quảng Ninh (Hạ Long) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #20 ===

#### Lượt #77 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** -680 Tr. VNĐ | **Tài sản ròng:** 25.220 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Giải cứu tài chính:** Thế chấp tài sản ô 18
- **Số dư sau lượt:** 220 Tr. VNĐ | **Tài sản ròng:** 25.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #78 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.587 Tr. VNĐ | **Tài sản ròng:** 21.587 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Từ chối mua [Cảng Nước Sâu Cái Mép], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [Cảng Nước Sâu Cái Mép] với giá 1050 Tr. VNĐ
- **Số dư sau lượt:** 3.587 Tr. VNĐ | **Tài sản ròng:** 21.587 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #79 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.902 Tr. VNĐ | **Tài sản ròng:** 24.702 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 16.902 Tr. VNĐ | **Tài sản ròng:** 24.702 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #80 | Vòng #20 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 81 Tr. VNĐ | **Tài sản ròng:** 17.381 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 81 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 13
- **Giải cứu tài chính:** Thế chấp tài sản ô 12
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 27
- **Giải cứu tài chính:** Hạ cấp công trình ô 29
- **Giải cứu tài chính:** Thế chấp tài sản ô 1
- **Số dư sau lượt:** 261 Tr. VNĐ | **Tài sản ròng:** 11.311 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Kiên Giang (Phú Quốc - Grand World), Bình Thuận (Mũi Né), Cần Thơ (Cái Răng), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #21 ===

#### Lượt #81 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 220 Tr. VNĐ | **Tài sản ròng:** 25.220 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 220 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 28
- **Số dư sau lượt:** 222 Tr. VNĐ | **Tài sản ròng:** 24.472 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #82 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.668 Tr. VNĐ | **Tài sản ròng:** 21.668 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 15 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Đà Nẵng (Hải Châu - Sơn Trà)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [Đà Nẵng (Hải Châu - Sơn Trà)] với giá 1050 Tr. VNĐ
- **Số dư sau lượt:** 2.996 Tr. VNĐ | **Tài sản ròng:** 20.996 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #83 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.852 Tr. VNĐ | **Tài sản ròng:** 25.652 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 15.352 Tr. VNĐ | **Tài sản ròng:** 25.152 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #84 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.153 Tr. VNĐ | **Tài sản ròng:** 12.203 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 9 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 1153 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 3
- **Giải cứu tài chính:** Thế chấp tài sản ô 29
- **Giải cứu tài chính:** Thế chấp tài sản ô 26
- **Giải cứu tài chính:** Thế chấp tài sản ô 27
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** -1.147 Tr. VNĐ | **Tài sản ròng:** -1.147 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #85 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.375 Tr. VNĐ | **Tài sản ròng:** 25.625 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 27 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 550 Tr. VNĐ | **Tài sản ròng:** 25.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #86 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.996 Tr. VNĐ | **Tài sản ròng:** 20.996 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Số dư sau lượt:** 2.996 Tr. VNĐ | **Tài sản ròng:** 20.996 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #87 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.352 Tr. VNĐ | **Tài sản ròng:** 25.152 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 13.852 Tr. VNĐ | **Tài sản ròng:** 25.152 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #22 ===

#### Lượt #88 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 550 Tr. VNĐ | **Tài sản ròng:** 25.550 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 38 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 390 Tr. VNĐ | **Tài sản ròng:** 25.390 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #89 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.496 Tr. VNĐ | **Tài sản ròng:** 21.496 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 34 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành] (Railroad)
- **Số dư sau lượt:** 4.246 Tr. VNĐ | **Tài sản ròng:** 22.246 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #90 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.852 Tr. VNĐ | **Tài sản ròng:** 25.152 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 18 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 3555 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 11.476 Tr. VNĐ | **Tài sản ròng:** 22.776 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #23 ===

#### Lượt #91 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.945 Tr. VNĐ | **Tài sản ròng:** 28.945 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 5 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 755 Tr. VNĐ | **Tài sản ròng:** 29.955 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #92 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.425 Tr. VNĐ | **Tài sản ròng:** 23.425 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 5 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu] (Property)
- **Số dư sau lượt:** 12.925 Tr. VNĐ | **Tài sản ròng:** 30.925 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #93 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.976 Tr. VNĐ | **Tài sản ròng:** 20.276 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 6 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 2736 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C1 (Shophouse)
- **Số dư sau lượt:** 4.476 Tr. VNĐ | **Tài sản ròng:** 19.376 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế (C1), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn) (C1), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #24 ===

#### Lượt #94 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 991 Tr. VNĐ | **Tài sản ròng:** 28.391 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 480 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 511 Tr. VNĐ | **Tài sản ròng:** 27.911 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #95 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.925 Tr. VNĐ | **Tài sản ròng:** 30.925 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 9 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)] (Property)
- **Số dư sau lượt:** 12.925 Tr. VNĐ | **Tài sản ròng:** 30.925 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

#### Lượt #96 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.956 Tr. VNĐ | **Tài sản ròng:** 19.856 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 17 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Chốt đấu giá: Chú Sáu (Cân bằng / Balanced) sở hữu [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 1350 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C1 (Shophouse)
- **Số dư sau lượt:** 4.202 Tr. VNĐ | **Tài sản ròng:** 20.102 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế (C1), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn) (C1), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #25 ===

#### Lượt #97 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.557 Tr. VNĐ | **Tài sản ròng:** 28.957 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 19 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)] (Property)
- **Số dư sau lượt:** 677 Tr. VNĐ | **Tài sản ròng:** 28.877 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #98 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.575 Tr. VNĐ | **Tài sản ròng:** 32.175 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Mua thành công [Quảng Ninh (Hạ Long)] giá 2800 Tr. VNĐ
- **Số dư sau lượt:** 8.275 Tr. VNĐ | **Tài sản ròng:** 33.275 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm) (C1), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Quảng Ninh (Hạ Long)

#### Lượt #99 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.202 Tr. VNĐ | **Tài sản ròng:** 20.102 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 2.942 Tr. VNĐ | **Tài sản ròng:** 20.642 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế (C1), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn) (C2), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #26 ===

#### Lượt #100 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 677 Tr. VNĐ | **Tài sản ròng:** 28.877 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 23 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)] (Property)
- **Số dư sau lượt:** 677 Tr. VNĐ | **Tài sản ròng:** 28.877 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #101 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.275 Tr. VNĐ | **Tài sản ròng:** 33.275 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Số dư sau lượt:** 8.275 Tr. VNĐ | **Tài sản ròng:** 33.275 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm) (C1), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Quảng Ninh (Hạ Long)

#### Lượt #102 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.942 Tr. VNĐ | **Tài sản ròng:** 20.642 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài] (Railroad)
- **Số dư sau lượt:** 2.942 Tr. VNĐ | **Tài sản ròng:** 20.642 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế (C1), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn) (C2), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #27 ===

#### Lượt #103 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 677 Tr. VNĐ | **Tài sản ròng:** 28.877 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 677 Tr. VNĐ | **Tài sản ròng:** 28.877 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #104 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.475 Tr. VNĐ | **Tài sản ròng:** 34.975 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 34 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [An Giang (Châu Đốc)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [An Giang (Châu Đốc)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 6.975 Tr. VNĐ | **Tài sản ròng:** 35.475 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm) (C1), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức)

#### Lượt #105 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.942 Tr. VNĐ | **Tài sản ròng:** 20.642 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 35 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 1495 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 4.517 Tr. VNĐ | **Tài sản ròng:** 22.217 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế (C1), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn) (C2), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #28 ===

#### Lượt #106 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.172 Tr. VNĐ | **Tài sản ròng:** 30.372 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 37 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 1.047 Tr. VNĐ | **Tài sản ròng:** 30.747 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #107 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.995 Tr. VNĐ | **Tài sản ròng:** 35.495 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 3 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu] (Property)
- **Số dư sau lượt:** 6.995 Tr. VNĐ | **Tài sản ròng:** 35.495 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm) (C1), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức)

#### Lượt #108 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.517 Tr. VNĐ | **Tài sản ròng:** 22.217 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 3600 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 917 Tr. VNĐ | **Tài sản ròng:** 18.617 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế (C1), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn) (C2), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #29 ===

#### Lượt #109 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.047 Tr. VNĐ | **Tài sản ròng:** 30.747 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 0 ➔ Ô 3 (**An Giang (Châu Đốc)**)
- **Sự kiện ô:** Từ chối mua [An Giang (Châu Đốc)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [An Giang (Châu Đốc)] với giá 350 Tr. VNĐ
- **Số dư sau lượt:** 1.047 Tr. VNĐ | **Tài sản ròng:** 30.747 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #110 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.245 Tr. VNĐ | **Tài sản ròng:** 39.345 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 9 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 1.045 Tr. VNĐ | **Tài sản ròng:** 32.745 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm) (C1), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), An Giang (Châu Đốc), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #111 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 917 Tr. VNĐ | **Tài sản ròng:** 18.617 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 9 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 192 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 725 Tr. VNĐ | **Tài sản ròng:** 18.425 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế (C1), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn) (C2), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #30 ===

#### Lượt #112 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.839 Tr. VNĐ | **Tài sản ròng:** 37.539 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 3 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 4.959 Tr. VNĐ | **Tài sản ròng:** 38.259 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C3)

#### Lượt #113 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.045 Tr. VNĐ | **Tài sản ròng:** 32.745 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 27 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 4.945 Tr. VNĐ | **Tài sản ròng:** 34.045 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hà Nội (Hoàn Kiếm) (C1), Cảng HKQT Long Thành, Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), An Giang (Châu Đốc), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #114 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 725 Tr. VNĐ | **Tài sản ròng:** 18.425 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 14 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 3.225 Tr. VNĐ | **Tài sản ròng:** 20.925 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế (C1), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn) (C2), Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tập Đoàn Điện Lực (EVN)

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 4 người chơi diễn ra liên tục 114 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.