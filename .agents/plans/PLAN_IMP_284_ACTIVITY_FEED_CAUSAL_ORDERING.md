# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-284 — Sắp Xếp Trật Tự Nhân Quả Nhật Ký Hoạt Động (Activity Feed Causal Timeline Ordering)

> **Mã Nhiệm Vụ:** IMP-284 (Activity Feed Causal Timeline Ordering)  
> **Phân hệ mục tiêu:** `client-state`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, <= 220 lines, 1 file in `src/**`, 1 subsystem)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 10 atomic tests, >= 14 mutants killed, Pure Logic Waiver = `false`

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/network/activity_tracker.ts` (362 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp284_activity_feed_causal_ordering.test.ts` (New file to be created in Station 1/2) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/network/activity_tracker.ts` | Tier 1 | 362 | 369 | +7 lines | Safe |
| `tests/contracts/imp284_activity_feed_causal_ordering.test.ts` | Living Test | 0 | 220 | +220 lines | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+7 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/network/activity_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts) — **MODIFY (Target 1)**: Đặt việc phát hiện sự kiện kích hoạt nguyên nhân (`detectTransitActivities` và `detectEventCardActivities`) lên TRƯỚC sự kiện di chuyển (`detectMoveActivities`) và hệ quả kinh tế (`detectFinancialAndStatusActivities`).
2. [`tests/contracts/imp284_activity_feed_causal_ordering.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp284_activity_feed_causal_ordering.test.ts) — **NEW (Target 2)**: Khởi tạo 10 atomic contract tests kiểm toán trật tự nhân quả của mảng nhật ký trong useActivityStore.
3. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/client/3d/miniature_city_diorama.tsx`
   - `src/client/3d/perf_budget.ts`
   - `src/client/network/apply_delta.ts`
   - `src/client/network/use_app_session.ts`
   - `src/client/store/game_store.ts`
   - `src/client/ui/action_dock.tsx`
   - `src/client/ui/actionable_notification.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `src/client/ui/modals/bot_trade_offer_modal.tsx`
   - `src/client/ui/modals/bot_trade_offer_strip.tsx`
   - `src/client/ui/ui_helpers.ts`
   - `src/server/intent_dispatcher.ts`
   - `tests/contracts/imp210_auto_solvency_intent.test.ts`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp279_presentation_staging_and_transit_wheel_sync.test.ts`
   - `tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts`
   - `tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts`
   - `tests/contracts/imp282_poka_yoke_bankrupt_hud_spectator.test.ts`
   - `tests/contracts/imp283_mobile_3d_lod_throttling.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Cơ Chế Trật Tự Nhân Quả (Causal Timeline Invariant)
* **Bối cảnh**: Khi người chơi quay Vòng Xoay Vận Tải hoặc rút Thẻ Cơ Hội dịch chuyển, server giải quyết kết quả và gửi về trong cùng 1 gói `delta` bao gồm:
  - `lastTransitResult` (hoặc `lastEventCard`): Nguyên nhân kích hoạt (Trigger/Cause).
  - `players[].position`: Tọa độ mới của con cờ (Kinematic Consequence).
  - `passedGoSalary` / `amount`: Lương khi vượt qua ô GO hoặc tiền thưởng/phạt (Economic Effect).
* **Bất biến trật tự**: Nhật ký hoạt động hiển thị theo dòng thời gian từ trên xuống dưới (sự kiện mới ở dưới). Trật tự trong cùng một nhịp xử lý delta BẮT BUỘC phải là:
  $$\text{Nguyên nhân (Vòng xoay/Thẻ)} \longrightarrow \text{Di chuyển (Quân cờ)} \longrightarrow \text{Hệ quả (Lương/Thuế/BĐS)}$$
* **Bảo toàn lượt xúc xắc chuẩn**: Với lượt đổ xúc xắc thông thường, thứ tự là $\text{Xúc xắc} \rightarrow \text{Di chuyển} \rightarrow \text{Tương tác ô đất}$.

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Tái Cấu Trúc Trật Tự Trích Xuất Hoạt Động Trong `src/client/network/activity_tracker.ts`
* **Target physical file**: `src/client/network/activity_tracker.ts`

```typescript
<<<<
  const activities: ActivityLogEntry[] = [];
  const diceEntry = detectDiceActivity(delta, prevState, nextState, activityStore);
  if (diceEntry) activities.push(diceEntry);

  activities.push(...detectMoveActivities(delta, prevState, nextState));

  // [IMP-187] Causal Timeline Ordering: Thẻ sự kiện (Nguyên nhân) -> Chuyển giao BĐS (Đổi chủ) -> Dòng tiền (Kết quả)
  const cardEntries = detectEventCardActivities(delta, prevState, nextState, activityStore);
  activities.push(...cardEntries);

  const { entries: propEntries, context } = detectPropertyAndLevelActivities(delta, prevState, nextState);
  activities.push(...propEntries);
  activities.push(...detectFinancialAndStatusActivities(delta, prevState, nextState, context));
  activities.push(...detectAuctionActivities(delta, prevState, nextState, activityStore));
  activities.push(...detectTransitActivities(delta, prevState, nextState, activityStore));

  const store = activityStore.getState();
  for (const entry of activities) {
    store.addActivityLog(entry);
  }
====
  const activities: ActivityLogEntry[] = [];
  const diceEntry = detectDiceActivity(delta, prevState, nextState, activityStore);
  if (diceEntry) activities.push(diceEntry);

  // [IMP-187][IMP-284] Causal Timeline Ordering:
  // 1. Nguyên nhân kích hoạt: Vòng xoay vận tải & Thẻ sự kiện/cơ hội
  const transitEntries = detectTransitActivities(delta, prevState, nextState, activityStore);
  activities.push(...transitEntries);

  const cardEntries = detectEventCardActivities(delta, prevState, nextState, activityStore);
  activities.push(...cardEntries);

  // 2. Hệ quả động học: Quân cờ di chuyển theo xúc xắc hoặc hiệu ứng vòng xoay/thẻ bay
  activities.push(...detectMoveActivities(delta, prevState, nextState));

  // 3. Hệ quả giao dịch & tài chính: Chuyển giao BĐS, Dòng tiền (lương/thuế/tiền thuê), Đấu giá
  const { entries: propEntries, context } = detectPropertyAndLevelActivities(delta, prevState, nextState);
  activities.push(...propEntries);
  activities.push(...detectFinancialAndStatusActivities(delta, prevState, nextState, context));
  activities.push(...detectAuctionActivities(delta, prevState, nextState, activityStore));

  const store = activityStore.getState();
  for (const entry of activities) {
    store.addActivityLog(entry);
  }
>>>>
```

---

## 3. HỢP ĐỒNG KIỂM THỬ ĐỐI KHÁNG (ADVERSARIAL TEST CONTRACTS)

* **Target physical file**: `tests/contracts/imp284_activity_feed_causal_ordering.test.ts` (New file to be created in Station 1/2)

1. `[TC-284.01][UC-IMP284/MSS]` Given PASS_GO_FLIGHT outcome and passedGoSalary, When trackDeltaActivities executes, Then transit log precedes move log.
2. `[TC-284.02][UC-IMP284/MSS]` Given PASS_GO_FLIGHT outcome and passedGoSalary, When trackDeltaActivities executes, Then transit log precedes salary log.
3. `[TC-284.03][UC-IMP284/MSS]` Given PASS_GO_FLIGHT outcome, When trackDeltaActivities executes, Then move log precedes salary log.
4. `[TC-284.04][UC-IMP284/MSS]` Given NEXT_PORT outcome and destination cell move, When trackDeltaActivities executes, Then transit log precedes move log.
5. `[TC-284.05][UC-IMP284/MSS]` Given SPEED_BOOST outcome and step forward move, When trackDeltaActivities executes, Then transit log precedes move log.
6. `[TC-284.06][UC-IMP284/MSS]` Given CASH_BACK outcome with treasury payout, When trackDeltaActivities executes, Then transit log precedes financial log.
7. `[TC-284.07][UC-IMP284/MSS]` Given Chance card flight and destination move, When trackDeltaActivities executes, Then card log precedes move log.
8. `[TC-284.08][UC-IMP284/MSS]` Given standard dice roll and landing, When trackDeltaActivities executes, Then dice log precedes move log.
9. `[TC-284.09][UC-IMP284/MSS]` Given standard dice roll and property purchase, When trackDeltaActivities executes, Then move log precedes property purchase log.
10. `[TC-284.10][UC-IMP284/A1]` Given FLIGHT_DELAY outcome without movement, When trackDeltaActivities executes, Then transit log is recorded with zero spurious move log.

---

## 4. BẢNG CỔNG GÁC CƠ HỌC & TIÊU CHUẨN XUẤT XƯỞNG (DEFINITION OF DONE)

| Trạm | Kiểm Tra | Công Cụ & Lệnh | Tiêu Chuẩn Pass |
| :---: | :--- | :--- | :--- |
| **0** | Pre-Flight Plan Audit | `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_284_ACTIVITY_FEED_CAUSAL_ORDERING.md --auto-sign` | 0 defects, tự động ký duyệt `HARDENED_APPROVED` |
| **1** | RED Contract Test | `npx vitest run tests/contracts/imp284_activity_feed_causal_ordering.test.ts` | FAIL 100% (Adversarial Inversion) |
| **2** | GREEN Implementation | `npx vitest run tests/contracts/imp284_activity_feed_causal_ordering.test.ts` | PASS 100% (10/10 tests) |
| **2.5**| Fast Pre-Filter | `npm run prefilter -- src/client/network/activity_tracker.ts` | PASS 100% (Type, LOC, AST, Linters) |
| **3.1**| Scope Confinement | `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_284_ACTIVITY_FEED_CAUSAL_ORDERING.md` | 0% Scope Drift |
| **4** | Sentinel Mutation Kill | `npm run sentinel -- --ticket IMP-284 --test tests/contracts/imp284_activity_feed_causal_ordering.test.ts` | >= 14 mutants, 100% kill rate |
