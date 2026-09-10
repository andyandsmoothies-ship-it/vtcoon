# DANH MỤC 28 PROMPT STANDEE 3D BẢN ĐỊA VTCOON (UNIVERSAL 3D PROMPTS CATALOG)

> **Tài liệu nguồn chuẩn:** `docs/domain/design.md` & `docs/domain/entity_model.md`  
> **Mục đích:** Danh mục trọn vẹn 28 prompt AI chuyên dụng (tiếng Anh chuẩn kỹ thuật) kèm `Universal Style Wrapper` để tạo ảnh Standee 3D sa bàn tách nền (Transparent WebP) cho 28 ô tài sản kinh tế của bàn cờ VTCoOn.

---

## 1. HƯỚNG DẪN KỸ THUẬT & QUY CÁCH TÀI NGUYÊN (ASSET SPECIFICATIONS)

### 1.1. Quy Chuẩn Tệp Ảnh
- **Định dạng:** `.webp` tách nền trong suốt (Transparent Alpha Cutout).
- **Kích thước chuẩn:** `512 x 512 px` (tỷ lệ 1:1).
- **Dung lượng tối đa:** `<= 45 KB` / ảnh (đảm bảo tổng tải trang cực nhẹ, 60 FPS trên React Three Fiber).
- **Thư mục lưu trữ trong dự án:** `public/assets/tiles/`
- **Quy tắc đặt tên tệp:**
  - Định danh đơn lẻ (Standee chung): `tile_[index].webp` (Ví dụ: `tile_01.webp`, `tile_39.webp`)
  - Định danh theo 4 cấp công trình (C0 - C3): `tile_[paddedId]_lvl[level].webp` (Ví dụ: `tile_01_lvl0.webp`, `tile_01_lvl1.webp`, `tile_01_lvl2.webp`, `tile_01_lvl3.webp` với paddedId gồm 2 chữ số: 01..39 và level: 0..3).

### 1.2. Hướng Dẫn Nạp Vào Game (Code Activation)
Sau khi sinh ảnh và chép vào thư mục `public/assets/tiles/`, mở tệp [`src/client/assets/tile_assets.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/assets/tile_assets.ts):
```ts
// Thêm chỉ số ô (1..39) vào tập hợp READY_TILES:
export const READY_TILES = new Set<number>([
  1, 3, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16, 18, 19,
  21, 23, 24, 25, 26, 27, 28, 29, 31, 32, 34, 35, 37, 39
]);
```
Hệ thống 3D `board_tile.tsx` và `tile_assets.ts` sẽ tự động hiển thị texture 3D sắc nét thay thế placeholder mặc định.

---

## 2. BỘ KHUNG PHONG CÁCH CHUẨN TOÀN CẦU (UNIVERSAL STYLE WRAPPER)

Khi sử dụng trên các công cụ sinh ảnh AI (Recraft.ai, Bing Image Creator / DALL-E 3, Midjourney v6, Stable Diffusion XL), hãy ghép nối theo công thức:

`Final Prompt` = `Prefix` + `[Mô tả chi tiết công trình Ô]` + `Suffix`

### 2.1. Tiền Tố Chuẩn (Universal Prefix)
```text
Isometric 3D diorama standee token of [LANDMARK_SUBJECT], collectible board game miniature figurine, clean transparent background, isolated cutout, vibrant Vietnamese cultural aesthetics, cute stylized architectural miniature,
```

### 2.2. Hậu Tố Chuẩn (Universal Suffix)
```text
Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, smooth plastic resin and ceramic porcelain finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background, studio lighting.
```

### 2.3. Negative Prompt (Dành cho Stable Diffusion / Recraft)
```text
blurry, realistic human faces, photographic background, text, watermark, signature, dark backdrop, noisy, distorted geometry, low quality, flat 2D, ugly, cropped, complex baseplate.
```

---

## 3. DANH MỤC 28 PROMPT STANDEE 3D CHI TIẾT (TỪ Ô 01 ĐẾN Ô 39)

### CẠNH 1: VÙNG TÂY NAM BỘ & DỊCH VỤ PHỤ CẬN PHÍA NAM (Ô 01 – Ô 09)

#### Ô 01: Cần Thơ (Cái Răng) — BĐS Đô thị & Thương mại
- **Nhóm màu:** Nâu Đất (Earth Brown)
- **Tên tệp:** `tile_01.webp` (hoặc `tile_01_lvl0.webp` đến `tile_01_lvl3.webp`)
- **Biểu tượng:** Xuồng ba lá đầy ắp trái cây nhiệt đới, cây bẹo nông sản, nhà phố nổi bến Ninh Kiều.
- **Prompt:**
```text
Isometric 3D diorama standee token of Can Tho Cai Rang floating market, a traditional Vietnamese wooden sampan boat filled with colorful tropical fruits (mangoes, pineapples, watermelons) and a tall bamboo produce pole (cay beo), gentle stylized water ripples, miniature yellow riverside shophouse with terracotta roof in the background, collectible board game miniature figurine, clean transparent background, isolated cutout, vibrant Vietnamese cultural aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, smooth plastic resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 03: An Giang (Châu Đốc) — BĐS Đô thị & Thương mại
- **Nhóm màu:** Nâu Đất (Earth Brown)
- **Tên tệp:** `tile_03.webp`
- **Biểu tượng:** Mái đình cổ Miếu Bà Chúa Xứ Núi Sam, cổng vòm giao thương biên mậu Indochine.
- **Prompt:**
```text
Isometric 3D diorama standee token of Chau Doc An Giang Lady Temple of Mount Sam (Mieu Ba Chua Xu), ancient Vietnamese curved pagoda roof with multi-tiered green and orange glazed tiles, ornate golden dragon ridges, Indochinese border trade market archway, festive red lanterns, collectible board game miniature figurine, clean transparent background, isolated cutout, vibrant Vietnamese cultural aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, smooth ceramic and plastic resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 05: Cảng HKQT Long Thành — Hạ tầng Giao thông
- **Nhóm màu:** Xám Titan viền Xanh Cyan
- **Tên tệp:** `tile_05.webp`
- **Biểu tượng:** Nhà ga hàng không mái vòm hoa sen hiện đại, máy bay phản lực mini, đài kiểm soát không lưu radar phát sáng.
- **Prompt:**
```text
Isometric 3D diorama standee token of Long Thanh International Airport, ultra-modern aerodynamic terminal building shaped like a futuristic lotus flower with sweeping curved glass roof, a cute stylized miniature commercial airliner on asphalt taxiway, futuristic air traffic control radar tower with glowing cyan LED lights, collectible board game miniature figurine, clean transparent background, isolated cutout, modern Vietnamese megaproject aesthetics, cute stylized miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, smooth metallic titanium and resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 06: Bình Dương — BĐS Dịch vụ & Giải trí (Sân Golf & Thể Thao)
- **Nhóm màu:** Xanh Da Trời (Sky Blue)
- **Tên tệp:** `tile_06.webp`
- **Biểu tượng:** Sân golf đồi cỏ xanh uốn lượn, hố cát bunker, clubhouse vách kính cong và xe golf điện mini.
- **Prompt:**
```text
Isometric 3D diorama standee token of Binh Duong Luxury Golf Country Club, pristine sculpted rolling green hills with sand bunker, a miniature red flag pin on putting green, modern two-story glass-walled clubhouse pavilion, a tiny white golf cart parked nearby, collectible board game miniature figurine, clean transparent background, isolated cutout, vibrant sports luxury aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, smooth plastic resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 08: Đồng Nai — BĐS Dịch vụ & Giải trí (Đại Công Viên Chủ Đề)
- **Nhóm màu:** Xanh Da Trời (Sky Blue)
- **Tên tệp:** `tile_08.webp`
- **Biểu tượng:** Lâu đài kỳ quan cổ tích, đường ray tàu lượn siêu tốc uốn lượn, đu quay khổng lồ nhiều màu.
- **Prompt:**
```text
Isometric 3D diorama standee token of Dong Nai Mega Theme Park, whimsical fairytale castle with conical turquoise turrets and golden spires, vibrant orange roller coaster track looping around, miniature colorful Ferris wheel, carnival festive atmosphere, collectible board game miniature figurine, clean transparent background, isolated cutout, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, glossy plastic toy finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 09: Bà Rịa - Vũng Tàu — BĐS Nghỉ dưỡng & Du lịch
- **Nhóm màu:** Xanh Da Trời (Sky Blue)
- **Tên tệp:** `tile_09.webp`
- **Biểu tượng:** Ngọn hải đăng Vũng Tàu màu trắng cổ điển trên đồi đá, tán dù sọc trắng xanh và sóng biển ngọc bích.
- **Prompt:**
```text
Isometric 3D diorama standee token of Vung Tau Coastal Lighthouse, iconic French-colonial round white lighthouse on a rocky coastal cliff, striped blue-and-white beach umbrellas, stylized turquoise ocean waves breaking at the base, lush green tropical foliage, collectible board game miniature figurine, clean transparent background, isolated cutout, vibrant Vietnamese seaside aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, smooth ceramic and resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

---

### CẠNH 2: TRỤC DUYÊN HẢI & NGHỈ DƯỠNG MIỀN TRUNG (Ô 11 – Ô 19)

#### Ô 11: Bình Thuận (Mũi Né) — BĐS Nghỉ dưỡng & Du lịch
- **Nhóm màu:** Hồng San Hô (Pastel Coral)
- **Tên tệp:** `tile_11.webp`
- **Biểu tượng:** Đồi cát bay vàng cam uốn lượn, dù lượn lướt sóng sặc sỡ, rặng dừa và resort glamping mái vòm.
- **Prompt:**
```text
Isometric 3D diorama standee token of Mui Ne Binh Thuan Sand Dunes and Beach Resort, sweeping orange-gold sand dunes, colorful kitesurfing canopy gliding in the breeze, miniature white geodesic glamping domes surrounded by coastal palm trees, stylized ocean shore, collectible board game miniature figurine, clean transparent background, isolated cutout, tropical holiday aesthetics, cute stylized miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, smooth matte resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 12: Tập Đoàn Điện Lực (EVN) — Tiện ích Năng lượng
- **Nhóm màu:** Xanh Coban Điện Tử
- **Tên tệp:** `tile_12.webp`
- **Biểu tượng:** Trạm biến áp thông minh Smart-Grid, cột điện cao thế kim loại, cánh quạt điện gió và tấm pin năng lượng mặt trời.
- **Prompt:**
```text
Isometric 3D diorama standee token of EVN National Smart Power Grid Utility, futuristic electrical substation with glowing neon cyan circuits, a miniature lattice steel transmission pylon with lightning bolt motif, gleaming photovoltaic solar panels, and a sleek miniature wind turbine, collectible board game miniature figurine, clean transparent background, isolated cutout, high-tech energy utility aesthetics, cute stylized miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, metallic and glow-in-the-dark finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 13: Lâm Đồng (Đà Lạt) — BĐS Nghỉ dưỡng & Du lịch
- **Nhóm màu:** Hồng San Hô (Pastel Coral)
- **Tên tệp:** `tile_13.webp`
- **Biểu tượng:** Cụm nhà gỗ mái dốc chữ A giữa rừng thông sương mù, vườn hoa cẩm tú cầu nở rộ.
- **Prompt:**
```text
Isometric 3D diorama standee token of Da Lat Highland Pine Forest and Homestay, cozy wooden A-frame chalet with steep shingled roof and warm yellow interior glow, cluster of green pine trees with soft morning fog, vibrant blooming blue and purple hydrangea flower garden, rustic mountain retreat, collectible board game miniature figurine, clean transparent background, isolated cutout, serene romantic Vietnamese highland aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, wood and resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 14: Khánh Hòa (Nha Trang) — BĐS Nghỉ dưỡng & Du lịch
- **Nhóm màu:** Hồng San Hô (Pastel Coral)
- **Tên tệp:** `tile_14.webp`
- **Biểu tượng:** Tháp Trầm Hương màu hồng cam cách điệu, cáp treo vượt biển Vinpearl và khách sạn resort vòm cong.
- **Prompt:**
```text
Isometric 3D diorama standee token of Nha Trang Khanh Hoa Bay, iconic stylized pink Tram Huong Lotus Tower, a miniature seaside luxury curved hotel resort, miniature overhead marine cable car cabin suspended on cable, crystal clear turquoise sea water, collectible board game miniature figurine, clean transparent background, isolated cutout, premier tropical coastal resort aesthetics, cute stylized miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, porcelain and acrylic finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 15: Cảng Nước Sâu Cái Mép — Hạ tầng Giao thông
- **Nhóm màu:** Xám Titan viền Xanh Cyan
- **Tên tệp:** `tile_15.webp`
- **Biểu tượng:** Giàn cẩu container khổng lồ màu cam (Quay Cranes), chồng container nhiều màu và tàu chở hàng neo đậu.
- **Prompt:**
```text
Isometric 3D diorama standee token of Cai Mep Deep Sea Mega Container Port, towering bright orange gantry quay crane loading colorful shipping containers, stacks of red, blue, and green intermodal containers on deepwater concrete pier, stylized modern cargo freighter vessel alongside, collectible board game miniature figurine, clean transparent background, isolated cutout, industrial maritime logistics aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, industrial matte and metal finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 16: Bình Định (Quy Nhơn) — BĐS Nghỉ dưỡng & Du lịch
- **Nhóm màu:** Cam Nắng (Warm Orange)
- **Tên tệp:** `tile_16.webp`
- **Biểu tượng:** Tháp Chăm cổ gạch đỏ rêu phong, cung đường bờ đá Eo Gió và biển ngọc Kỳ Co.
- **Prompt:**
```text
Isometric 3D diorama standee token of Quy Nhon Binh Dinh Eo Gio Coastal Cliff, ancient red terracotta Cham brick temple tower with ornate stone carvings, scenic wooden cliffside promenade hugging rugged coastal cliffs, azure ocean waves splashing on rocks, collectible board game miniature figurine, clean transparent background, isolated cutout, historic cultural heritage and scenic beach aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, terracotta and stone resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 18: Thừa Thiên Huế — BĐS Nghỉ dưỡng & Du lịch
- **Nhóm màu:** Cam Nắng (Warm Orange)
- **Tên tệp:** `tile_18.webp`
- **Biểu tượng:** Cổng Ngọ Môn Đại Nội Huế, mái ngói lưu ly vàng, cầu đá cổ bắc qua hồ sen thơm ngát.
- **Prompt:**
```text
Isometric 3D diorama standee token of Hue Imperial Citadel Ngo Mon Gate, grand royal palace gateway with traditional two-tiered yellow glazed tile roofs (ngoi luu ly), red lacquered wooden pillars, ancient brick bastions, an arched stone bridge crossing a tranquil lotus pond with pink blossoms, collectible board game miniature figurine, clean transparent background, isolated cutout, majestic Vietnamese royal dynasty aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, glossy lacquer and ceramic finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 19: Đà Nẵng (Hải Châu - Sơn Trà) — BĐS Đô thị & Thương mại
- **Nhóm màu:** Cam Nắng (Warm Orange)
- **Tên tệp:** `tile_19.webp`
- **Biểu tượng:** Cầu Rồng vàng phun lửa bắc qua sông Hàn, cao ốc tài chính kính cong hiện đại.
- **Prompt:**
```text
Isometric 3D diorama standee token of Da Nang Dragon Bridge and City Center, iconic golden steel Dragon Bridge arching gracefully over Han River with stylized fire breathing head, sleek curved glass financial skyscraper tower in background, sparkling blue river waters, collectible board game miniature figurine, clean transparent background, isolated cutout, dynamic modern Vietnamese coastal metropolis aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, metallic gold and architectural glass finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

---

### CẠNH 3: BẮC TRUNG BỘ & CÁC TRUNG TÂM GIẢI TRÍ - ĐÔ THỊ PHÍA BẮC (Ô 21 – Ô 29)

#### Ô 21: Thanh Hóa (Sầm Sơn) — BĐS Nghỉ dưỡng & Du lịch
- **Nhóm màu:** Đỏ Đô (Crimson Red)
- **Tên tệp:** `tile_21.webp`
- **Biểu tượng:** Biểu tượng đá Hòn Trống Mái, quảng trường biển rực rỡ và khách sạn cánh cung hiện đại.
- **Prompt:**
```text
Isometric 3D diorama standee token of Sam Son Beach Thanh Hoa, iconic natural balancing rock formation (Hon Trong Mai) perched on seaside rock ledge, vibrant coastal festival plaza with colorful palm trees, sleek curved white beach resort hotel, collectible board game miniature figurine, clean transparent background, isolated cutout, popular Vietnamese summer holiday aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, smooth resin and stone finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 23: Nghệ An (TP. Vinh) — BĐS Đô thị & Thương mại
- **Nhóm màu:** Đỏ Đô (Crimson Red)
- **Tên tệp:** `tile_23.webp`
- **Biểu tượng:** Cổng thành cổ Vinh, đài hoa sen vàng kim loại, đại lộ thương mại khang trang.
- **Prompt:**
```text
Isometric 3D diorama standee token of Vinh City Nghe An Commercial Hub, historic brick citadel gateway combined with a gleaming golden lotus monument, modern multi-story commercial banking shophouse with red tile roof and dark granite facade, collectible board game miniature figurine, clean transparent background, isolated cutout, dignified northern central Vietnamese city aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, brick and polished stone finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 24: Ninh Bình (Tràng An) — BĐS Nghỉ dưỡng & Du lịch
- **Nhóm màu:** Đỏ Đô (Crimson Red)
- **Tên tệp:** `tile_24.webp`
- **Biểu tượng:** Dãy núi đá vôi karst sừng sững, đò nan truyền thống trên sông nước xanh biếc, mái đình thủy đình cổ kính.
- **Prompt:**
```text
Isometric 3D diorama standee token of Trang An Ninh Binh UNESCO Heritage, dramatic towering karst limestone peaks covered in lush emerald greenery, tranquil emerald river with a traditional Vietnamese rowing boat, an ancient wooden pagoda water pavilion with curved mossy eaves, collectible board game miniature figurine, clean transparent background, isolated cutout, mystical Vietnamese natural wonder aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, stone and foliage resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 25: Tuyến Cao Tốc Bắc - Nam — Hạ tầng Giao thông
- **Nhóm màu:** Xám Titan viền Xanh Cyan
- **Tên tệp:** `tile_25.webp`
- **Biểu tượng:** Đường cao tốc 6 làn xe hiện đại, trạm thu phí ETC thông minh mái vòm và xe hơi mini.
- **Prompt:**
```text
Isometric 3D diorama standee token of North-South National Smart Expressway, pristine multi-lane asphalt highway with crisp white and yellow luminous markings, high-tech curved electronic toll collection (ETC) gantry with green LED signals, tiny colorful stylized electric vehicles cruising smoothly, safety guardrails, collectible board game miniature figurine, clean transparent background, isolated cutout, modern infrastructure megaproject aesthetics, cute stylized miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, smooth asphalt and metallic finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 26: Hải Phòng — BĐS Dịch vụ & Giải trí (Phố Ẩm Thực & Đêm)
- **Nhóm màu:** Vàng Ánh Kim (Golden Yellow)
- **Tên tệp:** `tile_26.webp`
- **Biểu tượng:** Phố cổ Tam Bạc bến cảng, biển hiệu Food Tour đèn neon rực rỡ, bát bánh đa cua đỏ son.
- **Prompt:**
```text
Isometric 3D diorama standee token of Hai Phong Port City Night Food Tour, charming French-colonial yellow brick shophouses with green window shutters along riverside, glowing neon street food signs, a giant cute stylized red crab noodle bowl (banh da cua), vibrant night market lanterns, collectible board game miniature figurine, clean transparent background, isolated cutout, lively northern port culinary night culture aesthetics, cute stylized miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, glossy resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 27: Kiên Giang (Phú Quốc Grand World) — BĐS Dịch vụ & Giải trí
- **Nhóm màu:** Vàng Ánh Kim (Golden Yellow)
- **Tên tệp:** `tile_27.webp`
- **Biểu tượng:** Dãy phố Venice rực rỡ sắc màu dọc kênh đào, thuyền Gondola và tháp đồng hồ trung tâm phát sáng.
- **Prompt:**
```text
Isometric 3D diorama standee token of Grand World Phu Quoc Sleepless City, rainbow pastel Venetian-style shophouses lining a sparkling artificial canal, an elegant arched stone footbridge, a charming black and gold Gondola boat, illuminated golden clock tower, festive carnival atmosphere, collectible board game miniature figurine, clean transparent background, isolated cutout, luxury entertainment resort aesthetics, cute stylized miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, smooth plastic toy and porcelain finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 28: Tập Đoàn Viễn Thông (Viettel) — Tiện ích Số hóa
- **Nhóm màu:** Xanh Coban Điện Tử
- **Tên tệp:** `tile_28.webp`
- **Biểu tượng:** Tháp viễn thông thông minh phát sóng 5G ánh sáng xanh, trung tâm dữ liệu Data Center kính khối hộp và vi mạch AI.
- **Prompt:**
```text
Isometric 3D diorama standee token of Viettel 5G Telecom and AI Data Center Utility, sleek futuristic telecom communications tower with radiant pulsing cyan 5G signal rings, cube-shaped glass server data center building with glowing motherboards and microchips, satellite dish, collectible board game miniature figurine, clean transparent background, isolated cutout, advanced digital transformation utility aesthetics, cute stylized miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, metallic and holographic glass finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 29: Quảng Ninh (Hạ Long) — BĐS Nghỉ dưỡng & Du lịch
- **Nhóm màu:** Vàng Ánh Kim (Golden Yellow)
- **Tên tệp:** `tile_29.webp`
- **Biểu tượng:** Hòn Trống Mái Vịnh Hạ Long, du thuyền buồm nâu gỗ sang trọng lướt trên làn nước ngọc bích.
- **Prompt:**
```text
Isometric 3D diorama standee token of Ha Long Bay Quang Ninh World Heritage, iconic towering limestone islets rising from emerald green water, a luxury traditional wooden Vietnamese junk boat with terracotta pleated sails gliding smoothly, sea mist, collectible board game miniature figurine, clean transparent background, isolated cutout, breathtaking world wonder maritime aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, polished wood and stone resin finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

---

### CẠNH 4: TRỤC ĐÔ THỊ LÕI HÀ NỘI & TP. HỒ CHÍ MINH (Ô 31 – Ô 39)

#### Ô 31: Hưng Yên (Văn Giang) — BĐS Đô thị & Thương mại
- **Nhóm màu:** Xanh Lục Bảo (Emerald Green)
- **Tên tệp:** `tile_31.webp`
- **Biểu tượng:** Biển hồ nước mặn nhân tạo pha lê, tháp đôi chung cư xanh phủ cây thẳng đứng (Vertical Garden).
- **Prompt:**
```text
Isometric 3D diorama standee token of Van Giang Hung Yen Mega Eco-City, shimmering crystal-blue artificial saltwater lagoon surrounded by white sand beach, lush green palm trees, ultra-modern twin residential towers with vertical lush balcony gardens, collectible board game miniature figurine, clean transparent background, isolated cutout, premium ecological smart city aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, architectural glass and foliage finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 32: Hà Nội (Cầu Giấy) — BĐS Đô thị & Thương mại
- **Nhóm màu:** Xanh Lục Bảo (Emerald Green)
- **Tên tệp:** `tile_32.webp`
- **Biểu tượng:** Tháp công nghệ cao AI kính xanh hiện đại, vi mạch chip bán dẫn phát sáng, sảnh đón doanh nghiệp kỳ lân.
- **Prompt:**
```text
Isometric 3D diorama standee token of Cau Giay Hanoi High-Tech and IT Valley, sleek 30-story geometric office skyscraper made of emerald reflective glass, decorative golden microchip traces on facade with subtle glowing data points, modern plaza with digital tech totem, collectible board game miniature figurine, clean transparent background, isolated cutout, innovation capital tech hub aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, reflective glass and steel finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 34: Hà Nội (Hoàn Kiếm) — BĐS Đô thị & Thương mại
- **Nhóm màu:** Xanh Lục Bảo (Emerald Green)
- **Tên tệp:** `tile_34.webp`
- **Biểu tượng:** Tháp Rùa cổ kính giữa Hồ Gươm rêu phong, tán cây lộc vừng rủ bóng, TTTM Tràng Tiền mái vòm Beaux-Arts.
- **Prompt:**
```text
Isometric 3D diorama standee token of Hoan Kiem Hanoi Turtle Tower and Trang Tien Plaza, historic mossy brick Turtle Tower on a tiny green islet in emerald Sword Lake, weeping red flower tree branches, elegant neoclassical Beaux-Arts Trang Tien shopping mall with arched French windows in background, collectible board game miniature figurine, clean transparent background, isolated cutout, millennium-old Hanoi heritage heart aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, antique stone and marble finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 35: Cảng HKQT Nội Bài — Hạ tầng Giao thông
- **Nhóm màu:** Xám Titan viền Xanh Cyan
- **Tên tệp:** `tile_35.webp`
- **Biểu tượng:** Nhà ga Quốc tế T2 mái vòm cánh chim vươn rộng bằng kính, ống lồng đón khách và tháp kiểm soát không lưu.
- **Prompt:**
```text
Isometric 3D diorama standee token of Noi Bai International Airport Hanoi, grand modern glass wing-shaped Terminal 2 with expansive aerodynamic steel trusses, passenger boarding jet bridges connected to a cute stylized passenger plane on tarmac, air traffic control tower, collectible board game miniature figurine, clean transparent background, isolated cutout, national gateway airport aesthetics, cute stylized miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, polished titanium and glass finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 37: TP.HCM (TP. Thủ Đức) — BĐS Đô thị & Thương mại
- **Nhóm màu:** Tím Hoàng Gia (Royal Purple)
- **Tên tệp:** `tile_37.webp`
- **Biểu tượng:** Tháp Đổi Mới Sáng Tạo xoắn kép ADN, Cầu Ba Son dây văng vòm thép, trung tâm nghiên cứu bán dẫn.
- **Prompt:**
```text
Isometric 3D diorama standee token of Thu Duc City Innovation and R&D Hub, iconic cable-stayed Ba Son Bridge with sweeping steel tower, futuristic double-helix twisting glass skyscraper tower, silicon wafer research center pavilion with sleek purple LED accents, collectible board game miniature figurine, clean transparent background, isolated cutout, southern tech megacity aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, architectural purple glass and steel finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

#### Ô 39: TP.HCM (Quận 1 - Nguyễn Huệ) — BĐS Đô thị & Thương mại
- **Nhóm màu:** Tím Hoàng Gia (Royal Purple)
- **Tên tệp:** `tile_39.webp`
- **Biểu tượng:** Phố đi bộ Nguyễn Huệ trải đá hoa cương, tòa tháp tài chính Bitexco hình búp sen vươn cao và siêu cao ốc chọc trời.
- **Prompt:**
```text
Isometric 3D diorama standee token of Nguyen Hue Walking Street and Bitexco Tower District 1 Ho Chi Minh City, iconic lotus-bud shaped Bitexco Financial Tower with cantilevered circular helipad, prestigious pedestrian boulevard with patterned granite paving and fountain, luxury commercial skyscrapers illuminated in royal purple and gold, collectible board game miniature figurine, clean transparent background, isolated cutout, the pinnacle of Vietnam economic prosperity aesthetics, cute stylized architectural miniature, Unreal Engine 5 render, Octane render, ray-traced ambient occlusion, soft rim lighting, glossy glass, gold and marble finish, crisp edges, 8k resolution, micro tilt-shift perspective, no shadows on background.
```

---

## 4. TỔNG KẾT BẢNG ÁNH XẠ NHANH 28 TÀI SẢN (CHEAT SHEET)

| STT | Ô Số | Tên Tài Sản | Nhóm Màu | Tên Tệp Chuẩn | Tọa Độ Z Lớp Sa Bàn |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 1 | **Ô 01** | Cần Thơ (Cái Răng) | Nâu | `tile_01.webp` | Z = 0.0 |
| 2 | **Ô 03** | An Giang (Châu Đốc) | Nâu | `tile_03.webp` | Z = 0.0 |
| 3 | **Ô 05** | Cảng HKQT Long Thành | Giao Thông | `tile_05.webp` | Z = 0.0 |
| 4 | **Ô 06** | Bình Dương (Golf & Thể Thao) | Xanh Da Trời | `tile_06.webp` | Z = 0.0 |
| 5 | **Ô 08** | Đồng Nai (Đại Công Viên) | Xanh Da Trời | `tile_08.webp` | Z = 0.0 |
| 6 | **Ô 09** | Bà Rịa - Vũng Tàu | Xanh Da Trời | `tile_09.webp` | Z = 0.0 |
| 7 | **Ô 11** | Bình Thuận (Mũi Né) | Hồng | `tile_11.webp` | Z = 0.0 |
| 8 | **Ô 12** | Tập Đoàn Điện Lực (EVN) | Tiện Ích | `tile_12.webp` | Z = 0.0 |
| 9 | **Ô 13** | Lâm Đồng (Đà Lạt) | Hồng | `tile_13.webp` | Z = 0.0 |
| 10 | **Ô 14** | Khánh Hòa (Nha Trang) | Hồng | `tile_14.webp` | Z = 0.0 |
| 11 | **Ô 15** | Cảng Nước Sâu Cái Mép | Giao Thông | `tile_15.webp` | Z = 0.0 |
| 12 | **Ô 16** | Bình Định (Quy Nhơn) | Cam | `tile_16.webp` | Z = 0.0 |
| 13 | **Ô 18** | Thừa Thiên Huế | Cam | `tile_18.webp` | Z = 0.0 |
| 14 | **Ô 19** | Đà Nẵng (Hải Châu - Sơn Trà) | Cam | `tile_19.webp` | Z = 0.0 |
| 15 | **Ô 21** | Thanh Hóa (Sầm Sơn) | Đỏ | `tile_21.webp` | Z = 0.0 |
| 16 | **Ô 23** | Nghệ An (TP. Vinh) | Đỏ | `tile_23.webp` | Z = 0.0 |
| 17 | **Ô 24** | Ninh Bình (Tràng An) | Đỏ | `tile_24.webp` | Z = 0.0 |
| 18 | **Ô 25** | Tuyến Cao Tốc Bắc - Nam | Giao Thông | `tile_25.webp` | Z = 0.0 |
| 19 | **Ô 26** | Hải Phòng (Ẩm Thực Đêm) | Vàng | `tile_26.webp` | Z = 0.0 |
| 20 | **Ô 27** | Kiên Giang (Grand World) | Vàng | `tile_27.webp` | Z = 0.0 |
| 21 | **Ô 28** | Tập Đoàn Viễn Thông (Viettel) | Tiện Ích | `tile_28.webp` | Z = 0.0 |
| 22 | **Ô 29** | Quảng Ninh (Hạ Long) | Vàng | `tile_29.webp` | Z = 0.0 |
| 23 | **Ô 31** | Hưng Yên (Văn Giang) | Xanh Lá | `tile_31.webp` | Z = 0.0 |
| 24 | **Ô 32** | Hà Nội (Cầu Giấy) | Xanh Lá | `tile_32.webp` | Z = 0.0 |
| 25 | **Ô 34** | Hà Nội (Hoàn Kiếm) | Xanh Lá | `tile_34.webp` | Z = 0.0 |
| 26 | **Ô 35** | Cảng HKQT Nội Bài | Giao Thông | `tile_35.webp` | Z = 0.0 |
| 27 | **Ô 37** | TP.HCM (TP. Thủ Đức) | Tím | `tile_37.webp` | Z = 0.0 |
| 28 | **Ô 39** | TP.HCM (Quận 1 - Nguyễn Huệ) | Tím | `tile_39.webp` | Z = 0.0 |
