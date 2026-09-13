# KẾ HOẠCH KỸ THUẬT: NHỊP NHẢY AVATAR 1.5X, TRIỆT TIÊU NHẢY CÓC TIMEOUT & ỔN ĐỊNH CAMERA KHI GIEO XÚC XẮC (IMP-42)

## 1. MỤC TIÊU & BỐI CẢNH
- **Mục tiêu**: Tăng tốc độ nhảy con cờ lên 1.5x giảm thời gian chờ đợi, nâng giới hạn timeout bảo hiểm tránh nhảy cóc khi xúc xắc lớn, và giữ camera ở chế độ overview khi gieo xúc xắc.
- **Phạm vi**: `src/client/3d/pawn_animator.tsx`, `src/client/3d/pawn_path.ts`, `src/client/3d/camera_state_machine.ts`.

## 2. NGUYÊN NHÂN KỸ THUẬT
1. **Nhịp nhảy cũ quá chậm**: Thời lượng 0.34s/ô (0.22s bay + 0.12s chạm) làm việc di chuyển 10-12 ô mất 4.5s.
2. **Nhảy cóc (teleport) do timeout quá ngắn**: Timeout an toàn `nextTask.waypoints.length * stepDuration + 500` chỉ cho 3.9s cho 10 ô. Khi máy khách chạy 25-30 FPS, animation chưa xong đã bị timeout cưỡng chế `completePawnMove`.
3. **Camera giật cục**: Chuyển sang chế độ `dice_roll` cắm sâu vào khay xúc xắc làm giật máy quay và mất phương hướng bàn cờ.

## 3. THIẾT KẾ TRIỂN KHAI
1. **Rút ngắn thời lượng bước nhảy**: `HOP_DURATION = 0.15s`, `LANDING_DURATION = 0.08s` (tổng 0.23s/ô, nhanh gấp 1.5 lần).
2. **Nâng timeout bảo hiểm**: Đặt `Math.max(10000, nextTask.waypoints.length * 1500 + 8000)` để đảm bảo animation chạy xong tự nhiên qua `handleHopComplete`.
3. **Giữ camera overview**: Khi `isRolling = true`, `resolveCameraMode` giữ nguyên chế độ `'overview'`.

## 4. KẾ HOẠCH KIỂM THỬ
- Kiểm tra hoạt cảnh nhảy cờ qua các test client pawn animation.
- Kiểm tra tính ổn định của camera state machine.
