# PLAN_IMP_417: Luxury Pawn Models Seam & Circular Dependency Purge

## 1. Context & Architectural Goal
- **Source Strategy**: Boundary audit `npm run lint:boundaries` detected `[SCC-2]` (3 files in cycle): `legacy_pawn_fallbacks.tsx` -> `luxury_pawn_fallbacks.tsx` -> `luxury_pawn_models.tsx`.
- **Classification**: Tier 1.5 Structural Refactor (0 FSM changes, 0 economic math changes, 0 DOM layout shifts). Main Agent executes directly.
- **Subsystem Boundary Isolation**: Strictly confined to `src/client/3d/` (`client-3d` subsystem, 2 cohesive units: `legacy_pawn`, `luxury_pawn`, <= 3 units max).
- **Problems**:
  1. `legacy_pawn_fallbacks.tsx` (line 3) and `luxury_pawn_fallbacks.tsx` (line 3) import `type { LuxuryPawnConfig }` from `./luxury_pawn_models`.
  2. `luxury_pawn_models.tsx` imports procedural pawn fallbacks from `luxury_pawn_fallbacks.tsx`, forming a circular dependency loop (`[SCC-2]`).
- **Architectural Solution & Seam Discipline**:
  1. Rewire import of `type { LuxuryPawnConfig }` in both fallback files directly to public facade `../../domain` (Subsystem Facade Invariant).
  2. Completely eliminate `[SCC-2]` circular dependency in `src/client/3d/`.
  3. Pure-Move Quarantine: Preserve 100% procedural 3D fallback meshes, materials, and geometry disposal behavior.

### Principles Applied
- **Subsystem Facade Invariant** -> Domain types consumed from domain public facade `../../domain` directly.
- **Zero Circular Dependency Invariant** -> Purges [SCC-2], reducing project strongly connected components from 8 to 7.
- **Pure-Move Quarantine** -> Preserves 100% 3D procedural pawn fallback meshes and materials without semantic shifts.
- **Equivalence-Partition Testing** -> Partitioned across Tarjan SCC cycle elimination, AST import source verification, and procedural fallback rendering.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/legacy_pawn_fallbacks.tsx` | Tier 2 (3D Visuals) | 136 | 136 | 0 | 500 | Safe (Domain Facade Import) |
| `src/client/3d/luxury_pawn_fallbacks.tsx` | Tier 2 (3D Visuals) | 297 | 297 | 0 | 500 | Safe (Domain Facade Import) |
| `tests/client/imp417_luxury_pawn_seam_and_zero_cycle.test.ts` | Living Test | 0 | 100 | ~+100 | 600 | Safe (New Living Test) |

---

## 3. Call-Site Wiring & Facade Specification

**Target physical file**: `src/client/3d/legacy_pawn_fallbacks.tsx` (Call-Site Wiring)
- Basename: `legacy_pawn_fallbacks.tsx`
- Wiring: Decouple from `./luxury_pawn_models` by importing `type { LuxuryPawnConfig }` directly from `../../domain`.

**Target physical file**: `src/client/3d/luxury_pawn_fallbacks.tsx` (Call-Site Wiring)
- Basename: `luxury_pawn_fallbacks.tsx`
- Wiring: Decouple from `./luxury_pawn_models` by importing `type { LuxuryPawnConfig }` directly from `../../domain`.

---

## 4. Station 1 Contract Test Specifications (Lean Invariants)

- **TC-417.01 [UC-PAWN-SEAM-ZERO-CYCLE/MSS]**: Given the 3 pawn 3D modules, When executing Tarjan SCC cycle analysis via `detectCycles`, Then proves zero circular dependency cycles exist among them.
- **TC-417.02 [UC-PAWN-CONFIGS-IMPORT-DECOUPLING/MSS]**: Given `legacy_pawn_fallbacks.tsx` and `luxury_pawn_fallbacks.tsx`, When inspecting AST import declarations, Then neither imports from `luxury_pawn_models` and both import `LuxuryPawnConfig` from `../../domain`.
- **TC-417.03 [UC-PAWN-FALLBACK-RUNTIME-INTEGRITY/MSS]**: Given valid pawn configurations, When rendering `RookPawnFallback`, `CannonPawnFallback`, `WarhorsePawnFallback`, and `QueenPawnFallback`, Then generates valid React elements without runtime errors.
- **TC-417.03b [UC-LEGACY-FALLBACK-RUNTIME-INTEGRITY/MSS]**: Given valid pawn configurations, When rendering `LandmarkTowerPawnFallback`, `BayYachtPawnFallback`, and `ClassicCarPawnFallback`, Then generates valid React elements without runtime errors.

---

## 5. Regression Verification Plan

Execute the new contract test alongside living pawn suites:
```bash
npx --yes vitest run tests/client/imp417_luxury_pawn_seam_and_zero_cycle.test.ts tests/client/luxury_pawn_models.test.ts tests/contracts/imp242_luxury_pawn_geometry_consolidation.test.ts tests/client/tall_chess_pawns_full_color.test.ts
```

Execute evidence audit:
```bash
node scripts/check_evidence.mjs imp-417
```

---

## 6. Definition of Done (DoD) & Stopping Criteria

1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_417_LUXURY_PAWN_SEAM_AND_ZERO_CYCLE.md --auto-sign` passes with 0 defects.
2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_417_LUXURY_PAWN_SEAM_AND_ZERO_CYCLE.md` passes with 0 scope leaks.
3. `npm run lint:boundaries` confirms `[SCC-2]` is completely eradicated.
4. `npm run prefilter -- src/client/3d/legacy_pawn_fallbacks.tsx src/client/3d/luxury_pawn_fallbacks.tsx tests/client/imp417_luxury_pawn_seam_and_zero_cycle.test.ts` passes with 0 warnings/errors.
5. All 4 Vitest test suites (88 existing + 4 new tests = 92 tests) pass 100% green.
6. `node scripts/check_evidence.mjs imp-417` passes with 0 failures.
