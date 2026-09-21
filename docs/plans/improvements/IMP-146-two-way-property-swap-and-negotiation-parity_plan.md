# Kế Hoạch IMP-146 (Final Plan): Hệ Thống Giao Dịch Đổi Đất 2 Chiều (Two-Way Property Swap) & Cân Bằng Đàm Phán Người - Bot AI

> **Mục tiêu tối thượng:** Tái hiện chân thực 100% cảm xúc và động lực thương lượng mua bán đất như trên bàn cờ tỷ phú ngoài đời thực.  
> **Giải quyết vấn đề cốt lõi:** Xóa bỏ hội chứng "Bot bắt tay nhau cô lập người chơi" (trong ván 4 người, người chơi chỉ thắng 5.3%, Bot độc quyền gấp 32 lần).  
> **Căn cứ:** Dữ liệu thực nghiệm 13.000 ván [`comprehensive_13000_games_gameplay_insights_report.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/simulations/comprehensive_13000_games_gameplay_insights_report.md), ADR-0001 (FSM Server-Authoritative), Gotcha #191, và kết quả kiểm định Station 0 (Plan Grilling).

---

## 1. 5 Động Lực Thương Lượng Đời Thực (Real-Life Negotiation Dynamics)

Trong các ván cờ tỷ phú thực tế, người chơi không bao giờ bán rẻ mảnh ghép độc quyền lấy một vài đồng bạc lẻ. Các giao dịch thành công đều xuất phát từ 5 động lực kinh tế cụ thể:

```
[5 ĐỘNG LỰC THƯƠNG LƯỢNG NGOÀI ĐỜI THỰC]
  ├─ 1. Hoán Đổi Cùng Độc Quyền (Win-Win Monopoly Swap)
  │    └─ "Tôi đưa bạn ô cuối cùng của bộ Nâu, bạn đưa tôi ô cuối cùng của bộ Cam, 2 bên cùng xây nhà đua tốc độ!"
  │
  ├─ 2. Đổi Đất Bù Tiền Thông Minh (Asymmetrical Swap with Cash Offset)
  │    └─ "Ô của tôi đắt hơn ô của bạn (ví dụ Nguyễn Huệ 3.500 Tr. vs Đồng Nai 1.000 Tr.) ➔ Bạn phải bù thêm 2.500 Tr. tiền mặt!"
  │
  ├─ 3. Liên Minh Chống Kẻ Dẫn Đầu (Anti-Snowball Coalition / Embargo)
  │    └─ Khi có 1 đối thủ đang thống trị nhiều khách sạn (Leader), các bên còn lại tuyệt đối cấm vận (Embargo), 
  │       nhưng lại cởi mở hoán đổi đất cho nhau để tạo thế cân bằng đối trọng.
  │
  ├─ 4. Mặc Cả Phân Tầng Tính Cách (Personality-Driven Valuation)
  │    ├─ Aggressive Bot: Máu lửa, sẵn sàng chi đậm (+20% đến +40% tiền bù) để chốt ngay độc quyền và đẩy nhanh xây dựng C3.
  │    ├─ Balanced Bot: Thực dụng, chỉ đổi khi giá trị tài sản ròng cân bằng trong biên độ +/- 15%.
  │    └─ Passive Bot: Thủ thế, ưu tiên an toàn, chỉ đổi khi nhận được nhóm màu đắc địa hoặc lượng tiền bù dự phòng dồi dào.
  │
  └─ 5. Nhịp Điệu Đàm Phán Tự Nhiên (Natural Negotiation Cadence & Cooldown)
       └─ Tránh spam: Nếu một lời đề nghị bị từ chối, áp dụng cooldown 3-5 vòng cho ô đất đó. 
          Không quấy rầy người chơi liên tục gây ức chế.
```

---

## 2. Thiết Kế Kỹ Thuật Chi Tiết (Technical Specifications)

### 2.1. Giao Thức Mạng Mở Rộng (Wire Protocol - Zero Breaking Changes)
Bảo toàn 100% các intent cũ, bổ sung trường tùy chọn `offeredCellIndex`:
```typescript
export type PlayerIntent =
  // ... các intent hiện hữu ...
  | {
      type: 'INTENT_TRADE_OFFER';
      sellerId: string;
      buyerId: string;
      cellIndex: number;            // Ô đất muốn nhận về
      price: number;                // Khoản tiền mặt bù trừ (dương: buyer bù, âm: seller bù, 0: ngang giá)
      offeredCellIndex?: number;    // Ô đất đưa ra để đổi (Two-Way Swap)
    };
```

### 2.2. Xử Lý Giá Sàn, Giá Bằng Không/Âm & Thuế Kho Bạc 5% (Giải Quyết Điểm Mù P1)
- **Đổi Đất Ngang Giá (`offeredCellIndex !== undefined && price === 0`)**:
  - Hợp lệ. Không có dòng tiền mặt di chuyển. Thuế kho bạc = 0 Tr.
- **Đổi Đất Có Bù Tiền (`offeredCellIndex !== undefined && price !== 0`)**:
  - Bỏ qua ràng buộc giá sàn 70% (`PRICE_BELOW_FLOOR`) vì giá trị chính nằm ở ô đất đối ứng.
  - Cho phép `price < 0` (Seller bù tiền cho Buyer) hoặc `price > 0` (Buyer bù tiền cho Seller).
  - Thuế 5% chỉ đánh trên khoản tiền mặt bù trừ ròng: `tax = Math.floor(Math.abs(price) * taxRate)`.
  - Bên phải trả tiền chịu trừ `Math.abs(price)`. Bên nhận tiền nhận `Math.abs(price) - tax`. Kho bạc nhận `tax`. Bảo toàn 100% dòng tiền (`treasury conservation`).

### 2.3. Đồng Bộ WebSocket & GameStore Xuyên Suốt (Giải Quyết Điểm Mù P2)
- Mở rộng `PendingTradeOfferDelta` trong `src/server/session_manager.ts` thêm `readonly offeredCellIndex?: number`.
- `buildDeltaFromRoom` chuyển tiếp `offeredCellIndex` từ `PendingTradeSession` sang client payload.
- Mở rộng state `bot_trade_offer` trong `src/client/store/game_store_types.ts` thêm `offeredCellIndex?: number`.

### 2.4. Xác Thực Tái Lập & Hoán Đổi Quyền Sở Hữu Nguyên Tử 2 Chiều (Giải Quyết Điểm Mù P3)
Tại `executeP2PTrade` (`property_actions.ts`) và `coordRespondTradeOffer` (`room_property_coordinator.ts`):
1. **Kiểm tra điều kiện tiên quyết cho CẢ 2 Ô ĐẤT**:
   - `cellIndex`: Thuộc quyền `sellerId`, `level === 0`, `!isMortgaged`, không ETC.
   - `offeredCellIndex`: Thuộc quyền `buyerId`, `level === 0`, `!isMortgaged`, không ETC.
   - Bên phải trả tiền mặt có đủ số dư thanh toán.
2. **Thực thi nguyên tử trong 1 tick FSM**:
   - `registry.set(cellIndex, buyerId)`.
   - `registry.set(offeredCellIndex, sellerId)`.
   - Cấn trừ số dư tiền bù và trích thuế 5% vào `room.treasury`.
   - Xóa lịch sử từ chối cho cả 2 ô đất: `cellTradeRejections` và `cellLastRejectedRound`.
   - Ghi nhận Structured Log Telemetry:
     `{ event: 'P2P_TRADE_SWAP', correlationId, timestamp, delta: { cellWanted: cellIndex, cellOffered: offeredCellIndex, price, tax } }`.

---

## 3. Danh Sách Tệp Triển Khai Chi Tiết (Blast Radius & Proposed Changes)

### Cụm 1: Server FSM, Intent & Actions Layer
#### [MODIFY] [intent_dispatcher.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/intent_dispatcher.ts)
- Mở rộng `PlayerIntent['INTENT_TRADE_OFFER']` thêm `offeredCellIndex?: number`.
- Chuyển tiếp `ti.offeredCellIndex` vào `RoomManager.handleTradeOffer`.

#### [MODIFY] [room_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_manager.ts)
- Cập nhật hàm `handleTradeOffer`: tiếp nhận tham số `offeredCellIndex?: number`.

#### [MODIFY] [pending_trade_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/pending_trade_manager.ts)
- `PendingTradeSession`: bổ sung `readonly offeredCellIndex?: number`.
- Cập nhật `createSession` nhận và lưu trữ `offeredCellIndex`.

#### [MODIFY] [property_actions.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/property_actions.ts)
- Điều chỉnh hàm `isInvalidPrice` & `checkTradeProperty`:
  - Khi có `offeredCellIndex`: Cho phép `price === 0` hoặc `price < 0`, bỏ qua kiểm tra `PRICE_BELOW_FLOOR`.
- Kiểm tra tính hợp lệ của cả `cellIndex` và `offeredCellIndex` (chính chủ, chưa xây nhà, không thế chấp).
- Xử lý bù tiền 2 chiều và tính thuế `Math.floor(Math.abs(price) * taxRate)` vào kho bạc.
- Cập nhật `registry.set` cho cả 2 ô đất trong 1 giao dịch nguyên tử.

#### [MODIFY] [room_property_coordinator.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts)
- Trong `coordTradeOffer`:
  - Tiếp nhận `offeredCellIndex`, chuyển tiếp sang `pendingTradeManager.createSession` hoặc `executeP2PTrade`.
- Trong `coordRespondTradeOffer`:
  - Tái xác thực nguyên tử cho cả 2 ô đất (`cellIndex` và `offeredCellIndex`).
  - Thực thi hoán đổi quyền sở hữu cho cả 2 ô đất khi chấp thuận.

#### [MODIFY] [session_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts)
- Cập nhật interface `PendingTradeOfferDelta`: Thêm `readonly offeredCellIndex?: number`.
- Cập nhật hàm `buildDeltaFromRoom`: Đưa `offeredCellIndex` vào `pendingTradeOffer`.

### Cụm 2: Trí Tuệ Nhân Tạo Bot AI (Domain Bot Engine)
#### [MODIFY] [bot_trade.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_trade.ts)
- **Hàm `findBotSwapTrade`**:
  - Quét tìm cơ hội Win-Win: Bot thiếu 1 ô của bộ X (do Người chơi hoặc Bot khác sở hữu); Bot có 1 ô của bộ Y mà đối phương đang thiếu.
  - Tính tiền bù: `baseDiff = deedX.price - deedY.price` kết hợp hệ số tính cách (Aggressive sẵn sàng bù thêm +20% đến +40% để hoàn tất bộ).
  - Cooldown: Không chào mời lại cùng một cặp ô đất trong vòng 3 rounds nếu từng bị từ chối.
- **Hàm `evaluateBotSwapAcceptance`**:
  - Đánh giá đề xuất đổi đất từ Người chơi gửi đến Bot.
  - Phán quyết: Chấp thuận nếu giúp Bot hoàn tất độc quyền, hoặc nhận được ô có giá trị chiến lược cao hơn với mức bù tiền tương xứng.
  - Kích hoạt cơ chế cấm vận `EMBARGO_LEADER`: Từ chối nhượng ô đất quyết định cho người đang dẫn đầu bàn cờ.

### Cụm 3: Giao Diện Người Dùng & WebSocket Client (Client UI/UX)
#### [MODIFY] [game_store_types.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts)
- Cập nhật `bot_trade_offer`: Thêm `offeredCellIndex?: number`.

#### [MODIFY] [modal_host.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx)
- Trong hàm `onSubmitTrade`: Gửi trọn vẹn cả `offeredProperties[0]` (đưa) và `requestedProperties[0]` (xin) qua `INTENT_TRADE_OFFER`.
- Truyền `offeredCellIndex` vào props của `BotTradeOfferModal`.

#### [MODIFY] [bot_trade_offer_modal.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/bot_trade_offer_modal.tsx)
- Hiển thị giao diện **Đề Xuất Đổi Đất 2 Chiều 🤝** khi có `offeredCellIndex`:
  - Khối 1: Ô đất đối tác muốn nhượng cho bạn (kèm huy hiệu `👑 Giúp bạn hoàn tất Độc Quyền!` nếu đủ bộ).
  - Khối 2: Ô đất đối tác muốn nhận từ bạn.
  - Thẻ tóm tắt tiền bù: `+X Tr. Bạn nhận thêm` hoặc `-X Tr. Bạn bù thêm`.
  - Bộ đếm 15s đàm phán, âm thanh `SoundEffect.CARD_DRAW`, nút Chấp Thuận / Từ Chối xúc giác chuẩn tactile WCAG AA >= 44px.

---

## 4. Kế Hoạch Kiểm Thử & Nghiệm Thu (Verification Plan)

### Automated Contract Tests (Station 1 RED)
Tạo mới file: `tests/contracts/imp146_p2p_property_swap_and_negotiation_parity.test.ts` (>= 18 atomic tests theo Universal 4-Facet Matrix):
- **Facet 1 (Boundary & Validation)**: Kiểm tra từ chối hợp lệ khi ô đất bị thế chấp, đã xây nhà, không chính chủ, hoặc không đủ tiền bù. Cho phép `price === 0` và `price < 0` khi đổi đất.
- **Facet 2 (Reactivity & Bot Decision)**: Kiểm chứng Bot Aggressive, Balanced, Passive phản ứng chính xác: cùng độc quyền, Bot độc quyền, chỉ người chơi độc quyền, cấm vận kẻ dẫn đầu (`EMBARGO_LEADER`).
- **Facet 3 (Atomic State & Treasury)**: Cả 2 ô đổi chủ trong 1 tick, thuế 5% tính đúng trên tiền bù, số dư tiền mặt bảo toàn 100%.
- **Facet 4 (UI, Network Delta & Timeout)**: `PendingTradeOfferDelta` truyền đủ `offeredCellIndex` qua WebSocket, `BotTradeOfferModal` render chuẩn 2 chiều, hết 15s tự động reject an toàn.

### System Verification & Simulation
1. `npm test tests/contracts/imp146_p2p_property_swap_and_negotiation_parity.test.ts` ➔ 18/18 PASS.
2. Chạy toàn bộ 265 test suites hiện có (5.462 tests) ➔ 100% PASS (Zero regressions).
3. `npm run lint:ui` ➔ 0 vi phạm.
4. Chạy lại benchmark mô phỏng 1.000 ván `4P_DIVERSE` qua `comprehensive_gameplay_simulation_1000.ts` để chứng minh tỷ lệ thắng của người chơi thật được cải thiện rõ rệt từ 5.3% lên ~18% - 25%.
