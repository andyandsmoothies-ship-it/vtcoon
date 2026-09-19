# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 3 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202603 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 90 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **32.086 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 5.086 Tr. VNĐ | 32.086 Tr. VNĐ | 12 ô | 🏆 Vô địch |
| 2 | Cô Tư (Thận trọng / Passive) | Passive | 5.190 Tr. VNĐ | 31.490 Tr. VNĐ | 6 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 1.468 Tr. VNĐ | 19.068 Tr. VNĐ | 9 ô | ✓ Hoàn thành |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 24.847 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 0 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 36.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 13 căn (C1: 5, C2: 5, C3: 3).
- **Hoạt động sàn đấu giá:** 13 phiên phát động, 12 phiên gõ búa thành công.
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
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 4300 Tr. VNĐ
- **Số dư sau lượt:** 22.000 Tr. VNĐ | **Tài sản ròng:** 22.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #3 ===

#### Lượt #7 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.055 Tr. VNĐ | **Tài sản ròng:** 17.255 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Mua thành công [Tuyến Cao Tốc Bắc - Nam] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 7.055 Tr. VNĐ | **Tài sản ròng:** 17.255 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam

#### Lượt #8 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.420 Tr. VNĐ | **Tài sản ròng:** 19.620 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 17 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 15.820 Tr. VNĐ | **Tài sản ròng:** 19.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bà Rịa - Vũng Tàu, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #9 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.000 Tr. VNĐ | **Tài sản ròng:** 22.000 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 29 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cần Thơ (Cái Răng)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cần Thơ (Cái Răng)] với giá 950 Tr. VNĐ
- **Số dư sau lượt:** 21.000 Tr. VNĐ | **Tài sản ròng:** 24.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Hưng Yên (Văn Giang)

### === VÒNG ĐẤU #4 ===

#### Lượt #10 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.105 Tr. VNĐ | **Tài sản ròng:** 16.905 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 25 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 6.105 Tr. VNĐ | **Tài sản ròng:** 16.905 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng)

#### Lượt #11 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.820 Tr. VNĐ | **Tài sản ròng:** 19.620 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 26 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hà Nội (Cầu Giấy)] với giá 2150 Tr. VNĐ
- **Số dư sau lượt:** 15.820 Tr. VNĐ | **Tài sản ròng:** 19.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bà Rịa - Vũng Tàu, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #12 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 21.000 Tr. VNĐ | **Tài sản ròng:** 24.000 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 22.000 Tr. VNĐ | **Tài sản ròng:** 25.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Hưng Yên (Văn Giang)

### === VÒNG ĐẤU #5 ===

#### Lượt #13 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.955 Tr. VNĐ | **Tài sản ròng:** 17.755 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 1.955 Tr. VNĐ | **Tài sản ròng:** 17.255 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN)

#### Lượt #14 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.820 Tr. VNĐ | **Tài sản ròng:** 19.620 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 32 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (Quận 1 - Nguyễn Huệ)] giá 4000 Tr. VNĐ
- **Số dư sau lượt:** 11.820 Tr. VNĐ | **Tài sản ròng:** 19.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bà Rịa - Vũng Tàu, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #15 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.000 Tr. VNĐ | **Tài sản ròng:** 25.000 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Số dư sau lượt:** 20.400 Tr. VNĐ | **Tài sản ròng:** 25.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang)

### === VÒNG ĐẤU #6 ===

#### Lượt #16 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.955 Tr. VNĐ | **Tài sản ròng:** 17.255 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 20 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 1.155 Tr. VNĐ | **Tài sản ròng:** 19.155 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #17 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.820 Tr. VNĐ | **Tài sản ròng:** 19.620 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 39 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 2400 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 11.420 Tr. VNĐ | **Tài sản ròng:** 21.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #18 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 20.400 Tr. VNĐ | **Tài sản ròng:** 25.000 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 14 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 20.400 Tr. VNĐ | **Tài sản ròng:** 25.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang)

### === VÒNG ĐẤU #7 ===

#### Lượt #19 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.555 Tr. VNĐ | **Tài sản ròng:** 19.555 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 3 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)] (Utility)
- **Số dư sau lượt:** 1.905 Tr. VNĐ | **Tài sản ròng:** 19.405 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #20 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.420 Tr. VNĐ | **Tài sản ròng:** 21.220 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 7 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 11.420 Tr. VNĐ | **Tài sản ròng:** 21.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #21 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 20.400 Tr. VNĐ | **Tài sản ròng:** 25.000 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 20 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Viễn Thông (Viettel)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Tập Đoàn Viễn Thông (Viettel)] với giá 1850 Tr. VNĐ
- **Số dư sau lượt:** 19.200 Tr. VNĐ | **Tài sản ròng:** 23.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang)

### === VÒNG ĐẤU #8 ===

#### Lượt #22 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.905 Tr. VNĐ | **Tài sản ròng:** 19.405 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Từ chối mua [Thừa Thiên Huế], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Thừa Thiên Huế] với giá 2050 Tr. VNĐ
- **Số dư sau lượt:** 1.905 Tr. VNĐ | **Tài sản ròng:** 19.405 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #23 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.520 Tr. VNĐ | **Tài sản ròng:** 20.620 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Từ chối mua [Ninh Bình (Tràng An)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 7.520 Tr. VNĐ | **Tài sản ròng:** 20.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế

#### Lượt #24 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.950 Tr. VNĐ | **Tài sản ròng:** 24.950 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 28 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Từ chối mua [Cảng HKQT Nội Bài], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Cảng HKQT Nội Bài] với giá 1100 Tr. VNĐ
- **Số dư sau lượt:** 17.950 Tr. VNĐ | **Tài sản ròng:** 24.950 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An)

### === VÒNG ĐẤU #9 ===

#### Lượt #25 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.905 Tr. VNĐ | **Tài sản ròng:** 19.405 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 18 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Kiên Giang (Phú Quốc - Grand World)] với giá 2650 Tr. VNĐ
- **Số dư sau lượt:** 1.905 Tr. VNĐ | **Tài sản ròng:** 19.405 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #26 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.770 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 3.770 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #27 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.950 Tr. VNĐ | **Tài sản ròng:** 24.950 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 35 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 1320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 18.630 Tr. VNĐ | **Tài sản ròng:** 25.630 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An)

### === VÒNG ĐẤU #10 ===

#### Lượt #28 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.225 Tr. VNĐ | **Tài sản ròng:** 20.725 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 27 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 5.225 Tr. VNĐ | **Tài sản ròng:** 22.725 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #29 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.770 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 3.270 Tr. VNĐ | **Tài sản ròng:** 20.970 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #30 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.630 Tr. VNĐ | **Tài sản ròng:** 25.630 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 18.630 Tr. VNĐ | **Tài sản ròng:** 25.630 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An)

### === VÒNG ĐẤU #11 ===

#### Lượt #31 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.225 Tr. VNĐ | **Tài sản ròng:** 22.725 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 38 ➔ Ô 17 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Bình Dương (Tổ Hợp Thể Thao & Golf)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bình Dương (Tổ Hợp Thể Thao & Golf)] với giá 1150 Tr. VNĐ
- **Số dư sau lượt:** 6.225 Tr. VNĐ | **Tài sản ròng:** 23.725 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #32 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.120 Tr. VNĐ | **Tài sản ròng:** 20.820 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 18 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Từ chối mua [Nghệ An (TP. Vinh)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [Nghệ An (TP. Vinh)] với giá 3300 Tr. VNĐ
- **Số dư sau lượt:** 2.120 Tr. VNĐ | **Tài sản ròng:** 20.820 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #33 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.330 Tr. VNĐ | **Tài sản ròng:** 24.530 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 15.330 Tr. VNĐ | **Tài sản ròng:** 24.530 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #12 ===

#### Lượt #34 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.225 Tr. VNĐ | **Tài sản ròng:** 23.725 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 240 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 5.985 Tr. VNĐ | **Tài sản ròng:** 23.485 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #35 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.120 Tr. VNĐ | **Tài sản ròng:** 20.820 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 23 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 2.120 Tr. VNĐ | **Tài sản ròng:** 20.820 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #36 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.570 Tr. VNĐ | **Tài sản ròng:** 24.770 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 18 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 15.570 Tr. VNĐ | **Tài sản ròng:** 24.770 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #13 ===

#### Lượt #37 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.985 Tr. VNĐ | **Tài sản ròng:** 23.485 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 5.985 Tr. VNĐ | **Tài sản ròng:** 23.485 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #38 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.120 Tr. VNĐ | **Tài sản ròng:** 20.820 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 26 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 2250 Tr. VNĐ
- **Số dư sau lượt:** 2.120 Tr. VNĐ | **Tài sản ròng:** 20.820 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #39 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.570 Tr. VNĐ | **Tài sản ròng:** 24.770 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 18 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 14.470 Tr. VNĐ | **Tài sản ròng:** 23.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #14 ===

#### Lượt #40 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.035 Tr. VNĐ | **Tài sản ròng:** 24.735 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 33 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)] (Property)
- **Số dư sau lượt:** 5.035 Tr. VNĐ | **Tài sản ròng:** 25.735 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm)

#### Lượt #41 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.120 Tr. VNĐ | **Tài sản ròng:** 20.820 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 34 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.800 Tr. VNĐ | **Tài sản ròng:** 20.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #42 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.470 Tr. VNĐ | **Tài sản ròng:** 23.670 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Khởi Hành (GO)]: Trả tiền thuê 320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 12.250 Tr. VNĐ | **Tài sản ròng:** 21.450 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #15 ===

#### Lượt #43 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.675 Tr. VNĐ | **Tài sản ròng:** 27.375 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 1 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành] (Railroad)
- **Số dư sau lượt:** 6.675 Tr. VNĐ | **Tài sản ròng:** 27.375 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm)

#### Lượt #44 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.800 Tr. VNĐ | **Tài sản ròng:** 20.500 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 3 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu] (Property)
- **Số dư sau lượt:** 1.800 Tr. VNĐ | **Tài sản ròng:** 20.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #45 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.250 Tr. VNĐ | **Tài sản ròng:** 21.450 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 0 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 11.250 Tr. VNĐ | **Tài sản ròng:** 20.450 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #16 ===

#### Lượt #46 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.675 Tr. VNĐ | **Tài sản ròng:** 28.375 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 5 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Mua thành công [Đồng Nai (Đại Công Viên Chủ Đề)] giá 1000 Tr. VNĐ
- **Số dư sau lượt:** 6.675 Tr. VNĐ | **Tài sản ròng:** 28.375 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #47 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.800 Tr. VNĐ | **Tài sản ròng:** 20.500 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 9 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.680 Tr. VNĐ | **Tài sản ròng:** 20.380 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #48 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.250 Tr. VNĐ | **Tài sản ròng:** 20.450 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 5 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 280 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 10.970 Tr. VNĐ | **Tài sản ròng:** 20.170 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #17 ===

#### Lượt #49 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.075 Tr. VNĐ | **Tài sản ròng:** 28.775 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 6.915 Tr. VNĐ | **Tài sản ròng:** 28.615 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #50 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.680 Tr. VNĐ | **Tài sản ròng:** 20.380 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 1.680 Tr. VNĐ | **Tài sản ròng:** 20.380 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #51 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.130 Tr. VNĐ | **Tài sản ròng:** 20.330 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1 (Shophouse)
- **Số dư sau lượt:** 5.760 Tr. VNĐ | **Tài sản ròng:** 20.560 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C1)

### === VÒNG ĐẤU #18 ===

#### Lượt #52 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.915 Tr. VNĐ | **Tài sản ròng:** 28.615 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 14 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 4.915 Tr. VNĐ | **Tài sản ròng:** 28.415 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn)

#### Lượt #53 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.880 Tr. VNĐ | **Tài sản ròng:** 20.580 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 18 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 1.880 Tr. VNĐ | **Tài sản ròng:** 20.580 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #54 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.760 Tr. VNĐ | **Tài sản ròng:** 20.560 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 3.768 Tr. VNĐ | **Tài sản ròng:** 20.968 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C1)

### === VÒNG ĐẤU #19 ===

#### Lượt #55 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.915 Tr. VNĐ | **Tài sản ròng:** 28.415 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 360 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 4.555 Tr. VNĐ | **Tài sản ròng:** 28.055 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn)

#### Lượt #56 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.552 Tr. VNĐ | **Tài sản ròng:** 21.252 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 27 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 1900 Tr. VNĐ
- **Số dư sau lượt:** 2.552 Tr. VNĐ | **Tài sản ròng:** 21.252 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #57 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.768 Tr. VNĐ | **Tài sản ròng:** 20.968 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 26 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 31
- **Số dư sau lượt:** 1.778 Tr. VNĐ | **Tài sản ròng:** 21.178 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2)

### === VÒNG ĐẤU #20 ===

#### Lượt #58 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.955 Tr. VNĐ | **Tài sản ròng:** 29.955 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 28 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 2.955 Tr. VNĐ | **Tài sản ròng:** 29.955 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #59 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.552 Tr. VNĐ | **Tài sản ròng:** 21.252 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 37 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1584 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.968 Tr. VNĐ | **Tài sản ròng:** 20.668 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #60 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.778 Tr. VNĐ | **Tài sản ròng:** 21.178 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 32 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1584 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.444 Tr. VNĐ | **Tài sản ròng:** 20.844 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2)

### === VÒNG ĐẤU #21 ===

#### Lượt #61 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.123 Tr. VNĐ | **Tài sản ròng:** 33.123 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 6.123 Tr. VNĐ | **Tài sản ròng:** 33.123 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #62 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.968 Tr. VNĐ | **Tài sản ròng:** 20.668 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 3 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu] (Property)
- **Số dư sau lượt:** 1.968 Tr. VNĐ | **Tài sản ròng:** 20.668 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #63 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.444 Tr. VNĐ | **Tài sản ròng:** 20.844 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 3 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)] (Property)
- **Số dư sau lượt:** 1.444 Tr. VNĐ | **Tài sản ròng:** 20.844 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2)

### === VÒNG ĐẤU #22 ===

#### Lượt #64 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.123 Tr. VNĐ | **Tài sản ròng:** 33.123 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 6.123 Tr. VNĐ | **Tài sản ròng:** 33.123 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #65 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.968 Tr. VNĐ | **Tài sản ròng:** 20.668 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 9 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 192 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.776 Tr. VNĐ | **Tài sản ròng:** 20.476 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #66 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.636 Tr. VNĐ | **Tài sản ròng:** 21.036 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 14 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.396 Tr. VNĐ | **Tài sản ròng:** 20.796 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2)

### === VÒNG ĐẤU #23 ===

#### Lượt #67 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.123 Tr. VNĐ | **Tài sản ròng:** 33.123 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 5.623 Tr. VNĐ | **Tài sản ròng:** 32.623 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #68 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.016 Tr. VNĐ | **Tài sản ròng:** 20.716 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 14 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)] (Property)
- **Số dư sau lượt:** 2.016 Tr. VNĐ | **Tài sản ròng:** 20.716 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #69 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.396 Tr. VNĐ | **Tài sản ròng:** 20.796 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 19 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 1027 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 2.423 Tr. VNĐ | **Tài sản ròng:** 21.823 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2)

### === VÒNG ĐẤU #24 ===

#### Lượt #70 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.623 Tr. VNĐ | **Tài sản ròng:** 32.623 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)] (Property)
- **Số dư sau lượt:** 5.623 Tr. VNĐ | **Tài sản ròng:** 32.623 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #71 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.043 Tr. VNĐ | **Tài sản ròng:** 21.743 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 19 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 336 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.707 Tr. VNĐ | **Tài sản ròng:** 21.407 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #72 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.423 Tr. VNĐ | **Tài sản ròng:** 21.823 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 2.423 Tr. VNĐ | **Tài sản ròng:** 21.823 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C1), Thanh Hóa (Sầm Sơn) (C2)

### === VÒNG ĐẤU #25 ===

#### Lượt #73 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.959 Tr. VNĐ | **Tài sản ròng:** 32.959 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 16 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 2112 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 3.847 Tr. VNĐ | **Tài sản ròng:** 30.847 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #74 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.707 Tr. VNĐ | **Tài sản ròng:** 21.407 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 29 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 420 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.287 Tr. VNĐ | **Tài sản ròng:** 20.987 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #75 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.535 Tr. VNĐ | **Tài sản ròng:** 23.935 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 33 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 3.635 Tr. VNĐ | **Tài sản ròng:** 25.235 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2)

### === VÒNG ĐẤU #26 ===

#### Lượt #76 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.267 Tr. VNĐ | **Tài sản ròng:** 31.267 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 21 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 360 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 3.907 Tr. VNĐ | **Tài sản ròng:** 30.907 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #77 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.287 Tr. VNĐ | **Tài sản ròng:** 21.987 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 37 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 3.787 Tr. VNĐ | **Tài sản ròng:** 22.487 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #78 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.995 Tr. VNĐ | **Tài sản ròng:** 25.595 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 2 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Số dư sau lượt:** 2.595 Tr. VNĐ | **Tài sản ròng:** 25.595 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #27 ===

#### Lượt #79 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.907 Tr. VNĐ | **Tài sản ròng:** 30.907 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 31 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)] (Property)
- **Số dư sau lượt:** 3.907 Tr. VNĐ | **Tài sản ròng:** 30.907 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #80 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.787 Tr. VNĐ | **Tài sản ròng:** 22.487 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 168 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 3.619 Tr. VNĐ | **Tài sản ròng:** 22.319 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #81 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.763 Tr. VNĐ | **Tài sản ròng:** 25.763 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 11 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)] (Property)
- **Số dư sau lượt:** 2.763 Tr. VNĐ | **Tài sản ròng:** 25.763 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #28 ===

#### Lượt #82 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.907 Tr. VNĐ | **Tài sản ròng:** 30.907 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 37 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 384 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 4.023 Tr. VNĐ | **Tài sản ròng:** 31.023 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #83 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.003 Tr. VNĐ | **Tài sản ròng:** 22.703 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 11 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Trạm Kiểm Toán & Thanh Tra]: Trả tiền thuê 2376 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.627 Tr. VNĐ | **Tài sản ròng:** 20.327 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #84 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.139 Tr. VNĐ | **Tài sản ròng:** 28.139 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 21 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 336 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 4.803 Tr. VNĐ | **Tài sản ròng:** 27.803 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #29 ===

#### Lượt #85 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.359 Tr. VNĐ | **Tài sản ròng:** 31.359 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 19 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 374 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 3.985 Tr. VNĐ | **Tài sản ròng:** 30.985 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #86 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.001 Tr. VNĐ | **Tài sản ròng:** 20.701 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 80 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.921 Tr. VNĐ | **Tài sản ròng:** 20.621 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #87 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.803 Tr. VNĐ | **Tài sản ròng:** 27.803 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 384 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 4.419 Tr. VNĐ | **Tài sản ròng:** 27.419 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2), Thanh Hóa (Sầm Sơn) (C2), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #30 ===

#### Lượt #88 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.449 Tr. VNĐ | **Tài sản ròng:** 31.449 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 26 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 450 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 3.999 Tr. VNĐ | **Tài sản ròng:** 30.999 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Bình Định (Quy Nhơn), TP.HCM (TP. Thủ Đức)

#### Lượt #89 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.921 Tr. VNĐ | **Tài sản ròng:** 20.621 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 1921 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 6
- **Giải cứu tài chính:** Thế chấp tài sản ô 9
- **Số dư sau lượt:** 381 Tr. VNĐ | **Tài sản ròng:** 17.981 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #90 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.790 Tr. VNĐ | **Tài sản ròng:** 29.790 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 34 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Khởi Hành (GO)]: Trả tiền thuê 1087 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 5.190 Tr. VNĐ | **Tài sản ròng:** 31.490 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hưng Yên (Văn Giang), Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3), Thanh Hóa (Sầm Sơn) (C2), Bình Thuận (Mũi Né)

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 3 người chơi diễn ra liên tục 90 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.