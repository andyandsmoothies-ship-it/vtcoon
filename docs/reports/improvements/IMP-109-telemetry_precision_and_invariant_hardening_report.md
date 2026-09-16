# Báo Cáo Hoàn Tất Cải Tiến IMP-109: Chuẩn Hóa Telemetry Watchdog, Đồng Bộ diceRollerId & Đối Soát Đấu Giá (Telemetry Watchdog Precision & Invariant Hardening)

> **Mã báo cáo:** IMP-109  
> **Trạng thái:** 🟢 **Hoàn Tất 100%**  
> **Ngày hoàn thành:** 2026-09-16  
> **Traceability:** Gotcha #142 | 15 atomic contract tests PASS 100% | 216/216 test suites PASS (4.267 tests) | `npm run lint:ui` 0 lỗi | `node scripts/lint_slop.mjs` 0 lỗi | `npm run build` exit code 0  

---

## 1. Tóm Tắt Kết Quả Triển Khai

Đáp ứng trực tiếp yêu cầu đối soát và khắc phục triệt để 5 cảnh báo vi phạm từ Hộp Đen Telemetry ván đấu trực tiếp:

1. **Khử 100% cảnh báo giả `INVALID_POSITION_STEP` (Tick 26, 95, 207)**:
   - Trong [`src/client/telemetry/telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts), hàm `detectMovement` được export và mở rộng logic xác thực:
     ```typescript
     const isRoller = delta.diceRollerId !== undefined
       ? delta.diceRollerId === p.id
       : (!delta.currentTurnPlayerId || delta.currentTurnPlayerId === p.id);
     ```
   - Bảo toàn xúc xắc `delta.dice` cho người vừa di chuyển ngay cả khi delta đã chuyển tiếp sang lượt `WaitingRoll` của người chơi tiếp theo.

2. **Khử 100% cảnh báo giả `TREASURY_INVARIANT_VIOLATED` (Tick 3)**:
   - Trong `telemetry_delta_hook.ts`, trích xuất helper `resolvePurchaseCost` giúp `computeCellDelta` giữ mức SLOC tinh gọn (28 dòng).
   - Khi một ô đất được sang tên mới (`cell.ownerId && !prevOwner`), chi phí mua đối soát trực tiếp theo số tiền sụt giảm thực tế của tài khoản người mua (`buyerPre.balance - buyerDelta.balance`), ghi nhận chính xác giá thắng đấu giá 1.650 Tr thay vì bị rơi về giá khởi điểm 500 Tr.
   - Bù trừ phần tiền đấu giá hoặc thuế nộp vào Kho Bạc: `expected += cellDelta + absorbedTreasury`.

3. **Khử 100% cảnh báo giả `FSM_ANIMATION_STALLED` (Tick 0)**:
   - Trong [`src/client/telemetry/watchdog_monitor.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/watchdog_monitor.ts), hỗ trợ tham số `maxAllowedMs?: number` trong `checkFsmAnimationStall` và `recoverFsmAnimationStall` (giữ nguyên mặc định 10.000ms cho các hợp đồng kiểm thử cũ).
   - Trong [`src/client/telemetry/perf_telemetry_tracker.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/perf_telemetry_tracker.tsx), ngân sách hoạt ảnh được tính toán linh hoạt theo khối lượng bước nhảy: `maxAllowedMs = Math.max(10_000, totalWaypoints * 1200 + 5000)`. Thời gian nhảy 10.225s ở 30 FPS không còn bị báo lỗi giả.

---

## 2. Kết Quả Kiểm Thử & Nghiệm Thu (Quy Trình 3 Trạm)

- **Trạm 1 (RED)**: Bộ kiểm thử hợp đồng [`imp109_telemetry_precision_and_invariant_hardening.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp109_telemetry_precision_and_invariant_hardening.test.ts) (15 atomic tests). Đã kiểm chứng Adversarial Inversion (10 tests FAIL trên mã nguồn cũ).
- **Trạm 2 (GREEN)**: Toàn bộ 15/15 tests PASS 100%.
- **Trạm 3 (Audit & Verification)**:
  - 8/8 test suites liên quan đến Telemetry và Watchdog (151 tests) PASS 100%.
  - 216/216 test suites toàn dự án (4.267 tests) PASS 100% trong 40.16s.
  - `npm run lint:ui`: 0 vi phạm trên 146 tệp.
  - `node scripts/lint_slop.mjs`: 0 Hard Violations trên 214 tệp.
  - `npm run build`: Thành công 100% (Client + SSR server, exit code 0).
  - Sổ tay bất biến: Bổ sung Gotcha #142 vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).
