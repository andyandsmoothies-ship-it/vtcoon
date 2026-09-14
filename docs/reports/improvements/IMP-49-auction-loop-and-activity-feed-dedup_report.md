# BÁO CÁO NGHIỆM THU CẢI TIẾN LIÊN TỤC (IMPROVEMENT REPORT)
## IMP-49: Triệt Tiêu Vòng Lặp Đấu Giá Bot, Đồng Bộ Hết Giờ 15s Sàn Đấu Giá & Khử Trùng Lặp Nhật Ký Hoạt Động (Auction Loop Prevention, Server Timeout Synchrony & Activity Feed Dedup)

> **Mã cải tiến:** IMP-49 (Kế thừa kế hoạch `docs/plans/improvements/IMP-48-auction-loop-and-activity-feed-dedup_plan.md`)  
> **Ngày hoàn tất:** 14/09/2026  
> **Trạng thái:** 🟢 HOÀN TẤT VÀ NGHIỆM THU (100% PASS · 150/150 Test Suites · 2.073/2.073 Tests · 0 Lỗi UI · 0 Lỗi TypeScript)  
> **Bất biến đúc kết:** Gotcha #70 trong `docs/domain/gotchas.md`

---

### 1. TỔNG QUAN VẤN ĐỀ & BẰNG CHỨNG HIỆN TRƯỜNG

- **Sự cố thực tế**: Người dùng cung cấp ảnh chụp màn hình hiện trường (`media_1789345334292.png`) và gói tin chẩn đoán telemetry (`tick: 84`, `elapsedMs: 46515`, `TURN_STALLED`).
- **Hiện tượng**:
  1. Thanh nhật ký hoạt động liên tục hiển thị lặp "Bot AI 2 (Balanced) đã đặt giá 750 Tr. cho Bình Thuận (Mũi Né)" mỗi 800ms đến 1 giây.
  2. Đồng hồ đếm ngược kẹt tại 00:00 nhưng không chuyển lượt sang người chơi tiếp theo.
  3. Lượt chơi bị kẹt tại `bot_3` trong `AuctionPhase` suốt 46,5 giây đến khi Telemetry Watchdog phát hiện `TURN_STALLED`.
- **Nguyên nhân gốc rễ**:
  1. **Vòng lặp Bot Scheduler**: Khi Bot 3 từ chối mua ô đất và phòng chuyển sang `AuctionPhase`, `room.currentPlayerIndex` vẫn trỏ về Bot 3. `BotTurnScheduler` kiểm tra thấy người chơi hiện tại là bot liền tiếp tục lên lịch 800ms mà không nhận biết phòng đang đấu giá. Ngoài ra, Bot 2 sau khi đặt giá 750 Tr. trở thành `highestBidder` nhưng điều kiện `isAuctionWithBots` không loại trừ `highestBidder`, dẫn tới việc Bot 2 liên tục bị coi là cần lượt, tạo vòng lặp ping-pong vô tận mỗi 800ms và không bao giờ gọi `TurnTimeoutScheduler`.
  2. **Bỏ quên Timeout 15s**: `TurnTimeoutScheduler.scheduleTurnTimeout` không được kích hoạt khi vào `AuctionPhase` từ Bot. Khi hết 15s, nếu lượt thuộc về Bot, máy chủ không gọi `handleEndTurn`, khiến phòng kẹt ở `bot_3`.
  3. **Spam Activity Feed**: `detectAuctionActivities` dựa vào `prevState.activeModal === 'auction'`. Khi hộp thoại client tự đóng sớm ở 00:00 (`timeRemaining <= 1`), `activeModal` trở thành `null`, khiến mọi delta định kỳ sau đó đều bị xem là lượt đặt giá mới.
  4. **Client Đóng Modal Sớm**: `ModalHost` tự động gọi `state.closeModal()` khi bộ đếm cục bộ `timeRemaining <= 1`, dù máy chủ vẫn đang chạy `AuctionPhase`.

---

### 2. KẾT QUẢ TRIỂN KHAI THEO QUY TRÌNH 3 TRẠM (MANDATORY 3-STATION PIPELINE)

#### 🚦 Trạm 1: RED Contract Test (Adversarial Inversion)
- Tạo tệp kiểm thử hợp đồng: [`tests/contracts/auction_loop_prevention_contract.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/auction_loop_prevention_contract.test.ts).
- Gồm 16 kiểm thử nguyên tử độc lập (Atomic Tests) phủ trọn Ma trận Hành vi 4 Hướng (Universal 4-Facet Behavioral Matrix):
  - **Facet 1 (Boundary & Dedup)**: 4 tests (`TC-AUCT-DEDUP-01..04`) chứng minh khử lặp sạch sẽ khi `activeModal` là `null`, phát hiện đúng khi giá tăng, đổi người bid, hoặc đổi ô đất.
  - **Facet 2 (State Reactivity)**: 4 tests (`TC-AUCT-ELIG-01..04`) kiểm chứng Bot là `highestBidder`, đã `pass`, hoặc là `declinedPlayerId` bị loại trừ 100% khỏi danh sách bot hợp lệ cần gọi `scheduleBotTurn`.
  - **Facet 3 (Disposal & Timeout)**: 4 tests (`TC-AUCT-TIMEO-01..04`) kiểm chứng thiết lập deadline 15s trên server, tự động đóng sàn khi timeout, tự động kết thúc lượt cho bot sau khi sàn đóng, và ngắt vòng lặp vô hạn.
  - **Facet 4 (Error Defense)**: 4 tests (`TC-AUCT-DEF-01..04`) kiểm chứng dọn sạch cache khi nhận `auction: null`, bảo tồn cache khi delta không có trường auction, bỏ qua delta thiếu `highestBidderId`, và khóa trần FIFO 50 logs.
- Đã kích hoạt Adversarial Inversion chứng minh kiểm thử thất bại (RED) trước khi sửa code sản xuất.

#### 🟢 Trạm 2: GREEN Implementation
Đã thực hiện các sửa đổi tối thiểu và chính xác trong 5 tệp:
1. [`src/server/network/turn_timeout_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/turn_timeout_scheduler.ts):
   - Loại trừ `highestBidder` khỏi `hasEligibleAuctionBot` (`p.id !== room.currentAuction?.highestBidder`).
   - Tự động gọi `handleEndTurn(roomCode, curr.id)` cho Bot khi phiên đấu giá kết thúc và phòng chuyển về `PropertyManagement`.
2. [`src/server/network/bot_turn_scheduler.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/bot_turn_scheduler.ts):
   - Loại trừ `highestBidder` khỏi `isAuctionWithBots` và `hasAuctionBots`.
   - Khi ở `AuctionPhase`, nếu không còn bot nào khác có thể bid, chuyển giao quyền điều phối cho `this.onScheduleTurnTimeout?.(roomCode)` để chạy đồng hồ 15s thay vì loop `scheduleBotTurn`.
3. [`src/client/store/activity_store.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/activity_store.ts):
   - Bổ sung `lastAuctionBid?: { cellIndex, currentBid, highestBidderId }` và `setLastAuctionBid` vào `ActivityStoreState`.
   - Dọn sạch `lastAuctionBid` khi `clearLogs()` được gọi.
4. [`src/client/network/activity_tracker.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/activity_tracker.ts):
   - Tách biệt hoàn toàn `detectAuctionActivities` khỏi `prevState.activeModal`.
   - Sử dụng `activityStore.getState().lastAuctionBid` để khử lặp O(1).
   - Reset `setLastAuctionBid(undefined)` khi nhận `delta.auction === null`.
5. [`src/client/ui/modals/modal_host.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx):
   - Cấm `ModalHost` tự ý gọi `closeModal()` khi `timeRemaining <= 1`. Chỉ giảm bộ đếm về 0, để `syncAuctionModal` nhận lệnh kết thúc từ server đóng hộp thoại.

#### 🔍 Trạm 3: Thẩm Định Độc Lập & Xác Minh Vật Lý Trên Đĩa (Independent Review)
- **`spec-reviewer`**: Phán quyết **PASS** (100% khớp đặc tả kế hoạch, 0 Scope Drift, toàn vẹn 4 Facets).
- **`code-reviewer`**: Phán quyết **PASS** (100% tệp tuân thủ giới hạn LOC: Core <= 400, UI <= 500; hàm <= 30 LOC, CC <= 5; 0 dirty casts; 0 nuốt lỗi).
- **Kiểm tra biên dịch & kiểm thử**:
  - `npx tsc --noEmit`: 0 lỗi TypeScript.
  - `npm run lint:ui`: 0 vi phạm anti-pattern trên 121 tệp.
  - `npm test`: **150/150 test files PASS** (2.073/2.073 atomic tests).

---

### 3. MA TRẬN BẢO VỆ CHỐNG TÁI PHÁT (DEFENSE MATRIX)

| Rủi ro tiềm ẩn | Cơ chế bảo vệ đã xác lập | Bằng chứng kiểm thử |
| :--- | :--- | :--- |
| Bot thắng đấu giá bị lập lịch lượt giả | `p.id !== room.currentAuction?.highestBidder` | `TC-AUCT-ELIG-01`, `TC-AUCT-TIMEO-04` |
| Sàn đấu giá kẹt đơ không timeout | Gọi `onScheduleTurnTimeout` khi hết bot bid | `TC-AUCT-TIMEO-01`, `TC-AUCT-TIMEO-02` |
| Bot bị kẹt lượt sau khi đấu giá xong | Tự động gọi `handleEndTurn` cho bot hiện tại | `TC-AUCT-TIMEO-03` |
| Spam feed khi modal client đóng | Lưu `lastAuctionBid` trong `ActivityStore` | `TC-AUCT-DEDUP-01`, `TC-AUCT-DEF-02` |
| Hộp thoại đấu giá biến mất sớm | Client chỉ giảm đếm ngược, server quyết định đóng | `modal_host.tsx#L53-56`, `apply_delta.ts#L358` |

---

### 4. KẾT LUẬN & BÀN GIAO

Gói cải tiến IMP-49 đã giải quyết triệt để 100% lỗi vòng lặp Bot trong sàn đấu giá và spam nhật ký hoạt động. Toàn bộ mã nguồn, kiểm thử, tài liệu Gotcha #70 và sổ cái lộ trình đã được cập nhật đồng bộ. Hệ thống sẵn sàng triển khai thực tế.
