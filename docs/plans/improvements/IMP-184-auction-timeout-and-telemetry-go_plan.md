# Kế Hoạch Cải Tiến IMP-184: Khắc Phục Báo Động Ảo Lương GO & Sửa Lỗi Khóa Đấu Giá BĐS

> **Ticket**: IMP-184  
> **Trạng thái**: GRILLED & APPROVED  
> **Mục tiêu**:
> 1. **Khắc phục lỗi khóa đấu giá BĐS 1 giây & Lệch pha đồng hồ (Auction Premature Timeout & Dual-Timer Desync)**: Sửa dứt điểm lỗi máy chủ tự động gõ búa kết thúc đấu giá trong 1 giây ngay khi Bot đặt giá; đồng bộ `session.endTime` lên 20 giây chuẩn SSOT tránh lỗi từ chối giá thầu `AUCTION_EXPIRED`; phòng vệ tuyệt đối chống treo đơ tiến trình Node.js (100% CPU infinite while loop).
> 2. **Triệt tiêu cảnh báo ảo `TREASURY_INVARIANT_VIOLATED` & `INVALID_POSITION_STEP`**: Nhận diện chuẩn xác chuyển động nhân đôi xúc xắc (`doubleNextDice`) và vượt qua ô Khởi Hành trong Telemetry Invariant Watchdog mà không loại trừ mù quáng ô 10 (thăm tù).
> 3. **Cô lập thực thể phá sản & Chuẩn hóa giao diện 360px**: Lọc sạch `!p.bankrupt` trong `handleAuctionBid`, chuẩn hóa thanh đo thời gian động và chống tràn viền huy hiệu mobile 360px.

---

## 1. Bối Cảnh & Chẩn Đoán Gốc Rễ (Root Cause Analysis)
- **Log thực tế Tick 77**: Server vận hành 100% đúng luật, cộng lương GO 2.000 Tr khi người chơi di chuyển x2 từ ô 36 sang ô 8 Đồng Nai. Telemetry client bị lỗi thuật toán nhận diện bước đi x2 nên tưởng quân cờ teleport và kỳ vọng 0 Tr, gây báo động giả `TREASURY_INVARIANT_VIOLATED` và `INVALID_POSITION_STEP`.
- **Log thực tế Tick 252-254**: Tại Tick 252 (`bot_4` bid 850 Tr, `bot_3` pass), `turn_orchestrator.ts` truyền `AUCTION_BOT_STEP_DELAY_MS = 1000ms` vào `orchestrate`, khiến timer đóng sàn cho người chơi thật bị ép xuống đúng 1 giây. Tại 844ms người chơi bấm +500 Tr (1.350 Tr) thì đến 902ms server đã gõ búa kết thúc, biến các nút thành inactive / disabled và từ chối giá thầu của người chơi. Đồng thời `auction_manager.ts` dùng mốc 15.000ms gây lỗi `AUCTION_EXPIRED` ở giây thứ 16-19.

---

## 2. Các Giải Pháp Triển Khai
1. **`src/server/room_bot_coordinator.ts`**:
   - `stepAuctionBot`: Trả về `{ changed: false, finished: false }` khi bot hết ứng cử nhưng người chơi thật chưa pass.
   - Thêm điều kiện ngắt vòng lặp an toàn `if (step.finished || !step.changed) break;` và trần lặp `iterations < 30` trong `isAuctionPhaseStuck` và `runBotTurn`.
2. **`src/server/network/turn_orchestrator.ts`**:
   - Gọi `this.orchestrate(roomCode)` không truyền `AUCTION_BOT_STEP_DELAY_MS`.
   - Cấp đủ 20.000ms (`PHASE_TIMEOUTS_MS[AuctionPhase]`) cho người chơi thật.
   - Dọn sạch `auctionSettleTimers` trong `clearRoom`.
3. **`src/server/auction_manager.ts`**:
   - Nâng `session.endTime = Date.now() + 20_000` đồng bộ toàn diện.
   - Bổ sung `&& !p.bankrupt` vào bộ lọc `eligiblePlayers` của `handleAuctionBid`.
   - Anti-sniping: gia hạn thêm `+3.000ms` khi đặt giá ở `<= 3s` cuối.
4. **`src/client/telemetry/invariant_checker.ts`**:
   - `verifyMovementStep` chấp nhận cả `(from + diceSum) % 40` lẫn `(from + diceSum * 2) % 40`.
5. **`src/client/telemetry/telemetry_delta_hook.ts`**:
   - `detectMovement` nhận diện bước đi nhân đôi x2.
   - `computeExpectedDelta` tính đúng +2.000 Tr lương GO khi vượt qua ô Khởi Hành, phân định đúng ô 10 thăm tù tự do (`inAudit: false`).
6. **`src/client/ui/modals/auction_modal.tsx`**:
   - `timerPercent` dùng mẫu số động `Math.max(20, timeRemaining)`.
   - Container dialog dùng `max-h-[90dvh]`.
   - Huy hiệu cưỡng chế co giãn chống vỡ layout mobile 360px.
