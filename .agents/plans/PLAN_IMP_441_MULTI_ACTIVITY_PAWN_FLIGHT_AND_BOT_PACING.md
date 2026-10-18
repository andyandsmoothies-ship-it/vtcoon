# Implementation Plan: IMP-441 Multi-Activity Pawn Direct Flight, Queue Continuity & Server Bot Pacing

## 1. Physical Surface Area & Target Files
| Target File | Tier | Current LOC | Expected LOC | Net Delta | Subsystem | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/network/apply_delta_players.ts` | Tier 1 | 269 | 285 | +16 | client-state | Safe |
| `src/client/store/game_store_subtypes.ts` | Tier 1 | 230 | 235 | +5 | client-state | Safe |
| `src/client/store/game_store_state_types.ts` | Tier 1 | 199 | 200 | +1 | client-state | Safe |
| `src/client/store/game_store_pawn_actions.ts` | Tier 1 | 222 | 234 | +12 | client-state | Safe |
| `src/client/3d/single_hop_pawn.tsx` | Tier 2 | 273 | 281 | +8 | client-3d | Safe |
| `src/client/3d/pawn_animator.tsx` | Tier 2 | 340 | 343 | +3 | client-3d | Safe |
| `src/server/network/turn_bot_timer_scheduler.ts` | Tier 1 | 189 | 203 | +14 | server-network | Safe |
| `tests/client/imp441_multi_activity_pawn_flight_and_bot_pacing.test.ts (New)` | Living Tests (New) | 0 | 240 | +240 | client-state | New |

> **Architecture Commitment (LOC Buffer Zone Guard)**: All Tier 1 files remain strictly `< 300 LOC` (`<= 285 LOC`) and Tier 2 files remain `< 350 LOC` (`<= 343 LOC`). Existing ambient module augmentation in `tests/client/imp322_global_event_banner.test.ts` on `src/client/store/game_store_subtypes.ts` (`FloatingTextItem`) is 100% preserved with zero breaking export changes.
> **Harness Modification Scope**: `[HARNESS_MUTATION_AUTHORIZED]` declared for `scripts/plan_audit/rules_scope.mjs` (grouping `src/client/3d/pawn_*` and `single_hop_pawn.tsx` into the cohesive `src/client/3d/pawn` kinematics unit).

## 2. Core Contract Invariants
- **[INV-FLIGHT-TYPE-AND-AUDIO-DIFFERENTIATION]**: `PawnFlightType = 'audit' | 'transit' | 'event'` is added to `PawnAnimationState`, `PawnMoveTask`, `PendingPawnMove` (`game_store_subtypes.ts`), `startPawnMove` (`game_store_state_types.ts` & `game_store_pawn_actions.ts`), `HopFrameParams`, and `SingleHopProps` (`single_hop_pawn.tsx`). In `computeHopFrame` (`single_hop_pawn.tsx`), landing sound resolves by flight variant: when `flightType === 'event' || flightType === 'transit'`, `soundToPlay` is `SoundEffect.CARD_DRAW` (never `SoundEffect.TAX_PENALTY`); when `flightType === 'audit'` or legacy `isJailFlight === true` (without `'event' | 'transit'`), `soundToPlay` is `SoundEffect.TAX_PENALTY`; normal step hops play `SoundEffect.PAWN_STEP` with `getStepPitchVariation()`. Both `SingleHopPawn` and `ActiveSpringPawn` (`pawn_animator.tsx`) activate high-arc parabolic trajectory (`JAIL_FLIGHT_ARC = 2.8m`, `JAIL_FLIGHT_DURATION = 0.55s` / `BOT_JAIL_FLIGHT_DURATION = 0.45s`, `JAIL_LANDING_DURATION = 0.12s`) whenever `Boolean(isJailFlight || flightType)`.
- **[INV-CLIENT-DIRECT-FLIGHT-AND-QUEUE-TAIL-CHAINING]**: In `apply_delta_players.ts`, `processSinglePlayerPosition(state, p, nextPositions, isFullSync, delta)` detects instant board-wide or transit teleports:
  1. `flightType = 'event'` when `(delta?.lastEventCard?.cardId ?? delta?.lastEventCard?.id) === 'MC_MEGA_CONCERT'` (or `isBoardWideCard` teleporting players to a gathering tile).
  2. `flightType = 'transit'` when `delta?.lastTransitResult?.playerId === p.id && (delta.lastTransitResult.outcome === 'SAFE_HAVEN' || delta.lastTransitResult.outcome === 'PASS_GO_FLIGHT')`.
  3. `flightType = 'audit'` and `isJailFlight = true` when `isGoingToAudit && p.position === 10`.
  When `Boolean(isJailFlight || flightType)` is true, `waypoints` is generated via `calculateJailFlightWaypoints(p.position)` (`[p.position]`, 1 parabolic hop of ~0.5s instead of 13–39 sequential tile hops around the board).
  Furthermore, `determineFromCell` and `startPawnMove` chain sequentially from the player's latest in-flight target: `pawnAnimationQueue` tail (`pTasks[pTasks.length - 1].targetCell`) $\rightarrow$ `pendingPawnMove.targetCell` (if `pendingPawnMove.playerId === playerId`) $\rightarrow$ `activePawnAnimation` terminal waypoint (`anim.waypoints[anim.waypoints.length - 1]`) $\rightarrow$ `currentPos`, preventing a mid-animation delta from snapping `fromCell` back to the initial `visualPositions` start cell. In `dispatchPawnMove`, when `isRolling || activeModal === 'transit_wheel'`, if `state.pendingPawnMove` is empty, it stores `{ playerId, targetCell, fromCell, isBot: Boolean(task.isBot), ...(task.isJailFlight ? { isJailFlight: true } : {}), ...(task.flightType ? { flightType: task.flightType } : {}) }`; if `state.pendingPawnMove` is already occupied, it enqueues `task` into `state.enqueuePawnMove` so multi-player deltas never overwrite `pendingPawnMove`.
- **[INV-SERVER-DICE-KINEMATICS-SERVED-DECOUPLING]**: In `src/server/network/turn_bot_timer_scheduler.ts`, `resolveBotStepDelay(room, baseDelayMs, hasUpgradeDelay, kinematicsServed)` scopes `kinematicsServed` (`diceKinematicsServed`) strictly to suppressing repeated `room.lastDice` movement dwell within the same `diceSeq`. When `kinematicsServed === true` and `baseDelayMs > 500`, if mid-turn secondary activities occur on the same `diceSeq`:
  1. If `(room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) && room.lastTransitResult`, return `Math.max(baseDelayMs, 1200 + (room.lastTransitResult.boostSteps ?? 0) * 350 + BOT_TRANSIT_OBSERVATION_DELAY_MS + (room.lastEventCard ? 2500 : 0))`.
  2. Else if `room.lastEventCard`, return `Math.max(baseDelayMs, 2500)`.
  3. Else if `room.pendingTransitWheel`, return `Math.max(baseDelayMs, BOT_TRANSIT_OBSERVATION_DELAY_MS)`.
  4. Otherwise (only `room.lastDice` present, already served), return `baseDelayMs`.

## 3. Principles Applied
- **[View-Model Seam Extraction]**: Pure frame calculation `computeHopFrame` in `single_hop_pawn.tsx` and pure delay calculator `resolveBotStepDelay` in `turn_bot_timer_scheduler.ts` encapsulate flight audio selection and bot observation pacing without WebGL/timer coupling.
- **[Equivalence-Partition Testing]**: Partition flight variants across `'audit'` (`TAX_PENALTY`), `'event'` (`CARD_DRAW`), `'transit'` (`CARD_DRAW`), and normal step (`PAWN_STEP`), plus bot scheduler states across initial roll vs post-roll `pendingTransitWheel`, `lastTransitResult`, and composite `lastTransitResult + lastEventCard`.
- **[Relational Multi-Point Assertion]**: Verify `resolveBotStepDelay` covaries strictly across `(kinematicsServed=true, only lastDice) -> 1500ms`, `(kinematicsServed=true, pendingTransitWheel) -> 2000ms`, `(kinematicsServed=true, lastTransitResult boost=2) -> 3900ms`, and `(kinematicsServed=true, lastTransitResult boost=2 + lastEventCard) -> 6400ms`.
- **[100% DTO & Call-Site Wiring]**: `flightType: PawnFlightType` is wired end-to-end from `applyPlayerDeltas` (`apply_delta_players.ts`) $\rightarrow$ `PendingPawnMove` / `PawnMoveTask` / `PawnAnimationState` (`game_store_pawn_actions.ts`) $\rightarrow$ `ActiveSpringPawn` (`pawn_animator.tsx`) $\rightarrow$ `SingleHopPawn` & `computeHopFrame` (`single_hop_pawn.tsx`).

## 4. Call-Site Wiring & Contract Specifications

### 4.1 `src/client/store/game_store_subtypes.ts`, `game_store_state_types.ts` & `game_store_pawn_actions.ts`
- **`game_store_subtypes.ts`**:
  - Export `type PawnFlightType = 'audit' | 'transit' | 'event';`.
  - Add `readonly flightType?: PawnFlightType;` to `PawnAnimationState`, `PawnMoveTask`, and `PendingPawnMove`.
- **`game_store_state_types.ts`**:
  - Import `PawnFlightType` from `./game_store_subtypes.js` and update `startPawnMove` signature to `(playerId: string, targetCell: number, fromCell?: number, isBot?: boolean, isJailFlight?: boolean, flightType?: PawnFlightType) => void`.
- **`game_store_pawn_actions.ts`**:
  - In `setPlayerPositions`: include `Boolean(state.pendingPawnMove) || state.isRolling` in `isBusy` so `visualPositions` does not prematurely snap while a move is staged in `pendingPawnMove`.
  - In `setPendingPawnMove`: cache the previous `pendingPawnMove` in closure state (`lastClearedPendingMove`) when cleared to `null` so 5-arg callers like `TransitWheelModal` (`setPendingPawnMove(null)` followed by `startPawnMove(playerId, targetCell, fromCell, isBot, isJailFlight)`) preserve `flightType: 'transit'`.
  - In `setIsRolling(false)`: pass `pending.flightType` to `get().startPawnMove(pending.playerId, pending.targetCell, pending.fromCell, pending.isBot, pending.isJailFlight, pending.flightType)`.
  - In `processPawnQueue`: forward `...(nextTask.flightType ? { flightType: nextTask.flightType } : {})` to `activePawnAnimation` while keeping `isJailFlight` on `activePawnAnimation` strictly `true` only for `'audit'` (`nextTask.isJailFlight`) so `AdaptiveCinematicCamera` never triggers the Go-To-Jail camera spline during `'event'` or `'transit'` flights.
  - In `startPawnMove`: resolve `effectiveFlightType = flightType ?? (lastClearedPendingMove?.playerId === playerId && lastClearedPendingMove?.targetCell === targetCell ? lastClearedPendingMove.flightType : undefined)` (and clear `lastClearedPendingMove`). Resolve `currentPos` by checking `fromCell` first, then the tail of `state.pawnAnimationQueue` for `playerId`, then `state.pendingPawnMove?.playerId === playerId ? state.pendingPawnMove.targetCell : undefined`, then `state.activePawnAnimation?.playerId === playerId && state.activePawnAnimation.waypoints.length > 0 ? state.activePawnAnimation.waypoints[state.activePawnAnimation.waypoints.length - 1] : undefined`, then `state.playerPositions?.[playerId] ?? state.visualPositions?.[playerId] ?? 0`. Compute `const isDirectFlight = Boolean(isJailFlight || effectiveFlightType); const waypoints = isDirectFlight ? [targetCell] : calculatePathWaypoints(currentPos, targetCell);` and pass `...(effectiveFlightType ? { flightType: effectiveFlightType } : {})` to `enqueuePawnMove`.

### 4.2 `src/client/network/apply_delta_players.ts`
- **`determineFromCell(state, playerId, currentPos)`**:
  - Check `pawnAnimationQueue` tail for `playerId` $\rightarrow$ check `if (state.pendingPawnMove?.playerId === playerId) return state.pendingPawnMove.targetCell;` $\rightarrow$ check `if (anim?.playerId === playerId && anim.waypoints.length > 0) return anim.waypoints[anim.waypoints.length - 1]!;` $\rightarrow$ return `currentPos` (never returning stale `visualPositions` of another player or pre-hop start position when `currentPos` already reflects `state.playerPositions[playerId]`).
- **`dispatchPawnMove(state, task, isRolling)`**:
  - When `(isRolling || isHeldForModal) && state.setPendingPawnMove && !state.pendingPawnMove`: call `state.setPendingPawnMove({ playerId: task.playerId, targetCell: task.targetCell, fromCell: task.fromCell, isBot: Boolean(task.isBot), ...(task.isJailFlight ? { isJailFlight: true } : {}), ...(task.flightType ? { flightType: task.flightType } : {}) })`.
  - Otherwise if `state.enqueuePawnMove`: call `state.enqueuePawnMove(task)`.
  - Otherwise call `state.startPawnMove?.(task.playerId, task.targetCell, task.fromCell, Boolean(task.isBot), task.isJailFlight, task.flightType)`.
- **`processSinglePlayerPosition(state, p, nextPositions, isFullSync, delta)`**:
  - Derive `flightType`:
    - `const cardId = delta?.lastEventCard?.cardId ?? delta?.lastEventCard?.id;`
    - `const isEventFlight = cardId === 'MC_MEGA_CONCERT';`
    - `const transitOutcome = delta?.lastTransitResult?.outcome;`
    - `const isTransitFlight = delta?.lastTransitResult?.playerId === p.id && (transitOutcome === 'SAFE_HAVEN' || transitOutcome === 'PASS_GO_FLIGHT');`
    - `const isJailFlight = isGoingToAudit && p.position === 10;`
    - `const flightType: PawnFlightType | undefined = isJailFlight ? 'audit' : isEventFlight ? 'event' : isTransitFlight ? 'transit' : undefined;`
    - `const isDirectFlight = Boolean(isJailFlight || flightType);`
    - `const waypoints = isDirectFlight ? calculateJailFlightWaypoints(p.position) : calculatePathWaypoints(fromCell, p.position);`

### 4.3 `src/client/3d/single_hop_pawn.tsx` & `src/client/3d/pawn_animator.tsx`
- **`single_hop_pawn.tsx`**:
  - Add `readonly flightType?: 'audit' | 'transit' | 'event';` to `HopFrameParams` and `SingleHopProps`.
  - In `computeHopFrame`: select `SoundEffect.CARD_DRAW` when `params.flightType === 'event' || params.flightType === 'transit'`, `SoundEffect.TAX_PENALTY` when `params.isJailFlight || params.flightType === 'audit'`, and `SoundEffect.PAWN_STEP` with `getStepPitchVariation()` otherwise.
  - In `SingleHopPawn`: set `const isDirectFlight = Boolean(isJailFlight || flightType);`, use `isDirectFlight` for `hopDuration`, `landingDuration`, and `arcHeight`, and pass `flightType` to `computeHopFrame`.
- **`pawn_animator.tsx`**:
  - In `ActiveSpringPawn`: set `const isDirectFlight = Boolean(animation.isJailFlight || animation.flightType);`, pass `arcHeight={isDirectFlight ? JAIL_FLIGHT_ARC : DEFAULT_JUMP_ARC}` to `<PawnHopTrajectory />`, and pass `isJailFlight={isDirectFlight}` and `flightType={animation.flightType}` to `<SingleHopPawn />`.

### 4.4 `src/server/network/turn_bot_timer_scheduler.ts`
- In `resolveBotStepDelay(room, baseDelayMs, hasUpgradeDelay, kinematicsServed)`:
  - When `kinematicsServed` is `true`, check mid-turn activities before falling back to `baseDelayMs`:
    - If `(room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) && room.lastTransitResult`: return `Math.max(baseDelayMs, 1200 + (room.lastTransitResult.boostSteps ?? 0) * 350 + BOT_TRANSIT_OBSERVATION_DELAY_MS + (room.lastEventCard ? 2500 : 0))`.
    - If `room.lastEventCard`: return `Math.max(baseDelayMs, 2500)`.
    - If `room.pendingTransitWheel`: return `Math.max(baseDelayMs, BOT_TRANSIT_OBSERVATION_DELAY_MS)`.
    - Otherwise return `baseDelayMs`.

## 5. Station 1 Test Specifications
- TC-441.01 [UC-FLIGHT-AUDIO-AND-ARC-VARIANTS/MSS]: Given `computeHopFrame` and `ActiveSpringPawn` in `single_hop_pawn.tsx` and `pawn_animator.tsx`, When landing frame (`t > hopDuration`) is evaluated across `flightType: 'event'`, `flightType: 'transit'`, `flightType: 'audit'` (`isJailFlight: true`), and normal step (`flightType: undefined`), Then `'event'` and `'transit'` emit `SoundEffect.CARD_DRAW` with `JAIL_FLIGHT_ARC` (2.8m), `'audit'` emits `SoundEffect.TAX_PENALTY`, and normal step emits `SoundEffect.PAWN_STEP`.
- TC-441.02 [UC-MEGA-CONCERT-AND-TRANSIT-DIRECT-FLIGHT/MSS]: Given `applyPlayerDeltas` in `apply_delta_players.ts` receiving a `MC_MEGA_CONCERT` delta moving 4 players (`p1: 33->6`, `bot_2: 23->6`, `bot_3: 19->6`, `bot_4: 15->6`) or a `SAFE_HAVEN` / `PASS_GO_FLIGHT` transit delta, When player positions are processed into `useGameStore`, Then all 4 moves are queued with single-hop direct flight `waypoints: [6]` and `flightType: 'event'` (or `'transit'`), never expanding into 94 sequential tile-by-tile hops.
- TC-441.03 [UC-IN-FLIGHT-QUEUE-TAIL-CONTINUITY/A1]: Given `bot_4` currently animating `7 -> 15` (`activePawnAnimation` with `fromCell: 7, waypoints: [8..15]`, while `visualPositions.bot_4` is still `7`) or staged in `pendingPawnMove` while `isRolling: true`, When a subsequent delta moves `bot_4` to `17` or `6`, Then `determineFromCell` and `startPawnMove` chain `fromCell` from `15` (the terminal target of the in-flight/pending move) rather than snapping back to `7`, and preserve `isBot: true` and all multi-player moves without overwriting `pendingPawnMove`.
- TC-441.04 [UC-SERVER-BOT-MID-TURN-PACING-UNBLOCK/MSS]: Given `resolveBotStepDelay` and `TurnBotTimerScheduler.scheduleBotStep` in `turn_bot_timer_scheduler.ts` when `kinematicsServed === true` (same `diceSeq` after initial roll), When `room` has `pendingTransitWheel` (Tick 61), `lastTransitResult` (`boostSteps: 2`), `lastEventCard` (`MC_MEGA_CONCERT`), or composite `lastTransitResult + lastEventCard` (Tick 62), Then `resolveBotStepDelay` returns `2000ms`, `3900ms`, `2500ms`, and `6400ms` respectively while still returning `1500ms` (`baseDelayMs`) when only `lastDice` is present.

## 6. Definition of Done
- 100% test pass on `tests/client/imp441_multi_activity_pawn_flight_and_bot_pacing.test.ts`
- Zero regressions across living tests (`turn_bot_timer_scheduler.test.ts`, `imp390_kinematic_pacing_restoration.test.ts`, `single_hop_pawn.test.ts`, `game_store_pawn_actions.test.ts`, `imp248_transit_wheel_navigator.test.ts`, `imp126_pawn_jail_direct_flight.test.ts`, `imp322_global_event_banner.test.ts`)
- Full prefilter passes (`npm run prefilter`)
- Sentinel passes with 100% mutant kill (`npm run sentinel -- --ticket IMP-441 --test tests/client/imp441_multi_activity_pawn_flight_and_bot_pacing.test.ts`)
- Physical visual capture: `npm run capture:visual -- --ticket IMP-441 --scenario camera_chase_normal --dual-viewport`
- Comprehensive evidence audit: `node scripts/check_evidence.mjs IMP-441`
