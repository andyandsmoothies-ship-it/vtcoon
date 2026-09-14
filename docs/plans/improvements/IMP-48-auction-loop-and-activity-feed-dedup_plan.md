# KẾ HOẠCH KỸ THUẬT: TRIỆT TIÊU VÒNG LẶP ĐẤU GIÁ, ĐỒNG BỘ TIMEOUT MÁY CHỦ & KHỬ TRÙNG NHẬT KÝ (IMP-48)

## 1. MỤC TIÊU & BỐI CẢNH
- **Mục tiêu**:
  1. Triệt tiêu 100% vòng lặp vô hạn 800ms trong `BotTurnScheduler` khi phòng ở `AuctionPhase`.
  2. Khóa chặt điều kiện kích hoạt bot đấu giá: Bot đang dẫn đầu (`highestBidder`) không được coi là bot cần kích hoạt đặt giá tiếp theo.
  3. Bảo đảm `TurnTimeoutScheduler` luôn duy trì bộ đếm 15 giây độc lập cho `AuctionPhase` kể cả khi xuất phát từ lượt từ chối mua của Bot.
  4. Tự động kết thúc lượt cho Bot sau khi phiên đấu giá đóng nếu Bot đó đang ở `PropertyManagement`.
  5. Khử trùng lặp 100% các sự kiện đấu giá trong `activity_tracker.ts` độc lập với trạng thái hiển thị của hộp thoại UI (`activeModal`).
  6. Ngăn chặn hộp thoại đấu giá client tự ý đóng trước khi máy chủ chuyển pha.
- **Phạm vi**:
  - `src/server/network/bot_turn_scheduler.ts`
  - `src/server/network/turn_timeout_scheduler.ts`
  - `src/client/network/activity_tracker.ts`
  - `src/client/store/activity_store.ts`
  - `src/client/ui/modals/modal_host.tsx`

## 2. NGUYÊN NHÂN KỸ THUẬT
1. `BotTurnScheduler` kiểm tra `currentPlayerIndex` sau khi chạy bot turn. Do `currentPlayerIndex` trong `AuctionPhase` vẫn là người vừa dẫm ô (`bot_3`), scheduler liên tục kích hoạt lại `scheduleBotTurn(800ms)`.
2. `isAuctionWithBots` thiếu điều kiện loại trừ `highestBidder`, khiến bot đã dẫn đầu vẫn kích hoạt scheduler.
3. Khi vào `AuctionPhase` từ bot turn, `TurnTimeoutScheduler.scheduleTurnTimeout` không được gọi, dẫn đến máy chủ không bao giờ đóng sàn đấu giá khi hết 15s.
4. `detectAuctionActivities` khử lặp dựa vào `prevState.activeModal === 'auction'`. Khi modal đóng, điều kiện này sai và tạo log mới ở mọi Delta.

## 3. THIẾT KẾ TRIỂN KHAI THEO QUY TRÌNH 3 TRẠM
- **Trạm 1 (RED Test)**:
  - Tạo `tests/contracts/auction_loop_prevention_contract.test.ts` kiểm thử 4 diện:
    1. Facet 1: Bot đang là `highestBidder` không được coi là bot hợp lệ để gọi `scheduleBotTurn`.
    2. Facet 2: Khi Bot từ chối mua và kích hoạt đấu giá, timeout 15s của máy chủ được thiết lập và tự đóng sàn khi hết giờ.
    3. Facet 3: Sau khi sàn đóng, Bot dẫm ô tự động kết thúc lượt chuyển sang người kế tiếp.
    4. Facet 4: `detectAuctionActivities` không sinh log trùng khi nhận nhiều Delta có cùng `currentBid` và `highestBidderId`, kể cả khi `activeModal` là `null`.
- **Trạm 2 (GREEN Implementation)**:
  - Cập nhật `bot_turn_scheduler.ts`, `turn_timeout_scheduler.ts`, `activity_tracker.ts`, `activity_store.ts`, `modal_host.tsx`.
- **Trạm 3 (Audit & Verification)**:
  - Chạy `npm test` đạt 100% PASS, `npx tsc --noEmit` đạt 0 lỗi, `npm run lint:ui` đạt 0 vi phạm.
  - Rebuild Docker container và kiểm tra trạng thái Healthy.

## 4. KẾ HOẠCH KIỂM THỬ
- Chạy `npx vitest run tests/contracts/auction_loop_prevention_contract.test.ts`.
- Chạy toàn bộ test suites `npm test`.
