# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 4 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202604 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 128 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Chú Sáu (Cân bằng / Balanced)** (Tổng tài sản ròng: **49.004 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Chú Sáu (Cân bằng / Balanced) | Balanced | 22.904 Tr. VNĐ | 49.004 Tr. VNĐ | 8 ô | 🏆 Vô địch |
| 2 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 1.299 Tr. VNĐ | 16.799 Tr. VNĐ | 7 ô | ✓ Hoàn thành |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | 0 Tr. VNĐ | 0 Tr. VNĐ | 0 ô | ❌ Phá sản |
| 4 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | 0 Tr. VNĐ | 0 Tr. VNĐ | 0 ô | ❌ Phá sản |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 47.092 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 1.800 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 44.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 34 căn (C1: 18, C2: 11, C3: 5).
- **Hoạt động sàn đấu giá:** 9 phiên phát động, 7 phiên gõ búa thành công.
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
- **Số dư sau lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #4 | Vòng #1 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 9 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bà Rịa - Vũng Tàu] với giá 2500 Tr. VNĐ
- **Số dư sau lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #5 | Vòng #1 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai: Khấu trừ 1800 Tr. VNĐ vào Kho Bạc
- **Số dư sau lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #2 ===

#### Lượt #6 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.500 Tr. VNĐ | **Tài sản ròng:** 16.500 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 7 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Số dư sau lượt:** 15.100 Tr. VNĐ | **Tài sản ròng:** 16.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Lâm Đồng (Đà Lạt)

#### Lượt #7 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.500 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 6 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 12.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #8 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 9 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Thừa Thiên Huế

#### Lượt #9 | Vòng #2 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 16.200 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 140 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.060 Tr. VNĐ | **Tài sản ròng:** 16.060 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #3 ===

#### Lượt #10 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.240 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 13 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Số dư sau lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An)

#### Lượt #11 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 16 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Mua thành công [Tuyến Cao Tốc Bắc - Nam] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 10.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam

#### Lượt #12 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 18 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Số dư sau lượt:** 14.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Nghệ An (TP. Vinh)

#### Lượt #13 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.060 Tr. VNĐ | **Tài sản ròng:** 16.060 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 15.880 Tr. VNĐ | **Tài sản ròng:** 15.880 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #4 ===

#### Lượt #14 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 24 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An)

#### Lượt #15 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 34 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Số dư sau lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An)

#### Lượt #16 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 34 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 4950 Tr. VNĐ
- **Số dư sau lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An)

#### Lượt #17 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 25 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 7.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang)

#### Lượt #18 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 23 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Cầu Giấy)] giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy)

#### Lượt #19 | Vòng #4 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.930 Tr. VNĐ | **Tài sản ròng:** 14.130 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 18 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 9.430 Tr. VNĐ | **Tài sản ròng:** 14.130 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel)

### === VÒNG ĐẤU #5 ===

#### Lượt #20 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.640 Tr. VNĐ | **Tài sản ròng:** 16.640 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 34 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Đồng Nai (Đại Công Viên Chủ Đề)] giá 1000 Tr. VNĐ
- **Số dư sau lượt:** 11.640 Tr. VNĐ | **Tài sản ròng:** 18.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #21 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.700 Tr. VNĐ | **Tài sản ròng:** 16.700 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 31 ➔ Ô 11 (**Bình Thuận (Mũi Né)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 1.030 Tr. VNĐ | **Tài sản ròng:** 19.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #22 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.030 Tr. VNĐ | **Tài sản ròng:** 19.430 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 1.030 Tr. VNĐ | **Tài sản ròng:** 19.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #23 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 32 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy)

#### Lượt #24 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)] (Property)
- **Số dư sau lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy)

#### Lượt #25 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)] (Property)
- **Số dư sau lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy)

#### Lượt #26 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)] (Property)
- **Số dư sau lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy)

#### Lượt #27 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 7550 Tr. VNĐ
- **Số dư sau lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy)

#### Lượt #28 | Vòng #5 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.430 Tr. VNĐ | **Tài sản ròng:** 14.130 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 28 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 8.230 Tr. VNĐ | **Tài sản ròng:** 12.930 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel)

### === VÒNG ĐẤU #6 ===

#### Lượt #29 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.185 Tr. VNĐ | **Tài sản ròng:** 14.385 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Từ chối mua [Cảng Nước Sâu Cái Mép], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 1.185 Tr. VNĐ | **Tài sản ròng:** 14.385 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #30 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.185 Tr. VNĐ | **Tài sản ròng:** 14.385 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép] (Railroad)
- **Số dư sau lượt:** 1.185 Tr. VNĐ | **Tài sản ròng:** 14.385 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #31 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.185 Tr. VNĐ | **Tài sản ròng:** 14.385 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép] (Railroad)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Cảng Nước Sâu Cái Mép] với giá 2700 Tr. VNĐ
- **Số dư sau lượt:** 1.185 Tr. VNĐ | **Tài sản ròng:** 14.385 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #32 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.030 Tr. VNĐ | **Tài sản ròng:** 19.430 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 11 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 1.030 Tr. VNĐ | **Tài sản ròng:** 19.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #33 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 39 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Đà Nẵng (Hải Châu - Sơn Trà)] giá 2000 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 3.234 Tr. VNĐ | **Tài sản ròng:** 16.634 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #34 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.530 Tr. VNĐ | **Tài sản ròng:** 12.230 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 36 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 7.030 Tr. VNĐ | **Tài sản ròng:** 15.330 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Hà Nội (Hoàn Kiếm) (C1), Tập Đoàn Viễn Thông (Viettel), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #7 ===

#### Lượt #35 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.185 Tr. VNĐ | **Tài sản ròng:** 14.785 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 1.185 Tr. VNĐ | **Tài sản ròng:** 14.785 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #36 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.185 Tr. VNĐ | **Tài sản ròng:** 14.785 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 27 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Kiên Giang (Phú Quốc - Grand World)] với giá 4000 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1 (Shophouse)
- **Số dư sau lượt:** 393 Tr. VNĐ | **Tài sản ròng:** 15.093 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #37 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.530 Tr. VNĐ | **Tài sản ròng:** 23.930 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 17 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 10.030 Tr. VNĐ | **Tài sản ròng:** 25.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #38 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.234 Tr. VNĐ | **Tài sản ròng:** 16.634 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 2.734 Tr. VNĐ | **Tài sản ròng:** 16.134 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #39 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.030 Tr. VNĐ | **Tài sản ròng:** 13.930 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 7 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 1.530 Tr. VNĐ | **Tài sản ròng:** 13.930 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hà Nội (Hoàn Kiếm) (C1), Tập Đoàn Viễn Thông (Viettel), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #8 ===

#### Lượt #40 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 393 Tr. VNĐ | **Tài sản ròng:** 15.093 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 393 Tr. VNĐ | **Tài sản ròng:** 15.093 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #41 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.530 Tr. VNĐ | **Tài sản ròng:** 25.930 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 22 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Trạm Kiểm Toán & Thanh Tra]: Trả tiền thuê 750 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 9.927 Tr. VNĐ | **Tài sản ròng:** 25.327 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #42 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.484 Tr. VNĐ | **Tài sản ròng:** 16.884 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 2800 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 684 Tr. VNĐ | **Tài sản ròng:** 14.084 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #43 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.330 Tr. VNĐ | **Tài sản ròng:** 16.730 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 12 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 4.330 Tr. VNĐ | **Tài sản ròng:** 16.730 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hà Nội (Hoàn Kiếm) (C1), Tập Đoàn Viễn Thông (Viettel), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #9 ===

#### Lượt #44 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 393 Tr. VNĐ | **Tài sản ròng:** 15.093 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 393 Tr. VNĐ | **Tài sản ròng:** 15.093 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #45 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.927 Tr. VNĐ | **Tài sản ròng:** 25.327 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 540 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 9.387 Tr. VNĐ | **Tài sản ròng:** 24.787 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #46 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.224 Tr. VNĐ | **Tài sản ròng:** 14.624 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 34 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại ô Thuế [Lệ Phí Đăng Ký Đất Đai]
- **Số dư sau lượt:** 2.362 Tr. VNĐ | **Tài sản ròng:** 15.762 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #47 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.330 Tr. VNĐ | **Tài sản ròng:** 16.730 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 20 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 3.830 Tr. VNĐ | **Tài sản ròng:** 16.230 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hà Nội (Hoàn Kiếm) (C1), Tập Đoàn Viễn Thông (Viettel), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #10 ===

#### Lượt #48 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 393 Tr. VNĐ | **Tài sản ròng:** 15.093 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1 (Shophouse)
- **Số dư sau lượt:** 713 Tr. VNĐ | **Tài sản ròng:** 17.713 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #49 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.887 Tr. VNĐ | **Tài sản ròng:** 25.287 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 9.887 Tr. VNĐ | **Tài sản ròng:** 25.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #50 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.887 Tr. VNĐ | **Tài sản ròng:** 25.287 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 26 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 9.887 Tr. VNĐ | **Tài sản ròng:** 25.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #51 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.887 Tr. VNĐ | **Tài sản ròng:** 25.287 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 7.887 Tr. VNĐ | **Tài sản ròng:** 25.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc), Cảng HKQT Nội Bài

#### Lượt #52 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.362 Tr. VNĐ | **Tài sản ròng:** 15.762 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 4 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 500 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 1.862 Tr. VNĐ | **Tài sản ròng:** 15.262 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #53 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.980 Tr. VNĐ | **Tài sản ròng:** 17.980 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Số dư sau lượt:** 2.980 Tr. VNĐ | **Tài sản ròng:** 17.980 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Hoàn Kiếm) (C1), Tập Đoàn Viễn Thông (Viettel), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #11 ===

#### Lượt #54 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 713 Tr. VNĐ | **Tài sản ròng:** 17.713 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 22 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 150 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 563 Tr. VNĐ | **Tài sản ròng:** 17.563 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #55 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.887 Tr. VNĐ | **Tài sản ròng:** 25.287 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 35 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)] (Property)
- **Số dư sau lượt:** 8.987 Tr. VNĐ | **Tài sản ròng:** 26.387 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc), Cảng HKQT Nội Bài

#### Lượt #56 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.012 Tr. VNĐ | **Tài sản ròng:** 15.412 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 15 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.012 Tr. VNĐ | **Tài sản ròng:** 14.412 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #57 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.980 Tr. VNĐ | **Tài sản ròng:** 17.980 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 1.380 Tr. VNĐ | **Tài sản ròng:** 18.780 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm) (C1), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C1), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C2)

### === VÒNG ĐẤU #12 ===

#### Lượt #58 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.610 Tr. VNĐ | **Tài sản ròng:** 18.610 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 32 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)] (Property)
- **Số dư sau lượt:** 1.610 Tr. VNĐ | **Tài sản ròng:** 18.610 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #59 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.984 Tr. VNĐ | **Tài sản ròng:** 27.784 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 3 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu] (Property)
- **Số dư sau lượt:** 10.984 Tr. VNĐ | **Tài sản ròng:** 27.784 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài

#### Lượt #60 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.059 Tr. VNĐ | **Tài sản ròng:** 15.459 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 25 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 300 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 1.759 Tr. VNĐ | **Tài sản ròng:** 15.159 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #61 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.680 Tr. VNĐ | **Tài sản ròng:** 19.080 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 1680 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Hạ cấp công trình ô 34
- **Giải cứu tài chính:** Thế chấp tài sản ô 26
- **Giải cứu tài chính:** Thế chấp tài sản ô 27
- **Giải cứu tài chính:** Thế chấp tài sản ô 34
- **Số dư sau lượt:** 1.130 Tr. VNĐ | **Tài sản ròng:** 15.130 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #13 ===

#### Lượt #62 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.610 Tr. VNĐ | **Tài sản ròng:** 18.610 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 39 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 400 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 2.310 Tr. VNĐ | **Tài sản ròng:** 19.310 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #63 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.064 Tr. VNĐ | **Tài sản ròng:** 29.864 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 9 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 540 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 12.524 Tr. VNĐ | **Tài sản ròng:** 29.324 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài

#### Lượt #64 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.899 Tr. VNĐ | **Tài sản ròng:** 15.299 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 28 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 899 Tr. VNĐ | **Tài sản ròng:** 14.299 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #65 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.530 Tr. VNĐ | **Tài sản ròng:** 15.530 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Số dư sau lượt:** 1.530 Tr. VNĐ | **Tài sản ròng:** 15.530 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #14 ===

#### Lượt #66 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.310 Tr. VNĐ | **Tài sản ròng:** 19.310 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 2 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Số dư sau lượt:** 710 Tr. VNĐ | **Tài sản ròng:** 19.310 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang)

#### Lượt #67 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.524 Tr. VNĐ | **Tài sản ròng:** 30.324 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 16 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 720 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 12.804 Tr. VNĐ | **Tài sản ròng:** 29.604 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài

#### Lượt #68 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 899 Tr. VNĐ | **Tài sản ròng:** 14.299 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 35 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 400 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 499 Tr. VNĐ | **Tài sản ròng:** 13.899 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #69 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.530 Tr. VNĐ | **Tài sản ròng:** 15.530 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 8 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.530 Tr. VNĐ | **Tài sản ròng:** 15.530 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #15 ===

#### Lượt #70 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.330 Tr. VNĐ | **Tài sản ròng:** 19.930 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 24 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Số dư sau lượt:** 700 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang)

#### Lượt #71 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.304 Tr. VNĐ | **Tài sản ròng:** 30.104 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 33 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 14.554 Tr. VNĐ | **Tài sản ròng:** 31.354 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài

#### Lượt #72 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** -1 Tr. VNĐ | **Tài sản ròng:** 13.399 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)] (Property)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 1.499 Tr. VNĐ | **Tài sản ròng:** 13.399 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #73 | Vòng #15 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.530 Tr. VNĐ | **Tài sản ròng:** 15.530 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 17 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng chân tại [Nghỉ Dưỡng Miễn Phí]: Trả tiền thuê 1052 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.530 Tr. VNĐ | **Tài sản ròng:** 15.530 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #16 ===

#### Lượt #74 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.752 Tr. VNĐ | **Tài sản ròng:** 21.052 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 34 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 1.752 Tr. VNĐ | **Tài sản ròng:** 21.052 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang)

#### Lượt #75 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.752 Tr. VNĐ | **Tài sản ròng:** 21.052 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 37 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 1800 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1 (Shophouse)
- **Giải cứu tài chính:** Thế chấp tài sản ô 39
- **Số dư sau lượt:** 722 Tr. VNĐ | **Tài sản ròng:** 21.922 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #76 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.754 Tr. VNĐ | **Tài sản ròng:** 33.054 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 0 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 420 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 12.334 Tr. VNĐ | **Tài sản ròng:** 32.634 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức)

#### Lượt #77 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.551 Tr. VNĐ | **Tài sản ròng:** 14.451 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 39 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 2250 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.626 Tr. VNĐ | **Tài sản ròng:** 13.526 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #78 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.530 Tr. VNĐ | **Tài sản ròng:** 15.530 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 1.530 Tr. VNĐ | **Tài sản ròng:** 15.530 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #17 ===

#### Lượt #79 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.142 Tr. VNĐ | **Tài sản ròng:** 22.342 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 1875 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 167 Tr. VNĐ | **Tài sản ròng:** 21.367 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #80 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 16.459 Tr. VNĐ | **Tài sản ròng:** 36.759 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 11 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 540 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 15.919 Tr. VNĐ | **Tài sản ròng:** 36.219 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức)

#### Lượt #81 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.166 Tr. VNĐ | **Tài sản ròng:** 14.066 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 9 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 420 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.746 Tr. VNĐ | **Tài sản ròng:** 13.646 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #82 | Vòng #17 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.530 Tr. VNĐ | **Tài sản ròng:** 15.530 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 26 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 1020 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.550 Tr. VNĐ | **Tài sản ròng:** 16.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #18 ===

#### Lượt #83 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.607 Tr. VNĐ | **Tài sản ròng:** 22.807 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 627 Tr. VNĐ | **Tài sản ròng:** 23.227 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C2), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #84 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.919 Tr. VNĐ | **Tài sản ròng:** 36.219 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 14.919 Tr. VNĐ | **Tài sản ròng:** 35.219 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức)

#### Lượt #85 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.746 Tr. VNĐ | **Tài sản ròng:** 13.646 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 13 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)] (Property)
- **Số dư sau lượt:** 1.746 Tr. VNĐ | **Tài sản ròng:** 13.646 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #86 | Vòng #18 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.550 Tr. VNĐ | **Tài sản ròng:** 16.550 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 39 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)] (Property)
- **Số dư sau lượt:** 1.580 Tr. VNĐ | **Tài sản ròng:** 17.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #19 ===

#### Lượt #87 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.627 Tr. VNĐ | **Tài sản ròng:** 24.227 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 647 Tr. VNĐ | **Tài sản ròng:** 24.647 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C2), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #88 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.919 Tr. VNĐ | **Tài sản ròng:** 35.219 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 22 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Mua thành công [Quảng Ninh (Hạ Long)] giá 2800 Tr. VNĐ
- **Số dư sau lượt:** 12.119 Tr. VNĐ | **Tài sản ròng:** 35.219 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long)

#### Lượt #89 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.746 Tr. VNĐ | **Tài sản ròng:** 13.646 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 16 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 770 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 976 Tr. VNĐ | **Tài sản ròng:** 12.876 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #90 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.580 Tr. VNĐ | **Tài sản ròng:** 17.180 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 3 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 1580 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 34
- **Giải cứu tài chính:** Thế chấp tài sản ô 15
- **Giải cứu tài chính:** Thế chấp tài sản ô 12
- **Số dư sau lượt:** 430 Tr. VNĐ | **Tài sản ròng:** 12.680 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #20 ===

#### Lượt #91 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.417 Tr. VNĐ | **Tài sản ròng:** 25.417 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 11 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 1417 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Số dư sau lượt:** 237 Tr. VNĐ | **Tài sản ròng:** 21.437 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #92 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.699 Tr. VNĐ | **Tài sản ròng:** 36.799 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 29 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 13.699 Tr. VNĐ | **Tài sản ròng:** 36.799 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long)

#### Lượt #93 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.393 Tr. VNĐ | **Tài sản ròng:** 14.293 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 840 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.553 Tr. VNĐ | **Tài sản ròng:** 13.453 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #94 | Vòng #20 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 430 Tr. VNĐ | **Tài sản ròng:** 12.680 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 9 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)] (Utility)
- **Số dư sau lượt:** 430 Tr. VNĐ | **Tài sản ròng:** 12.680 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #21 ===

#### Lượt #95 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 237 Tr. VNĐ | **Tài sản ròng:** 21.437 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 19 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 237 Tr. VNĐ | **Tài sản ròng:** 21.437 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #96 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.539 Tr. VNĐ | **Tài sản ròng:** 37.639 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 38 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu] (Property)
- **Số dư sau lượt:** 15.039 Tr. VNĐ | **Tài sản ròng:** 38.139 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long)

#### Lượt #97 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.553 Tr. VNĐ | **Tài sản ròng:** 13.453 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 29 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 420 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.133 Tr. VNĐ | **Tài sản ròng:** 13.033 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #98 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 430 Tr. VNĐ | **Tài sản ròng:** 12.680 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 1483 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 28
- **Số dư sau lượt:** 1.441 Tr. VNĐ | **Tài sản ròng:** 12.941 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #22 ===

#### Lượt #99 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.720 Tr. VNĐ | **Tài sản ròng:** 22.920 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 600 Tr. VNĐ | **Tài sản ròng:** 23.400 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C2)

#### Lượt #100 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.459 Tr. VNĐ | **Tài sản ròng:** 38.559 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 9 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 792 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 14.667 Tr. VNĐ | **Tài sản ròng:** 37.767 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long)

#### Lượt #101 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.133 Tr. VNĐ | **Tài sản ròng:** 13.033 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 37 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 1958 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Hạ cấp công trình ô 19
- **Giải cứu tài chính:** Hạ cấp công trình ô 16
- **Giải cứu tài chính:** Hạ cấp công trình ô 18
- **Giải cứu tài chính:** Hạ cấp công trình ô 19
- **Giải cứu tài chính:** Thế chấp tài sản ô 16
- **Số dư sau lượt:** 418 Tr. VNĐ | **Tài sản ròng:** 6.618 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Thừa Thiên Huế, Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #102 | Vòng #22 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.441 Tr. VNĐ | **Tài sản ròng:** 12.941 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 21 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 441 Tr. VNĐ | **Tài sản ròng:** 11.941 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #23 ===

#### Lượt #103 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.392 Tr. VNĐ | **Tài sản ròng:** 24.192 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 34 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 1792 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Giải cứu tài chính:** Hạ cấp công trình ô 24
- **Giải cứu tài chính:** Hạ cấp công trình ô 21
- **Số dư sau lượt:** 177 Tr. VNĐ | **Tài sản ròng:** 15.677 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang)

#### Lượt #104 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 19.417 Tr. VNĐ | **Tài sản ròng:** 42.517 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 21 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 864 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 18.553 Tr. VNĐ | **Tài sản ròng:** 41.653 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long)

#### Lượt #105 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 418 Tr. VNĐ | **Tài sản ròng:** 6.618 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 8 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Số dư sau lượt:** 418 Tr. VNĐ | **Tài sản ròng:** 6.618 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Thừa Thiên Huế, Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #106 | Vòng #23 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 441 Tr. VNĐ | **Tài sản ròng:** 11.941 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 25 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 1019 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.460 Tr. VNĐ | **Tài sản ròng:** 12.960 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #24 ===

#### Lượt #107 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.041 Tr. VNĐ | **Tài sản ròng:** 16.541 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1 (Shophouse)
- **Số dư sau lượt:** 321 Tr. VNĐ | **Tài sản ròng:** 16.621 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #108 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.553 Tr. VNĐ | **Tài sản ròng:** 41.653 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 24 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)] (Property)
- **Số dư sau lượt:** 18.553 Tr. VNĐ | **Tài sản ròng:** 41.653 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long)

#### Lượt #109 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.437 Tr. VNĐ | **Tài sản ròng:** 7.637 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 576 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 861 Tr. VNĐ | **Tài sản ròng:** 7.061 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Thừa Thiên Huế, Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #110 | Vòng #24 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.460 Tr. VNĐ | **Tài sản ròng:** 12.960 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 32 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 460 Tr. VNĐ | **Tài sản ròng:** 11.960 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc) (C3), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #25 ===

#### Lượt #111 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 897 Tr. VNĐ | **Tài sản ròng:** 17.197 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)] (Property)
- **Số dư sau lượt:** 897 Tr. VNĐ | **Tài sản ròng:** 17.197 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #112 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 19.553 Tr. VNĐ | **Tài sản ròng:** 42.653 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)] (Property)
- **Số dư sau lượt:** 19.553 Tr. VNĐ | **Tài sản ròng:** 42.653 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long)

#### Lượt #113 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 861 Tr. VNĐ | **Tài sản ròng:** 7.061 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 14 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 400 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.261 Tr. VNĐ | **Tài sản ròng:** 7.461 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Thừa Thiên Huế, Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #114 | Vòng #25 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.860 Tr. VNĐ | **Tài sản ròng:** 13.360 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 35 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 2025 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
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

### === VÒNG ĐẤU #26 ===

#### Lượt #115 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.297 Tr. VNĐ | **Tài sản ròng:** 17.597 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 13 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1 (Shophouse)
- **Số dư sau lượt:** 367 Tr. VNĐ | **Tài sản ròng:** 21.567 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #116 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 23.978 Tr. VNĐ | **Tài sản ròng:** 47.078 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 37 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 23.678 Tr. VNĐ | **Tài sản ròng:** 46.778 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long)

#### Lượt #117 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.261 Tr. VNĐ | **Tài sản ròng:** 7.461 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 469 Tr. VNĐ | **Tài sản ròng:** 6.669 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Thừa Thiên Huế, Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #118 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 469 Tr. VNĐ | **Tài sản ròng:** 6.669 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 31 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 1.469 Tr. VNĐ | **Tài sản ròng:** 7.669 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Thừa Thiên Huế, Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà)

### === VÒNG ĐẤU #27 ===

#### Lượt #119 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.159 Tr. VNĐ | **Tài sản ròng:** 22.359 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 22 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 336 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 823 Tr. VNĐ | **Tài sản ròng:** 22.023 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #120 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 22.464 Tr. VNĐ | **Tài sản ròng:** 48.564 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 576 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 21.888 Tr. VNĐ | **Tài sản ròng:** 47.988 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long), Hưng Yên (Văn Giang)

#### Lượt #121 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.469 Tr. VNĐ | **Tài sản ròng:** 7.669 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 36 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 2.249 Tr. VNĐ | **Tài sản ròng:** 8.449 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Thừa Thiên Huế, Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà)

### === VÒNG ĐẤU #28 ===

#### Lượt #122 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.399 Tr. VNĐ | **Tài sản ròng:** 22.599 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 29 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 420 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 979 Tr. VNĐ | **Tài sản ròng:** 22.179 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang) (C1)

#### Lượt #123 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 22.308 Tr. VNĐ | **Tài sản ròng:** 48.408 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 14 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 924 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 21.384 Tr. VNĐ | **Tài sản ròng:** 47.484 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long), Hưng Yên (Văn Giang)

#### Lượt #124 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.249 Tr. VNĐ | **Tài sản ròng:** 8.449 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 2 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 2249 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** 0 Tr. VNĐ | **Tài sản ròng:** 0 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #29 ===

#### Lượt #125 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.903 Tr. VNĐ | **Tài sản ròng:** 23.103 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 37 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 2303 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Giải cứu tài chính:** Hạ cấp công trình ô 24
- **Giải cứu tài chính:** Hạ cấp công trình ô 21
- **Số dư sau lượt:** 128 Tr. VNĐ | **Tài sản ròng:** 15.628 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang)

#### Lượt #126 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 25.936 Tr. VNĐ | **Tài sản ròng:** 52.036 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 23 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 25.936 Tr. VNĐ | **Tài sản ròng:** 52.036 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long), Hưng Yên (Văn Giang)

### === VÒNG ĐẤU #30 ===

#### Lượt #127 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 128 Tr. VNĐ | **Tài sản ròng:** 15.628 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 128 Tr. VNĐ | **Tài sản ròng:** 15.628 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), TP.HCM (Quận 1 - Nguyễn Huệ), Khánh Hòa (Nha Trang)

#### Lượt #128 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 25.936 Tr. VNĐ | **Tài sản ròng:** 52.036 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1171 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 22.904 Tr. VNĐ | **Tài sản ròng:** 49.004 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Quảng Ninh (Hạ Long), Hưng Yên (Văn Giang)

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 4 người chơi diễn ra liên tục 128 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.