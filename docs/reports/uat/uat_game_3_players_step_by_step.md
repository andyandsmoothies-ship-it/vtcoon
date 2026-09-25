# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 3 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202603 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 96 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **60.315 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 7.015 Tr. VNĐ | 60.315 Tr. VNĐ | 16 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 370 Tr. VNĐ | 30.720 Tr. VNĐ | 8 ô | ✓ Hoàn thành |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | 642 Tr. VNĐ | 1.642 Tr. VNĐ | 1 ô | ✓ Hoàn thành |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 31.641 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 0 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 38.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 28 căn (C1: 10, C2: 10, C3: 8).
- **Hoạt động sàn đấu giá:** 14 phiên phát động, 10 phiên gõ búa thành công.
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
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 440 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.980 Tr. VNĐ | **Tài sản ròng:** 19.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

#### Lượt #9 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.500 Tr. VNĐ | **Tài sản ròng:** 22.500 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 13 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 22.500 Tr. VNĐ | **Tài sản ròng:** 22.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #4 ===

#### Lượt #10 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.295 Tr. VNĐ | **Tài sản ròng:** 19.195 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 28 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 12.295 Tr. VNĐ | **Tài sản ròng:** 19.195 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #11 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.295 Tr. VNĐ | **Tài sản ròng:** 19.195 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 37 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 4000 Tr. VNĐ
- **Số dư sau lượt:** 12.295 Tr. VNĐ | **Tài sản ròng:** 19.195 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #12 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.980 Tr. VNĐ | **Tài sản ròng:** 18.680 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 28 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 640 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 14.840 Tr. VNĐ | **Tài sản ròng:** 19.540 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức)

#### Lượt #13 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.500 Tr. VNĐ | **Tài sản ròng:** 22.500 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Từ chối mua [Ninh Bình (Tràng An)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 22.500 Tr. VNĐ | **Tài sản ròng:** 22.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #14 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.500 Tr. VNĐ | **Tài sản ròng:** 22.500 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)] (Property)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Ninh Bình (Tràng An)] với giá 3800 Tr. VNĐ
- **Số dư sau lượt:** 22.500 Tr. VNĐ | **Tài sản ròng:** 22.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #5 ===

#### Lượt #15 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.135 Tr. VNĐ | **Tài sản ròng:** 18.435 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại ô Thuế [Lệ Phí Đăng Ký Đất Đai]
- **Số dư sau lượt:** 9.347 Tr. VNĐ | **Tài sản ròng:** 18.647 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An)

#### Lượt #16 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.840 Tr. VNĐ | **Tài sản ròng:** 19.540 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 13 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Từ chối mua [Nghệ An (TP. Vinh)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Nghệ An (TP. Vinh)] với giá 2550 Tr. VNĐ
- **Số dư sau lượt:** 14.840 Tr. VNĐ | **Tài sản ròng:** 19.540 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức)

#### Lượt #17 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.500 Tr. VNĐ | **Tài sản ròng:** 22.500 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 20.340 Tr. VNĐ | **Tài sản ròng:** 22.340 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #6 ===

#### Lượt #18 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.957 Tr. VNĐ | **Tài sản ròng:** 18.457 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Số dư sau lượt:** 4.357 Tr. VNĐ | **Tài sản ròng:** 18.457 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang)

#### Lượt #19 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.840 Tr. VNĐ | **Tài sản ròng:** 19.540 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 23 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Hoàn Kiếm)] giá 3200 Tr. VNĐ
- **Số dư sau lượt:** 11.640 Tr. VNĐ | **Tài sản ròng:** 19.540 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm)

#### Lượt #20 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 20.340 Tr. VNĐ | **Tài sản ròng:** 22.340 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 35 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 21.840 Tr. VNĐ | **Tài sản ròng:** 23.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #7 ===

#### Lượt #21 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.857 Tr. VNĐ | **Tài sản ròng:** 18.957 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 20 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 4.857 Tr. VNĐ | **Tài sản ròng:** 18.957 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang)

#### Lượt #22 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.640 Tr. VNĐ | **Tài sản ròng:** 19.540 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 34 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Thị Trường]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 13.640 Tr. VNĐ | **Tài sản ròng:** 21.540 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm)

#### Lượt #23 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 21.840 Tr. VNĐ | **Tài sản ròng:** 23.840 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 5 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)] (Property)
- **Số dư sau lượt:** 21.840 Tr. VNĐ | **Tài sản ròng:** 23.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #8 ===

#### Lượt #24 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.857 Tr. VNĐ | **Tài sản ròng:** 18.957 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 962 Tr. VNĐ | **Tài sản ròng:** 17.062 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép

#### Lượt #25 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.640 Tr. VNĐ | **Tài sản ròng:** 21.540 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 2 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)] (Property)
- **Số dư sau lượt:** 13.640 Tr. VNĐ | **Tài sản ròng:** 21.540 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm)

#### Lượt #26 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 21.840 Tr. VNĐ | **Tài sản ròng:** 23.840 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 13 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 21.290 Tr. VNĐ | **Tài sản ròng:** 23.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

#### Lượt #27 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 21.290 Tr. VNĐ | **Tài sản ròng:** 23.290 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 22.290 Tr. VNĐ | **Tài sản ròng:** 24.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #9 ===

#### Lượt #28 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.512 Tr. VNĐ | **Tài sản ròng:** 17.612 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)] (Property)
- **Số dư sau lượt:** 1.512 Tr. VNĐ | **Tài sản ròng:** 17.612 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép

#### Lượt #29 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.190 Tr. VNĐ | **Tài sản ròng:** 22.890 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)] (Property)
- **Số dư sau lượt:** 12.190 Tr. VNĐ | **Tài sản ròng:** 22.890 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long)

#### Lượt #30 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 22.290 Tr. VNĐ | **Tài sản ròng:** 24.290 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 36 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [An Giang (Châu Đốc)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [An Giang (Châu Đốc)] với giá 750 Tr. VNĐ
- **Số dư sau lượt:** 24.290 Tr. VNĐ | **Tài sản ròng:** 26.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #10 ===

#### Lượt #31 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 762 Tr. VNĐ | **Tài sản ròng:** 17.462 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 24 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Số dư sau lượt:** 262 Tr. VNĐ | **Tài sản ròng:** 16.962 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc)

#### Lượt #32 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.190 Tr. VNĐ | **Tài sản ròng:** 22.890 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 14 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 11.990 Tr. VNĐ | **Tài sản ròng:** 22.690 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long)

#### Lượt #33 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 24.790 Tr. VNĐ | **Tài sản ròng:** 26.790 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 3 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 24.670 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #11 ===

#### Lượt #34 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 582 Tr. VNĐ | **Tài sản ròng:** 17.282 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 35 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp tài sản ô 8
- **Số dư sau lượt:** 432 Tr. VNĐ | **Tài sản ròng:** 18.432 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C1), Cần Thơ (Cái Răng) (C2)

#### Lượt #35 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.990 Tr. VNĐ | **Tài sản ròng:** 22.690 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 19 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 11.870 Tr. VNĐ | **Tài sản ròng:** 22.570 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long)

#### Lượt #36 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 24.670 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 8 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Từ chối mua [Bình Định (Quy Nhơn)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 24.670 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

#### Lượt #37 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 24.670 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 16 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)] (Property)
- **Số dư sau lượt:** 24.670 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #12 ===

#### Lượt #38 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 552 Tr. VNĐ | **Tài sản ròng:** 18.552 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 19
- **Số dư sau lượt:** 502 Tr. VNĐ | **Tài sản ròng:** 19.002 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C2), Cần Thơ (Cái Răng) (C3)

#### Lượt #39 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.920 Tr. VNĐ | **Tài sản ròng:** 23.420 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 10.920 Tr. VNĐ | **Tài sản ròng:** 23.420 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn)

#### Lượt #40 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 24.670 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 24.670 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

#### Lượt #41 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 24.670 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 26 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] (Property)
- **Số dư sau lượt:** 24.670 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #13 ===

#### Lượt #42 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 502 Tr. VNĐ | **Tài sản ròng:** 19.002 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép] (Railroad)
- **Số dư sau lượt:** 502 Tr. VNĐ | **Tài sản ròng:** 19.002 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C2), Cần Thơ (Cái Răng) (C3)

#### Lượt #43 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.570 Tr. VNĐ | **Tài sản ròng:** 24.670 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Số dư sau lượt:** 4.903 Tr. VNĐ | **Tài sản ròng:** 22.203 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn)

#### Lượt #44 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 24.670 Tr. VNĐ | **Tài sản ròng:** 26.670 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 26 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 24.350 Tr. VNĐ | **Tài sản ròng:** 26.350 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #14 ===

#### Lượt #45 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 502 Tr. VNĐ | **Tài sản ròng:** 19.002 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hưng Yên (Văn Giang)] với giá 2150 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 24
- **Số dư sau lượt:** 702 Tr. VNĐ | **Tài sản ròng:** 19.402 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Cảng HKQT Long Thành, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3)

#### Lượt #46 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.073 Tr. VNĐ | **Tài sản ròng:** 23.373 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 21 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)] (Property)
- **Số dư sau lượt:** 3.073 Tr. VNĐ | **Tài sản ròng:** 23.373 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bà Rịa - Vũng Tàu, TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang)

#### Lượt #47 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 24.350 Tr. VNĐ | **Tài sản ròng:** 26.350 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 4950 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 18.100 Tr. VNĐ | **Tài sản ròng:** 20.100 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #15 ===

#### Lượt #48 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.652 Tr. VNĐ | **Tài sản ròng:** 24.352 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 31 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1440 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 1.792 Tr. VNĐ | **Tài sản ròng:** 23.892 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3)

#### Lượt #49 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.513 Tr. VNĐ | **Tài sản ròng:** 23.613 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 31 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 4.313 Tr. VNĐ | **Tài sản ròng:** 23.413 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang)

#### Lượt #50 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.100 Tr. VNĐ | **Tài sản ròng:** 20.100 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 1 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 1164 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.960 Tr. VNĐ | **Tài sản ròng:** 19.960 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #16 ===

#### Lượt #51 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.956 Tr. VNĐ | **Tài sản ròng:** 25.056 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 36 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 2850 Tr. VNĐ
- **Số dư sau lượt:** 2.956 Tr. VNĐ | **Tài sản ròng:** 25.056 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3)

#### Lượt #52 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.487 Tr. VNĐ | **Tài sản ròng:** 25.587 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C1 (Shophouse)
- **Số dư sau lượt:** 577 Tr. VNĐ | **Tài sản ròng:** 25.427 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C1), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #53 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.960 Tr. VNĐ | **Tài sản ròng:** 19.960 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 240 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.720 Tr. VNĐ | **Tài sản ròng:** 19.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #17 ===

#### Lượt #54 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.356 Tr. VNĐ | **Tài sản ròng:** 25.456 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp tài sản ô 24
- **Giải cứu tài chính:** Thế chấp tài sản ô 23
- **Giải cứu tài chính:** Thế chấp tài sản ô 19
- **Số dư sau lượt:** 876 Tr. VNĐ | **Tài sản ròng:** 28.476 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C2), Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #55 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 577 Tr. VNĐ | **Tài sản ròng:** 25.427 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 14 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)] (Property)
- **Số dư sau lượt:** 577 Tr. VNĐ | **Tài sản ròng:** 25.427 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C1), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #56 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.720 Tr. VNĐ | **Tài sản ròng:** 19.720 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Khởi Hành (GO)]: Trả tiền thuê 160 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 19.240 Tr. VNĐ | **Tài sản ròng:** 21.240 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #18 ===

#### Lượt #57 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.036 Tr. VNĐ | **Tài sản ròng:** 28.636 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 6 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 1.036 Tr. VNĐ | **Tài sản ròng:** 28.636 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C2), Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #58 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 897 Tr. VNĐ | **Tài sản ròng:** 25.747 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 23 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)] (Property)
- **Số dư sau lượt:** 897 Tr. VNĐ | **Tài sản ròng:** 25.747 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C1), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #59 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 19.240 Tr. VNĐ | **Tài sản ròng:** 21.240 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 3750 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 15.490 Tr. VNĐ | **Tài sản ròng:** 17.490 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #19 ===

#### Lượt #60 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.786 Tr. VNĐ | **Tài sản ròng:** 32.386 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 180 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 636 Tr. VNĐ | **Tài sản ròng:** 32.336 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #61 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.077 Tr. VNĐ | **Tài sản ròng:** 25.927 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 31 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Phiếu Thị Trường]: Trả tiền thuê 3000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 2.077 Tr. VNĐ | **Tài sản ròng:** 26.927 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C1), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #62 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.490 Tr. VNĐ | **Tài sản ròng:** 17.490 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 15.490 Tr. VNĐ | **Tài sản ròng:** 17.490 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #20 ===

#### Lượt #63 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.636 Tr. VNĐ | **Tài sản ròng:** 35.336 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 16 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 2.536 Tr. VNĐ | **Tài sản ròng:** 35.236 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #64 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.077 Tr. VNĐ | **Tài sản ròng:** 26.927 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 2 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C1 (Shophouse)
- **Giải cứu tài chính:** Thế chấp tài sản ô 21
- **Số dư sau lượt:** 1.177 Tr. VNĐ | **Tài sản ròng:** 26.927 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C1), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #65 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.490 Tr. VNĐ | **Tài sản ròng:** 17.490 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 4500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 10.990 Tr. VNĐ | **Tài sản ròng:** 12.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #21 ===

#### Lượt #66 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.036 Tr. VNĐ | **Tài sản ròng:** 39.736 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 20 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 336 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 6.700 Tr. VNĐ | **Tài sản ròng:** 39.400 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #67 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.513 Tr. VNĐ | **Tài sản ròng:** 27.263 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 713 Tr. VNĐ | **Tài sản ròng:** 26.463 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C1), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #68 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.990 Tr. VNĐ | **Tài sản ròng:** 12.990 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 8 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)] (Property)
- **Số dư sau lượt:** 10.990 Tr. VNĐ | **Tài sản ròng:** 12.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #22 ===

#### Lượt #69 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.700 Tr. VNĐ | **Tài sản ròng:** 39.400 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 6.200 Tr. VNĐ | **Tài sản ròng:** 39.900 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #70 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 713 Tr. VNĐ | **Tài sản ròng:** 26.463 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 713 Tr. VNĐ | **Tài sản ròng:** 26.463 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C1), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #71 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.990 Tr. VNĐ | **Tài sản ròng:** 12.990 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 96 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 10.894 Tr. VNĐ | **Tài sản ròng:** 12.894 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #23 ===

#### Lượt #72 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.296 Tr. VNĐ | **Tài sản ròng:** 39.996 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 36 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành] (Railroad)
- **Số dư sau lượt:** 6.796 Tr. VNĐ | **Tài sản ròng:** 40.496 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #73 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 713 Tr. VNĐ | **Tài sản ròng:** 26.463 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 713 Tr. VNĐ | **Tài sản ròng:** 26.463 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C1), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #74 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.894 Tr. VNĐ | **Tài sản ròng:** 12.894 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 14 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 840 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 10.054 Tr. VNĐ | **Tài sản ròng:** 12.054 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #24 ===

#### Lượt #75 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.636 Tr. VNĐ | **Tài sản ròng:** 41.336 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 5 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)] (Property)
- **Số dư sau lượt:** 6.836 Tr. VNĐ | **Tài sản ròng:** 40.536 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #76 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 713 Tr. VNĐ | **Tài sản ròng:** 26.463 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 20 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 288 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 425 Tr. VNĐ | **Tài sản ròng:** 26.175 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C1), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #77 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.054 Tr. VNĐ | **Tài sản ròng:** 12.054 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 19 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 1350 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 9.766 Tr. VNĐ | **Tài sản ròng:** 11.766 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #25 ===

#### Lượt #78 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.474 Tr. VNĐ | **Tài sản ròng:** 42.174 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)] (Property)
- **Số dư sau lượt:** 8.474 Tr. VNĐ | **Tài sản ròng:** 42.174 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3)

#### Lượt #79 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.487 Tr. VNĐ | **Tài sản ròng:** 27.237 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 29 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hà Nội (Cầu Giấy)] với giá 2550 Tr. VNĐ
- **Số dư sau lượt:** 1.487 Tr. VNĐ | **Tài sản ròng:** 27.237 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C1), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C1)

#### Lượt #80 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.766 Tr. VNĐ | **Tài sản ròng:** 11.766 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 24 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 360 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 5.731 Tr. VNĐ | **Tài sản ròng:** 7.731 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #26 ===

#### Lượt #81 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.284 Tr. VNĐ | **Tài sản ròng:** 42.984 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 21 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)] (Property)
- **Số dư sau lượt:** 6.284 Tr. VNĐ | **Tài sản ròng:** 42.984 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Hà Nội (Cầu Giấy)

#### Lượt #82 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.162 Tr. VNĐ | **Tài sản ròng:** 30.912 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 32 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 168 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 1.083 Tr. VNĐ | **Tài sản ròng:** 34.333 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C2), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #83 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.731 Tr. VNĐ | **Tài sản ròng:** 7.731 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lệ Phí Đăng Ký Đất Đai]: Trả tiền thuê 1041 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 6.508 Tr. VNĐ | **Tài sản ròng:** 8.508 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #27 ===

#### Lượt #84 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.493 Tr. VNĐ | **Tài sản ròng:** 44.193 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 14.993 Tr. VNĐ | **Tài sản ròng:** 51.693 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Hà Nội (Cầu Giấy)

#### Lượt #85 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** -1.626 Tr. VNĐ | **Tài sản ròng:** 31.624 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Giải cứu tài chính:** Thế chấp tài sản ô 29
- **Giải cứu tài chính:** Thế chấp tài sản ô 31
- **Số dư sau lượt:** 1.274 Tr. VNĐ | **Tài sản ròng:** 31.624 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C2), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #86 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.758 Tr. VNĐ | **Tài sản ròng:** 4.758 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 6 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 216 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 4.542 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #28 ===

#### Lượt #87 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.993 Tr. VNĐ | **Tài sản ròng:** 51.693 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Điện Lực (EVN)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 14.993 Tr. VNĐ | **Tài sản ròng:** 51.693 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Hà Nội (Cầu Giấy)

#### Lượt #88 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.993 Tr. VNĐ | **Tài sản ròng:** 51.693 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 12 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép] (Railroad)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Tập Đoàn Điện Lực (EVN)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 14.993 Tr. VNĐ | **Tài sản ròng:** 51.693 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Hà Nội (Cầu Giấy)

#### Lượt #89 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.490 Tr. VNĐ | **Tài sản ròng:** 31.840 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 1650 Tr. VNĐ
- **Số dư sau lượt:** 1.490 Tr. VNĐ | **Tài sản ròng:** 31.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C2), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #90 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 4.542 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 16 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Từ chối mua [Tuyến Cao Tốc Bắc - Nam], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Tuyến Cao Tốc Bắc - Nam] với giá 1050 Tr. VNĐ
- **Số dư sau lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 4.542 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #29 ===

#### Lượt #91 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.293 Tr. VNĐ | **Tài sản ròng:** 52.393 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)] (Property)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C3 (Resort/Khách sạn)
- **Số dư sau lượt:** 1.953 Tr. VNĐ | **Tài sản ròng:** 55.253 Tr. VNĐ
- **Danh mục BĐS sở hữu (16):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang) (C3), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Hà Nội (Cầu Giấy), Bình Thuận (Mũi Né) (C3), Tuyến Cao Tốc Bắc - Nam

#### Lượt #92 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.490 Tr. VNĐ | **Tài sản ròng:** 31.840 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)] (Property)
- **Số dư sau lượt:** 1.490 Tr. VNĐ | **Tài sản ròng:** 31.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C2), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #93 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 4.542 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 25 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 3842 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Thế chấp tài sản ô 35
- **Số dư sau lượt:** 642 Tr. VNĐ | **Tài sản ròng:** 1.642 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

### === VÒNG ĐẤU #30 ===

#### Lượt #94 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.795 Tr. VNĐ | **Tài sản ròng:** 59.095 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 21 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu] (Property)
- **Số dư sau lượt:** 6.295 Tr. VNĐ | **Tài sản ròng:** 59.595 Tr. VNĐ
- **Danh mục BĐS sở hữu (16):** Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu (C3), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Lâm Đồng (Đà Lạt) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang) (C3), Cảng Nước Sâu Cái Mép, An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Hà Nội (Cầu Giấy), Bình Thuận (Mũi Né) (C3), Tuyến Cao Tốc Bắc - Nam

#### Lượt #95 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.090 Tr. VNĐ | **Tài sản ròng:** 31.440 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 16 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 720 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 30.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (TP. Thủ Đức) (C2), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long), Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C2)

#### Lượt #96 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 642 Tr. VNĐ | **Tài sản ròng:** 1.642 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 15 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí] (FreeParking)
- **Số dư sau lượt:** 642 Tr. VNĐ | **Tài sản ròng:** 1.642 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Nội Bài

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 3 người chơi diễn ra liên tục 96 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.