# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (3 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920263 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 78 lượt.
- **Số vòng thi đấu (Rounds):** 23 vòng.
- **Điều kiện kết thúc:** LOẠI BỎ DO PHÁ SẢN (Chỉ còn 1 người sống sót).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **56.540 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 11.240 Tr. VNĐ | 56.540 Tr. VNĐ | 15 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 0 Tr. VNĐ | 0 Tr. VNĐ | 0 ô | ❌ Phá sản |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | 0 Tr. VNĐ | 0 Tr. VNĐ | 0 ô | ❌ Phá sản |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 117 lần.
- Số giao dịch sang tên thành công: 20 thương vụ.
- Tổng giá trị chuyển nhượng đất: 53.560 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 2.678 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 0 phiên.
- Tổng vốn cọc đầu tư: 0 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 0 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: 0 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 1 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 2 lần.
- Tổng giá trị thanh toán chuộc đất: 1.430 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_JUNK_STOCK | Thẻ Cơ Hội | 1 lần | 25.0% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 25.0% |
| CC_CONTRACT_PENALTY | Thẻ Cơ Hội | 1 lần | 25.0% |
| CC_CONCERT_SPONSOR | Thẻ Cơ Hội | 1 lần | 25.0% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_URBAN_PLANNING | Thẻ Thị Trường | 1 lần | 20.0% |
| MC_FIRE_INSPECTION | Thẻ Thị Trường | 1 lần | 20.0% |
| MC_PUBLIC_INVEST | Thẻ Thị Trường | 1 lần | 20.0% |
| MC_CASINO_PILOT | Thẻ Thị Trường | 1 lần | 20.0% |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 20.0% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 0 lần | 0.0% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 7 lần | 9.0% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 2 lần | 2.6% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 3 lần | 3.8% |
| Cảng HKQT Long Thành | Đặc biệt | 2 lần | 2.6% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 0 lần | 0.0% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 2 lần | 2.6% |
| Cảng HKQT Nội Bài | Đặc biệt | 0 lần | 0.0% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 1 lần | 1.3% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 4 lần | 5.1% |

---

## IV. NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐI TỪ ĐẦU ĐẾN KẾT THÚC (STEP-BY-STEP LOG)

### === VÒNG ĐẤU #1 ===

#### Lượt #1 | Vòng #1 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 19.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #2 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Bác Ba (Thực dụng / Aggressive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 18.580 Tr. VNĐ | **Tài sản ròng:** 19.580 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #3 | Vòng #1 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 20.000 Tr. VNĐ | **Tài sản ròng:** 20.000 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 0 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Mua thành công [Đồng Nai (Đại Công Viên Chủ Đề)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 17.700 Tr. VNĐ | **Tài sản ròng:** 19.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #2 ===

#### Lượt #4 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 20.355 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 18.855 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Tập Đoàn Điện Lực (EVN)

#### Lượt #5 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 19.815 Tr. VNĐ | **Tài sản ròng:** 19.815 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 6 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 18.215 Tr. VNĐ | **Tài sản ròng:** 19.815 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Khánh Hòa (Nha Trang)

#### Lượt #6 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.700 Tr. VNĐ | **Tài sản ròng:** 19.700 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 8 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Đà Nẵng (Hải Châu - Sơn Trà)] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Chú Sáu (Cân bằng / Balanced) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 13.620 Tr. VNĐ | **Tài sản ròng:** 19.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà)

### === VÒNG ĐẤU #3 ===

#### Lượt #7 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.855 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 12 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 18.855 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Tập Đoàn Điện Lực (EVN)

#### Lượt #8 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 20.191 Tr. VNĐ | **Tài sản ròng:** 20.191 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 17.991 Tr. VNĐ | **Tài sản ròng:** 20.191 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Thanh Hóa (Sầm Sơn)

#### Lượt #9 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.620 Tr. VNĐ | **Tài sản ròng:** 19.220 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Mua thành công [Tuyến Cao Tốc Bắc - Nam] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 8.760 Tr. VNĐ | **Tài sản ròng:** 18.560 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam

### === VÒNG ĐẤU #4 ===

#### Lượt #10 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.855 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 20 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 16.455 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tập Đoàn Điện Lực (EVN), Ninh Bình (Tràng An)

#### Lượt #11 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 20.708 Tr. VNĐ | **Tài sản ròng:** 20.708 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 21 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 14.988 Tr. VNĐ | **Tài sản ròng:** 19.988 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #12 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.760 Tr. VNĐ | **Tài sản ròng:** 18.560 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 25 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Cầu Giấy)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Chú Sáu (Cân bằng / Balanced) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #5 ===

#### Lượt #13 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 19.419 Tr. VNĐ | **Tài sản ròng:** 20.919 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 24 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 13.439 Tr. VNĐ | **Tài sản ròng:** 20.139 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #14 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.439 Tr. VNĐ | **Tài sản ròng:** 20.139 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 26 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 1500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 11.939 Tr. VNĐ | **Tài sản ròng:** 20.139 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #15 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.939 Tr. VNĐ | **Tài sản ròng:** 20.139 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 28 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_JUNK_STOCK]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 10.439 Tr. VNĐ | **Tài sản ròng:** 18.639 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #16 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 21.163 Tr. VNĐ | **Tài sản ròng:** 21.163 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Hoàn Kiếm)] giá 3200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 14.583 Tr. VNĐ | **Tài sản ròng:** 20.383 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

#### Lượt #17 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 32 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.040 Tr. VNĐ | **Tài sản ròng:** 18.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), An Giang (Châu Đốc)

### === VÒNG ĐẤU #6 ===

#### Lượt #18 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.650 Tr. VNĐ | **Tài sản ròng:** 19.250 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 36 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 60 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 12.210 Tr. VNĐ | **Tài sản ròng:** 20.410 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #19 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 17.794 Tr. VNĐ | **Tài sản ròng:** 20.994 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 15.814 Tr. VNĐ | **Tài sản ròng:** 22.214 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #20 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.100 Tr. VNĐ | **Tài sản ròng:** 18.900 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 3 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.100 Tr. VNĐ | **Tài sản ròng:** 18.900 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), An Giang (Châu Đốc)

### === VÒNG ĐẤU #7 ===

#### Lượt #21 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.421 Tr. VNĐ | **Tài sản ròng:** 21.021 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 3 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 14.541 Tr. VNĐ | **Tài sản ròng:** 22.741 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #22 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 19.025 Tr. VNĐ | **Tài sản ròng:** 22.825 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 1 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 15.525 Tr. VNĐ | **Tài sản ròng:** 21.925 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #23 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.220 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.220 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), An Giang (Châu Đốc)

### === VÒNG ĐẤU #8 ===

#### Lượt #24 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 17.752 Tr. VNĐ | **Tài sản ròng:** 23.352 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 7 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_URBAN_PLANNING]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 14.372 Tr. VNĐ | **Tài sản ròng:** 22.572 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #25 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.736 Tr. VNĐ | **Tài sản ròng:** 22.536 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 2100 Tr. VNĐ
- **Số dư sau lượt:** 18.736 Tr. VNĐ | **Tài sản ròng:** 22.536 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Hà Nội (Hoàn Kiếm), Cần Thơ (Cái Răng)

#### Lượt #26 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.220 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 14 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.220 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), An Giang (Châu Đốc)

#### Lượt #27 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.220 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 20 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1
- **Số dư sau lượt:** 30 Tr. VNĐ | **Tài sản ròng:** 19.130 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), An Giang (Châu Đốc), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #9 ===

#### Lượt #28 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.272 Tr. VNĐ | **Tài sản ròng:** 21.872 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Cô Tư (Thận trọng / Passive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 10.772 Tr. VNĐ | **Tài sản ròng:** 21.372 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Bình Thuận (Mũi Né)

#### Lượt #29 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.772 Tr. VNĐ | **Tài sản ròng:** 21.372 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 19 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 480 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Hoàn Kiếm)] từ Chú Sáu (Cân bằng / Balanced) với giá 4160 Tr. VNĐ (Nộp thuế chuyển nhượng 208 Tr.)
- **Số dư sau lượt:** 6.132 Tr. VNĐ | **Tài sản ròng:** 19.932 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né)

#### Lượt #30 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 22.688 Tr. VNĐ | **Tài sản ròng:** 23.288 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 11 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FIRE_INSPECTION]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Bác Ba (Thực dụng / Aggressive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 21.238 Tr. VNĐ | **Tài sản ròng:** 22.838 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cần Thơ (Cái Răng)

#### Lượt #31 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.745 Tr. VNĐ | **Tài sản ròng:** 19.845 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.745 Tr. VNĐ | **Tài sản ròng:** 19.845 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), An Giang (Châu Đốc), Nghệ An (TP. Vinh)

#### Lượt #32 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.745 Tr. VNĐ | **Tài sản ròng:** 19.845 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 29 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.745 Tr. VNĐ | **Tài sản ròng:** 19.845 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), An Giang (Châu Đốc), Nghệ An (TP. Vinh)

#### Lượt #33 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.745 Tr. VNĐ | **Tài sản ròng:** 19.845 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 29 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 4450 Tr. VNĐ
- **Giải cứu tài chính:** Thế chấp BĐS ô 32
- **Giải cứu tài chính:** Thế chấp BĐS ô 14
- **Số dư sau lượt:** 2.620 Tr. VNĐ | **Tài sản ròng:** 21.320 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C2), Cần Thơ (Cái Răng) (C2), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #10 ===

#### Lượt #34 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.832 Tr. VNĐ | **Tài sản ròng:** 20.432 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Kiên Giang (Phú Quốc - Grand World)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Quảng Ninh (Hạ Long)] lên C1
- **Số dư sau lượt:** 972 Tr. VNĐ | **Tài sản ròng:** 20.572 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long) (C1)

#### Lượt #35 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 21.238 Tr. VNĐ | **Tài sản ròng:** 23.238 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 17 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 440 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Cô Tư (Thận trọng / Passive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 18.718 Tr. VNĐ | **Tài sản ròng:** 21.518 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang)

#### Lượt #36 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.036 Tr. VNĐ | **Tài sản ròng:** 22.936 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 0 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1
- **Số dư sau lượt:** 1.384 Tr. VNĐ | **Tài sản ròng:** 24.384 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C1), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #11 ===

#### Lượt #37 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.000 Tr. VNĐ | **Tài sản ròng:** 21.600 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Kiên Giang (Phú Quốc - Grand World)] lên C2
- **Số dư sau lượt:** 180 Tr. VNĐ | **Tài sản ròng:** 22.380 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long) (C1)

#### Lượt #38 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 19.953 Tr. VNĐ | **Tài sản ròng:** 21.753 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 23 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Hoàn Kiếm)] từ Bác Ba (Thực dụng / Aggressive) với giá 4160 Tr. VNĐ (Nộp thuế chuyển nhượng 208 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Khánh Hòa (Nha Trang)] (Hoàn trả nợ + 10% phí Kho Bạc: 880 Tr. VNĐ)
- **Số dư sau lượt:** 11.913 Tr. VNĐ | **Tài sản ròng:** 20.713 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang)

#### Lượt #39 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.384 Tr. VNĐ | **Tài sản ròng:** 24.384 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONTRACT_PENALTY]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 384 Tr. VNĐ | **Tài sản ròng:** 23.384 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C1), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

#### Lượt #40 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 384 Tr. VNĐ | **Tài sản ròng:** 23.384 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 22 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 384 Tr. VNĐ | **Tài sản ròng:** 23.384 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C1), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #12 ===

#### Lượt #41 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.132 Tr. VNĐ | **Tài sản ròng:** 24.132 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Quảng Ninh (Hạ Long)] lên C2
- **Số dư sau lượt:** 652 Tr. VNĐ | **Tài sản ròng:** 25.052 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Tập Đoàn Viễn Thông (Viettel), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long) (C2)

#### Lượt #42 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.913 Tr. VNĐ | **Tài sản ròng:** 20.713 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 31 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (Quận 1 - Nguyễn Huệ)] giá 4000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Thuận (Mũi Né)] từ Bác Ba (Thực dụng / Aggressive) với giá 1820 Tr. VNĐ (Nộp thuế chuyển nhượng 91 Tr.)
- **Số dư sau lượt:** 6.093 Tr. VNĐ | **Tài sản ròng:** 20.293 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #43 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 584 Tr. VNĐ | **Tài sản ròng:** 23.584 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 29 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 2250 Tr. VNĐ
- **Số dư sau lượt:** 1.720 Tr. VNĐ | **Tài sản ròng:** 24.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C1), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #13 ===

#### Lượt #44 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.517 Tr. VNĐ | **Tài sản ròng:** 26.517 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Kiên Giang (Phú Quốc - Grand World)] lên C3
- **Số dư sau lượt:** 917 Tr. VNĐ | **Tài sản ròng:** 27.817 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C2), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long) (C2)

#### Lượt #45 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.843 Tr. VNĐ | **Tài sản ròng:** 21.543 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 300 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C1
- **Số dư sau lượt:** 793 Tr. VNĐ | **Tài sản ròng:** 22.243 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C1), TP.HCM (TP. Thủ Đức) (C1)

#### Lượt #46 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.020 Tr. VNĐ | **Tài sản ròng:** 25.020 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 37 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cảng HKQT Long Thành], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.120 Tr. VNĐ | **Tài sản ròng:** 25.120 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C1), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

#### Lượt #47 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.120 Tr. VNĐ | **Tài sản ròng:** 25.120 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 5 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1109 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Cảng HKQT Long Thành] phát mãi về Kho Bạc
- **Số dư sau lượt:** 1.980 Tr. VNĐ | **Tài sản ròng:** 24.980 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C1), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #14 ===

#### Lượt #48 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.926 Tr. VNĐ | **Tài sản ròng:** 29.826 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 28 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] lên C3
- **Số dư sau lượt:** 726 Tr. VNĐ | **Tài sản ròng:** 31.526 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long) (C2)

#### Lượt #49 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.442 Tr. VNĐ | **Tài sản ròng:** 23.892 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1
- **Số dư sau lượt:** 322 Tr. VNĐ | **Tài sản ròng:** 23.972 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang) (C1), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C1), TP.HCM (TP. Thủ Đức) (C1), Lâm Đồng (Đà Lạt)

#### Lượt #50 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.380 Tr. VNĐ | **Tài sản ròng:** 26.380 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 11 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C2
- **Số dư sau lượt:** 10 Tr. VNĐ | **Tài sản ròng:** 27.610 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

#### Lượt #51 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10 Tr. VNĐ | **Tài sản ròng:** 27.610 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 17 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 10 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Giải cứu tài chính:** Thế chấp BĐS ô 19
- **Giải cứu tài chính:** Thế chấp BĐS ô 32
- **Số dư sau lượt:** 510 Tr. VNĐ | **Tài sản ròng:** 25.110 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #15 ===

#### Lượt #52 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.386 Tr. VNĐ | **Tài sản ròng:** 36.186 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 33 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 1225 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Quảng Ninh (Hạ Long)] lên C3
- **Số dư sau lượt:** 801 Tr. VNĐ | **Tài sản ròng:** 35.801 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long) (C3)

#### Lượt #53 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 801 Tr. VNĐ | **Tài sản ròng:** 35.801 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 37 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.051 Tr. VNĐ | **Tài sản ròng:** 37.051 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long) (C3)

#### Lượt #54 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.547 Tr. VNĐ | **Tài sản ròng:** 25.197 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 13 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1
- **Số dư sau lượt:** 287 Tr. VNĐ | **Tài sản ròng:** 25.337 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang) (C1), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né) (C1), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ) (C1), TP.HCM (TP. Thủ Đức) (C1), Lâm Đồng (Đà Lạt) (C1)

#### Lượt #55 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 510 Tr. VNĐ | **Tài sản ròng:** 25.110 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 28 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 510 Tr. VNĐ | **Tài sản ròng:** 25.110 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #16 ===

#### Lượt #56 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.051 Tr. VNĐ | **Tài sản ròng:** 37.051 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 420 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.631 Tr. VNĐ | **Tài sản ròng:** 36.631 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long) (C3)

#### Lượt #57 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 707 Tr. VNĐ | **Tài sản ròng:** 25.757 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 19 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 707 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 31
- **Giải cứu tài chính:** Thế chấp BĐS ô 34
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Giải cứu tài chính:** Hạ cấp công trình ô 13
- **Giải cứu tài chính:** Hạ cấp công trình ô 14
- **Giải cứu tài chính:** Hạ cấp công trình ô 37
- **Giải cứu tài chính:** Hạ cấp công trình ô 39
- **Giải cứu tài chính:** Thế chấp BĐS ô 11
- **Giải cứu tài chính:** Thế chấp BĐS ô 13
- **Giải cứu tài chính:** Thế chấp BĐS ô 14
- **Giải cứu tài chính:** Thế chấp BĐS ô 37
- **Số dư sau lượt:** 872 Tr. VNĐ | **Tài sản ròng:** 12.922 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), TP.HCM (TP. Thủ Đức), Lâm Đồng (Đà Lạt)

#### Lượt #58 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 510 Tr. VNĐ | **Tài sản ròng:** 25.110 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 510 Tr. VNĐ | **Tài sản ròng:** 25.110 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #17 ===

#### Lượt #59 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.338 Tr. VNĐ | **Tài sản ròng:** 37.338 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.338 Tr. VNĐ | **Tài sản ròng:** 37.338 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long) (C3)

#### Lượt #60 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 872 Tr. VNĐ | **Tài sản ròng:** 12.922 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 872 Tr. VNĐ | **Tài sản ròng:** 12.922 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), TP.HCM (TP. Thủ Đức), Lâm Đồng (Đà Lạt)

#### Lượt #61 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 510 Tr. VNĐ | **Tài sản ròng:** 25.110 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 510 Tr. VNĐ | **Tài sản ròng:** 25.110 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #18 ===

#### Lượt #62 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.338 Tr. VNĐ | **Tài sản ròng:** 37.338 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 20 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.338 Tr. VNĐ | **Tài sản ròng:** 37.338 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long) (C3)

#### Lượt #63 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 872 Tr. VNĐ | **Tài sản ròng:** 12.922 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 27 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 872 Tr. VNĐ | **Tài sản ròng:** 12.922 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), TP.HCM (TP. Thủ Đức), Lâm Đồng (Đà Lạt)

#### Lượt #64 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 510 Tr. VNĐ | **Tài sản ròng:** 25.110 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 10 Tr. VNĐ | **Tài sản ròng:** 24.610 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #19 ===

#### Lượt #65 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.338 Tr. VNĐ | **Tài sản ròng:** 37.338 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 28 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 400 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.938 Tr. VNĐ | **Tài sản ròng:** 36.938 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long) (C3)

#### Lượt #66 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.272 Tr. VNĐ | **Tài sản ròng:** 13.322 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 31 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.272 Tr. VNĐ | **Tài sản ròng:** 13.322 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), TP.HCM (TP. Thủ Đức), Lâm Đồng (Đà Lạt)

#### Lượt #67 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10 Tr. VNĐ | **Tài sản ròng:** 24.610 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Từ chối mua [Thừa Thiên Huế], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Thừa Thiên Huế] với giá 950 Tr. VNĐ
- **Số dư sau lượt:** 10 Tr. VNĐ | **Tài sản ròng:** 24.610 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #20 ===

#### Lượt #68 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 988 Tr. VNĐ | **Tài sản ròng:** 37.788 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 39 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.880 Tr. VNĐ | **Tài sản ròng:** 38.680 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long) (C3), Thừa Thiên Huế

#### Lượt #69 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.272 Tr. VNĐ | **Tài sản ròng:** 13.322 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 39 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.728 Tr. VNĐ | **Tài sản ròng:** 13.778 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), TP.HCM (TP. Thủ Đức), Lâm Đồng (Đà Lạt)

#### Lượt #70 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10 Tr. VNĐ | **Tài sản ròng:** 24.610 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 10 Tr. VNĐ | **Tài sản ròng:** 24.610 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #21 ===

#### Lượt #71 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.880 Tr. VNĐ | **Tài sản ròng:** 38.680 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 4 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.880 Tr. VNĐ | **Tài sản ròng:** 38.680 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long) (C3), Thừa Thiên Huế

#### Lượt #72 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.728 Tr. VNĐ | **Tài sản ròng:** 13.778 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 4 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 978 Tr. VNĐ | **Tài sản ròng:** 13.028 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), TP.HCM (TP. Thủ Đức), Lâm Đồng (Đà Lạt)

#### Lượt #73 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10 Tr. VNĐ | **Tài sản ròng:** 24.610 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 25 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 10 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 25
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Hạ cấp công trình ô 3
- **Giải cứu tài chính:** Hạ cấp công trình ô 21
- **Giải cứu tài chính:** Hạ cấp công trình ô 24
- **Giải cứu tài chính:** Hạ cấp công trình ô 21
- **Giải cứu tài chính:** Hạ cấp công trình ô 23
- **Giải cứu tài chính:** Hạ cấp công trình ô 24
- **Giải cứu tài chính:** Thế chấp BĐS ô 1
- **Giải cứu tài chính:** Thế chấp BĐS ô 3
- **Giải cứu tài chính:** Thế chấp BĐS ô 21
- **Giải cứu tài chính:** Thế chấp BĐS ô 23
- **Giải cứu tài chính:** Thế chấp BĐS ô 24
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** 0 Tr. VNĐ | **Tài sản ròng:** 0 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #22 ===

#### Lượt #74 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.040 Tr. VNĐ | **Tài sản ròng:** 46.840 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 14 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.040 Tr. VNĐ | **Tài sản ròng:** 46.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (15):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World) (C3), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc), Cần Thơ (Cái Răng), Nghệ An (TP. Vinh), Quảng Ninh (Hạ Long) (C3), Thừa Thiên Huế

#### Lượt #75 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.040 Tr. VNĐ | **Tài sản ròng:** 46.840 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 18 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.040 Tr. VNĐ | **Tài sản ròng:** 46.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (15):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World) (C3), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc), Cần Thơ (Cái Răng), Nghệ An (TP. Vinh), Quảng Ninh (Hạ Long) (C3), Thừa Thiên Huế

#### Lượt #76 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 978 Tr. VNĐ | **Tài sản ròng:** 13.028 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 7 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 978 Tr. VNĐ | **Tài sản ròng:** 13.028 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), TP.HCM (TP. Thủ Đức), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #23 ===

#### Lượt #77 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.040 Tr. VNĐ | **Tài sản ròng:** 46.840 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_MEGA_CONCERT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Hoàn trả nợ + 10% phí Kho Bạc: 550 Tr. VNĐ)
- **Số dư sau lượt:** 11.240 Tr. VNĐ | **Tài sản ròng:** 56.540 Tr. VNĐ
- **Danh mục BĐS sở hữu (15):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World) (C3), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm) (C3), Tập Đoàn Viễn Thông (Viettel), An Giang (Châu Đốc), Cần Thơ (Cái Răng), Nghệ An (TP. Vinh), Quảng Ninh (Hạ Long) (C3), Thừa Thiên Huế

#### Lượt #78 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** -8.772 Tr. VNĐ | **Tài sản ròng:** 3.278 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 8
- **Giải cứu tài chính:** Thế chấp BĐS ô 39
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** 0 Tr. VNĐ | **Tài sản ròng:** 0 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.