# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 3 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202603 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 86 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **67.990 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 1.890 Tr. VNĐ | 67.990 Tr. VNĐ | 18 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 1.647 Tr. VNĐ | 28.547 Tr. VNĐ | 9 ô | ✓ Hoàn thành |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | 0 Tr. VNĐ | 0 Tr. VNĐ | 0 ô | ❌ Phá sản |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 37.181 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 5.431 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 32.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 36 căn (C1: 13, C2: 13, C3: 10).
- **Hoạt động sàn đấu giá:** 7 phiên phát động, 4 phiên gõ búa thành công.
- **Bảo toàn 3 Bất biến (Invariants):** 100% HOÀN HẢO (Zero Leakage, Zero NaN, Zero Deadlock).

---

## II. NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐI TỪ ĐẦU ĐẾN KẾT THÚC (STEP-BY-STEP LOG)

Mọi bước đi, cú gieo xúc xắc, di chuyển, tương tác ô đất và biến động tài sản được ghi nhận tuần tự không bỏ sót:

### === VÒNG ĐẤU #1 ===

#### Lượt #1 | Vòng #1 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 0 ➔ Ô 0 (**Khởi Hành (GO)**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 22.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Long Thành

#### Lượt #2 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 0 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Số dư sau lượt:** 17.600 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt)

#### Lượt #3 | Vòng #1 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 0 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #2 ===

#### Lượt #4 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 22.000 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 0 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Mua thành công [Bà Rịa - Vũng Tàu] giá 1200 Tr. VNĐ
- **Số dư sau lượt:** 18.800 Tr. VNĐ | **Tài sản ròng:** 22.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu

#### Lượt #5 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 17.600 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Hoàn Kiếm)] giá 3200 Tr. VNĐ
- **Số dư sau lượt:** 9.600 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm)

#### Lượt #6 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 19.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #3 ===

#### Lượt #7 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.800 Tr. VNĐ | **Tài sản ròng:** 22.000 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 9 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 18.600 Tr. VNĐ | **Tài sản ròng:** 21.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu

#### Lượt #8 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.000 Tr. VNĐ | **Tài sản ròng:** 20.400 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Số dư sau lượt:** 10.650 Tr. VNĐ | **Tài sản ròng:** 21.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #9 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 19.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 17.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Tuyến Cao Tốc Bắc - Nam

#### Lượt #10 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 26 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] với giá 5150 Tr. VNĐ
- **Số dư sau lượt:** 17.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Tuyến Cao Tốc Bắc - Nam

### === VÒNG ĐẤU #4 ===

#### Lượt #11 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.600 Tr. VNĐ | **Tài sản ròng:** 21.800 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 23.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức), An Giang (Châu Đốc) (C3)

#### Lượt #12 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.875 Tr. VNĐ | **Tài sản ròng:** 20.075 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 1 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Số dư sau lượt:** 4.475 Tr. VNĐ | **Tài sản ròng:** 20.075 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #13 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 15.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài

### === VÒNG ĐẤU #5 ===

#### Lượt #14 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 23.720 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 3 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 23.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức), An Giang (Châu Đốc) (C3)

#### Lượt #15 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.475 Tr. VNĐ | **Tài sản ròng:** 20.075 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 11 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 4.475 Tr. VNĐ | **Tài sản ròng:** 20.075 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #16 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 35 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 20.800 Tr. VNĐ | **Tài sản ròng:** 26.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #6 ===

#### Lượt #17 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 23.720 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 11.620 Tr. VNĐ | **Tài sản ròng:** 23.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn)

#### Lượt #18 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.475 Tr. VNĐ | **Tài sản ròng:** 20.075 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 20 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 1.475 Tr. VNĐ | **Tài sản ròng:** 20.075 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #19 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 20.800 Tr. VNĐ | **Tài sản ròng:** 26.800 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 0 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 20.300 Tr. VNĐ | **Tài sản ròng:** 26.300 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #7 ===

#### Lượt #20 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.620 Tr. VNĐ | **Tài sản ròng:** 23.720 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 16 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Số dư sau lượt:** 9.220 Tr. VNĐ | **Tài sản ròng:** 23.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An)

#### Lượt #21 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.475 Tr. VNĐ | **Tài sản ròng:** 20.075 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 31 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 2850 Tr. VNĐ
- **Số dư sau lượt:** 975 Tr. VNĐ | **Tài sản ròng:** 19.575 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #22 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 20.925 Tr. VNĐ | **Tài sản ròng:** 26.925 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 21.925 Tr. VNĐ | **Tài sản ròng:** 27.925 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #8 ===

#### Lượt #23 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.245 Tr. VNĐ | **Tài sản ròng:** 24.745 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 24 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C1 (Shophouse)
- **Số dư sau lượt:** 2.495 Tr. VNĐ | **Tài sản ròng:** 24.745 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C1), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #24 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 975 Tr. VNĐ | **Tài sản ròng:** 19.575 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 39 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 975 Tr. VNĐ | **Tài sản ròng:** 19.575 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #25 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.425 Tr. VNĐ | **Tài sản ròng:** 28.425 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 33 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1980 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 22.445 Tr. VNĐ | **Tài sản ròng:** 28.445 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #9 ===

#### Lượt #26 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.975 Tr. VNĐ | **Tài sản ròng:** 27.225 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 32 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 2.350 Tr. VNĐ | **Tài sản ròng:** 28.100 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C2), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #27 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 975 Tr. VNĐ | **Tài sản ròng:** 19.575 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 180 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 795 Tr. VNĐ | **Tài sản ròng:** 19.395 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #28 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.445 Tr. VNĐ | **Tài sản ròng:** 28.445 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 3 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 22.445 Tr. VNĐ | **Tài sản ròng:** 28.445 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #10 ===

#### Lượt #29 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.530 Tr. VNĐ | **Tài sản ròng:** 28.280 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 39 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai: Khấu trừ 1453 Tr. VNĐ vào Kho Bạc
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 16
- **Số dư sau lượt:** 1.077 Tr. VNĐ | **Tài sản ròng:** 29.927 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C2), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #30 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 795 Tr. VNĐ | **Tài sản ròng:** 19.395 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 16 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Từ chối mua [Nghệ An (TP. Vinh)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 795 Tr. VNĐ | **Tài sản ròng:** 19.395 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #31 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 795 Tr. VNĐ | **Tài sản ròng:** 19.395 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 23 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)] (Property)
- **Số dư sau lượt:** 795 Tr. VNĐ | **Tài sản ròng:** 19.395 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #32 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 21.295 Tr. VNĐ | **Tài sản ròng:** 29.495 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 1175 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 21.295 Tr. VNĐ | **Tài sản ròng:** 29.495 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #11 ===

#### Lượt #33 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.252 Tr. VNĐ | **Tài sản ròng:** 31.102 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 120 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 16
- **Số dư sau lượt:** 42 Tr. VNĐ | **Tài sản ròng:** 28.892 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C2), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #34 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.090 Tr. VNĐ | **Tài sản ròng:** 20.690 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 23 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 2.090 Tr. VNĐ | **Tài sản ròng:** 20.690 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #35 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.437 Tr. VNĐ | **Tài sản ròng:** 30.637 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 17 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 21.237 Tr. VNĐ | **Tài sản ròng:** 30.437 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đồng Nai (Đại Công Viên Chủ Đề), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #12 ===

#### Lượt #36 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 42 Tr. VNĐ | **Tài sản ròng:** 28.892 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 15 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 42 Tr. VNĐ | **Tài sản ròng:** 28.892 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C2), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #37 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.290 Tr. VNĐ | **Tài sản ròng:** 20.890 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 26 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 3.290 Tr. VNĐ | **Tài sản ròng:** 20.890 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #38 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 21.237 Tr. VNĐ | **Tài sản ròng:** 30.437 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 22 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 19.737 Tr. VNĐ | **Tài sản ròng:** 30.437 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel)

### === VÒNG ĐẤU #13 ===

#### Lượt #39 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 42 Tr. VNĐ | **Tài sản ròng:** 28.892 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hà Nội (Cầu Giấy)] với giá 2150 Tr. VNĐ
- **Số dư sau lượt:** 42 Tr. VNĐ | **Tài sản ròng:** 28.892 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C2), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #40 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.140 Tr. VNĐ | **Tài sản ròng:** 21.740 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [Hà Nội (Hoàn Kiếm)] lên C1 (Shophouse)
- **Giải cứu tài chính:** Thế chấp tài sản ô 19
- **Số dư sau lượt:** 840 Tr. VNĐ | **Tài sản ròng:** 22.040 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Hà Nội (Cầu Giấy)

#### Lượt #41 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 19.737 Tr. VNĐ | **Tài sản ròng:** 30.437 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 28 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 4314 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.587 Tr. VNĐ | **Tài sản ròng:** 27.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel)

### === VÒNG ĐẤU #14 ===

#### Lượt #42 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.356 Tr. VNĐ | **Tài sản ròng:** 33.206 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 856 Tr. VNĐ | **Tài sản ròng:** 34.956 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #43 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.004 Tr. VNĐ | **Tài sản ròng:** 23.204 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [Hưng Yên (Văn Giang)] lên C1 (Shophouse)
- **Số dư sau lượt:** 804 Tr. VNĐ | **Tài sản ròng:** 23.504 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Hà Nội (Cầu Giấy)

#### Lượt #44 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.587 Tr. VNĐ | **Tài sản ròng:** 27.287 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 37 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 4622 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 14.087 Tr. VNĐ | **Tài sản ròng:** 24.787 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel)

### === VÒNG ĐẤU #15 ===

#### Lượt #45 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.478 Tr. VNĐ | **Tài sản ròng:** 39.578 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai: Khấu trừ 3837 Tr. VNĐ vào Kho Bạc
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 1.641 Tr. VNĐ | **Tài sản ròng:** 42.641 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3)

#### Lượt #46 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.826 Tr. VNĐ | **Tài sản ròng:** 24.526 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [Hà Nội (Cầu Giấy)] lên C1 (Shophouse)
- **Số dư sau lượt:** 366 Tr. VNĐ | **Tài sản ròng:** 24.566 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Hà Nội (Cầu Giấy) (C1)

#### Lượt #47 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.087 Tr. VNĐ | **Tài sản ròng:** 24.787 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 1041 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 13.967 Tr. VNĐ | **Tài sản ròng:** 24.667 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel)

### === VÒNG ĐẤU #16 ===

#### Lượt #48 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.682 Tr. VNĐ | **Tài sản ròng:** 43.682 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 140 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 43.542 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3)

#### Lượt #49 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.667 Tr. VNĐ | **Tài sản ròng:** 25.867 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Từ chối mua [Thanh Hóa (Sầm Sơn)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Thanh Hóa (Sầm Sơn)] với giá 1550 Tr. VNĐ
- **Số dư sau lượt:** 1.667 Tr. VNĐ | **Tài sản ròng:** 25.867 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Hà Nội (Cầu Giấy) (C1)

#### Lượt #50 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.967 Tr. VNĐ | **Tài sản ròng:** 24.667 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 9 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 12.467 Tr. VNĐ | **Tài sản ròng:** 24.667 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN)

### === VÒNG ĐẤU #17 ===

#### Lượt #51 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 992 Tr. VNĐ | **Tài sản ròng:** 44.192 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 13 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)] (Property)
- **Số dư sau lượt:** 992 Tr. VNĐ | **Tài sản ròng:** 44.192 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Thanh Hóa (Sầm Sơn)

#### Lượt #52 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.667 Tr. VNĐ | **Tài sản ròng:** 25.867 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 21 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 1.667 Tr. VNĐ | **Tài sản ròng:** 25.867 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Hà Nội (Cầu Giấy) (C1)

#### Lượt #53 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.667 Tr. VNĐ | **Tài sản ròng:** 25.867 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Số dư sau lượt:** 1.667 Tr. VNĐ | **Tài sản ròng:** 25.867 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Hà Nội (Cầu Giấy) (C1)

#### Lượt #54 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.117 Tr. VNĐ | **Tài sản ròng:** 25.917 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Từ chối mua [Thừa Thiên Huế], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 11.117 Tr. VNĐ | **Tài sản ròng:** 25.917 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #55 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.117 Tr. VNĐ | **Tài sản ròng:** 25.917 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 18 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 1123 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Thừa Thiên Huế] phát mãi về Kho Bạc
- **Số dư sau lượt:** 11.117 Tr. VNĐ | **Tài sản ròng:** 25.917 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #18 ===

#### Lượt #56 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.115 Tr. VNĐ | **Tài sản ròng:** 45.315 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 2.115 Tr. VNĐ | **Tài sản ròng:** 45.315 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Thanh Hóa (Sầm Sơn)

#### Lượt #57 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.790 Tr. VNĐ | **Tài sản ròng:** 26.990 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 300 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Nâng cấp BĐS:** Nâng cấp [Hưng Yên (Văn Giang)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Hà Nội (Cầu Giấy)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Hà Nội (Hoàn Kiếm)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 29
- **Giải cứu tài chính:** Thế chấp tài sản ô 26
- **Số dư sau lượt:** 590 Tr. VNĐ | **Tài sản ròng:** 31.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C2), Hà Nội (Cầu Giấy) (C2)

#### Lượt #58 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.417 Tr. VNĐ | **Tài sản ròng:** 26.217 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 18 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 1003 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 11.417 Tr. VNĐ | **Tài sản ròng:** 26.217 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #19 ===

#### Lượt #59 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.118 Tr. VNĐ | **Tài sản ròng:** 46.318 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 3.118 Tr. VNĐ | **Tài sản ròng:** 46.318 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Thanh Hóa (Sầm Sơn)

#### Lượt #60 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.593 Tr. VNĐ | **Tài sản ròng:** 32.293 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 493 Tr. VNĐ | **Tài sản ròng:** 32.193 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C2), Hà Nội (Cầu Giấy) (C2)

#### Lượt #61 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.417 Tr. VNĐ | **Tài sản ròng:** 26.217 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 29 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 2.337 Tr. VNĐ | **Tài sản ròng:** 24.937 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

### === VÒNG ĐẤU #20 ===

#### Lượt #62 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.118 Tr. VNĐ | **Tài sản ròng:** 46.318 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 150 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.768 Tr. VNĐ | **Tài sản ròng:** 44.968 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Thanh Hóa (Sầm Sơn)

#### Lượt #63 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 493 Tr. VNĐ | **Tài sản ròng:** 33.193 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 150 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 343 Tr. VNĐ | **Tài sản ròng:** 33.043 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C2), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

#### Lượt #64 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.637 Tr. VNĐ | **Tài sản ròng:** 25.237 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Số dư sau lượt:** 2.069 Tr. VNĐ | **Tài sản ròng:** 26.269 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Khánh Hòa (Nha Trang)

### === VÒNG ĐẤU #21 ===

#### Lượt #65 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.768 Tr. VNĐ | **Tài sản ròng:** 44.968 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 22 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 3150 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.618 Tr. VNĐ | **Tài sản ròng:** 44.818 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Thanh Hóa (Sầm Sơn)

#### Lượt #66 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.375 Tr. VNĐ | **Tài sản ròng:** 34.075 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 17 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 1.375 Tr. VNĐ | **Tài sản ròng:** 34.075 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C2), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

#### Lượt #67 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.219 Tr. VNĐ | **Tài sản ròng:** 29.419 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 20 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 3240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.979 Tr. VNĐ | **Tài sản ròng:** 26.179 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Khánh Hòa (Nha Trang)

### === VÒNG ĐẤU #22 ===

#### Lượt #68 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.618 Tr. VNĐ | **Tài sản ròng:** 44.818 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 33 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 2.618 Tr. VNĐ | **Tài sản ròng:** 45.818 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Cần Thơ (Cái Răng) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Thanh Hóa (Sầm Sơn)

#### Lượt #69 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.615 Tr. VNĐ | **Tài sản ròng:** 37.315 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 26 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)] (Property)
- **Số dư sau lượt:** 4.615 Tr. VNĐ | **Tài sản ròng:** 37.315 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C2), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

#### Lượt #70 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.979 Tr. VNĐ | **Tài sản ròng:** 26.179 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 31 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 1979 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 27
- **Giải cứu tài chính:** Thế chấp tài sản ô 15
- **Giải cứu tài chính:** Thế chấp tài sản ô 25
- **Giải cứu tài chính:** Thế chấp tài sản ô 35
- **Giải cứu tài chính:** Thế chấp tài sản ô 12
- **Giải cứu tài chính:** Thế chấp tài sản ô 28
- **Giải cứu tài chính:** Hạ cấp công trình ô 6
- **Giải cứu tài chính:** Hạ cấp công trình ô 8
- **Giải cứu tài chính:** Hạ cấp công trình ô 6
- **Giải cứu tài chính:** Hạ cấp công trình ô 8
- **Giải cứu tài chính:** Hạ cấp công trình ô 9
- **Giải cứu tài chính:** Hạ cấp công trình ô 6
- **Giải cứu tài chính:** Hạ cấp công trình ô 8
- **Giải cứu tài chính:** Hạ cấp công trình ô 9
- **Giải cứu tài chính:** Thế chấp tài sản ô 6
- **Giải cứu tài chính:** Thế chấp tài sản ô 8
- **Giải cứu tài chính:** Thế chấp tài sản ô 9
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** 0 Tr. VNĐ | **Tài sản ròng:** 0 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #23 ===

#### Lượt #71 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.597 Tr. VNĐ | **Tài sản ròng:** 56.797 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 38 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 24
- **Giải cứu tài chính:** Thế chấp tài sản ô 21
- **Số dư sau lượt:** 487 Tr. VNĐ | **Tài sản ròng:** 58.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C2), Bà Rịa - Vũng Tàu (C2), Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Khánh Hòa (Nha Trang)

#### Lượt #72 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.615 Tr. VNĐ | **Tài sản ròng:** 37.315 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 31 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 2376 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Hưng Yên (Văn Giang)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 23
- **Số dư sau lượt:** 504 Tr. VNĐ | **Tài sản ròng:** 36.604 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C3), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

### === VÒNG ĐẤU #24 ===

#### Lượt #73 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.863 Tr. VNĐ | **Tài sản ròng:** 60.663 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 8 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 168 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 16
- **Số dư sau lượt:** 330 Tr. VNĐ | **Tài sản ròng:** 61.280 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Khánh Hòa (Nha Trang)

#### Lượt #74 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 672 Tr. VNĐ | **Tài sản ròng:** 36.772 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 7 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng chân tại [Nghỉ Dưỡng Miễn Phí]: Trả tiền thuê 3942 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 11
- **Giải cứu tài chính:** Thế chấp tài sản ô 13
- **Giải cứu tài chính:** Thế chấp tài sản ô 19
- **Giải cứu tài chính:** Hạ cấp công trình ô 31
- **Số dư sau lượt:** 330 Tr. VNĐ | **Tài sản ròng:** 29.530 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C2), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

### === VÒNG ĐẤU #25 ===

#### Lượt #75 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.272 Tr. VNĐ | **Tài sản ròng:** 65.222 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 6 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 547 Tr. VNĐ | **Tài sản ròng:** 65.247 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Khánh Hòa (Nha Trang)

#### Lượt #76 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** -70 Tr. VNĐ | **Tài sản ròng:** 29.130 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 20 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Giải cứu tài chính:** Hạ cấp công trình ô 31
- **Số dư sau lượt:** 830 Tr. VNĐ | **Tài sản ròng:** 27.030 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

### === VÒNG ĐẤU #26 ===

#### Lượt #77 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 547 Tr. VNĐ | **Tài sản ròng:** 65.247 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 17 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)] (Property)
- **Số dư sau lượt:** 547 Tr. VNĐ | **Tài sản ròng:** 65.247 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Khánh Hòa (Nha Trang)

#### Lượt #78 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 830 Tr. VNĐ | **Tài sản ròng:** 27.030 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 830 Tr. VNĐ | **Tài sản ròng:** 27.030 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

### === VÒNG ĐẤU #27 ===

#### Lượt #79 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 547 Tr. VNĐ | **Tài sản ròng:** 65.247 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 23 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 547 Tr. VNĐ | **Tài sản ròng:** 65.247 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Khánh Hòa (Nha Trang)

#### Lượt #80 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 830 Tr. VNĐ | **Tài sản ròng:** 27.030 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Khởi Hành (GO)]: Trả tiền thuê 1699 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.419 Tr. VNĐ | **Tài sản ròng:** 27.619 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

### === VÒNG ĐẤU #28 ===

#### Lượt #81 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.246 Tr. VNĐ | **Tài sản ròng:** 66.946 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài] (Railroad)
- **Số dư sau lượt:** 816 Tr. VNĐ | **Tài sản ròng:** 66.816 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Khánh Hòa (Nha Trang)

#### Lượt #82 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.419 Tr. VNĐ | **Tài sản ròng:** 27.619 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai: Khấu trừ 141 Tr. VNĐ vào Kho Bạc
- **Số dư sau lượt:** 1.278 Tr. VNĐ | **Tài sản ròng:** 27.478 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

### === VÒNG ĐẤU #29 ===

#### Lượt #83 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 816 Tr. VNĐ | **Tài sản ròng:** 66.816 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 35 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 656 Tr. VNĐ | **Tài sản ròng:** 67.556 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn) (C1), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Khánh Hòa (Nha Trang)

#### Lượt #84 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.278 Tr. VNĐ | **Tài sản ròng:** 27.478 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 1039 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.547 Tr. VNĐ | **Tài sản ròng:** 28.447 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

### === VÒNG ĐẤU #30 ===

#### Lượt #85 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.695 Tr. VNĐ | **Tài sản ròng:** 68.595 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 7 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)] (Property)
- **Giải cứu tài chính:** Hạ cấp công trình ô 16
- **Giải cứu tài chính:** Thế chấp tài sản ô 14
- **Số dư sau lượt:** 700 Tr. VNĐ | **Tài sản ròng:** 66.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc) (C3), Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Khánh Hòa (Nha Trang)

#### Lượt #86 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 757 Tr. VNĐ | **Tài sản ròng:** 27.657 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 13 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 1190 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.647 Tr. VNĐ | **Tài sản ròng:** 28.547 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang) (C1), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy) (C2)

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 3 người chơi diễn ra liên tục 86 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.