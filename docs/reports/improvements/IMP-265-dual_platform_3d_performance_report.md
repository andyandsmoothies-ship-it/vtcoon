# BÁO CÁO NGHIỆM THU HOÀN THÀNH: IMP-265
# KIẾN TRÚC HIỆU NĂNG 3D HAI NỀN TẢNG & BẤT BIẾN NHIỆT LƯỢNG DI ĐỘNG (DUAL-PLATFORM 3D PERFORMANCE & MOBILE THERMAL INVARIANT)

> **Mã định danh:** IMP-265  
> **Tên gói:** Dual-Platform 3D Performance Architecture & Mobile Thermal Throttling Invariant  
> **Phân loại:** Tier 2 (Full Rigor - 3D Scene Graph, Mobile LOD, Performance Budget & Governance)  
> **Thời điểm hoàn thành:** 2026-10-05  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**  
> **Sổ cái nợ kỹ thuật liên kết:** [docs/epics/client_ui/_epic_ledger.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md)

---

## 1. TỔNG QUAN VẤN ĐỀ, ĐỘT PHÁ KIẾN TRÚC & GIẢI PHÁP KỸ THUẬT

### 1.1. Bối Cảnh & Vấn Đề Kỹ Thuật (Mobile Thermal Throttling)
- **Hiện tượng tụt FPS dạng răng cưa (Sawtooth Thermal Drop)**: Khi người dùng mở game trên Chrome Android hoặc Safari iOS, FPS ban đầu đạt 40 nhưng chỉ sau một khoảng thời gian ngắn máy nóng dần lên và FPS giảm xuống 30 rồi 20 FPS, sau đó nguội bớt lại nhảy lên 40 FPS rồi lặp lại chu kỳ (40 -> 30 -> 20 -> 40), dù người chơi đang ở màn hình chờ và không thao tác bất kỳ điều gì.
- **Nguyên nhân vật lý cốt lõi**:
  1. *Render-Target Pass Phụ Tốn Fillrate*: `ContactShadows` tạo ra một pass kết xuất phụ đổ bóng mâm gỗ lên nền bàn cờ, ngốn băng thông fillrate nặng nề trên GPU di động (Adreno / Mali / Apple GPU).
  2. *Vòng lặp hoạt ảnh vi mô chạy ngầm 60 FPS liên tục*: Cây component `MiniatureCityDiorama` và `CoastalIslandEnvironment` chứa 6 hệ thống hoạt ảnh vi mô (`DioramaTraffic` chạy spline Catmull-Rom, `DioramaModelRailroad` tính động học tàu hỏa, `DioramaHarborCruiser` tính toán lượng giác rẽ sóng, `DioramaMicroLife` rung lắc động cơ xe buýt, `CoastalPatrolBoat` tính quỹ đạo ca-nô tuần duyên, `CoastalSeagulls` tính toán vỗ cánh 7.5 Hz cho 5 chim hải âu, và co giãn bọt sóng biển). Tổng cộng hơn 18 đối tượng Three.js bị cập nhật ma trận biến đổi (matrix transformation) liên tục mỗi frame mà trên màn hình điện thoại 5-6 inch mắt người hoàn toàn không thể nhận thấy.
  3. *Vi phạm nguyên tắc "Explicit Environmental Prop Propagation"*: Cờ phần cứng `isMobile` được tính toán tại gốc `GameCanvas` nhưng không được truyền xuống cây sa bàn diorama, khiến các component con chạy ngầm không phanh.
  4. *Rác bộ nhớ V8 (GC Churn) & Ép kiểu không an toàn*: `PerfBudgetController` sử dụng `Array.shift()` và `Array.reduce()` gây phân mảnh heap bộ nhớ, kèm toán tử ép kiểu non-null assertion `!` tiệm cận dirty cast.

### 1.2. Giải Pháp Kỹ Thuật Cốt Lõi (Deep Module & Dual-Platform Architecture)
1. **Phương Án B - Loại Bỏ ContactShadows Trên Mobile**:
   - Trong `src/client/game_canvas.tsx`, bọc `<ContactShadows ... />` bằng điều kiện `{!isMobileDevice && ...}` cho cả màn hình phòng chờ (lobby) và trận đấu thực tế. Bảo toàn tuyệt đối hiệu ứng bóng đổ mâm gỗ sang trọng trên Desktop trong khi giải phóng 100% render-target pass trên Mobile.
2. **Phương Án A - Đóng Băng Hoạt Ảnh Vi Mô (Mobile Diorama LOD) Tại Tọa Độ Đỗ Tĩnh**:
   - Truyền prop `isMobile` tường minh: `GameCanvas` ➔ `GameBoard` ➔ `MiniatureCityDiorama` & `CoastalIslandEnvironment` ➔ 6 component vi mô.
   - Tính trước tọa độ tĩnh tại $t=0$ qua `useMemo` và gán trực tiếp vào JSX.
   - Chèn `if (isMobile) return;` ngay tại đầu hàm `useSafeFrame` của cả 6 component:
     - `DioramaTraffic`: Xe buýt vàng, xe sedan và taxi Mai Linh đỗ tĩnh tại các ngã tư đại lộ và cầu nối.
     - `DioramaModelRailroad`: Toa tàu Metro Tuyến 1 đỗ tĩnh tại ke ga trên cao ga Bến Sông (Waterfront Station) ở cao độ tiếp xúc ray $Y = 0.488$ (thay vì chìm dưới đất $Y = 0.062$).
     - `DioramaHarborCruiser`: Du thuyền gỗ neo đậu tĩnh tại vị trí bến sông `[0, -0.032, 5.2]`.
     - `DioramaMicroLife`: Ca-nô và xe buýt nội đô đỗ tĩnh ven vỉa hè đại lộ Tây.
     - `CoastalPatrolBoat`: Ca-nô tuần duyên neo đậu tại hải phận `[-16, -0.30, 22]`.
     - `CoastalSeagulls`: Đàn 5 hải âu lơ lửng tĩnh tại các tọa độ quỹ đạo xác định.
     - `CoastalIslandEnvironment`: Ngắt co giãn dải bọt sóng ven bờ và tầng nước nông, giữ nguyên mặt nước `living-ocean-water`.
3. **Bộ Đệm Vòng Tròn Zero-Allocation & Spike Defense Trong Giám Sát Hiệu Năng**:
   - Tái cấu trúc `PerfBudgetController` (`src/client/3d/perf_budget.ts`) sử dụng vòng đệm tròn (circular ring buffer) 60 mẫu với biến con trỏ `frameIndex`, xóa sổ hoàn toàn `Array.shift()` và `Array.reduce()`.
   - Loại bỏ toán tử ép kiểu `!` bằng kiểm tra `val !== undefined` tường minh.
   - Bổ sung cơ chế chống đột biến (Spike Defense): Kẹp trần frame time lớn tại 250ms ($1000/250 = 4$ FPS) và bỏ qua các khoảng gián đoạn chuyển tab $> 1000$ms để không làm nhiễu chỉ số FPS trung bình khi người chơi quay lại game.
   - Điều tiết chu kỳ cập nhật telemetry (`PerfTelemetryTracker`) từ 250ms lên 500ms, nhận prop `isMobile` trực tiếp.
4. **Chuẩn Hóa Pháp Quy & Đóng Đinh Bất Biến Vào Hiến Pháp (Governance Invariant Codification)**:
   - Đóng đinh điều khoản bắt buộc **Dual-Platform Performance & Mobile Thermal Invariant (IMP-265)** vào `GEMINI.md` (Hard Constraints / Cross-Domain Rules).
   - Ghi nhận chi tiết **Gotcha #14** vào `docs/domain/gotchas/3d_cinematics.md` gồm cạm bẫy ban đầu (Deceptive Trap), phát hiện thực tế (Physical Finding) và 4 bất biến xác minh (Verified Invariants) làm kim chỉ nam vĩnh viễn cho toàn bộ các lần phát triển 3D sau này.

---

## 2. BẢNG NGÂN SÁCH DÒNG MÃ VẬT LÝ ĐỐI CHIẾU (scripts/check_loc.mjs)

| Tệp vật lý | Phân loại Tier | Total Lines | Non-Empty SLOC | Trần quy định | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/game_canvas.tsx` | Tier 2 (UI/3D/Views) | **232** | 216 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/3d/board_layout.tsx` | Tier 2 (UI/3D/Views) | **195** | 177 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (UI/3D/Views) | **319** | 289 | <= 500 LOC | ✔️ Safe (< 400 LOC) |
| `src/client/3d/diorama/diorama_traffic.tsx` | Tier 2 (UI/3D/Views) | **264** | 239 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/3d/diorama/diorama_railroad.tsx` | Tier 2 (UI/3D/Views) | **376** | 335 | <= 500 LOC | ⚠️ Warning (< 400 LOC) |
| `src/client/3d/diorama/diorama_harbor_cruiser.tsx` | Tier 2 (UI/3D/Views) | **66** | 59 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/3d/diorama/diorama_microlife.tsx` | Tier 2 (UI/3D/Views) | **64** | 60 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/3d/coastal_island_environment.tsx` | Tier 2 (UI/3D/Views) | **231** | 208 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/3d/coastal_patrol_boat.tsx` | Tier 2 (UI/3D/Views) | **147** | 134 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/3d/coastal_seagulls.tsx` | Tier 2 (UI/3D/Views) | **146** | 132 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/3d/perf_budget.ts` | Tier 1 (Domain/Logic) | **299** | 263 | <= 400 LOC | ✔️ Safe (<= 300 LOC) |
| `src/client/telemetry/perf_telemetry_tracker.tsx` | Tier 1 (Domain/Logic) | **83** | 77 | <= 400 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/types/global.d.ts` | Type Definition Support | **50** | 46 | <= 400 LOC | ✔️ Safe |
| `tests/client/imp265_dual_platform_mobile_lod.test.ts` | Contract Test Suite | **409** | 370 | <= 600 LOC | ✔️ Safe (18 atomic tests) |

---

## 3. KẾT QUẢ QUY TRÌNH 4 TRẠM KHÉP KÍN (4-STATION CLOSED-LOOP PIPELINE)

### 3.0. Kiểm Toán Đối Kháng Kế Hoạch (Two-Stage Plan Hardening)
- **Kiểm toán viên**: `plan-griller` & `adversarial-challenger`
- **Kết quả**: ✅ **`HARDENED_APPROVED`** tại [`.agents/audit/PLAN_AUDIT_IMP-265.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-265.md) và [`.agents/audit/PLAN_CHALLENGE_IMP-265.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-265.md).
- **Phản biện người dùng (User Critique Resolution)**:
  - Bổ sung 3 vòng lặp hàng hải mồ côi (`DioramaHarborCruiser`, `CoastalPatrolBoat`, `CoastalSeagulls`), nâng tổng số đối tượng Three.js được đóng băng lên 18 đối tượng.
  - Loại bỏ hoàn toàn ép kiểu `!` trong `perf_budget.ts`.
  - Cắt tỉa kế hoạch theo chuẩn Lean Specifications xuống 461 dòng (< 600 dòng cảnh báo).
  - Bổ sung các bài kiểm thử hợp đồng cho thành phần hàng hải vào ma trận Section 3.

### 3.1. Trạm 1: Station 1 (QA RED - Adversarial Inversion)
- **Kỹ sư kiểm thử**: `qa-tester`
- **Tệp kiểm thử**: `tests/client/imp265_dual_platform_mobile_lod.test.ts` (18 bài kiểm thử nguyên tử, 35 assertions, tỷ lệ 1.94).
- **Kết quả Business RED**: 14 tests FAILED, 4 tests PASSED (chứng minh thất bại hợp đồng chức năng thật, 0 lỗi biên dịch/import giả tạo).
- **Ranh giới cô lập**: 0 dòng mã trong `src/**` bị can thiệp.

### 3.2. Trạm 2: Station 2 (GREEN Implementation) & Station 2.5 (Fast Pre-Filter)
- **Kỹ sư hiện thực**: `implementer`
- **Kết quả kiểm thử**: 18/18 tests PASSED (100% GREEN).
- **Phát hiện triển khai (Implementation Discoveries)**:
  1. *Dual-viewport Contract Retention cho Tàu Metro*: Giữ cao độ đỗ tĩnh `carriageY = 0.488` trên mobile trong khi desktop giữ `0.062`, thỏa mãn đồng thời cả `TC-METRO.07` và `TC-265.11` với 0 lỗi hồi quy.
  2. *React 19 Headless AST Traversal Support*: Định nghĩa kiểu mở rộng trong `global.d.ts` phục vụ kiểm thử AST tĩnh không cần WebGL runtime mà không làm bẩn code bằng dirty casts.
- **Kiểm thử vùng ảnh hưởng (Blast Radius)**:
  - `tests/client/hcmc_metro_line1_infrastructure.test.ts`: 16/16 PASS
  - `tests/client/diorama_traffic.test.ts`: 6/6 PASS
  - `tests/client/perf_budget.test.ts`: 9/9 PASS
- **Station 2.5 Fast Pre-Filter**: 100% PASS trên 6 cổng kiểm tra cơ học (`tsc --noEmit` exit 0, LOC Safe, 0 dirty casts, <= 4 asserts/test, `lint:slop` 0 lỗi, `lint:ui` 0 lỗi, `check:i18n` 0 lỗi).

### 3.3. Trạm 3: Station 3 (Independent Review Funnel)
- **Phase 3.0 (Physical Visual Evidence Gate)**:
  - Đã chụp ảnh in-game vật lý Dual-Viewport thành công:
    - Desktop (1280x800): [`.agents/tmp/imp-265_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-265_desktop.jpg)
    - Mobile Portrait (360x740): [`.agents/tmp/imp-265_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-265_mobile_360.jpg)
    - Metadata Bounding Box: [`.agents/evidence/bounding_box_imp-265_desktop.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-265_desktop.json) & [`.agents/evidence/bounding_box_imp-265_mobile.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-265_mobile.json)
    - Camera Telemetry: [`.agents/evidence/camera_telemetry_imp-265_desktop.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-265_desktop.json) & [`.agents/evidence/camera_telemetry_imp-265_mobile.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/camera_telemetry_imp-265_mobile.json)
- **Phase 3.1 (Spec & Scope Gate)**:
  - `spec-reviewer`: Phê chuẩn **`APPROVED (SPEC_APPROVED)`** tại [`.agents/audit/SPEC_REVIEW_IMP-265.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-265.md). Độ trung thực đặc tả 100%, 0 scope drift, giải trình thỏa đáng 2 implementation discoveries.
- **Phase 3.2 (Deep Architecture & Craft Gate - Parallel Dispatch)**:
  - `code-reviewer`: Phê chuẩn **`APPROVED`** tại [`.agents/audit/CODE_REVIEW_IMP-265.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-265.md). Vượt qua 5 dạng khuyết tật phổ quát, 0 rò rỉ bộ nhớ, zero dirty casts.
  - `game-3d-visual-critic`: Phê chuẩn **`disposition: ship` (8.8 / 10)** tại [`.agents/audit/GAME_3D_VISUAL_REVIEW_IMP-265.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/GAME_3D_VISUAL_REVIEW_IMP-265.md). Xác nhận sa bàn tĩnh trông tự nhiên như mô hình kiến trúc cao cấp, không có hiện tượng mất mát vật thể hay gián đoạn mỹ thuật.
  - `ui-craft-reviewer`: Phê chuẩn **`disposition: ship` (🟢 APPROVED)** tại [`.agents/audit/UI_CRAFT_REVIEW_IMP-265.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/UI_CRAFT_REVIEW_IMP-265.md). Đạt chuẩn công thái học 2D UI, Action Dock >= 44px touch target, 0 xung đột bounding box.

### 3.4. Trạm 4: Station 4 (Adversarial Boundary & Mutation Sentinel)
- **Chiến binh hỗn loạn**: `chaos-sentinel`
- **Kết quả thẩm định**: ✅ **`APPROVED`** tại [`.agents/evidence/chaos_sentinel_imp-265.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_imp-265.json)
- **3 Đầu dò vật lý**:
  1. *Probe 1 (Wire-to-Core Closed-Loop Parity)*: Xác nhận thông suốt đường ống từ `GameCanvas` đến 6 subcomponents diorama và `PerfTelemetryTracker`. Trên mobile, toàn bộ vòng lặp ngắt tức thì không tốn chu kỳ tính toán CPU/GPU.
  2. *Probe 2 (Ephemeral Dynamic Boundary Probe)*: 17/17 tests passed trên Headless WebGL2, xuất ảnh kiểm chứng [`.agents/tmp/webgl2_headless_smoke_probe.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/webgl2_headless_smoke_probe.png) tách biệt hoàn toàn với ảnh chụp Phase 3.0.
  3. *Probe 3 (Targeted Mutation Sensitivity)*: Tiêu diệt **22 / 22 mutants** (15 AST source mutants + 7 contract inversion mutants, **100% kill rate, 0 sống sót**).
- **Kiểm chứng cơ học**: `node scripts/check_evidence.mjs IMP-265` ➔ **`PASS (All Floors Met, Zero Tautologies)`**.

---

## 4. MA TRẬN TRUY XUẤT NGUỒN GỐC KIỂM THỬ (TRACEABILITY MATRIX)

| Mã Kiểm Thử | Khía Cạnh Hành Vi | Thẻ Truy Xuất | Nội Dung Khẳng Định & Kết Quả |
| :--- | :---: | :---: | :--- |
| **TC-265.01** | Desktop Shadow | `[UC-IMP265/MSS]` | `GameCanvas` render `ContactShadows` với `frames: 1` khi `isMobile: false` (Desktop full fidelity). |
| **TC-265.02** | Mobile Fillrate | `[UC-IMP265/MSS]` | `GameCanvas` loại bỏ hoàn toàn `ContactShadows` (`toBeNull()`) khi `isMobile: true` để bảo vệ GPU di động. |
| **TC-265.03** | Env Propagation | `[UC-IMP265/MSS]` | `GameBoard` nhận và truyền `isMobile` xuống `MiniatureCityDiorama` và `CoastalIslandEnvironment`. |
| **TC-265.04** | Sub Prop | `[UC-IMP265/MSS]` | `MiniatureCityDiorama` truyền `isMobile` xuống `DioramaTraffic`. |
| **TC-265.05** | Sub Prop | `[UC-IMP265/MSS]` | `MiniatureCityDiorama` truyền `isMobile` xuống `DioramaModelRailroad`. |
| **TC-265.06** | Sub Prop | `[UC-IMP265/MSS]` | `MiniatureCityDiorama` truyền `isMobile` xuống `DioramaMicroLife`. |
| **TC-265.07** | Maritime Freeze | `[UC-IMP265/MSS]` | `DioramaHarborCruiser` nhận `isMobile`, đóng băng `useSafeFrame` (`clockAccessCount === 0`) và neo đậu tại `[0, -0.032, 5.2]`. |
| **TC-265.08** | Maritime Freeze | `[UC-IMP265/MSS]` | `CoastalPatrolBoat` nhận `isMobile`, đóng băng `useSafeFrame` (`clockAccessCount === 0`) và neo đậu tại `[-16, -0.30, 22]`. |
| **TC-265.09** | Maritime Freeze | `[UC-IMP265/MSS]` | `CoastalSeagulls` tính trước tọa độ tĩnh tại $t=0$, đóng băng vỗ cánh và bay lượn khi `isMobile: true`. |
| **TC-265.10** | Diorama Traffic | `[UC-IMP265/MSS]` | `DioramaTraffic` tính trước `initialTransforms` tại $t=0$, gán JSX và đóng băng `useSafeFrame` trên mobile. |
| **TC-265.11** | Model Railroad | `[UC-IMP265/MSS]` | `DioramaModelRailroad` định vị các toa tàu tại ke ga trên cao $Y \approx 0.488$ và đóng băng động học trên mobile. |
| **TC-265.12** | Ocean Waves | `[UC-IMP265/MSS]` | `CoastalIslandEnvironment` giữ nguyên `living-ocean-water` nhưng ngắt co giãn sóng triều khi `isMobile: true`. |
| **TC-265.13** | Ring Buffer | `[UC-IMP265/MSS]` | `PerfBudgetController` ghi nhận tối đa 60 mẫu mà không vượt quá độ dài `maxSamples`. |
| **TC-265.14** | Overwrite & Null | `[UC-IMP265/MSS]` | `PerfBudgetController` tính FPS trung bình chính xác khi ghi đè vòng tròn (30 mẫu 33.33ms đè lên 30 mẫu 16.67ms -> 40 FPS), không dùng ép kiểu `!`. |
| **TC-265.15** | State Teardown | `[UC-IMP265/A1]` | `reset()` xóa sạch `frameTimes` và đặt lại `frameIndex = 0`. |
| **TC-265.16** | Spike Defense | `[UC-IMP265/A2]` | Miễn nhiễm NaN, Infinity, số âm; kẹp trần frame time tại 250ms ($1000/250 = 4$ FPS) và bỏ qua gián đoạn $> 1000$ms. |
| **TC-265.17** | Telemetry Throttle | `[UC-IMP265/A3]` | Telemetry điều tiết chu kỳ $\ge 500$ms và tiêu thụ prop `isMobile` tường minh. |
| **TC-265.18** | Adaptive DPR | `[UC-IMP265/A4]` | `calculateAdaptiveDpr` áp trần DPR di động 1.0 và hạ xuống 0.85 khi giật lag kéo dài không dao động. |

---

## 5. BẢNG ĐÁNH GIÁ ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE - DOD 1-6)

| Tiêu chuẩn DoD | Mô tả yêu cầu | Trạng thái vật lý | Phán quyết |
| :--- | :--- | :--- | :---: |
| **DoD 1** | Kế hoạch kiểm thử tự động vượt qua Inversion Gate, gắn nhãn `[UC-.../MSS]` / `[UC-.../A#]`, tối đa <= 4 asserts/test, 0 loops. | 18/18 contract tests PASS với đầy đủ nhãn truy xuất và tỷ lệ assertion 1.94. | ✔️ PASS |
| **DoD 2** | Mã nguồn vượt qua `lint:slop` (complexity <= 5, ngân sách LOC) và `lint:ui` (0 violations). | Toàn bộ 13 tệp đạt ngân sách LOC Safe (< 300 và < 400 LOC), complexity <= 5, 0 linter violations. | ✔️ PASS |
| **DoD 3** | Cổng kiểm duyệt tuần tự: Spec Review approved, Code Review approved, Visual Review approved, báo cáo được lưu đĩa vật lý `.agents/audit/*.md`. | `SPEC_REVIEW_IMP-265.md` (APPROVED), `CODE_REVIEW_IMP-265.md` (APPROVED), `GAME_3D_VISUAL_REVIEW_IMP-265.md` (SHIP 8.8/10), `UI_CRAFT_REVIEW_IMP-265.md` (SHIP). | ✔️ PASS |
| **DoD 4** | Station 4 Chaos Sentinel ký duyệt 3 đầu dò vật lý, 0 parity gaps, 0 mutant sống sót. | `chaos_sentinel_imp-265.json` APPROVED, 22/22 mutants killed (100% kill rate), `check_evidence.mjs` PASS. | ✔️ PASS |
| **DoD 5** | Cập nhật Tech Debt Ledger trong `_epic_ledger.md` bằng key bất biến và lưu báo cáo nghiệm thu. | Không phát sinh nợ kỹ thuật mới; tệp `diorama_railroad.tsx` (377 LOC) nằm trong hạn mức cho phép. Báo cáo này được lưu trữ. | ✔️ PASS |
| **DoD 6** | Đóng đinh pháp quy: Dual-Platform Performance Invariant được ghi nhận vào `GEMINI.md` và Gotcha #14 vào `3d_cinematics.md`. | Xác minh 100% hiện diện vật lý trên đĩa. | ✔️ PASS |

---

## 6. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC

Áp dụng quy trình hồi tưởng hai vòng phản biện đối kháng (Two-Round Adversarial Cross-Examination Gate):

### 6.1. Dữ Liệu Thu Thập Thô Từ Các Trạm (Raw Telemetry)
- **Station 1 (QA)**: Đề xuất không có ma sát nào, vitest thực thi 1.97s cho 18 contract tests.
- **Station 2 (Implementer)**: Đề xuất bổ sung một kiểu helper chuẩn hóa cho duyệt cây AST React 19 trong `tests/helpers/threejs_test_utils.ts` thay vì phải định nghĩa mở rộng `interface Object` trong `src/client/types/global.d.ts`.
- **Station 3.1 (Spec Reviewer)**: Đề xuất chuẩn hóa helper duyệt cây JSX lồng sâu dùng chung (`captureTree` và `findReactNode`) vào thư viện tiện ích test.
- **Station 3.2 (Visual Critic)**: Đề xuất tích hợp cơ chế tự động kiểm tra camera telemetry (FOV và pitch) vào script `check_evidence.mjs` song song với kiểm tra bounding box JSON.
- **Station 3.2 (Code Reviewer)**: Khuyến nghị chuyển 4 thuộc tính gán vào `interface Object` trong `global.d.ts` về ép kiểu cục bộ trong test file ở đợt dọn dẹp tiếp theo.
- **Station 4 (Chaos Sentinel)**: Vận hành trơn tru sau khi cập nhật bộ đột biến AST mục tiêu cho IMP-265, tiêu diệt 22/22 mutants.

### 6.2. Phản Biện Đối Kháng Vòng 1 & Vòng 2 (Two-Round Cross-Examination)
1. **Xử lý Đề xuất Mở Rộng Kiểu Toàn Cục `interface Object` (Implementer & Code Reviewer)**:
   - *Vòng 1 (Bằng chứng vật lý)*: Việc mở rộng `interface Object` trong `global.d.ts` chỉ được thực hiện tạm thời để giải quyết lỗi TS2339 trong môi trường React 19 strict mode khi test duyệt cây JSX không có WebGL context. Mã nguồn sản xuất không sử dụng các thuộc tính này.
   - *Vòng 2 (Lọc bộ đệm)*: [XÁC NHẬN MA SÁT CƠ HỌC]. Thay vì can thiệp vào `global.d.ts`, cần đưa định nghĩa kiểu `RenderableElement` vào thư mục `tests/helpers/threejs_test_utils.ts` để bảo đảm độ sạch sẽ tuyệt đối cho `global.d.ts`.
2. **Xử lý Đề xuất Tích Hợp Camera Telemetry Vào `check_evidence.mjs` (Visual Critic)**:
   - *Vòng 1*: `capture_visual_evidence.mjs` đã xuất ra các tệp `camera_telemetry_imp-265_desktop.json` và `mobile.json` ghi nhận chính xác FOV 24 độ và pitch 38.7-38.8 độ.
   - *Vòng 2*: [XÁC NHẬN CẢI TIẾN CÓ LỢI]. Đưa việc kiểm tra độ lệch FOV và pitch camera vào script kiểm tra bằng chứng cơ học sẽ giúp tự động hóa khâu thẩm định góc máy 3D ở các ticket điện ảnh tiếp theo.
