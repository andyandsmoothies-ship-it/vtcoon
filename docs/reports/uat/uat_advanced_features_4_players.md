# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (4 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920264 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 125 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bé Bo (Cạnh tranh / Aggressive)** (Tổng tài sản ròng: **49.523 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | 223 Tr. VNĐ | 49.523 Tr. VNĐ | 8 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 487 Tr. VNĐ | 25.287 Tr. VNĐ | 10 ô | ✓ Hoàn thành |
| 3 | Cô Tư (Thận trọng / Passive) | Passive | 88 Tr. VNĐ | 5.038 Tr. VNĐ | 6 ô | ✓ Hoàn thành |
| 4 | Bác Ba (Thực dụng / Aggressive) | Aggressive | -5.288 Tr. VNĐ | -5.288 Tr. VNĐ | 0 ô | ❌ Phá sản |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 46 lần.
- Số giao dịch sang tên thành công: 44 thương vụ.
- Tổng giá trị chuyển nhượng đất: 104.780 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 5.239 Tr. VNĐ.

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
- Tổng giá trị thanh toán chuộc đất: 880 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_BUILD_HALT | Thẻ Cơ Hội | 1 lần | 25.0% |
| CC_DIPLOMATIC | Thẻ Cơ Hội | 1 lần | 25.0% |
| CC_PORT_EXCLUSIVE | Thẻ Cơ Hội | 1 lần | 25.0% |
| CC_TAX_AUDIT | Thẻ Cơ Hội | 1 lần | 25.0% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_FUEL_SURGE | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_NIGHT_ECONOMY | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_CASINO_PILOT | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_LAND_FEVER | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_PEAK_TOURISM | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_ALCOHOL_CHECK | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_FIRE_INSPECTION | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_UTILITY_DOUBLE | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_PUBLIC_INVEST | Thẻ Thị Trường | 1 lần | 10.0% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 1 lần | 0.8% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 9 lần | 7.2% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 2 lần | 1.6% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 8 lần | 6.4% |
| Cảng HKQT Long Thành | Đặc biệt | 1 lần | 0.8% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 2 lần | 1.6% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 3 lần | 2.4% |
| Cảng HKQT Nội Bài | Đặc biệt | 2 lần | 1.6% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 5 lần | 4.0% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 5 lần | 4.0% |

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
- **Số dư sau lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #2 ===

#### Lượt #7 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 16.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng Nước Sâu Cái Mép

#### Lượt #8 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 16.740 Tr. VNĐ | **Tài sản ròng:** 18.240 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 6 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 14.940 Tr. VNĐ | **Tài sản ròng:** 18.240 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Tập Đoàn Điện Lực (EVN), Bình Định (Quy Nhơn)

#### Lượt #9 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.760 Tr. VNĐ | **Tài sản ròng:** 17.760 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 12 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 15.420 Tr. VNĐ | **Tài sản ròng:** 17.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Định (Quy Nhơn)

#### Lượt #10 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.420 Tr. VNĐ | **Tài sản ròng:** 17.220 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 20 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 1500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 13.920 Tr. VNĐ | **Tài sản ròng:** 17.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #11 | Vòng #2 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 13.260 Tr. VNĐ | **Tài sản ròng:** 17.460 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Ninh Bình (Tràng An)

### === VÒNG ĐẤU #3 ===

#### Lượt #12 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.000 Tr. VNĐ | **Tài sản ròng:** 18.000 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 15 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 240 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 17.220 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn)

#### Lượt #13 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 17.163 Tr. VNĐ | **Tài sản ròng:** 18.663 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 16 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 12.623 Tr. VNĐ | **Tài sản ròng:** 18.123 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn)

#### Lượt #14 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.143 Tr. VNĐ | **Tài sản ròng:** 17.643 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 28 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 7950 Tr. VNĐ
- **Số dư sau lượt:** 16.143 Tr. VNĐ | **Tài sản ròng:** 17.643 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Tập Đoàn Viễn Thông (Viettel)

#### Lượt #15 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.773 Tr. VNĐ | **Tài sản ròng:** 14.173 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_NIGHT_ECONOMY]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 5.433 Tr. VNĐ | **Tài sản ròng:** 13.633 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn), Ninh Bình (Tràng An), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #4 ===

#### Lượt #16 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.643 Tr. VNĐ | **Tài sản ròng:** 17.643 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 24 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 160 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 13.143 Tr. VNĐ | **Tài sản ròng:** 16.943 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn)

#### Lượt #17 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.846 Tr. VNĐ | **Tài sản ròng:** 18.546 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 21 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 280 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 12.226 Tr. VNĐ | **Tài sản ròng:** 17.726 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn)

#### Lượt #18 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.583 Tr. VNĐ | **Tài sản ròng:** 18.083 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 11 (**Bình Thuận (Mũi Né)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 14.843 Tr. VNĐ | **Tài sản ròng:** 19.543 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Bình Thuận (Mũi Né)

#### Lượt #19 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.843 Tr. VNĐ | **Tài sản ròng:** 19.543 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 11 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 11.723 Tr. VNĐ | **Tài sản ròng:** 18.823 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #20 | Vòng #4 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.620 Tr. VNĐ | **Tài sản ròng:** 14.620 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 33 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (TP. Thủ Đức)] giá 3500 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C1
- **Số dư sau lượt:** 1.030 Tr. VNĐ | **Tài sản ròng:** 14.080 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ) (C1), TP.HCM (TP. Thủ Đức) (C1)

### === VÒNG ĐẤU #5 ===

#### Lượt #21 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.366 Tr. VNĐ | **Tài sản ròng:** 17.366 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 28 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 2450 Tr. VNĐ
- **Số dư sau lượt:** 15.366 Tr. VNĐ | **Tài sản ròng:** 17.366 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Cảng Nước Sâu Cái Mép

#### Lượt #22 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.999 Tr. VNĐ | **Tài sản ròng:** 18.899 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 28 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_LAND_FEVER]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 9.659 Tr. VNĐ | **Tài sản ròng:** 18.359 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm)

#### Lượt #23 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.946 Tr. VNĐ | **Tài sản ròng:** 19.246 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 17 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_BUILD_HALT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 11.606 Tr. VNĐ | **Tài sản ròng:** 18.706 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #24 | Vòng #5 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.253 Tr. VNĐ | **Tài sản ròng:** 14.503 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 37 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C2
- **Số dư sau lượt:** 288 Tr. VNĐ | **Tài sản ròng:** 16.838 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ) (C1), TP.HCM (TP. Thủ Đức) (C2)

### === VÒNG ĐẤU #6 ===

#### Lượt #25 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.366 Tr. VNĐ | **Tài sản ròng:** 17.366 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 34 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 3150 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 9.876 Tr. VNĐ | **Tài sản ròng:** 13.676 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn)

#### Lượt #26 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.882 Tr. VNĐ | **Tài sản ròng:** 18.782 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 1400 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 8.142 Tr. VNĐ | **Tài sản ròng:** 16.842 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm)

#### Lượt #27 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.829 Tr. VNĐ | **Tài sản ròng:** 19.129 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 22 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hưng Yên (Văn Giang)] với giá 6100 Tr. VNĐ
- **Số dư sau lượt:** 13.829 Tr. VNĐ | **Tài sản ròng:** 19.129 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #28 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.061 Tr. VNĐ | **Tài sản ròng:** 21.811 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C2
- **Số dư sau lượt:** 1.015 Tr. VNĐ | **Tài sản ròng:** 21.565 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C2)

### === VÒNG ĐẤU #7 ===

#### Lượt #29 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.099 Tr. VNĐ | **Tài sản ròng:** 14.099 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.350 Tr. VNĐ | **Tài sản ròng:** 14.150 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn)

#### Lượt #30 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.265 Tr. VNĐ | **Tài sản ròng:** 14.165 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 39 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [An Giang (Châu Đốc)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 2.725 Tr. VNĐ | **Tài sản ròng:** 15.025 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Bình Định (Quy Nhơn), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc)

#### Lượt #31 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.829 Tr. VNĐ | **Tài sản ròng:** 19.129 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 31 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 13.489 Tr. VNĐ | **Tài sản ròng:** 20.589 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né)

#### Lượt #32 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.238 Tr. VNĐ | **Tài sản ròng:** 21.988 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 4 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng tại [Phiếu Cơ Hội]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.238 Tr. VNĐ | **Tài sản ròng:** 21.988 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C2)

### === VÒNG ĐẤU #8 ===

#### Lượt #33 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.573 Tr. VNĐ | **Tài sản ròng:** 14.573 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 140 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.093 Tr. VNĐ | **Tài sản ròng:** 13.893 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn)

#### Lượt #34 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.948 Tr. VNĐ | **Tài sản ròng:** 15.448 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 3 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.948 Tr. VNĐ | **Tài sản ròng:** 15.448 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành

#### Lượt #35 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.948 Tr. VNĐ | **Tài sản ròng:** 15.448 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 5 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.348 Tr. VNĐ | **Tài sản ròng:** 15.448 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #36 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.852 Tr. VNĐ | **Tài sản ròng:** 21.152 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 12.512 Tr. VNĐ | **Tài sản ròng:** 20.612 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #37 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.238 Tr. VNĐ | **Tài sản ròng:** 21.988 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 7 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.238 Tr. VNĐ | **Tài sản ròng:** 21.988 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C2)

### === VÒNG ĐẤU #9 ===

#### Lượt #38 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.316 Tr. VNĐ | **Tài sản ròng:** 14.316 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 11 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 9.976 Tr. VNĐ | **Tài sản ròng:** 13.776 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn)

#### Lượt #39 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.348 Tr. VNĐ | **Tài sản ròng:** 15.448 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.348 Tr. VNĐ | **Tài sản ròng:** 15.448 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #40 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.735 Tr. VNĐ | **Tài sản ròng:** 21.035 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 12.155 Tr. VNĐ | **Tài sản ròng:** 20.255 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #41 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.238 Tr. VNĐ | **Tài sản ròng:** 21.988 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.238 Tr. VNĐ | **Tài sản ròng:** 21.988 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C2)

### === VÒNG ĐẤU #10 ===

#### Lượt #42 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.199 Tr. VNĐ | **Tài sản ròng:** 14.199 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 7.259 Tr. VNĐ | **Tài sản ròng:** 13.659 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #43 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.588 Tr. VNĐ | **Tài sản ròng:** 15.688 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 21 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.588 Tr. VNĐ | **Tài sản ròng:** 15.688 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #44 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.378 Tr. VNĐ | **Tài sản ròng:** 20.678 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 11.818 Tr. VNĐ | **Tài sản ròng:** 19.918 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #45 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.238 Tr. VNĐ | **Tài sản ròng:** 21.988 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C3 (Resort/Khách sạn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hà Nội (Cầu Giấy)] với giá 2250 Tr. VNĐ
- **Số dư sau lượt:** 2.238 Tr. VNĐ | **Tài sản ròng:** 26.238 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C3)

### === VÒNG ĐẤU #11 ===

#### Lượt #46 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.232 Tr. VNĐ | **Tài sản ròng:** 14.832 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PEAK_TOURISM]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.892 Tr. VNĐ | **Tài sản ròng:** 14.292 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy)

#### Lượt #47 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.808 Tr. VNĐ | **Tài sản ròng:** 15.908 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 31 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Từ chối mua [Cảng HKQT Nội Bài], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cảng HKQT Nội Bài] với giá 2200 Tr. VNĐ
- **Số dư sau lượt:** 1.808 Tr. VNĐ | **Tài sản ròng:** 15.908 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #48 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.041 Tr. VNĐ | **Tài sản ròng:** 20.341 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 21 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 11.701 Tr. VNĐ | **Tài sản ròng:** 19.801 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #49 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.238 Tr. VNĐ | **Tài sản ròng:** 26.238 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 36 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.638 Tr. VNĐ | **Tài sản ròng:** 28.238 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** TP.HCM (Quận 1 - Nguyễn Huệ) (C2), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng)

### === VÒNG ĐẤU #12 ===

#### Lượt #50 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.915 Tr. VNĐ | **Tài sản ròng:** 14.515 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 33 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 60 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 3.915 Tr. VNĐ | **Tài sản ròng:** 15.315 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài

#### Lượt #51 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.808 Tr. VNĐ | **Tài sản ròng:** 15.908 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 35 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.808 Tr. VNĐ | **Tài sản ròng:** 16.908 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #52 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.924 Tr. VNĐ | **Tài sản ròng:** 20.224 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 28 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 7700 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 3.884 Tr. VNĐ | **Tài sản ròng:** 11.984 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #53 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.398 Tr. VNĐ | **Tài sản ròng:** 35.998 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 1 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_DIPLOMATIC]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (Quận 1 - Nguyễn Huệ)] lên C3
- **Số dư sau lượt:** 5.058 Tr. VNĐ | **Tài sản ròng:** 37.458 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng)

### === VÒNG ĐẤU #13 ===

#### Lượt #54 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.138 Tr. VNĐ | **Tài sản ròng:** 15.738 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 1 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Mua thành công [Bà Rịa - Vũng Tàu] giá 1200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.938 Tr. VNĐ | **Tài sản ròng:** 15.738 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #55 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.808 Tr. VNĐ | **Tài sản ròng:** 16.908 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 3 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.808 Tr. VNĐ | **Tài sản ròng:** 16.908 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #56 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.107 Tr. VNĐ | **Tài sản ròng:** 12.407 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 37 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 5.167 Tr. VNĐ | **Tài sản ròng:** 13.267 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #57 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.281 Tr. VNĐ | **Tài sản ròng:** 37.881 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 11 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.941 Tr. VNĐ | **Tài sản ròng:** 37.341 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng)

### === VÒNG ĐẤU #14 ===

#### Lượt #58 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.938 Tr. VNĐ | **Tài sản ròng:** 15.738 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 9 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Từ chối mua [Đà Nẵng (Hải Châu - Sơn Trà)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Đà Nẵng (Hải Châu - Sơn Trà)] với giá 2550 Tr. VNĐ
- **Số dư sau lượt:** 4.938 Tr. VNĐ | **Tài sản ròng:** 15.738 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #59 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.808 Tr. VNĐ | **Tài sản ròng:** 16.908 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.808 Tr. VNĐ | **Tài sản ròng:** 16.908 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #60 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.390 Tr. VNĐ | **Tài sản ròng:** 13.690 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_PORT_EXCLUSIVE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 5.050 Tr. VNĐ | **Tài sản ròng:** 13.150 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #61 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.614 Tr. VNĐ | **Tài sản ròng:** 37.214 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 20 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 320 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.294 Tr. VNĐ | **Tài sản ròng:** 36.894 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà)

### === VÒNG ĐẤU #15 ===

#### Lượt #62 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.938 Tr. VNĐ | **Tài sản ròng:** 15.738 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 19 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Từ chối mua [Tuyến Cao Tốc Bắc - Nam], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Tuyến Cao Tốc Bắc - Nam] với giá 2450 Tr. VNĐ
- **Số dư sau lượt:** 4.938 Tr. VNĐ | **Tài sản ròng:** 15.738 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #63 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.808 Tr. VNĐ | **Tài sản ròng:** 16.908 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 21 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.508 Tr. VNĐ | **Tài sản ròng:** 16.608 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #64 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.370 Tr. VNĐ | **Tài sản ròng:** 13.470 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 7 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.970 Tr. VNĐ | **Tài sản ròng:** 13.470 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt)

#### Lượt #65 | Vòng #15 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.844 Tr. VNĐ | **Tài sản ròng:** 36.444 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 28 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 844 Tr. VNĐ | **Tài sản ròng:** 35.444 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam

### === VÒNG ĐẤU #16 ===

#### Lượt #66 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.738 Tr. VNĐ | **Tài sản ròng:** 16.538 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 25 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 3.098 Tr. VNĐ | **Tài sản ròng:** 15.698 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Định (Quy Nhơn), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #67 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.808 Tr. VNĐ | **Tài sản ròng:** 16.908 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 32 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.808 Tr. VNĐ | **Tài sản ròng:** 16.908 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #68 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.808 Tr. VNĐ | **Tài sản ròng:** 16.908 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 34 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 60 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.748 Tr. VNĐ | **Tài sản ròng:** 17.848 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #69 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.693 Tr. VNĐ | **Tài sản ròng:** 14.393 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.353 Tr. VNĐ | **Tài sản ròng:** 13.853 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt)

#### Lượt #70 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 904 Tr. VNĐ | **Tài sản ròng:** 35.504 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 35 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 904 Tr. VNĐ | **Tài sản ròng:** 35.504 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam

#### Lượt #71 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 904 Tr. VNĐ | **Tài sản ròng:** 35.504 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.154 Tr. VNĐ | **Tài sản ròng:** 36.754 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam

#### Lượt #72 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.154 Tr. VNĐ | **Tài sản ròng:** 36.754 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 1 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.154 Tr. VNĐ | **Tài sản ròng:** 36.754 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam

### === VÒNG ĐẤU #17 ===

#### Lượt #73 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.321 Tr. VNĐ | **Tài sản ròng:** 16.121 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 31 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (TP. Thủ Đức)]: Trả tiền thuê 5321 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 9
- **Giải cứu tài chính:** Thế chấp BĐS ô 32
- **Giải cứu tài chính:** Thế chấp BĐS ô 26
- **Số dư sau lượt:** 1.324 Tr. VNĐ | **Tài sản ròng:** 9.324 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #74 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.748 Tr. VNĐ | **Tài sản ròng:** 17.848 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Từ chối mua [Đồng Nai (Đại Công Viên Chủ Đề)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Đồng Nai (Đại Công Viên Chủ Đề)] với giá 1200 Tr. VNĐ
- **Số dư sau lượt:** 3.748 Tr. VNĐ | **Tài sản ròng:** 17.848 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #75 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.353 Tr. VNĐ | **Tài sản ròng:** 13.853 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 20 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.853 Tr. VNĐ | **Tài sản ròng:** 13.353 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt)

#### Lượt #76 | Vòng #17 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.775 Tr. VNĐ | **Tài sản ròng:** 42.375 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 3.935 Tr. VNĐ | **Tài sản ròng:** 41.335 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #18 ===

#### Lượt #77 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.324 Tr. VNĐ | **Tài sản ròng:** 9.324 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 4 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.324 Tr. VNĐ | **Tài sản ròng:** 9.324 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #78 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.748 Tr. VNĐ | **Tài sản ròng:** 17.848 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 8 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Điện Lực (EVN)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.748 Tr. VNĐ | **Tài sản ròng:** 17.848 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang)

#### Lượt #79 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.076 Tr. VNĐ | **Tài sản ròng:** 13.776 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 25 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 3.436 Tr. VNĐ | **Tài sản ròng:** 12.936 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt)

#### Lượt #80 | Vòng #18 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.158 Tr. VNĐ | **Tài sản ròng:** 41.758 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Kiên Giang (Phú Quốc - Grand World)] với giá 1350 Tr. VNĐ
- **Số dư sau lượt:** 6.158 Tr. VNĐ | **Tài sản ròng:** 41.758 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #19 ===

#### Lượt #81 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.324 Tr. VNĐ | **Tài sản ròng:** 9.324 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 9 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.324 Tr. VNĐ | **Tài sản ròng:** 9.324 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #82 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.698 Tr. VNĐ | **Tài sản ròng:** 19.398 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.698 Tr. VNĐ | **Tài sản ròng:** 19.398 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #83 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.436 Tr. VNĐ | **Tài sản ròng:** 12.936 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 31 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_ALCOHOL_CHECK]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.536 Tr. VNĐ | **Tài sản ròng:** 14.036 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt)

#### Lượt #84 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.158 Tr. VNĐ | **Tài sản ròng:** 41.758 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 27 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 3.818 Tr. VNĐ | **Tài sản ròng:** 41.218 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #85 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.818 Tr. VNĐ | **Tài sản ròng:** 41.218 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 60 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.758 Tr. VNĐ | **Tài sản ròng:** 42.158 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #20 ===

#### Lượt #86 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.324 Tr. VNĐ | **Tài sản ròng:** 9.324 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.104 Tr. VNĐ | **Tài sản ròng:** 9.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #87 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.104 Tr. VNĐ | **Tài sản ròng:** 9.104 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.104 Tr. VNĐ | **Tài sản ròng:** 9.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #88 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.918 Tr. VNĐ | **Tài sản ròng:** 19.618 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 21 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 500 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.418 Tr. VNĐ | **Tài sản ròng:** 19.118 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #89 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.418 Tr. VNĐ | **Tài sản ròng:** 19.118 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 25 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.418 Tr. VNĐ | **Tài sản ròng:** 19.118 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #90 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.819 Tr. VNĐ | **Tài sản ròng:** 14.519 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.359 Tr. VNĐ | **Tài sản ròng:** 13.859 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt)

#### Lượt #91 | Vòng #20 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.481 Tr. VNĐ | **Tài sản ròng:** 43.081 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 140 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 5.001 Tr. VNĐ | **Tài sản ròng:** 42.401 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #21 ===

#### Lượt #92 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.224 Tr. VNĐ | **Tài sản ròng:** 9.224 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.224 Tr. VNĐ | **Tài sản ròng:** 9.224 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #93 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.418 Tr. VNĐ | **Tài sản ròng:** 19.118 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 32 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 60 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.358 Tr. VNĐ | **Tài sản ròng:** 20.058 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #94 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.722 Tr. VNĐ | **Tài sản ròng:** 14.422 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 9 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 180 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.202 Tr. VNĐ | **Tài sản ròng:** 13.702 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt)

#### Lượt #95 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.464 Tr. VNĐ | **Tài sản ròng:** 43.064 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Định (Quy Nhơn)] từ Cô Tư (Thận trọng / Passive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C1
- **Số dư sau lượt:** 704 Tr. VNĐ | **Tài sản ròng:** 42.704 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề), Thừa Thiên Huế (C1)

### === VÒNG ĐẤU #22 ===

#### Lượt #96 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.224 Tr. VNĐ | **Tài sản ròng:** 9.224 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 912 Tr. VNĐ | **Tài sản ròng:** 8.912 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #97 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.670 Tr. VNĐ | **Tài sản ròng:** 20.370 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 120 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.550 Tr. VNĐ | **Tài sản ròng:** 20.250 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #98 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.425 Tr. VNĐ | **Tài sản ròng:** 14.125 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 16 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.225 Tr. VNĐ | **Tài sản ròng:** 14.125 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Nghệ An (TP. Vinh)

#### Lượt #99 | Vòng #22 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 824 Tr. VNĐ | **Tài sản ròng:** 42.824 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 18 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 824 Tr. VNĐ | **Tài sản ròng:** 42.824 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề), Thừa Thiên Huế (C1)

### === VÒNG ĐẤU #23 ===

#### Lượt #100 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 912 Tr. VNĐ | **Tài sản ròng:** 8.912 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 27 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FIRE_INSPECTION]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 912 Tr. VNĐ | **Tài sản ròng:** 8.912 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Cảng HKQT Nội Bài, Bà Rịa - Vũng Tàu

#### Lượt #101 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.550 Tr. VNĐ | **Tài sản ròng:** 20.250 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 8 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_UTILITY_DOUBLE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.550 Tr. VNĐ | **Tài sản ròng:** 20.250 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #102 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.225 Tr. VNĐ | **Tài sản ròng:** 14.125 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 1450 Tr. VNĐ
- **Số dư sau lượt:** 4.225 Tr. VNĐ | **Tài sản ròng:** 14.125 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Nghệ An (TP. Vinh)

#### Lượt #103 | Vòng #23 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** -1.376 Tr. VNĐ | **Tài sản ròng:** 40.624 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 26 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 1
- **Giải cứu tài chính:** Thế chấp BĐS ô 8
- **Giải cứu tài chính:** Thế chấp BĐS ô 25
- **Số dư sau lượt:** 424 Tr. VNĐ | **Tài sản ròng:** 40.624 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn) (C1), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề), Thừa Thiên Huế (C1)

### === VÒNG ĐẤU #24 ===

#### Lượt #104 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 912 Tr. VNĐ | **Tài sản ròng:** 8.912 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 912 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 9
- **Giải cứu tài chính:** Thế chấp BĐS ô 15
- **Giải cứu tài chính:** Thế chấp BĐS ô 35
- **Giải cứu tài chính:** Tuyên bố Phá sản (Insolvent Bankruptcy)
- **Số dư sau lượt:** -5.288 Tr. VNĐ | **Tài sản ròng:** -5.288 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #105 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.100 Tr. VNĐ | **Tài sản ròng:** 21.600 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 240 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.860 Tr. VNĐ | **Tài sản ròng:** 21.360 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World), Quảng Ninh (Hạ Long)

#### Lượt #106 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.465 Tr. VNĐ | **Tài sản ròng:** 14.365 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 29 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 4465 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Giải cứu tài chính:** Thế chấp BĐS ô 11
- **Giải cứu tài chính:** Thế chấp BĐS ô 13
- **Giải cứu tài chính:** Thế chấp BĐS ô 23
- **Giải cứu tài chính:** Thế chấp BĐS ô 24
- **Giải cứu tài chính:** Thế chấp BĐS ô 28
- **Số dư sau lượt:** 615 Tr. VNĐ | **Tài sản ròng:** 5.565 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Nghệ An (TP. Vinh)

#### Lượt #107 | Vòng #24 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.801 Tr. VNĐ | **Tài sản ròng:** 46.001 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Cần Thơ (Cái Răng)] (Hoàn trả nợ + 10% phí Kho Bạc: 330 Tr. VNĐ)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C2
- **Số dư sau lượt:** 91 Tr. VNĐ | **Tài sản ròng:** 46.391 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Định (Quy Nhơn) (C2), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề), Thừa Thiên Huế (C2)

### === VÒNG ĐẤU #25 ===

#### Lượt #108 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.577 Tr. VNĐ | **Tài sản ròng:** 21.877 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 2.717 Tr. VNĐ | **Tài sản ròng:** 22.217 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World), Quảng Ninh (Hạ Long)

#### Lượt #109 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 615 Tr. VNĐ | **Tài sản ròng:** 5.565 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 39 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_TAX_AUDIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 468 Tr. VNĐ | **Tài sản ròng:** 5.418 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Nghệ An (TP. Vinh)

#### Lượt #110 | Vòng #25 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.808 Tr. VNĐ | **Tài sản ròng:** 47.908 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 37 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [An Giang (Châu Đốc)]: Trả tiền thuê 60 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Đồng Nai (Đại Công Viên Chủ Đề)] (Hoàn trả nợ + 10% phí Kho Bạc: 550 Tr. VNĐ)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C3
- **Số dư sau lượt:** 463 Tr. VNĐ | **Tài sản ròng:** 49.763 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn) (C2), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề), Thừa Thiên Huế (C3)

### === VÒNG ĐẤU #26 ===

#### Lượt #111 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.777 Tr. VNĐ | **Tài sản ròng:** 22.277 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 33 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 60 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.717 Tr. VNĐ | **Tài sản ròng:** 23.217 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World), Quảng Ninh (Hạ Long)

#### Lượt #112 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 468 Tr. VNĐ | **Tài sản ròng:** 5.418 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 308 Tr. VNĐ | **Tài sản ròng:** 5.258 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Nghệ An (TP. Vinh)

#### Lượt #113 | Vòng #26 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 523 Tr. VNĐ | **Tài sản ròng:** 49.823 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 3 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 523 Tr. VNĐ | **Tài sản ròng:** 49.823 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn) (C2), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề), Thừa Thiên Huế (C3)

### === VÒNG ĐẤU #27 ===

#### Lượt #114 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.877 Tr. VNĐ | **Tài sản ròng:** 23.377 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 1 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.877 Tr. VNĐ | **Tài sản ròng:** 23.377 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World), Quảng Ninh (Hạ Long)

#### Lượt #115 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 308 Tr. VNĐ | **Tài sản ròng:** 5.258 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 88 Tr. VNĐ | **Tài sản ròng:** 5.038 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Nghệ An (TP. Vinh)

#### Lượt #116 | Vòng #27 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 523 Tr. VNĐ | **Tài sản ròng:** 49.823 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 523 Tr. VNĐ | **Tài sản ròng:** 49.823 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn) (C2), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề), Thừa Thiên Huế (C3)

### === VÒNG ĐẤU #28 ===

#### Lượt #117 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.097 Tr. VNĐ | **Tài sản ròng:** 23.597 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.097 Tr. VNĐ | **Tài sản ròng:** 23.597 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World), Quảng Ninh (Hạ Long)

#### Lượt #118 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 88 Tr. VNĐ | **Tài sản ròng:** 5.038 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 88 Tr. VNĐ | **Tài sản ròng:** 5.038 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Nghệ An (TP. Vinh)

#### Lượt #119 | Vòng #28 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 523 Tr. VNĐ | **Tài sản ròng:** 49.823 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] với giá 1350 Tr. VNĐ
- **Số dư sau lượt:** 523 Tr. VNĐ | **Tài sản ròng:** 49.823 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn) (C2), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề), Thừa Thiên Huế (C3)

### === VÒNG ĐẤU #29 ===

#### Lượt #120 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.747 Tr. VNĐ | **Tài sản ròng:** 24.847 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Kiên Giang (Phú Quốc - Grand World)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Quảng Ninh (Hạ Long)] lên C1
- **Số dư sau lượt:** 187 Tr. VNĐ | **Tài sản ròng:** 24.987 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World) (C1), Quảng Ninh (Hạ Long) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #121 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 88 Tr. VNĐ | **Tài sản ròng:** 5.038 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 88 Tr. VNĐ | **Tài sản ròng:** 5.038 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Nghệ An (TP. Vinh)

#### Lượt #122 | Vòng #29 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 523 Tr. VNĐ | **Tài sản ròng:** 49.823 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 26 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 300 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 223 Tr. VNĐ | **Tài sản ròng:** 49.523 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn) (C2), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề), Thừa Thiên Huế (C3)

### === VÒNG ĐẤU #30 ===

#### Lượt #123 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 487 Tr. VNĐ | **Tài sản ròng:** 25.287 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 20 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng tại [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 487 Tr. VNĐ | **Tài sản ròng:** 25.287 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hà Nội (Hoàn Kiếm), Hưng Yên (Văn Giang), An Giang (Châu Đốc), Cảng HKQT Long Thành, Khánh Hòa (Nha Trang), Kiên Giang (Phú Quốc - Grand World) (C1), Quảng Ninh (Hạ Long) (C1), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #124 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 88 Tr. VNĐ | **Tài sản ròng:** 5.038 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 88 Tr. VNĐ | **Tài sản ròng:** 5.038 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Bình Thuận (Mũi Né), Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Nghệ An (TP. Vinh)

#### Lượt #125 | Vòng #30 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 223 Tr. VNĐ | **Tài sản ròng:** 49.523 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 223 Tr. VNĐ | **Tài sản ròng:** 49.523 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Định (Quy Nhơn) (C2), TP.HCM (Quận 1 - Nguyễn Huệ) (C3), TP.HCM (TP. Thủ Đức) (C3), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Tuyến Cao Tốc Bắc - Nam, Đồng Nai (Đại Công Viên Chủ Đề), Thừa Thiên Huế (C3)

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.