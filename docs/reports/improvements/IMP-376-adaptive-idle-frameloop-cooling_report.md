# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-376
## Plan IMP-376: Adaptive Idle Frameloop Cooldown & Thermal Hardening (Ticket IMP-376)

> **Mã Ticket:** `IMP-376`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-12  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Ở các gói tối ưu trước đây, ticket IMP-364 chỉ dừng lại ở việc cache shadow pass tĩnh nhưng vẫn để Three.js frameloop chạy liên tục 60/120 FPS; trong khi IMP-361 và IMP-374 chỉ kẹp trần DPR Retina nhưng không thể hạ nhịp render khi bàn cờ đứng yên. Khi người chơi dừng lại quan sát bàn cờ hoặc đọc thẻ luật tài sản, việc GPU tiếp tục render liên tục ở tần số cao gây nóng máy, hao pin nhanh chóng và dẫn tới nghẽn nhiệt (thermal throttling).

Ticket `IMP-376` giải quyết triệt để khiếm khuyết này bằng cách kiến tạo bộ điều phối `AdaptiveIdleCoolingController` kết hợp mô hình toán học thuần khiết `idle_cooling_helpers.ts`, tự động hạ tần số render xuống 30 FPS khi không có chuyển động, phục hồi tức thì về 60 FPS khi có tương tác hoặc hoạt ảnh, bảo vệ hoạt ảnh 3D lật thẻ khí vận `EventCard3D`, khống chế trần 60 FPS trên màn hình 120Hz ProMotion, triệt tiêu rò rỉ bộ nhớ GC heap và khử khuẩn triệt để các rủi ro đầu độc số học `NaN`.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-376.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-376.md) | Thẩm định kế hoạch đạt 0 defects, 8 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp376_adaptive_idle_frameloop_cooling.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp376_adaptive_idle_frameloop_cooling.test.ts) | 16 atomic tests, 48 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-376.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-376.json) | 3 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-376_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-376_desktop.jpg) & Mobile (360x740) [`imp-376_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-376_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-376.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-376.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-376.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-376.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.00 | **APPROVED** 🛡️ |
| **Trạm 3.2: 3D Visual & Frameloop Review** | `game-3d-visual-critic`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-376.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-376.md) | Cắt giảm 50% draw calls lúc tĩnh, 1200ms grace period mượt mà, phân loại 3D modal và kẹp trần 60 FPS trên ProMotion 120Hz | **10/10 (3D AAA Verified) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 32/32 mutants mục tiêu bị tiêu diệt (15 source AST, 17 contract inversions, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 8 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity**
    - **Target reachable?**: Yes — `GameCanvas` is rendered at [src/client/main.tsx#L231](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx#L231), receiving `isMobile={isMobile}` on production mobile and desktop viewports without unreachable guards.
    - **Baselines verified?**: Yes — physical numbers verified from disk:
    - **Verdict**: PASS
  - **[ADV-01] Pointer Event Bubble Interception via `stopPropagation()` Traps Frameloop at 60 FPS Indefinitely**
    - **Vector**: Vector 3: Partial Failure & Trapped States
    - **Scenario**: In `adaptive_idle_cooling_controller.tsx`, pointer event listeners registered on `window` using standard bubble phase can be blocked by child components (`batched_board_tiles.tsx`, `event_card_3d.tsx`, `diorama_marina.tsx`, action dock buttons) calling `e.stopPropagation()` during pointer events. When `pointerup` is absorbed before reaching `window`, the pointer ID remains stranded in `activePointersRef`, locking the engine at 60 FPS permanently.
    - **Consequence**: `activePointersRef.current.size > 0` evaluates to `true` continuously, neutralizing thermal cooling after a single touch.
    - **Hardening Directive**: In [src/client/3d/adaptive_idle_cooling_controller.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_idle_cooling_controller.tsx), register `pointerdown`, `pointerup`, and `pointercancel` on `window` using `{ capture: true }` to intercept events at the root capture phase before any child can call `stopPropagation()`.
  - **[ADV-02] `NaN` Arithmetic Poisoning in `shouldRenderFrame` Freezes WebGL Rendering Loop Permanently**
    - **Vector**: Vector 3: Partial Failure & Trapped States
    - **Scenario**: In `idle_cooling_helpers.ts`, if `deltaSec` or `accumulatedDeltaSec` is ever `NaN` during WebGL context loss recovery or tab sleep/wake cycles, `Math.max(0, NaN)` produces `NaN`, causing `shouldRenderFrame` to return `NaN` accumulated delta and `false` permanently.
    - **Consequence**: `AdaptiveIdleCoolingController` permanently stops calling `gl.render(scene, camera)`, freezing the 3D scene completely.
    - **Hardening Directive**: In [src/client/3d/idle_cooling_helpers.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/idle_cooling_helpers.ts), sanitize `deltaSec` and `accumulatedDeltaSec` using `Number.isFinite()`:
      ```typescript
      const safeDelta = Number.isFinite(deltaSec) ? Math.max(0, deltaSec) : 0;
      const safeAccum = Number.isFinite(accumulatedDeltaSec) ? Math.max(0, accumulatedDeltaSec) : 0;
      const currentAccum = safeAccum + safeDelta;
      ```
  - **[ADV-03] Incomplete 3D Modal Classification Cuts 60 FPS Mid-Air for 3D Flipping Event Cards**
    - **Vector**: Vector 4: Unstated Assumptions & Subsystem Drift
    - **Scenario**: The draft plan only classified `'auction'` as an active 3D modal. In production, `'event'` mounts `EventCard3D` featuring a kinematic 3D card flip with dynamic particle sparks and mouse/touch parallax reveal. Throttling to 30 FPS mid-reveal creates visible judder.
    - **Consequence**: Visual centerpiece suffers framerate degradation mid-animation on mobile devices.
    - **Hardening Directive**: In [src/client/3d/idle_cooling_helpers.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/idle_cooling_helpers.ts), classify `'event'` as dynamic 3D motion alongside `'auction'`:
      ```typescript
      export function is3DModalActive(modal: string | null | undefined): boolean {
        if (!modal) return false;
        return modal === 'auction' || modal === 'event';
      }
      ```
  - **[ADV-04] Pawn Queue Dequeue Latency Causes Spurious Motion State Flapping**
    - **Vector**: Vector 2: Concurrency & Re-entrancy
    - **Scenario**: Between sequential pawn hops or multi-player dispatches, `activePawnAnimation` can be momentarily `null` while pending hops remain staged in `pawnAnimationQueue`.
    - **Consequence**: `isPawnAnimating` flaps between `true` and `false` during multi-waypoint movement, creating unnecessary dependency on the 1200ms grace timer.
    - **Hardening Directive**: In [src/client/3d/adaptive_idle_cooling_controller.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_idle_cooling_controller.tsx), inspect `pawnAnimationQueue` alongside `activePawnAnimation`:
      ```typescript
      const isPawnAnimating = Boolean(
        useGameStore.getState().activePawnAnimation?.isAnimating ||
        (useGameStore.getState().pawnAnimationQueue?.length ?? 0) > 0
      );
      ```
  - **[ADV-05] Heap Allocation Churn in 60 FPS Hot Path via Repeated `Object.keys()`**
    - **Vector**: Vector 4: Unstated Assumptions & Subsystem Drift
    - **Scenario**: Calling `Object.keys()` on VFX records (`activeSlams`, `activePawnReactions`) inside 60-120 FPS loops allocates 120-240 array objects per second on the V8 heap, generating GC churn.
    - **Consequence**: GC pauses counteract the CPU efficiency and thermal reduction goals of the ticket.
    - **Hardening Directive**: Replace `Object.keys()` with a zero-allocation key presence checker:
      ```typescript
      export function hasActiveDictionaryKeys(dict?: Record<string | number, unknown> | null): boolean {
        if (!dict) return false;
        for (const _ in dict) return true;
        return false;
      }
      ```

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp376_adaptive_idle_frameloop_cooling.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp376_adaptive_idle_frameloop_cooling.test.ts)
- **Chỉ số kiểm thử**: **16 atomic tests**, **48 asserts** (mật độ trung bình: 3.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.


### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/game_canvas.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx)
  - [`src/client/3d/adaptive_idle_cooling_controller.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_idle_cooling_controller.tsx)
  - [`src/client/3d/idle_cooling_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/idle_cooling_helpers.ts)
- **Chuyển trạng thái**: Toàn bộ **16/16 contract tests chuyển sang GREEN**.
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
3. **3D Visual & Frameloop Auditor (`game-3d-visual-critic`)**:
    - **Phán quyết**: **10/10 (3D AAA Verified) 🎨**
    - **Biên bản kiểm toán**: [`3D_VISUAL_REVIEW_IMP-376.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-376.md)
    - Điều tiết hạ 50% số lần gọi render khi bàn cờ đứng yên, bảo toàn độ mượt mà 60 FPS trong suốt hoạt ảnh lật thẻ 3D EventCard3D và xúc xắc/nhảy cờ qua 1200ms grace period, triệt tiêu nguy cơ quá nhiệt trên màn hình 120Hz ProMotion.



### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 32/32 mutants mục tiêu bị tiêu diệt (15 source AST mutants, 17 generic contract inversions, kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-376 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `game_canvas.tsx` | [`src/client/game_canvas.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) | Tier 2 (UI/3D/Views) | **218 SLOC** | 234 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `adaptive_idle_cooling_controller.tsx` | [`src/client/3d/adaptive_idle_cooling_controller.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_idle_cooling_controller.tsx) | Tier 2 (UI/3D/Views) | **128 SLOC** | 143 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `idle_cooling_helpers.ts` | [`src/client/3d/idle_cooling_helpers.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/idle_cooling_helpers.ts) | Tier 1 (Domain/FSM/Server) | **127 SLOC** | 145 Lines | <= 400 LOC | ✅ Đạt chuẩn |
| `r3f_test_harness.ts` | [`tests/helpers/r3f_test_harness.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/helpers/r3f_test_harness.ts) | Living Test | **169 SLOC** | 189 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `imp376_adaptive_idle_frameloop_cooling.test.ts` | [`tests/client/imp376_adaptive_idle_frameloop_cooling.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp376_adaptive_idle_frameloop_cooling.test.ts) | Living Test | **219 SLOC** | 256 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.


