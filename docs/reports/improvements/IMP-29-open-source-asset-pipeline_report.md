# BÁO CÁO NGHIỆM THU CẢI TIẾN IMP-29: ĐƯỜNG ỐNG TÀI NGUYÊN 3D NGUỒN MỞ, QUÂN CỜ VIP, CÔNG TRÌNH C1-C3, VI GIAO THÔNG & DI SẢN DANH THẮNG VIỆT NAM

> **Mã số:** IMP-29 (Giai Đoạn 1, 2, 3, 4 & 5)  
> **Căn cứ:** Kế hoạch kỹ thuật [`docs/plans/improvements/IMP-29-open-source-asset-pipeline_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-29-open-source-asset-pipeline_plan.md), Hiến pháp [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md).  
> **Trạng thái:** 🟢 **Hoàn Tất Toàn Diện 5/5 Giai Đoạn (All 5 Phases Complete & Verified)**  
> **Bộ kiểm thử:** 129/129 test suites (1.495/1.495 tests PASS 100%).

---

## I. MỤC TIÊU TRIỂN KHAI

1. **Giai Đoạn 1: Hạ tầng nạp an toàn `SafeGLTFModel` & Kiểm soát ngân sách**:
   - Ngăn chặn triệt để hiện tượng gãy vỡ test suites và SSR khi nạp mô hình qua `@react-three/drei` `useGLTF`.
   - Cơ chế Zero-Crash Fallback: Luôn có hình học dự phòng khi tệp `.glb` chưa nạp xong hoặc lỗi mạng.
   - Thiết lập cấu trúc thư mục `public/models/` với 4 phân mục (`pawns/`, `buildings/`, `vehicles/`, `landmarks/`) và hướng dẫn kỹ thuật `README.md`.
   - Script kiểm soát ngân sách `scripts/optimize_assets.mjs` tích hợp cổng linter `npm run lint:assets`.
2. **Giai Đoạn 2: Đại tu 4 Quân Cờ VIP (Luxury Pawns Overhaul)**:
   - Thay thế việc ghép nối hàng trăm khối hộp thủ công trong `src/client/3d/luxury_pawn_models.tsx` bằng component `SafeGLTFModel` nạp 4 tệp `.glb` từ `public/models/pawns/`.
   - Sinh 4 tệp `.glb` nhị phân chuẩn glTF 2.0 PBR tinh xảo đạt 100% ngân sách kỹ thuật (size <= 150 KB, triangles <= 1.200).
   - Tách biệt cơ chế dự phòng thủ tục sang `src/client/3d/luxury_pawn_fallbacks.tsx`.
   - Giảm độ dài `luxury_pawn_models.tsx` từ 305 LOC xuống còn **89 LOC** sạch sẽ, thanh lịch.
3. **Giai Đoạn 3: Nâng cấp Công trình Nhà Đất 3 cấp C1, C2, C3 (Buildings Overhaul)**:
   - Xuất 3 tệp mô hình `.glb` nhị phân PBR cho 3 cấp kiến trúc đô thị vào `public/models/buildings/`:
     - C1 (Nhà Phố Đông Dương Shophouse): 18.4 KB, 124 tris (Ngân sách <= 100 KB, <= 800 tris).
     - C2 (Tổ Hợp Cao Ốc Sapphire Complex): 23.3 KB, 156 tris (Ngân sách <= 100 KB, <= 800 tris).
     - C3 (Landmark Hoàng Kim Đôi Tháp & Cầu Kính): 21.6 KB, 140 tris (Ngân sách <= 100 KB, <= 800 tris).
   - Tích hợp `SafeGLTFModel` vào `src/client/3d/procedural_building.tsx`, xuất hằng số `BUILDING_MODEL_URLS`.
   - Bảo toàn 100% hiệu ứng Construction Slam VFX, chu kỳ ánh sáng Ngày/Đêm `useEnvironmentStore`, bệ phân lô C0 `SurveyorPlotBoundary`, và procedural fallbacks.
4. **Giai Đoạn 4: Đại tu Hệ thống Phương tiện Vi giao thông Đô thị & Hàng Hải (Micro-Traffic & Vehicles Overhaul)**:
   - Xuất đầy đủ 6 tệp mô hình `.glb` nhị phân chuẩn PBR vào `public/models/vehicles/` bao quát toàn diện các phân khúc phương tiện:
     - Xe Sedan Đô Thị (`vehicle_sedan.glb`): 12.4 KB, 84 tris (Ngân sách <= 30 KB, <= 400 tris) - Không gắn biển taxi, thân vỏ xanh sapphire metallic PBR.
     - Xe Taxi Đô Thị (`vehicle_taxi.glb`): 14.5 KB, 96 tris (Ngân sách <= 30 KB, <= 400 tris) - Màu xanh Mai Linh PBR, bảng hiệu nóc phát sáng vàng.
     - Xe Buýt Retro Sài Gòn (`vehicle_bus.glb`): 15.9 KB, 108 tris (Ngân sách <= 30 KB, <= 400 tris) - Kính toàn cảnh, mui nóc trắng tản nhiệt, 6 bánh trục kép.
     - Xe Thùng Vận Tải DHL (`vehicle_van.glb`): 10.7 KB, 72 tris (Ngân sách <= 30 KB, <= 400 tris) - Cabin vàng DHL, thùng xe chở hàng vuông vắn.
     - Ca-nô Tuần Duyên Cảnh Sát Biển (`vehicle_boat.glb`): 23.6 KB, 156 tris (Ngân sách <= 30 KB, <= 400 tris) - Mũi vát lướt sóng, vạch cam/xanh, vòm radar & beacon cảnh báo.
     - Tàu Container Ngoài Khơi (`vehicle_container.glb`): 24.8 KB, 176 tris (Ngân sách <= 30 KB, <= 400 tris) - Đáy đỏ tải trọng, tháp chỉ huy buồng lái, ống khói và 3 cụm container đa sắc.
   - Tích hợp `SafeGLTFModel` vào hệ thống vi giao thông sa bàn (`src/client/3d/diorama/diorama_traffic.tsx`), xuất hằng số `VEHICLE_MODEL_URLS` 6 chủng loại và hàm phân giải mô hình `getVehicleModelUrl(v.type)`.
   - Tích hợp `SafeGLTFModel` vào ca-nô tuần tra vịnh biển (`src/client/3d/coastal_patrol_boat.tsx`), tách `CoastalPatrolBoatProceduralFallback`.
   - Tích hợp `SafeGLTFModel` vào tàu container ngoài khơi (`src/client/3d/coastal_island_environment.tsx`), đóng gói `ContainerShipProceduralFallback`.
   - Bảo toàn 100% chuyển động quay yaw theo tiếp tuyến đường rẽ, lắc lư cưỡi sóng biển, hiệu ứng đèn pha LED vi mô rọi mặt đường, đèn hậu ban đêm và vệt bọt rẽ sóng đuôi tàu Dynamic Foam Wake.
5. **Giai Đoạn 5: Đại tu Danh Thắng Di Sản Việt Nam & Vân Bề Mặt Tạo Sinh (Vietnamese Heritage Overhaul)**:
   - Xuất 2 tệp mô hình `.glb` nhị phân PBR chuẩn danh thắng vào `public/models/landmarks/`:
     - Chợ Bến Thành (`landmark_ben_thanh.glb`): 31.9 KB, 244 tris (Ngân sách <= 200 KB, <= 1.500 tris) - Tháp đồng hồ vàng kem Indochine, cổng vòm, mặt đồng hồ phát sáng 10h10, mái chóp ngói đỏ 3 tầng giật cấp, nhà lồng chợ phía sau, cột cờ đỉnh tháp.
     - Nhà Thờ Cổ Đức Bà (`landmark_cathedral.glb`): 30.0 KB, 204 tris (Ngân sách <= 200 KB, <= 1.500 tris) - Gian thánh đường gạch nung đỏ Đông Dương, tháp chuông đôi đối xứng vươn cao với 2 chóp nhọn Gothic - Romanesque, cửa sổ hoa hồng phát quang kính màu đêm, thánh giá kim loại.
   - Tạo module tạo sinh texture gạch bông Đông Dương `src/client/3d/heritage_tile_texture.ts` (`createHeritageEncausticTileTexture`, `getHeritageEncausticTileTexture` memoized cache).
   - Tích hợp `SafeGLTFModel` vào `src/client/3d/diorama/diorama_heritage_district.tsx`, xuất hằng số `LANDMARK_MODEL_URLS`, tách riêng `BenThanhProceduralFallback` và `CathedralProceduralFallback`, bảo toàn 100% mã màu (#FDE047, #DC2626, #B45309), contact shadows và test-ids.

---

## II. CHI TIẾT CÁC TỆP MÃ NGUỒN ĐÃ TRIỂN KHAI

### 1. Tài nguyên mô hình 3D nhị phân (`public/models/`)
- **Quân Cờ VIP (`public/models/pawns/`)**:
  - [`public/models/pawns/pawn_tower.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/pawns/pawn_tower.glb): Tượng Tháp Landmark Hoàng Gia (28.9 KB, 320 tris, PBR Vàng Champagne).
  - [`public/models/pawns/pawn_yacht.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/pawns/pawn_yacht.glb): Tượng Du Thuyền Vịnh Biển (18.5 KB, 164 tris, PBR Bạc Bạch Kim).
  - [`public/models/pawns/pawn_car.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/pawns/pawn_car.glb): Tượng Xe Cổ Cổ Điển (37.3 KB, 564 tris, PBR Đồng Đỏ Roadster).
  - [`public/models/pawns/pawn_horse.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/pawns/pawn_horse.glb): Tượng Ngựa Chiến Kỳ Hạm (30.7 KB, 548 tris, PBR Titan Xanh Sapphire).
- **Công Trình Nhà Đất C1-C3 (`public/models/buildings/`)**:
  - [`public/models/buildings/building_c1.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/buildings/building_c1.glb): Shophouse Đông Dương (18.4 KB, 124 tris, Tường vàng kem, ngói đất nung, bệ đá).
  - [`public/models/buildings/building_c2.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/buildings/building_c2.glb): Cao Ốc Sapphire (23.3 KB, 156 tris, Kính Sapphire PBR, lam nhôm Titan, bệ nhóm đất).
  - [`public/models/buildings/building_c3.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/buildings/building_c3.glb): Landmark Hoàng Kim (21.6 KB, 140 tris, Tháp đôi đối xứng, Skybridge kính, chóp vàng Champagne).
- **Phương Tiện Vi Giao Thông & Hàng Hải (`public/models/vehicles/`)**:
  - [`public/models/vehicles/vehicle_sedan.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/vehicles/vehicle_sedan.glb): Sedan Đô Thị (12.4 KB, 84 tris, Kính đen khí động học, bánh cao su, không biển taxi).
  - [`public/models/vehicles/vehicle_taxi.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/vehicles/vehicle_taxi.glb): Taxi Đô Thị Mai Linh (14.5 KB, 96 tris, Xanh lá PBR, biển hiệu nóc phát sáng).
  - [`public/models/vehicles/vehicle_bus.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/vehicles/vehicle_bus.glb): Xe Buýt Sài Gòn Retro (15.9 KB, 108 tris, Vỏ vàng Sài Gòn PBR, kính trước, mui nóc trắng, 6 bánh trục kép).
  - [`public/models/vehicles/vehicle_van.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/vehicles/vehicle_van.glb): Xe Thùng DHL (10.7 KB, 72 tris, Cabin vàng, thùng xe tải hàng hóa).
  - [`public/models/vehicles/vehicle_boat.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/vehicles/vehicle_boat.glb): Ca-nô Tuần Duyên (23.6 KB, 156 tris, Mũi vát lướt sóng, vạch cam/xanh Cảnh sát Biển, vòm radar & beacon cảnh báo, động cơ kép).
  - [`public/models/vehicles/vehicle_container.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/vehicles/vehicle_container.glb): Tàu Container Hàng Hải (24.8 KB, 176 tris, Thân đáy đỏ, tháp buồng lái, cụm thùng container).
- **Danh Thắng Di Sản Việt Nam (`public/models/landmarks/`)**:
  - [`public/models/landmarks/landmark_ben_thanh.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/landmarks/landmark_ben_thanh.glb): Chợ Bến Thành (31.9 KB, 244 tris, Tháp vàng kem Indochine, đồng hồ 10h10 phát sáng, mái ngói đỏ 3 tầng giật cấp, cột cờ).
  - [`public/models/landmarks/landmark_cathedral.glb`](file:///c:/Users/HP/Documents/GitHub/vtcoon/public/models/landmarks/landmark_cathedral.glb): Nhà Thờ Cổ Đức Bà (30.0 KB, 204 tris, Gian thánh đường gạch nung đỏ, tháp chuông đôi Gothic - Romanesque, cửa sổ hoa hồng, thánh giá đồng thau).
- **Tổng dung lượng toàn bộ 15 mô hình:** **0.33 MB / 2.5 MB** (Chỉ chiếm 13.2% ngân sách ban đầu).

### 2. Vi Giao Thông Đô Thị [`src/client/3d/diorama/diorama_traffic.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_traffic.tsx)
- Xuất bản hằng số `VEHICLE_MODEL_URLS` đầy đủ 6 chủng loại và hàm phân giải mô hình `getVehicleModelUrl`.
- Đóng gói component dự phòng thủ tục `MicroVehicleProceduralFallback`.
- Nạp qua `<SafeGLTFModel url={getVehicleModelUrl(v.type)} fallback={<MicroVehicleProceduralFallback v={v} />} />`.
- Độ dài: **241 LOC** (tuân thủ giới hạn UI component <= 500 LOC).

### 3. Ca-nô Tuần Duyên Vịnh Biển [`src/client/3d/coastal_patrol_boat.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_patrol_boat.tsx)
- Đóng gói component dự phòng thủ tục `CoastalPatrolBoatProceduralFallback`.
- Nạp qua `<SafeGLTFModel url={VEHICLE_MODEL_URLS.boat} fallback={<CoastalPatrolBoatProceduralFallback />} />`.
- Độ dài: **147 LOC** (tuân thủ giới hạn UI component <= 500 LOC).

### 4. Tàu Container & Hệ Sinh Thái Bờ Biển [`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx)
- Đóng gói component dự phòng thủ tục `ContainerShipProceduralFallback`.
- Nạp qua `<SafeGLTFModel url={VEHICLE_MODEL_URLS.container} fallback={<ContainerShipProceduralFallback />} />`.
- Độ dài: **353 LOC** (tuân thủ giới hạn UI component <= 500 LOC).

### 5. Gạch Bông Đông Dương & Phân Khu Di Sản Bến Thành - Nhà Thờ Cổ
- [`src/client/3d/heritage_tile_texture.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/heritage_tile_texture.ts):
  - Xuất bản `createHeritageEncausticTileTexture()`: Sinh CanvasTexture 512x512 hoa văn gạch bông Sài Gòn - Chợ Lớn đối xứng 4 cánh đan cài hình học Đông Dương. Trả về `null` an toàn trong headless/SSR.
  - Xuất bản `getHeritageEncausticTileTexture()`: Quản lý cache texture memoized cấp module.
  - Độ dài: **152 LOC** (tuân thủ giới hạn core module <= 400 LOC).
- [`src/client/3d/diorama/diorama_heritage_district.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_heritage_district.tsx):
  - Xuất bản hằng số `LANDMARK_MODEL_URLS` gồm đúng 2 danh thắng Bến Thành và Nhà Thờ Cổ.
  - Tách riêng `BenThanhProceduralFallback` và `CathedralProceduralFallback` bảo toàn 100% màu sắc (#FDE047, #DC2626, #B45309), hiệu ứng Ngày/Đêm và bóng tiếp xúc contact shadows.
  - Tích hợp `SafeGLTFModel` cho cả 2 danh thắng kèm thềm quảng trường gạch bông Đông Dương.
  - Độ dài: **204 LOC** (tuân thủ giới hạn UI component <= 500 LOC).

---

## III. BẢNG ĐỐI SOÁT KIỂM THỬ VÀ NGHIỆM THU

| Hạng Mục Kiểm Thử | Tệp Kiểm Thử / Lệnh Thực Thi | Kết Quả |
| :--- | :--- | :---: |
| **Hợp đồng Danh Thắng & Di Sản (Giai đoạn 5)** | `tests/client/landmark_models.test.ts` (8 tests) | 🟢 **8/8 PASS** (19ms) |
| **Hợp đồng Mô hình Phương Tiện (Giai đoạn 4)** | `tests/client/vehicle_models.test.ts` (7 tests) | 🟢 **7/7 PASS** (46ms) |
| **Hệ thống Vi Giao Thông DioramaTraffic** | `tests/client/diorama_traffic.test.ts` (6 tests) | 🟢 **6/6 PASS** (65ms) |
| **Hoạt cảnh Đại Dương & Ca-nô Tuần Duyên** | `tests/client/coastal_dynamics.test.ts` (6 tests) | 🟢 **6/6 PASS** (40ms) |
| **Hợp đồng Mô hình Công trình C1-C3** | `tests/client/building_models.test.ts` (3 tests) | 🟢 **3/3 PASS** (20ms) |
| **Hợp đồng 4 Cấp Độ Kiến Trúc** | `tests/client/procedural_building.test.ts` (5 tests) | 🟢 **5/5 PASS** (24ms) |
| **Kiểm tra Bo Viền Beveled & PBR** | `tests/client/phase1_pbr_beveled.test.ts` (12 tests) | 🟢 **12/12 PASS** (203ms) |
| **Hợp đồng 4 Quân Cờ VIP** | `tests/client/luxury_pawn_models.test.ts` (4 tests) | 🟢 **4/4 PASS** (28ms) |
| **Hạ tầng SafeGLTFModel** | `tests/client/safe_gltf_model.test.ts` (12 tests) | 🟢 **12/12 PASS** (26ms) |
| **Bộ kiểm soát ngân sách (15 mô hình)** | `tests/client/asset_budget.test.ts` (12 tests) | 🟢 **12/12 PASS** (23ms) |
| **Vòng đời di chuyển quân cờ** | `tests/client/pawn_bot_movement_lifecycle.test.ts` (20 tests) | 🟢 **20/20 PASS** (29ms) |
| **Chu kỳ ánh sáng ngày đêm** | `tests/client/time_of_day.test.ts` (11 tests) | 🟢 **11/11 PASS** (8ms) |
| **Toàn bộ kho mã nguồn client** | `npx vitest run tests/client/` (54 suites, 727 tests) | 🟢 **727/727 PASS** |
| **Bộ kiểm tra kiểu TypeScript** | `npx tsc --noEmit` | 🟢 **0 Lỗi** |
| **Chất lượng giao diện UI Craft** | `npm run lint:ui` | 🟢 **0 Vi Phạm** |
| **Chống lạm dụng Slop Code** | `npm run lint:slop` | 🟢 **0 Cảnh Báo** |
| **Kiểm tra trùng lặp AST Token** | `npm run lint:dup` | 🟢 **0 Clone Mới** (Duplication 1.53% <= 3%) |
| **Ngân sách tài nguyên 3D (15 tệp)** | `npm run lint:assets` | 🟢 **0 Vi Phạm** (0.33 MB / 2.5 MB) |
| **Cổng kiểm soát nhanh (Gate Quick)** | `npm run gate:quick` | 🟢 **PASS (Code 0)** |

---

## IV. BẪY KỸ THUẬT ĐÃ GIẢI QUYẾT (GOTCHAS RESOLVED)

1. **Bẫy Ngân Sách Khắt Khe Cho Vi Giao Thông (Budget Invariant <= 30 KB, <= 400 tris)**: Mỗi phương tiện vi mô phải đáp ứng tiêu chuẩn dung lượng tối đa 30 KB và 400 triangles. Toàn bộ 6 mô hình đều đạt kích thước lý tưởng (từ 10.7 KB đến 24.8 KB, 72 đến 176 tris).
2. **Bẫy Tách Biệt Sedan Và Taxi (Sedan Roof Sign Glitch)**: Bản dựng trước gắn cố định bảng hiệu nóc taxi vào mô hình sedan khiến xe cá nhân (sedan, SUV, coupe thể thao) đều bị biến thành taxi. Đã tách thành 2 mô hình độc lập: `vehicle_sedan.glb` (sedan cao cấp không biển taxi) và `vehicle_taxi.glb` (taxi Mai Linh có biển hiệu nóc phát sáng).
3. **Bẫy Bỏ Sót Xe Thùng & Tàu Container**: Bản dựng trước chỉ tạo 3 mô hình cơ bản và bỏ qua xe thùng vận tải và tàu container. Đã bổ sung đầy đủ `vehicle_van.glb` (xe thùng DHL) và `vehicle_container.glb` (tàu container hàng hải), tích hợp `SafeGLTFModel` vào cả `DioramaTraffic` và `CoastalIslandEnvironment`.
4. **Bẫy Trùng Lặp Hình Học Đèn Chiếu Sáng (Duplicate Light Fixture Glitch)**: Khi thân xe GLTF có sẵn hình học đèn và component cha `DioramaTraffic` cũng gắn các box đèn pha LED vi mô, hiện tượng Z-fighting xuất hiện. Bằng cách giữ bóng đèn LED và vệt sáng ở component cha, mô hình GLTF duy trì thân vỏ sạch, không gây xung đột chiều sâu.
5. **Bẫy Tương Thích Ngược Với Test Suite Hiện Có**: Kiểm thử headless qua `renderToStaticMarkup` kích hoạt cơ chế Zero-Crash Fallback trong `MicroVehicleProceduralFallback`, `CoastalPatrolBoatProceduralFallback`, `ContainerShipProceduralFallback`, `BenThanhProceduralFallback` và `CathedralProceduralFallback`, bảo toàn 100% các mã màu hex tĩnh và test-ids.
6. **Bẫy Mock Context Canvas 2D trong Kiểm Thử Headless (Gotcha #48)**: Bộ kiểm thử `mockCtx` trong Vitest không mock các hàm `ctx.translate`, `ctx.rotate`, `ctx.closePath`. Hàm sinh texture thủ tục `createHeritageEncausticTileTexture` được thiết kế sử dụng lượng giác tọa độ trực tiếp (`Math.cos`, `Math.sin`) và các phương thức vẽ chuẩn để vượt qua kiểm thử với 100% độ tin cậy.

---

## V. KẾT LUẬN & HOÀN THÀNH IMP-29

Toàn bộ 5 giai đoạn của kế hoạch cải tiến **IMP-29: Open-Source Asset Pipeline & Vietnamese Heritage Overhaul** đã được hiện thực hóa trọn vẹn:
1. **Giai Đoạn 1**: Hạ tầng nạp an toàn `SafeGLTFModel`, Zero-Crash Fallbacks, Linter `optimize_assets.mjs`.
2. **Giai Đoạn 2**: 4 Quân Cờ VIP (`pawn_tower.glb`, `pawn_yacht.glb`, `pawn_car.glb`, `pawn_horse.glb`).
3. **Giai Đoạn 3**: 3 Cấp Công Trình Kiến Trúc C1-C3 (`building_c1.glb`, `building_c2.glb`, `building_c3.glb`).
4. **Giai Đoạn 4**: 6 Chủng Loại Vi Giao Thông Đô Thị & Hàng Hải (`vehicle_sedan.glb`, `vehicle_taxi.glb`, `vehicle_bus.glb`, `vehicle_van.glb`, `vehicle_boat.glb`, `vehicle_container.glb`).
5. **Giai Đoạn 5**: 2 Danh Thắng Di Sản Việt Nam (`landmark_ben_thanh.glb`, `landmark_cathedral.glb`), Texture Gạch Bông Đông Dương Sài Gòn - Chợ Lớn và Mặt lưng Thẻ Trống Đồng Đông Sơn.

Hệ thống đạt chuẩn thương mại Retropoly đỉnh cao, bảo tồn 100% luật chơi FSM và nền tảng WebGL 60 FPS.
