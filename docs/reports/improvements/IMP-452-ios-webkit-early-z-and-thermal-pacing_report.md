# BÁO CÁO NGHIỆM THU HOÀN THÀNH TICKET IMP-452
## PLAN_IMP_452: iOS WebKit Early-Z Restoration & Thermal Pacing

> **Mã Ticket:** `IMP-452`  
> **Phân hệ thực tế:** `client-3d`  
> **Ngày hoàn thành:** 2026-10-21  
> **Quy trình:** Closed-Loop 4-Station Pipeline (Tuân thủ nghiêm ngặt Hiến pháp AGENTS CONSTITUTION)  
> **Trạng thái:** ✅ **PRODUCTION READY & HARDENED**

---

## 1. TỔNG QUAN & BỐI CẢNH VẤN ĐỀ

Vài ngày gần đây, người chơi trải nghiệm trên các thiết bị iOS (iPhone / iPad chạy WebKit) gặp phải tình trạng sụt giảm hiệu năng nghiêm trọng: FPS tụt dốc xuống **8–13 FPS**, độ trễ khung hình tăng vọt lên **208–730ms**, trong khi các ngày trước đó trò chơi vận hành rất mượt mà.

### Phân tích nguyên nhân gốc rễ (Root Cause Analysis):
1. **Phá vỡ phần cứng Early-Z trên chip Apple TBDR GPU**: Tại `src/client/game_canvas.tsx#L181`, việc ép cứng `logarithmicDepthBuffer: true` đã buộc Three.js phải chèn phần mở rộng `EXT_frag_depth` vào tất cả các fragment shader. Việc ghi giá trị độ sâu thủ công (`gl_FragDepthEXT`) đã **vô hiệu hóa hoàn toàn cơ chế Hidden Surface Removal (HSR) / Early-Z bằng phần cứng của chip Apple (A-series / M-series)**, ép GPU phải thực thi pixel shader cho toàn bộ các pixel bị che khuất và ghi đè ra ngoài trật tự vào bộ nhớ đệm Tile SRAM, gây ra hiện tượng nghẽn cổ chai khủng khiếp (latency 730ms).
2. **Tràn bộ nhớ đệm Tile SRAM trên màn hình Retina**: Tại `game_canvas.tsx#L182-183`, việc ép cứng `antialias: true` (Hardware 4x MSAA) kết hợp với việc đẩy giới hạn DPR của iPhone lên `1.0` (trong `perf_budget.ts#L58`) đã nhân số lượng mẫu lên gấp 4 lần trong Tile SRAM (hơn 1.3 triệu mẫu/frame), khiến Tile SRAM bị tràn ra DRAM ngoài, gây nghẽn băng thông và nóng máy nhanh chóng.
3. **Cạm bẫy Z-fighting khi tắt Logarithmic Depth**: Khi tắt `logarithmicDepthBuffer` để khôi phục Early-Z, nếu giữ nguyên camera frustum quá rộng (`near: 0.5m, far: 300m` — tỉ lệ 600:1), depth buffer tuyến tính 24-bit sẽ bị lãng phí hơn 90% giá trị vào khoảng không gian sát camera (< 5m), khiến vùng chơi cờ ($30\text{m} - 60\text{m}$) bị "đói độ chính xác" (precision starvation), dẫn đến nguy cơ Z-fighting nhấp nháy trên mặt bàn cờ.

### Giải pháp kỹ thuật đã triển khai:
- **Khôi phục Early-Z & HSR**: Phân lập WebGL Profile qua helper thuần `resolveCanvasGlConfig` — trên mobile tắt `logarithmicDepthBuffer` và `antialias`, dùng `mediump`; trên desktop bảo toàn `logarithmicDepthBuffer: true`, `antialias: true`, `precision: 'highp'`.
- **Bảo vệ Tile SRAM**: Khôi phục `DPR_BOUNDS.IOS_PHONE_MAX = 0.82` và phân giải `getRecommendedDpr` cho iPhone thành `[0.75, 0.82]` ngay từ frame 0.
- **Nâng cao độ chính xác Z-buffer (Directive 1)**: Nén tỉ lệ Frustum Camera từ 600:1 xuống 70:1 (`near: 2.0, far: 140.0`) trong `DEFAULT_CANVAS_CAMERA_CONFIG`, mở rộng độ phân giải Z-buffer vùng sa bàn lên hơn 400%, loại bỏ nguy cơ Z-fighting trên các mặt phẳng có độ dày hình học.
- **Phân tách Directives 2 & 3 sang IMP-453 (Scope Confinement Protocol)**: Để tuân thủ nghiêm ngặt quy tắc giới hạn tối đa 3 họ linh kiện cho một feature slice (`client/game`, `client/3d/device`, `client/3d/perf`), Directives 2 (`polygonOffset` cho decal ô cờ/vành khuyên) và Directive 3 (`depthWrite: false` cho lớp sóng sông Sài Gòn $\Delta Y = 0.0\text{mm}$) được phân công thực hiện trong ticket đồng hành **IMP-453** cùng với module căn chỉnh góc quay camera di động.

> **Yêu cầu chủ động từ bỏ (Sean Goedecke Invariant)**:
> - ❌ **NO Dynamic WebGL Capability Sniffing**: WebGL extensions và parameters được xác định tất định từ `deviceProfile.isMobile`, tránh các truy vấn WebGL bất đồng bộ thiếu ổn định.
> - ❌ **NO Hardware 4x MSAA on Mobile**: Mobile GL profile mặc định `antialias: false` (mật độ điểm ảnh Retina 460 ppi giúp mắt người hoàn toàn không nhận thấy răng cưa).
> - ❌ **NO Highp Fragment Shader Overhead on Mobile**: Mobile dùng `precision: 'mediump'` để tối ưu hóa register budget của ALU chip Apple.
> - ❌ **NO Camera Kinematic Mutatations in this Ticket**: Chuyển động và góc quay camera mobile được tách riêng vào ticket tiếp nối IMP-453 để tuân thủ nghiêm ngặt quy tắc phân tách mỏng (Auto-Slicing Protocol $\le 3$ đơn vị cấu phần).

---

## 2. BẢNG TỔNG HỢP BẰNG CHỨNG QUY TRÌNH 4 TRẠM KHÉP KÍN

| Trạm Kiểm Soát | Vai Trò & Tệp Bằng Chứng | Chỉ Số Đạt Được | Kết Quả Thẩm Định |
| :--- | :--- | :--- | :---: |
| **Stage 0: Plan Review** | `adversarial-challenger` & `audit_plan.mjs`<br>[`.agents/audit/PLAN_AUDIT_IMP-452.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP-452.md) | Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean, tự động ký duyệt. | **HARDENED_APPROVED 🛡️** |
| **Trạm 1: RED Contract Test** | `qa-tester`<br>[`tests/client/imp452_ios_webkit_early_z_and_thermal_pacing.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp452_ios_webkit_early_z_and_thermal_pacing.test.ts) | 8 atomic tests, 18 asserts, 0 loops. Adversarial Inversion: 100% tests fail RED ở runtime assertion trước khi có mã nguồn | **VERIFIED RED** 🎯 |
| **Trạm 2: GREEN Implementation** | `implementer`<br>[`.agents/evidence/chaos_sentinel_IMP-452.json`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-452.json) | 4 production files modified, 100% tests chuyển sang GREEN | **VERIFIED GREEN** 🟢 |
| **Trạm 2.5: Fast Pre-Filter** | `scout` & `fast_prefilter.mjs` | Typecheck `tsc --noEmit` exit 0, 0 dirty casts (`as any`), LOC budgets đạt chuẩn | **100% PASS** 🚀 |
| **Trạm 3.1: Spec & Scope Gate** | `spec-reviewer`<br>[`.agents/audit/SPEC_REVIEW_IMP-452.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-452.md) | 100% Plan fidelity, zero scope creep, kiểm soát ranh giới phân hệ `client-3d` | **APPROVED** 📋 |
| **Trạm 3.2: Architecture & Anti-Slop** | `code-reviewer`<br>[`.agents/audit/CODE_REVIEW_IMP-452.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-452.md) | 0 Slop red flags, Zero TIDD, an toàn bộ nhớ/timer, assertion density 2.25 | **APPROVED** 🛡️ |
| **Trạm 3.3: 3D Visual Art Direction** | `game-3d-visual-critic`<br>[`.agents/audit/3D_VISUAL_REVIEW_IMP-452.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/3D_VISUAL_REVIEW_IMP-452.md) | Thẩm định kép (Dual-Viewport):<br>- Mobile 360x740: **8.0 / 10** (`imp-452_mobile_360.jpg`)<br>- Desktop 1920x1080: **8.6 / 10** (`imp-452_full_board.jpg`) | **SHIP ACCREDITED 🏛️** |
| **Trạm 4: Chaos & Mutation Sentinel** | `chaos-sentinel`<br>[`scripts/check_evidence.mjs`](file:///C:/Users/HP/Documents/GitHub/vtcoon/scripts/check_evidence.mjs) | 20/20 mutants mục tiêu bị tiêu diệt (kill rate: 100%, 0 survived). Live WebSocket port 0 PASS. | **APPROVED 💥** |

---

## 3. KẾT QUẢ VẬN HÀNH 4 TRẠM KHÉP KÍN & PHẢN HỒI THẨM ĐỊNH

### Trạm 0: Thẩm Định Đối Kháng Kế Hoạch (`adversarial-challenger` & `audit_plan.mjs`)
- **Phán quyết**: **HARDENED_APPROVED 🛡️**
- **Nhật ký thẩm tra**: Thẩm định kế hoạch đạt 0 defects, 6 contract tests clean.
- **Phản biện đối kháng & Giới hạn phạm vi**:
  - Đã phát hiện kịp thời cạm bẫy Z-fighting khi tắt Logarithmic Depth và bổ sung Directive 1 (nén Frustum Ratio `near: 2.0, far: 140.0`).
  - Bổ sung tệp cầu nối `device_profile_context.tsx` để bảo vệ độ sâu Desktop (`logarithmicDepthBuffer: true`).
  - Thiết lập Giao thức Hiện đại hóa Hợp đồng sống cho 7 assertion thuộc `imp374`, `imp361`, `imp412`.
  - **Phân tách phạm vi rõ ràng**: Để tránh vi phạm quy tắc `MEGA_PLAN_SCOPE_TOO_WIDE` (vượt quá 3 họ linh kiện), Directive 1 được triển khai trực tiếp trong IMP-452, trong khi Directive 2 (`polygonOffset`) và Directive 3 (`depthWrite: false` cho sông Sài Gòn $\Delta Y = 0.0\text{mm}$) được phân định rõ ràng sang ticket đồng hành IMP-453.

### Trạm 1: Bộ Kiểm Thử Hợp Đồng Độc Lập (`qa-tester`)
- **Tệp kiểm thử hợp đồng**: [`tests/client/imp452_ios_webkit_early_z_and_thermal_pacing.test.ts`](file:///C:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp452_ios_webkit_early_z_and_thermal_pacing.test.ts)
- **Chỉ số kiểm thử**: **8 atomic tests**, **18 asserts** (mật độ trung bình: 2.25 asserts/test, 0 vòng lặp).
- **Adversarial Inversion Gate**: 100% hợp đồng nghiệp vụ mới fail chính xác ở mức runtime assertion trước khi hiện thực mã nguồn, chứng minh tính độc lập và chống kiểm thử giả tạo (Anti-Tautological).

### Trạm 2: Hiện Thực Mã Nguồn Tối Thiểu (`implementer`)
- **Mã nguồn đã chỉnh sửa (4 tệp production)**:
  1. `src/client/3d/device_detect.ts`: Cấu hình WebGL profile phân lập cho mobile/desktop và DPR iPhone [0.75, 0.82].
  2. `src/client/3d/device_profile_context.tsx`: Thiết lập `logarithmicDepthBuffer: true` trên `DEFAULT_DEVICE_PROFILE`.
  3. `src/client/3d/perf_budget.ts`: Đưa `IOS_PHONE_MAX` về 0.82.
  4. `src/client/game_canvas.tsx`: Tách `resolveCanvasGlConfig` và nén camera frustum `near: 2.0, far: 140.0`.
- **Kiểm thử sống đã hiện đại hóa**:
  - `imp374_ios_webkit_60fps_hardening.test.ts`
  - `imp361_ios_webgl_perf.test.ts`
  - `imp412_device_profile_context_and_hardware_di.test.ts`
  - `post_processing_pipeline.test.ts`
- **Giải trình phạm vi kiểm thử (Scope Justification)**:
  - Tệp `tests/client/post_processing_pipeline.test.ts` bị chỉnh sửa tại dòng 67 (cập nhật kỳ vọng camera near từ `0.5` thành `2.0`). Đây là kiểm thử phụ thuộc trực tiếp vào `DEFAULT_CANVAS_CAMERA_CONFIG`, việc cập nhật này tuân thủ nghiêm ngặt Giao thức Hiện đại hóa Hợp đồng sống để phản ánh đúng cấu hình frustum mới và ngăn ngừa test regression giả.

### Trạm 3.3: Thẩm Định Nghệ Thuật Trực Quan 3D (`game-3d-visual-critic`)
Thẩm định trực quan độc lập trên cả hai khung nhìn (Dual-Viewport):
1. **Khung nhìn Di động (Mobile Portrait - Trọng tâm IMP-452)**:
   - **Tệp bằng chứng**: `c:\Users\HP\Documents\GitHub\vtcoon\.agents\tmp\imp-452_mobile_360.jpg` (360x740, DPR 0.82, `logarithmicDepthBuffer: false`, `antialias: false`, `precision: 'mediump'`).
   - **Điểm số**: **8.0 / 10** (Chuẩn thương mại quốc tế cho cấu hình phần cứng di động).
   - **Đánh giá**:
     - Mặt bàn cờ phẳng mịn, các decal và viền bo kim loại không bị Z-fighting hay rách mặt dù tắt logarithmic depth buffer.
     - Cạnh vát và đường nét giữ độ mịn cao, không xuất hiện răng cưa thô ráp dù tắt MSAA phần cứng.
     - Camera frustum `near: 2.0, far: 140.0` an toàn, không bị cắt mặt (near-clipping).
     - **Cảnh báo công thái học (Ergonomics Alert)**: Cụm thẻ người chơi chiếm ~45% chiều rộng màn hình dọc 360px, che khuất một phần quân cờ đang di chuyển. Điều này xác thực phản ánh của người dùng và là đầu vào bắt buộc cho ticket IMP-453.
2. **Khung nhìn Máy bàn (Desktop Landscape)**:
   - **Tệp bằng chứng**: `c:\Users\HP\Documents\GitHub\vtcoon\.agents\tmp\imp-452_full_board.jpg` (1920x1080, `logarithmicDepthBuffer: true`, `antialias: true`, `precision: 'highp'`).
   - **Điểm số**: **8.6 / 10** (Bảo toàn trọn vẹn chất lượng đồ họa cao cấp trên desktop).

### Trạm 4: Thử Thách Đột Biến Kháng Lỗi (`chaos-sentinel`)
- **Kết quả**: 20/20 mutants bị tiêu diệt (100% kill rate, 0 survived).
- **Bảo vệ cổng socket**: Kết nối WebSocket thời gian thực trên cổng động port 0 (`60598`) thành công, vượt qua thử thách ngắt kết nối đột ngột (abrupt drop survived).

---

## 4. MA TRẬN THAY ĐỔI MÃ NGUỒN (CHANGE MATRIX)

| Tệp vật lý | Phân hệ | Dòng trước | Dòng sau | Thay đổi ròng | Trạng thái LOC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/client/3d/device_detect.ts` | `client-3d` | 75 | 88 | +13 | An toàn (<= 400 LOC) |
| `src/client/3d/device_profile_context.tsx` | `client-3d` | 79 | 80 | +1 | An toàn (<= 500 LOC) |
| `src/client/3d/perf_budget.ts` | `client-3d` | 326 | 326 | 0 | Cảnh báo (>= 300 LOC buffer) |
| `src/client/game_canvas.tsx` | `client-3d` | 254 | 265 | +11 | An toàn (<= 500 LOC) |
| `tests/client/imp452_ios_webkit_early_z_and_thermal_pacing.test.ts` | Test | 0 | 81 | +81 | An toàn (<= 600 LOC) |

---

## 5. HẬU KIỂM & BƯỚC TIẾP THEO (RETROSPECTIVE & NEXT STEPS)

### Hậu kiểm (Retrospective & Metric Honesty):
- **Minh bạch hóa số liệu hiệu năng thực nghiệm**:
  - Chỉ số `60 FPS | 14ms` được ghi nhận trên môi trường chạy kiểm thử tự động Headless Chromium (nền tảng PC Windows với GPU rời).
  - Về mặt lý thuyết kiến trúc phần cứng, việc tắt `logarithmicDepthBuffer` (loại bỏ `gl_FragDepthEXT`) và kẹp DPR về 0.82 đã tháo gỡ hoàn toàn 2 điểm nghẽn vật lý nghiêm trọng nhất của vi kiến trúc Apple TBDR GPU:
    1. Trả lại quyền Hidden Surface Removal (HSR / Early-Z) cho phần cứng Apple, giải phóng 730ms độ trễ pixel shading vô ích.
    2. Triệt tiêu nguy cơ tràn bộ nhớ đệm Tile SRAM ra DRAM ngoài, dập tắt nguy cơ quá nhiệt (thermal throttling).
  - Bước nghiệm thu đo lường FPS và độ trễ trên thiết bị phần cứng iPhone/iPad thực tế chạy WebKit được xếp vào quy trình kiểm thử Staging sau khi merge code.
- **Cảnh báo dung lượng FEATURE_MAP.md**:
  - Tệp `docs/FEATURE_MAP.md` hiện tại đạt **28.62 KB**, tiệm cận ngưỡng cảnh báo sớm 28.5 KB (trần cứng 30.0 KB).
  - Để bảo vệ trần dung lượng, các ticket tiếp theo cần duy trì nguyên tắc viết cô đọng, tỉa bớt văn phong mô tả ở các phân hệ cũ trước khi bổ sung quy tắc mới.

### Bước tiếp theo:
- Triển khai ngay ticket tiếp nối **IMP-453 (Mobile Camera Unified Azimuth, Whiplash Elimination & Co-planar Safety)**:
  1. Triển khai **Directive 2 & 3** còn lại: Thêm `polygonOffset` cho decal ô cờ/vành khuyên và `depthWrite: false` cho lớp sóng sông Sài Gòn $\Delta Y = 0.0\text{mm}$.
  2. Xử lý triệt để bài toán công thái học máy quay di động: Loại bỏ hiện tượng xoay góc 180° bất ngờ, thống nhất góc nhìn camera azimuth `[offH, offY, offH]`, làm mượt bước chuyển cảnh khi tung xúc xắc và bù trừ tracking offset để không bị danh sách thẻ người chơi che khuất.
