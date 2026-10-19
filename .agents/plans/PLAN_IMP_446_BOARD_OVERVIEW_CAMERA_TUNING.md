# PLAN: IMP-446 Board Overview Camera Tuning & Deep-Round Auto-Zoom Suppression

## 1. Problem Statement & Root Cause
- **Problem**:
  1. In deep game rounds (Round > 8 or Buildings > 8), the 3D camera in `'overview'` mode automatically dives from the full tabletop elevation ($Y = 25.3\text{m}$, FOV $24^\circ$) down to a cramped view ($Y = 18.5\text{m}$, FOV $28^\circ$). At $Y = 18.5\text{m}$, the 18x18 board perimeter and corner tiles are severely cropped, making it impossible to see the whole board as requested by the player in Round 8/40.
  2. Monotonic Phase Lock Trap: Once `roundNumber > 8`, `resolveDynamicGamePhase` permanently locks the camera state in Phase 3 for all subsequent rounds (Round 9..40), permanently locking the player out of the expansive overview.
  3. Premature Re-Dive Trap & State Divergence: When the player clicks "Góc Nhìn Chuẩn" (`camera-reset-pill-btn`) to inspect the whole board, bypassing `resolveCameraMode` caused `mode` to remain `'tile_focus'`, setting `minDistance` to $3.8\text{m}$ (ground clipping hazard) and immediately diving back down to $Y = 6.4\text{m}$ upon lerp completion.
  4. Mobile Portrait Frustum Clipping: On narrow mobile portrait viewports (aspect < 1.0, e.g. 360x740), vertical FOV $24^\circ$ produces an overly narrow horizontal FOV ($\approx 11.6^\circ$). The lateral flank corners (Cell 10 and Cell 30) span $25.46\text{m}$ across the camera view, clipping off-screen ($|NDC_x| > 1.0$).
  5. Optical Pitch Drift: Scaling from origin $[0,0,0]$ rather than target $[2.2, 0.0, 2.2]$ distorted camera tilt angle and displaced the visual center.
- **Root Cause**:
  1. `cinematic_spline_flyby.ts#L104-L132` hardcoded Phase 2 ($Y = 22.0\text{m}$) and Phase 3 ($Y = 18.5\text{m}$) overview shrinkage.
  2. `adaptive_cinematic_camera.tsx` bypassed `manualMode` in `resolveCameraMode` and lacked an ephemeral Dead Man's Switch.
  3. `camera_kinematic_helpers.ts` lacked target-relative scaling and high-FOV portrait compensation.
- **Decision**: Unify overview elevation at $Y = 25.3\text{m}$ across all phases (retiring obsolete phase dive without Anti-TIDD ghost parameters), pass `manualMode` to `resolveCameraMode` with a 12s Dead Man's Switch, and implement target-relative mobile portrait framing (FOV $50^\circ$, $Y \le 34.5\text{m}$) ensuring $|NDC| \le 0.95$.

## 2. Target Files & LOC Budget

| Target Physical File | Type | Existing LOC | Budgeted LOC | Description |
| -------------------- | ---- | ------------ | ------------ | ----------- |
| `src/client/3d/camera_kinematic_helpers.ts` | 3D Helpers | 93 | ~125 | Pure responsive overview FOV ($50^\circ$) & target-relative distance scaling |
| `src/client/3d/cinematic_spline_flyby.ts` | 3D Kinematics | 132 | ~140 | Canonical $Y = 25.3\text{m}$ overview across all phases, target $[2.2, 0, 2.2]$ |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Camera Loop | 470 | ~475 | Wire `manualMode` into `resolveCameraMode`, 12s TTL Dead Man's Switch |

## 3. Core Contract Invariants (1 per Distinct Rule)
1. **INV-446.01 (Canonical Tabletop Overview Invariant)**: In `'overview'` mode across all game phases (Phase 1, 2, 3), camera elevation MUST maintain $Y = 25.3\text{m}$ on landscape, FOV $24^\circ$, target $[2.2, 0.0, 2.2]$, and speed $3.2$, eliminating deep-round board perimeter cropping.
2. **INV-446.02 (Living Contract Migration Protocol)**: Per AGENTS CONSTITUTION Station 1, living tests `TC-FLY.06`, `TC-FLY.07`, `TC-FLY.14`, and `TC-FLY.15` in `tests/client/cinematic_spline_flyby.test.ts` are modernized to assert the unified $Y = 25.3\text{m}$, FOV $24^\circ$ overview invariant, completely avoiding Anti-TIDD ghost flags.
3. **INV-446.03 (Native FSM Manual Mode & Ephemeral TTL Invariant)**: When manual overview is triggered via `CameraResetPill`, `adaptive_cinematic_camera.tsx` passes `manualMode: isManualOverviewResetRef.current ? 'overview' : null` into `resolveCameraMode`, guaranteeing `mode = 'overview'` and `minDistance = 14m`. Flag auto-clears if `performance.now() - timestamp > 12000` (12s Dead Man's Switch) or upon `hasTurnChanged || isRolling || isPawnMoving || activeModal !== null || cameraFocusCell !== null || isUserInteractingRef.current`.
4. **INV-446.04 (Target-Relative Mobile Frustum Clearance)**: On mobile portrait viewports (aspect < 1.0, e.g. 0.48), `calculateResponsiveOverviewCameraState(aspect, baseConfig)` calculates FOV up to $50^\circ$ and scales distance strictly relative to target $\vec{T} + (\vec{P} - \vec{T}) \times scale$ with elevation clamped at $Y \le 34.5\text{m}$, guaranteeing pitch angle invariance ($38.6^\circ$) and physical corner projection $|NDC| \le 0.95$ for all 4 corners $[ \pm 9, 0, \pm 9 ]$.
5. **INV-446.05 (LOC & Subsystem Confinement Guard)**: All target files reside strictly within `src/client/3d/` (0 cross-subsystem contamination). `adaptive_cinematic_camera.tsx` modifications remain $\le 6$ net LOC, strictly honoring the Tier 2 ceiling of 500 LOC.

## 4. Explicitly Dropped Requirements (Sean Goedecke Invariant)
- **NO Anti-TIDD ghost parameters**: No `suppressAutoZoom` parameter introduced solely for test bypass; overview is unified canonically.
- **NO 2D UI bundling**: Transit Wheel modal updates remain cleanly segregated to follow-up ticket IMP-447.
- **NO physics engine additions**: No complex camera collision mesh or raycast hull computation; pure trigonometric FOV and elevation scaling fulfills all framing requirements cleanly.
- **NO camera elevation beyond 35m**: Camera elevation on mobile is strictly capped at $Y \le 34.5\text{m}$ to preserve Indochine tabletop craft.

## 5. Principles Applied
- `[View-Model Seam Extraction]` -> Pure calculation `calculateResponsiveOverviewCameraState` in `camera_kinematic_helpers.ts` separates mathematical framing from R3F frame loop.
- `[Equivalence-Partition Testing]` -> Phase 1, Phase 2, Phase 3 partitions tested alongside Desktop (aspect 1.77) vs Mobile (aspect 0.48) partitions.
- `[Relational Multi-Point Assertion]` -> Verifies non-constant covariance of camera elevation and FOV across aspect ratios ($f(1.77) \neq f(0.48)$).
- `[Ephemeral TTL / Dead Man's Switch]` -> Manual overview lock implements 12s watchdog and releases deterministically on turn change, roll, or modal.
- `[Dropped Requirements & Anti-Phantom Complexity]` -> Dropped arbitrary 2D bundling, ghost parameters, and excessive camera distances.

## 6. Specification for Modifications & Call-Site Wiring

### Call-Site Wiring in `src/client/3d/camera_kinematic_helpers.ts`
- **Target physical file**: `src/client/3d/camera_kinematic_helpers.ts`
- Implements `calculateResponsiveOverviewFov` and `calculateResponsiveOverviewCameraState`:
  ```typescript
  export function calculateResponsiveOverviewFov(aspect?: number, baseFov = 24): number {
    if (typeof aspect !== 'number' || !Number.isFinite(aspect) || aspect >= 1.0) {
      return baseFov;
    }
    const safeAspect = Math.max(0.42, aspect);
    const targetHalfRad = (baseFov * Math.PI) / 360;
    const neededHalfRad = Math.atan(Math.tan(targetHalfRad) / safeAspect);
    const calculatedFov = Math.round((neededHalfRad * 360) / Math.PI);
    return Math.min(50, Math.max(baseFov, calculatedFov));
  }

  export function calculateResponsiveOverviewCameraState(
    aspect: number | undefined,
    baseConfig: { readonly position: readonly [number, number, number]; readonly target: readonly [number, number, number]; readonly fov: number; readonly speed: number }
  ): { position: [number, number, number]; target: [number, number, number]; fov: number; speed: number } {
    const fov = calculateResponsiveOverviewFov(aspect, baseConfig.fov);
    const tx = baseConfig.target[0];
    const ty = baseConfig.target[1];
    const tz = baseConfig.target[2];
    if (typeof aspect !== 'number' || !Number.isFinite(aspect) || aspect >= 1.0) {
      return {
        position: [baseConfig.position[0], baseConfig.position[1], baseConfig.position[2]],
        target: [tx, ty, tz],
        fov,
        speed: baseConfig.speed,
      };
    }
    const safeAspect = Math.max(0.42, aspect);
    const rawScale = 1.0 / Math.sqrt(safeAspect);
    const scale = Math.min(1.363, Math.max(1.0, rawScale)); // Clamps elevation Y <= 34.5m
    const posX = tx + (baseConfig.position[0] - tx) * scale;
    const posY = ty + (baseConfig.position[1] - ty) * scale;
    const posZ = tz + (baseConfig.position[2] - tz) * scale;
    return {
      position: [posX, posY, posZ],
      target: [tx, ty, tz],
      fov,
      speed: baseConfig.speed,
    };
  }
  ```

### Call-Site Wiring in `src/client/3d/cinematic_spline_flyby.ts`
- **Target physical file**: `src/client/3d/cinematic_spline_flyby.ts`
- Unifies `resolveOverviewConfigByPhase(phase, baseConfig, aspect?)`:
  Returns `calculateResponsiveOverviewCameraState(aspect, baseConfig)` across all phases, anchoring landscape at $[24.6, 25.3, 24.6]$, target $[2.2, 0, 2.2]$, speed $3.2$.

### Call-Site Wiring in `src/client/3d/adaptive_cinematic_camera.tsx`
- **Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx`
- In `resolveCameraMode`, passes `manualMode: isManualOverviewResetRef.current ? 'overview' : null`.
- Synchronizes `currentOverviewPosRef` and `currentOverviewTargetRef` with `phaseOverview`.
- Records `manualOverviewTimestampRef.current` on trigger; auto-clears flag if `performance.now() - timestamp > 12000` or on `hasTurnChanged || isRolling || isPawnMoving || activeModal !== null || cameraFocusCell !== null || isUserInteractingRef.current`.
- Removes premature `isManualOverviewResetRef.current = false` from lines 417 and 440.

## 7. Station 1 Test Contracts (`tests/client/imp446_board_overview_camera_tuning.test.ts`)
- `TC-446.01` `[UC-UNIFIED-OVERVIEW-ELEVATION/MSS]`: Given Phase 3 game state, When resolving overview camera state, Then camera elevation is $Y = 25.3\text{m}$, target is $[2.2, 0.0, 2.2]$, and speed is $3.2$.
- `TC-446.02` `[UC-RESPONSIVE-MOBILE-OVERVIEW-NDC/MSS]`: Given mobile portrait viewport (aspect = 0.48), When calling `calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview)`, Then returns FOV $\ge 48^\circ$ and $Y \le 34.5\text{m}$, with all 4 board corners $[ \pm 9, 0, \pm 9 ]$ projecting within $|NDC| \le 0.95$.
- `TC-446.03` `[UC-TARGET-RELATIVE-PITCH-INVARIANCE/MSS]`: Given portrait scaling, When comparing camera pitch angle between landscape and portrait, Then pitch angle remains constant at $38.6^\circ \pm 0.1^\circ$ eliminating optical distortion.
- `TC-446.04` `[UC-CALL-SITE-WIRING-MANUAL-MODE/MSS]`: Given `AdaptiveCinematicCamera` call-site integration with active manual overview reset, When evaluated, Then `resolveCameraMode` receives `manualMode: 'overview'`, ensuring `minDistance` is set to $14\text{m}$ preventing diorama ground clipping.
- `TC-446.05` `[UC-CALL-SITE-WIRING-DEAD-MANS-SWITCH/MSS]`: Given active manual overview reset, When idle watchdog exceeds 12s or `hasTurnChanged` becomes true, Then releases manual overview lock deterministically.
- `TC-446.06` `[UC-RELATIONAL-COVARIANCE/MSS]`: Given aspect 1.77 vs aspect 0.48, When computing overview camera state, Then returns covariant FOV and position values ($f(1.77) \neq f(0.48)$) with finite coordinates.

## 8. Station 3 Verification & Stopping Criteria (DoD)
- Fast Pre-Filter: `npm run prefilter -- src/client/3d/camera_kinematic_helpers.ts src/client/3d/cinematic_spline_flyby.ts src/client/3d/adaptive_cinematic_camera.tsx tests/client/imp446_board_overview_camera_tuning.test.ts`
- Scope Confinement: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_446_BOARD_OVERVIEW_CAMERA_TUNING.md`
- Visual Capture: `node scripts/visual_capture.mjs --ticket IMP-446 --scenario bot_turn_overview`
- Chaos Sentinel: `npm run sentinel -- --ticket IMP-446 --test tests/client/imp446_board_overview_camera_tuning.test.ts`
- Evidence Audit: `node scripts/check_evidence.mjs IMP-446`
- Definition of Done:
  - 100% contract tests pass GREEN.
  - Zero regression across all living camera test suites after contract modernization.
  - Chaos Sentinel kills 100% mutants.
  - `docs/FEATURE_MAP.md` updated and <= 30 KB.
