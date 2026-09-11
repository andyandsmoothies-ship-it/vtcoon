# [KẾ HOẠCH CẢI TIẾN IMP-05] SÓNG BIỂN GERSTNER & VI GIAO THÔNG ĐÔ THỊ TỰ HÀNH (GÓI A)

## 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT

Sau khi hoàn thành tạo hình bán đảo nhiệt đới (IMP-04), sa bàn 3D vẫn tồn tại cảm giác "đô thị tĩnh vật":
- Nước biển là một khối hộp phẳng đứng im, không có sóng vỗ hay bọt nước ven bờ.
- Toàn bộ phương tiện xe cộ, tàu thuyền và cần cẩu cảng đều nằm chết một chỗ.
- Bầu trời vịnh biển trống trải, thiếu các yếu tố sinh thái chuyển động.

Mục tiêu của IMP-05 là đưa hệ thống mô phỏng vi chuyển động thời gian thực (Micro-kinetics & Living Ecosystem) vào sa bàn 3D, tạo ra một đô thị tự vận hành sống động (Living Metropolis) ở tốc độ 60 FPS ổn định.

---

## 2. PHÂN RÃ CÁC HẠNG MỤC CẢI TIẾN

```text
[MÔI TRƯỜNG BIỂN SỐNG ĐỘNG]
  ├── Sóng biển Gerstner điều hòa 3 pha (w1 + w2 + w3 <= 0.07 đơn vị)
  ├── Tính toán lại pháp tuyến computeVertexNormals() tạo mặt nước lấp lánh
  ├── Dải bọt sóng trắng dập dềnh ven bờ cát theo chu kỳ 3.5 giây
  ├── Ca-nô tuần tra vịnh biển phía Nam (tọa độ Z >= 29) lướt sóng nhấp nhô
  └── Đàn 5 hải âu sải cánh lượn vòng với mỏ hướng theo vector bay

[VI GIAO THÔNG ĐÔ THỊ TỰ HÀNH]
  ├── 7 xe tí hon (2 buýt, 5 ô tô) chạy tuần hoàn 2 làn ngược chiều RHT
  ├── Đồng bộ hóa vận tốc tuyệt đối từng làn: Triệt tiêu 100% va chạm xe
  ├── 2 đèn pha LED vi mô rọi sáng mặt đường phía trước mỗi xe
  └── Cần cẩu cảng Cát Lái tự động xoay và nâng/hạ cáp cẩu container
```

### 1. Shader Mặt Nước Biển Sóng Động Gerstner
- **Tệp can thiệp**: `src/client/3d/coastal_island_environment.tsx`.
- **Nghiệp vụ**:
  * Tạo lưới `planeGeometry args={[120, 120, 64, 64]}` tại cao độ Y = -0.60.
  * Ứng dụng hàm sóng điều hòa đa hướng Gerstner 3 thành phần:
    `w1(0.032, freq 1.2) + w2(0.024, freq 2.1) + w3(0.014, freq 3.4)`.
  * Khống chế tổng biên độ cực đại `<= 0.070` đơn vị để đỉnh sóng cao nhất (-0.53) không tràn lên thềm cát (Y = -0.30).
  * Gọi `computeVertexNormals()` trong mỗi frame để phản xạ ánh nắng nhiệt đới lấp lánh theo từng gợn sóng.
  * Bổ sung vành đai bọt nước trắng dạt bờ biển (Shoreline Dynamic Foam) co giãn theo nhịp thủy triều 3.5 giây.

### 2. Hệ Thống Vi Giao Thông Tự Hành (Autonomous Micro-Traffic)
- **Tệp mới**: `src/client/3d/diorama/diorama_traffic.tsx`.
- **Nghiệp vụ**:
  * Xây dựng hệ thống tọa độ vòng lặp kín (Spline Loop) quanh đại lộ ven biển (23.6 x 23.6).
  * Quản lý mảng 7 xe tí hon (2 xe buýt, 5 ô tô) lưu thông theo chuẩn giao thông bên phải (Right-Hand Traffic) tại cao độ Y = 0.142 (bám sát mặt đường Y = 0.140).
  * Đồng bộ hóa vận tốc tuyệt đối theo từng làn (làn ngoài 0.035, làn trong 0.032) kèm khoảng cách offset cố định, triệt tiêu hoàn toàn hiện tượng xe đâm xuyên xe (ghost overtaking).
  * Mỗi xe trang bị 2 đèn pha LED vi mô chiếu sáng rọi về phía trước theo hướng di chuyển.

### 3. Sinh Thái Biển & Hoạt Cảnh Cảng Biển
- **Tệp mới**: `src/client/3d/diorama/coastal_patrol_boat.tsx`, `src/client/3d/diorama/coastal_seagulls.tsx`, `src/client/3d/diorama/diorama_container_port.tsx`.
- **Nghiệp vụ**:
  * Ca-nô tuần tra lướt sóng nhấp nhô trên vịnh biển phía Nam, giới hạn tọa độ `Z >= 29` để không đâm vào đất liền hay vách núi phía Bắc.
  * Đàn 5 hải âu bay lượn ở cao độ Y = 14-18; mỏ chim tự động xoay chuẩn theo vector vận tốc (`bird.rotation.y = -theta`), loại bỏ hoàn toàn dáng bay tạt ngang.
  * Cần cẩu Cát Lái 1 và 2 tự xoay cần trục và nâng/hạ cáp cẩu, khung chụp spreader treo bên dưới dầm cẩu.

### 4. Vá Lỗi Fatal Deadlock Vòng Lặp Lượt (`turn_loop.ts`)
- **Nghiệp vụ**: Tiêu thụ cờ `skipNextTurn = true` khi Bot có lượt phụ `extraTurns`, chuyển thẳng sang `TurnPhase.PropertyManagement`, bảo đảm ván cờ không bị treo vĩnh viễn.

---

## 3. RÀNG BUỘC KỸ THUẬT & NGHIỆM THU

- Tối ưu hiệu năng: Đảm bảo 60 FPS mượt mà; các vòng lặp tính toán tọa độ xe và sóng biển không tạo rác bộ nhớ (GC-free loop).
- Không gian va chạm: Xe cộ và tàu thuyền không va chạm xuyên thấu hình học sa bàn.
- Bảo toàn kiểm thử: 100% test suites tiếp tục PASS.
