# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 4 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202604 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 120 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Chú Sáu (Cân bằng / Balanced)** (Tổng tài sản ròng: **38.881 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Chú Sáu (Cân bằng / Balanced) | Balanced | 20.481 Tr. VNĐ | 38.881 Tr. VNĐ | 5 ô | 🏆 Vô địch |
| 2 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 153 Tr. VNĐ | 26.803 Tr. VNĐ | 6 ô | ✓ Hoàn thành |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | 3.602 Tr. VNĐ | 24.452 Tr. VNĐ | 7 ô | ✓ Hoàn thành |
| 4 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | 850 Tr. VNĐ | 15.700 Tr. VNĐ | 9 ô | ✓ Hoàn thành |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 45.056 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 1.800 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 46.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 29 căn (C1: 10, C2: 10, C3: 9).
- **Hoạt động sàn đấu giá:** 10 phiên phát động, 10 phiên gõ búa thành công.
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
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 12.418 Tr. VNĐ | **Tài sản ròng:** 17.218 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Kiên Giang (Phú Quốc - Grand World)

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
- **Số dư trước lượt:** 3.710 Tr. VNĐ | **Tài sản ròng:** 17.210 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 4.710 Tr. VNĐ | **Tài sản ròng:** 18.210 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Thanh Hóa (Sầm Sơn), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An)

#### Lượt #30 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.418 Tr. VNĐ | **Tài sản ròng:** 17.218 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 12.418 Tr. VNĐ | **Tài sản ròng:** 17.218 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #31 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.318 Tr. VNĐ | **Tài sản ròng:** 18.318 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 16 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 10.098 Tr. VNĐ | **Tài sản ròng:** 18.098 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Nghệ An (TP. Vinh), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #32 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.330 Tr. VNĐ | **Tài sản ròng:** 17.830 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 4.510 Tr. VNĐ | **Tài sản ròng:** 17.610 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #9 ===

#### Lượt #33 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.150 Tr. VNĐ | **Tài sản ròng:** 18.650 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 38 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 400 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1 (Shophouse)
- **Giải cứu tài chính:** Thế chấp tài sản ô 18
- **Giải cứu tài chính:** Thế chấp tài sản ô 14
- **Số dư sau lượt:** 830 Tr. VNĐ | **Tài sản ròng:** 18.230 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C1), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #34 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.818 Tr. VNĐ | **Tài sản ròng:** 17.618 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 10 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 1473 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
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

#### Lượt #35 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.356 Tr. VNĐ | **Tài sản ròng:** 19.156 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 21 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 13.076 Tr. VNĐ | **Tài sản ròng:** 18.876 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #36 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.790 Tr. VNĐ | **Tài sản ròng:** 17.890 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 1000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 3.790 Tr. VNĐ | **Tài sản ròng:** 16.890 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #10 ===

#### Lượt #37 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.303 Tr. VNĐ | **Tài sản ròng:** 18.703 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 2 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 763 Tr. VNĐ | **Tài sản ròng:** 19.363 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #38 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 18.948 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 18.948 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #39 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.076 Tr. VNĐ | **Tài sản ròng:** 19.876 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 29 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 15.076 Tr. VNĐ | **Tài sản ròng:** 20.876 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #40 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.790 Tr. VNĐ | **Tài sản ròng:** 16.890 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 35 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 4.890 Tr. VNĐ | **Tài sản ròng:** 17.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #11 ===

#### Lượt #41 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 763 Tr. VNĐ | **Tài sản ròng:** 19.363 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 583 Tr. VNĐ | **Tài sản ròng:** 19.183 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #42 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 18.948 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 2300 Tr. VNĐ
- **Số dư sau lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 18.948 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #43 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.256 Tr. VNĐ | **Tài sản ròng:** 21.056 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 38 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 3000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 14.256 Tr. VNĐ | **Tài sản ròng:** 20.056 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #44 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.590 Tr. VNĐ | **Tài sản ròng:** 18.890 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 2 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)] (Utility)
- **Số dư sau lượt:** 2.590 Tr. VNĐ | **Tài sản ròng:** 18.890 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #12 ===

#### Lượt #45 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 583 Tr. VNĐ | **Tài sản ròng:** 19.183 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 16 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 583 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 28
- **Số dư sau lượt:** 333 Tr. VNĐ | **Tài sản ròng:** 18.183 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #46 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.548 Tr. VNĐ | **Tài sản ròng:** 21.948 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 34 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 7.948 Tr. VNĐ | **Tài sản ròng:** 23.348 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #47 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.839 Tr. VNĐ | **Tài sản ròng:** 20.639 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 9 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 15.339 Tr. VNĐ | **Tài sản ròng:** 21.139 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #48 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.090 Tr. VNĐ | **Tài sản ròng:** 18.390 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 12 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.910 Tr. VNĐ | **Tài sản ròng:** 18.210 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #13 ===

#### Lượt #49 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** -167 Tr. VNĐ | **Tài sản ròng:** 17.683 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 25 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam] (Railroad)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 508 Tr. VNĐ | **Tài sản ròng:** 17.608 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #50 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.448 Tr. VNĐ | **Tài sản ròng:** 22.848 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 0 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 7.448 Tr. VNĐ | **Tài sản ròng:** 22.848 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #51 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.519 Tr. VNĐ | **Tài sản ròng:** 21.319 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 17 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 15.207 Tr. VNĐ | **Tài sản ròng:** 21.007 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #52 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.222 Tr. VNĐ | **Tài sản ròng:** 18.522 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 16 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.910 Tr. VNĐ | **Tài sản ròng:** 18.210 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #14 ===

#### Lượt #53 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 508 Tr. VNĐ | **Tài sản ròng:** 17.608 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 188 Tr. VNĐ | **Tài sản ròng:** 17.288 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #54 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.760 Tr. VNĐ | **Tài sản ròng:** 23.160 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 720 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 6.780 Tr. VNĐ | **Tài sản ròng:** 22.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #55 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.387 Tr. VNĐ | **Tài sản ròng:** 21.187 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài] (Railroad)
- **Số dư sau lượt:** 15.387 Tr. VNĐ | **Tài sản ròng:** 21.187 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #56 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.310 Tr. VNĐ | **Tài sản ròng:** 18.610 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 27 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng chân tại [Sàn Giao Dịch Chứng Khoán (HOSE)]: Trả tiền thuê 400 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.210 Tr. VNĐ | **Tài sản ròng:** 18.510 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #15 ===

#### Lượt #57 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.308 Tr. VNĐ | **Tài sản ròng:** 18.408 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 34 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 2500 Tr. VNĐ
- **Số dư sau lượt:** 1.308 Tr. VNĐ | **Tài sản ròng:** 18.408 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #58 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.680 Tr. VNĐ | **Tài sản ròng:** 23.580 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 4.680 Tr. VNĐ | **Tài sản ròng:** 23.580 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #59 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.787 Tr. VNĐ | **Tài sản ròng:** 23.587 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 35 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1320 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 18.467 Tr. VNĐ | **Tài sản ròng:** 24.267 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #60 | Vòng #15 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.530 Tr. VNĐ | **Tài sản ròng:** 19.830 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 38 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 2.530 Tr. VNĐ | **Tài sản ròng:** 20.830 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành

### === VÒNG ĐẤU #16 ===

#### Lượt #61 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.308 Tr. VNĐ | **Tài sản ròng:** 18.408 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 37 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 1.158 Tr. VNĐ | **Tài sản ròng:** 19.158 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #62 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.680 Tr. VNĐ | **Tài sản ròng:** 23.580 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 4.680 Tr. VNĐ | **Tài sản ròng:** 23.580 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #63 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.467 Tr. VNĐ | **Tài sản ròng:** 24.267 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 3 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Từ chối mua [Lâm Đồng (Đà Lạt)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Lâm Đồng (Đà Lạt)] với giá 1900 Tr. VNĐ
- **Số dư sau lượt:** 18.467 Tr. VNĐ | **Tài sản ròng:** 24.267 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn)

#### Lượt #64 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 630 Tr. VNĐ | **Tài sản ròng:** 20.330 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 5 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Từ chối mua [Cảng Nước Sâu Cái Mép], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [Cảng Nước Sâu Cái Mép] với giá 2500 Tr. VNĐ
- **Giải cứu tài chính:** Thế chấp tài sản ô 11
- **Giải cứu tài chính:** Thế chấp tài sản ô 13
- **Giải cứu tài chính:** Thế chấp tài sản ô 12
- **Giải cứu tài chính:** Thế chấp tài sản ô 29
- **Số dư sau lượt:** 355 Tr. VNĐ | **Tài sản ròng:** 17.255 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #17 ===

#### Lượt #65 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.158 Tr. VNĐ | **Tài sản ròng:** 19.158 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 1158 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 18
- **Giải cứu tài chính:** Thế chấp tài sản ô 28
- **Số dư sau lượt:** 308 Tr. VNĐ | **Tài sản ròng:** 16.658 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #66 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.468 Tr. VNĐ | **Tài sản ròng:** 25.368 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 6.468 Tr. VNĐ | **Tài sản ròng:** 25.368 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #67 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.967 Tr. VNĐ | **Tài sản ròng:** 23.767 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 13 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 770 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 15.197 Tr. VNĐ | **Tài sản ròng:** 22.997 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #68 | Vòng #17 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 355 Tr. VNĐ | **Tài sản ròng:** 17.255 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 15 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 43 Tr. VNĐ | **Tài sản ròng:** 16.943 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #18 ===

#### Lượt #69 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.078 Tr. VNĐ | **Tài sản ròng:** 17.428 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 1.078 Tr. VNĐ | **Tài sản ròng:** 17.428 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #70 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.780 Tr. VNĐ | **Tài sản ròng:** 25.680 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 6.460 Tr. VNĐ | **Tài sản ròng:** 25.360 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #71 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.197 Tr. VNĐ | **Tài sản ròng:** 22.997 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 23 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)] (Property)
- **Số dư sau lượt:** 15.197 Tr. VNĐ | **Tài sản ròng:** 22.997 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #72 | Vòng #18 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 363 Tr. VNĐ | **Tài sản ròng:** 17.263 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 32 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành] (Railroad)
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Số dư sau lượt:** 1.038 Tr. VNĐ | **Tài sản ròng:** 17.938 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #19 ===

#### Lượt #73 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.078 Tr. VNĐ | **Tài sản ròng:** 17.428 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Số dư sau lượt:** 1.078 Tr. VNĐ | **Tài sản ròng:** 17.428 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1)

#### Lượt #74 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.460 Tr. VNĐ | **Tài sản ròng:** 25.360 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 34 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1320 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 6.390 Tr. VNĐ | **Tài sản ròng:** 25.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #75 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.197 Tr. VNĐ | **Tài sản ròng:** 22.997 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 350 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 14.847 Tr. VNĐ | **Tài sản ròng:** 22.647 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #76 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.358 Tr. VNĐ | **Tài sản ròng:** 19.258 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 5 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 1047 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 12
- **Số dư sau lượt:** 1.155 Tr. VNĐ | **Tài sản ròng:** 17.305 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #20 ===

#### Lượt #77 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.125 Tr. VNĐ | **Tài sản ròng:** 18.475 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 11 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 670 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #78 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.098 Tr. VNĐ | **Tài sản ròng:** 27.998 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 3 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)] (Utility)
- **Số dư sau lượt:** 9.098 Tr. VNĐ | **Tài sản ròng:** 27.998 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #79 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.847 Tr. VNĐ | **Tài sản ròng:** 22.647 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 37 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 16.247 Tr. VNĐ | **Tài sản ròng:** 24.047 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #80 | Vòng #20 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.155 Tr. VNĐ | **Tài sản ròng:** 17.305 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 9 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 216 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 114 Tr. VNĐ | **Tài sản ròng:** 17.014 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #21 ===

#### Lượt #81 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 670 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 22 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 670 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 28
- **Giải cứu tài chính:** Hạ cấp công trình ô 21
- **Số dư sau lượt:** 190 Tr. VNĐ | **Tài sản ròng:** 18.040 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C1), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #82 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.098 Tr. VNĐ | **Tài sản ròng:** 27.998 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Từ chối mua [Thừa Thiên Huế], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [Thừa Thiên Huế] với giá 950 Tr. VNĐ
- **Số dư sau lượt:** 9.098 Tr. VNĐ | **Tài sản ròng:** 27.998 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #83 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.183 Tr. VNĐ | **Tài sản ròng:** 25.783 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 2 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 16.183 Tr. VNĐ | **Tài sản ròng:** 25.783 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

#### Lượt #84 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 114 Tr. VNĐ | **Tài sản ròng:** 17.014 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 16 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 114 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 12
- **Số dư sau lượt:** 490 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #22 ===

#### Lượt #85 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 190 Tr. VNĐ | **Tài sản ròng:** 18.040 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 25 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 1.150 Tr. VNĐ | **Tài sản ròng:** 21.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #86 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.212 Tr. VNĐ | **Tài sản ròng:** 28.112 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 2000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 7.212 Tr. VNĐ | **Tài sản ròng:** 26.112 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #87 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.183 Tr. VNĐ | **Tài sản ròng:** 27.783 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép] (Railroad)
- **Số dư sau lượt:** 18.183 Tr. VNĐ | **Tài sản ròng:** 27.783 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

#### Lượt #88 | Vòng #22 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 490 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Số dư sau lượt:** 490 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #23 ===

#### Lượt #89 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.150 Tr. VNĐ | **Tài sản ròng:** 21.200 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 36 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 500 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 1.053 Tr. VNĐ | **Tài sản ròng:** 21.103 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #90 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.212 Tr. VNĐ | **Tài sản ròng:** 26.112 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 25 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 7.212 Tr. VNĐ | **Tài sản ròng:** 26.112 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #91 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.183 Tr. VNĐ | **Tài sản ròng:** 27.783 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1000 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 17.183 Tr. VNĐ | **Tài sản ròng:** 26.783 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

#### Lượt #92 | Vòng #23 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.990 Tr. VNĐ | **Tài sản ròng:** 18.140 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 34 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 540 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.853 Tr. VNĐ | **Tài sản ròng:** 19.003 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #24 ===

#### Lượt #93 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.593 Tr. VNĐ | **Tài sản ròng:** 21.643 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 5 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 216 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 552 Tr. VNĐ | **Tài sản ròng:** 21.352 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #94 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.212 Tr. VNĐ | **Tài sản ròng:** 25.112 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 2650 Tr. VNĐ
- **Số dư sau lượt:** 6.212 Tr. VNĐ | **Tài sản ròng:** 25.112 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #95 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.749 Tr. VNĐ | **Tài sản ròng:** 27.349 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 22 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)] (Property)
- **Số dư sau lượt:** 13.749 Tr. VNĐ | **Tài sản ròng:** 27.349 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế, TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #96 | Vòng #24 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.853 Tr. VNĐ | **Tài sản ròng:** 19.003 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 1239 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Số dư sau lượt:** 1.317 Tr. VNĐ | **Tài sản ròng:** 15.067 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C1), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #25 ===

#### Lượt #97 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.791 Tr. VNĐ | **Tài sản ròng:** 22.591 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 16 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 911 Tr. VNĐ | **Tài sản ròng:** 22.511 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #98 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.065 Tr. VNĐ | **Tài sản ròng:** 27.965 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 12.815 Tr. VNĐ | **Tài sản ròng:** 31.715 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), TP.HCM (TP. Thủ Đức)

#### Lượt #99 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.749 Tr. VNĐ | **Tài sản ròng:** 27.349 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 32 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 5320 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C1 (Shophouse)
- **Số dư sau lượt:** 4.399 Tr. VNĐ | **Tài sản ròng:** 25.249 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức) (C1), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế, TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #100 | Vòng #25 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.317 Tr. VNĐ | **Tài sản ròng:** 15.067 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 9 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 1103 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 26
- **Giải cứu tài chính:** Thế chấp tài sản ô 34
- **Số dư sau lượt:** 1.670 Tr. VNĐ | **Tài sản ròng:** 14.920 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #26 ===

#### Lượt #101 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.014 Tr. VNĐ | **Tài sản ròng:** 23.614 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 20 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 14
- **Số dư sau lượt:** 614 Tr. VNĐ | **Tài sản ròng:** 24.714 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #102 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.135 Tr. VNĐ | **Tài sản ròng:** 33.535 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)] (Property)
- **Số dư sau lượt:** 18.135 Tr. VNĐ | **Tài sản ròng:** 33.535 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #103 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.716 Tr. VNĐ | **Tài sản ròng:** 26.566 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 35 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1584 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 4.632 Tr. VNĐ | **Tài sản ròng:** 25.482 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức) (C1), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế, TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #104 | Vòng #26 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.254 Tr. VNĐ | **Tài sản ròng:** 16.504 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1078 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.772 Tr. VNĐ | **Tài sản ròng:** 16.622 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #27 ===

#### Lượt #105 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.692 Tr. VNĐ | **Tài sản ròng:** 25.792 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 24 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 384 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 428 Tr. VNĐ | **Tài sản ròng:** 25.328 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #106 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.135 Tr. VNĐ | **Tài sản ròng:** 33.535 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 14 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 2304 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 15.831 Tr. VNĐ | **Tài sản ròng:** 31.231 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #107 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.632 Tr. VNĐ | **Tài sản ròng:** 25.482 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 3 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Số dư sau lượt:** 4.632 Tr. VNĐ | **Tài sản ròng:** 25.482 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức) (C1), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế, TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #108 | Vòng #27 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.156 Tr. VNĐ | **Tài sản ròng:** 17.006 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 22 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hưng Yên (Văn Giang)] với giá 1850 Tr. VNĐ
- **Số dư sau lượt:** 726 Tr. VNĐ | **Tài sản ròng:** 16.876 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #28 ===

#### Lượt #109 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.732 Tr. VNĐ | **Tài sản ròng:** 27.632 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 34 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 1470 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.262 Tr. VNĐ | **Tài sản ròng:** 26.162 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C2), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #110 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.981 Tr. VNĐ | **Tài sản ròng:** 32.381 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 24 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)] (Property)
- **Số dư sau lượt:** 13.981 Tr. VNĐ | **Tài sản ròng:** 32.381 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hưng Yên (Văn Giang)

#### Lượt #111 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.102 Tr. VNĐ | **Tài sản ròng:** 26.952 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Số dư sau lượt:** 6.102 Tr. VNĐ | **Tài sản ròng:** 26.952 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức) (C1), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế, TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #112 | Vòng #28 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 726 Tr. VNĐ | **Tài sản ròng:** 16.876 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 31 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 1001 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.050 Tr. VNĐ | **Tài sản ròng:** 18.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #29 ===

#### Lượt #113 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.263 Tr. VNĐ | **Tài sản ròng:** 27.163 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 37 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 1.103 Tr. VNĐ | **Tài sản ròng:** 29.303 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #114 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.981 Tr. VNĐ | **Tài sản ròng:** 32.381 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 12.981 Tr. VNĐ | **Tài sản ròng:** 31.381 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hưng Yên (Văn Giang)

#### Lượt #115 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.102 Tr. VNĐ | **Tài sản ròng:** 26.952 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 11 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 7500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 3.602 Tr. VNĐ | **Tài sản ròng:** 24.452 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức) (C1), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế, TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #116 | Vòng #29 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** -450 Tr. VNĐ | **Tài sản ròng:** 15.700 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Giải cứu tài chính:** Thế chấp tài sản ô 26
- **Số dư sau lượt:** 850 Tr. VNĐ | **Tài sản ròng:** 15.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #30 ===

#### Lượt #117 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** -1.397 Tr. VNĐ | **Tài sản ròng:** 26.803 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Giải cứu tài chính:** Thế chấp tài sản ô 14
- **Giải cứu tài chính:** Thế chấp tài sản ô 28
- **Số dư sau lượt:** 153 Tr. VNĐ | **Tài sản ròng:** 26.803 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C3), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2)

#### Lượt #118 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 20.481 Tr. VNĐ | **Tài sản ròng:** 38.881 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Số dư sau lượt:** 20.481 Tr. VNĐ | **Tài sản ròng:** 38.881 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Kiên Giang (Phú Quốc - Grand World), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Hưng Yên (Văn Giang)

#### Lượt #119 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.602 Tr. VNĐ | **Tài sản ròng:** 24.452 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Số dư sau lượt:** 3.602 Tr. VNĐ | **Tài sản ròng:** 24.452 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức) (C1), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế, TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #120 | Vòng #30 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 850 Tr. VNĐ | **Tài sản ròng:** 15.700 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)] (Property)
- **Số dư sau lượt:** 850 Tr. VNĐ | **Tài sản ròng:** 15.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Thuận (Mũi Né), Cần Thơ (Cái Răng) (C3), Quảng Ninh (Hạ Long), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Hoàn Kiếm), Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt)

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 4 người chơi diễn ra liên tục 120 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.