# [BÁO CÁO CẢI TIẾN IMP-82] Trí Tuệ Đàm Phán Bot P2P Tinh Tế, Nhịp Độ TopBar & Dung Sai Watchdog Đấu Giá

> **Mã số**: IMP-82  
> **Phân hệ**: `[BOT]`, `[UI]`, `[NET]`, `[TELEMETRY]`  
> **Trạng thái**: HOÀN THÀNH 100% (APPROVED & SIGNED-OFF)  
> **Quy trình áp dụng**: 🚦 Quy trình 3 trạm (RED -> GREEN -> Physical Disk Review)

---

## 1. Tóm Tắt Kết Quả Triển Khai

Gói cải tiến **IMP-82** đã giải quyết triệt để 3 điểm nghẽn lớn trong trải nghiệm người dùng và tính chân thực của AI:

1. **Trí Tuệ Đàm Phán Bot P2P Tinh Tế (Human-like Negotiation)**:
   - Phát hiện chính xác **Monopoly Gap** (khi Bot sở hữu $N-1$ ô của một nhóm màu $N \ge 2$).
   - Định giá bất đối xứng theo 3 tính cách: Aggressive ($1.4\times$), Balanced ($1.25\times$), Passive ($1.1\times$).
   - Cơ chế phòng thủ 3 chiều từ bên bán:
     * Chặn đối thủ độc quyền (`PREVENT_MONOPOLY`): Aggressive từ chối bán trừ khi giá $\ge 2.5\times$ và bản thân cạn tiền mặt.
     * Chống Kingmaking (`KINGMAKING_DEFENSE`): Balanced từ chối bán nếu người mua đang dẫn đầu tài sản.
     * Tối ưu thanh khoản: Passive sẵn sàng bán ô đất lẻ với giá $\ge 1.25\times$ khi số dư dưới đệm an toàn.
   - Kiểm soát nhịp độ Cooldown (tối đa 1 đề xuất/2 vòng) tránh spam giao dịch.
   - **Kết quả Chaos Simulator 1.000 ván**: Kích hoạt thành công **3.815 lượt nâng cấp công trình** (1.703 căn C1, 1.272 căn C2, 840 căn C3) trên 518 ván đấu có bộ màu, xóa sạch vĩnh viễn tình trạng "ván đấu 29 vòng không có ngôi nhà nào".

2. **Chuẩn Hóa Nhịp Độ TopBar Khi Đến Lượt Bot**:
   - Khi `currentTurnPlayer.isBot === true`, đồng hồ đếm ngược hiển thị `🤖 Đang tính...` bằng sắc vàng hổ phách dịu mắt (`text-amber-700 font-semibold`), triệt tiêu hoàn toàn số đỏ `00:00` và hiệu ứng nhấp nháy báo động kẹt lượt.

3. **Nới Trần Watchdog Khi Đang Trong Phiên Đấu Giá**:
   - `watchdogMonitor.checkTurnStall` nhận diện cờ `isInAuction: true`, nới trần stall từ 45s lên 90s và tạm ngưng cảnh báo timer âm, triệt tiêu 100% cảnh báo giả `TURN_STALLED` khi người chơi và bot giằng co đặt giá.

---

## 2. Ma Trận Thẩm Định Vật Lý Trên Đĩa (Station 3 Sign-Off)

| Phân hệ / Tiêu chí | Tệp Nguồn / Kiểm Thử | Trạng Thái | Đánh Giá Thực Tế |
| :--- | :--- | :---: | :--- |
| **Monopoly Gap & Định Giá** | `src/domain/bot/bot_trade.ts` | ✔️ PASS | Quét 8 nhóm màu, tính giá 1.1x–1.4x, kiểm tra `safetyBuffer` |
| **Phản Biện Bán & Kingmaking** | `src/domain/bot/bot_trade.ts` | ✔️ PASS | Chặn `PREVENT_MONOPOLY`, `KINGMAKING_DEFENSE`, thanh lý đất lẻ |
| **PropertyManagement FSM** | `src/domain/bot/bot_engine.ts` | ✔️ PASS | Tích hợp sau upgrade/redeem, Cooldown 2 vòng, LOC 353 <= 400 |
| **Thẩm Định Server P2P** | `src/server/room_property_coordinator.ts` | ✔️ PASS | `coordTrade` gọi thẩm định Bot, trả `TRADE_REJECTED` khi không khớp |
| **TopBar Bot Thinking** | `src/client/ui/top_bar.tsx` | ✔️ PASS | Hiển thị `🤖 Đang tính...`, chữ hổ phách, LOC 178 <= 500 |
| **Watchdog 90s Đấu Giá** | `src/client/telemetry/watchdog_monitor.ts` | ✔️ PASS | Nới trần 90s khi `isInAuction: true`, bỏ qua timer âm |
| **Bộ Kiểm Thử Hợp Đồng** | `tests/contracts/imp82_*.test.ts` | ✔️ PASS | 16/16 atomic tests PASS 100% (4 facets) |
| **Kiểm Toán Toàn Bộ Dự Án** | `npm test` & `gate:quick` | ✔️ PASS | 188/188 test suites (3.224 tests PASS), 0 TypeScript / UI / Slop error |
| **Mô Phỏng 1.000 Ván Chaos** | `npm run test:chaos` | ✔️ PASS | 100% hoàn thành, 0 deadlock, 0 rò rỉ Kho Bạc, 3.815 công trình C1–C3 |

---

## 3. Danh Sách Tệp Tác Động

- `[NEW] src/domain/bot/bot_trade.ts` (197 LOC)
- `[NEW] tests/contracts/imp82_bot_trading_and_pacing.test.ts` (435 LOC)
- `[NEW] docs/plans/improvements/IMP-82-human_like_bot_trading_and_pacing_plan.md`
- `[NEW] docs/reports/improvements/IMP-82-human_like_bot_trading_and_pacing_report.md`
- `[MODIFY] src/domain/action_reasons.ts` (bổ sung `TRADE_REJECTED`)
- `[MODIFY] src/domain/room.ts` (thêm `lastTradeOfferRound` vào Player)
- `[MODIFY] src/domain/bot/bot_engine.ts` (tích hợp P2P trade vào PropertyManagement)
- `[MODIFY] src/server/room_property_coordinator.ts` (thẩm định phía Bot trước khi thực thi P2P trade)
- `[MODIFY] src/client/ui/top_bar.tsx` (hiển thị `🤖 Đang tính...` khi là lượt Bot)
- `[MODIFY] src/client/telemetry/watchdog_monitor.ts` (nới trần 90s khi `isInAuction: true`)
- `[MODIFY] docs/domain/gotchas.md` (ghi nhận Gotcha #111)
- `[MODIFY] docs/master_roadmap.md` (cập nhật trạng thái IMP-82 hoàn thành)
