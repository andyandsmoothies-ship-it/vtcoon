# Plan IMP-332: Event Bus Core & Activity Log Purification (Candidate 1 - Slice 3A)

## 0. Auto-Slicing Protocol Roadmap (Candidate 1: Event Narrative Architecture)
- **Slice 1 (`IMP-330`)**: Pure `GameEventNarrativeSynthesizer` interface, typed event taxonomy, subtractive net-delta balance reconstruction, and rent/salary synthesis. (COMPLETED)
- **Slice 2 (`IMP-331`)**: Pure `GameEventPropertySynthesizer` for property acquisition, upgrades, mortgages, P2P trades, and auctions, with financial deduplication and unified façade composition. (COMPLETED)
- **Slice 3A (`IMP-332`)**: Event Bus Core, Key-based Registration, Activity Log Purification & Session Purge. (IN PROGRESS)
- **Slice 3B (`IMP-333`)**: Audio & Visual Presentation Subscribers (Pacing Context Adapter, Multi-Receiver Port Split Badges, Kinematic Delay Alignment).

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-332`
- **Subsystem**: `client-events` & `client-network` (Tier 1 Client Pure Domain & Activity Log Stream)
- **Problem Statement**:
  1. **Dual-Pipeline Collision (Mũi 2 / ADV-01)**: Running uncoordinated parallel pipelines duplicates activity logs. `trackDeltaActivities` must accept `{ suppressFinancialAndProperty?: boolean }` so `apply_delta` emits exactly 1 activity log entry per transaction via the new synthesizer.
  2. **Severed Presentation Wire (ADV-02)**: Subscribers must be registered in production runtime via `registerDefaultSubscribers()`, not left as dead-path test phantoms.
  3. **Vite HMR Accumulation (ADV-04)**: Listeners must register via unique keys in a `Map<string, Listener>` to guarantee idempotency across reloads.
  4. **Cross-Session Memory Leaks (Mũi 5)**: `clearGameEventListeners()` must be integrated into `client_session_purger.ts` on match reset.
  5. **Per-Event Error Isolation (ADV-05)**: Subscriber loop must wrap each event iteration in `try...catch` so an error in event 1 never suppresses event 2.
- **Direct Scope (Physical Files)**:
  - `src/client/events/game_event_bus.ts` (Tệp mới)
  - `src/client/events/subscribers/activity_log_subscriber.ts` (Tệp mới)
  - `src/client/network/apply_delta.ts`
  - `src/client/network/activity_tracker.ts`
  - `src/client/network/client_session_purger.ts`
  - `tests/client/imp332_game_event_bus_and_activity_logs.test.ts` (Tệp mới)
- **Upstream Contracts / Referenced SSOT**:
  - `src/client/events/game_event_types.ts`
  - `src/client/events/game_event_synthesizer.ts`
  - `src/client/store/game_store.ts`
  - `src/client/store/activity_store.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/events/game_event_bus.ts` | Tier 1 (Domain/Logic) | 0 | 95 | +95 | <= 400 | 🆕 Tệp mới |
| `src/client/events/subscribers/activity_log_subscriber.ts` | Tier 1 (Domain/Logic) | 0 | 180 | +180 | <= 400 | 🆕 Tệp mới |
| `src/client/network/apply_delta.ts` | Tier 1 (Domain/Logic) | 232 | 232 | 0 | <= 400 | ✔️ Safe |
| `src/client/network/activity_tracker.ts` | Tier 1 (Domain/Logic) | 277 | 277 | 0 | <= 400 | ✔️ Safe |
| `src/client/network/client_session_purger.ts` | Tier 1 (Domain/Logic) | 45 | 45 | 0 | <= 400 | ✔️ Safe |
| `tests/client/imp332_game_event_bus_and_activity_logs.test.ts` | Living Test | 0 | 360 | +360 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp332_game_event_bus_and_activity_logs.test.ts` (Tệp mới)

Test Specifications:
- TC-332.01 [UC-BUS/MSS]: Given registered listeners on GameEventBus, When dispatchGameEvents is called, Then all listeners receive the synthesized events in registration order.
- TC-332.02 [UC-BUS/A1]: Given a faulty listener that throws an error, When dispatchGameEvents executes, Then the error is caught and remaining listeners execute without failure.
- TC-332.03 [UC-BUS/A2]: Given an active subscription, When unsubscribe is called, Then the listener is detached and receives zero subsequent dispatches.
- TC-332.04 [UC-BUS/A3]: Given multiple listeners registered via key, When duplicate key registers, Then replaces cleanly without HMR accumulation.
- TC-332.05 [UC-ACT/MSS]: Given financial events (RENT_PAID, GO_SALARY, FEE_PAID, PARTIAL_RENT, PORT_SPLIT_RENT), When activity log subscriber processes them, Then appends formatted ActivityLogEntry items to useActivityStore.
- TC-332.06 [UC-ACT/A1]: Given property events (PROPERTY_BOUGHT, UPGRADED, MORTGAGED, UNMORTGAGED), When activity log subscriber processes them, Then creates correct title deed and financial log entries.
- TC-332.07 [UC-ACT/A2]: Given market events (TRADE_COMPLETED, AUCTION_WON, AUCTION_BID_PLACED), When activity log subscriber processes them, Then records cohesive P2P swap or auction log entries.
- TC-332.08 [UC-ISO/A4]: Given a multi-event batch where event 1 throws during mapping, When subscriber processes the batch, Then event 2 is still processed (per-event isolation).
- TC-332.09 [UC-COLLIDE/A5]: Given applyDeltaToStore receiving rent delta, When executed with suppressFinancialAndProperty, Then exactly 1 activity log entry is added to useActivityStore (zero duplicate logs).
- TC-332.10 [UC-PURGE/A6]: Given registered event bus listeners, When purgeClientMatchSession runs, Then listeners are cleared and re-initialized cleanly for the next match.
- TC-332.11 [UC-INT/A7]: Given existing dice, transit, and card deltas, When applyDeltaToStore executes with suppressFinancialAndProperty, Then movement and non-financial activities are preserved 100% without regression.

### Station 2: Implementation (GREEN)
#### Task 1: Implement Key-Based Game Event Bus (`src/client/events/game_event_bus.ts`)
- Implement `GameEventBus` class using `Map<string, Listener>` for HMR-safe key registration.
- Provide `registerSubscriber(key: string, listener: (events, context) => void): () => void`.
- Provide `dispatchGameEvents(events, context): void` with per-listener error isolation.
- Provide `registerDefaultSubscribers(store, options)` for production initialization.
- Provide `clearGameEventListeners()` for unit test teardown and match reset.

#### Task 2: Implement Activity Log Subscriber (`src/client/events/subscribers/activity_log_subscriber.ts`)
- Implement `mapEventToActivityLog(event, context): ActivityLogEntry | null` covering all 13 synthesized event types.
- Implement subscriber function with per-event `try...catch` isolation, pushing entries to `useActivityStore`.

#### Task 3: Transport Purification & Scope Decoupling
- In `src/client/network/activity_tracker.ts`:
  - Update `trackDeltaActivities` to accept `{ suppressFinancialAndProperty?: boolean }`.
  - When true, suppress legacy financial, property, and auction log additions, delegating to the unified synthesizer, while preserving `dice`, `transit`, `card`, and `move` tracking.
- In `src/client/network/apply_delta.ts`:
  - In `syncTelemetryAndActivities`:
    - Ensure default subscribers are registered.
    - Call `synthesizeGameEvents(prevState, currentState, delta)` and `dispatchGameEvents(events, context)`.
    - Call `trackDeltaActivities(delta, prevState, currentState, activityStore, { suppressFinancialAndProperty: true })`.
- In `src/client/network/client_session_purger.ts`:
  - Invoke `clearGameEventListeners()` and restore default subscribers on match reset.

### Station 3: Pre-Filter & Architecture Review
- Run `npm run prefilter -- src/client/events/game_event_bus.ts src/client/events/subscribers/activity_log_subscriber.ts src/client/network/apply_delta.ts src/client/network/activity_tracker.ts src/client/network/client_session_purger.ts tests/client/imp332_game_event_bus_and_activity_logs.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_332_PRESENTATION_SUBSCRIBER_DECOUPLING.md`.

### Station 4: Evidence & Verification
- Execute test suite: `npx vitest run tests/client/imp332_game_event_bus_and_activity_logs.test.ts`.
- Run sentinel probe verification: `npm run sentinel -- --ticket IMP-332 --test tests/client/imp332_game_event_bus_and_activity_logs.test.ts --src src/client/events/game_event_bus.ts`.
- Verify evidence: `node scripts/check_evidence.mjs IMP-332`.
- Synthesize delivery report: `npm run report -- IMP-332`.
