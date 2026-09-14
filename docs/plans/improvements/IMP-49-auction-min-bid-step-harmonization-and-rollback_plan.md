# [IMP-49] Kế Hoạch Thống Nhất Bước Giá Đấu Giá (+50 Tr.) & Đồng Bộ Trạng Thái Thực Sau REJECT (Auction Min-Bid Step Harmonization & Re-Sync)

## 1. BỐI CẢNH & HIỆN TƯỢNG LỖI

- **Phản ánh người dùng**: Xuất hiện thanh thông báo đỏ `Lỗi máy chủ: BID_TOO_LOW` trên màn hình khi đang tham gia sàn đấu giá.
- **Nghịch lý giao diện**:
  1. Hộp thoại Đấu giá hiển thị: `DẪN ĐẦU: Bạn`, `GIÁ THẦU HIỆN TẠI: 2.100 Tr.`, `Bạn đang dẫn đầu mức giá cao nhất!`.
  2. Nhưng thanh thông báo trên cùng lại báo `Lỗi máy chủ: BID_TOO_LOW`.
  3. Đến khi hết giờ, ô đất lại được trao cho đối thủ (Bot AI 3) với mức giá 2.050 Tr. (nhật ký ghi nhầm 2.100 Tr. do lấy từ state ảo của Client).
- **Nguyên nhân gốc rễ**:
  1. *Lệch bước giá*:
     - Server (`src/server/auction_manager.ts:54`) quy định: Khi đã có người đặt giá (`highestBidder !== undefined`), mức giá tiếp theo bắt buộc phải tăng **>= +100 Tr.** (`minBid = session.highestBid + 100`).
     - Client (`src/client/ui/modals/modal_helpers.ts:72`) lại sinh ra 3 nút bấm: `+50 Tr.`, `+100 Tr.`, `+200 Tr.`.
     - Khi Bot AI 3 đặt giá 2.050 Tr., Server yêu cầu giá mới phải `>= 2.150 Tr.`. Người chơi bấm nút `+50 Tr.` hoặc bật `AUTO-BID` (tự động chọn nút đầu tiên), gửi lên `2.100 Tr.` ➔ Server từ chối `BID_TOO_LOW`.
  2. *Optimistic Update không có Rollback*:
     - `src/client/ui/modals/modal_host.tsx:192` cập nhật giao diện ngay lập tức trước khi Server phản hồi (`updateModalPayload`).
     - Khi Server từ chối `BID_TOO_LOW`, Server chỉ gửi message lỗi mà không gửi lại delta của phòng; Client chỉ hiện toast thông báo mà không hoàn tác trạng thái modal, khiến người chơi tưởng mình đang dẫn đầu.

---

## 2. GIẢI PHÁP KỸ THUẬT (ÍT ẢNH HƯỞNG & DỄ TRIỂN KHAI NHẤT)

### 2.1. Thống nhất bước giá tối thiểu tại Server (+50 Tr.)
- Sửa `src/server/auction_manager.ts`:
  ```typescript
  // Đổi bước giá tối thiểu từ 100 xuống 50 Tr. để đồng bộ tuyệt đối với Client (+50, +100, +200 Tr.)
  const minBid = session.highestBidder !== undefined ? session.highestBid + 50 : session.highestBid;
  if (amount < minBid) return { success: false, reason: 'BID_TOO_LOW' };
  ```
- Cập nhật `src/server/room_bot_coordinator.ts`:
  ```typescript
  // Bước giá cơ sở khi tính toán intent cho Bot
  const inc = 50;
  ```
- Cập nhật `src/domain/bot/bot_engine.ts`:
  `calculateAuctionStep`: hỗ trợ `minStep = auction.bidIncrement ?? 50;`.

### 2.2. Cơ chế Re-sync Delta tự động khi Intent bị REJECT
- Sửa `src/server/network/wss_server.ts`:
  Khi `executeIntentAction` trả về `res.success === false`:
  Server gửi mã lỗi `ERROR` cho socket đó, đồng thời gửi ngay một gói tin Delta hiện tại của phòng tới client (`this.broadcaster.broadcastRoomDelta(msg.roomCode)`).
  ➔ Client lập tức nhận được trạng thái thật từ Server, tự động cập nhật lại đúng `highestBid` và `highestBidderId` thực tế, triệt tiêu 100% hiện tượng kẹt trạng thái ảo.

---

## 3. QUY TRÌNH 3 TRẠM (3-STATION IMPLEMENTATION PIPELINE)

### Trạm 1: RED Contract Test (`tests/server/imp49_auction_step_and_sync.test.ts`)
- Viết >= 15 atomic tests độc lập bao phủ Universal 4-Facet Matrix:
  - *Facet 1 (Boundary)*: Bước giá +50 Tr. được chấp nhận khi đã có highestBidder; bước giá < 50 Tr. (ví dụ +20, +49 Tr.) bị từ chối `BID_TOO_LOW`; bid khi chưa có bidder chấp nhận đúng bằng startingBid.
  - *Facet 2 (State Reactivity)*: Client `AUTO-BID` đặt `currentBid + 50` thành công; chuỗi đặt giá xen kẽ giữa Bot và Player tăng lũy tiến 50 Tr. mượt mà.
  - *Facet 3 (Resource Disposal)*: Khi bid thành công, gia hạn +3s anti-sniping chính xác; kết thúc phiên đấu giá đóng session an toàn.
  - *Facet 4 (Error Defense)*: Khi intent bid bị từ chối, Server phát sóng delta sửa sai; Client khôi phục đúng người dẫn đầu thực tế.
- Chạy Adversarial Inversion: Chứng minh các bài test kiểm tra bước giá +50 Tr. thất bại trên mã nguồn cũ (do server cũ đòi +100 Tr.).

### Trạm 2: GREEN Implementation
- Chỉnh sửa mã nguồn tối thiểu tại `src/server/auction_manager.ts`, `src/server/room_bot_coordinator.ts`, `src/domain/bot/bot_engine.ts`, `src/server/network/wss_server.ts`.
- Chạy toàn bộ test suite đảm bảo 100% tests PASS và `npm run gate:quick` sạch sẽ.

### Trạm 3: Thẩm Định Độc Lập & Docker Rebuild
- Thẩm định đĩa độc lập qua subagent `spec-reviewer`.
- Rebuild Docker image và nghiệm thu live trên container `localhost:3000`.
- Ghi nhận Invariant Gotcha #70 vào `docs/domain/gotchas.md`.
- Cập nhật `docs/master_roadmap.md` và `docs/epics/client_ui/_epic_ledger.md`.
