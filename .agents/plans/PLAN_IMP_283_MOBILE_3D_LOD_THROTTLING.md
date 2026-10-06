# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-283 — Tối Ưu Hóa Dynamic LOD Sa Bàn Di Động (Mobile 3D Dynamic LOD & Performance Throttling)

> **Mã Nhiệm Vụ:** IMP-283 (Mobile 3D Dynamic LOD & Performance Throttling)  
> **Phân hệ mục tiêu:** `client-3d`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 40 LOC, 2 files in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 8 atomic tests, Pure Logic Waiver = `false` (3D visual & performance ticket)

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/client/3d/miniature_city_diorama.tsx` (319 lines, Tier 2 limit: 500 lines) — **Safe**.
* **Target physical file**: `src/client/3d/perf_budget.ts` (301 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp283_mobile_3d_lod_throttling.test.ts` (New file to be created in Station 1/2) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Tier | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (3D) | 319 | ~335 | +16 lines | Safe |
| `src/client/3d/perf_budget.ts` | Tier 1 (Server/Logic) | 301 | ~315 | +14 lines | Safe |
| `tests/contracts/imp283_mobile_3d_lod_throttling.test.ts` | Living Test | 0 | ~160 | +160 lines | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | — | **+30 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx) — **MODIFY (Target 1)**: Truyền cờ `isMobile` vào `DioramaPedestrianPromenades`, `DioramaUrbanCanopy` để ẩn các tiểu cảnh vi mô và tắt bóng đổ castShadow trên thiết bị di động, giải phóng draw calls.
2. [`src/client/3d/perf_budget.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/perf_budget.ts) — **MODIFY (Target 2)**: Mở rộng `calculateAdaptiveLOD(averageFps?: number, isMobile?: boolean): LODLevel` hỗ trợ thiết bị di động với trần thích ứng.
3. [`tests/contracts/imp283_mobile_3d_lod_throttling.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp283_mobile_3d_lod_throttling.test.ts) — **NEW (Target 3)**: Contract tests kiểm toán tối ưu hóa LOD di động và cấu trúc render sa bàn.
4. **Bảo toàn môi trường làm việc & baseline trước đó**:
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
* **Giao diện mở rộng**:
```typescript
export function calculateAdaptiveLOD(averageFps?: number, isMobile?: boolean): LODLevel {
  return LODLevel.HIGH;
}
```
* **Hiện trạng sụt giảm FPS**: Trên màn hình di động 360px khi camera thu nhỏ ra góc nhìn toàn cảnh (Bird's Eye), toàn bộ các cụm tiểu cảnh vi mô như bồn hoa công viên, ghế đá (`DioramaPedestrianPromenades`), luống hoa (`DioramaTropicalFlora`), hồ bơi gia cư (`DioramaResidentialPool`), và bóng đổ 3 tầng của tán cây (`DioramaUrbanCanopy`) đều nằm trong frustum.
* **Giải pháp tiết giảm**:
  - Khi `isMobile === true`:
    - `DioramaPedestrianPromenades`: Bỏ qua bồn hoa và ghế đá vi mô, chỉ giữ nguyên mặt sàn lối đi chính.
    - `DioramaUrbanCanopy`: Tắt `castShadow` trên các instanced meshes tán cây (giảm tải 3 shadow map pass đắt đỏ).
    - `DioramaTropicalFlora` và `DioramaResidentialPool`: Ẩn trên mobile để tiết kiệm GPU vertex fetch.

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (Mobile Frame Rate Stability)**: Khi chạy trên thiết bị di động, hệ thống giữ ngân sách Draw Call <= 60 và loại bỏ hoàn toàn các geometry vi mô < 5px trên viewport.
* **Bất biến 2 (Desktop Fidelity Preservation)**: Trên môi trường Desktop (`isMobile: false`), bảo toàn nguyên vẹn 100% chi tiết đồ họa, bồn hoa, ghế đá và hiệu ứng bóng đổ sắc nét.
* **Bất biến 3 (WCAG & Visual Continuity)**: Bàn cờ 40 ô và các quân cờ không bị ảnh hưởng bởi việc thu gọn tiểu cảnh sa bàn.

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
  1. Mở rộng `calculateAdaptiveLOD(averageFps?: number, isMobile?: boolean): LODLevel`:
     - Nếu `isMobile`: trần tối đa là `LODLevel.MEDIUM` (khi FPS >= 50) hoặc `LODLevel.LOW` (khi FPS < 50).
     - Nếu không phải mobile: dùng ngưỡng mặc định (>= 54 là `LODLevel.HIGH`, >= 38 là `LODLevel.MEDIUM`, còn lại `LODLevel.LOW`).

---

## 3. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp283_mobile_3d_lod_throttling.test.ts` (New file to be created in Station 1/2)

* TC-283.01 [UC-IMP283/MSS]: Given môi trường mobile (`isMobile: true`), When invoking calculateAdaptiveLOD với FPS 58, Then mức LOD trả về là `LODLevel.MEDIUM`.
* TC-283.02 [UC-IMP283/MSS]: Given môi trường mobile (`isMobile: true`), When invoking calculateAdaptiveLOD với FPS 35, Then mức LOD trả về là `LODLevel.LOW`.
* TC-283.03 [UC-IMP283/MSS]: Given môi trường desktop (`isMobile: false`), When invoking calculateAdaptiveLOD với FPS 58, Then mức LOD trả về là `LODLevel.HIGH`.
* TC-283.04 [UC-IMP283/MSS]: Given DioramaPedestrianPromenades render với `isMobile: true`, When kiểm tra cấu trúc VDOM, Then không chứa các mesh bồn hoa và ghế đá.
* TC-283.05 [UC-IMP283/MSS]: Given DioramaPedestrianPromenades render với `isMobile: false`, When kiểm tra cấu trúc VDOM, Then chứa đầy đủ các mesh bồn hoa và ghế đá.
* TC-283.06 [UC-IMP283/MSS]: Given DioramaUrbanCanopy render với `isMobile: true`, When kiểm tra thuộc tính instancedMesh, Then thuộc tính `castShadow` có giá trị `false`.
* TC-283.07 [UC-IMP283/MSS]: Given MiniatureCityDiorama render với `isMobile: true`, When kiểm tra cấu trúc VDOM, Then không render `DioramaTropicalFlora`.
* TC-283.08 [UC-IMP283/MSS]: Given MiniatureCityDiorama render với `isMobile: false`, When kiểm tra cấu trúc VDOM, Then render đầy đủ `DioramaTropicalFlora`.

---

## 4. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_283_MOBILE_3D_LOD_THROTTLING.md --auto-sign`
2. **Trạm 1 (RED)**: Tạo contract test `tests/contracts/imp283_mobile_3d_lod_throttling.test.ts` chứng minh fail vì runtime assertions.
3. **Trạm 2 (GREEN)**: Thực hiện Task 1 và Task 2 làm xanh 100% tests.
4. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/client/3d/miniature_city_diorama.tsx src/client/3d/perf_budget.ts tests/contracts/imp283_mobile_3d_lod_throttling.test.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_283_MOBILE_3D_LOD_THROTTLING.md`
5. **Chụp Dual-Viewport & Kiểm toán Bằng chứng vật lý**:
   - `node scripts/capture_visual_evidence.mjs --ticket IMP-283 --dual-viewport`
   - `npm run report -- IMP-283`
   - `node scripts/check_evidence.mjs IMP-283`
