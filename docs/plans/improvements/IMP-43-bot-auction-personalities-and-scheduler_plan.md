# KẾ HOẠCH KỸ THUẬT: PHÂN LOẠI ĐA TÍNH CÁCH ĐẤU GIÁ BOT AI, SCHEDULER CHUYỂN PHA & CẢNH BÁO PHÍ KIỂM TOÁN (IMP-43)

## 1. MỤC TIÊU & BỐI CẢNH
- **Mục tiêu**: Thiết lập 3 chiến thuật đấu giá riêng biệt cho Bot AI (Passive, Balanced, Aggressive), đánh thức Bot tự động khi chuyển sang AuctionPhase do timeout, và triệt tiêu cảnh báo giả phí bảo lãnh kiểm toán trong Telemetry Watchdog.
- **Phạm vi**: `src/server/turn_timeout_scheduler.ts`, `src/domain/bot_auction_ai.ts`, `src/client/telemetry/telemetry_cash_flow.ts`, `src/client/ui/modals/auction_modal.tsx`.

## 2. NGUYÊN NHÂN KỸ THUẬT
1. **Bot không được đánh thức khi chuyển pha**: Khi ActionPhase hết giờ chuyển sang AuctionPhase, scheduler chỉ kiểm tra người chơi hiện tại (đã bị cấm bid theo luật EC-11) mà không gọi `onScheduleBotTurn(roomCode)`. Sàn đấu giá bị treo 15s.
2. **Cảnh báo giả phí kiểm toán**: Watchdog chỉ nhận diện ô sự kiện; khi người chơi ở ô đất nộp 500 Tr bảo lãnh kiểm toán, watchdog báo vi phạm bảo toàn tiền tệ.
3. **Chiến lược đấu giá đơn điệu**: Bot Passive bị cấm tham gia hoàn toàn, Bot Aggressive không có chiến lược ép giá tương xứng.

## 3. THIẾT KẾ TRIỂN KHAI
1. **Auction Bot Wakeup Invariant**: Trong `TurnTimeoutScheduler`, khi bước vào `AuctionPhase`, nếu có Bot hợp lệ thì lập tức gọi `onScheduleBotTurn(roomCode)`.
2. **Audit Bailout Telemetry Invariant**: Nhận diện `computeAuditBailDelta` khi rời trạng thái kiểm toán và số dư giảm 500 Tr.
3. **Ma trận 3 tính cách Bot**:
   - *Passive*: Săn sale khi giá <= 70% giá gốc hoặc độc quyền, rút lui khi vượt 85%.
   - *Balanced*: Đặt giá theo định giá thực tế, mở rộng khi có thế độc quyền 2/3.
   - *Aggressive*: Sẵn sàng bid tới 1.5x định giá, bước giá lớn (+100 Tr).
4. **Minh bạch hóa giao diện đấu giá**: Hiển thị rõ lý do người chơi từ chối mua bị cấm bid theo luật EC-11.

## 4. KẾ HOẠCH KIỂM THỬ
- Unit test cho 3 tính cách Bot đấu giá.
- Test scheduler đánh thức Bot khi timeout chuyển pha.
