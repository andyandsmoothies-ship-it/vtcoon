# [KẾ HOẠCH CẢI TIẾN IMP-06] CHU KỲ THỜI GIAN TRONG NGÀY & ĐÔ THỊ NEON PHÁT QUANG (GÓI B)

## 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT

Trò chơi trước đây chỉ có duy nhất một thiết lập ánh sáng ban ngày tĩnh. Bàn cờ không thể hiện được vẻ đẹp tráng lệ của các đô thị biển Việt Nam khi lên đèn (như TP.HCM ven sông Sài Gòn hay Đà Nẵng bên sông Hàn).

Mục tiêu của IMP-06 là xây dựng **Hệ Thống Ánh Sáng Động 3 Pha (Dynamic Time-of-Day)** kết hợp với **Đô Thị Phát Quang Ban Đêm (Neon Metropolis)**:
- Hỗ trợ chuyển đổi mượt mà giữa Ban Ngày (Daylight) ➔ Hoàng Hôn (Sunset) ➔ Đêm Neon (Neon Night).
- Tự động kích hoạt hàng trăm ô cửa sổ phát quang (Emissive Windows) và hệ thống đèn LED kiến trúc biểu tượng khi đêm xuống.
- Bảo đảm tối ưu hóa hiệu năng: Nội suy không rác bộ nhớ (GC-free) duy trì tốc độ 60 FPS trên WebGL.

---

## 2. PHÂN RÃ CÁC HẠNG MỤC CẢI TIẾN

```text
[CHU KỲ THỜI GIAN 3 PHA]
  ├── Ban Ngày Nhiệt Đới (Daylight - 5500K, nắng vàng ngọc bích)
  ├── Hoàng Hôn Mật Ong (Sunset - 3000K, bóng dài, gradient tím cam)
  ├── Đêm Đô Thị Neon (Neon Night - 10000K, trời sao & trăng sáng)
  └── Nội suy lerp mượt mà qua hàm suy giảm hàm mũ (tốc độ 3.0)

[ĐÔ THỊ NEON PHÁT QUANG BAN ĐÊM]
  ├── Cửa sổ công trình C1-C3 procedural emissive vàng ấm & cyan neon
  ├── Cầu Ba Son & Long Biên thắp sáng dải LED RGB dây văng
  ├── Đỉnh tháp Landmark Bitexco quét laser 360 độ & chớp strobe đỏ
  ├── 4 cột đèn LED sân vận động tỏa nón ánh sáng rực rỡ
  └── 8 cabin vòng đu quay Ferris Wheel đa sắc quay lung linh trong đêm
```

### 1. Bộ Điều Phối Thời Gian Trong Ngày (`environment_store.ts`)
- **Tệp mới**: `src/client/store/environment_store.ts`.
- **Nghiệp vụ**:
  * Quản lý trạng thái thời gian: `'day' | 'sunset' | 'night'`.
  * Hỗ trợ 2 chế độ vận hành: Thủ công (chọn nhanh qua nút trên HUD TopBar) hoặc Tự động (tự động luân chuyển chu kỳ sau mỗi 90 giây hoặc mỗi 10 vòng đấu).

### 2. Hệ Thống Ánh Sáng & Khí Quyển Phối Hợp (`time_of_day_lighting.tsx`)
- **Tệp mới**: `src/client/3d/time_of_day_lighting.tsx`.
- **Nghiệp vụ**:
  * Định nghĩa 3 bộ preset ánh sáng đầy đủ:
    - **Pha 1 (Daylight)**: Nắng vàng ấm 5500K `#FFFDF5`, Ambient ngọc bích nhẹ `#BAE6FD`, trời xanh lơ `#7DD3FC`.
    - **Pha 2 (Sunset)**: Nắng cam mật ong 3000K `#F59E0B` hạ góc 15 độ, trời chuyển dải tím hồng `#F43F5E` sang cam vàng `#FB923C`.
    - **Pha 3 (Night)**: Ánh trăng xanh thẳm 10000K `#1E293B`, trời đêm sâu `#020617` điểm xuyết ngàn sao.
  * Cơ chế nội suy không rác bộ nhớ (GC-free): Tái sử dụng cùng một instance `Vector3` và `Color`, lerp liên tục qua `useFrame` với công thức `1 - Math.exp(-dt * 3.0)`, triệt tiêu hiện tượng giật màu (hard snapping).

### 3. Hệ Thống Phát Quang Ban Đêm (Emissive Night Lighting)
- **Tệp can thiệp**: `src/client/3d/procedural_building.tsx`, `src/client/3d/diorama/diorama_bridges.tsx`, `src/client/3d/diorama/diorama_skyline.tsx`, `src/client/3d/diorama/diorama_stadium.tsx`.
- **Nghiệp vụ**:
  * **Tòa nhà Procedural C1-C3**: Tự động kích hoạt các ô kính cửa sổ emissive màu vàng ấm (`#FDE047`, cường độ 0.85) và cyan neon (`#38BDF8`) khi trời tối.
  * **Cầu Ba Son & Long Biên**: Dải dây văng và thân cầu thắp sáng hệ thống đèn LED RGB đổi màu nghệ thuật phản chiếu lung linh xuống mặt biển.
  * **Đỉnh Tháp Landmark**: Kích hoạt luồng sáng laser quét 360 độ trên bầu trời đêm kèm đèn nhấp nháy an toàn hàng không (aviation strobe) đỏ chớp tắt theo chu kỳ.
  * **Sân Vận Động & Đu Quay**: Bật sáng dàn đèn cao áp 4 cột LED nghiêng 45 độ; 8 cabin đu quay phát sáng lung linh.

---

## 3. RÀNG BUỘC KỸ THUẬT & NGHIỆM THU

- Tốc độ khung hình: Duy trì 60 FPS ổn định, không drop frame khi chuyển pha thời gian.
- Bộ nhớ: Zero Allocation trong vòng lặp `useFrame` của ánh sáng.
- Tính thẩm mỹ: Được Subagent `game-3d-visual-critic` phê duyệt độ tương phản rõ ràng giữa ô cờ và đô thị đêm.
