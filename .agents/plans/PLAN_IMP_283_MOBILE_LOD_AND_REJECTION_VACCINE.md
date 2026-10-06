# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-283 — Tối Ưu Hóa Dynamic LOD Sa Bàn Di Động & Tiêm Vaccine Linter SDLC (Mobile 3D Dynamic LOD Throttling & SDLC Rejection Vaccine)

> **Mã Nhiệm Vụ:** IMP-283 (Mobile 3D Dynamic LOD Throttling & SDLC Rejection Vaccine)  
> **Phân hệ mục tiêu:** `client-3d`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 45 LOC, 2 files in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `false` (3D visual & performance ticket)

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/3d/miniature_city_diorama.tsx` (320 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `src/client/3d/perf_budget.ts` (302 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `scripts/check_reason_i18n_parity.mjs` (96 lines, Tooling script) — **Safe**.
* **Target physical file**: `tests/contracts/imp283_mobile_lod_and_rejection_vaccine.test.ts` (New file to be created in Station 1/2) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (3D) | 320 | ~336 | +16 lines | Safe |
| `src/client/3d/perf_budget.ts` | Tier 1 (Server/Logic) | 302 | ~315 | +13 lines | Safe |
| `scripts/check_reason_i18n_parity.mjs` | Tooling | 96 | ~115 | +19 lines | Safe |
| `tests/contracts/imp283_mobile_lod_and_rejection_vaccine.test.ts` | Living Test | 0 | ~160 | +160 lines | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+29 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) — **MODIFY (Target 1)**: Truyền cờ `isMobile` vào `DioramaPedestrianPromenades`, `DioramaTropicalFlora`, `DioramaUrbanCanopy` để ẩn các tiểu cảnh vi mô và tắt bóng đổ castShadow trên thiết bị di động, giải phóng draw calls.
2. [`src/client/3d/perf_budget.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/perf_budget.ts) — **MODIFY (Target 2)**: Bổ sung phương thức xác định ngân sách LOD cho thiết bị di động `getDeviceLodLevel(isMobile: boolean, fps: number): LODLevel`.
3. [`scripts/check_reason_i18n_parity.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/check_reason_i18n_parity.mjs) — **MODIFY (Target 3)**: Tiêm vaccine SDLC quét tự động các chuỗi reject reason dạng raw string trong server intent dispatcher, bảo đảm 100% có mapping trong actionable notification map.
4. [`tests/contracts/imp283_mobile_lod_and_rejection_vaccine.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp283_mobile_lod_and_rejection_vaccine.test.ts) — **NEW (Target 4)**: Contract tests kiểm toán tối ưu hóa LOD di động và vaccine linter SDLC.
5. **Bảo toàn môi trường làm việc & baseline trước đó**:
   - `src/client/ui/action_dock.tsx`
   - `src/client/ui/ui_helpers.ts`
   - `src/server/intent_dispatcher.ts`
   - `tests/contracts/imp282_poka_yoke_bankrupt_hud_spectator.test.ts`
   - `tests/contracts/imp210_auto_solvency_intent.test.ts`
   - `tests/contracts/imp281_auto_solvency_semantic_resolution.test.ts`
   - `src/server/network/afk_recovery.ts`
   - `src/server/network/wss_intent_handler.ts`
   - `src/client/ui/modals/bot_trade_offer_strip.tsx`
   - `src/client/ui/modals/bot_trade_offer_modal.tsx`
   - `src/client/ui/actionable_notification.ts`
   - `src/client/ui/floating_numbers.tsx`
   - `tests/contracts/imp278_compact_floating_notifications.test.ts`
   - `tests/contracts/imp280_trade_offer_dual_dispatch_guard.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Tối Ưu Hóa Ngân Sách Render Sa Bàn Di Động (Mobile Tabletop Geometry Budgeting)
* **Hiện trạng sụt giảm FPS**: Trên màn hình di động 360px khi camera thu nhỏ ra góc nhìn toàn cảnh (Bird's Eye), toàn bộ các cụm tiểu cảnh vi mô như bồn hoa công viên, ghế đá (`DioramaPedestrianPromenades`), luống hoa (`DioramaTropicalFlora`), hồ bơi gia cư (`DioramaResidentialPool`), và bóng đổ 3 tầng của tán cây (`DioramaUrbanCanopy`) đều nằm trong frustum.
* **Giải pháp tiết giảm**:
  - Khi `isMobile === true`:
    - `DioramaPedestrianPromenades`: Bỏ qua bồn hoa và ghế đá vi mô, chỉ giữ nguyên mặt sàn lối đi chính.
    - `DioramaUrbanCanopy`: Tắt `castShadow` trên các instanced meshes tán cây (giảm tải 3 shadow map pass đắt đỏ).
    - `DioramaTropicalFlora` và `DioramaResidentialPool`: Ẩn trên mobile để tiết kiệm GPU vertex fetch.

### 1.2 Vaccine Kiểm Toán Mã Lỗi Thô (SDLC Raw Reason Linter Vaccine)
* **Cơ chế vaccine**: Script `check_reason_i18n_parity.mjs` quét regex các chuỗi `reason:\s*['"]([A-Z0-9_]+)['"]` trong `src/server/intent_dispatcher.ts`.
* **Ràng buộc**: Mọi mã reason được tìm thấy bắt buộc phải tồn tại trong `ActionRejectReason` hoặc `ACTIONABLE_NOTIFICATIONS_MAP`. Nếu có mã lỗi trôi nổi, exit 1 ngay trong pre-filter.

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Tối Ưu Hóa LOD Sa Bàn Tại `miniature_city_diorama.tsx`
* **Target physical file**: `src/client/3d/miniature_city_diorama.tsx`
* **Hành động cụ thể**:
  1. Thêm prop `isMobile?: boolean` vào `DioramaPedestrianPromenades` và `DioramaUrbanCanopy`.
  2. Trong `DioramaPedestrianPromenades`: nếu `isMobile`, bỏ qua phần render bồn hoa và ghế đá.
  3. Trong `DioramaUrbanCanopy`: nếu `isMobile`, đặt `castShadow={false}` trên các `instancedMesh`.
  4. Trong `MiniatureCityDiorama`: truyền `isMobile` vào các component con, và ẩn `DioramaTropicalFlora`, `DioramaResidentialPool` khi `isMobile === true`.

### Task 2: Mở Rộng Ngân Sách LOD Thiết Bị Tại `perf_budget.ts`
* **Target physical file**: `src/client/3d/perf_budget.ts`
* **Hành động cụ thể**:
  1. Thêm phương thức `getDeviceLodLevel(isMobile: boolean, fps: number): LODLevel`:
     - Nếu `isMobile`: trần tối đa là `MEDIUM` (khi FPS >= 50) hoặc `LOW` (khi FPS < 50).
     - Nếu không phải mobile: dùng ngưỡng mặc định (>= 54 là `HIGH`, >= 38 là `MEDIUM`, còn lại `LOW`).

### Task 3: Tiêm Vaccine Khóa Lỗi Vào `check_reason_i18n_parity.mjs`
* **Target physical file**: `scripts/check_reason_i18n_parity.mjs`
* **Hành động cụ thể**:
  1. Quét các string reject reasons trong `src/server/intent_dispatcher.ts`.
  2. Xác minh rằng tất cả các string reasons này đều có định nghĩa trong `ACTIONABLE_NOTIFICATIONS_MAP` của `src/client/ui/actionable_notification.ts`.

---

## 3. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp283_mobile_lod_and_rejection_vaccine.test.ts` (New file to be created in Station 1/2)

* TC-283.01 [UC-IMP283/MSS]: Given môi trường mobile (`isMobile: true`), When invoking getDeviceLodLevel với FPS 58, Then mức LOD trả về là `LODLevel.MEDIUM` (không vượt trần High trên mobile).
* TC-283.02 [UC-IMP283/MSS]: Given môi trường mobile (`isMobile: true`), When invoking getDeviceLodLevel với FPS 35, Then mức LOD trả về là `LODLevel.LOW`.
* TC-283.03 [UC-IMP283/MSS]: Given môi trường desktop (`isMobile: false`), When invoking getDeviceLodLevel với FPS 58, Then mức LOD trả về là `LODLevel.HIGH`.
* TC-283.04 [UC-IMP283/MSS]: Given DioramaPedestrianPromenades render với `isMobile: true`, When kiểm tra cấu trúc VDOM, Then không chứa các mesh bồn hoa và ghế đá.
* TC-283.05 [UC-IMP283/MSS]: Given DioramaUrbanCanopy render với `isMobile: true`, When kiểm tra thuộc tính instancedMesh, Then thuộc tính `castShadow` có giá trị `false`.
* TC-283.06 [UC-IMP283/MSS]: Given MiniatureCityDiorama render với `isMobile: true`, When kiểm tra cấu trúc VDOM, Then không render `DioramaTropicalFlora`.
* TC-283.07 [UC-IMP283/MSS]: Given tệp intent dispatcher, When chạy hàm kiểm toán vaccine `checkServerRejectReasonsCoverage`, Then không phát hiện bất kỳ mã lỗi unmapped nào.
* TC-283.08 [UC-IMP283/MSS]: Given chuỗi lỗi bất kỳ xuất hiện ở server, When kiểm tra mapping actionable notification, Then title tiếng Việt được trả về mà không bị rỗng.

---

## 4. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_283_MOBILE_LOD_AND_REJECTION_VACCINE.md --auto-sign`
2. **Trạm 1 (RED)**: Tạo contract test `tests/contracts/imp283_mobile_lod_and_rejection_vaccine.test.ts` chứng minh fail vì runtime assertions.
3. **Trạm 2 (GREEN)**: Thực hiện Task 1, Task 2 và Task 3 làm xanh 100% tests.
4. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/client/3d/miniature_city_diorama.tsx src/client/3d/perf_budget.ts scripts/check_reason_i18n_parity.mjs tests/contracts/imp283_mobile_lod_and_rejection_vaccine.test.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_283_MOBILE_LOD_AND_REJECTION_VACCINE.md`
5. **Chụp Dual-Viewport & Kiểm toán Bằng chứng vật lý**:
   - `node scripts/capture_visual_evidence.mjs --ticket IMP-283 --dual-viewport`
   - `npm run report -- IMP-283`
   - `node scripts/check_evidence.mjs IMP-283`
