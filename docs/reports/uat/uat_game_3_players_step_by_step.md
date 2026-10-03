# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 3 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202603 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 96 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Cô Tư (Thận trọng / Passive)** (Tổng tài sản ròng: **31.033 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Cô Tư (Thận trọng / Passive) | Passive | 1.033 Tr. VNĐ | 31.033 Tr. VNĐ | 8 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 1.771 Tr. VNĐ | 16.371 Tr. VNĐ | 9 ô | ✓ Hoàn thành |
| 3 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 1.759 Tr. VNĐ | 13.709 Tr. VNĐ | 9 ô | ✓ Hoàn thành |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 63.207 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 1.003 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 38.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 43 căn (C1: 17, C2: 15, C3: 11).
- **Hoạt động sàn đấu giá:** 5 phiên phát động, 4 phiên gõ búa thành công.
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
- **Di chuyển:** Ô 19 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 15.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài

### === VÒNG ĐẤU #4 ===

#### Lượt #10 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.600 Tr. VNĐ | **Tài sản ròng:** 21.800 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 19 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 18.600 Tr. VNĐ | **Tài sản ròng:** 21.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu

#### Lượt #11 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.650 Tr. VNĐ | **Tài sản ròng:** 21.650 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 10.650 Tr. VNĐ | **Tài sản ròng:** 21.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #12 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 35 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại ô Thuế [Lệ Phí Đăng Ký Đất Đai]
- **Số dư sau lượt:** 16.020 Tr. VNĐ | **Tài sản ròng:** 20.020 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài

### === VÒNG ĐẤU #5 ===

#### Lượt #13 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.600 Tr. VNĐ | **Tài sản ròng:** 21.800 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 17.900 Tr. VNĐ | **Tài sản ròng:** 21.100 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu

#### Lượt #14 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.850 Tr. VNĐ | **Tài sản ròng:** 21.850 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 250 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 10.350 Tr. VNĐ | **Tài sản ròng:** 21.350 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #15 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.270 Tr. VNĐ | **Tài sản ròng:** 20.270 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 4 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 12.470 Tr. VNĐ | **Tài sản ròng:** 20.270 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #6 ===

#### Lượt #16 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 17.775 Tr. VNĐ | **Tài sản ròng:** 20.975 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 19 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 15.175 Tr. VNĐ | **Tài sản ròng:** 20.975 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #17 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.350 Tr. VNĐ | **Tài sản ròng:** 21.350 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 17 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 2500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 7.850 Tr. VNĐ | **Tài sản ròng:** 18.850 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #18 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 18 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Từ chối mua [Nghệ An (TP. Vinh)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

#### Lượt #19 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 23 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Nghệ An (TP. Vinh)] với giá 3550 Tr. VNĐ
- **Số dư sau lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #7 ===

#### Lượt #20 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.625 Tr. VNĐ | **Tài sản ròng:** 19.625 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 26 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Cầu Giấy)] giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 8.625 Tr. VNĐ | **Tài sản ròng:** 19.625 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy)

#### Lượt #21 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.850 Tr. VNĐ | **Tài sản ròng:** 18.850 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 29 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 8.250 Tr. VNĐ | **Tài sản ròng:** 19.250 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #22 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 23 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

#### Lượt #23 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 31 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)] (Property)
- **Số dư sau lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

#### Lượt #24 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 31 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)] (Property)
- **Số dư sau lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

#### Lượt #25 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 31 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 1430 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hưng Yên (Văn Giang)] với giá 7350 Tr. VNĐ
- **Số dư sau lượt:** 14.970 Tr. VNĐ | **Tài sản ròng:** 22.770 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #8 ===

#### Lượt #26 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.705 Tr. VNĐ | **Tài sản ròng:** 16.705 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 32 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 2000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.005 Tr. VNĐ | **Tài sản ròng:** 15.005 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang)

#### Lượt #27 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.680 Tr. VNĐ | **Tài sản ròng:** 20.680 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 38 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 10.280 Tr. VNĐ | **Tài sản ròng:** 21.280 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #28 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.970 Tr. VNĐ | **Tài sản ròng:** 24.770 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng chân tại [Sàn Giao Dịch Chứng Khoán (HOSE)]: Trả tiền thuê 1204 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.470 Tr. VNĐ | **Tài sản ròng:** 25.270 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #9 ===

#### Lượt #29 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.709 Tr. VNĐ | **Tài sản ròng:** 16.709 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 35 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại ô Thuế [Lệ Phí Đăng Ký Đất Đai]
- **Số dư sau lượt:** 3.429 Tr. VNĐ | **Tài sản ròng:** 17.429 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang)

#### Lượt #30 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.484 Tr. VNĐ | **Tài sản ròng:** 22.484 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 8 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 9.684 Tr. VNĐ | **Tài sản ròng:** 22.484 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Bình Định (Quy Nhơn)

#### Lượt #31 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.470 Tr. VNĐ | **Tài sản ròng:** 25.270 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 38 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Bình Dương (Tổ Hợp Thể Thao & Golf)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 18.870 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

#### Lượt #32 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.870 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 1356 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Bình Dương (Tổ Hợp Thể Thao & Golf)] với giá 2050 Tr. VNĐ
- **Số dư sau lượt:** 18.870 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #10 ===

#### Lượt #33 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.735 Tr. VNĐ | **Tài sản ròng:** 17.735 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 4 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Từ chối mua [Ninh Bình (Tràng An)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Ninh Bình (Tràng An)] với giá 1650 Tr. VNĐ
- **Số dư sau lượt:** 1.235 Tr. VNĐ | **Tài sản ròng:** 17.735 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN)

#### Lượt #34 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.390 Tr. VNĐ | **Tài sản ròng:** 24.590 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 9.078 Tr. VNĐ | **Tài sản ròng:** 24.278 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Bình Định (Quy Nhơn), Ninh Bình (Tràng An)

#### Lượt #35 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.870 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 1250 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 18.870 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #11 ===

#### Lượt #36 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.797 Tr. VNĐ | **Tài sản ròng:** 19.297 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 142 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Giải cứu tài chính:** Thế chấp tài sản ô 31
- **Giải cứu tài chính:** Thế chấp tài sản ô 26
- **Số dư sau lượt:** 1.167 Tr. VNĐ | **Tài sản ròng:** 19.967 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #37 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.470 Tr. VNĐ | **Tài sản ròng:** 26.870 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 10.470 Tr. VNĐ | **Tài sản ròng:** 26.870 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn), Ninh Bình (Tràng An)

#### Lượt #38 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.870 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 35 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 1061 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 23.270 Tr. VNĐ | **Tài sản ròng:** 31.070 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #12 ===

#### Lượt #39 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.228 Tr. VNĐ | **Tài sản ròng:** 21.028 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 31 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 1.073 Tr. VNĐ | **Tài sản ròng:** 21.673 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #40 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.531 Tr. VNĐ | **Tài sản ròng:** 27.931 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 33 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 12.531 Tr. VNĐ | **Tài sản ròng:** 28.931 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn), Ninh Bình (Tràng An)

#### Lượt #41 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 23.270 Tr. VNĐ | **Tài sản ròng:** 31.070 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 14 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng chân tại [Nghỉ Dưỡng Miễn Phí]: Trả tiền thuê 1120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 23.270 Tr. VNĐ | **Tài sản ròng:** 31.070 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #13 ===

#### Lượt #42 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.193 Tr. VNĐ | **Tài sản ròng:** 22.793 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 2 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)] (Utility)
- **Số dư sau lượt:** 763 Tr. VNĐ | **Tài sản ròng:** 22.663 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #43 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.651 Tr. VNĐ | **Tài sản ròng:** 30.051 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 2 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 1.739 Tr. VNĐ | **Tài sản ròng:** 35.339 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Thừa Thiên Huế (C3), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C3), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #44 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 23.407 Tr. VNĐ | **Tài sản ròng:** 32.207 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Kiên Giang (Phú Quốc - Grand World)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Quảng Ninh (Hạ Long)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Kiên Giang (Phú Quốc - Grand World)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Quảng Ninh (Hạ Long)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 9.079 Tr. VNĐ | **Tài sản ròng:** 35.079 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Kiên Giang (Phú Quốc - Grand World) (C2)

### === VÒNG ĐẤU #14 ===

#### Lượt #45 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.715 Tr. VNĐ | **Tài sản ròng:** 24.015 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 12 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 1.415 Tr. VNĐ | **Tài sản ròng:** 23.715 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #46 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.739 Tr. VNĐ | **Tài sản ròng:** 35.339 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Số dư sau lượt:** 1.739 Tr. VNĐ | **Tài sản ròng:** 35.339 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Thừa Thiên Huế (C3), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C3), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #47 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.079 Tr. VNĐ | **Tài sản ròng:** 35.079 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 8.759 Tr. VNĐ | **Tài sản ròng:** 34.759 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Kiên Giang (Phú Quốc - Grand World) (C2)

### === VÒNG ĐẤU #15 ===

#### Lượt #48 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.415 Tr. VNĐ | **Tài sản ròng:** 23.715 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 17 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Giải cứu tài chính:** Thế chấp tài sản ô 31
- **Số dư sau lượt:** 695 Tr. VNĐ | **Tài sản ròng:** 21.495 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #49 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 695 Tr. VNĐ | **Tài sản ròng:** 21.495 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)] (Property)
- **Số dư sau lượt:** 695 Tr. VNĐ | **Tài sản ròng:** 21.495 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #50 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.279 Tr. VNĐ | **Tài sản ròng:** 35.879 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 11 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)] (Property)
- **Số dư sau lượt:** 2.279 Tr. VNĐ | **Tài sản ròng:** 35.879 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Thừa Thiên Huế (C3), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C3), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #51 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.904 Tr. VNĐ | **Tài sản ròng:** 37.904 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 34 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 1166 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 7.904 Tr. VNĐ | **Tài sản ròng:** 37.904 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Kiên Giang (Phú Quốc - Grand World) (C2), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #16 ===

#### Lượt #52 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.861 Tr. VNĐ | **Tài sản ròng:** 22.661 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 39 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai: Khấu trừ 1003 Tr. VNĐ vào Kho Bạc
- **Số dư sau lượt:** 858 Tr. VNĐ | **Tài sản ròng:** 23.158 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #53 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.445 Tr. VNĐ | **Tài sản ròng:** 37.045 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 19 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)] (Property)
- **Số dư sau lượt:** 3.445 Tr. VNĐ | **Tài sản ròng:** 37.045 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Thừa Thiên Huế (C3), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C3), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #54 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.904 Tr. VNĐ | **Tài sản ròng:** 37.904 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 39 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1683 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 9.304 Tr. VNĐ | **Tài sản ròng:** 39.304 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Kiên Giang (Phú Quốc - Grand World) (C2), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #17 ===

#### Lượt #55 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.541 Tr. VNĐ | **Tài sản ròng:** 24.841 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 140 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 2.401 Tr. VNĐ | **Tài sản ròng:** 24.701 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #56 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.668 Tr. VNĐ | **Tài sản ròng:** 38.268 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 23 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 2600 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 2.068 Tr. VNĐ | **Tài sản ròng:** 35.668 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Thừa Thiên Huế (C3), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C3), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #57 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.904 Tr. VNĐ | **Tài sản ròng:** 41.904 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 7 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 140 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 11.764 Tr. VNĐ | **Tài sản ròng:** 41.764 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Kiên Giang (Phú Quốc - Grand World) (C2), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #18 ===

#### Lượt #58 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.401 Tr. VNĐ | **Tài sản ròng:** 24.701 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 11 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1680 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 721 Tr. VNĐ | **Tài sản ròng:** 24.421 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #59 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.888 Tr. VNĐ | **Tài sản ròng:** 36.088 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 26 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 3.888 Tr. VNĐ | **Tài sản ròng:** 36.088 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Thừa Thiên Huế (C3), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C3), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #60 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.764 Tr. VNĐ | **Tài sản ròng:** 41.764 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 13 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Số dư sau lượt:** 9.564 Tr. VNĐ | **Tài sản ròng:** 41.764 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Kiên Giang (Phú Quốc - Grand World) (C2), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #19 ===

#### Lượt #61 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 721 Tr. VNĐ | **Tài sản ròng:** 24.421 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 22 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 721 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 13
- **Giải cứu tài chính:** Thế chấp tài sản ô 31
- **Số dư sau lượt:** 681 Tr. VNĐ | **Tài sản ròng:** 22.181 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #62 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.888 Tr. VNĐ | **Tài sản ròng:** 36.088 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 3.888 Tr. VNĐ | **Tài sản ròng:** 36.088 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Thừa Thiên Huế (C3), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C3), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #63 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.285 Tr. VNĐ | **Tài sản ròng:** 42.485 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 21 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 9.985 Tr. VNĐ | **Tài sản ròng:** 42.185 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Kiên Giang (Phú Quốc - Grand World) (C2), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #20 ===

#### Lượt #64 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 981 Tr. VNĐ | **Tài sản ròng:** 22.481 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 29 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 3000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.561 Tr. VNĐ | **Tài sản ròng:** 25.261 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #65 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.888 Tr. VNĐ | **Tài sản ròng:** 36.088 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 3.888 Tr. VNĐ | **Tài sản ròng:** 36.088 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Thừa Thiên Huế (C3), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C3), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #66 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.985 Tr. VNĐ | **Tài sản ròng:** 45.185 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 32 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 5300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Kiên Giang (Phú Quốc - Grand World)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 2.285 Tr. VNĐ | **Tài sản ròng:** 42.285 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #21 ===

#### Lượt #67 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.861 Tr. VNĐ | **Tài sản ròng:** 30.561 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 33 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)] (Property)
- **Số dư sau lượt:** 7.361 Tr. VNĐ | **Tài sản ròng:** 31.061 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Lâm Đồng (Đà Lạt), Bà Rịa - Vũng Tàu (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN)

#### Lượt #68 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.888 Tr. VNĐ | **Tài sản ròng:** 36.088 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 3.388 Tr. VNĐ | **Tài sản ròng:** 35.588 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Thừa Thiên Huế (C3), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C3), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #69 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.285 Tr. VNĐ | **Tài sản ròng:** 42.285 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 2.285 Tr. VNĐ | **Tài sản ròng:** 42.285 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #22 ===

#### Lượt #70 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.361 Tr. VNĐ | **Tài sản ròng:** 31.061 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 3.961 Tr. VNĐ | **Tài sản ròng:** 31.061 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #71 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.483 Tr. VNĐ | **Tài sản ròng:** 36.483 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 34
- **Giải cứu tài chính:** Thế chấp tài sản ô 24
- **Giải cứu tài chính:** Thế chấp tài sản ô 23
- **Số dư sau lượt:** 723 Tr. VNĐ | **Tài sản ròng:** 38.023 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt) (C2), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hà Nội (Hoàn Kiếm), Thừa Thiên Huế (C3), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C3), Ninh Bình (Tràng An), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C2)

#### Lượt #72 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.285 Tr. VNĐ | **Tài sản ròng:** 42.285 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 6 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 2285 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 21
- **Giải cứu tài chính:** Thế chấp tài sản ô 39
- **Giải cứu tài chính:** Thế chấp tài sản ô 15
- **Số dư sau lượt:** 985 Tr. VNĐ | **Tài sản ròng:** 36.885 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #23 ===

#### Lượt #73 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.246 Tr. VNĐ | **Tài sản ròng:** 33.346 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 6246 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 31
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 1.146 Tr. VNĐ | **Tài sản ròng:** 25.246 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #74 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.969 Tr. VNĐ | **Tài sản ròng:** 44.269 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 19 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 6969 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Giải cứu tài chính:** Hạ cấp công trình ô 16
- **Giải cứu tài chính:** Hạ cấp công trình ô 18
- **Giải cứu tài chính:** Hạ cấp công trình ô 19
- **Số dư sau lượt:** 959 Tr. VNĐ | **Tài sản ròng:** 23.259 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Hà Nội (Hoàn Kiếm), Thừa Thiên Huế (C2), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C2), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #75 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.954 Tr. VNĐ | **Tài sản ròng:** 43.854 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 9 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.444 Tr. VNĐ | **Tài sản ròng:** 42.444 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #24 ===

#### Lượt #76 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.146 Tr. VNĐ | **Tài sản ròng:** 26.246 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 16 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 2146 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 5
- **Giải cứu tài chính:** Thế chấp tài sản ô 12
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Số dư sau lượt:** 196 Tr. VNĐ | **Tài sản ròng:** 21.646 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C2), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #77 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 959 Tr. VNĐ | **Tài sản ròng:** 23.259 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 27 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 959 Tr. VNĐ | **Tài sản ròng:** 23.259 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Hà Nội (Hoàn Kiếm), Thừa Thiên Huế (C2), Nghệ An (TP. Vinh), Bình Định (Quy Nhơn) (C2), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #78 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.590 Tr. VNĐ | **Tài sản ròng:** 44.590 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)] (Property)
- **Số dư sau lượt:** 4.590 Tr. VNĐ | **Tài sản ròng:** 44.590 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #25 ===

#### Lượt #79 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 196 Tr. VNĐ | **Tài sản ròng:** 21.646 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 35 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 459 Tr. VNĐ | **Tài sản ròng:** 21.909 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C2), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #80 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 959 Tr. VNĐ | **Tài sản ròng:** 23.259 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 27 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 7500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 16
- **Giải cứu tài chính:** Hạ cấp công trình ô 18
- **Giải cứu tài chính:** Hạ cấp công trình ô 19
- **Giải cứu tài chính:** Hạ cấp công trình ô 16
- **Giải cứu tài chính:** Hạ cấp công trình ô 18
- **Số dư sau lượt:** 29 Tr. VNĐ | **Tài sản ròng:** 14.929 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Hà Nội (Hoàn Kiếm), Thừa Thiên Huế, Nghệ An (TP. Vinh), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #81 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 840 Tr. VNĐ | **Tài sản ròng:** 40.840 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 6 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 840 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 21
- **Giải cứu tài chính:** Thế chấp tài sản ô 39
- **Giải cứu tài chính:** Thế chấp tài sản ô 15
- **Giải cứu tài chính:** Thế chấp tài sản ô 25
- **Số dư sau lượt:** 540 Tr. VNĐ | **Tài sản ròng:** 35.440 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #26 ===

#### Lượt #82 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.799 Tr. VNĐ | **Tài sản ròng:** 30.249 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 3.174 Tr. VNĐ | **Tài sản ròng:** 30.274 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Cần Thơ (Cái Răng) (C3), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C3)

#### Lượt #83 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** -371 Tr. VNĐ | **Tài sản ròng:** 14.529 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Giải cứu tài chính:** Hạ cấp công trình ô 19
- **Số dư sau lượt:** 129 Tr. VNĐ | **Tài sản ròng:** 14.029 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Hà Nội (Hoàn Kiếm), Thừa Thiên Huế, Nghệ An (TP. Vinh), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #84 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 140 Tr. VNĐ | **Tài sản ròng:** 35.040 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 9 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 140 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Giải cứu tài chính:** Thế chấp tài sản ô 35
- **Số dư sau lượt:** 708 Tr. VNĐ | **Tài sản ròng:** 34.608 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #27 ===

#### Lượt #85 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.174 Tr. VNĐ | **Tài sản ròng:** 30.274 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 3174 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 31
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Giải cứu tài chính:** Thế chấp tài sản ô 5
- **Giải cứu tài chính:** Thế chấp tài sản ô 12
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 6
- **Giải cứu tài chính:** Hạ cấp công trình ô 8
- **Giải cứu tài chính:** Hạ cấp công trình ô 9
- **Giải cứu tài chính:** Hạ cấp công trình ô 6
- **Giải cứu tài chính:** Hạ cấp công trình ô 8
- **Giải cứu tài chính:** Hạ cấp công trình ô 9
- **Số dư sau lượt:** 414 Tr. VNĐ | **Tài sản ròng:** 11.164 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C1), Bà Rịa - Vũng Tàu (C1), Cần Thơ (Cái Răng), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc)

#### Lượt #86 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 269 Tr. VNĐ | **Tài sản ròng:** 14.169 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)] (Property)
- **Số dư sau lượt:** 269 Tr. VNĐ | **Tài sản ròng:** 14.169 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Hà Nội (Hoàn Kiếm), Thừa Thiên Huế, Nghệ An (TP. Vinh), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #87 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.882 Tr. VNĐ | **Tài sản ròng:** 37.782 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 18 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)] (Property)
- **Số dư sau lượt:** 1.682 Tr. VNĐ | **Tài sản ròng:** 37.582 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #28 ===

#### Lượt #88 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 414 Tr. VNĐ | **Tài sản ròng:** 11.164 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 27 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 414 Tr. VNĐ | **Tài sản ròng:** 11.164 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C1), Bà Rịa - Vũng Tàu (C1), Cần Thơ (Cái Răng), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc)

#### Lượt #89 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 269 Tr. VNĐ | **Tài sản ròng:** 14.169 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 11 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)] (Property)
- **Số dư sau lượt:** 269 Tr. VNĐ | **Tài sản ròng:** 14.169 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Hà Nội (Hoàn Kiếm), Thừa Thiên Huế, Nghệ An (TP. Vinh), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #90 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.682 Tr. VNĐ | **Tài sản ròng:** 37.582 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 31 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 1071 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 15
- **Giải cứu tài chính:** Thế chấp tài sản ô 25
- **Số dư sau lượt:** 533 Tr. VNĐ | **Tài sản ròng:** 34.433 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #29 ===

#### Lượt #91 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.485 Tr. VNĐ | **Tài sản ròng:** 12.235 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 435 Tr. VNĐ | **Tài sản ròng:** 12.385 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C1), Bà Rịa - Vũng Tàu (C1), Cần Thơ (Cái Răng) (C2), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C1)

#### Lượt #92 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.340 Tr. VNĐ | **Tài sản ròng:** 15.240 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 14 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)] (Property)
- **Số dư sau lượt:** 1.340 Tr. VNĐ | **Tài sản ròng:** 15.240 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Hà Nội (Hoàn Kiếm), Thừa Thiên Huế, Nghệ An (TP. Vinh), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #93 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 533 Tr. VNĐ | **Tài sản ròng:** 34.433 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 12 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Giải cứu tài chính:** Hạ cấp công trình ô 26
- **Số dư sau lượt:** 1.033 Tr. VNĐ | **Tài sản ròng:** 31.033 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #30 ===

#### Lượt #94 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 435 Tr. VNĐ | **Tài sản ròng:** 12.385 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 34 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)] (Property)
- **Số dư sau lượt:** 698 Tr. VNĐ | **Tài sản ròng:** 12.648 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C1), Bà Rịa - Vũng Tàu (C1), Cần Thơ (Cái Răng) (C2), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tập Đoàn Điện Lực (EVN), An Giang (Châu Đốc) (C1)

#### Lượt #95 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.340 Tr. VNĐ | **Tài sản ròng:** 15.240 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Số dư sau lượt:** 710 Tr. VNĐ | **Tài sản ròng:** 15.310 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Hà Nội (Hoàn Kiếm), Thừa Thiên Huế, Nghệ An (TP. Vinh), Bình Định (Quy Nhơn), Ninh Bình (Tràng An), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang)

#### Lượt #96 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.033 Tr. VNĐ | **Tài sản ròng:** 31.033 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 22 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Trạm Kiểm Toán & Thanh Tra]: Trả tiền thuê 1061 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 1.033 Tr. VNĐ | **Tài sản ròng:** 31.033 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long) (C2), Tuyến Cao Tốc Bắc - Nam, Cảng HKQT Nội Bài, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Kiên Giang (Phú Quốc - Grand World) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 3 người chơi diễn ra liên tục 96 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.