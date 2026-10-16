# PLAN_IMP_409: Client-3D Zero-Cycle & Camera State Machine Pure Seams (Harness V6.0)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md) (Section 3 & 4) & [`VTCOON_SDLC_HARNESS_AND_SPATIAL_HARDENING_PROPOSAL_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/VTCOON_SDLC_HARNESS_AND_SPATIAL_HARDENING_PROPOSAL_REPORT.md).
- **Epic Context**: Nhóm 2 — Tái Cấu Trúc Kiến Trúc & AI-Native Facades. Slice 2A focuses strictly on eliminating `client-3d` circular dependencies (`SCC-2` and `SCC-4`) and establishing pure type/math seams without runtime behavioral shifts.
- **Subsystem Boundary Isolation**: Slices 3 cohesive units within `src/client/3d/` (`camera`, `cinematic`, `monopoly`), maintaining 0 cross-subsystem contamination and strictly respecting `rules_scope.mjs`.
- **Problems**:
  1. `[SCC-2]` (3 files in loop): `camera_state_machine.ts` $\leftrightarrow$ `cinematic_chase_camera.ts` $\leftrightarrow$ `cinematic_spline_flyby.ts`. The state machine orchestrates chase and spline cameras, but both leaf strategies import `type TargetCameraState` and `calculateTileFocusCameraPosition` back from the state machine, causing a tight circular loop.
  2. `[SCC-4]` (2 files in loop): `monopoly_plaza_visuals.ts` $\leftrightarrow$ `monopoly_mobile_archway_visuals.ts`. `monopoly_plaza_visuals.ts` re-exports domino shockwave math functions (`calculateDominoRippleTransform`, `getCircularCellDistance`, `resolveNeighborDominoSlam`) from `monopoly_mobile_archway_visuals.ts` (line 311) as a pseudo-barrel, while `monopoly_mobile_archway_visuals.ts` imports boulevard segments from `monopoly_plaza_visuals.ts`.
- **Refactor-First Pure-Move Solution**:
  1. **Camera Pure Type Seam ([`src/client/3d/camera_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_types.ts))**:
     - Pure-move exact physical types `CameraMode`, `TargetCameraState`, and `TargetCameraStateOptions` (with all 11 properties) into a dedicated pure type seam.
     - `cinematic_chase_camera.ts` and `cinematic_spline_flyby.ts` import from `camera_types.ts`.
     - `cinematic_spline_flyby.ts` imports `calculateTileFocusCameraPosition` from `./camera_kinematic_helpers.ts` (where it physically lives).
     - `camera_state_machine.ts` imports from `camera_types.ts` and orchestrates leaf strategies downward as an acyclic DAG, re-exporting types for backward compatibility.
  2. **Domino Ripple Kinematics Seam ([`src/client/3d/monopoly_plaza_math.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/monopoly_plaza_math.ts))**:
     - Pure-move `calculateDominoRippleTransform`, `getCircularCellDistance`, `resolveNeighborDominoSlam`, and `resolveMobilePoolDominoSlam` alongside exact `DominoRippleOptions` and `DominoRippleTransform` into `monopoly_plaza_math.ts`.
     - Redirect line 311 in `monopoly_plaza_visuals.ts` to re-export from `./monopoly_plaza_math` (protecting `procedural_building.tsx`, `monopoly_plaza_fusion.tsx`, and `imp401` test suite).
     - Re-export domino math from `monopoly_mobile_archway_visuals.ts` pointing to `./monopoly_plaza_math` (protecting `imp406` test suite).
     - 100% of existing imports and callers preserve exact signatures with zero behavioral drift.

### Principles Applied
- **View-Model Seam Extraction** -> Extracted pure camera contracts (`camera_types.ts`) and pure domino kinematics (`monopoly_plaza_math.ts`).
- **Deep Modules & Seam Discipline** -> Transformed bidirectional circular dependencies into clean acyclic Directed Acyclic Graphs (DAG); co-located `resolveMobilePoolDominoSlam` to avoid secondary loops.
- **Pure-Move Quarantine** -> Preserved 100% mathematical calculations, coordinate mappings, and living test contracts.
- **Subsystem Facade Invariant** -> Redirected leaf re-exports toward pure math seams instead of sibling leaf modules.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/camera_types.ts` | Tier 2 (3D) | 0 | 45 | ~+45 | 500 | Safe (New) |
| `src/client/3d/camera_state_machine.ts` | Tier 2 (3D) | 308 | 302 | ~-6 | 500 | Safe (Refactored) |
| `src/client/3d/cinematic_chase_camera.ts` | Tier 2 (3D) | 265 | 265 | ~+0 | 500 | Safe (Refactored) |
| `src/client/3d/cinematic_spline_flyby.ts` | Tier 2 (3D) | 132 | 133 | ~+1 | 500 | Safe (Refactored) |
| `src/client/3d/monopoly_plaza_math.ts` | Tier 2 (3D) | 109 | 194 | ~+85 | 500 | Safe (Refactored) |
| `src/client/3d/monopoly_plaza_visuals.ts` | Tier 2 (3D) | 316 | 300 | ~-16 | 500 | Safe (Refactored) |
| `src/client/3d/monopoly_mobile_archway_visuals.ts` | Tier 2 (3D) | 287 | 237 | ~-50 | 500 | Safe (Refactored) |
| `tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts` | Living Test | 0 | 190 | ~+190 | 600 | Safe (New) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/3d/camera_types.ts` (New)
```typescript
export type CameraMode =
  | 'overview'
  | 'dice_roll'
  | 'tension_roll'
  | 'pawn_chase'
  | 'tile_focus'
  | 'auction_focus'
  | 'pre_match';

export interface TargetCameraState {
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly fov: number;
  readonly speed: number;
}

export interface TargetCameraStateOptions {
  readonly cinematicChase?: boolean;
  readonly cellIndex?: number;
  readonly aspect?: number;
  readonly isHighStakesRoll?: boolean;
  readonly isJailFlight?: boolean;
  readonly isTransientTurnCorner?: boolean;
  readonly enableNorthFraming?: boolean;
  readonly isRolling?: boolean;
  readonly isBotTurn?: boolean;
  readonly rollingPlayerPos?: number;
  readonly gamePhase?: 1 | 2 | 3;
}
```

**Target physical file**: `src/client/3d/monopoly_plaza_math.ts`
- Pure-move exact types and functions from `monopoly_plaza_visuals.ts` and `monopoly_mobile_archway_visuals.ts`:
```typescript
import type { ActiveSlam } from '../store/vfx_store';

export interface DominoRippleOptions {
  readonly waveDelayPerCellMs?: number;
  readonly maxDistanceInCells?: number;
  readonly ttlMs?: number;
  readonly baseAmplitudeY?: number;
  readonly basePitchRad?: number;
  readonly angularFrequency?: number;
  readonly dampingRatio?: number;
}

export interface DominoRippleTransform {
  readonly yOffset: number;
  readonly scaleY: number;
  readonly pitchRad: number;
  readonly isSettled: boolean;
}

export function getCircularCellDistance(cellA: number, cellB: number): number;
export function calculateDominoRippleTransform(
  distanceInCells: number,
  elapsedMs: number,
  options?: DominoRippleOptions
): DominoRippleTransform;
export function resolveNeighborDominoSlam(
  cellIndex?: number,
  activeSlams?: Readonly<Record<number, ActiveSlam>> | null,
  isMobile?: boolean,
  nowMs?: number
): { readonly slam: ActiveSlam; readonly distanceInCells: number } | null;
export function resolveMobilePoolDominoSlam(
  cellIndex?: number,
  activeSlams?: Readonly<Record<number, ActiveSlam>> | null,
  nowMs?: number
): { readonly slam: ActiveSlam; readonly distanceInCells: number } | null;
```

### Call-Site Wiring & Integration Anchors
- **Target physical file**: `src/client/3d/camera_state_machine.ts`
  - Re-exports `CameraMode`, `TargetCameraState`, and `TargetCameraStateOptions` from `./camera_types.ts`.
- **Target physical file**: `src/client/3d/cinematic_chase_camera.ts`
  - Replaces `import type { TargetCameraState } from './camera_state_machine'` with import from `./camera_types.ts`.
- **Target physical file**: `src/client/3d/cinematic_spline_flyby.ts`
  - Replaces `import { type TargetCameraState, calculateTileFocusCameraPosition } from './camera_state_machine'` with imports from `./camera_types.ts` and `./camera_kinematic_helpers.ts`.
- **Target physical file**: `src/client/3d/monopoly_plaza_visuals.ts`
  - Redirects line 311 re-export to `./monopoly_plaza_math`: `export { calculateDominoRippleTransform, getCircularCellDistance, resolveNeighborDominoSlam, type DominoRippleOptions, type DominoRippleTransform } from './monopoly_plaza_math';`
- **Target physical file**: `src/client/3d/monopoly_mobile_archway_visuals.ts`
  - Imports and re-exports domino math functions and types from `./monopoly_plaza_math.ts`.

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts`)

- **TC-409.01 [UC-CAMERA-TYPES-SEAM-AND-FSM-ORCHESTRATION/MSS]**: Given `camera_types.ts` exporting `CameraMode`, `TargetCameraState`, and full 11-property `TargetCameraStateOptions`, When `calculateTargetCameraState` in `camera_state_machine.ts` is invoked across all presets ('overview', 'dice_roll', 'pre_match'), Then returns exact camera vectors matching `CAMERA_CONFIG` without runtime regression, while static AST inspection proves `cinematic_chase_camera.ts` and `cinematic_spline_flyby.ts` have 0 imports from `camera_state_machine.ts`.
- **TC-409.02 [UC-CINEMATIC-SPLINE-FLYBY-KINEMATIC-SEAM/MSS]**: Given tile focus points across board corners (`cellPosition(10)` to `cellPosition(30)`), When `calculateSplineArcCameraState` computes flight paths, Then delegates `calculateTileFocusCameraPosition` seamlessly from `./camera_kinematic_helpers` and `TargetCameraState` from `./camera_types`, passing 100% of living tests `cinematic_spline_flyby.test.ts`.
- **TC-409.03 [UC-DOMINO-RIPPLE-MATH-SSOT-AND-KINEMATICS/MSS]**: Given domino impact at cell index 5 with elapsed time $t = 120\text{ms}$ and distance $d = 2$, When calling `calculateDominoRippleTransform`, `resolveNeighborDominoSlam`, and `resolveMobilePoolDominoSlam` in `monopoly_plaza_math.ts`, Then evaluates relational covariance ($f(d_1) \neq f(d_2)$, $f(t_1) \neq f(t_2)$), returns exact `{ yOffset, scaleY, pitchRad, isSettled }` values identical to legacy baseline, and passes 100% of `imp401` and `imp406` living tests.
- **TC-409.04 [UC-MONOPOLY-PLAZA-ACYCLIC-GRAPH-VERIFICATION/MSS]**: Given `monopoly_plaza_visuals.ts` and `monopoly_mobile_archway_visuals.ts` redirecting re-exports to `monopoly_plaza_math.ts`, When building the dependency graph via `npm run lint:boundaries`, Then verifies `[SCC-2]` and `[SCC-4]` are 100% eliminated, strongly connected components drop from 14 to $\le 12$, and 0 new boundary errors occur.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_409_CLIENT_3D_ZERO_CYCLE_AND_CAMERA_SEAMS.md --auto-sign`
  2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_409_CLIENT_3D_ZERO_CYCLE_AND_CAMERA_SEAMS.md`
  3. `npx --yes tsc --noEmit` (Exit 0)
  4. `npm run lint:boundaries` -> verifies SCC count drops to $\le 12$
  5. `npm run prefilter -- src/client/3d/camera_types.ts src/client/3d/camera_state_machine.ts src/client/3d/cinematic_chase_camera.ts src/client/3d/cinematic_spline_flyby.ts src/client/3d/monopoly_plaza_math.ts src/client/3d/monopoly_plaza_visuals.ts src/client/3d/monopoly_mobile_archway_visuals.ts tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts`
  6. Visual Capture & Evidence Synthesis: `node scripts/capture_visual_evidence.mjs --ticket imp-409 --scenario camera_chase_cinematic && npm run sentinel -- --ticket imp-409 --test tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts && npm run report -- imp-409 && node scripts/check_evidence.mjs imp-409`
  7. Regression verification: `npx --yes vitest run tests/client/cinematic_spline_flyby.test.ts tests/client/camera_state_machine.test.ts tests/client/imp401_monopoly_artdeco_archway_and_domino_shockwave.test.ts tests/client/imp406_mobile_instanced_monopoly_archway.test.ts tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts`

## 6. Definition of Done (DoD)
- [ ] `src/client/3d/camera_types.ts` created with exact physical types `CameraMode`, `TargetCameraState`, and `TargetCameraStateOptions` (`<= 50 LOC`).
- [ ] `[SCC-2]` eliminated: `cinematic_chase_camera.ts` and `cinematic_spline_flyby.ts` no longer import `camera_state_machine.ts`.
- [ ] `[SCC-4]` eliminated: line 311 re-export in `monopoly_plaza_visuals.ts` redirected to `monopoly_plaza_math.ts`, domino kinematics hosted in `monopoly_plaza_math.ts`.
- [ ] Total codebase SCC count reduced from 14 to 12 in `npm run lint:boundaries`.
- [ ] 100% existing regression tests pass with 0 behavioral drift.
- [ ] Lean contract test `tests/client/imp409_client_3d_zero_cycle_and_camera_seams.test.ts` passes with 4 atomic tests.
