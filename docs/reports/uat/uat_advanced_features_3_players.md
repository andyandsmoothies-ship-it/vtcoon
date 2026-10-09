# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (3 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920263 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 100 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Cô Tư (Thận trọng / Passive)** (Tổng tài sản ròng: **46.587 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Cô Tư (Thận trọng / Passive) | Passive | 1.087 Tr. VNĐ | 46.587 Tr. VNĐ | 18 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 1.542 Tr. VNĐ | 10.842 Tr. VNĐ | 6 ô | ✓ Hoàn thành |
| 3 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 0 Tr. VNĐ | 0 Tr. VNĐ | 0 ô | ❌ Phá sản |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 125 lần.
- Số giao dịch sang tên thành công: 27 thương vụ.
- Tổng giá trị chuyển nhượng đất: 63.700 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 3.185 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 0 phiên.
- Tổng vốn cọc đầu tư: 0 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 0 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: 0 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 1 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 1 lần.
- Tổng giá trị thanh toán chuộc đất: 1.650 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_JUNK_STOCK | Thẻ Cơ Hội | 1 lần | 20.0% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 20.0% |
| CC_CONTRACT_PENALTY | Thẻ Cơ Hội | 1 lần | 20.0% |
| CC_CONCERT_SPONSOR | Thẻ Cơ Hội | 1 lần | 20.0% |
| CC_SLOW_BUILD | Thẻ Cơ Hội | 1 lần | 20.0% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_URBAN_PLANNING | Thẻ Thị Trường | 1 lần | 25.0% |
| MC_FIRE_INSPECTION | Thẻ Thị Trường | 1 lần | 25.0% |
| MC_PUBLIC_INVEST | Thẻ Thị Trường | 1 lần | 25.0% |
| MC_CASINO_PILOT | Thẻ Thị Trường | 1 lần | 25.0% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 0 lần | 0.0% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 17 lần | 17.0% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 1 lần | 1.0% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 3 lần | 3.0% |
| Cảng HKQT Long Thành | Đặc biệt | 0 lần | 0.0% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 2 lần | 2.0% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 2 lần | 2.0% |
| Cảng HKQT Nội Bài | Đặc biệt | 0 lần | 0.0% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 2 lần | 2.0% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 2 lần | 2.0% |

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
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 18.355 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
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
- **Số dư trước lượt:** 18.355 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 12 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 18.355 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
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
- **Số dư trước lượt:** 18.355 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 20 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 15.955 Tr. VNĐ | **Tài sản ròng:** 20.355 Tr. VNĐ
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
- **Số dư trước lượt:** 18.919 Tr. VNĐ | **Tài sản ròng:** 20.919 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 24 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 12.939 Tr. VNĐ | **Tài sản ròng:** 20.139 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #14 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.939 Tr. VNĐ | **Tài sản ròng:** 20.139 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 26 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 10.939 Tr. VNĐ | **Tài sản ròng:** 20.139 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #15 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.939 Tr. VNĐ | **Tài sản ròng:** 20.139 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 28 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_JUNK_STOCK]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 9.439 Tr. VNĐ | **Tài sản ròng:** 18.639 Tr. VNĐ
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
- **Số dư trước lượt:** 12.650 Tr. VNĐ | **Tài sản ròng:** 19.250 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 36 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 60 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 11.210 Tr. VNĐ | **Tài sản ròng:** 20.410 Tr. VNĐ
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
- **Số dư trước lượt:** 14.421 Tr. VNĐ | **Tài sản ròng:** 21.021 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 3 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 13.541 Tr. VNĐ | **Tài sản ròng:** 22.741 Tr. VNĐ
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
- **Số dư trước lượt:** 16.752 Tr. VNĐ | **Tài sản ròng:** 23.352 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 7 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_URBAN_PLANNING]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Kiên Giang (Phú Quốc - Grand World)] từ Chú Sáu (Cân bằng / Balanced) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Số dư sau lượt:** 13.372 Tr. VNĐ | **Tài sản ròng:** 22.572 Tr. VNĐ
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
- **Số dư trước lượt:** 11.272 Tr. VNĐ | **Tài sản ròng:** 21.872 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Cô Tư (Thận trọng / Passive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 9.772 Tr. VNĐ | **Tài sản ròng:** 21.372 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Bình Thuận (Mũi Né)

#### Lượt #29 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.772 Tr. VNĐ | **Tài sản ròng:** 21.372 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 19 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 480 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Hoàn Kiếm)] từ Chú Sáu (Cân bằng / Balanced) với giá 4160 Tr. VNĐ (Nộp thuế chuyển nhượng 208 Tr.)
- **Số dư sau lượt:** 5.132 Tr. VNĐ | **Tài sản ròng:** 19.932 Tr. VNĐ
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
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 4450 Tr. VNĐ
- **Giải cứu tài chính:** Thế chấp BĐS ô 32
- **Giải cứu tài chính:** Thế chấp BĐS ô 14
- **Số dư sau lượt:** 1.775 Tr. VNĐ | **Tài sản ròng:** 20.375 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), An Giang (Châu Đốc) (C2), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #10 ===

#### Lượt #34 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.567 Tr. VNĐ | **Tài sản ròng:** 19.167 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Kiên Giang (Phú Quốc - Grand World)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Quảng Ninh (Hạ Long)] lên C1
- **Số dư sau lượt:** 7 Tr. VNĐ | **Tài sản ròng:** 19.307 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long) (C1)

#### Lượt #35 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 21.238 Tr. VNĐ | **Tài sản ròng:** 23.238 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 17 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 440 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Cầu Giấy)] từ Cô Tư (Thận trọng / Passive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 16.898 Tr. VNĐ | **Tài sản ròng:** 20.098 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy)

#### Lượt #36 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.920 Tr. VNĐ | **Tài sản ròng:** 23.320 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 0 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1
- **Số dư sau lượt:** 1.840 Tr. VNĐ | **Tài sản ròng:** 23.440 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C1), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C1), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #11 ===

#### Lượt #37 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7 Tr. VNĐ | **Tài sản ròng:** 19.307 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 7 Tr. VNĐ | **Tài sản ròng:** 19.307 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long) (C1)

#### Lượt #38 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.133 Tr. VNĐ | **Tài sản ròng:** 20.333 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 23 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Hà Nội (Cầu Giấy)] (Hoàn trả nợ + 10% phí Kho Bạc: 1650 Tr. VNĐ)
- **Số dư sau lượt:** 9.773 Tr. VNĐ | **Tài sản ròng:** 19.373 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang)

#### Lượt #39 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.840 Tr. VNĐ | **Tài sản ròng:** 23.440 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C2
- **Số dư sau lượt:** 20 Tr. VNĐ | **Tài sản ròng:** 26.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #12 ===

#### Lượt #40 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.618 Tr. VNĐ | **Tài sản ròng:** 20.318 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.118 Tr. VNĐ | **Tài sản ròng:** 19.818 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long) (C1)

#### Lượt #41 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.173 Tr. VNĐ | **Tài sản ròng:** 19.773 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 31 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Cô Tư (Thận trọng / Passive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 10.273 Tr. VNĐ | **Tài sản ròng:** 20.873 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang)

#### Lượt #42 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.255 Tr. VNĐ | **Tài sản ròng:** 26.455 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 17 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 943 Tr. VNĐ | **Tài sản ròng:** 26.143 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #13 ===

#### Lượt #43 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.118 Tr. VNĐ | **Tài sản ròng:** 19.818 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 20 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 770 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.348 Tr. VNĐ | **Tài sản ròng:** 19.048 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né), Quảng Ninh (Hạ Long) (C1)

#### Lượt #44 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.585 Tr. VNĐ | **Tài sản ròng:** 21.185 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Thuận (Mũi Né)] từ Bác Ba (Thực dụng / Aggressive) với giá 1820 Tr. VNĐ (Nộp thuế chuyển nhượng 91 Tr.)
- **Số dư sau lượt:** 7.707 Tr. VNĐ | **Tài sản ròng:** 19.707 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #45 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.707 Tr. VNĐ | **Tài sản ròng:** 19.707 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 4 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 7.547 Tr. VNĐ | **Tài sản ròng:** 19.547 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #46 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.873 Tr. VNĐ | **Tài sản ròng:** 27.073 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 26 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.553 Tr. VNĐ | **Tài sản ròng:** 26.753 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C1)

### === VÒNG ĐẤU #14 ===

#### Lượt #47 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.397 Tr. VNĐ | **Tài sản ròng:** 19.697 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 23 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.097 Tr. VNĐ | **Tài sản ròng:** 19.397 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1)

#### Lượt #48 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.847 Tr. VNĐ | **Tài sản ròng:** 19.847 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 14 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 1920 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.927 Tr. VNĐ | **Tài sản ròng:** 17.927 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #49 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.473 Tr. VNĐ | **Tài sản ròng:** 28.673 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 1100 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C2
- **Số dư sau lượt:** 1.723 Tr. VNĐ | **Tài sản ròng:** 29.123 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C2)

### === VÒNG ĐẤU #15 ===

#### Lượt #50 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.197 Tr. VNĐ | **Tài sản ròng:** 20.497 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 31 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 3.897 Tr. VNĐ | **Tài sản ròng:** 20.197 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1)

#### Lượt #51 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.162 Tr. VNĐ | **Tài sản ròng:** 18.162 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Bác Ba (Thực dụng / Aggressive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 5.862 Tr. VNĐ | **Tài sản ròng:** 17.862 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang)

#### Lượt #52 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.723 Tr. VNĐ | **Tài sản ròng:** 29.123 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 1 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Từ chối mua [Bà Rịa - Vũng Tàu], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.723 Tr. VNĐ | **Tài sản ròng:** 29.123 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C2)

#### Lượt #53 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.723 Tr. VNĐ | **Tài sản ròng:** 29.123 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 9 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bà Rịa - Vũng Tàu] với giá 2400 Tr. VNĐ
- **Số dư sau lượt:** 1.723 Tr. VNĐ | **Tài sản ròng:** 29.123 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C2)

### === VÒNG ĐẤU #16 ===

#### Lượt #54 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.132 Tr. VNĐ | **Tài sản ròng:** 20.432 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 34 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 5.082 Tr. VNĐ | **Tài sản ròng:** 21.382 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1)

#### Lượt #55 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.082 Tr. VNĐ | **Tài sản ròng:** 21.382 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đồng Nai (Đại Công Viên Chủ Đề)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 3.782 Tr. VNĐ | **Tài sản ròng:** 21.082 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1)

#### Lượt #56 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.932 Tr. VNĐ | **Tài sản ròng:** 17.132 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 31 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 1980 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Bác Ba (Thực dụng / Aggressive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 3.902 Tr. VNĐ | **Tài sản ròng:** 16.102 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu

#### Lượt #57 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.902 Tr. VNĐ | **Tài sản ròng:** 16.102 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 3 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.902 Tr. VNĐ | **Tài sản ròng:** 16.102 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu

#### Lượt #58 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.703 Tr. VNĐ | **Tài sản ròng:** 31.103 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 9 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C3
- **Số dư sau lượt:** 103 Tr. VNĐ | **Tài sản ròng:** 32.203 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Lâm Đồng (Đà Lạt)

#### Lượt #59 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 103 Tr. VNĐ | **Tài sản ròng:** 32.203 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 13 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 103 Tr. VNĐ | **Tài sản ròng:** 32.203 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Lâm Đồng (Đà Lạt)

#### Lượt #60 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 103 Tr. VNĐ | **Tài sản ròng:** 32.203 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 19 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 103 Tr. VNĐ | **Tài sản ròng:** 32.203 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #17 ===

#### Lượt #61 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.017 Tr. VNĐ | **Tài sản ròng:** 21.317 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 3.717 Tr. VNĐ | **Tài sản ròng:** 21.017 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1)

#### Lượt #62 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.717 Tr. VNĐ | **Tài sản ròng:** 21.017 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 1760 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.957 Tr. VNĐ | **Tài sản ròng:** 19.257 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1)

#### Lượt #63 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.137 Tr. VNĐ | **Tài sản ròng:** 16.337 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.337 Tr. VNĐ | **Tài sản ròng:** 16.337 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #64 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.863 Tr. VNĐ | **Tài sản ròng:** 33.963 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 24 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 840 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.023 Tr. VNĐ | **Tài sản ròng:** 33.123 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C2), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #18 ===

#### Lượt #65 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.797 Tr. VNĐ | **Tài sản ròng:** 20.097 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 21 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.797 Tr. VNĐ | **Tài sản ròng:** 20.097 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1)

#### Lượt #66 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.337 Tr. VNĐ | **Tài sản ròng:** 16.337 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 16 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 3337 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 9
- **Giải cứu tài chính:** Thế chấp BĐS ô 11
- **Giải cứu tài chính:** Thế chấp BĐS ô 16
- **Giải cứu tài chính:** Thế chấp BĐS ô 31
- **Giải cứu tài chính:** Thế chấp BĐS ô 32
- **Số dư sau lượt:** 617 Tr. VNĐ | **Tài sản ròng:** 9.017 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #67 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.360 Tr. VNĐ | **Tài sản ròng:** 36.460 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 29 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C3
- **Số dư sau lượt:** 1.570 Tr. VNĐ | **Tài sản ròng:** 36.970 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Lâm Đồng (Đà Lạt)

#### Lượt #68 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.570 Tr. VNĐ | **Tài sản ròng:** 36.970 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 33 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 1400 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.170 Tr. VNĐ | **Tài sản ròng:** 36.570 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #19 ===

#### Lượt #69 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.347 Tr. VNĐ | **Tài sản ròng:** 21.647 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 28 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.347 Tr. VNĐ | **Tài sản ròng:** 21.647 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1)

#### Lượt #70 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.617 Tr. VNĐ | **Tài sản ròng:** 10.017 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 23 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.617 Tr. VNĐ | **Tài sản ròng:** 10.017 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #71 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.170 Tr. VNĐ | **Tài sản ròng:** 36.570 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONTRACT_PENALTY]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 20 Tr. VNĐ | **Tài sản ròng:** 35.420 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #20 ===

#### Lượt #72 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.497 Tr. VNĐ | **Tài sản ròng:** 21.797 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 2376 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.121 Tr. VNĐ | **Tài sản ròng:** 20.421 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1)

#### Lượt #73 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.617 Tr. VNĐ | **Tài sản ròng:** 11.017 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.617 Tr. VNĐ | **Tài sản ròng:** 11.017 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #74 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.396 Tr. VNĐ | **Tài sản ròng:** 37.796 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 7 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Từ chối mua [Cảng Nước Sâu Cái Mép], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cảng Nước Sâu Cái Mép] với giá 2250 Tr. VNĐ
- **Số dư sau lượt:** 2.396 Tr. VNĐ | **Tài sản ròng:** 37.796 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #21 ===

#### Lượt #75 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 871 Tr. VNĐ | **Tài sản ròng:** 20.171 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 871 Tr. VNĐ | **Tài sản ròng:** 20.171 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1), Cảng Nước Sâu Cái Mép

#### Lượt #76 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.617 Tr. VNĐ | **Tài sản ròng:** 11.017 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.617 Tr. VNĐ | **Tài sản ròng:** 11.017 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #77 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.396 Tr. VNĐ | **Tài sản ròng:** 37.796 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.396 Tr. VNĐ | **Tài sản ròng:** 37.796 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #22 ===

#### Lượt #78 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 871 Tr. VNĐ | **Tài sản ròng:** 20.171 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 871 Tr. VNĐ | **Tài sản ròng:** 20.171 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Kiên Giang (Phú Quốc - Grand World) (C1), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), Quảng Ninh (Hạ Long) (C1), Cảng Nước Sâu Cái Mép

#### Lượt #79 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.617 Tr. VNĐ | **Tài sản ròng:** 11.017 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.117 Tr. VNĐ | **Tài sản ròng:** 10.517 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #80 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.396 Tr. VNĐ | **Tài sản ròng:** 37.796 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 384 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.012 Tr. VNĐ | **Tài sản ròng:** 37.412 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #23 ===

#### Lượt #81 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.255 Tr. VNĐ | **Tài sản ròng:** 20.555 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 1255 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Hạ cấp công trình ô 29
- **Giải cứu tài chính:** Hạ cấp công trình ô 27
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Giải cứu tài chính:** Thế chấp BĐS ô 8
- **Giải cứu tài chính:** Thế chấp BĐS ô 29
- **Giải cứu tài chính:** Thế chấp BĐS ô 27
- **Giải cứu tài chính:** Thế chấp BĐS ô 34
- **Giải cứu tài chính:** Thế chấp BĐS ô 15
- **Giải cứu tài chính:** Thế chấp BĐS ô 12
- **Giải cứu tài chính:** Thế chấp BĐS ô 28
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** 0 Tr. VNĐ | **Tài sản ròng:** 0 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #82 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.117 Tr. VNĐ | **Tài sản ròng:** 10.517 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Từ chối mua [Thừa Thiên Huế], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.117 Tr. VNĐ | **Tài sản ròng:** 10.517 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #83 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.702 Tr. VNĐ | **Tài sản ròng:** 48.202 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Quảng Ninh (Hạ Long), Lâm Đồng (Đà Lạt), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #24 ===

#### Lượt #84 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.117 Tr. VNĐ | **Tài sản ròng:** 10.517 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 18 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.117 Tr. VNĐ | **Tài sản ròng:** 10.517 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #85 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Quảng Ninh (Hạ Long), Lâm Đồng (Đà Lạt), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #25 ===

#### Lượt #86 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.117 Tr. VNĐ | **Tài sản ròng:** 10.517 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 26 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.117 Tr. VNĐ | **Tài sản ròng:** 10.517 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #87 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Quảng Ninh (Hạ Long), Lâm Đồng (Đà Lạt), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #26 ===

#### Lượt #88 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.117 Tr. VNĐ | **Tài sản ròng:** 10.517 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [TP.HCM (TP. Thủ Đức)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 1.127 Tr. VNĐ | **Tài sản ròng:** 10.427 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #89 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Quảng Ninh (Hạ Long), Lâm Đồng (Đà Lạt), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #27 ===

#### Lượt #90 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.127 Tr. VNĐ | **Tài sản ròng:** 10.427 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 37 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.542 Tr. VNĐ | **Tài sản ròng:** 10.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #91 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.542 Tr. VNĐ | **Tài sản ròng:** 10.842 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 9 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.542 Tr. VNĐ | **Tài sản ròng:** 10.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #92 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Quảng Ninh (Hạ Long), Lâm Đồng (Đà Lạt), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #28 ===

#### Lượt #93 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.542 Tr. VNĐ | **Tài sản ròng:** 10.842 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 19 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.542 Tr. VNĐ | **Tài sản ròng:** 10.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #94 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Quảng Ninh (Hạ Long), Lâm Đồng (Đà Lạt), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #29 ===

#### Lượt #95 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.542 Tr. VNĐ | **Tài sản ròng:** 10.842 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.542 Tr. VNĐ | **Tài sản ròng:** 10.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #96 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.787 Tr. VNĐ | **Tài sản ròng:** 48.287 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.287 Tr. VNĐ | **Tài sản ròng:** 47.787 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Quảng Ninh (Hạ Long), Lâm Đồng (Đà Lạt), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

### === VÒNG ĐẤU #30 ===

#### Lượt #97 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.542 Tr. VNĐ | **Tài sản ròng:** 10.842 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.542 Tr. VNĐ | **Tài sản ròng:** 10.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #98 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.287 Tr. VNĐ | **Tài sản ròng:** 47.787 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.287 Tr. VNĐ | **Tài sản ròng:** 47.787 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Quảng Ninh (Hạ Long), Lâm Đồng (Đà Lạt), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

#### Lượt #99 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.287 Tr. VNĐ | **Tài sản ròng:** 47.787 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 12 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.687 Tr. VNĐ | **Tài sản ròng:** 47.187 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Quảng Ninh (Hạ Long), Lâm Đồng (Đà Lạt), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

#### Lượt #100 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.687 Tr. VNĐ | **Tài sản ròng:** 47.187 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 22 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_SLOW_BUILD]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.087 Tr. VNĐ | **Tài sản ròng:** 46.587 Tr. VNĐ
- **Danh mục BĐS sở hữu (18):** Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang), Đà Nẵng (Hải Châu - Sơn Trà), Thanh Hóa (Sầm Sơn) (C3), Tuyến Cao Tốc Bắc - Nam, Ninh Bình (Tràng An) (C2), Kiên Giang (Phú Quốc - Grand World), Tập Đoàn Viễn Thông (Viettel), Hà Nội (Hoàn Kiếm), An Giang (Châu Đốc) (C3), Cần Thơ (Cái Răng) (C3), Nghệ An (TP. Vinh) (C3), Quảng Ninh (Hạ Long), Lâm Đồng (Đà Lạt), Cảng Nước Sâu Cái Mép, Thừa Thiên Huế

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.