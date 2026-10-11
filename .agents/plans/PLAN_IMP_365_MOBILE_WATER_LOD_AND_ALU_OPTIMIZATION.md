# Plan IMP-365: Mobile Water Shader LOD & ALU Optimization (Ticket IMP-365)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Committed / Verified)**:
  - Ticket `IMP-361`: iOS WebGL Performance, clamped Retina DPR ceiling [0.75, 0.82] for `isIOSPhone()`, and high-performance profile.
  - Ticket `IMP-362`: Mobile backdrop-filter purge to eliminate WebKit GPU compositor framebuffer readback stalls.
  - Ticket `IMP-363`: Board tiles merged batching, collapsing 80 static terrain draw calls to <= 3 (-96.25%) to eliminate WebKit IPC message bottleneck.
- **Baseline Working Tree Dependencies (Uncommitted Prior In-Flight Tickets Pending User Commit)**:
  - `IMP-363`: `src/client/3d/batched_board_tiles.tsx`, `src/client/3d/board_layout.tsx`, `src/client/3d/board_tile.tsx`, `tests/client/imp363_batched_board_tiles.test.ts`
  - `IMP-364`: `src/client/3d/shadow_cache_helpers.ts`, `src/client/3d/time_of_day_lighting.tsx`, `src/client/3d/diorama/diorama_railroad.tsx`, `src/client/3d/diorama/diorama_traffic.tsx`, `tests/client/imp364_static_shadow_caching.test.ts`
- **Problem Statement & Physical Root Cause (Boulder 2: Procedural Water Shader)**:
  - `TropicalWater` (`src/client/3d/tropical_water.tsx`) renders a 240x240m ocean plane covering ~70% of the viewport.
  - On iPhone Super Retina screens (~2M pixels at clamped DPR), the ocean fragment shader executes ~84 million times per second at 60 FPS.
  - **Hardened Resolution of Adversarial Findings ([ADV-01] to [ADV-05] + 2 Latent Code Smells)**:
    1. **[ADV-01] Three.js Pass Order & Depth Buffer Discipline**: `TropicalWater` retains `transparent: true` and `depthWrite: false` across all platforms. As proven in `PLAN_CHALLENGE_IMP-365.md`, Three.js renders transparent objects strictly in Pass 2 after all opaque meshes (Pass 1). Setting `depthWrite: true` in Pass 2 would cause Apple TBDR tile serialization stalls and depth-clip the transparent shoreline foam (`waveRef` at $Y=-0.292$) and shallow water box (`shallowRef` at $Y=-0.298$).
    2. **[ADV-02] Radial Depth Euclidean Integrity**: Retain 2D Euclidean radial distance `dist = length(vWorldPosXZ)` in the mobile fragment shader. Calculating `length(xz)` costs only 2 ALU cycles ($1\text{ FMA} + 1\text{ RSQRT}$) on modern mobile GPUs and prevents the severe 535% geometric contour distortion that occurs when interpolating radial gradients across coarse triangle grids.
    3. **[ADV-03] Android FP16 Vertex Stepping Defense**: Retain `precision: 'highp'` on the Three.js `ShaderMaterial` constructor options to guarantee 24-bit mantissa vertex transformations, permanently blocking the Android 16-bit wave jitter bug resolved in IMP-357. Enforce FP16 half-precision execution strictly by declaring `precision mediump float;` inside `TROPICAL_WATER_MOBILE_FRAGMENT_SHADER`.
    4. **[ADV-04] FP16 Overflow Prevention via Vertex-Evaluated Fresnel**: In 16-bit half-precision, calculating `normalize(cameraPosition - vWorldPosition)` for corner vertices ($165\text{m}$) has `dot(v, v) = 56,475`, risking IEEE 754 half-precision overflow ($65,504$) and GPU black/NaN artifacts. We evaluate `vFresnel` in the vertex shader (in `highp`), completely eliding 3D `normalize()`, `pow()`, and `vWorldPosition` varying from the fragment stage.
    5. **[ADV-05] Living Test Parity**: Retaining `precision: 'highp'` on the `ShaderMaterial` instance and keeping `segments = isMobile ? 24 : 32` guarantees 100% compliance with existing living contract tests `TC-357.04` (`imp357_android_webgl_diagnostic_and_depth.test.ts`) and `TC-338.04` (`imp338_ocean_overdraw_and_thermal_pacing.test.ts`).
    6. **[CAVEAT-01] Eliminate Unused Interpolator Varying**: Completely remove `varying vec2 vUv;` and `vUv = uv;` from `TROPICAL_WATER_MOBILE_VERTEX_SHADER`. The mobile fragment shader has zero UV dependencies, freeing up an interpolator register on TBDR tile memory.
    7. **[CAVEAT-02] Eliminate Brittle Runtime String Replacement**: Define `uniform highp float uTime;` directly inside `TROPICAL_WATER_MOBILE_VERTEX_SHADER` template, and bake the replacement inside `getTropicalWaterShaders`. Component `TropicalWater` directly binds `vertexShader: shaderConfig.vertexShader` with zero fragile `.replace()` calls at runtime.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-365`
- **Subsystem**: `client-3d` (Tier 2 3D Presentation & Visual Kinematics)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/shaders/tropical_water_material.ts` (Refactor)
  - **Target physical file**: `src/client/3d/tropical_water.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp365_mobile_water_lod.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/3d/coastal_island_environment.tsx`
  - `tests/client/tropical_water_and_lighting.test.ts`
  - `tests/client/imp355_tropical_water_shore_dampening.test.ts`
  - `tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts`
  - `tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/shaders/tropical_water_material.ts` | Tier 2 (UI/3D/Views) | 132 | 203 | +71 | <= 500 | Safe (< 400 LOC) |
| `src/client/3d/tropical_water.tsx` | Tier 2 (UI/3D/Views) | 114 | 115 | +1 | <= 500 | Safe (< 400 LOC) |
| `tests/client/imp365_mobile_water_lod.test.ts` | Living Test | 0 | 120 | +120 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp365_mobile_water_lod.test.ts`:
  - TC-365.01 [UC-WATER-SHADER-BRANCH/MSS]: Given mobile platform flag isMobile=true, When calling getTropicalWaterShaders, Then returns mobile shader pair with depthWrite false and pre-baked highp uTime.
  - TC-365.02 [UC-WATER-DESKTOP-PARITY/MSS]: Given desktop platform flag isMobile=false, When calling getTropicalWaterShaders, Then returns canonical desktop shaders with depthWrite false.
  - TC-365.03 [UC-VERTEX-EVALUATED-FRESNEL/MSS]: Given TROPICAL_WATER_MOBILE_VERTEX_SHADER, When inspecting shader source, Then verifies vFresnel varying is evaluated per-vertex and unused vUv is completely absent.
  - TC-365.04 [UC-FRAGMENT-ALU-ELISION/MSS]: Given TROPICAL_WATER_MOBILE_FRAGMENT_SHADER, When inspecting shader source, Then verifies specular pow and normalize calls are elided from fragment stage.
  - TC-365.05 [UC-TROPICAL-WATER-MOBILE-PROPS/MSS]: Given TropicalWater rendered with isMobile=true, When inspecting material, Then retains highp constructor precision and binds mobile shaders without runtime string replacement.
  - TC-365.06 [UC-TROPICAL-WATER-DESKTOP-DEFAULT/MSS]: Given TropicalWater rendered with default props, When inspecting markup, Then preserves 32x32 desktop segments and highp material.

### Station 2: Implementation (GREEN)

#### Task 1: Mobile Shaders & Profile Resolver in `src/client/3d/shaders/tropical_water_material.ts`
**Target physical file**: `src/client/3d/shaders/tropical_water_material.ts`
```typescript
<<<<
    // 4. Hòa trộn màu cuối cùng
    vec3 finalColor = mix(baseWaterColor, uSunColor, fresnel * 0.45) + specularColor;
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;
====
    // 4. Hòa trộn màu cuối cùng
    vec3 finalColor = mix(baseWaterColor, uSunColor, fresnel * 0.45) + specularColor;
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

// [UI-S01/MSS][IMP-365] Mobile Water LOD Shaders: Vertex-evaluated Fresnel, 0-unused varyings & FP16 Fast Path
export const TROPICAL_WATER_MOBILE_VERTEX_SHADER = `
  uniform highp float uTime;
  varying vec2 vWorldPosXZ;
  varying float vFresnel;

  void main() {
    vec3 transformed = position;
    
    // Sóng Gerstner nhẹ tại chân bàn cờ
    float w1 = sin(transformed.x * 0.055 + uTime * 1.4) * 0.024;
    float w2 = cos(transformed.y * 0.065 + uTime * 1.1) * 0.018;
    float boxDist = max(abs(transformed.x), abs(transformed.y));
    float shoreDamp = smoothstep(9.6, 12.0, boxDist);
    transformed.z += (w1 + w2) * shoreDamp;

    vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
    vWorldPosXZ = worldPos.xz;

    // [ADV-04] Tính Fresnel góc nhìn ngay trên đỉnh (FP32), tránh overflow FP16 trong fragment
    vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
    float f = clamp(1.0 - max(viewDir.y, 0.0), 0.0, 1.0);
    vFresnel = f * f;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const TROPICAL_WATER_MOBILE_FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec3 uShallowColor;
  uniform vec3 uDeepColor;
  uniform vec3 uSunColor;
  uniform float uOpacity;

  varying vec2 vWorldPosXZ;
  varying float vFresnel;

  void main() {
    // 1. [ADV-02] Độ sâu hấp thụ quang học Euclidean 2D (Chỉ 2 chu kỳ ALU: FMA + RSQRT)
    float dist = length(vWorldPosXZ);
    float depthFactor = clamp((dist - 9.6) * 0.0166667, 0.0, 1.0);
    vec3 baseWaterColor = mix(uShallowColor, uDeepColor, depthFactor);

    // 2. [ADV-04] Phối màu nước phản xạ mặt trời từ vFresnel (Vertex-evaluated, 0 ALU vector normalize)
    vec3 finalColor = mix(baseWaterColor, uSunColor, vFresnel * 0.28);
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

export interface TropicalWaterShaderConfig {
  readonly vertexShader: string;
  readonly fragmentShader: string;
  readonly depthWrite: boolean;
}

export function getTropicalWaterShaders(isMobile: boolean): TropicalWaterShaderConfig {
  if (isMobile) {
    return {
      vertexShader: TROPICAL_WATER_MOBILE_VERTEX_SHADER,
      fragmentShader: TROPICAL_WATER_MOBILE_FRAGMENT_SHADER,
      depthWrite: false,
    };
  }
  return {
    vertexShader: TROPICAL_WATER_VERTEX_SHADER.replace('uniform float uTime;', 'uniform highp float uTime;'),
    fragmentShader: TROPICAL_WATER_FRAGMENT_SHADER,
    depthWrite: false,
  };
}
>>>>
```

#### Task 2: Mobile LOD Integration in `src/client/3d/tropical_water.tsx`
**Target physical file**: `src/client/3d/tropical_water.tsx`
```typescript
<<<<
import {
  createTropicalWaterUniforms,
  TROPICAL_WATER_VERTEX_SHADER,
  TROPICAL_WATER_FRAGMENT_SHADER,
} from './shaders/tropical_water_material';
====
import {
  createTropicalWaterUniforms,
  TROPICAL_WATER_VERTEX_SHADER,
  TROPICAL_WATER_FRAGMENT_SHADER,
  getTropicalWaterShaders,
} from './shaders/tropical_water_material';
>>>>
```

```typescript
<<<<
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
====
  // [C3][IMP-365] Adaptive Mobile Water LOD: Fast Path mobile shaders without runtime string replacement
  const shaderConfig = React.useMemo(() => getTropicalWaterShaders(isMobile), [isMobile]);
  const material = React.useMemo(() => {
    return new ShaderMaterial({
      uniforms,
      vertexShader: shaderConfig.vertexShader,
      fragmentShader: shaderConfig.fragmentShader,
      precision: 'highp', // [ADV-03] Keep highp on material to protect vertex displacement and satisfy TC-357.04
      transparent: true,
      depthWrite: shaderConfig.depthWrite,
    });
  }, [uniforms, shaderConfig]);

  // [I3][IMP-365] Phân khúc lưới: Mobile 24x24 chuẩn (tránh méo mó đa giác ADV-02 và thỏa mãn TC-338.04), Desktop 32x32
  const segments = isMobile ? 24 : 32;
  const geometry = React.useMemo(() => new PlaneGeometry(240, 240, segments, segments), [segments]);
>>>>
```

### Station 3: Pre-Filter & Architecture Review
- Run mechanical fast pre-filter: `npm run prefilter -- src/client/3d/tropical_water.tsx src/client/3d/shaders/tropical_water_material.ts tests/client/imp365_mobile_water_lod.test.ts`.
- Verify LOC budgets:
  - `src/client/3d/shaders/tropical_water_material.ts` <= 500 LOC.
  - `src/client/3d/tropical_water.tsx` <= 500 LOC.
  - `tests/client/imp365_mobile_water_lod.test.ts` <= 600 LOC.
- Zero dirty casts (`as any`, `as unknown as`).
- Seam Discipline: Ensure `tropical_water_and_lighting.test.ts` (IMP-220 contract) passes 100% without modification.

### Station 4: Evidence & Verification
- Execute regression sweep:
  - `npx vitest run tests/client/imp365_mobile_water_lod.test.ts tests/client/tropical_water_and_lighting.test.ts tests/client/imp355_tropical_water_shore_dampening.test.ts tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts`.
- Run automated visual capture for 3D ocean:
  - `npm run capture:visual -- --ticket IMP-365 --scenario default`.
- Run sentinel and immutable evidence audit:
  - `node scripts/collect_evidence.mjs IMP-365`.
  - `node scripts/check_evidence.mjs IMP-365`.

## 4. Definition of Done (DoD) & Stopping Boundary
- **Hard Stopping Boundary (Anti-Churn Invariant)**:
  1. Station 1 (RED): 6 atomic tests in `tests/client/imp365_mobile_water_lod.test.ts` fail strictly due to runtime assertions.
  2. Station 2 (GREEN): Minimal implementation in `tropical_water_material.ts` and `tropical_water.tsx` turns all 6 contract tests GREEN.
  3. Station 3 (Pre-Filter): `npm run prefilter` passes exit code 0; `check_scope.mjs` reports 0 scope creep.
  4. Station 4 (Evidence): Visual capture (`imp-365_desktop.jpg`, `imp-365_mobile_360.jpg`) and `node scripts/check_evidence.mjs IMP-365` pass.
  5. Once all mechanical checks pass and regression tests (`tropical_water_and_lighting.test.ts`) are green, testing and iteration MUST CEASE immediately. Zero speculative refactoring.
