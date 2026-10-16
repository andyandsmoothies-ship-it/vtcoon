# PLAN_IMP_413: Event Synthesizers Seam & Client Store Zero-Cycle (Nhóm 2 Slice 2E - Hardened Revision 3)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md) (Giai đoạn 2: Cắt đứt chu trình vòng & Mục 6.3), [`CODEBASE_REORGANIZATION_ROADMAP_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/CODEBASE_REORGANIZATION_ROADMAP_REPORT.md), and Adversarial Audit Brief [`.agents/audit/PLAN_CHALLENGE_IMP-413.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-413.md).
- **Subsystem Boundary Isolation**: Strictly confined to `client-state` across 3 cohesive families (`src/client/store/game`, `src/client/events`, `src/client/network`), satisfying `rules_scope.mjs` mechanical gate (0 cross-subsystem contamination, <= 3 cohesive units).
- **Problems**:
  1. **Monster Circular Dependency Cycle `[SCC-1]` (16 Files)**: The largest cycle in the client codebase spans 16 tightly coupled files across store, events, network, and telemetry (`game_store.ts` $\leftrightarrow$ `pacing_context.ts` / `activity_badge_dispatcher.ts` $\leftrightarrow$ `activity_trackers` $\leftrightarrow$ `game_event_synthesizers`). The root cause is `game_store.ts` directly importing outward into presentation/network timer cleanups (`clearPendingPacingTimers` and `clearPendingBadgeTimers`), violating clean inward dependency flow.
  2. **Residual 2-Node Sub-Cycle Trap in `game_event_financial_helpers.ts`**: Lines 241–243 re-export `extractBondEvents`, `extractCompulsoryBuyoutEvents`, and `extractHoseEvents` / `resetHoseEventTracker` from child helpers that themselves depend upon `game_event_financial_helpers.ts` (`game_event_hose_helpers.ts` imports `deductInflowFromDeltas` and `restoreDeltaOutflow`). If any re-export is retained in `financial_helpers`, an unbreakable 2-node cycle remains between `financial_helpers` $\leftrightarrow$ `hose_helpers`, preventing the total SCC count from reducing.
- **Architectural Solution & Seam Discipline**:
  1. **Thiết lập Seam `src/client/store/game_store_cleanup.ts`**: Provides `registerGameResetCleanup`, `executeGameResetCleanups`, and `clearAllGameResetCleanups`. Uses an idempotent `Set<GameResetCleanupHandler>` for $O(1)$ duplicate prevention during HMR/re-imports, and wraps each handler in an isolated `try...catch` block to guarantee `set(INITIAL_GAME_STATE)` is never blocked by handler exceptions.
  2. **Direct Module Ownership Registration**: Presentation and network producer modules (`pacing_context.ts`, `activity_badge_dispatcher.ts`) register their timer cleanups directly at module level (`registerGameResetCleanup(clearPendingPacingTimers)` and `registerGameResetCleanup(clearPendingBadgeTimers)`), inverting the dependency arrow so `game_store.ts` depends solely on its local store seam with 0 outward imports to events or network.
  3. **Khử Bỏ Hoàn Toàn Pseudo-Barrel Trong `src/client/events/game_event_financial_helpers.ts` (0 Re-Exports)**: Purges lines 241–243 completely (zero re-exports retained). Rewires `client_session_purger.ts` line 8 to import `resetHoseEventTracker` directly from source SSOT `../events/game_event_hose_helpers.js`. Rewires `game_event_financial_synthesizer.ts` to import `extractBondEvents`, `extractCompulsoryBuyoutEvents`, and `extractHoseEvents` directly from their dedicated source helpers (`game_event_bond_helpers.js`, `game_event_buyout_helpers.js`, `game_event_hose_helpers.js`), establishing a strictly acyclic DAG.
  4. **Triệt tiêu `[SCC-1]` Toàn Cục**: Eliminates the entire 16-file cycle AND the 2-node sub-cycle from `npm run lint:boundaries`, reducing total project-wide SCCs from 9 down to 8.

### Principles Applied
- **Deep Modules & Seam Discipline** -> Inverted timer cleanup dependency via `registerGameResetCleanup`, dissolving a 16-file circular dependency cycle while respecting component ownership boundaries.
- **Resource Disposal & Cache Hygiene** -> Mandated `Set<GameResetCleanupHandler>` deduplication in `game_store_cleanup.ts` to prevent HMR and repeated registration leaks, plus `clearAllGameResetCleanups()` for test isolation.
- **Partial Failure Resilience** -> Enforced isolated `try...catch` wrapper in `executeGameResetCleanups` to safeguard `set(INITIAL_GAME_STATE)`.
- **100% DTO & Call-Site Wiring** -> Every function exported by `game_store_cleanup.ts` has active production consumers across `game_store.ts`, `pacing_context.ts`, and `activity_badge_dispatcher.ts`.
- **Pure-Move Quarantine** -> Preserves 100% runtime timer cancellation behavior, state reset semantics, and financial event synthesis logic.
- **Equivalence-Partition Testing** -> Partitioned test suite across handler registration/unregistration, exception safety, store reset wiring parity, composite simultaneous cashflows, and project-wide Tarjan SCC cycle elimination.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/store/game_store_cleanup.ts` | Tier 1 (Store Seam) | 0 | 42 | ~+42 | 400 | Safe (New Seam) |
| `src/client/store/game_store.ts` | Tier 1 (Store Core) | 197 | 195 | ~-2 | 400 | Safe (Refactored) |
| `src/client/events/game_event_financial_helpers.ts` | Tier 1 (Event Seam) | 245 | 242 | ~-3 | 400 | Safe (Refactored) |
| `src/client/events/game_event_financial_synthesizer.ts` | Tier 1 (Event Seam) | 275 | 275 | ~+0 | 400 | Safe (Refactored) |
| `src/client/events/pacing_context.ts` | Tier 1 (Event Seam) | 133 | 135 | ~+2 | 400 | Safe (Refactored) |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Network Seam) | 209 | 211 | ~+2 | 400 | Safe (Refactored) |
| `src/client/network/client_session_purger.ts` | Tier 1 (Network Seam) | 60 | 60 | ~+0 | 400 | Safe (Refactored) |
| `tests/client/imp413_event_synthesizers_seam_and_store_zero_cycle.test.ts` | Living Test | 0 | 220 | ~+220 | 600 | Safe (New Living Test) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/store/game_store_cleanup.ts` (New Store Seam)
```typescript
export type GameResetCleanupHandler = () => void;

// Idempotent Set registration: cleanups.add(handler)
export function registerGameResetCleanup(handler: GameResetCleanupHandler): () => void;

// Wrapped in try-catch to ensure set(INITIAL_GAME_STATE) is never blocked
export function executeGameResetCleanups(): void;

// Test isolation helper
export function clearAllGameResetCleanups(): void;
```

**Target physical file**: `src/client/store/game_store.ts` (Refactored)
```typescript
// Removes outward imports of clearPendingPacingTimers and clearPendingBadgeTimers
// Consumes executeGameResetCleanups from ./game_store_cleanup.js
export const useGameStore: UseBoundStore<StoreApi<GameState>>;
```

**Target physical file**: `src/client/events/game_event_financial_helpers.ts` (Refactored)
```typescript
// Purges 100% of lines 241-243 pseudo-barrel re-exports (zero re-exports remain)
// Retains pure calculation helpers: buildRegistryAndStateMap, restoreDeltaOutflow, deductInflowFromDeltas, etc.
```

**Target physical file**: `src/client/events/game_event_financial_synthesizer.ts` (Refactored)
```typescript
// Imports extractBondEvents from ./game_event_bond_helpers.js
// Imports extractCompulsoryBuyoutEvents from ./game_event_buyout_helpers.js
// Imports extractHoseEvents from ./game_event_hose_helpers.js
export function synthesizeFinancialEvents(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  timestamp?: number,
): SynthesizedFinancialResult;
```

**Target physical file**: `src/client/events/pacing_context.ts` (Refactored)
```typescript
// Registers clearPendingPacingTimers directly with registerGameResetCleanup
export function clearPendingPacingTimers(): void;
```

**Target physical file**: `src/client/network/activity_badge_dispatcher.ts` (Refactored)
```typescript
// Registers clearPendingBadgeTimers directly with registerGameResetCleanup
export function clearPendingBadgeTimers(): void;
```

**Target physical file**: `src/client/network/client_session_purger.ts` (Refactored)
```typescript
// Line 8: Rewires import from ../events/game_event_financial_helpers.js to ../events/game_event_hose_helpers.js
import { resetHoseEventTracker } from '../events/game_event_hose_helpers.js';
```

### Call-Site Wiring & Integration Anchors
- **`src/client/store/game_store.ts`**:
  - Replaces `clearPendingPacingTimers(); clearPendingBadgeTimers();` in `resetGameState()` with `executeGameResetCleanups()`.
- **`src/client/events/pacing_context.ts`**:
  - Registers `registerGameResetCleanup(clearPendingPacingTimers)` at module level.
- **`src/client/network/activity_badge_dispatcher.ts`**:
  - Registers `registerGameResetCleanup(clearPendingBadgeTimers)` at module level.
- **`src/client/network/client_session_purger.ts`**:
  - Rewires `resetHoseEventTracker` import from `game_event_financial_helpers.js` directly to `game_event_hose_helpers.js`.
- **`src/client/events/game_event_financial_synthesizer.ts`**:
  - Rewires imports of `extractBondEvents`, `extractCompulsoryBuyoutEvents`, and `extractHoseEvents` directly to their respective dedicated helper modules.

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp413_event_synthesizers_seam_and_store_zero_cycle.test.ts`)

- **TC-413.01 [UC-GAME-RESET-CLEANUP-REGISTRATION-AND-EXECUTION/MSS]**: Given multiple registered cleanup handlers via `registerGameResetCleanup`, When `executeGameResetCleanups()` executes, Then each handler is invoked once; unregistering via the returned closure removes the handler; handlers throwing exceptions are safely isolated in `try...catch` without halting subsequent cleanups; and `clearAllGameResetCleanups()` restores an empty registry for test isolation.
- **TC-413.02 [UC-GAME-STORE-RESET-WIRING-PARITY/MSS]**: Given `useGameStore.getState().resetGameState()`, When invoked, Then proves registered cleanup callbacks (`clearPendingPacingTimers` and `clearPendingBadgeTimers`) are triggered and store state is cleanly reset to `INITIAL_GAME_STATE`; AND static AST inspection proves `game_store.ts` contains 0 imports from `pacing_context` or `activity_badge_dispatcher`.
- **TC-413.03 [UC-FINANCIAL-HELPERS-PSEUDO-BARREL-PURGE/MSS]**: Given `game_event_financial_synthesizer.ts`, When executing `extractBondEvents`, `extractCompulsoryBuyoutEvents`, and `extractHoseEvents` during composite simultaneous bidirectional cashflows (simultaneous inflow alongside outflow with salary and bond repayment), Then delegates directly to their respective source helper files (`game_event_bond_helpers.js`, `game_event_buyout_helpers.js`, `game_event_hose_helpers.js`) without netting collision; verifies `game_event_financial_helpers.ts` contains 0 re-exports of child helpers; and proves `client_session_purger.ts` imports `resetHoseEventTracker` directly from `game_event_hose_helpers.js`, establishing a strictly acyclic dependency DAG ($A \to B \not\to A$).
- **TC-413.04 [UC-PROJECT-WIDE-ZERO-CYCLE-SCC-1-ELIMINATION/MSS]**: Given the project source dependency graph, When evaluated via Tarjan strongly connected components (SCC), Then proves cycle `[SCC-1]` (16 files) AND the residual 2-node sub-cycle between `financial_helpers` and `hose_helpers` are 100% completely eliminated, reducing total project-wide SCCs from 9 to 8.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_413_EVENT_SYNTHESIZERS_SEAM_AND_STORE_ZERO_CYCLE.md --auto-sign`
  2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_413_EVENT_SYNTHESIZERS_SEAM_AND_STORE_ZERO_CYCLE.md`
  3. `npx --yes tsc --noEmit` (Exit 0)
  4. `npm run lint:boundaries` (Verifies `[SCC-1]` is dissolved, total SCC count drops from 9 to 8)
  5. `npm run prefilter -- src/client/store/game_store_cleanup.ts src/client/store/game_store.ts src/client/events/game_event_financial_helpers.ts src/client/events/game_event_financial_synthesizer.ts src/client/events/pacing_context.ts src/client/network/activity_badge_dispatcher.ts src/client/network/client_session_purger.ts tests/client/imp413_event_synthesizers_seam_and_store_zero_cycle.test.ts`
  6. **Evidence Snapshot Collection (Tier 1.5 Structural Refactor)**:
     `node scripts/collect_evidence.mjs imp-413 tests/client/imp413_event_synthesizers_seam_and_store_zero_cycle.test.ts && npm run report -- imp-413 && node scripts/check_evidence.mjs imp-413`
  7. **Regression verification (100% Living Test Parity)**:
     `npx --yes vitest run tests/client/imp413_event_synthesizers_seam_and_store_zero_cycle.test.ts tests/client/imp380_financial_narrative_transparency.test.ts tests/client/imp386_authoritative_bond_lifecycle.test.ts tests/client/imp387_authoritative_hose_emission.test.ts tests/contracts/imp201_client_session_lifecycle_purge.test.ts tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts`

---

## 6. Definition of Done (DoD)
- [ ] `src/client/store/game_store_cleanup.ts` created with `<= 50 LOC`, exporting `registerGameResetCleanup`, `executeGameResetCleanups`, and `clearAllGameResetCleanups`.
- [ ] `src/client/store/game_store.ts` purges outward imports of `pacing_context` and `activity_badge_dispatcher`, invoking `executeGameResetCleanups` on reset.
- [ ] `src/client/events/pacing_context.ts` registers `clearPendingPacingTimers` with `registerGameResetCleanup`.
- [ ] `src/client/network/activity_badge_dispatcher.ts` registers `clearPendingBadgeTimers` with `registerGameResetCleanup`.
- [ ] `src/client/network/client_session_purger.ts` rewires `resetHoseEventTracker` directly to `game_event_hose_helpers.js`.
- [ ] `src/client/events/game_event_financial_helpers.ts` purges lines 241–243 pseudo-barrel re-exports completely (zero re-exports).
- [ ] `src/client/events/game_event_financial_synthesizer.ts` rewires imports directly to dedicated helper source files.
- [ ] `npm run lint:boundaries` confirms `[SCC-1]` completely dissolved and total project-wide SCCs reduce from 9 to 8.
- [ ] Living test suite `tests/client/imp413_event_synthesizers_seam_and_store_zero_cycle.test.ts` passes 100% across 4 atomic tests.
- [ ] 100% regression tests pass in `imp380`, `imp386`, `imp387`, and both `imp201` test suites.
- [ ] `check_evidence.mjs imp-413` exits `0`.
