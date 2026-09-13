# BÁO CÁO CẢI TIẾN: TELEMETRY WATCHDOG & TRIỆT TIÊU CẢNH BÁO GIẢ TIỀN TỆ / NHẢY Ô (IMP-41)

## 1. NGUYÊN NHÂN GỐC RỄ
1. **Giả định mô hình kinh tế phẳng**: Hàm `computeExpectedDelta` chỉ nhận diện 2 nghiệp vụ (mua đất và nhận 2000 Tr qua GO không trừ thuế), mặc định mọi giao dịch khác là 0 Tr. Khi người chơi thế chấp BĐS (+1500 Tr.), hạ cấp công trình (+50%), rút thẻ vay thấu chi (+3000 Tr.) hoặc nộp thuế tài sản tích lũy qua GO, watchdog cảnh báo giả `TREASURY_INVARIANT_VIOLATED`.
2. **Gán nhầm xúc xắc cũ cho bước dịch chuyển**: `detectMovement` duyệt mảng người chơi và tự động lấy xúc xắc `delta.dice` của lượt trước gán vào các sự kiện dịch chuyển đặc biệt (sân bay, thanh tra vào tù ô 30 -> 10, thẻ nhạc hội kéo về ô 39), làm sai lệch so sánh bước đi và báo `INVALID_POSITION_STEP`.

## 2. GIẢI PHÁP KỸ THUẬT
1. **Telemetry Teleport Recognition**: `checkIsTeleport` nhận diện dịch chuyển hợp lệ giữa các sân bay (5, 15, 22, 35), ô thanh tra thuế 30 vào tù 10, và thẻ sự kiện. Đặt `isTeleport: true` để bỏ qua kiểm tra số bước với xúc xắc.
2. **Bản đồ hóa dòng tiền toàn diện**: `computeExpectedDelta` tính toán giải ngân thế chấp (+50% giá đất), hoàn tiền hạ cấp (+50% chi phí xây), vay thấu chi (+3000 Tr.) và trừ thuế tài sản tích lũy `calculateGoPropertyTax`.
3. **Null Exemption**: Trả về `null` cho các ô sự kiện ngoài luồng và trạng thái vỡ nợ để bỏ qua an toàn thay vì ép về 0.

## 3. KẾT QUẢ KIỂM THỬ
- Triệt tiêu 100% cảnh báo giả trong quá trình chơi thực tế.
- Toàn bộ 139/139 test files PASS 100%.
- Không có lỗi biên dịch TypeScript.

## 4. BẤT BIẾN ĐƯỢC GHI NHẬN
- Gotcha #62 trong `docs/domain/gotchas.md`: `[CLIENT/TELEMETRY] Bất Biến Watchdog Giám Sát Bất Biến Luật Chơi & Triệt Tiêu Báo Động Giả Tiền Tệ / Nhảy Ô (IMP-41)`.
