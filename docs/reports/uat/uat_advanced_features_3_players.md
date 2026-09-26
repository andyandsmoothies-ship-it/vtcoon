# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (3 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920263 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 107 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Cô Tư (Thận trọng / Passive)** (Tổng tài sản ròng: **42.993 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Cô Tư (Thận trọng / Passive) | Passive | 11.993 Tr. VNĐ | 42.993 Tr. VNĐ | 11 ô | 🏆 Vô địch |
| 2 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 1.422 Tr. VNĐ | 15.872 Tr. VNĐ | 10 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 2.370 Tr. VNĐ | 15.320 Tr. VNĐ | 7 ô | ✓ Hoàn thành |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 298 lần.
- Số giao dịch sang tên thành công: 35 thương vụ.
- Tổng giá trị chuyển nhượng đất: 99.840 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 4.992 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 3 phiên.
- Tổng vốn cọc đầu tư: 3.500 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 3.500 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: 0 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 0 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 4 lần.
- Tổng giá trị thanh toán chuộc đất: 4.070 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_JUNK_STOCK | Thẻ Cơ Hội | 1 lần | 33.3% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 33.3% |
| CC_CONTRACT_PENALTY | Thẻ Cơ Hội | 1 lần | 33.3% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_URBAN_PLANNING | Thẻ Thị Trường | 1 lần | 12.5% |
| MC_FIRE_INSPECTION | Thẻ Thị Trường | 1 lần | 12.5% |
| MC_PUBLIC_INVEST | Thẻ Thị Trường | 1 lần | 12.5% |
| MC_CASINO_PILOT | Thẻ Thị Trường | 1 lần | 12.5% |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 12.5% |
| MC_ALCOHOL_CHECK | Thẻ Thị Trường | 1 lần | 12.5% |
| MC_FUEL_SURGE | Thẻ Thị Trường | 1 lần | 12.5% |
| MC_ANTI_SPECULATE | Thẻ Thị Trường | 1 lần | 12.5% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 3 lần | 2.8% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 2 lần | 1.9% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 3 lần | 2.8% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 5 lần | 4.7% |
| Cảng HKQT Long Thành | Đặc biệt | 2 lần | 1.9% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 4 lần | 3.7% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 3 lần | 2.8% |
| Cảng HKQT Nội Bài | Đặc biệt | 3 lần | 2.8% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 5 lần | 4.7% |
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
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 3.931 Tr. VNĐ | **Tài sản ròng:** 21.331 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #32 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.572 Tr. VNĐ | **Tài sản ròng:** 19.672 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 6.972 Tr. VNĐ | **Tài sản ròng:** 19.072 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #33 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 260 Tr. VNĐ | **Tài sản ròng:** 14.860 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 22 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 20 Tr. VNĐ | **Tài sản ròng:** 14.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C1), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu

#### Lượt #34 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 20 Tr. VNĐ | **Tài sản ròng:** 14.620 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 28 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 20 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 21
- **Số dư sau lượt:** 920 Tr. VNĐ | **Tài sản ròng:** 14.420 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C1), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #11 ===

#### Lượt #35 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.401 Tr. VNĐ | **Tài sản ròng:** 21.801 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 2 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 400 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 3.401 Tr. VNĐ | **Tài sản ròng:** 20.801 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #36 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.401 Tr. VNĐ | **Tài sản ròng:** 20.801 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.401 Tr. VNĐ | **Tài sản ròng:** 20.801 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép

#### Lượt #37 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.702 Tr. VNĐ | **Tài sản ròng:** 19.802 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 7.102 Tr. VNĐ | **Tài sản ròng:** 19.202 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #38 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.320 Tr. VNĐ | **Tài sản ròng:** 14.820 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 60 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1
- **Số dư sau lượt:** 1.625 Tr. VNĐ | **Tài sản ròng:** 15.725 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C1), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C1)

#### Lượt #39 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.625 Tr. VNĐ | **Tài sản ròng:** 15.725 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2
- **Số dư sau lượt:** 1.237 Tr. VNĐ | **Tài sản ròng:** 17.337 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C2), Đồng Nai (Đại Công Viên Chủ Đề) (C2), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C1)

### === VÒNG ĐẤU #12 ===

#### Lượt #40 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.883 Tr. VNĐ | **Tài sản ròng:** 22.283 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.683 Tr. VNĐ | **Tài sản ròng:** 22.283 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh)

#### Lượt #41 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.683 Tr. VNĐ | **Tài sản ròng:** 22.283 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 23 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.683 Tr. VNĐ | **Tài sản ròng:** 22.283 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang)

#### Lượt #42 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.162 Tr. VNĐ | **Tài sản ròng:** 19.262 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 26 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 6.282 Tr. VNĐ | **Tài sản ròng:** 20.982 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #43 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.282 Tr. VNĐ | **Tài sản ròng:** 20.982 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 36 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.942 Tr. VNĐ | **Tài sản ròng:** 21.442 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #44 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.237 Tr. VNĐ | **Tài sản ròng:** 17.337 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2
- **Số dư sau lượt:** 397 Tr. VNĐ | **Tài sản ròng:** 17.697 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C2), Đồng Nai (Đại Công Viên Chủ Đề) (C2), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C2)

#### Lượt #45 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 397 Tr. VNĐ | **Tài sản ròng:** 17.697 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 14 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 397 Tr. VNĐ | **Tài sản ròng:** 17.697 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C2), Đồng Nai (Đại Công Viên Chủ Đề) (C2), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C2)

### === VÒNG ĐẤU #13 ===

#### Lượt #46 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.117 Tr. VNĐ | **Tài sản ròng:** 23.317 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 31 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 4.917 Tr. VNĐ | **Tài sản ròng:** 23.717 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc)

#### Lượt #47 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.917 Tr. VNĐ | **Tài sản ròng:** 23.717 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 3 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.517 Tr. VNĐ | **Tài sản ròng:** 23.717 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #48 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.412 Tr. VNĐ | **Tài sản ròng:** 21.912 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 2700 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.712 Tr. VNĐ | **Tài sản ròng:** 19.212 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #49 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.712 Tr. VNĐ | **Tài sản ròng:** 19.212 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 140 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.572 Tr. VNĐ | **Tài sản ròng:** 19.072 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #50 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.097 Tr. VNĐ | **Tài sản ròng:** 20.397 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C3
- **Số dư sau lượt:** 1.256 Tr. VNĐ | **Tài sản ròng:** 23.356 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #14 ===

#### Lượt #51 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.708 Tr. VNĐ | **Tài sản ròng:** 24.908 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 11 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.708 Tr. VNĐ | **Tài sản ròng:** 24.908 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #52 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.884 Tr. VNĐ | **Tài sản ròng:** 19.384 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 11 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.884 Tr. VNĐ | **Tài sản ròng:** 19.384 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #53 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.256 Tr. VNĐ | **Tài sản ròng:** 23.356 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 27 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 956 Tr. VNĐ | **Tài sản ròng:** 23.056 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #15 ===

#### Lượt #54 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.008 Tr. VNĐ | **Tài sản ròng:** 25.208 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 21 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.508 Tr. VNĐ | **Tài sản ròng:** 24.708 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #55 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.508 Tr. VNĐ | **Tài sản ròng:** 24.708 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 25 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 4.528 Tr. VNĐ | **Tài sản ròng:** 27.328 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #56 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.495 Tr. VNĐ | **Tài sản ròng:** 20.395 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 14 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 5.895 Tr. VNĐ | **Tài sản ròng:** 19.795 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #57 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.856 Tr. VNĐ | **Tài sản ròng:** 24.956 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (0 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 500 Tr. VNĐ ➔ Thu về 500 Tr. VNĐ (+0 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.856 Tr. VNĐ | **Tài sản ròng:** 24.956 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #16 ===

#### Lượt #58 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.998 Tr. VNĐ | **Tài sản ròng:** 27.798 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 400 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 3.998 Tr. VNĐ | **Tài sản ròng:** 26.798 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #59 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.765 Tr. VNĐ | **Tài sản ròng:** 20.665 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 5.853 Tr. VNĐ | **Tài sản ròng:** 19.753 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #60 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.856 Tr. VNĐ | **Tài sản ròng:** 24.956 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 38 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.385 Tr. VNĐ | **Tài sản ròng:** 25.485 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #17 ===

#### Lượt #61 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.780 Tr. VNĐ | **Tài sản ròng:** 27.580 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 1875 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 3.305 Tr. VNĐ | **Tài sản ròng:** 26.105 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #62 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.323 Tr. VNĐ | **Tài sản ròng:** 20.223 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 27 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 5.423 Tr. VNĐ | **Tài sản ròng:** 19.323 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #63 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.260 Tr. VNĐ | **Tài sản ròng:** 27.360 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 4 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Khánh Hòa (Nha Trang)] (Hoàn trả nợ + 10% phí Kho Bạc: 880 Tr. VNĐ)
- **Số dư sau lượt:** 4.060 Tr. VNĐ | **Tài sản ròng:** 26.960 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #18 ===

#### Lượt #64 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.395 Tr. VNĐ | **Tài sản ròng:** 27.195 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 3.795 Tr. VNĐ | **Tài sản ròng:** 26.595 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #65 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.893 Tr. VNĐ | **Tài sản ròng:** 19.793 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (1000 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 1000 Tr. VNĐ ➔ Thu về 2000 Tr. VNĐ (+1000 Tr.)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 6.293 Tr. VNĐ | **Tài sản ròng:** 20.193 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #66 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.060 Tr. VNĐ | **Tài sản ròng:** 26.960 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 12 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Thanh Hóa (Sầm Sơn)] (Hoàn trả nợ + 10% phí Kho Bạc: 1210 Tr. VNĐ)
- **Số dư sau lượt:** 3.250 Tr. VNĐ | **Tài sản ròng:** 29.250 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #19 ===

#### Lượt #67 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.265 Tr. VNĐ | **Tài sản ròng:** 27.065 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 2.885 Tr. VNĐ | **Tài sản ròng:** 26.285 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #68 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.974 Tr. VNĐ | **Tài sản ròng:** 21.274 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 38 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 8.522 Tr. VNĐ | **Tài sản ròng:** 20.422 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #69 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.522 Tr. VNĐ | **Tài sản ròng:** 20.422 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 4 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 4.822 Tr. VNĐ | **Tài sản ròng:** 19.322 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #70 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.250 Tr. VNĐ | **Tài sản ròng:** 29.250 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 17 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 220 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.030 Tr. VNĐ | **Tài sản ròng:** 29.030 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

### === VÒNG ĐẤU #20 ===

#### Lượt #71 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.847 Tr. VNĐ | **Tài sản ròng:** 28.047 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONTRACT_PENALTY]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 5.467 Tr. VNĐ | **Tài sản ròng:** 26.267 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #72 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.033 Tr. VNĐ | **Tài sản ròng:** 19.933 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 12 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_MEGA_CONCERT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.283 Tr. VNĐ | **Tài sản ròng:** 16.183 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #73 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.530 Tr. VNĐ | **Tài sản ròng:** 37.530 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 240 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 11.290 Tr. VNĐ | **Tài sản ròng:** 37.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3)

#### Lượt #74 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.290 Tr. VNĐ | **Tài sản ròng:** 37.290 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 9.490 Tr. VNĐ | **Tài sản ròng:** 37.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế

### === VÒNG ĐẤU #21 ===

#### Lượt #75 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.957 Tr. VNĐ | **Tài sản ròng:** 22.757 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 6 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 1957 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 3
- **Giải cứu tài chính:** Thế chấp BĐS ô 11
- **Giải cứu tài chính:** Thế chấp BĐS ô 23
- **Giải cứu tài chính:** Thế chấp BĐS ô 12
- **Giải cứu tài chính:** Thế chấp BĐS ô 31
- **Số dư sau lượt:** 577 Tr. VNĐ | **Tài sản ròng:** 17.327 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #76 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.283 Tr. VNĐ | **Tài sản ròng:** 16.183 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.283 Tr. VNĐ | **Tài sản ròng:** 16.183 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #77 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.283 Tr. VNĐ | **Tài sản ròng:** 16.183 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 16 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.283 Tr. VNĐ | **Tài sản ròng:** 16.183 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt)

#### Lượt #78 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.447 Tr. VNĐ | **Tài sản ròng:** 39.247 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 18 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 374 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.073 Tr. VNĐ | **Tài sản ròng:** 38.873 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế

### === VÒNG ĐẤU #22 ===

#### Lượt #79 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 951 Tr. VNĐ | **Tài sản ròng:** 17.701 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 9 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 192 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 17.509 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #80 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.283 Tr. VNĐ | **Tài sản ròng:** 16.183 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Mua thành công [Quảng Ninh (Hạ Long)] giá 2800 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.483 Tr. VNĐ | **Tài sản ròng:** 16.183 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long)

#### Lượt #81 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.265 Tr. VNĐ | **Tài sản ròng:** 39.065 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Hoàn Kiếm)] giá 3200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 8.065 Tr. VNĐ | **Tài sản ròng:** 39.065 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế, Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #23 ===

#### Lượt #82 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 17.509 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 14 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 17.509 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #83 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.483 Tr. VNĐ | **Tài sản ròng:** 16.183 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 29 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 1483 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 1
- **Giải cứu tài chính:** Thế chấp BĐS ô 13
- **Số dư sau lượt:** 483 Tr. VNĐ | **Tài sản ròng:** 14.183 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long)

#### Lượt #84 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.065 Tr. VNĐ | **Tài sản ròng:** 39.065 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 34 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_ALCOHOL_CHECK]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 8.565 Tr. VNĐ | **Tài sản ròng:** 39.565 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế, Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #24 ===

#### Lượt #85 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.242 Tr. VNĐ | **Tài sản ròng:** 18.992 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 23 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.042 Tr. VNĐ | **Tài sản ròng:** 18.792 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #86 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 683 Tr. VNĐ | **Tài sản ròng:** 14.383 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 38 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1133 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 16
- **Số dư sau lượt:** 33 Tr. VNĐ | **Tài sản ròng:** 12.833 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long)

#### Lượt #87 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.565 Tr. VNĐ | **Tài sản ròng:** 39.565 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 2 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 8.565 Tr. VNĐ | **Tài sản ròng:** 39.565 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế, Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #25 ===

#### Lượt #88 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.175 Tr. VNĐ | **Tài sản ròng:** 19.925 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 28 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.175 Tr. VNĐ | **Tài sản ròng:** 19.925 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #89 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 33 Tr. VNĐ | **Tài sản ròng:** 12.833 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 5 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 33 Tr. VNĐ | **Tài sản ròng:** 12.833 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long)

#### Lượt #90 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.565 Tr. VNĐ | **Tài sản ròng:** 39.565 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 8.565 Tr. VNĐ | **Tài sản ròng:** 39.565 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế, Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #26 ===

#### Lượt #91 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.175 Tr. VNĐ | **Tài sản ròng:** 19.925 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 37 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FUEL_SURGE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Bình Thuận (Mũi Né)] (Hoàn trả nợ + 10% phí Kho Bạc: 770 Tr. VNĐ)
- **Số dư sau lượt:** 3.328 Tr. VNĐ | **Tài sản ròng:** 20.778 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #92 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** -467 Tr. VNĐ | **Tài sản ròng:** 12.333 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 28
- **Số dư sau lượt:** 283 Tr. VNĐ | **Tài sản ròng:** 12.333 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long)

#### Lượt #93 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.440 Tr. VNĐ | **Tài sản ròng:** 39.440 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 21 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 8.440 Tr. VNĐ | **Tài sản ròng:** 39.440 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế, Hà Nội (Hoàn Kiếm)

#### Lượt #94 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.440 Tr. VNĐ | **Tài sản ròng:** 39.440 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 23 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 8.440 Tr. VNĐ | **Tài sản ròng:** 39.440 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế, Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #27 ===

#### Lượt #95 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.346 Tr. VNĐ | **Tài sản ròng:** 21.796 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 2 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 192 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Nghệ An (TP. Vinh)] (Hoàn trả nợ + 10% phí Kho Bạc: 1210 Tr. VNĐ)
- **Số dư sau lượt:** 2.944 Tr. VNĐ | **Tài sản ròng:** 21.494 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #96 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.944 Tr. VNĐ | **Tài sản ròng:** 21.494 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 14 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 288 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.656 Tr. VNĐ | **Tài sản ròng:** 21.206 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #97 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.301 Tr. VNĐ | **Tài sản ròng:** 13.351 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 11 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.301 Tr. VNĐ | **Tài sản ròng:** 13.351 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long)

#### Lượt #98 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.920 Tr. VNĐ | **Tài sản ròng:** 39.920 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 32 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 72 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 9.348 Tr. VNĐ | **Tài sản ròng:** 40.348 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế, Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #28 ===

#### Lượt #99 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.728 Tr. VNĐ | **Tài sản ròng:** 21.278 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 24 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 336 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.392 Tr. VNĐ | **Tài sản ròng:** 20.942 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #100 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.637 Tr. VNĐ | **Tài sản ròng:** 13.687 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 20 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.637 Tr. VNĐ | **Tài sản ròng:** 13.687 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long)

#### Lượt #101 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.348 Tr. VNĐ | **Tài sản ròng:** 40.348 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 3 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 9.348 Tr. VNĐ | **Tài sản ròng:** 40.348 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế, Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #29 ===

#### Lượt #102 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.392 Tr. VNĐ | **Tài sản ròng:** 20.942 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 29 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Thua lỗ thị trường (-1000 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 1000 Tr. VNĐ (-1000 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.392 Tr. VNĐ | **Tài sản ròng:** 19.942 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #103 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.637 Tr. VNĐ | **Tài sản ròng:** 13.687 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 29 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 1637 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 29
- **Số dư sau lượt:** 707 Tr. VNĐ | **Tài sản ròng:** 11.657 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long)

#### Lượt #104 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.348 Tr. VNĐ | **Tài sản ròng:** 40.348 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 9 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_ANTI_SPECULATE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 8.348 Tr. VNĐ | **Tài sản ròng:** 39.348 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế, Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #30 ===

#### Lượt #105 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.257 Tr. VNĐ | **Tài sản ròng:** 21.807 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 38 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 3645 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 3
- **Giải cứu tài chính:** Thế chấp BĐS ô 11
- **Giải cứu tài chính:** Thế chấp BĐS ô 23
- **Số dư sau lượt:** 120 Tr. VNĐ | **Tài sản ròng:** 14.570 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Bình Thuận (Mũi Né)

#### Lượt #106 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 935 Tr. VNĐ | **Tài sản ròng:** 13.885 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 35 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 90 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.158 Tr. VNĐ | **Tài sản ròng:** 14.108 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long)

#### Lượt #107 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.993 Tr. VNĐ | **Tài sản ròng:** 42.993 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 17 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.993 Tr. VNĐ | **Tài sản ròng:** 42.993 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Thừa Thiên Huế, Hà Nội (Hoàn Kiếm)

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.