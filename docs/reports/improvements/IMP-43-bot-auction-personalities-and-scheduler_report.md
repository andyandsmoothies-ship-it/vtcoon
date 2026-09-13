# BÁO CÁO CẢI TIẾN: PHÂN LOẠI ĐA TÍNH CÁCH ĐẤU GIÁ BOT AI, SCHEDULER CHUYỂN PHA & CẢNH BÁO PHÍ KIỂM TOÁN (IMP-43)

## 1. NGUYÊN NHÂN GỐC RỄ
1. **Bot không được đánh thức khi chuyển sang AuctionPhase**: Khi ActionPhase hết giờ, scheduler chỉ xét người chơi vừa timeout (bị cấm đấu giá), quên gọi `onScheduleBotTurn` làm sàn đấu giá treo đơ 15s.
2. **Cảnh báo giả vi phạm bảo toàn tiền tệ**: Khi nộp 500 Tr phí bảo lãnh kiểm toán tại ô đất thường, watchdog không nhận diện được giao dịch.
3. **Chiến lược đấu giá Bot thiếu chiều sâu**: Bot Passive bị loại bỏ hoàn toàn, Bot Aggressive thiếu tính quyết liệt.

## 2. GIẢI PHÁP KỸ THUẬT
1. **Auction Bot Wakeup Invariant**: Tự động đánh thức Bot hợp lệ ngay khi phòng chuyển vào `AuctionPhase`.
2. **Audit Bailout Telemetry Invariant**: Khớp đúng khoản nộp 500 Tr bảo lãnh kiểm toán trong `computeExpectedDelta`.
3. **Ma trận đấu giá 3 tính cách**:
   - Passive: Săn hàng giảm giá <= 70% giá gốc, rút lui ở 85%.
   - Balanced: Tính toán theo giá trị thực tế và thế độc quyền.
   - Aggressive: Sẵn sàng bid tới 150% giá trị, nhảy bước giá lớn.
4. **Hướng dẫn rõ ràng trên UI**: Thông báo lý do cấm đấu giá theo luật EC-11 cho người từ chối mua.

## 3. KẾT QUẢ KIỂM THỬ
- Bot tham gia đấu giá tức thời, không bị đơ 15s.
- Triệt tiêu 100% cảnh báo giả bảo lãnh kiểm toán.
- Toàn bộ 141/141 test files PASS 100%.

## 4. BẤT BIẾN ĐƯỢC GHI NHẬN
- Gotcha #64 trong `docs/domain/gotchas.md`: `[BOT/AUCTION/SCHEDULER] Bất Biến Đa Tính Cách Đấu Giá Bot AI, Kích Hoạt Scheduler Chuyển Pha & Triệt Tiêu Cảnh Báo Phí Bảo Lãnh Kiểm Toán (IMP-43)`.
