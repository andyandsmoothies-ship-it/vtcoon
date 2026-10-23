# PLAN: IMP-455 Desktop Bot Camera Unified Azimuth, Glide Transitions & Observable Vehicle Speed Calibration

## 1. Context & Motivation
On desktop, bot turn camera transitions and thematic transport vehicle pacing exhibit jarring UX issues:
1. **Premature Destination Zoom (Early-Focus Whiplash)**: When dice finish rolling, if destination is a human-owned tile, the camera prematurely rushes into `tile_focus` before the pawn hops, then jerks back to `overview`/`chase` during the hop.
2. **Quadrant Inversion on Board Perimeter**: In `pawn_chase` and `tile_focus`, the camera swings 90° at corners and flips 180° behind northern tiles (cells 20–29), causing central diorama landmarks (Bitexco, Cathedral) to block the view.
3. **Wild Spherical Orbit Slerp**: When returning to overview, `sampleSoftReturn` performs a 180° spherical orbit swing across 950ms, causing roller-coaster motion sickness.
4. **Observable Transport Pacing**: Passenger plane transit (2.0s/1.4s) and police prison escort (36m in 2.0s/1.4s) move too fast for human eyes to track the 5 Hz siren or enjoy the diorama flight path.

## 2. Target Files & Scope Confinement
| File | Tier | Current LOC | Projected LOC | Delta | Max LOC | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Tier 2 (3D/UI) | 499 | 485 | -14 | 500 | Warning (Deletion-First, Tech Debt registered) |
| `src/client/3d/camera_state_machine.ts` | Tier 2 (3D/UI) | 320 | 338 | +18 | 500 | Safe |
| `src/client/3d/cinematic_chase_camera.ts` | Tier 2 (3D/UI) | 271 | 290 | +19 | 500 | Safe |
| `src/client/3d/camera_soft_return.ts` | Tier 2 (3D/UI) | 145 | 175 | +30 | 500 | Safe |
| `src/client/3d/pawn_path.ts` | Tier 1 (Domain/3D) | 212 | 226 | +14 | 400 | Safe |
| `src/client/3d/cinematic_spline_flyby.ts` | Tier 2 (3D/UI) | 124 | 142 | +18 | 500 | Safe |
| `src/client/3d/single_hop_pawn.tsx` | Tier 2 (3D/UI) | 292 | 302 | +10 | 500 | Safe |
| `tests/client/imp454_thematic_transport_vehicles.test.ts` | Living Tests | 302 | 305 | +3 | 600 | Safe (Modernize) |
| `tests/client/imp455_desktop_camera_and_vehicle_pacing.test.ts` | Living Tests (New) | 0 | 195 | +195 | 600 | Safe |

> [!NOTE] Tech Debt Item: [DEBT-ADAPTIVE-CAMERA-DECOUPLING]
> `adaptive_cinematic_camera.tsx` is at 499 LOC. It uses Deletion-First refactoring to drop to ~485 LOC strictly under 500. A future epic will decompose gesture listeners and arbitration into dedicated sub-hooks.
>
> [HARNESS_MUTATION_AUTHORIZED]: Authorizes `scripts/sentinel_probes/IMP-455.json` (Sentinel AST mutation probe) and `scripts/visual_scenarios/camera_chase_north.js` (Visual capture scenario for North edge camera tracking).

## 3. Physical Surface Area & Root Cause
- **Surface Area**: `adaptive_cinematic_camera.tsx#L199-L203, L305, L434`, `camera_state_machine.ts#L132, L165`, `cinematic_chase_camera.ts#L250-L270`, `camera_soft_return.ts#L98-L132`, `pawn_path.ts#L17-L18`.
- **Root Cause**:
  1. `camera_state_machine.ts#L132` checks `isTargetOwnedByHuman` unconditionally on bot turns when `isPawnAnimating` is false, returning `tile_focus` before the pawn starts moving.
  2. `cinematic_chase_camera.ts#L265-L270` negates X and Z offsets on sides 1, 2, and 3 on desktop, inverting camera azimuth behind northern tiles.
  3. `camera_soft_return.ts#L118-L131` interpolates `currentTheta` across 180°, orbiting around the diorama center instead of gliding linearly.
  4. Homogeneous duration (2.0s/1.4s) does not differentiate 36m perimeter road journey (`audit`) from 25m aerial jump (`transit`), moving too fast for human eyes.

## 4. Explicitly Dropped Requirements (Sean Goedecke Rule)
- ❌ **NO Dynamic Drone Tilt/Roll on Desktop**: Desktop camera preserves fixed South-East perspective azimuth; gyroscopic roll and tilt are dropped.
- ❌ **NO Multi-Stage Flight Waypoints for Airliners**: Commercial planes follow clean parabolic arcs without mid-air holding patterns or zig-zag pathfinding.
- ❌ **NO Audio Pitch Shifting during Glide**: Soft return transitions remain purely visual and do not manipulate WebAudio listener positions.
- ❌ **NO Infinite Micro-Breakpoint Responsive Tweaks**: Desktop transitions anchor to standard landscape viewports (aspect $\ge 1.0$).

## 5. Principles Applied
- `View-Model Seam Extraction`: Pure mathematical offset and glide calculations extracted to `camera_soft_return.ts` and `cinematic_chase_camera.ts`.
- `Spatial AABB / Non-Occlusion`: Unified South-East azimuth [3.6, 4.2, 3.6] eliminates landmark clipping (Bitexco, Cathedral) on northern tiles.
- `Poka-Yoke Domain Affordance`: `tile_focus` on bot turns is gated behind `isPostHopSettling !== false`, preventing premature camera zooming.
- `Observable Kinematic Pacing`: Calibrates human-observable durations (3.2s plane, 3.8s police) allowing 5 Hz siren and banking angles to register naturally.
- `SpecGuard Oracle & Anti-Overfitting Protocol`: Contract tests assert relational multi-point tracking, continuous $C^1$ glide, and negative quadrant inversion tests.

## 6. Specification for Modifications & Call-Site Wiring
### 6.1 Observable Pacing Constants & Decoupled Units (`pawn_path.ts`, `cinematic_spline_flyby.ts`, `single_hop_pawn.tsx`)
```typescript
// pawn_path.ts (seconds for pawn movement delta accumulation)
export const THEMATIC_PLANE_DURATION = 3.2 as const;
export const BOT_THEMATIC_PLANE_DURATION = 2.4 as const;
export const THEMATIC_POLICE_DURATION = 3.8 as const;
export const BOT_THEMATIC_POLICE_DURATION = 2.8 as const;
export function resolveThematicVehicleHopDurationSec(flightType?: 'audit' | 'transit' | 'event', isBot?: boolean): number {
  if (flightType === 'audit') return isBot ? BOT_THEMATIC_POLICE_DURATION : THEMATIC_POLICE_DURATION;
  return isBot ? BOT_THEMATIC_PLANE_DURATION : THEMATIC_PLANE_DURATION;
}

// cinematic_spline_flyby.ts (milliseconds for performance.now clock)
export function resolveThematicVehicleFlightDurationMs(isBot?: boolean, flightType?: 'audit' | 'transit' | 'event'): number {
  if (flightType === 'audit') return isBot ? 2800 : 3800;
  return isBot ? 2400 : 3200;
}
export function resolveThematicVehicleFlightDuration(isBot?: boolean, flightType?: 'audit' | 'transit' | 'event'): number {
  return resolveThematicVehicleFlightDurationMs(isBot, flightType);
}
export function resolveThematicFlightProgress(flightStartTime: number | null, now: number, isBot?: boolean, flightType?: 'audit' | 'transit' | 'event'): number {
  if (flightStartTime === null || !Number.isFinite(flightStartTime)) return 0;
  const elapsed = now - flightStartTime;
  return Math.min(1, Math.max(0, elapsed / resolveThematicVehicleFlightDurationMs(isBot, flightType)));
}
```

### 6.2 Anti-Early-Focus & Unified Desktop Azimuth (`camera_state_machine.ts`, `cinematic_chase_camera.ts`)
```typescript
// camera_state_machine.ts
if (params.isBotTurn || params.isAnimatingPawnBot) {
  if (params.activeModal !== null) return 'tile_focus';
  if (params.isPawnAnimating) {
    const isMobileViewport = Boolean(params.isMobile || (typeof params.aspect === 'number' && params.aspect < 1.0));
    return isMobileViewport ? 'pawn_chase' : (params.isHighStakesRoll ? 'pawn_chase' : 'overview');
  }
  // Gated behind post-hop settle window (defaults to true for legacy unit tests without explicit settle state)
  const isPostHop = params.isPostHopSettling ?? true;
  if (isPostHop && (params.isTargetOwnedByHuman === true || params.isHighStakesRoll)) {
    return 'tile_focus';
  }
  return 'overview';
}

// cinematic_chase_camera.ts: Grounded to SSOT CAMERA_CONFIG [3.6, 4.2, 3.6]
export function resolveUnifiedDesktopChaseOffset(pawnCoords: readonly [number, number, number], aspect?: number): readonly [number, number, number] {
  const isPortrait = typeof aspect === 'number' && aspect < 1.0;
  if (isPortrait) return resolveStandardChaseOffset(pawnCoords, aspect);
  return [3.6, 4.2, 3.6];
}
```

### 6.3 Damped Linear Glide Return (`camera_soft_return.ts`)
```typescript
export function sampleGlideSoftReturn(state: SoftReturnState, now: number, isDesktop: boolean = true): SoftReturnSample {
  if (!isDesktop) return sampleSoftReturn(state, now);
  const elapsed = Math.max(0, now - state.startTime);
  const tau = Math.min(1, elapsed / (state.durationMs > 0 ? state.durationMs : 1200));
  if (tau >= 1.0) return { position: [state.destPos[0], state.destPos[1], state.destPos[2]], target: [state.destTarget[0], state.destTarget[1], state.destTarget[2]], isFinished: true };
  const u = 1 - Math.pow(1 - tau, 3);
  return {
    position: [state.startPos[0] + (state.destPos[0] - state.startPos[0]) * u, state.startPos[1] + (state.destPos[1] - state.startPos[1]) * u, state.startPos[2] + (state.destPos[2] - state.startPos[2]) * u],
    target: [state.startTarget[0] + (state.destTarget[0] - state.startTarget[0]) * u, state.startTarget[1] + (state.destTarget[1] - state.startTarget[1]) * u, state.startTarget[2] + (state.destTarget[2] - state.startTarget[2]) * u],
    isFinished: false,
  };
}
```

### 6.4 Closed-Loop Production Call-Site Wiring (`adaptive_cinematic_camera.tsx`)
- Refactor-first: Prune dead comments and consolidate finite checks ($499 \to 485$ LOC).
- Line 199: Update post-hop settle trigger to include `isTargetOwnedByHuman`:
  `if (prevIsPawnMovingRef.current && !isPawnMoving && (isHighStakesRoll || isTargetOwnedByHuman) && (isBotTurn || isAnimatingPawnBot)) postHopSettleUntilRef.current = performance.now() + 1200;`
- Line 305: Pass `effectiveFlightType` into `resolveThematicFlightProgress`:
  `const effectiveFlightType = activeAnimation?.flightType ?? (isJailFlight ? 'audit' : undefined);`
- Line 434: Wire `sampleGlideSoftReturn`:
  `const isDesktop = !isMobile && (cameraAspect === undefined || cameraAspect >= 1.0);`
  `const sample = sampleGlideSoftReturn(softReturnRef.current, performance.now(), isDesktop);`

## 7. Core Contract Invariants & QA Test Design
- **TC-455.01 [UC-VEHICLE-PACING-CALIBRATION/MSS]**: Given transport flights, When evaluating duration constants, Then airline transit yields 3.2s (human) / 2.4s (bot) and police escort yields 3.8s (human) / 2.8s (bot).
- **TC-455.02 [UC-DESKTOP-UNIFIED-AZIMUTH/MSS]**: Given pawns on North (cell 25), West (cell 15), East (cell 35), and South (cell 5), When evaluating desktop chase offset, Then camera offset maintains strictly positive coordinates ($X = 3.6, Z = 3.6$), never flipping to negative quadrants behind landmarks.
- **TC-455.03 [UC-BOT-ANTI-EARLY-FOCUS/MSS]**: Given bot turn with human-owned destination tile, When `isPawnAnimating` is false and `isPostHopSettling` is false, Then camera mode resolves to `'overview'`, preventing pre-motion zoom.
- **TC-455.04 [UC-BOT-POST-HOP-SETTLE-FOCUS/MSS]**: Given bot turn with human-owned destination tile, When pawn completes hop and `isPostHopSettling` is true, Then camera mode cleanly resolves to `'tile_focus'`.
- **TC-455.05 [UC-DESKTOP-GLIDE-NO-ORBIT/MSS]**: Given camera returning to overview on desktop, When sampling soft return at mid-progress $t = 0.5$, Then azimuth deviation is $\le 1^\circ$ from direct Cartesian line, confirming linear glide without 180° spherical rotation.
- **TC-455.06 [UC-RELATIONAL-COVARIANCE/MSS]**: Given advancing progress points $t_1 = 0.2$ and $t_2 = 0.8$, When sampling glide positions, Then sampled glide positions advance monotonically ($P(t_2) \neq P(t_1)$).
- **TC-455.07 [UC-SINGLE-HOP-CONSUMER-WIRING/MSS]**: Given `SingleHopPawn` rendered with flightType `'audit'`, When frame updates at $t = 1.0\text{s}$, Then hop duration is calibrated to 3.8s (human) / 2.8s (bot) and executes frame progression without early completion (`isComplete = false`).

## 8. Mechanical Verification Commands
- `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_455_DESKTOP_CAMERA_UNIFIED_AZIMUTH_AND_TRANSPORT_PACING.md --auto-sign`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_455_DESKTOP_CAMERA_UNIFIED_AZIMUTH_AND_TRANSPORT_PACING.md`
- `npm run prefilter -- src/client/3d/adaptive_cinematic_camera.tsx src/client/3d/camera_state_machine.ts src/client/3d/cinematic_chase_camera.ts src/client/3d/camera_soft_return.ts src/client/3d/pawn_path.ts src/client/3d/cinematic_spline_flyby.ts src/client/3d/single_hop_pawn.tsx tests/client/imp454_thematic_transport_vehicles.test.ts tests/client/imp455_desktop_camera_and_vehicle_pacing.test.ts`
- `node scripts/capture_visual_evidence.mjs --ticket IMP-455 --scenario camera_chase_normal`
- `npm test -- tests/client/imp455_desktop_camera_and_vehicle_pacing.test.ts`

## 9. Definition of Done (DoD)
1. **Station 1**: 7 contract tests authored by `qa-tester` fail initially with Semantic RED assertions.
2. **Station 2**: Minimal implementation satisfies 100% contract tests (GREEN).
3. **Station 2.5**: `fast_prefilter.mjs` exits 0 (0 type errors, 0 dirty casts, LOC budgets maintained under ceilings: `adaptive_cinematic_camera.tsx` strictly $\le 500$).
4. **Station 3**: Verified desktop bot transitions: no early zoom, no 180° flip on northern tiles, smooth linear glide return, and calibrated transport pacing.
5. **Station 4**: Chaos Sentinel achieves 100% mutant kill rate and `check_evidence.mjs` verifies physical disk artifacts.
