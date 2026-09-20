# [IMP-134] Báo Cáo Hoàn Tất Mô Hình Xe Lửa Sa Bàn 3D Chuyển Động Tuần Hoàn & Ga Bắc Landmark Metro (Model Train & Urban Stations Kinematics)

> **Mã Cải Tiến**: `IMP-134` (hoặc `IMP-134B` trên Master Roadmap)  
> **Trạng Thái**: 🟢 HOÀN TẤT (100% Green / Spec Reviewer Approved / 3D Visual Critic: Ship 9.2/10)  
> **Traceability**: `[UC-IMP134-TRAIN]`, `tests/client/imp134_model_train_and_stations.test.ts`, Gotcha #177

---

## 1. Kết Quả Triển Khai Thực Tế

| Tệp Thay Đổi | Thay Đổi Thực Tế | Tác Dụng Kỹ Thuật |
| :--- | :--- | :--- |
| `src/client/3d/diorama/diorama_train_kinematics.ts` | +144 LOC (MỚI) | Toàn bộ module toán học spline Catmull-Rom khép kín, kinematics điều tốc, yaw độc lập trục +X và khớp nối 3 toa. |
| `src/client/3d/diorama/diorama_railroad.tsx` | +120 / -10 LOC | Re-export kinematics; thêm `DioramaLandmarkNorthStation` bờ Bắc; thêm 4 ray cua góc; gắn `useSafeFrame` cho 3 toa tàu. |
| `src/client/3d/miniature_city_diorama.tsx` | +6 / -1 LOC | Export và mount `<DioramaLandmarkNorthStation />` vào diorama trung tâm bàn cờ. |
| `tests/client/imp134_model_train_and_stations.test.ts` | 21 atomic tests (MỚI) | Bộ test hợp đồng 4-Facet kiểm thử toàn diện hình học ray, động lực học, yaw vector và render an toàn. |
| `docs/domain/gotchas.md` | +1 Invariant | Ghi nhận Gotcha #177 `[3D/KINEMATICS]`. |

---

## 2. Các Bất Biến Kỹ Thuật Then Chốt (Architectural Invariants)

1. **Heading Vector Invariant (P1)**:
   - Do mô hình đầu tàu Ruby có đèn pha quay theo trục cục bộ `+X` (`x = +0.33`), góc xoay yaw quanh trục Y bắt buộc tuân theo công thức:
     $$\text{yaw} = \text{atan2}(-\text{tangent.z}, \text{tangent.x})$$
   - Điều này đảm bảo đầu tàu luôn hướng mũi thẳng theo chiều chạy của ray, triệt tiêu 100% hiện tượng thân xe đâm ngang vào taluy.

2. **SSR Headless Compatibility Invariant (P2)**:
   - Trong môi trường kiểm thử Vitest Node SSR, `renderToStaticMarkup` không kích hoạt callback `useSafeFrame`.
   - Các thẻ `<group>` của 3 toa tàu bắt buộc phải duy trì prop `position` khởi tạo tĩnh trong JSX; toàn bộ geometry của các nhà ga phải sử dụng wrappers an toàn (`SafeBoxGeometry`, `SafeCylinderGeometry`, `SafeSphereGeometry`).

3. **Test Contract Preservation Invariant (P3)**:
   - Bộ test cũ `railroad_ballast_and_waterfront_station.test.ts` cắt cứng 800 ký tự đầu của `data-testid="diorama-waterfront-station"`.
   - Cấu trúc component Ga Nam được bảo toàn tuyệt đối, không chèn thêm bất kỳ thẻ nào vào đầu component.

---

## 3. Bằng Chứng Kiểm Thử & Nghiệm Thu 3 Trạm

- **Trạm 1 (RED Contract Tests)**: `qa-tester` tạo 21 atomic tests và chứng minh thất bại ban đầu (18 FAILED, 3 PASSED).
- **Trạm 2 (GREEN Implementation)**: `implementer` viết mã nguồn tối thiểu vượt qua toàn bộ 21/21 tests, đồng thời 54/54 tests hồi quy liên quan đạt 100% PASS (Tổng cộng 75/75 tests diorama PASS).
- **Trạm 3 (Độc Lập Kiểm Duyệt)**:
  - `spec-reviewer`: Ký duyệt **APPROVED** (100% Spec reconciliation, zero drift, chu vi ray $55.2\text{m}$, khoảng cách toa $0.85\text{m}$, thời gian đỗ $3.5\text{s}$, data-testid đầy đủ).
  - `game-3d-visual-critic`: Ký duyệt **DISPOSITION: SHIP** (Điểm mỹ thuật 9.2/10, khen ngợi tính sống động và thẩm mỹ Sunny Island Metropolis Diorama).
- **Cổng Kiểm Tra Nhanh (`npm run gate:quick`)**: Exit Code 0 (0 TS errors, 1.70% jscpd duplication, 33/33 mô hình 3D đạt ngân sách tải 1.38 MB / 2.5 MB, snapshot evidence hoàn tất).
- **Giao Diện UI Lint (`npm run lint:ui`)**: 0 vi phạm trên toàn bộ 156 tệp UI.
