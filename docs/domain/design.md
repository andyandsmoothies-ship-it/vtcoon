### **I. QUY CHUẨN ĐỊA HÌNH & SA BÀN ĐÔ THỊ NÉN 3D (3D DIORAMA & TERRAIN ELEVATION SPECIFICATION - IMP-30/IMP-31)**

1. **Thang phân tầng cao độ mở rộng (Extended Depth Layer Stack - Triệt tiêu 100% Z-Fighting)**:
   - `WALNUT_TABLE_Y = -0.350`: Mặt bàn cờ gỗ óc chó tự nhiên PBR 2K (IMP-62).
   - `OCEAN_Y = -0.150`: Mặt biển xanh ngọc lam (Gerstner Waves ngoài khơi).
   - `RIVER_BED_Y = -0.050`: Lòng kênh sông Sài Gòn nội đô (rộng 1.8m, dài 15.0m, chui qua gầm Cầu Ba Son và Cầu Long Biên).
   - `TERRAIN_BASE_Y = 0.000`: Nền địa hình chính (thảm cỏ hoa viên và bãi cát vàng).
   - `TILE_BORDER_Y = 0.015`: Viền chỉ móng 40 ô cờ và vỉa hè đá granite xám sáng.
   - `TILE_SURFACE_Y = 0.020`: Bề mặt 40 ô cờ và mặt đường nhựa asphalt Đại Lộ Sài Gòn (phẳng hòa tan với địa hình).
   - `PAWN_HALO_Y = 0.021`: Đĩa hào quang chỉ thị vị trí quân cờ (`depthWrite: false`).
   - `STANDEE_BASE_Y = 0.025`: Thềm móng công trình và chân standee billboard.

2. **Quy hoạch phân vùng cao độ (Stepped Height Zoning Invariant)**:
   - **Tọa độ chân đế công trình đỉnh ô cờ (`Top Building Plot Invariant - Gotcha #86`)**: Cả Cấp 0 (`SurveyorPlotBoundary`) và Cấp 1-3 (`SafeGLTFModel`) đặt tại `position={[0, 0.22, -0.58]}` (`Z <= -0.50`), giải phóng hoàn toàn nửa dưới ô cờ cho quân cờ di chuyển và khay giá; bố cục thẻ 4 tầng chống che tên card.
   - **Shophouse Đông Dương ven ô cờ**: Chiều cao công trình h <= 0.8m (dải chuẩn 0.38m - 0.68m), đảm bảo không che khuất chữ trên mặt ô đất và quân cờ ở camera 38 độ. Gom 32 căn qua `InstancedMesh` (2 Draw Calls).
   - **Cao ốc tài chính lõi trung tâm**: Lùi sâu về phía Bắc (Z <= -2.4), chiều cao giật cấp bậc thang h <= 3.2m (dải chuẩn 1.2m - 2.8m). Gom 16 tháp qua `InstancedMesh` (2 Draw Calls).
   - **Hàng dừa nhiệt đới bờ biển**: 60 cây dừa gom qua `InstancedMesh` (3 Draw Calls). Bán kính tán dừa r <= 0.42m, thân dừa cao 1.4m. 40 cây bờ Nam lùi sâu ra bãi cát Z trong khoảng [12.2, 14.0] (cách mép ô cờ >= 2.1m), 20 cây bờ Đông Nam X trong khoảng [12.4, 14.8]. Bảo đảm 100% không che khuất ô cờ.

3. **Ngân sách GPU, WebGL & Triệt tiêu Backdrop Blur (IMP-63)**:
   - Tổng Draw Calls toàn sa bàn: <= 75 Draw Calls (thực tế 65 - 68 Draw Calls).
   - **Bất biến Triệt tiêu 100% `backdrop-blur` trên HUD**: Cấm dùng `backdrop-blur` trên mọi lớp DOM UI nổi trên Canvas 3D. Dùng lớp phủ phẳng trong suốt nhẹ `bg-slate-900/15` cho ModalBackdrop để giải phóng GPU fill-rate, duy trì ổn định 60 FPS trên màn hình di động và máy tính để bàn.

---

### **II. QUY CHUẨN MÔ HÌNH 3D PBR & TÀI NGUYÊN SA BÀN (3D ASSET SPECIFICATION - IMP-62)**

* **15 Mô Hình Điêu Khắc Tinh Xảo (.glb PBR):** Thay thế toàn bộ hình khối voxel thô sơ bằng các asset điêu khắc thu nhỏ chuẩn commercial diorama (`public/models/`, tổng tải trọng 0.63 MB / trần 2.5 MB):
  * **Công trình C1 - C3:** Nhà phố Indochine C1 (`404 tris`), Cao ốc Sapphire C2 (`444 tris`), Đại TTTM & Resort C3 (`556 tris`).
  * **Quân cờ Chibi 3D Đúc Bạc PBR (Zero-Pedestal Invariant - IMP-94/IMP-96):** 4 linh vật con vật đúc bạc PBR đồng bộ (`#E2E8F0`, metalness 0.96, roughness 0.08, 572 - 840 tris, 34 - 45 KB) đứng trực tiếp trên mặt ô cờ (triệt tiêu 100% bệ tròn cờ vua): 🐕 Chó Corgi, 🐈 Mèo Maneki-Neko, 🐎 Ngựa Phong Vân, 🐘 Voi Hoàng Gia. Chân linh vật ôm đĩa hào quang phát quang mang màu thương hiệu người chơi (`PawnAuraPedestal`).
  * **Kỳ quan biểu tượng:** Chợ Bến Thành (`844 tris`), Nhà Thờ Đức Bà (`756 tris`).
  * **Phương tiện vi mô:** 6 loại xe hơi, container, ca nô (`vehicles/`, 180 - 340 tris).
* **Tô Màu Chủ Quyền Thuần Túy (Pure Color Ownership - IMP-98):** Triệt tiêu 100% phần đánh dấu trên đất (Zero-Land-Marker Invariant): Gỡ bỏ con dấu sáp 3D và cọc cờ, giải phóng hoàn toàn mặt tranh di sản 100% tinh khôi. Nhận diện ô có chủ qua khay giá đáy ô `OwnerPricePill` (1.38m) đổi màu theo 4 người chơi (P1 Đỏ `#DC2626`, P2 Xanh Dương `#2563EB`, P3 Cam `#EA580C`, P4 Xanh Lục `#16A34A`), viền vàng kim `#F59E0B`, giá tiền căn giữa trung tâm + Viền chân đế `OwnerBaseTrim` dày 0.10m.
* **Phân Cấp Trực Quan 3 Tầng 40 Ô Bàn Cờ (3-Tier Visual Model - IMP-90):** 22 ô BĐS mang dải màu 56px (`meta.bannerColor`), chữ trắng viền than `#0F172A`, khay giá chân ô; 6 ô Hạ tầng/Tiện ích bỏ dải màu, tiêu đề than đen đậm, vạch kẻ phân cách `y=82`; 8 ô Sự kiện mang Thanh Nhãn Hành Động (Action Badge) rực rỡ không khay giá ([RÚT THẺ CƠ HỘI] cam, [RÚT THẺ THỊ TRƯỜNG] xanh ngọc, [NỘP 1.000 TR.] đỏ hồng, [1D6 ĐẶT CƯỢC] xanh dương).
* **Giao Diện Di Động & Responsive HUD (IMP-89/IMP-99/IMP-100):** ActionDock đặt tại góc dưới bên phải, TelemetryBadge góc dưới bên trái; loại bỏ hoàn toàn SocialEmotesTray; Thẻ người chơi di động siêu tinh gọn toggle ẩn hiện giải phóng 85% sa bàn; Safe Area chân trang (`pb-8 sm:pb-3`) chống cấn phím Home Indicator iOS/Android.
* **Tuyến Đường Sắt Mô Hình & Hạ Tầng Ven Sông (IMP-91/IMP-92):** Tuyến đường sắt mô hình diorama chạy quanh chu vi bên trong bàn cờ 40 ô; tà vẹt gỗ sẫm `#451A03`, cặp ray thép đôi sáng bóng, đế đệm đá ba-lát xám sỏi `#475569` nâng cao Y = 0.020m; ke ga bến sông Sài Gòn thềm đá sáng `#E2E8F0` và mái che lam hổ phách `#D97706`.
* **Hệ Thống Procedural Facade Texture & Gỗ Óc Chó:**
  * Ma trận kính cao ốc và tường vàng Indochine sinh động qua `CanvasTexture` lặp (`RepeatWrapping`), giữ vững kiến trúc `InstancedMesh` (16 cao ốc = 2 draw calls; 32 nhà phố = 2 draw calls).
  * Mặt bàn cờ gỗ óc chó 2K véc-ni tự nhiên (`tabletop_texture_generator.ts`) và thảm nỉ nhung xanh rừng già `#064E3B` (`sheen: 1.0`) cho khay xúc xắc.
  * Tích hợp DataTexture fallback chống crash SSR headless và Singleton Cache chống rò rỉ GPU VRAM.

Quy chuẩn thiết kế mỹ thuật và giao diện trực quan cho toàn bộ 28 ô tài sản kinh tế trên bàn cờ được đồng bộ theo 4 cấp độ phát triển đô thị.  
Mỗi ô bao gồm:

* **Màu sắc & Icon nhận diện:** Hiển thị trực tiếp trên mặt bàn cờ (Tile Board).  
* **Tiến trình mỹ thuật theo cấp độ (Cấp 0 – Cấp 3):** Dùng để in thẻ Chủ Quyền (Title Deed) và xác định hình khối token/minh họa hiển thị.

### **CẠNH 1: TÂY NAM BỘ & DỊCH VỤ PHỤ CẬN PHÍA NAM**

**Ô 01: Cần Thơ (Cái Răng) — BĐS Đô thị & Thương mại**

* **Màu sắc:** Nâu Đất (Earth Brown) | **Icon mặt bàn:** Xuồng ba lá & Cây bẹo nông sản.  
* **Cấp 0 (Mặt bằng Sông nước):** Bến sông hoang sơ, bờ kè cắm cọc tiêu quy hoạch, ghe thuyền neo đậu rải rác.  
* **Cấp 1 (Nhà phố Thương mại Bến Ninh Kiều):** Dãy nhà phố 2 tầng sơn vàng mái ngói, tầng trệt bán đặc sản miền Tây, đèn lồng dọc mép sông.  
* **Cấp 2 (Khách sạn & Tháp Văn phòng Nông sản):** Tòa nhà văn phòng kính xanh 7 tầng, sảnh ngân hàng giao dịch nông sản, bến cập tàu cao tốc.  
* **Cấp 3 - Max (Đại TTTM & Căn hộ Phức hợp Tây Đô):** Khối đế trung tâm thương mại hiện đại 5 tầng kết hợp tháp đôi kính cong mô phỏng hình ảnh dòng sông Hậu.  
* **Lớp Nền:** Vòm bến thuyền Ninh Kiều cổ.  
* **Lớp Linh hồn:** Chiếc xuồng ba lá chất đầy trái cây và cây bẹo nông sản (nhấp nhô nhẹ).  
* **Lớp Tiền cảnh:** Vệt sóng nước sông Hậu cuộn nhẹ.  
* **Âm thanh định danh (Micro-Audio):** Tiếng vỗ sóng rẽ nước kèm một nhịp phách đàn kìm (0.8s).

**Ô 03: An Giang (Châu Đốc) — BĐS Đô thị & Thương mại**

* **Màu sắc:** Nâu Đất (Earth Brown) | **Icon mặt bàn:** Mái đình cổ Miếu Bà & Cổng vòm biên mậu.  
* **Cấp 0 (Đất nền Cửa khẩu):** Bãi đất đỏ san lấp cạnh đường biên, cọc mốc ranh giới, xe tải chờ bốc hàng.  
* **Cấp 1 (Phố Chợ Biên Mậu Khang Trang):** Dãy ki-ốt mái tôn xanh đồng bộ, quầy đổi ngoại tệ, cửa hàng bách hóa tổng hợp nhộn nhịp.  
* **Cấp 2 (Trung tâm Vận tải & Logistics Vùng Biên):** Trạm kiểm soát container hiện đại, kho lạnh ngoại quan mái phẳng kết cấu thép tiền chế.  
* **Cấp 3 - Max (Tổ hợp Khách sạn Di sản & Thương xá Miếu Bà):** Khách sạn phong cách Indochine 9 tầng bề thế, khối thương mại mái vòm cong, quảng trường đài phun nước đón khách hành hương.

**Ô 05: Cảng HKQT Long Thành — Hạ tầng Giao thông**

* **Màu sắc:** Xám Titan viền Xanh Cyan | **Icon mặt bàn:** Máy bay cất cánh & Đài kiểm soát không lưu.  
* **Trạng thái Cơ sở (Giai đoạn 1):** Một đường băng băng bê tông kéo dài, nhà ga trung tâm mái vòm cong hình cánh hoa sen, bãi đỗ máy bay cơ bản.  
* **Nâng cấp Full (Smart Mega Airport):** Toàn bộ tổ hợp bổ sung 3 đường băng mở rộng, hệ thống cầu vượt ngầm kết nối metro sân bay, đài radar không lưu phát sáng ánh xanh công nghệ cao.

**Ô 06: Bình Dương — BĐS Dịch vụ & Giải trí**

* **Màu sắc:** Xanh Da Trời (Sky Blue) | **Icon mặt bàn:** Gậy golf & Quả cầu lăn ven hồ.  
* **Cấp 0 (Sân tập Thể thao Ngoại ô):** Thảm cỏ xanh trải dài, hàng rào lưới cao, nhà bạt dã chiến đón tiếp người chơi.  
* **Cấp 1 (Tuyến Phố Thể Thao & Ẩm thực Bờ Sông):** Dãy quầy bar container ngoài trời, quán cà phê phong cách thể thao, đèn chiếu sáng ban đêm hiện đại.  
* **Cấp 2 (Tổ hợp Thể thao & Lounge Bar 19 Lỗ):** Nhà CLB (Clubhouse) 3 tầng vách kính hướng hồ, quầy bar sân thượng có dàn đèn LED biểu diễn âm nhạc.  
* **Cấp 3 - Max (Mega Country Club & Quần thể Sân Golf 36 Lỗ):** Dinh thự nghỉ dưỡng phong cách tân cổ điển, cụm đồi cỏ nhân tạo điêu khắc, hồ nước cảnh quan, tháp đồng hồ trung tâm phát sáng.

**Ô 08: Đồng Nai — BĐS Dịch vụ & Giải trí**

* **Màu sắc:** Xanh Da Trời (Sky Blue) | **Icon mặt bàn:** Đường ray Tàu lượn siêu tốc.  
* **Cấp 0 (Mặt bằng Dự án Du lịch):** Bãi cỏ rộng san ủi phẳng, rào chắn công trình gắn biển phối cảnh Safari.  
* **Cấp 1 (Quảng trường Lễ hội & Chợ Phiên Ngoại ô):** Cổng chào vòm gỗ, các gian hàng nhà gỗ di động rực rỡ sắc màu, lều ẩm thực ngoài trời.  
* **Cấp 2 (Trung tâm Cảm giác mạnh & Rạp Chiếu 3D):** Tháp rơi tự do thẳng đứng, đường ray tàu lượn kim loại uốn lượn màu cam, mái vòm rạp chiếu phim vòm kính cầu.  
* **Cấp 3 - Max (Siêu Công Viên Chủ Đề Kỳ Quan & Safari):** Tòa lâu đài thần tiên trung tâm cao vút, vòng đu quay khổng lồ gắn đèn LED chuyển màu, khu rừng sinh thái bảo tồn động vật.

**Ô 09: Bà Rịa - Vũng Tàu — BĐS Nghỉ dưỡng & Du lịch**

* **Màu sắc:** Xanh Da Trời (Sky Blue) | **Icon mặt bàn:** Ngọn hải đăng & Tán dù che biển.  
* **Cấp 0 (Đất trống Bãi Sau):** Bãi cát trắng trải dài, rặng phi lao đón gió, chòi canh cứu hộ bờ biển bằng gỗ.  
* **Cấp 1 (Chuỗi Nhà phố Nghỉ dưỡng & Phố Hải Sản):** Dãy nhà phố 3 tầng sơn trắng ban công hướng biển, dãy bàn ghế dù ngoài trời cạnh lối đi dạo lót đá.  
* **Cấp 2 (Khách sạn Phố Biển 4 Sao & Hồ Bơi Vô Cực):** Khối tháp cong 12 tầng màu trắng xanh, hồ bơi tràn bờ kính trên tầng trung, sảnh đón khách giật cấp hiện đại.  
* **Cấp 3 - Max (Quần thể Biển Đảo 5 Sao & Bến Du Thuyền):** Tháp đôi khách sạn cánh buồm cao 25 tầng, cầu cảng vươn dài ra biển neo đậu du thuyền hạng sang.

### **CẠNH 2: TRỤC DUYÊN HẢI & NGHỈ DƯỠNG MIỀN TRUNG**

**Ô 11: Bình Thuận (Mũi Né) — BĐS Nghỉ dưỡng & Du lịch**

* **Màu sắc:** Hồng San Hô (Pastel Coral) | **Icon mặt bàn:** Cánh diều lướt sóng & Đồi cát vàng.  
* **Cấp 0 (Bãi đất Đồi Cát Hoang sơ):** Vạt cát lượn sóng màu cam nhạt, vài cây cọ dại chịu hạn, cọc ranh giới dự án.  
* **Cấp 1 (Khu Bungalow Mộc Ven Sóng):** Cụm lều glamping mái vòm trắng, nhà tròn mái tranh cao cấp xen lẫn hàng dừa.  
* **Cấp 2 (Resort Thể thao Biển 4 Sao):** Biệt thự thấp tầng ốp đá tự nhiên, trung tâm huấn luyện lướt ván dù với tháp ngắm biển bằng gỗ tếch.  
* **Cấp 3 - Max (Tổ hợp Ốc Đảo Xanh & Làng Nghỉ dưỡng Đồi Cát):** Chuỗi biệt thự mái vòm Địa Trung Hải giật bậc theo sườn đồi cát, hồ bơi lagoon uốn lượn giữa các cụm nhà.

**Ô 12: Tập Đoàn Điện Lực (EVN) — Tiện ích Năng lượng**

* **Màu sắc:** Xanh Coban Điện Tử | **Icon mặt bàn:** Tia sét & Cột điện cao thế.  
* **Trạng thái Cơ sở:** Trạm biến áp khối hộp kim loại, đường dây điện cao thế giăng ngang qua cột thép truyền tải.  
* **Nâng cấp Full (Lưới Điện Thông Minh Smart-Grid):** Trạm điều hành tự động hóa với hệ thống pin mặt trời bao quanh, turbine gió vi tính hóa, bảng mạch neon phát sáng phản ánh năng lượng xanh.

**Ô 13: Lâm Đồng (Đà Lạt) — BĐS Nghỉ dưỡng & Du lịch**

* **Màu sắc:** Hồng San Hô (Pastel Coral) | **Icon mặt bàn:** Cành thông & Mái nhà tam giác dốc.  
* **Cấp 0 (Sườn Đồi Săn Mây Hoang Sơ):** Dốc đất cỏ đẫm sương, cụm thông ba lá tự nhiên, hàng rào gỗ mộc đơn sơ.  
* **Cấp 1 (Chuỗi Cafe & Homestay Nhà Gỗ):** Cụm nhà chữ A mái nhọn gỗ sẫm màu, hiên ngắm đồi giăng đèn dây tóc, lò sưởi ngoài trời.  
* **Cấp 2 (Khu Nghỉ dưỡng Sinh thái Sương Mù 4 Sao):** Khách sạn phong cách Thuỵ Sĩ 4 tầng tường ốp đá xám, khuôn viên vườn cẩm tú cầu, nhà kính trồng hoa bao quanh.  
* **Cấp 3 - Max (Quần thể Dinh thự Hoàng Gia & Spa Trị Liệu):** Dinh thự phong cách cổ điển Pháp màu vàng hoàng gia, mái ngói Mansard ghi xám, tháp chuông cổ kính giữa rừng thông tĩnh lặng.

**Ô 14: Khánh Hòa (Nha Trang) — BĐS Nghỉ dưỡng & Du lịch**

* **Màu sắc:** Hồng San Hô (Pastel Coral) | **Icon mặt bàn:** Tháp Trầm Hương & Sóng biển.  
* **Cấp 0 (Lô đất Mặt biển Đường Trần Phú):** Bãi đất giải tỏa ven đường bao biển, rào chắn pano quảng cáo du lịch.  
* **Cấp 1 (Dãy Khách sạn Phố Đi Bộ Biển):** Khách sạn boutique 5 tầng san sát, ban công kính nhìn biển, tầng trệt cho thuê dịch vụ lặn biển.  
* **Cấp 2 (Khối Condotel Nghỉ dưỡng Hiện đại 4 Sao):** Khối nhà cao tầng vách kính phản quang đón nắng biển, sảnh đón giật tam cấp, nhà hàng buffet lộ thiên tầng lửng.  
* **Cấp 3 - Max (Tổ hợp Nghỉ dưỡng Biển Đảo 5 Sao & Cáp Treo):** Tháp khách sạn uốn lượn hình vỏ ốc cao 30 tầng, ga cáp treo trên biển nối thẳng ra vịnh đảo.

**Ô 15: Cảng Nước Sâu Cái Mép — Hạ tầng Giao thông**

* **Màu sắc:** Xám Titan viền Xanh Cyan | **Icon mặt bàn:** Cần cẩu bốc dỡ & Container xếp lớp.  
* **Trạng thái Cơ sở:** Cầu cảng vươn ra lòng sông sâu, 2 cần trục cẩu giàn cẩu container màu cam, bãi đậu xe đầu kéo rải rác.  
* **Nâng cấp Full (Cảng Xanh Container Quốc Tế Siêu Trọng):** 6 giàn cẩu tự động hóa khổng lồ, tàu container mẹ dài 400m cập bến, kho bãi logistics số hóa trang bị hệ thống ray cẩu tự hành.

**Ô 16: Bình Định (Quy Nhơn) — BĐS Nghỉ dưỡng & Du lịch**

* **Màu sắc:** Cam Nắng (Warm Orange) | **Icon mặt bàn:** Tháp Chăm cổ & Cung đường bờ đá.  
* **Cấp 0 (Vạt đất Vịnh Biển Eo Gió):** Đất đồi đá đỏ nhìn xuống vịnh biển màu ngọc bích, lối mòn tự nhiên.  
* **Cấp 1 (Chuỗi Nhà trọ Nghệ thuật & Quán Cá Biển):** Nhà tường vôi trắng xanh phong cách làng chài, giàn hoa giấy rủ bóng, hiên gỗ lót sàn nhìn ra biển.  
* **Cấp 2 (Khu Resort Khoa học Ven Biển 4 Sao):** Cụm biệt thự mái dốc hiện đại, đài quan sát thiên văn mini bán cầu, hồ bơi uốn theo ghềnh đá.  
* **Cấp 3 - Max (Tổ hợp Biệt thự Biển Kỳ Co & Khách sạn 5 Sao):** Quần thể kiến trúc uốn cong mềm mại bám vào sườn vách đá, bến đáp trực thăng riêng, nhà hàng kính nổi trên mặt biển.

**Ô 18: Thừa Thiên Huế — BĐS Nghỉ dưỡng & Du lịch**

* **Màu sắc:** Cam Nắng (Warm Orange) | **Icon mặt bàn:** Cổng Ngọ Môn & Chiếc nón bài thơ.  
* **Cấp 0 (Đất vùng ven Sông Hương):** Bãi cỏ tự nhiên ven sông râm mát rặng tre, bến đất neo thuyền rồng cũ.  
* **Cấp 1 (Nhà Vườn Sinh thái Kiểu Cố Đô):** Nhà rường gỗ truyền thống 3 gian 2 chái, tường gạch mộc, vườn thanh trà bao quanh lối đi lát gạch Bát Tràng.  
* **Cấp 2 (Khách sạn Cố Đô Nghỉ dưỡng 4 Sao):** Khách sạn thấp tầng lợp ngói lưu ly vàng, hành lang cột gỗ son, hồ sen bán nguyệt trước tiền sảnh.  
* **Cấp 3 - Max (Quần thể Cố Đô Nghỉ dưỡng & Suối Khoáng Hoàng Gia):** Quần thể kiến trúc cung đình quy mô lớn, cầu ngói bắc qua hồ cảnh quan, nhà hát diễn xướng Nhã nhạc cung đình mái vòm rồng uốn lượn.

**Ô 19: Đà Nẵng — BĐS Đô thị & Thương mại**

* **Màu sắc:** Cam Nắng (Warm Orange) | **Icon mặt bàn:** Cầu Rồng phun lửa bắc qua sông.  
* **Cấp 0 (Mặt bằng Lô đất Góc Ven Sông Hàn):** Mặt bằng bê tông trống, bảng phối cảnh dự án tháp thương mại đa quốc gia.  
* **Cấp 1 (Tuyến Shophouse Tài chính Đa Năng):** Dãy nhà phố 4 tầng phong cách châu Âu đương đại, vách kính mặt tiền rộng trưng bày văn phòng dịch vụ.  
* **Cấp 2 (Tháp Đổi Mới Sáng Tạo & Khởi Nghiệp Công Nghệ):** Tòa cao ốc 18 tầng mặt kính xanh lá cây, khối đế bố trí trung tâm hội thảo và không gian làm việc chung (Co-working).  
* **Cấp 3 - Max (Trung tâm Tài chính Quốc tế Bến Sông Hàn):** Siêu tháp tài chính cao 45 tầng thiết kế khí động học hình cánh buồm, đài quan sát trên cao ngắm toàn cảnh các cây cầu.

### **CẠNH 3: TRUNG TÂM GIẢI TRÍ & VÀNH ĐAI BẮC BỘ**

**Ô 21: Thanh Hóa (Sầm Sơn) — BĐS Nghỉ dưỡng & Du lịch**

* **Màu sắc:** Đỏ Đô (Crimson Red) | **Icon mặt bàn:** Hòn Trống Mái & Đợt sóng cuộn.  
* **Cấp 0 (Bãi cát Quảng trường Biển):** Bãi đất rộng sát đại lộ ven biển, cọc cắm mốc ranh giới phân lô dịch vụ.  
* **Cấp 1 (Chuỗi Khách sạn Phố Du lịch Mùa Hè):** Khách sạn mini 6 tầng khối hộp đơn giản, bảng hiệu hộp đèn Led rực rỡ, sảnh đón tour đoàn tấp nập.  
* **Cấp 2 (Resort Nghỉ dưỡng & Công viên Nước 4 Sao):** Khu resort phức hợp có đường trượt nước màu sắc, hồ tạo sóng nhân tạo, dãy biệt thự mái bằng hiện đại.  
* **Cấp 3 - Max (Đại Quần Thể Nghỉ Dưỡng Nam Sầm Sơn 5 Sao):** Khách sạn dạng bậc thang hình cánh cung ôm trọn quảng trường ánh sáng trung tâm, sân golf 18 lỗ ven biển, bến du thuyền riêng.

**Ô 23: Nghệ An (TP. Vinh) — BĐS Đô thị & Thương mại**

* **Màu sắc:** Đỏ Đô (Crimson Red) | **Icon mặt bàn:** Bông Sen vàng & Cổng thành cổ.  
* **Cấp 0 (Đất nền Dự án Đại lộ Lê Nin):** Bãi đất đắp nền phẳng, hàng rào tôn sơn logo đơn vị phát triển BĐS.  
* **Cấp 1 (Tuyến Nhà phố Ngân hàng & Showroom Xe):** Dãy shophouse bề thế mặt tiền rộng 8m, mái ngói đỏ hiện đại, tầng trệt ốp đá hoa cương đen bóng.  
* **Cấp 2 (Tòa tháp Doanh nghiệp & Dịch vụ Vùng Bắc Trung Bộ):** Tòa nhà văn phòng 15 tầng mặt kính màu khói, khối hội nghị liên hiệp các ngành hàng.  
* **Cấp 3 - Max (Đại Trung tâm Thương mại & Khách sạn 5 Sao Xứ Nghệ):** Khối đế thương mại khổng lồ trải dài tráng lệ kết hợp tháp khách sạn 30 tầng có sân đỗ trực thăng trên mái.

**Ô 24: Ninh Bình (Tràng An) — BĐS Nghỉ dưỡng & Du lịch**

* **Màu sắc:** Đỏ Đô (Crimson Red) | **Icon mặt bàn:** Dãy núi đá vôi sừng sững & Con thuyền nan.  
* **Cấp 0 (Thung lũng Hoang sơ Quanh Chân Núi Đá):** Cánh đồng sậy tự nhiên, chân núi đá vôi thẳng đứng soi bóng đầm nước trong.  
* **Cấp 1 (Cụm Homestay Mộc Đồng Lúa):** Những mái nhà tranh lợp từ lá cọ, khung kết cấu bằng tre và gỗ mộc, hiên nhà nhìn ra đầm lúa chín vàng.  
* **Cấp 2 (Resort Di sản Hang Động 4 Sao):** Biệt thự nghỉ dưỡng một tầng ốp đá vôi nguyên khối, hồ bơi tự nhiên khoét sâu vào lòng vách núi.  
* **Cấp 3 - Max (Quần thể Nghỉ dưỡng Sinh thái & Phim trường Quốc tế):** Khu dinh thự phong cách hoàng triều Việt cổ quy mô lớn, điện ngọc lợp ngói mũi hài, cầu đá bắc qua dòng sông ngầm.

**Ô 25: Tuyến Cao Tốc Bắc - Nam — Hạ tầng Giao thông**

* **Màu sắc:** Xám Titan viền Xanh Cyan | **Icon mặt bàn:** Đường cao tốc nhiều làn & Bảng điện tử ETC.  
* **Trạng thái Cơ sở:** 4 làn đường nhựa thẳng tắp, vạch kẻ đường dạ quang, rào hộ lan kim loại kéo dài về chân trời.  
* **Nâng cấp Full (Cao Tốc Thông Minh Toàn Tuyến 6 Làn):** Mở rộng 6-8 làn xe, trạm thu phí không dừng ETC mái vòm hiện đại, hệ thống camera giám sát thông minh và trạm sạc xe điện cao tốc siêu nhanh.

**Ô 26: Hải Phòng — BĐS Dịch vụ & Giải trí**

* **Màu sắc:** Vàng Ánh Kim (Golden Yellow) | **Icon mặt bàn:** Bát bánh đa cua & Biểu tượng Cảng Hoa Phượng.  
* **Cấp 0 (Mặt bằng Chợ Cũ Bến Sông):** Mặt sàn gạch tàu cũ loang lổ bên sông Tam Bạc, vài sạp hàng dựng tạm bằng khung sắt.  
* **Cấp 1 (Phố Đi Bộ & Food Tour Cảng Biển):** Dãy ki-ốt ẩm thực phong cách nhà cổ Pháp thuộc sơn vàng cửa xanh, biển hiệu đèn neon nghệ thuật, bàn ghế gỗ ngoài trời.  
* **Cấp 2 (Tổ hợp Beer Club & Sân khấu Âm nhạc Ven Cảng):** Không gian nhà xưởng cải tạo phong cách công nghiệp (Industrial Style), quầy bar container, sân khấu ca nhạc ngoài trời.  
* **Cấp 3 - Max (Quần thể Kinh Tế Đêm Không Ngủ Cảng Biển):** Trung tâm vui chơi phức hợp sáng rực ánh đèn cả đêm, các câu lạc bộ giải trí cao cấp, sàn nhảy trên sân thượng hướng toàn cảnh thành phố cảng.

**Ô 27: Kiên Giang (Phú Quốc Grand World) — BĐS Dịch vụ & Giải trí**

* **Màu sắc:** Vàng Ánh Kim (Golden Yellow) | **Icon mặt bàn:** Chiếc thuyền Gondola & Mặt nạ lễ hội.  
* **Cấp 0 (Mặt bằng Sân bãi Biển Đảo Bãi Dài):** Bãi đất rộng nhìn ra biển mở, cọc định vị các tuyến phố giải trí.  
* **Cấp 1 (Phố Mua Sắm Rực Rỡ Sắc Màu Kênh Đào):** Dãy nhà phố rực rỡ màu sắc theo phong cách Venice, dòng kênh đào nhân tạo có cầu đá bắc qua.  
* **Cấp 2 (Vũ trường Bãi biển & Sân khấu Thực cảnh 3D):** Khán đài nhạc nước ngoài trời với hệ thống quạt nước công nghệ laser, tổ hợp beach club bãi cát trắng náo nhiệt.  
* **Cấp 3 - Max (Siêu Quần Thể Giải Trí Không Ngủ & Corona Casino):** Tòa nhà Casino phát sáng ánh vàng kim lộng lẫy, khu thương mại 24/7 sầm uất với các đoàn xe diễu hành carnaval hoa lệ.

**Ô 28: Tập Đoàn Viễn Thông (Viettel) — Tiện ích Số hóa**

* **Màu sắc:** Xanh Coban Điện Tử | **Icon mặt bàn:** Trạm phát sóng viễn thông & Sóng 5G.  
* **Trạng thái Cơ sở:** Cột ăng-ten tháp thép truyền thống gắn các đĩa thu phát sóng parabol, nhà điều hành trạm dưới mặt đất.  
* **Nâng cấp Full (Hạ Tầng Dữ Liệu AI & Mạng Lưới 5G Siêu Tốc):** Tháp viễn thông thông minh tích hợp đèn LED chuyển động, cụm trung tâm dữ liệu kiến trúc hộp kính ngầm, sóng năng lượng số lan tỏa.

**Ô 29: Quảng Ninh (Hạ Long) — BĐS Nghỉ dưỡng & Du lịch**

* **Màu sắc:** Vàng Ánh Kim (Golden Yellow) | **Icon mặt bàn:** Đảo đá Vịnh Hạ Long & Du thuyền 3 cánh buồm.  
* **Cấp 0 (Bờ biển Đất đỏ Nhìn ra Vịnh Di sản):** Dải đồi đất nhìn thẳng xuống các đảo đá vôi kỳ vĩ trên biển, cọc bê tông khoanh vùng.  
* **Cấp 1 (Chuỗi Mini Hotel Phố Cổ Bãi Cháy):** Khách sạn boutique 7 tầng bề mặt ốp đá hoa cương, phố đi bộ trước mặt lót đá granite với dãy quán cà phê ngắm vịnh.  
* **Cấp 2 (Khu Nghỉ dưỡng Onsen Khoáng Nóng 4 Sao):** Biệt thự vườn Nhật Bản thấp tầng, bể tắm khoáng lộ thiên bốc khói nghi ngút bên vách đá tự nhiên.  
* **Cấp 3 - Max (Quần thể Khách sạn Biển 5 Sao & Bến Du Thuyền Quốc Tế):** Tòa khách sạn hình cung ngọc bích soi bóng nước vịnh, cầu cảng riêng neo các siêu du thuyền quốc tế triệu đô.

### **CẠNH 4: TRỤC ĐÔ THỊ LÕI HÀ NỘI & TP. HỒ CHÍ MINH**

**Ô 31: Hưng Yên (Văn Giang) — BĐS Đô thị & Thương mại**

* **Màu sắc:** Xanh Lục Bảo (Emerald Green) | **Icon mặt bàn:** Đợt sóng Biển hồ nước mặn nhân tạo.  
* **Cấp 0 (Đất nền Khu Đô thị Sinh thái Mới):** Quỹ đất san nền hàng ngàn hecta, cống ngầm hạ tầng đã hoàn thiện, trục đường chính trải nhựa.  
* **Cấp 1 (Dãy Shophouse Ven Biển Hồ Nhân Tạo):** Nhà phố 4 tầng phong cách Địa Trung Hải vát góc, mái ngói nâu, vỉa hè rộng trồng cọ và dừa cảnh.  
* **Cấp 2 (Tòa Tháp Căn Hộ Xanh & Văn Phòng Thông Minh):** Khối chung cư cao cấp 25 tầng mặt đứng phủ cây xanh thẳng đứng (Vertical Garden), kính cản nhiệt Low-E bóng loáng.  
* **Cấp 3 - Max (Đại Đô Thị Sinh Thái Phức Hợp Kỳ Quan):** Quần thể tháp đôi trung tâm, hồ bơi nước mặn nhân tạo rộng mênh mông, công viên ánh sáng lung linh bao quanh khối tháp tài chính.

**Ô 32: Hà Nội (Cầu Giấy) — BĐS Đô thị & Thương mại**

* **Màu sắc:** Xanh Lục Bảo (Emerald Green) | **Icon mặt bàn:** Vi mạch công nghệ & Tháp văn phòng.  
* **Cấp 0 (Lô đất Vàng Mặt phố Duy Tân):** Lô đất vuông vức sạch sẽ, tường rào quây tôn chống bụi in hình phối cảnh tháp công nghệ.  
* **Cấp 1 (Tuyến Nhà phố Ngân hàng & Showroom Công Nghệ):** Dãy nhà phố 5 tầng mặt tiền khung nhôm kính hiện đại, biển hiệu các công ty lập trình và bảo hiểm.  
* **Cấp 2 (Tòa Tháp Văn Phòng Hạng A Đa Quốc Gia):** Cao ốc 28 tầng khối vuông vức ốp kính xanh râm mát, sảnh đón lễ tân cao 3 tầng với cửa xoay tự động.  
* **Cấp 3 - Max (Tổ hợp Trụ Sở Kỳ Lân Công Nghệ & Trung Tâm AI):** Khối tháp biểu tượng 45 tầng gắn hệ thống đèn led ma trận dữ liệu bao quanh, sân thượng tích hợp vườn kính khí hậu và trung tâm siêu máy tính.

**Ô 34: Hà Nội (Hoàn Kiếm) — BĐS Đô thị & Thương mại**

* **Màu sắc:** Xanh Lục Bảo (Emerald Green) | **Icon mặt bàn:** Tháp Rùa cổ kính & Cành lộc vừng.  
* **Cấp 0 (Mặt bằng Lõi Trung Tâm 36 Phố Phường):** Khối đất mặt tiền phố cổ với bức tường vôi rêu phong đặc trưng, cửa gỗ sơn then cài chắc chắn.  
* **Cấp 1 (Nhà Cổ Mặt Phố Kinh Doanh Hàng Hiệu Di Sản):** Nhà phố Pháp cổ 3 tầng với ban công sắt uốn hoa văn, tường vàng cửa gỗ lim, cửa hàng thời trang sang trọng tầng 1.  
* **Cấp 2 (Khách sạn Boutique Di Sản & Khối Dịch Vụ Kim Hoàn):** Khách sạn di sản 6 tầng kiến trúc Tân cổ điển tinh tế, đèn chùm pha lê tiền sảnh rực rỡ, tiệm kim hoàn trưng bày đá quý.  
* **Cấp 3 - Max (Đại TTTM Quốc Tế Tràng Tiền - Hàng Bài):** Trung tâm mua sắm biểu tượng mái vòm cổ điển đồ sộ kiểu Beaux-Arts, ốp đá cẩm thạch Ý sang trọng, đèn chiếu sáng kiến trúc lộng lẫy bậc nhất Thủ đô.

**Ô 35: Cảng HKQT Nội Bài — Hạ tầng Giao thông**

* **Màu sắc:** Xám Titan viền Xanh Cyan | **Icon mặt bàn:** Nhà ga hình cánh chim & Tháp không lưu.  
* **Trạng thái Cơ sở:** Nhà ga T1 truyền thống mái chữ V vươn dài, đường dẫn xe lăn và sân đỗ máy bay thương mại thông thường.  
* **Nâng cấp Full (Nhà Ga Quốc Tế T2 Mở Rộng & Logistics Hàng Không):** Nhà ga mới kết cấu mái vòm kính siêu lớn lấy sáng tự nhiên, 2 nhánh cầu dẫn ống lồng mở rộng, trung tâm xử lý hàng hóa tự động hóa bằng robot.

**Ô 37: TP.HCM (TP. Thủ Đức) — BĐS Đô thị & Thương mại**

* **Màu sắc:** Tím Hoàng Gia (Royal Purple) | **Icon mặt bàn:** Tấm Wafer Bán Dẫn & Cầu Ba Son.  
* **Cấp 0 (Đất nền Đô thị Đổi mới Sáng tạo):** Mặt bằng rộng lớn cạnh trục Xa Lộ Hà Nội và Metro, cọc cắm phân lô khu công viên khoa học.  
* **Cấp 1 (Nhà Phố Thương Mại Dịch Vụ Công Nghệ & F&B):** Dãy phố dịch vụ 4 tầng thiết kế tối giản phẳng hiện đại, tập trung các quán cafe trí thức và trung tâm thiết kế ứng dụng.  
* **Cấp 2 (Trung Tâm R&D Bán Dẫn & Tháp Nghiên Cứu Vi mạch):** Khối nhà văn phòng 16 tầng vách kính cách nhiệt hoa văn bảng mạch điện tử, sảnh đón robot kiểm soát thẻ từ tự động.  
* **Cấp 3 - Max (Tháp Đổi Mới Sáng Tạo Quốc Tế & Vườn Ươm Tri Thức):** Siêu tháp đôi kiến trúc hình xoắn kép ADN cao 50 tầng kết nối bằng cầu kính trên không, tích hợp trung tâm thực nghiệm không gian vũ trụ.

**Ô 39: TP.HCM (Quận 1 - Nguyễn Huệ) — BĐS Đô thị & Thương mại**

* **Màu sắc:** Tím Hoàng Gia (Royal Purple) | **Icon mặt bàn:** Tòa tháp Bitexco & Hoa sen kính vươn cao.  
* **Cấp 0 (Đất Vàng Trục Đường Phố Đi Bộ Nguyễn Huệ):** Khu đất "kim cương" trải thảm đá hoa cương được rào chắn bằng pano nhôm cao cấp in hình bản đồ phát triển tương lai.  
* **Cấp 1 (Tuyến Shophouse Hàng Hiệu Xa Xỉ Toàn Cầu):** Chuỗi cửa hàng 4 tầng mặt tiền ốp kính trong suốt trưng bày đồng hồ xa xỉ và thời trang haute couture quốc tế.  
* **Cấp 2 (Khách sạn Di Sản 5 Sao & Khối Tài Chính Hạng A):** Khối kiến trúc biểu tượng 12 tầng phong cách Pháp hoa lệ, thảm đỏ tiền sảnh túc trực xe limousine đón khách VIP.  
* **Cấp 3 - Max (Siêu Cao Ốc Chọc Trời Phức Hợp Biểu Tượng A+):** Tòa tháp chọc trời kính đa diện cao 81 tầng xuyên qua tầng mây, tích hợp đài quan sát 360 độ toàn thành phố, sân đỗ trực thăng kép và đài phun nước nghệ thuật rực rỡ tại chân tháp.

### **BẢNG TỔNG KẾT KHUNG VẬT PHẨM (TOKEN KIẾN TRÚC) THEO 3 NHÓM CHÍNH**

Khi chế tác phụ kiện vật lý (nhựa đúc, gỗ hoặc in 3D) đặt lên bàn cờ, bạn chỉ cần sản xuất 3 bộ mô hình theo quy chuẩn sau:

| Loại hình tài sản | Hình khối Token Cấp 1 | Hình khối Token Cấp 2 | Hình khối Token Cấp 3 (Biểu tượng) |
| :---- | :---- | :---- | :---- |
| **Nhóm Đô thị & Thương mại** | Khối nhà phố 1 tầng hình hộp chữ nhật | Khối cao ốc 2 tầng vách kẻ chỉ kính | Khối tháp chọc trời chóp nhọn mạ vàng |
| **Nhóm Dịch vụ & Giải trí** | Khối quầy lều mái vòm cong | Khối rạp vòm có bánh đà đu quay mini | Khối lâu đài / vương miện đèn LED vàng |
| **Nhóm Nghỉ dưỡng & Du lịch** | Khối nhà sàn / bungalow mái dốc | Khối resort giật cấp có mặt hồ bơi xanh | Khối khách sạn hình cánh buồm uốn lượn |
| **Gói Hạ tầng Giao thông** | — | — | Token Trạm Thu Phí / Radar xoay màu Bạc |
| **Gói Tiện ích Năng lượng** | — | — | Token Cột Sóng / Tua-bin gió phát sáng |

### **CÁC HỆ THỐNG MỸ THUẬT & ÂM THANH BỔ TRỢ**

**1. Hệ thống Hiệu ứng Thị giác Khánh thành (Mega Project VFX)**

* **Đối tượng áp dụng:** Kích hoạt khi người chơi hoàn thành nâng cấp công trình lên Cấp 3 - Max tại bất kỳ ô tài sản nào trên bàn cờ.  
* **Quy chuẩn hiệu ứng:**  
  * **Camera Event:** Camera tự động thu nhỏ độ cao và hướng tiêu cự vào ô đất vừa nâng cấp trong 2,5 giây.  
  * **Particle Effect:** Khối công trình phát xung ánh sáng hào quang (Golden Glow Shader), kèm hiệu ứng pháo hoa hạt 2D dạng giấy màu bay lượn quanh standee billboard.  
  * **World Canvas Banner:** Xuất hiện dải ruy-băng 3D "KHÁNH THÀNH ĐẠI DỰ ÁN" lơ lửng phía trên mô hình trong 3 giây trước khi trở về trạng thái quan sát tiêu chuẩn.

**2. Hệ sinh thái Âm thanh Môi trường Thích ứng (Dynamic Regional Audio)**  
Hệ thống âm thanh tự động chuyển đổi nhạc nền (Crossfade 1,5 giây) dựa theo vị trí dừng chân của quân cờ trên 4 cạnh địa lý:

* **Cạnh 1 (Tây Nam Bộ):** Tiết tấu êm dịu, sử dụng âm sắc chủ đạo từ đàn kìm, tiếng nước vỗ mạn thuyền và âm thanh nhộn nhịp chợ nổi bến sông.  
* **Cạnh 2 (Duyên hải Miền Trung):** Âm hưởng phóng khoáng, tiếng gió rặng phi lao, sóng biển rì rào kết hợp tiếng đàn bầu nhẹ nhàng, tạo cảm giác nghỉ dưỡng sinh thái.  
* **Cạnh 3 (Bắc Trung Bộ & Cửa ngõ phía Bắc):** Nhịp điệu trang nghiêm, kết hợp âm hưởng cồng chiêng, nhạc cụ gõ dân gian và tiếng chim muông sinh thái Tràng An.  
* **Cạnh 4 (Đô thị lõi Hà Nội - TP.HCM):** Giai điệu Lofi/Jazz hiện đại, tiết tấu nhanh, kết hợp âm thanh giao thông đô thị năng động phản ánh trung tâm tài chính và thương mại.

**3. Bộ nhận diện Quân cờ & Biểu cảm Tương tác (Tokens & Social Emotes)**

* **Bộ sưu tập Token Quân cờ Văn hóa Việt:**  
  * **Xe máy tay côn / Xe số cổ điển:** Biểu tượng giao thông đô thị đặc trưng.  
  * **Ghe tam bản / Ca nô cao tốc:** Biểu tượng vận tải sông nước miền Nam.  
  * **Nón lá dát vàng:** Biểu tượng truyền thống cách điệu thương mại.  
  * **Tàu container mini:** Biểu tượng ngành logistics và cảng biển.

**Hệ thống Biểu cảm Nhanh (Social Emotes):** Tích hợp bảng icon động 2D xuất hiện trên đầu avatar người chơi để tương tác xã hội (Cười, Bắn tim, Lo sợ khi vào Trạm Kiểm Toán, Kêu cứu khi sắp phá sản).

---

### **IV. QUY CHUẨN GIAO DIỆN 2D CỜ BÀN & CHỈ BÁO SỞ HỮU 3D (IMP-58, IMP-61, IMP-63)**

1. **Tabletop Bright Theme SSOT (`TABLETOP_THEME`):**
   - **Chất liệu & Màu sắc:** Chuyển đổi toàn diện từ Dark Mode sang phong cách cờ bàn truyền thống giấy ngà `#FFFDF8` và bìa kem ấm `#F7F2E7`, viền mực đen 2px `border-slate-900`.
   - **Đổ bóng xúc giác phẳng (Tactile Shadows):** Nút bấm và thẻ bài dùng bóng dập nổi cứng `shadow-[0_4px_0_0_#...]`, lún vật lý khi nhấn `active:translate-y-[3px]` / `active:translate-y-[4px]`.
   - **Độ tương phản cao:** Toàn bộ chữ số tài chính in mực đen đậm `#0F172A` (`tabular-nums font-mono`), loại bỏ hoàn toàn chữ xám mờ trên nền tối.
   - **Các bố cục cờ bàn chuyên biệt:**
     * *Thẻ Sổ Đỏ (TitleDeedModal):* Bố cục Monopoly cổ điển (dải ribbon màu địa phương, bảng phí C0-C3 mực đen, con dấu danh dự "SỔ ĐỎ CHÍNH CHỦ" khi đã có chủ).
     * *Đàm phán (TradeModal):* 2 thảm nỉ riêng biệt (Thảm xanh Bạn vs Thảm đỏ Đối thủ), thẻ BĐS mini nhấc nổi, cọc tiền giấy đồ chơi nút nạp nhanh (+100, +500).
     * *Đấu giá (AuctionModal):* Bục hội chợ cờ bàn vàng kem `#FFFBEB` và bảng lật số retro lớn `data-testid="flip-counter"`.
     * *Nhật ký hành trình (ActivityFeedSidebar):* Cuốn sổ ký sự giấy kraft `#FBF7EE` gáy may chỉ.
     * *Cảnh báo vỡ nợ (InsolvencyBanner):* Phong bì ngân hàng viền sọc bưu điện đỏ-trắng.

2. **Chỉ Báo Sở Hữu Trên Sa Bàn 3D (IMP-58):**
   - **Cọc cờ vải PBR (`FlagCloth`):** Render tại góc ô cờ đã có chủ, nhận đúng màu quân cờ (`tokenColor`) của chủ sở hữu.
   - **Vòng đai hoàng kim (`TierIndicatorRings`):** Thân cọc cờ đồng thau gắn các vòng đai chỉ báo cấp độ công trình C0-C3 từ xa.
   - **Viền chân đế kim loại (`OwnerBaseTrim`):** Ôm sát chân đế đá ngà voi của ô cờ để nhận diện phân khu sở hữu.

3. **Nguyên Tắc Hiệu Năng HUD Nổi (Zero Blur Invariant - IMP-63):**
   - Triệt tiêu 100% `backdrop-blur` trên các lớp HUD DOM nổi trên WebGL Canvas (`TopBar`, `ActionDock`, `PlayerCard`, `SocialEmotesTray`, `ModalBackdrop`).
   - `ModalBackdrop` dùng lớp phủ phẳng trong suốt nhẹ `bg-slate-900/15`, vừa phân tách rõ nét vừa giữ cho sa bàn 3D ngoài trời luôn ngập tràn ánh nắng và giải phóng tài nguyên GPU duy trì ổn định 60 FPS.