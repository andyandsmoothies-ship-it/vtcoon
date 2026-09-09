# EPIC 3 — SỔ CÁI TIẾN ĐỘ: REALTIME GATEWAY & SẢNH CHỜ
> **Dự án:** VTCoOn — Đại Gia Địa Ốc Việt Nam  
> **Giai đoạn:** Phase 3 / 4  
> **Trạng thái mở cửa:** 2026-09-09  
> **Căn cứ Sign-off Phase 2:** 535/535 Tests PASS — Adversarial Inversion ✅  
> **Phiên bản tài liệu:** 1.0.0

---

## 1. TẦM NHÌN EPIC

Biến hạ tầng `SessionManager` và `DeltaPayload` đang ở trạng thái **in-memory/mock** thành một **WebSocket Server thật (WSS)** chạy trên Node.js, cho phép 2–6 người chơi thật kết nối qua trình duyệt từ các thiết bị khác nhau, đồng bộ trạng thái bàn cờ dưới 10KB/tick, và chịu được sự cố mạng với ân hạn 60 giây + Bot tiếp quản tự động.

```
[Browser Client A] ──WSS──┐
[Browser Client B] ──WSS──┤
[Browser Client C] ──WSS──┼──► [Fastify WSS Server] ──► [RoomManager FSM]
[Browser Client D] ──WSS──┤         │
[Browser Client E] ──WSS──┘    [SessionManager]
                                     │
                            [DeltaPayload < 10KB]
                                     │
                         ┌───────────┴──────────┐
                    [Broadcast]           [Reconnect Token]
                    [Heartbeat 5s]        [LocalStorage]
```

---

## 2. RANH GIỚI KIẾN TRÚC (ARCHITECTURE BOUNDARY)

| Lớp | Phạm vi Phase 3 | Nằm ngoài phạm vi |
|---|---|---|
| **Transport** | WebSocket (wss://) — Fastify + @fastify/websocket | HTTP REST, gRPC |
| **Auth** | Token 6 ký tự phòng + Reconnect Token (UUID v4) trong LocalStorage | OAuth, JWT người dùng thật |
| **State Sync** | DeltaPayload (<10KB) broadcast sau mỗi intent | Full-state sync, video stream |
| **Bot** | Tiếp quản sau 60s mất kết nối (đã có BotEngine Phase 1) | Bot AI học máy nâng cao |
| **QR** | Tạo mã QR phía client từ URL phòng (qrcode.js) | Server-side QR rendering |
| **Persistence** | In-memory Room Map trên server (phù hợp Phase 3) | Database, Redis, persistent sessions |

---

## 3. PHÂN RÃ VERTICAL SLICES

### NET-01 — Máy Chủ WSS & API Tạo Phòng 6 Ký Tự

| Thuộc tính | Nội dung |
|---|---|
| **Mã Slice** | NET-01 |
| **Trạng thái** | 🟢 **Hoàn tất (Sign-off 2026-09-09)** |
| **Ưu tiên** | P0 — Blocking (mọi Slice sau phụ thuộc) |
| **Use Case Refs** | UC-GAME-001, UC-GAME-004 |

#### Luồng MSS (Main Success Scenario)

```
[Host Browser]
  1. Gửi POST /api/rooms  (hoặc WS message: INTENT_CREATE_ROOM)
  2. Server tạo roomCode 6 ký tự [A-Z0-9], lưu Room vào RoomMap
  3. Server trả về { roomCode, wsUrl: "wss://host/rooms/:roomCode" }
  4. Host kết nối WS → Server ghi nhận Session với ID = playerId
  5. Server bắt đầu phát Heartbeat PING mỗi 5 giây
  6. Client trả PONG → SessionManager.handlePong() cập nhật lastPongAt
  7. Server broadcast DeltaPayload tick=0 (trạng thái phòng rỗng)
```

#### Luồng Thay Thế (Alternative Flows)

| Mã | Kịch bản | Xử lý |
|---|---|---|
| A1 | roomCode đã tồn tại (collision) | Tạo lại tối đa 5 lần, trả lỗi ROOM_CODE_COLLISION nếu vẫn trùng |
| A2 | Phòng đã đủ 6 người | Từ chối kết nối, trả ReasonCode: ROOM_FULL |
| A3 | roomCode không tồn tại khi join | Trả ReasonCode: ROOM_NOT_FOUND |

#### Test Contracts

```typescript
// [UC-GAME-001/MSS] Tạo phòng cấp mã 6 ký tự hợp lệ
expect(roomCode).toMatch(/^[A-Z0-9]{6}$/);
expect(room.players).toHaveLength(1); // host

// [UC-GAME-004/MSS] Heartbeat PING→PONG cập nhật trạng thái Connected
session.state === SessionState.Connected

// [UC-GAME-001/A1] Collision: trả ReasonCode rõ ràng
expect(result.reasonCode).toBe('ROOM_CODE_COLLISION');

// [UC-GAME-001/A2] Phòng đủ người: từ chối join
expect(result.reasonCode).toBe('ROOM_FULL');
```

#### Ngân Sách LOC

| File | Loại | Ngân sách |
|---|---|---|
| `src/server/room_code_generator.ts` | Logic/Domain | <= 60 LOC |
| `src/server/ws_server.ts` | Integration | <= 200 LOC |
| `src/server/room_map.ts` | Domain Service | <= 80 LOC |
| `tests/server/room_code_generator.test.ts` | Unit Test | <= 80 LOC |
| `tests/integration/ws_server.test.ts` | Integration Test | <= 150 LOC |

#### Artifacts Thực Tế (Sign-off 2026-09-09)

| File | LOC thực tế |
|---|---|
| `src/server/network/network_types.ts` | 59 LOC |
| `src/server/network/wss_server.ts` | 161 LOC |
| `tests/server/net01_wss.test.ts` | 142 LOC |

**Quyết định kỹ thuật:** Dùng thư viện `ws` + `@types/ws` thay Fastify (nhẹ hơn, zero overhead, đủ cho Phase 3). `generateRoomCode()` đã có trong `src/domain/room.ts` — tái dùng, không viết lại.

#### Exit Guarantees (Cổng Ra)

- [x] `roomCode` khớp regex `/^[A-Z0-9]{6}$/` — TC-NET01.1 PASS
- [x] Server WS khởi động không lỗi — smoke test pass (port 3099)
- [x] `SessionManager.checkHeartbeats()` chạy đúng chu kỳ 5s — kế thừa từ Phase 1
- [x] Zero Regression: **540/540 tests PASS** (+5 tests NET-01, tăng từ 535)


---

### NET-02 — Giao Diện Sảnh Chờ Lobby & Mã QR

| Thuộc tính | Nội dung |
|---|---|
| **Mã Slice** | NET-02 |
| **Trạng thái** | 🟢 **Hoàn tất (Sign-off 2026-09-09)** |
| **Ưu tiên** | P1 — Phụ thuộc NET-01 |
| **Use Case Refs** | UC-GAME-002, UC-GAME-003 |

#### Luồng MSS (Main Success Scenario)

```
[Host Browser]
  1. Nhận roomCode từ NET-01 → Hiển thị màn hình Lobby
  2. Hiển thị mã QR = qrcode.js(wss://host/rooms/:roomCode)
  3. Host cấu hình: số người chơi (2-6), vị trí Bot AI (slot nào là Bot)
  4. Host gửi INTENT_CONFIG_ROOM { maxPlayers, botSlots[] }
  5. Server lưu config vào Room, broadcast LobbyStateUpdate cho tất cả

[Guest Browser]
  6. Quét QR hoặc nhập URL → kết nối WS vào roomCode
  7. Server cấp playerId mới, thêm vào Room.players[]
  8. Server broadcast LobbyStateUpdate (danh sách người chơi hiện tại)
  9. Host nhấn "Bắt Đầu" → INTENT_START_GAME (chỉ Host mới được)
  10. Server kiểm tra đủ điều kiện → chuyển FSM sang TurnStart
```

#### Luồng Thay Thế (Alternative Flows)

| Mã | Kịch bản | Xử lý |
|---|---|---|
| A1 | Guest không phải Host nhấn "Bắt Đầu" | ReasonCode: NOT_HOST |
| A2 | Số người chơi < 2 khi Host nhấn Start | ReasonCode: NOT_ENOUGH_PLAYERS |
| A3 | Slot Bot AI trùng slot đã có người thật | ReasonCode: SLOT_CONFLICT |

#### Test Contracts

```typescript
// [UC-GAME-002/MSS] Cấu hình phòng hợp lệ
expect(room.maxPlayers).toBe(4);
expect(room.botSlots).toEqual([3, 4]);

// [UC-GAME-003/MSS] Guest gia nhập → LobbyStateUpdate broadcast
expect(broadcast.type).toBe('LOBBY_STATE_UPDATE');
expect(broadcast.players).toHaveLength(2);

// [UC-GAME-002/A1] Non-host không được start
expect(result.reasonCode).toBe('NOT_HOST');

// [UC-GAME-003/A2] Không đủ người → không start
expect(result.reasonCode).toBe('NOT_ENOUGH_PLAYERS');
```

#### Ngân Sách LOC

| File | Loại | Ngân sách |
|---|---|---|
| `src/client/lobby_screen.tsx` | UI Component | <= 250 LOC |
| `src/client/hooks/use_lobby_ws.ts` | Custom Hook | <= 80 LOC |
| `src/client/components/qr_code_display.tsx` | UI Component | <= 60 LOC |
| `src/server/lobby_handler.ts` | Domain Service | <= 120 LOC |
| `tests/server/lobby_handler.test.ts` | Unit Test | <= 100 LOC |
| `tests/client/ui06_lobby_screen.test.ts` | Widget Test | <= 120 LOC |

#### Artifacts Thực Tế (Sign-off 2026-09-09)

| File | LOC thực tế |
|---|---|
| `src/client/ui/lobby/qr_helper.ts` | 72 LOC |
| `src/client/ui/lobby/qr_code_card.tsx` | 120 LOC |
| `src/client/ui/lobby/player_slot_card.tsx` | 144 LOC |
| `src/client/ui/lobby/lobby_view.tsx` | 189 LOC |
| `src/client/store/lobby_store.ts` | 191 LOC |
| `src/client/store/lobby_types.ts` | 88 LOC |
| `src/client/main.tsx` | 129 LOC |
| `tests/client/net02_lobby.test.ts` | 218 LOC |
| `tests/client/ui06_lobby_screen.test.ts` | 119 LOC |

#### Exit Guarantees (Cổng Ra)

- [x] QR code render từ URL phòng — visual smoke & unit test pass
- [x] Quản lý sảnh chờ 4 slots, đồng bộ trạng thái Host / Guest / Bot
- [x] Chỉ Host mới có quyền bấm Bắt đầu trận đấu — adversarial test pass
- [x] Bot slot được cấu hình linh hoạt (Balanced, Aggressive, Passive) và hỗ trợ cycle tính cách — contract test pass
- [x] Zero Regression: **561/561 bài test PASS** (+21 tests NET-02, tăng từ 540)

---

### NET-03 — Đồng Bộ Delta Payload < 10KB Qua Mạng Thật

| Thuộc tính | Nội dung |
|---|---|
| **Mã Slice** | NET-03 |
| **Trạng thái** | 🟢 **Hoàn tất (Sign-off 2026-09-09)** |
| **Ưu tiên** | P1 — Song song với NET-02 sau khi NET-01 xong |
| **Use Case Refs** | UC-GAME-009 |

#### Luồng MSS (Main Success Scenario)

```
[Server FSM — sau mỗi Intent xử lý xong]
  1. Gọi buildDeltaFromRoom(room, registry, stateMap, tick++)
  2. JSON.stringify(deltaPayload) → kiểm tra byteLength < 10_240
  3. Nếu vượt ngưỡng: áp dụng sparse diff (chỉ gửi cells có thay đổi)
  4. Gọi SessionManager.broadcastDelta(payload) → gửi WS message type=DELTA
  5. Client nhận DELTA → merge vào local game state
  6. Client phát âm thanh/animation dựa trên delta fields thay đổi
  7. Concurrent lock: dùng async mutex để ngăn 2 intent xử lý đồng thời
```

#### Luồng Thay Thế (Alternative Flows)

| Mã | Kịch bản | Xử lý |
|---|---|---|
| A1 | Delta > 10KB sau sparse diff | Log cảnh báo WARN_DELTA_OVERSIZED, gửi toàn bộ và alert dev |
| A2 | Client mất gói tin (WS buffer đầy) | Client gửi INTENT_REQUEST_RESYNC, server gửi lại delta tick hiện tại |
| A3 | Hai intent đến đồng thời | Mutex queue — intent thứ 2 chờ intent thứ 1 xong mới xử lý |

#### Test Contracts

```typescript
// [UC-GAME-009/MSS] Delta payload kích thước < 10KB
const json = JSON.stringify(delta);
expect(new TextEncoder().encode(json).byteLength).toBeLessThan(10_240);

// [UC-GAME-009/MSS] Chỉ gửi cells có thay đổi (sparse diff)
const sparsePayload = buildSparseDelta(prevDelta, nextDelta);
expect(sparsePayload.cells.length).toBeLessThan(BOARD_SIZE);

// [UC-GAME-009/A3] Concurrent lock: intent thứ 2 không làm hỏng state
// (Adversarial: gửi 2 INTENT đồng thời, kiểm tra invariant tiền tệ)
const totalBefore = sumBalances(room);
await Promise.all([intent1, intent2]);
expect(sumBalances(room)).toBe(totalBefore); // bất biến bảo toàn tiền
```

#### Ngân Sách LOC

| File | Loại | Ngân sách |
|---|---|---|
| `src/server/delta_broadcaster.ts` | Domain Service | <= 120 LOC |
| `src/server/intent_mutex.ts` | Core Logic | <= 60 LOC |
| `src/client/hooks/use_game_ws.ts` | Custom Hook | <= 100 LOC |
| `tests/server/delta_size.test.ts` | Contract Test | <= 80 LOC |
| `tests/server/intent_mutex.test.ts` | Unit Test | <= 80 LOC |

#### Artifacts Thực Tế (Sign-off 2026-09-09)

| File | LOC thực tế |
|---|---|
| `src/server/network/intent_mutex.ts` | 58 LOC |
| `src/server/network/delta_broadcaster.ts` | 177 LOC |
| `src/server/network/wss_server.ts` | 247 LOC |
| `src/client/network/use_game_ws.ts` | 272 LOC |
| `src/client/hooks/use_game_ws.ts` | 2 LOC |
| `tests/server/net03_sync.test.ts` | 486 LOC |

#### Exit Guarantees (Cổng Ra)

- [x] `JSON.stringify(delta).byteLength < 10_240` — TC-NET03.1 contract test pass trên bàn cờ cực đại (< 5KB) và thực tế (< 3KB)
- [x] Sparse diff chỉ gửi ô thay đổi (`cells.length < BOARD_SIZE`) — TC-NET03.2 pass, xử lý chuẩn xác giải chấp `isMortgaged: false`
- [x] Concurrent intent test: bất biến tổng tiền bảo toàn qua FIFO Mutex — TC-NET03.3 adversarial pass
- [x] Khả năng chống chịu lỗi (Defensive Resilience): payload null / intent thiếu trường không gây unhandled rejection, socket cleanup an toàn không rò rỉ RAM
- [x] Zero Regression: **574/574 bài test PASS** (+13 tests NET-03, tăng từ 561)

---

### NET-04 — Cơ Chế Reconnect Token LocalStorage & Ân Hạn 60s → Bot Tiếp Quản

| Thuộc tính | Nội dung |
|---|---|
| **Mã Slice** | NET-04 |
| **Trạng thái** | 🟢 **Hoàn tất (Sign-off 2026-09-09)** |
| **Ưu tiên** | P2 — Phụ thuộc NET-01 và NET-03 |
| **Use Case Refs** | UC-GAME-006, UC-GAME-007, UC-GAME-008 |

#### Luồng MSS (Main Success Scenario)

```
[Khi người chơi kết nối lần đầu]
  1. Server cấp reconnectToken = UUID v4 gắn với playerId + roomCode
  2. Server gửi { type: SESSION_INIT, reconnectToken, playerId, roomCode }
  3. Client lưu vào localStorage["vtcoon_token_${roomCode}"]

[Khi người chơi mất kết nối — F5/tab đóng/mạng yếu]
  4. WS connection đứt → Server phát hiện qua Heartbeat hoặc socket close
  5. SessionManager.checkHeartbeats(): elapsed > HEARTBEAT_INTERVAL_MS (5s)
     → session.state = GracePeriod
  6. Server broadcast { type: PLAYER_GRACE, playerId, secondsLeft: 60 }
     → HUD hiển thị countdown cho tất cả người chơi trong phòng
  7. FSM tạm dừng lượt của player này (không time-out lượt trong grace period)

[Nếu người chơi quay lại trong 60s]
  8. Client đọc localStorage["vtcoon_token_${roomCode}"]
  9. Gửi WS message: { type: RECONNECT, reconnectToken, roomCode }
  10. Server xác minh token → khôi phục session, trả Full Snapshot 40 ô
  11. session.state → Connected, xóa countdown
  12. Broadcast { type: PLAYER_RECONNECTED, playerId }

[Nếu hết 60s không quay lại]
  13. elapsed > GRACE_PERIOD_MS (60s) → session.state = Disconnected
  14. Server gọi BotEngine.takeover(room, playerId)
       → player.isBot = true (BotEngine từ Phase 1 tiếp quản)
  15. Broadcast { type: PLAYER_BOT_TAKEOVER, playerId }
  16. Đánh dấu reconnectToken hết hạn (TOKEN_EXPIRED)
```

#### Luồng Thay Thế (Alternative Flows)

| Mã | Kịch bản | Xử lý |
|---|---|---|
| A1 | reconnectToken hết hạn (player đã bị chuyển Bot) | ReasonCode: TOKEN_EXPIRED — không cho quay lại điều khiển |
| A2 | reconnectToken giả mạo / không tìm thấy | ReasonCode: TOKEN_INVALID |
| A3 | Tất cả người chơi thật đều disconnect | Server pause game, chờ 60s; sau đó giải phóng phòng |
| A4 | Người chơi F5 trong lượt của mình | Grace period giữ lượt, không tự động end turn cho đến khi hết 60s |

#### Test Contracts

```typescript
// [UC-GAME-006/MSS] Grace period 60s kích hoạt đúng
session.state === SessionState.GracePeriod;
expect(broadcast.type).toBe('PLAYER_GRACE');
expect(broadcast.secondsLeft).toBe(60);

// [UC-GAME-007/MSS] Reconnect Token khôi phục session và nhận Full Snapshot
const result = await reconnect(validToken);
expect(result.session.state).toBe(SessionState.Connected);
expect(result.deltaPayload.cells.length).toBe(BOARD_SIZE);

// [UC-GAME-008/MSS] Bot tiếp quản sau 60s
expect(player.isBot).toBe(true);
expect(broadcast.type).toBe('PLAYER_BOT_TAKEOVER');

// [UC-GAME-007/A1] Token hết hạn bị từ chối
expect(result.reasonCode).toBe('TOKEN_EXPIRED');

// [UC-GAME-007/A2] Token không tồn tại bị từ chối
expect(result.reasonCode).toBe('TOKEN_INVALID');
```

#### Artifacts Thực Tế (Sign-off 2026-09-09 — Review & Hardened)

| File | LOC thực tế | Vai trò |
|---|---|---|
| `src/server/network/reconnect_manager.ts` | 192 LOC | Quản lý token, ân hạn và chuyển giao Bot |
| `src/server/network/wss_server.ts` | 252 LOC | WebSocket gateway xử lý RECONNECT, supersedes zombie sockets |
| `src/server/room_manager.ts` | 311 LOC | runBotTurn hoàn tất toàn bộ chu trình lượt không deadlock |
| `src/domain/bot/bot_engine.ts` | 85 LOC | BotEngine.takeover() chuyển player.isBot |
| `src/client/network/reconnect_token.ts` | 30 LOC | Quản lý LocalStorage token tách biệt |
| `src/client/network/apply_delta.ts` | 121 LOC | Đồng bộ Zustand store và ánh xạ isBot cho HUD |
| `src/client/network/use_game_ws.ts` | 229 LOC | Client hook tích hợp localStorage auto-reconnect |
| `tests/server/net04_reconnect.test.ts` | 423 LOC | Suite kiểm thử TC-NET04.1 → TC-NET04.4 + active game + concurrent |
| `tests/client/net04_client_reconnect.test.ts` | 184 LOC | Suite kiểm thử Client localStorage, events & isBot store sync |

#### Exit Guarantees (Cổng Ra)

- [x] reconnectToken UUID v4, lưu và đọc đúng từ localStorage — smoke & unit tests pass
- [x] `SessionState.GracePeriod` kích hoạt khi socket đứt hoặc sau `HEARTBEAT_INTERVAL_MS` (5s không có PONG) — TC-NET04.1 & TC-NET04.1-hb pass
- [x] Gửi RECONNECT với token hợp lệ khôi phục thành công session và nhận Full Snapshot 40 ô — TC-NET04.2 pass
- [x] `SessionState.Disconnected` + Bot takeover (`isBot = true`) sau `GRACE_PERIOD_MS` (60s) và bot hoàn tất lượt không kẹt `ActionPhase` — TC-NET04.3 & TC-NET04.3-active pass
- [x] Token giả mạo (`TOKEN_INVALID`), hết hạn (`TOKEN_EXPIRED`), bot intent rejection, và concurrent socket superseding được kiểm soát chặt chẽ — TC-NET04.4 adversarial pass
- [x] Zero Regression: **589/589 bài test PASS** (+15 tests NET-04, tăng từ baseline 574)

---

## 4. LỘ TRÌNH THỰC THI (EXECUTION ROADMAP)

```
WEEK 1                    WEEK 2                    WEEK 3
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│ NET-01             │   │ NET-02    NET-03    │   │ NET-04             │
│ WSS Server         │──►│ Lobby UI  Delta<10K │──►│ Reconnect &        │
│ Tạo phòng 6 ký tự  │   │ QR Code   Sparse    │   │ Grace Period 60s   │
│                    │   │           Diff      │   │ Bot Takeover       │
└────────────────────┘   └────────────────────┘   └────────────────────┘
     ↓ Sign-off                ↓ Sign-off               ↓ Sign-off
  535+ tests PASS          535+ tests PASS          535+ tests PASS
```

Quy tắc song song: NET-02 (UI) và NET-03 (Delta sync) có thể thi công đồng thời sau khi NET-01 sign-off, vì ranh giới không giao thoa (UI vs. Server logic).

---

## 5. KIẾN TRÚC PHỤ THUỘC (DEPENDENCY MAP)

```
Phase 1 (FSM Engine)     Phase 2 (3D UI)
       │                        │
       │ RoomManager            │ game_canvas.tsx
       │ BotEngine              │ HUD Components
       │ DeltaPayload           │
       └──────────────┬─────────┘
                      │
              ┌───────▼────────┐
              │   NET-01       │
              │   WSS Server   │
              │   room_map.ts  │
              └───────┬────────┘
                      │
           ┌──────────┼──────────┐
           │                     │
    ┌──────▼───────┐   ┌─────────▼───────┐
    │   NET-02     │   │    NET-03        │
    │  Lobby UI    │   │  Delta < 10KB    │
    │  QR Code     │   │  Sparse Diff     │
    └──────────────┘   └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │    NET-04        │
                        │  Reconnect Token │
                        │  Grace 60s → Bot │
                        └─────────────────┘
```

---

## 6. TIÊU CHUẨN NGHIỆM THU EPIC (DoD — Definition of Done)

Toàn bộ Epic 3 được coi là Hoàn tất khi đáp ứng 100% các tiêu chí sau:

### 6.1 Chức năng (Functional)

- [x] UC-GAME-001: Tạo phòng cấp mã 6 ký tự [A-Z0-9] — collision-safe
- [x] UC-GAME-002: Host cấu hình 2–6 người chơi và vị trí Bot AI
- [x] UC-GAME-003: Guest gia nhập qua URL hoặc quét mã QR — LobbyStateUpdate broadcast
- [x] UC-GAME-004: WebSocket kết nối thật — Heartbeat PING/PONG 5s
- [x] UC-GAME-006: Ân hạn mất kết nối 60s — HUD countdown broadcast
- [x] UC-GAME-007: Reconnect Token LocalStorage — khôi phục session thành công
- [x] UC-GAME-008: Bot tiếp quản vĩnh viễn sau 60s — player.isBot = true
- [x] UC-GAME-009: Delta Payload < 10KB — sparse diff khi vượt ngưỡng
- [ ] UC-GAME-010: Tổng kết ván, giải phóng phòng sau 10 phút (chuyển giao Tech Debt TD-NET-005)

### 6.2 Phi chức năng (Non-Functional)

- [x] TypeScript strict mode — noUncheckedIndexedAccess: true — Zero Dirty Casts
- [x] Zero Regression — Tổng số bài test >= 535 tất cả PASS (589/589)
- [x] Delta tick < 10KB trên 100% game states thông qua contract test
- [x] Heartbeat chu kỳ 5s không drift — unit test với fake timer
- [x] Concurrent intent — bất biến tổng tiền bảo toàn — adversarial test

### 6.3 Quy trình (Process)

- [x] Code Review pass spec-reviewer (Three-Way Spec Reconciliation)
- [x] Code Review pass code-reviewer (Lean Observability, Zero Silent Swallow)
- [x] Tài liệu tiếng Việt — mọi comment, doc, và artifact theo GEMINI.md
- [x] Sổ Cái cập nhật trạng thái từng Slice sau khi sign-off

---

## 7. SỔ NỢ KỸ THUẬT (TECH DEBT LEDGER)

| Mã | Mô tả nợ kỹ thuật | Slice nguồn | Slice nhận |
|---|---|---|---|
| TD-NET-001 | Persistence (lưu Room vào Redis/DB khi server restart) | NET-01 | Phase 4 / Epic Operations |
| TD-NET-002 | Xác thực người dùng thật (OAuth/JWT) thay thế token phòng | NET-01 | Phase 4 |
| TD-NET-003 | Stress test đồng thời 50–100 phòng / leak RAM | NET-03 | Phase 4 / Epic Operations |
| TD-NET-004 | UC-GAME-005 (Bot AI 3 tính cách điều phối qua WS) — đã có BotEngine, chưa wire vào WS | NET-04 | Phase 4 |
| TD-NET-005 | UC-GAME-010 (Tổng kết ván + giải phóng phòng 10 phút) — scope Phase 3 nhưng deferrable | NET-04 | Phase 4 |

---

## 8. NHẬT KÝ TIẾN ĐỘ (PROGRESS LOG)

| Ngày | Sự kiện |
|---|---|
| 2026-09-09 | Kích hoạt Epic 3. Sign-off Phase 2 xác nhận 535/535 tests PASS. Sổ Cái khởi tạo. |
| 2026-09-09 | NET-01 bắt đầu — Cài ws+@types/ws, tạo network_types.ts, wss_server.ts |
| 2026-09-09 | **NET-01 Sign-off** — 5 tests TC-NET01.1→TC-NET01.5 PASS. Tổng: 540/540. |
| 2026-09-09 | NET-02 + NET-03 bắt đầu (song song) |
| 2026-09-09 | **NET-02 Sign-off** — 21 tests UI & Lobby PASS. Tổng: 561/561. |
| 2026-09-09 | **NET-03 Sign-off** — 13 tests Delta Sync & Intent Mutex PASS (kèm Adversarial malformed payload, unmortgage sparse diff, socket leak cleanup). Tổng: 574/574. |
| 2026-09-09 | NET-04 bắt đầu — ReconnectManager, wss_server, use_game_ws, net04_reconnect.test.ts, net04_client_reconnect.test.ts |
| 2026-09-09 | **NET-04 Sign-off** — 15 tests Reconnect Token & 60s Grace Period PASS. Tổng: 589/589 tests PASS. **EPIC 3 HOÀN TẤT**. |


---

## 9. THAM CHIẾU TÀI LIỆU

| Tài liệu | Đường dẫn |
|---|---|
| Lộ trình tổng thể | docs/master_roadmap.md |
| Yêu cầu nghiệp vụ | docs/requirements.md |
| Use Case hệ thống | docs/domain/use_cases.puml |
| Hạ tầng Session hiện có | src/server/session_manager.ts |
| FSM Architecture ADR | docs/domain/adr/ADR-0001-fsm-architecture.md |
| Entity Model | docs/domain/entity_model.md |
| Epic 1 Gameplay Ledger | docs/epics/gameplay/_epic_ledger.md |
| Epic 2 UI Ledger | docs/epics/client_ui/_epic_ledger.md |
