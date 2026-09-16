# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (2 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920262 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 2 người chơi.
- **Tổng số lượt đi (Turns):** 72 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **39.915 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 14.615 Tr. VNĐ | 39.915 Tr. VNĐ | 12 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 1.969 Tr. VNĐ | 31.769 Tr. VNĐ | 13 ô | ✓ Hoàn thành |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 55 lần.
- Số giao dịch sang tên thành công: 55 thương vụ.
- Tổng giá trị chuyển nhượng đất: 127.140 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 6.357 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 1 phiên.
- Tổng vốn cọc đầu tư: 2.000 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 4.000 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: 2.000 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 1 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 0 lần.
- Tổng giá trị thanh toán chuộc đất: 0 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_COPYRIGHT | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_MEDIA_CRISIS | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_VENUE_INCIDENT | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_LAND_CHANGE | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_CONCERT_SPONSOR | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_SLOW_BUILD | Thẻ Cơ Hội | 1 lần | 16.7% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_CREDIT_STIMULUS | Thẻ Thị Trường | 1 lần | 20.0% |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 20.0% |
| MC_FUEL_SURGE | Thẻ Thị Trường | 1 lần | 20.0% |
| MC_NIGHT_ECONOMY | Thẻ Thị Trường | 1 lần | 20.0% |
| MC_UTILITY_DOUBLE | Thẻ Thị Trường | 1 lần | 20.0% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 1 lần | 1.4% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 5 lần | 6.9% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 6 lần | 8.3% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 2 lần | 2.8% |
| Cảng HKQT Long Thành | Đặc biệt | 1 lần | 1.4% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 0 lần | 0.0% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 1 lần | 1.4% |
| Cảng HKQT Nội Bài | Đặc biệt | 2 lần | 2.8% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 2 lần | 2.8% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 2 lần | 2.8% |

---

## IV. NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐI TỪ ĐẦU ĐẾN KẾT THÚC (STEP-BY-STEP LOG)

### === VÒNG ĐẤU #1 ===

#### Lượt #1 | Vòng #1 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 25.000 Tr. VNĐ | **Tài sản ròng:** 25.000 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 0 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**)
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 23.000 Tr. VNĐ | **Tài sản ròng:** 23.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #2 | Vòng #1 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 23.000 Tr. VNĐ | **Tài sản ròng:** 23.000 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 23.000 Tr. VNĐ | **Tài sản ròng:** 23.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

#### Lượt #3 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 25.000 Tr. VNĐ | **Tài sản ròng:** 25.000 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_COPYRIGHT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 23.800 Tr. VNĐ | **Tài sản ròng:** 23.800 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #2 ===

#### Lượt #4 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 23.000 Tr. VNĐ | **Tài sản ròng:** 23.000 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 21.200 Tr. VNĐ | **Tài sản ròng:** 23.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Thừa Thiên Huế

#### Lượt #5 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 23.800 Tr. VNĐ | **Tài sản ròng:** 23.800 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 7 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 19.860 Tr. VNĐ | **Tài sản ròng:** 23.260 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Khánh Hòa (Nha Trang)

### === VÒNG ĐẤU #3 ===

#### Lượt #6 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 23.423 Tr. VNĐ | **Tài sản ròng:** 23.423 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 18.683 Tr. VNĐ | **Tài sản ròng:** 22.883 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Ninh Bình (Tràng An)

#### Lượt #7 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.683 Tr. VNĐ | **Tài sản ròng:** 22.883 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CREDIT_STIMULUS]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Chú Sáu (Cân bằng / Balanced) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 16.603 Tr. VNĐ | **Tài sản ròng:** 22.403 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An)

#### Lượt #8 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 24.059 Tr. VNĐ | **Tài sản ròng:** 24.059 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 14 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Từ chối mua [Đà Nẵng (Hải Châu - Sơn Trà)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Chốt đấu giá: Bác Ba (Thực dụng / Aggressive) sở hữu [Đà Nẵng (Hải Châu - Sơn Trà)] giá 1050 Tr. VNĐ
- **Số dư sau lượt:** 24.059 Tr. VNĐ | **Tài sản ròng:** 24.059 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #4 ===

#### Lượt #9 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.553 Tr. VNĐ | **Tài sản ròng:** 23.353 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 33 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 15.258 Tr. VNĐ | **Tài sản ròng:** 23.058 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #10 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 24.059 Tr. VNĐ | **Tài sản ròng:** 24.059 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 19 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Chốt đấu giá: Bác Ba (Thực dụng / Aggressive) sở hữu [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 1350 Tr. VNĐ
- **Số dư sau lượt:** 24.059 Tr. VNĐ | **Tài sản ròng:** 24.059 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #5 ===

#### Lượt #11 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.908 Tr. VNĐ | **Tài sản ròng:** 24.308 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 4 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 12.408 Tr. VNĐ | **Tài sản ròng:** 24.308 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN)

#### Lượt #12 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 24.059 Tr. VNĐ | **Tài sản ròng:** 24.059 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Mua thành công [Cảng HKQT Nội Bài] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 19.719 Tr. VNĐ | **Tài sản ròng:** 23.519 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Cảng HKQT Nội Bài

### === VÒNG ĐẤU #6 ===

#### Lượt #13 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.631 Tr. VNĐ | **Tài sản ròng:** 24.731 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 12 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Mua thành công [Thanh Hóa (Sầm Sơn)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.091 Tr. VNĐ | **Tài sản ròng:** 24.191 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn)

#### Lượt #14 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 21.942 Tr. VNĐ | **Tài sản ròng:** 23.942 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 35 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 21.002 Tr. VNĐ | **Tài sản ròng:** 25.402 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Cảng HKQT Nội Bài, Cần Thơ (Cái Răng)

### === VÒNG ĐẤU #7 ===

#### Lượt #15 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.314 Tr. VNĐ | **Tài sản ròng:** 24.614 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 21 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 9.974 Tr. VNĐ | **Tài sản ròng:** 24.074 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn)

#### Lượt #16 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 23.225 Tr. VNĐ | **Tài sản ròng:** 25.825 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Mua thành công [Đồng Nai (Đại Công Viên Chủ Đề)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 19.885 Tr. VNĐ | **Tài sản ròng:** 25.285 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thừa Thiên Huế, Cảng HKQT Nội Bài, Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #8 ===

#### Lượt #17 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.197 Tr. VNĐ | **Tài sản ròng:** 24.497 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 26 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Nội Bài]: Trả tiền thuê 500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 9.357 Tr. VNĐ | **Tài sản ròng:** 23.457 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn)

#### Lượt #18 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 22.608 Tr. VNĐ | **Tài sản ròng:** 26.208 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 20.108 Tr. VNĐ | **Tài sản ròng:** 25.508 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thừa Thiên Huế, Cảng HKQT Nội Bài, Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #9 ===

#### Lượt #19 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.740 Tr. VNĐ | **Tài sản ròng:** 24.040 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 35 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_MEGA_CONCERT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.380 Tr. VNĐ | **Tài sản ròng:** 24.480 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn)

#### Lượt #20 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 22.451 Tr. VNĐ | **Tài sản ròng:** 26.051 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 19.951 Tr. VNĐ | **Tài sản ròng:** 25.351 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thừa Thiên Huế, Cảng HKQT Nội Bài, Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #10 ===

#### Lượt #21 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 12.763 Tr. VNĐ | **Tài sản ròng:** 25.063 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 8 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.243 Tr. VNĐ | **Tài sản ròng:** 24.343 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn)

#### Lượt #22 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.243 Tr. VNĐ | **Tài sản ròng:** 24.343 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Cần Thơ (Cái Răng)] từ Chú Sáu (Cân bằng / Balanced) với giá 780 Tr. VNĐ (Nộp thuế chuyển nhượng 39 Tr.)
- **Số dư sau lượt:** 9.463 Tr. VNĐ | **Tài sản ròng:** 24.163 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng)

#### Lượt #23 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 23.095 Tr. VNĐ | **Tài sản ròng:** 26.095 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 14 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 20.755 Tr. VNĐ | **Tài sản ròng:** 25.555 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề)

### === VÒNG ĐẤU #11 ===

#### Lượt #24 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.686 Tr. VNĐ | **Tài sản ròng:** 24.586 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_MEDIA_CRISIS]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 8.046 Tr. VNĐ | **Tài sản ròng:** 22.746 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng)

#### Lượt #25 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.046 Tr. VNĐ | **Tài sản ròng:** 22.746 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 22 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Viễn Thông (Viettel)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Chốt đấu giá: Chú Sáu (Cân bằng / Balanced) sở hữu [Tập Đoàn Viễn Thông (Viettel)] giá 800 Tr. VNĐ
- **Số dư sau lượt:** 8.046 Tr. VNĐ | **Tài sản ròng:** 22.746 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng)

#### Lượt #26 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 22.178 Tr. VNĐ | **Tài sản ròng:** 26.678 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 20 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Mua thành công [Quảng Ninh (Hạ Long)] giá 2800 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 17.038 Tr. VNĐ | **Tài sản ròng:** 26.138 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Thừa Thiên Huế, Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #12 ===

#### Lượt #27 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.269 Tr. VNĐ | **Tài sản ròng:** 23.169 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 28 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (Quận 1 - Nguyễn Huệ)] giá 4000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 3.929 Tr. VNĐ | **Tài sản ròng:** 22.629 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #28 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 19.261 Tr. VNĐ | **Tài sản ròng:** 26.561 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 29 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FUEL_SURGE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 17.728 Tr. VNĐ | **Tài sản ròng:** 26.828 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Thừa Thiên Huế, Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #13 ===

#### Lượt #29 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.709 Tr. VNĐ | **Tài sản ròng:** 23.609 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.369 Tr. VNĐ | **Tài sản ròng:** 24.069 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #30 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 19.951 Tr. VNĐ | **Tài sản ròng:** 27.251 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 33 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (TP. Thủ Đức)] giá 3500 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 14.111 Tr. VNĐ | **Tài sản ròng:** 26.711 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Thừa Thiên Huế, Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức)

#### Lượt #31 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.111 Tr. VNĐ | **Tài sản ròng:** 26.711 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Bác Ba (Thực dụng / Aggressive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 12.832 Tr. VNĐ | **Tài sản ròng:** 27.032 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #14 ===

#### Lượt #32 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.790 Tr. VNĐ | **Tài sản ròng:** 26.090 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 7.290 Tr. VNĐ | **Tài sản ròng:** 25.390 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Thừa Thiên Huế, Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #33 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.290 Tr. VNĐ | **Tài sản ròng:** 25.390 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 14 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_VENUE_INCIDENT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Chú Sáu (Cân bằng / Balanced) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 4.010 Tr. VNĐ | **Tài sản ròng:** 23.710 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #34 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.010 Tr. VNĐ | **Tài sản ròng:** 23.710 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 22 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.410 Tr. VNĐ | **Tài sản ròng:** 23.710 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #35 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 17.191 Tr. VNĐ | **Tài sản ròng:** 27.991 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 15.982 Tr. VNĐ | **Tài sản ròng:** 28.582 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Thừa Thiên Huế, Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #15 ===

#### Lượt #36 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.764 Tr. VNĐ | **Tài sản ròng:** 25.264 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Hoàn Kiếm)] giá 3200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.564 Tr. VNĐ | **Tài sản ròng:** 25.264 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

#### Lượt #37 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.982 Tr. VNĐ | **Tài sản ròng:** 28.582 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Bác Ba (Thực dụng / Aggressive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 13.902 Tr. VNĐ | **Tài sản ròng:** 28.102 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #16 ===

#### Lượt #38 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.540 Tr. VNĐ | **Tài sản ròng:** 25.640 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 34 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_LAND_CHANGE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.740 Tr. VNĐ | **Tài sản ròng:** 24.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

#### Lượt #39 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.740 Tr. VNĐ | **Tài sản ròng:** 24.840 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 36 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_NIGHT_ECONOMY]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.740 Tr. VNĐ | **Tài sản ròng:** 25.840 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

#### Lượt #40 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.902 Tr. VNĐ | **Tài sản ròng:** 28.102 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 20 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 11.501 Tr. VNĐ | **Tài sản ròng:** 28.101 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #17 ===

#### Lượt #41 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.047 Tr. VNĐ | **Tài sản ròng:** 27.747 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 2 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Mua thành công [Bà Rịa - Vũng Tàu] giá 1200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.507 Tr. VNĐ | **Tài sản ròng:** 27.207 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Thừa Thiên Huế, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu

#### Lượt #42 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.724 Tr. VNĐ | **Tài sản ròng:** 28.524 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 26 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 11.384 Tr. VNĐ | **Tài sản ròng:** 27.984 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #18 ===

#### Lượt #43 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.730 Tr. VNĐ | **Tài sản ròng:** 27.630 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 9 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng chân tại [Khánh Hòa (Nha Trang)]: Trả tiền thuê 160 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.230 Tr. VNĐ | **Tài sản ròng:** 26.930 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Thừa Thiên Huế, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu

#### Lượt #44 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.767 Tr. VNĐ | **Tài sản ròng:** 28.567 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 12.070 Tr. VNĐ | **Tài sản ròng:** 28.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức)

### === VÒNG ĐẤU #19 ===

#### Lượt #45 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.572 Tr. VNĐ | **Tài sản ròng:** 28.472 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 5.232 Tr. VNĐ | **Tài sản ròng:** 27.932 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Thừa Thiên Huế, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu

#### Lượt #46 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.293 Tr. VNĐ | **Tài sản ròng:** 29.093 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 4 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.553 Tr. VNĐ | **Tài sản ròng:** 28.553 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #20 ===

#### Lượt #47 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.455 Tr. VNĐ | **Tài sản ròng:** 28.355 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 21 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 336 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.779 Tr. VNĐ | **Tài sản ròng:** 27.479 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Thừa Thiên Huế, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu

#### Lượt #48 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.112 Tr. VNĐ | **Tài sản ròng:** 29.312 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 11 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 240 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.532 Tr. VNĐ | **Tài sản ròng:** 28.532 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #21 ===

#### Lượt #49 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.242 Tr. VNĐ | **Tài sản ròng:** 28.142 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 4.302 Tr. VNĐ | **Tài sản ròng:** 27.002 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Thừa Thiên Huế, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu

#### Lượt #50 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.755 Tr. VNĐ | **Tài sản ròng:** 28.955 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 19 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_SLOW_BUILD]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.415 Tr. VNĐ | **Tài sản ròng:** 28.415 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #22 ===

#### Lượt #51 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.525 Tr. VNĐ | **Tài sản ròng:** 27.425 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 36 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 5.185 Tr. VNĐ | **Tài sản ròng:** 27.885 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Thừa Thiên Huế, Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu

#### Lượt #52 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.638 Tr. VNĐ | **Tài sản ròng:** 28.838 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 22 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.298 Tr. VNĐ | **Tài sản ròng:** 28.298 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

#### Lượt #53 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.298 Tr. VNĐ | **Tài sản ròng:** 28.298 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 28 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 384 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Đà Nẵng (Hải Châu - Sơn Trà)] từ Bác Ba (Thực dụng / Aggressive) với giá 2600 Tr. VNĐ (Nộp thuế chuyển nhượng 130 Tr.)
- **Số dư sau lượt:** 8.416 Tr. VNĐ | **Tài sản ròng:** 28.416 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #23 ===

#### Lượt #54 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.364 Tr. VNĐ | **Tài sản ròng:** 30.264 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 7.224 Tr. VNĐ | **Tài sản ròng:** 29.724 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Thừa Thiên Huế, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #55 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.224 Tr. VNĐ | **Tài sản ròng:** 29.724 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 16 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 432 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Chú Sáu (Cân bằng / Balanced) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 4.712 Tr. VNĐ | **Tài sản ròng:** 28.812 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn)

#### Lượt #56 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.047 Tr. VNĐ | **Tài sản ròng:** 29.647 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 34 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.303 Tr. VNĐ | **Tài sản ròng:** 28.703 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Thừa Thiên Huế, Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

#### Lượt #57 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.303 Tr. VNĐ | **Tài sản ròng:** 28.703 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 4 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 320 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Bác Ba (Thực dụng / Aggressive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 9.069 Tr. VNĐ | **Tài sản ròng:** 29.069 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #24 ===

#### Lượt #58 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 10.397 Tr. VNĐ | **Tài sản ròng:** 31.097 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 24 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Cầu Giấy)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 5.057 Tr. VNĐ | **Tài sản ròng:** 30.557 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Thừa Thiên Huế, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Hà Nội (Cầu Giấy)

#### Lượt #59 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.292 Tr. VNĐ | **Tài sản ròng:** 29.492 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 216 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 8.736 Tr. VNĐ | **Tài sản ròng:** 28.736 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #25 ===

#### Lượt #60 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.496 Tr. VNĐ | **Tài sản ròng:** 31.196 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 32 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 6.156 Tr. VNĐ | **Tài sản ròng:** 31.656 Tr. VNĐ
- **Danh mục BĐS sở hữu (12):** Thừa Thiên Huế, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Hà Nội (Cầu Giấy)

#### Lượt #61 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.959 Tr. VNĐ | **Tài sản ròng:** 29.159 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 18 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Từ chối mua [Tuyến Cao Tốc Bắc - Nam], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Chốt đấu giá: Bác Ba (Thực dụng / Aggressive) sở hữu [Tuyến Cao Tốc Bắc - Nam] giá 1050 Tr. VNĐ
- **Số dư sau lượt:** 12.027 Tr. VNĐ | **Tài sản ròng:** 30.227 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #26 ===

#### Lượt #62 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.174 Tr. VNĐ | **Tài sản ròng:** 33.674 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 1 ➔ Ô 9 (**Bà Rịa - Vũng Tàu**)
- **Sự kiện ô:** Dừng tại [Bà Rịa - Vũng Tàu]
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Chú Sáu (Cân bằng / Balanced) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 4.094 Tr. VNĐ | **Tài sản ròng:** 33.194 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Hà Nội (Cầu Giấy), Tuyến Cao Tốc Bắc - Nam

#### Lượt #63 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.094 Tr. VNĐ | **Tài sản ròng:** 33.194 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 9 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_UTILITY_DOUBLE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.094 Tr. VNĐ | **Tài sản ròng:** 33.194 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Hà Nội (Cầu Giấy), Tuyến Cao Tốc Bắc - Nam

#### Lượt #64 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 14.003 Tr. VNĐ | **Tài sản ròng:** 30.603 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 25 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Hoàn Kiếm)]: Trả tiền thuê 384 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 11.279 Tr. VNĐ | **Tài sản ròng:** 29.679 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Thừa Thiên Huế, Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #27 ===

#### Lượt #65 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 6.701 Tr. VNĐ | **Tài sản ròng:** 34.001 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 17 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.501 Tr. VNĐ | **Tài sản ròng:** 34.001 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Khánh Hòa (Nha Trang), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Hà Nội (Cầu Giấy), Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh)

#### Lượt #66 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.279 Tr. VNĐ | **Tài sản ròng:** 29.679 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 34 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Bác Ba (Thực dụng / Aggressive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 10.082 Tr. VNĐ | **Tài sản ròng:** 30.082 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #28 ===

#### Lượt #67 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.587 Tr. VNĐ | **Tài sản ròng:** 35.487 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 23 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 5.247 Tr. VNĐ | **Tài sản ròng:** 34.947 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Thừa Thiên Huế, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Hà Nội (Cầu Giấy), Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh)

#### Lượt #68 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.305 Tr. VNĐ | **Tài sản ròng:** 30.505 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 9.965 Tr. VNĐ | **Tài sản ròng:** 29.965 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né)

### === VÒNG ĐẤU #29 ===

#### Lượt #69 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.470 Tr. VNĐ | **Tài sản ròng:** 35.370 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 34 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Lãi đậm thị trường (2000 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 2000 Tr. VNĐ ➔ Thu về 4000 Tr. VNĐ (+2000 Tr.)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 7.130 Tr. VNĐ | **Tài sản ròng:** 36.830 Tr. VNĐ
- **Danh mục BĐS sở hữu (14):** Thừa Thiên Huế, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Hà Nội (Cầu Giấy), Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh)

#### Lượt #70 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 12.188 Tr. VNĐ | **Tài sản ròng:** 30.388 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1
- **Số dư sau lượt:** 6.468 Tr. VNĐ | **Tài sản ròng:** 30.068 Tr. VNĐ
- **Danh mục BĐS sở hữu (11):** Thừa Thiên Huế, Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C1), Lâm Đồng (Đà Lạt) (C1)

### === VÒNG ĐẤU #30 ===

#### Lượt #71 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 9.353 Tr. VNĐ | **Tài sản ròng:** 37.253 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 38 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Từ chối mua [Cảng HKQT Long Thành], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Chốt đấu giá: Chú Sáu (Cân bằng / Balanced) sở hữu [Cảng HKQT Long Thành] giá 1050 Tr. VNĐ
- **Số dư sau lượt:** 10.353 Tr. VNĐ | **Tài sản ròng:** 38.253 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Tập Đoàn Điện Lực (EVN), Thanh Hóa (Sầm Sơn), Cần Thơ (Cái Răng), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bà Rịa - Vũng Tàu, Bình Định (Quy Nhơn), Hà Nội (Cầu Giấy), Tuyến Cao Tốc Bắc - Nam, Nghệ An (TP. Vinh)

#### Lượt #72 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.418 Tr. VNĐ | **Tài sản ròng:** 31.018 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 13 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế]
- **Tính năng tương tác:** Giao dịch P2P Trade [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] từ Bác Ba (Thực dụng / Aggressive) với giá 3380 Tr. VNĐ (Nộp thuế chuyển nhượng 169 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2
- **Số dư sau lượt:** 1.969 Tr. VNĐ | **Tài sản ròng:** 31.769 Tr. VNĐ
- **Danh mục BĐS sở hữu (13):** Thừa Thiên Huế, Khánh Hòa (Nha Trang) (C2), Ninh Bình (Tràng An), Đà Nẵng (Hải Châu - Sơn Trà), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Cảng HKQT Nội Bài, Đồng Nai (Đại Công Viên Chủ Đề), Tập Đoàn Viễn Thông (Viettel), Quảng Ninh (Hạ Long), TP.HCM (TP. Thủ Đức), Bình Thuận (Mũi Né) (C1), Lâm Đồng (Đà Lạt) (C1), Cảng HKQT Long Thành

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.