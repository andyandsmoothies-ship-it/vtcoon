# Plan IMP-361: iOS WebGL Performance, Context Hints & Thermal Tuning (Ticket IMP-361)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Committed)**:
  - Commit `df3709f` shipped English translation of all 8 SSOT gotchas in `docs/domain/gotchas/*.md`, adversarial challenger rules, and external backup synchronization.
- **Problem Statement & Architectural Hardening (Addressing Blocker Findings)**:
  - Apple WebKit forces all iOS web browsers (including Chrome/Edge) to use WKWebView.
  - Apple Silicon GPUs (A15–A18) provide strong hardware throughput, but WebKit defaults WebGL to a conservative low-power state unless provided `powerPreference: 'high-performance'`.
  - On iPhone Super Retina OLED screens (~460 ppi, up to 2796x1290 physical resolution), rendering at DPR 1.0 creates a heavy fill-rate workload that triggers Apple DVFS thermal throttling after 2–3 minutes.
  - **Resolution of Anti-TIDD & Unwired Mutation Seam**:
    1. **Plugged Context Hints into `<Canvas gl>`**: `getRecommendedGlProfile(isMobileDevice)` is imported and spread directly into `<Canvas gl={{ ... }}>` in `src/client/game_canvas.tsx`, eliminating dead code and guaranteeing `powerPreference: 'high-performance'` and `precision: 'mediump'` reach the WebKit driver.
    2. **Preserve `ACESFilmicToneMapping`**: Retain ACES Filmic tone mapping across all platforms to protect HDR lighting and prevent specular white burnout (`#FFFFFF` clipping) on water, buildings, and pawns.
    3. **Enforce iOS Phone Ceiling in `perf_budget.ts`**: Register `DPR_BOUNDS.IOS_PHONE_MAX = 0.82` and enforce this ceiling in `calculateAdaptiveDpr` so `AdaptiveDprController` does not step back up to 1.0 after 3 seconds of gameplay.
    4. **Differentiate iPhone vs iPad**: Isolate phone hardware via `isIOSPhone() = isIOSDevice() && isPhoneHardware()`. Do not penalize high-end M1–M4 iPad Pros with blurry phone resolutions.
    5. **Unified Subsystem Boundary (`client-3d`)**: Consolidate `device_detect.ts`, `perf_budget.ts`, and `game_canvas.tsx` under the `client-3d` subsystem with 100% Git diff parity.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-361`
- **Subsystem**: `client-3d` (Tier 1 3D Device Detection & Tier 2 3D Canvas Lifecycle)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/device_detect.ts` (Refactor)
  - **Target physical file**: `src/client/3d/perf_budget.ts` (Refactor)
  - **Target physical file**: `src/client/game_canvas.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp361_ios_webgl_perf.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/3d/safe_environment.tsx`
  - `src/client/3d/adaptive_dpr_controller.tsx`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/device_detect.ts` | Tier 1 (Domain/Server/Logic) | 57 | 76 | +19 | <= 400 | Safe (< 300 LOC) |
| `src/client/3d/perf_budget.ts` | Tier 1 (Domain/Server/Logic) | 317 | 326 | +9 | <= 400 | Refactor (Warning) |
| `src/client/game_canvas.tsx` | Tier 2 (UI/3D/Views) | 232 | 232 | 0 | <= 500 | Safe (< 300 LOC) |
| `tests/client/imp361_ios_webgl_perf.test.ts` | Living Test | 0 | 140 | +140 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp361_ios_webgl_perf.test.ts`:
  - TC-361.01 [UC-HARDWARE-DETECT/MSS]: Given user agent string for iPhone or iPod, When calling isIOSPhone, Then returns true for iPhone hardware.
  - TC-361.02 [UC-HARDWARE-DETECT/A1]: Given user agent string for iPad Pro tablet, When calling isIOSPhone, Then returns false preserving tablet high-fidelity performance profile.
  - TC-361.03 [UC-DPR-IOS-PHONE/MSS]: Given mobile iPhone device environment, When calling getRecommendedDpr, Then returns clamped Retina DPR range 0.75 to 0.82.
  - TC-361.04 [UC-DPR-IOS-TABLET/MSS]: Given iPadOS tablet device environment, When calling getRecommendedDpr, Then returns standard mobile tablet DPR range 0.85 to 1.0.
  - TC-361.05 [UC-GL-PROFILE/MSS]: Given mobile hardware context, When calling getRecommendedGlProfile, Then returns high-performance powerPreference and mediump shader precision.
  - TC-361.06 [UC-ADAPTIVE-IOS-CEILING/MSS]: Given PerfBudgetController with isIOSPhone true and sustained high FPS above 55, When evaluating adaptive DPR under high FPS, Then steps up strictly to IOS_PHONE_MAX 0.82 and never exceeds 0.82.
  - TC-361.07 [UC-ADAPTIVE-IOS-DEGRADED/MSS]: Given PerfBudgetController with isIOSPhone true and degraded FPS below 45, When evaluating adaptive DPR under low FPS, Then steps down to MOBILE_MIN 0.75 cleanly.

### Station 2: Implementation (GREEN)

#### Task 1: Hardware Detection & Context Profiles in `src/client/3d/device_detect.ts`
**Target physical file**: `src/client/3d/device_detect.ts`
```typescript
<<<<
export function getRecommendedDpr(isMobile: boolean): [number, number] {
  return isMobile ? [0.85, 1.0] : [1.0, 1.5];
}
====
export function isIOSPhone(): boolean {
  return isIOSDevice() && isPhoneHardware();
}

export function getRecommendedDpr(isMobile: boolean, isIOSPhoneDevice = isIOSPhone()): [number, number] {
  if (isIOSPhoneDevice) return [0.75, 0.82];
  return isMobile ? [0.85, 1.0] : [1.0, 1.5];
}

export interface CanvasGlProfile {
  readonly antialias: boolean;
  readonly powerPreference: 'high-performance';
  readonly precision: 'mediump' | 'highp';
}

export function getRecommendedGlProfile(isMobile: boolean): CanvasGlProfile {
  return {
    antialias: !isMobile,
    powerPreference: 'high-performance',
    precision: isMobile ? 'mediump' : 'highp',
  };
}
>>>>
```

#### Task 2: iOS Phone DPR Bounds & Adaptive Resolution in `src/client/3d/perf_budget.ts`
**Target physical file**: `src/client/3d/perf_budget.ts`
```typescript
<<<<
// [TC-IMP10.3/MSS] PerfBudget — 60 FPS Performance Budget Controller & Adaptive LOD System
// Enforces Draw Call Budget (<85 calls), triangle count (<150k), and target frame time (16.6ms)
====
// [TC-IMP10.3/MSS] PerfBudget — 60 FPS Performance Budget Controller & Adaptive LOD System
// Enforces Draw Call Budget (<85 calls), triangle count (<150k), and target frame time (16.6ms)

import { isIOSPhone as isIOSPhoneDevice } from './device_detect';
>>>>
```

```typescript
<<<<
export const DPR_BOUNDS = {
  MOBILE_MIN: 0.75,
  MOBILE_MAX: 1.0,
  DESKTOP_MIN: 1.0,
  DESKTOP_MAX: 1.5,
  STEP_DOWN_DELAY_MS: 1500,
  STEP_UP_DELAY_MS: 3000,
  FPS_DOWN_THRESHOLD: 45,
  FPS_UP_THRESHOLD: 55,
} as const;

export interface AdaptiveDprParams {
  readonly isMobile: boolean;
  readonly currentFps: number;
  readonly currentDpr: number;
  readonly isMotionActive?: boolean;
  readonly degradedDurationMs: number;
  readonly optimalDurationMs: number;
}
====
export const DPR_BOUNDS = {
  MOBILE_MIN: 0.75,
  MOBILE_MAX: 1.0,
  IOS_PHONE_MAX: 0.82,
  DESKTOP_MIN: 1.0,
  DESKTOP_MAX: 1.5,
  STEP_DOWN_DELAY_MS: 1500,
  STEP_UP_DELAY_MS: 3000,
  FPS_DOWN_THRESHOLD: 45,
  FPS_UP_THRESHOLD: 55,
} as const;

export interface AdaptiveDprParams {
  readonly isMobile: boolean;
  readonly isIOSPhone?: boolean;
  readonly currentFps: number;
  readonly currentDpr: number;
  readonly isMotionActive?: boolean;
  readonly degradedDurationMs: number;
  readonly optimalDurationMs: number;
}
>>>>
```

```typescript
<<<<
    const {
      isMobile,
      currentFps,
      currentDpr,
      isMotionActive = false,
      degradedDurationMs,
      optimalDurationMs,
    } = params;

    const minDpr = isMobile ? DPR_BOUNDS.MOBILE_MIN : DPR_BOUNDS.DESKTOP_MIN;
    const maxDpr = isMobile ? DPR_BOUNDS.MOBILE_MAX : DPR_BOUNDS.DESKTOP_MAX;
====
    const {
      isMobile,
      isIOSPhone = isIOSPhoneDevice(),
      currentFps,
      currentDpr,
      isMotionActive = false,
      degradedDurationMs,
      optimalDurationMs,
    } = params;

    const minDpr = isMobile ? DPR_BOUNDS.MOBILE_MIN : DPR_BOUNDS.DESKTOP_MIN;
    const maxDpr = isIOSPhone
      ? DPR_BOUNDS.IOS_PHONE_MAX
      : (isMobile ? DPR_BOUNDS.MOBILE_MAX : DPR_BOUNDS.DESKTOP_MAX);
>>>>
```

```typescript
<<<<
        const nextDpr = isMobile
          ? (currentDpr < 0.85 ? 0.85 : DPR_BOUNDS.MOBILE_MAX)
          : Math.min(maxDpr, Number((currentDpr + 0.25).toFixed(2)));
====
        const nextDpr = isIOSPhone
          ? DPR_BOUNDS.IOS_PHONE_MAX
          : (isMobile
            ? (currentDpr < 0.85 ? 0.85 : DPR_BOUNDS.MOBILE_MAX)
            : Math.min(maxDpr, Number((currentDpr + 0.25).toFixed(2))));
>>>>
```

#### Task 3: Wire Context Hints into Production Canvas in `src/client/game_canvas.tsx`
**Target physical file**: `src/client/game_canvas.tsx`
```typescript
<<<<
import { isMobileHardware, getRecommendedDpr } from './3d/device_detect';
====
import { isMobileHardware, getRecommendedDpr, getRecommendedGlProfile } from './3d/device_detect';
>>>>
```

```typescript
<<<<
        gl={{
          antialias: !isMobileDevice,
          toneMapping: isMobileDevice ? ACESFilmicToneMapping : NoToneMapping,
          toneMappingExposure: 1.08,
        }}
====
        gl={{
          ...getRecommendedGlProfile(isMobileDevice),
          toneMapping: isMobileDevice ? ACESFilmicToneMapping : NoToneMapping,
          toneMappingExposure: 1.08,
        }}
>>>>
```

## 4. Definition of Done (DoD) & Stopping Criteria
1. **Mechanical Automated Gates**:
   - `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_361_IOS_WEBGL_PERFORMANCE_AND_THERMAL_TUNING.md --auto-sign` passes with 0 defects.
   - `npm run prefilter -- src/client/3d/device_detect.ts src/client/3d/perf_budget.ts src/client/game_canvas.tsx tests/client/imp361_ios_webgl_perf.test.ts` passes with 0 errors.
   - All Station 1 contract tests pass green.
   - `node scripts/check_evidence.mjs IMP-361` verifies complete physical execution evidence.
2. **Stopping Boundary**:
   - Once all test assertions pass and pre-filter checks succeed, Station 2 concludes with zero exploratory side refactorings.
