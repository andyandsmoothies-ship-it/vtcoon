<!-- AUDIT_STATUS: HARDENED_APPROVED -->
# Plan IMP-391: Domain & Bot Cycle Breaker (`SCC-01..03`) & Authoritative Net Worth SSOT (Ticket IMP-391)

## 0. Auto-Slicing Roadmap & Context
- **Pragmatic Golden Foundation Roadmap**:
  1. **Slice 1A (Ticket IMP-391 - Current)**: (a) Triệt tiêu 100% chu trình phụ thuộc vòng tròn Runtime & Type trong `src/domain/` (`SCC-2`: 8 files) và `src/domain/bot/` (`SCC-3`: `bot_softmax.ts <-> valuation_engine.ts`, `bot_trade.ts <-> bot_hybrid_trade.ts`) bằng cách định tuyến các import hằng số/kiểu về leaf modules (`event_card_types.ts`, `property_data.ts`, `bot_types.ts`); (b) Hợp nhất công thức tính giá trị ròng từng ô đất `calculateCellNetWorth` (bảo toàn bất biến `effectiveLevel = isMortgaged ? 0 : level`) và `LEVEL_MULTIPLIER` làm SSOT tại `src/domain/property_data.ts` (tái sử dụng `MORTGAGE_LOAN_RATE` từ `mortgage_constants.ts`); (c) Kết nối đồng bộ cả Server (`calculateNetWorth` tại `src/server/room_manager_queries.ts`) và Bot AI (`evaluatePlayerNetWorth` tại `src/domain/bot/bot_posture.ts`) vào `calculateCellNetWorth`, khắc phục triệt để độ lệch định giá khoản vay 60% (`MC_URBAN_PLANNING`) và cờ `stateMap.get(cellIndex)?.isMortgaged`.
  2. **[DEFERRED TO TICKET-IMP-392: Shared Wire Protocol & Client Boundary Purge]**: Tách `room_protocol.ts`, cập nhật re-export tại `delta_types.ts`, `intent_dispatcher.ts` và chuyển `calculatePlayerNetWorth` tại `ui_helpers.ts` sang dùng `calculateCellNetWorth`.
  3. **[DEFERRED TO TICKET-IMP-393: Client Runtime Cycle Breaker]**: Chặt đứt các chu trình phụ thuộc Runtime giữa `game_store.ts`, `lobby_store.ts`, `pacing_context.ts` và `game_event_*_helpers.ts`.

## 1. Physical Target Files & Honest LOC Accounting
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `src/domain/property_data.ts` | Tier 1 (Domain/Server/Logic) | 96 | 119 | +23 | <= 400 | Safe (< 400 LOC) |
| `src/domain/property_rent.ts` | Tier 1 (Domain/Server/Logic) | 205 | 205 | 0 | <= 400 | Safe (< 400 LOC) |
| `src/domain/property_upgrade.ts` | Tier 1 (Domain/Server/Logic) | 212 | 212 | 0 | <= 400 | Safe (< 400 LOC) |
| `src/domain/property_manager.ts` | Tier 1 (Domain/Server/Logic) | 149 | 149 | 0 | <= 400 | Safe (< 400 LOC) |
| `src/domain/room.ts` | Tier 1 (Domain/Server/Logic) | 346 | 346 | 0 | <= 400 | Warning (>= 300 LOC - Tech Debt tracked) |
| `src/domain/event_card_engine.ts` | Tier 1 (Domain/Server/Logic) | 146 | 146 | 0 | <= 400 | Safe (< 400 LOC) |
| `src/domain/bot/bot_posture.ts` | Tier 1 (Domain/Server/Logic) | 215 | 206 | ~ -9 | <= 400 | Safe (< 400 LOC) |
| `src/domain/bot/bot_types.ts` | Tier 1 (Domain/Server/Logic) | 136 | 164 | +28 | <= 400 | Safe (< 400 LOC) |
| `src/domain/bot/bot_softmax.ts` | Tier 1 (Domain/Server/Logic) | 112 | 112 | 0 | <= 400 | Safe (< 400 LOC) |
| `src/domain/bot/valuation_engine.ts` | Tier 1 (Domain/Server/Logic) | 247 | 245 | ~ -2 | <= 400 | Safe (< 400 LOC) |
| `src/domain/bot/bot_trade.ts` | Tier 1 (Domain/Server/Logic) | 263 | 240 | ~ -23 | <= 400 | Safe (< 400 LOC) |
| `src/domain/bot/bot_hybrid_trade.ts` | Tier 1 (Domain/Server/Logic) | 291 | 291 | 0 | <= 400 | Safe (< 400 LOC) |
| `src/server/room_manager_queries.ts` | Tier 1 (Domain/Server/Logic) | 80 | 72 | ~ -8 | <= 400 | Safe (< 400 LOC) |
| `tests/domain/imp391_domain_protocol_and_net_worth_ssot.test.ts` | Living Test | 0 | 160 | +160 | <= 600 | Contract Test Suite |
| `docs/FEATURE_MAP.md` | SSOT Matrix | 93 | 93 | 0 | N/A | Cập nhật Pillar 01 |

## 2. In-Action Visual Capture Registration
- Scenario: Non-UI (Domain & Bot Core Cycle Breaking & Authoritative Net Worth SSOT). Visual capture waived per Gotcha 13; mechanical verification via check_evidence.mjs & vitest.

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- **TC-391.01 [UC-NETWORTH-CELL-SSOT-BASE/MSS]:** Given a purchasable property cell 39 (price 4000) at level 0 and unmortgaged, When calling `calculateCellNetWorth(39, 0, false)`, Then returns 4000.
- **TC-391.02 [UC-NETWORTH-CELL-SSOT-UPGRADED/MSS]:** Given property cell 39 (price 4000) upgraded to level 3 (multiplier 4.0) and unmortgaged, When calling `calculateCellNetWorth(39, 3, false)`, Then returns 16000.
- **TC-391.03 [UC-NETWORTH-CELL-SSOT-MORTGAGE-DEFAULT/A1]:** Given property cell 39 (price 4000) mortgaged without custom loan even if dirty state passes non-zero level 2, When calling `calculateCellNetWorth(39, 2, true)`, Then clamps `effectiveLevel = 0` (`mult = 1`), deducts `MORTGAGE_LOAN_RATE` (50% = 2000), and returns 2000.
- **TC-391.04 [UC-NETWORTH-CELL-SSOT-MORTGAGE-CUSTOM/A2]:** Given property cell 39 (price 4000) at level 0 and mortgaged under `MC_URBAN_PLANNING` with 60% custom loan 2400, When calling `calculateCellNetWorth(39, 0, true, 2400)`, Then deducts 2400 and returns 1600.
- **TC-391.05 [UC-NETWORTH-SERVER-WIRING-COMPOSITE/MSS]:** Given a composite đa dòng tiền portfolio where player p1 has simultaneous cash inflow (balance 5000 after GO salary) and outflow liabilities (cell 1 marked `isMortgaged: true` in `stateMap` with custom loan 360 and upgraded cell 39 at level 2) wired through `room_manager_queries`, When calling `calculateNetWorth('p1', registry, stateMap, players)`, Then invokes `calculateCellNetWorth` at the call-site and returns exact total net worth 15240 without netting collision.
- **TC-391.06 [UC-NETWORTH-BOT-POSTURE-WIRING/MSS]:** Given player p1 with balance 3000 and cell 39 (price 4000) mortgaged with a 60% `MC_URBAN_PLANNING` loan (`mortgageLoans: { 39: 2400 }`) wired through `bot_posture`, When calling `evaluatePlayerNetWorth('p1', players, registry, stateMap)`, Then invokes `calculateCellNetWorth` at the call-site and returns 4600 (matching `calculateNetWorth` 1:1).

### Station 2: Implementation (GREEN)

#### Task 1: Bổ sung SSOT `LEVEL_MULTIPLIER` và `calculateCellNetWorth` vào `src/domain/property_data.ts`
**Target physical file**: `src/domain/property_data.ts`
```typescript
<<<<
import { CellType, BOARD_CONFIG } from './board_config';
====
import { CellType, BOARD_CONFIG } from './board_config';
import { MORTGAGE_LOAN_RATE } from './mortgage_constants';
>>>>
```
```typescript
<<<<
export const ETC_COST_PER_CELL = 1500;
export const UTILITY_UPGRADE_COST = 1000;
====
export const ETC_COST_PER_CELL = 1500;
export const UTILITY_UPGRADE_COST = 1000;

// --- [IMP-391] Authoritative Net Worth Valuation SSOT ---
export const LEVEL_MULTIPLIER: Record<number, number> = { 0: 1, 1: 1.5, 2: 2.5, 3: 4 };

export function calculateCellNetWorth(
  cellIndex: number,
  level: number = 0,
  isMortgaged: boolean = false,
  customLoanAmount?: number,
): number {
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed) return 0;
  const effectiveLevel = isMortgaged ? 0 : level;
  const mult = LEVEL_MULTIPLIER[effectiveLevel] ?? 1;
  let worth = Math.floor(deed.price * mult);
  if (isMortgaged) {
    const loan = customLoanAmount ?? Math.floor(deed.price * MORTGAGE_LOAN_RATE);
    worth -= loan;
  }
  return worth;
}
>>>>
```

#### Task 2: Chặt đứt chu trình `SCC-2` (8 files) trong `src/domain/`
**Target physical file**: `src/domain/property_rent.ts`
- Chuyển `import { MarketCardId, ChanceCardId, COASTAL_CELLS, SERVICE_CELLS } from './event_card_engine'` sang `'./event_card_types'` (Delta: `0`).
**Target physical file**: `src/domain/property_upgrade.ts`
- Chuyển `import { MarketCardId } from './event_card_engine'` sang `'./event_card_types'` (Delta: `0`).
**Target physical file**: `src/domain/property_manager.ts`
- Chuyển `import { MarketCardId, ChanceCardId, COASTAL_CELLS, SERVICE_CELLS } from './event_card_engine'` sang `'./event_card_types'` (Delta: `0`).
- **Companion leaf redirects**:
  - Tại `src/domain/room.ts` (dòng 2): đổi `import type { MarketCardId, ChanceCardId } from './event_card_engine'` sang `'./event_card_types'` (Delta: `0`).
  - Tại `src/domain/event_card_engine.ts` (dòng 4): đổi `import type { PropertyRegistry, PropertyStateMap } from './property_manager'` sang `'./property_data'` (Delta: `0`).

#### Task 3: Hợp nhất `evaluatePlayerNetWorth` tại `src/domain/bot/bot_posture.ts`
**Target physical file**: `src/domain/bot/bot_posture.ts`
- Import `LEVEL_MULTIPLIER, calculateCellNetWorth` từ `'../property_data'` và `export { LEVEL_MULTIPLIER };` thay cho khai báo cục bộ.
- Trong `evaluatePlayerNetWorth`, thay nhánh `if (isMortgaged) ... else ...` bằng lời gọi uỷ quyền trực tiếp `total += calculateCellNetWorth(cellIdx, level, isMortgaged, p.mortgageLoans?.[cellIdx]);` (Delta: `-9` LOC, `215 -> 206`).

#### Task 4: Chặt đứt chu trình `SCC-3` & Trade Type Cycle trong `src/domain/bot/`
**Target physical file**: `src/domain/bot/bot_types.ts`
- Chuyển `JITTER_BOUNDS = Object.freeze({ MIN: -0.12, MAX: 0.12 })` và 3 interfaces `BotTradeDecision`, `BotTradeIntent`, `BotSwapTradeIntent` về leaf `src/domain/bot/bot_types.ts` (Delta: `+28` LOC, `136 -> 164`).
**Target physical file**: `src/domain/bot/bot_softmax.ts`
- Import `JITTER_BOUNDS` trực tiếp từ `'./bot_types'` thay vì `'./valuation_engine'` (Delta: `0` LOC, `112 -> 112`).
- **Companion SSOT re-export**: Tại `src/domain/bot/valuation_engine.ts`, import `JITTER_BOUNDS` từ `'./bot_types'` và `export { JITTER_BOUNDS };` thay vì khai báo trùng lặp `Object.freeze` cục bộ (Delta: `-2` LOC, `248 -> 246`).
**Target physical file**: `src/domain/bot/bot_trade.ts`
- Import và re-export `type { BotTradeDecision, BotTradeIntent, BotSwapTradeIntent }` từ `'./bot_types.js'` thay vì khai báo cục bộ (Delta: `-23` LOC, `263 -> 240`).
**Target physical file**: `src/domain/bot/bot_hybrid_trade.ts`
- Đổi `import type { BotSwapTradeIntent, BotTradeDecision } from './bot_trade.js'` sang `'./bot_types.js'` (Delta: `0` LOC, `291 -> 291`).

#### Task 5: Kết nối `calculateCellNetWorth` vào `src/server/room_manager_queries.ts`
**Target physical file**: `src/server/room_manager_queries.ts`
- Import `LEVEL_MULTIPLIER, calculateCellNetWorth` từ `'../domain/property_manager.js'` và re-export `export { LEVEL_MULTIPLIER };`.
- Trong `calculateNetWorth`, xét đồng thời `const isMortgaged = Boolean(player.mortgagedProperties?.includes(cellIndex) || stateMap.get(cellIndex)?.isMortgaged);` và uỷ quyền tính giá trị từng ô cho `calculateCellNetWorth(cellIndex, level, isMortgaged, player.mortgageLoans?.[cellIndex])` (Delta: `-8` LOC, `80 -> 72`).

#### Task 6: Cập nhật SSOT `docs/FEATURE_MAP.md`
**Target physical file**: `docs/FEATURE_MAP.md`
- Cập nhật dòng Pillar **01 (Board & Properties)** để ghi nhận SSOT `calculateCellNetWorth` (bảo toàn bất biến `effectiveLevel = 0` khi thế chấp và khấu trừ `mortgageLoans[cellIndex]`), đồng bộ giữa `room_manager_queries.ts` và `bot_posture.ts`, cùng kiến trúc DAG không chu trình tại `src/domain/` và `src/domain/bot/` (Delta: `0` LOC, `93 -> 93`).

## 4. Definition of Done (DoD) & Stopping Criteria
1. **Contract Parity**: Toàn bộ 6/6 contract tests trong `tests/domain/imp391_domain_protocol_and_net_worth_ssot.test.ts` đạt trạng thái GREEN.
2. **Zero Domain & Bot Cycles (`SCC-2`, `SCC-3`)**: Chu trình phụ thuộc trong `src/domain/` và `src/domain/bot/` giảm về 0 khi chạy `npm run lint:boundaries`.
3. **Mechanical Gates**: `npm run prefilter` và `node scripts/check_scope.mjs` đạt PASS (0 typecheck errors, 0 dirty casts, 0 LOC violations).
4. **Chaos Sentinel**: Vượt qua `npm run sentinel -- --ticket IMP-391 --test tests/domain/imp391_domain_protocol_and_net_worth_ssot.test.ts`.
