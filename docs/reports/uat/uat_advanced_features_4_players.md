# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (4 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920264 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 138 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Chú Sáu (Cân bằng / Balanced)** (Tổng tài sản ròng: **22.886 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Chú Sáu (Cân bằng / Balanced) | Balanced | 2.536 Tr. VNĐ | 22.886 Tr. VNĐ | 5 ô | 🏆 Vô địch |
| 2 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 1.376 Tr. VNĐ | 20.276 Tr. VNĐ | 10 ô | ✓ Hoàn thành |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | 4.030 Tr. VNĐ | 14.630 Tr. VNĐ | 5 ô | ✓ Hoàn thành |
| 4 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | 371 Tr. VNĐ | 10.171 Tr. VNĐ | 7 ô | ✓ Hoàn thành |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 30 lần.
- Số giao dịch sang tên thành công: 29 thương vụ.
- Tổng giá trị chuyển nhượng đất: 75.660 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 3.783 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 2 phiên.
- Tổng vốn cọc đầu tư: 2.500 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 4.600 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: 2.100 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 3 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 2 lần.
- Tổng giá trị thanh toán chuộc đất: 1.540 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_BUILD_HALT | Thẻ Cơ Hội | 1 lần | 25.0% |
| CC_DIPLOMATIC | Thẻ Cơ Hội | 1 lần | 25.0% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 25.0% |
| CC_PORT_EXCLUSIVE | Thẻ Cơ Hội | 1 lần | 25.0% |

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
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 5 lần | 3.6% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 7 lần | 5.1% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 3 lần | 2.2% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 3 lần | 2.2% |
| Cảng HKQT Long Thành | Đặc biệt | 3 lần | 2.2% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 4 lần | 2.9% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 6 lần | 4.3% |
| Cảng HKQT Nội Bài | Đặc biệt | 2 lần | 1.4% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 5 lần | 3.6% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 6 lần | 4.3% |

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
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 4650 Tr. VNĐ
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
- **Số dư trước lượt:** 3.520 Tr. VNĐ | **Tài sản ròng:** 11.420 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1
- **Số dư sau lượt:** 1.540 Tr. VNĐ | **Tài sản ròng:** 11.640 Tr. VNĐ
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
- **Số dư trước lượt:** 1.540 Tr. VNĐ | **Tài sản ròng:** 11.640 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 20 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Từ chối mua [Nghệ An (TP. Vinh)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Nghệ An (TP. Vinh)] với giá 4450 Tr. VNĐ
- **Số dư sau lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 12.060 Tr. VNĐ
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
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Hà Nội (Cầu Giấy)] với giá 4050 Tr. VNĐ
- **Số dư sau lượt:** 9.650 Tr. VNĐ | **Tài sản ròng:** 11.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #24 | Vòng #5 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.300 Tr. VNĐ | **Tài sản ròng:** 10.900 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 300 Tr. VNĐ | **Tài sản ròng:** 10.900 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang)

### === VÒNG ĐẤU #6 ===

#### Lượt #25 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.856 Tr. VNĐ | **Tài sản ròng:** 16.056 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 21 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Cô Tư (Thận trọng / Passive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 5.956 Tr. VNĐ | **Tài sản ròng:** 15.156 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn)

#### Lượt #26 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 12.060 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 1450 Tr. VNĐ
- **Số dư sau lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 12.060 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C1), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C1), Bình Thuận (Mũi Né) (C2)

#### Lượt #27 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 12.120 Tr. VNĐ | **Tài sản ròng:** 12.120 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 32 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 11.520 Tr. VNĐ | **Tài sản ròng:** 13.520 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #28 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 600 Tr. VNĐ | **Tài sản ròng:** 11.200 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 600 Tr. VNĐ | **Tài sản ròng:** 11.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang)

### === VÒNG ĐẤU #7 ===

#### Lượt #29 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.976 Tr. VNĐ | **Tài sản ròng:** 16.976 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 31 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Cô Tư (Thận trọng / Passive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 5.026 Tr. VNĐ | **Tài sản ròng:** 17.626 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng)

#### Lượt #30 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 12.060 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 1650 Tr. VNĐ
- **Số dư sau lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 12.060 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C1), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C1), Bình Thuận (Mũi Né) (C2)

#### Lượt #31 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.990 Tr. VNĐ | **Tài sản ròng:** 13.990 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Từ chối mua [Bình Dương (Tổ Hợp Thể Thao & Golf)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Bình Dương (Tổ Hợp Thể Thao & Golf)] với giá 550 Tr. VNĐ
- **Số dư sau lượt:** 13.990 Tr. VNĐ | **Tài sản ròng:** 13.990 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #32 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 600 Tr. VNĐ | **Tài sản ròng:** 11.200 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 38 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.400 Tr. VNĐ | **Tài sản ròng:** 12.600 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), An Giang (Châu Đốc)

### === VÒNG ĐẤU #8 ===

#### Lượt #33 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.826 Tr. VNĐ | **Tài sản ròng:** 19.626 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng tại [Phiếu Cơ Hội]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.826 Tr. VNĐ | **Tài sản ròng:** 19.626 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #34 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 12.060 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 34 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 560 Tr. VNĐ | **Tài sản ròng:** 12.060 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C1), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C1), Bình Thuận (Mũi Né) (C2)

#### Lượt #35 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.990 Tr. VNĐ | **Tài sản ròng:** 13.990 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 11.150 Tr. VNĐ | **Tài sản ròng:** 13.150 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #36 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.150 Tr. VNĐ | **Tài sản ròng:** 13.150 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bà Rịa - Vũng Tàu] từ Bác Ba (Thực dụng / Aggressive) với giá 1560 Tr. VNĐ (Nộp thuế chuyển nhượng 78 Tr.)
- **Số dư sau lượt:** 9.410 Tr. VNĐ | **Tài sản ròng:** 12.610 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu

#### Lượt #37 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.400 Tr. VNĐ | **Tài sản ròng:** 12.600 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 3 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 420 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 980 Tr. VNĐ | **Tài sản ròng:** 12.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), An Giang (Châu Đốc)

### === VÒNG ĐẤU #9 ===

#### Lượt #38 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.958 Tr. VNĐ | **Tài sản ròng:** 20.558 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_DIPLOMATIC]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Cô Tư (Thận trọng / Passive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 4.358 Tr. VNĐ | **Tài sản ròng:** 19.958 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #39 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.220 Tr. VNĐ | **Tài sản ròng:** 12.720 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 38 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FUEL_SURGE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2
- **Số dư sau lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 14.870 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #40 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.880 Tr. VNĐ | **Tài sản ròng:** 13.080 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 18 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 9.000 Tr. VNĐ | **Tài sản ròng:** 12.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu

#### Lượt #41 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 980 Tr. VNĐ | **Tài sản ròng:** 12.180 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 13 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng tại [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 980 Tr. VNĐ | **Tài sản ròng:** 12.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), An Giang (Châu Đốc)

### === VÒNG ĐẤU #10 ===

#### Lượt #42 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.108 Tr. VNĐ | **Tài sản ròng:** 20.708 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 14 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 220 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Cô Tư (Thận trọng / Passive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 4.288 Tr. VNĐ | **Tài sản ròng:** 19.888 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #43 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 14.870 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 2 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Từ chối mua [Đồng Nai (Đại Công Viên Chủ Đề)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Đồng Nai (Đại Công Viên Chủ Đề)] với giá 750 Tr. VNĐ
- **Số dư sau lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 14.870 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #44 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.470 Tr. VNĐ | **Tài sản ròng:** 12.670 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 29 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 8.570 Tr. VNĐ | **Tài sản ròng:** 11.770 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu

#### Lượt #45 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.570 Tr. VNĐ | **Tài sản ròng:** 11.770 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 31 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 8.570 Tr. VNĐ | **Tài sản ròng:** 11.770 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu

#### Lượt #46 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.500 Tr. VNĐ | **Tài sản ròng:** 12.700 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 24 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Viễn Thông (Viettel)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Tập Đoàn Viễn Thông (Viettel)] với giá 800 Tr. VNĐ
- **Số dư sau lượt:** 1.500 Tr. VNĐ | **Tài sản ròng:** 12.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), An Giang (Châu Đốc)

### === VÒNG ĐẤU #11 ===

#### Lượt #47 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.408 Tr. VNĐ | **Tài sản ròng:** 23.008 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 23 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 808 Tr. VNĐ | **Tài sản ròng:** 23.008 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tuyến Cao Tốc Bắc - Nam, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #48 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 808 Tr. VNĐ | **Tài sản ròng:** 23.008 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 27 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_NIGHT_ECONOMY]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 808 Tr. VNĐ | **Tài sản ròng:** 23.008 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tuyến Cao Tốc Bắc - Nam, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #49 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 14.870 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 14.870 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #50 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 370 Tr. VNĐ | **Tài sản ròng:** 14.870 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 150 Tr. VNĐ | **Tài sản ròng:** 14.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #51 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.570 Tr. VNĐ | **Tài sản ròng:** 11.770 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 37 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cảng HKQT Long Thành], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Cảng HKQT Long Thành] phát mãi về Kho Bạc
- **Số dư sau lượt:** 10.570 Tr. VNĐ | **Tài sản ròng:** 13.770 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu

#### Lượt #52 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.500 Tr. VNĐ | **Tài sản ròng:** 12.700 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 28 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.500 Tr. VNĐ | **Tài sản ròng:** 12.700 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), An Giang (Châu Đốc)

#### Lượt #53 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.500 Tr. VNĐ | **Tài sản ròng:** 12.700 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 38 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 750 Tr. VNĐ | **Tài sản ròng:** 13.950 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành

### === VÒNG ĐẤU #12 ===

#### Lượt #54 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.028 Tr. VNĐ | **Tài sản ròng:** 23.228 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [TP.HCM (Quận 1 - Nguyễn Huệ)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 1.028 Tr. VNĐ | **Tài sản ròng:** 23.228 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tuyến Cao Tốc Bắc - Nam, Thừa Thiên Huế, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #55 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 150 Tr. VNĐ | **Tài sản ròng:** 14.650 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 21 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 150 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 12
- **Số dư sau lượt:** 588 Tr. VNĐ | **Tài sản ròng:** 14.338 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #56 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.570 Tr. VNĐ | **Tài sản ròng:** 13.770 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 5 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 8.230 Tr. VNĐ | **Tài sản ròng:** 13.230 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế

#### Lượt #57 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 750 Tr. VNĐ | **Tài sản ròng:** 13.950 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 5 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 750 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 3
- **Giải cứu tài chính:** Thế chấp BĐS ô 23
- **Số dư sau lượt:** 870 Tr. VNĐ | **Tài sản ròng:** 12.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành

### === VÒNG ĐẤU #13 ===

#### Lượt #58 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.401 Tr. VNĐ | **Tài sản ròng:** 23.801 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 39 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.401 Tr. VNĐ | **Tài sản ròng:** 21.801 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tuyến Cao Tốc Bắc - Nam, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #59 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.338 Tr. VNĐ | **Tài sản ròng:** 15.088 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 27 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.038 Tr. VNĐ | **Tài sản ròng:** 14.788 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #60 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.230 Tr. VNĐ | **Tài sản ròng:** 13.230 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 5.110 Tr. VNĐ | **Tài sản ròng:** 12.510 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An)

#### Lượt #61 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.134 Tr. VNĐ | **Tài sản ròng:** 13.534 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.914 Tr. VNĐ | **Tài sản ròng:** 13.314 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành

### === VÒNG ĐẤU #14 ===

#### Lượt #62 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.621 Tr. VNĐ | **Tài sản ròng:** 22.021 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Từ chối mua [Bình Định (Quy Nhơn)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.621 Tr. VNĐ | **Tài sản ròng:** 22.021 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tuyến Cao Tốc Bắc - Nam, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #63 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.038 Tr. VNĐ | **Tài sản ròng:** 14.788 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 32 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.038 Tr. VNĐ | **Tài sản ròng:** 14.788 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C2), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #64 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.110 Tr. VNĐ | **Tài sản ròng:** 12.510 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.610 Tr. VNĐ | **Tài sản ròng:** 12.010 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An)

#### Lượt #65 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 914 Tr. VNĐ | **Tài sản ròng:** 16.114 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 21 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 602 Tr. VNĐ | **Tài sản ròng:** 15.802 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #15 ===

#### Lượt #66 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.433 Tr. VNĐ | **Tài sản ròng:** 22.833 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 16 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.433 Tr. VNĐ | **Tài sản ròng:** 22.833 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tuyến Cao Tốc Bắc - Nam, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #67 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.038 Tr. VNĐ | **Tài sản ròng:** 14.788 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C3
- **Số dư sau lượt:** 211 Tr. VNĐ | **Tài sản ròng:** 16.361 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #68 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.610 Tr. VNĐ | **Tài sản ròng:** 12.010 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 25 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.310 Tr. VNĐ | **Tài sản ròng:** 11.710 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An)

#### Lượt #69 | Vòng #15 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 902 Tr. VNĐ | **Tài sản ròng:** 16.102 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 27 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 902 Tr. VNĐ | **Tài sản ròng:** 16.102 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hà Nội (Cầu Giấy), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #16 ===

#### Lượt #70 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.553 Tr. VNĐ | **Tài sản ròng:** 22.953 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.553 Tr. VNĐ | **Tài sản ròng:** 22.953 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tuyến Cao Tốc Bắc - Nam, Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #71 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 211 Tr. VNĐ | **Tài sản ròng:** 16.361 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 211 Tr. VNĐ | **Tài sản ròng:** 16.361 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #72 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.310 Tr. VNĐ | **Tài sản ròng:** 11.710 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 32 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 3.950 Tr. VNĐ | **Tài sản ròng:** 13.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #73 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.950 Tr. VNĐ | **Tài sản ròng:** 13.550 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 36 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (100 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 500 Tr. VNĐ ➔ Thu về 600 Tr. VNĐ (+100 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.050 Tr. VNĐ | **Tài sản ròng:** 13.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #74 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.050 Tr. VNĐ | **Tài sản ròng:** 13.650 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 38 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Cầu Giấy)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 1.400 Tr. VNĐ | **Tài sản ròng:** 14.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #75 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.607 Tr. VNĐ | **Tài sản ròng:** 16.807 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 350 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [An Giang (Châu Đốc)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [An Giang (Châu Đốc)] (Hoàn trả nợ + 10% phí Kho Bạc: 330 Tr. VNĐ)
- **Số dư sau lượt:** 3.927 Tr. VNĐ | **Tài sản ròng:** 16.427 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #17 ===

#### Lượt #76 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.620 Tr. VNĐ | **Tài sản ròng:** 23.820 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 1120 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.000 Tr. VNĐ | **Tài sản ròng:** 22.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #77 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.331 Tr. VNĐ | **Tài sản ròng:** 17.481 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 11 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.331 Tr. VNĐ | **Tài sản ròng:** 17.481 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #78 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.400 Tr. VNĐ | **Tài sản ròng:** 14.000 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 3 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.400 Tr. VNĐ | **Tài sản ròng:** 14.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #79 | Vòng #17 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.927 Tr. VNĐ | **Tài sản ròng:** 16.427 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 37 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Nghệ An (TP. Vinh)] (Hoàn trả nợ + 10% phí Kho Bạc: 1210 Tr. VNĐ)
- **Số dư sau lượt:** 3.642 Tr. VNĐ | **Tài sản ròng:** 17.242 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #18 ===

#### Lượt #80 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.120 Tr. VNĐ | **Tài sản ròng:** 22.320 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.940 Tr. VNĐ | **Tài sản ròng:** 22.140 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #81 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.331 Tr. VNĐ | **Tài sản ròng:** 17.481 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.111 Tr. VNĐ | **Tài sản ròng:** 17.261 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #82 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.800 Tr. VNĐ | **Tài sản ròng:** 14.400 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 9 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 180 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.620 Tr. VNĐ | **Tài sản ròng:** 14.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #83 | Vòng #18 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.822 Tr. VNĐ | **Tài sản ròng:** 17.422 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.822 Tr. VNĐ | **Tài sản ròng:** 17.422 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #19 ===

#### Lượt #84 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.940 Tr. VNĐ | **Tài sản ròng:** 22.140 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.940 Tr. VNĐ | **Tài sản ròng:** 22.140 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #85 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.111 Tr. VNĐ | **Tài sản ròng:** 17.261 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 21 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 280 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 831 Tr. VNĐ | **Tài sản ròng:** 16.981 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #86 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.620 Tr. VNĐ | **Tài sản ròng:** 14.220 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 16 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.620 Tr. VNĐ | **Tài sản ròng:** 14.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #87 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.620 Tr. VNĐ | **Tài sản ròng:** 14.220 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 20 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.300 Tr. VNĐ | **Tài sản ròng:** 13.900 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #88 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.822 Tr. VNĐ | **Tài sản ròng:** 17.422 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.602 Tr. VNĐ | **Tài sản ròng:** 17.202 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #20 ===

#### Lượt #89 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.540 Tr. VNĐ | **Tài sản ròng:** 22.740 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 1000 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.040 Tr. VNĐ | **Tài sản ròng:** 21.240 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #90 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 831 Tr. VNĐ | **Tài sản ròng:** 16.981 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 28 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 831 Tr. VNĐ | **Tài sản ròng:** 16.981 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C2), Bình Thuận (Mũi Né) (C2)

#### Lượt #91 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.520 Tr. VNĐ | **Tài sản ròng:** 14.120 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 28 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.520 Tr. VNĐ | **Tài sản ròng:** 14.120 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #92 | Vòng #20 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.602 Tr. VNĐ | **Tài sản ròng:** 18.202 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.602 Tr. VNĐ | **Tài sản ròng:** 18.202 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #21 ===

#### Lượt #93 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.040 Tr. VNĐ | **Tài sản ròng:** 21.240 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 15 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 220 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.820 Tr. VNĐ | **Tài sản ròng:** 21.020 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #94 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 831 Tr. VNĐ | **Tài sản ròng:** 16.981 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 35 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C3
- **Số dư sau lượt:** 244 Tr. VNĐ | **Tài sản ròng:** 18.494 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2)

#### Lượt #95 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.520 Tr. VNĐ | **Tài sản ròng:** 14.120 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 32 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 400 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.120 Tr. VNĐ | **Tài sản ròng:** 13.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Đà Nẵng (Hải Châu - Sơn Trà), Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #96 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.222 Tr. VNĐ | **Tài sản ròng:** 18.822 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.722 Tr. VNĐ | **Tài sản ròng:** 18.322 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

#### Lượt #97 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.722 Tr. VNĐ | **Tài sản ròng:** 18.322 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 16 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 480 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.242 Tr. VNĐ | **Tài sản ròng:** 17.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

#### Lượt #98 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.242 Tr. VNĐ | **Tài sản ròng:** 17.842 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 28 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.922 Tr. VNĐ | **Tài sản ròng:** 17.522 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #22 ===

#### Lượt #99 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.740 Tr. VNĐ | **Tài sản ròng:** 21.940 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 23 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.440 Tr. VNĐ | **Tài sản ròng:** 21.640 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #100 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.440 Tr. VNĐ | **Tài sản ròng:** 21.640 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (2000 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 4000 Tr. VNĐ (+2000 Tr.)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Cô Tư (Thận trọng / Passive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 2.840 Tr. VNĐ | **Tài sản ròng:** 23.040 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #101 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 244 Tr. VNĐ | **Tài sản ròng:** 18.494 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 6 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 244 Tr. VNĐ | **Tài sản ròng:** 18.494 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2)

#### Lượt #102 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.590 Tr. VNĐ | **Tài sản ròng:** 14.190 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 39 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 1000 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.840 Tr. VNĐ | **Tài sản ròng:** 14.440 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #103 | Vòng #22 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.222 Tr. VNĐ | **Tài sản ròng:** 18.822 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 34 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.422 Tr. VNĐ | **Tài sản ròng:** 18.022 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

#### Lượt #104 | Vòng #22 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.422 Tr. VNĐ | **Tài sản ròng:** 18.022 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 0 ➔ Ô 3 (**An Giang (Châu Đốc)**)
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.422 Tr. VNĐ | **Tài sản ròng:** 18.022 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #23 ===

#### Lượt #105 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.840 Tr. VNĐ | **Tài sản ròng:** 23.040 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 38 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 756 Tr. VNĐ | **Tài sản ròng:** 20.956 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #106 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 244 Tr. VNĐ | **Tài sản ròng:** 18.494 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 17 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 244 Tr. VNĐ | **Tài sản ròng:** 18.494 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C2)

#### Lượt #107 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.840 Tr. VNĐ | **Tài sản ròng:** 14.440 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 5 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.840 Tr. VNĐ | **Tài sản ròng:** 14.440 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #108 | Vòng #23 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.422 Tr. VNĐ | **Tài sản ròng:** 18.022 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 3 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 2422 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 3
- **Giải cứu tài chính:** Thế chấp BĐS ô 16
- **Số dư sau lượt:** 122 Tr. VNĐ | **Tài sản ròng:** 14.522 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #24 ===

#### Lượt #109 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 756 Tr. VNĐ | **Tài sản ròng:** 20.956 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 756 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 1
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Số dư sau lượt:** 436 Tr. VNĐ | **Tài sản ròng:** 19.836 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #110 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.422 Tr. VNĐ | **Tài sản ròng:** 21.672 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 20 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C3
- **Số dư sau lượt:** 1.462 Tr. VNĐ | **Tài sản ròng:** 21.812 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #111 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.840 Tr. VNĐ | **Tài sản ròng:** 14.440 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.640 Tr. VNĐ | **Tài sản ròng:** 14.240 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #112 | Vòng #24 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 122 Tr. VNĐ | **Tài sản ròng:** 14.522 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 23 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_LAND_FEVER]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 122 Tr. VNĐ | **Tài sản ròng:** 14.522 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #25 ===

#### Lượt #113 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 916 Tr. VNĐ | **Tài sản ròng:** 20.316 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 11 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 916 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 8
- **Số dư sau lượt:** 416 Tr. VNĐ | **Tài sản ròng:** 19.316 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #114 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.462 Tr. VNĐ | **Tài sản ròng:** 21.812 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 29 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.162 Tr. VNĐ | **Tài sản ròng:** 21.512 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #115 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.940 Tr. VNĐ | **Tài sản ròng:** 14.540 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 360 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.580 Tr. VNĐ | **Tài sản ròng:** 14.180 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #116 | Vòng #25 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.038 Tr. VNĐ | **Tài sản ròng:** 15.438 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.038 Tr. VNĐ | **Tài sản ròng:** 15.438 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

#### Lượt #117 | Vòng #25 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.038 Tr. VNĐ | **Tài sản ròng:** 15.438 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 39 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 161 Tr. VNĐ | **Tài sản ròng:** 14.561 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #26 ===

#### Lượt #118 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 776 Tr. VNĐ | **Tài sản ròng:** 19.676 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 556 Tr. VNĐ | **Tài sản ròng:** 19.456 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #119 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 556 Tr. VNĐ | **Tài sản ròng:** 19.456 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 21 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 556 Tr. VNĐ | **Tài sản ròng:** 19.456 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #120 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.162 Tr. VNĐ | **Tài sản ròng:** 21.512 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 32 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.375 Tr. VNĐ | **Tài sản ròng:** 22.725 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #121 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.800 Tr. VNĐ | **Tài sản ròng:** 14.400 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 28 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.480 Tr. VNĐ | **Tài sản ròng:** 14.080 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #122 | Vòng #26 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 161 Tr. VNĐ | **Tài sản ròng:** 14.561 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 161 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 23
- **Giải cứu tài chính:** Thế chấp BĐS ô 31
- **Giải cứu tài chính:** Thế chấp BĐS ô 39
- **Số dư sau lượt:** 1.261 Tr. VNĐ | **Tài sản ròng:** 11.061 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #27 ===

#### Lượt #123 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 876 Tr. VNĐ | **Tài sản ròng:** 19.776 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 25 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 876 Tr. VNĐ | **Tài sản ròng:** 19.776 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #124 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.536 Tr. VNĐ | **Tài sản ròng:** 22.886 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.536 Tr. VNĐ | **Tài sản ròng:** 22.886 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #125 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.480 Tr. VNĐ | **Tài sản ròng:** 14.080 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 34 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.730 Tr. VNĐ | **Tài sản ròng:** 15.330 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #126 | Vòng #27 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.261 Tr. VNĐ | **Tài sản ròng:** 11.061 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 11 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.261 Tr. VNĐ | **Tài sản ròng:** 11.061 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #28 ===

#### Lượt #127 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 876 Tr. VNĐ | **Tài sản ròng:** 19.776 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 28 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 876 Tr. VNĐ | **Tài sản ròng:** 19.776 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #128 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.536 Tr. VNĐ | **Tài sản ròng:** 22.886 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 8 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.536 Tr. VNĐ | **Tài sản ròng:** 22.886 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #129 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.730 Tr. VNĐ | **Tài sản ròng:** 15.330 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 3 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_PORT_EXCLUSIVE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.730 Tr. VNĐ | **Tài sản ròng:** 15.330 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #130 | Vòng #28 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.261 Tr. VNĐ | **Tài sản ròng:** 11.061 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 16 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.261 Tr. VNĐ | **Tài sản ròng:** 11.061 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #29 ===

#### Lượt #131 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 876 Tr. VNĐ | **Tài sản ròng:** 19.776 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 876 Tr. VNĐ | **Tài sản ròng:** 19.776 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #132 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.536 Tr. VNĐ | **Tài sản ròng:** 22.886 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 2.536 Tr. VNĐ | **Tài sản ròng:** 22.886 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #133 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.730 Tr. VNĐ | **Tài sản ròng:** 15.330 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 7 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 500 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.230 Tr. VNĐ | **Tài sản ròng:** 14.830 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #134 | Vòng #29 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.761 Tr. VNĐ | **Tài sản ròng:** 11.561 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 23 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.461 Tr. VNĐ | **Tài sản ròng:** 11.261 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

### === VÒNG ĐẤU #30 ===

#### Lượt #135 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 876 Tr. VNĐ | **Tài sản ròng:** 19.776 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 876 Tr. VNĐ | **Tài sản ròng:** 19.776 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Hà Nội (Hoàn Kiếm), Bình Dương (Tổ Hợp Thể Thao & Golf), Đồng Nai (Đại Công Viên Chủ Đề), TP.HCM (TP. Thủ Đức), Tập Đoàn Viễn Thông (Viettel), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #136 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.536 Tr. VNĐ | **Tài sản ròng:** 22.886 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PEAK_TOURISM]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.536 Tr. VNĐ | **Tài sản ròng:** 22.886 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang) (C3), Cảng HKQT Nội Bài, Lâm Đồng (Đà Lạt) (C3), Bình Thuận (Mũi Né) (C3)

#### Lượt #137 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.530 Tr. VNĐ | **Tài sản ròng:** 15.130 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 15 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.030 Tr. VNĐ | **Tài sản ròng:** 14.630 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bà Rịa - Vũng Tàu, Thừa Thiên Huế, Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hà Nội (Cầu Giấy)

#### Lượt #138 | Vòng #30 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.461 Tr. VNĐ | **Tài sản ròng:** 11.261 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 32 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 371 Tr. VNĐ | **Tài sản ròng:** 10.171 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Nghệ An (TP. Vinh), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ), Cảng Nước Sâu Cái Mép

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.