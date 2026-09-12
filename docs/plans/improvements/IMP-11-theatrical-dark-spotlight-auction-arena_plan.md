# KẾ HOẠCH CẢI TIẾN IMP-11: SÀN ĐẤU GIÁ KỊCH TÍNH - DARK SPOTLIGHT ARENA (BƯỚC 1)

## 1. BỐI CẢNH & VẤN ĐỀ CỐT LÕI
- **Hiện trạng trước cải tiến:**
  1. Thẻ Sổ Đỏ dựng thẳng đứng ngay giữa bàn cờ ban ngày. Bàn cờ và các khối nhà C1/C2/C3 xung quanh vẫn nhận ánh sáng mặt trời bình thường, làm mất tính tập trung của sàn đấu giá.
  2. Thẻ có tỷ lệ quá khổ (`scale={[1.8, 2.5, 0.1]}`), choán phần lớn màn hình như tấm biển pano quảng cáo thô kệch.
  3. Thẻ sử dụng `CanvasTexture` 2D vẽ chữ phẳng đen trắng đơn điệu, thiếu hoàn toàn chiều sâu PBR phản chiếu kim loại và tính sang trọng của một bất động sản danh giá.

- **Mục tiêu Bước 1 (Dark Spotlight Arena):**
  1. **Hệ thống Chiếu sáng Sân khấu Điện ảnh (Theatrical Lighting Controller):** Khi phiên đấu giá mở (`isAuctionActive = true`), toàn bộ bàn cờ giảm sáng 85% (Ambient rọi tiệm cận 0.15), kích hoạt nguồn sáng `spotLight` vàng ấm hoàng gia (`#FDE047`, cường độ 5.0) rọi bục và đèn ven Cyan (`#06B6D4`, cường độ 2.0) tạo độ tương phản Cyber-Luxury.
  2. **Thẻ Sổ Đỏ Tỷ Lệ Vàng & Tháp Sapphire 3D:** Chuẩn hóa kích thước Rộng 2.8 x Cao 3.9 x Dày 0.08, đặt tại tọa độ `[0, 3.2, 0]`, nghiêng cơ sở `[-0.15, 0.12, 0]` đón dải sáng Specular. Trung tâm thẻ tích hợp mô hình 3D thu nhỏ Tòa tháp Landmark bằng kính Sapphire xoay nhẹ. Tên đường dập nổi chữ kim loại vàng sang trọng.
  3. **Căn chỉnh Camera `auction_focus`:** Cự ly thanh lịch bao quát `position: [0, 6.0, 9.0]`, `target: [0, 3.0, 0]`, `fov: 38`.

---

## 2. KIẾN TRÚC & PHẠM VI TRIỂN KHAI
- `src/client/3d/sapphire_landmark_model.tsx` (NEW): Mô hình 3D thu nhỏ Tháp Landmark Crystalline Sapphire nhiều mặt cắt giật cấp, vành đai mạ vàng Champagne, chóp vát kim cương và cột kim thu lôi, xoay liên tục 60 FPS.
- `src/client/3d/auction_deed_texture.ts` (NEW): Module chuyên biệt sinh Texture HiDPI trên nền phiến đá đen Obsidian, viền kép dập nổi mạ vàng, header ribbon danh giá và nhãn thông số quy hoạch tối giản.
- `src/client/3d/auction_3d_stage.tsx`: Sân khấu 3D tích hợp Spotlight điện ảnh, đèn ven Cyan, bục nâng phát sáng xoay nhẹ, thẻ Sổ Đỏ PBR Champagne Gold, tháp Sapphire Landmark xoay trong khung kính ngắm, hiệu ứng Parallax Tilt và pháo hoa bụi vàng.
- `src/client/3d/time_of_day_lighting.tsx`: Tích hợp hàm SSOT `calculateTheatricalAmbientIntensity` để điều khiển hạ tối 85% toàn bộ hệ thống ánh sáng nền khi đấu giá mở.
- `src/client/3d/camera_state_machine.ts`: Cập nhật cấu hình preset `auction_focus` (`[0, 6.0, 9.0]`, target `[0, 3.0, 0]`, FOV 38).

---

## 3. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
1. 100% kiểm tra TypeScript biên dịch sạch sẽ (`npx tsc --noEmit` = 0 lỗi).
2. Toàn bộ 104 test files của dự án PASS 100% (Zero Regression).
3. Tuân thủ Categorized File Limits (UI Components <= 500 LOC; Logic <= 400 LOC).
4. Zero Dirty Casts (`strict: true`, không dùng `as any` hay `as unknown as T`).
5. Có ảnh screenshot kiểm chứng thẩm mỹ tại `docs/reports/improvements/screenshots/step1_dark_spotlight_auction_arena.jpg`.
