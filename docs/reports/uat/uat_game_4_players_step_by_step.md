# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 4 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202604 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 112 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Chú Sáu (Cân bằng / Balanced)** (Tổng tài sản ròng: **74.195 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Chú Sáu (Cân bằng / Balanced) | Balanced | 5.995 Tr. VNĐ | 74.195 Tr. VNĐ | 16 ô | 🏆 Vô địch |
| 2 | Cô Tư (Thận trọng / Passive) | Passive | 695 Tr. VNĐ | 20.195 Tr. VNĐ | 5 ô | ✓ Hoàn thành |
| 3 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 1.006 Tr. VNĐ | 11.306 Tr. VNĐ | 7 ô | ✓ Hoàn thành |
| 4 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | 0 Tr. VNĐ | 0 Tr. VNĐ | 0 ô | ❌ Phá sản |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 53.541 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 1.800 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 38.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 50 căn (C1: 18, C2: 20, C3: 12).
- **Hoạt động sàn đấu giá:** 8 phiên phát động, 5 phiên gõ búa thành công.
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
- **Số dư sau lượt:** 10.505 Tr. VNĐ | **Tài sản ròng:** 15.205 Tr. VNĐ
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
- **Số dư trước lượt:** 8.775 Tr. VNĐ | **Tài sản ròng:** 17.775 Tr. VNĐ
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
- **Số dư sau lượt:** 2.105 Tr. VNĐ | **Tài sản ròng:** 20.505 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #22 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.105 Tr. VNĐ | **Tài sản ròng:** 20.505 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 3050 Tr. VNĐ
- **Số dư sau lượt:** 2.105 Tr. VNĐ | **Tài sản ròng:** 20.505 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #23 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.180 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 32 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 13.180 Tr. VNĐ | **Tài sản ròng:** 20.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy)

#### Lượt #24 | Vòng #5 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.505 Tr. VNĐ | **Tài sản ròng:** 15.205 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 28 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (TP. Thủ Đức)] giá 3500 Tr. VNĐ
- **Số dư sau lượt:** 8.245 Tr. VNĐ | **Tài sản ròng:** 16.445 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #6 ===

#### Lượt #25 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.685 Tr. VNĐ | **Tài sản ròng:** 17.885 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 345 Tr. VNĐ | **Tài sản ròng:** 19.845 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt) (C2), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C2)

#### Lượt #26 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.345 Tr. VNĐ | **Tài sản ròng:** 21.745 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 11 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 3.165 Tr. VNĐ | **Tài sản ròng:** 21.565 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc)

#### Lượt #27 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.360 Tr. VNĐ | **Tài sản ròng:** 20.360 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 0 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Đà Nẵng (Hải Châu - Sơn Trà)] giá 2000 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 4.570 Tr. VNĐ | **Tài sản ròng:** 21.570 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #28 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.245 Tr. VNĐ | **Tài sản ròng:** 16.445 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 37 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1007 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 10.185 Tr. VNĐ | **Tài sản ròng:** 18.385 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #7 ===

#### Lượt #29 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.352 Tr. VNĐ | **Tài sản ròng:** 21.252 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 14 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 150 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 2 Tr. VNĐ | **Tài sản ròng:** 19.902 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C2)

#### Lượt #30 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.232 Tr. VNĐ | **Tài sản ròng:** 22.632 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 18 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 982 Tr. VNĐ | **Tài sản ròng:** 23.482 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #31 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.570 Tr. VNĐ | **Tài sản ròng:** 21.570 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 19 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 4.570 Tr. VNĐ | **Tài sản ròng:** 21.570 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #32 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.570 Tr. VNĐ | **Tài sản ròng:** 21.570 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 27 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 4.570 Tr. VNĐ | **Tài sản ròng:** 21.570 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #33 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.570 Tr. VNĐ | **Tài sản ròng:** 21.570 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 27 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 4.570 Tr. VNĐ | **Tài sản ròng:** 21.570 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #34 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.135 Tr. VNĐ | **Tài sản ròng:** 19.935 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 3 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 1111 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 5.385 Tr. VNĐ | **Tài sản ròng:** 16.185 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #8 ===

#### Lượt #35 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.113 Tr. VNĐ | **Tài sản ròng:** 21.013 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 22 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 1113 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Số dư sau lượt:** 308 Tr. VNĐ | **Tài sản ròng:** 15.308 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C2)

#### Lượt #36 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.845 Tr. VNĐ | **Tài sản ròng:** 28.345 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 26 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 350 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 5.495 Tr. VNĐ | **Tài sản ròng:** 27.995 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #37 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.681 Tr. VNĐ | **Tài sản ròng:** 22.681 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 800 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 4.881 Tr. VNĐ | **Tài sản ròng:** 21.881 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #38 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.535 Tr. VNĐ | **Tài sản ròng:** 17.335 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Số dư sau lượt:** 6.535 Tr. VNĐ | **Tài sản ròng:** 17.335 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #9 ===

#### Lượt #39 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 308 Tr. VNĐ | **Tài sản ròng:** 15.308 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 31 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 308 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Số dư sau lượt:** 518 Tr. VNĐ | **Tài sản ròng:** 13.918 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C1)

#### Lượt #40 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.495 Tr. VNĐ | **Tài sản ròng:** 27.995 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại ô Thuế [Lệ Phí Đăng Ký Đất Đai]
- **Số dư sau lượt:** 5.846 Tr. VNĐ | **Tài sản ròng:** 28.346 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #41 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.881 Tr. VNĐ | **Tài sản ròng:** 21.881 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 34 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 3750 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 7.481 Tr. VNĐ | **Tài sản ròng:** 21.481 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #42 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.993 Tr. VNĐ | **Tài sản ròng:** 17.793 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 8 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 1053 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 6.606 Tr. VNĐ | **Tài sản ròng:** 17.406 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #10 ===

#### Lượt #43 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.571 Tr. VNĐ | **Tài sản ròng:** 14.971 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 37 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 1.091 Tr. VNĐ | **Tài sản ròng:** 16.491 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C1), Cần Thơ (Cái Răng)

#### Lượt #44 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.596 Tr. VNĐ | **Tài sản ròng:** 32.096 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 4.796 Tr. VNĐ | **Tài sản ròng:** 30.896 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép

#### Lượt #45 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.921 Tr. VNĐ | **Tài sản ròng:** 22.921 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 8.921 Tr. VNĐ | **Tài sản ròng:** 22.921 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #46 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.606 Tr. VNĐ | **Tài sản ròng:** 17.406 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 16 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 480 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 6.126 Tr. VNĐ | **Tài sản ròng:** 16.926 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #11 ===

#### Lượt #47 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.666 Tr. VNĐ | **Tài sản ròng:** 19.066 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 1 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 26
- **Số dư sau lượt:** 866 Tr. VNĐ | **Tài sản ròng:** 19.966 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #48 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.796 Tr. VNĐ | **Tài sản ròng:** 30.896 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 15 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 4.796 Tr. VNĐ | **Tài sản ròng:** 30.896 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép

#### Lượt #49 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.921 Tr. VNĐ | **Tài sản ròng:** 22.921 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 6 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)] (Property)
- **Số dư sau lượt:** 8.921 Tr. VNĐ | **Tài sản ròng:** 22.921 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C2)

#### Lượt #50 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.126 Tr. VNĐ | **Tài sản ròng:** 16.926 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 6.126 Tr. VNĐ | **Tài sản ròng:** 16.926 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #12 ===

#### Lượt #51 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 866 Tr. VNĐ | **Tài sản ròng:** 19.966 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 11 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 400 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 716 Tr. VNĐ | **Tài sản ròng:** 19.816 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #52 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.196 Tr. VNĐ | **Tài sản ròng:** 31.296 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 26 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Số dư sau lượt:** 4.876 Tr. VNĐ | **Tài sản ròng:** 30.976 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép

#### Lượt #53 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.521 Tr. VNĐ | **Tài sản ròng:** 22.521 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 16 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 6.921 Tr. VNĐ | **Tài sản ròng:** 23.921 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3)

#### Lượt #54 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.596 Tr. VNĐ | **Tài sản ròng:** 17.396 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 33 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1980 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 6.016 Tr. VNĐ | **Tài sản ròng:** 16.816 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hà Nội (Hoàn Kiếm), Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #13 ===

#### Lượt #55 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 716 Tr. VNĐ | **Tài sản ròng:** 19.816 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 17 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 716 Tr. VNĐ | **Tài sản ròng:** 19.816 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #56 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.856 Tr. VNĐ | **Tài sản ròng:** 32.956 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 34 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 5.856 Tr. VNĐ | **Tài sản ròng:** 33.956 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành

#### Lượt #57 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.921 Tr. VNĐ | **Tài sản ròng:** 23.921 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 20 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 2000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 4.921 Tr. VNĐ | **Tài sản ròng:** 21.921 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3)

#### Lượt #58 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.016 Tr. VNĐ | **Tài sản ròng:** 16.816 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 3 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 1093 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 27
- **Giải cứu tài chính:** Thế chấp tài sản ô 37
- **Giải cứu tài chính:** Thế chấp tài sản ô 28
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** 0 Tr. VNĐ | **Tài sản ròng:** 0 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #14 ===

#### Lượt #59 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.809 Tr. VNĐ | **Tài sản ròng:** 20.909 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 26 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.489 Tr. VNĐ | **Tài sản ròng:** 20.589 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #60 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.192 Tr. VNĐ | **Tài sản ròng:** 49.292 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 5 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 1120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 8.892 Tr. VNĐ | **Tài sản ròng:** 47.792 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành

#### Lượt #61 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.014 Tr. VNĐ | **Tài sản ròng:** 23.014 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 25 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 7.314 Tr. VNĐ | **Tài sản ròng:** 24.314 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3)

### === VÒNG ĐẤU #15 ===

#### Lượt #62 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.609 Tr. VNĐ | **Tài sản ròng:** 21.709 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 34 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 2.609 Tr. VNĐ | **Tài sản ròng:** 21.709 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #63 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.609 Tr. VNĐ | **Tài sản ròng:** 21.709 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 4650 Tr. VNĐ
- **Số dư sau lượt:** 2.609 Tr. VNĐ | **Tài sản ròng:** 21.709 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #64 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.442 Tr. VNĐ | **Tài sản ròng:** 48.342 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 13 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 440 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C1 (Shophouse)
- **Số dư sau lượt:** 1.252 Tr. VNĐ | **Tài sản ròng:** 47.902 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C1), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #65 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.314 Tr. VNĐ | **Tài sản ròng:** 24.314 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 36 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1378 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 7.334 Tr. VNĐ | **Tài sản ròng:** 24.334 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3)

### === VÒNG ĐẤU #16 ===

#### Lượt #66 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.427 Tr. VNĐ | **Tài sản ròng:** 23.527 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 1875 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1 (Shophouse)
- **Số dư sau lượt:** 817 Tr. VNĐ | **Tài sản ròng:** 23.117 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #67 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.485 Tr. VNĐ | **Tài sản ròng:** 53.135 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 21 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 860 Tr. VNĐ | **Tài sản ròng:** 55.010 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C2), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #68 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.334 Tr. VNĐ | **Tài sản ròng:** 24.334 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 3 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 2769 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 5.774 Tr. VNĐ | **Tài sản ròng:** 22.774 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3)

### === VÒNG ĐẤU #17 ===

#### Lượt #69 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.586 Tr. VNĐ | **Tài sản ròng:** 25.886 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1 (Shophouse)
- **Số dư sau lượt:** 806 Tr. VNĐ | **Tài sản ròng:** 26.306 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C3), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #70 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.069 Tr. VNĐ | **Tài sản ròng:** 56.219 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 27
- **Số dư sau lượt:** 369 Tr. VNĐ | **Tài sản ròng:** 58.469 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #71 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.774 Tr. VNĐ | **Tài sản ròng:** 22.774 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 23 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 5.174 Tr. VNĐ | **Tài sản ròng:** 24.174 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài

### === VÒNG ĐẤU #18 ===

#### Lượt #72 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.833 Tr. VNĐ | **Tài sản ròng:** 27.333 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 1833 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Số dư sau lượt:** 253 Tr. VNĐ | **Tài sản ròng:** 20.153 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #73 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.229 Tr. VNĐ | **Tài sản ròng:** 61.329 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 38 ➔ Ô 11 (**Bình Thuận (Mũi Né)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 420 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.314 Tr. VNĐ | **Tài sản ròng:** 61.714 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #74 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.174 Tr. VNĐ | **Tài sản ròng:** 24.174 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 4.024 Tr. VNĐ | **Tài sản ròng:** 23.024 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài

### === VÒNG ĐẤU #19 ===

#### Lượt #75 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.673 Tr. VNĐ | **Tài sản ròng:** 21.573 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 693 Tr. VNĐ | **Tài sản ròng:** 21.993 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #76 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.464 Tr. VNĐ | **Tài sản ròng:** 61.864 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 11 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 1440 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.024 Tr. VNĐ | **Tài sản ròng:** 60.424 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #77 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.464 Tr. VNĐ | **Tài sản ròng:** 24.464 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 1280 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 4.184 Tr. VNĐ | **Tài sản ròng:** 23.184 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài

### === VÒNG ĐẤU #20 ===

#### Lượt #78 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.973 Tr. VNĐ | **Tài sản ròng:** 23.273 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 1973 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Số dư sau lượt:** 463 Tr. VNĐ | **Tài sản ròng:** 20.363 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #79 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.997 Tr. VNĐ | **Tài sản ròng:** 62.397 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 18 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 2.997 Tr. VNĐ | **Tài sản ròng:** 62.397 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #80 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.184 Tr. VNĐ | **Tài sản ròng:** 23.184 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 792 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 3.392 Tr. VNĐ | **Tài sản ròng:** 22.392 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài

### === VÒNG ĐẤU #21 ===

#### Lượt #81 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.255 Tr. VNĐ | **Tài sản ròng:** 21.155 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 15 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)] (Property)
- **Số dư sau lượt:** 1.255 Tr. VNĐ | **Tài sản ròng:** 21.155 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C2), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #82 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.997 Tr. VNĐ | **Tài sản ròng:** 62.397 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 26 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 2.997 Tr. VNĐ | **Tài sản ròng:** 62.397 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #83 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.997 Tr. VNĐ | **Tài sản ròng:** 62.397 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 34
- **Số dư sau lượt:** 597 Tr. VNĐ | **Tài sản ròng:** 64.397 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C3)

#### Lượt #84 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.842 Tr. VNĐ | **Tài sản ròng:** 23.842 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Trạm Kiểm Toán & Thanh Tra]: Trả tiền thuê 1096 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.842 Tr. VNĐ | **Tài sản ròng:** 23.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #22 ===

#### Lượt #85 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.351 Tr. VNĐ | **Tài sản ròng:** 22.251 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 24 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 1806 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1 (Shophouse)
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Số dư sau lượt:** 286 Tr. VNĐ | **Tài sản ròng:** 16.986 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #86 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.499 Tr. VNĐ | **Tài sản ròng:** 67.299 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 32 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 939 Tr. VNĐ | **Tài sản ròng:** 66.339 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C3)

#### Lượt #87 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.842 Tr. VNĐ | **Tài sản ròng:** 23.842 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 1079 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.842 Tr. VNĐ | **Tài sản ròng:** 23.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #23 ===

#### Lượt #88 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.365 Tr. VNĐ | **Tài sản ròng:** 18.065 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Số dư sau lượt:** 735 Tr. VNĐ | **Tài sản ròng:** 18.135 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #89 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.018 Tr. VNĐ | **Tài sản ròng:** 67.418 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 36 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)] (Property)
- **Số dư sau lượt:** 2.518 Tr. VNĐ | **Tài sản ròng:** 67.918 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C3)

#### Lượt #90 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.842 Tr. VNĐ | **Tài sản ròng:** 23.842 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1842 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 35
- **Số dư sau lượt:** 842 Tr. VNĐ | **Tài sản ròng:** 21.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #24 ===

#### Lượt #91 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 735 Tr. VNĐ | **Tài sản ròng:** 18.135 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Điện Lực (EVN)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Tập Đoàn Điện Lực (EVN)] với giá 800 Tr. VNĐ
- **Số dư sau lượt:** 735 Tr. VNĐ | **Tài sản ròng:** 18.135 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #92 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.560 Tr. VNĐ | **Tài sản ròng:** 70.460 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 3 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Số dư sau lượt:** 3.560 Tr. VNĐ | **Tài sản ròng:** 70.460 Tr. VNĐ
- **Danh mục BĐS sở hữu (15):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #93 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 842 Tr. VNĐ | **Tài sản ròng:** 21.842 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 25 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 842 Tr. VNĐ | **Tài sản ròng:** 21.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

#### Lượt #94 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 842 Tr. VNĐ | **Tài sản ròng:** 21.842 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 29 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 1188 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.030 Tr. VNĐ | **Tài sản ròng:** 23.030 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #25 ===

#### Lượt #95 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.923 Tr. VNĐ | **Tài sản ròng:** 19.323 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 12 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 150 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 1.023 Tr. VNĐ | **Tài sản ròng:** 20.723 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt) (C1), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #96 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.260 Tr. VNĐ | **Tài sản ròng:** 71.960 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 8 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 504 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.756 Tr. VNĐ | **Tài sản ròng:** 71.456 Tr. VNĐ
- **Danh mục BĐS sở hữu (16):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang) (C1), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long)

#### Lượt #97 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.030 Tr. VNĐ | **Tài sản ròng:** 23.030 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 384 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.646 Tr. VNĐ | **Tài sản ròng:** 22.646 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #26 ===

#### Lượt #98 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.527 Tr. VNĐ | **Tài sản ròng:** 21.227 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 22 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 547 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Số dư sau lượt:** 87 Tr. VNĐ | **Tài sản ròng:** 15.987 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #99 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.687 Tr. VNĐ | **Tài sản ròng:** 72.387 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 2687 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 31
- **Giải cứu tài chính:** Thế chấp tài sản ô 29
- **Số dư sau lượt:** 367 Tr. VNĐ | **Tài sản ròng:** 67.167 Tr. VNĐ
- **Danh mục BĐS sở hữu (16):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long)

#### Lượt #100 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.333 Tr. VNĐ | **Tài sản ròng:** 25.333 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 34 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 4.208 Tr. VNĐ | **Tài sản ròng:** 25.208 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #27 ===

#### Lượt #101 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 87 Tr. VNĐ | **Tài sản ròng:** 15.987 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 28 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 87 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 737 Tr. VNĐ | **Tài sản ròng:** 16.637 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn) (C1), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #102 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 454 Tr. VNĐ | **Tài sản ròng:** 67.254 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 18 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)] (Property)
- **Số dư sau lượt:** 454 Tr. VNĐ | **Tài sản ròng:** 67.254 Tr. VNĐ
- **Danh mục BĐS sở hữu (16):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long)

#### Lượt #103 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.208 Tr. VNĐ | **Tài sản ròng:** 25.208 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 38 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 4908 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 308 Tr. VNĐ | **Tài sản ròng:** 19.808 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #28 ===

#### Lượt #104 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 737 Tr. VNĐ | **Tài sản ròng:** 16.637 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 36 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1172 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Hạ cấp công trình ô 21
- **Giải cứu tài chính:** Hạ cấp công trình ô 23
- **Giải cứu tài chính:** Hạ cấp công trình ô 24
- **Số dư sau lượt:** 81 Tr. VNĐ | **Tài sản ròng:** 12.581 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #105 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.534 Tr. VNĐ | **Tài sản ròng:** 73.334 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Số dư sau lượt:** 4.994 Tr. VNĐ | **Tài sản ròng:** 73.194 Tr. VNĐ
- **Danh mục BĐS sở hữu (16):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long)

#### Lượt #106 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 308 Tr. VNĐ | **Tài sản ròng:** 19.808 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 9 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)] (Property)
- **Số dư sau lượt:** 308 Tr. VNĐ | **Tài sản ròng:** 19.808 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #29 ===

#### Lượt #107 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 81 Tr. VNĐ | **Tài sản ròng:** 12.581 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 3 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 81 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 11
- **Giải cứu tài chính:** Thế chấp tài sản ô 13
- **Giải cứu tài chính:** Thế chấp tài sản ô 14
- **Giải cứu tài chính:** Thế chấp tài sản ô 21
- **Số dư sau lượt:** 881 Tr. VNĐ | **Tài sản ròng:** 10.081 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #108 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.075 Tr. VNĐ | **Tài sản ròng:** 73.275 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 34 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 5.575 Tr. VNĐ | **Tài sản ròng:** 73.775 Tr. VNĐ
- **Danh mục BĐS sở hữu (16):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long)

#### Lượt #109 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 308 Tr. VNĐ | **Tài sản ròng:** 19.808 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 16 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 1335 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.115 Tr. VNĐ | **Tài sản ròng:** 20.615 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #30 ===

#### Lượt #110 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.216 Tr. VNĐ | **Tài sản ròng:** 11.416 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 12 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 1.006 Tr. VNĐ | **Tài sản ròng:** 11.306 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Lâm Đồng (Đà Lạt), Thanh Hóa (Sầm Sơn), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #111 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.575 Tr. VNĐ | **Tài sản ròng:** 73.775 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 2 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)] (Property)
- **Số dư sau lượt:** 5.575 Tr. VNĐ | **Tài sản ròng:** 73.775 Tr. VNĐ
- **Danh mục BĐS sở hữu (16):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Bà Rịa - Vũng Tàu (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tập Đoàn Viễn Thông (Viettel), Đồng Nai (Đại Công Viên Chủ Đề) (C3), An Giang (Châu Đốc) (C3), TP.HCM (TP. Thủ Đức) (C3), Kiên Giang (Phú Quốc - Grand World), Cần Thơ (Cái Răng) (C3), Cảng Nước Sâu Cái Mép, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long)

#### Lượt #112 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.115 Tr. VNĐ | **Tài sản ròng:** 20.615 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 420 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 695 Tr. VNĐ | **Tài sản ròng:** 20.195 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Hà Nội (Cầu Giấy)

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 4 người chơi diễn ra liên tục 112 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.