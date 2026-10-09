# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (2 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920262 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 2 người chơi.
- **Tổng số lượt đi (Turns):** 73 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **24.159 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 759 Tr. VNĐ | 24.159 Tr. VNĐ | 10 ô | 🏆 Vô địch |
| 2 | Chú Sáu (Cân bằng / Balanced) | Balanced | 475 Tr. VNĐ | 23.875 Tr. VNĐ | 7 ô | ✓ Hoàn thành |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 52 lần.
- Số giao dịch sang tên thành công: 27 thương vụ.
- Tổng giá trị chuyển nhượng đất: 64.480 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 3.224 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 1 phiên.
- Tổng vốn cọc đầu tư: 1.000 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 750 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: -250 Tr. VNĐ.

### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)
- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: 3 lần.
- Số lần sử dụng Thẻ Ngoại Giao miễn phí: 0 lần.

### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)
- Số lượt chuộc lại quyền sở hữu: 0 lần.
- Tổng giá trị thanh toán chuộc đất: 0 Tr. VNĐ.

---

## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)

### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)

| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| CC_COPYRIGHT | Thẻ Cơ Hội | 1 lần | 14.3% |
| CC_MEDIA_CRISIS | Thẻ Cơ Hội | 1 lần | 14.3% |
| CC_VENUE_INCIDENT | Thẻ Cơ Hội | 1 lần | 14.3% |
| CC_LAND_CHANGE | Thẻ Cơ Hội | 1 lần | 14.3% |
| CC_CONCERT_SPONSOR | Thẻ Cơ Hội | 1 lần | 14.3% |
| CC_SLOW_BUILD | Thẻ Cơ Hội | 1 lần | 14.3% |
| CC_LAND_RECLAIM | Thẻ Cơ Hội | 1 lần | 14.3% |

### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)

| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |
| :--- | :--- | :---: | :---: |
| MC_CREDIT_STIMULUS | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_MEGA_CONCERT | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_FUEL_SURGE | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_NIGHT_ECONOMY | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_UTILITY_DOUBLE | Thẻ Thị Trường | 1 lần | 16.7% |
| MC_RATE_HIKE | Thẻ Thị Trường | 1 lần | 16.7% |

### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt

| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |
| :--- | :--- | :---: | :---: |
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 2 lần | 2.7% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 8 lần | 11.0% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 4 lần | 5.5% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 1 lần | 1.4% |
| Cảng HKQT Long Thành | Đặc biệt | 0 lần | 0.0% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 3 lần | 4.1% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 0 lần | 0.0% |
| Cảng HKQT Nội Bài | Đặc biệt | 0 lần | 0.0% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 2 lần | 2.7% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 0 lần | 0.0% |

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
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 24 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Chú Sáu (Cân bằng / Balanced) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 16.603 Tr. VNĐ | **Tài sản ròng:** 22.403 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An)

#### Lượt #8 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 24.059 Tr. VNĐ | **Tài sản ròng:** 24.059 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 14 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_MEDIA_CRISIS]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 20.919 Tr. VNĐ | **Tài sản ròng:** 22.719 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Thừa Thiên Huế

### === VÒNG ĐẤU #4 ===

#### Lượt #9 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 18.826 Tr. VNĐ | **Tài sản ròng:** 22.826 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 13.986 Tr. VNĐ | **Tài sản ròng:** 21.786 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép

#### Lượt #10 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 23.142 Tr. VNĐ | **Tài sản ròng:** 23.142 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 22 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CREDIT_STIMULUS]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 20.802 Tr. VNĐ | **Tài sản ròng:** 22.602 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Thừa Thiên Huế

### === VÒNG ĐẤU #5 ===

#### Lượt #11 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 16.209 Tr. VNĐ | **Tài sản ròng:** 22.209 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 15 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 11.669 Tr. VNĐ | **Tài sản ròng:** 21.669 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh)

#### Lượt #12 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 23.025 Tr. VNĐ | **Tài sản ròng:** 23.025 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 33 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_MEGA_CONCERT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 22.685 Tr. VNĐ | **Tài sản ròng:** 24.485 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Thừa Thiên Huế

### === VÒNG ĐẤU #6 ===

#### Lượt #13 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.892 Tr. VNĐ | **Tài sản ròng:** 22.092 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 6 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FUEL_SURGE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 11.302 Tr. VNĐ | **Tài sản ròng:** 21.302 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh)

#### Lượt #14 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 24.408 Tr. VNĐ | **Tài sản ròng:** 24.408 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 20.668 Tr. VNĐ | **Tài sản ròng:** 23.868 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #7 ===

#### Lượt #15 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.525 Tr. VNĐ | **Tài sản ròng:** 21.725 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 17 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Mua thành công [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 8.585 Tr. VNĐ | **Tài sản ròng:** 21.185 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)

#### Lượt #16 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 22.891 Tr. VNĐ | **Tài sản ròng:** 24.291 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 13 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 220 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 20.331 Tr. VNĐ | **Tài sản ròng:** 23.531 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #8 ===

#### Lượt #17 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 11.028 Tr. VNĐ | **Tài sản ròng:** 21.828 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 26 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Mua thành công [Hà Nội (Cầu Giấy)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 5.688 Tr. VNĐ | **Tài sản ròng:** 21.288 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy)

#### Lượt #18 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.688 Tr. VNĐ | **Tài sản ròng:** 21.288 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 32 ➔ Ô 0 (**Khởi Hành (GO)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Lâm Đồng (Đà Lạt)] từ Chú Sáu (Cân bằng / Balanced) với giá 1820 Tr. VNĐ (Nộp thuế chuyển nhượng 91 Tr.)
- **Số dư sau lượt:** 4.868 Tr. VNĐ | **Tài sản ròng:** 21.868 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy)

#### Lượt #19 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.868 Tr. VNĐ | **Tài sản ròng:** 21.868 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_VENUE_INCIDENT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.668 Tr. VNĐ | **Tài sản ròng:** 20.668 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy)

#### Lượt #20 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 24.283 Tr. VNĐ | **Tài sản ròng:** 24.283 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 23 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Mua thành công [Quảng Ninh (Hạ Long)] giá 2800 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 19.143 Tr. VNĐ | **Tài sản ròng:** 23.743 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #9 ===

#### Lượt #21 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.891 Tr. VNĐ | **Tài sản ròng:** 21.091 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 7 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng tại [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 3.551 Tr. VNĐ | **Tài sản ròng:** 20.551 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy)

#### Lượt #22 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 21.366 Tr. VNĐ | **Tài sản ròng:** 24.166 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 29 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Thua lỗ thị trường (-250 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 1000 Tr. VNĐ ➔ Thu về 750 Tr. VNĐ (-250 Tr.)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 18.776 Tr. VNĐ | **Tài sản ròng:** 23.376 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Thừa Thiên Huế, Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #10 ===

#### Lượt #23 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.774 Tr. VNĐ | **Tài sản ròng:** 20.974 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 13 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Mua thành công [Đà Nẵng (Hải Châu - Sơn Trà)] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.774 Tr. VNĐ | **Tài sản ròng:** 20.974 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #24 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 18.776 Tr. VNĐ | **Tài sản ròng:** 23.376 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 38 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Khánh Hòa (Nha Trang)] từ Bác Ba (Thực dụng / Aggressive) với giá 2080 Tr. VNĐ (Nộp thuế chuyển nhượng 104 Tr.)
- **Số dư sau lượt:** 16.696 Tr. VNĐ | **Tài sản ròng:** 22.896 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #11 ===

#### Lượt #25 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.750 Tr. VNĐ | **Tài sản ròng:** 21.350 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 19 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 3.130 Tr. VNĐ | **Tài sản ròng:** 20.530 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà)

#### Lượt #26 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.130 Tr. VNĐ | **Tài sản ròng:** 20.530 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 29 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 3.530 Tr. VNĐ | **Tài sản ròng:** 21.530 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Thừa Thiên Huế, Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà), Cần Thơ (Cái Răng)

#### Lượt #27 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.530 Tr. VNĐ | **Tài sản ròng:** 21.530 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 1 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Mua thành công [Đồng Nai (Đại Công Viên Chủ Đề)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.530 Tr. VNĐ | **Tài sản ròng:** 21.530 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế, Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #28 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 19.199 Tr. VNĐ | **Tài sản ròng:** 23.599 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 16.859 Tr. VNĐ | **Tài sản ròng:** 23.059 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #12 ===

#### Lượt #29 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.753 Tr. VNĐ | **Tài sản ròng:** 21.953 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.753 Tr. VNĐ | **Tài sản ròng:** 21.953 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Ninh Bình (Tràng An), Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #30 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 16.859 Tr. VNĐ | **Tài sản ròng:** 23.059 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_NIGHT_ECONOMY]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 13.339 Tr. VNĐ | **Tài sản ròng:** 21.939 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Quảng Ninh (Hạ Long)

### === VÒNG ĐẤU #13 ===

#### Lượt #31 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.717 Tr. VNĐ | **Tài sản ròng:** 22.517 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 15 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 240 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 5.137 Tr. VNĐ | **Tài sản ròng:** 21.737 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Thừa Thiên Huế, Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #32 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.802 Tr. VNĐ | **Tài sản ròng:** 22.602 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 17 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Mua thành công [Kiên Giang (Phú Quốc - Grand World)] giá 2600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Bác Ba (Thực dụng / Aggressive) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Số dư sau lượt:** 10.862 Tr. VNĐ | **Tài sản ròng:** 22.062 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #14 ===

#### Lượt #33 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.360 Tr. VNĐ | **Tài sản ròng:** 22.160 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 24 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Mua thành công [Hưng Yên (Văn Giang)] giá 3000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.360 Tr. VNĐ | **Tài sản ròng:** 22.160 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng Nước Sâu Cái Mép, Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang)

#### Lượt #34 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 10.862 Tr. VNĐ | **Tài sản ròng:** 22.062 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 27 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Nghệ An (TP. Vinh)] từ Bác Ba (Thực dụng / Aggressive) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 8.002 Tr. VNĐ | **Tài sản ròng:** 21.402 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #15 ===

#### Lượt #35 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.077 Tr. VNĐ | **Tài sản ròng:** 22.677 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 31 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Mua thành công [TP.HCM (Quận 1 - Nguyễn Huệ)] giá 4000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.077 Tr. VNĐ | **Tài sản ròng:** 22.677 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ)

#### Lượt #36 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.002 Tr. VNĐ | **Tài sản ròng:** 21.402 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng tại [Thừa Thiên Huế]
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Giao dịch P2P Trade [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Lâm Đồng (Đà Lạt)] từ Bác Ba (Thực dụng / Aggressive) với giá 1820 Tr. VNĐ (Nộp thuế chuyển nhượng 91 Tr.)
- **Số dư sau lượt:** 5.682 Tr. VNĐ | **Tài sản ròng:** 20.482 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #16 ===

#### Lượt #37 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.806 Tr. VNĐ | **Tài sản ròng:** 23.006 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.806 Tr. VNĐ | **Tài sản ròng:** 24.006 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Hà Nội (Cầu Giấy), Đà Nẵng (Hải Châu - Sơn Trà), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #38 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.682 Tr. VNĐ | **Tài sản ròng:** 20.482 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 18 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Dừng chân tại [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Hà Nội (Cầu Giấy)] từ Bác Ba (Thực dụng / Aggressive) với giá 3900 Tr. VNĐ (Nộp thuế chuyển nhượng 195 Tr.)
- **Số dư sau lượt:** 1.470 Tr. VNĐ | **Tài sản ròng:** 19.270 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #39 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.470 Tr. VNĐ | **Tài sản ròng:** 19.270 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 26 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_UTILITY_DOUBLE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.070 Tr. VNĐ | **Tài sản ròng:** 18.870 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #17 ===

#### Lượt #40 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.423 Tr. VNĐ | **Tài sản ròng:** 24.623 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 6 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Dừng chân tại [Lâm Đồng (Đà Lạt)]: Trả tiền thuê 140 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 8.283 Tr. VNĐ | **Tài sản ròng:** 24.483 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #41 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.210 Tr. VNĐ | **Tài sản ròng:** 19.010 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 200 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.010 Tr. VNĐ | **Tài sản ròng:** 18.810 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #18 ===

#### Lượt #42 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.483 Tr. VNĐ | **Tài sản ròng:** 24.683 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 13 ➔ Ô 20 (**Nghỉ Dưỡng Miễn Phí**)
- **Sự kiện ô:** Dừng tại [Nghỉ Dưỡng Miễn Phí]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 8.483 Tr. VNĐ | **Tài sản ròng:** 24.683 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #43 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.010 Tr. VNĐ | **Tài sản ròng:** 18.810 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.890 Tr. VNĐ | **Tài sản ròng:** 19.690 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #19 ===

#### Lượt #44 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.603 Tr. VNĐ | **Tài sản ròng:** 24.803 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 20 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 8.603 Tr. VNĐ | **Tài sản ròng:** 24.803 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #45 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.890 Tr. VNĐ | **Tài sản ròng:** 19.690 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.890 Tr. VNĐ | **Tài sản ròng:** 19.690 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #46 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.890 Tr. VNĐ | **Tài sản ròng:** 19.690 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Dừng tại [Khánh Hòa (Nha Trang)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.890 Tr. VNĐ | **Tài sản ròng:** 19.690 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Thừa Thiên Huế, Khánh Hòa (Nha Trang), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #20 ===

#### Lượt #47 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 8.603 Tr. VNĐ | **Tài sản ròng:** 24.803 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Mua thành công [Bình Định (Quy Nhơn)] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay
- **Tính năng tương tác:** Giao dịch P2P Trade [Thừa Thiên Huế]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Thừa Thiên Huế] từ Chú Sáu (Cân bằng / Balanced) với giá 2340 Tr. VNĐ (Nộp thuế chuyển nhượng 117 Tr.)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Đà Nẵng (Hải Châu - Sơn Trà)] lên C1
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C1
- **Số dư sau lượt:** 843 Tr. VNĐ | **Tài sản ròng:** 23.443 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C1), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C1)

#### Lượt #48 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.113 Tr. VNĐ | **Tài sản ròng:** 20.113 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 14 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_LAND_CHANGE]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.613 Tr. VNĐ | **Tài sản ròng:** 20.413 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #21 ===

#### Lượt #49 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 843 Tr. VNĐ | **Tài sản ròng:** 23.443 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 16 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 374 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 469 Tr. VNĐ | **Tài sản ròng:** 23.069 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C1), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C1)

#### Lượt #50 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.987 Tr. VNĐ | **Tài sản ròng:** 20.787 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 22 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng tại [Kiên Giang (Phú Quốc - Grand World)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.987 Tr. VNĐ | **Tài sản ròng:** 20.787 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World)

### === VÒNG ĐẤU #22 ===

#### Lượt #51 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 469 Tr. VNĐ | **Tài sản ròng:** 23.069 Tr. VNĐ
- **Xúc xắc:** [3, 4] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Định (Quy Nhơn)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Thừa Thiên Huế] lên C2 (Biệt thự)
- **Giải cứu tài chính:** Thế chấp BĐS ô 31
- **Giải cứu tài chính:** Thế chấp BĐS ô 26
- **Số dư sau lượt:** 749 Tr. VNĐ | **Tài sản ròng:** 24.149 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #52 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.337 Tr. VNĐ | **Tài sản ròng:** 22.337 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.337 Tr. VNĐ | **Tài sản ròng:** 22.337 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #23 ===

#### Lượt #53 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 749 Tr. VNĐ | **Tài sản ròng:** 24.149 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 34 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 999 Tr. VNĐ | **Tài sản ròng:** 24.399 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #54 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 999 Tr. VNĐ | **Tài sản ròng:** 24.399 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 4 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 999 Tr. VNĐ | **Tài sản ròng:** 24.399 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #55 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 999 Tr. VNĐ | **Tài sản ròng:** 24.399 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 10 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Dừng tại [Bình Định (Quy Nhơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 999 Tr. VNĐ | **Tài sản ròng:** 24.399 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #56 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.337 Tr. VNĐ | **Tài sản ròng:** 22.337 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 34 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_RATE_HIKE]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.837 Tr. VNĐ | **Tài sản ròng:** 22.837 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #24 ===

#### Lượt #57 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 999 Tr. VNĐ | **Tài sản ròng:** 24.399 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 16 ➔ Ô 22 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 399 Tr. VNĐ | **Tài sản ròng:** 23.799 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #58 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.837 Tr. VNĐ | **Tài sản ròng:** 22.837 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 2 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_SLOW_BUILD]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.237 Tr. VNĐ | **Tài sản ròng:** 22.237 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang) (C1), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

### === VÒNG ĐẤU #25 ===

#### Lượt #59 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 399 Tr. VNĐ | **Tài sản ròng:** 23.799 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 22 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Dừng tại [Sàn Giao Dịch Chứng Khoán (HOSE)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 399 Tr. VNĐ | **Tài sản ròng:** 23.799 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #60 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.237 Tr. VNĐ | **Tài sản ròng:** 22.237 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 7 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Mua thành công [Bình Thuận (Mũi Né)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C1
- **Số dư sau lượt:** 207 Tr. VNĐ | **Tài sản ròng:** 19.907 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang) (C1), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt) (C1), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né)

#### Lượt #61 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 207 Tr. VNĐ | **Tài sản ròng:** 19.907 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 207 Tr. VNĐ | **Tài sản ròng:** 19.907 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang) (C1), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt) (C1), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né)

#### Lượt #62 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 207 Tr. VNĐ | **Tài sản ròng:** 19.907 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 11 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Dừng tại [Bình Thuận (Mũi Né)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C1 (Shophouse)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C2 (Biệt thự)
- **Nâng cấp BĐS:** Nâng cấp [Bình Thuận (Mũi Né)] lên C3 (Resort/Khách sạn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 1650 Tr. VNĐ
- **Giải cứu tài chính:** Thế chấp BĐS ô 34
- **Giải cứu tài chính:** Thế chấp BĐS ô 32
- **Giải cứu tài chính:** Thế chấp BĐS ô 29
- **Giải cứu tài chính:** Thế chấp BĐS ô 27
- **Số dư sau lượt:** 617 Tr. VNĐ | **Tài sản ròng:** 21.717 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang) (C2), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt) (C2), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né) (C3)

### === VÒNG ĐẤU #26 ===

#### Lượt #63 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 399 Tr. VNĐ | **Tài sản ròng:** 23.799 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 38 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 24.159 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #64 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 617 Tr. VNĐ | **Tài sản ròng:** 21.717 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 11 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Từ chối mua [Thanh Hóa (Sầm Sơn)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Thanh Hóa (Sầm Sơn)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 617 Tr. VNĐ | **Tài sản ròng:** 21.717 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Khánh Hòa (Nha Trang) (C2), Nghệ An (TP. Vinh), Lâm Đồng (Đà Lạt) (C2), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né) (C3)

### === VÒNG ĐẤU #27 ===

#### Lượt #65 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 24.159 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Điện Lực (EVN)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Tập Đoàn Điện Lực (EVN)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 24.159 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #66 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 617 Tr. VNĐ | **Tài sản ròng:** 21.717 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 29 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_LAND_RECLAIM]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Khánh Hòa (Nha Trang)] lên C3
- **Nâng cấp BĐS:** Nâng cấp [Lâm Đồng (Đà Lạt)] lên C3
- **Số dư sau lượt:** 317 Tr. VNĐ | **Tài sản ròng:** 23.717 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C3), Lâm Đồng (Đà Lạt) (C3), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né) (C3)

### === VÒNG ĐẤU #28 ===

#### Lượt #67 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 24.159 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 12 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 24.159 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #68 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 317 Tr. VNĐ | **Tài sản ròng:** 23.717 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 36 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 475 Tr. VNĐ | **Tài sản ròng:** 23.875 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C3), Lâm Đồng (Đà Lạt) (C3), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né) (C3)

#### Lượt #69 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 475 Tr. VNĐ | **Tài sản ròng:** 23.875 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 4 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Từ chối mua [Tập Đoàn Điện Lực (EVN)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Tập Đoàn Điện Lực (EVN)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 475 Tr. VNĐ | **Tài sản ròng:** 23.875 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C3), Lâm Đồng (Đà Lạt) (C3), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né) (C3)

### === VÒNG ĐẤU #29 ===

#### Lượt #70 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 24.159 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 15 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Từ chối mua [Thanh Hóa (Sầm Sơn)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Thanh Hóa (Sầm Sơn)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 24.159 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #71 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 475 Tr. VNĐ | **Tài sản ròng:** 23.875 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 12 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Từ chối mua [Ninh Bình (Tràng An)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Ninh Bình (Tràng An)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 475 Tr. VNĐ | **Tài sản ròng:** 23.875 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C3), Lâm Đồng (Đà Lạt) (C3), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né) (C3)

### === VÒNG ĐẤU #30 ===

#### Lượt #72 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 24.159 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 21 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 759 Tr. VNĐ | **Tài sản ròng:** 24.159 Tr. VNĐ
- **Danh mục BĐS sở hữu (10):** Thừa Thiên Huế (C2), Cảng Nước Sâu Cái Mép, Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm), Đà Nẵng (Hải Châu - Sơn Trà) (C1), Cần Thơ (Cái Răng), Đồng Nai (Đại Công Viên Chủ Đề), Hưng Yên (Văn Giang), TP.HCM (Quận 1 - Nguyễn Huệ), Bình Dương (Tổ Hợp Thể Thao & Golf), Bình Định (Quy Nhơn) (C2)

#### Lượt #73 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 475 Tr. VNĐ | **Tài sản ròng:** 23.875 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 475 Tr. VNĐ | **Tài sản ròng:** 23.875 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Khánh Hòa (Nha Trang) (C3), Lâm Đồng (Đà Lạt) (C3), Hà Nội (Cầu Giấy), Quảng Ninh (Hạ Long), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Bình Thuận (Mũi Né) (C3)

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.