# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-365
## Plan IMP-365: Mobile Water Shader LOD & ALU Optimization (Ticket IMP-365)

> **Mã Ticket:** `IMP-365`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-11  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Triển khai gói hoàn thiện và đồng bộ kỹ thuật cho ticket `IMP-365` thuộc phân hệ `client-3d`.

- **Mục tiêu kỹ thuật**:
  - Bảo toàn 100% logic nghiệp vụ cốt lõi và các ràng buộc FSM/Domain.
  - Phân bổ cấu trúc hiển thị tối ưu, bảo vệ trải nghiệm công thái học (ergonomics) trên cả Desktop và Mobile.
  - Tuân thủ nghiêm ngặt các ranh giới kiểm thử, Zero Dirty Casts (`as any`), và các trần giới hạn LOC.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-365.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-365.md) | Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp365_mobile_water_lod.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp365_mobile_water_lod.test.ts) | 6 atomic tests, 14 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-365_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-365_snapshot.json) | 2 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-365_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-365_desktop.jpg) & Mobile (360x740) [`imp-365_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-365_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-365.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-365.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-365.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-365.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.33 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 15/15 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity Attack**
    - **Target reachable?**: **Yes**.
  - **[ADV-01] Three.js Pass Order Fallacy & False TBDR Early-Z Overdraw Elimination**
    - **Vector**: Unstated Assumptions & Subsystem Drift
    - **Scenario**: Plan IMP-365 configures `TropicalWater` with `transparent: true` and `depthWrite: true` on mobile ([plan line 195](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_365_MOBILE_WATER_LOD_AND_ALU_OPTIMIZATION.md#L195)), claiming this unlocks Apple Silicon hardware Early-Z to cull fragment shading over the subterranean abyss box ($Y=-0.42$). In Three.js `WebGLRenderer`, the scene rendering loop strictly separates meshes: Pass 1: `renderObjects(opaqueObjects)` (all materials with `transparent: false`). Pass 2: `renderObjects(transparentObjects)` (all materials with `transparent: true`). The abyss box ([`src/client/3d/coastal_island_environment.tsx#L69-72`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx#L69-72)) is an opaque `MeshStandardMaterial` (`transparent: false`). It is 100% rasterized and shaded in Pass 1. `TropicalWater` (`transparent: true`) is rendered in Pass 2. By the time `TropicalWater` executes, the abyss box has already written to the color and depth buffers.
    - **Hardening Directive**: Retain `depthWrite: false` on `TropicalWater` across all platforms in [`src/client/3d/shaders/tropical_water_material.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/shaders/tropical_water_material.ts) and [`src/client/3d/tropical_water.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tropical_water.tsx). If subterranean abyss box overdraw on mobile must be eliminated, conditionally unmount the abyss box in [`src/client/3d/coastal_island_environment.tsx#L69`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx#L69) via `{!isMobile && (...) }`, mirroring how the TẦNG 2 intermediate ocean was already eliminated in IMP-338.
  - **[ADV-02] Geometric Contour Distortion in 16x16 Grid (15m Quad vs 9.6m Plinth Radius)**
    - **Vector**: Unstated Assumptions & Subsystem Drift
    - **Scenario**: Plan IMP-365 reduces mobile plane subdivisions to $16 \times 16$ ([plan line 201](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_365_MOBILE_WATER_LOD_AND_ALU_OPTIMIZATION.md#L201)), creating quads $15.0\text{m} \times 15.0\text{m}$ ($240\text{m} / 16$). The plan moves depth blending to the vertex shader: `vDepthFactor = clamp((length(worldPos.xz) - 9.6) / 60.0, 0.0, 1.0);` The transition zone starts at $r = 9.6\text{m}$ (the board edge) and extends radially. The entire circumference of the board perimeter circle is $2\pi \times 9.6 \approx 60.3\text{m}$. Across this $60.3\text{m}$ circumference, a $15\text{m}$ grid only places 4 to 8 vertices. The GPU hardware rasterizer linearly interpolates `vDepthFactor` across triangles. Between vertex $(15, 0)$ (`vDepthFactor = 0.090`) and $(0, 15)$ (`vDepthFactor = 0.090`), the midpoint is $(7.5, 7.5)$, where the interpolated factor is $0.090$. However, the true Euclidean distance is $\sqrt{7.5^2 + 7.5^2} = 10.61\text{m}$, yielding a true factor of $(10.61 - 9.6) / 60.0 = 0.0168$.
    - **Consequence**: The linearly interpolated value is **535% higher** than the true radial value at triangle midpoints. Instead of a smooth circular turquoise-to-deep-blue gradient, the ocean color forms an irregular faceted octagon with visible diagonal seams and geometric kinks aligned with the $15\text{m}$ mesh triangulation.
    - **Hardening Directive**: Preserve smooth Euclidean depth absorption by retaining `dist = length(vWorldPosition.xz)` in the mobile fragment shader. In modern mobile GPUs (Apple Silicon, Mali, Adreno), computing `length(xz)` on 2D coordinates takes only 2 ALU cycles ($1\text{ FMA} + 1\text{ RSQ/SQRT}$). Alternatively, retain at least $24 \times 24$ subdivisions on mobile ($10\text{m}$ quads) to limit interpolation curvature error.
  - **[ADV-03] Android FP16 Vertex Mantissa Stepping Regression via Global Material `precision: 'mediump'`**
    - **Vector**: Living Contract Regression (ADV-REG) & Precision Degradation
    - **Scenario**: Plan IMP-365 configures `precision: 'mediump'` on the Three.js `ShaderMaterial` options on mobile ([plan line 194](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_365_MOBILE_WATER_LOD_AND_ALU_OPTIMIZATION.md#L194)). When Three.js builds shader programs with `precision: 'mediump'`, it injects `precision mediump float;` into **both** the vertex shader and fragment shader. On mobile Android devices (Mali-G7x, Adreno 5xx/6xx), vertex transformation registers drop from FP32 (24-bit mantissa) to FP16 (10-bit mantissa). For vertices with $x, z \in [64, 120]\text{m}$, the minimum representable step size (ULP) in FP16 is $2^{6-10} = 0.0625\text{m} = 6.25\text{cm}$. The Gerstner wave displacement amplitudes in [`src/client/3d/shaders/tropical_water_material.ts#L82-83`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/shaders/tropical_water_material.ts#L82-83) are $w1 = 0.024\text{m}$ ($2.4\text{cm}$) and $w2 = 0.018\text{m}$ ($1.8\text{cm}$).
    - **Consequence**: Both wave harmonics are smaller than the single-step precision of FP16 ($2.4\text{cm} < 6.25\text{cm}$). Across the outer half of the $240\text{m}$ plane, the wave displacement is either completely rounded to 0 or violently snaps by $6.25\text{cm}$ in discrete steps. This directly re-introduces the Android 16-bit vertex jitter bug that Ticket IMP-357 was specifically executed to fix.
    - **Hardening Directive**: Retain `precision: 'highp'` on the Three.js `ShaderMaterial` constructor in [`src/client/3d/tropical_water.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tropical_water.tsx). Apply `precision mediump float;` **strictly inside the body of `TROPICAL_WATER_MOBILE_FRAGMENT_SHADER`** in [`src/client/3d/shaders/tropical_water_material.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/shaders/tropical_water_material.ts). This guarantees FP32 vertex transformations while executing the fragment ALU in fast 16-bit half-precision registers.
  - **[ADV-04] FP16 Intermediate Overflow in Fragment `normalize(cameraPosition - vWorldPosition)`**
    - **Vector**: Partial Failure & Trapped States
    - **Scenario**: In `TROPICAL_WATER_MOBILE_FRAGMENT_SHADER` ([plan line 113-115](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_365_MOBILE_WATER_LOD_AND_ALU_OPTIMIZATION.md#L113-L115)): precision mediump float; varying vec3 vWorldPosition; ... vec3 viewDir = normalize(cameraPosition - vWorldPosition); float fresnel = clamp(1.0 - viewDir.y, 0.0, 1.0); `vWorldPosition` extends to $(\pm 120, -0.3, \pm 120)$. When camera is in `overview` or `pre_match` position ($[24.6, 25.3, 24.6]$ or $[30, 33, 30]$, [`camera_state_machine.ts#L35,L42`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts#L35,L42)), or during user zoom/pan gesture out to distance 65 ([`adaptive_cinematic_camera.tsx#L449`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx#L449)), the vector difference to the far corner is: $\Delta x \approx 165$, $\Delta z \approx 165$, $\Delta y \approx 45$. GLSL `normalize(v)` executes `v * inversesqrt(dot(v, v))`. The squared length $\text{dot}(v, v)$ is $165^2 + 165^2 + 45^2 = 27,225 + 27,225 + 2,025 = 56,475$. The OpenGL ES 2.0 / 3.0 specification for `mediump` only mandates a range of $[-16,384, +16,384]$. Even under IEEE 754 half-precision, the absolute maximum finite value is $65,504$.
    - **Consequence**: On mobile GPUs where `mediump` range is capped at 16,384 or during wider camera views, `dot(v, v)` overflows to $+\infty$. `inversesqrt(+Inf)` evaluates to 0.0 or `NaN`, collapsing `viewDir` to $(0, 0, 0)$ or `NaN`. `viewDir.y` evaluates to 0.0, causing the Fresnel term to violently clip to 1.0 (blown-out white specular artifact) or turn the ocean horizon completely black.
    - **Hardening Directive**: Notice that `viewDir` is used solely to compute `fresnel = clamp(1.0 - viewDir.y, 0.0, 1.0)`. View angle varies extremely smoothly across the plane. Evaluate `vFresnel` in the vertex shader where coordinates are in `highp` FP32: // In TROPICAL_WATER_MOBILE_VERTEX_SHADER vec3 viewDir = normalize(cameraPosition - worldPos.xyz); float f = clamp(1.0 - viewDir.y, 0.0, 1.0); vFresnel = f * f; Pass `varying float vFresnel;` to the fragment shader. This completely eliminates `vWorldPosition` varying, eliminates `cameraPosition` uniform access in fragment, eliminates 3D `normalize()` from 1.4M fragments per frame, and is 100% immune to FP16 overflow.
  - **[ADV-05] Living Test Collisions in TC-357.04 and TC-338.04**
    - **Vector**: Living Test Collision & Contract Regression (ADV-REG)
    - **Scenario**: Two existing living contract test files assert on the exact properties Plan IMP-365 proposes to alter: [`tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts#L133-141`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts#L133-141): it('TC-357.04 [UC-WATER-HIGHP-PRECISION/MSS]: Given TropicalWater component rendered with isMobile true, When inspecting material properties via captureTree, Then configures precision highp on ShaderMaterial', () => { const tree = captureTree(TropicalWater, { isMobile: true }); const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water'); const mat = mesh?.props.material; expect(mat instanceof ShaderMaterial).toBe(true); if (mat instanceof ShaderMaterial) { expect(mat.precision).toBe('highp'); } }); [`tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts#L111-119`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts#L111-119): it('TC-338.04 [UC-WATER/MSS]: Given TropicalWater rendered with isMobile true, When inspecting material properties via captureTree, Then configures precision highp on ShaderMaterial to prevent Android FP16 vertex jitter', () => {
    - **Consequence**: When Station 4 runs regression tests or CI runs `npm test`, TC-357.04 and TC-338.04 will immediately fail with: `AssertionError: expected 'mediump' to be 'highp'` and `AssertionError: expected [16, 16] to deeply equal [24, 24]`. Plan IMP-365 did not declare these files in scope and provided zero contract migration rationale.
    - **Hardening Directive**: Add `tests/client/imp357_android_webgl_diagnostic_and_depth.test.ts` and `tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts` to Plan IMP-365 target physical files. Under the hardened architecture (ADV-03), `ShaderMaterial.precision` remains `'highp'` (protecting vertex precision and satisfying TC-357.04 and TC-338.04 without breaking them). If mesh segments are stepped down to 16, update TC-338.04 line 118 to expect `[16, 16]` with an explicit contract migration comment referencing IMP-365.
  - **[ADV-06] State Lifecycle & Time-of-Day Lerp Cleanliness**
    - **Vector**: State Lifecycle & Transition Lerp
    - **Verdict on State Lifecycle**: **PASS** (Cleanly architected).

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp365_mobile_water_lod.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp365_mobile_water_lod.test.ts)
- **Chỉ số kiểm thử**: **6 atomic tests**, **14 asserts** (mật độ trung bình: 2.33 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.


### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/shaders/tropical_water_material.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/shaders/tropical_water_material.ts)
  - [`src/client/3d/tropical_water.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tropical_water.tsx)
- **Chuyển trạng thái**: Toàn bộ **6/6 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 1 <= 400, Tier 2 <= 500, Tier 3 <= 800, Test <= 600).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
1. **Spec & Scope Gatekeeper (`spec-reviewer`)**:
    - **Phán quyết**: **APPROVED** 📋
    - **Xác nhận phạm vi**: 100% các thay đổi nằm trong phân hệ mục tiêu (`client-3d`), zero scope creep.
2. **Deep Architecture & Anti-Slop Auditor (`code-reviewer`)**:
    - **Phán quyết**: **APPROVED** 🛡️
    - **Chỉ số Anti-Slop**: 0 violations trên 6 cờ cảnh báo (Deep modules, Zero pass-through wrappers, Zero TIDD).
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.


### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 15/15 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-365 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `tropical_water_material.ts` | [`src/client/3d/shaders/tropical_water_material.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/shaders/tropical_water_material.ts) | Tier 2 (UI/3D/Views) | **207 LOC** | 207 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `tropical_water.tsx` | [`src/client/3d/tropical_water.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tropical_water.tsx) | Tier 2 (UI/3D/Views) | **115 LOC** | 115 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp365_mobile_water_lod.test.ts` | [`tests/client/imp365_mobile_water_lod.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp365_mobile_water_lod.test.ts) | Living Test | **67 LOC** | 67 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

