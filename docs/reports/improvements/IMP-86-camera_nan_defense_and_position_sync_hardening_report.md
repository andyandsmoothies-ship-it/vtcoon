# Báo Cáo Nghiệm Thu Cải Tiến IMP-86: Camera NaN Defense, Pawn Position Sync & Root ErrorBoundary Hardening

> **Ticket**: IMP-86  
> **Trạng thái**: 🟢 **Hoàn Tất & Phê Duyệt 100%**  
> **Ngày hoàn thành**: 2026-09-16  
> **Kế hoạch**: [`IMP-86_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-86-camera_nan_defense_and_position_sync_hardening_plan.md)  
> **Gotcha**: #114 trong [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)

---

## 1. TỔNG QUAN NGUYÊN NHÂN & NGUỒN GỐC LỊCH SỬ

Qua quá trình điều tra phân tích ngược mã nguồn (reverse audit) và đối chiếu lịch sử phát triển:

1. **Lỗi Ma trận Camera Three.js bị nhiễm `NaN` làm đen/trắng màn hình**:
   - *Nguồn gốc*: Tồn tại từ **Slice 01 / Slice 04** khi xây dựng `AdaptiveCinematicCamera` và `board_coords.ts`.
   - *Nguyên nhân*: `targetCell !== null` kiểm tra lỏng lẻo; trong JS `undefined !== null` là `true`. Khi `targetCell` là `undefined`, `cellPosition(undefined)` tính `Math.floor(undefined / 10)` ra `NaN`. Tọa độ `NaN` lan truyền vào `camera.position` và `OrbitControls.target`, làm hỏng toàn bộ ma trận chiếu của Three.js khiến màn hình 3D biến mất hoàn toàn.
   - *Khắc phục*: `cellPosition` chặn 100% `NaN`/`undefined`/ngoài biên bằng `Number.isFinite()`, `AdaptiveCinematicCamera` có cơ chế tự phục hồi `[30, 33, 30]`.

2. **Lỗi giật lùi vị trí quân cờ & Báo động sai INVALID_POSITION_STEP**:
   - *Nguồn gốc*: Tồn tại từ **Slice 02** trong `completePawnMove`.
   - *Nguyên nhân*: Giả định tuần tự 1 người chơi gieo xúc xắc. Khi thẻ `MC_MEGA_CONCERT` di chuyển cả 4 người cùng lúc về ô 6, các tác vụ hoạt cảnh dồn toa. Khi server phát lượt tiếp theo của Bot (ô 12), tác vụ nhảy cũ về ô 6 hoàn tất muộn hơn và ghi đè lùi vị trí `playerPositions['bot_4'] = 6`. Đến lượt sau Bot nhảy lên 20, Telemetry so khớp với vị trí 6 cũ và báo lỗi nhảy sai ô.
   - *Khắc phục*: `completePawnMove` kiểm tra vị trí hiện tại trong store; nếu store đã có vị trí mới hơn từ server thì không ghi đè lùi vị trí.

3. **Lệch chuẩn SSOT `SERVICE_CELLS` trong Telemetry**:
   - *Nguồn gốc*: Tồn tại từ **IMP-24**.
   - *Nguyên nhân*: Khai báo nhầm `SERVICE_CELLS` thành `[12, 28, 39]` (các ô Tiện ích / Thuế) thay vì `[6, 8, 26, 27]` theo SSOT `src/domain/event_card_types.ts`.
   - *Khắc phục*: Import trực tiếp từ SSOT `DOMAIN_SERVICE_CELLS`.

4. **Thiếu Root ErrorBoundary**:
   - *Nguồn gốc*: Tồn tại từ ngày khởi tạo repository.
   - *Khắc phục*: Bổ sung `AppErrorBoundary` bọc quanh toàn bộ `App` trong `main.tsx`.

---

## 2. CÁC TỆP ĐÃ THAY ĐỔI & THÊM MỚI

| Tệp | Loại | Mô tả |
| :--- | :---: | :--- |
| [`src/client/3d/board_coords.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/board_coords.ts) | Modify | `cellPosition` phòng thủ an toàn trước `NaN`, `undefined`, số âm, số vượt dải |
| [`src/client/3d/camera_state_machine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/camera_state_machine.ts) | Modify | `calculateTargetCameraState` lọc sạch tọa độ `NaN` cho `pawn_chase` và `tile_focus` |
| [`src/client/3d/pawn_path.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/3d/pawn_path.ts) | Modify | `calculatePathWaypoints` loại bỏ `throw new Error`, chuẩn hóa dải an toàn `[0..39]` |
| [`src/client/game_canvas.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/game_canvas.tsx) | Modify | `resolveCameraTargetCell` và `AdaptiveCinematicCamera` chặn `targetCell` invalid và tự hồi phục `NaN` |
| [`src/client/store/game_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store.ts) | Modify | `completePawnMove` chống race condition ghi đè lùi vị trí quân cờ |
| [`src/client/telemetry/telemetry_delta_hook.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/telemetry_delta_hook.ts) | Modify | Đồng bộ `SERVICE_CELLS` theo SSOT `[6, 8, 26, 27]` |
| [`src/client/telemetry/invariant_checker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/telemetry/invariant_checker.ts) | Modify | `verifyMovementStep` phòng thủ kiểm tra di chuyển và xúc xắc |
| [`src/client/ui/error_boundary.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/error_boundary.tsx) | New | Component React ErrorBoundary chuẩn UI linter, role="alert", nút khôi phục |
| [`src/client/ui/app_error_boundary.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/app_error_boundary.ts) | New | Re-export module |
| [`src/client/main.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/main.tsx) | Modify | Tích hợp `<AppErrorBoundary>` bọc toàn bộ ứng dụng |
| [`tests/contracts/imp86_camera_nan_defense_and_position_sync.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp86_camera_nan_defense_and_position_sync.test.ts) | New | 19 atomic tests kiểm thử hợp đồng |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Modify | Ghi nhận Bất biến Gotcha #114 |

---

## 3. BẰNG CHỨNG KIỂM ĐỊNH CHẤT LƯỢNG

- **Hợp Đồng Kiểm Thử IMP-86**: `19/19 PASS (100%)` (51ms).
- **Toàn Bộ Test Suite Dự Án**: `192/192 test files PASS, 3328/3328 tests PASS (100%)`.
- **TypeScript Strict Mode**: `npx tsc --noEmit` -> 0 lỗi.
- **UI Linter**: `npm run lint:ui` -> 0 violations trên toàn bộ 137 tệp.
- **Thẩm Định Độc Lập Trạm 3**:
  - `spec-reviewer`: **APPROVED**
  - `code-reviewer`: **APPROVED**
