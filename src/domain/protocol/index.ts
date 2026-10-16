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
  readonly bondContract?: BondContract | null; readonly hand?: readonly ChanceCardId[]; readonly mortgageLoans?: Readonly<Record<number, number>>;
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

export function encodeMsg(msg: WsServerMessage): string {
  return JSON.stringify(msg);
}
