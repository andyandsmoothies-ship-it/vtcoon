// [UI-S01/MSS][UI-S03/MSS][UI-S04/MSS] Game Store Types, Interfaces & Payloads
import type { EventCardInfo, MarketModifier } from '../../domain/room';

export interface PawnAnimationState {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell?: number;
  readonly waypoints: readonly number[];
  readonly currentIndex?: number;
  readonly isAnimating: boolean;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface PawnMoveTask {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell: number;
  readonly waypoints: readonly number[];
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface PlayerHudInfo {
  readonly id: string;
  readonly name: string;
  readonly balance: number;
  readonly tokenColor: string;
  readonly ownedProperties: readonly number[];
  readonly mortgagedProperties?: readonly number[];
  readonly mortgageLoans?: Record<number, number>;
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
  readonly skipNextTurn?: boolean;
  readonly consecutiveDoubles?: number;
  readonly bankrupt?: boolean;
  readonly isBot?: boolean;
  readonly overdraftRoundsLeft?: number;
  readonly pawnSlot?: number;
  readonly ownerSlot?: number;
  readonly mascotIcon?: string;
  readonly mascotName?: string;
}

export interface ActiveEmote {
  readonly playerId: string;
  readonly emoteId: string;
  readonly timestamp: number;
}

export enum FloatingTextType {
  Reward = 'reward',
  Penalty = 'penalty',
}

export type FloatingActionType =
  | 'buy'
  | 'upgrade'
  | 'rent_pay'
  | 'rent_receive'
  | 'tax'
  | 'bail'
  | 'salary'
  | 'monopoly'
  | 'debt_relief'
  | 'stimulus'
  | 'chance'
  | 'market'
  | 'auction_win'
  | 'hose'
  | 'teleport'
  | 'audit_jail'
  | 'general';

export interface FloatingTextItem {
  readonly id: string;
  readonly text: string;
  readonly type: FloatingTextType;
  readonly playerId: string;
  readonly timestamp: number;
  readonly actionType?: FloatingActionType;
  readonly title?: string;
  readonly cellIndex?: number;
  readonly targetPlayerName?: string;
}

export type ActiveModalType = 'deed' | 'portfolio' | 'auction' | 'trade' | 'event' | 'hose' | 'insolvency' | 'game_over' | 'rules' | null;

export interface ModalPayloadMap {
  deed: { cellIndex: number; canBuy?: boolean; ownedProperties?: readonly number[] };
  portfolio: {
    playerId?: string;
  };
  auction: {
    cellIndex: number;
    currentBid: number;
    highestBidderId: string | null;
    timeRemaining: number;
    hasPassed?: boolean;
    declinedPlayerId?: string;
    isConcluded?: boolean;
    winnerId?: string | null;
    finalPrice?: number;
  };
  trade: {
    targetPlayerId: string;
    offeredProperties: number[];
    requestedProperties: number[];
    cashOffer: number;
    cashRequest: number;
  };
  event: {
    cardType: 'chance' | 'market';
    cardId: string;
    title: string;
    description: string;
    effectDelta?: number;
    targetScope?: string;
    effectDetail?: string;
    duration?: string;
    destination?: string;
  };
  hose: {
    minStake?: number;
    maxStake?: number;
    currentStake?: number;
    lastDiceRoll?: number;
    lastPayout?: number;
    lastMultiplier?: number;
    lastProfit?: number;
    isReviewingResult?: boolean;
  };
  insolvency: {
    playerId: string;
    deficit: number;
  };
  game_over: {
    leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>;
  };
  rules: {
    initialTab?: 'core' | 'cards' | 'mechanics';
  };
}

export interface PendingPawnMove {
  readonly playerId: string;
  readonly targetCell: number;
  readonly fromCell: number;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface LastLandedPawn {
  readonly playerId: string;
  readonly cellIndex: number;
  readonly timestamp: number;
}

export type ClientMarketModifier = MarketModifier | {
  readonly type: MarketModifier['type'] | string;
  readonly remainingRounds: number;
  readonly affectedCells?: readonly number[];
  readonly multiplier?: number;
  readonly beneficiaryId?: string;
};

export interface GameState {
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
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
  readonly turnPhase?: string;
  readonly treasuryPool: number;
  readonly roundNumber: number;
  readonly maxRounds: number;
  readonly activeModifiers: ReadonlyArray<ClientMarketModifier>;
  readonly isHeatmapActive: boolean;

  // UI-04 Business Modals State
  readonly activeModal: ActiveModalType;
  readonly modalPayload: ModalPayloadMap[keyof ModalPayloadMap] | null;
  readonly lastEventCard: EventCardInfo | null;
  readonly auction?: {
    readonly cellIndex: number;
    readonly highestBid?: number;
    readonly currentBid?: number;
    readonly highestBidder?: string;
    readonly highestBidderId?: string | null;
  } | null;

  // UI-05 Social Emotes & Micro-VFX
  readonly activeEmotes: Record<string, ActiveEmote>;
  readonly floatingTexts: readonly FloatingTextItem[];

  setLastEventCard: (card: EventCardInfo | null) => void;
  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
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
  setTurnPhase: (turnPhase?: string) => void;
  setTreasuryPool: (amount: number) => void;
  setRoundInfo: (round: number, maxRounds?: number) => void;
  setRoundNumber: (round: number) => void;
  setActiveModifiers: (modifiers: ReadonlyArray<ClientMarketModifier>) => void;
  toggleHeatmap: () => void;
  setHeatmapActive: (active: boolean) => void;

  // UI-04 Business Modals Actions
  openModal: <T extends keyof ModalPayloadMap>(type: T, payload: ModalPayloadMap[T]) => void;
  closeModal: () => void;
  updateModalPayload: <T extends keyof ModalPayloadMap>(patch: Partial<ModalPayloadMap[T]>) => void;

  // UI-05 Social Emotes & Micro-VFX Actions
  triggerEmote: (playerId: string, emoteId: string) => void;
  clearEmote: (playerId: string) => void;
  addFloatingText: (item: Omit<FloatingTextItem, 'id' | 'timestamp'> & { id?: string }) => void;
  removeFloatingText: (id: string) => void;
  clearExpiredFloatingTexts: (now?: number) => void;
}
