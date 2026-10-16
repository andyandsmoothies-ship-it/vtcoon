# PLAN_IMP_418: Board Layout Tile Rotation Math Seam & Circular Dependency Purge

## 1. Context & Architectural Goal
- **Source Strategy**: Boundary audit `npm run lint:boundaries` detected `[SCC-2]` (3 files in cycle): `instanced_toy_buildings.tsx` -> `board_layout.tsx` -> `batched_board_tiles.tsx`.
- **Classification**: Tier 1.5 Structural Refactor (0 FSM changes, 0 economic math changes, 0 DOM layout shifts). Main Agent executes directly.
- **Subsystem Boundary Isolation**: Strictly confined to `src/client/3d/` (`client-3d` subsystem, cohesive units: `board`, `instanced`, `batched`).
- **Problems**:
  1. `instanced_toy_buildings.tsx` (line 6) and `batched_board_tiles.tsx` (line 12) import `tileRotation` from `./board_layout`.
  2. `board_layout.tsx` imports `InstancedBoardToyBuildings` (line 16) and `BatchedBoardTiles` (line 17), forming a strongly connected circular cycle (`[SCC-2]`).
- **Architectural Solution & Seam Discipline**:
  1. Extract pure math function `tileRotation` into new leaf module `src/client/3d/board_layout_math.ts` (Tier 1 Seam <= 50 LOC, 0 dependencies).
  2. Rewire `instanced_toy_buildings.tsx`, `batched_board_tiles.tsx`, and `board_layout.tsx` to import `tileRotation` from `./board_layout_math.js`.
  3. Retain re-export `export { tileRotation }` in `board_layout.tsx` as a transitional shim (Phase 1) to preserve backward compatibility for 21 living test callers without breaking changes.
  4. Schedule Phase 2 technical debt decommission: modernize living test callers to import directly from `board_layout_math.js`, then purge the re-export shim.
  5. Pure-Move Quarantine: Preserve 100% mathematical tile rotation calculations and boundary fallbacks.

### Principles Applied
- **View-Model Seam Extraction** -> Pure tile rotation math isolated into zero-dependency calculation seam.
- **Wiring Parity Invariant** -> Verifies both isolated math formulas and physical consumer call-sites in `instanced_toy_buildings` & `batched_board_tiles`.
- **Zero Circular Dependency Invariant** -> Eradicates 3-file circular dependency cycle in `src/client/3d/`.
- **Pure-Move Quarantine** -> Preserves 100% numerical rotation behavior across all 40 board tiles.
- **Equivalence-Partition Testing** -> Partitioned across Tarjan SCC cycle elimination, AST import source verification, and coordinate rotation parity.
- **Relational Multi-Point Assertion** -> Verifies multi-point non-equality across distinct board sides to prevent hardcoded returns.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/board_layout_math.ts` | Tier 1 (Pure Math Seam) | 0 | 18 | +18 | 50 | Safe (New Pure Math Seam) |
| `src/client/3d/board_layout.tsx` | Tier 2 (3D Visuals) | 253 | 253 | 0 | 500 | Safe (Imports Seam & Re-exports) |
| `src/client/3d/instanced_toy_buildings.tsx` | Tier 2 (3D Visuals) | 185 | 185 | 0 | 500 | Safe (Decoupled to Math Seam) |
| `src/client/3d/batched_board_tiles.tsx` | Tier 2 (3D Visuals) | 179 | 179 | 0 | 500 | Safe (Decoupled to Math Seam) |
| `tests/client/imp418_board_layout_math_seam.test.ts` | Living Test | 0 | 111 | +111 | 600 | Safe (New Contract Suite) |

---

## 3. Drop-In Replacement Snippets & New Code Specifications

- **Target physical file**: `src/client/3d/board_layout_math.ts` (New file)
```typescript
// [UI-S01/MSS][IMP-418] Board Layout Math Seam — Pure tile rotation math
export function tileRotation(index: number): [number, number, number] {
  if (typeof index !== 'number' || Number.isNaN(index) || index < 0 || index > 39) {
    return [0, 0, 0];
  }
  if (index === 0) {
    return [0, Math.PI / 4, 0];
  }
  const side = Math.floor(index / 10);
  switch (side) {
    case 0: return [0, 0, 0];
    case 1: return [0, -Math.PI / 2, 0];
    case 2: return [0, Math.PI, 0];
    default: return [0, Math.PI / 2, 0];
  }
}
```

- **Target physical file**: `src/client/3d/board_layout.tsx`
```typescript
<<<<
import { cellPosition, tileRotation } from './board_coords';
====
import { cellPosition } from './board_coords';
import { tileRotation } from './board_layout_math.js';
>>>>
```

- **Target physical file**: `src/client/3d/instanced_toy_buildings.tsx`
```typescript
<<<<
import { tileRotation } from './board_layout';
====
import { tileRotation } from './board_layout_math.js';
>>>>
```

- **Target physical file**: `src/client/3d/batched_board_tiles.tsx`
```typescript
<<<<
import { tileRotation } from './board_layout';
====
import { tileRotation } from './board_layout_math.js';
>>>>
```

---

## 4. Station 1 Contract Test Specifications (Lean Invariants)

- **TC-418.01 [UC-BOARD-MATH-ZERO-CYCLE/MSS]**: Given the 4 board layout modules, When executing Tarjan SCC cycle analysis via `detectCycles`, Then proves zero circular dependency cycles exist among them.
- **TC-418.02 [UC-BOARD-MATH-AST-DECOUPLING/MSS]**: Given `instanced_toy_buildings.tsx` and `batched_board_tiles.tsx`, When inspecting AST import declarations, Then neither imports from `./board_layout` and both import `tileRotation` from `./board_layout_math.js`.
- **TC-418.03 [UC-BOARD-MATH-COVARIANCE-AND-FALLBACK/MSS]**: Given tile indices across 4 distinct board sides and boundary limits, When calling `tileRotation`, Then yields distinct perpendicular orientations with safe zero fallback for out-of-range inputs.
- **TC-418.04 [UC-BOARD-MATH-CONSUMER-TOY-MATRIX/MSS]**: Given `instanced_toy_buildings` consumer, When `composeToyWorldMatrix` is invoked for GO and West side, Then world matrix rotation transforms accurately match `tileRotation` yaw angles.
- **TC-418.05 [UC-BOARD-MATH-CONSUMER-BATCHED-TILES/MSS]**: Given `batched_board_tiles` consumer, When invoking `createBatchedTileSurfacesGeometry`, Then generates merged geometry with valid bounding box computed from oriented tile matrices.

---

## 5. Regression Verification Plan

Execute the contract test alongside living board layout suites:
```bash
npx --yes vitest run tests/client/imp418_board_layout_math_seam.test.ts tests/client/ui01_board.test.ts tests/client/imp127_tile_orientation_and_bailout_sync.test.ts tests/client/imp363_batched_board_tiles.test.ts tests/contracts/imp_perf_threejs_instancing.test.ts
```

Execute evidence audit:
```bash
node scripts/check_evidence.mjs imp-418
```

---

## 6. Definition of Done (DoD) & Technical Debt Decommission Roadmap

1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_418_BOARD_LAYOUT_MATH_SEAM.md --auto-sign` passes with 0 defects.
2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_418_BOARD_LAYOUT_MATH_SEAM.md` passes with 0 scope leaks.
3. `npm run lint:boundaries` confirms the 3-file cycle is completely eradicated.
4. `npm run prefilter -- src/client/3d/board_layout_math.ts src/client/3d/board_layout.tsx src/client/3d/instanced_toy_buildings.tsx src/client/3d/batched_board_tiles.tsx tests/client/imp418_board_layout_math_seam.test.ts` passes with 0 warnings/errors.
5. All living board layout and batching test suites pass 100% green.
6. `node scripts/check_evidence.mjs imp-418` passes with 0 failures.
7. Technical Debt Tracking (Phase 2): Schedule modernization of 21 living test callers importing from `board_layout` to consume `board_layout_math.js`, followed by removing `export { tileRotation }` from `board_layout.tsx`.
