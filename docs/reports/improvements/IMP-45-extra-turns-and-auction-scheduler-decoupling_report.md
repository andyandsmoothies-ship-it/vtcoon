# BÁO CÁO CẢI TIẾN: PHÂN ĐỊNH RẠCH RÒI EXTRATURNS VS CONSECUTIVEDOUBLES & TRIỆT TIÊU ĐỆ QUY ĐẤU GIÁ BOT (IMP-45)

## 1. NGUYÊN NHÂN GỐC RỄ
1. **Cấp kép cơ chế đi thêm**: Thẻ Cơ Hội vừa gán `extraTurns` vừa gán `consecutiveDoubles` khiến người chơi được đi 3 lần thay vì đúng 1 lượt đi thêm theo luật SSOT.
2. **Đệ quy tương hỗ vô hạn**: Gọi chéo giữa `scheduleTurnTimeout` và `scheduleBotTurn` gây sập call stack Node.js khi vào `AuctionPhase`, đóng băng sàn đấu giá vĩnh viễn.

## 2. GIẢI PHÁP KỸ THUẬT
1. **Strict ExtraTurns Separation Invariant**: Cấm tuyệt đối gán `consecutiveDoubles` trong các hàm xử lý thẻ bài; chỉ `die1 === die2` thật mới được kích hoạt doubles.
2. **Decoupled Bot Scheduler Waker Invariant**: `TurnTimeoutScheduler.onScheduleBotTurn` gọi thẳng tới `this.botScheduler.scheduleBotTurn(rc)`, chấm dứt 100% vòng gọi đệ quy.

## 3. KẾT QUẢ KIỂM THỬ
- Thẻ Cơ Hội cấp đúng 1 lượt đi thêm.
- Sàn đấu giá chuyển pha trơn tru, không có lỗi tràn call stack.
- Toàn bộ 146/146 test files PASS 100%.

## 4. BẤT BIẾN ĐƯỢC GHI NHẬN
- Gotcha #66 trong `docs/domain/gotchas.md`: `[FSM/NET/BOT] Bất Biến Phân Định Rạch Ròi ExtraTurns vs ConsecutiveDoubles & Triệt Tiêu Đệ Quy Đấu Giá Bot (IMP-45)`.
