# BÁO CÁO CẢI TIẾN: IMP-175
## Tên cải tiến: Auto Cloud Log Backfill, JWT-First Key Priority Resolution & Admin Portal 1-Click Sync

### 1. Kết quả thực hiện (Execution Summary)
- Đã hoàn tất 100% các mục tiêu kỹ thuật theo đúng quy trình 3 trạm (3-Station Pipeline).
- 16/16 hợp đồng kiểm thử mới tại `tests/server/imp175_cloud_sync_and_backfill.test.ts` PASS.
- 23/23 kiểm thử hồi quy tại `tests/server/imp169_supabase_storage.test.ts` PASS.
- Toàn bộ 301 test files (6,132 tests) của dự án PASS 100% không hồi quy.
- `tsc --noEmit` hoàn toàn sạch 0 lỗi kiểu dữ liệu.
- `npm run lint:ui` sạch 0 vi phạm (tuân thủ Impeccable Design System).

### 2. Chi tiết các tệp đã tạo mới và chỉnh sửa
| Tệp | Thay Đổi | Mô Tả |
| :--- | :---: | :--- |
| `src/server/storage/supabase_storage.ts` | Sửa (+80 LOC) | Bổ sung `resolveSupabaseKey` tự động strip quotes, ưu tiên token `eyJ...` (JWT) trước `sb_...` (OPAQUE). Cung cấp `keyType` và `defaultBucket`. |
| `src/server/storage/supabase_log_sync.ts` | Mới (+220 LOC) | Động cơ đồng bộ lô (`CHUNK_SIZE = 3`), tự ngắt fail-fast trên 401/403, upload `rooms_manifest.json` sau cùng, hàm `autoBackfillCloudLogs` chạy nền khi bootup. |
| `src/server/network/admin_types.ts` | Sửa (+9 LOC) | Bổ sung `storageStatus` vào `ServerVitals`, định nghĩa `AdminSyncCloudResult`. |
| `src/server/network/network_types.ts` | Sửa (+8 LOC) | Bổ sung client intent `ADMIN_SYNC_CLOUD_STORAGE` và server response `ADMIN_SYNC_CLOUD_RESULT`. |
| `src/server/network/admin_manager.ts` | Sửa (+45 LOC) | Triển khai `syncCloudLogs` có mutex `isSyncingCloud`, đảm bảo giải phóng trong `finally`. Bổ sung getter `manifestCatalog`. |
| `src/server/network/admin_message_handler.ts` | Sửa (+27 LOC) | Xử lý thông điệp WebSocket `ADMIN_SYNC_CLOUD_STORAGE`, guard xác thực `ADMIN_UNAUTHORIZED`. |
| `src/client/ui/admin/use_admin_portal.ts` | Sửa (+20 LOC) | Hook xử lý `handleSyncCloud`, quản lý cờ trạng thái `isSyncingCloud`, nhận kết quả đồng bộ. |
| `src/client/ui/admin/admin_portal.tsx` | Sửa (+25 LOC) | Header telemetry badge (`☁️ Supabase: 🟢 Đã kết nối / 🔴 Chưa kết nối`), nút `[☁️ Đồng Bộ Cloud]` 1-click chuẩn 44px touch target. |
| `src/server/index.ts` | Sửa (+12 LOC) | Kích hoạt `autoBackfillCloudLogs` bất đồng bộ khi server khởi động (chỉ chạy trong môi trường non-test). |
| `docs/domain/gotchas.md` | Sửa (+20 LOC) | Ghi nhận Invariant số 244: Safe Fallback For Unconfigured Cloud Storage & No-op Auto-Backfill Invariant. |

### 3. Phê duyệt Trạm 3 (Station 3 Approvals)
- **`spec-reviewer`**: VERDICT APPROVED (100% khớp đặc tả, 0 scope drift, 0 bug codification).
- **`ui-craft-reviewer`**: VERDICT PASS (disposition: ship, 0 anti-patterns, responsive 360px viewport).
