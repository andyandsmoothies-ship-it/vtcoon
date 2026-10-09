# Kế hoạch Tinh gọn: Tách Module Action Dock Helpers Khỏi ui_helpers (IMP-316)

## 1. Bối cảnh & Mục tiêu Kỹ thuật
- **Vấn đề**: `src/client/ui/ui_helpers.ts` hiện tại có độ dài **462 LOC** (trần Tier 2 là <= 500 LOC, dư địa an toàn chỉ còn 38 dòng).
- Tệp này đang gộp nhiều trách nhiệm khác nhau:
  1. Định dạng tiền tệ và thời gian (`formatCurrency`, `formatTimeRemaining`).
  2. Tính toán tài sản và màu ô (`calculatePlayerNetWorth`, `getOwnedColorGroups`).
  3. Quyết định trạng thái nút bấm Dock và ưu tiên thông báo ngữ cảnh (`isRollActionDisabled`, `isEndTurnDisabled`, `resolveEndTurnButtonLabel`, `shouldShowSkipTurnNotice`, `resolveActionDockNotice`).
  4. Đồ họa và 3D shadow map (`resolveShadowMapSize`, `resolveAdaptivePostProcessing`).
  5. Telemetry intent context (`buildIntentTelemetryContext`).
  6. Pacing bot và tên hiển thị (`resolveBotPacingStatus`, `formatShortPlayerName`, `formatLocalizedBotPersonality`).
- **Giải pháp**: Tách phân hệ logic Action Dock và thông báo ngữ cảnh thành `src/client/ui/ui_action_dock_helpers.ts`:
  - `formatCurrency(amount: number)`: Định dạng tiền tệ chuẩn tiếng Việt (dùng chung trong thông báo mua đất).
  - `isRollActionDisabled(params)`: Ràng buộc vô hiệu hóa nút gieo xúc xắc.
  - `isEndTurnDisabled(params)`: Ràng buộc vô hiệu hóa nút kết thúc lượt.
  - `resolveEndTurnButtonLabel(turnPhase, hasRolled, inAudit, isBankrupt)`: Nhãn nút kết thúc lượt theo ngữ cảnh.
  - `shouldShowSkipTurnNotice(turnPhase, hasRolled, inAudit, isMyTurn, isBankrupt)`: Điều kiện hiển thị thông báo bỏ lượt.
  - `resolveActionDockNotice(params)`: Chuỗi ưu tiên độc quyền chip thông báo (`Insolvent > Audit > SkipTurn > BuyOpportunity > BotPacing`).
- **Bảo toàn**: `src/client/ui/ui_helpers.ts` re-export toàn bộ các hàm và types từ `ui_action_dock_helpers.ts`, bảo đảm 100% tương thích ngược cho toàn bộ test suites và UI components.

---

## 2. Phạm vi Tác động & Tệp Tin (Scope Management)

### Direct Scope Files (Phạm vi Trực tiếp)
- `src/client/ui/ui_helpers.ts` (Sửa đổi: re-export từ `ui_action_dock_helpers.ts`, giảm từ 462 xuống ~280 LOC).
- `src/client/ui/ui_action_dock_helpers.ts` (Tạo mới: chứa các hàm và kiểu dữ liệu Action Dock, ~200 LOC).
- `tests/client/ui_action_dock_helpers.test.ts` (Tạo mới: contract tests cho Action Dock helpers, ~160 LOC).

### Baseline Dependencies (78 tệp hiện hữu từ các ticket trước)
- `.agents/agents/adversarial-challenger.md`
- `.agents/agents/code-reviewer.md`
- `.agents/agents/implementer.md`
- `.agents/agents/qa-tester.md`
- `.agents/agents/scout.md`
- `GEMINI.md`
- `docs/domain/gotchas/3d_cinematics.md`
- `scripts/audit_plan.mjs`
- `scripts/audit_plan_rules.mjs`
- `scripts/capture_visual_evidence.mjs`
- `scripts/check_evidence.mjs`
- `scripts/check_loc.mjs`
- `scripts/check_reason_i18n_parity.mjs`
- `scripts/collect_evidence.mjs`
- `scripts/fast_prefilter.mjs`
- `scripts/generate_report.mjs`
- `scripts/lint_slop.mjs`
- `scripts/sentinel_runner.mjs`
- `src/client/3d/adaptive_cinematic_camera.tsx`
- `src/client/3d/camera_state_machine.ts`
- `src/client/3d/cinematic_chase_camera.ts`
- `src/client/3d/pawn_animator.tsx`
- `src/client/audio/sound_engine.ts`
- `src/client/audio/sound_synth_recipes.ts`
- `src/client/network/activity_rent_matcher.ts`
- `src/client/network/activity_tracker.ts`
- `src/client/network/apply_delta.ts`
- `src/client/network/use_game_ws.ts`
- `src/client/store/game_store.ts`
- `src/client/store/game_store_types.ts`
- `src/client/ui/actionable_notification.ts`
- `src/client/ui/modals/auction_modal.tsx`
- `src/client/ui/modals/masterplan_components.tsx`
- `src/domain/bot/bot_engine.ts`
- `src/domain/chance_card_handlers.ts`
- `src/server/logging/persistent_room_logger.ts`
- `src/server/network/turn_orchestrator.ts`
- `src/server/network/wss_server.ts`
- `src/server/room_manager.ts`
- `src/server/room_property_coordinator.ts`
- `src/server/turn_loop.ts`
- `.agents/plans/PLAN_IMP_291_SPATIAL_KINEMATICS_CAMERA.md`
- `.agents/plans/PLAN_IMP_292_DRAMATIC_PACING_AND_DICE_PAN.md`
- `.agents/plans/PLAN_IMP_293_CINEMATIC_FLIGHT_AND_MACRO_PACING.md`
- `.agents/plans/PLAN_IMP_294_SOFT_RETURN_AND_FREE_ROAM_LOCK.md`
- `.agents/plans/PLAN_IMP_295_MODULARIZE_SOUND_SYNTH_RECIPES.md`
- `.agents/plans/PLAN_IMP_296_CAMERA_GESTURE_MODULARIZATION.md`
- `.agents/plans/PLAN_IMP_297_ACTIONABLE_NOTIFICATION_MODULARIZATION.md`
- `.agents/plans/PLAN_IMP_298_GAME_STORE_TYPES_MODULARIZATION.md`
- `.agents/plans/PLAN_IMP_299_SOUND_ENGINE_MODULARIZATION.md`
- `.agents/plans/PLAN_IMP_300_ROOM_LOGGER_MODULARIZATION.md`
- `.agents/plans/PLAN_IMP_301_TURN_BOT_TIMER_SCHEDULER.md`
- `.agents/plans/PLAN_IMP_302_BOT_ACTION_EVALUATOR.md`
- `.agents/plans/PLAN_IMP_303_ACTIVITY_GO_EXTRACTOR.md`
- `.agents/plans/PLAN_IMP_304_APPLY_DELTA_MODALS.md`
- `.agents/plans/PLAN_IMP_305_ROOM_AUCTION_COORDINATOR.md`
- `.agents/plans/PLAN_IMP_306_GAME_STORE_PAWN_ACTIONS.md`
- `.agents/plans/PLAN_IMP_307_WSS_SERVER_LIFECYCLE.md`
- `.agents/plans/PLAN_IMP_308_MASTERPLAN_DISTRICT_CARD.md`
- `.agents/plans/PLAN_IMP_309_CHANCE_MA_HANDLERS.md`
- `.agents/plans/PLAN_IMP_310_TURN_LOOP_MAINTENANCE.md`
- `.agents/plans/PLAN_IMP_311_SINGLE_HOP_PAWN.md`
- `.agents/plans/PLAN_IMP_312_AUCTION_BID_CONTROLS.md`
- `.agents/plans/PLAN_IMP_313_ACTIVITY_AUCTION_TRACKER.md`
- `.agents/plans/PLAN_IMP_314_ROOM_TRADE_COORDINATOR.md`
- `.agents/plans/PLAN_IMP_315_USE_GAME_WS_MODULARIZATION.md`
- `docs/reports/audits/loc_debt_decomposition_master_plan_report.md`
- `docs/reports/improvements/IMP-291-spatial-kinematics-camera_report.md`
- `docs/reports/improvements/IMP-292-dramatic-pacing-and-dice-pan_report.md`
- `docs/reports/improvements/IMP-293-cinematic-flight-and-macro-pacing_report.md`
- `docs/reports/improvements/IMP-294-soft-return-and-free-roam-lock_report.md`
- `docs/reports/improvements/IMP-295-modularize-sound-synth-recipes_report.md`
- `docs/reports/improvements/IMP-296-camera-gesture-modularization_report.md`
- `docs/reports/improvements/IMP-297-actionable-notification-modularization_report.md`
- `docs/reports/improvements/IMP-298-game-store-types-modularization_report.md`
- `docs/reports/improvements/IMP-299-sound-engine-modularization_report.md`
- `docs/reports/improvements/IMP-300-room-logger-modularization_report.md`
- `docs/reports/improvements/IMP-301-turn-bot-timer-scheduler_report.md`
- `docs/reports/improvements/IMP-302-bot-action-evaluator_report.md`
- `docs/reports/improvements/IMP-303-activity-go-extractor_report.md`
- `docs/reports/improvements/IMP-304-apply-delta-modals_report.md`
- `docs/reports/improvements/IMP-305-room-auction-coordinator_report.md`
- `docs/reports/improvements/IMP-306-game-store-pawn-actions_report.md`
- `docs/reports/improvements/IMP-307-wss-server-lifecycle_report.md`
- `docs/reports/improvements/IMP-308-masterplan-district-card_report.md`
- `docs/reports/improvements/IMP-309-chance-ma-handlers_report.md`
- `docs/reports/improvements/IMP-310-turn-loop-maintenance_report.md`
- `docs/reports/improvements/IMP-311-single-hop-pawn_report.md`
- `docs/reports/improvements/IMP-312-auction-bid-controls_report.md`
- `docs/reports/improvements/IMP-313-activity-auction-tracker_report.md`
- `docs/reports/improvements/IMP-314-room-trade-coordinator_report.md`
- `docs/reports/improvements/IMP-315-use-game-ws-modularization_report.md`
- `scripts/dispatch_gotchas.mjs`
- `src/client/3d/camera_kinematic_helpers.ts`
- `src/client/3d/camera_location_beacon.tsx`
- `src/client/3d/camera_soft_return.ts`
- `src/client/3d/cinematic_spline_flyby.ts`
- `src/client/3d/single_hop_pawn.tsx`
- `src/client/3d/use_camera_gestures.ts`
- `src/client/audio/sound_engine_context.ts`
- `src/client/audio/synth_recipes_ambient.ts`
- `src/client/audio/synth_recipes_gameplay.ts`
- `src/client/audio/synth_recipes_ui.ts`
- `src/client/network/activity_auction_tracker.ts`
- `src/client/network/activity_go_extractor.ts`
- `src/client/network/apply_delta_modals.ts`
- `src/client/network/game_ws_dispatcher.ts`
- `src/client/store/game_store_pawn_actions.ts`
- `src/client/store/game_store_state_types.ts`
- `src/client/store/game_store_subtypes.ts`
- `src/client/ui/actionable_notification_gameplay.ts`
- `src/client/ui/actionable_notification_map.ts`
- `src/client/ui/actionable_notification_system.ts`
- `src/client/ui/modals/auction_bid_controls.tsx`
- `src/client/ui/modals/masterplan_district_card.tsx`
- `src/domain/bot/bot_action_evaluator.ts`
- `src/domain/chance_ma_handlers.ts`
- `src/server/logging/room_logger_cloud_sync.ts`
- `src/server/network/turn_bot_timer_scheduler.ts`
- `src/server/network/wss_server_lifecycle.ts`
- `src/server/room_auction_coordinator.ts`
- `src/server/room_trade_coordinator.ts`
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
- `tests/client/game_ws_dispatcher.test.ts`
- `tests/client/masterplan_district_card.test.ts`
- `tests/client/single_hop_pawn.test.ts`
- `tests/client/sound_engine_modular.test.ts`
- `tests/client/sound_synth_recipes_modular.test.ts`
- `tests/client/spatial_kinematics_camera.test.ts`
- `tests/domain/bot_action_evaluator.test.ts`
- `tests/domain/chance_ma_handlers.test.ts`
- `tests/server/room_auction_coordinator.test.ts`
- `tests/server/room_logger_cloud_sync.test.ts`
- `tests/server/room_trade_coordinator.test.ts`
- `tests/server/turn_bot_timer_scheduler.test.ts`
- `tests/server/turn_loop_maintenance.test.ts`
- `tests/server/wss_server_lifecycle.test.ts`

---

## 3. Ngân sách Dòng mã (LOC Budget)

| Tệp tin | Phân hạng | Baseline LOC | Target LOC | Biến thiên | Giới hạn trần | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/ui/ui_helpers.ts` | Tier 2 | 462 | ~280 | -182 | <= 500 | ✔️ Safe |
| `src/client/ui/ui_action_dock_helpers.ts` | Tier 2 | 0 | ~200 | +200 | <= 500 | ✔️ Safe |
| `tests/client/ui_action_dock_helpers.test.ts` | Living Tests | 0 | ~160 | +160 | <= 600 | ✔️ Safe |

---

## 4. Chi tiết Kế hoạch Triển khai (Station Roadmap)

### Trạm 1: Scaffolding Type-Safe Stub & Semantic Behavioral RED
- Tạo stub type-safe `src/client/ui/ui_action_dock_helpers.ts` với các giá trị trả về cố ý sai lệch (`formatCurrency` trả về `""`, `isRollActionDisabled` trả về `false`, `resolveEndTurnButtonLabel` trả về `""`, `resolveActionDockNotice` trả về `null`).
- Viết test suite `tests/client/ui_action_dock_helpers.test.ts` kiểm thử:
  - `formatCurrency`: số âm, số nguyên, phân cách hàng nghìn `.` chuẩn VN.
  - `isRollActionDisabled`: AuctionPhase, PropertyManagement, inAudit, rolling, bankrupt.
  - `isEndTurnDisabled`: myTurn, rolling, insolvent, bankrupt.
  - `resolveEndTurnButtonLabel`: khán giả phá sản, mất lượt, hết lượt tiêu chuẩn.
  - `shouldShowSkipTurnNotice`: người chơi bị bão duyên hải tạm dừng gieo xúc xắc.
  - `resolveActionDockNotice`: chuỗi ưu tiên độc quyền Insolvent > Audit > SkipTurn > BuyOpportunity > BotPacing; kiểm tra kẹp trần mobileText <= 45 ký tự.
- Chạy Vitest xác nhận lỗi Runtime Assertion (`Semantic Behavioral RED`), bảo đảm không fail loader.

### Trạm 2: GREEN Implementation & Tích hợp ui_helpers
- Triển khai toàn bộ mã logic trong `src/client/ui/ui_action_dock_helpers.ts`.
- Cập nhật `src/client/ui/ui_helpers.ts` re-export các hàm và kiểu từ `ui_action_dock_helpers.ts`.
- Chạy kiểm thử xác nhận 100% tests GREEN.

### Trạm 2.5: Fast Pre-Filter & Scope Gate
- `npm run prefilter -- src/client/ui/ui_helpers.ts src/client/ui/ui_action_dock_helpers.ts tests/client/ui_action_dock_helpers.test.ts`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_316_UI_ACTION_DOCK_HELPERS.md`

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Reviews)
- **Trạm 3.1 (Spec Gate)**: Soạn `.agents/audit/SPEC_REVIEW_IMP-316.md`.
- **Trạm 3.2 (Architecture Gate)**: Soạn `.agents/audit/CODE_REVIEW_IMP-316.md`.

### Trạm 4: Kiểm Thử Đột Biến (Chaos Sentinel)
- Chạy Sentinel trên tệp mới:
  ```bash
  npm run sentinel -- --ticket IMP-316 --test tests/client/ui_action_dock_helpers.test.ts --src src/client/ui/ui_action_dock_helpers.ts
  ```
- Tiêu diệt 100% mutants (0 mutants survived).

### Trạm 5: Nghiệm Thu & Báo Cáo
- `npm run report -- IMP-316`
- `node scripts/check_evidence.mjs IMP-316`
