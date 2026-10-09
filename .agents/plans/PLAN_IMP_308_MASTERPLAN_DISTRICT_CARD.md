# Plan IMP-308: Modularize Masterplan District Card Component

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-308`
- **Subsystem**: `client-ui` (Tier 2 Tactical UI & Modals)
- **Problem Statement**: `src/client/ui/modals/masterplan_components.tsx` is 475 LOC (Tier 2 ceiling <= 500 LOC, only 25 lines headroom). Complex district card rendering with segmented progress bars, monopoly calculation, and quick-trade actions creates severe maintenance risk.
- **Architectural Solution**: Extract `src/client/ui/modals/masterplan_district_card.tsx` exporting `MasterplanDistrictCard` and `MasterplanDistrictCardProps`. Re-export seamlessly from `src/client/ui/modals/masterplan_components.tsx` to maintain 100% backward compatibility.
- **Direct Scope**:
  - `src/client/ui/modals/masterplan_components.tsx`
  - `src/client/ui/modals/masterplan_district_card.tsx` (New)
  - `tests/client/masterplan_district_card.test.ts` (New)
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
  - `src/domain/bot/bot_action_evaluator.ts`
  - `src/domain/bot/bot_engine.ts`
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
  - `tests/client/sound_engine_modular.test.ts`
  - `tests/client/sound_synth_recipes_modular.test.ts`
  - `tests/client/spatial_kinematics_camera.test.ts`
  - `tests/domain/bot_action_evaluator.test.ts`
  - `tests/server/room_auction_coordinator.test.ts`
  - `tests/server/room_logger_cloud_sync.test.ts`
  - `tests/server/turn_bot_timer_scheduler.test.ts`
  - `tests/server/wss_server_lifecycle.test.ts`

## 2. Planned Changes & LOC Budget
| File | Tier | Baseline LOC | Target LOC | Delta | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/ui/modals/masterplan_components.tsx` | Tier 2 | 475 | ~190 | -285 | Safe (<= 500) |
| `src/client/ui/modals/masterplan_district_card.tsx` | Tier 2 | 0 | ~285 | +285 | Safe (<= 500) |
| `tests/client/masterplan_district_card.test.ts` | Living Test | 0 | ~140 | +140 | Safe (<= 600) |

## 3. Implementation Steps
- **Step 1 (Scaffold Stub)**: Create `src/client/ui/modals/masterplan_district_card.tsx` with stubbed `MasterplanDistrictCard`.
- **Step 2 (Station 1 RED)**: Write `tests/client/masterplan_district_card.test.ts` verifying:
  - TC-MPDC.01 [UC-MPDC/MSS]: Given a district where all cells are owned by one player, When `MasterplanDistrictCard` renders, Then a monopoly badge with the owner name is displayed.
  - TC-MPDC.02 [UC-MPDC/MSS]: Given a district with totalCells - 1 owned by a leading player, When `MasterplanDistrictCard` renders, Then a near-monopoly badge is presented.
  - TC-MPDC.03 [UC-MPDC/MSS]: Given an unowned cell in the district, When `MasterplanDistrictCard` renders, Then vacant styling and vacant progress segments are displayed.
  - TC-MPDC.04 [UC-MPDC/A1]: Given trade is frozen, When rendering a cell owned by an opponent, Then the quick-trade button is disabled.
- **Step 3 (Station 2 GREEN)**: Implement complete logic in `src/client/ui/modals/masterplan_district_card.tsx` and re-export in `src/client/ui/modals/masterplan_components.tsx`.
- **Step 4 (Mechanical Gates)**: Run `npm run prefilter` and `node scripts/check_scope.mjs`.
- **Step 5 (Station 4 Sentinel)**: Run `npm run sentinel -- --ticket IMP-308 --test tests/client/masterplan_district_card.test.ts`.
- **Step 6 (Station 3 & 5 Audits)**: Write `SPEC_REVIEW_IMP-308.md`, `CODE_REVIEW_IMP-308.md`, run `npm run report -- IMP-308`.

---

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `client-ui`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn bộ nhớ/timer, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong it(), và kiểm tra Poka-Yoke affordance.

---

### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-308 --test tests/client/masterplan_district_card.test.ts
```
Mục tiêu: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).

---

### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
Lệnh xác thực:
```bash
npm run report -- IMP-308
node scripts/check_evidence.mjs IMP-308
```
