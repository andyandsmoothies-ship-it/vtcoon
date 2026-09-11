# ADR-0005: KIẾN TRÚC SA BÀN ĐÔ THỊ SỐNG & ĐỘNG LỰC HỌC MÔI TRƯỜNG 3D (LIVING METROPOLIS ARCHITECTURE)

- **Trạng Thái**: Chấp Nhận (Accepted / Implemented)
- **Ngày Quyết Định**: 2026-09-11
- **Phạm Vi**: `src/client/3d/`, `src/client/store/environment_store.ts`
- **Kế Hoạch & Báo Cáo Liên Quan**: `docs/plans/improvements/IMP-04*`, `IMP-05*`, `IMP-06*`, `docs/reports/improvements/IMP-04*`, `IMP-05*`, `IMP-06*`

---

## 1. BỐI CẢNH (CONTEXT)

Trong các phiên bản đầu tiên (Epic Phase 2), sa bàn 3D của trò chơi vận hành dưới dạng một mô hình tĩnh vật (still-life diorama):
- Bàn cờ nằm trong phòng tối với camera trực giao (Orthographic Camera) phẳng lì, thiếu cảm giác không gian và chiều sâu quang học.
- Mặt nước đại dương là một tấm hộp phẳng đứng im.
- Không có bất kỳ chuyển động vi mô nào trên các tuyến đường hay vịnh biển (xe cộ, tàu thuyền, chim muông nằm chết một chỗ).
- Ánh sáng ban ngày tĩnh đơn điệu, không thể hiện được nét quyến rũ của các thành phố biển Việt Nam khi lên đèn về đêm.

Đánh giá đối kháng từ Giám đốc Mỹ thuật độc lập (`game-3d-visual-critic`) xếp loại sa bàn ở mức 3.5/10 (phòng tối thập niên 2000), không tương xứng với một sản phẩm game thương mại chuẩn 2026.

---

## 2. QUYẾT ĐỊNH KIẾN TRÚC (DECISION)

Chúng tôi quyết định đại phẫu toàn diện hệ thống hiển thị 3D, thiết lập **Kiến Trúc Đô Thị Sa Bàn Sống (Living Metropolis Architecture)** dựa trên 4 trụ cột công nghệ:

```text
[GAME CANVAS 3D ROOT]
  ├── [1. Bán Đảo Nhiệt Đới & Địa Danh Văn Hóa]
  │     ├── Perspective Camera fov 40 + Hiệu ứng quang học Tilt-Shift DoF
  │     ├── Quần thể Tháp Đôi Landmark C3 Art Deco (Champagne Gold & Kính Sapphire)
  │     └── Hệ thống địa danh: Sân vận động carô, Đu quay Ferris, Chợ Bến Thành, Cầu Ba Son
  │
  ├── [2. Thủy Động Học Sóng Biển Gerstner]
  │     ├── Hàm sóng điều hòa 3 pha: w1(0.032) + w2(0.024) + w3(0.014) <= 0.070 đơn vị
  │     ├── Tính lại pháp tuyến computeVertexNormals() thời gian thực tạo mặt nước lấp lánh
  │     └── Dải bọt sóng trắng dạt bờ cát theo chu kỳ thủy triều 3.5 giây
  │
  ├── [3. Vi Giao Thông Tự Hành & Sinh Thái Biển (Spline Kinetics)]
  │     ├── 7 xe tí hon tuần hoàn 2 làn ngược chiều RHT, đèn pha LED rọi đường
  │     ├── Khóa cứng vận tốc từng làn: Triệt tiêu 100% va chạm xe không cần physics engine nặng
  │     └── Ca-nô tuần tra vịnh Nam (Z >= 29) & Đàn 5 hải âu lượn vòng mỏ thuận vector
  │
  └── [4. Chu Kỳ Ánh Sáng Động 3 Pha & Đêm Neon (Time-of-Day Engine)]
        ├── Ban Ngày Nhiệt Đới (5500K) ➔ Hoàng Hôn Mật Ong (3000K) ➔ Đêm Đô Thị Neon (10000K)
        ├── Nội suy hàm mũ GC-free: 1 - exp(-dt * 3.0) triệt tiêu giật màu
        └── Emissive Windows Map: Hàng trăm ô cửa sổ C1-C3, cầu LED RGB, laser tháp quét đêm
```

### Các nguyên tắc kỹ thuật cốt lõi:

1. **Hiệu quả tính toán (Computational Efficiency) & Giữ vững 60 FPS**:
   - Thay vì tích hợp một engine vật lý nặng nề (như Rapier hay Cannon) cho hàng chục phương tiện giao thông nền, hệ thống sử dụng **Kỹ thuật Động học Spline Tham số hóa (Parametric Spline Kinetics)**: Vị trí và góc xoay của xe được tính toán thuần túy bằng hàm lượng giác tuần hoàn.
   - Vận tốc trên từng làn được đồng bộ tuyệt đối (làn ngoài 0.035, làn trong 0.032), triệt tiêu 100% nguy cơ xe sau đâm xuyên xe trước mà chi phí CPU xấp xỉ bằng 0.
2. **Quản lý rác bộ nhớ (Zero-Allocation Render Loop)**:
   - Các phép nội suy màu sắc (`Color.lerp`) và vị trí ánh sáng mặt trời (`Vector3.lerp`) trong `time_of_day_lighting.tsx` tái sử dụng cùng một instance tĩnh được cấp phát trước, triệt tiêu hoàn toàn rác bộ nhớ (GC allocation spikes) trong mỗi khung hình render.
3. **Phân tầng quang học và kiểm soát ranh giới (Visual Boundary Control)**:
   - Tổng biên độ cực đại của sóng Gerstner được khóa chặt ở mức `<= 0.070` đơn vị trên cao độ nền Y = -0.60, bảo đảm đỉnh sóng cao nhất (-0.53) không bao giờ dâng ngập bờ cát vàng (Y = -0.30).
   - Ca-nô tuần tra bị giới hạn biên độ tọa độ `Z >= 29`, bảo đảm chỉ lướt trên vùng vịnh mở phía Nam, triệt tiêu lỗi chạy xuyên thấu đất liền hoặc đâm vào chân núi phía Bắc.

---

## 3. HỆ QUẢ (CONSEQUENCES)

### Tích cực:
- Điểm số thẩm mỹ được nâng từ **3.5 / 10** lên **8.2 / 10** theo đánh giá của Giám đốc Mỹ thuật độc lập (`game-3d-visual-critic`).
- Biến bàn cờ VTCOON từ một đồ án mô phỏng thành một tác phẩm nghệ thuật đô thị sa bàn sống động, sánh ngang các tựa game bàn cờ thương mại quốc tế (Monopoly Tycoon, Retropoly).
- Duy trì mượt mà 60 FPS trên cả thiết bị di động và máy tính phổ thông.

### Đánh đổi:
- Kích thước bundle 3D tăng thêm khoảng ~18KB do bổ sung các mô hình hình học procedural và shader sóng biển (hoàn toàn nằm trong ngân sách tải trang WebGL < 200KB gzip).
