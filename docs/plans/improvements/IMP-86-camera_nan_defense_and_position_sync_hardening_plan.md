# Kế hoạch Kỹ thuật IMP-86: Camera NaN Defense, Pawn Position Sync & Root ErrorBoundary Hardening

> **Mã Ticket**: IMP-86  
> **Phân loại**: Systemic Bugfix & Resilience Hardening  
> **Mục tiêu**: Loại bỏ triệt để hiện tượng biến mất màn hình 3D (Camera NaN), khắc phục race condition giật lùi vị trí quân cờ sau sự kiện đại nhạc hội, chuẩn hóa SSOT ô Dịch vụ trong Telemetry và thiết lập lá chắn Root ErrorBoundary.

---

## 1. NGUYÊN NHÂN GỐC RỄ & NGUỒN GỐC LỊCH SỬ

| Hiện tượng | Nguyên nhân Gốc rễ | Nguồn gốc Lịch sử |
| :--- | :--- | :--- |
| **1. Màn hình 3D biến mất hoàn toàn (Black/Void Screen)** | Trong `game_canvas.tsx`, `targetCell !== null` kiểm tra lỏng lẻo. Khi `targetCell` là `undefined`, JavaScript coi `undefined !== null` là `true`, dẫn đến gọi `cellPosition(undefined)`. Hàm này trả về `[9, 0, NaN]`. Tọa độ `NaN` lan vào `camera.position` và `OrbitControls.target`, phá hủy toàn bộ ma trận chiếu của Three.js khiến không còn vertex nào được render. | Tồn tại từ **Slice 01 / Slice 04** (khi khởi tạo `AdaptiveCinematicCamera` và `board_coords.ts`). Chưa từng được bọc kiểm tra `Number.isFinite()`. |
| **2. Quân cờ giật lùi vị trí & Báo động sai INVALID_POSITION_STEP** | Khi thẻ `MC_MEGA_CONCERT` di chuyển cả 4 người chơi cùng lúc về ô 6, hàng đợi `pawnAnimationQueue` tích tụ tác vụ nhảy dài. Khi `bot_4` được server chuyển tiếp lên ô 12 (Tick 103), tác vụ cũ nhảy về ô 6 hoàn tất trễ hơn và gọi `completePawnMove`, ghi đè `playerPositions['bot_4'] = 6`. Đến Tick 105, `bot_4` đi tiếp lên ô 20, Telemetry so khớp với vị trí 6 cũ và báo lỗi nhảy sai ô. | Tồn tại từ **Slice 02** (logic `completePawnMove` giả định trận đấu tuần tự 1 người, chưa tính độ trễ khi nhiều tác vụ hoạt cảnh dồn toa với lượt đi của Bot). |
| **3. Bỏ sót Teleport Ô Dịch Vụ** | `SERVICE_CELLS` trong `telemetry_delta_hook.ts` bị khai báo nhầm thành `[12, 28, 39]` (các ô Tiện ích / Thuế) thay vì `[6, 8, 26, 27]` theo chuẩn SSOT `src/domain/event_card_types.ts`. | Xuất hiện từ **IMP-24** khi tách module Telemetry Flight Recorder. |
| **4. Nguy cơ sập trắng trang (White Screen of Death)** | Thiếu Root ErrorBoundary trong `main.tsx`. Mọi lỗi không bắt được trong React Component Tree sẽ khiến React 18 unmount toàn bộ thẻ `<div id="root">`. | Tồn tại từ ngày khởi tạo dự án. |

---

## 2. KIẾN TRÚC GIẢI PHÁP KỸ THUẬT

```text
[WebSocket Message (Delta)]
       │
       ├─► [applyPlayerDeltas]:
       │     └─ calculatePathWaypoints(): Clamp an toàn [0..39], KHÔNG ném uncaught exception.
       │     └─ Ghi nhận nextPositions đồng bộ theo server.
       │
       ├─► [completePawnMove]:
       │     └─ Chỉ cập nhật playerPositions nếu vị trí hiện tại trong store CHƯA BỊ server
       │        cập nhật lên vị trí mới hơn (chống race condition ghi đè lùi vị trí).
       │     └─ Luôn cập nhật visualPositions để pawn đứng đúng điểm hạ cánh.
       │
       ├─► [Telemetry Hook]:
       │     └─ Import SERVICE_CELLS trực tiếp từ domain SSOT [6, 8, 26, 27].
       │     └─ Nhận diện đầy đủ trạng thái Teleport cho toàn bộ người chơi.
       │
       ├─► [Camera Math Armor]:
       │     └─ cellPosition(index): Kiểm tra Number.isFinite(index), fallback an toàn về [0,0,0].
       │     └─ calculateTargetCameraState: Bảo vệ target và position 100% là số hữu hạn.
       │     └─ AdaptiveCinematicCamera:
       │          • targetCell != null && Number.isFinite(targetCell)
       │          • Tự động phát hiện NaN trong camBaseRef hoặc targetBaseRef và khôi phục [30, 33, 30].
       │
       └─► [AppErrorBoundary]:
             └─ Bọc toàn bộ ứng dụng và Canvas, ngăn chặn unmount sập DOM.
```

---

## 3. MA TRẬN 4 DIỆN MẠO HÀNH VI KIỂM THỬ (TRẠM 1)

Bộ kiểm thử `tests/contracts/imp86_camera_nan_defense_and_position_sync.test.ts` (tối thiểu 15 atomic tests):
- **Facet 1: Boundary & Math Armor Facet**:
  - TC-86.01: `cellPosition` với tham số `undefined`, `null`, `NaN`, `Infinity`, `< 0`, `>= 40` trả về tọa độ hợp lệ hữu hạn `[x, y, z]`, 0% xuất hiện `NaN`.
  - TC-86.02: `calculateTargetCameraState` với tọa độ chứa `NaN` tự động lọc sạch và trả về `position` và `target` hữu hạn 100%.
  - TC-86.03: `calculatePathWaypoints` với chỉ số ngoài biên không ném exception mà trả về mảng an toàn.
  - TC-86.04: `resolveCameraTargetCell` trả về `null` thay vì `undefined` khi animation rỗng hoặc currentIndex vượt mảng waypoints.
- **Facet 2: State Reactivity & Race Condition Defense Facet**:
  - TC-86.05: `completePawnMove` không ghi đè lùi vị trí `playerPositions` nếu store đã có vị trí lớn hơn/mới hơn từ Server.
  - TC-86.06: `completePawnMove` vẫn cập nhật `visualPositions` và xử lý phần tử tiếp theo trong hàng đợi `processPawnQueue`.
  - TC-86.07: `setPlayerPositions` duy trì tính nhất quán khi nhiều người chơi được cập nhật đồng thời trong sparse delta.
- **Facet 3: Telemetry & Invariant Fidelity Facet**:
  - TC-86.08: `SERVICE_CELLS` trong Telemetry Hook khớp 100% với SSOT `[6, 8, 26, 27]`.
  - TC-86.09: `checkIsTeleport` nhận diện chính xác dịch chuyển đến ô 6 (Bình Dương) do thẻ `MC_MEGA_CONCERT` kích hoạt.
  - TC-86.10: `verifyMovementStep` không báo động sai `INVALID_POSITION_STEP` khi người chơi dịch chuyển theo sự kiện thẻ.
- **Facet 4: Error Defense & React Boundary Facet**:
  - TC-86.11: `AppErrorBoundary` bắt gọn lỗi render của component con và hiển thị giao diện phục hồi với nút Thử Lại.
  - TC-86.12: `AdaptiveCinematicCamera` tự phục hồi tọa độ mặc định `[30, 33, 30]` khi phát hiện vector máy quay bị suy biến.

---

## 4. QUY TRÌNH 3 TRẠM (3-STATION PIPELINE)

1. **Trạm 1 (RED Contract Test)**:
   - Subagent `qa-tester` viết `tests/contracts/imp86_camera_nan_defense_and_position_sync.test.ts`.
   - Chứng minh Genuine RED (thất bại do code hiện tại thiếu các chốt phòng thủ).
2. **Trạm 2 (GREEN Implementation)**:
   - Subagent `implementer` cập nhật:
     - `src/client/3d/board_coords.ts`
     - `src/client/3d/camera_state_machine.ts`
     - `src/client/game_canvas.tsx`
     - `src/client/3d/pawn_path.ts`
     - `src/client/store/game_store.ts`
     - `src/client/telemetry/telemetry_delta_hook.ts`
     - `src/client/ui/error_boundary.tsx` (Mới)
     - `src/client/main.tsx`
   - Đưa toàn bộ test hợp đồng thành GREEN, bảo toàn 190 test suites.
3. **Trạm 3 (Independent Reviews)**:
   - `spec-reviewer`: Thẩm định đối chiếu 100% đặc tả trên đĩa.
   - `code-reviewer`: Thẩm định chất lượng mã nguồn, LOC, complexity <= 5, zero dirty casts.
