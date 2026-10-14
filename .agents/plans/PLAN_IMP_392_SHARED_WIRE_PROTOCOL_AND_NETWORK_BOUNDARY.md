# PLAN_IMP_392_SHARED_WIRE_PROTOCOL_AND_NETWORK_BOUNDARY

## 0. Mục Tiêu Kiến Trúc (Architectural Objective - Slice 1B)
1. **Thiết lập Shared Wire Protocol Facade (`src/domain/protocol/index.ts`)**: Tập trung toàn bộ các kiểu dữ liệu đường truyền mạng (`DeltaPayload`, `DeltaPayloadOptions`, `CellDelta`, `PlayerDelta`, `AuctionPayload`, `AuctionDelta`, `PendingTradeOfferDelta`, `TradeResultInfo`, `DiplomaticEventDelta`, `PlayerIntent`, `VALID_INTENTS` gồm đủ 25 mã lệnh, `CELL_INTENTS`, `isValidPlayerIntentFields`, `ReasonCode`, `WsErrorMessageReason`, `WsClientMessage`, `WsServerMessage`, `RoomHealthStatus`, `AdminPlayerSummary`, `AdminRoomSummary`, `CloudStorageVitals`, `ServerVitals`, `AdminRoomDetail`, `AdminRoomLogEntry`, `ArchivedRoomStatus`, `AdminArchivedRoomSummary`) vào mặt tiền chuẩn `src/domain/protocol/index.ts` theo đúng *Subsystem Facade Invariant*.
2. **Xóa bỏ Dirty Cast trong `EnvelopeValidator` (`src/server/security/envelope_validator.ts`)**: Thay thế ép kiểu `raw as import('../intent_dispatcher.js').PlayerIntent` tại `validateIntentEnvelope` bằng type guard `isValidPlayerIntentFields(it)` tự chứa đầy đủ kiểm tra số nguyên, biên bàn cờ `[0, 39]` (bao gồm cả `INTENT_UPGRADE_ETC`) và `price > 0` cho `INTENT_TRADE_OFFER`, giữ trọn vẹn tương thích ngược qua `export *` tại `delta_types.ts`, `intent_dispatcher.ts`, `network_types.ts`, `admin_types.ts`.
3. **Chuyển hướng 100% Client Network / Events / Store / Telemetry sang `src/domain/protocol/index.ts`**: Chuyển toàn bộ 30 tệp thuộc `src/client/network/**` (17 tệp), `src/client/events/**` (9 tệp), `src/client/store/**` (2 tệp) và `src/client/telemetry/**` (2 tệp) sang import trực tiếp từ `src/domain/protocol/index.js` (0 kết nối trực tiếp từ tầng mạng/sự kiện/store/telemetry của Client sang Server, xác nhận qua `npm run lint:boundaries`).
- `[DEFERRED TO TICKET-IMP-393: Slice 1C — Hợp nhất Net Worth SSOT cho ui_helpers.ts và chuyển hướng các tệp 2D UI (hud_container.tsx, pre_match_deck.tsx, modal_host.tsx, player_card_helpers.ts, admin_*) sang src/domain/protocol/index.ts để tách biệt phạm vi phân hệ client-ui theo đúng quy chuẩn Subsystem Boundary]`

## 1. Phạm Vi Tệp & Ngân Sách Dòng Lệnh (Direct Scope & Honest LOC Accounting)

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Ceiling | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/domain/protocol/index.ts` | Tier 1 (Domain) | 0 | 222 | ~+222 | 400 | Safe (New File) |
| `src/server/security/envelope_validator.ts` | Tier 1 (Server) | 244 | 204 | ~-40 | 400 | Safe |
| `src/server/delta_types.ts` | Tier 1 (Server) | 137 | 26 | ~-111 | 400 | Safe |
| `src/server/intent_dispatcher.ts` | Tier 1 (Server) | 201 | 178 | ~-23 | 400 | Safe |
| `src/server/network/network_types.ts` | Tier 1 (Server) | 205 | 24 | ~-181 | 400 | Safe |
| `src/server/network/admin_types.ts` | Tier 1 (Server) | 94 | 24 | ~-70 | 400 | Safe |
| `src/client/network/use_app_session.ts` | Tier 1 (Network) | 284 | 283 | ~-1 | 400 | Safe |
| `src/client/network/use_app_turn_controls.ts` | Tier 1 (Network) | 124 | 123 | ~-1 | 400 | Safe |
| `src/client/network/use_game_ws.ts` | Tier 1 (Network) | 323 | 321 | ~-2 | 400 | Warning (Tech Debt: Hook tách bạch trong Phase 4) |
| `src/client/network/ws_message_handler.ts` | Tier 1 (Network) | 189 | 188 | ~-1 | 400 | Safe |
| `src/client/network/apply_delta.ts` | Tier 1 (Network) | 250 | 250 | 0 | 400 | Safe |
| `src/client/network/apply_delta_players.ts` | Tier 1 (Network) | 269 | 269 | 0 | 400 | Safe |
| `src/client/network/apply_delta_cells.ts` | Tier 1 (Network) | 167 | 167 | 0 | 400 | Safe |
| `src/client/network/apply_delta_modals.ts` | Tier 1 (Network) | 179 | 179 | 0 | 400 | Safe |
| `src/client/network/game_ws_dispatcher.ts` | Tier 1 (Network) | 126 | 125 | ~-1 | 400 | Safe |
| `src/client/network/activity_tracker.ts` | Tier 1 (Network) | 294 | 294 | 0 | 400 | Safe |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Network) | 209 | 209 | 0 | 400 | Safe |
| `src/client/network/activity_property_tracker.ts` | Tier 1 (Network) | 322 | 322 | 0 | 400 | Warning (Tech Debt: Tách tracker trong Phase 4) |
| `src/client/network/activity_financial_tracker.ts` | Tier 1 (Network) | 236 | 236 | 0 | 400 | Safe |
| `src/client/network/activity_auction_tracker.ts` | Tier 1 (Network) | 102 | 102 | 0 | 400 | Safe |
| `src/client/network/activity_transit_tracker.ts` | Tier 1 (Network) | 64 | 64 | 0 | 400 | Safe |
| `src/client/network/activity_go_extractor.ts` | Tier 1 (Network) | 189 | 189 | 0 | 400 | Safe |
| `src/client/network/activity_rent_matcher.ts` | Tier 1 (Network) | 270 | 270 | 0 | 400 | Safe |
| `src/client/events/game_event_synthesizer.ts` | Tier 1 (Events) | 28 | 28 | 0 | 400 | Safe |
| `src/client/events/game_event_bus.ts` | Tier 1 (Events) | 109 | 109 | 0 | 400 | Safe |
| `src/client/events/game_event_financial_synthesizer.ts` | Tier 1 (Events) | 275 | 275 | 0 | 400 | Safe |
| `src/client/events/game_event_property_synthesizer.ts` | Tier 1 (Events) | 237 | 237 | 0 | 400 | Safe |
| `src/client/events/game_event_kinematics_synthesizer.ts` | Tier 1 (Events) | 105 | 105 | 0 | 400 | Safe |
| `src/client/events/game_event_financial_helpers.ts` | Tier 1 (Events) | 246 | 245 | ~-1 | 400 | Safe |
| `src/client/events/game_event_bond_helpers.ts` | Tier 1 (Events) | 110 | 110 | 0 | 400 | Safe |
| `src/client/events/game_event_hose_helpers.ts` | Tier 1 (Events) | 88 | 88 | 0 | 400 | Safe |
| `src/client/events/game_event_buyout_helpers.ts` | Tier 1 (Events) | 78 | 78 | 0 | 400 | Safe |
| `src/client/store/game_store_subtypes.ts` | Tier 1 (Store) | 230 | 230 | 0 | 400 | Safe |
| `src/client/store/game_store_state_types.ts` | Tier 1 (Store) | 199 | 199 | 0 | 400 | Safe |
| `src/client/telemetry/telemetry_delta_hook.ts` | Tier 1 (Telemetry) | 143 | 143 | 0 | 400 | Safe |
| `src/client/telemetry/telemetry_expected_delta.ts` | Tier 1 (Telemetry) | 322 | 322 | 0 | 400 | Warning (Tech Debt: Tách validator trong Phase 4) |
| `docs/FEATURE_MAP.md` | Tier 3 (Docs) | 93 | 93 | 0 | 800 | Safe |
| `tests/contracts/imp224_auto_solvency_wire_envelope.test.ts` | Living Test | 428 | 428 | 0 | 600 | Safe |
| `tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts` | Living Test | 0 | 165 | ~+165 | 600 | Safe (New File) |

## 2. Nghiên Cứu Tiền Trạm & Bất Biến (Pre-Flight Research & Invariants)
- **Subsystem Facade Invariant (`src/domain/protocol/index.ts`)**: Hợp đồng đường truyền mạng đặt tại `src/domain/protocol/index.ts` thay vì tạo file phẳng trong `src/domain/`.
- **Chính danh hóa 25 mã lệnh trong `VALID_INTENTS` (Anti-TIDD)**: Đưa `'INTENT_SPIN_TRANSIT_WHEEL'` trực tiếp vào `VALID_INTENTS` (đủ 25 mã lệnh khớp 1:1 với union `PlayerIntent` và `INTENT_DISPATCH`), xóa bỏ nhánh đặc cách `&& type !== 'INTENT_SPIN_TRANSIT_WHEEL'`.
- **Tương thích ngược 100% (`Backward-Compatible Re-exports`)**: `src/server/delta_types.ts`, `src/server/intent_dispatcher.ts`, `src/server/network/network_types.ts` và `src/server/network/admin_types.ts` re-export đầy đủ các kiểu từ `src/domain/protocol/index.ts`.

## 3. Station 1: Đặc Tả Kiểm Thử Hợp Đồng (RED - Contract Specification)
**Target test file**: `tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts`

1. **`TC-392.01`**: `[UC-PROTO-INTENT-CELL-BOUNDS/MSS]` **Given** các object intent kiểm tra biên (kể cả `INTENT_UPGRADE_ETC`), **When** gọi `isValidPlayerIntentFields` từ `src/domain/protocol/index.ts`, **Then** `{ type: 'INVALID_INTENT' }` và `{ type: 123 }` trả về `false`, `{ type: 'INTENT_UPGRADE', cellIndex: 5 }` và `{ type: 'INTENT_UPGRADE_ETC' }` trả về `true`, còn `{ type: 'INTENT_UPGRADE', cellIndex: 40 }` hoặc `{ type: 'INTENT_UPGRADE_ETC', cellIndex: 99 }` trả về `false`.
2. **`TC-392.02`**: `[UC-PROTO-INTENT-BUYOUT-BID/MSS]` **Given** các object intent `INTENT_EXECUTE_COMPULSORY_BUYOUT` và `INTENT_BID`, **When** gọi `isValidPlayerIntentFields`, **Then** trả về `true` khi `{ type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT', cellIndex: 12 }` hoặc `{ type: 'INTENT_BID', amount: 500 }`, và trả về `false` khi `amount: -100` hoặc `cellIndex: -1`.
3. **`TC-392.03`**: `[UC-PROTO-INTENT-INVEST-BOND/MSS]` **Given** các object intent `INTENT_INVEST` và `INTENT_ISSUE_BOND`, **When** gọi `isValidPlayerIntentFields`, **Then** trả về `true` khi `{ type: 'INTENT_INVEST', stake: 1000 }` hoặc `{ type: 'INTENT_ISSUE_BOND', trancheId: BondTrancheId.WORKING_CAPITAL }`, và trả về `false` khi `trancheId: 'INVALID_TRANCHE'` hoặc `stake: -10`.
4. **`TC-392.04`**: `[UC-PROTO-INTENT-TRADE-TRANSIT/MSS]` **Given** các object intent `INTENT_TRADE_OFFER` và `INTENT_SPIN_TRANSIT_WHEEL`, **When** gọi `isValidPlayerIntentFields`, **Then** trả về `true` cho `{ type: 'INTENT_SPIN_TRANSIT_WHEEL' }` và `{ type: 'INTENT_TRADE_OFFER', sellerId: 'p1', buyerId: 'p2', cellIndex: 5, price: 1200, offeredCellIndex: 8 }`, và trả về `false` khi `price: 0`, `price: -500`, `offeredCellIndex: 1.5` hoặc `offeredCellIndex: 40`.
5. **`TC-392.05`**: `[UC-PROTO-ENVELOPE-WIRING/MSS]` **Given** một instance `EnvelopeValidator` từ `src/server/security/envelope_validator.ts`, **When** gọi `EnvelopeValidator.parseAndValidate` với gói tin `INTENT` chứa `INTENT_RESPOND_TRADE_OFFER` (`offerId: 'o1', accept: true`) và `INTENT_TRADE_OFFER` (`sellerId: 'p1', buyerId: 'p2', cellIndex: 5, price: 1000`), **Then** trả về `success: true`, còn khi `accept: 'yes'` hoặc `price: 0` trả về `success: false` và `reasonCode: 'INVALID_ENVELOPE'`.
6. **`TC-392.06`**: `[UC-PROTO-CLIENT-DELTA-WIRING/MSS]` **Given** một `DeltaPayload` kiểu dữ liệu từ `src/domain/protocol/index.ts` (`tick: 1, cells: [], players: [{ id: 'p1', position: 0, balance: 14500 }]`), **When** gọi `applyDeltaToStore` từ `src/client/network/apply_delta.ts`, **Then** trạng thái `useGameStore.getState().players[0]?.balance` được đồng bộ chính xác thành `14500`.
7. **`TC-392.07`**: `[UC-PROTO-SERVER-REEXPORT-COMPAT/MSS]` **Given** các module phía Server (`src/server/security/envelope_validator.ts`, `src/server/delta_types.ts`, `src/server/intent_dispatcher.ts`, `src/server/network/network_types.ts`, `src/server/network/admin_types.ts`), **When** kiểm tra `VALID_INTENTS` và `encodeMsg`, **Then** `VALID_INTENTS.size` bằng `25` (chứa `INTENT_SPIN_TRANSIT_WHEEL`), tham chiếu trùng khớp `===` với `VALID_INTENTS` từ `src/domain/protocol/index.ts`, và `encodeMsg({ type: 'ROOM_STARTED', roomCode: 'R1' })` trả về chuỗi JSON hợp lệ.

## 4. Station 2: Đặc Tả Triển Khai (GREEN - Implementation Specification)

### Task 1: Tạo mới `src/domain/protocol/index.ts` (Shared Wire Protocol Facade)
**Target physical file**: `src/domain/protocol/index.ts` (New file)

```typescript
import type { TurnPhase, EventCardInfo, HoseResultInfo, MarketModifier, PendingBuyoutSession, BondContract, TradeResultInfo, ServerDomainEvent } from '../room.js';
export type { TradeResultInfo, ServerDomainEvent };
import type { PropertyRegistry, PropertyStateMap } from '../property_data.js';
export type { PropertyRegistry, PropertyStateMap };
import type { ChanceCardId } from '../event_card_types.js';
import type { TransitWheelOutcome } from '../transit_wheel.js';
import { BondTrancheId } from '../bond_types.js';
import type { ActionRejectReason } from '../action_reasons.js';

export interface CellDelta { readonly index: number; readonly ownerId?: string | null; readonly level?: number; readonly isETC?: boolean; readonly isUpgradedUtility?: boolean; readonly isMortgaged?: boolean; readonly unbuiltRounds?: number; }
export interface DiplomaticEventDelta { readonly playerId: string; readonly landlordId: string; readonly cellIndex: number; readonly savedRent: number; }
export interface PlayerDelta {
  readonly id: string; readonly position: number; readonly balance: number; readonly bankrupt?: boolean; readonly isBot?: boolean;
  readonly overdraftRoundsLeft?: number; readonly inAudit?: boolean; readonly auditTurnsLeft?: number; readonly auditCount?: number;
  readonly skipNextTurn?: boolean; readonly consecutiveDoubles?: number; readonly extraTurns?: number;
  readonly bondContract?: BondContract | null; readonly hand?: readonly ChanceCardId[];
}
export interface AuctionPayload {
  readonly cellIndex: number; readonly currentBid: number; readonly highestBidderId: string | null; readonly timeRemaining: number;
  readonly declinedPlayerId?: string; readonly hasPassed?: boolean; readonly passedPlayerIds?: readonly string[];
  readonly insolvencyPlayerId?: string; readonly isForeclosure?: boolean; readonly startingBid?: number; readonly isFireSale?: boolean;
  isConcluded?: boolean; winnerId?: string | null; finalPrice?: number;
}
export type AuctionDelta = AuctionPayload;
export interface PendingTradeOfferDelta {
  readonly offerId: string; readonly cellIndex: number; readonly price: number; readonly buyerId: string; readonly sellerId: string;
  readonly expiresAt: number; readonly offeredCellIndex?: number; readonly requesterId?: string; readonly targetPlayerId?: string;
}
export interface DeltaPayload {
  readonly roomCode?: string; readonly tick: number; readonly cells: ReadonlyArray<CellDelta>; readonly players?: ReadonlyArray<PlayerDelta>;
  readonly currentPlayerIndex?: number; readonly currentTurnPlayerId?: string; readonly dice?: readonly [number, number];
  readonly diceRollerId?: string; readonly diceSeq?: number; readonly auction?: AuctionPayload | null;
  readonly pendingTradeOffer?: PendingTradeOfferDelta | null; readonly pendingBuyout?: PendingBuyoutSession | null;
  readonly roomStarted?: boolean; readonly turnPhase?: TurnPhase; readonly timeRemaining?: number;
  readonly lastEventCard?: EventCardInfo | null; readonly lastHoseResult?: HoseResultInfo | null;
  readonly roundNumber?: number; readonly treasury?: number; readonly activeModifiers?: ReadonlyArray<MarketModifier>;
  readonly lastDiplomaticEvent?: DiplomaticEventDelta | null; readonly passedGoSalary?: number;
  readonly pendingTransitWheel?: { playerId: string; cellIndex: number; timestamp: number } | null;
  readonly lastTransitResult?: { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number } | null;
  readonly lastTradeResult?: TradeResultInfo | null; readonly domainEvents?: ReadonlyArray<ServerDomainEvent>;
}
export interface DeltaPayloadOptions {
  tick: number; cells: ReadonlyArray<CellDelta>; players?: ReadonlyArray<PlayerDelta>; currentPlayerIndex?: number;
  currentTurnPlayerId?: string; dice?: readonly [number, number]; diceRollerId?: string; diceSeq?: number;
  auction?: AuctionPayload | null; pendingTradeOffer?: PendingTradeOfferDelta | null; pendingBuyout?: PendingBuyoutSession | null;
  roomStarted?: boolean; turnPhase?: TurnPhase; timeRemaining?: number; lastEventCard?: EventCardInfo | null;
  lastHoseResult?: HoseResultInfo | null; roundNumber?: number; treasury?: number; activeModifiers?: ReadonlyArray<MarketModifier>;
  lastDiplomaticEvent?: DiplomaticEventDelta | null; passedGoSalary?: number;
  pendingTransitWheel?: { playerId: string; cellIndex: number; timestamp: number } | null;
  lastTransitResult?: { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number } | null;
  lastTradeResult?: TradeResultInfo | null; domainEvents?: ReadonlyArray<ServerDomainEvent>;
}

export type PlayerIntent =
  | { type: 'INTENT_BUY' } | { type: 'INTENT_BUY_PROPERTY' } | { type: 'INTENT_DECLINE' }
  | { type: 'INTENT_BID'; amount: number; isBait?: boolean } | { type: 'INTENT_AUCTION_PASS' }
  | { type: 'INTENT_UPGRADE'; cellIndex: number } | { type: 'INTENT_UPGRADE_ETC'; cellIndex?: number }
  | { type: 'INTENT_UPGRADE_UTILITY'; cellIndex: number }
  | { type: 'INTENT_DOWNGRADE'; cellIndex: number; stepByStep?: boolean; enforceEvenDowngrading?: boolean }
  | { type: 'INTENT_MORTGAGE'; cellIndex: number } | { type: 'INTENT_REDEEM'; cellIndex: number }
  | { type: 'INTENT_TRADE_OFFER'; sellerId: string; buyerId: string; cellIndex: number; price: number; offeredCellIndex?: number }
  | { type: 'INTENT_RESPOND_TRADE_OFFER'; offerId: string; accept: boolean }
  | { type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT'; cellIndex: number } | { type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' }
  | { type: 'INTENT_END_TURN' } | { type: 'INTENT_INVEST'; stake: number } | { type: 'INTENT_SKIP' }
  | { type: 'INTENT_BAIL_OUT' } | { type: 'INTENT_BANKRUPTCY'; creditorId?: string }
  | { type: 'INTENT_ISSUE_BOND'; trancheId?: BondTrancheId } | { type: 'INTENT_REPAY_BOND' }
  | { type: 'INTENT_AUTO_SOLVENCY' } | { type: 'INTENT_SPIN_TRANSIT_WHEEL' } | { type: 'INTENT_ROLL' };

export const CELL_INTENTS = new Set(['INTENT_UPGRADE', 'INTENT_UPGRADE_UTILITY', 'INTENT_DOWNGRADE', 'INTENT_MORTGAGE', 'INTENT_REDEEM']);
const VALID_BOND_TRANCHES = new Set<string>(Object.values(BondTrancheId));
export const VALID_INTENTS = new Set([
  ...CELL_INTENTS, 'INTENT_ROLL', 'INTENT_BUY', 'INTENT_BUY_PROPERTY', 'INTENT_DECLINE', 'INTENT_BID',
  'INTENT_AUCTION_PASS', 'INTENT_UPGRADE_ETC', 'INTENT_TRADE_OFFER', 'INTENT_RESPOND_TRADE_OFFER', 'INTENT_END_TURN',
  'INTENT_INVEST', 'INTENT_SKIP', 'INTENT_BAIL_OUT', 'INTENT_BANKRUPTCY', 'INTENT_EXECUTE_COMPULSORY_BUYOUT',
  'INTENT_DECLINE_COMPULSORY_BUYOUT', 'INTENT_AUTO_SOLVENCY', 'INTENT_ISSUE_BOND', 'INTENT_REPAY_BOND',
  'INTENT_SPIN_TRANSIT_WHEEL',
]);

function isValidBoardCellIndex(val: unknown): val is number { return typeof val === 'number' && Number.isInteger(val) && val >= 0 && val < 40; }
function isNonNegativeInt(val: unknown): val is number { return typeof val === 'number' && Number.isInteger(val) && val >= 0; }
function isPositiveInt(val: unknown): val is number { return typeof val === 'number' && Number.isInteger(val) && val > 0; }

export function isValidPlayerIntentFields(it: Record<string, unknown>): it is PlayerIntent {
  const type = it['type'];
  if (typeof type !== 'string' || !VALID_INTENTS.has(type)) return false;
  if (CELL_INTENTS.has(type) || type === 'INTENT_EXECUTE_COMPULSORY_BUYOUT') return isValidBoardCellIndex(it['cellIndex']);
  if (type === 'INTENT_UPGRADE_ETC') return it['cellIndex'] === undefined || isValidBoardCellIndex(it['cellIndex']);
  if (type === 'INTENT_BID') return isNonNegativeInt(it['amount']);
  if (type === 'INTENT_INVEST') return isNonNegativeInt(it['stake']);
  if (type === 'INTENT_ISSUE_BOND' && it['trancheId'] !== undefined) return typeof it['trancheId'] === 'string' && VALID_BOND_TRANCHES.has(it['trancheId']);
  if (type === 'INTENT_TRADE_OFFER') {
    const validOffered = it['offeredCellIndex'] === undefined || isValidBoardCellIndex(it['offeredCellIndex']);
    return typeof it['sellerId'] === 'string' && Boolean(it['sellerId']) && typeof it['buyerId'] === 'string' && Boolean(it['buyerId']) && isValidBoardCellIndex(it['cellIndex']) && isPositiveInt(it['price']) && validOffered;
  }
  if (type === 'INTENT_RESPOND_TRADE_OFFER') return typeof it['offerId'] === 'string' && Boolean(it['offerId']) && typeof it['accept'] === 'boolean';
  return true;
}

export type RoomHealthStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';
export interface AdminPlayerSummary { readonly id: string; readonly balance: number; readonly position: number; readonly isBot: boolean; readonly bankrupt: boolean; readonly propertyCount: number; readonly netWorth: number; readonly isConnected?: boolean; readonly inGracePeriod?: boolean; readonly graceSecondsLeft?: number; }
export interface AdminRoomSummary { readonly roomCode: string; readonly hostId: string; readonly started: boolean; readonly phase: string; readonly round: number; readonly playerCount: number; readonly players: readonly AdminPlayerSummary[]; readonly treasuryPool: number; readonly status: RoomHealthStatus; readonly warningReason?: string; readonly lastActivity: number; readonly activeTimersCount: number; readonly hasAuction: boolean; readonly currentTurnPlayerId?: string; readonly currentTurnStepName?: string; readonly turnSecondsLeft?: number; }
export interface CloudStorageVitals { readonly configured: boolean; readonly provider: 'supabase'; readonly bucket: string; readonly keyType: 'JWT' | 'OPAQUE' | 'NONE'; readonly uploadedCount?: number; }
export interface ServerVitals { readonly memoryRssMb: number; readonly memoryHeapUsedMb: number; readonly uptimeSeconds: number; readonly totalRooms: number; readonly liveRooms: number; readonly lobbyRooms: number; readonly storageStatus?: CloudStorageVitals; }
export interface AdminRoomDetail extends AdminRoomSummary { readonly propertyStates: Record<number, { ownerId?: string; level: number; isMortgaged: boolean }>; readonly chanceDiscardCount: number; readonly marketDiscardCount: number; }
export interface AdminRoomLogEntry { readonly id: string; readonly roomCode: string; readonly timestamp: number; readonly source: 'SERVER' | 'PLAYER' | 'BOT' | 'SYSTEM'; readonly action: string; readonly payloadSummary: string; readonly playerId?: string; }
export type ArchivedRoomStatus = 'ACTIVE' | 'FINISHED' | 'TERMINATED';
export interface AdminArchivedRoomSummary { readonly roomCode: string; readonly startTime: number; readonly endTime?: number; readonly playerCount: number; readonly winner?: string; readonly logFilePath: string; readonly status: ArchivedRoomStatus; readonly totalEvents: number; readonly fileSizeBytes?: number; }

export type ReasonCode =
  | 'ROOM_CODE_COLLISION' | 'ROOM_FULL' | 'ROOM_NOT_FOUND' | 'ROOM_STARTED' | 'NOT_HOST' | 'NOT_ENOUGH_PLAYERS' | 'SLOT_CONFLICT'
  | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'INTENT_REJECTED' | 'INVALID_INTENT' | 'INVALID_ROOM' | 'NOT_YOUR_TURN' | 'WARN_DELTA_OVERSIZED'
  | 'OUT_OF_TURN' | 'RATE_LIMIT_EXCEEDED' | 'ABUSE_DETECTED' | 'INVALID_ENVELOPE' | 'INVALID_VALUE' | 'PRICE_BELOW_FLOOR'
  | 'EVEN_BUILDING_VIOLATION' | 'ADMIN_UNAUTHORIZED' | 'ADMIN_ROOM_NOT_FOUND' | 'TradeFrozen' | 'FREEZE_ACTIVE' | 'LIQUIDITY_FROZEN'
  | 'BOND_COLLATERAL_LOCKED' | 'BOND_NOT_ELIGIBLE' | 'ACTION_REJECTED' | ActionRejectReason;
export type WsErrorMessageReason = ReasonCode;

export type WsClientMessage =
  | { readonly type: 'CREATE_ROOM'; readonly playerId: string; readonly roomCode?: string }
  | { readonly type: 'JOIN_ROOM'; readonly playerId: string; readonly roomCode: string }
  | { readonly type: 'ADMIN_AUTH'; readonly secret: string } | { readonly type: 'ADMIN_GET_ROOMS' }
  | { readonly type: 'ADMIN_GET_ARCHIVED_ROOMS' | 'ADMIN_GET_ARCHIVED_ROOMLIST' }
  | { readonly type: 'ADMIN_GET_ARCHIVED_LOGS'; readonly roomCode: string; readonly timestamp?: number }
  | { readonly type: 'ADMIN_SUBSCRIBE_ROOM'; readonly roomCode: string } | { readonly type: 'ADMIN_UNSUBSCRIBE_ROOM'; readonly roomCode?: string }
  | { readonly type: 'ADMIN_TERMINATE_ROOM'; readonly roomCode: string; readonly reason?: string } | { readonly type: 'ADMIN_SYNC_CLOUD_STORAGE' }
  | { readonly type: 'START_GAME'; readonly playerId: string; readonly roomCode: string; readonly bots?: ReadonlyArray<{ readonly id: string; readonly name?: string; readonly personality?: string }> }
  | { readonly type: 'PONG'; readonly playerId: string; readonly roomCode: string } | { readonly type: 'RECONNECT'; readonly reconnectToken: string; readonly roomCode?: string }
  | { readonly type: 'INTENT'; readonly roomCode: string; readonly playerId: string; readonly intent: PlayerIntent }
  | { readonly type: 'INTENT_REQUEST_RESYNC'; readonly roomCode: string; readonly playerId: string }
  | { readonly type: 'EMOTE'; readonly roomCode: string; readonly playerId: string; readonly emoteId: string }
  | { readonly type: 'LEAVE_ROOM'; readonly playerId: string; readonly roomCode: string };

export type WsServerMessage =
  | { readonly type: 'ROOM_CREATED'; readonly roomCode: string; readonly playerId: string }
  | { readonly type: 'ROOM_JOINED'; readonly roomCode: string; readonly playerId: string; readonly playerCount: number }
  | { readonly type: 'ROOM_STARTED'; readonly roomCode: string } | { readonly type: 'ERROR'; readonly reasonCode: ReasonCode }
  | { readonly type: 'INTENT_REJECTED'; readonly reasonCode: ReasonCode; readonly playerId?: string } | { readonly type: 'PING'; readonly roomCode: string }
  | { readonly type: 'SESSION_INIT'; readonly playerId: string; readonly reconnectToken: string; readonly roomCode: string }
  | { readonly type: 'STATE_DELTA'; readonly delta: DeltaPayload } | { readonly type: 'DELTA'; readonly delta: DeltaPayload }
  | { readonly type: 'PLAYER_GRACE'; readonly playerId: string; readonly secondsLeft: number }
  | { readonly type: 'PLAYER_BOT_TAKEOVER'; readonly playerId: string } | { readonly type: 'PLAYER_RECONNECTED'; readonly playerId: string }
  | { readonly type: 'PLAYER_EMOTE'; readonly playerId: string; readonly emoteId: string; readonly timestamp: number }
  | { readonly type: 'LOBBY_UPDATE'; readonly roomCode: string; readonly players: ReadonlyArray<{ readonly id: string; readonly isHost: boolean; readonly slotIndex: number; readonly name?: string }> }
  | { readonly type: 'GAME_OVER'; readonly roomCode: string; readonly leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }> }
  | { readonly type: 'ADMIN_AUTH_SUCCESS'; readonly message: string } | { readonly type: 'ADMIN_AUTH_FAILED'; readonly reason: string }
  | { readonly type: 'ADMIN_ROOM_LIST'; readonly rooms: readonly AdminRoomSummary[]; readonly vitals?: ServerVitals }
  | { readonly type: 'ADMIN_ARCHIVED_ROOM_LIST'; readonly rooms: readonly AdminArchivedRoomSummary[] }
  | { readonly type: 'ADMIN_ARCHIVED_LOG_DATA'; readonly roomCode: string; readonly logs: readonly AdminRoomLogEntry[]; readonly rawJsonl?: string }
  | { readonly type: 'ADMIN_ROOM_DETAIL'; readonly roomCode: string; readonly detail: AdminRoomDetail; readonly recentLogs: readonly AdminRoomLogEntry[] }
  | { readonly type: 'ADMIN_ROOM_LOG'; readonly roomCode: string; readonly log: AdminRoomLogEntry }
  | { readonly type: 'ADMIN_ACTION_SUCCESS'; readonly action: string; readonly roomCode: string }
  | { readonly type: 'ADMIN_ERROR'; readonly reasonCode: string; readonly message: string }
  | { readonly type: 'ADMIN_SYNC_CLOUD_RESULT'; readonly success: boolean; readonly uploadedCount: number; readonly bucket: string; readonly message?: string; readonly error?: string; readonly reason?: string };
```

### Task 2: Chuyển hướng Server Re-exports, xóa Dirty Cast tại `envelope_validator.ts` và tách 100% Client Network/Events/Store/Telemetry khỏi `src/server/**` (Call-Site Wiring)
**Target physical file**: `src/server/security/envelope_validator.ts`
**Target physical file**: `src/server/delta_types.ts`
- **Call-Site Wiring**:
  1. `src/server/security/envelope_validator.ts`: Import `VALID_INTENTS, isValidPlayerIntentFields` từ `'../../domain/protocol/index.js'`, re-export `VALID_INTENTS`. Trong `validateIntentEnvelope`, kiểm tra `if (typeof it['type'] !== 'string' || !VALID_INTENTS.has(it['type'])) return { success: false, reasonCode: 'INVALID_INTENT' };`, gọi `if (!isValidPlayerIntentFields(it)) return { success: false, reasonCode: 'INVALID_ENVELOPE' };` và trả về `intent: it` (xóa hoàn toàn ép kiểu `raw as import('../intent_dispatcher.js').PlayerIntent`).
  2. `src/server/delta_types.ts`: Thay thế các khai báo interface trùng lặp bằng `export type { TradeResultInfo, ServerDomainEvent, PropertyRegistry, PropertyStateMap, CellDelta, DiplomaticEventDelta, PlayerDelta, AuctionPayload, AuctionDelta, PendingTradeOfferDelta, DeltaPayload, DeltaPayloadOptions } from '../domain/protocol/index.js';`.
  3. `src/server/intent_dispatcher.ts`: Thay thế union `PlayerIntent` cục bộ bằng `import type { PlayerIntent } from '../domain/protocol/index.js'; export type { PlayerIntent };`.
  4. `src/server/network/network_types.ts`: Re-export `ReasonCode`, `WsErrorMessageReason`, `WsClientMessage`, `WsServerMessage` từ `'../../domain/protocol/index.js'` và giữ nguyên hàm `encodeMsg`.
  5. `src/server/network/admin_types.ts`: Re-export `RoomHealthStatus`, `AdminPlayerSummary`, `AdminRoomSummary`, `CloudStorageVitals`, `ServerVitals`, `AdminRoomDetail`, `AdminRoomLogEntry`, `ArchivedRoomStatus`, `AdminArchivedRoomSummary` từ `'../../domain/protocol/index.js'` và giữ nguyên `MAX_ROOM_LOGS` cùng `AdminManagerOptions`.
  6. **30 tệp Client Network / Events / Store / Telemetry** & **`tests/contracts/imp224_auto_solvency_wire_envelope.test.ts`**: Chuyển toàn bộ import kiểu đường truyền sang `'../../domain/protocol/index.js'` tại 30 tệp Client đã liệt kê ở Mục 1; đồng thời cập nhật `EXPECTED_24_INTENTS` trong `tests/contracts/imp224_auto_solvency_wire_envelope.test.ts` bổ sung `'INTENT_SPIN_TRANSIT_WHEEL'` (size `25`).

### Task 3: Cập nhật `docs/FEATURE_MAP.md` (Knowledge Fold)
**Target physical file**: `docs/FEATURE_MAP.md`
- **Call-Site Wiring**: Cập nhật dòng Pillar **11 (FSM Lifecycle & WebSocket Sync)** tại `docs/FEATURE_MAP.md` (dòng 58) ghi nhận `src/domain/protocol/index.ts` là SSOT Facade của giao thức đường truyền (`DeltaPayload`, `PlayerIntent`, `VALID_INTENTS`, `WsClientMessage`, `WsServerMessage`, `isValidPlayerIntentFields`), giữ nguyên tổng số dòng của bảng.

## 5. Definition of Done (DoD) & Ranh Giới Dừng (Stopping Boundary)
1. **Zero Dirty Casts in `envelope_validator.ts`**: Đã loại bỏ hoàn toàn `raw as import('../intent_dispatcher.js').PlayerIntent`.
2. **Zero Client-Network/Events/Store/Telemetry -> Server Imports**: Chạy `npm run lint:boundaries` xác nhận 0 tệp nào trong `src/client/network/**`, `src/client/events/**`, `src/client/store/**`, `src/client/telemetry/**` còn xuất hiện trong danh sách vi phạm ranh giới hoặc import từ `src/server/**`.
3. **Mechanical Gates**: Pass 100% `npm run prefilter` và `node scripts/check_scope.mjs`.
4. **Chaos Sentinel**: Pass `npm run sentinel -- --ticket IMP-392 --test tests/domain/imp392_shared_wire_protocol_and_network_boundary.test.ts --src src/domain/protocol/index.ts` (0 survived mutants).
5. **Stopping Boundary**: Dừng lại sau khi hoàn tất Slice 1B (`IMP-392`) và báo cáo nghiệm thu trước khi chuyển sang Slice 1C (`IMP-393`).
