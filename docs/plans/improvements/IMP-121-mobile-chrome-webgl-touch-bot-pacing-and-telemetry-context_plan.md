# [IMP-121] Tối Ưu WebGL Mobile, CSS Cảm Ứng, Chỉ Báo Chờ Bot & Nâng Cấp Ngữ Cảnh Telemetry

- **Target Ticket**: IMP-121
- **Domain**: `[3D]`, `[UI]`, `[PERF]`, `[NET]`, `[TELEMETRY]`
- **Status**: IN_PROGRESS
- **Created**: 2026-09-19

---

## 1. MỤC TIÊU & BỐI CẢNH

Từ phản hồi và dữ liệu phiên chơi thực tế trên Mobile Chrome (`media_1789809712765.json`):
1. **WebGL Mobile Draw Calls**: Hiện tại đạt 636 draw calls do Shadow Map 2048x2048 và PCFSoft shadows render lại toàn bộ cảnh cho Shadow Pass. Cần tự động hạ Shadow Map xuống 1024x1024 và tối ưu shadow pass trên mobile để hạ nhiệt độ máy và tiết kiệm pin.
2. **CSS Cảm Ứng Mobile Chrome**: Thiếu `touch-action: manipulation` và `-webkit-tap-highlight-color: transparent`, dẫn đến độ trễ 300ms do double-tap zoom và vệt highlight màu xanh/xám mặc định của trình duyệt che mất hiệu ứng nút bấm 3D.
3. **Tiến Độ Chờ Bot (Bot Pacing Indicator)**: Khoảng thời gian 3 Bot đi mất ~12 giây mỗi vòng mà không có chỉ báo trực quan cụ thể khiến người chơi trên di động không rõ Bot nào đang làm gì. Cần bổ sung Chip trạng thái công thái học: `"⏳ Bot Hoàng Nam đang gieo xúc xắc... (1/3)"`.
4. **Ngữ Cảnh Telemetry Flight Recorder**: Mảng `recordedIntents` hiện chỉ lưu `{ type: 'INTENT_ROLL' }` trần trụi, thiếu ngữ cảnh giao diện (nhãn nút lúc bấm, trạng thái đổ đôi, số thứ tự xúc xắc). Cần gắn kèm `context` chi tiết (nhãn nút, cờ `isDoublesRoll`, xúc xắc hiện tại) để phục vụ giám sát và phân tích pháp chứng không thể suy diễn sai.

---

## 2. PRE-FLIGHT BLAST RADIUS AUDIT

- **Mức độ rủi ro**: Slice-Bound (Giới hạn trong tầng Client WebGL, Client HUD CSS, Telemetry Recorder).
- **Vùng chạm trực tiếp (Direct Touch)**:
  - `src/client/game_canvas.tsx`: Truyền `isMobileDevice` vào `TimeOfDayLighting`, tinh chỉnh `shadows`.
  - `src/client/3d/time_of_day_lighting.tsx`: Tối ưu `shadow-mapSize` dựa trên `isMobile`.
  - `src/client/index.css`: Bổ sung `touch-action: manipulation` và `-webkit-tap-highlight-color: transparent`.
  - `src/client/ui/action_dock.tsx`: Thêm Bot Pacing Indicator khi `!isMyTurn`.
  - `src/client/telemetry/telemetry_types.ts`: Mở rộng `RecordedIntent` và `AuditLogEntry` với `RecordedIntentContext`.
  - `src/client/telemetry/telemetry_store.ts`: Hỗ trợ tham số `context` trong `recordIntent`.
  - `src/client/network/use_game_ws.ts`: Bổ sung trích xuất ngữ cảnh giao diện khi gửi intent.
- **Người dùng hạ nguồn (Downstream Consumers)**:
  - Server FSM: Hoàn toàn không đổi, giữ nguyên tính tương thích hợp đồng gói tin WebSocket.
  - Bộ test hiện tại (4.598 tests): Không bị ảnh hưởng do `context` là trường tùy chọn (optional field).
- **Phương án phòng vệ xấu nhất (Worst-case Defense)**:
  - Nếu `isMobile` không phát hiện được, fallback về cấu hình mặc định an toàn.
  - Nếu `context` của intent bị undefined, `RecordedIntent` vẫn giữ định dạng payload gốc.

---

## 3. THIẾT KẾ KỸ THUẬT & HỢP ĐỒNG KIỂM THỬ

### A. Tầng WebGL & Đồ Họa Di Động
- Trong `time_of_day_lighting.tsx`: Thêm prop `isMobile?: boolean`. Kích thước `shadow-mapSize-width={isMobile ? 1024 : 2048}` và `shadow-mapSize-height={isMobile ? 1024 : 2048}`.
- Trong `game_canvas.tsx`: Truyền `isMobile={isMobileDevice}` vào `<TimeOfDayLighting isMobile={isMobileDevice} />`. Tinh chỉnh `shadows={isMobileDevice ? 'basic' : 'soft'}`.

### B. Tầng Trình Bày & Tối Ưu Cảm Ứng CSS
- Trong `index.css`: Thêm `touch-action: manipulation` và `-webkit-tap-highlight-color: transparent` vào `html, body, #root` và `button, a, input, select`.
- Trong `action_dock.tsx`: Bổ sung chip tiến độ Bot `bot-pacing-chip` khi `!isMyTurn && currentTurnPlayer?.isBot`. Hiển thị tên bot, avatar/emoji, và trạng thái hành động.

### C. Tầng Telemetry Hộp Đen
- Trong `telemetry_types.ts`: Thêm `RecordedIntentContext`:
  - `buttonLabel?: string`
  - `isDoublesRoll?: boolean`
  - `consecutiveDoubles?: number`
  - `currentTurnPlayerId?: string`
  - `dice?: readonly [number, number]`
  - `position?: number`
  - `balance?: number`
  - `note?: string`
- Trong `telemetry_store.ts`: Cập nhật `recordIntent(playerId, intent, context)`.
- Trong `use_game_ws.ts`: Khi gửi intent, lấy snapshot từ `useGameStore` và truyền vào `recordIntent`.
