# BÁO CÁO THỰC THI CẢI TIẾN IMP-32
## ĐẠI TU SA BÀN ĐÔ THỊ ĐẢO VỊNH & BÀN GỖ THƯỢNG LƯU (EXECUTIVE TABLETOP & COASTAL ISLAND DIORAMA)

> **Mã số cải tiến:** IMP-32  
> **Căn cứ pháp lý:** Hiến pháp dự án [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), Gotcha #51.  
> **Chuẩn tham chiếu đối chiếu:** Monopoly Plus (`media_1789282902199.webp`), Retropoly (`media_1789282902241.jpg`).  
> **Trạng thái:** HOÀN THÀNH (100% ĐẠT CHUẨN 3 TRẠM).

---

### 1. TỔNG QUAN KẾT QUẢ ĐẠT ĐƯỢC

1. **Bối Cảnh Hợp Nhất Monopoly Plus x Retropolis**:
   - Tích hợp Khung Bàn Gỗ Óc Chó Thượng Lưu (`WalnutTabletop`) tại `y = -0.350` kích thước `32m x 32m x 0.2m` với vật liệu PBR màu `#2B1D14` (`roughness: 0.35`, `metalness: 0.08`).
   - Xóa bỏ 100% hai mảng cỏ phẳng lì màu xanh lá cây `#22C55E` (`args={[6.5, 0.01, 15.2]}`).
   - Khóa cứng cấu trúc `DEPTH_LAYER_STACK` 8 tầng bất biến (`-0.350` đến `+0.025`) triệt tiêu 100% hiện tượng Z-Fighting.

2. **Bài Trừ 100% Hiệu Ứng Dát Vàng & Neon Karaoke Lòe Loẹt**:
   - Xóa bỏ hoàn toàn tệp `src/client/3d/golden_glow_vfx.tsx` và bài test cũ khỏi ổ đĩa.
   - Triệt tiêu các shader emissive xanh neon/hồng tím trong `procedural_building.tsx`; giới hạn ban ngày bằng `0.0`, ban đêm nhẹ nhàng `<= 0.45`.
   - Tách `SurveyorPlotBoundary` sang tệp riêng `src/client/3d/surveyor_plot_boundary.tsx` (77 LOC), đưa `procedural_building.tsx` về đúng 344 LOC (<= 400 LOC limit).

3. **Cọc Cờ Sở Hữu Đúc Kim Loại (OwnershipMarkerInstances)**:
   - Tích hợp cọc cờ sở hữu hiển thị trên toàn bộ 22 ô bất động sản đã có chủ.
   - Sử dụng 2 `instancedMesh` tối ưu: Cột kim loại đồng thau `FlagPole` (Brass PBR: `roughness: 0.25, metalness: 0.85`) và Cờ vải đuôi nheo `FlagCloth` đổi màu người chơi bằng `setColorAt`.

4. **Ánh Sáng Tự Nhiên & Hậu Kỳ Điện Ảnh**:
   - Kích hoạt **AgX Tone Mapping** (`ToneMappingMode.AGX`) trong `post_processing_pipeline.tsx` chống cháy sáng highlight.
   - Tối ưu **N8AO `halfRes: true`** (`aoHalfRes: true`) cho bóng tiếp xúc chân thực ở 60 FPS.

5. **Sóng Biển GPU Shader**:
   - Khai tử vòng lặp CPU `Float32Array` trong `coastal_island_environment.tsx`, chuyển dịch sang GPU Gerstner Wave Vertex Shader thông qua `onBeforeCompile`, duy trì 287 LOC.

---

### 2. KẾT QUẢ NGHIỆM THU 3 TRẠM

| Trạm | Đơn Vị Đảm Nhiệm | Kết Quả |
| :--- | :--- | :---: |
| **Trạm 1: RED Contract Test** | `qa-tester` | ✔️ PASS (6/6 tests Báo Đỏ ban đầu) |
| **Trạm 2: GREEN Implementation** | `implementer` | ✔️ PASS (6/6 tests Xanh, 131/131 suites PASS, 0 linter errors) |
| **Trạm 3: Independent Review** | `spec-reviewer` & `game-3d-visual-critic` | ✔️ APPROVED & `disposition: ship` (9.2 / 10.0 AAA) |
