# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET 375
## Plan IMP-375: Diorama Static Draw Call Batching & Geometry Consolidation (Ticket IMP-375)

> **Mã Ticket:** `375`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-12  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

- **Bối cảnh nghiệp vụ**: Sa bàn thành phố trung tâm (`DioramaTerrain`) trước đây khởi tạo 54 khối tĩnh riêng rẽ (37 vạch kẻ đường/vạch zebra, 4 dải vỉa hè granite, 2 mặt đại lộ, 2 nền đất và 2 thảm cỏ). Cấu trúc phân mảnh này phát sinh tới 46 draw calls riêng biệt trên luồng chính và tăng gấp đôi trong pass tính toán bóng đổ (shadow map pass), gây nghẽn cổ chai IPC nghiêm trọng trên WebKit `com.apple.WebKit.GPU` và kiến trúc TBDR của Apple Silicon / Android di động.
- **Cơ chế kỹ thuật cốt lõi & Khắc phục điểm mù**:
  1. *Gộp Geometry & Bộ Nhớ Đệm Cấp Module*: Triển khai `createBatchedTerrainGeometries()` tại `batched_diorama_terrain.tsx`, gộp 46 mesh tĩnh của Bán đảo Tây và Bán đảo Đông thành 6 `BufferGeometry` chuẩn hóa bằng ma trận dời tọa độ `applyMatrix4`. Dữ liệu được lưu trong biến singleton `cachedTerrainGeoms`, triệt tiêu hoàn toàn chi phí khởi tạo lại trên mỗi render.
  2. *Triệt Tiêu Nguy Cơ Rò Rỉ VRAM (Zero Buffer Leak)*: Hàm `mergeAndDispose` chủ động duyệt qua mảng geometry con tạm thời và gọi `.dispose()` ngay sau khi gộp thành công, giải phóng toàn bộ buffer attributes vị trí, pháp tuyến và UV khỏi bộ nhớ GPU.
  3. *Bảo Tồn 100% Hợp Đồng Sống & Chống Z-Fighting*: Nhóm lòng sông Sài Gòn (đáy sông sẫm `#0C4A6E`, mặt nước ngọc bích `#0284C7`, bọt sóng `data-testid="diorama-river-waves"`, 2 bờ kè vát nghiêng `#94A3B8`) được bảo tồn nguyên vẹn tại `diorama_terrain.tsx`. Khối đồi công viên `data-testid="diorama-park-relief"` được bảo toàn tại tọa độ `[-2.7, 0, -2.5]` với bệ đá `#64748B` và thảm cỏ `#15803D`.
  4. *Giải Tỏa Tải CPU Raycaster*: Khai báo thuộc tính `raycast={noopRaycast}` với `const noopRaycast = () => null;` (hàm callable an toàn) trên tất cả 6 mesh tĩnh, ngăn Three.js Raycaster duyệt cây BVH khi hover chuột hoặc chạm cảm ứng.
- **Hiệu quả thực tế**: Giảm 40 draw calls trên luồng kết xuất chính và ~80 draw calls trong shadow pass trên cả iOS, Android và Desktop; duy trì 55 FPS ổn định trong headless browser.

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `forensic-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-375.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-375.md)<br>[`.agents/audit/PLAN_CHALLENGE_IMP-375.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-375.md) | Thẩm định kế hoạch đạt 0 defects, 3 vòng phản biện độc lập ký duyệt, 6 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp375_diorama_static_batching.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp375_diorama_static_batching.test.ts) | 6 atomic tests, 18 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_375.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_375.json) | 2 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_375.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_375.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_375.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_375.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.00 | **APPROVED** 🛡️ |
| **Trạm 3.3: 3D Visual & Draw Call Review** | `3d-visual-critic`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-375.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-375.md) | Dual-Viewport Desktop & Mobile, 0 Z-fighting, 40 draw calls eliminated, Elevation 4.2m | **10/10 PASS 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 17/17 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean.
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  - **Auditor**: `forensic-challenger` (Independent Adversarial Auditor)
  - **Audit Rounds**: 3 Vòng Phản Biện Độc Lập (Anti-Anchor & Derivative Flaws Protocol)
  - **Nội dung kỹ thuật đã giải quyết triệt để**:
    1. *Khử Z-fighting bờ kè sông theo Phương án B*: Giữ nguyên vẹn 100% nhóm bờ kè và lòng sông Sài Gòn (đáy sông, mặt nước, bọt sóng `data-testid="diorama-river-waves"`, 2 bờ kè vát nghiêng) tại `diorama_terrain.tsx`, không để `batched_diorama_terrain.tsx` render trùng lặp gây xung đột đa giác trên GPU.
    2. *Triệt tiêu nguy cơ rò rỉ bộ nhớ VRAM*: Thay thế mã stub bằng giải thuật gộp geometry thực tế; hàm `mergeAndDispose` gọi `.dispose()` ngay lập tức trên 46 geometry con tạm thời sau khi `mergeGeometries` hoàn tất, giải phóng toàn bộ buffer attributes vị trí, pháp tuyến và UV.
    3. *Module Cache Singleton*: Biến `cachedTerrainGeoms` lưu trữ 6 geometry sau khi nướng một lần duy nhất, loại bỏ hoàn toàn chi phí khởi tạo lại trên mỗi frame render hoặc component re-mount.
    4. *Tọa độ bù trừ khối đồi công viên*: Tọa độ bù trừ thế giới của `data-testid="diorama-park-relief"` được xác định chính xác tại `[-2.7, 0, -2.5]` với bệ đá `#64748B` và thảm cỏ `#15803D`, bảo tồn trọn vẹn hợp đồng kiểm thử `chrome_pawns_and_toy_buildings.test.ts`.
    5. *Chắn Raycast an toàn*: Khai báo `raycast={noopRaycast}` với `const noopRaycast = () => null;` (hàm callable) trên cả 6 mesh tĩnh, giải tỏa tải duyệt cây BVH của Three.js Raycaster khi hover chuột.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp375_diorama_static_batching.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp375_diorama_static_batching.test.ts)
- **Chỉ số kiểm thử**: **6 atomic tests**, **18 asserts** (mật độ trung bình: 3.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.


### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/diorama/diorama_terrain.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_terrain.tsx)
  - [`src/client/3d/diorama/batched_diorama_terrain.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/batched_diorama_terrain.tsx)
- **Chuyển trạng thái**: Toàn bộ **6/6 contract tests chuyển sang GREEN**.
- **Living Test Suites**: Bảo toàn nguyên vẹn, 138/138 living tests passed, zero hồi quy logic hiện hành.

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
3. **3D Visual & Draw Call Auditor (`3d-visual-critic`)**:
    - **Phán quyết**: **10/10 PASS 🎨**
    - **Biên bản kiểm toán**: [`3D_VISUAL_REVIEW_IMP-375.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-375.md)
    - **Bằng chứng hình ảnh vật lý**:
      - Desktop HD (1280x800): [`.agents/tmp/imp-375_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-375_desktop.jpg) — Camera Elevation Y = 4.2m, Pitch 38.2°, FOV 38°, duy trì 55 FPS ổn định trong headless browser.
      - Mobile WebKit (360x740): [`.agents/tmp/imp-375_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-375_mobile_360.jpg) — Camera Elevation Y = 5.67m, Pitch 40.7°, FOV 48°.
      - **Kết luận thẩm định**: Cắt giảm 40 draw calls trên luồng chính (~80 draw calls trong shadow pass), bề mặt đại lộ `#1E293B` và ven vịnh `#334155` sắc nét, vạch kẻ zebra chuẩn xác, 0% Z-fighting.


### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 17/17 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket 375 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `diorama_terrain.tsx` | [`src/client/3d/diorama/diorama_terrain.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_terrain.tsx) | Tier 2 (UI/3D/Views) | **65 SLOC** | 72 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `batched_diorama_terrain.tsx` | [`src/client/3d/diorama/batched_diorama_terrain.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/batched_diorama_terrain.tsx) | Tier 2 (UI/3D/Views) | **117 SLOC** | 129 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp375_diorama_static_batching.test.ts` | [`tests/client/imp375_diorama_static_batching.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp375_diorama_static_batching.test.ts) | Living Test | **55 SLOC** | 67 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `r3f_test_harness.test.ts` | [`tests/helpers/r3f_test_harness.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/helpers/r3f_test_harness.test.ts) | Living Test | **48 SLOC** | 58 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `r3f_test_harness.ts` | [`tests/helpers/r3f_test_harness.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/helpers/r3f_test_harness.ts) | Living Test | **137 SLOC** | 155 Lines | <= 600 LOC | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.


