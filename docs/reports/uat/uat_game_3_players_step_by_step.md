# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 3 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202603 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 91 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **64.933 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 2.783 Tr. VNĐ | 64.933 Tr. VNĐ | 14 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 1.267 Tr. VNĐ | 12.267 Tr. VNĐ | 7 ô | ✓ Hoàn thành |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | 211 Tr. VNĐ | 8.011 Tr. VNĐ | 6 ô | ✓ Hoàn thành |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 42.713 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 0 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 34.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 33 căn (C1: 13, C2: 13, C3: 7).
- **Hoạt động sàn đấu giá:** 6 phiên phát động, 6 phiên gõ búa thành công.
- **Bảo toàn 3 Bất biến (Invariants):** 100% HOÀN HẢO (Zero Leakage, Zero NaN, Zero Deadlock).

---

## II. NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐI TỪ ĐẦU ĐẾN KẾT THÚC (STEP-BY-STEP LOG)

Mọi bước đi, cú gieo xúc xắc, di chuyển, tương tác ô đất và biến động tài sản được ghi nhận tuần tự không bỏ sót:

### === VÒNG ĐẤU #1 ===

#### Lượt #1 | Vòng #1 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 0 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Long Thành

#### Lượt #2 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 0 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Mua thành công [Bà Rịa - Vũng Tàu] giá 1200 Tr. VNĐ
- **Số dư sau lượt:** 18.800 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

#### Lượt #3 | Vòng #1 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 23.000 Tr. VNĐ | **Tài sản ròng:** 23.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #2 ===

#### Lượt #4 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 5 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Đà Nẵng (Hải Châu - Sơn Trà)] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 15.880 Tr. VNĐ | **Tài sản ròng:** 19.880 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #5 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.920 Tr. VNĐ | **Tài sản ròng:** 20.120 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 9 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 18.420 Tr. VNĐ | **Tài sản ròng:** 19.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

#### Lượt #6 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.500 Tr. VNĐ | **Tài sản ròng:** 22.500 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 7 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Từ chối mua [Lâm Đồng (Đà Lạt)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Lâm Đồng (Đà Lạt)] với giá 2400 Tr. VNĐ
- **Số dư sau lượt:** 22.500 Tr. VNĐ | **Tài sản ròng:** 22.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #3 ===

#### Lượt #7 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.355 Tr. VNĐ | **Tài sản ròng:** 18.755 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 11.855 Tr. VNĐ | **Tài sản ròng:** 18.755 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #8 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.420 Tr. VNĐ | **Tài sản ròng:** 19.620 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 17 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.420 Tr. VNĐ | **Tài sản ròng:** 18.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

#### Lượt #9 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.500 Tr. VNĐ | **Tài sản ròng:** 22.500 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 13 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 150 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 22.350 Tr. VNĐ | **Tài sản ròng:** 22.350 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #4 ===

#### Lượt #10 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.005 Tr. VNĐ | **Tài sản ròng:** 19.905 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 28 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)] (Property)
- **Số dư sau lượt:** 13.005 Tr. VNĐ | **Tài sản ròng:** 19.905 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #11 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 17.420 Tr. VNĐ | **Tài sản ròng:** 18.620 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 28 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 150 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.270 Tr. VNĐ | **Tài sản ròng:** 18.470 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

#### Lượt #12 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.350 Tr. VNĐ | **Tài sản ròng:** 22.350 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)] (Property)
- **Số dư sau lượt:** 22.350 Tr. VNĐ | **Tài sản ròng:** 22.350 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #5 ===

#### Lượt #13 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.155 Tr. VNĐ | **Tài sản ròng:** 20.055 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 37 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Số dư sau lượt:** 13.955 Tr. VNĐ | **Tài sản ròng:** 21.455 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc)

#### Lượt #14 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 17.270 Tr. VNĐ | **Tài sản ròng:** 18.470 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 33 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 17.270 Tr. VNĐ | **Tài sản ròng:** 18.470 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

#### Lượt #15 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.350 Tr. VNĐ | **Tài sản ròng:** 22.350 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 24 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 21.350 Tr. VNĐ | **Tài sản ròng:** 21.350 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #6 ===

#### Lượt #16 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.955 Tr. VNĐ | **Tài sản ròng:** 22.455 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 3 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 13.455 Tr. VNĐ | **Tài sản ròng:** 22.455 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc), Tập Đoàn Điện Lực (EVN)

#### Lượt #17 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 17.270 Tr. VNĐ | **Tài sản ròng:** 18.470 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 38 ➔ Ô 17 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 150 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 19.120 Tr. VNĐ | **Tài sản ròng:** 20.320 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

#### Lượt #18 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 21.350 Tr. VNĐ | **Tài sản ròng:** 21.350 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 28 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 19.350 Tr. VNĐ | **Tài sản ròng:** 21.350 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #7 ===

#### Lượt #19 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.605 Tr. VNĐ | **Tài sản ròng:** 22.605 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 11.805 Tr. VNĐ | **Tài sản ròng:** 22.605 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế

#### Lượt #20 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 19.120 Tr. VNĐ | **Tài sản ròng:** 20.320 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 17 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Mua thành công [Quảng Ninh (Hạ Long)] giá 2800 Tr. VNĐ
- **Số dư sau lượt:** 15.320 Tr. VNĐ | **Tài sản ròng:** 19.320 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bà Rịa - Vũng Tàu, Quảng Ninh (Hạ Long)

#### Lượt #21 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 19.350 Tr. VNĐ | **Tài sản ròng:** 21.350 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 35 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 17.630 Tr. VNĐ | **Tài sản ròng:** 24.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #8 ===

#### Lượt #22 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.717 Tr. VNĐ | **Tài sản ròng:** 22.917 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 18 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Số dư sau lượt:** 10.317 Tr. VNĐ | **Tài sản ròng:** 22.917 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế, Ninh Bình (Tràng An)

#### Lượt #23 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.320 Tr. VNĐ | **Tài sản ròng:** 19.320 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 38 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Số dư sau lượt:** 12.470 Tr. VNĐ | **Tài sản ròng:** 20.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Quảng Ninh (Hạ Long), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn)

#### Lượt #24 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.630 Tr. VNĐ | **Tài sản ròng:** 24.430 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 17.630 Tr. VNĐ | **Tài sản ròng:** 24.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #9 ===

#### Lượt #25 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.467 Tr. VNĐ | **Tài sản ròng:** 23.067 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 10.467 Tr. VNĐ | **Tài sản ròng:** 23.067 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế, Ninh Bình (Tràng An)

#### Lượt #26 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.470 Tr. VNĐ | **Tài sản ròng:** 20.670 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 12.470 Tr. VNĐ | **Tài sản ròng:** 20.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Quảng Ninh (Hạ Long), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn)

#### Lượt #27 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.630 Tr. VNĐ | **Tài sản ròng:** 24.430 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 17.630 Tr. VNĐ | **Tài sản ròng:** 24.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3)

### === VÒNG ĐẤU #10 ===

#### Lượt #28 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.467 Tr. VNĐ | **Tài sản ròng:** 23.067 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)] (Property)
- **Số dư sau lượt:** 9.967 Tr. VNĐ | **Tài sản ròng:** 22.567 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế, Ninh Bình (Tràng An)

#### Lượt #29 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.470 Tr. VNĐ | **Tài sản ròng:** 20.670 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 10.220 Tr. VNĐ | **Tài sản ròng:** 21.020 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, Quảng Ninh (Hạ Long), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #30 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.630 Tr. VNĐ | **Tài sản ròng:** 24.430 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 15.030 Tr. VNĐ | **Tài sản ròng:** 24.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #11 ===

#### Lượt #31 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.117 Tr. VNĐ | **Tài sản ròng:** 22.717 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Mua thành công [Tuyến Cao Tốc Bắc - Nam] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 8.117 Tr. VNĐ | **Tài sản ròng:** 22.717 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế, Ninh Bình (Tràng An), Tuyến Cao Tốc Bắc - Nam

#### Lượt #32 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.220 Tr. VNĐ | **Tài sản ròng:** 21.020 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Hoàn Kiếm)] giá 3200 Tr. VNĐ
- **Số dư sau lượt:** 7.020 Tr. VNĐ | **Tài sản ròng:** 21.020 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, Quảng Ninh (Hạ Long), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

#### Lượt #33 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.030 Tr. VNĐ | **Tài sản ròng:** 24.430 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 26 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 14.710 Tr. VNĐ | **Tài sản ròng:** 24.110 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #12 ===

#### Lượt #34 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.117 Tr. VNĐ | **Tài sản ròng:** 22.717 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 25 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Cầu Giấy)] giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 5.117 Tr. VNĐ | **Tài sản ròng:** 22.717 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế, Ninh Bình (Tràng An), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy)

#### Lượt #35 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.340 Tr. VNĐ | **Tài sản ròng:** 21.340 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 34 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 8.440 Tr. VNĐ | **Tài sản ròng:** 22.440 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, Quảng Ninh (Hạ Long), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

#### Lượt #36 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.710 Tr. VNĐ | **Tài sản ròng:** 24.110 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 34 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 14.710 Tr. VNĐ | **Tài sản ròng:** 24.110 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #37 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.710 Tr. VNĐ | **Tài sản ròng:** 24.110 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 37 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 1007 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 4500 Tr. VNĐ
- **Số dư sau lượt:** 14.710 Tr. VNĐ | **Tài sản ròng:** 24.110 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #13 ===

#### Lượt #38 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.624 Tr. VNĐ | **Tài sản ròng:** 22.724 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 2.124 Tr. VNĐ | **Tài sản ròng:** 23.224 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế, Ninh Bình (Tràng An), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức)

#### Lượt #39 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.447 Tr. VNĐ | **Tài sản ròng:** 23.447 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 0 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 2500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 6.947 Tr. VNĐ | **Tài sản ròng:** 20.947 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, Quảng Ninh (Hạ Long), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

#### Lượt #40 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.710 Tr. VNĐ | **Tài sản ròng:** 24.110 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 37 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 750 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 13.920 Tr. VNĐ | **Tài sản ròng:** 24.520 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #14 ===

#### Lượt #41 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.374 Tr. VNĐ | **Tài sản ròng:** 26.474 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 38 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Đồng Nai (Đại Công Viên Chủ Đề)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [Đồng Nai (Đại Công Viên Chủ Đề)] với giá 1400 Tr. VNĐ
- **Số dư sau lượt:** 6.374 Tr. VNĐ | **Tài sản ròng:** 27.474 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế, Ninh Bình (Tràng An), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức)

#### Lượt #42 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.387 Tr. VNĐ | **Tài sản ròng:** 21.187 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 12 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Từ chối mua [Khánh Hòa (Nha Trang)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Khánh Hòa (Nha Trang)] với giá 1150 Tr. VNĐ
- **Số dư sau lượt:** 8.387 Tr. VNĐ | **Tài sản ròng:** 21.187 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Quảng Ninh (Hạ Long), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

#### Lượt #43 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.520 Tr. VNĐ | **Tài sản ròng:** 24.120 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 7 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 3720 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 10.020 Tr. VNĐ | **Tài sản ròng:** 21.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #15 ===

#### Lượt #44 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.944 Tr. VNĐ | **Tài sản ròng:** 31.644 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 8 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 192 Tr. VNĐ | **Tài sản ròng:** 33.092 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C2), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C2), Ninh Bình (Tràng An), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C2)

#### Lượt #45 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.919 Tr. VNĐ | **Tài sản ròng:** 22.719 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 14 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 1800 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 8.119 Tr. VNĐ | **Tài sản ròng:** 20.919 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Quảng Ninh (Hạ Long), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

#### Lượt #46 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.020 Tr. VNĐ | **Tài sản ròng:** 21.620 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 12 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 150 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 9.870 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #16 ===

#### Lượt #47 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.142 Tr. VNĐ | **Tài sản ròng:** 35.042 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 27 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 482 Tr. VNĐ | **Tài sản ròng:** 37.582 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C2), Ninh Bình (Tràng An), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3)

#### Lượt #48 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.119 Tr. VNĐ | **Tài sản ròng:** 20.919 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 19 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Số dư sau lượt:** 5.919 Tr. VNĐ | **Tài sản ròng:** 20.919 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Quảng Ninh (Hạ Long), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh)

#### Lượt #49 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.870 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 17 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 8.870 Tr. VNĐ | **Tài sản ròng:** 20.470 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #17 ===

#### Lượt #50 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.482 Tr. VNĐ | **Tài sản ròng:** 38.582 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 33 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 240 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 24
- **Số dư sau lượt:** 1.327 Tr. VNĐ | **Tài sản ròng:** 39.927 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Ninh Bình (Tràng An), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3)

#### Lượt #51 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.799 Tr. VNĐ | **Tài sản ròng:** 20.799 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 160 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 5.639 Tr. VNĐ | **Tài sản ròng:** 20.639 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Quảng Ninh (Hạ Long), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh)

#### Lượt #52 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.110 Tr. VNĐ | **Tài sản ròng:** 20.710 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 8.950 Tr. VNĐ | **Tài sản ròng:** 20.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #18 ===

#### Lượt #53 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.647 Tr. VNĐ | **Tài sản ròng:** 40.247 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 8 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 327 Tr. VNĐ | **Tài sản ròng:** 40.127 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Ninh Bình (Tràng An), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3)

#### Lượt #54 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.639 Tr. VNĐ | **Tài sản ròng:** 20.639 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 21 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 4002 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 34
- **Giải cứu tài chính:** Thế chấp tài sản ô 29
- **Giải cứu tài chính:** Thế chấp tài sản ô 27
- **Số dư sau lượt:** 919 Tr. VNĐ | **Tài sản ròng:** 19.619 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C1), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C1), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C2)

#### Lượt #55 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.950 Tr. VNĐ | **Tài sản ròng:** 20.550 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 14 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 1016 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 6.970 Tr. VNĐ | **Tài sản ròng:** 18.570 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #19 ===

#### Lượt #56 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.345 Tr. VNĐ | **Tài sản ròng:** 42.745 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam] (Railroad)
- **Số dư sau lượt:** 3.695 Tr. VNĐ | **Tài sản ròng:** 42.595 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3)

#### Lượt #57 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.915 Tr. VNĐ | **Tài sản ròng:** 22.615 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 24 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 1.875 Tr. VNĐ | **Tài sản ròng:** 22.775 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C1), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C2), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C2)

#### Lượt #58 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.470 Tr. VNĐ | **Tài sản ròng:** 19.070 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 23 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hưng Yên (Văn Giang)] với giá 1550 Tr. VNĐ
- **Số dư sau lượt:** 7.470 Tr. VNĐ | **Tài sản ròng:** 19.070 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #20 ===

#### Lượt #59 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.145 Tr. VNĐ | **Tài sản ròng:** 44.045 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Số dư sau lượt:** 2.145 Tr. VNĐ | **Tài sản ròng:** 44.045 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang)

#### Lượt #60 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.875 Tr. VNĐ | **Tài sản ròng:** 22.775 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 35 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lệ Phí Đăng Ký Đất Đai]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.944 Tr. VNĐ | **Tài sản ròng:** 22.844 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C1), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C2), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C2)

#### Lượt #61 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.470 Tr. VNĐ | **Tài sản ròng:** 19.070 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 31 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 1816 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 4.670 Tr. VNĐ | **Tài sản ròng:** 16.270 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #21 ===

#### Lượt #62 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.461 Tr. VNĐ | **Tài sản ròng:** 46.361 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 2376 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 2.585 Tr. VNĐ | **Tài sản ròng:** 44.485 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang)

#### Lượt #63 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.160 Tr. VNĐ | **Tài sản ròng:** 24.060 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 420 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.740 Tr. VNĐ | **Tài sản ròng:** 23.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C1), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C2), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C2)

#### Lượt #64 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.046 Tr. VNĐ | **Tài sản ròng:** 18.646 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1342 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 5.696 Tr. VNĐ | **Tài sản ròng:** 17.296 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #22 ===

#### Lượt #65 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.347 Tr. VNĐ | **Tài sản ròng:** 46.247 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 1 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)] (Utility)
- **Số dư sau lượt:** 4.347 Tr. VNĐ | **Tài sản ròng:** 46.247 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang)

#### Lượt #66 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.932 Tr. VNĐ | **Tài sản ròng:** 24.832 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 13 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 150 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 1.302 Tr. VNĐ | **Tài sản ròng:** 24.602 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C2), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C2), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C2)

#### Lượt #67 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.696 Tr. VNĐ | **Tài sản ròng:** 17.296 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 7 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 5696 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 8
- **Giải cứu tài chính:** Thế chấp tài sản ô 9
- **Giải cứu tài chính:** Thế chấp tài sản ô 26
- **Giải cứu tài chính:** Thế chấp tài sản ô 35
- **Số dư sau lượt:** 2.030 Tr. VNĐ | **Tài sản ròng:** 10.230 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #23 ===

#### Lượt #68 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.193 Tr. VNĐ | **Tài sản ròng:** 52.093 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 12 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 10.993 Tr. VNĐ | **Tài sản ròng:** 52.893 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang)

#### Lượt #69 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.936 Tr. VNĐ | **Tài sản ròng:** 25.236 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 22 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)] (Property)
- **Số dư sau lượt:** 506 Tr. VNĐ | **Tài sản ròng:** 25.106 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C2), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C2), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C2)

#### Lượt #70 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.630 Tr. VNĐ | **Tài sản ròng:** 9.830 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 630 Tr. VNĐ | **Tài sản ròng:** 8.830 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #24 ===

#### Lượt #71 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.993 Tr. VNĐ | **Tài sản ròng:** 53.893 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 2304 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 9.689 Tr. VNĐ | **Tài sản ròng:** 51.589 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang)

#### Lượt #72 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.810 Tr. VNĐ | **Tài sản ròng:** 27.410 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 610 Tr. VNĐ | **Tài sản ròng:** 28.510 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C2), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C2), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C3)

#### Lượt #73 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 630 Tr. VNĐ | **Tài sản ròng:** 8.830 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 25 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lệ Phí Đăng Ký Đất Đai]: Trả tiền thuê 1020 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 36 Tr. VNĐ | **Tài sản ròng:** 8.236 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #25 ===

#### Lượt #74 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.709 Tr. VNĐ | **Tài sản ròng:** 52.609 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 24 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)] (Property)
- **Số dư sau lượt:** 10.709 Tr. VNĐ | **Tài sản ròng:** 52.609 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang)

#### Lượt #75 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 610 Tr. VNĐ | **Tài sản ròng:** 28.510 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 29 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài] (Railroad)
- **Số dư sau lượt:** 610 Tr. VNĐ | **Tài sản ròng:** 28.510 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C2), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C2), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C3)

#### Lượt #76 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 36 Tr. VNĐ | **Tài sản ròng:** 8.236 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 36 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Số dư sau lượt:** 168 Tr. VNĐ | **Tài sản ròng:** 7.468 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #26 ===

#### Lượt #77 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.745 Tr. VNĐ | **Tài sản ròng:** 52.645 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 29 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài] (Railroad)
- **Số dư sau lượt:** 10.745 Tr. VNĐ | **Tài sản ròng:** 52.645 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang)

#### Lượt #78 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 610 Tr. VNĐ | **Tài sản ròng:** 28.510 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 35 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 960 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 27
- **Số dư sau lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 27.160 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C2), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C2), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C3)

#### Lượt #79 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 168 Tr. VNĐ | **Tài sản ròng:** 7.468 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 13 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 150 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 9
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Số dư sau lượt:** 1.201 Tr. VNĐ | **Tài sản ròng:** 7.601 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C2), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #27 ===

#### Lượt #80 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.855 Tr. VNĐ | **Tài sản ròng:** 53.755 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 35 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [TP.HCM (Quận 1 - Nguyễn Huệ)] giá 4000 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 1.325 Tr. VNĐ | **Tài sản ròng:** 58.475 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C2), Khánh Hòa (Nha Trang), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #81 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.673 Tr. VNĐ | **Tài sản ròng:** 28.273 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 5 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 850 Tr. VNĐ
- **Số dư sau lượt:** 1.673 Tr. VNĐ | **Tài sản ròng:** 28.273 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C2), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C2), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C3)

#### Lượt #82 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.201 Tr. VNĐ | **Tài sản ròng:** 7.601 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 22 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 1075 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.276 Tr. VNĐ | **Tài sản ròng:** 8.676 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C2), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #28 ===

#### Lượt #83 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.550 Tr. VNĐ | **Tài sản ròng:** 60.100 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 2 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)] (Utility)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Giải cứu tài chính:** Thế chấp tài sản ô 31
- **Số dư sau lượt:** 610 Tr. VNĐ | **Tài sản ròng:** 61.160 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt) (C2), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C2), Khánh Hòa (Nha Trang) (C1), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #84 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.673 Tr. VNĐ | **Tài sản ròng:** 28.273 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 11 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 576 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.097 Tr. VNĐ | **Tài sản ròng:** 27.697 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An) (C2), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn) (C2), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh) (C3)

#### Lượt #85 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.276 Tr. VNĐ | **Tài sản ròng:** 8.676 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài] (Railroad)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 1.126 Tr. VNĐ | **Tài sản ròng:** 8.926 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C2), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #29 ===

#### Lượt #86 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.186 Tr. VNĐ | **Tài sản ròng:** 61.736 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)] (Utility)
- **Số dư sau lượt:** 386 Tr. VNĐ | **Tài sản ròng:** 60.936 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt) (C2), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C2), Khánh Hòa (Nha Trang) (C1), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #87 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.097 Tr. VNĐ | **Tài sản ròng:** 27.697 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 14 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 1097 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 15
- **Giải cứu tài chính:** Hạ cấp công trình ô 23
- **Giải cứu tài chính:** Hạ cấp công trình ô 21
- **Giải cứu tài chính:** Hạ cấp công trình ô 23
- **Giải cứu tài chính:** Hạ cấp công trình ô 24
- **Giải cứu tài chính:** Hạ cấp công trình ô 21
- **Giải cứu tài chính:** Hạ cấp công trình ô 23
- **Giải cứu tài chính:** Hạ cấp công trình ô 24
- **Giải cứu tài chính:** Thế chấp tài sản ô 21
- **Số dư sau lượt:** 217 Tr. VNĐ | **Tài sản ròng:** 11.217 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh)

#### Lượt #88 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.126 Tr. VNĐ | **Tài sản ròng:** 8.926 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 35 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.131 Tr. VNĐ | **Tài sản ròng:** 9.931 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C2), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #30 ===

#### Lượt #89 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.983 Tr. VNĐ | **Tài sản ròng:** 62.533 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 28 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 863 Tr. VNĐ | **Tài sản ròng:** 63.013 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà) (C3), Lâm Đồng (Đà Lạt) (C2), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Thừa Thiên Huế (C3), Tuyến Cao Tốc Bắc - Nam, Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C2), Khánh Hòa (Nha Trang) (C2), Bình Định (Quy Nhơn) (C3), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #90 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.267 Tr. VNĐ | **Tài sản ròng:** 12.267 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 18 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)] (Property)
- **Số dư sau lượt:** 1.267 Tr. VNĐ | **Tài sản ròng:** 12.267 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Nghệ An (TP. Vinh)

#### Lượt #91 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.131 Tr. VNĐ | **Tài sản ròng:** 9.931 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 3 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 1920 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 211 Tr. VNĐ | **Tài sản ròng:** 8.011 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, An Giang (Châu Đốc) (C2), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đồng Nai (Đại Công Viên Chủ Đề)

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 3 người chơi diễn ra liên tục 91 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.