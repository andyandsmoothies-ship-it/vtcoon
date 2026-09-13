# KẾ HOẠCH KỸ THUẬT: TELEMETRY WATCHDOG & TRIỆT TIÊU CẢNH BÁO GIẢ TIỀN TỆ / NHẢY Ô (IMP-41)

## 1. MỤC TIÊU & BỐI CẢNH
- **Mục tiêu**: Xử lý triệt để các cảnh báo giả `TREASURY_INVARIANT_VIOLATED` và `INVALID_POSITION_STEP` trong Telemetry Watchdog khi người chơi thực hiện các nghiệp vụ tài chính và dịch chuyển đặc biệt hợp lệ.
- **Phạm vi**: `src/client/telemetry/telemetry_watchdog.ts`, `src/client/telemetry/telemetry_cash_flow.ts`.

## 2. NGUYÊN NHÂN KỸ THUẬT
1. **Giả định mô hình kinh tế phẳng**: `computeExpectedDelta` chỉ nhận diện mua đất và thưởng qua GO (2000 Tr.), coi các biến động khác là 0 Tr. Khi người chơi thế chấp BĐS (+1500 Tr.), hạ cấp công trình (+50%), rút thẻ vay thấu chi (+3000 Tr.) hoặc nộp thuế tài sản tích lũy qua GO, watchdog cảnh báo giả vi phạm bảo toàn tiền tệ.
2. **Gán nhầm xúc xắc cũ cho bước dịch chuyển**: `detectMovement` gán xúc xắc lượt trước vào các bước dịch chuyển đặc biệt (sân bay, vào tù ô 30 -> 10, hòa nhạc MC_MEGA_CONCERT kéo về ô 39), làm sai lệch so sánh bước đi.

## 3. THIẾT KẾ TRIỂN KHAI
1. **Nhận diện dịch chuyển đặc biệt (`checkIsTeleport`)**: Đánh dấu `isTeleport: true` cho sân bay (5, 15, 22, 35), lệnh bắt vào tù (ô 30 -> 10) và hiệu ứng thẻ bài kéo về ô khác. Bỏ qua so sánh bước đi với xúc xắc khi `isTeleport: true`.
2. **Bản đồ hóa dòng tiền toàn diện (`computeExpectedDelta`)**: Hỗ trợ thế chấp (+50% giá đất), hạ cấp (+50% tiền xây), vay thấu chi (+3000 Tr.) và thuế tích lũy GO.
3. **Null Exemption**: Trả về `null` cho các ô sự kiện ngoài luồng hoặc khi trong pha xử lý vỡ nợ để bỏ qua kiểm tra thay vì ép về 0.

## 4. KẾ HOẠCH KIỂM THỬ
- Contract test kiểm tra đầy đủ các kịch bản dòng tiền và dịch chuyển hợp lệ.
- Bảo đảm 100% test suites hiện hành pass.
