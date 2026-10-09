# Plan IMP-314: Modularize Room Trade Coordinator

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-314`
- **Subsystem**: `server-network` (Tier 1 Server & Trade Session Orchestration)
- **Problem Statement**: `src/server/room_property_coordinator.ts` is 366 LOC (Tier 1 ceiling <= 400 LOC, warning zone > 300 LOC, only 34 lines headroom). P2P trade session orchestration, offer validations, bot trade modal triggers, timeouts, rejections, and responses are bundled with mortgage, liquidation, and bankruptcy coordination.
- **Architectural Solution**: Extract `src/server/room_trade_coordinator.ts` exporting `isRoomQuiescentForTrade`, `isCellLockedInPendingTrade`, `coordTrade`, `coordTradeOffer`, and `coordRespondTradeOffer`. Re-export seamlessly from `src/server/room_property_coordinator.ts` to maintain 100% backward compatibility while reducing LOC safely under 180.
- **Direct Scope**:
  - `src/server/room_property_coordinator.ts`
  - `src/server/room_trade_coordinator.ts` (New)
  - `tests/server/room_trade_coordinator.test.ts` (New)
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
  - `src/client/network/activity_auction_tracker.ts`
  - `src/client/network/activity_go_extractor.ts`
  - `src/client/network/activity_rent_matcher.ts`
  - `src/client/network/activity_tracker.ts`
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
  - `tests/client/activity_auction_tracker.test.ts`
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
| `src/server/room_property_coordinator.ts` | Tier 1 | 366 | ~175 | -191 | Safe (<= 400) |
| `src/server/room_trade_coordinator.ts` | Tier 1 | 0 | ~195 | +195 | Safe (<= 400) |
| `tests/server/room_trade_coordinator.test.ts` | Living Test | 0 | ~220 | +220 | Safe (<= 600) |

## 3. Implementation Steps
- **Step 1 (Scaffold Stub)**: Create `src/server/room_trade_coordinator.ts` with typed stubs for `isRoomQuiescentForTrade`, `isCellLockedInPendingTrade`, `coordTrade`, `coordTradeOffer`, and `coordRespondTradeOffer`.
- **Step 2 (Station 1 RED)**: Write `tests/server/room_trade_coordinator.test.ts` verifying:
  - TC-RTC-QUI.01 [UC-RTC/MSS]: Given room in WaitingRoll phase, When checking quiescence, Then returns true.
  - TC-RTC-QUI.02 [UC-RTC/MSS]: Given room in AuctionPhase or with active auction, When checking quiescence, Then returns false.
  - TC-RTC-LCK.01 [UC-RTC/MSS]: Given pending trade offer on cell 5, When checking cell 5 lock, Then returns true.
  - TC-RTC-TRD.01 [UC-RTC/MSS]: Given undefined room context, When coordTrade is invoked, Then returns failure with INVALID_ROOM reason.
  - TC-RTC-TRD.02 [UC-RTC/MSS]: Given active trade already pending in room, When coordTrade is invoked, Then returns failure with TRADE_ALREADY_PENDING reason.
  - TC-RTC-RSP.01 [UC-RTC/MSS]: Given invalid offerId not in pending trade manager, When coordRespondTradeOffer is invoked, Then returns failure with INVALID_OFFER_ID reason.
- **Step 3 (Station 2 GREEN)**: Implement complete trade functions in `src/server/room_trade_coordinator.ts` and delegate seamlessly from `src/server/room_property_coordinator.ts`.
- **Step 4 (Mechanical Gates)**: Run `npm run prefilter` and `node scripts/check_scope.mjs`.
- **Step 5 (Station 4 Sentinel)**: Run `npm run sentinel -- --ticket IMP-314 --test tests/server/room_trade_coordinator.test.ts --src src/server/room_trade_coordinator.ts`.
- **Step 6 (Station 3 Audits & Handoff)**: Conduct Spec & Code Reviews, generate report via `npm run report -- IMP-314`, and audit evidence.
