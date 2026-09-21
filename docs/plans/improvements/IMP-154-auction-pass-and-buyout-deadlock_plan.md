# IMP-154: Auction Pass State Persistence & Compulsory Buyout Deadlock Resolution

**Ngày lập**: 2026-09-21  
**Nguồn gốc**: Phân tích log thực tế `media_1790004707256` — Lặp lại rút lui đấu giá & Kẹt vĩnh viễn khi nhận thẻ Mua Lại Dự Án (`CC_SWAP_PROJECT`)  
**Độ ưu tiên**: CRITICAL (Game Deadlock & Auction UI Glitch)

---

## 1. Vấn đề

Nhật ký trận đấu thực tế (`media_1790004707256`) ghi nhận 2 sự cố nghẽn nghiêm trọng:
1. **Rút lui đấu giá bị lặp lại nhiều lần**: Người chơi nhấn nút "Rút lui / Bỏ cuộc" trong phiên đấu giá, nhưng mỗi khi Bot đặt giá hoặc Server gửi Delta mới (`delta.auction`), Client ghi đè toàn bộ `modalPayload` khiến cờ `hasPassed: true` bị xóa sạch, mở lại các nút đặt giá và buộc người chơi phải nhấn "Rút lui" 6 lần liên tiếp (từ 4541s đến 4553s).
2. **Kẹt vĩnh viễn khi nhận thẻ Mua Lại Dự Án (`CC_SWAP_PROJECT`)**:
   - `INTENT_DECLINE_COMPULSORY_BUYOUT` và `INTENT_EXECUTE_COMPULSORY_BUYOUT` hoàn toàn vắng mặt trong tập `VALID_INTENTS` của `EnvelopeValidator`, khiến Server lập tức từ chối gói tin với mã lỗi `INVALID_INTENT` và vứt bỏ yêu cầu từ chối.
   - `checkPendingBuyoutTimeout` không có bất kỳ Watchdog nào gọi định kỳ, khiến phiên mua lại quá hạn 15s không bao giờ tự biến mất.
   - `handleEndTurn` chặn đứng mọi nỗ lực kết thúc lượt nếu `room.pendingBuyout` còn tồn tại, gây ra tình trạng Deadlock đóng băng ván đấu suốt 48s (từ Tick 175 đến 182).

---

## 2. Blast Radius

| Chiều | Đánh Giá & Phòng Vệ |
| :--- | :--- |
| **Risk Level** | Slice-Bound (Chỉ can thiệp bảo mật intent, watchdog và client modal sync) |
| **Direct Touch** | `envelope_validator.ts`, `intent_guard.ts`, `turn_watchdog.ts`, `session_manager.ts`, `apply_delta.ts`, `game_store_types.ts` |
| **Downstream Consumers** | `TurnWatchdog`, `AuctionModal`, `CompulsoryBuyoutModal`, `DeltaBroadcaster` |
| **Worst-Case Defense** | Watchdog tự động timeout buyout sau 15s, emergency recovery reset null; client bảo lưu `hasPassed` không re-enable nút đấu giá |

---

## 3. Chi Tiết Giải Pháp Đã Triển Khai

### 3.1. Server Security Layer
- Bổ sung `INTENT_EXECUTE_COMPULSORY_BUYOUT` và `INTENT_DECLINE_COMPULSORY_BUYOUT` vào `VALID_INTENTS` trong `src/server/security/envelope_validator.ts`.
- Bổ sung xác thực trường `cellIndex: number` đối với `INTENT_EXECUTE_COMPULSORY_BUYOUT`.
- Bổ sung cấp phép trong `isPhaseSpecificAllowed` của `src/server/security/intent_guard.ts` khi người gọi là bên mua (`pendingBuyout.buyerId === playerId`).

### 3.2. Watchdog & Auto-Timeout Layer
- Trong `TurnWatchdog.checkRoom`: Gọi `this.rooms.checkPendingBuyoutTimeout?.(roomCode, Date.now())` mỗi chu kỳ ~5s, tự động phát sóng Delta khi hết hạn 15s.
- Trong `TurnWatchdog.executeEmergencyRecovery`: Cưỡng chế xóa `room.pendingBuyout = null` trước khi force-advance.

### 3.3. Auction Pass Persistence Layer
- `AuctionDelta` trên Server bổ sung trường `passedPlayerIds?: readonly string[]`.
- `buildRoomDelta` gửi `passedPlayerIds: Array.from(session.passedPlayers)` khi có người chơi rút lui.
- `src/client/network/apply_delta.ts`: Bảo lưu cờ `hasPassed: true` khi nhận `delta.auction` mới nếu người chơi đã rút lui cục bộ hoặc nằm trong `passedPlayerIds`.

---

## 4. Nghiệm Thu & Kiểm Chứng

- 21/21 Contract tests PASS (`tests/contracts/imp154_auction_pass_and_buyout_deadlock.test.ts`).
- 18/18 Regression tests PASS (`tests/contracts/imp152_pending_trade_freeze_fix.test.ts`).
- 0 lỗi TypeScript (`tsc --noEmit`).
- 0 vi phạm UI Lint (`npm run lint:ui`).
- Phán quyết Trạm 3: Spec Reviewer APPROVED, Code Reviewer APPROVED.
