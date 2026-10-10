# Plan IMP-354: Bot Turn Camera Stabilization & Mobile Viewport Pacing (Ticket IMP-354)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Uncommitted)**:
  - Clean working tree with IMP-346, IMP-347, and IMP-353 shipped.
- **Problem Statement**:
  - In a 4-player game with bots on Android Chrome (portrait `aspect < 1.0`), users experience violent camera jumping ("nhấp nháy") as seen in `document_6219658762584596461.mp4`.
  - Root cause: `resolveCameraMode` returns `pawn_chase` when bot pawn moves, then immediately returns `overview` when pawn lands on non-human tile (`isTargetOwnedByHuman === false`).
  - Consecutive bot turns trigger rapid `pawn_chase` (zoom in 4m + 90° rotation) -> `overview` (1200ms soft return) -> aborted mid-flight -> zoom in -> zoom out 3 times in 6 seconds.
- **Objective**:
  - Stabilize bot turn camera behavior: Bot moves across unowned/bot-owned tiles stay in stable `overview`, allowing smooth observation of the whole board from above.
  - Camera only zooms in for bot moves when landing on human-owned property (`isTargetOwnedByHuman === true`), during `isHighStakesRoll`, or during interactive modals (`auction`).
  - Adapt `softReturn` duration to fast pacing (650ms for bot turn transitions vs 1200ms for manual overview reset) preventing preemption truncation via `resolveSoftReturnDuration`.
  - Preserve 100% backward compatibility with legacy callers (where `isTargetOwnedByHuman` is `undefined`).
- **Adversarial Gate Resolution ([PLAN_CHALLENGE_IMP-354.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-354.md))**:
  - ADV-01 (Pure Function Extraction): Extract `resolveSoftReturnDuration(isBot?: boolean): number` in `camera_state_machine.ts` returning 650 for bot and 1200 for human.
  - ADV-02 (Bot Recognition Parity): Pass `Boolean(isBotTurn || isAnimatingPawnBot)` to `resolveSoftReturnDuration` in `adaptive_cinematic_camera.tsx`.
  - ADV-03 (Strict Equality Quarantine): Strictly enforce `params.isTargetOwnedByHuman === false` check, preserving legacy callers where it is `undefined`.
- **Tech Debt Watch**:
  - `src/client/3d/camera_state_machine.ts` reaches 304 LOC (Tier 1 warning threshold). Register tech debt for extracting FSM mode resolution helper in future slice.
  - `src/client/3d/adaptive_cinematic_camera.tsx` reaches 450 LOC (Tier 2 warning threshold). Strict LOC guard <= 500 LOC.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-354`
- **Subsystem**: `client-3d` (Tier 1/2 Presentation & 3D Camera State Machine)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/camera_state_machine.ts` (Refactor)
  - **Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp354_bot_camera_stabilization.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/3d/camera_arbitration_engine.ts`
  - `src/client/3d/cinematic_chase_camera.ts`
  - `src/client/3d/camera_soft_return.ts`
  - `src/client/store/game_store.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/camera_state_machine.ts` | Tier 1 (Domain/Server/Logic) | 297 | 304 | +7 | <= 400 | ⚠️ Warning (304 >= 300, Tech Debt: FSM helper extraction) |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Tier 2 (UI/3D/Views) | 448 | 450 | +2 | <= 500 | ⚠️ Warning (450 >= 400, Tech Debt: rig coordination extraction) |
| `tests/client/imp354_bot_camera_stabilization.test.ts` | Living Test | 0 | 180 | +180 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp354_bot_camera_stabilization.test.ts`:
  - TC-354.01 [UC-CAM-BOT/MSS]: Given Bot turn parameters where isPawnAnimating is true and isTargetOwnedByHuman is false and isHighStakesRoll is false, When calling resolveCameraMode, Then returns 'overview'.
  - TC-354.02 [UC-CAM-BOT/A1]: Given Bot turn parameters where isPawnAnimating is true and isTargetOwnedByHuman is true, When calling resolveCameraMode, Then returns 'pawn_chase'.
  - TC-354.03 [UC-CAM-BOT/A2]: Given Bot turn parameters where isPawnAnimating is true and isHighStakesRoll is true, When calling resolveCameraMode, Then returns 'pawn_chase'.
  - TC-354.04 [UC-CAM-BOT/A3]: Given Bot turn parameters where activeModal is 'auction', When calling resolveCameraMode, Then returns 'auction_focus'.
  - TC-354.05 [UC-CAM-BOT/A4]: Given legacy caller where isTargetOwnedByHuman is undefined and isPawnAnimating is true for Bot, When calling resolveCameraMode, Then returns 'pawn_chase' preserving IMP-103 backward compatibility.
  - TC-354.06 [UC-CAM-BOT/A5]: Given human player turn parameters where isPawnAnimating is true, When calling resolveCameraMode, Then returns 'pawn_chase'.
  - TC-354.07 [UC-CAM-PACING/MSS]: Given soft return duration calculation for bot turn with isBot true, When calling resolveSoftReturnDuration, Then returns 650 avoiding preemption collision.
  - TC-354.08 [UC-CAM-PACING/A1]: Given soft return duration calculation for human manual reset with isBot false or undefined, When calling resolveSoftReturnDuration, Then returns 1200.
  - TC-354.09 [UC-CAM-STATE/MSS]: Given overview mode with options, When calling calculateTargetCameraState, Then returns TargetCameraState with valid position and target.

### Station 2: Implementation (GREEN)

#### Task 1: Update FSM Camera Resolution in `src/client/3d/camera_state_machine.ts`
**Target physical file**: `src/client/3d/camera_state_machine.ts` (Refactor)
```typescript
<<<<
  // 2. Quân cờ đang di chuyển: Bám đuổi theo quân cờ
  if (params.isPawnAnimating) {
    return 'pawn_chase';
  }
====
  // 2. Quân cờ đang di chuyển: Bám đuổi theo quân cờ
  if (params.isPawnAnimating) {
    if ((params.isBotTurn || params.isAnimatingPawnBot) && params.isTargetOwnedByHuman === false && !params.isHighStakesRoll && params.activeModal === null) {
      return 'overview';
    }
    return 'pawn_chase';
  }
>>>>
```

```typescript
<<<<
export function calculateTargetCameraState(
====
export function resolveSoftReturnDuration(isBot?: boolean): number {
  return isBot ? 650 : 1200;
}

export function calculateTargetCameraState(
>>>>
```

#### Task 2: Pacing & Viewport Stabilization in `src/client/3d/adaptive_cinematic_camera.tsx`
**Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx` (Refactor)
```typescript
<<<<
  checkHighStakesRoll,
  CAMERA_CONFIG,
} from './camera_state_machine';
====
  checkHighStakesRoll,
  resolveSoftReturnDuration,
  CAMERA_CONFIG,
} from './camera_state_machine';
>>>>
```

```typescript
<<<<
        softReturnRef.current = initSoftReturn(
          camBaseRef.current,
          targetBaseRef.current,
          targetState.position,
          targetState.target,
          performance.now(),
          1200
        );
====
        const returnDuration = resolveSoftReturnDuration(isBotTurn || isAnimatingPawnBot);
        softReturnRef.current = initSoftReturn(
          camBaseRef.current,
          targetBaseRef.current,
          targetState.position,
          targetState.target,
          performance.now(),
          returnDuration
        );
>>>>
```

### Station 3: Physical Evidence & Visual Audit
- Visual capture with action scenario: `node scripts/capture_visual_evidence.mjs --ticket IMP-354 --scenario camera_chase_normal`
- Comprehensive evidence verification: `node scripts/check_evidence.mjs IMP-354`
