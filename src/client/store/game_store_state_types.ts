// [IMP-298] Game Store State & Action Type Definitions (Station 1 Stub)
import { TurnPhase, type EventCardInfo, type PendingBuyoutSession } from '../../domain/room.js';
import type { PendingTradeOfferDelta, DiplomaticEventDelta } from '../../server/session_manager.js';
import type {
  PawnAnimationState,
  PawnMoveTask,
  PlayerHudInfo,
  ActiveEmote,
  FloatingTextItem,
  ActiveModalType,
  ModalPayloadMap,
  PendingPawnMove,
  LastLandedPawn,
  ClientMarketModifier,
} from './game_store_subtypes.js';

export interface GameState {
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly propertyStates: Record<number, { level: 0 | 1 | 2 | 3; isETC?: boolean; isUpgradedUtility?: boolean }>;
  readonly playerPositions: Record<string, number>;
  readonly visualPositions: Record<string, number>;
  readonly dice: [number, number];
  readonly isRolling: boolean;
  readonly hasRolledThisTurn: boolean;
  readonly lastDiceSeq?: number;
  readonly activePawnAnimation: PawnAnimationState | null;
  readonly pawnAnimationQueue: readonly PawnMoveTask[];
  readonly pendingPawnMove: PendingPawnMove | null;
  readonly lastLandedPawn: LastLandedPawn | null;

  // UI-03 HUD Financial & Turn States
  readonly playersInfo: Record<string, PlayerHudInfo>;
  readonly currentTurnPlayerId: string | null;

  readonly turnTimeRemaining: number;
  readonly turnPhase?: TurnPhase;
  readonly treasuryPool: number;
  readonly roundNumber: number;
  readonly maxRounds: number;
  readonly activeModifiers: ReadonlyArray<ClientMarketModifier>;
  readonly isHeatmapActive: boolean;
  readonly isOfflineMode?: boolean;
  readonly spotlightedCellIndices?: readonly number[] | null;

  // UI-04 Business Modals State
  readonly activeModal: ActiveModalType;
  readonly modalPayload: ModalPayloadMap[keyof ModalPayloadMap] | null;
  readonly lastEventCard: EventCardInfo | null;
  readonly pendingBuyout?: PendingBuyoutSession | null;
  readonly pendingTradeOffer: PendingTradeOfferDelta | null;
  readonly auction?: ModalPayloadMap['auction'] | null;
  readonly dismissedAuctionCellIndex: number | null;
  setAuction: (auction: ModalPayloadMap['auction'] | null) => void;
  setDismissedAuctionCellIndex: (cellIndex: number | null) => void;
  dismissAuction: (cellIndex: number) => void;
  restoreAuction: () => void;

  // UI-05 Social Emotes & Micro-VFX
  readonly activeEmotes: Record<string, ActiveEmote>;
  readonly floatingTexts: readonly FloatingTextItem[];
  readonly lastDiplomaticEvent?: DiplomaticEventDelta | null;

  // IMP-133 Camera Sticky Focus & IMP-190 Custom Orbit Camera
  readonly cameraFocusCell: number | null;
  setCameraFocusCell: (cellIndex: number | null) => void;
  readonly hasUserCustomCamera: boolean;
  setHasUserCustomCamera: (hasUserCustomCamera: boolean) => void;
  resetGameState: () => void;

  setLastEventCard: (card: EventCardInfo | null) => void;
  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
  setPropertyStates: (map: Record<number, { level: 0 | 1 | 2 | 3; isETC?: boolean; isUpgradedUtility?: boolean }>) => void;
  setPlayerPositions: (positions: Record<string, number>) => void;
  setVisualPositions: (positions: Record<string, number>) => void;
  setDice: (dice: [number, number]) => void;
  setIsRolling: (isRolling: boolean) => void;
  setHasRolledThisTurn: (hasRolled: boolean) => void;
  setLastDiceSeq: (seq: number | undefined) => void;
  triggerDiceRoll: (dice: [number, number], diceSeq?: number) => void;
  setPendingPawnMove: (move: PendingPawnMove | null) => void;
  enqueuePawnMove: (task: PawnMoveTask) => void;
  processPawnQueue: () => void;
  startPawnMove: (playerId: string, targetCell: number, fromCell?: number, isBot?: boolean, isJailFlight?: boolean) => void;
  completePawnMove: (playerId: string) => void;
  clearActivePawnAnimation: () => void;

  // UI-03 HUD Actions
  setPlayersInfo: (players: Record<string, PlayerHudInfo>) => void;
  updatePlayerInfo: (playerId: string, partial: Partial<PlayerHudInfo>) => void;
  setCurrentTurnPlayerId: (playerId: string | null) => void;
  setTurnTimeRemaining: (seconds: number) => void;
  decrementTurnTimer: () => void;
  setTurnPhase: (turnPhase?: TurnPhase) => void;
  setTreasuryPool: (amount: number) => void;
  setRoundInfo: (round: number, maxRounds?: number) => void;
  setRoundNumber: (round: number) => void;
  setActiveModifiers: (modifiers: ReadonlyArray<ClientMarketModifier>) => void;
  toggleHeatmap: () => void;
  setHeatmapActive: (active: boolean) => void;
  setSpotlightedCells: (cells: readonly number[] | null) => void;
  readonly isPlayerHudVisible: boolean;
  togglePlayerHudVisibility: () => void;

  // UI-04 Business Modals Actions
  openModal: <T extends keyof ModalPayloadMap>(type: T, payload: ModalPayloadMap[T]) => void;
  closeModal: () => void;
  updateModalPayload: <T extends keyof ModalPayloadMap>(patch: Partial<ModalPayloadMap[T]>) => void;
  setPendingBuyout: (pendingBuyout: PendingBuyoutSession | null) => void;
  setPendingTradeOffer: (offer: PendingTradeOfferDelta | null) => void;

  // UI-05 Social Emotes & Micro-VFX Actions
  triggerEmote: (playerId: string, emoteId: string) => void;
  clearEmote: (playerId: string) => void;
  addFloatingText: (item: Omit<FloatingTextItem, 'id' | 'timestamp'> & { id?: string }) => void;
  removeFloatingText: (id: string) => void;
  clearExpiredFloatingTexts: (now?: number) => void;
}

export type InitialGameState = Pick<
  GameState,
  | 'levelMap'
  | 'propertyStates'
  | 'playerPositions'
  | 'visualPositions'
  | 'dice'
  | 'isRolling'
  | 'hasRolledThisTurn'
  | 'lastDiceSeq'
  | 'activePawnAnimation'
  | 'pawnAnimationQueue'
  | 'pendingPawnMove'
  | 'lastLandedPawn'
  | 'playersInfo'
  | 'currentTurnPlayerId'
  | 'turnTimeRemaining'
  | 'turnPhase'
  | 'treasuryPool'
  | 'roundNumber'
  | 'maxRounds'
  | 'activeModifiers'
  | 'isHeatmapActive'
  | 'spotlightedCellIndices'
  | 'activeModal'
  | 'modalPayload'
  | 'lastEventCard'
  | 'pendingBuyout'
  | 'pendingTradeOffer'
  | 'auction'
  | 'dismissedAuctionCellIndex'
  | 'activeEmotes'
  | 'floatingTexts'
  | 'lastDiplomaticEvent'
  | 'cameraFocusCell'
  | 'hasUserCustomCamera'
  | 'isPlayerHudVisible'
>;

export const INITIAL_GAME_STATE: InitialGameState = {
  levelMap: {},
  propertyStates: {},
  playerPositions: {},
  visualPositions: {},
  dice: [1, 1],
  isRolling: false,
  hasRolledThisTurn: false,
  lastDiceSeq: undefined,
  activePawnAnimation: null,
  pawnAnimationQueue: [],
  pendingPawnMove: null,
  lastLandedPawn: null,
  playersInfo: {},
  currentTurnPlayerId: null,
  turnTimeRemaining: 60,
  turnPhase: TurnPhase.WaitingRoll,
  treasuryPool: 0,
  roundNumber: 1,
  maxRounds: 40,
  activeModifiers: [],
  isHeatmapActive: false,
  spotlightedCellIndices: null,
  isPlayerHudVisible: true,
  activeModal: null,
  modalPayload: null,
  lastEventCard: null,
  pendingBuyout: null,
  pendingTradeOffer: null,
  auction: null,
  dismissedAuctionCellIndex: null,
  activeEmotes: {},
  floatingTexts: [],
  lastDiplomaticEvent: null,
  cameraFocusCell: null,
  hasUserCustomCamera: false,
};
