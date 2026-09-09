# GAME-S06 — Sync Bots & Vận Hành Nội Bộ — Tự Hành Hóa Bot AI + Khép Vòng Nợ Kỹ Thuật

> **Trạng thái:** Pending · Sẵn sàng để Implementation  
> **Epic Ledger:** [`docs/epics/gameplay/_epic_ledger.md`](../docs/epics/gameplay/_epic_ledger.md) — Slice 06  
> **Kế thừa test:** 394/394 tests PASS · 33 suites · E2E Golden Flow S00→S05 PASS

---

## PHẦN 1 — METADATA

| Trường | Giá trị |
|--------|---------|
| **Ticket ID** | GAME-S06 |
| **Tiêu đề** | Sync Bots & Vận Hành Nội Bộ — Tự Hành Hóa Bot AI + Khép Vòng Nợ Kỹ Thuật |
| **Epic** | Gameplay Core |
| **Phụ thuộc** | GAME-S00 đến GAME-S05 (394/394 tests PASS) |
| **Tầm quan trọng** | HIGH |
| **Test Coverage kế thừa** | 394 tests (33 suites) — 100% PASS · Adversarial Inversion ×4 PASS · E2E Golden Flow S00→S05 PASS · Production Resilience Living E2E PASS |
| **Luật Zero Bug-Codification** | Nghiêm ngặt — Mọi assertion phải kiểm chứng đúng spec, KHÔNG mirror hành vi lỗi |
| **Use Case Refs** | UC-GAME-002, UC-GAME-005, UC-GAME-008, UC-GAME-009, UC-GAME-056, UC-GAME-058 |
| **Traceability Chain** | Requirement → Epic Gameplay → Slice 06 (Milestone Deep Audit S00–S05) |
| **Lifecycle Status** | Pending → Prepared (Approved for Implementation) |

---

## PHẦN 2 — INTENT & CONFINEMENT

### 2.1. Mục Tiêu Slice

Slice 06 có **4 mục tiêu song song**, tất cả bắt buộc hoàn thành trong cùng một slice:

```
[DEBT-S06-01..03] Đóng vòng 3 cơ chế vay CC tạm thời
        │
        ├─► CC_OVERDRAFT  : bộ đếm overdraftRoundsLeft → thu 3.300 Tr. sau 3 vòng
        ├─► CC_FREE_CREDIT: trích 400 Tr. lãi mỗi vòng qua GO → Kho bạc
        └─► CC_SLOW_BUILD : đếm unbuiltRounds > 2 → auto-auction ô C0

[DEBT-S06-04] Đấu nối Auto-Auction 70% niêm yết
        └─► InsolvencyManager → AuctionSession khởi điểm 70%

[DEBT-S06-05..06] Tái cấu trúc module vượt ngưỡng 300 LOC
        ├─► property_manager.ts (370L) → phân tách module con < 300 LOC
        ├─► card_handlers.ts   (355L) → phân tách module con < 300 LOC
        ├─► room_manager.ts    (338L) → phân tách module con < 300 LOC
        └─► 7 hàm CC > 5 → Strategy Pattern / Command Dispatcher

[DEBT-S06-07..09] Dọn sạch dead code & chuẩn hóa
        ├─► Xóa dead enum: CommunityChest, Jail, GoToJail
        ├─► Xóa alias dư thừa: UTILITY_CELLS_ECE
        ├─► Xóa No-Op wrapper: sendToAudit
        ├─► Chuẩn hóa kiểu trả về void cho executeChanceCard
        └─► Toàn bộ Magic String Reason Codes → enum ActionRejectReason

[DEBT-S06-10] Xây dựng từ điển i18n tiếng Việt
        └─► src/domain/i18n/vi.ts: mã lỗi + 36 thẻ sự kiện (16 MC + 20 CC)

[Bot AI Engine — NEW] Tự hành hóa Bot AI 3 tính cách
        ├─► Thụ Động : chỉ endTurn, không mua/nâng cấp
        ├─► Cân Bằng : mua BĐS nếu balance ≥ 120% giá niêm yết (ngưỡng 20%)
        └─► Hung Hăng: nâng cấp tài sản ngay khi có đủ bộ màu + đủ tiền
```

### 2.2. Phạm Vi ĐƯỢC PHÉP (In-Scope)

Chính xác các flow từ **DEBT-S06-01 đến DEBT-S06-10** và **Bot AI Engine**:

| # | Hạng mục | Tệp liên quan | DEBT Ref |
|---|----------|---------------|----------|
| 1 | Bộ đếm `overdraftRoundsLeft` và thu hồi 3.300 Tr. sau 3 vòng GO | `card_handlers.ts`, `room_manager.ts` | DEBT-S06-01 |
| 2 | Trích lãi CC_FREE_CREDIT 400 Tr. mỗi vòng qua GO → Kho bạc | `card_handlers.ts`, `room_manager.ts` | DEBT-S06-02 |
| 3 | Thuộc tính `unbuiltRounds`, đếm C0 quá 2 vòng không nâng cấp → Auto-Auction | `property_manager.ts`, `room_manager.ts` | DEBT-S06-03 |
| 4 | Auto-Auction giá khởi điểm 70% niêm yết trong InsolvencyManager | `insolvency_manager.ts`, `auction_manager.ts` | DEBT-S06-04 |
| 5 | Phân tách 3 tệp > 300 LOC thành module con đơn nhiệm | `property_manager.ts`, `card_handlers.ts`, `room_manager.ts` | DEBT-S06-05 |
| 6 | Refactor 7 hàm vi phạm CC > 5 sang Strategy / Command Dispatcher | Các module con mới | DEBT-S06-06 |
| 7 | Xóa dead enum (CommunityChest, Jail, GoToJail) và alias UTILITY_CELLS_ECE | `room.ts`, `board_config.ts`, `event_card_types.ts` | DEBT-S06-07 |
| 8 | Xóa No-Op wrapper `sendToAudit`, chuẩn hóa kiểu `void` cho `executeChanceCard` | `audit_manager.ts`, `card_handlers.ts` | DEBT-S06-08 |
| 9 | Chuẩn hóa toàn bộ Magic String Reason Codes → `enum ActionRejectReason` | `action_reasons.ts`, toàn bộ caller | DEBT-S06-09 |
| 10 | Module từ điển `src/domain/i18n/vi.ts`: mã lỗi + 36 thẻ | `vi.ts` [NEW] | DEBT-S06-10 |
| 11 | Bot AI Engine 3 tính cách (Thụ Động / Cân Bằng / Hung Hăng) | `bot_engine.ts` [NEW] | UC-GAME-005 |
| **VSC-A** | **[Blocker Fix]** Bổ sung `isBot?: boolean` vào `Player` interface + `createPlayer()` + `PlayerDelta` + `buildDeltaFromRoom()` | `room.ts`, `session_manager.ts` | TC-06.8 |
| **VSC-B** | **[Blocker Fix]** Bổ sung `overdraftRoundsLeft?: number` vào `Player` interface + `createPlayer()` + `PlayerDelta` + `buildDeltaFromRoom()` | `room.ts`, `session_manager.ts` | TC-06.1 |

### 2.3. Phạm Vi NGOÀI PHẠM VI (Out-of-Scope / Deferred)

Các hạng mục sau **KHÔNG thuộc Slice 06**. Mọi attempt implement sẽ bị Reviewer từ chối:

- **3D Animation & Rendering**: Hiệu ứng di chuyển quân cờ, animation card flip → Slice 07+
- **WebSocket multi-client real-time sync** (Client-side handler): Chỉ Server-side delta đã có từ S00. Client R3F subscription → Slice 07
- **UI cờ tỷ phú** (React/R3F components): Board 3D, HUD, modal mua đất → Slice 07+
- **Chế độ multiplayer online** (nhiều client đồng thời): → Slice 07+
- **Test E2E Browser/Playwright**: → Slice 07+
- **Thẻ sự kiện mới** ngoài 16 MC + 20 CC đã định nghĩa trong `docs/requirements.md §V`
- **Rule change** trên bất kỳ nghiệp vụ đã PASS trong S00–S05

### 2.4. Ràng Buộc Kỹ Thuật Bắt Buộc

| Ràng buộc | Mô tả |
|-----------|-------|
| **Server-authoritative FSM** | Mọi state transition Bot phải đi qua `RoomManager` → `IntentDispatcher` → FSM. Bot KHÔNG được phép mutate state trực tiếp. |
| **TypeScript strict mode** | `strict: true`, `noUncheckedIndexedAccess: true`. Zero `as unknown as T`. |
| **Zero side-effects ngầm** | Hành động Bot phải emit `PlayerIntent` rõ ràng giống player thật. |
| **Deterministic PRNG** | Bot dùng cùng `mulberry32` seed của session. Zero `Math.random()` tự phát. |
| **Bảo toàn bất biến** | Tổng `balance` toàn bộ players + `treasury` + tổng `mortgageLoans` = hằng số sau mỗi action. |
| **LOC per file** | Mỗi tệp sau refactor ≤ 300 LOC (warn ≥ 250 LOC). |
| **Cyclomatic Complexity** | CC ≤ 5 cho mỗi hàm. Max 30 LOC/hàm. |
| **Zero Magic String** | Toàn bộ Reason Code dùng `ActionRejectReason` enum. |
| **Lean Observability** | Mọi state transition phải emit structured log: `{ event, correlationId, timestamp, delta }`. |

---

## PHẦN 3 — HỢP ĐỒNG KIỂM THỬ [TC-06.1 → TC-06.9]

> **Quy tắc Zero Bug-Codification**: Mọi assertion phải kiểm chứng ĐÚNG theo spec (`docs/requirements.md`). Nếu code fail, sửa code — KHÔNG bao giờ relax assertion.  
> **Adversarial Inversion**: Mỗi TC phải có bước "deliberate fail" — thay đổi một input sai và xác nhận test fail với lý do đúng.  
> **Consumer Verification**: Mỗi TC phải chứng minh consumer downstream xử lý đúng, không chỉ kiểm tra producer emit.

---

### TC-06.1 — CC_OVERDRAFT: Bộ Đếm 3 Vòng, Thu Hồi 3.300 Tr.

**Traceability:** [DEBT-S06-01] · [UC-GAME-058/MSS] · `docs/requirements.md §V.2.10`

**Tiền điều kiện (Preconditions):**
- Player P1 đang giữ thẻ `CC_OVERDRAFT` trong `hand[]`
- `Room.phase = TurnPhase.WaitingRoll`
- Thẻ đã được rút và bộ đếm `overdraftRoundsLeft = 3` đã được khởi tạo

**Kịch bản kiểm thử chính (Happy Path):**
```
Vòng 1: P1 đi qua GO → overdraftRoundsLeft giảm từ 3 → 2. balance KHÔNG bị trừ.
Vòng 2: P1 đi qua GO → overdraftRoundsLeft giảm từ 2 → 1. balance KHÔNG bị trừ.
Vòng 3: P1 đi qua GO → overdraftRoundsLeft giảm từ 1 → 0.
         → Tự động khấu trừ 3.300 Tr. VNĐ từ P1.balance.
         → CC_OVERDRAFT bị xóa khỏi P1.hand[].
```

**Điều kiện kích hoạt InsolvencyPhase:**
```
Nếu P1.balance - 3.300 < 0 sau vòng 3:
  → FSM chuyển sang TurnPhase.InsolvencyPhase
  → P1.pendingDebts[] ghi nhận khoản nợ OVERDRAFT
```

**Consumer Verification (bắt buộc):**
- Assert `P1.balance` bị trừ ĐÚNG 3.300 Tr. (không phải 3.000 Tr.)
- Assert `P1.hand` không còn `CC_OVERDRAFT`
- Assert `Room.treasury` KHÔNG nhận khoản này (trả về Bank, không vào Kho bạc)
- Assert FSM ở `InsolvencyPhase` khi `balance < 3.300` trước khi trừ

**Adversarial Inversion:**
- Thay `overdraftRoundsLeft` khởi tạo = 2 → Phải fail: bị trừ ở vòng 2, không phải vòng 3
- Thay số tiền thu hồi 3.000 Tr. (thiếu lãi 300 Tr.) → Phải fail: assert 3.300 không khớp

---

### TC-06.2 — CC_FREE_CREDIT: Trích Lãi 400 Tr. Mỗi Vòng Qua GO

**Traceability:** [DEBT-S06-02] · [UC-GAME-058/MSS] · `docs/requirements.md §V.2.16`

**Tiền điều kiện:**
- Player P1 đang giữ `CC_FREE_CREDIT` trong `hand[]`
- Thẻ đã được rút, P1 đã nhận 2.000 Tr. tiền mặt ban đầu
- `Room.treasury` có thể âm (test không cần cap treasury)

**Kịch bản kiểm thử chính:**
```
Mỗi lần P1 đi qua ô GO (checkPassedGo = true):
  1. Thu lãi định kỳ trước: P1.balance -= 400
  2. Sau đó nhận thưởng GO bình thường: P1.balance += 2.000
  → Net mỗi vòng qua GO: +1.600 Tr. (không phải +2.000 Tr.)
  → Room.treasury += 400 (lãi nộp vào Kho bạc)
```

**Consumer Verification (bắt buộc):**
- Assert thứ tự xử lý: lãi trừ TRƯỚC, thưởng GO cộng SAU
- Assert `Room.treasury` tăng đúng 400 mỗi vòng (không phải 0)
- Assert thẻ KHÔNG bị xóa khỏi `hand[]` sau mỗi vòng (hiệu lực suốt trận)
- Assert sau khi P1 phá sản, thẻ không còn trigger ở P1

**Adversarial Inversion:**
- Bỏ logic trừ lãi, chỉ cộng GO → Phải fail: balance tăng 2.000 thay vì 1.600
- Đưa lãi vào player ngẫu nhiên thay vì treasury → Phải fail: treasury không tăng

---

### TC-06.3 — CC_SLOW_BUILD: Đất C0 Quá 2 Vòng → Auto-Auction

**Traceability:** [DEBT-S06-03] · [UC-GAME-058/MSS] · `docs/requirements.md §V.2.18`

**Tiền điều kiện:**
- Player P1 rút thẻ `CC_SLOW_BUILD`
- P1 đang sở hữu ít nhất 1 ô đất Cấp 0 (level = 0)
- `unbuiltRounds` được khởi tạo = 0 trên ô đất đó

**Kịch bản kiểm thử chính:**
```
Vòng 1 P1 không nâng cấp: unbuiltRounds → 1. Đất vẫn thuộc P1.
Vòng 2 P1 không nâng cấp: unbuiltRounds → 2. Đất vẫn thuộc P1.
Vòng 3 P1 KHÔNG nâng cấp (unbuiltRounds > 2 điều kiện vi phạm):
  → PropertyRegistry xóa owner của ô đất C0
  → RoomManager kích hoạt AuctionSession cho toàn bàn cờ
  → AuctionSession.startingBid = listPrice * 0.50 (quy tắc đấu giá chuẩn)
  → Toàn bộ player (kể cả P1) được phép đặt giá
```

**Consumer Verification (bắt buộc):**
- Assert `PropertyRegistry.get(cellIndex) === undefined` sau thu hồi
- Assert `AuctionSession` được tạo với `startingBid = listPrice * 0.50`
- Assert tất cả players (kể cả cựu chủ P1) đều có thể đặt giá (`eligibleBidders` bao gồm P1)
- Assert `unbuiltRounds` reset = 0 khi P1 nâng cấp lên C1 trước vòng 3

**Adversarial Inversion:**
- Cho `unbuiltRounds` giữ nguyên không tăng → Phải fail: không kích hoạt auction ở vòng 3
- Loại P1 khỏi `eligibleBidders` → Phải fail: P1 có quyền đặt giá lại đất của mình

---

### TC-06.4 — InsolvencyManager: Auto-Auction Khởi Điểm 70% Niêm Yết

**Traceability:** [DEBT-S06-04] · [UC-GAME-056/MSS] · `docs/requirements.md §V.3` ("Cưỡng chế thanh lý: Ngân hàng bán đấu giá công khai ô đất khởi điểm từ 70% giá niêm yết")

**Tiền điều kiện:**
- Player P1 đang trong `TurnPhase.InsolvencyPhase`
- P1 có ít nhất 1 ô đất bị thế chấp (`mortgagedProperties[]` không rỗng)
- P1 không thể trả nợ sau liquidation tất cả tài sản

**Kịch bản kiểm thử chính:**
```
InsolvencyManager.liquidateAssets(P1):
  → Gọi AuctionSession với:
      startingBid = PROPERTY_DEEDS[cellIndex].listPrice * 0.70
      bidStep     = 100 Tr. (theo quy tắc chuẩn)
      eligibleBidders = tất cả players TRỪ P1 (người phá sản)
```

**Consumer Verification (bắt buộc):**
- Assert `startingBid = listPrice * 0.70` (KHÔNG phải 0.50 của auto-auction thông thường)
- Assert P1 (insolvent) KHÔNG được phép đặt giá trong phiên này
- Assert tiền đấu giá thanh toán nợ của P1, phần dư (nếu có) trả lại P1
- Assert `PropertyRegistry` sang tên đúng người thắng đấu giá

**Adversarial Inversion:**
- Dùng `startingBid = listPrice * 0.50` → Phải fail: vi phạm §V.3, assert 70% không khớp
- Cho P1 tham gia đặt giá → Phải fail: P1 bị loại khỏi eligibleBidders khi phá sản

---

### TC-06.5 — Phân Tách Module LOC: 3 Tệp ≤ 300 LOC Sau Refactor

**Traceability:** [DEBT-S06-05] · Kiến trúc Clean Architecture · `GEMINI.md §3 Categorized File Limits`

**Tiền điều kiện:**
- `property_manager.ts` hiện tại: 370 LOC (vi phạm ngưỡng 300 LOC)
- `card_handlers.ts` hiện tại: 355 LOC (vi phạm ngưỡng 300 LOC)
- `room_manager.ts` hiện tại: 338 LOC (vi phạm ngưỡng 300 LOC)

**Kịch bản kiểm thử chính:**
```
Sau refactor, đo LOC từng tệp:
  property_manager.ts     ≤ 300 LOC
  card_handlers.ts        ≤ 300 LOC
  room_manager.ts         ≤ 300 LOC
  [NEW] module con 1      ≤ 300 LOC
  [NEW] module con 2      ≤ 300 LOC
  [NEW] module con 3      ≤ 300 LOC (nếu cần)

Chạy toàn bộ test suite: 394/394 tests PASS
```

**Consumer Verification (bắt buộc):**
- Assert KHÔNG có test nào đổi import path mà không có lý do nghiệp vụ
- Assert tất cả public API hiện tại (`handleLanding`, `resolveRent`, `executeChanceCard`...) vẫn export đúng signature
- Assert zero circular dependency giữa các module con mới
- Assert LOC được đo bằng `wc -l` hoặc tương đương (không tính blank/comment)

**Adversarial Inversion:**
- Để nguyên `room_manager.ts` 338 LOC → Phải fail: LOC check vượt ngưỡng 300
- Split nhưng giới thiệu circular import → Phải fail: TypeScript compiler báo lỗi

---

### TC-06.6 — Refactor CC > 5: Cyclomatic Complexity ≤ 5

**Traceability:** [DEBT-S06-06] · `GEMINI.md §3 Complexity Limits` (CC ≤ 5, max 30 LOC/hàm)

**Tiền điều kiện:**
- 7 hàm được xác định vi phạm CC > 5 trong Milestone Deep Audit S00–S05
- Danh sách cụ thể do Builder xác định qua `eslint --complexity` trước khi implement

**Kịch bản kiểm thử chính:**
```
Chạy: eslint --rule 'complexity: ["error", 5]' src/**/*.ts
Kết quả: Zero lỗi complexity.

Mỗi hàm được refactor sang Strategy / Command Dispatcher:
  CC ≤ 5  (đo bằng eslint)
  LOC ≤ 30/hàm
```

**Consumer Verification (bắt buộc):**
- Assert behavior của từng hàm được refactor GIỐNG NHAU qua test regression
- Assert Strategy Pattern không giới thiệu abstraction layer thừa (YAGNI)
- Assert 394 tests vẫn PASS sau refactor

**Adversarial Inversion:**
- Để 1 hàm có CC = 6 → Phải fail: eslint báo lỗi complexity
- Refactor nhưng thay đổi behavior → Phải fail: regression test fail

---

### TC-06.7 — Dead Code Removal & Chuẩn Hóa ActionRejectReason

**Traceability:** [DEBT-S06-07] · [DEBT-S06-08] · [DEBT-S06-09] · `GEMINI.md §3 Prune Dead Code` & `No Magic Strings`

**Tiền điều kiện:**
- `CommunityChest`, `Jail`, `GoToJail` tồn tại là dead enum values không được reference
- `UTILITY_CELLS_ECE` là alias dư thừa không được dùng
- `sendToAudit` là No-Op wrapper trong `audit_manager.ts`
- Magic strings như `'MISSING_MONOPOLY'`, `'DECLINED_PLAYER_CANNOT_BID'` tồn tại inline

**Kịch bản kiểm thử chính:**
```
Sau cleanup:
  grep -r "CommunityChest" src/ → zero kết quả
  grep -r "GoToJail" src/       → zero kết quả
  grep -r "UTILITY_CELLS_ECE" src/ → zero kết quả
  grep -r "sendToAudit" src/    → zero kết quả
  grep -r "'MISSING_MONOPOLY'" src/ → zero kết quả
  tsc --noEmit                  → zero errors, zero warnings
```

**Consumer Verification (bắt buộc):**
- Assert toàn bộ Reason Code caller dùng `ActionRejectReason.XXX` enum value
- Assert `executeChanceCard` có kiểu trả về `void` được TypeScript verify
- Assert 394 tests PASS sau cleanup (không có test reference dead enum)

**Adversarial Inversion:**
- Giữ lại 1 dead enum value `GoToJail` → Phải fail: grep tìm thấy reference
- Để 1 magic string `'MISSING_MONOPOLY'` sót lại → Phải fail: grep tìm thấy literal string

---

### TC-06.8 — Bot AI Tự Hành Hóa: 3 Tính Cách Không Làm Treo FSM

**Traceability:** [UC-GAME-005/MSS] · [UC-GAME-008/MSS] · Bot AI Engine

**Tiền điều kiện:**
- `Room` có ít nhất 1 Bot player (được đánh dấu `isBot: true` hoặc tương đương)
- `Room.phase = TurnPhase.WaitingRoll` đến lượt Bot
- 3 tính cách: `BotPersonality.PASSIVE`, `BotPersonality.BALANCED`, `BotPersonality.AGGRESSIVE`

**Kịch bản TC-06.8a — Tính Cách Thụ Động (PASSIVE):**
```
Bot PASSIVE đến lượt:
  → Tự động emit Intent: INTENT_ROLL (đổ xúc xắc)
  → Nếu FSM chuyển sang ActionPhase (đất trống, có thể mua):
      → Tự động emit Intent: INTENT_DECLINE (bỏ qua mua)
  → Nếu FSM ở PropertyManagement:
      → Tự động emit Intent: INTENT_END_TURN
  → Không bao giờ emit INTENT_BUY, INTENT_UPGRADE, INTENT_MORTGAGE
```

**Kịch bản TC-06.8b — Tính Cách Cân Bằng (BALANCED):**
```
Bot BALANCED đến lượt, dừng tại ô đất trống giá 1.000 Tr.:
  Điều kiện: balance ≥ 1.000 × 1.20 = 1.200 Tr. (ngưỡng 20% đệm)
  → Tự động emit Intent: INTENT_BUY
  Điều kiện: balance < 1.200 Tr.
  → Tự động emit Intent: INTENT_DECLINE
```

**Kịch bản TC-06.8c — Tính Cách Hung Hăng (AGGRESSIVE):**
```
Bot AGGRESSIVE có đủ bộ màu và đủ tiền nâng cấp:
  → PropertyManagement: Tự động emit INTENT_UPGRADE cho từng ô còn có thể nâng
  → Ưu tiên nâng ô có rent cao nhất trước
  → Dừng khi balance < chi phí nâng cấp ô tiếp theo
```

**Consumer Verification (bắt buộc):**
- Assert Bot action đi qua `IntentDispatcher` → `FSM` (không mutate state trực tiếp)
- Assert `Room.phase` chuyển đúng trạng thái sau mỗi Bot action
- Assert không xảy ra infinite loop khi Bot liên tục emit và FSM không tiến triển
- Assert Bot dùng `mulberry32` PRNG của session (không gọi `Math.random()`)

**Adversarial Inversion:**
- Bot PASSIVE emit INTENT_BUY → Phải fail: vi phạm hành vi Thụ Động
- Bot mutate `player.balance` trực tiếp không qua FSM → Phải fail: bất biến bảo toàn bị phá vỡ
- Xóa timeout guard → Kiểm tra FSM không treo sau 100 vòng Bot liên tiếp

---

### TC-06.9 — Module i18n vi.ts: Toàn Bộ String Qua Từ Điển Tiếng Việt

**Traceability:** [DEBT-S06-10] · `docs/requirements.md §V` (36 thẻ sự kiện) · `GEMINI.md §3 No Magic Strings`

**Tiền điều kiện:**
- Module `src/domain/i18n/vi.ts` được tạo mới [NEW]
- Bao gồm đủ 16 Market Cards + 20 Chance Cards = 36 thẻ
- Bao gồm toàn bộ `ActionRejectReason` enum values
- Bao gồm toàn bộ `TurnPhase` labels

**Kịch bản kiểm thử chính:**
```
import { vi } from 'src/domain/i18n/vi';

// Fixture Contract Test — 36 thẻ sự kiện
MarketCardId values (16):  mỗi ID có vi.marketCards[id] !== undefined
ChanceCardId values (20):  mỗi ID có vi.chanceCards[id] !== undefined

// Fixture Contract Test — Reason Codes
ActionRejectReason values: mỗi enum value có vi.rejectReasons[reason] !== undefined

// Zero hardcoded English string
grep -r "'[A-Z][a-z]" src/**/*.ts | grep -v "vi.ts" | grep -v ".test." → zero kết quả
```

**Consumer Verification (bắt buộc):**
- Assert `vi.marketCards` có đủ 16 entries, mỗi entry là chuỗi tiếng Việt không rỗng
- Assert `vi.chanceCards` có đủ 20 entries, mỗi entry là chuỗi tiếng Việt không rỗng
- Assert tên thẻ trong `vi.ts` KHỚP 100% với tên trong `docs/requirements.md §V` (Fixture Contract Test)
- Assert KHÔNG còn string tiếng Anh hiển thị người dùng trong `card_handlers.ts`, `room_manager.ts`

**Adversarial Inversion:**
- Xóa 1 entry (ví dụ `CC_OVERDRAFT`) khỏi `vi.ts` → Phải fail: Fixture Contract Test thiếu key
- Đặt tên tiếng Anh `"Overdraft"` thay vì tiếng Việt → Phải fail: i18n contract vi phạm

---

## PHẦN 4 — DEFINITION OF DONE

Slice 06 được coi là **HOÀN THÀNH (DONE)** khi tất cả 6 điều kiện sau được thỏa mãn đồng thời:

### DoD-1: Automated Tests
- [ ] **394+ tests PASS** (bao gồm tests mới cho TC-06.1 → TC-06.9)
- [ ] **Adversarial Inversion** cho mỗi TC-06.X đã được thực hiện và ghi lại kết quả fail có chủ ý
- [ ] Mỗi test có **tag traceability** `[UC-GAME-XXX/MSS]` hoặc `[DEBT-S06-XX]`
- [ ] **Fixture Contract Tests** khớp 100% SSOT (`docs/requirements.md §V` cho 36 thẻ, `docs/domain/entity_model.md` cho 28 Title Deeds)
- [ ] Test suite chạy với `--randomize` (zero order-dependency)

### DoD-2: Code Quality — 6 Slop Red Flags
- [ ] **LOC ≤ 300** cho mỗi tệp sau refactor (không code-golf, không No-Op stub)
- [ ] **Cyclomatic Complexity ≤ 5** (eslint `complexity` rule) cho mỗi hàm
- [ ] **Zero dead cast** (`as unknown as T`, raw `any`, compiler bypass hack)
- [ ] **Zero magic string** (toàn bộ Reason Codes → `ActionRejectReason` enum)
- [ ] **Zero No-Op stub** (xóa `sendToAudit` và các wrapper rỗng)
- [ ] **Zero TypeScript warning** (`tsc --noEmit` sạch hoàn toàn)

### DoD-3: spec-reviewer APPROVE
- [ ] **100% Three-Way Spec Reconciliation**: Code ↔ Test ↔ `docs/requirements.md` (SSOT)
- [ ] Không có khoản nợ kỹ thuật mới phát sinh trong phạm vi Slice 06
- [ ] Orphaned tech debt (DEBT-S06-01..10) đã được giải quyết 100%
- [ ] Zero scope drift (không implement gì ngoài phạm vi ĐƯỢC PHÉP)

### DoD-4: code-reviewer APPROVE
- [ ] **Architecture boundaries**: Bot AI Engine gọi `IntentDispatcher` đúng interface, không bypass FSM
- [ ] **Lean Observability**: Mọi Bot action, CC trigger, và module refactor emit structured log
- [ ] **Separation of Concerns**: Module con mới có single responsibility rõ ràng
- [ ] **Zero circular dependency** giữa các module sau refactor
- [ ] **Bất biến bảo toàn dòng tiền** được verify qua kiểm tra toán học trong test

### DoD-5: Epic Ledger Cập Nhật
- [ ] `docs/epics/gameplay/_epic_ledger.md` — Slice 06 cập nhật:
  - `Lifecycle Status: Done (YYYY-MM-DD)`
  - `Test Coverage: XXX/XXX tests PASS · XX files`
  - `Deliverables: [danh sách tệp thực tế + LOC]`
  - Tech Debt Ledger: DEBT-S06-01..10 → tất cả đánh dấu ✅ ĐÃ GIẢI QUYẾT

### DoD-6: Domain Gotchas
- [ ] Mọi **edge case mới phát hiện** trong quá trình implement Slice 06 được ghi vào `docs/domain/gotchas.md` theo định dạng chuẩn:

```
## [Ngày] [Module] — [Tiêu đề ngắn]
**Triệu chứng:** ...
**Nguyên nhân gốc:** ...
**Giải pháp áp dụng:** ...
**Phòng ngừa:** ...
```

---

## PHỤ LỤC A — DANH SÁCH 10 KHOẢN NỢ KỸ THUẬT S06

| Mã | Mô tả ngắn | Tệp chính | TC liên quan |
|----|------------|-----------|--------------|
| **DEBT-S06-01** | Bộ đếm 3 vòng thu hồi nợ 3.300 Tr. cho CC_OVERDRAFT + kích hoạt InsolvencyPhase | `card_handlers.ts` | TC-06.1 |
| **DEBT-S06-02** | Trích lãi 400 Tr./vòng qua GO nộp Kho bạc cho CC_FREE_CREDIT | `card_handlers.ts`, `room_manager.ts` | TC-06.2 |
| **DEBT-S06-03** | Thuộc tính `unbuiltRounds` đếm C0 quá 2 vòng không xây → Auto-Auction CC_SLOW_BUILD | `property_manager.ts` | TC-06.3 |
| **DEBT-S06-04** | Auto-Auction khởi điểm 70% niêm yết trong InsolvencyManager (UC-GAME-056) | `insolvency_manager.ts` | TC-06.4 |
| **DEBT-S06-05** | Phân tách 3 tệp > 300 LOC thành module con đơn nhiệm < 300 LOC | `property_manager.ts`, `card_handlers.ts`, `room_manager.ts` | TC-06.5 |
| **DEBT-S06-06** | Refactor 7 hàm CC > 5 sang Strategy Pattern / Command Dispatcher | Các module con mới | TC-06.6 |
| **DEBT-S06-07** | Xóa dead enum (CommunityChest, Jail, GoToJail) và alias UTILITY_CELLS_ECE | `board_config.ts`, `event_card_types.ts` | TC-06.7 |
| **DEBT-S06-08** | Xóa No-Op wrapper `sendToAudit`, chuẩn hóa kiểu `void` cho `executeChanceCard` | `audit_manager.ts`, `card_handlers.ts` | TC-06.7 |
| **DEBT-S06-09** | Chuẩn hóa toàn bộ Magic String Reason Codes → `enum ActionRejectReason` | `action_reasons.ts`, tất cả caller | TC-06.7 |
| **DEBT-S06-10** | Xây dựng module từ điển `src/domain/i18n/vi.ts`: 36 thẻ + mã lỗi | `vi.ts` [NEW] | TC-06.9 |

---

## PHỤ LỤC B — CẤU TRÚC MODULE DỰ KIẾN SAU REFACTOR

```
src/
├── domain/
│   ├── room.ts                     (hiện tại: 109L — giữ nguyên)
│   ├── board_config.ts             (cleanup dead alias)
│   ├── event_card_types.ts         (cleanup dead enum)
│   ├── action_reasons.ts           (mở rộng enum ActionRejectReason)
│   ├── property_manager.ts         (refactor → ≤ 300L)
│   ├── card_handlers.ts            (refactor → ≤ 300L)
│   └── i18n/
│       └── vi.ts                   [NEW] (từ điển 36 thẻ + mã lỗi)
├── server/
│   ├── room_manager.ts             (refactor → ≤ 300L)
│   ├── audit_manager.ts            (xóa sendToAudit No-Op)
│   ├── insolvency_manager.ts       (thêm Auto-Auction 70%)
│   ├── auction_manager.ts          (giữ nguyên interface)
│   └── bot_engine.ts               [NEW] (3 tính cách Bot AI)
└── [module con phân tách TBD bởi Builder]
```

> **Lưu ý cho Builder:** Tên cụ thể của các module con phân tách do Builder quyết định sao cho Single Responsibility rõ ràng và không circular dependency. Tên module con PHẢI được ghi vào `_epic_ledger.md` sau khi hoàn thành.

---

## PHỤ LỤC C — BẢNG KIỂM TRA TRƯỚC KHI SUBMIT

```
[ ] tsc --noEmit          → 0 errors, 0 warnings
[ ] eslint complexity      → 0 violations (CC ≤ 5)
[ ] wc -l src/**/*.ts      → mọi tệp ≤ 300 LOC
[ ] grep "CommunityChest"  → 0 kết quả
[ ] grep "sendToAudit"     → 0 kết quả
[ ] grep "'MISSING_"       → 0 kết quả (magic string sót)
[ ] vitest run             → 394+ tests PASS
[ ] _epic_ledger.md        → Slice 06 cập nhật đầy đủ
[ ] gotchas.md             → edge case mới ghi nhận
```

---

## PHỤ LỤC D — LAYER PROPAGATION CHECKLIST (Vertical Slice Completeness)

> Checklist này đảm bảo mọi field mới thêm vào `Player` hoặc `PropertyState` đều được propagate đồng bộ qua **toàn bộ tầng kiến trúc** (Domain → Server → DeltaPayload → Client). Vi phạm sẽ gây silent drop bug.

---

### VSC-A: Field `isBot?: boolean` — Player Interface

**Nguồn phát sinh:** Spec-Reviewer BLOCKER-1 · TC-06.8 (Bot AI 3 tính cách)

**Lý do cần VSC:** `Player` interface trong `room.ts` không có field `isBot`. TC-06.8 dùng `isBot: true` để phân biệt Bot vs Human nhưng field này không tồn tại → TypeScript strict mode báo lỗi compile-time ngay lập tức.

| Tầng | Tệp | Thay đổi cần thiết | Đã làm |
|------|----|---------------------|--------|
| **Domain** | `src/domain/room.ts` — `Player` interface | Thêm `isBot?: boolean` | `[ ]` |
| **Domain** | `src/domain/room.ts` — `createPlayer()` | Khởi tạo `isBot: false` (mặc định Human) | `[ ]` |
| **Server Delta** | `src/server/session_manager.ts` — `PlayerDelta` type | Thêm `isBot?: boolean` | `[ ]` |
| **Server Delta** | `src/server/session_manager.ts` — `buildDeltaFromRoom()` | Map `player.isBot → PlayerDelta.isBot` | `[ ]` |
| **Client (Out-of-scope S06)** | Client R3F component | Nhận `isBot` để hiển thị icon Bot trên bàn cờ | Deferred → Slice 07 |

**Verification sau VSC-A:**
```typescript
// TC: createPlayer() phải luôn trả về isBot = false theo mặc định
const p = createPlayer('p1');
expect(p.isBot).toBe(false);

// TC: Bot player có isBot = true sau khi bot_engine tạo
const bot = createPlayer('bot-1');
bot.isBot = true;                         // bot_engine.ts set
expect(buildDeltaFromRoom(room).players.find(d => d.id === 'bot-1')?.isBot).toBe(true);
```

---

### VSC-B: Field `overdraftRoundsLeft?: number` — Player Interface

**Nguồn phát sinh:** Spec-Reviewer BLOCKER-2 · TC-06.1 (CC_OVERDRAFT bộ đếm 3 vòng)

**Lý do cần VSC:** Logic bộ đếm `overdraftRoundsLeft` được mô tả trong TC-06.1 nhưng field này không có trong `Player` interface. Nếu không thêm field, server phải lưu counter bên ngoài state (ngoài `Room`) — vi phạm Server-authoritative FSM và phá vỡ session recovery sau reconnect.

| Tầng | Tệp | Thay đổi cần thiết | Đã làm |
|------|----|---------------------|--------|
| **Domain** | `src/domain/room.ts` — `Player` interface | Thêm `overdraftRoundsLeft?: number` | `[ ]` |
| **Domain** | `src/domain/room.ts` — `createPlayer()` | Khởi tạo `overdraftRoundsLeft: 0` (mặc định không nợ) | `[ ]` |
| **Server Delta** | `src/server/session_manager.ts` — `PlayerDelta` type | Thêm `overdraftRoundsLeft?: number` | `[ ]` |
| **Server Delta** | `src/server/session_manager.ts` — `buildDeltaFromRoom()` | Map `player.overdraftRoundsLeft → PlayerDelta.overdraftRoundsLeft` | `[ ]` |
| **Client (Out-of-scope S06)** | Client HUD component | Hiển thị cảnh báo countdown nợ cho người chơi | Deferred → Slice 07 |

**Verification sau VSC-B:**
```typescript
// TC: createPlayer() → overdraftRoundsLeft khởi tạo = 0
const p = createPlayer('p1');
expect(p.overdraftRoundsLeft).toBe(0);

// TC: Sau rút CC_OVERDRAFT, field được set = 3
// (handler trong card_handlers.ts set player.overdraftRoundsLeft = 3)
expect(p.overdraftRoundsLeft).toBe(3);

// TC: DeltaPayload truyền đúng giá trị
expect(buildDeltaFromRoom(room).players.find(d => d.id === 'p1')?.overdraftRoundsLeft).toBe(3);
```

---

### WARN-1 (Giải thích): `freeCreditActive` — Chiến lược lưu trạng thái CC_FREE_CREDIT

**Quyết định thiết kế:** CC_FREE_CREDIT **KHÔNG** cần field `freeCreditActive: boolean` riêng.  
Trạng thái "đang nợ lãi định kỳ" được biểu diễn bằng: `player.hand.includes(ChanceCardId.CC_FREE_CREDIT)`.  
Handler tại `checkPassedGo` kiểm tra `player.hand` — nếu có thẻ → trừ 400 Tr.  
Thẻ chỉ bị xóa khỏi `hand[]` khi game kết thúc hoặc player phá sản.  
**Không cần field bổ sung.**

---

### WARN-2 (Giải thích): `unbuiltRounds` trong PropertyState — DeltaPayload.CellDelta

**Quyết định thiết kế:** `unbuiltRounds` thuộc `PropertyState` (nằm trong `propertyStates` Map của `RoomManager`).  
`CellDelta` trong `DeltaPayload` **cần bổ sung** `unbuiltRounds?: number` để Client hiển thị countdown cho người chơi biết đất bị nguy cơ thu hồi.

| Tầng | Tệp | Thay đổi |
|------|-----|---------|
| **Domain** | `src/domain/property_manager.ts` — `PropertyState` | Thêm `unbuiltRounds?: number` (khởi tạo = 0) |
| **Server Delta** | `src/server/session_manager.ts` — `CellDelta` type | Thêm `unbuiltRounds?: number` |
| **Server Delta** | `src/server/session_manager.ts` — `buildDeltaFromRoom()` | Map `propertyState.unbuiltRounds → CellDelta.unbuiltRounds` |
| **Client** | Client bàn cờ 3D | Hiển thị badge cảnh báo (Deferred → Slice 07) |

---

### WARN-3 (Giải thích): `vi.ts` — Intended Consumer Chain

**Luồng sử dụng của module `src/domain/i18n/vi.ts`:**

```
[Domain Layer]                [Server Layer]               [Client Layer]
vi.ts (từ điển)  →  card_handlers.ts (log lỗi)  →  DeltaPayload.message  →  React UI hiển thị
                 →  action_reasons.ts (reject)   →  socket event payload
                 →  bot_engine.ts (log hành động Bot)
```

`vi.ts` là module **Domain-only** — không import bất kỳ Server hoặc Client module nào. Server và Client import từ `vi.ts` theo chiều một chiều. Đây là dependency rule bắt buộc theo Clean Architecture.

---

*Ticket soạn thảo bởi Feature Slicer · 2026-09-09 · Phiên bản 1.1 (Revised)*  
*Vá: BLOCKER-1 (VSC-A isBot), BLOCKER-2 (VSC-B overdraftRoundsLeft), WARN-1/2/3 giải thích rõ*  
*Đang chờ phê duyệt: spec-reviewer · code-reviewer*

> **[REVISED — READY FOR RE-REVIEW]**

