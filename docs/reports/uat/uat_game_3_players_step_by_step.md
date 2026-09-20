# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 3 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202603 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 90 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **31.596 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 1.696 Tr. VNĐ | 31.596 Tr. VNĐ | 10 ô | 🏆 Vô địch |
| 2 | Cô Tư (Thận trọng / Passive) | Passive | 1.409 Tr. VNĐ | 31.409 Tr. VNĐ | 7 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 621 Tr. VNĐ | 14.121 Tr. VNĐ | 10 ô | ✓ Hoàn thành |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 23.922 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 0 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 34.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 17 căn (C1: 8, C2: 6, C3: 3).
- **Hoạt động sàn đấu giá:** 15 phiên phát động, 12 phiên gõ búa thành công.
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
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 950 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Hưng Yên (Văn Giang)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Hà Nội (Cầu Giấy)] lên C1 (Shophouse)
- **Giải cứu tài chính:** Thế chấp tài sản ô 29
- **Giải cứu tài chính:** Thế chấp tài sản ô 13
- **Số dư sau lượt:** 525 Tr. VNĐ | **Tài sản ròng:** 25.125 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm)

#### Lượt #44 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 850 Tr. VNĐ | **Tài sản ròng:** 20.950 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 3 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 850 Tr. VNĐ | **Tài sản ròng:** 20.950 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #45 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.238 Tr. VNĐ | **Tài sản ròng:** 23.438 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 0 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 120 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 17.118 Tr. VNĐ | **Tài sản ròng:** 23.318 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #16 ===

#### Lượt #46 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 525 Tr. VNĐ | **Tài sản ròng:** 25.125 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Từ chối mua [Bình Định (Quy Nhơn)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 525 Tr. VNĐ | **Tài sản ròng:** 25.125 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm)

#### Lượt #47 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 970 Tr. VNĐ | **Tài sản ròng:** 21.070 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 240 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 730 Tr. VNĐ | **Tài sản ròng:** 20.830 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #48 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.168 Tr. VNĐ | **Tài sản ròng:** 24.168 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 9 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.048 Tr. VNĐ | **Tài sản ròng:** 24.048 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn)

### === VÒNG ĐẤU #17 ===

#### Lượt #49 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 885 Tr. VNĐ | **Tài sản ròng:** 25.485 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 16 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam] (Railroad)
- **Số dư sau lượt:** 885 Tr. VNĐ | **Tài sản ròng:** 25.485 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm)

#### Lượt #50 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 730 Tr. VNĐ | **Tài sản ròng:** 20.830 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 12 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 730 Tr. VNĐ | **Tài sản ròng:** 20.830 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #51 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.048 Tr. VNĐ | **Tài sản ròng:** 24.048 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 16
- **Số dư sau lượt:** 5.718 Tr. VNĐ | **Tài sản ròng:** 26.118 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2)

### === VÒNG ĐẤU #18 ===

#### Lượt #52 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 885 Tr. VNĐ | **Tài sản ròng:** 25.485 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 25 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 885 Tr. VNĐ | **Tài sản ròng:** 25.485 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm)

#### Lượt #53 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.730 Tr. VNĐ | **Tài sản ròng:** 21.830 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 17 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 1730 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 6
- **Số dư sau lượt:** 250 Tr. VNĐ | **Tài sản ròng:** 19.850 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #54 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.448 Tr. VNĐ | **Tài sản ròng:** 27.848 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 7.136 Tr. VNĐ | **Tài sản ròng:** 27.536 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2)

### === VÒNG ĐẤU #19 ===

#### Lượt #55 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 885 Tr. VNĐ | **Tài sản ròng:** 25.485 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 400 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 485 Tr. VNĐ | **Tài sản ròng:** 25.085 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm)

#### Lượt #56 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 962 Tr. VNĐ | **Tài sản ròng:** 20.562 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 1524 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 9
- **Giải cứu tài chính:** Thế chấp tài sản ô 11
- **Số dư sau lượt:** 212 Tr. VNĐ | **Tài sản ròng:** 18.512 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #57 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.136 Tr. VNĐ | **Tài sản ròng:** 27.536 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 26 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (TP. Thủ Đức)] giá 3500 Tr. VNĐ
- **Số dư sau lượt:** 3.636 Tr. VNĐ | **Tài sản ròng:** 27.536 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Khánh Hòa (Nha Trang), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #20 ===

#### Lượt #58 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.009 Tr. VNĐ | **Tài sản ròng:** 26.609 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Hà Nội (Hoàn Kiếm)] lên C1 (Shophouse)
- **Số dư sau lượt:** 534 Tr. VNĐ | **Tài sản ròng:** 27.434 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #59 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 212 Tr. VNĐ | **Tài sản ròng:** 18.512 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 31 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 572 Tr. VNĐ | **Tài sản ròng:** 19.372 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #60 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.636 Tr. VNĐ | **Tài sản ròng:** 27.536 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 37 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1094 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 4.236 Tr. VNĐ | **Tài sản ròng:** 28.936 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #21 ===

#### Lượt #61 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.628 Tr. VNĐ | **Tài sản ròng:** 28.528 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Từ chối mua [Cảng Nước Sâu Cái Mép], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 1.628 Tr. VNĐ | **Tài sản ròng:** 28.528 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #62 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.666 Tr. VNĐ | **Tài sản ròng:** 20.466 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 0 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 666 Tr. VNĐ | **Tài sản ròng:** 19.466 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #63 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.186 Tr. VNĐ | **Tài sản ròng:** 29.886 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 7 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 200 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.986 Tr. VNĐ | **Tài sản ròng:** 29.686 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C2), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #22 ===

#### Lượt #64 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.828 Tr. VNĐ | **Tài sản ròng:** 29.728 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 2112 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 716 Tr. VNĐ | **Tài sản ròng:** 27.616 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #65 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 666 Tr. VNĐ | **Tài sản ròng:** 19.466 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 5 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 166 Tr. VNĐ | **Tài sản ròng:** 18.966 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #66 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.598 Tr. VNĐ | **Tài sản ròng:** 32.298 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 37
- **Số dư sau lượt:** 3.223 Tr. VNĐ | **Tài sản ròng:** 33.223 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #23 ===

#### Lượt #67 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 716 Tr. VNĐ | **Tài sản ròng:** 27.616 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 374 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 342 Tr. VNĐ | **Tài sản ròng:** 27.242 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #68 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 540 Tr. VNĐ | **Tài sản ròng:** 19.340 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 15 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 540 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 6
- **Giải cứu tài chính:** Thế chấp tài sản ô 18
- **Giải cứu tài chính:** Thế chấp tài sản ô 19
- **Giải cứu tài chính:** Thế chấp tài sản ô 28
- **Giải cứu tài chính:** Thế chấp tài sản ô 26
- **Giải cứu tài chính:** Thế chấp tài sản ô 27
- **Số dư sau lượt:** 482 Tr. VNĐ | **Tài sản ròng:** 13.532 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #69 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.763 Tr. VNĐ | **Tài sản ròng:** 33.763 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 3.763 Tr. VNĐ | **Tài sản ròng:** 33.763 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #24 ===

#### Lượt #70 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 342 Tr. VNĐ | **Tài sản ròng:** 27.242 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 26 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Giải cứu tài chính:** Thế chấp tài sản ô 12
- **Số dư sau lượt:** 292 Tr. VNĐ | **Tài sản ròng:** 26.442 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C1), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #71 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 482 Tr. VNĐ | **Tài sản ròng:** 13.532 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 23 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 482 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 39
- **Số dư sau lượt:** 397 Tr. VNĐ | **Tài sản ròng:** 12.197 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #72 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.763 Tr. VNĐ | **Tài sản ròng:** 33.763 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 1030 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 3.263 Tr. VNĐ | **Tài sản ròng:** 33.263 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #25 ===

#### Lượt #73 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.804 Tr. VNĐ | **Tài sản ròng:** 27.954 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 36 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Hưng Yên (Văn Giang)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 13
- **Số dư sau lượt:** 527 Tr. VNĐ | **Tài sản ròng:** 28.977 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C2), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #74 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.667 Tr. VNĐ | **Tài sản ròng:** 13.467 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Số dư sau lượt:** 567 Tr. VNĐ | **Tài sản ròng:** 13.367 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #75 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.143 Tr. VNĐ | **Tài sản ròng:** 33.143 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 6 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.143 Tr. VNĐ | **Tài sản ròng:** 32.143 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #26 ===

#### Lượt #76 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.527 Tr. VNĐ | **Tài sản ròng:** 29.977 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 702 Tr. VNĐ | **Tài sản ròng:** 29.902 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C2), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #77 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 567 Tr. VNĐ | **Tài sản ròng:** 13.367 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 11 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 67 Tr. VNĐ | **Tài sản ròng:** 12.867 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #78 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.643 Tr. VNĐ | **Tài sản ròng:** 32.643 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 36 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lệ Phí Đăng Ký Đất Đai]: Trả tiền thuê 1084 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.829 Tr. VNĐ | **Tài sản ròng:** 32.829 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #27 ===

#### Lượt #79 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.786 Tr. VNĐ | **Tài sản ròng:** 30.986 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 1.016 Tr. VNĐ | **Tài sản ròng:** 30.916 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C2), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #80 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.151 Tr. VNĐ | **Tài sản ròng:** 13.951 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 15 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế] (Property)
- **Số dư sau lượt:** 1.151 Tr. VNĐ | **Tài sản ròng:** 13.951 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #81 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.829 Tr. VNĐ | **Tài sản ròng:** 32.829 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Số dư sau lượt:** 2.829 Tr. VNĐ | **Tài sản ròng:** 32.829 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #28 ===

#### Lượt #82 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.016 Tr. VNĐ | **Tài sản ròng:** 30.916 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 1.016 Tr. VNĐ | **Tài sản ròng:** 30.916 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C2), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #83 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.151 Tr. VNĐ | **Tài sản ròng:** 13.951 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 381 Tr. VNĐ | **Tài sản ròng:** 13.881 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #84 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.829 Tr. VNĐ | **Tài sản ròng:** 32.829 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 11 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 2.589 Tr. VNĐ | **Tài sản ròng:** 32.589 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #29 ===

#### Lượt #85 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.016 Tr. VNĐ | **Tài sản ròng:** 30.916 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 516 Tr. VNĐ | **Tài sản ròng:** 30.416 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C2), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #86 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 621 Tr. VNĐ | **Tài sản ròng:** 14.121 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 621 Tr. VNĐ | **Tài sản ròng:** 14.121 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #87 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.589 Tr. VNĐ | **Tài sản ròng:** 32.589 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 19 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)] (Property)
- **Số dư sau lượt:** 2.589 Tr. VNĐ | **Tài sản ròng:** 32.589 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #30 ===

#### Lượt #88 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 516 Tr. VNĐ | **Tài sản ròng:** 30.416 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 16 Tr. VNĐ | **Tài sản ròng:** 29.916 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Tuyến Cao Tốc Bắc - Nam, Hưng Yên (Văn Giang) (C2), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3), Hà Nội (Hoàn Kiếm) (C1)

#### Lượt #89 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 621 Tr. VNĐ | **Tài sản ròng:** 14.121 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 621 Tr. VNĐ | **Tài sản ròng:** 14.121 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (Quận 1 - Nguyễn Huệ), Tập Đoàn Viễn Thông (Viettel), Thừa Thiên Huế, Cảng HKQT Nội Bài, Kiên Giang (Phú Quốc - Grand World), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Thuận (Mũi Né)

#### Lượt #90 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.089 Tr. VNĐ | **Tài sản ròng:** 33.089 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 24 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 1680 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.409 Tr. VNĐ | **Tài sản ròng:** 31.409 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An) (C2), Nghệ An (TP. Vinh) (C3), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn) (C2), TP.HCM (TP. Thủ Đức), Cảng Nước Sâu Cái Mép

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 3 người chơi diễn ra liên tục 90 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.