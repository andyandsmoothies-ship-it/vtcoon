# Plan IMP-320: FSM Restoration & Deep Property Coordinator

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-320`
- **Subsystem**: `server-lifecycle` (Tier 1 Server FSM & Property Coordinator)
- **Problem Statement**:
  1. **FSM Phase Corruption**: In `room_property_coordinator.ts`, when a debtor in `InsolvencyPhase` recovers solvency (`balance >= 0`), the room phase is unconditionally forced to `TurnPhase.PropertyManagement`. If the debtor was an out-of-turn player (e.g. `p1` owing rent during `bot_4`'s turn while `bot_4` is in `ActionPhase`), `bot_4`'s active turn phase is corrupted and overridden, stripping `bot_4`'s buy opportunity.
  2. **Shallow Module & Asymmetric Coordinator Signatures**: `coordDowngrade` previously required callers (`room_manager.ts`) to pre-resolve `Player | undefined`, while `coordMortgage` took `playerId: string` and resolved internally. This asymmetry created a shallow coordinator and leaky abstraction.
- **Architectural Solution**:
  1. Add `preInsolvencyPhase?: TurnPhase;` to `Room` interface augmentation in `src/server/insolvency_manager.ts`.
  2. In `src/server/insolvency_manager.ts`, record `room.preInsolvencyPhase = room.phase;` when transitioning to `TurnPhase.InsolvencyPhase`.
  3. In `src/server/room_property_coordinator.ts`, refactor `coordDowngrade` signature to `(ctx: RoomContext | undefined, playerId: string, cellIndex: number, roomCode: string, options?: DowngradeOptions)`. Internally resolve debtor or turn player, creating a deep module and symmetric API.
  4. When solvency is restored in `coordDowngrade`:
     - If the debtor is the turn player: set `ctx.room.phase = TurnPhase.PropertyManagement;`.
     - If the debtor is out-of-turn: restore `ctx.room.phase = ctx.room.preInsolvencyPhase ?? TurnPhase.PropertyManagement;`.
     - Delete `ctx.room.preInsolvencyPhase;`.
  5. Simplify `room_manager.ts:handleDowngrade` to directly pass `playerId: string` to `coordDowngrade`.
- **Direct Scope**:
  - `src/server/insolvency_manager.ts`
  - `src/server/room_property_coordinator.ts`
  - `src/server/room_manager.ts`
  - `tests/server/imp320_fsm_restoration_and_deep_coordinator.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `src/client/network/activity_rent_matcher.ts`
  - `src/client/ui/transaction_formula.ts`
  - `tests/server/imp318_off_turn_debtor_downgrade.test.ts`
  - `tests/client/imp319_causal_notification_clarity.test.ts`
  - `src/client/network/activity_auction_tracker.ts`
  - `src/client/network/activity_badge_dispatcher.ts`
  - `src/client/network/activity_go_extractor.ts`
  - `src/client/network/activity_tracker.ts`
  - `src/client/network/apply_delta.ts`
  - `src/client/network/apply_delta_modals.ts`
  - `src/client/store/activity_store.ts`
  - `src/client/store/game_store.ts`
  - `src/client/store/game_store_subtypes.ts`
  - `src/client/ui/actionable_notification.ts`
  - `src/client/ui/floating_numbers.tsx`
  - `src/client/ui/transaction_narrative.ts`
  - `tests/client/actionable_notification_modular.test.ts`
  - `tests/client/activity_auction_tracker.test.ts`
  - `tests/client/activity_go_extractor.test.ts`
  - `tests/client/apply_delta_modals.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/insolvency_manager.ts` | Tier 1 (Domain/Server/Logic) | 334 | 338 | +4 | <= 400 | ⚠️ Warning (LOC >= 300) |
| `src/server/room_property_coordinator.ts` | Tier 1 (Domain/Server/Logic) | 164 | 168 | +4 | <= 400 | ✔️ Safe |
| `src/server/room_manager.ts` | Tier 1 (Domain/Server/Logic) | 354 | 351 | -3 | <= 400 | ⚠️ Warning (LOC >= 300) |
| `tests/server/imp320_fsm_restoration_and_deep_coordinator.test.ts` | Living Test | 0 | ~160 | +160 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/server/imp320_fsm_restoration_and_deep_coordinator.test.ts` (Tệp mới)

Test Specifications:
- TC-320.01 [UC-FSM/MSS]: Given turn player bot_4 is in ActionPhase and out-of-turn debtor p1 enters InsolvencyPhase, When p1 downgrades property to balance >= 0, Then room.phase is restored back to ActionPhase preserving bot_4 turn integrity.
- TC-320.02 [UC-FSM/MSS]: Given turn player p1 is in InsolvencyPhase during their own turn, When p1 downgrades property to balance >= 0, Then room.phase transitions to PropertyManagement.
- TC-320.03 [UC-FSM/A1]: Given out-of-turn debtor p1 in InsolvencyPhase during bot_4 turn, When p1 downgrades property to balance >= 0, Then room.preInsolvencyPhase is cleaned up.
- TC-320.04 [UC-COORD/MSS]: Given room in InsolvencyPhase with out-of-turn debtor p1, When coordDowngrade is called directly with playerId 'p1', Then internally resolves debtor and downgrades successfully.
- TC-320.05 [UC-COORD/A2]: Given coordDowngrade called, When non-existent playerId 'non_existent' is passed, Then returns failure with PLAYER_NOT_FOUND reason.
- TC-320.06 [UC-COORD/A3]: Given undefined room context, When coordDowngrade is called with playerId 'p1', Then returns failure with INVALID_ROOM reason.

### Station 2: Implementation (GREEN)

#### Task 2.1: Preserve `preInsolvencyPhase` in `insolvency_manager.ts`
**Target physical file**: `src/server/insolvency_manager.ts`

```typescript
<<<<
declare module '../domain/room' {
  interface Room {
    pendingInsolvencyQueue?: string[];
  }
}
====
declare module '../domain/room' {
  interface Room {
    pendingInsolvencyQueue?: string[];
    preInsolvencyPhase?: TurnPhase;
  }
}
>>>>
```

```typescript
<<<<
  room.pendingInsolvencyDebtorId = player.id;
  if (creditorId && creditorId !== player.id) {
    room.pendingInsolvencyCreditorId = creditorId;
  }
  room.phase = TurnPhase.InsolvencyPhase;
====
  room.pendingInsolvencyDebtorId = player.id;
  if (creditorId && creditorId !== player.id) {
    room.pendingInsolvencyCreditorId = creditorId;
  }
  if (room.phase !== TurnPhase.InsolvencyPhase) {
    room.preInsolvencyPhase = room.phase;
  }
  room.phase = TurnPhase.InsolvencyPhase;
>>>>
```

#### Task 2.2: Refactor `coordDowngrade` in `room_property_coordinator.ts`
**Target physical file**: `src/server/room_property_coordinator.ts`

```typescript
<<<<
export function coordDowngrade(
  ctx: RoomContext | undefined,
  player: Player | undefined,
  cellIndex: number,
  roomCode: string,
  options?: DowngradeOptions,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const res = handleDowngrade(player, ctx.room.phase, cellIndex, ctx.reg, ctx.sm, roomCode, options, ctx.room);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase && player && player.balance >= 0) {
    delete ctx.room.pendingInsolvencyCreditorId;
    delete ctx.room.pendingInsolvencyDebtorId;
    ctx.room.phase = TurnPhase.PropertyManagement;
  }
  return res;
}
====
export function coordDowngrade(
  ctx: RoomContext | undefined,
  playerId: string,
  cellIndex: number,
  roomCode: string,
  options?: DowngradeOptions,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const player = ctx.room.players.find((pl) => pl.id === playerId);
  if (!player) return { success: false, reason: ActionRejectReason.PLAYER_NOT_FOUND };
  const res = handleDowngrade(player, ctx.room.phase, cellIndex, ctx.reg, ctx.sm, roomCode, options, ctx.room);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase && player.balance >= 0) {
    const isTurnPlayer = ctx.room.players[ctx.room.currentPlayerIndex]?.id === playerId;
    delete ctx.room.pendingInsolvencyCreditorId;
    delete ctx.room.pendingInsolvencyDebtorId;
    ctx.room.phase = isTurnPlayer ? TurnPhase.PropertyManagement : (ctx.room.preInsolvencyPhase ?? TurnPhase.PropertyManagement);
    delete ctx.room.preInsolvencyPhase;
  }
  return res;
}
>>>>
```

#### Task 2.3: Simplify `handleDowngrade` caller in `room_manager.ts`
**Target physical file**: `src/server/room_manager.ts`

```typescript
<<<<
  handleDowngrade(roomCode: string, playerId: string, cellIndex: number, options?: import('../domain/property_upgrade.js').DowngradeOptions) {
    const ctx = this.getContext(roomCode);
    const active = this.getActivePlayer(ctx?.room, playerId);
    const p = active ?? (ctx?.room?.phase === TurnPhase.InsolvencyPhase && ctx?.room?.pendingInsolvencyDebtorId === playerId ? ctx?.room?.players.find((pl) => pl.id === playerId) : undefined);
    return coordDowngrade(ctx, p, cellIndex, roomCode, options);
  }
====
  handleDowngrade(roomCode: string, playerId: string, cellIndex: number, options?: import('../domain/property_upgrade.js').DowngradeOptions) {
    return coordDowngrade(this.getContext(roomCode), playerId, cellIndex, roomCode, options);
  }
>>>>
```

## 4. Verification & Mechanical Gates
1. Station 1 Contract Tests (RED verification):
   `npx vitest run tests/server/imp320_fsm_restoration_and_deep_coordinator.test.ts`
2. Station 2 Fast Pre-Filter:
   `npm run prefilter -- src/server/insolvency_manager.ts src/server/room_property_coordinator.ts src/server/room_manager.ts tests/server/imp320_fsm_restoration_and_deep_coordinator.test.ts`
3. Scope Confinement:
   `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_320_FSM_RESTORATION_AND_DEEP_COORDINATOR.md`
4. Station 4 Sentinel Probes:
   `npm run sentinel -- --ticket IMP-320 --test tests/server/imp320_fsm_restoration_and_deep_coordinator.test.ts --src src/server/room_property_coordinator.ts`
5. Evidence Audit:
   `node scripts/check_evidence.mjs IMP-320`
