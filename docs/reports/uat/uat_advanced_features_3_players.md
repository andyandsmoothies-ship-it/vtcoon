# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (3 NGƯỜI CHƠI)
DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026
NGÀY THỰC HIỆN: 11/09/2026 | SEED: 9920263 | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT

---

## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN

- **Số lượng người chơi:** 3 người chơi.
- **Tổng số lượt đi (Turns):** 103 lượt.
- **Số vòng thi đấu (Rounds):** 31 vòng.
- **Điều kiện kết thúc:** ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth).
- **Nhà Vô Địch Chung Cuộc:** **Bác Ba (Thực dụng / Aggressive)** (Tổng tài sản ròng: **19.670 Tr. VNĐ**).

### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)

| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | Bác Ba (Thực dụng / Aggressive) | Aggressive | 470 Tr. VNĐ | 19.670 Tr. VNĐ | 9 ô | 🏆 Vô địch |
| 2 | Cô Tư (Thận trọng / Passive) | Passive | 157 Tr. VNĐ | 14.357 Tr. VNĐ | 4 ô | ✓ Hoàn thành |
| 3 | Chú Sáu (Cân bằng / Balanced) | Balanced | 569 Tr. VNĐ | 11.369 Tr. VNĐ | 8 ô | ✓ Hoàn thành |

---

## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO

### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)
- Số đề nghị đàm phán phát động: 23 lần.
- Số giao dịch sang tên thành công: 23 thương vụ.
- Tổng giá trị chuyển nhượng đất: 41.600 Tr. VNĐ.
- Thuế chuyển nhượng nộp Kho Bạc (5%): 2.080 Tr. VNĐ.

### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)
- Số phiên tham gia đầu tư cổ phiếu: 2 phiên.
- Tổng vốn cọc đầu tư: 2.000 Tr. VNĐ.
- Tổng tiền thu về từ thị trường chứng khoán: 600 Tr. VNĐ.
- Lợi nhuận ròng từ sàn HOSE: -1.400 Tr. VNĐ.

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
| CC_JUNK_STOCK | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_STOCK_PROFIT | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_CONTRACT_PENALTY | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_CONCERT_SPONSOR | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_SLOW_BUILD | Thẻ Cơ Hội | 1 lần | 16.7% |
| CC_FREE_CREDIT | Thẻ Cơ Hội | 1 lần | 16.7% |

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
| Sàn Giao Dịch Chứng Khoán (HOSE) | Đặc biệt | 2 lần | 1.9% |
| Trạm Kiểm Toán & Thanh Tra | Đặc biệt | 13 lần | 12.6% |
| Lệnh Thanh Tra Thuế | Đặc biệt | 0 lần | 0.0% |
| Lệ Phí Đăng Ký Đất Đai | Đặc biệt | 2 lần | 1.9% |
| Nghỉ Dưỡng Miễn Phí | Đặc biệt | 0 lần | 0.0% |
| Cảng HKQT Long Thành | Đặc biệt | 4 lần | 3.9% |
| Cảng Nước Sâu Cái Mép | Đặc biệt | 6 lần | 5.8% |
| Tuyến Cao Tốc Bắc - Nam | Đặc biệt | 3 lần | 2.9% |
| Cảng HKQT Nội Bài | Đặc biệt | 1 lần | 1.0% |
| Tập Đoàn Điện Lực (EVN) | Đặc biệt | 2 lần | 1.9% |
| Tập Đoàn Viễn Thông (Viettel) | Đặc biệt | 2 lần | 1.9% |

---

## IV. NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐI TỪ ĐẦU ĐẾN KẾT THÚC (STEP-BY-STEP LOG)

### === VÒNG ĐẤU #1 ===

#### Lượt #1 | Vòng #1 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 0 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Mua thành công [Bình Dương (Tổ Hợp Thể Thao & Golf)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 14.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #2 | Vòng #1 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_JUNK_STOCK]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Bác Ba (Thực dụng / Aggressive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 12.200 Tr. VNĐ | **Tài sản ròng:** 13.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #3 | Vòng #1 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 15.000 Tr. VNĐ | **Tài sản ròng:** 15.000 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 0 ➔ Ô 7 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_STOCK_PROFIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 16.200 Tr. VNĐ | **Tài sản ròng:** 17.200 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

### === VÒNG ĐẤU #2 ===

#### Lượt #4 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 15.235 Tr. VNĐ | **Tài sản ròng:** 15.235 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Cô Tư (Thận trọng / Passive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 13.935 Tr. VNĐ | **Tài sản ròng:** 14.935 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #5 | Vòng #2 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.935 Tr. VNĐ | **Tài sản ròng:** 14.935 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Mua thành công [Cảng Nước Sâu Cái Mép] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 11.935 Tr. VNĐ | **Tài sản ròng:** 14.935 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép

#### Lượt #6 | Vòng #2 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 13.435 Tr. VNĐ | **Tài sản ròng:** 13.435 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 7 ➔ Ô 13 (**Lâm Đồng (Đà Lạt)**)
- **Sự kiện ô:** Mua thành công [Lâm Đồng (Đà Lạt)] giá 1400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Bác Ba (Thực dụng / Aggressive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 10.735 Tr. VNĐ | **Tài sản ròng:** 13.135 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt)

#### Lượt #7 | Vòng #2 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 17.435 Tr. VNĐ | **Tài sản ròng:** 17.435 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 7 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 15.635 Tr. VNĐ | **Tài sản ròng:** 16.635 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

### === VÒNG ĐẤU #3 ===

#### Lượt #8 | Vòng #3 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 13.670 Tr. VNĐ | **Tài sản ròng:** 15.670 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 15 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Mua thành công [Ninh Bình (Tràng An)] giá 2400 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Cô Tư (Thận trọng / Passive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 9.970 Tr. VNĐ | **Tài sản ròng:** 15.370 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Ninh Bình (Tràng An)

#### Lượt #9 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 11.970 Tr. VNĐ | **Tài sản ròng:** 13.370 Tr. VNĐ
- **Xúc xắc:** [5, 5] (Tổng: 10) (Đổ Đôi!)
- **Di chuyển:** Ô 13 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Mua thành công [Nghệ An (TP. Vinh)] giá 2200 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Bác Ba (Thực dụng / Aggressive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 8.470 Tr. VNĐ | **Tài sản ròng:** 13.070 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Nghệ An (TP. Vinh)

#### Lượt #10 | Vòng #3 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 8.470 Tr. VNĐ | **Tài sản ròng:** 13.070 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 23 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Viễn Thông (Viettel)] giá 1500 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Bác Ba (Thực dụng / Aggressive) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 3.850 Tr. VNĐ | **Tài sản ròng:** 12.350 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #11 | Vòng #3 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.870 Tr. VNĐ | **Tài sản ròng:** 16.870 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 15 ➔ Ô 23 (**Nghệ An (TP. Vinh)**)
- **Sự kiện ô:** Dừng chân tại [Nghệ An (TP. Vinh)]: Trả tiền thuê 220 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 15.350 Tr. VNĐ | **Tài sản ròng:** 16.350 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

### === VÒNG ĐẤU #4 ===

#### Lượt #12 | Vòng #4 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 14.169 Tr. VNĐ | **Tài sản ròng:** 16.169 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 24 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_URBAN_PLANNING]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Cô Tư (Thận trọng / Passive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 12.869 Tr. VNĐ | **Tài sản ròng:** 15.869 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép

#### Lượt #13 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 5.305 Tr. VNĐ | **Tài sản ròng:** 12.805 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 28 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONTRACT_PENALTY]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.305 Tr. VNĐ | **Tài sản ròng:** 11.805 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #14 | Vòng #4 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.305 Tr. VNĐ | **Tài sản ròng:** 11.805 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 36 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (Quận 1 - Nguyễn Huệ)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (Quận 1 - Nguyễn Huệ)] với giá 2850 Tr. VNĐ
- **Số dư sau lượt:** 4.305 Tr. VNĐ | **Tài sản ròng:** 11.805 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel)

#### Lượt #15 | Vòng #4 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.585 Tr. VNĐ | **Tài sản ròng:** 16.585 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 23 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Từ chối mua [Kiên Giang (Phú Quốc - Grand World)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Kiên Giang (Phú Quốc - Grand World)] với giá 3150 Tr. VNĐ
- **Số dư sau lượt:** 16.585 Tr. VNĐ | **Tài sản ròng:** 16.585 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #5 ===

#### Lượt #16 | Vòng #5 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 7.869 Tr. VNĐ | **Tài sản ròng:** 17.469 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 33 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Lâm Đồng (Đà Lạt)] từ Chú Sáu (Cân bằng / Balanced) với giá 1820 Tr. VNĐ (Nộp thuế chuyển nhượng 91 Tr.)
- **Số dư sau lượt:** 6.049 Tr. VNĐ | **Tài sản ròng:** 17.049 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World)

#### Lượt #17 | Vòng #5 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.034 Tr. VNĐ | **Tài sản ròng:** 12.134 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 39 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cảng HKQT Long Thành] giá 2000 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Bác Ba (Thực dụng / Aggressive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 4.734 Tr. VNĐ | **Tài sản ròng:** 13.834 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành

#### Lượt #18 | Vòng #5 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.585 Tr. VNĐ | **Tài sản ròng:** 16.585 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 27 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Hoàn Kiếm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hà Nội (Hoàn Kiếm)] với giá 4450 Tr. VNĐ
- **Số dư sau lượt:** 16.585 Tr. VNĐ | **Tài sản ròng:** 16.585 Tr. VNĐ
- **Danh mục BĐS sở hữu (0):** Chưa có

### === VÒNG ĐẤU #6 ===

#### Lượt #19 | Vòng #6 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 2.834 Tr. VNĐ | **Tài sản ròng:** 16.034 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 39 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.964 Tr. VNĐ | **Tài sản ròng:** 17.164 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm)

#### Lượt #20 | Vòng #6 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 4.854 Tr. VNĐ | **Tài sản ròng:** 13.954 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 5 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.854 Tr. VNĐ | **Tài sản ròng:** 13.954 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành

#### Lượt #21 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 16.585 Tr. VNĐ | **Tài sản ròng:** 16.585 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 34 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_CONCERT_SPONSOR]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 14.685 Tr. VNĐ | **Tài sản ròng:** 15.685 Tr. VNĐ
- **Danh mục BĐS sở hữu (1):** Bình Dương (Tổ Hợp Thể Thao & Golf)

#### Lượt #22 | Vòng #6 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.685 Tr. VNĐ | **Tài sản ròng:** 15.685 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 36 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Lâm Đồng (Đà Lạt)] từ Bác Ba (Thực dụng / Aggressive) với giá 1820 Tr. VNĐ (Nộp thuế chuyển nhượng 91 Tr.)
- **Số dư sau lượt:** 14.865 Tr. VNĐ | **Tài sản ròng:** 17.265 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt)

### === VÒNG ĐẤU #7 ===

#### Lượt #23 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.693 Tr. VNĐ | **Tài sản ròng:** 17.493 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 6 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Mua thành công [Đồng Nai (Đại Công Viên Chủ Đề)] giá 1000 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 4.693 Tr. VNĐ | **Tài sản ròng:** 17.493 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #24 | Vòng #7 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.693 Tr. VNĐ | **Tài sản ròng:** 17.493 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 8 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.693 Tr. VNĐ | **Tài sản ròng:** 17.493 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #25 | Vòng #7 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.089 Tr. VNĐ | **Tài sản ròng:** 14.189 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Mua thành công [Thừa Thiên Huế] giá 1800 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.289 Tr. VNĐ | **Tài sản ròng:** 14.189 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế

#### Lượt #26 | Vòng #7 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 14.865 Tr. VNĐ | **Tài sản ròng:** 17.265 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 6 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Giao dịch P2P Trade [Ninh Bình (Tràng An)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Ninh Bình (Tràng An)] từ Chú Sáu (Cân bằng / Balanced) với giá 3120 Tr. VNĐ (Nộp thuế chuyển nhượng 156 Tr.)
- **Số dư sau lượt:** 11.745 Tr. VNĐ | **Tài sản ròng:** 16.545 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An)

### === VÒNG ĐẤU #8 ===

#### Lượt #27 | Vòng #8 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.693 Tr. VNĐ | **Tài sản ròng:** 17.493 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 15 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 240 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.453 Tr. VNĐ | **Tài sản ròng:** 17.253 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #28 | Vòng #8 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.253 Tr. VNĐ | **Tài sản ròng:** 14.753 Tr. VNĐ
- **Xúc xắc:** [5, 6] (Tổng: 11)
- **Di chuyển:** Ô 18 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Mua thành công [Quảng Ninh (Hạ Long)] giá 2800 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.453 Tr. VNĐ | **Tài sản ròng:** 14.753 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Nghệ An (TP. Vinh), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long)

#### Lượt #29 | Vòng #8 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.985 Tr. VNĐ | **Tài sản ròng:** 16.785 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 10 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 500 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Nghệ An (TP. Vinh)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Nghệ An (TP. Vinh)] từ Chú Sáu (Cân bằng / Balanced) với giá 2860 Tr. VNĐ (Nộp thuế chuyển nhượng 143 Tr.)
- **Số dư sau lượt:** 8.625 Tr. VNĐ | **Tài sản ròng:** 15.625 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #9 ===

#### Lượt #30 | Vòng #9 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.953 Tr. VNĐ | **Tài sản ròng:** 17.753 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 24 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.673 Tr. VNĐ | **Tài sản ròng:** 17.473 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #31 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 7.450 Tr. VNĐ | **Tài sản ròng:** 15.550 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 29 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Mua thành công [Cần Thơ (Cái Răng)] giá 600 Tr. VNĐ
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Cô Tư (Thận trọng / Passive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 6.950 Tr. VNĐ | **Tài sản ròng:** 16.650 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Bình Dương (Tổ Hợp Thể Thao & Golf), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng)

#### Lượt #32 | Vòng #9 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 6.950 Tr. VNĐ | **Tài sản ròng:** 16.650 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 1 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Giao dịch P2P Trade [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Lâm Đồng (Đà Lạt)] từ Cô Tư (Thận trọng / Passive) với giá 1820 Tr. VNĐ (Nộp thuế chuyển nhượng 91 Tr.)
- **Số dư sau lượt:** 5.130 Tr. VNĐ | **Tài sản ròng:** 16.230 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng)

#### Lượt #33 | Vòng #9 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.589 Tr. VNĐ | **Tài sản ròng:** 16.189 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 15 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Từ chối mua [Đà Nẵng (Hải Châu - Sơn Trà)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Chú Sáu (Cân bằng / Balanced) thắng đấu giá [Đà Nẵng (Hải Châu - Sơn Trà)] với giá 3150 Tr. VNĐ
- **Số dư sau lượt:** 11.589 Tr. VNĐ | **Tài sản ròng:** 16.189 Tr. VNĐ
- **Danh mục BĐS sở hữu (2):** Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #10 ===

#### Lượt #34 | Vòng #10 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.673 Tr. VNĐ | **Tài sản ròng:** 17.473 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 29 ➔ Ô 34 (**Hà Nội (Hoàn Kiếm)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Hoàn Kiếm)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.673 Tr. VNĐ | **Tài sản ròng:** 17.473 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #35 | Vòng #10 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.980 Tr. VNĐ | **Tài sản ròng:** 15.080 Tr. VNĐ
- **Xúc xắc:** [5, 1] (Tổng: 6)
- **Di chuyển:** Ô 6 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Mua thành công [Tập Đoàn Điện Lực (EVN)] giá 1500 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 480 Tr. VNĐ | **Tài sản ròng:** 15.080 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

#### Lượt #36 | Vòng #10 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 11.589 Tr. VNĐ | **Tài sản ròng:** 16.189 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 19 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Chú Sáu (Cân bằng / Balanced) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 10.009 Tr. VNĐ | **Tài sản ròng:** 15.609 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #11 ===

#### Lượt #37 | Vòng #11 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.673 Tr. VNĐ | **Tài sản ròng:** 17.473 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 34 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.673 Tr. VNĐ | **Tài sản ròng:** 17.473 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề)

#### Lượt #38 | Vòng #11 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.995 Tr. VNĐ | **Tài sản ròng:** 15.595 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 12 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.995 Tr. VNĐ | **Tài sản ròng:** 15.595 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

#### Lượt #39 | Vòng #11 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.009 Tr. VNĐ | **Tài sản ròng:** 15.609 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 29 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Từ chối mua [Hà Nội (Cầu Giấy)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Hà Nội (Cầu Giấy)] với giá 1550 Tr. VNĐ
- **Số dư sau lượt:** 10.009 Tr. VNĐ | **Tài sản ròng:** 15.609 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #12 ===

#### Lượt #40 | Vòng #12 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.123 Tr. VNĐ | **Tài sản ròng:** 18.923 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 39 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Cảng HKQT Long Thành]: Trả tiền thuê 500 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.723 Tr. VNĐ | **Tài sản ròng:** 19.523 Tr. VNĐ
- **Danh mục BĐS sở hữu (6):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy)

#### Lượt #41 | Vòng #12 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.495 Tr. VNĐ | **Tài sản ròng:** 16.095 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 19 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 240 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.255 Tr. VNĐ | **Tài sản ròng:** 15.855 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

#### Lượt #42 | Vòng #12 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.249 Tr. VNĐ | **Tài sản ròng:** 15.849 Tr. VNĐ
- **Xúc xắc:** [2, 3] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Từ chối mua [TP.HCM (TP. Thủ Đức)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [TP.HCM (TP. Thủ Đức)] với giá 1800 Tr. VNĐ
- **Số dư sau lượt:** 10.249 Tr. VNĐ | **Tài sản ròng:** 15.849 Tr. VNĐ
- **Danh mục BĐS sở hữu (3):** Bình Dương (Tổ Hợp Thể Thao & Golf), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #13 ===

#### Lượt #43 | Vòng #13 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.923 Tr. VNĐ | **Tài sản ròng:** 21.223 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 5 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [TP.HCM (TP. Thủ Đức)] lên C1
- **Số dư sau lượt:** 173 Tr. VNĐ | **Tài sản ròng:** 21.223 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1)

#### Lượt #44 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.255 Tr. VNĐ | **Tài sản ròng:** 15.855 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 24 ➔ Ô 28 (**Tập Đoàn Viễn Thông (Viettel)**)
- **Sự kiện ô:** Dừng tại [Tập Đoàn Viễn Thông (Viettel)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.255 Tr. VNĐ | **Tài sản ròng:** 15.855 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

#### Lượt #45 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.255 Tr. VNĐ | **Tài sản ròng:** 15.855 Tr. VNĐ
- **Xúc xắc:** [4, 4] (Tổng: 8) (Đổ Đôi!)
- **Di chuyển:** Ô 28 ➔ Ô 36 (**Phiếu Cơ Hội**)
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_SLOW_BUILD]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.255 Tr. VNĐ | **Tài sản ròng:** 15.855 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

#### Lượt #46 | Vòng #13 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.255 Tr. VNĐ | **Tài sản ròng:** 15.855 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 36 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng chân tại [TP.HCM (Quận 1 - Nguyễn Huệ)]: Trả tiền thuê 800 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.455 Tr. VNĐ | **Tài sản ròng:** 15.055 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Lâm Đồng (Đà Lạt), Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

#### Lượt #47 | Vòng #13 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 10.249 Tr. VNĐ | **Tài sản ròng:** 15.849 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Giao dịch P2P Trade [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Lâm Đồng (Đà Lạt)] từ Chú Sáu (Cân bằng / Balanced) với giá 1820 Tr. VNĐ (Nộp thuế chuyển nhượng 91 Tr.)
- **Số dư sau lượt:** 9.205 Tr. VNĐ | **Tài sản ròng:** 16.205 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An), Nghệ An (TP. Vinh)

### === VÒNG ĐẤU #14 ===

#### Lượt #48 | Vòng #14 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 973 Tr. VNĐ | **Tài sản ròng:** 22.023 Tr. VNĐ
- **Xúc xắc:** [5, 4] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng chân tại [Đà Nẵng (Hải Châu - Sơn Trà)]: Trả tiền thuê 200 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 773 Tr. VNĐ | **Tài sản ròng:** 21.823 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Cảng Nước Sâu Cái Mép, TP.HCM (Quận 1 - Nguyễn Huệ), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1)

#### Lượt #49 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 3.384 Tr. VNĐ | **Tài sản ròng:** 15.584 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 39 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 2.584 Tr. VNĐ | **Tài sản ròng:** 14.784 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

#### Lượt #50 | Vòng #14 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.584 Tr. VNĐ | **Tài sản ròng:** 14.784 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 5 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.464 Tr. VNĐ | **Tài sản ròng:** 14.664 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN)

#### Lượt #51 | Vòng #14 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 9.205 Tr. VNĐ | **Tài sản ròng:** 16.205 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 4 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Giao dịch P2P Trade [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [TP.HCM (Quận 1 - Nguyễn Huệ)] từ Bác Ba (Thực dụng / Aggressive) với giá 5200 Tr. VNĐ (Nộp thuế chuyển nhượng 260 Tr.)
- **Số dư sau lượt:** 3.885 Tr. VNĐ | **Tài sản ròng:** 14.885 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Bình Dương (Tổ Hợp Thể Thao & Golf), Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #15 ===

#### Lượt #52 | Vòng #15 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 5.953 Tr. VNĐ | **Tài sản ròng:** 23.003 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 19 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 240 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Giao dịch P2P Trade [Bình Dương (Tổ Hợp Thể Thao & Golf)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Bình Dương (Tổ Hợp Thể Thao & Golf)] từ Cô Tư (Thận trọng / Passive) với giá 1300 Tr. VNĐ (Nộp thuế chuyển nhượng 65 Tr.)
- **Số dư sau lượt:** 4.413 Tr. VNĐ | **Tài sản ròng:** 22.463 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1)

#### Lượt #53 | Vòng #15 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.464 Tr. VNĐ | **Tài sản ròng:** 14.664 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 8 ➔ Ô 14 (**Khánh Hòa (Nha Trang)**)
- **Sự kiện ô:** Mua thành công [Khánh Hòa (Nha Trang)] giá 1600 Tr. VNĐ
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 864 Tr. VNĐ | **Tài sản ròng:** 14.664 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #54 | Vòng #15 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 5.360 Tr. VNĐ | **Tài sản ròng:** 15.360 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 8 ➔ Ô 12 (**Tập Đoàn Điện Lực (EVN)**)
- **Sự kiện ô:** Dừng chân tại [Tập Đoàn Điện Lực (EVN)]: Trả tiền thuê 400 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.960 Tr. VNĐ | **Tài sản ròng:** 14.960 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), TP.HCM (Quận 1 - Nguyễn Huệ)

### === VÒNG ĐẤU #16 ===

#### Lượt #55 | Vòng #16 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.413 Tr. VNĐ | **Tài sản ròng:** 22.463 Tr. VNĐ
- **Xúc xắc:** [3, 5] (Tổng: 8)
- **Di chuyển:** Ô 24 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 4.413 Tr. VNĐ | **Tài sản ròng:** 22.463 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1)

#### Lượt #56 | Vòng #16 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.264 Tr. VNĐ | **Tài sản ròng:** 15.064 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 14 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Từ chối mua [Thanh Hóa (Sầm Sơn)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Cô Tư (Thận trọng / Passive) thắng đấu giá [Thanh Hóa (Sầm Sơn)] với giá 4250 Tr. VNĐ
- **Số dư sau lượt:** 1.264 Tr. VNĐ | **Tài sản ròng:** 15.064 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #57 | Vòng #16 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 710 Tr. VNĐ | **Tài sản ròng:** 12.910 Tr. VNĐ
- **Xúc xắc:** [1, 5] (Tổng: 6)
- **Di chuyển:** Ô 12 ➔ Ô 18 (**Thừa Thiên Huế**)
- **Sự kiện ô:** Dừng chân tại [Thừa Thiên Huế]: Trả tiền thuê 180 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 530 Tr. VNĐ | **Tài sản ròng:** 12.730 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #17 ===

#### Lượt #58 | Vòng #17 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.413 Tr. VNĐ | **Tài sản ròng:** 22.463 Tr. VNĐ
- **Xúc xắc:** [4, 6] (Tổng: 10)
- **Di chuyển:** Ô 32 ➔ Ô 2 (**Phiếu Thị Trường**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_FIRE_INSPECTION]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.413 Tr. VNĐ | **Tài sản ròng:** 21.463 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1)

#### Lượt #59 | Vòng #17 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.444 Tr. VNĐ | **Tài sản ròng:** 15.244 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 21 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng chân tại [Hà Nội (Cầu Giấy)]: Trả tiền thuê 300 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.144 Tr. VNĐ | **Tài sản ròng:** 14.944 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #60 | Vòng #17 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 530 Tr. VNĐ | **Tài sản ròng:** 12.730 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 18 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 530 Tr. VNĐ | **Tài sản ròng:** 12.730 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #18 ===

#### Lượt #61 | Vòng #18 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 3.713 Tr. VNĐ | **Tài sản ròng:** 21.763 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 2 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**)
- **Sự kiện ô:** Dừng tại [Đồng Nai (Đại Công Viên Chủ Đề)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 3.713 Tr. VNĐ | **Tài sản ròng:** 21.763 Tr. VNĐ
- **Danh mục BĐS sở hữu (7):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1)

#### Lượt #62 | Vòng #18 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.144 Tr. VNĐ | **Tài sản ròng:** 14.944 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 32 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Thua lỗ thị trường (-700 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 1000 Tr. VNĐ ➔ Thu về 300 Tr. VNĐ (-700 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 444 Tr. VNĐ | **Tài sản ròng:** 14.244 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #63 | Vòng #18 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 530 Tr. VNĐ | **Tài sản ròng:** 12.730 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 21 ➔ Ô 27 (**Kiên Giang (Phú Quốc - Grand World)**)
- **Sự kiện ô:** Dừng chân tại [Kiên Giang (Phú Quốc - Grand World)]: Trả tiền thuê 312 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 218 Tr. VNĐ | **Tài sản ròng:** 12.418 Tr. VNĐ
- **Danh mục BĐS sở hữu (5):** Lâm Đồng (Đà Lạt), Ninh Bình (Tràng An), Nghệ An (TP. Vinh), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #19 ===

#### Lượt #64 | Vòng #19 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 4.025 Tr. VNĐ | **Tài sản ròng:** 22.075 Tr. VNĐ
- **Xúc xắc:** [3, 6] (Tổng: 9)
- **Di chuyển:** Ô 8 ➔ Ô 17 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_PUBLIC_INVEST]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Giao dịch P2P Trade [Lâm Đồng (Đà Lạt)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Thương vụ P2P:** Đàm phán P2P thành công: Mua [Lâm Đồng (Đà Lạt)] từ Cô Tư (Thận trọng / Passive) với giá 1820 Tr. VNĐ (Nộp thuế chuyển nhượng 91 Tr.)
- **Số dư sau lượt:** 3.205 Tr. VNĐ | **Tài sản ròng:** 22.655 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1)

#### Lượt #65 | Vòng #19 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.444 Tr. VNĐ | **Tài sản ròng:** 15.244 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 38 ➔ Ô 7 (**Phiếu Cơ Hội**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Rút Phiếu Cơ Hội [CC_FREE_CREDIT]: Thi hành hiệu ứng ngẫu nhiên
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 2.244 Tr. VNĐ | **Tài sản ròng:** 16.044 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #66 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.947 Tr. VNĐ | **Tài sản ròng:** 12.747 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 27 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Nâng cấp BĐS:** Nâng cấp [Ninh Bình (Tràng An)] lên C1
- **Số dư sau lượt:** 587 Tr. VNĐ | **Tài sản ròng:** 12.587 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

#### Lượt #67 | Vòng #19 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 587 Tr. VNĐ | **Tài sản ròng:** 12.587 Tr. VNĐ
- **Xúc xắc:** [3, 3] (Tổng: 6) (Đổ Đôi!)
- **Di chuyển:** Ô 29 ➔ Ô 35 (**Cảng HKQT Nội Bài**)
- **Sự kiện ô:** Từ chối mua [Cảng HKQT Nội Bài], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Bác Ba (Thực dụng / Aggressive) thắng đấu giá [Cảng HKQT Nội Bài] với giá 2250 Tr. VNĐ
- **Số dư sau lượt:** 587 Tr. VNĐ | **Tài sản ròng:** 12.587 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #20 ===

#### Lượt #68 | Vòng #20 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 955 Tr. VNĐ | **Tài sản ròng:** 22.405 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 17 ➔ Ô 24 (**Ninh Bình (Tràng An)**)
- **Sự kiện ô:** Dừng chân tại [Ninh Bình (Tràng An)]: Trả tiền thuê 720 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 235 Tr. VNĐ | **Tài sản ròng:** 21.685 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1), Cảng HKQT Nội Bài

#### Lượt #69 | Vòng #20 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 2.524 Tr. VNĐ | **Tài sản ròng:** 16.324 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 7 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng chân tại [Cảng Nước Sâu Cái Mép]: Trả tiền thuê 1000 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.524 Tr. VNĐ | **Tài sản ròng:** 15.324 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #70 | Vòng #20 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 1.307 Tr. VNĐ | **Tài sản ròng:** 13.307 Tr. VNĐ
- **Xúc xắc:** [1, 6] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Nghệ An (TP. Vinh)] lên C1
- **Số dư sau lượt:** 207 Tr. VNĐ | **Tài sản ròng:** 13.307 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #21 ===

#### Lượt #71 | Vòng #21 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 1.235 Tr. VNĐ | **Tài sản ròng:** 22.685 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 24 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 955 Tr. VNĐ | **Tài sản ròng:** 22.405 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1), Cảng HKQT Nội Bài

#### Lượt #72 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.804 Tr. VNĐ | **Tài sản ròng:** 15.604 Tr. VNĐ
- **Xúc xắc:** [2, 2] (Tổng: 4) (Đổ Đôi!)
- **Di chuyển:** Ô 15 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.804 Tr. VNĐ | **Tài sản ròng:** 15.604 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #73 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.804 Tr. VNĐ | **Tài sản ròng:** 15.604 Tr. VNĐ
- **Xúc xắc:** [1, 1] (Tổng: 2) (Đổ Đôi!)
- **Di chuyển:** Ô 19 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng chân tại [Thanh Hóa (Sầm Sơn)]: Trả tiền thuê 440 Tr. VNĐ cho Cô Tư (Thận trọng / Passive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn) [Đổ Đôi: Tiếp tục lượt]
- **Số dư sau lượt:** 1.364 Tr. VNĐ | **Tài sản ròng:** 15.164 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #74 | Vòng #21 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.364 Tr. VNĐ | **Tài sản ròng:** 15.164 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 21 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Từ chối mua [Tuyến Cao Tốc Bắc - Nam], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Tuyến Cao Tốc Bắc - Nam] phát mãi về Kho Bạc
- **Số dư sau lượt:** 1.364 Tr. VNĐ | **Tài sản ròng:** 15.164 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #75 | Vòng #21 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 647 Tr. VNĐ | **Tài sản ròng:** 13.747 Tr. VNĐ
- **Xúc xắc:** [2, 5] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 647 Tr. VNĐ | **Tài sản ròng:** 13.747 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #22 ===

#### Lượt #76 | Vòng #22 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 955 Tr. VNĐ | **Tài sản ròng:** 22.405 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 29 ➔ Ô 32 (**Hà Nội (Cầu Giấy)**)
- **Sự kiện ô:** Dừng tại [Hà Nội (Cầu Giấy)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 955 Tr. VNĐ | **Tài sản ròng:** 22.405 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1), Cảng HKQT Nội Bài

#### Lượt #77 | Vòng #22 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.364 Tr. VNĐ | **Tài sản ròng:** 15.164 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 25 ➔ Ô 33 (**Phiếu Thị Trường**)
- **Sự kiện ô:** Rút Phiếu Thị Trường [MC_CASINO_PILOT]: Thay đổi cục diện thị trường
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 1.364 Tr. VNĐ | **Tài sản ròng:** 15.164 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #78 | Vòng #22 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 647 Tr. VNĐ | **Tài sản ròng:** 13.747 Tr. VNĐ
- **Xúc xắc:** [4, 3] (Tổng: 7)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 147 Tr. VNĐ | **Tài sản ròng:** 13.247 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #23 ===

#### Lượt #79 | Vòng #23 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 955 Tr. VNĐ | **Tài sản ròng:** 22.405 Tr. VNĐ
- **Xúc xắc:** [1, 4] (Tổng: 5)
- **Di chuyển:** Ô 32 ➔ Ô 37 (**TP.HCM (TP. Thủ Đức)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (TP. Thủ Đức)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 955 Tr. VNĐ | **Tài sản ròng:** 22.405 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức) (C1), Cảng HKQT Nội Bài

#### Lượt #80 | Vòng #23 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 1.364 Tr. VNĐ | **Tài sản ròng:** 15.164 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 33 ➔ Ô 38 (**Sàn Giao Dịch Chứng Khoán (HOSE)**)
- **Sự kiện ô:** Sàn Giao Dịch HOSE: Thua lỗ thị trường (-700 Tr. VNĐ)
- **Tính năng tương tác:** Đầu tư Sàn HOSE: Đặt cọc 1000 Tr. VNĐ ➔ Thu về 300 Tr. VNĐ (-700 Tr.)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 664 Tr. VNĐ | **Tài sản ròng:** 14.464 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #81 | Vòng #23 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 147 Tr. VNĐ | **Tài sản ròng:** 13.247 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 10 ➔ Ô 21 (**Thanh Hóa (Sầm Sơn)**)
- **Sự kiện ô:** Dừng tại [Thanh Hóa (Sầm Sơn)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 147 Tr. VNĐ | **Tài sản ròng:** 13.247 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #24 ===

#### Lượt #82 | Vòng #24 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 955 Tr. VNĐ | **Tài sản ròng:** 22.405 Tr. VNĐ
- **Xúc xắc:** [6, 1] (Tổng: 7)
- **Di chuyển:** Ô 37 ➔ Ô 4 (**Lệ Phí Đăng Ký Đất Đai**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Nộp thuế/lệ phí đất đai vào Kho Bạc
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Hạ cấp công trình ô 37
- **Số dư sau lượt:** 230 Tr. VNĐ | **Tài sản ròng:** 19.930 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Cảng HKQT Nội Bài

#### Lượt #83 | Vòng #24 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 664 Tr. VNĐ | **Tài sản ròng:** 14.464 Tr. VNĐ
- **Xúc xắc:** [5, 2] (Tổng: 7)
- **Di chuyển:** Ô 38 ➔ Ô 5 (**Cảng HKQT Long Thành**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cảng HKQT Long Thành]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 1
- **Giải cứu tài chính:** Thế chấp BĐS ô 14
- **Số dư sau lượt:** 164 Tr. VNĐ | **Tài sản ròng:** 12.864 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #84 | Vòng #24 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 147 Tr. VNĐ | **Tài sản ròng:** 13.247 Tr. VNĐ
- **Xúc xắc:** [1, 3] (Tổng: 4)
- **Di chuyển:** Ô 21 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Từ chối mua [Tuyến Cao Tốc Bắc - Nam], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Tuyến Cao Tốc Bắc - Nam] phát mãi về Kho Bạc
- **Số dư sau lượt:** 147 Tr. VNĐ | **Tài sản ròng:** 13.247 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #25 ===

#### Lượt #85 | Vòng #25 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 230 Tr. VNĐ | **Tài sản ròng:** 19.930 Tr. VNĐ
- **Xúc xắc:** [6, 5] (Tổng: 11)
- **Di chuyển:** Ô 4 ➔ Ô 15 (**Cảng Nước Sâu Cái Mép**)
- **Sự kiện ô:** Dừng tại [Cảng Nước Sâu Cái Mép]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 230 Tr. VNĐ | **Tài sản ròng:** 19.930 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Cảng HKQT Nội Bài

#### Lượt #86 | Vòng #25 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 164 Tr. VNĐ | **Tài sản ròng:** 12.864 Tr. VNĐ
- **Xúc xắc:** [2, 4] (Tổng: 6)
- **Di chuyển:** Ô 5 ➔ Ô 11 (**Bình Thuận (Mũi Né)**)
- **Sự kiện ô:** Từ chối mua [Bình Thuận (Mũi Né)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Bình Thuận (Mũi Né)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 164 Tr. VNĐ | **Tài sản ròng:** 12.864 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #87 | Vòng #25 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 147 Tr. VNĐ | **Tài sản ròng:** 13.247 Tr. VNĐ
- **Xúc xắc:** [4, 2] (Tổng: 6)
- **Di chuyển:** Ô 25 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hưng Yên (Văn Giang)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 147 Tr. VNĐ | **Tài sản ròng:** 13.247 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #26 ===

#### Lượt #88 | Vòng #26 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 230 Tr. VNĐ | **Tài sản ròng:** 19.930 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 15 ➔ Ô 25 (**Tuyến Cao Tốc Bắc - Nam**)
- **Sự kiện ô:** Từ chối mua [Tuyến Cao Tốc Bắc - Nam], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Tuyến Cao Tốc Bắc - Nam] phát mãi về Kho Bạc
- **Số dư sau lượt:** 230 Tr. VNĐ | **Tài sản ròng:** 19.930 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Cảng HKQT Nội Bài

#### Lượt #89 | Vòng #26 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 164 Tr. VNĐ | **Tài sản ròng:** 12.864 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 11 ➔ Ô 19 (**Đà Nẵng (Hải Châu - Sơn Trà)**)
- **Sự kiện ô:** Dừng tại [Đà Nẵng (Hải Châu - Sơn Trà)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 164 Tr. VNĐ | **Tài sản ròng:** 12.864 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #90 | Vòng #26 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 147 Tr. VNĐ | **Tài sản ròng:** 13.247 Tr. VNĐ
- **Xúc xắc:** [5, 3] (Tổng: 8)
- **Di chuyển:** Ô 31 ➔ Ô 39 (**TP.HCM (Quận 1 - Nguyễn Huệ)**)
- **Sự kiện ô:** Dừng tại [TP.HCM (Quận 1 - Nguyễn Huệ)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 147 Tr. VNĐ | **Tài sản ròng:** 13.247 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn)

### === VÒNG ĐẤU #27 ===

#### Lượt #91 | Vòng #27 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 230 Tr. VNĐ | **Tài sản ròng:** 19.930 Tr. VNĐ
- **Xúc xắc:** [4, 1] (Tổng: 5)
- **Di chuyển:** Ô 25 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 230 Tr. VNĐ | **Tài sản ròng:** 19.930 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Cảng HKQT Nội Bài

#### Lượt #92 | Vòng #27 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 164 Tr. VNĐ | **Tài sản ròng:** 12.864 Tr. VNĐ
- **Xúc xắc:** [6, 6] (Tổng: 12) (Đổ Đôi!)
- **Di chuyển:** Ô 19 ➔ Ô 31 (**Hưng Yên (Văn Giang)**)
- **Sự kiện ô:** Từ chối mua [Hưng Yên (Văn Giang)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hưng Yên (Văn Giang)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 164 Tr. VNĐ | **Tài sản ròng:** 12.864 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #93 | Vòng #27 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 147 Tr. VNĐ | **Tài sản ròng:** 13.247 Tr. VNĐ
- **Xúc xắc:** [6, 3] (Tổng: 9)
- **Di chuyển:** Ô 39 ➔ Ô 8 (**Đồng Nai (Đại Công Viên Chủ Đề)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng chân tại [Đồng Nai (Đại Công Viên Chủ Đề)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Nâng cấp BĐS:** Nâng cấp [Thanh Hóa (Sầm Sơn)] lên C1
- **Số dư sau lượt:** 437 Tr. VNĐ | **Tài sản ròng:** 14.637 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn) (C1)

### === VÒNG ĐẤU #28 ===

#### Lượt #94 | Vòng #28 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 20.050 Tr. VNĐ
- **Xúc xắc:** [6, 2] (Tổng: 8)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 20.050 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Cảng HKQT Nội Bài

#### Lượt #95 | Vòng #28 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 164 Tr. VNĐ | **Tài sản ròng:** 12.864 Tr. VNĐ
- **Xúc xắc:** [1, 2] (Tổng: 3)
- **Di chuyển:** Ô 38 ➔ Ô 1 (**Cần Thơ (Cái Răng)**) | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*
- **Sự kiện ô:** Dừng tại [Cần Thơ (Cái Răng)]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 18
- **Giải cứu tài chính:** Thế chấp BĐS ô 19
- **Số dư sau lượt:** 409 Tr. VNĐ | **Tài sản ròng:** 11.209 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #96 | Vòng #28 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 437 Tr. VNĐ | **Tài sản ròng:** 14.637 Tr. VNĐ
- **Xúc xắc:** [2, 6] (Tổng: 8)
- **Di chuyển:** Ô 8 ➔ Ô 16 (**Bình Định (Quy Nhơn)**)
- **Sự kiện ô:** Từ chối mua [Bình Định (Quy Nhơn)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Bình Định (Quy Nhơn)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 437 Tr. VNĐ | **Tài sản ròng:** 14.637 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn) (C1)

### === VÒNG ĐẤU #29 ===

#### Lượt #97 | Vòng #29 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 20.050 Tr. VNĐ
- **Xúc xắc:** [4, 5] (Tổng: 9)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 350 Tr. VNĐ | **Tài sản ròng:** 20.050 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Cảng HKQT Nội Bài

#### Lượt #98 | Vòng #29 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 409 Tr. VNĐ | **Tài sản ròng:** 11.209 Tr. VNĐ
- **Xúc xắc:** [3, 2] (Tổng: 5)
- **Di chuyển:** Ô 1 ➔ Ô 6 (**Bình Dương (Tổ Hợp Thể Thao & Golf)**)
- **Sự kiện ô:** Dừng chân tại [Bình Dương (Tổ Hợp Thể Thao & Golf)]: Trả tiền thuê 120 Tr. VNĐ cho Bác Ba (Thực dụng / Aggressive)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 289 Tr. VNĐ | **Tài sản ròng:** 11.089 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #99 | Vòng #29 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 437 Tr. VNĐ | **Tài sản ròng:** 14.637 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 16 ➔ Ô 26 (**Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)**)
- **Sự kiện ô:** Từ chối mua [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)], phát động Đấu Giá Công Khai
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Sàn đấu giá:** Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm)] phát mãi về Kho Bạc
- **Số dư sau lượt:** 437 Tr. VNĐ | **Tài sản ròng:** 14.637 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn) (C1)

### === VÒNG ĐẤU #30 ===

#### Lượt #100 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** 470 Tr. VNĐ | **Tài sản ròng:** 20.170 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** -30 Tr. VNĐ | **Tài sản ròng:** 19.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Cảng HKQT Nội Bài

#### Lượt #101 | Vòng #30 — Bác Ba (Thực dụng / Aggressive) (Aggressive)
- **Số dư trước lượt:** -30 Tr. VNĐ | **Tài sản ròng:** 19.670 Tr. VNĐ
- **Xúc xắc:** [6, 4] (Tổng: 10)
- **Di chuyển:** Ô 10 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Giải cứu tài chính:** Thế chấp BĐS ô 6
- **Số dư sau lượt:** 470 Tr. VNĐ | **Tài sản ròng:** 19.670 Tr. VNĐ
- **Danh mục BĐS sở hữu (9):** Bình Dương (Tổ Hợp Thể Thao & Golf), Cảng Nước Sâu Cái Mép, Lâm Đồng (Đà Lạt), Kiên Giang (Phú Quốc - Grand World), Hà Nội (Hoàn Kiếm), Đồng Nai (Đại Công Viên Chủ Đề), Hà Nội (Cầu Giấy), TP.HCM (TP. Thủ Đức), Cảng HKQT Nội Bài

#### Lượt #102 | Vòng #30 — Chú Sáu (Cân bằng / Balanced) (Balanced)
- **Số dư trước lượt:** 289 Tr. VNĐ | **Tài sản ròng:** 11.089 Tr. VNĐ
- **Xúc xắc:** [3, 1] (Tổng: 4)
- **Di chuyển:** Ô 6 ➔ Ô 10 (**Trạm Kiểm Toán & Thanh Tra**)
- **Sự kiện ô:** Vào trạm [Trạm Kiểm Toán & Thanh Tra]
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 289 Tr. VNĐ | **Tài sản ròng:** 11.089 Tr. VNĐ
- **Danh mục BĐS sở hữu (8):** Tập Đoàn Viễn Thông (Viettel), Cảng HKQT Long Thành, Thừa Thiên Huế, Quảng Ninh (Hạ Long), Cần Thơ (Cái Răng), Đà Nẵng (Hải Châu - Sơn Trà), Tập Đoàn Điện Lực (EVN), Khánh Hòa (Nha Trang)

#### Lượt #103 | Vòng #30 — Cô Tư (Thận trọng / Passive) (Passive)
- **Số dư trước lượt:** 437 Tr. VNĐ | **Tài sản ròng:** 14.637 Tr. VNĐ
- **Xúc xắc:** [2, 1] (Tổng: 3)
- **Di chuyển:** Ô 26 ➔ Ô 29 (**Quảng Ninh (Hạ Long)**)
- **Sự kiện ô:** Dừng chân tại [Quảng Ninh (Hạ Long)]: Trả tiền thuê 280 Tr. VNĐ cho Chú Sáu (Cân bằng / Balanced)
- **Tính năng tương tác:** Kích hoạt nút Hết Lượt (End Turn)
- **Số dư sau lượt:** 157 Tr. VNĐ | **Tài sản ròng:** 14.357 Tr. VNĐ
- **Danh mục BĐS sở hữu (4):** Ninh Bình (Tràng An) (C1), Nghệ An (TP. Vinh) (C1), TP.HCM (Quận 1 - Nguyễn Huệ), Thanh Hóa (Sầm Sơn) (C1)

---

## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM

1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.
2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.
3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.
4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.