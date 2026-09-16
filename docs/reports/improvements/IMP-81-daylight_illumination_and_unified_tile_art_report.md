# BÁO CÁO CẢI TIẾN: IMP-81 — CHIẾU SÁNG THIÊN ĐỈNH BAN NGÀY, ĐẢO TỰ NHIÊN RETROPOLY & ĐỒNG NHẤT CHỮ TRẮNG SỔ ĐỎ

> **Mã cải tiến**: IMP-81 (Tương đương nhánh thị giác IMP-80B)  
> **Lĩnh vực**: `[3D]`, `[LIGHTING]`, `[UI]`, `[TYPOGRAPHY]`, `[ENVIRONMENT]`  
> **Trạng thái**: 🟢 Hoàn Tất  
> **Ngày hoàn tất**: 15/09/2026  
> **Điểm thẩm định nghệ thuật (Adversarial 3D Critic)**: 9.6 / 10 (Chuẩn thương mại AAA Retropoly & Monopoly Tycoon)

---

## 1. TỔNG QUAN KẾT QUẢ

Đã phân tích, xử lý và nâng cấp toàn diện 3 vấn đề thị giác do người dùng phản hồi:

1. **Khắc Phục Vùng Tối Sầm Khi Thu Phóng Cận Cảnh (Daylight Close-Up Shadow Crush)**:
   - **Nguồn sáng thiên đỉnh (Zenith Fill Light)**: Tích hợp nguồn sáng bổ trợ thẳng đứng tại `[0, 30, 0]` với cường độ `0.25` và màu trắng nắng `#F8FAFC` kích hoạt riêng khi ban ngày trong [`time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx) (hạ tối `0.05` khi mở sàn đấu giá kịch tính).
   - **Tái cân bằng chiếu sáng khuếch tán**: Tinh chỉnh `TIME_OF_DAY_PRESETS.day` trong [`environment_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/environment_store.ts) (`ambientIntensity = 0.20`, `hemiIntensity = 0.14`), bù sáng các mảng tối mà không làm cháy sáng các đỉnh tòa nhà PBR.
   - **Làm dịu bộ lọc N8AO**: Hạ `aoIntensity` từ `0.60` xuống `0.38` và chuyển màu bóng tiếp xúc từ đen kịt `#0B0F19` sang than chàm `#1E293B` trong [`post_processing_pipeline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx).

2. **Triệt Tiêu Màu Vàng Mù Tạt Nhân Tạo & Tái Hiện Thiên Nhiên Đảo Ngọc Retropoly**:
   - **Eradicate token `#FDE68A`**: Khử sạch 100% token vàng mù tạt trên toàn bộ các tầng hình trụ đảo trong [`coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx).
   - **Bờ cát ngà tự nhiên**: Chuyển chất liệu bờ cát vát nghiêng 15 độ sang cát ngà mịn `#EFE5D8` (roughness 0.85) và điểm nhấn cát bờ trên `#F3EBE1`, giao thoa mềm mại với mặt nước ngọc bích `#06B6D4` và dải bọt sóng trắng dập dềnh.
   - **Cao nguyên cỏ xanh nhiệt đới**: Bổ sung hình trụ cao nguyên cỏ xanh tươi `#22C55E` (`<cylinderGeometry args={[15.6, 17.6, 0.26, 64]} />`) đệm giữa gờ gỗ óc chó sa bàn và bãi cát.
   - **Thanh lọc khí quyển**: Thanh lọc ánh sáng viền ban ngày sang `#F8FAFC` (`intensity = 0.12`) và phản xạ mặt đất `hemiGroundColor` sang xanh thảm cỏ `#DCFCE7`.

3. **Đồng Nhất Kiểu Chữ Sổ Đỏ Trắng Đậm (#FFFFFF) Cho Toàn Bộ 28 Thẻ BĐS**:
   - **Nâng ngưỡng phân tách độ chói quang học**: `getBannerTextColor` trong [`tile_texture_generator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_generator.ts) nâng ngưỡng từ `0.60` lên `luminance > 0.85`.
   - **Chữ trắng nổi bật**: Toàn bộ 8 nhóm màu BĐS đô thị & nghỉ dưỡng (kể cả Cam Bình Định `#FF8C42` luminance 0.65 và Vàng Hải Phòng `#F1C40F` luminance 0.74) đều hiển thị chữ trắng đậm `#FFFFFF`.
   - **Kỹ thuật Double-Draw viền than đanh thép**: Vẽ nét viền than đen `#0F172A` (`lineWidth = 3.0`) trước, sau đó phủ chữ trắng `#FFFFFF` đè lên, giữ trọn vẹn không gian âm của chữ cái và xóa bỏ hoàn toàn hiện tượng vệt mực đen nhòe.
   - **Bảo toàn nền ngà cổ điển**: Giữ nguyên mực than `#090D1A` cho các thẻ đặc biệt nền trắng ngà `#FFFDF5` (luminance 0.99 > 0.85).

---

## 2. KẾT QUẢ KIỂM ĐỊNH 3 TRẠM (3-STATION PIPELINE AUDIT)

- **Trạm 1 (RED Contract Test)**:
  - Tệp: [`tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts).
  - 21 atomic tests bao quát Universal 4-Facet Behavioral Matrix.
  - Cổng đảo nghịch (Adversarial Inversion): 19/21 bài kiểm thử thất bại (RED) trước khi chỉnh sửa mã nguồn.

- **Trạm 2 (GREEN Implementation)**:
  - Chuyển 21/21 atomic tests sang XANH (100% PASS).
  - Phân rã mô-đun `time_of_day_lighting.tsx` thành các hàm trợ năng thuần túy (`updateDirectLights`, `updateDiffuseAndAtmosphere`), khống chế `useSafeFrame` ở 16 LOC, tuân thủ nghiêm ngặt chuẩn kiến trúc Functions <= 30 LOC, Complexity <= 5.
  - Chuẩn hóa kiểu dữ liệu TypeScript strict mode, 0 dirty cast (`as Fog`, `as Color`), 0 raw `any`.

- **Trạm 3 (Independent Multi-Reviewer Audit)**:
  - **Spec Reviewer**: 100% tiêu chí khớp đặc tả và yêu cầu người dùng, 0 scope drift, phán quyết **APPROVED (SIGN-OFF)**.
  - **Game 3D Visual Critic**: Đạt **9.6 / 10** điểm chuẩn thương mại AAA Retropoly & Monopoly Plus, phán quyết **SHIP APPROVED**.
  - **2D UI Craft Reviewer**: 0 anti-pattern linter (`border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`), phán quyết **SHIP APPROVED**.
  - **Code Quality Re-Reviewer**: Toàn bộ cảnh báo chất lượng mã nguồn được xử lý sạch sẽ.
  - **Test Suite**: **186/186 test suites PASS 100% (3.162/3.162 tests PASS)**.

---

## 3. MÃ NGUỒN VÀ TÀI NGUYÊN THAY ĐỔI
1. [`src/client/3d/time_of_day_lighting.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/time_of_day_lighting.tsx): Bổ sung nguồn sáng thiên đỉnh `[0, 30, 0]`, thanh lọc rim light `#F8FAFC`, phân rã helper functions & type guards.
2. [`src/client/store/environment_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/environment_store.ts): Tái cân bằng preset ban ngày (`ambientIntensity: 0.20`, `hemiIntensity: 0.14`, `hemiGroundColor: '#DCFCE7'`).
3. [`src/client/3d/coastal_island_environment.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/coastal_island_environment.tsx): Khử bỏ `#FDE68A`, thay thế bằng cát ngà `#EFE5D8` và thảm cỏ xanh nhiệt đới `#22C55E`.
4. [`src/client/3d/post_processing_pipeline.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/post_processing_pipeline.tsx): N8AO `aoIntensity: 0.38`, màu than chàm `#1E293B`.
5. [`src/client/3d/tile_texture_generator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/tile_texture_generator.ts): Ngưỡng luminance 0.85, kỹ thuật Double-Draw viền than đen `#0F172A`, chữ trắng `#FFFFFF`.
6. [`tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp80_daylight_illumination_and_unified_tile_art.test.ts): 21 contract tests bảo vệ tính năng.
7. [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md): Ghi nhận Gotcha #109.
8. [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md): Cập nhật tiến độ gói cải tiến IMP-81.
