# Plan IMP-307: Modularize WSS Server Lifecycle, Room Termination and Heartbeat Sweep

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-307`
- **Subsystem**: `server-network` (Tier 1 Core Server Architecture)
- **Problem Statement**: `src/server/network/wss_server.ts` is 377 LOC (Tier 1 ceiling <= 400 LOC, only 23 lines headroom). Server lifecycle, periodic heartbeat sweep, room termination, game-over summary broadcasts, and server shutdown routines are clustered inside the main server class.
- **Architectural Solution**: Extract `src/server/network/wss_server_lifecycle.ts` exporting `performHeartbeatSweep`, `closeRoomWithCleanup`, `broadcastGameOverSummary`, and `shutdownWssServer`. Preserve 100% room cleanup ordering, session eviction, grace period timeouts, and socket close codes.
- **Direct Scope**:
  - `src/server/network/wss_server.ts`
  - `src/server/network/wss_server_lifecycle.ts` (New)
  - `tests/server/wss_server_lifecycle.test.ts` (New)
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

## 2. Planned Changes & LOC Budget
| File | Tier | Baseline LOC | Target LOC | Delta | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/server/network/wss_server.ts` | Tier 1 | 377 | ~250 | -127 | Safe (<= 400) |
| `src/server/network/wss_server_lifecycle.ts` | Tier 1 | 0 | ~130 | +130 | Safe (<= 400) |
| `tests/server/wss_server_lifecycle.test.ts` | Living Test | 0 | ~140 | +140 | Safe (<= 600) |

## 3. Implementation Steps
- **Step 1 (Scaffold Stub)**: Create `src/server/network/wss_server_lifecycle.ts` with stubbed lifecycle functions.
- **Step 2 (Station 1 RED)**: Write `tests/server/wss_server_lifecycle.test.ts` with explicit behavioral test specifications:
  - TC-WLC.01 [UC-WLC/MSS]: Given an active game room with connected sockets, When `closeRoomWithCleanup` is invoked, Then room resources, session registrations, and turn timers are systematically destroyed and admin manager is notified.
  - TC-WLC.02 [UC-WLC/A1]: Given a room already in the process of closing, When `closeRoomWithCleanup` is re-entered concurrently, Then early exit is triggered to prevent duplicate cleanup cycles.
  - TC-WLC.03 [UC-WLC/MSS]: Given a concluded game room, When `broadcastGameOverSummary` is executed, Then the game over payload with calculated rankings is broadcast and room cleanup is triggered.
  - TC-WLC.04 [UC-WLC/MSS]: Given registered player sockets, When `performHeartbeatSweep` runs, Then PING messages are dispatched to all bound sockets and stale grace period sessions are terminated.
- **Step 3 (Station 2 GREEN)**: Implement complete logic in `src/server/network/wss_server_lifecycle.ts` and delegate calls from `WssServer`.
- **Step 4 (Mechanical Gates)**: Run `npm run prefilter` and `node scripts/check_scope.mjs`.
- **Step 5 (Station 4 Sentinel)**: Run `npm run sentinel -- --ticket IMP-307 --test tests/server/wss_server_lifecycle.test.ts`.
- **Step 6 (Station 3 & 5 Audits)**: Write `SPEC_REVIEW_IMP-307.md`, `CODE_REVIEW_IMP-307.md`, run `npm run report -- IMP-307`.

---

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `server-network`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn bộ nhớ/timer, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong it(), và kiểm tra teardown promise handling.

---

### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-307 --test tests/server/wss_server_lifecycle.test.ts
```
Mục tiêu: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).

---

### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
Lệnh xác thực:
```bash
npm run report -- IMP-307
node scripts/check_evidence.mjs IMP-307
```
