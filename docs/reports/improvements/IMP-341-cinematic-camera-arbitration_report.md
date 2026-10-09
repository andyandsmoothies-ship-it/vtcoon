# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-341
## Plan IMP-341: Cinematic Camera Arbitration & Gesture Decoupling (Ticket IMP-341)

> **Mã Ticket:** `IMP-341`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-09  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Triển khai gói hoàn thiện và đồng bộ kỹ thuật cho ticket `IMP-341` thuộc phân hệ `client-3d`.

- **Mục tiêu kỹ thuật**:
  - Bảo toàn 100% logic nghiệp vụ cốt lõi và các ràng buộc FSM/Domain.
  - Phân bổ cấu trúc hiển thị tối ưu, bảo vệ trải nghiệm công thái học (ergonomics) trên cả Desktop và Mobile.
  - Tuân thủ nghiêm ngặt các ranh giới kiểm thử, Zero Dirty Casts (`as any`), và các trần giới hạn LOC.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-341.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-341.md) | Thẩm định kế hoạch đạt 0 defects, 18 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp341_camera_arbitration_engine.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp341_camera_arbitration_engine.test.ts) | 18 atomic tests, 35 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-341.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-341.json) | 3 production files modified trực tiếp (11 tệp lũy kế toàn lộ trình), 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-341_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-341_desktop.jpg) & Mobile (360x740) [`imp-341_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-341_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-341.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-341.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-341.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-341.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 1.94 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 15/15 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 18 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **[ADV-OBJ] Objective Validity & Grounding**
    - **Vector**: Trần LOC Tier 2 và Tính xác thực của lỗi Camera Fighting
    - **Hệ quả / Rủi ro**: Cảnh báo LOC 425/500 dòng ban đầu chỉ là cảnh báo mềm của `check_loc.mjs`, chưa chạm trần tử thần (500 LOC). Tuy nhiên lỗi Camera Fighting khi người dùng vừa buông tay sau cú vuốt nhẹ khiến camera bị Đạo diễn giật ngược lại về quân cờ đang nhảy là lỗi UX có thật trên thực tế.
    - **Chỉ thị gia cố**: Cho phép tiến hành triển khai engine điều phối để triệt tiêu lỗi giằng co máy quay, nhưng bắt buộc bảo vệ tính sâu của module (Deep Module) thay vì xé nhỏ nông.
  - **[ADV-01] Screen Pixels vs 3D World Space Mismatch (Deadzone Illusions)**
    - **Vector**: Giao diện trừu tượng Three.js & R3F DOM Boundary
    - **Hệ quả / Rủi ro**: `OrbitControls` không cung cấp tọa độ pixel 2D ($X, Y$) trong `onStart`/`onEnd`. Nếu cố tình gắn event listener DOM thủ công để đo `< 8px`, sẽ gây xung đột trực tiếp với click các nút bấm UI (nút Đổ xúc xắc, mua bán) và rò rỉ bộ nhớ.
    - **Chỉ thị gia cố**: Bãi bỏ đo pixel DOM 2D; định nghĩa 3 vùng cử chỉ hoàn toàn dựa trên độ lệch 3D Euclid trong không gian thế giới (`distPos`, `distTarget`) và thời gian tiếp xúc (`touchDurationMs`).
  - **[ADV-02] Grace Period Livelock & Action Preemption Failure**
    - **Vector**: Xung đột điều phối FSM & Khóa góc nhìn (Livelock)
    - **Hệ quả / Rủi ro**: Nếu cấp cứng ân hạn 800ms mà không có cơ chế đoạt quyền, camera sẽ bị đơ cứng không chịu lia về ô cờ khi có Modal mở ra, Focus Cell, Đổ xúc xắc hoặc khi quân cờ bắt đầu di chuyển.
    - **Chỉ thị gia cố**: Thiết lập Bất biến Hủy bỏ Ân hạn Tức thì (Mandatory Preemption Invariant) ngay khi `activeModal !== null`, `cameraFocusCell !== null`, `isRolling === true`, `hasTurnChanged === true`, hoặc quân cờ bắt đầu di chuyển (`isPawnMoving === true && !hasUserCustomCamera`).
  - **[ADV-03] Heap Allocation Churn trong Vòng lặp 60 FPS `useFrame`**
    - **Vector**: Garbage Collection Churn & Thermal Throttling trên Mobile WebKit
    - **Hệ quả / Rủi ro**: Tạo object params và result mỗi frame trong `useFrame` sinh ra 7.200 allocations/phút, gây áp lực GC và giật micro-stutter trên WebKit iOS.
    - **Chỉ thị gia cố**: Triển khai hàm điều phối `resolveActiveCameraDriver` nhận hoàn toàn các tham số vô hướng nguyên thủy (boolean scalars) trên hot path 60 FPS (Zero-Alloc Hot Path).
  - **[ADV-04] Cảnh Báo "Mô Đun Nông" (Shallow Module Decomposition)**
    - **Vector**: Vi phạm Gotcha VIII (Deep Module Design)
    - **Hệ quả / Rủi ro**: Tách module chỉ để bọc hàm hoặc chuyển tiếp tham số làm tăng độ phức tạp giao tiếp giữa các tầng.
    - **Chỉ thị gia cố**: Đóng gói toàn bộ logic quản lý phiên ân hạn và phân loại cử chỉ vào `camera_arbitration_engine.ts` với giao diện sâu, gọn gàng, che giấu chi tiết đồng hồ đếm và quản lý thời gian đơn điệu `performance.now()`.
  - **[ADV-05] Ngộ Nhận về "controls.update()" (False Novelty)**
    - **Vector**: Khảo sát mã nguồn hiện hữu
    - **Hệ quả / Rủi ro**: Tuyên bố thêm `controls.update()` để chống giật khi mã nguồn hiện hữu tại L385 và L404 đã gọi `controls.update()` từ trước.
    - **Chỉ thị gia cố**: Giữ nguyên các điểm đồng bộ `controls.update()` sẵn có, tập trung xử lý đúng bài toán điều phối driver.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp341_camera_arbitration_engine.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp341_camera_arbitration_engine.test.ts)
- **Chỉ số kiểm thử**: **18 atomic tests**, **35 asserts** (mật độ trung bình: 1.94 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected 'idle' to be 'user' / expected 'idle' to be 'soft_return' / expected false to be true / expected +0 to be 1800
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi trực tiếp**:
  - [`src/client/3d/camera_arbitration_engine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_arbitration_engine.ts)
  - [`src/client/3d/adaptive_cinematic_camera.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx)
  - [`src/client/3d/use_camera_gestures.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/use_camera_gestures.ts)
- **Tệp tài liệu SSOT cập nhật**:
  - [`docs/domain/gotchas/3d_cinematics.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md) (Bổ sung Gotcha 18: Camera Arbitration & Preemption Invariant)
- **Chuyển trạng thái**: Toàn bộ **18/18 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn 6 suites với **95/95 camera tests GREEN**, zero hồi quy logic hiện hành.

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
   - **Bộ nhớ & Timer**: Không rò rỉ listener, thống nhất `performance.now()`, bảo đảm Preemption Invariant khi quân cờ di chuyển.

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 15/15 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-341 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `camera_arbitration_engine.ts` | [`src/client/3d/camera_arbitration_engine.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_arbitration_engine.ts) | Tier 2 (UI/3D/Views) | **140 LOC** | <= 500 LOC | ✅ Đạt chuẩn |
| `adaptive_cinematic_camera.tsx` | [`src/client/3d/adaptive_cinematic_camera.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx) | Tier 2 (UI/3D/Views) | **448 LOC** | <= 500 LOC | ⚠️ Warning (448 > 400) |
| `use_camera_gestures.ts` | [`src/client/3d/use_camera_gestures.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/use_camera_gestures.ts) | Tier 2 (UI/3D/Views) | **266 LOC** | <= 500 LOC | ✅ Đạt chuẩn |
| `imp341_camera_arbitration_engine.test.ts` | [`tests/client/imp341_camera_arbitration_engine.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp341_camera_arbitration_engine.test.ts) | Living Test | **183 LOC** | <= 600 LOC | ✅ Đạt chuẩn |

### 4.2. Phạm Vi Lũy Kế Toàn Bộ Lộ Trình (Mobile 3D Hardening Roadmap: IMP-336 + IMP-337 + IMP-338)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `board_tile.tsx` (IMP-336) | [`src/client/3d/board_tile.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx) | Tier 2 (UI/3D/Views) | **334 LOC** | <= 500 LOC | ✅ Đạt chuẩn |
| `coastal_island_environment.tsx` (IMP-338) | [`src/client/3d/coastal_island_environment.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx) | Tier 2 (UI/3D/Views) | **236 LOC** | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_container_port.tsx` (IMP-337) | [`src/client/3d/diorama/diorama_container_port.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_container_port.tsx) | Tier 2 (UI/3D/Views) | **238 LOC** | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_marina.tsx` (IMP-337) | [`src/client/3d/diorama/diorama_marina.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_marina.tsx) | Tier 2 (UI/3D/Views) | **194 LOC** | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_perching_birds.tsx` (IMP-337) | [`src/client/3d/diorama/diorama_perching_birds.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_perching_birds.tsx) | Tier 2 (UI/3D/Views) | **267 LOC** | <= 500 LOC | ✅ Đạt chuẩn |
| `miniature_city_diorama.tsx` (IMP-337) | [`src/client/3d/miniature_city_diorama.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | Tier 2 (UI/3D/Views) | **323 LOC** | <= 500 LOC | ✅ Đạt chuẩn |
| `perf_budget.ts` (IMP-338) | [`src/client/3d/perf_budget.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/perf_budget.ts) | Tier 1 (Domain/Server/Logic) | **317 LOC** | <= 400 LOC | ⚠️ Warning (317 > 300) |
| `tropical_water.tsx` (IMP-338) | [`src/client/3d/tropical_water.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tropical_water.tsx) | Tier 2 (UI/3D/Views) | **107 LOC** | <= 500 LOC | ✅ Đạt chuẩn |
| `imp150_mobile_ios_3d_perf_hardening.test.ts` | [`tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp150_mobile_ios_3d_perf_hardening.test.ts) | Living Test | **308 LOC** | <= 600 LOC | ✅ Đạt chuẩn |
| `imp265_dual_platform_mobile_lod.test.ts` | [`tests/client/imp265_dual_platform_mobile_lod.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp265_dual_platform_mobile_lod.test.ts) | Living Test | **380 LOC** | <= 600 LOC | ✅ Đạt chuẩn |
| `imp336_mobile_webkit_thermal_hardening.test.ts` | [`tests/client/imp336_mobile_webkit_thermal_hardening.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp336_mobile_webkit_thermal_hardening.test.ts) | Living Test | **348 LOC** | <= 600 LOC | ✅ Đạt chuẩn |
| `imp337_diorama_mobile_freezing.test.ts` | [`tests/client/imp337_diorama_mobile_freezing.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp337_diorama_mobile_freezing.test.ts) | Living Test | **320 LOC** | <= 600 LOC | ✅ Đạt chuẩn |
| `imp338_ocean_overdraw_and_thermal_pacing.test.ts` | [`tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp338_ocean_overdraw_and_thermal_pacing.test.ts) | Living Test | **266 LOC** | <= 600 LOC | ✅ Đạt chuẩn |
| `phase1_pbr_beveled.test.ts` | [`tests/client/phase1_pbr_beveled.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/phase1_pbr_beveled.test.ts) | Living Test | **136 LOC** | <= 600 LOC | ✅ Đạt chuẩn |
| `adaptive_dpr_controller.test.ts` | [`tests/client/adaptive_dpr_controller.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/adaptive_dpr_controller.test.ts) | Living Test | **321 LOC** | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và bàn giao.

### Sổ Theo Dõi Nợ Kỹ Thuật (Tech Debt Watch)
- ⚠️ **Kế thừa & Giám sát trần LOC Tier 2**: Tệp [`src/client/3d/adaptive_cinematic_camera.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/adaptive_cinematic_camera.tsx) hiện đứng ở mức **448/500 LOC** (khoảng cách an toàn còn 52 dòng trước trần tử thần). Do ưu tiên bảo toàn 100% tính ổn định của 95 tests máy quay sống, mục tiêu hạ nhiệt xuống ~260 LOC chưa thực hiện trọn vẹn trong ticket này. Các ticket tiếp theo bắt buộc phải bóc tách khối hiệu ứng `checkHighStakesRoll` heartbeat và các phép toán spline sang helper độc lập.
- ⚠️ **Kế thừa trần LOC Tier 1**: Tệp [`src/client/3d/perf_budget.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/perf_budget.ts) hiện đạt **317/400 LOC** (từ ticket IMP-338). Cần duy trì giám sát khi mở rộng.

