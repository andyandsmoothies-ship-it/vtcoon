# Báo Cáo Cải Tiến IMP-185: Tách Rời Quỹ Kho Bạc Khỏi Mua BĐS Trong Telemetry & Giải Mã Đấu Giá Phòng VTBX1T

## 1. Kết Quả Triển Khai
- **Mã Ticket**: IMP-185
- **Mục tiêu**:
  1. Điều tra toàn diện log trận đấu phòng `VTBX1T` (Seed: `1998900184`, tệp `media_1790176970776.json`).
  2. Xác định và giải mã nguyên nhân người chơi thật bị vô hiệu hóa (`inactive`) không bấm giá được trong phiên đấu giá ô 32 (Tick 383–385).
  3. Khắc phục triệt để báo động đỏ giả `TREASURY_INVARIANT_VIOLATED` tại Tick 368 trong Telemetry Watchdog khi có giao dịch mua ô đất kết hợp biến động kho bạc.
  4. Tái cấu trúc phân rã tệp `persistent_room_logger.ts` sang `room_logger_reindexer.ts` để tuân thủ nghiêm ngặt trần <= 400 LOC của Constitution.
- **Trạng thái**: **HOÀN TẤT & ĐÃ DUYỆT (100% TESTS PASS, 0 TSC ERRORS, 0 UI LINT VIOLATIONS)**.

## 2. Thống Kê Thay Đổi Mã Nguồn
| Tệp Tin | Thao Tác | LOC Hiện Tại | Chức Năng |
| :--- | :---: | :---: | :--- |
| `src/client/telemetry/telemetry_delta_hook.ts` | CẬP NHẬT | 390 LOC | Tách biệt độc lập `cellDelta` khỏi `treasuryGain`; tinh chỉnh `resolvePurchaseCost`; bổ sung guard `isRoller` cho `detectMovement` |
| `src/server/network/turn_orchestrator.ts` | CẬP NHẬT | 396 LOC | Cách ly dọn dẹp `auctionSettleTimers` khỏi `clearRoom`; chỉ hủy triệt để trong `destroyRoom` |
| `src/server/logging/persistent_room_logger.ts` | TÁI CẤU TRÚC | 394 LOC | Rút gọn từ 453 LOC xuống 394 LOC (đạt trần <= 400 LOC) |
| `src/server/logging/room_logger_reindexer.ts` | TẠO MỚI | 76 LOC | Chứa helper `mergeCloudManifest`, `resolveLogFileName`, `resolveLogDir` |
| `tests/client/telemetry_gameplay_invariants.test.ts` | CẬP NHẬT | 385 LOC | Bổ sung 2 bài test hợp đồng `[TC-IMP185.01/MSS]` và `[TC-IMP185.02/MSS]` tái hiện chuẩn xác Tick 368 |

## 3. Bằng Chứng Nghiệm Thu & Kiểm Toán Log
1. **Phân tích Log Thực Nghiệm Phòng VTBX1T**:
   - **Phiên đấu giá ô 32 (Tick 383–385)**:
     - 1790176528533 (Tick 383): `bot_4` từ chối mua ô 32 -> bắt đầu đấu giá.
     - 1790176530141 (Tick 384): `bot_3` nâng giá lên 1.550 Tr.
     - 1790176531080: Người chơi thật `p1` bấm gửi `INTENT_BID` (số dư 5.725 Tr. hoàn toàn hợp lệ).
     - 1790176531088 (Tick 385): Chỉ 8ms sau khi người chơi bấm, server (code cũ chưa deploy IMP-184) đã đóng sàn và trao ô đất cho `bot_3`. Tổng thời gian sàn mở chỉ kéo dài **2.555 giây**. Bản sửa lỗi IMP-184 đã đảm bảo thời gian chờ 20 giây và chỉ đóng khi con người chủ động pass hoặc hết giờ.
   - **Báo động Tick 368**:
     - `actualDelta = -2350 Tr.` (mua ô đất giá 2.350 Tr. từ ngân hàng).
     - Quỹ kho bạc tăng 1.025 Tr. từ giao dịch khác.
     - Telemetry cũ gộp `treasuryGain` vào tiền mua đất dẫn đến `expected = -1325 Tr.` và báo động sai lệch.
     - Toán học toàn hệ thống bảo toàn 100% (`preTotal = 42447, postTotal = 40097`). Bản vá IMP-185 đã tách rời 2 luồng này.
2. **Quality Gates Toàn Cục**:
   - `npm test`: **308/308 test suites PASS 100% (6.264/6.264 tests passed)**.
   - `npx tsc --noEmit`: **0 lỗi TypeScript (Exit 0)**.
   - `npm run lint:ui`: **0 vi phạm UI Linter trên 171 tệp (Exit 0)**.
3. **Domain Gotchas**: Ghi nhận Bất biến số 253 trong `docs/domain/gotchas.md`.
