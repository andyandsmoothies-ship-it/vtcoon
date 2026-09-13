# BÁO CÁO RÀ SOÁT SÂU TOÀN DIỆN NFR, HIỆU NĂNG & MÔ PHỎNG HỖN LOẠN (DEEP NFR, PERFORMANCE & SIMULATION AUDIT)

> **Căn cứ**: Tiêu chuẩn thương mại VTCOON & Hiến pháp `GEMINI.md`.  
> **Phương pháp**: Phân tích tĩnh AST, profiling WebGL & DOM lifecycle, thực thi toàn bộ test suites và kiểm thử tải hỗn loạn đa phòng thực tế.

---

## 0. BẢNG ĐỐI SOÁT & HIỆU CHỈNH SỐ LIỆU KIỂM TOÁN (FACT-CHECK MATRIX)

| Hạng Mục | Số Liệu Sơ Bộ | Số Liệu Thẩm Tra Thực Tế (Code & Runtime) | Đánh Giá & Hiệu Chỉnh |
|---|---|---|---|
| **Chu kỳ Heartbeat PING** | 10.000 ms (`wss_server.ts:88-108`) | `src/server/session_manager.ts:6` quy định `HEARTBEAT_INTERVAL_MS = 5.000` (5 giây). | ❌ **Hiệu chỉnh số liệu**: 10.000 ms là ngưỡng phát hiện timeout (`2 * HEARTBEAT_INTERVAL_MS`), không phải chu kỳ gửi PING. |
| **Số lượng test Reconnect** | 26 tests | Toàn hệ thống có **30 tests** pass (10 tests tại `net04_reconnect`, 3 tại `auction_reconnect_grace_period`, 4 tại `leave_room_and_bot_reconnect`, 13 tại `net04_client_reconnect`). | ⚠️ **Cập nhật đầy đủ**: Bổ sung thêm test suite client và server. |
| **Chỉ số Draw Calls / Triangles** | 45-64 Calls, ~82.000 Triangles | Con số 64 calls và 82.000 triangles là **Mock Data** trong `tests/client/perf_budget.test.ts:116`, không phải profile WebGL thực tế. | ❌ **Hiệu chỉnh thực tế**: Cần phân tích thêm tầng 2 của `ContactShadows` và pipeline hậu kỳ `PostProcessingPipeline`. |
| **Trần bộ nhớ Zustand Store** | Chỉ có 1 lỗi thiếu trần tại `violations` (`telemetry_store.ts`) | Phát hiện thêm mảng `floatingTexts` tại `src/client/store/game_store.ts:475` không có trần độ dài mảng. | ⚠️ **Phát hiện bổ sung**: Cần thiết lập trần Ring Buffer cho cả `floatingTexts`. |
| **Trạng thái UAT Browser CDP** | Từng bị nhận định nhầm là "chưa chạy" | Cả 3 kịch bản Case 2P (60 ảnh), Case 3P (80 ảnh), Case 4P (100 ảnh) **đã chạy hoàn tất** và lưu 240 ảnh tại `docs/reports/uat/screenshots/`. | 🟢 **Đã nghiệm thu**: Toàn bộ 240 ảnh chụp UAT đã sẵn sàng trên đĩa. |

---

## 1. TRỤC 1: 3D & WEBGL RENDER LOOP

```
[useSafeFrame Loop] ───► [PerfTelemetry (250ms Throttle)] ───► Tối ưu (4 lần/giây)
                    ───► [diorama_traffic: getPointAt()]   ───► Áp lực GC (16 Vec3/frame)
                    ───► [procedural_building: slam guard]  ───► Ghi đè ma trận dư thừa
                    ───► [game_canvas: window.__three*]    ───► Gán biến window mỗi frame
```

### 1.1. Rà soát tính toán trong `useFrame` & `useSafeFrame`
Đã quét toàn bộ 50 component trong `src/client/3d/` và `src/client/game_canvas.tsx`:

1. **Các điểm tối ưu hóa đạt chuẩn**:
   - **Throttling 250ms**: `src/client/game_canvas.tsx:228` (`now - lastUpdateRef.current >= 250`) ngăn ngừa re-render bão hòa ở 60 FPS.
   - **Instancing**: Rừng cây nhiệt đới `layered_tropical_foliage.tsx:119`, Skyline `diorama_skyline.tsx:55`, và pháo hoa `coronation_3d_stage.tsx:310` gom nhóm draw calls hiệu quả.
   - **Loại bỏ pháp tuyến CPU sóng biển**: `coastal_island_environment.tsx` đã hạ lưới về 24x24 và xóa bỏ `computeVertexNormals()`, giải phóng 5-7ms CPU chính mỗi frame.
   - **Cố định cao độ Standee**: `board_tile.tsx` đã xóa 40 vòng lặp `useFrame` nhấp nhô, neo tĩnh y = 1.1.

2. **3 Hotspots phát hiện cần xử lý**:
   - **Hotspot 1 (Áp lực Garbage Collection)**: `src/client/3d/diorama/diorama_traffic.tsx:94-95` gọi `curve.getPointAt(progress)` và `curve.getTangentAt(progress)` không truyền vector mục tiêu. Với 8 xe vi mô, mỗi khung hình sinh ra 16 đối tượng `Vector3` (~960 đối tượng/giây). Cần đổi thành `curve.getPointAt(progress, targetVec)`.
   - **Hotspot 2 (Ghi đè ma trận dư thừa)**: `src/client/3d/procedural_building.tsx:49-52` gán lại `position.y = 0.22` và `scale.set(1, 1, 1)` cho toàn bộ 28 ô đất mỗi frame dù không có hoạt ảnh khánh thành (`!activeSlam`).
   - **Hotspot 3 (Gán biến window mỗi frame)**: `src/client/game_canvas.tsx:102-108` thực hiện gán đè `window.__threeScene = scene`, `window.__threeCamera = camera`, `window.__orbitControls = controlsRef.current` liên tục 60 lần/giây trong `useFrame`. Thao tác này chỉ cần chạy khi mount.

### 1.2. Thẩm tra dọn dẹp bộ nhớ GPU (`dispose`)
100% các `CanvasTexture` sinh ra động đều được giải phóng qua hook cleanup hoặc cache có trần:
- `event_card_3d.tsx:146-151`: `backTexture?.dispose()`, `frontTexture?.dispose()`.
- `auction_3d_stage.tsx:312`: `deedTexture?.dispose()`.
- `penthouse_hologram.tsx:141-144`: `hudScreenTexture.dispose()`, `particleGeometry.dispose()`.
- `penthouse_enclosure.tsx:23-24`: `sunsetTexture.dispose()`.
- `tile_texture_generator.ts:6-7`: Cố định cache 40 ô (`tileTextureCache`) và 40 standee (`standeeTextureCache`).
- `pawn_animator.tsx:45`: Cố định cache theo danh mục biểu cảm (`emoteCanvasCache`).

### 1.3. Thẩm tra Ngân sách Draw Calls & Triangles
- **Cơ chế tự vệ Adaptive LOD**: `src/client/3d/perf_budget.ts` duy trì 3 cấp độ (HIGH, MEDIUM, LOW). Khi FPS sụt dưới 30 hoặc Draw Calls vượt 85, hệ thống tự động:
  - Hạ độ phân giải đổ bóng tiếp xúc (`ContactShadows`).
  - Tắt phản xạ mặt nước (`enableReflections: false`).
  - Thu hẹp bán kính đổ bóng môi trường `N8AO` để bảo vệ ngưỡng 60 FPS.

---

## 2. TRỤC 2: NETWORK, DELTA & CONCURRENCY

```
[WebSocket Client] ───► [EnvelopeValidator (Kiểm tra Schema)]
                   ───► [RateLimiter (10 req/s, Chống Spam)]
                   ───► [IntentMutex FIFO (Khóa Tuần Tự Từng Phòng)] ───► [RoomManager]
                   ───► [DeltaBroadcaster] ───► Sparse Delta (180B - 390B) < 10KB
```

### 2.1. Kích thước gói tin `DeltaPayload`
- **Quy chuẩn trần**: `< 10.240 bytes` (10KB).
- **Kết quả kiểm thử thực tế** (`tests/server/delta_payload_vsc.test.ts` - **18/18 tests PASS**):
  - Gói Full Sync (40 ô + 4 người chơi): **2.348 bytes** (22.9% trần).
  - Gói Sparse Delta vi phân (`buildSparseDelta`): **180 - 390 bytes** (1.8% - 3.8% trần).
  - Cảnh báo tự động: `delta_broadcaster.ts:154-158` phát log `[WARN_DELTA_OVERSIZED]` nếu gói vượt 10.240 bytes.

### 2.2. Cơ chế Reconnect 60s & `IntentMutex`
- **Thời gian ân hạn 60s**: `GRACE_PERIOD_MS = 60.000` tại `src/server/session_manager.ts:7` và `src/server/network/reconnect_manager.ts:5`.
- **Tổng số bài test Reconnect đã pass**: **30 tests** (10 ở `net04_reconnect`, 3 ở `auction_reconnect_grace_period`, 4 ở `leave_room_and_bot_reconnect`, 13 ở `net04_client_reconnect`).
- **Tuần tự hóa IntentMutex**: `src/server/network/intent_mutex.ts` đảm bảo thứ tự thực thi FIFO theo từng `roomCode`, không bị kẹt chuỗi kể cả khi có task bên trong ném ngoại lệ nhờ khối `.catch(() => {})`.

### 2.3. Tần suất Heartbeat PING & Broadcast Delta
- **Chu kỳ gửi PING thực tế**: **5.000 ms** (`src/server/session_manager.ts:6`: `HEARTBEAT_INTERVAL_MS = 5.000`).
- **Chu kỳ ngắt kết nối khi mất tín hiệu**: **10.000 ms** (`src/server/network/wss_server.ts:96`: `elapsed > 2 * HEARTBEAT_INTERVAL_MS` đóng socket mã 1001).
- **Broadcast Delta**: Phát tức thời theo sự kiện FSM, kết hợp tick định kỳ 1.000 ms cho bộ đếm thời gian lượt chơi.

---

## 3. TRỤC 3: BỘ NHỚ & BẤT BIẾN (MEMORY & INVARIANTS)

### 3.1. Rà soát trần Ring Buffer các Zustand Store
1. `activity_store.ts:44`: `MAX_ACTIVITY_LOGS = 50`. Cắt mảng `slice(length - 50)` đạt dung lượng O(1) (~10 KB).
2. `telemetry_store.ts:12-14`: `MAX_AUDIT_ENTRIES = 100`, `MAX_SNAPSHOT_ENTRIES = 20`, `MAX_RECORDED_INTENTS = 100` -> Tổng dung lượng ~120 KB (< 500 KB chuẩn NFR).
3. ⚠️ **2 Điểm cần bổ sung trần mảng**:
   - `telemetry_store.ts:120`: Mảng `violations` hiện đang gán `[fullViolation, ...state.violations]` chưa có `slice`, cần bổ sung trần `MAX_VIOLATIONS = 50`.
   - `game_store.ts:475`: Mảng `floatingTexts` hiện gán `[...state.floatingTexts, newItem]` phụ thuộc vào timer xóa, cần bổ sung trần `MAX_FLOATING_TEXTS = 15`.

### 3.2. Rà soát rò rỉ Timer & Event Listener
- **Event Listeners**: Quét toàn bộ 11 điểm gọi `addEventListener`:
  - `audio_engine.ts:42-45`: Đã đặt cờ `{ once: true, capture: true }` tự hủy.
  - Các component khác (`activity_feed_sidebar.tsx`, `telemetry_console_modal.tsx`, `telemetry_badge.tsx`, `main.tsx`, `modal_backdrop.tsx`): 100% đều có `removeEventListener` trong return của `useEffect`.
- **Timers**: 100% các `setInterval` (`main.tsx:310`, `admin_portal.tsx:138`, `hose_modal.tsx:60`, `modal_host.tsx:58`) đều gọi `clearInterval` khi unmount.

### 3.3. Kiểm chứng 4 Bất Biến Cốt Lõi
Kiểm thử `tests/client/telemetry_system.test.ts` (**10/10 tests PASS**):
1. **Bảo toàn tiền tệ**: `Tổng tiền người chơi + Kho bạc` trước và sau giao dịch bảo toàn với độ lệch delta = 0.
2. **Tọa độ di chuyển**: Tọa độ mới luôn bằng `(vị trí cũ + bước đi) % 40`.
3. **Số dư không âm**: Tiền mặt không âm ngoài trạng thái vỡ nợ (`InsolvencyPhase`) hoặc thấu chi bảo hộ.
4. **Cấp nhà 0-3**: Cấp công trình luôn là số nguyên thuộc đoạn `[0, 3]`.

---

## 4. TRỤC 4: ĐỘ PHỨC TẠP & CODE HYGIENE (ANTI-SLOP)

### 4.1. Phân tích Giới Hạn Dòng Mã (File LOC Budget)
Quét toàn diện 157 file mã nguồn trong `src/`:

- **3 file Core Logic vượt trần 400 LOC**:
  1. `src/server/room_manager.ts`: **511 dòng** (vượt 111 dòng)
  2. `src/client/store/game_store.ts`: **505 dòng** (vượt 105 dòng)
  3. `src/server/network/wss_server.ts`: **468 dòng** (vượt 68 dòng)
- **3 file cận trần (>= 75% ngưỡng cảnh báo)**:
  4. `src/client/3d/auction_3d_stage.tsx`: **497 dòng** (sát trần UI 500 dòng)
  5. `src/server/network/admin_manager.ts`: **389 dòng** (đạt 97.2% trần Logic 400 dòng)
  6. `src/client/network/apply_delta.ts`: **355 dòng** (đạt 88.7% trần Logic 400 dòng)

### 4.2. Quét Phân Tích AST: Độ Dài Hàm & Cyclomatic Complexity (CC)
- **Top 5 hàm logic có độ phức tạp cao nhất cần bóc tách**:
  1. `src/client/network/apply_delta.ts:31` (`applyDeltaToStore`): **CC = 119, LOC = 325** (xử lý toàn bộ các nhánh delta).
  2. `src/server/security/envelope_validator.ts:74` (`validateFieldsByType`): **CC = 64, LOC = 85** (switch-case kiểm tra schema của mọi loại intent).
  3. `src/server/network/turn_timeout_scheduler.ts:64` (`scheduleTurnTimeout`): **CC = 39, LOC = 104** (điều phối timeout lồng nhau).
  4. `src/server/insolvency_manager.ts:117` (`declareBankruptcy`): **CC = 29, LOC = 78**.
  5. `src/server/room_manager.ts:360` (`runBotTurn`): **CC = 28, LOC = 75**.

### 4.3. Kết quả chạy Quality Gate Quick
```bash
npm run gate:quick
```
- `npm run lint:ui`: **0 vi phạm** (0 anti-patterns).
- `npm run lint:slop`: **0 vi phạm nghiêm trọng** (0 swallowed catch, 0 dirty cast).
- `npm run lint:dup`: **1.75% duplicate lines** (dưới ngưỡng cảnh báo).
- `tsc --noEmit`: **0 lỗi TypeScript**.
- **Exit code**: **0**.

---

## 5. TRỤC 5: MÔ PHỎNG TẢI NẶNG & HỖN LOẠN (SIMULATION & CHAOS SUITE)

### 5.1. Mô phỏng Monte Carlo 1.000 ván Bot ngẫu nhiên
Chạy test suite `tests/simulation/chaos_monkey_simulator.test.ts` (thời gian thực thi 2.52s):

```
======================================================================
      BÁO CÁO THẨM ĐỊNH HIỆU NĂNG CHAOS MONKEY SIMULATOR (1.000 VÁN)    
======================================================================
1. TỔNG QUAN VẬN HÀNH & BẤT BIẾN LIVENESS:
   - Tổng số ván mô phỏng:           1.000/1.000 (100.0% hoàn thành hợp lệ)
   - Ván kết thúc do đối thủ vỡ nợ:  2 ván
   - Ván kết thúc ở mốc 30 vòng:     998 ván
   - Tổng số lượt đi (turns):        113.908 lượt
   - Tỷ lệ Deadlock / Treo game:     0.00% (Tuyệt đối)
----------------------------------------------------------------------
2. BẢO TOÀN DÒNG TIỀN & TÀI CHÍNH TOÀN CỤC:
   - Rò rỉ Kho Bạc (Treasury Leak):  0 Tr. VNĐ (Δ = 0 tuyệt đối)
   - Sai lệch số dư (NaN/Infinity):  0 lỗi
----------------------------------------------------------------------
3. CHỈ SỐ CHIẾN THUẬT NÂNG CẤP & ĐẤU GIÁ:
   - Tổng công trình đã nâng cấp:    3.828 căn (C1: 1.920, C2: 1.178, C3: 730)
   - Số sự cố mất khả năng trả nợ:   8.687 vụ
   - Tỷ lệ giải cứu thoát hiểm:      94.50% (8.209 lần giải cứu thành công)
   - Phiên đấu giá phát sinh:        16.187 phiên (Bot thắng: 9.550, Phát mãi: 6.303)
======================================================================
```

### 5.2. Chịu tải Đa Phòng Đồng Thời (Multi-Room Concurrency)
Đo lường kiểm thử tải đồng thời trên Server qua `RoomManager` và `Promise.all`:

| Chỉ Số Đánh Giá | Tải 20 Bàn Đồng Thời (800 turns) | Tải 50 Bàn Đồng Thời (2.000 turns) | Chuẩn NFR | Đánh Giá |
|---|---|---|---|---|
| **Thời gian xử lý vòng lặp turns** | 0.42 ms | 0.33 ms | < 5.000 ms | **Vượt xa chuẩn** |
| **Thời gian gồm khởi tạo & setup** | 1.65 ms | 1.10 ms | < 5.000 ms | **Vượt xa chuẩn** |
| **Thông lượng (Throughput)** | 483.997 turns/giây | 1.825.150 turns/giây | > 1.000 turns/giây | **Tối ưu cực đại** |
| **Độ trễ trung bình/turn** | 0.0021 ms | 0.0005 ms | < 5.0 ms | **Zero-lag** |
| **Tăng trưởng bộ nhớ Heap** | +0.21 MB | +0.33 MB | < 50.0 MB | **Không rò rỉ GC** |
| **Số lỗi runtime không bắt được** | **0** | **0** | 0 | **Hoàn hảo** |

### 5.3. Kịch bản Thao Tác Hỗn Loạn (Chaos Personas)
1. **Persona Bé Bo (Spam Click 50 Lần Gieo Xúc Xắc Đồng Thời)**:
   - Gửi 50 lệnh `INTENT_ROLL` đồng thời qua `IntentMutex.runExclusive`.
   - Kết quả: Đúng **1 lệnh đầu tiên thành công**, **49 lệnh còn lại bị từ chối nguyên tử** với mã `CANNOT_ROLL`. Quân cờ chỉ nhảy 1 lần duy nhất từ ô 0 lên ô 7. Không xảy ra race condition.
2. **Persona Bác Ba (Rớt Mạng Đột Ngột Khi Đang Gieo Xúc Xắc Hoặc Đấu Giá)**:
   - Ngắt kết nối khi đang ở `WaitingRoll` hoặc phiên đấu giá.
   - Kết quả (`turn_timeout_scheduler.test.ts` - 8/8 tests PASS): Bộ đếm `TurnTimeoutScheduler` tự động kích hoạt gieo xúc xắc thay thế hoặc pass đấu giá, phát mãi tài sản cho Kho Bạc khi tất cả người chơi bỏ cuộc, giải phóng FSM an toàn.
3. **Persona Chú Sáu (Thế Chấp & Phá Sản Cực Đoan)**:
   - Nợ âm hàng ngàn triệu, kích hoạt chuỗi thế chấp dồn dập và phá sản.
   - Kết quả (`insolvency_manager.test.ts`, `debt_mechanics.test.ts`, `mortgage_manager.test.ts` - 63/63 tests PASS): Thuật toán giải cứu tự động thế chấp theo đúng tỷ lệ định giá quy hoạch. Nếu không đủ, lệnh `INTENT_BANKRUPTCY` thanh lý toàn bộ tài sản sang chủ nợ hoặc Kho Bạc với bảo toàn dòng tiền tuyệt đối delta = 0.

### 5.4. Kiểm Thử Trình Duyệt Thực Tế Có Chụp Ảnh Màn Hình (Browser CDP)
Đã có đầy đủ 3 bộ báo cáo UAT kèm 240 ảnh chụp JPEG chất lượng cao trên đĩa:
1. `case_2p`: 60 lượt đi, 60 ảnh minh chứng (`turn_001.jpg` đến `turn_060.jpg`) tại `docs/reports/uat/uat_game_2_players_with_screenshots.md`.
2. `case_3p`: 80 lượt đi, 80 ảnh minh chứng (`turn_001.jpg` đến `turn_080.jpg`) tại `docs/reports/uat/uat_game_3_players_with_screenshots.md`.
3. `case_4p`: 100 lượt đi, 100 ảnh minh chứng (`turn_001.jpg` đến `turn_100.jpg`) tại `docs/reports/uat/uat_game_4_players_with_screenshots.md`.
Toàn bộ 240 lượt đi qua Microsoft Edge không đầu kết nối qua CDP kiểm chứng WebGL Canvas kết xuất mượt mà, không gặp lỗi WebGL context crash hay tràn bộ nhớ.

---

## 6. BẢNG DANH SÁCH FILE:LINE CẦN TỐI ƯU HÓA (ACTIONABLE LEDGER)

| Ưu Tiên | Tập Tin : Dòng | Hiện Trạng Cần Xử Lý | Giải Pháp Tối Ưu Cụ Thể |
|---|---|---|---|
| 🔴 **Cao** | `src/client/3d/diorama/diorama_traffic.tsx:94-95` | Cấp phát 16 `Vector3` mới mỗi frame trong `useSafeFrame` (~960 đối tượng/s) | Khởi tạo 2 biến `Vector3` tái sử dụng trong component và truyền vào: `curve.getPointAt(p, tempPoint)`, `curve.getTangentAt(p, tempTangent)`. |
| 🔴 **Cao** | `src/client/telemetry/telemetry_store.ts:120` | Mảng `violations` không có trần giới hạn độ dài | Thêm hằng số `MAX_VIOLATIONS = 50` và cắt mảng: `violations: [fullViolation, ...state.violations].slice(0, MAX_VIOLATIONS)`. |
| 🔴 **Cao** | `src/client/store/game_store.ts:475` | Mảng `floatingTexts` không có trần giới hạn độ dài | Thêm hằng số `MAX_FLOATING_TEXTS = 15` và cắt mảng: `[...state.floatingTexts, newItem].slice(-MAX_FLOATING_TEXTS)`. |
| 🟡 **Trung bình** | `src/server/room_manager.ts` (511 LOC)<br>`src/client/store/game_store.ts` (505 LOC)<br>`src/server/network/wss_server.ts` (468 LOC) | 3 file Core Logic vượt trần 400 LOC của GEMINI.md | - Tách logic Bot ra file `room_bot_coordinator.ts`.<br>- Tách quản lý animation pawn ra `pawn_animation_slice.ts`.<br>- Tách router message socket ra `wss_message_dispatcher.ts`. |
| 🟡 **Trung bình** | `src/client/network/apply_delta.ts:31` | Hàm `applyDeltaToStore` có CC = 119 và 325 LOC | Bóc tách thành 3 helper functions riêng biệt: `applyPlayerDeltas`, `applyCellDeltas`, `applyPhaseAndTimerDeltas`. |
| 🟢 **Thấp** | `src/client/game_canvas.tsx:102-108` | Gán lại biến `window.__three*` liên tục mỗi frame | Di chuyển vào `useEffect` để chỉ chạy 1 lần khi Scene và Camera khởi tạo. |
| 🟢 **Thấp** | `src/client/3d/procedural_building.tsx:49-52` | Ghi đè scale và vị trí mỗi frame khi không có slam | Sử dụng cờ `wasSlammingRef` để chỉ cập nhật khi kết thúc slam animation. |
