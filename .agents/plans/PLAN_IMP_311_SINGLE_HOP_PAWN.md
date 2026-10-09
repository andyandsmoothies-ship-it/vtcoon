# Plan IMP-311: Modularize Single Hop Pawn & Emote Bubble Presentation

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-311`
- **Subsystem**: `client-3d` (Tier 2 3D Graphics & Motion Presentation)
- **Problem Statement**: `src/client/3d/pawn_animator.tsx` is 470 LOC (Tier 2 ceiling <= 500 LOC, only 30 lines headroom). Single hop step animation, kinetic squash and stretch frame loops, emote billboard caching, and basic fallback meshes are all coupled with the master pawn animator and static pawn reaction loops.
- **Architectural Solution**: Extract `src/client/3d/single_hop_pawn.tsx` exporting `SingleHopPawn`, `SingleHopProps`, `PawnMesh`, `PawnEmoteBubble`, `clearEmoteCanvasCache`, and `emoteCanvasCache`. Preserve 100% kinetic squash-and-stretch formulas, landing impact audio triggers, and texture lifecycle cleanup.
- **Direct Scope**:
  - `src/client/3d/pawn_animator.tsx`
  - `src/client/3d/single_hop_pawn.tsx` (New)
  - `tests/client/single_hop_pawn.test.ts` (New)
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
  - `src/server/turn_loop_maintenance.ts`
  - `src/server/network/wss_server.ts`
  - `src/server/network/wss_server_lifecycle.ts`
  - `src/server/room_auction_coordinator.ts`
  - `src/server/room_manager.ts`
  - `src/server/turn_loop.ts`
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
  - `tests/server/turn_loop_maintenance.test.ts`
  - `tests/server/wss_server_lifecycle.test.ts`

## 2. Planned Changes & LOC Budget
| File | Tier | Baseline LOC | Target LOC | Delta | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/3d/pawn_animator.tsx` | Tier 2 | 470 | ~310 | -160 | Safe (<= 500) |
| `src/client/3d/single_hop_pawn.tsx` | Tier 2 | 0 | ~175 | +175 | Safe (<= 500) |
| `tests/client/single_hop_pawn.test.ts` | Living Test | 0 | ~180 | +180 | Safe (<= 600) |

## 3. Implementation Steps
- **Step 1 (Scaffold Stub)**: Create `src/client/3d/single_hop_pawn.tsx` with stubs for `SingleHopPawn`, `PawnMesh`, `PawnEmoteBubble`, `clearEmoteCanvasCache`, and `emoteCanvasCache`.
- **Step 2 (Station 1 RED)**: Write `tests/client/single_hop_pawn.test.ts` verifying:
  - TC-SHP-HOP.01 [UC-SHP/MSS]: Given `fromCell === toCell`, When `SingleHopPawn` is rendered, Then immediately invokes `onHopComplete` callback.
  - TC-SHP-HOP.02 [UC-SHP/MSS]: Given `SingleHopPawn` with `slotIndex`, When rendered, Then mounts `LuxuryPawnModel` with fallback.
  - TC-SHP-EMOTE.01 [UC-SHP/MSS]: Given `PawnEmoteBubble` with valid emote ID, When mounted, Then creates billboard texture and caches it in `emoteCanvasCache`.
  - TC-SHP-CACHE.01 [UC-SHP/MSS]: Given cached billboard textures in `emoteCanvasCache`, When `clearEmoteCanvasCache` is called, Then invokes `dispose()` and empties cache map.
- **Step 3 (Station 2 GREEN)**: Implement complete components in `src/client/3d/single_hop_pawn.tsx` and import/re-export in `src/client/3d/pawn_animator.tsx`.
- **Step 4 (Mechanical Gates)**: Run `npm run prefilter` and `node scripts/check_scope.mjs`.
- **Step 5 (Station 4 Sentinel)**: Run `npm run sentinel -- --ticket IMP-311 --test tests/client/single_hop_pawn.test.ts`.
- **Step 6 (Station 3 & 5 Audits)**: Write `SPEC_REVIEW_IMP-311.md`, `CODE_REVIEW_IMP-311.md`, run `npm run report -- IMP-311`.

---

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `client-3d`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn bộ nhớ CanvasTexture, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong it(), và R3F Transient Unmount Invariant.

---

### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-311 --test tests/client/single_hop_pawn.test.ts
```
Mục tiêu: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).

---

### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
Lệnh xác thực:
```bash
npm run report -- IMP-311
node scripts/check_evidence.mjs IMP-311
```
