# [REPORT] IMP-210: GameRoomSession Aggregate Root & RoomManager Structural Pruning

## 1. THÔNG TIN TỔNG QUAN
- **Mã Ticket**: IMP-210
- **Tiêu Đề**: GameRoomSession Aggregate Root & RoomManager Structural Pruning (Bước 2 của Chiến lược 2 Bước Tái Cấu Trúc `RoomManager`).
- **Phân Hạng**: **One-Way Door** / Full Architectural Rigor (Thiết kế DDD Aggregate Root gom toàn bộ 10 Map phân tán, đóng nợ kỹ thuật `DEBT-ROOM-MGR-01`).
- **Trạng Thái**: ✅ COMPLETE (HOÀN TẤT TRỌN VẸN QUY TRÌNH 3 TRẠM).
- **Cổng Độc Lập**:
  - `spec-reviewer`: **APPROVED** (100% spec parity, 20/20 test tags truy xuất nguồn gốc).
  - `code-reviewer`: **APPROVED** (0 Slop Red Flags, 0 dirty casts, Wire Gate 100%, ngân sách Tier 1 đạt 378 LOC).

---

## 2. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP KIẾN TRÚC

### 2.1. Hiện trạng 10 Map phân tán (Scattered State Antipattern)
Trước khi cải tiến, `RoomManager` duy trì 10 `Map<string, T>` phân tán cấp class (`rooms`, `registries`, `propertyStates`, `auctions`, `rolledThisTurn`, `activeTimersMap`, `lastActivity`, `botPersonalities`, `lastAuctionResults`).
Hậu quả nghiêm trọng:
1. **Thiếu tính nguyên tử khi giải phóng tài nguyên (Non-Atomic Lifecycle)**: Khi đóng phòng (`doCloseRoom`), hàm phải nhận đến 11 tham số và gọi `.delete(roomCode)` thủ công trên từng Map riêng rẽ. Nếu có một thuộc tính mới bị bỏ sót, phòng sẽ bị rò rỉ vĩnh viễn trong RAM (Memory Leak).
2. **Khâu vá bối cảnh liên tục (Context Stitching Overhead)**: Mỗi khi gọi `getContext(roomCode)` hoặc thực hiện hành động, `RoomManager` phải truy vấn đồng thời 4-5 Map khác nhau để ghép nối thành `RoomContext`.
3. **Quản lý khóa toàn cục tùy tiện (Global Prefix Scraping)**: `botPersonalities` lưu trữ key dạng `${roomCode}:${botId}` trên một Map toàn cục dùng chung cho cả server, buộc `doCloseRoom` phải duyệt qua toàn bộ keys bằng `startsWith(`${roomCode}:`)` để dọn rác.
4. **Vi phạm LOC Budget Tier 1**: File đạt 518 LOC (> 400 LOC Tier 1) vì phải duy trì hàng trăm dòng code boilerplate forward tham số.

### 2.2. Giải pháp kiến trúc hoàn chỉnh Bước 2

```
                       ┌───────────────────────────────┐
                       │      RoomManager (378 LOC)    │
                       │  sessions: Map<string, GRS>   │
                       └───────────────┬───────────────┘
                                       │
                         1-to-1 Aggregate Encapsulation
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │     GameRoomSession (GRS)     │
                       │───────────────────────────────│
                       │ - room: Room                  │
                       │ - registry: PropertyRegistry  │
                       │ - propertyStates: PropStateMap│
                       │ - auction / lastAuctionResult │ (Two-way sync to room)
                       │ - rolledThisTurn: boolean     │
                       │ - activeTimers: Set<Timeout>  │
                       │ - botPersonalities: BotMap    │
                       │ - lastActivity: number        │
                       │───────────────────────────────│
                       │ + toContext(): RoomContext    │
                       │ + destroy(): void             │
                       └───────────────────────────────┘
                                       ▲
                                       │ Map Protocol Parity
                                       │
                       ┌───────────────────────────────┐
                       │    session_proxy_facade.ts    │
                       │───────────────────────────────│
                       │ • createSessionFieldProxy()   │ (11/11 Map methods)
                       │ • createBotPersonalityFacade()│ (Prefix key unpacker)
                       └───────────────────────────────┘
```

1. **`GameRoomSession` Aggregate Root (`src/server/game_room_session.ts`)**:
   - Đóng gói toàn bộ 10 vi trạng thái phòng chơi vào một thực thể duy nhất.
   - Getter/setter cho `auction` và `lastAuctionResult` tự động đồng bộ hai chiều nguyên tử sang `room.currentAuction` và `room.lastAuctionResult`.
   - Cung cấp các methods: `toContext()`, `touchActivity()`, `registerTimer()`, `clearTimers()`, `destroy()`.
   - Phương thức `destroy()` dọn sạch toàn bộ Node timers (`clearTimeout`), xóa sạch các collections, và đặt `room.currentAuction = undefined`.
2. **`SessionFieldProxy` & `BotPersonalityMapFacade` (`src/server/session_proxy_facade.ts`)**:
   - Cung cấp cơ chế dynamic Map facade với đầy đủ 100% Map protocol parity (tất cả 11 methods: `[Symbol.iterator]`, `entries()`, `keys()`, `values()`, `size`, `forEach()`, `clear()`, `get()`, `set()`, `has()`, `delete()`).
   - Xử lý hai chiều (Two-Way Write-Through) đảm bảo các thao tác ghi qua facade phản ánh ngay lập tức vào `session`.
   - Phân định rõ ràng trường tùy chọn (`auction`, `lastAuctionResult`): chỉ tính `.size` và trả về `has = true` khi trường khác `undefined`.
   - Tự động bóc tách composite key `${roomCode}:${botId}` cho bot personalities.
3. **Tái Cấu Trúc Sâu `RoomManager` (`src/server/room_manager.ts`)**:
   - Khai tử hoàn toàn 10 Map cấp class, thay thế bằng một Map duy nhất: `private readonly sessions = new Map<string, GameRoomSession>()`.
   - Thu nhỏ kích thước từ 518 xuống **378 LOC** (đạt chuẩn Tier 1 <= 400 LOC), **chính thức xóa bỏ nợ kỹ thuật `DEBT-ROOM-MGR-01`**.
   - Cung cấp `getSession(roomCode)` hỗ trợ case-insensitive lookup (`vtd8j8` == `VTD8J8`).
   - Thứ tự Teardown bảo toàn: (1) `closeHooks` bọc trong `try...catch` (lỗi hook không chặn hủy session) -> (2) `pendingTradeManager.clearSession` -> (3) `session.destroy()` -> (4) `this.sessions.delete()`.
4. **Vòng Lặp Lượt Trực Tiếp (`src/server/room_manager_lifecycle.ts`)**:
   - Bổ sung `doCreateRoomSession` (trả về `GameRoomSession`).
   - Bổ sung `doHandleEndTurnSession` nhận trực tiếp `GameRoomSession`, sử dụng single-entry local maps truyền `session.rolledThisTurn`, triệt tiêu 100% proxy overhead trên đường dẫn nóng (hot path).
   - Bảo toàn 100% các hàm exported cũ làm adapter để bảo vệ các test suite độc lập.

---

## 3. FILE MUTATION & LOC COMPLIANCE (ĐĨA VẬT LÝ)

| File | Phân Loại Tier | LOC Trước | LOC Sau | Non-Empty SLOC | Trần Ngân Sách | Đánh Giá & Tuân Thủ |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `src/server/room_manager.ts` | Tier 1 (Domain/Server/Logic) | 518 | **378** | 336 | <= 400 | ✔️ **ĐẠT CHUẨN TIER 1** (Giảm 140 LOC, **ĐÓNG NỢ `DEBT-ROOM-MGR-01`**) |
| `src/server/game_room_session.ts` | Tier 1 (Domain/Server/Logic) | MỚI | **118** | 100 | <= 400 | ✔️ **ĐẠT CHUẨN TIER 1** (Aggregate Root thuần túy) |
| `src/server/session_proxy_facade.ts` | Tier 1 (Domain/Server/Logic) | MỚI | **288** | 248 | <= 400 | ✔️ **ĐẠT CHUẨN TIER 1** (11/11 Map protocol methods, native MapIterator delegates) |
| `src/server/room_manager_lifecycle.ts` | Tier 1 (Domain/Server/Logic) | 335 | **335** | 309 | <= 400 | ✔️ **ĐẠT CHUẨN TIER 1** (Thêm session handler, giữ adapter cũ) |

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (20 ATOMIC TESTS - 5 FACETS)

File: [`tests/contracts/imp210_game_room_session_aggregate_root.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp210_game_room_session_aggregate_root.test.ts)

| STT | Mã Test Case & Traceability | Facet Kiểm Thử | Trạng Thái |
| :---: | :--- | :--- | :---: |
| 1 | `[TC-IMP210.01/MSS][UC-GAME-029]` | Facet 1: Aggregate Root initialization with room & collections | ✅ PASS |
| 2 | `[TC-IMP210.02/MSS][UC-GAME-029]` | Facet 1: Case-insensitive lookup (`vtd8j8` == `VTD8J8`) | ✅ PASS |
| 3 | `[TC-IMP210.03/MSS][UC-GAME-029]` | Facet 1: `session.toContext()` mapping integrity | ✅ PASS |
| 4 | `[TC-IMP210.04/MSS][UC-GAME-029]` | Facet 1: Auction setter two-way sync to `room.currentAuction` | ✅ PASS |
| 5 | `[TC-IMP210.05/MSS][UC-GAME-029]` | Facet 2: Proxy `[Symbol.iterator]` iteration parity | ✅ PASS |
| 6 | `[TC-IMP210.06/MSS][UC-GAME-029]` | Facet 2: Proxy `.size`, `.entries()`, `.values()`, `.keys()` | ✅ PASS |
| 7 | `[TC-IMP210.07/MSS][UC-GAME-029]` | Facet 2: Proxy `.forEach()` full traversal parity | ✅ PASS |
| 8 | `[TC-IMP210.08/MSS][UC-GAME-029]` | Facet 2: Optional field `.size` excludes undefined | ✅ PASS |
| 9 | `[TC-IMP210.09/MSS][UC-GAME-029]` | Facet 3: Two-way write-through on nested collections | ✅ PASS |
| 10 | `[TC-IMP210.10/MSS][UC-GAME-029]` | Facet 3: `mgr.rolledThisTurn` facade mutation syncs to session | ✅ PASS |
| 11 | `[TC-IMP210.11/MSS][UC-GAME-029]` | Facet 3: Backward compatible aliases (`rooms` == `roomMap`) | ✅ PASS |
| 12 | `[TC-IMP210.12/MSS][UC-GAME-029]` | Facet 3: Proxy `.delete()` on sub-collections cleans state | ✅ PASS |
| 13 | `[TC-IMP210.13/MSS][UC-GAME-029]` | Facet 4: Bot facade unpacks composite keys `${roomCode}:${botId}` | ✅ PASS |
| 14 | `[TC-IMP210.14/MSS][UC-GAME-029]` | Facet 4: Bot facade `.set()` updates session personality map | ✅ PASS |
| 15 | `[TC-IMP210.15/MSS][UC-GAME-029]` | Facet 4: Bot facade `.size` counts total bots across sessions | ✅ PASS |
| 16 | `[TC-IMP210.16/MSS][UC-GAME-029]` | Facet 5: `closeRoom` executes `closeHooks` BEFORE session teardown | ✅ PASS |
| 17 | `[TC-IMP210.17/MSS][UC-GAME-029]` | Facet 5: `session.destroy()` cancels active timers & clears memory | ✅ PASS |
| 18 | `[TC-IMP210.18/MSS][UC-GAME-029]` | Facet 5: Session teardown leaves zero zombie references in RAM | ✅ PASS |
| 19 | `[TC-IMP210.19/MSS][UC-GAME-029]` | Facet 5: `doHandleEndTurnSession` advances turn & syncs atomically | ✅ PASS |
| 20 | `[TC-IMP210.20/MSS][UC-GAME-029]` | Facet 5: `closeRoom` error in hook does not block session destroy | ✅ PASS |

---

## 5. KẾT QUẢ KIỂM CHỨNG & BẰNG CHỨNG THỰC TẾ

1. **Biên dịch TypeScript (`npx tsc --noEmit`)**:
   - Thoát mã 0, **0 lỗi, 0 cảnh báo**.
   - Khắc phục triệt để 14 lỗi type parity trong `session_proxy_facade.ts`:
     * 10 lỗi `MapIterator` mismatch: chuyển các phương thức `entries()`, `keys()`, `values()`, `[Symbol.iterator]()` sang ủy quyền MapIterator gốc tuân thủ TypeScript $\ge 5.6$.
     * 1 lỗi `Reflect.get`: bổ sung cast tường minh `as T | undefined`.
     * 2 lỗi `clear()`: bổ sung type guard `isClearable(val)` loại bỏ hoàn toàn double dirty casts.
2. **Kiểm thử hợp đồng IMP-210 (`tests/contracts/imp210_...test.ts`)**:
   - **20/20 atomic tests PASS 100%** (10ms).
3. **Kiểm thử hợp đồng tiền nhiệm IMP-205 (`tests/contracts/imp205_...test.ts`)**:
   - **19/19 atomic tests PASS 100%**.
4. **Kiểm thử hồi quy toàn bộ Server (`npx vitest run tests/server/`)**:
   - **52/52 test files (676 tests) PASS 100%**.
5. **Đo lường ngân sách LOC (`npm run check:loc`)**:
   - `src/server/room_manager.ts`: 378 LOC (<= 400 LOC Tier 1).
   - `src/server/game_room_session.ts`: 118 LOC (<= 400 LOC Tier 1).
   - `src/server/session_proxy_facade.ts`: 288 LOC (<= 400 LOC Tier 1).
   - `src/server/room_manager_lifecycle.ts`: 335 LOC (<= 400 LOC Tier 1).
6. **Bằng chứng kỹ thuật**:
   - Evidence Snapshot: [`.agents/evidence/imp210_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp210_snapshot.json) (`executed: true`).
7. **Kế hoạch đã ban hành**:
   - [`docs/plans/improvements/IMP-210-game-room-session-aggregate-root_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-210-game-room-session-aggregate-root_plan.md).
