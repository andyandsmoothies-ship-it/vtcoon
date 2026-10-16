# PLAN_IMP_410: Client-3D Procedural Architecture & Construction Slam Zero-Cycle Seams (Nhóm 2 Slice 2B)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md) (Giai đoạn 2: Cắt đứt các chu trình vòng tròn) & [`CODEBASE_REORGANIZATION_ROADMAP_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/CODEBASE_REORGANIZATION_ROADMAP_REPORT.md) (Trụ cột 1: View-Model Seam Extraction).
- **Subsystem Boundary Isolation**: Slices Group 2 into cohesive `client-3d` boundaries, targeting strictly files within `src/client/3d/` across 3 cohesive families (`building`, `construction`, `procedural`) to strictly satisfy `rules_scope.mjs` mechanical gate (`<= 3` families max, 0 cross-subsystem contamination).
- **Problems**:
  1. **`[SCC-3]` Cycle**: [`src/client/3d/landmark_registry.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/landmark_registry.ts) $\leftrightarrow$ [`src/client/3d/building_typology.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/building_typology.ts). `landmark_registry.ts` imports type `RegionalTypology` from `building_typology.ts`, while `building_typology.ts` (lines 108-112) contains an anti-pattern pseudo-barrel re-exporting `LANDMARK_REGISTRY`, `getLandmarkInfo`, and `type LandmarkEntry` back from `landmark_registry.ts`.
  2. **`[SCC-4]` Cycle**: [`src/client/3d/construction_slam_vfx.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/construction_slam_vfx.tsx) $\leftrightarrow$ [`src/client/3d/procedural_building.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx). `construction_slam_vfx.tsx` imports `getBuildingLotTransform` from `procedural_building.tsx`, while `procedural_building.tsx` imports `calculateImpactDrop` from `construction_slam_vfx.tsx`. Mixing pure geometric/kinematic calculations into JSX presentation components creates tight two-way cyclic coupling.
- **Architectural Solution & Seam Discipline**:
  1. **Triệt tiêu `[SCC-3]`**: Purge the pseudo-barrel re-export in `building_typology.ts`. Callers access `LANDMARK_REGISTRY` and `getLandmarkInfo` directly from the SSOT `landmark_registry.ts`.
  2. **Tách Pure Seam `building_lot_transform.ts`**: Extract `BuildingLotTransform`, `STANDARD_LOT_TRANSFORM`, `CORNER_SPLAY_TRANSFORMS`, and `getBuildingLotTransform` from `procedural_building.tsx` into a pure, testable geometry seam [`src/client/3d/building_lot_transform.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/building_lot_transform.ts) (0 React, 0 Three.js context). `procedural_building.tsx` retains a 100% backward-compatible re-export.
  3. **Tách Pure Seam `construction_slam_math.ts`**: Extract `ImpactDropResult`, `calculateImpactDrop`, and `getBuildingWorldPosition` from `construction_slam_vfx.tsx` into [`src/client/3d/construction_slam_math.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/construction_slam_math.ts). `construction_slam_vfx.tsx` re-exports them for existing test compatibility.
  4. Both JSX presentation components (`procedural_building.tsx` and `construction_slam_vfx.tsx`) become lean consumers of pure seams, cutting the two-way import dependency to zero.

### Principles Applied
- **View-Model Seam Extraction** -> Extracted pure transform and impact drop kinematics into twin math files (`building_lot_transform.ts`, `construction_slam_math.ts`), decoupling JSX presentation from spatial math.
- **Deep Modules & Seam Discipline** -> Eradicated 2 circular dependency cycles (`[SCC-3]` and `[SCC-4]`) while preserving 100% backward-compatibility for prior test contracts (`imp65`, `imp66`, `imp67`, `construction_slam_vfx.test.ts`).
- **Equivalence-Partition Testing** -> Atomic test partitions across corner splay lots (cells 1, 9, 11, 19, 21, 29, 31, 39) vs standard lots, and drop trajectory phases (in-flight, impact squash, rebound, settled).
- **Pure-Move Quarantine** -> Preserved 100% coordinate values, plinth dimensions, and squash/rebound curves without behavioral alteration.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/building_lot_transform.ts` | Tier 2 (3D Seam) | 0 | 50 | ~+50 | 500 | Safe (New Seam) |
| `src/client/3d/construction_slam_math.ts` | Tier 2 (3D Seam) | 0 | 65 | ~+65 | 500 | Safe (New Seam) |
| `src/client/3d/building_typology.ts` | Tier 2 (3D) | 113 | 107 | ~-6 | 500 | Safe (Refactored) |
| `src/client/3d/procedural_building.tsx` | Tier 2 (3D) | 288 | 265 | ~-23 | 500 | Safe (Refactored) |
| `src/client/3d/construction_slam_vfx.tsx` | Tier 2 (3D) | 260 | 225 | ~-35 | 500 | Safe (Refactored) |
| `tests/client/imp410_procedural_building_and_construction_slam_seams.test.ts` | Living Test | 0 | 200 | ~+200 | 600 | Safe (New) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/3d/building_lot_transform.ts` (New Pure Seam)
```typescript
export interface BuildingLotTransform {
  readonly position: [number, number, number];
  readonly rotation: [number, number, number];
  readonly scale: [number, number, number];
  readonly baseWidth: number;
}

export const STANDARD_LOT_TRANSFORM: BuildingLotTransform;
export const CORNER_SPLAY_TRANSFORMS: Readonly<Record<number, BuildingLotTransform>>;

export function getBuildingLotTransform(cellIndex?: number): BuildingLotTransform;
```

**Target physical file**: `src/client/3d/construction_slam_math.ts` (New Pure Seam)
```typescript
import { getBuildingLotTransform } from './building_lot_transform';

export interface ImpactDropResult {
  readonly yOffset: number;
  readonly scaleY: number;
  readonly scaleXZ: number;
  readonly hasHitGround: boolean;
}

export function getBuildingWorldPosition(cellIndex: number): [number, number, number];

export function calculateImpactDrop(
  elapsedMs: number,
  dropDurationMs?: number,
  initialHeight?: number
): ImpactDropResult;
```

### Call-Site Wiring & Integration Anchors
- **Target physical file**: `src/client/3d/building_typology.ts`
  - Remove lines 108-112 (`export { LANDMARK_REGISTRY, getLandmarkInfo, type LandmarkEntry } from './landmark_registry';`).
- **Target physical file**: `src/client/3d/procedural_building.tsx`
  - Import `getBuildingLotTransform`, `type BuildingLotTransform` from `./building_lot_transform` and re-export for 100% backward-compatibility.
  - Import `calculateImpactDrop` from `./construction_slam_math` (decoupling from `./construction_slam_vfx`).
- **Target physical file**: `src/client/3d/construction_slam_vfx.tsx`
  - Import `{ getBuildingWorldPosition, calculateImpactDrop, type ImpactDropResult }` from `./construction_slam_math` and re-export for backward-compatibility (NO unused `getBuildingLotTransform` import).

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp410_procedural_building_and_construction_slam_seams.test.ts`)

- **TC-410.01 [UC-BUILDING-LOT-TRANSFORM-CORNER-SPLAY/MSS]**: Given corner splay property cell indices (1, 9, 11, 19, 21, 29, 31, 39), When `getBuildingLotTransform(cellIndex)` is evaluated, Then returns dedicated offset $X = \pm 0.24$, $Y = 0.16$, $Z = -1.38$, scale $0.975$, baseWidth $0.55$; and given undefined or standard cell indices (e.g. 6, 8), returns `STANDARD_LOT_TRANSFORM` ($X = 0$, $Y = 0.16$, $Z = -1.38$).
- **TC-410.02 [UC-CONSTRUCTION-SLAM-DROP-KINEMATICS/MSS]**: Given elapsed time $t$, When `calculateImpactDrop` executes across distinct kinematic partitions, Then proves: (1) $t \le 0$ maintains initial drop height $yOffset = 3.6$ and scale 1.0; (2) $0 < t < 380$ follows parabolic drop with $yOffset > 0$ and $hasHitGround = false$; (3) $380 \le t \le 460$ executes ground impact squash ($yOffset = 0$, $scaleY < 1.0$, $scaleXZ > 1.0$, $hasHitGround = true$; peak squash at $t = 420$); (4) $460 < t \le 580$ executes elastic rebound ($scaleY > 1.0$, $scaleXZ < 1.0$; peak rebound at $t = 520$); and (5) $t > 580$ settles completely at $scaleY = 1.0$, $scaleXZ = 1.0$, $yOffset = 0$.
- **TC-410.03 [UC-ZERO-CYCLIC-DEPENDENCY-VERIFICATION/MSS]**: Given the project dependency graph, When analyzed via Tarjan strongly connected components (SCC), Then proves `[SCC-3]` (`landmark_registry` $\leftrightarrow$ `building_typology`) and `[SCC-4]` (`construction_slam_vfx` $\leftrightarrow$ `procedural_building`) are completely dissolved (0 circular edges between them).
- **TC-410.04 [UC-BACKWARD-COMPATIBILITY-CALL-SITE-PARITY/MSS]**: Given existing consumers importing `getBuildingLotTransform` from `procedural_building` and `calculateImpactDrop` from `construction_slam_vfx`, When re-export assertions execute, Then verifies identical referential equality ($fn_{re-export} === fn_{source}$), maintaining 100% compliance across `imp65`, `imp66`, and `construction_slam_vfx.test.ts`.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_410_PROCEDURAL_BUILDING_AND_CONSTRUCTION_SLAM_SEAMS.md --auto-sign`
  2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_410_PROCEDURAL_BUILDING_AND_CONSTRUCTION_SLAM_SEAMS.md`
  3. `npx --yes tsc --noEmit` (Exit 0)
  4. `npm run lint:boundaries` (Verifies SCC count reduces from 12 to 10)
  5. `npm run prefilter -- src/client/3d/building_lot_transform.ts src/client/3d/construction_slam_math.ts src/client/3d/building_typology.ts src/client/3d/procedural_building.tsx src/client/3d/construction_slam_vfx.tsx tests/client/imp410_procedural_building_and_construction_slam_seams.test.ts`
  6. Visual Capture Gate: `node scripts/capture_visual_evidence.mjs --ticket imp-410 --scenario board_ownership_monopoly`
  7. **Evidence Snapshot Collection (Tier 1.5 Structural Refactor)**:
     `node scripts/collect_evidence.mjs imp-410 tests/client/imp410_procedural_building_and_construction_slam_seams.test.ts && npm run report -- imp-410 && node scripts/check_evidence.mjs imp-410`
  8. **Regression verification**:
     `npx --yes vitest run tests/client/imp410_procedural_building_and_construction_slam_seams.test.ts tests/client/construction_slam_vfx.test.ts tests/contracts/imp65_building_scale_corner_clearance_and_regional_typologies.test.ts tests/contracts/imp203_bespoke_landmarks_and_housing.test.ts`

## 6. Definition of Done (DoD)
- [ ] `src/client/3d/building_lot_transform.ts` created with `<= 60 LOC`, exporting pure lot transform math.
- [ ] `src/client/3d/construction_slam_math.ts` created with `<= 80 LOC`, exporting pure impact drop calculations.
- [ ] `src/client/3d/building_typology.ts` purges pseudo-barrel re-exports, dropping to `<= 110 LOC`.
- [ ] `src/client/3d/procedural_building.tsx` delegates to new pure seams, maintaining `<= 270 LOC`.
- [ ] `src/client/3d/construction_slam_vfx.tsx` delegates to new pure seams, maintaining `<= 235 LOC`.
- [ ] Boundary linter `npm run lint:boundaries` confirms `[SCC-3]` and `[SCC-4]` eliminated.
- [ ] Living test suite `tests/client/imp410_procedural_building_and_construction_slam_seams.test.ts` passes 100% with 4 atomic tests.
- [ ] 100% regression tests pass across `construction_slam_vfx.test.ts`, `imp65`, `imp66`, and `imp203`.
- [ ] `check_evidence.mjs imp-410` exits `0`.
