# Kế hoạch Tinh gọn: Tách Module Game WS Dispatcher Khỏi use_game_ws (IMP-315)

## 1. Bối cảnh & Mục tiêu Kỹ thuật
- **Vấn đề**: `src/client/network/use_game_ws.ts` hiện tại có độ dài **365 LOC** (trần Tier 1 là <= 400 LOC, dư địa an toàn chỉ còn 35 dòng).
- Hook này đang gánh nhiều trách nhiệm pha trộn:
  1. Quản lý trạng thái và vòng đời WebSocket React hook (`isConnected`, `lastTick`, `reconnectTimer`, `watchdog`).
  2. Logic phân giải URL động (HTTPS/WSS/localDev/customUrl).
  3. Tính toán độ trễ Reconnect Exponential Backoff.
  4. Đóng gói và phát đi các thông điệp mạng (Intent, Emote, Generic Message, Resync Request) kèm theo ghi nhận Telemetry và Audit Log.
- **Giải pháp**: Tách module thuần tính toán và phát thông điệp mạng thành `src/client/network/game_ws_dispatcher.ts`:
  - `WebSocketLike`: Interface định nghĩa socket trừu tượng.
  - `resolveWsUrl(url?: string, roomCode?: string)`: Phân giải URL linh hoạt giữa môi trường local dev và production.
  - `computeReconnectBackoff(attempts: number, baseMs?: number, maxMs?: number)`: Tính độ trễ backoff số học.
  - `dispatchWsIntent(socket, params)`: Đóng gói INTENT, thu thập Telemetry context, ghi log kiểm toán và truyền tải qua socket.
  - `dispatchWsEmote(socket, params)`: Đóng gói và phát EMOTE.
  - `dispatchWsMessage(socket, msg, defaultRoomCode)`: Phát thông điệp WsClientMessage tùy biến.
  - `dispatchWsResync(socket, params)`: Phát thông điệp INTENT_REQUEST_RESYNC và kích hoạt watchdog.
- **Bảo toàn**: Giữ nguyên 100% ngữ nghĩa, API bề mặt của `useGameWs`, tương thích tuyệt đối với các test suites hiện có.

---

## 2. Phạm vi Tác động & Tệp Tin (Scope Management)

### Direct Scope Files (Phạm vi Trực tiếp)
- `src/client/network/use_game_ws.ts` (Sửa đổi: chuyển giao trách nhiệm sang dispatcher, giảm từ 365 xuống ~240 LOC).
- `src/client/network/game_ws_dispatcher.ts` (Tạo mới: chứa các hàm phân giải và dispatch thông điệp mạng, ~120 LOC).
- `tests/client/game_ws_dispatcher.test.ts` (Tạo mới: contract tests cho dispatcher, ~140 LOC).

### Baseline Dependencies (75 tệp hiện hữu từ các ticket trước)
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
| `src/client/network/use_game_ws.ts` | Tier 1 | 365 | ~240 | -125 | <= 400 | ✔️ Safe |
| `src/client/network/game_ws_dispatcher.ts` | Tier 1 | 0 | ~130 | +130 | <= 400 | ✔️ Safe |
| `tests/client/game_ws_dispatcher.test.ts` | Living Tests | 0 | ~140 | +140 | <= 600 | ✔️ Safe |

---

## 4. Chi tiết Kế hoạch Triển khai (Station Roadmap)

### Trạm 1: Scaffolding Type-Safe Stub & Semantic Behavioral RED
- Tạo stub type-safe `src/client/network/game_ws_dispatcher.ts` trả về kết quả sai lệch có chủ đích (ví dụ: `resolveWsUrl` trả về chuỗi rỗng `""`, `computeReconnectBackoff` trả về `-1`, `dispatchWsIntent` trả về `false`).
- Viết test suite `tests/client/game_ws_dispatcher.test.ts` kiểm tra:
  - `resolveWsUrl`: xử lý url chỉ định, fallback localhost, dev host, production wss.
  - `computeReconnectBackoff`: exponential growth và trần maxDelay.
  - `dispatchWsIntent`: kiểm tra readyState !== 1 trả về false, readyState === 1 ghi nhận telemetry, audit log và gọi `socket.send` với JSON payload hợp lệ.
  - `dispatchWsEmote`: gửi message EMOTE định dạng chuẩn.
  - `dispatchWsMessage`: gửi thông điệp WsClientMessage kèm fallback roomCode.
  - `dispatchWsResync`: gửi INTENT_REQUEST_RESYNC và kích hoạt callback `onWatchdogStart`.
- Chạy Vitest xác nhận lỗi Runtime Assertion (`Semantic Behavioral RED`), tuyệt đối không fail do loader crash.

### Trạm 2: GREEN Implementation & Tích hợp use_game_ws
- Hoàn thiện mã nguồn thực thi đầy đủ trong `src/client/network/game_ws_dispatcher.ts`.
- Cập nhật `src/client/network/use_game_ws.ts` để gọi các hàm từ `game_ws_dispatcher.ts`.
- Chạy lại toàn bộ test suites (`game_ws_dispatcher.test.ts`, `use_game_ws_handshake.test.ts`, `net04_client_reconnect.test.ts`, `imp182_mobile_inactivity_and_reconnect_unfreeze.test.ts`).

### Trạm 2.5: Fast Pre-Filter & Scope Gate
- `npm run prefilter -- src/client/network/use_game_ws.ts src/client/network/game_ws_dispatcher.ts tests/client/game_ws_dispatcher.test.ts`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_315_USE_GAME_WS_MODULARIZATION.md`

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Reviews)
- **Trạm 3.1 (Spec Gate)**: Soạn `.agents/audit/SPEC_REVIEW_IMP-315.md` kiểm tra độ trung thực mục tiêu, không phát sinh scope ngoài client/network.
- **Trạm 3.2 (Architecture Gate)**: Soạn `.agents/audit/CODE_REVIEW_IMP-315.md` kiểm tra Zero Dirty Casts, Zero Anti-TIDD, assertion density 1-4 asserts/test, timer/socket cleanup.

### Trạm 4: Kiểm Thử Đột Biến (Chaos Sentinel)
- Chạy Sentinel trên tệp mới trích xuất:
  ```bash
  npm run sentinel -- --ticket IMP-315 --test tests/client/game_ws_dispatcher.test.ts --src src/client/network/game_ws_dispatcher.ts
  ```
- Yêu cầu: Đạt 100% mutants bị tiêu diệt (0 mutants survived).

### Trạm 5: Nghiệm Thu & Xuất Bản Báo Cáo
- Chạy kiểm toán bằng chứng: `node scripts/check_evidence.mjs IMP-315`
- Xuất bản báo cáo hoàn tất: `npm run report -- IMP-315`
