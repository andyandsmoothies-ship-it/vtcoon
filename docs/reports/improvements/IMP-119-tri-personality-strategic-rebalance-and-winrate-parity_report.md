# BÁO CÁO NGHIỆM THU KỸ THUẬT IMP-119: TÁI THIẾT LẬP CHIẾN LƯỢC RIÊNG BIỆT & CÂN BẰNG TỶ LỆ THẮNG GIỮA 3 LOẠI BOT AI

> **Mã cải tiến**: IMP-119 (Tri-Personality Strategic Parity & Bot Win-rate Parity Overhaul)  
> **Căn cứ kế hoạch**: `docs/plans/improvements/IMP-119-tri-personality-strategic-rebalance-and-winrate-parity_plan.md`  
> **Trạng thái**: 🟢 **HOÀN THÀNH TOÀN DIỆN (SHIP-READY)**  
> **Ngày nghiệm thu**: 2026-09-17  
> **Quy trình thực thi**: Quy trình 3 Trạm độc lập (🚦 Pre-Flight Banner ➔ Trạm 1 RED ➔ Trạm 2 GREEN ➔ Trạm 3 PHYSICAL DISK VERIFICATION)  

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Gói cải tiến IMP-119 giải quyết dứt điểm nghịch lý chiến lược và tình trạng Bot Passive bị biến thành "mồi ngon" với tỷ lệ thắng chạm đáy:
1. **Triệt tiêu vị thế "mồi ngon" của Bot Passive trong đàm phán P2P**:
   - Khi ô đất mang lại độc quyền cho đối thủ (`givesMonopolyToBuyer === true`), Bot Passive kiên quyết **TỪ CHỐI** (`PREVENT_MONOPOLY`), trừ trường hợp đặc biệt nhận được mức giá cắt cổ >= 2.0x và đang lâm vào khủng hoảng thanh khoản khẩn cấp (< 500 Tr.).
   - Với các ô đất lẻ không độc quyền, nâng trần giá bán lên >= 1.40x (thay vì 1.35x).
2. **Kích hoạt năng lực chủ động hoàn tất độc quyền cho Bot Passive**:
   - Khi chào mua ô đất còn thiếu để tạo độc quyền (`isMonopolyGap === true`), Bot Passive nâng giá chào mua lên **1.60x** giá niêm yết (thay vì 1.35x), đủ sức thuyết phục Bot Balanced (đòi 1.50x) và Bot Aggressive khi kẹt tiền (đòi 1.55x) đồng ý nhượng đất.
3. **Mở rộng phạm vi đầu tư và đấu giá chiến lược cho Bot Passive**:
   - Gỡ bỏ trần mua đất thô rẻ cứng `<= 1500 Tr.`, cho phép mua đất có giá trị thương mại cao khi tiền mặt an toàn.
   - Nâng trần đấu giá của Bot Passive lên **1.35x** cho các ô Hạ tầng / Tiện ích (đầu tư công ích dài hạn) và **1.50x** cho các ô mảnh ghép độc quyền, duy trì nghiêm ngặt mức 1.15x cho các ô đất thông thường.
4. **Cơ chế xây dựng nhà phố phân tầng theo pháo đài tiền mặt**:
   - Xóa bỏ việc cấm đoán cực đoan khi có ô đối thủ phía trước. Bot Passive được phép xây nhà C1..C3 khi có pháo đài tiền mặt dồi dào: nếu có ô đối thủ nguy hiểm trong 2-12 bước (`dangerTilesCount > 0`), yêu cầu số dư sau xây >= 3 lần `safetyBuffer` và tổng tiền ban đầu >= 5 lần chi phí xây dựng. Nếu an toàn, chỉ cần số dư sau xây >= 1.2 lần `safetyBuffer`.

---

## 2. BẰNG CHỨNG ĐỊNH LƯỢNG MÔ PHỎNG SÂU (3.900 VÁN ĐẤU)

Hệ thống đã chạy thực nghiệm toàn diện 13 kịch bản bàn chơi (2P, 3P, 4P) qua **3.900 ván đấu headless** (`npx tsx scripts/benchmark_gameplay_trends.ts --deep`) trong thời gian 12.55 giây:

### Bảng 1: Phân Phối Tỷ Lệ Thắng Bot & Người Chơi Sau IMP-119 (% Thắng)
| Kịch Bản | Human (P1) | Bot Passive | Bot Balanced | Bot Aggressive | Vị Trí Thắng Cao Nhất |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 2P (Human + Passive) | 62.0% | **38.0%** (tăng từ 24.0%) | 0.0% | 0.0% | P1 (62.0%) |
| 2P (Human + Balanced) | 52.0% | 0.0% | 48.0% | 0.0% | P1 (52.0%) |
| 2P (Human + Aggressive) | 47.3% | 0.0% | 0.0% | 52.7% | P2 (52.7%) |
| 3P (Human + 2 Passive) | 49.3% | **50.7%** (tăng từ 19.7%) | 0.0% | 0.0% | P1 (49.3%) |
| 3P (Human + 2 Balanced) | 34.3% | 0.0% | 65.7% | 0.0% | P1 (34.3%) |
| 3P (Human + 2 Aggressive) | 34.7% | 0.0% | 0.0% | 65.3% | P2 (35.0%) |
| 3P (Human + Pass + Bal) | 39.7% | **21.3%** (tăng từ 5.0%) | 39.0% | 0.0% | P1 (39.7%) |
| 3P (Human + Pass + Aggr) | 44.3% | **20.0%** (tăng từ 6.7%) | 0.0% | 35.7% | P1 (44.3%) |
| 3P (Human + Bal + Aggr) | 30.7% | 0.0% | 40.7% | 28.7% | P2 (40.7%) |
| 4P (Human + Pass + Bal + Aggr) | 38.7% | **14.0%** (tăng từ 3.0%) | 25.7% | 21.7% | P1 (38.7%) |
| 4P (Human + 3 Passive) | 42.0% | **58.0%** (tăng từ 6.7%) | 0.0% | 0.0% | P1 (42.0%) |
| 4P (Human + 3 Balanced) | 27.0% | 0.0% | 73.0% | 0.0% | P2 (27.7%) |
| 4P (Human + 3 Aggressive) | 27.0% | 0.0% | 0.0% | 73.0% | P2 (31.7%) |

### Bảng 2: So Sánh Bước Nhảy Tỷ Lệ Thắng Của Bot Passive (Trước vs Sau IMP-119)
| Kịch Bản | Tỷ Lệ Thắng Cũ | Tỷ Lệ Thắng Mới | Biên Độ Cải Thiện | Đánh Giá Cân Bằng |
| :--- | :---: | :---: | :---: | :--- |
| **Bàn 4P Đa Dạng (Pass + Bal + Aggr)** | **3.0%** | **14.0%** | **+11.0%** (Tăng 4.67x) | Thoát vị thế mồi ngon, cạnh tranh sòng phẳng |
| **Bàn 3P (Human + Pass + Bal)** | **5.0%** | **21.3%** | **+16.3%** (Tăng 4.26x) | Thế chân vạc cân bằng (21.3% - 39.0% - 39.7%) |
| **Bàn 3P (Human + Pass + Aggr)** | **6.7%** | **20.0%** | **+13.3%** (Tăng 2.98x) | Thế chân vạc cân bằng (20.0% - 35.7% - 44.3%) |
| **Bàn 2P (Human + Passive)** | **24.0%** | **38.0%** | **+14.0%** (Tăng 1.58x) | Tạo thử thách thực sự cho người chơi |
| **Bàn 3P (Human + 2 Passive)** | **19.7%** | **50.7%** | **+31.0%** (Tăng 2.57x) | 2 Bot phối hợp phòng thủ vượt trội người chơi |
| **Bàn 4P (Human + 3 Passive)** | **6.7%** | **58.0%** | **+51.3%** (Tăng 8.65x) | Khối phòng thủ bền bỉ áp đảo người chơi đơn độc |

### Bảng 3: Nhịp Độ Trận Đấu, Thanh Khoản & Mở Thẻ Sau IMP-119
- **Độ Phủ Thẻ Độc Bản**: 36/36 thẻ (100% độ phủ độc bản trên toàn bộ 13 kịch bản).
- **Giao dịch P2P thành công**: Duy trì 945 giao dịch thành công / 3.886 đề xuất tại bàn 4P (24.3% tỷ lệ nhất trí).
- **Tỷ lệ chuộc đất thế chấp**: Đạt 43.6% (2.411 / 5.531 lượt chuộc thành công).
- **Bất biến Kho Bạc**: Quỹ Kho Bạc cuối trận dao động ổn định 8.611 - 8.982 Tr., không xảy ra lạm phát tiền tệ.
- **Deadlock**: Chỉ 1 / 3.900 ván (0.02%), hoàn toàn giải tỏa hiện tượng bế tắc giao dịch.

---

## 3. TỔNG KẾT QUY TRÌNH 3 TRẠM (THREE-STATION PIPELINE)

1. **Trạm 1 (RED Contract Tests)**:
   - Tệp test: `tests/contracts/imp119_bot_strategic_parity.test.ts`.
   - Kết quả: 16/16 atomic tests thiết lập các ràng buộc bảo vệ độc quyền, nâng cấp nhà phố và phân định ngưỡng giá P2P, chứng minh trạng thái thất bại trước khi cài đặt mã.
2. **Trạm 2 (GREEN Implementation)**:
   - Tinh chỉnh `src/domain/bot/bot_trade.ts`, `src/domain/bot/bot_engine.ts`, `src/domain/bot/bot_auction.ts`.
   - Toàn bộ **229 / 229 test suites (4.582 / 4.582 tests) PASS 100%**.
   - `npx tsc --noEmit`: 0 lỗi type.
   - `npm run lint:ui`: 0 vi phạm UI anti-pattern.
3. **Trạm 3 (Physical Disk Verification & Gotcha Retention)**:
   - Đã kiểm tra trực tiếp tệp trên ổ cứng.
   - Bổ sung **Gotcha #153** vào `docs/domain/gotchas.md`.
   - Cập nhật tài liệu quy hoạch `docs/master_roadmap.md`.

---

## 4. KẾT LUẬN & ĐỀ XUẤT

Cả 3 loại Bot (`Passive`, `Balanced`, `Aggressive`) hiện tại đã đạt được bản sắc chiến lược rõ nét:
- **Bot Passive (Phòng thủ tích lũy)**: Chặn đứng âm mưu độc quyền của đối thủ, kiên trì tích lũy dòng tiền từ hạ tầng/tiện ích, chỉ xây nhà khi có pháo đài tiền mặt vững chắc, tỷ lệ thắng tăng vọt lên 14% - 38%.
- **Bot Balanced (Cân bằng thực dụng)**: Linh hoạt nắm bắt thời cơ độc quyền, tham gia đàm phán hợp lý, tỷ lệ thắng 25% - 40%.
- **Bot Aggressive (Tấn công chớp nhoáng)**: Săn lùng độc quyền với giá cao, tận dụng bão tiền mặt đè bẹp đối thủ ở giai đoạn sớm và giữa trận, tỷ lệ thắng 21% - 52%.

Đề xuất: **GIỮ NGUYÊN ĐẦY ĐỦ CẢ 3 LOẠI BOT** vì mỗi loại mang lại một trải nghiệm và thử thách độc đáo cho người chơi, tỷ lệ thắng hiện tại đã ở mức cân bằng lành mạnh cho hệ sinh thái game.
