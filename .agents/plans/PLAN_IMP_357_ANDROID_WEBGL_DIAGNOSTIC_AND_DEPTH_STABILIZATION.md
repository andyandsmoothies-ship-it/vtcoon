# Plan IMP-357: Android WebGL 3D Diagnostic HUD, Float Precision & Depth Buffer Stabilization (Ticket IMP-357)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Committed)**:
  - Commit `a92a324` (IMP-356) shipped hollow diorama perimeter rails, flat dice tray orientation `[0, 0, 0]`, and restored bot cinematic action camera transitions.
- **Auto-Slicing Protocol & Subsystem Boundary**:
  - **Ticket IMP-357 (current)**: Subsystem `client-3d` — Mobile WebGL precision stabilization & live diagnostic isolation:
    1. Reactive `diagnostic_3d_store.ts` for live hardware telemetry (`gpuRenderer`, `depthBits`) and interactive layer toggles with strict `isDebugEnabled` URL gating.
    2. Headless-safe `Diagnostic3DPanel` component mounted in 3D scene (`board_layout.tsx`) projecting DOM overlay via React Portal only upon `?debug=3d`.
    3. Elimination of 16-bit half-float arithmetic instability in `tropical_water.tsx` by enforcing `precision: 'highp'` and exact LCM periodic wave wrapping ($20\pi$).
- **Physical Root Cause Analysis (Android Chrome vs iOS Metal)**:
  1. **16-bit Float Mantissa Cancellation on Android Mobile GPUs**:
     - In `src/client/3d/tropical_water.tsx`: `precision: isMobile ? 'mediump' : 'highp'`.
     - On iPhone (Metal backend), WebKit promotes `mediump` to full 32-bit floats. On Android (Mali/Adreno GPUs via Chrome WebGL2), `mediump` is strictly 16-bit half-float (10-bit mantissa).
     - When `uTime` accumulated up to $200\pi$ (~628), `sin(transformed.x * 0.055 + uTime * 1.4)` lost all fractional precision, causing massive vertex jitter across the $240 \times 240\text{m}$ ocean plane that breached the tabletop every frame (strobing blue/brown/black).
  2. **16-bit Depth Buffer & Frustum Compression**:
     - Android devices allocating 16-bit depth buffers suffer polygon slicing between the Saigon riverbed ($-0.035\text{m}$), sediment ($-0.050\text{m}$), and tabletop ($-0.250\text{m}$), rendering dark triangular clipping voids under elevated viaducts and bridges.
  3. **Empirical Mobile Debugging Blind Spot**:
     - Without remote desktop DevTools, validating GPU-specific defects requires an in-engine diagnostic overlay capable of reading `UNMASKED_RENDERER_WEBGL`, depth buffer precision, and instantly toggling layers ("Cut the Wire" isolation).
- **Adversarial Gate Decisions & Remediation ([PLAN_CHALLENGE_IMP-357.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-357.md))**:
  - ADV-01 (Wave Frequency LCM Periodicity): Use $20\pi$ wrapping (instead of $4\pi$) for `uTime`, which is the exact Least Common Multiple of wave angular speeds ($\omega_1 = 1.4 \to 28\pi$, $\omega_2 = 1.1 \to 22\pi$, $\omega_3 = 1.8 \to 36\pi$), guaranteeing $0.0\text{ rad}$ phase jump on loop reset.
  - ADV-02 (Headless SSR / Canvas Guard): Add safe context extraction `try { useThree() } catch {}` and SSR window guard so `renderToStaticMarkup(React.createElement(GameBoard))` in headless test suites never throws outside Canvas.
  - ADV-03 (Desktop Ocean Layer Stack Preservation): Maintain `TropicalWater` at canonical $Y = -0.300$ (avoiding lowering to $-0.320$ which would invert the layer stack with `[TẦNG 2]` at $-0.310$). Shoreline damping already guarantees zero displacement near board boundaries ($|x| \le 9.6\text{m}$).
  - ADV-04 (Living Test Parity Reconciliation): Update TC-338.04 in `tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts` to expect `highp` precision across all tiers, harmonizing the mobile precision upgrade.
  - ADV-05 (Production UI Leak Prevention): Gate the diagnostic UI behind `isDebugEnabled`. If `?debug=3d` is not in the URL, `Diagnostic3DPanel` returns `null` with 0 DOM footprint for standard players.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-357`
- **Subsystem**: `client-3d` (Tier 1 3D Diagnostic Store & Tier 2 3D Components)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/diagnostic_3d_store.ts` (Tệp mới)
  - **Target physical file**: `src/client/3d/diagnostic_3d_panel.tsx` (Tệp mới)
  - **Target physical file**: `src/client/3d/tropical_water.tsx` (Refactor)
  - **Target physical file**: `src/client/3d/board_layout.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts` (Refactor)
  - **Target physical file**: `tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/3d/coastal_island_environment.tsx`
  - `src/client/3d/miniature_city_diorama.tsx`
  - `src/client/3d/shaders/tropical_water_material.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/diagnostic_3d_store.ts` | Tier 1 (Domain/Server/Logic) | 0 | 62 | +62 | <= 400 | 🆕 Tệp mới |
| `src/client/3d/diagnostic_3d_panel.tsx` | Tier 2 (UI/3D/Views) | 0 | 125 | +125 | <= 500 | 🆕 Tệp mới |
| `src/client/3d/tropical_water.tsx` | Tier 2 (UI/3D/Views) | 107 | 108 | +1 | <= 500 | Safe |
| `src/client/3d/board_layout.tsx` | Tier 2 (UI/3D/Views) | 195 | 207 | +12 | <= 500 | Safe |
| `tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts` | Living Test | 266 | 266 | 0 | <= 600 | Safe |
| `tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts` | Living Test | 0 | 185 | +185 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts`:
  - TC-357.01 [UC-DIAG-VISIBILITY/MSS]: Given URL with debug parameter, When initializing diagnostic store, Then isDebugEnabled state activates appropriately.
  - TC-357.02 [UC-DIAG-TOGGLES/MSS]: Given active diagnostic store, When toggling ocean visibility, Then isOceanVisible inverts state cleanly.
  - TC-357.03 [UC-DIAG-TABLE-TOGGLE/MSS]: Given active diagnostic store, When toggling table visibility, Then isTableVisible inverts state cleanly.
  - TC-357.04 [UC-WATER-HIGHP-PRECISION/MSS]: Given TropicalWater component, When inspecting material configuration, Then precision is strictly highp regardless of mobile device flag.
  - TC-357.05 [UC-WATER-TIME-BOUND/MSS]: Given water animation delta update, When advancing time, Then uTime wraps with modulo 20*PI preserving exact angular phase alignment.
  - TC-357.06 [UC-WATER-TRANSIENT-UNMOUNT/MSS]: Given isOceanVisible set to false, When rendering TropicalWater, Then returns invisible group container upholding R3F Transient Unmount Invariant.
  - TC-357.07 [UC-BOARD-ISOLATION-AFFORDANCE/MSS]: Given GameBoard rendered with isolation toggles, When mounting Diagnostic3DPanel, Then node visibility maps directly to diagnostic store.
  - TC-357.08 [UC-WAVE-CLEARANCE-INVARIANT/MSS]: Given TropicalWater baseline elevation at -0.300 and Chebyshev shore damping radius, When inspecting plinth region, Then wave displacement evaluates strictly to zero at board perimeter.

### Station 2: Implementation (GREEN)

#### Task 1: Reactive Diagnostic Store in `src/client/3d/diagnostic_3d_store.ts`
**Target physical file**: `src/client/3d/diagnostic_3d_store.ts` (Tệp mới)
```typescript
import { create } from 'zustand';

export interface DiagnosticHardwareMetrics {
  readonly gpuRenderer: string;
  readonly depthBits: number;
}

export interface Diagnostic3DState {
  readonly isDebugEnabled: boolean;
  readonly isOpen: boolean;
  readonly isOceanVisible: boolean;
  readonly isTableVisible: boolean;
  readonly isCityVisible: boolean;
  readonly gpuRenderer: string;
  readonly depthBits: number;
  readonly toggleOpen: () => void;
  readonly toggleOcean: () => void;
  readonly toggleTable: () => void;
  readonly toggleCity: () => void;
  readonly setHardwareMetrics: (metrics: DiagnosticHardwareMetrics) => void;
}

function resolveInitialDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('debug') === '3d' || Boolean((window as unknown as { __ENABLE_3D_DEBUG?: boolean }).__ENABLE_3D_DEBUG);
  } catch {
    return false;
  }
}

export const useDiagnostic3DStore = create<Diagnostic3DState>((set) => ({
  isDebugEnabled: resolveInitialDebugEnabled(),
  isOpen: false,
  isOceanVisible: true,
  isTableVisible: true,
  isCityVisible: true,
  gpuRenderer: 'Detecting...',
  depthBits: 24,
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  toggleOcean: () => set((s) => ({ isOceanVisible: !s.isOceanVisible })),
  toggleTable: () => set((s) => ({ isTableVisible: !s.isTableVisible })),
  toggleCity: () => set((s) => ({ isCityVisible: !s.isCityVisible })),
  setHardwareMetrics: (metrics) => set(metrics),
}));
```

#### Task 2: 3D Diagnostic Panel Overlay in `src/client/3d/diagnostic_3d_panel.tsx`
**Target physical file**: `src/client/3d/diagnostic_3d_panel.tsx` (Tệp mới)
```typescript
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useThree } from '@react-three/fiber';
import { useDiagnostic3DStore } from './diagnostic_3d_store';

function Diagnostic3DContent(): React.ReactElement | null {
  const isDebugEnabled = useDiagnostic3DStore((s) => s.isDebugEnabled);
  const isOpen = useDiagnostic3DStore((s) => s.isOpen);
  const isOceanVisible = useDiagnostic3DStore((s) => s.isOceanVisible);
  const isTableVisible = useDiagnostic3DStore((s) => s.isTableVisible);
  const isCityVisible = useDiagnostic3DStore((s) => s.isCityVisible);
  const gpuRenderer = useDiagnostic3DStore((s) => s.gpuRenderer);
  const depthBits = useDiagnostic3DStore((s) => s.depthBits);
  const toggleOcean = useDiagnostic3DStore((s) => s.toggleOcean);
  const toggleTable = useDiagnostic3DStore((s) => s.toggleTable);
  const toggleCity = useDiagnostic3DStore((s) => s.toggleCity);
  const toggleOpen = useDiagnostic3DStore((s) => s.toggleOpen);
  const setHardwareMetrics = useDiagnostic3DStore((s) => s.setHardwareMetrics);

  let glContext = null;
  try {
    const three = useThree();
    glContext = three.gl;
  } catch {
    glContext = null;
  }

  useEffect(() => {
    if (!glContext) return;
    try {
      const ext = glContext.getExtension('WEBGL_debug_renderer_info');
      const renderer = ext ? (glContext.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string) : 'Standard WebGL';
      const bits = (glContext.getParameter(glContext.DEPTH_BITS) as number) ?? 24;
      setHardwareMetrics({ gpuRenderer: renderer || 'Standard GPU', depthBits: bits });
    } catch {
      setHardwareMetrics({ gpuRenderer: 'WebGL Fallback', depthBits: 16 });
    }
  }, [glContext, setHardwareMetrics]);

  if (!isDebugEnabled || typeof document === 'undefined') return null;

  return createPortal(
    React.createElement('div', {
      className: 'fixed top-2 left-2 z-[9999] pointer-events-auto font-mono text-xs select-none'
    },
      !isOpen ? (
        React.createElement('button', {
          onClick: toggleOpen,
          className: 'px-2 py-1 bg-slate-900/80 text-cyan-400 border border-cyan-500/40 rounded shadow backdrop-blur'
        }, '🛠️ 3D DEBUG')
      ) : (
        React.createElement('div', {
          className: 'p-3 bg-slate-950/95 text-slate-200 border border-cyan-500/60 rounded-lg shadow-2xl backdrop-blur max-w-xs space-y-2'
        },
          React.createElement('div', { className: 'flex justify-between items-center border-b border-slate-800 pb-1' },
            React.createElement('span', { className: 'font-bold text-cyan-400' }, '3D DIAGNOSTICS'),
            React.createElement('button', { onClick: toggleOpen, className: 'text-slate-400 hover:text-white px-1' }, '✕')
          ),
          React.createElement('div', { className: 'text-[10px] text-slate-400 space-y-0.5' },
            React.createElement('div', null, `GPU: ${gpuRenderer}`),
            React.createElement('div', null, `Depth: ${depthBits}-bit | Highp: Enforced`)
          ),
          React.createElement('div', { className: 'grid grid-cols-1 gap-1.5 pt-1' },
            React.createElement('button', {
              onClick: toggleOcean,
              className: `px-2 py-1 rounded border text-left flex justify-between ${isOceanVisible ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300' : 'bg-red-950/40 border-red-500/40 text-red-400'}`
            }, React.createElement('span', null, 'Ocean & Waves'), React.createElement('span', null, isOceanVisible ? 'ON' : 'OFF')),
            React.createElement('button', {
              onClick: toggleTable,
              className: `px-2 py-1 rounded border text-left flex justify-between ${isTableVisible ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300' : 'bg-red-950/40 border-red-500/40 text-red-400'}`
            }, React.createElement('span', null, 'Walnut Table'), React.createElement('span', null, isTableVisible ? 'ON' : 'OFF')),
            React.createElement('button', {
              onClick: toggleCity,
              className: `px-2 py-1 rounded border text-left flex justify-between ${isCityVisible ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300' : 'bg-red-950/40 border-red-500/40 text-red-400'}`
            }, React.createElement('span', null, 'City Diorama'), React.createElement('span', null, isCityVisible ? 'ON' : 'OFF'))
          )
        )
      )
    ),
    document.body
  );
}

export function Diagnostic3DPanel(): React.ReactElement | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  return <Diagnostic3DContent />;
}
```

#### Task 3: Enforce High Precision & 20π Wave Modulo in `src/client/3d/tropical_water.tsx`
**Target physical file**: `src/client/3d/tropical_water.tsx` (Refactor)
```typescript
<<<<
  // [C3] ShaderMaterial với precision: 'mediump' trên mobile, 'highp' trên desktop (IMP-338)
  const material = React.useMemo(() => {
    return new ShaderMaterial({
      uniforms,
      vertexShader: TROPICAL_WATER_VERTEX_SHADER.replace('uniform float uTime;', 'uniform highp float uTime;'),
      fragmentShader: TROPICAL_WATER_FRAGMENT_SHADER,
      precision: isMobile ? 'mediump' : 'highp',
      transparent: true,
      depthWrite: false,
    });
  }, [uniforms, isMobile]);

  // [I3] Phân khúc lưới thích ứng: Mobile 24x24 (1.152 tris chuẩn), Desktop 32x32
  const segments = isMobile ? 24 : 32;
  const geometry = React.useMemo(() => new PlaneGeometry(240, 240, segments, segments), [segments]);

  React.useEffect(() => {
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  useSafeFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const lerpRate = 1.0 - Math.exp(-dt * 3.0);

    // Chu kỳ sóng GPU (Modulo 200*PI để bảo toàn độ chính xác số học trên mobile)
    const uTime = uniforms.uTime;
    if (uTime) {
      uTime.value = ((uTime.value as number) + dt) % (Math.PI * 200.0);
    }
====
  // [C3] ShaderMaterial cưỡng chế 'highp' trên mọi nền tảng loại bỏ trôi mantissa 16-bit (IMP-357)
  const material = React.useMemo(() => {
    return new ShaderMaterial({
      uniforms,
      vertexShader: TROPICAL_WATER_VERTEX_SHADER.replace('uniform float uTime;', 'uniform highp float uTime;'),
      fragmentShader: TROPICAL_WATER_FRAGMENT_SHADER,
      precision: 'highp',
      transparent: true,
      depthWrite: false,
    });
  }, [uniforms]);

  // [I3] Phân khúc lưới thích ứng: Mobile 24x24 (1.152 tris chuẩn), Desktop 32x32
  const segments = isMobile ? 24 : 32;
  const geometry = React.useMemo(() => new PlaneGeometry(240, 240, segments, segments), [segments]);

  React.useEffect(() => {
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  useSafeFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const lerpRate = 1.0 - Math.exp(-dt * 3.0);

    // Chu kỳ sóng GPU giới hạn modulo 20*PI (LCM của 1.4, 1.1, 1.8) triệt tiêu poping đỉnh sóng (IMP-357)
    const uTime = uniforms.uTime;
    if (uTime) {
      uTime.value = ((uTime.value as number) + dt) % (Math.PI * 20.0);
    }
>>>>
```

#### Task 4: Connect Diagnostic Toggles & Mount Panel in `src/client/3d/board_layout.tsx`
**Target physical file**: `src/client/3d/board_layout.tsx` (Refactor)
```typescript
<<<<
import {
  createWalnutTabletopTexture,
  createWalnutRoughnessTexture,
} from './tabletop_texture_generator';
import { isMobileHardware } from './device_detect';
====
import {
  createWalnutTabletopTexture,
  createWalnutRoughnessTexture,
} from './tabletop_texture_generator';
import { isMobileHardware } from './device_detect';
import { useDiagnostic3DStore } from './diagnostic_3d_store';
import { Diagnostic3DPanel } from './diagnostic_3d_panel';
>>>>
```
```typescript
<<<<
  const ownerInfoMap = useMemo(() => computeOwnerMap(playersInfo), [playersInfo]);
  const monopolyGroups = useMemo(() => detectPlayerMonopolies(playersInfo), [playersInfo]);
  const walnutDiffuse = useMemo(() => createWalnutTabletopTexture(), []);
  const walnutRoughness = useMemo(() => createWalnutRoughnessTexture(), []);
====
  const isTableVisible = useDiagnostic3DStore((s) => s.isTableVisible);
  const isCityVisible = useDiagnostic3DStore((s) => s.isCityVisible);
  const isOceanVisible = useDiagnostic3DStore((s) => s.isOceanVisible);

  const ownerInfoMap = useMemo(() => computeOwnerMap(playersInfo), [playersInfo]);
  const monopolyGroups = useMemo(() => detectPlayerMonopolies(playersInfo), [playersInfo]);
  const walnutDiffuse = useMemo(() => createWalnutTabletopTexture(), []);
  const walnutRoughness = useMemo(() => createWalnutRoughnessTexture(), []);
>>>>
```
```typescript
<<<<
  return (
    <group position={[0, 0, 0]}>
      {/* Khung Bàn Gỗ Óc Chó Thượng Lưu (Walnut Tabletop) y = -0.350 */}
      <mesh receiveShadow position={[0, WALNUT_TABLE_Y, 0]}>
        <boxGeometry args={[19.2, 0.2, 19.2]} />
        <meshStandardMaterial
          map={walnutDiffuse}
          roughnessMap={walnutRoughness}
          color="#2B1D14"
          roughness={0.28}
          metalness={0.05}
        />
      </mesh>

      {/* 0. Môi trường Bán đảo Đảo Ngọc nhiệt đới (Vịnh biển, bãi cát, đồi núi & mây trời) */}
      {/* <CoastalIslandEnvironment /> */}
      <CoastalIslandEnvironment isMobile={isMobile} />

      {/* 0.1. Điểm nhấn ánh sáng điện ảnh 3D (Hải đăng, Chóp Landmark C3, Sân vận động) */}
      <CinematicLightingAccents />

      {/* 0.2. Hiệu ứng Va Đập Xây Dựng, Sóng Xung Kích & Pháo Hoa Khánh Thành */}
      <ConstructionSlamVFX />

      {/* 2. Sa bàn đô thị thu nhỏ: Đảo tài chính, cầu vượt, sân vận động & bến du thuyền */}
      <MiniatureCityDiorama isMobile={isMobile} />
====
  return (
    <group position={[0, 0, 0]}>
      {/* Khung Bàn Gỗ Óc Chó Thượng Lưu (Walnut Tabletop) y = -0.350 có thể ẩn/hiện để chẩn đoán */}
      <mesh receiveShadow visible={isTableVisible} position={[0, WALNUT_TABLE_Y, 0]}>
        <boxGeometry args={[19.2, 0.2, 19.2]} />
        <meshStandardMaterial
          map={walnutDiffuse}
          roughnessMap={walnutRoughness}
          color="#2B1D14"
          roughness={0.28}
          metalness={0.05}
        />
      </mesh>

      {/* 0. Môi trường Bán đảo Đảo Ngọc nhiệt đới có thể ẩn/hiện để chẩn đoán */}
      <group visible={isOceanVisible}>
        <CoastalIslandEnvironment isMobile={isMobile} />
      </group>

      {/* 0.05. Bảng Điều Khiển Chẩn Đoán 3D (Kích hoạt khi có ?debug=3d) */}
      <Diagnostic3DPanel />

      {/* 0.1. Điểm nhấn ánh sáng điện ảnh 3D (Hải đăng, Chóp Landmark C3, Sân vận động) */}
      <CinematicLightingAccents />

      {/* 0.2. Hiệu ứng Va Đập Xây Dựng, Sóng Xung Kích & Pháo Hoa Khánh Thành */}
      <ConstructionSlamVFX />

      {/* 2. Sa bàn đô thị thu nhỏ có thể ẩn/hiện để chẩn đoán */}
      <group visible={isCityVisible}>
        <MiniatureCityDiorama isMobile={isMobile} />
      </group>
>>>>
```

#### Task 5: Reconcile Living Test Parity in `tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts`
**Target physical file**: `tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts` (Refactor)
```typescript
<<<<
    it('TC-338.04 [UC-WATER/MSS]: Given TropicalWater rendered with isMobile true, When inspecting material properties via captureTree, Then configures precision mediump on ShaderMaterial for FP16 mobile ALU efficiency', () => {
      const tree = captureTree(TropicalWater, { isMobile: true });
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const mat = mesh?.props.material as ShaderMaterial | undefined;
      const geom = mesh?.props.geometry as { parameters?: { widthSegments: number; heightSegments: number } } | undefined;
      expect(mat).toBeDefined();
      expect(mat?.precision).toBe('mediump');
      expect([geom?.parameters?.widthSegments, geom?.parameters?.heightSegments]).toEqual([24, 24]);
    });
====
    it('TC-338.04 [UC-WATER/MSS]: Given TropicalWater rendered with isMobile true, When inspecting material properties via captureTree, Then configures precision highp on ShaderMaterial to prevent Android FP16 vertex jitter', () => {
      const tree = captureTree(TropicalWater, { isMobile: true });
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const mat = mesh?.props.material as ShaderMaterial | undefined;
      const geom = mesh?.props.geometry as { parameters?: { widthSegments: number; heightSegments: number } } | undefined;
      expect(mat).toBeDefined();
      expect(mat?.precision).toBe('highp');
      expect([geom?.parameters?.widthSegments, geom?.parameters?.heightSegments]).toEqual([24, 24]);
    });
>>>>
```

### Station 3: Pre-Filter & Visual Evidence Verification
- Execute mechanical pre-filter:
  `npm run prefilter -- src/client/3d/diagnostic_3d_store.ts src/client/3d/diagnostic_3d_panel.tsx src/client/3d/tropical_water.tsx src/client/3d/board_layout.tsx`
- Run living contract test suite:
  `npx vitest run tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts`
  `npx vitest run tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts`
- Physical visual verification via dual-viewport capture with in-action scenario:
  `node scripts/capture_visual_evidence.mjs --ticket IMP-357 --scenario dice_rolling`
- Audit physical evidence artifacts:
  `node scripts/check_evidence.mjs IMP-357`

### Station 4: Acceptance Criteria
1. `tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts` passes 100% (8/8 contract tests GREEN).
2. Regression test suites across 3D subsystems pass (`urban_density_and_craft.test.ts`, `imp356_android_depth_and_dice_landing.test.ts`, `imp338_ocean_overdraw_and_thermal_pacing.test.ts`).
3. Clean mechanical gates: 0 dirty casts, 0 LOC violations, 0 scope violations.
4. Physical evidence audit `node scripts/check_evidence.mjs IMP-357` exits with code 0.
