# Plan IMP-309: Modularize Corporate M&A and Compulsory Buyout Chance Card Handlers

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-309`
- **Subsystem**: `domain-economy` (Tier 1 Core Domain & Economy Engine)
- **Problem Statement**: `src/domain/chance_card_handlers.ts` is 374 LOC (Tier 1 ceiling <= 400 LOC, only 26 lines headroom). Complex corporate acquisition logic (`CC_MA_FORCE` and `CC_SWAP_PROJECT`), candidate filtering, compensation subsidies, and pending buyout session building are tightly coupled within the main dispatcher.
- **Architectural Solution**: Extract `src/domain/chance_ma_handlers.ts` exporting `handleMaForce`, `handleSwapProject`, and `applyCompensatorySubsidy`. Preserve 100% economic invariants (1.2x deed acquisition, 800 Tr. fallback subsidy, treasury debits, and pendingBuyout session payloads).
- **Direct Scope**:
  - `src/domain/chance_card_handlers.ts`
  - `src/domain/chance_ma_handlers.ts` (New)
  - `tests/domain/chance_ma_handlers.test.ts` (New)
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
  - `tests/server/room_auction_coordinator.test.ts`
  - `tests/server/room_logger_cloud_sync.test.ts`
  - `tests/server/turn_bot_timer_scheduler.test.ts`
  - `tests/server/wss_server_lifecycle.test.ts`

## 2. Planned Changes & LOC Budget
| File | Tier | Baseline LOC | Target LOC | Delta | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/domain/chance_card_handlers.ts` | Tier 1 | 374 | ~250 | -124 | Safe (<= 400) |
| `src/domain/chance_ma_handlers.ts` | Tier 1 | 0 | ~130 | +130 | Safe (<= 400) |
| `tests/domain/chance_ma_handlers.test.ts` | Living Test | 0 | ~140 | +140 | Safe (<= 600) |

## 3. Implementation Steps
- **Step 1 (Scaffold Stub)**: Create `src/domain/chance_ma_handlers.ts` with stubbed `handleMaForce`, `handleSwapProject`, and `applyCompensatorySubsidy`.
- **Step 2 (Station 1 RED)**: Write `tests/domain/chance_ma_handlers.test.ts` verifying:
  - TC-CMA.01 [UC-CMA/MSS]: Given an opponent owning an unmortgaged C0 property, When `handleMaForce` is invoked by an eligible buyer, Then ownership transfers at 1.2x deed price and balances update.
  - TC-CMA.02 [UC-CMA/A1]: Given no eligible C0 opponent properties, When `handleMaForce` is executed, Then the player receives a fallback subsidy of 800 Tr. from treasury.
  - TC-CMA.03 [UC-CMA/MSS]: Given a human player triggering `handleSwapProject` with eligible targets, When executed within a room, Then a `pendingBuyout` session is staged on the room object.
  - TC-CMA.04 [UC-CMA/MSS]: Given a bot player triggering `handleSwapProject`, When an eligible property is selected, Then immediate purchase occurs without manual modal staging.
- **Step 3 (Station 2 GREEN)**: Implement complete logic in `src/domain/chance_ma_handlers.ts` and import into `src/domain/chance_card_handlers.ts`.
- **Step 4 (Mechanical Gates)**: Run `npm run prefilter` and `node scripts/check_scope.mjs`.
- **Step 5 (Station 4 Sentinel)**: Run `npm run sentinel -- --ticket IMP-309 --test tests/domain/chance_ma_handlers.test.ts`.
- **Step 6 (Station 3 & 5 Audits)**: Write `SPEC_REVIEW_IMP-309.md`, `CODE_REVIEW_IMP-309.md`, run `npm run report -- IMP-309`.

---

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `domain-economy`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn bộ nhớ/timer, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong it(), và kiểm tra tính toán bồi hoàn Kho Bạc.

---

### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-309 --test tests/domain/chance_ma_handlers.test.ts
```
Mục tiêu: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).

---

### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
Lệnh xác thực:
```bash
npm run report -- IMP-309
node scripts/check_evidence.mjs IMP-309
```
