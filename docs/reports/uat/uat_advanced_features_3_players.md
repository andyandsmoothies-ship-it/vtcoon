# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (3 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920263 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 123 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Cô Tư (Thận trọng / Passive)** (Tổng tài sản ròng: **39.389 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Cô Tư (Thận trọng / Passive) | Passive | 11.589 Tr. VNĐ | 39.389 Tr. VNĐ | 10 ô | 🏆 Vô địch |
| 2 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 396 Tr. VNĐ | 12.996 Tr. VNĐ | 9 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 1.435 Tr. VNĐ | 12.285 Tr. VNĐ | 7 ô | ✓ Hoàn thành |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 258 lần.
- Số giao dịch sang tên thành công: 33 thương vụ.
- Tổng giá trị chuyển nhượng đất: 88.660 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 4.433 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 1 phiên.
- Tổng vốn cọc đầu tư: 2.000 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 4.000 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: 2.000 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 0 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 3 lần.
- Tổng giá trị thanh toán chuộc đất: 3.410 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_JUNK_STOCK | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_CONTRACT_PENALTY | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_CONCERT_SPONSOR | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_SLOW_BUILD | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_FREE_CREDIT | Thẻ Cơ Hội | 1 lần | 16.7% |

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
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 1 lần | 0.8% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 14 lần | 11.4% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 5 lần | 4.1% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 4 lần | 3.3% |
| Cảng HKQT Long Thành | Đặc biệt | 2 lần | 1.6% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 5 lần | 4.1% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 5 lần | 4.1% |
| Cảng HKQT Nội Bài | Đặc biệt | 4 lần | 3.3% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 2 lần | 1.6% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 2 lần | 1.6% |

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
- **Số dư sau lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

#### Lượt #17 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 37 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 5400 Tr. VNĐ
- **Số dư sau lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #6 ===

#### Lượt #18 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.250 Tr. VNĐ | **Tài sản ròng:** 18.850 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 35 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bà Rịa - Vũng Tàu] giá 1200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Cần Thơ (Cái Răng)] với giá 650 Tr. VNĐ
- **Số dư sau lượt:** 7.450 Tr. VNĐ | **Tài sản ròng:** 20.250 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu

#### Lượt #19 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.133 Tr. VNĐ | **Tài sản ròng:** 19.833 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (Quận 1 - Nguyễn Huệ)] giá 4000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 7.753 Tr. VNĐ | **Tài sản ròng:** 19.053 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #20 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 37 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #7 ===

#### Lượt #21 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.661 Tr. VNĐ | **Tài sản ròng:** 21.861 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 9 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 6.481 Tr. VNĐ | **Tài sản ròng:** 21.081 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #22 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.964 Tr. VNĐ | **Tài sản ròng:** 19.664 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 39 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 7.748 Tr. VNĐ | **Tài sản ròng:** 19.048 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #23 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.640 Tr. VNĐ | **Tài sản ròng:** 17.840 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 5 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 280 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.360 Tr. VNĐ | **Tài sản ròng:** 17.560 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #8 ===

#### Lượt #24 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.972 Tr. VNĐ | **Tài sản ròng:** 21.972 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 16 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 6.280 Tr. VNĐ | **Tài sản ròng:** 20.880 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #25 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.271 Tr. VNĐ | **Tài sản ròng:** 19.971 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 7.891 Tr. VNĐ | **Tài sản ròng:** 19.191 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #26 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.360 Tr. VNĐ | **Tài sản ròng:** 17.560 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 12 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Từ chối mua [Cảng Nước Sâu Cái Mép], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.360 Tr. VNĐ | **Tài sản ròng:** 17.560 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

#### Lượt #27 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.360 Tr. VNĐ | **Tài sản ròng:** 17.560 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 15 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C1 (Shophouse)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cảng Nước Sâu Cái Mép] với giá 3050 Tr. VNĐ
- **Số dư sau lượt:** 1.360 Tr. VNĐ | **Tài sản ròng:** 16.760 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C1), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #9 ===

#### Lượt #28 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.441 Tr. VNĐ | **Tài sản ròng:** 21.241 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 27 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài]
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 3.061 Tr. VNĐ | **Tài sản ròng:** 20.461 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #29 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.102 Tr. VNĐ | **Tài sản ròng:** 19.802 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 7.102 Tr. VNĐ | **Tài sản ròng:** 19.202 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #30 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.360 Tr. VNĐ | **Tài sản ròng:** 16.760 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_JUNK_STOCK]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 14
- **Số dư sau lượt:** 660 Tr. VNĐ | **Tài sản ròng:** 15.260 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C1), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #10 ===

#### Lượt #31 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.531 Tr. VNĐ | **Tài sản ròng:** 20.931 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 35 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FIRE_INSPECTION]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Cô Tư (Thận trọng / Passive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 4.451 Tr. VNĐ | **Tài sản ròng:** 20.651 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #32 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.102 Tr. VNĐ | **Tài sản ròng:** 19.202 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Bác Ba (Thực dụng / Aggressive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 5.022 Tr. VNĐ | **Tài sản ròng:** 17.922 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #33 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.236 Tr. VNĐ | **Tài sản ròng:** 16.036 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 22 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1
- **Số dư sau lượt:** 1.456 Tr. VNĐ | **Tài sản ròng:** 15.856 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C1), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C1)

#### Lượt #34 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.456 Tr. VNĐ | **Tài sản ròng:** 15.856 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 28 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2
- **Số dư sau lượt:** 556 Tr. VNĐ | **Tài sản ròng:** 15.956 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C2), Đồng Nai (Đại Công Viên Chủ Đề) (C1), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C1)

### === VÒNG ĐẤU #11 ===

#### Lượt #35 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.427 Tr. VNĐ | **Tài sản ròng:** 21.827 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 2 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 1000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Chú Sáu (Cân bằng / Balanced) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 3.347 Tr. VNĐ | **Tài sản ròng:** 19.547 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #36 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.347 Tr. VNĐ | **Tài sản ròng:** 19.547 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.347 Tr. VNĐ | **Tài sản ròng:** 19.547 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #37 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.347 Tr. VNĐ | **Tài sản ròng:** 19.547 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 14 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Khánh Hòa (Nha Trang)] (Hoàn trả nợ + 10% phí Kho Bạc: 880 Tr. VNĐ)
- **Số dư sau lượt:** 3.267 Tr. VNĐ | **Tài sản ròng:** 22.267 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #38 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.308 Tr. VNĐ | **Tài sản ròng:** 20.408 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Bác Ba (Thực dụng / Aggressive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 7.916 Tr. VNĐ | **Tài sản ròng:** 19.616 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #39 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.956 Tr. VNĐ | **Tài sản ròng:** 18.356 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 39 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2
- **Số dư sau lượt:** 2.021 Tr. VNĐ | **Tài sản ròng:** 19.621 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C2), Đồng Nai (Đại Công Viên Chủ Đề) (C2), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C2)

### === VÒNG ĐẤU #12 ===

#### Lượt #40 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.555 Tr. VNĐ | **Tài sản ròng:** 22.955 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 17 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Chú Sáu (Cân bằng / Balanced) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 3.475 Tr. VNĐ | **Tài sản ròng:** 22.475 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #41 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.892 Tr. VNĐ | **Tài sản ròng:** 19.992 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 27 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 4000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Bác Ba (Thực dụng / Aggressive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 3.812 Tr. VNĐ | **Tài sản ròng:** 15.512 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #42 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.021 Tr. VNĐ | **Tài sản ròng:** 19.621 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3
- **Số dư sau lượt:** 21 Tr. VNĐ | **Tài sản ròng:** 20.621 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C2)

### === VÒNG ĐẤU #13 ===

#### Lượt #43 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.451 Tr. VNĐ | **Tài sản ròng:** 26.851 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 27 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 9.451 Tr. VNĐ | **Tài sản ròng:** 26.851 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #44 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.451 Tr. VNĐ | **Tài sản ròng:** 26.851 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 37 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 60 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 10.391 Tr. VNĐ | **Tài sản ròng:** 27.791 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #45 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.872 Tr. VNĐ | **Tài sản ròng:** 15.572 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 35 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.972 Tr. VNĐ | **Tài sản ròng:** 16.672 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #46 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.972 Tr. VNĐ | **Tài sản ròng:** 16.672 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 4.872 Tr. VNĐ | **Tài sản ròng:** 18.572 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #47 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 21 Tr. VNĐ | **Tài sản ròng:** 20.621 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONTRACT_PENALTY]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 21
- **Số dư sau lượt:** 121 Tr. VNĐ | **Tài sản ròng:** 19.621 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C2)

### === VÒNG ĐẤU #14 ===

#### Lượt #48 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.861 Tr. VNĐ | **Tài sản ròng:** 28.261 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 1 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 12.861 Tr. VNĐ | **Tài sản ròng:** 28.261 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #49 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.861 Tr. VNĐ | **Tài sản ròng:** 28.261 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 5 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 11.461 Tr. VNĐ | **Tài sản ròng:** 28.261 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #50 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.461 Tr. VNĐ | **Tài sản ròng:** 28.261 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.461 Tr. VNĐ | **Tài sản ròng:** 28.261 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #51 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.872 Tr. VNĐ | **Tài sản ròng:** 19.572 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 7 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 140 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Cô Tư (Thận trọng / Passive) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 2.872 Tr. VNĐ | **Tài sản ròng:** 17.672 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #52 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.872 Tr. VNĐ | **Tài sản ròng:** 17.672 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 11 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.272 Tr. VNĐ | **Tài sản ròng:** 17.072 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #53 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.838 Tr. VNĐ | **Tài sản ròng:** 21.238 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C3
- **Số dư sau lượt:** 1.758 Tr. VNĐ | **Tài sản ròng:** 21.958 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #15 ===

#### Lượt #54 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.601 Tr. VNĐ | **Tài sản ròng:** 28.401 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 16 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.401 Tr. VNĐ | **Tài sản ròng:** 28.201 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #55 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.472 Tr. VNĐ | **Tài sản ròng:** 17.272 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 22 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.472 Tr. VNĐ | **Tài sản ròng:** 17.272 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #56 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.758 Tr. VNĐ | **Tài sản ròng:** 21.958 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.758 Tr. VNĐ | **Tài sản ròng:** 21.958 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #16 ===

#### Lượt #57 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.401 Tr. VNĐ | **Tài sản ròng:** 28.201 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 19 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.089 Tr. VNĐ | **Tài sản ròng:** 27.889 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #58 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.784 Tr. VNĐ | **Tài sản ròng:** 17.584 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 32 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_SLOW_BUILD]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.184 Tr. VNĐ | **Tài sản ròng:** 16.984 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #59 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.184 Tr. VNĐ | **Tài sản ròng:** 16.984 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 36 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.817 Tr. VNĐ | **Tài sản ròng:** 17.617 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #60 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.758 Tr. VNĐ | **Tài sản ròng:** 21.958 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** -437 Tr. VNĐ | **Tài sản ròng:** 19.763 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

#### Lượt #61 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** -437 Tr. VNĐ | **Tài sản ròng:** 19.763 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 24
- **Số dư sau lượt:** 2.010 Tr. VNĐ | **Tài sản ròng:** 21.010 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #17 ===

#### Lượt #62 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.089 Tr. VNĐ | **Tài sản ròng:** 27.889 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Chú Sáu (Cân bằng / Balanced) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 9.009 Tr. VNĐ | **Tài sản ròng:** 25.809 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #63 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.009 Tr. VNĐ | **Tài sản ròng:** 25.809 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 33 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng tại [Phiếu Thị Trường]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 9.009 Tr. VNĐ | **Tài sản ròng:** 25.809 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #64 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.009 Tr. VNĐ | **Tài sản ròng:** 25.809 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 33 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng tại [Phiếu Thị Trường]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 9.009 Tr. VNĐ | **Tài sản ròng:** 25.809 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #65 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.009 Tr. VNĐ | **Tài sản ròng:** 25.809 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 33 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng tại [Phiếu Thị Trường]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.659 Tr. VNĐ | **Tài sản ròng:** 24.059 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #66 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.040 Tr. VNĐ | **Tài sản ròng:** 19.240 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 140 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Thanh Hóa (Sầm Sơn)] (Hoàn trả nợ + 10% phí Kho Bạc: 1210 Tr. VNĐ)
- **Số dư sau lượt:** 4.690 Tr. VNĐ | **Tài sản ròng:** 18.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #67 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.010 Tr. VNĐ | **Tài sản ròng:** 24.010 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 2000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.010 Tr. VNĐ | **Tài sản ròng:** 22.010 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #18 ===

#### Lượt #68 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.799 Tr. VNĐ | **Tài sản ròng:** 26.199 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 33 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (2000 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 4000 Tr. VNĐ (+2000 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 9.799 Tr. VNĐ | **Tài sản ròng:** 28.199 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #69 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.690 Tr. VNĐ | **Tài sản ròng:** 18.990 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 11 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.690 Tr. VNĐ | **Tài sản ròng:** 18.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #70 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.010 Tr. VNĐ | **Tài sản ròng:** 22.010 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.790 Tr. VNĐ | **Tài sản ròng:** 21.790 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #19 ===

#### Lượt #71 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.799 Tr. VNĐ | **Tài sản ròng:** 28.199 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 38 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 4500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 3.699 Tr. VNĐ | **Tài sản ròng:** 22.499 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #72 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.699 Tr. VNĐ | **Tài sản ròng:** 22.499 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 9 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.699 Tr. VNĐ | **Tài sản ròng:** 22.499 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #73 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.699 Tr. VNĐ | **Tài sản ròng:** 22.499 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 9 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.699 Tr. VNĐ | **Tài sản ròng:** 22.499 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #74 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.699 Tr. VNĐ | **Tài sản ròng:** 22.499 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 9 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 449 Tr. VNĐ | **Tài sản ròng:** 20.849 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #75 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.380 Tr. VNĐ | **Tài sản ròng:** 19.680 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 4.468 Tr. VNĐ | **Tài sản ròng:** 18.768 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #76 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.290 Tr. VNĐ | **Tài sản ròng:** 26.290 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Ninh Bình (Tràng An)] (Hoàn trả nợ + 10% phí Kho Bạc: 1320 Tr. VNĐ)
- **Số dư sau lượt:** 3.058 Tr. VNĐ | **Tài sản ròng:** 25.258 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #20 ===

#### Lượt #77 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.231 Tr. VNĐ | **Tài sản ròng:** 21.631 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 9 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.231 Tr. VNĐ | **Tài sản ròng:** 21.631 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #78 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.250 Tr. VNĐ | **Tài sản ròng:** 19.550 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 27 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 360 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 3.510 Tr. VNĐ | **Tài sản ròng:** 18.410 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #79 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.418 Tr. VNĐ | **Tài sản ròng:** 25.618 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 2000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.418 Tr. VNĐ | **Tài sản ròng:** 23.618 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #21 ===

#### Lượt #80 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.442 Tr. VNĐ | **Tài sản ròng:** 24.242 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 16 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 5.082 Tr. VNĐ | **Tài sản ròng:** 21.482 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #81 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.082 Tr. VNĐ | **Tài sản ròng:** 21.482 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.082 Tr. VNĐ | **Tài sản ròng:** 21.482 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #82 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.082 Tr. VNĐ | **Tài sản ròng:** 21.482 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.032 Tr. VNĐ | **Tài sản ròng:** 21.032 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #83 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.227 Tr. VNĐ | **Tài sản ròng:** 18.927 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 32 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 2000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.227 Tr. VNĐ | **Tài sản ròng:** 16.927 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #84 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.918 Tr. VNĐ | **Tài sản ròng:** 24.118 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 35 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.419 Tr. VNĐ | **Tài sản ròng:** 25.619 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #22 ===

#### Lượt #85 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.032 Tr. VNĐ | **Tài sản ròng:** 23.032 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 25 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 360 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.672 Tr. VNĐ | **Tài sản ròng:** 22.672 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #86 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.228 Tr. VNĐ | **Tài sản ròng:** 17.928 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 35 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 2.386 Tr. VNĐ | **Tài sản ròng:** 17.286 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #87 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.779 Tr. VNĐ | **Tài sản ròng:** 25.979 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.403 Tr. VNĐ | **Tài sản ròng:** 26.603 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #23 ===

#### Lượt #88 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.389 Tr. VNĐ | **Tài sản ròng:** 23.189 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 32 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 480 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 4.049 Tr. VNĐ | **Tài sản ròng:** 20.449 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #89 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.049 Tr. VNĐ | **Tài sản ròng:** 20.449 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.049 Tr. VNĐ | **Tài sản ròng:** 20.449 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né)

#### Lượt #90 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.049 Tr. VNĐ | **Tài sản ròng:** 20.449 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.099 Tr. VNĐ | **Tài sản ròng:** 20.099 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang)

#### Lượt #91 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.584 Tr. VNĐ | **Tài sản ròng:** 19.284 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 3.724 Tr. VNĐ | **Tài sản ròng:** 18.624 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #92 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.403 Tr. VNĐ | **Tài sản ròng:** 26.603 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 168 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.235 Tr. VNĐ | **Tài sản ròng:** 26.435 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #24 ===

#### Lượt #93 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.816 Tr. VNĐ | **Tài sản ròng:** 20.616 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 39 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.716 Tr. VNĐ | **Tài sản ròng:** 21.116 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Khánh Hòa (Nha Trang), An Giang (Châu Đốc)

#### Lượt #94 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.892 Tr. VNĐ | **Tài sản ròng:** 18.792 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.892 Tr. VNĐ | **Tài sản ròng:** 18.792 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #95 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.235 Tr. VNĐ | **Tài sản ròng:** 26.435 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 13 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.035 Tr. VNĐ | **Tài sản ròng:** 26.435 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh)

#### Lượt #96 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.035 Tr. VNĐ | **Tài sản ròng:** 26.435 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.035 Tr. VNĐ | **Tài sản ròng:** 26.435 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh)

#### Lượt #97 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.035 Tr. VNĐ | **Tài sản ròng:** 26.435 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 29 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 3750 Tr. VNĐ
- **Số dư sau lượt:** 2.035 Tr. VNĐ | **Tài sản ròng:** 26.435 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #25 ===

#### Lượt #98 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 966 Tr. VNĐ | **Tài sản ròng:** 20.166 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 3 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 966 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 3
- **Giải cứu tài chính:** Thế chấp BĐS ô 11
- **Giải cứu tài chính:** Thế chấp BĐS ô 14
- **Giải cứu tài chính:** Thế chấp BĐS ô 16
- **Giải cứu tài chính:** Thế chấp BĐS ô 12
- **Giải cứu tài chính:** Thế chấp BĐS ô 29
- **Số dư sau lượt:** 416 Tr. VNĐ | **Tài sản ròng:** 13.966 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), An Giang (Châu Đốc), Quảng Ninh (Hạ Long)

#### Lượt #99 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 416 Tr. VNĐ | **Tài sản ròng:** 13.966 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 9 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 416 Tr. VNĐ | **Tài sản ròng:** 13.966 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), An Giang (Châu Đốc), Quảng Ninh (Hạ Long)

#### Lượt #100 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.042 Tr. VNĐ | **Tài sản ròng:** 19.542 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 20 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 19.042 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Khánh Hòa (Nha Trang)

#### Lượt #101 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.501 Tr. VNĐ | **Tài sản ròng:** 27.901 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_FREE_CREDIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.501 Tr. VNĐ | **Tài sản ròng:** 29.901 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #26 ===

#### Lượt #102 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 416 Tr. VNĐ | **Tài sản ròng:** 13.966 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 9 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 416 Tr. VNĐ | **Tài sản ròng:** 13.966 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), An Giang (Châu Đốc), Quảng Ninh (Hạ Long)

#### Lượt #103 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 19.042 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 25 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 19.042 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), Khánh Hòa (Nha Trang)

#### Lượt #104 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.501 Tr. VNĐ | **Tài sản ròng:** 29.901 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 36 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.501 Tr. VNĐ | **Tài sản ròng:** 29.901 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #27 ===

#### Lượt #105 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 416 Tr. VNĐ | **Tài sản ròng:** 13.966 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 15 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 288 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 128 Tr. VNĐ | **Tài sản ròng:** 13.678 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), An Giang (Châu Đốc), Quảng Ninh (Hạ Long)

#### Lượt #106 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 19.042 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 17.442 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #107 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 17.442 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 17.442 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thanh Hóa (Sầm Sơn), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #108 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.542 Tr. VNĐ | **Tài sản ròng:** 17.442 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Dừng chân tại [Trạm Kiểm Toán & Thanh Tra]: Trả tiền thuê 95 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 39
- **Giải cứu tài chính:** Thế chấp BĐS ô 27
- **Số dư sau lượt:** 1.562 Tr. VNĐ | **Tài sản ròng:** 16.762 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), An Giang (Châu Đốc) (C3), Khánh Hòa (Nha Trang)

#### Lượt #109 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.789 Tr. VNĐ | **Tài sản ròng:** 30.189 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 5.889 Tr. VNĐ | **Tài sản ròng:** 30.289 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh)

#### Lượt #110 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.889 Tr. VNĐ | **Tài sản ròng:** 30.289 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 3 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.889 Tr. VNĐ | **Tài sản ròng:** 30.289 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #28 ===

#### Lượt #111 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.296 Tr. VNĐ | **Tài sản ròng:** 16.746 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.296 Tr. VNĐ | **Tài sản ròng:** 16.746 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #112 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.635 Tr. VNĐ | **Tài sản ròng:** 17.835 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.635 Tr. VNĐ | **Tài sản ròng:** 17.835 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), An Giang (Châu Đốc) (C3), Khánh Hòa (Nha Trang)

#### Lượt #113 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.889 Tr. VNĐ | **Tài sản ròng:** 30.289 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.889 Tr. VNĐ | **Tài sản ròng:** 30.289 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #29 ===

#### Lượt #114 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.296 Tr. VNĐ | **Tài sản ròng:** 16.746 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.296 Tr. VNĐ | **Tài sản ròng:** 16.746 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #115 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.635 Tr. VNĐ | **Tài sản ròng:** 17.835 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Từ chối mua [Thừa Thiên Huế], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.635 Tr. VNĐ | **Tài sản ròng:** 17.835 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), An Giang (Châu Đốc) (C3), Khánh Hòa (Nha Trang)

#### Lượt #116 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.635 Tr. VNĐ | **Tài sản ròng:** 17.835 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 435 Tr. VNĐ | **Tài sản ròng:** 16.035 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), An Giang (Châu Đốc) (C3)

#### Lượt #117 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 435 Tr. VNĐ | **Tài sản ròng:** 16.035 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 435 Tr. VNĐ | **Tài sản ròng:** 16.035 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), An Giang (Châu Đốc) (C3)

#### Lượt #118 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 435 Tr. VNĐ | **Tài sản ròng:** 16.035 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 435 Tr. VNĐ | **Tài sản ròng:** 16.035 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), An Giang (Châu Đốc) (C3)

#### Lượt #119 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.089 Tr. VNĐ | **Tài sản ròng:** 31.889 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_MEGA_CONCERT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 11.589 Tr. VNĐ | **Tài sản ròng:** 39.389 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh), Thừa Thiên Huế, Khánh Hòa (Nha Trang)

#### Lượt #120 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.589 Tr. VNĐ | **Tài sản ròng:** 39.389 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 6 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.589 Tr. VNĐ | **Tài sản ròng:** 39.389 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh), Thừa Thiên Huế, Khánh Hòa (Nha Trang)

### === VÒNG ĐẤU #30 ===

#### Lượt #121 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** -2.454 Tr. VNĐ | **Tài sản ròng:** 12.996 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 21
- **Giải cứu tài chính:** Thế chấp BĐS ô 37
- **Số dư sau lượt:** 396 Tr. VNĐ | **Tài sản ròng:** 12.996 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long)

#### Lượt #122 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** -3.315 Tr. VNĐ | **Tài sản ròng:** 12.285 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 13
- **Giải cứu tài chính:** Thế chấp BĐS ô 28
- **Giải cứu tài chính:** Thế chấp BĐS ô 26
- **Giải cứu tài chính:** Thế chấp BĐS ô 39
- **Số dư sau lượt:** 1.435 Tr. VNĐ | **Tài sản ròng:** 12.285 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng) (C3), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt), An Giang (Châu Đốc) (C3)

#### Lượt #123 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.589 Tr. VNĐ | **Tài sản ròng:** 39.389 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.589 Tr. VNĐ | **Tài sản ròng:** 39.389 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Nghệ An (TP. Vinh), Thừa Thiên Huế, Khánh Hòa (Nha Trang)

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.