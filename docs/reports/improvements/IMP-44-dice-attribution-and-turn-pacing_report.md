# BÁO CÁO CẢI TIẾN: ĐỊNH DANH XÚC XẮC diceRollerId & CHUỖI ĐƠN ĐIỆU diceSeq TRIỆT TIÊU LỖI NUỐT LOG AUTO-ROLL (IMP-44)

> **Căn cứ phản hồi người dùng:**
> 1. *"Một game mới log có vấn đề, có đoạn bot đổ xúc xắc xong nó chưa làm gì thì log show lên tôi đổ xúc xắc, sau đó tới log bot di chuyển tới cao tốc bắc nam."*
> 2. *"Khi tôi mở game mới, nếu tôi và bot để tự động chứ không bấm thủ công nút xoay xúc xắc, log không thể hiện là trạng thái auto xoay ra bao nhiêu mà chỉ thể hiện đi tới ô nào."*

## 1. NGUYÊN NHÂN GỐC RỄ
1. **Lệch định danh xúc xắc (Dice Roller Misattribution)**: Client cũ lấy `currentTurnPlayerId` của delta để gán tên người gieo xúc xắc. Khi Bot hoàn tất lượt và server chuyển lượt sang P1 (`currentTurnPlayerId = p1`), client gán nhầm xúc xắc của Bot cho P1.
2. **Bẫy nuốt log xúc xắc trong chế độ tự động (Auto-Roll Log Swallowing)**: Khi người chơi hoặc bot để chế độ tự động (bot turns hoặc timeout AFK), server chạy trọn vẹn cả lượt rồi mới broadcast delta. Delta phát ra lúc này đã chuyển sang lượt kế tiếp với `turnPhase = WaitingRoll`. Guard cũ `if (delta.turnPhase === 'WaitingRoll') return null;` đã vô tình nuốt chửng 100% sự kiện gieo xúc xắc tự động, khiến feed chỉ còn lại log di chuyển và mua đất.

## 2. GIẢI PHÁP KỸ THUẬT
1. **`lastDiceRollerId` & `diceRollerId`**: `Room` và `DeltaPayload` lưu trữ tường minh người gieo xúc xắc. Khi gieo (`executeTurnRoll`), server gán `room.lastDiceRollerId = current.id`. Client ưu tiên `delta.diceRollerId`.
2. **Chuỗi đơn điệu `diceSeq` (Monotonic Sequence Invariant)**: Máy chủ tăng dần `room.diceSeq = (room.diceSeq ?? 0) + 1;` ở mỗi lần tung xúc xắc thật. Client lưu `activityStore.lastDiceSeq`. Một sự kiện xúc xắc chỉ được ghi khi `delta.diceSeq > lastDiceSeq`, triệt tiêu hoàn toàn trùng lặp mà không cần chặn theo `turnPhase`.
3. **Bảo tồn Snapshot FSM**: Giữ nguyên `room.lastDice` trên server để khớp 100% byte-for-byte với Golden Engine Snapshot Test.
4. **Phân tách vi bước `stepBotTurn`**: Xuất hàm `stepBotTurn` trên `RoomManager` phục vụ kiểm soát hoạt cảnh vi bước độc lập.

## 3. KẾT QUẢ KIỂM THỬ (QUY TRÌNH 3 TRẠM)
- **Trạm 1 (RED)**: Tạo và chứng minh 3 test thất bại:
  - `TC-PACE-18`: Nuốt log khi Bot hoàn thành lượt tự động (`expected +0 to be 1`).
  - `TC-PACE-19`: Nuốt log khi Human timeout AFK tự động (`expected +0 to be 1`).
  - `TC-PACE-20`: Ghi trùng log nếu không có `diceSeq` (`expected 2 to be 1`).
- **Trạm 2 (GREEN)**: Triển khai `diceSeq` và `isDiceDuplicate`:
  - `tests/server/bot_turn_pacing_and_attribution.test.ts`: **20/20 tests PASS**.
  - `tests/oracle/fsm_golden_engine.test.ts`: **3/3 tests PASS** (bảo toàn 100% byte-for-byte).
  - Toàn bộ test suite: **142/142 test files PASS (2.024/2.024 tests pass 100%)**.
  - `npm run gate:quick`: **0 errors, 0 lint warnings, 0 vi phạm anti-patterns**.
- **Trạm 3 (Nghiệm thu)**:
  - Container Docker `vtcoon-vtcoon-1` đã được rebuild và kích hoạt healthy.

## 4. BẤT BIẾN ĐƯỢC GHI NHẬN
- Gotcha #65 trong `docs/domain/gotchas.md`: `[NET/FSM] Bất Biến Định Danh Xúc Xắc diceRollerId & Chuỗi Đơn Điệu diceSeq Triệt Tiêu Lỗi Nuốt Log Trong Auto-Roll (IMP-44)`.
