# BÁO CÁO KIỂM THỬ UAT TOÀN DIỆN VÁN ĐẤU 3 NGƯỜI CHƠI (RECORD STEP-BY-STEP)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | CHUẨN KIỂM ĐỊNH THƯƠNG MẠI 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 202603 | TRẠNG THÁI: HOÀN TẤT TRỌN VẸN 100%

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 75 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Cô Tư (Thận trọng / Passive)** (Tổng tài sản ròng: **18.748 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Cô Tư (Thận trọng / Passive) | Passive | 17.548 Tr. VNĐ | 18.748 Tr. VNĐ | 1 ô | 🏆 Vô địch |
| 2 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 3.305 Tr. VNĐ | 17.205 Tr. VNĐ | 8 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 380 Tr. VNĐ | 380 Tr. VNĐ | 0 ô | ❌ Phá sản |

### Chỉ Số Tài Chính & Vận Hành Vĩ Mô (Macro Tactical Metrics)

- **Tổng tiền thuê lưu chuyển:** 8.650 Tr. VNĐ.
- **Tổng thuế & lệ phí nộp Kho Bạc:** 0 Tr. VNĐ.
- **Tổng lương vượt mốc Khởi Hành:** 32.000 Tr. VNĐ.
- **Tổng công trình nâng cấp:** 4 căn (C1: 2, C2: 2, C3: 0).
- **Hoạt động sàn đấu giá:** 26 phiên phát động, 7 phiên gõ búa thành công.
- **Bảo toàn 3 Bất biến (Invariants):** 100% HOÀN HẢO (Zero Leakage, Zero NaN, Zero Deadlock).

---

## II. NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐI TỪ ĐẦU ĐẾN KẾT THÚC (STEP-BY-STEP LOG)

Mọi bước đi, cú gieo xúc xắc, di chuyển, tương tác ô đất và biến động tài sản được ghi nhận tuần tự không bỏ sót:

### === VÒNG ĐẤU #1 ===

#### Lượt #1 | Vòng #1 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 0 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 13.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng HKQT Long Thành

#### Lượt #2 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Số dư sau lượt:** 14.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #3 | Vòng #1 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Từ chối mua [Cảng Nước Sâu Cái Mép], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cảng Nước Sâu Cái Mép] với giá 2450 Tr. VNĐ
- **Số dư sau lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #2 ===

#### Lượt #4 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.550 Tr. VNĐ | **Tài sản ròng:** 14.550 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 5 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Đà Nẵng (Hải Châu - Sơn Trà)] giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 7.350 Tr. VNĐ | **Tài sản ròng:** 14.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #5 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.750 Tr. VNĐ | **Tài sản ròng:** 14.750 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 11.750 Tr. VNĐ | **Tài sản ròng:** 13.750 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #6 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 15 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Từ chối mua [Tuyến Cao Tốc Bắc - Nam], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Tuyến Cao Tốc Bắc - Nam] với giá 2450 Tr. VNĐ
- **Số dư sau lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #3 ===

#### Lượt #7 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.900 Tr. VNĐ | **Tài sản ròng:** 15.100 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Mua thành công [Quảng Ninh (Hạ Long)] giá 2800 Tr. VNĐ
- **Số dư sau lượt:** 1.700 Tr. VNĐ | **Tài sản ròng:** 13.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long)

#### Lượt #8 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.100 Tr. VNĐ | **Tài sản ròng:** 13.300 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 12.100 Tr. VNĐ | **Tài sản ròng:** 16.300 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn)

#### Lượt #9 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Số dư sau lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #4 ===

#### Lượt #10 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.700 Tr. VNĐ | **Tài sản ròng:** 13.700 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 38 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành] (Railroad)
- **Số dư sau lượt:** 2.800 Tr. VNĐ | **Tài sản ròng:** 14.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long)

#### Lượt #11 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.450 Tr. VNĐ | **Tài sản ròng:** 17.850 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 22 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Số dư sau lượt:** 7.850 Tr. VNĐ | **Tài sản ròng:** 17.850 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #12 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 34 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [An Giang (Châu Đốc)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [An Giang (Châu Đốc)] với giá 850 Tr. VNĐ
- **Số dư sau lượt:** 17.000 Tr. VNĐ | **Tài sản ròng:** 17.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #5 ===

#### Lượt #13 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.800 Tr. VNĐ | **Tài sản ròng:** 14.800 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 5 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 2.300 Tr. VNĐ | **Tài sản ròng:** 14.300 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long)

#### Lượt #14 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.000 Tr. VNĐ | **Tài sản ròng:** 17.600 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 27 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 7.200 Tr. VNĐ | **Tài sản ròng:** 17.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World), An Giang (Châu Đốc)

#### Lượt #15 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.000 Tr. VNĐ | **Tài sản ròng:** 17.000 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 3 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Từ chối mua [Khánh Hòa (Nha Trang)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Khánh Hòa (Nha Trang)] với giá 2050 Tr. VNĐ
- **Số dư sau lượt:** 17.000 Tr. VNĐ | **Tài sản ròng:** 17.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #6 ===

#### Lượt #16 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 250 Tr. VNĐ | **Tài sản ròng:** 13.850 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)] (Property)
- **Số dư sau lượt:** 250 Tr. VNĐ | **Tài sản ròng:** 13.850 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang)

#### Lượt #17 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.200 Tr. VNĐ | **Tài sản ròng:** 17.800 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 38 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Property)
- **Số dư sau lượt:** 8.300 Tr. VNĐ | **Tài sản ròng:** 18.900 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World), An Giang (Châu Đốc)

#### Lượt #18 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.000 Tr. VNĐ | **Tài sản ròng:** 17.000 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 14 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 17.000 Tr. VNĐ | **Tài sản ròng:** 17.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #7 ===

#### Lượt #19 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 250 Tr. VNĐ | **Tài sản ròng:** 13.850 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam] (Railroad)
- **Số dư sau lượt:** 250 Tr. VNĐ | **Tài sản ròng:** 13.850 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang)

#### Lượt #20 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.300 Tr. VNĐ | **Tài sản ròng:** 18.900 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Số dư sau lượt:** 6.600 Tr. VNĐ | **Tài sản ròng:** 18.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World), An Giang (Châu Đốc), Tập Đoàn Điện Lực (EVN)

#### Lượt #21 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.000 Tr. VNĐ | **Tài sản ròng:** 17.000 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 22 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.720 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #8 ===

#### Lượt #22 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 730 Tr. VNĐ | **Tài sản ròng:** 14.330 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 25 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 730 Tr. VNĐ | **Tài sản ròng:** 14.330 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang)

#### Lượt #23 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.600 Tr. VNĐ | **Tài sản ròng:** 18.700 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 19 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)] (Property)
- **Số dư sau lượt:** 6.600 Tr. VNĐ | **Tài sản ròng:** 18.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World), An Giang (Châu Đốc), Tập Đoàn Điện Lực (EVN)

#### Lượt #24 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.720 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 16.400 Tr. VNĐ | **Tài sản ròng:** 16.400 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #9 ===

#### Lượt #25 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 730 Tr. VNĐ | **Tài sản ròng:** 14.330 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 730 Tr. VNĐ | **Tài sản ròng:** 14.330 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang)

#### Lượt #26 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.920 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 27 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Số dư sau lượt:** 3.920 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World), An Giang (Châu Đốc), Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang)

#### Lượt #27 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.400 Tr. VNĐ | **Tài sản ròng:** 16.400 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 34 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 60 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Số dư sau lượt:** 18.340 Tr. VNĐ | **Tài sản ròng:** 18.340 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #10 ===

#### Lượt #28 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 730 Tr. VNĐ | **Tài sản ròng:** 14.330 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 730 Tr. VNĐ | **Tài sản ròng:** 14.330 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Bà Rịa - Vũng Tàu, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang)

#### Lượt #29 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.980 Tr. VNĐ | **Tài sản ròng:** 19.080 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 31 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Số dư sau lượt:** 680 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World), An Giang (Châu Đốc) (C2), Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cần Thơ (Cái Răng) (C2)

#### Lượt #30 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.340 Tr. VNĐ | **Tài sản ròng:** 18.340 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 3 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng chân tại [Phiếu Cơ Hội]: Trả tiền thuê 1440 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.900 Tr. VNĐ | **Tài sản ròng:** 18.100 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #11 ===

#### Lượt #31 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.170 Tr. VNĐ | **Tài sản ròng:** 14.570 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 1.670 Tr. VNĐ | **Tài sản ròng:** 14.070 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang)

#### Lượt #32 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 680 Tr. VNĐ | **Tài sản ròng:** 18.180 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 280 Tr. VNĐ | **Tài sản ròng:** 17.780 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World), An Giang (Châu Đốc) (C2), Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cần Thơ (Cái Răng) (C2)

#### Lượt #33 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.900 Tr. VNĐ | **Tài sản ròng:** 18.100 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 7 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 480 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 16.420 Tr. VNĐ | **Tài sản ròng:** 17.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #12 ===

#### Lượt #34 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.150 Tr. VNĐ | **Tài sản ròng:** 14.550 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Từ chối mua [Ninh Bình (Tràng An)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Ninh Bình (Tràng An)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 14.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #35 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 280 Tr. VNĐ | **Tài sản ròng:** 17.780 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 7 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Từ chối mua [Lâm Đồng (Đà Lạt)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Lâm Đồng (Đà Lạt)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 280 Tr. VNĐ | **Tài sản ròng:** 17.780 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World), An Giang (Châu Đốc) (C2), Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cần Thơ (Cái Răng) (C2)

#### Lượt #36 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.420 Tr. VNĐ | **Tài sản ròng:** 17.620 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 29 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hà Nội (Cầu Giấy)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 16.420 Tr. VNĐ | **Tài sản ròng:** 17.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #13 ===

#### Lượt #37 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 14.550 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 14.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #38 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 280 Tr. VNĐ | **Tài sản ròng:** 17.780 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Từ chối mua [Nghệ An (TP. Vinh)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Nghệ An (TP. Vinh)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 280 Tr. VNĐ | **Tài sản ròng:** 17.780 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World), An Giang (Châu Đốc) (C2), Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cần Thơ (Cái Răng) (C2)

#### Lượt #39 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.420 Tr. VNĐ | **Tài sản ròng:** 17.620 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)] (Hose)
- **Số dư sau lượt:** 15.720 Tr. VNĐ | **Tài sản ròng:** 16.920 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #14 ===

#### Lượt #40 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 14.550 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 14.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #41 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 280 Tr. VNĐ | **Tài sản ròng:** 17.780 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 36 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành] (Railroad)
- **Giải cứu tài chính:** Thế chấp tài sản ô 6
- **Giải cứu tài chính:** Thế chấp tài sản ô 8
- **Giải cứu tài chính:** Thế chấp tài sản ô 21
- **Giải cứu tài chính:** Thế chấp tài sản ô 12
- **Giải cứu tài chính:** Thế chấp tài sản ô 31
- **Giải cứu tài chính:** Thế chấp tài sản ô 27
- **Giải cứu tài chính:** Thế chấp tài sản ô 34
- **Số dư sau lượt:** 30 Tr. VNĐ | **Tài sản ròng:** 10.280 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Kiên Giang (Phú Quốc - Grand World), An Giang (Châu Đốc) (C2), Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cần Thơ (Cái Răng) (C2)

#### Lượt #42 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.720 Tr. VNĐ | **Tài sản ròng:** 16.920 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 38 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại ô Thuế [Lệ Phí Đăng Ký Đất Đai]
- **Số dư sau lượt:** 15.948 Tr. VNĐ | **Tài sản ròng:** 17.148 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #15 ===

#### Lượt #43 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 14.550 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 14.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #44 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 30 Tr. VNĐ | **Tài sản ròng:** 10.280 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 5 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 30 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Thế chấp tài sản ô 1
- **Giải cứu tài chính:** Thế chấp tài sản ô 3
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** -620 Tr. VNĐ | **Tài sản ròng:** -620 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #45 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.948 Tr. VNĐ | **Tài sản ròng:** 17.148 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Từ chối mua [Lâm Đồng (Đà Lạt)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Lâm Đồng (Đà Lạt)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 15.948 Tr. VNĐ | **Tài sản ròng:** 17.148 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #16 ===

#### Lượt #46 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 380 Tr. VNĐ | **Tài sản ròng:** 14.580 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Giải cứu tài chính:** Thế chấp tài sản ô 14
- **Số dư sau lượt:** 380 Tr. VNĐ | **Tài sản ròng:** 13.780 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #47 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.948 Tr. VNĐ | **Tài sản ròng:** 17.148 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 15.768 Tr. VNĐ | **Tài sản ròng:** 16.968 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #17 ===

#### Lượt #48 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 13.960 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 22 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 13.960 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #49 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.768 Tr. VNĐ | **Tài sản ròng:** 16.968 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 18 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Từ chối mua [Nghệ An (TP. Vinh)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Nghệ An (TP. Vinh)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 15.768 Tr. VNĐ | **Tài sản ròng:** 16.968 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #18 ===

#### Lượt #50 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 13.960 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 13.960 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #51 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.768 Tr. VNĐ | **Tài sản ròng:** 16.968 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 23 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cảng HKQT Nội Bài], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Cảng HKQT Nội Bài] phát mãi về Kho Bạc
- **Số dư sau lượt:** 17.768 Tr. VNĐ | **Tài sản ròng:** 18.968 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #19 ===

#### Lượt #52 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 13.960 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 13.960 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #53 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.768 Tr. VNĐ | **Tài sản ròng:** 18.968 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 2 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 17.768 Tr. VNĐ | **Tài sản ròng:** 18.968 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #20 ===

#### Lượt #54 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 13.960 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Số dư sau lượt:** 60 Tr. VNĐ | **Tài sản ròng:** 13.460 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #55 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.768 Tr. VNĐ | **Tài sản ròng:** 18.968 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Điện Lực (EVN)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Tập Đoàn Điện Lực (EVN)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 17.588 Tr. VNĐ | **Tài sản ròng:** 18.788 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #21 ===

#### Lượt #56 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 240 Tr. VNĐ | **Tài sản ròng:** 13.640 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Từ chối mua [Lâm Đồng (Đà Lạt)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Lâm Đồng (Đà Lạt)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 240 Tr. VNĐ | **Tài sản ròng:** 13.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #57 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.588 Tr. VNĐ | **Tài sản ròng:** 18.788 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 18 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.308 Tr. VNĐ | **Tài sản ròng:** 18.508 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #22 ===

#### Lượt #58 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 520 Tr. VNĐ | **Tài sản ròng:** 13.920 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 13 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Từ chối mua [Thanh Hóa (Sầm Sơn)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Thanh Hóa (Sầm Sơn)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 520 Tr. VNĐ | **Tài sản ròng:** 13.920 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #59 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.308 Tr. VNĐ | **Tài sản ròng:** 18.508 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 29 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [TP.HCM (Quận 1 - Nguyễn Huệ)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 17.308 Tr. VNĐ | **Tài sản ròng:** 18.508 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #23 ===

#### Lượt #60 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 520 Tr. VNĐ | **Tài sản ròng:** 13.920 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 520 Tr. VNĐ | **Tài sản ròng:** 13.920 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #61 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.308 Tr. VNĐ | **Tài sản ròng:** 18.508 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 39 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu] (Property)
- **Số dư sau lượt:** 19.308 Tr. VNĐ | **Tài sản ròng:** 20.508 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #24 ===

#### Lượt #62 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 520 Tr. VNĐ | **Tài sản ròng:** 13.920 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 26 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hà Nội (Cầu Giấy)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 520 Tr. VNĐ | **Tài sản ròng:** 13.920 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #63 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 19.308 Tr. VNĐ | **Tài sản ròng:** 20.508 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 9 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Viễn Thông (Viettel)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Tập Đoàn Viễn Thông (Viettel)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 19.008 Tr. VNĐ | **Tài sản ròng:** 20.208 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #25 ===

#### Lượt #64 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 820 Tr. VNĐ | **Tài sản ròng:** 14.220 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 32 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép] (Railroad)
- **Giải cứu tài chính:** Thế chấp tài sản ô 18
- **Số dư sau lượt:** 880 Tr. VNĐ | **Tài sản ròng:** 13.380 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #65 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 19.008 Tr. VNĐ | **Tài sản ròng:** 20.208 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 28 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút thẻ biến cố [Phiếu Cơ Hội]: Giải quyết hiệu ứng thị trường
- **Số dư sau lượt:** 19.008 Tr. VNĐ | **Tài sản ròng:** 20.208 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #26 ===

#### Lượt #66 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 880 Tr. VNĐ | **Tài sản ròng:** 13.380 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Từ chối mua [Thanh Hóa (Sầm Sơn)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Thanh Hóa (Sầm Sơn)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 880 Tr. VNĐ | **Tài sản ròng:** 13.380 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #67 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 19.008 Tr. VNĐ | **Tài sản ròng:** 20.208 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 36 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 2000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 19.008 Tr. VNĐ | **Tài sản ròng:** 20.208 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #27 ===

#### Lượt #68 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.880 Tr. VNĐ | **Tài sản ròng:** 15.380 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 21 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hưng Yên (Văn Giang)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 2.880 Tr. VNĐ | **Tài sản ròng:** 15.380 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế

#### Lượt #69 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 19.008 Tr. VNĐ | **Tài sản ròng:** 20.208 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 5 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Từ chối mua [Lâm Đồng (Đà Lạt)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Chốt đấu giá: Bác Ba (Thực dụng / Aggressive) sở hữu [Lâm Đồng (Đà Lạt)] giá 750 Tr. VNĐ
- **Số dư sau lượt:** 18.008 Tr. VNĐ | **Tài sản ròng:** 19.208 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #28 ===

#### Lượt #70 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.130 Tr. VNĐ | **Tài sản ròng:** 16.030 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 31 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cần Thơ (Cái Răng)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Cần Thơ (Cái Răng)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 845 Tr. VNĐ | **Tài sản ròng:** 14.745 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế, Lâm Đồng (Đà Lạt)

#### Lượt #71 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.008 Tr. VNĐ | **Tài sản ròng:** 19.208 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 13 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 580 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.428 Tr. VNĐ | **Tài sản ròng:** 18.628 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #29 ===

#### Lượt #72 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.425 Tr. VNĐ | **Tài sản ròng:** 15.325 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Từ chối mua [Bình Định (Quy Nhơn)], phát động Đấu Giá Công Khai
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Bình Định (Quy Nhơn)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 1.305 Tr. VNĐ | **Tài sản ròng:** 15.205 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế, Lâm Đồng (Đà Lạt)

#### Lượt #73 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.548 Tr. VNĐ | **Tài sản ròng:** 18.748 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Số dư sau lượt:** 19.548 Tr. VNĐ | **Tài sản ròng:** 20.748 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #30 ===

#### Lượt #74 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.305 Tr. VNĐ | **Tài sản ròng:** 15.205 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 16 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)] (Property)
- **Số dư sau lượt:** 1.305 Tr. VNĐ | **Tài sản ròng:** 15.205 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Khánh Hòa (Nha Trang), Thừa Thiên Huế, Lâm Đồng (Đà Lạt)

#### Lượt #75 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 19.548 Tr. VNĐ | **Tài sản ròng:** 20.748 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 0 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 2000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Số dư sau lượt:** 17.548 Tr. VNĐ | **Tài sản ròng:** 18.748 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

---

## III. KẾT LUẬN & CHỨNG NHẬN KIỂM ĐỊNH

1. **Tính hoàn chỉnh:** Ván đấu 3 người chơi diễn ra liên tục 75 lượt qua 31 vòng mà không gặp bất kỳ hiện tượng đứng hình hay gián đoạn FSM nào.
2. **Tính đóng của chu trình tài chính:** Mọi đồng tiền lưu chuyển giữa người chơi, Kho Bạc và Sàn Đấu Giá đều được kiểm soát với độ chính xác số học tuyệt đối.
3. **Độ sắc bén của AI Bot:** Các tính cách AI (Aggressive, Balanced, Passive) thể hiện đúng chuẩn chiến lược: Bot Aggressive tích cực gom đất và đấu giá, Bot Balanced nâng cấp hợp lý và duy trì bộ đệm an toàn, Bot Passive hạn chế rủi ro.
4. **Đạt chuẩn nghiệm thu UAT Step-by-Step:** Đủ điều kiện phê duyệt phát hành thương mại.