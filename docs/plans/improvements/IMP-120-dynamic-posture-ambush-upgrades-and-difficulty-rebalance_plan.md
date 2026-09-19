# KẾ HOẠCH CẢI TIẾN IMP-120: THÍCH ỨNG THẾ TRẬN ĐỘNG, XÂY BẪY ĐÓN ĐẦU 2D6 & TĂNG CƯỜNG ĐỘ KHÓ CHIẾN THUẬT BOT AI

> **Mã cải tiến**: IMP-120 (Dynamic Context Adaptation, Targeted 2D6 Ambush Upgrades & Anti-Leader Difficulty Rebalance)  
> **Mục tiêu**: Đưa tỷ lệ thắng của 3 loại Bot vào dải cân bằng hẹp (22% - 27%), tăng tính linh hoạt và khó đoán bằng thế trận động, đồng thời gia tăng độ khó thử thách trí tuệ với Người chơi mà không gian lận xúc xắc hay tiền tệ.

---

## 1. BỐI CẢNH & PHÂN TÍCH HIỆN TRẠNG

Qua kiểm thử mô phỏng 3.900 ván đấu ở IMP-119:
1. **Chênh lệch tỷ lệ thắng**: Bot Balanced (25.7%), Bot Aggressive (21.7%), Bot Passive (14.0%). Vẫn còn khoảng cách ~7% - 11% do Bot Passive trì hoãn xây nhà khi có đối thủ phía trước.
2. **Người chơi thật thắng quá dễ dàng**: Người chơi đạt tỷ lệ thắng 38.7% ở bàn 4 người (mức chuẩn là 25%), do Bot chưa biết:
   - Xây bẫy đón đầu khi người chơi tiến vào tầm xúc xắc 2D6 (5..9 bước).
   - Thế chấp chủ động các ô đất lẻ vô dụng để lấy vốn xây khách sạn trên ô độc quyền.
   - Cấm vận thương mại khi người chơi đang thống trị bàn cờ.
   - Đấu giá ép giá khi người chơi thèm muốn ô đất.

---

## 2. NGUYÊN TẮC THIẾT KẾ ĐỘ KHÓ CÔNG BẰNG (FAIR STRATEGIC DIFFICULTY)

1. **Zero Dice Manipulation**: Tuyệt đối không gian lận xúc xắc.
2. **Zero Treasury Leak**: Bảo toàn 100% kho bạc và tiền tệ.
3. **Pure Strategic Intelligence**: Độ khó đến từ tư duy đòn bẩy tài chính, tính toán xác suất 2D6 và liên minh cản bước kẻ thống trị.

---

## 3. CÁC HẠNG MỤC TRIỂN KHAI CHI TIẾT

### 1. `src/domain/bot/bot_posture.ts` [TẠO MỚI]
- `evaluatePlayerNetWorth`: Tính toán chính xác tổng tài sản ròng của từng người chơi.
- `evaluateBotPosture`: Phân loại vị thế của Bot: `Leading`, `Parity`, `Trailing`.
- `calculateAmbushScore`: Tính xác suất 2D6 đối thủ hạ cánh vào ô đất trong 5..9 bước tới.
- `isLeadingPlayer`: Nhận diện kẻ thống trị bàn cờ.

### 2. `src/domain/bot/bot_types.ts` [CẬP NHẬT]
- Thêm enum `BotPosture` (`Leading`, `Parity`, `Trailing`).

### 3. `src/domain/bot/bot_engine.ts` [CẬP NHẬT]
- `findEligibleUpgradeCell`: Ưu tiên nâng cấp ô có `ambushScore` cao nhất (đang có đối thủ tiến tới).
- Bổ sung `findEligibleProactiveMortgage`: Chủ động thế chấp ô C0 rác để gom vốn xây công trình độc quyền.
- Điều hòa rào cản xây nhà của Bot Passive khi `Trailing` xuống `1.8x safetyBuffer`.
- Bảo vệ lợi thế cho Bot Aggressive khi `Leading`: tăng đệm lên 45% `safetyBuffer`.

### 4. `src/domain/bot/bot_trade.ts` [CẬP NHẬT]
- `evaluateBotTradeAcceptance`: Cấm vận 100% việc bán đất cho Kẻ Dẫn Đầu (`isLeadingPlayer === true`).
- Nới lỏng nhượng đất chéo giữa các Bot yếu thế ở mức 1.45x để tạo thế lực đối trọng.

### 5. `src/domain/bot/bot_auction.ts` [CẬP NHẬT]
- Đẩy giá thông minh (+100 Tr., +200 Tr.) lên tới 1.35x - 1.50x khi ô đất là mảnh ghép độc quyền của Người chơi.

---

## 4. KẾ HOẠCH KIỂM THỬ & CHỈ SỐ MỤC TIÊU

1. **Trạm 1 (RED Contract Tests)**: `tests/contracts/imp120_dynamic_posture_and_difficulty.test.ts` (tối thiểu 16 atomic tests).
2. **Trạm 2 (GREEN Implementation)**: Vượt qua toàn bộ ~4.600 tests, 0 lỗi type, 0 vi phạm UI.
3. **Trạm 3 (Physical Disk & Simulation Benchmark 3.900 Ván)**:
   - Tỷ lệ thắng 3 loại Bot ở bàn 4P hội tụ về dải **22% - 27%**.
   - Tỷ lệ thắng Người chơi ở bàn 4P giảm từ 38.7% về mức chuẩn mực **26% - 30%**.
