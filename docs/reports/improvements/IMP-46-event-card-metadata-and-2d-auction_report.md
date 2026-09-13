# BÁO CÁO CẢI TIẾN: ĐỒNG BỘ METADATA THẺ SỰ KIỆN, CHỐNG LẶP POPUP, ĐỒNG BỘ 00:00 & CHUẨN HÓA ĐẤU GIÁ 2D (IMP-46)

## 1. NGUYÊN NHÂN GỐC RỄ
1. **Thẻ bài thiếu metadata**: Server không gửi chi tiết tên bài và số tiền biến động vào `DeltaPayload`, client hiển thị mô tả chung chung.
2. **Popup dẫm ô lặp lại sau lượt Bot**: Thay đổi `currentTurnPlayerId` kích hoạt lại effect kiểm tra `lastLandedPawn` do thiếu chốt chặn timestamp.
3. **Đơ 2-4s tại 00:00**: Broadcast Delta trước khi tính deadline lượt mới và client thụ động chờ đợi máy chủ.
4. **Bị khóa quyền đấu giá và gán nhầm ví tiền Bot**: `ModalHost` lấy `myId = currentTurnPlayerId` (đang là Bot), khiến người chơi bị gán nhầm là người từ chối mua và bị tước quyền bid.
5. **Giao diện 3D đấu giá tối tăm và che khuất**: `Auction3DStage` dìm tối 85% bàn cờ và treo lá bài 3D khổng lồ lơ lửng.

## 2. GIẢI PHÁP KỸ THUẬT
1. **Event Card Metadata Synchronization Invariant**: Định nghĩa `src/domain/event_card_metadata.ts`, đồng bộ `lastEventCard` vào Delta.
2. **Landing Timestamp Guard Invariant**: Dùng `lastHandledLandingTimestampRef` ngăn chặn mở lại popup khi timestamp không đổi.
3. **Turn Timeout Synchrony Invariant**: Server tính deadline trước khi broadcast; client tự động gửi intent hành động khi đếm về 0.
4. **Local Player Identity Invariant**: `ModalHost` dùng `props.localPlayerId`, người chơi giữ đúng ví tiền và tham gia đấu giá bình thường.
5. **Clean Centered 2D Auction Invariant**: Xóa `Auction3DStage`, chuyển sang `AuctionModal` 2D trung tâm, thoáng đãng, 0 lỗi linter UI.

## 3. KẾT QUẢ KIỂM THỬ
- `tests/contracts/gameplay_ux_fixes_contract.test.ts`: **3/3 PASS**.
- `tests/client/auction_modal.test.ts`: **8/8 PASS**.
- Toàn bộ 147/147 test files PASS 100%.

## 4. BẤT BIẾN ĐƯỢC GHI NHẬN
- Gotcha #67 trong `docs/domain/gotchas.md`: `[UI/NET/AUCTION] Bất Biến Đồng Bộ Thẻ Sự Kiện, Triệt Tiêu Popup Trùng Lặp, Đồng Bộ Deadline 00:00 & Định Danh Tham Gia Đấu Giá (IMP-46)`.
