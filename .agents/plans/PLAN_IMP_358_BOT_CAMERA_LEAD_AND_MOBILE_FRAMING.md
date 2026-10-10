# Plan IMP-358: Bot Camera Catch-Up Boost, Kinematic Velocity Parity & Mobile Portrait Framing (Ticket IMP-358)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Committed & Shipped)**:
  - Commit `IMP-357` shipped the live 3D diagnostic HUD, `highp` shader float precision, and $20\pi$ wave modulo wrapping, completely resolving the Android WebGL strobing defect (confirmed by user: *"Đã hết chớp, có vẻ ta đã tìm được đúng chỗ"*).
- **User Problem Report**:
  1. **Bot Camera Lag / Catch-up Defect**:
     *"mặc định khi chuẩn bị quay xúc xắc thì ở màn hình mặc định chiếu vào giữa bàn, khi bắt đầu quay xúc xắc thì camera mới bám theo con cờ, tuy nhiên tôi thấy với bot thì camera chưa kịp bám theo con cờ đã chạy trước"*
  2. **Mobile Close-Up Occlusion / Clipped Corner Defect**:
     *"và góc quay khi áp sát bàn bị che mờ mất góc khi ở mobile"*
- **Deep Kinematic & Optical Root Cause Analysis**:
  1. **Bot Velocity Mismatch & Camera Acceleration Lag ($v_{\text{bot}} = 13.85\text{m/s}$)**:
     - Bot hops at `BOT_HOP_DURATION = 0.13s` per tile (3x faster than human `0.40s`).
     - Across $1.8\text{m}$ cells, bot velocity is $v_{\text{bot}} = 1.8 / 0.13 \approx 13.85\text{m/s}$.
     - When roll ends, camera starts at $Y = 19.8\text{m}$ looking at center $[1.5, 0.2, 1.5]$, while bot pawn is on the perimeter ($R \approx 9\text{m}$).
     - Distance is $\approx 18.4\text{m}$. Under lerp $1 - \exp(-dt \times 5.2)$, camera takes $\sim 0.5\text{s}$ to settle. In $0.5\text{s}$, bot has already hopped 4 tiles ($7.2\text{m}$)!
     - **Solution**: Bot Catch-Up Boost: `speed: 7.2` during bot `pawn_chase` (vs 5.2 for human), delivering $66\%$ convergence in $150\text{ms}$ and locking onto the bot pawn on hop #1. Remove `!options?.isBotTurn` so `calculateDicePanCameraState` pre-pans during roll.
  2. **Concurrency Glitch Jump on Soft Return Cancellation ([ADV-05])**:
     - When bot lands, camera begins 650ms `softReturn`. If bot rolls doubles or rapid bot-to-bot transition occurs, `isActionOngoing` cancels soft return (`softReturnRef.current = null;`).
     - In `adaptive_cinematic_camera.tsx`, canceling without syncing `camBaseRef` and `targetBaseRef` causes a positional glitch jump.
     - **Solution**: Sync `camBaseRef.current` and `targetBaseRef.current` to live Three.js `camera.position` and `controls.target` immediately before nullifying `softReturnRef.current`.
  3. **Optical Trigonometry for Mobile Responsive FOV**:
     - Standard portrait mobile screens ($aspect \approx 0.45 \to 0.56$) suffer vertical perspective distortion if horizontal FOV collapses.
     - Instead of rough $1/\sqrt{aspect}$ clamping, use lens optical trigonometry matching `calculateResponsiveStreetFov`:
       $\tan(vFOV / 2) = \tan(hFOV_{\text{base}} / 2) / \max(0.42, aspect)$.
     - Yields smooth continuous scaling from 35°/38° on landscape up to 45°/48° on portrait.
  4. **Screen-Space Target Framing Offset (Clearing Top HUD Blur)**:
     - On mobile portrait, Top HUD occupies top 22% ($Y_{\text{screen}} \in [0.78, 1.0]$).
     - Targeting the ground ($Y = 0.15\text{m}$) pushes 2-3m tall 3D landmarks into $Y_{\text{screen}} \in [0.75, 1.0]$, right behind the blurred HUD cards.
     - **Solution**: Elevate camera height ($Y \times 1.25 \to 8.0\text{m}$) and offset target to the architectural midpoint ($Y = 0.85\text{m}$ vs $0.15\text{m}$) when $aspect < 1.0$, anchoring the entire building within the clear viewing band $Y_{\text{screen}} \in [0.35, 0.65]$.
  5. **Deterministic Drop-In Snippets**:
     - All physical modifications defined via exact drop-in snippets preventing drift.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-358`
- **Subsystem**: `client-3d` (Tier 1 Camera FSM/Kinematics & Tier 2 Camera View)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx` (Refactor)
  - **Target physical file**: `src/client/3d/camera_state_machine.ts` (Refactor)
  - **Target physical file**: `src/client/3d/camera_kinematic_helpers.ts` (Refactor)
  - **Target physical file**: `src/client/3d/cinematic_chase_camera.ts` (Refactor)
  - **Target physical file**: `tests/client/dramatic_pacing_camera.test.ts` (Refactor)
  - **Target physical file**: `tests/client/imp356_android_depth_and_dice_landing.test.ts` (Refactor)
  - **Target physical file**: `tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/3d/board_coords.ts`
  - `src/client/3d/pawn_path.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Tier 2 (UI/3D/Views) | 450 | 458 | +8 | <= 500 | Warning |
| `src/client/3d/camera_state_machine.ts` | Tier 1 (Domain/Server/Logic) | 298 | 303 | +5 | <= 400 | Warning |
| `src/client/3d/camera_kinematic_helpers.ts` | Tier 1 (Domain/Server/Logic) | 60 | 93 | +33 | <= 400 | Safe |
| `src/client/3d/cinematic_chase_camera.ts` | Tier 1 (Domain/Server/Logic) | 256 | 264 | +8 | <= 400 | Safe |
| `tests/client/dramatic_pacing_camera.test.ts` | Living Test | 194 | 194 | 0 | <= 600 | Safe |
| `tests/client/imp356_android_depth_and_dice_landing.test.ts` | Living Test | 333 | 333 | 0 | <= 600 | Safe |
| `tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts` | Living Test | 0 | 195 | +195 | <= 600 | 🆕 Tệp mới |

> *Tech Debt Registration*: `adaptive_cinematic_camera.tsx` (458 LOC) and `camera_state_machine.ts` (303 LOC) are marked `Warning` due to approaching/crossing Tier 1 (300) and Tier 2 (400) soft thresholds. Logged as Tech Debt TD-CAM-01 for future sub-component extraction.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts`:
  - TC-358.01 [UC-CAM-BOT-PAN/MSS]: Given Bot turn with `isRolling: true`, When calling `calculateTargetCameraState`, Then returns `calculateDicePanCameraState` without blocking on `isBotTurn`.
  - TC-358.02 [UC-CAM-BOT-SPEED-PARITY/MSS]: Given Bot turn in `pawn_chase` mode, When calling `calculateTargetCameraState`, Then returns catch-up boost speed 7.2 overcoming 13.85m/s bot hop velocity.
  - TC-358.03 [UC-CAM-BOT-FOCUS-SPEED/MSS]: Given Bot turn in `tile_focus` mode, When calling `calculateTargetCameraState`, Then returns `speed: 4.0` (matching `CAMERA_CONFIG.tile_focus.speed`).
  - TC-358.04 [UC-CAM-MOBILE-CHASE-FOV/MSS]: Given mobile portrait aspect ratio ($aspect = 0.5$), When calculating `pawn_chase` camera state, Then FOV expands from 38° to 48° restoring horizontal corner coverage.
  - TC-358.05 [UC-CAM-MOBILE-FOCUS-FOV/MSS]: Given mobile portrait aspect ratio ($aspect = 0.5$), When calculating `tile_focus` camera state, Then FOV expands from 35° to 45° preventing corner clipping.
  - TC-358.06 [UC-CAM-MOBILE-ELEVATION/MSS]: Given mobile portrait aspect ratio ($aspect = 0.5$), When calling `calculateTileFocusCameraPosition` with aspect as 3rd argument, Then camera height is elevated (height >= 7.8m vs 6.4m baseline) clearing top HUD backdrop-blur panels.
  - TC-358.07 [UC-CAM-DESKTOP-PARITY/MSS]: Given desktop landscape aspect ratio ($aspect = 1.77$), When calling `calculateTileFocusCameraPosition` and `calculateChaseCameraPosition`, Then preserves exact baseline positions and FOVs.
  - TC-358.08 [UC-CAM-PREPAN-LEAD/MSS]: Given player at quadrant side 1, When calling `calculateDicePanCameraState`, Then position bias shifts towards player sector leading the viewer into the action.
  - TC-358.09 [UC-CAM-BOT-SPEED/MSS]: Given Bot turn in pawn_chase mode, When calling calculateTargetCameraState, Then uses restored speed 7.2 to eliminate camera lag behind pawn.
  - TC-358.10 [UC-CAM-BOT-DICE-PAN/MSS]: Given Bot turn with isRolling true, When calling calculateTargetCameraState, Then returns dice pan position with Y=19.8 and FOV=28 eliminating bot camera freeze.
  - TC-358.11 [UC-CAM-SCREEN-FRAMING/MSS]: Given mobile portrait aspect ratio ($aspect = 0.5$), When calculating tile_focus target, Then target Y is elevated to 0.85m centering 3D landmarks in clear viewport.
  - TC-358.12 [UC-CAM-SIDE-OFFSET/MSS]: Given tile at South side and mobile aspect 0.5, When calling resolveSideAwareCameraOffset with aspect, Then applies height multiplier 1.25 elevating camera above 7.8m.
  - TC-358.13 [UC-CAM-FOCUS-FOV-MATH/MSS]: Given mobile aspect ratio 0.5, When calling calculateResponsiveFocusFov, Then evaluates optical trigonometry returning 45 degrees.
  - TC-358.14 [UC-CAM-CHASE-FOV-MATH/MSS]: Given mobile aspect ratio 0.5, When calling calculateResponsiveChaseFov, Then evaluates optical trigonometry returning 48 degrees.
  - TC-358.15 [UC-CAM-STANDARD-CHASE-OFFSET/MSS]: Given pawn at origin and mobile aspect 0.5, When calling resolveStandardChaseOffset with aspect, Then scales elevation to 5.25m and horizontal offset to 4.1m.

### Station 2: Implementation (GREEN)

#### Task 2.1: Concurrency $C^0$ Continuity in Adaptive Cinematic Camera
**Target physical file**: `src/client/3d/adaptive_cinematic_camera.tsx`

```tsx
<<<<
      if (isActionOngoing && softReturnRef.current) {
        softReturnRef.current = null;
      }
====
      if (isActionOngoing && softReturnRef.current) {
        camBaseRef.current[0] = camera.position.x;
        camBaseRef.current[1] = camera.position.y;
        camBaseRef.current[2] = camera.position.z;
        if (controlsRef.current) {
          targetBaseRef.current[0] = controlsRef.current.target.x;
          targetBaseRef.current[1] = controlsRef.current.target.y;
          targetBaseRef.current[2] = controlsRef.current.target.z;
        }
        softReturnRef.current = null;
      }
>>>>
```

#### Task 2.2: Kinematic Helpers & Optical Trigonometry
**Target physical file**: `src/client/3d/camera_kinematic_helpers.ts`

```typescript
<<<<
export function resolveSideAwareCameraOffset(
  tileCoords: readonly [number, number, number],
  baseOffset: readonly [number, number, number] = [5.2, 6.4, 5.2]
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const height = Number.isFinite(baseOffset[1]) ? baseOffset[1] : 6.4;
  const absX = Math.abs(tx);
  const absZ = Math.abs(tz);
  if (absZ >= absX) {
    if (tz < 0) return [-1.8, height, -6.8];
    return [Number.isFinite(baseOffset[0]) ? baseOffset[0] : 5.2, height, Number.isFinite(baseOffset[2]) ? baseOffset[2] : 5.2];
  } else {
    if (tx < 0) return [-6.8, height, 1.8];
    return [6.8, height, -1.8];
  }
}

export function calculateTileFocusCameraPosition(
  tileCoords: readonly [number, number, number],
  offset?: readonly [number, number, number]
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const ty = Number.isFinite(tileCoords[1]) ? tileCoords[1] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const finalOffset = offset ?? resolveSideAwareCameraOffset(tileCoords);
  return [tx + finalOffset[0], ty + finalOffset[1], tz + finalOffset[2]];
}
====
export function resolveSideAwareCameraOffset(
  tileCoords: readonly [number, number, number],
  baseOffset: readonly [number, number, number] = [5.2, 6.4, 5.2],
  aspect?: number
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const safeAspect = typeof aspect === 'number' && Number.isFinite(aspect) && aspect > 0 ? aspect : 1.77;
  const isPortrait = safeAspect < 1.0;
  const clampedAspect = Math.max(0.35, safeAspect);
  const ky = isPortrait ? Math.min(1.35, Math.max(1.0, 0.95 / Math.sqrt(clampedAspect))) : 1.0;
  const kDist = isPortrait ? Math.min(1.25, Math.max(1.0, 0.88 / Math.sqrt(clampedAspect))) : 1.0;

  const baseHeight = Number.isFinite(baseOffset[1]) ? baseOffset[1] : 6.4;
  const height = baseHeight * ky;
  const absX = Math.abs(tx);
  const absZ = Math.abs(tz);
  if (absZ >= absX) {
    if (tz < 0) return [-1.8 * kDist, height, -6.8 * kDist];
    const bx = Number.isFinite(baseOffset[0]) ? baseOffset[0] : 5.2;
    const bz = Number.isFinite(baseOffset[2]) ? baseOffset[2] : 5.2;
    return [bx * kDist, height, bz * kDist];
  } else {
    if (tx < 0) return [-6.8 * kDist, height, 1.8 * kDist];
    return [6.8 * kDist, height, -1.8 * kDist];
  }
}

export function calculateTileFocusCameraPosition(
  tileCoords: readonly [number, number, number],
  offset?: readonly [number, number, number],
  aspect?: number
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const ty = Number.isFinite(tileCoords[1]) ? tileCoords[1] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const finalOffset = offset ?? resolveSideAwareCameraOffset(tileCoords, undefined, aspect);
  return [tx + finalOffset[0], ty + finalOffset[1], tz + finalOffset[2]];
}

export function calculateResponsiveFocusFov(aspect?: number, baseFov = 35): number {
  if (typeof aspect !== 'number' || !Number.isFinite(aspect) || aspect >= 1.0) {
    return baseFov;
  }
  const safeAspect = Math.max(0.42, aspect);
  const targetHalfRad = (baseFov * Math.PI) / 360;
  const neededHalfRad = Math.atan(Math.tan(targetHalfRad) / safeAspect);
  const calculatedFov = Math.round((neededHalfRad * 360) / Math.PI);
  return Math.min(45, Math.max(baseFov, calculatedFov));
}

export function calculateResponsiveChaseFov(aspect?: number, baseFov = 38): number {
  if (typeof aspect !== 'number' || !Number.isFinite(aspect) || aspect >= 1.0) {
    return baseFov;
  }
  const safeAspect = Math.max(0.42, aspect);
  const targetHalfRad = (baseFov * Math.PI) / 360;
  const neededHalfRad = Math.atan(Math.tan(targetHalfRad) / safeAspect);
  const calculatedFov = Math.round((neededHalfRad * 360) / Math.PI);
  return Math.min(48, Math.max(baseFov, calculatedFov));
}
>>>>
```

#### Task 2.3: Standard Chase Offset Signature & Aspect Scaling
**Target physical file**: `src/client/3d/cinematic_chase_camera.ts`

```typescript
<<<<
export function resolveStandardChaseOffset(
  pawnCoords: readonly [number, number, number]
): readonly [number, number, number] {
  const px = Number.isFinite(pawnCoords[0]) ? pawnCoords[0] : 0;
  const pz = Number.isFinite(pawnCoords[2]) ? pawnCoords[2] : 0;
  if (px === 0 && pz === 0) return [3.6, 4.2, 3.6];
  const side = resolveSideFromCoordinates(px, pz);
  switch (side) {
    case 1: return [-3.6, 4.2, 3.6];
    case 2: return [-3.6, 4.2, -3.6];
    case 3: return [3.6, 4.2, -3.6];
    default: return [3.6, 4.2, 3.6];
  }
}
====
export function resolveStandardChaseOffset(
  pawnCoords: readonly [number, number, number],
  aspect?: number
): readonly [number, number, number] {
  const px = Number.isFinite(pawnCoords[0]) ? pawnCoords[0] : 0;
  const pz = Number.isFinite(pawnCoords[2]) ? pawnCoords[2] : 0;
  const safeAspect = typeof aspect === 'number' && Number.isFinite(aspect) && aspect > 0 ? aspect : 1.77;
  const isPortrait = safeAspect < 1.0;
  const clampedAspect = Math.max(0.35, safeAspect);
  const ky = isPortrait ? Math.min(1.35, Math.max(1.0, 0.95 / Math.sqrt(clampedAspect))) : 1.0;
  const kDist = isPortrait ? Math.min(1.25, Math.max(1.0, 0.88 / Math.sqrt(clampedAspect))) : 1.0;
  const offH = 3.6 * kDist;
  const offY = 4.2 * ky;
  if (px === 0 && pz === 0) return [offH, offY, offH];
  const side = resolveSideFromCoordinates(px, pz);
  switch (side) {
    case 1: return [-offH, offY, offH];
    case 2: return [-offH, offY, -offH];
    case 3: return [offH, offY, -offH];
    default: return [offH, offY, offH];
  }
}
>>>>
```

#### Task 2.4: Camera State Machine Bot Boost & Framing Offset
**Target physical file**: `src/client/3d/camera_state_machine.ts`

```typescript
<<<<
import {
  resolveSideAwareCameraOffset,
  calculateTileFocusCameraPosition,
  calculateScreenShake,
  dampValue,
  calculateResponsiveCameraDistance,
} from './camera_kinematic_helpers';
====
import {
  resolveSideAwareCameraOffset,
  calculateTileFocusCameraPosition,
  calculateScreenShake,
  dampValue,
  calculateResponsiveCameraDistance,
  calculateResponsiveFocusFov,
  calculateResponsiveChaseFov,
} from './camera_kinematic_helpers';
>>>>
```

```typescript
<<<<
export function calculateChaseCameraPosition(
  pawnCoords: readonly [number, number, number],
  offset?: readonly [number, number, number]
): [number, number, number] {
  const px = Number.isFinite(pawnCoords[0]) ? pawnCoords[0] : 0;
  const py = Number.isFinite(pawnCoords[1]) ? pawnCoords[1] : 0;
  const pz = Number.isFinite(pawnCoords[2]) ? pawnCoords[2] : 0;
  const off = offset ?? resolveStandardChaseOffset(pawnCoords);
  return [px + off[0], py + off[1], pz + off[2]];
}
====
export function calculateChaseCameraPosition(
  pawnCoords: readonly [number, number, number],
  offset?: readonly [number, number, number],
  aspect?: number
): [number, number, number] {
  const px = Number.isFinite(pawnCoords[0]) ? pawnCoords[0] : 0;
  const py = Number.isFinite(pawnCoords[1]) ? pawnCoords[1] : 0;
  const pz = Number.isFinite(pawnCoords[2]) ? pawnCoords[2] : 0;
  const off = offset ?? resolveStandardChaseOffset(pawnCoords, aspect);
  return [px + off[0], py + off[1], pz + off[2]];
}
>>>>
```

```typescript
<<<<
      const p = pawnPosition ?? [0, 0, 0];
      const safePx = Number.isFinite(p[0]) ? p[0] : 0;
      const safePz = Number.isFinite(p[2]) ? p[2] : 0;
      return {
        position: calculateChaseCameraPosition(p),
        target: [safePx, 0.2, safePz],
        fov: CAMERA_CONFIG.pawn_chase.fov,
        speed: options?.isBotTurn ? 2.4 : CAMERA_CONFIG.pawn_chase.speed,
      };
    }
    case 'tile_focus': {
      const t = tilePosition ?? [0, 0, 0];
      const safeTx = Number.isFinite(t[0]) ? t[0] : 0;
      const safeTz = Number.isFinite(t[2]) ? t[2] : 0;
      return {
        position: calculateTileFocusCameraPosition(t),
        target: [safeTx, 0.15, safeTz],
        fov: CAMERA_CONFIG.tile_focus.fov,
        speed: options?.isBotTurn ? 2.2 : CAMERA_CONFIG.tile_focus.speed,
      };
    }
    case 'auction_focus':
      return configToCameraState(CAMERA_CONFIG.auction_focus);
    case 'overview':
    default:
      if (options?.isRolling && !options?.isHighStakesRoll && !options?.isBotTurn) {
        return calculateDicePanCameraState(options?.rollingPlayerPos, options?.aspect);
      }
      if (options?.gamePhase) {
        return resolveOverviewConfigByPhase(options.gamePhase, CAMERA_CONFIG.overview);
      }
      return configToCameraState(CAMERA_CONFIG.overview);
====
      const p = pawnPosition ?? [0, 0, 0];
      const safePx = Number.isFinite(p[0]) ? p[0] : 0;
      const safePz = Number.isFinite(p[2]) ? p[2] : 0;
      return {
        position: calculateChaseCameraPosition(p, undefined, options?.aspect),
        target: [safePx, 0.2, safePz],
        fov: calculateResponsiveChaseFov(options?.aspect),
        speed: options?.isBotTurn ? 7.2 : CAMERA_CONFIG.pawn_chase.speed,
      };
    }
    case 'tile_focus': {
      const t = tilePosition ?? [0, 0, 0];
      const safeTx = Number.isFinite(t[0]) ? t[0] : 0;
      const safeTz = Number.isFinite(t[2]) ? t[2] : 0;
      const isPortrait = typeof options?.aspect === 'number' && Number.isFinite(options.aspect) && options.aspect < 1.0;
      const targetY = isPortrait ? 0.85 : 0.15;
      return {
        position: calculateTileFocusCameraPosition(t, undefined, options?.aspect),
        target: [safeTx, targetY, safeTz],
        fov: calculateResponsiveFocusFov(options?.aspect),
        speed: options?.isBotTurn ? 4.0 : CAMERA_CONFIG.tile_focus.speed,
      };
    }
    case 'auction_focus':
      return configToCameraState(CAMERA_CONFIG.auction_focus);
    case 'overview':
    default:
      if (options?.isRolling && !options?.isHighStakesRoll) {
        return calculateDicePanCameraState(options?.rollingPlayerPos, options?.aspect);
      }
      if (options?.gamePhase) {
        return resolveOverviewConfigByPhase(options.gamePhase, CAMERA_CONFIG.overview);
      }
      return configToCameraState(CAMERA_CONFIG.overview);
>>>>
```

#### Task 2.5: Living Test Reconciliations
**Target physical file**: `tests/client/dramatic_pacing_camera.test.ts`

```typescript
<<<<
  it('[TC-DRAMA.06/A2][UC-DRAMA] Luot gieo xuc xac cua Bot giu nguyen Overview tinh tai Y = 25.3 chong say xe (Gotcha 63)', () => {
    const state = calculateTargetCameraState('overview', undefined, undefined, {
      isRolling: true,
      isBotTurn: true,
    });
    expect(state.position[1]).toBe(25.3);
    expect(state.fov).toBe(24);
  });
====
  it('[TC-DRAMA.06/A2][UC-DRAMA] Luot gieo xuc xac cua Bot kich hoat dice pan camera tai Y = 19.8 chong tre goc nhin', () => {
    const state = calculateTargetCameraState('overview', undefined, undefined, {
      isRolling: true,
      isBotTurn: true,
    });
    expect(state.position[1]).toBe(19.8);
    expect(state.fov).toBe(28);
  });
>>>>
```

**Target physical file**: `tests/client/imp356_android_depth_and_dice_landing.test.ts`

```typescript
<<<<
  it('[TC-356.08/MSS] [UC-CAM-BOT-SPEED]: Given Bot turn in pawn_chase mode, When calling calculateTargetCameraState, Then uses damped speed 2.4 to eliminate camera whiplash on mobile', () => {
    const resultState = calculateTargetCameraState('pawn_chase', [0, 0, 0], [0, 0, 0], {
      isBotTurn: true,
    });

    expect(resultState.speed).toBe(2.4);
    expect(resultState.fov).toBe(38);
  });
====
  it('[TC-356.08/MSS] [UC-CAM-BOT-SPEED]: Given Bot turn in pawn_chase mode, When calling calculateTargetCameraState, Then uses catch-up speed 7.2 overcoming bot hop velocity', () => {
    const resultState = calculateTargetCameraState('pawn_chase', [0, 0, 0], [0, 0, 0], {
      isBotTurn: true,
    });

    expect(resultState.speed).toBe(7.2);
    expect(resultState.fov).toBe(38);
  });
>>>>
```

### Station 3: Pre-Filter & Machine Gates
- Run `npm run prefilter -- src/client/3d/adaptive_cinematic_camera.tsx src/client/3d/camera_state_machine.ts src/client/3d/camera_kinematic_helpers.ts src/client/3d/cinematic_chase_camera.ts tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts`
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_358_BOT_CAMERA_LEAD_AND_MOBILE_FRAMING.md`
- Run physical visual verification:
  `npm run capture:visual -- --ticket IMP-358 --scenario camera_chase_dice_pan`
  `node scripts/check_evidence.mjs IMP-358`

### Station 4: Evidence & Acceptance Verification
- Run full regression test suite:
  `npx vitest run tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts`
  `npx vitest run tests/client/imp356_android_depth_and_dice_landing.test.ts`
  `npx vitest run tests/client/imp354_bot_camera_stabilization.test.ts`
  `npx vitest run tests/client/dramatic_pacing_camera.test.ts`
  `npx vitest run tests/client/cinematic_chase_camera.test.ts`
- Run Sentinel mutation check:
  `npm run sentinel -- --ticket IMP-358 --test tests/client/imp358_bot_camera_lead_and_mobile_framing.test.ts`
- Generate acceptance delivery report:
  `npm run report -- IMP-358`
