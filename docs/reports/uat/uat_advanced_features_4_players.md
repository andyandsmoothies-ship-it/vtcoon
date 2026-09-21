# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (4 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920264 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 127 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bé Bo (Cạnh tranh / Aggressive)** (Tổng tài sản ròng: **40.868 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | 5.068 Tr. VNĐ | 40.868 Tr. VNĐ | 5 ô | 🏆 Vô địch |
| 2 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 3.442 Tr. VNĐ | 25.342 Tr. VNĐ | 10 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 2.609 Tr. VNĐ | 23.409 Tr. VNĐ | 11 ô | ✓ Hoàn thành |
| 4 | Cô Tư (Thận trọng / Passive) | Passive | -2.562 Tr. VNĐ | -2.562 Tr. VNĐ | 0 ô | ❌ Phá sản |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 354 lần.
- Số giao dịch sang tên thành công: 43 thương vụ.
- Tổng giá trị chuyển nhượng đất: 57.200 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 2.860 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 1 phiên.
- Tổng vốn cọc đầu tư: 2.000 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 3.000 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: 1.000 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 0 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 1 lần.
- Tổng giá trị thanh toán chuộc đất: 770 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_BUILD_HALT | Thẻ Cơ Hội | 1 lần | 20.0% |
| CC_DIPLOMATIC | Thẻ Cơ Hội | 1 lần | 20.0% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 20.0% |
| CC_PORT_EXCLUSIVE | Thẻ Cơ Hội | 1 lần | 20.0% |
| CC_TAX_AUDIT | Thẻ Cơ Hội | 1 lần | 20.0% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_FUEL_SURGE | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_NIGHT_ECONOMY | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_CASINO_PILOT | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_LAND_FEVER | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_PEAK_TOURISM | Thẻ Thị Trường | 2 lần | 11.1% |
| MC_ALCOHOL_CHECK | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_FIRE_INSPECTION | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_UTILITY_DOUBLE | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_PUBLIC_INVEST | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_URBAN_PLANNING | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_COASTAL_STORM | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_CREDIT_STIMULUS | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_ANTI_SPECULATE | Thẻ Thị Trường | 2 lần | 11.1% |
| MC_RATE_HIKE | Thẻ Thị Trường | 1 lần | 5.6% |
| MC_FREEZE_TRADE | Thẻ Thị Trường | 1 lần | 5.6% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 1 lần | 0.8% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 6 lần | 4.7% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 1 lần | 0.8% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 3 lần | 2.4% |
| Cảng HKQT Long Thành | Đặc biệt | 1 lần | 0.8% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 2 lần | 1.6% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 4 lần | 3.1% |
| Cảng HKQT Nội Bài | Đặc biệt | 3 lần | 2.4% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 6 lần | 4.7% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 6 lần | 4.7% |

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
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 7950 Tr. VNĐ
- **Số dư sau lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #15 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.354 Tr. VNĐ | **Tài sản ròng:** 14.354 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_NIGHT_ECONOMY]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Chú Sáu (Cân bằng / Balanced) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 6.834 Tr. VNĐ | **Tài sản ròng:** 13.234 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #4 ===

#### Lượt #16 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.704 Tr. VNĐ | **Tài sản ròng:** 16.704 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 24 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 160 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 11.424 Tr. VNĐ | **Tài sản ròng:** 15.824 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An)

#### Lượt #17 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.907 Tr. VNĐ | **Tài sản ròng:** 17.607 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 21 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 280 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 10.507 Tr. VNĐ | **Tài sản ròng:** 16.607 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #18 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.460 Tr. VNĐ | **Tài sản ròng:** 16.760 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 11 (**Bình Thuận (Mũi Né)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Chú Sáu (Cân bằng / Balanced) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 10.940 Tr. VNĐ | **Tài sản ròng:** 18.040 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #19 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.940 Tr. VNĐ | **Tài sản ròng:** 18.040 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 11 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 8.080 Tr. VNĐ | **Tài sản ròng:** 17.380 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né)

#### Lượt #20 | Vòng #4 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.798 Tr. VNĐ | **Tài sản ròng:** 14.798 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 33 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (TP. Thủ Đức)] giá 3500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C1
- **Số dư sau lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 14.798 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C1), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #5 ===

#### Lượt #21 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.388 Tr. VNĐ | **Tài sản ròng:** 16.388 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 28 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 3650 Tr. VNĐ
- **Số dư sau lượt:** 14.388 Tr. VNĐ | **Tài sản ròng:** 16.388 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng Nước Sâu Cái Mép

#### Lượt #22 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.538 Tr. VNĐ | **Tài sản ròng:** 17.238 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 28 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_BUILD_HALT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.738 Tr. VNĐ | **Tài sản ròng:** 16.438 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tập Đoàn Điện Lực (EVN), Hà Nội (Hoàn Kiếm)

#### Lượt #23 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 8.080 Tr. VNĐ | **Tài sản ròng:** 17.380 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Hoàn Kiếm)] từ Chú Sáu (Cân bằng / Balanced) với giá 4160 Tr. VNĐ (Nộp thuế chuyển nhượng 208 Tr.)
- **Số dư sau lượt:** 3.920 Tr. VNĐ | **Tài sản ròng:** 16.420 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm)

#### Lượt #24 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.920 Tr. VNĐ | **Tài sản ròng:** 16.420 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 21 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 920 Tr. VNĐ | **Tài sản ròng:** 16.420 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang)

#### Lượt #25 | Vòng #5 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 14.798 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 37 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_LAND_FEVER]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C2
- **Số dư sau lượt:** 2.548 Tr. VNĐ | **Tài sản ròng:** 17.798 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #6 ===

#### Lượt #26 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.388 Tr. VNĐ | **Tài sản ròng:** 16.388 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 15.788 Tr. VNĐ | **Tài sản ròng:** 18.388 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng)

#### Lượt #27 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.690 Tr. VNĐ | **Tài sản ròng:** 17.190 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 36 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 14.910 Tr. VNĐ | **Tài sản ròng:** 19.010 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành

#### Lượt #28 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 920 Tr. VNĐ | **Tài sản ròng:** 16.420 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 31 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PEAK_TOURISM]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.920 Tr. VNĐ | **Tài sản ròng:** 17.420 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang)

#### Lượt #29 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.548 Tr. VNĐ | **Tài sản ròng:** 17.798 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Mua thành công [Bà Rịa - Vũng Tàu] giá 1200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.348 Tr. VNĐ | **Tài sản ròng:** 17.798 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C1), Bà Rịa - Vũng Tàu

### === VÒNG ĐẤU #7 ===

#### Lượt #30 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.529 Tr. VNĐ | **Tài sản ròng:** 18.529 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 1 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 14.349 Tr. VNĐ | **Tài sản ròng:** 18.349 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Lâm Đồng (Đà Lạt)

#### Lượt #31 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.349 Tr. VNĐ | **Tài sản ròng:** 18.349 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 13 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bà Rịa - Vũng Tàu] từ Bé Bo (Cạnh tranh / Aggressive) với giá 1560 Tr. VNĐ (Nộp thuế chuyển nhượng 78 Tr.)
- **Số dư sau lượt:** 12.569 Tr. VNĐ | **Tài sản ròng:** 17.769 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt)

#### Lượt #32 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.569 Tr. VNĐ | **Tài sản ròng:** 17.769 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 21 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 280 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 12.289 Tr. VNĐ | **Tài sản ròng:** 17.489 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt)

#### Lượt #33 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.651 Tr. VNĐ | **Tài sản ròng:** 19.151 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 5 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 14.691 Tr. VNĐ | **Tài sản ròng:** 18.791 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành

#### Lượt #34 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.600 Tr. VNĐ | **Tài sản ròng:** 18.100 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.480 Tr. VNĐ | **Tài sản ròng:** 17.980 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang)

#### Lượt #35 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.830 Tr. VNĐ | **Tài sản ròng:** 18.080 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 9 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_ALCOHOL_CHECK]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C2
- **Số dư sau lượt:** 205 Tr. VNĐ | **Tài sản ròng:** 18.955 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C2)

### === VÒNG ĐẤU #8 ===

#### Lượt #36 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.150 Tr. VNĐ | **Tài sản ròng:** 17.750 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 28 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Cầu Giấy)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 9.370 Tr. VNĐ | **Tài sản ròng:** 17.570 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy)

#### Lượt #37 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.432 Tr. VNĐ | **Tài sản ròng:** 18.932 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 16 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng tại [Phiếu Cơ Hội]
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 14.652 Tr. VNĐ | **Tài sản ròng:** 18.752 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành

#### Lượt #38 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.480 Tr. VNĐ | **Tài sản ròng:** 17.980 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 9 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 120 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.360 Tr. VNĐ | **Tài sản ròng:** 17.860 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang)

#### Lượt #39 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 205 Tr. VNĐ | **Tài sản ròng:** 18.955 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 205 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Hạ cấp công trình ô 37
- **Số dư sau lượt:** 1.277 Tr. VNĐ | **Tài sản ròng:** 16.527 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #9 ===

#### Lượt #40 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.111 Tr. VNĐ | **Tài sản ròng:** 17.711 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 32 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FIRE_INSPECTION]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 10.731 Tr. VNĐ | **Tài sản ròng:** 18.931 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy)

#### Lượt #41 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.731 Tr. VNĐ | **Tài sản ròng:** 18.931 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 2 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 400 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 10.331 Tr. VNĐ | **Tài sản ròng:** 18.531 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy)

#### Lượt #42 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.913 Tr. VNĐ | **Tài sản ròng:** 19.413 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 22 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 1450 Tr. VNĐ
- **Số dư sau lượt:** 15.913 Tr. VNĐ | **Tài sản ròng:** 19.413 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Long Thành

#### Lượt #43 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.565 Tr. VNĐ | **Tài sản ròng:** 18.065 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Từ chối mua [Đà Nẵng (Hải Châu - Sơn Trà)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Đà Nẵng (Hải Châu - Sơn Trà)] với giá 2550 Tr. VNĐ
- **Số dư sau lượt:** 2.565 Tr. VNĐ | **Tài sản ròng:** 18.065 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang)

#### Lượt #44 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 677 Tr. VNĐ | **Tài sản ròng:** 15.927 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_UTILITY_DOUBLE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 277 Tr. VNĐ | **Tài sản ròng:** 15.527 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #10 ===

#### Lượt #45 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.931 Tr. VNĐ | **Tài sản ròng:** 18.931 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 5.931 Tr. VNĐ | **Tài sản ròng:** 18.931 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #46 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 16.313 Tr. VNĐ | **Tài sản ròng:** 19.813 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 29 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 13.533 Tr. VNĐ | **Tài sản ròng:** 19.633 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Cảng HKQT Nội Bài

#### Lượt #47 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.965 Tr. VNĐ | **Tài sản ròng:** 18.465 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Mua thành công [Tuyến Cao Tốc Bắc - Nam] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 965 Tr. VNĐ | **Tài sản ròng:** 18.465 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #48 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 277 Tr. VNĐ | **Tài sản ròng:** 15.527 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 33 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.277 Tr. VNĐ | **Tài sản ròng:** 17.527 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #11 ===

#### Lượt #49 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.672 Tr. VNĐ | **Tài sản ròng:** 19.072 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 19 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 5.892 Tr. VNĐ | **Tài sản ròng:** 18.892 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #50 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.274 Tr. VNĐ | **Tài sản ròng:** 19.774 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 35 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 14.494 Tr. VNĐ | **Tài sản ròng:** 21.594 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #51 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 965 Tr. VNĐ | **Tài sản ròng:** 18.465 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 25 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 965 Tr. VNĐ | **Tài sản ròng:** 18.465 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #52 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.277 Tr. VNĐ | **Tài sản ròng:** 17.527 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 0 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.157 Tr. VNĐ | **Tài sản ròng:** 17.407 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #12 ===

#### Lượt #53 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.753 Tr. VNĐ | **Tài sản ròng:** 19.153 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 29 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (1000 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 3000 Tr. VNĐ (+1000 Tr.)
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 6.973 Tr. VNĐ | **Tài sản ròng:** 19.973 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #54 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.235 Tr. VNĐ | **Tài sản ròng:** 21.735 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 14.455 Tr. VNĐ | **Tài sản ròng:** 21.555 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #55 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 965 Tr. VNĐ | **Tài sản ròng:** 18.465 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 965 Tr. VNĐ | **Tài sản ròng:** 18.465 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #56 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.157 Tr. VNĐ | **Tài sản ròng:** 17.407 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 9 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 180 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.977 Tr. VNĐ | **Tài sản ròng:** 17.227 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #13 ===

#### Lượt #57 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.714 Tr. VNĐ | **Tài sản ròng:** 20.114 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 38 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 7.914 Tr. VNĐ | **Tài sản ròng:** 20.914 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #58 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.316 Tr. VNĐ | **Tài sản ròng:** 21.816 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 12.736 Tr. VNĐ | **Tài sản ròng:** 21.636 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế

#### Lượt #59 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.145 Tr. VNĐ | **Tài sản ròng:** 18.645 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.145 Tr. VNĐ | **Tài sản ròng:** 18.645 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #60 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.977 Tr. VNĐ | **Tài sản ròng:** 17.227 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 16 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.757 Tr. VNĐ | **Tài sản ròng:** 17.007 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #14 ===

#### Lượt #61 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.655 Tr. VNĐ | **Tài sản ròng:** 21.055 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 6 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 140 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 7.735 Tr. VNĐ | **Tài sản ròng:** 20.735 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #62 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.477 Tr. VNĐ | **Tài sản ròng:** 21.777 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 18 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 10.097 Tr. VNĐ | **Tài sản ròng:** 21.597 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #63 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.505 Tr. VNĐ | **Tài sản ròng:** 19.005 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.325 Tr. VNĐ | **Tài sản ròng:** 18.825 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #64 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.757 Tr. VNĐ | **Tài sản ròng:** 17.007 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 21 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.457 Tr. VNĐ | **Tài sản ròng:** 16.707 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #15 ===

#### Lượt #65 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.776 Tr. VNĐ | **Tài sản ròng:** 21.176 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 11 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 6.396 Tr. VNĐ | **Tài sản ròng:** 20.996 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang)

#### Lượt #66 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.018 Tr. VNĐ | **Tài sản ròng:** 21.918 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 27 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng tại [Cảng HKQT Nội Bài]
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 10.238 Tr. VNĐ | **Tài sản ròng:** 21.738 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #67 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.325 Tr. VNĐ | **Tài sản ròng:** 18.825 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.325 Tr. VNĐ | **Tài sản ròng:** 18.825 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #68 | Vòng #15 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.457 Tr. VNĐ | **Tài sản ròng:** 16.707 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.457 Tr. VNĐ | **Tài sản ròng:** 16.707 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #16 ===

#### Lượt #69 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.137 Tr. VNĐ | **Tài sản ròng:** 21.137 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 6.137 Tr. VNĐ | **Tài sản ròng:** 20.737 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang)

#### Lượt #70 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.979 Tr. VNĐ | **Tài sản ròng:** 21.879 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 35 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 13.699 Tr. VNĐ | **Tài sản ròng:** 25.199 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #71 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.945 Tr. VNĐ | **Tài sản ròng:** 20.445 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 25 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.945 Tr. VNĐ | **Tài sản ròng:** 20.445 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #72 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.857 Tr. VNĐ | **Tài sản ròng:** 17.107 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 37 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C2
- **Số dư sau lượt:** 1.112 Tr. VNĐ | **Tài sản ròng:** 19.862 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C2)

#### Lượt #73 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.112 Tr. VNĐ | **Tài sản ròng:** 19.862 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 9 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_URBAN_PLANNING]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.112 Tr. VNĐ | **Tài sản ròng:** 19.862 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C2)

### === VÒNG ĐẤU #17 ===

#### Lượt #74 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.398 Tr. VNĐ | **Tài sản ròng:** 22.398 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 5.018 Tr. VNĐ | **Tài sản ròng:** 22.218 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #75 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.440 Tr. VNĐ | **Tài sản ròng:** 25.340 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 2 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_DIPLOMATIC]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 13.660 Tr. VNĐ | **Tài sản ròng:** 25.160 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World)

#### Lượt #76 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.945 Tr. VNĐ | **Tài sản ròng:** 20.445 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 31 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 2945 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 11
- **Số dư sau lượt:** 45 Tr. VNĐ | **Tài sản ròng:** 16.845 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #77 | Vòng #17 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.057 Tr. VNĐ | **Tài sản ròng:** 22.807 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 17 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1000 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.057 Tr. VNĐ | **Tài sản ròng:** 21.807 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C2)

### === VÒNG ĐẤU #18 ===

#### Lượt #78 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.759 Tr. VNĐ | **Tài sản ròng:** 22.359 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 1000 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.759 Tr. VNĐ | **Tài sản ròng:** 21.359 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #79 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.660 Tr. VNĐ | **Tài sản ròng:** 26.160 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 13 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bà Rịa - Vũng Tàu] từ Bác Ba (Thực dụng / Aggressive) với giá 1560 Tr. VNĐ (Nộp thuế chuyển nhượng 78 Tr.)
- **Số dư sau lượt:** 10.900 Tr. VNĐ | **Tài sản ròng:** 25.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh)

#### Lượt #80 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.045 Tr. VNĐ | **Tài sản ròng:** 17.845 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Bình Thuận (Mũi Né)] (Hoàn trả nợ + 10% phí Kho Bạc: 770 Tr. VNĐ)
- **Số dư sau lượt:** 3.740 Tr. VNĐ | **Tài sản ròng:** 21.240 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #81 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.740 Tr. VNĐ | **Tài sản ròng:** 21.240 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 7 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.740 Tr. VNĐ | **Tài sản ròng:** 21.240 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #82 | Vòng #18 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.057 Tr. VNĐ | **Tài sản ròng:** 21.807 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 25 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 120 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.937 Tr. VNĐ | **Tài sản ròng:** 21.687 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C2)

### === VÒNG ĐẤU #19 ===

#### Lượt #83 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.241 Tr. VNĐ | **Tài sản ròng:** 21.641 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 35 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 5.737 Tr. VNĐ | **Tài sản ròng:** 21.737 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #84 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.641 Tr. VNĐ | **Tài sản ròng:** 25.941 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 23 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_COASTAL_STORM]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 10.861 Tr. VNĐ | **Tài sản ròng:** 25.761 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh)

#### Lượt #85 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.860 Tr. VNĐ | **Tài sản ròng:** 21.360 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 21.048 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #86 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.937 Tr. VNĐ | **Tài sản ròng:** 21.687 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 28 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.937 Tr. VNĐ | **Tài sản ròng:** 21.687 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C2)

### === VÒNG ĐẤU #20 ===

#### Lượt #87 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.790 Tr. VNĐ | **Tài sản ròng:** 22.190 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 6.010 Tr. VNĐ | **Tài sản ròng:** 22.010 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #88 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.602 Tr. VNĐ | **Tài sản ròng:** 25.902 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 33 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 3780 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 7.042 Tr. VNĐ | **Tài sản ròng:** 21.942 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh)

#### Lượt #89 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 21.048 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CREDIT_STIMULUS]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.548 Tr. VNĐ | **Tài sản ròng:** 21.048 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Bình Thuận (Mũi Né), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #90 | Vòng #20 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.717 Tr. VNĐ | **Tài sản ròng:** 25.467 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 37 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C3
- **Số dư sau lượt:** 2.117 Tr. VNĐ | **Tài sản ròng:** 32.717 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc)

### === VÒNG ĐẤU #21 ===

#### Lượt #91 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.751 Tr. VNĐ | **Tài sản ròng:** 22.151 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 5.971 Tr. VNĐ | **Tài sản ròng:** 21.971 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #92 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.783 Tr. VNĐ | **Tài sản ròng:** 22.083 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 37 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_ANTI_SPECULATE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 6.503 Tr. VNĐ | **Tài sản ròng:** 21.403 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh)

#### Lượt #93 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.548 Tr. VNĐ | **Tài sản ròng:** 20.048 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 33 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 2548 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Giải cứu tài chính:** Thế chấp BĐS ô 11
- **Giải cứu tài chính:** Thế chấp BĐS ô 16
- **Giải cứu tài chính:** Thế chấp BĐS ô 21
- **Giải cứu tài chính:** Thế chấp BĐS ô 24
- **Giải cứu tài chính:** Thế chấp BĐS ô 28
- **Giải cứu tài chính:** Thế chấp BĐS ô 31
- **Giải cứu tài chính:** Thế chấp BĐS ô 34
- **Giải cứu tài chính:** Thế chấp BĐS ô 25
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** -2.562 Tr. VNĐ | **Tài sản ròng:** -2.562 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #94 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.665 Tr. VNĐ | **Tài sản ròng:** 35.265 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 3 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Mua thành công [Đồng Nai (Đại Công Viên Chủ Đề)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.740 Tr. VNĐ | **Tài sản ròng:** 36.340 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #22 ===

#### Lượt #95 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.670 Tr. VNĐ | **Tài sản ròng:** 22.070 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 11 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_RATE_HIKE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 5.890 Tr. VNĐ | **Tài sản ròng:** 21.890 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #96 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.244 Tr. VNĐ | **Tài sản ròng:** 21.544 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 2 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 6.464 Tr. VNĐ | **Tài sản ròng:** 21.364 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh)

#### Lượt #97 | Vòng #22 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.740 Tr. VNĐ | **Tài sản ròng:** 36.340 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 8 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 172 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.568 Tr. VNĐ | **Tài sản ròng:** 36.168 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), An Giang (Châu Đốc), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #23 ===

#### Lượt #98 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.631 Tr. VNĐ | **Tài sản ròng:** 22.031 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 17 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 5.851 Tr. VNĐ | **Tài sản ròng:** 21.851 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Cần Thơ (Cái Răng), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #99 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.377 Tr. VNĐ | **Tài sản ròng:** 21.677 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 168 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Bác Ba (Thực dụng / Aggressive) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 6.429 Tr. VNĐ | **Tài sản ròng:** 21.329 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Cần Thơ (Cái Răng), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh)

#### Lượt #100 | Vòng #23 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.568 Tr. VNĐ | **Tài sản ròng:** 36.168 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C3 (Resort/Khách sạn)
- **Nâng cấp BĐS:** Nâng cấp [An Giang (Châu Đốc)] lên C3 (Resort/Khách sạn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hưng Yên (Văn Giang)] với giá 2450 Tr. VNĐ
- **Số dư sau lượt:** 758 Tr. VNĐ | **Tài sản ròng:** 36.558 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #24 ===

#### Lượt #101 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.310 Tr. VNĐ | **Tài sản ròng:** 22.710 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 374 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.936 Tr. VNĐ | **Tài sản ròng:** 22.336 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang)

#### Lượt #102 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.458 Tr. VNĐ | **Tài sản ròng:** 22.158 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 13 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 240 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Lâm Đồng (Đà Lạt)] từ Bác Ba (Thực dụng / Aggressive) với giá 1820 Tr. VNĐ (Nộp thuế chuyển nhượng 91 Tr.)
- **Số dư sau lượt:** 3.398 Tr. VNĐ | **Tài sản ròng:** 21.498 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh), Ninh Bình (Tràng An)

#### Lượt #103 | Vòng #24 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 758 Tr. VNĐ | **Tài sản ròng:** 36.558 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 31 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FREEZE_TRADE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 758 Tr. VNĐ | **Tài sản ròng:** 36.558 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #104 | Vòng #24 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 758 Tr. VNĐ | **Tài sản ròng:** 36.558 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 33 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.508 Tr. VNĐ | **Tài sản ròng:** 37.308 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #25 ===

#### Lượt #105 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.905 Tr. VNĐ | **Tài sản ròng:** 22.905 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 1650 Tr. VNĐ
- **Số dư sau lượt:** 5.905 Tr. VNĐ | **Tài sản ròng:** 22.905 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang)

#### Lượt #106 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.748 Tr. VNĐ | **Tài sản ròng:** 23.048 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Từ chối mua [Tuyến Cao Tốc Bắc - Nam], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Tuyến Cao Tốc Bắc - Nam] với giá 1050 Tr. VNĐ
- **Số dư sau lượt:** 1.748 Tr. VNĐ | **Tài sản ròng:** 23.048 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh), Ninh Bình (Tràng An), Hà Nội (Hoàn Kiếm)

#### Lượt #107 | Vòng #25 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.508 Tr. VNĐ | **Tài sản ròng:** 37.308 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_PORT_EXCLUSIVE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.508 Tr. VNĐ | **Tài sản ròng:** 38.308 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #26 ===

#### Lượt #108 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.855 Tr. VNĐ | **Tài sản ròng:** 23.855 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 2376 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.979 Tr. VNĐ | **Tài sản ròng:** 21.979 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam

#### Lượt #109 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.748 Tr. VNĐ | **Tài sản ròng:** 23.048 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.748 Tr. VNĐ | **Tài sản ròng:** 23.048 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh), Ninh Bình (Tràng An), Hà Nội (Hoàn Kiếm)

#### Lượt #110 | Vòng #26 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.884 Tr. VNĐ | **Tài sản ròng:** 40.684 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 7 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.384 Tr. VNĐ | **Tài sản ròng:** 40.184 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #27 ===

#### Lượt #111 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.479 Tr. VNĐ | **Tài sản ròng:** 22.479 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 1 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.079 Tr. VNĐ | **Tài sản ròng:** 22.479 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng Nước Sâu Cái Mép, Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam, Bình Thuận (Mũi Né)

#### Lượt #112 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.079 Tr. VNĐ | **Tài sản ròng:** 22.479 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 11 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.079 Tr. VNĐ | **Tài sản ròng:** 22.479 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng Nước Sâu Cái Mép, Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam, Bình Thuận (Mũi Né)

#### Lượt #113 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.748 Tr. VNĐ | **Tài sản ròng:** 23.048 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 2248 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Số dư sau lượt:** 372 Tr. VNĐ | **Tài sản ròng:** 21.172 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh), Ninh Bình (Tràng An), Hà Nội (Hoàn Kiếm)

#### Lượt #114 | Vòng #27 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.632 Tr. VNĐ | **Tài sản ròng:** 42.432 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 374 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 6.258 Tr. VNĐ | **Tài sản ròng:** 42.058 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #115 | Vòng #27 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.258 Tr. VNĐ | **Tài sản ròng:** 42.058 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 27 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 6.258 Tr. VNĐ | **Tài sản ròng:** 42.058 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #116 | Vòng #27 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.258 Tr. VNĐ | **Tài sản ròng:** 42.058 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 39 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_TAX_AUDIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 6.508 Tr. VNĐ | **Tài sản ròng:** 42.308 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #28 ===

#### Lượt #117 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.270 Tr. VNĐ | **Tài sản ròng:** 23.670 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 288 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.982 Tr. VNĐ | **Tài sản ròng:** 23.382 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng Nước Sâu Cái Mép, Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam, Bình Thuận (Mũi Né)

#### Lượt #118 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.982 Tr. VNĐ | **Tài sản ròng:** 23.382 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 24 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.982 Tr. VNĐ | **Tài sản ròng:** 23.382 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng Nước Sâu Cái Mép, Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam, Bình Thuận (Mũi Né)

#### Lượt #119 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.225 Tr. VNĐ | **Tài sản ròng:** 23.025 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 1 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 168 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.057 Tr. VNĐ | **Tài sản ròng:** 22.857 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh), Ninh Bình (Tràng An), Hà Nội (Hoàn Kiếm)

#### Lượt #120 | Vòng #28 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.508 Tr. VNĐ | **Tài sản ròng:** 42.308 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 7 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 6.308 Tr. VNĐ | **Tài sản ròng:** 42.108 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #29 ===

#### Lượt #121 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.150 Tr. VNĐ | **Tài sản ròng:** 23.550 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 29 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Dừng tại [Phiếu Thị Trường]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.150 Tr. VNĐ | **Tài sản ròng:** 23.550 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng Nước Sâu Cái Mép, Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam, Bình Thuận (Mũi Né)

#### Lượt #122 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.257 Tr. VNĐ | **Tài sản ròng:** 23.057 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 11 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PEAK_TOURISM]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.257 Tr. VNĐ | **Tài sản ròng:** 23.057 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh), Ninh Bình (Tràng An), Hà Nội (Hoàn Kiếm)

#### Lượt #123 | Vòng #29 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.308 Tr. VNĐ | **Tài sản ròng:** 42.108 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 240 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 6.068 Tr. VNĐ | **Tài sản ròng:** 41.868 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #30 ===

#### Lượt #124 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.390 Tr. VNĐ | **Tài sản ròng:** 23.790 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 33 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_ANTI_SPECULATE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.890 Tr. VNĐ | **Tài sản ròng:** 23.290 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng Nước Sâu Cái Mép, Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Đà Nẵng (Hải Châu - Sơn Trà), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hưng Yên (Văn Giang), Tuyến Cao Tốc Bắc - Nam, Bình Thuận (Mũi Né)

#### Lượt #125 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.257 Tr. VNĐ | **Tài sản ròng:** 22.057 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.257 Tr. VNĐ | **Tài sản ròng:** 22.057 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh), Ninh Bình (Tràng An), Hà Nội (Hoàn Kiếm)

#### Lượt #126 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.257 Tr. VNĐ | **Tài sản ròng:** 22.057 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 27 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.257 Tr. VNĐ | **Tài sản ròng:** 22.057 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Long Thành, Bà Rịa - Vũng Tàu, Lâm Đồng (Đà Lạt), Cảng HKQT Nội Bài, Bình Dương (Tổ Hợp Thể Thao & Golf), Thừa Thiên Huế, Kiên Giang (Phú Quốc - Grand World), Nghệ An (TP. Vinh), Ninh Bình (Tràng An), Hà Nội (Hoàn Kiếm)

#### Lượt #127 | Vòng #30 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.068 Tr. VNĐ | **Tài sản ròng:** 40.868 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Viễn Thông (Viettel)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Tập Đoàn Viễn Thông (Viettel)] với giá 800 Tr. VNĐ
- **Số dư sau lượt:** 5.068 Tr. VNĐ | **Tài sản ròng:** 40.868 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3), Đồng Nai (Đại Công Viên Chủ Đề)

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.