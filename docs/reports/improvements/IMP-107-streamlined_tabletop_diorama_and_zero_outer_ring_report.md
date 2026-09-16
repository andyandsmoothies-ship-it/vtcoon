# Báo Cáo Cải Tiến IMP-107: Sa Bàn Bàn Cờ Tinh Gọn & Triệt Tiêu Vành Đai Ngoại Vi Cây Cỏ (Streamlined Tabletop Diorama & Zero Outer Ring Clutter)

> **Mã Cải Tiến:** IMP-107  
> **Trạng Thái:** 🟢 **Hoàn Tất**  
> **Ngày Triển Khai:** 2026-09-16  
> **Khu Vực Tác Động:** `src/client/3d/coastal_island_environment.tsx`, `src/client/3d/board_layout.tsx`, `tests/client/imp107_streamlined_tabletop_diorama.test.ts`  
> **Quy Trình Áp Dụng:** Quy Trình 3 Trạm Bắt Buộc (Adversarial Inversion RED ➔ GREEN ➔ Independent Physical Disk Audit)  

---

## 1. BỐI CẢNH & YÊU CẦU THỰC TẾ
- **Phản hồi từ người dùng:** "kiểm tra giao diện game nếu bỏ hết phần vòng ngoài gồm những cái cây và sân cỏ, thì phần bàn cờ có được dễ nhìn hơn không" ➔ Người dùng xác nhận: "đồng ý, nên cắt bớt vòng ngoài".
- **Vấn đề thực tế:**
  1. Trước IMP-107, môi trường đảo biển ngoài khơi sở hữu một đĩa cao nguyên cỏ xanh nhiệt đới khổng lồ (`cylinderGeometry args={[15.6, 17.6, 0.26, 64]}` màu `#22C55E`), 60 cây dừa (`TropicalPalmsCluster`), 32 cây tán lá nhiệt đới (`LayeredTropicalFoliage`), ga xe lửa Đông Nam (`TrainStationLandmark`), sân bay Tây Bắc (`AirportLandmark`) và các cụm dù che nắng bãi biển.
  2. Vành đai ngoại vi dày đặc này che khuất tầm nhìn của các ô đất góc đáy bàn cờ (đặc biệt khi camera ở góc thấp `tile_focus` hoặc trên màn hình hẹp của di động), gây xao nhãng thị giác và làm lu mờ nhân vật chính là bàn cờ 40 ô cùng sa bàn đô thị trung tâm (`MiniatureCityDiorama`).
  3. Bệ gỗ óc chó cũ kích thước rộng tới `args={[32, 0.2, 32]}` quá lớn so với khung bàn cờ 18.4 x 18.4m.

---

## 2. GIẢI PHÁP THỰC HIỆN
1. **Môi Trường Đảo Biển Tinh Gọn (`coastal_island_environment.tsx`):**
   - Định nghĩa thuộc tính `CoastalIslandEnvironmentProps { streamlined?: boolean }` với giá trị mặc định là `streamlined = true`.
   - Thu gọn toàn bộ các khối vành đai ngoại vi rườm rà vào khối điều kiện `{!streamlined && ( ... )}`:
     - Cao nguyên cỏ xanh nhiệt đới `#22C55E` bán kính 17.6m.
     - 60 cây dừa nhiệt đới `TropicalPalmsCluster`.
     - 32 cây tán lá xanh `LayeredTropicalFoliage`.
     - Nhà ga xe lửa Đông Nam và sân bay Tây Bắc.
     - Các cụm dù bãi biển và cầu cạn ngoại vi.
   - Điều chỉnh bán kính tầng nước nông ngọc bích (`#06B6D4`) và dải bọt sóng trắng (`#FFFFFF`) ôm sát khung bàn cờ (`args={streamlined ? [13.2, 14.8, 0.08, 48] : [16.3, 19.5, 0.08, 48]}`).
   - Bảo tồn thềm cát nhiệt đới ngà mịn (`#EFE5D8`) dưới tầng nước nông để giữ trọn hiệu ứng ánh nắng khúc xạ đáy biển.
   - **Bảo tồn 100% Single Cohesive World Invariant:** Giữ trọn đại dương vô cực sống động `Living Ocean` (sóng Gerstner GPU Shader `#0284C7`, đáy biển sâu `#0C4A6E`, tầng nước trung `#0369A1`), rặng núi xanh chân trời phía Bắc `HorizonMountainRange`, tàu chở container vi mô, tàu tuần tra `CoastalPatrolBoat`, đàn chim mòng biển `CoastalSeagulls` và máy bay trên trời.
2. **Khóa Chặt Kích Thước Bệ Gỗ Óc Chó (`board_layout.tsx`):**
   - Thu hẹp kích thước bệ gỗ từ `args={[32, 0.2, 32]}` xuống `args={[19.2, 0.2, 19.2]}` để ôm khít thành sa bàn `DioramaBoardRim` (18.4 x 18.4m), giải phóng hoàn toàn không gian mặt nước bao quanh.

---

## 3. KẾT QUẢ KIỂM THỬ (QUY TRÌNH 3 TRẠM)

```
🚦 [KÍCH HOẠT QUY TRÌNH 3 TRẠM]
├─ Trạm 1 (RED): 9 tests FAILED trên mã nguồn cũ (chứng minh Adversarial Inversion)
├─ Trạm 2 (GREEN): 16/16 atomic contract tests PASS 100% sau khi triển khai streamlined mode
└─ Trạm 3 (Audit): 215/215 test suites PASS (4.252 tests), linters 0 vi phạm, 0 lỗi TypeScript
```

- **Trạm 1 (Adversarial Inversion):**
  - Tạo tệp kiểm thử hợp đồng `tests/client/imp107_streamlined_tabletop_diorama.test.ts` (16 atomic tests phủ trọn ma trận 4 khía cạnh hành vi: Biên độ hình học, Triệt tiêu chướng ngại ngoại vi, Bảo tồn đại dương vô cực, Tương thích ngược khôi phục toàn cảnh).
  - Chạy trên mã nguồn cũ: **9 tests FAIL / 7 tests PASS**, chứng minh nghịch đảo đối kháng thành công.
- **Trạm 2 (GREEN Implementation):**
  - Cập nhật `coastal_island_environment.tsx` và `board_layout.tsx`.
  - Kết quả: **16/16 atomic contract tests PASS 100%** (362ms).
- **Trạm 3 (Kiểm Định Vật Lý & Tiêu Chuẩn Toàn Dự Án):**
  - `npm run lint:ui`: **0 vi phạm** trên 146 tệp client.
  - `npx tsc --noEmit`: **0 lỗi biên dịch** TypeScript strict mode.
  - `coastal_island_environment.tsx`: **289 LOC** (tuân thủ nghiêm ngặt trần <= 300 LOC).
  - `board_layout.tsx`: **161 LOC** (tuân thủ trần <= 400 LOC).
  - `npm test`: **215/215 tệp kiểm thử PASS (4.252/4.252 tests PASS 100%)**.

---

## 4. TÀI LIỆU CẬP NHẬT
- [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md): Bổ sung Gotcha #140 (Streamlined Tabletop Diorama & Zero Outer Ring Clutter Invariant) và cập nhật Bảng chỉ mục `[3D/RENDER]`.
- [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md): Cập nhật gói cải tiến IMP-107 sang trạng thái 🟢 **Hoàn Tất**.
