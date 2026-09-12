# [KẾ HOẠCH CẢI TIẾN IMP-13] MẶT BÀN CỜ & ĐẠI DƯƠNG VÔ CỰC (ENDLESS LIVING OCEAN & SLOPED SAND PENINSULA)

## 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT (BƯỚC 3 LỘ TRÌNH MỚI)

Kế thừa thành công từ **Bước 1: Sàn Đấu Giá Kịch Tính (IMP-11)** và **Bước 2: Sảnh Chờ VIP Penthouse (IMP-12)**, Bước 3 tập trung đại phẫu nền tảng không gian ngoại cảnh sa bàn 3D của VTCOON theo đúng bản phân tích kỹ thuật chuyên sâu (Deep Technical Blueprint):

1. **Xóa bỏ hoàn toàn "đĩa xám" và "thảm cỏ phẳng sân golf"**:
   - Loại bỏ đĩa tròn xám nhạt (`radius: 28` / `[15.0, 15.8, 0.08]`) và mặt phẳng cỏ xanh nhân tạo phẳng lì (`[21.0, 24.5, 0.22]`) xung quanh bàn cờ tạo cảm giác đĩa cắt nhân tạo.
2. **Mặt Biển Sóng Động Vô Cực (Endless Living Ocean)**:
   - Mở rộng mặt biển bằng một lưới sóng rộng `PlaneGeometry(240, 240, 96, 96)` phủ kín toàn bộ tầm nhìn camera bất kể góc xoay hay thu phóng.
   - Sử dụng shader sóng Gerstner kết hợp `useFrame` tính toán sóng điều hòa: nước biển phân tầng màu quang học từ ngọc bích ngập nắng sát bờ (`#06B6D4`) chuyển dần sang xanh thẳm đại dương (`#0369A1` ➔ `#0C4A6E`) ở phía chân trời.
3. **Bờ Biển Cát Vát Nghiêng Tự Nhiên (Sloped Sand Shoreline)**:
   - Viền xung quanh bán đảo sa bàn được tạo độ dốc thoai thoải 15 độ bằng chất liệu cát vàng biển nhiệt đới (`#FDE68A`, `roughness: 0.85`).
   - Dải bọt biển trắng ven bờ (Shoreline Foam Ring) co giãn nhịp nhàng theo chu kỳ 3.5 giây, mô phỏng từng đợt sóng vỗ dập dềnh vào bờ cát.
4. **Cây Nhiệt Đới Đa Tầng (Layered Tropical Foliage)**:
   - Thay thế các que kẹo mút đơn điệu bằng cây nhiệt đới tán lá xếp tầng: thân cây hơi cong tự nhiên, tán cây gồm 3 tầng nón xếp lệch góc màu xanh rêu đậm pha ánh vàng nắng (`#15803D` và `#4ADE80`).
   - Toàn bộ cây xanh được gom vào `InstancedMesh` để tối ưu triệt để Draw Calls (<85 calls) duy trì 60 FPS.

---

## 2. PHÂN RÃ KIẾN TRÚC & MÔ-ĐUN HÓA

```text
[CoastalIslandEnvironment] (<= 400 LOC)
  │
  ├── [EndlessLivingOcean] (Lưới sóng vô cực 240x240, Gerstner waves, phân tầng #06B6D4 -> #0369A1 -> #0C4A6E)
  ├── [SlopedSandShoreline] (Bờ cát vát nghiêng 15 độ #FDE68A, roughness 0.85, bọt sóng chu kỳ 3.5s)
  ├── [LayeredTropicalFoliage] (Thân cong + 3 tầng nón lệch góc #15803D / #4ADE80, 4 InstancedMeshes)
  ├── [MountainBackdrop] (Rặng núi xanh 32 phân đoạn & vách đá xám sườn núi)
  ├── [SeaportInfrastructure] (Tàu container Cát Lái, cầu cạn & hầm đường sắt mini)
  └── [MaritimeActors] (Ca-nô tuần duyên lướt sóng & đàn hải âu bay lượn)
```

### 1. Phân tách mô-đun Cây Nhiệt Đới Đa Tầng (`layered_tropical_foliage.tsx`)
- Tọa độ 32 cây phân bố tự nhiên ven bãi biển, sườn đồi và vành đai chân núi.
- Cấu trúc 1 cây:
  * Thân dừa/cọ: `cylinderGeometry args={[0.08, 0.14, 1.2, 8]}` màu `#78350F`, độ nghiêng nhẹ tự nhiên (`tiltX`, `tiltZ`).
  * Tầng nón 1 (Đáy): `coneGeometry args={[0.95, 0.55, 8]}` màu xanh rêu đậm `#15803D`, roughness 0.65.
  * Tầng nón 2 (Giữa): `coneGeometry args={[0.72, 0.45, 8]}` màu xanh rậm `#16A34A`, góc lệch `yaw + Math.PI / 6`.
  * Tầng nón 3 (Chóp đỉnh): `coneGeometry args={[0.48, 0.38, 8]}` màu xanh ánh vàng nắng `#4ADE80`, góc lệch `yaw + Math.PI / 3`.
- Gom toàn bộ 32 cây vào 4 `InstancedMesh` nodes (1 thân + 3 tầng lá).
- Giảm 97.5% Draw Calls cho cây xanh (từ 128 draw calls xuống còn 4 draw calls).

### 2. Tái cấu trúc Mặt Biển Sóng Động Vô Cực & Bờ Cát Vát 15 Độ
- Lưới sóng Gerstner: `PlaneGeometry(240, 240, 96, 96)` tại Y = -0.60.
- Vertex displacement cập nhật thời gian thực qua `useSafeFrame` kết hợp tính toán pháp tuyến bề mặt `computeVertexNormals()`.
- Phân tầng quang học theo bán kính:
  * $R \le 38$: Nước ngọc bích sát bờ `#06B6D4`.
  * $38 < R \le 80$: Xanh biển trung tâm `#0369A1` (với điểm xuyết `#0284C7`).
  * $R > 80$: Xanh đại dương thẳm chân trời `#0C4A6E`.
- Bờ cát vát nghiêng 15 độ: Thay thế hoàn toàn các đĩa tròn xám `#94A3B8` và thảm cỏ phẳng `#22C55E` bằng frustum dốc thoai thoải 15 độ (`cylinderGeometry args={[16.2, 27.8, 0.32, 64]}` tại Y = -0.32) sử dụng vật liệu cát vàng nhiệt đới `#FDE68A`, `roughness: 0.85`.
- Dải bọt biển ven bờ: `ringGeometry args={[27.2, 34.2, 64]}` tại Y = -0.48, dao động co giãn tỷ lệ `1 + tideCycle * 0.042` theo chu kỳ 3.5s (`Math.PI * 2 / 3.5`).

---

## 3. CHỈ SỐ KỸ THUẬT & TIÊU CHÍ HOÀN THÀNH (DoD)

1. **Type-Safety & Zero Dirty Casts:**
   - `strict: true`, hoàn toàn không có `as any` hay `as unknown as T`.
2. **Tuân thủ Giới hạn Phân loại Dòng mã (Categorized File Limits):**
   - UI/Scene components <= 500 LOC (mục tiêu `coastal_island_environment.tsx` <= 400 LOC, `layered_tropical_foliage.tsx` <= 200 LOC).
3. **Zero Regression:**
   - Bảo đảm 104+ test files tiếp tục PASS 100%.
   - Cập nhật và bổ sung test contracts tại `tests/client/coastal_island_environment.test.ts`.
4. **Hiệu năng WebGL 60 FPS & Draw Call Budget:**
   - Draw calls toàn cảnh duy trì dưới ngưỡng ngân sách (<85 calls).
5. **Artifacts & Tài liệu bàn giao:**
   - Báo cáo nghiệm thu thực nghiệm: `docs/reports/improvements/IMP-13-endless-living-ocean-and-beveled-peninsula_report.md`.
   - Cập nhật Sổ cái Lộ trình Tổng thể: `docs/master_roadmap.md`.
   - Ảnh chụp minh chứng sa bàn biển mới: `docs/reports/improvements/screenshots/step3_endless_living_ocean.jpg`.
