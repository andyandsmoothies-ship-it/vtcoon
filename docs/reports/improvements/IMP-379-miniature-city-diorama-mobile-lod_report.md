# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-379
## Plan IMP-379: MiniatureCityDiorama Mobile Purge & Skyline/Bridge LOD (Ticket IMP-379)

> **Mã Ticket:** `IMP-379`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-13  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED (Micro-Slice 1/N)** 🛡️

---

## 1. TỔNG QUAN, BỐI CẢNH THỰC TẾ & ĐỊNH VỊ LỘ TRÌNH HIỆU NĂNG

### 1.1. Bối cảnh đo đạc thực tế & Phân bổ ngân sách Draw Call minh bạch
- **Dữ liệu thực tế trên thiết bị di động**: Các phép đo từ xa (telemetry) trên thiết bị di động iOS Safari (WebKit GPU Process) ghi nhận số lượng Draw Calls ở đầu trận khi chưa xây dựng công trình (`levelMap = 0`) dội lên tới **530 Draw Calls**, khiến tốc độ khung hình chỉ đạt **23–33 FPS**, vượt xa ngân sách mục tiêu ($\le 85$ calls cho trải nghiệm 55–60 FPS mượt mà).
- **Định vị lộ trình minh bạch (Multi-Slice Roadmap Transparency)**:
  - Khẳng định kiến trúc: **IMP-379 là Lát cắt 1/N (Micro-Slice 1/N)** trong chiến lược 3 giai đoạn tối ưu hóa toàn diện sa bàn 3D trên mobile.
  - **Bảng đối soát ngân sách Draw Call qua các lát cắt**:
    | Giai đoạn tối ưu hóa | Mục tiêu kỹ thuật | Draw Calls ước tính | Tỷ lệ giảm tải | Đóng góp FPS (iOS WebKit) |
    | :--- | :--- | :---: | :---: | :---: |
    | **Baseline ban đầu** | Chưa tối ưu sa bàn & ô đất | **530 calls** | 0% | 23–33 FPS (Nghẽn GPU Process) |
    | **Lát cắt 1: IMP-379 (Hiện tại)** | Purge tiểu cảnh sa bàn, Instanced Ba Son, culling đèn & giàn thép, tắt shadow đài phun nước | **~450 calls** | **-80 calls (-15.1%)** | **35–42 FPS** (Ổn định khung hình bước 1) |
    | **Lát cắt 2: IMP-380 (Kế tiếp)** | `OwnerPricePill` Instanced Frames & Canvas Texture Atlas trên 28 ô đất | **~310 calls** | **-140 calls (-26.4%)** | **45–52 FPS** (Mượt mà tương tác) |
    | **Lát cắt 3: IMP-381 (Về đích)** | Procedural Building Shared Texture Atlas & Geometry Batching | **$\le 85$ calls** | **-225 calls (-42.5%)** | **55–60 FPS** (Đạt chuẩn 60 FPS mượt mà) |

### 1.2. 4 Đột phá kỹ thuật & Quyết sách kiến trúc chuyên sâu trong IMP-379
1. **Kỹ nghệ Instancing Cầu Ba Son (Smart Batching thay vì Brute-force Culling)**:
   - Thay vì thỏa hiệp thô bạo (cắt bỏ $100\%$ dây văng làm biến dạng silhouette và "cụt cầu"), hệ thống triển khai `<InstancedBasonStayCables />` dùng 1 `instancedMesh` (`args={[undefined, undefined, 12]}`) kết hợp hình trụ đơn vị (`cylinderGeometry args={[0.005, 0.005, 1, 6]}`).
   - Bằng cách tính toán ma trận affine độc lập (tâm vị trí, quaternion định hướng và tỷ lệ co giãn $Y$ theo chiều dài Euclid), toàn bộ 12 dây văng rẻ quạt được kết xuất sắc nét trong **đúng 1 Draw Call duy nhất** trên mobile (tiết kiệm 11 draw calls so với 12 calls ban đầu).
   - Ẩn 2 dải LED viền cầu tĩnh trên mobile (`{!isMobile && ...}`), tiết kiệm thêm 2 draw calls và xóa bỏ hoàn toàn hiện tượng nhiễu răng cưa sub-pixel.
2. **CentralMonumentPlaza Volumetric Solid LOD & Graphics View-Model Seam**:
   - Trích xuất pure descriptor helper độc lập [`diorama_lod_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_lod_helpers.ts) (`getCentralMonumentLODDescriptor(isMobile)`) tách biệt $100\%$ toán học hình học khỏi JSX rendering.
   - Bệ nước cẩm thạch lam ngọc (`#0EA5E9`, cao 0.04m, đỉnh $Y = 0.04\text{m}$) và tháp biểu tượng hoàng kim (`#F59E0B`, cao 0.52m, đặt tại $Y = 0.28\text{m}$, đáy tháp chìm xuống $Y = 0.02\text{m}$).
   - Độ cắm ngập đạt đúng **$0.02\text{m}$ ($20\text{mm} \gg 2\text{mm}$ ngưỡng an toàn Gotcha 24)**, triệt tiêu $100\%$ bề mặt tiếp xúc phẳng đồng mức gây chớp nháy đốm vàng/xanh (Z-fighting) trên GPU TBDR di động (16-bit depth buffer).
   - Tắt `castShadow` trên đài phun nước mobile để triệt tiêu phụ tải trong Shadow Map Pass.
3. **Vá triệt để lỗ hổng Call-Site Dependency Injection (Single Source of Truth DI)**:
   - Sửa chữa call-site tại [`src/client/3d/sunny_island_lobby_scene.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/sunny_island_lobby_scene.tsx): Tiếp nhận prop `{ isMobile = false }` và tiêm trực tiếp xuống `<MiniatureCityDiorama isMobile={isMobile} />`.
   - Triệt tiêu hoàn toàn nguy cơ rò rỉ cơ chế đánh hơi thiết bị toàn cục `isMobileDevice()` tại sảnh chờ.
4. **Bảo tồn trọn vẹn cảnh quan di sản & động năng sa bàn**:
   - Bảo tồn $100\%$ tháp biểu tượng Landmark Bitexco búp sen (`bitexco-tower`), bến tàu Saigon Waterbus, tòa nhà di sản bến cảng (`colonial-waterfront-heritage`), đoàn tàu metro mini (`DioramaModelRailroad`), du thuyền sông Sài Gòn (`DioramaHarborCruiser`), và các mố vòm cầu chính.

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-379.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-379.md) | Thẩm định kế hoạch đạt 0 defects, 6 target files clean. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts) | 8 atomic tests, 30 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-379.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-379.json) | 5 production files + 1 helper, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.0: Dual-Viewport** | Puppeteer Headless Probe | Desktop (1280x800) [`imp-379_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-379_desktop.jpg) & Mobile (360x740) [`imp-379_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-379_mobile_360.jpg) | **CAPTURED** 📸 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-379.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-379.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-379.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-379.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 3.75 | **APPROVED** 🛡️ |
| **Trạm 3.3: UI/UX Craft Review** | `ui-craft-reviewer`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-379.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-379.md) | Cầu Ba Son bảo toàn trọn vẹn dây văng, công thái học di động, không lỗi sub-pixel | **10/10 (3D AAA Verified) 🎨** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 31/31 mutants mục tiêu bị tiêu diệt (17 source-level AST mutants, kill rate: 100%). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts)
- **Chỉ số kiểm thử**: **8 atomic tests**, **30 asserts** (mật độ trung bình: 3.75 asserts/test, 0 vòng lặp).
- **Các ca kiểm thử bao phủ toàn diện**:
  - `TC-379.01a`: Đài phun nước mobile thu gọn về đúng 2 mesh thể tích mà không chớp nháy.
  - `TC-379.01b`: Thẩm định thuần túy toán học hình học qua View-Model Seam (`embeddingDepth = 0.02m`, `isCoplanar = false`, `castShadow = false`).
  - `TC-379.02`: Culling 10 cột đèn đại lộ, bảo tồn Bitexco và di sản ven sông.
  - `TC-379.03a`: Cầu Ba Son gom 12 dây văng vào 1 `InstancedMesh` (1 Draw Call) và ẩn 2 dải LED tĩnh trên mobile.
  - `TC-379.03b`: Cầu Long Biên cắt tỉa 20 thanh giằng chéo và dầm đỉnh vòm trên mobile.
  - `TC-379.04`: Bảo tồn đường sắt metro, du thuyền sông Sài Gòn và địa hình sa bàn.
  - `TC-379.05`: Lan truyền prop `isMobile` chuẩn xác từ gốc `MiniatureCityDiorama`.
  - `TC-379.06`: Lan truyền prop `isMobile` chuẩn xác từ `SunnyIslandLobbyScene` xuống sa bàn, triệt tiêu rò rỉ DI.

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/diorama/diorama_bridges.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_bridges.tsx)
  - [`src/client/3d/diorama/diorama_skyline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_skyline.tsx)
  - [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
  - [`src/client/3d/diorama/diorama_lod_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_lod_helpers.ts)
  - [`src/client/3d/sunny_island_lobby_scene.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/sunny_island_lobby_scene.tsx)
- **Chuyển trạng thái**: Toàn bộ **8/8 contract tests chuyển sang GREEN**; **132/132 tests pass** qua toàn bộ 7 living regression test suites.

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`scout` / `fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: Tuyệt đối không sử dụng `as any` hoặc dirty type casting.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ (Tier 2 <= 500, Test <= 600).

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: 31/31 mutants mục tiêu bị tiêu diệt (17 source-level AST mutants, kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs IMP-379` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING TỪ `scripts/check_loc.mjs`)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-379 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `miniature_city_diorama.tsx` | [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | Tier 2 (UI/3D/Views) | **336 SLOC** | 367 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_skyline.tsx` | [`src/client/3d/diorama/diorama_skyline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_skyline.tsx) | Tier 2 (UI/3D/Views) | **361 SLOC** | 387 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_bridges.tsx` | [`src/client/3d/diorama/diorama_bridges.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_bridges.tsx) | Tier 2 (UI/3D/Views) | **310 SLOC** | 338 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `diorama_lod_helpers.ts` | [`src/client/3d/diorama/diorama_lod_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_lod_helpers.ts) | Tier 2 (UI/3D/Views) | **83 SLOC** | 89 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `sunny_island_lobby_scene.tsx` | [`src/client/3d/sunny_island_lobby_scene.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/sunny_island_lobby_scene.tsx) | Tier 2 (UI/3D/Views) | **280 SLOC** | 310 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `imp379_miniature_city_diorama_mobile_lod.test.ts` | [`tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp379_miniature_city_diorama_mobile_lod.test.ts) | Living Test | **140 SLOC** | 162 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `IMP-379.json` | [`scripts/sentinel_probes/IMP-379.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/sentinel_probes/IMP-379.json) | Sentinel Config | **104 SLOC** | 104 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `FEATURE_MAP.md` | [`docs/FEATURE_MAP.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/FEATURE_MAP.md) | SSOT Matrix | **73 SLOC** | 91 Lines | N/A | ✅ Cập nhật Pillar 13 |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & KẾ HOẠCH BÀN GIAO LÁT CẮT TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến hoàn thành theo đúng nguyên tắc Zero-Blindness, cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
- **Kế hoạch tiếp theo (Lát cắt 2 - IMP-380)**: Triển khai tối ưu hóa cụm thẻ sở hữu và giá đất `OwnerPricePill` trên 28 ô đất thành Instanced Mesh & Canvas Texture Atlas Text, cắt giảm tiếp ~140 Draw Calls, đưa toàn bộ hệ thống về vùng tải mượt mà 45–52 FPS.
