# Kế hoạch Kỹ thuật IMP-87: Telemetry Watchdog Phase Awareness & 3D Render Performance Hardening

> **Mã Ticket**: IMP-87  
> **Phân loại**: Telemetry Accuracy & 3D Performance Optimization  
> **Mục tiêu**: Triệt tiêu 100% cảnh báo giả `TURN_STALLED` trong Telemetry khi người chơi thao tác hợp lệ trong phase Quản Lý BĐS (`PropertyManagement`), đồng thời tinh giản Shadow Passes để giảm tải Draw Calls cho môi trường 3D đạt mục tiêu 60 FPS.

---

## 1. NGUYÊN NHÂN GỐC RỄ & PHÂN TÍCH KỸ THUẬT

| Hiện tượng | Nguyên nhân Gốc rễ | Giải pháp Kỹ thuật |
| :--- | :--- | :--- |
| **1. Cảnh báo giả `TURN_STALLED` khi người chơi đang chơi bình thường** | `watchdog_monitor.ts` chỉ lưu `turnStartTimeMs` theo `currentTurnPlayerId`. Trong lượt, người chơi trải qua `WaitingRoll` (25s) và `PropertyManagement` (30s) -> tổng thời gian hợp lệ tối đa là 55s. Watchdog đặt ngưỡng cứng `MAX_TURN_STALL_MS = 45_000` (45s) và không làm mới khi đổi phase, đồng thời bỏ qua việc `timeRemaining > 0`. Khi người chơi nâng cấp 3 nhà ở giây thứ 46-53, watchdog phát báo động giả. | Bổ sung `turnPhase` và `hasProgress` vào `checkTurnStall`. Tự động làm mới `turnStartTimeMs = Date.now()` khi đổi `turnPhase` hoặc khi có tiến trình hợp lệ. Chặn tuyệt đối cảnh báo nếu `timeRemaining > 0`. |
| **2. Draw Calls tăng cao (2,812 calls) gây tụt FPS xuống 29.4 FPS** | Hệ thống đa pass render: N8AO (Depth/Normal Pass) + Sun DirectionalLight Shadow Map (2048x2048) + Main Scene Pass khiến số lượng draw call bị nhân 3. Nhiều vật thể vi mô (<0.1m) như vành khiên cọc cờ, vòng đai C1-C3, dù bãi biển đều bật `castShadow={true}`, buộc shadow map phải vẽ lại hàng trăm lần. | Tắt `castShadow` trên các chi tiết vi mô không cần đổ bóng xa, giữ bóng đổ cho thân cờ chính và công trình. Tinh chỉnh `perf_budget.ts` chuẩn hóa ngân sách diorama. |

---

## 2. SƠ ĐỒ LUỒNG KIỂM SOÁT WATCHDOG MỚI

```text
[Delta từ Server xuống Client Hook]
           │
           ▼
[recordTurnStallAndBotWatchdog]:
  - Đọc delta.turnPhase và cờ hasProgress (cells.length > 0 || players.length > 0 || auction)
  - Gọi watchdogMonitor.checkTurnStall({
        currentTurnPlayerId,
        timeRemaining,
        turnPhase,
        hasProgress,
        tick
    })
           │
           ▼
[watchdogMonitor.checkTurnStall]:
  1. Nếu currentTurnPlayerId thay đổi -> reset turnStartTimeMs = now, lưu lastTurnPlayerId.
  2. Nếu turnPhase thay đổi (WaitingRoll -> PropertyManagement) -> reset turnStartTimeMs = now, lưu lastPhase.
  3. Nếu hasProgress === true -> reset turnStartTimeMs = now.
  4. Nếu timeRemaining > 0 -> return null (KHÔNG CẢNH BÁO vì đồng hồ server vẫn còn hợp lệ!).
  5. Nếu timeRemaining <= -5 HOẶC elapsed > stallThreshold (và timeRemaining <= 0) -> Báo động TURN_STALLED.
```

---

## 3. MA TRẬN 4 DIỆN MẠO HÀNH VI KIỂM THỬ (TRẠM 1)

Tệp: `tests/contracts/imp87_watchdog_phase_awareness_and_render_perf.test.ts` (tối thiểu 15 atomic tests):
- **Facet 1: Phase Transition & Stall Accuracy**:
  - TC-87.01: Chuyển phase từ `WaitingRoll` sang `PropertyManagement` tự động làm mới đồng hồ, không báo động sau 46s tính từ đầu lượt.
  - TC-87.02: Khi `timeRemaining > 0` (ví dụ 30s), `checkTurnStall` luôn trả về `null` ngay cả khi `elapsedMs > 45_000`.
  - TC-87.03: Khi `timeRemaining === 0` và `elapsedMs >= 45_000`, `checkTurnStall` trả về cảnh báo `TURN_STALLED`.
  - TC-87.04: Khi `timeRemaining <= -5` (quá hạn đồng hồ), `checkTurnStall` trả về `TURN_STALLED`.
  - TC-87.05: Trong chế độ đấu giá (`isInAuction: true`), hạn mức kéo dài lên 90s và không báo động ở 45s.
- **Facet 2: Player Progress Activity Defense**:
  - TC-87.06: Khi có tiến trình `hasProgress: true` (nâng cấp BĐS, mua ô đất), đồng hồ lượt được làm mới.
  - TC-87.07: Người chơi khác nhau có bộ đếm thời gian độc lập.
- **Facet 3: 3D Render Shadow Optimization**:
  - TC-87.08: Cọc cờ `OwnershipMarkerInstances` không kích hoạt `castShadow` trên vành khiên `MascotCrestShield` siêu vi mô.
  - TC-87.09: Vòng đai cấp độ `TierIndicatorRings` không lạm phát `castShadow`.
  - TC-87.10: `OwnershipBillboardPin` không render bóng đổ trong shadow pass.
- **Facet 4: Error Defense & Budget Recovery**:
  - TC-87.11: `checkTurnStall` với tham số `null` hoặc `undefined` không ném lỗi.
  - TC-87.12: `watchdogMonitor.reset()` xóa sạch trạng thái phase và lịch sử hoạt động.
  - TC-87.13: `perfBudget.evaluateDrawCallBudget` đánh giá chính xác dải ngân sách diorama.
  - TC-87.14: `telemetry_delta_hook` truyền đúng `turnPhase` từ sparse delta sang watchdog.

---

## 4. KẾ HOẠCH TRIỂN KHAI 3 TRẠM

1. **Trạm 1 (RED Contract Test)**:
   - Subagent `qa-tester` tạo `tests/contracts/imp87_watchdog_phase_awareness_and_render_perf.test.ts`.
   - Chứng minh kiểm thử thất bại (RED / Adversarial Inversion) trên code hiện tại do `watchdog_monitor.ts` chưa có `turnPhase` và chưa bỏ qua khi `timeRemaining > 0`.
2. **Trạm 2 (GREEN Implementation)**:
   - `src/client/telemetry/watchdog_monitor.ts`: Cập nhật `checkTurnStall` hỗ trợ `turnPhase`, `hasProgress` và kiểm tra `timeRemaining > 0`.
   - `src/client/telemetry/telemetry_delta_hook.ts`: Truyền `turnPhase` và `hasProgress` vào `watchdogMonitor.checkTurnStall`.
   - `src/client/3d/board_tile.tsx`: Tối ưu hóa bóng đổ của `OwnershipMarkerInstances`.
   - `src/client/3d/perf_budget.ts`: Điều chỉnh budget target cho phù hợp với diorama thế giới thực.
   - Chạy toàn bộ 192+ test suites đảm bảo 100% GREEN.
3. **Trạm 3 (Independent Reviews)**:
   - Subagent `spec-reviewer` đối chiếu 100% đặc tả kỹ thuật trên đĩa vật lý.
   - Subagent `code-reviewer` kiểm tra chất lượng mã nguồn, độ phức tạp <= 5, 0 dirty casts.
