# BÁO CÁO TRIỂN KHAI: PHÁT SINH PHÒNG ĐỘNG, TỰ ĐỘNG CẤP SLOT & ĐỒNG BỘ SẢNH CHỜ THỜI GIAN THỰC (IMP-165)

> **Mã số ticket**: IMP-165  
> **Tên tính năng**: Dynamic Room Allocation, Server Slot Assignment & Real-Time Lobby Synchronization  
> **Ngày hoàn thành**: 2026-09-22  
> **Kết quả kiểm thử**: **5942/5942 PASS — Zero Regression**  
> **Pipeline**: 3-Trạm Adversarial TDD (Station 1 RED → Station 2 GREEN → Station 3 REVIEW)

---

## 1. Tóm Tắt Thay Đổi

IMP-165 giải quyết toàn bộ 7 điểm mù kỹ thuật ngăn cản việc nhiều người chơi thật vào cùng một phòng qua liên kết mời.

### Vấn đề Trước IMP-165
- Tất cả khách mời vào URL `/?room=VT8888` đều gửi `playerId: 'p2'` → xung đột, chỉ người đầu tiên vào được
- Mã phòng hardcoded `'VT8888'` — mọi phòng đều cùng mã
- Khách disconnect trong lobby → bị `BotEngine.takeover` → "zombie Bot" trong sảnh chờ
- Host F5 trang → bị nhận diện là khách, mất quyền host
- Admin vào `/?admin=true` → bị `replaceState` đè thành `?room=VTxxxx`, văng khỏi Admin Portal
- `sendIntent`/`sendEmote` bị stale closure → gửi intent với playerId cũ

---

## 2. Files Đã Thay Đổi

| File | Thay đổi chính |
|:-----|:---------------|
| [`src/client/offline_landing.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/offline_landing.ts) | `generateRandomRoomCode()` VT+4 ký tự; admin guard; `sessionStorage` host flag; `replaceState` |
| [`src/server/network/network_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/network_types.ts) | Thêm `LOBBY_UPDATE` vào `WsServerMessage` union type |
| [`src/server/room_manager_lifecycle.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager_lifecycle.ts) | `doJoinRoom`: guard `length >= 4` + duplicate playerId |
| [`src/server/network/wss_lobby_handlers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_lobby_handlers.ts) | Server Slot Assignment tuyệt đối (`candidateSlots`); `buildLobbyUpdatePayload`; broadcast sau JOIN/LEAVE |
| [`src/server/network/reconnect_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/reconnect_manager.ts) | Pre-game non-host disconnect: remove player + broadcast `LOBBY_UPDATE`, không gọi `BotEngine.takeover` |
| [`src/client/store/lobby_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_types.ts) | Thêm `setMyPlayerId` + `syncLobbySlots` vào `LobbyState` interface |
| [`src/client/store/lobby_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/lobby_store.ts) | Implement `setMyPlayerId` + `syncLobbySlots` (kế thừa pawnSlot/tokenColor, đè bot) |
| [`src/client/network/use_game_ws.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_game_ws.ts) | `playerIdRef`; `onLobbyUpdate` trong `UseGameWsOptions`; `sendIntent`/`sendEmote` dùng `playerIdRef.current` |
| [`src/client/network/ws_message_handler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/ws_message_handler.ts) | Handle `LOBBY_UPDATE` → `ctx.onLobbyUpdate`; `ROOM_JOINED` → `setMyPlayerId` nếu playerId khác |
| [`tests/server/net04_reconnect.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/net04_reconnect.test.ts) | Reconcile TC-NET04.1/2/3/4-inv3/inv5: thêm `startGame()` để test đúng context `room.started=true` |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Thêm Gotcha #224 (Server Slot Assignment) và #225 (Pre-Game Lobby Guard) |

---

## 3. Kết Quả Kiểm Thử

### Station 1 — RED (qa-tester)
- File: `tests/server/imp165_multiplayer_lobby_sync.test.ts`
- Kết quả ban đầu: **14/21 FAIL** (đúng RED phase)

### Station 2 — GREEN (implementer)
- Kết quả sau implement: **21/21 PASS** (IMP-165 suite)
- Full suite: **5937/5942** (5 net04 tests cần reconcile)

### Reconcile net04 (main agent)
- Nguyên nhân: TC-NET04.1/2/3/4-inv3/inv5 test UC-GAME-006..008 trong context lobby chưa start — behavior này đã được IMP-165 supersede bằng `LOBBY_UPDATE`
- Giải pháp: Thêm `server.getRoomManager().startGame(roomCode)` vào setup → test đúng scenario `room.started=true`
- Kết quả: **10/10** net04 PASS

### Station 3 — Review (spec-reviewer)
- Lần 1: **FAIL** — phát hiện Bước 3a (`use_game_ws.ts`) và 3b (`ws_message_handler.ts`) chưa được implementer thực hiện
- Sau fix: **5942/5942 PASS — Zero Regression**

---

## 4. Domain Invariants Mới

### Gotcha #224 — `[NET/SYNC]` Server Slot Assignment Tuyệt Đối
- Server KHÔNG bao giờ tin `msg.playerId` từ client khi xử lý `JOIN_ROOM`
- `handleJoinRoom` luôn dùng `candidateSlots = ['p2','p3','p4']`
- `doJoinRoom` có 2 guards bắt buộc: `length >= 4` và duplicate playerId
- `LOBBY_UPDATE` broadcast đến tất cả socket sau mỗi JOIN/LEAVE

### Gotcha #225 — `[NET/SYNC][BOT/AI]` Pre-Game Lobby Guard
- UC-GAME-006/007/008 (Grace/Reconnect/Bot Takeover) chỉ áp dụng khi `room.started === true`
- Pre-game non-host disconnect → remove player + broadcast `LOBBY_UPDATE` + return (KHÔNG gọi BotEngine)
- Host pre-game disconnect → giữ host trong phòng, không remove, không takeover

---

## 5. Tech Debt

| ID | Mô tả | Ưu tiên |
|:---|:------|:--------|
| TD-IMP165-01 | Room Code Collision Retry — xác suất 1/1.000.000, chưa xử lý | Low |

---

## 6. Post-Review Fix — Bất Thường Nối Dây (IMP-165 Addendum)

> **Phát hiện bởi**: User review sau Station 3 sign-off  
> **Mức độ**: CRITICAL — Toàn bộ luồng LOBBY_UPDATE → UI bị câm ở runtime

### Vấn đề

Spec-reviewer ở Station 3 chỉ phát hiện rằng `use_game_ws.ts` và `ws_message_handler.ts` **thiếu khai báo** `onLobbyUpdate`. Sau khi thêm vào, pipeline kiểm thử 21/21 xanh vì test gọi `useLobbyStore.getState().syncLobbySlots(...)` trực tiếp — **không qua luồng React Hook thật**.

Thực tế bị thiếu:

1. **`ws_message_handler.ts`**: Handler `LOBBY_UPDATE` chỉ gọi `ctx.onLobbyUpdate?.(msg.players)` — phụ thuộc hoàn toàn vào callback được truyền vào. Không có fallback trực tiếp vào store.

2. **`use_app_session.ts`**: Nơi duy nhất khởi tạo `useGameWs` trong cây React **không truyền `onLobbyUpdate`** → `ctx.onLobbyUpdate` là `undefined` → `syncLobbySlots` không bao giờ được gọi ở runtime.

**Hậu quả**: Màn hình Sảnh Chờ của Host không tự cập nhật khi bạn bè vào phòng. Nút "BẮT ĐẦU TRẬN ĐẤU" không tự sáng.

### Fix (2 điểm)

**[`src/client/network/ws_message_handler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/ws_message_handler.ts)** — Gọi store trực tiếp, không phụ thuộc callback chain:
```ts
} else if (msg.type === 'LOBBY_UPDATE') {
  // Gọi trực tiếp store — không phụ thuộc callback chain use_app_session
  useLobbyStore.getState().syncLobbySlots?.(msg.players);
  ctx.onLobbyUpdate?.(msg.players);
}
```

**[`src/client/network/use_app_session.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_app_session.ts)** — Cắm dây callback (defence-in-depth):
```ts
onLobbyUpdate: (players) => useLobbyStore.getState().syncLobbySlots?.(players),
```

### Ghi Nhận Kinh Nghiệm

- **Lỗi quy trình**: Test suite thiếu integration test xuyên suốt `useGameWs → handleWsMessage → useLobbyStore` qua React Hook thật.
- **Phòng thủ tương lai**: Bất kỳ store action nào cần được kích hoạt từ WS message phải được gọi **trực tiếp trong handler** (`ws_message_handler.ts`) — KHÔNG chỉ qua callback tùy chọn.

---

## 7. Các Điểm Cần Theo Dõi (Tech Debt Tiếp Theo)

| ID | Mô tả | Mức độ |
|:---|:------|:-------|
| TD-IMP165-01 | Room Code Collision Retry — xác suất 1/1.000.000 | Low |
| TD-IMP165-02 | UX: Host không nhận PLAYER_GRACE khi khách chập mạng pre-game (60s im lặng) | Medium — cân nhắc slice tiếp theo |
| TD-IMP165-03 | Guest F5 trong lobby bị mất slot cũ, có thể nhận slot khác | Medium — cân nhắc sessionStorage guest slot |

---

## 8. Thẩm Định UI Craft 2D (Station 3 Sign-Off Gate)

- **Báo cáo chi tiết**: [`docs/reports/audits/UI_CRAFT_REVIEW_IMP165_LOBBY.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/UI_CRAFT_REVIEW_IMP165_LOBBY.md)
- **Reviewer**: `ui-craft-reviewer` (Antigravity 2.0 & Impeccable Engine)
- **Phán quyết (Disposition)**: `disposition: ship` (Verdict: PASS Vòng 2)
- **Kết quả Linter**: `npm run lint:ui` — 0 vi phạm trên 169 files (Clean)
- **Tóm tắt khắc phục (@360px)**:
  - P1: Chuẩn hóa `max-h-[calc(100dvh-7rem)]` tránh bị che khuất bởi thanh URL trình duyệt di động.
  - P2: Toàn bộ các nút thao tác đạt touch target floor `min-h-[44px]`.
  - P3: Đưa `QrCodeCard` ra modal overlay độc lập, giải phóng 100% không gian hiển thị danh sách người chơi.
  - P4: Nâng cỡ chữ lên tối thiểu `text-[11px]` và sửa class `py-0.5` hợp lệ.
  - P5: Khắc phục tràn ngang header với `max-w-[calc(100vw-1.5rem)]` và `truncate`.
  - P6: Ẩn badge phụ Bot AI trên `@360px` để bảo vệ độ rộng hiển thị tên người chơi.
- **Hạ tầng kiểm thử**: 55/55 tests PASS trên toàn bộ suite sảnh chờ.
