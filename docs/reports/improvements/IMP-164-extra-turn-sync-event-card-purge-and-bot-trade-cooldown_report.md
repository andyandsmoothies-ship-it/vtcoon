# BÁO CÁO CẢI TIẾN KỸ THUẬT: ĐỒNG BỘ LƯỢT THÊM, DỌN DẸP THẺ SỰ KIỆN N+1, BẢO VỆ P2P TRADE KHI ÂM TIỀN & CHỐNG SPAM BOT (IMP-164)

> **Mã Ticket**: IMP-164  
> **Hoàn Tất**: 2026-09-22  
> **Quy Trình**: Quy Trình 3 Trạm (RED ➔ GREEN ➔ Station 3 Review: APPROVED)  
> **Kết Quả Kiểm Thử**: 22/22 atomic contract tests PASS 100% | 5.921/5.921 tests toàn dự án PASS 100% | 0 lỗi TypeScript | 0 vi phạm UI Lint | Gotcha #223  

---

## 1. TỔNG KẾT MỤC TIÊU VÀ NGUYÊN NHÂN GỐC RỄ

Dựa trên dữ liệu pháp chứng từ log bàn cờ `VT8888` (seed: `3193767511`), ticket IMP-164 đã xử lý triệt để 4 vấn đề kỹ thuật:

1. **Lỗi Kẹt FSM Khi Rút Thẻ Cộng Lượt (`CC_PLATE_AUCTION` / `extraTurns`)**:
   - *Nguyên nhân*: IMP-45 trước đó tách `extraTurns` khỏi `consecutiveDoubles` trên Server để chống người chơi đi 3 lần, nhưng bỏ quên Client State Machine. `PlayerDelta` thiếu `extraTurns`, Broadcaster `isPlayerEqual` không so khớp `extraTurns`, và Client `apply_delta` không reset `hasRolledThisTurn = false` khi `turnPhase === WaitingRoll`. Hậu quả: Client giữ `hasRolledThisTurn = true`, khóa nút Đổ Xúc Xắc, chỉ mở nút Kết Thúc Lượt; Server từ chối lệnh Kết Thúc Lượt bằng `INVALID_PHASE`, khiến người chơi bế tắc 44 giây cho đến khi Watchdog can thiệp.
   - *Khắc phục*: Bổ sung `extraTurns` vào `PlayerDelta` và `OPTIONAL_PLAYER_KEYS`; cập nhật `isPlayerEqual`; bắt buộc reset `hasRolledThisTurn = false` khi nhận `turnPhase: WaitingRoll`; cập nhật nhãn responsive 360px cho ActionDock.

2. **Dọn Dẹp Thẻ Sự Kiện Rò Rỉ N+1 (Stale Event Card 20 Ticks)**:
   - *Nguyên nhân*: `event_card_engine.ts` gán `room.lastEventCard` nhưng không có vị trí nào dọn dẹp thẻ khi kết thúc lượt hoặc khi gieo xúc xắc mới. Vi phạm *Transient State Teardown Invariant*.
   - *Khắc phục*: Khai báo `lastEventCard?: EventCardInfo | null;` và dọn dẹp `room.lastEventCard = null` (Explicit Tombstone) tại cả `executeTurnEnd` và `executeTurnRoll`.

3. **Bảo Vệ P2P Trade Đối Với Người Chơi Âm Tiền / Vỡ Nợ**:
   - *Nguyên nhân*: Người mua bị âm tiền (`balance < 0`) vẫn có thể tham gia mua BĐS hoặc hoán đổi đất ngang hàng (`price <= 0`), vi phạm nghĩa vụ thanh lý tài sản trả nợ khi ở trạng thái thâm hụt tài chính.
   - *Khắc phục*: Chặn người mua âm tiền ngay từ đầu tại `coordTrade`, `coordRespondTradeOffer`, và `validateP2PTrade`. Bảo lưu quyền bán BĐS lấy tiền mặt (`price > 0`) cho người bán âm tiền để giải cứu tài chính (Gotcha #174).

4. **Chống Spam Đề Nghị Đàm Phán Bot AI**:
   - *Nguyên nhân*: Từng Bot đếm cooldown riêng lẻ, khiến 3 Bot trong bàn cùng gửi lời mời đàm phán tới người chơi trong cùng 1 vòng; cooldown từ chối ô đất quá ngắn.
   - *Khắc phục*: Thiết lập **Room-level Target Cooldown** qua `room.lastTargetTradeOfferRound`: người chơi chỉ nhận tối đa 1 đề nghị trade/vòng từ mọi Bot; nâng cooldown lên 4 vòng nếu ô đất bị từ chối >= 2 lần.

---

## 2. DANH SÁCH TỆP THAY ĐỔI & CHỈ SỐ LOC

| Tệp Mã Nguồn | Thay Đổi | LOC Thực Tế | Trần LOC | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: |
| [`src/server/session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts) | Bổ sung `extraTurns` vào `PlayerDelta` | 393 | 400 | Sạch linter |
| [`src/server/network/delta_broadcaster.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/delta_broadcaster.ts) | So khớp `extraTurns` trong `isPlayerEqual` | 211 | 400 | Sạch linter |
| [`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts) | Mở rộng `PlayerInfo` với `extraTurns` | 283 | 1000 | Sạch linter |
| [`src/client/network/apply_delta_players.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_players.ts) | Bổ sung `extraTurns` vào `OPTIONAL_PLAYER_KEYS` | 259 | 400 | Sạch linter |
| [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts) | Reset `hasRolledThisTurn = false` khi `WaitingRoll` | 244 | 400 | Sạch linter |
| [`src/client/ui/action_dock.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx) | Nhãn nút xúc xắc responsive 360px cho lượt thêm | 369 | 500 | Sạch linter |
| [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts) | Thêm `null` type cho card và target trade round | 241 | 400 | Sạch linter |
| [`src/server/turn_loop.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts) | Dọn dẹp `room.lastEventCard = null` | 252 | 400 | Sạch linter |
| [`src/server/room_property_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts) | Chặn buyer âm tiền & ghi nhận round trade | 350 | 400 | Sạch linter |
| [`src/server/insolvency_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts) | Xóa `extraTurns = 0` khi phá sản | 261 | 400 | Sạch linter |
| [`src/server/property_actions.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts) | Validation chốt chặn buyer balance âm | 352 | 400 | Sạch linter |
| [`src/domain/bot/bot_trade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_trade.ts) | Cooldown đàm phán cấp phòng & ô từ chối nhiều lần | 393 | 400 | Sạch linter |
| [`src/domain/bot/bot_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_engine.ts) | Ghi nhận target trade round khi sinh intent | 394 | 400 | Sạch linter |
| [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) | Ghi nhận Gotcha #223 | 3759 | - | Bất biến SSOT |

---

## 3. KẾT QUẢ KIỂM THỬ ĐỐI SOÁT

1. **Station 1 (RED Contract Tests)**:
   - File: `tests/domain/imp164_turn_sync_card_purge_and_bot_trade.test.ts`.
   - 22 atomic tests phủ 4 Universal Facets (Boundary, Reactivity, Disposal, Error Defense).
   - Tỷ lệ ban đầu: 15 FAILED, 7 PASSED (Chứng minh lỗi nghịch đảo).
2. **Station 2 (GREEN Implementation)**:
   - 22/22 tests PASS (100%).
   - Toàn bộ 5.921 tests trong 289 suites PASS 100%.
   - `npx tsc --noEmit`: 0 errors.
   - `npm run lint:ui`: 0 violations.
3. **Station 3 (Specification Review)**:
   - Phán quyết: **`[APPROVED]`** từ `spec-reviewer`.
   - 100% đối soát tam giác (Code <-> Plan <-> Gotcha #223), 0 Scope Drift.
