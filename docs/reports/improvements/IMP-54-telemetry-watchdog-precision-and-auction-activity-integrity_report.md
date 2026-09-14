# Báo Cáo Cải Tiến IMP-54: Chuẩn Hóa Watchdog Telemetry, Tự Giải Cứu Hoạt Cảnh FSM & Toàn Vẹn Nhật Ký Đấu Giá

## 1. Tổng quan Đợt Cải Tiến
- **Mã định danh**: IMP-54
- **Tiêu đề**: Telemetry Watchdog Precision, FSM Animation Auto-Recovery & Auction Activity Integrity
- **Ngày hoàn thành**: 2026-09-14
- **Trạng thái**: ✔️ DONE (Đạt chuẩn 3 Trạm theo Hiến pháp GEMINI.md)

---

## 2. Các Vấn Đề Gốc Rễ Đã Khắc Phục

| # | Hiện tượng | Nguyên nhân kỹ thuật | Giải pháp triển khai | Trạng thái |
|---|---|---|---|:---:|
| 1 | **WebGL Telemetry hiển thị Draw Calls: 1, Triangles: 1** | Three.js tự động reset `gl.info` (`autoReset = true`) sau mỗi pass của `@react-three/postprocessing` (`EffectComposer`), khiến pass blit cuối cùng ghi đè bộ đếm. | Tắt `gl.info.autoReset = false` trên Canvas; đọc báo cáo tích lũy toàn frame rồi chủ động gọi `gl.info.reset()` trong `useFrame`. | ✔️ FIXED |
| 2 | **FSM Animation Stall spam 185s** | Cờ `activePawnAnimation.isAnimating` bị kẹt trong store; watchdog chỉ ghi nhận lỗi mà không có cơ chế tự giải cứu. | Bổ sung hàm `recoverFsmAnimationStall` tự động gọi `clearActivePawnAnimation()` khi kẹt > 10s, đưa store về trạng thái hợp lệ và ngắt spam lỗi. | ✔️ FIXED |
| 3 | **TREASURY_INVARIANT_VIOLATED sai lệch khi đấu giá & vượt GO** | `computeCellDelta` chỉ tính theo giá niêm yết trong sổ hồng (`deed.price`) thay vì giá thắng đấu giá thực tế (`highestBid`); `checkIsTeleport` gán nhầm cờ teleport trong pha `PropertyManagement` khiến bỏ qua lương GO. | Tính đúng số tiền trả theo phiên đấu giá (`highestBid`); cho phép di chuyển trong pha `PropertyManagement` tính trọn vẹn lương GO (+2.000 Tr.). | ✔️ FIXED |
| 4 | **Báo động giả INVALID_POSITION_STEP** | `detectMovement` lấy nhầm xúc xắc lưu của lượt trước khi quân cờ đổi ô do thẻ sự kiện; `AIRPORT_CELLS` ghi nhầm ô 22 thay vì ô 25. | Cập nhật `AIRPORT_CELLS = [5, 15, 25, 35]`; bảo đảm chỉ so khớp xúc xắc khi quân cờ di chuyển theo lượt đổ hợp lệ. | ✔️ FIXED |
| 5 | **Nhật ký đấu giá sinh 2 log (mua + nộp thuế)** | `processPayerFee` kiểm tra cứng `deed.price === absDiff`, do tiền đấu giá khác giá gốc nên xuất thêm log thuế; `detectCellTrade` ghi sai giá mua. | Đánh dấu khoản trừ tiền khi mua ô đất (kể cả đấu giá) là `isPurchase = true` để chặn log thuế; ghi đúng thông điệp "đã thắng đấu giá ... với giá ...". | ✔️ FIXED |

---

## 3. Bằng Chứng Nghiệm Thu Kỹ Thuật
- **Hợp đồng kiểm thử (Station 1 RED & Station 2 GREEN)**:
  `tests/contracts/telemetry_watchdog_and_auction_activity_contract.test.ts`
  - 24/24 atomic tests PASS (100% GREEN, thời gian chạy: 12ms).
  - Bao phủ trọn vẹn Universal 4-Facet Behavioral Matrix.
- **Kiểm soát chất lượng mã nguồn (Station 3)**:
  - `npm run gate:quick`: 0 lỗi TypeScript, 0 vi phạm UI lint, 0 dirty cast.
  - Toàn bộ 156 test files (2.189 tests) PASS 100%.
  - Giới hạn kích thước file: Core Logic <= 400 LOC, UI <= 500 LOC.
- **Bài học kinh nghiệm (Active Domain Memory)**:
  - Đã ghi nhận Gotcha #75 vào `docs/domain/gotchas.md`.
