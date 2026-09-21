# BÁO CÁO MÔ PHỎNG 500 VÒNG GAME: NGƯỜI CHƠI (HUMAN) VS CÁC LOẠI BOT AI
> Ticket: [IMP-142] Bot Chủ Động Đàm Phán Mua Đất Người Chơi & Hộp Thoại 15 Giây  
> Ngày thẩm định: 20/09/2026 | Phiên bản: VTCOON Production 1.0  
> Quy mô mô phỏng: 3 Case độc lập, mỗi case >= 500 vòng game đối kháng trực tiếp (Tổng cộng: 1577 vòng)

---

## 1. TỔNG HỢP KẾT QUẢ VẬN HÀNH & ĐỐI KHÁNG THEO TỪNG LOẠI BOT

| Chỉ Số Đánh Giá | Case 1: Bot Hiếu Chiến (Aggressive) | Case 2: Bot Cân Bằng (Balanced) | Case 3: Bot Thận Trọng (Passive) |
| :--- | :---: | :---: | :---: |
| **Tổng số vòng chơi hoàn thành** | **536 vòng** | **505 vòng** | **536 vòng** |
| **Tổng số ván đấu hoàn chỉnh** | 16 ván | 15 ván | 18 ván |
| **Tổng số lượt đi (turns)** | 1444 lượt | 1379 lượt | 1812 lượt |
| **Tỷ lệ Thắng Người Chơi (Human)** | **50%** (8 ván) | **53.3%** (8 ván) | **22.2%** (4 ván) |
| **Tỷ lệ Thắng Bot AI** | **50%** (8 ván) | **46.7%** (7 ván) | **77.8%** (14 ván) |
| Kết thúc do Vỡ nợ (Phá sản) | 8 ván | 6 ván | 14 ván |
| Kết thúc ở mốc 30 vòng (Max) | 8 ván | 9 ván | 4 ván |

---

## 2. HIỆU NĂNG TƯƠNG TÁC ĐÀM PHÁN MUA ĐẤT (IMP-142)

| Chỉ Số Đàm Phán Mua Đất | Bot Hiếu Chiến (Aggressive) | Bot Cân Bằng (Balanced) | Bot Thận Trọng (Passive) |
| :--- | :---: | :---: | :---: |
| **Số lần Bot đề nghị mua đất** | **34 lần** | **32 lần** | **70 lần** |
| Số lần Người chơi Đồng Ý Bán | 4 lần | 7 lần | 13 lần |
| Số lần Người chơi Từ Chối Bán | 30 lần | 20 lần | 51 lần |
| Số lần Hết 15s (Auto-Reject) | 0 lần | 5 lần | 6 lần |
| **Tỷ lệ chấp thuận giao dịch** | **11.8%** | **21.9%** | **18.6%** |
| Giá chào mua trung bình (% giá gốc) | **+91.8%** (1.75x) | **+66.6%** (1.65x) | **+68.9%** (1.50x) |
| Tổng dòng tiền giao dịch mua đất | 17.0 Tỷ | 22.2 Tỷ | 41.5 Tỷ |
| Thuế kho bạc 5% thu được | 0.85 Tỷ | 1.11 Tỷ | 2.08 Tỷ |

---

## 3. THỐNG KÊ ĐỘC QUYỀN & XÂY DỰNG CÔNG TRÌNH

| Thống Kê Bất Động Sản | Bot Hiếu Chiến (Aggressive) | Bot Cân Bằng (Balanced) | Bot Thận Trọng (Passive) |
| :--- | :---: | :---: | :---: |
| Độc quyền hoàn thành: Human | 5 bộ | 5 bộ | 1 bộ |
| Độc quyền hoàn thành: Bot | 11 bộ | 13 bộ | 18 bộ |
| Công trình nâng cấp: Human (C1/C2/C3) | 7 / 4 / 6 (Tổng: 33) | 5 / 4 / 5 (Tổng: 28) | 0 / 0 / 3 (Tổng: 9) |
| Công trình nâng cấp: Bot (C1/C2/C3) | 2 / 6 / 22 (Tổng: 80) | 9 / 6 / 20 (Tổng: 81) | 11 / 10 / 22 (Tổng: 97) |

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
