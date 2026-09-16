# Kế Hoạch Cải Tiến IMP-109: Chuẩn Hóa Telemetry Watchdog, Đồng Bộ diceRollerId & Đối Soát Đấu Giá (Telemetry Watchdog Precision & Invariant Hardening)

> **Mã kế hoạch:** IMP-109  
> **Trạng thái:** 🟢 **Hoàn Tất**  
> **Ngày thực hiện:** 2026-09-16  
> **Phạm vi tác động:** `src/client/telemetry/telemetry_delta_hook.ts`, `src/client/telemetry/watchdog_monitor.ts`, `src/client/telemetry/perf_telemetry_tracker.tsx`, `tests/contracts/imp109_telemetry_precision_and_invariant_hardening.test.ts`  

---

## 1. Bối Cảnh & Mục Tiêu

Trong quá trình chơi thử nghiệm ván đấu trực tiếp (Vòng 15/30, roomCode: VTCOON, seed: 12345), Hộp Đen Telemetry đã ghi nhận 5 cảnh báo vi phạm (4 Critical, 1 Warning). Sau khi đối chiếu lịch sử các IMP trước (IMP-41, IMP-44, IMP-54, IMP-80, IMP-86, IMP-103, IMP-105), phân tích xác định đây là 3 kịch bản kiểm tra biên phát sinh cảnh báo sai:
1. **Lỗi `INVALID_POSITION_STEP` (3 lần tại Tick 26, 95, 207)**: `detectMovement` kiểm tra quyền di chuyển theo `currentTurnPlayerId === p.id`. Khi lượt chơi tự động chuyển tiếp sang người kế tiếp (`WaitingRoll`), biến này bị gán sang Bot, làm thuộc tính `dice` bị gán `undefined`. Hệ thống chưa tận dụng trường `diceRollerId` đã được cấp từ IMP-44.
2. **Lỗi `FSM_ANIMATION_STALLED` (Tick 0)**: Ngưỡng cứng `10_000ms` quá sát so với thời lượng thực tế của các bước nhảy dài (9-11 ô) khi WebGL render ở mức ~30 FPS (thực tế 10.225s, chỉ vượt 225ms).
3. **Lỗi `TREASURY_INVARIANT_VIOLATED` (Tick 3)**: Khi phiên đấu giá kết thúc, `computeCellDelta` đọc nhầm giá khởi điểm 500 Tr từ `preState.auction` thay vì giá thắng thầu thực tế 1.650 Tr được khấu trừ từ ví người mua.

---

## 2. Kế Hoạch Giải Pháp (Universal 4-Facet Behavioral Matrix)

- **Facet 1: Dice Roller Attribution**:
  - Mở rộng `detectMovement` ưu tiên kiểm tra `delta.diceRollerId === p.id` trước khi đối chiếu `currentTurnPlayerId`.
  - Bảo toàn trọn vẹn `delta.dice` cho người vừa di chuyển trong delta chuyển tiếp lượt.
- **Facet 2: Auction Actual Cash Outflow Reconciliation**:
  - Trích xuất `resolvePurchaseCost`: Khi một ô đất nhận chủ mới (`cell.ownerId && !prevOwner`), đối soát trực tiếp số tiền sụt giảm thực tế của tài khoản người mua (`buyerPre.balance - buyerDelta.balance`) nếu có.
  - Bù trừ phần tiền đấu giá hoặc nộp thuế hấp thụ vào Kho Bạc (`absorbedTreasury = Math.min(treasuryGain, -cellDelta)`).
- **Facet 3: Workload-Aware Dynamic Animation Budget**:
  - Hỗ trợ tham số `maxAllowedMs?: number` trong `checkFsmAnimationStall` và `recoverFsmAnimationStall`, bảo tồn mặc định 10.000ms cho các bài test cũ.
  - Trong `perf_telemetry_tracker.tsx`, tính toán ngân sách thời gian động theo số bước nhảy: `Math.max(10_000, totalWaypoints * 1200 + 5000)`.
- **Facet 4: Error Defense & Boundary Recovery**:
  - Phòng thủ trường hợp `diceRollerId` không xác định (fallback an toàn về `isTurnPlayer`).
  - Đảm bảo các trường hợp thất thoát thật (> 15s hoặc mất tiền ngoài quy tắc) vẫn bị bắt 100%.

---

## 3. Kế Hoạch Kiểm Thử (Quy Trình 3 Trạm)

1. **Trạm 1 (RED Contract Test)**:
   - Viết 15 atomic tests trong `tests/contracts/imp109_telemetry_precision_and_invariant_hardening.test.ts`.
   - Chứng minh Adversarial Inversion: 10 tests FAIL trên mã nguồn cũ.
2. **Trạm 2 (GREEN Implementation)**:
   - Cập nhật `telemetry_delta_hook.ts`, `watchdog_monitor.ts`, `perf_telemetry_tracker.tsx`.
   - Đạt 15/15 tests PASS.
3. **Trạm 3 (Audit & Verification)**:
   - Kiểm tra hồi quy toàn bộ 8 test files telemetry (151/151 tests PASS).
   - Chạy full test suite (`npm test`, 216 files, 4.267 tests PASS).
   - Kiểm tra linters (`npm run lint:ui`, `node scripts/lint_slop.mjs`).
   - Biên dịch sản phẩm (`npm run build`).
   - Cập nhật Gotcha #142 và Master Roadmap.
