# Báo Cáo Cải Tiến IMP-176: Tự Động Kết Thúc Phòng Khi Không Còn Người Thật & Bảo Toàn Master Manifest

## 1. Kết Quả Triển Khai
- **Mã Ticket**: IMP-176
- **Mục tiêu**: Tự động kết thúc phòng ngay lập tức khi tất cả người chơi thật rời đi (hoặc hết thời gian ân hạn 60s), dọn dẹp sạch sẽ tài nguyên/timer, và bảo toàn 100% lịch sử các ván đấu trên Supabase Master Manifest kể cả khi Render deploy Clear Cache.
- **Trạng thái**: **HOÀN TẤT & ĐÃ DUYỆT (STATION 1, 2, 3 ALL PASSED)**.

## 2. Thống Kê Thay Đổi Mã Nguồn
| Tệp Tin | Thao Tác | LOC Thay Đổi | Chức Năng |
| :--- | :---: | :---: | :--- |
| `src/server/network/turn_orchestrator.ts` | CẬP NHẬT | +4 | Bổ sung `destroyRoom(roomCode)` dọn dẹp `auctionSettleTimers`, `activeTimers`, `deadlines` |
| `src/server/network/wss_server.ts` | CẬP NHẬT | +3 | Mở rộng `closeRoom(roomCode, status)` và tích hợp `onAllHumansDisconnected` |
| `src/server/network/wss_lobby_handlers.ts` | CẬP NHẬT | +20 | Chuyển giao `hostId` khi chủ phòng thoát mà còn khách thật; tự động terminate khi `remainingHumans === 0` |
| `src/server/network/reconnect_manager.ts` | CẬP NHẬT | +14 | Gọi callback `onAllHumansDisconnected` khi bot takeover hoàn tất và phòng không còn người thật |
| `src/server/storage/supabase_storage.ts` | CẬP NHẬT | +24 | Thêm `downloadFileWithStatus` trả về `statusCode` và `content` phục vụ fail-safe guard |
| `src/server/logging/persistent_room_logger.ts` | CẬP NHẬT | +60 | Xếp hàng tuần tự `manifestSyncQueue`, merge catalog cloud-local an toàn, tính lại `fileSizeBytes` & `totalEvents` |
| `src/domain/room.ts` | CẬP NHẬT | +2 | Mở rộng regex `customRoomCode` hỗ trợ tên phòng test fixture |
| `tests/server/imp176_auto_terminate_and_manifest_merge.test.ts` | TẠO MỚI | 781 | 23 kiểm thử hợp đồng đối kháng 4 phương diện |

## 3. Bằng Chứng Nghiệm Thu (Evidence & Quality Gates)
1. **Station 1 (RED Contract Test)**: `qa-tester` tạo 23 atomic tests và xác nhận trạng thái RED (fail do chưa có cơ chế terminate khi 0 human và chưa merge cloud manifest).
2. **Station 2 (GREEN Implementation)**: `implementer` hoàn thành mã nguồn, toàn bộ 23/23 tests pass 100%. Toàn bộ 51 server test files pass (659/659 tests).
3. **Adversarial Inversion**: Đã kiểm chứng đảo ngược điều kiện `remainingHumans.length === 0` sang `> 0`, 5 bài test lập tức chuyển RED và khôi phục GREEN khi hoàn tác.
4. **Station 3 (Specification Review)**: `spec-reviewer` đã kiểm toán đĩa vật lý độc lập, xác nhận 100% tính toàn vẹn đặc tả, 0 scope drift, APPROVED.
5. **Quality Gates Toàn Cục**:
   - `npm test`: Toàn bộ test suite pass.
   - `npx tsc --noEmit`: 0 lỗi TypeScript (Exit 0).
   - `npm run lint:ui`: 0 vi phạm (Exit 0).
6. **Domain Gotchas**: Bổ sung Bất biến số 251 trong `docs/domain/gotchas.md`.
7. **Snapshot Bằng Chứng**: Ghi nhận tại `.agents/evidence/active-slice_snapshot.json`.
