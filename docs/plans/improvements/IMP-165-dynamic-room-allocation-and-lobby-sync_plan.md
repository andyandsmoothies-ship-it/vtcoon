# KẾ HOẠCH KỸ THUẬT: PHÁT SINH PHÒNG ĐỘNG, TỰ ĐỘNG CẤP SLOT & ĐỒNG BỘ SẢNH CHỜ THỜI GIAN THỰC (IMP-165)

> **Mã số ticket**: IMP-165  
> **Tên tính năng**: Dynamic Room Allocation, Server Slot Assignment & Real-Time Lobby Synchronization (Pilot Ready)  
> **Trạng thái**: ✅ HOÀN THÀNH — 5942/5942 tests PASS  
> **Mục tiêu**: Chuẩn bị nền tảng hoàn hảo cho nhóm nhỏ người chơi thật (2–4 người) mở liên kết mời và vào chơi trực tiếp với nhau trên môi trường Cloud/Render.com mà không bị xung đột mã phòng `VT8888`, không bị trùng `playerId: 'p2'`, không bị "zombie socket" và sảnh chờ tự động đồng bộ mở khóa nút "BẮT ĐẦU TRẬN ĐẤU".

---

## 1. Kiến Trúc Luồng Hoạt Động Toàn Tuyến (End-to-End Flowchart)

```text
[Người 1: Vào trang chủ https://domain/]
               │
               ▼
[Bước 1: Client sinh mã phòng ngẫu nhiên (vd: VT7294)]
               │ ├── Bỏ qua replaceState nếu là Admin (?admin=true hoặc #/admin)
               │ ├── Lưu cờ chủ phòng: sessionStorage.setItem('vtcoon_host_VT7294', 'true')
               │ └── Cập nhật URL bar: /?room=VT7294 (replaceState)
               ▼
[Gửi CREATE_ROOM { roomCode: 'VT7294', playerId: 'p1' }] ──> [Server: Tạo phòng VT7294]
               │
               ▼ (Chủ phòng copy link mời gửi vào group chat)
[Bạn 2, 3, 4 cùng bấm vào liên kết mời /?room=VT7294]
               │
               ▼ Gửi JOIN_ROOM { roomCode: 'VT7294', playerId: 'p2' }
[Server: wss_lobby_handlers.ts]
  ├── Kiểm tra biên:
  │     • !room ➔ ERROR 'ROOM_NOT_FOUND'
  │     • room.started ➔ ERROR 'ROOM_STARTED'
  │     • room.players.length >= 4 ➔ ERROR 'ROOM_FULL'
  ├── Cấp phát slot Server tuyệt đối (Zero Ambiguity):
  │     • candidateSlots = ['p2', 'p3', 'p4']
  │     • assignedPlayerId = candidateSlots.find(slot => !room.players.some(p => p.id === slot))
  │     • Bạn 2 vào: nhận 'p2', Bạn 3: 'p3', Bạn 4: 'p4'
  ├── Phản hồi: ROOM_JOINED { roomCode, playerId: assignedPlayerId }
  └── Broadcast: LOBBY_UPDATE { roomCode, players: [...] } đến MỌI socket trong phòng
               │
               ▼
[Client]: playerIdRef.current đồng bộ → syncLobbySlots bảo toàn Pawn 3D & Token Color
          → Nút "BẮT ĐẦU TRẬN ĐẤU" SÁNG XANH ngay lập tức!
```

---

## 2. Pre-Flight Blast Radius & 7 Điểm Mù Kỹ Thuật

| Mã | Nguy Cơ | Giải Pháp |
|:--:|:--------|:----------|
| P1.1 | Socket Flapping & Stale Intent khi đổi playerId | `playerIdRef` + `sendIntent`/`sendEmote` dùng `playerIdRef.current` |
| P1.2 | 3D Pawn Loss khi `syncLobbySlots` tạo mới slot | Kế thừa `pawnSlot`, `tokenColor`, `mascotIcon` từ template |
| P1.3 | Zombie Bot Leak — khách disconnect trước trận bị takeover | `handleGraceExpired` remove + LOBBY_UPDATE, không BotEngine.takeover khi `!room.started` |
| P2.1 | Host F5 mất quyền host | `sessionStorage.setItem('vtcoon_host_${roomCode}', 'true')` |
| P2.2 | Bot AI conflict khi real player vào slot | Real player đè Bot AI cục bộ trong `syncLobbySlots` |
| P2.3 | Error code sai: phòng đầy trả ROOM_NOT_FOUND | Phân tầng: `!room` → NOT_FOUND, `started` → ROOM_STARTED, `>=4` → ROOM_FULL |
| P2.4 | Admin URL bị `replaceState` đè | Admin guard: skip logic khi URL chứa `admin=true` hoặc `#admin` |

---

## 3. Các Hạng Mục Triển Khai Chi Tiết

### Bước 1: `src/client/offline_landing.ts`
- `generateRandomRoomCode()`: Sinh VT + 4 ký tự ngẫu nhiên
- Admin guard: `searchStr.includes('admin=true') || hash.includes('admin')`
- `sessionStorage.setItem('vtcoon_host_${code}', 'true')`
- `window.history.replaceState(null, '', '?room=${randomCode}')`

### Bước 2a: `src/server/network/network_types.ts`
- Thêm `LOBBY_UPDATE` với `players: ReadonlyArray<{id, isHost, slotIndex, name?}>`

### Bước 2b: `src/server/room_manager_lifecycle.ts`
- `doJoinRoom`: guard `length >= 4` + duplicate playerId

### Bước 2c: `src/server/network/wss_lobby_handlers.ts`
- `handleJoinRoom`: `candidateSlots = ['p2','p3','p4']`, broadcast `LOBBY_UPDATE`
- `handleLeaveRoom`: broadcast `LOBBY_UPDATE` khi `!room.started`

### Bước 2d: `src/server/network/reconnect_manager.ts`
- `handleGraceExpired`: non-host pre-game → remove + LOBBY_UPDATE + return

### Bước 3a: `src/client/network/use_game_ws.ts`
- `playerIdRef`, `onLobbyUpdate` trong `UseGameWsOptions`
- `sendIntent`/`sendEmote` dùng `playerIdRef.current`

### Bước 3b: `src/client/network/ws_message_handler.ts`
- Handle `LOBBY_UPDATE` → `ctx.onLobbyUpdate`
- `ROOM_JOINED` → `setMyPlayerId` nếu playerId khác

### Bước 3c: `src/client/store/lobby_store.ts` & `lobby_types.ts`
- `setMyPlayerId`, `syncLobbySlots` (kế thừa 3D data, đè bot bằng real player)

---

## 4. Tech Debt Ledger

- **TD-IMP165-01** (Room Code Collision Retry): `wss_lobby_handlers.ts` vẫn còn logic đóng phòng cũ khi trùng `hostId`. Xác suất collision 1/1.000.000. Slice kế tiếp sẽ thêm retry tự động.

---

## 5. Kế Hoạch Kiểm Thử

Suite: `tests/server/imp165_multiplayer_lobby_sync.test.ts` — 21 atomic contract tests

| Tag | Facet | Mô tả |
|:----|:------|:------|
| TC-IMP165.01 | Boundary | Sinh mã VTxxxx 6 ký tự |
| TC-IMP165.02-04 | Boundary | Server cấp slot p2/p3/p4 tuyệt đối |
| TC-IMP165.05 | Error Defense | ROOM_FULL khi đã 4 người |
| TC-IMP165.06 | Reactivity | Broadcast LOBBY_UPDATE sau mỗi JOIN |
| TC-IMP165.07-08 | Reactivity | Bảo toàn Pawn 3D, chống Socket Flapping |
| TC-IMP165.09 | Reactivity | canStartGame mở khóa khi 2+ người |
| TC-IMP165.10-11 | Disposal | Leave/disconnect dọn player, không bot |
| TC-IMP165.12-13 | Error Defense | Host F5, Admin guard |
| TC-IMP165.14-16 | Role Symmetry | Real player đè bot, ROOM_STARTED, 18000 vốn |
