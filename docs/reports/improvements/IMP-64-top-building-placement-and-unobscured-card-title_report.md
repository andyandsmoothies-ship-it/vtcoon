# BÁO CÁO NGHIỆM THU CẢI TIẾN IMP-64
## DỜI CÔNG TRÌNH C1-C3 RA KHỎI CARD & TRẢ MẶT THẺ CỜ VỀ NGUYÊN HIỆN TRẠNG

> **Mã cải tiến:** IMP-64  
> **Trạng thái:** 🟢 Hoàn tất (Đạt chuẩn 3 Trạm Kiểm Thử & Visual Critic 9.6/10 SHIP)  
> **Ngày hoàn thành:** 14/09/2026  
> **Các bên kiểm tra:** `qa-tester`, `implementer`, `spec-reviewer`, `game-3d-visual-critic`  

---

### 1. NGUYÊN TẮC THIẾT KẾ ĐẠT CHUẨN

1. **Trả Thẻ Cờ Về Nguyên Hiện Trạng (`tile_texture_generator.ts`)**:
   - Dải màu nhận diện vùng (`y = 0..56`) chứa tên tỉnh thành chính ở `y = 28`.
   - Phụ đề địa danh ở `y = 74`.
   - Khung tranh di sản danh thắng khổ lớn 172px ở `y = 94..266` hoàn toàn nguyên vẹn, không bị bất kỳ khối kiến trúc nào đè lên.
   - Khay giá niêm yết ở `y = 274..324` với số tiền lớn tại `y = 300`.
2. **Dời Công Trình Lên Đỉnh Và Nằm Hoàn Toàn Bên Ngoài Card (`procedural_building.tsx`)**:
   - Tọa độ gốc: `position = [0, 0.22, -1.58]`.
   - Mép trong ô cờ tại `Z = -1.10`. Toàn bộ khối nhà nằm trong khoảng `[-2.005, -1.155]`, hoàn toàn nằm ngoài mặt thẻ, đứng trên dải kè cảnh quan bờ sông/đại lộ.
3. **Đồng Bộ Hoạt Ảnh Va Đập Rơi (`construction_slam_vfx.tsx`)**:
   - Cân chỉnh `offset = 1.58` trong hàm `getBuildingWorldPosition`.

---

### 2. KẾT QUẢ QUY TRÌNH 3 TRẠM (3-STATION RESULTS)

1. **Trạm 1 (RED Contract Tests - `qa-tester`):**
   - `tests/contracts/imp63_top_building_and_unobscured_card_title.test.ts` (268 LOC, 45 test executions).
   - Chứng minh Business RED 40 assertions thất bại trên nền code cũ.
2. **Trạm 2 (GREEN Implementation - `implementer`):**
   - Sửa 3 tệp mã nguồn: `procedural_building.tsx`, `construction_slam_vfx.tsx`, `tile_texture_generator.ts`.
   - Reconcile 2 bộ test kế thừa: `outer_building_plot_and_matte_tile_sharpness.test.ts` & `flat_tile_art_and_clean_c0.test.ts`.
   - 100% 167/167 test files PASS (2.562 / 2.562 tests xanh tuyệt đối).
   - `npm run gate:quick`: 0 lỗi.
3. **Trạm 3 (Independent Review & Physical Verification):**
   - Chụp 8 ảnh phối cảnh thực tế bằng Edge CDP tại `localhost:5173`.
   - `spec-reviewer`: **APPROVED** (100% tiêu chí chuẩn xác).
   - `game-3d-visual-critic`: **9.6 / 10 — SHIP**.
   - Cập nhật Gotcha #86 trong `docs/domain/gotchas.md`.
