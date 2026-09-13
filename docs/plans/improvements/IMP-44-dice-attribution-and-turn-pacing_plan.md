# KẾ HOẠCH CẢI TIẾN: ĐỊNH DANH XÚC XẮC diceRollerId & TRIỆT TIÊU PHANTOM DICE (IMP-44)

## 1. MỤC TIÊU & BỐI CẢNH
- **Vấn đề**: Trong nhật ký ván đấu (Activity Feed), khi Bot hoàn thành lượt gieo xúc xắc và mua đất, log hiển thị đảo lộn: Người chơi thấy mình bị ghi nhận đã gieo xúc xắc của Bot trước khi Bot kịp hiển thị hoạt cảnh di chuyển và mua đất.
- **Mục tiêu**:
  1. Thêm trường định danh `lastDiceRollerId` vào `Room` và `diceRollerId` vào `DeltaPayload`.
  2. Bổ sung guard `WaitingRoll` trong `detectDiceActivity` trên client.
  3. Bổ sung `stepBotTurn` hỗ trợ vi bước trong `RoomManager`.
  4. Viết 17 atomic tests tại `tests/server/bot_turn_pacing_and_attribution.test.ts`.
  5. Đạt 100% test pass không hồi quy Golden Snapshot.

## 2. PHẠM VI CAN THIỆP
- `src/domain/room.ts`: `lastDiceRollerId?: string;`
- `src/server/turn_loop.ts`: `room.lastDiceRollerId = current.id;`
- `src/server/session_manager.ts` & `delta_broadcaster.ts`: `diceRollerId`
- `src/server/room_bot_coordinator.ts` & `room_manager.ts`: `stepBotTurn`
- `src/client/network/activity_tracker.ts`: `diceRollerId` fallback và guard `WaitingRoll`
- `src/client/network/apply_delta.ts`: Guard xúc xắc `[0, 0]`

## 3. TIÊU CHÍ HOÀN THÀNH (DoD)
- 17/17 atomic tests pass trong `bot_turn_pacing_and_attribution.test.ts`.
- 100% (142/142) test suites pass trong toàn dự án.
- Giới hạn LOC <= 400 LOC cho tất cả các file domain/server/client đã sửa.
- Ghi nhận Gotcha #65 vào `docs/domain/gotchas.md`.
