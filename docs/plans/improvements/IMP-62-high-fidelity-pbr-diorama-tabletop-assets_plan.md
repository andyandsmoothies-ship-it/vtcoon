# KẾ HOẠCH CẢI TIẾN IMP-62: PHOTOREALISTIC MINIATURE DIORAMA TABLETOP 3D ASSETS & PBR MATERIAL OVERHAUL

> **Mục tiêu**: Triệt tiêu triệt để cảm giác "khối hộp Lego thô sơ đơn sắc" trên sa bàn 3D; nâng cấp toàn bộ công trình, sa bàn và mặt bàn cờ lên đẳng cấp **Sa bàn cờ bàn thu nhỏ tinh xảo ngoài đời thực (Commercial AAA Miniature Diorama)** chuẩn tham chiếu Retropoly & Monopoly Plus Tabletop.

---

## 1. BỐI CẢNH & NGUYÊN NHÂN VẬT LÝ HIỆN TẠI

Người chơi phản ánh: *"đồ họa lên càng giống thật càng tốt được không? hiện tại có vẻ khá sơ sài như lego"*.
Qua kiểm tra mã nguồn thực tế:
1. **15 Mô hình `.glb` xuất thân từ Blockbench Voxel**: Polygon siêu thấp (chỉ 72 – 156 tam giác/mô hình), không có vát mép bo góc mềm, không có chi tiết cứu cánh kiến trúc.
2. **Sa bàn trung tâm (`src/client/3d/diorama/`) dùng hình học thô trần trụi**:
   - `diorama_highrise_blocks.tsx`: 16 tháp cao ốc là các khối hộp `boxGeometry` trơn nhẵn phủ màu xanh đơn sắc `#0284C7`, không có lưới cửa sổ, khung nhôm hay kính phản chiếu.
   - `diorama_shophouse_blocks.tsx`: 32 nhà phố là các khối hộp vàng kem `#FEF08A` cắm mái ngói đơn sắc `#EA580C`, không có cửa đi, ban công, hay hoa văn tường.
3. **Khung bàn cờ dưới sa bàn là hộp nâu phẳng lì**: `board_layout.tsx#L101-L104` render `boxGeometry` màu nâu `#2B1D14` trơn nhẵn, thiếu hoàn toàn vân gỗ óc chó, độ bóng véc-ni và bo viền của một chiếc bàn cờ vật lý cao cấp.
4. **Vật liệu thiếu thuộc tính vật lý cao cấp (PBR Physical Materials)**: Chưa khai thác các tính năng mạnh mẽ của Three.js `MeshPhysicalMaterial` (`clearcoat`, `roughnessMap`, `sheen`, `transmission`, `ior`).

---

## 2. SƠ ĐỒ KIẾN TRÚC & DÒNG CHẢY BIẾN ĐỔI (LOGIC FLOWCHART)

```text
[HIỆN TẠI: LEGO VOXEL THÔ]              [IMP-62: SA BÀN THU NHỎ TINH XẢO]
Box thô 120 tris, 0 map           ───>  Mô hình Resin điêu khắc 2.500-3.500 tris
16 Tháp cao ốc xanh đặc           ───>  Tháp kính PBR HiDPI Facade Window Grid
32 Nhà phố vàng trơn nhẵn         ───>  Nhà phố Indochine ngói âm dương, cửa chớp
Bàn cờ hộp nâu phẳng lì #2B1D14   ───>  Mặt bàn Gỗ Óc Chó PBR Véc-ni + Thảm nỉ len Sheen
Bóng mờ lơ lửng                   ───>  ContactShadows ôm khít chân móng công trình
```

---

## 3. BỐN TRỤ CỘT TRIỂN KHAI CHI TIẾT

### Trụ Cột 1: Nâng Cấp 15 Mô Hình 3D Cao Cấp (`public/models/`)
Tạo generator chuyên dụng sản xuất lại toàn bộ 15 tệp mô hình `.glb` bằng Three.js `GLTFExporter` với hình học bo vát mép (beveled geometry), tỷ lệ kiến trúc chuẩn xác và vật liệu PBR nhiều phân lớp:
1. **Công trình C1-C3 (`public/models/buildings/`)**:
   - `building_c1.glb` (Nhà phố Đông Dương): Mái ngói đất nung âm dương gờ nổi, cửa sổ lá sách chìm, ban công sắt uốn nghệ thuật, tường vôi vàng cổ điển, đèn hiên.
   - `building_c2.glb` (Cao ốc Sapphire): Khối tháp kính sapphire đa diện vát cạnh, lam chắn nắng brise-soleil nhôm bạc, sảnh đón canopy kính thấu quang.
   - `building_c3.glb` (Tổ hợp Landmark / TTTM Resort): Tháp vươn cao đa tầng, đỉnh vương miện mạ vàng kim cương, khối đế thương mại vát góc, sân vườn cảnh quan trên mái.
2. **Quân cờ VIP (`public/models/pawns/`)**:
   - `pawn_tower.glb`: Tháp ngọc hoàng kim mạ vàng 24k (`metalness: 0.95, roughness: 0.12`).
   - `pawn_yacht.glb`: Du thuyền du lịch siêu sang vỏ bạc crom đánh bóng.
   - `pawn_car.glb`: Xe cổ mui trần mạ đồng thau cổ điển, đèn pha pha lê.
   - `pawn_horse.glb`: Ngựa chiến dũng mãnh đúc titan sapphire.
3. **Danh thắng di sản (`public/models/landmarks/`)**:
   - `landmark_ben_thanh.glb`: Chợ Bến Thành điêu khắc tháp đồng hồ 4 mặt, mái ngói tam giác đỏ, cửa vòm đón khách.
   - `landmark_cathedral.glb`: Nhà thờ Đức Bà với 2 tháp chuông nhọn vươn cao, tường gạch Marseille đỏ thắm, thánh giá kim loại.
4. **Phương tiện vi mô (`public/models/vehicles/`)**:
   - Thân xe bo tròn khí động học, kính xe trong suốt thấu quang, đèn pha/hậu dạ quang. Tàu container có rãnh dập sóng thép container chân thực.

### Trụ Cột 2: Facade Texture Generator & Sa Bàn Trung Tâm (`src/client/3d/diorama/`)
- Tạo module `src/client/3d/facade_texture_generator.ts`: Sinh các CanvasTexture HiDPI tạo vân bề mặt kiến trúc:
  - `createHighriseFacadeTexture`: Lưới cửa sổ kính cao ốc hiện đại phản chiếu bầu trời, kẻ chỉ nhôm tinh xảo, phát quang ban đêm.
  - `createShophouseFacadeTexture`: Mặt tiền nhà phố Pháp cổ, cửa lá sách sổ gỗ, ban công con tiện, biển hiệu cổ điển.
- Nâng cấp `DioramaHighriseBlocks`: Áp facade texture lên 16 tháp cao ốc kết hợp đỉnh tháp kính kim cương vát nhọn.
- Nâng cấp `DioramaShophouseBlocks`: Áp facade texture lên 32 nhà phố kết hợp mái ngói có gờ chỉ sắc sảo.

### Trụ Cột 3: Mặt Bàn Cờ Bàn Gỗ Óc Chó (Walnut Tabletop) & Thảm Nỉ Xúc Giác
- Tạo module `src/client/3d/tabletop_texture_generator.ts`: Sinh texture vân gỗ óc chó (Walnut Wood Grain PBR Texture 2K) tự nhiên:
  - Vân gỗ uốn lượn tự nhiên tông màu nâu hạt dẻ ấm áp `#3B2314` - `#24140B`.
  - Bổ sung `roughnessMap` tạo độ bóng véc-ni thủ công sang trọng.
  - Gờ viền bàn cờ nẹp chỉ đồng kim loại sang trọng.
- `src/client/3d/board_layout.tsx`: Gắn Texture vân gỗ óc chó vào mặt bàn cờ `WALNUT_TABLE_Y`.
- `src/client/3d/dice_tray.tsx`: Nâng cấp thảm nỉ khay gieo xúc xắc sang `MeshPhysicalMaterial` với thuộc tính sợi nhung `sheen: 1.0`, `sheenColor: '#10B981'`, viền la bàn mạ đồng thau rực rỡ.

### Trụ Cột 4: Chiều Sâu Tiếp Xúc Sa Bàn & Ánh Sáng Tự Nhiên
- Cân chỉnh `ContactShadows` trong `src/client/game_canvas.tsx` ôm khít các chân móng công trình và sa bàn đảo, xóa sạch cảm giác công trình bị lơ lửng.
- Cập nhật ngân sách `scripts/optimize_assets.mjs`:
  - Nâng trần tam giác an toàn cho kỷ nguyên High-Fidelity:
    * Pawns: <= 3.500 tris (cũ: 1.200)
    * Buildings: <= 3.000 tris (cũ: 800)
    * Landmarks: <= 4.500 tris (cũ: 1.500)
    * Vehicles: <= 1.200 tris (cũ: 400)
  - Giữ tổng tải trọng asset toàn bộ mô hình: `<= 3.0 MB` (hoàn toàn an toàn cho WebGL 60 FPS).

---

## 4. MA TRẬN TEST HỢP ĐỒNG (TRẠM 1 CONTRACT TEST SPECIFICATION)

Tạo tệp test: `tests/contracts/imp62_high_fidelity_tabletop_assets.test.ts` (>= 20 atomic tests, 1-4 asserts/test, zero loops in it()):
- **Facet 1 (Model Asset Density & Geometry Fidelity)**:
  - Assert 15 tệp `.glb` tồn tại đầy đủ trên đĩa.
  - Assert tam giác của từng nhóm mô hình đạt độ chi tiết cao cấp (> 500 tris cho buildings, > 800 tris cho pawns, > 1.000 tris cho landmarks), triệt tiêu hoàn toàn chuẩn voxel thô cũ (< 200 tris).
  - Assert dung lượng từng tệp <= ngân sách tối đa.
- **Facet 2 (Procedural Facade Texture Architecture)**:
  - Assert `facade_texture_generator.ts` sinh thành công texture cho Highrise và Shophouse.
  - Assert texture sở hữu mipmaps và LinearMipmapLinearFilter.
- **Facet 3 (Tabletop Walnut Wood & Sheen Felt)**:
  - Assert `tabletop_texture_generator.ts` sinh texture vân gỗ óc chó đạt chuẩn 2K/1K.
  - Assert DiceTray áp dụng vật liệu nhung len sheen cho thảm cờ.
- **Facet 4 (Zero Visual Anti-Patterns & 60 FPS Safe)**:
  - Assert không có lỗi biên dịch TypeScript (`tsc --noEmit`).
  - Assert `npm run lint:ui` đạt 0 vi phạm.

---

## 5. KẾ HOẠCH BẢO VỆ PHÒNG THỦ & TƯƠNG THÍCH NGƯỢC
- **Headless Test Guard**: Toàn bộ mô hình và texture generator đều có fallback an toàn khi chạy trong Vitest/SSR/Headless (không crash WebGL context).
- **Tương thích ngược 100%**: Mọi URL model (`/models/buildings/...`, `/models/pawns/...`) giữ nguyên đường dẫn, không làm vỡ bất kỳ test suite nào của `building_models.test.ts`, `luxury_pawn_models.test.ts`, `landmark_models.test.ts`.
