# Kế hoạch IMP-54: Chuẩn hóa Watchdog Telemetry, Tự Giải Cứu Hoạt Cảnh FSM & Toàn Vẹn Nhật Ký Đấu Giá

## 1. Bối cảnh & Mục tiêu

Sau khi rà soát toàn diện tệp dump `media_1789358033915.json` và ảnh telemetry `media_1789358027873.png`, `media_1789358039391.jpg` của người dùng, hệ thống cần giải quyết dứt điểm 5 vấn đề cốt lõi:
1. **WebGL Metrics qua EffectComposer**: Chỉ số Draw Calls và Triangles bị reset về 1 do Three.js `autoReset = true` xóa bộ đếm sau mỗi pass hậu kỳ.
2. **Auto-Recovery cho FSM Animation Stall**: Quân cờ bị kẹt hoạt cảnh >10s cần được tự động giải cứu bằng `clearActivePawnAnimation()` thay vì để watchdog cảnh báo kéo dài đến 185s.
3. **Chính xác hóa Invariant Ngân Khố (Treasury Invariant)**: Xử lý đúng số tiền người chơi trả khi thắng đấu giá (`highestBid`) thay vì chỉ tính giá gốc sổ hồng (`deed.price`), và bảo toàn tiền lương 2.000 Tr. khi vượt ô Khởi hành hạ cánh xuống ô tài sản (`PropertyManagement`).
4. **Triệt tiêu cảnh báo giả `INVALID_POSITION_STEP`**: Chỉ so khớp xúc xắc khi quân cờ di chuyển theo lượt đổ hợp lệ; bỏ qua so khớp xúc xắc cũ khi quân cờ đổi ô do thẻ sự kiện; chuẩn hóa ô sân bay (thay ô 22 thành ô 25).
5. **Hợp nhất Nhật ký Đấu Giá (Activity Feed)**: Ngăn chặn việc vừa ghi nhận "đã mua" vừa ghi nhận "đã nộp phí/thuế" khi thắng đấu giá; ghi đúng giá thắng đấu giá.

## 2. Kế hoạch Triển khai 3 Trạm

- **Trạm 1 (RED Contract Test)**: `qa-tester` tạo `tests/contracts/telemetry_watchdog_and_auction_activity_contract.test.ts` với tối thiểu 15 atomic tests tuân thủ Universal 4-Facet Behavioral Matrix. Chứng minh kiểm thử fail trên mã nguồn hiện tại.
- **Trạm 2 (GREEN Implementation)**: `implementer` chỉnh sửa tối thiểu mã nguồn trong:
  - `src/client/game_canvas.tsx`
  - `src/client/telemetry/telemetry_delta_hook.ts`
  - `src/client/network/activity_property_tracker.ts`
  - `src/client/network/activity_financial_tracker.ts`
- **Trạm 3 (Physical Disk Review & Verification)**: `spec-reviewer` và `code-reviewer` kiểm tra độc lập trên đĩa vật lý, chạy `npm run gate:quick` và toàn bộ test suites. Rebuild Docker container.
