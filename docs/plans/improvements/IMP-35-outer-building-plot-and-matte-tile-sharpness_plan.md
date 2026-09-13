# Kế Hoạch Kỹ Thuật IMP-35: Bố Cục Thẻ Cờ Ngoại Biên, Khóa Nét Mực In & Triệt Tiêu Chói Lóa Quang Học

## I. TỔNG QUAN & BỐI CẢNH (CONTEXT & OBJECTIVES)

- **Vấn đề thực tế từ phản hồi người dùng:**
  1. *Vật thể 3D che khuất tên thẻ bài*: Công trình 3D (`ProceduralBuilding`) đặt tại `Z = -0.42` và `StandeeBillboard` đặt tại `Z = 0.0` cắm trực tiếp lên vị trí tên địa danh (`y = 108` trên texture) và icon của từng ô cờ.
  2. *Chữ bị mờ và ánh sáng làm bợt màu*: Mặt thẻ dùng vật liệu bóng (`roughness={0.52}`, `envMapIntensity={0.5}`) tạo lớp chói sáng lóa trắng (specular glare), kết hợp thuật toán Mipmap box filter tự động nén mờ ảnh ở khoảng cách xa, khiến chữ và dấu thanh tiếng Việt bị nhòe khi nhìn từ trên xuống.
- **Mục tiêu IMP-35:**
  1. Dời bệ móng xây dựng 3D (`ProceduralBuilding`), Standee ô hạ tầng và khung đo đạc C0 ra **1/3 mép ngoài của thẻ bài (`Z = +0.58`)**, giải phóng 100% diện tích nửa trong cho tên thẻ bài.
  2. Triệt tiêu 100% ánh chói lóa quang học bằng chất liệu **Giấy Bìa Mờ PBR (True Matte Cardstock)**: `roughness={0.96}`, `metalness={0.0}`, `envMapIntensity={0.0}`.
  3. Khóa nét texture chữ in bằng cách tắt cơ chế Mipmap downsampling mờ xa trên `CanvasTexture`: `generateMipmaps = false; minFilter = LinearFilter;`.

---

## II. SƠ ĐỒ BỐ CỤC THẺ CỜ MỚI

```
MẶT THẺ CỜ VTCOON (1.68m x 2.2m):
┌────────────────────────────────────────────────────────┐ ◄── Z = -1.1 (Mép trong: Hướng vào trung tâm/sông)
│                DẢI MÀU NHẬN DIỆN VÙNG                  │
│────────────────────────────────────────────────────────│
│                                                        │
│           TÊN ĐỊA DANH / TỈNH THÀNH (IN HOA)           │ ◄── VÙNG THÔNG THOÁNG 100%
│              (Chữ Đen Tuyền #020617, Nét Gọn)          │     (Không bị vật thể 3D che)
│                      Phụ Đề Chi Tiết                   │     (Không bị bóng đổ đè lên)
│                                                        │
│────────────────────────────────────────────────────────│
│                KHAY GIÁ NIÊM YẾT TIỀN TỆ               │
│────────────────────────────────────────────────────────│
│  ╔══════════════════════════════════════════════════╗  │ ◄── Z = +0.58 (1/3 Mép ngoài: Hướng viền gỗ)
│  ║       BỆ MÓNG CÔNG TRÌNH 3D & STANDEE BIỂU TƯỢNG  ║  │     (ProceduralBuilding C1-C3)
│  ║       (Khung ô đất C0 / Cọc cờ sở hữu Brass)     ║  │     (StandeeBillboard Ô Hạ Tầng)
│  ╚══════════════════════════════════════════════════╝  │
└────────────────────────────────────────────────────────┘ ◄── Z = +1.1 (Mép ngoài: Hướng viền bàn cờ)
```

---

## III. CHI TIẾT THAY ĐỔI MÃ NGUỒN (PROPOSED CHANGES)

### 1. Thành phần Công Trình 3D: `procedural_building.tsx`
#### [MODIFY] [`src/client/3d/procedural_building.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/procedural_building.tsx)
- Đổi tọa độ bệ móng công trình từ `position={[0, 0.22, -0.42]}` thành `position={[0, 0.22, 0.58]}` cho cả cấp 0 (SurveyorPlotBoundary) và cấp 1..3.
- Đảm bảo file <= 400 LOC.

### 2. Thành phần Ô Cờ & Vật Liệu: `board_tile.tsx`
#### [MODIFY] [`src/client/3d/board_tile.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx)
- Đổi tọa độ Standee: `position={[0, 0.45, 0.58]}` với `scale={[0.78, 0.78]}`.
- Đổi vật liệu mặt thẻ `meshStandardMaterial`:
  `roughness={0.96}`, `metalness={0.0}`, `envMapIntensity={0.0}` (True Matte Cardstock).
- Đảm bảo file <= 400 LOC.

### 3. Bộ Sinh Texture Thẻ Cờ: `tile_texture_generator.ts`
#### [MODIFY] [`src/client/3d/tile_texture_generator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_generator.ts)
- Cấu hình texture không tạo mipmap làm mờ:
  `texture.generateMipmaps = false; texture.minFilter = LinearFilter; texture.magFilter = LinearFilter;`
- Nền giấy da sáng `#F8F5EE` tăng tương phản với mực in đen `#020617`.

---

## IV. QUY TRÌNH THI CÔNG 3 TRẠM (MANDATORY 3-STATION PIPELINE)

1. **Trạm 1 (RED Contract Test)**: `qa-tester` viết `tests/client/outer_building_plot_and_matte_tile_sharpness.test.ts` (30 atomic assertions) và chứng minh test báo ĐỎ.
2. **Trạm 2 (GREEN Implementation)**: `implementer` cập nhật 3 tệp mã nguồn trên để chuyển toàn bộ assertions sang XANH (GREEN).
3. **Trạm 3 (Independent Review & Physical Disk Verification)**:
   - `spec-reviewer`: Kiểm toán đĩa vật lý, đối chiếu 100% đặc tả.
   - `game-3d-visual-critic`: Thẩm định chất lượng mỹ thuật quang học và vị trí công trình (8.8/10, ship).
4. **Cập nhật Docker**: Rebuild image và recreate container `vtcoon-vtcoon-1` trên port 3000.
