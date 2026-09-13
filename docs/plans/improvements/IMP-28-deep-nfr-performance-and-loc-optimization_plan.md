# KẾ HOẠCH KỸ THUẬT: TỐI ƯU HIỆU NĂNG RENDER LOOP, KHÓA TRẦN BỘ NHỚ STORE & PHÂN RÃ CORE LOGIC <= 400 LOC (IMP-28)

> **Mã số:** IMP-28  
> **Căn cứ:** Hiến pháp `GEMINI.md`, Báo cáo kiểm toán `docs/reports/audits/deep_nfr_performance_and_simulation_audit_report.md`.  
> **Mục tiêu:** Cắt giảm triệt để 100% rác cấp phát trong render loop 60 FPS, áp trần Ring Buffer O(1) cho các store Zustand, phân rã toàn bộ file Core Logic về <= 400 LOC và Cyclomatic Complexity <= 5, đảm bảo 122/122 test suites PASS 100%.

---

## 1. MỤC TIÊU & PHẠM VI TRIỂN KHAI

Đợt rà soát sâu toàn diện Deep NFR, Performance & Simulation Audit đã ghi nhận hệ thống ổn định trên cả 5 trục nhưng còn một số điểm nghẽn kỹ thuật và vi phạm trần độ phức tạp của Hiến pháp `GEMINI.md`:
1. **Render Loop GC Pressure**: `src/client/3d/diorama/diorama_traffic.tsx` gọi `curve.getPointAt()` và `getTangentAt()` sinh ra 16 đối tượng `Vector3` mỗi frame (960 allocations/giây).
2. **Unbounded Zustand Arrays**: `telemetry_store.ts` (`violations`) và `game_store.ts` (`floatingTexts`) tích lũy mảng không có trần dung lượng cứng.
3. **Core Logic LOC & Complexity Ceiling**:
   - `src/server/room_manager.ts` (511 LOC > 400 LOC limit).
   - `src/server/network/wss_server.ts` (468 LOC > 400 LOC limit).
   - `src/client/store/game_store.ts` (505 LOC > 400 LOC limit).
   - `src/client/network/apply_delta.ts` (419 LOC > 400 LOC limit, CC = 119).
4. **Scene Graph Redundant Writes**:
   - `game_canvas.tsx` gán biến window mỗi khung hình trong `useFrame`.
   - `procedural_building.tsx` ghi đè ma trận 28 ô công trình liên tục khi tĩnh.

---

## 2. KẾ HOẠCH PHÂN RÃ 4 PHA CHI TIẾT

```
[Pha 1: Ưu Tiên Cao]
  ├── diorama_traffic.tsx: Pre-allocated Vector3 (tempVec, tempTangent) -> 0 Allocation/Frame
  ├── telemetry_store.ts: MAX_VIOLATIONS = 50, slice(0, MAX_VIOLATIONS)
  └── game_store.ts: MAX_FLOATING_TEXTS = 15, slice(-MAX_FLOATING_TEXTS)

[Pha 2: Ưu Tiên Trung Bình]
  ├── room_manager.ts: Tách room_bot_coordinator.ts & room_property_coordinator.ts (<= 400 LOC)
  ├── wss_server.ts: Tách wss_lobby_handlers.ts (<= 400 LOC), sửa default botTurnDelayMs = 800ms
  ├── game_store.ts: Tách game_store_types.ts (<= 400 LOC)
  └── apply_delta.ts: Phân rã applyPlayer / applyCell / applyPhase (CC <= 5, LOC <= 400)

[Pha 3: Ưu Tiên Thấp]
  ├── game_canvas.tsx: Chuyển gán window refs vào useEffect
  └── procedural_building.tsx: wasSlammingRef bảo vệ ma trận khi tĩnh

[Pha 4: Kiểm Chứng Nghiệm Thu]
  ├── npx tsc --noEmit (0 lỗi)
  ├── npm run gate:quick (0 anti-patterns, 0 hard slop, duplication < 3.0%)
  └── npm test (122/122 test files PASS, 1.437/1.437 tests)
```

---

## 3. THIẾT KẾ KỸ THUẬT CHI TIẾT

### 3.1. Pha 1: Tối Ưu Cấp Phát Bộ Nhớ Render Loop & Khóa Trần Store
1. **`diorama_traffic.tsx`**:
   - Khởi tạo 2 biến ở phạm vi module:
     ```typescript
     const tempVec = new Vector3();
     const tempTangent = new Vector3();
     ```
   - Trong `useSafeFrame`, sử dụng in-place mutation:
     ```typescript
     curve.getPointAt(progress, tempVec);
     curve.getTangentAt(progress, tempTangent);
     grp.position.copy(tempVec);
     grp.rotation.set(0, Math.atan2(tempTangent.x, tempTangent.z), 0);
     ```
2. **`telemetry_store.ts`**:
   - Thêm hằng số `export const MAX_VIOLATIONS = 50;`.
   - Giới hạn mảng vi phạm: `violations: [fullViolation, ...state.violations].slice(0, MAX_VIOLATIONS)`.
3. **`game_store.ts`**:
   - Thêm hằng số `export const MAX_FLOATING_TEXTS = 15;`.
   - Giới hạn mảng chữ nổi: `floatingTexts: [...state.floatingTexts, newItem].slice(-MAX_FLOATING_TEXTS)`.

### 3.2. Pha 2: Phân Rã Module Core Logic & Giảm Độ Phức Tạp
1. **`room_manager.ts` (511 -> <= 400 LOC)**:
   - Trích xuất toàn bộ vòng lặp quyết định Bot AI và đấu giá sang `src/server/room_bot_coordinator.ts`.
   - Trích xuất xử lý thế chấp, giải chấp, hạ cấp, thanh lý và P2P trade sang `src/server/room_property_coordinator.ts`.
   - Giữ nguyên 100% public contracts của `RoomManager`.
2. **`wss_server.ts` (468 -> <= 400 LOC)**:
   - Trích xuất logic sảnh chờ (tạo/vào/rời phòng, chuẩn bị, thêm/xóa bot), xử lý ping/pong, emote và resync sang `src/server/network/wss_lobby_handlers.ts`.
   - Sửa giá trị mặc định của `botTurnDelayMs` từ 2000ms về đúng 800ms để triệt tiêu timeout trong test song song.
   - Phân biệt rõ ràng payload `INTENT_REJECTED` (có `playerId`) và `ERROR` (không có `playerId`) để thỏa mãn kiểu union `WsServerMessage`.
3. **`game_store.ts` (505 -> <= 400 LOC)**:
   - Tạo mới `src/client/store/game_store_types.ts`, di chuyển toàn bộ interfaces, enums (`FloatingTextType`), types và payload maps sang.
   - Re-export toàn bộ kiểu dữ liệu từ `game_store.ts` để bảo đảm không gãy bất kỳ import nào trong client.
4. **`apply_delta.ts` (419 -> <= 400 LOC, CC <= 5)**:
   - Phân rã hàm nguyên khối `applyDeltaToStore` thành 3 hàm phụ trách riêng biệt:
     - `applyPlayerDeltas`: Cập nhật tiền, vị trí, cờ phá sản/kiểm toán.
     - `applyCellDeltas`: Cập nhật cấp nhà 0-3, thế chấp, chủ sở hữu.
     - `applyPhaseAndTimerDeltas`: Cập nhật phase, timer, quỹ kho bạc, xúc xắc.
   - Tinh giản vòng lặp kiểm tra flags thông qua danh sách thuộc tính `OPTIONAL_PLAYER_KEYS`.

### 3.3. Pha 3: Tối Ưu Vi Mô Render Loop & Scene Graph
1. **`game_canvas.tsx`**: Chuyển toàn bộ việc gán `window.__threeScene`, `window.__threeCamera` từ `useFrame` vào hook `useEffect([scene, camera])`.
2. **`procedural_building.tsx`**: Thêm cờ `wasSlammingRef = useRef(false)`. Khi kết thúc slam animation, chỉ reset `position.y` và `scale` 1 lần duy nhất; khi tĩnh tuyệt đối không gán lại.

---

## 4. KẾ HOẠCH KIỂM THỬ & CHỈ TIÊU NGHIỆM THU (DoD)
1. **Type Safety**: `npx tsc --noEmit` hoàn thành với mã thoát 0 (0 lỗi).
2. **Quality Gates**: `npm run gate:quick` hoàn thành với mã thoát 0:
   - 0 anti-patterns giao diện 2D.
   - 0 hard violations quy chuẩn anti-slop.
   - Tỷ lệ trùng lặp mã nguồn < 3.0%.
3. **Full Test Suite**: `npm test` vượt qua 100% (122/122 test files, 1.437/1.437 automated tests).
4. **Giới hạn dòng mã (LOC)**:
   - `room_manager.ts` <= 400 LOC.
   - `wss_server.ts` <= 400 LOC.
   - `game_store.ts` <= 400 LOC.
   - `apply_delta.ts` <= 400 LOC.
5. **Tài liệu hóa**: Cập nhật báo cáo nghiệm thu vào `docs/reports/improvements/IMP-28-deep-nfr-performance-and-loc-optimization_report.md`, ghi nhận Gotcha #43 vào `docs/domain/gotchas.md` và cập nhật `docs/master_roadmap.md`.
