# [IMP-182] Báo Cáo Nghiệm Thu: Mobile Tab Inactivity / Background Resilience, Reconnect Unfreeze & Full-Sync Telemetry Calibration

> Ticket: IMP-182  
> Trạng Thái: 🟢 **Hoàn Tất (Đã Nghiệm Thu Trạm 3)**  
> Ngày Hoàn Thành: 2026-09-23  
> Bản Kế Hoạch Tham Chiếu: [`docs/plans/improvements/IMP-182-mobile-inactivity-and-reconnect-unfreeze_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-182-mobile-inactivity-and-reconnect-unfreeze_plan.md)  
> Báo Cáo Thẩm Định Kế Hoạch: [`.agents/audit/PLAN_AUDIT_IMP182.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP182.md)  
> Bằng Chứng Vật Lý Snapshot: [`.agents/evidence/imp182_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp182_snapshot.json)  

---

## 1. Tóm Tắt Vấn Đề Người Dùng Báo Cáo

1. **Phản ánh từ người chơi trên di động**:
   *"Review game này, ngoài các lỗi thì tôi có afk trên điện thoại vài phút sau đó quay lại bị kẹt không bấm gì được. Ngoài ra có vẻ web trên điện thoại nếu quay ra tab khác hoặc inactive bị treo ứng dụng thì phải"*
2. **Dữ liệu Telemetry Hộp Đen (`media_1790153895061.json` - Phòng `VTM1RJ`)**:
   Phát hiện 5 vi phạm Invariant nghiêm trọng trên Chrome Mobile:
   - **Tick 159**: `TREASURY_INVARIANT_VIOLATED` (sai lệch -1.550 Tr., kỳ vọng -3.000 Tr.) sau khi mạng chập chờn nhận lại gói Full Sync 40 ô đất.
   - **Tick 226**: `TREASURY_INVARIANT_VIOLATED` (sai lệch 1.540 Tr., kỳ vọng 2.000 Tr.) do người chơi vượt GO (+2.000 Tr.) nhưng đồng thời vỡ nợ hoặc chịu chi phí chưa mô hình hóa (`isUnmodeledEvent`), code telemetry vẫn cưỡng ép áp dụng `expected = 2000`.
   - **Tick 243**: `INVALID_POSITION_STEP` (quân cờ nhảy từ ô 17 tới 24 không có xúc xắc) và `TREASURY_INVARIANT_VIOLATED` (sai lệch 265 Tr., kỳ vọng 550 Tr.) sau 67 giây AFK nhận lại Full Sync 40 ô đất.
   - **Tick 247**: `TREASURY_INVARIANT_VIOLATED` (sai lệch -1.008 Tr., kỳ vọng -1.260 Tr.) do bot nâng cấp ô 16 từ C1 lên C2 dưới tác động giảm giá 20% của thẻ thị trường `MC_CREDIT_STIMULUS` (`property_upgrade.ts#L93`), nhưng hook telemetry không tính chiết khấu này.

---

## 2. Giải Pháp Kỹ Thuật Đã Triển Khai (4 Trụ Cột Hoàn Thiện)

### 2.1. Quản Lý Vòng Đời Hiển Thị, Khử Rung & Watchdog Zombie Socket (`use_game_ws.ts`)
- **Chặn trùng lặp kết nối**: Thêm điều kiện chặn cả `readyState === 0` (`CONNECTING`) và `readyState === 1` (`OPEN`) trong `connect()`.
- **Khử rung (Debounce) 200ms**: Bắt các sự kiện `document.visibilitychange`, `window.focus`, `window.pageshow` và gộp lại trong 200ms để chống bão đa kết nối khi mở khóa điện thoại.
- **Dọn dẹp hoạt ảnh khi thức dậy**: Khi tab chuyển sang `visible`, ngay lập tức dọn dẹp sạch `clearActivePawnAnimation()`, `pawnAnimationQueue`, `pendingPawnMove`, và `setIsRolling(false)`.
- **Resync Watchdog 2.5s**: Nếu socket đang ở `readyState === 1`, gửi `INTENT_REQUEST_RESYNC` và khởi động watchdog 2.5s. Nếu sau 2.5s không nhận được delta phản hồi từ server (chứng tỏ socket là zombie half-open do mạng di động ngắt ngầm), cưỡng chế đóng socket và gọi `connect()` mới.
- **Hủy watchdog khi nhận dữ liệu**: Trong `socket.onmessage`, hủy ngay watchdog timer khi nhận tin nhắn hợp lệ đầu tiên.

### 2.2. Dọn Dẹp Tuyệt Đối & Tách Biệt Full Sync Khỏi Xúc Xắc Động (`apply_delta.ts`)
- **Bỏ qua `syncDiceRoll` khi nhận Full Sync (40 ô đất)**:
  Full Sync là một snapshot tĩnh đồng bộ trạng thái bàn cờ, không phải là sự kiện người chơi tung xúc xắc trực tiếp. Bỏ qua `syncDiceRoll` triệt tiêu 100% việc kích hoạt lại `isRolling: true` ảo và âm thanh xúc xắc giả.
- **Dọn dẹp cờ vô điều kiện**:
  Khi `isFullSync === true`, dọn dẹp triệt để `clearActivePawnAnimation()`, `setIsRolling(false)`, và `setHasRolledThisTurn(false)`.
- **Triệt tiêu Turn N+1 State Leak**:
  Trong `syncTurnAndTimer`, tự động reset `state.setHasRolledThisTurn(false)` mỗi khi `currentTurnPlayerId` thay đổi, bảo đảm khi người chơi thức dậy giữa lượt bot không bị mất lượt oan ở lượt kế tiếp.

### 2.3. Ngân Sách Bố Cục 360px & ActionDock Unfreeze (`action_dock.tsx`)
- **Khắc phục tràn bố cục (Layout Overflow)**:
  Bổ sung `max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar` vào thẻ `<nav>`, bảo đảm tất cả nút bấm co giãn an toàn, không đẩy nút *"Kết Thúc Lượt"* văng khỏi màn hình 360px.
- **Nhãn nút Đổ Xúc Xắc co giãn thông minh**:
  Trên màn hình hẹp (`< sm`), nhãn hiển thị gọn `🎲 Đổ`; trên màn hình lớn hiển thị `🎲 Đổ Xúc Xắc`.
- **Giải phóng cờ `isRollPending`**:
  Lắng nghe `visibilitychange` và `turnPhase === TurnPhase.WaitingRoll` để tự động đưa `isRollPending` về `false`, mở khóa nút Đổ ngay lập tức khi vào lượt.

### 2.4. Hiệu Chuẩn Hook Telemetry Invariant & Tinh Gọn LOC (`telemetry_delta_hook.ts`)
- **Triệt tiêu vi phạm giả khi Reconnect (Ticks 159 & 243)**:
  - Bổ sung `isFullSync` vào `isInitialSetupOrCalibration`.
  - Vô hiệu hóa `detectMovement` khi `isFullSync === true` (`movement = undefined`).
- **Khắc phục vi phạm sai lệch kỳ vọng (Tick 226)**:
  - Sửa dòng 303: `if (isUnmodeledEvent(delta, preState)) return null;`. Khi có biến cố vỡ nợ hoặc chi phí chưa mô hình hóa, bắt buộc trả về `null` thay vì cưỡng ép kỳ vọng +2.000 Tr. từ ô GO.
- **Hỗ trợ chiết khấu 20% của `MC_CREDIT_STIMULUS` (Tick 247)**:
  - `computeCellDelta` đọc `activeModifiers` và áp dụng `Math.floor(rawCost * 0.8)` khi nâng cấp ô đất.
- **Tối ưu trần LOC**:
  - Hoist `MOVEMENT_PHASES` và `CHANCE_MARKET_CELLS` ra ngoài module scope, giảm từ 402 LOC xuống **379 LOC** (hoàn toàn an toàn dưới trần 400 LOC).

---

## 3. Các Thay Đổi Mã Nguồn & Đo Lường LOC

| Tệp Mã Nguồn | Hành Động | LOC Hiện Tại | Giới Hạn Hiến Pháp | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: |
| [`src/client/network/use_game_ws.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_game_ws.ts) | MODIFY | 393 LOC | <= 400 LOC | ✅ PASS |
| [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts) | MODIFY | 260 LOC | <= 300 LOC | ✅ PASS |
| [`src/client/ui/action_dock.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx) | MODIFY | 396 LOC | <= 500 LOC | ✅ PASS |
| [`src/client/telemetry/telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts) | REFACTOR | 379 LOC | <= 400 LOC | ✅ PASS |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | MODIFY | Gotcha #250 | - | ✅ Recorded |

---

## 4. Bằng Chứng Kiểm Thử & Nghiệm Thu (Evidence & DoD Verification)

1. **Bộ Kiểm Thử Hợp Đồng Trạm 1**:
   - Tệp test: [`tests/client/imp182_mobile_inactivity_and_reconnect_unfreeze.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp182_mobile_inactivity_and_reconnect_unfreeze.test.ts)
   - Kết quả: **25/25 tests PASS 100%** (38ms execution).
2. **Kiểm Thử Hồi Quy Toàn Dự Án**:
   - `npm test`: **306/306 test files PASS (6.221 tests GREEN, 0 regressions)**.
3. **Kiểm Tra Biên Dịch TypeScript & Linter UI**:
   - `npx tsc --noEmit`: 0 lỗi biên dịch.
   - `npm run lint:ui`: 0 vi phạm trên 171 tệp UI (vượt qua 4/4 anti-patterns).
4. **Trạm 3 Phê Duyệt Độc Lập**:
   - `ui-craft-reviewer`: **`disposition: ship`** (0 lỗi vật lý, 360px budget an toàn).
   - `spec-reviewer`: **`APPROVED 100%`** (khớp hoàn toàn spec, 0 scope drift, snapshot xác minh).
5. **Ràng Buộc Gotcha**:
   - Gotcha #250 đã được lưu trữ trong SSOT Active Memory.
