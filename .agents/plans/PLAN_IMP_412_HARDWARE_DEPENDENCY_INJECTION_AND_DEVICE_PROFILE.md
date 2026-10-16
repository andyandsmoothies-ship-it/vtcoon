# PLAN_IMP_412: Hardware Dependency Injection & Device Profile Context (Nhóm 2 Slice 2D - Hardened Revision 2)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md) (Mục 6: Kiến trúc Độc lập Phần cứng & DI), [`CODEBASE_REORGANIZATION_ROADMAP_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/CODEBASE_REORGANIZATION_ROADMAP_REPORT.md), and Adversarial Audit Brief [`.agents/audit/PLAN_CHALLENGE_IMP-412.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-412.md).
- **Subsystem Boundary Isolation**: Strictly confined to `client-3d` subsystem across 3 cohesive families (`src/client/3d/device`, `src/client/game`, `src/client/3d/adaptive`), satisfying `rules_scope.mjs` mechanical gate (0 cross-subsystem contamination, <= 3 cohesive units).
- **Problems**:
  1. **Direct Leaf Device Sniffer Violation in Hot Render Loop**: `src/client/3d/adaptive_dpr_controller.tsx` directly calls `isIOSPhone()` on every frame inside `useFrame` (line 40), and omits `isIOSPhone` from `perfBudget.calculateAdaptiveDpr` (line 76), causing `perf_budget.ts#L278` to silently fallback to `isIOSPhoneDevice()` on every single frame at 60–120 FPS.
  2. **Non-Deterministic Testing & Global Mock Hazard**: Without a top-level React Context for hardware capabilities, tests testing mobile vs desktop variants are forced to monkey-patch globals or use `vi.spyOn` on device detection modules, creating test flakiness and state leakage.
  3. **R3F Reconciler Zero-DOM Invariant & Reference Thrashing**: R3F creates an isolated Three.js reconciler inside `<Canvas>`. Any context provider mounted inside `<Canvas>` MUST NOT contain DOM tags (`<div>`) to prevent Three namespace crashes. Furthermore, canvas-level device profiles must be memoized via `useMemo` to prevent recreation of WebGL renderer options on every state tick.
- **Architectural Solution & Seam Discipline**:
  1. **Thiết lập `src/client/3d/device_profile_context.tsx`**: Declares canonical `DeviceProfile` interface, `DEFAULT_DEVICE_PROFILE` (safe desktop baseline), `resolveDeviceProfile()` (SSR-safe resolver with overrides and fallback sniffer queries), `DeviceProfileContext`, `DeviceProfileProvider` (pure React Context provider returning strictly `<DeviceProfileContext.Provider>` with 0 DOM wrapper tags), and `useDeviceProfile()` hook (with graceful fallback to `resolveDeviceProfile()` when invoked outside any provider to preserve 100% backward-compatibility with unwrapped legacy tests like `imp374`).
  2. **Call-Site Root Wiring Trong `src/client/game_canvas.tsx`**: Resolves `deviceProfile = React.useMemo(() => resolveDeviceProfile(propIsMobile !== undefined ? { isMobile: propIsMobile } : undefined), [propIsMobile])`, passes memoized `deviceProfile.recommendedDpr` and `deviceProfile.glProfile` to `<Canvas>`, and wraps both the outer container and inner R3F scene with `<DeviceProfileProvider profile={deviceProfile}>`.
  3. **Leaf Consumer Migration Trong `src/client/3d/adaptive_dpr_controller.tsx`**: Purges `import { isIOSPhone } from './device_detect'`, consumes `useDeviceProfile()`, reads `profile.isIOSPhone` deterministically, replaces per-frame `const isIOSPhoneActive = isIOSPhone()`, AND explicitly passes `isIOSPhone: isIOSPhoneActive` into `perfBudget.calculateAdaptiveDpr({...})` at line 76, completely eliminating per-frame sniffer execution. Preserves `resolveClampedDpr` and `isMobile` optional prop for 100% backward-compatibility with existing living tests (`adaptive_dpr_controller.test.ts`, `imp374`).

### Principles Applied
- **Platform DI Isolation** -> Injected device capabilities deterministically via `DeviceProfileContext`, eliminating leaf runtime sniffer executions in hot render loops.
- **100% DTO & Call-Site Wiring** -> 100% of fields on `DeviceProfile` (`isMobile`, `isIOSPhone`, `recommendedDpr`, `glProfile`) actively consumed across `game_canvas.tsx` and `adaptive_dpr_controller.tsx`.
- **View-Model Seam Extraction** -> Extracted hardware profile resolution and SSR guards into deterministic, pure helper `resolveDeviceProfile`.
- **Resource Disposal & Cache Hygiene** -> Memoized `deviceProfile` in `GameCanvas` via `useMemo([propIsMobile])` to prevent context invalidation and WebGL renderer recreation.
- **Equivalence-Partition Testing** -> Partitioned test suite across SSR desktop defaults, deterministic DI overrides, iOS phone resolution clamps, AST sniffer import confinement, and unwrapped legacy fallback parity.
- **Pure-Move Quarantine** -> Preserved 100% DPR clamping thresholds, tone mapping settings, and fallback behavior.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/device_profile_context.tsx` | Tier 2 (UI/3D) | 0 | 68 | ~+68 | 500 | Safe (New Context) |
| `src/client/game_canvas.tsx` | Tier 2 (UI/3D) | 243 | 254 | ~+11 | 500 | Safe (Provider Wiring) |
| `src/client/3d/adaptive_dpr_controller.tsx` | Tier 2 (UI/3D) | 96 | 95 | ~-1 | 500 | Safe (DI Refactored) |
| `tests/client/imp412_device_profile_context_and_hardware_di.test.ts` | Living Test | 0 | 210 | ~+210 | 600 | Safe (New Living Test) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/3d/device_profile_context.tsx` (New DI Context & Provider)
```typescript
import React from 'react';
import type { CanvasGlProfile } from './device_detect';

export interface DeviceProfile {
  readonly isMobile: boolean;
  readonly isIOSPhone: boolean;
  readonly recommendedDpr: [number, number];
  readonly glProfile: CanvasGlProfile;
}

export const DEFAULT_DEVICE_PROFILE: DeviceProfile;

export function resolveDeviceProfile(overrides?: Partial<DeviceProfile>): DeviceProfile;

export const DeviceProfileContext: React.Context<DeviceProfile | null>;

export interface DeviceProfileProviderProps {
  readonly profile?: DeviceProfile;
  readonly value?: DeviceProfile;
  readonly isMobile?: boolean;
  readonly children: React.ReactNode;
}

// Pure Context Provider: strictly renders <DeviceProfileContext.Provider> with 0 DOM wrapper tags
export function DeviceProfileProvider(props: DeviceProfileProviderProps): React.ReactElement;

// Context hook: returns active context, or falls back to resolveDeviceProfile() when unwrapped for 100% legacy test compatibility
export function useDeviceProfile(): DeviceProfile;
```

**Target physical file**: `src/client/3d/adaptive_dpr_controller.tsx` (Refactored Leaf Consumer)
```typescript
export interface AdaptiveDprControllerProps {
  readonly isMobile?: boolean;
}

export function resolveClampedDpr(rawDpr: number, isMobile: boolean, isIOSPhoneDevice: boolean): number;

export function AdaptiveDprController(props: AdaptiveDprControllerProps): null;
```

**Target physical file**: `src/client/game_canvas.tsx` (Refactored Canvas Root)
```typescript
export interface GameCanvasProps {
  readonly players?: readonly Player[];
  readonly isLobby?: boolean;
  readonly isMobile?: boolean;
  readonly enablePostProcessing?: boolean;
}

export function GameCanvas(props: GameCanvasProps): React.ReactElement;
```

### Call-Site Wiring & Integration Anchors
- **Target physical file**: `src/client/game_canvas.tsx`
  - Replaces inline `isMobileHardware()` call with memoized resolution:
    ```typescript
    const deviceProfile = React.useMemo(
      () => resolveDeviceProfile(propIsMobile !== undefined ? { isMobile: propIsMobile } : undefined),
      [propIsMobile]
    );
    const isMobileDevice = deviceProfile.isMobile;
    ```
  - Configures `<Canvas dpr={deviceProfile.recommendedDpr} gl={{ ...deviceProfile.glProfile, ... }}>`.
  - Wraps R3F scene children inside `<Canvas>` with `<DeviceProfileProvider profile={deviceProfile}>` (Zero DOM tags).
  - Wraps outer canvas container with `<DeviceProfileProvider profile={deviceProfile}>` for DOM HUD consistency.
- **Target physical file**: `src/client/3d/adaptive_dpr_controller.tsx`
  - Removes `import { isIOSPhone } from './device_detect';`.
  - Imports `useDeviceProfile` from `./device_profile_context`.
  - Replaces per-frame `const isIOSPhoneActive = isIOSPhone()` in `useFrame` with context-derived `profile.isIOSPhone`.
  - Explicitly wires `isIOSPhone: isIOSPhoneActive` into `perfBudget.calculateAdaptiveDpr({...})` at line 76 to prevent silent fallback sniffer invocations.

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp412_device_profile_context_and_hardware_di.test.ts`)

- **TC-412.01 [UC-DEVICE-PROFILE-RESOLUTION-AND-DEFAULTS/MSS]**: Given server-side rendering (SSR) or desktop environment, When `resolveDeviceProfile()` executes without arguments, Then returns `DEFAULT_DEVICE_PROFILE` (`isMobile: false`, `isIOSPhone: false`, `recommendedDpr: [1.0, 1.5]`, `glProfile.antialias: true`); and when given explicit overrides (`{ isMobile: true, isIOSPhone: true }`), resolves mobile DPR clamp `[0.75, 0.82]` and mediump precision.
- **TC-412.02 [UC-DETERMINISTIC-DI-WITHOUT-SPYON-AND-ZERO-DOM/MSS]**: Given a component subtree wrapped in `<DeviceProfileProvider value={mockProfile}>`, When `useDeviceProfile()` is called, Then returns `mockProfile` with exact referential equality without requiring `vi.spyOn` or window property manipulation; verifies `DeviceProfileProvider` renders zero DOM wrapper elements (pure Context Provider); and when called outside any provider, safely falls back to dynamic `resolveDeviceProfile()`.
- **TC-412.03 [UC-LEAF-CONSUMER-DI-INTEGRATION/MSS]**: Given `AdaptiveDprController` rendered inside a `<DeviceProfileProvider>` configured for iOS phone (`isMobile: true`, `isIOSPhone: true`), When simulated frame step runs with initial DPR 3.0, Then clamps DPR to `DPR_BOUNDS.IOS_PHONE_MAX` (0.82) with hardware sniffers remaining uncalled; and verifies `perfBudget.calculateAdaptiveDpr` receives explicit `isIOSPhone: true` in its parameters.
- **TC-412.04 [UC-DEVICE-SNIFFER-AST-CONFINEMENT/MSS]**: Given source files `src/client/3d/adaptive_dpr_controller.tsx` and `src/client/3d/device_profile_context.tsx`, When inspected via static AST parsing, Then proves `adaptive_dpr_controller.tsx` contains 0 imports or references to `isMobileHardware`, `isPhoneHardware`, or `isIOSPhone`, verifying complete mechanical compliance with the Device Sniffing Dependency Injection Invariant.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_412_HARDWARE_DEPENDENCY_INJECTION_AND_DEVICE_PROFILE.md --auto-sign`
  2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_412_HARDWARE_DEPENDENCY_INJECTION_AND_DEVICE_PROFILE.md`
  3. `npx --yes tsc --noEmit` (Exit 0)
  4. `npm run prefilter -- src/client/3d/device_profile_context.tsx src/client/game_canvas.tsx src/client/3d/adaptive_dpr_controller.tsx tests/client/imp412_device_profile_context_and_hardware_di.test.ts`
  5. Visual Capture Gate: `node scripts/capture_visual_evidence.mjs --ticket imp-412 --scenario camera_chase_normal`
  6. **Evidence Snapshot Collection (Tier 1.5 Structural Refactor)**:
     `node scripts/collect_evidence.mjs imp-412 tests/client/imp412_device_profile_context_and_hardware_di.test.ts && npm run report -- imp-412 && node scripts/check_evidence.mjs imp-412`
  7. **Regression verification (100% Living Test Parity)**:
     `npx --yes vitest run tests/client/imp412_device_profile_context_and_hardware_di.test.ts tests/client/adaptive_dpr_controller.test.ts tests/client/imp374_ios_webkit_60fps_hardening.test.ts`

---

## 6. Definition of Done (DoD)
- [ ] `src/client/3d/device_profile_context.tsx` created with `<= 80 LOC`, providing pure Context, Zero-DOM Provider, and `useDeviceProfile` hook with backward-compatible fallback.
- [ ] `src/client/game_canvas.tsx` memoizes `deviceProfile` via `useMemo` and wraps R3F scene and DOM container with `<DeviceProfileProvider>`.
- [ ] `src/client/3d/adaptive_dpr_controller.tsx` removes `isIOSPhone()` per-frame sniffer call, consumes `useDeviceProfile()`, and wires `isIOSPhone` to `perfBudget.calculateAdaptiveDpr`.
- [ ] Living test suite `tests/client/imp412_device_profile_context_and_hardware_di.test.ts` passes 100% across 4 atomic tests including Zero-DOM and AST sniffer confinement assertions.
- [ ] 100% regression tests pass in `adaptive_dpr_controller.test.ts` and `imp374_ios_webkit_60fps_hardening.test.ts`.
- [ ] Visual capture `camera_chase_normal` succeeds under `node scripts/capture_visual_evidence.mjs`.
- [ ] `check_evidence.mjs imp-412` exits `0`.
