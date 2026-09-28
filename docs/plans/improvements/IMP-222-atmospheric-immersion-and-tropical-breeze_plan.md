# KẾ HOẠCH TRIỂN KHAI BƯỚC 4: ATMOSPHERIC IMMERSION & LIVING TROPICAL BREEZE (IMP-222) [HARDENED v2]

> **Mục tiêu**: Nâng tầm trải nghiệm điện ảnh và sức sống tự nhiên cho sa bàn 3D đảo ngọc nhiệt đới bằng 3 kỹ thuật đồ họa bổ trợ:
> 1. **Auto-lerp `toneMappingExposure`**: Giả lập cơ chế điều tiết võng mạc mắt người (Pupil Dilation / Exposure Adaptation) khi chuyển giao mượt mà giữa Ánh Sáng Chói Chang Ban Ngày (Day), Hoàng Hôn Hổ Phách (Sunset) và Biển Đêm Ngọc Lam Dạ Quang (Night).
> 2. **Tán Dừa Đung Đưa Trong Gió Biển (Palm Tree Micro-Sway)**: Thổi làn gió biển nhiệt đới vào vành đai cây xanh sa bàn (`LayeredTropicalFoliage`), tạo chuyển động đung đưa hữu cơ nhẹ nhàng cho các tầng tán dừa theo sóng gió đại dương mà vẫn duy trì chuẩn GPU Instancing tối ưu.
> 3. **Sương Mù Kịch Nghệ Đấu Giá (Theatrical Auction Spotlight Fog)**: Khi phiên đấu giá BĐS kịch tính mở ra (`isAuctionActive`), kéo dải sương mù khí quyển (`fogNear`, `fogFar`) áp sát lại và đồng bộ nền trời sang màu tím than rạp hát `#0F172A`, biến toàn bộ bàn cờ thành một sân khấu Broadway spotlight đầy mê hoặc, tập trung 100% ánh mắt người chơi vào ô đất đang tranh chấp.
> **Tiêu chuẩn áp dụng**: Antigravity 2.0, GEMINI.md Harness, TDD Detroit Style, Universal 5-Facet Matrix (16 atomic tests), Zero `as any`, Deep Modules & Anti-Slop.
> **Kết quả Audit**: Đã rà soát đối kháng qua `plan-griller` (`.agents/audit/PLAN_AUDIT_IMP222.md`), triệt tiêu 100% 6 điểm mù kỹ thuật (Arity mismatch trong `calculateFogTargets`, export ký hiệu ma `lerpExposure`, đồng bộ `scene.background` chân trời, phòng vệ `default: return 1.00`, ngoại hóa `tier` cho tán dừa, và bảo toàn 100% `computeBoundingSphere` trong `useEffect` di sản).

---

### 1. SƠ ĐỒ KIẾN TRÚC & DÒNG CHẢY DỮ LIỆU (VISUAL ARCHITECTURE)

```
                       [EnvironmentStore: phase & GameStore: isAuctionActive]
                                                 │
                                 [useSafeFrame Loop (dt, lerpRate)]
                                                 │
                 ┌───────────────────────────────┼───────────────────────────────┐
                 │                               │                               │
                 ▼                               ▼                               ▼
    [gl.toneMappingExposure Lerp]   [Theatrical Fog & Sky Dome]        [Instanced Palm Wind Sway]
    - Thích nghi đồng tử mắt người: - Bình thường (Atmospheric Fog):   - Vành đai 32 cây dừa:
      * Day: exposure = 1.0           * fogNear = 45m, fogFar = 180m     * Sway tán lá tier1, tier2, tier3
      * Sunset: exposure = 1.06       * Màu theo preset thời gian        * PALM_TIER_SWAY_FACTORS:
      * Night: exposure = 1.14      - Đấu giá (Theatrical Spotlight):      Tier 1: 0.6, Tier 2: 0.8, Tier 3: 1.0
      * Auction: exposure = 0.94      * fogNear kéo sát về 18m           * Tần số gió biển omega = 1.4 rad/s
    - Lerp êm ái: lerpExposure        * fogFar co lại còn 55m            * Pha lệch theo tọa độ (x + z)
      1 - exp(-dt * 2.5)              * fogColor & skyColor đồng bộ      * Bảo toàn 100% computeBoundingSphere
                 │                      chuyển sang #0F172A                      │
                 │                               │                               │
                 └───────────────────────────────┼───────────────────────────────┘
                                                 ▼
                                     [Không Gian Sa Bàn 3D Điện Ảnh]
                                   (Living Tropical Atmosphere & Drama)
```

---

### 2. BA HẠNG MỤC CỐT LÕI CỦA ATMOSPHERIC IMMERSION (BƯỚC 4)

#### 2.1 Auto-lerp `toneMappingExposure` (Điều Tiết Mắt Người / Eye Adaptation)
- **Ý nghĩa nghệ thuật & Thị giác**:
  - Khi ngoài trời chuyển từ ban ngày rực rỡ sang ban đêm, mắt người trong thực tế không giảm độ nhạy sáng tuyến tính mà đồng tử sẽ tự nhiên giãn ra (Eye Adaptation / Pupillary Reflex) để hấp thụ ánh sáng yếu.
  - Cấu hình các mốc phơi sáng chuẩn xác:
    * `day`: `exposure = 1.00` (cân bằng ánh nắng nhiệt đới).
    * `sunset`: `exposure = 1.06` (ấm áp, tôn vinh sắc cam hổ phách).
    * `night`: `exposure = 1.14` (tăng nhẹ để biển đêm dạ quang và đèn hải đăng quét $360^\circ$ phát sáng huyền ảo).
    * `auction`: `exposure = 0.94` (giảm nhẹ nền để ánh đèn rọi spotlight trên ô đất nổi bật rực rỡ).
- **Hạ tầng thực thi**:
  - Export hàm thuần túy `calculateTargetExposure(phase, isAuctionActive)` có phòng vệ `default: return 1.00;`.
  - Export hàm thuần túy `lerpExposure(current, target, rate)` cho test suite và frame loop.
  - Không tốn thêm draw call nào. Cập nhật trực tiếp trên `state.gl.toneMappingExposure`.

#### 2.2 Tán Dừa Đung Đưa Trong Gió Biển (Palm Tree Micro-Sway)
- **Ý nghĩa nghệ thuật & Thị giác**:
  - Vành đai 32 cây dừa của `LayeredTropicalFoliage` đung đưa nhịp nhàng theo làn gió biển, hoàn thiện bức tranh sinh động toàn diện sau sóng nước biển (`IMP-220`) và du thuyền (`IMP-221`).
- **Kỹ thuật thực thi trên InstancedMesh**:
  - Thân dừa (`trunkRef`) giữ nguyên vị trí cố định trên mặt đất trong `useEffect` cùng 4 lệnh `computeBoundingSphere` bảo vệ Frustum Culling và test hồi quy tĩnh.
  - 3 tầng tán lá trên ngọn (`tier1Ref`, `tier2Ref`, `tier3Ref`) đung đưa theo hàm sóng điều hòa:
    $$\Delta\theta_z(t, x, z, \text{tier}) = \sin(t \times 1.4 + x \times 0.08 + z \times 0.06) \times 0.018 \times \text{factor}$$
    $$\Delta\theta_x(t, x, z, \text{tier}) = \cos(t \times 1.1 + x \times 0.05 + z \times 0.07) \times 0.012 \times \text{factor}$$
  - Export bảng hệ số `PALM_TIER_SWAY_FACTORS = { 1: 0.6, 2: 0.8, 3: 1.0 }`.
  - Tái sử dụng `dummy` có sẵn, zero allocation trong frame loop. Gọi `needsUpdate = true` trên 3 tầng tán lá.

#### 2.3 Sương Mù Kịch Nghệ Đấu Giá & Đồng Bộ Nền Trời (Theatrical Auction Fog & Sky)
- **Ý nghĩa nghệ thuật & Thị giác**:
  - Khi mở modal đấu giá (`isAuctionActive = true`):
    * `fogNear` thu hẹp từ $45$m về $18$m (ngay sát viền ngoài của bàn cờ).
    * `fogFar` thu hẹp từ $180$m về $55$m (che phủ hoàn toàn núi non và biển xa).
    * `fogColor` VÀ `scene.background` cùng lerp mượt mà sang màu tím than rạp hát `#0F172A` (triệt tiêu 100% lỗi đứt gãy chân trời Horizon Cutout).
    * Bàn cờ trở thành một ốc đảo ánh sáng rực rỡ nổi bật giữa màn đêm bí ẩn Broadway.
  - Export hàm thuần túy `calculateFogTargets(phase, isAuctionActive, preset?)` với `preset` tùy chọn fallback tự động về `TIME_OF_DAY_PRESETS[phase]`.

---

### 3. ĐO LƯỜNG NGÂN SÁCH LOC (PRE-CODING LOC BASELINE)

Đo lường vật lý trên đĩa cứng:

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | Dự Kiến Delta | LOC Sau Khi Sửa | Đánh Giá Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/time_of_day_lighting.tsx` | Tier 2 (UI/3D/Views) | 256 | +40 | 296 | ✔️ An toàn (Trần <= 500) |
| `src/client/3d/layered_tropical_foliage.tsx` | Tier 2 (UI/3D/Views) | 163 | +48 | 211 | ✔️ An toàn (Trần <= 500) |
| `tests/client/atmospheric_immersion_and_breeze.test.ts` | Test Suite | 0 | +250 | 250 | ✔️ An toàn (Trần <= 600) |

---

### 4. PHÂN TÍCH 5 NHÓM LỖI TIỀM ẨN & PHÒNG VỆ (5 CRITICAL FAILURE MODES)

1. **FM1 (Tone Mapping Glitch / Flashing Khi Chuyển Cảnh Nhanh)**:
   - *Phòng vệ*: Luôn nội suy thông qua hàm mũ liên tục `lerpRate = 1 - Math.exp(-dt * 2.5)` qua hàm `lerpExposure(current, target, rate)`.
2. **FM2 (InstancedMesh Matrix Desync / Drift Khi Cập Nhật Liên Tục)**:
   - *Phòng vệ*: Tọa độ gốc `tree.x, tree.y, tree.z` và góc ban đầu `tree.yaw` lưu bất biến. Mỗi frame tái tạo ma trận sạch từ góc gốc cộng thêm $\Delta\theta(t)$.
3. **FM3 (Theatrical Fog Trapping & Horizon Cutout Discontinuity)**:
   - *Phòng vệ*: Đồng bộ cả `scene.fog` và `scene.background` lerp về `fogTargets.color`. Khi `activeModal !== 'auction'`, tự động lerp ngược về preset gốc.
4. **FM4 (Mobile Garbage Collection Churn Trong Vòng Lặp Foliage)**:
   - *Phòng vệ*: Tái sử dụng đối tượng `dummy = useMemo(() => new THREE.Object3D(), [])`. Zero object allocation trong frame loop.
5. **FM5 (Backward Compatibility Regression Với Existing Lighting & Foliage Tests)**:
   - *Phòng vệ*: Giữ nguyên 100% logic khởi tạo và 4 lệnh `computeBoundingSphere` trong `useEffect` của `layered_tropical_foliage.tsx`. Giữ nguyên cấu trúc JSX và props của `TimeOfDayLighting`.

---

### 5. MA TRẬN KIỂM THỬ HỢP ĐỒNG 5 MẶT (UNIVERSAL 5-FACET MATRIX - 16 ATOMIC TESTS)

Toàn bộ test case nằm trong [`tests/client/atmospheric_immersion_and_breeze.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/atmospheric_immersion_and_breeze.test.ts):

- **Facet 1: Tone Mapping Exposure Adaptation (4 tests)**
  - `[TC-222.01/MSS][UC-IMP222][Facet-1/DayExposure]`: `calculateTargetExposure('day', false)` trả về chính xác $1.00$.
  - `[TC-222.02/MSS][UC-IMP222][Facet-1/SunsetExposure]`: `calculateTargetExposure('sunset', false)` trả về giá trị ấm áp $1.06$.
  - `[TC-222.03/MSS][UC-IMP222][Facet-1/NightExposure]`: `calculateTargetExposure('night', false)` trả về giá trị giãn đồng tử $1.14$.
  - `[TC-222.04/MSS][UC-IMP222][Facet-1/AuctionExposure]`: Khi `isAuctionActive = true`, `calculateTargetExposure(phase, true)` luôn trả về mức tập trung rạp hát $0.94$ bất kể pha thời gian.

- **Facet 2: Theatrical Auction Fog & Sky Parameters (3 tests)**
  - `[TC-222.05/MSS][UC-IMP222][Facet-2/StandardFogDistance]`: Ở chế độ thường (`isAuctionActive = false`), `calculateFogTargets(phase, false)` (gọi 2 tham số) duy trì khoảng cách xa tiêu chuẩn: `near` $\ge 40$, `far` $\ge 160$.
  - `[TC-222.06/MSS][UC-IMP222][Facet-2/TheatricalFogDistance]`: Ở chế độ đấu giá (`isAuctionActive = true`), `calculateFogTargets(phase, true)` kéo sương mù sát lại: `near = 18.0`, `far = 55.0`.
  - `[TC-222.07/MSS][UC-IMP222][Facet-2/TheatricalFogColor]`: Khi đấu giá, màu sương mù chuyển sang sắc tím than kịch nghệ `#0F172A`.

- **Facet 3: Palm Tree Micro-Sway Dynamics (3 tests)**
  - `[TC-222.08/MSS][UC-IMP222][Facet-3/SwayAmplitudeBounds]`: `calculatePalmSwayAngles(time, x, z, 3)` tính toán góc dời $\Delta\theta_z \in [-0.022, 0.022]$ và $\Delta\theta_x \in [-0.015, 0.015]$ rad, bảo đảm không làm gãy đổ tán cây.
  - `[TC-222.09/MSS][UC-IMP222][Facet-3/SpatialPhaseDiversity]`: Hai cây dừa ở tọa độ khác biệt $(x_1, z_1) \neq (x_2, z_2)$ có góc rung lắc lệch pha nhau, không đung đưa rập khuôn đồng loạt.
  - `[TC-222.10/MSS][UC-IMP222][Facet-3/TierHierarchicalDamping]`: `calculatePalmSwayAngles(time, x, z, 3).swayZ` có biên độ lớn hơn `calculatePalmSwayAngles(time, x, z, 1).swayZ` (tỷ lệ $1.0$ vs $0.6$).

- **Facet 4: Transition Continuity & Defensive Guards (3 tests)**
  - `[TC-222.11/MSS][UC-IMP222][Facet-4/ExposureContinuousLerp]`: `lerpExposure(current, target, rate)` hội tụ trơn tru không có bước nhảy gián đoạn.
  - `[TC-222.12/MSS][UC-IMP222][Facet-4/FogContinuousLerp]`: Khoảng cách `fogNear` và `fogFar` biến thiên liên tục qua thời gian khi mở/đóng đấu giá.
  - `[TC-222.13/MSS][UC-IMP222][Facet-4/DefensiveNumberGuard]`: `calculateTargetExposure` và `calculatePalmSwayAngles` có guard fallback an toàn, không trả về `NaN` hay `undefined` khi nhận giá trị bất thường.

- **Facet 5: Backward Compatibility & Resource Integrity (3 tests)**
  - `[TC-222.14/MSS][UC-IMP222][Facet-5/LightingMarkupIntegrity]`: `renderToStaticMarkup(<TimeOfDayLighting />)` bảo toàn 100% `data-testid="time-of-day-lighting"` và các thẻ ánh sáng gốc.
  - `[TC-222.15/MSS][UC-IMP222][Facet-5/FoliageInstancedMeshIntegrity]`: `LayeredTropicalFoliage` duy trì chính xác 4 cụm `instancedMesh` cho 32 cây với số lượng draw call không đổi.
  - `[TC-222.16/MSS][UC-IMP222][Facet-5/SSRMarkupSafety]`: Cả hai component kết xuất trơn tru không lỗi trong môi trường Node.js headless.

---

### 6. DROP-IN CODE SNIPPETS CỤ THỂ

#### Snippet 1: Nâng Cấp Phơi Sáng & Sương Mù Kịch Nghệ Trong [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx)

```tsx
// Thêm các hàm thuần túy phục vụ testability 100%:
export function calculateTargetExposure(phase: string, isAuctionActive: boolean): number {
  if (isAuctionActive) return 0.94;
  switch (phase) {
    case 'day': return 1.00;
    case 'sunset': return 1.06;
    case 'night': return 1.14;
    default: return 1.00;
  }
}

export function lerpExposure(current: number, target: number, rate: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target) || !Number.isFinite(rate)) return current;
  return current + (target - current) * rate;
}

export function calculateFogTargets(
  phase: 'day' | 'sunset' | 'night',
  isAuctionActive: boolean,
  preset?: typeof TIME_OF_DAY_PRESETS['day']
): { near: number; far: number; color: string } {
  if (isAuctionActive) {
    return { near: 18.0, far: 55.0, color: '#0F172A' };
  }
  const resolvedPreset = preset ?? TIME_OF_DAY_PRESETS[phase] ?? TIME_OF_DAY_PRESETS.day;
  return { near: resolvedPreset.fogNear, far: resolvedPreset.fogFar, color: resolvedPreset.fogColor };
}

// Cập nhật hàm updateDiffuseAndAtmosphere:
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
): void {
  // 1. Auto-lerp gl.toneMappingExposure (Mắt thích nghi ánh sáng)
  if (gl && typeof gl.toneMappingExposure === 'number') {
    const targetExposure = calculateTargetExposure(phase, isAuctionActive);
    gl.toneMappingExposure = lerpExposure(gl.toneMappingExposure, targetExposure, lerpRate);
  }

  if (ambient) {
    tempColor.set(preset.ambientColor);
    ambient.color.lerp(tempColor, lerpRate);
    ambient.intensity = calculateTheatricalAmbientIntensity(ambient.intensity, isAuctionActive, dt, preset.ambientIntensity, 0.15);
  }
  if (hemi) {
    tempColor.set(preset.hemiSkyColor);
    hemi.color.lerp(tempColor, lerpRate);
    tempColor.set(preset.hemiGroundColor);
    hemi.groundColor.lerp(tempColor, lerpRate);
    const targetHemi = isAuctionActive ? preset.hemiIntensity * 0.15 : preset.hemiIntensity;
    hemi.intensity += (targetHemi - hemi.intensity) * lerpRate;
  }
  if (scene) {
    // 2. Theatrical Fog & Đồng Bộ Nền Trời Bầu Khí Quyển
    const fogTargets = calculateFogTargets(phase, isAuctionActive, preset);
    if (!scene.fog || !isThreeFog(scene.fog)) {
      scene.fog = new Fog(fogTargets.color, fogTargets.near, fogTargets.far);
    } else {
      tempColor.set(fogTargets.color);
      scene.fog.color.lerp(tempColor, lerpRate);
      scene.fog.near += (fogTargets.near - scene.fog.near) * lerpRate;
      scene.fog.far += (fogTargets.far - scene.fog.far) * lerpRate;
    }
    const targetSkyColor = isAuctionActive ? fogTargets.color : preset.skyColor;
    if (!scene.background || !isThreeColor(scene.background)) {
      scene.background = new Color(targetSkyColor);
    } else {
      tempColor.set(targetSkyColor);
      scene.background.lerp(tempColor, lerpRate);
    }
    const baseEnv = phase === 'night' ? 0.28 : phase === 'sunset' ? 0.38 : 0.75;
    const targetEnv = isAuctionActive ? 0.12 : baseEnv;
    if (typeof scene.environmentIntensity !== 'number') {
      scene.environmentIntensity = 1.0;
    }
    scene.environmentIntensity += (targetEnv - scene.environmentIntensity) * lerpRate;
  }
}

// Bên trong TimeOfDayLighting - useSafeFrame:
// Cập nhật call-site truyền state.gl ở vị trí tham số thứ 4:
// updateDiffuseAndAtmosphere(ambientRef.current, hemiRef.current, state.scene, state.gl, preset, phase, isAuctionActive, dt, lerpRate, tempColor);
```

#### Snippet 2: Nâng Cấp Tán Dừa Đung Đưa Theo Gió Trong [`src/client/3d/layered_tropical_foliage.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/layered_tropical_foliage.tsx)

```tsx
export const PALM_TIER_SWAY_FACTORS = { 1: 0.6, 2: 0.8, 3: 1.0 } as const;

export function calculatePalmSwayAngles(
  time: number,
  x: number,
  z: number,
  tier: 1 | 2 | 3 = 3
): { swayZ: number; swayX: number } {
  if (!Number.isFinite(time) || !Number.isFinite(x) || !Number.isFinite(z)) return { swayZ: 0, swayX: 0 };
  const factor = PALM_TIER_SWAY_FACTORS[tier] ?? 1.0;
  const swayZ = Math.sin(time * 1.4 + x * 0.08 + z * 0.06) * 0.018 * factor;
  const swayX = Math.cos(time * 1.1 + x * 0.05 + z * 0.07) * 0.012 * factor;
  return { swayZ, swayX };
}

export function LayeredTropicalFoliage(): React.ReactElement {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const trunkRef = useRef<InstancedMesh>(null);
  const tier1Ref = useRef<InstancedMesh>(null);
  const tier2Ref = useRef<InstancedMesh>(null);
  const tier3Ref = useRef<InstancedMesh>(null);

  // GIỮ NGUYÊN 100% useEffect ban đầu (khởi tạo ma trận cơ sở tĩnh cho 4 meshes và gọi computeBoundingSphere):
  useEffect(() => {
    const trunk = trunkRef.current;
    const tier1 = tier1Ref.current;
    const tier2 = tier2Ref.current;
    const tier3 = tier3Ref.current;
    if (!trunk || !tier1 || !tier2 || !tier3) return;

    for (let i = 0; i < TROPICAL_TREES.length; i++) {
      const tree = TROPICAL_TREES[i];
      if (!tree) continue;
      const s = tree.scale;

      dummy.position.set(tree.x, tree.y + 0.6 * s, tree.z);
      dummy.rotation.set(tree.tiltX, tree.yaw, tree.tiltZ);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunk.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tree.x, tree.y + 1.15 * s, tree.z);
      dummy.rotation.set(tree.tiltX * 0.5, tree.yaw, tree.tiltZ * 0.5);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      tier1.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tree.x, tree.y + 1.48 * s, tree.z);
      dummy.rotation.set(tree.tiltX * 0.3, tree.yaw + Math.PI / 6, tree.tiltZ * 0.3);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      tier2.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tree.x, tree.y + 1.78 * s, tree.z);
      dummy.rotation.set(tree.tiltX * 0.2, tree.yaw + Math.PI / 3, tree.tiltZ * 0.2);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      tier3.setMatrixAt(i, dummy.matrix);
    }

    trunk.instanceMatrix.needsUpdate = true;
    tier1.instanceMatrix.needsUpdate = true;
    tier2.instanceMatrix.needsUpdate = true;
    tier3.instanceMatrix.needsUpdate = true;

    trunk.computeBoundingSphere?.();
    tier1.computeBoundingSphere?.();
    tier2.computeBoundingSphere?.();
    tier3.computeBoundingSphere?.();
  }, [dummy]);

  // useSafeFrame cập nhật độ nghiêng đung đưa của 3 tầng tán lá theo gió biển:
  useSafeFrame((state) => {
    const t = state.clock.elapsedTime;
    const tier1 = tier1Ref.current;
    const tier2 = tier2Ref.current;
    const tier3 = tier3Ref.current;
    if (!tier1 || !tier2 || !tier3) return;

    for (let i = 0; i < TROPICAL_TREES.length; i++) {
      const tree = TROPICAL_TREES[i];
      if (!tree) continue;
      const s = tree.scale;

      // Tầng 1: Đáy (tier = 1)
      const sway1 = calculatePalmSwayAngles(t, tree.x, tree.z, 1);
      dummy.position.set(tree.x, tree.y + 1.15 * s, tree.z);
      dummy.rotation.set(tree.tiltX * 0.5 + sway1.swayX, tree.yaw, tree.tiltZ * 0.5 + sway1.swayZ);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      tier1.setMatrixAt(i, dummy.matrix);

      // Tầng 2: Giữa (tier = 2)
      const sway2 = calculatePalmSwayAngles(t, tree.x, tree.z, 2);
      dummy.position.set(tree.x, tree.y + 1.48 * s, tree.z);
      dummy.rotation.set(tree.tiltX * 0.3 + sway2.swayX, tree.yaw + Math.PI / 6, tree.tiltZ * 0.3 + sway2.swayZ);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      tier2.setMatrixAt(i, dummy.matrix);

      // Tầng 3: Chóp đỉnh (tier = 3)
      const sway3 = calculatePalmSwayAngles(t, tree.x, tree.z, 3);
      dummy.position.set(tree.x, tree.y + 1.78 * s, tree.z);
      dummy.rotation.set(tree.tiltX * 0.2 + sway3.swayX, tree.yaw + Math.PI / 3, tree.tiltZ * 0.2 + sway3.swayZ);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      tier3.setMatrixAt(i, dummy.matrix);
    }

    tier1.instanceMatrix.needsUpdate = true;
    tier2.instanceMatrix.needsUpdate = true;
    tier3.instanceMatrix.needsUpdate = true;
  });
```

---

### 7. QUY TRÌNH 3 TRẠM TỰ HÀNH (3-STATION PIPELINE)

1. **Station 1 (RED Contract Test)**: `qa-tester` tạo tệp `tests/client/atmospheric_immersion_and_breeze.test.ts` (16 atomic tests theo 5 Facets, cấm chạm vào `src/**`, chứng minh Business RED).
2. **Station 2 (GREEN Implementation)**: `implementer` hiện thực mã nguồn tại `src/client/3d/time_of_day_lighting.tsx` và `src/client/3d/layered_tropical_foliage.tsx`, đưa toàn bộ 16 tests về GREEN và bảo toàn các tests cũ.
3. **Station 2.5 (Sweeping Scout Audit)**: `scout` quét vật lý các tệp đã sửa kiểm tra 5 nhóm lỗi phổ biến và đo ngân sách LOC.
4. **Station 3 (Independent Review)**: `spec-reviewer` và `game-3d-visual-critic` thẩm định độc lập đĩa cứng và cấp phán quyết xuất xưởng.
