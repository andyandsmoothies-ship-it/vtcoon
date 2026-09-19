# Kế Hoạch Cải Tiến Kỹ Thuật IMP-127: Chuẩn Hóa Góc Xoay Ô Cờ 4 Cạnh, Sửa Desync Nút Ra Tù & Mở Quyền Thanh Khoản Trong ActionPhase

## 1. Mục Tiêu Kỹ Thuật
- **Mã Ticket**: IMP-127
- **Mục tiêu**:
  1. Triệt tiêu 100% lỗi lộn ngược chữ 180° trên Cạnh 1 (Tây, gồm Ô 14 Nha Trang) và Cạnh 2 (Bắc) khi Camera 3D focus cận cảnh.
  2. Khắc phục lỗi kẹt nút "Đổ Tiếp (Đôi)" sau khi người chơi nộp bảo lãnh 500 Tr. ra khỏi Trạm Kiểm Toán.
  3. Mở quyền Thế Chấp (`mortgageProperty`) và Hạ Cấp Bán Nhà (`handleDowngrade`) trong `TurnPhase.ActionPhase` để người chơi chủ động thanh khoản gom tiền mua đất khi thiếu vốn.
  4. Triệt tiêu lỗi Telemetry Desync ghi sai nhãn `DOUBLES_FOLLOWUP_ROLL` sau khi ra tù.

## 2. Danh Mục Tệp Triển Khai
- `src/client/3d/board_layout.tsx`: Hàm `tileRotation` chuẩn hóa 4 cạnh và ô góc 10, 20.
- `src/client/ui/action_dock.tsx`: `storeCanRollAgain` ưu tiên `storeConsecutiveDoubles > 0`.
- `src/client/ui/ui_helpers.ts`: `buildIntentTelemetryContext` đồng bộ chuỗi đôi.
- `src/server/mortgage_manager.ts`: `isMortgagePhaseValid` mở `TurnPhase.ActionPhase`.
- `src/server/property_actions.ts`: `isDowngradePhaseValid` mở `TurnPhase.ActionPhase`.
- `tests/client/imp127_tile_orientation_and_bailout_sync.test.ts`: Bộ test hợp đồng 42 atomic tests.
- `tests/client/ui01_board.test.ts`: Reconcile kỳ vọng góc quay 4 cạnh.
- `docs/domain/gotchas.md`: Ghi nhận Gotcha #164.

## 3. Quy Trình Nghiệm Thu
- Tuân thủ quy trình 3 Trạm: Trạm 1 (RED Test) -> Trạm 2 (GREEN Code) -> Trạm 3 (Independent Spec Review).
- Toàn bộ 240 suites (4.920 tests) pass 100%.
- Docker container đồng bộ và kiểm tra curl HTTP 200 OK.
