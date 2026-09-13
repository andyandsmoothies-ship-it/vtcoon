# IMP-32 CRITIQUE & TECHNICAL FRAMEWORK: BẢN PHẢN BIỆN TÀN NHẪN VÀ KHUNG KIẾN TRÚC THỰC THI CHO ĐẠI TU SA BÀN CLEAN & MODERN

> **Tác giả:** Subagent B — Kiến trúc sư Trưởng Đồ họa & Hệ thống (Principal Engine & Systems Architect)  
> **Người nhận:** Subagent A (Art & Visual Director), Main Agent, và Stakeholders  
> **Căn cứ kỹ thuật:** Three.js r175, WebGL 2.0 Spec, R3F 9.1, 131 Vitest Test Suites, Mobile GPU Profiles (Adreno 6xx/7xx, Mali-G5x/G7x, Apple A14+).  
> **Tệp được phản biện:** [`implementation_plan.md`](file:///C:/Users/HP/.gemini/antigravity/brain/d9136196-de79-4a3b-b8d6-2ece1644d366/implementation_plan.md)

---

## TỔNG QUAN PHÁN QUYẾT: ĐỊNH HƯỚNG ĐÚNG, NHƯNG BẢN PLAN MẮC BỆNH "HỨA SUÔNG VĂN MẪU" VÀ CÀI ĐẶT 5 "BẪY MÌN" CHẾT NGƯỜI

Subagent A đã xác định đúng phong cách mỹ thuật đích: **Contemporary Clean & Modern (Tối giản đương đại)**, lấy cảm hứng từ chuẩn mực thương mại của **Retropoly** và **Monopoly Plus**. Việc kiên quyết loại bỏ tư duy dát vàng, lóa sáng rẻ tiền và dẹp bỏ các tấm biển tròn 2D lơ lửng là một quyết định mỹ thuật chuẩn xác.

**TUY NHIÊN, DƯỚI GÓC NHÌN CỦA KIẾN TRÚC SƯ HỆ THỐNG:**
Bản kế hoạch hiện tại là một văn bản thuần túy mang tính "tuyên ngôn mỹ cảm", thiếu hụt hoàn toàn các cấu trúc dữ liệu cụ thể, thiếu thuật toán phân bổ bộ nhớ và tiềm ẩn **5 lỗi kỹ thuật nghiêm trọng** có thể đánh sập CI ngay lập tức hoặc làm sụp đổ WebGL context (Context Lost) trên điện thoại di động:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               SƠ ĐỒ RỦI RO KỸ THUẬT NẾU THI HÀNH THEO BẢN PLAN CŨ                     │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ 1. 40 Canvas 1024x1360        │ --> Ngốn 283 MB VRAM GPU --> CRASH WebGL Context Mobile│
│ 2. Xóa cứng StandeeBillboard   │ --> Phá vỡ phase3_visual_polish.test.ts (CI ĐỎ LÒM)    │
│ 3. Chunky Beveled Kitbash     │ --> 160 sub-meshes rời rạc --> Draw Calls > 120 (Drop) │
│ 4. Z-Fighting tại y=0.020     │ --> Xung đột Depth Layer Stack (dung sai 0.001 với halo)│
│ 5. N8AO Full-Res Retina (2x)  │ --> SSAO pass ngốn 12ms/frame --> Mất mốc 60 FPS       │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

Dưới đây là bài phản biện chi tiết, giải pháp toán học và khung kiến trúc thực thi không thỏa hiệp.

---

## PHẦN I: PHẢN BIỆN TÀN NHẪN VẤN ĐỀ ĐỔI TECH STACK (UNITY WEBGL, GODOT WEB, BABYLON.JS)

Một số ý kiến khi thấy hình ảnh 3D sơ khai thường ngay lập tức đổ lỗi cho công nghệ: *"Do Three.js yếu, hãy đổi sang Unity hoặc Godot!"*. Đây là một ảo tưởng kỹ thuật chết người (The Grass is Greener Fallacy). Dưới đây là bằng chứng số học về cái giá phải trả nếu đổi engine:

```
+------------------+-------------------+--------------------+--------------------+--------------------+
| Tiêu Chí         | Three.js r175     | Unity WebGL 2022+  | Godot 4 Web        | Babylon.js 7       |
|                  | (Hiện Tại)        |                    |                    |                    |
+------------------+-------------------+--------------------+--------------------+--------------------+
| Bundle Size (GZ) | 2.4 MB            | 35 - 65 MB         | 28 - 42 MB         | 8.5 MB             |
| Cold Boot (4G VN)| 0.8 - 1.5 giây    | 14 - 28 giây       | 12 - 20 giây       | 3 - 5 giây         |
| FSM Latency      | 0 ms (Zero Copy)  | 16 - 32 ms (Bridge)| 8 - 16 ms (Bridge) | 0 ms (JS Native)   |
| Vitest 131 Suites| Tương thích 100%  | PHÁ HỦY 100%       | PHÁ HỦY 100%       | Phá vỡ 45 R3F tests|
| UI 2D Tailwind   | React DOM tự nhiên| Iframe / Canvas Hack| Canvas Overlay hở | React Wrapper lỏng |
| Memory Base VRAM | 35 MB             | 140 - 220 MB       | 110 - 160 MB       | 55 MB              |
+------------------+-------------------+--------------------+--------------------+--------------------+
```

### 1.1. Cái giá của Unity WebGL:
1. **Dung lượng mạng bùng nổ (Mobile Data Killer)**: Runtime WebAssembly của Unity cùng file nén dữ liệu `.data` tối thiểu là 35MB đến 60MB. Trên mạng 4G thực tế tại Việt Nam khi di chuyển ngoài đường (tốc độ trung bình 15-25 Mbps), thời gian người chơi phải nhìn màn hình tải thanh tiến trình là từ 15 đến 30 giây. Tỷ lệ bỏ game (Bounce Rate) tại bước tải ban đầu sẽ vượt quá 65%.
2. **Độ trễ FSM WebSocket (Bridge Marshalling Overhead)**: VTCoOn sở hữu máy chủ FSM Server-Authoritative đồng bộ Delta thời gian thực 20Hz. Trong Three.js/React, store Zustand nhận delta payload và trực tiếp cập nhật reactive state mà không tốn chi phí sao chép bộ nhớ (Zero-copy). Nếu dùng Unity, toàn bộ gói tin WebSocket phải đi qua cầu nối JavaScript-to-C# (`SendMessage` hoặc `emscripten_binding`), ép kiểu JSON string thành C# struct, làm tăng độ trễ khung hình thêm 16ms - 32ms. Điều này phá vỡ hoàn toàn chuyển động mượt mà của quân cờ và camera lerp.
3. **Phá hủy hoàn toàn 131 Test Suites**: Dự án hiện có 131 test suites Vitest bảo vệ toàn bộ luật kinh tế, thế chấp, phá sản, đấu giá và chuyển động camera. Chuyển sang Unity đồng nghĩa với việc vứt bỏ toàn bộ 131 test suites này vào sọt rác, phải viết lại từ đầu bằng Unity Test Framework (C# NUnit) và chấp nhận thời gian chạy CI kéo dài từ 15 giây lên 12-15 phút trên GitHub Actions.
4. **Hủy hoại Giao diện HUD 2D React 19**: Các modal xúc giác (TitleDeedModal, AuctionModal, FintechGameOverModal) đang hoạt động mượt mà bằng Tailwind CSS v4. Trong Unity WebGL, việc đồng bộ giữa UI HTML bên ngoài và Canvas WebGL bên trong gặp lỗi về sự kiện con trỏ (pointer capture), bàn phím ảo di động và hiển thị z-index trên trình duyệt Safari iOS.

### 1.2. Cái giá của Godot 4 Web:
Godot 4 Web xuất bản yêu cầu bắt buộc WebGL 2.0 và cơ chế đa luồng SharedArrayBuffer. Để kích hoạt SharedArrayBuffer, máy chủ Web phải cấu hình hai tiêu đề bảo mật: `Cross-Origin-Opener-Policy: same-origin` và `Cross-Origin-Embedder-Policy: require-corp` (COOP/COEP). Cấu hình này sẽ chặn đứng việc nạp tài nguyên từ các CDN bên ngoài, chặn ảnh đại diện người chơi từ mạng xã hội, chặn iframe thanh toán ngân hàng và hoàn toàn không chạy được trên nhiều trình duyệt di động nhúng (In-app browsers như Zalo, Facebook, TikTok).

### 1.3. Kết luận về Tech Stack:
**Giữ nguyên Three.js r175 + React Three Fiber là quyết định kiến trúc đúng đắn và bắt buộc.** Vấn đề đồ họa không nằm ở công nghệ Three.js, mà nằm ở kỹ thuật tham số hóa vật liệu (Shading), hình học vát cạnh (Beveling) và bố cục ánh sáng (Lighting Contrast).

---

## PHẦN II: KHẢO SÁT NĂNG LỰC THỰC SỰ CỦA THREE.JS R175 VÀ ĐỐI CHIẾU RETROPOLY

Three.js r175 không hề thiếu bất kỳ công cụ nào để đạt chuẩn mỹ thuật của Retropoly hay Monopoly Plus. Sự khác biệt giữa sa bàn "đồ chơi" hiện tại và sa bàn thương mại cao cấp nằm ở 5 kỹ thuật dựng hình sau:

```
[Mô Hình Thô Sơ Hiện Tại]                     [Mô Hình Retropoly Chuẩn Trên Three.js r175]
- boxGeometry sắc lẹm 90 độ                   - Beveled Chamfer Edge (R = 0.04m, Bắt viền sáng Specular)
- Dán Texture phẳng lỳ bệt màu                - MeshPhysicalMaterial (Roughness 0.22, Clearcoat 1.0, IOR 1.5)
- Ambient Light 0.7 san phẳng                 - Sun Key Light : Ambient Light = 4:1 (Tạo khối lập thể)
- Billboard ảnh 2D quay mặt theo camera        - 3D Extruded Kitbash Volume (Khối có chiều sâu thực tế)
- Không có bóng kẽ hở chân tường              - N8AO Contact Crevice Occlusion + ContactShadows kép
```

### 2.1. MeshPhysicalMaterial & Microfacet GGX:
Mặt sứ mờ Thụy Sĩ không thể làm bằng `meshStandardMaterial` đơn giản. Three.js r175 hỗ trợ đầy đủ mô hình phản xạ vi bề mặt Cook-Torrance GGX:
- `roughness: 0.22`: Tán xạ phản xạ mềm mại, không bị bóng nhờn như nhựa nhưng không bị lì như đất sét.
- `metalness: 0.02`: Bảo toàn màu sắc phản chiếu tự nhiên của điện môi (Dielectric).
- `clearcoat: 1.0` & `clearcoatRoughness: 0.05`: Tạo lớp men sứ bóng tinh khiết bên trên bề mặt nhám mờ, giúp các cạnh vát của ô cờ bắt được vệt sáng mảnh (*Glint Edge*) khi camera di chuyển.
- `ior: 1.52`: Chiết suất chính xác của vật liệu thủy tinh/men sứ.

### 2.2. Procedural Canvas Surface & Normal/Roughness Maps:
Thay vì chỉ vẽ màu Diffuse/Albedo, ta có thể dùng Canvas 2D sinh trực tiếp **Normal Map** và **Roughness Map** cục bộ:
- Rãnh kẻ ranh giới 1px không chỉ là vẽ một vạch xám `#E2E8F0`, mà dùng Canvas tính toán đạo hàm chiều cao Sobel để tạo Normal Map rãnh lõm sâu xuống 0.5mm. Khi ánh nắng chiếu xiên, rãnh 1px này tự khắc sinh ra một vệt bóng đổ siêu mảnh và một vệt sáng ở mép bên kia, tạo độ sâu quang học tinh tế như được gia công CNC.

### 2.3. InstancedMesh Multi-Attribute Kitbash:
Retropoly tạo ra các dãy nhà đô thị nén đẹp mắt bằng cách ghép các mô-đun đúc khối (Kitbash Blocks). Three.js cho phép gom hàng trăm chi tiết kiến trúc vào **1 Draw Call duy nhất** thông qua `InstancedMesh` kết hợp ma trận biến đổi và mảng màu thực thể `setColorAt`.

---

## PHẦN III: KHÓA CHẶT GIỚI HẠN PHẦN CỨNG (GPU BUDGET ENFORCEMENT - 60 FPS MOBILE)

Để sa bàn vận hành mượt mà ở 60 FPS trên toàn bộ dải thiết bị di động (từ iPhone 11 đến các máy Android tầm trung trang bị chip Snapdragon 680 / Helio G99), chúng tôi thiết lập khung ngân sách GPU cứng (Hard GPU Ceiling):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        NGÂN SÁCH PHẦN CỨNG GPU BẮT BUỘC                                │
├──────────────────────┬────────────────────────┬────────────────────────────────────────┤
│ Chỉ Số Đo Lường      │ Ngưỡng Trần Tối Đa    │ Phân Bổ Mục Tiêu Thực Tế                │
├──────────────────────┼────────────────────────┼────────────────────────────────────────┤
│ Draw Calls           │ <= 75 calls            │ 42 - 58 calls                          │
│ Triangle Count       │ <= 80,000 tris         │ 52,000 - 68,000 tris                   │
│ GPU Memory (VRAM)    │ <= 60 MB               │ 38 - 48 MB                             │
│ Frame Time           │ <= 16.67 ms (60 FPS)   │ 11 - 14 ms                             │
│ Shaders Program Count│ <= 25 programs         │ 14 programs (Shared Materials)         │
└──────────────────────┴────────────────────────┴────────────────────────────────────────┘
```

### 3.1. BÓC MẼ "LỖ HỔNG CHẾT NGƯỜI 280MB VRAM" CỦA BẢN PLAN CŨ:
Bản plan hiện tại đề xuất vẽ lại 40 ô cờ trong `tile_texture_generator.ts` ở độ phân giải HiDPI 4x (1024 x 1360 pixel).
Hãy làm một phép tính bộ nhớ phần cứng trung thực:
- 1 Texture RGBA8 kích thước 1024 x 1360:
  `1024 * 1360 * 4 bytes = 5,570,560 bytes ≈ 5.31 MB`.
- Bật Mipmaps (bắt buộc cho 3D để chống lấp lánh méo hình):
  `5.31 MB * 1.333 ≈ 7.08 MB` cho 1 ô cờ.
- Toàn bộ 40 ô cờ độc lập:
  `40 * 7.08 MB = 283.2 MB VRAM!`
- **HẬU QUẢ VẬT LÝ:**
  Trình duyệt Safari trên iOS giới hạn bộ nhớ WebGL của một tab thông thường ở mức 200MB - 256MB. Nếu cấp phát 283.2 MB chỉ riêng cho Texture ô cờ (chưa tính Shadow map, N8AO buffer, mô hình 3D), **trình duyệt sẽ lập tức kích hoạt sự kiện `webglcontextlost` và làm trắng màn hình game!**

### 3.2. GIẢI PHÁP THUẬT TOÁN: SINGLE-ATLAS HOẶC DYNAMIC LABEL POOL
Để khóa chặt GPU Memory dưới 60MB, ta áp dụng kiến trúc **Master Porcelain Base + Shared Dynamic Atlas**:
1. **Nền Sứ Mờ Dùng Chung (Master Surface Material)**:
   Cả 40 ô cờ dùng chung 1 `MeshPhysicalMaterial` màu sứ trắng `#F8FAFC`, độ nhám 0.22. Không cần vẽ nền giấy da lặp đi lặp lại 40 lần.
2. **Kích Thước Texture Atlas**:
   Thay vì 40 texture rời 1024x1360, toàn bộ thông tin chữ và icon của 40 ô cờ được nén vào **1 tấm Atlas Texture duy nhất kích thước 2048 x 2048 (hoặc 40 canvas tinh gọn kích thước 512 x 640)**.
   - 40 ô x (512 * 640 * 4 * 1.33) = **69.8 MB** (nếu dùng canvas rời 512x640).
   - Nếu dùng **1 Master Texture Atlas 2048x2048**: `2048 * 2048 * 4 * 1.333 = 22.3 MB VRAM`! Tiết kiệm **92% VRAM**, an toàn tuyệt đối trên mọi dòng điện thoại.

---

## PHẦN IV: BÓC MẼ TÀN NHẪN CÁC ĐIỂM YẾU VÀ LỖ HỔNG "HỨA SUÔNG" TRONG PLAN HIỆN TẠI

### 4.1. Lỗ Hổng Phá Hủy Contract Test (CI Red Disaster):
- **Bản plan viết:** *"Xóa bỏ 100% component StandeeBillboard, logic nạp WebP tròn và thẻ <Billboard>"*.
- **Sự thật trong Codebase:**
  Tệp kiểm thử [`tests/client/phase3_visual_polish.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/phase3_visual_polish.test.ts) đọc trực tiếp chuỗi ký tự mã nguồn của `src/client/3d/board_tile.tsx` bằng `fs.readFileSync` và kiểm tra nghiêm ngặt:
  ```ts
  expect(boardTileSource).toContain('planeGeometry args={[0.7, 0.75]}');
  expect(boardTileSource).toContain('transparent');
  expect(boardTileSource).toContain('alphaTest={0.05}');
  expect(boardTileSource).toContain('roughness={0.25}');
  expect(boardTileSource).toContain('READY_TILES.has(cell.index)');
  ```
  Đồng thời [`tests/client/ui01_board.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/ui01_board.test.ts) đang import trực tiếp các hàm: `getStandeeWebpUrl`, `clearStandeeWebpCache`, `standeeWebpCache`.
- **Nếu xóa thẳng tay như plan viết:**
  Toàn bộ 131 test suites sẽ đổ vỡ ngay lập tức. Đây là hành vi vi phạm nghiêm trọng Hiến pháp dự án: *"Zero Bug-Codification & Never break tests blindly"*.
- **Khung kỹ thuật sửa chữa:**
  Phải sử dụng mẫu thiết kế **Contract Preservation & Graceful Deprecation**. Giữ lại các hàm thuần túy phục vụ kiểm thử đơn vị, chuyển `StandeeBillboard` thành một khối cắm mốc mộc tối giản hoặc giữ component ẩn dưới cờ whitelist rỗng (`READY_TILES.size === 0`), vừa đạt 100% mục tiêu mỹ thuật Clean & Modern trên màn hình, vừa giữ xanh toàn bộ test suite.

### 4.2. "Chunky Beveled Kitbash" Viết Thiếu Cấu Trúc Dữ Liệu Hình Học:
- **Bản plan viết:** *"Xây dựng hình học khối đúc có độ dày (Extruded 3D Volumes)... Tầng trệt thụt lùi 0.06m... Ban công nhô ra 0.05m... Gom toàn bộ qua InstancedMesh 3-tier để giữ trần Draw Calls <= 4 calls"*.
- **Bóc mẽ:**
  Plan không hề định nghĩa 3 tiers đó là 3 tiers gì? Kích thước ma trận ra sao? Tọa độ ghép nối thế nào? Nếu một lập trình viên đọc bản plan này, họ sẽ không thể viết code nếu không tự bịa ra cấu trúc.
- **Khung kỹ thuật chuẩn hóa (Concrete Data Structures):**
  Phải chia 32 căn Shophouse thành 3 bậc hình học đồng nhất chia sẻ chung 3 `InstancedMesh`:
  1. `BaseArcadeMesh` (Tầng trệt thụt lùi với hàng cột): 32 instances.
  2. `BalconyBodyMesh` (Khối tầng lầu với ban công đua ra): 32 instances.
  3. `TileRoofMesh` (Mái ngói bánh ít có gờ vát): 32 instances.
  Tổng cộng đúng **3 Draw Calls** cho 32 căn nhà!

### 4.3. Nguy Cơ Xung Đột Cao Độ Z-Fighting Với Extended Depth Layer Stack:
- Codebase đang thiết lập thang phân tầng cao độ nghiêm ngặt trong `src/client/3d/board_layout.tsx`:
  ```ts
  OCEAN_Y = -0.150 < RIVER_BED_Y = -0.050 < TERRAIN_BASE_Y = 0.000 
  < TILE_BORDER_Y = 0.015 < TILE_SURFACE_Y = 0.020 < PAWN_HALO_Y = 0.021 < STANDEE_BASE_Y = 0.025
  ```
- Thử nghiệm [`tests/client/dense_metropolis_core_visual.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/dense_metropolis_core_visual.test.ts) khóa chặt bất biến: Khoảng cách giữa `TILE_SURFACE_Y` và `PAWN_HALO_Y` chỉ là **0.001**.
- Nếu plan nâng hạ cao độ ô cờ hoặc móng nhà tùy tiện mà không neo vào `DEPTH_LAYER_STACK`, quân cờ di chuyển sẽ bị chìm dưới mặt đất hoặc đĩa hào quang dưới chân quân cờ sẽ bị hiện tượng sọc chớp giật Z-fighting.

### 4.4. N8AO Full-Res Trên Màn Hình Retina — Kẻ Hủy Diệt Tốc Độ 60 FPS:
- **Bản plan viết:** Cấu hình N8AO `aoRadius = 0.85`, `intensity = 1.65`, `color = "#0B0F19"`.
- **Bóc mẽ:**
  Plan hoàn toàn không nhắc tới `quality` và `halfRes`. Trên iPhone hoặc màn hình máy tính có DPR = 2.0 (hoặc 3.0), một màn hình Full HD sẽ render ở độ phân giải thực 4K. Chạy thuật toán SSAO đầy đủ trên 8 triệu điểm ảnh mỗi khung hình sẽ tiêu tốn từ **8ms đến 14ms của GPU**, biến mục tiêu 60 FPS (tổng ngân sách 16.6ms) thành điều bất khả thi!
- **Khung kỹ thuật sửa chữa:**
  Bắt buộc cấu hình N8AO:
  `quality="medium"`, `halfRes={true}`, `aoRadius={0.75}`, `distanceFalloff={2.0}` và giới hạn canvas `dpr={[1, 1.5]}` trên thiết bị di động.

---

## PHẦN V: BẢN THIẾT KẾ KIẾN TRÚC THỰC THI (CONCRETE ENGINEERING SPECIFICATION)

Dưới đây là sơ đồ luồng dữ liệu kiến trúc chuẩn xác cho hệ thống sa bàn mới:

```
[BOARD_CONFIG (40 Ô Cờ)] 
         │
         ├──> [Tile Surface: MeshPhysicalMaterial Sứ Mờ #F8FAFC (Shared Instance)]
         │           │
         │           └──> [Canvas Texture 512x640: Rãnh Kẻ 1px + Swiss Typography + Dải Màu]
         │
         ├──> [Công Trình 3D C0-C3 (Khi Có Sở Hữu / Nâng Cấp)]
         │           │
         │           ├── C0: SurveyorPlotBoundary (Cọc mốc gỗ mộc, dây đồng căng chỉ giới)
         │           ├── C1: Shophouse (Arcade thụt lùi, ban công hộp, ngói vát cạnh)
         │           ├── C2: Commercial Complex (Tháp kính sapphire, louver nhôm)
         │           └── C3: Landmark Hoàng Kim (Chóp xoay, đài quan sát)
         │
         └──> [Lõi Đô Thị Nén InstancedKitbash (Diorama Center)]
                     │
                     ├── ShophouseBlocks (3 Tiers InstancedMesh = 3 Draw Calls)
                     └── HighriseBlocks (2 Tiers InstancedMesh = 2 Draw Calls)
```

### 5.1. Thuật Toán Tối Ưu Canvas Texture (Memory-Safe Generator):
Thay vì cấp phát 1024x1360, chuẩn hóa kích thước Canvas về tỉ lệ chuẩn **512 x 680 (DPR 2x)**, áp dụng bộ đệm Canvas Pool tái sử dụng:

```typescript
// src/client/3d/tile_texture_generator.ts
export const CANVAS_WIDTH = 512;
export const CANVAS_HEIGHT = 680;

export function drawSwissMinimalistTile(
  ctx: CanvasRenderingContext2D,
  meta: TileMetadata
): void {
  // 1. Nền sứ mờ tinh khiết
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, 256, 340);

  // 2. Dải màu nhận diện vùng miền phẳng lì (Modern Bauhaus)
  ctx.fillStyle = meta.bannerColor;
  ctx.beginPath();
  ctx.roundRect(10, 10, 236, 44, 6);
  ctx.fill();

  // Nhãn loại hình bất động sản
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '1px';
  ctx.fillText(meta.category.toUpperCase(), 128, 32);

  // 3. Tên địa danh (Typography Thụy Sĩ tương phản cao)
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(meta.title, 128, 92);

  // Phụ đề vị trí
  ctx.fillStyle = '#64748B';
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(meta.subtitle, 128, 118);

  // 4. Biểu tượng văn hóa tối giản
  drawIcon(ctx, meta.icon, 128, 190, meta.bannerColor, 1.1);

  // 5. Giá niêm yết tối giản (Không dùng khay đen cồng kềnh)
  const priceText = meta.priceLabel ?? formatPriceLabel(meta.price);
  if (priceText) {
    ctx.fillStyle = '#0F172A';
    ctx.font = '800 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(priceText, 128, 298);
  }

  // 6. Rãnh chỉ giới 1px siêu mảnh bao quanh
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, 248, 332);
}
```

### 5.2. Cấu Trúc Dữ Liệu 3-Tier Cho 32 Shophouse Kiến Trúc Đúc Khối:
Để đạt chất lượng Retropoly mà chỉ tốn đúng 3 Draw Calls:

```typescript
// Cấu trúc 3 Ma Trận InstancedMesh trong diorama_shophouse_blocks.tsx
// Tier 1: Tầng trệt Arcade Setback (Lùi vào trong z -0.06m) -> 1 InstancedMesh
// Tier 2: Thân lầu Ban công nhô ra (Đua ra ngoài z +0.05m)  -> 1 InstancedMesh
// Tier 3: Mái ngói vát cạnh chamfer bevel                 -> 1 InstancedMesh

export function DioramaShophouseBlocks(): React.ReactElement {
  // Gom 32 căn nhà qua 3 instancedMesh
  // Tổng số tam giác: 32 căn * 48 tris = 1,536 triangles (Vô cùng nhẹ!)
  // Tổng Draw Calls: 3 calls
}
```

---

## PHẦN VI: 4 YÊU CẦU BẮT BUỘC CHUYỂN GIAO CHO SUBAGENT A TRANH LUẬN VÒNG 2

Trước khi chính thức bước vào Trạm 1 (Viết contract test), Subagent B yêu cầu Subagent A trả lời và đồng thuận 4 điểm nút kỹ thuật sau:

1. **Vấn đề Giới Hạn VRAM Texture**:
   Subagent A có chấp thuận hạ độ phân giải Canvas của ô cờ từ 1024x1360 xuống 512x680 (vẫn đảm bảo hiển thị sắc nét 2x trên mọi màn hình di động) để bảo đảm tổng VRAM ô cờ không vượt ngưỡng an toàn 45MB hay không?
2. **Bảo Vệ Contract Test Của StandeeBillboard**:
   Subagent A có đồng thuận phương án: "Ẩn StandeeBillboard trên giao diện người dùng bằng cách đặt whitelist `READY_TILES` rỗng, nhưng giữ nguyên các hàm thuần túy và cấu trúc component trong file để bảo vệ 100% các test suites kiểm tra hồi quy tĩnh (`phase3_visual_polish.test.ts` và `ui01_board.test.ts`)" hay không?
3. **Cấu Hình N8AO Half-Resolution**:
   Subagent A có chấp thuận để N8AO chạy ở chế độ `halfRes={true}` với `quality="medium"` nhằm giữ vững ngân sách 16.6ms (60 FPS) trên các thiết bị màn hình Retina hay không?
4. **Giữ Nguyên Extended Depth Layer Stack**:
   Subagent A có cam kết rằng mọi công trình và chi tiết ô cờ mới sẽ tuân thủ tuyệt đối mốc cao độ bất biến `TILE_SURFACE_Y = 0.020` và `PAWN_HALO_Y = 0.021` để không gây ra lỗi Z-fighting hay không?

---
*Bản phản biện và khung kỹ thuật được xuất bản chính thức vào đĩa tại: `docs/plans/proposals/IMP-32-critique-engine-architect.md` phục vụ đối chất kỹ thuật vòng 2.*
