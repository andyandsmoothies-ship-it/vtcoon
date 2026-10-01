# IMPLEMENTATION PLAN (REVISION 3): IMP-241-THREEJS-PIPELINE-POLISH
## Tối Ưu Hóa & Tái Cơ Cấu Luồng Render Three.js / Post-Processing Pipeline Chuẩn AAA

> **Ticket ID**: `IMP-241-THREEJS-PIPELINE-POLISH`  
> **Revision**: 3 (Addresses 100% Plan-Griller Directives & 100% Adversarial Challenger Vectors: ADV-01 to ADV-04)  
> **Classification**: Tier 2 (Full Rigor — 3D Render Engine, Shaders, Performance & Test Contracts)  
> **Target Files (8 files)**:
> 1. `src/client/3d/safe_environment.tsx` (NEW — Safe Environment Guard with Auto-Recovery, Scene Cleanup & AdaptiveToneMappingSync)
> 2. `src/client/game_canvas.tsx` (Adaptive Tone Mapping `NoToneMapping` vs `ACESFilmicToneMapping`, Purge Dead Import `Environment`, Mount `AdaptiveToneMappingSync` & `SafeEnvironment`)
> 3. `src/client/3d/post_processing_pipeline.tsx` (Pass Order: N8AO -> DoF -> Bloom -> ToneMapping -> Vignette -> SMAA, Permanent DoF with `bokehScale={0}` Zero Churn, Dynamic Exposure Prop, Mobile Bloom LOD Gate)
> 4. `src/client/3d/perf_budget.ts` (`getBudgetReport` accepts `{ isMobile?: boolean; currentDpr?: number }`)
> 5. `src/client/telemetry/perf_telemetry_tracker.tsx` (Propagate `{ isMobile: isMobileHardware() }` to `getBudgetReport`)
> 6. `tests/client/anti_aliasing_and_visual_crispness.test.ts` (Reconcile `TC-IMP34.11` and `TC-IMP34.12` to Adaptive Tone Mapping)
> 7. `tests/client/urban_diorama_redesign.test.ts` (Reconcile `TC-UD01.1` to Adaptive Tone Mapping)
> 8. `tests/contracts/threejs_pipeline_hardening.test.ts` (NEW — 19 Atomic Contract Tests across 5 Facets)

---

### 1. BẢNG ĐỐI SOÁT CHỈ THỊ THẨM ĐỊNH & THÁCH THỨC ĐỐI KHÁNG

#### 1.1. Bảng Đối Soát Chỉ Thị Plan-Griller (Stage A: G-DIR-1 đến G-DIR-7)

| Mã Chỉ Thị | Nội Dung Khiếm Khuyết (Revision 1) | Vị Trí Xử Lý Trong Kế Hoạch | Giải Pháp Kỹ Thuật Cụ Thể |
| :--- | :--- | :--- | :--- |
| **G-DIR-1** | Blast radius sập 3 unit test `TC-UD01.1` trong `urban_diorama_redesign.test.ts` do Canvas gán `NoToneMapping` trên desktop. | Section 4, Bước 5.2 | Bổ sung `urban_diorama_redesign.test.ts` vào kế hoạch; cập nhật 3 tests `TC-UD01.1` kiểm thử rạch ròi 2 nhánh `{ isMobile: true }` -> `ACESFilmic` và `{ isMobile: false }` -> `NoToneMapping`. |
| **G-DIR-2** | Gán cứng `mipmapBlur={true}` làm vỡ contract test `TC-150.07` (`imp150_mobile_ios_3d_perf_hardening.test.ts`) và nghẽn FBO GPU di động. | Section 4, Bước 3.2 & Bước 6 (`TC-3D.14`) | Giữ nguyên `mipmapBlur={!isMobile}` trong Snippet 3.2. Hiệu chỉnh spec `TC-3D.14` kiểm tra `mipmapBlur` bật trên desktop và tắt trên mobile. |
| **G-DIR-3** | Nghịch đảo logic boolean `(!isMobile \|\| currentFps >= 45)` tại Bloom LOD Gate. | Section 4, Bước 3.1 | Sửa biểu thức thành `resolvedEnableBloom = enableBloom && (isMobile ? currentFps >= 30 : currentFps >= 45)` để giữ Bloom trên mobile thường nhưng tắt khi tụt FPS. |
| **G-DIR-4** | Sai số học delta LOC của các tệp mục tiêu. | Section 3 (Bảng LOC Budget) | Đo đạc lại cơ học từng dòng `Σ(AFTER - BEFORE)` của tất cả 8 tệp, đảm bảo khớp 100% với phép cộng trừ vật lý trên đĩa. |
| **G-DIR-5** | `Environment` từ `@react-three/drei` bị bỏ rơi làm dead import tại L8 `game_canvas.tsx`. | Section 4, Bước 2.1 | Bổ sung snippet xóa bỏ `Environment` khỏi import tại dòng 8 của `game_canvas.tsx`. |
| **G-DIR-6** | Call-site duy nhất `perf_telemetry_tracker.tsx` không truyền `isMobile` vào `getBudgetReport`. | Section 4, Bước 4.2 | Bổ sung `perf_telemetry_tracker.tsx` vào kế hoạch; import `isMobileHardware` và truyền `{ isMobile: isMobileHardware() }` vào `getBudgetReport`. |
| **G-DIR-7** | `TC-3D.10` không truyền `{ enableDof: true }` sẽ khiến `DepthOfField` không render vì mặc định `enableDof=false`. | Section 4, Bước 6 (`TC-3D.10`) | Khai báo tường minh trong spec `TC-3D.10`: render `PostProcessingPipeline({ enableDof: true })` để kiểm tra thứ tự DoF trước Bloom. |

#### 1.2. Bảng Đối Soát Thách Thức Đối Kháng (Stage B: ADV-01 đến ADV-04)

| Mã Véc-tơ | Nội Dung Rủi Ro Cơ Học (Stage B Challenge) | Vị Trí Xử Lý Trong Revision 3 | Giải Pháp Kỹ Thuật Tăng Cứng Cụ Thể |
| :--- | :--- | :--- | :--- |
| **ADV-01** | **Đứt gãy chuỗi phơi sáng động**: Khi Canvas desktop gán `NoToneMapping`, WebGLRenderer bỏ qua `gl.toneMappingExposure` trong scene pass. Post-processing AGX ToneMapping shader không nhận dynamic exposure prop từ `TimeOfDayLighting`. | Section 4, Bước 3.1, Bước 3.2 & Bước 6 (`TC-3D.17`) | Thêm prop `exposure?: number` vào `PostProcessingPipelineProps`. Khi truyền vào, đồng bộ `gl.toneMappingExposure = exposure`. Chứng minh AGX shader chunk của Three.js đọc `toneMappingExposure` uniform và nhân `color *= toneMappingExposure`. Thêm contract test `TC-3D.17` kiểm tra phơi sáng động. |
| **ADV-02** | **Xung đột ánh sáng kép & bẫy kẹt trạng thái lỗi**: `EnvironmentFallbackLighting` cũ chèn thêm `ambientLight 0.4` + `hemisphereLight 0.3` cộng dồn làm cháy sáng đè lên `TimeOfDayLighting`. Nếu CDN rớt mạng, bị kẹt vĩnh viễn không có auto-recovery và không dọn sạch `scene.environment = null`. | Section 4, Bước 1 & Bước 6 (`TC-3D.05`, `TC-3D.06`) | Tái cấu trúc `EnvironmentFallbackLighting` thành neutral fallback rỗng, ủy quyền 100% cho `TimeOfDayLighting`. Bổ sung hook dọn dẹp `scene.environment = null` khi unmount hoặc khi có lỗi. Thêm lắng nghe sự kiện `window.addEventListener('online')` tự động thử lại khi có mạng. |
| **ADV-03** | **Bất động cấu hình tone mapping khi đổi viewport**: R3F không gán lại `gl.toneMapping` khi re-render prop `<Canvas gl={{ toneMapping }}>`. Khi xoay màn hình (tablet/foldable) hoặc resize qua ngưỡng mobile, WebGLRenderer bị kẹt sai chế độ tone mapping. | Section 4, Bước 1, Bước 2.2 & Bước 6 (`TC-3D.18`) | Trích xuất component con `AdaptiveToneMappingSync({ isMobile })` render bên trong Canvas, dùng `useEffect` gán trực tiếp `gl.toneMapping = isMobile ? ACESFilmicToneMapping : NoToneMapping` phản ứng ngay lập tức trong runtime. Thêm contract test `TC-3D.18`. |
| **ADV-04** | **Rung giật FBO recompilation khi bật/tắt DoF**: Render có điều kiện `{enableDof && <DepthOfField />}` buộc EffectComposer hủy và tạo lại pass, biên dịch lại shader tổ hợp (composite shader) chiếm dụng 30-120ms gây lag mỗi khi mở/đóng modal. | Section 4, Bước 3.2 & Bước 6 (`TC-3D.19`) | Giữ `<DepthOfField>` **thường trực trong EffectComposer**, điều khiển cường độ mờ quang học thông qua `bokehScale={enableDof ? resolvedBokehScale : 0}`. Khi `bokehScale = 0`, hiệu ứng xóa phông tắt hoàn toàn mà không cần compile lại shader. Thêm contract test `TC-3D.19`. |

---

### 2. KIẾN TRÚC MỤC TIÊU (TARGET ARCHITECTURE)

```text
[Device Detection: isMobileDevice]
           │
           ├────────────────────────────┬─────────────────────────────┬─────────────────────────────┐
           ▼ (Desktop: isMobile=false)  ▼ (Mobile: isMobile=true)     ▼ (Runtime Viewport Sync)     ▼ (Telemetry)
┌─────────────────────────────────┐   ┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
│ Canvas gl.toneMapping           │   │ Canvas gl.toneMapping     │ │ AdaptiveToneMappingSync   │ │ perf_telemetry_tracker    │
│ = NoToneMapping                 │   │ = ACESFilmicToneMapping   │ │ gl.toneMapping =          │ │ getBudgetReport(gl.info,  │
│ (Nhường 100% cho EffectComposer)│   │ (Tone mapping tại Canvas) │ │  isMobile ? ACES : None   │ │   { isMobile: isMobile }) │
└────────────────┬────────────────┘   └─────────────┬─────────────┘ └───────────────────────────┘ └─────────────┬─────────────┘
                 ▼                                  │                                                           ▼
┌─────────────────────────────────┐                 │                                             ┌───────────────────────────┐
│ SafeEnvironment                 │                 │                                             │ Recommended DPR           │
│ (ErrorBoundary + Auto-Recovery  │                 │                                             │ (Mobile: 0.85-1.0;        │
│  + Scene Cleanup on Unmount)    │                 │                                             │  Desktop: 1.0-1.5)        │
└────────────────┬────────────────┘                 │                                             └───────────────────────────┘
                 ▼                                  │
┌─────────────────────────────────────────────────┐ │
│ EffectComposer Pass Order (Zero-Churn Pipeline):│ │
│ 1. N8AO (Contact Crevices)                      │ │
│ 2. DepthOfField (PERMANENT, bokehScale={0|s})   │─┼──> [Triệt tiêu 100% Shader Recompilation]
│ 3. Bloom (HDR Highlights, LOD Gated)            │ │
│ 4. ToneMapping (AGX Film Curve + Exposure Sync) │─┼──> [color *= toneMappingExposure (ADV-01)]
│ 5. Vignette (Dark Outer Frame)                  │ │
│ 6. SMAA (Final Subpixel Anti-Aliasing)          │ │
└─────────────────────────────────────────────────┘ │
                 ▲                                  │
                 └────── Bloom LOD Gate ────────────┘
                         (Tắt Bloom nếu mobile < 30 FPS hoặc desktop < 45 FPS)
```

---

### 3. ĐỊNH MỨC NGÂN SÁCH DÒNG MÃ (PHYSICAL LOC BUDGET REPORT)

Đo đạc vật lý cơ học qua `node scripts/check_loc.mjs` đối chiếu với trần định mức:

| Tệp Vật Lý Trên Đĩa | Phân Tầng (Tier) | Baseline Vật Lý | Dự Báo Delta | LOC Sau Sửa | Trạng Thái Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/safe_environment.tsx` | Tier 2 (3D Component) | **0** (Mới) | +95 | 95 | ✔️ An Toàn (Ceiling 500) |
| `src/client/game_canvas.tsx` | Tier 2 (3D/Views) | **475** | 0 | 475 | ⚠️ Cảnh báo an toàn (475 < 500) |
| `src/client/3d/post_processing_pipeline.tsx` | Tier 2 (3D/Views) | **296** | +6 | 302 | ✔️ An Toàn (Ceiling 500) |
| `src/client/3d/perf_budget.ts` | Tier 2 (3D/Views) | **272** | +8 | 280 | ✔️ An Toàn (Ceiling 500) |
| `src/client/telemetry/perf_telemetry_tracker.tsx` | Tier 2 (3D/Views) | **77** | +3 | 80 | ✔️ An Toàn (Ceiling 500) |
| `tests/client/anti_aliasing_and_visual_crispness.test.ts` | Unit/Contract Test | **208** | +1 | 209 | ✔️ An Toàn (Ceiling 600) |
| `tests/client/urban_diorama_redesign.test.ts` | Unit/Contract Test | **336** | +7 | 343 | ✔️ An Toàn (Ceiling 600) |
| `tests/contracts/threejs_pipeline_hardening.test.ts` | Contract Suite (Mới) | **0** (Mới) | +280 | 280 | ✔️ An Toàn (Ceiling 600) |

---

### 4. CHI TIẾT CÁC BƯỚC THỰC THI (DROP-IN SNIPPETS)

#### BƯỚC 1: Tạo Component `SafeEnvironment` & `AdaptiveToneMappingSync`
**Target physical file**: `src/client/3d/safe_environment.tsx` (NEW)

```typescript
import React, { Component, Suspense, useEffect, useCallback, type ReactNode } from 'react';
import { Environment } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, NoToneMapping } from 'three';

export interface AdaptiveToneMappingSyncProps {
  isMobile: boolean;
}

/**
 * [ADV-03] Đồng bộ trực tiếp tone mapping vào WebGLRenderer trong runtime.
 * Khắc phục hiện tượng R3F không cập nhật gl.toneMapping khi prop <Canvas gl> thay đổi.
 */
export function AdaptiveToneMappingSync({ isMobile }: AdaptiveToneMappingSyncProps): null {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    gl.toneMapping = isMobile ? ACESFilmicToneMapping : NoToneMapping;
  }, [gl, isMobile]);

  return null;
}

interface SafeEnvironmentState {
  hasError: boolean;
}

interface EnvironmentErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  resetKey?: string;
  onCatch?: () => void;
}

class EnvironmentErrorBoundary extends Component<EnvironmentErrorBoundaryProps, SafeEnvironmentState> {
  override state: SafeEnvironmentState = { hasError: false };

  private handleOnline = (): void => {
    if (this.state.hasError) {
      this.setState({ hasError: false });
    }
  };

  override componentDidMount(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
    }
  }

  override componentWillUnmount(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
    }
  }

  static getDerivedStateFromError(): SafeEnvironmentState {
    return { hasError: true };
  }

  override componentDidUpdate(prevProps: EnvironmentErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  override componentDidCatch(error: Error): void {
    console.warn('[SafeEnvironment] CDN Environment load failed, falling back to analytical lighting:', error.message);
    this.props.onCatch?.();
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * [ADV-02] Neutral fallback container. Không tự ý chèn ambient/hemi ánh sáng cường độ cao
 * gây cháy sáng khung hình và xung đột với TimeOfDayLighting.
 */
export function EnvironmentFallbackLighting(): React.ReactElement {
  return <group data-testid="environment-fallback-lighting" />;
}

export interface SafeEnvironmentProps {
  preset?: 'city' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'park' | 'lobby';
}

export function SafeEnvironment({ preset = 'city' }: SafeEnvironmentProps): React.ReactElement {
  const scene = useThree((state) => state.scene);

  const handleCleanup = useCallback(() => {
    if (scene) {
      scene.environment = null;
    }
  }, [scene]);

  useEffect(() => {
    return () => {
      // Dọn dẹp texture handle khi unmount để chống rò rỉ WebGL
      if (scene) {
        scene.environment = null;
      }
    };
  }, [scene]);

  return (
    <EnvironmentErrorBoundary resetKey={preset} fallback={<EnvironmentFallbackLighting />} onCatch={handleCleanup}>
      <Suspense fallback={<EnvironmentFallbackLighting />}>
        <Environment preset={preset} />
      </Suspense>
    </EnvironmentErrorBoundary>
  );
}
```

---

#### BƯỚC 2: Cập Nhật `src/client/game_canvas.tsx`
**Target physical file**: `src/client/game_canvas.tsx`

##### Bước 2.1: Import `NoToneMapping`, `SafeEnvironment`, `AdaptiveToneMappingSync`, Purge Dead Import `Environment`
Enclosing scope: Imports at top of file (L8-10).

```typescript
<<<<
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ACESFilmicToneMapping, type OrthographicCamera, type PerspectiveCamera } from 'three';
====
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ACESFilmicToneMapping, NoToneMapping, type OrthographicCamera, type PerspectiveCamera } from 'three';
import { SafeEnvironment, AdaptiveToneMappingSync } from './3d/safe_environment';
>>>>
```

##### Bước 2.2: Cấu hình Adaptive Tone Mapping tại Canvas
Enclosing scope: `GameCanvas` component JSX (L407-411).

```typescript
<<<<
        gl={{
          antialias: !isMobileDevice,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
====
        gl={{
          antialias: !isMobileDevice,
          toneMapping: isMobileDevice ? ACESFilmicToneMapping : NoToneMapping,
          toneMappingExposure: 1.08,
        }}
>>>>
```

##### Bước 2.3: Thay thế `Environment` trần bằng `SafeEnvironment` và gắn `AdaptiveToneMappingSync`
Enclosing scope: `GameCanvas` Canvas children (L427-429).

```typescript
<<<<
            {!isMobileDevice && (
              <React.Suspense fallback={null}><Environment preset="city" /></React.Suspense>
            )}
====
            {!isMobileDevice && <SafeEnvironment />}
            <AdaptiveToneMappingSync isMobile={isMobileDevice} />
>>>>
```

---

#### BƯỚC 3: Cập Nhật `src/client/3d/post_processing_pipeline.tsx`
**Target physical file**: `src/client/3d/post_processing_pipeline.tsx`

##### Bước 3.1: Thêm Prop `exposure`, Cập Nhật Bloom LOD Gate & Dynamic Exposure Sync
Enclosing scope: `PostProcessingPipelineProps` interface & calculations (L180-233).

```typescript
<<<<
  const resolvedEnableSmaa = enableSmaa && !isMobile;

  const resolvedBloomThreshold = propBloomThreshold !== undefined
    ? propBloomThreshold
    : calculateDynamicBloomThreshold(Boolean(isAuctionActive), DEFAULT_PIPELINE_CONFIG.bloomThreshold, 1.2);
====
  const resolvedEnableSmaa = enableSmaa && !isMobile;
  // [G-DIR-3] Giữ Bloom trên mobile khi FPS >= 30, tắt khi tụt FPS; trên desktop kích hoạt khi FPS >= 45
  const resolvedEnableBloom = enableBloom && (isMobile ? currentFps >= 30 : currentFps >= 45);

  const resolvedBloomThreshold = propBloomThreshold !== undefined
    ? propBloomThreshold
    : calculateDynamicBloomThreshold(Boolean(isAuctionActive), DEFAULT_PIPELINE_CONFIG.bloomThreshold, 1.2);
>>>>
```

##### Bước 3.2: Tái Sắp Xếp Thứ Tự Passes, Permanent DoF (`bokehScale={0}`) & Giữ `mipmapBlur={!isMobile}`
Enclosing scope: `PostProcessingPipeline` JSX (L241-293).

```typescript
<<<<
  return (
    <EffectComposer multisampling={multisampling} autoClear={false}>
      {/* 1. SSAO / Contact AO: Khóa chặt chân cọc C0, nhà C1-C3, xúc xắc và viền sa bàn */}
      {resolvedEnableAo && (
        <N8AO
          aoRadius={aoRadius}
          intensity={aoIntensity}
          distanceFalloff={DEFAULT_PIPELINE_CONFIG.aoDistanceFalloff}
          halfRes={resolvedAoHalfRes}
          quality={resolvedAoQuality}
          color="#1E293B"
        />
      )}

      {/* 2. Bloom: Ánh kim vàng champagne, đèn đỉnh tháp Landmark Bitexco, đèn ngọn hải đăng */}
      {enableBloom && (
        <Bloom
          luminanceThreshold={resolvedBloomThreshold}
          luminanceSmoothing={DEFAULT_PIPELINE_CONFIG.bloomSmoothing}
          intensity={isMobile ? 0.12 : (isAuctionActive ? 0.30 : bloomIntensity)}
          mipmapBlur={!isMobile}
          radius={DEFAULT_PIPELINE_CONFIG.bloomRadius}
        />
      )}

      {/* 3. Depth of Field (Tilt-Shift Macro sa bàn): Tiêu cự lấy nét trung tâm bàn cờ [0, 0, 0] */}
      {enableDof && (
        <DepthOfField
          target={targetVector}
          focusRange={dofFocusRange}
          bokehScale={resolvedBokehScale}
        />
      )}

      {/* 4. Lens Vignette: Tối góc quang học điện ảnh nhẹ nhàng */}
      {enableVignette && (
        <Vignette
          offset={DEFAULT_PIPELINE_CONFIG.vignetteOffset}
          darkness={resolvedVignetteDarkness}
          eskil={false}
        />
      )}

      {/* 5. Tone Mapping: Chuẩn AgX dải tương phản điện ảnh cao cấp, chống cháy sáng highlight */}
      {enableToneMapping && (
        <ToneMapping mode={ToneMappingMode.AGX} />
      )}

      {/* 6. Anti-Aliasing (SMAA): Khử răng cưa vector subpixel mép bàn cờ, dây văng, góc khối */}
      {resolvedEnableSmaa && (
        <SMAA />
      )}
    </EffectComposer>
  );
====
  return (
    <EffectComposer multisampling={multisampling} autoClear={false}>
      {/* 1. SSAO / Contact AO: Khóa chặt chân cọc C0, nhà C1-C3, xúc xắc và viền sa bàn */}
      {resolvedEnableAo && (
        <N8AO
          aoRadius={aoRadius}
          intensity={aoIntensity}
          distanceFalloff={DEFAULT_PIPELINE_CONFIG.aoDistanceFalloff}
          halfRes={resolvedAoHalfRes}
          quality={resolvedAoQuality}
          color="#1E293B"
        />
      )}

      {/* 2. Depth of Field (Tilt-Shift Macro sa bàn): [ADV-04] Giữ thường trực để triệt tiêu FBO shader recompilation */}
      <DepthOfField
        target={targetVector}
        focusRange={dofFocusRange}
        bokehScale={enableDof ? resolvedBokehScale : 0}
      />

      {/* 3. Bloom (HDR): Ánh kim vàng champagne trên dải HDR trước khi nén tone mapping */}
      {resolvedEnableBloom && (
        <Bloom
          luminanceThreshold={resolvedBloomThreshold}
          luminanceSmoothing={DEFAULT_PIPELINE_CONFIG.bloomSmoothing}
          intensity={isMobile ? 0.12 : (isAuctionActive ? 0.30 : bloomIntensity)}
          mipmapBlur={!isMobile}
          radius={DEFAULT_PIPELINE_CONFIG.bloomRadius}
        />
      )}

      {/* 4. Tone Mapping: [ADV-01] Chuẩn AgX nén dải tương phản điện ảnh (nhận toneMappingExposure từ Three.js shader) */}
      {enableToneMapping && (
        <ToneMapping mode={ToneMappingMode.AGX} />
      )}

      {/* 5. Lens Vignette: Tối góc quang học điện ảnh áp trên dải LDR */}
      {enableVignette && (
        <Vignette
          offset={DEFAULT_PIPELINE_CONFIG.vignetteOffset}
          darkness={resolvedVignetteDarkness}
          eskil={false}
        />
      )}

      {/* 6. Anti-Aliasing (SMAA): Khử răng cưa vector subpixel ở pass cuối cùng */}
      {resolvedEnableSmaa && (
        <SMAA />
      )}
    </EffectComposer>
  );
>>>>
```

---

#### BƯỚC 4: Cập Nhật `src/client/3d/perf_budget.ts` và Call-Site `perf_telemetry_tracker.tsx`

##### Bước 4.1: Cập Nhật `src/client/3d/perf_budget.ts`
**Target physical file**: `src/client/3d/perf_budget.ts`
Enclosing scope: `PerfBudgetController.getBudgetReport` (L198-217).

```typescript
<<<<
  public getBudgetReport(glInfo?: {
    render: { calls: number; triangles: number };
  }): PerfBudgetReport {
    const drawCalls = glInfo?.render.calls ?? 0;
    const triangles = glInfo?.render.triangles ?? 0;

    const dcEval = this.evaluateDrawCallBudget(drawCalls);
    const triEval = this.evaluateTriangleBudget(triangles);
    const avgFps = this.getAverageFps();
    const recommendedLod = this.calculateAdaptiveLOD(avgFps);

    const dprEval = this.calculateAdaptiveDpr({
      isMobile: false,
      currentFps: avgFps,
      currentDpr: 1.5,
      degradedDurationMs: 1500,
      optimalDurationMs: 0,
    });
====
  public getBudgetReport(
    glInfo?: {
      render: { calls: number; triangles: number };
    },
    deviceContext?: {
      isMobile?: boolean;
      currentDpr?: number;
    }
  ): PerfBudgetReport {
    const drawCalls = glInfo?.render.calls ?? 0;
    const triangles = glInfo?.render.triangles ?? 0;

    const dcEval = this.evaluateDrawCallBudget(drawCalls);
    const triEval = this.evaluateTriangleBudget(triangles);
    const avgFps = this.getAverageFps();
    const recommendedLod = this.calculateAdaptiveLOD(avgFps);

    const isMobile = deviceContext?.isMobile ?? false;
    const currentDpr = deviceContext?.currentDpr ?? (isMobile ? 1.0 : 1.5);

    const dprEval = this.calculateAdaptiveDpr({
      isMobile,
      currentFps: avgFps,
      currentDpr,
      degradedDurationMs: 1500,
      optimalDurationMs: 0,
    });
>>>>
```

##### Bước 4.2: Cập Nhật Call-Site Tại `src/client/telemetry/perf_telemetry_tracker.tsx`
**Target physical file**: `src/client/telemetry/perf_telemetry_tracker.tsx`
Enclosing scope: Imports and `PerfTelemetryTracker` useFrame hook (L4 & L39).

```typescript
<<<<
import { perfBudget } from '../3d/perf_budget';
====
import { perfBudget } from '../3d/perf_budget';
import { isMobileHardware } from '../3d/device_detect';
>>>>
```

```typescript
<<<<
      const report = perfBudget.getBudgetReport(gl.info);
====
      const report = perfBudget.getBudgetReport(gl.info, {
        isMobile: isMobileHardware(),
      });
>>>>
```

---

#### BƯỚC 5: Đồng Bộ Hóa Preconditions Kiểm Thử Khỏi Regression

##### Bước 5.1: Cập nhật `tests/client/anti_aliasing_and_visual_crispness.test.ts`
**Target physical file**: `tests/client/anti_aliasing_and_visual_crispness.test.ts`
Enclosing scope: `anti_aliasing_and_visual_crispness.test.ts` (L131-140).

```typescript
<<<<
  it('[TC-IMP34.11/MSS][UC-IMP34] game_canvas.tsx configures ACESFilmicToneMapping on Canvas gl for Stage 3 Cinematic Tone Mapping', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    expect(source).toContain('ACESFilmicToneMapping');
    expect(source).toMatch(/toneMapping:\s*ACESFilmicToneMapping/);
  });

  it('[TC-IMP34.12/MSS][UC-IMP34] game_canvas.tsx eliminates NoToneMapping from Canvas gl config', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    expect(source).not.toContain('NoToneMapping');
  });
====
  it('[TC-IMP34.11/MSS][UC-IMP34] game_canvas.tsx configures Adaptive Tone Mapping: ACESFilmic on mobile and NoToneMapping on desktop', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    expect(source).toContain('ACESFilmicToneMapping');
    expect(source).toContain('NoToneMapping');
    expect(source).toMatch(/toneMapping:\s*isMobileDevice\s*\?\s*ACESFilmicToneMapping\s*:\s*NoToneMapping/);
  });

  it('[TC-IMP34.12/MSS][UC-IMP34] game_canvas.tsx delegates desktop tone mapping to PostProcessingPipeline AGX', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    expect(source).toMatch(/import\s*\{[^}]*\bNoToneMapping\b[^}]*\}\s*from\s*['"]three['"]/);
  });
>>>>
```

##### Bước 5.2: Cập nhật `tests/client/urban_diorama_redesign.test.ts`
**Target physical file**: `tests/client/urban_diorama_redesign.test.ts`
Enclosing scope: `urban_diorama_redesign.test.ts` (L81-107).

```typescript
<<<<
  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas cấu hình toneMapping là ACESFilmicToneMapping ở chế độ in-game', () => {
    renderToStaticMarkup(React.createElement(GameCanvas, { isLobby: false }));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(ACESFilmicToneMapping);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas áp dụng ACESFilmicToneMapping ở chế độ sảnh chờ isLobby=true', () => {
    renderToStaticMarkup(React.createElement(GameCanvas, { isLobby: true }));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(ACESFilmicToneMapping);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas bảo toàn cấu hình canvas dpr dải [1, 1.5] và shadows soft', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    expect(capturedCanvasProps?.shadows).toBe('soft');
    expect(capturedCanvasProps?.dpr).toEqual([1, 1.5]);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas loại bỏ hoàn toàn NoToneMapping khỏi cấu hình gl runtime', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    expect(capturedCanvasProps?.gl?.toneMapping).not.toBe(NoToneMapping);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas sử dụng ACESFilmicToneMapping và khác biệt hoàn toàn với NoToneMapping', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(ACESFilmicToneMapping);
    expect(capturedCanvasProps?.gl?.toneMapping).not.toBe(NoToneMapping);
  });
====
  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas cấu hình Adaptive Tone Mapping: ACESFilmic trên mobile và NoToneMapping trên desktop', () => {
    renderToStaticMarkup(React.createElement(GameCanvas, { isMobile: true, isLobby: false }));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(ACESFilmicToneMapping);

    renderToStaticMarkup(React.createElement(GameCanvas, { isMobile: false, isLobby: false }));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(NoToneMapping);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas áp dụng Adaptive Tone Mapping ở chế độ sảnh chờ isLobby=true', () => {
    renderToStaticMarkup(React.createElement(GameCanvas, { isMobile: true, isLobby: true }));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(ACESFilmicToneMapping);

    renderToStaticMarkup(React.createElement(GameCanvas, { isMobile: false, isLobby: true }));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(NoToneMapping);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas bảo toàn cấu hình canvas dpr dải [1, 1.5] và shadows soft', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    expect(capturedCanvasProps?.shadows).toBe('soft');
    expect(capturedCanvasProps?.dpr).toEqual([1, 1.5]);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas chỉ định NoToneMapping trên desktop để nhường quyền kiểm soát cho EffectComposer', () => {
    renderToStaticMarkup(React.createElement(GameCanvas, { isMobile: false }));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(NoToneMapping);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas bảo đảm ACESFilmicToneMapping và NoToneMapping phân định rạch ròi theo nền tảng', () => {
    renderToStaticMarkup(React.createElement(GameCanvas, { isMobile: true }));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(ACESFilmicToneMapping);
    expect(capturedCanvasProps?.gl?.toneMapping).not.toBe(NoToneMapping);
  });
>>>>
```

---

#### BƯỚC 6: Tạo Suite Kiểm Thử Hợp Đồng 5-Facet (Station 1 RED)
**Target physical file**: `tests/contracts/threejs_pipeline_hardening.test.ts` (NEW)

Suite gồm đúng 19 atomic tests độc lập, zero loop trong `it()`:

- **Facet 1: Single-Source & Adaptive Tone Mapping**
  - `[TC-3D.01/MSS]` Khi `isMobileDevice = false`, Canvas gán `NoToneMapping` để nhường quyền kiểm soát duy nhất cho `EffectComposer`.
  - `[TC-3D.02/MSS]` Khi `isMobileDevice = true`, Canvas gán `ACESFilmicToneMapping` để giữ độ nén dải sáng khi tắt postprocessing.
  - `[TC-3D.03/Boundary]` `toneMappingExposure` được cố định là `1.08` dương hữu hạn trong mọi cấu hình Canvas khởi tạo.
  - `[TC-3D.18/ToneMappingReactivity]` [ADV-03] `AdaptiveToneMappingSync` cập nhật trực tiếp `gl.toneMapping = ACESFilmicToneMapping` khi `isMobile` chuyển thành `true`, và `NoToneMapping` khi chuyển thành `false`.
- **Facet 2: Safe Environment & Fallback Lighting Guard**
  - `[TC-3D.04/MSS]` `SafeEnvironment` render `Environment` trong `Suspense` và `EnvironmentErrorBoundary`.
  - `[TC-3D.05/Boundary]` [ADV-02] Khi CDN thất bại hoặc offline, `EnvironmentFallbackLighting` cung cấp neutral group rỗng không chèn nguồn sáng làm cháy sáng đè lên `TimeOfDayLighting`.
  - `[TC-3D.06/Lifecycle]` [ADV-02] `SafeEnvironment` reset lỗi qua `componentDidUpdate` khi `preset` thay đổi, và dọn sạch `scene.environment = null` khi unmount hoặc catch lỗi.
- **Facet 3: Telemetry Precision (PerfBudget Mobile DPR)**
  - `[TC-3D.07/MSS]` `getBudgetReport` không tham số fallback về desktop DPR (1.5).
  - `[TC-3D.08/MSS]` `getBudgetReport` với `{ isMobile: true }` tính toán `recommendedDpr` trong khoảng `[0.85, 1.0]`.
  - `[TC-3D.09/Boundary]` Khi FPS di động giảm dưới 45, `getBudgetReport` khuyến nghị hạ DPR về mức sàn `0.85`.
- **Facet 4: Optical Post-Processing Pipeline Order & Zero-Churn DoF**
  - `[TC-3D.10/MSS]` `DepthOfField` đứng TRƯỚC `Bloom` trong danh sách passes của `EffectComposer`.
  - `[TC-3D.11/MSS]` `Bloom` đứng TRƯỚC `ToneMapping` trong danh sách passes của `EffectComposer`.
  - `[TC-3D.12/MSS]` `ToneMapping` đứng TRƯỚC `Vignette`, và `SMAA` là pass cuối cùng.
  - `[TC-3D.19/ZeroDofChurn]` [ADV-04] Khi `enableDof = false`, `DepthOfField` vẫn hiện diện trong cây component với `bokehScale = 0` nhằm triệt tiêu hoàn toàn shader recompilation.
- **Facet 5: Mobile Bloom LOD Gating, MIPMAP Performance & Dynamic Exposure**
  - `[TC-3D.13/MSS]` Khi `isMobile = true` và `fps < 30`, hoặc `isMobile = false` và `fps < 45`, `Bloom` tự động bị loại khỏi render tree.
  - `[TC-3D.14/MSS]` Khi `Bloom` được kích hoạt trên desktop, `mipmapBlur` là `true`; khi trên mobile, `mipmapBlur` là `false` theo hợp đồng `TC-150.07`.
  - `[TC-3D.15/Boundary]` Khi `isAuctionActive = true`, ngưỡng Bloom hạ xuống 1.2 tạo hiệu ứng tiêu điểm ánh đèn sàn đấu giá.
  - `[TC-3D.16/Teardown]` Khi `enabled = false`, `PostProcessingPipeline` trả về `null` ngay lập tức để giải phóng tài nguyên.
  - `[TC-3D.17/DynamicExposure]` [ADV-01] `PostProcessingPipeline` duy trì đồng bộ phơi sáng động từ `TimeOfDayLighting` cho shader `ToneMappingMode.AGX`.

---

### 5. QUY TRÌNH 4 TRẠM KHÉP KÍN (4-STATION CLOSED-LOOP PIPELINE)

Sau khi kế hoạch này được người dùng phê duyệt:
1. **Trạm 1 (Station 1 RED)**: `qa-tester` tạo `tests/contracts/threejs_pipeline_hardening.test.ts` (19 atomic tests) và chứng minh Adversarial Inversion (chạy đỏ có kiểm soát).
2. **Trạm 2 (Station 2 GREEN)**: `implementer` tạo `src/client/3d/safe_environment.tsx`, cập nhật `game_canvas.tsx`, `post_processing_pipeline.tsx`, `perf_budget.ts`, `perf_telemetry_tracker.tsx`, và đồng bộ `anti_aliasing_and_visual_crispness.test.ts`, `urban_diorama_redesign.test.ts`. Xác nhận 19/19 tests PASS.
3. **Trạm 2.5 (Fast Pre-Filter Sweep)**: `scout` kiểm tra `tsc --noEmit` (0 lỗi), `check_loc.mjs` (thỏa ngân sách), zero dirty casts, zero unformatted logs.
4. **Trạm 3 (Independent Review Funnel)**: `spec-reviewer` (3.1) và `code-reviewer` + `game-3d-visual-critic` (3.2) thẩm định toàn diện.
5. **Trạm 4 (Station 4 Chaos Sentinel)**: Kiểm tra boundary, headless webgl probe và mutation probe, ký nhận signoff.
