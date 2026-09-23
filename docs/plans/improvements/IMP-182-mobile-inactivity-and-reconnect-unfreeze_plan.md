# [IMP-182] Mobile Tab Inactivity / Background Resilience, Reconnect Unfreeze & Full-Sync Telemetry Calibration (Plan)

> Ticket: IMP-182  
> Trạng Thái: Đã Tinh Chỉnh Theo Phản Biện Plan-Griller (Ready for Execution)  
> Ngày: 2026-09-23  

---

## 1. Vấn Đề Người Dùng Báo Cáo

1. **Phản ánh hành vi thiết bị di động**:
   *"Review game này, ngoài các lỗi thì tôi có afk trên điện thoại vài phút sau đó quay lại bị kẹt không bấm gì được. Ngoài ra có vẻ web trên điện thoại nếu quay ra tab khác hoặc inactive bị treo ứng dụng thì phải"*
2. **Ảnh chụp màn hình vi phạm Telemetry (`media_1790153908284.png`)**:
   Phát hiện 5 vi phạm Invariant nghiêm trọng trên thiết bị di động (Chrome Mobile, phòng `VTM1RJ`):
   - Tick 159: `TREASURY_INVARIANT_VIOLATED` (sai lệch -1.550 Tr., kỳ vọng -3.000 Tr.)
   - Tick 226: `TREASURY_INVARIANT_VIOLATED` (sai lệch 1.540 Tr., kỳ vọng 2.000 Tr.)
   - Tick 243: `INVALID_POSITION_STEP` (quân cờ nhảy ô từ 17 tới 24 không có xúc xắc)
   - Tick 243: `TREASURY_INVARIANT_VIOLATED` (sai lệch 265 Tr., kỳ vọng 550 Tr.)
   - Tick 247: `TREASURY_INVARIANT_VIOLATED` (sai lệch -1.008 Tr., kỳ vọng -1.260 Tr.)

---

## 2. Nguyên Nhân Gốc Rễ & Điểm Mù Kỹ Thuật (RCA & Plan-Griller Findings)

1. **Khuyết tật vòng đời khi tab di động bị ẩn/ngủ (`use_game_ws.ts`)**:
   - Thiếu vắng bộ lắng nghe `visibilitychange`, `pageshow`, `focus`.
   - Hàm `connect()` chỉ kiểm tra `readyState === 1`, bỏ qua `readyState === 0` (`CONNECTING`). Khi người dùng mở khóa máy, bão sự kiện `visibilitychange` + `focus` + `pageshow` diễn ra trong $\le 5$ms gây ra tình trạng tạo nhiều socket song song, xung đột `bindSocket` trên server.
   - Khi điện thoại ngủ 2-5 phút, socket có thể bị router/NAT/Render.com ngắt ngầm (zombie half-open socket). Trình duyệt vẫn báo `readyState === 1`, gửi `requestResync()` nhưng gói tin bị treo vĩnh viễn trong TCP buffer cục bộ mà không có timeout phục hồi.
2. **Đình trệ hoạt ảnh & xung đột ghi đè Full Sync (`apply_delta.ts`)**:
   - Khi tab ẩn, Three.js `useFrame` dừng lại, `setTimeout` bị hoãn, cờ `isRolling`, `activePawnAnimation`, `pawnAnimationQueue` bị treo vô hạn trong store khiến ActionDock bị khóa toàn bộ nút bấm.
   - Khi nhận Full Sync, `apply_delta.ts` hiện tại chỉ dọn dẹp nếu `state.activePawnAnimation` khác null, bỏ sót queue và `isRolling`.
   - **Đặc biệt (Plan-Griller P1)**: Sau khối unfreeze, `apply_delta.ts` tiếp tục gọi `syncDiceRoll(delta, state)`. Nếu delta mang xúc xắc tĩnh, `syncDiceRoll` kích hoạt `triggerDiceRoll`, lập tức đặt lại `isRolling: true` và phát âm thanh xúc xắc ảo, vô hiệu hóa hoàn toàn lệnh unfreeze trước đó!
3. **Rò rỉ cờ `hasRolledThisTurn` qua lượt mới (Turn N+1 Leak - Plan-Griller P1)**:
   - Dòng 61 của `apply_delta.ts` chỉ reset `hasRolledThisTurn = false` khi `delta.turnPhase === TurnPhase.WaitingRoll`.
   - Nếu client thức dậy khi bot đang ở `ActionPhase` hoặc `PropertyManagement`, cờ này không được xóa. Đến khi lượt chuyển về người chơi, `hasRolledThisTurn: true` làm nút Đổ Xúc Xắc bị vô hiệu hóa (`isRollDisabled = true`), ép người chơi phải bấm "Kết Thúc Lượt" oan uổng!
4. **Tràn bố cục ActionDock trên màn hình 360px (Plan-Griller P2)**:
   - Tổng chiều rộng các nút (150px Đổ + 125px Mua đất + 176px 4 nút phụ + padding) lên tới 420-545px. Container thiếu `overflow-x-auto` đẩy nút "Kết Thúc Lượt" tràn ra khỏi màn hình điện thoại.
5. **Báo động giả Telemetry Invariant (Ticks 159, 226, 243, 247)**:
   - Tick 159 & 243: Full Sync 40 ô đất sau khi reconnect không được đưa vào `isInitialSetupOrCalibration`, và `detectMovement` tính bước nhảy sai lệch.
   - Tick 226: `isUnmodeledEvent` trả về `expected = 2000` (từ GO) dù xảy ra biến cố vỡ nợ chưa mô hình hóa vì `hasKnown === true`.
   - Tick 247: `computeCellDelta` không áp dụng giảm giá 20% của thẻ thị trường `MC_CREDIT_STIMULUS` khi nâng cấp ô đất.
   - `telemetry_delta_hook.ts` hiện là 402 LOC (vượt trần 400 LOC). Cần tái cấu trúc hoisting Set để đưa về < 385 LOC.

---

## 3. Pre-Flight Blast Radius Audit

| Khía Cạnh | Đánh Giá |
| :--- | :--- |
| **Cấp Độ Rủi Ro** | **Slice-Bound** (Client Network, Zustad Store, ActionDock UI, Telemetry Hook). Zero FSM / Server Database schema changes. |
| **Tập Tin Chạm Trực Tiếp** | `src/client/network/use_game_ws.ts`, `src/client/network/apply_delta.ts`, `src/client/telemetry/telemetry_delta_hook.ts`, `src/client/ui/action_dock.tsx` |
| **Downstream Consumers** | `ActionDock` (nút điều khiển lượt), `PawnAnimator` (quân cờ 3D), `TelemetryStore` (ghi nhận vi phạm). |
| **Phòng Thủ Tình Huống Xấu Nhất** | Kiểm thử hợp đồng với giả lập `document.visibilityState = 'hidden'` -> `'visible'`, socket half-open drop, 305/305 test suite hiện tại tiếp tục xanh 100%. |

---

## 4. Kiến Trúc Kỹ Thuật Đã Tinh Chỉnh (4 Trụ Cột Hoàn Thiện)

```
[Mobile Browser: Tab Inactive / Phone Locked]
          │
          ▼ (visibilityState -> 'visible' / focus / pageshow)
[Debounced Wake-Up Handler 200ms (use_game_ws.ts)]
          │
          ├── 1. Store Unfreeze: clearActivePawnAnimation() + setIsRolling(false)
          ├── 2. ActionDock State Reset: setIsRollPending(false)
          └── 3. Socket Health Probe:
                  ├── If readyState === 0 || readyState === 1 ──► Bỏ qua connect() trùng lặp
                  ├── If readyState !== 1 && readyState !== 0 ──► connect() ngay lập tức
                  └── If readyState === 1 ──► requestResync() + Resync Watchdog (2.5s)
                                                        │
                                                        ▼
                                          [Server: Resync Full Delta (40 cells)]
                                                        │
                                                        ▼
                                    [Client: applyDeltaToStore (apply_delta.ts)]
                                          ├── Unconditional Animation/Queue/Rolling Teardown
                                          ├── BỎ QUA syncDiceRoll khi isFullSync (Chỉ nạp static dice)
                                          ├── Reset hasRolledThisTurn = false khi đổi turnPlayerId hoặc isFullSync
                                          └── Force Visual Positions to Snapshot
                                                        │
                                                        ▼
                                    [ActionDock: action_dock.tsx]
                                          ├── max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar
                                          ├── Responsive Roll Button Label (🎲 Đổ trên < 380px)
                                          └── Reset isRollPending khi visible hoặc WaitingRoll
                                                        │
                                                        ▼
                                    [Telemetry Hook: telemetry_delta_hook.ts]
                                          ├── Hoist MOVEMENT_PHASES & CHANCE_MARKET_CELLS (< 385 LOC)
                                          ├── isFullSync === true ──► Movement = undefined & Baseline Calibration
                                          ├── isUnmodeledEvent === true ──► return null (Fix Tick 226)
                                          └── MC_CREDIT_STIMULUS ──► Upgrade cost * 0.8 (Fix Tick 247)
```

### Trụ Cột 1: Vòng Đời Hiển Thị, Khử Rung & Watchdog Zombie Socket (`use_game_ws.ts`)
1. **Chặn `readyState === 0` trong `connect()`**:
   ```ts
   if (wsRef.current && (wsRef.current.readyState === 0 || wsRef.current.readyState === 1)) return;
   ```
2. **Khử rung 200ms và Resync Watchdog**:
   ```ts
   const resyncWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const wakeupDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const handleWakeup = useCallback(() => {
     if (typeof document === 'undefined' || document.visibilityState !== 'visible') return;
     if (wakeupDebounceTimerRef.current) clearTimeout(wakeupDebounceTimerRef.current);
     wakeupDebounceTimerRef.current = setTimeout(() => {
       const store = useGameStore.getState();
       store.clearActivePawnAnimation();
       store.setIsRolling(false);

       if (!wsRef.current || (wsRef.current.readyState !== 0 && wsRef.current.readyState !== 1)) {
         connect();
       } else if (wsRef.current.readyState === 1) {
         requestResync();
         // Watchdog: Nếu sau 2.5s không nhận được delta phản hồi, kết nối là zombie -> cưỡng chế reconnect
         if (resyncWatchdogRef.current) clearTimeout(resyncWatchdogRef.current);
         resyncWatchdogRef.current = setTimeout(() => {
           if (wsRef.current) {
             try { wsRef.current.close(); } catch { /* ignore */ }
             wsRef.current = null;
             setIsConnected(false);
             connect();
           }
         }, 2500);
       }
     }, 200);
   }, [connect, requestResync]);
   ```
3. Trong `socket.onmessage`: Xóa `resyncWatchdogRef.current` ngay khi nhận được bất kỳ message hợp lệ nào từ server.

### Trụ Cột 2: Dọn Dẹp Tuyệt Đối & Ngắt `syncDiceRoll` Khi Full Sync (`apply_delta.ts`)
1. **Dọn dẹp vô điều kiện & đồng bộ xúc xắc tĩnh**:
   ```ts
   const isFullSync = Boolean(delta.cells && delta.cells.length === BOARD_SIZE);
   if (isFullSync) {
     state.clearActivePawnAnimation();
     state.setIsRolling(false);
     if (delta.diceSeq !== undefined) state.setLastDiceSeq(delta.diceSeq);
     if (delta.dice && delta.dice[0] > 0 && delta.dice[1] > 0) {
       state.setDice([delta.dice[0], delta.dice[1]]);
     }
     state.setHasRolledThisTurn(false);
   } else {
     syncDiceRoll(delta, state);
   }
   ```
2. **Triệt tiêu Turn N+1 State Leak trong `syncTurnAndTimer`**:
   ```ts
   const turnPlayerId = resolveTurnPlayerId(delta);
   if (turnPlayerId && state.currentTurnPlayerId !== turnPlayerId) {
     state.setCurrentTurnPlayerId(turnPlayerId);
     state.setTurnTimeRemaining(delta.timeRemaining ?? 60);
     state.setHasRolledThisTurn(false); // [IMP-182] Reset khi chuyển người chơi
   }
   ```

### Trụ Cột 3: Ngân Sách Bố Cục 360px & ActionDock Unfreeze (`action_dock.tsx`)
1. Thêm `max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar` vào `<nav>`:
   Bảo đảm trên màn hình 360px, người chơi có thể cuộn nhẹ ngang hoặc các nút co giãn hợp lý, không đẩy nút "Kết Thúc Lượt" văng khỏi viewport.
2. Nút Đổ Xúc Xắc: Co giãn responsive nhãn trên màn hình siêu hẹp (`< 380px`: hiển thị `🎲 Đổ`, $\ge 380$px: hiển thị `🎲 Đổ Xúc Xắc`).
3. Reset `isRollPending = false` khi `visibilitychange` sang `visible` hoặc khi `turnPhase === TurnPhase.WaitingRoll`.

### Trụ Cột 4: Hiệu Chuẩn Hook Telemetry Invariant & Tinh Gọn LOC (`telemetry_delta_hook.ts`)
1. **Trích xuất hằng số ra module scope**:
   - `const MOVEMENT_PHASES = new Set<TurnPhase>([TurnPhase.WaitingRoll, TurnPhase.ActionPhase, TurnPhase.PropertyManagement, TurnPhase.HosePhase, TurnPhase.AuctionPhase, TurnPhase.InsolvencyPhase]);`
   - `const CHANCE_MARKET_CELLS = new Set<number>([2, 7, 17, 22, 33, 36]);`
   - Thay thế các đoạn so sánh 6 điều kiện lặp lại trong `checkIsTeleport` và `detectMovement`, giảm 15 LOC.
2. **Hiệu chuẩn Full Sync**:
   - Gắn `isFullSync` vào `isInitialSetupOrCalibration`.
   - Đặt `movement = delta.roomStarted === false || isFullSync ? undefined : detectMovement(...)`.
3. **Vá lỗi `isUnmodeledEvent` (Tick 226)**:
   - Dòng 303: `if (isUnmodeledEvent(delta, preState)) return null;`
4. **Hỗ trợ chiết khấu 20% của `MC_CREDIT_STIMULUS` (Tick 247)**:
   - Đọc `activeModifiers` từ `delta.activeModifiers ?? preState.activeModifiers` và tính `Math.floor(rawCost * 0.8)` khi nâng cấp ô đất.
5. Duy trì file `telemetry_delta_hook.ts` ở mức **375-385 LOC** (hoàn toàn dưới trần 400 LOC).

---

## 5. Quy Trình 3 Trạm Triển Khai (Tier 2 Execution Pipeline)

### Trạm 1: RED Contract Tests (`tests/client/imp182_mobile_inactivity_and_reconnect_unfreeze.test.ts`)
- Người thực hiện: `qa-tester` (Chỉ tạo test trong `tests/**`, nghiêm cấm sửa `src/**`).
- Bao phủ tối thiểu 15 atomic test:
  1. Boundary: Full sync (40 ô) vs Partial sync (< 40 ô).
  2. Reactivity: Sự kiện `visibilitychange` từ `'hidden'` sang `'visible'` dọn dẹp sạch `isRolling`, `activePawnAnimation`, `pawnAnimationQueue`, `pendingPawnMove`.
  3. Concurrency / Debounce: Bão sự kiện `visibilitychange` + `focus` + `pageshow` chỉ gọi `connect()` 1 lần duy nhất; `connect()` bỏ qua khi `readyState === 0`.
  4. Watchdog: `requestResync` sau 2.5s không có delta phản hồi sẽ kích hoạt đóng socket và reconnect.
  5. State Isolation: Nhận Full Sync không kích hoạt `triggerDiceRoll` ảo; không bị kẹt `hasRolledThisTurn` ở lượt mới.
  6. Invariants Calibration:
     - `isUnmodeledEvent` trả về `null` ngay cả khi `hasKnown === true` (Tick 226).
     - Full Sync sau AFK không phát sinh `INVALID_POSITION_STEP` hay `TREASURY_INVARIANT_VIOLATED` (Ticks 159 & 243).
     - Nâng cấp ô đất trong điều kiện `MC_CREDIT_STIMULUS` áp dụng chiết khấu 80% (Tick 247).
  7. ActionDock: Nút Đổ Xúc Xắc có `disabled: false` khi nhận Full Sync ở pha `WaitingRoll`.

### Trạm 2: GREEN Implementation (`src/**`)
- Người thực hiện: `implementer`.
- Viết mã nguồn tối thiểu để pass 100% test của Trạm 1 mà không nới lỏng assertion.
- Kiểm soát dung lượng tệp (`telemetry_delta_hook.ts` < 385 LOC, `action_dock.tsx` < 400 LOC).

### Trạm 3: Independent Review & Physical Disk Verification
- Độc lập thẩm định bởi `spec-reviewer` và `code-reviewer`.
- Xác minh bằng mắt file vật lý trên đĩa (`view_file`, `list_dir`).
- Ghi nhận Gotcha #250 vào `docs/domain/gotchas.md`.
- Cập nhật `docs/master_roadmap.md` và sinh báo cáo `docs/reports/improvements/IMP-182-mobile-inactivity-and-reconnect-unfreeze_report.md`.
