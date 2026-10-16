# PLAN_IMP_423: Server FSM Coordinator Seam & Final Codebase Zero-Cycle

## 1. Context & Architectural Goal
- **Source Strategy**: SDLC Hardening V6.0 — Server FSM Transition Coordinator Seam & Final Codebase Zero-Cycle.
- **Classification**: Tier 2 Server State Machine & Architectural Decoupling.
- **Subsystem Boundary**: `src/server/**`, `src/client/**`.
- **Target Invariant**: Eliminate all circular dependency cycles across server and client modules, achieving **0 CIRCULAR DEPENDENCIES (0 SCC)** across the entire repository.

### Principles Applied
- **View-Model & State Seam Extraction** -> Extracts pure FSM transitions (`fsm_transition_coordinator.ts`), session types (`auction_types.ts`), and room context (`room_context_types.ts`) out of monolithic managers.
- **Subsystem Facade Invariant** -> Normalizes `RoomManager`, `AuctionSession`, and timer constants behind canonical seams while preserving 1-line re-export stubs for living tests.
- **Zero Circular Dependency Invariant** -> Eliminates all 5 strongly connected components across 427+ repository files, converting the entire dependency graph into a strict DAG.
- **Two-Stage Decoupling Pattern** -> Retains 1-line re-export stubs in `turn_loop.ts`, `insolvency_manager.ts`, `auction_manager.ts`, `room_manager.ts` to protect 100+ living test suites.
- **Fast & Deterministic Testing** -> Verifies multi-stage FSM phase transitions and DAG acyclicity without external delays.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/server/fsm_transition_coordinator.ts` | Tier 1 (Server/FSM) | 0 | 194 | +194 | 400 | Safe (New Seam) |
| `src/server/auction_types.ts` | Tier 1 (Server Types) | 0 | 21 | +21 | 400 | Safe (New Seam) |
| `src/server/room_context_types.ts` | Tier 1 (Server Types) | 0 | 10 | +10 | 400 | Safe (New Seam) |
| `src/server/room_manager_types.ts` | Tier 1 (Server Types) | 0 | 54 | +54 | 400 | Safe (New Seam) |
| `src/server/network/turn_timer_constants.ts` | Tier 1 (Server Types) | 0 | 20 | +20 | 400 | Safe (New Seam) |
| `src/server/logging/room_logger_types.ts` | Tier 1 (Server Types) | 0 | 15 | +15 | 400 | Safe (New Seam) |
| `src/server/network/admin_manager_types.ts` | Tier 1 (Server Types) | 0 | 55 | +55 | 400 | Safe (Admin Interface Seam) |
| `src/server/turn_loop.ts` | Tier 1 (Server FSM) | 269 | 269 | ~0 | 400 | Safe (Delegates FSM) |
| `src/server/insolvency_manager.ts` | Tier 1 (Server FSM) | 249 | 249 | ~0 | 400 | Safe (Delegates FSM) |
| `src/server/auction_manager.ts` | Tier 1 (Server FSM) | 331 | 331 | ~0 | 400 | Warning (TD: >300 LOC) |
| `src/server/room_manager.ts` | Tier 1 (Server FSM) | 332 | 332 | ~0 | 400 | Warning (TD: >300 LOC) |
| `src/server/room_property_coordinator.ts` | Tier 1 (Server FSM) | 173 | 173 | ~0 | 400 | Safe (Uses Context) |
| `src/server/network/admin_types.ts` | Tier 1 (Server Types) | 3 | 3 | ~0 | 400 | Safe (Minimal Stub) |
| `tests/server/imp423_server_fsm_coordinator_seam.test.ts` | Living Test | 0 | 170 | +170 | 600 | Safe (Contract Suite) |

---

## 3. Core Contract Invariants & Architectural Seams

1. **[INV-FSM-01: Centralized Transition Coordinator & CheckInsolvency Seam]**:
   - `advanceRoundBoundary`, `advanceTurnToNextPlayer`, `advanceTurnAfterBankruptcy`, `restorePostInsolvencyPhase`, and `checkInsolvency` reside in `fsm_transition_coordinator.ts`.
   - `turn_loop.ts` and `insolvency_manager.ts` retain 1-line re-export stubs (Two-Stage Decoupling Pattern) and delegate execution, completely severing circular dependencies.

2. **[INV-FSM-02: Auction Type Segregation]**:
   - `AuctionSession` and `AuctionResult` interfaces are extracted to `auction_types.ts`.
   - `auction_manager.ts` and `room_manager.ts` re-export them for backward compatibility, while all server consumers import directly from `auction_types.js`.

3. **[INV-FSM-03: Room Context Type Seam]**:
   - `RoomContext` interface is defined in `room_context_types.ts`.
   - `room_property_coordinator.ts` and `room_trade_coordinator.ts` consume `room_context_types.js`, breaking the trade-property coordinator circular import loop.

4. **[INV-FSM-04: Subsystem Constants & Logging Types Isolation]**:
   - `PHASE_TIMEOUTS_MS`, `HUMAN_PHASE_TIMEOUTS_MS`, and `AUCTION_SETTLE_DELAY_MS` are isolated in `turn_timer_constants.ts`.
   - `RoomLogMeta` and `RoomFinishSummary` are isolated in `room_logger_types.ts`.
   - `AdminManagerOptions` definition is moved into `admin_types.ts` (removing re-export from `admin_manager.js`), and `IAdminManager` interface is added to break concrete imports in `admin_message_handler.ts`.

5. **[INV-FSM-05: Room Manager Decoupled Seam]**:
   - `IRoomManager` interface and `RollResult` reside in `room_manager_types.ts`.
   - Subsystem coordinators (`room_bot_coordinator.ts`, `intent_dispatcher.ts`, `afk_recovery.ts`, `room_auction_coordinator.ts`) import `IRoomManager` rather than concrete `RoomManager`.

6. **[INV-FSM-06: Client Network & Subscribers Seams]**:
   - `room_config_helpers.ts`, `game_event_bus_types.ts`, `trade_offer_tracker.ts` isolate store initialization, bus subscriber interfaces, and trade offer state tracking, dissolving `[SCC-1]`.

7. **[INV-FSM-07: Codebase Zero-Cycle Invariant]**:
   - `npm run lint:boundaries` must detect **0 strongly connected components (0 SCC)** across all files in `src/**`.

---

## 4. Contract Test Scenarios (`imp423_server_fsm_coordinator_seam.test.ts`)

- **TC-423.01 [UC-FSM-ROUND-ADVANCE/MSS]**: Given active room with modifiers, When `advanceRoundBoundary` is invoked, Then `roundCount` increments, modifiers decay, and macro cycle evaluates.
- **TC-423.02 [UC-FSM-TURN-ADVANCE/MSS]**: Given a room with active and bankrupt players, When `advanceTurnToNextPlayer` runs, Then it skips bankrupt players, handles round wrap-around, and routes insolvent players to `InsolvencyPhase`.
- **TC-423.03 [UC-FSM-BANKRUPTCY-ADVANCE/MSS]**: Given a bankrupt current player, When `advanceTurnAfterBankruptcy` is executed, Then insolvency queues are cleaned up and turn advances to the next solvent player.
- **TC-423.04 [UC-FSM-DEADLOCK-PREVENTION/MSS]**: Given multi-debtor queue with turn player P0 bankrupt and creditor P1 solvent [B, S], When insolvency finishes, Then turn player deadlock is prevented and turn advances to next solvent player.
- **TC-423.05 [UC-FSM-CASCADE-BANKRUPTCY/MSS]**: Given cascade bankruptcy with multiple debtors P1 bankrupt and P2 bankrupt [B, B], When secondary bankruptcy resolves, Then game advances correctly or declares game over without hanging.
- **TC-423.06 [UC-FSM-POST-INSOLVENCY-RESTORE/MSS]**: Given a debtor who regained non-negative balance, When `restorePostInsolvencyPhase` executes, Then it symmetrically restores `preInsolvencyPhase`.
- **TC-423.07 [UC-FSM-CONSUMER-WIRING/MSS]**: Given production callers `turn_loop.ts` and `insolvency_manager.ts`, When executing turn end or bankruptcy, Then they actively invoke `fsm_transition_coordinator.ts`.
- **TC-423.08 [UC-CODEBASE-ZERO-CYCLE/MSS]**: Given the entire project source tree, When running boundary cycle analysis, Then 0 SCC circular dependency cycles are detected across all files.

---

## 5. Definition of Done (DoD) & Stopping Criteria
- **DoD #1 (Contract Suite)**: All 8 contract test scenarios in `imp423_server_fsm_coordinator_seam.test.ts` pass deterministically (100% GREEN).
- **DoD #2 (Zero Cycles)**: `npm run lint:boundaries` verifies 0 SCC cycles across all files in `src/**`.
- **DoD #3 (Zero Type Errors)**: `tsc --noEmit` exits with 0 errors.
- **DoD #4 (Zero Dirty Casts)**: 0 occurrences of `as any` or loose type bypasses.
- **DoD #5 (Fast Pre-Filter)**: `npm run prefilter` passes all mechanical checks.
- **DoD #6 (Evidence Audit)**: `node scripts/check_evidence.mjs imp-423` exits 0.
