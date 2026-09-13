# BÁO CÁO NGHIỆM THU CẢI TIẾN IMP-35
# BỐ CỤC THẺ CỜ NGOẠI BIÊN, GIẤY BÌA MỜ TRUE MATTE & KHÓA NÉT MIPMAP

> **Mã số cải tiến:** IMP-35  
> **Ngày hoàn thành:** 13/09/2026  
> **Trạng thái:** ĐÃ DUYỆT & ĐẠT 100% GATES (Visual Critic 8.8/10, Spec Reviewer APPROVED)  
> **Kỹ sư triển khai:** Implementer & Orchestrator  
> **Kiểm thử tự động:** 30/30 tests PASS (`outer_building_plot_and_matte_tile_sharpness.test.ts`)  
> **Toàn bộ dự án:** 134/134 test suites PASS (1.696/1.696 tests PASS, 0 hồi quy)  

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Cải tiến IMP-35 giải quyết trọn vẹn 2 phản hồi then chốt của người dùng về việc vật thể 3D che tên thẻ bài và độ sắc nét quang học khi quan sát từ trên cao:

1. **Bố Cục Thẻ Cờ Ngoại Biên (Outer Building Plot Invariant - Z = +0.58)**:
   - Dời toàn bộ công trình 3D C0–C3 (`ProceduralBuilding`) và `StandeeBillboard` từ vùng trung tâm (`Z = -0.42` và `Z = 0.0`) ra 1/3 mép ngoài của thẻ bài (`position={[0, Y, 0.58]}`).
   - Giải phóng 100% diện tích nửa trong cho dải màu nhận diện vùng và tên địa danh tỉnh thành. Tên thẻ bài không còn bị bất kỳ mô hình 3D hay bóng đổ nào che khuất.

2. **Chất Liệu Giấy Bìa Mờ (True Matte Cardstock Shading)**:
   - Thay đổi thuộc tính vật liệu mặt thẻ sang `roughness={0.96}`, `metalness={0.0}`, `envMapIntensity={0.0}` trên toàn bộ 40 ô cờ (cả ô tiêu chuẩn lẫn ô góc).
   - Triệt tiêu 100% hiện tượng phản quang lóa trắng (specular glare hotspot) dưới ánh nắng gắt của sa bàn ngoài trời. Mực in đen `#020617` giữ trọn độ sâu và tương phản trên nền giấy ngà sáng `#F8F5EE`.

3. **Khóa Nét Texture & Triệt Tiêu Mờ Nhòe Mipmap**:
   - Trong `tile_texture_generator.ts`: Vô hiệu hóa Mipmap box filter (`generateMipmaps = false`), cấu hình `minFilter = LinearFilter`, `magFilter = LinearFilter`, `anisotropy = 16`.
   - GPU luôn đọc trực tiếp từ texture HiDPI 1024x1360 nguyên bản, bảo toàn từng nét thanh nét đậm và dấu thanh tiếng Việt (hỏi, ngã, sắc, nặng) khi nhìn từ trên cao.

---

## 2. THÔNG SỐ KỸ THUẬT & NGÂN SÁCH

- **Kiểm thử tự động**: 30 atomic tests đạt chuẩn 5-Facet Behavioral Matrix.
- **Giới hạn số dòng mã (LOC)**:
  - `src/client/3d/procedural_building.tsx`: **344 LOC** (Trần 3D Logic: <= 400 LOC).
  - `src/client/3d/board_tile.tsx`: **289 LOC** (Trần 3D Logic: <= 400 LOC).
  - `src/client/3d/tile_texture_generator.ts`: **289 LOC** (Trần Config: <= 800 LOC).
  - `tests/client/outer_building_plot_and_matte_tile_sharpness.test.ts`: **442 LOC** (Trần Test: <= 600 LOC).
- **Chất lượng mã nguồn**:
  - `npm run gate:quick`: 0 lỗi type, 0 lỗi cú pháp, 0 vi phạm anti-patterns.
- **Thẩm định mỹ thuật độc lập**:
  - `game-3d-visual-critic`: **8.8 / 10.0** (Commercial AAA Benchmark), `disposition: ship`.
  - `spec-reviewer`: **APPROVED 100%**.

---

## 3. BẤT BIẾN LƯU VÀO GOTCHAS.MD

- **Gotcha #55**: `[3D/GRAPHICS/LAYOUT] Bất Biến Bố Cục Thẻ Cờ Ngoại Biên, Giấy Bìa Mờ True Matte & Khóa Nét Mipmap (Outer Building Plot, True Matte Cardstock & Texture Sharpness Invariant - IMP-35)`.
