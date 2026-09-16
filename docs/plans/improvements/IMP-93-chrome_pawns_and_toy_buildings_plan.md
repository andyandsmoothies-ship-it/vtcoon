# Kế Hoạch Cải Tiến IMP-93: Quân Cờ Chrome Bạc 3D & Nhà/Khách Sạn Đồ Chơi Trên Dải Màu Ô Cờ

## 1. Mục Tiêu Nghiệp Vụ
Nâng cấp chất lượng hình ảnh sa bàn đô thị 3D của VTCoOn từ 8.3/10 tiệm cận chuẩn thương mại AAA (Monopoly Plus của Ubisoft, Monopoly Tycoon của Marmalade Game Studio, đạt >= 86-90% so với 4 ảnh tham chiếu người dùng).

## 2. Các Trụ Cột Kỹ Thuật
1. **Trụ Cột 1: Quân Cờ Mạ Chrome Bạc 3D & Bệ Hào Quang Màu Người Chơi**
   - Chuẩn hóa 4 linh vật VIP (`LUXURY_PAWN_CONFIGS`) sang chất liệu chrome bạc: `color: '#F8FAFC'`, `metalness: 0.96`, `roughness: 0.08`.
   - Scale toàn bộ quân cờ lên `[0.92, 0.92, 0.92]`.
   - Bổ sung đĩa hào quang phát quang màu người chơi `PawnAuraPedestal` (`data-testid="pawn-aura-pedestal"`, `emissiveIntensity: 0.5`).

2. **Trụ Cột 2: Khối Nhà Xanh Lục Bảo & Khách Sạn Đỏ Ruby Dập Nổi Trên Dải Màu Đỉnh Ô Cờ**
   - Tạo mới `src/client/3d/toy_property_buildings.tsx`:
     * `ToyHouseMesh`: Nhựa bóng ngọc lục bảo `#10B981`, mái dốc tam giác, ống khói tí hon, gờ cửa sổ.
     * `ToyHotelMesh`: Đỏ Ruby `#DC2626`, tháp mái vát trung tâm, đường viền vàng hoàng kim kim loại `#F59E0B`.
     * `ToyPropertyBuildings`: Tọa độ mặc định `[0, 0.125, -0.80]` trên dải màu đỉnh ô cờ. Cấp 1 render 1 nhà, Cấp 2 render 2 nhà, Cấp 3 render 1 khách sạn.
   - Tích hợp vào `src/client/3d/board_tile.tsx` trong `LayeredDioramaTile`.

3. **Trụ Cột 3: Đồi Công Viên Giật Cấp & Biển Hiệu 3D Nóc Nhà Phố**
   - `diorama-park-relief` trong `diorama_terrain.tsx`: Bệ đá xám `#64748B` nâng cao (Y = 0.035m) và thảm cỏ xanh cao tầng `#15803D`.
   - `diorama-rooftop-signs` trong `diorama_shophouse_blocks.tsx`: Biển ly cà phê 3D `#F59E0B`, biển bánh donut `#EC4899`, biển sàn HOSE `#10B981`.

## 3. Ràng Buộc Kiến Trúc & Bất Biến
- Module LOC limit <= 300 LOC.
- Tọa độ nhà/khách sạn đồ chơi: Y trong [0.10, 0.20], Z trong [-0.95, -0.65].
- Zero-drift FSM & bảo tồn 100% testids hiện hữu.
