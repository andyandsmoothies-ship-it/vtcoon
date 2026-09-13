# KẾ HOẠCH ĐẠI TU TOÀN DIỆN KIẾN TRÚC SA BÀN RETROPOLY & BỜ BIỂN NHIỆT ĐỚI (IMP-30: RETROPOLY METROPOLIS & LIVING COASTAL OVERHAUL)

> **Mã số:** IMP-30  
> **Căn cứ pháp lý:** Hiến pháp dự án `GEMINI.md`, Định hướng mỹ thuật `docs/domain/design.md`, ADR-0002.  
> **Tác phẩm tham chiếu chuẩn thương mại (Visual Ground Truth Anchor):** Retropoly (`media_1789215374494.jpg`).  
> **Hiện trạng đối sánh:** Bản dựng thực tế hiện tại (`media_1789226835952.png`).  
> **Phương pháp cốt lõi:** Kích hoạt triệt để quy tắc **"Kill The Premise"** (Xóa bỏ 3 tiền đề sai lầm: Bàn cờ mâm nổi, Hố nước khay xúc xắc rỗng ruột giữa lòng bàn cờ, và Đại dương tối tăm phân mảnh ngoài hư vô).

---

## I. MA TRẬN ĐỐI SOÁT KỸ THUẬT: HIỆN TRẠNG VS. ẢNH THAM CHIẾU RETROPOLY

| Tiêu Chí Mỹ Thuật & Kiến Trúc | Hiện Trạng Bản Dựng (`media_1789226835952.png`) | Mục Tiêu Thương Mại Retropoly (`media_1789215374494.jpg`) | Giải Pháp Kỹ Thuật Bất Biến (IMP-30) |
| :--- | :--- | :--- | :--- |
| **1. Cao độ bàn cờ & Mép đất** | Bàn cờ đặt trên mâm nổi cao 0.24m (`RoundedBox [21.4, 0.24, 21.4]`) nẹp viền kim loại vàng, tách lìa hoàn toàn khỏi hòn đảo. | Bàn cờ phẳng lì hòa tan vào mặt đất (`y = 0.020`). Bờ cát vàng và thảm cỏ xanh nối thẳng vào chân các ô cờ. | **Terrain Flush Invariant**: Xóa bỏ bệ kè hộp xám và nẹp viền kim loại. Khóa cứng phân tầng cao độ vật lý (Depth Layer Stack) triệt tiêu 100% Z-fighting. |
| **2. Không gian lòng bàn cờ (15.8m x 15.8m)** | Hồ nước vuông 4x4m (`CenterpieceWater`) và khay xúc xắc thành hộp gỗ gụ chiếm hơn 50% diện tích, lòng cờ bị rỗng ruột tối tăm. | Đại đô thị nén (Dense Metropolis) dày đặc: Tháp đôi Landmark kính Sapphire, khu cảng cẩu công nghiệp, sân vận động oval, vòng đu quay, phố cổ di sản Indochine. | **Dense Metropolis Urban Grid**: Xóa bỏ vĩnh viễn hồ nước vuông và khay gỗ. Quy hoạch 4 block phố có lưới đường nhựa, vỉa hè và công trình giật cấp theo nguyên lý phễu ngược. |
| **3. Cơ chế xúc xắc & Camera** | Xúc xắc bị giam vĩnh viễn trong thành hộp gỗ gụ cao 0.24m. Camera `dice_roll` ngắm cố định vào tâm bàn cờ `[0, 0.35, 0]`. | Xúc xắc đỏ ruby trong suốt nảy trên quảng trường thoáng đãng, tự mờ dần sau 1.5s. Camera bám sát tọa độ nảy mới. | **Transient Dice Runway**: Rơi nảy tại `[0.0, 0.02, 3.8]`, nảy vật lý 1.1s, mờ dần sau 1.5s (Phương án A). Cập nhật `CAMERA_CONFIG.dice_roll` sang `target: [0.0, 0.25, 3.8]`. |
| **4. Ánh sáng & Bầu trời** | Nước biển xanh đen kịt (`#051525`), bầu trời đen ngòm hư vô, đèn spotlight vàng rọi đốm tròn gắt như sân khấu rạp hát. | Bầu trời nhiệt đới xanh sáng ngập tràn nắng hè, rặng núi xanh mờ sương phía Bắc kèm tháp radar đỉnh núi, dải mây trắng xốp, nước biển ngọc lam trong vắt (`#00BCD4`). | **Sunlit Tropical Atmosphere**: Vòm trời xanh chuyển sắc (`#E0F2FE` ➔ `#38BDF8`), nắng vàng ấm (intensity 1.8), rặng núi nhấp nhô low-poly kèm tháp radar vi mô. |
| **5. Bờ biển & Hàng dừa** | Thềm cát là các khối trụ tròn (`cylinderGeometry`) xơ xác, thiếu sức sống nhiệt đới. | Bờ cát cánh cung uốn lượn tự nhiên ôm dọc mép Nam, dải bọt sóng trắng viền bờ biển, rừng dừa 60 cây nghiêng bóng mát. | **Organic Coastline & Palm Forest**: Đường cong bãi cát hữu cơ, dải bọt sóng trắng Foam Wake Ring, tách component `tropical_palms_cluster.tsx` gom 60 cây dừa qua `InstancedMesh`. |
| **6. 4 Góc ngoại vi biểu tượng** | 4 góc ngoại vi là các khối hộp thô sơ chắp vá trên đĩa cát tròn tách biệt. | Góc Tây Bắc: Sân bay Tân Sơn Nhất vòm kính trắng + đường băng dài; Góc Đông Nam: Ga xe lửa vòm ngọc + đường ray; Biển: Tàu container RSG đáy đỏ rẽ sóng. | **Iconic Corner Dioramas**: Xây dựng sân bay hiện đại, ga xe lửa Indochine cổ điển, tuyến đường ray đôi uốn lượn và tàu container hàng hải chân thực. |
| **7. Quản trị hiệu năng & LOC** | Nguy cơ tụt FPS nếu sinh hàng trăm mesh riêng lẻ; nguy cơ tệp `coastal_island_environment.tsx` vượt trần 400 LOC. | 60 FPS mượt mà; tuân thủ nghiêm ngặt giới hạn LOC của Hiến pháp GEMINI.md. | **Modular Decomposition & InstancedMesh**: Tách `horizon_mountain_range.tsx` (< 120 LOC) và `tropical_palms_cluster.tsx` (< 100 LOC); giữ tệp chính < 300 LOC. Draw Calls <= 75. |

---

## II. SƠ ĐỒ THỊ GIÁC & PHÂN TẦNG KỸ THUẬT

### 1. Phân Tầng Cao Độ Triệt Tiêu Z-Fighting (Depth Layer Stack)

```text
[y = +0.025] ── Thềm móng Standee / Chân tòa nhà Shophouse
[y = +0.020] ── Mặt trên 40 Ô Cờ & Mặt đường Đại Lộ Sài Gòn
[y = +0.015] ── Viền chỉ móng ô cờ / Vỉa hè gạch đá granite
[y =  0.000] ── Nền địa hình chính (Bãi cát vàng Nam / Thảm cỏ xanh Bắc)
[y = -0.150] ── Mặt biển Gerstner Wave ngọc bích
```

### 2. Vòng Đời Xúc Xắc Động Trên Đại Lộ Sài Gòn (Transient Dice Runway)

```text
[FSM: Roll Intent] 
       │
       ▼
[Spawn tại Y=4.5, Z=3.8] ──► [Spring Physics: Rơi & Nảy 1.1s] 
       │
       ▼
[Dừng tại Y=0.020, Z=3.8] ──► [Hiển thị kết quả 1.5s] 
       │
       ▼
[Opacity 1.0 ➔ 0.0 (300ms)] ──► [Unmount khỏi Scene Graph] ──► [Mặt đường thông thoáng 100%]
```

### 3. Mặt Cắt Góc Nhìn Máy Quay 38 Độ (Stepped Height Funnel)

```text
Camera (Y=19.5, Z=18.5)
      \
       \   Tầm nhìn thoáng 100%
        \ ────────────────────────────────────────────────────────┐
         \                                                        │
          \          [Vành Đai Ven Ô Cờ]    [Trung Tầng]     [Hậu Cảnh Bắc]
           \         Nhà thấp (0.3-0.6)  Chợ Bến Thành (1.2) Cao ốc kính (3.2)
            ▼               ┌─┐                 ┌───┐            ┌─────┐
    [40 Ô Cờ (Y=0.020)]     │ │                 │   │            │     │
   ─────────────────────────┴─┴─────────────────┴───┴────────────┴─────┴─────
```

---

## III. BẢN ĐỒ TỔNG THỂ KIẾN TRÚC MỚI (MASTER DIORAMA LAYOUT)

```text
                                [CHÂN TRỜI PHÍA BẮC: RẶNG NÚI XANH MỜ SƯƠNG, THÁP RADAR & MÂY TRẮNG]
                                             [BẦU TRỜI XANH NHIỆT ĐỚI NGẬP TRÀN ÁNH NẮNG HÈ]
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │  [GÓC TÂY BẮC: SÂN BAY QUỐC TẾ TÂN SƠN NHẤT]                        [GÓC ĐÔNG BẮC: CÔNG VIÊN VEN NÚI]       │
 │  • Nhà ga vòm kính trắng cong khí động học                           • Đồi cỏ dốc thoai thoải mềm mại        │
 │  • Đường băng dài kẻ vạch sơn trắng + đèn beacon                      • Cụm thông & dừa nhiệt đới đung đưa    │
 │  • 2 máy bay phản lực thương mại đậu ống lồng                        • Đài thiên văn vòm tròn ngắm sao       │
 ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │                                  40 Ô BÀN CỜ VTCOON PHẲNG LIỀN MẠCH VỚI MẶT ĐẤT                             │
 │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │                              ĐẠI ĐÔ THỊ NÉN SÀI GÒN - CHỢ LỚN (15.8m x 15.8m)                         │  │
 │  │  ┌──────────────────────────────────────────────┬──────────────────────────────────────────────────┐  │  │
 │  │  │ BLOCK TÂY BẮC: TRUNG TÂM TÀI CHÍNH & CẢNG    │ BLOCK ĐÔNG BẮC: KHU THỂ THAO & VUI CHƠI          │  │  │
 │  │  │ • 16 cao ốc kính Sapphire PBR (10-35 tầng)   │ • Sân vận động oval mái vòm xanh (Stadium)       │  │  │
 │  │  │ • Cặp tháp đôi Landmark Hoàng Kim vươn cao   │ • Vòng đu quay Ferris Wheel phát sáng lễ hội     │  │  │
 │  │  │ • Cẩu cảng container màu vàng & kho bãi      │ • Công viên hồ nước uốn lượn tự nhiên & đài phun │  │  │
 │  │  ├──────────────────────────────────────────────┼──────────────────────────────────────────────────┤  │  │
 │  │  │ BLOCK TÂY NAM: PHỐ CỔ & DI SẢN ĐÔNG DƯƠNG    │ BLOCK ĐÔNG NAM: DỊCH VỤ & KHÁCH SẠN NGHỈ DƯỠNG   │  │  │
 │  │  │ • Chợ Bến Thành PBR (landmark_ben_thanh.glb) │ • Khách sạn ven sông có hồ bơi vô cực trên mái   │  │  │
 │  │  │ • Nhà Thờ Đức Bà PBR (landmark_cathedral.glb)│ • Khu phố ẩm thực dù che nắng đa sắc màu         │  │  │
 │  │  │ • 24 Shophouse ngói đỏ đất nung Chợ Lớn xưa  │ • Bến du thuyền Marina sang trọng                │  │  │
 │  │  └──────────────────────────────────────────────┴──────────────────────────────────────────────────┘  │  │
 │  │                    ★ ĐẠI LỘ SÀI GÒN & SÀN DIỄN XÚC XẮC NẢY THOÁNG ĐÃNG TRỤC TRUNG TÂM NAM ★              │  │
 │  └───────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
 ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │  [BỜ BIỂN CÁNH CUNG TÂY NAM & NAM]                                 [GÓC ĐÔNG NAM: GA XE LỬA TRUNG TÂM]     │
 │  • Bãi cát vàng thoai thoải tràn sát mép ô cờ 1-9                   • Ga xe lửa mái vòm xanh ngọc lớn       │
 │  • Rừng dừa 60 cây nghiêng bóng tự nhiên ven biển                   • Tuyến đường ray xe lửa đôi uốn lượn   │
 │  • Biển ngọc bích đa tầng (#00BCD4 ➔ #0284C7)                      • Bệ phóng vũ trụ / Radar tương lai     │
 │  • Dải bọt sóng trắng & Tàu container RSG đáy đỏ rẽ sóng ngoài khơi                                          │
 └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## IV. GIẢI QUYẾT TRIỆT ĐỂ 3 CHỐT CHẶN KỸ THUẬT (PUSH-BACK RESOLUTION)

### Chốt Chặn 1: Căn Chỉnh Camera `dice_roll` Theo Tọa Độ Rơi Xúc Xắc Mới
- **Vấn đề**: Trong `src/client/3d/camera_state_machine.ts`, camera `dice_roll` cũ đang ngắm vào `target: [0, 0.35, 0]`. Khi xúc xắc dời điểm hạ cánh về `[0.0, 0.020, 3.8]`, camera sẽ ngắm lệch lên khoảng trống trung tâm.
- **Giải pháp**: Cập nhật thông số `dice_roll` trong `CAMERA_CONFIG`:
  ```typescript
  dice_roll: {
    position: [2.5, 2.8, 7.2] as const,
    target: [0.0, 0.25, 3.8] as const,
    fov: 36,
    speed: 4.8,
  },
  ```

### Chốt Chặn 2: Khóa Cứng Quy Tắc Phân Tầng Cao Độ Vật Lý (Zero Z-Fighting)
- **Vấn đề**: Tránh nhấp nháy buffer chiều sâu giữa cát/cỏ, ô cờ, vỉa hè và Standee.
- **Giải pháp**: Cưỡng chế các hằng số cao độ toàn hệ thống:
  - `TERRAIN_BASE_Y = 0.000`
  - `TILE_BORDER_Y = 0.015`
  - `TILE_SURFACE_Y = 0.020`
  - `STANDEE_BASE_Y = 0.025`

### Chốt Chặn 3: Phân Rã Module Chống Vượt Trần LOC (Max LOC <= 400)
- **Vấn đề**: `src/client/3d/coastal_island_environment.tsx` hiện có 353 LOC, có nguy cơ vượt trần 400 LOC nếu ôm đồm thêm núi và dừa.
- **Giải pháp**: Tách thành các component con độc lập:
  1. `src/client/3d/horizon_mountain_range.tsx` (< 120 LOC): Rặng núi xanh phía Bắc, đồi cỏ dốc, mây trắng xốp và tháp radar đỉnh núi.
  2. `src/client/3d/tropical_palms_cluster.tsx` (< 100 LOC): Rừng dừa 60 cây ven biển qua `InstancedMesh`.
  3. Giữ `coastal_island_environment.tsx` dưới 280 LOC (chỉ điều phối biển, tàu container và gọi các sub-components).

---

## V. KẾ HOẠCH TRIỂN KHAI 5 PHÂN HỆ KỸ THUẬT

### Phân Hệ 1: Phẳng Hóa Bàn Cờ & Phân Tầng Cao Độ Triệt Tiêu Z-Fighting
- **Tệp chỉnh sửa:**
  - [`src/client/3d/board_layout.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_layout.tsx)
- **Hành động cụ thể:**
  1. Xóa bỏ bệ kè nổi `RoundedBox args={[21.4, 0.24, 21.4]}` màu đá phiến sẫm và 2 khung nẹp kim loại vàng.
  2. Đặt toàn bộ 40 ô cờ `LayeredDioramaTile` tiếp giáp trực tiếp mặt nền tại `y = 0.020`, viền chỉ móng tại `y = 0.015`.
  3. Xóa bỏ vĩnh viễn component `<CenterpieceWater />` hình vuông rỗng lòng.
  4. Mở rộng địa hình mặt nền liền mạch: Phía Nam & Tây Nam là thềm cát vàng (`#FFE599`), phía Bắc & Đông Bắc là thảm cỏ xanh tươi (`#4ADE80`) tại `y = 0.000`.

### Phân Hệ 2: Đại Lộ Sài Gòn, Xúc Xắc Động & Căn Chỉnh Camera
- **Tệp chỉnh sửa:**
  - [`src/client/3d/dice_tray.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/dice_tray.tsx)
  - [`src/client/3d/camera_state_machine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts)
- **Hành động cụ thể:**
  1. Xóa bỏ 4 cạnh thành hộp gỗ gụ bao quanh (`boxGeometry args={[4.0, 0.24, 0.2]}`) và bậc cẩm thạch chiếm đất.
  2. Tọa độ rơi xúc xắc: Trục đại lộ trung tâm Nam `[0.0, 0.020, 3.8]`.
  3. Xúc xắc đỏ Ruby trong suốt PBR (roughness: 0.15, transmission: 0.85, ior: 1.5).
  4. Hoạt ảnh: Rơi từ trên cao (`y = 4.5`), nảy đàn hồi 1.1s, hiển thị kết quả 1.5s và tự động mờ dần `opacity 1.0 ➔ 0.0` trong 300ms rồi unmount (Phương án A đã duyệt).
  5. Cập nhật `CAMERA_CONFIG.dice_roll`: `position: [2.5, 2.8, 7.2]`, `target: [0.0, 0.25, 3.8]`.

### Phân Hệ 3: Lưới Đô Thị Nén 4 Phân Khu Theo Nguyên Lý Phễu Ngược
- **Tệp chỉnh sửa:**
  - [`src/client/3d/miniature_city_diorama.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/miniature_city_diorama.tsx)
  - [`src/client/3d/diorama/diorama_skyline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_skyline.tsx)
  - [`src/client/3d/diorama/diorama_terrain.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/diorama/diorama_terrain.tsx)
- **Hành động cụ thể:**
  1. **Lưới đường giao thông & Vỉa hè:** Đại lộ 2 làn xe trải nhựa sẫm mịn bóng (`#1E293B`) tại `y = 0.020`, vỉa hè lát gạch men Đông Dương tại `y = 0.025`.
  2. **Tối ưu hóa `InstancedMesh` (Draw Calls <= 12):**
     - 32 Khối Shophouse Đông Dương: Tường vàng kem Indochine (`#FEF08A`), mái ngói đất nung đỏ cam (`#EA580C`). Cao 0.4 - 0.8 đơn vị.
     - 16 Khối Cao ốc kính Sapphire: Khung nhôm titan mờ (`#64748B`), kính sapphire phản chiếu bầu trời xanh (`#38BDF8`). Cao 1.8 - 3.2 đơn vị lùi về trục Bắc.
  3. **Tích hợp Danh thắng Di sản:** Chợ Bến Thành (`landmark_ben_thanh.glb`) và Nhà Thờ Đức Bà (`landmark_cathedral.glb`) đặt tại phân khu Di sản Tây Nam.
  4. **Khu Vui Chơi & Thể Thao:** Sân vận động oval mái vòm xanh, vòng đu quay Ferris Wheel phát sáng, công viên hồ nước uốn lượn tự nhiên có đài phun nước vi mô.

### Phân Hệ 4: Bờ Biển Cánh Cung, Rừng Dừa Nhiệt Đới & Chân Trời Núi Mờ Sương
- **Tệp chỉnh sửa/tạo mới:**
  - [NEW] [`src/client/3d/horizon_mountain_range.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/horizon_mountain_range.tsx) (< 120 LOC)
  - [NEW] [`src/client/3d/tropical_palms_cluster.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tropical_palms_cluster.tsx) (< 100 LOC)
  - [`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx) (< 280 LOC)
  - [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx)
- **Hành động cụ thể:**
  1. **Bầu trời & Rặng núi chân trời:**
     - Xóa bỏ màn đêm đen hư vô. Dựng vòm trời nhiệt đới ngập tràn nắng hè (`#E0F2FE` ➔ `#38BDF8`).
     - Dãy núi xanh nhấp nhô mờ sương low-poly mềm mại phía Bắc (`#15803D` / `#166534`) kết hợp tháp radar vi mô trên đỉnh núi ngắm sao (Phương án đã duyệt).
     - Cụm mây trắng xốp 3D trôi lơ lửng ở chân trời.
  2. **Bờ cát biển cánh cung & Sóng ngọc lam:**
     - Bờ cát cong tự nhiên mềm mại chạy dài từ Tây sang Nam tại `y = 0.000`.
     - Nước biển ngọc lam trong vắt ven bờ (`#00BCD4`), chuyển dần sang ngọc bích sẫm ngoài khơi (`#0284C7`), dải bọt sóng trắng viền mép cát.
  3. **Rừng dừa nhiệt đới nghiêng bóng:**
     - 60 Cây dừa thân cong tự nhiên ven biển được gom trọn vẹn vào 2 `InstancedMesh` trong `tropical_palms_cluster.tsx`.

### Phân Hệ 5: Đại Tu 4 Góc Ngoại Vi Biểu Tượng (Iconic Corner Dioramas)
- **Tệp chỉnh sửa:**
  - [`src/client/3d/coastal_island_landmarks.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_landmarks.tsx)
- **Hành động cụ thể:**
  1. **Góc Tây Bắc — Sân Bay Quốc Tế Tân Sơn Nhất:**
     - Nhà ga vòm kính trắng cong khí động học đón ánh nắng hè.
     - Tháp không lưu vươn cao có đèn beacon nhấp nháy.
     - Đường băng dài trải nhựa kẻ vạch sơn trắng tim đường và vạch tiếp đất.
     - 2 Máy bay phản lực thương mại đậu tại cầu ống lồng.
  2. **Góc Đông Nam — Ga Xe Lửa Sài Gòn & Đài Thiên Văn:**
     - Nhà ga trung tâm mái vòm cong màu xanh ngọc lam PBR rực rỡ phong cách Indochine cổ điển.
     - Tuyến đường ray xe lửa đôi uốn cong mềm mại chạy dọc triền đồi ra bờ biển.
     - Bệ phóng vũ trụ / Đài thiên văn ngắm sao tương lai.
  3. **Vùng Biển Tây Nam & Đông Nam:**
     - Tàu container hàng hải RSG đáy đỏ rẽ sóng lớn ngoài khơi xa.
     - Ca-nô tuần duyên lướt sóng tạo vệt bọt tuyết dài (Dynamic Foam Wake).

---

## VI. MA TRẬN PHÂN CHIA TEST CONTRACTS & KIỂM CHỨNG 3 TRẠM

### Trạm 1: Adversarial Contract Tests (`qa-tester` - RED)
- Tệp kiểm thử hợp đồng: `tests/client/dense_metropolis_architecture.test.ts`
- Thẻ kiểm thử:
  - `[TC-IMP30/MSS-01]`: Khẳng định 100% không còn component `CenterpieceWater` và thành hộp gỗ gụ cố định chiếm đất trung tâm.
  - `[TC-IMP30/MSS-02]`: Khẳng định 40 ô cờ nằm phẳng ngang mặt đất `y = 0.020` và Depth Layer Stack không xung đột cao độ (Zero Z-Fighting).
  - `[TC-IMP30/MSS-03]`: Kiểm chứng sự tồn tại của các cụm `InstancedMesh` (shophouse, cao ốc, cây dừa nhiệt đới) và các module phân rã (`horizon_mountain_range`, `tropical_palms_cluster`).
  - `[TC-IMP30/MSS-04]`: Khẳng định `CAMERA_CONFIG.dice_roll` ngắm chuẩn xác tọa độ `[0.0, 0.25, 3.8]`.
  - `[TC-IMP30/MSS-05]`: Khẳng định bầu trời đại cảnh có chân trời núi kèm tháp radar, không rò rỉ hư vô đen.
  - `[TC-IMP30/MSS-06]`: Khẳng định ngân sách hiệu năng: Draw Calls <= 75 và kích thước tệp tuân thủ <= 400 LOC.

### Trạm 2: Triển Khai Kỹ Thuật (`implementer` - GREEN)
- Thi công lần lượt 5 phân hệ theo đúng đặc tả và bảng thông số PBR.
- Kiểm tra linter: `npm run lint:ui`, `npm run lint:slop`, `npm run lint:assets`.
- Đảm bảo 130/130 test suites PASS 100%.

### Trạm 3: Thẩm Định Độc Lập & Kiểm Chứng Đĩa Vật Lý
1. `spec-reviewer`: Đọc đĩa vật lý, đối soát 100% từng dòng mã nguồn với bản kế hoạch.
2. `game-3d-visual-critic`: Chụp ảnh render CDP thực tế trên 5 góc máy thương mại (`top_down`, `lobby_vip`, `deed_modal`, `dice_tray`, `hud_dock`), đặt song song đối chiếu với `media_1789215374494.jpg`. Phán quyết PASS chỉ khi điểm visual đạt >= 9.5/10.

---

## VII. BẢNG MÃ MÀU PBR & THÔNG SỐ VẬT LIỆU CHUẨN RETROPOLY

| Thực Thể Kiến Trúc | Mã Màu Hex (Base Color) | Roughness | Metalness | Đặc Tính Thị Giác Bổ Sung |
| :--- | :--- | :---: | :---: | :--- |
| **Bờ cát biển nhiệt đới** | `#FFE599` (Vàng cát ngà ấm) | 0.88 | 0.00 | Hạt cát mịn màng, bắt nắng vàng tự nhiên tại `y = 0.000` |
| **Nước biển ven bờ** | `#00BCD4` (Ngọc lam Azure) | 0.08 | 0.15 | Trong vắt, thấy đáy cát nông và dải bọt trắng |
| **Nước biển ngoài khơi** | `#0284C7` (Ngọc bích sâu) | 0.12 | 0.20 | Phản chiếu ánh nắng chói lóa (Specular Highlight) |
| **Bọt sóng ven bờ** | `#FFFFFF` (Bọt tuyết trắng) | 0.40 | 0.00 | Độ trong suốt 0.75, co giãn chu kỳ 3.5s |
| **Thảm cỏ nội đô & đồi núi** | `#4ADE80` / `#15803D` | 0.82 | 0.00 | Xanh lục tươi tắn, không ngả vàng úa |
| **Đại lộ nhựa nội đô** | `#1E293B` (Nhựa sẫm mịn) | 0.22 | 0.15 | Vệt bóng phản chiếu đèn xe và ánh nắng nhẹ tại `y = 0.020` |
| **Vỉa hè lát đá/gạch men** | `#E2E8F0` / `#FEF08A` | 0.65 | 0.05 | Họa tiết gạch men Đông Dương vi mô tại `y = 0.025` |
| **Mái ngói Shophouse Chợ Lớn**| `#EA580C` (Ngói đất nung) | 0.70 | 0.00 | Ngói âm dương cổ truyền Sài Gòn |
| **Tường Shophouse Indochine** | `#FEF08A` (Vàng kem Pháp) | 0.75 | 0.00 | Ban công sắt mỹ nghệ màu than chì `#334155` |
| **Cao ốc kính Sapphire** | `#38BDF8` (Kính xanh bầu trời)| 0.05 | 0.85 | Phản chiếu mây trời và ánh sáng mặt trời |
| **Tháp Landmark Hoàng Kim** | `#FBBF24` (Vàng Champagne) | 0.18 | 0.90 | Khung titan kim loại óng ánh vươn cao |
| **Mái vòm Sân bay Tân Sơn Nhất**| `#F8FAFC` (Trắng tinh khiết) | 0.25 | 0.20 | Vòm kính cong khí động học hiện đại |
| **Mái vòm Ga xe lửa Sài Gòn** | `#0D9488` (Xanh ngọc lam PBR) | 0.30 | 0.40 | Phong cách kiến trúc Đông Dương cổ điển |
| **Xúc xắc 3D Transient** | `#DC2626` (Đỏ Ruby trong suốt) | 0.12 | 0.10 | Chấm tròn dập chìm trắng sáng `#FFFFFF` |
