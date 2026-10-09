# Plan IMP-344: Kinematic Game Event Synthesis & Unified Activity Pipeline

## 0. Context & Prior In-Flight Scope (Uncommitted)
- **Prior In-Flight Scope (Uncommitted)**:
  - `src/client/3d/event_card_texture.ts`
  - `src/client/3d/tile_icons.ts`
  - `src/client/3d/tile_icons/types.ts`
  - `src/client/3d/tile_icons/transports.ts`
  - `src/client/3d/tile_icons/landmarks.ts`
  - `src/client/3d/tile_icons/culture.ts`
  - `src/client/3d/tile_icons/systems.ts`
  - `src/server/bond_manager.ts`
  - `src/server/insolvency_manager.ts`
  - `src/server/auction_manager.ts`
  - `tests/server/imp339_bond_insolvency_and_cascade_gate.test.ts`
  - `src/client/ui/modals/event_card_modal.tsx`
  - `src/client/ui/modals/event_card_visuals.ts`
  - `src/client/ui/modals/event_card_configs.ts`
  - `tests/client/imp343_event_card_display_data.test.ts`

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-344`
- **Subsystem**: `client-state`
- **Problem Statement**:
  1. Kinematic game events (Dice rolls, Pawn moves, Event cards, Transit wheels) were logged via legacy imperative `trackDeltaActivities` while financial events were synthesized via `GameEventBus`.
  2. In an initial prototype, `lastTransitResult` was not tracked in `GameState`, creating stateful drift in pure synthesizer.
  3. Legacy activity tracker monkey-patched store with `silentActivityStore`, creating seam discipline violations.
- **Architectural Solution**:
  1. **SSOT Transit Tracking in GameState**: Track `lastTransitResult` in `GameState` (`game_store_state_types.ts` & `game_store.ts`), enabling deterministic deduplication in `synthesizeKinematicEvents`.
  2. **Pure Kinematic Synthesizer**: Extract pure synthesis logic into `src/client/events/game_event_kinematics_synthesizer.ts`.
  3. **Dedicated Kinematics Formatter**: Extract Vietnamese activity formatting to `src/client/events/subscribers/activity_log_kinematics_formatter.ts`, keeping `activity_log_subscriber.ts` safely within LOC budget (346 LOC).
  4. **Clean Seam with `suppressKinematicLogging`**: Provide typed option in `trackDeltaActivities` to suppress duplicate activity logs without monkey-patching and without erasing audio (`CARD_DRAW`) or floating badges.
- **Direct Scope (Physical Files)**:
  - `src/client/events/game_event_kinematics_synthesizer.ts` (New)
  - `src/client/events/subscribers/activity_log_kinematics_formatter.ts` (New)
  - `src/client/events/game_event_types.ts`
  - `src/client/events/game_event_synthesizer.ts`
  - `src/client/events/subscribers/activity_log_subscriber.ts`
  - `src/client/network/apply_delta.ts`
  - `src/client/network/activity_tracker.ts`
  - `src/client/store/game_store_subtypes.ts`
  - `src/client/store/game_store_state_types.ts`
  - `src/client/store/game_store.ts`
  - `tests/client/imp344_kinematic_game_event_synthesis.test.ts` (New)

## 2. Planned Changes & LOC Budget

| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/events/game_event_kinematics_synthesizer.ts` | Tier 1 (Domain/State) | 0 | 105 | +105 | <= 400 | 🆕 Tệp mới (✔️ Safe) |
| `src/client/events/subscribers/activity_log_kinematics_formatter.ts` | Tier 1 (Domain/State) | 0 | 47 | +47 | <= 400 | 🆕 Tệp mới (✔️ Safe) |
| `src/client/events/game_event_types.ts` | Tier 1 (Domain/State) | 197 | 197 | 0 | <= 400 | ✔️ Safe |
| `src/client/events/game_event_synthesizer.ts` | Tier 1 (Domain/State) | 28 | 28 | 0 | <= 400 | ✔️ Safe |
| `src/client/events/subscribers/activity_log_subscriber.ts` | Tier 1 (Domain/State) | 346 | 346 | 0 | <= 400 | ⚠️ Soft Notice (346 <= 400) |
| `src/client/network/apply_delta.ts` | Tier 1 (Domain/State) | 255 | 255 | 0 | <= 400 | ✔️ Safe |
| `src/client/network/activity_tracker.ts` | Tier 1 (Domain/State) | 295 | 295 | 0 | <= 400 | ✔️ Safe |
| `src/client/store/game_store_subtypes.ts` | Tier 1 (Domain/State) | 229 | 229 | 0 | <= 400 | ✔️ Safe |
| `src/client/store/game_store_state_types.ts` | Tier 1 (Domain/State) | 198 | 198 | 0 | <= 400 | ✔️ Safe |
| `src/client/store/game_store.ts` | Tier 1 (Domain/State) | 193 | 193 | 0 | <= 400 | ✔️ Safe |
| `tests/client/imp344_kinematic_game_event_synthesis.test.ts` | Living Test | 0 | 491 | +491 | <= 600 | 🆕 Tệp mới (✔️ Safe) |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp344_kinematic_game_event_synthesis.test.ts` (Tệp mới)

Test Specifications:
- TC-344.01 [UC-KIN/MSS]: Given DeltaPayload with dice values [3, 4] and new diceSeq, When calling synthesizeKinematicEvents, Then emits DICE_ROLLED event with total 7 and isDouble false.
- TC-344.02 [UC-KIN/A1]: Given DeltaPayload with double dice values [5, 5], When calling synthesizeKinematicEvents, Then emits DICE_ROLLED event with isDouble true.
- TC-344.03 [UC-KIN/A2]: Given DeltaPayload with pawn position transition from cell 0 to 5, When calling synthesizeKinematicEvents, Then emits PAWN_MOVED event with correct fromCell and toCell.
- TC-344.04 [UC-KIN/A3]: Given DeltaPayload with lastEventCard, When calling synthesizeKinematicEvents, Then emits EVENT_CARD_DRAWN event with normalized card details.
- TC-344.05 [UC-KIN/A4]: Given DeltaPayload with new lastTransitResult, When calling synthesizeKinematicEvents, Then emits TRANSIT_WHEEL_LANDED event with station outcome and payout.
- TC-344.06 [UC-FMT/MSS]: Given synthesized kinematic events, When formatKinematicActivityLog is invoked, Then produces formatted Vietnamese messages preserving exact emojis and punctuation.
- TC-344.10 [UC-KIN/A5]: Given DeltaPayload with same lastTransitResult as prevState, When calling synthesizeKinematicEvents, Then suppresses duplicate transit wheel event.
- TC-344.11 [UC-KIN/A6]: Given DeltaPayload with same event cardId as prevState, When calling synthesizeKinematicEvents, Then suppresses duplicate event card drawn.
- TC-344.15 [UC-GATE/MSS]: Helper Adversarial Gate - Given invalid non-event objects, When asSynthesizedGameEvent is called, Then throws HelperAdversarialError.

### Station 2: Minimal Production Implementation (GREEN)

#### Task 1: Create `src/client/events/game_event_kinematics_synthesizer.ts`
**Target physical file**: `src/client/events/game_event_kinematics_synthesizer.ts` (Tệp mới)

```typescript
export function synthesizeKinematicEvents(
  prevState: GameState,
  nextState: GameState,
  delta: DeltaPayload,
  options?: SynthesizerOptions,
): readonly SynthesizedGameEvent[];
```

#### Task 2: Create `src/client/events/subscribers/activity_log_kinematics_formatter.ts`
**Target physical file**: `src/client/events/subscribers/activity_log_kinematics_formatter.ts` (Tệp mới)

```typescript
export function formatKinematicActivityLog(
  event: SynthesizedGameEvent,
  playerName: string,
  destinationName?: string,
): { type: ActivityLogType; message: string } | null;
```

#### Task 3: Update `src/client/network/apply_delta.ts` and `activity_tracker.ts`
- Add `suppressKinematicLogging` option to `TrackDeltaActivitiesOptions` in `activity_tracker.ts`.
- In `apply_delta.ts`, pass `suppressKinematicLogging: true` to prevent duplicate logs while preserving audio and badges.
- Sync `delta.lastTransitResult` to `currentState` in `applyPhaseAndTimerDeltas`.

### Station 3: Pre-Filter & Architecture Review
- Run mechanical pre-filter on modified files.
- Run scope confinement check: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_344_KINEMATIC_GAME_EVENT_SYNTHESIS.md`.

### Station 4: Evidence & Verification
- Execute test suite: `npx vitest run tests/client/imp344_kinematic_game_event_synthesis.test.ts`.
- Run Sentinel probe mutation: `npm run sentinel -- --ticket IMP-344 --test tests/client/imp344_kinematic_game_event_synthesis.test.ts`.
- Verify evidence: `node scripts/check_evidence.mjs IMP-344`.
