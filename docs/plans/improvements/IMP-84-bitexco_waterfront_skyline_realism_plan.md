# [PLAN] IMP-84: Tái Thiết Kế Phối Cảnh Bitexco Búp Sen Ven Sông & Quần Thể Cao Ốc Chân Thực (Bitexco Waterfront Realism & Surrounding Skyline Redesign)

## 1. BỐI CẢNH & YÊU CẦU
Người dùng cung cấp ảnh thực tế bờ sông Sài Gòn nhìn sang Bến Bạch Đằng / Bitexco (`media_1789512514037.jpg`) và yêu cầu:
> *"thiết kế lại phối cảnh bitextco và các tòa nhà xung quanh theo ảnh này"*

### Phân tích hiện trạng và hình ảnh thực tế:
1. **Tháp Bitexco (Thực tế vs Hiện tại)**:
   - *Hiện tại*: Thân tháp là hình trụ đơn giản (`cylinderGeometry [0.30, 0.48, 2.2]`) và chóp nón thô sơ, màu xanh sapphire đậm đồng nhất (`#0284C7`), thiếu độ vát cong khí động học và vẻ thanh thoát của búp sen.
   - *Ảnh thực tế*: Tòa tháp có dáng búp sen cong khí động học với hai lớp cánh sen ôm lấy nhau, mặt kính phản quang màu xanh băng tuyết / xám bạc ngọc bích (`#38BDF8`, `#7DD3FC`, `#BAE6FD`, `#E2E8F0`), các đường chỉ đứng mullion tinh xảo, sân đỗ trực thăng chìa vươn ra hướng sông hình đĩa bay có kết cấu khung đỡ vát xiên bên dưới và trực thăng mini đậu trên sàn, đỉnh tháp vát xéo cong vuốt nhọn tựa cánh sen hé nở kèm kim thu lôi và đèn cảnh báo tĩnh không đỏ.
2. **Tiền cảnh bờ sông & Tòa nhà Di sản (Colonial Heritage Waterfront Building)**:
   - *Hiện tại*: Thiếu tòa nhà di sản mang phong cách kiến trúc Pháp cổ điển ngay trước mặt Bitexco sát bờ sông.
   - *Ảnh thực tế*: Ngay phía trước Bitexco bên mép sông là tòa nhà di sản kiến trúc cổ kính với mái ngói đỏ đất nung terracotta (`#C2410C` / `#EA580C`), tường sơn vàng kem / mù tạt nhạt (`#FEF08A` / `#FDE047`), hệ cửa vòm trang trọng, rặng cây xanh rợp bóng bờ kè và bến tàu thủy buýt Saigon Waterbus đậu đón khách.
3. **Quần thể cao ốc xung quanh (Surrounding High-Rise Skyline)**:
   - *Hiện tại*: Các khối cao ốc ngẫu nhiên với màu sơn vàng cam Art Deco chưa bám sát bố cục thực tế trong ảnh.
   - *Ảnh thực tế*:
     - *Phía bên phải*: Khối cao ốc văn phòng hiện đại khung trắng kính xanh lục ngọc bích (phong cách Bitraco / Sunwah), phía sau là tháp kính xanh sapphire vươn cao, khối khách sạn đá sáng.
     - *Phía bên trái*: Tòa cao ốc hình hộp thanh lịch với hệ lam đứng chắn nắng màu xám trung tính (`#94A3B8`, `#64748B`), cùng các mái nhà di sản thấp tầng lúp xúp xen lẫn tán cây xanh.

---

## 2. PRE-FLIGHT BLAST RADIUS AUDIT
- **Mức độ rủi ro**: Slice-Bound (Độc lập trong phân hệ 3D Diorama).
- **Tác động trực tiếp**:
  - `src/client/3d/diorama/diorama_skyline.tsx`
  - `src/client/3d/diorama/diorama_highrise_blocks.tsx`
- **Người tiêu thụ hạ tầng (Downstream Consumers)**:
  - `src/client/3d/miniature_city_diorama.tsx` (Render tổ hợp)
  - `tests/contracts/imp69_bitexco_skyline_and_cathedral_standout.test.ts`
  - `tests/contracts/imp71_lighting_skyline_traffic_and_special_tile_art.test.ts`
- **Kế hoạch phòng vệ xấu nhất (Worst-Case Defense)**:
  - Bảo lưu 100% tọa độ trọng tâm Bitexco `[-4.5, 0.16, -4.4]`.
  - Bảo lưu các testid: `bitexco-podium`, `bitexco-plaza`, `highrise-prismatic`, `highrise-stepped`, `highrise-curved`, `highrise-crowned`.
  - Giữ nguyên số lượng đúng 10 tháp cao ốc xung quanh, khoảng cách `>= 0.85m` so với tâm Bitexco, `z <= -2.4`, `0 < height <= 2.8`.
  - Giới hạn độ dài tệp: `diorama_skyline.tsx` <= 500 LOC, `diorama_highrise_blocks.tsx` <= 400 LOC.

---

## 3. THIẾT KẾ CHI TIẾT KIẾN TRÚC & PHỐI CẢNH 3D

```
[Bờ Sông Sài Gòn X: -0.9 .. 0.9]
         ^
         |
[Bến Tàu & Saigon Waterbus] + [Tòa Di Sản Mái Ngói Terracotta X: -3.8, Z: -3.8]
         ^
         |
[Quảng Trường Granite & Khối Đế Podium Bitexco]
         ^
         |
[Tháp Bitexco Búp Sen: 2 Lớp Cánh Sen Cong Khí Động Học + Sân Trực Thăng Cantilever + Đỉnh Vát Cánh Sen]
    /         \
   v           v
[Cánh Trái: Tháp Lam Đứng Xám]   [Cánh Phải: Tháp Khung Trắng Kính Lục + Tháp Sapphire]
```

### A. Tháp Bitexco Búp Sen (`diorama_skyline.tsx`):
- **Cấu trúc cánh sen khí động học**: Thân tháp cấu tạo từ 2 lớp vỏ lồng ghép:
  - Thân chính thon cong vát nhẹ từ chân lên eo, nở nhẹ ở tầng đài quan sát Skydeck rồi vuốt thon lên đỉnh.
  - Vỏ kính bán nguyệt ôm lưng vát cong (`bitexco-lotus-sheath`) tạo hiệu ứng 2 cánh sen ôm nhau.
  - Mặt kính sử dụng màu Cyan / Ice Blue ánh bạc (`#38BDF8`, `#7DD3FC`, `#BAE6FD`), kết hợp với kim loại phản quang `#E2E8F0` và lõi sapphire `#0284C7`.
- **Sân đỗ trực thăng Helipad Cantilever**:
  - Đĩa tròn đỗ trực thăng nhô hẳn ra ngoài thân tháp tại `position={[0.38, 1.68, 0]}`.
  - Khung đỡ hình nón cụt / dầm giàn xiên (`helipad-truss`) chống đỡ phía dưới.
  - Vành phản quang và vòng đỗ trực thăng màu vàng cam `#F59E0B`.
  - Mô hình máy bay trực thăng siêu vi mô (`micro-helicopter`): thân trực thăng `#EF4444` hoặc `#F8FAFC`, cánh quạt chính 2 cánh `#334155`, cánh quạt đuôi và càng đáp.
- **Đài quan sát Saigon Skydeck**:
  - Dải kính quan sát panorama 360 độ tại độ cao `y = 1.48` bằng kính xanh `#38BDF8`.
- **Đỉnh tháp búp sen vát xéo (Curved Slanted Crown)**:
  - Đỉnh tháp cắt vát chéo vươn lên nhọn như cánh sen mở hé.
  - Kim thu lôi mạ vàng `#F59E0B` vươn cao đến đỉnh `y = 2.85`.
  - Đèn cảnh báo tĩnh không đỏ nhấp nháy `#EF4444` tại `y = 2.95`.

### B. Tòa Nhà Di Sản Bờ Sông Mái Ngói Terracotta (`ColonialWaterfrontBuilding`):
- Tọa độ: Đặt tại tiền cảnh hướng sông của Bitexco (`position={[-3.8, 0.16, -3.8]}`).
- Kiến trúc Indochine / Thuộc địa Pháp:
  - Mái dốc 4 phía ngói đỏ đất nung Terracotta (`#C2410C` / `#EA580C`).
  - Khối tường màu vàng kem / vàng mù tạt nhạt đặc trưng kiến trúc Sài Gòn xưa (`#FEF08A` / `#FDE047`).
  - Dãy cửa vòm cuốn vôi trắng (`#F8FAFC`).
  - Ban công con tiện và phào chỉ cổ điển.
- Kè đá & Tàu Saigon Waterbus đón khách ven sông:
  - Cầu tàu nổi lát đá dẫn ra mép nước.
  - Thuyền buýt đường sông Saigon Waterbus vỏ trắng viền xanh dương (`#0284C7` / `#F8FAFC`) cập mạn bến.
  - Hàng cây xanh nhiệt đới tán rộng tạo mảng xanh rợp mát ven bờ sông.

### C. Quần Thể Cao Ốc Xung Quanh (`diorama_highrise_blocks.tsx`):
- Cân chỉnh 10 tháp cao ốc tương ứng góc nhìn ảnh thực tế:
  - **Cánh phải (Northeast)**:
    - `tower-3`: Cao ốc văn phòng kính ô vuông xanh ngọc bích (Emerald / Teal Glass `#0D9488` / `#14B8A6`) với khung bê tông trắng sắc nét phong cách Bitraco.
    - `tower-2`: Tháp cao kính xanh sapphire đậm hậu cảnh (`#1E3A8A` / `#0284C7`) vươn cao 2.6m.
    - `tower-6`: Khối cao ốc giật cấp mặt cong kính pha lê.
  - **Cánh trái (Southwest)**:
    - `tower-1`: Tháp lăng kính hiện đại với hệ lam nhôm đứng chắn nắng màu xám kim loại (`#94A3B8` / `#64748B`).
    - `tower-4`, `tower-5`: Khối văn phòng thanh lịch kết hợp giật cấp vườn treo sinh thái.
  - **Hàng trước & Hậu cảnh**: Cân đối độ cao thoai thoải để không che khuất tháp Bitexco từ camera chính.

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (UNIVERSAL 4-FACET MATRIX)
Tại `tests/contracts/imp84_bitexco_waterfront_skyline_realism.test.ts` (tối thiểu 16 atomic tests):
- **Facet 1: Tháp Bitexco Búp Sen Khí Động Học & Kính Băng Tuyết (4 tests)**
- **Facet 2: Sân Đỗ Trực Thăng Cantilever & Trực Thăng Siêu Vi Mô (4 tests)**
- **Facet 3: Tòa Nhà Di Sản Mái Ngói Terracotta & Bến Tàu Ven Sông (4 tests)**
- **Facet 4: Quần Thể Cao Ốc Bao Quanh Bám Sát Ảnh Thực Tế & Bảo Toàn Quy Chuẩn (4 tests)**
