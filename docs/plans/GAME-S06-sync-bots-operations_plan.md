# Kế Hoạch Thi Công — GAME-S06 Sync Bots & Vận Hành Nội Bộ

**Phiên bản:** 1.0  
**Ngày soạn:** 2026-09-09  
**Kiến trúc sư:** Architect Subagent  
**Nguồn đầu vào:**
- Báo cáo Scout: `brain/scout_report_s06.md`
- Ticket đặc tả: `issues/GAME-S06-sync-bots-operations.md` (v1.1 — APPROVED)
- Sổ cái Epic: `docs/epics/gameplay/_epic_ledger.md` (Slice 06, L146-179)

**Điểm xuất phát:** 394/394 tests PASS · 33 suites · TypeScript 0 errors

---

## Sơ Đồ DAG 6 Micro-Tasks

```
TASK 1: Tái Cấu Trúc Barrel Re-export
   └─► GATE 1: 394/394 PASS (zero regression)
         │
         ▼
TASK 2: Dead Code + i18n + ActionRejectReason
   └─► GATE 2: Tests PASS + tsc clean + grep clean
         │
         ▼
TASK 3: VSC Lan Truyền Đa Tầng (isBot, overdraftRoundsLeft, unbuiltRounds)
   └─► GATE 3: delta_payload_vsc.test.ts 3 fields PASS
         │
         ▼
TASK 4: Khép Vòng 3 Cơ Chế Nợ CC + Auto-Auction 70%
   └─► GATE 4: TC-06.1..4 RED → GREEN (TDD)
         │
         ▼
TASK 5: Bot AI Engine 3 Tính Cách
   └─► GATE 5: TC-06.8 + bot_engine.test.ts PASS
         │
         ▼
TASK 6: E2E Hội Tụ + Adversarial Inversion + Bàn Giao
   └─► GATE 6: 394+ tests PASS + Epic Ledger cập nhật
```

**Nguyên tắc thực thi:**
- Builder bắt đầu TASK N+1 chỉ khi GATE N đã PASS.
- Mỗi TASK là atomic — không trộn lẫn domain của task khác.
- TDD Red-Green-Refactor bắt buộc từ TASK 4 trở đi.

---

## TASK 1 — Tái Cấu Trúc Phân Tách 3 Module Quá Tải & Barrel Re-export

**DEBT Refs:** DEBT-S06-05, DEBT-S06-06  
**TC Refs:** TC-06.5, TC-06.6  
**Ưu tiên:** THỰC HIỆN ĐẦU TIÊN — nền tảng cho mọi task sau.

### 1.1 Phân tách `src/domain/property_manager.ts` (376L → ≤ 280L)

**Kiến trúc mục tiêu:**
```
src/domain/
  property_manager.ts       ← barrel re-export (< 30L) + buyProperty + handleLanding + interfaces
  property_data.ts          [NEW] (~60L)
  property_rent.ts          [NEW] (~120L)
  property_upgrade.ts       [NEW] (~90L)
```

**Chi tiết phân tách theo tọa độ Scout:**

| Hàm / Symbol | Tọa độ gốc | Di chuyển tới |
|---|---|---|
| `PROPERTY_DEEDS`, `PURCHASABLE`, `isPurchasable` | L39–L92 | `property_data.ts` |
| `hasZeroRent`, `calculateRent`, `applyC2Surcharge`, `applyServiceBonus`, `tryUseDiplomaticCard` | L118–L181 | `property_rent.ts` |
| `resolveRent`, `calcRailroadFee`, `calcUtilityFee`, `calculateGoPropertyTax` | L257–L375 | `property_rent.ts` |
| `upgradeProperty`, `downgradeProperty`, `upgradeETC`, `upgradeUtilityFull` | L283–L341 | `property_upgrade.ts` |
| `buyProperty`, `handleLanding` + enums + interfaces | L96–L113, L183–L235, L9–L35 | Giữ tại `property_manager.ts` |

**Barrel re-export (`property_manager.ts` sau phân tách):**
```typescript
// Barrel re-export — bảo toàn 100% import paths cho 12 test files
export * from './property_data';
export * from './property_rent';
export * from './property_upgrade';
// Giữ local: buyProperty, handleLanding, LandingResult, BuyResult, PropertyDeed, PropertyRegistry
```

> Kiểm tra zero circular dependency: `property_rent.ts` import từ `property_data.ts`, KHÔNG ngược lại.

---

### 1.2 Phân tách `src/domain/card_handlers.ts` (355L → ≤ 280L)

**Kiến trúc mục tiêu:**
```
src/domain/
  card_handlers.ts           ← barrel re-export (< 10L)
  market_card_handlers.ts    [NEW] (~120L) — CC ≤ 5 sau Command Dispatcher
  chance_card_handlers.ts    [NEW] (~170L) — CC ≤ 5 sau Command Dispatcher
```

**Chi tiết phân tách:**

| Hàm / Symbol | Tọa độ gốc | Di chuyển tới |
|---|---|---|
| `handleMegaConcert`, `handlePublicInvest`, `handleCasinoPilot`, `handleFireInspection`, `executeMarketCard` | L26–L147 | `market_card_handlers.ts` |
| `handleTaxAudit`, `handleContractPenalty`, `handleFranchise`, `handleLandReclaim`, `handleMaForce`, `handleSwapProject`, `executeChanceCard` | L149–L353 | `chance_card_handlers.ts` |

**CC > 5 cần giải quyết trong 2 dispatchers:**
- `executeMarketCard` switch 16 case (CC khoảng 18) → dùng Record/Map dispatcher
- `executeChanceCard` switch 20 case (CC khoảng 22) → tương tự Record dispatcher
- Đổi kiểu trả về `executeChanceCard`: `Record<string, never>` → `void` (DEBT-S06-08)

**Barrel re-export (`card_handlers.ts` sau phân tách):**
```typescript
export * from './market_card_handlers';
export * from './chance_card_handlers';
```

---

### 1.3 Phân tách `src/server/room_manager.ts` (338L → ≤ 230L)

**Kiến trúc mục tiêu:**
```
src/server/
  room_manager.ts     ← RoomManager class thin orchestrator (~180L)
  turn_loop.ts        [NEW] (~120L) — executeTurnRoll + executeTurnEnd
```

**Chi tiết phân tách:**

| Hàm | Tọa độ gốc | Di chuyển tới |
|---|---|---|
| `handleRollDice` logic (bên trong) | L109–L157 | Hàm thuần `executeTurnRoll(...)` trong `turn_loop.ts` |
| `handleEndTurn` logic (bên trong) | L276–L309 | Hàm thuần `executeTurnEnd(...)` trong `turn_loop.ts` |
| Tất cả phần còn lại | — | Giữ tại `room_manager.ts` |

**Giao diện `turn_loop.ts`:**
```typescript
export function executeTurnRoll(
  room: Room, current: Player, reg: PropertyRegistry,
  sm: PropertyStateMap, rng: () => number, deckRng: () => number,
): RollResult;

export function executeTurnEnd(
  room: Room, current: Player, rolledThisTurn: boolean,
  continueDoubles: boolean,
): { advanced: boolean };
```

> 13 test files import `room_manager` không cần sửa import path (barrel giữ nguyên class).

---

### Gate 1 — Tiêu Chí Nghiệm Thu

```bash
cmd /c "npx vitest run --sequence.shuffle & npx tsc --noEmit"
```

| Tiêu chí | Điều kiện Pass |
|---|---|
| Tests | 394/394 PASS (zero regression) |
| TypeScript | 0 errors, 0 warnings |
| LOC mỗi file | ≤ 300 LOC |
| Circular dependency | 0 (TypeScript compiler xác nhận) |
| Import paths test | Không có test file nào thay đổi import path |

---

## TASK 2 — Dọn Dẹp Dead Code, No-Op, Chuẩn Hóa Mã Lỗi & Từ Điển i18n

**DEBT Refs:** DEBT-S06-07, DEBT-S06-08, DEBT-S06-09, DEBT-S06-10  
**TC Refs:** TC-06.7, TC-06.9

### 2.1 Xóa Dead Enum (DEBT-S06-07)

**File:** `src/domain/board_config.ts`

| Hành động | Vị trí | Ghi chú |
|---|---|---|
| Xóa `CommunityChest = 'CommunityChest'` | L9 | Không ô nào trong 40 ô dùng |
| Xóa `GoToJail = 'GoToJail'` | L14 | Không ô nào trong 40 ô dùng |

**File:** `tests/domain/board_config.test.ts` — Xóa assertions L39 và L41 (dead enum values không còn tồn tại).

---

### 2.2 Xóa Alias Dư Thừa (DEBT-S06-07)

- `src/domain/event_card_types.ts` L49: Xóa `export const UTILITY_CELLS_ECE = UTILITY_CELLS;`
- `src/domain/event_card_engine.ts` L18: Xóa `UTILITY_CELLS_ECE,` khỏi import list
- `tests/domain/event_card_engine.test.ts` L21,L56: Xóa import + assertion `UTILITY_CELLS_ECE`

---

### 2.3 Xóa No-Op Wrapper (DEBT-S06-08)

- `src/server/room_manager.ts` L96: Xóa phương thức wrapper `sendToAudit`
- Xóa `sendToAudit` khỏi import tại L16 nếu không còn caller nào khác trong file
- Hàm `audit_manager.sendToAudit()` tại `audit_manager.ts#L7` GIỮ NGUYÊN

---

### 2.4 Chuẩn Hóa Magic String → ActionRejectReason (DEBT-S06-09)

Quét và thay thế toàn bộ magic strings ('MISSING_MONOPOLY', 'NOT_OWNER', 'INVALID_ROOM'...) bằng `ActionRejectReason.XXX` enum values. Mở rộng `src/domain/action_reasons.ts` với các Reason Code còn thiếu.

---

### 2.5 Tạo Module Từ Điển i18n (DEBT-S06-10)

**File mới:** `src/domain/i18n/vi.ts` [NEW] (~80L)

Cấu trúc: `export const vi = { marketCards: Record<MarketCardId, string>, chanceCards: Record<ChanceCardId, string>, rejectReasons: Record<ActionRejectReason, string>, turnPhases: Record<TurnPhase, string> }`

- 16 MarketCardId entries (khớp 100% tên trong `docs/requirements.md §V`)
- 20 ChanceCardId entries
- Tất cả ActionRejectReason values
- Tất cả TurnPhase labels
- vi.ts là Domain-only — KHÔNG import Server hoặc Client module

---

### Gate 2 — Tiêu Chí Nghiệm Thu

| Tiêu chí | Điều kiện Pass |
|---|---|
| Tests | ≥ 392 PASS |
| TypeScript | 0 errors, 0 warnings |
| `grep -r "CommunityChest" src/` | 0 kết quả |
| `grep -r "GoToJail" src/` | 0 kết quả |
| `grep -r "UTILITY_CELLS_ECE" src/` | 0 kết quả |
| `grep -r "sendToAudit" src/server/room_manager.ts` | 0 kết quả |
| `grep -rn "'MISSING_MONOPOLY'" src/` | 0 kết quả |
| vi.ts | 16+20 entries, mọi key đúng enum type |

---

## TASK 3 — Lan Truyền Đa Tầng Vertical Slice Completeness

**DEBT Refs:** VSC-A (isBot), VSC-B (overdraftRoundsLeft), WARN-2 (unbuiltRounds)  
**TC Refs:** TC-06.1 (overdraftRoundsLeft), TC-06.8 (isBot)

### 3.1 VSC-A — `isBot?: boolean` (5 tầng)

| Bước | File | Vị trí | Thay đổi |
|---|---|---|---|
| 1 | `src/domain/room.ts` | L42 (sau mortgageLoans) | Thêm `isBot?: boolean` vào Player interface |
| 2 | `src/domain/room.ts` | `createPlayer()` L79 | Khởi tạo `isBot: false` |
| 3 | `src/server/session_manager.ts` | `PlayerDelta` L32 | Thêm `readonly isBot?: boolean` |
| 4 | `src/server/session_manager.ts` | `buildDeltaFromRoom()` L70-75 | Map `p.isBot` nếu true |
| 5 | Client | — | Deferred → Slice 07 |

### 3.2 VSC-B — `overdraftRoundsLeft?: number` (5 tầng)

| Bước | File | Vị trí | Thay đổi |
|---|---|---|---|
| 1 | `src/domain/room.ts` | L42 | Thêm `overdraftRoundsLeft?: number` vào Player interface |
| 2 | `src/domain/room.ts` | `createPlayer()` L79 | Khởi tạo `overdraftRoundsLeft: 0` |
| 3 | `src/server/session_manager.ts` | `PlayerDelta` L32 | Thêm `readonly overdraftRoundsLeft?: number` |
| 4 | `src/server/session_manager.ts` | `buildDeltaFromRoom()` | Map `p.overdraftRoundsLeft` nếu > 0 |
| 5 | Client HUD | — | Deferred → Slice 07 |

### 3.3 WARN-2 — `unbuiltRounds?: number` trong PropertyState (4 tầng)

| Bước | File | Thay đổi |
|---|---|---|
| 1 | `src/domain/property_manager.ts` (hoặc `property_data.ts`) | Thêm `unbuiltRounds?: number` vào `PropertyState` |
| 2 | `src/server/session_manager.ts` | Thêm `unbuiltRounds?: number` vào `CellDelta` |
| 3 | `src/server/session_manager.ts` | Map `state?.unbuiltRounds` trong `buildDeltaFromRoom()` |
| 4 | Client bàn cờ 3D | Deferred → Slice 07 |

---

### Gate 3 — Tiêu Chí Nghiệm Thu

Thêm 3 assertions vào `tests/server/delta_payload_vsc.test.ts`:

| Assertion | Điều kiện Pass |
|---|---|
| `createPlayer().isBot === false` | PASS |
| Bot player: `buildDeltaFromRoom().players.find(isBot=true)?.isBot === true` | PASS |
| `createPlayer().overdraftRoundsLeft === 0` | PASS |
| Player overdraft 3: `delta.players.overdraftRoundsLeft === 3` | PASS |
| `unbuiltRounds` trong CellDelta khi PropertyState có giá trị | PASS |

---

## TASK 4 — Khép Vòng 3 Cơ Chế Nợ CC & Auto-Auction 70% (TDD)

**DEBT Refs:** DEBT-S06-01, 02, 03, 04  
**TC Refs:** TC-06.1, TC-06.2, TC-06.3, TC-06.4

### 4.1 CC_OVERDRAFT — Bộ Đếm 3 Vòng (DEBT-S06-01)

**Luồng implement:**
```
Handler CC_OVERDRAFT (chance_card_handlers.ts):
  → player.balance += 3.000
  → player.pendingDebts.push(CC_OVERDRAFT)
  → player.overdraftRoundsLeft = 3

processPendingDebts() gọi trong turn_loop.ts mỗi vòng qua GO:
  → overdraftRoundsLeft -= 1
  → Nếu overdraftRoundsLeft === 0:
      player.balance -= 3.300  (gốc 3.000 + lãi 300)
      Xóa CC_OVERDRAFT khỏi pendingDebts
      Nếu balance < 0: checkInsolvency(room)
```

### 4.2 CC_FREE_CREDIT — Lãi 400 Tr./Vòng Qua GO (DEBT-S06-02)

```
Handler CC_FREE_CREDIT:
  → player.balance += 2.000
  → player.hand.push(CC_FREE_CREDIT)  (KHÔNG vào pendingDebts)

processPendingDebts() mỗi vòng qua GO:
  → Nếu player.hand.includes(CC_FREE_CREDIT):
      player.balance -= 400  (TRƯỚC)
      room.treasury += 400
      (GO_BONUS được cộng SAU trong luồng chính)
```

### 4.3 CC_SLOW_BUILD — unbuiltRounds > 2 → Auto-Auction (DEBT-S06-03)

```
Handler CC_SLOW_BUILD:
  → Tìm ô C0 của player
  → Đặt stateMap[cellIndex].unbuiltRounds = 1  (bắt đầu đếm)

executeTurnEnd() (turn_loop.ts) sau mỗi lượt:
  → Với mỗi ô C0 có unbuiltRounds > 0 của player vừa kết thúc:
      unbuiltRounds += 1
      Nếu unbuiltRounds > 2:
          registry.delete(cellIndex)
          stateMap[cellIndex].unbuiltRounds = 0
          openAuction(room, cellIndex, listPrice * 0.50)
```

### 4.4 Auto-Auction 70% InsolvencyManager (DEBT-S06-04)

**File:** `src/server/insolvency_manager.ts`
```
liquidateAssets() khi gọi auction:
  → startingBid = PROPERTY_DEEDS.get(cellIndex).price * 0.70
  → eligibleBidders = tất cả players TRỪ player insolvent
```

**File:** `src/server/auction_manager.ts` — thêm tham số `forcedLiquidation: boolean` vào `createAuction()` để phân biệt 70% vs 50%.

---

### Gate 4 — Tiêu Chí Nghiệm Thu (TDD)

Thứ tự TDD bắt buộc: Viết test RED → Confirm fail đúng lý do → Implement → Confirm GREEN.

| TC | Assertion chính | Adversarial |
|---|---|---|
| TC-06.1 | Trừ 3.300 (không phải 3.000) sau vòng 3 | Khởi tạo rounds=2 → fail ở vòng 2 |
| TC-06.2 | treasury += 400 mỗi vòng GO, thứ tự đúng | Bỏ trừ lãi → balance tăng 2.000 |
| TC-06.3 | auction mở sau unbuiltRounds > 2 | rounds không tăng → auction không mở |
| TC-06.4 | startingBid = price * 0.70, P1 không bid được | Dùng 0.50 → fail assert 70% |

---

## TASK 5 — Xây Dựng Bot AI Engine (TDD Red-Green-Refactor)

**DEBT Refs:** UC-GAME-005, UC-GAME-008  
**TC Refs:** TC-06.8

### 5.1 Module Mới `src/domain/bot/bot_engine.ts` [NEW] (~150L)

```typescript
export enum BotPersonality { Passive, Balanced, Aggressive }

export interface BotConfig {
  personality: BotPersonality;
  balanceThresholdMultiplier: number;  // Balanced: 1.20, Aggressive: 1.00
}

export function decideBotIntent(
  bot: Player, room: Room,
  registry: PropertyRegistry, stateMap: PropertyStateMap,
  config: BotConfig,
): PlayerIntent | null;
```

**Bảng quyết định 3 tính cách:**

| Tính cách | Hành vi | Intent chuỗi |
|---|---|---|
| Passive | Không mua, không nâng cấp | ROLL → DECLINE → END_TURN |
| Balanced | Mua nếu balance ≥ price * 1.20; nâng nếu đủ bộ màu | ROLL → BUY/DECLINE → UPGRADE? → END_TURN |
| Aggressive | Mua + nâng tối đa, ưu tiên ô rent cao nhất | ROLL → BUY → UPGRADE[] → END_TURN |

**Ràng buộc bắt buộc:**
- Bot gọi `RoomManager.handlePlayerIntent()` → IntentDispatcher (KHÔNG mutate state trực tiếp)
- Guard: tối đa 50 intent/lượt
- Dùng PRNG của session (không Math.random)

### 5.2 Đấu Nối vào RoomManager

**Phương thức mới** `runBotTurn(roomCode: string)` trong `room_manager.ts`:
```typescript
runBotTurn(roomCode: string): void {
  const room = this.rooms.get(roomCode);
  const current = room?.players[room.currentPlayerIndex];
  if (!current?.isBot) return;
  // Loop với safety counter ≤ 50
  // Gọi decideBotIntent → handlePlayerIntent cho đến khi FSM không còn accept intent
}
```

Gọi `runBotTurn` trong `handleEndTurn` khi player tiếp theo có `isBot: true`.

---

### Gate 5 — Tiêu Chí Nghiệm Thu

Test files mới: `tests/domain/bot_engine.test.ts` + `tests/server/room_manager_bot.test.ts`

| Tiêu chí | Điều kiện Pass |
|---|---|
| TC-06.8a: Passive không emit INTENT_BUY | PASS |
| TC-06.8b: Balanced mua khi balance ≥ price * 1.20 | PASS |
| TC-06.8c: Aggressive nâng ô rent cao nhất trước | PASS |
| Bot đi qua IntentDispatcher | PASS |
| 100 vòng Bot liên tiếp: không infinite loop | PASS |
| Toàn bộ test suite | ≥ 394 PASS |

---

## TASK 6 — E2E Hội Tụ, Adversarial Inversion & Bàn Giao

### 6.1 Luồng E2E Tổng Hợp

Thêm vào `tests/integration/multiplayer_gameplay_flow.test.ts`:
```
Bot BALANCED tham gia → Rút CC_OVERDRAFT (overdraftRoundsLeft=3) →
3 vòng GO → Tự động trừ 3.300 → Nếu âm → InsolvencyPhase →
Cưỡng chế auction 70% → Player Human thắng bid → Game kết thúc bình thường
```

### 6.2 Adversarial Inversion Toàn Bộ

Với mỗi TC-06.1 đến TC-06.9: inject 1 bug có chủ ý → verify fail đúng message → restore → ghi vào comment `// [Adversarial] Confirmed fail: ...`

### 6.3 Cập Nhật Epic Ledger

`docs/epics/gameplay/_epic_ledger.md` — Slice 06:
- `Lifecycle Status: Done (YYYY-MM-DD)`
- `Test Coverage: XXX/XXX tests PASS`
- `DEBT-S06-01..10: ✅ ĐÃ GIẢI QUYẾT`

### 6.4 Cập Nhật Domain Gotchas

`docs/domain/gotchas.md` — ghi nhận edge case mới phát hiện.

---

### Gate 6 — Tiêu Chí Nghiệm Thu (FINAL)

| Tiêu chí | Điều kiện Pass |
|---|---|
| Tổng số tests (394 + tests mới) | Tất cả PASS |
| TypeScript | 0 errors, 0 warnings |
| ESLint complexity | 0 violations (CC ≤ 5) |
| LOC mọi file | ≤ 300 LOC |
| `grep CommunityChest src/` | 0 kết quả |
| `grep sendToAudit src/server/room_manager.ts` | 0 kết quả |
| `grep 'MISSING_MONOPOLY' src/` | 0 kết quả |
| vi.ts 16+20 entries | Fixture Contract PASS |
| Bot 3 tính cách không treo FSM | PASS |
| Epic Ledger Slice 06 | Status=Done, DEBT-S06-01..10=✅ |
| Adversarial Inversion TC-06.1..9 | fail đúng lý do cho mỗi TC |

---

## Danh Sách File Bị Ảnh Hưởng

### File Mới [NEW]

| File | LOC mục tiêu | Task |
|---|---|---|
| `src/domain/property_data.ts` | ~60L | TASK 1 |
| `src/domain/property_rent.ts` | ~120L | TASK 1 |
| `src/domain/property_upgrade.ts` | ~90L | TASK 1 |
| `src/domain/market_card_handlers.ts` | ~120L | TASK 1 |
| `src/domain/chance_card_handlers.ts` | ~170L | TASK 1 |
| `src/server/turn_loop.ts` | ~120L | TASK 1 |
| `src/domain/i18n/vi.ts` | ~80L | TASK 2 |
| `src/domain/bot/bot_engine.ts` | ~150L | TASK 5 |
| `tests/domain/bot_engine.test.ts` | ~150L | TASK 5 |
| `tests/server/room_manager_bot.test.ts` | ~100L | TASK 5 |

### File Sửa Đổi Đáng Kể

| File | Loại thay đổi | Task |
|---|---|---|
| `src/domain/property_manager.ts` | Barrel re-export (~30L cuối) | TASK 1 |
| `src/domain/card_handlers.ts` | Barrel re-export (~10L cuối) | TASK 1 |
| `src/server/room_manager.ts` | Thin orchestrator (~230L) + runBotTurn | TASK 1, 5 |
| `src/domain/board_config.ts` | Xóa 2 dead enum values | TASK 2 |
| `src/domain/event_card_types.ts` | Xóa UTILITY_CELLS_ECE | TASK 2 |
| `src/domain/event_card_engine.ts` | Xóa import UTILITY_CELLS_ECE | TASK 2 |
| `src/domain/action_reasons.ts` | Mở rộng ActionRejectReason | TASK 2 |
| `src/domain/room.ts` | Thêm isBot, overdraftRoundsLeft | TASK 3 |
| `src/server/session_manager.ts` | Thêm 3 fields vào Delta types | TASK 3 |
| `src/domain/chance_card_handlers.ts` | Logic CC_OVERDRAFT, CC_FREE_CREDIT, CC_SLOW_BUILD | TASK 4 |
| `src/server/turn_loop.ts` | processPendingDebts, unbuiltRounds counter | TASK 4 |
| `src/server/insolvency_manager.ts` | startingBid 70% |
 TASK 4 |
| `src/server/auction_manager.ts` | Tham số forcedLiquidation | TASK 4 |
| `tests/domain/board_config.test.ts` | Xóa 2 assertions dead enum | TASK 2 |
| `tests/domain/event_card_engine.test.ts` | Xóa UTILITY_CELLS_ECE assertions | TASK 2 |
| `tests/server/delta_payload_vsc.test.ts` | Thêm 3 VSC assertions | TASK 3 |

---

## Rủi Ro & Phương Án Dự Phòng

| Rủi ro | Xác suất | Phương án |
|---|---|---|
| Circular dependency khi phân tách | Trung bình | Chạy `tsc --noEmit` ngay sau mỗi file mới tạo |
| `executeChanceCard` return type đổi → caller bị break | Trung bình | Quét `grep -r "executeChanceCard" src/` trước khi đổi |
| `processPendingDebts` race với `collectMortgageInterest` | Trung bình | Thứ tự cố định: mortgage interest → pending debts → GO bonus |
| Bot infinite loop | Thấp | Safety counter = 50 trong `runBotTurn` |
| LOC vi phạm sau khi thêm code Bot | Thấp | `turn_loop.ts` và `bot_engine.ts` là file riêng ≤ 150L |

---

*Kế hoạch soạn thảo bởi Architect Subagent · 2026-09-09*  
*Nguồn: Scout Report + Ticket GAME-S06 v1.1 (APPROVED) + Epic Ledger Slice 06*
