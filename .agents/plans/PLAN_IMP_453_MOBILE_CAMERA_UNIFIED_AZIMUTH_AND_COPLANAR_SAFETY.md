# PLAN_IMP_453: Mobile Camera Unified Azimuth, Whiplash Elimination & Co-planar Safety

## 1. Principles Applied
- **[Spatial AABB / Non-Occlusion]** -> Establishing a Unified Azimuth (`[+offH, +offY, +offH]`) across both routine and cinematic chases, paired with elevated mobile chase height ($Y \approx 9.18\text{m}$, $H \approx 7.25\text{m}$) on portrait viewports, ensures pawns remain visible within the unobstructed 55% left viewport window, clearing the 160px Player Card HUD and reducing vertical altitude plunge by 3.51m (14.5%).
- **[Ephemeral TTL / Dead Man's Switch]** -> Smooth camera interpolation speed (`speed: 2.8` on human portrait turns) paces the dice-to-chase transition over ~450ms, eliminating instant snap whiplash while bot chase speed is preserved at `5.2` to match fast 220ms bot hop kinematics.
- **[Platform DI Isolation]** -> Portrait vs Landscape kinematic branches isolate strictly through the `aspect` parameter without executing global browser sniffers or mutating desktop camera behavior.
- **[Resource Disposal & Cache Hygiene]** -> Applying `depthWrite={false}` to river waves and `polygonOffset` to the medallion brass ring completes deferred maintenance from IMP-452 for desktop/fallback tabletops, preventing co-planar depth-fighting on `mediump` GPUs.
- **[Dropped Requirements & Anti-Phantom Complexity (Sean Goedecke Rule)]** -> Deliberately drop complex dynamic spline pathing and raycasting occlusion solvers; resolve camera orientation and HUD clearance purely through static mathematical calibration in existing pure functions.

## 2. Target Files & Scope
> **Harness Mutation Scope**: `[HARNESS_MUTATION_AUTHORIZED]` declared for `scripts/sentinel_probes/IMP-453.json` (Chaos Sentinel targeted probe specification).

| Physical File | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/cinematic_chase_camera.ts` | Tier 1 (Domain/3D) | 264 | 280 | +16 | 400 | Safe |
| `src/client/3d/camera_state_machine.ts` | Tier 1 (Domain/3D) | 315 | 325 | +10 | 400 | Warning |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (3D/UI) | 396 | 399 | +3 | 500 | Safe |
| `src/client/3d/diorama/diorama_terrain.tsx` | Tier 2 (3D/UI) | 202 | 203 | +1 | 500 | Safe |
| `tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts` | Living Tests | 175 | 175 | 0 | 600 | Preserved |
| `tests/client/imp398_cinematic_pacing_and_smooth_camera.test.ts` | Living Tests | 196 | 196 | 0 | 600 | Preserved |
| `tests/client/imp453_mobile_camera_unified_azimuth_and_coplanar_safety.test.ts` | Living Tests (New) | 0 | 160 | +160 | 600 | Safe |

> [!NOTE] Tech Debt Item
> `camera_state_machine.ts` has 315 LOC (>= 300 LOC Tier 1 buffer). Edits are strictly bounded (+10 LOC) to calibrate target offsets and human speed without introducing deep branching.

## 3. Physical Surface Area & Root Cause
- **Surface Area**: `src/client/3d/cinematic_chase_camera.ts`, `src/client/3d/camera_state_machine.ts`, `src/client/3d/miniature_city_diorama.tsx`, `src/client/3d/diorama/diorama_terrain.tsx`.
- **Root Cause**:
  1. **Disorienting 180° / 90° Camera Flips**: In `cinematic_chase_camera.ts#L257-L263` (`resolveStandardChaseOffset`) and lines 194–219 (`calculateStreetChaseCameraState`), per-side quadrant switching causes North/West moves to flip camera orientation 180° opposite the overview South-East vantage point, producing extreme disorientation ("góc quay lúc xuôi lúc ngược rất lạ").
  2. **Violent Altitude Plunge & Snap Whiplash**: When dice rolling concludes, camera mode changes from overview ($Y \approx 29.85\text{m}$) to `pawn_chase` ($Y \approx 5.67\text{m}$ at `speed: 3.8 - 5.2`). A 24.18m vertical drop occurs under high interpolation speed, producing snap whiplash.
  3. **Player Card HUD Occlusion on Mobile**: At $Y \approx 5.67\text{m}$, the narrow 360px portrait viewport places the pawn dead-center, occluding ~70% of the active pawn behind the 160px Player Card stack.
  4. **Deferred Desktop/Fallback Maintenance**: Transparent river waves in `diorama_terrain.tsx#L120` omit `depthWrite={false}`, and the medallion brass ring in `miniature_city_diorama.tsx#L62` lacks `polygonOffset`, creating depth-fighting risk on non-serene desktop fallbacks.

## 4. Explicitly Dropped Requirements (Sean Goedecke Rule)
- ❌ **NO Dynamic Spline Camera Transitions**: Keep transition smoothing inside standard exponential damping rather than introducing complex multi-waypoint spline controllers.
- ❌ **NO Per-Side Camera Rotation on Mobile Portrait**: Both standard follow and cinematic street chase on mobile portrait are strictly locked to the South-East Unified Azimuth (`[+X, +Y, +Z]`).
- ❌ **NO Runtime Raycasting Occlusion Checkers**: HUD clearance is solved statically via screen-space target offset framing (`+0.6` in X).
- ❌ **NO Desktop Camera Alterations**: Desktop landscape retains existing multi-side camera awareness and speeds.
- ❌ **NO Bot Speed Reduction on Mobile**: Bot chase speed is preserved at `5.2` to track 220ms bot hops without frustum escape.

## 5. Specification for Modifications & Call-Site Wiring
### 5.1 `src/client/3d/cinematic_chase_camera.ts`
- In `resolveStandardChaseOffset(pawnCoords, aspect)`:
  - When `isPortrait` (`safeAspect < 1.0`):
    - Compute elevated offset: `offH = 5.8 * kDist` ($\approx 7.25\text{m}$), `offY = 6.8 * ky` ($\approx 9.18\text{m}$).
    - Return Unified Azimuth `[offH, offY, offH]` for all coordinates, bypassing `resolveSideFromCoordinates`.
  - When landscape (`safeAspect >= 1.0`):
    - Maintain existing base `offH = 3.6`, `offY = 4.2`, and per-side quadrant switching.
- In `calculateStreetChaseCameraState(params)`:
  - When `isPortrait` (`safeAspect < 1.0`):
    - Lock to South-East quadrant: `posX = px + trail`, `posZ = pz + outer`, `tarX = px - look`, `tarZ = pz - tilt`, preventing high-stakes turns from swinging the camera 180°.

### 5.2 `src/client/3d/camera_state_machine.ts`
- In `calculateTargetCameraState` under `'pawn_chase'`:
  - When `isPortrait`:
    - Shift target to clear HUD: `targetOffset = [safePx + 0.6, 0.4, safePz - 0.6]`.
    - Pace transition speed for human turns while preserving bot speed: `speed = options?.isBotTurn ? 5.2 : 2.8`.
  - When landscape:
    - Retain target `[safePx, 0.2, safePz]` and default speeds `3.2` (human) / `3.8` (bot).

### 5.3 `src/client/3d/miniature_city_diorama.tsx` (Directive 2)
- At line 64 on the brass ring mesh (`ringGeometry`):
  - Add `polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-2}` to `meshStandardMaterial`.

### 5.4 `src/client/3d/diorama/diorama_terrain.tsx` (Directive 3)
- At line 120 on `diorama-river-waves` mesh:
  - Add `depthWrite={false}` to `meshStandardMaterial`.

## 6. Living Test Modernization Protocol
- **TC-358.15 [UC-CAM-STANDARD-CHASE-OFFSET/MSS]**: Given pawn at origin `[0, 0, 0]` and mobile aspect `0.5`, When calling `resolveStandardChaseOffset` with aspect, Then preserves elevation `offset[1] >= 5.25` and horizontal offset `offset[0] >= 4.1` (the new values $\approx 9.18\text{m}$ and $\approx 7.25\text{m}$ strictly satisfy this invariant without regressions).
- **TC-398.05b [UC-CAM-BOT-CHASE-SPEED/MSS]**: Given bot turn and mobile portrait aspect `0.56`, When calling `calculateTargetCameraState('pawn_chase')`, Then returns speed exactly `5.2` preserving fast 220ms bot hop convergence.

## 7. Core Contract Invariants & QA Test Design
- **TC-453.01 [UC-CAM-UNIFIED-AZIMUTH-STANDARD/MSS]**: Given pawn coordinates at all 4 board sides (South, West, North, East) and portrait aspect `0.48`, When calling `resolveStandardChaseOffset`, Then returns strictly positive offsets `[+offH, +offY, +offH]` with zero 180° or 90° azimuth inversions.
- **TC-453.02 [UC-CAM-UNIFIED-AZIMUTH-STREET-CHASE/MSS]**: Given pawn position `[0, 0, -5]` on North edge and portrait aspect `0.48`, When calling `calculateStreetChaseCameraState` under high-stakes or milestone event cells, Then positions camera in South-East quadrant (`posX > px, posZ > pz`) without flipping 180°.
- **TC-453.03 [UC-CAM-DESKTOP-SIDE-AWARENESS/A1]**: Given pawn coordinates on North edge `[0, 0, -5]` and landscape aspect `1.77`, When calling `resolveStandardChaseOffset`, Then returns side-aware offset `[-offH, +offY, -offH]`.
- **TC-453.04 [UC-CAM-PORTRAIT-ELEVATED-FOLLOW/MSS]**: Given mobile portrait aspect `0.48`, When calling `resolveStandardChaseOffset`, Then returns elevation $Y \ge 8.5\text{m}$ and horizontal distance $H \ge 6.5\text{m}$ cutting plunge delta by 3.51m.
- **TC-453.05 [UC-CAM-SCREEN-SPACE-TARGET-FRAMING/MSS]**: Given pawn position `[5, 0, 5]` and mobile aspect `0.48`, When calling `calculateTargetCameraState` in `'pawn_chase'`, Then shifts target coordinate $X \ge 5.5$ to center pawn in the left 55% open viewport area clear of the 160px Player Card HUD.
- **TC-453.06 [UC-CAM-WHIPLASH-TRANSITION-PACING/MSS]**: Given mobile portrait aspect `0.48`, When calling `calculateTargetCameraState` in `'pawn_chase'`, Then returns speed $\le 3.0$ for human turns and exactly `5.2` for bot turns.
- **TC-453.07 [UC-DIORAMA-MEDALLION-POLYGON-OFFSET/MSS]**: Given `MiniatureCityDiorama`, When inspecting rendered markup, Then brass ring mesh contains `polygonOffset` attributes.
- **TC-453.08 [UC-TERRAIN-RIVER-WAVES-DEPTH-WRITE-OFF/MSS]**: Given `DioramaTerrain`, When inspecting rendered markup, Then `diorama-river-waves` mesh contains `depthWrite={false}`.

## 8. Mechanical Verification Commands
- `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_453_MOBILE_CAMERA_UNIFIED_AZIMUTH_AND_COPLANAR_SAFETY.md --auto-sign`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_453_MOBILE_CAMERA_UNIFIED_AZIMUTH_AND_COPLANAR_SAFETY.md`
- `npm run prefilter -- src/client/3d/cinematic_chase_camera.ts src/client/3d/camera_state_machine.ts src/client/3d/miniature_city_diorama.tsx src/client/3d/diorama/diorama_terrain.tsx tests/client/imp453_mobile_camera_unified_azimuth_and_coplanar_safety.test.ts`
- `npm test -- tests/client/imp453_mobile_camera_unified_azimuth_and_coplanar_safety.test.ts tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts tests/client/imp398_cinematic_pacing_and_smooth_camera.test.ts`
- `node scripts/capture_visual_evidence.mjs --ticket IMP-453 --scenario camera_chase_normal`
- `npm run sentinel -- --ticket IMP-453 --test tests/client/imp453_mobile_camera_unified_azimuth_and_coplanar_safety.test.ts`
- `node scripts/check_evidence.mjs IMP-453`

## 9. Definition of Done (DoD)
1. **Station 1**: 8/8 contract tests authored by `qa-tester` fail initially with Semantic RED assertions.
2. **Station 2**: Minimal implementation in 4 production files satisfies 100% contract tests (GREEN).
3. **Station 2.5**: `fast_prefilter.mjs` exits 0 (0 type errors, 0 dirty casts, LOC budgets maintained).
4. **Station 3**: In-action visual evidence captured (`camera_chase_normal`), dual-viewport verified by `game-3d-visual-critic`.
5. **Station 4**: Chaos Sentinel achieves 100% mutant kill rate, live WebSocket port 0 passes, and `check_evidence.mjs` verifies physical disk artifacts.
