# BÁO CÁO HOÀN THÀNH TICKET IMP-203
# BOT HYBRID TRADE OFFERS (PROPERTY + CASH BUNDLE) & STRATEGIC BILATERAL VALUATION

> **Ticket ID**: `IMP-203`  
> **Classification**: Tier 2 (Full Rigor) per `GEMINI.md`  
> **Domain**: Bot AI (`src/domain/bot/`) & Server Trade Coordinator (`src/server/`)  
> **Status**: 🟢 **HOÀN TẤT & ĐÃ NGHIỆM THU 100% (STATION 3 APPROVED)**  
> **Audited Evidence**: [`.agents/evidence/imp203_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp203_snapshot.json) (`executed: true`, `status: PASSED`, `passedCount: 20`)

---

## 1. TỔNG QUAN NÂNG CẤP & BỐI CẢNH

Trước bản nâng cấp này:
1. **Bot chỉ mua bằng tiền mặt**: `bot_engine.ts#L342` chỉ gọi `findEligibleBotTrade` trả về đề xuất thuần tiền (`INTENT_TRADE_OFFER` không có `offeredCellIndex`). Khi cạn tiền dự trữ an toàn, bot chịu chết không thể mua ô đất hoàn tất độc quyền.
2. **`findBotSwapTrade` bị cô lập**: Là dead code chỉ kích hoạt khi cả hai bên cùng thiếu 1 ô chéo nhau (xác suất gần như bằng 0 trong game thực tế). Bot không biết gom các ô đất thặng dư (bị đối thủ chặn) để mang đi đàm phán.
3. **Bẫy Modal 15s nuốt chửng đề xuất**: Biểu thức `isBotHuman` tại `room_property_coordinator.ts#L128` mở modal 15s cho mọi giao dịch có người tham gia, khiến đề xuất Người gửi cho Bot bị treo 15s chờ timeout.
4. **Phủ quyết mù quáng**: `evaluateBotSwapAcceptance#L365` từ chối cứng `PREVENT_MONOPOLY` nếu đối tác được độc quyền, bất kể đối tác đưa bao nhiêu tiền bù.

Sau khi hoàn thành IMP-203:
1. **Phát hiện đất thặng dư thông minh (`findSurplusProperties`)**: Bot tự động quét các ô đất cấp 0, không thế chấp, thuộc nhóm màu đã bị đối thủ chặn (không thể tự độc quyền) để làm tài sản đem đổi.
2. **Định giá gói hỗn hợp theo 3 trục chiến lược (`calculateHybridTradeOfferPrice`)**:
   - *Trục 1 (Lợi ích đối tác)*: Nếu ô đất đem đổi giúp đối tác mở khóa điều kiện xây nhà C1-C3 (`partnerGetsMonopoly === true`), Bot xem đây là thương vụ Win-Win, đổi ngang tiền = 0 (nếu đất Bot đắt hơn/bằng) hoặc chỉ bù đúng chênh lệch giá gốc $\Delta = W - O$.
   - *Trục 2 (Đối tác không được xây nhà)*: Bot bù phần chênh lệch + Tiền thưởng thiện chí (Cash Sweetener) theo tính cách: 35% Aggressive / 25% Balanced / 15% Passive.
   - *Trục 3 (Tính cách & Ưu tiên)*: Bot ưu tiên đề xuất Hybrid (đất + tiền) để giải phóng tài sản chết và tiết kiệm tiền mặt. Nếu không có đất thặng dư hoặc thiếu tiền bù, tự động fallback về mua đứt bằng tiền mặt (`calculateTradeOfferPrice`).
3. **Cấm vận kẻ dẫn đầu (Leader Embargo)**: Bot tuyệt đối không đưa ô đất giúp người chơi đang dẫn đầu (`isLeadingPlayer`) hoàn thành độc quyền.
4. **Triệt tiêu bẫy modal 15s**: `shouldOpenModal = Boolean(requester?.isBot && !targetPlayer?.isBot)` bảo đảm modal chỉ mở khi Bot chủ động đề xuất cho Người thật. Mọi trường hợp còn lại (Human-to-Bot, Bot-to-Bot, Human-to-Human) đều xử lý đồng bộ 0ms.
5. **Chuẩn hóa Sign Convention (`cashPaidByBot`)**: Dương khi Bot bù tiền, âm/0 khi Bot nhận tiền. Đảm bảo tính toán giá trị `totalValueReceived = deedAcquired.price - cashPaidByBot` chuẩn toán học.

---

## 2. ĐO LƯỜNG VẬT LÝ DÒNG MÃ TRÊN ĐĨA (PHYSICAL DISK LOC AUDIT)

Đo lường vật lý trực tiếp trên đĩa thông qua công cụ trước khi đóng ticket:

| Đường dẫn tệp vật lý | Phân loại | LOC Baseline | LOC Sau Cùng | Biến động (Delta) | Trần Tier 1 | Trạng thái ngân sách |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| [`src/domain/bot/bot_monopoly_utils.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_monopoly_utils.ts) *(Mới)* | Tier 1 Domain | 0 | **61** | +61 | $\le 400$ LOC | 🟢 Module lá cực gọn (< 100 LOC) |
| [`src/domain/bot/bot_trade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_trade.ts) | Tier 1 Domain | 393 | **227** | -166 | $\le 400$ LOC | 🟢 Giảm sâu, dưới cảnh báo 300 LOC |
| [`src/domain/bot/bot_hybrid_trade.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_hybrid_trade.ts) *(Mới)* | Tier 1 Domain | 0 | **292** | +292 | $\le 400$ LOC | 🟢 Rất an toàn (< 300 LOC) |
| [`src/server/trade_coordinator_helper.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/trade_coordinator_helper.ts) *(Mới)* | Tier 1 Server | 0 | **49** | +49 | $\le 400$ LOC | 🟢 Module helper độc lập (< 100 LOC) |
| [`src/server/room_property_coordinator.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/room_property_coordinator.ts) | Tier 1 Server | 394 | **381** | -13 | $\le 400$ LOC | 🟢 Dư 19 dòng an toàn dưới trần |
| [`src/domain/bot/bot_engine.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/bot/bot_engine.ts) | Tier 1 Domain | 385 | **385** | 0 | $\le 400$ LOC | 🟢 Bảo toàn 100% |
| [`tests/contracts/imp203_bot_hybrid_trade_offers.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp203_bot_hybrid_trade_offers.test.ts) | Contract Test | 0 | **357** | +357 | $\le 600$ LOC | 🟢 Chuẩn Living Contract Test |

---

## 3. KẾT QUẢ KIỂM THỬ THỰC TẾ & BẰNG CHỨNG XÁC THỰC

### 3.1 Bằng chứng Contract Test IMP-203 (20/20 Atomic Tests PASS)
Lệnh thực thi: `npx vitest run tests/contracts/imp203_bot_hybrid_trade_offers.test.ts`
- **Facet 1 (Boundary & Surplus Identification)**:
  - `[TC-203.01/MSS]` findSurplusProperties nhận diện ô đất đơn lẻ thuộc nhóm màu đã bị đối thủ chặn: **PASS**
  - `[TC-203.02/MSS]` findSurplusProperties loại bỏ ô đất đã xây công trình (level > 0): **PASS**
  - `[TC-203.03/MSS]` findSurplusProperties loại bỏ ô đất đang bị thế chấp (isMortgaged): **PASS**
  - `[TC-203.04/MSS]` findSurplusProperties loại bỏ các ô BĐS đặc biệt không màu (Railroad/Utility): **PASS**
  - `[TC-203.05/MSS]` findSurplusProperties tuyệt đối không bao gồm ô đất thuộc nhóm màu độc quyền của Bot: **PASS**
  - `[TC-203.06/MSS]` findSurplusProperties không bao gồm ô đất thuộc nhóm màu mà Bot đang có N-1 ô: **PASS**
- **Facet 2 (Reactivity & Strategic Hybrid Pricing)**:
  - `[TC-203.07/MSS]` Khi Bot có gap và có đất thặng dư + đủ tiền, findEligibleBotTrade phát sinh INTENT_TRADE_OFFER có cả offeredCellIndex VÀ price: **PASS**
  - `[TC-203.08/MSS]` Khi ô đất đem đổi giúp đối tác hoàn tất độc quyền và O >= W, price === 0 (đổi ngang Win-Win): **PASS**
  - `[TC-203.09/MSS]` Khi ô đất đem đổi giúp đối tác hoàn tất độc quyền và W > O, price === W - O: **PASS**
  - `[TC-203.10/MSS]` Khi ô đất đem đổi KHÔNG giúp đối tác độc quyền và W > O, price bao gồm chênh lệch gốc + tiền thưởng tính cách: **PASS**
  - `[TC-203.11/MSS]` Khi ô đất đem đổi KHÔNG giúp đối tác độc quyền và O >= W, Bot Aggressive lì xì tiền mặt, Bot Passive đổi ngang: **PASS**
  - `[TC-203.12/MSS]` Khi Bot không có đất thặng dư, findEligibleBotTrade tự động fallback về đề xuất thuần tiền (cash-only): **PASS**
  - `[TC-203.13/MSS]` Khi Bot không đủ tiền mặt cho khoản bù an toàn, tự động fallback về đề xuất thuần tiền hoặc bỏ qua: **PASS**
- **Facet 3 (Server Coordination & Bilateral Valuation)**:
  - `[TC-203.14/MSS]` coordTrade gọi evaluateBotSwapAcceptance khi nhận đề xuất có offeredCellIndex: **PASS**
  - `[TC-203.15/MSS]` Bot nhận đề xuất chấp thuận khi gói đổi mang lại độc quyền cho bot hoặc tổng giá trị vượt trội: **PASS**
  - `[TC-203.16/MSS]` Bot nhận từ chối khi đề xuất làm mất độc quyền của chính nó (isMonopolyGroup): **PASS**
  - `[TC-203.17/MSS]` Bot-to-Bot parity chấp thuận khi tổng giá trị đề xuất >= 1.60x giá trị ô đất: **PASS**
  - `[TC-203.18/MSS]` Sau khi giao dịch hỗn hợp thành công qua executeP2PTrade, cả 2 ô đất đổi chủ tức thì, tiền bù và thuế 5% luân chuyển chính xác: **PASS**
- **Facet 4 (Adversarial Defenses & Anti-Freeze Gates)**:
  - `[TC-203.19/MSS]` Anti-Modal Freeze: Khi Human đề xuất đổi đất cho Bot, server xử lý đồng bộ tức thì 0ms (pending: false), không mở modal 15s chờ Bot: **PASS**
  - `[TC-203.20/MSS]` Leader Embargo & Cooldown: Bot không đưa ô đất giúp người chơi dẫn đầu hoàn thành độc quyền; khi đề xuất bị từ chối, swapPairLastRejectedRound kích hoạt cooldown 3 vòng: **PASS**

### 3.2 Cổng Nghiệm Thu Tương Thích Ngược (Zero Regression)
- `tests/contracts/imp146_p2p_property_swap_and_negotiation_parity.test.ts`: **24/24 PASS (100%)**
- `tests/contracts/imp142_bot_to_human_trade_negotiation.test.ts`: **24/24 PASS (100%)**
- `tests/client/imp154_trade_bot_intelligence_and_sentiment.test.ts`: **22/22 PASS (100%)**
- `tests/contracts/imp200_safe_off_turn_trade_and_ergonomics.test.ts`: **28/28 PASS (100%)**
- `tests/contracts/edge_cases_25.test.ts`: **25/25 PASS (100%)**
- Tổng cộng: **143/143 tests liên quan đều PASS 100%**.
- `npx tsc --noEmit`: 0 lỗi type, 0 cảnh báo.

---

## 4. BẤT BIẾN KINH NGHIỆM ĐÃ GHI NHẬN (GOTCHA PERSISTENCE)

Đã ghi nhận bất biến thực chứng **Gotcha #288** vào [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md):
- **Strategic 3-Axes Hybrid Pricing Invariant**: Giá tiền bù trong gói đổi đất tính theo 3 trục: Độ lệch giá gốc $\Delta = W - O$, Lợi ích mở khóa xây nhà của người nhận (`partnerGetsMonopoly`), và Cá tính Bot.
- **Anti-Modal Freeze & Synchronous Bot Valuation**: Giao dịch gửi tới Bot luôn được thẩm định đồng bộ 0ms qua `handleBotRecipientTrade`. Modal 15s chỉ dành riêng cho trường hợp Bot đề xuất tới Người chơi thật.
- **Sign Convention & Bilateral Parity**: `cashPaidByBot` dương khi Bot bù tiền, âm khi Bot nhận tiền. Công thức định giá: `totalValueReceived = deedAcquired.price - cashPaidByBot`. Nếu tổng giá trị $\ge 1.60\times$ giá đất, Bot chấp thuận chuyển nhượng độc quyền.
- **Zero-Cycle Leaf Module Invariant**: Các hàm tiện ích quét gap (`findAllMonopolyGaps`) bắt buộc nằm ở module lá độc lập `bot_monopoly_utils.ts`.
- **Persistent Pair Cooldown Invariant**: Khi đề xuất đổi đất bị từ chối, cặp ô đất `${wanted}_${offered}` bắt buộc được ghi nhận vào `swapPairLastRejectedRound` để kích hoạt cooldown 3 vòng chống spam.

---

## 5. PHÁN QUYẾT NGHIỆM THU TRẠM 3 (STATION 3 VERDICTS)

- **Spec Reviewer**: **SPEC_PASS** 🟢 (100% đối chiếu đặc tả, Zero Scope Drift, đủ 20 atomic contract tests, 100% khớp snapshot).
- **Code Reviewer**: **CODE_PASS** 🟢 (Kiến trúc DAG không vòng lặp, type safety strict mode, ngân sách Tier 1 $\le 400$ LOC đạt chuẩn).
