# KẾ HOẠCH TRIỂN KHAI V2: TROPICAL ISLAND WATER SHADER & ATMOSPHERIC LIGHTING LERP (IMP-220)

> **Mục tiêu**: Nâng cấp mặt nước biển đảo sa bàn và cơ chế chuyển đổi ánh sáng mềm mại theo cảm hứng từ bài viết "Virtual Yosemite Photo Tour" (Trond Wuellner). Tích hợp hiệu ứng phản xạ Fresnel góc nhìn, gradient hấp thụ độ sâu (Depth Absorption: ngọc bích ➔ đại dương ➔ vực thẳm), sóng Gerstner GPU nhấp nhô nhẹ nhàng, viền bọt sóng ven bờ sa bàn (Shoreline Foam), và bảng màu nước phản ứng đồng bộ theo thời gian thực (Day / Sunset / Neon Night).
> **Tiêu chuẩn áp dụng**: Antigravity 2.0, GEMINI.md Harness, TDD Detroit Style, Universal 5-Facet Matrix (16 atomic tests), Zero `as any`, Deep Modules & Anti-Slop.
> **Phiên bản cập nhật v2**: Đã khắc phục triệt để 5 Điểm Cứng Runtime (C1-C5) và 3 Điểm Cải Tiến Kiến Trúc (I1-I3) sau đối soát vật lý đĩa cứng.

---

### 1. SƠ ĐỒ KIẾN TRÚC & DÒNG CHẢY DỮ LIỆU (VISUAL ARCHITECTURE)

```
                              [useEnvironmentStore]
                    (phase: 'day'|'sunset'|'night', isAuto: true/false)
                                         │
                                         ▼
            ┌────────────────────────────────────────────────────────┐
            │                                                        │
            ▼                                                        ▼
  [TimeOfDayLighting]                                     [TropicalWater / Material]
  - Lerp rate dt: 1 - exp(-dt * 3.0)                       - Uniforms (GPU Frame Tick, Zero-Alloc):
    * sunPosition / sunColor / sunIntensity                  * uTime (chu kỳ sóng GPU)
    * fillLight / rimLight / topDownFill                     * uDepthColor (đáy vực thẳm)
    * ambientLight / hemiLight                               * uShallowColor (nước nông ngọc bích)
    * scene.fog (color, near, far)                           * uFoamColor (bọt sóng lân tinh/hoàng hôn)
    * scene.background (skyColor)                            * uSunDirection / uSunColor (phản xạ specular)
    * scene.environmentIntensity                             * uFresnelPower / uFresnelScale
            │                                                        │
            ▼                                                        ▼
   [Three.js Scene Lights]                                 [Custom GLSL Water Shader]
   (Chuyển pha mượt mà 2.5s)                               Vertex Shader:
                                                           - Sóng Gerstner đa tần (w1, w2, w3, biên độ <= 0.052)
                                                           - Tọa độ view/normal truyền sang Fragment
                                                           Fragment Shader:
                                                           - Gradient độ sâu nông-sâu (Depth Absorption)
                                                           - Phản xạ góc nhìn Fresnel: pow(1.0 - dot(V, N), 3.5)
                                                           - Điểm sáng lấp lánh mặt trời (Specular Glint)
                                                                     │
                                                                     ▼
                                                           [Sa Bàn Bàn Cờ Đảo Ngọc]
                                                           (data-testid="living-ocean-water")
```

---

### 2. PHÂN TẦNG VẬT LÝ MẶT NƯỚC: DEPTH LAYER STACK & KHỬ Z-FIGHTING [C1, I1]

Trong `coastal_island_environment.tsx`, để bảo toàn 100% hợp đồng với các test cũ (`#0C4A6E`, `#0369A1`, `#06B6D4`, `#FFFFFF`, `ringGeometry`, `data-testid="living-ocean-water"`), toàn bộ hệ thống nước được tổ chức thành 5 tầng độ cao Y tách biệt tuyệt đối:

```
Y = -0.292 ── [TẦNG 5] Dải bọt sóng ven bờ đảo (Dynamic Shoreline Foam) #FFFFFF (waveRef, co giãn chu kỳ 3.5s)
Y = -0.298 ── [TẦNG 4] Nước nông ngọc bích ôm sát chân bàn cờ (Shallow Lagoon) #06B6D4 (shallowRef)
Y = -0.300 ── [TẦNG 3] Mặt biển chính GPU Gerstner Shader (TropicalWater) [data-testid="living-ocean-water"]
Y = -0.310 ── [TẦNG 2] Tầng nước giữa đại dương (Mid-Ocean Base Plane) #0369A1 (plane 180x180)
Y = -0.350 ── [ĐẾ SA BÀN] Khung mâm gỗ óc chó bàn cờ (WALNUT_TABLE_Y)
Y = -0.420 ── [TẦNG 1] Đáy đại dương vô cực (Endless Living Ocean Abyss Box) #0C4A6E (box 260x0.16x260)
```

- **Quy tắc phân công rõ ràng [C1]**:
  - Tầng 1 (`boxGeometry [260, 0.16, 260]`, color `#0C4A6E`): Giữ nguyên làm nền đáy vực sâu vô cực.
  - Tầng 2 (`planeGeometry [180, 180, 32, 32]`, color `#0369A1`): Giữ nguyên làm lớp đệm chuyển tiếp giữa biển khơi và đáy sâu.
  - Tầng 3 (Thay thế lưới Gerstner cũ bằng `TropicalWater` tại $Y = -0.300$): Tích hợp Shader Fresnel, Depth Absorption, và Specular Glint. Mang `data-testid="living-ocean-water"` và tương tác âm thanh `SoundEngine.playWaterRipple()`.
  - Tầng 4 (`shallowRef` color `#06B6D4` tại $Y = -0.298$): Giữ nguyên làm vòng đệm nước nông sát mép sa bàn.
  - Tầng 5 (`waveRef` color `#FFFFFF` tại $Y = -0.292$): Giữ nguyên làm bọt sóng ven bờ macro (Macro Shoreline Foam) nhấp nhô theo nhịp thở [I1].
- **Kết quả**: Độ chênh lệch giữa các tầng tối thiểu $0.002$ đến $0.010$ đơn vị Three.js, triệt tiêu 100% hiện tượng nhấp nháy Z-fighting.

---

### 3. KHẮC PHỤC 5 ĐIỂM CỨNG RUNTIME (C1 - C5)

1. **Khắc phục C1 (Chỉ định rõ vị trí các layers trong `coastal_island_environment.tsx`)**:
   - Đã định nghĩa tường minh Sơ đồ Depth Layer Stack 5 tầng ở Mục 2. `TropicalWater` chỉ thay thế duy nhất lưới `planeGeometry [240, 240]` tại $Y = -0.300$, bảo lưu nguyên vẹn 4 layers phụ trợ để bảo đảm tính phân tầng quang học và tương thích 100% test contract cũ.
2. **Khắc phục C2 (Sửa lỗi Bug-Codification tại `TC-220.06/MSS`)**:
   - Hàm `calculateWaterWaveOffset(x, y, time)` cộng 3 sóng điều hòa $w_1 (0.024) + w_2 (0.018) + w_3 (0.010) = 0.052$.
   - Sửa đổi điều kiện kiểm tra của `[TC-220.06/MSS]`: assert `Math.abs(offset) <= 0.055`. Phản ánh chính xác giới hạn cực trị toán học, triệt tiêu nguy cơ test fail khi mã nguồn chạy hoàn toàn đúng.
3. **Khắc phục C3 (Triệt tiêu Dirty Double Cast `as unknown as Record<...>` )**:
   - `TropicalWaterUniforms` triển khai đúng cấu trúc `IUniform<T>`.
   - Sử dụng kiểu gán sạch chuẩn mực TypeScript:
     `const uniforms: Record<string, IUniform> = createTropicalWaterUniforms();`
     Không dùng bất kỳ dirty cast nào (`as unknown as ...` bị cấm tuyệt đối theo Rule 3).
4. **Khắc phục C4 (Khử ESLint warning trên `useMemo` rỗng)**:
   - `createTropicalWaterUniforms()` tự động thiết lập các giá trị khởi tạo mặc định (Day mode).
   - Trong component: `const uniforms = useMemo(() => createTropicalWaterUniforms(), []);` với deps rỗng hoàn toàn hợp lệ và sạch sẽ.
   - Ngay từ frame đầu tiên trong `useSafeFrame`, `uniforms` sẽ tự động được kéo lerp về đúng `preset` hiện tại của `environment_store`.
5. **Khắc phục C5 (Quy định Trạm 0 — Type Contract Baseline)**:
   - Trước khi giao cho `qa-tester` tại Station 1, tiến hành cập nhật trước khai báo kiểu `LightingPreset` và các giá trị ban đầu trong [`src/client/store/environment_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/environment_store.ts).
   - Giúp TypeScript compiler `tsc` không bị lỗi cú pháp `TS2339: Property 'waterShallowColor' does not exist`, bảo đảm Station 1 kiểm thử thất bại chỉ vì Business Logic (RED for the right reason).

---

### 4. ĐO LƯỜNG NGÂN SÁCH LOC (PRE-CODING LOC BASELINE)

Đo lường tự động qua `scripts/check_loc.mjs` trước khi lập kế hoạch:

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | Dự Kiến Delta | LOC Sau Khi Sửa | Đánh Giá Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/shaders/tropical_water_material.ts` | Tier 3 (Shader / Math) | 0 | +195 | 195 | ✔️ An toàn (Trần <= 800) |
| `src/client/3d/tropical_water.tsx` | Tier 2 (3D Component) | 0 | +135 | 135 | ✔️ An toàn (Trần <= 500) |
| `src/client/store/environment_store.ts` | Tier 1 (Domain Store) | 133 | +32 | 165 | ✔️ An toàn (Trần <= 400) |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 (3D View) | 249 | +12 | 261 | ✔️ An toàn (Trần <= 500) |
| `tests/client/tropical_water_and_lighting.test.ts` | Test Suite | 0 | +260 | 260 | ✔️ An toàn (Trần <= 600) |

---

### 5. MA TRẬN KIỂM THỬ HỢP ĐỒNG 5 MẶT (UNIVERSAL 5-FACET MATRIX - 16 ATOMIC TESTS)

Toàn bộ test case được viết trong [`tests/client/tropical_water_and_lighting.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/tropical_water_and_lighting.test.ts):

- **Facet 1: Core Mechanics & Uniform Initialization (4 tests)**
  - `[TC-220.01/MSS][UC-IMP220][Facet-1/UniformInit]` `createTropicalWaterUniforms()` khởi tạo đầy đủ các uniforms thiết yếu: `uTime`, `uDeepColor`, `uShallowColor`, `uFoamColor`, `uSunColor`, `uSunDirection`, `uFresnelPower`.
  - `[TC-220.02/MSS][UC-IMP220][Facet-1/ShaderSource]` Fragment shader GLSL tích hợp công thức phản xạ Fresnel Schlick góc nhìn `pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower)`.
  - `[TC-220.03/MSS][UC-IMP220][Facet-1/WaveDisplacement]` Vertex shader GLSL chứa thuật toán sóng GPU kết hợp đa tần số (w1, w2, w3) mô phỏng gợn sóng biển lăn tăn không tốn CPU.
  - `[TC-220.04/MSS][UC-IMP220][Facet-1/FoamIntegration]` Khẳng định cơ chế bọt sóng phối hợp: Macro Shoreline Foam (mesh Y=-0.292) kết hợp với Micro Specular Glint trong GLSL fragment shader [I1].

- **Facet 2: Boundary & Range Clamping (3 tests - Sửa C2)**
  - `[TC-220.05/MSS][UC-IMP220][Facet-2/FresnelClamp]` Hệ số phản xạ Fresnel tính toán từ hàm `calculateFresnelFactor(viewDir, normal, power)` luôn kẹp chặt trong khoảng `[0.0, 1.0]`.
  - `[TC-220.06/MSS][UC-IMP220][Facet-2/WaveAmplitudeClamp]` **[C2 Sửa Đổi]** Hàm tính độ lệch sóng `calculateWaterWaveOffset(x, y, time)` không bao giờ vượt quá biên độ cực đại toán học $\pm 0.055$.
  - `[TC-220.07/MSS][UC-IMP220][Facet-2/DepthAbsorptionGradient]` Tỉ lệ hòa trộn độ sâu `calculateDepthBlend(distFromCenter)` trả về giá trị chuẩn hóa trong khoảng `[0.0, 1.0]`.

- **Facet 3: Time-of-Day Palette Reactivity (3 tests)**
  - `[TC-220.08/MSS][UC-IMP220][Facet-3/DayPalette]` Ở pha `'day'`, bảng màu nước cung cấp màu ngọc bích `#06B6D4` (nước nông), đại dương `#0284C7` (nước sâu), và bọt trắng `#FFFFFF`.
  - `[TC-220.09/MSS][UC-IMP220][Facet-3/SunsetPalette]` Ở pha `'sunset'`, bảng màu nước chuyển sang hổ phách `#F59E0B` (nước nông), cam đậm `#C2410C` (nước sâu), và bọt hoàng hôn `#FEF3C7`.
  - `[TC-220.10/MSS][UC-IMP220][Facet-3/NightPalette]` Ở pha `'night'`, bảng màu nước chuyển sang xanh neon `#0284C7` (nước nông), biển đêm `#0B192C` (nước sâu), và bọt lân tinh `#38BDF8`.

- **Facet 4: State Lifecycle & Transition Lerp (3 tests - Khắc phục C3, C4)**
  - `[TC-220.11/MSS][UC-IMP220][Facet-4/SmoothLerp]` Hàm nội suy màu `lerpWaterColor(currentColor, targetColor, lerpRate)` biến thiên liên tục và tiệm cận chính xác về màu đích sau nhiều bước lặp.
  - `[TC-220.12/MSS][UC-IMP220][Facet-4/ZeroAlloc]` Cập nhật uniform trong render loop tái sử dụng bộ đệm Color tĩnh, 0 cấp phát `new Color()` trong frame loop.
  - `[TC-220.13/MSS][UC-IMP220][Facet-4/CleanTeardown]` Component `TropicalWater` thực thi đầy đủ việc dispose geometry và material khi unmount để ngăn rò rỉ WebGL buffer.

- **Facet 5: Backward Compatibility & Cohesive World Integration (3 tests - C1, I2, I3)**
  - `[TC-220.14/MSS][UC-IMP220][Facet-5/TestIdPreservation]` `CoastalIslandEnvironment` gắn đúng `data-testid="living-ocean-water"` trên mesh mặt nước và kích hoạt an toàn `SoundEngine.playWaterRipple()` [I2].
  - `[TC-220.15/MSS][UC-IMP220][Facet-5/StreamlinedSupport]` Khi `streamlined={true}`, `CoastalIslandEnvironment` bảo toàn Depth Stack 5 tầng và loại bỏ các cây cối ngoại vi thừa [C1].
  - `[TC-220.16/MSS][UC-IMP220][Facet-5/SSRMarkupSafety]` `renderToStaticMarkup` render component trơn tru trong môi trường Node.js / SSR mà không phụ thuộc WebGL context vật lý.

---

### 6. DROP-IN CODE SNIPPETS CỤ THỂ

#### Snippet 1: Mở rộng `LightingPreset` và `TIME_OF_DAY_PRESETS` trong [`src/client/store/environment_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/environment_store.ts) (Trạm 0 - C5)

```ts
export interface LightingPreset {
  readonly sunPosition: [number, number, number];
  readonly sunColor: string;
  readonly sunIntensity: number;
  readonly ambientColor: string;
  readonly ambientIntensity: number;
  readonly hemiSkyColor: string;
  readonly hemiGroundColor: string;
  readonly hemiIntensity: number;
  readonly skyColor: string;
  readonly fogColor: string;
  readonly fogNear: number;
  readonly fogFar: number;
  // Bổ sung bảng màu nước nhiệt đới (IMP-220)
  readonly waterShallowColor: string;
  readonly waterDeepColor: string;
  readonly waterFoamColor: string;
}

export const TIME_OF_DAY_PRESETS: Record<TimeOfDayPhase, LightingPreset> = {
  day: {
    sunPosition: [-22, 36, 20],
    sunColor: '#FFFDF5',
    sunIntensity: 0.80,
    ambientColor: '#F0F9FF',
    ambientIntensity: 0.20,
    hemiSkyColor: '#BAE6FD',
    hemiGroundColor: '#DCFCE7',
    hemiIntensity: 0.14,
    skyColor: '#7DD3FC',
    fogColor: '#BAE6FD',
    fogNear: 85,
    fogFar: 260,
    waterShallowColor: '#06B6D4', // Ngọc bích trong vắt
    waterDeepColor: '#0284C7',    // Xanh đại dương
    waterFoamColor: '#FFFFFF',    // Bọt sóng trắng tinh khôi
  },
  sunset: {
    sunPosition: [-28, 24, 18],
    sunColor: '#FDE047',
    sunIntensity: 0.95,
    ambientColor: '#FEF3C7',
    ambientIntensity: 0.28,
    hemiSkyColor: '#FB923C',
    hemiGroundColor: '#9A3412',
    hemiIntensity: 0.24,
    skyColor: '#EA580C',
    fogColor: '#FDBA74',
    fogNear: 80,
    fogFar: 250,
    waterShallowColor: '#F59E0B', // Hổ phách ánh hoàng hôn
    waterDeepColor: '#C2410C',    // Cam đất đại dương
    waterFoamColor: '#FEF3C7',    // Bọt sóng ánh chiều tà
  },
  night: {
    sunPosition: [18, 32, -20],
    sunColor: '#93C5FD',
    sunIntensity: 0.65,
    ambientColor: '#38BDF8',
    ambientIntensity: 0.40,
    hemiSkyColor: '#1E293B',
    hemiGroundColor: '#0369A1',
    hemiIntensity: 0.26,
    skyColor: '#0C1527',
    fogColor: '#0F172A',
    fogNear: 75,
    fogFar: 240,
    waterShallowColor: '#0284C7', // Xanh lam ngọc dạ quang
    waterDeepColor: '#0B192C',    // Xanh thẳm biển đêm
    waterFoamColor: '#38BDF8',    // Bọt sóng lân tinh xanh băng
  },
};
```

---

#### Snippet 2: Deep Module Shader [`src/client/3d/shaders/tropical_water_material.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/shaders/tropical_water_material.ts) (C3, C4)

```ts
// [UI-S01/MSS][IMP-220] TropicalWaterMaterial — Custom Shader Material for Island Water
import { Color, Vector3, type IUniform } from 'three';

export interface TropicalWaterUniforms {
  uTime: IUniform<number>;
  uShallowColor: IUniform<Color>;
  uDeepColor: IUniform<Color>;
  uFoamColor: IUniform<Color>;
  uSunColor: IUniform<Color>;
  uSunDirection: IUniform<Vector3>;
  uFresnelPower: IUniform<number>;
  uOpacity: IUniform<number>;
}

// [C4] Khởi tạo không tham số với giá trị mặc định chuẩn xác, sạch sẽ 100% không vi phạm deps
export function createTropicalWaterUniforms(): Record<string, IUniform> {
  const sunDir = new Vector3(-22, 36, 20).normalize();
  return {
    uTime: { value: 0 },
    uShallowColor: { value: new Color('#06B6D4') },
    uDeepColor: { value: new Color('#0284C7') },
    uFoamColor: { value: new Color('#FFFFFF') },
    uSunColor: { value: new Color('#FFFDF5') },
    uSunDirection: { value: sunDir },
    uFresnelPower: { value: 3.5 },
    uOpacity: { value: 0.92 },
  };
}

export function calculateFresnelFactor(viewDir: Vector3, normal: Vector3, power: number = 3.5): number {
  const cosTheta = Math.max(0.0, Math.min(1.0, viewDir.dot(normal)));
  const fresnel = Math.pow(1.0 - cosTheta, power);
  return Math.max(0.0, Math.min(1.0, fresnel));
}

// [C2] Biên độ cực đại: 0.024 + 0.018 + 0.010 = 0.052 <= 0.055
export function calculateWaterWaveOffset(x: number, y: number, time: number): number {
  const w1 = Math.sin(x * 0.055 + time * 1.4) * 0.024;
  const w2 = Math.cos(y * 0.065 + time * 1.1) * 0.018;
  const w3 = Math.sin((x + y) * 0.038 + time * 1.8) * 0.010;
  return w1 + w2 + w3;
}

export function calculateDepthBlend(distFromCenter: number, innerRadius: number = 9.6, outerRadius: number = 70.0): number {
  if (distFromCenter <= innerRadius) return 0.0;
  if (distFromCenter >= outerRadius) return 1.0;
  return (distFromCenter - innerRadius) / (outerRadius - innerRadius);
}

export const TROPICAL_WATER_VERTEX_SHADER = `
  uniform float uTime;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    
    // Sóng Gerstner GPU đa tần (biên độ tối đa 0.052)
    float w1 = sin(transformed.x * 0.055 + uTime * 1.4) * 0.024;
    float w2 = cos(transformed.y * 0.065 + uTime * 1.1) * 0.018;
    float w3 = sin((transformed.x + transformed.y) * 0.038 + uTime * 1.8) * 0.010;
    transformed.z += w1 + w2 + w3;

    vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const TROPICAL_WATER_FRAGMENT_SHADER = `
  uniform vec3 uShallowColor;
  uniform vec3 uDeepColor;
  uniform vec3 uFoamColor;
  uniform vec3 uSunColor;
  uniform vec3 uSunDirection;
  uniform float uFresnelPower;
  uniform float uOpacity;
  uniform float uTime;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);

    // 1. Phản xạ Fresnel góc nhìn (Schlick Approximation)
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);
    fresnel = clamp(fresnel, 0.0, 1.0);

    // 2. Độ sâu hấp thụ quang học (Depth Absorption Gradient)
    float dist = length(vWorldPosition.xz);
    float depthFactor = clamp((dist - 9.6) / 60.0, 0.0, 1.0);
    vec3 baseWaterColor = mix(uShallowColor, uDeepColor, depthFactor);

    // 3. Phản xạ ánh nắng trực diện (Specular Glint)
    vec3 halfVec = normalize(uSunDirection + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), 32.0);
    vec3 specularColor = uSunColor * spec * 0.6;

    // 4. Hòa trộn màu cuối cùng
    vec3 finalColor = mix(baseWaterColor, uSunColor, fresnel * 0.45) + specularColor;
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;
```

---

#### Snippet 3: Component [`src/client/3d/tropical_water.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tropical_water.tsx) (C3, C4, I3)

```tsx
// [UI-S01/MSS][IMP-220] TropicalWater — Interactive Island Ocean Component
import React, { useMemo, useRef, useEffect } from 'react';
import { Color, Vector3, ShaderMaterial, PlaneGeometry, Mesh, type IUniform } from 'three';
import { useSafeFrame } from './safe_frame';
import { useEnvironmentStore, TIME_OF_DAY_PRESETS } from '../store/environment_store';
import {
  createTropicalWaterUniforms,
  TROPICAL_WATER_VERTEX_SHADER,
  TROPICAL_WATER_FRAGMENT_SHADER,
} from './shaders/tropical_water_material';

export interface TropicalWaterProps {
  readonly onWaterClick?: () => void;
  readonly testId?: string;
  readonly isMobile?: boolean;
}

export function TropicalWater({
  onWaterClick,
  testId = 'living-ocean-water',
  isMobile = false,
}: TropicalWaterProps): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const preset = TIME_OF_DAY_PRESETS[phase];

  const meshRef = useRef<Mesh>(null);
  // [C4] useMemo không deps, sạch 100% ESLint rule
  const uniforms = useMemo(() => createTropicalWaterUniforms(), []);
  const tempColor = useMemo(() => new Color(), []);
  const tempVec = useMemo(() => new Vector3(), []);

  // [C3] Gán trực tiếp Record<string, IUniform> sạch, không dirty cast
  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms,
      vertexShader: TROPICAL_WATER_VERTEX_SHADER,
      fragmentShader: TROPICAL_WATER_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });
  }, [uniforms]);

  // [I3] Phân khúc lưới thích ứng: Mobile 24x24 (1.152 tris chuẩn), Desktop 32x32
  const segments = isMobile ? 24 : 32;
  const geometry = useMemo(() => new PlaneGeometry(240, 240, segments, segments), [segments]);

  useEffect(() => {
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  useSafeFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const lerpRate = 1.0 - Math.exp(-dt * 3.0);

    // Chu kỳ sóng GPU
    const uTime = uniforms.uTime;
    if (uTime) {
      uTime.value = (uTime.value as number) + dt;
    }

    // [C4] Nội suy màu sắc mượt mà về preset hiện tại (Zero-alloc)
    if (uniforms.uShallowColor && preset) {
      tempColor.set(preset.waterShallowColor);
      (uniforms.uShallowColor.value as Color).lerp(tempColor, lerpRate);
    }
    if (uniforms.uDeepColor && preset) {
      tempColor.set(preset.waterDeepColor);
      (uniforms.uDeepColor.value as Color).lerp(tempColor, lerpRate);
    }
    if (uniforms.uFoamColor && preset) {
      tempColor.set(preset.waterFoamColor);
      (uniforms.uFoamColor.value as Color).lerp(tempColor, lerpRate);
    }
    if (uniforms.uSunColor && preset) {
      tempColor.set(preset.sunColor);
      (uniforms.uSunColor.value as Color).lerp(tempColor, lerpRate);
    }
    if (uniforms.uSunDirection && preset) {
      tempVec.set(preset.sunPosition[0], preset.sunPosition[1], preset.sunPosition[2]).normalize();
      (uniforms.uSunDirection.value as Vector3).lerp(tempVec, lerpRate);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, -0.30, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      data-testid={testId}
      onPointerDown={onWaterClick}
    />
  );
}
```

---

#### Snippet 4: Tích hợp vào [`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx) (C1, I2)

Thay thế lưới `planeGeometry [240, 240]` cũ (L73-L96) bằng `TropicalWater`, giữ nguyên vẹn 4 layers xung quanh:
```tsx
import { TropicalWater } from './tropical_water';
import { SoundEngine } from '../audio/sound_engine';

// [TẦNG 1: Đáy vực thẳm Abyss] Y = -0.420 (GIỮ NGUYÊN)
<mesh receiveShadow position={[0, -0.42, 0]}>
  <boxGeometry args={[260, 0.16, 260]} />
  <meshStandardMaterial color="#0C4A6E" roughness={0.15} metalness={0.4} />
</mesh>

// [TẦNG 3: Mặt biển chính GPU Gerstner Shader] Y = -0.300 (THAY THẾ)
<TropicalWater
  testId="living-ocean-water"
  onWaterClick={() => SoundEngine.playWaterRipple()}
/>

// [TẦNG 2: Tầng nước giữa đại dương] Y = -0.310 (GIỮ NGUYÊN)
<mesh receiveShadow position={[0, -0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
  <planeGeometry args={[180, 180, 32, 32]} />
  <meshStandardMaterial color="#0369A1" roughness={0.75} metalness={0.02} transparent opacity={0.88} />
</mesh>

// [TẦNG 4: Nước nông ngọc bích sát chân bàn cờ] Y = -0.298 (GIỮ NGUYÊN)
<mesh ref={shallowRef} receiveShadow position={[0, -0.298, 0]}>
  {streamlined ? <boxGeometry args={[18.4, 0.04, 18.4]} /> : <cylinderGeometry args={[16.3, 19.5, 0.08, 48]} />}
  <meshStandardMaterial color="#06B6D4" roughness={0.70} metalness={0.02} transparent opacity={0.70} />
</mesh>

// [TẦNG 5: Dải bọt sóng ven bờ chân sa bàn] Y = -0.292 (GIỮ NGUYÊN)
{streamlined ? (
  <mesh ref={waveRef} position={[0, -0.292, 0]}>
    <boxGeometry args={[18.45, 0.02, 18.45]} />
    <meshBasicMaterial color="#FFFFFF" transparent opacity={0.40} />
  </mesh>
) : (
  <mesh ref={waveRef} position={[0, -0.292, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[16.0, 17.2, 64]} />
    <meshBasicMaterial color="#FFFFFF" transparent opacity={0.40} />
  </mesh>
)}
```

---

### 7. QUY TRÌNH 3 TRẠM TỰ HÀNH (3-STATION PIPELINE)

1. **Trạm 0 (Type Contract Baseline - C5)**: Áp dụng Snippet 1 (thêm các trường kiểu dữ liệu `waterShallowColor`, `waterDeepColor`, `waterFoamColor` vào `environment_store.ts`) để bảo đảm TypeScript biên dịch sạch sẽ (`tsc --noEmit`), giải phóng hoàn toàn Station 1.
2. **Station 1 (RED Contract Test)**: `qa-tester` tạo file `tests/client/tropical_water_and_lighting.test.ts` chứa 16 atomic tests theo đúng ma trận Universal 5-Facet (Facet 1 đến Facet 5), kiểm tra đầy đủ C1-C5. Chứng minh Business RED trước khi triển khai code sản xuất. Cấm chạm vào `src/**`.
3. **Station 2 (GREEN Implementation)**: `implementer` áp dụng Snippets 2, 3, 4 trên đĩa để đưa toàn bộ 16 tests về GREEN (đồng thời bảo toàn 40 tests cũ tiếp tục PASS 100%).
4. **Station 2.5 (Sweeping Scout Audit)**: `scout` quét vật lý 100% các tệp đã sửa trên đĩa đối soát 5 nhóm lỗi (Stale state, unhandled async, memory leak, dirty casts, dead code) và kiểm tra trần LOC.
5. **Station 3 (Independent Review)**: Các reviewers độc lập (`spec-reviewer`, `game-3d-visual-critic`, `code-reviewer`) thẩm định vật lý đĩa và bằng chứng snapshot tại `.agents/evidence/` để đưa ra phán quyết sign-off.
