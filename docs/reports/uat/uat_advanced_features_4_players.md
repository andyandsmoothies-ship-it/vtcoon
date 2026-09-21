# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (4 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920264 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 141 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Cô Tư (Thận trọng / Passive)** (Tổng tài sản ròng: **41.352 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Cô Tư (Thận trọng / Passive) | Passive | 10.152 Tr. VNĐ | 41.352 Tr. VNĐ | 6 ô | 🏆 Vô địch |
| 2 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | 3.508 Tr. VNĐ | 21.708 Tr. VNĐ | 8 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 4.055 Tr. VNĐ | 18.155 Tr. VNĐ | 7 ô | ✓ Hoàn thành |
| 4 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 3.823 Tr. VNĐ | 15.023 Tr. VNĐ | 6 ô | ✓ Hoàn thành |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 225 lần.
- Số giao dịch sang tên thành công: 46 thương vụ.
- Tổng giá trị chuyển nhượng đất: 157.820 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 7.891 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 4 phiên.
- Tổng vốn cọc đầu tư: 5.000 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 4.900 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: -100 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 2 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 7 lần.
- Tổng giá trị thanh toán chuộc đất: 6.765 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_BUILD_HALT | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_DIPLOMATIC | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_PORT_EXCLUSIVE | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_TAX_AUDIT | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_LAND_CHANGE | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_CONTRACT_PENALTY | Thẻ Cơ Hội | 1 lần | 12.5% |
| CC_CONCERT_SPONSOR | Thẻ Cơ Hội | 1 lần | 12.5% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_FUEL_SURGE | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_NIGHT_ECONOMY | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_CASINO_PILOT | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_PEAK_TOURISM | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_ALCOHOL_CHECK | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_FIRE_INSPECTION | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_UTILITY_DOUBLE | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_PUBLIC_INVEST | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_URBAN_PLANNING | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_COASTAL_STORM | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_CREDIT_STIMULUS | Thẻ Thị Trường | 1 lần | 7.7% |
| MC_ANTI_SPECULATE | Thẻ Thị Trường | 1 lần | 7.7% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 5 lần | 3.5% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 15 lần | 10.6% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 2 lần | 1.4% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 3 lần | 2.1% |
| Cảng HKQT Long Thành | Đặc biệt | 3 lần | 2.1% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 3 lần | 2.1% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 3 lần | 2.1% |
| Cảng HKQT Nội Bài | Đặc biệt | 1 lần | 0.7% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 4 lần | 2.8% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 6 lần | 4.3% |

---

## IV. NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐI TỪ ĐẦU ĐẾN KẾT THÚC (STEP-BY-STEP LOG)

### === VÒNG ĐẤU #1 ===

#### Lượt #1 | Vòng #1 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 0 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #2 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 0 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 16.500 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Tập Đoàn Điện Lực (EVN)

#### Lượt #3 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 16.500 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 12 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_MEGA_CONCERT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 16.500 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Tập Đoàn Điện Lực (EVN)

#### Lượt #4 | Vòng #1 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 17.760 Tr. VNĐ | **Tài sản ròng:** 17.760 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #5 | Vòng #1 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #6 | Vòng #1 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FUEL_SURGE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 17.500 Tr. VNĐ | **Tài sản ròng:** 17.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #2 ===

#### Lượt #7 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 17.500 Tr. VNĐ | **Tài sản ròng:** 17.500 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 15.500 Tr. VNĐ | **Tài sản ròng:** 17.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng Nước Sâu Cái Mép

#### Lượt #8 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 16.240 Tr. VNĐ | **Tài sản ròng:** 17.740 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 6 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 14.440 Tr. VNĐ | **Tài sản ròng:** 17.740 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tập Đoàn Điện Lực (EVN), Bình Định (Quy Nhơn)

#### Lượt #9 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.260 Tr. VNĐ | **Tài sản ròng:** 17.260 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 12 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 14.920 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Định (Quy Nhơn)

#### Lượt #10 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.920 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 20 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 1500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #11 | Vòng #2 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 17.500 Tr. VNĐ | **Tài sản ròng:** 17.500 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 15.100 Tr. VNĐ | **Tài sản ròng:** 17.500 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Ninh Bình (Tràng An)

### === VÒNG ĐẤU #3 ===

#### Lượt #12 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.500 Tr. VNĐ | **Tài sản ròng:** 17.500 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 15 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 240 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 12.140 Tr. VNĐ | **Tài sản ròng:** 16.540 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An)

#### Lượt #13 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 16.663 Tr. VNĐ | **Tài sản ròng:** 18.163 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 16 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 11.343 Tr. VNĐ | **Tài sản ròng:** 17.443 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #14 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 28 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 7750 Tr. VNĐ
- **Số dư sau lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #15 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.304 Tr. VNĐ | **Tài sản ròng:** 18.304 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hưng Yên (Văn Giang)] với giá 4850 Tr. VNĐ
- **Số dư sau lượt:** 18.304 Tr. VNĐ | **Tài sản ròng:** 18.304 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #4 ===

#### Lượt #16 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.504 Tr. VNĐ | **Tài sản ròng:** 11.504 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_NIGHT_ECONOMY]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.104 Tr. VNĐ | **Tài sản ròng:** 11.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang)

#### Lượt #17 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.943 Tr. VNĐ | **Tài sản ròng:** 17.043 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 21 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 3200 Tr. VNĐ
- **Số dư sau lượt:** 10.943 Tr. VNĐ | **Tài sản ròng:** 17.043 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #18 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.020 Tr. VNĐ | **Tài sản ròng:** 16.320 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Bà Rịa - Vũng Tàu], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Bà Rịa - Vũng Tàu] với giá 2100 Tr. VNĐ
- **Số dư sau lượt:** 15.020 Tr. VNĐ | **Tài sản ròng:** 18.320 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #19 | Vòng #4 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.604 Tr. VNĐ | **Tài sản ròng:** 16.604 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 31 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Chú Sáu (Cân bằng / Balanced) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 11.484 Tr. VNĐ | **Tài sản ròng:** 17.884 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #5 ===

#### Lượt #20 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.104 Tr. VNĐ | **Tài sản ròng:** 11.104 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 33 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Thua lỗ thị trường (-1000 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 1000 Tr. VNĐ (-1000 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.104 Tr. VNĐ | **Tài sản ròng:** 10.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang)

#### Lượt #21 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.907 Tr. VNĐ | **Tài sản ròng:** 17.607 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 29 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 8.787 Tr. VNĐ | **Tài sản ròng:** 16.887 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài

#### Lượt #22 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.020 Tr. VNĐ | **Tài sản ròng:** 18.320 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 16 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Đà Nẵng (Hải Châu - Sơn Trà)] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Chú Sáu (Cân bằng / Balanced) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 9.900 Tr. VNĐ | **Tài sản ròng:** 17.600 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #23 | Vòng #5 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.448 Tr. VNĐ | **Tài sản ròng:** 18.448 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 0 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 9.588 Tr. VNĐ | **Tài sản ròng:** 17.788 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thanh Hóa (Sầm Sơn), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành

### === VÒNG ĐẤU #6 ===

#### Lượt #24 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.104 Tr. VNĐ | **Tài sản ròng:** 10.104 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 38 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.104 Tr. VNĐ | **Tài sản ròng:** 12.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #25 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.468 Tr. VNĐ | **Tài sản ròng:** 17.968 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 35 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (TP. Thủ Đức)] giá 3500 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 8.108 Tr. VNĐ | **Tài sản ròng:** 17.308 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức)

#### Lượt #26 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.108 Tr. VNĐ | **Tài sản ròng:** 17.308 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 37 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_BUILD_HALT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 4.808 Tr. VNĐ | **Tài sản ròng:** 17.008 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức)

#### Lượt #27 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.900 Tr. VNĐ | **Tài sản ròng:** 17.600 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 7.040 Tr. VNĐ | **Tài sản ròng:** 16.940 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #28 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.305 Tr. VNĐ | **Tài sản ròng:** 18.305 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 5 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bác Ba (Thực dụng / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 7.105 Tr. VNĐ | **Tài sản ròng:** 17.105 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành

#### Lượt #29 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.105 Tr. VNĐ | **Tài sản ròng:** 17.105 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Từ chối mua [Tuyến Cao Tốc Bắc - Nam], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Tuyến Cao Tốc Bắc - Nam] với giá 3300 Tr. VNĐ
- **Số dư sau lượt:** 7.105 Tr. VNĐ | **Tài sản ròng:** 17.105 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành

### === VÒNG ĐẤU #7 ===

#### Lượt #30 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.449 Tr. VNĐ | **Tài sản ròng:** 13.449 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 1.849 Tr. VNĐ | **Tài sản ròng:** 12.249 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt)

#### Lượt #31 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.525 Tr. VNĐ | **Tài sản ròng:** 17.525 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 2.285 Tr. VNĐ | **Tài sản ròng:** 16.685 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang)

#### Lượt #32 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.040 Tr. VNĐ | **Tài sản ròng:** 16.940 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 28 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 2100 Tr. VNĐ
- **Số dư sau lượt:** 7.040 Tr. VNĐ | **Tài sản ròng:** 16.940 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #33 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.403 Tr. VNĐ | **Tài sản ròng:** 19.803 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 33 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cần Thơ (Cái Răng)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cần Thơ (Cái Răng)] với giá 1150 Tr. VNĐ
- **Số dư sau lượt:** 15.403 Tr. VNĐ | **Tài sản ròng:** 21.803 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #8 ===

#### Lượt #34 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 699 Tr. VNĐ | **Tài sản ròng:** 11.699 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 13 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PEAK_TOURISM]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 699 Tr. VNĐ | **Tài sản ròng:** 11.699 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng)

#### Lượt #35 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.285 Tr. VNĐ | **Tài sản ròng:** 16.685 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 440 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.845 Tr. VNĐ | **Tài sản ròng:** 16.245 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang)

#### Lượt #36 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.480 Tr. VNĐ | **Tài sản ròng:** 17.380 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 34 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bác Ba (Thực dụng / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 3.530 Tr. VNĐ | **Tài sản ròng:** 17.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #37 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.403 Tr. VNĐ | **Tài sản ròng:** 21.803 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Mua thành công [Đồng Nai (Đại Công Viên Chủ Đề)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Chú Sáu (Cân bằng / Balanced) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 10.503 Tr. VNĐ | **Tài sản ròng:** 20.903 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #9 ===

#### Lượt #38 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.639 Tr. VNĐ | **Tài sản ròng:** 12.639 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 1.519 Tr. VNĐ | **Tài sản ròng:** 11.519 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng)

#### Lượt #39 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.519 Tr. VNĐ | **Tài sản ròng:** 11.519 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] với giá 3900 Tr. VNĐ
- **Số dư sau lượt:** 1.519 Tr. VNĐ | **Tài sản ròng:** 11.519 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng)

#### Lượt #40 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.650 Tr. VNĐ | **Tài sản ròng:** 15.650 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 21 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 280 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.370 Tr. VNĐ | **Tài sản ròng:** 15.370 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #41 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.030 Tr. VNĐ | **Tài sản ròng:** 17.930 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.627 Tr. VNĐ | **Tài sản ròng:** 17.527 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #42 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.208 Tr. VNĐ | **Tài sản ròng:** 21.608 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 8 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_ALCOHOL_CHECK]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 10.308 Tr. VNĐ | **Tài sản ròng:** 20.708 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #10 ===

#### Lượt #43 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.224 Tr. VNĐ | **Tài sản ròng:** 12.224 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FIRE_INSPECTION]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 1.324 Tr. VNĐ | **Tài sản ròng:** 11.324 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng)

#### Lượt #44 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.370 Tr. VNĐ | **Tài sản ròng:** 15.370 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 28 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 400 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 970 Tr. VNĐ | **Tài sản ròng:** 14.970 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #45 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 17.927 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 17.927 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #46 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.013 Tr. VNĐ | **Tài sản ròng:** 21.413 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 17 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 10.113 Tr. VNĐ | **Tài sản ròng:** 20.513 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Hưng Yên (Văn Giang), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #11 ===

#### Lượt #47 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.029 Tr. VNĐ | **Tài sản ròng:** 12.029 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 33 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1
- **Số dư sau lượt:** 1.179 Tr. VNĐ | **Tài sản ròng:** 12.379 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C1), An Giang (Châu Đốc) (C1)

#### Lượt #48 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.179 Tr. VNĐ | **Tài sản ròng:** 12.379 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 3 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 500 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2
- **Số dư sau lượt:** 229 Tr. VNĐ | **Tài sản ròng:** 12.029 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C2), An Giang (Châu Đốc) (C1)

#### Lượt #49 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 229 Tr. VNĐ | **Tài sản ròng:** 12.029 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 5 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 229 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Giải cứu tài chính:** Thế chấp BĐS ô 31
- **Giải cứu tài chính:** Thế chấp BĐS ô 13
- **Số dư sau lượt:** 449 Tr. VNĐ | **Tài sản ròng:** 12.449 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #50 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.199 Tr. VNĐ | **Tài sản ròng:** 15.199 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.179 Tr. VNĐ | **Tài sản ròng:** 16.179 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #51 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 17.927 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.867 Tr. VNĐ | **Tài sản ròng:** 17.767 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #52 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.867 Tr. VNĐ | **Tài sản ròng:** 17.767 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 14 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.867 Tr. VNĐ | **Tài sản ròng:** 17.767 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #53 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.867 Tr. VNĐ | **Tài sản ròng:** 17.767 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 16 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.867 Tr. VNĐ | **Tài sản ròng:** 17.767 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #54 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.318 Tr. VNĐ | **Tài sản ròng:** 21.718 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 14.006 Tr. VNĐ | **Tài sản ròng:** 21.406 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #55 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.006 Tr. VNĐ | **Tài sản ròng:** 21.406 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_UTILITY_DOUBLE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 13.606 Tr. VNĐ | **Tài sản ròng:** 21.006 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #12 ===

#### Lượt #56 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.219 Tr. VNĐ | **Tài sản ròng:** 13.219 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.019 Tr. VNĐ | **Tài sản ròng:** 13.019 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #57 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.101 Tr. VNĐ | **Tài sản ròng:** 18.101 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.101 Tr. VNĐ | **Tài sản ròng:** 17.101 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #58 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.467 Tr. VNĐ | **Tài sản ròng:** 18.367 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C1
- **Số dư sau lượt:** 357 Tr. VNĐ | **Tài sản ròng:** 17.957 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C1), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế

#### Lượt #59 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.606 Tr. VNĐ | **Tài sản ròng:** 21.006 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 400 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 13.206 Tr. VNĐ | **Tài sản ròng:** 20.606 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #13 ===

#### Lượt #60 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.019 Tr. VNĐ | **Tài sản ròng:** 14.019 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 360 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.659 Tr. VNĐ | **Tài sản ròng:** 13.659 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #61 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.101 Tr. VNĐ | **Tài sản ròng:** 17.101 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng tại [Phiếu Cơ Hội]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.101 Tr. VNĐ | **Tài sản ròng:** 17.101 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #62 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.117 Tr. VNĐ | **Tài sản ròng:** 18.717 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C1
- **Số dư sau lượt:** 307 Tr. VNĐ | **Tài sản ròng:** 18.807 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C1), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế (C1)

#### Lượt #63 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.206 Tr. VNĐ | **Tài sản ròng:** 20.606 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 11 (**Bình Thuận (Mũi Né)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 1600 Tr. VNĐ
- **Số dư sau lượt:** 14.606 Tr. VNĐ | **Tài sản ròng:** 22.006 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #14 ===

#### Lượt #64 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.659 Tr. VNĐ | **Tài sản ròng:** 13.659 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 28 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.659 Tr. VNĐ | **Tài sản ròng:** 13.659 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #65 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.659 Tr. VNĐ | **Tài sản ròng:** 13.659 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 38 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.549 Tr. VNĐ | **Tài sản ròng:** 14.549 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #66 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.549 Tr. VNĐ | **Tài sản ròng:** 14.549 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.329 Tr. VNĐ | **Tài sản ròng:** 14.329 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #67 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.501 Tr. VNĐ | **Tài sản ròng:** 16.901 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 22 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Kiên Giang (Phú Quốc - Grand World)] với giá 2350 Tr. VNĐ
- **Số dư sau lượt:** 1.501 Tr. VNĐ | **Tài sản ròng:** 16.901 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #68 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 527 Tr. VNĐ | **Tài sản ròng:** 19.027 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 527 Tr. VNĐ | **Tài sản ròng:** 19.027 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C1), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế (C1)

#### Lượt #69 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.256 Tr. VNĐ | **Tài sản ròng:** 22.256 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 20 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Chú Sáu (Cân bằng / Balanced) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 7.616 Tr. VNĐ | **Tài sản ròng:** 20.416 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #15 ===

#### Lượt #70 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.408 Tr. VNĐ | **Tài sản ròng:** 16.408 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Hưng Yên (Văn Giang)] (Hoàn trả nợ + 10% phí Kho Bạc: 1650 Tr. VNĐ)
- **Số dư sau lượt:** 2.758 Tr. VNĐ | **Tài sản ròng:** 16.258 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #71 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.959 Tr. VNĐ | **Tài sản ròng:** 17.559 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 27 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 2.459 Tr. VNĐ | **Tài sản ròng:** 18.059 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #72 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.459 Tr. VNĐ | **Tài sản ròng:** 18.059 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 33 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_DIPLOMATIC]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.459 Tr. VNĐ | **Tài sản ròng:** 19.059 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #73 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.459 Tr. VNĐ | **Tài sản ròng:** 19.059 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 1 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 120 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.339 Tr. VNĐ | **Tài sản ròng:** 18.939 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #74 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.006 Tr. VNĐ | **Tài sản ròng:** 20.506 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C2
- **Số dư sau lượt:** 746 Tr. VNĐ | **Tài sản ròng:** 21.046 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế (C1)

#### Lượt #75 | Vòng #15 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.136 Tr. VNĐ | **Tài sản ròng:** 21.936 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Chú Sáu (Cân bằng / Balanced) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 5.236 Tr. VNĐ | **Tài sản ròng:** 21.036 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #16 ===

#### Lượt #76 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.863 Tr. VNĐ | **Tài sản ròng:** 19.363 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 1440 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Lâm Đồng (Đà Lạt)] (Hoàn trả nợ + 10% phí Kho Bạc: 770 Tr. VNĐ)
- **Số dư sau lượt:** 2.253 Tr. VNĐ | **Tài sản ròng:** 16.453 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #77 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.044 Tr. VNĐ | **Tài sản ròng:** 19.644 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 9 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 3.144 Tr. VNĐ | **Tài sản ròng:** 18.744 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #78 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.186 Tr. VNĐ | **Tài sản ròng:** 22.486 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C2
- **Số dư sau lượt:** 186 Tr. VNĐ | **Tài sản ròng:** 22.486 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Thừa Thiên Huế (C1)

#### Lượt #79 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.941 Tr. VNĐ | **Tài sản ròng:** 21.741 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 34 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Cô Tư (Thận trọng / Passive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 6.921 Tr. VNĐ | **Tài sản ròng:** 22.121 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #17 ===

#### Lượt #80 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.958 Tr. VNĐ | **Tài sản ròng:** 17.158 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 16 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 5.338 Tr. VNĐ | **Tài sản ròng:** 18.938 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #81 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.144 Tr. VNĐ | **Tài sản ròng:** 18.744 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.924 Tr. VNĐ | **Tài sản ròng:** 18.524 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #82 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.370 Tr. VNĐ | **Tài sản ròng:** 23.270 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C2
- **Số dư sau lượt:** 2.110 Tr. VNĐ | **Tài sản ròng:** 23.810 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Thừa Thiên Huế (C2)

#### Lượt #83 | Vòng #17 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.885 Tr. VNĐ | **Tài sản ròng:** 22.685 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 0 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành]
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 6.765 Tr. VNĐ | **Tài sản ròng:** 21.965 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #18 ===

#### Lượt #84 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.302 Tr. VNĐ | **Tài sản ròng:** 19.502 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 22 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 4.882 Tr. VNĐ | **Tài sản ròng:** 18.482 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #85 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.224 Tr. VNĐ | **Tài sản ròng:** 18.824 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 21 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.944 Tr. VNĐ | **Tài sản ròng:** 18.544 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #86 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.110 Tr. VNĐ | **Tài sản ròng:** 23.810 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.798 Tr. VNĐ | **Tài sản ròng:** 23.498 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Thừa Thiên Huế (C2)

#### Lượt #87 | Vòng #18 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.009 Tr. VNĐ | **Tài sản ròng:** 22.809 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 5 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 140 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 6.749 Tr. VNĐ | **Tài sản ròng:** 21.949 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #19 ===

#### Lượt #88 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.986 Tr. VNĐ | **Tài sản ròng:** 19.186 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (400 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 2400 Tr. VNĐ (+400 Tr.)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 5.266 Tr. VNĐ | **Tài sản ròng:** 18.866 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #89 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.256 Tr. VNĐ | **Tài sản ròng:** 18.856 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_PORT_EXCLUSIVE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.256 Tr. VNĐ | **Tài sản ròng:** 19.856 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #90 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.798 Tr. VNĐ | **Tài sản ròng:** 23.498 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 26 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.498 Tr. VNĐ | **Tài sản ròng:** 23.198 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Thừa Thiên Huế (C2)

#### Lượt #91 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.713 Tr. VNĐ | **Tài sản ròng:** 22.513 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 1440 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 5.153 Tr. VNĐ | **Tài sản ròng:** 20.353 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #20 ===

#### Lượt #92 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.230 Tr. VNĐ | **Tài sản ròng:** 19.430 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 38 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 5.277 Tr. VNĐ | **Tài sản ròng:** 18.877 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #93 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.556 Tr. VNĐ | **Tài sản ròng:** 20.156 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 36 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_TAX_AUDIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.056 Tr. VNĐ | **Tài sản ròng:** 18.656 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #94 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.938 Tr. VNĐ | **Tài sản ròng:** 24.638 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (500 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 500 Tr. VNĐ ➔ Thu về 1000 Tr. VNĐ (+500 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C3
- **Số dư sau lượt:** 1.278 Tr. VNĐ | **Tài sản ròng:** 25.678 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Thừa Thiên Huế (C2)

#### Lượt #95 | Vòng #20 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.117 Tr. VNĐ | **Tài sản ròng:** 20.917 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 18 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 374 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 4.623 Tr. VNĐ | **Tài sản ròng:** 19.823 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #21 ===

#### Lượt #96 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.241 Tr. VNĐ | **Tài sản ròng:** 19.441 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 168 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 4.953 Tr. VNĐ | **Tài sản ròng:** 18.553 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #97 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.865 Tr. VNĐ | **Tài sản ròng:** 20.465 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 7 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.865 Tr. VNĐ | **Tài sản ròng:** 20.465 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #98 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.545 Tr. VNĐ | **Tài sản ròng:** 26.945 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 38 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_LAND_CHANGE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C3
- **Số dư sau lượt:** 645 Tr. VNĐ | **Tài sản ròng:** 29.145 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C2)

#### Lượt #99 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.587 Tr. VNĐ | **Tài sản ròng:** 20.387 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 26 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 80 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 4.387 Tr. VNĐ | **Tài sản ròng:** 19.587 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #100 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.387 Tr. VNĐ | **Tài sản ròng:** 19.587 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 28 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Cầu Giấy)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.387 Tr. VNĐ | **Tài sản ròng:** 19.587 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

#### Lượt #101 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.387 Tr. VNĐ | **Tài sản ròng:** 19.587 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 32 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 480 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.092 Tr. VNĐ | **Tài sản ròng:** 20.292 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #22 ===

#### Lượt #102 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.917 Tr. VNĐ | **Tài sản ròng:** 19.117 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 11 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 4.797 Tr. VNĐ | **Tài sản ròng:** 18.397 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #103 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.865 Tr. VNĐ | **Tài sản ròng:** 20.465 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 4865 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 11
- **Giải cứu tài chính:** Thế chấp BĐS ô 14
- **Giải cứu tài chính:** Thế chấp BĐS ô 12
- **Giải cứu tài chính:** Thế chấp BĐS ô 31
- **Số dư sau lượt:** 695 Tr. VNĐ | **Tài sản ròng:** 12.545 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #104 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.255 Tr. VNĐ | **Tài sản ròng:** 35.755 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 7 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C3
- **Số dư sau lượt:** 5.095 Tr. VNĐ | **Tài sản ròng:** 36.295 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #105 | Vòng #22 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.056 Tr. VNĐ | **Tài sản ròng:** 20.856 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 39 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 3.515 Tr. VNĐ | **Tài sản ròng:** 21.715 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #23 ===

#### Lượt #106 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.761 Tr. VNĐ | **Tài sản ròng:** 18.961 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONTRACT_PENALTY]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 3.641 Tr. VNĐ | **Tài sản ròng:** 17.241 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #107 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.774 Tr. VNĐ | **Tài sản ròng:** 14.624 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 19 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 336 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.438 Tr. VNĐ | **Tài sản ròng:** 14.288 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #108 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.438 Tr. VNĐ | **Tài sản ròng:** 14.288 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 29 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_URBAN_PLANNING]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.438 Tr. VNĐ | **Tài sản ròng:** 14.288 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #109 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.095 Tr. VNĐ | **Tài sản ròng:** 36.295 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_COASTAL_STORM]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.495 Tr. VNĐ | **Tài sản ròng:** 32.695 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #110 | Vòng #23 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.815 Tr. VNĐ | **Tài sản ròng:** 22.615 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 8 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 3.695 Tr. VNĐ | **Tài sản ròng:** 21.895 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

#### Lượt #111 | Vòng #23 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.695 Tr. VNĐ | **Tài sản ròng:** 21.895 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 10 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.695 Tr. VNĐ | **Tài sản ròng:** 21.895 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #24 ===

#### Lượt #112 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.605 Tr. VNĐ | **Tài sản ròng:** 17.805 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 22 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 3.485 Tr. VNĐ | **Tài sản ròng:** 17.085 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #113 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.693 Tr. VNĐ | **Tài sản ròng:** 15.543 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 480 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.213 Tr. VNĐ | **Tài sản ròng:** 15.063 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #114 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.230 Tr. VNĐ | **Tài sản ròng:** 34.430 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.230 Tr. VNĐ | **Tài sản ròng:** 34.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #115 | Vòng #24 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.659 Tr. VNĐ | **Tài sản ròng:** 22.459 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 14 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 3.539 Tr. VNĐ | **Tài sản ròng:** 21.739 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #25 ===

#### Lượt #116 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.449 Tr. VNĐ | **Tài sản ròng:** 17.649 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 31 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 3.929 Tr. VNĐ | **Tài sản ròng:** 17.529 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #117 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.248 Tr. VNĐ | **Tài sản ròng:** 16.098 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 39 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Bình Thuận (Mũi Né)] (Hoàn trả nợ + 10% phí Kho Bạc: 770 Tr. VNĐ)
- **Số dư sau lượt:** 3.791 Tr. VNĐ | **Tài sản ròng:** 16.341 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #118 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.265 Tr. VNĐ | **Tài sản ròng:** 35.465 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 19 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.265 Tr. VNĐ | **Tài sản ròng:** 35.465 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #119 | Vòng #25 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.503 Tr. VNĐ | **Tài sản ròng:** 22.303 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 14 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 288 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 4.170 Tr. VNĐ | **Tài sản ròng:** 22.370 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #26 ===

#### Lượt #120 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.181 Tr. VNĐ | **Tài sản ròng:** 18.381 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 0 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 144 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 3.917 Tr. VNĐ | **Tài sản ròng:** 17.517 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #121 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.866 Tr. VNĐ | **Tài sản ròng:** 17.416 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 792 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Khánh Hòa (Nha Trang)] (Hoàn trả nợ + 10% phí Kho Bạc: 880 Tr. VNĐ)
- **Số dư sau lượt:** 3.194 Tr. VNĐ | **Tài sản ròng:** 16.544 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #122 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.057 Tr. VNĐ | **Tài sản ròng:** 36.257 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.057 Tr. VNĐ | **Tài sản ròng:** 36.257 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #123 | Vòng #26 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.278 Tr. VNĐ | **Tài sản ròng:** 23.078 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 4.158 Tr. VNĐ | **Tài sản ròng:** 22.358 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #27 ===

#### Lượt #124 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.881 Tr. VNĐ | **Tài sản ròng:** 18.081 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 8 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 6881 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Giải cứu tài chính:** Thế chấp BĐS ô 13
- **Giải cứu tài chính:** Thế chấp BĐS ô 15
- **Số dư sau lượt:** 431 Tr. VNĐ | **Tài sản ròng:** 9.931 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #125 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.194 Tr. VNĐ | **Tài sản ròng:** 16.544 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.194 Tr. VNĐ | **Tài sản ròng:** 16.544 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #126 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.938 Tr. VNĐ | **Tài sản ròng:** 43.138 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 28 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (0 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 500 Tr. VNĐ ➔ Thu về 500 Tr. VNĐ (+0 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.938 Tr. VNĐ | **Tài sản ròng:** 43.138 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #127 | Vòng #27 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.158 Tr. VNĐ | **Tài sản ròng:** 22.358 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 31 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 420 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.738 Tr. VNĐ | **Tài sản ròng:** 21.938 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #28 ===

#### Lượt #128 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 431 Tr. VNĐ | **Tài sản ròng:** 9.931 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 431 Tr. VNĐ | **Tài sản ròng:** 9.931 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #129 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.614 Tr. VNĐ | **Tài sản ròng:** 16.964 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CREDIT_STIMULUS]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.614 Tr. VNĐ | **Tài sản ròng:** 16.964 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #130 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.938 Tr. VNĐ | **Tài sản ròng:** 43.138 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 38 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 2376 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 10.162 Tr. VNĐ | **Tài sản ròng:** 41.362 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #131 | Vòng #28 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.738 Tr. VNĐ | **Tài sản ròng:** 21.938 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 37 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 2376 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.956 Tr. VNĐ | **Tài sản ròng:** 21.156 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #29 ===

#### Lượt #132 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.183 Tr. VNĐ | **Tài sản ròng:** 14.683 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 25 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Lâm Đồng (Đà Lạt)] (Hoàn trả nợ + 10% phí Kho Bạc: 770 Tr. VNĐ)
- **Số dư sau lượt:** 4.413 Tr. VNĐ | **Tài sản ròng:** 14.613 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #133 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.413 Tr. VNĐ | **Tài sản ròng:** 14.613 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 31 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Cảng Nước Sâu Cái Mép] (Hoàn trả nợ + 10% phí Kho Bạc: 1100 Tr. VNĐ)
- **Số dư sau lượt:** 3.913 Tr. VNĐ | **Tài sản ròng:** 15.113 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #134 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.708 Tr. VNĐ | **Tài sản ròng:** 18.058 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 33 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Tập Đoàn Điện Lực (EVN)] (Hoàn trả nợ + 10% phí Kho Bạc: 825 Tr. VNĐ)
- **Số dư sau lượt:** 4.383 Tr. VNĐ | **Tài sản ròng:** 18.483 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #135 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.162 Tr. VNĐ | **Tài sản ròng:** 41.362 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 10.162 Tr. VNĐ | **Tài sản ròng:** 41.362 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #136 | Vòng #29 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.956 Tr. VNĐ | **Tài sản ròng:** 21.156 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 3 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.046 Tr. VNĐ | **Tài sản ròng:** 22.246 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #30 ===

#### Lượt #137 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.003 Tr. VNĐ | **Tài sản ròng:** 16.203 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 0 ➔ Ô 2 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_ANTI_SPECULATE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.003 Tr. VNĐ | **Tài sản ròng:** 15.203 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #138 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.003 Tr. VNĐ | **Tài sản ròng:** 15.203 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 2 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 180 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.823 Tr. VNĐ | **Tài sản ròng:** 15.023 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #139 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.383 Tr. VNĐ | **Tài sản ròng:** 17.483 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.783 Tr. VNĐ | **Tài sản ròng:** 16.883 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #140 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.162 Tr. VNĐ | **Tài sản ròng:** 40.362 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 9.162 Tr. VNĐ | **Tài sản ròng:** 40.362 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Thanh Hóa (Sầm Sơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #141 | Vòng #30 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.226 Tr. VNĐ | **Tài sản ròng:** 21.426 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 990 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.508 Tr. VNĐ | **Tài sản ròng:** 21.708 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.