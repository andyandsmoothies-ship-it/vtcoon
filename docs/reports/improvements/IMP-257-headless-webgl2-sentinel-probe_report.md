# BÁO CÁO NGHIỆM THU HOÀN THÀNH: IMP-257
## Headless WebGL2 Boundary Sentinel Probe via Playwright (Trạm 4 Chaos Sentinel)

> **Mã Ticket:** IMP-257  
> **Tiêu đề:** Bộ Dò WebGL2 Headless Playwright Cho Trạm 4 (Chaos Sentinel)  
> **Trạng thái:** 🟢 HOÀN THÀNH (APPROVED)  
> **Căn cứ kế hoạch:** [`.agents/plans/PLAN_IMP_257_HEADLESS_WEBGL2_SENTINEL_PROBE.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/plans/PLAN_IMP_257_HEADLESS_WEBGL2_SENTINEL_PROBE.md)  
> **Sổ cái Master Roadmap:** [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md)  
> **Sổ nợ kỹ thuật (Tech Debt):** `DEBT-WEBGL-SCENE-INTEGRATION` (Trạng thái: `CARRIED OVER`)  
> **Biên bản kiểm duyệt vật lý:** [`.agents/audit/SPEC_REVIEW_IMP-257.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/SPEC_REVIEW_IMP-257.md) | [`.agents/audit/CODE_REVIEW_IMP-257.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/CODE_REVIEW_IMP-257.md)  

---

### 1. TỔNG QUAN & PHẠM VI NGHIỆP VỤ

Ticket IMP-257 hoàn thành việc xây dựng **Khung Hạ Tầng Bộ Dò Không Gian WebGL2 Headless (Headless WebGL2 Probe Harness Framework)** phục vụ Trạm 4 (Chaos Sentinel). Việc tích hợp sa bàn 3D thực tế của Vtcoon được tách biệt và theo dõi chặt chẽ dưới khoản nợ kỹ thuật `DEBT-WEBGL-SCENE-INTEGRATION`:
1. **Khởi chạy Chromium/Edge Headless WebGL2 thật:** Khởi tạo ngữ cảnh phần cứng qua các cờ `--use-gl=angle`, `--enable-webgl`, `--use-angle=swiftshader`, `--enable-unsafe-swiftshader`. *(Lưu ý kỹ thuật: SwiftShader là GL phần mềm trên CPU phục vụ CI/CD, draw calls đo đạc trên GPU thực tế có thể thay đổi nhẹ).*
2. **Đầu dò không gian tự động hóa:**
   - Đếm chính xác số lượng draw calls và triangle geometry từ `renderer.info.render`.
   - Giám sát trần ngân sách Draw Calls ($\le 85$ calls theo SSOT `PERF_BUDGET_LIMITS.targetMaxDrawCalls`).
   - Duyệt cây Three.js Scene Graph (`scene.traverse`) đếm Mesh và Group phân cấp.
   - Kiểm tra ma trận thế giới và ma trận chiếu camera không phân kỳ (100% hữu hạn, không chứa `NaN` hoặc `Infinity`).
   - Kiểm chứng bất biến góc nhìn Frustum ($near > 0$, $far > near$, $aspect > 0$, $0 < fov < 180$).
   - Kiểm chứng rasterization qua `gl.readPixels()` đọc trực tiếp giá trị màu trên GPU framebuffer.
   - Mô phỏng chu kỳ mất ngữ cảnh (`webglcontextlost` với `e.preventDefault()`) và phục hồi bất đồng bộ (`webglcontextrestored`).
3. **Tuân thủ Anti-TIDD (Rule 8):**
   - Tệp mã sản xuất [`src/client/3d/spatial_invariants.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/spatial_invariants.ts) chỉ xuất duy nhất hàm `validateDrawCallsBudget` (được tiêu thụ trực tiếp bởi `perf_budget.ts`).
   - Các hàm kiểm thử mở rộng (`validateCameraFrustum`, `validateMatrixFinite`, `validateContextLossRecovery`) được chuyển về [`tests/probes/spatial_test_helpers.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/probes/spatial_test_helpers.ts), triệt tiêu 100% dead exports trong mã nguồn sản xuất.
4. **Bộ điều phối thống nhất `sentinel_runner.mjs`:**
   - Điều hướng các ticket 3D (`--3d`) tới WebGL spatial probe và cỗ máy kiểm thử đột biến mã nguồn thực tế (real AST/in-place mutation engine với 5 mutants killed).
   - Bảo tồn tương thích ngược 100% cho các ticket Server WebSocket truyền thống qua `scripts/station4_sentinel.ts`.
5. **Định tuyến CI rõ ràng:**
   - Cung cấp script chuyên biệt `"test:probes": "cross-env VITEST_PROBE=1 vitest run tests/probes/"` trong `package.json` để kiểm thử toàn diện các probes định kỳ.

---

### 2. MA TRẬN ÁNH XẠ TRACEABILITY & TEST CONTRACTS

| Mã Test / Traceability Tag | Luồng Nghiệp Vụ | Nội Dung Kiểm Thử | Trạng Thái |
| :--- | :--- | :--- | :---: |
| `[TC-257.01/MSS][UC-STATION4-3D/MSS]` | Khởi động Browser | Khởi chạy Chromium headless thành công với WebGL2 | ✅ PASS |
| `[TC-257.02/MSS][UC-STATION4-3D/MSS]` | Khởi tạo Three.js | Khởi tạo `THREE.WebGLRenderer` trên canvas WebGL2 và dispose sạch sẽ | ✅ PASS |
| `[TC-257.03/MSS][UC-STATION4-3D/MSS]` | Draw Calls & ReadPixels | `renderer.info.render.calls > 0` và `gl.readPixels()` xác nhận màu xanh trên framebuffer | ✅ PASS |
| `[TC-257.04/MSS][UC-STATION4-3D/MSS]` | Triangle Metric | `renderer.info.render.triangles` khớp đúng số tam giác geometry (12) | ✅ PASS |
| `[TC-257.05/MSS][UC-STATION4-3D/MSS]` | Scene Traversal | `scene.traverse` đếm chính xác số lượng Mesh (2) và Group (1) | ✅ PASS |
| `[TC-257.06/MSS][UC-STATION4-3D/MSS]` | Ngân Sách Hiệu Năng | `validateDrawCallsBudget` bám sát SSOT `targetMaxDrawCalls = 85` | ✅ PASS |
| `[TC-257.07/MSS][UC-STATION4-3D/MSS]` | Frustum Finite | Ma trận `camera.projectionMatrix` 16 phần tử hữu hạn, không `NaN`/`Infinity` | ✅ PASS |
| `[TC-257.08/MSS][UC-STATION4-3D/MSS]` | World Matrix Finite | Ma trận `camera.matrixWorld` 16 phần tử hữu hạn, không phân kỳ | ✅ PASS |
| `[TC-257.09/MSS][UC-STATION4-3D/MSS]` | Frustum Boundary | `validateCameraFrustum` xác nhận bộ tham số hình học chuẩn (0.5, 300, 24, 16/9) | ✅ PASS |
| `[TC-257.10/MSS][UC-STATION4-3D/MSS]` | Context Loss Catch | Bắt sự kiện `webglcontextlost` và gọi `e.preventDefault()` để bảo lưu canvas | ✅ PASS |
| `[TC-257.11/MSS][UC-STATION4-3D/MSS]` | Context Lost State | `gl.isContextLost() === true`, renderer không panic crash tiến trình | ✅ PASS |
| `[TC-257.12/MSS][UC-STATION4-3D/MSS]` | Context Restoration | Lắng nghe `webglcontextrestored`, xác nhận `gl.isContextLost() === false` | ✅ PASS |
| `[TC-257.13/MSS][UC-STATION4-3D/MSS]` | Re-render Recovery | Tái render Three.js sau phục hồi, ma trận camera không bị thoái hóa | ✅ PASS |
| `[TC-257.14/A1][UC-STATION4-3D/A1]` | Ngoại Lệ Frustum A1 | Tham số dị thường ($near \ge far$, $fov \le 0$, $fov \ge 180$) bị từ chối | ✅ PASS |
| `[TC-257.15/A1][UC-STATION4-3D/A1]` | Ngoại Lệ Aspect A1 | Aspect ratio âm bị từ chối; bộ tham số chuẩn được chấp nhận | ✅ PASS |
| `[TC-257.16/A2][UC-STATION4-3D/A2]` | Ngoại Lệ Matrix A2 | Ma trận chứa `NaN` hoặc `Infinity` bị `validateMatrixFinite` chặn đứng | ✅ PASS |
| `[TC-257.17/A3][UC-STATION4-3D/A3]` | Ngoại Lệ Loss A3 | Context lost không có `preventDefault()` trả về `'UNRECOVERABLE_ABORT'` | ✅ PASS |

---

### 3. BẢNG TUÂN THỦ DEFINITION OF DONE (DoD 1–6)

| Điều Khoản DoD | Tiêu Chí Kiểm Tra | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **DoD 1: TDD & Traceability** | Adversarial Inversion proven, 100% test có thẻ `[UC-STATION4-3D/MSS]` hoặc `[UC-STATION4-3D/A#]`. Sàn $\ge 15$ test atomic. | 17/17 atomic test contracts PASS, 0 loops trong `it()`, mật độ 1–4 asserts/test. | ✅ ĐẠT |
| **DoD 2: Linter & LOC Budgets** | `npm run lint:slop` (CC $\le 5$, trần LOC), `npm run lint:ui` (0 vi phạm). | 0 hard violations trên 306 tệp, 0 anti-patterns UI trên 216 tệp. 100% tệp trong ngưỡng Safe. | ✅ ĐẠT |
| **DoD 3: Review Funnel** | Phê duyệt tuần tự có biên bản lưu vết: `SPEC_REVIEW_IMP-257.md` & `CODE_REVIEW_IMP-257.md`. | Spec Reviewer: APPROVED. Code Reviewer: APPROVED. Cả hai tệp biên bản đã lưu trong `.agents/audit/`. | ✅ ĐẠT |
| **DoD 4: Station 4 Chaos Sentinel** | 3 physical probes: Parity, Dynamic Boundary, Real Mutation Sensitivity (0 surviving mutants). | WebGL2 Probe PASS (17/17), Mutation Probe PASS (5/5 mutants killed, 0 survived), Contract Suite PASS (17/17). | ✅ ĐẠT |
| **DoD 5: Ledger & Report** | Cập nhật Master Roadmap, đăng ký Tech Debt immutable key, xuất báo cáo đầy đủ 5 mục (a)-(e). | Đã đăng ký `DEBT-WEBGL-SCENE-INTEGRATION`, xuất báo cáo `IMP-257-headless-webgl2-sentinel-probe_report.md`. | ✅ ĐẠT |
| **DoD 6: Production Resilience** | Không rò rỉ tiến trình browser, dọn dẹp file sao lưu an toàn khi SIGINT/SIGTERM, cô lập trạng thái canvas. | Test độc lập 100% dưới `--sequence.shuffle`, dọn sạch canvas động trong `finally`, dọn sạch file backup `.sentinel_bak_*`. | ✅ ĐẠT |

---

### 4. BẰNG CHỨNG HÌNH ẢNH & KIỂM CHỨNG VẬT LÝ (PHASE 3.0)

- **Physical Headless Screenshot Artifact**: Ảnh chụp màn hình từ ngữ cảnh Chromium WebGL2 headless được ghi nhận tự động trong hook `afterAll` tại [`.agents/tmp/chaos_sentinel_imp-257.png`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/tmp/chaos_sentinel_imp-257.png) (1280x800, **11.914 bytes**).
- **Pixel Buffer Verification**: Bức ảnh hiển thị rõ ràng một khối hình học 3D màu xanh lục emerald (`#10B981`) với đường viền trắng tương phản trên nền Dark Slate (`#0F172A`). Test case `TC-257.03` đã đọc trực tiếp buffer màu qua `gl.readPixels()` tại tọa độ tâm canvas (640, 400), chứng minh quá trình rasterization phần cứng diễn ra thực sự.

---

### 5. THỰC THI SỐ LIỆU LOC & CHECK:LOC

| Tệp Mã Nguồn | Phân Loại Tier | Tổng Dòng (Lines) | SLOC Thực Tế | Ngưỡng Trần | Trạng Thái / Ghi Chú |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/spatial_invariants.ts` | Tier 1 (Domain Logic) | 12 | 10 | $\le 400$ | ✔️ Safe (Chỉ chứa `validateDrawCallsBudget`) |
| `src/client/3d/perf_budget.ts` | Tier 1 (Domain Logic) | 282 | 227 | $\le 400$ | ⚠️ Gần ngưỡng cảnh báo (Baseline: 281, Delta: +1) |
| `scripts/sentinel_runner.mjs` | Tooling / Script | 296 | 239 | $\le 400$ | ✔️ Safe |
| `scripts/check_evidence.mjs` | Tooling / Script | 172 | 143 | $\le 400$ | ✔️ Safe |
| `tests/probes/webgl_spatial_probe.test.ts` | Living Test Suite | 420 | 362 | $\le 600$ | ✔️ Safe (17 atomic test cases) |
| `tests/probes/spatial_test_helpers.ts` | Test Helper | 37 | 30 | $\le 300$ | ✔️ Safe |
| `vitest.config.ts` | Config | 34 | 31 | $\le 800$ | ✔️ Safe |
| `package.json` | Project Manifest | 64 | 63 | N/A | Exempt (Tệp kê khai dependency) |

---

### 6. ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC

#### 6.1 Nhật Ký Quan Sát Thô Từ Các Trạm (Raw Observations Log)
- **Scout (Trạm 2.5):** Phát hiện Rule 8 Anti-TIDD hiện tại chỉ bắt từ khóa `ForTesting` trên tên hàm, bỏ lọt các export không có người tiêu thụ sản xuất.
- **Code-Reviewer (Trạm 3.2):** Bắt buộc test suite Trạm 4 phải vượt qua kiểm thử ngẫu nhiên `--sequence.shuffle`; phát hiện ảnh chụp canvas ban đầu bị đen do chụp sau khi dispose renderer.
- **Sentinel Runner (Trạm 4):** Phát hiện số lượng mutant sinh ra từ các hàm đơn giản có thể không đạt sàn nếu không có cấu trúc phân nhánh rõ ràng.

#### 6.2 Ma Trận Phản Biện Đối Kháng 2 Vòng (Two-Round Cross-Examination Matrix)

| Ý Kiến Góp Ý / Quan Sát Thô | Vòng 1: Kiểm Chứng Bằng Chứng Vật Lý | Vòng 2: Bộ Lọc Nghịch Đảo & An Toàn Hiến Pháp | Kết Luận Thẩm Định |
| :--- | :--- | :--- | :---: |
| 1. Bổ sung script chạy probes vào CI (`package.json`) | **Physical Evidence Found**: `vitest.config.ts` loại trừ probe khi chạy `npm test`. Đã thêm `test:probes` thành công. | Cần thiết để đảm bảo không bị regression ngầm. | **[VERIFIED ACTIONABLE RECOMMENDATION]** |
| 2. Bắt buộc lưu biên bản review vật lý vào `.agents/audit/` | **Physical Evidence Found**: Ban đầu thiếu 2 file review trên đĩa. Đã bổ sung `SPEC_REVIEW_IMP-257.md` và `CODE_REVIEW_IMP-257.md`. | Phù hợp nguyên tắc kiểm chứng vật lý của dự án. | **[VERIFIED ACTIONABLE RECOMMENDATION]** |
| 3. Kiểm tra độ lệch pixel (Pixel Variance) chống ảnh đen | **Physical Evidence Found**: Ban đầu lọt ảnh đen 4.7KB. Sau khi render mesh và assert `readPixels`, ảnh đạt 11.9KB có màu rõ rệt. | Ngăn chặn ngụy tạo bằng chứng hình ảnh trong CI. | **[VERIFIED ACTIONABLE RECOMMENDATION]** |
| 4. Nâng cấp Rule 8 `lint:slop` quét Orphan Exports | **Physical Evidence Found**: `spatial_invariants.ts` ban đầu có 3 hàm không ai trong `src/**` gọi nhưng linter không báo. | Nâng cao chất lượng kiến trúc, ngăn chặn phình API chết. | **[VERIFIED ACTIONABLE RECOMMENDATION]** |

#### 6.3 Đề Xuất Cải Tiến Cụ Thể (Verified Actionable Recommendations)
1. **Khuyến nghị 1 (CI Probe Target):** Đã bổ sung `"test:probes": "cross-env VITEST_PROBE=1 vitest run tests/probes/"` vào `package.json`. Khuyến nghị tích hợp target này vào quy trình CI chạy nightly hoặc pre-merge đối với các nhánh 3D.
2. **Khuyến nghị 2 (Bảo Vệ Anti-TIDD Cơ Học):** Cập nhật script `scripts/lint_slop.mjs` bổ sung kiểm tra orphan exports cho các tệp mới/sửa đổi trong `src/**`.
3. **Khuyến nghị 3 (Biên Bản Trạm 3):** Cập nhật prompt của `spec-reviewer` và `code-reviewer` bắt buộc xuất tệp markdown kết luận vào `.agents/audit/`.
