# [PLAN] IMP-201: Client Session Lifecycle Purge & Cross-Match State Isolation (v3 - Tiếp Thu Toàn Diện Phản Biện)

## 1. TỔNG QUAN & BỐI CẢNH (CONTEXT & ROOT CAUSE)

### Hiện tượng lỗi (Bug Description)
Khi người chơi đang chơi một ván cờ, chơi được vài vòng (đã có nhật ký hoạt động: xúc xắc, mua đất, nâng cấp, rút thẻ), sau đó bấm nút **"Thoát game"** (Leave Room) để trở về sảnh chờ, rồi bấm **"Tạo phòng mới"** và bắt đầu ván mới. Mở drawer "Nhật ký ván đấu" ra thì thấy các dòng sự kiện của ván cũ vẫn xuất hiện ở đầu danh sách.

### Phân tích nguyên nhân cốt lõi (Root Cause Analysis)
1. **Kiến trúc SPA Singleton**: VTCOON là ứng dụng Single Page Application (React 19 + Zustand). Các stores (`useActivityStore`, `useTelemetryStore`, `useGameStore`, `useVfxStore`) là các module-level singleton objects lưu trữ trong RAM của tab trình duyệt.
2. **Khiếm khuyết tại Egress (Thoát game)**: Khi người chơi nhấn nút "Thoát game", callback `handleLeaveRoom` trong `src/client/network/use_app_turn_controls.ts`:
   - Chỉ reset `useLobbyStore` (`resetLobby()`).
   - Chỉ reset 4 trường tạm thời của `useGameStore` (`activePawnAnimation`, `floatingTexts`, `playersInfo`, `playerPositions`).
   - **BỎ QUÊN**: Không gọi `useActivityStore.getState().clearLogs()`, không gọi `useTelemetryStore.getState().reset()`, không dọn `useVfxStore`, không reset `lastProcessedEventCardKey` và `lastAuctionBid` trong `activity_tracker.ts`!
3. **Hiện tượng Append (Nối đuôi) tại Ván Mới**:
   - Khi tạo ván mới, `trackDeltaActivities` gọi `store.addActivityLog(entry)` $\rightarrow$ `[...state.activityLogs, entry]`.
   - **Hậu quả trực tiếp**: Log ván mới bị nối đuôi vào sau danh sách log của ván cũ còn sót lại trong RAM!
4. **Điểm mù Stale Event Card, Auction & Filter State**:
   - `activity_tracker.ts` lưu `lastProcessedEventCardKey` và `lastAuctionBid`. Ván mới nếu trùng thẻ sự kiện sẽ bị nuốt log do tưởng duplicate.
   - `activity_store.ts#clearLogs()` bỏ quên `activeFilter` và `isActivityFeedOpen`. Ván 1 lọc `'property'`, ván 2 vẫn kẹt ở `'property'`, che khuất log ván mới.
5. **Thực tế Runtime của Genesis Tick**:
   - `delta_broadcaster.ts#L141` tăng `getNextTick = 0 + 1 = 1`. Do đó delta full-sync ban đầu do server phát ra có `tick = 1` (không phải 0). Điều kiện Genesis Sync là `delta.tick <= 1`.
6. **Bảo toàn Log Cuối Ván (Giải quyết Q1)**:
   - Không inject purge vào `syncGameStarted`. Người chơi ở màn hình kết thúc ván vẫn đọc được toàn bộ nhật ký ván đấu. Nhật ký chỉ bị xóa khi người chơi thực sự thoát phòng, tạo/vào phòng mới, hoặc bắt đầu ván mới (`delta.tick <= 1`).

---

## 2. TAM TẦNG PHÒNG VỆ (DEFENSE-IN-DEPTH ARCHITECTURE)

```
[Người chơi bấm "Thoát game"]
         │
         ▼
[TẦNG 1: Egress Teardown] ──> resetLobby()
         │                    ├── set({ gameStarted: false, roomCode: null, ... }) [TRƯỚC]
         │                    └── purgeClientMatchSession({ clearGameStore: true }) [SAU]
         │                        ├── useActivityStore.getState().clearLogs() (kèm reset filter & feed)
         │                        ├── resetEventCardActivityTracker()
         │                        ├── resetAuctionActivityTracker()
         │                        ├── useTelemetryStore.getState().reset()
         │                        ├── useVfxStore: clearAllSlams() & clearScreenShake() & reactions
         │                        └── useGameStore.getState().resetGameState() & closeModal()
         │
[Người chơi tạo / vào phòng mới / bấm Bắt đầu ván]
         │
         ▼
[TẦNG 2: Ingress Pre-Purge] ──> lobby_store (createCustomRoom, joinCustomRoom, startGame)
         │                      └── Chủ động gọi purgeClientMatchSession({ clearGameStore: true })
         │
[Server gửi Full-Sync Delta]
         │
         ▼
[TẦNG 3: Genesis Sync vs Reconnect Protection]
         ├── Nếu isFullSync && delta.tick <= 1:
         │   └── purgeClientMatchSession({ clearGameStore: false }) (Xóa tàn dư log, bảo vệ state vừa sync)
         └── Nếu isFullSync && delta.tick > 1 (RECONNECT GUARD):
             └── TUYỆT ĐỐI KHÔNG XÓA LOG! Bảo tồn 100% nhật ký cho người chơi kết nối lại giữa ván!
```

---

## 3. ĐO ĐẠC ĐĨA VẬT LÝ & NGÂN SÁCH LOC (LOC BUDGET SSOT)

| File | Vai Trò | Phân Hạng Tier | Baseline Hiện Tại | Dự Kiến Delta | LOC Sau Thay Đổi | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/network/client_session_purger.ts` | Deep Module: Purge SSOT | Tier 1 (Domain/Network) | 0 | +33 | 33 | <= 400 | Hợp lệ |
| `src/client/store/activity_store.ts` | Activity Store (Reset Filter) | Tier 1 (Store) | 131 | 0 (inline edit) | 131 | <= 300 | Hợp lệ |
| `src/client/network/use_app_turn_controls.ts` | Egress Hook: handleLeaveRoom | Tier 1 (Network) | 132 | -8 | 124 | <= 400 | Hợp lệ |
| `src/client/store/lobby_store.ts` | Lobby State & Ingress Purge | Tier 1 (Store) | 273 | +6 | 279 | <= 300 | Hợp lệ |
| `src/client/network/apply_delta.ts` | Genesis Sync Boundary & Guard | Tier 1 (Network) | 287 | +2 | 289 | <= 300 | Hợp lệ |
| `src/client/network/activity_tracker.ts` | Activity Event Tracker | Tier 1 (Network) | 324 | 0 | 324 | <= 400 | Hợp lệ |
| `tests/contracts/imp201_client_session_lifecycle_purge.test.ts` | Living Contract Test Suite | Test Suite | 0 | +240 | 240 | <= 300 | Hợp lệ |

---

## 4. CHI TIẾT TRIỂN KHAI TỪNG FILE (DROP-IN CODE SPECIFICATIONS)

### Task 1: Tạo Deep Module `src/client/network/client_session_purger.ts`
Cung cấp interface duy nhất để dọn sạch toàn bộ trạng thái ván đấu của client.
**Sửa F1 (Import path)**: `../telemetry/telemetry_store.js`.
**Sửa F3 (Auction Tracker)**: Gọi thêm `resetAuctionActivityTracker()`.

```ts
// src/client/network/client_session_purger.ts
// [IMP-201/MSS] Client Session Lifecycle Purge & Cross-Match State Isolation
import { useActivityStore } from '../store/activity_store.js';
import { useTelemetryStore } from '../telemetry/telemetry_store.js';
import { useGameStore } from '../store/game_store.js';
import { useVfxStore } from '../store/vfx_store.js';
import { resetEventCardActivityTracker, resetAuctionActivityTracker } from './activity_tracker.js';

export interface PurgeSessionOptions {
  /**
   * Có reset useGameStore về INITIAL_GAME_STATE hay không.
   * Mặc định: true (khi rời phòng hoặc reset sảnh).
   * false khi full-sync tick <= 1 đang nạp dữ liệu bàn cờ mới vào useGameStore.
   */
  readonly clearGameStore?: boolean;
}

/**
 * Xóa sạch toàn bộ trạng thái, logs, telemetry, và VFX của ván chơi cũ.
 * Ngăn chặn hiện tượng rò rỉ hoặc append nhật ký ván cũ sang ván mới.
 */
export function purgeClientMatchSession(options: PurgeSessionOptions = { clearGameStore: true }): void {
  // 1. Dọn dẹp nhật ký hoạt động, sequence xúc xắc/đấu giá, reset bộ lọc về 'all' và đóng feed
  useActivityStore.getState().clearLogs();

  // 2. Reset deduplication key của thẻ cơ hội / sự kiện thị trường và phiên đấu giá
  resetEventCardActivityTracker();
  resetAuctionActivityTracker();

  // 3. Reset flight recorder, audit logs, violations trong telemetry
  useTelemetryStore.getState().reset();

  // 4. Xóa sạch hiệu ứng rung lắc camera và nện búa VFX còn dang dở
  useVfxStore.getState().clearAllSlams();
  useVfxStore.getState().clearScreenShake();
  useVfxStore.setState({ activePawnReactions: {} });

  // 5. Reset toàn bộ GameStore (modal, BĐS, người chơi, xúc xắc, turn) nếu được yêu cầu
  if (options.clearGameStore) {
    useGameStore.getState().resetGameState();
    useGameStore.getState().closeModal();
  }
}
```

### Task 2: Cập nhật `src/client/store/activity_store.ts` (Reset Filter & Feed State)
Cập nhật `clearLogs` tại L118-L120:

```ts
  clearLogs: () => {
    set({
      activityLogs: [],
      unreadCount: 0,
      activeFilter: 'all',
      isActivityFeedOpen: false,
      lastDiceSeq: undefined,
      lastAuctionBid: undefined,
    });
  },
```

### Task 3: Cập nhật `src/client/network/use_app_turn_controls.ts` (Egress Teardown)
**Sửa F2 (Triệt tiêu hoàn toàn Double-Purge)**:
Xóa bỏ hoàn toàn cả `closeModal()` và `useGameStore.setState(...)` lẻ tẻ ở L112-L118.
Ủy quyền 100% cho `useLobbyStore.getState().resetLobby()` thực hiện dọn dẹp.

```ts
// File: src/client/network/use_app_turn_controls.ts
// Trong handleLeaveRoom (thay thế L112-L118):
    if (typeof window !== 'undefined' && window.history) {
      try {
        window.history.replaceState({}, '', window.location.pathname);
      } catch {
        /* safe-ignore: browser environment may restrict history manipulation */
      }
    }

    useLobbyStore.getState().resetLobby();
```

### Task 4: Cập nhật `src/client/store/lobby_store.ts` (Ingress Pre-Purge & Order of Operations)
1. Trong `resetLobby()`: Đặt `set({ gameStarted: false, ... })` **TRƯỚC**, sau đó mới gọi `purgeClientMatchSession({ clearGameStore: true })`.
2. Trong `createCustomRoom()`, `joinCustomRoom()`, và `startGame()`: Chủ động gọi purge trước khi bắt đầu.

```ts
// File: src/client/store/lobby_store.ts
// Import:
import { purgeClientMatchSession } from '../network/client_session_purger.js';

// Trong startGame (L189-L194):
  startGame: () => {
    const check = get().canStartGame();
    if (!check.canStart) return { success: false, reasonCode: check.reasonCode };
    purgeClientMatchSession({ clearGameStore: true });
    set({ gameStarted: true });
    return { success: true };
  },

// Trong resetLobby (L197-L198):
  resetLobby: () => {
    set({ roomCode: null, isJoining: false, myPlayerId: '', isHost: false, isReady: false, gameStarted: false, slots: createDefaultSlots(), errorReason: null });
    purgeClientMatchSession({ clearGameStore: true });
  },

// Trong createCustomRoom (L230):
  createCustomRoom: (isBotSolo?: boolean) => {
    purgeClientMatchSession({ clearGameStore: true });
    const cfg = createNewRoomConfig(true);
    // ...
  },

// Trong joinCustomRoom (L241):
  joinCustomRoom: (code: string) => {
    // ...
    purgeClientMatchSession({ clearGameStore: true });
    get().initLobby(cleanCode, 'p2', false);
    // ...
  },
```

### Task 5: Cập nhật `src/client/network/apply_delta.ts` (Genesis Sync Boundary & Reconnect Guard)
Tại L260 trong `applyDeltaToStore`:
Không can thiệp vào `syncGameStarted` (bảo toàn 100% logs cuối ván, loại bỏ hoàn toàn race condition Q1).

```ts
// File: src/client/network/apply_delta.ts
// Import (L14):
import { purgeClientMatchSession } from './client_session_purger.js';

// Trong applyDeltaToStore (L260):
  const isFullSync = Boolean(delta.cells && delta.cells.length === BOARD_SIZE);
  if (isFullSync) {
    state.clearActivePawnAnimation();
    state.setIsRolling(false);
    if (delta.diceSeq !== undefined) state.setLastDiceSeq(delta.diceSeq);
    if (delta.dice && delta.dice[0] > 0 && delta.dice[1] > 0) {
      state.setDice([delta.dice[0], delta.dice[1]]);
    }
    state.setHasRolledThisTurn(false);
    state.setDismissedAuctionCellIndex?.(null);
    if (delta.tick <= 1) purgeClientMatchSession({ clearGameStore: false });
  }
```

---

## 5. MA TRẬN TEST HỢP ĐỒNG 5 MẶT (UNIVERSAL 5-FACET CONTRACT MATRIX)

File: `tests/contracts/imp201_client_session_lifecycle_purge.test.ts` (Tối thiểu 18 atomic tests)

### Facet 1: Egress Teardown Isolation
- **[TC-201.01/MSS]** `purgeClientMatchSession()` xóa sạch mảng `activityLogs` (`[]`) và đưa `unreadCount` về 0.
- **[TC-201.02/MSS]** `purgeClientMatchSession()` reset `activeFilter` về `'all'` và đóng feed (`isActivityFeedOpen === false`).
- **[TC-201.03/MSS]** `purgeClientMatchSession()` xóa `lastDiceSeq` và `lastAuctionBid` trong `activityStore`.
- **[TC-201.04/MSS]** `purgeClientMatchSession()` reset `telemetryStore` (auditLogs, recordedIntents, violations về rỗng).
- **[TC-201.05/MSS]** `purgeClientMatchSession({ clearGameStore: true })` đưa `useGameStore` về `INITIAL_GAME_STATE` (đóng modal, xóa playersInfo, playerPositions, levelMap).
- **[TC-201.06/MSS]** `purgeClientMatchSession({ clearGameStore: false })` giữ nguyên dữ liệu trong `useGameStore` (phục vụ Genesis sync).
- **[TC-201.07/MSS]** `purgeClientMatchSession()` dọn sạch `activeSlams` và `activeScreenShake` trong `useVfxStore`.
- **[TC-201.08/MSS]** `purgeClientMatchSession()` gọi cả `resetEventCardActivityTracker()` và `resetAuctionActivityTracker()`, cho phép nhận lại event card và đấu giá ở ván mới.

### Facet 2: HandleLeaveRoom & Store Order E2E Execution
- **[TC-201.09/MSS]** `handleLeaveRoom` kích hoạt `resetLobby()`, chuyển `gameStarted: false` trước khi purge `gameStore`.
- **[TC-201.10/MSS]** `handleLeaveRoom` dọn dẹp sạch `activityLogs` và đóng toàn bộ modal đang mở mà không gọi đúp purge.
- **[TC-201.11/MSS]** `handleLeaveRoom` xóa reconnect token của roomCode.

### Facet 3: Lobby Ingress Pre-Purge
- **[TC-201.12/MSS]** `useLobbyStore.getState().resetLobby()` gọi `purgeClientMatchSession`, cô lập hoàn toàn trạng thái giữa 2 ván.
- **[TC-201.13/MSS]** `createCustomRoom()` chủ động purge `activityLogs` và `telemetryStore` trước khi khởi tạo phòng mới.
- **[TC-201.14/MSS]** `joinCustomRoom()` chủ động purge `activityLogs` và `telemetryStore` trước khi tham gia phòng mới.
- **[TC-201.15/MSS]** `startGame()` chủ động purge state cũ trước khi set `gameStarted: true` (hỗ trợ chế độ Solo Bot / Offline).

### Facet 4: Genesis Sync vs Reconnect Protection
- **[TC-201.16/MSS]** `applyDelta` với `isFullSync` và `delta.tick <= 1` (cả tick 0 và tick 1 Genesis) dọn sạch logs cũ còn sót từ trước khi ván cờ bắt đầu.
- **[TC-201.17/MSS]** (Reconnect Guard) `applyDelta` với `isFullSync` và `delta.tick > 1` (ví dụ `tick: 15`) BẢO TOÀN `activityLogs` hiện tại, không xóa mất lịch sử của người chơi bị rớt mạng kết nối lại.
- **[TC-201.18/MSS]** Khi kết thúc ván (`roomStarted` không đổi), `syncTelemetryAndActivities` vẫn trích xuất đầy đủ log kết thúc mà không bị xóa trước bởi purge.

### Facet 5: Cross-Match Event Processing & Anti-Stale Invariant
- **[TC-201.19/MSS]** Ván 1 ghi nhận thẻ cơ hội X -> Thoát ván -> Ván 2 rút lại đúng thẻ X -> `trackDeltaActivities` ghi nhận bình thường, không bị nuốt log do stale event card key.
- **[TC-201.20/MSS]** Ván 1 ghi nhận xúc xắc seq=10 -> Thoát ván -> Ván 2 tung xúc xắc seq=1 -> `trackDeltaActivities` không bị lọc bỏ do sequence cũ.

---

## 6. ĐÁNH GIÁ BÁN KÍNH ẢNH HƯỞNG (3-WAY BLAST RADIUS AUDIT)

1. **Downstream Consumers (Gọi hàm / Đăng ký UI)**:
   - UI Drawer "Nhật Ký Ván Đấu" (`useActivityStore((s) => s.activityLogs)`): Nhận mảng rỗng `[]` khi rời phòng hoặc bắt đầu ván mới. Không còn hiện tượng lẫn lộn log giữa 2 ván.
   - Drawer số chưa đọc (`unreadCount`): Reset về 0, không hiển thị chấm đỏ sai lệch sau khi tạo game mới.
   - Filter Tab: Reset về `'all'`, không bị kẹt ở tab lọc của ván trước.
   - Telemetry HUD: Khởi động lại đồ thị sạch từ tick 1.
2. **Upstream Environmental Modifiers**:
   - Reconnect Network Lifecycle: `delta.tick > 1` được bảo vệ tuyệt đối bởi Reconnect Guard (`delta.tick <= 1` mới purge). Không làm mất log khi mạng giật hoặc reconnect.
3. **Exceptional Lifecycle Modes**:
   - Thoát game cưỡng bức (Host giải tán phòng): Client tự động dọn sạch state và quay về sảnh nguyên bản.
   - Rời phòng khi đang có modal mở: Modal được đóng tự động, không để lại zombie UI.

---

## 7. QUY TRÌNH 3 TRẠM (STATION PIPELINE EXECUTION PLAN)

- **Station 1 (RED Contract Test)**: `qa-tester` viết 20 atomic tests trong `tests/contracts/imp201_client_session_lifecycle_purge.test.ts` và chứng minh thất bại (lỗi rò rỉ log khi thoát phòng).
- **Station 2 (GREEN Implementation)**: `implementer` tạo `client_session_purger.ts` và gắn vào `use_app_turn_controls.ts`, `lobby_store.ts`, `apply_delta.ts`, `activity_store.ts` để 100% tests PASS.
- **Station 2.5 (Sweeping Scout Audit)**: `scout` quét 5 archetypes khuyết tật trên các files vật lý được chỉnh sửa.
- **Station 3 (Independent Review)**: `spec-reviewer` và `code-reviewer` đối chiếu đặc tả và nghiệm thu.
