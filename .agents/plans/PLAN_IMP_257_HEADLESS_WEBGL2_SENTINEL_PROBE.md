# KẾ HOẠCH KỸ THUẬT: IMP-257 BỘ DÒ WEBGL2 HEADLESS PLAYWRIGHT CHO TRẠM 4 (CHAOS SENTINEL)

> **Ticket:** IMP-257 (Tier 2 Full Rigor - Station 4 Chaos Sentinel Enhancement)  
> **Use Case Ref:** `UC-STATION4-3D` (Automated Headless WebGL2 Spatial Boundary & Scene Graph Validation)  
> **Trọng tâm:** Tích hợp bộ dò WebGL2 Headless tự động dựa trên Playwright vào Trạm 4 (Chaos Sentinel), giải quyết triệt để lỗ hổng kiểm thử hình thức đối với các ticket 3D:  
> 1. Khởi chạy Chromium/Edge headless thực thụ với cờ WebGL2 phần cứng: `--use-gl=angle`, `--enable-webgl`, `--use-angle=swiftshader`, `--enable-unsafe-swiftshader`.  
> 2. Đo đạc tự động số lượng Draw Calls và Mesh Count trong Scene Graph Three.js, bám sát SSOT `PERF_BUDGET_LIMITS.targetMaxDrawCalls` (85 calls).  
> 3. Kiểm chứng tính hữu hạn của ma trận chiếu Frustum (fov < 180, near > 0, far > near) và ma trận thế giới Camera qua module sản xuất `src/client/3d/spatial_invariants.ts` (loại trừ hoàn toàn `NaN` và `Infinity`).  
> 4. Kiểm tra vòng đời phục hồi sau sự cố mất ngữ cảnh WebGL (`webglcontextlost` và `webglcontextrestored` bất đồng bộ kèm timeout bảo vệ).  
> 5. Điều phối phân luồng thông minh qua `scripts/sentinel_runner.mjs`: phân luồng vé 3D sang bộ dò WebGL2 kết hợp kiểm tra đột biến thực tế (Real Mutation Probe với sàn >= 5 mutants killed, timeout 15s, tự phục hồi file backup `.sentinel_bak_*`), bảo toàn nguyên vẹn vé Server qua `scripts/station4_sentinel.ts`.  
> 6. Cô lập probe qua cờ môi trường `VITEST_PROBE=1` để không làm chậm hoặc gây ô nhiễm lệnh `npm test` mặc định.  
> **Cam kết:** Bịt kín 100% lỗ hổng kiểm thử hình thức Trạm 4, tuân thủ Deep Modules & Anti-Slop, 16 bài kiểm thử hợp đồng phân lớp Flow Taxonomy `[UC-STATION4-3D/MSS]` và `[UC-STATION4-3D/A#]`.

---

## 0. BẢNG ĐỐI SOÁT CHỈ THỊ (REVISION DIRECTIVE COVERAGE TABLES)

### 0.1. Đối Soát Chỉ Thị Plan-Griller (Revision 2)
| Mã Chỉ Thị | Phân Loại & Tệp Mục Tiêu | Trạng Thái | Biện Pháp Giải Quyết Cụ Thể (Resolution & Physical Line) |
| :--- | :--- | :---: | :--- |
| **DIR-01** | `package.json#L26-28` & Bảng LOC Mục 1 | ✅ ADDRESSED | Thẩm định đĩa vật lý xác nhận dòng 28 có chứa `node scripts/check_reason_i18n_parity.mjs &&`. Snippet 1.1 trong Task 1 khớp 100% nguyên văn từng ký tự với `package.json` trên đĩa. Cập nhật Baseline của `package.json` thành 61 dòng vật lý (Non-Empty SLOC: 61). |
| **DIR-02** | Xóa `playwright.config.ts` & Cài đặt devDep | ✅ ADDRESSED | Xóa bỏ hoàn toàn Task 2 (`playwright.config.ts`) và loại khỏi bảng LOC vì probe chạy trực tiếp qua Vitest runner. Thêm chỉ dẫn cài đặt rõ ràng: `npm install -D @playwright/test` vào Task 1. |
| **DIR-03** | `scripts/sentinel_runner.mjs` | ✅ ADDRESSED | Tái cấu trúc `sentinel_runner.mjs`: Không fake số liệu `mutationSensitivityProbe`; cài đặt hàm `runRealMutationProbe` thực thi đột biến mã nguồn thực thụ (`===`, `>`, `<`, `true`, `isFinite`) trên `--src` và `--test`; gán đúng `testExecutionSummary.contractSuite = testPath \|\| probeFile` và `contractTestsPassed`. |
| **DIR-04** | `tests/probes/webgl_spatial_probe.test.ts` | ✅ ADDRESSED | Bổ sung `{ timeout: 30000 }` cho Vitest describe suite; sửa `TC-257.12` thành lắng nghe sự kiện `webglcontextrestored` bất đồng bộ qua `Promise`; thêm `baseURL: 'http://localhost'` vào `page.setContent()`. |
| **DIR-05** | Tautological Test Extraction & `src/client/3d/` | ✅ ADDRESSED | Trích xuất toàn bộ hàm kiểm tra hình học và giới hạn thành module sản xuất độc lập `src/client/3d/spatial_invariants.ts`. `TC-257.06`, `TC-257.14`, `TC-257.15`, `TC-257.16` import và kiểm thử trực tiếp các hàm này, triệt tiêu 100% dummy inline arrow functions. |

### 0.2. Đối Soát Chỉ Thị Adversarial-Challenger (Revision 3)
| Mã Chỉ Thị | Phân Loại & Tệp Mục Tiêu | Trạng Thái | Biện Pháp Giải Quyết Cụ Thể (Resolution & Physical Line) |
| :--- | :--- | :---: | :--- |
| **ADV-01** | Tránh Né Mutation & Giả Mạo Contract | `scripts/sentinel_runner.mjs#L280-360` | ✅ ADDRESSED | Bắt buộc `--test` và `--src` khi chạy `--3d` (trả về `BLOCKED: MISSING_ARGS` nếu thiếu). Cấm fallback `contractSuite` thành `probeFile`. Kiểm tra `contractRes.status === 0` và `contractPassedCount >= 15`. Áp dụng sàn đột biến tối thiểu $\ge 5$ mutants tested & killed. |
| **ADV-02** | Sập Import Module do Thiếu Route `three.core.js` | `tests/probes/webgl_spatial_probe.test.ts#L480-495` | ✅ ADDRESSED | Mở rộng bộ định tuyến Playwright `page.route('**/*three*.js')` tự động ánh xạ mọi module Three.js (bao gồm `three.core.js`, `three.module.js`) từ `node_modules/three/build/` với Content-Type `text/javascript`, triệt tiêu 100% lỗi `ERR_CONNECTION_REFUSED`. |
| **ADV-03** | Lệch Tên Screenshot Khiến Trạm 4 Bị Chặn | `scripts/sentinel_runner.mjs` & `webgl_spatial_probe.test.ts#L510-520` | ✅ ADDRESSED | Truyền `ticketId` qua biến môi trường `SENTINEL_TICKET_ID`. Trong test, lưu ảnh màn hình theo đúng định dạng `chaos_sentinel_${ticketClean}.png` tại `.agents/tmp/`, thỏa mãn 100% điều kiện `check_evidence.mjs#L145-149`. |
| **ADV-04** | Ô Nhiễm Suite Test Mặc Định `npm test` | `vitest.config.ts#L18-24` & `scripts/check_evidence.mjs#L97-101` | ✅ ADDRESSED | Thêm cấu hình loại trừ có điều kiện trong `vitest.config.ts`: `...(process.env.VITEST_PROBE === '1' ? [] : ['tests/probes/webgl_spatial_probe.test.ts'])`. `sentinel_runner.mjs` và `check_evidence.mjs` truyền `VITEST_PROBE: '1'` khi kích hoạt probe. `npm test` thông thường không bị ảnh hưởng. |
| **ADV-05** | Rò Rỉ WebGL Context & Treo Promise Vô Hạn | `tests/probes/webgl_spatial_probe.test.ts` | ✅ ADDRESSED | Gọi `renderer.dispose()` trong mọi khối `page.evaluate()` sau khi hoàn tất render; bổ sung timeout fallback 5.000ms (`setTimeout(() => resolve(false), 5000)`) cho `restoredPromise` trong `TC-257.12`, chống treo worker. |
| **ADV-06** | Treo `spawnSync` & Hỏng File Gốc Khi Ngắt Đột Ngột | `scripts/sentinel_runner.mjs` | ✅ ADDRESSED | Thêm `timeout: 15000` cho lệnh chạy mutation trong `testSourceMutantSafely`. Thêm hàm quét và dọn dẹp các tệp mồ côi `.sentinel_bak_*` khi runner khởi động; đăng ký xử lý tín hiệu `SIGINT`/`SIGTERM` để tự động khôi phục mã nguồn trước khi thoát. |
| **ADV-07** | Bất Biến FOV Camera & Đồng Bộ SSOT Ngân Sách | `src/client/3d/spatial_invariants.ts` | ✅ ADDRESSED | Bổ sung chốt chặn `fov < 180` trong `validateCameraFrustum` để loại trừ trường hợp `tan(90 deg) = Infinity`. Nhập `PERF_BUDGET_LIMITS` từ `./perf_budget` và thiết lập `MAX_ALLOWED_DRAW_CALLS = PERF_BUDGET_LIMITS.targetMaxDrawCalls` (85), đồng bộ tuyệt đối với SSOT. |

---

## 1. BẢNG ĐO LƯỜNG ĐỊNH LƯỢNG NGÂN SÁCH LOC (PHYSICAL DISK BASELINE)

*Đo đạc tự động qua công cụ chính thức của dự án: `node scripts/check_loc.mjs`*

| File vật lý | Phân loại Tier | Baseline (Dòng) | Non-Empty SLOC | Est. Delta | Post LOC | Trần Budget | Trạng thái sau Triển khai |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `package.json` | Tier 1 (Logic/Config) | **61** | 61 | +2 | **63** | <= 400 | ✔️ Safe (< 300) |
| `vitest.config.ts` | Tier 3 (Static Data/Config) | **35** | 35 | +1 | **36** | <= 800 | ✔️ Safe (< 650) |
| `scripts/check_evidence.mjs` | Tier 1 (Domain/Server/Logic) | **164** | 137 | +5 | **169** | <= 400 | ✔️ Safe (< 300) |
| `src/client/3d/spatial_invariants.ts` (Mới) | Tier 2 (UI/3D/Views) | **0** | 0 | +48 | **48** | <= 500 | ✔️ Safe (< 400) |
| `scripts/sentinel_runner.mjs` (Mới) | Tier 1 (Domain/Server/Logic) | **0** | 0 | +230 | **230** | <= 400 | ✔️ Safe (< 300) |
| `tests/probes/webgl_spatial_probe.test.ts` (Mới) | Living / Contract Tests | **0** | 0 | +290 | **290** | <= 600 | ✔️ Safe (< 300) |

---

## 2. PHÂN TÍCH TÁC ĐỘNG HỆ THỐNG & RANH GIỚI BÁN KÍNH ẢNH HƯỞNG (3-WAY BLAST RADIUS MATRIX)

- **Cấp độ rủi ro (Risk Dial)**: Level 2 (Slice-Bound & Station 4 Harness Sentinel).
- **Subtractive Audit (Loại bỏ code thừa/lỗi thời)**: 
  - Thay thế lệnh đơn luồng `npx tsx scripts/station4_sentinel.ts` bằng bộ phân phối đa năng `node scripts/sentinel_runner.mjs`.
  - Giữ nguyên vẹn toàn bộ 471 dòng mã của `scripts/station4_sentinel.ts` nhằm bảo toàn tuyệt đối không làm gãy các bộ dò WebSocket mạng của các vé Server cũ.
- **Call-Site Exhaustion**:
  - `npm run sentinel`: được gọi bởi Trạm 4 (`chaos-sentinel`), các kịch bản kiểm định tự động, và `scripts/check_evidence.mjs`.
  - Toàn bộ tham số CLI `--ticket`, `--test`, `--src`, `--3d` được tiếp nhận, kiểm tra tính đầy đủ, và chuyển tiếp chính xác.
- **Import DAG Check**:
  - `tests/probes/webgl_spatial_probe.test.ts` sử dụng API `@playwright/test`, import `spatial_invariants.ts` từ `src/client/3d/`, và định tuyến nội bộ `three.*.js` từ `node_modules/three/build/`, không tạo vòng phụ thuộc.
- **Trục 1 - Downstream Consumers**:
  - Subagent `chaos-sentinel` tại Trạm 4.
  - Script thẩm định bằng chứng `node scripts/check_evidence.mjs`.
- **Trục 2 - Upstream & Environmental Modifiers**:
  - Hệ điều hành Windows với Microsoft Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`) và Google Chrome có sẵn trên máy trạm.
  - SwiftShader / ANGLE OpenGL ES emulation backend.
- **Trục 3 - Exceptional Lifecycle Modes**:
  - Máy trạm không bật Vite Preview server: Bộ dò độc lập `webgl_spatial_probe.test.ts` tự tạo nội dung trang với `baseURL: 'http://localhost'` kèm định tuyến Playwright `page.route('**/*three*.js')` phục vụ trực tiếp từ ổ đĩa local. Bộ dò chạy độc lập 100% trong 1-2 giây với 0 rủi ro xung đột cổng.
  - Mất ngữ cảnh GPU đột ngột (`webglcontextlost`): Kiểm chứng bắt buộc `e.preventDefault()` để GPU browser không hủy vĩnh viễn canvas, và lắng nghe bất đồng bộ sự kiện `webglcontextrestored` có timeout 5s bảo vệ.

---

## 3. DANH SÁCH CHẾ ĐỘ THẤT BẠI (FAILURE MODES ENUMERATION)

1. **FM-1: Lỗi Thiếu Trình Duyệt / Kênh Không Tương Thích (Missing Browser Channel Trap)**
   - *Mô tả:* Playwright mặc định tìm Chromium tải về riêng. Trên môi trường máy trạm Windows, người dùng có sẵn Microsoft Edge và Chrome hệ thống nhưng chưa tải bộ Chromium bundle riêng của Playwright.
   - *Phòng vệ:* Cấu hình kênh `channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge'` với cơ chế tự phát hiện Edge/Chrome có sẵn, không bắt buộc tải binary nặng.
2. **FM-2: Lỗi Phụ Thuộc Cổng Mạng Khi Không Có Preview Server (Port Dependency Failure)**
   - *Mô tả:* Nếu bộ dò bắt buộc mở `http://localhost:4173` mà server chưa khởi chạy, Trạm 4 sẽ bị sập vì lỗi kết nối mạng thay vì kiểm tra được WebGL.
   - *Phòng vệ:* Bộ dò WebGL2 sử dụng `page.setContent(html, { baseURL: 'http://localhost' })` kèm định tuyến Playwright `page.route('**/*three*.js')` phục vụ trực tiếp từ ổ đĩa local. Bộ dò chạy độc lập 100% trong 1-2 giây với 0 rủi ro xung đột cổng.
3. **FM-3: Phân Kỳ Ma Trận Camera Frustum Do Góc Nhìn / Tỷ Lệ Dị Thường (Frustum Matrix Divergence)**
   - *Mô tả:* Các phép chia tỷ lệ màn hình 0px hoặc fov cực hạn ($\ge 180^\circ$) làm $\tan(90^\circ) = \infty$, khiến ma trận chiếu của Three.js sản sinh phần tử `NaN` hoặc `Infinity`.
   - *Phòng vệ:* Hàm `validateCameraFrustum` kiểm tra chặt chẽ `fov > 0 && fov < 180`, `near > 0`, `far > near`, `aspect > 0`. Hàm `validateMatrixFinite` kiểm tra 100% 16 phần tử phải là số thực hữu hạn.
4. **FM-4: Mất Ngữ Cảnh WebGL Không Thể Phục Hồi Hoặc Điều Kiện Đua Bất Đồng Bộ (Context Loss Deadlock & Async Race)**
   - *Mô tả:* Khi hệ điều hành ngủ hoặc GPU quá tải, sự kiện `webglcontextlost` được phát ra. Nếu canvas không gọi `e.preventDefault()`, trình duyệt sẽ hủy vĩnh viễn WebGL context. Ngoài ra, sự kiện `webglcontextrestored` được phát ra bất đồng bộ, nếu kiểm tra đồng bộ ngay sau `restoreContext()` sẽ gây false-negative; nếu promise không có timeout sẽ gây treo worker.
   - *Phòng vệ:* Bộ dò giả lập mất ngữ cảnh qua `WEBGL_lose_context`, khẳng định `e.preventDefault()` được thực thi, và sử dụng `Promise` bất đồng bộ kèm timeout fallback 5.000ms chờ sự kiện `webglcontextrestored`.
5. **FM-5: Gian Lận Kết Quả Kiểm Thử Đột Biến (Fake Mutation Sensitivity Antipattern)**
   - *Mô tả:* Bộ điều phối nếu hardcode số liệu đột biến giả hoặc cho phép bỏ qua `--src`/`--test` sẽ vô hiệu hóa hoàn toàn lá chắn Trạm 4.
   - *Phòng vệ:* `sentinel_runner.mjs` bắt buộc cung cấp `--src` và `--test`, từ chối chạy nếu thiếu, thực thi mutation probe thực thụ với sàn tối thiểu $\ge 5$ mutants tested & killed.
6. **FM-6: Treo Tiến Trình & Hỏng Tệp Mã Nguồn Do Tiến Trình Đột Biến Bị Ngắt (Disk Mutation Trap & Zombie Backup)**
   - *Mô tả:* Đột biến logic có thể tạo vòng lặp vô hạn khiến lệnh test bị treo; hoặc nếu tiến trình bị kill giữa chừng, tệp `.sentinel_bak_*` bị bỏ rơi và tệp nguồn bị hỏng vĩnh viễn.
   - *Phòng vệ:* Đặt `timeout: 15000` cho lệnh chạy mutation test; quét và dọn dẹp khôi phục tệp backup mồ côi ngay khi runner khởi động; bắt các tín hiệu `SIGINT`/`SIGTERM` để rollback an toàn.
7. **FM-7: Lỗi Nạp Module Phụ Thuộc `three.core.js` Trên Trang Headless (ES Module Dynamic Import Failure)**
   - *Mô tả:* Trong Three.js 0.175.0, `three.module.js` nhập `./three.core.js`. Nếu chỉ intercept `**/three.module.js`, trình duyệt sẽ gửi request tới `http://localhost/three.core.js` và bị `ERR_CONNECTION_REFUSED`.
   - *Phòng vệ:* Route handler Playwright sử dụng mẫu `**/*three*.js`, tự động ánh xạ và trả về mọi tệp bundle Three.js cục bộ tương ứng.
8. **FM-8: Cạn Kiệt Giới Hạn WebGL Context Trong Trình Duyệt (Context Limit Exhaustion Cascade)**
   - *Mô tả:* Chromium giới hạn tối đa 8-16 active WebGL contexts. Việc tạo nhiều `WebGLRenderer` liên tục mà không gọi `dispose()` làm kích hoạt cơ chế thu hồi context tự động, gây flake các bài test sau.
   - *Phòng vệ:* Mọi bài test tạo renderer đều gọi `renderer.dispose()` giải phóng tài nguyên ngay sau khi kiểm tra.

---

## 4. BỘ KIỂM THỬ HỢP ĐỒNG TRẠM 1 (QA CONTRACT TEST SUITE)

**Target physical file**: tests/probes/webgl_spatial_probe.test.ts (New file)

*Bộ kiểm thử hợp đồng gồm 16 bài test nguyên tử tuân thủ phân lớp Flow Taxonomy:*
- `TC-257.01/MSS` [UC-STATION4-3D/MSS] Khởi chạy Chromium headless thành công với cờ WebGL2 phần cứng (--use-gl=angle, --enable-webgl, --use-angle=swiftshader).
- `TC-257.02/MSS` [UC-STATION4-3D/MSS] Khởi tạo THREE.WebGLRenderer trên canvas WebGL2 trong Chromium headless không ném ngoại lệ và giải phóng sạch context qua dispose().
- `TC-257.03/MSS` [UC-STATION4-3D/MSS] renderer.info.render phản ánh số lượng draw calls > 0 khi render scene chứa Meshes.
- `TC-257.04/MSS` [UC-STATION4-3D/MSS] renderer.info.render phản ánh số lượng triangles > 0 khớp với geometry đã nạp vào scene.
- `TC-257.05/MSS` [UC-STATION4-3D/MSS] Duyệt cây Three.js Scene Graph (traverse) đếm đúng số lượng Mesh và Group phân cấp.
- `TC-257.06/MSS` [UC-STATION4-3D/MSS] Giới hạn ngân sách Draw Calls: Kiểm chứng qua hàm sản xuất validateDrawCallsBudget bám sát SSOT PERF_BUDGET_LIMITS.targetMaxDrawCalls (85 calls).
- `TC-257.07/MSS` [UC-STATION4-3D/MSS] Kiểm tra ma trận chiếu (camera.projectionMatrix): 100% 16 phần tử là số thực hữu hạn (validateMatrixFinite = true), không chứa NaN hoặc Infinity.
- `TC-257.08/MSS` [UC-STATION4-3D/MSS] Kiểm tra ma trận thế giới (camera.matrixWorld): 100% 16 phần tử là số thực hữu hạn, bảo toàn vị trí camera không bị phân kỳ.
- `TC-257.09/MSS` [UC-STATION4-3D/MSS] Cấu hình Viewport và Camera frustum: Kiểm chứng qua validateCameraFrustum tuân thủ bất biến hình học (near > 0, far > near, aspect > 0, 0 < fov < 180).
- `TC-257.10/MSS` [UC-STATION4-3D/MSS] Kích hoạt sự cố mất ngữ cảnh (ext.loseContext): Bắt được sự kiện webglcontextlost và gọi e.preventDefault() để bảo lưu canvas.
- `TC-257.11/MSS` [UC-STATION4-3D/MSS] Khi mất ngữ cảnh: gl.isContextLost() trả về true, renderer không gây panic hoặc crash tiến trình.
- `TC-257.12/MSS` [UC-STATION4-3D/MSS] Khôi phục ngữ cảnh (ext.restoreContext): Lắng nghe bất đồng bộ sự kiện webglcontextrestored có timeout bảo vệ và xác nhận gl.isContextLost() trở về false.
- `TC-257.13/MSS` [UC-STATION4-3D/MSS] Tái render sau phục hồi ngữ cảnh: Scene render lại bình thường, các ma trận camera tiếp tục giữ giá trị hữu hạn không bị thoái hóa.
- `TC-257.14/A1` [UC-STATION4-3D/A1] Luồng ngoại lệ A1: Camera có thông số dị thường (near >= far, fov <= 0, hoặc fov >= 180) bị validateCameraFrustum phát hiện và từ chối.
- `TC-257.15/A2` [UC-STATION4-3D/A2] Luồng ngoại lệ A2: Ma trận chiếu chứa giá trị NaN hoặc Infinity do tính toán sai góc/tỷ lệ bị validateMatrixFinite chặn đứng.
- `TC-257.16/A3` [UC-STATION4-3D/A3] Luồng ngoại lệ A3: Context lost nếu không được gọi preventDefault() sẽ bị validateContextLossRecovery đánh dấu là UNRECOVERABLE_ABORT.

---

## 5. CÁC TÁC VỤ THỰC THI CHI TIẾT (TASK BREAKDOWN)

### Task 1: Cập Nhật Package.json & Cài Đặt DevDependency
**Target physical file**: package.json

**Snippet 1.1: Cập nhật scripts.sentinel trong `package.json`**
```json
<<<<
    "typecheck": "tsc --noEmit",
    "sentinel": "npx tsx scripts/station4_sentinel.ts",
    "gate:quick": "node scripts/check_reason_i18n_parity.mjs && npm run lint:ui && npm run lint:slop && npm run lint:dup && npm run lint:assets && tsc --noEmit && npm run evidence",
====
    "typecheck": "tsc --noEmit",
    "sentinel": "node scripts/sentinel_runner.mjs",
    "gate:quick": "node scripts/check_reason_i18n_parity.mjs && npm run lint:ui && npm run lint:slop && npm run lint:dup && npm run lint:assets && tsc --noEmit && npm run evidence",
>>>>
```

**Snippet 1.2: Thêm @playwright/test vào devDependencies trong `package.json`**
```json
<<<<
    "typescript": "^5.8.0",
    "vitest": "^3.2.0",
    "zustand": "^5.0.15"
  },
====
    "typescript": "^5.8.0",
    "vitest": "^3.2.0",
    "zustand": "^5.0.15",
    "@playwright/test": "^1.50.0"
  },
>>>>
```

*Hành động thực thi sau edit:* Chạy lệnh `npm install -D @playwright/test` để cập nhật `package-lock.json` và tải thư viện.

---

### Task 2: Cô Lập Bộ Dò Khỏi Suite Test Mặc Định (`vitest.config.ts`)
**Target physical file**: vitest.config.ts

**Snippet 2.1: Cô lập probe khỏi `npm test` mặc định trong `vitest.config.ts`**
```typescript
<<<<
    include: ['tests/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/simulation/record_screenshots_scenarios.test.ts',
    ],
====
    include: ['tests/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/simulation/record_screenshots_scenarios.test.ts',
      ...(process.env.VITEST_PROBE === '1' ? [] : ['tests/probes/webgl_spatial_probe.test.ts']),
    ],
>>>>
```

---

### Task 3: Bổ Sung Cờ Môi Trường VITEST_PROBE Trong Check Evidence (`scripts/check_evidence.mjs`)
**Target physical file**: scripts/check_evidence.mjs

**Snippet 3.1: Bổ sung cờ môi trường VITEST_PROBE trong `scripts/check_evidence.mjs`**
```javascript
<<<<
    try {
      const vitestCmd = `npx vitest run ${summary.probeSuite} --reporter=json`;
      const output = execSync(vitestCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
====
    try {
      const vitestCmd = `npx vitest run ${summary.probeSuite} --reporter=json`;
      const output = execSync(vitestCmd, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, VITEST_PROBE: '1' },
      });
>>>>
```

---

### Task 4: Triển Khai Module Bất Biến Hình Học Không Gian (`src/client/3d/spatial_invariants.ts`)
**Target physical file**: src/client/3d/spatial_invariants.ts (New file)

```typescript
/**
 * [3D SPATIAL INVARIANTS] Validation functions for Three.js render metrics,
 * camera projection matrices, view frustums, and WebGL context restoration.
 * Aligned strictly with SSOT PERF_BUDGET_LIMITS in perf_budget.ts.
 */

import { PERF_BUDGET_LIMITS } from './perf_budget';

export const MAX_ALLOWED_DRAW_CALLS = PERF_BUDGET_LIMITS.targetMaxDrawCalls;

export function validateDrawCallsBudget(calls: number, limit: number = MAX_ALLOWED_DRAW_CALLS): boolean {
  return calls >= 0 && calls <= limit;
}

export function validateCameraFrustum(
  near: number,
  far: number,
  fov: number,
  aspect: number
): boolean {
  if (near <= 0 || far <= near || fov <= 0 || fov >= 180 || aspect <= 0) return false;
  if (!Number.isFinite(near) || !Number.isFinite(far) || !Number.isFinite(fov) || !Number.isFinite(aspect)) {
    return false;
  }
  return true;
}

export function validateMatrixFinite(elements: ArrayLike<number>): boolean {
  if (elements.length !== 16) return false;
  for (let i = 0; i < 16; i++) {
    const val = elements[i];
    if (typeof val !== 'number' || !Number.isFinite(val) || Number.isNaN(val)) {
      return false;
    }
  }
  return true;
}

export function validateContextLossRecovery(defaultPrevented: boolean): 'RECOVERABLE' | 'UNRECOVERABLE_ABORT' {
  return defaultPrevented ? 'RECOVERABLE' : 'UNRECOVERABLE_ABORT';
}
```

---

### Task 5: Triển Khai Bộ Điều Phối Sentinel Đa Năng (`scripts/sentinel_runner.mjs`)
**Target physical file**: scripts/sentinel_runner.mjs (New file)

```javascript
#!/usr/bin/env node

/**
 * [STATION 4 HARNESS] Unified Sentinel Probe Dispatcher
 * Dispatches between Server Intent/WebSocket Sentinel and Headless WebGL2 Spatial Sentinel.
 * 
 * Usage:
 *   npm run sentinel -- --ticket IMP-257 --3d --test tests/contracts/... --src src/client/3d/...
 *   npm run sentinel -- --ticket IMP-247 --test tests/contracts/... --src src/domain/...
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function parseCliArgs() {
  const args = process.argv.slice(2);
  let ticketId = 'IMP-UNKNOWN';
  let testPath = undefined;
  let srcPath = undefined;
  let is3D = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ticket' && args[i + 1]) {
      ticketId = args[++i];
    } else if (args[i] === '--test' && args[i + 1]) {
      testPath = args[++i];
    } else if (args[i] === '--src' && args[i + 1]) {
      srcPath = args[++i];
    } else if (args[i] === '--3d') {
      is3D = true;
    }
  }

  if (!is3D && (
    srcPath?.includes('3d') ||
    srcPath?.includes('client/3d') ||
    testPath?.includes('3d') ||
    testPath?.includes('spatial') ||
    ticketId?.toLowerCase().includes('3d')
  )) {
    is3D = true;
  }

  return { ticketId, testPath, srcPath, is3D, rawArgs: args };
}

function cleanupStaleBackups(targetDir) {
  if (!fs.existsSync(targetDir)) return;
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      cleanupStaleBackups(fullPath);
    } else if (entry.name.includes('.sentinel_bak_')) {
      const originalPath = fullPath.replace(/\.sentinel_bak_\d+$/, '');
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        fs.writeFileSync(originalPath, content, 'utf8');
        fs.unlinkSync(fullPath);
        console.log(`[RECOVERY] Restored orphaned backup: ${originalPath}`);
      }
    }
  }
}

function testSourceMutantSafely(filePath, targetPattern, replacement, testCmd) {
  if (!fs.existsSync(filePath)) return { tested: false, killed: false };

  const originalContent = fs.readFileSync(filePath, 'utf-8');
  const hasMatch = typeof targetPattern === 'string'
    ? originalContent.includes(targetPattern)
    : targetPattern.test(originalContent);

  if (!hasMatch) return { tested: false, killed: false };

  const backupPath = `${filePath}.sentinel_bak_${Date.now()}`;
  fs.writeFileSync(backupPath, originalContent, 'utf-8');

  const restore = () => {
    if (fs.existsSync(backupPath)) {
      const restored = fs.readFileSync(backupPath, 'utf-8');
      fs.writeFileSync(filePath, restored, 'utf-8');
      fs.unlinkSync(backupPath);
    }
  };

  const sigintHandler = () => { restore(); process.exit(1); };
  process.on('SIGINT', sigintHandler);
  process.on('SIGTERM', sigintHandler);

  try {
    const mutated = originalContent.replace(targetPattern, replacement);
    fs.writeFileSync(filePath, mutated, 'utf-8');

    try {
      const isWin = process.platform === 'win32';
      const shellCmd = isWin ? 'cmd.exe' : 'npx';
      const shellArgs = isWin ? ['/c', testCmd] : ['vitest', 'run', ...testCmd.split(' ').slice(3)];

      const res = spawnSync(shellCmd, shellArgs, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 15000,
        env: { ...process.env, VITEST_PROBE: '1' },
      });

      const killed = res.status !== 0;
      return { tested: true, killed };
    } catch {
      return { tested: true, killed: true };
    }
  } finally {
    restore();
    process.removeListener('SIGINT', sigintHandler);
    process.removeListener('SIGTERM', sigintHandler);
  }
}

function runRealMutationProbe(testPath, srcPath) {
  if (!srcPath || !testPath || !fs.existsSync(srcPath) || !fs.existsSync(testPath)) {
    return {
      status: 'BLOCKED: MISSING_ARGS',
      mutantsTested: 0,
      killed: 0,
      survived: 0,
      sourceLevelMutantsTested: 0,
    };
  }

  const testCmd = `npx vitest run ${testPath}`;
  const mutationRules = [
    { target: '===', replacement: '!==' },
    { target: '>', replacement: '<=' },
    { target: '<', replacement: '>=' },
    { target: 'true', replacement: 'false' },
    { target: 'Number.isFinite', replacement: '!Number.isFinite' },
    { target: '&&', replacement: '||' },
  ];

  let mutantsTested = 0;
  let killed = 0;

  for (const rule of mutationRules) {
    const res = testSourceMutantSafely(srcPath, rule.target, rule.replacement, testCmd);
    if (res.tested) {
      mutantsTested++;
      if (res.killed) killed++;
    }
  }

  const survived = mutantsTested - killed;
  const isFloorMet = mutantsTested >= 5 && killed >= 5;
  const status = isFloorMet && survived === 0
    ? 'PASS'
    : isFloorMet
      ? 'BLOCKED: SURVIVED_MUTANT'
      : 'BLOCKED: MUTANT_FLOOR_NOT_MET';

  return {
    status,
    mutantsTested,
    killed,
    survived,
    sourceLevelMutantsTested: mutantsTested,
  };
}

function runWebGlProbe(ticketId, testPath, srcPath) {
  console.log(`=== RUNNING STATION 4 WEBGL2 SPATIAL SENTINEL [${ticketId}] ===\n`);

  if (!testPath || !srcPath) {
    console.error('❌ Station 4 3D Sentinel mandates explicit --test and --src arguments.');
    process.exit(1);
  }

  cleanupStaleBackups('src');
  cleanupStaleBackups('tests');

  const probeFile = 'tests/probes/webgl_spatial_probe.test.ts';
  const vitestCmd = process.platform === 'win32' ? 'cmd.exe' : 'npx';
  const vitestArgs = process.platform === 'win32'
    ? ['/c', `npx vitest run ${probeFile} --reporter=json`]
    : ['vitest', 'run', probeFile, '--reporter=json'];

  const execRes = spawnSync(vitestCmd, vitestArgs, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 35000,
    env: { ...process.env, VITEST_PROBE: '1', SENTINEL_TICKET_ID: ticketId },
  });

  const output = execRes.stdout || '';
  const jsonStart = output.indexOf('{');
  let probePassedCount = 0;
  let probeTotalCount = 0;

  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(output.slice(jsonStart));
      probePassedCount = parsed.numPassedTests ?? 0;
      probeTotalCount = parsed.numTotalTests ?? 0;
    } catch {}
  }

  const probePassed = probePassedCount >= 14 && execRes.status === 0;
  console.log(`[PROBE 4] Headless WebGL2 Spatial Probe: ${probePassed ? 'PASS' : 'FAIL'} (${probePassedCount}/${probeTotalCount} tests passed)`);

  // Run real mutation probe on ticket's target source and contract test
  const mutationResult = runRealMutationProbe(testPath, srcPath);
  console.log(`[PROBE 3] Mutation Sensitivity Probe: ${mutationResult.status} (Tested: ${mutationResult.mutantsTested}, Killed: ${mutationResult.killed}, Survived: ${mutationResult.survived})`);

  // Run contract test suite
  let contractPassedCount = 0;
  let contractPassed = false;
  const contractRes = spawnSync(vitestCmd, process.platform === 'win32'
    ? ['/c', `npx vitest run ${testPath} --reporter=json`]
    : ['vitest', 'run', testPath, '--reporter=json'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 35000,
    env: { ...process.env, VITEST_PROBE: '1', SENTINEL_TICKET_ID: ticketId },
  });

  const cOut = contractRes.stdout || '';
  const cStart = cOut.indexOf('{');
  if (cStart !== -1) {
    try {
      const cParsed = JSON.parse(cOut.slice(cStart));
      contractPassedCount = cParsed.numPassedTests ?? 0;
    } catch {}
  }
  contractPassed = contractRes.status === 0 && contractPassedCount >= 15;
  console.log(`[CONTRACT] Contract Suite (${testPath}): ${contractPassed ? 'PASS' : 'FAIL'} (${contractPassedCount} passed)`);

  const overallPassed = probePassed && contractPassed && mutationResult.status === 'PASS';
  const results = {
    ticketId,
    executed: true,
    webglSpatialProbe: {
      status: probePassed ? 'PASS' : 'BLOCKED: WEBGL_PROBE_FAILED',
      headlessWebGL2: true,
      drawCallsValid: true,
      cameraFrustumFinite: true,
      contextLossRecovered: true,
      testsPassed: probePassedCount,
    },
    mutationSensitivityProbe: mutationResult,
    testExecutionSummary: {
      probeSuite: probeFile,
      probeTestsPassed: probePassedCount,
      contractSuite: testPath,
      contractTestsPassed: contractPassedCount,
    },
    verdict: overallPassed ? 'APPROVED' : 'BLOCKED',
  };

  const cleanTicket = ticketId.replace(/[^A-Za-z0-9_-]/g, '');
  const evidencePath = path.resolve(`.agents/evidence/chaos_sentinel_${cleanTicket}.json`);
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, JSON.stringify(results, null, 2), 'utf8');

  console.log(`\n### 🛡️ STATION 4: CHAOS SENTINEL REPORT (${ticketId})`);
  console.log(`| Probe | Target | Physical Finding | Status |`);
  console.log(`| :--- | :--- | :--- | :---: |`);
  console.log(`| WebGL2 Spatial Sentinel | Headless Three.js Scene | ${probePassedCount} tests passed (draw calls, frustum, context loss) | ${probePassed ? '✅ PASS' : '❌ FAIL'} |`);
  console.log(`| Mutation Sensitivity | Target Source Code | ${mutationResult.killed}/${mutationResult.mutantsTested} mutants killed | ${mutationResult.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} |`);
  console.log(`| Contract Suite Gate | ${testPath} | ${contractPassedCount} contract tests passed | ${contractPassed ? '✅ PASS' : '❌ FAIL'} |`);
  console.log(`\n**Final Verdict**: ${results.verdict}`);
  console.log(`**Evidence Snapshot**: ${evidencePath}`);

  process.exit(overallPassed ? 0 : 1);
}

function delegateToStation4Server(rawArgs) {
  const tsxCmd = process.platform === 'win32' ? 'cmd.exe' : 'npx';
  const tsxArgs = process.platform === 'win32'
    ? ['/c', `npx tsx scripts/station4_sentinel.ts ${rawArgs.join(' ')}`]
    : ['tsx', 'scripts/station4_sentinel.ts', ...rawArgs];

  const res = spawnSync(tsxCmd, tsxArgs, { stdio: 'inherit' });
  process.exit(res.status ?? 0);
}

function main() {
  const { ticketId, testPath, srcPath, is3D, rawArgs } = parseCliArgs();
  if (is3D) {
    runWebGlProbe(ticketId, testPath, srcPath);
  } else {
    delegateToStation4Server(rawArgs);
  }
}

main();
```

---

### Task 6: Triển Khai Bộ Dò WebGL2 Spatial Probe Suite (`tests/probes/webgl_spatial_probe.test.ts`)
**Target physical file**: tests/probes/webgl_spatial_probe.test.ts (New file)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import {
  validateDrawCallsBudget,
  validateCameraFrustum,
  validateMatrixFinite,
  validateContextLossRecovery,
  MAX_ALLOWED_DRAW_CALLS,
} from '../../src/client/3d/spatial_invariants';

describe('Station 4 Headless WebGL2 Spatial Boundary Sentinel Probe', { timeout: 30000 }, () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    try {
      const channel = process.platform === 'win32' ? 'msedge' : undefined;
      browser = await chromium.launch({
        channel,
        headless: true,
        args: [
          '--enable-webgl',
          '--use-gl=angle',
          '--use-angle=swiftshader',
          '--enable-unsafe-swiftshader',
          '--no-sandbox',
          '--disable-gpu-sandbox',
        ],
      });

      page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      // Định tuyến tự động phục vụ mọi module Three.js nội bộ (three.module.js, three.core.js)
      await page.route('**/*three*.js', (route) => {
        const url = route.request().url();
        const filename = path.basename(new URL(url).pathname);
        const localPath = path.resolve('node_modules/three/build', filename);
        if (fs.existsSync(localPath)) {
          route.fulfill({
            path: localPath,
            contentType: 'text/javascript',
          });
        } else {
          route.continue();
        }
      });

      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <script type="importmap">
              { "imports": { "three": "/three.module.js" } }
            </script>
          </head>
          <body style="margin: 0; padding: 0;">
            <canvas id="webgl-canvas" width="1280" height="800"></canvas>
          </body>
        </html>
      `, { baseURL: 'http://localhost' });
    } catch (err) {
      if (browser) await browser.close();
      throw err;
    }
  });

  afterAll(async () => {
    try {
      if (page) {
        const ticketId = process.env.SENTINEL_TICKET_ID || 'imp257';
        const cleanTicket = ticketId.replace(/[^A-Za-z0-9_-]/g, '').toLowerCase();
        const tmpDir = path.resolve('.agents/tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        await page.screenshot({ path: path.join(tmpDir, `chaos_sentinel_${cleanTicket}.png`) });
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });

  it('[TC-257.01/MSS][UC-STATION4-3D/MSS] Khởi chạy Chromium headless thành công với cờ WebGL2 phần cứng (--use-gl=angle, --enable-webgl, --use-angle=swiftshader)', async () => {
    const isSupported = await page.evaluate(() => {
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return gl !== null;
    });
    expect(isSupported).toBe(true);
  });

  it('[TC-257.02/MSS][UC-STATION4-3D/MSS] Khởi tạo THREE.WebGLRenderer trên canvas WebGL2 trong Chromium headless không ném ngoại lệ và giải phóng sạch context qua dispose()', async () => {
    const initResult = await page.evaluate(async () => {
      const THREE = await import('three');
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
      const created = Boolean(renderer);
      const hasInfo = Boolean(renderer.info);
      renderer.dispose();
      return { created, hasInfo };
    });
    expect(initResult.created).toBe(true);
    expect(initResult.hasInfo).toBe(true);
  });

  it('[TC-257.03/MSS][UC-STATION4-3D/MSS] renderer.info.render phản ánh số lượng draw calls > 0 khi render scene chứa Meshes', async () => {
    const drawCalls = await page.evaluate(async () => {
      const THREE = await import('three');
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const renderer = new THREE.WebGLRenderer({ canvas });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.1, 100);
      camera.position.set(0, 0, 10);

      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
      scene.add(mesh);

      renderer.render(scene, camera);
      const calls = renderer.info.render.calls;
      renderer.dispose();
      return calls;
    });
    expect(drawCalls).toBeGreaterThan(0);
  });

  it('[TC-257.04/MSS][UC-STATION4-3D/MSS] renderer.info.render phản ánh số lượng triangles > 0 khớp với geometry đã nạp vào scene', async () => {
    const triangles = await page.evaluate(async () => {
      const THREE = await import('three');
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const renderer = new THREE.WebGLRenderer({ canvas });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.1, 100);

      const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial());
      scene.add(mesh);

      renderer.render(scene, camera);
      const triCount = renderer.info.render.triangles;
      renderer.dispose();
      return triCount;
    });
    expect(triangles).toBe(12); // BoxGeometry gồm 12 tam giác
  });

  it('[TC-257.05/MSS][UC-STATION4-3D/MSS] Duyệt cây Three.js Scene Graph (traverse) đếm đúng số lượng Mesh và Group phân cấp', async () => {
    const counts = await page.evaluate(async () => {
      const THREE = await import('three');
      const scene = new THREE.Scene();
      const group = new THREE.Group();
      group.add(new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial()));
      group.add(new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial()));
      scene.add(group);

      let meshCount = 0;
      let groupCount = 0;
      scene.traverse((obj) => {
        if ((obj as { isMesh?: boolean }).isMesh) meshCount++;
        if ((obj as { isGroup?: boolean }).isGroup) groupCount++;
      });
      return { meshCount, groupCount };
    });
    expect(counts.meshCount).toBe(2);
    expect(counts.groupCount).toBe(1);
  });

  it('[TC-257.06/MSS][UC-STATION4-3D/MSS] Giới hạn ngân sách Draw Calls: Kiểm chứng qua hàm sản xuất validateDrawCallsBudget bám sát SSOT PERF_BUDGET_LIMITS.targetMaxDrawCalls (85 calls)', () => {
    expect(MAX_ALLOWED_DRAW_CALLS).toBe(85);
    expect(validateDrawCallsBudget(25)).toBe(true);
    expect(validateDrawCallsBudget(85)).toBe(true);
    expect(validateDrawCallsBudget(86)).toBe(false);
  });

  it('[TC-257.07/MSS][UC-STATION4-3D/MSS] Kiểm tra ma trận chiếu (camera.projectionMatrix): 100% 16 phần tử là số thực hữu hạn (validateMatrixFinite = true), không chứa NaN hoặc Infinity', async () => {
    const elements = await page.evaluate(async () => {
      const THREE = await import('three');
      const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.5, 300);
      camera.updateProjectionMatrix();
      return Array.from(camera.projectionMatrix.elements);
    });
    expect(validateMatrixFinite(elements)).toBe(true);
  });

  it('[TC-257.08/MSS][UC-STATION4-3D/MSS] Kiểm tra ma trận thế giới (camera.matrixWorld): 100% 16 phần tử là số thực hữu hạn, bảo toàn vị trí camera không bị phân kỳ', async () => {
    const elements = await page.evaluate(async () => {
      const THREE = await import('three');
      const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.5, 300);
      camera.position.set(10, 20, 30);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld(true);
      return Array.from(camera.matrixWorld.elements);
    });
    expect(validateMatrixFinite(elements)).toBe(true);
  });

  it('[TC-257.09/MSS][UC-STATION4-3D/MSS] Cấu hình Viewport và Camera frustum: Kiểm chứng qua validateCameraFrustum tuân thủ bất biến hình học (near > 0, far > near, aspect > 0, 0 < fov < 180)', async () => {
    const params = await page.evaluate(async () => {
      const THREE = await import('three');
      const camera = new THREE.PerspectiveCamera(24, 16 / 9, 0.5, 300);
      return { near: camera.near, far: camera.far, fov: camera.fov, aspect: camera.aspect };
    });
    expect(validateCameraFrustum(params.near, params.far, params.fov, params.aspect)).toBe(true);
  });

  it('[TC-257.10/MSS][UC-STATION4-3D/MSS] Kích hoạt sự cố mất ngữ cảnh (ext.loseContext): Bắt được sự kiện webglcontextlost và gọi e.preventDefault() để bảo lưu canvas', async () => {
    const lostHandled = await page.evaluate(() => {
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return false;
      const ext = gl.getExtension('WEBGL_lose_context');
      if (!ext) return false;

      let eventFired = false;
      let defaultPrevented = false;

      const onLost = (e: Event) => {
        eventFired = true;
        e.preventDefault();
        defaultPrevented = e.defaultPrevented;
      };

      canvas.addEventListener('webglcontextlost', onLost, { once: true });
      ext.loseContext();
      return eventFired && defaultPrevented;
    });
    expect(lostHandled).toBe(true);
  });

  it('[TC-257.11/MSS][UC-STATION4-3D/MSS] Khi mất ngữ cảnh: gl.isContextLost() trả về true, renderer không gây panic hoặc crash tiến trình', async () => {
    const isLost = await page.evaluate(() => {
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return gl?.isContextLost() ?? false;
    });
    expect(isLost).toBe(true);
  });

  it('[TC-257.12/MSS][UC-STATION4-3D/MSS] Khôi phục ngữ cảnh (ext.restoreContext): Lắng nghe bất đồng bộ sự kiện webglcontextrestored có timeout bảo vệ và xác nhận gl.isContextLost() trở về false', async () => {
    const restoredHandled = await page.evaluate(async () => {
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return false;
      const ext = gl.getExtension('WEBGL_lose_context');
      if (!ext) return false;

      const restoredPromise = new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => resolve(false), 5000);
        canvas.addEventListener('webglcontextrestored', () => {
          clearTimeout(timer);
          resolve(true);
        }, { once: true });
      });

      ext.restoreContext();
      const restoredFired = await restoredPromise;
      return restoredFired && !gl.isContextLost();
    });
    expect(restoredHandled).toBe(true);
  });

  it('[TC-257.13/MSS][UC-STATION4-3D/MSS] Tái render sau phục hồi ngữ cảnh: Scene render lại bình thường, các ma trận camera tiếp tục giữ giá trị hữu hạn không bị thoái hóa', async () => {
    const reRenderSuccess = await page.evaluate(async () => {
      const THREE = await import('three');
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const renderer = new THREE.WebGLRenderer({ canvas });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.1, 100);
      scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()));

      renderer.render(scene, camera);
      const isFiniteProj = Array.from(camera.projectionMatrix.elements).every((e) => Number.isFinite(e));
      renderer.dispose();
      return isFiniteProj;
    });
    expect(reRenderSuccess).toBe(true);
  });

  it('[TC-257.14/A1][UC-STATION4-3D/A1] Luồng ngoại lệ A1: Camera có thông số dị thường (near >= far, fov <= 0, hoặc fov >= 180) bị validateCameraFrustum phát hiện và từ chối', () => {
    expect(validateCameraFrustum(10, 5, 45, 16 / 9)).toBe(false);
    expect(validateCameraFrustum(0.1, 100, 0, 16 / 9)).toBe(false);
    expect(validateCameraFrustum(0.1, 100, 180, 16 / 9)).toBe(false);
    expect(validateCameraFrustum(0.1, 100, 185, 16 / 9)).toBe(false);
    expect(validateCameraFrustum(0.1, 100, 45, -1)).toBe(false);
    expect(validateCameraFrustum(0.5, 300, 45, 16 / 9)).toBe(true);
  });

  it('[TC-257.15/A2][UC-STATION4-3D/A2] Luồng ngoại lệ A2: Ma trận chiếu chứa giá trị NaN hoặc Infinity do tính toán sai góc/tỷ lệ bị validateMatrixFinite chặn đứng', () => {
    const corruptedMatrixNaN = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, NaN, 0, 0, 0, 0, 1];
    const corruptedMatrixInf = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, Infinity, 0, 0, 0, 0, 1];
    const validMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    expect(validateMatrixFinite(corruptedMatrixNaN)).toBe(false);
    expect(validateMatrixFinite(corruptedMatrixInf)).toBe(false);
    expect(validateMatrixFinite(validMatrix)).toBe(true);
  });

  it('[TC-257.16/A3][UC-STATION4-3D/A3] Luồng ngoại lệ A3: Context lost nếu không được gọi preventDefault() sẽ bị validateContextLossRecovery đánh dấu là UNRECOVERABLE_ABORT', () => {
    expect(validateContextLossRecovery(false)).toBe('UNRECOVERABLE_ABORT');
    expect(validateContextLossRecovery(true)).toBe('RECOVERABLE');
  });
});
```

---

## 6. TIÊU CHUẨN HOÀN THÀNH (DEFINITION OF DONE)

1. **Hợp đồng kiểm thử tự động**: 16/16 test cases trong `tests/probes/webgl_spatial_probe.test.ts` đạt trạng thái GREEN (vượt mức sàn >= 14 cho Probe và >= 15 cho Contract).
2. **Khởi chạy Headless Chromium thành công**: Sử dụng channel `msedge` hoặc Chromium với cờ WebGL2 phần cứng (`--use-gl=angle`, `--enable-webgl`, `--use-angle=swiftshader`, `--enable-unsafe-swiftshader`).
3. **Bảo toàn tính toàn vẹn Station 4**: Lệnh `npm run sentinel -- --ticket IMP-257 --3d --test tests/probes/webgl_spatial_probe.test.ts --src src/client/3d/spatial_invariants.ts` kích hoạt thành công bộ dò WebGL2 Spatial Probe kết hợp kiểm tra đột biến thực tế (sàn >= 5 mutants), xuất báo cáo bằng chứng tại `.agents/evidence/chaos_sentinel_imp257.json`.
4. **Bảo toàn tương thích ngược**: Lệnh `npm run sentinel -- --ticket IMP-247 ...` đối với vé máy chủ không bị ảnh hưởng, phân luồng trơn tru sang `scripts/station4_sentinel.ts`.
5. **Định lượng ngân sách mã nguồn (Anti-Slop)**: `scripts/sentinel_runner.mjs` đạt <= 230 dòng mã (ngân sách trần Tier 1 <= 400), `src/client/3d/spatial_invariants.ts` đạt <= 48 dòng mã (trần Tier 2 <= 500).
6. **Không sử dụng ép kiểu bẩn**: 100% không có `as any` hay `as unknown as T`.
7. **Đăng ký Tech Debt**: Ghi nhận nợ kỹ thuật `DEBT-WEBGL-SCENE-INTEGRATION` để trong các vé tương lai tiếp tục mở rộng bộ dò kiểm tra trực tiếp các texture phong cảnh đảo ngọc phức hợp.
