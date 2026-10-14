# IMPLEMENTATION PLAN: IMP-394 — Domain Zero-Cycle & Room Schema Integrity (Phase 2 — Cluster 2A)

## 1. Objective & Scope Summary

- **Ticket ID**: `IMP-394`
- **Phase**: Phase 2 (Cluster 2A — Domain Zero-Cycle & Room Schema Integrity)
- **Root Cause & Goal**:
  - Following `IMP-391`..`IMP-393`, the core domain layer (`src/domain/**`) has only **1 remaining circular dependency (`SCC-1`)** and **3 cross-layer schema monkey-patches**:
    1. **`SCC-1` (`src/domain/event_card_types.ts` <-> `src/domain/room.ts`)**:
       - `src/domain/event_card_types.ts` line 56 has a backward type re-export `export type { MarketModifier } from './room.js';`, while `src/domain/room.ts` line 2 imports `type { MarketCardId, ChanceCardId } from './event_card_types'`.
       - Because `MarketModifier` only depends on leaf types (`MarketCardId`, `ChanceCardId`, `MacroCycleType` from `./macro_cycle_types`, and `ColorGroup` from `./board_config`), moving the canonical `export interface MarketModifier` definition into `src/domain/event_card_types.ts` and re-exporting it from `src/domain/room.ts` breaks `SCC-1` and achieves **0 circular dependencies across `src/domain/**`**.
    2. **Cross-Layer `declare module '../domain/room'` Monkey-Patches (`insolvency_manager.ts`, `mortgage_manager.ts`, `afk_recovery.ts`)**:
       - `src/server/insolvency_manager.ts` lines 8–13, `src/server/mortgage_manager.ts` lines 9–11, and `src/server/network/afk_recovery.ts` lines 8–12 use TypeScript module augmentation (`declare module`) to inject `pendingInsolvencyQueue?: string[]` and `preInsolvencyPhase?: TurnPhase` onto `Room`.
       - Declaring `pendingInsolvencyQueue?: string[]` and `preInsolvencyPhase?: TurnPhase` canonically inside `export interface Room` in `src/domain/room.ts` and removing the `declare module` blocks from all three server files eliminates 100% of module augmentation hacks on `Room` and pulls `src/server/insolvency_manager.ts` from `354` LOC down to `347` LOC (below the 350 LOC Tier 1 Red Buffer Zone).
- **Architecture & Governance Alignment**:
  - **Pure-Move Quarantine**: 100% preservation of runtime behavior and exported type contracts across `src/domain/event_card_types.ts`, `src/domain/room.ts`, `src/server/insolvency_manager.ts`, `src/server/mortgage_manager.ts`, and `src/server/network/afk_recovery.ts`.
  - **Seam Discipline**: Eliminates all `declare module '../domain/room'` monkey-patching across `src/server/**`.

### Table 2: Physical LOC Accounting & Budget Verification

| Target Physical File | Tier | Current LOC | Expected LOC | Net Delta | Ceiling | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/domain/event_card_types.ts` | Tier 1 (Domain) | 56 | 64 | ~ +8 | 400 | Safe |
| `src/domain/room.ts` | Tier 1 (Domain) | 346 | 341 | ~ -5 | 400 | ⚠️ Warning (Tech Debt: IMP-394-TD1) |
| `src/server/insolvency_manager.ts` | Tier 1 (Server) | 354 | 347 | ~ -7 | 400 | ⚠️ Warning (Tech Debt: IMP-394-TD2) |
| `src/server/mortgage_manager.ts` | Tier 1 (Server) | 268 | 264 | ~ -4 | 400 | Safe |
| `src/server/network/afk_recovery.ts` | Tier 1 (Server) | 240 | 234 | ~ -6 | 400 | Safe |
| `docs/FEATURE_MAP.md` | Tier 3 (Docs) | 93 | 93 | ~ +0 | 800 | Safe |
| `tests/domain/imp394_domain_zero_cycle_and_schema_integrity.test.ts` | Test Suite | 0 | 115 | ~ +115 | 600 | Safe (New) |

---

## 2. Implementation Tasks

### Task 1: Eliminate `SCC-1` by Moving Canonical `MarketModifier` Definition to `src/domain/event_card_types.ts`
- **Target physical file**: `src/domain/event_card_types.ts`
- **Target physical file**: `src/domain/room.ts`
- **Design Specification**:
  1. In `src/domain/event_card_types.ts`:
     - Import leaf types `type { MacroCycleType } from './macro_cycle_types.js'` and `type { ColorGroup } from './board_config.js'`.
     - Replace `export type { MarketModifier } from './room.js';` at line 56 with the canonical `export interface MarketModifier` definition (preserving all fields: `readonly type: MarketCardId | ChanceCardId | MacroCycleType`, `readonly affectedCells: readonly number[]`, `remainingRounds: number`, `readonly multiplier?: number`, `readonly beneficiaryId?: string`, `readonly colorGroup?: ColorGroup`).
  2. **Call-Site Wiring (`src/domain/room.ts`)**:
     - Import `type { MarketCardId, ChanceCardId, MarketModifier } from './event_card_types'` and re-export `export type { MarketModifier } from './event_card_types'` for 100% backward compatibility with all existing callers importing `MarketModifier` from `src/domain/room.ts`.
     - Remove the duplicate local `export interface MarketModifier` declaration from `src/domain/room.ts`.

### Task 2: Promote `pendingInsolvencyQueue` & `preInsolvencyPhase` into Canonical `Room` Interface and Purge `declare module`
- **Target physical file**: `src/server/insolvency_manager.ts`
- **Design Specification**:
  1. **Call-Site Wiring (`src/domain/room.ts`)**:
     - Add `pendingInsolvencyQueue?: string[];` and `preInsolvencyPhase?: TurnPhase;` directly to `export interface Room` alongside `pendingInsolvencyDebtorId` and `pendingInsolvencyCreditorId`.
  2. In `src/server/insolvency_manager.ts`:
     - Delete the `declare module '../domain/room' { interface Room { pendingInsolvencyQueue?: string[]; preInsolvencyPhase?: TurnPhase; } }` block (lines 8–13), reducing `src/server/insolvency_manager.ts` from `354` LOC to `347` LOC.
  3. **Call-Site Wiring (`src/server/mortgage_manager.ts`, `src/server/network/afk_recovery.ts`, `docs/FEATURE_MAP.md`)**:
     - Delete `declare module '../domain/room' { interface Room { pendingInsolvencyQueue?: string[]; } }` from `src/server/mortgage_manager.ts` (lines 9–11) and `declare module '../../domain/room.js' { interface Room { pendingInsolvencyQueue?: string[]; } }` from `src/server/network/afk_recovery.ts` (lines 8–12).
     - Update Pillar 01 row in `docs/FEATURE_MAP.md` (preserving 93 lines) to record `IMP-394` (`0 SCC` in `src/domain/**` and canonical `Room` insolvency schema).

---

## 3. Verification & Stations Plan

### Station 1: Contract Testing (`tests/domain/imp394_domain_zero_cycle_and_schema_integrity.test.ts`)
- `TC-394.01 [UC-ARCH-002/MSS]`: Given the AST import graph across `src/domain/**`, When Tarjan's strongly connected components algorithm is executed on all domain files, Then **0 circular dependency SCCs** (`SCC-1` between `event_card_types.ts` and `room.ts` eliminated) are found in `src/domain/**`.
- `TC-394.02 [UC-ARCH-002/A1]`: Given `src/domain/event_card_types.ts` and `src/domain/room.ts`, When inspecting their AST import/export declarations, Then `event_card_types.ts` defines `interface MarketModifier` directly with zero imports from `./room`, while `room.ts` re-exports `MarketModifier` from `./event_card_types`.
- `TC-394.03 [UC-ARCH-002/A2]`: Given `src/domain/room.ts`, `src/server/insolvency_manager.ts`, `src/server/mortgage_manager.ts`, and `src/server/network/afk_recovery.ts`, When inspecting their source ASTs, Then `room.ts` declares `pendingInsolvencyQueue` and `preInsolvencyPhase` directly on `interface Room`, and all three server files contain zero `declare module` augmentations.
- `TC-394.04 [UC-GAME-053/MSS]`: Given a `Room` created via `createRoom('p1', 'VT394A')` in `TurnPhase.ActionPhase` where `p1` balance drops to `-500`, When `checkInsolvency(room, 'p2', 'p1')` from `src/server/insolvency_manager.ts` is executed, Then `room.phase` transitions to `TurnPhase.InsolvencyPhase` and `room.preInsolvencyPhase` is recorded as `TurnPhase.ActionPhase` using the canonical `Room` schema fields.
- `TC-394.05 [UC-DEADLOCK/A1]`: Given a 3-player `Room` with `room.pendingInsolvencyQueue = ['p2']` where turn player `p1` is bankrupt (`balance = -500`, 0 assets) and `p2` is solvent (`balance = 1500`) after composite inflow/outflow settlement, When `declareBankruptcy(room)` from `src/server/insolvency_manager.ts` is executed, Then turn player bankruptcy deadlock prevention advances turn cleanly without stalling `InsolvencyPhase`.
- `TC-394.06 [UC-CASCADE/A2]`: Given a 3-player `Room` with `room.pendingInsolvencyQueue = ['p2']` where both `p1` (`balance = -500`) and queued debtor `p2` (`balance = -400`) suffer consecutive cascade bankruptcy, When `declareBankruptcy(room)` is executed sequentially for `p1` and `p2`, Then `room.pendingInsolvencyDebtorId` transitions from `'p1'` to `'p2'` and resolves to game over with `'p3'` as the sole survivor.

### Station 3 & 3.5: Mechanical Gates & Chaos Sentinel
- `npm run prefilter -- src/domain/event_card_types.ts src/domain/room.ts src/server/insolvency_manager.ts src/server/mortgage_manager.ts src/server/network/afk_recovery.ts tests/domain/imp394_domain_zero_cycle_and_schema_integrity.test.ts`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_394_DOMAIN_ZERO_CYCLE_AND_SCHEMA_INTEGRITY.md`
- `npm run lint:boundaries` (Verify `SCC-1` is completely eliminated and `src/domain/**` has 0 SCCs).
- `npm run sentinel -- --ticket IMP-394 --test tests/domain/imp394_domain_zero_cycle_and_schema_integrity.test.ts`

---

## 4. Definition of Done (DoD) & Stopping Criteria

1. All 6 contract tests (`TC-394.01`..`TC-394.06`) fail on behavioral/AST assertions in Station 2 (RED) and pass 100% in Station 2.5 (GREEN).
2. `npm run lint:boundaries` confirms `SCC-1` (`event_card_types.ts` <-> `room.ts`) is 100% eliminated, leaving **0 circular dependencies across `src/domain/**`**.
3. `npm run prefilter`, `node scripts/check_scope.mjs`, `npm run sentinel`, and `node scripts/check_evidence.mjs IMP-394` pass with 0 defects.


