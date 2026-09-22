# Kế Hoạch Cải Tiến IMP-169 (P2): Supabase Cloud Log Persistence, Self-Healing Re-indexer & Test Isolation

## 1. Bối Cảnh & Vấn Đề
- **Môi trường Render Ephemeral Filesystem**: Khi deploy bản build mới lên Render (`vtcoon.onrender.com`), container cũ bị hủy cùng toàn bộ thư mục `/app/server_logs`, làm mất sạch lịch sử các trận đấu đã chơi khi vào trang Quản Trị Viên (`/admin`).
- **Nhiễm bẩn thư mục log từ test tự động**: Khi chạy `npm test` ở local, `PersistentRoomLogger` ghi đè file `rooms_manifest.json` trong `server_logs/rooms/`, làm biến mất các phòng game thực tế.
- **Rủi ro đứt gãy giao tiếp WebSocket Admin**: Các hàm đọc log của Admin trước đây là đồng bộ, khi chuyển sang tải dữ liệu đám mây bất đồng bộ cần cấu trúc async/await an toàn mà không làm chậm các gói tin game của người chơi thông thường.

## 2. Giải Pháp Triển Khai
1. **Supabase Storage Service (`src/server/storage/supabase_storage.ts`)**:
   - Sử dụng native `fetch` chuẩn của Node.js 20 (`0 npm package added`).
   - Đầy đủ header chuẩn: `'x-upsert': 'true'`, `'apikey'`, `'Authorization': 'Bearer ...'`, `AbortSignal.timeout(5000)`.
   - Lưu trữ song song cả file `.jsonl` phòng chơi lẫn danh mục tổng `_manifest/rooms_manifest.json`.
2. **Self-Healing Re-indexer & Test Isolation (`src/server/logging/`)**:
   - Phân tách logic phục hồi vào `src/server/logging/room_logger_reindexer.ts` (tuân thủ giới hạn <= 400 LOC).
   - Tự động tái tạo catalog từ các file `.jsonl` có sẵn trên đĩa nếu `rooms_manifest.json` bị mất hoặc rỗng.
   - Khi chạy test (`NODE_ENV === 'test'`), tự động lưu log vào `.agents/tmp/test_logs/worker_${VITEST_POOL_ID || process.pid}`, bảo vệ tuyệt đối thư mục production.
3. **Async / Sync Hybrid Admin Pipeline (`src/server/network/`)**:
   - `handleAdminClientMessage`: Trả về `boolean` đồng bộ cho các message gameplay thường (`CREATE_ROOM`, `JOIN_ROOM`), và `Promise<boolean>` cho các message quản trị (`ADMIN_GET_ARCHIVED_LOGS`, `ADMIN_GET_ARCHIVED_ROOMLIST`).
   - `wss_server.ts`: Tránh độ trễ microtask cho gói tin game trong khi vẫn hỗ trợ async streaming log từ Supabase về client.
4. **Mobile 360px Admin Responsiveness (`src/client/ui/admin/`)**:
   - `admin_portal.tsx`: Nhãn filter text-[11px] đạt chuẩn sàn đọc mobile; aside drawer responsive.
   - `admin_archive_view.tsx`: `flex-col sm:flex-row`, `truncate` tiêu đề và file path, `overflow-auto` cho khung terminal log.

## 3. Ma Trận Kiểm Thử Đối Kháng
- `tests/server/imp169_supabase_storage.test.ts`: 23/23 tests pass.
- Toàn bộ 298 test suites (6.097 tests) pass 100%.
- TypeScript strict check và `npm run lint:ui` đạt 0 lỗi vi phạm.
