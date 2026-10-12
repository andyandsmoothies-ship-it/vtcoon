# Plan IMP-374: Balanced iOS WebKit Performance Hardening, Thermal Stability & Night Illumination (Ticket IMP-374)

## 0. Context & Architectural Rationale
- **Prior Scope & Physical Telemetry Baseline**:
  - Theo báo cáo giám định pháp y thực địa iPhone Chrome ([`IOS_CHROME_GAMEPLAY_FORENSIC_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/diagnostics/IOS_CHROME_GAMEPLAY_FORENSIC_REPORT.md)) và 7 vòng kiểm thử thực tế trên iPhone (`?debug=3d`):
    - Đợt tắt sa bàn (`City: OFF`) đạt 60 FPS ở vòng 1 nhưng sang vòng 2 tụt xuống 20-34 FPS do quá nhiệt GPU (thermal throttling) và làm bàn cờ bị khoảng trống rỗng màu đen đáy biển; chu kỳ đêm (`#0C1527`) làm tối đen bàn cờ.
    - Sa bàn trung tâm sau IMP-371 chỉ còn 30–45 meshes; việc ẩn sa bàn vi phạm 7 living tests (`TC-371.02`, `TC-371.03`, `TC-265.04..07`, `TC-337.19`).
- **Balanced Solution (3 Levers - Sàn hiệu năng >= 25-30 FPS, 100% Visuals Preserved, Zero Blackout)**:
  1. **Night Illumination Balancing (Anti-Washout)**: Trong `src/client/3d/time_of_day_lighting.tsx`, hạ nhẹ ambient vô hướng xuống mức vừa phải (`ambientIntensity = 0.50`), đồng thời tăng mạnh ánh sáng đỉnh có hướng (`topDownFill = 0.26`), vừa làm sáng rõ mặt số ô cờ vừa giữ bóng đổ vi mô chân thực, loại bỏ hoàn toàn hiện tượng đen kịt và chống bệt màu (flatness).
  2. **Dual-Clamped Mobile DPR Stability**: Trong `src/client/3d/adaptive_dpr_controller.tsx`, xuất khẩu `resolveClampedDpr` kẹp trần 2 tầng (iPhone 0.82, Android 1.0), đấu dây trực tiếp `setDpr(actualDpr)` ngay khung hình khởi tạo để hạ tải 65% GPU Apple TBDR, ngăn chặn hiện tượng rò rỉ DPR 3.0 trên Android và triệt tiêu tụt xung do nhiệt.
  3. **Empty & Non-Landmark Plot Tick Purge**: Trong `src/client/3d/procedural_building.tsx`, thêm early return `shouldBypassPlotFrame` trong `useSafeFrame` cho các ô đất C0-C2 khi không có hiệu ứng slam (micro-hygiene dọn dẹp chu kỳ CPU).

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/time_of_day_lighting.tsx` | Tier 2 (UI/3D/Views) | 405 | 426 | +21 | <= 500 | ⚠️ Warning (Tech debt registered) |
| `src/client/3d/adaptive_dpr_controller.tsx` | Tier 1 (Domain/FSM/Server) | 81 | 97 | +16 | <= 400 | Safe (< 100 LOC) |
| `src/client/3d/procedural_building.tsx` | Tier 2 (UI/3D/Views) | 287 | 292 | +5 | <= 500 | Safe (< 300 LOC) |
| `tests/client/imp374_ios_webkit_60fps_hardening.test.ts` | Living Test | 0 | 180 | +180 | <= 600 | 🆕 Tệp mới |

### Tech Debt Item
- `src/client/3d/time_of_day_lighting.tsx` (426 LOC): Vượt ngưỡng cảnh báo 400 LOC Tier 2. Các hàm thuần túy tính toán ánh sáng (`calculateMobileNightAmbientIntensity`, `calculateTopDownFill`) được quy hoạch tách thành `lighting_helpers.ts` trong đợt refactor cấu trúc tiếp theo.

## 2. In-Action Visual Capture Registration
- Scenario: `camera_chase_cinematic` (`scripts/visual_scenarios/camera_chase_cinematic.js`)
- Viewport: iPhone Chrome / WebKit Mobile (`390x844`)
- Target Assertion: Bàn cờ sáng rõ vào ban đêm (không đen kịt, không bệt màu), sa bàn trung tâm hiển thị 100%, FPS sàn >= 25 FPS ổn định.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Viết bộ kiểm thử hợp đồng độc lập tại `tests/client/imp374_ios_webkit_60fps_hardening.test.ts`:
  - TC-374.01 [UC-NIGHT-AMBIENT-BOOST/MSS]: Given mobile environment and phase night, When calling calculateMobileNightAmbientIntensity, Then returns balanced ambient intensity 0.50.
  - TC-374.02 [UC-NIGHT-TOPDOWN-FILL/MSS]: Given mobile environment and phase night, When calling calculateTopDownFill, Then returns directional top-down fill intensity 0.26 with color #BAE6FD.
  - TC-374.03 [UC-DESKTOP-LIGHTING-UNCHANGED/MSS]: Given desktop environment and phase night, When calling calculateMobileNightAmbientIntensity, Then preserves original baseline intensity without mobile boost.
  - TC-374.04 [UC-DPR-IOS-PHONE-CLAMP/MSS]: Given iOS phone hardware profile, When calling resolveClampedDpr with raw DPR 3.0, Then clamps strictly to DPR_BOUNDS.IOS_PHONE_MAX (0.82).
  - TC-374.05 [UC-DPR-ANDROID-CLAMP/MSS]: Given Android mobile profile without iOS flag, When calling resolveClampedDpr with raw DPR 3.0, Then clamps strictly to DPR_BOUNDS.MOBILE_MAX (1.0).
  - TC-374.06 [UC-PROCEDURAL-EMPTY-PLOT-BYPASS/MSS]: Given plot C0-C2 without active slam and wasSlamming false, When evaluating shouldBypassPlotFrame, Then returns true to bypass per-frame calculations.
  - TC-374.07 [UC-PROCEDURAL-WAS-SLAMMING-RECOVERY/MSS]: Given plot with hasActiveSlam false but wasSlamming true, When evaluating shouldBypassPlotFrame, Then returns false to ensure restoration logic executes cleanly.
  - TC-374.08 [UC-CALLSITE-ADAPTIVE-DPR-WIRE/MSS]: Given AdaptiveDprController mounted on iOS and Android profiles with rawDpr 3.0, When executing frame callback, Then invokes setDpr with clamped bound (0.82 for iOS, 1.0 for Android) proving physical call-site presentation wiring.
  - TC-374.09 [UC-CALLSITE-NIGHT-LIGHTING-WIRE/MSS]: Given TimeOfDayLighting mounted on mobile in night phase, When rendered, Then passes ambient intensity 0.50 and topDown fill 0.26 proving physical lighting wiring.

### Station 2: Implementation (GREEN)

#### Task 1: Bổ sung Night Illumination Balancing trong `src/client/3d/time_of_day_lighting.tsx`
**Target physical file**: `src/client/3d/time_of_day_lighting.tsx`
```typescript
<<<<
export function calculateTopDownFill(phase: 'day' | 'sunset' | 'night', isAuctionActive: boolean): { intensity: number; color: string } {
  switch (phase) {
    case 'day':
      return { intensity: isAuctionActive ? 0.05 : 0.25, color: '#F8FAFC' };
    case 'sunset':
      return { intensity: isAuctionActive ? 0.05 : 0.18, color: '#FEF3C7' };
    case 'night':
      return { intensity: isAuctionActive ? 0.05 : 0.14, color: '#BAE6FD' };
  }
}
====
export function calculateMobileNightAmbientIntensity(
  phase: string,
  isMobile: boolean,
  baseAmbient: number
): number {
  if (isMobile && phase === 'night') {
    return Math.max(baseAmbient, 0.50);
  }
  return baseAmbient;
}

export function calculateTopDownFill(
  phase: 'day' | 'sunset' | 'night',
  isAuctionActive: boolean,
  isMobile: boolean = false
): { intensity: number; color: string } {
  switch (phase) {
    case 'day':
      return { intensity: isAuctionActive ? 0.05 : 0.25, color: '#F8FAFC' };
    case 'sunset':
      return { intensity: isAuctionActive ? 0.05 : 0.18, color: '#FEF3C7' };
    case 'night':
      return { intensity: isAuctionActive ? 0.05 : (isMobile ? 0.26 : 0.14), color: '#BAE6FD' };
  }
}
>>>>
```

```typescript
<<<<
function updateDiffuseAndAtmosphere(
  ambient: AmbientLight | null,
  hemi: HemisphereLight | null,
  scene: (Scene & { environmentIntensity?: number }) | undefined,
  gl: { toneMappingExposure: number } | undefined,
  preset: typeof TIME_OF_DAY_PRESETS['day'],
  phase: 'day' | 'sunset' | 'night',
  isAuctionActive: boolean,
  dt: number,
  lerpRate: number,
  tempColor: Color,
  flashBoost: number = 0,
): void {
  if (gl && typeof gl.toneMappingExposure === 'number') {
    const targetExposure = calculateTargetExposure(phase, isAuctionActive);
    gl.toneMappingExposure = lerpExposure(gl.toneMappingExposure, targetExposure, lerpRate);
  }

  if (ambient) {
    tempColor.set(preset.ambientColor);
    ambient.color.lerp(tempColor, lerpRate);
    ambient.intensity = calculateTheatricalAmbientIntensity(ambient.intensity, isAuctionActive, dt, preset.ambientIntensity, 0.15) + (isAuctionActive ? flashBoost * 0.3 : 0);
  }
====
function updateDiffuseAndAtmosphere(
  ambient: AmbientLight | null,
  hemi: HemisphereLight | null,
  scene: (Scene & { environmentIntensity?: number }) | undefined,
  gl: { toneMappingExposure: number } | undefined,
  preset: typeof TIME_OF_DAY_PRESETS['day'],
  phase: 'day' | 'sunset' | 'night',
  isAuctionActive: boolean,
  dt: number,
  lerpRate: number,
  tempColor: Color,
  flashBoost: number = 0,
  isMobile: boolean = false,
): void {
  if (gl && typeof gl.toneMappingExposure === 'number') {
    const targetExposure = calculateTargetExposure(phase, isAuctionActive);
    gl.toneMappingExposure = lerpExposure(gl.toneMappingExposure, targetExposure, lerpRate);
  }

  if (ambient) {
    tempColor.set(preset.ambientColor);
    ambient.color.lerp(tempColor, lerpRate);
    const targetAmbient = calculateMobileNightAmbientIntensity(phase, isMobile, preset.ambientIntensity);
    ambient.intensity = calculateTheatricalAmbientIntensity(ambient.intensity, isAuctionActive, dt, targetAmbient, 0.15) + (isAuctionActive ? flashBoost * 0.3 : 0);
  }
>>>>
```

```typescript
<<<<
  const initialPreset = useMemo(() => TIME_OF_DAY_PRESETS[useEnvironmentStore.getState().phase], []);
  const initialTopDown = useMemo(() => calculateTopDownFill(useEnvironmentStore.getState().phase, false), []);
====
  const initialPreset = useMemo(() => TIME_OF_DAY_PRESETS[useEnvironmentStore.getState().phase], []);
  const initialAmbientIntensity = useMemo(
    () => calculateMobileNightAmbientIntensity(useEnvironmentStore.getState().phase, isMobile, initialPreset.ambientIntensity),
    [isMobile, initialPreset.ambientIntensity]
  );
  const initialTopDown = useMemo(() => calculateTopDownFill(useEnvironmentStore.getState().phase, false, isMobile), [isMobile]);
>>>>
```

```typescript
<<<<
    if (sunRef.current?.shadow) {
      if (!isShadowsEnabled) {
        sunRef.current.shadow.autoUpdate = false;
      } else {
        const isBuildingDirty = prevLevelMapRef.current !== levelMap;
        prevLevelMapRef.current = levelMap;
        const cacheState = updateLightingShadowCache(sunRef.current, {
          isRolling,
          isPawnMoving,
          isBuildingDirty,
          targetSunPosition: preset.sunPosition,
          lastMotionTimeMs: lastMotionTimeRef.current,
          nowMs: performance.now(),
          gracePeriodMs: 800,
        });
        lastMotionTimeRef.current = cacheState.lastMotionTimeMs;
      }
    }
    updateDiffuseAndAtmosphere(ambientRef.current, hemiRef.current, state.scene, state.gl, preset, phase, isAuctionActive, dt, lerpRate, tempColor, flashBoost);
    if (topDownRef.current) {
      const topDownTarget = calculateTopDownFill(phase, isAuctionActive);
====
    if (sunRef.current?.shadow) {
      if (!isShadowsEnabled || isMobile) {
        sunRef.current.shadow.autoUpdate = false;
      } else {
        const isBuildingDirty = prevLevelMapRef.current !== levelMap;
        prevLevelMapRef.current = levelMap;
        const cacheState = updateLightingShadowCache(sunRef.current, {
          isRolling,
          isPawnMoving,
          isBuildingDirty,
          targetSunPosition: preset.sunPosition,
          lastMotionTimeMs: lastMotionTimeRef.current,
          nowMs: performance.now(),
          gracePeriodMs: 800,
        });
        lastMotionTimeRef.current = cacheState.lastMotionTimeMs;
      }
    }
    updateDiffuseAndAtmosphere(ambientRef.current, hemiRef.current, state.scene, state.gl, preset, phase, isAuctionActive, dt, lerpRate, tempColor, flashBoost, isMobile);
    if (topDownRef.current) {
      const topDownTarget = calculateTopDownFill(phase, isAuctionActive, isMobile);
>>>>
```

```typescript
<<<<
      {/* 3. Ánh sáng tán xạ không gian (Ambient Light) */}
      <ambientLight ref={ambientRef} color={initialPreset.ambientColor} intensity={initialPreset.ambientIntensity} />
====
      {/* 3. Ánh sáng tán xạ không gian (Ambient Light) */}
      <ambientLight ref={ambientRef} color={initialPreset.ambientColor} intensity={initialAmbientIntensity} />
>>>>
```

#### Task 2: Cố định dải DPR iPhone/Android & Wire Canvas Buffer trong `src/client/3d/adaptive_dpr_controller.tsx`
**Target physical file**: `src/client/3d/adaptive_dpr_controller.tsx`
```typescript
<<<<
import { perfBudget, DPR_BOUNDS } from './perf_budget';
import { useTelemetryStore } from '../telemetry/telemetry_store';
====
import { perfBudget, DPR_BOUNDS } from './perf_budget';
import { isIOSPhone } from './device_detect';
// isIOSPhone: helper for iOS phone hardware resolution clamp
import { useTelemetryStore } from '../telemetry/telemetry_store';

export function resolveClampedDpr(rawDpr: number, isMobile: boolean, isIOSPhoneDevice: boolean): number {
  if (!isMobile) return rawDpr;
  const maxBound = isIOSPhoneDevice ? DPR_BOUNDS.IOS_PHONE_MAX : DPR_BOUNDS.MOBILE_MAX;
  return Math.min(rawDpr, maxBound);
}
>>>>
```

```typescript
<<<<
    if (prevForcedLowDprRef.current) {
      prevForcedLowDprRef.current = false;
      currentDprRef.current = null;
      setDpr(isMobile ? DPR_BOUNDS.MOBILE_MAX : 1.0);
    }

    // Đọc chính xác DPR ban đầu từ WebGL Renderer nếu chưa thiết lập
    if (currentDprRef.current === null && gl && typeof gl.getPixelRatio === 'function') {
      const actualDpr = Number(gl.getPixelRatio().toFixed(2));
      currentDprRef.current = actualDpr;
      useTelemetryStore.getState().updateMetrics({ dpr: actualDpr });
    }

    const currentDpr = currentDprRef.current ?? (isMobile ? DPR_BOUNDS.MOBILE_MAX : 1.0);
====
    const isIOSPhoneActive = isIOSPhone();
    const defaultMobileMax = isIOSPhoneActive ? DPR_BOUNDS.IOS_PHONE_MAX : DPR_BOUNDS.MOBILE_MAX;

    if (prevForcedLowDprRef.current) {
      prevForcedLowDprRef.current = false;
      currentDprRef.current = null;
      setDpr(isMobile ? defaultMobileMax : 1.0);
    }

    // Đọc chính xác DPR ban đầu từ WebGL Renderer nếu chưa thiết lập
    if (currentDprRef.current === null && gl && typeof gl.getPixelRatio === 'function') {
      const rawDpr = Number(gl.getPixelRatio().toFixed(2));
      const actualDpr = resolveClampedDpr(rawDpr, isMobile, isIOSPhoneActive);
      if (actualDpr !== rawDpr && typeof setDpr === 'function') {
        setDpr(actualDpr);
      }
      currentDprRef.current = actualDpr;
      useTelemetryStore.getState().updateMetrics({ dpr: actualDpr });
    }

    const currentDpr = currentDprRef.current ?? (isMobile ? defaultMobileMax : 1.0);
>>>>
```

#### Task 3: Bỏ qua tính toán tick ô đất chưa xây dựng & C0-C2 trong `src/client/3d/procedural_building.tsx`
**Target physical file**: `src/client/3d/procedural_building.tsx`
```typescript
<<<<
export interface ProceduralBuildingProps {
  readonly level: 0 | 1 | 2 | 3;
  readonly groupColor?: string;
  readonly cellIndex?: number;
  readonly showEmptyPlotBoundary?: boolean;
}
====
export function shouldBypassPlotFrame(level: number, hasActiveSlam: boolean, wasSlamming: boolean): boolean {
  return level !== 3 && !hasActiveSlam && !wasSlamming;
}

export interface ProceduralBuildingProps {
  readonly level: 0 | 1 | 2 | 3;
  readonly groupColor?: string;
  readonly cellIndex?: number;
  readonly showEmptyPlotBoundary?: boolean;
}
>>>>
```

```typescript
<<<<
  useSafeFrame((_, delta) => {
    if (level === 3 && crownRef.current) {
      crownRef.current.rotation.y += delta * 0.8;
    }
====
  useSafeFrame((_, delta) => {
    if (shouldBypassPlotFrame(level, Boolean(activeSlam), wasSlammingRef.current)) return;
    if (level === 3 && crownRef.current) {
      crownRef.current.rotation.y += delta * 0.8;
    }
>>>>
```

### Station 3: Verification & Visual Evidence
- Fast Pre-Filter: `npm run prefilter -- src/client/3d/time_of_day_lighting.tsx src/client/3d/adaptive_dpr_controller.tsx src/client/3d/procedural_building.tsx`
- In-Action Visual Capture: `npm run capture:visual -- --scenario camera_chase_cinematic`
- Evidence Audit: `node scripts/check_evidence.mjs IMP-374`

## 4. Definition of Done (DoD) & Stopping Boundary
1. Contract suite `tests/client/imp374_ios_webkit_60fps_hardening.test.ts` passes 100% (9 tests).
2. Existing living suites pass without regression (`imp361`, `imp371`, `time_of_day`, `procedural_building`).
3. Pre-filter `npm run prefilter -- <files>` passes 0 errors, 0 dirty casts, LOC within limits.
4. Physical visual check proves board is luminous at night with 100% city diorama intact.
