# Plan IMP-318: Off-Turn Debtor Downgrade Bug Fix

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-318`
- **Subsystem**: `server-network` (Tier 1 Server & Property Insolvency Orchestration)
- **pureLogicWaiver**: true (Server pure domain/network logic, 0 client/3D/UI footprint)
- **Problem Statement**: When a player enters `InsolvencyPhase` outside their own turn (e.g. during an opponent's turn such as `bot_4` rolling dice and triggering `MC_MEGA_CONCERT` rent on cell 26), `room.currentPlayerIndex` remains pointing to the current turn player (`bot_4`), while the debtor is tracked in `room.pendingInsolvencyDebtorId` (e.g. `'p1'`). In `src/server/room_manager.ts`, `handleDowngrade` retrieves the player via `this.getActivePlayer(ctx?.room, playerId)`. Because `getActivePlayerFn` strictly enforces `room.players[room.currentPlayerIndex]?.id === playerId`, it returns `undefined` for the off-turn debtor. Consequently:
  1. Manual downgrades via `INTENT_DOWNGRADE` are rejected with `INVALID_PHASE`.
  2. Automated recovery in `executeInsolvencyAfkRecovery` -> `downgradeUntilSolvent` silently fails on every single property, preventing any building downgrade (C3/C2/C1 -> C0).
  3. Because properties with buildings cannot be mortgaged under Monopoly rules, only unbuilt land can be mortgaged, yielding insufficient funds.
  4. The player is unjustly declared bankrupt via `INTENT_BANKRUPTCY`, liquidating entire real estate portfolios to the bank.
- **Architectural Solution**:
  1. In `src/server/room_property_coordinator.ts`, update `coordDowngrade` to resolve `effectivePlayer` from `player ?? (ctx.room.phase === TurnPhase.InsolvencyPhase && ctx.room.pendingInsolvencyDebtorId ? ctx.room.players.find((p) => p.id === ctx.room.pendingInsolvencyDebtorId) : undefined)`.
  2. In `src/server/room_manager.ts`, update `handleDowngrade` to resolve debtor player during `InsolvencyPhase` if `getActivePlayer` returns undefined.
  3. Verify that `executeInsolvencyAfkRecovery` and `downgradeUntilSolvent` can downgrade buildings for off-turn debtors, fully clearing debt and avoiding unjust bankruptcy.
- **Direct Scope**:
  - `src/server/room_property_coordinator.ts`
  - `src/server/room_manager.ts`
  - `tests/server/imp318_off_turn_debtor_downgrade.test.ts` (New)
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
  - `src/server/room_trade_coordinator.ts`
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
  - `tests/server/room_trade_coordinator.test.ts`
  - `tests/server/turn_bot_timer_scheduler.test.ts`
  - `tests/server/turn_loop_maintenance.test.ts`
  - `tests/server/wss_server_lifecycle.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/room_property_coordinator.ts` | Tier 1 (Domain/Server/Logic) | 164 | ~175 | +11 | <= 400 | ✔️ Safe |
| `src/server/room_manager.ts` | Tier 1 (Domain/Server/Logic) | 349 | ~353 | +4 | <= 400 | ⚠️ Warning (353 >= 300) |
| `tests/server/imp318_off_turn_debtor_downgrade.test.ts` | Living Test | 0 | ~180 | +180 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/server/imp318_off_turn_debtor_downgrade.test.ts` (Tệp mới)

Test Specifications:
- TC-DOW-OTD.01 [UC-DOW/MSS]: Given player p1 is in InsolvencyPhase as pendingInsolvencyDebtorId during bot_4 turn, When calling handleDowngrade on cell 19, Then successfully downgrades cell 19 from C3 to C2 and refunds building cost to p1 balance.
- TC-DOW-OTD.02 [UC-DOW/MSS]: Given player p1 has negative balance of -3406 with properties at C3, When executeInsolvencyAfkRecovery is invoked outside their turn, Then downgradeUntilSolvent successfully downgrades buildings until p1 balance >= 0, clearing insolvency state without bankruptcy.
- TC-DOW-OTD.03 [UC-DOW/A1]: Given room in InsolvencyPhase with debtor p1, When a non-debtor player bot_2 attempts handleDowngrade, Then request is rejected with NOT_YOUR_TURN.
- TC-DOW-OTD.04 [UC-DOW/A2]: Given active turn player during normal PropertyManagement phase, When calling handleDowngrade, Then maintains standard single-step downgrade behavior preserving existing contracts.
- TC-DOW-OTD.05 [UC-DOW/A3]: Given undefined room context, When coordDowngrade is called, Then returns failure with INVALID_ROOM reason.

### Station 2: Implementation (GREEN)

#### Task 2.1: Update `coordDowngrade` in `room_property_coordinator.ts`
**Target physical file**: `src/server/room_property_coordinator.ts`

```typescript
<<<<
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const res = handleDowngrade(player, ctx.room.phase, cellIndex, ctx.reg, ctx.sm, roomCode, options, ctx.room);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase && player && player.balance >= 0) {
    delete ctx.room.pendingInsolvencyCreditorId;
    delete ctx.room.pendingInsolvencyDebtorId;
    ctx.room.phase = TurnPhase.PropertyManagement;
  }
  return res;
====
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const effectivePlayer = player ?? (
    ctx.room.phase === TurnPhase.InsolvencyPhase && ctx.room.pendingInsolvencyDebtorId
      ? ctx.room.players.find((p) => p.id === ctx.room.pendingInsolvencyDebtorId)
      : undefined
  );
  const res = handleDowngrade(effectivePlayer, ctx.room.phase, cellIndex, ctx.reg, ctx.sm, roomCode, options, ctx.room);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase && effectivePlayer && effectivePlayer.balance >= 0) {
    delete ctx.room.pendingInsolvencyCreditorId;
    delete ctx.room.pendingInsolvencyDebtorId;
    ctx.room.phase = TurnPhase.PropertyManagement;
  }
  return res;
>>>>
```

#### Task 2.2: Update `handleDowngrade` in `room_manager.ts`
**Target physical file**: `src/server/room_manager.ts`

```typescript
<<<<
  handleDowngrade(roomCode: string, playerId: string, cellIndex: number, options?: import('../domain/property_upgrade.js').DowngradeOptions) { const ctx = this.getContext(roomCode); return coordDowngrade(ctx, this.getActivePlayer(ctx?.room, playerId), cellIndex, roomCode, options); }
====
  handleDowngrade(roomCode: string, playerId: string, cellIndex: number, options?: import('../domain/property_upgrade.js').DowngradeOptions) {
    const ctx = this.getContext(roomCode);
    const active = this.getActivePlayer(ctx?.room, playerId);
    const p = active ?? (ctx?.room?.phase === TurnPhase.InsolvencyPhase && ctx?.room?.pendingInsolvencyDebtorId === playerId ? ctx?.room?.players.find((pl) => pl.id === playerId) : undefined);
    return coordDowngrade(ctx, p, cellIndex, roomCode, options);
  }
>>>>
```

### Station 3 & 4: Mechanical Verification Checklist
- Run `npm run prefilter -- src/server/room_property_coordinator.ts src/server/room_manager.ts tests/server/imp318_off_turn_debtor_downgrade.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_318_OFF_TURN_DEBTOR_DOWNGRADE_FIX.md`.
- Run `npm run sentinel -- --ticket IMP-318 --test tests/server/imp318_off_turn_debtor_downgrade.test.ts --src src/server/room_property_coordinator.ts`.
- Run `npm run report -- IMP-318`.
