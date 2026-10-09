# Plan IMP-305: Modularize Room Manager Auction Coordination

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-305`
- **Subsystem**: `server-room` (Tier 1 Core Logic)
- **Problem Statement**: `src/server/room_manager.ts` is 382 LOC (Tier 1 ceiling <= 400 LOC, only 18 lines headroom). Auction handling, bidding, passes, bot steps, closure, and result caching are entangled in the main class.
- **Architectural Solution**: Extract `src/server/room_auction_coordinator.ts` following the existing `room_bot_coordinator.ts` and `room_property_coordinator.ts` pattern. Preserve 100% auction lifecycle and cache synchronization.
- **Direct Scope**:
  - `src/server/room_manager.ts`
  - `src/server/room_auction_coordinator.ts` (New)
  - `tests/server/room_auction_coordinator.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `src/client/3d/adaptive_cinematic_camera.tsx`
  - `src/client/3d/camera_kinematic_helpers.ts`
  - `src/client/3d/camera_location_beacon.tsx`
  - `src/client/3d/camera_soft_return.ts`
  - `src/client/3d/camera_state_machine.ts`
  - `src/client/3d/cinematic_chase_camera.ts`
  - `src/client/3d/cinematic_spline_flyby.ts`
  - `src/client/3d/use_camera_gestures.ts`
  - `src/client/audio/sound_engine.ts`
  - `src/client/audio/sound_engine_context.ts`
  - `src/client/audio/sound_synth_recipes.ts`
  - `src/client/audio/synth_recipes_ambient.ts`
  - `src/client/audio/synth_recipes_gameplay.ts`
  - `src/client/audio/synth_recipes_ui.ts`
  - `src/client/network/activity_go_extractor.ts`
  - `src/client/network/activity_rent_matcher.ts`
  - `src/client/network/apply_delta.ts`
  - `src/client/network/apply_delta_modals.ts`
  - `src/client/store/game_store_state_types.ts`
  - `src/client/store/game_store_subtypes.ts`
  - `src/client/store/game_store_types.ts`
  - `src/client/ui/actionable_notification.ts`
  - `src/client/ui/actionable_notification_gameplay.ts`
  - `src/client/ui/actionable_notification_map.ts`
  - `src/client/ui/actionable_notification_system.ts`
  - `src/domain/bot/bot_action_evaluator.ts`
  - `src/domain/bot/bot_engine.ts`
  - `src/server/logging/persistent_room_logger.ts`
  - `src/server/logging/room_logger_cloud_sync.ts`
  - `src/server/network/turn_bot_timer_scheduler.ts`
  - `src/server/network/turn_orchestrator.ts`
  - `tests/client/actionable_notification_modular.test.ts`
  - `tests/client/activity_go_extractor.test.ts`
  - `tests/client/apply_delta_modals.test.ts`
  - `tests/client/camera_gestures.test.ts`
  - `tests/client/camera_soft_return_and_beacon.test.ts`
  - `tests/client/cinematic_spline_flyby.test.ts`
  - `tests/client/dramatic_pacing_camera.test.ts`
  - `tests/client/game_store_types_modular.test.ts`
  - `tests/client/sound_engine_modular.test.ts`
  - `tests/client/sound_synth_recipes_modular.test.ts`
  - `tests/client/spatial_kinematics_camera.test.ts`
  - `tests/domain/bot_action_evaluator.test.ts`
  - `tests/server/room_logger_cloud_sync.test.ts`
  - `tests/server/turn_bot_timer_scheduler.test.ts`

## 2. Planned Changes & LOC Budget
| File | Tier | Baseline LOC | Target LOC | Delta | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/server/room_manager.ts` | Tier 1 | 382 | ~295 | -87 | Safe (<= 400) |
| `src/server/room_auction_coordinator.ts` | Tier 1 | 0 | ~95 | +95 | Safe (<= 400) |
| `tests/server/room_auction_coordinator.test.ts` | Living Test | 0 | ~140 | +140 | Safe (<= 600) |

## 3. Implementation Steps
- **Step 1 (Scaffold Stub)**: Create `src/server/room_auction_coordinator.ts` with typed function signatures.
- **Step 2 (Station 1 RED)**: Write `tests/server/room_auction_coordinator.test.ts` verifying decline, bidding, passing, closing, bot steps, and result caching.
- **Step 3 (Station 2 GREEN)**: Extract logic into `room_auction_coordinator.ts` and delegate from `room_manager.ts`.
- **Step 4 (Mechanical Gates)**: Run `npm run prefilter` and `node scripts/check_scope.mjs`.
- **Step 5 (Station 4 Sentinel)**: Run `npm run sentinel -- --ticket IMP-305 --test tests/server/room_auction_coordinator.test.ts --src src/server/room_auction_coordinator.ts`.
- **Step 6 (Station 3 & 5 Audits)**: Write `SPEC_REVIEW_IMP-305.md`, `CODE_REVIEW_IMP-305.md`, run `npm run report -- IMP-305`.

---

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `server-room`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn bộ nhớ/timer, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong it().

---

### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-305 --test tests/server/room_auction_coordinator.test.ts --src src/server/room_auction_coordinator.ts
```
Mục tiêu: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).

---

### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
Lệnh xác thực bằng chứng:
```bash
node scripts/check_evidence.mjs IMP-305
```
Output: Báo cáo nghiệm thu hoàn chỉnh tại `docs/reports/improvements/IMP-305-room-auction-coordinator_report.md`.
