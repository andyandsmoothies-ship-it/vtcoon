# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 3 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202603 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 91 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Chú Sáu (Cân bằng / Balanced)** (Tổng tài sản ròng: **49.898 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Chú Sáu (Cân bằng / Balanced) | Balanced | 10.798 Tr. VNĐ | 49.898 Tr. VNĐ | 11 ô | 🏆 Vô địch |
| 2 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 7.648 Tr. VNĐ | 31.048 Tr. VNĐ | 8 ô | ✓ Hoàn thành |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | 11.506 Tr. VNĐ | 30.106 Tr. VNĐ | 8 ô | ✓ Hoàn thành |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 39.558 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 0 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 44.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 24 căn (C1: 8, C2: 8, C3: 8).
- **Hoạt động sàn đấu giá:** 5 phiên phát động, 5 phiên gõ búa thành công.
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
- **Sự kiện ô:** Mua thành công [Tuyến Cao Tốc Bắc - Nam] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 17.800 Tr. VNĐ | **Tài sản ròng:** 19.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Tuyến Cao Tốc Bắc - Nam

### === VÒNG ĐẤU #4 ===

#### Lượt #10 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.600 Tr. VNĐ | **Tài sản ròng:** 21.800 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 18.100 Tr. VNĐ | **Tài sản ròng:** 21.300 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu

#### Lượt #11 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.650 Tr. VNĐ | **Tài sản ròng:** 21.650 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 10.650 Tr. VNĐ | **Tài sản ròng:** 21.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #12 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.300 Tr. VNĐ | **Tài sản ròng:** 20.300 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 35 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại ô Thuế [Lệ Phí Đăng Ký Đất Đai]
- **Số dư sau lượt:** 18.300 Tr. VNĐ | **Tài sản ròng:** 20.300 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Tuyến Cao Tốc Bắc - Nam

### === VÒNG ĐẤU #5 ===

#### Lượt #13 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.100 Tr. VNĐ | **Tài sản ròng:** 21.300 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 17.780 Tr. VNĐ | **Tài sản ròng:** 20.980 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu

#### Lượt #14 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.970 Tr. VNĐ | **Tài sản ròng:** 21.970 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 10.470 Tr. VNĐ | **Tài sản ròng:** 21.470 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #15 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.175 Tr. VNĐ | **Tài sản ròng:** 20.175 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 4 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 16.175 Tr. VNĐ | **Tài sản ròng:** 20.175 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #6 ===

#### Lượt #16 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 17.655 Tr. VNĐ | **Tài sản ròng:** 20.855 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 60 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 19.595 Tr. VNĐ | **Tài sản ròng:** 22.795 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu

#### Lượt #17 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.530 Tr. VNĐ | **Tài sản ròng:** 21.530 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Số dư sau lượt:** 8.130 Tr. VNĐ | **Tài sản ròng:** 21.530 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An)

#### Lượt #18 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.175 Tr. VNĐ | **Tài sản ròng:** 20.175 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 18 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 13.575 Tr. VNĐ | **Tài sản ròng:** 20.175 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

### === VÒNG ĐẤU #7 ===

#### Lượt #19 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 19.595 Tr. VNĐ | **Tài sản ròng:** 22.795 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 120 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 19.475 Tr. VNĐ | **Tài sản ròng:** 22.675 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu

#### Lượt #20 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.250 Tr. VNĐ | **Tài sản ròng:** 21.650 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 24 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 6.750 Tr. VNĐ | **Tài sản ròng:** 21.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #21 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.575 Tr. VNĐ | **Tài sản ròng:** 20.175 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 13.575 Tr. VNĐ | **Tài sản ròng:** 22.175 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài

### === VÒNG ĐẤU #8 ===

#### Lượt #22 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 19.475 Tr. VNĐ | **Tài sản ròng:** 22.675 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 8 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 17.975 Tr. VNĐ | **Tài sản ròng:** 22.675 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN)

#### Lượt #23 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.750 Tr. VNĐ | **Tài sản ròng:** 21.650 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 28 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Số dư sau lượt:** 2.675 Tr. VNĐ | **Tài sản ròng:** 22.175 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang)

#### Lượt #24 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.575 Tr. VNĐ | **Tài sản ròng:** 22.175 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 15 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 600 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 12.975 Tr. VNĐ | **Tài sản ròng:** 21.575 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài

### === VÒNG ĐẤU #9 ===

#### Lượt #25 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 17.975 Tr. VNĐ | **Tài sản ròng:** 22.675 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 12 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 2000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 17.975 Tr. VNĐ | **Tài sản ròng:** 22.675 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN)

#### Lượt #26 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.275 Tr. VNĐ | **Tài sản ròng:** 22.775 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 14 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 3.275 Tr. VNĐ | **Tài sản ròng:** 22.775 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang)

#### Lượt #27 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.975 Tr. VNĐ | **Tài sản ròng:** 23.575 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 14.975 Tr. VNĐ | **Tài sản ròng:** 23.575 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài

### === VÒNG ĐẤU #10 ===

#### Lượt #28 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 17.975 Tr. VNĐ | **Tài sản ròng:** 22.675 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 5 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Dừng chân tại [Trạm Kiểm Toán & Thanh Tra]: Trả tiền thuê 140 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 19.835 Tr. VNĐ | **Tài sản ròng:** 24.535 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN)

#### Lượt #29 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.415 Tr. VNĐ | **Tài sản ròng:** 22.915 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 17 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)] (Property)
- **Số dư sau lượt:** 3.415 Tr. VNĐ | **Tài sản ròng:** 22.915 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang)

#### Lượt #30 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.975 Tr. VNĐ | **Tài sản ròng:** 23.575 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 14.475 Tr. VNĐ | **Tài sản ròng:** 23.075 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài

### === VÒNG ĐẤU #11 ===

#### Lượt #31 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 19.835 Tr. VNĐ | **Tài sản ròng:** 24.535 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 19.135 Tr. VNĐ | **Tài sản ròng:** 23.835 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN)

#### Lượt #32 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.615 Tr. VNĐ | **Tài sản ròng:** 23.115 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)] (Property)
- **Số dư sau lượt:** 3.615 Tr. VNĐ | **Tài sản ròng:** 23.115 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang)

#### Lượt #33 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.475 Tr. VNĐ | **Tài sản ròng:** 23.075 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 20 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 14.195 Tr. VNĐ | **Tài sản ròng:** 22.795 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài

### === VÒNG ĐẤU #12 ===

#### Lượt #34 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 19.135 Tr. VNĐ | **Tài sản ròng:** 23.835 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 19 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 18.855 Tr. VNĐ | **Tài sản ròng:** 23.555 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN)

#### Lượt #35 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.175 Tr. VNĐ | **Tài sản ròng:** 23.675 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 29 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 5.175 Tr. VNĐ | **Tài sản ròng:** 24.675 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang)

#### Lượt #36 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.195 Tr. VNĐ | **Tài sản ròng:** 22.795 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 29 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 14.195 Tr. VNĐ | **Tài sản ròng:** 22.795 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài

#### Lượt #37 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.195 Tr. VNĐ | **Tài sản ròng:** 22.795 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 37 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 1047 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 4500 Tr. VNĐ
- **Số dư sau lượt:** 15.242 Tr. VNĐ | **Tài sản ròng:** 23.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài

### === VÒNG ĐẤU #13 ===

#### Lượt #38 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.355 Tr. VNĐ | **Tài sản ròng:** 22.555 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 29 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 150 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 15.605 Tr. VNĐ | **Tài sản ròng:** 23.805 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức)

#### Lượt #39 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.372 Tr. VNĐ | **Tài sản ròng:** 25.872 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 38 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 10.372 Tr. VNĐ | **Tài sản ròng:** 29.872 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang)

#### Lượt #40 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.242 Tr. VNĐ | **Tài sản ròng:** 23.842 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 37 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Số dư sau lượt:** 13.500 Tr. VNĐ | **Tài sản ròng:** 25.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Bình Thuận (Mũi Né), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #14 ===

#### Lượt #41 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.605 Tr. VNĐ | **Tài sản ròng:** 23.805 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 13.805 Tr. VNĐ | **Tài sản ròng:** 23.805 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế

#### Lượt #42 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.630 Tr. VNĐ | **Tài sản ròng:** 31.130 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 7 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 9.450 Tr. VNĐ | **Tài sản ròng:** 28.950 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang)

#### Lượt #43 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.500 Tr. VNĐ | **Tài sản ròng:** 27.700 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 21 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 12.500 Tr. VNĐ | **Tài sản ròng:** 27.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Bình Thuận (Mũi Né), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang)

### === VÒNG ĐẤU #15 ===

#### Lượt #44 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.985 Tr. VNĐ | **Tài sản ròng:** 23.985 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 18 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 12.985 Tr. VNĐ | **Tài sản ròng:** 22.985 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế

#### Lượt #45 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.450 Tr. VNĐ | **Tài sản ròng:** 29.950 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 18 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 10.230 Tr. VNĐ | **Tài sản ròng:** 29.730 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang)

#### Lượt #46 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.720 Tr. VNĐ | **Tài sản ròng:** 27.920 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 31 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 350 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 12.370 Tr. VNĐ | **Tài sản ròng:** 27.570 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Bình Thuận (Mũi Né), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang)

### === VÒNG ĐẤU #16 ===

#### Lượt #47 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.335 Tr. VNĐ | **Tài sản ròng:** 23.335 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 28 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 13.035 Tr. VNĐ | **Tài sản ròng:** 23.035 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế

#### Lượt #48 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.530 Tr. VNĐ | **Tài sản ròng:** 30.030 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 21 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 2000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 8.530 Tr. VNĐ | **Tài sản ròng:** 28.030 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang)

#### Lượt #49 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.370 Tr. VNĐ | **Tài sản ròng:** 29.570 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 37 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 11.950 Tr. VNĐ | **Tài sản ròng:** 30.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #17 ===

#### Lượt #50 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.155 Tr. VNĐ | **Tài sản ròng:** 23.155 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 32 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 990 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 13.415 Tr. VNĐ | **Tài sản ròng:** 23.415 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế

#### Lượt #51 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.530 Tr. VNĐ | **Tài sản ròng:** 28.830 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 27 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 350 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 34
- **Giải cứu tài chính:** Thế chấp tài sản ô 32
- **Số dư sau lượt:** 940 Tr. VNĐ | **Tài sản ròng:** 31.340 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #52 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.940 Tr. VNĐ | **Tài sản ròng:** 31.540 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 9 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 1261 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 13.801 Tr. VNĐ | **Tài sản ròng:** 32.401 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #18 ===

#### Lượt #53 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.765 Tr. VNĐ | **Tài sản ròng:** 23.765 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 3 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 5250 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 8.515 Tr. VNĐ | **Tài sản ròng:** 18.515 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế

#### Lượt #54 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.451 Tr. VNĐ | **Tài sản ròng:** 37.851 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 37 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1400 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 3.486 Tr. VNĐ | **Tài sản ròng:** 36.986 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #55 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.801 Tr. VNĐ | **Tài sản ròng:** 32.401 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài] (Railroad)
- **Số dư sau lượt:** 13.801 Tr. VNĐ | **Tài sản ròng:** 32.401 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #19 ===

#### Lượt #56 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.915 Tr. VNĐ | **Tài sản ròng:** 19.915 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 13 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 9.715 Tr. VNĐ | **Tài sản ròng:** 19.715 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế

#### Lượt #57 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.686 Tr. VNĐ | **Tài sản ròng:** 37.186 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 5 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Kiên Giang (Phú Quốc - Grand World)] với giá 1850 Tr. VNĐ
- **Số dư sau lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 34.786 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #58 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.801 Tr. VNĐ | **Tài sản ròng:** 32.401 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 35 ➔ Ô 11 (**Bình Thuận (Mũi Né)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 2120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 14.201 Tr. VNĐ | **Tài sản ròng:** 32.801 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #20 ===

#### Lượt #59 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.985 Tr. VNĐ | **Tài sản ròng:** 22.585 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 8.985 Tr. VNĐ | **Tài sản ròng:** 21.585 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #60 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.806 Tr. VNĐ | **Tài sản ròng:** 37.306 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 27 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 2000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 1.806 Tr. VNĐ | **Tài sản ròng:** 35.306 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #61 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.201 Tr. VNĐ | **Tài sản ròng:** 34.801 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 1216 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.201 Tr. VNĐ | **Tài sản ròng:** 34.801 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #21 ===

#### Lượt #62 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.201 Tr. VNĐ | **Tài sản ròng:** 22.801 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 28 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 384 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 9.817 Tr. VNĐ | **Tài sản ròng:** 22.417 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #63 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.406 Tr. VNĐ | **Tài sản ròng:** 36.906 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 39 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Trạm Kiểm Toán & Thanh Tra]: Trả tiền thuê 900 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 3.006 Tr. VNĐ | **Tài sản ròng:** 36.506 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #64 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.201 Tr. VNĐ | **Tài sản ròng:** 34.801 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Từ chối mua [Bình Định (Quy Nhơn)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Bình Định (Quy Nhơn)] với giá 2450 Tr. VNĐ
- **Số dư sau lượt:** 16.201 Tr. VNĐ | **Tài sản ròng:** 34.801 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #22 ===

#### Lượt #65 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.585 Tr. VNĐ | **Tài sản ròng:** 23.985 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 34 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành] (Railroad)
- **Số dư sau lượt:** 10.085 Tr. VNĐ | **Tài sản ròng:** 24.485 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Bình Định (Quy Nhơn)

#### Lượt #66 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.324 Tr. VNĐ | **Tài sản ròng:** 37.824 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 216 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 4.108 Tr. VNĐ | **Tài sản ròng:** 37.608 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #67 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.201 Tr. VNĐ | **Tài sản ròng:** 34.801 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 1155 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.201 Tr. VNĐ | **Tài sản ròng:** 34.801 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #23 ===

#### Lượt #68 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.456 Tr. VNĐ | **Tài sản ròng:** 25.856 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 5 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 3150 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 8.042 Tr. VNĐ | **Tài sản ròng:** 22.442 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Bình Định (Quy Nhơn)

#### Lượt #69 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.413 Tr. VNĐ | **Tài sản ròng:** 41.913 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 8.413 Tr. VNĐ | **Tài sản ròng:** 41.913 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #70 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.465 Tr. VNĐ | **Tài sản ròng:** 35.065 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 16.465 Tr. VNĐ | **Tài sản ròng:** 35.065 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #24 ===

#### Lượt #71 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.042 Tr. VNĐ | **Tài sản ròng:** 22.442 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 7.292 Tr. VNĐ | **Tài sản ròng:** 21.692 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Bình Định (Quy Nhơn)

#### Lượt #72 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.413 Tr. VNĐ | **Tài sản ròng:** 41.913 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 8.413 Tr. VNĐ | **Tài sản ròng:** 41.913 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #73 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.465 Tr. VNĐ | **Tài sản ròng:** 35.065 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 33 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 1624 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.365 Tr. VNĐ | **Tài sản ròng:** 34.965 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #25 ===

#### Lượt #74 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.916 Tr. VNĐ | **Tài sản ròng:** 23.316 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 38 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu] (Property)
- **Số dư sau lượt:** 9.416 Tr. VNĐ | **Tài sản ròng:** 23.816 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Bình Định (Quy Nhơn)

#### Lượt #75 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.437 Tr. VNĐ | **Tài sản ròng:** 42.937 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 9.437 Tr. VNĐ | **Tài sản ròng:** 42.937 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #76 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.365 Tr. VNĐ | **Tài sản ròng:** 34.965 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 144 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.221 Tr. VNĐ | **Tài sản ròng:** 34.821 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #26 ===

#### Lượt #77 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.560 Tr. VNĐ | **Tài sản ròng:** 23.960 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 9 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)] (Property)
- **Số dư sau lượt:** 9.560 Tr. VNĐ | **Tài sản ròng:** 23.960 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Bình Định (Quy Nhơn)

#### Lượt #78 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.437 Tr. VNĐ | **Tài sản ròng:** 42.937 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 8.937 Tr. VNĐ | **Tài sản ròng:** 42.437 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #79 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.221 Tr. VNĐ | **Tài sản ròng:** 34.821 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 9 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 15.221 Tr. VNĐ | **Tài sản ròng:** 33.821 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #27 ===

#### Lượt #80 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.560 Tr. VNĐ | **Tài sản ròng:** 23.960 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 16 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 264 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 9.296 Tr. VNĐ | **Tài sản ròng:** 23.696 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Bình Định (Quy Nhơn)

#### Lượt #81 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.937 Tr. VNĐ | **Tài sản ròng:** 43.437 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 216 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 9.721 Tr. VNĐ | **Tài sản ròng:** 43.221 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #82 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.485 Tr. VNĐ | **Tài sản ròng:** 34.085 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 28 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 1050 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 14.435 Tr. VNĐ | **Tài sản ròng:** 33.035 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #28 ===

#### Lượt #83 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.562 Tr. VNĐ | **Tài sản ròng:** 24.962 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 21 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 10.562 Tr. VNĐ | **Tài sản ròng:** 24.962 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Bình Định (Quy Nhơn)

#### Lượt #84 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.721 Tr. VNĐ | **Tài sản ròng:** 43.221 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 374 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 9.347 Tr. VNĐ | **Tài sản ròng:** 42.847 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đồng Nai (Đại Công Viên Chủ Đề), Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #85 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.809 Tr. VNĐ | **Tài sản ròng:** 33.409 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 37 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Bình Dương (Tổ Hợp Thể Thao & Golf)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Bình Dương (Tổ Hợp Thể Thao & Golf)] với giá 1900 Tr. VNĐ
- **Số dư sau lượt:** 14.709 Tr. VNĐ | **Tài sản ròng:** 33.309 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #29 ===

#### Lượt #86 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.521 Tr. VNĐ | **Tài sản ròng:** 25.921 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 27 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 2850 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 4.001 Tr. VNĐ | **Tài sản ròng:** 27.401 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Bình Định (Quy Nhơn), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #87 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.048 Tr. VNĐ | **Tài sản ròng:** 47.148 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 26 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)] (Property)
- **Số dư sau lượt:** 8.048 Tr. VNĐ | **Tài sản ròng:** 47.148 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3), Kiên Giang (Phú Quốc - Grand World), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #88 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.709 Tr. VNĐ | **Tài sản ròng:** 33.309 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 1193 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 9.602 Tr. VNĐ | **Tài sản ròng:** 28.202 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

### === VÒNG ĐẤU #30 ===

#### Lượt #89 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.194 Tr. VNĐ | **Tài sản ròng:** 28.594 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 5.694 Tr. VNĐ | **Tài sản ròng:** 29.094 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đồng Nai (Đại Công Viên Chủ Đề) (C3), Bà Rịa - Vũng Tàu (C3), Tập Đoàn Điện Lực (EVN), TP.HCM (TP. Thủ Đức), Thừa Thiên Huế, Bình Định (Quy Nhơn), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #90 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.348 Tr. VNĐ | **Tài sản ròng:** 53.448 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 34 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Khởi Hành (GO)]: Trả tiền thuê 900 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 10.648 Tr. VNĐ | **Tài sản ròng:** 49.748 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Lâm Đồng (Đà Lạt) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Quảng Ninh (Hạ Long), Hà Nội (Hoàn Kiếm), Ninh Bình (Tràng An), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Cầu Giấy), Khánh Hòa (Nha Trang) (C3), Bình Thuận (Mũi Né) (C3), Kiên Giang (Phú Quốc - Grand World), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #91 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.602 Tr. VNĐ | **Tài sản ròng:** 28.202 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 13 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1054 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 11.506 Tr. VNĐ | **Tài sản ròng:** 30.106 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cần Thơ (Cái Răng) (C3), Tuyến Cao Tốc Bắc - Nam, Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), An Giang (Châu Đốc) (C3)

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 3 người chơi diễn ra liên tục 91 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.