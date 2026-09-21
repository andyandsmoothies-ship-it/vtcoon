# [IMP-160 Plan] Triệt Tiêu Lỗi Kẹt Sàn Đấu Giá Ma (Ghost Auction Modal Loop) & Rà Soát Toàn Diện Vòng Đời Trạng Thái Kinh Doanh

> **Mã Cải Tiến:** IMP-160  
> **Căn Cứ Phản Hồi:** Phân tích nhật ký trận đấu `VT8888` (kẹt `lastAuctionResult`, lặp mở modal và spam 15 lệnh intent bị reject).  
> **Chẩn Đoán Căn Nguyên:**  
> 1. `turn_orchestrator.ts`: `orchestrate()` gọi `clearRoom()` hủy nhầm `settleTimer` (2.5s) khi có intent trung gian.  
> 2. `room_manager.ts`: Thiếu cơ chế dọn dẹp kết quả đấu giá cũ và HOSE khi bắt đầu gieo xúc xắc lượt mới.  
> 3. `apply_delta.ts`: Luôn gọi `openModal('auction')` khi nhận delta mang `auction` kể cả khi phòng đã ở `WaitingRoll` hoặc modal đã đóng.  
> 4. `auction_modal.tsx`: Khi `isConcluded === true`, badge vẫn hiện `ĐANG MỞ`, 3 nút Bid vẫn click được kích thích spam intent, nút footer gọi `onPass` gửi `INTENT_AUCTION_PASS`.

## I. MỤC TIÊU VÀ NGUYÊN TẮC
1. Tách `auctionSettleTimers` độc lập khỏi `activeTimers` trong `TurnOrchestrator`, mang `auctionKey` để tự đối chiếu.
2. Giữ `RoomManager` thuần đồng bộ, cung cấp `settleAuction(roomCode)` cho test.
3. Dọn dẹp `lastAuctionResult` và `lastHoseResult` khi `handleRollDice` lượt mới.
4. Client `apply_delta.ts`: Không mở lại modal kết luận khi game ở `WaitingRoll` / `ActionPhase` hoặc khi đã đóng.
5. `AuctionModal`: Khi `isConcluded === true`, hiện `ĐÃ KẾT THÚC`, disable các nút Bid, nút Pass chuyển thành `Đóng / Xem Bàn Cờ` gọi `onClose()`.
6. Gia cố HOSE: Phát `lastHoseResult: room.lastHoseResult ?? null`.
