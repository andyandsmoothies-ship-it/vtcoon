# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (3 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920263 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 104 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Cô Tư (Thận trọng / Passive)** (Tổng tài sản ròng: **39.121 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Cô Tư (Thận trọng / Passive) | Passive | 2.221 Tr. VNĐ | 39.121 Tr. VNĐ | 13 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 2.412 Tr. VNĐ | 29.312 Tr. VNĐ | 8 ô | ✓ Hoàn thành |
| 3 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 1.641 Tr. VNĐ | 24.841 Tr. VNĐ | 6 ô | ✓ Hoàn thành |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 224 lần.
- Số giao dịch sang tên thành công: 35 thương vụ.
- Tổng giá trị chuyển nhượng đất: 115.050 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 5.752 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 1 phiên.
- Tổng vốn cọc đầu tư: 2.000 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 1.500 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: -500 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 0 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 6 lần.
- Tổng giá trị thanh toán chuộc đất: 7.865 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_JUNK_STOCK | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_CONTRACT_PENALTY | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_CONCERT_SPONSOR | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_SLOW_BUILD | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_FREE_CREDIT | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_COPYRIGHT | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_VENUE_INCIDENT | Thẻ Cơ Hội | 1 lần | 12.5% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_URBAN_PLANNING | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_FIRE_INSPECTION | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_PUBLIC_INVEST | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_CASINO_PILOT | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_ALCOHOL_CHECK | Thẻ Thị Trường | 1 lần | 16.7% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 1 lần | 1.0% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 3 lần | 2.9% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 6 lần | 5.8% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 7 lần | 6.7% |
| Cảng HKQT Long Thành | Đặc biệt | 2 lần | 1.9% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 2 lần | 1.9% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 2 lần | 1.9% |
| Cảng HKQT Nội Bài | Đặc biệt | 0 lần | 0.0% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 6 lần | 5.8% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 2 lần | 1.9% |

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
- **Số dư sau lượt:** 3.724 Tr. VNĐ | **Tài sản ròng:** 18.924 Tr. VNĐ
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
- **Số dư trước lượt:** 12.048 Tr. VNĐ | **Tài sản ròng:** 20.748 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 39 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 8.724 Tr. VNĐ | **Tài sản ròng:** 20.024 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #23 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.724 Tr. VNĐ | **Tài sản ròng:** 18.924 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 5 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.820 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #8 ===

#### Lượt #24 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.692 Tr. VNĐ | **Tài sản ròng:** 22.692 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 16 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 7.000 Tr. VNĐ | **Tài sản ròng:** 21.600 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #25 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.343 Tr. VNĐ | **Tài sản ròng:** 22.043 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 9.963 Tr. VNĐ | **Tài sản ròng:** 21.263 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #26 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.820 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 12 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.820 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #9 ===

#### Lượt #27 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.211 Tr. VNĐ | **Tài sản ròng:** 22.211 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 27 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Thua lỗ thị trường (-500 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 1500 Tr. VNĐ (-500 Tr.)
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 6.331 Tr. VNĐ | **Tài sản ròng:** 20.931 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #28 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.174 Tr. VNĐ | **Tài sản ròng:** 21.874 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Từ chối mua [Thừa Thiên Huế], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Thừa Thiên Huế] với giá 950 Tr. VNĐ
- **Số dư sau lượt:** 13.174 Tr. VNĐ | **Tài sản ròng:** 21.874 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #29 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.820 Tr. VNĐ | **Tài sản ròng:** 19.020 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_JUNK_STOCK]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.342 Tr. VNĐ | **Tài sản ròng:** 18.542 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #10 ===

#### Lượt #30 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.553 Tr. VNĐ | **Tài sản ròng:** 22.953 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 38 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 4.173 Tr. VNĐ | **Tài sản ròng:** 23.173 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Thừa Thiên Huế

#### Lượt #31 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 16.535 Tr. VNĐ | **Tài sản ròng:** 22.635 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 26 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 15.655 Tr. VNĐ | **Tài sản ròng:** 24.355 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #32 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.342 Tr. VNĐ | **Tài sản ròng:** 18.542 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 22 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.342 Tr. VNĐ | **Tài sản ròng:** 18.542 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Cảng Nước Sâu Cái Mép

#### Lượt #33 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.342 Tr. VNĐ | **Tài sản ròng:** 18.542 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 31 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C1 (Shophouse)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hưng Yên (Văn Giang)] với giá 3750 Tr. VNĐ
- **Giải cứu tài chính:** Thế chấp BĐS ô 32
- **Số dư sau lượt:** 2.748 Tr. VNĐ | **Tài sản ròng:** 19.248 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Đồng Nai (Đại Công Viên Chủ Đề) (C1), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C1), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #11 ===

#### Lượt #34 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.080 Tr. VNĐ | **Tài sản ròng:** 25.280 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 5 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C1
- **Số dư sau lượt:** 700 Tr. VNĐ | **Tài sản ròng:** 24.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), Thừa Thiên Huế, Hưng Yên (Văn Giang)

#### Lượt #35 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.866 Tr. VNĐ | **Tài sản ròng:** 24.966 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 36 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 15.486 Tr. VNĐ | **Tài sản ròng:** 24.186 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #36 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.486 Tr. VNĐ | **Tài sản ròng:** 24.186 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Cầu Giấy)] từ Cô Tư (Thận trọng / Passive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 10.186 Tr. VNĐ | **Tài sản ròng:** 21.786 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #37 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.453 Tr. VNĐ | **Tài sản ròng:** 21.453 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 31 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Khởi Hành (GO)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C2
- **Số dư sau lượt:** 3.060 Tr. VNĐ | **Tài sản ròng:** 23.860 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C2), Đồng Nai (Đại Công Viên Chủ Đề) (C2), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Bà Rịa - Vũng Tàu (C2), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #12 ===

#### Lượt #38 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.738 Tr. VNĐ | **Tài sản ròng:** 26.938 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 12 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Cầu Giấy)] từ Chú Sáu (Cân bằng / Balanced) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C1
- **Số dư sau lượt:** 218 Tr. VNĐ | **Tài sản ròng:** 24.718 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C1), Thừa Thiên Huế (C1), Hưng Yên (Văn Giang)

#### Lượt #39 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 17.102 Tr. VNĐ | **Tài sản ròng:** 24.602 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 13 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FIRE_INSPECTION]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Cầu Giấy)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 13.202 Tr. VNĐ | **Tài sản ròng:** 22.202 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hà Nội (Cầu Giấy), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #40 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.860 Tr. VNĐ | **Tài sản ròng:** 22.660 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Dương (Tổ Hợp Thể Thao & Golf)] lên C3
- **Số dư sau lượt:** 2.134 Tr. VNĐ | **Tài sản ròng:** 24.434 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C2), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Bà Rịa - Vũng Tàu (C2), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #13 ===

#### Lượt #41 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.783 Tr. VNĐ | **Tài sản ròng:** 27.783 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 20 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C2
- **Số dư sau lượt:** 763 Tr. VNĐ | **Tài sản ròng:** 29.363 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Hưng Yên (Văn Giang)

#### Lượt #42 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.202 Tr. VNĐ | **Tài sản ròng:** 22.202 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 17 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Hà Nội (Cầu Giấy)] (Hoàn trả nợ + 10% phí Kho Bạc: 1650 Tr. VNĐ)
- **Số dư sau lượt:** 7.172 Tr. VNĐ | **Tài sản ròng:** 20.272 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #43 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.134 Tr. VNĐ | **Tài sản ròng:** 25.434 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 4 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Đồng Nai (Đại Công Viên Chủ Đề)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Bà Rịa - Vũng Tàu] lên C3
- **Số dư sau lượt:** 1.504 Tr. VNĐ | **Tài sản ròng:** 27.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #14 ===

#### Lượt #44 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.174 Tr. VNĐ | **Tài sản ròng:** 32.174 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 31 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONTRACT_PENALTY]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Cầu Giấy)] từ Chú Sáu (Cân bằng / Balanced) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 1.124 Tr. VNĐ | **Tài sản ròng:** 30.124 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2), Hưng Yên (Văn Giang)

#### Lượt #45 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.027 Tr. VNĐ | **Tài sản ròng:** 21.127 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 25 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Cầu Giấy)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 6.827 Tr. VNĐ | **Tài sản ròng:** 19.927 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Lâm Đồng (Đà Lạt)

#### Lượt #46 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.827 Tr. VNĐ | **Tài sản ròng:** 19.927 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 31 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 2.327 Tr. VNĐ | **Tài sản ròng:** 18.427 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt)

#### Lượt #47 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.504 Tr. VNĐ | **Tài sản ròng:** 28.104 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 12 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 1440 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.064 Tr. VNĐ | **Tài sản ròng:** 26.664 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép

#### Lượt #48 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.064 Tr. VNĐ | **Tài sản ròng:** 26.664 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 16 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.142 Tr. VNĐ | **Tài sản ròng:** 27.742 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #15 ===

#### Lượt #49 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.274 Tr. VNĐ | **Tài sản ròng:** 33.274 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 36 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 60 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C3
- **Số dư sau lượt:** 4.894 Tr. VNĐ | **Tài sản ròng:** 36.294 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #50 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.465 Tr. VNĐ | **Tài sản ròng:** 19.565 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 36 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.865 Tr. VNĐ | **Tài sản ròng:** 20.965 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt)

#### Lượt #51 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.542 Tr. VNĐ | **Tài sản ròng:** 30.142 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 27 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.242 Tr. VNĐ | **Tài sản ròng:** 29.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #16 ===

#### Lượt #52 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.294 Tr. VNĐ | **Tài sản ròng:** 38.694 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 1875 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.419 Tr. VNĐ | **Tài sản ròng:** 36.819 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #53 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.165 Tr. VNĐ | **Tài sản ròng:** 21.265 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 2250 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.915 Tr. VNĐ | **Tài sản ròng:** 19.015 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt)

#### Lượt #54 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.367 Tr. VNĐ | **Tài sản ròng:** 33.967 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 32 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_SLOW_BUILD]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Cầu Giấy)] từ Chú Sáu (Cân bằng / Balanced) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 3.717 Tr. VNĐ | **Tài sản ròng:** 32.317 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép

#### Lượt #55 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.717 Tr. VNĐ | **Tài sản ròng:** 32.317 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 36 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lệ Phí Đăng Ký Đất Đai]: Trả tiền thuê 900 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.436 Tr. VNĐ | **Tài sản ròng:** 32.036 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Khánh Hòa (Nha Trang), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #17 ===

#### Lượt #56 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.319 Tr. VNĐ | **Tài sản ròng:** 37.719 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 8 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 6.319 Tr. VNĐ | **Tài sản ròng:** 37.719 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #57 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.770 Tr. VNĐ | **Tài sản ròng:** 19.870 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 9 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 1000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.770 Tr. VNĐ | **Tài sản ròng:** 18.870 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt)

#### Lượt #58 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.436 Tr. VNĐ | **Tài sản ròng:** 33.036 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 2100 Tr. VNĐ
- **Số dư sau lượt:** 4.436 Tr. VNĐ | **Tài sản ròng:** 31.436 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép

#### Lượt #59 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.436 Tr. VNĐ | **Tài sản ròng:** 31.436 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.626 Tr. VNĐ | **Tài sản ròng:** 32.626 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #18 ===

#### Lượt #60 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.319 Tr. VNĐ | **Tài sản ròng:** 37.719 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 8 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 2.789 Tr. VNĐ | **Tài sản ròng:** 36.789 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #61 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.021 Tr. VNĐ | **Tài sản ròng:** 19.521 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1
- **Số dư sau lượt:** 441 Tr. VNĐ | **Tài sản ròng:** 18.741 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C1), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C1)

#### Lượt #62 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.846 Tr. VNĐ | **Tài sản ròng:** 35.846 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 11 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_FREE_CREDIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 7.316 Tr. VNĐ | **Tài sản ròng:** 36.916 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #19 ===

#### Lượt #63 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.000 Tr. VNĐ | **Tài sản ròng:** 37.400 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 17 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_COPYRIGHT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.650 Tr. VNĐ | **Tài sản ròng:** 36.050 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #64 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.952 Tr. VNĐ | **Tài sản ròng:** 19.652 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 21 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2
- **Số dư sau lượt:** 772 Tr. VNĐ | **Tài sản ròng:** 20.072 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C1), Nghệ An (TP. Vinh)

#### Lượt #65 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 772 Tr. VNĐ | **Tài sản ròng:** 20.072 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 23 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 472 Tr. VNĐ | **Tài sản ròng:** 19.772 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C1), Khánh Hòa (Nha Trang) (C1), Nghệ An (TP. Vinh)

#### Lượt #66 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.616 Tr. VNĐ | **Tài sản ròng:** 37.216 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 22 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Hoàn Kiếm)] giá 3200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.416 Tr. VNĐ | **Tài sản ròng:** 37.216 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm)

#### Lượt #67 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.416 Tr. VNĐ | **Tài sản ròng:** 37.216 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 34 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.516 Tr. VNĐ | **Tài sản ròng:** 36.916 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #20 ===

#### Lượt #68 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.550 Tr. VNĐ | **Tài sản ròng:** 36.950 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 22 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 360 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 4.410 Tr. VNĐ | **Tài sản ròng:** 36.410 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #69 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.573 Tr. VNĐ | **Tài sản ròng:** 20.273 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 420 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2
- **Số dư sau lượt:** 173 Tr. VNĐ | **Tài sản ròng:** 20.273 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Viễn Thông (Viettel), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C1), Nghệ An (TP. Vinh)

#### Lượt #70 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.516 Tr. VNĐ | **Tài sản ròng:** 36.916 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 3 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.516 Tr. VNĐ | **Tài sản ròng:** 36.916 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #21 ===

#### Lượt #71 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.830 Tr. VNĐ | **Tài sản ròng:** 36.830 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 31 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_MEGA_CONCERT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.430 Tr. VNĐ | **Tài sản ròng:** 33.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #72 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** -3.427 Tr. VNĐ | **Tài sản ròng:** 16.673 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 6 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 23
- **Giải cứu tài chính:** Thế chấp BĐS ô 31
- **Giải cứu tài chính:** Thế chấp BĐS ô 39
- **Số dư sau lượt:** 1.173 Tr. VNĐ | **Tài sản ròng:** 16.673 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Viễn Thông (Viettel), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C1), Nghệ An (TP. Vinh)

#### Lượt #73 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.016 Tr. VNĐ | **Tài sản ròng:** 44.416 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 6 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.016 Tr. VNĐ | **Tài sản ròng:** 44.416 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #22 ===

#### Lượt #74 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.497 Tr. VNĐ | **Tài sản ròng:** 34.497 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.497 Tr. VNĐ | **Tài sản ròng:** 34.497 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #75 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.240 Tr. VNĐ | **Tài sản ròng:** 17.740 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 6 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2
- **Số dư sau lượt:** 1.120 Tr. VNĐ | **Tài sản ròng:** 18.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Viễn Thông (Viettel), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2), Khánh Hòa (Nha Trang) (C2), Nghệ An (TP. Vinh)

#### Lượt #76 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.016 Tr. VNĐ | **Tài sản ròng:** 44.416 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 4050 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (TP. Thủ Đức)] từ Bác Ba (Thực dụng / Aggressive) với giá 4550 Tr. VNĐ (Nộp thuế chuyển nhượng 227 Tr.)
- **Số dư sau lượt:** 2.416 Tr. VNĐ | **Tài sản ròng:** 39.316 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

#### Lượt #77 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.416 Tr. VNĐ | **Tài sản ròng:** 39.316 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 18 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.416 Tr. VNĐ | **Tài sản ròng:** 39.316 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #23 ===

#### Lượt #78 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.869 Tr. VNĐ | **Tài sản ròng:** 39.369 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 12 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Chú Sáu (Cân bằng / Balanced) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 5.669 Tr. VNĐ | **Tài sản ròng:** 36.169 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #79 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.060 Tr. VNĐ | **Tài sản ròng:** 21.160 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 14 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Nghệ An (TP. Vinh)] (Hoàn trả nợ + 10% phí Kho Bạc: 1210 Tr. VNĐ)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C3
- **Số dư sau lượt:** 1.490 Tr. VNĐ | **Tài sản ròng:** 21.890 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C2), Nghệ An (TP. Vinh)

#### Lượt #80 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.416 Tr. VNĐ | **Tài sản ròng:** 39.316 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.416 Tr. VNĐ | **Tài sản ròng:** 39.316 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #24 ===

#### Lượt #81 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.669 Tr. VNĐ | **Tài sản ròng:** 36.169 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 374 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [TP.HCM (Quận 1 - Nguyễn Huệ)] (Hoàn trả nợ + 10% phí Kho Bạc: 2200 Tr. VNĐ)
- **Số dư sau lượt:** 3.095 Tr. VNĐ | **Tài sản ròng:** 35.595 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #82 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.095 Tr. VNĐ | **Tài sản ròng:** 35.595 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 26 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 360 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.735 Tr. VNĐ | **Tài sản ròng:** 35.235 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #83 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.490 Tr. VNĐ | **Tài sản ròng:** 21.890 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 20 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.490 Tr. VNĐ | **Tài sản ròng:** 21.890 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C2), Nghệ An (TP. Vinh)

#### Lượt #84 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.150 Tr. VNĐ | **Tài sản ròng:** 40.050 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 31 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Khởi Hành (GO)]: Trả tiền thuê 900 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.423 Tr. VNĐ | **Tài sản ròng:** 40.323 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #25 ===

#### Lượt #85 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.635 Tr. VNĐ | **Tài sản ròng:** 36.135 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 32 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_ALCOHOL_CHECK]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.985 Tr. VNĐ | **Tài sản ròng:** 36.485 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #86 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.713 Tr. VNĐ | **Tài sản ròng:** 23.113 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 31 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_VENUE_INCIDENT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C3
- **Số dư sau lượt:** 193 Tr. VNĐ | **Tài sản ròng:** 22.993 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C3), Nghệ An (TP. Vinh)

#### Lượt #87 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.423 Tr. VNĐ | **Tài sản ròng:** 40.323 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.134 Tr. VNĐ | **Tài sản ròng:** 41.034 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #26 ===

#### Lượt #88 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.985 Tr. VNĐ | **Tài sản ròng:** 36.485 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 3985 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 1
- **Giải cứu tài chính:** Thế chấp BĐS ô 39
- **Số dư sau lượt:** 885 Tr. VNĐ | **Tài sản ròng:** 31.085 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C3)

#### Lượt #89 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.246 Tr. VNĐ | **Tài sản ròng:** 24.046 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 36 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 900 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 871 Tr. VNĐ | **Tài sản ròng:** 23.671 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C3), Nghệ An (TP. Vinh)

#### Lượt #90 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.119 Tr. VNĐ | **Tài sản ròng:** 45.019 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 6300 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.819 Tr. VNĐ | **Tài sản ròng:** 38.719 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #27 ===

#### Lượt #91 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.785 Tr. VNĐ | **Tài sản ròng:** 31.985 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 9 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 1785 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 12
- **Giải cứu tài chính:** Thế chấp BĐS ô 5
- **Giải cứu tài chính:** Thế chấp BĐS ô 35
- **Giải cứu tài chính:** Hạ cấp công trình ô 16
- **Giải cứu tài chính:** Hạ cấp công trình ô 18
- **Giải cứu tài chính:** Hạ cấp công trình ô 19
- **Số dư sau lượt:** 495 Tr. VNĐ | **Tài sản ròng:** 19.545 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Cảng HKQT Nội Bài, Cần Thơ (Cái Răng), Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2)

#### Lượt #92 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.956 Tr. VNĐ | **Tài sản ròng:** 31.756 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Hưng Yên (Văn Giang)] (Hoàn trả nợ + 10% phí Kho Bạc: 1650 Tr. VNĐ)
- **Số dư sau lượt:** 6.526 Tr. VNĐ | **Tài sản ròng:** 31.126 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C3), Nghệ An (TP. Vinh)

#### Lượt #93 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.819 Tr. VNĐ | **Tài sản ròng:** 38.719 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 11 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.819 Tr. VNĐ | **Tài sản ròng:** 38.719 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #28 ===

#### Lượt #94 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.236 Tr. VNĐ | **Tài sản ròng:** 19.986 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 14 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.236 Tr. VNĐ | **Tài sản ròng:** 19.986 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Cảng HKQT Nội Bài, Cảng HKQT Long Thành, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Định (Quy Nhơn) (C2), Thừa Thiên Huế (C2)

#### Lượt #95 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.526 Tr. VNĐ | **Tài sản ròng:** 31.126 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bác Ba (Thực dụng / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Cần Thơ (Cái Răng)] (Hoàn trả nợ + 10% phí Kho Bạc: 330 Tr. VNĐ)
- **Số dư sau lượt:** 996 Tr. VNĐ | **Tài sản ròng:** 27.896 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C3), Nghệ An (TP. Vinh)

#### Lượt #96 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.819 Tr. VNĐ | **Tài sản ròng:** 38.719 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.819 Tr. VNĐ | **Tài sản ròng:** 38.719 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

#### Lượt #97 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.819 Tr. VNĐ | **Tài sản ròng:** 38.719 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 24 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.819 Tr. VNĐ | **Tài sản ròng:** 38.719 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #29 ===

#### Lượt #98 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.176 Tr. VNĐ | **Tài sản ròng:** 22.926 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 20 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Tập Đoàn Điện Lực (EVN)] (Hoàn trả nợ + 10% phí Kho Bạc: 825 Tr. VNĐ)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C3
- **Số dư sau lượt:** 191 Tr. VNĐ | **Tài sản ròng:** 23.391 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C2)

#### Lượt #99 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.996 Tr. VNĐ | **Tài sản ròng:** 28.896 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 13 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 264 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.732 Tr. VNĐ | **Tài sản ròng:** 28.632 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C3), Nghệ An (TP. Vinh)

#### Lượt #100 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.083 Tr. VNĐ | **Tài sản ròng:** 38.983 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 32 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Lệ Phí Đăng Ký Đất Đai]: Trả tiền thuê 900 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.155 Tr. VNĐ | **Tài sản ròng:** 38.055 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

#### Lượt #101 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.155 Tr. VNĐ | **Tài sản ròng:** 38.055 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 4 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.303 Tr. VNĐ | **Tài sản ròng:** 38.203 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

### === VÒNG ĐẤU #30 ===

#### Lượt #102 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.091 Tr. VNĐ | **Tài sản ròng:** 25.291 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 28 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 450 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.641 Tr. VNĐ | **Tài sản ròng:** 24.841 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Cảng HKQT Nội Bài, Cảng HKQT Long Thành, Bình Định (Quy Nhơn) (C3), Thừa Thiên Huế (C2)

#### Lượt #103 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.880 Tr. VNĐ | **Tài sản ròng:** 29.780 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 21 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 468 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.412 Tr. VNĐ | **Tài sản ròng:** 29.312 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Khánh Hòa (Nha Trang) (C3), Nghệ An (TP. Vinh)

#### Lượt #104 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.221 Tr. VNĐ | **Tài sản ròng:** 39.121 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 12 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.221 Tr. VNĐ | **Tài sản ròng:** 39.121 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Bình Dương (Tổ Hợp Thể Thao & Golf) (C3), Đồng Nai (Đại Công Viên Chủ Đề) (C3), Thanh Hóa (Sầm Sơn), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), TP.HCM (TP. Thủ Đức), Bà Rịa - Vũng Tàu (C3), Cảng Nước Sâu Cái Mép, Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc)

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.