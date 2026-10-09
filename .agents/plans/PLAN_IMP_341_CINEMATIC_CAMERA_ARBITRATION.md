# Plan IMP-341: Cinematic Camera Arbitration & Gesture Decoupling (Ticket IMP-341)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Uncommitted)**:
  - Slice 1 (IMP-336): `src/client/3d/board_tile.tsx`, `tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts`, `tests/client/imp336_mobile_webkit_thermal_hardening.test.ts`, `tests/client/phase1_pbr_beveled.test.ts`. [SHIPPED]
  - Slice 2 (IMP-337): `src/client/3d/miniature_city_diorama.tsx`, `src/client/3d/diorama/diorama_container_port.tsx`, `src/client/3d/diorama/diorama_marina.tsx`, `src/client/3d/diorama/diorama_perching_birds.tsx`, `tests/client/imp337_diorama_mobile_freezing.test.ts`. [SHIPPED]
  - Slice 3 (IMP-338): `src/client/3d/coastal_island_environment.tsx`, `src/client/3d/tropical_water.tsx`, `src/client/3d/perf_budget.ts`, `tests/client/adaptive_dpr_controller.test.ts`, `tests/client/imp265_dual_platform_mobile_lod.test.ts`, `tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts`. [SHIPPED]
- **Prior Context**: Candidate 4 was audited under Adversarial Critique (`ADVERSARIAL_CRITIQUE_ARCH_CANDIDATE_4_CINEMATIC_CAMERA.md`) and Plan Challenge (`PLAN_CHALLENGE_IMP-341.md`).
- **Objective**: Implement Hardened Synthesis v2.0 Deep Module Architecture, eliminating "Camera Fighting" and multi-swipe stutter through an 800ms inspection grace period with Preemption and a 3-zone 3D world space gesture classifier, while keeping all modules strictly within LOC limits.
- **Adversarial Gate Resolution**:
  - ADV-01 (World Space 3D Classification): Reject screen-space `< 8px` pixel checks to prevent DOM listener leaks and button touch collision. Formulate gesture classification purely via 3D Euclidean distances (`distPos`, `distTarget`) and contact duration (`touchDurationMs`).
  - ADV-02 (Grace Period Preemption Invariant): Authoritatively preempt and cancel the 800ms Grace Period immediately when `activeModal !== null`, `cameraFocusCell !== null`, `isRolling === true`, or `currentTurnPlayerId` changes.
  - ADV-03 (Zero-Alloc 60 FPS Hot Path): Avoid creating ephemeral parameter and result objects in `useFrame`. Implement flat scalar resolver `resolveActiveCameraDriver` ensuring 0 GC allocations per tick.
  - ADV-04 (Deep Module & Backward Compatibility): Retain `use_camera_gestures.ts` contract continuity by mapping `evaluateOrbitGestureEnd` directly to `classifyGestureIntent`, guaranteeing 100% pass across all 57 existing camera tests.
  - ADV-05 (Gotcha 17 Preservation): Strictly preserve `justBrokeSoftReturn` handling across the arbitration boundary to prevent accidental tap-to-skip when breaking soft return.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-341`
- **Subsystem**: `client-3d` (Tier 2 Client 3D Presentation, Camera Rig & Gesture Arbitration)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/camera_arbitration_engine.ts` (Tệp mới)
  - **Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx` (Refactor)
  - **Target physical file**: `src/client/3d/use_camera_gestures.ts` (Refactor)
  - **Target physical file**: `tests/client/imp341_camera_arbitration_engine.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/3d/camera_state_machine.ts`
  - `src/client/3d/camera_soft_return.ts`
  - `src/client/3d/cinematic_spline_flyby.ts`
  - `src/client/store/game_store.ts`
  - `src/client/store/vfx_store.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/camera_arbitration_engine.ts` | Tier 2 (UI/3D/Views) | 0 | 140 | +140 | <= 500 | 🆕 Tệp mới |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Tier 2 (UI/3D/Views) | 425 | 425 | 0 | <= 500 | ⚠️ Warning (425 >= 400, Tech Debt: rig coordination extraction) |
| `src/client/3d/use_camera_gestures.ts` | Tier 2 (UI/3D/Views) | 251 | 251 | 0 | <= 500 | ✔️ Safe |
| `tests/client/imp341_camera_arbitration_engine.test.ts` | Living Test | 0 | 260 | +260 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp341_camera_arbitration_engine.test.ts`:
  - TC-341.01 [UC-ARB/MSS]: Given micro-touch parameters with touchDuration 40ms and distPos 0.08m, When calling classifyGestureIntent, Then returns action 'micro_touch' and shouldGrantGracePeriod false.
  - TC-341.02 [UC-ARB/A1]: Given tap parameters with touchDuration 100ms and distPos 0.1m during pawn movement, When calling classifyGestureIntent, Then returns action 'skip_animation'.
  - TC-341.03 [UC-ARB/A2]: Given tap parameters with justBrokeSoftReturn true and small delta, When calling classifyGestureIntent, Then returns action 'micro_touch' and shouldClearJustBroke true without triggering tap-to-skip.
  - TC-341.04 [UC-ARB/A3]: Given manual inspection parameters with distPos 0.6m or touchDuration 300ms, When calling classifyGestureIntent, Then returns action 'manual_inspection' and shouldGrantGracePeriod true.
  - TC-341.05 [UC-ARB/A4]: Given tick parameters with isDragging true, When calling resolveActiveCameraDriver, Then returns activeDriver 'user'.
  - TC-341.06 [UC-ARB/A5]: Given tick parameters with isGracePeriodActive true and isDragging false, When calling resolveActiveCameraDriver, Then returns activeDriver 'user'.
  - TC-341.07 [UC-ARB/A6]: Given tick parameters with hasSoftReturn true and isDragging false, When calling resolveActiveCameraDriver, Then returns activeDriver 'soft_return'.
  - TC-341.08 [UC-ARB/A7]: Given tick parameters with isActionOngoing true, When calling resolveActiveCameraDriver, Then returns activeDriver 'director'.
  - TC-341.09 [UC-ARB/A8]: Given arbitration session instantiated via createCameraArbitrationSession with active grace period, When activeModal is present, Then checkPreemption immediately cancels grace period and returns true.
  - TC-341.10 [UC-ARB/A9]: Given arbitration session with active grace period, When cameraFocusCell is set, Then checkPreemption immediately cancels grace period and returns true.
  - TC-341.11 [UC-ARB/A10]: Given arbitration session with active grace period, When isRolling becomes true, Then checkPreemption immediately cancels grace period and returns true.
  - TC-341.12 [UC-ARB/A11]: Given arbitration session with active grace period, When hasTurnChanged becomes true, Then checkPreemption immediately cancels grace period and returns true.
  - TC-341.13 [UC-ARB/A12]: Given legacy gesture parameters, When calling evaluateOrbitGestureEnd bridge, Then preserves backward compatibility and passes existing regression tests.
  - TC-341.14 [UC-ARB/A13]: Given consecutive swipe gestures within 800ms, When granting successive grace periods, Then resets gracePeriodEndTime without director snap-back.
- Scaffold initial empty stubs in `src/client/3d/camera_arbitration_engine.ts` to ensure clean Semantic Behavioral RED (runtime assertion failure, never loader error).

### Station 2: Implementation (GREEN)

#### Task 1: Engine Implementation in `src/client/3d/camera_arbitration_engine.ts`
**Target physical file**: `src/client/3d/camera_arbitration_engine.ts` (Tệp mới)
```typescript
export type CameraActiveDriver = 'user' | 'soft_return' | 'director' | 'idle';
export type CameraGestureAction = 'micro_touch' | 'skip_animation' | 'manual_inspection';

export interface GestureClassificationParams {
  readonly touchDurationMs: number;
  readonly distPos: number;
  readonly distTarget: number;
  readonly isPawnAnimating: boolean;
  readonly justBrokeSoftReturn: boolean;
}

export interface GestureClassificationResult {
  readonly action: CameraGestureAction;
  readonly shouldGrantGracePeriod: boolean;
  readonly shouldClearJustBroke: boolean;
}

export interface CameraArbitrationSession {
  gracePeriodEndTime: number;
  isGracePeriodActive(currentTimeMs: number): boolean;
  grantGracePeriod(currentTimeMs: number, durationMs?: number): void;
  cancelGracePeriod(): void;
  checkPreemption(
    activeModal: unknown,
    cameraFocusCell: number | null,
    isRolling: boolean,
    hasTurnChanged: boolean
  ): boolean;
}

export function classifyGestureIntent(params: GestureClassificationParams): GestureClassificationResult;
export function resolveActiveCameraDriver(
  isDragging: boolean,
  isGracePeriodActive: boolean,
  hasSoftReturn: boolean,
  isActionOngoing: boolean,
  isResetting: boolean
): CameraActiveDriver;
export function createCameraArbitrationSession(): CameraArbitrationSession;
```

#### Task 2: Gesture Integration in `src/client/3d/use_camera_gestures.ts`
**Target physical file**: `src/client/3d/use_camera_gestures.ts` (Refactor)
- Wire `use_camera_gestures.ts` to utilize `classifyGestureIntent` while preserving `evaluateOrbitGestureEnd` signature.
- Wire `createCameraArbitrationSession` in `use_camera_gestures.ts` to grant grace period on `manual_inspection`.

#### Task 3: Camera Rig Integration in `src/client/3d/adaptive_cinematic_camera.tsx`
**Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx` (Refactor)
- Wire `resolveActiveCameraDriver` and check preemption conditions inside `useSafeFrame`.

### Station 3: Pre-Filter & Mechanical Gates
- Run `npm run prefilter -- src/client/3d/camera_arbitration_engine.ts src/client/3d/adaptive_cinematic_camera.tsx src/client/3d/use_camera_gestures.ts tests/client/imp341_camera_arbitration_engine.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_341_CINEMATIC_CAMERA_ARBITRATION.md`.

### Station 4: Evidence & Sentinel Verification
- Add targeted AST mutation probes in `scripts/sentinel_runner.mjs`.
- Run sentinel: `npm run sentinel -- --ticket IMP-341 --3d --test tests/client/imp341_camera_arbitration_engine.test.ts --src src/client/3d/camera_arbitration_engine.ts`.
- Capture visual evidence: `npm run capture:visual -- --ticket IMP-341 --scenario camera_chase_normal --dual-viewport`.
- Run evidence checker: `node scripts/check_evidence.mjs IMP-341`.
- Generate delivery report: `npm run report -- IMP-341`.
