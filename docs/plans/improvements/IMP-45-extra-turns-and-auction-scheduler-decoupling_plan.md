# KẾ HOẠCH KỸ THUẬT: PHÂN ĐỊNH RẠCH RÒI EXTRATURNS VS CONSECUTIVEDOUBLES & TRIỆT TIÊU ĐỆ QUY ĐẤU GIÁ BOT (IMP-45)

## 1. MỤC TIÊU & BỐI CẢNH
- **Mục tiêu**: Phân định rạch ròi cơ chế đi thêm lượt giữa `extraTurns` và `consecutiveDoubles` từ thẻ Cơ Hội; triệt tiêu hoàn toàn vòng lặp đệ quy tương hỗ vô hạn giữa `TurnTimeoutScheduler` và `BotTurnScheduler` làm sập sàn đấu giá.
- **Phạm vi**: `src/server/audit_manager.ts`, `src/domain/event_card_handlers.ts`, `src/server/network/wss_server.ts`, `src/server/turn_timeout_scheduler.ts`.

## 2. NGUYÊN NHÂN KỸ THUẬT
1. **Cấp kép 2 cơ chế đi thêm**: Thẻ Cơ Hội CC_PLATE_AUCTION vừa gán `player.extraTurns += 1` vừa gán `player.consecutiveDoubles += 1`. Khiến người chơi vừa được gieo xúc xắc ngay trong `PropertyManagement`, vừa được giữ lượt thêm 1 lần nữa sau khi kết thúc lượt (đi 3 lần thay vì 2 lần).
2. **Đệ quy tương hỗ vô hạn sập server**: `TurnTimeoutScheduler` có `onScheduleBotTurn` gọi `wss_server.scheduleBotTurn`, nhưng hàm này lại gọi ngược `turnTimeoutScheduler.scheduleTurnTimeout`. Khi vào `AuctionPhase`, hai hàm gọi chéo liên tục làm tràn stack (`RangeError: Maximum call stack size exceeded`), không timeout nào được đặt và sàn đấu giá đóng băng ở Tick 11.

## 3. THIẾT KẾ TRIỂN KHAI
1. **Tách biệt ExtraTurns**: Chỉ cho phép xúc xắc vật lý thật `die1 === die2` gán `consecutiveDoubles`. Mọi thẻ bài/hiệu ứng thêm lượt chỉ thao tác trên `player.extraTurns`.
2. **Tách rời bộ điều phối Bot (Decoupled Bot Scheduler)**: `onScheduleBotTurn` trong `TurnTimeoutScheduler` trỏ trực tiếp đến `this.botScheduler.scheduleBotTurn(roomCode)`, không gọi qua hàm trung gian gọi ngược lại `scheduleTurnTimeout`.

## 4. KẾ HOẠCH KIỂM THỬ
- Contract test kiểm tra thẻ Cơ hội chỉ cấp đúng 1 lượt đi thêm.
- Simulation test kiểm tra đấu giá không xảy ra tràn call stack.
