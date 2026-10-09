# Plan IMP-313: Modularize Activity Auction Tracker

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-313`
- **Subsystem**: `client-net` (Tier 1 Network & Event Tracking)
- **Problem Statement**: `src/client/network/activity_tracker.ts` is 366 LOC (Tier 1 ceiling <= 400 LOC, warning zone > 300 LOC). Auction activity detection with hammer win logging, bot decline detection, bid caching, and state transitions are mixed into the general activity facade.
- **Architectural Solution**: Extract `src/client/network/activity_auction_tracker.ts` exporting `detectAuctionActivities` and `resetAuctionActivityTracker`. Re-export seamlessly from `src/client/network/activity_tracker.ts` to maintain 100% backward compatibility while reducing LOC safely under 280.
- **Direct Scope**:
  - `src/client/network/activity_tracker.ts`
  - `src/client/network/activity_auction_tracker.ts` (New)
  - `tests/client/activity_auction_tracker.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `src/client/3d/adaptive_cinematic_camera.tsx`
  - `src/client/3d/camera_kinematic_helpers.ts`
  - `src/client/3d/camera_location_beacon.tsx`
  - `src/client/3d/camera_soft_return.ts`
  - `src/client/3d/camera_state_machine.ts`
  - `src/client/3d/cinematic_chase_camera.ts`
  - `src/client/3d/cinematic_spline_flyby.ts`
  - `src/client/3d/pawn_animator.tsx`
  - `src/client/3d/single_hop_pawn.tsx`
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
  - `src/client/ui/modals/auction_bid_controls.tsx`
  - `src/client/ui/modals/auction_modal.tsx`
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
  - `src/server/turn_loop.ts`
  - `src/server/turn_loop_maintenance.ts`
  - `tests/client/actionable_notification_modular.test.ts`
  - `tests/client/activity_go_extractor.test.ts`
  - `tests/client/apply_delta_modals.test.ts`
  - `tests/client/auction_bid_controls.test.ts`
  - `tests/client/camera_gestures.test.ts`
  - `tests/client/camera_soft_return_and_beacon.test.ts`
  - `tests/client/cinematic_spline_flyby.test.ts`
  - `tests/client/dramatic_pacing_camera.test.ts`
  - `tests/client/game_store_pawn_actions.test.ts`
  - `tests/client/game_store_types_modular.test.ts`
  - `tests/client/masterplan_district_card.test.ts`
  - `tests/client/single_hop_pawn.test.ts`
  - `tests/client/sound_engine_modular.test.ts`
  - `tests/client/sound_synth_recipes_modular.test.ts`
  - `tests/client/spatial_kinematics_camera.test.ts`
  - `tests/domain/bot_action_evaluator.test.ts`
  - `tests/domain/chance_ma_handlers.test.ts`
  - `tests/server/room_auction_coordinator.test.ts`
  - `tests/server/room_logger_cloud_sync.test.ts`
  - `tests/server/turn_bot_timer_scheduler.test.ts`
  - `tests/server/turn_loop_maintenance.test.ts`
  - `tests/server/wss_server_lifecycle.test.ts`

## 2. Planned Changes & LOC Budget
| File | Tier | Baseline LOC | Target LOC | Delta | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/network/activity_tracker.ts` | Tier 1 | 366 | ~275 | -91 | Safe (<= 400) |
| `src/client/network/activity_auction_tracker.ts` | Tier 1 | 0 | ~100 | +100 | Safe (<= 400) |
| `tests/client/activity_auction_tracker.test.ts` | Living Test | 0 | ~160 | +160 | Safe (<= 600) |

## 3. Implementation Steps
- **Step 1 (Scaffold Stub)**: Create `src/client/network/activity_auction_tracker.ts` with stubs for `detectAuctionActivities` and `resetAuctionActivityTracker`.
- **Step 2 (Station 1 RED)**: Write `tests/client/activity_auction_tracker.test.ts` verifying:
  - TC-AAT-WIN.01 [UC-AAT/MSS]: Given `delta.auction === null` and prior `lastAuctionBid`, When `detectAuctionActivities` is called, Then logs hammer win activity entry and clears bid cache.
  - TC-AAT-DEC.01 [UC-AAT/MSS]: Given bot `declinedPlayerId` opening new auction, When `detectAuctionActivities` is called, Then logs decline-to-auction activity.
  - TC-AAT-BID.01 [UC-AAT/MSS]: Given a new valid bid in `delta.auction`, When `detectAuctionActivities` is called, Then logs bid activity entry and updates `lastAuctionBid`.
  - TC-AAT-DUP.01 [UC-AAT/MSS]: Given identical auction state matching `lastAuctionBid`, When `detectAuctionActivities` is called, Then returns empty array (deduplication).
  - TC-AAT-RST.01 [UC-AAT/MSS]: Given populated bid state, When `resetAuctionActivityTracker` is called, Then clears `lastAuctionBid`.
- **Step 3 (Station 2 GREEN)**: Implement complete functions in `src/client/network/activity_auction_tracker.ts` and re-export in `src/client/network/activity_tracker.ts`.
- **Step 4 (Mechanical Gates)**: Run `npm run prefilter` and `node scripts/check_scope.mjs`.
- **Step 5 (Station 4 Sentinel)**: Run `npm run sentinel -- --ticket IMP-313 --test tests/client/activity_auction_tracker.test.ts`.
- **Step 6 (Station 3 & 5 Audits)**: Write `SPEC_REVIEW_IMP-313.md`, `CODE_REVIEW_IMP-313.md`, run `npm run report -- IMP-313`.

---

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `client-net`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn bộ nhớ/timer, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong it(), và kiểm tra Poka-Yoke affordance.

---

### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-313 --test tests/client/activity_auction_tracker.test.ts
```
Mục tiêu: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).

---

### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
Lệnh xác thực:
```bash
npm run report -- IMP-313
node scripts/check_evidence.mjs IMP-313
```
