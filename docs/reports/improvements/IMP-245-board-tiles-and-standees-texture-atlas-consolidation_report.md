# BÁO CÁO HOÀN THÀNH CẢI TIẾN: IMP-245
# BOARD TILES TEXTURE ATLAS CONSOLIDATION
# (Hợp nhất Texture Atlas cho 40 Ô Bàn Cờ — Board Tiles Texture Atlas Consolidation)

> **Mã Ticket**: `IMP-245`  
> **Tiêu đề**: Board Tiles Texture Atlas Consolidation  
> **Phân loại**: Tier 2 (Full Rigor — 3D WebGL CanvasTexture, UV Inset Mapping, VRAM Optimization)  
> **Ngày hoàn thành**: 2026-10-02  
> **Trạng thái**: ✅ **HOÀN THÀNH TOÀN DIỆN (100% GATES APPROVED)**  
> **Tài liệu Kế hoạch**: [`docs/plans/improvements/IMP-245-board-tiles-and-standees-texture-atlas-consolidation_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-245-board-tiles-and-standees-texture-atlas-consolidation_plan.md) (Revision 2.3)  
> **Tài liệu SSOT**: [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) (Pillars I, II, IV, V), [`docs/domain/design.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md)  

---

## 1. TỔNG QUAN & BỐI CẢNH CẢI TIẾN

Trước khi thực hiện ticket `IMP-245`:
- Toàn bộ 40 ô trên bàn cờ 3D (`board_tile.tsx`) được render bằng cách gọi riêng lẻ hàm `getTileTexture(cell.index, isMobile)` từ `tile_texture_generator.ts`.
- Mỗi ô bàn cờ sở hữu một đối tượng `HTMLCanvasElement` độc lập và một `CanvasTexture` riêng biệt (kích thước $512 \times 680$ trên mobile và $1024 \times 1360$ trên desktop).
- Hệ quả cơ học WebGL:
  1. **Lãng phí GPU Sampler Slots & State Changes**: 40 ô bàn cờ yêu cầu 40 lần hoán đổi texture sampler (`glBindTexture`), gây phân mảnh và tiêu tốn CPU/GPU driver draw call overhead lớn mỗi frame.
  2. **Tiêu tốn VRAM nghiêm trọng (Công thức chuẩn hóa Mipmap RGBA8)**:
     - Định dạng: RGBA8 = 4 bytes/texel.
     - Chuỗi Three.js Mipmaps (`generateMipmaps: true`) tăng tổng dung lượng theo chuỗi cấp số nhân:
       $$1 + \frac{1}{4} + \frac{1}{16} + \frac{1}{64} + \dots = \frac{4}{3} \approx 1.333333...$$
     - *Mobile Legacy Baseline (40 ô $512 \times 680$)*:
       $$40 \times (512 \times 680 \times 4 \times \frac{4}{3}) = 74,274,133.33\text{ bytes} = \mathbf{70.83\text{ MiB}} \quad (74.27\text{ MB})$$
     - *Desktop Legacy Baseline (40 ô $1024 \times 1360$)*:
       $$40 \times (1024 \times 1360 \times 4 \times \frac{4}{3}) = 297,096,533.33\text{ bytes} = \mathbf{283.33\text{ MiB}} \quad (297.10\text{ MB})$$
  3. **39 Đối tượng Canvas dư thừa**: 40 canvas DOM ảo được duy trì trong bộ nhớ trình duyệt, tăng nguy cơ bị hệ điều hành iOS kích hoạt cơ chế Jetsam (OOM Killer) khi chơi trên mobile web.

### Giải pháp kỹ thuật đạt được:
1. **Hợp nhất thành 1 Texture Atlas duy nhất**: Toàn bộ 40 ô bàn cờ được gom vào một CanvasTexture duy nhất kích thước $2048 \times 2048$ trên mobile (lưới $8 \times 6$ ô $256 \times 340$) và $4096 \times 4096$ trên desktop.
2. **Cắt giảm 97.5% Texture Sampler Binds**: Từ 40 texture instances độc lập xuống còn đúng **1 Texture Sampler duy nhất** trên toàn bộ bàn cờ.
3. **Tiết kiệm -69.89% VRAM Mobile & -69.89% VRAM Desktop (Chuẩn hóa toán học)**:
   - Mobile: Giảm từ $70.83\text{ MiB}$ xuống còn **$21.33\text{ MiB}$** ($2048 \times 2048 \times 4 \times 4/3$), tiết kiệm **$49.50\text{ MiB}$** (-69.89%).
   - Desktop: Giảm từ $283.33\text{ MiB}$ xuống còn **$85.33\text{ MiB}$** ($4096 \times 4096 \times 4 \times 4/3$), tiết kiệm **$198.00\text{ MiB}$** (-69.89%).
4. **Tiêu biến 39 Canvas Elements**: Chỉ còn 1 canvas element duy nhất trong bộ nhớ trình duyệt.
5. **Phòng vệ Mipmap Bleeding & Dark Seams**:
   - Áp dụng độ thụt nửa texel (`halfU = 0.5 / 2048`, `halfV = 0.5 / 2048`) trên mẫu số canvas thực tế $2048$.
   - Pre-fill toàn bộ canvas bằng màu ngà `#F3EEDF` (loại bỏ viền đen Hàng 5).
   - Cơ chế Color Dilation tô kín toàn bộ slot $256 \times 340$ bằng màu nền ô góc (`CORNER_BG_COLORS`) trước khi vẽ chi tiết $256 \times 256$, triệt tiêu 100% viền đen ở đáy ô góc khi nhìn nghiêng.
6. **Bảo toàn 100% Tương thích Ngược**:
   - `getTileTexture(index, isMobile)` và `getStandeeTexture(index)` tiếp tục được giữ lại và hoạt động trơn tru cho các suite kiểm thử cũ và `useSmartStandeeTexture`.
7. **Zero Dirty Casts Tuyệt Đối**:
   - Sử dụng type guard duck-typing `hasDimensions(obj): obj is SizedImageTarget` loại bỏ 100% các lệnh cast `as HTMLCanvasElement`.

---

## 2. KẾT QUẢ THI CÔNG CHI TIẾT

### 2.1. Module mới `src/client/3d/tile_texture_atlas.ts`
- [`src/client/3d/tile_texture_atlas.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_atlas.ts) (324 LOC, trần 500 LOC):
  - Khai báo type directive `/// <reference types="vite/client" />` ngay dòng 1.
  - Type Guard chuẩn: `hasDimensions(obj: unknown): obj is SizedImageTarget` thay thế hoàn toàn mọi ép kiểu `as HTMLCanvasElement`.
  - Phân bổ lưới $8 \times 6$: 40 ô đầu tiên lưu 40 ô bàn cờ (index 0..39), 8 ô cuối của hàng 5 được tô kín nền ngà `#F3EEDF`.
  - Cung cấp 3 API cốt lõi:
    + `getBoardTileAtlas(isMobile)`: Khởi tạo và trả về CanvasTexture singleton Atlas.
    + `getTileAtlasUVs(cellIndex)`: Tính toán bounding box UV chuẩn hóa `[uMin, vMin, uMax, vMax]` với half-texel inset.
    + `getTileAtlasGeometry(cellIndex, isCorner)`: Trả về singleton `BufferGeometry` mang tọa độ UV tương ứng với slot trên Atlas (kích thước $1.64 \times 2.16$ cho ô thường, $2.16 \times 2.16$ cho ô góc).
  - Khả năng phục hồi WebGL Context Loss & Race Defense:
    + `scheduleAtlasUpdate`: Sử dụng `pendingAtlasUpdates = new Set<CanvasTexture>()` để gom cụm các yêu cầu cập nhật texture qua `requestAnimationFrame`, không làm rơi mất cập nhật của desktop khi mobile load trước.
    + `img.onload`: Sử dụng type guard `hasDimensions` kiểm tra `width === 0` để bỏ qua vẽ nếu texture đã bị dispose; tái lập tường minh `ctx.clip()` trước khi `drawImage` để ngăn chặn tranh vẽ đè sang các slot lân cận.
  - Dọn dẹp bộ nhớ & Phòng chống Jetsam: `clearTileAtlasCache()` đặt `width = 0, height = 0`, gọi `dispose()` trên các textures, dọn sạch cache ảnh nhưng **bảo toàn `boardGeometryCache`** (~3KB) để tránh crash các component đang mounted.
  - Dọn dẹp HMR: `if (import.meta.hot) { import.meta.hot.dispose(() => { clearTileAtlasCache(); }); }`.

### 2.2. Subtractive Refactoring `src/client/3d/board_tile.tsx`
- [`src/client/3d/board_tile.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx) (452 LOC, net delta 0, trần 500 LOC):
  - Snippet 2.1: Import `getBoardTileAtlas`, `getTileAtlasGeometry`, giữ lại `getStandeeTexture` cho `useSmartStandeeTexture` tại L116.
  - Snippet 2.2: `LayeredDioramaTile` cho ô góc sử dụng `tileAtlas` và `geometry={tileGeometry}` thay cho `planeGeometry` cục bộ.
  - Snippet 2.3: `LayeredDioramaTile` cho ô thông thường sử dụng `tileAtlas` và `geometry={tileGeometry}` thay cho `planeGeometry` cục bộ.

### 2.3. Tích hợp Dọn dẹp Bộ nhớ `src/client/3d/tile_texture_generator.ts`
- [`src/client/3d/tile_texture_generator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_generator.ts) (230 LOC, trần 500 LOC):
  - Snippet 3.1: Gọi `clearTileAtlasCache()` ở cuối `clearTileTextureCache()`, hình thành chuỗi dọn dẹp phân cấp 1 chiều: `clearAll3DTextureCaches -> clearTileTextureCache -> clearTileAtlasCache`, loại bỏ hoàn toàn nguy cơ double dispose.

### 2.4. Hòa giải Hồi quy Kiểm thử `outer_building_plot_and_matte_tile_sharpness.test.ts`
- [`tests/client/outer_building_plot_and_matte_tile_sharpness.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/outer_building_plot_and_matte_tile_sharpness.test.ts) (447 LOC, trần 600 LOC):
  - Snippet 4.1: Bổ sung mock cho `RoundedBox` vào `@react-three/drei` xuất thuộc tính `args` ra text markup.
  - Snippet 4.2: Cập nhật `TC-IMP35.25` kiểm tra kích thước đế `args="2.2,0.22,2.2"` và `args="1.68,0.2,2.2"`, đưa toàn bộ suite 30/30 tests về GREEN.

---

## 3. ĐỐI SOÁT NGÂN SÁCH DÒNG MÃ (LOC BUDGET RECONCILIATION)

Đo lường tự động cơ học bằng `scripts/check_loc.mjs`:

| Tệp vật lý | Vai trò | Baseline | Delta | Thực tế | Trần | Trạng thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/tile_texture_atlas.ts` | Texture Atlas Engine | 0 | +324 | 324 LOC | 500 | ✔️ Safe |
| `src/client/3d/board_tile.tsx` | Board Tile Mesh | 452 | 0 | 452 LOC | 500 | ✔️ Safe |
| `src/client/3d/tile_texture_generator.ts` | Texture Generator | 228 | +2 | 230 LOC | 500 | ✔️ Safe |
| `src/client/3d/texture_cache_manager.ts` | Global Cache Chain | 23 | 0 | 23 LOC | 500 | ✔️ Unchanged (USER-01) |
| `tests/client/outer_building_plot_and_matte_tile_sharpness.test.ts` | Regression Test Suite | 442 | +5 | 447 LOC | 600 | ✔️ Safe |
| `tests/contracts/imp245_board_tiles_and_standees_texture_atlas_consolidation.test.ts` | Contract Tests | 0 | +533 | 533 LOC | 600 | ✔️ Safe |

### Giải trình về `texture_cache_manager.ts`:
- Trong bản kế hoạch sơ khai, Task 3 dự kiến bổ sung Snippet 3.2 (+3 LOC) vào `texture_cache_manager.ts`.
- Tuy nhiên, sau khi tiếp thu chỉ thị `USER-01`, nhận thấy `clearAll3DTextureCaches()` đã gọi `clearTileTextureCache()`, và `clearTileTextureCache()` lại gọi `clearTileAtlasCache()`. Việc thêm dòng gọi thứ hai vào `texture_cache_manager.ts` sẽ gây ra lỗi gọi kép (double-call).
- Do đó, Snippet 3.2 đã bị hủy bỏ hoàn toàn. Tệp `texture_cache_manager.ts` có Delta = 0 (23 LOC $\rightarrow$ 23 LOC).

---

## 4. ĐỐI SOÁT CHỈ DẪN PHẢN BIỆN (REVISION DIRECTIVES CLOSURE)

1. **Giai đoạn A (Griller Directives DIR-1..7, DIR-2.1..2.2)**:
   - `DIR-1`: Thiết kế `drawAtlasTileArt` nhận `(offsetX, offsetY, scale, atlasTexture)`, loại bỏ triệt để `null as any`.
   - `DIR-2`: Loại bỏ lệnh `geom.dispose()` khỏi `clearTileAtlasCache()`, bảo toàn 40 singleton `BufferGeometry` (~3KB) chống crash mesh mounted.
   - `DIR-3`: Bổ sung Task 4 cập nhật `TC-IMP35.25` kiểm tra đế RoundedBox.
   - `DIR-4`: Descope hoàn toàn Standee Atlas khỏi kế hoạch, tập trung 100% vào Atlas cho 40 ô bàn cờ (loại bỏ phantom dead code).
   - `DIR-5`: Bổ sung cơ chế Color Dilation tô kín toàn bộ slot $256 \times 340$ bằng `CORNER_BG_COLORS`, triệt tiêu lem viền đen.
   - `DIR-6`: Đồng bộ số học bảng LOC, xóa bỏ import mồ côi `getTileTexture`.
   - `DIR-7`: Chuẩn hóa `TC-IMP245.18` assert 40 ô cờ trỏ chung 1 tham chiếu instance CanvasTexture (`new Set(renderedTextures).size === 1`).
   - `DIR-2.1`: Chuẩn hóa mẫu số UV `ATLAS_CANVAS_SIZE = 2048`, triệt tiêu sai số lệch dọc và cắt lẹm nội dung.
   - `DIR-2.2`: Bổ sung mock `RoundedBox` vào `@react-three/drei` trong test IMP-35.

2. **Giai đoạn B (Challenger Directives ADV-01..04)**:
   - `ADV-01`: Cơ chế gom cụm cập nhật texture qua `requestAnimationFrame` và `pendingAtlasUpdates = new Set<CanvasTexture>()` chống GPU hitching.
   - `ADV-02`: Callback `img.onload` guard WebGL context loss (`width === 0`) và tái lập `ctx.clip()`.
   - `ADV-03`: Pre-fill toàn bộ canvas bằng màu ngà `#F3EEDF`.
   - `ADV-04`: Headless Node.js DOM check trả về `null` an toàn và `LayeredDioramaTile` fallback sạch sẽ.

3. **Chỉ đạo Phản biện của Người dùng (User Directives USER-01..07 & Audit Hardening)**:
   - `USER-01`: Bỏ Snippet 3.2 khỏi `texture_cache_manager.ts`, triệt tiêu double-call theo chuỗi phân cấp 1 chiều.
   - `USER-02`: Dùng `pendingAtlasUpdates = new Set<CanvasTexture>()` thay cho cờ boolean đơn, bảo đảm desktop atlas không bị bỏ qua khi mobile atlas update trước.
   - `USER-03`: Tái lập `ctx.clip()` bên trong `img.onload` của `drawAtlasTileArt` ngay trước khi `drawImage`.
   - `USER-04`: Xác minh vật lý `CORNER_DRAWERS` trong `corner_tile_art.ts` kích thước $384 \times 384$, hệ số `scale(256 / 384)` chuẩn 100%.
   - `USER-05`: Giữ nguyên import `getStandeeTexture` cho `useSmartStandeeTexture` tại L116 của `board_tile.tsx`.
   - `USER-06`: Thêm `vi.useFakeTimers()` và `vi.runAllTimers()` vào test `TC-IMP245.11`.
   - `USER-07`: Chuẩn hóa toàn bộ số liệu VRAM sang công thức toán học mipmap chính xác (70.83 MiB $\rightarrow$ 21.33 MiB trên mobile; 283.33 MiB $\rightarrow$ 85.33 MiB trên desktop).
   - `AUDIT-FIX-01`: Thay thế toàn bộ ép kiểu `as HTMLCanvasElement` bằng type guard duck-typing `hasDimensions`, đạt chuẩn zero dirty casts tuyệt đối.
   - `AUDIT-FIX-02`: Bổ sung nguyên nhân vật lý cụ thể vào Domain Invariant 2.

---

## 5. BẰNG CHỨNG KIỂM ĐỊNH 4 TRẠM (4-STATION CLOSED-LOOP EVIDENCE)

### Trạm 1: RED Contract Tests (`qa-tester`)
- **Tệp kiểm thử**: `tests/contracts/imp245_board_tiles_and_standees_texture_atlas_consolidation.test.ts`
- **Số lượng tests**: 20 atomic tests, 59 `expect()` assertions (tỉ lệ 2.95).
- **Phủ trọn Universal 5-Facet Matrix**:
  - *Facet 1 (Core Happy Paths)*: `TC-IMP245.01..04`
  - *Facet 2 (Edge Cases & Boundaries)*: `TC-IMP245.05..08`
  - *Facet 3 (Memory, Batching & Sanitization)*: `TC-IMP245.09..14`
  - *Facet 4 (Regression Prevention)*: `TC-IMP245.15..17`
  - *Facet 5 (Spatial Integrity & 3D Shading)*: `TC-IMP245.18..20`
- **Adversarial Inversion**: Chứng minh RED thành công do `src/client/3d/tile_texture_atlas.ts` chưa tồn tại.

### Trạm 2: GREEN Implementation (`implementer`)
- Hiện thực tối thiểu 4 nhiệm vụ theo đúng kế hoạch Revision 2.3.
- Chuyển toàn bộ 20/20 contract tests sang GREEN.
- Toàn bộ 199 regression tests trên 5 suites ô cờ tiếp tục PASS 100%.

### Trạm 2.5: Fast Pre-Filter Sweep (`scout`)
- **Typecheck**: `tsc --noEmit` exit code 0 (0 errors).
- **LOC Ceiling**: Tất cả các files tuân thủ ngân sách.
- **Zero Dirty Casts**: 0 `as any`, 0 `as unknown as`, 0 `as Record<string, any>`, 0 `as HTMLCanvasElement`.
- **Console.log Purge**: 0 console logs thừa.
- **Linters**: `npm run lint:slop` 0 hard violations; `npm run lint:ui` 0 violations.
- **Phán quyết**: `PREFILTER_PASSED`.

### Trạm 3: Phễu Thẩm Định Độc Lập (Review Funnel)
- **Phase 3.0: Physical Visual Evidence Gate**:
  - Chụp ảnh in-game thực tế thông qua Chrome CDP headless:
    + `imp-245_board_texture_atlas.jpg` (Toàn cảnh 3D bàn cờ 40 ô)
    + `imp-245_corner_close_up.jpg` (Cận cảnh ô góc Khởi Hành và các ô kề cận)
- **Phase 3.1: Spec & Scope Gate (`spec-reviewer`)**:
  - Đối chiếu 100% các tiêu chí kế hoạch, xác nhận không có scope drift.
  - Phán quyết: `SPEC_APPROVED`.
- **Phase 3.2: Deep Architecture & 3D Craft Gate**:
  - `code-reviewer`: Thẩm định chất lượng mã nguồn sâu, module depth, an toàn VRAM, xử lý WebGL context loss race. Phán quyết: `CODE_APPROVED`.
  - `game-3d-visual-critic`: Thẩm định trực quan 2 ảnh chụp vật lý trên đĩa. Xác nhận 40 ô cờ sắc nét, tỉ lệ 1:1 ô góc vuông vức, sạch hoàn toàn viền lem mipmap, vật liệu PBR True Matte (`roughness = 0.98, metalness = 0.0`). Phán quyết: `VISUAL_APPROVED`.

### Trạm 4: Chaos Sentinel & Phân Tích Phạm Vi Đầu Dò
- **Thực thi 3 đầu dò vật lý**:
  1. *Closed-Loop Parity*: 24/24 Intent symmetric parity (PASS). *(Phân loại: Baseline hồi quy hạ tầng server FSM toàn hệ thống, không tác động trực tiếp vào texture pipeline)*.
  2. *Ephemeral Boundary Wire Probe*: WebSocket trên port động ngẫu nhiên 53376, sống sót qua ngắt kết nối đột ngột (PASS). *(Phân loại: Baseline hồi quy hạ tầng mạng toàn hệ thống)*.
  3. *Targeted Mutation Sensitivity Probe*: **10/10 mutants bị tiêu diệt (killed), 0 mutants sống sót (PASS)**. *(Đầu dò miền cốt lõi: Tấn công trực tiếp vào logic texture atlas và contract tests)*.
- **Đánh giá & Ghi nhận Nợ Kỹ thuật**:
  - Nhận diện khuyết tật: `scripts/station4_sentinel.ts` hiện đang chạy cứng 2 đầu dò server FSM/WebSocket cho mọi ticket, kể cả các ticket Pure Client 3D.
  - Đăng ký `DEBT-STATION4-01`: Tái cấu trúc `scripts/station4_sentinel.ts` hỗ trợ Domain Adapter (với client 3D sẽ cắm probe WebGL Context Loss Stress Test hoặc Texture Memory Leak Probe thay vì WebSocket port 0).
- **Kiểm chứng cơ học bằng chứng**: `node scripts/check_evidence.mjs IMP-245` xác nhận PASS.
- **Evidence Snapshot**: [`.agents/evidence/chaos_sentinel_IMP-245.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/chaos_sentinel_IMP-245.json).
- **Phán quyết**: `APPROVED`.

---

## 6. KẾT LUẬN & ĐĂNG KÝ BẤT BIẾN MIỀN

Ticket `IMP-245` đã hoàn thành xuất sắc mục tiêu kỹ thuật, loại bỏ 39 texture binds và 39 DOM canvas thừa, tiết kiệm 49.50 MiB VRAM trên mobile và 198.00 MiB VRAM trên desktop, nâng cao đáng kể độ mượt và độ ổn định của VTCoOn trên thiết bị di động.

### Bất biến Miền mới (SSOT Domain Invariant):
1. **Atlas UV Normalization Denominator**: UV bounding boxes cho các ô bàn cờ trên texture atlas bắt buộc chuẩn hóa theo kích thước canvas vật lý (`ATLAS_CANVAS_SIZE = 2048`), không được chuẩn hóa theo chiều cao ảo của lưới dữ liệu (`totalVirtualH = 2040`) để tránh trôi tọa độ dọc.
2. **BufferGeometry Persistence on Atlas Cache Clear**: `clearTileAtlasCache()` chỉ giải phóng các đối tượng `CanvasTexture` và dọn sạch canvas element (`width = 0, height = 0`), cấm tuyệt đối dispose các singleton `BufferGeometry` trong `boardGeometryCache` vì các geometry này đang được tham chiếu trực tiếp bởi các React Three Fiber meshes đã mount trên scene — việc dispose geometry buffer sẽ vô hiệu hóa WebGL buffer handles trên GPU, khiến Three.js crash ở lần render kế tiếp với lỗi "gl.drawElements: attempt to access out of range vertices" hoặc gây hiện tượng biến mất ô cờ mà không có thông báo lỗi rõ ràng.
