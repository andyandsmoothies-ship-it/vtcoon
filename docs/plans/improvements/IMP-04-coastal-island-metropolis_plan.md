# [KẾ HOẠCH CẢI TIẾN IMP-04] BÁN ĐẢO ĐÔ THỊ BIỂN NHIỆT ĐỚI & SA BÀN VĂN HÓA ĐỊA PHƯƠNG (GÓI 1)

## 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT

Bản đánh giá đối kháng độc lập từ Subagent `game-3d-visual-critic` chỉ ra sa bàn 3D ban đầu của VTCOON mang ngoại hình "phòng kín thập niên 2000" (điểm số 3.5/10):
- Bàn cờ tối tăm trên nền `#080C14`.
- Núi nón 8 mặt gãy góc low-poly.
- Công trình C3 chỉ là khối hộp đen đơn điệu với vòng tròn vàng lơ lửng.
- Trung tâm bàn cờ thưa thớt, thiếu linh hồn đô thị biển Việt Nam.
- Sảnh chờ đục ngầu che khuất toàn bộ không gian 3D phía sau.

Mục tiêu của IMP-04 là đại phẫu toàn diện thẩm mỹ sa bàn 3D, chuyển đổi thành **Bán Đảo Đô Thị Biển Nhiệt Đới (Vietnamese Coastal Island Metropolis)** theo chuẩn tham chiếu quốc tế Retropoly, nâng tầm trải nghiệm thị giác lên chuẩn thương mại cao cấp.

---

## 2. PHÂN RÃ CÁC HẠNG MỤC CẢI TIẾN

```text
[Bán Đảo Vịnh Biển Nhiệt Đới]
  ├── Bầu trời xanh lơ #7DD3FC, nắng ấm nhiệt đới 5500K & bãi cát vàng
  ├── Dãy núi 32 phân đoạn, vách đá nẹp sườn & vành đai 15 cây thông
  ├── Tuyến đường sắt xuyên núi qua Cổng Hầm Đá Vòm & đoàn tàu mini 3 toa
  ├── Sa bàn đô thị trung tâm:
  │     ├── Quần thể Tháp Đôi Landmark C3 Art Deco (Champagne Gold & Kính Sapphire)
  │     ├── Sân vận động thể thao vát mái buồm, mặt cỏ carô & 4 cột đèn LED 45 độ
  │     ├── Vòng đu quay Ferris Wheel 8 cabin đa sắc xoay liên tục
  │     ├── Tháp đồng hồ Chợ Bến Thành & Nhà thờ kiến trúc Đông Dương
  │     └── Cảng Cát Lái với 2 cần cẩu giàn gantry & bãi container 3 tầng
  └── Sảnh chờ Glassmorphism xuyên thấu sa bàn 3D đón ánh nắng
```

### 1. Bầu Trời, Địa Hình Bán Đảo & Rặng Núi
- **Tệp can thiệp**: `src/client/3d/coastal_island_environment.tsx`, `src/client/3d/diorama/diorama_terrain.tsx`.
- **Nghiệp vụ**:
  * Chuyển đổi môi trường từ phòng tối sang vịnh biển ngọc bích mở rộng, bờ cát vàng mịn màng với dù che nắng và ghế nghỉ ven biển.
  * Tăng độ phân giải hình học của rặng núi từ 8 lên 32 phân đoạn, nẹp vách đá xám sườn núi và phủ vành đai 15 cây thông rậm rạp che phủ mối nối giữa chân núi và thảm cỏ sa bàn.
  * Đưa cụm mây trắng xốp bồng bềnh lên cao độ Y = 19 - 24 và dải sương mù nhẹ lơ lửng sườn đồi.

### 2. Tuyến Đường Sắt Đôi & Hầm Xuyên Núi
- **Tệp can thiệp**: `src/client/3d/diorama/diorama_bridges.tsx`, `src/client/3d/diorama/miniature_city_diorama.tsx`.
- **Nghiệp vụ**:
  * Kết nối tuyến đường sắt đôi vào lòng núi qua **Cổng Hầm Đá Vòm Bán Nguyệt (Stone Arch Tunnel Portal)**.
  * Bố trí **Đoàn Tàu Chở Hàng Mini 3 Toa (Mini Cargo Train)** màu đỏ cam, vàng và xanh lá đang chạy trên đường ray.

### 3. Đại Phẫu Kiến Trúc Landmark C3 (Hoàng Kim)
- **Tệp can thiệp**: `src/client/3d/diorama/diorama_skyline.tsx`, `src/client/3d/procedural_building.tsx`.
- **Nghiệp vụ**:
  * Xóa bỏ khối hộp đen thô cứng và vòng vàng dẹt lơ lửng.
  * Xây dựng quần thể Tháp Đôi mang âm hưởng Art Deco: Tháp ngà Ivory Cream kết hợp Champagne Gold, vách kính sapphire PBR, cầu kính trên không Skybridge kết nối 2 tháp, đỉnh chóp kim tự tháp xoay nhẹ đón nắng và hiệu ứng bụi vàng lấp lánh đỉnh tháp.

### 4. Quần Thể Đô Thị Văn Hóa & Thể Thao Trung Tâm
- **Tệp can thiệp**: `src/client/3d/diorama/diorama_stadium.tsx`, `src/client/3d/diorama/diorama_ferris_wheel.tsx`, `src/client/3d/diorama/diorama_heritage_district.tsx`, `src/client/3d/diorama/diorama_container_port.tsx`.
- **Nghiệp vụ**:
  * **Sân vận động:** Cắt vát mái che cánh buồm để phô diễn trọn vẹn mặt sân bóng đá kẻ sọc carô hai tông xanh, vòng tròn trung tâm và 4 cụm cột đèn LED nghiêng góc 45 độ rọi sáng mặt sân.
  * **Vòng đu quay Ferris Wheel:** Thu gọn tỷ lệ về scale 0.76 với 8 cabin đa sắc xoay liên tục quanh trục mạ vàng.
  * **Khu Di sản Văn hóa:** Tái hiện Tháp đồng hồ Chợ Bến Thành 3 tầng ngói đỏ và Nhà thờ phong cách Đông Dương tường gạch đỏ nung với cửa sổ hoa hồng sapphire.
  * **Cảng Cát Lái:** 2 cần cẩu giàn gantry cam/vàng bốc dỡ hàng hải, cụm container xếp tầng 2-3 lớp.

### 5. Sảnh Chờ Glassmorphism Xuyên Thấu
- **Tệp can thiệp**: `src/client/ui/lobby/lobby_view.tsx`.
- **Nghiệp vụ**:
  * Lớp nền sảnh chờ chuyển sang kính mờ đón nắng `bg-sky-950/20 backdrop-blur-[5px]`.
  * Sa bàn 3D chạy live dưới nền sảnh chờ tạo trải nghiệm thị giác liền mạch 100% khi bước vào trận đấu.

---

## 3. RÀNG BUỘC KỸ THUẬT & NGHIỆM THU

- Tốc độ khung hình: Đảm bảo 60 FPS ổn định trên WebGL.
- Giữ vững ngân sách dòng mã 5-Tier: Các component UI/3D <= 500 LOC.
- Thẩm định mỹ thuật từ `game-3d-visual-critic`: Đạt điểm số >= 8.0/10.
