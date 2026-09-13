# KẾ HOẠCH KỸ THUẬT: ĐỒNG BỘ METADATA THẺ SỰ KIỆN, CHỐNG LẶP POPUP, ĐỒNG BỘ 00:00 & CHUẨN HÓA ĐẤU GIÁ 2D (IMP-46)

## 1. MỤC TIÊU & BỐI CẢNH
- **Mục tiêu**: Đồng bộ chi tiết tên thẻ, nội dung và số tiền ảnh hưởng của thẻ Cơ Hội/Thị Trường; triệt tiêu lỗi popup Cơ Hội bật lại sau lượt Bot; xóa độ trễ vài giây khi đếm giờ về 00:00; sửa lỗi người chơi bị gán nhầm ví tiền của Bot trong đấu giá; và loại bỏ sân khấu 3D đấu giá gây tối màn hình.
- **Phạm vi**: `src/domain/event_card_metadata.ts`, `src/domain/event_card_engine.ts`, `src/client/main.tsx`, `src/server/network/wss_server.ts`, `src/client/ui/modals/modal_host.tsx`, `src/client/game_canvas.tsx`, `src/client/ui/modals/auction_modal.tsx`.

## 2. NGUYÊN NHÂN KỸ THUẬT
1. **Thiếu Metadata & Delta Sync**: Bốc thẻ chỉ trừ tiền mà không đồng bộ thông tin chi tiết (`title`, `description`, `effectDelta`) vào Delta, khiến client chỉ hiển thị placeholder tĩnh.
2. **Rò rỉ tham chiếu `handleCellLanding`**: Hook phụ thuộc `currentTurnPlayerId`, khi Bot hết lượt chuyển về P1, effect chạy lại và mở lại popup với tọa độ cũ trong `lastLandedPawn`.
3. **Lệch thứ tự điều phối Server & Client thụ động**: Server broadcast Delta trước khi lên lịch deadline mới; client đếm về 00:00 nhưng không tự gửi intent kết thúc lượt.
4. **Lỗi định danh người chơi trong đấu giá**: `ModalHost` lấy `myId = currentTurnPlayerId`, khi Bot từ chối mua thì `currentTurnPlayerId` là Bot, khiến người chơi bị coi là Bot từ chối mua và hiển thị số dư ví tiền của Bot.
5. **Sân khấu 3D gây tối bàn cờ**: `Auction3DStage` dìm tối 85% và treo lá bài 3D khổng lồ che khuất sa bàn.

## 3. THIẾT KẾ TRIỂN KHAI
1. **Tạo metadata thẻ sự kiện**: Định nghĩa `src/domain/event_card_metadata.ts` và truyền `lastEventCard` qua `DeltaPayload`.
2. **Landing Timestamp Guard**: Lưu `lastLandedPawn.timestamp` trong ref, chỉ mở modal khi timestamp thay đổi.
3. **Đồng bộ deadline và Auto-Action tại 00:00**: Server cập nhật deadline trước khi broadcast; client tự động gửi `INTENT_END_TURN` / `INTENT_ROLL` khi đếm về 0.
4. **Định danh chính xác người chơi**: `ModalHost` nhận `localPlayerId` từ props/store thay vì fallback về `currentTurnPlayerId`.
5. **Chuẩn hóa Hộp thoại Đấu giá 2D**: Gỡ bỏ `Auction3DStage`, dùng `AuctionModal` 2D đặt giữa màn hình.

## 4. KẾ HOẠCH KIỂM THỬ
- Contract test `gameplay_ux_fixes_contract.test.ts` kiểm chứng metadata thẻ bài.
- Unit test `auction_modal.test.ts` kiểm chứng giao diện 2D và hành vi người chơi.
- Đảm bảo 147 test files pass.
