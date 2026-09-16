# Báo Cáo Nghiệm Thu Cải Tiến IMP-87: Telemetry Watchdog Phase Awareness & 3D Render Performance Hardening

> **Ticket**: IMP-87  
> **Trạng thái**: 🟢 **Hoàn Tất & Phê Duyệt 100%**  
> **Ngày hoàn thành**: 2026-09-16  
> **Kế hoạch**: [`IMP-87_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-87-telemetry_watchdog_phase_awareness_and_render_perf_hardening_plan.md)  
> **Gotcha**: #115 trong [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)

---

## 1. TỔNG QUAN NGUYÊN NHÂN & NGUỒN GỐC LỊCH SỬ

Dựa trên dữ liệu chẩn đoán telemetry thực tế từ người dùng (`media_1789517158791.png` và dump JSON):

1. **Báo động giả `TURN_STALLED` khi người chơi đang thao tác hợp lệ**:
   - *Nguồn gốc*: Triển khai từ **IMP-50 / IMP-54**.
   - *Nguyên nhân*: `watchdog_monitor.ts` chỉ lưu `turnStartTimeMs` theo `currentTurnPlayerId`. Khi lượt chuyển từ `WaitingRoll` (25s) sang `PropertyManagement` (30s), tổng thời gian hợp lệ có thể lên tới 55s. Watchdog đặt ngưỡng cứng 45s (`MAX_TURN_STALL_MS = 45_000`) và không làm mới khi chuyển phase, đồng thời bỏ qua việc máy chủ đang phát `timeRemaining > 0` (còn 30s). Do đó, khi người chơi nâng cấp 3 nhà ở giây thứ 46, 50, 53, watchdog phát 3 cảnh báo giả liên tiếp.
   - *Khắc phục*: `checkTurnStall` nhận `turnPhase`, `hasProgress`, tự động reset mốc thời gian khi đổi phase hoặc có hành động nâng cấp/mua bán, đồng thời chặn tuyệt đối mọi cảnh báo kẹt lượt nếu `timeRemaining > 0`.

2. **Lạm phát Draw Calls (2,812 calls) làm tụt FPS xuống 29.4 FPS**:
   - *Nguồn gốc*: Kiến trúc render 3-pass (N8AO Depth/Normal Pass + Sun DirectionalLight Shadow Map 2048x2048 + Main Scene Pass).
   - *Nguyên nhân*: Hệ thống nhân 3 số lượng mesh được render. Nhiều chi tiết hình học siêu vi mô (<0.1m) trên cọc cờ sở hữu `OwnershipMarkerInstances` (vành khiên 7.5cm, mặt khiên 6.5cm, các vòng đai bậc C1–C3) bật cờ `castShadow={true}` một cách không cần thiết, buộc GPU shadow pass phải tính toán đổ bóng cho hàng trăm mesh vi mô vô hình từ xa.
   - *Khắc phục*: Tắt `castShadow` trên toàn bộ các chi tiết vi mô của `OwnershipMarkerInstances`, bảo toàn bóng đổ cho thân cọc cờ chính `FlagPole` và cờ phướn `FlagCloth`.

3. **Vết lưu vi phạm cũ trong bộ nhớ đệm Telemetry**:
   - Lỗi `INVALID_POSITION_STEP` tại tick 105 là vết lưu cũ từ vòng 6 (đã được sửa triệt để ở IMP-86 qua việc chống race condition vị trí quân cờ), tồn đọng do store telemetry chưa xóa lịch sử phiên cũ.

---

## 2. CÁC TỆP ĐÃ THAY ĐỔI & THÊM MỚI

| Tệp | Loại | Mô tả |
| :--- | :---: | :--- |
| [`src/client/telemetry/watchdog_monitor.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/watchdog_monitor.ts) | Modify | Thêm `turnPhase`, `hasProgress`, `lastPhase`, reset đồng hồ theo phase/hành động, chặn stall khi `timeRemaining > 0` |
| [`src/client/telemetry/telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts) | Modify | Chuyển tiếp `turnPhase` và tính cờ `hasProgress` từ sparse delta sang `checkTurnStall` |
| [`src/client/3d/board_tile.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_tile.tsx) | Modify | Tắt `castShadow` trên vành/mặt khiên `MascotCrestShield` và các vòng đai `TierIndicatorRings` C1–C3 |
| [`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts) | Modify | Thêm thuộc tính `turnPhase?: string` vào giao diện `GameState` |
| [`tests/contracts/imp87_watchdog_phase_awareness_and_render_perf.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp87_watchdog_phase_awareness_and_render_perf.test.ts) | New | 18 atomic tests hợp đồng kiểm định 4 diện mạo hành vi |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Modify | Ghi nhận Bất biến Gotcha #115 |

---

## 3. BẰNG CHỨNG KIỂM ĐỊNH CHẤT LƯỢNG

- **Hợp Đồng Kiểm Thử IMP-87**: `18/18 PASS (100%)` (20ms).
- **TypeScript Strict Mode**: `npx tsc --noEmit` -> 0 lỗi.
- **UI Linter**: `npm run lint:ui` -> 0 violations trên toàn bộ 137 tệp.
- **Thẩm Định Độc Lập Trạm 3**:
  - `spec-reviewer`: **APPROVED (100% Pass)**
  - `code-reviewer`: **APPROVED (Complexity <= 5, đúng chuẩn LOC limits)**
