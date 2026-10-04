# BÁO CÁO NGHIỆM THU HOÀN THÀNH: IMP-263
# ĐỘNG CƠ CAMERA BÁN ĐIỆN ẢNH THEO SỰ KIỆN & BÓC TÁCH CANVAS SUBTRACTIVE

> **Mã định danh:** IMP-263  
> **Tên gói:** Event-Driven Semi-Cinematic Camera Engine & Subtractive Canvas Modularization  
> **Phân loại:** Tier 2 (Full Rigor - 3D Scene Graph, Camera Choreography & Canvas Partitioning)  
> **Thời điểm hoàn thành:** 2026-10-04  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**  
> **Sổ cái nợ kỹ thuật liên kết:** [docs/epics/client_ui/_epic_ledger.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/epics/client_ui/_epic_ledger.md)

---

## 1. TỔNG QUAN GIẢI PHÁP, ĐỘT PHÁ THỊ GIÁC & KIẾN TRÚC SÂU

### 1.1. Bối Cảnh & Vấn Đề Kỹ Thuật
- **Thắt cổ chai dòng mã của GameCanvas (DEBT-GAME-CANVAS-PARTITION)**: Trước khi tối ưu, tệp `src/client/game_canvas.tsx` đạt tới 476 dòng, nằm sát trần cứng 500 dòng của Tier 2 do ôm đồm toàn bộ logic máy quay `OrbitControls`, vòng lặp `useFrame`, bộ xử lý rung màn hình, và xung nhịp âm thanh nhịp tim.
- **Trải nghiệm máy quay thô cứng và say chuyển động**: Góc nhìn máy quay cũ chỉ có 2 lựa chọn cực đoan: hoặc nhìn thẳng từ trên trời xuống (overview) thiếu chiều sâu kiến trúc 3D, hoặc zoom vào từng ô nhảy trung gian (`tile_focus` ở Y = 6.4) gây giật lắc khung hình dữ dội cho người chơi. Thử nghiệm camera lướt sát đất trước đây (Y = 1.05) che khuất ô cờ phía trước và bị linh vật che ống kính.

### 1.2. Giải Pháp Kỹ Thuật Cốt Lõi (Deep Module Design)
1. **Bóc Tách Canvas Subtractive (`AdaptiveCinematicCamera`)**:
   - Trích xuất toàn bộ thành phần điều khiển OrbitControls, logic cập nhật lerp trong `useFrame`, và âm thanh nhịp tim sang component độc lập `src/client/3d/adaptive_cinematic_camera.tsx`.
   - Dọn sạch các import mã chết trong `game_canvas.tsx`, hạ dòng mã từ 476 LOC xuống **232 LOC** (< 300 LOC Safe), thanh toán dứt điểm khoản nợ kỹ thuật `DEBT-GAME-CANVAS-PARTITION`.
   - Bảo toàn cầu nối tương thích `window.__resetCameraToDefault` phục vụ hợp đồng kiểm thử `TC-190.12`.
2. **Động Cơ Bám Đuổi Bán Điện Ảnh 4 Cạnh ("Sweet Spot" Camera Geometry)**:
   - Module sâu `src/client/3d/cinematic_chase_camera.ts` thiết lập góc máy tối ưu:
     - Độ cao máy quay: `cameraHeight = 2.8` (cao hơn hẳn chiều cao quân cờ 0.6 - 0.8, triệt tiêu nguy cơ che khuất).
     - Độ cao điểm ngắm: `targetHeight = 0.6` (đón đầu phần thân công trình, tạo góc nghiêng đường ngắm 24.5 ~ 25.0 độ, góc cực phi = 65.0 độ nằm an toàn bên trong trần maxPolarAngle 80 độ của OrbitControls).
     - Khoảng lùi tiếp tuyến: `trailDistance = 3.0`, lệch vai ngoài: `outerOffset = 2.2`, đón đầu: `lookAhead = 1.0`, nghiêng hướng tâm: `innerTilt = 0.5`.
     - 4 cạnh bàn cờ xoay đều 90 độ mượt mà, tôn vinh mặt tiền kiến trúc 3D hướng ra ngoài chu vi bàn cờ.
3. **Mô Hình Kích Hoạt Theo Sự Kiện (~20% Luợt Biến Cố Lớn)**:
   - Hàm `shouldTriggerCinematicCamera` chỉ kích hoạt camera bán điện ảnh khi:
     - `isHighStakesRoll = true`: Gieo xúc xắc đối mặt nguy cơ mất tiền lớn / phá sản.
     - Ô đích đến thuộc tập 6 ô hiếm: 4 Trạm Vận Tải (5, 15, 25, 35), Vào Tù (10), Hội Chợ (20).
     - Loại trừ chuyến bay trên không `isJailFlight` để giữ góc nhìn trên cao bao quát.
   - 80% lượt đi thông thường duy trì góc nhìn tổng quan nhanh 0.3s, triệt tiêu say chuyển động.
   - Neo điều kiện kích hoạt vào ô đích đến cuối cùng (`finalDestinationCell`), loại trừ triệt để tình trạng camera giật lên lặn xuống giữa chặng.
4. **Cơ Chế Chạm Bỏ Qua (Tap-to-Skip) Không Giật Ngược**:
   - Khi người chơi chạm vào màn hình lúc quân cờ đang nhảy: camera lập tức snap về vị trí ô đích đến cuối cùng.
   - Bổ sung chốt giữ `hasSkippedCurrentMoveRef`: giữ chặt `targetState = skipTargetState` cho tới khi quân cờ kết thúc nhảy, loại trừ hiện tượng vòng lặp lerp kéo giật camera ngược lại vị trí con cờ.
   - Cửa sổ bảo vệ thời gian 600ms trong `onEnd` của OrbitControls ngăn ngừa việc kích hoạt nhầm cờ người dùng tự chỉnh camera (`hasUserCustomCamera`).
5. **FOV Thích Ứng Màn Hình Dọc (Dual-Viewport Parity)**:
   - `calculateResponsiveStreetFov` tự động mở rộng FOV từ 42 độ (desktop) lên tối đa 68 độ trên mobile portrait (aspect < 1.0), bảo toàn góc nhìn ngang >= 36 độ và ngăn ngừa việc hai bên hành lang bị bóp méo.
6. **Khử Nhiễm Số Học & An Toàn WebGL**:
   - Mọi hàm giải toán tọa độ kiểm tra `Number.isFinite(...)`, fallback an toàn về `[0, 0, 0]` chống sập render loop khi gặp NaN hoặc Infinity.
   - Đồng bộ các ô góc (0, 10, 20, 30) với `resolveSideFromCoordinates` triệt tiêu cú lắc 90 độ khi tiếp đất.

---

## 2. BẢNG NGÂN SÁCH DÒNG MÃ VẬT LÝ ĐỐI CHIẾU (scripts/check_loc.mjs)

| Tệp vật lý | Phân loại Tier | Total Lines | Non-Empty SLOC | Trần quy định | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/game_canvas.tsx` | Tier 2 (UI/3D/Views) | **232** | 216 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/3d/adaptive_cinematic_camera.tsx` | Tier 2 (UI/3D/Views) | **349** | 320 | <= 500 LOC | ✔️ Safe (< 400 LOC) |
| `src/client/3d/cinematic_chase_camera.ts` | Tier 2 (UI/3D/Views) | **170** | 155 | <= 500 LOC | ✔️ Safe (< 300 LOC) |
| `src/client/3d/camera_state_machine.ts` | Tier 2 (UI/3D/Views) | **395** | 369 | <= 500 LOC | ✔️ Safe (< 400 LOC) |
| `tests/client/cinematic_chase_camera.test.ts` | Contract / Unit Tests | **188** | 170 | <= 600 LOC | ✔️ Safe |

---

## 3. KẾT QUẢ QUY TRÌNH 4 TRẠM KHÉP KÍN (4-STATION CLOSED-LOOP PIPELINE)

### 3.0. Kiểm Toán Đối Kháng Kế Hoạch (Pre-Flight Plan Audit)
- **Kiểm toán viên**: `plan-griller` & `adversarial-challenger`
- **Kết quả**: ✅ **`HARDENED_APPROVED`** tại [`.agents/audit/PLAN_AUDIT_IMP-263.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-263.md) & [`.agents/audit/PLAN_CHALLENGE_IMP-263.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-263.md)
- **Bảng đối chiếu đóng chỉ thị**: Khắc phục 100% các chỉ thị (GRILL-P1/P2, ADV-01..05, USER-BUG-01/02), vượt qua kiểm chứng cơ học `scripts/audit_plan.mjs` với 5/5 tệp và 5/5 drop-in snippets khớp vật lý.

### 3.1. Trạm 1: Station 1 (QA RED - Adversarial Inversion)
- **Kỹ sư kiểm thử**: `qa-tester` (Adversarial TDD)
- **Tệp kiểm thử**: `tests/client/cinematic_chase_camera.test.ts` (16 bài kiểm thử nguyên tử, 50 assertions, tỷ lệ 3.125).
- **Trạng thái RED**: Chứng minh thất bại Business RED thành công (thiếu module `cinematic_chase_camera.ts` trên đĩa vật lý).
- **Ranh giới cô lập**: 0 tệp trong `src/**` bị can thiệp.

### 3.2. Trạm 2: Station 2 (GREEN Implementation) & Station 2.5 (Fast Pre-Filter)
- **Kỹ sư hiện thực**: `implementer`
- **Kết quả kiểm thử**: 35/35 camera tests GREEN (16 tests mới + 19 tests kế thừa trong `camera_state_machine.test.ts`).
- **Phát hiện đẩy ngược (Implementer Pushback)**: Khôi phục import `CAMERA_CONFIG` trong `game_canvas.tsx` cho thẻ `<Canvas />` ban đầu, ngăn chặn lỗi ReferenceError khi chạy.
- **Station 2.5 Fast Pre-Filter**: 100% PASS trên 6 cổng kiểm tra cơ học (`tsc --noEmit` exit 0, LOC Safe, 0 dirty casts, <= 4 assertions/test, `lint:slop` 0 lỗi, `lint:ui` 0 lỗi, `check:i18n` 0 lỗi).

### 3.3. Trạm 3: Station 3 (Independent Review Funnel)
- **Phase 3.0 (Physical Visual Evidence Gate)**:
  - Chụp ảnh in-game vật lý Dual-Viewport thành công:
    - Desktop (1280x800): [`.agents/tmp/imp-263_desktop.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-263_desktop.jpg)
    - Mobile Portrait (360x740): [`.agents/tmp/imp-263_mobile_360.jpg`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/imp-263_mobile_360.jpg)
    - Metadata Bounding Box: [`.agents/evidence/bounding_box_imp-263_desktop.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-263_desktop.json) & [`.agents/evidence/bounding_box_imp-263_mobile.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/bounding_box_imp-263_mobile.json)
- **Phase 3.1 (Spec & Scope Gate)**:
  - `spec-reviewer`: Phê chuẩn **`APPROVED`** tại [`.agents/audit/SPEC_REVIEW_IMP_263.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP_263.md). Độ tương thích 100%, 0 scope drift.
- **Phase 3.2 (Deep Architecture & Craft Gate - Parallel Dispatch)**:
  - `code-reviewer`: Phê chuẩn **`APPROVED`** tại [`.agents/audit/CODE_REVIEW_IMP-263.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-263.md). Vượt qua 5 mẫu hình khuyết tật phổ quát, Anti-TIDD sạch sẽ, Deep Module đạt Deletion Test.
  - `game-3d-visual-critic`: Phê chuẩn **`SHIP` (8.5 / 10)** tại [`.agents/audit/3D_VISUAL_REVIEW_IMP-263.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-263.md). Xác minh độ cao Y = 2.8 và pitch 25 độ tôn vinh công trình đồ chơi 3D, headroom quân cờ an toàn > 2.0 units, FOV portrait 68 độ hoàn hảo.

### 3.4. Trạm 4: Station 4 (Adversarial Boundary & Mutation Sentinel)
- **Chiến binh hỗn loạn**: `chaos-sentinel`
- **Kết quả thẩm định**: ✅ **`APPROVED`** tại [`.agents/evidence/chaos_sentinel_imp-263.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_imp-263.json)
- **3 Đầu dò vật lý**:
  1. *Probe 1 (Wire-to-Core Closed-Loop Parity)*: 34 physical assertions passed.
  2. *Probe 2 (Ephemeral Dynamic Boundary Probe)*: 17/17 tests passed trên Headless WebGL2, sinh ảnh [`.agents/tmp/webgl2_headless_smoke_probe.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/webgl2_headless_smoke_probe.png) tách biệt hoàn toàn với Phase 3.0 visual captures.
  3. *Probe 3 (Targeted Mutation Sensitivity)*: Tiêu diệt **17 / 17 mutants** (100% kill rate, 0 sống sót, 0 waivers).
- **Kiểm chứng cơ học**: `node scripts/check_evidence.mjs IMP-263` -> **`PASS (Zero-Blindness & All Floors Met)`**.

---

## 4. MA TRẬN TRUY XUẤT NGUỒN GỐC KIỂM THỬ (TRACEABILITY MATRIX)

| Mã Kiểm Thử | Khía Cạnh Hành Vi | Thẻ Truy Xuất | Nội Dung Khẳng Định & Kết Quả |
| :--- | :---: | :---: | :--- |
| **TC-263.01** | Happy Path | `[UC-IMP263/MSS]` | Cạnh 0 (Nam, ô 5): Camera vị trí [px + 3.0, py + 2.8, pz + 2.2]. |
| **TC-263.02** | Happy Path | `[UC-IMP263/MSS]` | Cạnh 0 (Nam, ô 5): Điểm ngắm [px - 1.0, py + 0.6, pz - 0.5], pitch 24.5..25.0 độ (0.428 rad). |
| **TC-263.03** | Happy Path | `[UC-IMP263/MSS]` | Cạnh 1 (Tây, ô 15): Camera vị trí [px - 2.2, py + 2.8, pz + 3.0]. |
| **TC-263.04** | Happy Path | `[UC-IMP263/MSS]` | Cạnh 1 (Tây, ô 15): Điểm ngắm [px + 0.5, py + 0.6, pz - 1.0]. |
| **TC-263.05** | Happy Path | `[UC-IMP263/MSS]` | Cạnh 2 (Bắc, ô 25): Camera vị trí [px - 3.0, py + 2.8, pz - 2.2]. |
| **TC-263.06** | Happy Path | `[UC-IMP263/MSS]` | Cạnh 2 (Bắc, ô 25): Điểm ngắm [px + 1.0, py + 0.6, pz + 0.5]. |
| **TC-263.07** | Happy Path | `[UC-IMP263/MSS]` | Cạnh 3 (Đông, ô 35): Camera vị trí [px + 2.2, py + 2.8, pz - 3.0]. |
| **TC-263.08** | Happy Path | `[UC-IMP263/MSS]` | Cạnh 3 (Đông, ô 35): Điểm ngắm [px - 0.5, py + 0.6, pz + 1.0]. |
| **TC-263.09** | Rule-State | `[UC-IMP263/MSS]` | `shouldTriggerCinematicCamera` trả về true khi `isHighStakesRoll: true`. |
| **TC-263.10** | Rule-State | `[UC-IMP263/MSS]` | `shouldTriggerCinematicCamera` trả về true cho 6 ô hiếm (5, 10, 15, 20, 25, 35) và false cho ô thường. |
| **TC-263.11** | Rule-State | `[UC-IMP263/MSS]` | `shouldTriggerCinematicCamera` trả về false khi `isJailFlight: true`. |
| **TC-263.12** | Responsive | `[UC-IMP263/A1]` | FOV thích ứng giữ 42 độ trên desktop và mở rộng tối đa 68 độ trên portrait (aspect < 1.0). |
| **TC-263.13** | Defensive | `[UC-IMP263/A2]` | Khử nhiễm NaN/Infinity, fallback tọa độ an toàn [0, 0, 0] không làm vỡ WebGL. |
| **TC-263.14** | Corner-Sync | `[UC-IMP263/A3]` | Ô góc (0, 10, 20, 30) đồng bộ với `resolveSideFromCoordinates` triệt tiêu cú lắc 90 độ. |
| **TC-263.15** | Integration | `[UC-IMP263/MSS]` | `calculateTargetCameraState` ủy quyền cho `calculateStreetChaseCameraState` khi `cinematicChase: true`. |
| **TC-263.16** | Integration | `[UC-IMP263/A4]` | `calculateTargetCameraState` trả về 'overview' khi `cinematicChase: false` và bảo toàn fallback cũ khi options undefined. |

---

## 5. BẢNG ĐÁNH GIÁ ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE - DOD 1-6)

| Tiêu chuẩn DoD | Mô tả yêu cầu | Trạng thái vật lý | Phán quyết |
| :--- | :--- | :--- | :---: |
| **DoD 1** | Kế hoạch kiểm thử tự động vượt qua Inversion Gate, gắn nhãn `[UC-.../MSS]` / `[UC-.../A#]`, tối đa <= 4 asserts/test, 0 loops. | 16/16 contract tests PASS với đầy đủ nhãn truy xuất và tỷ lệ assertion 3.125. | ✔️ PASS |
| **DoD 2** | Mã nguồn vượt qua `lint:slop` (complexity <= 5, ngân sách LOC) và `lint:ui` (0 violations). | Toàn bộ 4 tệp đạt ngân sách LOC Safe (< 300 và < 400 LOC), complexity <= 5, 0 linter violations. | ✔️ PASS |
| **DoD 3** | Cổng kiểm duyệt tuần tự: Spec Review approved, Code Review approved, Visual Review approved, báo cáo được lưu đĩa vật lý `.agents/audit/*.md`. | `SPEC_REVIEW_IMP_263.md` (APPROVED), `CODE_REVIEW_IMP-263.md` (APPROVED), `3D_VISUAL_REVIEW_IMP-263.md` (SHIP 8.5/10). | ✔️ PASS |
| **DoD 4** | Station 4 Chaos Sentinel ký duyệt 3 đầu dò vật lý, 0 parity gaps, 0 mutant sống sót. | `chaos_sentinel_imp-263.json` APPROVED, 17/17 mutants killed (100% kill rate), `check_evidence.mjs` PASS. | ✔️ PASS |
| **DoD 5** | Cập nhật Tech Debt Ledger trong `_epic_ledger.md` bằng key bất biến và lưu báo cáo nghiệm thu. | `DEBT-GAME-CANVAS-PARTITION` được thanh toán dứt điểm trong `docs/epics/client_ui/_epic_ledger.md`. Báo cáo này được lưu trữ. | ✔️ PASS |
| **DoD 6** | Độ bền vận hành: phòng thủ tọa độ số học NaN/Infinity, Tap-to-Skip có cờ chốt giữ chống giật ngược, OrbitControls cooldown 600ms. | Xác minh hoàn chỉnh trong code và kiểm thử tự động. | ✔️ PASS |

---

## 6. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC

Áp dụng quy trình hồi tưởng hai vòng phản biện đối kháng (Two-Round Adversarial Cross-Examination Gate):

### 6.1. Dữ Liệu Thu Thập Thô Từ Các Trạm (Raw Telemetry)
- **Station 1 (QA)**: Đề xuất không có ma sát nào, vitest thực thi 236ms.
- **Station 2 (Implementer)**: Đẩy ngược Step 1.2 của kế hoạch do xóa nhầm import `CAMERA_CONFIG` cần thiết cho component Canvas. Đề xuất: Trong các bài kiểm thử tĩnh (như `phase3_visual_polish.test.ts`), tránh kiểm tra chuỗi import cố định trong file mẹ khi bóc tách submodules.
- **Station 3.1 (Spec Reviewer)**: Đề xuất công cụ prefilter nên báo cáo chi tiết dòng mã Non-Empty SLOC bên cạnh tổng physical lines.
- **Station 3.2 (Visual Critic)**: Đề xuất scripts chụp ảnh tự động nên luôn xuất cặp file `.jpg` và `.json` bounding box đi liền nhau.
- **Station 3.2 (Code Reviewer)**: Đề xuất prefilter duy trì tốc độ < 5s cho single-file audits.
- **Station 4 (Chaos Sentinel)**: Vận hành mượt mà, không gặp ma sát.

### 6.2. Phản Biện Đối Kháng Vòng 1 & Vòng 2 (Two-Round Cross-Examination)
1. **Xử lý Đề xuất Kiểm Thử Tĩnh (Implementer)**:
   - *Vòng 1 (Bằng chứng vật lý)*: Bài test `phase3_visual_polish.test.ts` đã từng kiểm tra sự tồn tại của chuỗi import `AdaptiveCinematicCamera` trong `game_canvas.tsx`. Do `game_canvas.tsx` re-export component này nên test vẫn xanh 100%. Tuy nhiên, việc test đơn vị kiểm tra cấu trúc chuỗi import (static checklist test) là một phản mẫu bị Hiến pháp cấm.
   - *Vòng 2 (Lọc bộ đệm)*: [XÁC NHẬN MA SÁT CƠ HỌC]. Cần rà soát các bài test kiểm tra chuỗi import tĩnh trong tương lai để chuyển sang kiểm tra hợp đồng chức năng (contract behavior) thay vì regex tìm dòng import.
2. **Xử lý Đề xuất Non-Empty SLOC (Spec Reviewer)**:
   - *Vòng 1*: `check_loc.mjs` hiện tại đã tính toán và in ra cả Total Physical Lines lẫn Non-Empty SLOC, đồng thời hỗ trợ buffer 5%.
   - *Vòng 2*: [NHIỄU CHỦ QUAN / ĐÃ ĐƯỢC GIẢI QUYẾT]. Công cụ hiện tại đã đáp ứng tốt.
3. **Xử lý Đề xuất Bundle JPG + JSON Bounding Box (Visual Critic)**:
   - *Vòng 1*: Script `capture_visual_evidence.mjs` với cờ `--dual-viewport` hiện tại đã tự động ghi cả 2 ảnh `.jpg` và 2 file `.json` bounding box vào `.agents/evidence/`.
   - *Vòng 2*: [XÁC NHẬN BẢO TOÀN]. Giữ vững thực hành tốt này làm tiêu chuẩn mặc định cho toàn bộ các ticket giao diện.
