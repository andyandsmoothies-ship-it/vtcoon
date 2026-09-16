# BÁO CÁO KHẢO SÁT XU HƯỚNG GAME & ĐỘ CÂN BẰNG BOT AI (VTCOON GAMEPLAY TRENDS & BOT BALANCE BENCHMARK)

> **Mã báo cáo**: BM-2026-09-TRENDS  
> **Quy mô thực nghiệm**: 3.900 ván đấu headless (13 kịch bản x 300 ván/kịch bản)  
> **Công cụ đo lường**: `scripts/benchmark_gameplay_trends.ts` (`cmd /c npx tsx scripts/benchmark_gameplay_trends.ts --deep`)  
> **Thời gian thực thi**: 7.61 giây trên nền tảng Node v24 in-memory (0ms delay, deterministic PRNG)  
> **Phiên bản hệ thống**: VTCOON Core Engine v0.0.0 (Sau IMP-113 & IMP-114).

---

## 1. TỔNG QUAN PHƯƠNG PHÁP & MA TRẬN KỊCH BẢN (TEST MATRIX)

Thử nghiệm thiết lập 1 Người chơi cơ sở tại vị trí P1 (đóng vai trò đại diện người chơi chuẩn - Human Baseline P1, sử dụng chiến thuật Cân Bằng / Balanced) đối đầu với các tổ hợp Bot AI thuộc 3 tính cách:
- **Passive (Cẩn Trọng)**: Duy trì tiền mặt cao (`minBuffer` lớn), hạn chế mạo hiểm gom đất, hiếm khi nâng giá đấu giá.
- **Balanced (Cân Bằng)**: Đầu tư chừng mực, nhận diện cơ hội độc quyền màu (Monopoly Gap), bảo toàn đệm an toàn.
- **Aggressive (Hiếu Chiến)**: Mua đất tối đa, chấp nhận cạn tiền mặt, nâng giá đấu giá quyết liệt.

```
[Human Baseline P1 (Balanced)]
            │
            ├──> [Nhóm 2P: 3 Kịch bản (300 ván x 3 = 900 ván)]
            │     ├── H + Passive
            │     ├── H + Balanced
            │     └── H + Aggressive
            │
            ├──> [Nhóm 3P: 6 Kịch bản (300 ván x 6 = 1.800 ván)]
            │     ├── Homogeneous: (H + 2P), (H + 2B), (H + 2A)
            │     └── Mixed:       (H + P + B), (H + P + A), (H + B + A)
            │
            └──> [Nhóm 4P: 4 Kịch bản (300 ván x 4 = 1.200 ván)]
                  ├── Diverse:     H + Pass + Bal + Aggr (Kịch bản thực tế điển hình)
                  └── Homogeneous: (H + 3P), (H + 3B), (H + 3A)
```

---

## 2. BẢNG DỮ LIỆU TỔNG HỢP TOÀN DIỆN (3.900 VÁN)

### Bảng 1: Tỷ Lệ Thắng & Độ Cân Bằng Tính Cách Bot (% Thắng Cuộc)

| Kịch Bản | Human (P1) | Bot Passive | Bot Balanced | Bot Aggressive | Vị Trí Thắng Cao Nhất |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **2P (Human + Passive)** | **68.3%** | 31.7% | - | - | P1 (68.3%) |
| **2P (Human + Balanced)** | **48.3%** | - | **51.7%** | - | P2 (51.7%) |
| **2P (Human + Aggressive)** | **44.7%** | - | - | **55.3%** | P2 (55.3%) |
| **3P (Human + 2 Passive)** | **76.7%** | 23.3% (11.7%/bot) | - | - | P1 (76.7%) |
| **3P (Human + 2 Balanced)** | **36.0%** | - | **64.0%** (32.0%/bot) | - | P1 (36.0%) |
| **3P (Human + 2 Aggressive)** | **34.3%** | - | - | **65.7%** (32.9%/bot) | P2 (35.0%) |
| **3P (Human + Passive + Balanced)** | **47.7%** | 11.7% | 40.7% | - | P1 (47.7%) |
| **3P (Human + Passive + Aggressive)** | **57.7%** | 8.3% | - | 34.0% | P1 (57.7%) |
| **3P (Human + Balanced + Aggressive)** | **38.0%** | - | 31.0% | 31.0% | P1 (38.0%) |
| **4P (Human + Pass + Bal + Aggr)** | **34.3%** | 13.3% | 28.7% | 23.7% | P1 (34.3%) |
| **4P (Human + 3 Passive)** | **78.7%** | 21.3% (7.1%/bot) | - | - | P1 (78.7%) |
| **4P (Human + 3 Balanced)** | **30.3%** | - | **69.7%** (23.2%/bot) | - | P1 (30.3%) |
| **4P (Human + 3 Aggressive)** | **25.7%** | - | - | **74.3%** (24.8%/bot) | P2 (28.0%) |

---

### Bảng 2: Nhịp Độ, Độ Dài Ván & Phát Triển Bất Động Sản

| Kịch Bản | Vòng TB | Lượt TB | Phá Sản % | Hết 30 Vòng % | Vòng Độc Quyền Đầu | Tỷ Lệ Độc Quyền | C1+C2+C3/Ván |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **2P (Human + Passive)** | 29.99 | 58.1 | 0.3% | 99.7% | Vòng 15.7 | 87.0% | 6.06 |
| **2P (Human + Balanced)** | 29.90 | 57.9 | 1.3% | 98.7% | Vòng 16.3 | 83.0% | 8.87 |
| **2P (Human + Aggressive)** | 30.00 | 58.0 | 0.0% | 100% | Vòng 16.4 | 77.0% | 7.83 |
| **3P (Human + 2 Passive)** | 30.00 | 87.2 | 0.0% | 100% | Vòng 13.9 | 72.0% | 3.48 |
| **3P (Human + 2 Balanced)** | 30.00 | 87.0 | 0.0% | 100% | Vòng 14.8 | 67.0% | 6.49 |
| **3P (Human + 2 Aggressive)** | 30.00 | 86.9 | 0.0% | 100% | Vòng 15.4 | 69.7% | 5.81 |
| **3P (Human + Passive + Balanced)** | 30.00 | 87.1 | 0.0% | 100% | Vòng 15.4 | 70.7% | 5.28 |
| **3P (Human + Passive + Aggressive)** | 30.00 | 87.1 | 0.0% | 100% | Vòng 14.8 | 71.3% | 5.23 |
| **3P (Human + Balanced + Aggressive)** | 29.99 | 86.9 | 0.3% | 99.7% | Vòng 15.0 | 66.0% | 5.99 |
| **4P (Human + Pass + Bal + Aggr)** | 30.00 | 116.0 | 0.0% | 100% | Vòng 13.4 | 55.0% | 4.14 |
| **4P (Human + 3 Passive)** | 30.00 | 116.2 | 0.0% | 100% | Vòng 14.0 | 59.3% | 2.60 |
| **4P (Human + 3 Balanced)** | 30.00 | 116.0 | 0.0% | 100% | Vòng 14.2 | 58.3% | 5.61 |
| **4P (Human + 3 Aggressive)** | 30.00 | 116.1 | 0.0% | 100% | Vòng 14.3 | 53.7% | 4.53 |

---

### Bảng 3: Khủng Hoảng Thanh Khoản, Đấu Giá & Bất Biến Hệ Thống

| Kịch Bản | Nợ/Ván | Cứu Nợ % | Đấu Giá/Ván | Thầu Thắng % | Phát Mãi % | Kho Bạc Cuối | Deadlock |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **2P (Human + Passive)** | 0.71 | 77.8% | 7.14 | 91.5% | 8.5% | 8.600 Tr. | 0 |
| **2P (Human + Balanced)** | 1.61 | 64.5% | 6.12 | 81.7% | 18.3% | 8.695 Tr. | 0 |
| **2P (Human + Aggressive)** | 0.87 | 100% | 5.89 | 83.6% | 16.4% | 8.713 Tr. | 0 |
| **3P (Human + 2 Passive)** | 0.48 | 99.3% | 7.67 | 90.3% | 0.2% | 8.805 Tr. | 0 |
| **3P (Human + 2 Balanced)** | 1.48 | 98.2% | 6.76 | 88.0% | 3.4% | 8.844 Tr. | 0 |
| **3P (Human + 2 Aggressive)** | 1.51 | 98.0% | 6.03 | 88.4% | 4.0% | 8.791 Tr. | 0 |
| **3P (Human + Passive + Balanced)** | 0.97 | 98.6% | 7.82 | 88.8% | 2.2% | 8.842 Tr. | 0 |
| **3P (Human + Passive + Aggressive)** | 1.18 | 99.2% | 7.47 | 91.5% | 1.4% | 8.883 Tr. | 0 |
| **3P (Human + Balanced + Aggressive)** | 1.63 | 89.3% | 6.40 | 89.0% | 3.7% | 8.872 Tr. | 0 |
| **4P (Human + Pass + Bal + Aggr)** | 1.40 | 96.9% | 7.55 | 99.6% | 0.4% | 8.877 Tr. | 0 |
| **4P (Human + 3 Passive)** | 0.43 | 100% | 8.03 | 100% | 0.0% | 8.819 Tr. | 0 |
| **4P (Human + 3 Balanced)** | 1.22 | 95.9% | 6.26 | 98.6% | 0.6% | 8.838 Tr. | 0 |
| **4P (Human + 3 Aggressive)** | 1.10 | 97.3% | 5.16 | 99.4% | 0.3% | 8.775 Tr. | 0 |

---

## 3. NHẬN ĐỊNH & PHÂN TÍCH XU HƯỚNG GAMEPLAY (KEY FINDINGS)

### A. Đánh Giá Độ Cân Bằng Giữa 3 Tính Cách Bot AI
1. **Bot Passive (Cẩn Trọng) đang quá yếu**:
   - Tỷ lệ thắng của Passive cực thấp: chỉ đạt 31.7% ở bàn 2 người, 11.7%/bot ở bàn 3 người, và 7.1%/bot ở bàn 4 người.
   - Trong bàn thực tế 4 người (`4P_Diverse`), Passive chỉ giành 13.3% chiến thắng.
   - *Nguyên nhân*: Bot Passive giữ trần tiền mặt dự phòng quá cao (`minBuffer = 1.000 Tr. VNĐ`), thường xuyên từ chối mua đất và rút lui sớm khỏi các phiên đấu giá. Kết quả: Passive không gom được đất, không tạo được độc quyền (chỉ xây được 2.4 - 3.5 công trình/ván), và liên tục bị bào mòn tiền mặt khi bước vào đất của các đối thủ khác.
2. **Bot Balanced (Cân Bằng) là hình mẫu đối trọng lý tưởng**:
   - Ở bàn 2 người: Human 48.3% vs Bot Balanced 51.7% (gần đạt tỷ lệ 50-50 hoàn hảo).
   - Ở bàn 3 người (H + 2B): Human 36.0% vs 2 Bot Balanced 64.0% (trung bình 32.0%/bot, rất sát mốc cân bằng lý thuyết 33.3%).
   - Ở bàn 4 người (H + 3B): Human 30.3% vs 3 Bot Balanced 69.7% (trung bình 23.2%/bot, rất sát mốc cân bằng lý thuyết 25.0%).
   - Balanced thể hiện sự hài hòa cao nhất giữa gom đất, tạo độc quyền qua P2P và duy trì dự phòng an toàn.
3. **Bot Aggressive (Hiếu Chiến) cực mạnh ở 2P nhưng suy giảm nhẹ ở 4P**:
   - Ở bàn 2 người: Aggressive áp đảo Human (55.3% vs 44.7%) do tốc độ thâu tóm đất nhanh, khóa chặt các ô chiến lược và tạo độc quyền sớm bóp nghẹt 1 đối thủ duy nhất.
   - Ở bàn 4 người: Tỷ lệ thắng của Aggressive giảm xuống 23.7% (trong bàn Diverse) và 24.8%/bot (trong bàn 3A). Khi có 4 người chơi cùng tranh chấp, Aggressive gom đất dàn trải làm cạn kiệt tiền mặt, dễ bị tổn thương khi dẫm vào đất của nhiều đối thủ khác nhau.

---

### B. Nhịp Độ Ván Đấu: Hiện Tượng Kéo Dài 30 Vòng (The 30-Round Ceiling)
- **Tỷ lệ kết thúc do Phá sản cực thấp (chỉ 0.0% đến 1.3%)**:
  Toàn bộ 13 kịch bản đều có số vòng trung bình từ 29.90 đến 30.00 vòng. Gần 99% ván đấu chạm trần 30 vòng (`MAX_ROUNDS = 30`) và định đoạt thắng thua bằng Tổng Tài Sản Ròng (Net Worth).
- *Lý do kỹ thuật*:
  Hệ thống cứu nợ 5 bước (Thế chấp / Bán nhà hạ cấp) kết hợp với Cơ chế Xả Quỹ Kho Bạc Kích Cầu Vĩ Mô (IMP-114, giải ngân 20% khi quỹ >= 10.000 Tr.) đã bảo vệ người chơi quá tốt trước nguy cơ phá sản. Người chơi thiếu nợ được bơm vốn hoặc thế chấp để phục hồi (tỷ lệ cứu nợ đạt 95% - 100% ở bàn 3P và 4P).
- *Hệ quả trải nghiệm*: Người chơi không bị loại sớm (tốt cho trải nghiệm xã hội), nhưng ván đấu thiếu các cú hạ knock-out dứt điểm ở giai đoạn cuối trận (Late-Game Knockout).

---

### C. Khác Biệt Giữa Bàn 2 Người vs Bàn 4 Người
1. **Bàn 2 Người**:
   - Tỷ lệ có độc quyền rất cao (77% - 87%), nhưng độc quyền xuất hiện muộn (Vòng 15.7 - 16.4).
   - Tỷ lệ đấu giá bị phát mãi về Kho Bạc cao (7.5% - 18.3%) vì chỉ có 1 đối thủ tham gia đấu thầu.
   - Vốn khởi điểm 25.000 Tr. VNĐ tương đối dư dả, người chơi ít khi bị nợ trong 10 vòng đầu.
2. **Bàn 4 Người**:
   - Độc quyền xuất hiện sớm hơn nếu có giao dịch P2P thành công (Vòng 13.2 - 14.3), nhưng tỷ lệ bàn có độc quyền lại thấp hơn (chỉ 53.7% - 59.3%). Nguyên nhân: 28 ô mua bán bị chia đều cho 4 người (trung bình 7 ô/người), khiến việc thu gom đủ 2-3 ô cùng nhóm màu trở nên khó khăn nếu không đàm phán P2P tích cực.
   - Tỷ lệ đấu giá thành công đạt gần như tuyệt đối (98.6% - 100%), tính cạnh tranh giành đất cực kỳ sôi nổi.

---

## 4. ĐỀ XUẤT CẢI TIẾN CÂN BẰNG GAMEPLAY (BALANCING RECOMMENDATIONS)

Dựa trên dữ liệu định lượng từ 3.900 ván đấu, kiến nghị 4 giải pháp tinh chỉnh:

### Đề Xuất 1: Tăng Cường Năng Lực Cho Bot Passive (Buff Passive Bot)
- **Vấn đề**: Bot Passive chỉ thắng 7% - 13% ở bàn 4 người, trở thành "mồi ngon" bị các bot khác chèn ép.
- **Giải pháp**:
  * Giảm `minBuffer` của Passive từ 1.000 Tr. xuống 600 Tr. VNĐ.
  * Cho phép Bot Passive tham gia đấu giá nếu mức giá thầu chưa vượt quá 1.15x giá niêm yết (thay vì rút lui ngay sau lượt đầu).

### Đề Xuất 2: Kích Hoạt Áp Lực Tăng Giá Thuê Cuối Trận (Late-Game Rent Surge / Inflation)
- **Vấn đề**: 99.7% ván đấu kết thúc do chạm trần 30 vòng, thiếu các tình huống phá sản kịch tính ở chặng cuối.
- **Giải pháp**:
  * Từ **Vòng 20 trở đi**, áp dụng hệ số "Lạm Phát Đô Thị": Tăng giá thuê của các công trình Cấp 2 và Cấp 3 thêm 30% - 50%.
  * Giúp tạo các cú "bùng nổ sát thương" hạ knock-out đối thủ, rút ngắn độ dài ván xuống khoảng 24 - 27 vòng một cách tự nhiên.

### Đề Xuất 3: Thúc Đẩy Hình Thành Độc Quyền Ở Bàn 4 Người (4P Monopoly Acceleration)
- **Vấn đề**: Ở bàn 4 người, tỷ lệ hình thành độc quyền chỉ đạt 55%, khiến nhiều ván đấu không ai xây được khách sạn C3.
- **Giải pháp**:
  * Mở khóa đàm phán P2P tạo Monopoly Gap sớm hơn: từ **Vòng 4** (thay vì vòng 6) khi chơi bàn 4 người.
  * Hỗ trợ Bot P2P hoán đổi đất trực tiếp (Property Swap kèm bù tiền) khi cả 2 bên đều có thể hoàn thành bộ màu.

### Đề Xuất 4: Điều Chỉnh Vốn Khởi Điểm Bàn 2 Người
- **Vấn đề**: Vốn 25.000 Tr. VNĐ ở bàn 2 người khiến người chơi quá an toàn, ít phát sinh áp lực tài chính trong nửa đầu trận.
- **Giải pháp**:
  * Giảm vốn khởi điểm bàn 2 người từ 25.000 Tr. xuống **22.000 Tr. VNĐ** để kích thích quyết định cân nhắc mua đất sớm.
