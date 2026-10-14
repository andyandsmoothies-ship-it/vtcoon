# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-399
## Plan IMP-399: Bay Archipelago, 4 Corner Tycoon Sanctuaries & Mobile City Silhouette (Ticket IMP-399)

> **Mã Ticket:** `IMP-399`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-14  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Trong kiến trúc sa bàn 3D hiện tại của **VTCOON**, khi chế độ `streamlined = true` được kích hoạt trong [`CoastalIslandEnvironment`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx) để giải phóng tầm nhìn quanh bàn cờ, vùng biển vịnh bốn góc ngoài ranh giới `[-9.9m, +9.9m]` trở nên trống trải, thiếu điểm nhấn kiến trúc nhiệt đới. Đồng thời, trên thiết bị di động (`isMobile = true`), [`MiniatureCityDiorama`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) lược bỏ hoàn toàn `DioramaHighriseBlocks` và `DioramaShophouseBlocks` để bảo vệ GPU TBDR, khiến đường chân trời nội đô Sài Gòn quanh sông Sài Gòn bị phẳng và thưa thớt.

Ticket **IMP-399** triển khai Pha 1 của quy hoạch **Desktop Ultra & Mobile Parity** với 3 trụ cột kỹ thuật cốt lõi:
1. **Batched 4 Corner Tycoon Sanctuaries & Bay Archipelago (`<= 5 Draw Calls`, `0 useFrame`)**: Xây dựng module [`coastal_sanctuary_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_sanctuary_visuals.ts) sử dụng `mergeGeometries` và giải phóng bộ nhớ tạm (`.dispose()`) để hợp nhất 4 Mũi Bán Đảo Góc tại $(\pm 12.2\text{m}, -0.28\text{m}, \pm 12.2\text{m})$, 4 đảo vệ tinh vịnh biển và 12–20 cây dừa nhiệt đới thành **đúng 5 `BufferGeometry` tĩnh** (`sandBasesGeom`, `walnutDecksGeom`, `brassRimsGeom`, `isletsAndCrownsGeom`, `palmTrunksGeom`). Toàn bộ các tầng tuân thủ cắm ngập thể tích (Inter-Volume Embedding $\ge 0.02\text{m}$) và cao hơn đỉnh sóng Gerstner ($-0.248\text{m}$) nhằm triệt tiêu Z-fighting trên bộ đệm chiều sâu 16-bit.
2. **Adaptive Desktop Quality Tier (`< 8GB RAM` / iGPU - 100% Wired)**: Thiết lập hàm [`resolveDesktopQualityTier`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_sanctuary_visuals.ts#L163-L198) tự động phân tách cấu hình `MOBILE_TBDR`, `DESKTOP_BALANCED` (khi `deviceMemoryGb < 8`, `NaN` hoặc `LODLevel !== HIGH`) và `DESKTOP_ULTRA` ($\ge 8\text{GB}$ RAM), truyền trực tiếp `castSanctuaryShadows`, `deckRoughness` và `usePhysicalClearcoat` vào [`CornerTycoonSanctuaries`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx#L44-L70).
3. **Batched Mobile City Silhouette (`1 Draw Call`, `0 useFrame`, Full Exclusion Map)**: Khôi phục mật độ kiến trúc nội đô trên Mobile qua [`BatchedMobileCitySilhouette`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx#L319-L331) kết xuất 18 khối cao ốc/shophouse bằng một `InstancedMesh` duy nhất. Việc khởi tạo `InstancedBufferAttribute` cho `instanceColor`, ma trận biến đổi và `computeBoundingSphere()` được ủy quyền sang [`populateMobileCitySilhouetteInstancedMesh`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_lod_helpers.ts#L142-L167) bên trong `useIsomorphicLayoutEffect`, đảm bảo biên dịch shader `#define USE_INSTANCING_COLOR` ngay từ Frame 0 và giữ tổng dòng vật lý của `miniature_city_diorama.tsx` ở mức `383 <= 400` dòng (`TC-197.28`).

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-399.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-399.md) | Thẩm định kế hoạch đạt 0 defects, tích hợp 5 chỉ thị phản biện `[ADV-01]`..`[ADV-05]`. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts) | 8 atomic tests, 32 asserts, 0 loops. Adversarial Inversion: Đã chứng minh RED runtime | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/imp-399_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp-399_snapshot.json) | 4 production files + `FEATURE_MAP.md` cập nhật, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | [`.agents/audit/SPEC_REVIEW_IMP-399.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-399.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | [`.agents/audit/CODE_REVIEW_IMP-399.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-399.md)<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-399.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-399.md) | 0 Slop red flags, Zero TIDD, giải phóng `BufferGeometry` tạm, assertion density 4.00 | **APPROVED** 🛡️ |
| **Trạm 4: Chaos & Mutation Sentinel** | `sentinel_runner.mjs` & `check_evidence.mjs`<br>[`.agents/evidence/chaos_sentinel_IMP-399.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-399.json) | 29/29 mutants mục tiêu bị tiêu diệt (14 AST source + 15 contract, kill rate: 100%, 0 survived). | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH (AUDIT & SUBAGENT FEEDBACK)

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Đã giải tỏa toàn bộ 5 mũi tấn công kiến trúc từ [`.agents/audit/PLAN_CHALLENGE_IMP-399.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-399.md):
  - **[ADV-OBJ] Objective Validity**
    - **Scenario**: Kiểm chứng tính khả thi tại call-site (`CoastalIslandEnvironment` và `MiniatureCityDiorama`) và phát hiện giới hạn dòng thực tế trong các living test `TC-IMP30/MSS-06` (`<= 300` dòng cho `coastal_island_environment.tsx`) và `TC-197.28` (`<= 400` dòng cho `miniature_city_diorama.tsx`).
    - **Hardening Directive**: Ủy quyền việc gộp 5 `BufferGeometry` sang `coastal_sanctuary_visuals.ts` và đẩy vòng lặp khởi tạo `InstancedMesh` sang `diorama_lod_helpers.ts`.
  - **[ADV-01] Unmitigated Living Contract Regression on Raw Line Ceilings & Forbidden Source Tokens**
    - **Scenario**: Living test `TC-197.28` kiểm tra `miniature_city_diorama.tsx <= 400` dòng vật lý, `TC-IMP30/MSS-06` kiểm tra `coastal_island_environment.tsx <= 300` dòng vật lý, đồng thời cấm các token `#94A3B8`, `#FDE68A` và `sphereGeometry` trong `coastal_island_environment.tsx`.
    - **Consequence**: Vỡ cổng hồi quy nếu viết trực tiếp vòng lặp `InstancedMesh` hoặc dùng `sphereGeometry` trong file môi trường biển.
    - **Hardening Directive**: Giữ `coastal_island_environment.tsx` ở mức `268 <= 300` dòng (dùng `ConeGeometry`/`CylinderGeometry`/`BoxGeometry` gộp tĩnh) và `miniature_city_diorama.tsx` ở mức `383 <= 400` dòng.
  - **[ADV-02] Severed Presentation Wire for `getBayArchipelagoDescriptors().palms` and `DesktopQualityTierSpec`**
    - **Scenario**: Nguy cơ các trường `usePhysicalClearcoat`, `castSanctuaryShadows`, `deckRoughness` và `palmInstanceCount` chỉ được gọi trong test mà không gắn vào JSX thực tế.
    - **Consequence**: Vi phạm **Wiring Parity Invariant** và **Anti-TIDD** trong `GEMINI.md`.
    - **Hardening Directive**: Liên kết trực tiếp `castShadow={quality.castSanctuaryShadows}`, `roughness={quality.deckRoughness}`, `metalness={quality.usePhysicalClearcoat ? 0.14 : 0.05}` và số lượng cây dừa `quality.palmInstanceCount` vào `CornerTycoonSanctuaries`.
  - **[ADV-03] Unchecked Fallthrough Arithmetic on `undefined` / `NaN` `deviceMemoryGb` in `resolveDesktopQualityTier`**
    - **Scenario**: Khi trình duyệt không hỗ trợ `navigator.deviceMemory` (`undefined`) hoặc truyền giá trị `NaN`/`0`, phép so sánh số học thiếu kiểm tra `Number.isFinite` sẽ phân loại sai tier.
    - **Consequence**: Máy cấu hình thấp hoặc giá trị `NaN` bị đẩy nhầm lên `DESKTOP_ULTRA` hoặc máy bàn bị kẹt ở `DESKTOP_BALANCED`.
    - **Hardening Directive**: Kiểm tra chặt `!Number.isFinite(rawMemory) || rawMemory < 8` về `DESKTOP_BALANCED`, mặc định `8GB` khi `deviceMemoryGb === undefined`, và truyền prop `deviceMemoryGb` từ `CoastalIslandEnvironmentProps` xuống `CornerTycoonSanctuaries`.
  - **[ADV-04] Frame-0 Missing `#define USE_INSTANCING_COLOR` & Frustum Culling Disappearance in `BatchedMobileCitySilhouette`**
    - **Scenario**: Nếu khởi tạo `instanceColor` trong `useEffect` (chạy sau Frame 0) hoặc không tắt `frustumCulled` cho `InstancedMesh` gốc `[0, 0, 0]`, toàn bộ 18 tòa nhà sẽ mất màu hoặc biến mất khi camera hạ thấp ở chế độ `pawn_chase`.
    - **Consequence**: Lỗi hiển thị tòa nhà trắng trơn ở Frame 0 hoặc nhấp nháy biến mất khi lia góc máy thấp trên Mobile.
    - **Hardening Directive**: Cấp phát `InstancedBufferAttribute` ngay trong `useIsomorphicLayoutEffect`, gọi `mesh.computeBoundingSphere()` và đặt `frustumCulled={false}` (`frustumculled="false"`), `castShadow={false}`.
  - **[ADV-05] Mobile 16-Bit Depth Buffer Z-Fighting & Landmark Spatial Collisions**
    - **Scenario**: Sóng Gerstner ngoài rìa đạt đỉnh tại $Y_{\text{max}} = -0.248\text{m}$; trong nội đô Mobile đã có sẵn Nhà Thờ Đức Bà `[-4.3, 3.65]`, Bitexco `[-4.5, -4.4]`, Đồi công viên `[-2.7, -2.5]` và Cảng Đông Nam.
    - **Consequence**: Z-fighting trên bộ đệm 16-bit hoặc xuyên thủng hình khối vào các công trình biểu tượng.
    - **Hardening Directive**: Đặt mặt trên đảo vịnh tại $-0.16\text{m}$ ($> -0.248\text{m}$), khóa độ lún thể tích $\ge 0.02\text{m}$ giữa các lớp bán đảo góc, đặt đáy 18 khối nội đô tại $Y_{\text{bottom}} = 0.012\text{m}$ và giữ khoảng cách $\ge 1.0\text{m}$ tới mọi công trình biểu tượng.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts)
- **Chỉ số kiểm thử**: **8 atomic tests**, **32 asserts** (mật độ trung bình: 4.00 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**:
  - Trạng thái: **Semantic Behavioral RED Verified (8/8 kịch bản thất bại trên runtime assertion trước khi triển khai mã nguồn)**.
  - **Bằng chứng thất bại (Failure Snippet)**:
```text
AssertionError: expected [ 'MOBILE_TBDR', 'MOBILE_TBDR', …(2) ] to deeply equal [ 'DESKTOP_BALANCED', …(3) ]
```

### Trạm 2: Triển Khai Mã Nguồn Tối Thiểu (`implementer`)
- **Tệp mã nguồn thay đổi**:
  - [`src/client/3d/coastal_sanctuary_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_sanctuary_visuals.ts)
  - [`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx)
  - [`src/client/3d/diorama/diorama_lod_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_lod_helpers.ts)
  - [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
  - [`docs/FEATURE_MAP.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/FEATURE_MAP.md)
- **Chuyển trạng thái**: Toàn bộ **8/8 contract tests chuyển sang GREEN**.
- **Living Test Suites**: 100% PASS trên toàn bộ các bộ kiểm thử bảo vệ kiến trúc (`imp107`, `imp197`, `imp338`, `imp371`, `imp379`, `imp383`, `imp385`, `dense_metropolis_architecture.test.ts`, `coastal_island_environment.test.ts`, `imp80_daylight_illumination_and_unified_tile_art.test.ts`).

### Trạm 2.5: Fast Pre-Filter Mechanical Sweep (`fast_prefilter.mjs`)
- **TypeScript**: `tsc --noEmit` vượt qua với 0 lỗi (Exit Code 0).
- **Dirty Casts**: 0 `as any` hoặc ép kiểu bẩn trên toàn bộ mã nguồn và kiểm thử.
- **LOC Ceilings**: Tất cả các tệp đều nằm trong hạn mức trần của từng phân hệ và các living tests (`coastal_island_environment.tsx`: 268 dòng `<= 300`; `miniature_city_diorama.tsx`: 383 dòng `<= 400`).

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Station 3 Reviews & Dual-Viewport Evidence)
1. **Spec & Scope Gatekeeper ([`SPEC_REVIEW_IMP-399.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-399.md))**:
   - **Phán quyết**: **APPROVED** 📋 — 100% các thay đổi nằm trong phân hệ `client-3d`, zero scope creep.
2. **Deep Architecture & Anti-Slop ([`CODE_REVIEW_IMP-399.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-399.md) & [`3D_VISUAL_REVIEW_IMP-399.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-399.md))**:
   - **Phán quyết**: **APPROVED** 🛡️ — 0 violations trên 6 cờ cảnh báo Anti-Slop, giải phóng triệt để geometry tạm sau khi `mergeGeometries`, `0` đăng ký `useFrame` mới.
3. **Bằng chứng thị giác Dual-Viewport (`capture_visual_evidence.mjs --ticket IMP-399 --dual-viewport`)**:
   - **Desktop Viewport (`1280x800`)**: [`.agents/tmp/imp-399_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-399_desktop.jpg) & [`.agents/evidence/bounding_box_imp-399_desktop.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-399_desktop.json)
   - **Mobile Viewport (`360x740`)**: [`.agents/tmp/imp-399_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-399_mobile_360.jpg) & [`.agents/evidence/bounding_box_imp-399_mobile.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-399_mobile.json)

### Trạm 4: Cơ Chế Biên & Tiêu Diệt Biến Dị (`chaos-sentinel`)
- **Phán quyết**: **APPROVED 💥**
- **Hiệu quả kiểm soát**: **29/29 mutants mục tiêu bị tiêu diệt** (14 AST source mutants trên cả 4 file sản xuất và 15 contract inversions, kill rate: 100%, 0 survived).
- **Xác nhận**: Đã vượt qua kiểm toán cơ học `node scripts/check_evidence.mjs IMP-399` với 0 defects.

---

## 4. THỐNG KÊ BIẾN ĐỘNG DÒNG MÃ (LOC ACCOUNTING)

### 4.1. Phạm Vi Trực Tiếp Của Ticket IMP-399 (Direct Scope)

| Tệp Mã Nguồn | Đường Dẫn | Phân Hệ / Tier | LOC Thực Tế (SLOC) | Dòng Vật Lý (Disk) | Ngân Sách Trần | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `coastal_sanctuary_visuals.ts` | [`src/client/3d/coastal_sanctuary_visuals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_sanctuary_visuals.ts) | Tier 2 (UI/3D/Views) | **283 SLOC** | 299 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `coastal_island_environment.tsx` | [`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx) | Tier 2 (UI/3D/Views) | **244 SLOC** | 268 Lines | <= 300 Lines (`TC-IMP30/MSS-06`) | ✅ Đạt chuẩn |
| `diorama_lod_helpers.ts` | [`src/client/3d/diorama/diorama_lod_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_lod_helpers.ts) | Tier 2 (UI/3D/Views) | **155 SLOC** | 168 Lines | <= 500 LOC | ✅ Đạt chuẩn |
| `miniature_city_diorama.tsx` | [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) | Tier 2 (UI/3D/Views) | **351 SLOC** | 383 Lines | <= 400 Lines (`TC-197.28`) | ✅ Đạt chuẩn |
| `imp399_bay_archipelago_and_mobile_city_silhouette.test.ts` | [`tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp399_bay_archipelago_and_mobile_city_silhouette.test.ts) | Living Test | **220 SLOC** | 242 Lines | <= 600 LOC | ✅ Đạt chuẩn |
| `FEATURE_MAP.md` | [`docs/FEATURE_MAP.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/FEATURE_MAP.md) | SSOT Matrix | **92 SLOC** | 93 Lines | N/A | ✅ Đã đồng bộ Pillar 13 |

---

## 5. ĐÁNH GIÁ VẬN HÀNH & BÀN GIAO TIẾP THEO

- **Tính toàn vẹn hệ thống**: Gói cải tiến `IMP-399` hoàn thành trọn vẹn với đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử hợp đồng, kiểm thử đột biến AST (29/29 killed), ảnh chụp thực tế trên cả Desktop lẫn Mobile và đồng bộ hóa SSOT `docs/FEATURE_MAP.md`.
- **Sẵn sàng triển khai**: Mã nguồn đạt chuẩn **PRODUCTION READY & HARDENED**, sẵn sàng cho các pha tiếp theo của lộ trình Desktop Ultra & Mobile Parity.
