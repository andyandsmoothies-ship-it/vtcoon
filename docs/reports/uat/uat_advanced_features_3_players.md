# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (3 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920263 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 107 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **39.741 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 16.141 Tr. VNĐ | 39.741 Tr. VNĐ | 12 ô | 🏆 Vô địch |
| 2 | Cô Tư (Thận trọng / Passive) | Passive | 3.582 Tr. VNĐ | 19.582 Tr. VNĐ | 8 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 3.029 Tr. VNĐ | 19.579 Tr. VNĐ | 8 ô | ✓ Hoàn thành |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 351 lần.
- Số giao dịch sang tên thành công: 22 thương vụ.
- Tổng giá trị chuyển nhượng đất: 63.700 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 3.185 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 0 phiên.
- Tổng vốn cọc đầu tư: 0 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 0 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: 0 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 2 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 4 lần.
- Tổng giá trị thanh toán chuộc đất: 1.980 Tr. VNĐ.

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
| MC_URBAN_PLANNING | Thẻ Thị Trường | 1 lần | 14.3% |
| MC_FIRE_INSPECTION | Thẻ Thị Trường | 1 lần | 14.3% |
| MC_PUBLIC_INVEST | Thẻ Thị Trường | 1 lần | 14.3% |
| MC_CASINO_PILOT | Thẻ Thị Trường | 1 lần | 14.3% |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 14.3% |
| MC_ALCOHOL_CHECK | Thẻ Thị Trường | 1 lần | 14.3% |
| MC_FUEL_SURGE | Thẻ Thị Trường | 1 lần | 14.3% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 1 lần | 0.9% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 3 lần | 2.8% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 4 lần | 3.7% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 6 lần | 5.6% |
| Cảng HKQT Long Thành | Đặc biệt | 2 lần | 1.9% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 5 lần | 4.7% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 4 lần | 3.7% |
| Cảng HKQT Nội Bài | Đặc biệt | 4 lần | 3.7% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 4 lần | 3.7% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 3 lần | 2.8% |

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
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Tập Đoàn Viễn Thông (Viettel)] với giá 2000 Tr. VNĐ
- **Số dư sau lượt:** 11.439 Tr. VNĐ | **Tài sản ròng:** 20.139 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài

#### Lượt #15 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 19.163 Tr. VNĐ | **Tài sản ròng:** 20.663 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 27 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_URBAN_PLANNING]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 15.783 Tr. VNĐ | **Tài sản ròng:** 19.883 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #16 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 5400 Tr. VNĐ
- **Số dư sau lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #6 ===

#### Lượt #17 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.250 Tr. VNĐ | **Tài sản ròng:** 18.850 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 35 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bà Rịa - Vũng Tàu] giá 1200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Cần Thơ (Cái Răng)] với giá 650 Tr. VNĐ
- **Số dư sau lượt:** 7.450 Tr. VNĐ | **Tài sản ròng:** 20.250 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu

#### Lượt #18 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.133 Tr. VNĐ | **Tài sản ròng:** 19.833 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (Quận 1 - Nguyễn Huệ)] giá 4000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 7.753 Tr. VNĐ | **Tài sản ròng:** 19.053 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #19 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 37 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #7 ===

#### Lượt #20 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.661 Tr. VNĐ | **Tài sản ròng:** 21.861 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 9 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 6.481 Tr. VNĐ | **Tài sản ròng:** 21.081 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #21 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.964 Tr. VNĐ | **Tài sản ròng:** 19.664 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 39 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 7.748 Tr. VNĐ | **Tài sản ròng:** 19.048 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #22 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 5 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 280 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.360 Tr. VNĐ | **Tài sản ròng:** 17.560 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #8 ===

#### Lượt #23 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.972 Tr. VNĐ | **Tài sản ròng:** 21.972 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 16 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 6.280 Tr. VNĐ | **Tài sản ròng:** 20.880 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #24 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.271 Tr. VNĐ | **Tài sản ròng:** 19.971 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 7.891 Tr. VNĐ | **Tài sản ròng:** 19.191 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #25 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.360 Tr. VNĐ | **Tài sản ròng:** 17.560 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 12 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Từ chối mua [Cảng Nước Sâu Cái Mép], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cảng Nước Sâu Cái Mép] với giá 3050 Tr. VNĐ
- **Số dư sau lượt:** 2.360 Tr. VNĐ | **Tài sản ròng:** 17.560 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #9 ===

#### Lượt #26 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.441 Tr. VNĐ | **Tài sản ròng:** 20.441 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 27 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài]
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 3.061 Tr. VNĐ | **Tài sản ròng:** 19.661 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #27 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.102 Tr. VNĐ | **Tài sản ròng:** 19.802 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 6.322 Tr. VNĐ | **Tài sản ròng:** 19.022 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #28 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.360 Tr. VNĐ | **Tài sản ròng:** 17.560 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_JUNK_STOCK]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 860 Tr. VNĐ | **Tài sản ròng:** 16.060 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #10 ===

#### Lượt #29 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.272 Tr. VNĐ | **Tài sản ròng:** 20.272 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 35 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FIRE_INSPECTION]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 3.892 Tr. VNĐ | **Tài sản ròng:** 20.492 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #30 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.533 Tr. VNĐ | **Tài sản ròng:** 19.633 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 6.153 Tr. VNĐ | **Tài sản ròng:** 18.853 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #31 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 860 Tr. VNĐ | **Tài sản ròng:** 16.060 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 22 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 620 Tr. VNĐ | **Tài sản ròng:** 15.820 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

#### Lượt #32 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 620 Tr. VNĐ | **Tài sản ròng:** 15.820 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 28 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 400 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 220 Tr. VNĐ | **Tài sản ròng:** 15.420 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #11 ===

#### Lượt #33 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.103 Tr. VNĐ | **Tài sản ròng:** 21.103 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 2 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Cô Tư (Thận trọng / Passive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 5.683 Tr. VNĐ | **Tài sản ròng:** 20.683 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #34 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.683 Tr. VNĐ | **Tài sản ròng:** 20.683 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 2.303 Tr. VNĐ | **Tài sản ròng:** 19.903 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #35 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.004 Tr. VNĐ | **Tài sản ròng:** 20.104 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Bác Ba (Thực dụng / Aggressive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 8.704 Tr. VNĐ | **Tài sản ròng:** 19.804 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #36 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.575 Tr. VNĐ | **Tài sản ròng:** 15.775 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 60 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.515 Tr. VNĐ | **Tài sản ròng:** 16.715 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

#### Lượt #37 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.515 Tr. VNĐ | **Tài sản ròng:** 16.715 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.515 Tr. VNĐ | **Tài sản ròng:** 16.715 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #12 ===

#### Lượt #38 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.538 Tr. VNĐ | **Tài sản ròng:** 20.138 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.338 Tr. VNĐ | **Tài sản ròng:** 20.138 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh)

#### Lượt #39 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.338 Tr. VNĐ | **Tài sản ròng:** 20.138 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 23 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hưng Yên (Văn Giang)] với giá 1550 Tr. VNĐ
- **Số dư sau lượt:** 1.338 Tr. VNĐ | **Tài sản ròng:** 20.138 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh)

#### Lượt #40 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.214 Tr. VNĐ | **Tài sản ròng:** 21.314 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 26 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Hoàn Kiếm)] giá 3200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.014 Tr. VNĐ | **Tài sản ròng:** 21.314 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #41 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.515 Tr. VNĐ | **Tài sản ròng:** 16.715 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.515 Tr. VNĐ | **Tài sản ròng:** 16.715 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

#### Lượt #42 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.515 Tr. VNĐ | **Tài sản ròng:** 16.715 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 14 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.515 Tr. VNĐ | **Tài sản ròng:** 16.715 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #13 ===

#### Lượt #43 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.338 Tr. VNĐ | **Tài sản ròng:** 20.138 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 31 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.738 Tr. VNĐ | **Tài sản ròng:** 21.138 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc)

#### Lượt #44 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.738 Tr. VNĐ | **Tài sản ròng:** 21.138 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 3 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 338 Tr. VNĐ | **Tài sản ròng:** 21.138 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #45 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.014 Tr. VNĐ | **Tài sản ròng:** 21.314 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 34 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 1.634 Tr. VNĐ | **Tài sản ròng:** 21.534 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #46 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.634 Tr. VNĐ | **Tài sản ròng:** 21.534 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 0 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1634 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 1
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Số dư sau lượt:** 434 Tr. VNĐ | **Tài sản ròng:** 19.534 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #47 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.515 Tr. VNĐ | **Tài sản ròng:** 16.715 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.515 Tr. VNĐ | **Tài sản ròng:** 16.715 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

#### Lượt #48 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.515 Tr. VNĐ | **Tài sản ròng:** 16.715 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 24 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 2000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.710 Tr. VNĐ | **Tài sản ròng:** 15.910 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #14 ===

#### Lượt #49 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.183 Tr. VNĐ | **Tài sản ròng:** 25.383 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 3.803 Tr. VNĐ | **Tài sản ròng:** 24.603 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #50 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.840 Tr. VNĐ | **Tài sản ròng:** 21.340 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 5 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 120 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Cần Thơ (Cái Răng)] (Hoàn trả nợ + 10% phí Kho Bạc: 330 Tr. VNĐ)
- **Số dư sau lượt:** 4.390 Tr. VNĐ | **Tài sản ròng:** 21.190 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #51 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.830 Tr. VNĐ | **Tài sản ròng:** 16.030 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 35 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.906 Tr. VNĐ | **Tài sản ròng:** 18.106 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #15 ===

#### Lượt #52 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.879 Tr. VNĐ | **Tài sản ròng:** 25.679 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 16 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.879 Tr. VNĐ | **Tài sản ròng:** 25.679 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #53 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.390 Tr. VNĐ | **Tài sản ròng:** 21.190 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 2000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.390 Tr. VNĐ | **Tài sản ròng:** 19.190 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #54 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.906 Tr. VNĐ | **Tài sản ròng:** 18.106 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.516 Tr. VNĐ | **Tài sản ròng:** 17.716 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

#### Lượt #55 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.516 Tr. VNĐ | **Tài sản ròng:** 17.716 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 4 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.196 Tr. VNĐ | **Tài sản ròng:** 17.396 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #16 ===

#### Lượt #56 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.199 Tr. VNĐ | **Tài sản ròng:** 27.999 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Mua thành công [Quảng Ninh (Hạ Long)] giá 2800 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.399 Tr. VNĐ | **Tài sản ròng:** 27.999 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #57 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.390 Tr. VNĐ | **Tài sản ròng:** 19.190 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 15 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.190 Tr. VNĐ | **Tài sản ròng:** 18.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #58 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.396 Tr. VNĐ | **Tài sản ròng:** 17.596 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.596 Tr. VNĐ | **Tài sản ròng:** 17.596 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #17 ===

#### Lượt #59 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.399 Tr. VNĐ | **Tài sản ròng:** 27.999 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 29 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 7.799 Tr. VNĐ | **Tài sản ròng:** 31.399 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #60 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.590 Tr. VNĐ | **Tài sản ròng:** 19.390 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 19 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.278 Tr. VNĐ | **Tài sản ròng:** 19.078 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #61 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.996 Tr. VNĐ | **Tài sản ròng:** 18.996 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.996 Tr. VNĐ | **Tài sản ròng:** 18.996 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #18 ===

#### Lượt #62 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.111 Tr. VNĐ | **Tài sản ròng:** 31.711 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 33 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 9.111 Tr. VNĐ | **Tài sản ròng:** 32.711 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #63 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.278 Tr. VNĐ | **Tài sản ròng:** 20.078 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 27 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 3278 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 1
- **Giải cứu tài chính:** Thế chấp BĐS ô 13
- **Số dư sau lượt:** 278 Tr. VNĐ | **Tài sản ròng:** 16.078 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #64 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.996 Tr. VNĐ | **Tài sản ròng:** 18.996 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 25 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.696 Tr. VNĐ | **Tài sản ròng:** 18.696 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

#### Lượt #65 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.696 Tr. VNĐ | **Tài sản ròng:** 18.696 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 31 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 350 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.346 Tr. VNĐ | **Tài sản ròng:** 18.346 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

#### Lượt #66 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.346 Tr. VNĐ | **Tài sản ròng:** 18.346 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.012 Tr. VNĐ | **Tài sản ròng:** 19.012 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #19 ===

#### Lượt #67 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.739 Tr. VNĐ | **Tài sản ròng:** 36.339 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 2 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 12.739 Tr. VNĐ | **Tài sản ròng:** 36.339 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #68 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 578 Tr. VNĐ | **Tài sản ròng:** 16.378 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 35 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 578 Tr. VNĐ | **Tài sản ròng:** 16.378 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #69 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.012 Tr. VNĐ | **Tài sản ròng:** 19.012 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 140 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.872 Tr. VNĐ | **Tài sản ròng:** 18.872 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #20 ===

#### Lượt #70 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.879 Tr. VNĐ | **Tài sản ròng:** 36.479 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 12.879 Tr. VNĐ | **Tài sản ròng:** 36.479 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #71 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 578 Tr. VNĐ | **Tài sản ròng:** 16.378 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 38 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 72 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.431 Tr. VNĐ | **Tài sản ròng:** 17.231 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #72 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.872 Tr. VNĐ | **Tài sản ròng:** 18.872 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 11 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.872 Tr. VNĐ | **Tài sản ròng:** 18.872 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #21 ===

#### Lượt #73 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.951 Tr. VNĐ | **Tài sản ròng:** 36.551 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 374 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 12.577 Tr. VNĐ | **Tài sản ròng:** 36.177 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #74 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.577 Tr. VNĐ | **Tài sản ròng:** 36.177 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_MEGA_CONCERT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 12.457 Tr. VNĐ | **Tài sản ròng:** 36.057 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #75 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.045 Tr. VNĐ | **Tài sản ròng:** 17.845 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 2000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 45 Tr. VNĐ | **Tài sản ròng:** 15.845 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #76 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.752 Tr. VNĐ | **Tài sản ròng:** 18.752 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 168 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.584 Tr. VNĐ | **Tài sản ròng:** 18.584 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #22 ===

#### Lượt #77 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.625 Tr. VNĐ | **Tài sản ròng:** 38.225 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 14.625 Tr. VNĐ | **Tài sản ròng:** 38.225 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #78 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 45 Tr. VNĐ | **Tài sản ròng:** 15.845 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 15 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 45 Tr. VNĐ | **Tài sản ròng:** 15.845 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #79 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.584 Tr. VNĐ | **Tài sản ròng:** 18.584 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 11 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.584 Tr. VNĐ | **Tài sản ròng:** 18.584 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #23 ===

#### Lượt #80 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.625 Tr. VNĐ | **Tài sản ròng:** 38.225 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 264 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 14.361 Tr. VNĐ | **Tài sản ròng:** 37.961 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #81 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 45 Tr. VNĐ | **Tài sản ròng:** 15.845 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 45 Tr. VNĐ | **Tài sản ròng:** 15.845 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #82 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 45 Tr. VNĐ | **Tài sản ròng:** 15.845 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 26 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 45 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 28
- **Số dư sau lượt:** 459 Tr. VNĐ | **Tài sản ròng:** 15.509 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #83 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.848 Tr. VNĐ | **Tài sản ròng:** 18.848 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 20 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.848 Tr. VNĐ | **Tài sản ròng:** 18.848 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #24 ===

#### Lượt #84 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.406 Tr. VNĐ | **Tài sản ròng:** 38.006 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 374 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 14.032 Tr. VNĐ | **Tài sản ròng:** 37.632 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #85 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 833 Tr. VNĐ | **Tài sản ròng:** 15.883 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.333 Tr. VNĐ | **Tài sản ròng:** 18.383 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #86 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.848 Tr. VNĐ | **Tài sản ròng:** 18.848 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 28 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONTRACT_PENALTY]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.848 Tr. VNĐ | **Tài sản ròng:** 17.848 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #25 ===

#### Lượt #87 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.032 Tr. VNĐ | **Tài sản ròng:** 37.632 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 14.032 Tr. VNĐ | **Tài sản ròng:** 37.632 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #88 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.333 Tr. VNĐ | **Tài sản ròng:** 19.383 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 36 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_ALCOHOL_CHECK]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Bình Dương (Tổ Hợp Thể Thao & Golf)] (Hoàn trả nợ + 10% phí Kho Bạc: 550 Tr. VNĐ)
- **Số dư sau lượt:** 4.171 Tr. VNĐ | **Tài sản ròng:** 19.721 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #89 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.848 Tr. VNĐ | **Tài sản ròng:** 17.848 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 36 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.748 Tr. VNĐ | **Tài sản ròng:** 17.748 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #26 ===

#### Lượt #90 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.032 Tr. VNĐ | **Tài sản ròng:** 37.632 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 35 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 14.532 Tr. VNĐ | **Tài sản ròng:** 38.132 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #91 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.171 Tr. VNĐ | **Tài sản ròng:** 19.721 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 2 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.754 Tr. VNĐ | **Tài sản ròng:** 19.304 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #92 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.754 Tr. VNĐ | **Tài sản ròng:** 19.304 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.754 Tr. VNĐ | **Tài sản ròng:** 19.304 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #93 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.748 Tr. VNĐ | **Tài sản ròng:** 17.748 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 7 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 360 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.388 Tr. VNĐ | **Tài sản ròng:** 17.388 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

#### Lượt #94 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.388 Tr. VNĐ | **Tài sản ròng:** 17.388 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 31 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.026 Tr. VNĐ | **Tài sản ròng:** 19.026 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #27 ===

#### Lượt #95 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.532 Tr. VNĐ | **Tài sản ròng:** 38.132 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 0 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 14.532 Tr. VNĐ | **Tài sản ròng:** 38.132 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #96 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.252 Tr. VNĐ | **Tài sản ròng:** 20.802 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 13 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 288 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Cần Thơ (Cái Răng)] (Hoàn trả nợ + 10% phí Kho Bạc: 330 Tr. VNĐ)
- **Số dư sau lượt:** 4.634 Tr. VNĐ | **Tài sản ròng:** 20.484 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #97 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.314 Tr. VNĐ | **Tài sản ròng:** 19.314 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 1 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 144 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.170 Tr. VNĐ | **Tài sản ròng:** 19.170 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #28 ===

#### Lượt #98 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.532 Tr. VNĐ | **Tài sản ròng:** 38.132 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 9 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 216 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 14.316 Tr. VNĐ | **Tài sản ròng:** 37.916 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #99 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.778 Tr. VNĐ | **Tài sản ròng:** 20.628 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Lâm Đồng (Đà Lạt)] (Hoàn trả nợ + 10% phí Kho Bạc: 770 Tr. VNĐ)
- **Số dư sau lượt:** 4.008 Tr. VNĐ | **Tài sản ròng:** 20.558 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #100 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.386 Tr. VNĐ | **Tài sản ròng:** 19.386 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 2000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.386 Tr. VNĐ | **Tài sản ròng:** 17.386 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #29 ===

#### Lượt #101 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.316 Tr. VNĐ | **Tài sản ròng:** 39.916 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 16.316 Tr. VNĐ | **Tài sản ròng:** 39.916 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #102 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.316 Tr. VNĐ | **Tài sản ròng:** 39.916 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 16.316 Tr. VNĐ | **Tài sản ròng:** 39.916 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #103 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.008 Tr. VNĐ | **Tài sản ròng:** 20.558 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FUEL_SURGE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.008 Tr. VNĐ | **Tài sản ròng:** 19.558 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #104 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.261 Tr. VNĐ | **Tài sản ròng:** 17.261 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.261 Tr. VNĐ | **Tài sản ròng:** 17.261 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

### === VÒNG ĐẤU #30 ===

#### Lượt #105 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.941 Tr. VNĐ | **Tài sản ròng:** 40.541 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 300 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 16.141 Tr. VNĐ | **Tài sản ròng:** 39.741 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), An Giang (Châu Đốc), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #106 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.008 Tr. VNĐ | **Tài sản ròng:** 19.558 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 17 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.008 Tr. VNĐ | **Tài sản ròng:** 18.558 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Hưng Yên (Văn Giang), Hà Nội (Hoàn Kiếm)

#### Lượt #107 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.561 Tr. VNĐ | **Tài sản ròng:** 18.561 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 21 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.582 Tr. VNĐ | **Tài sản ròng:** 19.582 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Thừa Thiên Huế

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.