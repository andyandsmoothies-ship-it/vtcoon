# Kế Hoạch Cải Tiến IMP-155: Tinh Gọn Pop-up Thông Báo Sự Kiện & Rút Gọn Nội Dung Thân Thiện

## 1. Bối Cảnh & Vấn Đề
- Người dùng phản hồi: *"Một số pop up dài nhìn không thân thiện"* kèm ảnh chụp màn hình điện thoại di động (`media_1789996550439.png`).
- Các vấn đề thị giác được xác định:
  1. `MilestoneBanner` (pop-up sự kiện / cột mốc) lấy nguyên văn `card.description` chứa tiền tố thừa (`Quy hoạch trục đô thị mới: `) khiến phần hiệu ứng chính bị đẩy ra sau và bị cắt cụt lửng lơ (`...BĐS...`).
  2. Tên Bot AI `Bot AI 3 (Aggressive)` bị xén thành `Bot AI 3 (Aggressi...` và rớt xuống dòng riêng lẻ làm thẻ thành 3 tầng luộm thuộm.
  3. Kích thước `max-w-[94vw]` quá bè ngang trên mobile, chiếm dụng không gian sa bàn 3D.
  4. Trùng lặp vô ích với thanh `MarketEventTicker` ở đỉnh.
  5. Treo lâu suốt 4.5s mà không cho phép chạm để tắt nhanh (`pointer-events-none`).

## 2. Giải Pháp Kỹ Thuật
1. `cleanEventDescription`: Pure helper loại bỏ an toàn tiền tố lặp lại trước dấu hai chấm, trích xuất tác động tài chính cốt lõi.
2. `formatShortPlayerName`: Rút gọn tên Bot dạng `Bot AI X (Personality)` thành `Bot AI X` chống cắt cụt chữ.
3. `MilestoneBanner` layout gọn gàng `max-w-[88vw] sm:max-w-[380px]`, `min-w-0 flex-1 truncate` cho tiêu đề, bố cục `flex-wrap gap-1 sm:flex-nowrap items-center`.
4. Kích hoạt tính năng chạm để đóng nhanh (Tap-to-Dismiss) với `pointer-events-auto cursor-pointer onClick` và trợ năng A11y.
5. Tinh gọn thanh `MarketEventTicker` ở đỉnh màn hình (`max-w-[90vw] sm:max-w-md`, siết lề đệm `py-1.5 px-3`).
6. `activity_tracker.ts` truyền tóm tắt tác động sạch và `durationMs: 3200`.

## 3. Ranh Giới An Toàn (Zero Regression)
- Giữ nguyên `EVENT_BANNER_DURATION_MS = 4500` để bảo vệ hợp đồng kiểm thử cũ `TC-IMP135.15` & `TC-IMP135.17`.
- Giữ nguyên toàn bộ công thức và class vị trí offset của `FloatingNumbersOverlay` để bảo vệ 23 test khử chèn đè `imp129`/`imp139`.
- Bảo toàn 100% các `data-testid` (`event-card-notification-banner`, `milestone-card-title`, `floating-amount-pill`).
