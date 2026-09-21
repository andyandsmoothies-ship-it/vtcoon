# BÁO CÁO MÔ PHỎNG CHI TIẾT GAMEPLAY VTCOON: 13.000 VÁN ĐẤU (2-3-4 NGƯỜI CHƠI)
> **Mục đích:** Phân tích thực nghiệm toàn diện các kịch bản người thật đấu với các loại Bot AI khác nhau (Passive, Balanced, Aggressive).  
> **Quy mô:** 13 Kịch bản độc lập (2P: 3 case, 3P: 5 case, 4P: 5 case) x 1.000 ván/case = **13000 ván đấu hoàn chỉnh**.  
> **Cơ chế:** Người chơi thật (P1, `isBot = false`) ra quyết định chiến lược (mua đất, đấu giá, nâng cấp nhà C1-C3, thương lượng P2P, cứu nợ thế chấp).  
> **Ngày thực hiện:** 2026-09-21 | Phiên bản: VTCOON Production 1.0

---

## 1. TỔNG HỢP KẾT QUẢ TỶ LỆ THẮNG & ĐỘ CÂN BẰNG TÍNH CÁCH BOT

| Nhóm | Kịch Bản | Human (P1) | Bot Passive | Bot Balanced | Bot Aggressive | Vị Trí Ghế Thắng Cao Nhất | Hạng TB Human | Tài Sản TB Human |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **2P** | 2P: Human vs Bot Thận Trọng (Passive) | **63.3%** | 36.7% | 0% | 0% | P1 (63.3%) | Top 1.37 | 2625 Tr. |
| **2P** | 2P: Human vs Bot Cân Bằng (Balanced) | **66.2%** | 0% | 33.8% | 0% | P1 (66.2%) | Top 1.34 | 3396 Tr. |
| **2P** | 2P: Human vs Bot Hiếu Chiến (Aggressive) | **58.9%** | 0% | 0% | 41.1% | P1 (58.9%) | Top 1.41 | 3563 Tr. |
| **3P** | 3P: Human + 2 Bot Cân Bằng (Standard) | **12.5%** | 0% | 87.5% | 0% | P2 (46.6%) | Top 2.4 | 2722 Tr. |
| **3P** | 3P: Human + 1 Thận Trọng + 1 Cân Bằng | **9.7%** | 38.2% | 52.1% | 0% | P3 (52.1%) | Top 2.48 | 3524 Tr. |
| **3P** | 3P: Human + 1 Cân Bằng + 1 Hiếu Chiến | **13.4%** | 0% | 43.9% | 42.7% | P2 (43.9%) | Top 2.41 | 2916 Tr. |
| **3P** | 3P: Human + 2 Bot Hiếu Chiến (Hardcore) | **13.8%** | 0% | 0% | 86.2% | P2 (43.8%) | Top 2.43 | 2577 Tr. |
| **3P** | 3P: Human + 2 Bot Thận Trọng (Casual) | **13.6%** | 86.4% | 0% | 0% | P3 (43.8%) | Top 2.45 | 4071 Tr. |
| **4P** | 4P: Human + Đủ 3 Bot (Passive + Balanced + Aggressive) | **5.3%** | 26.2% | 41.1% | 27.4% | P3 (41.1%) | Top 3.06 | 2111 Tr. |
| **4P** | 4P: Human + 3 Bot Cân Bằng (Arena) | **8.7%** | 0% | 91.3% | 0% | P2 (33.1%) | Top 2.93 | 2072 Tr. |
| **4P** | 4P: Human + 2 Cân Bằng + 1 Hiếu Chiến | **7%** | 0% | 66.1% | 26.9% | P2 (35.6%) | Top 3.05 | 1738 Tr. |
| **4P** | 4P: Human + 1 Cân Bằng + 2 Hiếu Chiến (Shark Tank) | **8.4%** | 0% | 31.6% | 60% | P3 (32.5%) | Top 2.94 | 2447 Tr. |
| **4P** | 4P: Human + 3 Bot Thận Trọng (Sandbox) | **10.8%** | 89.2% | 0% | 0% | P4 (30.2%) | Top 2.98 | 3385 Tr. |

---

## 2. NHỊP ĐỘ, ĐỘ DÀI TRẬN ĐẤU & CƠ CHẾ KẾT THÚC (PACING & GAME DURATION)

| Kịch Bản | Vòng TB | Lượt TB | Kết Thúc Do Phá Sản % | Kết Thúc Ở Vòng 40 (Max) % | Vòng Có Người Bị Loại Đầu |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 2P: Human vs Bot Thận Trọng (Passive) | **36.1** (Min 2 - Max 40) | 110.2 | **24.1%** | **75.9%** | Vòng 31 |
| 2P: Human vs Bot Cân Bằng (Balanced) | **35.8** (Min 3 - Max 40) | 118.8 | **23.7%** | **76.3%** | Vòng 30.7 |
| 2P: Human vs Bot Hiếu Chiến (Aggressive) | **36.3** (Min 3 - Max 40) | 112.7 | **22.3%** | **77.7%** | Vòng 31.5 |
| 3P: Human + 2 Bot Cân Bằng (Standard) | **36.9** (Min 2 - Max 40) | 157.1 | **15.1%** | **84.9%** | Vòng 31 |
| 3P: Human + 1 Thận Trọng + 1 Cân Bằng | **37.2** (Min 2 - Max 40) | 158.5 | **8.5%** | **91.5%** | Vòng 31.1 |
| 3P: Human + 1 Cân Bằng + 1 Hiếu Chiến | **36.9** (Min 3 - Max 40) | 155.7 | **14.7%** | **85.3%** | Vòng 30.2 |
| 3P: Human + 2 Bot Hiếu Chiến (Hardcore) | **37** (Min 2 - Max 40) | 156.4 | **13.4%** | **86.6%** | Vòng 30.5 |
| 3P: Human + 2 Bot Thận Trọng (Casual) | **37.8** (Min 3 - Max 40) | 156 | **5.5%** | **94.5%** | Vòng 32.8 |
| 4P: Human + Đủ 3 Bot (Passive + Balanced + Aggressive) | **37.8** (Min 2 - Max 40) | 181.1 | **7.6%** | **92.4%** | Vòng 30.2 |
| 4P: Human + 3 Bot Cân Bằng (Arena) | **37.3** (Min 2 - Max 40) | 185.6 | **12.1%** | **87.9%** | Vòng 29.5 |
| 4P: Human + 2 Cân Bằng + 1 Hiếu Chiến | **37.5** (Min 3 - Max 40) | 183.3 | **11.9%** | **88.1%** | Vòng 29.5 |
| 4P: Human + 1 Cân Bằng + 2 Hiếu Chiến (Shark Tank) | **37.3** (Min 2 - Max 40) | 185.4 | **9.6%** | **90.4%** | Vòng 29.2 |
| 4P: Human + 3 Bot Thận Trọng (Sandbox) | **37.9** (Min 2 - Max 40) | 187.7 | **4.5%** | **95.5%** | Vòng 31.1 |

---

## 3. CƠ CHẾ ĐỘC QUYỀN & MỨC ĐỘ KHỐC LIỆT CỦA CÔNG TRÌNH (MONOPOLY & HOTELS)

| Kịch Bản | Tỷ Lệ Độc Quyền | Vòng Độc Quyền Đầu | Độc Quyền Human | Độc Quyền Bot | Nâng Cấp TB/Ván | Tỷ Lệ Đạt Khách Sạn C3 % |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 2P: Human vs Bot Thận Trọng (Passive) | **77.6%** | Vòng 18.1 | 878 bộ | 455 bộ | 6.4 (C1:2848, C2:2263, C3:1290) | **54%** |
| 2P: Human vs Bot Cân Bằng (Balanced) | **78.1%** | Vòng 18.7 | 736 bộ | 564 bộ | 5.1 (C1:2311, C2:1804, C3:1023) | **59.8%** |
| 2P: Human vs Bot Hiếu Chiến (Aggressive) | **80.3%** | Vòng 19.9 | 682 bộ | 646 bộ | 4.6 (C1:2103, C2:1564, C3:926) | **59.1%** |
| 3P: Human + 2 Bot Cân Bằng (Standard) | **94%** | Vòng 13.3 | 142 bộ | 1862 bộ | 1.4 (C1:603, C2:486, C3:327) | **88.6%** |
| 3P: Human + 1 Thận Trọng + 1 Cân Bằng | **92.1%** | Vòng 13.5 | 159 bộ | 2033 bộ | 1.4 (C1:603, C2:475, C3:344) | **85.8%** |
| 3P: Human + 1 Cân Bằng + 1 Hiếu Chiến | **93.8%** | Vòng 13.9 | 161 bộ | 1842 bộ | 1.4 (C1:625, C2:471, C3:296) | **87.9%** |
| 3P: Human + 2 Bot Hiếu Chiến (Hardcore) | **93.1%** | Vòng 13.4 | 163 bộ | 1907 bộ | 1.5 (C1:663, C2:503, C3:309) | **86.7%** |
| 3P: Human + 2 Bot Thận Trọng (Casual) | **94.6%** | Vòng 13.7 | 220 bộ | 2196 bộ | 1.8 (C1:711, C2:632, C3:495) | **83%** |
| 4P: Human + Đủ 3 Bot (Passive + Balanced + Aggressive) | **96.8%** | Vòng 11.1 | 79 bộ | 2555 bộ | 0.7 (C1:300, C2:210, C3:141) | **94.3%** |
| 4P: Human + 3 Bot Cân Bằng (Arena) | **96.8%** | Vòng 10.6 | 94 bộ | 2370 bộ | 0.9 (C1:385, C2:285, C3:204) | **93.4%** |
| 4P: Human + 2 Cân Bằng + 1 Hiếu Chiến | **96.6%** | Vòng 11 | 78 bộ | 2371 bộ | 0.8 (C1:357, C2:266, C3:167) | **93.5%** |
| 4P: Human + 1 Cân Bằng + 2 Hiếu Chiến (Shark Tank) | **95.9%** | Vòng 10.9 | 94 bộ | 2360 bộ | 0.8 (C1:361, C2:281, C3:184) | **91.7%** |
| 4P: Human + 3 Bot Thận Trọng (Sandbox) | **97%** | Vòng 10 | 156 bộ | 2870 bộ | 1.4 (C1:595, C2:488, C3:347) | **93.6%** |

---

## 4. TƯƠNG TÁC ĐÀM PHÁN THƯƠNG LƯỢNG MUA ĐẤT (P2P TRADING DYNAMICS)

| Kịch Bản | Bot Gạ Mua (Lần/Ván) | Human Đồng Ý % | Human Từ Chối % | Hết Giờ 15s % | Giá Mua TB (% Gốc) | Thuế Kho Bạc 5% |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 2P: Human vs Bot Thận Trọng (Passive) | 9.77 (9769 tổng) | **0%** | 94.6% | 5.4% | +71.9% | 0.0 Tỷ |
| 2P: Human vs Bot Cân Bằng (Balanced) | 9.09 (9092 tổng) | **0%** | 95% | 5% | +75.8% | 0.0 Tỷ |
| 2P: Human vs Bot Hiếu Chiến (Aggressive) | 8.21 (8205 tổng) | **0%** | 94.8% | 5.2% | +99.9% | 0.0 Tỷ |
| 3P: Human + 2 Bot Cân Bằng (Standard) | 9.34 (9338 tổng) | **0%** | 95.1% | 4.9% | +74.8% | 0.0 Tỷ |
| 3P: Human + 1 Thận Trọng + 1 Cân Bằng | 10.35 (10345 tổng) | **0%** | 94.9% | 5.1% | +73.1% | 0.0 Tỷ |
| 3P: Human + 1 Cân Bằng + 1 Hiếu Chiến | 8.25 (8253 tổng) | **0%** | 95.1% | 4.9% | +86% | 0.0 Tỷ |
| 3P: Human + 2 Bot Hiếu Chiến (Hardcore) | 7.38 (7383 tổng) | **0%** | 95% | 5% | +98.1% | 0.0 Tỷ |
| 3P: Human + 2 Bot Thận Trọng (Casual) | 14.44 (14440 tổng) | **0%** | 94.8% | 5.2% | +71.3% | 0.0 Tỷ |
| 4P: Human + Đủ 3 Bot (Passive + Balanced + Aggressive) | 8.07 (8070 tổng) | **0%** | 95.2% | 4.8% | +80% | 0.0 Tỷ |
| 4P: Human + 3 Bot Cân Bằng (Arena) | 7.22 (7225 tổng) | **0%** | 95.1% | 4.9% | +74.1% | 0.0 Tỷ |
| 4P: Human + 2 Cân Bằng + 1 Hiếu Chiến | 7.85 (7851 tổng) | **0%** | 94.8% | 5.2% | +80.8% | 0.0 Tỷ |
| 4P: Human + 1 Cân Bằng + 2 Hiếu Chiến (Shark Tank) | 6.83 (6834 tổng) | **0%** | 94.6% | 5.4% | +89% | 0.0 Tỷ |
| 4P: Human + 3 Bot Thận Trọng (Sandbox) | 12.89 (12892 tổng) | **0%** | 95% | 5% | +71.8% | 0.0 Tỷ |

---

## 5. SÀN ĐẤU GIÁ, THANH KHOẢN & SÀN CHỨNG KHOÁN HOSE

| Kịch Bản | Đấu Giá/Ván | Đấu Thắng % | Phát Mãi 70% | Nguy Cơ Nợ/Ván | Cứu Nợ % | Chuộc Đất % | Thẻ Rút/Ván | Sàn HOSE/Ván |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 2P: Human vs Bot Thận Trọng (Passive) | 6.5 | 96% | **0%** | 0 | 100% | 31.5% | 11.3 | 0.44 |
| 2P: Human vs Bot Cân Bằng (Balanced) | 5.4 | 92.3% | **0%** | 0 | 100% | 32.8% | 11 | 0.54 |
| 2P: Human vs Bot Hiếu Chiến (Aggressive) | 4.6 | 98.8% | **0%** | 0 | 100% | 36.5% | 11.3 | 0.55 |
| 3P: Human + 2 Bot Cân Bằng (Standard) | 7.7 | 75.2% | **0%** | 0 | 100% | 50.3% | 17.1 | 0.59 |
| 3P: Human + 1 Thận Trọng + 1 Cân Bằng | 7.7 | 90.6% | **0%** | 0 | 100% | 56.9% | 17.3 | 0.59 |
| 3P: Human + 1 Cân Bằng + 1 Hiếu Chiến | 7.3 | 76.8% | **0%** | 0 | 100% | 52.9% | 16.9 | 0.58 |
| 3P: Human + 2 Bot Hiếu Chiến (Hardcore) | 6.8 | 73.5% | **0%** | 0 | 100% | 55.6% | 17.1 | 0.61 |
| 3P: Human + 2 Bot Thận Trọng (Casual) | 7.6 | 97.9% | **0%** | 0 | 100% | 68.4% | 17.8 | 0.6 |
| 4P: Human + Đủ 3 Bot (Passive + Balanced + Aggressive) | 9.2 | 61% | **0%** | 0 | 100% | 54.3% | 22.7 | 0.66 |
| 4P: Human + 3 Bot Cân Bằng (Arena) | 9.2 | 46.1% | **0%** | 0 | 100% | 50.2% | 22.3 | 0.64 |
| 4P: Human + 2 Cân Bằng + 1 Hiếu Chiến | 9 | 46.8% | **0%** | 0 | 100% | 52% | 22.2 | 0.57 |
| 4P: Human + 1 Cân Bằng + 2 Hiếu Chiến (Shark Tank) | 8.5 | 48% | **0%** | 0 | 100% | 54% | 22.2 | 0.59 |
| 4P: Human + 3 Bot Thận Trọng (Sandbox) | 9.4 | 65.2% | **0%** | 0 | 100% | 62.3% | 23.2 | 0.57 |

---

## 6. KIỂM CHỨNG BẤT BIẾN HỆ THỐNG (HARD SYSTEM INVARIANTS)

| Kịch Bản | Deadlock (>500 turns) | Rò Rỉ / Âm Kho Bạc | Số Dư Lỗi NaN | Mua Đất Ngầm (Premature) |
| :--- | :---: | :---: | :---: | :---: |
| 2P: Human vs Bot Thận Trọng (Passive) | 79 | 0 | 0 | 0 |
| 2P: Human vs Bot Cân Bằng (Balanced) | 99 | 0 | 0 | 0 |
| 2P: Human vs Bot Hiếu Chiến (Aggressive) | 85 | 0 | 0 | 0 |
| 3P: Human + 2 Bot Cân Bằng (Standard) | 108 | 0 | 0 | 0 |
| 3P: Human + 1 Thận Trọng + 1 Cân Bằng | 110 | 0 | 0 | 0 |
| 3P: Human + 1 Cân Bằng + 1 Hiếu Chiến | 108 | 0 | 0 | 0 |
| 3P: Human + 2 Bot Hiếu Chiến (Hardcore) | 108 | 0 | 0 | 0 |
| 3P: Human + 2 Bot Thận Trọng (Casual) | 99 | 0 | 0 | 0 |
| 4P: Human + Đủ 3 Bot (Passive + Balanced + Aggressive) | 84 | 0 | 0 | 0 |
| 4P: Human + 3 Bot Cân Bằng (Arena) | 103 | 0 | 0 | 0 |
| 4P: Human + 2 Cân Bằng + 1 Hiếu Chiến | 94 | 0 | 0 | 0 |
| 4P: Human + 1 Cân Bằng + 2 Hiếu Chiến (Shark Tank) | 102 | 0 | 0 | 0 |
| 4P: Human + 3 Bot Thận Trọng (Sandbox) | 93 | 0 | 0 | 0 |

---

## 7. ĐÁNH GIÁ ĐỘC QUYỀN THEO NHÓM MÀU (PHÂN TÍCH CHIẾN THUẬT)

Thống kê tần suất hoàn thành độc quyền các nhóm màu trên toàn bộ 13.000 ván đấu:
- **Nhóm màu Nau**: 5629 lần hoàn thành độc quyền.
- **Nhóm màu Tim**: 4253 lần hoàn thành độc quyền.
- **Nhóm màu XanhDaTroi**: 3681 lần hoàn thành độc quyền.
- **Nhóm màu Hong**: 3253 lần hoàn thành độc quyền.
- **Nhóm màu Cam**: 3253 lần hoàn thành độc quyền.
- **Nhóm màu Do**: 2780 lần hoàn thành độc quyền.
- **Nhóm màu Vang**: 2660 lần hoàn thành độc quyền.
- **Nhóm màu XanhLa**: 2164 lần hoàn thành độc quyền.
