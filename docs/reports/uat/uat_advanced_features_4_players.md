# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (4 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920264 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 128 lượt.
- **Số vòng thi đấu (Rounds):** 30 vòng.
- **Điều kiện kết thúc:** LOẠI BỎ DO PHÁ SẢN (Chỉ còn 1 người sống sót).
- **Nhà Vô Địch Chung Cuộc:** **Chú Sáu (Cân bằng / Balanced)** (Tổng tài sản ròng: **18.612 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Chú Sáu (Cân bằng / Balanced) | Balanced | 362 Tr. VNĐ | 18.612 Tr. VNĐ | 7 ô | 🏆 Vô địch |
| 2 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | -31 Tr. VNĐ | -31 Tr. VNĐ | 0 ô | ❌ Phá sản |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | -444 Tr. VNĐ | -444 Tr. VNĐ | 0 ô | ❌ Phá sản |
| 4 | Bác Ba (Thực dụng / Aggressive) | Aggressive | -710 Tr. VNĐ | -710 Tr. VNĐ | 0 ô | ❌ Phá sản |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 21 lần.
- Số giao dịch sang tên thành công: 21 thương vụ.
- Tổng giá trị chuyển nhượng đất: 53.560 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 2.678 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 1 phiên.
- Tổng vốn cọc đầu tư: 1.000 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 800 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: -200 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 0 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 0 lần.
- Tổng giá trị thanh toán chuộc đất: 0 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_BUILD_HALT | Thẻ Cơ Hội | 1 lần | 11.1% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 11.1% |
| CC_PORT_EXCLUSIVE | Thẻ Cơ Hội | 1 lần | 11.1% |
| CC_TAX_AUDIT | Thẻ Cơ Hội | 1 lần | 11.1% |
| CC_DIPLOMATIC | Thẻ Cơ Hội | 1 lần | 11.1% |
| CC_LAND_CHANGE | Thẻ Cơ Hội | 1 lần | 11.1% |
| CC_CONCERT_SPONSOR | Thẻ Cơ Hội | 1 lần | 11.1% |
| CC_MEDIA_CRISIS | Thẻ Cơ Hội | 1 lần | 11.1% |
| CC_JUNK_STOCK | Thẻ Cơ Hội | 1 lần | 11.1% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_FUEL_SURGE | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_NIGHT_ECONOMY | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_CASINO_PILOT | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_LAND_FEVER | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_PEAK_TOURISM | Thẻ Thị Trường | 1 lần | 16.7% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 4 lần | 3.1% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 6 lần | 4.7% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 4 lần | 3.1% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 5 lần | 3.9% |
| Cảng HKQT Long Thành | Đặc biệt | 5 lần | 3.9% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 4 lần | 3.1% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 6 lần | 4.7% |
| Cảng HKQT Nội Bài | Đặc biệt | 2 lần | 1.6% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 2 lần | 1.6% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 2 lần | 1.6% |

---

## IV. NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐI TỪ ĐẦU ĐẾN KẾT THÚC (STEP-BY-STEP LOG)

### === VÒNG ĐẤU #1 ===

#### Lượt #1 | Vòng #1 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 0 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #2 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 0 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 13.500 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Tập Đoàn Điện Lực (EVN)

#### Lượt #3 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.500 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Đà Nẵng (Hải Châu - Sơn Trà)] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.500 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #4 | Vòng #1 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 10.900 Tr. VNĐ | **Tài sản ròng:** 12.900 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #5 | Vòng #1 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_BUILD_HALT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Cô Tư (Thận trọng / Passive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 12.400 Tr. VNĐ | **Tài sản ròng:** 14.400 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

### === VÒNG ĐẤU #2 ===

#### Lượt #6 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 10.800 Tr. VNĐ | **Tài sản ròng:** 14.400 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang)

#### Lượt #7 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.800 Tr. VNĐ | **Tài sản ròng:** 14.400 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 14 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Mua thành công [Tuyến Cao Tốc Bắc - Nam] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 8.800 Tr. VNĐ | **Tài sản ròng:** 14.400 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #8 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.970 Tr. VNĐ | **Tài sản ròng:** 15.470 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 10.870 Tr. VNĐ | **Tài sản ròng:** 14.370 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #9 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.870 Tr. VNĐ | **Tài sản ròng:** 14.370 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 25 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Bác Ba (Thực dụng / Aggressive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 6.790 Tr. VNĐ | **Tài sản ròng:** 13.890 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Cảng HKQT Nội Bài

#### Lượt #10 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.370 Tr. VNĐ | **Tài sản ròng:** 13.370 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 4 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 10.610 Tr. VNĐ | **Tài sản ròng:** 12.610 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #11 | Vòng #2 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.870 Tr. VNĐ | **Tài sản ròng:** 14.870 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 7 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_MEGA_CONCERT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Cô Tư (Thận trọng / Passive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 12.270 Tr. VNĐ | **Tài sản ròng:** 14.270 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

### === VÒNG ĐẤU #3 ===

#### Lượt #12 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.746 Tr. VNĐ | **Tài sản ròng:** 15.746 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 6 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Mua thành công [Bà Rịa - Vũng Tàu] giá 1200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 9.946 Tr. VNĐ | **Tài sản ròng:** 15.146 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Bà Rịa - Vũng Tàu

#### Lượt #13 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 9.420 Tr. VNĐ | **Tài sản ròng:** 14.520 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 5.420 Tr. VNĐ | **Tài sản ròng:** 13.920 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt)

#### Lượt #14 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.080 Tr. VNĐ | **Tài sản ròng:** 13.080 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 4150 Tr. VNĐ
- **Số dư sau lượt:** 13.080 Tr. VNĐ | **Tài sản ròng:** 13.080 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #15 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.740 Tr. VNĐ | **Tài sản ròng:** 14.740 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 280 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Chú Sáu (Cân bằng / Balanced) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 11.860 Tr. VNĐ | **Tài sản ròng:** 13.860 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

### === VÒNG ĐẤU #4 ===

#### Lượt #16 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.416 Tr. VNĐ | **Tài sản ròng:** 15.616 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 9 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 8.016 Tr. VNĐ | **Tài sản ròng:** 15.016 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Bà Rịa - Vũng Tàu, Thừa Thiên Huế

#### Lượt #17 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.020 Tr. VNĐ | **Tài sản ròng:** 11.920 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1
- **Số dư sau lượt:** 2.040 Tr. VNĐ | **Tài sản ròng:** 12.140 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C1), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C1), Bình Thuận (Mũi Né) (C1)

#### Lượt #18 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.080 Tr. VNĐ | **Tài sản ròng:** 13.080 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 11 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 10.280 Tr. VNĐ | **Tài sản ròng:** 12.280 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #19 | Vòng #4 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.330 Tr. VNĐ | **Tài sản ròng:** 14.330 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 13 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Cô Tư (Thận trọng / Passive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 9.330 Tr. VNĐ | **Tài sản ròng:** 13.730 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Đà Nẵng (Hải Châu - Sơn Trà), Ninh Bình (Tràng An)

### === VÒNG ĐẤU #5 ===

#### Lượt #20 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.686 Tr. VNĐ | **Tài sản ròng:** 15.686 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 18 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 5.886 Tr. VNĐ | **Tài sản ròng:** 15.086 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn)

#### Lượt #21 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.040 Tr. VNĐ | **Tài sản ròng:** 12.140 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 20 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Từ chối mua [Nghệ An (TP. Vinh)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Nghệ An (TP. Vinh)] với giá 4950 Tr. VNĐ
- **Số dư sau lượt:** 1.060 Tr. VNĐ | **Tài sản ròng:** 12.560 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C1), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C1), Bình Thuận (Mũi Né) (C2)

#### Lượt #22 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.750 Tr. VNĐ | **Tài sản ròng:** 12.750 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 9.650 Tr. VNĐ | **Tài sản ròng:** 11.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #23 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.650 Tr. VNĐ | **Tài sản ròng:** 11.650 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 25 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Hà Nội (Cầu Giấy)] với giá 3850 Tr. VNĐ
- **Số dư sau lượt:** 9.650 Tr. VNĐ | **Tài sản ròng:** 11.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #24 | Vòng #5 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.950 Tr. VNĐ | **Tài sản ròng:** 13.350 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.950 Tr. VNĐ | **Tài sản ròng:** 13.350 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang)

### === VÒNG ĐẤU #6 ===

#### Lượt #25 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.906 Tr. VNĐ | **Tài sản ròng:** 13.306 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 21 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.606 Tr. VNĐ | **Tài sản ròng:** 13.006 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tuyến Cao Tốc Bắc - Nam, Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Nghệ An (TP. Vinh)

#### Lượt #26 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.060 Tr. VNĐ | **Tài sản ròng:** 12.560 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 3550 Tr. VNĐ
- **Số dư sau lượt:** 1.060 Tr. VNĐ | **Tài sản ròng:** 12.560 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C1), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C1), Bình Thuận (Mũi Né) (C2)

#### Lượt #27 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.650 Tr. VNĐ | **Tài sản ròng:** 11.650 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 32 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bà Rịa - Vũng Tàu] từ Bác Ba (Thực dụng / Aggressive) với giá 1560 Tr. VNĐ (Nộp thuế chuyển nhượng 78 Tr.)
- **Số dư sau lượt:** 10.090 Tr. VNĐ | **Tài sản ròng:** 13.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu

#### Lượt #28 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.700 Tr. VNĐ | **Tài sản ròng:** 12.900 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.700 Tr. VNĐ | **Tài sản ròng:** 12.900 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #7 ===

#### Lượt #29 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.088 Tr. VNĐ | **Tài sản ròng:** 13.288 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 31 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Cô Tư (Thận trọng / Passive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 3.288 Tr. VNĐ | **Tài sản ròng:** 14.088 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Nghệ An (TP. Vinh), Cần Thơ (Cái Răng)

#### Lượt #30 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.060 Tr. VNĐ | **Tài sản ròng:** 12.560 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 1650 Tr. VNĐ
- **Số dư sau lượt:** 1.060 Tr. VNĐ | **Tài sản ròng:** 12.560 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C1), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C1), Bình Thuận (Mũi Né) (C2)

#### Lượt #31 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.560 Tr. VNĐ | **Tài sản ròng:** 13.760 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Từ chối mua [Bình Dương (Tổ Hợp Thể Thao & Golf)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Bình Dương (Tổ Hợp Thể Thao & Golf)] với giá 1450 Tr. VNĐ
- **Số dư sau lượt:** 12.560 Tr. VNĐ | **Tài sản ròng:** 13.760 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bà Rịa - Vũng Tàu

#### Lượt #32 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 250 Tr. VNĐ | **Tài sản ròng:** 12.450 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 38 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 900 Tr. VNĐ | **Tài sản ròng:** 13.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc)

### === VÒNG ĐẤU #8 ===

#### Lượt #33 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.638 Tr. VNĐ | **Tài sản ròng:** 15.638 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng tại [Phiếu Cơ Hội]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.638 Tr. VNĐ | **Tài sản ròng:** 15.638 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm)

#### Lượt #34 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.060 Tr. VNĐ | **Tài sản ròng:** 12.560 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 34 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Thua lỗ thị trường (-200 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 1000 Tr. VNĐ ➔ Thu về 800 Tr. VNĐ (-200 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 860 Tr. VNĐ | **Tài sản ròng:** 12.360 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C1), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C1), Bình Thuận (Mũi Né) (C2)

#### Lượt #35 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.560 Tr. VNĐ | **Tài sản ròng:** 13.760 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 6 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 480 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 9.480 Tr. VNĐ | **Tài sản ròng:** 12.680 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu

#### Lượt #36 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 900 Tr. VNĐ | **Tài sản ròng:** 13.700 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 3 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 900 Tr. VNĐ | **Tài sản ròng:** 13.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc)

### === VÒNG ĐẤU #9 ===

#### Lượt #37 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.108 Tr. VNĐ | **Tài sản ròng:** 16.108 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 7 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.108 Tr. VNĐ | **Tài sản ròng:** 16.108 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép

#### Lượt #38 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.108 Tr. VNĐ | **Tài sản ròng:** 16.108 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.108 Tr. VNĐ | **Tài sản ròng:** 16.108 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép

#### Lượt #39 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.108 Tr. VNĐ | **Tài sản ròng:** 16.108 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 21 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 1500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 608 Tr. VNĐ | **Tài sản ròng:** 16.108 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tuyến Cao Tốc Bắc - Nam, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel)

#### Lượt #40 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.340 Tr. VNĐ | **Tài sản ròng:** 12.840 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 38 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 120 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2
- **Số dư sau lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 14.870 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #41 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.600 Tr. VNĐ | **Tài sản ròng:** 12.800 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 14 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 9.760 Tr. VNĐ | **Tài sản ròng:** 14.760 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế

#### Lượt #42 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 900 Tr. VNĐ | **Tài sản ròng:** 13.700 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 720 Tr. VNĐ | **Tài sản ròng:** 13.520 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Ninh Bình (Tràng An), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc)

### === VÒNG ĐẤU #10 ===

#### Lượt #43 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.831 Tr. VNĐ | **Tài sản ròng:** 16.531 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 28 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FUEL_SURGE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.831 Tr. VNĐ | **Tài sản ròng:** 16.531 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Thanh Hóa (Sầm Sơn), Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel)

#### Lượt #44 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 14.870 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 9 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 370 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 12
- **Giải cứu tài chính:** Thế chấp BĐS ô 35
- **Số dư sau lượt:** 620 Tr. VNĐ | **Tài sản ròng:** 13.370 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #45 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.940 Tr. VNĐ | **Tài sản ròng:** 14.940 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 22 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 240 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 6.580 Tr. VNĐ | **Tài sản ròng:** 13.980 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An)

#### Lượt #46 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.580 Tr. VNĐ | **Tài sản ròng:** 13.980 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 24 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 3.440 Tr. VNĐ | **Tài sản ròng:** 13.040 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #47 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.204 Tr. VNĐ | **Tài sản ròng:** 14.604 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.704 Tr. VNĐ | **Tài sản ròng:** 13.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc)

### === VÒNG ĐẤU #11 ===

#### Lượt #48 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.418 Tr. VNĐ | **Tài sản ròng:** 18.918 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 33 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (TP. Thủ Đức)] giá 3500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.918 Tr. VNĐ | **Tài sản ròng:** 18.918 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức)

#### Lượt #49 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 620 Tr. VNĐ | **Tài sản ròng:** 13.370 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 15 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 620 Tr. VNĐ | **Tài sản ròng:** 13.370 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #50 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.440 Tr. VNĐ | **Tài sản ròng:** 13.040 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_PORT_EXCLUSIVE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.440 Tr. VNĐ | **Tài sản ròng:** 13.040 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #51 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.704 Tr. VNĐ | **Tài sản ròng:** 13.104 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 25 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_TAX_AUDIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.704 Tr. VNĐ | **Tài sản ròng:** 12.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc)

### === VÒNG ĐẤU #12 ===

#### Lượt #52 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.918 Tr. VNĐ | **Tài sản ròng:** 18.918 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 37 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.118 Tr. VNĐ | **Tài sản ròng:** 18.118 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành

#### Lượt #53 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 620 Tr. VNĐ | **Tài sản ròng:** 13.370 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 620 Tr. VNĐ | **Tài sản ròng:** 13.370 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #54 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.440 Tr. VNĐ | **Tài sản ròng:** 13.040 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 36 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.690 Tr. VNĐ | **Tài sản ròng:** 13.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #55 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.704 Tr. VNĐ | **Tài sản ròng:** 12.104 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 36 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.954 Tr. VNĐ | **Tài sản ròng:** 13.354 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc)

### === VÒNG ĐẤU #13 ===

#### Lượt #56 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.118 Tr. VNĐ | **Tài sản ròng:** 19.118 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 5 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.118 Tr. VNĐ | **Tài sản ròng:** 19.118 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành

#### Lượt #57 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 620 Tr. VNĐ | **Tài sản ròng:** 13.370 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 26 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 620 Tr. VNĐ | **Tài sản ròng:** 13.370 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #58 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 620 Tr. VNĐ | **Tài sản ròng:** 13.370 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 38 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.663 Tr. VNĐ | **Tài sản ròng:** 14.413 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #59 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.690 Tr. VNĐ | **Tài sản ròng:** 13.290 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 5 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 1120 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.570 Tr. VNĐ | **Tài sản ròng:** 12.170 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #60 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.074 Tr. VNĐ | **Tài sản ròng:** 13.474 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.767 Tr. VNĐ | **Tài sản ròng:** 13.167 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc)

### === VÒNG ĐẤU #14 ===

#### Lượt #61 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.118 Tr. VNĐ | **Tài sản ròng:** 19.118 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 12 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.118 Tr. VNĐ | **Tài sản ròng:** 19.118 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành

#### Lượt #62 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.783 Tr. VNĐ | **Tài sản ròng:** 15.533 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Mua thành công [Đồng Nai (Đại Công Viên Chủ Đề)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C3
- **Số dư sau lượt:** 103 Tr. VNĐ | **Tài sản ròng:** 15.953 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #63 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 103 Tr. VNĐ | **Tài sản ròng:** 15.953 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 8 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Từ chối mua [Bình Định (Quy Nhơn)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Bình Định (Quy Nhơn)] với giá 2050 Tr. VNĐ
- **Số dư sau lượt:** 103 Tr. VNĐ | **Tài sản ròng:** 15.953 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #64 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.570 Tr. VNĐ | **Tài sản ròng:** 12.170 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 11 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.570 Tr. VNĐ | **Tài sản ròng:** 12.170 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #65 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 717 Tr. VNĐ | **Tài sản ròng:** 12.917 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 4 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 717 Tr. VNĐ | **Tài sản ròng:** 12.917 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc), Bình Định (Quy Nhơn)

#### Lượt #66 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 717 Tr. VNĐ | **Tài sản ròng:** 12.917 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 717 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 3
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Giải cứu tài chính:** Thế chấp BĐS ô 16
- **Số dư sau lượt:** 417 Tr. VNĐ | **Tài sản ròng:** 10.917 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc), Bình Định (Quy Nhơn)

### === VÒNG ĐẤU #15 ===

#### Lượt #67 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.835 Tr. VNĐ | **Tài sản ròng:** 19.835 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 23 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 2.835 Tr. VNĐ | **Tài sản ròng:** 19.835 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành

#### Lượt #68 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 103 Tr. VNĐ | **Tài sản ròng:** 15.953 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 16 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 103 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 8
- **Số dư sau lượt:** 383 Tr. VNĐ | **Tài sản ròng:** 15.733 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #69 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.570 Tr. VNĐ | **Tài sản ròng:** 12.170 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 20 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.570 Tr. VNĐ | **Tài sản ròng:** 12.170 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #70 | Vòng #15 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 417 Tr. VNĐ | **Tài sản ròng:** 10.917 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 15 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 417 Tr. VNĐ | **Tài sản ròng:** 10.917 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc), Bình Định (Quy Nhơn)

### === VÒNG ĐẤU #16 ===

#### Lượt #71 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.938 Tr. VNĐ | **Tài sản ròng:** 19.938 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 26 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_DIPLOMATIC]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.938 Tr. VNĐ | **Tài sản ròng:** 19.938 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành

#### Lượt #72 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 383 Tr. VNĐ | **Tài sản ròng:** 15.733 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 23 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] với giá 1350 Tr. VNĐ
- **Số dư sau lượt:** 383 Tr. VNĐ | **Tài sản ròng:** 15.733 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #73 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.570 Tr. VNĐ | **Tài sản ròng:** 12.170 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.570 Tr. VNĐ | **Tài sản ròng:** 12.170 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #74 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 417 Tr. VNĐ | **Tài sản ròng:** 10.917 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 20 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 417 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 29
- **Giải cứu tài chính:** Thế chấp BĐS ô 31
- **Số dư sau lượt:** 1.317 Tr. VNĐ | **Tài sản ròng:** 8.917 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc), Bình Định (Quy Nhơn)

### === VÒNG ĐẤU #17 ===

#### Lượt #75 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.005 Tr. VNĐ | **Tài sản ròng:** 21.605 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 31 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_LAND_CHANGE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.205 Tr. VNĐ | **Tài sản ròng:** 20.805 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #76 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 383 Tr. VNĐ | **Tài sản ròng:** 15.733 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 26 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 383 Tr. VNĐ | **Tài sản ròng:** 15.733 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #77 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.570 Tr. VNĐ | **Tài sản ròng:** 12.170 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.570 Tr. VNĐ | **Tài sản ròng:** 12.170 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #78 | Vòng #17 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.317 Tr. VNĐ | **Tài sản ròng:** 8.917 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 25 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.317 Tr. VNĐ | **Tài sản ròng:** 8.917 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc), Bình Định (Quy Nhơn)

### === VÒNG ĐẤU #18 ===

#### Lượt #79 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.205 Tr. VNĐ | **Tài sản ròng:** 20.805 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 36 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 1
- **Giải cứu tài chính:** Thế chấp BĐS ô 23
- **Số dư sau lượt:** 1.005 Tr. VNĐ | **Tài sản ròng:** 19.205 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #80 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 383 Tr. VNĐ | **Tài sản ròng:** 15.733 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 63 Tr. VNĐ | **Tài sản ròng:** 15.413 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #81 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.570 Tr. VNĐ | **Tài sản ròng:** 12.170 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.070 Tr. VNĐ | **Tài sản ròng:** 11.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #82 | Vòng #18 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.317 Tr. VNĐ | **Tài sản ròng:** 8.917 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.317 Tr. VNĐ | **Tài sản ròng:** 8.917 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc), Bình Định (Quy Nhơn)

### === VÒNG ĐẤU #19 ===

#### Lượt #83 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.325 Tr. VNĐ | **Tài sản ròng:** 19.525 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 5 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 1280 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 45 Tr. VNĐ | **Tài sản ròng:** 18.245 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #84 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.343 Tr. VNĐ | **Tài sản ròng:** 16.693 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 34 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C3
- **Số dư sau lượt:** 411 Tr. VNĐ | **Tài sản ròng:** 18.161 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #85 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 411 Tr. VNĐ | **Tài sản ròng:** 18.161 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 411 Tr. VNĐ | **Tài sản ròng:** 18.161 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #86 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.070 Tr. VNĐ | **Tài sản ròng:** 11.670 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 2070 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 9
- **Giải cứu tài chính:** Thế chấp BĐS ô 18
- **Giải cứu tài chính:** Thế chấp BĐS ô 19
- **Giải cứu tài chính:** Thế chấp BĐS ô 21
- **Số dư sau lượt:** 670 Tr. VNĐ | **Tài sản ròng:** 6.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #87 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.317 Tr. VNĐ | **Tài sản ròng:** 8.917 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 38 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.969 Tr. VNĐ | **Tài sản ròng:** 9.569 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), An Giang (Châu Đốc), Bình Định (Quy Nhơn)

### === VÒNG ĐẤU #20 ===

#### Lượt #88 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.045 Tr. VNĐ | **Tài sản ròng:** 19.245 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 14 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.045 Tr. VNĐ | **Tài sản ròng:** 19.245 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #89 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.481 Tr. VNĐ | **Tài sản ròng:** 20.231 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C3
- **Số dư sau lượt:** 801 Tr. VNĐ | **Tài sản ròng:** 20.651 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #90 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 670 Tr. VNĐ | **Tài sản ròng:** 6.670 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 22 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 358 Tr. VNĐ | **Tài sản ròng:** 6.358 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #91 | Vòng #20 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.969 Tr. VNĐ | **Tài sản ròng:** 9.569 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 1969 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 32
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** -31 Tr. VNĐ | **Tài sản ròng:** -31 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #92 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.357 Tr. VNĐ | **Tài sản ròng:** 19.557 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 19 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Kiên Giang (Phú Quốc - Grand World)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 1.357 Tr. VNĐ | **Tài sản ròng:** 19.557 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #93 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.770 Tr. VNĐ | **Tài sản ròng:** 22.620 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 20 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hưng Yên (Văn Giang)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 2.770 Tr. VNĐ | **Tài sản ròng:** 22.620 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #94 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 358 Tr. VNĐ | **Tài sản ròng:** 6.358 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_NIGHT_ECONOMY]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 358 Tr. VNĐ | **Tài sản ròng:** 6.358 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #21 ===

#### Lượt #95 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.357 Tr. VNĐ | **Tài sản ròng:** 19.557 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 27 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.357 Tr. VNĐ | **Tài sản ròng:** 19.557 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #96 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.357 Tr. VNĐ | **Tài sản ròng:** 19.557 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 33 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 28
- **Giải cứu tài chính:** Thế chấp BĐS ô 26
- **Giải cứu tài chính:** Thế chấp BĐS ô 34
- **Giải cứu tài chính:** Thế chấp BĐS ô 37
- **Số dư sau lượt:** 1.587 Tr. VNĐ | **Tài sản ròng:** 14.387 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #97 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.207 Tr. VNĐ | **Tài sản ròng:** 23.057 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 31 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [TP.HCM (Quận 1 - Nguyễn Huệ)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 3.195 Tr. VNĐ | **Tài sản ròng:** 24.045 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #98 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 358 Tr. VNĐ | **Tài sản ròng:** 6.358 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 33 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #22 ===

#### Lượt #99 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.587 Tr. VNĐ | **Tài sản ròng:** 14.387 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 11 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.587 Tr. VNĐ | **Tài sản ròng:** 14.387 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #100 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.195 Tr. VNĐ | **Tài sản ròng:** 24.045 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 6 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.195 Tr. VNĐ | **Tài sản ròng:** 24.045 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #101 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 4 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #23 ===

#### Lượt #102 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.587 Tr. VNĐ | **Tài sản ròng:** 14.387 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 987 Tr. VNĐ | **Tài sản ròng:** 13.787 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #103 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 987 Tr. VNĐ | **Tài sản ròng:** 13.787 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 22 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hà Nội (Cầu Giấy)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 987 Tr. VNĐ | **Tài sản ròng:** 13.787 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #104 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.195 Tr. VNĐ | **Tài sản ròng:** 24.045 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 14 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_LAND_FEVER]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.195 Tr. VNĐ | **Tài sản ròng:** 24.045 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #105 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 8 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #24 ===

#### Lượt #106 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 987 Tr. VNĐ | **Tài sản ròng:** 13.787 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 32 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 5
- **Số dư sau lượt:** 47 Tr. VNĐ | **Tài sản ròng:** 11.847 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #107 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.195 Tr. VNĐ | **Tài sản ròng:** 24.045 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 17 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.195 Tr. VNĐ | **Tài sản ròng:** 24.045 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #108 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 19 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #25 ===

#### Lượt #109 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 47 Tr. VNĐ | **Tài sản ròng:** 11.847 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 47 Tr. VNĐ | **Tài sản ròng:** 11.847 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #110 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.195 Tr. VNĐ | **Tài sản ròng:** 24.045 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 28 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.383 Tr. VNĐ | **Tài sản ròng:** 22.233 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #111 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.383 Tr. VNĐ | **Tài sản ròng:** 22.233 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_MEDIA_CRISIS]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.383 Tr. VNĐ | **Tài sản ròng:** 22.233 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #112 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 24 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Kiên Giang (Phú Quốc - Grand World)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #26 ===

#### Lượt #113 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 47 Tr. VNĐ | **Tài sản ròng:** 11.847 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 47 Tr. VNĐ | **Tài sản ròng:** 11.847 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #114 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.383 Tr. VNĐ | **Tài sản ròng:** 22.233 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 7 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.383 Tr. VNĐ | **Tài sản ròng:** 22.233 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #115 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.383 Tr. VNĐ | **Tài sản ròng:** 22.233 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 13 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PEAK_TOURISM]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.383 Tr. VNĐ | **Tài sản ròng:** 22.233 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #116 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #27 ===

#### Lượt #117 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 47 Tr. VNĐ | **Tài sản ròng:** 11.847 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 15 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 47 Tr. VNĐ | **Tài sản ròng:** 11.847 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #118 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.383 Tr. VNĐ | **Tài sản ròng:** 22.233 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 17 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1383 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Số dư sau lượt:** 723 Tr. VNĐ | **Tài sản ròng:** 18.973 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #119 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.286 Tr. VNĐ | **Tài sản ròng:** 7.286 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 34 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [An Giang (Châu Đốc)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [An Giang (Châu Đốc)] với giá 350 Tr. VNĐ
- **Số dư sau lượt:** 2.356 Tr. VNĐ | **Tài sản ròng:** 8.356 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #28 ===

#### Lượt #120 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.080 Tr. VNĐ | **Tài sản ròng:** 13.480 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 19 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_JUNK_STOCK]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 15
- **Số dư sau lượt:** 580 Tr. VNĐ | **Tài sản ròng:** 11.980 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), An Giang (Châu Đốc)

#### Lượt #121 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 723 Tr. VNĐ | **Tài sản ròng:** 18.973 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 25 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hà Nội (Cầu Giấy)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 723 Tr. VNĐ | **Tài sản ròng:** 18.973 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #122 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.356 Tr. VNĐ | **Tài sản ròng:** 8.356 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 3 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.356 Tr. VNĐ | **Tài sản ròng:** 8.356 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #123 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.356 Tr. VNĐ | **Tài sản ròng:** 8.356 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 5 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 2356 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 24
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** -444 Tr. VNĐ | **Tài sản ròng:** -444 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #124 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 580 Tr. VNĐ | **Tài sản ròng:** 11.980 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 22 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hưng Yên (Văn Giang)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 580 Tr. VNĐ | **Tài sản ròng:** 11.980 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), An Giang (Châu Đốc)

#### Lượt #125 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.079 Tr. VNĐ | **Tài sản ròng:** 21.329 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 32 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C3
- **Số dư sau lượt:** 1.399 Tr. VNĐ | **Tài sản ròng:** 21.749 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

### === VÒNG ĐẤU #29 ===

#### Lượt #126 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 580 Tr. VNĐ | **Tài sản ròng:** 11.980 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 31 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1
- **Số dư sau lượt:** 280 Tr. VNĐ | **Tài sản ròng:** 11.980 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh), Cần Thơ (Cái Răng) (C1), Hà Nội (Hoàn Kiếm), Cảng Nước Sâu Cái Mép, Tập Đoàn Viễn Thông (Viettel), TP.HCM (TP. Thủ Đức), Cảng HKQT Long Thành, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), An Giang (Châu Đốc)

#### Lượt #127 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.399 Tr. VNĐ | **Tài sản ròng:** 21.749 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 35 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Hạ cấp công trình ô 11
- **Số dư sau lượt:** 362 Tr. VNĐ | **Tài sản ròng:** 18.612 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2), Đồng Nai (Đại Công Viên Chủ Đề), Bình Dương (Tổ Hợp Thể Thao & Golf)

### === VÒNG ĐẤU #30 ===

#### Lượt #128 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 280 Tr. VNĐ | **Tài sản ròng:** 11.980 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 37 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 25
- **Giải cứu tài chính:** Hạ cấp công trình ô 1
- **Giải cứu tài chính:** Thế chấp BĐS ô 3
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** -710 Tr. VNĐ | **Tài sản ròng:** -710 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.