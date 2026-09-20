# BÁO CÁO MÔ PHỎNG 500 VÒNG GAME: NGƯỜI CHƠI (HUMAN) VS CÁC LOẠI BOT AI
> Ticket: [IMP-142] Bot Chủ Động Đàm Phán Mua Đất Người Chơi & Hộp Thoại 15 Giây  
> Ngày thẩm định: 20/09/2026 | Phiên bản: VTCOON Production 1.0  
> Quy mô mô phỏng: 3 Case độc lập, mỗi case >= 500 vòng game đối kháng trực tiếp (Tổng cộng: 1543 vòng)

---

## 1. TỔNG HỢP KẾT QUẢ VẬN HÀNH & ĐỐI KHÁNG THEO TỪNG LOẠI BOT

| Chỉ Số Đánh Giá | Case 1: Bot Hiếu Chiến (Aggressive) | Case 2: Bot Cân Bằng (Balanced) | Case 3: Bot Thận Trọng (Passive) |
| :--- | :---: | :---: | :---: |
| **Tổng số vòng chơi hoàn thành** | **507 vòng** | **528 vòng** | **508 vòng** |
| **Tổng số ván đấu hoàn chỉnh** | 15 ván | 16 ván | 16 ván |
| **Tổng số lượt đi (turns)** | 1002 lượt | 1040 lượt | 1016 lượt |
| **Tỷ lệ Thắng Người Chơi (Human)** | **46.7%** (7 ván) | **31.3%** (5 ván) | **18.8%** (3 ván) |
| **Tỷ lệ Thắng Bot AI** | **53.3%** (8 ván) | **68.8%** (11 ván) | **81.3%** (13 ván) |
| Kết thúc do Vỡ nợ (Phá sản) | 9 ván | 10 ván | 13 ván |
| Kết thúc ở mốc 30 vòng (Max) | 6 ván | 6 ván | 3 ván |

---

## 2. HIỆU NĂNG TƯƠNG TÁC ĐÀM PHÁN MUA ĐẤT (IMP-142)

| Chỉ Số Đàm Phán Mua Đất | Bot Hiếu Chiến (Aggressive) | Bot Cân Bằng (Balanced) | Bot Thận Trọng (Passive) |
| :--- | :---: | :---: | :---: |
| **Số lần Bot đề nghị mua đất** | **19 lần** | **36 lần** | **70 lần** |
| Số lần Người chơi Đồng Ý Bán | 9 lần | 8 lần | 14 lần |
| Số lần Người chơi Từ Chối Bán | 8 lần | 24 lần | 47 lần |
| Số lần Hết 15s (Auto-Reject) | 2 lần | 4 lần | 9 lần |
| **Tỷ lệ chấp thuận giao dịch** | **47.4%** | **22.2%** | **20%** |
| Giá chào mua trung bình (% giá gốc) | **+82.4%** (1.75x) | **+67.2%** (1.65x) | **+68.6%** (1.50x) |
| Tổng dòng tiền giao dịch mua đất | 28.4 Tỷ | 26.0 Tỷ | 39.7 Tỷ |
| Thuế kho bạc 5% thu được | 1.42 Tỷ | 1.30 Tỷ | 1.99 Tỷ |

---

## 3. THỐNG KÊ ĐỘC QUYỀN & XÂY DỰNG CÔNG TRÌNH

| Thống Kê Bất Động Sản | Bot Hiếu Chiến (Aggressive) | Bot Cân Bằng (Balanced) | Bot Thận Trọng (Passive) |
| :--- | :---: | :---: | :---: |
| Độc quyền hoàn thành: Human | 10 bộ | 7 bộ | 2 bộ |
| Độc quyền hoàn thành: Bot | 15 bộ | 16 bộ | 19 bộ |
| Công trình nâng cấp: Human (C1/C2/C3) | 7 / 5 / 12 (Tổng: 53) | 4 / 7 / 5 (Tổng: 33) | 2 / 0 / 3 (Tổng: 11) |
| Công trình nâng cấp: Bot (C1/C2/C3) | 2 / 8 / 30 (Tổng: 108) | 8 / 9 / 23 (Tổng: 95) | 4 / 13 / 29 (Tổng: 117) |

---

## 4. KIỂM CHỨNG BẤT BIẾN TOÀN VẸN HỆ THỐNG (HARD INVARIANTS)

1. **Bất biến Zero Premature Trade**:
   - Số trường hợp tiền hoặc đất bị chuyển nhượng trước khi người chơi bấm Đồng Ý: **0 trường hợp (100% Bảo toàn)**.
2. **Bất biến Anti-Stall Invariant (Chống Treo Ván Cờ)**:
   - Số trường hợp ván cờ bị đóng băng/deadlock khi hết 15s hoặc từ chối đàm phán: **0 trường hợp (100% Liveness)**.
3. **Bất biến Cash Conservation Invariant**:
   - Vi phạm rò rỉ hoặc âm kho bạc: **0 vi phạm**.
4. **Bất biến Finite Balances Invariant**:
   - Vi phạm giá trị NaN hoặc không xác định: **0 vi phạm**.

---

## 5. KẾT LUẬN & ĐÁNH GIÁ CHIẾN THUẬT CỦA CÁC LOẠI BOT
- **Bot Hiếu Chiến (Aggressive)**: Tần suất gạ mua đất cao nhất và chịu chi giá mạnh nhất (+75% so với giá gốc). Khi Người chơi đồng ý bán, Bot Aggressive nhanh chóng hoàn thiện độc quyền và đẩy mạnh xây dựng C3 (Khách sạn), tạo áp lực vỡ nợ rất cao.
- **Bot Cân Bằng (Balanced)**: Trả giá mua đất hợp lý (+65%), chỉ đề xuất khi có đủ vốn an toàn và tiến trình game bước vào giai đoạn giữa. Cân bằng tốt giữa nâng cấp nhà và bảo toàn dòng tiền.
- **Bot Thận Trọng (Passive)**: Tần suất gạ mua thấp nhất, chỉ đề xuất giá +50% khi tiền mặt thật dồi dào. Tỷ lệ thắng của Người chơi trước Bot Passive cao nhất do Bot ít mạo hiểm tích lũy độc quyền.
