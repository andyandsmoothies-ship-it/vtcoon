# PLAN_IMP_452: iOS WebKit Early-Z Restoration & Thermal Pacing

## 1. Principles Applied
- **[Platform DI Isolation]** -> Canvas GL properties (`logarithmicDepthBuffer`, `antialias`, `precision`) delegated exclusively to `deviceProfile.glProfile` via pure helper `resolveCanvasGlConfig` instead of hardcoded overrides in `game_canvas.tsx`.
- **[Resource Disposal & Cache Hygiene]** -> Restoring `DPR_BOUNDS.IOS_PHONE_MAX = 0.82`, wiring `getRecommendedDpr` to `[0.75, 0.82]` on iOS phones, and setting mobile `glProfile.antialias = false` prevents Apple TBDR Tile SRAM exhaustion and DRAM spill from frame 0.
- **[Spatial AABB / Non-Occlusion]** -> Compressing camera frustum (`near: 2.0`, `far: 140.0`) in `game_canvas.tsx` shrinks the far/near ratio from 600:1 to 70:1, expanding depth buffer precision by > 400% across the board to prevent Z-fighting when `logarithmicDepthBuffer: false`.
- **[View-Model Seam Extraction]** -> Pure helper `resolveCanvasGlConfig` extracted to test WebGL parameters without brittle headless Three.js mocking.
- **[100% DTO & Call-Site Wiring]** -> Wire `glProfile.logarithmicDepthBuffer` directly into `DEFAULT_DEVICE_PROFILE` and `resolveDeviceProfile`.
- **[Dropped Requirements & Anti-Phantom Complexity]** -> Strictly avoid introducing complex runtime dynamic WebGL capability probes; use deterministic profile configuration based on `deviceProfile.isMobile`.

## 2. Target Files & Scope
> **Harness Mutation Scope**: `[HARNESS_MUTATION_AUTHORIZED]` declared for `scripts/sentinel_probes/IMP-452.json` (Chaos Sentinel targeted probe specification).

| Physical File | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/game_canvas.tsx` | Tier 2 (3D/UI) | 254 | 262 | +8 | 500 | Safe |
| `src/client/3d/device_detect.ts` | Tier 1 (Domain/3D) | 75 | 85 | +10 | 400 | Safe |
| `src/client/3d/device_profile_context.tsx` | Tier 2 (3D/UI) | 79 | 82 | +3 | 500 | Safe |
| `src/client/3d/perf_budget.ts` | Tier 1 (Domain/3D) | 326 | 326 | 0 | 400 | Warning |
| `tests/client/imp361_ios_webgl_perf.test.ts` | Living Tests | 140 | 140 | 0 | 600 | Modernized |
| `tests/client/imp374_ios_webkit_60fps_hardening.test.ts` | Living Tests | 125 | 125 | 0 | 600 | Modernized |
| `tests/client/imp412_device_profile_context_and_hardware_di.test.ts` | Living Tests | 195 | 195 | 0 | 600 | Modernized |
| `tests/client/post_processing_pipeline.test.ts` | Living Tests | 91 | 91 | 0 | 600 | Modernized |
| `tests/client/imp452_ios_webkit_early_z_and_thermal_pacing.test.ts` | Living Tests (New) | 0 | 180 | +180 | 600 | Safe |

> [!NOTE] Tech Debt Item
> `perf_budget.ts` has 326 LOC (>= 300 LOC Tier 1 buffer). Edits are zero-delta (modifying 1 constant `DPR_BOUNDS.IOS_PHONE_MAX` from 1.0 to 0.82) to avoid bloating file.

## 3. Physical Surface Area & Root Cause
- **Surface Area**: `src/client/game_canvas.tsx`, `src/client/3d/device_detect.ts`, `src/client/3d/device_profile_context.tsx`, `src/client/3d/perf_budget.ts`.
- **Root Cause**:
  1. **Disrupted Apple GPU Early-Z**: `game_canvas.tsx#L181` hardcodes `logarithmicDepthBuffer: true`, which injects `EXT_frag_depth` shader depth writes and disables hardware Hidden Surface Removal (HSR), producing 730ms frame latency and 8–13 FPS on iOS WebKit.
  2. **Retina Tile SRAM Overflow**: `game_canvas.tsx#L182-L183` hardcodes `antialias: true` and `precision: 'highp'`, and `perf_budget.ts#L58` set `IOS_PHONE_MAX: 1.0` instead of 0.82, causing over 1.3 million samples per frame to spill from TBDR on-chip SRAM into DRAM.
  3. **First-Frame Retina Spike**: `getRecommendedDpr` accepted `isIOSPhoneDevice` but never used it, returning `[0.85, 1.0]` and allowing initial frame 0 mounting at DPR 1.0 on 3x Retina displays before adaptive step-down.
  4. **Frustum Depth Precision Starvation**: In `game_canvas.tsx#L178`, camera `near: 0.5, far: 300` wastes > 90% of depth values in empty space < 5.0m; tuning to `near: 2.0, far: 140.0` restores 400% depth precision to protect co-planar tabletop meshes from Z-fighting when `logarithmicDepthBuffer: false`.

## 4. Explicitly Dropped Requirements (Sean Goedecke Rule)
- ❌ **NO Dynamic WebGL Capability Sniffing**: WebGL extensions and parameters are determined deterministically from `isMobileDevice` via `deviceProfile.glProfile`, avoiding asynchronous WebGL context queries.
- ❌ **NO Hardware 4x MSAA on Mobile**: Mobile GL profile defaults to `antialias: false` (Retina 460 ppi screen density makes hardware MSAA visually imperceptible while saving bandwidth).
- ❌ **NO Highp Fragment Shader Overhead on Mobile**: Mobile defaults to `precision: 'mediump'` to match Apple TBDR ALU register budgets.
- ❌ **NO Camera Kinematic Mutatations in this Ticket**: Mobile camera azimuth and transition pacing are explicitly deferred to cohesive follow-up ticket IMP-453 to strictly respect Auto-Slicing Protocol (<= 3 cohesive units).

## 5. Specification for Modifications & Call-Site Wiring
### 5.1 `src/client/game_canvas.tsx`
- Export pure helper:
  ```tsx
  export function resolveCanvasGlConfig(
    glProfile: CanvasGlProfile,
    isMobile: boolean
  ): WebGLRendererParameters & { toneMapping: ToneMapping; toneMappingExposure: number } {
    return {
      ...glProfile,
      toneMapping: isMobile ? ACESFilmicToneMapping : NoToneMapping,
      toneMappingExposure: 1.08,
    };
  }
  ```
- In `GameCanvas`:
  - Replace hardcoded `gl={{ ... }}` with `useMemo(() => resolveCanvasGlConfig(deviceProfile.glProfile, isMobileDevice), [deviceProfile.glProfile, isMobileDevice])`.
  - Update camera declaration to compressed frustum:
    `camera={{ position: isLobby ? CAMERA_CONFIG.pre_match.position : CAMERA_CONFIG.overview.position, fov: 24, near: 2.0, far: 140.0 }}`.

### 5.2 `src/client/3d/device_detect.ts`
- Enhance `CanvasGlProfile` to include optional `logarithmicDepthBuffer?: boolean`.
- In `getRecommendedGlProfile(isMobile: boolean)`:
  - When `isMobile`: return `{ antialias: false, powerPreference: 'high-performance', precision: 'mediump', logarithmicDepthBuffer: false }`.
  - When `!isMobile`: return `{ antialias: true, powerPreference: 'high-performance', precision: 'highp', logarithmicDepthBuffer: true }`.
- In `getRecommendedDpr(isMobile: boolean, isIOSPhoneDevice = isIOSPhone())`:
  - When `isMobile && isIOSPhoneDevice`: return `[0.75, 0.82]`.
  - When `isMobile && !isIOSPhoneDevice`: return `[0.85, 1.0]`.
  - When `!isMobile`: return `[1.0, 1.5]`.

### 5.3 `src/client/3d/device_profile_context.tsx`
- In `DEFAULT_DEVICE_PROFILE.glProfile`: explicitly set `logarithmicDepthBuffer: true`.

### 5.4 `src/client/3d/perf_budget.ts`
- Restore `DPR_BOUNDS.IOS_PHONE_MAX = 0.82`.

### 5.5 Living Test Modernization Protocol
- In `tests/client/imp374_ios_webkit_60fps_hardening.test.ts#L71`: update expected `IOS_PHONE_MAX` assertion from `1.0` to `0.82`.
- In `tests/client/imp361_ios_webgl_perf.test.ts#L78`: update expected iPhone DPR range from `[0.85, 1.0]` to `[0.75, 0.82]`.
- In `tests/client/imp361_ios_webgl_perf.test.ts#L90`: update expected `glProfileMobile` to `{ antialias: false, powerPreference: 'high-performance', precision: 'mediump', logarithmicDepthBuffer: false }`.
- In `tests/client/imp361_ios_webgl_perf.test.ts#L97-101`: update `glProfileDesktop` to include `logarithmicDepthBuffer: true`.
- In `tests/client/imp412_device_profile_context_and_hardware_di.test.ts#L43-45, L53`: update iPhone DPR to `[0.75, 0.82]`, mobile precision to `'mediump'`, and mobile antialias to `false`.
- In `tests/client/imp412_device_profile_context_and_hardware_di.test.ts#L61`: update `expect(mobileDpr[1] >= iosDpr[1]).toBe(true)`.
- In `tests/client/imp412_device_profile_context_and_hardware_di.test.ts#L135`: update `expect(mockSetDpr).toHaveBeenCalledWith(0.82)`.
- In `tests/client/post_processing_pipeline.test.ts#L67`: update assertion to `expect(canvasSource).toContain('near: 2.0')`.

## 6. Station 1 Test Specifications
- `tests/client/imp452_ios_webkit_early_z_and_thermal_pacing.test.ts`:
  - `[TC-452.01/MSS][UC-GL-EARLY-Z/MSS][Facet-1/Profile]`: Given mobile device environment (isMobile: true), When calling `getRecommendedGlProfile(true)`, Then returns `logarithmicDepthBuffer: false`, `antialias: false`, and `precision: 'mediump'`.
  - `[TC-452.02/MSS][UC-DPR-BOUNDS/MSS][Facet-1/Profile]`: Given iOS phone configuration, When inspecting `DPR_BOUNDS.IOS_PHONE_MAX`, Then value strictly equals `0.82`.
  - `[TC-452.03/MSS][UC-CANVAS-GL-DELEGATION/MSS][Facet-2/Wiring]`: Given pure helper `resolveCanvasGlConfig`, When called with mobile profile, Then preserves `logarithmicDepthBuffer: false` and injects `ACESFilmicToneMapping`.
  - `[TC-452.04/MSS][UC-DESKTOP-GL-PARITY/MSS][Facet-1/Profile]`: Given desktop environment (isMobile: false), When calling `getRecommendedGlProfile(false)`, Then preserves `antialias: true`, `precision: 'highp'`, and `logarithmicDepthBuffer: true`.
  - `[TC-452.05/MSS][UC-FIRST-FRAME-DPR/MSS][Facet-1/Profile]`: Given iOS phone environment, When calling `getRecommendedDpr(true, true)`, Then returns `[0.75, 0.82]`, preventing frame 0 1.0 DPR spike.
  - `[TC-452.06/MSS][UC-FRUSTUM-RATIO-COMPRESSION/MSS][Facet-3/Frustum]`: Given GameCanvas source code, When inspecting camera near and far planes, Then near is 2.0 and far is 140.0, achieving far/near ratio of 70:1 for anti-z-fighting precision.

## 7. Definition of Done (DoD) & Verification
1. 100% passing tests in `tests/client/imp452_ios_webkit_early_z_and_thermal_pacing.test.ts` (6/6 tests).
2. All living test suites pass with 0 regressions (`game_canvas.test.ts`, `perf_budget.test.ts`, `adaptive_dpr_controller.test.ts`, `imp361_ios_webgl_perf.test.ts`, `imp374_ios_webkit_60fps_hardening.test.ts`, `imp412_device_profile_context_and_hardware_di.test.ts`, `post_processing_pipeline.test.ts`).
3. WebKit GL profile conforms: `logarithmicDepthBuffer: false`, `antialias: false`, DPR clamped to 0.82 on iPhone from frame 0.
4. Camera frustum ratio compressed to 70:1 (`near: 2.0, far: 140.0`).
5. Visual verification via `node scripts/capture_visual_evidence.mjs --ticket IMP-452 --scenario camera_chase_normal`.
6. Mechanical prefilter passes with 0 errors (`npm run prefilter`).
7. Evidence audit passes cleanly (`node scripts/check_evidence.mjs IMP-452`).
