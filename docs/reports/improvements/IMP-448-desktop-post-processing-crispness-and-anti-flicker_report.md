# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-448
## PLAN: IMP-448 Desktop Post-Processing Crispness & Anti-Flicker Hardening

> **Mã Ticket:** `IMP-448`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-20  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

> **Mô tả cốt lõi**: Khắc phục triệt để hiện tượng màn hình Edge Desktop bị chói lóa, nhòe mất nét và chớp chớp nhẹ theo chu kỳ 500ms khi bật hậu kỳ (`postprocessing=true`). Chuyển từ SelectiveBloom thiếu nguồn sáng sang Bloom toàn cục ngưỡng cao (2.5), tự động triệt tiêu N8AO khi phát hiện logarithmic depth để chống lỗi sập màn hình trong suốt, memoize vector tiêu cự DoF và thiết lập EffectComposer autoClear để xóa sạch bóng ma đệm khung hình.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-448.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-448.md) | Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/contracts/imp448_desktop_post_processing_crispness_and_anti_flicker.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp448_desktop_post_processing_crispness_and_anti_flicker.test.ts) | 9 atomic tests, 25 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/IMP-448_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/IMP-448_snapshot.json) | 2 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-448_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-448_desktop.jpg) & Mobile (360x740) [`imp-448_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-448_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-448.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-448.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-448.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-448.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.78 | **APPROVED** 🛡️ |
| **Trạm 3.2: 3D Visual & Spatial Review** | `game-3d-visual-critic`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-448.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-448.md) | Góc nhìn camera frustum, khoảng cách an toàn (clearance), không tràn viền màn hình 360px | **9.1 / 10 (3D AAA Verified) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 19/19 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — `PostProcessingPipeline` is imported in [`game_canvas.tsx#L21`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx#L21) and mounted at runtime in lobby ([`game_canvas.tsx#L221`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx#L221)) and in-game ([`game_canvas.tsx#L234`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx#L234)) when `isPostProcessingActive` is true (`!isMobileDevice && postprocessing !== 'false'`).
    - **Baselines verified?**: FAIL — 3 physical disk baseline contradictions and ungrounded claims identified:
      - *Unverified Baseline on `toneMappingExposure`*: Plan proposes mutating `toneMappingExposure: 1.08` -> `1.00` in [`game_canvas.tsx#L185`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx#L185). On physical disk, desktop uses `toneMapping: NoToneMapping` ([`game_canvas.tsx#L184`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx#L184)). In Three.js, `WebGLRenderer` ignores `toneMappingExposure` when `toneMapping === NoToneMapping`, making this change a dead mutation on desktop while breaking living test [`threejs_pipeline_hardening.test.ts#L124`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/threejs_pipeline_hardening.test.ts#L124) (`TC-3D.03`).
      - *Ungrounded Claim on DepthOfField `maskFunction`*: Plan claims passing `target={undefined}` disables `autoFocus` and sets `maskFunction = 3` (`MULTIPLY_RGB`). Physical inspection of [`node_modules/@react-three/postprocessing/src/effects/DepthOfField.tsx#L88`](file:///c:/Users/HP/Documents/GitHub/vtcoon/node_modules/@react-three/postprocessing/src/effects/DepthOfField.tsx#L88) reveals `effect.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA` (value 2) is assigned unconditionally. It NEVER evaluates to 3.
    - **Verdict**: FAIL — Unmitigated living test contract regressions and ungrounded shader claims.
  - **[ADV-01] [ADV-REG] Living Contract Regressions in Existing Test Suites (TC-3D.03 & TC-IMP34.19)**
    - **Vector**: Living Test Collision & Contract Regression (Vector 6)
    - **Scenario**: The plan proposes setting `toneMappingExposure: 1.00` in [`game_canvas.tsx#L185`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx#L185). Living test [`threejs_pipeline_hardening.test.ts#L124-127`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/threejs_pipeline_hardening.test.ts#L124-127) explicitly asserts:
      - it('[TC-3D.03/Boundary][UC-IMP241] toneMappingExposure được cố định là 1.08 dương hữu hạn', () => {
      - renderToStaticMarkup(React.createElement(GameCanvas, { isMobile: false }));
      - expect(capturedCanvasProps.gl.toneMappingExposure).toBe(1.08);
      - });
      - This test will immediately fail with `AssertionError: expected 1 to be 1.08`.
      - The plan proposes setting `<EffectComposer autoClear={true}>` in [`post_processing_pipeline.tsx#L375`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx#L375). Living test [`anti_aliasing_and_visual_crispness.test.ts#L205-212`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/anti_aliasing_and_visual_crispness.test.ts#L205-212) explicitly asserts:
      - it('[TC-IMP34.19/MSS][UC-IMP34] PostProcessingPipeline configures EffectComposer with multisampling and autoClear=false', () => {
      - const rendered = ActivePostProcessingPipeline({});
    - **Consequence**: Station 3 regression gates will fail exit code 1. Under the Anti-Cheat Test Integrity Invariant, the implementer is forbidden from modifying test files without explicit prior plan inclusion and sign-off.
    - **Hardening Directive**: **Retract `toneMappingExposure: 1.00`**: Preserve `toneMappingExposure: 1.08` in [`game_canvas.tsx#L185`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx#L185). Desktop uses `toneMapping: NoToneMapping` on Canvas and delegates tone mapping to the AgX pass in `PostProcessingPipeline`, so `gl.toneMappingExposure` has zero impact on desktop rendering.
      - **Explicit Living Test Migration**: Formally declare [`tests/client/anti_aliasing_and_visual_crispness.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/anti_aliasing_and_visual_crispness.test.ts) as a target file in Section 2, and update `TC-IMP34.19` to expect `autoClear === true` with the architectural justification that `autoClear=false` caused stale frame accumulation and ghosting.
  - **[ADV-02] [ADV-DOF-CHURN] DepthOfField RenderTarget Thrashing & AutoFocus Churn on Modal Toggle**
    - **Vector**: Unstated Assumptions & Subsystem Drift (Vector 4) / Concurrency & Re-entrancy (Vector 2)
    - **Scenario**: The plan specifies in Section 6:
      - passes.push(
      - <DepthOfField
      - key="dof"
      - target={enableDof ? targetVector : undefined}
      - focusRange={dofFocusRange}
      - bokehScale={enableDof ? resolvedBokehScale : 0}
      - />
      - );
      - In [`node_modules/@react-three/postprocessing/src/effects/DepthOfField.tsx#L72-90`](file:///c:/Users/HP/Documents/GitHub/vtcoon/node_modules/@react-three/postprocessing/src/effects/DepthOfField.tsx#L72-90):
      - const autoFocus = target != null
      - const effect = useMemo(() => {
      - const effect = new DepthOfFieldEffect(camera, ...)
      - if (autoFocus) effect.target = new Vector3()
      - effect.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA
      - return effect
      - }, [camera, ..., autoFocus])
      - When `enableDof` transitions from `false` to `true` (e.g. user opens a property card or auction modal), `target` flips from `undefined` to `targetVector`. `autoFocus` flips from `false` to `true`.
      - Because `autoFocus` is a dependency in `useMemo`, `useMemo` runs anew. It disposes the existing effect and allocates:
      - 6 WebGL RenderTargets (`renderTarget`, `renderTargetMasked`, `renderTargetNear`, `renderTargetFar`, `renderTargetCoC`, `renderTargetCoCBlurred`).
      - 7 render passes (`cocPass`, `blurPass`, `maskPass`, `bokehNearBasePass`, `bokehNearFillPass`, `bokehFarBasePass`, `bokehFarFillPass`).
    - **Consequence**: Violates [`threejs_pipeline_hardening.test.ts#L225`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/threejs_pipeline_hardening.test.ts#L225) (`TC-3D.19/ZeroDofChurn`: "Khi enableDof = false, DepthOfField hiện diện với bokehScale = 0"). Triggers noticeable GPU frame hitches and memory fragmentation on every modal interaction.
      - Furthermore, physical inspection proves `effect.maskFunction` is NEVER set to `MULTIPLY_RGB` (3); line 88 assigns `MULTIPLY_RGB_SET_ALPHA` (2) unconditionally.
    - **Hardening Directive**: Retain `target={targetVector}` permanently on `<DepthOfField>`. Do not conditionally pass `undefined`. Memoize `targetVector` using `useMemo` so its object reference is stable across renders. Rely on `bokehScale={enableDof ? resolvedBokehScale : 0}` and `dofFocusRange={dofFocusRange}` (which is `320.0` when DoF is off) to ensure zero blur without re-instantiating the effect or thrashing WebGL RenderTargets.
  - **[ADV-03] [ADV-UNWIRED-AO] Severed Presentation Wire & Phantom Logarithmic Depth Check in N8AO**
    - **Vector**: Closed-Loop Presentation Wire (Vector 7) / Fallthrough Logic (Vector 5)
    - **Scenario**: The plan declares INV-448.01: "When enableAo is false or logarithmic depth buffer is active, PostProcessingPipeline MUST omit or bypass the N8AO pass".
      - However, Section 6 modifies only the caller in [`game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) (`enableAo={false}`). It adds ZERO logic to [`post_processing_pipeline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx) to detect `logarithmicDepthBuffer`.
      - `DEFAULT_PIPELINE_CONFIG.enableAo` remains `true` ([`post_processing_pipeline.tsx#L59`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx#L59)).
      - If any test, future canvas, or caller instantiates `<PostProcessingPipeline />` without explicitly passing `enableAo={false}`, N8AO will execute over a logarithmic depth buffer, trigger NaN in the fragment shader under ANGLE / DirectX, and clear the screen to a cyan background.
    - **Consequence**: INV-448.01 is a dead claim at the pipeline level. Protection relies purely on human caller discipline.
    - **Hardening Directive**: In [`post_processing_pipeline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx), inspect the WebGL context capabilities inside `ActivePostProcessingPipeline`:
      - const { gl } = useThree();
      - const isLogarithmicDepth = Boolean(gl?.capabilities?.logarithmicDepthBuffer);
      - const resolvedEnableAo = enableAo && !isLogarithmicDepth;
      - Pass `isLogarithmicDepth` to `resolveAdaptivePostProcessing` or enforce `enableAo = false` whenever `isLogarithmicDepth` is detected. This hardens the protection directly into the engine facade.
  - **[ADV-04] [ADV-PARTIAL] SelectiveBloom Fallback & Emissive Glow Verification**
    - **Vector**: Partial Failure & Trapped States (Vector 3)
    - **Scenario**: [`game_canvas.tsx#L237`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx#L237) currently passes `enableSelectiveBloom={!isMobileDevice}`.
      - The plan switches this to `enableSelectiveBloom={false}`, falling back to standard `<Bloom>` with `bloomThreshold = 2.5`.
      - This successfully eliminates the lightless pass warning (`SelectiveBloom requires lights to work`) and prevents white tiles/sand from washing out.
      - However, [`TileEventAuraRim`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_event_aura.tsx) tags objects with `tagSelectiveBloom` expecting them to bloom at threshold 0.45. Under standard global bloom (threshold 2.5), standard materials will not bloom unless their emissive intensity exceeds 2.5.
    - **Consequence**: Tile event aura glow might appear visually muted or unbloomed under standard bloom if emissive peak values are below 2.5.
    - **Hardening Directive**: Verify in the contract suite and visual check that `TileEventAuraRim` meshes possess emissive intensity $\ge 2.5$ (or verify that auction mode properly lowers threshold to 1.2 via `calculateDynamicBloomThreshold`), ensuring key visual accents maintain their intended glow after SelectiveBloom is disabled.
  - **[ADV-05] [ADV-STATE] Telemetry FPS Decoupling & Child Passthrough Dead-Code**
    - **Vector**: Cross-Subsystem State Erasure & Dead-Path Lock (Vector 8)
    - **Scenario**: In [`post_processing_pipeline.tsx#L336-341`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx#L336-341):
      - <ActivePostProcessingPipeline multisampling={...} {...props}>
      - {renderPostProcessingPasses(props, targetVector, initialBloom)}
    - **Consequence**: The plan author misdiagnosed the hysteresis effect as the culprit for whole-screen pulsing, when in fact `children` bypassed the hysteresis state entirely.
    - **Hardening Directive**: Cleanly refactor `ActivePostProcessingPipeline` and `PostProcessingPipeline` so pass construction is unified and single-sourced. Remove the dead `passes` calculation in `ActivePostProcessingPipeline` when `children` is provided, and eliminate the 500ms reactive telemetry subscription `useSafeTelemetryFps()`.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/contracts/imp448_desktop_post_processing_crispness_and_anti_flicker.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp448_desktop_post_processing_crispness_and_anti_flicker.test.ts)
- **Chỉ số kiểm thử**: **9 atomic tests**, **25 asserts** (mật độ trung bình: 2.78 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected false to be true // Object.is equality
- Expected
+ Received
- true
+ false
 at tests/contracts/imp448_desktop_post_processing_crispness_and_anti_flicker.test.ts:147:39
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/game_canvas.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx)
  - [`src/client/3d/post_processing_pipeline.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx)
- **Cải tiến kiến trúc then chốt**:
  - **Thin Facade & Single-Sourced Passes (ADV-05)**: Tái cấu trúc `PostProcessingPipeline` thành thin facade 6 dòng gọn gàng, chuyển tiếp props thẳng tới `<ActivePostProcessingPipeline {...props} />`. Triệt tiêu hoàn toàn lỗi gọi kép `renderPostProcessingPasses` và cấp phát thừa `new Vector3` ở vỏ ngoài. Toàn bộ chu trình dựng pass được gom về duy nhất một nơi bên trong `ActivePostProcessingPipeline`.
  - **Khử chớp hình & Memoize tiêu cự (ADV-02)**: Cắt đứt hoàn toàn việc đăng ký reactive với FPS store `useSafeTelemetryFps()`. `targetVector` của DoF được bọc trong `useMemo` bền vững, đồng thời cấu hình `<EffectComposer autoClear={true}>` dọn sạch frame buffer chống bóng ma đệm khung hình.
  - **Tự động phòng hộ Logarithmic Depth (ADV-03)**: Phát hiện trực tiếp `gl.capabilities.logarithmicDepthBuffer` để tự động tắt N8AO (`effectiveEnableAo = false`), ngăn chặn triệt để lỗi shader `NaN` làm sập canvas trên Windows DirectX / ANGLE.
  - **Bloom toàn cục ngưỡng cao (ADV-04)**: Tắt `SelectiveBloom` không có nguồn sáng (`enableSelectiveBloom={false}`), chuyển sang Bloom chuẩn (threshold 2.5, intensity 0.20) giúp mặt bàn cờ, gạch trắng và nước biển không còn bị lóa bệt.
- **Chuyển trạng thái**: Toàn bộ **9/9 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn 72/72 tests GREEN qua 5 bộ kiểm thử kế thừa, zero hồi quy logic hiện hành.

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
    - **Phán quyết**: **9.1 / 10 (3D AAA Verified) 🎨**
   - **Pillar 0 (Macro Benchmark & World Alignment - VETO Gate): PASS (9.2 / 10)**
   - **Pillar 1 (Camera & Spatial Depth): PASS (9.0 / 10)**
   - **Pillar 2 (Lobby & Sunny Island Atmosphere): PASS (9.0 / 10)**
   - **Pillar 3 (3D Diorama & Beveled PBR): PASS (9.1 / 10)**
   - **Pillar 4 (Title Deeds & Collectible Modals): PASS (9.0 / 10)**
   - **Pillar 5 (Juicy Tactile Game HUD): PASS (9.2 / 10)**
   - **Desktop (1280x800, Score 9.2/10)**:
   - **Mobile Portrait (360x740, Score 8.9/10)**:
   - **K1 (Tone Mapping Exposure SSOT):** Retain `toneMappingExposure: 1.08` in `game_canvas.tsx` (protecting `TC-3D.03`). Do not lower exposure, as it darkens the lush island diorama.
   - **K2 (High-Threshold Global Bloom):** Retain `bloomThreshold = 2.5` and `bloomIntensity = 0.20` with `mipmapBlur={!isMobile}`. This restricts bloom strictly to specular and emissive accents without blurring white tiles or text.
   - **K3 (Logarithmic Depth AO Bypass):** Retain the `gl?.capabilities?.logarithmicDepthBuffer` guard in `ActivePostProcessingPipeline` forcing `effectiveEnableAo = false`, permanently preventing ANGLE shader NaN crashes on Windows DirectX.
   - **K4 (Zero-Churn Memoization & Clean Clearing):** Retain `useMemo` for `targetVector` on `<DepthOfField>` and `<EffectComposer autoClear={true}>` to eliminate 500ms frame strobing and stale buffer ghosting.
   - **K5 (Adaptive Frustum FOV):** Retain responsive FOV scaling ($24.0^\circ$ desktop landscape $\to 47.7^\circ$ mobile portrait) to keep board corners within safe frustum margins across all aspect ratios.



### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 19/19 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-448 (Direct Scope)

| Tệp Mã Nguồn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Ngân Sách Trần | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: |
| [`game_canvas.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) | Tier 2 (UI/3D/Views) | **238 SLOC** (254 L) | <= 500 LOC | ✅ Đạt chuẩn |
| [`post_processing_pipeline.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx) | Tier 2 (UI/3D/Views) | **332 SLOC** (368 L) | <= 500 LOC | ✅ Đạt chuẩn |
| [`imp448_desktop_post_processing_crispness_and_anti_flicker.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp448_desktop_post_processing_crispness_and_anti_flicker.test.ts) | Living Test | **193 SLOC** (225 L) | <= 600 LOC | ✅ Đạt chuẩn |
| [`anti_aliasing_and_visual_crispness.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/anti_aliasing_and_visual_crispness.test.ts) | Living Test | **200 SLOC** (226 L) | <= 600 LOC | ✅ Đạt chuẩn |
| [`imp256_selective_bloom_pipeline.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp256_selective_bloom_pipeline.test.ts) | Living Test | **291 SLOC** (337 L) | <= 600 LOC | ✅ Đạt chuẩn |
| [`threejs_pipeline_hardening.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/threejs_pipeline_hardening.test.ts) | Living Test | **251 SLOC** (288 L) | <= 600 LOC | ✅ Đạt chuẩn |
| [`r3f_test_harness.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/helpers/r3f_test_harness.ts) | Living Test | **176 SLOC** (196 L) | <= 600 LOC | ✅ Đạt chuẩn |

### 4.2. Danh Mục Tệp Quy Trình & Bằng Chứng (Harness & Evidence Scope)
*(Giải trình 13 tệp siêu dữ liệu kiểm soát chất lượng, hợp nhất 100% với Git Summary)*

| Tệp Quy Trình / Bằng Chứng | Phân Loại / Vai Trò | Trạng Thái |
| :--- | :--- | :---: |
| [`3D_VISUAL_REVIEW_IMP-448.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-448.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`CODE_REVIEW_IMP-448.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-448.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`PLAN_AUDIT_IMP-448.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-448.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`PLAN_CHALLENGE_IMP-448.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-448.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`SPEC_REVIEW_IMP-448.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-448.md) | Biên bản kiểm toán độc lập | ✅ Đã xác minh |
| [`IMP-448.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/sentinel_probes/IMP-448.json) | Đặc tả đột biến Chaos Sentinel | ✅ Đã xác minh |
| [`bounding_box_imp-448_desktop.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-448_desktop.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`bounding_box_imp-448_mobile.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-448_mobile.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`camera_telemetry_imp-448_desktop.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-448_desktop.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`camera_telemetry_imp-448_mobile.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-448_mobile.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`chaos_sentinel_IMP-448.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-448.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`imp-448_snapshot.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-448_snapshot.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |
| [`station1_IMP-448.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/station1_IMP-448.json) | Bằng chứng thực thi & snapshot | ✅ Đã xác minh |


---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.


