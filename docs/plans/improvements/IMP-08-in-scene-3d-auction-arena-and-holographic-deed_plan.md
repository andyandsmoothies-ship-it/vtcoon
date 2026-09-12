# KẾ HOẠCH CẢI TIẾN IMP-08: SÀN ĐẤU GIÁ KHÔNG GIAN 3D & THẺ SỔ ĐỎ NỔI HOLOGRAPHIC (GIAI ĐOẠN 2)

## 1. BỐI CẢNH & MỤC TIÊU
- **Hiện trạng trước cải tiến**: Sàn đấu giá chỉ là một hộp thoại HTML 2D popup che khuất bàn cờ, thiếu chiều sâu thị giác và cảm giác kịch tính của các sàn đấu giá địa ốc thượng lưu.
- **Mục tiêu thương mại 2026**: Hiện thực hóa 100% Ảnh Concept 2 (In-Scene 3D Auction Arena):
  1. Thẻ Sổ Đỏ Holographic 3D nổi ngay trong Canvas R3F (tỷ lệ chuẩn 1:1.4, viền kim loại Champagne Gold dập nổi, mặt PBR HiDPI, quốc huy/logo vàng).
  2. Bục nâng xoay nhẹ dưới chân thẻ bài phát luồng ánh sáng ngọc lam (Cyan Glow Ring & PointLight).
  3. Hiệu ứng Parallax Tilt: Thẻ tự động nghiêng mềm mại theo con trỏ chuột/chạm cảm ứng và nhấp nhô bồng bềnh.
  4. Hiệu ứng pháo hoa bụi vàng (Gold Confetti Particles) bùng nổ khi có người chơi nâng bước giá mới.
  5. Camera Action Cam góc đấu giá (`auction_focus`): Tự động lia từ góc bao quát sang trực diện sân khấu đấu giá khi phiên mở.
  6. Giao diện Glassmorphism 2 cánh (Dual-Wing HUD) giữ thông thoáng 100% trung tâm màn hình để chiêm ngưỡng Sổ Đỏ 3D.

---

## 2. PHẠM VI & NỘI DUNG TRIỂN KHAI
- `src/client/3d/camera_state_machine.ts`: Bổ sung chế độ máy quay `auction_focus`, cấu hình vị trí `[0, 4.2, 7.5]`, mục tiêu `[0, 1.8, 0]`, FOV 34.
- `src/client/3d/auction_3d_stage.tsx` (NEW): Dựng sân khấu đấu giá 3D gồm Bục nâng phát sáng, Thẻ Sổ Đỏ 3D bo viền vát, CanvasTexture HiDPI, Parallax Tilt, và bộ phát hạt bụi vàng nổ tung.
- `src/client/game_canvas.tsx`: Tích hợp `<Auction3DStage />` trực tiếp vào không gian R3F.
- `src/client/ui/modals/modal_backdrop.tsx`: Thêm prop `fullScreen` hỗ trợ bố cục 2 cánh thông thoáng.
- `src/client/ui/modals/modal_host.tsx`: Truyền `fullScreen={activeModal === 'auction'}`.
- `src/client/ui/modals/auction_modal.tsx`: Tái cấu trúc thành giao diện Glassmorphism 2 cánh (Cánh trái: Current Bid, Cánh phải: Đại gia tham gia, Băng chuyền dưới chân: Đồng hồ đếm ngược, Nút nâng giá nhanh, Auto-bid).

---

## 3. CHỈ TIÊU NGHIỆM THU (DOD)
1. 100% kiểm tra TypeScript biên dịch sạch sẽ (`npx tsc --noEmit` = 0 lỗi).
2. Tỷ lệ thẻ bài đạt chuẩn quốc tế Aspect Ratio 1:1.4.
3. Không làm suy thoái bất kỳ test suite nào của hệ thống (101/101 test files pass, 1.164+ tests).
4. Phản xạ Parallax Tilt mượt mà trong ngưỡng an toàn, kháng hoàn toàn lỗi NaN / Infinity.
