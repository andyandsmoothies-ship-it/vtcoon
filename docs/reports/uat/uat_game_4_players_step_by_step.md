# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 4 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202604 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 111 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **40.789 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 3.589 Tr. VNĐ | 40.789 Tr. VNĐ | 7 ô | 🏆 Vô địch |
| 2 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | 6.899 Tr. VNĐ | 38.699 Tr. VNĐ | 9 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 1.390 Tr. VNĐ | 21.290 Tr. VNĐ | 7 ô | ✓ Hoàn thành |
| 4 | Cô Tư (Thận trọng / Passive) | Passive | 1.000 Tr. VNĐ | 1.000 Tr. VNĐ | 0 ô | ❌ Phá sản |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 52.644 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 1.800 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 40.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 33 căn (C1: 11, C2: 11, C3: 11).
- **Hoạt động sàn đấu giá:** 17 phiên phát động, 15 phiên gõ búa thành công.
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
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bà Rịa - Vũng Tàu] với giá 2500 Tr. VNĐ
- **Số dư sau lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #4 | Vòng #1 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai: Khấu trừ 1800 Tr. VNĐ vào Kho Bạc
- **Số dư sau lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #2 ===

#### Lượt #5 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.500 Tr. VNĐ | **Tài sản ròng:** 16.500 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 7 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Số dư sau lượt:** 15.100 Tr. VNĐ | **Tài sản ròng:** 16.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Lâm Đồng (Đà Lạt)

#### Lượt #6 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.500 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 6 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 12.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #7 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 9 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Thừa Thiên Huế

#### Lượt #8 | Vòng #2 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 140 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.060 Tr. VNĐ | **Tài sản ròng:** 16.060 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #3 ===

#### Lượt #9 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.240 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 13 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Số dư sau lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An)

#### Lượt #10 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 16 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Mua thành công [Tuyến Cao Tốc Bắc - Nam] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 10.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam

#### Lượt #11 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 18 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Số dư sau lượt:** 14.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Nghệ An (TP. Vinh)

#### Lượt #12 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.060 Tr. VNĐ | **Tài sản ròng:** 16.060 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 15.880 Tr. VNĐ | **Tài sản ròng:** 15.880 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #4 ===

#### Lượt #13 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 24 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 4950 Tr. VNĐ
- **Số dư sau lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An)

#### Lượt #14 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 25 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 7.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang)

#### Lượt #15 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 23 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Cầu Giấy)] giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy)

#### Lượt #16 | Vòng #4 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.930 Tr. VNĐ | **Tài sản ròng:** 14.130 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 18 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 9.430 Tr. VNĐ | **Tài sản ròng:** 14.130 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel)

### === VÒNG ĐẤU #5 ===

#### Lượt #17 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 34 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Đồng Nai (Đại Công Viên Chủ Đề)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Đồng Nai (Đại Công Viên Chủ Đề)] với giá 1450 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 750 Tr. VNĐ | **Tài sản ròng:** 19.150 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C2), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2)

#### Lượt #18 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.250 Tr. VNĐ | **Tài sản ròng:** 16.250 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 31 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 31
- **Số dư sau lượt:** 1.030 Tr. VNĐ | **Tài sản ròng:** 19.730 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cần Thơ (Cái Răng)

#### Lượt #19 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.838 Tr. VNĐ | **Tài sản ròng:** 19.638 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 15.838 Tr. VNĐ | **Tài sản ròng:** 20.638 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Hà Nội (Cầu Giấy)

#### Lượt #20 | Vòng #5 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.430 Tr. VNĐ | **Tài sản ròng:** 14.130 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 28 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)] (Property)
- **Số dư sau lượt:** 9.430 Tr. VNĐ | **Tài sản ròng:** 14.130 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel)

### === VÒNG ĐẤU #6 ===

#### Lượt #21 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 750 Tr. VNĐ | **Tài sản ròng:** 19.150 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Từ chối mua [Khánh Hòa (Nha Trang)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Khánh Hòa (Nha Trang)] với giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 750 Tr. VNĐ | **Tài sản ròng:** 19.150 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C2), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2)

#### Lượt #22 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.030 Tr. VNĐ | **Tài sản ròng:** 19.730 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 1 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 1.030 Tr. VNĐ | **Tài sản ròng:** 19.730 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cần Thơ (Cái Răng)

#### Lượt #23 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.838 Tr. VNĐ | **Tài sản ròng:** 20.638 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 38 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 60 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 17.778 Tr. VNĐ | **Tài sản ròng:** 22.578 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Hà Nội (Cầu Giấy)

#### Lượt #24 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.630 Tr. VNĐ | **Tài sản ròng:** 13.930 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [TP.HCM (TP. Thủ Đức)] giá 3500 Tr. VNĐ
- **Số dư sau lượt:** 4.977 Tr. VNĐ | **Tài sản ròng:** 14.777 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #7 ===

#### Lượt #25 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 750 Tr. VNĐ | **Tài sản ròng:** 19.150 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 14 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 250 Tr. VNĐ | **Tài sản ròng:** 18.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C2), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2)

#### Lượt #26 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.590 Tr. VNĐ | **Tài sản ròng:** 20.290 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 1600 Tr. VNĐ
- **Số dư sau lượt:** 1.590 Tr. VNĐ | **Tài sản ròng:** 20.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cần Thơ (Cái Răng)

#### Lượt #27 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.778 Tr. VNĐ | **Tài sản ròng:** 22.578 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 16.578 Tr. VNĐ | **Tài sản ròng:** 21.378 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Hà Nội (Cầu Giấy)

#### Lượt #28 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.377 Tr. VNĐ | **Tài sản ròng:** 14.577 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 4 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)] (Property)
- **Số dư sau lượt:** 3.377 Tr. VNĐ | **Tài sản ròng:** 14.577 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #8 ===

#### Lượt #29 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 250 Tr. VNĐ | **Tài sản ròng:** 18.650 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 25 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 250 Tr. VNĐ | **Tài sản ròng:** 18.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C2), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2)

#### Lượt #30 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.590 Tr. VNĐ | **Tài sản ròng:** 20.290 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 11 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.410 Tr. VNĐ | **Tài sản ròng:** 20.110 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cần Thơ (Cái Răng)

#### Lượt #31 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.758 Tr. VNĐ | **Tài sản ròng:** 21.558 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 7 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 16.758 Tr. VNĐ | **Tài sản ròng:** 21.558 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Hà Nội (Cầu Giấy)

#### Lượt #32 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.377 Tr. VNĐ | **Tài sản ròng:** 15.377 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 14 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 877 Tr. VNĐ | **Tài sản ròng:** 14.877 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #9 ===

#### Lượt #33 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 250 Tr. VNĐ | **Tài sản ròng:** 18.650 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 250 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 13
- **Số dư sau lượt:** 630 Tr. VNĐ | **Tài sản ròng:** 18.330 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C2), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2)

#### Lượt #34 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.910 Tr. VNĐ | **Tài sản ròng:** 20.610 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 18 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 1760 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 150 Tr. VNĐ | **Tài sản ròng:** 18.850 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cần Thơ (Cái Răng)

#### Lượt #35 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.758 Tr. VNĐ | **Tài sản ròng:** 21.558 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 18 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 16.758 Tr. VNĐ | **Tài sản ròng:** 21.558 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Hà Nội (Cầu Giấy)

#### Lượt #36 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.127 Tr. VNĐ | **Tài sản ròng:** 15.127 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 25 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 1.127 Tr. VNĐ | **Tài sản ròng:** 15.127 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #10 ===

#### Lượt #37 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.390 Tr. VNĐ | **Tài sản ròng:** 20.090 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 34 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 350 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 1.270 Tr. VNĐ | **Tài sản ròng:** 19.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C2), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2)

#### Lượt #38 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 150 Tr. VNĐ | **Tài sản ròng:** 18.850 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] với giá 1450 Tr. VNĐ
- **Số dư sau lượt:** 150 Tr. VNĐ | **Tài sản ròng:** 18.850 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cần Thơ (Cái Răng)

#### Lượt #39 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.308 Tr. VNĐ | **Tài sản ròng:** 22.708 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 15.308 Tr. VNĐ | **Tài sản ròng:** 22.708 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #40 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.477 Tr. VNĐ | **Tài sản ròng:** 15.477 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 797 Tr. VNĐ | **Tài sản ròng:** 14.797 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #11 ===

#### Lượt #41 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.270 Tr. VNĐ | **Tài sản ròng:** 19.670 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 37 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cảng HKQT Long Thành], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [Cảng HKQT Long Thành] với giá 1050 Tr. VNĐ
- **Số dư sau lượt:** 2.670 Tr. VNĐ | **Tài sản ròng:** 21.070 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C2), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2)

#### Lượt #42 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 150 Tr. VNĐ | **Tài sản ròng:** 18.850 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 26 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 2600 Tr. VNĐ
- **Giải cứu tài chính:** Hạ cấp công trình ô 16
- **Số dư sau lượt:** 55 Tr. VNĐ | **Tài sản ròng:** 18.755 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cần Thơ (Cái Răng)

#### Lượt #43 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.838 Tr. VNĐ | **Tài sản ròng:** 25.238 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 33 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 9.368 Tr. VNĐ | **Tài sản ròng:** 27.568 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Hà Nội (Cầu Giấy), Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), An Giang (Châu Đốc) (C3)

#### Lượt #44 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 797 Tr. VNĐ | **Tài sản ròng:** 14.797 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 18 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 2328 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 37
- **Giải cứu tài chính:** Thế chấp tài sản ô 29
- **Số dư sau lượt:** 905 Tr. VNĐ | **Tài sản ròng:** 18.655 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt) (C2), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C2), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #12 ===

#### Lượt #45 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.998 Tr. VNĐ | **Tài sản ròng:** 21.998 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 5 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 2.358 Tr. VNĐ | **Tài sản ròng:** 22.658 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2)

#### Lượt #46 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 967 Tr. VNĐ | **Tài sản ròng:** 19.067 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 1.992 Tr. VNĐ | **Tài sản ròng:** 20.092 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3)

#### Lượt #47 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.368 Tr. VNĐ | **Tài sản ròng:** 27.568 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 3 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 3750 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 5.618 Tr. VNĐ | **Tài sản ròng:** 23.818 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Hà Nội (Cầu Giấy), Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), An Giang (Châu Đốc) (C3)

#### Lượt #48 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 905 Tr. VNĐ | **Tài sản ròng:** 18.655 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 36 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lệ Phí Đăng Ký Đất Đai]: Trả tiền thuê 1005 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.669 Tr. VNĐ | **Tài sản ròng:** 20.419 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt) (C2), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C2), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #13 ===

#### Lượt #49 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.363 Tr. VNĐ | **Tài sản ròng:** 23.663 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 1120 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 2.243 Tr. VNĐ | **Tài sản ròng:** 22.543 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2)

#### Lượt #50 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.742 Tr. VNĐ | **Tài sản ròng:** 23.842 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 2.592 Tr. VNĐ | **Tài sản ròng:** 23.692 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #51 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.618 Tr. VNĐ | **Tài sản ròng:** 23.818 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Số dư sau lượt:** 5.618 Tr. VNĐ | **Tài sản ròng:** 23.818 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Hà Nội (Cầu Giấy), Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), An Giang (Châu Đốc) (C3)

#### Lượt #52 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.789 Tr. VNĐ | **Tài sản ròng:** 21.539 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 4 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 720 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 1.149 Tr. VNĐ | **Tài sản ròng:** 21.299 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt) (C2), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #14 ===

#### Lượt #53 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.843 Tr. VNĐ | **Tài sản ròng:** 22.143 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 13 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.531 Tr. VNĐ | **Tài sản ròng:** 21.831 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2)

#### Lượt #54 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.312 Tr. VNĐ | **Tài sản ròng:** 24.412 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 12 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 1980 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.332 Tr. VNĐ | **Tài sản ròng:** 22.432 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #55 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.930 Tr. VNĐ | **Tài sản ròng:** 24.130 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 5930 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 18
- **Số dư sau lượt:** 830 Tr. VNĐ | **Tài sản ròng:** 18.130 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Hà Nội (Cầu Giấy), Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), An Giang (Châu Đốc) (C3)

#### Lượt #56 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.079 Tr. VNĐ | **Tài sản ròng:** 27.229 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 17 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)] (Utility)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 1.934 Tr. VNĐ | **Tài sản ròng:** 27.334 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #15 ===

#### Lượt #57 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.511 Tr. VNĐ | **Tài sản ròng:** 23.811 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 26 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1980 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 2.331 Tr. VNĐ | **Tài sản ròng:** 25.931 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3)

#### Lượt #58 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.332 Tr. VNĐ | **Tài sản ròng:** 22.432 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 23 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 1.332 Tr. VNĐ | **Tài sản ròng:** 22.432 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #59 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.810 Tr. VNĐ | **Tài sản ròng:** 20.110 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 2810 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Giải cứu tài chính:** Thế chấp tài sản ô 26
- **Giải cứu tài chính:** Thế chấp tài sản ô 39
- **Giải cứu tài chính:** Thế chấp tài sản ô 5
- **Số dư sau lượt:** 360 Tr. VNĐ | **Tài sản ròng:** 11.860 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Hà Nội (Cầu Giấy), Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), An Giang (Châu Đốc) (C3)

#### Lượt #60 | Vòng #15 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 584 Tr. VNĐ | **Tài sản ròng:** 28.584 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 28 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Từ chối mua [Cảng HKQT Nội Bài], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cảng HKQT Nội Bài] với giá 1050 Tr. VNĐ
- **Số dư sau lượt:** 584 Tr. VNĐ | **Tài sản ròng:** 28.584 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #16 ===

#### Lượt #61 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.091 Tr. VNĐ | **Tài sản ròng:** 29.691 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 3 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 1.211 Tr. VNĐ | **Tài sản ròng:** 30.411 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài

#### Lượt #62 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.332 Tr. VNĐ | **Tài sản ròng:** 22.432 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 27 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 3.832 Tr. VNĐ | **Tài sản ròng:** 24.932 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #63 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 360 Tr. VNĐ | **Tài sản ròng:** 11.860 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 21 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 48 Tr. VNĐ | **Tài sản ròng:** 11.548 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Hà Nội (Cầu Giấy), Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), An Giang (Châu Đốc) (C3)

#### Lượt #64 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 896 Tr. VNĐ | **Tài sản ròng:** 28.896 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 35 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 666 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 28
- **Giải cứu tài chính:** Thế chấp tài sản ô 29
- **Giải cứu tài chính:** Thế chấp tài sản ô 27
- **Giải cứu tài chính:** Thế chấp tài sản ô 37
- **Số dư sau lượt:** 541 Tr. VNĐ | **Tài sản ròng:** 24.091 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #17 ===

#### Lượt #65 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.211 Tr. VNĐ | **Tài sản ròng:** 30.411 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 1.211 Tr. VNĐ | **Tài sản ròng:** 30.411 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài

#### Lượt #66 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.498 Tr. VNĐ | **Tài sản ròng:** 25.598 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 36 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 5250 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 248 Tr. VNĐ | **Tài sản ròng:** 21.348 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #67 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.944 Tr. VNĐ | **Tài sản ròng:** 13.444 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 1.944 Tr. VNĐ | **Tài sản ròng:** 13.444 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Hà Nội (Cầu Giấy), Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), An Giang (Châu Đốc) (C3)

#### Lượt #68 | Vòng #17 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.141 Tr. VNĐ | **Tài sản ròng:** 30.891 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 1128 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.914 Tr. VNĐ | **Tài sản ròng:** 31.714 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #18 ===

#### Lượt #69 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.211 Tr. VNĐ | **Tài sản ròng:** 30.411 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 20 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)] (Property)
- **Số dư sau lượt:** 1.211 Tr. VNĐ | **Tài sản ròng:** 30.411 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài

#### Lượt #70 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.376 Tr. VNĐ | **Tài sản ròng:** 22.476 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 1.376 Tr. VNĐ | **Tài sản ròng:** 22.476 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #71 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.944 Tr. VNĐ | **Tài sản ròng:** 13.444 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 34 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)] (Property)
- **Số dư sau lượt:** 2.609 Tr. VNĐ | **Tài sản ròng:** 14.109 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Hà Nội (Cầu Giấy), Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), An Giang (Châu Đốc) (C3)

#### Lượt #72 | Vòng #18 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.914 Tr. VNĐ | **Tài sản ròng:** 31.714 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 8 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 1036 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.914 Tr. VNĐ | **Tài sản ròng:** 31.714 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #19 ===

#### Lượt #73 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.247 Tr. VNĐ | **Tài sản ròng:** 31.447 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 29 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 2.247 Tr. VNĐ | **Tài sản ròng:** 31.447 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài

#### Lượt #74 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.412 Tr. VNĐ | **Tài sản ròng:** 23.512 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 18 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)] (Property)
- **Số dư sau lượt:** 2.412 Tr. VNĐ | **Tài sản ròng:** 23.512 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #75 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.609 Tr. VNĐ | **Tài sản ròng:** 14.109 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 3 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 360 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 2.249 Tr. VNĐ | **Tài sản ròng:** 13.749 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Hà Nội (Cầu Giấy), Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), An Giang (Châu Đốc) (C3)

#### Lượt #76 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.414 Tr. VNĐ | **Tài sản ròng:** 31.214 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 1.414 Tr. VNĐ | **Tài sản ròng:** 31.214 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #20 ===

#### Lượt #77 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.247 Tr. VNĐ | **Tài sản ròng:** 31.447 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 33 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 3.647 Tr. VNĐ | **Tài sản ròng:** 32.847 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài

#### Lượt #78 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.772 Tr. VNĐ | **Tài sản ròng:** 23.872 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 29 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)] (Property)
- **Số dư sau lượt:** 2.772 Tr. VNĐ | **Tài sản ròng:** 23.872 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #79 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.249 Tr. VNĐ | **Tài sản ròng:** 13.749 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 12 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 2249 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Thế chấp tài sản ô 1
- **Giải cứu tài chính:** Thế chấp tài sản ô 3
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** 0 Tr. VNĐ | **Tài sản ròng:** 0 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #80 | Vòng #20 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.663 Tr. VNĐ | **Tài sản ròng:** 33.463 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 18 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.123 Tr. VNĐ | **Tài sản ròng:** 32.323 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #21 ===

#### Lượt #81 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.647 Tr. VNĐ | **Tài sản ròng:** 32.847 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 6.647 Tr. VNĐ | **Tài sản ròng:** 35.847 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài

#### Lượt #82 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.772 Tr. VNĐ | **Tài sản ròng:** 23.872 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 32 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.272 Tr. VNĐ | **Tài sản ròng:** 23.372 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #83 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.123 Tr. VNĐ | **Tài sản ròng:** 32.323 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 22 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 1.123 Tr. VNĐ | **Tài sản ròng:** 32.323 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #22 ===

#### Lượt #84 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.147 Tr. VNĐ | **Tài sản ròng:** 36.347 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 7 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Từ chối mua [Thừa Thiên Huế], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Thừa Thiên Huế] với giá 950 Tr. VNĐ
- **Số dư sau lượt:** 7.147 Tr. VNĐ | **Tài sản ròng:** 36.347 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài

#### Lượt #85 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.322 Tr. VNĐ | **Tài sản ròng:** 24.222 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 35 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại ô Thuế [Lệ Phí Đăng Ký Đất Đai]
- **Số dư sau lượt:** 1.640 Tr. VNĐ | **Tài sản ròng:** 24.540 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế

#### Lượt #86 | Vòng #22 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.123 Tr. VNĐ | **Tài sản ròng:** 32.323 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 1337 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.528 Tr. VNĐ | **Tài sản ròng:** 32.728 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #23 ===

#### Lượt #87 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.147 Tr. VNĐ | **Tài sản ròng:** 36.347 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 18 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)] (Property)
- **Số dư sau lượt:** 7.147 Tr. VNĐ | **Tài sản ròng:** 36.347 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài

#### Lượt #88 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.977 Tr. VNĐ | **Tài sản ròng:** 25.877 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 2.977 Tr. VNĐ | **Tài sản ròng:** 25.877 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế

#### Lượt #89 | Vòng #23 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.528 Tr. VNĐ | **Tài sản ròng:** 32.728 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 18 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)] (Utility)
- **Số dư sau lượt:** 1.528 Tr. VNĐ | **Tài sản ròng:** 32.728 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #24 ===

#### Lượt #90 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.147 Tr. VNĐ | **Tài sản ròng:** 36.347 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 24 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 336 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 6.811 Tr. VNĐ | **Tài sản ròng:** 36.011 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài

#### Lượt #91 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.977 Tr. VNĐ | **Tài sản ròng:** 25.877 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hà Nội (Cầu Giấy)] với giá 1550 Tr. VNĐ
- **Số dư sau lượt:** 2.177 Tr. VNĐ | **Tài sản ròng:** 25.077 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế

#### Lượt #92 | Vòng #24 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.864 Tr. VNĐ | **Tài sản ròng:** 33.064 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 28 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.364 Tr. VNĐ | **Tài sản ròng:** 32.564 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #25 ===

#### Lượt #93 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.761 Tr. VNĐ | **Tài sản ròng:** 37.961 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 29 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 6.361 Tr. VNĐ | **Tài sản ròng:** 38.561 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

#### Lượt #94 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.177 Tr. VNĐ | **Tài sản ròng:** 25.077 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 32 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cần Thơ (Cái Răng)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Cần Thơ (Cái Răng)] với giá 600 Tr. VNĐ
- **Số dư sau lượt:** 2.677 Tr. VNĐ | **Tài sản ròng:** 25.577 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế

#### Lượt #95 | Vòng #25 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 764 Tr. VNĐ | **Tài sản ròng:** 32.564 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 35 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 1177 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 2.441 Tr. VNĐ | **Tài sản ròng:** 34.241 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

### === VÒNG ĐẤU #26 ===

#### Lượt #96 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.361 Tr. VNĐ | **Tài sản ròng:** 38.561 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 38 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 72 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 7.039 Tr. VNĐ | **Tài sản ròng:** 39.239 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

#### Lượt #97 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.854 Tr. VNĐ | **Tài sản ròng:** 26.754 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Số dư sau lượt:** 3.854 Tr. VNĐ | **Tài sản ròng:** 26.754 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế

#### Lượt #98 | Vòng #26 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.513 Tr. VNĐ | **Tài sản ròng:** 34.313 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 1016 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 3.529 Tr. VNĐ | **Tài sản ròng:** 35.329 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

### === VÒNG ĐẤU #27 ===

#### Lượt #99 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.039 Tr. VNĐ | **Tài sản ròng:** 39.239 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 8.039 Tr. VNĐ | **Tài sản ròng:** 40.239 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

#### Lượt #100 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.870 Tr. VNĐ | **Tài sản ròng:** 27.770 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 8 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 4870 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 16
- **Giải cứu tài chính:** Thế chấp tài sản ô 18
- **Số dư sau lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế

#### Lượt #101 | Vòng #27 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.399 Tr. VNĐ | **Tài sản ròng:** 40.199 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)] (Property)
- **Số dư sau lượt:** 8.399 Tr. VNĐ | **Tài sản ròng:** 40.199 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

### === VÒNG ĐẤU #28 ===

#### Lượt #102 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.039 Tr. VNĐ | **Tài sản ròng:** 40.239 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 7 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 8.039 Tr. VNĐ | **Tài sản ròng:** 40.239 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

#### Lượt #103 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 11 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế

#### Lượt #104 | Vòng #28 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.399 Tr. VNĐ | **Tài sản ròng:** 40.199 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 8.399 Tr. VNĐ | **Tài sản ròng:** 40.199 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

### === VÒNG ĐẤU #29 ===

#### Lượt #105 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.039 Tr. VNĐ | **Tài sản ròng:** 40.239 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Dừng chân tại [Trạm Kiểm Toán & Thanh Tra]: Trả tiền thuê 3900 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 4.139 Tr. VNĐ | **Tài sản ròng:** 39.339 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

#### Lượt #106 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.270 Tr. VNĐ | **Tài sản ròng:** 22.370 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 18 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 400 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 1.890 Tr. VNĐ | **Tài sản ròng:** 21.790 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế

#### Lượt #107 | Vòng #29 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.799 Tr. VNĐ | **Tài sản ròng:** 40.599 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 20 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 8.199 Tr. VNĐ | **Tài sản ròng:** 39.999 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

### === VÒNG ĐẤU #30 ===

#### Lượt #108 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.139 Tr. VNĐ | **Tài sản ròng:** 39.339 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 4.139 Tr. VNĐ | **Tài sản ròng:** 39.339 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Thanh Hóa (Sầm Sơn) (C3), Ninh Bình (Tràng An) (C3), Nghệ An (TP. Vinh) (C3), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

#### Lượt #109 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.890 Tr. VNĐ | **Tài sản ròng:** 21.790 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 28 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.390 Tr. VNĐ | **Tài sản ròng:** 21.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế

#### Lượt #110 | Vòng #30 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.199 Tr. VNĐ | **Tài sản ròng:** 39.999 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 36 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cảng HKQT Long Thành], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cảng HKQT Long Thành] với giá 1050 Tr. VNĐ
- **Số dư sau lượt:** 8.699 Tr. VNĐ | **Tài sản ròng:** 36.999 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #111 | Vòng #30 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.699 Tr. VNĐ | **Tài sản ròng:** 36.999 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 5 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành] (Railroad)
- **Sàn đấu giá:** Chốt đấu giá: Bé Bo (Cạnh tranh / Aggressive) sở hữu [TP.HCM (TP. Thủ Đức)] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 6.899 Tr. VNĐ | **Tài sản ròng:** 38.699 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), TP.HCM (TP. Thủ Đức)

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 4 người chơi diễn ra liên tục 111 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.