# [KẾ HOẠCH KỸ THUẬT IMP-142]: Bot Chủ Động Đàm Phán Mua Đất Người Chơi & Hộp Thoại 15 Giây (Bot-to-Human P2P Trade Negotiation & 15s Dilemma Modal)

> **Mã số cải tiến:** IMP-142  
> **Phạm vi:** FSM & Protocol · Pending Trade Session · Realtime WebSocket Delta · Client Dilemma Modal (15s Countdown)  
> **Mục tiêu:** Cho phép Bot chủ động gạ mua mảnh ghép độc quyền từ Người chơi thật qua giao diện đàm phán kịch tính 15s, triệt tiêu cưỡng chế mua ngầm và đảm bảo ván đấu không bao giờ bị treo.

---

## 1. BỐI CẢNH & PHÂN TÍCH VẤN ĐỀ

1. **Hiện trạng bất cập**:
   - Hiện tại, Bot có thuật toán `findEligibleBotTrade` để tìm mua mảnh ghép độc quyền (`monopoly gap`).
   - Tuy nhiên, khi mục tiêu là ô đất của Người chơi thật (`seller.isBot === false`), server hiện tại (`room_property_coordinator.ts#coordTrade`) gọi thẳng `executeP2PTrade`, biến giao dịch thành việc Bot **cưỡng chế mua ngầm** mà người chơi không hề hay biết hay được quyền quyết định. Điều này vi phạm nghiêm trọng nguyên tắc **SSOT & Player Intent Integrity** (ADR-0001).
2. **Yêu cầu nghiệp vụ**:
   - Khi Bot muốn mua đất của Người chơi thật, Bot phải gửi một **Lời Đề Nghị Đàm Phán (Trade Proposal)**.
   - Phía người chơi xuất hiện hộp thoại đàm phán độc quyền (`BotTradeOfferModal`) với đếm ngược **15 giây**.
   - Người chơi đứng trước thế tiến thoái lưỡng nan:
     + **Đồng ý bán**: Nhận ngay cục tiền lớn (150% - 175% giá gốc).
     + **Từ chối**: Giữ đất để chặn Bot hoàn tất độc quyền xây nhà.
   - **Chống treo ván đấu (Anti-Stall Invariant)**: Hết 15 giây nếu người chơi không phản hồi (hoặc AFK), server tự động coi như **Từ Chối** (`AUTO_REJECT_TIMEOUT`) và giải phóng lượt cho Bot tiếp tục.

---

## 2. KIẾN TRÚC HỆ THỐNG & LUỒNG GIAO VẬN

```
[Bot Turn: PropertyManagement]
               │
               ▼
      [findEligibleBotTrade]
  (Bot có N-1 ô, Người giữ gapCell)
               │
               ▼
[coordTrade: buyer.isBot && !seller.isBot]
               │
               ▼
   [Tạo PendingTradeSession (15s)]
               │
               ▼
       [Broadcast DeltaPayload]
   { pendingTradeOffer: { ... } }
               │
               ▼
   [Client Người Chơi: BotTradeOfferModal]
   (Đồng hồ đếm ngược 15s, cảnh báo độc quyền)
         /                    \
     (Đồng ý)               (Từ chối / Hết 15s)
        │                           │
        ▼                           ▼
[INTENT_RESPOND_TRADE_OFFER]  [INTENT_RESPOND_TRADE_OFFER]
  (accept: true)               (accept: false / timeout)
        │                           │
        ▼                           ▼
[executeP2PTrade: Tiền & Đất]   [bot.lastTradeOfferRound]
[Toast: Giao dịch thành công]   [Toast: Đã từ chối]
        │                           │
         ──────────────┬────────────
                       │
                       ▼
               [Bot tiếp tục lượt]
```

---

## 3. THIẾT KẾ KỸ THUẬT CHI TIẾT

### Trụ Cột 1: Quản Trị Phiên Đàm Phán Server (Pending Trade Session) & Chống Stuck
- **Tệp mới / sửa đổi:** `src/server/pending_trade_manager.ts` & `src/server/room_property_coordinator.ts`
  - Cấu trúc dữ liệu:
    ```ts
    export interface PendingTradeSession {
      readonly offerId: string;
      readonly roomCode: string;
      readonly buyerId: string;   // Bot
      readonly sellerId: string;  // Human
      readonly cellIndex: number;
      readonly price: number;
      readonly basePrice: number;
      readonly createdAt: number;
      readonly expiresAt: number; // createdAt + 15_000
    }
    ```
  - Trong `coordTrade`:
    - Nếu `seller.isBot === true`: Giữ nguyên 100% luồng tính toán đồng bộ 0ms qua `evaluateBotTradeAcceptance` (bảo toàn trọn vẹn test suites `imp82` và `imp118`).
    - Nếu `buyer.isBot && !seller.isBot`:
      Tạo `PendingTradeSession`, lưu vào `pendingTrades` của `RoomManager`.
      Tạm dừng intent loop của Bot (`executeBotIntentStep` trả về `false` khi có pending trade).
  - **Chống Cưỡng Chế Đổi Lượt Sớm (P1 Resolution)**:
    - Trong `src/server/room_bot_coordinator.ts` và `src/server/network/turn_orchestrator.ts`:
      Khi phòng có `hasPendingTrade(roomCode) === true`, bỏ qua lệnh `releaseStuckBotTurn` (không đổi lượt sau 1.5s) và gọi `watchdog.notifyProgress(roomCode)` hoặc `touchActivity` duy trì trạng thái chờ 15s.
  - **Thẩm Định & Re-Validate Atomic (P2 Resolution)**:
    - Khi người chơi bấm Chấp Nhận (`accept === true`), trước khi gọi `executeP2PTrade` bắt buộc re-validate atomic: `buyer.balance >= price && !isMortgaged && registry.get(cellIndex) === sellerId`. Nếu không còn thỏa mãn, từ chối an toàn với mã lỗi rõ ràng.
    - Xử lý Disconnect: Nếu người chơi bán đất bị mất mạng trong 15s, hủy ngay pending trade để giải phóng Bot.
  - Quét Timeout 15s tự động:
    - Trong hàm đồng bộ tick/delta hoặc timeout watchdog: nếu `Date.now() >= session.expiresAt`, tự động kích hoạt `AUTO_REJECT_TIMEOUT`.

### Trụ Cột 2: Giao Thức Mạng, Sparse Delta & Đường Ống Truyền Dữ Liệu
- **Tệp sửa đổi:** `src/server/session_manager.ts`, `src/server/network/delta_broadcaster.ts` & `src/server/room_manager_queries.ts`
  - Bổ sung vào `DeltaPayload`:
    ```ts
    readonly pendingTradeOffer?: {
      readonly offerId: string;
      readonly buyerId: string;
      readonly sellerId: string;
      readonly buyerName: string;
      readonly cellIndex: number;
      readonly price: number;
      readonly basePrice: number;
      readonly multiplier: number;
      readonly givesMonopoly: boolean;
      readonly timeRemaining: number;
    } | null;
    ```
  - **Đồng Bộ Sparse Delta (P3 Resolution)**:
    - Trong `delta_broadcaster.ts#buildSparseDelta`: Khai báo so sánh `pendingTradeOffer`. Nếu khác nhau, đưa vào sparse delta payload để tránh bị nén nuốt chửng dữ liệu.
    - Trong `room_manager_queries.ts`: Truyền `pendingTradeOffer` từ `RoomManager` qua `buildDeltaFromRoom`.
- **Tệp sửa đổi:** `src/server/intent_dispatcher.ts` & `src/server/security/intent_guard.ts`
  - Tiếp nhận Intent mới:
    ```ts
    | { type: 'INTENT_RESPOND_TRADE_OFFER'; offerId: string; accept: boolean }
    ```
  - Guard: Chỉ cho phép người bán (`playerId === session.sellerId`) phản hồi.

### Trụ Cột 3: Client Store & Hộp Thoại Đàm Phán 15 Giây (`BotTradeOfferModal`)
- **Tệp sửa đổi:** `src/client/store/game_store_types.ts` & `src/client/network/apply_delta.ts`
  - Thêm `'bot_trade_offer'` vào `ActiveModalType` và `ModalPayloadMap`.
  - `apply_delta.ts`: Khi nhận delta có `pendingTradeOffer` và `sellerId === myId`, tự động mở modal `bot_trade_offer`. Khi `pendingTradeOffer` bị xóa, tự động đóng modal.
- **Tệp mới:** `src/client/ui/modals/bot_trade_offer_modal.tsx`
  - Phong cách thiết kế Retropoly xúc giác cao cấp:
    + Banner thông tin Bot: Avatar, Tên Bot, Huy hiệu tính cách (`Hiếu Chiến` / `Cân Bằng` / `Thận Trọng`).
    + Thẻ BĐS mục tiêu: Tên BĐS, màu phân khu, giá niêm yết.
    + Thống kê tài chính to bản: Giá Bot trả, phần trăm sinh lời (`+155%` hoặc `+175%`), tiền lời thực nhận.
    + Cảnh báo độc quyền: `"⚠️ Cảnh báo: Nếu bạn đồng ý bán, đối thủ sẽ hoàn thành ĐỘC QUYỀN nhóm màu và được phép xây dựng công trình!"`.
    + Thanh đếm ngược 15 giây (Progress Bar co dần kèm số giây đổi màu vàng -> đỏ).
    + 2 Nút hành động công thái học:
      * `[❌ Từ Chối Bán]` (nút phụ, viền đỏ/slate).
      * `[🤝 Đồng Ý Bán (+X Tr.)]` (nút chính, xanh ngọc emerald xúc giác).
- **Tệp sửa đổi:** `src/client/ui/modals/modal_host.tsx`
  - Gắn `BotTradeOfferModal` vào cây modal hệ thống.

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (UNIVERSAL 4-FACET MATRIX)

Tạo tệp: `tests/contracts/imp142_bot_to_human_trade_negotiation.test.ts`:
- **Facet 1 (Boundary & Session Lifecycle):**
  - Bot đề xuất mua ô đất của người chơi tạo ra `PendingTradeSession` với `offerId` và hạn 15s.
  - Không thực thi chuyển quyền sở hữu hay trừ tiền ngay lập tức (Zero Premature Execution).
  - Vòng lặp intent của Bot tạm dừng khi có pending trade offer.
- **Facet 2 (Reactivity & Explicit Player Choice):**
  - Người chơi gửi `accept: true` -> `executeP2PTrade` chuyển giao quyền sở hữu và tài chính chuẩn xác.
  - Người chơi gửi `accept: false` -> Hủy pending session, Bot không mua được đất, ghi nhận cooldown.
- **Facet 3 (Anti-Stall Timeout & Guard Defense):**
  - Hết 15 giây không phản hồi -> Server tự động từ chối `AUTO_REJECT_TIMEOUT`, giải phóng Bot tiếp tục ván đấu.
  - Người chơi khác không phải chủ sở hữu gửi phản hồi bị từ chối `UNAUTHORIZED`.
- **Facet 4 (UI Modal & Mobile Ergonomics):**
  - `BotTradeOfferModal` render đầy đủ giá gốc, giá mua, % lời, cảnh báo độc quyền và 2 nút bấm chuẩn WCAG AA >= 44px.
  - Tự động đóng modal khi nhận delta xóa pending offer.
