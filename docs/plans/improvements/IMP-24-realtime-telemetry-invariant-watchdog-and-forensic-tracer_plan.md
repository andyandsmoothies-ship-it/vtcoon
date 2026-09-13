# KẾ HOẠCH CẢI TIẾN: IMP-24
# HỆ THỐNG GIÁM SÁT THỜI GIAN THỰC, CHÓ CANH PHÒNG BẤT BIẾN & TRUY VẾT TÁI HIỆN LỖI (REAL-TIME TELEMETRY, INVARIANT WATCHDOG & FORENSIC FLIGHT RECORDER)

> **Mã số cải tiến:** IMP-24  
> **Thuộc chu trình:** Continuous Improvement & Ad-hoc Persistence (Hiến pháp `GEMINI.md`)  
> **Mục tiêu:** Cung cấp hạ tầng giám sát hiệu năng thời gian thực (FPS, Draw Calls, Ping RTT), nhật ký kiểm toán toàn diện mọi hành động (Người, Bot, Server), công cụ tự động phát hiện lỗi/glitch/treo (Invariant Watchdog) và cơ chế đóng băng hiện trường kèm xuất mã test tái hiện lỗi 1-click (Forensic Repro Generator).  
> **Ngày lập kế hoạch:** 12/09/2026  
> **Trạng thái:** ĐÃ LẬP KẾ HOẠCH & CHỜ PHÊ DUYỆT  

---

## 1. BỐI CẢNH & MỤC TIÊU NGHIỆM THU

### 1.1 Vấn Đề Thực Tế
1. Khi chơi game với Bot hoặc nhiều người chơi, các lỗi tiềm ẩn như tính sai tiền thuê, tiền tự động biến mất/sinh ra, bot bị kẹt vòng lặp vô tận, hoặc quân cờ nhảy sai ô có thể xảy ra mà người chơi không biết nguyên nhân do đâu.
2. Nếu chỉ có cảnh báo đơn thuần (Warning Badge), khi xảy ra lỗi người chơi không thể biết bước nào trước đó đã gây ra lỗi, gây khó khăn cho việc sửa chữa.
3. Cần một hệ thống "Hộp Đen Máy Bay" (Flight Recorder) vừa theo dõi FPS/Ping/Draw Calls mượt mà, vừa đóng băng được dữ liệu hiện trường (Pre-State, Post-State, Trigger Intent) và có thể tự động xuất mã test Vitest để tái hiện lại lỗi ngay lập tức.

### 1.2 Tiêu Chí Nghiệm Thu (Definition of Done)
- [ ] **Real-Time Telemetry Badge**: Huy hiệu mini góc trên bên phải hiển thị trạng thái động `[🟢 60 FPS | 14ms | 🛡️ Invariants: OK]`.
- [ ] **Audit Ring Buffer**: Lưu trữ 50-100 sự kiện thô gần nhất (Raw intents, deltas, bot utility scores).
- [ ] **4 Bài Kiểm Tra Bất Biến (Invariant Engine)**:
  * Bảo toàn tiền tệ toàn ván (Treasury Conservation Invariant).
  * Kiểm tra giới hạn tọa độ bước đi (Movement Step Consistency: `(d1 + d2) % 40`).
  * Kiểm tra số dư không âm ngoài trạng thái vỡ nợ (Non-Negative Balance Guard).
  * Tính toàn vẹn quyền sở hữu BĐS (Ownership & Level Boundaries 0-3).
- [ ] **Chó Canh Phòng Chống Treo / Glitch (Watchdog Monitor)**:
  * Phát hiện kẹt lượt (`Turn Stalled > 45s`).
  * Phát hiện Bot lặp vô tận (`Bot Loop > 8 actions / 300ms`).
  * Phát hiện kẹt FSM do hoạt ảnh không hoàn tất.
- [ ] **Truy Vết Hiện Trường & Tái Hiện Lỗi 1-Click (Forensic Repro Generator)**:
  * Lưu trữ 20 ticks snapshot gần nhất (Pre-State vs Post-State).
  * Hiển thị bảng so sánh vi sai (State Diff).
  * Nút "Sao Chép Test Tái Hiện" (Copy Vitest Repro Code) xuất code kịch bản hoàn chỉnh dựa trên Session Seed và Intent History.
  * Tùy chọn "Tự động Pause khi gặp lỗi nghiêm trọng" (Debug Auto-Freeze).
- [ ] **Bảng Điều Khiển Giám Sát Chuyên Sâu (Telemetry Console Modal)**: Bật/tắt bằng phím tắt `~` hoặc click vào Mini Badge, chia 4 Tab khoa học.

---

## 2. THIẾT KẾ KIẾN TRÚC HỆ THỐNG 4 TẦNG

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 1: THU THẬP DỮ LIỆU THỜI GIAN THỰC (METRIC SENSORS)                         │
│ • WebGL Render Loop ──► FPS, FrameTime (ms), DrawCalls, Triangles (perf_budget)  │
│ • WebSocket Transport ──► Ping RTT (ms), Delta Size (bytes), Tick Rate           │
│ • State Delta Stream ──► Raw Intents, Actor (Người/Bot), Cash Flow               │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TẦNG 2: BỘ XỬ LÝ & BẢO VỆ BẤT BIẾN (INVARIANT & WATCHDOG ENGINE)                 │
│ • InvariantChecker: Kiểm tra bảo toàn tiền, tọa độ, số dư, cấp nhà               │
│ • WatchdogMonitor: Giám sát Turn Stall > 45s, Bot Burst Loop                     │
│ • SnapshotBuffer: Ring buffer lưu 20 ticks (Pre-State, Trigger, Post-State)     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TẦNG 3: LƯU TRỮ TRẠNG THÁI GIÁM SÁT (TELEMETRY STORE - ZUSTAND)                 │
│ • metrics: TelemetryMetrics                                                      │
│ • auditLogs: RingBuffer<AuditLogEntry>(100)                                       │
│ • violations: InvariantViolation[]                                               │
│ • isConsoleOpen: boolean, activeTab: 'perf' | 'audit' | 'invariants' | 'trace'   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TẦNG 4: GIAO DIỆN & CÔNG CỤ TRUY VẾT (DOM UI OVERLAY)                            │
│ • [TelemetryBadge]: Micro pill góc trên [60 FPS | 12ms | 🛡️ OK]                 │
│ • [TelemetryConsoleModal]: Bảng điều khiển 4 tab chuyên sâu (Phím tắt `~`)       │
│ • [ReproGenerator]: Nút "Xuất Test Tái Hiện" & "Tải File Hộp Đen JSON"           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. THIẾT KẾ MÃ NGUỒN CHI TIẾT

### 3.1 Tệp Mới Cần Tạo

1. **`src/client/telemetry/telemetry_types.ts` (~120 LOC)**:
   - Khai báo kiểu: `TelemetryMetric`, `AuditLogEntry`, `InvariantViolation`, `ForensicSnapshot`, `FlightRecorderDump`.
2. **`src/client/telemetry/telemetry_store.ts` (~180 LOC)**:
   - Quản lý trạng thái metrics, danh sách vi phạm, ring buffer 100 sự kiện, 20 snapshot ticks.
   - Cung cấp hàm `recordMetric()`, `recordAudit()`, `reportViolation()`, `toggleConsole()`.
3. **`src/client/telemetry/invariant_checker.ts` (~180 LOC)**:
   - Hàm thuần túy kiểm tra 4 bất biến sau mỗi delta nhận về từ server.
4. **`src/client/telemetry/watchdog_monitor.ts` (~140 LOC)**:
   - Theo dõi chu kỳ đếm ngược của turn timer và tần suất thao tác của bot.
5. **`src/client/telemetry/repro_generator.ts` (~140 LOC)**:
   - Nhận vào `seed` và mảng `intents`, xuất ra chuỗi mã nguồn TypeScript/Vitest test case hoàn chỉnh có thể dán vào chạy ngay.
6. **`src/client/ui/telemetry/telemetry_badge.tsx` (~110 LOC)**:
   - Component huy hiệu nhỏ gọn, đổi màu xanh/vàng/đỏ linh hoạt.
7. **`src/client/ui/telemetry/telemetry_console_modal.tsx` (~320 LOC)**:
   - Bảng điều khiển 4 tab Glassmorphism cao cấp, có diff viewer và nút xuất dữ liệu.

### 3.2 Tệp Cần Tích Hợp
1. **`src/client/network/apply_delta.ts`**:
   - Gọi `InvariantChecker.verify()` và lưu `AuditLog` sau mỗi lần áp dụng delta.
2. **`src/client/3d/game_canvas.tsx`**:
   - Nối vòng lặp render `useFrame` với `recordMetric('fps')` và `recordMetric('drawCalls')`.
3. **`src/client/network/use_game_ws.ts`**:
   - Bổ sung đo đạc Ping RTT trong chu kỳ heartbeat.
4. **`src/client/ui/hud_container.tsx`**:
   - Gắn `<TelemetryBadge />` và `<TelemetryConsoleModal />` vào DOM HUD.

---

## 4. KỊCH BẢN KIỂM THỬ ĐỐI KHÁNG (ADVERSARIAL TESTS)

Tạo tệp `tests/client/telemetry_system.test.ts`:
1. **Test Invariant Money Leak**: Cố tình inject delta làm hụt 500 Tr. VNĐ trong lưu thông ➔ Xác nhận hệ thống bắt được vi phạm `TREASURY_INVARIANT_VIOLATED` ngay lập tức.
2. **Test Invariant Teleport**: Cố tình inject delta vị trí nhảy 15 ô trong khi xúc xắc là `[2, 3]` (tổng 5) mà không có thẻ cơ hội ➔ Bắt được `INVALID_POSITION_STEP`.
3. **Test Watchdog Turn Stall**: Giả lập timer đếm về 0 nhưng phase không đổi suốt 45s ➔ Watchdog phát cờ `TURN_STALLED`.
4. **Test Bot Loop Burst**: Giả lập 10 intents trong 100ms ➔ Bắt được `BOT_INFINITE_LOOP`.
5. **Test Repro Generator**: Chạy giả lập 5 nước đi, gọi `generateReproTestCode()` ➔ Xác nhận mã code sinh ra là cú pháp TypeScript hợp lệ, chứa đúng seed và thứ tự intents.

---

## 5. THỨ TỰ THỰC HIỆN

1. **Bước 1**: Tạo các tệp lõi `telemetry_types.ts`, `invariant_checker.ts`, `watchdog_monitor.ts`, `repro_generator.ts`, `telemetry_store.ts`.
2. **Bước 2**: Viết bộ test đối kháng `tests/client/telemetry_system.test.ts` và chạy test xanh 100%.
3. **Bước 3**: Tạo giao diện `telemetry_badge.tsx` và `telemetry_console_modal.tsx`, kiểm tra `npm run lint:ui`.
4. **Bước 4**: Nối dây vào `apply_delta.ts`, `game_canvas.tsx`, `use_game_ws.ts`, `hud_container.tsx`.
5. **Bước 5**: Chạy `npm run gate:quick` nghiệm thu toàn diện, cập nhật roadmap và trích xuất gotchas.
