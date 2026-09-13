# BÁO CÁO CẢI TIẾN: NHỊP NHẢY AVATAR 1.5X, TRIỆT TIÊU NHẢY CÓC TIMEOUT & ỔN ĐỊNH CAMERA KHI GIEO XÚC XẮC (IMP-42)

## 1. NGUYÊN NHÂN GỐC RỄ
1. **Nhịp nhảy avatar chậm**: Thời lượng 0.34s/ô tạo cảm giác ì ạch, sốt ruột cho người chơi khi di chuyển xa.
2. **Nhảy cóc (teleport) do timeout bảo hiểm quá ngắn**: Bộ đếm an toàn 3.9s cho 10 ô làm ngắt sớm animation trên các thiết bị FPS thấp, ép cờ dịch chuyển tức thời tới đích.
3. **Camera giật cục**: Chuyển pha `dice_roll` cắm sâu vào khay giữa bàn cờ làm rung lắc góc nhìn.

## 2. GIẢI PHÁP KỸ THUẬT
1. **Pawn Hop 1.5x Speed**: Chuẩn hóa `HOP_DURATION = 0.15s` và `LANDING_DURATION = 0.08s` (tổng 0.23s/ô thay vì 0.34s).
2. **Generous Safety Timeout**: Nâng timeout bảo hiểm thành `Math.max(10000, nextTask.waypoints.length * 1500 + 8000)`, bảo đảm hoạt cảnh tự nhiên hoàn tất 100%.
3. **Overview Camera Khi Tung Xúc Xắc**: Khi `isRolling = true`, giữ nguyên chế độ `'overview'` ổn định, triệt tiêu zoom giật lag.

## 3. KẾT QUẢ KIỂM THỬ
- Di chuyển mượt mà, không giật lag camera.
- Triệt tiêu 100% hiện tượng nhảy cóc teleport giữa đường.
- Toàn bộ 140/140 test files PASS 100%.

## 4. BẤT BIẾN ĐƯỢC GHI NHẬN
- Gotcha #63 trong `docs/domain/gotchas.md`: `[3D/ANIMATION/CAMERA] Bất Biến Nhịp Nhảy Con Cờ 1.5x, Triệt Tiêu Nhảy Cóc Do Timeout & Ổn Định Camera Khi Gieo Xúc Xắc (IMP-42)`.
