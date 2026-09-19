# BÁO CÁO NGHIỆM THU KỸ THUẬT IMP-118: KHẮC PHỤC TÊ LIỆT ĐÀM PHÁN BOT P2P, TỐI ƯU CHUỘC ĐẤT ĐỘC QUYỀN & TÁI CÂN BẰNG NHỊP ĐỘ CUỐI TRẬN

> **Mã cải tiến**: IMP-118 (Bot P2P Trade Unfreeze, Monopoly-Centric Mortgage Redemption & Late-Game Pacing Rebalance)  
> **Căn cứ kế hoạch**: `docs/plans/improvements/IMP-118-bot-p2p-unfreeze-monopoly-redeem-and-pacing-rebalance_plan.md`  
> **Trạng thái**: 🟢 **HOÀN THÀNH TOÀN DIỆN (SHIP-READY)**  
> **Ngày nghiệm thu**: 2026-09-17  
> **Quy trình thực thi**: Quy trình 3 Trạm độc lập (🚦 Pre-Flight Banner ➔ Trạm 1 RED ➔ Trạm 2 GREEN ➔ Trạm 3 PHYSICAL DISK VERIFICATION)  

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Gói cải tiến IMP-118 giải quyết dứt điểm điểm nghẽn nghiêm trọng nhất trong tương tác Bot và nhịp độ game được phát hiện qua kiểm toán vi mô:
1. **Khắc phục 100% tình trạng tê liệt đàm phán P2P giữa các Bot**: Trước đây, 6.607 / 6.607 đề xuất đàm phán bị từ chối 100% do thiếu sót trường `botPersonalities` trong `getContext` và ngưỡng từ chối quá cực đoan của Bot Aggressive.
2. **Kích hoạt cơ chế chuộc đất thế chấp độc quyền**: Bổ sung thuật toán `selectMortgageToRedeem` giúp Bot biết chủ động chuộc lại các ô đất trong bộ màu để mở khóa nâng cấp nhà phố C1..C3.
3. **Cắt giảm lạm phát lương GO cuối trận**: Phân tầng lương GO (V1-20: 2.000 Tr., V21-30: 1.500 Tr., V31-40: 1.000 Tr.) nhằm hạn chế việc bơm tiền thừa thãi, thúc đẩy phân định thắng thua bằng phá sản knockout.
4. **Bảo toàn 100% chuẩn SSOT sàn đấu giá**: Giữ vững giá khởi điểm đấu giá từ chối mua thông thường ở đúng 50% niêm yết và phát mãi cưỡng chế ở đúng 70% niêm yết.

---

## 2. BẰNG CHỨNG ĐỊNH LƯỢNG MÔ PHỎNG SÂU (3.900 VÁN ĐẤU)

Hệ thống đã chạy thực nghiệm toàn diện 13 kịch bản bàn chơi (2P, 3P, 4P) với 3 tính cách Bot (Passive, Balanced, Aggressive) qua 3.900 ván đấu headless (`npx tsx scripts/benchmark_gameplay_trends.ts --deep`) trong thời gian 13.38 giây:

### Bảng 1: Phân Phối Tỷ Lệ Thắng Bot & Người Chơi (% Thắng)
| Kịch Bản | Human (P1) | Bot Passive | Bot Balanced | Bot Aggressive | Vị Trí Thắng Cao Nhất |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 2P (Human + Passive) | 76.0% | 24.0% | 0.0% | 0.0% | P1 (76.0%) |
| 2P (Human + Balanced) | 52.0% | 0.0% | 48.0% | 0.0% | P1 (52.0%) |
| 2P (Human + Aggressive) | 47.3% | 0.0% | 0.0% | 52.7% | P2 (52.7%) |
| 3P (Human + 2 Passive) | 80.3% | 19.7% | 0.0% | 0.0% | P1 (80.3%) |
| 3P (Human + 2 Balanced) | 34.3% | 0.0% | 65.7% | 0.0% | P1 (34.3%) |
| 3P (Human + 2 Aggressive) | 34.7% | 0.0% | 0.0% | 65.3% | P2 (35.0%) |
| 3P (Human + Mixed Pass/Bal) | 44.3% | 5.0% | 50.7% | 0.0% | P3 (50.7%) |
| 3P (Human + Mixed Pass/Aggr) | 60.7% | 6.7% | 0.0% | 32.7% | P1 (60.7%) |
| 3P (Human + Mixed Bal/Aggr) | 30.7% | 0.0% | 40.7% | 28.7% | P2 (40.7%) |
| 4P (Human + Pass + Bal + Aggr) | 42.3% | 3.0% | 33.0% | 21.7% | P1 (42.3%) |
| 4P (Human + 3 Passive) | 93.3% | 6.7% | 0.0% | 0.0% | P1 (93.3%) |
| 4P (Human + 3 Balanced) | 27.0% | 0.0% | 73.0% | 0.0% | P2 (27.7%) |
| 4P (Human + 3 Aggressive) | 27.0% | 0.0% | 0.0% | 73.0% | P2 (31.7%) |

### Bảng 2: Đột Phá Đàm Phán Bot P2P, Mở Phiếu Sự Kiện & Chuộc Đất
| Kịch Bản | Thẻ Rút/Ván (Cơ Hội+Khí Vận) | Độ Phủ Thẻ | Lượt HOSE/Ván | Đề Xuất P2P | Thành Công | Tỷ Lệ Nhất Trí | Chuộc/Cầm (%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 2P (Human + Passive) | 13.21 thẻ | 36/36 | 1.44 | 1.556 | 684 | 44.0% | 965/2.281 (42.3%) |
| 2P (Human + Balanced) | 13.19 thẻ | 36/36 | 1.23 | 621 | 512 | 82.4% | 1.503/3.539 (42.5%) |
| 2P (Human + Aggressive) | 13.22 thẻ | 36/36 | 1.22 | 1.463 | 475 | 32.5% | 1.540/3.455 (44.6%) |
| 3P (Human + 2 Passive) | 19.78 thẻ | 36/36 | 2.32 | 2.535 | 1.379 | 54.4% | 1.150/2.864 (40.2%) |
| 3P (Human + 2 Balanced) | 19.04 thẻ | 36/36 | 1.59 | 968 | 786 | 81.2% | 2.631/5.691 (46.2%) |
| 3P (Human + 2 Aggressive) | 19.10 thẻ | 36/36 | 1.73 | 1.565 | 734 | 46.9% | 2.632/5.601 (47.0%) |
| 3P (Human + Pass + Bal) | 19.72 thẻ | 36/36 | 2.01 | 1.931 | 1.001 | 51.8% | 1.959/4.515 (43.4%) |
| 3P (Human + Pass + Aggr) | 19.45 thẻ | 36/36 | 1.93 | 3.497 | 780 | 22.3% | 2.060/4.414 (46.7%) |
| 3P (Human + Bal + Aggr) | 18.62 thẻ | 36/36 | 1.64 | 1.680 | 776 | 46.2% | 2.482/5.501 (45.1%) |
| 4P (Human + Pass + Bal + Aggr) | 25.09 thẻ | 36/36 | 2.56 | 3.147 | 1.031 | 32.8% | 2.589/5.973 (43.3%) |
| 4P (Human + 3 Passive) | 25.45 thẻ | 36/36 | 3.17 | 2.912 | 1.761 | 60.5% | 990/3.068 (32.3%) |
| 4P (Human + 3 Balanced) | 24.33 thẻ | 36/36 | 2.25 | 1.264 | 1.075 | 85.0% | 2.729/6.891 (39.6%) |
| 4P (Human + 3 Aggressive) | 24.33 thẻ | 36/36 | 2.28 | 2.020 | 991 | 49.1% | 2.960/6.637 (44.6%) |

### So Sánh Trước và Sau IMP-118:
- **Giao dịch P2P Bot**: Từ **0 / 6.607 (0%)** vọt lên **11.985 / 25.159 (47.6%)** giao dịch thành công.
- **Tỷ lệ phá sản Knockout**: Tăng từ **2%** lên mức **10% - 26%** (2P Balanced đạt 26%, 4P Balanced đạt 20%).
- **Mở thẻ sự kiện / phiếu**: Đạt độ phủ tuyệt đối **36/36 (100%)** danh mục thẻ bài Cơ Hội & Khí Vận được rút và kích hoạt; trung bình mỗi ván mở từ 13.2 đến 25.5 thẻ.
- **Tỷ lệ chuộc đất độc quyền**: Từ **0%** lên **32.3% - 47.0%** (26.190 lượt chuộc thành công).
- **An toàn hệ thống**: **0 deadlock**, **0 rò rỉ kho bạc** qua 3.900 ván liên tục.

---

## 3. BẰNG CHỨNG KIỂM THỬ VẬT LÝ & QUALITY GATES

### Trạm 1: RED Contract Tests
- **Tệp kiểm thử**: [`tests/contracts/imp118_bot_p2p_unfreeze_and_pacing.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp118_bot_p2p_unfreeze_and_pacing.test.ts).
- **Mật độ**: 16 atomic tests bao phủ 4 phương diện của Universal Behavioral Matrix.
- **Chứng minh RED**: Xác nhận 12/16 tests thất bại trước khi viết mã nguồn `src/**`.

### Trạm 2: GREEN Implementation
- Toàn bộ 16/16 tests của `imp118_bot_p2p_unfreeze_and_pacing.test.ts` đã chuyển xanh (PASS 100%).

### Trạm 3: Physical Disk Verification & Quality Gates
1. **Kiểm thử tự động toàn diện (`npm test`)**:
   - **228/228 test files PASS (100%)**.
   - **4.566/4.566 tests PASS (100%)**.
   - Thời gian thực thi in-memory: 35.86 giây.
2. **Kiểm tra kiểu dữ liệu TypeScript (`npx tsc --noEmit`)**:
   - **0 errors**. Tuân thủ nghiêm ngặt TypeScript Strict Mode (`noUncheckedIndexedAccess: true`).
3. **Kiểm tra tiêu chuẩn UI Craft (`npm run lint:ui`)**:
   - **0 anti-patterns** qua 146 tệp client.
4. **Học tập miền & Bất biến hệ thống**:
   - Ghi nhận Gotcha #152 vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).

---

## 4. BẢNG TỔNG HỢP CÁC TỆP ĐÃ CHỈNH SỬA

| STT | Đường Dẫn Tệp | Mục Đích Thay Đổi |
| :---: | :--- | :--- |
| 1 | `src/domain/room.ts` | Cung cấp hàm phân tầng lương GO `calculateGoSalary(roundCount?: number): number`. |
| 2 | `src/server/turn_loop.ts` | Tích hợp `calculateGoSalary(room.roundCount ?? 1)` khi người chơi vượt qua ô GO. |
| 3 | `src/server/room_manager.ts` | Bổ sung `botPersonalities: this.botPersonalities` vào kết quả của `getContext(roomCode)`. |
| 4 | `src/server/room_property_coordinator.ts` | Tra cứu khóa kép `${ctx.room.roomCode}:${sellerId}` và fallback an toàn về `BotPersonality.Balanced`. |
| 5 | `src/domain/bot/bot_trade.ts` | Điều hòa ngưỡng chấp thuận của Bot Aggressive (hạ xuống 1.75x hoặc 1.55x khi kẹt tiền) và Passive (1.35x). |
| 6 | `src/domain/bot/bot_redeem.ts` | Cung cấp và export `selectMortgageToRedeem(bot, stateMap, registry, minBuffer)` ưu tiên chuộc ô độc quyền. |
| 7 | `src/server/auction_manager.ts` | Mở rộng `AuctionSession` mang `startingBid`, `currentBid`, bảo toàn 100% SSOT 50% khởi điểm từ chối mua. |
| 8 | `scripts/benchmark_gameplay_trends.ts` | Tích hợp đo lường định lượng mở thẻ bài sự kiện, sàn HOSE, đàm phán P2P và chuộc đất thế chấp. |
| 9 | `tests/contracts/imp118_bot_p2p_unfreeze_and_pacing.test.ts` | 16 bài kiểm thử hợp đồng Trạm 1. |
| 10 | `docs/domain/gotchas.md` | Ghi nhận Gotcha #152. |
| 11 | `docs/plans/improvements/IMP-118-bot-p2p-unfreeze-monopoly-redeem-and-pacing-rebalance_plan.md` | Kế hoạch cải tiến chi tiết. |
| 12 | `docs/reports/improvements/IMP-118-bot-p2p-unfreeze-monopoly-redeem-and-pacing-rebalance_report.md` | Báo cáo nghiệm thu kỹ thuật. |
| 13 | `docs/master_roadmap.md` | Cập nhật mục IMP-118 hoàn thành. |
