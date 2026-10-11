# Plan IMP-364: Static Shadow Map Caching & Idle Workload Thermal Hardening (Ticket IMP-364)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope**:
  - Ticket IMP-361 implemented iOS WebGL performance tuning: iOS Phone Retina DPR clamping (0.75–0.82) and WebGL context hints.
  - Ticket IMP-362 implemented Mobile Backdrop Blur Purge across CSS and HUD elements to eliminate WebKit compositor readback stalls.
  - Ticket IMP-363 implemented Board Tiles Merged Batching, collapsing 80 tile plinth/surface draw calls into 3 calls (-96.25%) across `src/client/3d/board_tile.tsx`, `src/client/3d/board_layout.tsx`, `src/client/3d/batched_board_tiles.tsx`, and `tests/client/imp363_batched_board_tiles.test.ts`.
  - In-flight water shader optimizations across `src/client/3d/shaders/tropical_water_material.ts`, `src/client/3d/tropical_water.tsx`, and `tests/client/imp365_mobile_water_lod.test.ts`.
- **Problem Statement (Hòn đá 4: Frameloop & Shadow Churn during Idle Turns)**:
  - In VTCOON, matches are turn-based: 70–80% of match duration the board is static while players evaluate property deeds, inspect trade offers, or wait for opponent actions.
  - When directional lighting shadow mapping is enabled (`castShadow = true`), Three.js defaults to `shadow.autoUpdate = true`.
  - On every single frame (60–120 FPS), Three.js re-renders the complete shadow map depth pass across hundreds of diorama and building geometries, regardless of whether anything on the board moved.
  - Naive `frameloop="demand"` breaks `TropicalWater` procedural wave animation (`uTime`), causes stutter in exponential camera easing, and paralyzes the FSM animation watchdog.
- **Hardened Architectural Solution (Incorporating Adversarial Plan Challenge Findings)**:
  1. **Physical Transform Delta Engine (`src/client/3d/shadow_cache_helpers.ts`)**:
     - Export pure math helper `isSunPositionMoving(currentPos, targetPos, thresholdSq = 1e-4): boolean` to physically detect daylight transit without relying on indirect store flags (`isAuto`).
     - Export `shouldUpdateShadows(params: ShadowUpdateParams): boolean` evaluating physical triggers: dice rolling (`isRolling`), pawn hopping (`isPawnMoving`), daylight transit (`isSunMoving`), and property construction/demolition (`isBuildingDirty`).
     - Export `calculateShadowGraceRemaining(lastMotionTimeMs, nowMs, gracePeriodMs = 500): number` guaranteeing a 500ms post-motion settling window for pawn hops and construction slams.
     - Export `applyShadowAutoUpdate(light, activeUpdate): boolean` encapsulating Three.js shadow controller state transitions with zero SSR crash hazard.
  2. **Lighting Shadow Map Arbitrator (`src/client/3d/time_of_day_lighting.tsx`)**:
     - Connect physical delta detection and `levelMap` change subscription into `TimeOfDayLighting`.
     - When idle and grace expired, freeze shadow map rendering via `applyShadowAutoUpdate(sunRef.current, false)`.
     - When motion commences, awaken dynamic shadows via `applyShadowAutoUpdate(sunRef.current, true)`.
     - Preserves full 60/120 FPS continuous frameloop for `TropicalWater`, smooth camera decay, and FSM watchdog, while eliminating 100% of redundant GPU shadow depth passes during idle turns.
  3. **Zero Shadow Budget Compliance for Diorama Micro-Traffic (`diorama_traffic.tsx`, `diorama_railroad.tsx`)**:
     - Strip `castShadow` from micro-cars and trains, adhering to the Zero Shadow Budget [P3] established for ca-noes (`diorama_microlife.tsx`) and birds (`diorama_perching_birds.tsx`).
     - Eliminates detached ghost shadow artifacts when the global shadow map freezes during player deliberation.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-364`
- **Subsystem**: `client-3d` (Tier 2 3D Presentation & Visual Caching)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/shadow_cache_helpers.ts` (Refactor)
  - **Target physical file**: `src/client/3d/time_of_day_lighting.tsx` (Refactor)
  - **Target physical file**: `src/client/3d/diorama/diorama_traffic.tsx` (Refactor)
  - **Target physical file**: `src/client/3d/diorama/diorama_railroad.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp364_static_shadow_caching.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/store/game_store.ts` (`isRolling`, `activePawnAnimation`, `levelMap`)
  - `src/client/store/environment_store.ts` (`phase`, `TIME_OF_DAY_PRESETS`)

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/shadow_cache_helpers.ts` | Tier 1 (Pure Logic / Helpers) | 22 | 61 | +39 | <= 400 | Safe (< 80 LOC) |
| `src/client/3d/time_of_day_lighting.tsx` | Tier 2 (UI/3D/Views) | 331 | 359 | +28 | <= 500 | Safe (< 370 LOC) |
| `src/client/3d/diorama/diorama_traffic.tsx` | Tier 2 (UI/3D/Views) | 264 | 263 | -1 | <= 500 | Safe (< 270 LOC) |
| `src/client/3d/diorama/diorama_railroad.tsx` | Tier 2 (UI/3D/Views) | 376 | 376 | 0 | <= 500 | Safe (< 390 LOC) |
| `tests/client/imp364_static_shadow_caching.test.ts` | Living Test | 0 | 145 | +145 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp364_static_shadow_caching.test.ts`:
  - TC-364.01 [UC-SHADOW-IDLE/MSS]: Given idle state with all motion flags false, When calling shouldUpdateShadows, Then returns false to freeze shadow depth passes.
  - TC-364.02 [UC-SHADOW-DICE/MSS]: Given active dice rolling flag, When calling shouldUpdateShadows, Then returns true to awaken shadow map rendering.
  - TC-364.03 [UC-SHADOW-PAWN/MSS]: Given active pawn hopping animation flag, When calling shouldUpdateShadows, Then returns true to awaken shadow map rendering.
  - TC-364.04 [UC-SHADOW-BUILDING/MSS]: Given building level change flag, When calling shouldUpdateShadows, Then returns true to bake new construction shadows.
  - TC-364.05 [UC-SHADOW-SUN-MOVING/MSS]: Given active sun trajectory flag, When calling shouldUpdateShadows, Then returns true to track moving daylight.
  - TC-364.06 [UC-SUN-DELTA-STATIONARY/MSS]: Given sun current position within threshold of target, When calling isSunPositionMoving, Then returns false indicating resting position.
  - TC-364.07 [UC-SUN-DELTA-ACTIVE/MSS]: Given sun current position distant from target, When calling isSunPositionMoving, Then returns true indicating daylight in transit.
  - TC-364.08 [UC-SHADOW-GRACE-ACTIVE/MSS]: Given elapsed time less than grace period, When calling calculateShadowGraceRemaining, Then returns positive remaining milliseconds.
  - TC-364.09 [UC-SHADOW-GRACE-EXPIRED/MSS]: Given elapsed time exceeding grace period, When calling calculateShadowGraceRemaining, Then returns 0 to allow static freezing.
  - TC-364.10 [UC-SHADOW-GRACE-GUARD/MSS]: Given non-finite timestamps or negative elapsed time, When calling calculateShadowGraceRemaining, Then safely returns bounded grace or zero without NaN.
  - TC-364.11 [UC-LIGHT-SHADOW-FREEZE/MSS]: Given directional light with shadow and activeUpdate false, When calling applyShadowAutoUpdate, Then disables autoUpdate and returns false.
  - TC-364.12 [UC-LIGHT-SHADOW-AWAKEN/MSS]: Given directional light with shadow and activeUpdate true, When calling applyShadowAutoUpdate, Then enables autoUpdate and sets needsUpdate true.
  - TC-364.13 [UC-LIGHT-SHADOW-NULL/MSS]: Given null light or light without shadow object, When calling applyShadowAutoUpdate, Then safely returns false without throwing exceptions.

### Station 2: Minimal Production Implementation (GREEN)

#### Task 1: Complete Shadow Cache Pure Helpers in `src/client/3d/shadow_cache_helpers.ts`
**Target physical file**: `src/client/3d/shadow_cache_helpers.ts`
```typescript
<<<<
export interface ShadowUpdateParams {
  readonly isRolling?: boolean;
  readonly isPawnMoving?: boolean;
  readonly isCameraMoving?: boolean;
  readonly isUserInteracting?: boolean;
  readonly isPhaseTransitioning?: boolean;
  readonly isAuctionActive?: boolean;
}

export function shouldUpdateShadows(_params: ShadowUpdateParams): boolean {
  throw new Error('Not implemented');
}

export function calculateShadowGraceRemaining(
  _lastMotionTimeMs: number,
  _nowMs: number,
  _gracePeriodMs = 500
): number {
  throw new Error('Not implemented');
}
====
import type { DirectionalLight, Vector3 } from 'three';

export interface ShadowUpdateParams {
  readonly isRolling?: boolean;
  readonly isPawnMoving?: boolean;
  readonly isSunMoving?: boolean;
  readonly isBuildingDirty?: boolean;
}

export function shouldUpdateShadows(params: ShadowUpdateParams): boolean {
  return Boolean(
    params.isRolling ||
    params.isPawnMoving ||
    params.isSunMoving ||
    params.isBuildingDirty
  );
}

export function isSunPositionMoving(
  currentPos: Vector3 | { x: number; y: number; z: number },
  targetPos: Vector3 | [number, number, number],
  thresholdSq = 1e-4
): boolean {
  const tx = Array.isArray(targetPos) ? targetPos[0] : targetPos.x;
  const ty = Array.isArray(targetPos) ? targetPos[1] : targetPos.y;
  const tz = Array.isArray(targetPos) ? targetPos[2] : targetPos.z;
  const dx = currentPos.x - tx;
  const dy = currentPos.y - ty;
  const dz = currentPos.z - tz;
  return (dx * dx + dy * dy + dz * dz) > thresholdSq;
}

export function calculateShadowGraceRemaining(
  lastMotionTimeMs: number,
  nowMs: number,
  gracePeriodMs = 500
): number {
  if (!Number.isFinite(lastMotionTimeMs) || !Number.isFinite(nowMs) || !Number.isFinite(gracePeriodMs)) {
    return 0;
  }
  const elapsed = nowMs - lastMotionTimeMs;
  if (elapsed < 0) return gracePeriodMs;
  const remaining = gracePeriodMs - elapsed;
  return remaining > 0 ? remaining : 0;
}

export function applyShadowAutoUpdate(
  light: DirectionalLight | null,
  activeUpdate: boolean
): boolean {
  if (!light || !light.shadow) return false;
  if (light.shadow.autoUpdate !== activeUpdate) {
    light.shadow.autoUpdate = activeUpdate;
    if (activeUpdate) {
      light.shadow.needsUpdate = true;
    }
  }
  return light.shadow.autoUpdate;
}
>>>>
```

#### Task 2: Integrate Static Shadow Map Caching in `src/client/3d/time_of_day_lighting.tsx`
**Target physical file**: `src/client/3d/time_of_day_lighting.tsx`

Snippet 1 (Import helpers):
```typescript
<<<<
import { useGameStore } from '../store/game_store';
import { calculateTheatricalAmbientIntensity } from './auction_3d_stage';
import { resolveShadowMapSize } from '../ui/ui_helpers';
====
import { useGameStore } from '../store/game_store';
import { calculateTheatricalAmbientIntensity } from './auction_3d_stage';
import { resolveShadowMapSize } from '../ui/ui_helpers';
import {
  shouldUpdateShadows,
  isSunPositionMoving,
  calculateShadowGraceRemaining,
  applyShadowAutoUpdate,
} from './shadow_cache_helpers';
>>>>
```

Snippet 2 (Connect motion state subscriptions and motion timestamp ref):
```typescript
<<<<
  const currentBid = useGameStore((s) => s.auction?.currentBid ?? 0);
  const prevBidRef = useRef<number>(currentBid);
  const bidFlashTimerRef = useRef<number>(1.0);

  const shadowMapSize = resolveShadowMapSize(isMobile);

  const sunRef = useRef<DirectionalLight>(null);
====
  const currentBid = useGameStore((s) => s.auction?.currentBid ?? 0);
  const isRolling = useGameStore((s) => s.isRolling);
  const isPawnMoving = useGameStore((s) => Boolean(s.activePawnAnimation?.isAnimating));
  const levelMap = useGameStore((s) => s.levelMap);
  const prevBidRef = useRef<number>(currentBid);
  const bidFlashTimerRef = useRef<number>(1.0);
  const prevLevelMapRef = useRef(levelMap);
  const lastMotionTimeRef = useRef<number>(performance.now());

  const shadowMapSize = resolveShadowMapSize(isMobile);

  const sunRef = useRef<DirectionalLight>(null);
>>>>
```

Snippet 3 (Execute dynamic shadow update arbitration in safe frame loop):
```typescript
<<<<
    updateDirectLights(sunRef.current, fillRef.current, rimRef.current, preset, phase, isAuctionActive, lerpRate, tempVec, tempColor, flashBoost);
    updateDiffuseAndAtmosphere(ambientRef.current, hemiRef.current, state.scene, state.gl, preset, phase, isAuctionActive, dt, lerpRate, tempColor, flashBoost);
====
    updateDirectLights(sunRef.current, fillRef.current, rimRef.current, preset, phase, isAuctionActive, lerpRate, tempVec, tempColor, flashBoost);
    if (sunRef.current?.shadow) {
      const isSunMoving = isSunPositionMoving(sunRef.current.position, preset.sunPosition);
      const isBuildingDirty = prevLevelMapRef.current !== levelMap;
      prevLevelMapRef.current = levelMap;
      const needsShadows = shouldUpdateShadows({
        isRolling,
        isPawnMoving,
        isSunMoving,
        isBuildingDirty,
      });
      const now = performance.now();
      if (needsShadows) {
        lastMotionTimeRef.current = now;
      }
      const graceRemaining = calculateShadowGraceRemaining(lastMotionTimeRef.current, now, 500);
      applyShadowAutoUpdate(sunRef.current, needsShadows || graceRemaining > 0);
    }
    updateDiffuseAndAtmosphere(ambientRef.current, hemiRef.current, state.scene, state.gl, preset, phase, isAuctionActive, dt, lerpRate, tempColor, flashBoost);
>>>>
```

#### Task 3: Zero Shadow Budget for Micro-Vehicles in `src/client/3d/diorama/diorama_traffic.tsx`
**Target physical file**: `src/client/3d/diorama/diorama_traffic.tsx`

Snippet 1 (MicroVehicleProceduralFallback):
```typescript
<<<<
      {/* 1. Thân vỏ xe chính bo cong khí động học */}
      <RoundedBox args={[w, h * 0.7, l]} radius={0.008} smoothness={2} castShadow position={[0, h / 2, 0]}>
        <meshStandardMaterial color={v.color} roughness={0.35} metalness={0.2} />
      </RoundedBox>
====
      {/* 1. Thân vỏ xe chính bo cong khí động học (Zero castShadow theo chuẩn [P3]) */}
      <RoundedBox args={[w, h * 0.7, l]} radius={0.008} smoothness={2} position={[0, h / 2, 0]}>
        <meshStandardMaterial color={v.color} roughness={0.35} metalness={0.2} />
      </RoundedBox>
>>>>
```

Snippet 2 (GLTF Model instance):
```typescript
<<<<
              <SafeGLTFModel
                url={getVehicleModelUrl(v.type)}
                fallback={<MicroVehicleProceduralFallback v={v} />}
                castShadow
                receiveShadow
              />
====
              <SafeGLTFModel
                url={getVehicleModelUrl(v.type)}
                fallback={<MicroVehicleProceduralFallback v={v} />}
                receiveShadow
              />
>>>>
```

#### Task 4: Zero Shadow Budget for Micro-Train in `src/client/3d/diorama/diorama_railroad.tsx`
**Target physical file**: `src/client/3d/diorama/diorama_railroad.tsx`

Snippet 1 (Lead Cab):
```typescript
<<<<
      {/* Đầu tàu (Lead Cab): Mũi vát #0EA5E9, dải cyan #0284C7, thân bạc #E2E8F0, đèn LED #FEF08A, đèn an toàn #DC2626 */}
      <group ref={leadRef} position={[-2.2, carriageY, 6.9]}>
        <mesh castShadow position={[0, 0, 0]}>
          <SafeBoxGeometry args={[0.65, 0.07, 0.14]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0.26, -0.005, 0]}>
====
      {/* Đầu tàu (Lead Cab): Mũi vát #0EA5E9, dải cyan #0284C7, thân bạc #E2E8F0, đèn LED #FEF08A, đèn an toàn #DC2626 */}
      <group ref={leadRef} position={[-2.2, carriageY, 6.9]}>
        <mesh position={[0, 0, 0]}>
          <SafeBoxGeometry args={[0.65, 0.07, 0.14]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.26, -0.005, 0]}>
>>>>
```

Snippet 2 (Passenger Coach 1):
```typescript
<<<<
      {/* Toa khách 1 (Passenger Coach 1): Thân bạc #E2E8F0, sọc cyan #0284C7, pantograph / điều hòa #64748B */}
      <group ref={coach1Ref} position={[-1.4, carriageY, 6.9]}>
        <mesh castShadow position={[0, 0, 0]}>
====
      {/* Toa khách 1 (Passenger Coach 1): Thân bạc #E2E8F0, sọc cyan #0284C7, pantograph / điều hòa #64748B */}
      <group ref={coach1Ref} position={[-1.4, carriageY, 6.9]}>
        <mesh position={[0, 0, 0]}>
>>>>
```

Snippet 3 (Passenger Coach 2):
```typescript
<<<<
      {/* Toa khách 2 (Passenger Coach 2): Thân bạc #E2E8F0, sọc cyan #0284C7, pantograph / điều hòa #64748B */}
      <group ref={coach2Ref} position={[-0.55, carriageY, 6.9]}>
        <mesh castShadow position={[0, 0, 0]}>
====
      {/* Toa khách 2 (Passenger Coach 2): Thân bạc #E2E8F0, sọc cyan #0284C7, pantograph / điều hòa #64748B */}
      <group ref={coach2Ref} position={[-0.55, carriageY, 6.9]}>
        <mesh position={[0, 0, 0]}>
>>>>
```

## 4. Definition of Done (DoD) & Stopping Criteria
1. **Mechanical Automated Gates**:
   - `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_364_STATIC_SHADOW_CACHING_AND_IDLE_WORKLOAD.md --auto-sign` passes with 0 defects.
   - `npm run prefilter -- src/client/3d/shadow_cache_helpers.ts src/client/3d/time_of_day_lighting.tsx src/client/3d/diorama/diorama_traffic.tsx src/client/3d/diorama/diorama_railroad.tsx tests/client/imp364_static_shadow_caching.test.ts` passes with 0 errors.
   - All Station 1 contract tests pass green.
   - In-action physical visual verification via `npm run capture:visual -- --ticket IMP-364 --scenario dice_rolling --dual` and evidence check `node scripts/check_evidence.mjs IMP-364`.
2. **Stopping Boundary**:
   - Once all contract assertions turn green, visual evidence is captured, and pre-filters succeed, Station 2 concludes with zero exploratory side refactoring.
