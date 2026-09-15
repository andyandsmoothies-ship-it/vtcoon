# BÁO CÁO NGHIỆM THU CẢI TIẾN IMP-65
## TINH CHỈNH TỶ LỆ SA BÀN (SCALE 0.65x), TRIỆT TIÊU VA CHẠM GÓC VUÔNG & ĐA DẠNG HÓA KIẾN TRÚC 4 VÙNG MIỀN

> **Mã cải tiến:** IMP-65  
> **Trạng thái:** 🟢 Hoàn tất (Đạt chuẩn 3 Trạm Kiểm Thử & Visual Critic 9.7/10 SHIP)  
> **Ngày hoàn thành:** 14/09/2026  
> **Các bên kiểm tra:** `qa-tester`, `implementer`, `spec-reviewer`, `game-3d-visual-critic`  

---

### 1. NGUYÊN NHÂN CỐT LÕI & GIẢI PHÁP ĐẠT CHUẨN

1. **Xung đột góc vuông & Kích thước mô hình:**
   - Tại 4 góc vuông (Ô 1 vs Ô 39, Ô 9 vs Ô 11, Ô 19 vs Ô 21, Ô 29 vs Ô 31), khoảng cách tâm giữa 2 nhà trước đây chỉ là `D = 0.311m`, trong khi khổ đế cũ là `0.85m x 0.85m`, gây chồng lấn hình học tới `0.539m`.
   - Chiều cao cũ (`0.95m - 1.55m`) vượt quá tỷ lệ sa bàn thu nhỏ.
   - **Khắc phục**: Thu nhỏ tỷ lệ vàng `0.65x` (đế `0.55m x 0.55m`, chiều cao C1 `0.62m`, C2 `0.80m`, C3 `1.00m`). Cự ly Z thu về `Z = -1.35m`. Áp dụng Smart Corner Splay (trượt `0.18m`, xoay $\pm 12.6^\circ$), tăng khoảng cách tâm lên **`0.891m`** (khoảng hở an toàn thực tế `0.341m`), triệt tiêu 100% va chạm.
2. **Đa dạng hóa kiến trúc 4 vùng miền Việt Nam:**
   - Thay vì dùng chung 1 mẫu nhà cho tất cả 22 ô BĐS, phân loại thành **4 trường phái kiến trúc (`building_typology.ts`)**:
     * **Sông Nước Nam Bộ (`riverine`)**: Cần Thơ (01), An Giang (03), Phú Quốc (27).
     * **Nghỉ Dưỡng Biển & Núi (`resort`)**: Vũng Tàu (09), Mũi Né (11), Đà Lạt (13), Nha Trang (14), Quy Nhơn (16), Sầm Sơn (21), Hạ Long (29).
     * **Phố Cổ & Di Sản Bắc Bộ (`heritage`)**: Huế (18), Nghệ An (23), Ninh Bình (24), Hưng Yên (31), Hoàn Kiếm (34).
     * **Siêu Đô Thị Tài Chính (`metropolis`)**: Bình Dương (06), Đồng Nai (08), Đà Nẵng (19), Hải Phòng (26), Cầu Giấy (32), Thủ Đức (37), Quận 1 (39).
   - Sản xuất bộ 12 mô hình GLB tối ưu trong ngân sách: 1.18 MB / 2.5 MB.
   - Đồng bộ `getBuildingWorldPosition` trong `construction_slam_vfx.tsx` đảm bảo tâm chấn va đập khớp sai số `< 0.001m`.

---

### 2. KẾT QUẢ QUY TRÌNH 3 TRẠM (3-STATION RESULTS)

1. **Trạm 1 (RED Contract Tests - `qa-tester`):**
   - Tạo test suite `tests/contracts/imp65_building_scale_corner_clearance_and_regional_typologies.test.ts` (277 LOC, 98 test executions).
   - Chứng minh Business RED thành công (98 thất bại trước khi implement).
2. **Trạm 2 (GREEN Implementation - `implementer`):**
   - Tạo mới `src/client/3d/building_typology.ts`.
   - Cập nhật `procedural_building.tsx` (scale 0.65x, corner splay, typology URL).
   - Cập nhật `construction_slam_vfx.tsx` (tính đúng tọa độ va đập rơi theo corner splay).
   - Cập nhật `scripts/generate_high_fidelity_models.mjs` sinh 27 models (12 models vùng miền + legacy models).
   - Đồng bộ các bộ test: `outer_building_plot_and_matte_tile_sharpness.test.ts`, `flat_tile_art_and_clean_c0.test.ts`, `construction_slam_vfx.test.ts`, `imp63_top_building_and_unobscured_card_title.test.ts`.
   - 100% 168/168 test files PASS (2.660 / 2.660 tests xanh tuyệt đối).
   - `npm run gate:quick`: 0 lỗi.
3. **Trạm 3 (Independent Review & Verification):**
   - Chụp 8 ảnh phối cảnh thực tế Edge CDP tại `localhost:5173`.
   - `spec-reviewer`: **APPROVED** (8/8 tiêu chuẩn đạt 100%).
   - `game-3d-visual-critic`: **9.7 / 10 — XUẤT XƯỞNG (SHIP)**.
   - Cập nhật Gotcha #88 trong `docs/domain/gotchas.md`.
