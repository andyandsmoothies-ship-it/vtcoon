# [IMP-134] Kế Hoạch Nâng Cấp Mô Hình Xe Lửa Sa Bàn 3D & Hệ Thống Trạm Dừng Đô Thị (Model Train & Urban Stations Kinematics)

> **Mã Cải Tiến**: `IMP-134` (hoặc `IMP-134B` trên Master Roadmap)  
> **Mức Độ**: 🟢 3D Diorama & Kinematics Architecture  
> **Traceability**: `[UC-IMP134-TRAIN]`, `tests/client/imp134_model_train_and_stations.test.ts`, Gotcha #177

---

## 1. Bối Cảnh & Mục Tiêu Nghiệp Vụ
- **Bối cảnh**: Trên sa bàn đô thị trung tâm (`MiniatureCityDiorama`), mô hình xe lửa 3 toa (1 đầu máy Ruby + 2 toa khách Sapphire) trước đây đứng bất động tại tọa độ cố định (`Z = 6.9, X = -2.2..-0.55`). Vòng ray quanh bàn cờ sa bàn bị khuyết 4 góc bo cua, thiếu nhà ga đối ứng ở bờ Bắc.
- **Yêu cầu người dùng**: Nâng cấp cho xe lửa tự động chạy tuần hoàn quanh bàn cờ sa bàn 3D, có các trạm dừng đón trả khách và chuyển động uốn lượn mượt mà.
- **Mục tiêu kỹ thuật**:
  1. Xây dựng spline đường ray khép kín bám chu vi bàn cờ diorama ($X, Z \approx \pm 6.9\text{m}$), 4 góc bo cong mượt mà ($R \approx 1.0\text{m}$, chu vi ray $L \approx 55.2\text{m}$).
  2. Mô phỏng động lực học đoàn tàu 3 toa đa khớp (Multi-carriage articulation) với khoảng cách vật lý chuẩn xác (Đầu tàu $0\text{m}$, Toa 1 $0.85\text{m}$, Toa 2 $1.70\text{m}$).
  3. Chu kỳ điều tốc tuần hoàn: Chạy hành trình $1.2\text{ m/s}$, hãm phanh mượt mà khi vào ga, dừng bánh đúng $3.5\text{ s}$ tại 2 ga biểu tượng (Ga Nam Bến Sông & Ga Bắc Landmark Metro), tăng tốc khi xuất phát.
  4. Bổ sung nhà ga bờ Bắc `DioramaLandmarkNorthStation` đạt chuẩn mỹ thuật Sunny Island Metropolis Diorama và bổ sung 4 ray cua góc hoàn thiện vòng khép kín.
  5. Bảo toàn 100% các bài test diorama hiện hữu (`railroad_ballast_and_waterfront_station`, `model_railroad_and_tactile_lobby`).

---

## 2. Thiết Kế Kỹ Thuật

### 2.1. Module Động Lực Học Xe Lửa (`diorama_train_kinematics.ts`)
- **Đường cong quỹ đạo `getRailroadTrackCurve()`**:
  - `CatmullRomCurve3` khép kín (`closed: true`, curveType: `'catmullrom'`, tension: $0.15$).
  - 16 điểm kiểm soát (control points) chạy viền hình vuông bo tròn 4 góc tại $(\pm 6.9, \pm 6.9)$.
- **Vector hướng & Góc Yaw `computeTrainYaw(tangent)`**:
  - Do đầu tàu Ruby có đèn pha quay về trục cục bộ `+X` (`x = +0.33`), góc xoay quanh trục Y (yaw) bắt buộc tuân theo công thức:
    $$\text{yaw} = \text{atan2}(-\text{tangent.z}, \text{tangent.x})$$
  - Tránh hoàn toàn lỗi đầu tàu quay ngang $90^\circ$ đâm vào taluy ray.
- **Khoảng cách toa & Vị trí lùi `computeCarriageProgress(leadProgress, offsetMeters, trackLength)`**:
  - Tính toán vị trí lùi trên spline: `((leadProgress - offsetMeters / trackLength) % 1 + 1) % 1`.
- **Hệ thống điều tốc tuần hoàn `computeTrainKinematics(elapsedTime)`**:
  - 2 chu kỳ đối xứng: Nam $\to$ Bắc ($20.0\text{s}$ chạy $+ 3.5\text{s}$ đỗ) và Bắc $\to$ Nam ($20.0\text{s}$ chạy $+ 3.5\text{s}$ đỗ).
  - Vùng hãm phanh/tăng tốc: `DECEL_ZONE = 0.035`, `ACCEL_ZONE = 0.035`.
  - Dừng bánh hoàn toàn tại Ga Nam (`progress = 0.12`) và Ga Bắc (`progress = 0.62`).

### 2.2. Nâng Cấp Giao Diện 3D & Nhà Ga Bờ Bắc (`diorama_railroad.tsx`)
- Thêm component `DioramaLandmarkNorthStation` tại bờ Bắc ($Z = -6.55, X = 1.6$).
- Thiết kế: Thềm đá hoa cương sáng màu (`#E2E8F0`), mái vòm kính xanh lơ (`#0284C7`), cột chịu lực (`#64748B`), biển hiệu LED vàng hoàng kim (`#FEF08A`), ghế chờ hành khách.
- Sử dụng hình học an toàn Node SSR (`SafeBoxGeometry`, `SafeCylinderGeometry`, `SafeSphereGeometry`).
- Bổ sung 4 cung ray góc (Corner Rails) tại $(\pm 6.9, \pm 6.9)$.
- Tích hợp vòng lặp `useSafeFrame` cập nhật vị trí và góc quay cho 3 refs toa tàu, bổ sung nhịp pitch nhẹ khi di chuyển: `rotX = Math.sin(t * 12) * 0.005`.

---

## 3. Kế Hoạch Kiểm Thử Hợp Đồng
- **Tệp test**: `tests/client/imp134_model_train_and_stations.test.ts` (21 atomic tests theo 4 Facets).
- **Adversarial Inversion**: Chứng minh bộ test đỏ trước khi viết code triển khai.
- **Bảo toàn hồi quy**: Chạy kèm 2 bộ test đường ray cũ (54 tests).
