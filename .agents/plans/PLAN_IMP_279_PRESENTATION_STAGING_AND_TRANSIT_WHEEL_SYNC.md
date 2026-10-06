# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-279 — Đồng Bộ Hoạt Cảnh Quân Cờ & Vòng Xoay Hành Trình (Presentation Staging & Transit Wheel Sync)

> **Mã Nhiệm Vụ:** IMP-279 (Client Presentation Staging & Transit Wheel Decoupling Guard)  
> **Phân hệ mục tiêu:** `client-state`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, <= 220 lines, 3 files in `src/**`, 1 subsystem)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 10 atomic tests, >= 14 mutants killed, Pure Logic Waiver = `false` (Có tương tác luồng DOM/Modal và hoạt cảnh xúc xắc)

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/network/apply_delta.ts` (347 lines, Tier 1 limit: 400 lines) — **Warning**.
* **Target physical file**: `src/client/network/use_app_session.ts` (272 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `src/client/store/game_store.ts` (377 lines, Tier 1 limit: 400 lines) — **Warning**.
* **Target physical file**: `tests/contracts/imp279_presentation_staging_and_transit_wheel_sync.test.ts` (New file to be created in Station 1/2) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/network/apply_delta.ts` | Tier 1 | 347 | 362 | +15 lines | Warning |
| `src/client/network/use_app_session.ts` | Tier 1 | 272 | 278 | +6 lines | Safe |
| `src/client/store/game_store.ts` | Tier 1 | 377 | 377 | 0 (Modify 1 line) | Warning |
| `tests/contracts/imp279_presentation_staging_and_transit_wheel_sync.test.ts` | Living Test | 0 | 200 | +200 lines | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+21 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

*Ghi nợ kỹ thuật (Tech Debt):* `apply_delta.ts` (362 LOC) và `game_store.ts` (377 LOC) ghi nhận `DEBT-IMP279-LOC` để tách sub-manager decomposition khi chạm mốc 390 LOC.

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts) — **MODIFY**: Xuất hàm `consumeStagedTransitWheel()` và `resetStagedTransitWheel()`. Khi nhận `delta.pendingTransitWheel`: nếu `!isMoving && activeModal === null`, mở modal ngay; nếu `isMoving`, lưu vào `stagedTransitWheel`. Khi nhận null, chỉ xóa `stagedTransitWheel`, TUYỆT ĐỐI KHÔNG đóng modal.
2. [`src/client/network/use_app_session.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_app_session.ts) — **MODIFY**: Trong hook lắng nghe `lastLandedPawn`, gọi `consumeStagedTransitWheel()` để chỉ mở modal `transit_wheel` khi con cờ 3D đã nhảy xong và chạm đất tại ô trạm.
3. [`src/client/store/game_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts) — **MODIFY**: Trong hàm `setIsRolling(false)`, bổ sung điều kiện bảo vệ `get().activeModal !== 'transit_wheel'` để không vô tình giải phóng `pendingPawnMove` khi vòng xoay đang quay.
4. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/client/3d/miniature_city_diorama.tsx`
   - `src/client/3d/perf_budget.ts`
   - `src/client/ui/action_dock.tsx`
   - `src/client/ui/actionable_notification.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `src/client/ui/modals/bot_trade_offer_modal.tsx`
   - `src/client/ui/modals/bot_trade_offer_strip.tsx`
   - `src/client/ui/ui_helpers.ts`
   - `src/server/intent_dispatcher.ts`
   - `tests/contracts/imp210_auto_solvency_intent.test.ts`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts`
   - `tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts`
   - `tests/contracts/imp282_poka_yoke_bankrupt_hud_spectator.test.ts`
   - `tests/contracts/imp283_mobile_3d_lod_throttling.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Cơ Chế Staging Presentation & Handshake Hoạt Cảnh
* **Bối cảnh**: Backend phản hồi trong 1ms gửi delta vị trí mới và mở cờ `pendingTransitWheel`. Ở client, xúc xắc lăn mất 2s, quân cờ nhảy mất 230ms/bước, và đĩa quay mất 3.5s.
* **Cơ chế Staging**: Client tạm giữ payload mở modal vào vùng nhớ đệm `stagedTransitWheel`. Chỉ khi quân cờ 3D phát tín hiệu tiếp đất `lastLandedPawn`, modal mới được phép hiển thị lên màn hình.
* **Cơ chế Lock Pawn**: Khi người chơi bấm "Quay", quân cờ được khóa cứng tại ô xuất phát `fromCell` thông qua `pendingPawnMove`. Bộ đếm xúc xắc `setIsRolling(false)` không được phép đụng vào `pendingPawnMove` này cho đến khi người chơi xác nhận kết quả vòng xoay qua nút đóng modal.
* **Bất biến quyền đóng modal**: Server chỉ kích hoạt; quyền đóng modal thuộc về tương tác của người chơi (`handleDismiss`) hoặc đổi lượt cưỡng chế, không đóng theo `null` delta.

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (No Premature Modal)**: Không bao giờ mở modal `transit_wheel` khi `isRolling === true` hoặc `activePawnAnimation.isAnimating === true`.
* **Bất biến 2 (Physical Landing Handshake)**: Modal `transit_wheel` được kích hoạt chính xác tại thời điểm quân cờ chạm đất (`lastLandedPawn.cellIndex === stagedWheel.cellIndex`).
* **Bất biến 3 (Direct FullSync & Unowned Reconnect)**: Trên Reconnect, FullSync, hoặc sau khi mua ô trạm (`!isMoving && activeModal === null`), mở modal ngay lập tức không cần đợi nhảy cờ.
* **Bất biến 4 (Spin Lock Pawn Invariance)**: Suốt 3.5 giây vòng xoay quay trong modal, quân cờ 3D giữ nguyên tọa độ `fromCell`, cấm nhảy sớm sang `targetCell`.
* **Bất biến 5 (Dismiss Release Handshake)**: Chỉ khi `handleDismiss` hoặc đổi pha cưỡng chế, `pendingPawnMove` mới được giải phóng cho quân cờ chạy chặng tiếp theo.

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Staging `pendingTransitWheel` Trong `src/client/network/apply_delta.ts`
* **Target physical file**: `src/client/network/apply_delta.ts`

```typescript
<<<<
import { applyPlayerDeltas, initPlayersInfoMap } from './apply_delta_players.js';
import { applyCellDeltas } from './apply_delta_cells.js';
export { applyPlayerDeltas, initPlayersInfoMap, applyCellDeltas };
====
import { applyPlayerDeltas, initPlayersInfoMap } from './apply_delta_players.js';
import { applyCellDeltas } from './apply_delta_cells.js';
export { applyPlayerDeltas, initPlayersInfoMap, applyCellDeltas };

let stagedTransitWheel: { playerId: string; cellIndex: number; timestamp: number } | null = null;

export function consumeStagedTransitWheel(): { playerId: string; cellIndex: number; timestamp: number } | null {
  const staged = stagedTransitWheel;
  stagedTransitWheel = null;
  return staged;
}

export function resetStagedTransitWheel(): void {
  stagedTransitWheel = null;
}
>>>>
```

```typescript
<<<<
  if (delta.pendingTransitWheel) {
    const myPid = useLobbyStore.getState().myPlayerId;
    const isTarget = myPid ? delta.pendingTransitWheel.playerId === myPid : Boolean(state.isOfflineMode);
    if (isTarget) {
      state.openModal('transit_wheel', delta.pendingTransitWheel);
    }
  }
====
  if (delta.pendingTransitWheel !== undefined) {
    if (delta.pendingTransitWheel) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isTarget = myPid ? delta.pendingTransitWheel.playerId === myPid : Boolean(state.isOfflineMode);
      if (isTarget) {
        const isMoving = Boolean(state.activePawnAnimation?.isAnimating || state.isRolling);
        if (!isMoving && state.activeModal === null) {
          state.openModal('transit_wheel', delta.pendingTransitWheel);
          stagedTransitWheel = null;
        } else {
          stagedTransitWheel = delta.pendingTransitWheel;
        }
      }
    } else {
      stagedTransitWheel = null;
    }
  }
>>>>
```

### Task 2: Kích Hoạt Modal Tại Tiếp Đất `lastLandedPawn` Trong `src/client/network/use_app_session.ts`
* **Target physical file**: `src/client/network/use_app_session.ts`

```typescript
<<<<
import { executeCellLanding } from '../offline_landing';
====
import { executeCellLanding } from '../offline_landing';
import { consumeStagedTransitWheel } from './apply_delta';
>>>>
```

```typescript
<<<<
  // [UI-S02/MSS] Mở modal và tương tác ô đất CHÍNH XÁC khi con cờ chạm đất tại ô đích
  useEffect(() => {
    if (!lastLandedPawn) return;
    if (lastHandledLandingTimestampRef.current === lastLandedPawn.timestamp) {
      return;
    }
    lastHandledLandingTimestampRef.current = lastLandedPawn.timestamp;
    handleCellLanding(lastLandedPawn.playerId, lastLandedPawn.cellIndex);
  }, [lastLandedPawn, handleCellLanding]);
====
  // [UI-S02/MSS] Mở modal và tương tác ô đất CHÍNH XÁC khi con cờ chạm đất tại ô đích
  useEffect(() => {
    if (!lastLandedPawn) return;
    if (lastHandledLandingTimestampRef.current === lastLandedPawn.timestamp) {
      return;
    }
    lastHandledLandingTimestampRef.current = lastLandedPawn.timestamp;
    const stagedWheel = consumeStagedTransitWheel();
    if (stagedWheel && stagedWheel.cellIndex === lastLandedPawn.cellIndex && stagedWheel.playerId === lastLandedPawn.playerId) {
      useGameStore.getState().openModal('transit_wheel', stagedWheel);
    }
    handleCellLanding(lastLandedPawn.playerId, lastLandedPawn.cellIndex);
  }, [lastLandedPawn, handleCellLanding]);
>>>>
```

### Task 3: Bảo Vệ `pendingPawnMove` Khi `activeModal === 'transit_wheel'` Trong `src/client/store/game_store.ts`
* **Target physical file**: `src/client/store/game_store.ts`

```typescript
<<<<
    if (!isRolling) {
      const pending = get().pendingPawnMove;
      if (pending) {
        set({ pendingPawnMove: null });
        get().startPawnMove(pending.playerId, pending.targetCell, pending.fromCell, pending.isBot, pending.isJailFlight);
      }
      get().processPawnQueue();
    } else {
====
    if (!isRolling) {
      const pending = get().pendingPawnMove;
      if (pending && get().activeModal !== 'transit_wheel') {
        set({ pendingPawnMove: null });
        get().startPawnMove(pending.playerId, pending.targetCell, pending.fromCell, pending.isBot, pending.isJailFlight);
      }
      get().processPawnQueue();
    } else {
>>>>
```

---

## 3. HỢP ĐỒNG KIỂM THỬ ĐỐI KHÁNG (ADVERSARIAL TEST CONTRACTS)

* **Target physical file**: `tests/contracts/imp279_presentation_staging_and_transit_wheel_sync.test.ts` (New file to be created in Station 1/2)

1. `[TC-279.01][UC-IMP279/MSS]` Given isRolling is true, When delta.pendingTransitWheel arrives, Then activeModal remains null and wheel is staged.
2. `[TC-279.02][UC-IMP279/MSS]` Given activePawnAnimation.isAnimating is true, When delta.pendingTransitWheel arrives, Then stagedTransitWheel is preserved.
3. `[TC-279.03][UC-IMP279/MSS]` Given staged transit wheel, When lastLandedPawn triggers at matched station cell, Then activeModal transitions to transit_wheel.
4. `[TC-279.04][UC-IMP279/MSS]` Given isMoving is false on full sync or unowned station purchase, When delta.pendingTransitWheel arrives, Then openModal transit_wheel executes immediately.
5. `[TC-279.05][UC-IMP279/MSS]` Given activeModal is transit_wheel, When setIsRolling false executes, Then pendingPawnMove is not consumed.
6. `[TC-279.06][UC-IMP279/MSS]` Given activeModal is transit_wheel, When pendingPawnMove is active, Then pawn position resolves strictly to fromCell.
7. `[TC-279.07][UC-IMP279/MSS]` Given activeModal is transit_wheel, When handleDismiss triggers, Then startPawnMove is dispatched and modal closes.
8. `[TC-279.08][UC-IMP279/A1]` Given activeModal is transit_wheel, When delta.pendingTransitWheel is null, Then activeModal remains open and stagedTransitWheel is cleared.
9. `[TC-279.09][UC-IMP279/A2]` Given activeModal is transit_wheel, When phase transitions away from PropertyManagement, Then modal closes and pendingPawnMove is cleared.
10. `[TC-279.10][UC-IMP279/A3]` Given mismatched lastLandedPawn cellIndex, When landing handled, Then staged wheel is not consumed by incorrect cell.

---

## 4. BẢNG CỔNG GÁC CƠ HỌC & TIÊU CHUẨN XUẤT XƯỞNG (DEFINITION OF DONE)

| Trạm | Kiểm Tra | Công Cụ & Lệnh | Tiêu Chuẩn Pass |
| :---: | :--- | :--- | :--- |
| **0** | Pre-Flight Plan Audit | `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_279_PRESENTATION_STAGING_AND_TRANSIT_WHEEL_SYNC.md --auto-sign` | 0 defects, tự động ký duyệt `HARDENED_APPROVED` |
| **1** | RED Contract Test | `npx vitest run tests/contracts/imp279_presentation_staging_and_transit_wheel_sync.test.ts` | FAIL 100% (Adversarial Inversion) |
| **2** | GREEN Implementation | `npx vitest run tests/contracts/imp279_presentation_staging_and_transit_wheel_sync.test.ts` | PASS 100% (10/10 tests) |
| **2.5**| Fast Pre-Filter | `npm run prefilter -- src/client/network/apply_delta.ts src/client/network/use_app_session.ts src/client/store/game_store.ts` | PASS 100% (Type, LOC, AST, Linters) |
| **3.0**| Visual / DOM Check | Playwright DOM / modal assertion | Modal chỉ mount sau khi con cờ chạm đất |
| **3.1**| Scope Confinement | `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_279_PRESENTATION_STAGING_AND_TRANSIT_WHEEL_SYNC.md` | 0% Scope Drift |
| **4** | Sentinel Mutation Kill | `npm run sentinel -- --ticket IMP_279 --test tests/contracts/imp279_presentation_staging_and_transit_wheel_sync.test.ts` | >= 14 mutants, 100% kill rate |
