# IMP-32: BẢN ĐỀ XUẤT ĐẠI TU TOÀN DIỆN SA BÀN 3D - BƯỚC NHẢY VỌT THƯƠNG MẠI
## (SENIOR 3D ART & TECH DIRECTOR PROPOSAL: CLEAN & MODERN TACTILE DIORAMA)

> **Tác giả:** Subagent A — Giám đốc Nghệ thuật & Kỹ thuật 3D (Senior 3D Art & Tech Director)  
> **Mã định danh:** IMP-32-PROPOSAL-ART-DIRECTOR  
> **Căn cứ pháp lý:** Hiến pháp dự án [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md), ADR-0002, ADR-0005.  
> **Mục tiêu tối thượng:** Thiết lập bước nhảy vọt thương mại tiệm cận **Monopoly Plus** (Ubisoft/Asobo) và **Retropoly** (RetroStyle Games), định hình ngôn ngữ **Clean & Modern Tactile Diorama** (Tối giản, tinh khiết, sắc sảo, xúc giác kiến trúc; cấm tuyệt đối màu mè, dát vàng, neon rẻ tiền).

---

## I. TẠI SAO BẢN KẾ HOẠCH HIỆN TẠI BỊ TỪ CHỐI TIN TƯỞNG?

Bản kế hoạch tại `implementation_plan.md` chưa tạo được sự tin tưởng từ người dùng vì mắc phải **3 căn bệnh chí tử** trong tư duy phát triển đồ họa 3D:

### 1. Bệnh "Chắp vá vi mô trên nền Programmer-Art" (The Timidity Trap)
- Kế hoạch cũ chỉ quanh quẩn ở các chỉnh sửa bề mặt mang tính thủ thuật: thay đổi vài mã màu hex (`#F8FAFC` thay vì `#090D1A`), xóa component `StandeeBillboard`, tăng thông số `N8AO` từ 1.25 lên 1.65, và thêm một gờ hộp thụt lùi 0.06m vào component `DioramaShophouseBlocks`.
- Bản chất nền tảng bên dưới vẫn giữ nguyên **lối dựng hình sơ khai (Primitive Programmer-Art)**:
  - Bàn cờ vẫn là 40 tấm phẳng `planeGeometry` dán Canvas 2D rời rạc lơ lửng trên hai khối cỏ hộp vuông vức `<boxGeometry args={[6.5, 0.01, 15.2]} />` với màu xanh lá cây chói `#22C55E`.
  - 32 Shophouse vẫn là các khối lập phương `boxGeometry` màu vàng bơ nhợt nhạt `#FEF08A` đội nón tam giác `coneGeometry` màu đỏ cam `#EA580C`.
  - 16 Tòa cao ốc vẫn là các cột hộp thẳng đuột kéo dài `boxGeometry` màu xanh `#0284C7`.
- **Hệ quả:** Dù có tăng sáng, đổi màu hay đổi chữ, góc nhìn 3D vẫn bộc lộ sự thô ráp, giả tạo, không thể đánh lừa được mắt nhìn của người dùng về một sản phẩm thương mại cao cấp.

### 2. Bệnh "Lệ thuộc vào In hóa đơn 2D Canvas" (Flat Receipt Stamping)
- Toàn bộ 40 ô cờ hiện tại đang được kết xuất qua `tile_texture_generator.ts` bằng các lệnh vẽ 2D Canvas (`fillRect`, `roundRect`, `strokeRect`, `fillText`).
- Bố cục của ô cờ bị đóng khung theo tư duy "in vé tàu/hóa đơn": một dải màu ở trên, chữ ở giữa, và một cái khay đen bo tròn chứa giá tiền ở đáy.
- Khi dán tấm Canvas Texture 2D này lên bàn cờ 3D, dưới góc nghiêng camera 38 độ, mắt người lập tức phát hiện bề mặt phẳng lỳ không có chiều sâu quang học, không có sự tương tác giữa ánh sáng mặt trời và các đường gân chữ/khay rãnh.

### 3. Đâu là bản chất tạo nên sự "vượt bậc" của Monopoly Plus và Retropoly?
| Tiêu chí | VTCoOn Hiện Tại (Kế hoạch cũ) | Retropoly & Monopoly Plus (Chuẩn Thương Mại) |
| :--- | :--- | :--- |
| **Cấu trúc Bàn cờ** | Các ô rời rạc đặt trên 2 hộp phẳng màu xanh. | **Bệ đúc nguyên khối (Solid Monolithic Chassis)** với rãnh khay chìm (Recessed Wells) gia công tinh xảo. |
| **Bề mặt Ô cờ** | Canvas 2D in phẳng, viền xám giả tạo 2D. | **Vật liệu đá sứ/acrylic khảm khối**, có viền sáng Specular Edge mềm mại ở ranh giới. |
| **Xúc giác (Tactility)** | Hình học sắc cạnh 90 độ, thiếu vát bo (Bevel). | **Độ bo viền vật lý (Curvature Bevel)** bắt sáng viền cạnh kim loại/nhựa cao cấp như đồ chơi cầm tay thật. |
| **Kiến trúc Đô thị** | Hộp trần trụi (`boxGeometry` + `coneGeometry`). | **Kiến trúc đúc khối (Solid Massing)** có ban công, hốc cửa, lam che nắng, độ tương phản ánh sáng chuẩn. |
| **Thủy văn & Thiên nhiên**| Mặt nước phẳng đơn sắc, sóng đều nhân tạo. | **Nước nhìn thấu đáy (Refractive Depth)**, có dải cát ẩm chuyển màu (Wet Sand), bọt sóng ven bờ. |
| **Thẩm mỹ Chiếu sáng** | Lạm dụng Bloom lóa mắt, dát vàng lòe loẹt. | **Nắng xiên tự nhiên (Architectural Key Sunlight)**, bóng hốc sâu sắc nét, không chói lóa. |

---

## II. ĐÁNH GIÁ TECH STACK: CÓ CẦN ĐỔI ENGINE KHÔNG?

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          MA TRẬN ĐÁNH GIÁ CÔNG NGHỆ ENGINE 3D                          │
├───────────────────┬──────────────┬──────────────┬──────────────────────────────────────┤
│ Engine            │ Ưu Điểm      │ Nhược Điểm   │ Phán Quyết Kỹ Thuật                  │
├───────────────────┼──────────────┼──────────────┼──────────────────────────────────────┤
│ **Babylon.js**    │ Node Material│ Kích thước   │ **LOẠI BỎ**. Phá hủy toàn bộ 131 test│
│                   │ Editor mạnh, │ bundle lớn   │ suites, R3F ecosystem, WebSocket DTO │
│                   │ PBR vật lý   │ (~1.4MB+),   │ và thời gian tải trang 4G VN; hiệu   │
│                   │ chuyên sâu.  │ tách rời R3F.│ năng không vượt trội so với r175.    │
├───────────────────┼──────────────┼──────────────┼──────────────────────────────────────┤
│ **PlayCanvas**    │ Tốc độ WebGL │ Quy trình    │ **LOẠI BỎ**. Khó nhúng sâu vào React │
│                   │ cực nhanh,   │ Editor ngoài,│ 19, không phù hợp kiến trúc headless │
│                   │ nhẹ máy.     │ ràng buộc    │ testing và CI/CD tự động hiện tại.   │
│                   │              │ nền tảng.    │                                      │
├───────────────────┼──────────────┼──────────────┼──────────────────────────────────────┤
│ **Three.js r175** │ Native React,│ Cần trình độ │ **LỰA CHỌN TỐI THƯỢNG**. Sử dụng     │
│ **+ R3F 9.1**     │ 2.5MB bundle,│ Shader & PBR │ `MeshPhysicalMaterial` sâu kết hợp   │
│                   │ 131 tests pass│ cao để vượt  │ Screen-space Curvature Shading để    │
│                   │ bảo toàn.    │ bẫy "hộp".   │ đạt đẳng cấp AAA mà giữ vững 60 FPS. │
└───────────────────┴──────────────┴──────────────┴──────────────────────────────────────┘
```

### Kết luận Tech Stack:
- **Không đổi engine**, vì vấn đề của VTCoOn là **trình độ tạo hình và cấu hình Shader**, không phải giới hạn của engine Three.js.
- Three.js r175 có đầy đủ khả năng render PBR đỉnh cao thông qua:
  1. `MeshPhysicalMaterial` với các thuộc tính quang học: `clearcoat`, `clearcoatRoughness`, `roughness`, `metalness`, `transmission`, `ior`, `sheen`.
  2. `ACESFilmicToneMapping` hoặc `AgX ToneMapping` để kiểm soát dải tương phản cao, triệt tiêu hiện tượng cháy sáng.
  3. Tùy biến Shader Chunks qua `onBeforeCompile` để đưa thuật toán **Screen-Space Normal Edge Bevel (Curvature Shading)** vào mọi bề mặt kiến trúc, tạo vệt sáng viền cạnh đắt giá mà không làm tăng số lượng đa giác (Polygon Count).

---

## III. 5 ĐỘT PHÁ CỐT LÕI TÁI SINH SA BÀN VTCOON (THE 5 QUANTUM LEAPS)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     5 TRỤ CỘT ĐỘT PHÁ NGHỆ THUẬT & KỸ THUẬT 3D                         │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ 1. BỆ BÀN CỜ NGUYÊN KHỐI │ 2. RÃNH KHAY CHÌM (WELLS)│ 3. PBR ĐÁ SỨ & CURVATURE SHADING │
│ • Khung Plinth vát 45 độ │ • Rãnh âm CNC 0.035m     │ • MeshPhysicalMaterial gốm sứ    │
│ • Nhựa đúc sa bàn cao cấp│ • 40 Ô cờ khảm vừa khít  │ • Viền sáng cạnh sắc nét 1px     │
│ • Liền mạch 1 khối duy nhất • Bóng đổ rãnh tự nhiên  │ • AgX ToneMapping trong trẻo     │
├──────────────────────────┴──────────────────────────┴──────────────────────────────────┤
│ 4. 40 Ô CỜ TỐI GIẢN BẮC ÂU (Swiss Typo dập chìm, Thẻ 3D vật lý, Khối kính thanh tra)    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. ĐÔ THỊ SA BÀN SỐNG CẢM ỨNG (Cây bọt biển kiến trúc, Xe đồ chơi Scandinavian, Sông sâu)│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### ĐỘT PHÁ 1: KIẾN TRÚC BÀN CỜ ĐÚC NGUYÊN KHỐI (SOLID MONOLITHIC PLINTH)
*Khai tử hoàn toàn hai hộp màu xanh cỏ trần trụi và mặt bàn phẳng chắp vá.*

1. **Khung Plinth Đúc Liền Khối (The Monolithic Board Chassis)**:
   - Toàn bộ nền bàn cờ được đúc thành một khối điêu khắc duy nhất kích thước `23.8m x 23.8m`, dày `0.45m`, chân bệ vát góc 45 độ tạo cảm giác một khối sa bàn kiến trúc trưng bày trong bảo tàng.
   - Vật liệu: Nhựa đúc mô hình cao cấp (Cast Architectural Resin) màu Trắng Xương Mờ (`#F1F5F9`, roughness: 0.28, clearcoat: 0.35, clearcoatRoughness: 0.15).
   - Dưới chân bệ có rãnh âm thụt lùi (Shadow Gap) 0.04m để tạo vệt bóng đổ tự nhiên trên mặt nền đại dương, làm cho toàn bộ sa bàn như đang nổi nhẹ nhàng trên mặt nước ngọc bích.

```
       Mặt ô cờ sứ khảm chìm (y = 0.020)
       ───────┬─────────┬────────
              │ Rãnh âm │
   ┌──────────┴─────────┴──────────┐
   │  Khung Bàn Cờ Đúc Nguyên Khối  │  Màu Trắng Xương Mờ (#F1F5F9)
   │     (Solid Monolithic Base)   │  Bo cạnh vát mềm 45 độ
   └───┬───────────────────────┬───┘
       │  Rãnh chân âm (0.04m) │  Tạo vệt bóng tiếp xúc với biển
   ════╧═══════════════════════╧════ Mặt nước vịnh biển (y = -0.150)
```

2. **Rãnh Khay Chìm (Recessed Board Wells)**:
   - Thay vì đặt các tấm ô cờ nổi lên trên mặt cỏ như hiện tại, mặt trên của khung nguyên khối được tạo sẵn **40 rãnh khay chìm** sâu `0.035m`.
   - Mỗi ô cờ đóng vai trò như một **viên gạch đá sứ (Ceramic Inlay Tile)** kích thước chuẩn xác, được khảm vừa khít vào từng rãnh.
   - Giữa các ô cờ là khe rãnh vật lý rộng `0.012m`. Ánh sáng mặt trời tự nhiên và N8AO sẽ tạo ra **vệt bóng rãnh thực thụ (True Physical Crevice)** giữa các ô cờ, xóa bỏ vĩnh viễn việc phải vẽ các đường viền xám 2D giả tạo trên canvas!

---

### ĐỘT PHÁ 2: VẬT LIỆU PBR ĐÁ SỨ & CÔNG NGHỆ CURVATURE SHADING
*Xóa bỏ cảm giác đồ nhựa rẻ tiền và khối hộp sắc nhọn.*

1. **Vật liệu Đá Sứ Men Mờ (Satin Glaze Porcelain PBR)**:
   - 40 Viên gạch ô cờ sử dụng `MeshPhysicalMaterial` với thông số quang học chuẩn:
     - `color`: `#F8FAFC` (Trắng sứ tinh khiết)
     - `roughness`: `0.22` (Mịn màng, không phản xạ gương gây rối mắt)
     - `clearcoat`: `0.75` (Lớp men bóng phủ bề mặt)
     - `clearcoatRoughness`: `0.08`
     - `ior`: `1.50` (Chỉ số khúc xạ của gốm sứ cao cấp)
   - Kết quả: Khi camera xoay, bề mặt ô cờ sẽ phản chiếu ánh sáng dịu dàng, sang trọng, mang lại cảm giác xúc giác (tactility) cao cấp như chạm vào những viên gạch men Thụy Sĩ.

2. **Screen-Space Curvature Shading (Vệt Sáng Viền Cạnh Tinh Xảo)**:
   - Trong Three.js, các khối hộp thường có cạnh sắc lẹm 90 độ khiến ánh sáng bị gãy khúc đột ngột.
   - Chúng tôi đề xuất một shader extension nhẹ chèn vào `MeshPhysicalMaterial.onBeforeCompile`:
     - Sử dụng hàm đạo hàm pháp tuyến màn hình: `float curvature = length(fwidth(vNormal));`
     - Hòa trộn một vệt sáng Specular siêu mảnh (1px) tại các gờ cạnh: `gl_FragColor.rgb += vec3(0.18) * smoothstep(0.0, 0.4, curvature);`
   - **Tác dụng thần kỳ:** Mọi góc cạnh của ô cờ, bậc thềm, shophouse và cao ốc đều bắt được một đường viền sáng mảnh dẻ, sắc nét như ánh sáng phản chiếu trên các mô hình đúc kim loại hoặc nhựa resin cao cấp của Retropoly!

---

### ĐỘT PHÁ 3: ĐẠI PHẪU 40 Ô CỜ THEO PHONG CÁCH TỐI GIẢN BẮC ÂU / THỤY SĨ
*Khai tử 100% hình minh họa clipart 2D và khay đen hóa đơn.*

```
┌────────────────────────────────────────────────────────────────────────┐
│           DIỆN MẠO Ô CỜ BẤT ĐỘNG SẢN TỐI GIẢN BẮC ÂU (MỚI)             │
├────────────────────────────────────────────────────────────────────────┤
│ [DẢI MÀU VÙNG] Khối composite đúc dày 0.02m khảm âm đầu ô cờ          │
│                (Bảng màu Nordic Contemporary: Terracotta, Mint, Ochre) │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   BÃI SAU                                (Grotesk Đậm, Dập Chìm 0.5mm) │
│   Vũng Tàu                               (Phụ đề mờ xám đá Slate 500)  │
│                                                                        │
│   [Khoảng thở kiến trúc tinh khiết]     (Không icon clipart 2D)        │
│                                          Chân đế chờ công trình 3D C1-3│
│                                                                        │
│   2.400 Tr.                              (Chữ số thanh mảnh dập nổi)   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **28 Ô Bất Động Sản (Property Tiles)**:
   - **Dải nhận diện màu sắc**: Là một thanh composite nguyên khối dày `0.02m`, hoàn thiện satin matte khảm phẳng vào đầu ô cờ.
   - **Bảng màu Đương đại Bắc Âu (Contemporary Nordic Architectural Palette)**:
     - Nhóm 1 (Bãi Sau / Bến Ninh Kiều): *Nâu Đất Sét Terracotta* (`#9A3412`)
     - Nhóm 2 (Chợ Đầm / Bãi Cháy): *Xanh Bạc Hà Scandinavian Mint* (`#0F766E`)
     - Nhóm 3 (Cố Đô / Chợ Hàn): *Hồng Đất Mộc Muted Rose* (`#9F1239`)
     - Nhóm 4 (Hồ Gươm / Tràng Tiền): *Xanh Thép Nordic Midnight Navy* (`#1E3A5F`)
     - Tất cả các màu đều được giảm bão hòa 15% để đạt độ sang trọng, không chói gắt.
   - **Typography**:
     - Áp dụng triết lý International Typographic Style (Swiss Style): Sử dụng font sans-serif hình học sắc sảo, khoảng cách chữ (tracking) rộng.
     - Tên thành phố và giá tiền được khắc chìm nhẹ (subtle emboss normal map), mang lại cảm giác chữ in dập kim loại trên đá sứ.
     - Xóa bỏ 100% các khay đen thô kệch và icon stock clipart ở giữa ô cờ. Giữ khoảng thở trống tinh tế để khi người chơi xây nhà, mô hình 3D sẽ là tâm điểm thị giác duy nhất!

2. **4 Ô Góc Đặc Biệt (Iconic Corner Monoliths)**:
   - **Ô 0: Khởi Hành (GO)**:
     - Nền đá cẩm thạch trắng Carrara (`#F8FAFC`).
     - Một biểu tượng La Bàn Hình Học Tối Giản (Minimal Geometric Compass) khắc âm bản mạ bạc satin.
     - Dòng chữ `KHỞI HÀNH` và `+2.000 Tr.` được sắp đặt theo tỷ lệ vàng chuẩn mực.
   - **Ô 10: Trạm Kiểm Toán & Nhà Tù (Detention & Audit Hub)**:
     - Khai tử hình vẽ song sắt nhà tù hoạt hình trẻ con!
     - Thiết kế như một sân gạch đá phiến xám đen (Anthracite Slate `#1E293B`), bên trên đặt một **Khối lập phương kính mờ hun khói (Frosted Smoked Glass Cube)** kích thước `0.6m x 0.6m x 0.6m` tượng trưng cho buồng kiểm toán tài chính độc lập, phát ra ánh sáng LED trắng dịu bên trong.
   - **Ô 20: Công Viên Hòa Bình (Free Parking / Urban Park)**:
     - Một khoảng sân vườn Zen tối giản với sỏi trắng cào rãnh tròn và một khối đá điêu khắc phong cách Isamu Noguchi, tạo cảm giác thư giãn tuyệt đối cho người chơi khi dừng chân.
   - **Ô 30: Trát Thanh Tra (Go to Audit)**:
     - Con dấu hình học đỏ son tối giản (Minimalist Wax Seal) dập chìm sắc nét trên mặt đá cẩm thạch, nghiêm nghị và quyền lực mà không cần bất kỳ hình vẽ hoạt họa nào.

3. **Ô Cơ Hội & Khí Vận (Chance & Fortune Cards)**:
   - Khai tử các icon rương vàng và dấu hỏi chấm hoạt hình!
   - Tại vị trí ô Cơ Hội và Khí Vận trên bàn cờ, tạo một **Khay Lõm Thẻ Bài (Depressed Card Trench)**.
   - Trong khay đặt một **Cọc thẻ bài 3D vật lý (Stacked 3D Physical Cards)** dày 0.05m bằng giấy mỹ thuật dập nổi viền bạc, nằm nghiêng góc 6 độ tự nhiên như một cọc bài thật đang chờ người chơi rút!

4. **Ô Bến Xe & Tiện Ích (Transit & Utility Tiles)**:
   - Các ô Bến xe: Hai thanh ray tàu hỏa siêu nhỏ bằng kim loại xám mờ mạ chrome (`metalness: 0.85, roughness: 0.2`) khắc trực tiếp lên rãnh đá của ô cờ, gợi nhắc hệ thống đường sắt đô thị hiện đại.
   - Các ô Tiện ích (Điện/Nước): Biểu tượng đồ họa tối giản phong cách Bauhaus khắc chìm vào mặt đá, không dùng icon clip-art tô màu.

---

### ĐỘT PHÁ 4: ĐÔ THỊ SA BÀN SỐNG & HỆ SINH THÁI THỦY VĂN ĐẲNG CẤP
*Biến vùng lõi trung tâm thành một kỳ quan kiến trúc thu nhỏ.*

```
┌────────────────────────────────────────────────────────────────────────┐
│               HỆ SINH THÁI ĐÔ THỊ SA BÀN SỐNG TRUNG TÂM                │
├────────────────────────────────────────────────────────────────────────┤
│ • DÒNG SÔNG SÀI GÒN: Sâu 0.08m, khúc xạ IOR 1.333, nhìn thấu đá đáy    │
│ • CẦU ĐÔI BA SON & LONG BIÊN: Khối đúc điêu khắc vi mô, dây văng thép  │
│ • CÂY SA BÀN KIẾN TRÚC: Cầu bọt xốp đa tầng (Architectural Sponge)     │
│ • XE ĐỒ CHƠI SCANDINAVIAN: Xe gỗ đúc bóng bẩy, chạy êm ái trên ray     │
│ • BỜ BIỂN CHUYỂN DẢI ƯỚT: Gradient cát ướt sẫm màu khi giáp bọt sóng   │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Dòng Sông Sài Gòn Nhìn Thấu Đáy (Refractive Depth Saigon River)**:
   - Hạ lòng sông sâu xuống `y = -0.08m` (sâu hơn hiện tại 0.03m).
   - Đáy sông có lớp sa thạch và cuội ngầm sẫm màu với ánh sáng khúc xạ (Caustic patterns nhẹ).
   - Mặt nước sông sử dụng `MeshPhysicalMaterial` với:
     - `transmission: 0.82`, `ior: 1.333`, `roughness: 0.06`, `thickness: 0.15`.
     - Nhìn từ trên xuống, dòng sông có màu xanh ngọc bích trong vắt, người chơi có thể nhìn thấy độ dốc của bờ kè đá hoa cương cắm sâu xuống đáy sông.

2. **Cây Sa Bàn Kiến Trúc Đa Tầng (Architectural Model Trees)**:
   - Thay thế các tán dừa thô hoặc cây nón đơn điệu bằng **Cây mô hình sa bàn kiến trúc (Foliage Sponge Clusters)**:
     - Tán cây là các khối cầu bọt biển xốp (Icosahedron bo tròn ngẫu nhiên) nhiều sắc thái: Xanh rêu Bắc Âu (`#2D5A27`), Xanh Oliu dịu (`#4D7C0F`), Vàng chanh điểm xuyết (`#A3E635`).
     - Thân cây là gỗ tiện mộc thanh mảnh, chân cắm vào hốc sỏi đá cuội trắng.
     - Tạo bóng râm đanh chắc và phức tạp trên mặt thềm sa bàn qua N8AO.

3. **Vi Giao Thông Đồ Chơi Gỗ Scandinavian (Nordic Die-cast Micro-Traffic)**:
   - Thiết kế lại các phương tiện vi mô: Thân xe đúc khối bo tròn mượt mà (phong cách đồ chơi gỗ cao cấp Brio / Playforever của Thụy Điển), bề mặt sơn bóng Satin Matte cao cấp.
   - Bánh xe kim loại đen mờ, kính chắn gió dập chìm mạ bạc.
   - Khi chuyển sang chế độ hoàng hôn/đêm, đèn xe phát ra vệt sáng nón ấm áp trên mặt đường nhựa mịn.

4. **Bờ Biển & Dải Cát Chuyển Dải Ướt (Wet Sand Shoreline Dynamics)**:
   - Bãi cát bờ Nam có độ dốc mềm tiếp giáp mặt biển.
   - Áp dụng texture dải cát chuyển màu: Phần cát khô màu vàng sáng kem (`#FEF3C7`), phần cát sát mép nước chuyển sang màu nâu ướt sẫm (`#D97706`), tạo cảm giác chân thực tuyệt đối khi bọt sóng trắng Gerstner dập dềnh liếm vào bờ.

---

### ĐỘT PHÁ 5: ÁNH SÁNG MẶT TRỜI TẠO KHỐI & BẢNG MÀU THUẦN KHIẾT
*Loại bỏ vĩnh viễn hiệu ứng lóa sáng (Bloom) rẻ tiền và ánh sáng phòng tối.*

1. **Ánh Sáng Nắng Xiên Tự Nhiên (Architectural Key Sunlight)**:
   - Thiết lập nguồn sáng `directionalLight` góc xiên 42 độ tại tọa độ `[18, 26, 16]`.
   - Màu nắng: Vàng mật ong nhạt tự nhiên (`#FFFBEB`, cường độ 1.45).
   - Ánh sáng môi trường (`ambientLight`): Giảm mạnh từ 0.7 xuống 0.25 (tone xanh mát `#E0F2FE`).
   - **Tác động thị giác:** Mọi công trình, ô cờ, con cờ và cành cây đều có sự phân tách rực rỡ giữa **mặt sáng chan hòa nắng và mặt tối có bóng đổ sâu**, tạo chiều sâu lập thể 3D cực mạnh mà không cần bất kỳ hiệu ứng giả tạo nào!

2. **Cấu Hình N8AO Đanh Chắc Khóa Chân Công Trình**:
   - `aoRadius`: `0.95`
   - `intensity`: `1.75`
   - `distanceFalloff`: `1.8`
   - `color`: `#080D1A` (Tone bóng xanh đen đậm sâu)
   - Khóa chặt mọi chân cột shophouse, rãnh khay ô cờ, đáy sông và gầm cầu, triệt tiêu 100% hiện tượng vật thể trôi lơ lửng.

3. **AgX / ACES Filmic Tone Mapping**:
   - Chuyển đổi bộ quản lý màu sắc Three.js sang `AgX` (hoặc `ACESFilmic` với exposure 1.15).
   - Đảm bảo các mảng trắng sứ của ô cờ không bị cháy sáng mất chi tiết, các mảng bóng râm giữ được độ sâu mà không bị đen đục.

---

## IV. MA TRẬN ĐỐI SÁCH VỚI Ý KIẾN PHẢN BIỆN (ANTICIPATING PUSHBACK)

Trước khi gửi bản đề xuất này ra hội đồng phản biện (đối ứng với Subagent B), Giám đốc Nghệ thuật & Kỹ thuật 3D đã chuẩn bị sẵn các câu trả lời đanh thép:

| Vấn Đề E Ngại | Phản Biện Của Subagent B | Lời Giải Kỹ Thuật Đột Phá Của Giám Đốc 3D |
| :--- | :--- | :--- |
| **Hiệu năng WebGL & 60 FPS** | Thêm PBR `MeshPhysicalMaterial`, rãnh khay chìm và Curvature Shading có làm tụt khung hình trên mobile không? | **HOÀN TOÀN KHÔNG.** Toàn bộ 40 ô cờ dùng chung DUY NHẤT 1 bộ Shader Material chia sẻ qua Instanced/Shared Material. Curvature Shader chỉ dùng phép toán `fwidth` cực nhẹ (1 phép tính GPU per-pixel). Số Draw Calls vẫn được kiểm soát nghiêm ngặt ở mức **65 - 70 calls** (dưới trần 75). |
| **Dung lượng Bundle 3D** | Liệu có làm phình bundle vượt trần 2.5 MB? | **KHÔNG TĂNG DUNG LƯỢNG.** Bàn cờ đúc nguyên khối và rãnh khay được tạo bằng **Hình học Thủ tục (Procedural BufferGeometry)** bằng code toán học Three.js trong runtime, không tải thêm bất kỳ file 3D `.glb` nào từ ngoài vào. Dung lượng bundle tăng thêm chưa tới **12 KB gzip**! |
| **Tương thích ngược 131 Tests** | Đập bỏ code cũ có làm gãy 131 test suites hiện tại? | **BẢO TỒN 100% HỢP ĐỒNG KIỂM THỬ.** Áp dụng nguyên tắc `Contract Preservation` (Gotcha #31): Giữ nguyên các định danh DOM, data-testid, các hàm pure math (`calculateStandeeElevation`, `tierColor`), và các mảng cấu hình dữ liệu. Mọi test suite hiện hữu sẽ pass 100%. |

---

## V. LỘ TRÌNH TRIỂN KHAI THEO QUY TRÌNH 3 TRẠM BẮT BUỘC

Toàn bộ quá trình thực thi phải tuân thủ nghiêm ngặt **Mandatory 3-Station Implementation Pipeline**:

```
[TRẠM 1: RED CONTRACT TESTS] (qa-tester)
  ├── Viết tests/client/clean_modern_architectural_diorama.test.ts
  ├── Kiểm chứng thất bại (RED): Bàn cờ chưa có Solid Chassis, ô cờ chưa có Recessed Wells, N8AO chưa đạt chuẩn
  └── Khóa cứng Assertions chống bug-codification
        │
        ▼
[TRẠM 2: GREEN IMPLEMENTATION] (implementer)
  ├── 1. Xây dựng Solid Monolithic Board & Recessed Wells trong board_layout.tsx
  ├── 2. Nâng cấp board_tile.tsx: Khảm gạch sứ PBR, dẹp bỏ hoàn toàn 2D Standee
  ├── 3. Tái thiết kế tile_texture_generator.ts: Swiss Typo dập chìm, dải màu Nordic khảm khối
  ├── 4. Tái cấu trúc diorama_terrain.tsx, diorama_shophouse_blocks.tsx, diorama_highrise_blocks.tsx
  └── 5. Tinh chỉnh post_processing_pipeline.tsx & time_of_day_lighting.tsx: Nắng xiên 42 độ, N8AO 1.75
        │
        ▼
[TRẠM 3: PHYSICAL DISK VERIFICATION & AUDIT] (Independent Reviewers)
  ├── spec-reviewer: Đối chiếu 100% so với đề xuất IMP-32, không scope drift
  ├── code-reviewer: Kiểm tra giới hạn dòng (LOC <= 400), CC <= 5, zero dirty casts
  └── game-3d-visual-critic: Chụp ảnh góc 38 độ và top-down, đối chiếu trực tiếp với Retropoly & Monopoly Plus
```

---

## VI. BẢNG TỔNG KẾT THÔNG SỐ KỸ THUẬT BÀN GIAO (SPECIFICATION SHEET)

| Hạng mục | Giá trị Cũ | Giá trị Đột Phá IMP-32 | Ý nghĩa Nghệ thuật |
| :--- | :--- | :--- | :--- |
| **Kiến trúc Bàn cờ** | Hộp rời rạc, nền cỏ xanh chói `#22C55E` | Bệ đúc nguyên khối Trắng Xương `#F1F5F9` | Cảm giác sa bàn kiến trúc triển lãm cao cấp |
| **Liên kết Ô cờ** | Phẳng lì, dán canvas | Rãnh khay chìm sâu `0.035m`, khe `0.012m` | Tạo bóng hốc rãnh vật lý thật, xóa viền giả 2D |
| **Vật liệu Ô cờ** | MeshStandardMaterial giấy ngà cũ | MeshPhysicalMaterial men sứ mờ (`roughness: 0.22, clearcoat: 0.75`) | Xúc giác sờ chạm sang trọng như gạch men Thụy Sĩ |
| **Hiển thị Ô đặc biệt** | Icon 2D clipart, song sắt hoạt hình | Thẻ bài 3D vật lý, Khối kính hun khói tối giản | Đẳng cấp tối giản Bắc Âu, không ngô nghê |
| **Chiếu sáng & Bóng** | Ambient 0.7 (nhạt nhòa), Bloom lóa | Key Sun 42 độ (`#FFFBEB`, int: 1.45), N8AO 1.75 | Phân khối sáng/tối sắc nét, khóa chặt mặt đất |
| **Thủy văn Sài Gòn** | Hộp xanh phẳng `y = -0.05` | Nước truyền dẫn khúc xạ `y = -0.08`, thấu đáy | Dòng sông có chiều sâu thăm thẳm, thơ mộng |
| **Tổng Draw Calls** | 65 - 68 calls | **66 - 69 calls** (Bảo toàn trần <= 75) | Giữ vững 60 FPS mượt mà trên trình duyệt |

---
*Bản đề xuất đã được phê duyệt bởi Senior 3D Art & Tech Director. Sẵn sàng cho phiên phản biện đối ứng.*
