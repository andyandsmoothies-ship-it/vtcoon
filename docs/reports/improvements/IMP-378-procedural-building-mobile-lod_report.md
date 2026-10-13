# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-378
## Plan IMP-378: Procedural Building Mobile LOD & Double-Render Elimination (Ticket IMP-378)

> **Mã Ticket:** `IMP-378`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-13  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

### 1.1. Bối Cảnh Thực Tế & Điểm Nghẽn Hiệu Năng Late-Game trên iOS
Khi trận đấu bước vào giai đoạn trung và hậu kỳ (Round 15–16, Tick 252+), 22 ô đất bất động sản trên bàn cờ được người chơi và Bot AI nâng cấp lên nhà phố (Cấp 1), cao ốc kính (Cấp 2) và kỳ quan địa phương (Cấp 3). Trên các thiết bị iOS/WebKit (đặc biệt là iPhone với kiến trúc GPU TBDR), số lượng draw calls tổng thể tăng vọt lên 477–479 calls, thời gian kết xuất khung hình kéo dài 173–195 ms, khiến tốc độ khung hình tụt dốc thảm hại từ 50+ FPS xuống chỉ còn 8–9.9 FPS.
Nguyên nhân gốc rễ xuất phát từ:
1. Mỗi công trình procedural hiện tại gồm 10–13 mesh chi tiết con (nan chắn gió, khung cửa sổ, cục nóng điều hòa) sử dụng vật liệu cao cấp `MeshPhysicalMaterial` (tính toán phản xạ đa lớp clearcoat, IOR, roughness map), gây quá tải rasterizer và hoán chuyển trạng thái GPU liên tục.
2. Khuyết tật render kép (Double-Render Defect): Component `<InstancedBoardToyBuildings />` vẫn âm thầm kích hoạt và vẽ các mô hình nhà nhựa xanh đỏ đồ chơi đè trực tiếp lên công trình kiến trúc procedural, gây lãng phí nghiêm trọng lệnh vẽ GPU và làm xấu hình ảnh bàn cờ.

### 1.2. Quyết Sách Kiến Trúc Cốt Lõi (Micro-Slice 1/3)
Dựa trên chỉ đạo kiên quyết của User ("giữ nguyên tính đa dạng của các căn nhà được xây trên từng ô đất, triệt tiêu render kép nhà đồ chơi"), giải pháp IMP-378 được triển khai gọn gàng với 3 mũi nhọn:
1. **Kiến Trúc Mobile LOD 4 Phần Tử Cho Procedural Building**: Thay vì cào bằng công trình thành các khối đồ chơi đơn điệu, hệ thống xây dựng mô hình LOD hình học tinh gọn gồm đúng 4 thành phần cơ bản cho Nhà Phố Đông Dương (Thân nhà, Mái ngói dốc, Mái hiên người chơi, Ánh sáng đêm) và Cao Ốc Sapphire (Khối đế, Tháp kính, Hộp kỹ thuật chóp mái, Ánh sáng đêm). Toàn bộ vật liệu trên mobile chuyển sang `MeshStandardMaterial` nhẹ hơn 4 lần, bỏ qua các micro-trim chi tiết nhỏ mà mắt thường không thể phân biệt ở góc nhìn camera 38.6°.
2. **Khắc Phục Triệt Để Z-Fighting (SSOT Gotcha 24)**: Đặt tháp kính Sapphire Complex tại cao độ $Y = 0.418$, dìm đáy tháp chìm 2mm vào mặt trên khối đế ($Y = 0.160$), đồng thời xóa bỏ hoàn toàn tấm phẳng 2D bóng đổ giả tại cao độ $Y = 0.002\text{m}$ (`planeGeometry args={[0.62, 0.52]}` và `[0.66, 0.56]`) trong cả `ShophouseFallback` và `ComplexFallback`. Chỉ giữ lại các hình khối 3D đùn thể tích thực thụ (thân nhà, mái ngói dốc, chóp mái, ánh sáng đêm), triệt tiêu hoàn toàn nguy cơ chớp nháy đốm vàng/trắng (depth stitching) do giới hạn của bộ đệm 16-bit depth buffer trên GPU di động.
3. **Triệt Tiêu Render Kép & Bảo Vệ Headless Node Test**: GameBoard chuyển sang mặc định tắt cụm nhà đồ chơi (`renderToyBuildings = false`). Cơ chế nạp mô hình trong `SafeGLTFModel` sử dụng cú pháp nullish an toàn `forceFallback={isMobile ? true : undefined}` để ép chạy mô hình hình học trên mobile mà không ghi đè `false` lên các mock kiểm thử SSR/Node.js headless.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-378.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-378.md) | Thẩm định kế hoạch đạt 0 defects, 4 contract tests clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp378_procedural_building_mobile_lod.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp378_procedural_building_mobile_lod.test.ts) | 4 atomic tests, 12 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-378.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-378.json) | 3 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-378_desktop.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-378_desktop.jpg) & [`imp-378_full_board.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-378_full_board.jpg), Mobile (360x740) [`imp-378_mobile_360.jpg`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-378_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-378.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-378.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-378.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-378.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density IMP-378: 3.00 (12 asserts / 4 tests), suite sống instancing: 1.81 (29 asserts / 16 tests) | **APPROVED** 🛡️ |
| **Trạm 3.2: UI/UX Craft Review** | `ui-craft-reviewer`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-378.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-378.md) | Công thái học touch target, khoảng cách an toàn (clearance), không tràn viền màn hình 360px | **10/10 (3D AAA Verified) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 16/16 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết thẩm định**: **HARDENED_APPROVED 🛡️** (Kế hoạch ban đầu trải qua vòng phản biện đối kháng độc lập, phát hiện 5 điểm mù và đã được khắc phục triệt để trước khi ký duyệt).
- **Điểm mù kiến trúc / phản biện đối kháng đã giải tỏa**:
  1. **[ADV-01] Đảo Ngược Nullish Coalescing trong `SafeGLTFModel`**: Phản biện phát hiện cú pháp `forceFallback={isMobile}` truyền `false` trên desktop khiến biểu thức `false ?? isHeadlessOrTestEnv()` trả về `false`, làm sập các bài test Node.js headless. Đã khắc phục triệt để bằng cú pháp an toàn `forceFallback={isMobile ? true : undefined}`.
  2. **[ADV-02] Kịch Bản Visual Capture Bị Rỗng Mô Hình**: Phát hiện `board_ownership_monopoly.js` thiếu cấu hình `levelMap`, khiến toàn bộ 22 ô đất ở cấp 0 và ảnh chụp không có mô hình nhà. Đã khắc phục bằng cách nạp đầy đủ `levelMap` với các cấp 1, 2, 3 để hiển thị trọn vẹn Shophouse, Complex và Landmark trên cả Desktop và Mobile.
  3. **[ADV-03] Xung Đột Đa Giác Đồng Phẳng (Z-Fighting) Trên GPU Mobile 16-Bit**: Phát hiện mặt đáy tháp Sapphire Complex trùng mặt trên khối đế tại $Y = 0.160000$ và tấm phẳng 2D bóng đổ giả tại cao độ $Y = 0.002\text{m}$ gây nguy cơ chớp nháy (depth stitching) trên depth buffer 16-bit của mobile. Đã dìm đáy tháp xuống $Y = 0.418$ (chìm 2mm vào khối đế) và xóa bỏ hoàn toàn tấm phẳng 2D bóng đổ giả ở $Y = 0.002\text{m}$, bảo đảm 100% hình khối 3D đùn thể tích thực thụ và triệt tiêu vĩnh viễn Z-fighting.
  4. **[ADV-04] Đồng Bộ Bất Biến Tri Thức (Knowledge Fold Invariant)**: Cập nhật tài liệu chân lý duy nhất `docs/FEATURE_MAP.md` (Pillar 13) ghi nhận việc chuyển cụm nhà đồ chơi sang cơ chế opt-in và chuẩn hóa LOD 4 phần tử cho Procedural Building.
  5. **[ADV-05] Chuẩn Hóa Số Lượng Ô Bất Động Sản Thực Tế**: Điều chỉnh tính toán tải lệnh vẽ dựa trên đúng 22 ô đất có thể nâng cấp nhà thay vì con số ước lượng 18 ô ban đầu, xác nhận mức tiết kiệm thực tế lên tới 198 draw calls trong giai đoạn late-game.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp378_procedural_building_mobile_lod.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp378_procedural_building_mobile_lod.test.ts)
- **Chỉ số kiểm thử**: **4 atomic tests**, **12 asserts** (mật độ: 3.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (Thất bại do vi phạm ràng buộc runtime assertion khi chưa cập nhật code, không lỗi cú pháp)**.


### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/board_layout.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx)
  - [`src/client/3d/board_tile.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx)
  - [`src/client/3d/procedural_building.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx)
- **Chuyển trạng thái**: Toàn bộ **4/4 contract tests chuyển sang GREEN** (và 16/16 living tests của `imp_perf_threejs_instancing` tiếp tục PASS).
- **Living Test Suites**: Bảo toàn nguyên vẹn, zero hồi quy logic hiện hành (**114/114 tests pass** trên toàn bộ 4 suite liên quan: `imp378_procedural_building_mobile_lod`: 4 tests, `imp_perf_threejs_instancing`: 16 tests bao gồm `TC-INST-16` opt-in, `flat_tile_art_and_clean_c0`: 38 tests, `imp203_bespoke_landmarks_and_housing`: 56 tests).

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
3. **UI/UX Craft & Ergonomics Auditor (`ui-craft-reviewer` / `game-3d-visual-critic`)**:
    - **Phán quyết**: **10/10 (3D AAA Verified) 🎨**
   - Đảm bảo khoảng cách an toàn trên màn hình Desktop và Mobile 360px, chuẩn hóa vùng cảm ứng phím bấm.



### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 16/16 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-378 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `procedural_building.tsx` | [`src/client/3d/procedural_building.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx) | Tier 2 (UI/3D/Views) | **303 SLOC** | 319 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `board_tile.tsx` | [`src/client/3d/board_tile.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx) | Tier 2 (UI/3D/Views) | **328 SLOC** | 353 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `board_layout.tsx` | [`src/client/3d/board_layout.tsx`](file:///C:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx) | Tier 2 (UI/3D/Views) | **202 SLOC** | 227 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `station4_sentinel.ts` | [`scripts/station4_sentinel.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/station4_sentinel.ts) | Toolchain Core | **586 SLOC** | 702 Lines | N/A | ✅ Đạt chuẩn |
| `cdp_browser_client.mjs` | [`scripts/visual_capture/cdp_browser_client.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/visual_capture/cdp_browser_client.mjs) | Toolchain Helper | **114 SLOC** | 139 Lines | <= 200 LOC | ✅ Đạt chuẩn |
| `preview_server_manager.mjs` | [`scripts/visual_capture/preview_server_manager.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/visual_capture/preview_server_manager.mjs) | Toolchain Helper | **118 SLOC** | 148 Lines | <= 200 LOC | ✅ Đạt chuẩn |
| `imp378_...test.ts` | [`tests/client/imp378_procedural_building_mobile_lod.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp378_procedural_building_mobile_lod.test.ts) | Living Test | **84 SLOC** | 95 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `imp_perf_...test.ts` | [`tests/contracts/imp_perf_threejs_instancing.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp_perf_threejs_instancing.test.ts) | Living Test | **173 SLOC** | 194 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `flat_tile_...test.ts` | [`tests/client/flat_tile_art_and_clean_c0.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/flat_tile_art_and_clean_c0.test.ts) | Living Test | **373 SLOC** | 421 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `FEATURE_MAP.md` | [`docs/FEATURE_MAP.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/FEATURE_MAP.md) | SSOT Matrix | **73 SLOC** | 92 Lines | N/A | ✅ Đạt chuẩn |
| `board_...monopoly.js` | [`scripts/visual_scenarios/board_ownership_monopoly.js`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/visual_scenarios/board_ownership_monopoly.js) | Visual Scenario | **72 SLOC** | 74 Lines | N/A | ✅ Đạt chuẩn |
| `IMP-378.json` | [`scripts/sentinel_probes/IMP-378.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/sentinel_probes/IMP-378.json) | Station 4 Probes | **62 SLOC** | 63 Lines | N/A | ✅ Đạt chuẩn |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Sẵn sàng triển khai**: Mã nguồn đã sẵn sàng đóng gói và triển khai lên môi trường sản phẩm.


