# [IMP-46] Kế Hoạch Đồng Bộ Thẻ Sự Kiện, Triệt Tiêu Popup Trùng Lặp, Đồng Bộ Deadline 00:00 & Định Danh Tham Gia Đấu Giá

## 1. Bối Cảnh & Vấn Đề

1. **Thẻ Sự Kiện hiển thị chung chung & Bị popup lại**: Khi người chơi rút thẻ Cơ Hội / Thị Trường, nội dung hiển thị tĩnh không có chi tiết số tiền biến động. Khi lượt chuyển sang Bot rồi quay lại người chơi, popup Cơ Hội lại tự động bật lên lần 2 do rò rỉ tham chiếu `handleCellLanding`.
2. **Đồng hồ đếm ngược treo tại 00:00**: Hết 60s, giao diện hiển thị 00:00 nhưng đơ 2-4 giây mới chuyển lượt do client thụ động chờ server và server broadcast Delta trước khi lên lịch timeout.
3. **Người chơi bị tước quyền đấu giá & Giao diện 3D đấu giá gây tối màn hình**: Khi Bot từ chối mua và mở sàn đấu giá, client gán `myId = currentTurnPlayerId` (đang là Bot), khiến người chơi bị khóa quyền bid và hiển thị sai thông báo "Bạn đã từ chối mua...". Ngoài ra `Auction3DStage` làm tối sầm bàn cờ 85% và treo lá bài 3D che khuất tầm nhìn.

---

## 2. Giải Pháp Kỹ Thuật

1. **Đồng bộ chi tiết Thẻ Sự Kiện (Event Card Metadata Sync)**:
   - Server khi bốc thẻ (`drawChanceCard` / `drawMarketCard`) gán thông tin chi tiết vào `room.lastEventCard` và truyền qua `DeltaPayload.lastEventCard` (`cardType`, `cardId`, `title`, `description`, `effectDelta`).
   - Client hiển thị rõ ràng số tiền tăng/giảm và mô tả thực tế của thẻ bài.
2. **Chặn kích hoạt lại Modal bằng Timestamp Guard**:
   - Client sử dụng `lastHandledLandingTimestampRef` để ghi nhớ `lastLandedPawn.timestamp`. Dù `currentTurnPlayerId` thay đổi, modal chỉ mở 1 lần duy nhất cho mỗi sự kiện chạm đất thực sự.
3. **Đồng bộ thời hạn lượt chơi (Turn Timeout Synchrony)**:
   - Server gọi `scheduleBotTurn` / `scheduleTurnTimeout` cập nhật deadline trước khi gọi `broadcastRoomDelta`.
   - Client chủ động gửi `INTENT_END_TURN` hoặc `INTENT_ROLL` khi `turnTimeRemaining === 0` trong lượt của mình.
4. **Định danh chính xác người chơi cục bộ trong Đấu Giá & Tinh gọn Giao diện 2D**:
   - `ModalHost` xác định `myId` từ `props.localPlayerId` (hoặc `useLobbyStore.getState().myPlayerId`), tuyệt đối không fallback về `currentTurnPlayerId`.
   - Chuyển sàn đấu giá sang Modal 2D căn giữa màn hình rõ ràng, xúc giác Impeccable, loại bỏ sân khấu 3D gây tối mờ bàn cờ.

---

## 3. Các Tệp Mã Nguồn Can Thiệp

- `src/domain/room.ts`: Bổ sung `lastEventCard` vào `Room`.
- `src/domain/event_card_metadata.ts`: Định nghĩa kiểu dữ liệu `EventCardMetadata`.
- `src/server/session_manager.ts`: Truyền `lastEventCard` vào `buildDeltaFromRoom`.
- `src/server/network/delta_broadcaster.ts`: Đồng bộ delta có `lastEventCard`.
- `src/server/network/wss_server.ts`: Gọi scheduler trước broadcast; đồng bộ deadline.
- `src/client/network/apply_delta.ts`: Lưu trữ `lastEventCard` vào game store.
- `src/client/store/game_store.ts` & `src/client/store/game_store_types.ts`: Cập nhật state.
- `src/client/offline_landing.ts`: Timestamp guard chống duplicate modal.
- `src/client/ui/hud_container.tsx`: Xử lý auto intent khi timeout = 0.
- `src/client/ui/modals/auction_modal.tsx`: Nhận diện đúng `myId` và trạng thái `declinedPlayerId`.
- `src/client/game_canvas.tsx`: Loại bỏ sân khấu 3D đấu giá làm tối màn hình.

---

## 4. Kế Hoạch Kiểm Thử

- Viết bộ hợp đồng `tests/contracts/gameplay_ux_fixes_contract.test.ts` (3 contract tests).
- Đảm bảo toàn bộ hệ thống test suites tiếp tục PASS 100%.
