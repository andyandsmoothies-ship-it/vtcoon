# Báo Cáo Cải Tiến IMP-49: Thống Nhất Bước Giá Đấu Giá (+50 Tr.), Khử Lỗi BID_TOO_LOW & Tự Động Re-Sync Delta Khi Intent Bị Từ Chối

## 1. Tổng quan Đợt Cải Tiến
- **Mã định danh**: IMP-49 (Bổ sung) / IMP-55
- **Tiêu đề**: Auction Min-Bid Step Harmonization & Server-Authoritative State Re-Sync
- **Kế hoạch tham chiếu**: [`docs/plans/improvements/IMP-49-auction-min-bid-step-harmonization-and-rollback_plan.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/plans/improvements/IMP-49-auction-min-bid-step-harmonization-and-rollback_plan.md)
- **Ngày hoàn thành**: 2026-09-14
- **Trạng thái**: ✔️ DONE (Đạt chuẩn 3 Trạm theo Hiến pháp GEMINI.md)

---

## 2. Các Vấn Đề Gốc Rễ Đã Khắc Phục

| # | Hiện tượng | Nguyên nhân kỹ thuật | Giải pháp triển khai | Trạng thái |
|---|---|---|---|:---:|
| 1 | **Thanh thông báo đỏ: Lỗi máy chủ: BID_TOO_LOW** | `src/server/auction_manager.ts` quy định cứng: khi đã có người đặt giá (`highestBidder !== undefined`), mức giá tiếp theo bắt buộc phải tăng **>= +100 Tr.** (`minBid = session.highestBid + 100`). Trong khi Client (`modal_helpers.ts`) lại tạo 3 nút: `+50 Tr.`, `+100 Tr.`, `+200 Tr.` và nút `AUTO-BID` tự động lấy mốc nhỏ nhất `+50 Tr.`. Khi Bot đặt 2.050 Tr., người chơi bấm `+50 Tr.` gửi 2.100 Tr. < 2.150 Tr. nên bị từ chối. | Hạ bước giá tối thiểu của Server từ `+100 Tr.` xuống `+50 Tr.` (`minBid = session.highestBid + 50`), đồng bộ với các tùy chọn tăng giá của Client. | ✔️ FIXED |
| 2 | **Nghịch lý giao diện: Modal hiện "DẪN ĐẦU: Bạn" (2.100 Tr.) nhưng Server từ chối** | `src/client/ui/modals/modal_host.tsx` thực hiện Optimistic Update cục bộ: ngay khi bấm nút, Client đổi giao diện thành "Dẫn đầu: Bạn" (2.100 Tr.). Khi Server gửi mã lỗi `BID_TOO_LOW`, Client chỉ hiện toast thông báo mà không hoàn tác modal payload, khiến người chơi tin rằng mình đang dẫn đầu. | Tại `src/server/network/wss_server.ts`, khi `executeIntentAction` trả về `!res.success`, Server lập tức phát sóng `broadcastRoomDelta(msg.roomCode)` để ép Client dập tắt trạng thái ảo và nhận lại đúng state thực tế. | ✔️ FIXED |
| 3 | **Hết 15s sàn đấu giá trao nhầm ô cho Bot dù người chơi tưởng mình thắng** | Do lệnh nâng giá của người chơi bị Server từ chối, mức giá cao nhất hợp lệ trên máy chủ vẫn thuộc về Bot AI 3 (2.050 Tr.). Khi hết 15s đếm ngược, Server đóng phiên và trao ô đất cho Bot AI 3. | Khi bước giá tối thiểu được thống nhất ở mức `+50 Tr.`, lệnh nâng giá của người chơi được Server chấp nhận hoàn toàn. Đồng thời nếu có bất kỳ intent nào bị từ chối trong tương lai, Re-sync Delta sẽ bảo đảm Client phản ánh chính xác người dẫn đầu thực tế. | ✔️ FIXED |
| 4 | **Bot AI tính toán bước giá lệch chuẩn** | `src/server/room_bot_coordinator.ts` và `src/domain/bot/bot_engine.ts` sử dụng bước tăng giá cũ hoặc thiếu fallback đồng bộ với cấu hình phiên đấu giá. | Chuẩn hóa `inc = 50` tại `room_bot_coordinator.ts` và `minStep = auction.bidIncrement ?? 50` tại `bot_engine.ts`. | ✔️ FIXED |

---

## 3. Bằng Chứng Nghiệm Thu Kỹ Thuật

### 3.1. Trạm 1 (RED Contract Test)
- **Tệp kiểm thử**: [`tests/server/imp49_auction_step_and_sync.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/server/imp49_auction_step_and_sync.test.ts)
- **Số lượng kiểm thử**: 19 atomic tests (B01-B09, R01a-R01c, R02, R03, D01, D02, E01-E03) bao phủ trọn vẹn Universal 4-Facet Behavioral Matrix.
- **Tiêu chuẩn nguyên tử**: Mỗi test <= 4 `expect()`, 0 vòng lặp bên trong, đầy đủ nhãn truy vết (`[UC-GAME-022/MSS]`, `[UC-GAME-022/A1]`, `[UC-GAME-022/A2]`, `[BR-GAME-022]`).
- **Adversarial Inversion**: Đã kiểm chứng các bài kiểm tra bước giá +50 Tr. (B03, R01, E02) thất bại trên mã nguồn cũ do Server đòi bước giá >= +100 Tr.

### 3.2. Trạm 2 (GREEN Implementation)
- **Các tệp đã chỉnh sửa**:
  - [`src/server/auction_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/auction_manager.ts) (L54): `minBid = session.highestBidder !== undefined ? session.highestBid + 50 : session.highestBid`.
  - [`src/server/room_bot_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_bot_coordinator.ts) (L33): `const inc = 50`.
  - [`src/domain/bot/bot_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_engine.ts) (L145): `const minStep = auction.bidIncrement ?? 50`.
  - [`src/server/network/wss_server.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/wss_server.ts) (L328): Tự động phát sóng `this.broadcaster.broadcastRoomDelta(msg.roomCode)` khi intent bị từ chối.
- **Kết quả kiểm thử**:
  - Toàn bộ 19/19 tests trong `imp49_auction_step_and_sync.test.ts` PASS 100% trong 14ms.
  - Toàn bộ 157 test suites (2.205 tests) PASS 100%.
  - `npm run gate:quick`: 0 lỗi TypeScript, 0 vi phạm UI lint, trùng lặp mã nguồn 1.67% (< 3%), 100% tài nguyên 3D đạt chuẩn.

### 3.3. Trạm 3 (Independent Review & Physical Disk Verification)
- **Spec Reconciliation Gate**: Subagent độc lập `spec-reviewer` (conv `35471d50-eb27-4ec9-b63b-f18adeb72b65`) đã kiểm tra đĩa vật lý và phê duyệt: **VERDICT: APPROVED 100%**.
- **Cập nhật SSOT**: [`docs/requirements.md#L18`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md#L18) chuẩn hóa bước giá tối thiểu `+50 Tr. VNĐ` (hỗ trợ `+50, +100, +200 Tr. VNĐ`).
- **Môi trường thực tế**: Docker image `vtcoon-vtcoon:latest` đã build và container `vtcoon-vtcoon-1` đang chạy trạng thái **Healthy** phục vụ trực tiếp tại `http://localhost:3000/` (HTTP 200 OK).
- **Domain Memory**: Đã ghi nhận Gotcha #76 vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md).
