# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (4 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920264 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 4 người chơi.
- **Tổng số lượt đi (Turns):** 165 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Cô Tư (Thận trọng / Passive)** (Tổng tài sản ròng: **34.491 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Cô Tư (Thận trọng / Passive) | Passive | 2.991 Tr. VNĐ | 34.491 Tr. VNĐ | 7 ô | 🏆 Vô địch |
| 2 | Bé Bo (Cạnh tranh / Aggressive) | Aggressive | 2.371 Tr. VNĐ | 20.171 Tr. VNĐ | 8 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 8.771 Tr. VNĐ | 20.071 Tr. VNĐ | 6 ô | ✓ Hoàn thành |
| 4 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 3.924 Tr. VNĐ | 19.624 Tr. VNĐ | 7 ô | ✓ Hoàn thành |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 249 lần.
- Số giao dịch sang tên thành công: 48 thương vụ.
- Tổng giá trị chuyển nhượng đất: 193.050 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 9.652 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 5 phiên.
- Tổng vốn cọc đầu tư: 8.500 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 11.400 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: 2.900 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 4 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 7 lần.
- Tổng giá trị thanh toán chuộc đất: 8.525 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_BUILD_HALT | Thẻ Cơ Hội | 1 lần | 10.0% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 10.0% |
| CC_DIPLOMATIC | Thẻ Cơ Hội | 1 lần | 10.0% |
| CC_PORT_EXCLUSIVE | Thẻ Cơ Hội | 1 lần | 10.0% |
| CC_TAX_AUDIT | Thẻ Cơ Hội | 1 lần | 10.0% |
| CC_LAND_CHANGE | Thẻ Cơ Hội | 1 lần | 10.0% |
| CC_CONTRACT_PENALTY | Thẻ Cơ Hội | 1 lần | 10.0% |
| CC_CONCERT_SPONSOR | Thẻ Cơ Hội | 1 lần | 10.0% |
| CC_MEDIA_CRISIS | Thẻ Cơ Hội | 1 lần | 10.0% |
| CC_JUNK_STOCK | Thẻ Cơ Hội | 1 lần | 10.0% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_FUEL_SURGE | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_NIGHT_ECONOMY | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_CASINO_PILOT | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_PEAK_TOURISM | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_ALCOHOL_CHECK | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_FIRE_INSPECTION | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_UTILITY_DOUBLE | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_PUBLIC_INVEST | Thẻ Thị Trường | 1 lần | 10.0% |
| MC_URBAN_PLANNING | Thẻ Thị Trường | 1 lần | 10.0% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 5 lần | 3.0% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 18 lần | 10.9% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 5 lần | 3.0% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 5 lần | 3.0% |
| Cảng HKQT Long Thành | Đặc biệt | 2 lần | 1.2% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 5 lần | 3.0% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 6 lần | 3.6% |
| Cảng HKQT Nội Bài | Đặc biệt | 2 lần | 1.2% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 5 lần | 3.0% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 5 lần | 3.0% |

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
- **Số dư sau lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #15 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #16 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 39 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 7750 Tr. VNĐ
- **Số dư sau lượt:** 13.420 Tr. VNĐ | **Tài sản ròng:** 16.720 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #17 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.304 Tr. VNĐ | **Tài sản ròng:** 18.304 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 18.304 Tr. VNĐ | **Tài sản ròng:** 18.304 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #18 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.304 Tr. VNĐ | **Tài sản ròng:** 18.304 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 18.304 Tr. VNĐ | **Tài sản ròng:** 18.304 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #19 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.304 Tr. VNĐ | **Tài sản ròng:** 18.304 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 18.304 Tr. VNĐ | **Tài sản ròng:** 18.304 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #20 | Vòng #3 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.304 Tr. VNĐ | **Tài sản ròng:** 18.304 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng tại [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hưng Yên (Văn Giang)] với giá 4850 Tr. VNĐ
- **Số dư sau lượt:** 18.304 Tr. VNĐ | **Tài sản ròng:** 18.304 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #4 ===

#### Lượt #21 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.504 Tr. VNĐ | **Tài sản ròng:** 11.504 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_NIGHT_ECONOMY]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.104 Tr. VNĐ | **Tài sản ròng:** 11.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang)

#### Lượt #22 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.943 Tr. VNĐ | **Tài sản ròng:** 17.043 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 21 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Từ chối mua [Quảng Ninh (Hạ Long)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 10.943 Tr. VNĐ | **Tài sản ròng:** 17.043 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #23 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.943 Tr. VNĐ | **Tài sản ròng:** 17.043 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 29 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Quảng Ninh (Hạ Long)] với giá 3200 Tr. VNĐ
- **Số dư sau lượt:** 10.943 Tr. VNĐ | **Tài sản ròng:** 17.043 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Tập Đoàn Điện Lực (EVN), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn)

#### Lượt #24 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 13.020 Tr. VNĐ | **Tài sản ròng:** 16.320 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Bà Rịa - Vũng Tàu], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 15.020 Tr. VNĐ | **Tài sản ròng:** 18.320 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #25 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.020 Tr. VNĐ | **Tài sản ròng:** 18.320 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 9 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Bà Rịa - Vũng Tàu] với giá 2100 Tr. VNĐ
- **Số dư sau lượt:** 15.020 Tr. VNĐ | **Tài sản ròng:** 18.320 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #26 | Vòng #4 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
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

#### Lượt #27 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.104 Tr. VNĐ | **Tài sản ròng:** 11.104 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 33 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Thua lỗ thị trường (-1000 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 1000 Tr. VNĐ (-1000 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.104 Tr. VNĐ | **Tài sản ròng:** 10.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang)

#### Lượt #28 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.907 Tr. VNĐ | **Tài sản ròng:** 17.607 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 29 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 8.787 Tr. VNĐ | **Tài sản ròng:** 16.887 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài

#### Lượt #29 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.020 Tr. VNĐ | **Tài sản ròng:** 18.320 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 16 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Đà Nẵng (Hải Châu - Sơn Trà)] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Chú Sáu (Cân bằng / Balanced) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 9.900 Tr. VNĐ | **Tài sản ròng:** 17.600 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #30 | Vòng #5 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
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

#### Lượt #31 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.104 Tr. VNĐ | **Tài sản ròng:** 10.104 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 38 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.104 Tr. VNĐ | **Tài sản ròng:** 12.104 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #32 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.468 Tr. VNĐ | **Tài sản ròng:** 17.968 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 35 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (TP. Thủ Đức)] giá 3500 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 8.108 Tr. VNĐ | **Tài sản ròng:** 17.308 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức)

#### Lượt #33 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.108 Tr. VNĐ | **Tài sản ròng:** 17.308 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 37 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_BUILD_HALT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 4.808 Tr. VNĐ | **Tài sản ròng:** 17.008 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức)

#### Lượt #34 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.900 Tr. VNĐ | **Tài sản ròng:** 17.600 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thanh Hóa (Sầm Sơn)] từ Chú Sáu (Cân bằng / Balanced) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 7.040 Tr. VNĐ | **Tài sản ròng:** 16.940 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #35 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.305 Tr. VNĐ | **Tài sản ròng:** 18.305 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 5 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bác Ba (Thực dụng / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 7.105 Tr. VNĐ | **Tài sản ròng:** 17.105 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành

#### Lượt #36 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.105 Tr. VNĐ | **Tài sản ròng:** 17.105 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Từ chối mua [Tuyến Cao Tốc Bắc - Nam], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 7.105 Tr. VNĐ | **Tài sản ròng:** 17.105 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành

#### Lượt #37 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.105 Tr. VNĐ | **Tài sản ròng:** 17.105 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 25 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 7.105 Tr. VNĐ | **Tài sản ròng:** 17.105 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành

#### Lượt #38 | Vòng #6 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.105 Tr. VNĐ | **Tài sản ròng:** 17.105 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 25 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Tuyến Cao Tốc Bắc - Nam] với giá 3300 Tr. VNĐ
- **Số dư sau lượt:** 7.105 Tr. VNĐ | **Tài sản ròng:** 17.105 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành

### === VÒNG ĐẤU #7 ===

#### Lượt #39 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.449 Tr. VNĐ | **Tài sản ròng:** 13.449 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 1.849 Tr. VNĐ | **Tài sản ròng:** 12.249 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt)

#### Lượt #40 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.525 Tr. VNĐ | **Tài sản ròng:** 17.525 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 2.285 Tr. VNĐ | **Tài sản ròng:** 16.685 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang)

#### Lượt #41 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.040 Tr. VNĐ | **Tài sản ròng:** 16.940 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 28 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 7.040 Tr. VNĐ | **Tài sản ròng:** 16.940 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #42 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.040 Tr. VNĐ | **Tài sản ròng:** 16.940 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 34 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 2100 Tr. VNĐ
- **Số dư sau lượt:** 7.040 Tr. VNĐ | **Tài sản ròng:** 16.940 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #43 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.403 Tr. VNĐ | **Tài sản ròng:** 19.803 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 33 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cần Thơ (Cái Răng)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 15.403 Tr. VNĐ | **Tài sản ròng:** 21.803 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm)

#### Lượt #44 | Vòng #7 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.403 Tr. VNĐ | **Tài sản ròng:** 21.803 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 1 ➔ Ô 1 (**Cần Thơ (Cái Răng)**)
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cần Thơ (Cái Răng)] với giá 1150 Tr. VNĐ
- **Số dư sau lượt:** 15.403 Tr. VNĐ | **Tài sản ròng:** 21.803 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #8 ===

#### Lượt #45 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 699 Tr. VNĐ | **Tài sản ròng:** 11.699 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 13 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PEAK_TOURISM]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 699 Tr. VNĐ | **Tài sản ròng:** 11.699 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng)

#### Lượt #46 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.285 Tr. VNĐ | **Tài sản ròng:** 16.685 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 440 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.845 Tr. VNĐ | **Tài sản ròng:** 16.245 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang)

#### Lượt #47 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.480 Tr. VNĐ | **Tài sản ròng:** 17.380 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 34 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bác Ba (Thực dụng / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 3.530 Tr. VNĐ | **Tài sản ròng:** 17.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #48 | Vòng #8 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
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

#### Lượt #49 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.639 Tr. VNĐ | **Tài sản ròng:** 12.639 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 17 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 220 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 1.519 Tr. VNĐ | **Tài sản ròng:** 11.519 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng)

#### Lượt #50 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.519 Tr. VNĐ | **Tài sản ròng:** 11.519 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.519 Tr. VNĐ | **Tài sản ròng:** 11.519 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng)

#### Lượt #51 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.519 Tr. VNĐ | **Tài sản ròng:** 11.519 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 26 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.519 Tr. VNĐ | **Tài sản ròng:** 11.519 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng)

#### Lượt #52 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.519 Tr. VNĐ | **Tài sản ròng:** 11.519 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 26 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] với giá 3900 Tr. VNĐ
- **Số dư sau lượt:** 1.519 Tr. VNĐ | **Tài sản ròng:** 11.519 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng)

#### Lượt #53 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.650 Tr. VNĐ | **Tài sản ròng:** 15.650 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 21 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 280 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.370 Tr. VNĐ | **Tài sản ròng:** 15.370 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #54 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.030 Tr. VNĐ | **Tài sản ròng:** 17.930 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.627 Tr. VNĐ | **Tài sản ròng:** 17.527 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #55 | Vòng #9 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
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

#### Lượt #56 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.224 Tr. VNĐ | **Tài sản ròng:** 12.224 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FIRE_INSPECTION]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 1.324 Tr. VNĐ | **Tài sản ròng:** 11.324 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng)

#### Lượt #57 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.370 Tr. VNĐ | **Tài sản ròng:** 15.370 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 28 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 400 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 970 Tr. VNĐ | **Tài sản ròng:** 14.970 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #58 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 17.927 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 17.927 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #59 | Vòng #10 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
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

#### Lượt #60 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
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

#### Lượt #61 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.179 Tr. VNĐ | **Tài sản ròng:** 12.379 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 3 ➔ Ô 5 (**Cảng HKQT Long Thành**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 500 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Cần Thơ (Cái Răng)] lên C2
- **Số dư sau lượt:** 229 Tr. VNĐ | **Tài sản ròng:** 12.029 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C2), An Giang (Châu Đốc) (C1)

#### Lượt #62 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
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

#### Lượt #63 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.199 Tr. VNĐ | **Tài sản ròng:** 15.199 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.179 Tr. VNĐ | **Tài sản ròng:** 16.179 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #64 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 17.927 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.867 Tr. VNĐ | **Tài sản ròng:** 17.767 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #65 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.867 Tr. VNĐ | **Tài sản ròng:** 17.767 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 14 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.867 Tr. VNĐ | **Tài sản ròng:** 17.767 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #66 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.867 Tr. VNĐ | **Tài sản ròng:** 17.767 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 16 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.867 Tr. VNĐ | **Tài sản ròng:** 17.767 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #67 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.318 Tr. VNĐ | **Tài sản ròng:** 21.718 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 14.006 Tr. VNĐ | **Tài sản ròng:** 21.406 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #68 | Vòng #11 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.006 Tr. VNĐ | **Tài sản ròng:** 21.406 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_UTILITY_DOUBLE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 13.606 Tr. VNĐ | **Tài sản ròng:** 21.006 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #12 ===

#### Lượt #69 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.219 Tr. VNĐ | **Tài sản ròng:** 13.219 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.219 Tr. VNĐ | **Tài sản ròng:** 13.219 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #70 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.101 Tr. VNĐ | **Tài sản ròng:** 18.101 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.101 Tr. VNĐ | **Tài sản ròng:** 17.101 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #71 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.267 Tr. VNĐ | **Tài sản ròng:** 18.167 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 651 Tr. VNĐ | **Tài sản ròng:** 16.351 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà), Thừa Thiên Huế

#### Lượt #72 | Vòng #12 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.606 Tr. VNĐ | **Tài sản ròng:** 21.006 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 400 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 13.206 Tr. VNĐ | **Tài sản ròng:** 20.606 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #13 ===

#### Lượt #73 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.241 Tr. VNĐ | **Tài sản ròng:** 15.241 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 19 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Viễn Thông (Viettel)]: Trả tiền thuê 360 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.881 Tr. VNĐ | **Tài sản ròng:** 14.881 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #74 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.101 Tr. VNĐ | **Tài sản ròng:** 17.101 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 15 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Dừng tại [Phiếu Cơ Hội]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.101 Tr. VNĐ | **Tài sản ròng:** 17.101 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #75 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.433 Tr. VNĐ | **Tài sản ròng:** 18.133 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C1
- **Số dư sau lượt:** 623 Tr. VNĐ | **Tài sản ròng:** 18.223 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C1), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế

#### Lượt #76 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.206 Tr. VNĐ | **Tài sản ròng:** 20.606 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 11 (**Bình Thuận (Mũi Né)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 14.606 Tr. VNĐ | **Tài sản ròng:** 22.006 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #77 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.606 Tr. VNĐ | **Tài sản ròng:** 22.006 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 14.606 Tr. VNĐ | **Tài sản ròng:** 22.006 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #78 | Vòng #13 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.606 Tr. VNĐ | **Tài sản ròng:** 22.006 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Bình Thuận (Mũi Né)] với giá 2800 Tr. VNĐ
- **Số dư sau lượt:** 14.606 Tr. VNĐ | **Tài sản ròng:** 22.006 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #14 ===

#### Lượt #79 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.881 Tr. VNĐ | **Tài sản ròng:** 14.881 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 28 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.381 Tr. VNĐ | **Tài sản ròng:** 14.381 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #80 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 801 Tr. VNĐ | **Tài sản ròng:** 16.201 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 22 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 801 Tr. VNĐ | **Tài sản ròng:** 16.201 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #81 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 623 Tr. VNĐ | **Tài sản ròng:** 18.223 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 623 Tr. VNĐ | **Tài sản ròng:** 18.223 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C1), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế

#### Lượt #82 | Vòng #14 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.606 Tr. VNĐ | **Tài sản ròng:** 22.006 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Chú Sáu (Cân bằng / Balanced) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 8.366 Tr. VNĐ | **Tài sản ròng:** 21.166 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #15 ===

#### Lượt #83 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.381 Tr. VNĐ | **Tài sản ròng:** 14.381 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 35 ➔ Ô 3 (**An Giang (Châu Đốc)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [An Giang (Châu Đốc)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.271 Tr. VNĐ | **Tài sản ròng:** 15.271 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #84 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.271 Tr. VNĐ | **Tài sản ròng:** 15.271 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 3 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 140 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.131 Tr. VNĐ | **Tài sản ròng:** 15.131 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #85 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.399 Tr. VNĐ | **Tài sản ròng:** 16.999 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 26 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.399 Tr. VNĐ | **Tài sản ròng:** 16.999 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #86 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.399 Tr. VNĐ | **Tài sản ròng:** 16.999 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.399 Tr. VNĐ | **Tài sản ròng:** 16.999 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #87 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.399 Tr. VNĐ | **Tài sản ròng:** 16.999 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bé Bo (Cạnh tranh / Aggressive) thắng đấu giá [Hà Nội (Cầu Giấy)] với giá 3100 Tr. VNĐ
- **Số dư sau lượt:** 4.399 Tr. VNĐ | **Tài sản ròng:** 16.999 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #88 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 623 Tr. VNĐ | **Tài sản ròng:** 18.223 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 623 Tr. VNĐ | **Tài sản ròng:** 18.223 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C1), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế

#### Lượt #89 | Vòng #15 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.266 Tr. VNĐ | **Tài sản ròng:** 21.066 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 27 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 7.766 Tr. VNĐ | **Tài sản ròng:** 23.566 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #16 ===

#### Lượt #90 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.138 Tr. VNĐ | **Tài sản ròng:** 16.138 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 11 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Hưng Yên (Văn Giang)] (Hoàn trả nợ + 10% phí Kho Bạc: 1650 Tr. VNĐ)
- **Số dư sau lượt:** 2.488 Tr. VNĐ | **Tài sản ròng:** 15.988 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #91 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.399 Tr. VNĐ | **Tài sản ròng:** 16.999 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 32 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 1.599 Tr. VNĐ | **Tài sản ròng:** 17.199 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #92 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.630 Tr. VNĐ | **Tài sản ròng:** 19.230 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C1
- **Số dư sau lượt:** -1.112 Tr. VNĐ | **Tài sản ròng:** 17.388 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C1), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế (C1)

#### Lượt #93 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** -1.112 Tr. VNĐ | **Tài sản ròng:** 17.388 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 21
- **Giải cứu tài chính:** Thế chấp BĐS ô 24
- **Số dư sau lượt:** 1.188 Tr. VNĐ | **Tài sản ròng:** 17.388 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C1), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế (C1)

#### Lượt #94 | Vòng #16 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.766 Tr. VNĐ | **Tài sản ròng:** 23.566 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 36 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 990 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 7.776 Tr. VNĐ | **Tài sản ròng:** 23.576 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #17 ===

#### Lượt #95 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.183 Tr. VNĐ | **Tài sản ròng:** 17.683 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Chú Sáu (Cân bằng / Balanced) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Lâm Đồng (Đà Lạt)] (Hoàn trả nợ + 10% phí Kho Bạc: 770 Tr. VNĐ)
- **Số dư sau lượt:** 2.513 Tr. VNĐ | **Tài sản ròng:** 16.713 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #96 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.527 Tr. VNĐ | **Tài sản ròng:** 19.127 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 0 ➔ Ô 2 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 19.627 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #97 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 19.627 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 2 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 19.627 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #98 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 19.627 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 6 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.027 Tr. VNĐ | **Tài sản ròng:** 19.627 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né)

#### Lượt #99 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.811 Tr. VNĐ | **Tài sản ròng:** 19.011 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 80 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C2
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C2
- **Số dư sau lượt:** 211 Tr. VNĐ | **Tài sản ròng:** 20.011 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế (C2)

#### Lượt #100 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 211 Tr. VNĐ | **Tài sản ròng:** 20.011 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 12 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 211 Tr. VNĐ | **Tài sản ròng:** 20.011 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), TP.HCM (Quận 1 - Nguyễn Huệ), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế (C2)

#### Lượt #101 | Vòng #17 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.176 Tr. VNĐ | **Tài sản ròng:** 24.976 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 1 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Cô Tư (Thận trọng / Passive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 3.059 Tr. VNĐ | **Tài sản ròng:** 22.859 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #18 ===

#### Lượt #102 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.618 Tr. VNĐ | **Tài sản ròng:** 19.818 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 1440 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Chú Sáu (Cân bằng / Balanced) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 1.297 Tr. VNĐ | **Tài sản ròng:** 15.497 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Hưng Yên (Văn Giang), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #103 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.812 Tr. VNĐ | **Tài sản ròng:** 20.412 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 15 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 1.712 Tr. VNĐ | **Tài sản ròng:** 19.512 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Hưng Yên (Văn Giang), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #104 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.591 Tr. VNĐ | **Tài sản ròng:** 22.391 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 20 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hưng Yên (Văn Giang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hưng Yên (Văn Giang)] từ Chú Sáu (Cân bằng / Balanced) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Thanh Hóa (Sầm Sơn)] (Hoàn trả nợ + 10% phí Kho Bạc: 1210 Tr. VNĐ)
- **Số dư sau lượt:** 1.481 Tr. VNĐ | **Tài sản ròng:** 21.381 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế (C2)

#### Lượt #105 | Vòng #18 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.059 Tr. VNĐ | **Tài sản ròng:** 22.859 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 4 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.059 Tr. VNĐ | **Tài sản ròng:** 22.859 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #19 ===

#### Lượt #106 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.002 Tr. VNĐ | **Tài sản ròng:** 16.202 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng tại [Tuyến Cao Tốc Bắc - Nam]
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 1.362 Tr. VNĐ | **Tài sản ròng:** 15.362 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #107 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.417 Tr. VNĐ | **Tài sản ròng:** 20.217 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 23 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.417 Tr. VNĐ | **Tài sản ròng:** 19.217 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #108 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.417 Tr. VNĐ | **Tài sản ròng:** 19.217 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 25 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_DIPLOMATIC]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.417 Tr. VNĐ | **Tài sản ròng:** 19.217 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #109 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.481 Tr. VNĐ | **Tài sản ròng:** 21.381 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.481 Tr. VNĐ | **Tài sản ròng:** 21.381 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế (C2)

#### Lượt #110 | Vòng #19 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.517 Tr. VNĐ | **Tài sản ròng:** 23.517 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Bác Ba (Thực dụng / Aggressive) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 2.717 Tr. VNĐ | **Tài sản ròng:** 22.517 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #20 ===

#### Lượt #111 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.820 Tr. VNĐ | **Tài sản ròng:** 17.020 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 25 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 374 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 1.806 Tr. VNĐ | **Tài sản ròng:** 15.806 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #112 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.806 Tr. VNĐ | **Tài sản ròng:** 15.806 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 27 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_PORT_EXCLUSIVE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.806 Tr. VNĐ | **Tài sản ròng:** 16.806 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #113 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.577 Tr. VNĐ | **Tài sản ròng:** 19.377 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 29 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Bác Ba (Thực dụng / Aggressive) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 1.937 Tr. VNĐ | **Tài sản ròng:** 19.537 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #114 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.481 Tr. VNĐ | **Tài sản ròng:** 21.381 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.481 Tr. VNĐ | **Tài sản ròng:** 21.381 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Thừa Thiên Huế (C2)

#### Lượt #115 | Vòng #20 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.549 Tr. VNĐ | **Tài sản ròng:** 23.549 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 14 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_TAX_AUDIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.549 Tr. VNĐ | **Tài sản ròng:** 20.549 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** TP.HCM (Quận 1 - Nguyễn Huệ), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #21 ===

#### Lượt #116 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.264 Tr. VNĐ | **Tài sản ròng:** 17.464 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 36 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_LAND_CHANGE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 1.164 Tr. VNĐ | **Tài sản ròng:** 16.864 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #117 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.159 Tr. VNĐ | **Tài sản ròng:** 20.759 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 0 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 144 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.015 Tr. VNĐ | **Tài sản ròng:** 20.615 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #118 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 2.703 Tr. VNĐ | **Tài sản ròng:** 22.603 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C2
- **Số dư sau lượt:** -1.107 Tr. VNĐ | **Tài sản ròng:** 20.793 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Thừa Thiên Huế (C2)

#### Lượt #119 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** -1.107 Tr. VNĐ | **Tài sản ròng:** 20.793 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 21
- **Giải cứu tài chính:** Thế chấp BĐS ô 28
- **Số dư sau lượt:** 743 Tr. VNĐ | **Tài sản ròng:** 20.793 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C2), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Thừa Thiên Huế (C2)

#### Lượt #120 | Vòng #21 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.633 Tr. VNĐ | **Tài sản ròng:** 21.633 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 22 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bác Ba (Thực dụng / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 3.433 Tr. VNĐ | **Tài sản ròng:** 20.433 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** TP.HCM (Quận 1 - Nguyễn Huệ), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #22 ===

#### Lượt #121 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.104 Tr. VNĐ | **Tài sản ròng:** 17.804 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 7 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 704 Tr. VNĐ | **Tài sản ròng:** 16.404 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #122 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.616 Tr. VNĐ | **Tài sản ròng:** 22.216 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 9 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 2160 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.456 Tr. VNĐ | **Tài sản ròng:** 20.056 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #123 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.304 Tr. VNĐ | **Tài sản ròng:** 24.354 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 10 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 192 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Ninh Bình (Tràng An)] (Hoàn trả nợ + 10% phí Kho Bạc: 1320 Tr. VNĐ)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C3
- **Số dư sau lượt:** 632 Tr. VNĐ | **Tài sản ròng:** 24.582 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C2), Thừa Thiên Huế (C2)

#### Lượt #124 | Vòng #22 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.373 Tr. VNĐ | **Tài sản ròng:** 21.373 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (2000 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 4000 Tr. VNĐ (+2000 Tr.)
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bác Ba (Thực dụng / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 5.173 Tr. VNĐ | **Tài sản ròng:** 22.173 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** TP.HCM (Quận 1 - Nguyễn Huệ), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #23 ===

#### Lượt #125 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.644 Tr. VNĐ | **Tài sản ròng:** 17.344 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 2160 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.484 Tr. VNĐ | **Tài sản ròng:** 15.184 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #126 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.833 Tr. VNĐ | **Tài sản ròng:** 21.433 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 19 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONTRACT_PENALTY]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.833 Tr. VNĐ | **Tài sản ròng:** 20.433 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #127 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.977 Tr. VNĐ | **Tài sản ròng:** 27.927 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 14 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C3
- **Số dư sau lượt:** 1.977 Tr. VNĐ | **Tài sản ròng:** 28.927 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C2)

#### Lượt #128 | Vòng #23 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.173 Tr. VNĐ | **Tài sản ròng:** 22.173 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 38 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Chú Sáu (Cân bằng / Balanced) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 1.466 Tr. VNĐ | **Tài sản ròng:** 21.266 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

#### Lượt #129 | Vòng #23 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.466 Tr. VNĐ | **Tài sản ròng:** 21.266 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 4 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 168 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.421 Tr. VNĐ | **Tài sản ròng:** 22.221 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #24 ===

#### Lượt #130 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.652 Tr. VNĐ | **Tài sản ròng:** 16.352 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 19 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 374 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.278 Tr. VNĐ | **Tài sản ròng:** 15.978 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #131 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.665 Tr. VNĐ | **Tài sản ròng:** 21.465 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 22 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 360 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 2.665 Tr. VNĐ | **Tài sản ròng:** 20.265 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #132 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.460 Tr. VNĐ | **Tài sản ròng:** 30.410 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 20 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 374 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C3
- **Số dư sau lượt:** 926 Tr. VNĐ | **Tài sản ròng:** 30.576 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #133 | Vòng #24 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.253 Tr. VNĐ | **Tài sản ròng:** 23.253 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 13 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Chú Sáu (Cân bằng / Balanced) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 1.613 Tr. VNĐ | **Tài sản ròng:** 21.413 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

#### Lượt #134 | Vòng #24 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.613 Tr. VNĐ | **Tài sản ròng:** 21.413 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.613 Tr. VNĐ | **Tài sản ròng:** 21.413 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #25 ===

#### Lượt #135 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.278 Tr. VNĐ | **Tài sản ròng:** 16.978 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_URBAN_PLANNING]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 1.638 Tr. VNĐ | **Tài sản ròng:** 16.138 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, Quảng Ninh (Hạ Long), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #136 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.123 Tr. VNĐ | **Tài sản ròng:** 20.923 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 31 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Bác Ba (Thực dụng / Aggressive) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 2.483 Tr. VNĐ | **Tài sản ròng:** 20.083 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Điện Lực (EVN), Quảng Ninh (Hạ Long), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #137 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 926 Tr. VNĐ | **Tài sản ròng:** 30.576 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 27 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (500 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 500 Tr. VNĐ ➔ Thu về 1000 Tr. VNĐ (+500 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.426 Tr. VNĐ | **Tài sản ròng:** 31.076 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #138 | Vòng #25 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.071 Tr. VNĐ | **Tài sản ròng:** 22.071 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 21 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 360 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.711 Tr. VNĐ | **Tài sản ròng:** 21.711 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** TP.HCM (Quận 1 - Nguyễn Huệ), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

#### Lượt #139 | Vòng #25 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.711 Tr. VNĐ | **Tài sản ròng:** 21.711 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 31 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (400 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 2400 Tr. VNĐ (+400 Tr.)
- **Tính năng tương tác:** Giao dịch P2P Trade [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Quảng Ninh (Hạ Long)] từ Chú Sáu (Cân bằng / Balanced) với giá 3640 Tr. VNĐ (Nộp thuế chuyển nhượng 182 Tr.)
- **Số dư sau lượt:** 1.471 Tr. VNĐ | **Tài sản ròng:** 21.271 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #26 ===

#### Lượt #140 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.096 Tr. VNĐ | **Tài sản ròng:** 16.796 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 33 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (1000 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 3000 Tr. VNĐ (+1000 Tr.)
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 896 Tr. VNĐ | **Tài sản ròng:** 16.596 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #141 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.941 Tr. VNĐ | **Tài sản ròng:** 20.741 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 37 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 2376 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.065 Tr. VNĐ | **Tài sản ròng:** 18.865 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #142 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.065 Tr. VNĐ | **Tài sản ròng:** 18.865 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 1 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng chân tại [Bà Rịa - Vũng Tàu]: Trả tiền thuê 144 Tr. VNĐ cho Bé Bo (Cạnh tranh / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.921 Tr. VNĐ | **Tài sản ròng:** 18.721 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #143 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.921 Tr. VNĐ | **Tài sản ròng:** 18.721 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 9 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.921 Tr. VNĐ | **Tài sản ròng:** 17.721 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #144 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.786 Tr. VNĐ | **Tài sản ròng:** 31.436 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 38 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.975 Tr. VNĐ | **Tài sản ròng:** 31.625 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #145 | Vòng #26 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.555 Tr. VNĐ | **Tài sản ròng:** 22.355 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 38 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bác Ba (Thực dụng / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 2.687 Tr. VNĐ | **Tài sản ròng:** 22.487 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #27 ===

#### Lượt #146 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.212 Tr. VNĐ | **Tài sản ròng:** 20.912 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 38 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 3.631 Tr. VNĐ | **Tài sản ròng:** 19.331 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #147 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.631 Tr. VNĐ | **Tài sản ròng:** 19.331 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.631 Tr. VNĐ | **Tài sản ròng:** 19.331 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #148 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.921 Tr. VNĐ | **Tài sản ròng:** 17.721 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.921 Tr. VNĐ | **Tài sản ròng:** 17.721 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #149 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.921 Tr. VNĐ | **Tài sản ròng:** 17.721 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 21 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.921 Tr. VNĐ | **Tài sản ròng:** 17.721 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #150 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 3.407 Tr. VNĐ | **Tài sản ròng:** 33.057 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng chân tại [Bình Thuận (Mũi Né)]: Trả tiền thuê 168 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.239 Tr. VNĐ | **Tài sản ròng:** 32.889 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #151 | Vòng #27 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.627 Tr. VNĐ | **Tài sản ròng:** 23.427 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bác Ba (Thực dụng / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 3.813 Tr. VNĐ | **Tài sản ròng:** 23.613 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #28 ===

#### Lượt #152 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.571 Tr. VNĐ | **Tài sản ròng:** 20.271 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng chân tại [Bình Định (Quy Nhơn)]: Trả tiền thuê 4050 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.521 Tr. VNĐ | **Tài sản ròng:** 16.221 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #153 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.475 Tr. VNĐ | **Tài sản ròng:** 19.275 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 28 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Dừng chân tại [Hưng Yên (Văn Giang)]: Trả tiền thuê 360 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.115 Tr. VNĐ | **Tài sản ròng:** 18.915 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #154 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 7.649 Tr. VNĐ | **Tài sản ròng:** 37.299 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 11 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 264 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Thanh Hóa (Sầm Sơn)] (Hoàn trả nợ + 10% phí Kho Bạc: 1210 Tr. VNĐ)
- **Số dư sau lượt:** 6.175 Tr. VNĐ | **Tài sản ròng:** 36.925 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #155 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 6.175 Tr. VNĐ | **Tài sản ròng:** 36.925 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 23 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Tập Đoàn Viễn Thông (Viettel)] (Hoàn trả nợ + 10% phí Kho Bạc: 825 Tr. VNĐ)
- **Số dư sau lượt:** 5.350 Tr. VNĐ | **Tài sản ròng:** 36.850 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #156 | Vòng #28 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.813 Tr. VNĐ | **Tài sản ròng:** 23.613 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.940 Tr. VNĐ | **Tài sản ròng:** 24.740 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #29 ===

#### Lượt #157 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.521 Tr. VNĐ | **Tài sản ròng:** 16.221 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 16 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.521 Tr. VNĐ | **Tài sản ròng:** 16.221 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #158 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.506 Tr. VNĐ | **Tài sản ròng:** 20.306 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 31 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cần Thơ (Cái Răng)]: Trả tiền thuê 2376 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.630 Tr. VNĐ | **Tài sản ròng:** 18.430 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #159 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.350 Tr. VNĐ | **Tài sản ròng:** 36.850 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.665 Tr. VNĐ | **Tài sản ròng:** 33.165 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #160 | Vòng #29 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.940 Tr. VNĐ | **Tài sản ròng:** 24.740 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 2466 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 29
- **Giải cứu tài chính:** Thế chấp BĐS ô 32
- **Số dư sau lượt:** 2.934 Tr. VNĐ | **Tài sản ròng:** 19.834 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** TP.HCM (Quận 1 - Nguyễn Huệ), Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

### === VÒNG ĐẤU #30 ===

#### Lượt #161 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.897 Tr. VNĐ | **Tài sản ròng:** 18.597 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 20 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 360 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bé Bo (Cạnh tranh / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 1.337 Tr. VNĐ | **Tài sản ròng:** 17.037 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf) (C1), Tuyến Cao Tốc Bắc - Nam, Lâm Đồng (Đà Lạt), Cần Thơ (Cái Răng) (C3), An Giang (Châu Đốc) (C3)

#### Lượt #162 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.248 Tr. VNĐ | **Tài sản ròng:** 20.048 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 1 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_MEDIA_CRISIS]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.448 Tr. VNĐ | **Tài sản ròng:** 19.248 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Điện Lực (EVN), Cảng HKQT Nội Bài, TP.HCM (TP. Thủ Đức), Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Bình Thuận (Mũi Né), Nghệ An (TP. Vinh)

#### Lượt #163 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.491 Tr. VNĐ | **Tài sản ròng:** 35.991 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 19 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng tại [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.491 Tr. VNĐ | **Tài sản ròng:** 35.991 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #164 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 4.491 Tr. VNĐ | **Tài sản ròng:** 35.991 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_JUNK_STOCK]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.991 Tr. VNĐ | **Tài sản ròng:** 34.491 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Định (Quy Nhơn) (C3), Tập Đoàn Viễn Thông (Viettel), Ninh Bình (Tràng An), Thanh Hóa (Sầm Sơn), Hưng Yên (Văn Giang), Đà Nẵng (Hải Châu - Sơn Trà) (C3), Thừa Thiên Huế (C3)

#### Lượt #165 | Vòng #30 — Bé Bo (Cạnh tranh / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.874 Tr. VNĐ | **Tài sản ròng:** 20.774 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Dừng chân tại [Tuyến Cao Tốc Bắc - Nam]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Chuộc BĐS thế chấp: [Quảng Ninh (Hạ Long)]
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (TP. Thủ Đức)] từ Chú Sáu (Cân bằng / Balanced) với giá 4550 Tr. VNĐ (Nộp thuế chuyển nhượng 227 Tr.)
- **Chuộc BĐS:** Chuộc lại quyền sở hữu [Quảng Ninh (Hạ Long)] (Hoàn trả nợ + 10% phí Kho Bạc: 1540 Tr. VNĐ)
- **Số dư sau lượt:** 2.371 Tr. VNĐ | **Tài sản ròng:** 20.171 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Quảng Ninh (Hạ Long), Bà Rịa - Vũng Tàu, Cảng HKQT Long Thành, TP.HCM (TP. Thủ Đức), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Cầu Giấy)

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.