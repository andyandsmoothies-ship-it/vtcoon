# PLAN_IMP_395_CORE_DOMAIN_AND_BOT_FACADES

## 0. Mục Tiêu Kiến Trúc (Architectural Objective - Phase 3 / Slice 3A)
1. **Thiết lập Core Domain Public Facade (`src/domain/index.ts`) — Cụm C2 Deep Module**:
   - Đóng gói 28 tệp trong `src/domain/` đằng sau mặt tiền chính thống `src/domain/index.ts`, xuất bản tập trung các Thực thể & Enums cốt lõi (`Room`, `Player`, `TurnPhase`, `ActionRejectReason`, `CellType`, `ColorGroup`, `MacroCycleType`, `MarketCardId`, `ChanceCardId`, `BondTrancheId`, `BondContract`, `TransitWheelOutcome`,...), các Bảng Hằng số & Sổ cái Tĩnh (`BOARD_CONFIG`, `PROPERTY_DEEDS`, `LEVEL_MULTIPLIER`, `TABLETOP_THEME`, `COLOR_GROUP_HEX`, `PLAYER_TOKEN_PALETTE`, `BOND_TRANCHES`, `TRANSIT_WHEEL_CONFIGS`, `vi`,...), và các Hàm Tính toán Chuẩn SSOT (`calculateCellNetWorth`, `calculateRent`, `resolveRent`, `calculateUpgradeCost`, `calculateBailAmount`, `calculateGoSalary`, `checkPassedGo`, `evaluateMacroCycle`,...).
   - Giữ ẩn hoàn toàn các tệp lá thực thi nội bộ (`card_handlers.ts`, `chance_card_handlers.ts`, `chance_ma_handlers.ts`, `market_card_handlers.ts`, `compulsory_buyout.ts`, `types.ts`) khỏi mặt tiền `src/domain/index.ts`, tuyệt đối không xuất các bí danh thừa không có consumer (`Anti-TIDD` `[HIGH-02]`), đồng thời đảm bảo `src/domain/index.ts` xuất đủ 100% ký hiệu cần thiết để Slice 3B (`IMP-396`) chuyển hướng toàn bộ `src/client/ui/modals/**` mà không cần chạm lại vào `domain-core`.
2. **Thiết lập Autonomous Bot Brain Public Facade (`src/domain/bot/index.ts`) — Cụm C3 Deep Module (`[HIGH-02]`)**:
   - Tạo mặt tiền `src/domain/bot/index.ts` xuất bản giao diện điều khiển công khai chuẩn SSOT của Bot AI (`BotPersonality`, `BotPosture`, `decideBotIntent`, `decideAuctionPhaseIntent`, `evaluateBotTradeDecision`, `evaluateBotTradeAcceptance`, `findEligibleBotTrade`, `recordTradeRejection`, `clearTradeRejectionForCell`, `BotEngine`, `takeover`, `evaluatePlayerNetWorth` cùng các kiểu cấu hình `BotConfig`, `BotIntent`, `TileValuation`, `BotTradeDecision`, `BotTradeIntent`, `BotSwapTradeIntent`, `BotNegotiationContext`, `BotNegotiationDecision`) — không tạo các bí danh giả chỉ phục vụ test (`[HIGH-02]`).
3. **Đấu nối 1:1 Cụm `src/server/room_*.ts` (`7` tệp) & Giải cứu `src/server/room_manager.ts` khỏi Vùng Đệm Đỏ (`< 350 LOC`) (`[CRITICAL-01]`)**:
   - Khai báo tường minh `**Target physical file**:` cho toàn bộ **7 tệp thuộc họ `src/server/room_*.ts`** (`room_manager.ts`, `room_bot_coordinator.ts`, `room_bot_manager.ts`, `room_manager_lifecycle.ts`, `room_property_coordinator.ts`, `room_trade_coordinator.ts`, `room_manager_queries.ts`) khớp 1:1 giữa Bảng 1 và Mục 4 (`10/10` target files thuộc đúng `3` cohesive units: `src/domain/index`, `src/domain/bot/index`, `src/server/room`), kéo `src/server/room_manager.ts` từ `350 LOC` xuống `344 LOC` (thoát khỏi ngưỡng khóa `>= 350 LOC`) và giữ nguyên **0 chu trình phụ thuộc vòng (`0 SCCs`)** trên toàn bộ `src/domain/**`.
   - Phần việc tạo `src/client/audio/index.ts`, cập nhật quy tắc `isFacadeImport` trong `scripts/boundary_linter/boundary_rules.mjs`, và chuyển hướng các tệp UI/Store ngoài họ `room_*` sang Facade được tách sang `[DEFERRED TO TICKET-IMP-396: Phase 3 Slice 3B Client Audio Facade and UI SEAM-01 Purge]` để tuân thủ nghiêm ngặt giới hạn `<= 3 cohesive units` và ranh giới phân hệ `domain-core` vs `client-ui` của `rules_scope.mjs`.

## 1. Phạm Vi Tệp & Ngân Sách Dòng Lệnh (Direct Scope & Honest LOC Accounting)

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Ceiling | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/domain/index.ts` | Tier 1 (Domain) | 0 | 98 | ~+98 | 400 | Safe (New File) |
| `src/domain/bot/index.ts` | Tier 1 (Domain) | 0 | 28 | ~+28 | 400 | Safe (New File) |
| `src/server/room_manager.ts` | Tier 1 (Server) | 350 | 344 | ~-6 | 400 | Warning (Tech Debt: `[DEBT-LOC-ROOM-MGR]`) |
| `src/server/room_bot_coordinator.ts` | Tier 1 (Server) | 301 | 300 | ~-1 | 400 | Warning (Tech Debt: `[DEBT-LOC-BOT-COORD]`) |
| `src/server/room_bot_manager.ts` | Tier 1 (Server) | 88 | 88 | 0 | 400 | Safe |
| `src/server/room_manager_lifecycle.ts` | Tier 1 (Server) | 335 | 329 | ~-6 | 400 | Warning (Tech Debt: `[DEBT-LOC-LIFECYCLE]`) |
| `src/server/room_property_coordinator.ts` | Tier 1 (Server) | 177 | 177 | 0 | 400 | Safe |
| `src/server/room_trade_coordinator.ts` | Tier 1 (Server) | 223 | 222 | ~-1 | 400 | Safe |
| `src/server/room_manager_queries.ts` | Tier 1 (Server) | 74 | 72 | ~-2 | 400 | Safe |
| `docs/FEATURE_MAP.md` | Tier 3 (Docs) | 93 | 93 | 0 | 800 | Safe |
| `tests/domain/imp395_core_domain_and_bot_facades.test.ts` | Living Test | 0 | 235 | ~+235 | 600 | Safe (New File) |

## 2. Nghiên Cứu Tiền Trạm & Bất Biến (Pre-Flight Research & Invariants)
- **Zero Barrel Cycle Invariant (`[ADV-02]`, `[MEDIUM-03]`)**: `src/domain/index.ts` chỉ re-export một chiều từ các mô-đun con trong `src/domain/` (`MarketModifier` đã được hợp nhất tại `event_card_types.ts` từ `IMP-394`) và không re-export ngược `src/domain/bot/index.ts`; tệp `src/domain/room.ts` (dòng 5) giữ `import type { BotPersonality } from './bot/bot_types'` nội bộ để ngăn ngừa chu trình barrel (`0 SCCs` trên toàn bộ `src/domain/**`).
- **Anti-TIDD Canonical Surface Invariant (`[HIGH-02]`)**: `src/domain/index.ts` và `src/domain/bot/index.ts` chỉ xuất các ký hiệu thực sự có consumer sản xuất (`vi`, `decideBotIntent`, `decideAuctionPhaseIntent`, `evaluateBotTradeDecision`, `findEligibleBotTrade`, `recordTradeRejection`, `clearTradeRejectionForCell`,...); nghiêm cấm xuất các bí danh giả (`VI_MESSAGES`, `decideBotAction`, `decideBotAuctionAction`, `decideBotProactiveTrade`, `evaluateBotTradeOffer`).
- **1:1 Target File Parity & Room Coordinator Encapsulation (`[CRITICAL-01]`)**: Toàn bộ 7 tệp điều phối `src/server/room_*.ts` (`room_manager.ts`, `room_bot_coordinator.ts`, `room_bot_manager.ts`, `room_manager_lifecycle.ts`, `room_property_coordinator.ts`, `room_trade_coordinator.ts`, `room_manager_queries.ts`) đều được khai báo `**Target physical file**:` tường minh và chuyển 100% các câu lệnh import `domain/` và `domain/bot/` sang `../domain/index.js` và `../domain/bot/index.js`.
- **Tech Debt Register (`[DEBT-LOC-ROOM-MGR]`, `[DEBT-LOC-BOT-COORD]`, `[DEBT-LOC-LIFECYCLE]`)**: `room_manager.ts` (`344 LOC`), `room_bot_coordinator.ts` (`300 LOC`) và `room_manager_lifecycle.ts` (`329 LOC`) nằm trong vùng Warning Tier 1 (`300–349 LOC`) và sẽ được làm sâu tại Phase 5 (`GameRoomSession` Deepening).

## 3. Station 1: Đặc Tả Kiểm Thử Hợp Đồng (RED - Contract Specification)
**Target test file**: `tests/domain/imp395_core_domain_and_bot_facades.test.ts`

1. **`TC-395.01`**: `[UC-ARCH-003/MSS]` **Given** toàn bộ các tệp nguồn trong `src/domain/**` bao gồm 2 mặt tiền mới `src/domain/index.ts` và `src/domain/bot/index.ts`, **When** chạy phân tích đồ thị `detectCycles` từ `scripts/boundary_linter/boundary_rules.mjs` và kiểm tra tính toán định giá qua `src/domain/index.ts`, **Then** số chu trình phụ thuộc vòng trong `src/domain/**` bằng `0` (`[]`), `calculateCellNetWorth(39, 2, false)` trả về `10000`, và `calculateGoSalary(1)` trả về `2000`.
2. **`TC-395.02`**: `[UC-ARCH-003/A1]` **Given** mặt tiền `src/domain/index.ts`, **When** phân tích AST các câu lệnh `export` của `src/domain/index.ts`, **Then** mặt tiền xuất bản đầy đủ các nhóm Thực thể, Hằng số tĩnh và Hàm tính toán chuẩn (`BOARD_CONFIG`, `PROPERTY_DEEDS`, `LEVEL_MULTIPLIER`, `COLOR_GROUP_HEX`, `BOND_TRANCHES`, `TRANSIT_WHEEL_CONFIGS`, `vi`, `calculateUpgradeCost`, `calculateBailAmount`, `evaluateMacroCycle`) đồng thời ẩn hoàn toàn các tệp thực thi lá (`card_handlers`, `chance_card_handlers`, `chance_ma_handlers`, `market_card_handlers`, `compulsory_buyout`, `types`) và không chứa bí danh giả `VI_MESSAGES`.
3. **`TC-395.03`**: `[UC-BOT-01/MSS]` **Given** toàn bộ 7 tệp điều phối họ `src/server/room_*.ts` (`room_manager.ts`, `room_bot_coordinator.ts`, `room_bot_manager.ts`, `room_manager_lifecycle.ts`, `room_property_coordinator.ts`, `room_trade_coordinator.ts`, `room_manager_queries.ts`), **When** quét AST tất cả các câu lệnh `import` trỏ vào `domain/` và `domain/bot/`, **Then** 100% câu lệnh đều đi qua mặt tiền `../domain/index.js` và `../domain/bot/index.js` (`0` tệp trong họ `src/server/room_*.ts` còn import trực tiếp vào file lá của `domain/` hay `domain/bot/`).
4. **`TC-395.04`**: `[UC-GAME-005/MSS]` **Given** một phòng chơi ở pha `TurnPhase.WaitingRoll` với người chơi Bot `b1` đang bị thanh tra (`auditTurnsLeft = 2`, `balance = 5000`) và bộ điều phối `src/server/room_bot_coordinator.ts` đã đấu nối với `src/domain/index.js` và `src/domain/bot/index.js`, **When** gọi `decideBotIntent` từ `src/domain/bot/index.js` và `stepBotTurn` qua `room_bot_coordinator.ts`, **Then** hàm trả về quyết định hợp lệ (`INTENT_BAIL_OUT` hoặc `INTENT_ROLL`) và `src/domain/bot/index.ts` không chứa các bí danh giả (`decideBotAction`, `decideBotAuctionAction`, `decideBotProactiveTrade`, `evaluateBotTradeOffer`).
5. **`TC-395.05`**: `[UC-GAME-007/MSS]` **Given** ngữ cảnh thương lượng P2P trong `src/server/room_trade_coordinator.ts` với người bán là Bot `b1` (`BotPersonality.Balanced`, sở hữu ô `1` giá gốc `600`) và người mua là Bot `p1` (`p1.isBot = true`, trả giá thấp `100` kèm dòng tiền tổng hợp `balance = 5000 + 2000 - 500`), **When** gọi `coordTrade` tại `src/server/room_trade_coordinator.ts`, **Then** giao dịch bị từ chối với `success === false`, `reason === ActionRejectReason.TRADE_REJECTED`, bộ đếm `p1.cellTradeRejections[1]` tăng lên `1`, và `room_trade_coordinator.ts` import độc quyền từ `../domain/index.js` cùng `../domain/bot/index.js`.
6. **`TC-395.06`**: `[UC-NETWORTH-SERVER-WIRING-COMPOSITE/MSS]` **Given** người chơi `p1` có dòng tiền hỗn hợp (`balance: 4000` sau khi nhận lương GO `+2000` và trả nợ trái phiếu `-1000`), sở hữu ô `1` (`price = 600`, đang thế chấp với khoản vay `360`) và ô `39` (`price = 4000`, `level = 1`), **When** gọi `calculateNetWorth` từ `src/server/room_manager_queries.ts` và `evaluatePlayerNetWorth` từ `src/domain/bot/index.js`, **Then** cả hai hàm đều trả về chính xác `10240` (`4000 + 240 + 6000`) và tệp `src/server/room_manager.ts` giảm xuống `<= 344 LOC` (thoát khỏi Red Buffer Zone `>= 350 LOC`).

## 4. Station 2: Đặc Tả Triển Khai (GREEN - Implementation Specification)

### Task 1: Thiết lập Core Domain Public Facade (`src/domain/index.ts`)
**Target physical file**: `src/domain/index.ts` (New File)
```typescript
// [IMP-395] Core Domain Public Facade (Cluster C2 Deep Module)
export { ActionRejectReason } from './action_reasons.js';
export { BOARD_CONFIG, CellType, ColorGroup, type BoardCell } from './board_config.js';
export {
  BondTrancheId, BOND_TRANCHES, BOND_MIN_NET_WORTH, BOND_MIN_PROPERTIES,
  BOND_LOAN_RATIO, BOND_INTEREST_RATE, BOND_DURATION_ROUNDS, BOND_MIN_COLLATERAL_RATIO,
  type BondTrancheConfig, type BondContract,
} from './bond_types.js';
export { mulberry32, rollDice, type DiceResult } from './dice.js';
export {
  EmoteId, SOCIAL_EMOTES, EMOTE_DISPLAY_DURATION_MS, EMOTE_COOLDOWN_MS,
  isValidEmoteId, getEmoteDef, type SocialEmoteDef,
} from './emotes.js';
export {
  createMarketDeck, createChanceDeck, resolveHoseInvestment,
  drawMarketCard, drawChanceCard, decayModifiers,
} from './event_card_engine.js';
export {
  CHANCE_CARD_DETAILS, MARKET_CARD_DETAILS, getChanceCardInfo, getMarketCardInfo, type CardDetail,
} from './event_card_metadata.js';
export {
  MarketCardId, ChanceCardId, RESORT_CELLS, COASTAL_CELLS, SERVICE_CELLS,
  INFRA_CELLS, HANOI_HCMC_CELLS, LAND_FEVER_CELLS, HOSE_OUTCOMES, type MarketModifier,
} from './event_card_types.js';
export { vi } from './i18n/vi.js';
export { evaluateMacroCycle } from './macro_cycle_engine.js';
export {
  MacroCycleType, MACRO_CYCLE_LENGTH, MACRO_FEVER_ROUNDS, MACRO_FREEZE_ROUNDS,
  MACRO_FEVER_RENT_MULT, MACRO_FREEZE_RENT_MULT, MACRO_FEVER_UPGRADE_COST_MULT, MACRO_UPGRADE_COST_FLOOR,
} from './macro_cycle_types.js';
export {
  MORTGAGE_DEFAULT_INTEREST_RATE, MORTGAGE_RATE_HIKE_INTEREST_RATE,
  MORTGAGE_LOAN_RATE, URBAN_PLANNING_MORTGAGE_RATE, MORTGAGE_REDEEM_FEE_RATE,
} from './mortgage_constants.js';
export { generateRandomAnimalName } from './name_generator.js';
export { hashSeed, assignRandomPlayerPawns, type PawnAssignmentResult } from './pawn_assignment.js';
export { LUXURY_PAWN_CONFIGS, getPawnConfigBySlot, type LuxuryPawnConfig } from './pawn_configs.js';
export {
  PROPERTY_DEEDS, LEVEL_MULTIPLIER, P2P_TAX_RATE, P2P_ANTI_SPECULATE_TAX,
  RAILROAD_CELLS, RAILROAD_FEES, UTILITY_CELLS, ETC_COST_PER_CELL, UTILITY_UPGRADE_COST,
  isPurchasable, calculateCellNetWorth,
  type PropertyDeed, type PropertyRegistry, type PropertyState, type PropertyStateMap,
} from './property_data.js';
export { LandingResult, BuyResult, buyProperty, handleLanding, type LandingDetails } from './property_manager.js';
export {
  GO_PROPERTY_TAX_CAP, TELECOM_DATA_FEE, MIN_BAIL_AMOUNT, ESCALATING_BAIL_TIERS,
  MAX_BAIL_AMOUNT, BAIL_NET_WORTH_RATIO, calculateBailAmount, calculateRent,
  resolveRent, calculateElectricBill, calculateGoPropertyTax,
} from './property_rent.js';
export {
  DOWNGRADE_REFUND_RATE, hasMonopoly, checkEvenBuilding, checkEvenDowngrading,
  calculateUpgradeCost, upgradeProperty, downgradeProperty, upgradeETC, upgradeUtilityFull,
  type UpgradeCostModifier, type DowngradeOptions,
} from './property_upgrade.js';
export {
  BOARD_SIZE, GO_BONUS, INITIAL_BALANCE, ROOM_CODE_LENGTH, MAX_ROUNDS,
  INITIAL_BALANCE_BY_PLAYERS, TurnPhase, calculateGoSalary, getInitialBalanceForPlayerCount,
  generateRoomCode, createPlayer, createRoom, checkPassedGo, isRoomGameOver,
  type Player, type Room, type CurrentAuctionState, type EventCardInfo, type HoseResultInfo,
  type BuyoutTargetOption, type PendingBuyoutSession, type PendingTradeOfferInfo,
  type MaBuyoutResult, type TradeResultInfo, type BondRepaidServerEvent, type BondDefaultServerEvent,
  type HoseSettledServerEvent, type AuctionWonServerEvent, type AuctionBidServerEvent, type ServerDomainEvent,
} from './room.js';
export { BOARD_SURFACE, PLAYER_TOKEN_PALETTE, COLOR_GROUP_HEX, TABLETOP_THEME } from './theme.js';
export {
  TransitWheelOutcome, TRANSIT_WHEEL_CONFIGS, getWheelTargetDeg,
  evaluateTransitWheelOutcome, findSafeHaven, formatTransitWheelBroadcast,
  type TransitWheelConfig, type TransitWheelBroadcastParams,
} from './transit_wheel.js';
export {
  TREASURY_STIMULUS_THRESHOLD, TREASURY_STIMULUS_RATE, ENABLE_TREASURY_STIMULUS,
  processTreasuryStimulus, type TreasuryRecipient, type TreasuryStimulusResult,
} from './treasury_stimulus.js';
```

### Task 2: Thiết lập Autonomous Bot Brain Public Facade (`src/domain/bot/index.ts`)
**Target physical file**: `src/domain/bot/index.ts` (New File)
```typescript
// [IMP-395] Autonomous Bot Brain Public Facade (Cluster C3 Deep Module)
export {
  BotPersonality,
  BotPosture,
  type BotConfig,
  type BotIntent,
  type TileValuation,
  type BotTradeDecision,
  type BotTradeIntent,
  type BotSwapTradeIntent,
} from './bot_types.js';

export {
  decideBotIntent,
  decideAuctionPhaseIntent,
  findEligibleBotTrade,
  evaluateBotTradeAcceptance,
  takeover,
  BotEngine,
} from './bot_engine.js';

export {
  evaluateBotTradeDecision,
  recordTradeRejection,
  clearTradeRejectionForCell,
  type BotNegotiationContext,
  type BotNegotiationDecision,
} from './bot_negotiation_brain.js';

export { evaluatePlayerNetWorth } from './bot_posture.js';
```

### Task 3: Đấu nối 1:1 toàn bộ 7 tệp họ `src/server/room_*.ts` sang `../domain/index.js` và `../domain/bot/index.js`
**Target physical file**: `src/server/room_manager.ts`
**Target physical file**: `src/server/room_bot_coordinator.ts`
**Target physical file**: `src/server/room_bot_manager.ts`
**Target physical file**: `src/server/room_manager_lifecycle.ts`
**Target physical file**: `src/server/room_property_coordinator.ts`
**Target physical file**: `src/server/room_trade_coordinator.ts`
**Target physical file**: `src/server/room_manager_queries.ts`
- **Call-Site Wiring** (Khai báo 1:1 cả 7 tệp `src/server/room_*.ts` khớp tuyệt đối với Bảng 1):
  1. `src/server/room_manager.ts` (dòng 2–40): Gộp các import từ `../domain/room.js` (dòng 2), `../domain/dice.js` (dòng 20), `../domain/property_manager.js` (dòng 21–26) và `../domain/bond_types.js` (dòng 32) thành 1 khối 4 dòng từ `../domain/index.js`; gộp `BotPersonality` (dòng 3) và `recordTradeRejection` (dòng 40) thành 1 dòng `import { BotPersonality, recordTradeRejection } from '../domain/bot/index.js';` (`350 -> 344 LOC`, thoát khỏi Red Buffer Zone `>= 350 LOC`).
  2. `src/server/room_bot_coordinator.ts` (dòng 2–5): Gộp dòng 2 và dòng 5 thành `import { TurnPhase, type Room, type Player, type PropertyRegistry, type PropertyStateMap } from '../domain/index.js';` và đổi dòng 3 thành `import { decideBotIntent, type BotConfig } from '../domain/bot/index.js';` (`301 -> 300 LOC`).
  3. `src/server/room_bot_manager.ts` (dòng 3–4): Đổi `../domain/room.js` thành `../domain/index.js` và `../domain/bot/bot_engine.js` thành `../domain/bot/index.js` (`88 -> 88 LOC`).
  4. `src/server/room_manager_lifecycle.ts` (dòng 3–17): Gộp các import từ `../domain/room.js` (dòng 3–6, 13), `../domain/event_card_engine.js` (dòng 9–11), `../domain/property_manager.js` (dòng 14), `../domain/name_generator.js` (dòng 17) thành 1 khối 4 dòng từ `../domain/index.js`, và đổi dòng 7 thành `import { BotPersonality } from '../domain/bot/index.js';` (`335 -> 329 LOC`).
  5. `src/server/room_property_coordinator.ts` (dòng 2–9): Gộp các import từ `../domain/room.js`, `../domain/property_manager.js`, `../domain/property_upgrade.js` (dòng 2–4) thành 3 dòng từ `../domain/index.js`, và đổi dòng 9 thành `import { type BotPersonality } from '../domain/bot/index.js';` (`177 -> 177 LOC`).
  6. `src/server/room_trade_coordinator.ts` (dòng 2–10): Gộp dòng 2 (`../domain/room.js`) và dòng 4 (`../domain/property_data.js`) thành 1 dòng `import { TurnPhase, ActionRejectReason, PROPERTY_DEEDS, type Room } from '../domain/index.js';` và đổi dòng 10 thành `} from '../domain/bot/index.js';` (`223 -> 222 LOC`).
  7. `src/server/room_manager_queries.ts` (dòng 3–6): Gộp 3 dòng import từ `../domain/property_manager.js`, `../domain/board_config.js`, `../domain/room.js` thành 1 dòng `import { BOARD_CONFIG, resolveRent, LEVEL_MULTIPLIER, calculateCellNetWorth, type Room, type PropertyRegistry, type PropertyStateMap } from '../domain/index.js';` (`74 -> 72 LOC`).

### Task 4: Cập nhật `docs/FEATURE_MAP.md` (Knowledge Fold)
**Target physical file**: `docs/FEATURE_MAP.md`
- **Call-Site Wiring**: Cập nhật dòng Pillar **01 (Board & Properties)**, Pillar **10 (Bot AI Engine)** và Pillar **11 (FSM Lifecycle & WebSocket Sync)** tại `docs/FEATURE_MAP.md` ghi nhận `IMP-395` (thiết lập mặt tiền chuẩn `src/domain/index.ts` và `src/domain/bot/index.ts`, đấu nối 100% họ điều phối `src/server/room_*.ts` qua Facade, giải cứu `src/server/room_manager.ts` xuống `344 LOC` dưới ngưỡng Red Buffer Zone `350 LOC`), giữ nguyên tổng số dòng của tệp (`93 lines`).

## 5. Definition of Done (DoD) & Ranh Giới Dừng (Stopping Boundary)
1. **Zero Barrel Cycle & Core Domain Facade**: `src/domain/index.ts` xuất bản đầy đủ thực thể, hằng số và hàm tính toán chuẩn SSOT của Domain mà không tạo ra bất kỳ chu trình phụ thuộc nào (`0 SCCs` trong `src/domain/**`) và không chứa bí danh giả vi phạm Anti-TIDD.
2. **100% `room_*` Coordinator Facade Encapsulation**: Toàn bộ 7 tệp điều phối `src/server/room_*.ts` đi qua `src/domain/index.ts` và `src/domain/bot/index.ts`; `src/server/room_manager.ts` giảm xuống `344 LOC` (`< 350 LOC`).
3. **Mechanical Gates & Evidence Verification**: Pass 100% `npm run prefilter`, `node scripts/check_scope.mjs`, `npm run sentinel -- --ticket IMP-395 --test tests/domain/imp395_core_domain_and_bot_facades.test.ts --src src/server/room_manager_queries.ts`, và `node scripts/check_evidence.mjs IMP-395`.
4. **Stopping Boundary**: Hoàn tất trọn vẹn Phase 3 — Slice 3A (`IMP-395`) và dừng lại báo cáo trước khi chuyển sang Slice 3B (`IMP-396`).

<!-- AUDIT_STATUS: HARDENED_APPROVED -->
