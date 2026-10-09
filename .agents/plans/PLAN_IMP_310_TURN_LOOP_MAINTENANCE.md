# Plan IMP-310: Modularize Turn Loop Maintenance & GO Pass Debt Handlers

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-310`
- **Subsystem**: `server-engine` (Tier 1 Core Server Engine)
- **Problem Statement**: `src/server/turn_loop.ts` is 374 LOC (Tier 1 ceiling <= 400 LOC, only 26 lines headroom). Specialized GO pass debt processing, EVN utility billing, unbuilt round decay auctions, and trade freeze checks occupy ~100 LOC of maintenance routines within the turn loop lifecycle.
- **Architectural Solution**: Extract `src/server/turn_loop_maintenance.ts` exporting `isTradeFrozen`, `processPendingDebts`, `processGoElectricBilling`, and `processUnbuiltRounds`. Preserve 100% turn state transition invariants and auction trigger contracts.
- **Direct Scope**:
  - `src/server/turn_loop.ts`
  - `src/server/turn_loop_maintenance.ts` (New)
  - `tests/server/turn_loop_maintenance.test.ts` (New)
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
  - `src/client/store/game_store.ts`
  - `src/client/store/game_store_pawn_actions.ts`
  - `src/client/store/game_store_state_types.ts`
  - `src/client/store/game_store_subtypes.ts`
  - `src/client/store/game_store_types.ts`
  - `src/client/ui/actionable_notification.ts`
  - `src/client/ui/actionable_notification_gameplay.ts`
  - `src/client/ui/actionable_notification_map.ts`
  - `src/client/ui/actionable_notification_system.ts`
  - `src/client/ui/modals/masterplan_components.tsx`
  - `src/client/ui/modals/masterplan_district_card.tsx`
  - `src/domain/bot/bot_action_evaluator.ts`
  - `src/domain/bot/bot_engine.ts`
  - `src/domain/chance_card_handlers.ts`
  - `src/domain/chance_ma_handlers.ts`
  - `src/server/logging/persistent_room_logger.ts`
  - `src/server/logging/room_logger_cloud_sync.ts`
  - `src/server/network/turn_bot_timer_scheduler.ts`
  - `src/server/network/turn_orchestrator.ts`
  - `src/server/network/wss_server.ts`
  - `src/server/network/wss_server_lifecycle.ts`
  - `src/server/room_auction_coordinator.ts`
  - `src/server/room_manager.ts`
  - `tests/client/actionable_notification_modular.test.ts`
  - `tests/client/activity_go_extractor.test.ts`
  - `tests/client/apply_delta_modals.test.ts`
  - `tests/client/camera_gestures.test.ts`
  - `tests/client/camera_soft_return_and_beacon.test.ts`
  - `tests/client/cinematic_spline_flyby.test.ts`
  - `tests/client/dramatic_pacing_camera.test.ts`
  - `tests/client/game_store_pawn_actions.test.ts`
  - `tests/client/game_store_types_modular.test.ts`
  - `tests/client/masterplan_district_card.test.ts`
  - `tests/client/sound_engine_modular.test.ts`
  - `tests/client/sound_synth_recipes_modular.test.ts`
  - `tests/client/spatial_kinematics_camera.test.ts`
  - `tests/domain/bot_action_evaluator.test.ts`
  - `tests/domain/chance_ma_handlers.test.ts`
  - `tests/server/room_auction_coordinator.test.ts`
  - `tests/server/room_logger_cloud_sync.test.ts`
  - `tests/server/turn_bot_timer_scheduler.test.ts`
  - `tests/server/wss_server_lifecycle.test.ts`

## 2. Planned Changes & LOC Budget
| File | Tier | Baseline LOC | Target LOC | Delta | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/server/turn_loop.ts` | Tier 1 | 374 | ~275 | -99 | Safe (<= 400) |
| `src/server/turn_loop_maintenance.ts` | Tier 1 | 0 | ~110 | +110 | Safe (<= 400) |
| `tests/server/turn_loop_maintenance.test.ts` | Living Test | 0 | ~180 | +180 | Safe (<= 600) |

## 3. Implementation Steps
- **Step 1 (Scaffold Stub)**: Create `src/server/turn_loop_maintenance.ts` with stubbed `isTradeFrozen`, `processPendingDebts`, `processGoElectricBilling`, and `processUnbuiltRounds`.
- **Step 2 (Station 1 RED)**: Write `tests/server/turn_loop_maintenance.test.ts` verifying:
  - TC-TLM-TRD.01 [UC-TLM/MSS]: Given a room with active `MC_FREEZE_TRADE` modifier, When `isTradeFrozen` is evaluated, Then returns true; otherwise false.
  - TC-TLM-DEBT.01 [UC-TLM/MSS]: Given a player with `CC_FREE_CREDIT` passing GO, When `processPendingDebts` runs, Then 400 Tr. interest is transferred to room treasury.
  - TC-TLM-DEBT.02 [UC-TLM/MSS]: Given an active `CC_OVERDRAFT` with 1 round remaining, When `processPendingDebts` runs, Then decrements rounds, deducts 3,300 Tr., and removes debt.
  - TC-TLM-EVN.01 [UC-TLM/MSS]: Given EVN owner on cell 12, When opponent passes GO, Then calculates electric bill and transfers payment.
  - TC-TLM-UNBLT.01 [UC-TLM/MSS]: Given a property with `unbuiltRounds == 2`, When `processUnbuiltRounds` runs, Then reclaims property, opens 50% auction, and shifts room phase to `AuctionPhase`.
- **Step 3 (Station 2 GREEN)**: Implement complete logic in `src/server/turn_loop_maintenance.ts` and import into `src/server/turn_loop.ts`.
- **Step 4 (Mechanical Gates)**: Run `npm run prefilter` and `node scripts/check_scope.mjs`.
- **Step 5 (Station 4 Sentinel)**: Run `npm run sentinel -- --ticket IMP-310 --test tests/server/turn_loop_maintenance.test.ts`.
- **Step 6 (Station 3 & 5 Audits)**: Write `SPEC_REVIEW_IMP-310.md`, `CODE_REVIEW_IMP-310.md`, run `npm run report -- IMP-310`.

---

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `server-engine`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn bộ nhớ/timer, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong it(), và kiểm tra chuyển trạng thái AuctionPhase.

---

### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-310 --test tests/server/turn_loop_maintenance.test.ts
```
Mục tiêu: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).

---

### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
Lệnh xác thực:
```bash
npm run report -- IMP-310
node scripts/check_evidence.mjs IMP-310
```
