# Kế Hoạch Cải Tiến IMP-176: Tự Động Kết Thúc Phòng Khi Không Còn Người Thật & Bảo Toàn Master Manifest

## 1. Mục Tiêu & Bối Cảnh
- **Mã Ticket**: IMP-176
- **Vấn đề cốt lõi**:
  1. Người dùng phản ánh khi chơi 1 vòng rồi thoát web, phòng vẫn tiếp tục chạy vô tận dưới dạng `ACTIVE` vì các Bot tự chơi với nhau, gây lãng phí tài nguyên CPU/RAM trên máy chủ Render.
  2. Người dùng lo ngại việc Render deploy / restart xóa sạch bộ nhớ đệm cục bộ (clear cache) làm mất lịch sử các ván đấu đã lưu, và yêu cầu bảo toàn file tổng manifest cũng như đồng bộ file log `.jsonl` chi tiết của từng ván lên Supabase.
- **Giải pháp**:
  1. Khi người chơi thật duy nhất/cuối cùng rời phòng (chủ động bấm thoát hoặc hết 60s ân hạn ngắt kết nối), máy chủ lập tức đóng phòng với trạng thái `TERMINATED`.
  2. Bổ sung cơ chế `destroyRoom` giải phóng toàn bộ turn timers và auction timers.
  3. Cơ chế gộp Master Manifest: Khi lưu log ván mới, tải manifest hiện có trên Supabase về gộp vào danh mục cục bộ, xếp hàng tuần tự qua FIFO queue để tránh race condition, và có fail-safe guard chống ghi đè khi lỗi mạng 5xx.

## 2. Thiết Kế Kỹ Thuật
1. **Host Migration & Auto-Teardown**:
   - `src/server/network/wss_lobby_handlers.ts`: Khi người chơi rời phòng, kiểm tra `remainingHumans`. Nếu còn người chơi thật khác, chuyển giao `hostId` cho người chơi thật tiếp theo. Nếu không còn người chơi thật nào (`remainingHumans.length === 0`), lập tức gọi `ctx.closeRoom(msg.roomCode, 'TERMINATED')`.
   - `src/server/network/reconnect_manager.ts`: Sau khi bot tiếp quản khi hết 60s ân hạn, kiểm tra nếu phòng không còn người chơi thật nào thì kích hoạt callback `onAllHumansDisconnected(roomCode)`.
2. **Turn & Auction Timer Cleanup**:
   - `src/server/network/turn_orchestrator.ts`: Bổ sung `destroyRoom(roomCode)` để dọn dẹp sạch cả `activeTimers`, `deadlines` và `auctionSettleTimers`.
3. **Master Manifest Merge & Fail-Safe Guard**:
   - `src/server/storage/supabase_storage.ts`: Thêm `downloadFileWithStatus(bucket, path)` trả về cả `statusCode` và `content`.
   - `src/server/logging/persistent_room_logger.ts`: Xếp hàng tuần tự qua `manifestSyncQueue`. Khi sync manifest từ cloud: nếu mã lỗi HTTP >= 500 hoặc timeout (0), hủy tác vụ upload để bảo vệ Master Manifest không bị ghi đè rỗng. Gộp các bản ghi cũ trên Cloud với bản ghi mới cục bộ, bảo lưu `startTime` sớm nhất và `totalEvents`/`fileSizeBytes` lớn nhất.

## 3. Kế Hoạch Kiểm Thử Hợp Đồng
- Viết 23 bài test hợp đồng độc lập trong `tests/server/imp176_auto_terminate_and_manifest_merge.test.ts`.
- Thực hiện Adversarial Inversion để chứng minh kiểm thử có khả năng bắt lỗi thực tế.
