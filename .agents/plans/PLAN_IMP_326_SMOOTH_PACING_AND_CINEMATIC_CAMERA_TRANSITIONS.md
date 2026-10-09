# Plan IMP-326: Smooth Pacing & Cinematic Transition Easing (Dice Settle Dwell, Smooth Landing Hold, Anti-Snap Camera Return)

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-326`
- **Subsystem**: `client-3d` (Tier 2 Client 3D & Presentation Engine)
- **Problem Statement**:
  1. **Rapid Dice-to-Pawn Transition**: In `src/client/3d/dice_tray.tsx`, the dice spring onRest settle timer was set to 250ms (`settleTimerRef.current = setTimeout(..., 250)`). Players lacked sufficient dwell time to observe the rolled pips and total dice score badge before the pawn immediately launched into movement.
  2. **Abrupt Pawn Landing Cut & Deadlock Hazard**: In `src/client/3d/pawn_animator.tsx:ActiveSpringPawn`, the final waypoint hop completed in 0ms with zero landing dwell hold. Furthermore, if a settle timer was introduced without a `Flush-on-Unmount` cleanup, premature unmounting (tab switch, skip, modal) would leave `activePawnAnimation` stuck in the Zustand store permanently, deadlocking future pawn movement. Also, during landing settle, omitting `reaction` swallowed celebratory/penalty animations.
  3. **Direct Camera Snapping on Return to Overview**: When returning to `overview`, exponential decay lerp with high initial velocity at $t=0$ caused an abrupt snap. Moreover, mouse wheel zoom on desktop was violently overwritten by frame interpolation, and rapid play (fast bots / doubles) caused camera tug-of-war against the 1200ms overview pull.
- **Architectural Solution**:
  1. **Dice Result Settle Dwell (`DICE_SETTLE_DWELL_MS = 600`)**: In `src/client/3d/dice_tray.tsx`, wait 600ms after the dice finish rolling before firing `onRest`, giving players a comfortable moment to read the dice. The constant remains purely internal (Anti-TIDD compliant).
  2. **Pawn Landing Settle Hold & Flush-on-Unmount (`PAWN_LANDING_SETTLE_MS = 600`)**: In `src/client/3d/pawn_animator.tsx`, hold a 600ms stationary landing dwell state at the destination tile, forward `reaction` state to `<StaticPawnWithReaction>`, and enforce the **Flush-on-Unmount** pattern in the `useEffect` cleanup hook to guarantee `onComplete(player.id)` is immediately executed if unmounted during dwell.
  3. **Smooth Spherical Slerp Camera Return with Wheel & Action Precedence**: In `src/client/3d/adaptive_cinematic_camera.tsx`, initialize `softReturnRef.current` over 1200ms with cubic ease-out spherical orbit slerp. Bind a passive `wheel` listener to `gl.domElement` to immediately break soft return on mouse scroll, and cancel soft return immediately if any new game action begins (`isRolling || isPawnMoving || activeModal`).
- **Direct Scope**:
  - `src/client/3d/dice_tray.tsx`
  - `src/client/3d/pawn_animator.tsx`
  - `src/client/3d/adaptive_cinematic_camera.tsx`
  - `tests/client/imp326_smooth_pacing_and_cinematic_camera_transitions.test.ts`
- **Baseline Working Tree Dependencies**:
  - `src/client/3d/luxury_pawn_models.tsx`
  - `src/client/ui/floating_numbers.tsx`
  - `src/client/ui/modals/game_rules_modal.tsx`
  - `src/client/ui/notification_deduplicator.ts`
  - `src/domain/pawn_assignment.ts`
  - `src/domain/pawn_configs.ts`
  - `src/domain/treasury_stimulus.ts`
  - `src/server/insolvency_manager.ts`
  - `src/server/room_manager_queries.ts`
  - `src/server/turn_loop.ts`
  - `tests/client/imp128_desktop_ui_ticker_and_toast_sync.test.ts`
  - `tests/client/imp324_minimum_dwell_and_desktop_ceiling.test.ts`
  - `tests/server/imp325_treasury_stimulus_deactivation.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/dice_tray.tsx` | Tier 2 (UI/3D/Views) | 248 | 251 | +3 | <= 500 | ✔️ Safe |
| `src/client/3d/pawn_animator.tsx` | Tier 2 (UI/3D/Views) | 303 | 341 | +38 | <= 500 | ✔️ Safe |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Tier 2 (UI/3D/Views) | 388 | 425 | +37 | <= 500 | ⚠️ Warning (Tech Debt: Tier 2 >= 400 LOC, extract camera hooks in follow-up if approaching 450) |
| `tests/client/imp326_smooth_pacing_and_cinematic_camera_transitions.test.ts` | Living Test | 0 | 245 | +245 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp326_smooth_pacing_and_cinematic_camera_transitions.test.ts` (Tệp mới)

Test Specifications:
- TC-326.01 [UC-DWELL/MSS]: Given ActiveSpringPawn, When waypoints is empty, Then completes immediately.
- TC-326.02 [UC-DWELL/MSS]: Given ActiveSpringPawn at final waypoint, When hop finishes, Then holds landing settle state for 600ms and preserves reaction prop.
- TC-326.03 [UC-FLUSH/MSS]: Given ActiveSpringPawn during landing dwell, When unmounted prematurely, Then executes onComplete immediately (Flush-on-Unmount).
- TC-326.04 [UC-CAM/MSS]: Given camera transitioning to overview, When initSoftReturn and sampleSoftReturn interpolate, Then produces continuous slerp path without velocity spikes.
- TC-326.05 [UC-CAM/MSS]: Given soft return trajectory, When duration 1200ms finishes, Then converges to destCamPos.
- TC-326.06 [UC-CAM/MSS]: Given active soft return, When user touches screen or scrolls wheel, Then breaks soft return immediately.
- TC-326.07 [UC-STORE/MSS]: Given activePawnAnimation in Zustand store, When completePawnMove is invoked, Then releases animation state and updates visualPositions.

### Station 2: Implementation (GREEN)

#### Task 1: Dice Settle Dwell in `dice_tray.tsx`
**Target physical file**: `src/client/3d/dice_tray.tsx`
- Define internal constant `const DICE_SETTLE_DWELL_MS = 600;` (0 Anti-TIDD).
- In `SingleDie`, delay `onRest()` trigger by 600ms via `settleTimerRef.current = setTimeout(..., DICE_SETTLE_DWELL_MS)`.

#### Task 2: Pawn Landing Settle Hold & Flush-on-Unmount in `pawn_animator.tsx`
**Target physical file**: `src/client/3d/pawn_animator.tsx`
- Define internal constant `const PAWN_LANDING_SETTLE_MS = 600;`.
- Add `reaction?: PawnReactionState | null` prop to `ActivePawnProps` and forward to `<StaticPawnWithReaction>`.
- In `handleHopComplete`, enter `isLandedSettle = true` and schedule `settleTimerRef.current = setTimeout(..., PAWN_LANDING_SETTLE_MS)`.
- Implement **Flush-on-Unmount** in cleanup: if unmounted while `settleTimerRef.current` is active, clear timer and call `onComplete(player.id)` immediately to guarantee store drain.

#### Task 3: Spherical Slerp Camera Return with Wheel & Action Precedence in `adaptive_cinematic_camera.tsx`
**Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx`
- In mode resolution, when switching to `overview` from close-up modes, initialize `softReturnRef.current = initSoftReturn(...)` over 1200ms.
- Attach passive `wheel` event listener on `gl.domElement` to immediately cancel `softReturnRef.current = null` on desktop mouse scroll.
- In `useFrame`, if `isActionOngoing` becomes true (`isRolling || isPawnMoving || activeModal`), cancel `softReturnRef.current = null` to grant immediate visual priority to active actions.

### Station 3: Pre-Filter & Architecture Review
- Run `npm run prefilter -- src/client/3d/dice_tray.tsx src/client/3d/pawn_animator.tsx src/client/3d/adaptive_cinematic_camera.tsx tests/client/imp326_smooth_pacing_and_cinematic_camera_transitions.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_326_SMOOTH_PACING_AND_CINEMATIC_CAMERA_TRANSITIONS.md`.

### Station 4: Evidence & Verification
- Execute full test suite `npx vitest run`.
- Capture visual evidence: `npm run capture:visual -- --ticket IMP-326 --scenario camera_chase_normal`.
- Audit physical evidence: `node scripts/check_evidence.mjs IMP-326`.
- Generate synthesis report: `npm run report -- IMP-326`.
