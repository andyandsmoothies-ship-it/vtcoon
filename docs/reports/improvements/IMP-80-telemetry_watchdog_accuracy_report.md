# BÁO CÁO CẢI TIẾN: IMP-80 — CHUẨN HÓA TELEMETRY WATCHDOG & TRIỆT TIÊU BÁO ĐỘNG GIẢ

> **Mã cải tiến**: IMP-80  
> **Lĩnh vực**: `[TELEMETRY]`, `[FSM]`, `[NET]`, `[UI]`  
> **Trạng thái**: 🟢 Hoàn Tất  
> **Ngày hoàn tất**: 15/09/2026  

---

## 1. TỔNG QUAN KẾT QUẢ
Đã phân tích, xử lý và triệt tiêu vĩnh viễn toàn bộ các nguyên nhân gốc rễ gây ra 19 báo động giả (False-Positives) trong nhật ký viễn trắc thi đấu thực tế (`roomCode: VTCOON`, Round 8 – 24, Ticks 1 – 305):

1. **Chuẩn Hóa Dòng Tiền Vượt GO Nộp Thuế BĐS Vào Kho Bạc**:
   - Cập nhật `calculateGoSalary` trong [`telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts): Nhận diện phần thuế BĐS nộp vào Kho Bạc (`treasuryGain = postTreasury - preTreasury`), bù trừ `absorbedTax = Math.min(Math.max(0, treasuryGain), tax)`.
   - Tổng dòng tiền toàn phòng (`Players + Treasury`) kỳ vọng tăng đúng `+2.000 Tr.` khi vượt GO, xóa bỏ hoàn toàn cảnh báo lệch 600 Tr., 750 Tr., 1.000 Tr.

2. **Chuẩn Hóa Nộp Tiền Bảo Lãnh Kiểm Toán (Ô 10)**:
   - Cập nhật `computeAuditBailDelta` trong [`telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts): Nhận diện 500 Tr. người chơi nộp bảo lãnh đã chuyển dịch nội bộ vào Kho Bạc (`room.treasury += 500`).
   - Biến động tài sản toàn hệ thống được xác định đúng là `0 Tr.`, triệt tiêu cảnh báo lệch 0 Tr. vs -500 Tr.

3. **Nhận Diện Giá Thắng Thầu Đấu Giá BĐS Thực Tế**:
   - Cập nhật `computeCellDelta` trong [`telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts): Ưu tiên đọc giá trúng thầu thực tế từ `useActivityStore.getState().lastAuctionBid.currentBid` (ví dụ 3.900 Tr.) thay vì rơi về giá gốc ô đất `deed.price` (2.200 Tr.) khi modal đấu giá đã đóng trước thời điểm gán quyền sở hữu.

4. **Miễn Trừ Kiểm Tra Bảo Toàn Tĩnh Với Sự Kiện Động (HOSE & Thẻ Bài)**:
   - Cập nhật `computeExpectedDelta` trong [`telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts): Bổ sung cơ chế miễn trừ (trả về `null`) khi delta mang `lastHoseResult` hoặc `lastEventCard`. Biến động tiền tệ mang tính ngẫu nhiên động được bypass khỏi bộ kiểm tra tĩnh mà không báo lỗi.

5. **Bảo Vệ Chống Báo Động Kẹt Hoạt Ảnh Khi Chuyển Tab Nền**:
   - Cập nhật `PerfTelemetryTracker` trong [`game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx): Lắng nghe sự kiện `visibilitychange` và kiểm tra `document.hidden`. Đặt lại `animStartRef.current = null` khi tab ở chế độ nền hoặc khi focus trở lại, triệt tiêu 100% cảnh báo giả `FSM_ANIMATION_STALLED`.

6. **Cân Chỉnh Khởi Tạo Kho Bạc Tại Bắt Tay Đầu Ván (Tick 1)**:
   - Đồng bộ `use_app_session.ts`: Khởi tạo `setTreasuryPool(0)` khớp với Server.
   - Loại bỏ fallback gán đè 2.000 Tr. trong `apply_delta.ts`.
   - Cân chỉnh `preTreasury` tại `delta.tick <= 1` trong [`telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts) triệt tiêu sai lệch -2.000 Tr. ban đầu.

7. **Nhận Diện Di Chuyển Xúc Xắc Chuẩn Xác Vượt GO Từ Ô Sự Kiện (Tick 246)**:
   - `detectMovement` kiểm tra `isExactDiceMove = (fromPos + diceSum) % 40 === p.position`. Nếu khớp xúc xắc, khẳng định `isTeleport: false`, ngăn ngừa nhận nhầm bước đi từ Ô 36 Thị Trường thành dịch chuyển thẻ và tính đủ lương vượt GO (+2.000 Tr.).

8. **Chuẩn Hóa Chỉ Số WebGL Draw Calls Per-Frame**:
   - `game_canvas.tsx` chuyển lệnh `gl.info.reset()` về cuối mỗi khung hình `useFrame`, bảo đảm chỉ số phản ánh đúng ~45–60 calls/frame thay vì tích lũy đa khung hình.

---

## 2. KẾT QUẢ KIỂM ĐỊNH 3 TRẠM (PHYSICAL DISK VERIFICATION)

- **Trạm 1 (RED Contract Test)**:
   - Tệp: [`tests/contracts/imp80_telemetry_watchdog_accuracy.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp80_telemetry_watchdog_accuracy.test.ts).
   - 19 atomic tests bao quát Universal 5-Facet Behavioral Matrix.
   - Xác nhận cổng đảo nghịch (Adversarial Inversion): Toàn bộ các bài kiểm thử nghiệp vụ mới đều thất bại (RED) trước khi sửa code sản xuất.

- **Trạm 2 (GREEN Implementation)**:
   - Triển khai mã nguồn tối thiểu, giữ đúng giới hạn kiến trúc: `telemetry_delta_hook.ts` (334 LOC <= 400 LOC), `game_canvas.tsx` (415 LOC <= 500 LOC).
   - Chuyển 19/19 atomic tests sang XANH (100% PASS).

- **Trạm 3 (Independent Review & Quality Gates)**:
   - Subagent `spec-reviewer` thực hiện kiểm toán vật lý trên đĩa: 100% tiêu chí đạt chuẩn, phán quyết **APPROVED (SIGN-OFF)**.
   - `npm run gate:quick`: 0 lỗi TypeScript, 0 lỗi UI lint, 0 vi phạm trùng lặp, ngân sách 3D đạt 1.11 MB / 2.5 MB.
   - `npm test`: **186/186 test suites PASS 100% (3.165/3.165 tests PASS)**.
   - `npm run build`: Đóng gói Production Bundle thành công.

---

## 3. MÃ NGUỒN THAY ĐỔI
1. [`src/client/telemetry/telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts): Hấp thụ thuế GO, hấp thụ bảo lãnh kiểm toán, giá đấu giá từ activity store, miễn trừ HOSE/thẻ bài, nhận diện `isExactDiceMove` và cân chỉnh bắt tay tick 1.
2. [`src/client/network/use_app_session.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/use_app_session.ts): Khởi tạo `setTreasuryPool(0)` khớp với Server.
3. [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts): Xóa fallback gán đè 2.000 Tr. khi nhận delta.
4. [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx): Lắng nghe `visibilitychange`, `document.hidden` và reset WebGL info mỗi khung hình.
5. [`tests/contracts/imp80_telemetry_watchdog_accuracy.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp80_telemetry_watchdog_accuracy.test.ts): 19 atomic contract tests bảo vệ tính năng.
6. [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md): Ghi nhận Gotcha #108.
7. [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md): Cập nhật tiến độ gói cải tiến IMP-80.
