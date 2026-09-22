# Kế Hoạch Kỹ Thuật: Tối Ưu Hóa Tinh Gọn Trước Phát Hành (Lean Pre-Launch Optimization) (IMP-167)

> **Mã số ticket**: IMP-167  
> **Tên tính năng**: Lean Pre-Launch Optimizations & Fast Lobby Lifecycle  
> **Triết lý**: Tối giản cấu trúc (YAGNI & Anti-Slop), giải quyết nghẽn I/O và rác bộ nhớ thực tế, kiên quyết phản biện các giải pháp quá đà (Redis, Worker Threads) cho tải <= 10 người chơi.  
> **Phân tầng kỹ thuật**: Tier 1 Fast-Track (< 50 LOC bổ sung, zero FSM regression)

---

## 1. Bối Cảnh & Phản Biện Kiến Trúc (Architectural Pushback)

Trước khi phát hành thử nghiệm cho nhóm 5–10 người chơi, hệ thống cần được rà soát các điểm nghẽn hiệu năng thực tế mà không đưa vào các cấu trúc phức tạp thừa thãi:

1. **Phản biện Redis / Multi-Process**: Trò chơi cờ tỷ phú theo lượt đòi hỏi độ trễ cực thấp (< 1ms) khi tính toán các chuỗi sự kiện liên hoàn. Đưa state vào Redis qua Pub/Sub sẽ biến mỗi bước đi thành hàng loạt round-trip qua mạng, gây độ trễ và race condition không đáng có cho quy mô dưới 10 người. Game state trong RAM là mô hình chuẩn mực.
2. **Xác nhận Điểm Nghẽn I/O Đĩa Đồng Bộ**: `PersistentRoomLogger` sử dụng `appendFileSync` gây chặn Event Loop của Node.js khi ghi log mỗi hành động. Cần chuyển sang mô hình Bộ đệm ghi không đồng bộ (Async Buffered Logger).
3. **Phản biện Worker Threads cho Bot AI**: Thuật toán Bot AI trong `src/domain/bot/` là hàm số học thuần túy (heuristic logic) thực thi chỉ 0.15ms – 0.3ms cho mỗi lượt đi. Chi phí IPC overhead của Worker Threads sẽ lớn hơn gấp nhiều lần. Giữ Bot trên Main Thread.
4. **Xác nhận Sảnh Chờ Rác (Lobby Bloat)**: Sảnh chờ chưa bắt đầu (`!room.started`) bị bỏ rơi từng chiếm RAM suốt 10 phút. Cần phân tầng thời gian quét dọn, hạ thời gian chờ của sảnh chờ xuống còn **3 phút**.

---

## 2. Thiết Kế Kỹ Thuật Cụ Thể

### Thành Phần 1: Async Buffered Write Flush (`PersistentRoomLogger`)
- **Tệp sửa đổi**: [`src/server/logging/persistent_room_logger.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/logging/persistent_room_logger.ts)
- **Cơ chế**:
  - Lưu tạm các dòng sự kiện trong RAM: `writeBuffer: Map<string, string[]>`.
  - `appendEvent()` chỉ lưu vào RAM buffer và lập lịch xả nền bất đồng bộ (`flushIntervalMs = 500ms`, dùng `.unref()` để không giữ tiến trình).
  - Cập nhật manifest sự kiện tức thì trong RAM để phục vụ tra cứu kiểm thử / telemetry.
  - Xả cưỡng bức đồng bộ (`flushSync()`) khi phòng kết thúc (`finishRoomLog`), khi đọc toàn bộ log (`getRoomFullLog`), hoặc khi dừng logger (`stop()`).
  - Môi trường test tự động đặt `flushIntervalMs = 0` để duy trì tính tức thời.

### Thành Phần 2: Dọn Dẹp Sảnh Chờ Bỏ Hoang Nhanh 3 Phút (`RoomCleanupScheduler`)
- **Tệp sửa đổi**: [`src/server/room_cleanup_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_cleanup_scheduler.ts)
- **Cơ chế**:
  - Bổ sung hằng số `DEFAULT_LOBBY_TIMEOUT_MS = 3 * 60 * 1000` (3 phút).
  - Trong phương thức quét dọn định kỳ `sweep()`:
    - Nếu là sảnh chờ chưa bắt đầu (`room ? !room.started : true`): áp dụng thời hạn ngắn `effectiveTimeout = this.lobbyTimeoutMs` (3 phút).
    - Nếu là trận đấu đang chơi dở bị bỏ rơi: giữ nguyên thời hạn 10 phút.
  - Bảo toàn tính tương thích ngược khi test truyền cấu hình `timeoutMs` tùy chỉnh.

### Thành Phần 3: Đồng Bộ & Phòng Vệ Giả Lập Trận Đấu 4 Người Chơi Thật
- **Tệp sửa đổi**: [`tests/simulation/imp165_four_player_gameplay_sync.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/simulation/imp165_four_player_gameplay_sync.test.ts)
- **Cơ chế phòng vệ**:
  - Bổ sung nhánh xử lý `TurnPhase.HosePhase` gửi `INTENT_SKIP`.
  - Phòng vệ hiệu ứng Đóng băng thị trường (`MarketCardId.MC_FREEZE_TRADE`): kiểm tra trước khi gửi `INTENT_BUY`.
  - Cập nhật `currentActive` theo chỉ số lượt chơi hiện tại của server khi gửi `INTENT_END_TURN`.

---

## 3. Kế Hoạch Xác Minh (Verification Plan)

### Automated Test Suites:
- `tests/server/persistent_room_logger.test.ts` (TC-LOG01.11)
- `tests/server/ops01_room_cleanup.test.ts` (TC-OPS01.5)
- `tests/simulation/imp165_four_player_gameplay_sync.test.ts` (TC-SIM165.01..04)

### Lệnh Kiểm Thử:
```cmd
cmd /c "npm test"
cmd /c "npx tsc --noEmit"
cmd /c "npm run lint:ui"
```
