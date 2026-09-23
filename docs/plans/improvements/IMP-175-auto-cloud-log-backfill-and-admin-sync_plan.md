# KẾ HOẠCH CẢI TIẾN: IMP-175
## Tên cải tiến: Auto Cloud Log Backfill, JWT-First Key Priority Resolution & Admin Portal 1-Click Sync

### 1. Bối cảnh & Vấn đề (Context & Problem)
- Ván đấu `VT09TV` trên Render kết thúc lúc 6:57 AM nhưng log không xuất hiện trên Supabase Cloud Storage bucket `game-logs`.
- Nguyên nhân gốc rễ:
  1. Tiến trình Node.js trên Render khởi chạy lúc 6:42 AM (uptime 28m 15s lúc 7:10 AM). Khi người dùng cập nhật biến môi trường `SUPABASE_KEY` dạng JWT sau 6:42 AM trên Web Dashboard của Render, hệ thống Render không tự động đưa biến mới vào RAM của tiến trình Node.js đang chạy. Cần phải có tín hiệu Restart/Redeploy container.
  2. Tại thời điểm kết thúc ván đấu lúc 6:57 AM, tiến trình cũ dùng `sb_...` publishable key nên bị Supabase từ chối với lỗi `Invalid Compact JWS`. Hệ thống cũ chỉ gọi upload 1 lần duy nhất trong `finishRoomLog` nên tệp `VT09TV_...jsonl` nằm lại trên ổ đĩa và không bao giờ được tải lên nếu thiếu cơ chế Auto-Backfill khi server khởi động.
  3. Giao diện Admin Portal chưa có nhãn hiển thị trạng thái kết nối Supabase và chưa có nút bấm chủ động đồng bộ thủ công 1-click.

### 2. Mục tiêu kỹ thuật (Technical Objectives)
1. **RFC 7515 JWT Priority Resolution**: Triển khai `resolveSupabaseKey` tự động strip quotes `"` `'` và khoảng trắng, ưu tiên token bắt đầu bằng `eyJ` gán `keyType = 'JWT'` trước khi fallback về `sb_...`.
2. **Auto-Backfill khi server bootup**: Khi server Node.js khởi động (`startServer()`), quét thư mục log cục bộ và tự động đẩy các ván đấu cũ chưa được đưa lên Cloud Storage (`CHUNK_SIZE = 3`).
3. **Admin Portal 1-Click Sync & Telemetry**:
   - Thêm nút `[☁️ Đồng Bộ Cloud]` (`data-testid="admin-sync-cloud-btn"`) có mutex chống spam `isSyncingCloud`.
   - Thêm badge kết nối: `☁️ Supabase: 🟢 Đã kết nối ({bucket})` (mobile: `☁️ 🟢`) hoặc `☁️ Supabase: 🔴 Chưa kết nối` (mobile: `☁️ 🔴`).
4. **Phân tách mô-đun chống phình to**: Tách toàn bộ logic đồng bộ sang `src/server/storage/supabase_log_sync.ts`, giữ `persistent_room_logger.ts` dưới ngưỡng 400 LOC.

### 3. Quy trình thực hiện (Implementation Strategy)
- Trạm 1: Viết 16 bài test hợp đồng RED tại `tests/server/imp175_cloud_sync_and_backfill.test.ts`.
- Trạm 2: Hiện thực hóa mã nguồn trong `src/server/storage/supabase_storage.ts`, `src/server/storage/supabase_log_sync.ts`, `src/server/network/admin_manager.ts`, `src/server/network/admin_message_handler.ts`, `src/client/ui/admin/use_admin_portal.ts`, `src/client/ui/admin/admin_portal.tsx`, `src/server/index.ts`.
- Trạm 3: Kiểm toán độc lập bởi `spec-reviewer` và `ui-craft-reviewer`.
