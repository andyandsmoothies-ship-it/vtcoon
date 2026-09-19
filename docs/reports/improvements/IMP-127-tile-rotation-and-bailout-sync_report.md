# Báo Cáo Hoàn Thành Cải Tiến Kỹ Thuật IMP-127: Chuẩn Hóa Góc Xoay Ô Cờ 4 Cạnh, Sửa Desync Nút Ra Tù & Mở Quyền Thanh Khoản Trong ActionPhase

## 1. Kết Quả Thực Hiện
- **Mã Ticket**: IMP-127
- **Trạng thái**: COMPLETED & APPROVED
- **Quy trình**: Tuân thủ nghiêm ngặt Quy Trình 3 Trạm (3-Station Pipeline).

## 2. Chi Tiết Thay Đổi Kỹ Thuật
1. **Chuẩn Hóa Góc Xoay Ô Cờ 4 Cạnh (`src/client/3d/board_layout.tsx`)**:
   - Cạnh 0 (Nam, 1..9): `[0, 0, 0]`
   - Cạnh 1 (Tây, 10..19): `[0, -Math.PI / 2, 0]` (kể cả Ô 10)
   - Cạnh 2 (Bắc, 20..29): `[0, Math.PI, 0]` (kể cả Ô 20)
   - Cạnh 3 (Đông, 30..39): `[0, Math.PI / 2, 0]` (kể cả Ô 30)
   - Ô 0 (Khởi hành): `[0, Math.PI / 4, 0]`
   - Triệt tiêu 100% hiện tượng chữ tên địa danh và tranh di sản bị lộn ngược 180° trên Cạnh 1 và Cạnh 2 khi Camera focus cận cảnh.
2. **Sửa Desync Nút Quyền Đổ Tiếp (`src/client/ui/action_dock.tsx`)**:
   - Ưu tiên `storeConsecutiveDoubles > 0` từ server khi có dữ liệu.
   - Khi ra tù hoặc hết lượt đôi, `canRollAgain = false`, nút "Đổ Tiếp (Đôi)" biến mất, nút "Kết Thúc Lượt" mở sáng màu xanh lá.
3. **Đồng Bộ Telemetry Context (`src/client/ui/ui_helpers.ts`)**:
   - `buildIntentTelemetryContext` ưu tiên `consecutiveDoubles > 0`, triệt tiêu hoàn toàn telemetry rác `DOUBLES_FOLLOWUP_ROLL` sau khi vừa ra tù.
4. **Mở Quyền Thanh Khoản Trong ActionPhase**:
   - `src/server/mortgage_manager.ts`: `isMortgagePhaseValid` cho phép `TurnPhase.ActionPhase`.
   - `src/server/property_actions.ts`: `isDowngradePhaseValid` cho phép `TurnPhase.ActionPhase`.
   - Người chơi có thể hạ cấp bán nhà hoặc thế chấp BĐS để gom vốn mua ngay ô đất đang đứng khi thiếu tiền mặt.
5. **Ghi Nhận Invariant**:
   - Ghi nhận Gotcha #164 trong `docs/domain/gotchas.md`.

## 3. Bằng Chứng Nghiệm Thu (Verification Evidence)
- **Suite Test Hợp Đồng IMP-127**: `tests/client/imp127_tile_orientation_and_bailout_sync.test.ts` (42/42 tests PASS).
- **Toàn Bộ Test Suite**: 240/240 suites passed (4.920/4.920 tests pass 100%).
- **TypeScript Typecheck**: `npx tsc --noEmit` đạt 0 errors.
- **UI Linter**: `npm run lint:ui` đạt 0 violations.
- **Slop Linter**: `npm run lint:slop` đạt 0 violations.
- **Docker Production Sync**: Container `vtcoon-vtcoon-1` đã được đồng bộ `dist/` mới và restart healthy.
- **Trạm 3 Review**: Subagent `spec-reviewer` phê duyệt VERDICT: APPROVED dựa trên đối soát đĩa vật lý và snapshot.
