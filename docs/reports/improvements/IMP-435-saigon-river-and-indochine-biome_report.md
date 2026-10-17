# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-435
## Implementation Plan: IMP-435 S-Shaped Saigon River Spline & Indochine Botanical Biome

> **Mã Ticket:** `IMP-435`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-17  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

> **Mô tả cốt lõi**: Hoàn tất chặng cuối của Master Plan Kỳ Nghệ Đông Dương: thay thế dải nước thẳng đơ bằng Dải Sông Sài Gòn hình chữ S ngọc bích uốn quanh Đấu trường Trống Đồng, nạp Quần xã Thực vật Nhiệt đới (dừa xiêm & hoa sứ) trong 1 draw call, tái định vị tàu du ngoạn an toàn và vá liền mép địa hình cỏ xuyên suốt cả desktop lẫn mobile.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-435.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-435.md) | Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp435_saigon_river_and_indochine_biome.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp435_saigon_river_and_indochine_biome.test.ts) | 15 atomic tests, 44 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-435.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-435.json) | 3 production files modified, 100% tests (15/15) chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-435_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-435_desktop.jpg) & Mobile (360x740) [`imp-435_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-435_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-435.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-435.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-435.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-435.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.00 | **APPROVED** 🛡️ |
| **Trạm 3.2: 3D Visual & Spatial Review** | `game-3d-visual-critic`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-435.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-435.md) | Góc nhìn camera frustum, khoảng cách an toàn (clearance), không tràn viền màn hình 360px | **8.9 / 10 (3D AAA Verified) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 32/32 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity Attack & Hardening Resolution**
    - **Target reachable?**: **Yes** — Trong `src/client/3d/board_layout.tsx#L204`, cấu trúc production: `<MiniatureCityDiorama isMobile={isMobile} isDesktopLean={!isMobile} isVisible={isCityVisible} />`. Trên Desktop (`isMobile=false`), `isDesktopLean=true`. Trên Mobile, `isMobile=true`. Trong cả hai trường hợp runtime, `isSerene = isDesktopLean || isMobile` đều đánh giá là `true`. `DioramaTerrain({ isSereneTabletop })` và `DioramaUrbanCanopy({ isSereneTabletop })` nhận `isSereneTabletop={true}` và thực thi 100% trong điều kiện bình thường.
    - **Phán quyết Hardened**: **HARDENED_APPROVED 🛡️** — Các va chạm hình học ban đầu (va chạm mố cầu, rò rỉ fallback khối hộp xám, và va chạm tàu du ngoạn) được phát hiện trong vòng đối kháng sơ khởi đã được giải tỏa triệt để 100% trong bản kế hoạch chính thức trước khi tiến hành Station 2.
  - **[ADV-01] Living Contract Regression on `data-testid="diorama-river-waves"` in `imp379`**
    - **Vector**: Vector 6: Living Test Collision & Contract Regression (ADV-REG)
    - **Scenario**: `tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts#L124-134` executes `TC-379.04`: const mobileMarkup = renderToStaticMarkup( React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true }) ); expect(mobileMarkup).toContain('data-testid="diorama-river-waves"'); In `MiniatureCityDiorama`, `isMobile: true` causes `isSerene = true`, which passes `isSereneTabletop={true}` to `DioramaTerrain`. In the plan's drop-in replacement for `diorama_terrain.tsx` (lines 108-150), `isSereneTabletop: true` renders `<SafeGLTFModel ... />` with a fallback containing only 2 meshes (`#0C4A6E` and `#0284C7`). The element with `data-testid="diorama-river-waves"` is present **only in the `isSereneTabletop: false` branch**. In Vitest/Node SSR, `isHeadlessOrTestEnv()` returns `true`, causing `SafeGLTFModel` to render its fallback.
    - **Consequence**: `mobileMarkup` will not contain `data-testid="diorama-river-waves"`. Living contract test `imp379` TC-379.04 fails with an immediate assertion failure.
    - **Hardening Directive**: In `src/client/3d/diorama/diorama_terrain.tsx`, the `SafeGLTFModel` fallback for `isSereneTabletop: true` MUST include the wave mesh: `<mesh position={[0, RIVER_BED_Y + 0.005, 0]} data-testid="diorama-river-waves">` (along with embankment slopes), ensuring 100% markup and testid parity under headless SSR test suites.
  - **[ADV-02] Default Grey Cube Fallback Spawning in `DioramaUrbanCanopy`**
    - **Vector**: Vector 3: Partial Failure & Trapped States / Vector 4: Unstated Assumptions
    - **Scenario**: In `src/client/3d/asset_loader/safe_gltf_model.tsx#L264`: `const effectiveFallback = fallback ?? <DefaultModelFallback ... />` In JavaScript, `null ?? <DefaultModelFallback>` evaluates to `<DefaultModelFallback>` because nullish coalescing treats `null` as missing. The plan's proposed drop-in for `DioramaUrbanCanopy` (lines 191-203) passes `fallback={null}`: <SafeGLTFModel url={INDOCHINE_BIOME_MODEL_URL} position={[0, 0, 0]} castShadow={!isMobile} receiveShadow fallback={null} /> In test/headless SSR environments (or before `indochine_botanical_biome.glb` finishes downloading in the browser), `SafeGLTFModel` renders `<DefaultModelFallback>`, which spawns a giant 0.5m x 0.5m x 0.5m grey cube (`#94A3B8`) at the board origin `[0, 0.02, 0]`.
    - **Consequence**: In headless tests and initial loading states, an unstyled 0.5m grey box appears in the center of the board, potentially leaking `#94A3B8` into color assertions. If the model fails to load, there is no procedural foliage fallback.
    - **Hardening Directive**: In `src/client/3d/miniature_city_diorama.tsx#L191-203`, replace `fallback={null}` with `fallback={<></>}` (if empty is intended) or preserve the 3 legacy `instancedMesh` canopy layers as the fallback component so that loading/headless states maintain visual continuity without spawning default grey cubes.
  - **[ADV-03] Moored Cruiser Grounding & Embankment Collision at $Z = 2.2\text{m}$**
    - **Vector**: Vector 4: Unstated Assumptions & Subsystem Drift / Vector 8: Spatial AABB Non-Occlusion
    - **Scenario**: On Desktop Lean (`isDesktopLean = true, isMobile = false` in `src/client/3d/board_layout.tsx#L204`), `MiniatureCityDiorama` renders: `<DioramaTerrain isSereneTabletop={true} />` (S-curve river spline) `<DioramaHarborCruiser isMobile={false} isMoored={true} />` (`miniature_city_diorama.tsx#L370`) `src/client/3d/diorama/diorama_harbor_cruiser.tsx#L42,L102` hardcodes the moored dock position: `position={[0, -0.032, 2.2]}` with `rotation.set(0, Math.PI / 2, ...)` In `saigon_river_spline.glb`, at $Z = 2.2\text{m}$, the river has swept east to $X \in [0.20, 2.78]\text{m}$. The area around $X = 0.0$ is the solid stone embankment curb ($X \in [-0.21, 0.11]\text{m}$, $Y = +0.008\text{m}$). The cruiser's 0.72m hull (rotated along X from $X = -0.36\text{m}$ to $X = +0.36\text{m}$) sits centered at $X = 0.0$. The boat is completely outside the water channel ($X < 0.20\text{m}$) and embedded 40mm deep inside solid stone embankment.
    - **Consequence**: High visual defect on Desktop Lean mode — players see the cruiser stranded on dry rock. The plan failed to include `src/client/3d/diorama/diorama_harbor_cruiser.tsx` in its scope to reconcile the mooring coordinate.
    - **Hardening Directive**: Add `src/client/3d/diorama/diorama_harbor_cruiser.tsx` to the plan's target files (or adjust mooring X in `MiniatureCityDiorama` / `calculateCruiserTrajectory`) so that when `isMoored: true`, the cruiser docks at $X \approx 1.20\text{m}, Z = 2.2\text{m}$ inside the actual marina water basin ($X \in [0.20, 2.78]$), while preserving $Z = 2.2\text{m}$ for contract compatibility with `tests/client/imp429_desktop_3d_visual_renaissance.test.ts#L145`.
  - **[ADV-04] Sunken Velvet Dice Arena 0.62m Penetration & Z-Fighting at $Z = 0$**
    - **Vector**: Vector 4: Unstated Assumptions & Subsystem Drift / Vector 8: Spatial AABB Non-Occlusion
    - **Scenario**: `MiniatureCityDiorama#L351` renders `<CentralMonumentPlaza isDesktopLean={isDesktopLean} />`, mounting `SafeGLTFModel(SUNKEN_ARENA_MODEL_URL)`. `sunken_velvet_dice_arena.glb` (Accessor 6) has an outer brass rim of radius $R = 1.68\text{m}$ centered at $(0, 0, 0)$. `saigon_river_spline.glb` reaches its apex at $Z = 0$. While the water centerline is at $X = 2.40\text{m}$, the water width is $1.80\text{m}$ (inner water edge $X = 1.50\text{m}$), and the west stone embankment extends another $0.44\text{m}$ to $X = 1.06\text{m}$. Across $Z \in [-1.54, 1.54]\text{m}$, 80 stone embankment vertices and 14 water vertices lie within $R < 1.68\text{m}$. Overlap reaches $1.68 - 1.06 = 0.62\text{m}$ at $Z = 0$. Both elements share elevation $Y \approx 0.00 - 0.02\text{m}$.
    - **Consequence**: Severe Z-fighting and visual clipping between the dice rolling arena's outer brass rim and the riverbed/stone embankment curb.
    - **Hardening Directive**: The plan must explicitly resolve this spatial overlap: either (1) apply an $X$-offset / position shift to the river spline group (e.g. `position={[0.30, 0, 0]}` at $Z=0$ if bridges permit, or verify clearance against Bridge Plazas), OR (2) specify in the plan that `CentralMonumentPlaza` / `SunkenArena` establishes strict depth/stencil layer priority over the river terrain at $Y_{\text{arena}} = 0.020 > Y_{\text{river}} = -0.035$, ensuring the arena rim cleanly occludes the underlying embankment without Z-fighting.
  - **[ADV-05] Missing Dual-Platform Parity in Station 1 Contract Tests (TC-435.05)**
    - **Vector**: Vector 7: Closed-Loop Presentation Wire (ADV-WIRE)
    - **Scenario**: The plan's TC-435.05 only specifies testing `MiniatureCityDiorama` with `isDesktopLean: true`. In production (`src/client/3d/board_layout.tsx#L204`), `MiniatureCityDiorama` is also invoked with `isMobile: true`. On mobile, `isSerene` is also `true`, which simultaneously activates the serene river spline and indochine canopy. If contract tests omit the `isMobile: true` branch on `MiniatureCityDiorama`, regressions in mobile rendering (such as ADV-01 and ADV-02) cannot be caught within `imp435_saigon_river_and_indochine_biome.test.ts`.
    - **Consequence**: Incomplete verification surface area; mobile and desktop lean equivalence partitions are not tested symmetrically.
    - **Hardening Directive**: In `tests/client/imp435_saigon_river_and_indochine_biome.test.ts`, TC-435.05 must test both `isDesktopLean: true` AND `isMobile: true` on `MiniatureCityDiorama`, asserting that `isSereneTabletop: true` propagates to both children in both modes and that SSR markup preserves all required testids.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp435_saigon_river_and_indochine_biome.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp435_saigon_river_and_indochine_biome.test.ts)
- **Chỉ số kiểm thử**: **15 atomic tests**, **44 asserts** (mật độ trung bình: 2.93 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected '' to be '/models/board/saigon_river_spline.glb' | AssertionError: expected '' to be '/models/board/indochine_botanical_biome.glb' | AssertionError: expected null not to be null | AssertionError: expected null not to be null | AssertionError: expected undefined to be true | AssertionError: expected undefined to be true | AssertionError: expected +0 to be 1.6
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/diorama/diorama_harbor_cruiser.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_harbor_cruiser.tsx)
  - [`src/client/3d/diorama/diorama_terrain.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_terrain.tsx)
  - [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
- **Chuyển trạng thái**: Toàn bộ **15/15 contract tests chuyển sang GREEN**.
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
    - **Bộ nhớ & Timer**: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn bất đồng bộ.
3. **3D Visual & Spatial Auditor (`game-3d-visual-critic`)**:
    - **Phán quyết**: **8.9 / 10 (3D AAA Verified) 🎨**
   - **K1**: Preserve S-curve centerline coordinates and bridge crossing alignments at $Z = \pm 3.8\text{m}, |X| \le 0.10\text{m}$.
   - **K2**: Maintain non-penetration guard $R \ge 1.68\text{m}$ around the Sunken Velvet Arena.
   - **K3**: Maintain single draw call merged architecture for `indochine_botanical_biome.glb` (124.2 KB) and `saigon_river_spline.glb` (46.8 KB).
   - **K4**: Retain procedural infill mesh and void guard in `diorama_terrain.tsx` for cross-platform terrain continuity.



### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 32/32 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-435 (Direct Scope)

| Tệp Mã Nguồn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Ngân Sách Trần | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: |
| [`diorama_harbor_cruiser.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_harbor_cruiser.tsx) | Tier 2 (UI/3D/Views) | **110 SLOC** (125 L) | <= 500 LOC | ✅ Đạt chuẩn |
| [`diorama_terrain.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_terrain.tsx) | Tier 2 (UI/3D/Views) | **141 SLOC** (159 L) | <= 500 LOC | ✅ Đạt chuẩn |
| [`miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | Tier 2 (UI/3D/Views) | **361 SLOC** (388 L) | <= 500 LOC | ✅ Đạt chuẩn |
| [`imp435_saigon_river_and_indochine_biome.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp435_saigon_river_and_indochine_biome.test.ts) | Living Test | **420 SLOC** (471 L) | <= 600 LOC | ✅ Đạt chuẩn |

### 4.2. Danh Mục Tệp Quy Trình & Bằng Chứng (Harness & Evidence Scope)
*(Giải trình 12 tệp siêu dữ liệu kiểm soát chất lượng, hợp nhất 100% với Git Summary)*

| Tệp Quy Trình / Bằng Chứng | Phân Loại / Vai Trò | Trạng Thái |
| :--- | :--- | :---: |
| [`3D_VISUAL_REVIEW_IMP-435.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-435.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`CODE_REVIEW_IMP-435.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-435.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`PLAN_AUDIT_IMP-435.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-435.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`PLAN_CHALLENGE_IMP-435.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-435.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`SPEC_REVIEW_IMP-435.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-435.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`IMP-435.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/sentinel_probes/IMP-435.json) | Đặc tả đột biến Chaos Sentinel | ✅ Đã xác minh |
| [`bounding_box_imp-435_desktop.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-435_desktop.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`bounding_box_imp-435_mobile.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-435_mobile.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`camera_telemetry_imp-435_desktop.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-435_desktop.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`camera_telemetry_imp-435_mobile.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-435_mobile.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`chaos_sentinel_IMP-435.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-435.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`station1_IMP-435.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/station1_IMP-435.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |


---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.

### 5.1. Kê Khai Pháp Y & Tiếp Nhận Chỉ Đạo Mỹ Thuật Cho Đợt Polish Tiếp Theo (Forensic Alignment & Visual Polish Roadmap)

1. **Khớp 1:1 Đĩa vật lý (Forensic Reconciliation)**: 
   - Đã chuẩn hóa số lượng kiểm thử lên **15 atomic tests**, **44 asserts** khớp 100% giữa Bảng 2, Mục 3 Trạm 1/Trạm 2 và kết quả Vitest thực tế trên đĩa vật lý (bổ sung test case `TC-435.06c` kiểm tra frame loop của du thuyền).
2. **Sạn Thị Giác 1: Vết hằn mép cỏ (`diorama-tabletop-infill`)**: 
   - Ghi nhận vệt cung sáng tại mép cỏ nối với cao độ $Y = 0.004\text{m}$ ở phía Đông đĩa Trống Đồng. Sẽ được hạ phẳng cao độ và cân chỉnh normal/roughness tiệp màu 100% với nền cỏ xung quanh.
3. **Sạn Thị Giác 2: Hình thái Dừa cảnh hơi khẳng khiu (Spidery Palms)**: 
   - Thân cây dừa và tán dừa nhìn từ cự ly Overview Camera 43m còn hơi mảnh. Cần tận dụng Blender 5.2 để tăng độ dày thân và độ xum xuê của các tán lá quạt nhiệt đới, bổ sung hoa sứ và tiểu cảnh bonsai non bộ như Concept Art.
4. **Sạn Thị Giác 3: Hoa văn Trống Đồng bị tối dưới góc nhìn xa**: 
   - Mặt hoa văn chim Lạc và mặt trời Đông Sơn dưới đáy đĩa hơi bị chìm màu. Cần tinh chỉnh độ phản xạ kim loại (metalness / roughness) hoặc specular highlight và nướng (bake) Texture chạm nổi 3D để hoa văn bừng sáng.
5. **Sạn Thị Giác 4: Ngoại cảnh ngoài bàn cờ (Style Clash)**: 
   - Môi trường đảo hoạt hình (`CoastalIslandEnvironment`) với biển xanh lơ, bãi cát vàng và cây thông nón được cách ly hoàn toàn, chuyển giao sang đợt quy hoạch Cảnh quan Ngoại vi tiếp theo để đưa bàn cờ về mặt bàn gỗ óc chó VIP.



