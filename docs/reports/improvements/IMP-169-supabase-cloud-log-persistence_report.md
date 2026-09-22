# Báo Cáo Cải Tiến IMP-169 (P2): Supabase Cloud Log Persistence, Self-Healing Re-indexer & Test Isolation

## 1. Kết Quả Triển Khai
- **Mã Ticket**: IMP-169 (P2)
- **Mục tiêu**: Bảo toàn vĩnh viễn dữ liệu lịch sử ván game qua các lần deploy Render, tự phục hồi danh mục phòng khi mất manifest, và cách ly hoàn toàn thư mục test.
- **Trạng thái**: **HOÀN TẤT & ĐÃ DUYỆT (ALL GATES PASSED)**.

## 2. Thống Kê Thay Đổi Mã Nguồn
| Tệp Tin | Thao Tác | LOC | Chức Năng |
| :--- | :---: | :---: | :--- |
| `src/server/storage/supabase_storage.ts` | TẠO MỚI | 84 | Service REST Client giao tiếp Supabase Storage với `x-upsert`, timeout 5s, 0 npm dependencies |
| `src/server/logging/room_logger_reindexer.ts` | TẠO MỚI | 95 | Module tự động quét và phục hồi catalog từ các file `.jsonl` cục bộ |
| `src/server/logging/persistent_room_logger.ts` | CẬP NHẬT | 388 (<=400) | Tích hợp đồng bộ Supabase ngầm, graceful exit drain, worker test isolation |
| `src/server/network/admin_manager.ts` | CẬP NHẬT | 349 | Bổ sung `getRoomFullLogAsync`, `getArchivedRoomsListAsync` và hybrid dispatch |
| `src/server/network/admin_message_handler.ts` | CẬP NHẬT | 170 | Hỗ trợ async callback cho các truy vấn log lịch sử từ Admin |
| `src/server/network/wss_server.ts` | CẬP NHẬT | 372 | Xử lý hybrid sync/async trong `route()` tránh nghẽn microtask |
| `src/client/ui/admin/admin_portal.tsx` | CẬP NHẬT | 273 | Chuẩn hóa sàn đọc nhãn text-[11px] và responsive drawer trên mobile |
| `src/client/ui/admin/admin_archive_view.tsx` | CẬP NHẬT | 90 | Chống tràn ngang tiêu đề và đường dẫn trên mobile 360px, hỗ trợ cuộn 2 chiều |
| `tests/server/imp169_supabase_storage.test.ts` | TẠO MỚI | 547 | Bộ 23 kiểm thử hợp đồng đối kháng 4 phương diện |

## 3. Bằng Chứng Nghiệm Thu (Evidence & Quality Gates)
1. **Station 1 (RED Contract)**: `qa-tester` xác nhận 23/23 tests thất bại ban đầu (Adversarial Inversion).
2. **Station 2 (GREEN Implementation)**: `implementer` hoàn thành mã nguồn, 23/23 tests pass, 49/49 regression tests pass.
3. **Station 3 (Independent Reviews)**:
   - `spec-reviewer`: APPROVED (Khắc phục trọn vẹn 3 P1 Blockers và 3 P2 Hazards).
   - `ui-craft-reviewer` & `re-reviewer`: APPROVED (0 anti-patterns, khắc phục trọn vẹn 3 lỗi vật lý giao diện mobile 360px).
4. **Hệ Thống Kiểm Thử Toàn Cục**:
   - `npm test`: 298/298 test files passed (6.097/6.097 tests passed, 100%).
   - `npx tsc --noEmit`: 0 TypeScript errors.
   - `npm run lint:ui`: 0 anti-patterns across 171 files.
5. **Gotchas Ledger**: Ghi nhận Bất biến số 235 trong `docs/domain/gotchas.md`.
