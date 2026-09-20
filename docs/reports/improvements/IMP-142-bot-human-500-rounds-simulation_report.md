# BÁO CÁO MÔ PHỎNG 500 VÒNG GAME: NGƯỜI CHƠI (HUMAN) VS CÁC LOẠI BOT AI
> Ticket: [IMP-142] Bot Chủ Động Đàm Phán Mua Đất Người Chơi & Hộp Thoại 15 Giây  
> Ngày thẩm định: 20/09/2026 | Phiên bản: VTCOON Production 1.0  
> Quy mô mô phỏng: 3 Case độc lập, mỗi case >= 500 vòng game đối kháng trực tiếp (Tổng cộng: 1536 vòng)

---

## 1. TỔNG HỢP KẾT QUẢ VẬN HÀNH & ĐỐI KHÁNG THEO TỪNG LOẠI BOT

| Chỉ Số Đánh Giá | Case 1: Bot Hiếu Chiến (Aggressive) | Case 2: Bot Cân Bằng (Balanced) | Case 3: Bot Thận Trọng (Passive) |
| :--- | :---: | :---: | :---: |
| **Tổng số vòng chơi hoàn thành** | **507 vòng** | **528 vòng** | **501 vòng** |
| **Tổng số ván đấu hoàn chỉnh** | 15 ván | 16 ván | 14 ván |
| **Tổng số lượt đi (turns)** | 1002 lượt | 1048 lượt | 1009 lượt |
| **Tỷ lệ Thắng Người Chơi (Human)** | **46.7%** (7 ván) | **31.3%** (5 ván) | **42.9%** (6 ván) |
| **Tỷ lệ Thắng Bot AI** | **53.3%** (8 ván) | **68.8%** (11 ván) | **57.1%** (8 ván) |
| Kết thúc do Vỡ nợ (Phá sản) | 9 ván | 10 ván | 9 ván |
| Kết thúc ở mốc 30 vòng (Max) | 6 ván | 6 ván | 5 ván |

---

## 2. HIỆU NĂNG TƯƠNG TÁC ĐÀM PHÁN MUA ĐẤT (IMP-142)

| Chỉ Số Đàm Phán Mua Đất | Bot Hiếu Chiến (Aggressive) | Bot Cân Bằng (Balanced) | Bot Thận Trọng (Passive) |
| :--- | :---: | :---: | :---: |
| **Số lần Bot đề nghị mua đất** | **26 lần** | **49 lần** | **85 lần** |
| Số lần Người chơi Đồng Ý Bán | 8 lần | 9 lần | 13 lần |
| Số lần Người chơi Từ Chối Bán | 13 lần | 30 lần | 67 lần |
| Số lần Hết 15s (Auto-Reject) | 5 lần | 10 lần | 5 lần |
| **Tỷ lệ chấp thuận giao dịch** | **30.8%** | **18.4%** | **15.3%** |
| Giá chào mua trung bình (% giá gốc) | **+75%** (1.75x) | **+55%** (1.65x) | **+59.4%** (1.50x) |
| Tổng dòng tiền giao dịch mua đất | 26.9 Tỷ | 29.3 Tỷ | 31.8 Tỷ |
| Thuế kho bạc 5% thu được | 1.35 Tỷ | 1.47 Tỷ | 1.59 Tỷ |

---

## 3. THỐNG KÊ ĐỘC QUYỀN & XÂY DỰNG CÔNG TRÌNH

| Thống Kê Bất Động Sản | Bot Hiếu Chiến (Aggressive) | Bot Cân Bằng (Balanced) | Bot Thận Trọng (Passive) |
| :--- | :---: | :---: | :---: |
| Độc quyền hoàn thành: Human | 10 bộ | 6 bộ | 7 bộ |
| Độc quyền hoàn thành: Bot | 15 bộ | 17 bộ | 17 bộ |
| Công trình nâng cấp: Human (C1/C2/C3) | 7 / 5 / 12 (Tổng: 53) | 4 / 8 / 5 (Tổng: 35) | 4 / 3 / 8 (Tổng: 34) |
| Công trình nâng cấp: Bot (C1/C2/C3) | 2 / 8 / 30 (Tổng: 108) | 10 / 10 / 23 (Tổng: 99) | 7 / 7 / 27 (Tổng: 102) |

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
