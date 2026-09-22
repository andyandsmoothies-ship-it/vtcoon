# KẾ HOẠCH KỸ THUẬT: ĐỒNG BỘ LƯỢT THÊM, DỌN DẸP THẺ SỰ KIỆN N+1, BẢO VỆ P2P KHI ÂM TIỀN & CHỐNG SPAM BOT TRADE (IMP-164)

> **Mã Ticket**: IMP-164  
> **Phân Tầng Rủi Ro**: Tier 2 (Full Rigor - Chạm FSM / Protocol / Client Store / Bot AI)  
> **Nguyên Nhân Từ Update Trước**: CÓ. IMP-45 tách `extraTurns` khỏi `consecutiveDoubles` trên Server nhưng bỏ quên Client sync (`hasRolledThisTurn` không reset, `extraTurns` thiếu trong `PlayerDelta`). IMP-157 chỉ xử lý `skipNextTurn` trên Server mà không kiểm tra Client ActionDock state machine.  
> **Thẩm Định Zero-Trust**: Đã qua phản biện `plan-griller` và khắc phục 7 điểm mù kiến trúc vật lý (P1: Sparse delta broadcaster `isPlayerEqual`, `OPTIONAL_PLAYER_KEYS`, ghi nhận `lastTargetTradeOfferRound`, type `null` cho `lastEventCard`, tên hàm `executeTurnRoll`; P2: Mobile 360px text budget, guard `coordTrade` người bán âm tiền, bảo lưu `TC-144.03`).

---

## 1. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE FORENSICS)

### Mục 1: Lỗi kẹt FSM khi có Thẻ Cộng Lượt Đi (`CC_PLATE_AUCTION` / `extraTurns`)
- **Server**: `turn_loop.ts:208` tiêu thụ `extraTurns -= 1`, đặt `room.phase = TurnPhase.WaitingRoll`, `rolledThisTurnMap.set(roomCode, false)`, nhưng giữ nguyên `currentPlayerIndex`.
- **Client Sync Bug**: Tại `apply_delta.ts:51-62`, `state.setCurrentTurnPlayerId` chỉ được gọi khi `state.currentTurnPlayerId !== turnPlayerId`. Do người chơi không đổi, hàm này bị bỏ qua. `setTurnPhase('WaitingRoll')` không reset `hasRolledThisTurn`.
- **Broadcaster & Parser Gap**: `isPlayerEqual` tại `delta_broadcaster.ts` thiếu so khớp `extraTurns`; `OPTIONAL_PLAYER_KEYS` tại `apply_delta_players.ts` thiếu `'extraTurns'` khiến Client không nhận được cờ.
- **ActionDock Trap**: Client giữ `hasRolledThisTurn === true` và `canRollAgain === false`. `isRollActionDisabled` trả về `true` (khóa nút Đổ); `isEndTurnDisabled` trả về `false` (mở nút Hết Lượt).
- **Server Rejection**: Người chơi bấm "Hết Lượt", Server chặn tại `turn_loop.ts:175` (`!rolledThisTurn && phase === WaitingRoll`) và trả về `INVALID_PHASE`. Người chơi bế tắc cho đến khi TurnWatchdog 60s hết giờ.

### Mục 2: Thẻ sự kiện dính cứng suốt 20 Ticks (`lastEventCard` Stale)
- `event_card_engine.ts` gán `room.lastEventCard` khi bốc thẻ.
- Không có vị trí nào trong `turn_loop.ts` (`executeTurnEnd` hoặc `executeTurnRoll`) thực hiện dọn dẹp `room.lastEventCard = null`.
- Vi phạm *Transient State & Turn N+1 Teardown Invariant* và *Explicit Tombstone Protocol*.

### Mục 3: Lỗ hổng bảo vệ giao dịch P2P khi số dư âm (`balance < 0`)
- Tại `coordTrade` và `coordRespondTradeOffer`, người mua (`buyer`) chỉ bị kiểm tra `buyer.balance < price`.
- Nếu giao dịch hoán đổi BĐS (`price <= 0`), người mua đang âm tiền (`balance < 0`) vẫn có thể tham gia mua/đổi, vi phạm nghĩa vụ thanh lý tài sản trả nợ khi ở trạng thái thâm hụt tài chính.

### Mục 4: Bot Trade Harassment (15 trade intents trong vài phút)
- Mỗi Bot có bộ đếm `lastTradeOfferRound` riêng lẻ. Khi bàn có 3 Bot, mỗi Bot gửi 1 đề xuất trong cùng 1 vòng khiến người chơi nhận dồn dập 3 pop-up.

---

## 2. KIẾN TRÚC GIẢI PHÁP (ARCHITECTURE DIAGRAM)

```
[Mục 1: Extra Turn Lifecycle]
Server executeTurnEnd() ──> extraTurns -= 1, phase = WaitingRoll
                        ──> Broadcaster isPlayerEqual() check extraTurns diff
                        ──> DeltaPayload { turnPhase: WaitingRoll, players: [{ id, extraTurns, ... }] }
                        ──> Client apply_delta.ts: delta.turnPhase === WaitingRoll => setHasRolledThisTurn(false)
                        ──> apply_delta_players.ts: OPTIONAL_PLAYER_KEYS includes 'extraTurns'
                        ──> ActionDock: isRollDisabled = false, isEndDisabled = true => Nút "Đổ Xúc Xắc" SÁNG!

[Mục 2: Stale Card Teardown]
Server executeTurnEnd() / executeTurnRoll() ──> room.lastEventCard = null (Tombstone)
                                           ──> DeltaPayload { lastEventCard: null }
                                           ──> Client Zustand: setLastEventCard(null)

[Mục 3: Insolvent Buyer Guard]
coordTrade() / coordRespondTradeOffer() ──> if (buyer.balance < 0) return INSUFFICIENT_FUNDS
                                        ──> if (seller.balance < 0 && price <= 0) return INSUFFICIENT_FUNDS
                                        ──> (Chỉ cho phép người bán âm tiền bán lấy tiền mặt price > 0 để thoát nợ)

[Mục 4: Bot Anti-Harassment]
findEligibleBotTrade() ──> Target-level Cooldown: Người chơi chỉ nhận tối đa 1 trade/vòng từ TẤT CẢ Bot
                      ──> Ghi nhận round vào room.lastTargetTradeOfferRound tại bot_engine & coordTrade
                      ──> Persistent Rejection: Từ chối >= 2 lần trên 1 ô => Cooldown 4 vòng
```

---

## 3. PRE-FLIGHT BLAST RADIUS AUDIT

| Tiêu Chí | Đánh Giá |
|---|---|
| **Mức Độ Rủi Ro (Risk Level)** | **Slice-Bound** (Tác động Turn Loop, Session Protocol, P2P Trade Coordinator, Bot Strategy, Client Delta Sync). |
| **Tác Động Trực Tiếp (Direct Touch)** | `src/server/session_manager.ts`, `src/server/network/delta_broadcaster.ts`, `src/client/network/apply_delta.ts`, `src/client/network/apply_delta_players.ts`, `src/client/store/game_store_types.ts`, `src/client/ui/action_dock.tsx`, `src/domain/room.ts`, `src/server/turn_loop.ts`, `src/server/room_property_coordinator.ts`, `src/server/property_actions.ts`, `src/domain/bot/bot_trade.ts`, `src/domain/bot/bot_engine.ts`. |
| **Bên Tiếp Nhận Hạ Tầng (Downstream Consumers)** | Game Canvas, Modals (Trade, EventCard, Auction), Telemetry Invariant Watchdog. |
| **Phòng Ngự Kịch Bản Xấu Nhất (Worst-Case Defense)** | Fast-path fallback: Nếu Client mất gói delta hoặc không reset, TurnWatchdog 60s vẫn là phao cứu sinh độc lập không bị phá vỡ. |

---

## 4. CHI TIẾT CÁC THAY ĐỔI THEO TỪNG MÔ-ĐUN

### Mô-đun A: Đồng Bộ Lượt Thêm & Reset Trạng Thái Client (Mục 1)
1. [`src/server/session_manager.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts):
   - Bổ sung `readonly extraTurns?: number;` vào `PlayerDelta`.
   - Cập nhật `toFullPlayerDelta`: `extraTurns: p.extraTurns`.
2. [`src/server/network/delta_broadcaster.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/network/delta_broadcaster.ts):
   - Trong `isPlayerEqual`: Thêm so khớp `(a.extraTurns ?? 0) === (b.extraTurns ?? 0)` để Sparse Delta không drop thay đổi `extraTurns`.
3. [`src/client/store/game_store_types.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts):
   - Bổ sung `readonly extraTurns?: number;` vào `PlayerInfo`.
4. [`src/client/network/apply_delta_players.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_players.ts):
   - Bổ sung `'extraTurns'` vào mảng `OPTIONAL_PLAYER_KEYS`.
5. [`src/client/network/apply_delta.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta.ts):
   - Trong `syncTurnAndTimer`:
     ```ts
     if (delta.turnPhase !== undefined) {
       state.setTurnPhase(delta.turnPhase);
       if (delta.turnPhase === TurnPhase.WaitingRoll) {
         state.setHasRolledThisTurn(false);
       }
     }
     ```
6. [`src/client/ui/action_dock.tsx`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/action_dock.tsx):
   - Hiển thị nhãn responsive chuẩn mobile 360px:
     `<span className="sm:hidden">Đổ Tiếp</span><span className="hidden sm:inline">Đổ Tiếp (+1 Lượt)</span>` khi `actingPlayer?.extraTurns > 0` và `turnPhase === 'WaitingRoll'`.

### Mô-đun B: Dọn Dẹp Trạng Thái Thẻ Sự Kiện N+1 (Mục 2)
1. [`src/domain/room.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/room.ts):
   - Cập nhật kiểu: `lastEventCard?: EventCardInfo | null;` và `lastTargetTradeOfferRound?: Record<string, number>;`.
2. [`src/server/turn_loop.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts):
   - Trong `executeTurnEnd`: Đặt `room.lastEventCard = null;` trước khi trả về `room` (cả nhánh `extraTurns > 0` và nhánh chuyển người chơi).
   - Trong `executeTurnRoll`: Đặt `room.lastEventCard = null;` ở đầu hàm để bảo đảm xúc xắc mới luôn xóa sạch thẻ cũ.

### Mô-đun C: Thắt Chặt Điều Kiện P2P Trade Khi Âm Tiền (Mục 3)
1. [`src/server/room_property_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts):
   - Trong `coordTrade`: Chặn nếu `buyer.balance < 0` hoặc `(price > 0 && buyer.balance < price)`. Chặn nếu `seller.balance < 0 && price <= 0`.
   - Trong `coordRespondTradeOffer`: Chặn chấp thuận giao dịch nếu `buyer.balance < 0` hoặc `buyer.balance < session.price`. Chặn nếu `seller.balance < 0 && session.price <= 0`.
2. [`src/server/property_actions.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts):
   - Trong `validateP2PTrade`: Người mua có `buyer.balance < 0` bị trả về `ActionRejectReason.INSUFFICIENT_FUNDS`. Người bán có `seller.balance < 0` chỉ hợp lệ khi `price > 0` (bán tài sản thu tiền mặt trả nợ).

### Mô-đun D: Giảm Tần Suất & Chống Spam Đàm Phán Bot (Mục 4)
1. [`src/domain/bot/bot_trade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_trade.ts):
   - Bổ sung Room-level Target Guard: Nếu `room.lastTargetTradeOfferRound?.[gap.targetOwnerId] === currentRound`, bỏ qua không gửi thêm đề nghị đến người chơi đó trong cùng vòng.
   - Nếu bị từ chối >= 2 lần trên cùng 1 ô đất (`rejections >= 2`): Cooldown tăng lên 4 vòng. Bảo lưu `TC-144.03` cho bước từ chối đầu tiên.
2. [`src/domain/bot/bot_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_engine.ts):
   - Khi sinh `INTENT_TRADE_OFFER`, ghi nhận `(room.lastTargetTradeOfferRound ??= {})[tradeIntent.sellerId] = currentRound`.
3. [`src/server/room_property_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts):
   - Khi `pendingTradeManager.createSession` thành công, ghi nhận `(ctx.room.lastTargetTradeOfferRound ??= {})[sellerId] = ctx.room.roundCount ?? ctx.room.round ?? 1`.

---

## 5. KẾ HOẠCH KIỂM THỬ (UNIVERSAL 4-FACET MATRIX)

Tạo file test mới: `tests/domain/imp164_turn_sync_card_purge_and_bot_trade.test.ts` (>= 18 tests):
1. **Boundary**:
   - `TC-IMP164.01`: `apply_delta` reset `hasRolledThisTurn = false` khi nhận `turnPhase: WaitingRoll` dù `currentTurnPlayerId` không đổi.
   - `TC-IMP164.02`: `PlayerDelta` serialize đúng `extraTurns: 1` và `extraTurns: 0`. Broadcaster `isPlayerEqual` phát hiện sự khác biệt.
   - `TC-IMP164.03`: `coordTrade` từ chối `INSUFFICIENT_FUNDS` nếu `buyer.balance === -1` với mọi mức giá (`price = 0` hoặc `price = 1000`).
   - `TC-IMP164.04`: `coordTrade` cho phép `seller.balance === -500` bán BĐS với `price = 2000` (giải cứu nợ thụ động), nhưng từ chối nếu `price <= 0`.
2. **Reactivity**:
   - `TC-IMP164.05`: Chuỗi sự kiện rút `CC_PLATE_AUCTION` -> kết thúc nhịp gieo đôi -> `executeTurnEnd` chuyển về `WaitingRoll` -> Client ActionDock nút Roll sáng, nút End Turn bị khóa.
   - `TC-IMP164.06`: Gửi `INTENT_ROLL` thành công sau khi tiêu thụ `extraTurns` mà không bị lỗi `INVALID_PHASE`.
   - `TC-IMP164.07`: `executeTurnEnd` và `executeTurnRoll` phát sóng `lastEventCard: null` khi chuyển sang Turn N+1; Client store nhận `lastEventCard = null`.
   - `TC-IMP164.08`: Bot 2 gửi đề xuất trade cho P1 tại vòng 5 -> Bot 3 bị chặn không gửi thêm đề xuất cho P1 tại vòng 5 qua Room-level Target Cooldown.
   - `TC-IMP164.09`: P1 từ chối ô số 6 của Bot 2 lần thứ 2 -> Bot 2 bị cooldown 4 vòng đối với ô số 6.
3. **Disposal & Cleanup**:
   - `TC-IMP164.10`: `executeTurnRoll` xóa sạch `room.lastEventCard` nếu còn tồn dư từ turn trước.
   - `TC-IMP164.11`: Hoàn tất trade thành công xóa sạch trạng thái từ chối `cellTradeRejections`.
4. **Error Defense**:
   - `TC-IMP164.12`: Phá sản trong khi đang có `extraTurns` -> dọn dẹp sạch `extraTurns = 0`, không giữ lượt ma.
   - `TC-IMP164.13`: Bot-to-Bot trade tuân thủ nghiêm ngặt điều kiện số dư không âm cho bên mua.
